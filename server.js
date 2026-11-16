const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
// Only this computer by default. Set HOST=0.0.0.0 to open it to other devices.
const HOST = process.env.HOST || '127.0.0.1';
// Max yt-dlp processes at once, so the server can't be flooded
const MAX_JOBS = Number(process.env.MAX_JOBS) || 3;
const JOB_TIMEOUT_MS = 10 * 60 * 1000;

// Tools downloaded by `npm install` (scripts/setup.js) live in ./bin; otherwise fall back to PATH
const BIN = path.join(__dirname, 'bin');
const exe = process.platform === 'win32' ? '.exe' : '';
const localYtDlp = path.join(BIN, `yt-dlp${exe}`);
const ytDlpPath = fs.existsSync(localYtDlp) ? localYtDlp : 'yt-dlp';
const ffmpegArgs = fs.existsSync(path.join(BIN, `ffmpeg${exe}`)) ? ['--ffmpeg-location', BIN] : [];
// yt-dlp needs a JS runtime to see all YouTube formats; reuse the Node running this server
const jsRuntimeArgs = ['--js-runtimes', `node:${process.execPath}`];

// No CORS: only this app's own page may call the API
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const ALLOWED_HOSTS = new Set([
    'youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be'
]);

// Returns a normalized YouTube URL, or null. Anything else never reaches yt-dlp.
function cleanYouTubeUrl(input) {
    if (typeof input !== 'string' || input.length > 500) return null;
    let u;
    try { u = new URL(input.trim()); } catch { return null; }
    if (!['https:', 'http:'].includes(u.protocol)) return null;
    if (!ALLOWED_HOSTS.has(u.hostname.toLowerCase())) return null;
    return u.href;
}

let activeJobs = 0;

// Runs yt-dlp once per request; replies exactly once; kills it if the browser leaves.
function runYtDlp(args, url, res, failMessage, onSuccess) {
    if (activeJobs >= MAX_JOBS) {
        return res.status(429).json({ error: 'Server busy, try again shortly.' });
    }
    activeJobs++;
    let released = false;
    const release = () => { if (!released) { released = true; activeJobs--; } };

    // '--' ends options: the URL can never be read as a yt-dlp flag
    const proc = spawn(ytDlpPath, [...jsRuntimeArgs, ...args, '--', url]);
    const timer = setTimeout(() => proc.kill(), JOB_TIMEOUT_MS);
    res.on('close', () => { if (proc.exitCode === null) proc.kill(); });

    let output = '';
    let errorOutput = '';
    proc.stdout.on('data', (d) => { output += d; });
    proc.stderr.on('data', (d) => { errorOutput += d; });

    proc.on('error', (err) => {
        clearTimeout(timer);
        release();
        console.error('yt-dlp failed to start:', err.message);
        if (!res.headersSent) res.status(500).json({ error: 'yt-dlp not found. Please install yt-dlp first.' });
    });

    proc.on('close', (code) => {
        clearTimeout(timer);
        release();
        if (res.headersSent) return;
        if (code !== 0) {
            console.error(errorOutput); // details stay in the server log, not sent to the browser
            return res.status(500).json({ error: failMessage });
        }
        onSuccess(output);
    });
}

app.post('/api/info', (req, res) => {
    const url = cleanYouTubeUrl(req.body && req.body.url);
    if (!url) return res.status(400).json({ error: 'Only YouTube / YouTube Music links are supported.' });

    runYtDlp(['--dump-json', '--no-playlist'], url, res, 'Failed to fetch video info', (output) => {
        try {
            const info = JSON.parse(output);
            res.json({
                title: info.title,
                thumbnail: info.thumbnail,
                duration: info.duration,
                uploader: info.uploader,
                id: info.id
            });
        } catch {
            res.status(500).json({ error: 'Failed to parse video info' });
        }
    });
});

app.post('/api/download', (req, res) => {
    const url = cleanYouTubeUrl(req.body && req.body.url);
    if (!url) return res.status(400).json({ error: 'Only YouTube / YouTube Music links are supported.' });

    // 'best' = keep YouTube's original stream (no re-encode); mp3/flac are conversions of it
    const format = req.body.format;
    const audioFormat = ['best', 'flac', 'mp3'].includes(format) ? format : 'mp3';

    // Private temp folder per request: no clashes between users, always removed afterwards
    const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zdownload-'));
    res.on('close', () => fs.rm(workDir, { recursive: true, force: true }, () => { }));

    const args = [
        '-x',
        '--audio-format', audioFormat,
        '--audio-quality', '0',
        '--embed-thumbnail',
        '--add-metadata',
        '--parse-metadata', 'uploader:%(artist)s',
        '--parse-metadata', 'title:%(title)s',
        ...ffmpegArgs,
        '-o', path.join(workDir, '%(title)s.%(ext)s'),
        '--no-playlist',
        '--print', 'after_move:filepath'
    ];

    runYtDlp(args, url, res, 'Extraction failed', (output) => {
        const filePath = output.trim().split('\n').pop();
        // must be a file yt-dlp wrote inside our own temp folder
        if (!filePath || path.dirname(path.resolve(filePath)) !== workDir || !fs.existsSync(filePath)) {
            return res.status(500).json({ error: 'File not found after processing' });
        }
        res.download(filePath, path.basename(filePath), (err) => {
            if (err) console.error('Stream error:', err.message);
        });
    });
});

app.listen(PORT, HOST, () => {
    const shown = HOST === '0.0.0.0' ? 'localhost' : HOST;
    console.log(`🎵 YouTube Music Downloader running at http://${shown}:${PORT}`);
});
