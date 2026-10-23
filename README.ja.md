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

**codiv.ai アカウントを自動生成された API キーとともに一括作成 — OpenAI 互換の推論（`sk-codiv-…`、アカウントごとに 1 億の無料入力トークン）+ 9Router コネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-1-of-them) · [🧪 API の使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 イシュー](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 無料枠 — どれだけ得られるか

**新しい codiv.ai アカウントには、カード不要で 1 億の無料入力トークンが付きます。**

| 項目 | 値 |
| --- | --- |
| 割り当て | アカウントごとに **100,000,000 の無料入力トークン** |
| カード要否 | **不要** |
| サインアップ | `POST /api/auth/sign-up/email`（better-auth）経由のメールアドレス + パスワード、メール内リンクは Mailtrap 受信トレイから検証 |
| キャプチャ | サインアップ時の Cloudflare **Turnstile** — **あなた自身のヘッドフル Chrome** で CDP 経由で解決するか、すでに所有している外部ソルバーで解決 |
| キーの形式 | `sk-codiv-…` |
| スケールする単位 | **1 アカウント = 1 キー** → `--count N` は実質「N 個の無料アカウント」 |

> 💡 割り当ては codiv.ai が設定するもので、変更される可能性があります。いつでも自分のファイルを再検証できます:

```bash
node src/cli.js verify      # every saved key answers a live chat 200 or is reported
```

> 💡 無料枠は codiv.ai が設定するもので、変更される可能性があります。最新の数値は [codiv.ai](https://codiv.ai) で確認してください — そしてツール自身のゲートに判断させてください:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — そのすべて（1 個）

`POST https://api.codiv.ai/v1/chat/completions` は、このツールがすべてのキーを検証する対象のサーフェスです。

| モデル | 9Router での呼び出し方 | ステータス |
| --- | --- | --- |
| `diffusiongemma-26b` | `codiv/diffusiongemma-26b` | ✅ `200` — すべてのミントがこれに対して検証されるモデル |

キーはダッシュボード自身のサーバーアクションから発行され、アカウントの 1 億の無料入力トークンがその費用を賄うため、`diffusiongemma-26b` は `verify` と `connect` の両方のデフォルトです。`--model <id>` で別のモデルを固定できます。ルーター側のリストを更新するには:

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
```

## 🧪 API の使い方

ベース URL は **`https://api.codiv.ai/v1`** です — OpenAI 互換なので、OpenAI を話せるものなら何でも動作します（SDK、Cursor、OpenCode、Kilo Code など）。

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

## ⚡ コマンド 1 つ

```bash
node src/cli.js --count N      # mint N accounts + keys — the captcha is solved automatically
node src/cli.js --dry          # print the resolved plan: writes nothing, sends nothing
```

`--auto` がデフォルトです。組み込みの `src/solver.js` が、あなたが制御する Chrome（`--cdp`、または `--remote-debugging-port=9222` で起動）内に codiv.ai 自身の Turnstile ウィジェットをマウントし、トークンを返します — コマンド 1 つで、他に実行するものはありません。`--no-auto` は組み込みの解決をオフにします。高度なエスケープハッチは、すでにソルバーを所有しているオペレーター向けで、`ADVANCED.md` に記載されています。

> ⚠️ **利用規約とアカウントのリスク。** プロバイダーの自動化は、その利用規約に違反し、アカウントや IP が禁止される可能性があります。これはあなたが所有するアカウントに対して、あなた自身のマシンから、あなた自身の責任で実行するものです。ツールはサイト自身のサインアップページを操作するだけで、有料ゲートを回避することは決してありません。大規模なキャンペーンの前に、プロバイダーの利用規約をお読みください。

## 🛠 クイックスタート

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

`create` はキーファイルにすでにあるキーを数え、そこから再開するので、キャンペーンを停止して再起動しても作業を失いません。キーは `out/codiv-keys.txt` に 1 行に 1 つずつ保存されます。各アカウントの完全な記録は `out/codiv-accounts/` に保存されます。

### 🖱️ ランチャー

`node src/cli.js` は CODIV バナーとタスクリストを表示します。タスクは `mint`（オンデマンドで 1 アカウント）、`create`（キャンペーン）、`verify`、`connect`、`list`、`token`（デバッグ用に単一の Turnstile トークンを解決）です。フラグは `--name value` で読み取られるので、設定ファイルの背後に隠されているものはありません。

## ✅ 検証済みで動作 — すべてのキーがテストされています

> **品質ゲート。** ここにあるすべてのキーは、`keys.txt` に書き込まれる前にライブの `chat-200` を通過しています
> （死んだキーは決して出荷されません）。ルーターのコンボもモデルレベルで同じルールに従います: エントリは
> **モデルが `chat-200` に応答し、ツールを呼び出せる場合にのみ**追加されます — ツールサポートのないモデル、
> 死んだキー、死んだプロバイダーは追加されずに破棄されます。**9Router と OmniRoute** で動作します。

| チェック | 結果 |
| --- | --- |
| アカウント作成 | 新しい Mailtrap 受信トレイ上での `POST /api/auth/sign-up/email`（better-auth） |
| メール検証 | 検証リンクが受信トレイから取得されます。better-auth は検証ヒット時に自動サインインするため、その `Set-Cookie` がセッションになります |
| キー作成 | ダッシュボードの Next.js サーバーアクション `createKey`（ID は再デプロイでローテーションするため、毎回デプロイされたチャンクから再発見されます）が、その RSC 応答で新しいキーを返します |
| ライブ証明 | `POST https://api.codiv.ai/v1/chat/completions`（`diffusiongemma-26b`）がキーとしてカウントされる前に `200` を返す必要があります |
| チャットチェックに失敗したキー | 決して書き込まれません — アカウントはスロットごとの JSON で復元可能なままです |

実際のキャンペーンで測定: 1 アカウント = **1 億の無料入力トークン**、1 回のミントのコストは約 **80〜115 秒**（Turnstile の解決 1 回 + 検証メール 1 通）、Turnstile トークンは解決した出口に固定されるため、拒否されたトークンはまったく新しい解決で再試行されます（最大 4 回）。

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: codiv.ai page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.codiv.ai/v1/chat/completions → real content = the key is live
```

| ステップ | 呼び出し | 備考 |
| --- | --- | --- |
| 受信トレイ | Mailtrap パブリック API | アカウントごとに新しい受信トレイ |
| Turnstile | サイト自身のウィジェット（sitekey `0x4AAAAAAE7hE0DIArlj6rXX`）をあなたの Chrome にマウントし、CDP 経由でクリック | トークンは `x-captcha-response` ヘッダーとして返されます |
| サインアップ | `POST /api/auth/sign-up/email` | better-auth |
| 検証 | 受信トレイからの検証リンク | そのヒット時の `Set-Cookie` がセッションです |
| キー | ダッシュボードのサーバーアクション `createKey` | プレーンテキストのキーが一度だけ返されます |
| 証明 | `POST https://api.codiv.ai/v1/chat/completions` | キーが保存される前にライブの `200` が必要です |

## ⚙️ CLI オプション

```bash
node src/cli.js mint                     # one account + key
node src/cli.js create --count 200       # campaign: mint N keys (resume-safe)
node src/cli.js verify                   # prove saved keys with a live chat call
node src/cli.js connect                  # register keys into 9Router
node src/cli.js list                     # list saved keys (masked)
node src/cli.js token                    # solve one Turnstile token (debug)
```

| フラグ | 意味 | デフォルト |
| --- | --- | --- |
| `--count <n>` | キャンペーンサイズ | `200` |
| `--dir <name>` | `out/` 配下のワーカーごとのアカウントディレクトリ | `codiv-accounts` |
| `--keys <file>` | キーファイル | `out/codiv-keys.txt` |
| `--pause <ms>` | ミント間の遅延 | `5000` |
| `--cdp <url>` | Chrome DevTools エンドポイント | `http://127.0.0.1:9222` |
| `--proxy <url>` | 解決ページの出口（`socks5://` / `http://`） | 直接接続 |
| `--solver-cmd <cmd>` | 外部 Turnstile ソルバー | — |
| `--auto` | 組み込みの `src/solver.js` でキャプチャを解決 | オン（デフォルト） |
| `--no-auto` | 組み込みソルバーを無効化 | オフ |
| `--dry` | 解決されたプランを表示、何も書き込まず、何も送信しない | オフ |
| `--mailtrap-token <t>` | Mailtrap API トークン | `MAILTRAP_TOKEN` 環境変数 |
| `--model <id>` | verify / connect 用のモデル | `diffusiongemma-26b` |
| `--conc <n>` | verify の並行数 | `6` |
| `--router <url>` | 9Router ベース | `http://localhost:20128` |
| `--router-password <pw>` | 9Router ダッシュボードのパスワード | `123456` |

**並列キャンペーン:** 各ワーカーに独自の `--dir` と `--keys` を与えてください。1 つのディレクトリを共有する 2 つのワーカーは同じスロットに書き込み、衝突ごとに 1 つのレコードを失います（測定済み）。

## 🛰️ プロキシの背後で

codiv.ai はサインアップを Cloudflare Turnstile で保護し、検証リンクをメールで送信するため、解決はクリーンな出口 IP から実際のブラウザで行う必要があります:

- **CDP 経由の Chrome（デフォルト）** — `--remote-debugging-port=9222` で独自のヘッドフル Chrome を起動し、`--cdp` をそこに向けます。ウィジェットを運ぶページは、それ自身のブラウザコンテキストで作成されます。
- **プロキシ出口** — `--proxy socks5://…` または `http://…` は*解決ページの*出口を固定します。Cloudflare は出口 IP ごとにウィジェットを調整します。データセンター回線はウィジェットを通過しますが、クリック後に `fail code 600010` を返すため、レジデンシャルに近い出口を指定し、特定の出口が高負荷時に数時間で切り替わることを想定してください。
- **外部ソルバー** — `--solver-cmd "node my-solver.js"` は Chrome を完全にスキップします。試行ごとに 1 回実行され、環境に `CODIV_SITEKEY` と `CODIV_URL` が設定され、トークンは stdout の最後の空でない行です。
- **直接フェッチ** — 解決以外はすべてプレーン HTTPS です: Mailtrap の API、better-auth エンドポイント、`https://api.codiv.ai/v1`。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `out/codiv-keys.txt` | ライブ検証済みの `sk-codiv-…` が 1 行に 1 つ — git 無視 |
| `out/codiv-accounts/<slot>.json` | アカウントごとの完全な記録（`signup`、`verify`、`actions`、`createKey`、`proof`） — git 無視 |
| `out/codiv-batch.log` | キャンペーンログ — git 無視 |
| `proxies.txt` | あなたの出口、1 行に 1 つ — git 無視 |
| `src/cli.js` · `src/launcher.js` | タスクランナーと CODIV バナー |
| `src/connect-9router.js` | 保存されたキーを 9Router 接続として登録 |

## 🔌 9Router に接続

[9Router](https://9router.com) はセルフホスト型の OpenAI 互換ルーターです（`npm install -g 9router && 9router`、ダッシュボードは `http://localhost:20128`）。すべてのキーを 1 回で登録:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

フラグ: `--router http://localhost:20128`、`--router-password 123456`、`--keys out/codiv-keys.txt`、`--model diffusiongemma-26b`。ノード自体はプレフィックス `codiv` とベース URL `https://api.codiv.ai/v1` で作成されます。モデルはその後 `codiv/<model id>` として提供され、すべてのキー間でロードバランスされます。

## 🔌 OmniRoute に接続

[OmniRoute](https://omniroute.online) はセルフホスト型の OpenAI 互換ルーターです（`npm install -g omniroute && omniroute`、ダッシュボードは `http://localhost:20128`）。すべてのキーを 1 回で登録:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<omniroute client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

フラグ: `--router http://localhost:20128`、`--router-password 123456`、`--keys out/codiv-keys.txt`、`--model diffusiongemma-26b`。ノード自体はプレフィックス `codiv` とベース URL `https://api.codiv.ai/v1` で作成されます。モデルはその後 `codiv/<model id>` として提供され、すべてのキー間でロードバランスされます。
## 🔑 1 つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **codiv.ai** — [codiv.ai](https://codiv.ai) |
| 🎁 プロバイダーが提供するもの | アカウントごとに 1 億の無料入力トークン — キーごとに 1 アカウント |
| 🔑 1 つのキーで得られるもの | 自身のアカウントにスコープされた 1 つの API キー: 以下のエンドポイントにある 1 つのモデル ID を、あなたのプランの制限で利用できます。クォータは**アカウント**に存在するため、このツールがキーごとに 1 アカウントを作成するのです |
| 🌐 API の形式 | OpenAI 互換: `POST https://api.codiv.ai/v1/chat/completions` |
| 🔒 あなたのデータ | 接触するのは codiv.ai と、あなたが設定した受信トレイバックエンドのみです。キーはあなたのマシンに留まります |

## 🐞 イシュー

codiv.ai がサインアップの形式、Turnstile ウィジェット、または `createKey` アクションを変更した場合、ツールはそのステップで停止し、その旨を報告します。実行したコマンドと正確な出力を添えて **[イシューを開いてください](../../issues)**。PR も歓迎します。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照してください。

<div align="center">

**[MIT](LICENSE)** © 2026 codiv-bulk-apikey contributors

</div>