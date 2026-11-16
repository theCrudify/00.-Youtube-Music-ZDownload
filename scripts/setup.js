// Downloads the external tools ZDownload needs (yt-dlp, ffmpeg, ffprobe) into ./bin.
// Runs automatically after `npm install`. Re-run with `npm run setup`, or `npm run update-tools` to force fresh copies.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');

const BIN = path.join(__dirname, '..', 'bin');
const FORCE = process.argv.includes('--force');
const isWin = process.platform === 'win32';
const exe = isWin ? '.exe' : '';
const platform = `${process.platform}-${process.arch}`;

const YTDLP_ASSET = {
    'win32-x64': 'yt-dlp.exe',
    'win32-arm64': 'yt-dlp.exe',
    'linux-x64': 'yt-dlp_linux',
    'linux-arm64': 'yt-dlp_linux_aarch64',
    'darwin-x64': 'yt-dlp_macos',
    'darwin-arm64': 'yt-dlp_macos'
}[platform];

const FFMPEG_ASSET = {
    'win32-x64': 'ffmpeg-master-latest-win64-gpl.zip',
    'linux-x64': 'ffmpeg-master-latest-linux64-gpl.tar.xz',
    'linux-arm64': 'ffmpeg-master-latest-linuxarm64-gpl.tar.xz'
}[platform];

async function download(url, dest) {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const size = Number(res.headers.get('content-length')) || 0;
    console.log(`  downloading ${path.basename(dest)}${size ? ` (${(size / 1e6).toFixed(0)} MB)` : ''}...`);
    const tmp = `${dest}.part`;
    await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(tmp));
    fs.renameSync(tmp, dest); // only a complete file ever gets the real name
}

function onPath(cmd) {
    const r = spawnSync(cmd, ['-version'], { stdio: 'ignore' });
    return !r.error && r.status === 0;
}

async function setupYtDlp() {
    const dest = path.join(BIN, `yt-dlp${exe}`);
    if (fs.existsSync(dest) && !FORCE) return console.log('✓ yt-dlp already present');
    if (!YTDLP_ASSET) throw new Error(`no yt-dlp build for ${platform}; install it manually (pipx install yt-dlp)`);
    await download(`https://github.com/yt-dlp/yt-dlp/releases/latest/download/${YTDLP_ASSET}`, dest);
    fs.chmodSync(dest, 0o755);
    const v = spawnSync(dest, ['--version'], { encoding: 'utf8' });
    if (v.status !== 0) throw new Error('downloaded yt-dlp does not run');
    console.log(`✓ yt-dlp ${v.stdout.trim()}`);
}

async function setupFfmpeg() {
    const ffmpeg = path.join(BIN, `ffmpeg${exe}`);
    const ffprobe = path.join(BIN, `ffprobe${exe}`);
    if (fs.existsSync(ffmpeg) && fs.existsSync(ffprobe) && !FORCE) return console.log('✓ ffmpeg already present');
    if (!FORCE && onPath('ffmpeg') && onPath('ffprobe')) return console.log('✓ using system ffmpeg');
    if (!FFMPEG_ASSET) {
        throw new Error(`no bundled ffmpeg for ${platform}; install it yourself (macOS: brew install ffmpeg)`);
    }

    const work = fs.mkdtempSync(path.join(os.tmpdir(), 'zd-ffmpeg-'));
    try {
        const archive = path.join(work, FFMPEG_ASSET);
        await download(`https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/${FFMPEG_ASSET}`, archive);
        console.log('  extracting...');
        // tar ships with Windows 10+, Linux and macOS, and reads both .zip and .tar.xz
        const r = spawnSync('tar', ['-xf', archive, '-C', work], { stdio: 'inherit' });
        if (r.status !== 0) throw new Error('could not extract ffmpeg archive (is tar/xz installed?)');
        const srcBin = path.join(work, FFMPEG_ASSET.replace(/\.(zip|tar\.xz)$/, ''), 'bin');
        for (const name of [`ffmpeg${exe}`, `ffprobe${exe}`]) {
            fs.copyFileSync(path.join(srcBin, name), path.join(BIN, name));
            fs.chmodSync(path.join(BIN, name), 0o755);
        }
    } finally {
        fs.rmSync(work, { recursive: true, force: true });
    }
    if (spawnSync(ffmpeg, ['-version']).status !== 0) throw new Error('downloaded ffmpeg does not run');
    console.log('✓ ffmpeg + ffprobe');
}

(async () => {
    console.log(`\nZDownload setup (${platform})`);
    fs.mkdirSync(BIN, { recursive: true });
    try {
        await setupYtDlp();
        await setupFfmpeg();
        console.log('Ready. Start with: npm start\n');
    } catch (err) {
        console.error(`\n✗ Setup failed: ${err.message}\n  Retry with: npm run setup\n`);
        process.exit(1);
    }
})();
