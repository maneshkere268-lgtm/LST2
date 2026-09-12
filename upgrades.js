const $ = id => document.getElementById(id);
const STAR_ICON = 'star.png';
const GIFT_FALLBACK = 'star.png';
const TON_TO_STARS = 125;
const MIN_CHANCE = 5;    // минимальный шанс цели (в %)
const MAX_CHANCE = 85;   // максимальный шанс цели (в %) — выше не показываем
const MAX_TARGET_PRICE_MULT = 20;
const HOUSE_EDGE = 0.95; // честная механика без комиссии

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

/* ═══════════════════════════════════════════════════════════
 * Полный список предметов из Fine Pen.txt (цены в TON).
 * Дубликаты имён убраны — оставлена одна цена на имя
 * (берётся самая высокая).
 * ═══════════════════════════════════════════════════════════ */
const ALL_GIFTS_POOL = (() => {
    const RAW = [
        ['Fine Pen', 1096.25],
        ['Algorithm Cup', 312375],
        ['Intelligence Cup', 298350],
        ['Astral Shard', 14648.75],
        ['B-Day Candle', 598.75],
        ['Berry Box', 1072.5],
        ['Big Year', 500],
        ['Bonded Ring', 5048.75],
        ['Bow Tie', 612.5],
        ['Bunny Muffin', 972.5],
        ['Candy Cane', 501.25],
        ['Cookie Heart', 586.25],
        ['Crystal Ball', 1506.25],
        ['Desk Calendar', 573.75],
        ['Diamond Ring', 3825],
        ['Durov’s Cap', 49725],
        ['Easter Egg', 533.75],
        ['Electric Skull', 3117.5],
        ['Eternal Candle', 737.5],
        ['Eternal Rose', 3147.5],
        ['Evil Eye', 931.25],
        ['Flying Broom', 1495],
        ['Gem Signet', 7648.75],
        ['Genie Lamp', 4153.75],
        ['Ginger Cookie', 530],
        ['Hanging Star', 1133.75],
        ['Heart Locket', 139612.5],
        ['Heroic Helmet', 22493.75],
        ['Hex Pot', 548.75],
        ['Holiday Drink', 501.25],
        ['Homemade Cake', 587.5],
        ['Hypno Lollipop', 505],
        ['Ion Gem', 8925],
        ['Jack-in-the-Box', 548.75],
        ['Jelly Bunny', 981.25],
        ['Jester Hat', 503.75],
        ['Jingle Bells', 1007.5],
        ['Kissed Frog', 4652.5],
        ['Light Sword', 762.5],
        ['Lol Pop', 492.5],
        ['Loot Bag', 15158.75],
        ['Love Candle', 1186.25],
        ['Love Potion', 1806.25],
        ['Lunar Snake', 500],
        ['Lush Bouquet', 726.25],
        ['Mad Pumpkin', 1557.5],
        ['Magic Potion', 6761.25],
        ['Mini Oscar', 9180],
        ['Nail Bracelet', 14333.75],
        ['Neko Helmet', 4690],
        ['Party Sparkler', 536.25],
        ['Perfume Bottle', 9295],
        ['Pet Snake', 506.25],
        ['Plush Pepe', 828750],
        ['Precious Peach', 31873.75],
        ['Record Player', 1577.5],
        ['Restless Jar', 666.25],
        ['Sakura Flower', 1233.75],
        ['Santa Hat', 513.75],
        ['Scared Cat', 28681.25],
        ['Sharp Tongue', 5481.25],
        ['Signet Ring', 4077.5],
        ['Skull Flower', 1396.25],
        ['Sleigh Bell', 863.75],
        ['Snake Box', 498.75],
        ['Snow Globe', 572.5],
        ['Snow Mittens', 560],
        ['Spiced Wine', 545],
        ['Spy Agaric', 690],
        ['Star Notepad', 545],
        ['Swiss Watch', 6146.25],
        ['Tama Gadget', 502.5],
        ['Top Hat', 1272.5],
        ['Toy Bear', 4495],
        ['Trapped Heart', 1900],
        ['Vintage Cigar', 4576.25],
        ['Voodoo Doll', 4392.5],
        ['Winter Wreath', 501.25],
        ['Witch Hat', 607.5],
        ['Xmas Stocking', 490],
        ['Cupid Charm', 2698.75],
        ['Whip Cupcake', 547.5],
        ['Valentine Box', 1441.25],
        ['Joyful Bundle', 947.5],
        ['Low Rider', 6776.25],
        ['Westside Sign', 12353.75],
        ['Snoop Cigar', 1838.75],
        ['Swag Bag', 687.5],
        ['Snoop Dogg', 657.5],
        ['Ionic Dryer', 1831.25],
        ['Jolly Chimp', 878.75],
        ['Moon Pendant', 775],
        ['Stellar Rocket', 606.25],
        ['Artisan Brick', 7522.5],
        ['Input Key', 778.75],
        ['Mighty Arm', 14375],
        ['Fresh Socks', 543.75],
        ['Clover Pin', 600],
        ['Sky Stilettos', 2422.5],
        ['Faith Amulet', 667.5],
        ['Happy Brownie', 542.5],
        ['Ice Cream', 545],
        ['Instant Ramen', 523.75],
        ['Mousse Cake', 563.75],
        ['Spring Basket', 665],
        ['Bling Binky', 2931.25],
        ['Money Pot', 555],
        ['Pretty Posy', 587.5],
        ['Khabib’s Papakha', 3026.25],
        ['UFC Strike', 1941.25],
       ['Victory Medal', 561.25],
        ['Rare Bird', 3028.75],
        ['Mood Pack', 555],
        ['Pool Float', 500],
        ['Timeless Book', 560],
        ['Chill Flame', 508.75],
        ['Vice Cream', 507.5],
        ['Surge Board', 855],
        ['Liberty Figure', 590],
        ['Durov’s Glasses', 11475]
    ];

    const map = new Map();
    for (const [name, stars] of RAW) {
        const key = name.replace(/[’']/g, "'");
        const priceTon = stars / TON_TO_STARS;
        const prev = map.get(key);
        if (!prev || prev.price < priceTon) {
            map.set(key, { name, price: priceTon });
        }
    }
    return Array.from(map.values());
})();

document.addEventListener('DOMContentLoaded', init);

function init() {
    const savedStars = localStorage.getItem('userStars');
    state.stars = savedStars !== null ? parseInt(savedStars) : 12500;

    const name = localStorage.getItem('userName') || 'Username';
    $('userName').textContent = name;

    loadInventory();
    updateBalanceUI();
    renderInventoryGrid();

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
function normalizeApostrophes(str) {
    return str.replace(/[\u2018\u2019\u02BC\u0060\u00B4]/g, "'");
}

function encodePathPart(str) {
    return encodeURIComponent(normalizeApostrophes(str.trim()));
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

    const seen = new Set();
    ALL_GIFTS_POOL.forEach(g => {
        if (seen.has(g.name)) return;
        seen.add(g.name);

        const gStars = Math.round(g.price * TON_TO_STARS);
        if (gStars <= myStars) return;
        if (gStars > myStars * MAX_TARGET_PRICE_MULT) return;

        const chance = (myStars / gStars) * 100;
        if (chance < MIN_CHANCE) return;
        if (chance > MAX_CHANCE) return;  // ← верхняя граница 85%

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
        list.innerHTML = '<div class="empty-msg">Нет подходящих целей<br><small style="opacity:.6">Шанс должен быть от ' + MIN_CHANCE + '% до ' + MAX_CHANCE + '%</small></div>';
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

    if (state.currentChance >= MIN_CHANCE && state.currentChance <= MAX_CHANCE) {
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
    const colors = ['#F5C518','#FFD84D','#fff','#C7C7CC','#8a6a0c'];

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