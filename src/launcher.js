'use strict';

/**
 * CODIV banner launcher.
 *
 * The wordmark is the fenced banner at the top of README.md (and every
 * i18n/README.<lang>.md) — keep the two in sync; `boxedBanner` pads the rows.
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
const path = require('path');
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

if (require.main === module) {
  const router = ROUTERS.find((r) => process.argv.includes(r.flag));
  if (router) connectRouter(router);
  else {
    showBanner();
    console.log('  1) Mint keys        — node src/cli.js create --count <n>');
    console.log('  2) Verify keys      — node src/cli.js verify');
    console.log('  3) Screen proxies   — node src/cli.js screen');
    console.log('  4) Connect to 9Router   — node src/cli.js connect');
    console.log('  5) Connect to OmniRoute — register the keys in keys.txt with a running OmniRoute\n');
  }
}

module.exports = { showBanner, WORDMARK, boxedBanner, ROUTERS, connectRouter };
