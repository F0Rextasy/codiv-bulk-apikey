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
const { showBanner } = require('./launcher');
const { mintAccount } = require('./lib/mint');
const { runBatch, countKeys } = require('./lib/batch');
const { solveTurnstile, DEFAULT_CDP } = require('./lib/solver');

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
  const out = arg('out', path.join(OUT_DIR, 'codiv-account.json'));
  const record = await mintAccount({
    out,
    token: arg('token', null),
    solverCmd: arg('solver-cmd', null),
    cdpUrl: arg('cdp', DEFAULT_CDP),
    proxy: arg('proxy', null),
    mailtrapToken: arg('mailtrap-token', null),
    inboxFolder: arg('folder', 'codiv'),
    log: logLine,
  });
  console.log(`\nKey: ${record.key.value}`);
}

async function cmdCreate() {
  const keysFile = arg('keys', DEFAULT_KEYS);
  const dir = path.join(OUT_DIR, arg('dir', path.basename(DEFAULT_DIR)));
  const passthrough = ['--cdp', '--mailtrap-token', '--solver-cmd', '--folder', '--proxy']
    .filter((f) => process.argv.includes(f))
    .flatMap((f) => {
      const v = process.argv[process.argv.indexOf(f) + 1];
      return v && !v.startsWith('--') ? [f, v] : [];
    });
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
  for (let i = 0; i < keys.length; i += conc) {
    const results = await Promise.all(keys.slice(i, i + conc).map(async (key) => {
      try {
        const res = await fetch(`${API}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
          body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Reply with exactly: pong' }] }),
          signal: AbortSignal.timeout(30000),
        });
        return { key, status: res.status, ok: res.ok };
      } catch (e) {
        return { key, status: 0, ok: false, error: e.message };
      }
    }));
    for (const r of results) {
      if (r.ok) { ok++; console.log(`OK   ${mask(r.key)}`); }
      else { fail++; console.log(`FAIL ${mask(r.key)} (${r.status}${r.error ? ` ${r.error.slice(0, 60)}` : ''})`); }
    }
    if (i + conc < keys.length) await sleep(500);
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
  const token = await solveTurnstile({
    cdpUrl: arg('cdp', DEFAULT_CDP),
    url: arg('url', 'https://codiv.ai/signup'),
    proxy: arg('proxy', null),
    attempts: num('attempts', '2', 1),
    log: (m) => console.log(m),
  });
  if (!token) {
    console.error('no token');
    process.exit(1);
  }
  console.log(token);
}

const HELP = `
codiv-bulk — bulk-create codiv.ai API keys (100M free tokens each) — 9Router connector

Usage:
  codiv-bulk mint                     create one account + key
  codiv-bulk create --count 200       campaign: mint N keys (resume-safe)
  codiv-bulk verify                   prove saved keys with a live chat call
  codiv-bulk connect                  register keys into 9Router
  codiv-bulk list                     list saved keys (masked)
  codiv-bulk token                    solve one Turnstile token (debug)

Options:
  --count <n>            campaign size                        (default 200)
  --dir <name>           per-worker accounts dir under out/   (default codiv-accounts)
  --keys <file>          keys file                            (default out/codiv-keys.txt)
  --pause <ms>           delay between mints                  (default 5000)
  --out <file>           single-mint record                   (default out/codiv-account.json)
  --cdp <url>            Chrome DevTools endpoint             (default http://127.0.0.1:9222)
  --proxy <url>          solve-page exit (socks5:// or http://; a residential-ish exit solves)
  --token <t>            one manual Turnstile token (single mint)
  --solver-cmd <cmd>     external solver (CODIV_SITEKEY/CODIV_URL env, token = last stdout line)
  --mailtrap-token <t>   Mailtrap API token                   (or MAILTRAP_TOKEN env)
  --folder <name>        Mailtrap folder                      (default codiv)
  --model <id>           model for verify/connect             (default diffusiongemma-26b)
  --conc <n>             verify concurrency                   (default 6)
  --router <url>         9Router base                         (default http://localhost:20128)
  --router-password <p>  9Router dashboard password           (default 123456)

The solver drives your own Chrome:  chrome --remote-debugging-port=9222
`;

const commands = { mint: cmdMint, create: cmdCreate, verify: cmdVerify, connect: cmdConnect, list: cmdList, token: cmdToken };
const cmd = process.argv[2];

(async () => {
  if (!cmd || cmd === '--help' || cmd === '-h' || flag('help')) {
    showBanner();
    console.log(HELP);
    return;
  }
  if (!commands[cmd]) {
    console.error(`unknown command: ${cmd} (run --help)`);
    process.exit(1);
  }
  await commands[cmd]();
})().catch((e) => {
  console.error(`FAILED: ${e.message}`);
  process.exit(1);
});
