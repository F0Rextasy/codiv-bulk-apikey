<div align="center">

```
 ██████╗  ██████╗  ██████╗  ██╗ ██╗   ██╗
██╔════╝ ██╔═══██╗ ██╔══██╗ ██║ ██║   ██║
██║      ██║   ██║ ██║  ██║ ██║ ██║   ██║
██║      ██║   ██║ ██║  ██║ ██║ ╚██╗ ██╔╝
╚██████╗ ╚██████╔╝ ██████╔╝ ██║  ╚████╔╝
 ╚═════╝  ╚═════╝  ╚═════╝  ╚═╝   ╚═══╝
```

<img src="../brand/logo.svg" alt="codiv-bulk" width="150" />

# codiv-bulk-apikey

**批量创建 [codiv.ai](https://codiv.ai) 账号，为每个账号生成一个 `sk-codiv-…` API 密钥（每个账号 100M 免费输入 token），并将全部密钥注册到正在运行的 [9Router](https://9router.com) 实例 —— 端到端。零依赖。**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](../LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://api.codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-连接到-9router)
[![Transport](https://img.shields.io/badge/transport-HTTP%20%7C%20SOCKS5%20%7C%20CDP-0EA5E9.svg?style=for-the-badge)](#-传输方式)
[![Mailtrap](https://img.shields.io/badge/inbox-Mailtrap-22C55E.svg?style=for-the-badge)](https://mailtrap.io)
[![Languages](https://img.shields.io/badge/i18n-5%20languages-F59E0B.svg?style=for-the-badge)](#)

[English](../README.md) · [Bahasa Indonesia](README.id.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Deutsch](README.de.md)

</div>

---

## ✨ 功能特性

- 🔑 **批量账号 + 密钥** —— 通过 codiv.ai 自带的 dashboard 后端生成数百个 `sk-codiv-…` 密钥。
- 💰 **100M 免费输入 token** —— 每个账号自带 100M 免费输入 token。无需银行卡。
- 🔌 **9Router 连接器** —— 一次运行即可把每个密钥注册为 `codiv` 前缀下的 OpenAI 兼容连接。
- 🧠 **真实完成 Turnstile** —— 站点自己的 widget 挂载在 *你的* Chrome 的 `codiv.ai/signup` 页面上，并通过 CDP 点击。
- 🪶 **零依赖** —— 手写的 RFC6455 WebSocket + CDP 客户端。无需 `npm install`，无需构建步骤。
- ⏱️ **每账号约 80-115 秒** —— 一次 Turnstile 完成 + 一封验证邮件，端到端。
- ✅ **已验证的密钥** —— 每个密钥必须先应答一个真实的 chat `200` 才会被保存。
- 🌍 **5 种语言** —— EN、ID、ZH、JA、ES、DE。

## 🚀 快速开始

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

`create` 会统计密钥文件中已有的密钥并从那里继续，因此一次任务可以随时停下再重启而不丢失进度。

## 🛠 用法

```bash
codiv-bulk mint                     # create one account + key
codiv-bulk create --count 200       # campaign: mint N keys (resume-safe)
codiv-bulk verify                   # prove saved keys with a live chat call
codiv-bulk connect                  # register keys into 9Router
codiv-bulk list                     # list saved keys (masked)
codiv-bulk token                    # solve one Turnstile token (debug)
```

| 参数 | 说明 | 默认 |
| --- | --- | --- |
| `--count <n>` | 任务规模 | `200` |
| `--dir <name>` | `out/` 下每个 worker 的账号目录 | `codiv-accounts` |
| `--keys <file>` | 密钥文件 | `out/codiv-keys.txt` |
| `--pause <ms>` | 两次生成之间的间隔 | `5000` |
| `--out <file>` | 单次生成的记录 | `out/codiv-account.json` |
| `--log <file>` | 任务日志 | `out/codiv-batch.log` |
| `--cdp <url>` | Chrome DevTools 端点 | `http://127.0.0.1:9222` |
| `--proxy <url>` | 解题页面的出口（`socks5://`/`http://`） | 直连 |
| `--token <t>` | 一个手动 Turnstile token | — |
| `--attempts <n>` | 每次生成的解题尝试次数 | `2` |
| `--solver-cmd <cmd>` | 外部解题器（见下文） | — |
| `--mailtrap-token <t>` | Mailtrap API token | 环境变量 `MAILTRAP_TOKEN` |
| `--folder <name>` | Mailtrap 文件夹 | `codiv` |
| `--model <id>` | verify/connect 使用的模型 | `diffusiongemma-26b` |
| `--conc <n>` | verify 并发数 | `6` |
| `--router <url>` | 9Router 基础地址 | `http://localhost:20128` |
| `--router-password <pw>` | 9Router 面板密码 | `123456` |

## 🌐 传输方式

codiv.ai 用 Cloudflare **Turnstile** 保护注册流程，并发送验证链接，因此解题必须在真实浏览器中、从干净的出口 IP 完成：

- **通过 CDP 驱动 Chrome（默认）** —— 用 `--remote-debugging-port=9222` 启动你自己的 Chrome（有界面模式：隐藏标签页行为不同），再把 `--cdp` 指向它。承载 widget 的页面会在独立的浏览器上下文中创建。
- **代理出口** —— `--proxy socks5://…` 或 `http://…` 锁定*解题页面*的出口。Cloudflare 按出口 IP 对 widget 进行判定；数据中心线路能过 widget，但点击后会返回 `fail code 600010`。
- **外部解题器** —— `--solver-cmd "node my-solver.js"` 完全跳过 Chrome；每次尝试运行一次，环境变量中带有 `CODIV_SITEKEY` 和 `CODIV_URL`，token 即 stdout 最后一行非空内容。`--token <t>` 为单次生成提供一个手动 token。
- **直接请求** —— 除解题之外的一切都是普通 HTTPS：Mailtrap 的 API、better-auth 端点以及 `https://api.codiv.ai/v1`。

收件通道：每个账号一个全新的 [Mailtrap](https://mailtrap.io) 入站收件箱，通过 `--mailtrap-token` / `MAILTRAP_TOKEN` 用其公开 API 创建。

## 🔌 连接到 9Router

9Router 是一个自托管的、兼容 OpenAI 的路由器：

```bash
npm install -g 9router && 9router        # dashboard on http://localhost:20128
```

用一条命令注册你所有的密钥（创建 `codiv` provider-node 并挂载每个密钥）：

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

像调用任何 OpenAI 端点一样调用它：

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"codiv/diffusiongemma-26b","messages":[{"role":"user","content":"hi"}]}'
```


## 🔌 连接到 OmniRoute

OmniRoute 是一个自托管的、兼容 OpenAI 的路由器：

```bash
npm install -g omniroute && omniroute        # dashboard on http://localhost:20128
```

用一条命令注册你所有的密钥（创建 `codiv` provider-node 并挂载每个密钥）：

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<omniroute client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

像调用任何 OpenAI 端点一样调用它：

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"codiv/diffusiongemma-26b","messages":[{"role":"user","content":"hi"}]}'
```
## 🧠 可用模型

| 模型 | 在 9Router 中调用 | 状态 |
| --- | --- | --- |
| diffusiongemma-26b | `codiv/diffusiongemma-26b` | ✅ `200` —— 每次生成都会针对它验证 |

密钥由 dashboard 的 server action 生成，费用则由账号自带的 100M 免费输入 token 承担，因此 `diffusiongemma-26b` 是 `verify` 和 `connect` 的默认模型；`--model <id>` 可指定其他模型。刷新路由器端的列表：

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
```

## 🔁 并行任务

给每个 worker 分配独立的 `--dir` 和 `--keys`：两个 worker 共用一个目录会写入同一个 `<start+i>.json` 槽位，每冲突一次就丢一条记录（实测）。

```bash
node src/cli.js create --count 65 --dir w1 --keys out/codiv-keys-w1.txt &
node src/cli.js create --count 65 --dir w2 --keys out/codiv-keys-w2.txt &
node src/cli.js create --count 65 --dir w3 --keys out/codiv-keys-w3.txt &
wait
```

## 🧩 外部解题器

如果你已经有 Turnstile 解题器，可以跳过内置的 Chrome 路径：

```bash
codiv-bulk mint --solver-cmd "node my-solver.js"   # or --token <t> for one manual token
```

`--solver-cmd` 每次尝试运行一次，环境变量中带有 `CODIV_SITEKEY` 和 `CODIV_URL`，token 即 stdout 最后一行非空内容。

## 📚 作为库使用

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

## ⚙️ 工作原理

1. **Maildrop** —— 每个账号新建一个 Mailtrap 收件箱用于接收验证邮件。
2. **Turnstile** —— 站点自己的 widget（sitekey `0x4AAAAAAE7hE0DIArlj6rXX`）挂载在你 Chrome 的 `codiv.ai/signup` 页面上并通过 CDP 点击；token 通过 `x-captcha-response` 头回传。
3. **注册** —— `POST /api/auth/sign-up/email`（better-auth）。
4. **验证** —— 从收件箱中取出验证链接；better-auth 在命中验证时会自动登录，因此它的 `Set-Cookie` 就是会话。
5. **创建密钥** —— dashboard 的 Next.js server action `createKey`（其 id 每次运行都从已部署的 chunk 中重新发现，因为重新部署会轮换它们）在 RSC 应答中返回新密钥。
6. **验证可用** —— 对 `https://api.codiv.ai/v1`（`diffusiongemma-26b`）的真实 chat 调用必须返回 `200`，该密钥才计入。
7. **保存** —— 密钥文件中每行一个 `sk-codiv-…`；完整记录写入对应槽位的账号 JSON。

### 实测行为

- 一个账号 = **100M 免费输入 token**；无需银行卡。
- 生成成本 ≈ **每账号 80-115 秒**（一次 Turnstile 解题 + 一封验证邮件）。
- 每个 worker 的 65 密钥批次可持续完成 **约 55 次成功生成**；失败模式是每次生成 **420 秒** 的超时，而不是写入不完整。
- Turnstile token 与解题所用的出口绑定；Cloudflare 会以 `VERIFICATION_FAILED` 拒绝一部分新 token，生成时会用全新的解题结果重试（最多 4 次尝试）。
- 数据中心出口能过 widget，但挑战在点击后返回 `fail code 600010` —— 把 `--proxy` 指向更像住宅的出口，并预期某个出口在重度使用后数小时内就会翻转。

## 📁 目录结构

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

## ⚠️ 说明

- 前提条件：一个 **Mailtrap token**（验证收件箱）和一个**带 `--remote-debugging-port=9222` 的 Chrome**（你自己的 Chrome，有界面模式 —— 隐藏标签页行为不同）。
- 密钥在保存前会用真实 chat `200` 验证；记录会保存每一步（`signup`、`verify`、`actions`、`createKey`、`proof`）。
- 密钥文件每行保存一个 `sk-codiv-…`；`create` 会从已有内容继续。
- 账号和密钥归你所有；除了 codiv.ai、Mailtrap 和（可选的）你的 9Router，不会向任何地方发送数据。
- 仅供个人/教育用途的自动化。请遵守 codiv.ai、Mailtrap 和 9Router 的服务条款。

## 📄 许可证

[MIT](../LICENSE) © 2026 codiv-bulk-apikey contributors
