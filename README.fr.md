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

**Créez en masse des comptes codiv.ai avec des clés API générées automatiquement — inférence compatible OpenAI (`sk-codiv-…`, 100 M de jetons d'entrée gratuits par compte) + connecteur 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Niveau gratuit](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-1-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 Niveau gratuit — ce que vous obtenez

**Chaque nouveau compte codiv.ai bénéficie de 100 M de jetons d'entrée gratuits — sans carte.**

| Élément | Valeur |
| --- | --- |
| Allocation | **100 000 000 de jetons d'entrée gratuits** par compte |
| Carte requise | **Non** |
| Inscription | e-mail + mot de passe via `POST /api/auth/sign-up/email` (better-auth), lien e-mail vérifié depuis une boîte Mailtrap |
| Captcha | Cloudflare **Turnstile** à l'inscription — résolu dans **votre propre Chrome avec interface** via CDP, ou par un solveur externe que vous possédez déjà |
| Format de clé | `sk-codiv-…` |
| L'unité qui évolue | **un compte = une clé** → `--count N` signifie en réalité « N comptes gratuits » |

> 💡 L'allocation est définie par codiv.ai et peut changer. Revérifiez votre propre fichier à tout moment :

```bash
node src/cli.js verify      # every saved key answers a live chat 200 or is reported
```

> 💡 Le niveau gratuit est défini par codiv.ai et peut changer. Consultez les chiffres en direct sur [codiv.ai](https://codiv.ai) — et laissez le contrôle propre de l'outil décider :

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modèles — tous les 1

`POST https://api.codiv.ai/v1/chat/completions` est la surface sur laquelle cet outil valide chaque clé.

| Modèle | Appel tel quel dans 9Router | Statut |
| --- | --- | --- |
| `diffusiongemma-26b` | `codiv/diffusiongemma-26b` | ✅ `200` — le modèle sur lequel chaque création est validée |

La clé est générée à partir de l'action serveur propre au tableau de bord et les 100 M de jetons d'entrée gratuits du compte la financent, donc `diffusiongemma-26b` est la valeur par défaut pour `verify` et `connect` ; `--model <id>` en fixe un autre. Actualisez la liste côté routeur avec :

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
```

## 🧪 Comment utiliser l'API

L'URL de base est **`https://api.codiv.ai/v1`** — compatible OpenAI, donc tout ce qui parle OpenAI fonctionne (SDK, Cursor, OpenCode, Kilo Code, …).

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

## ⚡ Une seule commande

```bash
node src/cli.js --count N      # mint N accounts + keys — the captcha is solved automatically
node src/cli.js --dry          # print the resolved plan: writes nothing, sends nothing
```

`--auto` est la valeur par défaut : le `src/solver.js` intégré monte le propre widget Turnstile de codiv.ai dans le Chrome que vous contrôlez (`--cdp`, ou démarrez-le avec `--remote-debugging-port=9222`) et renvoie le jeton — une seule commande, rien d'autre à exécuter. `--no-auto` désactive la résolution intégrée ; les échappatoires avancées sont destinées aux opérateurs qui possèdent déjà un solveur et sont documentées dans `ADVANCED.md`.

> ⚠️ **Conditions et risque de compte.** Automatiser un fournisseur peut violer ses Conditions d'utilisation et entraîner le bannissement de comptes ou d'IP. Vous exécutez ceci sur des comptes que vous possédez, depuis votre propre machine, à vos propres risques ; l'outil ne fait que piloter la propre page d'inscription du site et ne contourne jamais un accès payant. Lisez les Conditions d'utilisation du fournisseur avant une grande campagne.

## 🛠 Démarrage rapide

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

`create` compte les clés déjà présentes dans le fichier de clés et reprend à partir de là, de sorte qu'une campagne peut être arrêtée et redémarrée sans perte de travail. Les clés arrivent dans `out/codiv-keys.txt`, une par ligne ; l'enregistrement complet de chaque compte arrive dans `out/codiv-accounts/`.

### 🖱️ Le lanceur

`node src/cli.js` affiche la bannière CODIV et la liste des tâches. Les tâches sont `mint` (un compte, à la demande), `create` (campagne), `verify`, `connect`, `list` et `token` (résoudre un seul jeton Turnstile pour le débogage). Les options sont lues avec `--name value`, donc rien n'est caché derrière un fichier de configuration.

## ✅ Vérifié fonctionnel — chaque clé est testée

> **Contrôles qualité.** Chaque clé ici a passé un `chat-200` en direct avant d'être écrite dans `keys.txt`
> (les clés mortes ne sont jamais livrées). Les combinaisons de routeur suivent la même règle au niveau du modèle : une entrée est
> ajoutée **uniquement si le modèle répond `chat-200` et peut appeler des outils** — un modèle sans prise en charge des outils,
> une clé morte ou un fournisseur mort est écarté au lieu d'être ajouté. Fonctionne avec **9Router et OmniRoute**.

| Vérification | Résultat |
| --- | --- |
| création de compte | `POST /api/auth/sign-up/email` (better-auth) sur une boîte Mailtrap fraîche |
| vérification e-mail | le lien de vérification est extrait de la boîte ; better-auth connecte automatiquement lors de l'accès à la vérification, donc son `Set-Cookie` est la session |
| création de clé | l'action serveur Next.js du tableau de bord `createKey` (les ids sont redécouverts dans les chunks déployés à chaque exécution, car les redéploiements les font tourner) renvoie la nouvelle clé dans sa réponse RSC |
| preuve en direct | `POST https://api.codiv.ai/v1/chat/completions` (`diffusiongemma-26b`) doit répondre `200` avant que la clé ne compte |
| une clé qui échoue au contrôle de chat | jamais écrite — le compte reste récupérable dans son JSON par emplacement |

Mesuré sur de vraies campagnes : un compte = **100 M de jetons d'entrée gratuits** ; une création coûte ≈ **80-115 s** (une résolution Turnstile + un e-mail de vérification), et les jetons Turnstile sont liés à la sortie de résolution, donc un jeton rejeté est réessayé avec une toute nouvelle résolution (jusqu'à 4 tentatives).

## 🧭 Comment ça marche

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: codiv.ai page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.codiv.ai/v1/chat/completions → real content = the key is live
```

| Étape | Appel | Notes |
| --- | --- | --- |
| boîte | API publique Mailtrap | une boîte de réception entrante fraîche par compte |
| Turnstile | le propre widget du site (sitekey `0x4AAAAAAE7hE0DIArlj6rXX`) monté dans votre Chrome et cliqué via CDP | le jeton est renvoyé comme en-tête `x-captcha-response` |
| inscription | `POST /api/auth/sign-up/email` | better-auth |
| vérification | lien de vérification depuis la boîte | le `Set-Cookie` sur cet accès est la session |
| clé | action serveur du tableau de bord `createKey` | clé en clair renvoyée une fois |
| preuve | `POST https://api.codiv.ai/v1/chat/completions` | `200` en direct requis avant que la clé ne soit enregistrée |

## ⚙️ Options CLI

```bash
node src/cli.js mint                     # one account + key
node src/cli.js create --count 200       # campaign: mint N keys (resume-safe)
node src/cli.js verify                   # prove saved keys with a live chat call
node src/cli.js connect                  # register keys into 9Router
node src/cli.js list                     # list saved keys (masked)
node src/cli.js token                    # solve one Turnstile token (debug)
```

| Option | Signification | Défaut |
| --- | --- | --- |
| `--count <n>` | taille de la campagne | `200` |
| `--dir <name>` | répertoire des comptes par worker sous `out/` | `codiv-accounts` |
| `--keys <file>` | fichier de clés | `out/codiv-keys.txt` |
| `--pause <ms>` | délai entre les créations | `5000` |
| `--cdp <url>` | point de terminaison Chrome DevTools | `http://127.0.0.1:9222` |
| `--proxy <url>` | sortie de la page de résolution (`socks5://` / `http://`) | direct |
| `--solver-cmd <cmd>` | solveur Turnstile externe | — |
| `--auto` | résoudre le captcha avec le `src/solver.js` intégré | activé (défaut) |
| `--no-auto` | désactiver le solveur intégré | désactivé |
| `--dry` | afficher le plan résolu, ne rien écrire, ne rien envoyer | désactivé |
| `--mailtrap-token <t>` | jeton API Mailtrap | variable d'env `MAILTRAP_TOKEN` |
| `--model <id>` | modèle pour verify / connect | `diffusiongemma-26b` |
| `--conc <n>` | concurrence de vérification | `6` |
| `--router <url>` | base 9Router | `http://localhost:20128` |
| `--router-password <pw>` | mot de passe du tableau de bord 9Router | `123456` |

**Campagnes parallèles :** donnez à chaque worker son propre `--dir` et `--keys` ; deux workers partageant un même répertoire écrivent le même emplacement et perdent un enregistrement par collision (mesuré).

## 🛰️ Derrière un proxy

codiv.ai protège l'inscription avec Cloudflare Turnstile et envoie un lien de vérification par e-mail, donc la résolution doit se faire dans un vrai navigateur depuis une IP de sortie propre :

- **Chrome via CDP (défaut)** — démarrez votre propre Chrome avec interface avec `--remote-debugging-port=9222` et pointez `--cdp` dessus. La page portant le widget est créée dans son propre contexte de navigateur.
- **Sortie proxy** — `--proxy socks5://…` ou `http://…` fixe la sortie de la *page de résolution*. Cloudflare modère le widget par IP de sortie ; une ligne de datacenter passe le widget mais répond `fail code 600010` après le clic, donc pointez-la vers une sortie de type résidentiel et attendez-vous à ce qu'une sortie donnée bascule en quelques heures sous forte utilisation.
- **Solveur externe** — `--solver-cmd "node my-solver.js"` contourne entièrement Chrome ; il s'exécute une fois par tentative avec `CODIV_SITEKEY` et `CODIV_URL` dans l'environnement, et le jeton est la dernière ligne non vide de stdout.
- **Requête directe** — tout sauf la résolution est du HTTPS simple : l'API Mailtrap, les points de terminaison better-auth et `https://api.codiv.ai/v1`.

## 📄 Fichiers

| Chemin | Contenu |
| --- | --- |
| `out/codiv-keys.txt` | une `sk-codiv-…` vérifiée en direct par ligne — ignoré par git |
| `out/codiv-accounts/<slot>.json` | l'enregistrement complet par compte (`signup`, `verify`, `actions`, `createKey`, `proof`) — ignoré par git |
| `out/codiv-batch.log` | journal de campagne — ignoré par git |
| `proxies.txt` | vos sorties, une par ligne — ignoré par git |
| `src/cli.js` · `src/launcher.js` | l'exécuteur de tâches et la bannière CODIV |
| `src/connect-9router.js` | enregistre les clés sauvegardées comme connexions 9Router |

## 🔌 Se connecter à 9Router

[9Router](https://9router.com) est un routeur auto-hébergé compatible OpenAI (`npm install -g 9router && 9router`, tableau de bord sur `http://localhost:20128`). Enregistrez chaque clé en une seule passe :

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Options : `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. Le nœud lui-même est créé avec le préfixe `codiv` et l'URL de base `https://api.codiv.ai/v1`. Les modèles sont ensuite servis sous `codiv/<model id>` et répartis sur chaque clé.

## 🔌 Se connecter à OmniRoute

[OmniRoute](https://omniroute.online) est un routeur auto-hébergé compatible OpenAI (`npm install -g omniroute && omniroute`, tableau de bord sur `http://localhost:20128`). Enregistrez chaque clé en une seule passe :

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<omniroute client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Options : `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. Le nœud lui-même est créé avec le préfixe `codiv` et l'URL de base `https://api.codiv.ai/v1`. Les modèles sont ensuite servis sous `codiv/<model id>` et répartis sur chaque clé.
## 🔑 Ce qu'une clé vous apporte

| | |
| --- | --- |
| 🏢 Fournisseur | **codiv.ai** — [codiv.ai](https://codiv.ai) |
| 🎁 Ce que le fournisseur donne | 100 M de jetons d'entrée gratuits par compte — un compte par clé |
| 🔑 Ce qu'une clé vous apporte | une clé API limitée à son propre compte : les 1 ids de modèle sur le point de terminaison ci-dessous, aux limites de votre forfait. Le quota vit sur le **compte**, ce qui explique précisément pourquoi cet outil crée un compte par clé |
| 🌐 Forme de l'API | compatible OpenAI : `POST https://api.codiv.ai/v1/chat/completions` |
| 🔒 Vos données | seuls codiv.ai et le backend de boîte que vous configurez sont contactés ; les clés restent sur votre machine |

## 🐞 Problèmes

Si codiv.ai modifie la forme de son inscription, le widget Turnstile ou l'action `createKey`, l'outil s'arrête à cette étape et le signale. **[Ouvrez un ticket](../../issues)** avec la commande que vous avez exécutée et la sortie exacte ; les PR sont bienvenues.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 codiv-bulk-apikey contributors

</div>