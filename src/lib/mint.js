'use strict';

/**
 * One codiv.ai account and API key, end to end:
 *   maildrop -> Turnstile -> sign-up -> email verification link (session cookie)
 *   -> Next.js server action `createKey` -> live chat proof of the key.
 *
 * Why this shape: codiv.ai is not a new-api panel (/api/status is 404). It is a
 * Next.js app on better-auth. Sign-up and sign-in POST to /api/auth/* and are
 * gated by Cloudflare Turnstile (sitekey 0x4AAAAAAE7hE0DIArlj6rXX), sent as the
 * request header `x-captcha-response`. A token minted by the solver carries
 * `cData` for the solver's own hostname, so ~half of fresh tokens are rejected
 * with `403 Captcha verification failed`; retrying with a fresh solve is the fix.
 * better-auth has autoSignInAfterVerification ON here (measured: hitting the
 * verify link logs the browser in), so the verify response's Set-Cookie is the
 * primary session source; sign-in is only a fallback.
 * The dashboard has no JSON API — key creation is a server action
 * (`next-action: <id>`) returning text/x-component RSC lines with the fresh key
 * in the `1:{"key":"…"}` line. Ids are discovered from the page's chunks each
 * run because a redeploy rotates them.
 *
 * Measured: one account = 100M free input tokens; mint cost ~80-115 s
 * (one Turnstile solve + one verification mail); every key is proven with a
 * live chat 200 (`diffusiongemma-26b` at https://api.codiv.ai/v1) before the
 * record is saved.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { createInbox, listMessages, readMessage } = require('./mailtrap');
const { solveTurnstile, DEFAULT_CDP, DEFAULT_SITEKEY } = require('./solver');

const SITE = 'https://codiv.ai';
const API = 'https://api.codiv.ai';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
const VERIFY_LINK_RE = /https:\/\/codiv\.ai\/api\/auth\/verify-email\?token=[A-Za-z0-9_.-]+/;
const SESSION_COOKIE_RE = /^__Secure-better-auth\.session_token=/;
// Known-good fallback: the chunk that carries the Keys client module. Chunk names
// rotate on redeploy, so this only buys one retry before the scan gives up.
const FALLBACK_CHUNK = '/_next/static/chunks/0d5mw98hf-wga.js';

const mask = (s) => (s ? `${String(s).slice(0, 8)}…${String(s).slice(-4)}` : '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const setCookies = (res) => (typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : []);
const cookieOf = (res) => setCookies(res).map((c) => c.split(';')[0]).filter((c) => SESSION_COOKIE_RE.test(c)).join('; ');

/**
 * External-solver contract (--solver-cmd "my-solver"):
 * the command is run once per attempt with CODIV_SITEKEY and CODIV_URL in the
 * environment, and the token is the last non-empty stdout line.
 */
function tokenFromSolverCmd(cmd, { url, sitekey, log }) {
  const run = spawnSync(cmd, {
    shell: true,
    encoding: 'utf8',
    timeout: 180000,
    windowsHide: true,
    env: { ...process.env, CODIV_SITEKEY: sitekey, CODIV_URL: url },
  });
  const out = `${run.stdout || ''}${run.stderr || ''}`.trim();
  if (run.status !== 0 || !out) {
    log(`  solver-cmd exited ${run.status}: ${out.slice(-160)}`);
    return null;
  }
  const token = out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).pop() || null;
  log(`  solver-cmd returned ${token ? `${token.length} chars` : 'nothing'}`);
  return token;
}

/**
 * One Turnstile token for `url`: a manual `--token` (first attempt only), an
 * external `--solver-cmd`, or the built-in CDP mount solver.
 */
async function getToken({ manualToken, usedManual, solverCmd, cdpUrl, proxy, url, sitekey, log }) {
  if (manualToken && !usedManual.value) {
    usedManual.value = true;
    return manualToken;
  }
  if (solverCmd) return tokenFromSolverCmd(solverCmd, { url, sitekey, log });
  return solveTurnstile({ cdpUrl, url, sitekey, proxy, attempts: 1, log });
}

/** better-auth call with `x-captcha-response`; retries with a NEW token when
 *  Cloudflare rejects it (VERIFICATION_FAILED). */
async function authCall(pathname, body, solveUrl, pageUrl, ctx) {
  for (let i = 1; i <= 4; i++) {
    const token = await getToken({ ...ctx, url: solveUrl });
    if (!token) {
      ctx.log(`  ${pathname} attempt ${i}/4: no turnstile token`);
      continue;
    }
    let res;
    try {
      res = await fetch(`${SITE}${pathname}`, {
        method: 'POST',
        redirect: 'manual',
        headers: { 'content-type': 'application/json', 'x-captcha-response': token, 'user-agent': UA, origin: SITE, referer: pageUrl },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });
    } catch (e) {
      ctx.log(`  ${pathname} attempt ${i}/4: ${e.message}`);
      continue;
    }
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* keep raw text */ }
    if (res.status === 403 && json?.code === 'VERIFICATION_FAILED') {
      ctx.log(`  ${pathname} attempt ${i}/4: token rejected by Cloudflare (VERIFICATION_FAILED)`);
      continue;
    }
    return { status: res.status, json, text, cookie: cookieOf(res) };
  }
  throw new Error(`${pathname}: 4 fresh tokens all rejected`);
}

async function fetchText(url, headers = {}, attempts = 4) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await (await fetch(url, { headers: { 'user-agent': UA, ...headers }, signal: AbortSignal.timeout(25000) })).text();
    } catch (e) {
      if (i === attempts) throw e;
      await sleep(3000);
    }
  }
}

/** Server action ids from the deployed dashboard bundle (createKey / revokeKey).
 *  The references live in the client chunk that only the logged-in dashboard
 *  loads (measured: unauthenticated /dashboard returns the login page's chunk
 *  set, which has none), so the session cookie is required here. */
async function serverActionIds(cookie) {
  const html = await fetchText(`${SITE}/dashboard`, { cookie });
  const chunks = [...new Set([...html.matchAll(/\/_\/next\/static\/chunks\/[a-z0-9_.-]+\.js/g)].map((m) => m[0]))].map((s) => s.replace('/_/', '/'));
  chunks.push(FALLBACK_CHUNK);
  for (const c of [...new Set(chunks)]) {
    const js = await fetchText(`${SITE}${c}`).catch(() => '');
    const found = [...js.matchAll(/createServerReference\)\("([0-9a-f]{40,44})"[^;]*?"(createKey|revokeKey)"\)/g)];
    if (found.length >= 2) return Object.fromEntries(found.map((m) => [m[2], m[1]]));
  }
  throw new Error(`server action ids not found in ${chunks.length} chunks`);
}

/** `createKey` server action; the RSC answer carries `1:{"key":"sk-codiv-…"}`. */
async function createKey(actions, cookie, name = 'Default') {
  const res = await fetch(`${SITE}/dashboard`, {
    method: 'POST',
    headers: {
      'next-action': actions.createKey,
      'content-type': 'text/plain;charset=UTF-8',
      accept: 'text/x-component',
      cookie,
      'user-agent': UA,
      referer: `${SITE}/dashboard`,
      origin: SITE,
    },
    body: JSON.stringify(['', name]),
    signal: AbortSignal.timeout(30000),
  });
  const rsc = await res.text();
  const key = /"key":"(sk-codiv-[A-Za-z0-9]+)"/.exec(rsc)?.[1];
  return { status: res.status, key, rsc };
}

/**
 * Mint one account + key and write the record to `out`.
 *
 * `out` must be per-campaign (the campaign runner passes `--dir`): parallel
 * workers sharing one slot raced on the same file and lost one record per
 * collision (measured).
 */
async function mintAccount({
  out,
  token: manualToken = null,
  solverCmd = null,
  cdpUrl = DEFAULT_CDP,
  proxy = null,
  sitekey = DEFAULT_SITEKEY,
  mailtrapToken = null,
  inboxFolder = 'codiv',
  password: fixedPassword = null,
  log = (m) => console.log(m),
} = {}) {
  const record = { provider: 'codiv.ai', at: new Date().toISOString(), steps: {} };
  const ctx = { manualToken, usedManual: { value: false }, solverCmd, cdpUrl, proxy, sitekey, log };

  const box = await createInbox({ token: mailtrapToken, folder: inboxFolder, tag: 'codiv' });
  record.steps.maildrop = { address: box.address };
  log(`maildrop    -> ${box.address}`);

  const password = fixedPassword || `Cd!${crypto.randomBytes(6).toString('hex')}9z`;

  log('signup      -> solving turnstile');
  const signUp = await authCall(
    '/api/auth/sign-up/email',
    { name: `Codiv ${crypto.randomBytes(2).toString('hex')}`, email: box.address, password, callbackURL: '/dashboard' },
    `${SITE}/signup`,
    `${SITE}/signup`,
    ctx,
  );
  record.steps.signup = { status: signUp.status, userId: signUp.json?.user?.id, emailVerified: signUp.json?.user?.emailVerified };
  if (signUp.status !== 200 || !signUp.json?.user) throw new Error(`sign-up ${signUp.status}: ${JSON.stringify(signUp.json || signUp.text).slice(0, 200)}`);
  log(`signup      -> 200 user ${signUp.json.user.id} verified=${signUp.json.user.emailVerified}`);
  // Save the account before the key steps: a failure later (mail timeout,
  // action-id scan, createKey) would otherwise throw away the only copy of
  // the password and orphan an account that already exists on codiv.ai.
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ ...record, account: { email: box.address, password } }, null, 2));

  log('verification-> waiting for mail');
  let link = null;
  for (let i = 0; i < 48 && !link; i++) {
    await sleep(5000);
    let msgs = [];
    try { msgs = await listMessages(mailtrapToken, box.id); } catch { continue; }
    for (const m of msgs) {
      let haystack = `${m.subject || ''} ${m.text || ''} ${m.html || ''}`;
      if (!VERIFY_LINK_RE.test(haystack)) {
        try {
          const full = await readMessage(mailtrapToken, box.id, m.id);
          haystack += ` ${full.text || ''} ${full.html || ''}`;
        } catch { /* message vanished between list and read */ }
      }
      link = VERIFY_LINK_RE.exec(haystack.replace(/&amp;/g, '&'))?.[0] || null;
      if (link) break;
    }
  }
  if (!link) throw new Error('verification mail never arrived');
  const verify = await fetch(link, { redirect: 'manual', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30000) });
  record.steps.verify = { status: verify.status, location: verify.headers.get('location'), sessionCookie: Boolean(cookieOf(verify)) };
  log(`verify      -> ${verify.status} ${verify.headers.get('location') || ''} cookie=${cookieOf(verify) ? 'yes' : 'no'}`);

  // autoSignInAfterVerification is on: the verify response itself sets the session.
  let cookie = cookieOf(verify);
  if (!cookie) {
    log('signin      -> solving turnstile');
    const signIn = await authCall('/api/auth/sign-in/email', { email: box.address, password, callbackURL: '/dashboard' }, `${SITE}/login`, `${SITE}/login`, ctx);
    record.steps.signin = { status: signIn.status };
    if (signIn.status !== 200) throw new Error(`sign-in ${signIn.status}: ${JSON.stringify(signIn.json || signIn.text).slice(0, 200)}`);
    cookie = signIn.cookie;
    log(`signin      -> 200 cookie=${cookie ? 'yes' : 'no'}`);
  }
  if (!cookie) throw new Error('no session cookie from verify or sign-in');

  const actions = await serverActionIds(cookie);
  record.steps.actions = actions;
  log(`actions     -> createKey ${actions.createKey.slice(0, 12)}…`);
  const minted = await createKey(actions, cookie);
  record.steps.createKey = { status: minted.status, key: mask(minted.key) };
  if (!minted.key) throw new Error(`createKey: no key in RSC (${minted.status}, ${minted.rsc.length} bytes)`);
  const key = minted.key;
  log(`createKey   -> ${mask(key)}`);

  const chat = await fetch(`${API}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'diffusiongemma-26b', messages: [{ role: 'user', content: 'Reply with exactly: pong' }] }),
    signal: AbortSignal.timeout(60000),
  });
  const chatBody = await chat.json().catch(() => null);
  record.steps.proof = { chat: { status: chat.status, model: chatBody?.model, content: chatBody?.choices?.[0]?.message?.content } };
  log(`proof       -> chat ${chat.status} (${chatBody?.model}: "${chatBody?.choices?.[0]?.message?.content}")`);

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ ...record, account: { email: box.address, password }, key: { name: 'Default', value: key } }, null, 2));
  log(`saved       -> ${out} (key masked in log, full in file)`);
  return record;
}

module.exports = { mintAccount };
