/* ═══════════ КОНСТАНТЫ ═══════════ */
const $ = id => document.getElementById(id);
const TON_TO_STARS = 125;
const STAR_ICON = 'star.png';
const GIFT_FALLBACK = 'star.png';

// Предметы, которые лежат в корне проекта (bear.png, gift.png, cake.png, trophy.png)
// Для них Lottie не используется — только статичная картинка.
const ROOT_ITEMS = new Set(['Bear', 'Gift', 'Cake', 'Trophy']);

/* ═══════════════════════════════════════════════════════════
 * МИНИМАЛЬНЫЕ ЦЕНЫ ФИКСИРОВАННЫХ ПРЕДМЕТОВ (в звёздах)
 * ═══════════════════════════════════════════════════════════ */
const MIN_PRICES = {
    'Bear': 15,
    'Gift': 25,
    'Cake': 50,
    'Trophy': 100
};

/* ═══════════ КАРТИНКИ ═══════════ */
function normalizeApostrophes(str) {
    return str.replace(/[\u2018\u2019\u02BC\u0060\u00B4]/g, "'");
}

function encodePathPart(str) {
    return encodeURIComponent(normalizeApostrophes(str.trim()));
}

function getGiftImage(name, price) {
    // Предметы из корня проекта (Bear, Gift, Cake, Trophy)
    if (ROOT_ITEMS.has(name) || price < 3) {
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
    // Для корневых предметов и дешёвых — Lottie нет
    if (ROOT_ITEMS.has(name) || price < 3) return null;
    const modelMatch = name.match(/^(.+?)\s*\((.+)\)\s*$/);
    if (modelMatch) {
        const baseName = modelMatch[1].trim();
        const modelName = modelMatch[2].trim();
        return `https://cdn.changes.tg/gifts/models/${encodePathPart(baseName)}/lottie/${encodePathPart(modelName)}.json`;
    }
    return `https://cdn.changes.tg/gifts/models/${encodePathPart(name)}/lottie/Original.json`;
}

/* ═══════════════════════════════════════════════════════════
 * КЕЙСЫ
 * ═══════════════════════════════════════════════════════════ */
const CASES = [
    {
        id: 1, name: 'Starter Case', price: 0.35, color: 'g-dark',
        cheapPool: [
            { name: 'Bear', price: 0.12, chance: 15 },
            { name: 'Gift', price: 0.20, chance: 10 }
        ],
        items: [
            { name: 'Record Player', price: 12.62, chance: 0.1 },
            { name: 'Jester Hat', price: 4.03, chance: 2.4 },
            { name: 'Lol Pop', price: 3.94, chance: 0.5 },
            { name: 'Fine Pen', price: 8.77, chance: 0.1 }
        ]
    },
    {
        id: 2, name: 'Sweet Case', price: 1, color: 'g-red',
        cheapPool: [
            { name: 'Bear', price: 0.12, chance: 15 },
            { name: 'Gift', price: 0.20, chance: 10 }
        ],
        items: [
            { name: 'B-Day Candle', price: 4.79, chance: 0.1 },
            { name: 'Cookie Heart', price: 4.69, chance: 0.3 },
            { name: 'Happy Brownie', price: 4.34, chance: 50 },
            { name: 'Ginger Cookie', price: 4.24, chance: 2.6 }
        ]
    },
    {
        id: 3, name: 'Xmas Case', price: 2, color: 'g-green',
        cheapPool: [
            { name: 'Gift', price: 0.20, chance: 12 },
            { name: 'Cake', price: 0.40, chance: 10 }
        ],
        items: [
            { name: 'Jingle Bells', price: 8.06, chance: 0.5 },
            { name: 'Sleigh Bell', price: 6.91, chance: 1.5 },
            { name: 'Snow Globe', price: 4.58, chance: 3 },
            { name: 'Snow Mittens', price: 4.48, chance: 15 },
            { name: 'Santa Hat', price: 4.11, chance: 25 },
            { name: 'Xmas Stocking', price: 3.92, chance: 30 }
        ]
    },
    {
        id: 4, name: 'Love Case', price: 3, color: 'g-pink',
        cheapPool: [
            { name: 'Cake', price: 0.40, chance: 12 },
            { name: 'Cookie Heart', price: 0.96, chance: 8 }
        ],
        items: [
            { name: 'Eternal Rose', price: 25.18, chance: 2.5 },
            { name: 'Cupid Charm', price: 21.59, chance: 1.5 },
            { name: 'Trapped Heart', price: 15.20, chance: 6 },
            { name: 'Love Potion', price: 14.45, chance: 15 },
            { name: 'Valentine Box', price: 11.53, chance: 25 },
            { name: 'Love Candle', price: 9.49, chance: 30 }
        ]
    },
    {
        id: 5, name: 'Halloween Case', price: 5, color: 'g-orange',
        cheapPool: [
            { name: 'Cake', price: 0.40, chance: 10 },
            { name: 'Cookie Heart', price: 0.96, chance: 8 }
        ],
        items: [
            { name: 'Scared Cat', price: 229.45, chance: 0.8 },
            { name: 'Voodoo Doll', price: 35.14, chance: 4 },
            { name: 'Electric Skull', price: 24.94, chance: 8 },
            { name: 'Mad Pumpkin', price: 12.46, chance: 12 },
            { name: 'Skull Flower', price: 11.17, chance: 20 },
            { name: 'Evil Eye', price: 7.45, chance: 35 }
        ]
    },
    {
        id: 6, name: 'Magic Case', price: 7, color: 'g-purple',
        cheapPool: [
            { name: 'Cookie Heart', price: 0.96, chance: 10 },
            { name: 'Jester Hat', price: 1.60, chance: 8 }
        ],
        items: [
            { name: 'Magic Potion', price: 54.09, chance: 0.3 },
            { name: 'Genie Lamp', price: 33.23, chance: 0.7 },
            { name: 'Crystal Ball', price: 12.05, chance: 4 },
            { name: 'Flying Broom', price: 11.96, chance: 7 },
            { name: 'Spy Agaric', price: 5.52, chance: 15 },
            { name: 'Witch Hat', price: 4.86, chance: 25 },
            { name: 'Hex Pot', price: 4.39, chance: 30 }
        ]
    },
    {
        id: 7, name: 'Animal Case', price: 10, color: 'g-dark',
        cheapPool: [
            { name: 'Jester Hat', price: 1.60, chance: 10 },
            { name: 'Happy Brownie', price: 2.80, chance: 8 }
        ],
        items: [
            { name: 'Scared Cat', price: 229.45, chance: 0.1 },
            { name: 'Kissed Frog', price: 37.22, chance: 0.4 },
            { name: 'Toy Bear', price: 35.96, chance: 1 },
            { name: 'Rare Bird', price: 24.23, chance: 3.5 },
            { name: 'Jolly Chimp', price: 7.03, chance: 12 },
            { name: 'Pet Snake', price: 4.05, chance: 25 },
            { name: 'Lunar Snake', price: 4.00, chance: 20 },
            { name: 'Snake Box', price: 3.99, chance: 30 }
        ]
    },
    {
        id: 8, name: 'Gaming Case', price: 15, color: 'g-yellow',
        cheapPool: [
            { name: 'Happy Brownie', price: 2.80, chance: 10 },
            { name: 'Xmas Stocking', price: 3.50, chance: 8 }
        ],
        items: [
            { name: 'Perfume Bottle', price: 74.36, chance: 0.4 },
            { name: 'Mini Oscar', price: 73.44, chance: 0.1 },
            { name: 'Record Player', price: 12.62, chance: 1.5 },
            { name: 'Surge Board', price: 6.84, chance: 3 },
            { name: 'Input Key', price: 6.23, chance: 12 },
            { name: 'Light Sword', price: 6.10, chance: 18 },
            { name: 'Jack-in-the-Box', price: 4.39, chance: 22 },
            { name: 'Tama Gadget', price: 4.02, chance: 25 }
        ]
    },
    {
        id: 9, name: 'Gem Case', price: 20, color: 'g-yellow',
        cheapPool: [
            { name: 'Xmas Stocking', price: 3.50, chance: 10 },
            { name: 'Happy Brownie', price: 5.60, chance: 8 }
        ],
        items: [
            { name: 'Loot Bag', price: 121.27, chance: 0.1 },
            { name: 'Astral Shard', price: 117.19, chance: 0.4 },
            { name: 'Nail Bracelet', price: 114.67, chance: 2 },
            { name: 'Ion Gem', price: 71.40, chance: 4.5 },
            { name: 'Gem Signet', price: 61.19, chance: 8 },
            { name: 'Bonded Ring', price: 40.39, chance: 15 },
            { name: 'Signet Ring', price: 32.62, chance: 22 },
            { name: 'Diamond Ring', price: 30.60, chance: 30 }
        ]
    },
    {
        id: 10, name: 'Royal Case', price: 150, color: 'g-green',
        cheapPool: [
            { name: 'Trophy', price: 0.80, chance: 10 },
            { name: 'Fine Pen', price: 8.77, chance: 8 }
        ],
        items: [
            { name: 'Plush Pepe', price: 6630, chance: 0.1 },
            { name: 'Durov’s Figurine', price: 1223.25, chance: 0.4 },
            { name: 'Durov’s Cap', price: 397.80, chance: 1.5 },
            { name: 'Mighty Arm', price: 115.00, chance: 30 },
            { name: 'Nail Bracelet', price: 114.67, chance: 22 },
            { name: 'Westside Sign', price: 98.83, chance: 7 },
            { name: "Durov's Glasses", price: 91.80, chance: 0.4 }
        ]
    }
];

/* ═══════════ СОСТОЯНИЕ ═══════════ */
let currentCase = null;
let userId = null;
let userName = null;
let userStars = 500;
let selectedQty = 1;
let isOpening = false;
let winLottieInstance = null; // Lottie в модалке победы

/* ═══════════ INIT ═══════════ */
document.addEventListener('DOMContentLoaded', init);

function init() {
    const params = new URLSearchParams(window.location.search);
    userId = params.get('user_id') || localStorage.getItem('userId') || 'guest';
    userName = params.get('name') || localStorage.getItem('userName') || 'Username';

    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);

    const savedStars = localStorage.getItem('userStars');
    if (savedStars !== null) userStars = parseInt(savedStars) || 0;

    $('userName').textContent = userName;
    renderCases();
    updateBalance();

    document.addEventListener('click', e => {
        const el = e.target.closest('button, .case, .qty-btn, .modal-win-btn');
        if (el) vibrate('light');
    });
}

function updateBalance() {
    $('balanceDisplay').textContent = formatStars(userStars);
}

/* ═══════════ ПРЕВЬЮ КЕЙСА ═══════════ */
function getCasePreview(items) {
    const sorted = [...items].sort((a, b) => b.price - a.price);
    const top = sorted[0];
    const samePrice = sorted.filter(i => i.price === top.price);
    if (samePrice.length > 1) return samePrice[1];
    return top;
}

function getFullItems(c) {
    return [...(c.cheapPool || []), ...c.items];
}

/* ═══════════ RENDER КЕЙСОВ ═══════════ */
function renderCases() {
    const container = $('casesContainer');
    container.innerHTML = CASES.map(c => {
        const preview = getCasePreview(c.items);
        const casePriceStars = Math.round(c.price * TON_TO_STARS);
        return `
            <div class="case ${c.color}" onclick="openCaseModal(${c.id})">
                <div class="case-glow"></div>
                <div class="case-particles"></div>
                <div class="case-inner">
                    <div class="case-img">
                        <img src="${getGiftImage(preview.name, preview.price)}" alt="" onerror="this.onerror=null;this.src='${GIFT_FALLBACK}'">
                    </div>
                    <div class="case-name">${c.name}</div>
                    <div class="case-price"><img src="${STAR_ICON}" alt=""> ${formatStars(casePriceStars)}</div>
                </div>
            </div>
        `;
    }).join('');

    requestAnimationFrame(() => {
        document.querySelectorAll('.case-particles').forEach(el => {
            if (el.children.length) return;
            const colors = ['rgba(255,255,255,.6)','rgba(255,220,100,.5)','rgba(150,200,255,.5)'];
            for (let i = 0; i < 5; i++) {
                const p = document.createElement('div');
                p.className = 'case-particle';
                p.style.left = (15 + Math.random() * 70) + '%';
                p.style.bottom = (5 + Math.random() * 20) + '%';
                p.style.animationDelay = (Math.random() * 2.5).toFixed(1) + 's';
                p.style.animationDuration = (2 + Math.random() * 1.5).toFixed(1) + 's';
                p.style.background = colors[Math.floor(Math.random() * colors.length)];
                p.style.width = p.style.height = (2 + Math.random() * 2) + 'px';
                el.appendChild(p);
            }
        });
    });
}

/* ═══════════ МОДАЛКА ═══════════ */
function openCaseModal(caseId) {
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
        const stars = Math.round(currentCase.price * TON_TO_STARS * q);
        $('modalPrice').querySelector('span').textContent = formatStars(stars);
        updateOpenButton();
    }
}

function renderModal() {
    if (!currentCase) return;
    const casePriceStars = Math.round(currentCase.price * TON_TO_STARS * selectedQty);
    $('modalName').textContent = currentCase.name;
    $('modalPrice').querySelector('span').textContent = formatStars(casePriceStars);

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

    const fullItems = getFullItems(currentCase);
    const gifts = [...fullItems].sort((a, b) => b.price - a.price);

    const rouletteItems = [];
    for (let i = 0; i < 30; i++) {
        const g = gifts[i % gifts.length];
        const stars = Math.round(g.price * TON_TO_STARS);
        rouletteItems.push(`
            <div class="roulette-item">
                <div class="ri-price"><img src="${STAR_ICON}" alt="">${formatStars(stars)}</div>
                <img class="ri-img" src="${getGiftImage(g.name, g.price)}" alt="" onerror="this.onerror=null;this.src='${GIFT_FALLBACK}'">
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
        let chanceStr;
        if (chance >= 10) chanceStr = chance.toFixed(1);
        else if (chance >= 1) chanceStr = chance.toFixed(2);
        else if (chance >= 0.01) chanceStr = chance.toFixed(3);
        else chanceStr = chance.toFixed(4);

        let rarityClass = '';
        if (chance < 0.1) rarityClass = 'legendary';
        else if (chance < 1) rarityClass = 'epic';
        else if (chance < 10) rarityClass = 'rare';

        const stars = Math.round(g.price * TON_TO_STARS);
        const lottieUrl = getGiftLottie(g.name, g.price);
        const itemId = 'item-' + Math.random().toString(36).substr(2, 9);

        return `
            <div class="content-item" data-item-id="${itemId}" data-lottie="${lottieUrl || ''}" onmouseenter="playLottie(this)" onmouseleave="stopLottie(this)">
                <div class="content-item-name">${g.name}</div>
                <div class="content-item-media">
                    <img src="${getGiftImage(g.name, g.price)}" alt="" onerror="this.onerror=null;this.src='${GIFT_FALLBACK}'">
                    <div class="lottie-box"></div>
                </div>
                <div class="content-price"><img src="${STAR_ICON}" alt=""> ${formatStars(stars)}</div>
                <div class="content-chance ${rarityClass}">Шанс: ${chanceStr}%</div>
            </div>
        `;
    }).join('');

    updateOpenButton();
}

/* ═══════════ LOTTIE (в списке содержимого) ═══════════ */
const lottieInstances = {};

function playLottie(el) {
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

/* ═══════════ КНОПКА ═══════════ */
function updateOpenButton() {
    const btn = $('openBtn');
    if (!btn || !currentCase) return;
    const cost = Math.round(currentCase.price * TON_TO_STARS * selectedQty);
    if (userStars < cost) {
        btn.classList.add('insufficient');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18.36 5.64l-12.72 12.72"/><path d="M5.64 5.64l12.72 12.72"/></svg> Недостаточно звёзд`;
    } else {
        btn.classList.remove('insufficient');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"></path></svg> Открыть кейс`;
    }
}

/* ═══════════ ОТКРЫТИЕ ═══════════ */
function openCase() {
    if (!currentCase || isOpening) return;
    const totalStars = Math.round(currentCase.price * TON_TO_STARS * selectedQty);
    if (userStars < totalStars) { showToast('Недостаточно звёзд', 'err'); return; }

    isOpening = true;
    document.querySelectorAll('.qty-btn').forEach(b => b.classList.add('locked'));
    $('openBtn').disabled = true;

    const wonGifts = [];
    for (let i = 0; i < selectedQty; i++) {
        wonGifts.push(pickRandomGift(getFullItems(currentCase)));
    }

    userStars -= totalStars;
    localStorage.setItem('userStars', userStars.toString());
    updateBalance();
    runSpinRoulette(wonGifts);
}

function pickRandomGift(items) {
    const total = items.reduce((s, g) => s + g.chance, 0);
    let r = Math.random() * total;
    for (const g of items) { r -= g.chance; if (r <= 0) return g; }
    return items[0];
}

/* ═══════════ ПРОКРУТ ═══════════ */
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
        const stars = Math.round(g.price * TON_TO_STARS);
        return `
            <div class="roulette-item">
                <div class="ri-price"><img src="${STAR_ICON}" alt="">${formatStars(stars)}</div>
                <img class="ri-img" src="${getGiftImage(g.name, g.price)}" alt="" onerror="this.onerror=null;this.src='${GIFT_FALLBACK}'">
            </div>
        `;
    }).join('');

    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';
    void track.offsetWidth;

    requestAnimationFrame(() => {
        const itemWidth = 118;
        const wrap = $('rouletteWrap');
        const centerOffset = wrap.offsetWidth / 2;
        const targetPos = itemWidth * 42 + itemWidth / 2;
        track.style.transition = 'transform 7s cubic-bezier(0.25, 0.1, 0.25, 1)';
        track.style.transform = `translateX(${centerOffset - targetPos}px)`;
    });

    let spinVibCount = 0;
    const spinVibInterval = setInterval(() => { vibrate('light'); spinVibCount++; if (spinVibCount > 12) clearInterval(spinVibInterval); }, 500);

    const onTransitionEnd = (e) => {
        if (e.propertyName !== 'transform') return;
        track.removeEventListener('transitionend', onTransitionEnd);
        clearInterval(spinVibInterval);
        vibrate('success');
        setTimeout(() => showWinResultInModal(giftsArr), 400);
    };
    track.addEventListener('transitionend', onTransitionEnd);

    setTimeout(() => {
        if (isOpening) { clearInterval(spinVibInterval); showWinResultInModal(giftsArr); }
    }, 8500);
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
            const stars = Math.round(g.price * TON_TO_STARS);
            return `
                <div class="roulette-item">
                    <div class="ri-price"><img src="${STAR_ICON}" alt="">${formatStars(stars)}</div>
                    <img class="ri-img" src="${getGiftImage(g.name, g.price)}" alt="" onerror="this.onerror=null;this.src='${GIFT_FALLBACK}'">
                </div>
            `;
        }).join('');

        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';

        const delay = idx * 400;
        const duration = 6500 + idx * 500;

        setTimeout(() => {
            requestAnimationFrame(() => {
                const itemWidth = 118;
                const centerOffset = row.offsetWidth / 2;
                const targetPos = itemWidth * 42 + itemWidth / 2;
                track.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
                track.style.transform = `translateX(${centerOffset - targetPos}px)`;
            });
        }, delay);
    });

    let vc = 0;
    const vi = setInterval(() => { vibrate('light'); vc++; if (vc > 12) clearInterval(vi); }, 500);
    const totalTime = 6500 + (count - 1) * 500 + 400;

    setTimeout(() => { clearInterval(vi); vibrate('success'); showWinResultInModal(wonGifts); }, totalTime);
}

/* ═══════════ ПОБЕДА ═══════════ */
function showWinResultInModal(giftsArr) {
    $('rouletteWrap').classList.add('won');
    $('openBtnWrap').style.display = 'none';
    $('contentsSection').style.display = 'none';
    $('qtyRow').style.display = 'none';

    // Убиваем прошлую Lottie (если была)
    destroyWinLottie();

    if (giftsArr.length > 1) {
        // Мультивыигрыш — статичные картинки, без Lottie
        const totalStars = giftsArr.reduce((s, g) => s + Math.round(g.price * TON_TO_STARS), 0);
        $('modalWin').innerHTML = `
            <div style="text-align:center;padding:10px 0;">
                <div style="font-size:14px;color:#4ADE80;margin-bottom:12px;">Вы выиграли ${giftsArr.length} подарков!</div>
                <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:12px;">
                    ${giftsArr.map(g => `
                        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:8px;width:80px;text-align:center;">
                            <img src="${getGiftImage(g.name, g.price)}" style="width:50px;height:50px;object-fit:contain;" onerror="this.onerror=null;this.src='${GIFT_FALLBACK}'">
                            <div style="font-size:11px;color:var(--star);margin-top:4px;font-weight:800;">${formatStars(Math.round(g.price * TON_TO_STARS))}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="color:var(--star);font-size:16px;font-weight:800;">Итого: ${formatStars(totalStars)}</div>
                <div style="display:flex;gap:8px;justify-content:center;margin-top:16px;">
                    <button onclick="openAgain()" style="flex:1;max-width:140px;padding:10px;background:#3b82f6;border:none;border-radius:10px;color:white;font-size:14px;cursor:pointer;">Ещё раз</button>
                    <button onclick="closeModalAndReset()" style="flex:1;max-width:140px;padding:10px;background:rgba(255,255,255,0.08);border:none;border-radius:10px;color:white;font-size:14px;cursor:pointer;">Закрыть</button>
                </div>
            </div>
        `;
    } else {
        // Одиночный выигрыш — показываем Lottie (если есть), иначе статичную картинку
        const gift = giftsArr[0];
        const lottieUrl = getGiftLottie(gift.name, gift.price);

        // Собираем HTML с контейнером под Lottie
        $('modalWin').innerHTML = `
            <div class="modal-win-badge">Вы выиграли!</div>
            <div class="modal-win-media" id="modalWinMedia">
                <img class="modal-win-img" id="modalWinImg" src="${getGiftImage(gift.name, gift.price)}" alt="" onerror="this.onerror=null;this.src='${GIFT_FALLBACK}'">
            </div>
            <div class="modal-win-name" id="modalWinName">${escapeHtml(gift.name)}</div>
            <div class="modal-win-value">
                <img src="${STAR_ICON}" alt=""><span>${formatStars(Math.round(gift.price * TON_TO_STARS))}</span>
            </div>
            <div class="modal-win-btns">
                <button class="modal-win-btn" onclick="closeModalAndReset()">Закрыть</button>
                <button class="modal-win-btn primary" onclick="openAgain()">Ещё раз</button>
            </div>
        `;

        // Если у предмета есть Lottie — запускаем анимацию поверх картинки
        if (lottieUrl) {
            playWinLottie(lottieUrl, gift);
        }
    }

    $('modalWin').style.display = 'block';
    giftsArr.forEach(gift => saveWinToInventory(gift));
    setOpening(false);
}

/* ═══════════ LOTTIE В МОДАЛКЕ ПОБЕДЫ ═══════════ */
function playWinLottie(url, gift) {
    const media = $('modalWinMedia');
    if (!media) return;

    // Проверяем, что JSON доступен
    fetch(url, { method: 'HEAD' })
        .then(r => {
            if (!r.ok) return; // оставляем статичную картинку
            const img = $('modalWinImg');
            if (img) img.style.visibility = 'hidden'; // прячем img, но оставляем место

            // Создаём контейнер под Lottie
            const box = document.createElement('div');
            box.className = 'modal-win-lottie';
            media.appendChild(box);

            winLottieInstance = lottie.loadAnimation({
                container: box,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: url
            });
        })
        .catch(() => { /* оставляем статичную картинку */ });
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

/* ═══════════ СОХРАНЕНИЕ В ИНВЕНТАРЬ ═══════════ */
function saveWinToInventory(gift) {
    const STORAGE_KEY = 'userInventory';
    let inventory = [];
    try {
        inventory = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (!Array.isArray(inventory)) inventory = [];
    } catch (e) { inventory = []; }

    const stars = Math.round(gift.price * TON_TO_STARS);
    const minPrice = MIN_PRICES[gift.name] || 0;
    const finalStars = Math.max(stars, minPrice);

    inventory.push({
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: gift.name,
        price: gift.price,
        stars: finalStars,
        image: getGiftImage(gift.name, gift.price),
        timestamp: Date.now()
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

/* ═══════════ МОДАЛКА ═══════════ */
function closeModalAndReset() {
    destroyWinLottie();
    closeModal();
}

function openAgain() {
    destroyWinLottie();
    if (!currentCase) return;
    $('modalWin').innerHTML = '';
    $('modalWin').style.display = 'none';
    renderModal();
}

function closeModal() {
    destroyWinLottie();
    $('caseModal').classList.remove('open');
    currentCase = null;
}

$('caseModal') && $('caseModal').addEventListener('click', e => {
    if (e.target === $('caseModal')) closeModal();
});

function setOpening(v) {
    isOpening = v;
    if (!v) {
        document.querySelectorAll('.qty-btn').forEach(b => b.classList.remove('locked'));
        const btn = $('openBtn');
        if (btn) btn.disabled = false;
    }
}

/* ═══════════ УТИЛИТЫ ═══════════ */
function formatStars(stars) { return Math.round(stars).toLocaleString('ru-RU'); }

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}

function vibrate(style) {
    try {
        if (navigator.vibrate) navigator.vibrate(style === 'success' ? [30,20,50] : style === 'warning' ? [60,30,60] : 15);
    } catch(e) {}
}

function showToast(msg, type = 'ok') {
    const toast = $('toast');
    toast.textContent = msg;
    toast.className = 'toast show ' + type;
    setTimeout(() => toast.classList.remove('show'), 2500);
}

window.openCaseModal = openCaseModal;
window.setQty = setQty;
window.openCase = openCase;
window.closeModalAndReset = closeModalAndReset;
window.openAgain = openAgain;
window.closeModal = closeModal;
window.playLottie = playLottie;
window.stopLottie = stopLottie;