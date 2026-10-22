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

**Crie contas codiv.ai em massa com chaves de API geradas automaticamente — inferência compatível com OpenAI (`sk-codiv-…`, 100M de tokens de entrada gratuitos por conta) + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Nível gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-1-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 Nível gratuito — quanto você recebe

**Toda nova conta codiv.ai traz 100M de tokens de entrada gratuitos — sem cartão.**

| O quê | Valor |
| --- | --- |
| Franquia | **100.000.000 de tokens de entrada gratuitos** por conta |
| Cartão exigido | **Não** |
| Cadastro | e-mail + senha via `POST /api/auth/sign-up/email` (better-auth), link de e-mail verificado a partir de uma caixa de entrada Mailtrap |
| Captcha | Cloudflare **Turnstile** no cadastro — resolvido no **seu próprio Chrome com interface gráfica** via CDP, ou por um solucionador externo que você já tenha |
| Formato da chave | `sk-codiv-…` |
| A unidade que escala | **uma conta = uma chave** → `--count N` na verdade significa "N contas gratuitas" |

> 💡 A franquia é definida pela codiv.ai e pode mudar. Revalide seu próprio arquivo a qualquer momento:

```bash
node src/cli.js verify      # every saved key answers a live chat 200 or is reported
```

> 💡 O nível gratuito é definido pela codiv.ai e pode mudar. Confira os números atuais em [codiv.ai](https://codiv.ai) — e deixe o próprio gate da ferramenta decidir:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — todos os 1 deles

`POST https://api.codiv.ai/v1/chat/completions` é a superfície contra a qual esta ferramenta comprova cada chave.

| Modelo | Chame como em 9Router | Status |
| --- | --- | --- |
| `diffusiongemma-26b` | `codiv/diffusiongemma-26b` | ✅ `200` — o modelo contra o qual cada criação é comprovada |

A chave é criada a partir da própria server action do painel e os 100M de tokens de entrada gratuitos da conta a custeiam, então `diffusiongemma-26b` é o padrão tanto para `verify` quanto para `connect`; `--model <id>` fixa outro. Atualize a lista do lado do roteador com:

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
```

## 🧪 Como usar a API

A URL base é **`https://api.codiv.ai/v1`** — compatível com OpenAI, então qualquer coisa que fale OpenAI funciona (SDKs, Cursor, OpenCode, Kilo Code, …).

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

## 🛠 Início rápido

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

`create` conta as chaves já presentes no arquivo de chaves e retoma a partir dali, então uma campanha pode ser interrompida e reiniciada sem perder trabalho. As chaves ficam em `out/codiv-keys.txt`, uma por linha; o registro completo de cada conta fica em `out/codiv-accounts/`.

### 🖱️ O launcher

`node src/cli.js` imprime o banner CODIV e a lista de tarefas. As tarefas são `mint` (uma conta, sob demanda), `create` (campanha), `verify`, `connect`, `list` e `token` (resolver um único token Turnstile para depuração). As flags são lidas com `--name value`, então nada fica escondido atrás de um arquivo de configuração.

## ✅ Verificado e funcionando — toda chave é testada

> **Portões de qualidade.** Toda chave aqui passou por um `chat-200` ao vivo antes de ser gravada em `keys.txt`
> (chaves mortas nunca são entregues). As combinações do roteador seguem a mesma regra no nível do modelo: uma entrada é
> adicionada **somente se o modelo responder `chat-200` e puder chamar ferramentas** — um modelo sem suporte a ferramentas,
> uma chave morta ou um provedor morto é descartado em vez de adicionado. Funciona com **9Router e OmniRoute**.

| Verificação | Resultado |
| --- | --- |
| criação de conta | `POST /api/auth/sign-up/email` (better-auth) em uma caixa de entrada Mailtrap nova |
| verificação de e-mail | o link de verificação é obtido da caixa de entrada; o better-auth faz login automático ao acessar a verificação, então seu `Set-Cookie` é a sessão |
| criação de chave | a server action `createKey` do Next.js do painel (os ids são redescobertos a partir dos chunks implantados a cada execução, porque reimplantações os rotacionam) retorna a nova chave em sua resposta RSC |
| prova ao vivo | `POST https://api.codiv.ai/v1/chat/completions` (`diffusiongemma-26b`) deve responder `200` antes de a chave contar |
| uma chave que falha na verificação de chat | nunca é gravada — a conta permanece recuperável em seu JSON por slot |

Medido em campanhas reais: uma conta = **100M de tokens de entrada gratuitos**; uma criação custa ≈ **80-115 s** (uma resolução de Turnstile + um e-mail de verificação), e os tokens Turnstile são fixados à saída de resolução, então um token rejeitado é repetido com uma resolução totalmente nova (até 4 tentativas).

## 🧭 Como funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: codiv.ai page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.codiv.ai/v1/chat/completions → real content = the key is live
```

| Etapa | Chamada | Observações |
| --- | --- | --- |
| caixa de entrada | API pública do Mailtrap | uma caixa de entrada nova por conta |
| Turnstile | o próprio widget do site (sitekey `0x4AAAAAAE7hE0DIArlj6rXX`) montado no seu Chrome e clicado via CDP | o token volta como o cabeçalho `x-captcha-response` |
| cadastro | `POST /api/auth/sign-up/email` | better-auth |
| verificação | link de verificação da caixa de entrada | o `Set-Cookie` nesse acesso é a sessão |
| chave | server action `createKey` do painel | chave em texto simples retornada uma vez |
| prova | `POST https://api.codiv.ai/v1/chat/completions` | `200` ao vivo exigido antes de a chave ser salva |

## ⚙️ Opções da CLI

```bash
node src/cli.js mint                     # one account + key
node src/cli.js create --count 200       # campaign: mint N keys (resume-safe)
node src/cli.js verify                   # prove saved keys with a live chat call
node src/cli.js connect                  # register keys into 9Router
node src/cli.js list                     # list saved keys (masked)
node src/cli.js token                    # solve one Turnstile token (debug)
```

| Flag | Significado | Padrão |
| --- | --- | --- |
| `--count <n>` | tamanho da campanha | `200` |
| `--dir <name>` | diretório de contas por worker sob `out/` | `codiv-accounts` |
| `--keys <file>` | arquivo de chaves | `out/codiv-keys.txt` |
| `--pause <ms>` | atraso entre criações | `5000` |
| `--cdp <url>` | endpoint do Chrome DevTools | `http://127.0.0.1:9222` |
| `--proxy <url>` | saída da página de resolução (`socks5://` / `http://`) | direto |
| `--solver-cmd <cmd>` | solucionador Turnstile externo | — |
| `--token <t>` | um token Turnstile manual | — |
| `--mailtrap-token <t>` | token da API do Mailtrap | env `MAILTRAP_TOKEN` |
| `--model <id>` | modelo para verify / connect | `diffusiongemma-26b` |
| `--conc <n>` | concorrência de verify | `6` |
| `--router <url>` | base do 9Router | `http://localhost:20128` |
| `--router-password <pw>` | senha do painel do 9Router | `123456` |

**Campanhas paralelas:** dê a cada worker seu próprio `--dir` e `--keys`; dois workers compartilhando um diretório gravam o mesmo slot e perdem um registro por colisão (medido).

## 🛰️ Atrás de um proxy

A codiv.ai protege o cadastro com Cloudflare Turnstile e envia um link de verificação por e-mail, então a resolução deve acontecer em um navegador real a partir de um IP de saída limpo:

- **Chrome via CDP (padrão)** — inicie seu próprio Chrome com interface gráfica com `--remote-debugging-port=9222` e aponte `--cdp` para ele. A página que contém o widget é criada em seu próprio contexto de navegador.
- **Saída por proxy** — `--proxy socks5://…` ou `http://…` fixa a saída da *página de resolução*. O Cloudflare modera o widget por IP de saída; uma linha de datacenter passa pelo widget mas responde `fail code 600010` após o clique, então aponte para uma saída residencial e espere que uma dada saída mude em questão de horas sob uso intenso.
- **Solucionador externo** — `--solver-cmd "node my-solver.js"` ignora o Chrome completamente; ele roda uma vez por tentativa com `CODIV_SITEKEY` e `CODIV_URL` no ambiente, e o token é a última linha não vazia do stdout.
- **Requisição direta** — tudo exceto a resolução é HTTPS simples: a API do Mailtrap, os endpoints do better-auth e `https://api.codiv.ai/v1`.

## 📄 Arquivos

| Caminho | Conteúdo |
| --- | --- |
| `out/codiv-keys.txt` | um `sk-codiv-…` verificado ao vivo por linha — ignorado pelo git |
| `out/codiv-accounts/<slot>.json` | o registro completo por conta (`signup`, `verify`, `actions`, `createKey`, `proof`) — ignorado pelo git |
| `out/codiv-batch.log` | log da campanha — ignorado pelo git |
| `proxies.txt` | suas saídas, uma por linha — ignorado pelo git |
| `src/cli.js` · `src/launcher.js` | o executor de tarefas e o banner CODIV |
| `src/connect-9router.js` | registra as chaves salvas como conexões do 9Router |

## 🔌 Conectar ao 9Router

[9Router](https://9router.com) é um roteador auto-hospedado e compatível com OpenAI (`npm install -g 9router && 9router`, painel em `http://localhost:20128`). Registre todas as chaves em uma única passada:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Flags: `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. O próprio nó é criado com o prefixo `codiv` e a URL base `https://api.codiv.ai/v1`. Os modelos são então servidos como `codiv/<model id>` e balanceados entre todas as chaves.

## 🔌 Conectar ao OmniRoute

[OmniRoute](https://omniroute.online) é um roteador auto-hospedado e compatível com OpenAI (`npm install -g omniroute && omniroute`, painel em `http://localhost:20128`). Registre todas as chaves em uma única passada:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<omniroute client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Flags: `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. O próprio nó é criado com o prefixo `codiv` e a URL base `https://api.codiv.ai/v1`. Os modelos são então servidos como `codiv/<model id>` e balanceados entre todas as chaves.
## 🔑 O que uma chave te dá

| | |
| --- | --- |
| 🏢 Provedor | **codiv.ai** — [codiv.ai](https://codiv.ai) |
| 🎁 O que o provedor dá | 100M de tokens de entrada gratuitos por conta — uma conta por chave |
| 🔑 O que uma chave te dá | uma chave de API limitada à sua própria conta: os 1 ids de modelo no endpoint abaixo, nos limites do seu plano. A cota fica na **conta**, que é exatamente por isso que esta ferramenta cria uma conta por chave |
| 🌐 Formato da API | Compatível com OpenAI: `POST https://api.codiv.ai/v1/chat/completions` |
| 🔒 Seus dados | apenas a codiv.ai e o backend de caixa de entrada que você configurar são contatados; as chaves ficam na sua máquina |

## 🐞 Problemas

Se a codiv.ai mudar o formato do cadastro, o widget Turnstile ou a ação `createKey`, a ferramenta para nessa etapa e avisa. **[Abra uma issue](../../issues)** com o comando que você executou e a saída exata; PRs são bem-vindos.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 codiv-bulk-apikey contributors

</div>