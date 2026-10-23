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

**批量创建 codiv.ai 账户并自动生成 API 密钥 — 兼容 OpenAI 的推理（`sk-codiv-…`，每个账户 1 亿免费输入 token）+ 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-1-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题反馈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 免费额度 — 你能获得多少

**每个新的 codiv.ai 账户都带有 1 亿免费输入 token — 无需银行卡。**

| 项目 | 值 |
| --- | --- |
| 额度 | 每个账户 **100,000,000 免费输入 token** |
| 需要银行卡 | **否** |
| 注册 | 通过 `POST /api/auth/sign-up/email`（better-auth）使用邮箱 + 密码，邮箱链接从 Mailtrap 收件箱验证 |
| 验证码 | 注册时的 Cloudflare **Turnstile** — 在**你自己的有头 Chrome** 中通过 CDP 解决，或使用你已有的外部求解器 |
| 密钥格式 | `sk-codiv-…` |
| 可扩展的单位 | **一个账户 = 一个密钥** → `--count N` 实际上就是“N 个免费账户” |

> 💡 额度由 codiv.ai 设定，可能会变化。你可以随时重新验证自己的文件：

```bash
node src/cli.js verify      # every saved key answers a live chat 200 or is reported
```

> 💡 免费额度由 codiv.ai 设定，可能会变化。请在 [codiv.ai](https://codiv.ai) 查看实时数字 — 并让工具自身的关卡来决定：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 模型 — 全部 1 个

`POST https://api.codiv.ai/v1/chat/completions` 是本工具用来验证每个密钥的接口。

| 模型 | 在 9Router 中的调用方式 | 状态 |
| --- | --- | --- |
| `diffusiongemma-26b` | `codiv/diffusiongemma-26b` | ✅ `200` — 每次铸造都以此模型验证 |

密钥由仪表盘自身的服务器操作铸造，账户的 1 亿免费输入 token 为其付费，因此 `diffusiongemma-26b` 是 `verify` 和 `connect` 的默认模型；`--model <id>` 可指定另一个。刷新路由器端的列表：

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
```

## 🧪 如何使用 API

基础 URL 是 **`https://api.codiv.ai/v1`** — 兼容 OpenAI，因此任何支持 OpenAI 的工具都能使用（SDK、Cursor、OpenCode、Kilo Code 等）。

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

## ⚡ 一条命令

```bash
node src/cli.js --count N      # mint N accounts + keys — the captcha is solved automatically
node src/cli.js --dry          # print the resolved plan: writes nothing, sends nothing
```

`--auto` 是默认值：内嵌的 `src/solver.js` 会在你控制的 Chrome 中挂载 codiv.ai 自己的 Turnstile 组件（`--cdp`，或用 `--remote-debugging-port=9222` 启动它）并交回 token — 一条命令，无需其他操作。`--no-auto` 会关闭内嵌求解；高级逃生通道适用于已经拥有求解器的操作者，记录在 `ADVANCED.md` 中。

> ⚠️ **条款与账户风险。** 自动化服务提供商可能违反其服务条款，并导致账户或 IP 被封禁。你在自己的机器上、对自己拥有的账户运行此工具，风险自负；该工具只驱动网站自身的注册页面，绝不绕过付费关卡。在大规模活动前请阅读提供商的服务条款。

## 🛠 快速开始

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

`create` 会统计密钥文件中已有的密钥并从那里继续，因此活动可以停止并重启而不会丢失工作。密钥写入 `out/codiv-keys.txt`，每行一个；每个账户的完整记录写入 `out/codiv-accounts/`。

### 🖱️ 启动器

`node src/cli.js` 会打印 CODIV 横幅和任务列表。任务包括 `mint`（按需创建一个账户）、`create`（活动）、`verify`、`connect`、`list` 和 `token`（为调试解决单个 Turnstile token）。标志以 `--name value` 方式读取，因此没有任何内容隐藏在配置文件后面。

## ✅ 已验证可用 — 每个密钥都经过测试

> **质量关卡。** 这里的每个密钥在写入 `keys.txt` 之前都通过了实时 `chat-200`
> （绝不交付失效密钥）。路由器组合在模型层面遵循同样的规则：只有当模型
> 响应 `chat-200` 且能调用工具时，条目才会被添加 — 不支持工具的模型、
> 失效的密钥或失效的提供商都会被丢弃而非添加。适用于 **9Router 和 OmniRoute**。

| 检查 | 结果 |
| --- | --- |
| 账户创建 | 在全新的 Mailtrap 收件箱上执行 `POST /api/auth/sign-up/email`（better-auth） |
| 邮箱验证 | 验证链接从收件箱中提取；better-auth 在验证命中时自动登录，因此其 `Set-Cookie` 即为会话 |
| 密钥创建 | 仪表盘的 Next.js 服务器操作 `createKey`（每次运行时从已部署的 chunk 中重新发现 id，因为重新部署会轮换它们）在其 RSC 响应中返回新密钥 |
| 实时验证 | `POST https://api.codiv.ai/v1/chat/completions`（`diffusiongemma-26b`）必须响应 `200`，密钥才被计入 |
| 未通过聊天检查的密钥 | 绝不写入 — 账户在其每个槽位的 JSON 中保持可恢复 |

在真实活动中测得：一个账户 = **1 亿免费输入 token**；一次铸造耗时约 **80-115 秒**（一次 Turnstile 求解 + 一封验证邮件），且 Turnstile token 绑定到求解出口，因此被拒绝的 token 会用全新的求解重试（最多 4 次尝试）。

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: codiv.ai page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.codiv.ai/v1/chat/completions → real content = the key is live
```

| 步骤 | 调用 | 备注 |
| --- | --- | --- |
| 收件箱 | Mailtrap 公共 API | 每个账户一个全新的入站收件箱 |
| Turnstile | 网站自身的组件（sitekey `0x4AAAAAAE7hE0DIArlj6rXX`）挂载在你的 Chrome 中并通过 CDP 点击 | token 作为 `x-captcha-response` 头返回 |
| 注册 | `POST /api/auth/sign-up/email` | better-auth |
| 验证 | 来自收件箱的验证链接 | 该次命中的 `Set-Cookie` 即为会话 |
| 密钥 | 仪表盘服务器操作 `createKey` | 明文密钥仅返回一次 |
| 验证 | `POST https://api.codiv.ai/v1/chat/completions` | 密钥保存前必须实时 `200` |

## ⚙️ CLI 选项

```bash
node src/cli.js mint                     # one account + key
node src/cli.js create --count 200       # campaign: mint N keys (resume-safe)
node src/cli.js verify                   # prove saved keys with a live chat call
node src/cli.js connect                  # register keys into 9Router
node src/cli.js list                     # list saved keys (masked)
node src/cli.js token                    # solve one Turnstile token (debug)
```

| 标志 | 含义 | 默认值 |
| --- | --- | --- |
| `--count <n>` | 活动规模 | `200` |
| `--dir <name>` | `out/` 下每个工作线程的账户目录 | `codiv-accounts` |
| `--keys <file>` | 密钥文件 | `out/codiv-keys.txt` |
| `--pause <ms>` | 铸造之间的延迟 | `5000` |
| `--cdp <url>` | Chrome DevTools 端点 | `http://127.0.0.1:9222` |
| `--proxy <url>` | 求解页面出口（`socks5://` / `http://`） | 直连 |
| `--solver-cmd <cmd>` | 外部 Turnstile 求解器 | — |
| `--auto` | 使用内嵌的 `src/solver.js` 解决验证码 | 开启（默认） |
| `--no-auto` | 禁用内嵌求解器 | 关闭 |
| `--dry` | 打印解析后的计划，不写入任何内容，不发送任何内容 | 关闭 |
| `--mailtrap-token <t>` | Mailtrap API token | `MAILTRAP_TOKEN` 环境变量 |
| `--model <id>` | 用于 verify / connect 的模型 | `diffusiongemma-26b` |
| `--conc <n>` | 验证并发数 | `6` |
| `--router <url>` | 9Router 基础地址 | `http://localhost:20128` |
| `--router-password <pw>` | 9Router 仪表盘密码 | `123456` |

**并行活动：** 为每个工作线程提供自己的 `--dir` 和 `--keys`；两个工作线程共享一个目录会写入同一个槽位，每次冲突会丢失一条记录（实测）。

## 🛰️ 在代理后面

codiv.ai 使用 Cloudflare Turnstile 保护注册并发送验证链接，因此求解必须在来自干净出口 IP 的真实浏览器中进行：

- **通过 CDP 的 Chrome（默认）** — 用 `--remote-debugging-port=9222` 启动你自己的有头 Chrome，并将 `--cdp` 指向它。承载组件的页面在其自己的浏览器上下文中创建。
- **代理出口** — `--proxy socks5://…` 或 `http://…` 固定*求解页面*的出口。Cloudflare 按出口 IP 审核组件；数据中心线路能通过组件，但在点击后返回 `fail code 600010`，因此请将其指向住宅类出口，并预期在大量使用下某个出口会在数小时内翻转。
- **外部求解器** — `--solver-cmd "node my-solver.js"` 完全跳过 Chrome；它在每次尝试时运行一次，环境中带有 `CODIV_SITEKEY` 和 `CODIV_URL`，token 是 stdout 最后一行非空内容。
- **直接请求** — 除求解外的所有内容都是普通 HTTPS：Mailtrap 的 API、better-auth 端点以及 `https://api.codiv.ai/v1`。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `out/codiv-keys.txt` | 每行一个经过实时验证的 `sk-codiv-…` — 已被 git 忽略 |
| `out/codiv-accounts/<slot>.json` | 每个账户的完整记录（`signup`、`verify`、`actions`、`createKey`、`proof`）— 已被 git 忽略 |
| `out/codiv-batch.log` | 活动日志 — 已被 git 忽略 |
| `proxies.txt` | 你的出口，每行一个 — 已被 git 忽略 |
| `src/cli.js` · `src/launcher.js` | 任务运行器和 CODIV 横幅 |
| `src/connect-9router.js` | 将保存的密钥注册为 9Router 连接 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管、兼容 OpenAI 的路由器（`npm install -g 9router && 9router`，仪表盘位于 `http://localhost:20128`）。一次性注册所有密钥：

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

标志：`--router http://localhost:20128`、`--router-password 123456`、`--keys out/codiv-keys.txt`、`--model diffusiongemma-26b`。节点本身以前缀 `codiv` 和基础 URL `https://api.codiv.ai/v1` 创建。模型随后以 `codiv/<model id>` 形式提供，并在所有密钥之间负载均衡。

## 🔌 连接到 OmniRoute

[OmniRoute](https://omniroute.online) 是一个自托管、兼容 OpenAI 的路由器（`npm install -g omniroute && omniroute`，仪表盘位于 `http://localhost:20128`）。一次性注册所有密钥：

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<omniroute client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

标志：`--router http://localhost:20128`、`--router-password 123456`、`--keys out/codiv-keys.txt`、`--model diffusiongemma-26b`。节点本身以前缀 `codiv` 和基础 URL `https://api.codiv.ai/v1` 创建。模型随后以 `codiv/<model id>` 形式提供，并在所有密钥之间负载均衡。
## 🔑 一个密钥能给你什么

| | |
| --- | --- |
| 🏢 提供商 | **codiv.ai** — [codiv.ai](https://codiv.ai) |
| 🎁 提供商提供什么 | 每个账户 1 亿免费输入 token — 每个密钥一个账户 |
| 🔑 一个密钥能给你什么 | 一个 API 密钥，作用域为其自己的账户：下方端点上的 1 个模型 id，受你计划的限制。配额存在于**账户**上，这正是此工具为每个密钥创建一个账户的原因 |
| 🌐 API 形态 | 兼容 OpenAI：`POST https://api.codiv.ai/v1/chat/completions` |
| 🔒 你的数据 | 仅联系 codiv.ai 和你配置的收件箱后端；密钥保留在你的机器上 |

## 🐞 问题反馈

如果 codiv.ai 更改其注册形态、Turnstile 组件或 `createKey` 操作，工具会在该步骤停止并说明原因。请**[提交 issue](../../issues)**，附上你运行的命令和确切输出；欢迎 PR。

## 📄 许可证

MIT © 2026 — 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 codiv-bulk-apikey contributors

</div>