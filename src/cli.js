#!/usr/bin/env node
'use strict';

/**
 * codiv-bulk — bulk-create codiv.ai accounts + API keys and connect them to 9Router.
 *
 * Usage:
 *   codiv-bulk mint                     # create one account + key
 *   codiv-bulk create --count 200       # campaign: mint N keys (resume-safe)
 *   codiv-bulk verify                   # prove saved keys with a live chat call
 *   codiv-bulk connect                  # register keys into 9Router
 *   codiv-bulk list                     # list saved keys (masked)
 *   codiv-bulk token                    # solve one Turnstile token (debug)
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { showBanner } = require('./launcher');
const { mintAccount } = require('./lib/mint');
const { runBatch, countKeys } = require('./lib/batch');
const { solveCaptcha, DEFAULT_CDP } = require('./solver.js');

const OUT_DIR = path.join(__dirname, '..', 'out');
const DEFAULT_KEYS = path.join(OUT_DIR, 'codiv-keys.txt');
const DEFAULT_DIR = path.join(OUT_DIR, 'codiv-accounts');
const DEFAULT_LOG = path.join(OUT_DIR, 'codiv-batch.log');
const API = 'https://api.codiv.ai';

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const flag = (n) => process.argv.includes(`--${n}`);

/** Numeric flag: anything that is not a finite number falls back to `d`. */
const num = (n, d, min = 0) => {
  const v = Number(arg(n, d));
  return Number.isFinite(v) ? Math.max(min, v) : d;
};
const mask = (s) => (s ? `${String(s).slice(0, 8)}…${String(s).slice(-4)}` : '(none)');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const AUTO = !flag('no-auto'); // the embedded solver is the default path (one command)
const DRY = flag('dry'); // resolve the plan, print it, write nothing, send nothing

/**
 * `--dry`: the resolved plan, then exit 0. Nothing is written and no request is
 * sent, so it is safe to run anywhere (it never touches the keys file).
 */
function printPlan() {
  const keysFile = arg('keys', DEFAULT_KEYS);
  const solverOk = (() => {
    try { return typeof require('./solver.js').solveCaptcha === 'function'; } catch { return false; }
  })();
  console.log('codiv-bulk dry run — nothing is written and no request is sent.');
  console.log(`  count    ${num('count', '200')} account(s) → one key each`);
  console.log(`  dir      ${path.join(OUT_DIR, arg('dir', path.basename(DEFAULT_DIR)))}`);
  console.log(`  keys     ${keysFile} (${readKeys(keysFile).length} already saved)`);
  console.log(`  pause    ${num('pause', '5000')} ms between mints`);
  console.log(`  cdp      ${arg('cdp', DEFAULT_CDP)}`);
  console.log(`  proxy    ${arg('proxy', null) ? 'pinned exit (solve page)' : 'direct'}`);
  console.log(`  model    ${arg('model', 'diffusiongemma-26b')}`);
  console.log(`  solver   ${AUTO ? `embedded src/solver.js — ${solverOk ? 'present' : 'MISSING'} (--auto, default)` : 'off (--no-auto)'}`);
  console.log(`  mailtrap ${arg('mailtrap-token', null) || process.env.MAILTRAP_TOKEN ? 'token set' : 'no token — set MAILTRAP_TOKEN or --mailtrap-token'}`);
  console.log(`  chrome   ${chromeInfo().found ? 'found' : 'NOT FOUND — set CHROME_PATH or install Chrome (see --help)'}`);
}

/**
 * Where Chrome is, so the solve can drive it. `CHROME_PATH` wins, then the
 * usual binary names on PATH. Locating a binary is all the check does — the
 * solve still needs it STARTED with --remote-debugging-port=9222 (`--cdp`).
 */
function chromeInfo() {
  const names = ['chrome.exe', 'chrome', 'google-chrome', 'chromium', 'msedge.exe', 'msedge'];
  const explicit = process.env.CHROME_PATH;
  if (explicit) return { found: fs.existsSync(explicit), where: explicit, via: 'CHROME_PATH' };
  for (const n of names) {
    const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [n], { encoding: 'utf8', windowsHide: true });
    if (!r.error && r.status === 0) {
      const first = String(r.stdout || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean)[0];
      if (first) return { found: true, where: first, via: n };
    }
  }
  return { found: false, where: null, via: 'PATH' };
}

/** Printed before a campaign: the embedded solve needs a real, started Chrome. */
function warnChrome() {
  const info = chromeInfo();
  if (info.found) {
    console.log(`chrome      -> ${info.where} (${info.via}) — start it with --remote-debugging-port=9222`);
    return true;
  }
  console.log('chrome      -> no Chrome found — the embedded solver drives a real Chrome over CDP');
  console.log('               install it, then start it:  chrome.exe --remote-debugging-port=9222');
  console.log('               (set CHROME_PATH to an existing binary, or point --cdp at a Chrome you run elsewhere)');
  if (process.platform === 'linux' && !process.env.DISPLAY) {
    console.log('               this host has no display: run Chrome on a machine with one and pass --cdp ws://<host>:9222');
  }
  return false;
}
/** `proxies.txt` (first usable line) is the default solve-page exit; none = DIRECT. */
function defaultProxy() {
  const explicit = arg('proxy', null);
  if (explicit) return explicit;
  const file = path.join(__dirname, '..', 'proxies.txt');
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map((s) => s.trim()).find((s) => s && !s.startsWith('#')) || null;
}


function readKeys(keysFile) {
  if (!fs.existsSync(keysFile)) return [];
  return fs.readFileSync(keysFile, 'utf8').split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
}

function logLine(msg) {
  const line = `[${new Date().toISOString().slice(11, 19)}] ${msg}`;
  console.log(line);
  const logFile = arg('log', DEFAULT_LOG);
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  fs.appendFileSync(logFile, `${line}\n`);
}

async function cmdMint() {
  if (AUTO && !arg('solver-cmd', null)) warnChrome();
  const out = arg('out', path.join(OUT_DIR, 'codiv-account.json'));
  const record = await mintAccount({
    out,
    token: arg('token', null),
    solverCmd: arg('solver-cmd', null),
    proxy: defaultProxy(),
    mailtrapToken: arg('mailtrap-token', null),
    inboxFolder: arg('folder', 'codiv'),
    auto: AUTO,
    log: logLine,
  });
  console.log(`\nKey: ${record.key.value}`);
}

async function cmdCreate() {
  if (AUTO && !arg('solver-cmd', null)) warnChrome();
  const keysFile = arg('keys', DEFAULT_KEYS);
  const dir = path.join(OUT_DIR, arg('dir', path.basename(DEFAULT_DIR)));
  const passthrough = ['--cdp', '--mailtrap-token', '--solver-cmd', '--folder', '--proxy']
    .filter((f) => process.argv.includes(f))
    .flatMap((f) => {
      const v = process.argv[process.argv.indexOf(f) + 1];
      return v && !v.startsWith('--') ? [f, v] : [];
    });
  const proxy = defaultProxy();
  if (proxy && !passthrough.includes('--proxy')) passthrough.push('--proxy', proxy);
  if (!AUTO) passthrough.push('--no-auto');
  const { start, won, total } = await runBatch({
    count: num('count', '200'),
    dir,
    keys: keysFile,
    pause: num('pause', '5000'),
    passthrough,
    log_line: logLine,
  });
  console.log(`\nCampaign done: +${won} keys (${start} → ${total})`);
  console.log(`Keys file: ${keysFile}`);
}

async function cmdVerify() {
  const keysFile = arg('keys', DEFAULT_KEYS);
  const model = arg('model', 'diffusiongemma-26b');
  const conc = num('conc', '6', 1);
  const keys = readKeys(keysFile);
  console.log(`Verifying ${keys.length} keys with ${model}…\n`);
  let ok = 0;
  let fail = 0;
  const dead = [];
  for (let i = 0; i < keys.length; i += conc) {
    const results = await Promise.all(keys.slice(i, i + conc).map(async (key) => {
      const t0 = Date.now();
      try {
        const res = await fetch(`${API}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
          body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Reply with exactly: pong' }] }),
          signal: AbortSignal.timeout(30000),
        });
        return { key, status: res.status, ok: res.ok, ms: Date.now() - t0 };
      } catch (e) {
        return { key, status: 0, ok: false, ms: Date.now() - t0, error: e.message };
      }
    }));
    for (const r of results) {
      if (r.ok) { ok++; console.log(`OK   ${mask(r.key)} ${r.ms}ms`); }
      else { fail++; dead.push({ key: r.key, status: r.status }); console.log(`FAIL ${mask(r.key)} (${r.status}${r.error ? ` ${r.error.slice(0, 60)}` : ''}) ${r.ms}ms`); }
    }
    if (i + conc < keys.length) await sleep(500);
  }
  if (dead.length) {
    // keys-dead.txt lives NEXT TO the keys file (standard: key<TAB>sebep<TAB>ISO).
    const deadFile = path.join(path.dirname(path.resolve(keysFile)), 'keys-dead.txt');
    fs.appendFileSync(deadFile, dead.map((d) => `${d.key}\t${d.status}\t${new Date().toISOString()}`).join('\n') + '\n');
    console.log(`\n${dead.length} dead key(s) written to ${path.relative(process.cwd(), deadFile)}`);
  }
  console.log(`\nResults: ${ok} OK, ${fail} failed`);
}

async function cmdConnect() {
  const { connectBulk } = require('./connect-9router');
  const result = await connectBulk({
    base: arg('router', 'http://localhost:20128'),
    password: arg('router-password', '123456'),
    keysFile: arg('keys', DEFAULT_KEYS),
    defaultModel: arg('model', 'diffusiongemma-26b'),
  });
  if (result.clientKey) console.log(`\n9Router client key: ${result.clientKey}`);
}

async function cmdList() {
  const keysFile = arg('keys', DEFAULT_KEYS);
  const keys = readKeys(keysFile);
  console.log(`${keys.length} keys in ${keysFile}`);
  for (const [i, k] of keys.slice(0, 10).entries()) console.log(`  ${i + 1}. ${mask(k)}`);
  if (keys.length > 10) console.log(`  … and ${keys.length - 10} more`);
}

async function cmdToken() {
  const { token } = await solveCaptcha({
    type: 'turnstile',
    url: arg('url', 'https://codiv.ai/signup'),
    proxy: arg('proxy', null),
    cdpUrl: arg('cdp', DEFAULT_CDP),
    attempts: num('attempts', '2', 1),
    log: (m) => console.log(m),
  });
  console.log(token);
}

const HELP = `
codiv-bulk — bulk-create codiv.ai API keys (100M free tokens each) — 9Router connector

One command:
  node src/cli.js --count N           mint N accounts + keys (Turnstile solved automatically)

Usage:
  node src/cli.js --count 200         campaign, resume-safe (= create --count 200)
  node src/cli.js mint                create one account + key
  node src/cli.js verify              prove saved keys with a live chat call
  node src/cli.js connect             register keys into 9Router
  node src/cli.js list                list saved keys (masked)
  node src/cli.js token               solve one Turnstile token (debug)
  node src/cli.js --dry               print the resolved plan, write nothing, send nothing

Options:
  --count <n>            campaign size                        (default 200)
  --dir <name>           per-worker accounts dir under out/   (default codiv-accounts)
  --keys <file>          keys file                            (default out/codiv-keys.txt)
  --pause <ms>           delay between mints                  (default 5000)
  --out <file>           single-mint record                   (default out/codiv-account.json)
  --cdp <url>            Chrome DevTools endpoint             (default http://127.0.0.1:9222)
  --proxy <url>          solve-page exit (socks5:// or http://; a residential-ish exit solves)
  --auto                 solve the Turnstile with the embedded src/solver.js (default)
  --no-auto              disable the embedded solver (then --solver-cmd is required)
  --dry                  resolve the plan and exit (no write, no request)
  --solver-cmd <cmd>     advanced: external solver (CODIV_SITEKEY/CODIV_URL env, token = last stdout line)
  --mailtrap-token <t>   Mailtrap API token                   (or MAILTRAP_TOKEN env)
  --folder <name>        Mailtrap folder                      (default codiv)
  --model <id>           model for verify/connect             (default diffusiongemma-26b)
  --conc <n>             verify concurrency                   (default 6)
  --router <url>         9Router base                         (default http://localhost:20128)
  --router-password <p>  9Router dashboard password           (default 123456)

The embedded solver drives your own Chrome:  chrome --remote-debugging-port=9222
`;

const commands = { mint: cmdMint, create: cmdCreate, verify: cmdVerify, connect: cmdConnect, list: cmdList, token: cmdToken };
// `node src/cli.js --count N` is the one command: with no subcommand, one of the
// campaign flags selects `create`. A bare run still prints the banner + tasks.
const PLAN_FLAGS = ['count', 'dir', 'keys', 'pause', 'cdp', 'proxy', 'model', 'log', 'out'];
const cmd = process.argv[2];

(async () => {
  if (!cmd || cmd === '--help' || cmd === '-h' || flag('help')) {
    showBanner();
    console.log(HELP);
    return;
  }
  if (DRY) {
    printPlan();
    return;
  }
  const command = !cmd.startsWith('--') ? cmd : PLAN_FLAGS.some(flag) ? 'create' : null;
  if (!command || !commands[command]) {
    console.error(`unknown command: ${cmd} (run --help)`);
    process.exit(1);
  }
  await commands[command]();
})().catch((e) => {
  console.error(`FAILED: ${e.message}`);
  process.exit(1);
});
