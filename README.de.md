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

**Massenhaft codiv.ai-Konten mit automatisch generierten API-Schlüsseln erstellen — OpenAI-kompatible Inferenz (`sk-codiv-…`, 100 Mio. kostenlose Eingabe-Tokens pro Konto) + 9Router-Connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Kostenloses Kontingent](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-1-of-them) · [🧪 Die API verwenden](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 Funktionsweise](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 Kostenloses Kontingent — wie viel du bekommst

**Jedes neue codiv.ai-Konto bringt 100 Mio. kostenlose Eingabe-Tokens — ohne Karte.**

| Was | Wert |
| --- | --- |
| Kontingent | **100.000.000 kostenlose Eingabe-Tokens** pro Konto |
| Karte erforderlich | **Nein** |
| Registrierung | E-Mail + Passwort über `POST /api/auth/sign-up/email` (better-auth), E-Mail-Link aus einem Mailtrap-Postfach verifiziert |
| Captcha | Cloudflare **Turnstile** bei der Registrierung — gelöst in **deinem eigenen headful Chrome** über CDP oder durch einen externen Solver, den du bereits besitzt |
| Schlüsselformat | `sk-codiv-…` |
| Die skalierende Einheit | **ein Konto = ein Schlüssel** → `--count N` bedeutet wirklich „N kostenlose Konten" |

> 💡 Das Kontingent wird von codiv.ai festgelegt und kann sich ändern. Überprüfe deine eigene Datei jederzeit neu:

```bash
node src/cli.js verify      # every saved key answers a live chat 200 or is reported
```

> 💡 Das kostenlose Kontingent wird von codiv.ai festgelegt und kann sich ändern. Prüfe die aktuellen Zahlen auf [codiv.ai](https://codiv.ai) — und lass das eigene Gate des Tools entscheiden:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelle — alle 1 davon

`POST https://api.codiv.ai/v1/chat/completions` ist die Oberfläche, gegen die dieses Tool jeden Schlüssel prüft.

| Modell | Aufruf wie in 9Router | Status |
| --- | --- | --- |
| `diffusiongemma-26b` | `codiv/diffusiongemma-26b` | ✅ `200` — das Modell, gegen das jeder Mint geprüft wird |

Der Schlüssel wird aus der eigenen Server-Action des Dashboards erzeugt, und die 100 Mio. kostenlosen Eingabe-Tokens des Kontos bezahlen ihn, daher ist `diffusiongemma-26b` der Standard für sowohl `verify` als auch `connect`; `--model <id>` legt ein anderes fest. Aktualisiere die router-seitige Liste mit:

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
```

## 🧪 Die API verwenden

Die Basis-URL ist **`https://api.codiv.ai/v1`** — OpenAI-kompatibel, also funktioniert alles, was OpenAI spricht (SDKs, Cursor, OpenCode, Kilo Code, …).

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

## ⚡ Ein Befehl

```bash
node src/cli.js --count N      # mint N accounts + keys — the captcha is solved automatically
node src/cli.js --dry          # print the resolved plan: writes nothing, sends nothing
```

`--auto` ist der Standard: Das eingebettete `src/solver.js` bindet codiv.ais eigenes Turnstile-Widget in den Chrome ein, den du steuerst (`--cdp`, oder starte ihn mit `--remote-debugging-port=9222`), und gibt das Token zurück — ein Befehl, sonst nichts auszuführen. `--no-auto` schaltet das eingebettete Lösen ab; die fortgeschrittenen Auswege sind für Betreiber gedacht, die bereits einen Solver besitzen, und sind in `ADVANCED.md` dokumentiert.

> ⚠️ **Nutzungsbedingungen & Kontorisiko.** Die Automatisierung eines Anbieters kann gegen dessen Nutzungsbedingungen verstoßen und zur Sperrung von Konten oder IPs führen. Du führst dies auf Konten aus, die dir gehören, von deinem eigenen Rechner, auf eigenes Risiko; das Tool steuert nur die eigene Registrierungsseite der Website und umgeht niemals eine bezahlte Schranke. Lies die Nutzungsbedingungen des Anbieters, bevor du eine große Kampagne startest.

## 🛠 Schnellstart

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

`create` zählt die bereits in der Schlüsseldatei vorhandenen Schlüssel und setzt von dort fort, sodass eine Kampagne gestoppt und neu gestartet werden kann, ohne Arbeit zu verlieren. Schlüssel landen in `out/codiv-keys.txt`, einer pro Zeile; der vollständige Datensatz jedes Kontos landet in `out/codiv-accounts/`.

### 🖱️ Der Launcher

`node src/cli.js` gibt das CODIV-Banner und die Aufgabenliste aus. Die Aufgaben sind `mint` (ein Konto, auf Anfrage), `create` (Kampagne), `verify`, `connect`, `list` und `token` (ein einzelnes Turnstile-Token zum Debuggen lösen). Flags werden mit `--name value` gelesen, sodass nichts hinter einer Konfigurationsdatei verborgen ist.

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

> **Qualitätsgates.** Jeder Schlüssel hier hat ein Live-`chat-200` bestanden, bevor er in `keys.txt` geschrieben wurde
> (tote Schlüssel werden niemals ausgeliefert). Router-Kombinationen folgen derselben Regel auf Modellebene: Ein Eintrag wird
> **nur hinzugefügt, wenn das Modell `chat-200` antwortet und Tools aufrufen kann** — ein Modell ohne Tool-Unterstützung,
> ein toter Schlüssel oder ein toter Anbieter wird verworfen statt hinzugefügt. Funktioniert mit **9Router und OmniRoute**.

| Prüfung | Ergebnis |
| --- | --- |
| Kontoerstellung | `POST /api/auth/sign-up/email` (better-auth) auf einem frischen Mailtrap-Postfach |
| E-Mail-Verifizierung | der Verifizierungslink wird aus dem Postfach geholt; better-auth meldet sich beim Verifizierungsaufruf automatisch an, sodass dessen `Set-Cookie` die Session ist |
| Schlüsselerstellung | die Next.js-Server-Action `createKey` des Dashboards (IDs werden bei jedem Lauf aus den deployten Chunks neu entdeckt, da Redeploys sie rotieren) gibt den frischen Schlüssel in ihrer RSC-Antwort zurück |
| Live-Nachweis | `POST https://api.codiv.ai/v1/chat/completions` (`diffusiongemma-26b`) muss `200` antworten, bevor der Schlüssel zählt |
| ein Schlüssel, der die Chat-Prüfung nicht besteht | wird niemals geschrieben — das Konto bleibt in seinem Slot-JSON wiederherstellbar |

Gemessen an echten Kampagnen: ein Konto = **100 Mio. kostenlose Eingabe-Tokens**; ein Mint kostet ≈ **80-115 s** (ein Turnstile-Solve + eine Verifizierungsmail), und Turnstile-Tokens sind an den lösenden Exit gebunden, sodass ein abgelehntes Token mit einem brandneuen Solve erneut versucht wird (bis zu 4 Versuche).

## 🧭 Funktionsweise

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: codiv.ai page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.codiv.ai/v1/chat/completions → real content = the key is live
```

| Schritt | Aufruf | Hinweise |
| --- | --- | --- |
| Postfach | Mailtrap Public API | ein frisches Inbound-Postfach pro Konto |
| Turnstile | das eigene Widget der Website (Sitekey `0x4AAAAAAE7hE0DIArlj6rXX`), in deinem Chrome eingebunden und über CDP angeklickt | das Token geht als `x-captcha-response`-Header zurück |
| Registrierung | `POST /api/auth/sign-up/email` | better-auth |
| Verifizierung | Verifizierungslink aus dem Postfach | das `Set-Cookie` bei diesem Aufruf ist die Session |
| Schlüssel | Dashboard-Server-Action `createKey` | Klartext-Schlüssel wird einmal zurückgegeben |
| Nachweis | `POST https://api.codiv.ai/v1/chat/completions` | Live-`200` erforderlich, bevor der Schlüssel gespeichert wird |

## ⚙️ CLI-Optionen

```bash
node src/cli.js mint                     # one account + key
node src/cli.js create --count 200       # campaign: mint N keys (resume-safe)
node src/cli.js verify                   # prove saved keys with a live chat call
node src/cli.js connect                  # register keys into 9Router
node src/cli.js list                     # list saved keys (masked)
node src/cli.js token                    # solve one Turnstile token (debug)
```

| Flag | Bedeutung | Standard |
| --- | --- | --- |
| `--count <n>` | Kampagnengröße | `200` |
| `--dir <name>` | Konto-Verzeichnis pro Worker unter `out/` | `codiv-accounts` |
| `--keys <file>` | Schlüsseldatei | `out/codiv-keys.txt` |
| `--pause <ms>` | Verzögerung zwischen Mints | `5000` |
| `--cdp <url>` | Chrome-DevTools-Endpunkt | `http://127.0.0.1:9222` |
| `--proxy <url>` | Exit der Solve-Seite (`socks5://` / `http://`) | direkt |
| `--solver-cmd <cmd>` | externer Turnstile-Solver | — |
| `--auto` | Captcha mit dem eingebetteten `src/solver.js` lösen | an (Standard) |
| `--no-auto` | eingebetteten Solver deaktivieren | aus |
| `--dry` | den aufgelösten Plan ausgeben, nichts schreiben, nichts senden | aus |
| `--mailtrap-token <t>` | Mailtrap-API-Token | `MAILTRAP_TOKEN`-Env |
| `--model <id>` | Modell für verify / connect | `diffusiongemma-26b` |
| `--conc <n>` | Verify-Parallelität | `6` |
| `--router <url>` | 9Router-Basis | `http://localhost:20128` |
| `--router-password <pw>` | 9Router-Dashboard-Passwort | `123456` |

**Parallele Kampagnen:** Gib jedem Worker sein eigenes `--dir` und `--keys`; zwei Worker, die sich ein Verzeichnis teilen, schreiben denselben Slot und verlieren einen Datensatz pro Kollision (gemessen).

## 🛰️ Hinter einem Proxy

codiv.ai schützt die Registrierung mit Cloudflare Turnstile und mailt einen Verifizierungslink, daher muss das Lösen in einem echten Browser von einer sauberen Exit-IP aus erfolgen:

- **Chrome über CDP (Standard)** — starte deinen eigenen headful Chrome mit `--remote-debugging-port=9222` und richte `--cdp` darauf. Die Seite mit dem Widget wird in ihrem eigenen Browser-Kontext erstellt.
- **Proxy-Exit** — `--proxy socks5://…` oder `http://…` bindet den Exit der *Solve-Seite*. Cloudflare moderiert das Widget pro Exit-IP; eine Datacenter-Leitung besteht das Widget, antwortet aber nach dem Klick mit `fail code 600010`, also richte es auf einen wohnungsnahen Exit und erwarte, dass ein gegebener Exit bei starker Nutzung innerhalb von Stunden kippt.
- **Externer Solver** — `--solver-cmd "node my-solver.js"` überspringt Chrome vollständig; er läuft einmal pro Versuch mit `CODIV_SITEKEY` und `CODIV_URL` in der Umgebung, und das Token ist die letzte nicht-leere stdout-Zeile.
- **Direkter Abruf** — alles außer dem Solve ist reines HTTPS: die Mailtrap-API, die better-auth-Endpunkte und `https://api.codiv.ai/v1`.

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `out/codiv-keys.txt` | ein live-verifizierter `sk-codiv-…` pro Zeile — von Git ignoriert |
| `out/codiv-accounts/<slot>.json` | der vollständige Datensatz pro Konto (`signup`, `verify`, `actions`, `createKey`, `proof`) — von Git ignoriert |
| `out/codiv-batch.log` | Kampagnen-Log — von Git ignoriert |
| `proxies.txt` | deine Exits, einer pro Zeile — von Git ignoriert |
| `src/cli.js` · `src/launcher.js` | der Task-Runner und das CODIV-Banner |
| `src/connect-9router.js` | registriert die gespeicherten Schlüssel als 9Router-Verbindungen |

## 🔌 Mit 9Router verbinden

[9Router](https://9router.com) ist ein selbst gehosteter, OpenAI-kompatibler Router (`npm install -g 9router && 9router`, Dashboard auf `http://localhost:20128`). Registriere jeden Schlüssel in einem Durchgang:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Flags: `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. Der Node selbst wird mit Präfix `codiv` und Basis-URL `https://api.codiv.ai/v1` erstellt. Modelle werden dann als `codiv/<model id>` bereitgestellt und über alle Schlüssel lastverteilt.

## 🔌 Mit OmniRoute verbinden

[OmniRoute](https://omniroute.online) ist ein selbst gehosteter, OpenAI-kompatibler Router (`npm install -g omniroute && omniroute`, Dashboard auf `http://localhost:20128`). Registriere jeden Schlüssel in einem Durchgang:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<omniroute client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Flags: `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. Der Node selbst wird mit Präfix `codiv` und Basis-URL `https://api.codiv.ai/v1` erstellt. Modelle werden dann als `codiv/<model id>` bereitgestellt und über alle Schlüssel lastverteilt.
## 🔑 Was ein Schlüssel dir bringt

| | |
| --- | --- |
| 🏢 Anbieter | **codiv.ai** — [codiv.ai](https://codiv.ai) |
| 🎁 Was der Anbieter gibt | 100 Mio. kostenlose Eingabe-Tokens pro Konto — ein Konto pro Schlüssel |
| 🔑 Was ein Schlüssel dir bringt | einen API-Schlüssel, der auf sein eigenes Konto beschränkt ist: die 1 Modell-IDs am unten stehenden Endpunkt, im Rahmen der Limits deines Tarifs. Das Kontingent liegt beim **Konto**, weshalb dieses Tool genau ein Konto pro Schlüssel erstellt |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://api.codiv.ai/v1/chat/completions` |
| 🔒 Deine Daten | nur codiv.ai und das von dir konfigurierte Postfach-Backend werden kontaktiert; Schlüssel bleiben auf deinem Rechner |

## 🐞 Issues

Wenn codiv.ai seine Registrierungsform, das Turnstile-Widget oder die `createKey`-Action ändert, stoppt das Tool an diesem Schritt und sagt es dir. **[Öffne ein Issue](../../issues)** mit dem ausgeführten Befehl und der exakten Ausgabe; PRs sind willkommen.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 codiv-bulk-apikey contributors

</div>