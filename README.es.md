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

**Crea cuentas de codiv.ai en masa con claves API autogeneradas — inferencia compatible con OpenAI (`sk-codiv-…`, 100M de tokens de entrada gratuitos por cuenta) + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-1-of-them) · [🧪 Usa la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 Nivel gratuito — cuánto obtienes

**Cada cuenta nueva de codiv.ai incluye 100M de tokens de entrada gratuitos — sin tarjeta.**

| Qué | Valor |
| --- | --- |
| Asignación | **100.000.000 de tokens de entrada gratuitos** por cuenta |
| Tarjeta requerida | **No** |
| Registro | correo electrónico + contraseña mediante `POST /api/auth/sign-up/email` (better-auth), enlace de correo verificado desde una bandeja de entrada de Mailtrap |
| Captcha | Cloudflare **Turnstile** en el registro — resuelto en **tu propio Chrome con interfaz gráfica** vía CDP, o mediante un solucionador externo que ya tengas |
| Formato de la clave | `sk-codiv-…` |
| La unidad que escala | **una cuenta = una clave** → `--count N` en realidad significa "N cuentas gratuitas" |

> 💡 La asignación la establece codiv.ai y puede cambiar. Vuelve a comprobar tu propio archivo en cualquier momento:

```bash
node src/cli.js verify      # every saved key answers a live chat 200 or is reported
```

> 💡 El nivel gratuito lo establece codiv.ai y puede cambiar. Consulta las cifras en vivo en [codiv.ai](https://codiv.ai) — y deja que la propia verificación de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 1 que hay

`POST https://api.codiv.ai/v1/chat/completions` es la superficie contra la que esta herramienta comprueba cada clave.

| Modelo | Llamada como en 9Router | Estado |
| --- | --- | --- |
| `diffusiongemma-26b` | `codiv/diffusiongemma-26b` | ✅ `200` — el modelo contra el que se comprueba cada creación |

La clave se acuña desde la propia acción de servidor del panel y los 100M de tokens de entrada gratuitos de la cuenta la pagan, por lo que `diffusiongemma-26b` es el valor predeterminado tanto para `verify` como para `connect`; `--model <id>` fija otro. Actualiza la lista del lado del router con:

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
```

## 🧪 Cómo usar la API

La URL base es **`https://api.codiv.ai/v1`** — compatible con OpenAI, así que cualquier cosa que hable OpenAI funciona (SDKs, Cursor, OpenCode, Kilo Code, …).

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

## ⚡ Un solo comando

```bash
node src/cli.js --count N      # mint N accounts + keys — the captcha is solved automatically
node src/cli.js --dry          # print the resolved plan: writes nothing, sends nothing
```

`--auto` es el valor predeterminado: el `src/solver.js` integrado monta el propio widget de Turnstile de codiv.ai en el Chrome que tú controlas (`--cdp`, o inícialo con `--remote-debugging-port=9222`) y devuelve el token — un solo comando, nada más que ejecutar. `--no-auto` desactiva la resolución integrada; las vías de escape avanzadas son para operadores que ya tienen un solucionador propio y están documentadas en `ADVANCED.md`.

> ⚠️ **Términos y riesgo de cuenta.** Automatizar un proveedor puede violar sus Términos de Servicio y provocar el baneo de cuentas o IPs. Ejecutas esto en cuentas que te pertenecen, desde tu propia máquina, bajo tu propio riesgo; la herramienta solo maneja la propia página de registro del sitio y nunca elude una barrera de pago. Lee los Términos de Servicio del proveedor antes de una campaña grande.

## 🛠 Inicio rápido

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

`create` cuenta las claves que ya están en el archivo de claves y continúa desde ahí, por lo que una campaña puede detenerse y reiniciarse sin perder trabajo. Las claves se guardan en `out/codiv-keys.txt`, una por línea; el registro completo de cada cuenta se guarda en `out/codiv-accounts/`.

### 🖱️ El lanzador

`node src/cli.js` imprime el banner de CODIV y la lista de tareas. Las tareas son `mint` (una cuenta, bajo demanda), `create` (campaña), `verify`, `connect`, `list` y `token` (resolver un único token de Turnstile para depuración). Los flags se leen con `--name value`, así que nada queda oculto tras un archivo de configuración.

## ✅ Verificado y funcionando — cada clave se prueba

> **Controles de calidad.** Cada clave aquí pasó un `chat-200` en vivo antes de escribirse en `keys.txt`
> (las claves muertas nunca se entregan). Las combinaciones del router siguen la misma regla a nivel de modelo: una entrada se
> añade **solo si el modelo responde `chat-200` y puede llamar a herramientas** — un modelo sin soporte de herramientas,
> una clave muerta o un proveedor muerto se descarta en lugar de añadirse. Funciona con **9Router y OmniRoute**.

| Comprobación | Resultado |
| --- | --- |
| creación de cuenta | `POST /api/auth/sign-up/email` (better-auth) en una bandeja de entrada nueva de Mailtrap |
| verificación de correo | el enlace de verificación se extrae de la bandeja de entrada; better-auth inicia sesión automáticamente al acceder a la verificación, por lo que su `Set-Cookie` es la sesión |
| creación de clave | la acción de servidor de Next.js del panel `createKey` (los ids se redescubren desde los chunks desplegados en cada ejecución, porque los redespliegues los rotan) devuelve la clave nueva en su respuesta RSC |
| prueba en vivo | `POST https://api.codiv.ai/v1/chat/completions` (`diffusiongemma-26b`) debe responder `200` antes de que la clave cuente |
| una clave que falla la comprobación de chat | nunca se escribe — la cuenta permanece recuperable en su JSON por ranura |

Medido en campañas reales: una cuenta = **100M de tokens de entrada gratuitos**; una creación cuesta ≈ **80-115 s** (una resolución de Turnstile + un correo de verificación), y los tokens de Turnstile están fijados a la salida de resolución, por lo que un token rechazado se reintenta con una resolución completamente nueva (hasta 4 intentos).

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: codiv.ai page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.codiv.ai/v1/chat/completions → real content = the key is live
```

| Paso | Llamada | Notas |
| --- | --- | --- |
| bandeja de entrada | API pública de Mailtrap | una bandeja de entrada entrante nueva por cuenta |
| Turnstile | el propio widget del sitio (sitekey `0x4AAAAAAE7hE0DIArlj6rXX`) montado en tu Chrome y pulsado vía CDP | el token se devuelve como la cabecera `x-captcha-response` |
| registro | `POST /api/auth/sign-up/email` | better-auth |
| verificación | enlace de verificación de la bandeja de entrada | el `Set-Cookie` de ese acceso es la sesión |
| clave | acción de servidor del panel `createKey` | clave en texto plano devuelta una vez |
| prueba | `POST https://api.codiv.ai/v1/chat/completions` | se requiere un `200` en vivo antes de guardar la clave |

## ⚙️ Opciones de la CLI

```bash
node src/cli.js mint                     # one account + key
node src/cli.js create --count 200       # campaign: mint N keys (resume-safe)
node src/cli.js verify                   # prove saved keys with a live chat call
node src/cli.js connect                  # register keys into 9Router
node src/cli.js list                     # list saved keys (masked)
node src/cli.js token                    # solve one Turnstile token (debug)
```

| Flag | Significado | Predeterminado |
| --- | --- | --- |
| `--count <n>` | tamaño de la campaña | `200` |
| `--dir <name>` | directorio de cuentas por worker bajo `out/` | `codiv-accounts` |
| `--keys <file>` | archivo de claves | `out/codiv-keys.txt` |
| `--pause <ms>` | retardo entre creaciones | `5000` |
| `--cdp <url>` | endpoint de Chrome DevTools | `http://127.0.0.1:9222` |
| `--proxy <url>` | salida de la página de resolución (`socks5://` / `http://`) | directa |
| `--solver-cmd <cmd>` | solucionador de Turnstile externo | — |
| `--auto` | resolver el captcha con el `src/solver.js` integrado | activado (predeterminado) |
| `--no-auto` | desactivar el solucionador integrado | desactivado |
| `--dry` | imprimir el plan resuelto, no escribir nada, no enviar nada | desactivado |
| `--mailtrap-token <t>` | token de la API de Mailtrap | variable de entorno `MAILTRAP_TOKEN` |
| `--model <id>` | modelo para verify / connect | `diffusiongemma-26b` |
| `--conc <n>` | concurrencia de verificación | `6` |
| `--router <url>` | base de 9Router | `http://localhost:20128` |
| `--router-password <pw>` | contraseña del panel de 9Router | `123456` |

**Campañas en paralelo:** dale a cada worker su propio `--dir` y `--keys`; dos workers que comparten un directorio escriben la misma ranura y pierden un registro por colisión (medido).

## 🛰️ Detrás de un proxy

codiv.ai protege el registro con Cloudflare Turnstile y envía por correo un enlace de verificación, por lo que la resolución debe ocurrir en un navegador real desde una IP de salida limpia:

- **Chrome vía CDP (predeterminado)** — inicia tu propio Chrome con interfaz gráfica con `--remote-debugging-port=9222` y apunta `--cdp` a él. La página que contiene el widget se crea en su propio contexto de navegador.
- **Salida por proxy** — `--proxy socks5://…` o `http://…` fija la salida de la *página de resolución*. Cloudflare modera el widget por IP de salida; una línea de centro de datos pasa el widget pero responde `fail code 600010` tras el clic, así que apúntalo a una salida de tipo residencial y espera que una salida dada cambie en cuestión de horas bajo uso intenso.
- **Solucionador externo** — `--solver-cmd "node my-solver.js"` omite Chrome por completo; se ejecuta una vez por intento con `CODIV_SITEKEY` y `CODIV_URL` en el entorno, y el token es la última línea no vacía de stdout.
- **Obtención directa** — todo excepto la resolución es HTTPS simple: la API de Mailtrap, los endpoints de better-auth y `https://api.codiv.ai/v1`.

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `out/codiv-keys.txt` | una `sk-codiv-…` verificada en vivo por línea — ignorada por git |
| `out/codiv-accounts/<slot>.json` | el registro completo por cuenta (`signup`, `verify`, `actions`, `createKey`, `proof`) — ignorado por git |
| `out/codiv-batch.log` | registro de la campaña — ignorado por git |
| `proxies.txt` | tus salidas, una por línea — ignorado por git |
| `src/cli.js` · `src/launcher.js` | el ejecutor de tareas y el banner de CODIV |
| `src/connect-9router.js` | registra las claves guardadas como conexiones de 9Router |

## 🔌 Conectar con 9Router

[9Router](https://9router.com) es un router autoalojado y compatible con OpenAI (`npm install -g 9router && 9router`, panel en `http://localhost:20128`). Registra cada clave en una sola pasada:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Flags: `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. El propio nodo se crea con el prefijo `codiv` y la URL base `https://api.codiv.ai/v1`. Los modelos se sirven entonces como `codiv/<model id>` y se equilibran la carga entre todas las claves.

## 🔌 Conectar con OmniRoute

[OmniRoute](https://omniroute.online) es un router autoalojado y compatible con OpenAI (`npm install -g omniroute && omniroute`, panel en `http://localhost:20128`). Registra cada clave en una sola pasada:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<omniroute client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Flags: `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. El propio nodo se crea con el prefijo `codiv` y la URL base `https://api.codiv.ai/v1`. Los modelos se sirven entonces como `codiv/<model id>` y se equilibran la carga entre todas las claves.
## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **codiv.ai** — [codiv.ai](https://codiv.ai) |
| 🎁 Qué da el proveedor | 100M de tokens de entrada gratuitos por cuenta — una cuenta por clave |
| 🔑 Qué te da una clave | una clave API limitada a su propia cuenta: los 1 ids de modelo en el endpoint de abajo, con los límites de tu plan. La cuota vive en la **cuenta**, que es exactamente por lo que esta herramienta crea una cuenta por clave |
| 🌐 Forma de la API | Compatible con OpenAI: `POST https://api.codiv.ai/v1/chat/completions` |
| 🔒 Tus datos | solo se contacta con codiv.ai y el backend de bandeja de entrada que configures; las claves permanecen en tu máquina |

## 🐞 Problemas

Si codiv.ai cambia la forma de su registro, el widget de Turnstile o la acción `createKey`, la herramienta se detiene en ese paso y lo indica. **[Abre un issue](../../issues)** con el comando que ejecutaste y la salida exacta; los PR son bienvenidos.

## 📄 Licencia

MIT © 2026 — consulta [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 codiv-bulk-apikey contributors

</div>