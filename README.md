<div align="center">

<img src="brand/logo.svg" alt="codiv-bulk" width="150" />

# codiv-bulk-apikey

**Bulk-create [codiv.ai](https://codiv.ai) accounts, mint an `sk-codiv-…` API key for each (100M free input tokens per account), and register every key into a running [9Router](https://9router.com) instance — end to end. Zero dependencies.**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://api.codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-connect-to-9router)
[![Transport](https://img.shields.io/badge/transport-HTTP%20%7C%20SOCKS5%20%7C%20CDP-0EA5E9.svg?style=for-the-badge)](#-transports)
[![Mailtrap](https://img.shields.io/badge/inbox-Mailtrap-22C55E.svg?style=for-the-badge)](https://mailtrap.io)
[![Languages](https://img.shields.io/badge/i18n-5%20languages-F59E0B.svg?style=for-the-badge)](#-languages)

[English](README.md) · [Bahasa Indonesia](i18n/README.id.md) · [简体中文](i18n/README.zh.md) · [日本語](i18n/README.ja.md) · [Español](i18n/README.es.md) · [Deutsch](i18n/README.de.md)

</div>

---

## ✨ Features

- 🔑 **Bulk accounts + API keys** — mint hundreds of `sk-codiv-…` keys through codiv.ai's own dashboard backend.
- 💰 **100M free input tokens** — every account ships with 100M free input tokens. No card.
- 🔌 **9Router connector** — every key is registered as an OpenAI-compatible connection under the `codiv` prefix in a single pass.
- 🧠 **Real Turnstile solve** — the site's own widget is mounted on `codiv.ai/signup` in *your* Chrome and clicked over CDP.
- 🪶 **Zero dependencies** — a hand-rolled RFC6455 WebSocket + CDP client. No `npm install`, no build step.
- ⏱️ **~80-115 s per account** — one Turnstile solve + one verification mail, end to end.
- ✅ **Proven keys** — each key must answer a live chat `200` before it is saved.
- 🌍 **5 languages** — EN, ID, ZH, JA, ES, DE.

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
node src/cli.js connect                 # register the keys into 9Router
```

`create` counts the keys already in the keys file and resumes from there, so a campaign can be stopped and restarted without losing work.

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
| `--log <file>` | campaign log | `out/codiv-batch.log` |
| `--cdp <url>` | Chrome DevTools endpoint | `http://127.0.0.1:9222` |
| `--proxy <url>` | solve-page exit (`socks5://`/`http://`) | direct |
| `--token <t>` | one manual Turnstile token | — |
| `--attempts <n>` | solve attempts (`token` command) | `2` |
| `--solver-cmd <cmd>` | external solver (see below) | — |
| `--mailtrap-token <t>` | Mailtrap API token | `MAILTRAP_TOKEN` env |
| `--folder <name>` | Mailtrap folder | `codiv` |
| `--model <id>` | model for verify/connect | `diffusiongemma-26b` |
| `--conc <n>` | verify concurrency | `6` |
| `--router <url>` | 9Router base | `http://localhost:20128` |
| `--router-password <pw>` | 9Router dashboard password | `123456` |

## 🌐 Transports

codiv.ai guards sign-up with Cloudflare **Turnstile** and mails a verification link, so the solve must happen in a real browser from a clean exit IP:

- **Chrome over CDP (default)** — start your own Chrome with `--remote-debugging-port=9222` (headful: a hidden tab behaves differently) and point `--cdp` at it. The page that carries the widget is created in its own browser context.
- **Proxy exit** — `--proxy socks5://…` or `http://…` pins the *solve page's* exit. Cloudflare moderates the widget per exit IP; a datacenter line passes the widget but answers `fail code 600010` after the click.
- **External solver** — `--solver-cmd "node my-solver.js"` skips Chrome entirely; it is run once per attempt with `CODIV_SITEKEY` and `CODIV_URL` in the environment, and the token is the last non-empty stdout line. `--token <t>` supplies one manual token for a single mint.
- **Direct fetch** — everything except the solve is plain HTTPS: Mailtrap's API, the better-auth endpoints and `https://api.codiv.ai/v1`.

Inbox rail: one fresh [Mailtrap](https://mailtrap.io) inbound inbox per account, created through its public API with `--mailtrap-token` / `MAILTRAP_TOKEN`.

## 🔌 Connect to 9Router

9Router is a self-hosted, OpenAI-compatible router:

```bash
npm install -g 9router && 9router        # dashboard on http://localhost:20128
```

Register all your keys in one command (creates the `codiv` provider-node and attaches every key):

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

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

## 🧠 Available models

| Model | Call as in 9Router | Status |
| --- | --- | --- |
| diffusiongemma-26b | `codiv/diffusiongemma-26b` | ✅ `200` — the model every mint is proven against |

The key is minted from the dashboard's server action and the account's 100M free input tokens are what pays for it, so `diffusiongemma-26b` is the default for both `verify` and `connect`; `--model <id>` pins another one. Refresh the router-side list with:

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
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

## ⚙️ How it works

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

## 📁 Layout

```
codiv-bulk-apikey/
├── src/
│   ├── cli.js                  # mint · create · verify · connect · list · token
│   ├── connect-9router.js      # register the keys as a 9Router provider
│   ├── launcher.js             # CODIV ASCII banner
│   └── lib/
│       ├── mint.js             # one account + key, end to end
│       ├── batch.js            # campaign runner (one child process per mint)
│       ├── solver.js           # Turnstile widget mounted + clicked over CDP
│       ├── cdp.js              # raw WebSocket + CDP client (RFC6455, no deps)
│       └── mailtrap.js         # Mailtrap inbound inboxes, one per account
├── examples/
│   ├── single-mint.js          # mint one account and print the key
│   └── campaign.js             # mint N accounts, then connect them
├── brand/
│   ├── logo.svg                # README banner
│   └── icon.svg                # app-style icon
├── i18n/                       # translations of the README
│   ├── README.id.md            # Bahasa Indonesia
│   ├── README.zh.md            # 简体中文
│   ├── README.ja.md            # 日本語
│   ├── README.es.md            # Español
│   └── README.de.md            # Deutsch
├── README.md                   # English (default)
├── LICENSE                     # MIT
└── package.json
```

## ⚠️ Notes

- Requirements: a **Mailtrap token** (verification inboxes) and a **Chrome with `--remote-debugging-port=9222`** (own Chrome, headful — a hidden tab behaves differently).
- Keys are proven with a real chat `200` before being saved; the record keeps every step (`signup`, `verify`, `actions`, `createKey`, `proof`).
- The keys file holds one `sk-codiv-…` per line; `create` resumes from whatever is already there.
- Accounts and keys are yours to keep; nothing is sent anywhere except codiv.ai, Mailtrap and (optionally) your 9Router.
- For personal/educational automation. Respect codiv.ai's, Mailtrap's and 9Router's terms of service.

## 📄 License

[MIT](LICENSE) © 2026 codiv-bulk-apikey contributors
