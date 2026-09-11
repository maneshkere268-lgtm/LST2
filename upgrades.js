const $ = id => document.getElementById(id);
const STAR_ICON = 'star.png';
const GIFT_FALLBACK = 'star.png';
const TON_TO_STARS = 125;
const MIN_CHANCE = 5;         // минимум 5% (всё что выше 95% шанса — не показываем как цель)
const MAX_TARGET_PRICE_MULT = 20; // цель до x20 от цены

let state = {
    stars: 0,
    inventory: [],
    allItems: [],
    selectedGift: null,
    targetGift: null,
    possibleTargets: [],
    isSpinning: false,
    currentChance: 0,
    activeSection: null
};

/* Полный список предметов из кейсов (для целей апгрейда) */
const ALL_GIFTS_POOL = [
    { name: 'Bear', price: 0.05 },
    { name: 'Cake', price: 0.1 },
    { name: 'Gift', price: 0.25 },
    { name: 'Cookie Heart', price: 0.96 },
    { name: 'Jester Hat', price: 1.6 },
    { name: 'Lol Pop', price: 2.24 },
    { name: 'Happy Brownie', price: 2.8 },
    { name: 'Xmas Stocking', price: 3.5 },
    { name: 'Santa Hat', price: 4.11 },
    { name: 'Tama Gadget', price: 4.01 },
    { name: 'Jack-in-the-Box', price: 4.39 },
    { name: 'Happy Brownie', price: 4.34 },
    { name: 'Ginger Cookie', price: 4.23 },
    { name: 'Snow Mittens', price: 4.54 },
    { name: 'Snow Globe', price: 4.65 },
    { name: 'Cookie Heart', price: 4.71 },
    { name: 'Light Sword', price: 6.09 },
    { name: 'Input Key', price: 6.16 },
    { name: 'Sleigh Bell', price: 6.84 },
    { name: 'Jolly Chimp', price: 6.92 },
    { name: 'Surge Board', price: 6.82 },
    { name: 'Evil Eye', price: 7.45 },
    { name: 'Jingle Bells', price: 8.05 },
    { name: 'Fine Pen', price: 8.77 },
    { name: 'Love Candle', price: 9.49 },
    { name: 'Skull Flower', price: 11 },
    { name: 'Valentine Box', price: 11.22 },
    { name: 'Flying Broom', price: 12 },
    { name: 'Crystal Ball', price: 12.24 },
    { name: 'Mad Pumpkin', price: 12.51 },
    { name: 'Record Player', price: 12.64 },
    { name: 'Love Potion', price: 14.44 },
    { name: 'Trapped Heart', price: 15.34 },
    { name: 'Rare Bird', price: 24.21 },
    { name: 'Electric Skull', price: 24.96 },
    { name: 'Eternal Rose', price: 25.18 },
    { name: 'Diamond Ring', price: 30.43 },
    { name: 'Signet Ring', price: 32.11 },
    { name: 'Genie Lamp', price: 33.14 },
    { name: 'Voodoo Doll', price: 34.68 },
    { name: 'Toy Bear', price: 35.96 },
    { name: 'Kissed Frog', price: 36.7 },
    { name: 'Bonded Ring', price: 39.97 },
    { name: 'Magic Potion', price: 54.09 },
    { name: 'Gem Signet', price: 61.19 },
    { name: 'Ion Gem', price: 71.4 },
    { name: 'Perfume Bottle', price: 71.2 },
    { name: 'Mini Oscar', price: 72.7 },
    { name: 'Nail Bracelet', price: 113.87 },
    { name: 'Astral Shard', price: 115.25 },
    { name: 'Loot Bag', price: 120.68 },
    { name: 'Mighty Arm', price: 112.2 },
    { name: 'Scared Cat', price: 229.49 }
];

document.addEventListener('DOMContentLoaded', init);

function init() {
    const savedStars = localStorage.getItem('userStars');
    state.stars = savedStars !== null ? parseInt(savedStars) : 12500;

    const name = localStorage.getItem('userName') || 'Username';
    $('userName').textContent = name;

    loadInventory();
    updateBalanceUI();
    renderInventoryGrid();

    // Авто-выбор предмета из профиля
    const preselected = localStorage.getItem('upgradeItemId');
    if (preselected) {
        const item = state.inventory.find(i => i.id === preselected);
        if (item) selectGift(item);
        localStorage.removeItem('upgradeItemId');
    }
}

function loadInventory() {
    try {
        state.inventory = JSON.parse(localStorage.getItem('userInventory') || '[]');
        if (!Array.isArray(state.inventory)) state.inventory = [];
    } catch(e) { state.inventory = []; }
}

function saveInventory() {
    localStorage.setItem('userInventory', JSON.stringify(state.inventory));
}

function saveStars() { localStorage.setItem('userStars', state.stars.toString()); }

function updateBalanceUI() {
    $('balanceDisplay').textContent = state.stars.toLocaleString('ru-RU');
}

/* ═══════════ IMAGE ═══════════ */
function encodePathPart(str) {
    const trimmed = str.trim();
    if (trimmed.includes(' ')) return trimmed.split(/\s+/).map(encodeURIComponent).join('%20');
    return encodeURIComponent(trimmed);
}

function getGiftImage(name, price) {
    if (price < 3) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return '../' + slug + '.png';
    }
    const modelMatch = name.match(/^(.+?)\s*\((.+)\)\s*$/);
    if (modelMatch) {
        const baseName = modelMatch[1].trim();
        const modelName = modelMatch[2].trim();
        return `https://cdn.changes.tg/gifts/models/${encodePathPart(baseName)}/png/${encodePathPart(modelName)}.png`;
    }
    return `https://cdn.changes.tg/gifts/models/${encodePathPart(name)}/png/Original.png`;
}

function getGiftLottie(name, price) {
    if (price < 3) return null;
    const modelMatch = name.match(/^(.+?)\s*\((.+)\)\s*$/);
    if (modelMatch) {
        const baseName = modelMatch[1].trim();
        const modelName = modelMatch[2].trim();
        return `https://cdn.changes.tg/gifts/models/${encodePathPart(baseName)}/lottie/${encodePathPart(modelName)}.json`;
    }
    return `https://cdn.changes.tg/gifts/models/${encodePathPart(name)}/lottie/Original.json`;
}

/* ═══════════ INVENTORY GRID ═══════════ */
function renderInventoryGrid() {
    const grid = $('inventoryGrid');
    if (!state.inventory.length) {
        grid.innerHTML = '<div class="empty-msg" style="grid-column:1/-1">Ничего нет<br><small style="opacity:.6">Открой кейс, чтобы получить</small></div>';
        return;
    }
    grid.innerHTML = state.inventory.map(it => {
        const isSelected = state.selectedGift && state.selectedGift.id === it.id;
        const stars = it.stars || Math.round((it.price || 0) * TON_TO_STARS);
        return `
            <div class="inline-item ${isSelected ? 'selected' : ''}" onclick="selectGiftById('${it.id}')">
                <img src="${it.image}" alt="" onerror="this.onerror=null;this.src='${GIFT_FALLBACK}'">
                <div class="inline-item-name">${escapeHtml(it.name)}</div>
                <div class="inline-item-value"><img src="${STAR_ICON}" alt="">${stars.toLocaleString('ru-RU')}</div>
            </div>
        `;
    }).join('');
}

/* ═══════════ SECTIONS ═══════════ */
function toggleInventory() {
    if (state.isSpinning) return;
    const invSec = $('inventorySection');
    const tarSec = $('targetsSection');
    const btnInv = $('btnInventory');
    const btnTar = $('btnTargets');

    if (state.activeSection === 'inventory') {
        invSec.classList.remove('show');
        btnInv.classList.remove('active');
        state.activeSection = null;
    } else {
        invSec.classList.add('show');
        tarSec.classList.remove('show');
        btnInv.classList.add('active');
        btnTar.classList.remove('active');
        state.activeSection = 'inventory';
        renderInventoryGrid();
    }
}

function toggleTargets() {
    if (state.isSpinning) return;
    if (!state.selectedGift) {
        showToast('Сначала выбери подарок для апгрейда', 'err');
        return;
    }
    const invSec = $('inventorySection');
    const tarSec = $('targetsSection');
    const btnInv = $('btnInventory');
    const btnTar = $('btnTargets');

    if (state.activeSection === 'targets') {
        tarSec.classList.remove('show');
        btnTar.classList.remove('active');
        state.activeSection = null;
    } else {
        tarSec.classList.add('show');
        invSec.classList.remove('show');
        btnTar.classList.add('active');
        btnInv.classList.remove('active');
        state.activeSection = 'targets';
        loadPossibleTargets();
    }
}

/* ═══════════ SELECT GIFT ═══════════ */
function selectGiftById(itemId) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;
    selectGift(item);
}

function selectGift(g) {
    const stars = g.stars || Math.round((g.price || 0) * TON_TO_STARS);
    state.selectedGift = {
        id: g.id,
        name: g.name,
        image: g.image,
        stars: stars
    };
    $('leftCard').classList.add('has-gift');
    $('leftCard').classList.remove('fail');
    $('leftGiftImg').src = g.image;
    $('leftGiftImg').onerror = function() { this.onerror = null; this.src = GIFT_FALLBACK; };
    $('leftGiftName').textContent = g.name;
    $('leftGiftValue').textContent = stars.toLocaleString('ru-RU');

    if (state.targetGift) resetTarget();
    renderInventoryGrid();
    updateWheel();

    $('inventorySection').classList.remove('show');
    $('btnInventory').classList.remove('active');
    state.activeSection = null;
    vibrate();
}

function resetTarget() {
    state.targetGift = null;
    state.currentChance = 0;
    $('rightCard').classList.remove('has-gift', 'fail');
    $('wheelCenterImg').style.display = 'none';
    $('chancePct').style.display = 'block';
    drawGreenArc(0);
}

/* ═══════════ POSSIBLE TARGETS ═══════════ */
function loadPossibleTargets() {
    const list = $('targetsList');
    list.innerHTML = '<div class="empty-msg">Загрузка...</div>';

    const myStars = state.selectedGift.stars;
    state.possibleTargets = [];

    // Уникализируем по имени
    const seen = new Set();
    ALL_GIFTS_POOL.forEach(g => {
        if (seen.has(g.name)) return;
        seen.add(g.name);

        const gStars = Math.round(g.price * TON_TO_STARS);
        if (gStars <= myStars) return;
        if (gStars > myStars * MAX_TARGET_PRICE_MULT) return;

        // Шанс = моя цена / цена цели * 100
        const chance = (myStars / gStars) * 100;
        // Отсеиваем: шанс должен быть >= MIN_CHANCE
        if (chance < MIN_CHANCE) return;

        state.possibleTargets.push({
            name: g.name,
            price: g.price,
            stars: gStars,
            image: getGiftImage(g.name, g.price),
            chance: Math.round(chance * 10) / 10
        });
    });

    state.possibleTargets.sort((a, b) => a.stars - b.stars);
    renderTargetsList();
}

function renderTargetsList() {
    const list = $('targetsList');
    if (!state.possibleTargets.length) {
        list.innerHTML = '<div class="empty-msg">Нет подходящих целей<br><small style="opacity:.6">Шанс должен быть не менее ' + MIN_CHANCE + '%</small></div>';
        return;
    }
    list.innerHTML = state.possibleTargets.map(g => {
        const isSelected = state.targetGift && state.targetGift.name === g.name;
        return `
            <div class="target-row ${isSelected ? 'selected' : ''}" onclick="selectTargetByName('${escapeJs(g.name)}')">
                <img src="${g.image}" alt="" onerror="this.onerror=null;this.src='${GIFT_FALLBACK}'">
                <div class="target-row-info">
                    <div class="target-row-name">${escapeHtml(g.name)}</div>
                    <div class="target-row-price"><img src="${STAR_ICON}" alt="">${g.stars.toLocaleString('ru-RU')}</div>
                </div>
                <div class="target-row-chance">${g.chance}%</div>
            </div>
        `;
    }).join('');
}

function selectTargetByName(name) {
    const g = state.possibleTargets.find(x => x.name === name);
    if (!g) return;
    state.targetGift = g;
    state.currentChance = g.chance;

    $('rightCard').classList.add('has-gift');
    $('rightCard').classList.remove('fail');
    $('rightGiftImg').src = g.image;
    $('rightGiftImg').onerror = function() { this.onerror = null; this.src = GIFT_FALLBACK; };
    $('rightGiftName').textContent = g.name;
    $('rightGiftValue').textContent = g.stars.toLocaleString('ru-RU');
    $('wheelCenterImg').src = g.image;
    $('wheelCenterImg').style.display = 'block';
    $('chancePct').style.display = 'none';
    drawGreenArc(state.currentChance);
    renderTargetsList();
    updateWheel();

    $('targetsSection').classList.remove('show');
    $('btnTargets').classList.remove('active');
    state.activeSection = null;
    vibrate();
}

/* ═══════════ WHEEL ═══════════ */
function drawGreenArc(chance) {
    const path = $('greenPath');
    if (!chance || chance <= 0) { path.setAttribute('d', ''); return; }
    const cx = 110, cy = 110, r = 100;
    const startAngle = 0;
    const endAngle = startAngle + (chance / 100) * 360;
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    const d = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
    path.setAttribute('d', d);
}

function polarToCartesian(cx, cy, r, angle) {
    const rad = (angle - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function updateWheel() {
    const btn = $('upgradeBtn');
    const chancePct = $('chancePct');

    if (!state.targetGift || !state.selectedGift) {
        chancePct.textContent = '0%';
        btn.disabled = true;
        drawGreenArc(0);
        return;
    }

    const chance = (state.selectedGift.stars / state.targetGift.stars) * 100;
    state.currentChance = Math.round(chance * 10) / 10;
    drawGreenArc(state.currentChance);

    if (state.currentChance >= MIN_CHANCE) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
    btn.classList.remove('win', 'fail');
    $('upgradeBtnText').textContent = 'Апгрейд';
}

/* ═══════════ DO UPGRADE ═══════════ */
function doUpgrade() {
    if (state.isSpinning || !state.targetGift || !state.selectedGift) return;
    state.isSpinning = true;

    $('inventorySection').classList.remove('show');
    $('targetsSection').classList.remove('show');
    $('btnInventory').classList.remove('active');
    $('btnTargets').classList.remove('active');
    state.activeSection = null;

    const btn = $('upgradeBtn');
    btn.disabled = true;
    $('upgradeBtnText').textContent = 'Крутим...';
    $('resultSad').classList.remove('show');
    $('resultHappy').classList.remove('show');
    $('wheelGlow').classList.add('spinning');
    $('leftCard').classList.remove('fail');
    $('rightCard').classList.remove('fail');

    $('wheelCenterImg').style.display = 'none';
    $('chancePct').style.display = 'block';
    $('chancePct').textContent = state.currentChance.toFixed(1) + '%';

    const pointerWrap = $('pointerWrap');
    pointerWrap.style.transition = 'none';
    pointerWrap.style.transform = 'rotate(0deg)';

    const success = Math.random() * 100 < state.currentChance;

    const greenAngle = (state.currentChance / 100) * 360;
    let landAngle;
    if (success) {
        landAngle = Math.random() * greenAngle * 0.6 + greenAngle * 0.2;
    } else {
        const redSize = 360 - greenAngle;
        landAngle = greenAngle + Math.random() * redSize * 0.3 + redSize * 0.05;
    }

    const totalSpin = 360 * (8 + Math.floor(Math.random() * 5)) + landAngle;
    const spinDuration = 5000 + Math.random() * 2000;

    void pointerWrap.offsetWidth;

    // Плавное начало + плавное окончание
    pointerWrap.style.transition = `transform ${spinDuration}ms cubic-bezier(0.3, 0, 0.15, 1.05)`;
    pointerWrap.style.transform = `rotate(${totalSpin}deg)`;

    setTimeout(() => {
        $('wheelGlow').classList.remove('spinning');
        showResult(success);
    }, spinDuration);
}

function showResult(success) {
    const center = $('wheelCenter');
    const btn = $('upgradeBtn');
    $('chancePct').style.display = 'none';

    if (success) {
        center.classList.add('flash-green');
        $('resultHappy').classList.add('show');
        btn.classList.add('win');
        $('upgradeBtnText').textContent = 'Победа!';
        launchConfetti(40);
        playWinLottie(state.targetGift);

        // Убираем старый предмет, добавляем новый
        state.inventory = state.inventory.filter(i => i.id !== state.selectedGift.id);
        state.inventory.push({
            id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: state.targetGift.name,
            price: state.targetGift.price,
            stars: state.targetGift.stars,
            image: state.targetGift.image,
            timestamp: Date.now()
        });
        saveInventory();
        showToast(`Успех! Получено: ${state.targetGift.name}`, 'ok');
        vibrate('success');
    } else {
        center.classList.add('flash-red');
        $('resultSad').classList.add('show');
        btn.classList.add('fail');
        $('upgradeBtnText').textContent = 'Неудача';
        $('leftCard').classList.add('fail');
        $('rightCard').classList.add('fail');

        state.inventory = state.inventory.filter(i => i.id !== state.selectedGift.id);
        saveInventory();
        showToast(`Не повезло. ${state.selectedGift.name} потерян`, 'err');
        vibrate('error');
    }

    setTimeout(() => {
        center.classList.remove('flash-red', 'flash-green');
        resetAfterSpin();
    }, 3500);
}

function resetAfterSpin() {
    state.isSpinning = false;
    state.selectedGift = null;
    state.targetGift = null;
    state.currentChance = 0;

    $('leftCard').classList.remove('has-gift', 'fail');
    $('rightCard').classList.remove('has-gift', 'fail');
    $('wheelCenterImg').style.display = 'none';
    $('chancePct').style.display = 'block';
    $('chancePct').textContent = '0%';
    $('resultSad').classList.remove('show');
    $('resultHappy').classList.remove('show');

    const pointerWrap = $('pointerWrap');
    pointerWrap.style.transition = 'none';
    pointerWrap.style.transform = 'rotate(0deg)';

    drawGreenArc(0);
    updateWheel();
    renderInventoryGrid();
}

/* ═══════════ LOTTIE WIN ═══════════ */
function playWinLottie(gift) {
    if (!gift || !gift.name) return;
    const url = getGiftLottie(gift.name, gift.price || 0);
    if (!url) return;

    const overlay = document.createElement('div');
    overlay.className = 'lottie-win-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);pointer-events:none;opacity:1;transition:opacity .4s';
    overlay.innerHTML = '<div style="width:220px;height:220px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 40px rgba(30,228,76,.5))"></div>';
    document.body.appendChild(overlay);

    fetch(url, { method: 'HEAD' })
        .then(r => {
            if (!r.ok) { overlay.remove(); return; }
            const box = overlay.firstChild;
            lottie.loadAnimation({
                container: box, renderer: 'svg', loop: true, autoplay: true, path: url
            });
        })
        .catch(() => overlay.remove());

    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 400);
    }, 3000);
}

/* ═══════════ CONFETTI ═══════════ */
function launchConfetti(count = 40) {
    const canvas = $('confettiCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#1EE44C','#FDA100','#0098EA','#fff','#a78bfa'];

    for (let i = 0; i < count; i++) {
        particles.push({
            x: canvas.width / 2 + (Math.random() - .5) * 100,
            y: canvas.height / 2,
            vx: (Math.random() - .5) * 10,
            vy: -Math.random() * 12 - 3,
            w: Math.random() * 8 + 3,
            h: Math.random() * 6 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * 360,
            rv: (Math.random() - .5) * 10,
            life: 1
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        particles.forEach(p => {
            if (p.life <= 0) return;
            alive = true;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.35;
            p.rot += p.rv;
            p.life -= 0.012;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });
        if (alive) requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
}

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

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}

function escapeJs(str) {
    return (str || '').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

window.toggleInventory = toggleInventory;
window.toggleTargets = toggleTargets;
window.selectGiftById = selectGiftById;
window.selectTargetByName = selectTargetByName;
window.doUpgrade = doUpgrade;