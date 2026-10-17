<div align="center">

<img src="../brand/logo.svg" alt="codiv-bulk" width="150" />

# codiv-bulk-apikey

**Buat banyak akun [codiv.ai](https://codiv.ai) sekaligus, hasilkan satu API key `sk-codiv-…` untuk setiap akun (100M token input gratis per akun), dan daftarkan setiap key ke instance [9Router](https://9router.com) yang sedang berjalan — dari ujung ke ujung. Tanpa dependensi.**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](../LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://api.codiv.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-hubungkan-ke-9router)
[![Transport](https://img.shields.io/badge/transport-HTTP%20%7C%20SOCKS5%20%7C%20CDP-0EA5E9.svg?style=for-the-badge)](#-transport)
[![Mailtrap](https://img.shields.io/badge/inbox-Mailtrap-22C55E.svg?style=for-the-badge)](https://mailtrap.io)
[![Languages](https://img.shields.io/badge/i18n-5%20languages-F59E0B.svg?style=for-the-badge)](#)

[English](../README.md) · [Bahasa Indonesia](README.id.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Deutsch](README.de.md)

</div>

---

## ✨ Fitur

- 🔑 **Buat massal akun + API key** — hasilkan ratusan key `sk-codiv-…` lewat backend dashboard codiv.ai sendiri.
- 💰 **100M token input gratis** — setiap akun membawa 100M token input gratis. Tanpa kartu.
- 🔌 **Konektor 9Router** — setiap key didaftarkan sebagai koneksi kompatibel-OpenAI dengan prefiks `codiv` dalam satu kali jalan.
- 🧠 **Penyelesaian Turnstile sungguhan** — widget milik situs tersebut dimuat di `codiv.ai/signup` pada Chrome *Anda* dan diklik lewat CDP.
- 🪶 **Tanpa dependensi** — WebSocket RFC6455 + klien CDP buatan sendiri. Tanpa `npm install`, tanpa langkah build.
- ⏱️ **~80-115 s per akun** — satu penyelesaian Turnstile + satu email verifikasi, dari ujung ke ujung.
- ✅ **Key terbukti** — setiap key harus menjawab chat langsung `200` sebelum disimpan.
- 🌍 **5 bahasa** — EN, ID, ZH, JA, ES, DE.

## 🚀 Mulai cepat

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

`create` menghitung key yang sudah ada di file keys lalu melanjutkan dari sana, sehingga sebuah kampanye bisa dihentikan dan dijalankan ulang tanpa kehilangan pekerjaan.

## 🛠 Penggunaan

```bash
codiv-bulk mint                     # create one account + key
codiv-bulk create --count 200       # campaign: mint N keys (resume-safe)
codiv-bulk verify                   # prove saved keys with a live chat call
codiv-bulk connect                  # register keys into 9Router
codiv-bulk list                     # list saved keys (masked)
codiv-bulk token                    # solve one Turnstile token (debug)
```

| Flag | Keterangan | Standar |
| --- | --- | --- |
| `--count <n>` | ukuran kampanye | `200` |
| `--dir <name>` | direktori akun per worker di bawah `out/` | `codiv-accounts` |
| `--keys <file>` | file keys | `out/codiv-keys.txt` |
| `--pause <ms>` | jeda antar mint | `5000` |
| `--out <file>` | catatan mint tunggal | `out/codiv-account.json` |
| `--log <file>` | log kampanye | `out/codiv-batch.log` |
| `--cdp <url>` | endpoint Chrome DevTools | `http://127.0.0.1:9222` |
| `--proxy <url>` | exit halaman penyelesaian (`socks5://`/`http://`) | langsung |
| `--token <t>` | satu token Turnstile manual | — |
| `--attempts <n>` | percobaan penyelesaian per mint | `2` |
| `--solver-cmd <cmd>` | solver eksternal (lihat di bawah) | — |
| `--mailtrap-token <t>` | token API Mailtrap | env `MAILTRAP_TOKEN` |
| `--folder <name>` | folder Mailtrap | `codiv` |
| `--model <id>` | model untuk verify/connect | `diffusiongemma-26b` |
| `--conc <n>` | konkurensi verify | `6` |
| `--router <url>` | basis 9Router | `http://localhost:20128` |
| `--router-password <pw>` | kata sandi dashboard 9Router | `123456` |

## 🌐 Transport

codiv.ai melindungi pendaftaran dengan Cloudflare **Turnstile** dan mengirim tautan verifikasi, jadi penyelesaian harus terjadi di browser sungguhan dari exit IP yang bersih:

- **Chrome lewat CDP (default)** — jalankan Chrome Anda sendiri dengan `--remote-debugging-port=9222` (headful: tab tersembunyi berperilaku berbeda) lalu arahkan `--cdp` ke sana. Halaman yang membawa widget dibuat dalam konteks browser tersendiri.
- **Exit proxy** — `--proxy socks5://…` atau `http://…` mengunci exit *halaman penyelesaian*. Cloudflare memoderasi widget per exit IP; jalur datacenter lolos dari widget tetapi menjawab `fail code 600010` setelah diklik.
- **Solver eksternal** — `--solver-cmd "node my-solver.js"` melewati Chrome sepenuhnya; dijalankan sekali per percobaan dengan `CODIV_SITEKEY` dan `CODIV_URL` di environment, dan token adalah baris stdout terakhir yang tidak kosong. `--token <t>` memasok satu token manual untuk satu mint.
- **Fetch langsung** — semua kecuali penyelesaian adalah HTTPS biasa: API Mailtrap, endpoint better-auth, dan `https://api.codiv.ai/v1`.

Jalur kotak masuk: satu kotak masuk inbound [Mailtrap](https://mailtrap.io) baru per akun, dibuat melalui API publiknya dengan `--mailtrap-token` / `MAILTRAP_TOKEN`.

## 🔌 Hubungkan ke 9Router

9Router adalah router kompatibel-OpenAI yang di-host sendiri:

```bash
npm install -g 9router && 9router        # dashboard on http://localhost:20128
```

Daftarkan semua key Anda dengan satu perintah (membuat provider-node `codiv` dan melampirkan setiap key):

```bash
node src/cli.js connect --keys out/codiv-keys.txt
```

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>       (a `codiv` client key is created if missing)
Models   : codiv/diffusiongemma-26b
```

Panggil seperti endpoint OpenAI mana pun:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"codiv/diffusiongemma-26b","messages":[{"role":"user","content":"hi"}]}'
```

## 🧠 Model yang tersedia

| Model | Panggil sebagai di 9Router | Status |
| --- | --- | --- |
| diffusiongemma-26b | `codiv/diffusiongemma-26b` | ✅ `200` — model yang setiap mint dibuktikan terhadapnya |

Key dihasilkan dari server action dashboard dan yang membayarnya adalah 100M token input gratis milik akun tersebut, jadi `diffusiongemma-26b` menjadi standar untuk `verify` maupun `connect`; `--model <id>` menetapkan yang lain. Segarkan daftar di sisi router dengan:

```bash
curl http://localhost:20128/v1/models -H "Authorization: Bearer sk-<9router key>"
```

## 🔁 Kampanye paralel

Berikan setiap worker `--dir` dan `--keys` sendiri: dua worker yang berbagi satu direktori menulis slot `<start+i>.json` yang sama dan kehilangan satu catatan per tabrakan (terukur).

```bash
node src/cli.js create --count 65 --dir w1 --keys out/codiv-keys-w1.txt &
node src/cli.js create --count 65 --dir w2 --keys out/codiv-keys-w2.txt &
node src/cli.js create --count 65 --dir w3 --keys out/codiv-keys-w3.txt &
wait
```

## 🧩 Solver eksternal

Jika Anda sudah punya solver Turnstile, lewati jalur Chrome bawaan:

```bash
codiv-bulk mint --solver-cmd "node my-solver.js"   # or --token <t> for one manual token
```

`--solver-cmd` dijalankan sekali per percobaan dengan `CODIV_SITEKEY` dan `CODIV_URL` di environment, dan token adalah baris stdout terakhir yang tidak kosong.

## 📚 Sebagai pustaka

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

## ⚙️ Cara kerja

1. **Maildrop** — kotak masuk Mailtrap baru dibuat per akun untuk email verifikasi.
2. **Turnstile** — widget milik situs tersebut (sitekey `0x4AAAAAAE7hE0DIArlj6rXX`) dimuat di `codiv.ai/signup` pada Chrome Anda dan diklik lewat CDP; token dikembalikan sebagai header `x-captcha-response`.
3. **Pendaftaran** — `POST /api/auth/sign-up/email` (better-auth).
4. **Verifikasi** — tautan verifikasi diambil dari kotak masuk; better-auth otomatis masuk sesi saat verifikasi disentuh, jadi `Set-Cookie`-nya adalah sesinya.
5. **Membuat key** — server action Next.js milik dashboard, `createKey` (id ditemukan ulang dari chunk yang ter-deploy setiap kali dijalankan, karena setiap deploy mengrotasi id tersebut) mengembalikan key baru di jawaban RSC-nya.
6. **Pembuktian** — panggilan chat langsung ke `https://api.codiv.ai/v1` (`diffusiongemma-26b`) harus menjawab `200` sebelum key dihitung.
7. **Penyimpanan** — satu `sk-codiv-…` per baris di file keys; catatan lengkap tersimpan di JSON akun per slot.

### Perilaku terukur

- Satu akun = **100M token input gratis**; tanpa kartu.
- Biaya mint ≈ **80-115 s per akun** (satu penyelesaian Turnstile + satu email verifikasi).
- Batch 65 key per worker bertahan **~55 mint berhasil**; mode kegagalannya adalah timeout **420 s** per mint, bukan penulisan parsial.
- Token Turnstile terikat pada exit yang menyelesaikannya; Cloudflare menolak sebagian token baru dengan `VERIFICATION_FAILED`, dan mint mencoba ulang dengan penyelesaian yang benar-benar baru (hingga 4 percobaan).
- Exit datacenter lolos dari widget tetapi tantangannya menjawab `fail code 600010` setelah diklik — arahkan `--proxy` ke exit yang menyerupai koneksi rumahan, dan perhatikan bahwa sebuah exit bisa berbalik dalam hitungan jam setelah dipakai berat.

## 📁 Struktur

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

## ⚠️ Catatan

- Persyaratan: **token Mailtrap** (kotak masuk verifikasi) dan **Chrome dengan `--remote-debugging-port=9222`** (Chrome sendiri, headful — tab tersembunyi berperilaku berbeda).
- Key dibuktikan dengan chat sungguhan `200` sebelum disimpan; catatan tersebut menyimpan setiap langkah (`signup`, `verify`, `actions`, `createKey`, `proof`).
- File keys memuat satu `sk-codiv-…` per baris; `create` melanjutkan dari apa pun yang sudah ada di sana.
- Akun dan key milik Anda untuk disimpan; tidak ada yang dikirim ke mana pun kecuali codiv.ai, Mailtrap dan (opsional) 9Router Anda.
- Untuk otomasi pribadi/edukatif. Hormati ketentuan layanan codiv.ai, Mailtrap, dan 9Router.

## 📄 Lisensi

[MIT](../LICENSE) © 2026 codiv-bulk-apikey contributors
