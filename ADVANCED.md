# Advanced — codiv-bulk

Everything here is optional. The one-command path (`npm start` → **1) Mint keys**, or
`node src/cli.js --count N`) already solves the Cloudflare Turnstile in your own Chrome and
spends a Mailtrap inbox per account. These are the escape hatches for operators who already
own a solver or want to drive the steps by hand.

## 1. Your own solve call

`--solver-cmd "<cmd>"` runs the command once per attempt with `CODIV_SITEKEY` and `CODIV_URL`
in the environment, and takes the **last non-empty stdout line** as the token. When it is
given, the embedded `src/solver.js` is not called at all.

```bash
node src/cli.js --count 5 --solver-cmd "node my-solver.js"
```

## 2. A token you already have

`--token <t>` is used for the first attempt of a single `mint` run (codiv.ai rejects roughly
half of the fresh tokens with `403 VERIFICATION_FAILED`; the retry needs a brand-new token, so
this does not survive a campaign).

```bash
node src/cli.js mint --token <token>
```

## 3. Turning the embedded solver off

`--no-auto` disables `src/solver.js`. Without `--solver-cmd` (or a token) the run then stops
at the first solve with a clear message instead of pretending.

## 4. Chrome and the exit

- `CHROME_PATH` — point the pre-check at a specific Chrome/Chromium binary.
- `--cdp <url>` — the DevTools endpoint to drive (default `http://127.0.0.1:9222`); a `ws://`
  URL is accepted, so Chrome on another machine works.
- `--proxy <url>` — pins the *solve page's* exit (`socks5://…` / `http://…`). A `proxies.txt`
  next to the CLI is used automatically when it exists; Cloudflare moderates the widget per
  exit IP, and a datacenter line answers `fail` after the click.

## 5. Files the tool writes

| Path | Contents |
| --- | --- |
| `out/codiv-keys.txt` | one live-verified key per line |
| `out/codiv-keys-dead.txt` | keys `verify` found dead (written by the verify path) |
| `out/codiv-accounts/<slot>.json` | the full per-account record |
| `out/codiv-batch.log` | campaign log |

`--dry` prints the resolved plan — count, exit, model, solver and Chrome availability — and
writes nothing and sends nothing, so it is safe to run anywhere.
