'use strict';

// ================================================================
// COUNTRIES
// ================================================================
const COUNTRIES = [
    { code: 'ALG', name: 'Argélia' },
    { code: 'ARG', name: 'Argentina' },
    { code: 'AUS', name: 'Austrália' },
    { code: 'AUT', name: 'Áustria' },
    { code: 'BEL', name: 'Bélgica' },
    { code: 'BOL', name: 'Bolívia' },
    { code: 'BRA', name: 'Brasil' },
    { code: 'CMR', name: 'Camarões' },
    { code: 'CAN', name: 'Canadá' },
    { code: 'CHI', name: 'Chile' },
    { code: 'CIV', name: 'Costa do Marfim' },
    { code: 'CRC', name: 'Costa Rica' },
    { code: 'CRO', name: 'Croácia' },
    { code: 'DEN', name: 'Dinamarca' },
    { code: 'ECU', name: 'Equador' },
    { code: 'EGY', name: 'Egito' },
    { code: 'SCO', name: 'Escócia' },
    { code: 'SVK', name: 'Eslováquia' },
    { code: 'SVN', name: 'Eslovênia' },
    { code: 'ESP', name: 'Espanha' },
    { code: 'USA', name: 'Estados Unidos' },
    { code: 'FRA', name: 'França' },
    { code: 'GHA', name: 'Gana' },
    { code: 'GER', name: 'Alemanha' },
    { code: 'GRE', name: 'Grécia' },
    { code: 'HON', name: 'Honduras' },
    { code: 'HUN', name: 'Hungria' },
    { code: 'ENG', name: 'Inglaterra' },
    { code: 'IRL', name: 'Irlanda' },
    { code: 'IRN', name: 'Irã' },
    { code: 'ITA', name: 'Itália' },
    { code: 'JAM', name: 'Jamaica' },
    { code: 'JPN', name: 'Japão' },
    { code: 'JOR', name: 'Jordânia' },
    { code: 'MAR', name: 'Marrocos' },
    { code: 'MEX', name: 'México' },
    { code: 'NGA', name: 'Nigéria' },
    { code: 'NOR', name: 'Noruega' },
    { code: 'NZL', name: 'Nova Zelândia' },
    { code: 'NED', name: 'Holanda' },
    { code: 'PAN', name: 'Panamá' },
    { code: 'PAR', name: 'Paraguai' },
    { code: 'PER', name: 'Peru' },
    { code: 'POL', name: 'Polônia' },
    { code: 'POR', name: 'Portugal' },
    { code: 'QAT', name: 'Qatar' },
    { code: 'ROM', name: 'Romênia' },
    { code: 'SAU', name: 'Arábia Saudita' },
    { code: 'SEN', name: 'Senegal' },
    { code: 'SRB', name: 'Sérvia' },
    { code: 'SUI', name: 'Suíça' },
    { code: 'SWE', name: 'Suécia' },
    { code: 'TUN', name: 'Tunísia' },
    { code: 'TUR', name: 'Turquia' },
    { code: 'UKR', name: 'Ucrânia' },
    { code: 'URU', name: 'Uruguai' },
    { code: 'VEN', name: 'Venezuela' },
    { code: 'WAL', name: 'País de Gales' },
    { code: 'KOR', name: 'Coreia do Sul' },
    { code: 'CZE', name: 'República Tcheca' },
    { code: 'SLV', name: 'El Salvador' },
];

// ================================================================
// STATE
// ================================================================
const state = {
    photoDataUrl: null,
    name:    '',
    birth:   '',
    height:  '',
    weight:  '',
    club:    '',
    country: '',
};

// ================================================================
// HELPERS
// ================================================================
const $ = id => document.getElementById(id);

// ================================================================
// BOOTSTRAP
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    populateCountries();
    bindStep1();
    bindStep2();
    bindStep3();
    scaleCard();
    window.addEventListener('resize', scaleCard);
});

// ================================================================
// COUNTRY SELECT
// ================================================================
function populateCountries() {
    const sel = $('f-country');
    const sorted = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name, 'pt'));
    sorted.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.code;
        opt.textContent = `${c.name} (${c.code})`;
        sel.appendChild(opt);
    });
}

// ================================================================
// STEP 1 — PHOTO
// ================================================================
function bindStep1() {
    const fileInput  = $('file-input');
    const dropZone   = $('drop-zone');
    const preview    = $('photo-preview');
    const prompt     = $('drop-prompt');
    const nextBtn    = $('next-1');

    fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) loadPhoto(file, preview, prompt, nextBtn);
    });

    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            loadPhoto(file, preview, prompt, nextBtn);
        }
    });

    nextBtn.addEventListener('click', () => goTo(2));
}

function loadPhoto(file, previewEl, promptEl, nextBtn) {
    const reader = new FileReader();
    reader.onload = e => {
        state.photoDataUrl = e.target.result;
        previewEl.src = state.photoDataUrl;
        previewEl.classList.remove('hidden');
        promptEl.style.display = 'none';
        nextBtn.disabled = false;
        updateCard();
    };
    reader.readAsDataURL(file);
}

// ================================================================
// STEP 2 — PLAYER DATA
// ================================================================
function bindStep2() {
    $('back-2').addEventListener('click', () => goTo(1));
    $('next-2').addEventListener('click', () => { captureForm(); goTo(3); });

    // Live preview while typing
    ['f-name','f-birth','f-height','f-weight','f-club','f-country'].forEach(id => {
        $(id).addEventListener('input', () => { captureForm(); updateCard(); });
    });
}

function captureForm() {
    state.name    = $('f-name').value.trim();
    state.birth   = $('f-birth').value.trim();
    state.height  = $('f-height').value.trim();
    state.weight  = $('f-weight').value.trim();
    state.club    = $('f-club').value.trim();
    state.country = $('f-country').value;
}

// ================================================================
// STEP 3 — DOWNLOAD
// ================================================================
function bindStep3() {
    $('back-3').addEventListener('click', () => goTo(2));
    $('btn-download-mobile').addEventListener('click', downloadCard);
}

// ================================================================
// NAVIGATION
// ================================================================
function goTo(step) {
    [1, 2, 3].forEach(n => {
        $(`panel-${n}`).classList.toggle('hidden', n !== step);
    });

    // Update step indicators
    document.querySelectorAll('.step-node').forEach(el => {
        const n = +el.dataset.n;
        el.classList.toggle('active', n === step);
        el.classList.toggle('done',   n < step);
    });
    document.querySelectorAll('.step-connector').forEach((el, i) => {
        el.classList.toggle('done', i + 1 < step);
    });

    if (step === 3) {
        captureForm();
        updateCard();
    }

    // Mobile: show preview-col (card) only on step 3
    const previewCol = $('preview-col');
    if (previewCol) previewCol.classList.toggle('show', step === 3);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================================================================
// CARD UPDATE
// ================================================================
function updateCard() {
    // Photo (fall back to placeholder when no upload yet)
    const photoEl = $('c-photo');
    photoEl.style.display = '';
    photoEl.src = state.photoDataUrl || 'assets/jogador.png';

    // Name
    $('c-name').textContent = state.name
        ? state.name.toUpperCase()
        : 'NOME DO JOGADOR';

    // Stats (birth | height | weight)
    const parts = [state.birth, state.height, state.weight].filter(Boolean);
    $('c-stats').textContent = parts.length
        ? parts.join(' | ')
        : 'DD-M-AAAA | 0,00m | 00 kg';

    // Club (hidden if empty)
    const clubEl = $('c-club');
    if (state.club) {
        clubEl.textContent = state.club.toUpperCase();
        clubEl.style.display = '';
    } else {
        clubEl.style.display = 'none';
    }

    // Flag + country code
    const flagEl = $('c-flag');
    const codeEl = $('c-code');
    const code   = state.country || 'BRA';
    codeEl.textContent = code;
    flagEl.style.visibility = '';
    const base = `assets/flags/bandeira-${code.toLowerCase()}`;
    flagEl.onerror = () => {
        flagEl.onerror = () => { flagEl.style.visibility = 'hidden'; };
        flagEl.src = `${base}.svg`;
    };
    flagEl.src = `${base}.png`;
}

// ================================================================
// CARD SCALING
// ================================================================
const CARD_W = 452;
const CARD_H = 600;

function scaleCard() {
    const card  = $('sticker-card');
    if (!card) return;
    const stage = card.closest('.card-stage');
    if (!stage) return;

    // Use the preview column's width as the available space;
    // fall back to the stage parent or viewport.
    const col    = $('preview-col');
    const availW = (col ? col.clientWidth : stage.parentElement?.clientWidth) || (window.innerWidth - 48);
    const scale  = Math.min(1, availW / CARD_W);

    card.style.transform       = scale < 1 ? `scale(${scale})` : 'none';
    card.style.transformOrigin = 'top left';

    // Make the stage the exact visual size so preview-col sizes naturally.
    stage.style.width    = `${Math.round(CARD_W * scale)}px`;
    stage.style.height   = `${Math.round(CARD_H * scale)}px`;
    stage.style.overflow = 'hidden';
}

// ================================================================
// DOWNLOAD
// ================================================================
function downloadCard() {
    if (typeof html2canvas === 'undefined') {
        alert('Biblioteca de captura ainda carregando. Aguarde um momento e tente novamente.');
        return;
    }

    // Disable whichever button triggered the download
    const btns = [$('btn-download-mobile')].filter(Boolean);
    btns.forEach(b => { b.disabled = true; b.textContent = 'Gerando…'; });

    // Render a full-size off-screen clone so we don't cause visual flash
    const original = $('sticker-card');
    const clone    = original.cloneNode(true);

    Object.assign(clone.style, {
        position:  'fixed',
        top:       '-9999px',
        left:      '-9999px',
        transform: 'none',
        width:     `${CARD_W}px`,
        height:    `${CARD_H}px`,
        borderRadius: '16px',
    });
    document.body.appendChild(clone);

    // Small delay to let the browser paint the clone (especially images)
    requestAnimationFrame(() => setTimeout(() => {
        html2canvas(clone, {
            scale:           2,
            useCORS:         true,
            allowTaint:      true,
            backgroundColor: null,
            width:  CARD_W,
            height: CARD_H,
            logging: false,
        })
        .then(canvas => {
            const a = document.createElement('a');
            const slug = (state.name || 'jogador')
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .replace(/[^a-z0-9]+/gi, '-')
                .toLowerCase();
            a.download = `figurinha-copa-2026-${slug}.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
        })
        .catch(() => {
            alert('Não foi possível gerar a imagem. Tente novamente.');
        })
        .finally(() => {
            document.body.removeChild(clone);
            const icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.5" stroke-linecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg> Baixar Figurinha`;
            btns.forEach(b => { b.disabled = false; b.innerHTML = icon; });
        });
    }, 80));
}
