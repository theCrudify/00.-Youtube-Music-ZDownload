# ZDownload

Aplikasi web lokal untuk mengekstrak audio dari **YouTube** dan **YouTube Music**. Hasilnya lengkap dengan sampul album, judul, dan nama artis yang sudah tertanam di file.

Tampilan tersedia dalam **Bahasa Indonesia** dan **English**.

> 🇬🇧 English summary is at the [bottom of this page](#english).

---

## Daftar Isi

- [Fitur](#fitur)
- [Soal Kualitas Audio (Baca Dulu)](#soal-kualitas-audio-baca-dulu)
- [Kebutuhan](#kebutuhan)
- [Instalasi](#instalasi)
- [Cara Pakai](#cara-pakai)
- [Perintah npm](#perintah-npm)
- [Konfigurasi](#konfigurasi)
- [Link yang Didukung](#link-yang-didukung)
- [Struktur Folder](#struktur-folder)
- [Cara Kerja & API](#cara-kerja--api)
- [Keamanan](#keamanan)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Keterbatasan yang Diketahui](#keterbatasan-yang-diketahui)
- [Disclaimer Hukum](#disclaimer-hukum)
- [Kredit & Lisensi Pihak Ketiga](#kredit--lisensi-pihak-ketiga)
- [English](#english)

---

## Fitur

- 🎵 Mendukung link YouTube, YouTube Music, `youtu.be`, dan versi mobile.
- 🎚️ Tiga pilihan format:
  - **Original**, stream asli tanpa konversi
  - **MP3** 320 kbps
  - **FLAC**
- 🖼️ Sampul album dan metadata (judul, artis) otomatis disematkan ke file.
- 🌐 Tombol ganti bahasa ID / EN, pilihannya diingat oleh browser.
- 📋 Tombol **Tempel**: membaca link dari clipboard dan langsung menganalisisnya.
- ⚙️ `npm install` otomatis mengunduh yt-dlp dan ffmpeg sesuai OS.
- 🖥️ Berjalan di **Windows**, **Linux**, dan **macOS**.
- 🔒 Aman secara default:
  - hanya bisa diakses dari komputer sendiri
  - input link divalidasi
  - jumlah proses yang berjalan bersamaan dibatasi

---

## Soal Kualitas Audio (Baca Dulu)

YouTube **tidak menyediakan audio lossless maupun hi-res**. Audio terbaik yang tersedia adalah stream terkompresi, biasanya **Opus sekitar 130–160 kbps, 48 kHz**. Semua format di aplikasi ini berasal dari stream yang sama:

| Format | Isinya | Kualitas | Ukuran (lagu 5 menit) |
|---|---|---|---|
| **Original** ⭐ | Stream asli YouTube, tanpa konversi (`.opus` / `.m4a`) | **Tertinggi yang bisa didapat** | ~5–6 MB |
| MP3 320 kbps | Original yang dikompres ulang ke MP3 | Sedikit di bawah Original, praktis tidak terdengar bedanya | ~11 MB |
| FLAC | Original yang disimpan ulang ke FLAC | **Sama dengan Original**, tidak lebih bagus | ~75 MB |

Catatan:
- File FLAC akan terbaca sebagai **24-bit / 48 kHz**. Itu hasil konversi, **bukan hi-res asli**. Bagian suara yang sudah dibuang YouTube tidak bisa kembali.
- Gunakan **Original** untuk kualitas terbaik.
- Gunakan **MP3** kalau pemutar musikmu tidak mendukung Opus (beberapa pemutar lama atau di mobil).
- FLAC hanya berguna kalau file akan diedit atau dikonversi ulang, supaya tidak ada pengurangan kualitas tambahan.
- Mau FLAC yang benar-benar lossless atau hi-res? Belilah dari CD atau toko musik seperti Qobuz atau Bandcamp.

Cara mengecek sendiri:

```bash
bin/ffprobe -hide_banner "nama lagu.flac"    # atau ffprobe dari sistem
```

Untuk melihat potongan frekuensinya, buka file di **Spek** atau **Audacity** (tampilan spectrogram). Audio dari YouTube biasanya terpotong rata di sekitar 16–20 kHz.

---

## Kebutuhan

| Kebutuhan | Keterangan |
|---|---|
| **Node.js 18+** | [nodejs.org](https://nodejs.org) |
| Koneksi internet | Untuk mengunduh tool saat instalasi (yt-dlp ±40 MB, ffmpeg ±150–200 MB) dan untuk mengakses YouTube |
| `tar` | Sudah bawaan di Windows 10 (versi 1803+), Linux, dan macOS |
| `xz` (khusus Linux) | Untuk mengekstrak ffmpeg; biasanya sudah terpasang (`sudo apt install xz-utils`) |
| **ffmpeg** (khusus macOS) | Pasang sendiri: `brew install ffmpeg` |

**yt-dlp** dan **ffmpeg** tidak perlu dipasang manual di Windows dan Linux, karena `npm install` mengurusnya.

---

## Instalasi

```bash
git clone <url-repo-ini> zdownload
cd zdownload
npm install
```

Selama `npm install`, skrip `scripts/setup.js` otomatis:

1. Mengunduh **yt-dlp** versi terbaru dari [rilis resmi GitHub](https://github.com/yt-dlp/yt-dlp/releases) ke `bin/`.
2. Mengecek apakah **ffmpeg** dan **ffprobe** sudah terpasang di sistem.
   - Kalau sudah, yang di sistem itu yang dipakai.
   - Kalau belum, build dari [BtbN/FFmpeg-Builds](https://github.com/BtbN/FFmpeg-Builds) diunduh dan diekstrak ke `bin/` (Windows x64, Linux x64, Linux arm64).

Contoh output:

```
ZDownload setup (linux-x64)
  downloading yt-dlp (41 MB)...
✓ yt-dlp 2026.10.26
✓ using system ffmpeg
Ready. Start with: npm start
```

Kalau gagal, misalnya karena koneksi putus, jalankan ulang:

```bash
npm run setup
```

---

## Cara Pakai

1. Jalankan server:
   ```bash
   npm start
   ```
2. Buka **http://localhost:3000** di browser.
3. Tempel link lagu, lalu klik **Analisis** (atau klik **Tempel** untuk mengambil link dari clipboard).
4. Pilih format: **Original**, **MP3**, atau **FLAC**.
5. Klik **Unduh Audio Sekarang**. File otomatis tersimpan ke folder Downloads.

Tombol **Unduh ulang** di kartu hasil hanya diperlukan kalau download otomatis diblokir browser.

---

## Perintah npm

| Perintah | Fungsi |
|---|---|
| `npm install` | Memasang dependensi **dan** mengunduh yt-dlp + ffmpeg |
| `npm start` / `npm run dev` | Menjalankan server |
| `npm run setup` | Mengulang pengunduhan tool yang belum ada |
| `npm run update-tools` | Memaksa unduh ulang yt-dlp dan ffmpeg versi terbaru |

> 💡 YouTube sering mengubah sistemnya. Kalau tiba-tiba semua link gagal, jalankan `npm run update-tools` dulu.

---

## Konfigurasi

Konfigurasi diatur lewat environment variable:

| Variable | Default | Fungsi |
|---|---|---|
| `PORT` | `3000` | Port server |
| `HOST` | `127.0.0.1` | Alamat yang didengarkan. `127.0.0.1` = hanya komputer ini. `0.0.0.0` = bisa diakses perangkat lain di jaringan yang sama |
| `MAX_JOBS` | `3` | Maksimal proses yt-dlp yang berjalan bersamaan. Kalau penuh, server membalas "sibuk" (HTTP 429) |

Contoh:

```bash
# Linux / macOS
PORT=8080 npm start

# Windows (PowerShell)
$env:PORT=8080; npm start

# Windows (CMD)
set PORT=8080 && npm start
```

### Mengakses dari HP di WiFi yang sama

```bash
HOST=0.0.0.0 npm start
```

Lalu buka `http://<IP-komputer>:3000` dari HP. IP komputer bisa dilihat dengan `ipconfig` (Windows) atau `ip a` (Linux).

> ⚠️ Dengan `HOST=0.0.0.0`, **semua perangkat di jaringan itu** bisa memakai aplikasi ini. Jangan lakukan ini di WiFi publik.

---

## Link yang Didukung

| Contoh | Sumber |
|---|---|
| `https://music.youtube.com/watch?v=...` | YouTube Music |
| `https://www.youtube.com/watch?v=...` | YouTube |
| `https://youtube.com/watch?v=...` | YouTube |
| `https://m.youtube.com/watch?v=...` | YouTube versi mobile |
| `https://youtu.be/...` | Link pendek dari tombol Share |

- Parameter tambahan seperti `&si=...` aman.
- Link yang berada di dalam playlist (`&list=...`) hanya mengunduh **lagu itu saja**, bukan satu playlist.
- Link dari situs lain akan ditolak.

---

## Struktur Folder

```
zdownload/
├── server.js           # Server Express + pemanggil yt-dlp
├── package.json
├── .npmrc              # Menampilkan progres unduhan saat npm install
├── scripts/
│   └── setup.js        # Pengunduh otomatis yt-dlp & ffmpeg (postinstall)
├── bin/                # Dibuat oleh setup.js (tidak masuk git)
│   ├── yt-dlp(.exe)
│   ├── ffmpeg(.exe)    # hanya jika ffmpeg sistem tidak ada
│   └── ffprobe(.exe)
└── public/
    ├── index.html      # Halaman utama
    ├── style.css       # Tampilan & animasi
    └── app.js          # Logika UI + terjemahan ID/EN
```

---

## Cara Kerja & API

Browser tidak pernah menghubungi YouTube langsung. Server lokal menjalankan **yt-dlp** untuk mengambil audio, lalu **ffmpeg** untuk konversi dan penyematan sampul. File dikirim ke browser, lalu langsung dihapus dari server.

### `POST /api/info`

Mengambil informasi lagu.

```json
// request
{ "url": "https://music.youtube.com/watch?v=4PgOJwUCdIc" }

// response 200
{
  "title": "About You",
  "thumbnail": "https://i.ytimg.com/vi_webp/4PgOJwUCdIc/maxresdefault.webp",
  "duration": 326,
  "uploader": "The 1975",
  "id": "4PgOJwUCdIc"
}
```

### `POST /api/download`

Mengunduh audio. Respons berupa file, dengan nama file di header `Content-Disposition`.

```json
{ "url": "https://youtu.be/4PgOJwUCdIc", "format": "best" }
```

| `format` | Hasil |
|---|---|
| `best` | Original, tanpa konversi (`.opus` / `.m4a`) |
| `mp3` | MP3 320 kbps |
| `flac` | FLAC |

### Kode error

| Status | Arti |
|---|---|
| `400` | Link kosong atau bukan link YouTube |
| `429` | Server sedang memproses terlalu banyak permintaan; coba lagi sebentar |
| `500` | yt-dlp gagal (lihat log di terminal server untuk detailnya) |

---

## Keamanan

Pengaturan bawaan dibuat untuk **pemakaian pribadi**:

- **Hanya bisa diakses dari komputer sendiri** (`127.0.0.1`), kecuali `HOST` diubah.
- **Validasi link:** hanya domain YouTube resmi yang diterima. Link dipisahkan dari opsi yt-dlp dengan `--`, jadi isinya tidak bisa disisipi perintah.
- **Tanpa CORS:** website lain tidak bisa memakai API ini lewat browser kamu.
- **Pembatasan proses:**
  - maksimal `MAX_JOBS` proses sekaligus
  - setiap proses dihentikan setelah 10 menit
  - proses juga dihentikan kalau tab browser ditutup
- **Folder sementara terpisah** untuk setiap download, dan selalu dihapus setelah selesai, termasuk kalau gagal.
- **Detail error teknis** hanya dicatat di terminal server, tidak dikirim ke browser.

Aplikasi ini **tidak punya login maupun rate limit per pengguna**. Jangan membukanya ke internet publik tanpa menambahkan autentikasi.

---

## Deployment

| Platform | Cocok? | Alasan |
|---|---|---|
| **Komputer / server di rumah** + [Tailscale](https://tailscale.com) | ✅ **Disarankan** | IP rumah jarang diblokir YouTube, gratis, dan hanya bisa diakses perangkatmu sendiri |
| Komputer di rumah + Cloudflare Tunnel | ✅ | Mendapat alamat web tanpa mengatur router. Pasang autentikasi (misalnya Cloudflare Access) |
| VPS (Hetzner, DigitalOcean, IDCloudHost, dll.) | ⚠️ | Bisa, tapi IP server cloud sering diblokir YouTube |
| Railway / Render / Fly.io | ⚠️ | Sama seperti VPS, ditambah batasan paket gratis |
| **Vercel / Netlify / Cloudflare Workers** | ❌ | Serverless: ada batas ukuran respons dan waktu proses, tidak bisa menjalankan yt-dlp dan ffmpeg dengan layak |

Di VPS, biasanya YouTube akan meminta *"Sign in to confirm you're not a bot"*. Solusinya adalah memakai cookies dari browser yang sudah login. Fitur ini belum ada di aplikasi ini.

---

## Troubleshooting

<details>
<summary><b>"yt-dlp not found. Please install yt-dlp first."</b></summary>

`bin/yt-dlp` belum ada atau gagal diunduh. Jalankan:

```bash
npm run setup
```

Lalu restart server.
</details>

<details>
<summary><b>"Gagal mengambil informasi video" untuk semua link</b></summary>

1. Jalankan `npm run update-tools`. YouTube sering berubah, dan yt-dlp versi lama bisa tiba-tiba gagal.
2. Lihat pesan error lengkap di **terminal tempat `npm start` dijalankan**.
3. Pastikan link-nya bisa dibuka di browser, tidak privat, dan tidak dibatasi usia atau wilayah.
</details>

<details>
<summary><b>"Sign in to confirm you're not a bot"</b></summary>

IP-mu dianggap mencurigakan oleh YouTube. Ini umum terjadi di VPS atau server cloud. Jalankan aplikasi dari koneksi rumah, atau tunggu beberapa saat.
</details>

<details>
<summary><b>"Setup failed: could not extract ffmpeg archive"</b></summary>

- **Linux:** pasang `xz-utils` (`sudo apt install xz-utils`), atau pasang ffmpeg dari sistem (`sudo apt install ffmpeg`), lalu `npm run setup`.
- **Windows:** butuh Windows 10 versi 1803 atau lebih baru, yang sudah punya `tar` bawaan.
</details>

<details>
<summary><b>macOS: "no bundled ffmpeg for darwin-..."</b></summary>

```bash
brew install ffmpeg
npm run setup
```
</details>

<details>
<summary><b>Proses <code>npm install</code> terlihat lama atau diam</b></summary>

ffmpeg berukuran ±150–200 MB, jadi di koneksi lambat bisa butuh beberapa menit. Progres akan tampil di layar berkat file `.npmrc`. Kalau terputus, jalankan `npm run setup`.
</details>

<details>
<summary><b>"EADDRINUSE: address already in use :::3000"</b></summary>

Port 3000 sudah dipakai aplikasi lain, atau server lama masih berjalan. Matikan server lama (Ctrl+C), atau pakai port lain: `PORT=3001 npm start`.
</details>

<details>
<summary><b>File Original (.opus) tidak bisa diputar</b></summary>

Beberapa pemutar musik lama tidak mendukung Opus. Pakai VLC atau foobar2000, atau unduh ulang dengan format **MP3**.
</details>

<details>
<summary><b>"Server busy, try again shortly." (HTTP 429)</b></summary>

Sudah ada `MAX_JOBS` proses yang berjalan. Tunggu sampai salah satu selesai, atau naikkan batasnya: `MAX_JOBS=5 npm start`.
</details>

---

## Keterbatasan yang Diketahui

- **Judul dari video lirik atau video klip** tetap memakai judul videonya, misalnya *"Multo - Cup of Joe (Official Lyric Video)"*. YouTube hanya menyediakan data judul lagu dan artis untuk entri lagu resmi (biasanya dari channel "… - Topic"). Tips: di YouTube Music, pilih versi **lagu** (bukan video) supaya metadatanya rapi.
- Belum ada dukungan **cookies** untuk akun YouTube Premium (AAC 256 kbps) atau untuk mengatasi blokir di server cloud.
- Belum mendukung unduhan **satu playlist** sekaligus.
- Tidak ada autentikasi. Lihat bagian [Keamanan](#keamanan).

---

## Disclaimer Hukum

Aplikasi ini dibuat untuk **penggunaan pribadi**.

- [Ketentuan Layanan YouTube](https://www.youtube.com/t/terms) melarang mengunduh konten di luar fitur resmi YouTube.
- Sebagian besar musik dilindungi **hak cipta**. Unduh hanya konten yang kamu miliki haknya, atau yang lisensinya mengizinkan.
- Jangan mendistribusikan ulang file hasil unduhan.
- Menjalankan aplikasi ini sebagai **layanan publik** berisiko terkena klaim DMCA dan pemblokiran akun hosting.

Pengguna bertanggung jawab penuh atas pemakaian aplikasi ini.

---

## Kredit & Lisensi Pihak Ketiga

| Komponen | Fungsi | Lisensi |
|---|---|---|
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | Mengambil audio dari YouTube | Unlicense |
| [FFmpeg](https://ffmpeg.org) (build [BtbN](https://github.com/BtbN/FFmpeg-Builds)) | Konversi audio & penyematan sampul | GPL |
| [Express](https://expressjs.com) | Web server | MIT |
| [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | Font | OFL |

yt-dlp dan FFmpeg **tidak disertakan** di repository ini. Keduanya diunduh langsung dari sumber resminya saat `npm install`.

---

## English

**ZDownload** is a local web app that extracts audio from **YouTube** and **YouTube Music**. Album art and metadata are embedded in the file. The UI is available in Indonesian and English (toggle in the top-right corner).

### Quick start

```bash
npm install   # also downloads yt-dlp + ffmpeg for your OS into ./bin
npm start     # open http://localhost:3000
```

- **Requirements:** Node.js 18+.
- **macOS:** run `brew install ffmpeg` first.
- **Linux:** needs `xz` if ffmpeg is not already installed.

### Formats & honest quality notes

YouTube does **not** offer lossless or hi-res audio. Its best stream is around 130–160 kbps Opus.

- **Original** (default): saves that stream untouched. This is the best quality possible.
- **MP3 320**: a re-encode of Original. Slightly lower quality, plays everywhere.
- **FLAC**: a lossless copy of the same lossy stream. Same sound as Original, about 13× larger. It reports as 24-bit but is **not** true hi-res.

### Scripts

| Command | Purpose |
|---|---|
| `npm start` | Run the server |
| `npm run setup` | Retry downloading missing tools |
| `npm run update-tools` | Force-download the latest yt-dlp + ffmpeg (do this when YouTube breaks) |

### Configuration

| Env var | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Server port |
| `HOST` | `127.0.0.1` | Bind address; `0.0.0.0` exposes it to your LAN |
| `MAX_JOBS` | `3` | Max concurrent yt-dlp processes |

### Security

The defaults are built for personal use:
- localhost only
- YouTube-only URL allowlist, with the URL passed after `--`
- no CORS
- concurrency limit, a 10-minute timeout, and per-request temp folders that are always cleaned up

There is **no authentication**, so don't expose it to the public internet as-is.

### Deployment

**Recommended:** a home machine combined with Tailscale. **Not suitable:** serverless platforms like Vercel, Netlify, or Cloudflare Workers, because of response-size and time limits and the external binaries. Cloud/VPS IPs are often blocked by YouTube's bot check.

### Legal

For **personal use only**. Downloading may violate YouTube's Terms of Service, and most music is copyrighted. Only download content you have the rights to. Running this as a public service carries DMCA and hosting-account risk.
