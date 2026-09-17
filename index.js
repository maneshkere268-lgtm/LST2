// index.js — Кейсы (полная блокировка UI + 4/5 сек анимация)
const $ = id => document.getElementById(id);

/* ═══════════════════════════════════════════════════════════
 * ЛОКАЛЬНЫЕ КАРТИНКИ (ищутся в корне проекта)
 * ═══════════════════════════════════════════════════════════ */
const LOCAL_IMAGE_NAMES = new Set(['Mask', "Durov's Figurine", 'Airplane']);

/* ═══════════════════════════════════════════════════════════
 * КЕЙСЫ
 * Цены кейсов и предметов — в TON (1 TON = 125 ⭐)
 * Шансы подогнаны так, чтобы EV/цена был в диапазоне 0.4–1.0
 * ═══════════════════════════════════════════════════════════ */
const CASES = [
    /* ═══ 1. Starter Case — 0.35 TON = 44 ⭐ — EV/цена = 0.75× ═══ */
    { id: 1, name: 'Starter Case', price: 0.35, color: 'g-dark',
      cheapPool: [
        { name: 'Bear', price: 0.12,  chance: 50 },
        { name: 'Gift', price: 0.20,  chance: 45 },
        { name: 'Cake', price: 0.40,  chance: 1 }
      ],
      items: [
        { name: 'Lol Pop',     price: 3.94,  chance: 1 },
        { name: 'Snake Box',   price: 3.99,  chance: 1 },
        { name: 'Jester Hat',  price: 4.03,  chance: 1 },
        { name: 'Lunar Snake', price: 4.00,  chance: 1 }
      ] },

    /* ═══ 2. Sweet Case — 1 TON = 125 ⭐ — EV/цена = 0.78× ═══ */
    { id: 2, name: 'Sweet Case', price: 1, color: 'g-red',
      cheapPool: [
        { name: 'Trophy',        price: 0.80,  chance: 95 },
        { name: 'Cookie Heart',  price: 4.69,  chance: 0.6 },
        { name: 'Happy Brownie', price: 4.34,  chance: 0.6 }
      ],
      items: [
        { name: 'Ginger Cookie',  price: 4.24, chance: 0.6 },
        { name: 'Party Sparkler', price: 4.29, chance: 0.6 },
        { name: 'Fresh Socks',    price: 4.35, chance: 0.6 },
        { name: 'Spiced Wine',    price: 4.36, chance: 0.6 },
        { name: 'Ice Cream',      price: 4.36, chance: 0.6 },
        { name: 'B-Day Candle',   price: 4.79, chance: 0.8 }
      ] },

    /* ═══ 3. Xmas Case — 2 TON = 250 ⭐ — EV/цена = 0.40× ═══ */
    { id: 3, name: 'Xmas Case', price: 2, color: 'g-green',
      cheapPool: [
        { name: 'Trophy',        price: 0.80,  chance: 95 },
        { name: 'Xmas Stocking', price: 3.92,  chance: 0.5 },
        { name: 'Santa Hat',     price: 4.11,  chance: 0.5 },
        { name: 'Snow Mittens',  price: 4.48,  chance: 0.5 },
        { name: 'Snow Globe',    price: 4.58,  chance: 0.5 }
      ],
      items: [
        { name: 'B-Day Candle',   price: 4.79,  chance: 0.5 },
        { name: 'Bow Tie',        price: 4.90,  chance: 0.5 },
        { name: 'Winter Wreath',  price: 4.01,  chance: 0.5 },
        { name: 'Candy Cane',     price: 4.01,  chance: 0.5 },
        { name: 'Eternal Candle', price: 5.90,  chance: 0.3 },
        { name: 'Sleigh Bell',    price: 6.91,  chance: 0.4 },
        { name: 'Jingle Bells',   price: 8.06,  chance: 0.3 }
      ] },

    /* ═══ 4. Love Case — 3 TON = 375 ⭐ — EV/цена = 0.40× ═══ */
    { id: 4, name: 'Love Case', price: 3, color: 'g-pink',
      cheapPool: [
        { name: 'Cake',          price: 0.40,   chance: 95 },
        { name: 'Cookie Heart',  price: 4.69,   chance: 0.5 },
        { name: 'Valentine Box', price: 11.53,  chance: 1.0 },
        { name: 'Love Candle',   price: 9.49,   chance: 1.0 }
      ],
      items: [
        { name: 'Cupid Charm',   price: 17.59,  chance: 0.7 },
        { name: 'Trapped Heart', price: 15.20,  chance: 0.7 },
        { name: 'Love Potion',   price: 14.45,  chance: 0.7 },
        { name: 'Sakura Flower', price: 9.87,   chance: 0.2 },
        { name: 'Hanging Star',  price: 9.07,   chance: 0.1 },
        { name: 'Berry Box',     price: 8.58,   chance: 0.05 },
        { name: 'Fine Pen',      price: 8.77,   chance: 0.05 }
      ] },

    /* ═══ 5. Halloween Case — 5 TON = 625 ⭐ — EV/цена = 0.70× ═══ */
    { id: 5, name: 'Halloween Case', price: 5, color: 'g-orange',
      cheapPool: [
        { name: 'Trophy',     price: 0.80,  chance: 25 },
        { name: 'Big Year',   price: 4.00,  chance: 25 },
        { name: 'Lol Pop',    price: 3.94,  chance: 15 },
        { name: 'Jester Hat', price: 4.03,  chance: 15 },
        { name: 'Hex Pot',    price: 4.39,  chance: 15 }
      ],
      items: [
        { name: 'Scared Cat',     price: 229.45, chance: 0.3 },
        { name: 'Voodoo Doll',    price: 35.14,  chance: 0.6 },
        { name: 'Electric Skull', price: 24.94,  chance: 0.7 },
        { name: 'Mad Pumpkin',    price: 12.46,  chance: 0.9 },
        { name: 'Skull Flower',   price: 11.17,  chance: 0.6 },
        { name: 'Evil Eye',       price: 7.45,   chance: 0.5 },
        { name: 'Jolly Chimp',    price: 7.03,   chance: 0.5 },
        { name: 'Mask',           price: 6.58,   chance: 0.5 },
        { name: 'Moon Pendant',   price: 6.20,   chance: 0.4 }
      ] },

    /* ═══ 6. Magic Case — 7 TON = 875 ⭐ — EV/цена = 0.80× ═══ */
    { id: 6, name: 'Magic Case', price: 7, color: 'g-purple',
      cheapPool: [
        { name: 'Trophy',       price: 0.80,   chance: 20 },
        { name: 'Light Sword',  price: 6.10,   chance: 15 },
        { name: 'Spy Agaric',   price: 5.52,   chance: 12 },
        { name: 'Lush Bouquet', price: 5.81,   chance: 12 },
        { name: 'Input Key',    price: 6.23,   chance: 12 }
      ],
      items: [
        { name: 'Magic Potion',   price: 54.09,  chance: 1.0 },
        { name: 'Genie Lamp',     price: 33.23,  chance: 1.2 },
        { name: 'Crystal Ball',   price: 12.05,  chance: 1.0 },
        { name: 'Flying Broom',   price: 11.96,  chance: 1.0 },
        { name: 'Top Hat',        price: 10.18,  chance: 0.8 },
        { name: 'Eternal Candle', price: 5.90,   chance: 8 },
        { name: 'Witch Hat',      price: 4.86,   chance: 6 },
        { name: 'Stellar Rocket', price: 4.85,   chance: 5 },
        { name: 'Whip Cupcake',   price: 4.38,   chance: 5 }
      ] },

    /* ═══ 7. Animal Case — 10 TON = 1250 ⭐ — EV/цена = 0.80× ═══ */
    { id: 7, name: 'Animal Case', price: 10, color: 'g-dark',
      cheapPool: [
        { name: 'Trophy',        price: 0.80,   chance: 20 },
        { name: 'Fine Pen',      price: 8.77,   chance: 15 },
        { name: 'Berry Box',     price: 8.58,   chance: 12 },
        { name: 'Jelly Bunny',   price: 7.85,   chance: 10 },
        { name: 'Bunny Muffin',  price: 7.78,   chance: 10 },
        { name: 'Sakura Flower', price: 9.87,   chance: 10 }
      ],
      items: [
        { name: 'Scared Cat',  price: 229.45, chance: 1.0 },
        { name: 'Kissed Frog', price: 37.22,  chance: 1.5 },
        { name: 'Toy Bear',    price: 35.96,  chance: 1.5 },
        { name: 'Rare Bird',   price: 24.23,  chance: 1.0 },
        { name: 'Jolly Chimp', price: 7.03,   chance: 6 },
        { name: 'Pet Snake',   price: 4.05,   chance: 4 },
        { name: 'Lunar Snake', price: 4.00,   chance: 4 },
        { name: 'Snake Box',   price: 3.99,   chance: 4 }
      ] },

    /* ═══ 8. Gaming Case — 15 TON = 1875 ⭐ — EV/цена = 0.80× ═══ */
    { id: 8, name: 'Gaming Case', price: 15, color: 'g-yellow',
      cheapPool: [
        { name: 'Trophy',        price: 0.80,   chance: 20 },
        { name: 'Record Player', price: 12.62,  chance: 20 },
        { name: 'Crystal Ball',  price: 12.05,  chance: 15 },
        { name: 'Flying Broom',  price: 11.96,  chance: 15 },
        { name: 'Mad Pumpkin',   price: 12.46,  chance: 10 }
      ],
      items: [
        { name: 'Perfume Bottle', price: 74.36,  chance: 0.5 },
        { name: 'Mini Oscar',     price: 73.44,  chance: 0.5 },
        { name: 'Ion Gem',        price: 71.40,  chance: 0.5 },
        { name: 'Gem Signet',     price: 61.19,  chance: 0.5 },
        { name: 'Artisan Brick',  price: 60.18,  chance: 0.5 },
        { name: 'Low Rider',      price: 54.21,  chance: 0.5 },
        { name: 'Magic Potion',   price: 54.09,  chance: 0.5 },
        { name: 'Swiss Watch',    price: 49.17,  chance: 0.5 },
        { name: 'Bonded Ring',    price: 40.39,  chance: 0.5 },
        { name: 'Sharp Tongue',   price: 43.85,  chance: 0.5 },
        { name: 'Vintage Cigar',  price: 36.61,  chance: 0.5 },
        { name: 'Surge Board',    price: 6.84,   chance: 8 },
        { name: 'Input Key',      price: 6.23,   chance: 7 }
      ] },

    /* ═══ 9. Gem Case — 20 TON = 2500 ⭐ — EV/цена = 0.70× ═══ */
    { id: 9, name: 'Gem Case', price: 20, color: 'g-yellow',
      cheapPool: [
        { name: 'Trophy',        price: 0.80,   chance: 78.86 },
        { name: 'Bonded Ring',   price: 40.39,  chance: 0.84 },
        { name: 'Sharp Tongue',  price: 43.85,  chance: 0.92 },
        { name: 'Vintage Cigar', price: 36.61,  chance: 0.76 },
        { name: 'Neko Helmet',   price: 37.52,  chance: 0.78 }
      ],
      items: [
        { name: 'Loot Bag',      price: 121.27, chance: 2.53 },
        { name: 'Astral Shard',  price: 117.19, chance: 2.45 },
        { name: 'Nail Bracelet', price: 114.67, chance: 2.40 },
        { name: 'Mighty Arm',    price: 115.00, chance: 2.40 },
        { name: 'Ion Gem',       price: 71.40,  chance: 1.49 },
        { name: 'Gem Signet',    price: 61.19,  chance: 1.28 },
        { name: 'Magic Potion',  price: 54.09,  chance: 1.13 },
        { name: 'Low Rider',     price: 54.21,  chance: 1.13 },
        { name: 'Swiss Watch',   price: 49.17,  chance: 1.03 },
        { name: 'Diamond Ring',  price: 30.60,  chance: 0.64 },
        { name: 'Signet Ring',   price: 32.62,  chance: 0.68 },
        { name: 'Genie Lamp',    price: 33.23,  chance: 0.69 }
      ] },

    /* ═══ 10. Royal Case — 150 TON = 18750 ⭐ — EV/цена = 0.70× ═══ */
    { id: 10, name: 'Royal Case', price: 150, color: 'g-green',
      cheapPool: [
        { name: 'Trophy',           price: 0.80,   chance: 0.09 },
        { name: 'Nail Bracelet',    price: 114.67, chance: 13.56 },
        { name: 'Mighty Arm',       price: 115.00, chance: 13.60 },
        { name: 'Loot Bag',         price: 121.27, chance: 14.34 },
        { name: 'Westside Sign',    price: 98.83,  chance: 11.69 },
        { name: "Durov's Glasses",  price: 91.80,  chance: 10.86 },
        { name: 'Ion Gem',          price: 71.40,  chance: 8.44 },
        { name: 'Gem Signet',       price: 61.19,  chance: 7.24 },
        { name: 'Low Rider',        price: 54.21,  chance: 6.41 },
        { name: 'Magic Potion',     price: 54.09,  chance: 6.40 },
        { name: 'Swiss Watch',      price: 49.17,  chance: 5.82 }
      ],
      items: [
        { name: 'Plush Pepe',        price: 6630,    chance: 0.485 },
        { name: 'Airplane',          price: 6300,    chance: 0.461 },
        { name: 'Algorithm Cup',     price: 2499,    chance: 0.183 },
        { name: 'Intelligence Cup',  price: 2386.8,  chance: 0.175 },
        { name: "Durov's Figurine",  price: 1223.25, chance: 0.090 },
        { name: 'Heart Locket',      price: 1116.9,  chance: 0.082 },
        { name: "Durov's Cap",       price: 397.80,  chance: 0.029 },
        { name: 'Precious Peach',    price: 254.99,  chance: 0.019 },
        { name: 'Scared Cat',        price: 229.45,  chance: 0.017 },
        { name: "Khabib's Papakha",  price: 194.00,  chance: 0.014 },
        { name: 'Heroic Helmet',     price: 179.95,  chance: 0.013 }
      ] }
];

/* ═══════════════════════════════════════════════════════════
 * УТИЛИТЫ
 * ═══════════════════════════════════════════════════════════ */

window.pickGiftForWin = function (amount) {
    if (!amount || amount <= 0) return { gift: null, remainder: 0 };
    const pool = window.ALL_GIFTS.filter(g => g.price <= amount);
    if (!pool.length) return { gift: null, remainder: amount };
    pool.sort((a, b) => b.price - a.price);
    const best = pool[0];
    return { gift: best, remainder: amount - best.price };
};

/* ═══════════ СОСТОЯНИЕ ═══════════ */
let currentCase = null;
let userStars = 0;
let selectedQty = 1;
let isOpening = false;
let winLottieInstance = null;
let currentWinItems = [];
let spinInterval = null;

/* ═══════════ INIT ═══════════ */
document.addEventListener('DOMContentLoaded', init);

function init() {
    window.TG.updateHeaderUI();
    userStars = parseInt(localStorage.getItem('userStars')) || 0;

    renderCases();
    updateBalance();
    checkAndGrantStarterBonus();
    restoreLastDrop();

    window.addEventListener('firebaseDataLoaded', (e) => {
        if (typeof e.detail.stars === 'number') {
            userStars = e.detail.stars;
            updateBalance();
        }
    });

    document.addEventListener('click', e => {
        const el = e.target.closest('button, .case, .qty-btn, .modal-win-btn');
        if (el && !isOpening) window.vibrate('light');
    });
}

function updateBalance() {
    $('balanceDisplay').textContent = window.formatStars(userStars);
}

function getInventory() {
    try {
        const inv = JSON.parse(localStorage.getItem('userInventory') || '[]');
        return Array.isArray(inv) ? inv : [];
    } catch (e) { return []; }
}

function saveInventory(inv) {
    localStorage.setItem('userInventory', JSON.stringify(inv));
    window.FB?.save();
}

function saveStars() {
    localStorage.setItem('userStars', userStars.toString());
    window.FB?.save();
}

function checkAndGrantStarterBonus() {
    if (userStars <= 0 && getInventory().length === 0) {
        userStars = 1000;
        saveStars();
        updateBalance();
        showToast('Начислено 1000 звёзд для старта!', 'ok');
    }
}

/* ═══════════ PREVIEW ═══════════ */
function getCasePreview(items) {
    const sorted = [...items].sort((a, b) => b.price - a.price);
    const top = sorted[0];
    const samePrice = sorted.filter(i => i.price === top.price);
    return samePrice.length > 1 ? samePrice[1] : top;
}

function getFullItems(c) {
    return [...(c.cheapPool || []), ...c.items];
}

function getGiftImageByName(name, price) {
    if (window.ROOT_ITEMS.has(name) || LOCAL_IMAGE_NAMES.has(name) || price < 3) {
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

function getGiftLottieSafe(name, price) {
    if (window.ROOT_ITEMS.has(name) || LOCAL_IMAGE_NAMES.has(name) || price < 3) return null;
    return `https://cdn.changes.tg/gifts/models/${window.encodePathPart(name)}/lottie/Original.json`;
}

/* ═══════════ RENDER КЕЙСОВ ═══════════ */
function renderCases() {
    const container = $('casesContainer');
    container.innerHTML = CASES.map(c => {
        const preview = getCasePreview(c.items);
        const casePriceStars = Math.round(c.price * 125);
        return `
            <div class="case ${c.color}" onclick="openCaseModal(${c.id})">
                <div class="case-glow"></div>
                <div class="case-inner">
                    <div class="case-img">
                        <img src="${getGiftImageByName(preview.name, preview.price)}" alt="" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'">
                    </div>
                    <div class="case-name">${c.name}</div>
                    <div class="case-price"><img src="${window.STAR_ICON}" alt=""> ${window.formatStars(casePriceStars)}</div>
                </div>
            </div>
        `;
    }).join('');
}

/* ═══════════ МОДАЛКА ═══════════ */
function openCaseModal(caseId) {
    if (isOpening) return;
    currentCase = CASES.find(c => c.id === caseId);
    if (!currentCase) return;
    setOpening(false);
    selectedQty = 1;
    document.querySelectorAll('.qty-btn').forEach(b => b.classList.toggle('active', b.dataset.qty === '1'));
    renderModal();
    $('caseModal').classList.add('open');
}

function setQty(q) {
    if (isOpening) return;
    selectedQty = q;
    document.querySelectorAll('.qty-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.qty) === q));
    if (currentCase) {
        const stars = Math.round(currentCase.price * 125 * q);
        $('modalPrice').querySelector('span').textContent = window.formatStars(stars);
        updateOpenButton();
    }
}

function renderModal() {
    if (!currentCase) return;
    const casePriceStars = Math.round(currentCase.price * 125 * selectedQty);
    $('modalName').textContent = currentCase.name;
    $('modalPrice').querySelector('span').textContent = window.formatStars(casePriceStars);

    $('modalWin').style.display = 'none';
    $('rouletteWrap').style.display = 'block';
    $('rouletteWrap').innerHTML = `
        <div class="roulette-track idle" id="rouletteTrack"></div>
        <div class="roulette-pointer ptr-top"></div>
        <div class="roulette-pointer ptr-bottom"></div>
    `;
    $('rouletteWrap').classList.remove('won');
    $('contentsSection').style.display = 'block';
    $('qtyRow').style.display = 'flex';
    $('openBtnWrap').style.display = 'block';

    $('openBtnWrap').innerHTML = `
        <button class="open-btn" id="openBtn" onclick="openCase()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
            Открыть кейс
        </button>
    `;

    const fullItems = getFullItems(currentCase);
    const gifts = [...fullItems].sort((a, b) => b.price - a.price);

    const rouletteItems = [];
    for (let i = 0; i < 30; i++) {
        const g = gifts[i % gifts.length];
        const stars = Math.round(g.price * 125);
        rouletteItems.push(`
            <div class="roulette-item">
                <div class="ri-price"><img src="${window.STAR_ICON}" alt="">${window.formatStars(stars)}</div>
                <img class="ri-img" src="${getGiftImageByName(g.name, g.price)}" alt="" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'">
            </div>
        `);
    }
    const track = $('rouletteTrack');
    track.innerHTML = rouletteItems.join('') + rouletteItems.join('');
    track.classList.add('idle');
    track.classList.remove('spinning');
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';

    const totalWeight = fullItems.reduce((s, x) => s + (x.chance || 0), 0) || 1;
    $('contentsGrid').innerHTML = gifts.map(g => {
        const chance = ((g.chance || 0) / totalWeight) * 100;
        let chanceStr = chance >= 10 ? chance.toFixed(1) : chance >= 1 ? chance.toFixed(2) : chance >= 0.01 ? chance.toFixed(3) : chance.toFixed(4);

        let rarityClass = '';
        if (chance < 0.1) rarityClass = 'legendary';
        else if (chance < 1) rarityClass = 'epic';
        else if (chance < 10) rarityClass = 'rare';

        const stars = Math.round(g.price * 125);
        const lottieUrl = getGiftLottieSafe(g.name, g.price);
        const itemId = 'item-' + Math.random().toString(36).substr(2, 9);

        return `
            <div class="content-item" data-item-id="${itemId}" data-lottie="${lottieUrl || ''}" onmouseenter="playLottie(this)" onmouseleave="stopLottie(this)">
                <div class="content-item-name">${window.escapeHtml(g.name)}</div>
                <div class="content-item-media">
                    <img src="${getGiftImageByName(g.name, g.price)}" alt="" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'">
                    <div class="lottie-box"></div>
                </div>
                <div class="content-price"><img src="${window.STAR_ICON}" alt=""> ${window.formatStars(stars)}</div>
                <div class="content-chance ${rarityClass}">Шанс: ${chanceStr}%</div>
            </div>
        `;
    }).join('');

    updateOpenButton();
}

const lottieInstances = {};

function playLottie(el) {
    if (isOpening) return;
    const url = el.dataset.lottie;
    if (!url || !url.startsWith('http')) return;
    const itemId = el.dataset.itemId;
    const box = el.querySelector('.lottie-box');
    if (!box) return;

    fetch(url, { method: 'HEAD' })
        .then(r => {
            if (!r.ok) return;
            el.classList.add('playing-lottie');
            if (lottieInstances[itemId]) lottieInstances[itemId].destroy();
            lottieInstances[itemId] = lottie.loadAnimation({
                container: box, renderer: 'svg', loop: true, autoplay: true, path: url
            });
        })
        .catch(() => {});
}

function stopLottie(el) {
    const itemId = el.dataset.itemId;
    if (lottieInstances[itemId]) { lottieInstances[itemId].destroy(); delete lottieInstances[itemId]; }
    el.classList.remove('playing-lottie');
}

function updateOpenButton() {
    const btn = $('openBtn');
    if (!btn || !currentCase) return;
    const cost = Math.round(currentCase.price * 125 * selectedQty);
    if (userStars < cost) {
        btn.classList.add('insufficient');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18.36 5.64l-12.72 12.72"/><path d="M5.64 5.64l12.72 12.72"/></svg> Недостаточно звёзд`;
    } else {
        btn.classList.remove('insufficient');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"></path></svg> Открыть кейс`;
    }
}

/* ═══════════════════════════════════════════════════════════
 * БЛОКИРОВКА UI ВО ВРЕМЯ ОТКРЫТИЯ КЕЙСА
 * ═══════════════════════════════════════════════════════════ */
function lockCaseUI(lock) {
    const modal = $('caseModal');
    if (!modal) return;

    modal.querySelectorAll('button, .qty-btn, .content-item, .roulette-item, .case, .modal-win-btn')
        .forEach(el => {
            if (lock) {
                el.setAttribute('disabled', 'disabled');
                el.style.pointerEvents = 'none';
                el.style.opacity = el.classList.contains('qty-btn') ? '0.5' : '';
            } else {
                el.removeAttribute('disabled');
                el.style.pointerEvents = '';
                el.style.opacity = '';
            }
        });

    modal.style.pointerEvents = lock ? 'none' : '';
    const content = modal.querySelector('.modal');
    if (content) content.style.pointerEvents = 'auto';

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

    document.querySelectorAll('header .user-profile, header button').forEach(el => {
        if (lock) {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.6';
        } else {
            el.style.pointerEvents = '';
            el.style.opacity = '';
        }
    });
}

/* ═══════════ ОТКРЫТИЕ ═══════════ */
function openCase() {
    if (!currentCase || isOpening) return;
    const totalStars = Math.round(currentCase.price * 125 * selectedQty);
    if (userStars < totalStars) { showToast('Недостаточно звёзд', 'err'); return; }

    isOpening = true;
    lockCaseUI(true);

    const wonGifts = [];
    for (let i = 0; i < selectedQty; i++) {
        wonGifts.push(pickRandomGift(getFullItems(currentCase)));
    }

    userStars -= totalStars;
    saveStars();
    updateBalance();
    checkAndGrantStarterBonus();

    const savedItems = wonGifts.map(gift => saveWinToInventory(gift));
    currentWinItems = savedItems;

    runSpinRoulette(wonGifts);
}

function pickRandomGift(items) {
    const total = items.reduce((s, g) => s + g.chance, 0);
    let r = Math.random() * total;
    for (const g of items) { r -= g.chance; if (r <= 0) return g; }
    return items[0];
}

/* ═══════════════════════════════════════════════════════════
 * РУЛЕТКА — 4 секунды (одиночная) / 5 секунд (мульти)
 * ═══════════════════════════════════════════════════════════ */
function runSpinRoulette(wonGifts) {
    const giftsArr = Array.isArray(wonGifts) ? wonGifts : [wonGifts];
    if (giftsArr.length > 1) { runMultiSpin(giftsArr); return; }

    const track = $('rouletteTrack');
    track.classList.remove('idle');
    track.classList.add('spinning');

    const pool = getFullItems(currentCase);
    const items = [];
    for (let i = 0; i < 50; i++) items.push(pool[Math.floor(Math.random() * pool.length)]);
    items[42] = giftsArr[0];

    track.innerHTML = items.map(g => {
        const stars = Math.round(g.price * 125);
        return `
            <div class="roulette-item">
                <div class="ri-price"><img src="${window.STAR_ICON}" alt="">${window.formatStars(stars)}</div>
                <img class="ri-img" src="${getGiftImageByName(g.name, g.price)}" alt="" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'">
            </div>
        `;
    }).join('');

    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';
    void track.offsetWidth;

    requestAnimationFrame(() => {
        const firstItem = track.querySelector('.roulette-item');
        if (!firstItem) return;

        const itemRect = firstItem.getBoundingClientRect();
        const wrapRect = $('rouletteWrap').getBoundingClientRect();

        const gap = 8;
        const step = itemRect.width + gap;
        const trackPaddingLeft = 6;

        const targetCenter = trackPaddingLeft + step * 42 + itemRect.width / 2;
        const wrapCenter = wrapRect.width / 2;
        const offset = wrapCenter - targetCenter;

        track.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
        track.style.transform = `translateX(${offset}px)`;
    });

    let spinVibCount = 0;
    spinInterval = setInterval(() => { window.vibrate('light'); spinVibCount++; if (spinVibCount > 8) clearInterval(spinInterval); }, 450);

    const onTransitionEnd = (e) => {
        if (e.propertyName !== 'transform') return;
        track.removeEventListener('transitionend', onTransitionEnd);
        if (spinInterval) { clearInterval(spinInterval); spinInterval = null; }
        window.vibrate('success');
        setTimeout(() => showWinResultInModal(giftsArr), 300);
    };
    track.addEventListener('transitionend', onTransitionEnd);

    setTimeout(() => {
        if (isOpening) {
            if (spinInterval) { clearInterval(spinInterval); spinInterval = null; }
            showWinResultInModal(giftsArr);
        }
    }, 5000);
}

function runMultiSpin(wonGifts) {
    const wrap = $('rouletteWrap');
    const count = wonGifts.length;
    wrap.innerHTML = '';
    wrap.style.display = 'block';

    wonGifts.forEach((gift, idx) => {
        const row = document.createElement('div');
        row.className = 'multi-roulette-row';
        row.innerHTML = `
            <div class="roulette-track spinning" id="multiTrack-${idx}"></div>
            <div class="roulette-pointer ptr-top"></div>
            <div class="roulette-pointer ptr-bottom"></div>
        `;
        wrap.appendChild(row);

        const track = row.querySelector('.roulette-track');
        const pool = getFullItems(currentCase);
        const items = [];
        for (let i = 0; i < 50; i++) items.push(pool[Math.floor(Math.random() * pool.length)]);
        items[42] = gift;

        track.innerHTML = items.map(g => {
            const stars = Math.round(g.price * 125);
            return `
                <div class="roulette-item">
                    <div class="ri-price"><img src="${window.STAR_ICON}" alt="">${window.formatStars(stars)}</div>
                    <img class="ri-img" src="${getGiftImageByName(g.name, g.price)}" alt="" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'">
                </div>
            `;
        }).join('');

        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';

        const delay = idx * 300;
        const duration = 5000 + idx * 300;

        setTimeout(() => {
            requestAnimationFrame(() => {
                const firstItem = track.querySelector('.roulette-item');
                if (!firstItem) return;

                const itemRect = firstItem.getBoundingClientRect();
                const rowRect = row.getBoundingClientRect();

                const gap = 8;
                const step = itemRect.width + gap;
                const trackPaddingLeft = 6;

                const targetCenter = trackPaddingLeft + step * 42 + itemRect.width / 2;
                const rowCenter = rowRect.width / 2;
                const offset = rowCenter - targetCenter;

                track.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
                track.style.transform = `translateX(${offset}px)`;
            });
        }, delay);
    });

    let vc = 0;
    const vi = setInterval(() => { window.vibrate('light'); vc++; if (vc > 10) clearInterval(vi); }, 400);
    const totalTime = 5000 + (count - 1) * 300 + 400;

    setTimeout(() => { clearInterval(vi); window.vibrate('success'); showWinResultInModal(wonGifts); }, totalTime);
}

/* ═══════════ СОХРАНЕНИЕ В ИНВЕНТАРЬ ═══════════ */
function saveWinToInventory(gift) {
    const inventory = getInventory();
    const stars = Math.round(gift.price * 125);
    const minPrice = window.MIN_PRICES[gift.name] || 0;
    const finalStars = Math.max(stars, minPrice);

    const savedItem = {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: gift.name,
        price: gift.price,
        stars: finalStars,
        image: getGiftImageByName(gift.name, gift.price),
        timestamp: Date.now()
    };

    inventory.push(savedItem);
    saveInventory(inventory);
    return savedItem;
}

/* ═══════════ ПОБЕДА ═══════════ */
function showWinResultInModal(giftsArr) {
    const lastDrop = {
        gifts: giftsArr,
        items: currentWinItems,
        ts: Date.now()
    };
    localStorage.setItem('lastDrop', JSON.stringify(lastDrop));

    $('rouletteWrap').classList.add('won');
    $('openBtnWrap').style.display = 'none';
    $('contentsSection').style.display = 'none';
    $('qtyRow').style.display = 'none';

    destroyWinLottie();

    if (giftsArr.length > 1) {
        const totalStars = giftsArr.reduce((s, g) => s + Math.round(g.price * 125), 0);
        $('modalWin').innerHTML = `
            <div style="text-align:center;padding:10px 0;">
                <div style="font-size:14px;color:var(--jade);margin-bottom:12px;font-weight:700;">Вы выиграли ${giftsArr.length} подарков!</div>
                <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:12px;">
                    ${giftsArr.map(g => `
                        <div style="background:var(--panel-2);border:1px solid var(--hairline);border-radius:14px;padding:8px;width:80px;text-align:center;">
                            <img src="${getGiftImageByName(g.name, g.price)}" style="width:50px;height:50px;object-fit:contain;" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'">
                            <div style="font-size:11px;color:var(--amber-2);margin-top:4px;font-weight:800;">${window.formatStars(Math.round(g.price * 125))}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="color:var(--amber-2);font-size:16px;font-weight:800;">Итого: ${window.formatStars(totalStars)}</div>
                <div class="modal-win-btns">
                    <button class="modal-win-btn sell" onclick="sellCurrentWin()">Продать</button>
                    <button class="modal-win-btn upgrade" onclick="upgradeCurrentWin()">Апгрейд</button>
                    <button class="modal-win-btn" onclick="closeModalAndReset()">Назад</button>
                </div>
            </div>
        `;
    } else {
        const gift = giftsArr[0];
        const lottieUrl = getGiftLottieSafe(gift.name, gift.price);

        $('modalWin').innerHTML = `
            <div class="modal-win-badge">Вы выиграли!</div>
            <div class="modal-win-media" id="modalWinMedia">
                <img class="modal-win-img" id="modalWinImg" src="${getGiftImageByName(gift.name, gift.price)}" alt="" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'">
            </div>
            <div class="modal-win-name" id="modalWinName">${window.escapeHtml(gift.name)}</div>
            <div class="modal-win-value">
                <img src="${window.STAR_ICON}" alt=""><span>${window.formatStars(Math.round(gift.price * 125))}</span>
            </div>
            <div class="modal-win-btns">
                <button class="modal-win-btn" onclick="sellCurrentWin()" style="background:#4ADE80;color:#0A0D14;font-weight:700;">Продать</button>
                <button class="modal-win-btn" onclick="upgradeCurrentWin()">Апгрейд</button>
                <button class="modal-win-btn" onclick="closeModalAndReset()">Назад</button>
            </div>
        `;

        if (lottieUrl) playWinLottie(lottieUrl);
    }

    $('modalWin').style.display = 'block';
    setOpening(false);
}

/* ═══════════ ВОССТАНОВЛЕНИЕ ПОСЛЕДНЕГО ДРОПА ═══════════ */
function restoreLastDrop() {
    const raw = localStorage.getItem('lastDrop');
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        if (Date.now() - data.ts > 5 * 60 * 1000) {
            localStorage.removeItem('lastDrop');
            return;
        }
        currentWinItems = data.items || [];
        showToast('Последний дроп сохранён — откройте инвентарь', 'ok');
    } catch (e) {}
}

function destroyWinLottie() {
    if (winLottieInstance) {
        try { winLottieInstance.destroy(); } catch(e) {}
        winLottieInstance = null;
    }
    const old = document.querySelector('.modal-win-lottie');
    if (old) old.remove();
    const img = $('modalWinImg');
    if (img) img.style.visibility = 'visible';
}

function playWinLottie(url) {
    const media = $('modalWinMedia');
    if (!media) return;

    fetch(url, { method: 'HEAD' })
        .then(r => {
            if (!r.ok) return;
            const img = $('modalWinImg');
            if (img) img.style.visibility = 'hidden';

            const box = document.createElement('div');
            box.className = 'modal-win-lottie';
            media.appendChild(box);

            winLottieInstance = lottie.loadAnimation({
                container: box, renderer: 'svg', loop: true, autoplay: true, path: url
            });
        })
        .catch(() => {});
}

/* ═══════════ ПРОДАТЬ / АПГРЕЙД ═══════════ */
function sellCurrentWin() {
    if (isOpening) return;
    if (!currentWinItems.length) { closeModalAndReset(); return; }

    const inventory = getInventory();
    const soldIds = new Set(currentWinItems.map(it => it.id));
    const totalStars = currentWinItems.reduce((s, it) => s + it.stars, 0);

    const filtered = inventory.filter(it => !soldIds.has(it.id));
    saveInventory(filtered);

    userStars += totalStars;
    saveStars();
    updateBalance();

    showToast(`Продано за ${window.formatStars(totalStars)} звёзд`, 'ok');
    currentWinItems = [];
    localStorage.removeItem('lastDrop');
    closeModalAndReset();
}

function upgradeCurrentWin() {
    if (isOpening) return;
    destroyWinLottie();
    closeModal();
    location.href = 'upgrades.html';
}

function closeModalAndReset() {
    if (isOpening) return;
    destroyWinLottie();
    localStorage.removeItem('lastDrop');
    closeModal();
}

function closeModal() {
    if (isOpening) return;
    destroyWinLottie();
    $('caseModal').classList.remove('open');
    currentCase = null;
}

$('caseModal') && $('caseModal').addEventListener('click', e => {
    if (isOpening) return;
    if (e.target === $('caseModal')) closeModal();
});

function setOpening(v) {
    isOpening = v;
    lockCaseUI(v);

    if (!v) {
        const btn = $('openBtn');
        if (btn) btn.disabled = false;
        document.querySelectorAll('.qty-btn').forEach(b => b.classList.remove('locked'));
    }
}

function showToast(msg, type = 'ok') {
    const toast = $('toast');
    toast.textContent = msg;
    toast.className = 'toast show ' + type;
    setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ═══════════ ЭКСПОРТ ═══════════ */
window.openCaseModal = openCaseModal;
window.setQty = setQty;
window.openCase = openCase;
window.closeModalAndReset = closeModalAndReset;
window.closeModal = closeModal;
window.sellCurrentWin = sellCurrentWin;
window.upgradeCurrentWin = upgradeCurrentWin;
window.playLottie = playLottie;
window.stopLottie = stopLottie;