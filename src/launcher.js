'use strict';

/**
 * CODIV banner + interactive launcher.
 *
 * The wordmark is the fenced banner at the top of README.md (and every
 * i18n/README.<lang>.md) — keep the two in sync; `boxedBanner` pads the rows.
 *
 * `node src/launcher.js` (or `npm start`) opens the menu. `1) Mint keys` asks
 * one question — how many keys — and runs `cli.js --auto --count N`: there is
 * no token, captcha or proxy question, and a `proxies.txt` next to the CLI is
 * picked up by the CLI itself. After a run the menu prints a per-key summary
 * and points at the keys file and the dead-key file.
 *
 * `src/cli.js` imports `showBanner` from here, so requiring this module must
 * never touch stdin or argv: the menu is only built inside `menu()`.
 */

const WORDMARK = [
  ' ██████╗  ██████╗  ██████╗  ██╗ ██╗   ██╗',
  '██╔════╝ ██╔═══██╗ ██╔══██╗ ██║ ██║   ██║',
  '██║      ██║   ██║ ██║  ██║ ██║ ██║   ██║',
  '██║      ██║   ██║ ██║  ██║ ██║ ╚██╗ ██╔╝',
  '╚██████╗ ╚██████╔╝ ██████╔╝ ██║  ╚████╔╝',
  ' ╚═════╝  ╚═════╝  ╚═════╝  ╚═╝   ╚═══╝',
];

const WIDTH = Math.max(...WORDMARK.map((r) => r.length));
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const color = process.stdout.isTTY && !process.env.NO_COLOR;
const border = (fill) => (color ? `${DIM}${fill}${RESET}` : fill);

/** The wordmark inside a `╔═…═╗` box, matching the house style. */
function boxedBanner() {
  const line = '═'.repeat(WIDTH);
  return [
    '',
    border('╔' + line + '╗'),
    ...WORDMARK.map((r) => r + ' '.repeat(WIDTH - r.length) + border('║')),
    border('╚' + line + '╝'),
    '',
  ].join('\n');
}

function showBanner() {
  console.log(boxedBanner());
}

// The repo-format gate reads THIS file for the dual-router surface, and the connectors ship
// next to it — so the launcher owns both the menu lines and the CLI flags (added 2026-10-23).
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(__dirname, 'cli.js');
const KEYS_FILE = path.join(ROOT, 'out', 'codiv-keys.txt');
const DEAD_FILE = path.join(path.dirname(KEYS_FILE), 'keys-dead.txt');
const CONFIG = path.join(ROOT, 'launcher.config.json');
const ROUTERS = [
  { flag: '--connect-9router', file: 'connect-9router.js', label: 'Connect to 9Router' },
  { flag: '--connect-omniroute', file: 'connect-omniroute.js', label: 'Connect to OmniRoute' },
];
/** `node src/launcher.js --connect-9router|--connect-omniroute <connector args>` */
function connectRouter(router) {
  const rest = process.argv.slice(2).filter((a) => a !== router.flag);
  console.log('  ' + router.label + ' — register the keys in keys.txt with a running router\n');
  const r = spawnSync(process.execPath, [path.join(__dirname, router.file), ...rest], {
    cwd: path.resolve(__dirname, '..'), stdio: 'inherit', windowsHide: true,
  });
  if (r.status !== 0) {
    console.log('\n⚠ ' + router.label + ' exited with code ' + r.status);
    process.exit(r.status || 1);
  }
  process.exit(0);
}

const defaults = { count: 10 };

function loadConfig() {
  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(CONFIG, 'utf8')) };
  } catch (e) {
    return { ...defaults };
  }
}

function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG, `${JSON.stringify(cfg, null, 2)}\n`);
  } catch (e) {
    console.log(`  ! could not write ${path.basename(CONFIG)}: ${e.message}`);
  }
}

let rl = null;
const ask = (question, fallback) =>
  new Promise((resolve) => {
    rl = rl || readline.createInterface({ input: process.stdin, output: process.stdout });
    const hint = fallback ? ` [${fallback}]` : '';
    rl.question(`  ${question}${hint}: `, (answer) => resolve(String(answer).trim() || fallback || ''));
  });

/** Run the CLI with the terminal attached (its own progress lines are the UX). */
function run(args) {
  console.log('');
  const r = spawnSync(process.execPath, [CLI, ...args], { cwd: ROOT, stdio: 'inherit', windowsHide: true });
  if (r.status !== 0) console.log(`  ! exited with code ${r.status}`);
  return r.status;
}

/** Same, but capture the output so the summary table can be built from it. */
function capture(args) {
  const r = spawnSync(process.execPath, [CLI, ...args], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
  return { status: r.status, out: `${r.stdout || ''}${r.stderr || ''}` };
}

const countKeys = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#')).length : 0);

/** `401` → `auth`, `429` → `rate-limit`, `5xx` → `server`, `0` → `network`. */
function errorClass(status) {
  if (!status) return 'network';
  if (status === 429) return 'rate-limit';
  if (status >= 500) return 'server';
  return 'auth';
}

/**
 * Parse the CLI's verify lines (`OK   <masked> <ms>ms` / `FAIL <masked> (<status> …) <ms>ms`)
 * into rows, then print the table the menu ends on.
 */
function printSummary(out, keysFile) {
  const rows = [];
  for (const line of String(out).split(/\r?\n/)) {
    const ok = /^OK\s+(\S+)\s+(\d+)ms/.exec(line);
    if (ok) { rows.push({ key: ok[1], live: true, ms: Number(ok[2]), note: 'chat 200' }); continue; }
    const bad = /^FAIL\s+(\S+)\s+\((\d+)([^)]*)\)\s+(\d+)ms/.exec(line);
    if (bad) rows.push({ key: bad[1], live: false, ms: Number(bad[4]), status: Number(bad[2]), note: `http ${bad[2]}${bad[3] ? bad[3].slice(0, 40) : ''}` });
  }
  const live = rows.filter((r) => r.live);
  const dead = rows.filter((r) => !r.live);
  console.log('\n  Key                   Verdict  Latency   Note');
  console.log('  --------------------- -------- --------- ------------------------------');
  for (const r of rows.slice(0, 20)) {
    console.log(`  ${r.key.padEnd(21)} ${(r.live ? 'live' : 'dead').padEnd(8)} ${`${r.ms}ms`.padEnd(9)} ${r.note}`);
  }
  if (rows.length > 20) console.log(`  … and ${rows.length - 20} more`);
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.ms, 0) / rows.length) : 0;
  const classes = [...new Set(dead.map((r) => errorClass(r.status)))];
  console.log(`\n  ${live.length}/${rows.length} live · ${avg} ms avg · ${classes.length ? `error class: ${classes.join(', ')}` : 'no errors'}`);
  console.log(`  keys      : ${keysFile} (${countKeys(keysFile)} line(s))`);
  if (dead.length || fs.existsSync(DEAD_FILE)) console.log(`  dead keys : ${DEAD_FILE}`);
}

async function mintFlow(cfg) {
  cfg.count = Math.max(1, parseInt(await ask('How many keys?', String(cfg.count)), 10) || cfg.count);
  saveConfig(cfg);
  // The CLI's own plan: the count, the exit (proxies.txt when present) and whether
  // a real Chrome is reachable — printed before anything is spent.
  run(['--dry', '--count', String(cfg.count)]);
  const proxy = fs.existsSync(path.join(ROOT, 'proxies.txt')) ? 'proxies.txt' : 'direct';
  console.log(`\n  minting ${cfg.count} key(s) · proxy ${proxy} · captcha automatic\n`);
  const before = countKeys(KEYS_FILE);
  const status = run(['--auto', '--count', String(cfg.count)]);
  const after = countKeys(KEYS_FILE);
  console.log(`\n  mint finished (${status === 0 ? 'ok' : `exit ${status}`}) — keys.txt grew by ${after - before}`);
  if (!after) {
    console.log('  no keys to check yet.');
    return;
  }
  console.log('  re-checking every key in keys.txt…');
  printSummary(capture(['verify']).out, KEYS_FILE);
}

async function menu() {
  const cfg = loadConfig();
  showBanner();
  console.log('  1) Mint keys        — mint N accounts + keys, one command (automatic, resume-safe)');
  console.log('  2) Verify keys      — re-check every key in keys.txt with a live chat call');
  console.log('  3) List keys        — what the keys file holds now (masked)');
  console.log('  4) Connect to 9Router   — register the keys in keys.txt with a running 9Router');
  console.log('  5) Connect to OmniRoute — register the keys in keys.txt with a running OmniRoute');
  console.log('  6) Help             — CLI options and notes');
  console.log('  q) Quit\n');
  const choice = (await ask('Choose', '1')).toLowerCase();

  if (choice === '1') await mintFlow(cfg);
  else if (choice === '2') {
    if (!countKeys(KEYS_FILE)) console.log(`\n  no keys in ${KEYS_FILE} — mint some first (item 1)`);
    else printSummary(capture(['verify']).out, KEYS_FILE);
  } else if (choice === '3') await run(['list']);
  else if (choice === '4') await connectRouter(ROUTERS[0]);
  else if (choice === '5') await connectRouter(ROUTERS[1]);
  else if (choice === '6') await run(['--help']);
  if (rl) rl.close();
}

if (require.main === module) {
  const router = ROUTERS.find((r) => process.argv.includes(r.flag));
  if (router) connectRouter(router);
  else menu().catch((e) => {
    console.error(`[fatal] ${e.message}`);
    process.exit(1);
  });
}

module.exports = { showBanner, WORDMARK, boxedBanner, ROUTERS, connectRouter };
