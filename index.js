/* ═══════════ КОНСТАНТЫ ═══════════ */
const $ = id => document.getElementById(id);
const TON_TO_STARS = 125;
const STAR_ICON = 'star.png';
const GIFT_FALLBACK = 'star.png';

/* ═══════════════════════════════════════════════════════════
 * МИНИМАЛЬНЫЕ ЦЕНЫ ФИКСИРОВАННЫХ ПРЕДМЕТОВ (в звёздах)
 * Ниже этих цен предмет не может стоить
 * ═══════════════════════════════════════════════════════════ */
const MIN_PRICES = {
    'Bear': 15,
    'Gift': 25,
    'Cake': 50,
    'Trophy': 100
};

/* ═══════════ КАРТИНКИ ═══════════ */
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

/* ═══════════════════════════════════════════════════════════
 * КЕЙСЫ
 * Цены предметов в TON. Bear/Gift/Cake — не ниже минимума.
 * Bear минимум 0.12 TON (15⭐)
 * Gift минимум 0.20 TON (25⭐)
 * Cake минимум 0.40 TON (50⭐)
 * Trophy минимум 0.80 TON (100⭐)
 * ═══════════════════════════════════════════════════════════ */
const CASES = [
    {
        id: 1, name: 'Starter Case', price: 0.35, color: 'g-dark',
        cheapPool: [
            { name: 'Bear', price: 0.12, chance: 15 },   // 15⭐ — минимум
            { name: 'Gift', price: 0.20, chance: 10 }    // 25⭐ — минимум
        ],
        items: [
            { name: 'Cake', price: 0.40, chance: 55 },   // 50⭐ — минимум
            { name: 'Jester Hat', price: 3.97, chance: 2.4 },
            { name: 'Lol Pop', price: 3.99, chance: 0.5 },
            { name: 'Fine Pen', price: 8.77, chance: 0.1 }
        ]
    },
    {
        id: 2, name: 'Sweet Case', price: 1, color: 'g-red',
        cheapPool: [
            { name: 'Bear', price: 0.12, chance: 15 },    // 15⭐ ✓
            { name: 'Gift', price: 0.20, chance: 10 }     // 25⭐ ✓
        ],
        items: [
            { name: 'Cake', price: 0.40, chance: 50 },    // 50⭐ ✓
            { name: 'Happy Brownie', price: 4.34, chance: 2.6 },
            { name: 'Ginger Cookie', price: 4.23, chance: 0.3 },
            { name: 'Cookie Heart', price: 4.71, chance: 0.1 }
        ]
    },
    {
        id: 3, name: 'Xmas Case', price: 2, color: 'g-green',
        cheapPool: [
            { name: 'Gift', price: 0.20, chance: 12 },    // 25⭐ ✓
            { name: 'Cake', price: 0.40, chance: 10 }     // 50⭐ ✓
        ],
        items: [
            { name: 'Xmas Stocking', price: 3.97, chance: 30 },
            { name: 'Santa Hat', price: 4.11, chance: 25 },
            { name: 'Snow Mittens', price: 4.54, chance: 15 },
            { name: 'Snow Globe', price: 4.65, chance: 3 },
            { name: 'Sleigh Bell', price: 6.84, chance: 1.5 },
            { name: 'Jingle Bells', price: 8.05, chance: 0.5 }
        ]
    },
    {
        id: 4, name: 'Love Case', price: 3, color: 'g-pink',
        cheapPool: [
            { name: 'Cake', price: 0.40, chance: 12 },       // 50⭐ ✓
            { name: 'Cookie Heart', price: 0.96, chance: 8 } // 120⭐ ✓
        ],
        items: [
            { name: 'Love Candle', price: 9.49, chance: 30 },
            { name: 'Valentine Box', price: 11.22, chance: 25 },
            { name: 'Love Potion', price: 14.44, chance: 15 },
            { name: 'Trapped Heart', price: 15.34, chance: 6 },
            { name: 'Eternal Rose', price: 25.18, chance: 2.5 },
            { name: 'Cupid Charm', price: 21.68, chance: 1.5 }
        ]
    },
    {
        id: 5, name: 'Halloween Case', price: 5, color: 'g-orange',
        cheapPool: [
            { name: 'Cake', price: 0.40, chance: 10 },       // 50⭐ ✓
            { name: 'Cookie Heart', price: 0.96, chance: 8 } // 120⭐ ✓
        ],
        items: [
            { name: 'Evil Eye', price: 7.45, chance: 35 },
            { name: 'Skull Flower', price: 11, chance: 20 },
            { name: 'Mad Pumpkin', price: 12.51, chance: 12 },
            { name: 'Electric Skull', price: 24.96, chance: 8 },
            { name: 'Voodoo Doll', price: 34.68, chance: 4 },
            { name: 'Scared Cat', price: 229.49, chance: 0.8 }
        ]
    },
    {
        id: 6, name: 'Magic Case', price: 7, color: 'g-purple',
        cheapPool: [
            { name: 'Cookie Heart', price: 0.96, chance: 10 },  // 120⭐ ✓
            { name: 'Jester Hat', price: 1.60, chance: 8 }      // 200⭐ ✓
        ],
        items: [
            { name: 'Hex Pot', price: 4.35, chance: 30 },
            { name: 'Witch Hat', price: 4.88, chance: 25 },
            { name: 'Spy Agaric', price: 5.51, chance: 15 },
            { name: 'Flying Broom', price: 12, chance: 7 },
            { name: 'Crystal Ball', price: 12.24, chance: 4 },
            { name: 'Genie Lamp', price: 33.14, chance: 0.7 },
            { name: 'Magic Potion', price: 54.09, chance: 0.3 }
        ]
    },
    {
        id: 7, name: 'Animal Case', price: 10, color: 'g-dark',
        cheapPool: [
            { name: 'Jester Hat', price: 1.60, chance: 10 },     // 200⭐ ✓
            { name: 'Happy Brownie', price: 2.80, chance: 8 }    // 350⭐ ✓
        ],
        items: [
            { name: 'Snake Box', price: 3.97, chance: 30 },
            { name: 'Pet Snake', price: 4.05, chance: 25 },
            { name: 'Lunar Snake', price: 3.92, chance: 20 },
            { name: 'Jolly Chimp', price: 6.92, chance: 12 },
            { name: 'Rare Bird', price: 24.21, chance: 3.5 },
            { name: 'Toy Bear', price: 35.96, chance: 1 },
            { name: 'Kissed Frog', price: 36.7, chance: 0.4 },
            { name: 'Scared Cat', price: 229.49, chance: 0.1 }
        ]
    },
    {
        id: 8, name: 'Gaming Case', price: 15, color: 'g-yellow',
        cheapPool: [
            { name: 'Happy Brownie', price: 2.80, chance: 10 },  // 350⭐ ✓
            { name: 'Xmas Stocking', price: 3.50, chance: 8 }    // 437⭐ ✓
        ],
        items: [
            { name: 'Tama Gadget', price: 4.01, chance: 25 },
            { name: 'Jack-in-the-Box', price: 4.39, chance: 22 },
            { name: 'Light Sword', price: 6.09, chance: 18 },
            { name: 'Input Key', price: 6.16, chance: 12 },
            { name: 'Surge Board', price: 6.82, chance: 3 },
            { name: 'Record Player', price: 12.64, chance: 1.5 },
            { name: 'Perfume Bottle', price: 71.2, chance: 0.4 },
            { name: 'Mini Oscar', price: 72.7, chance: 0.1 }
        ]
    },
    {
        id: 9, name: 'Gem Case', price: 20, color: 'g-yellow',
        cheapPool: [
            { name: 'Xmas Stocking', price: 3.50, chance: 10 },  // 437⭐ ✓
            { name: 'Happy Brownie', price: 5.60, chance: 8 }    // 700⭐ ✓
        ],
        items: [
            { name: 'Diamond Ring', price: 30.43, chance: 30 },
            { name: 'Signet Ring', price: 32.11, chance: 22 },
            { name: 'Bonded Ring', price: 39.97, chance: 15 },
            { name: 'Gem Signet', price: 61.19, chance: 8 },
            { name: 'Ion Gem', price: 71.4, chance: 4.5 },
            { name: 'Nail Bracelet', price: 113.87, chance: 2 },
            { name: 'Astral Shard', price: 115.25, chance: 0.4 },
            { name: 'Loot Bag', price: 120.68, chance: 0.1 }
        ]
    },
    {
        id: 10, name: 'Royal Case', price: 150, color: 'g-green',
        cheapPool: [
            { name: 'Trophy', price: 0.80, chance: 10 },      // 100⭐ — минимум Trophy ✓
            { name: 'Fine Pen', price: 8.77, chance: 8 }      // 1096⭐ ✓
        ],
        items: [
            { name: 'Mighty Arm', price: 112.2, chance: 30 },
            { name: 'Nail Bracelet', price: 113.87, chance: 22 },
            { name: 'Astral Shard', price: 115.25, chance: 15 },
            { name: 'Loot Bag', price: 120.68, chance: 7 },
            { name: 'Westside Sign', price: 98.81, chance: 1.5 },
            { name: "Durov's Glasses", price: 94.39, chance: 0.4 },
            { name: 'Plush Pepe', price: 6630, chance: 0.1 }
        ]
    }
];

/* ═══════════ СОСТОЯНИЕ ═══════════ */
let currentCase = null;
let userId = null;
let userName = null;
let userStars = 12500;
let selectedQty = 1;
let isOpening = false;

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

    $('contentsGrid').innerHTML = gifts.map(g => {
        const chance = g.chance || 0;
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

/* ═══════════ LOTTIE ═══════════ */
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

    if (giftsArr.length > 1) {
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
        const gift = giftsArr[0];
        $('modalWinImg').src = getGiftImage(gift.name, gift.price);
        $('modalWinImg').onerror = function() { this.onerror = null; this.src = GIFT_FALLBACK; };
        $('modalWinName').textContent = gift.name;
        $('modalWinValue').querySelector('span').textContent = formatStars(Math.round(gift.price * TON_TO_STARS));
    }

    $('modalWin').style.display = 'block';
    giftsArr.forEach(gift => saveWinToInventory(gift));
    setOpening(false);
}

/* ═══════════ СОХРАНЕНИЕ В ИНВЕНТАРЬ ═══════════ */
function saveWinToInventory(gift) {
    const STORAGE_KEY = 'userInventory';
    let inventory = [];
    try {
        inventory = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (!Array.isArray(inventory)) inventory = [];
    } catch (e) { inventory = []; }

    /* Проверяем минимальную цену */
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
function closeModalAndReset() { closeModal(); }

function openAgain() {
    if (!currentCase) return;
    $('modalWin').innerHTML = `
        <div class="modal-win-badge">Вы выиграли!</div>
        <img class="modal-win-img" id="modalWinImg" src="${GIFT_FALLBACK}">
        <div class="modal-win-name" id="modalWinName"></div>
        <div class="modal-win-value" id="modalWinValue">
            <img src="${STAR_ICON}" alt=""><span>0</span>
        </div>
        <div class="modal-win-btns">
            <button class="modal-win-btn" onclick="closeModalAndReset()">Закрыть</button>
            <button class="modal-win-btn primary" onclick="openAgain()">Ещё раз</button>
        </div>
    `;
    $('modalWin').style.display = 'none';
    renderModal();
}

function closeModal() {
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