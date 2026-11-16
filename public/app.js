const I18N = {
    id: {
        badge: 'Audio Extractor',
        heroA: 'Musik favoritmu,',
        heroB: 'kualitas terbaik.',
        subtitle: 'Ekstrak audio dari YouTube & YouTube Music ke MP3 320kbps atau FLAC dari stream audio terbaik yang tersedia — lengkap dengan sampul album dan metadata.',
        placeholder: 'Tempel link YouTube atau YouTube Music di sini...',
        clear: 'Hapus URL',
        paste: 'Tempel',
        analyze: 'Analisis',
        processing: 'Memproses...',
        step1t: 'Tempel link', step1d: 'Salin URL lagu dari YouTube atau YouTube Music.',
        step2t: 'Pilih format', step2d: 'Original untuk kualitas terbaik, MP3 untuk kompatibilitas.',
        step3t: 'Unduh', step3d: 'File langsung tersimpan beserta sampul & metadata.',
        detected: 'Track terdeteksi',
        chooseFormat: 'Pilih format audio',
        mp3Desc: 'Diputar di semua perangkat. Dikonversi ulang, jadi sedikit di bawah Original',
        flacDesc: 'Tanpa kompresi ulang, file lebih besar. Kualitas maksimal tetap sebatas sumber YouTube.',
        flacBadge: 'Tanpa loss tambahan',
        origBadge: 'Terbaik',
        origDesc: 'Stream asli YouTube tanpa konversi (Opus/M4A). Kualitas tertinggi yang ada.',
        download: 'Unduh Audio Sekarang',
        extracting: 'Mengekstrak {f}...',
        ready: 'Berhasil diunduh ke folder Downloads',
        save: 'Unduh ulang',
        chip1: 'Sampul album otomatis', chip2: 'Metadata artis & judul', chip3: 'Tanpa iklan',
        footer: 'Gunakan hanya untuk konten yang kamu miliki haknya.',
        visInfo: 'Mengambil informasi lagu dari YouTube...',
        visExtract: 'Mengekstrak audio kualitas tinggi ({f})...',
        errEmpty: 'Masukkan link YouTube atau YouTube Music terlebih dahulu.',
        errInfo: 'Gagal mengambil informasi video.',
        errExtract: 'Gagal mengekstrak audio.',
        errPaste: 'Tidak bisa membaca clipboard. Tempel manual dengan Ctrl+V.',
        thumbAlt: 'Sampul lagu',
        channel: 'Channel YouTube'
    },
    en: {
        badge: 'Audio Extractor',
        heroA: 'Your favorite music,',
        heroB: 'best available quality.',
        subtitle: 'Extract audio from YouTube & YouTube Music to 320kbps MP3 or FLAC from the best available audio stream — complete with album art and metadata.',
        placeholder: 'Paste a YouTube or YouTube Music link here...',
        clear: 'Clear URL',
        paste: 'Paste',
        analyze: 'Analyze',
        processing: 'Processing...',
        step1t: 'Paste a link', step1d: 'Copy a song URL from YouTube or YouTube Music.',
        step2t: 'Pick a format', step2d: 'Original for best quality, MP3 for compatibility.',
        step3t: 'Download', step3d: 'Saved instantly with cover art & metadata.',
        detected: 'Track detected',
        chooseFormat: 'Choose audio format',
        mp3Desc: 'Plays on every device. Re-encoded, so slightly below Original',
        flacDesc: 'No re-compression, larger file. Quality is still capped by the YouTube source.',
        flacBadge: 'No extra loss',
        origBadge: 'Best',
        origDesc: 'Original YouTube stream, no conversion (Opus/M4A). Highest quality available.',
        download: 'Download Audio Now',
        extracting: 'Extracting {f}...',
        ready: 'Saved to your Downloads folder',
        save: 'Download again',
        chip1: 'Auto album art', chip2: 'Artist & title metadata', chip3: 'No ads',
        footer: 'Only use for content you have the rights to.',
        visInfo: 'Fetching track info from YouTube...',
        visExtract: 'Extracting high-quality audio ({f})...',
        errEmpty: 'Please enter a YouTube or YouTube Music link first.',
        errInfo: 'Failed to fetch video info.',
        errExtract: 'Failed to extract audio.',
        errPaste: "Couldn't read the clipboard. Paste manually with Ctrl+V.",
        thumbAlt: 'Track cover',
        channel: 'YouTube Channel'
    }
};

let lang = 'id';
try { lang = localStorage.getItem('zd-lang') || (navigator.language.startsWith('id') ? 'id' : 'en'); } catch { }
if (!I18N[lang]) lang = 'id';

const t = (key, vars = {}) =>
    (I18N[lang][key] || key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const clearBtn = document.getElementById('clearBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const fetchBtn = document.getElementById('fetchBtn');
    const videoInfo = document.getElementById('videoInfo');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadResult = document.getElementById('downloadResult');
    const errorMsg = document.getElementById('errorMsg');
    const steps = document.getElementById('steps');
    const audioVis = document.getElementById('audioVis');
    const visStatus = document.getElementById('visStatus');
    const visBars = audioVis.querySelectorAll('.vis-bar');
    const langSwitch = document.querySelector('.lang-switch');

    let currentUrl = '';
    let visInterval;
    let errorTimer;
    let lastBlobUrl;

    // ---------- i18n ----------
    function applyLang() {
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = t(el.dataset.i18nTitle);
            el.setAttribute('aria-label', el.title);
        });
        document.getElementById('thumbnail').alt = t('thumbAlt');
        langSwitch.dataset.active = lang;
        langSwitch.querySelectorAll('.lang-btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    }

    langSwitch.addEventListener('click', (e) => {
        const btn = e.target.closest('.lang-btn');
        if (!btn || btn.dataset.lang === lang) return;
        lang = btn.dataset.lang;
        try { localStorage.setItem('zd-lang', lang); } catch { }
        // don't clobber button labels mid-request
        if (fetchBtn.disabled || downloadBtn.disabled) return;
        applyLang();
    });

    applyLang();

    // ---------- helpers ----------
    function formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const pad = n => n.toString().padStart(2, '0');
        return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${mins}:${pad(secs)}`;
    }

    function showError(message) {
        errorMsg.textContent = `⚠️ ${message}`;
        errorMsg.classList.remove('hidden');
        clearTimeout(errorTimer);
        errorTimer = setTimeout(() => errorMsg.classList.add('hidden'), 6000);
    }

    function hideResults() {
        videoInfo.classList.add('hidden');
        videoInfo.classList.remove('reveal');
        downloadResult.classList.add('hidden');
        downloadResult.classList.remove('reveal');
        errorMsg.classList.add('hidden');
    }

    function reveal(el) {
        el.classList.remove('hidden');
        requestAnimationFrame(() => {
            el.classList.add('reveal');
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    function startVisualizer(statusText) {
        visStatus.textContent = statusText;
        audioVis.classList.add('active');
        document.body.classList.add('busy');
        clearInterval(visInterval);
        visInterval = setInterval(() => {
            visBars.forEach(bar => {
                bar.style.height = `${Math.floor(Math.random() * 18) + 4}px`;
                bar.style.opacity = (Math.random() * 0.4 + 0.6).toFixed(2);
            });
        }, 110);
    }

    function stopVisualizer() {
        audioVis.classList.remove('active');
        document.body.classList.remove('busy');
        clearInterval(visInterval);
    }

    function updateClearButton() {
        clearBtn.classList.toggle('hidden', urlInput.value.trim().length === 0);
    }

    urlInput.addEventListener('input', updateClearButton);

    clearBtn.addEventListener('click', () => {
        urlInput.value = '';
        updateClearButton();
        urlInput.focus();
    });

    pasteBtn.addEventListener('click', async () => {
        try {
            urlInput.value = (await navigator.clipboard.readText()).trim();
            updateClearButton();
            if (urlInput.value) fetchBtn.click();
        } catch {
            showError(t('errPaste'));
            urlInput.focus();
        }
    });

    // ---------- fetch info ----------
    fetchBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();

        if (!url) {
            showError(t('errEmpty'));
            urlInput.focus();
            return;
        }

        hideResults();
        const inputSection = fetchBtn.closest('.input-section');
        const btnText = fetchBtn.querySelector('.btn-text');
        inputSection.classList.add('loading');
        fetchBtn.disabled = true;
        btnText.textContent = t('processing');
        currentUrl = url;
        startVisualizer(t('visInfo'));

        try {
            const response = await fetch('/api/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(t('errInfo') + (data.error ? ` (${data.error})` : ''));
            }

            document.getElementById('thumbnail').src = data.thumbnail;
            document.getElementById('coverBackdrop').style.setProperty('--cover', `url("${data.thumbnail}")`);
            document.getElementById('videoTitle').textContent = data.title;
            document.getElementById('uploader').textContent = data.uploader || t('channel');
            document.getElementById('duration').textContent = formatDuration(data.duration);

            steps.classList.add('hidden');
            reveal(videoInfo);
        } catch (error) {
            showError(error.message);
        } finally {
            inputSection.classList.remove('loading');
            fetchBtn.disabled = false;
            btnText.textContent = t('analyze');
            stopVisualizer();
        }
    });

    // ---------- download ----------
    downloadBtn.addEventListener('click', async () => {
        const formatSelect = document.querySelector('input[name="format"]:checked');
        if (!formatSelect) return;

        const format = formatSelect.value;
        const F = format === 'best' ? 'Original' : format.toUpperCase();
        const detailsContainer = downloadBtn.closest('.video-details');
        const btnText = downloadBtn.querySelector('.btn-text');
        detailsContainer.classList.add('loading');
        downloadBtn.disabled = true;
        btnText.textContent = t('extracting', { f: F });
        downloadResult.classList.add('hidden');
        startVisualizer(t('visExtract', { f: F }));

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: currentUrl, format })
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(t('errExtract') + (data.error ? ` (${data.error})` : ''));
            }

            const disposition = response.headers.get('Content-Disposition');
            let fileName = format === 'best' ? 'zdownload_audio' : `zdownload_audio.${format}`;
            if (disposition && disposition.includes('filename=')) {
                fileName = disposition.split('filename=')[1].replace(/['"]/g, '');
            }

            const blob = await response.blob();
            if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl); // free the previous file from memory
            const downloadUrl = lastBlobUrl = URL.createObjectURL(blob);

            document.getElementById('fileName').textContent = fileName;
            const link = document.getElementById('downloadLink');
            link.href = downloadUrl;
            link.download = fileName;

            reveal(downloadResult);

            // auto-trigger browser download
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();

            const rect = downloadBtn.getBoundingClientRect();
            createParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
        } catch (error) {
            showError(error.message);
        } finally {
            detailsContainer.classList.remove('loading');
            downloadBtn.disabled = false;
            btnText.textContent = t('download');
            stopVisualizer();
        }
    });

    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') fetchBtn.click();
    });

    function createParticleBurst(x, y) {
        const container = document.createElement('div');
        container.className = 'particle-burst';
        container.style.left = `${x}px`;
        container.style.top = `${y}px`;
        document.body.appendChild(container);

        for (let i = 0; i < 24; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 90 + 40;
            p.style.setProperty('--tx', `${Math.cos(angle) * velocity}px`);
            p.style.setProperty('--ty', `${Math.sin(angle) * velocity}px`);
            container.appendChild(p);
        }

        setTimeout(() => container.remove(), 900);
    }

    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.gradient-orb').forEach((orb, index) => {
            const factor = (index + 1) * 0.015;
            orb.style.marginLeft = `${(e.clientX - window.innerWidth / 2) * factor}px`;
            orb.style.marginTop = `${(e.clientY - window.innerHeight / 2) * factor}px`;
        });
    });
});
