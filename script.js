'use strict';

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
};

// ================================================================
// HELPERS
// ================================================================
const $ = id => document.getElementById(id);

// ================================================================
// BOOTSTRAP
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    bindStep1();
    bindStep2();
    bindStep3();
    scaleCard();
    window.addEventListener('resize', scaleCard);
});

// ================================================================
// STEP 1 - PHOTO
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
// STEP 2 - PLAYER DATA
// ================================================================
function bindStep2() {
    $('back-2').addEventListener('click', () => goTo(1));
    $('next-2').addEventListener('click', () => { captureForm(); goTo(3); });

    $('f-birth').addEventListener('input', e => { applyDateMask(e.target); captureForm(); updateCard(); });
    $('f-height').addEventListener('input', e => { applyHeightMask(e.target); captureForm(); updateCard(); });
    $('f-weight').addEventListener('input', e => { applyWeightMask(e.target); captureForm(); updateCard(); });

    ['f-name', 'f-club'].forEach(id => {
        $(id).addEventListener('input', () => { captureForm(); updateCard(); });
    });
}

// ----------------------------------------------------------------
// Input masks
// ----------------------------------------------------------------

function applyDateMask(input) {
    // Allow only digits; auto-insert hyphens at positions 2 and 5
    let v = input.value.replace(/[^\d]/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    let out = '';
    for (let i = 0; i < v.length; i++) {
        if (i === 2 || i === 4) out += '-';
        out += v[i];
    }
    input.value = out;
}

function applyHeightMask(input) {
    // Allow only digits and one comma (e.g. 1,76)
    let v = input.value.replace(/[^\d,]/g, '');
    const parts = v.split(',');
    if (parts.length > 2) v = parts[0] + ',' + parts.slice(1).join('');
    input.value = v;
}

function applyWeightMask(input) {
    // Allow only digits
    input.value = input.value.replace(/[^\d]/g, '');
}

// ----------------------------------------------------------------
// Capture form state
// ----------------------------------------------------------------

function captureForm() {
    state.name   = $('f-name').value.trim();
    state.birth  = formatBirthForCard($('f-birth').value.trim());
    state.height = $('f-height').value.trim() ? $('f-height').value.trim() + 'm' : '';
    state.weight = $('f-weight').value.trim() ? $('f-weight').value.trim() + ' kg' : '';
    state.club   = $('f-club').value.trim();
}

// Strip leading zeros from day and month: "12-07-2000" -> "12-7-2000"
function formatBirthForCard(raw) {
    if (!raw) return '';
    const parts = raw.split('-');
    return parts.map(p => String(parseInt(p, 10) || p)).join('-');
}

// ================================================================
// STEP 3 - DOWNLOAD
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
            const icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
                + ' stroke-width="2.5" stroke-linecap="round">'
                + '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>'
                + '<polyline points="7 10 12 15 17 10"/>'
                + '<line x1="12" y1="15" x2="12" y2="3"/>'
                + '</svg> Baixar Figurinha';
            btns.forEach(b => { b.disabled = false; b.innerHTML = icon; });
        });
    }, 80));
}
