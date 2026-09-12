const $ = id => document.getElementById(id);
const GRID_SIZE = 25;
const MODES = [2, 4, 10, 15];
const EDGE = { 2: 0.81, 4: 0.88, 10: 0.94, 15: 0.97 };
const MIN_MULT = 0.7;
const MIN_BET = 15;
const TON_TO_STARS = 125;
const STAR_ICON = 'star.png';
const GIFT_FALLBACK = 'star.png';
const ROOT_ITEMS = new Set(['Bear', 'Gift', 'Cake', 'Trophy']);

/* ═══════════════════════════════════════════════════════════
 * СПИСОК ПРЕДМЕТОВ (цены в звёздах)
 * Корневые: Bear, Gift, Cake, Trophy — лежат в корне проекта
 * Остальные — через CDN changes.tg
 * ═══════════════════════════════════════════════════════════ */
const GIFTS = [
    // ── Корневые
    { name: 'Bear',               price: 15,        image: '../bear.png' },
    { name: 'Gift',               price: 25,        image: '../gift.png' },
    { name: 'Cake',               price: 50,        image: '../cake.png' },
    { name: 'Trophy',             price: 100,       image: '../trophy.png' },

    // ── Основные
    { name: 'Big Year',           price: 500,       image: null },
    { name: 'Candy Cane',         price: 501.25,    image: null },
    { name: 'Holiday Drink',      price: 501.25,    image: null },
    { name: 'Winter Wreath',      price: 501.25,    image: null },
    { name: 'Pool Float',         price: 500,       image: null },
    { name: 'Lunar Snake',        price: 500,       image: null },
    { name: 'Tama Gadget',        price: 502.5,     image: null },
    { name: 'Jester Hat',         price: 503.75,    image: null },
    { name: 'Hypno Lollipop',     price: 505,       image: null },
    { name: 'Pet Snake',          price: 506.25,    image: null },
    { name: 'Chill Flame',        price: 508.75,    image: null },
    { name: 'Vice Cream',         price: 507.5,     image: null },
    { name: 'Snake Box',          price: 498.75,    image: null },
    { name: 'Santa Hat',          price: 513.75,    image: null },
    { name: 'Instant Ramen',      price: 523.75,    image: null },
    { name: 'Ginger Cookie',      price: 530,       image: null },
    { name: 'Easter Egg',         price: 533.75,    image: null },
    { name: 'Party Sparkler',     price: 536.25,    image: null },
    { name: 'Happy Brownie',      price: 542.5,     image: null },
    { name: 'Fresh Socks',        price: 543.75,    image: null },
    { name: 'Spiced Wine',        price: 545,       image: null },
    { name: 'Star Notepad',       price: 545,       image: null },
    { name: 'Ice Cream',          price: 545,       image: null },
    { name: 'Whip Cupcake',       price: 547.5,     image: null },
    { name: 'Hex Pot',            price: 548.75,    image: null },
    { name: 'Jack-in-the-Box',    price: 548.75,    image: null },
    { name: 'Money Pot',          price: 555,       image: null },
    { name: 'Mood Pack',          price: 555,       image: null },
    { name: 'Snow Mittens',       price: 560,       image: null },
    { name: 'Timeless Book',      price: 560,       image: null },
    { name: 'Victory Medal',      price: 561.25,    image: null },
    { name: 'Mousse Cake',        price: 563.75,    image: null },
    { name: 'Snow Globe',         price: 572.5,     image: null },
    { name: 'Desk Calendar',      price: 573.75,    image: null },
    { name: 'Pretty Posy',        price: 587.5,     image: null },
    { name: 'Homemade Cake',      price: 587.5,     image: null },
    { name: 'Cookie Heart',       price: 586.25,    image: null },
    { name: 'Liberty Figure',     price: 590,       image: null },
    { name: 'Clover Pin',         price: 600,       image: null },
    { name: 'Witch Hat',          price: 607.5,     image: null },
    { name: 'Bow Tie',            price: 612.5,     image: null },
    { name: 'Snoop Dogg',         price: 657.5,     image: null },
    { name: 'Spring Basket',      price: 665,       image: null },
    { name: 'Faith Amulet',       price: 667.5,     image: null },
    { name: 'Restless Jar',       price: 666.25,    image: null },
    { name: 'Spy Agaric',         price: 690,       image: null },
    { name: 'Swag Bag',           price: 687.5,     image: null },
    { name: 'Lush Bouquet',       price: 726.25,    image: null },
    { name: 'Eternal Candle',     price: 737.5,     image: null },
    { name: 'Light Sword',        price: 762.5,     image: null },
    { name: 'Moon Pendant',       price: 775,       image: null },
    { name: 'Input Key',          price: 778.75,    image: null },
    { name: 'Mask',               price: 822.5,     image: null },
    { name: 'Sleigh Bell',        price: 863.75,    image: null },
    { name: 'Jolly Chimp',        price: 878.75,    image: null },
    { name: 'Surge Board',        price: 855,       image: null },
    { name: 'Evil Eye',           price: 931.25,    image: null },
    { name: 'Joyful Bundle',      price: 947.5,     image: null },
    { name: 'Bunny Muffin',       price: 972.5,     image: null },
    { name: 'Jelly Bunny',        price: 981.25,    image: null },
    { name: 'Jingle Bells',       price: 1007.5,    image: null },
    { name: 'Berry Box',          price: 1072.5,    image: null },
    { name: 'Fine Pen',           price: 1096.25,   image: null },
    { name: 'Hanging Star',       price: 1133.75,   image: null },
    { name: 'Love Candle',        price: 1186.25,   image: null },
    { name: 'Sakura Flower',      price: 1233.75,   image: null },
    { name: 'Top Hat',            price: 1272.5,    image: null },
    { name: 'Skull Flower',       price: 1396.25,   image: null },
    { name: 'Valentine Box',      price: 1441.25,   image: null },
    { name: 'Flying Broom',       price: 1495,      image: null },
    { name: 'Crystal Ball',       price: 1506.25,   image: null },
    { name: 'Mad Pumpkin',        price: 1557.5,    image: null },
    { name: 'Record Player',      price: 1577.5,    image: null },
    { name: 'Love Potion',        price: 1806.25,   image: null },
    { name: 'Ionic Dryer',        price: 1831.25,   image: null },
    { name: 'Snoop Cigar',        price: 1838.75,   image: null },
    { name: 'Trapped Heart',      price: 1900,      image: null },
    { name: 'UFC Strike',         price: 1941.25,   image: null },
    { name: 'Sky Stilettos',      price: 2422.5,    image: null },
    { name: 'Cupid Charm',        price: 2698.75,   image: null },
    { name: 'Coffin',             price: 2887.5,    image: null },
    { name: 'Bling Binky',        price: 2931.25,   image: null },
    { name: "Khabib's Papakha",   price: 3026.25,   image: null },
    { name: 'Rare Bird',          price: 3028.75,   image: null },
    { name: 'Electric Skull',     price: 3117.5,    image: null },
    { name: 'Eternal Rose',       price: 3147.5,    image: null },
    { name: 'Diamond Ring',       price: 3825,      image: null },
    { name: 'Signet Ring',        price: 4077.5,    image: null },
    { name: 'Genie Lamp',         price: 4153.75,   image: null },
    { name: 'Voodoo Doll',        price: 4392.5,    image: null },
    { name: 'Toy Bear',           price: 4495,      image: null },
    { name: 'Vintage Cigar',      price: 4576.25,   image: null },
    { name: 'Kissed Frog',        price: 4652.5,    image: null },
    { name: 'Neko Helmet',        price: 4690,      image: null },
    { name: 'Bonded Ring',        price: 5048.75,   image: null },
    { name: 'Sharp Tongue',       price: 5481.25,   image: null },
    { name: 'Trojan Horse',       price: 5616.25,   image: null },
    { name: 'Gravestone',         price: 5906.25,   image: null },
    { name: 'Swiss Watch',        price: 6146.25,   image: null },
    { name: 'Magic Potion',       price: 6761.25,   image: null },
    { name: 'Low Rider',          price: 6776.25,   image: null },
    { name: 'Artisan Brick',      price: 7522.5,    image: null },
    { name: 'Gem Signet',         price: 7648.75,   image: null },
    { name: 'Ion Gem',            price: 8925,      image: null },
    { name: 'Mini Oscar',         price: 9180,      image: null },
    { name: 'Perfume Bottle',     price: 9295,      image: null },
    { name: "Durov's Coat",       price: 10375,     image: null },
    { name: "Durov's Glasses",    price: 11475,     image: null },
    { name: 'Westside Sign',      price: 12353.75,  image: null },
    { name: 'UFC box',            price: 13911.25,  image: null },
    { name: 'Nail Bracelet',      price: 14333.75,  image: null },
    { name: 'Mighty Arm',         price: 14375,     image: null },
    { name: 'Astral Shard',       price: 14648.75,  image: null },
    { name: 'Loot Bag',           price: 15158.75,  image: null },
    { name: 'Heroic Helmet',      price: 22493.75,  image: null },
    { name: "Khabib's Papakha",   price: 24250,     image: null },
    { name: 'Scared Cat',         price: 28681.25,  image: null },
    { name: 'Precious Peach',     price: 31873.75,  image: null },
    { name: "Durov's Cap",        price: 49725,     image: null },
    { name: 'Heart Locket',       price: 139612.5,  image: null },
    { name: "Durov's Figurine",   price: 152906.25, image: null },
    { name: 'Algorithm Cup',      price: 312375,    image: null },
    { name: 'Intelligence Cup',   price: 298350,    image: null },
    { name: 'Airplane',           price: 787500,    image: null },
    { name: 'Plush Pepe',         price: 828750,    image: null }
].sort((a, b) => a.price - b.price);

/* ═══════════ КАРТИНКИ / LOTTIE ═══════════ */
function normalizeApostrophes(str) {
    return str.replace(/[\u2018\u2019\u02BC\u0060\u00B4]/g, "'");
}

function encodePathPart(str) {
    return encodeURIComponent(normalizeApostrophes(str.trim()));
}

function getGiftImage(gift) {
    if (gift.image) return gift.image;
    return `https://cdn.changes.tg/gifts/models/${encodePathPart(gift.name)}/png/Original.png`;
}

function getGiftLottie(name) {
    if (ROOT_ITEMS.has(name)) return null;
    return `https://cdn.changes.tg/gifts/models/${encodePathPart(name)}/lottie/Original.json`;
}

/* ═══════════ STATE ═══════════ */
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

/* ═══════════ ВЫБОР ПРЕДМЕТА ПО ВЫИГРЫШУ ═══════════ */
function pickGiftForWin(amount) {
    if (!amount || amount <= 0) return null;
    let best = null;
    for (const g of GIFTS) {
        if (g.price <= amount) best = g;
        else break;
    }
    return best;
}

/* ═══════════ СОХРАНЕНИЕ В ИНВЕНТАРЬ ═══════════ */
function saveGiftToInventory(gift) {
    const STORAGE_KEY = 'userInventory';
    let inventory = [];
    try {
        inventory = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (!Array.isArray(inventory)) inventory = [];
    } catch (e) { inventory = []; }

    inventory.push({
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: gift.name,
        price: gift.price / TON_TO_STARS,
        stars: gift.price,
        image: getGiftImage(gift),
        timestamp: Date.now()
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
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

    const gift = pickGiftForWin(win);

    if (gift) {
        saveGiftToInventory(gift);
        const remainder = win - gift.price;
        state.stars += remainder;
        saveStars();
        updateBalanceUI();
        renderGrid();
        vibrate('success');

        openWinModal(gift, remainder);
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

/* ═══════════ LOTTIE ═══════════ */
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

/* ═══════════ МОДАЛКА ПОБЕДЫ ═══════════ */
function openWinModal(gift, remainder) {
    currentWinGift = gift;

    const img = $('winModalImg');
    const media = $('winModalMedia');

    destroyWinLottie();
    img.src = getGiftImage(gift);
    img.onerror = function() { this.onerror = null; this.src = GIFT_FALLBACK; };
    img.classList.remove('hidden');

    $('winModalName').textContent = gift.name;

    const valueEl = $('winModalValue');
    if (remainder && remainder > 0) {
        valueEl.querySelector('span').textContent =
            `${gift.price.toLocaleString('ru-RU')} + ${remainder.toLocaleString('ru-RU')}`;
    } else {
        valueEl.querySelector('span').textContent = gift.price.toLocaleString('ru-RU');
    }

    const lottieUrl = getGiftLottie(gift.name);
    if (lottieUrl) {
        fetch(lottieUrl, { method: 'HEAD' })
            .then(r => {
                if (!r.ok) return;
                img.classList.add('hidden');
                const box = document.createElement('div');
                box.className = 'win-modal-lottie';
                media.appendChild(box);
                winLottieInstance = lottie.loadAnimation({
                    container: box,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: lottieUrl
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

/* ═══════════ ПРОДАТЬ ═══════════ */
function sellWinGift() {
    if (!currentWinGift) return;

    const STORAGE_KEY = 'userInventory';
    let inventory = [];
    try {
        inventory = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (!Array.isArray(inventory)) inventory = [];
    } catch (e) { inventory = []; }

    let idx = -1;
    for (let i = inventory.length - 1; i >= 0; i--) {
        if (inventory[i].name === currentWinGift.name) { idx = i; break; }
    }

    if (idx === -1) {
        showToast('Предмет не найден', 'err');
        return;
    }

    const item = inventory[idx];
    const stars = item.stars || currentWinGift.price;

    inventory.splice(idx, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));

    state.stars += stars;
    saveStars();
    updateBalanceUI();

    showToast(`Продано за ${stars.toLocaleString('ru-RU')} ⭐`, 'ok');
    vibrate('success');
    closeWinModal();
}

/* ═══════════ АПГРЕЙД ═══════════ */
function upgradeWinGift() {
    if (!currentWinGift) return;

    const STORAGE_KEY = 'userInventory';
    let inventory = [];
    try {
        inventory = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (!Array.isArray(inventory)) inventory = [];
    } catch (e) { inventory = []; }

    let idx = -1;
    for (let i = inventory.length - 1; i >= 0; i--) {
        if (inventory[i].name === currentWinGift.name) { idx = i; break; }
    }

    if (idx === -1) {
        showToast('Предмет не найден', 'err');
        return;
    }

    localStorage.setItem('upgradeItemId', inventory[idx].id);
    window.location.href = 'upgrades.html';
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
window.closeWinModal = closeWinModal;
window.sellWinGift = sellWinGift;
window.upgradeWinGift = upgradeWinGift;