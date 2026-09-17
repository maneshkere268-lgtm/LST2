// mines.js — Мины
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

let currentWinGift = null;
let winLottieInstance = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
    window.TG.updateHeaderUI();
    state.stars = parseInt(localStorage.getItem('userStars')) || 12500;
    $('userName').textContent = window.TG.getShortName();

    updateBalanceUI();
    renderModes();
    renderGrid();

    window.addEventListener('firebaseDataLoaded', (e) => {
        if (typeof e.detail.stars === 'number') {
            state.stars = e.detail.stars;
            updateBalanceUI();
        }
    });
}

function saveStars() {
    localStorage.setItem('userStars', state.stars.toString());
    window.FB?.save();
}
function saveInventory(inv) {
    localStorage.setItem('userInventory', JSON.stringify(inv));
    window.FB?.save();
}
function updateBalanceUI() {
    $('balanceDisplay').textContent = state.stars.toLocaleString('ru-RU');
}

function getInventory() {
    try {
        const inv = JSON.parse(localStorage.getItem('userInventory') || '[]');
        return Array.isArray(inv) ? inv : [];
    } catch (e) { return []; }
}

function saveGiftToInventory(gift) {
    const inventory = getInventory();
    inventory.push({
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: gift.name,
        price: gift.price,
        stars: gift.price,
        image: gift.image,
        timestamp: Date.now()
    });
    saveInventory(inventory);
}

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
            else { c += ' safe'; co = `<img class="star-icon-cell" src="${window.STAR_ICON}" alt="star">`; }
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

function finishRound(win) {
    state.gameOver = true;
    state.revealAll = true;

    const r = window.pickGiftForWin(win);
    const gift = r.gift;

    if (gift && gift.price >= 100) {
        saveGiftToInventory(gift);
        state.stars += r.remainder;
        saveStars();
        updateBalanceUI();
        renderGrid();
        vibrate('success');
        openWinModal(gift, r.remainder);
    } else {
        state.stars += win;
        saveStars();
        updateBalanceUI();
        renderGrid();
        vibrate('success');
        showToast(`Выигрыш: ${win.toLocaleString('ru-RU')} ⭐`, 'ok');
    }

    setTimeout(resetRound, 4000);
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

function destroyWinLottie() {
    if (winLottieInstance) {
        try { winLottieInstance.destroy(); } catch(e) {}
        winLottieInstance = null;
    }
    const old = document.querySelector('.win-modal-lottie');
    if (old) old.remove();
    const img = $('winModalImg');
    if (img) img.classList.remove('hidden');
}

function openWinModal(gift, remainder) {
    currentWinGift = gift;

    const img = $('winModalImg');
    const media = $('winModalMedia');

    destroyWinLottie();
    img.src = gift.image;
    img.onerror = function() { this.onerror = null; this.src = window.GIFT_FALLBACK; };
    img.classList.remove('hidden');

    $('winModalName').textContent = gift.name;

    const valueEl = $('winModalValue');
    if (remainder && remainder > 0) {
        valueEl.querySelector('span').textContent =
            `${gift.price.toLocaleString('ru-RU')} + ${remainder.toLocaleString('ru-RU')}`;
    } else {
        valueEl.querySelector('span').textContent = gift.price.toLocaleString('ru-RU');
    }

    const lottieUrl = window.getGiftLottie ? window.getGiftLottie(gift.name, gift.price) : null;
    if (lottieUrl) {
        fetch(lottieUrl, { method: 'HEAD' })
            .then(r => {
                if (!r.ok) return;
                img.classList.add('hidden');
                const box = document.createElement('div');
                box.className = 'win-modal-lottie';
                media.appendChild(box);
                winLottieInstance = lottie.loadAnimation({
                    container: box, renderer: 'svg', loop: true, autoplay: true, path: lottieUrl
                });
            })
            .catch(() => {});
    }

    $('winModal').classList.add('show');
    vibrate('success');
}

function closeWinModal() {
    destroyWinLottie();
    $('winModal').classList.remove('show');
    currentWinGift = null;
}

function sellWinGift() {
    if (!currentWinGift) return;
    const inventory = getInventory();
    let idx = -1;
    for (let i = inventory.length - 1; i >= 0; i--) {
        if (inventory[i].name === currentWinGift.name) { idx = i; break; }
    }
    if (idx === -1) { showToast('Предмет не найден', 'err'); return; }

    const item = inventory[idx];
    const stars = item.stars || currentWinGift.price;
    inventory.splice(idx, 1);
    saveInventory(inventory);

    state.stars += stars;
    saveStars();
    updateBalanceUI();
    showToast(`Продано за ${stars.toLocaleString('ru-RU')} ⭐`, 'ok');
    vibrate('success');
    closeWinModal();
}

function upgradeWinGift() {
    if (!currentWinGift) return;
    const inventory = getInventory();
    let idx = -1;
    for (let i = inventory.length - 1; i >= 0; i--) {
        if (inventory[i].name === currentWinGift.name) { idx = i; break; }
    }
    if (idx === -1) { showToast('Предмет не найден', 'err'); return; }
    localStorage.setItem('upgradeItemId', inventory[idx].id);
    window.location.href = 'upgrades.html';
}

function setBet(v) { $('betAmount').value = v; }
function setBetMax() { $('betAmount').value = Math.max(MIN_BET, state.stars); }

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
window.closeWinModal = closeWinModal;
window.sellWinGift = sellWinGift;
window.upgradeWinGift = upgradeWinGift;