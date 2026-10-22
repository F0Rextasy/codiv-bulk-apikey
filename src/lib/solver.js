'use strict';

/**
 * Turnstile solver — mounts codiv.ai's own widget on the page and hands back
 * `turnstile.getResponse()`.
 *
 * codiv.ai's sign-up is gated by Cloudflare Turnstile (sitekey
 * `0x4AAAAAAE7hE0DIArlj6rXX`, sent to the API as the `x-captcha-response`
 * header). A token is only valid when the widget is rendered on a page whose
 * origin is in the sitekey's domain list, so the solve navigates to the site's
 * own page and mounts the widget there — no re-hosting.
 *
 * The browser is the operator's own Chrome, driven over the DevTools Protocol:
 *
 *   chrome.exe --remote-debugging-port=9222
 *
 * Chrome moderates the widget per exit IP, so a datacenter line can answer
 * `fail code 400020`; a residential exit is what the lane was measured on.
 */

const { CDP } = require('./cdp');

const API_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const DEFAULT_SITEKEY = '0x4AAAAAAE7hE0DIArlj6rXX';
const DEFAULT_CDP = 'http://127.0.0.1:9222';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Accepts an http debug endpoint (`http://127.0.0.1:9222`) or a ws:// URL. */
async function browserWs(cdpUrl) {
  const endpoint = String(cdpUrl || DEFAULT_CDP).replace(/\/$/, '');
  if (/^wss?:\/\//i.test(endpoint)) return endpoint;
  const res = await fetch(`${endpoint}/json/version`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`CDP endpoint ${endpoint} answered ${res.status}`);
  const info = await res.json();
  if (!info.webSocketDebuggerUrl) throw new Error(`CDP endpoint ${endpoint} has no webSocketDebuggerUrl`);
  return info.webSocketDebuggerUrl;
}

async function evalIn(cdp, sessionId, expression) {
  const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true }, sessionId);
  if (r.exceptionDetails) throw new Error(`eval: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
  return r.result && r.result.value;
}

/** Real pointer move + press + release: bare pressed/released is scored worse. */
async function clickIn(cdp, sessionId, x, y) {
  const base = { x, y, button: 'left', clickCount: 1, pointerType: 'mouse' };
  await cdp.send('Input.dispatchMouseEvent', { ...base, type: 'mouseMoved', buttons: 0 }, sessionId);
  await sleep(60);
  await cdp.send('Input.dispatchMouseEvent', { ...base, type: 'mousePressed', buttons: 1 }, sessionId);
  await sleep(80);
  await cdp.send('Input.dispatchMouseEvent', { ...base, type: 'mouseReleased', buttons: 0 }, sessionId);
}

/** One page that carries the mounted widget; closed by the caller.
 *  `proxy` pins the *page's* exit — Cloudflare moderates the widget per exit IP,
 *  and a datacenter line answers `fail` (measured); a residential exit is what
 *  the lane was measured on. */
async function mountPage(cdp, url, proxy = null) {
  const ctx = await cdp
    .send('Target.createBrowserContext', { disposeOnDetach: false, ...(proxy ? { proxyServer: proxy } : {}) }, null)
    .catch(() => null);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank', ...(ctx ? { browserContextId: ctx.browserContextId } : {}) }, null);
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true }, null);
  await cdp.send('Page.enable', {}, sessionId).catch(() => null);
  const loaded = cdp.waitFor('Page.loadEventFired', { timeoutMs: 45000, sessionId }).catch(() => null);
  await cdp.send('Page.navigate', { url }, sessionId);
  // A widget in a hidden tab behaves differently (the challenge may never start),
  // so claim the foreground explicitly.
  await cdp.send('Page.bringToFront', {}, sessionId).catch(() => null);
  await loaded;
  return { targetId, sessionId, browserContextId: ctx ? ctx.browserContextId : null };
}

async function closePage(cdp, page) {
  if (!page) return;
  await cdp.send('Target.closeTarget', { targetId: page.targetId }, null).catch(() => null);
  if (page.browserContextId) await cdp.send('Target.disposeBrowserContext', { browserContextId: page.browserContextId }, null).catch(() => null);
}

/** Cloudflare reports failures (300xxx/600xxx "generic challenge failure") to the
 *  parent via postMessage; the iframe is cross-origin, so this is the only way to
 *  *measure* why a mount produced no token. */
const INSTALL_LISTENER = `(() => {
  window.__codivTsErrors = window.__codivTsErrors || [];
  if (!window.__codivTsListener) {
    window.__codivTsListener = true;
    window.addEventListener('message', (e) => {
      try {
        const d = typeof e.data === 'string' ? e.data : JSON.stringify(e.data);
        // Only failure codes (300xxx/600xxx) — every benign message carries the
        // string "cloudflare-challenge" in its source field, so matching words
        // would fill this list with noise.
        if (d && /3\\d{5}|6\\d{5}/.test(d)) window.__codivTsErrors.push(String(d).slice(0, 200));
      } catch (err) {}
    });
  }
  return true;
})()`;

const INJECT_API = `(() => {
  window.__codivMount = null;
  if (typeof turnstile === 'undefined' && !document.getElementById('codiv-captcha-api')) {
    const s = document.createElement('script');
    s.id = 'codiv-captcha-api';
    s.src = ${JSON.stringify(API_SCRIPT)};
    s.async = true; s.defer = true;
    document.head.appendChild(s);
  }
  return true;
})()`;

function renderWidget(sitekey) {
  return `(() => {
    try {
      if (typeof turnstile === 'undefined' || !turnstile.render) return { ok: false, why: 'api-missing' };
      const old = document.getElementById('codiv-mount-host');
      if (old) old.remove();
      const host = document.createElement('div');
      host.id = 'codiv-mount-host';
      host.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:2147483647;background:#fff;padding:4px';
      document.body.appendChild(host);
      if (window.__codivMountId != null) { try { turnstile.remove(window.__codivMountId); } catch (e) {} }
      window.__codivMountId = turnstile.render(host, {
        sitekey: ${JSON.stringify(sitekey)},
        size: 'normal',
        callback: (tk) => { window.__codivMount = tk; },
      });
      return { ok: true, widgetId: String(window.__codivMountId) };
    } catch (e) { return { ok: false, why: String((e && e.message) || e) }; }
  })()`;
}

const READ_TOKEN = `(() => {
  try {
    const own = window.__codivMount ||
      (window.__codivMountId != null && typeof turnstile !== 'undefined' && turnstile.getResponse ? turnstile.getResponse(window.__codivMountId) : '');
    if (own && String(own).length > 20) return own;
    const input = document.querySelector('[name="cf-turnstile-response"]');
    return input ? (input.value || '') : '';
  } catch (e) { return ''; }
})()`;

const RESET_WIDGET = `(() => {
  try {
    window.__codivMount = null;
    if (window.__codivMountId != null && typeof turnstile !== 'undefined') turnstile.reset(window.__codivMountId);
    return true;
  } catch (e) { return false; }
})()`;

/**
 * Click the widget's checkbox.
 *
 * The widget renders into a CLOSED shadow root (measured: `turnstile.render`
 * leaves a `<div><div></div><input name="cf-turnstile-response"></div>` in the
 * light DOM — no iframe is reachable, and `document.querySelectorAll('iframe')`
 * finds nothing), so the checkbox is clicked geometrically: the first child of
 * our mount host lays out the 300×73 widget box, and the checkbox sits at the
 * left edge, vertically centred.
 */
async function clickCheckbox(cdp, sessionId) {
  const box = await evalIn(
    cdp,
    sessionId,
    `(() => {
      const iframe = document.querySelector('#codiv-mount-host iframe[src*="challenges.cloudflare.com"]');
      if (iframe) {
        const r = iframe.getBoundingClientRect();
        return { x: Math.round(r.x + r.width * 0.14), y: Math.round(r.y + r.height / 2) };
      }
      const host = document.getElementById('codiv-mount-host');
      const target = host && (host.firstElementChild || host);
      if (!target) return null;
      const r = target.getBoundingClientRect();
      if (r.width < 40) return null;
      return { x: Math.round(r.x + 30), y: Math.round(r.y + r.height / 2) };
    })()`,
  ).catch(() => null);
  if (!box) return false;
  await clickIn(cdp, sessionId, box.x, box.y);
  return true;
}

const readToken = (cdp, sessionId) => evalIn(cdp, sessionId, READ_TOKEN).catch(() => '');

/** Poll for a token; resolves to '' when the budget runs out. */
async function pollToken(cdp, sessionId, rounds, everyMs) {
  let token = '';
  for (let i = 0; i < rounds; i++) {
    token = await readToken(cdp, sessionId);
    if (token && token.length > 20) return token;
    await sleep(everyMs);
  }
  return token || '';
}

/** One mount on `url`; resolves to the token or ''. The page is always closed. */
async function solveOnPage(cdp, { url, sitekey, proxy, log, clickRounds = 6, budgetMs = 150000 }) {
  const t0 = Date.now();
  let page = null;
  try {
    page = await mountPage(cdp, url, proxy);
    const sid = page.sessionId;
    await evalIn(cdp, sid, INSTALL_LISTENER).catch(() => null);
    await evalIn(cdp, sid, INJECT_API);

    let ready = 'undefined';
    for (let i = 0; i < 25; i++) {
      ready = await evalIn(cdp, sid, 'typeof turnstile').catch(() => 'undefined');
      if (ready === 'object' || ready === 'function') break;
      await sleep(600);
    }
    if (ready !== 'object' && ready !== 'function') {
      log(`  solver: turnstile api never loaded (typeof turnstile = ${ready})`);
      return '';
    }

    const rendered = await evalIn(cdp, sid, renderWidget(sitekey)).catch((e) => ({ ok: false, why: e.message }));
    log(`  solver: mount sitekey=${sitekey} -> ${JSON.stringify(rendered)}`);
    if (!rendered.ok) return '';

    let token = await pollToken(cdp, sid, 10, 800);
    if (token && token.length > 20) return token;

    let tries = 0;
    let seenErr = [];
    while (!token && tries < clickRounds && Date.now() - t0 < budgetMs) {
      tries++;
      if (tries > 1 && seenErr.length) {
        // A widget that landed in an error state ignores further clicks; reset()
        // restarts the challenge (300030 = generic challenge failure, retryable).
        const ok = await evalIn(cdp, sid, RESET_WIDGET).catch(() => false);
        log(`  solver: reset before try ${tries}: ${ok}`);
        await sleep(1500);
      }
      const clicked = await clickCheckbox(cdp, sid);
      token = await pollToken(cdp, sid, 12, 700);
      if (!token && !clicked) break;
      seenErr = await evalIn(cdp, sid, `(() => (window.__codivTsErrors || []).slice(-2))()`).catch(() => []);
      log(`  solver: click ${tries} tokenLen=${(token || '').length}${seenErr.length ? ` tsErrors=${JSON.stringify(seenErr).slice(0, 200)}` : ''}`);
    }
    return token && token.length > 20 ? token : '';
  } finally {
    await closePage(cdp, page);
  }
}

/**
 * One fresh token. `proxy` pins the solve page's exit (Cloudflare moderates the
 * widget per exit IP; a datacenter line answers `fail` after the click, measured).
 * Returns `null` when no token arrives after `attempts` mounts — the caller
 * decides whether to retry or give up.
 */
async function solveTurnstile({ cdpUrl = DEFAULT_CDP, url = 'https://codiv.ai/signup', sitekey = DEFAULT_SITEKEY, proxy = null, attempts = 2, log = () => {} } = {}) {
  let ws;
  try {
    ws = await browserWs(cdpUrl);
  } catch (e) {
    log(`  solver: ${e.message}`);
    return null;
  }
  const cdp = new CDP(ws, { commandTimeoutMs: 45000 });
  await cdp.connect();
  try {
    for (let i = 1; i <= attempts; i++) {
      const token = await solveOnPage(cdp, { url, sitekey, proxy, log });
      if (token) {
        log(`  solver: turnstile ok ${token.length} chars (attempt ${i}/${attempts})`);
        return token;
      }
      log(`  solver: attempt ${i}/${attempts} produced no token`);
      if (i < attempts) await sleep(1500);
    }
    return null;
  } finally {
    cdp.close();
  }
}

module.exports = { solveTurnstile, browserWs, DEFAULT_CDP, DEFAULT_SITEKEY };
