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

**Otomatik oluşturulan API anahtarlarıyla toplu codiv.ai hesabı açın — OpenAI uyumlu çıkarım (`sk-codiv-…`, hesap başına 100M ücretsiz giriş token'ı) + 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-1-of-them) · [🧪 API'yi kullanma](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy'ler](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 Ücretsiz katman — ne kadar alıyorsunuz

**Her yeni codiv.ai hesabı 100M ücretsiz giriş token'ı taşır — kart yok.**

| Ne | Değer |
| --- | --- |
| Kota | Hesap başına **100.000.000 ücretsiz giriş token'ı** |
| Kart gerekli mi | **Hayır** |
| Kayıt | `POST /api/auth/sign-up/email` (better-auth) üzerinden e-posta + parola, e-posta bağlantısı bir Mailtrap gelen kutusundan doğrulanır |
| Captcha | Kayıt sırasında Cloudflare **Turnstile** — CDP üzerinden **kendi başlı (headful) Chrome'unuzda** çözülür veya hâlihazırda sahip olduğunuz harici bir çözücü tarafından çözülür |
| Anahtar biçimi | `sk-codiv-…` |
| Ölçeklenen birim | **bir hesap = bir anahtar** → `--count N` aslında "N ücretsiz hesap" demektir |

> 💡 Kota codiv.ai tarafından belirlenir ve değişebilir. Kendi dosyanızı istediğiniz zaman yeniden kanıtlayın:

```bash
node src/cli.js verify      # every saved key answers a live chat 200 or is reported
```

> 💡 Ücretsiz katman codiv.ai tarafından belirlenir ve değişebilir. Güncel sayıları [codiv.ai](https://codiv.ai) adresinden kontrol edin — ve kararı aracın kendi kapısına bırakın:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modeller — hepsi 1 tane

`POST https://api.codiv.ai/v1/chat/completions`, bu aracın her anahtarı karşı kanıtladığı yüzeydir.

| Model | 9Router'da çağrım | Durum |
| --- | --- | --- |
| `diffusiongemma-26b` | `codiv/diffusiongemma-26b` | ✅ `200` — her üretimin karşı kanıtlandığı model |

Anahtar, kontrol panelinin kendi sunucu eylemiyle üretilir ve hesabın 100M ücretsiz giriş token'ı bunun bedelini öder; bu nedenle `diffusiongemma-26b` hem `verify` hem de `connect` için varsayılandır; `--model <id>` başka bir tanesini sabitler. Yönlendirici tarafındaki listeyi şununla yenileyin:

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
```

## 🧪 API nasıl kullanılır

Temel URL **`https://api.codiv.ai/v1`** — OpenAI uyumlu, yani OpenAI konuşan her şey çalışır (SDK'lar, Cursor, OpenCode, Kilo Code, …).

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

## ⚡ Tek komut

```bash
node src/cli.js --count N      # mint N accounts + keys — the captcha is solved automatically
node src/cli.js --dry          # print the resolved plan: writes nothing, sends nothing
```

`--auto` varsayılandır: gömülü `src/solver.js`, codiv.ai'nin kendi Turnstile widget'ını kontrol ettiğiniz Chrome'da (`--cdp`, ya da `--remote-debugging-port=9222` ile başlatın) bağlar ve token'ı geri verir — tek komut, çalıştırılacak başka bir şey yok. `--no-auto` gömülü çözümü kapatır; gelişmiş kaçış kapıları, hâlihazırda bir çözücüye sahip olan operatörler içindir ve `ADVANCED.md` içinde belgelenmiştir.

> ⚠️ **Şartlar ve hesap riski.** Bir sağlayıcıyı otomatikleştirmek, Hizmet Şartları'nı ihlal edebilir ve hesapların veya IP'lerin yasaklanmasına yol açabilir. Bunu sahip olduğunuz hesaplarda, kendi makinenizden, kendi riskinizle çalıştırırsınız; araç yalnızca sitenin kendi kayıt sayfasını sürer ve ücretli bir kapıyı asla atlatmaz. Büyük bir kampanyadan önce sağlayıcının ToS'unu okuyun.

## 🛠 Hızlı başlangıç

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

`create`, anahtar dosyasında zaten bulunan anahtarları sayar ve oradan devam eder, böylece bir kampanya iş kaybetmeden durdurulup yeniden başlatılabilir. Anahtarlar `out/codiv-keys.txt` dosyasına, her satırda bir tane olacak şekilde düşer; her hesabın tam kaydı `out/codiv-accounts/` içine düşer.

### 🖱️ Başlatıcı

`node src/cli.js`, CODIV banner'ını ve görev listesini yazdırır. Görevler `mint` (isteğe bağlı tek hesap), `create` (kampanya), `verify`, `connect`, `list` ve `token` (hata ayıklama için tek bir Turnstile token'ı çöz). Bayraklar `--name value` biçiminde okunur, yani hiçbir şey bir yapılandırma dosyasının arkasına gizlenmez.

## ✅ Çalıştığı doğrulandı — her anahtar test edilir

> **Kalite kapıları.** Buradaki her anahtar, `keys.txt` dosyasına yazılmadan önce canlı bir `chat-200` geçti
> (ölü anahtarlar asla gönderilmez). Yönlendirici kombinasyonları model düzeyinde aynı kuralı izler: bir giriş
> **yalnızca model `chat-200` yanıtlıyorsa ve araçları çağırabiliyorsa** eklenir — araç desteği olmayan bir model,
> ölü bir anahtar veya ölü bir sağlayıcı eklenmek yerine çıkarılır. **9Router ve OmniRoute** ile çalışır.

| Kontrol | Sonuç |
| --- | --- |
| hesap oluşturma | taze bir Mailtrap gelen kutusunda `POST /api/auth/sign-up/email` (better-auth) |
| e-posta doğrulama | doğrulama bağlantısı gelen kutusundan çekilir; better-auth doğrulama isabetinde otomatik oturum açar, yani `Set-Cookie`'si oturumdur |
| anahtar oluşturma | kontrol panelinin Next.js sunucu eylemi `createKey` (id'ler her çalıştırmada dağıtılan chunk'lardan yeniden keşfedilir, çünkü yeniden dağıtımlar bunları döndürür) taze anahtarı RSC yanıtında döndürür |
| canlı kanıt | `POST https://api.codiv.ai/v1/chat/completions` (`diffusiongemma-26b`), anahtar sayılmadan önce `200` yanıtlamalıdır |
| sohbet kontrolünde başarısız olan bir anahtar | asla yazılmaz — hesap, kendi slot JSON'unda kurtarılabilir kalır |

Gerçek kampanyalarda ölçüldü: bir hesap = **100M ücretsiz giriş token'ı**; bir üretim ≈ **80-115 sn** (bir Turnstile çözümü + bir doğrulama postası) ve Turnstile token'ları çözüm çıkışına sabitlenir, bu nedenle reddedilen bir token yepyeni bir çözümle yeniden denenir (4 denemeye kadar).

## 🧭 Nasıl çalışır

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: codiv.ai page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.codiv.ai/v1/chat/completions → real content = the key is live
```

| Adım | Çağrı | Notlar |
| --- | --- | --- |
| gelen kutusu | Mailtrap genel API'si | hesap başına taze bir gelen kutusu |
| Turnstile | sitenin kendi widget'ı (sitekey `0x4AAAAAAE7hE0DIArlj6rXX`) Chrome'unuzda bağlanır ve CDP üzerinden tıklanır | token `x-captcha-response` başlığı olarak geri gider |
| kayıt | `POST /api/auth/sign-up/email` | better-auth |
| doğrulama | gelen kutusundan doğrulama bağlantısı | o isabetteki `Set-Cookie` oturumdur |
| anahtar | kontrol paneli sunucu eylemi `createKey` | düz metin anahtar bir kez döndürülür |
| kanıt | `POST https://api.codiv.ai/v1/chat/completions` | anahtar kaydedilmeden önce canlı `200` gerekir |

## ⚙️ CLI seçenekleri

```bash
node src/cli.js mint                     # one account + key
node src/cli.js create --count 200       # campaign: mint N keys (resume-safe)
node src/cli.js verify                   # prove saved keys with a live chat call
node src/cli.js connect                  # register keys into 9Router
node src/cli.js list                     # list saved keys (masked)
node src/cli.js token                    # solve one Turnstile token (debug)
```

| Bayrak | Anlamı | Varsayılan |
| --- | --- | --- |
| `--count <n>` | kampanya boyutu | `200` |
| `--dir <name>` | `out/` altında işçi başına hesaplar dizini | `codiv-accounts` |
| `--keys <file>` | anahtar dosyası | `out/codiv-keys.txt` |
| `--pause <ms>` | üretimler arası gecikme | `5000` |
| `--cdp <url>` | Chrome DevTools uç noktası | `http://127.0.0.1:9222` |
| `--proxy <url>` | çözüm sayfası çıkışı (`socks5://` / `http://`) | doğrudan |
| `--solver-cmd <cmd>` | harici Turnstile çözücü | — |
| `--auto` | captcha'yı gömülü `src/solver.js` ile çöz | açık (varsayılan) |
| `--no-auto` | gömülü çözücüyü devre dışı bırak | kapalı |
| `--dry` | çözümlenen planı yazdır, hiçbir şey yazma, hiçbir şey gönderme | kapalı |
| `--mailtrap-token <t>` | Mailtrap API token'ı | `MAILTRAP_TOKEN` ortam değişkeni |
| `--model <id>` | verify / connect için model | `diffusiongemma-26b` |
| `--conc <n>` | verify eşzamanlılığı | `6` |
| `--router <url>` | 9Router temeli | `http://localhost:20128` |
| `--router-password <pw>` | 9Router kontrol paneli parolası | `123456` |

**Paralel kampanyalar:** her işçiye kendi `--dir` ve `--keys` değerini verin; tek bir dizini paylaşan iki işçi aynı slota yazar ve her çakışmada bir kayıt kaybeder (ölçüldü).

## 🛰️ Proxy arkasında

codiv.ai, kaydı Cloudflare Turnstile ile korur ve bir doğrulama bağlantısı postalar, bu nedenle çözümün temiz bir çıkış IP'sinden gerçek bir tarayıcıda gerçekleşmesi gerekir:

- **CDP üzerinden Chrome (varsayılan)** — kendi başlı Chrome'unuzu `--remote-debugging-port=9222` ile başlatın ve `--cdp` ile ona işaret edin. Widget'ı taşıyan sayfa kendi tarayıcı bağlamında oluşturulur.
- **Proxy çıkışı** — `--proxy socks5://…` veya `http://…`, *çözüm sayfasının* çıkışını sabitler. Cloudflare widget'ı çıkış IP'si başına denetler; bir veri merkezi hattı widget'ı geçer ancak tıklamadan sonra `fail code 600010` yanıtlar, bu nedenle onu konut benzeri bir çıkışa yönlendirin ve yoğun kullanım altında belirli bir çıkışın saatler içinde ters dönmesini bekleyin.
- **Harici çözücü** — `--solver-cmd "node my-solver.js"` Chrome'u tamamen atlar; her denemede ortamda `CODIV_SITEKEY` ve `CODIV_URL` ile bir kez çalışır ve token son boş olmayan stdout satırıdır.
- **Doğrudan getirme** — çözüm dışındaki her şey düz HTTPS'tir: Mailtrap'in API'si, better-auth uç noktaları ve `https://api.codiv.ai/v1`.

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `out/codiv-keys.txt` | satır başına canlı doğrulanmış bir `sk-codiv-…` — git tarafından yok sayılır |
| `out/codiv-accounts/<slot>.json` | hesap başına tam kayıt (`signup`, `verify`, `actions`, `createKey`, `proof`) — git tarafından yok sayılır |
| `out/codiv-batch.log` | kampanya günlüğü — git tarafından yok sayılır |
| `proxies.txt` | çıkışlarınız, satır başına bir tane — git tarafından yok sayılır |
| `src/cli.js` · `src/launcher.js` | görev çalıştırıcısı ve CODIV banner'ı |
| `src/connect-9router.js` | kaydedilen anahtarları 9Router bağlantıları olarak kaydeder |

## 🔌 9Router'a bağlanma

[9Router](https://9router.com), kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir (`npm install -g 9router && 9router`, kontrol paneli `http://localhost:20128` adresinde). Her anahtarı tek geçişte kaydedin:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Bayraklar: `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. Düğümün kendisi `codiv` öneki ve `https://api.codiv.ai/v1` temel URL'si ile oluşturulur. Modeller daha sonra `codiv/<model id>` olarak sunulur ve her anahtar arasında yük dengelenir.

## 🔌 OmniRoute'a bağlanma

[OmniRoute](https://omniroute.online), kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir (`npm install -g omniroute && omniroute`, kontrol paneli `http://localhost:20128` adresinde). Her anahtarı tek geçişte kaydedin:

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<omniroute client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Bayraklar: `--router http://localhost:20128`, `--router-password 123456`, `--keys out/codiv-keys.txt`, `--model diffusiongemma-26b`. Düğümün kendisi `codiv` öneki ve `https://api.codiv.ai/v1` temel URL'si ile oluşturulur. Modeller daha sonra `codiv/<model id>` olarak sunulur ve her anahtar arasında yük dengelenir.
## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **codiv.ai** — [codiv.ai](https://codiv.ai) |
| 🎁 Sağlayıcının verdikleri | Hesap başına 100M ücretsiz giriş token'ı — anahtar başına bir hesap |
| 🔑 Bir anahtarın size kazandırdıkları | kendi hesabına kapsanmış bir API anahtarı: aşağıdaki uç noktada 1 model kimliği, planınızın sınırlarında. Kota **hesapta** yaşar, bu aracın anahtar başına bir hesap oluşturmasının nedeni tam da budur |
| 🌐 API biçimi | OpenAI uyumlu: `POST https://api.codiv.ai/v1/chat/completions` |
| 🔒 Verileriniz | yalnızca codiv.ai ve yapılandırdığınız gelen kutusu arka ucuna bağlanılır; anahtarlar makinenizde kalır |

## 🐞 Sorunlar

codiv.ai kayıt biçimini, Turnstile widget'ını veya `createKey` eylemini değiştirirse, araç o adımda durur ve bunu bildirir. Çalıştırdığınız komut ve tam çıktıyla birlikte **[bir sorun açın](../../issues)**; PR'lar memnuniyetle karşılanır.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 codiv-bulk-apikey katkıda bulunanlar

</div>