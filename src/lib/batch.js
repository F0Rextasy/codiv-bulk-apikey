'use strict';

/**
 * Campaign runner — mint N codiv.ai keys for the operator's own fabric.
 *
 * One mint per child process: a hung solve cannot wedge the campaign, and the
 * 420 s per-mint timeout is the measured failure mode (a 65-key batch per worker
 * sustained ~55 successful mints, the rest timing out).
 *
 * Parallel safety: each worker passes its own `--dir`, because workers sharing
 * one directory write the SAME `<start+i>.json` slot — two minters racing on one
 * account file lose one record per collision (measured).
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const MINT_TIMEOUT_MS = 420000;

function countKeys(keysFile) {
  if (!fs.existsSync(keysFile)) return 0;
  return fs.readFileSync(keysFile, 'utf8').split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#')).length;
}

/** The key as the mint wrote it: `key` is `{name, value}` in the record; be
 *  tolerant of a plain string (a bare-string read once appended the literal
 *  `[object Object]` to the key file — measured, 18 of 19 lines). */
function keyFromRecord(file) {
  if (!fs.existsSync(file)) return null;
  try {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    const raw = j && j.key && typeof j.key === 'object' ? j.key.value : j && j.key;
    return typeof raw === 'string' && raw ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Run a campaign. Resolves to `{ start, won, total, results }`.
 * `passthrough` args (e.g. --cdp, --mailtrap-token, --solver-cmd) are forwarded
 * to every mint.
 */
async function runBatch({
  count = 200,
  dir,
  keys,
  log,
  pause = 5000,
  mintScript = path.join(__dirname, '..', 'cli.js'),
  passthrough = [],
  timeoutMs = MINT_TIMEOUT_MS,
  log_line = (m) => console.log(m),
} = {}) {
  fs.mkdirSync(dir, { recursive: true });
  const start = countKeys(keys);
  const results = [];
  let won = 0;
  log_line(`batch       -> ${start} keys known · target +${count} · dir ${dir}`);

  for (let i = 1; i <= count; i++) {
    const dest = path.join(dir, `${String(start + i).padStart(3, '0')}.json`);
    const t0 = Date.now();
    const run = spawnSync(process.execPath, [mintScript, 'mint', '--out', dest, ...passthrough], {
      encoding: 'utf8',
      timeout: timeoutMs,
      windowsHide: true,
    });
    const out = `${run.stdout || ''}${run.stderr || ''}`;

    // The key comes from the account JSON, not from stdout: the mint prints it
    // masked, and a regex over the log once matched a truncated prefix and
    // appended an empty line (measured: the first successful run added nothing
    // while the account file held a valid key).
    const key = keyFromRecord(dest);
    const record = (() => {
      try { return JSON.parse(fs.readFileSync(dest, 'utf8')); } catch { return null; }
    })();
    const proven = record?.steps?.proof?.chat?.status === 200;
    const seconds = ((Date.now() - t0) / 1000).toFixed(0);

    if (key && proven) {
      fs.appendFileSync(keys, `${key}\n`);
      won++;
      results.push({ i, ok: true, key, seconds: Number(seconds) });
      log_line(`  ${i}/${count} OK key + chat 200 (${seconds}s) · total ${countKeys(keys)}`);
    } else {
      const tail = out.trim().split(/\r?\n/).slice(-2).join(' | ').slice(0, 160);
      results.push({ i, ok: false, seconds: Number(seconds), tail });
      log_line(`  ${i}/${count} FAIL (${seconds}s) · ${tail}`);
    }
    await new Promise((r) => setTimeout(r, pause));
  }

  const total = countKeys(keys);
  log_line(`batch done  -> +${won} keys (${start} → ${total})`);
  return { start, won, total, results };
}

module.exports = { runBatch, countKeys, keyFromRecord, MINT_TIMEOUT_MS };
