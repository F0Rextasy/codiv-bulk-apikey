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

**Массовое создание аккаунтов codiv.ai с автоматически сгенерированными API-ключами — вывод, совместимый с OpenAI (`sk-codiv-…`, 100 млн бесплатных входных токенов на аккаунт) + коннектор 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-1-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Опции](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 Бесплатный тариф — сколько вы получаете

**Каждый новый аккаунт codiv.ai несёт 100 млн бесплатных входных токенов — без карты.**

| Что | Значение |
| --- | --- |
| Лимит | **100 000 000 бесплатных входных токенов** на аккаунт |
| Требуется карта | **Нет** |
| Регистрация | e-mail + пароль через `POST /api/auth/sign-up/email` (better-auth), ссылка из письма подтверждается из почтового ящика Mailtrap |
| Капча | Cloudflare **Turnstile** при регистрации — решается в **вашем собственном Chrome с интерфейсом** через CDP или внешним решателем, который у вас уже есть |
| Формат ключа | `sk-codiv-…` |
| Единица масштабирования | **один аккаунт = один ключ** → `--count N` на самом деле означает «N бесплатных аккаунтов» |

> 💡 Лимит устанавливается codiv.ai и может измениться. В любой момент перепроверьте свой файл:

```bash
node src/cli.js verify      # every saved key answers a live chat 200 or is reported
```

> 💡 Бесплатный тариф устанавливается codiv.ai и может измениться. Проверьте актуальные цифры на [codiv.ai](https://codiv.ai) — и пусть собственный контроль инструмента решит:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Модели — все 1 из них

`POST https://api.codiv.ai/v1/chat/completions` — это поверхность, на которой инструмент проверяет каждый ключ.

| Модель | Вызов как в 9Router | Статус |
| --- | --- | --- |
| `diffusiongemma-26b` | `codiv/diffusiongemma-26b` | ✅ `200` — модель, на которой проверяется каждый выпуск |

Ключ выпускается собственным серверным действием панели управления, и 100 млн бесплатных входных токенов аккаунта оплачивают его, поэтому `diffusiongemma-26b` — значение по умолчанию как для `verify`, так и для `connect`; `--model <id>` закрепляет другую. Обновите список на стороне роутера с помощью:

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
```

## 🧪 Как использовать API

Базовый URL — **`https://api.codiv.ai/v1`** — совместим с OpenAI, поэтому работает всё, что говорит на OpenAI (SDK, Cursor, OpenCode, Kilo Code, …).

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

## 🛠 Быстрый старт

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

`create` подсчитывает ключи, уже находящиеся в файле ключей, и продолжает с этого места, поэтому кампанию можно остановить и перезапустить без потери работы. Ключи попадают в `out/codiv-keys.txt`, по одному в строке; полная запись каждого аккаунта попадает в `out/codiv-accounts/`.

### 🖱️ Лаунчер

`node src/cli.js` выводит баннер CODIV и список задач. Задачи: `mint` (один аккаунт, по требованию), `create` (кампания), `verify`, `connect`, `list` и `token` (решить один токен Turnstile для отладки). Флаги читаются как `--name value`, так что ничего не скрыто за файлом конфигурации.

## ✅ Проверено в работе — каждый ключ протестирован

> **Контроль качества.** Каждый ключ здесь прошёл живой `chat-200` перед тем, как был записан в `keys.txt`
> (мёртвые ключи никогда не поставляются). Комбинации роутера следуют тому же правилу на уровне модели: запись
> добавляется **только если модель отвечает `chat-200` и умеет вызывать инструменты** — модель без поддержки инструментов,
> мёртвый ключ или мёртвый провайдер отбрасывается, а не добавляется. Работает с **9Router и OmniRoute**.

| Проверка | Результат |
| --- | --- |
| создание аккаунта | `POST /api/auth/sign-up/email` (better-auth) на свежем ящике Mailtrap |
| подтверждение e-mail | ссылка подтверждения извлекается из ящика; better-auth автоматически входит при переходе по ссылке подтверждения, поэтому его `Set-Cookie` — это сессия |
| создание ключа | серверное действие Next.js панели управления `createKey` (идентификаторы заново обнаруживаются из развёрнутых чанков при каждом запуске, потому что повторные развёртывания их меняют) возвращает свежий ключ в своём ответе RSC |
| живое доказательство | `POST https://api.codiv.ai/v1/chat/completions` (`diffusiongemma-26b`) должен ответить `200`, прежде чем ключ будет засчитан |
| ключ, не прошедший проверку чата | никогда не записывается — аккаунт остаётся восстановимым в своём JSON для слота |

Измерено на реальных кампаниях: один аккаунт = **100 млн бесплатных входных токенов**; выпуск стоит ≈ **80-115 с** (одно решение Turnstile + одно письмо подтверждения), и токены Turnstile привязаны к выходу, на котором решались, поэтому отклонённый токен повторяется с совершенно новым решением (до 4 попыток).

## 🧭 Как это работает

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: codiv.ai page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.codiv.ai/v1/chat/completions → real content = the key is live
```

| Шаг | Вызов | Примечания |
| --- | --- | --- |
| ящик | публичный API Mailtrap | свежий входящий ящик на каждый аккаунт |
| Turnstile | собственный виджет сайта (sitekey `0x4AAAAAAE7hE0DIArlj6rXX`), смонтированный в вашем Chrome и кликнутый через CDP | токен возвращается как заголовок `x-captcha-response` |
| регистрация | `POST /api/auth/sign-up/email` | better-auth |
| подтверждение | ссылка подтверждения из ящика | `Set-Cookie` при этом переходе — это сессия |
| ключ | серверное действие панели управления `createKey` | ключ в открытом виде возвращается один раз |
| доказательство | `POST https://api.codiv.ai/v1/chat/completions` | требуется живой `200`, прежде чем ключ будет сохранён |

## ⚙️ Опции CLI

```bash
node src/cli.js mint                     # one account + key
node src/cli.js create --count 200       # campaign: mint N keys (resume-safe)
node src/cli.js verify                   # prove saved keys with a live chat call
node src/cli.js connect                  # register keys into 9Router
node src/cli.js list                     # list saved keys (masked)
node src/cli.js token                    # solve one Turnstile token (debug)
```

| Флаг | Значение | По умолчанию |
| --- | --- | --- |
| `--count <n>` | размер кампании | `200` |
| `--dir <name>` | каталог аккаунтов на воркера внутри `out/` | `codiv-accounts` |
| `--keys <file>` | файл ключей | `out/codiv-keys.txt` |
| `--pause <ms>` | задержка между выпусками | `5000` |
| `--cdp <url>` | конечная точка Chrome DevTools | `http://127.0.0.1:9222` |
| `--proxy <url>` | выход страницы решения (`socks5://` / `http://`) | напрямую |
| `--solver-cmd <cmd>` | внешний решатель Turnstile | — |
| `--token <t>` | один ручной токен Turnstile | — |
| `--mailtrap-token <t>` | API-токен Mailtrap | переменная окружения `MAILTRAP_TOKEN` |
| `--model <id>` | модель для verify / connect | `diffusiongemma-26b` |
| `--conc <n>` | параллелизм verify | `6` |
| `--router <url>` | база 9Router | `http://localhost:20128` |
| `--router-password <pw>` | пароль панели управления 9Router | `123456` |

**Параллельные кампании:** дайте каждому воркеру свой `--dir` и `--keys`; два воркера, использующие один каталог, пишут в один и тот же слот и теряют одну запись при каждом столкновении (измерено).

## 🛰️ За прокси

codiv.ai защищает регистрацию с помощью Cloudflare Turnstile и отправляет ссылку подтверждения по почте, поэтому решение должно происходить в настоящем браузере с чистого выходного IP:

- **Chrome через CDP (по умолчанию)** — запустите свой собственный Chrome с интерфейсом с `--remote-debugging-port=9222` и укажите на него `--cdp`. Страница с виджетом создаётся в собственном контексте браузера.
- **Выход через прокси** — `--proxy socks5://…` или `http://…` закрепляет выход *страницы решения*. Cloudflare модерирует виджет по выходному IP; линия дата-центра проходит виджет, но отвечает `fail code 600010` после клика, поэтому направьте её на более-менее резидентный выход и ожидайте, что данный выход переключится в течение нескольких часов при интенсивном использовании.
- **Внешний решатель** — `--solver-cmd "node my-solver.js"` полностью пропускает Chrome; он запускается один раз на попытку с `CODIV_SITEKEY` и `CODIV_URL` в окружении, а токен — это последняя непустая строка stdout.
- **Прямой запрос** — всё, кроме решения, — это обычный HTTPS: API Mailtrap, конечные точки better-auth и `https://api.codiv.ai/v1`.

## 📄 Файлы

| Путь | Содержимое |
| --- | --- |
| `out/codiv-keys.txt` | один проверенный вживую `sk-codiv-…` на строку — игнорируется git |
| `out/codiv-accounts/<slot>.json` | полная запись на аккаунт (`signup`, `verify`, `actions`, `createKey`, `proof`) — игнорируется git |
| `out/codiv-batch.log` | журнал кампании — игнорируется git |
| `proxies.txt` | ваши выходы, по одному в строке — игнорируется git |
| `src/cli.js` · `src/launcher.js` | исполнитель задач и баннер CODIV |
| `src/connect-9router.js` | регистрирует сохранённые ключи как подключения 9Router |

## 🔌 Подключение к 9Router

[9Router](https://9router.com) — это самостоятельно размещаемый, совместимый с OpenAI роутер (`npm install -g 9router && 9router`, панель управления на `http://localhost:20128`). Зарегистрируйте каждый ключ за один проход:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Флаги: `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. Сам узел создаётся с префиксом `codiv` и базовым URL `https://api.codiv.ai/v1`. Затем модели подаются как `codiv/<model id>` и балансируются между всеми ключами.

## 🔌 Подключение к OmniRoute

[OmniRoute](https://omniroute.online) — это самостоятельно размещаемый, совместимый с OpenAI роутер (`npm install -g omniroute && omniroute`, панель управления на `http://localhost:20128`). Зарегистрируйте каждый ключ за один проход:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<omniroute client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Флаги: `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. Сам узел создаётся с префиксом `codiv` и базовым URL `https://api.codiv.ai/v1`. Затем модели подаются как `codiv/<model id>` и балансируются между всеми ключами.
## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **codiv.ai** — [codiv.ai](https://codiv.ai) |
| 🎁 Что даёт провайдер | 100 млн бесплатных входных токенов на аккаунт — один аккаунт на ключ |
| 🔑 Что даёт один ключ | один API-ключ, привязанный к своему аккаунту: 1 идентификатор модели на конечной точке ниже, в пределах лимитов вашего тарифа. Квота живёт на **аккаунте**, и именно поэтому этот инструмент создаёт один аккаунт на ключ |
| 🌐 Форма API | Совместим с OpenAI: `POST https://api.codiv.ai/v1/chat/completions` |
| 🔒 Ваши данные | связь только с codiv.ai и настроенным вами почтовым бэкендом; ключи остаются на вашей машине |

## 🐞 Проблемы

Если codiv.ai изменит форму регистрации, виджет Turnstile или действие `createKey`, инструмент остановится на этом шаге и сообщит об этом. **[Откройте issue](../../issues)** с командой, которую вы запустили, и точным выводом; PR приветствуются.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 codiv-bulk-apikey contributors

</div>