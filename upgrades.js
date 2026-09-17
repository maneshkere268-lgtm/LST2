// upgrades.js — Апгрейд (списание сразу, выдача при выигрыше, полная блокировка UI)
const $ = id => document.getElementById(id);
const MIN_CHANCE = 5;
const MAX_CHANCE = 85;
const MAX_TARGET_PRICE_MULT = 20;
const HOUSE_EDGE = 0.95;

let state = {
    stars: 0,
    inventory: [],
    selectedGift: null,
    targetGift: null,
    possibleTargets: [],
    isSpinning: false,
    currentChance: 0,
    activeSection: null
};

document.addEventListener('DOMContentLoaded', init);

function init() {
    window.TG.updateHeaderUI();
    state.stars = parseInt(localStorage.getItem('userStars')) || 12500;
    $('userName').textContent = window.TG.getShortName();

    loadInventory();
    updateBalanceUI();
    renderInventoryGrid();

    const preselected = localStorage.getItem('upgradeItemId');
    if (preselected) {
        const item = state.inventory.find(i => i.id === preselected);
        if (item) selectGift(item);
        localStorage.removeItem('upgradeItemId');
    }

    // Подчищаем маркер pending (результат уже сохранён в инвентарь)
    localStorage.removeItem('upgradePending');

    window.addEventListener('firebaseDataLoaded', (e) => {
        if (typeof e.detail.stars === 'number') {
            state.stars = e.detail.stars;
            updateBalanceUI();
        }
        if (Array.isArray(e.detail.inventory)) {
            state.inventory = e.detail.inventory;
            renderInventoryGrid();
        }
    });
}

function loadInventory() {
    try {
        state.inventory = JSON.parse(localStorage.getItem('userInventory') || '[]');
        if (!Array.isArray(state.inventory)) state.inventory = [];
    } catch(e) { state.inventory = []; }
}

function saveInventory() {
    localStorage.setItem('userInventory', JSON.stringify(state.inventory));
    window.FB?.save();
}

function saveStars() {
    localStorage.setItem('userStars', state.stars.toString());
    window.FB?.save();
}

function updateBalanceUI() {
    $('balanceDisplay').textContent = state.stars.toLocaleString('ru-RU');
}

/* ═══════════ IMAGE ═══════════ */
function getGiftImage(name, price) {
    if (window.ROOT_ITEMS.has(name) || price < 3) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return slug + '.png';
    }
    const modelMatch = name.match(/^(.+?)\s*\((.+)\)\s*$/);
    if (modelMatch) {
        const baseName = modelMatch[1].trim();
        const modelName = modelMatch[2].trim();
        return `https://cdn.changes.tg/gifts/models/${window.encodePathPart(baseName)}/png/${window.encodePathPart(modelName)}.png`;
    }
    return `https://cdn.changes.tg/gifts/models/${window.encodePathPart(name)}/png/Original.png`;
}

/* ═══════════════════════════════════════════════════════════
 * БЛОКИРОВКА UI ВО ВРЕМЯ СПИНА
 * ═══════════════════════════════════════════════════════════ */
function lockUpgradeUI(lock) {
    // Все кнопки и карточки в main
    document.querySelectorAll('.upgrade-btn, .select-btn, .target-row, .inline-item, .card')
        .forEach(el => {
            if (lock) {
                el.setAttribute('disabled', 'disabled');
                el.style.pointerEvents = 'none';
                el.style.opacity = '0.5';
            } else {
                el.removeAttribute('disabled');
                el.style.pointerEvents = '';
                el.style.opacity = '';
            }
        });

    // Нижняя навигация
    document.querySelectorAll('.bnav button').forEach(el => {
        if (lock) {
            el.setAttribute('disabled', 'disabled');
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.4';
        } else {
            el.removeAttribute('disabled');
            el.style.pointerEvents = '';
            el.style.opacity = '';
        }
    });

    // Хедер
    document.querySelectorAll('header button, header .user-profile')
        .forEach(el => {
            if (lock) {
                el.style.pointerEvents = 'none';
                el.style.opacity = '0.6';
            } else {
                el.style.pointerEvents = '';
                el.style.opacity = '';
            }
        });

    // Кнопка "Апгрейд" — оставляем disabled вручную
    const btn = document.getElementById('upgradeBtn');
    if (btn && lock) btn.disabled = true;
}

function preventLeaveDuringSpin(e) {
    e.preventDefault();
    e.returnValue = '';
    return '';
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
        const stars = it.stars || Math.round((it.price || 0) * 125);
        return `
            <div class="inline-item ${isSelected ? 'selected' : ''}" onclick="selectGiftById('${it.id}')">
                <img src="${it.image}" alt="" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'">
                <div class="inline-item-name">${window.escapeHtml(it.name)}</div>
                <div class="inline-item-value"><img src="${window.STAR_ICON}" alt="">${stars.toLocaleString('ru-RU')}</div>
            </div>
        `;
    }).join('');
}

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

function selectGiftById(itemId) {
    if (state.isSpinning) return;
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;
    selectGift(item);
}

function selectGift(g) {
    const stars = g.stars || Math.round((g.price || 0) * 125);
    state.selectedGift = {
        id: g.id,
        name: g.name,
        image: g.image,
        price: g.price || stars,
        stars: stars
    };
    $('leftCard').classList.add('has-gift');
    $('leftCard').classList.remove('fail');
    $('leftGiftImg').src = g.image;
    $('leftGiftImg').onerror = function() { this.onerror = null; this.src = window.GIFT_FALLBACK; };
    $('leftGiftName').textContent = g.name;
    $('leftGiftValue').textContent = stars.toLocaleString('ru-RU');

    if (state.targetGift) resetTarget();
    renderInventoryGrid();
    updateWheel();

    $('inventorySection').classList.remove('show');
    $('btnInventory').classList.remove('active');
    state.activeSection = null;
    window.vibrate();
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

    const seen = new Set();
    window.ALL_GIFTS.forEach(g => {
        if (seen.has(g.name)) return;
        seen.add(g.name);

        // Цены в ALL_GIFTS — часть в TON, часть в звёздах. Нормализуем:
        const priceStars = g.price < 200 ? Math.round(g.price * 125) : Math.round(g.price);

        if (priceStars <= myStars) return;
        if (priceStars > myStars * MAX_TARGET_PRICE_MULT) return;

        const chance = (myStars / priceStars) * 100;
        if (chance < MIN_CHANCE) return;
        if (chance > MAX_CHANCE) return;

        state.possibleTargets.push({
            name: g.name,
            price: g.price,
            stars: priceStars,
            image: g.image,
            chance: Math.round(chance * 10) / 10
        });
    });

    state.possibleTargets.sort((a, b) => a.stars - b.stars);
    renderTargetsList();
}

function renderTargetsList() {
    const list = $('targetsList');
    if (!state.possibleTargets.length) {
        list.innerHTML = '<div class="empty-msg">Нет подходящих целей<br><small style="opacity:.6">Шанс от ' + MIN_CHANCE + '% до ' + MAX_CHANCE + '%</small></div>';
        return;
    }
    list.innerHTML = state.possibleTargets.map(g => {
        const isSelected = state.targetGift && state.targetGift.name === g.name;
        const safeName = g.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        return `
            <div class="target-row ${isSelected ? 'selected' : ''}" onclick="selectTargetByName('${safeName}')">
                <img src="${g.image}" alt="" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'">
                <div class="target-row-info">
                    <div class="target-row-name">${window.escapeHtml(g.name)}</div>
                    <div class="target-row-price"><img src="${window.STAR_ICON}" alt="">${g.stars.toLocaleString('ru-RU')}</div>
                </div>
                <div class="target-row-chance">${g.chance}%</div>
            </div>
        `;
    }).join('');
}

function selectTargetByName(name) {
    if (state.isSpinning) return;
    const g = state.possibleTargets.find(x => x.name === name);
    if (!g) return;
    state.targetGift = g;
    state.currentChance = g.chance;

    $('rightCard').classList.add('has-gift');
    $('rightCard').classList.remove('fail');
    $('rightGiftImg').src = g.image;
    $('rightGiftImg').onerror = function() { this.onerror = null; this.src = window.GIFT_FALLBACK; };
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
    window.vibrate();
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
    path.setAttribute('d', `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`);
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

    btn.disabled = !(state.currentChance >= MIN_CHANCE && state.currentChance <= MAX_CHANCE);
    btn.classList.remove('win', 'fail');
    $('upgradeBtnText').textContent = 'Апгрейд';
}

/* ═══════════════════════════════════════════════════════════
 * DO UPGRADE — предмет списывается СРАЗУ, приз кладётся СРАЗУ
 * ═══════════════════════════════════════════════════════════ */
function doUpgrade() {
    if (state.isSpinning || !state.targetGift || !state.selectedGift) return;

    const fromId = state.selectedGift.id;
    const targetGift = { ...state.targetGift };
    const selectedGift = { ...state.selectedGift };

    // 1. Списываем предмет из инвентаря НЕМЕДЛЕННО
    state.inventory = state.inventory.filter(i => i.id !== fromId);
    saveInventory();

    // 2. Маркер, что апгрейд начат
    localStorage.setItem('upgradePending', JSON.stringify({
        fromName: selectedGift.name,
        fromStars: selectedGift.stars,
        targetName: targetGift.name,
        targetStars: targetGift.stars,
        targetImage: targetGift.image,
        targetPrice: targetGift.price,
        startedAt: Date.now()
    }));

    state.isSpinning = true;
    lockUpgradeUI(true);
    window.addEventListener('beforeunload', preventLeaveDuringSpin);

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

    const success = Math.random() * 100 < state.currentChance * HOUSE_EDGE;

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
    pointerWrap.style.transition = `transform ${spinDuration}ms cubic-bezier(0.3, 0, 0.15, 1.05)`;
    pointerWrap.style.transform = `rotate(${totalSpin}deg)`;

    // 3. Применяем результат СРАЗУ — при выигрыше приз уже в инвентаре,
    //    даже если игрок закроет вкладку до окончания анимации
    applyUpgradeResult(success, targetGift);

    setTimeout(() => {
        $('wheelGlow').classList.remove('spinning');
        showResult(success, targetGift);
    }, spinDuration);
}

function applyUpgradeResult(success, targetGift) {
    if (success) {
        // Кладём выигранный приз в инвентарь немедленно
        state.inventory.push({
            id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: targetGift.name,
            price: targetGift.price,
            stars: targetGift.stars,
            image: targetGift.image,
            timestamp: Date.now()
        });
        saveInventory();
    }
    // При проигрыше — предмет уже списан, ничего не возвращаем
    localStorage.removeItem('upgradePending');
}

function showResult(success, targetGift) {
    const center = $('wheelCenter');
    const btn = $('upgradeBtn');
    $('chancePct').style.display = 'none';

    if (success) {
        center.classList.add('flash-green');
        $('resultHappy').classList.add('show');
        btn.classList.add('win');
        $('upgradeBtnText').textContent = 'Победа!';
        launchConfetti(40);
        playWinLottie(targetGift);
        showToast(`Успех! Получено: ${targetGift.name}`, 'ok');
        window.vibrate('success');
    } else {
        center.classList.add('flash-red');
        $('resultSad').classList.add('show');
        btn.classList.add('fail');
        $('upgradeBtnText').textContent = 'Неудача';
        $('leftCard').classList.add('fail');
        $('rightCard').classList.add('fail');
        showToast(`Не повезло. ${targetGift.name} не получен`, 'err');
        window.vibrate('error');
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

    // Снимаем блокировку и защиту
    lockUpgradeUI(false);
    window.removeEventListener('beforeunload', preventLeaveDuringSpin);
}

/* ═══════════ LOTTIE ═══════════ */
function getGiftLottieSafe(name, price) {
    if (window.ROOT_ITEMS.has(name) || price < 3) return null;
    return `https://cdn.changes.tg/gifts/models/${window.encodePathPart(name)}/lottie/Original.json`;
}

function playWinLottie(gift) {
    if (!gift || !gift.name) return;
    const url = getGiftLottieSafe(gift.name, gift.price);
    if (!url) return;

    const overlay = document.createElement('div');
    overlay.className = 'lottie-win-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);pointer-events:none;opacity:1;transition:opacity .4s';
    overlay.innerHTML = '<div style="width:220px;height:220px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 40px rgba(245,197,24,.5))"></div>';
    document.body.appendChild(overlay);

    fetch(url, { method: 'HEAD' })
        .then(r => {
            if (!r.ok) { overlay.remove(); return; }
            const box = overlay.firstChild;
            lottie.loadAnimation({ container: box, renderer: 'svg', loop: true, autoplay: true, path: url });
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
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#F5C518', '#FFD84D', '#fff', '#C7C7CC', '#8a6a0c'];

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

function showToast(msg, type = 'ok') {
    const t = $('toast');
    t.textContent = msg;
    t.className = 'toast show ' + type;
    setTimeout(() => t.classList.remove('show'), 2500);
}

window.toggleInventory = toggleInventory;
window.toggleTargets = toggleTargets;
window.selectGiftById = selectGiftById;
window.selectTargetByName = selectTargetByName;
window.doUpgrade = doUpgrade;