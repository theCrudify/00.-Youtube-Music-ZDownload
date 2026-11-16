# ZDownload

A local web app that extracts audio from **YouTube** and **YouTube Music**. Album art, title, and artist are embedded in every file.

The interface is available in **English** and **Indonesian** (toggle in the top-right corner).

---

## Table of Contents

- [Features](#features)
- [About Audio Quality (Read This First)](#about-audio-quality-read-this-first)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [npm Scripts](#npm-scripts)
- [Configuration](#configuration)
- [Supported Links](#supported-links)
- [Project Structure](#project-structure)
- [How It Works & API](#how-it-works--api)
- [Security](#security)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Known Limitations](#known-limitations)
- [Legal Disclaimer](#legal-disclaimer)
- [Credits & Third-Party Licenses](#credits--third-party-licenses)

---

## Features

- 🎵 Works with YouTube, YouTube Music, `youtu.be`, and mobile links.
- 🎚️ Three formats:
  - **Original**, the untouched stream
  - **MP3** 320 kbps
  - **FLAC**
- 🖼️ Album art and metadata (title, artist) are embedded automatically.
- 🌐 English / Indonesian language toggle, remembered by the browser.
- 📋 **Paste** button: reads the link from the clipboard and analyzes it right away.
- ⚙️ `npm install` automatically downloads yt-dlp and ffmpeg for your OS.
- 🖥️ Runs on **Windows**, **Linux**, and **macOS**.
- 🔒 Secure by default:
  - reachable only from your own computer
  - links are validated
  - the number of jobs running at once is limited

---

## About Audio Quality (Read This First)

YouTube **does not offer lossless or hi-res audio**. The best stream available is compressed, typically **Opus at about 130–160 kbps, 48 kHz**. Every format in this app comes from that same stream:

| Format | What it is | Quality | Size (5-min song) |
|---|---|---|---|
| **Original** ⭐ | YouTube's stream, saved as-is (`.opus` / `.m4a`) | **Best quality available** | ~5–6 MB |
| MP3 320 kbps | Original re-encoded to MP3 | Slightly below Original, practically inaudible | ~11 MB |
| FLAC | Original re-saved as FLAC | **Identical to Original**, not better | ~75 MB |

Notes:
- FLAC files will report **24-bit / 48 kHz**. That comes from the conversion and is **not real hi-res**. Detail that YouTube already discarded cannot be recovered.
- Use **Original** for the best quality.
- Use **MP3** if your player doesn't support Opus (some older players and car stereos).
- FLAC is only useful if you plan to edit or re-convert the file, so no further quality is lost.
- Want truly lossless or hi-res audio? Buy it from a CD or a store such as Qobuz or Bandcamp.

To check a file yourself:

```bash
bin/ffprobe -hide_banner "song name.flac"    # or the system ffprobe
```

To see the frequency cutoff, open the file in **Spek** or **Audacity** (spectrogram view). YouTube audio usually shows a hard cutoff around 16–20 kHz.

---

## Requirements

| Requirement | Notes |
|---|---|
| **Node.js 18+** | [nodejs.org](https://nodejs.org) |
| Internet connection | To download the tools during install (yt-dlp ~40 MB, ffmpeg ~150–200 MB) and to reach YouTube |
| `tar` | Built into Windows 10 (version 1803+), Linux, and macOS |
| `xz` (Linux only) | To extract ffmpeg; usually preinstalled (`sudo apt install xz-utils`) |
| **ffmpeg** (macOS only) | Install it yourself: `brew install ffmpeg` |

On Windows and Linux you don't need to install **yt-dlp** or **ffmpeg** manually, because `npm install` takes care of it.

---

## Installation

```bash
git clone <repo-url> zdownload
cd zdownload
npm install
```

During `npm install`, the `scripts/setup.js` script automatically:

1. Downloads the latest **yt-dlp** from its [official GitHub releases](https://github.com/yt-dlp/yt-dlp/releases) into `bin/`.
2. Checks whether **ffmpeg** and **ffprobe** are already installed on the system.
   - If they are, the system versions are used.
   - If not, a build from [BtbN/FFmpeg-Builds](https://github.com/BtbN/FFmpeg-Builds) is downloaded and extracted into `bin/` (Windows x64, Linux x64, Linux arm64).

Example output:

```
ZDownload setup (linux-x64)
  downloading yt-dlp (41 MB)...
✓ yt-dlp 2026.10.26
✓ using system ffmpeg
Ready. Start with: npm start
```

If setup fails (for example, the connection drops), run it again:

```bash
npm run setup
```

---

## Usage

1. Start the server:
   ```bash
   npm start
   ```
2. Open **http://localhost:3000** in your browser.
3. Paste a song link and click **Analyze** (or click **Paste** to grab the link from the clipboard).
4. Choose a format: **Original**, **MP3**, or **FLAC**.
5. Click **Download Audio Now**. The file is saved to your Downloads folder automatically.

The **Download again** button on the result card is only needed if the browser blocked the automatic download.

---

## npm Scripts

| Command | Purpose |
|---|---|
| `npm install` | Installs dependencies **and** downloads yt-dlp + ffmpeg |
| `npm start` / `npm run dev` | Starts the server |
| `npm run setup` | Retries downloading any missing tools |
| `npm run update-tools` | Force-downloads the latest yt-dlp and ffmpeg |

> 💡 YouTube changes often. If every link suddenly fails, run `npm run update-tools` first.

---

## Configuration

Configuration is done with environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Server port |
| `HOST` | `127.0.0.1` | Bind address. `127.0.0.1` = this computer only. `0.0.0.0` = reachable from other devices on the same network |
| `MAX_JOBS` | `3` | Maximum yt-dlp processes running at once. When full, the server replies "busy" (HTTP 429) |

Examples:

```bash
# Linux / macOS
PORT=8080 npm start

# Windows (PowerShell)
$env:PORT=8080; npm start

# Windows (CMD)
set PORT=8080 && npm start
```

### Using it from a phone on the same Wi-Fi

```bash
HOST=0.0.0.0 npm start
```

Then open `http://<computer-IP>:3000` on your phone. Find your computer's IP with `ipconfig` (Windows) or `ip a` (Linux).

> ⚠️ With `HOST=0.0.0.0`, **every device on that network** can use the app. Don't do this on public Wi-Fi.

---

## Supported Links

| Example | Source |
|---|---|
| `https://music.youtube.com/watch?v=...` | YouTube Music |
| `https://www.youtube.com/watch?v=...` | YouTube |
| `https://youtube.com/watch?v=...` | YouTube |
| `https://m.youtube.com/watch?v=...` | YouTube mobile |
| `https://youtu.be/...` | Short link from the Share button |

- Extra parameters such as `&si=...` are fine.
- A link that belongs to a playlist (`&list=...`) downloads **only that song**, not the whole playlist.
- Links from any other site are rejected.

---

## Project Structure

```
zdownload/
├── server.js           # Express server + yt-dlp runner
├── package.json
├── .npmrc              # Shows download progress during npm install
├── scripts/
│   └── setup.js        # Auto-downloads yt-dlp & ffmpeg (postinstall)
├── bin/                # Created by setup.js (not tracked by git)
│   ├── yt-dlp(.exe)
│   ├── ffmpeg(.exe)    # only if no system ffmpeg is found
│   └── ffprobe(.exe)
└── public/
    ├── index.html      # Main page
    ├── style.css       # Styles & animations
    ├── app.js          # UI logic + English/Indonesian translations
    └── favicon.svg / favicon.ico / apple-touch-icon.png
```

---

## How It Works & API

The browser never talks to YouTube directly. The local server runs **yt-dlp** to fetch the audio and **ffmpeg** to convert it and embed the cover art. The file is sent to the browser and then deleted from the server immediately.

### `POST /api/info`

Fetches track information.

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

Downloads the audio. The response is the file itself, with the file name in the `Content-Disposition` header.

```json
{ "url": "https://youtu.be/4PgOJwUCdIc", "format": "best" }
```

| `format` | Result |
|---|---|
| `best` | Original, no conversion (`.opus` / `.m4a`) |
| `mp3` | MP3 320 kbps |
| `flac` | FLAC |

### Error codes

| Status | Meaning |
|---|---|
| `400` | Missing link, or not a YouTube link |
| `429` | The server is handling too many requests; try again shortly |
| `500` | yt-dlp failed (details are in the server terminal log) |

---

## Security

The defaults are designed for **personal use**:

- **Reachable only from your own computer** (`127.0.0.1`) unless you change `HOST`.
- **Link validation:** only official YouTube domains are accepted. The link is separated from yt-dlp's options with `--`, so it cannot be used to inject commands.
- **No CORS:** other websites cannot use this API through your browser.
- **Process limits:**
  - at most `MAX_JOBS` processes at once
  - each process is stopped after 10 minutes
  - a process is also stopped if the browser tab is closed
- **A separate temp folder** for every download, always deleted afterwards, even when the download fails.
- **Technical error details** are logged only in the server terminal, never sent to the browser.

The app has **no login and no per-user rate limit**. Don't expose it to the public internet without adding authentication.

---

## Deployment

| Platform | Suitable? | Why |
|---|---|---|
| **Home computer / server** + [Tailscale](https://tailscale.com) | ✅ **Recommended** | Home IPs are rarely blocked by YouTube, it's free, and only your own devices can reach it |
| Home computer + Cloudflare Tunnel | ✅ | Gives you a public URL without router setup. Add authentication (e.g. Cloudflare Access) |
| VPS (Hetzner, DigitalOcean, etc.) | ⚠️ | Works, but YouTube often blocks cloud server IPs |
| Railway / Render / Fly.io | ⚠️ | Same as a VPS, plus free-tier limits |
| **Vercel / Netlify / Cloudflare Workers** | ❌ | Serverless: response-size and run-time limits, and no proper way to run yt-dlp and ffmpeg |

On a VPS, YouTube will usually ask you to *"Sign in to confirm you're not a bot"*. The fix is to use cookies from a logged-in browser. This app does not support that yet.

---

## Troubleshooting

<details>
<summary><b>"yt-dlp not found. Please install yt-dlp first."</b></summary>

`bin/yt-dlp` is missing or failed to download. Run:

```bash
npm run setup
```

Then restart the server.
</details>

<details>
<summary><b>"Failed to fetch video info" for every link</b></summary>

1. Run `npm run update-tools`. YouTube changes often, and an old yt-dlp can suddenly stop working.
2. Check the full error message in the **terminal where `npm start` is running**.
3. Make sure the link opens in a browser and isn't private, age-restricted, or region-locked.
</details>

<details>
<summary><b>"Sign in to confirm you're not a bot"</b></summary>

YouTube flagged your IP as suspicious. This is common on VPS and cloud servers. Run the app from a home connection, or wait a while.
</details>

<details>
<summary><b>"Setup failed: could not extract ffmpeg archive"</b></summary>

- **Linux:** install `xz-utils` (`sudo apt install xz-utils`), or install ffmpeg from your package manager (`sudo apt install ffmpeg`), then run `npm run setup`.
- **Windows:** requires Windows 10 version 1803 or newer, which includes `tar`.
</details>

<details>
<summary><b>macOS: "no bundled ffmpeg for darwin-..."</b></summary>

```bash
brew install ffmpeg
npm run setup
```
</details>

<details>
<summary><b><code>npm install</code> seems slow or stuck</b></summary>

ffmpeg is about 150–200 MB, so on a slow connection it can take a few minutes. Progress is shown on screen thanks to the `.npmrc` file. If it gets interrupted, run `npm run setup`.
</details>

<details>
<summary><b>"EADDRINUSE: address already in use :::3000"</b></summary>

Port 3000 is used by another app, or an old server is still running. Stop the old server (Ctrl+C) or use another port: `PORT=3001 npm start`.
</details>

<details>
<summary><b>Original (.opus) files won't play</b></summary>

Some older music players don't support Opus. Use VLC or foobar2000, or download again as **MP3**.
</details>

<details>
<summary><b>"Server busy, try again shortly." (HTTP 429)</b></summary>

`MAX_JOBS` processes are already running. Wait for one to finish, or raise the limit: `MAX_JOBS=5 npm start`.
</details>

---

## Known Limitations

- **Titles from lyric videos and music videos** keep the video's title, for example *"Multo - Cup of Joe (Official Lyric Video)"*. YouTube only provides song-title and artist data for official song entries (usually from "… - Topic" channels). Tip: on YouTube Music, pick the **song** version (not the video) to get clean metadata.
- No **cookie** support yet, either for YouTube Premium (AAC 256 kbps) or to get past blocks on cloud servers.
- Downloading a **whole playlist** at once is not supported.
- No authentication. See [Security](#security).

---

## Legal Disclaimer

This app is intended for **personal use**.

- The [YouTube Terms of Service](https://www.youtube.com/t/terms) prohibit downloading content outside YouTube's official features.
- Most music is **copyrighted**. Only download content you own the rights to, or whose license allows it.
- Don't redistribute downloaded files.
- Running this app as a **public service** risks DMCA claims and hosting account suspension.

Users are fully responsible for how they use this app.

---

## Credits & Third-Party Licenses

| Component | Purpose | License |
|---|---|---|
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | Fetches audio from YouTube | Unlicense |
| [FFmpeg](https://ffmpeg.org) (build by [BtbN](https://github.com/BtbN/FFmpeg-Builds)) | Audio conversion & cover-art embedding | GPL |
| [Express](https://expressjs.com) | Web server | MIT |
| [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | Fonts | OFL |

yt-dlp and FFmpeg are **not included** in this repository. Both are downloaded straight from their official sources during `npm install`.
