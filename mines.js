const $ = id => document.getElementById(id);
const GRID_SIZE = 25;
const MODES = [2, 4, 10, 15];
const EDGE = { 2: 0.81, 4: 0.88, 10: 0.94, 15: 0.97 };
const MIN_MULT = 0.7;
const MIN_BET = 15;

let state = {
    stars: 0,
    active: false,
    minesCount: 2,
    betAmount: 50,
    minePositions: [],
    cellsRevealed: new Array(GRID_SIZE).fill(false),
    openedCount: 0,
    gameOver: false,
    revealAll: false
};

document.addEventListener('DOMContentLoaded', init);

function init() {
    const savedStars = localStorage.getItem('userStars');
    state.stars = savedStars !== null ? parseInt(savedStars) : 12500;

    const name = localStorage.getItem('userName') || 'Username';
    $('userName').textContent = name;

    updateBalanceUI();
    renderModes();
    renderGrid();
}

function saveStars() { localStorage.setItem('userStars', state.stars.toString()); }

function updateBalanceUI() {
    $('balanceDisplay').textContent = state.stars.toLocaleString('ru-RU');
}

/* ═══════════ MULTIPLIER ═══════════ */
function multiplierFor(mc, p) {
    if (p <= 0) return 1;
    let sp = 1;
    for (let i = 0; i < p; i++) sp *= (GRID_SIZE - mc - i) / (GRID_SIZE - i);
    const e = EDGE[mc] || 0.97;
    return Math.max(MIN_MULT, Math.round((e * (1 / sp)) * 100) / 100);
}

function currentWin() {
    const m = multiplierFor(state.minesCount, state.openedCount);
    return Math.floor(state.betAmount * m);
}

/* ═══════════ MODES ═══════════ */
function renderModes() {
    $('minesModes').innerHTML = MODES.map(m =>
        `<button class="mines-mode-btn ${m === state.minesCount ? 'active' : ''}" onclick="setMinesCount(${m})" ${state.active ? 'disabled' : ''}>${m} мин</button>`
    ).join('');
}

function setMinesCount(m) {
    if (state.active) return;
    state.minesCount = m;
    renderModes();
    updateInfo();
}

/* ═══════════ GRID ═══════════ */
function renderGrid() {
    const g = $('minesGrid');
    let h = '';
    for (let i = 0; i < GRID_SIZE; i++) {
        let c = 'mine-cell';
        let co = '';
        const r = state.cellsRevealed[i];
        const isMine = state.minePositions.includes(i);
        if (r) {
            if (isMine) { c += ' mine'; co = '💥'; }
            else { c += ' safe'; co = `<img class="star-icon-cell" src="star.png" alt="star">`; }
        } else if (state.revealAll && isMine) {
            c += ' mine';
            co = '💥';
        }
        const disabled = r || !state.active || state.gameOver;
        h += `<button class="${c}" onclick="onCellClick(${i})" ${disabled ? 'disabled' : ''}>${co}</button>`;
    }
    g.innerHTML = h;
    updateInfo();
    updateMainBtn();
}

function updateInfo() {
    if (!state.active) {
        $('minesInfo').textContent = `Мин: ${state.minesCount} · нажмите «Сделать ставку»`;
    } else if (state.gameOver) {
        $('minesInfo').textContent = 'Раунд завершён';
    } else if (state.openedCount === 0) {
        const nm = multiplierFor(state.minesCount, 1);
        $('minesInfo').textContent = `Откройте клетку · x${nm.toFixed(2)} за первую`;
    } else {
        const nm = multiplierFor(state.minesCount, state.openedCount + 1);
        $('minesInfo').textContent = `Открыто: ${state.openedCount} · следующая клетка x${nm.toFixed(2)}`;
    }
}

/* ═══════════ MAIN BUTTON ═══════════ */
function updateMainBtn() {
    const b = $('mainBtn');
    b.className = 'place-btn';
    b.disabled = false;

    if (!state.active) {
        b.textContent = 'Сделать ставку';
    } else if (state.gameOver) {
        b.textContent = 'Раунд завершён';
        b.disabled = true;
    } else if (state.openedCount === 0) {
        b.textContent = 'Откройте клетку';
        b.disabled = true;
    } else {
        const m = multiplierFor(state.minesCount, state.openedCount);
        const win = currentWin();
        b.innerHTML = `Забрать x${m.toFixed(2)} · ${win.toLocaleString('ru-RU')} ⭐`;
        b.classList.add('cashout');
    }
}

function onMainBtn() {
    if (!state.active) {
        const amount = parseInt($('betAmount').value) || MIN_BET;
        if (amount < MIN_BET) { showToast(`Минимум ${MIN_BET} звёзд`, 'err'); return; }
        if (amount > state.stars) { showToast('Недостаточно звёзд', 'err'); return; }

        state.stars -= amount;
        saveStars();
        updateBalanceUI();

        state.active = true;
        state.betAmount = amount;
        state.openedCount = 0;
        state.gameOver = false;
        state.revealAll = false;
        state.cellsRevealed = new Array(GRID_SIZE).fill(false);

        const positions = Array.from({ length: GRID_SIZE }, (_, i) => i);
        state.minePositions = [];
        for (let i = 0; i < state.minesCount; i++) {
            const idx = Math.floor(Math.random() * positions.length);
            state.minePositions.push(positions[idx]);
            positions.splice(idx, 1);
        }
        renderGrid();
        vibrate('light');
    } else if (state.openedCount > 0 && !state.gameOver) {
        finishRound(currentWin());
    }
}

/* ═══════════ CELL CLICK ═══════════ */
function onCellClick(i) {
    if (!state.active || state.gameOver || state.cellsRevealed[i]) return;
    state.cellsRevealed[i] = true;
    vibrate('light');

    if (state.minePositions.includes(i)) {
        state.minePositions.forEach(p => state.cellsRevealed[p] = true);
        state.gameOver = true;
        state.revealAll = true;
        renderGrid();
        vibrate('error');
        showToast(`💥 Мина! Ставка ${state.betAmount.toLocaleString('ru-RU')} сгорела`, 'err');
        setTimeout(resetRound, 3000);
    } else {
        state.openedCount++;
        const safe = GRID_SIZE - state.minesCount;
        if (state.openedCount === safe) {
            finishRound(currentWin());
        } else {
            renderGrid();
            vibrate('light');
        }
    }
}

/* ═══════════ FINISH ═══════════ */
function finishRound(win) {
    state.gameOver = true;
    state.revealAll = true;
    state.stars += win;
    saveStars();
    updateBalanceUI();
    renderGrid();
    vibrate('success');
    showToast(`Выигрыш: ${win.toLocaleString('ru-RU')} ⭐`, 'ok');
    setTimeout(resetRound, 3000);
}

function resetRound() {
    state.active = false;
    state.gameOver = false;
    state.openedCount = 0;
    state.revealAll = false;
    state.cellsRevealed = new Array(GRID_SIZE).fill(false);
    state.minePositions = [];
    renderModes();
    renderGrid();
}

/* ═══════════ BET BUTTONS ═══════════ */
function setBet(v) { $('betAmount').value = v; }
function setBetMax() { $('betAmount').value = Math.max(MIN_BET, state.stars); }

/* ═══════════ UTILS ═══════════ */
function vibrate(style) {
    try {
        if (navigator.vibrate) navigator.vibrate(style === 'success' ? [30,20,50] : style === 'error' ? [60,30,60] : 15);
    } catch(e) {}
}

function showToast(msg, type = 'ok') {
    const t = $('toast');
    t.textContent = msg;
    t.className = 'toast show ' + type;
    setTimeout(() => t.classList.remove('show'), 2500);
}

window.setMinesCount = setMinesCount;
window.onCellClick = onCellClick;
window.onMainBtn = onMainBtn;
window.setBet = setBet;
window.setBetMax = setBetMax;