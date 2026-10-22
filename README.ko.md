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

**자동 생성된 API 키로 codiv.ai 계정을 대량 생성 — OpenAI 호환 추론(`sk-codiv-…`, 계정당 1억 개 무료 입력 토큰) + 9Router 커넥터.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-1-of-them) · [🧪 API 사용하기](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 무료 티어 — 얼마나 받을 수 있나

**모든 신규 codiv.ai 계정에는 1억 개의 무료 입력 토큰이 제공됩니다 — 카드 불필요.**

| 항목 | 값 |
| --- | --- |
| 허용량 | 계정당 **100,000,000개의 무료 입력 토큰** |
| 카드 필요 | **아니오** |
| 가입 | `POST /api/auth/sign-up/email`(better-auth)을 통한 이메일 + 비밀번호, Mailtrap 받은편지함에서 이메일 링크 확인 |
| 캡차 | 가입 시 Cloudflare **Turnstile** — **본인의 헤드풀 Chrome**에서 CDP를 통해 해결하거나, 이미 보유한 외부 솔버로 해결 |
| 키 형식 | `sk-codiv-…` |
| 확장 단위 | **계정 하나 = 키 하나** → `--count N`은 사실상 "무료 계정 N개" |

> 💡 허용량은 codiv.ai가 설정하며 변경될 수 있습니다. 언제든지 직접 파일을 다시 검증하세요:

```bash
node src/cli.js verify      # every saved key answers a live chat 200 or is reported
```

> 💡 무료 티어는 codiv.ai가 설정하며 변경될 수 있습니다. 실시간 수치는 [codiv.ai](https://codiv.ai)에서 확인하세요 — 그리고 도구 자체의 게이트가 판단하게 하세요:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 모델 — 총 1개

`POST https://api.codiv.ai/v1/chat/completions`는 이 도구가 모든 키를 검증하는 대상 표면입니다.

| 모델 | 9Router에서 호출 | 상태 |
| --- | --- | --- |
| `diffusiongemma-26b` | `codiv/diffusiongemma-26b` | ✅ `200` — 모든 발급이 검증되는 모델 |

키는 대시보드 자체의 서버 액션에서 발급되며 계정의 1억 개 무료 입력 토큰이 이를 지불하므로, `diffusiongemma-26b`는 `verify`와 `connect` 모두의 기본값입니다. `--model <id>`로 다른 모델을 지정할 수 있습니다. 라우터 측 목록을 새로 고치려면:

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
```

## 🧪 API 사용 방법

기본 URL은 **`https://api.codiv.ai/v1`** 입니다 — OpenAI 호환이므로 OpenAI를 지원하는 모든 것(SDK, Cursor, OpenCode, Kilo Code 등)이 작동합니다.

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

## 🛠 빠른 시작

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

`create`는 키 파일에 이미 있는 키를 세고 거기서부터 재개하므로, 캠페인을 중지하고 다시 시작해도 작업을 잃지 않습니다. 키는 `out/codiv-keys.txt`에 한 줄에 하나씩 저장되며, 각 계정의 전체 기록은 `out/codiv-accounts/`에 저장됩니다.

### 🖱️ 런처

`node src/cli.js`는 CODIV 배너와 작업 목록을 출력합니다. 작업은 `mint`(요청 시 계정 하나), `create`(캠페인), `verify`, `connect`, `list`, `token`(디버깅용 단일 Turnstile 토큰 해결)입니다. 플래그는 `--name value`로 읽으므로, 어떤 것도 설정 파일 뒤에 숨겨져 있지 않습니다.

## ✅ 검증됨 — 모든 키가 테스트됩니다

> **품질 게이트.** 여기의 모든 키는 `keys.txt`에 기록되기 전에 실제 `chat-200`을 통과했습니다
> (죽은 키는 절대 배포되지 않습니다). 라우터 조합도 모델 수준에서 동일한 규칙을 따릅니다: 모델이
> `chat-200`에 응답하고 도구를 호출할 수 **있는 경우에만** 항목이 추가됩니다 — 도구 지원이 없는 모델,
> 죽은 키 또는 죽은 제공자는 추가되지 않고 제거됩니다. **9Router와 OmniRoute**에서 작동합니다.

| 검사 | 결과 |
| --- | --- |
| 계정 생성 | 새 Mailtrap 받은편지함에서 `POST /api/auth/sign-up/email`(better-auth) |
| 이메일 확인 | 확인 링크를 받은편지함에서 가져옴; better-auth는 확인 요청 시 자동 로그인하므로 그 `Set-Cookie`가 세션임 |
| 키 생성 | 대시보드의 Next.js 서버 액션 `createKey`(재배포 시 id가 교체되므로 매 실행마다 배포된 청크에서 id를 다시 발견함)가 RSC 응답으로 새 키를 반환 |
| 실시간 검증 | `POST https://api.codiv.ai/v1/chat/completions`(`diffusiongemma-26b`)가 키가 인정되기 전에 `200`을 응답해야 함 |
| 채팅 검사를 통과하지 못한 키 | 기록되지 않음 — 계정은 슬롯별 JSON에 복구 가능한 상태로 남음 |

실제 캠페인에서 측정: 계정 하나 = **1억 개 무료 입력 토큰**; 발급 비용은 약 **80-115초**(Turnstile 해결 1회 + 확인 메일 1통)이며, Turnstile 토큰은 해결한 출구에 고정되므로 거부된 토큰은 완전히 새로운 해결로 재시도됩니다(최대 4회).

## 🧭 작동 방식

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: codiv.ai page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.codiv.ai/v1/chat/completions → real content = the key is live
```

| 단계 | 호출 | 비고 |
| --- | --- | --- |
| 받은편지함 | Mailtrap 공개 API | 계정당 새 인바운드 받은편지함 |
| Turnstile | 사이트 자체 위젯(sitekey `0x4AAAAAAE7hE0DIArlj6rXX`)을 본인 Chrome에 마운트하고 CDP로 클릭 | 토큰은 `x-captcha-response` 헤더로 반환됨 |
| 가입 | `POST /api/auth/sign-up/email` | better-auth |
| 확인 | 받은편지함의 확인 링크 | 해당 요청의 `Set-Cookie`가 세션 |
| 키 | 대시보드 서버 액션 `createKey` | 평문 키가 한 번 반환됨 |
| 검증 | `POST https://api.codiv.ai/v1/chat/completions` | 키가 저장되기 전에 실시간 `200` 필요 |

## ⚙️ CLI 옵션

```bash
node src/cli.js mint                     # one account + key
node src/cli.js create --count 200       # campaign: mint N keys (resume-safe)
node src/cli.js verify                   # prove saved keys with a live chat call
node src/cli.js connect                  # register keys into 9Router
node src/cli.js list                     # list saved keys (masked)
node src/cli.js token                    # solve one Turnstile token (debug)
```

| 플래그 | 의미 | 기본값 |
| --- | --- | --- |
| `--count <n>` | 캠페인 크기 | `200` |
| `--dir <name>` | `out/` 아래 워커별 계정 디렉터리 | `codiv-accounts` |
| `--keys <file>` | 키 파일 | `out/codiv-keys.txt` |
| `--pause <ms>` | 발급 간 지연 | `5000` |
| `--cdp <url>` | Chrome DevTools 엔드포인트 | `http://127.0.0.1:9222` |
| `--proxy <url>` | 해결 페이지 출구 (`socks5://` / `http://`) | 직접 연결 |
| `--solver-cmd <cmd>` | 외부 Turnstile 솔버 | — |
| `--token <t>` | 수동 Turnstile 토큰 하나 | — |
| `--mailtrap-token <t>` | Mailtrap API 토큰 | `MAILTRAP_TOKEN` 환경 변수 |
| `--model <id>` | verify / connect용 모델 | `diffusiongemma-26b` |
| `--conc <n>` | verify 동시성 | `6` |
| `--router <url>` | 9Router 기본 URL | `http://localhost:20128` |
| `--router-password <pw>` | 9Router 대시보드 비밀번호 | `123456` |

**병렬 캠페인:** 각 워커에 자체 `--dir`과 `--keys`를 부여하세요. 두 워커가 하나의 디렉터리를 공유하면 같은 슬롯에 쓰고 충돌마다 레코드 하나를 잃습니다(측정됨).

## 🛰️ 프록시 뒤에서

codiv.ai는 Cloudflare Turnstile로 가입을 보호하고 확인 링크를 메일로 보내므로, 해결은 깨끗한 출구 IP에서 실제 브라우저로 이루어져야 합니다:

- **CDP를 통한 Chrome(기본값)** — `--remote-debugging-port=9222`로 본인의 헤드풀 Chrome을 시작하고 `--cdp`를 그것으로 지정하세요. 위젯이 있는 페이지는 자체 브라우저 컨텍스트에서 생성됩니다.
- **프록시 출구** — `--proxy socks5://…` 또는 `http://…`는 *해결 페이지*의 출구를 고정합니다. Cloudflare는 출구 IP별로 위젯을 조정합니다. 데이터센터 회선은 위젯을 통과하지만 클릭 후 `fail code 600010`을 응답하므로, 주거용에 가까운 출구로 지정하고 과도한 사용 시 특정 출구가 몇 시간 내에 뒤집힐 수 있음을 예상하세요.
- **외부 솔버** — `--solver-cmd "node my-solver.js"`는 Chrome을 완전히 건너뜁니다. 시도마다 한 번 실행되며 환경에 `CODIV_SITEKEY`와 `CODIV_URL`이 설정되고, 토큰은 stdout의 마지막 비어 있지 않은 줄입니다.
- **직접 가져오기** — 해결을 제외한 모든 것은 일반 HTTPS입니다: Mailtrap의 API, better-auth 엔드포인트, 그리고 `https://api.codiv.ai/v1`.

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `out/codiv-keys.txt` | 실시간 검증된 `sk-codiv-…`가 한 줄에 하나씩 — git 무시됨 |
| `out/codiv-accounts/<slot>.json` | 계정별 전체 기록(`signup`, `verify`, `actions`, `createKey`, `proof`) — git 무시됨 |
| `out/codiv-batch.log` | 캠페인 로그 — git 무시됨 |
| `proxies.txt` | 출구 목록, 한 줄에 하나씩 — git 무시됨 |
| `src/cli.js` · `src/launcher.js` | 작업 실행기와 CODIV 배너 |
| `src/connect-9router.js` | 저장된 키를 9Router 연결로 등록 |

## 🔌 9Router에 연결

[9Router](https://9router.com)는 자체 호스팅, OpenAI 호환 라우터입니다(`npm install -g 9router && 9router`, 대시보드는 `http://localhost:20128`). 한 번에 모든 키를 등록하세요:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

플래그: `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. 노드 자체는 접두사 `codiv`와 기본 URL `https://api.codiv.ai/v1`로 생성됩니다. 모델은 이후 `codiv/<model id>`로 제공되며 모든 키에 걸쳐 로드 밸런싱됩니다.

## 🔌 OmniRoute에 연결

[OmniRoute](https://omniroute.online)는 자체 호스팅, OpenAI 호환 라우터입니다(`npm install -g omniroute && omniroute`, 대시보드는 `http://localhost:20128`). 한 번에 모든 키를 등록하세요:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<omniroute client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

플래그: `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. 노드 자체는 접두사 `codiv`와 기본 URL `https://api.codiv.ai/v1`로 생성됩니다. 모델은 이후 `codiv/<model id>`로 제공되며 모든 키에 걸쳐 로드 밸런싱됩니다.
## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **codiv.ai** — [codiv.ai](https://codiv.ai) |
| 🎁 제공자가 주는 것 | 계정당 1억 개 무료 입력 토큰 — 키 하나당 계정 하나 |
| 🔑 키 하나로 얻는 것 | 자체 계정에 범위가 지정된 API 키 하나: 아래 엔드포인트의 1개 모델 id를 플랜 한도 내에서 사용. 할당량은 **계정**에 있으므로, 이 도구가 키당 계정 하나를 생성하는 것입니다 |
| 🌐 API 형태 | OpenAI 호환: `POST https://api.codiv.ai/v1/chat/completions` |
| 🔒 데이터 | codiv.ai와 설정한 받은편지함 백엔드만 접촉됩니다; 키는 본인 컴퓨터에 남습니다 |

## 🐞 이슈

codiv.ai가 가입 형태, Turnstile 위젯 또는 `createKey` 액션을 변경하면, 도구는 해당 단계에서 멈추고 그 사실을 알립니다. 실행한 명령과 정확한 출력을 포함하여 **[이슈를 열어주세요](../../issues)**; PR을 환영합니다.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 codiv-bulk-apikey contributors

</div>