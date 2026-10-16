#!/usr/bin/env node
'use strict';

/**
 * Single mint — one codiv.ai account + API key, using the library directly.
 *
 * Run: node examples/single-mint.js
 *
 * Needs:
 *   - MAILTRAP_TOKEN (or --mailtrap-token) for the verification inbox
 *   - Chrome running with --remote-debugging-port=9222 for the Turnstile solve
 */

const path = require('path');
const { mintAccount } = require('../src/lib/mint');

async function main() {
  const out = path.join(__dirname, '..', 'out', 'example-account.json');
  console.log('Minting one codiv.ai account + key…\n');
  const record = await mintAccount({ out });
  console.log(`\nDone. Key: ${record.key.value}`);
  console.log(`Record: ${out}`);
}

main().catch((e) => {
  console.error(`FAILED: ${e.message}`);
  process.exit(1);
});
