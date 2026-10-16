#!/usr/bin/env node
'use strict';

/**
 * Campaign example — mint N keys with the runner, then register them into 9Router.
 *
 * Run: node examples/campaign.js 5
 *
 * Parallel safety: to run several campaigns at once, give each worker its own
 * `dir` and `keys` file (one slot per worker), e.g.
 *
 *   node examples/campaign.js 65 w1
 *   node examples/campaign.js 65 w2
 *
 * Two workers sharing one dir race on the same `<start+i>.json` slot and lose
 * one record per collision (measured).
 *
 * Needs:
 *   - MAILTRAP_TOKEN (or --mailtrap-token) for the verification inboxes
 *   - Chrome running with --remote-debugging-port=9222 for the Turnstile solves
 */

const path = require('path');
const { runBatch } = require('../src/lib/batch');

async function main() {
  const count = Number(process.argv[2] || '5');
  const worker = process.argv[3] || null;
  const base = path.join(__dirname, '..', 'out');

  const { start, won, total } = await runBatch({
    count,
    dir: path.join(base, worker ? `codiv-accounts-${worker}` : 'codiv-accounts'),
    keys: path.join(base, worker ? `codiv-keys-${worker}.txt` : 'codiv-keys.txt'),
    pause: 5000,
  });

  console.log(`\nDone: +${won} keys (${start} → ${total})`);
}

main().catch((e) => {
  console.error(`FAILED: ${e.message}`);
  process.exit(1);
});
