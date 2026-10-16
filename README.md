<div align="center">

# codiv-bulk-apikey

**Bulk-create [codiv.ai](https://codiv.ai) accounts + API keys (100M free tokens each) — 9Router connector. Zero dependencies.**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://api.codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-connect-to-9router)

</div>

---

## ✨ Features

- 🔑 **Bulk API keys** — mint hundreds of `sk-codiv-…` keys through codiv.ai's own dashboard backend.
- 💰 **100M free input tokens** — every account ships with 100M free input tokens.
- 🔌 **9Router connector** — every key is registered as an OpenAI-compatible connection under the `codiv` prefix.
- 🪶 **Zero dependencies** — pure Node.js ≥ 18. No `npm install`, no build step.
- ⏱️ **~80-115 s per account** — one Turnstile solve + one verification mail, end to end.
- ✅ **Proven keys** — each key is checked with a live chat call before it is saved.

## 🚀 Quick start

```bash
git clone https://github.com/F0Rextasy/codiv-bulk-apikey
cd codiv-bulk-apikey

# Verification inboxes (Mailtrap dashboard → Settings → API Tokens)
export MAILTRAP_TOKEN=…

# The Turnstile solve drives your own Chrome:
#   chrome.exe --remote-debugging-port=9222

node src/cli.js mint                    # one account + key, end to end
node src/cli.js create --count 200      # campaign (resume-safe)
node src/cli.js verify                  # prove saved keys with a live chat call
```

## 🛠 Usage

```bash
codiv-bulk mint                     # create one account + key
codiv-bulk create --count 200       # campaign: mint N keys (resume-safe)
codiv-bulk verify                   # prove saved keys with a live chat call
codiv-bulk connect                  # register keys into 9Router
codiv-bulk list                     # list saved keys (masked)
codiv-bulk token                    # solve one Turnstile token (debug)
```

| Flag | Description | Default |
| --- | --- | --- |
| `--count <n>` | campaign size | `200` |
| `--dir <name>` | per-worker accounts dir under `out/` | `codiv-accounts` |
| `--keys <file>` | keys file | `out/codiv-keys.txt` |
| `--pause <ms>` | delay between mints | `5000` |
| `--out <file>` | single-mint record | `out/codiv-account.json` |
| `--cdp <url>` | Chrome DevTools endpoint | `http://127.0.0.1:9222` |
| `--proxy <url>` | solve-page exit (`socks5://`/`http://`) | direct |
| `--token <t>` | one manual Turnstile token | — |
| `--solver-cmd <cmd>` | external solver (see below) | — |
| `--mailtrap-token <t>` | Mailtrap API token | `MAILTRAP_TOKEN` env |
| `--model <id>` | model for verify/connect | `diffusiongemma-26b` |
| `--conc <n>` | verify concurrency | `6` |
| `--router <url>` | 9Router base | `http://localhost:20128` |

## 📐 How it works

1. **Maildrop** — a fresh Mailtrap inbox is created per account for the verification mail.
2. **Turnstile** — the site's own widget (sitekey `0x4AAAAAAE7hE0DIArlj6rXX`) is mounted on `codiv.ai/signup` in your Chrome and clicked over CDP; the token goes back as the `x-captcha-response` header.
3. **Sign-up** — `POST /api/auth/sign-up/email` (better-auth).
4. **Verify** — the verification link is pulled from the inbox; better-auth auto-signs-in on the verify hit, so its `Set-Cookie` is the session.
5. **Create key** — the dashboard's Next.js server action `createKey` (ids re-discovered from the deployed chunks each run, because redeploys rotate them) returns the fresh key in its RSC answer.
6. **Prove** — a live chat call to `https://api.codiv.ai/v1` (`diffusiongemma-26b`) must answer `200` before the key counts.
7. **Save** — one `sk-codiv-…` per line in the keys file; the full record lands in the per-slot account JSON.

### Measured behaviour

- One account = **100M free input tokens**; no card.
- Mint cost ≈ **80-115 s per account** (one Turnstile solve + one verification mail).
- A 65-key batch per worker sustained **~55 successful mints**; the failure mode is the **420 s** per-mint timeout, not a partial write.
- Turnstile tokens are pinned to the solving exit; Cloudflare rejects a share of fresh tokens with `VERIFICATION_FAILED`, and the mint retries with a brand-new solve (up to 4 attempts).
- A datacenter exit passes the widget but the challenge answers `fail code 600010` after the click — point `--proxy` at a residential-ish exit, and expect a given exit to flip within hours after heavy use.

## 🔌 Connect to 9Router

9Router is a self-hosted, OpenAI-compatible router:

```bash
npm install -g 9router && 9router        # dashboard on http://localhost:20128
```

Register all your keys in one command (creates the `codiv` provider-node and attaches every key):

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

### Usage through 9Router

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Call it like any OpenAI endpoint:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"codiv/diffusiongemma-26b","messages":[{"role":"user","content":"hi"}]}'
```

## 🔁 Parallel campaigns

Give every worker its own `--dir` and `--keys`: two workers sharing one directory write the same `<start+i>.json` slot and lose one record per collision (measured).

```bash
node src/cli.js create --count 65 --dir w1 --keys out/codiv-keys-w1.txt &
node src/cli.js create --count 65 --dir w2 --keys out/codiv-keys-w2.txt &
node src/cli.js create --count 65 --dir w3 --keys out/codiv-keys-w3.txt &
wait
```

## 🧩 External solver

If you already have a Turnstile solver, skip the built-in Chrome path:

```bash
codiv-bulk mint --solver-cmd "node my-solver.js"   # or --token <t> for one manual token
```

`--solver-cmd` is run once per attempt with `CODIV_SITEKEY` and `CODIV_URL` in the environment, and the token is the last non-empty stdout line.

## 📚 As a library

```js
const { mintAccount } = require('./src/lib/mint');
const { connectBulk } = require('./src/connect-9router');

// One account + key
const record = await mintAccount({ out: './out/account.json' });
console.log(record.key.value);            // sk-codiv-…

// Register saved keys into 9Router
const { clientKey } = await connectBulk({
  keysFile: './out/codiv-keys.txt',
  prefix: 'codiv',
  defaultModel: 'diffusiongemma-26b',
});
```

## ⚠️ Notes

- Requirements: a **Mailtrap token** (verification inboxes) and a **Chrome with `--remote-debugging-port=9222`** (own Chrome, headful — a hidden tab behaves differently).
- Keys are proven with a real chat `200` before being saved; the record keeps every step (`signup`, `verify`, `actions`, `createKey`, `proof`).
- The keys file holds one `sk-codiv-…` per line; `create` resumes from whatever is already there.
- Accounts and keys are yours to keep; nothing is sent anywhere except codiv.ai, Mailtrap and (optionally) your 9Router.

## 📄 License

[MIT](LICENSE) © 2026 codiv-bulk-apikey contributors
