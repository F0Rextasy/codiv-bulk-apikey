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

**Crea en masa cuentas de [codiv.ai](https://codiv.ai), genera una API key `sk-codiv-…` para cada una (100M tokens de entrada gratis por cuenta) y registra todas las keys en una instancia de [9Router](https://9router.com) en ejecución, de principio a fin. Sin dependencias.**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](../LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://api.codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-conectar-con-9router)
[![Transport](https://img.shields.io/badge/transport-HTTP%20%7C%20SOCKS5%20%7C%20CDP-0EA5E9.svg?style=for-the-badge)](#-transportes)
[![Mailtrap](https://img.shields.io/badge/inbox-Mailtrap-22C55E.svg?style=for-the-badge)](https://mailtrap.io)
[![Languages](https://img.shields.io/badge/i18n-5%20languages-F59E0B.svg?style=for-the-badge)](#)

[English](../README.md) · [Bahasa Indonesia](README.id.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Deutsch](README.de.md)

</div>

---

## ✨ Características

- 🔑 **Cuentas y API keys en masa** — genera cientos de keys `sk-codiv-…` a través del propio backend del dashboard de codiv.ai.
- 💰 **100M tokens de entrada gratis** — cada cuenta incluye 100M tokens de entrada gratis. Sin tarjeta.
- 🔌 **Conector de 9Router** — cada key se registra como una conexión compatible con OpenAI bajo el prefijo `codiv`, en una sola pasada.
- 🧠 **Resolución real de Turnstile** — el widget del propio sitio se monta en `codiv.ai/signup` dentro de *tu* Chrome y se hace clic sobre él por CDP.
- 🪶 **Sin dependencias** — WebSocket RFC6455 y cliente CDP escritos a mano. Sin `npm install`, sin paso de compilación.
- ⏱️ **~80-115 s por cuenta** — una resolución de Turnstile y un correo de verificación, de principio a fin.
- ✅ **Keys comprobadas** — cada key debe responder con un chat real `200` antes de guardarse.
- 🌍 **5 idiomas** — EN, ID, ZH, JA, ES, DE.

## 🚀 Inicio rápido

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

`create` cuenta las keys que ya hay en el archivo de keys y reanuda desde ahí, de modo que una campaña puede detenerse y reiniciarse sin perder trabajo.

## 🛠 Uso

```bash
codiv-bulk mint                     # create one account + key
codiv-bulk create --count 200       # campaign: mint N keys (resume-safe)
codiv-bulk verify                   # prove saved keys with a live chat call
codiv-bulk connect                  # register keys into 9Router
codiv-bulk list                     # list saved keys (masked)
codiv-bulk token                    # solve one Turnstile token (debug)
```

| Flag | Descripción | Por defecto |
| --- | --- | --- |
| `--count <n>` | tamaño de la campaña | `200` |
| `--dir <name>` | directorio de cuentas por worker bajo `out/` | `codiv-accounts` |
| `--keys <file>` | archivo de keys | `out/codiv-keys.txt` |
| `--pause <ms>` | pausa entre generaciones | `5000` |
| `--out <file>` | registro de una generación | `out/codiv-account.json` |
| `--log <file>` | log de la campaña | `out/codiv-batch.log` |
| `--cdp <url>` | endpoint de Chrome DevTools | `http://127.0.0.1:9222` |
| `--proxy <url>` | salida de la página de resolución (`socks5://`/`http://`) | directa |
| `--token <t>` | un token manual de Turnstile | — |
| `--attempts <n>` | intentos de resolución por generación | `2` |
| `--solver-cmd <cmd>` | solver externo (ver más abajo) | — |
| `--mailtrap-token <t>` | token de API de Mailtrap | variable de entorno `MAILTRAP_TOKEN` |
| `--folder <name>` | carpeta de Mailtrap | `codiv` |
| `--model <id>` | modelo para verify/connect | `diffusiongemma-26b` |
| `--conc <n>` | concurrencia de verify | `6` |
| `--router <url>` | base de 9Router | `http://localhost:20128` |
| `--router-password <pw>` | contraseña del dashboard de 9Router | `123456` |

## 🌐 Transportes

codiv.ai protege el registro con Cloudflare **Turnstile** y envía un enlace de verificación, así que la resolución debe ocurrir en un navegador real desde una IP de salida limpia:

- **Chrome por CDP (por defecto)** — arranca tu propio Chrome con `--remote-debugging-port=9222` (con ventana: una pestaña oculta se comporta de otro modo) y apunta `--cdp` a él. La página que lleva el widget se crea en su propio contexto de navegador.
- **Salida por proxy** — `--proxy socks5://…` o `http://…` fija la salida de la *página de resolución*. Cloudflare modera el widget por IP de salida; una línea de centro de datos pasa el widget pero responde `fail code 600010` tras el clic.
- **Solver externo** — `--solver-cmd "node my-solver.js"` omite Chrome por completo; se ejecuta una vez por intento con `CODIV_SITEKEY` y `CODIV_URL` en el entorno, y el token es la última línea no vacía de stdout. `--token <t>` aporta un token manual para una única generación.
- **Fetch directo** — todo salvo la resolución es HTTPS normal: la API de Mailtrap, los endpoints de better-auth y `https://api.codiv.ai/v1`.

Vía de entrada: una bandeja de entrada [Mailtrap](https://mailtrap.io) nueva por cuenta, creada a través de su API pública con `--mailtrap-token` / `MAILTRAP_TOKEN`.

## 🔌 Conectar con 9Router

9Router es un router compatible con OpenAI y autoalojado:

```bash
npm install -g 9router && 9router        # dashboard on http://localhost:20128
```

Registra todas tus keys con un solo comando (crea el provider-node `codiv` y adjunta cada key):

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Llámalo como cualquier endpoint de OpenAI:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"codiv/diffusiongemma-26b","messages":[{"role":"user","content":"hi"}]}'
```

## 🧠 Modelos disponibles

| Modelo | Cómo invocarlo en 9Router | Estado |
| --- | --- | --- |
| diffusiongemma-26b | `codiv/diffusiongemma-26b` | ✅ `200` — el modelo contra el que se comprueba cada generación |

La key se genera a partir de la server action del dashboard y la pagan los 100M tokens de entrada gratis de la cuenta, así que `diffusiongemma-26b` es el valor por defecto tanto para `verify` como para `connect`; `--model <id>` fija otro. Actualiza la lista del lado del router con:

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
```

## 🔁 Campañas en paralelo

Dale a cada worker su propio `--dir` y sus propias `--keys`: dos workers que comparten un directorio escriben el mismo hueco `<start+i>.json` y pierden un registro por colisión (medido).

```bash
node src/cli.js create --count 65 --dir w1 --keys out/codiv-keys-w1.txt &
node src/cli.js create --count 65 --dir w2 --keys out/codiv-keys-w2.txt &
node src/cli.js create --count 65 --dir w3 --keys out/codiv-keys-w3.txt &
wait
```

## 🧩 Solver externo

Si ya tienes un solver de Turnstile, omite la ruta integrada de Chrome:

```bash
codiv-bulk mint --solver-cmd "node my-solver.js"   # or --token <t> for one manual token
```

`--solver-cmd` se ejecuta una vez por intento con `CODIV_SITEKEY` y `CODIV_URL` en el entorno, y el token es la última línea no vacía de stdout.

## 📚 Como biblioteca

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

## ⚙️ Cómo funciona

1. **Maildrop** — se crea una bandeja de entrada de Mailtrap nueva por cuenta para el correo de verificación.
2. **Turnstile** — el widget del propio sitio (sitekey `0x4AAAAAAE7hE0DIArlj6rXX`) se monta en `codiv.ai/signup` en tu Chrome y se hace clic por CDP; el token vuelve como cabecera `x-captcha-response`.
3. **Registro** — `POST /api/auth/sign-up/email` (better-auth).
4. **Verificación** — el enlace de verificación se extrae de la bandeja de entrada; better-auth inicia sesión automáticamente al llegar a la verificación, así que su `Set-Cookie` es la sesión.
5. **Creación de la key** — la server action de Next.js del dashboard, `createKey` (sus ids se redescubren de los chunks desplegados en cada ejecución, porque los redespliegues los rotan) devuelve la key nueva en su respuesta RSC.
6. **Prueba** — una llamada de chat real a `https://api.codiv.ai/v1` (`diffusiongemma-26b`) debe responder `200` antes de que la key cuente.
7. **Guardado** — un `sk-codiv-…` por línea en el archivo de keys; el registro completo queda en el JSON de cuenta de su hueco.

### Comportamiento medido

- Una cuenta = **100M tokens de entrada gratis**; sin tarjeta.
- Coste de generación ≈ **80-115 s por cuenta** (una resolución de Turnstile y un correo de verificación).
- Un lote de 65 keys por worker sostuvo **~55 generaciones correctas**; el modo de fallo es el timeout de **420 s** por generación, no una escritura parcial.
- Los tokens de Turnstile quedan fijados a la salida que los resolvió; Cloudflare rechaza una parte de los tokens nuevos con `VERIFICATION_FAILED`, y la generación reintenta con una resolución completamente nueva (hasta 4 intentos).
- Una salida de centro de datos pasa el widget, pero el reto responde `fail code 600010` tras el clic — apunta `--proxy` a una salida más residencial y ten en cuenta que una salida dada puede volverse inestable en cuestión de horas tras un uso intenso.

## 📁 Estructura

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

## ⚠️ Notas

- Requisitos: un **token de Mailtrap** (bandejas de verificación) y un **Chrome con `--remote-debugging-port=9222`** (tu propio Chrome, con ventana — una pestaña oculta se comporta de otro modo).
- Las keys se comprueban con un chat real `200` antes de guardarse; el registro conserva cada paso (`signup`, `verify`, `actions`, `createKey`, `proof`).
- El archivo de keys guarda un `sk-codiv-…` por línea; `create` reanuda desde lo que ya haya allí.
- Las cuentas y las keys son tuyas; no se envía nada a ninguna parte salvo a codiv.ai, Mailtrap y (opcionalmente) tu 9Router.
- Para automatización personal y educativa. Respeta las condiciones de servicio de codiv.ai, Mailtrap y 9Router.

## 📄 Licencia

[MIT](../LICENSE) © 2026 codiv-bulk-apikey contributors
