<div align="center">

```
 ██████╗ ██████╗ ██████╗ ██╗██╗   ██╗
██╔════╝██╔═══██╗██╔══██╗██║██║   ██║
██║     ██║   ██║██║  ██║██║██║   ██║
██║     ██║   ██║██║  ██║██║╚██╗ ██╔╝
╚██████╗╚██████╔╝██████╔╝██║ ╚████╔╝
 ╚═════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝
```

# codiv-bulk-apikey

**Bulk-create codiv.ai accounts with auto-generated API keys — OpenAI-compatible inference (`sk-codiv-…`, 100M free input tokens per account) + 9Router connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-1-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 Free tier — how much you get

**Every new codiv.ai account carries 100M free input tokens — no card.**

| What | Value |
| --- | --- |
| Allowance | **100,000,000 free input tokens** per account |
| Card required | **No** |
| Sign-up | e-mail + password through `POST /api/auth/sign-up/email` (better-auth), e-mail link verified from a Mailtrap inbox |
| Captcha | Cloudflare **Turnstile** at sign-up — solved in **your own headful Chrome** over CDP, or by an external solver you already own |
| Key shape | `sk-codiv-…` |
| The unit that scales | **one account = one key** → `--count N` is really "N free accounts" |

> 💡 The allowance is set by codiv.ai and can change. Re-prove your own file at any time:

```bash
node src/cli.js verify      # every saved key answers a live chat 200 or is reported
```

> 💡 The free tier is set by codiv.ai and can change. Check the live numbers at [codiv.ai](https://codiv.ai) — and let the tool's own gate decide:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Models — all 1 of them

`POST https://api.codiv.ai/v1/chat/completions` is the surface this tool proves every key against.

| Model | Call as in 9Router | Status |
| --- | --- | --- |
| `diffusiongemma-26b` | `codiv/diffusiongemma-26b` | ✅ `200` — the model every mint is proven against |

The key is minted from the dashboard's own server action and the account's 100M free input tokens pay for it, so `diffusiongemma-26b` is the default for both `verify` and `connect`; `--model <id>` pins another one. Refresh the router-side list with:

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
```

## 🧪 How to use the API

The base URL is **`https://api.codiv.ai/v1`** — OpenAI-compatible, so anything that speaks OpenAI works (SDKs, Cursor, OpenCode, Kilo Code, …).

```bash
curl https://api.codiv.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-codiv-…" \
  -H "Content-Type: application/json" \
  -d '{"model":"diffusiongemma-26b","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

```python
from openai import OpenAI
client = OpenAI(base_url="https://api.codiv.ai/v1", api_key="sk-codiv-…")
print(client.chat.completions.create(model="diffusiongemma-26b",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## ⚡ One command

```bash
node src/cli.js --count N      # mint N accounts + keys — the captcha is solved automatically
node src/cli.js --dry          # print the resolved plan: writes nothing, sends nothing
```

`--auto` is the default: the embedded `src/solver.js` mounts codiv.ai's own Turnstile widget in the Chrome you control (`--cdp`, or start it with `--remote-debugging-port=9222`) and hands the token back — one command, nothing else to run. `--no-auto` turns the embedded solve off; the advanced escape hatches are for operators who already own a solver and are documented in `ADVANCED.md`.

> ⚠️ **Terms & account risk.** Automating a provider can violate its Terms of Service and get accounts or IPs banned. You run this on accounts you own, from your own machine, at your own risk; the tool only drives the site's own sign-up page and never bypasses a paid gate. Read the provider's ToS before a large campaign.

## 🛠 Quick start

```bash
# clone or fork this repository, then:
cd codiv-bulk-apikey

# 1) verification inboxes (Mailtrap dashboard → Settings → API Tokens)
export MAILTRAP_TOKEN=…

# 2) the Turnstile solve drives your own Chrome (headful)
#    chrome.exe --remote-debugging-port=9222

# 3) go
node src/cli.js mint                    # one account + key, end to end
node src/cli.js create --count 200      # campaign (resume-safe)
node src/cli.js verify                  # prove the saved keys with a live chat call
node src/cli.js connect                 # register the keys into 9Router
```

`create` counts the keys already in the keys file and resumes from there, so a campaign can be stopped and restarted without losing work. Keys land in `out/codiv-keys.txt`, one per line; the full record of each account lands in `out/codiv-accounts/`.

### 🖱️ The launcher

`npm start` (or `node src/launcher.js`) opens the menu; item **1) Mint keys** asks one question — how many keys — and runs the campaign with the captcha solved automatically (`--auto`). No token, captcha or proxy question: `proxies.txt` next to the CLI is used automatically when it exists, otherwise the tool goes direct. `node src/cli.js` prints the CODIV banner and the task list behind it — `mint` (one account, on demand), `create` (campaign), `verify`, `connect`, `list` and `token` (solve a single Turnstile token for debugging). Flags are read with `--name value`, so nothing is hidden behind a config file.

## ✅ Verified working — every key is tested

> **Quality gates.** Every key here passed a live `chat-200` before it was written to `keys.txt`
> (dead keys are never shipped). Router combos follow the same rule at the model level: an entry is
> added **only if the model answers `chat-200` and can call tools** — a model without tool support,
> a dead key or a dead provider is dropped instead of added. Works with **9Router and OmniRoute**.

| Check | Result |
| --- | --- |
| account creation | `POST /api/auth/sign-up/email` (better-auth) on a fresh Mailtrap inbox |
| e-mail verification | the verification link is pulled from the inbox; better-auth auto-signs-in on the verify hit, so its `Set-Cookie` is the session |
| key creation | the dashboard's Next.js server action `createKey` (ids re-discovered from the deployed chunks on every run, because redeploys rotate them) returns the fresh key in its RSC answer |
| live proof | `POST https://api.codiv.ai/v1/chat/completions` (`diffusiongemma-26b`) must answer `200` before the key counts |
| a key that fails the chat check | never written — the account stays recoverable in its per-slot JSON |

Measured on real campaigns: one account = **100M free input tokens**; a mint costs ≈ **80-115 s** (one Turnstile solve + one verification mail), and Turnstile tokens are pinned to the solving exit, so a rejected token is retried with a brand-new solve (up to 4 attempts).

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: codiv.ai page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.codiv.ai/v1/chat/completions → real content = the key is live
```

| Step | Call | Notes |
| --- | --- | --- |
| inbox | Mailtrap public API | a fresh inbound inbox per account |
| Turnstile | the site's own widget (sitekey `0x4AAAAAAE7hE0DIArlj6rXX`) mounted in your Chrome and clicked over CDP | the token goes back as the `x-captcha-response` header |
| sign-up | `POST /api/auth/sign-up/email` | better-auth |
| verify | verification link from the inbox | the `Set-Cookie` on that hit is the session |
| key | dashboard server action `createKey` | plaintext key returned once |
| prove | `POST https://api.codiv.ai/v1/chat/completions` | live `200` required before the key is saved |

## ⚙️ CLI options

```bash
node src/cli.js mint                     # one account + key
node src/cli.js create --count 200       # campaign: mint N keys (resume-safe)
node src/cli.js verify                   # prove saved keys with a live chat call
node src/cli.js connect                  # register keys into 9Router
node src/cli.js list                     # list saved keys (masked)
node src/cli.js token                    # solve one Turnstile token (debug)
```

| Flag | Meaning | Default |
| --- | --- | --- |
| `--count <n>` | campaign size | `200` |
| `--dir <name>` | per-worker accounts dir under `out/` | `codiv-accounts` |
| `--keys <file>` | keys file | `out/codiv-keys.txt` |
| `--pause <ms>` | delay between mints | `5000` |
| `--cdp <url>` | Chrome DevTools endpoint | `http://127.0.0.1:9222` |
| `--proxy <url>` | solve-page exit (`socks5://` / `http://`) | direct |
| `--solver-cmd <cmd>` | external Turnstile solver | — |
| `--auto` | solve the captcha with the embedded `src/solver.js` | on (default) |
| `--no-auto` | disable the embedded solver | off |
| `--dry` | print the resolved plan, write nothing, send nothing | off |
| `--mailtrap-token <t>` | Mailtrap API token | `MAILTRAP_TOKEN` env |
| `--model <id>` | model for verify / connect | `diffusiongemma-26b` |
| `--conc <n>` | verify concurrency | `6` |
| `--router <url>` | 9Router base | `http://localhost:20128` |
| `--router-password <pw>` | 9Router dashboard password | `123456` |

**Parallel campaigns:** give every worker its own `--dir` and `--keys`; two workers sharing one directory write the same slot and lose one record per collision (measured).

## 🛰️ Behind a proxy

codiv.ai guards sign-up with Cloudflare Turnstile and mails a verification link, so the solve must happen in a real browser from a clean exit IP:

- **Chrome over CDP (default)** — start your own headful Chrome with `--remote-debugging-port=9222` and point `--cdp` at it. The page carrying the widget is created in its own browser context.
- **Proxy exit** — `--proxy socks5://…` or `http://…` pins the *solve page's* exit. Cloudflare moderates the widget per exit IP; a datacenter line passes the widget but answers `fail code 600010` after the click, so point it at a residential-ish exit and expect a given exit to flip within hours under heavy use.
- **External solver** — `--solver-cmd "node my-solver.js"` skips Chrome entirely; it runs once per attempt with `CODIV_SITEKEY` and `CODIV_URL` in the environment, and the token is the last non-empty stdout line.
- **Direct fetch** — everything except the solve is plain HTTPS: Mailtrap's API, the better-auth endpoints and `https://api.codiv.ai/v1`.

## 📄 Files

| Path | Contents |
| --- | --- |
| `out/codiv-keys.txt` | one live-verified `sk-codiv-…` per line — git-ignored |
| `out/codiv-accounts/<slot>.json` | the full record per account (`signup`, `verify`, `actions`, `createKey`, `proof`) — git-ignored |
| `out/codiv-batch.log` | campaign log — git-ignored |
| `proxies.txt` | your exits, one per line — git-ignored |
| `src/cli.js` · `src/launcher.js` | the task runner and the CODIV banner |
| `src/connect-9router.js` | registers the saved keys as 9Router connections |

## 🔌 Connect to 9Router

[9Router](https://9router.com) is a self-hosted, OpenAI-compatible router (`npm install -g 9router && 9router`, dashboard on `http://localhost:20128`). Register every key in one pass:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Flags: `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. The node itself is created with prefix `codiv` and base URL `https://api.codiv.ai/v1`. Models are then served as `codiv/<model id>` and load-balanced across every key.

## 🔌 Connect to OmniRoute

[OmniRoute](https://omniroute.online) is a self-hosted, OpenAI-compatible router (`npm install -g omniroute && omniroute`, dashboard on `http://localhost:20128`). Register every key in one pass:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<omniroute client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Flags: `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. The node itself is created with prefix `codiv` and base URL `https://api.codiv.ai/v1`. Models are then served as `codiv/<model id>` and load-balanced across every key.
## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **codiv.ai** — [codiv.ai](https://codiv.ai) |
| 🎁 What the provider gives | 100M free input tokens per account — one account per key |
| 🔑 What one key gets you | one API key scoped to its own account: the 1 model ids on the endpoint below, at your plan's limits. The quota lives on the **account**, which is exactly why this tool creates one account per key |
| 🌐 API shape | OpenAI-compatible: `POST https://api.codiv.ai/v1/chat/completions` |
| 🔒 Your data | only codiv.ai and the inbox backend you configure are contacted; keys stay on your machine |

## 🐞 Issues

If codiv.ai changes its sign-up shape, the Turnstile widget or the `createKey` action, the tool stops at that step and says so. **[Open an issue](../../issues)** with the command you ran and the exact output; PRs are welcome.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 codiv-bulk-apikey contributors

</div>
