<div align="center">

<img src="../brand/logo.svg" alt="codiv-bulk" width="150" />

# codiv-bulk-apikey

**[codiv.ai](https://codiv.ai)-Konten massenhaft erstellen, für jedes Konto einen `sk-codiv-…` API-Key ausstellen (100M kostenlose Input-Token pro Konto) und jeden Key in einer laufenden [9Router](https://9router.com)-Instanz registrieren — durchgängig. Null Abhängigkeiten.**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](../LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://api.codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-mit-9router-verbinden)
[![Transport](https://img.shields.io/badge/transport-HTTP%20%7C%20SOCKS5%20%7C%20CDP-0EA5E9.svg?style=for-the-badge)](#-transports)
[![Mailtrap](https://img.shields.io/badge/inbox-Mailtrap-22C55E.svg?style=for-the-badge)](https://mailtrap.io)
[![Languages](https://img.shields.io/badge/i18n-5%20languages-F59E0B.svg?style=for-the-badge)](#-sprachen)

[English](../README.md) · [Bahasa Indonesia](README.id.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Deutsch](README.de.md)

</div>

---

## ✨ Funktionen

- 🔑 **Konten + API-Keys massenhaft** — Hunderte `sk-codiv-…`-Keys über das eigene Dashboard-Backend von codiv.ai ausstellen.
- 💰 **100M kostenlose Input-Token** — jedes Konto bringt 100M kostenlose Input-Token mit. Keine Karte nötig.
- 🔌 **9Router-Connector** — jeder Key wird in einem Durchgang als OpenAI-kompatible Verbindung unter dem Präfix `codiv` registriert.
- 🧠 **Echtes Turnstile-Lösen** — das Widget der Website selbst wird in *deinem* Chrome auf `codiv.ai/signup` eingehängt und per CDP angeklickt.
- 🪶 **Null Abhängigkeiten** — handgeschriebener RFC6455-WebSocket + CDP-Client. Kein `npm install`, kein Build-Schritt.
- ⏱️ **~80-115 s pro Konto** — eine Turnstile-Lösung plus eine Verifizierungsmail, durchgängig.
- ✅ **Geprüfte Keys** — jeder Key muss einen echten Chat `200` beantworten, bevor er gespeichert wird.
- 🌍 **5 Sprachen** — EN, ID, ZH, JA, ES, DE.

## 🚀 Schnellstart

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

`create` zählt die bereits vorhandenen Keys in der Key-Datei und setzt dort fort, sodass eine Kampagne unterbrochen und neu gestartet werden kann, ohne Arbeit zu verlieren.

## 🛠 Verwendung

```bash
codiv-bulk mint                     # create one account + key
codiv-bulk create --count 200       # campaign: mint N keys (resume-safe)
codiv-bulk verify                   # prove saved keys with a live chat call
codiv-bulk connect                  # register keys into 9Router
codiv-bulk list                     # list saved keys (masked)
codiv-bulk token                    # solve one Turnstile token (debug)
```

| Flag | Beschreibung | Standard |
| --- | --- | --- |
| `--count <n>` | Umfang der Kampagne | `200` |
| `--dir <name>` | Kontenverzeichnis pro Worker unter `out/` | `codiv-accounts` |
| `--keys <file>` | Key-Datei | `out/codiv-keys.txt` |
| `--pause <ms>` | Pause zwischen den Mints | `5000` |
| `--out <file>` | Datensatz eines einzelnen Mints | `out/codiv-account.json` |
| `--log <file>` | Kampagnen-Log | `out/codiv-batch.log` |
| `--cdp <url>` | Chrome-DevTools-Endpunkt | `http://127.0.0.1:9222` |
| `--proxy <url>` | Ausgang der Löse-Seite (`socks5://`/`http://`) | direkt |
| `--token <t>` | ein manuelles Turnstile-Token | — |
| `--attempts <n>` | Lösungsversuche pro Mint | `2` |
| `--solver-cmd <cmd>` | externer Solver (siehe unten) | — |
| `--mailtrap-token <t>` | Mailtrap-API-Token | Umgebungsvariable `MAILTRAP_TOKEN` |
| `--folder <name>` | Mailtrap-Ordner | `codiv` |
| `--model <id>` | Modell für verify/connect | `diffusiongemma-26b` |
| `--conc <n>` | verify-Paralleleität | `6` |
| `--router <url>` | 9Router-Basis | `http://localhost:20128` |
| `--router-password <pw>` | Passwort des 9Router-Dashboards | `123456` |

## 🌐 Transports

codiv.ai sichert die Registrierung mit Cloudflare **Turnstile** und verschickt einen Verifizierungslink, deshalb muss die Lösung in einem echten Browser von einer sauberen Ausgangs-IP aus erfolgen:

- **Chrome über CDP (Standard)** — starte dein eigenes Chrome mit `--remote-debugging-port=9222` (mit Fenster: ein versteckter Tab verhält sich anders) und richte `--cdp` darauf aus. Die Seite, die das Widget trägt, wird in einem eigenen Browser-Kontext erstellt.
- **Proxy-Ausgang** — `--proxy socks5://…` oder `http://…` fixiert den Ausgang der *Löse-Seite*. Cloudflare moderiert das Widget pro Ausgangs-IP; eine Rechenzentrumsleitung besteht das Widget, antwortet nach dem Klick aber mit `fail code 600010`.
- **Externer Solver** — `--solver-cmd "node my-solver.js"` überspringt Chrome komplett; er läuft einmal pro Versuch mit `CODIV_SITEKEY` und `CODIV_URL` in der Umgebung, und das Token ist die letzte nicht leere stdout-Zeile. `--token <t>` liefert ein manuelles Token für einen einzelnen Mint.
- **Direkter Abruf** — alles außer dem Lösen ist normales HTTPS: die Mailtrap-API, die better-auth-Endpunkte und `https://api.codiv.ai/v1`.

Eingangsweg: ein frischer [Mailtrap](https://mailtrap.io)-Inbound-Posteingang pro Konto, erstellt über dessen öffentliche API mit `--mailtrap-token` / `MAILTRAP_TOKEN`.

## 🔌 Mit 9Router verbinden

9Router ist ein selbst gehosteter, OpenAI-kompatibler Router:

```bash
npm install -g 9router && 9router        # dashboard on http://localhost:20128
```

Registriere alle deine Keys mit einem einzigen Befehl (erzeugt den Provider-Node `codiv` und hängt jeden Key an):

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Rufe ihn wie jeden OpenAI-Endpunkt auf:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"codiv/diffusiongemma-26b","messages":[{"role":"user","content":"hi"}]}'
```

## 🧠 Verfügbare Modelle

| Modell | Aufruf in 9Router | Status |
| --- | --- | --- |
| diffusiongemma-26b | `codiv/diffusiongemma-26b` | ✅ `200` — das Modell, gegen das jeder Mint geprüft wird |

Der Key entsteht aus der Server-Action des Dashboards, und bezahlt wird er von den 100M kostenlosen Input-Token des Kontos; deshalb ist `diffusiongemma-26b` der Standard für sowohl `verify` als auch `connect`. `--model <id>` legt ein anderes fest. Aktualisiere die Liste auf Router-Seite mit:

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
```

## 🔁 Parallele Kampagnen

Gib jedem Worker sein eigenes `--dir` und seine eigenen `--keys`: Zwei Worker, die ein Verzeichnis teilen, schreiben in dieselbe `<start+i>.json`-Slot-Datei und verlieren pro Kollision einen Datensatz (gemessen).

```bash
node src/cli.js create --count 65 --dir w1 --keys out/codiv-keys-w1.txt &
node src/cli.js create --count 65 --dir w2 --keys out/codiv-keys-w2.txt &
node src/cli.js create --count 65 --dir w3 --keys out/codiv-keys-w3.txt &
wait
```

## 🧩 Externer Solver

Wenn du bereits einen Turnstile-Solver hast, überspringe den eingebauten Chrome-Weg:

```bash
codiv-bulk mint --solver-cmd "node my-solver.js"   # or --token <t> for one manual token
```

`--solver-cmd` läuft einmal pro Versuch mit `CODIV_SITEKEY` und `CODIV_URL` in der Umgebung, und das Token ist die letzte nicht leere stdout-Zeile.

## 📚 Als Bibliothek

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

## ⚙️ So funktioniert es

1. **Maildrop** — pro Konto wird ein neuer Mailtrap-Posteingang für die Verifizierungsmail angelegt.
2. **Turnstile** — das Widget der Website selbst (Sitekey `0x4AAAAAAE7hE0DIArlj6rXX`) wird in deinem Chrome auf `codiv.ai/signup` eingehängt und per CDP angeklickt; das Token kommt als Header `x-captcha-response` zurück.
3. **Registrierung** — `POST /api/auth/sign-up/email` (better-auth).
4. **Verifizierung** — der Verifizierungslink wird aus dem Posteingang geholt; better-auth meldet beim Verifizierungstreffer automatisch an, daher ist dessen `Set-Cookie` die Sitzung.
5. **Key anlegen** — die Next.js-Server-Action des Dashboards, `createKey` (deren Ids werden bei jedem Lauf aus den ausgelieferten Chunks neu ermittelt, weil Neudployments sie rotieren), liefert den frischen Key in ihrer RSC-Antwort.
6. **Belegen** — ein echter Chat-Aufruf an `https://api.codiv.ai/v1` (`diffusiongemma-26b`) muss `200` beantworten, bevor der Key zählt.
7. **Speichern** — ein `sk-codiv-…` pro Zeile in der Key-Datei; der vollständige Datensatz landet im Konto-JSON des jeweiligen Slots.

### Gemessenes Verhalten

- Ein Konto = **100M kostenlose Input-Token**; keine Karte nötig.
- Mint-Kosten ≈ **80-115 s pro Konto** (eine Turnstile-Lösung plus eine Verifizierungsmail).
- Ein 65-Key-Batch pro Worker hielt **~55 erfolgreiche Mints** durch; der Fehlerfall ist das **420-s**-Timeout pro Mint, kein unvollständiges Schreiben.
- Turnstile-Tokens sind an den lösenden Ausgang gebunden; Cloudflare lehnt einen Teil der frischen Tokens mit `VERIFICATION_FAILED` ab, und der Mint versucht es mit einer völlig neuen Lösung erneut (bis zu 4 Versuche).
- Ein Rechenzentrums-Ausgang besteht das Widget, die Challenge antwortet aber nach dem Klick mit `fail code 600010` — richte `--proxy` auf einen eher privaten Ausgang, und rechne damit, dass ein gegebener Ausgang nach starker Nutzung innerhalb von Stunden kippt.

## 📁 Aufbau

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

## ⚠️ Hinweise

- Voraussetzungen: ein **Mailtrap-Token** (Posteingänge für die Verifizierung) und ein **Chrome mit `--remote-debugging-port=9222`** (eigenes Chrome, mit Fenster — ein versteckter Tab verhält sich anders).
- Keys werden vor dem Speichern mit einem echten Chat `200` belegt; der Datensatz behält jeden Schritt (`signup`, `verify`, `actions`, `createKey`, `proof`).
- Die Key-Datei enthält ein `sk-codiv-…` pro Zeile; `create` setzt fort, was bereits vorhanden ist.
- Konten und Keys gehören dir; nichts wird irgendwohin gesendet außer an codiv.ai, Mailtrap und (optional) deinen 9Router.
- Für Automatisierung zu persönlichen oder Bildungszwecken. Respektiere die Nutzungsbedingungen von codiv.ai, Mailtrap und 9Router.

## 📄 Lizenz

[MIT](../LICENSE) © 2026 codiv-bulk-apikey contributors
