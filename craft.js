const $ = id => document.getElementById(id);
const STAR_ICON = 'star.png';
const GIFT_FALLBACK = 'star.png';
const MAX_SLOTS = 9;

/* ═══════════════════════════════════════════════════════════
 * ПОЛНЫЙ СПИСОК ПРЕДМЕТОВ (цены в звёздах, 1 TON = 125⭐)
 * ═══════════════════════════════════════════════════════════ */
const GIFTS = [
    { name: 'Fine Pen', price: 1096, image: 'https://cdn.changes.tg/gifts/models/Fine%20Pen/png/Original.png' },
    { name: 'Algorithm Cup', price: 312375, image: 'https://cdn.changes.tg/gifts/models/Algorithm%20Cup/png/Original.png' },
    { name: 'Intelligence Cup', price: 298350, image: 'https://cdn.changes.tg/gifts/models/Intelligence%20Cup/png/Original.png' },
    { name: 'Astral Shard', price: 14649, image: 'https://cdn.changes.tg/gifts/models/Astral%20Shard/png/Original.png' },
    { name: 'B-Day Candle', price: 599, image: 'https://cdn.changes.tg/gifts/models/B-Day%20Candle/png/Original.png' },
    { name: 'Berry Box', price: 1073, image: 'https://cdn.changes.tg/gifts/models/Berry%20Box/png/Original.png' },
    { name: 'Big Year', price: 500, image: 'https://cdn.changes.tg/gifts/models/Big%20Year/png/Original.png' },
    { name: 'Bonded Ring', price: 5049, image: 'https://cdn.changes.tg/gifts/models/Bonded%20Ring/png/Original.png' },
    { name: 'Bow Tie', price: 613, image: 'https://cdn.changes.tg/gifts/models/Bow%20Tie/png/Original.png' },
    { name: 'Bunny Muffin', price: 973, image: 'https://cdn.changes.tg/gifts/models/Bunny%20Muffin/png/Original.png' },
    { name: 'Candy Cane', price: 501, image: 'https://cdn.changes.tg/gifts/models/Candy%20Cane/png/Original.png' },
    { name: 'Cookie Heart', price: 586, image: 'https://cdn.changes.tg/gifts/models/Cookie%20Heart/png/Original.png' },
    { name: 'Crystal Ball', price: 1506, image: 'https://cdn.changes.tg/gifts/models/Crystal%20Ball/png/Original.png' },
    { name: 'Desk Calendar', price: 574, image: 'https://cdn.changes.tg/gifts/models/Desk%20Calendar/png/Original.png' },
    { name: 'Diamond Ring', price: 3825, image: 'https://cdn.changes.tg/gifts/models/Diamond%20Ring/png/Original.png' },
    { name: "Durov's Cap", price: 49725, image: "https://cdn.changes.tg/gifts/models/Durov's%20Cap/png/Original.png" },
    { name: 'Easter Egg', price: 534, image: 'https://cdn.changes.tg/gifts/models/Easter%20Egg/png/Original.png' },
    { name: 'Electric Skull', price: 3118, image: 'https://cdn.changes.tg/gifts/models/Electric%20Skull/png/Original.png' },
    { name: 'Eternal Candle', price: 738, image: 'https://cdn.changes.tg/gifts/models/Eternal%20Candle/png/Original.png' },
    { name: 'Eternal Rose', price: 3148, image: 'https://cdn.changes.tg/gifts/models/Eternal%20Rose/png/Original.png' },
    { name: 'Evil Eye', price: 931, image: 'https://cdn.changes.tg/gifts/models/Evil%20Eye/png/Original.png' },
    { name: 'Flying Broom', price: 1495, image: 'https://cdn.changes.tg/gifts/models/Flying%20Broom/png/Original.png' },
    { name: 'Gem Signet', price: 7649, image: 'https://cdn.changes.tg/gifts/models/Gem%20Signet/png/Original.png' },
    { name: 'Genie Lamp', price: 4154, image: 'https://cdn.changes.tg/gifts/models/Genie%20Lamp/png/Original.png' },
    { name: 'Ginger Cookie', price: 530, image: 'https://cdn.changes.tg/gifts/models/Ginger%20Cookie/png/Original.png' },
    { name: 'Hanging Star', price: 1134, image: 'https://cdn.changes.tg/gifts/models/Hanging%20Star/png/Original.png' },
    { name: 'Heart Locket', price: 139613, image: 'https://cdn.changes.tg/gifts/models/Heart%20Locket/png/Original.png' },
    { name: 'Heroic Helmet', price: 22494, image: 'https://cdn.changes.tg/gifts/models/Heroic%20Helmet/png/Original.png' },
    { name: 'Hex Pot', price: 549, image: 'https://cdn.changes.tg/gifts/models/Hex%20Pot/png/Original.png' },
    { name: 'Holiday Drink', price: 501, image: 'https://cdn.changes.tg/gifts/models/Holiday%20Drink/png/Original.png' },
    { name: 'Homemade Cake', price: 588, image: 'https://cdn.changes.tg/gifts/models/Homemade%20Cake/png/Original.png' },
    { name: 'Hypno Lollipop', price: 505, image: 'https://cdn.changes.tg/gifts/models/Hypno%20Lollipop/png/Original.png' },
    { name: 'Ion Gem', price: 8925, image: 'https://cdn.changes.tg/gifts/models/Ion%20Gem/png/Original.png' },
    { name: 'Jack-in-the-Box', price: 549, image: 'https://cdn.changes.tg/gifts/models/Jack-in-the-Box/png/Original.png' },
    { name: 'Jelly Bunny', price: 981, image: 'https://cdn.changes.tg/gifts/models/Jelly%20Bunny/png/Original.png' },
    { name: 'Jester Hat', price: 504, image: 'https://cdn.changes.tg/gifts/models/Jester%20Hat/png/Original.png' },
    { name: 'Jingle Bells', price: 1008, image: 'https://cdn.changes.tg/gifts/models/Jingle%20Bells/png/Original.png' },
    { name: 'Kissed Frog', price: 4653, image: 'https://cdn.changes.tg/gifts/models/Kissed%20Frog/png/Original.png' },
    { name: 'Light Sword', price: 763, image: 'https://cdn.changes.tg/gifts/models/Light%20Sword/png/Original.png' },
    { name: 'Lol Pop', price: 493, image: 'https://cdn.changes.tg/gifts/models/Lol%20Pop/png/Original.png' },
    { name: 'Loot Bag', price: 15159, image: 'https://cdn.changes.tg/gifts/models/Loot%20Bag/png/Original.png' },
    { name: 'Love Candle', price: 1186, image: 'https://cdn.changes.tg/gifts/models/Love%20Candle/png/Original.png' },
    { name: 'Love Potion', price: 1806, image: 'https://cdn.changes.tg/gifts/models/Love%20Potion/png/Original.png' },
    { name: 'Lunar Snake', price: 500, image: 'https://cdn.changes.tg/gifts/models/Lunar%20Snake/png/Original.png' },
    { name: 'Lush Bouquet', price: 726, image: 'https://cdn.changes.tg/gifts/models/Lush%20Bouquet/png/Original.png' },
    { name: 'Mad Pumpkin', price: 1558, image: 'https://cdn.changes.tg/gifts/models/Mad%20Pumpkin/png/Original.png' },
    { name: 'Magic Potion', price: 6761, image: 'https://cdn.changes.tg/gifts/models/Magic%20Potion/png/Original.png' },
    { name: 'Mini Oscar', price: 9180, image: 'https://cdn.changes.tg/gifts/models/Mini%20Oscar/png/Original.png' },
    { name: 'Nail Bracelet', price: 14334, image: 'https://cdn.changes.tg/gifts/models/Nail%20Bracelet/png/Original.png' },
    { name: 'Neko Helmet', price: 4690, image: 'https://cdn.changes.tg/gifts/models/Neko%20Helmet/png/Original.png' },
    { name: 'Party Sparkler', price: 536, image: 'https://cdn.changes.tg/gifts/models/Party%20Sparkler/png/Original.png' },
    { name: 'Perfume Bottle', price: 9295, image: 'https://cdn.changes.tg/gifts/models/Perfume%20Bottle/png/Original.png' },
    { name: 'Pet Snake', price: 506, image: 'https://cdn.changes.tg/gifts/models/Pet%20Snake/png/Original.png' },
    { name: 'Plush Pepe', price: 828750, image: 'https://cdn.changes.tg/gifts/models/Plush%20Pepe/png/Original.png' },
    { name: 'Precious Peach', price: 31874, image: 'https://cdn.changes.tg/gifts/models/Precious%20Peach/png/Original.png' },
    { name: 'Record Player', price: 1578, image: 'https://cdn.changes.tg/gifts/models/Record%20Player/png/Original.png' },
    { name: 'Restless Jar', price: 666, image: 'https://cdn.changes.tg/gifts/models/Restless%20Jar/png/Original.png' },
    { name: 'Sakura Flower', price: 1234, image: 'https://cdn.changes.tg/gifts/models/Sakura%20Flower/png/Original.png' },
    { name: 'Santa Hat', price: 514, image: 'https://cdn.changes.tg/gifts/models/Santa%20Hat/png/Original.png' },
    { name: 'Scared Cat', price: 28681, image: 'https://cdn.changes.tg/gifts/models/Scared%20Cat/png/Original.png' },
    { name: 'Sharp Tongue', price: 5481, image: 'https://cdn.changes.tg/gifts/models/Sharp%20Tongue/png/Original.png' },
    { name: 'Signet Ring', price: 4078, image: 'https://cdn.changes.tg/gifts/models/Signet%20Ring/png/Original.png' },
    { name: 'Skull Flower', price: 1396, image: 'https://cdn.changes.tg/gifts/models/Skull%20Flower/png/Original.png' },
    { name: 'Sleigh Bell', price: 864, image: 'https://cdn.changes.tg/gifts/models/Sleigh%20Bell/png/Original.png' },
    { name: 'Snake Box', price: 499, image: 'https://cdn.changes.tg/gifts/models/Snake%20Box/png/Original.png' },
    { name: 'Snow Globe', price: 573, image: 'https://cdn.changes.tg/gifts/models/Snow%20Globe/png/Original.png' },
    { name: 'Snow Mittens', price: 560, image: 'https://cdn.changes.tg/gifts/models/Snow%20Mittens/png/Original.png' },
    { name: 'Spiced Wine', price: 545, image: 'https://cdn.changes.tg/gifts/models/Spiced%20Wine/png/Original.png' },
    { name: 'Spy Agaric', price: 690, image: 'https://cdn.changes.tg/gifts/models/Spy%20Agaric/png/Original.png' },
    { name: 'Star Notepad', price: 545, image: 'https://cdn.changes.tg/gifts/models/Star%20Notepad/png/Original.png' },
    { name: 'Swiss Watch', price: 6146, image: 'https://cdn.changes.tg/gifts/models/Swiss%20Watch/png/Original.png' },
    { name: 'Tama Gadget', price: 503, image: 'https://cdn.changes.tg/gifts/models/Tama%20Gadget/png/Original.png' },
    { name: 'Top Hat', price: 1273, image: 'https://cdn.changes.tg/gifts/models/Top%20Hat/png/Original.png' },
    { name: 'Toy Bear', price: 4495, image: 'https://cdn.changes.tg/gifts/models/Toy%20Bear/png/Original.png' },
    { name: 'Trapped Heart', price: 1900, image: 'https://cdn.changes.tg/gifts/models/Trapped%20Heart/png/Original.png' },
    { name: 'Vintage Cigar', price: 4576, image: 'https://cdn.changes.tg/gifts/models/Vintage%20Cigar/png/Original.png' },
    { name: 'Voodoo Doll', price: 4393, image: 'https://cdn.changes.tg/gifts/models/Voodoo%20Doll/png/Original.png' },
    { name: 'Winter Wreath', price: 501, image: 'https://cdn.changes.tg/gifts/models/Winter%20Wreath/png/Original.png' },
    { name: 'Witch Hat', price: 608, image: 'https://cdn.changes.tg/gifts/models/Witch%20Hat/png/Original.png' },
    { name: 'Xmas Stocking', price: 490, image: 'https://cdn.changes.tg/gifts/models/Xmas%20Stocking/png/Original.png' },
    { name: 'Cupid Charm', price: 2699, image: 'https://cdn.changes.tg/gifts/models/Cupid%20Charm/png/Original.png' },
    { name: 'Whip Cupcake', price: 548, image: 'https://cdn.changes.tg/gifts/models/Whip%20Cupcake/png/Original.png' },
    { name: 'Valentine Box', price: 1441, image: 'https://cdn.changes.tg/gifts/models/Valentine%20Box/png/Original.png' },
    { name: 'Joyful Bundle', price: 948, image: 'https://cdn.changes.tg/gifts/models/Joyful%20Bundle/png/Original.png' },
    { name: 'Low Rider', price: 6776, image: 'https://cdn.changes.tg/gifts/models/Low%20Rider/png/Original.png' },
    { name: 'Westside Sign', price: 12354, image: 'https://cdn.changes.tg/gifts/models/Westside%20Sign/png/Original.png' },
    { name: 'Snoop Cigar', price: 1839, image: 'https://cdn.changes.tg/gifts/models/Snoop%20Cigar/png/Original.png' },
    { name: 'Swag Bag', price: 688, image: 'https://cdn.changes.tg/gifts/models/Swag%20Bag/png/Original.png' },
    { name: 'Snoop Dogg', price: 658, image: 'https://cdn.changes.tg/gifts/models/Snoop%20Dogg/png/Original.png' },
    { name: 'Ionic Dryer', price: 1831, image: 'https://cdn.changes.tg/gifts/models/Ionic%20Dryer/png/Original.png' },
    { name: 'Jolly Chimp', price: 879, image: 'https://cdn.changes.tg/gifts/models/Jolly%20Chimp/png/Original.png' },
    { name: 'Moon Pendant', price: 775, image: 'https://cdn.changes.tg/gifts/models/Moon%20Pendant/png/Original.png' },
    { name: 'Stellar Rocket', price: 606, image: 'https://cdn.changes.tg/gifts/models/Stellar%20Rocket/png/Original.png' },
    { name: 'Artisan Brick', price: 7523, image: 'https://cdn.changes.tg/gifts/models/Artisan%20Brick/png/Original.png' },
    { name: 'Input Key', price: 779, image: 'https://cdn.changes.tg/gifts/models/Input%20Key/png/Original.png' },
    { name: 'Mighty Arm', price: 14375, image: 'https://cdn.changes.tg/gifts/models/Mighty%20Arm/png/Original.png' },
    { name: 'Fresh Socks', price: 544, image: 'https://cdn.changes.tg/gifts/models/Fresh%20Socks/png/Original.png' },
    { name: 'Clover Pin', price: 600, image: 'https://cdn.changes.tg/gifts/models/Clover%20Pin/png/Original.png' },
    { name: 'Sky Stilettos', price: 2423, image: 'https://cdn.changes.tg/gifts/models/Sky%20Stilettos/png/Original.png' },
    { name: 'Faith Amulet', price: 668, image: 'https://cdn.changes.tg/gifts/models/Faith%20Amulet/png/Original.png' },
    { name: 'Happy Brownie', price: 543, image: 'https://cdn.changes.tg/gifts/models/Happy%20Brownie/png/Original.png' },
    { name: 'Ice Cream', price: 545, image: 'https://cdn.changes.tg/gifts/models/Ice%20Cream/png/Original.png' },
    { name: 'Instant Ramen', price: 524, image: 'https://cdn.changes.tg/gifts/models/Instant%20Ramen/png/Original.png' },
    { name: 'Mousse Cake', price: 564, image: 'https://cdn.changes.tg/gifts/models/Mousse%20Cake/png/Original.png' },
    { name: 'Spring Basket', price: 665, image: 'https://cdn.changes.tg/gifts/models/Spring%20Basket/png/Original.png' },
    { name: "Durov's Boots", price: 8531, image: "https://cdn.changes.tg/gifts/models/Durov's%20Boots/png/Original.png" },
    { name: "Durov's Coat", price: 10375, image: "https://cdn.changes.tg/gifts/models/Durov's%20Coat/png/Original.png" },
    { name: "Durov's Figurine", price: 152906, image: "https://cdn.changes.tg/gifts/models/Durov's%20Figurine/png/Original.png" },
    { name: 'Mask', price: 823, image: 'https://cdn.changes.tg/gifts/models/Mask/png/Original.png' },
    { name: 'Bling Binky', price: 2931, image: 'https://cdn.changes.tg/gifts/models/Bling%20Binky/png/Original.png' },
    { name: 'Money Pot', price: 555, image: 'https://cdn.changes.tg/gifts/models/Money%20Pot/png/Original.png' },
    { name: 'Pretty Posy', price: 588, image: 'https://cdn.changes.tg/gifts/models/Pretty%20Posy/png/Original.png' },
    { name: 'Airplane', price: 787500, image: 'https://cdn.changes.tg/gifts/models/Airplane/png/Original.png' },
    { name: "Khabib's Papakha", price: 24250, image: "https://cdn.changes.tg/gifts/models/Khabib's%20Papakha/png/Original.png" },
    { name: 'UFC box', price: 13911, image: 'https://cdn.changes.tg/gifts/models/UFC%20box/png/Original.png' },
    { name: 'UFC Strike', price: 1941, image: 'https://cdn.changes.tg/gifts/models/UFC%20Strike/png/Original.png' },
    { name: 'Victory Medal', price: 561, image: 'https://cdn.changes.tg/gifts/models/Victory%20Medal/png/Original.png' },
    { name: 'Rare Bird', price: 3029, image: 'https://cdn.changes.tg/gifts/models/Rare%20Bird/png/Original.png' },
    { name: 'Mood Pack', price: 555, image: 'https://cdn.changes.tg/gifts/models/Mood%20Pack/png/Original.png' },
    { name: 'Pool Float', price: 500, image: 'https://cdn.changes.tg/gifts/models/Pool%20Float/png/Original.png' },
    { name: 'Timeless Book', price: 560, image: 'https://cdn.changes.tg/gifts/models/Timeless%20Book/png/Original.png' },
    { name: 'Chill Flame', price: 509, image: 'https://cdn.changes.tg/gifts/models/Chill%20Flame/png/Original.png' },
    { name: 'Vice Cream', price: 508, image: 'https://cdn.changes.tg/gifts/models/Vice%20Cream/png/Original.png' },
    { name: 'Surge Board', price: 855, image: 'https://cdn.changes.tg/gifts/models/Surge%20Board/png/Original.png' },
    { name: 'Liberty Figure', price: 590, image: 'https://cdn.changes.tg/gifts/models/Liberty%20Figure/png/Original.png' },
    { name: "Durov's Glasses", price: 11475, image: "https://cdn.changes.tg/gifts/models/Durov's%20Glasses/png/Original.png" }
];

/* Специальные (наши) предметы */
const SPECIAL_GIFTS = [
    { name: 'Trophy', price: 100, image: '../trophy.png' },
    { name: 'Bear', price: 20, image: '../bear.png' },
    { name: 'Gift', price: 35, image: '../gift.png' },
    { name: 'Cake', price: 60, image: '../cake.png' }
];

/* Все предметы вместе, отсортированные по цене (убывание) */
const ALL_GIFTS = [...GIFTS, ...SPECIAL_GIFTS].sort((a, b) => b.price - a.price);

/**
 * Подбор подходящего предмета по цене
 */
function pickGiftForWin(amount) {
    if (!amount || amount <= 0) return { gift: null, remainder: 0 };
    const fit = ALL_GIFTS.find(g => g.price <= amount);
    if (!fit) return { gift: null, remainder: amount };
    return { gift: fit, remainder: amount - fit.price };
}

/* ═══════════ СОСТОЯНИЕ ═══════════ */
let state = {
    stars: 0,
    inventory: [],
    selected: new Array(MAX_SLOTS).fill(null),
    selectingSlot: null
};

/* ═══════════ INIT ═══════════ */
document.addEventListener('DOMContentLoaded', init);

function init() {
    const savedStars = localStorage.getItem('userStars');
    state.stars = savedStars !== null ? parseInt(savedStars) : 12500;

    const name = localStorage.getItem('userName') || 'Username';
    $('userName').textContent = name;

    loadInventory();
    updateBalanceUI();
    renderSlots();
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

function saveStars() {
    localStorage.setItem('userStars', state.stars.toString());
}

function updateBalanceUI() {
    $('balanceDisplay').textContent = state.stars.toLocaleString('ru-RU');
}

/* ═══════════ SLOTS ═══════════ */
function renderSlots() {
    const c = $('craftSlots');
    let h = '';
    for (let i = 0; i < MAX_SLOTS; i++) {
        const item = state.selected[i];
        if (item) {
            const stars = item.stars || Math.round((item.price || 0) * 125);
            h += `
                <div class="craft-slot filled" onclick="openSelector(${i})">
                    <span class="slot-index">${i + 1}</span>
                    <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='${GIFT_FALLBACK}'">
                    <div class="slot-price"><img src="${STAR_ICON}" alt="">${stars.toLocaleString('ru-RU')}</div>
                    <button class="slot-remove" onclick="event.stopPropagation();removeSlot(${i})">✕</button>
                </div>
            `;
        } else {
            h += `
                <div class="craft-slot" onclick="openSelector(${i})">
                    <span class="slot-index">${i + 1}</span>
                    <span style="font-size:24px;opacity:.4">+</span>
                </div>
            `;
        }
    }
    c.innerHTML = h;
    updateInfo();
}

function updateInfo() {
    const items = state.selected.filter(x => x !== null);
    const cnt = items.length;
    const b = $('craftBtn');

    if (cnt < 3) {
        $('craftInfo').innerHTML = `Выбрано: <span>${cnt}</span>/3 · выберите ещё ${3 - cnt}`;
        b.textContent = 'Выберите предметы';
        b.disabled = true;
    } else {
        const total = items.reduce((s, x) => s + (x.stars || Math.round((x.price || 0) * 125)), 0);
        const minD = Math.floor(total * 0.5);
        const maxD = Math.floor(total * 2.5);
        $('craftInfo').innerHTML = `Дроп от <span>${minD.toLocaleString('ru-RU')}</span> до <span>${maxD.toLocaleString('ru-RU')}</span> ⭐ · предметов: ${cnt}`;
        b.textContent = 'Крафт';
        b.disabled = false;
    }
}

/* ═══════════ SELECTOR ═══════════ */
function openSelector(slotIdx) {
    state.selectingSlot = slotIdx;
    renderSelectGrid();
    $('selectModal').classList.add('open');
    vibrate();
}

function closeSelector() {
    $('selectModal').classList.remove('open');
    state.selectingSlot = null;
}

function renderSelectGrid() {
    const g = $('selectGrid');
    if (!state.inventory.length) {
        g.innerHTML = '<div class="inv-select-empty">Нет предметов в инвентаре<br><small style="opacity:.6">Открой кейс, чтобы получить</small></div>';
        return;
    }

    const usedIds = new Set(state.selected.filter(x => x).map(x => x.id));

    g.innerHTML = state.inventory.map(item => {
        const isUsed = usedIds.has(item.id);
        const stars = item.stars || Math.round((item.price || 0) * 125);
        return `
            <div class="inv-select-item" style="${isUsed ? 'opacity:.35;pointer-events:none;' : ''}" onclick="selectItem('${item.id}')">
                <img src="${item.image}" alt="" onerror="this.onerror=null;this.src='${GIFT_FALLBACK}'">
                <div class="inv-item-name">${escapeHtml(item.name)}</div>
                <div class="inv-item-price"><img src="${STAR_ICON}" alt="">${stars.toLocaleString('ru-RU')}</div>
            </div>
        `;
    }).join('');
}

function selectItem(itemId) {
    const slotIdx = state.selectingSlot;
    if (slotIdx === null) return;

    const idx = state.inventory.findIndex(i => i.id === itemId);
    if (idx === -1) return;

    const item = state.inventory[idx];

    if (state.selected[slotIdx]) {
        state.inventory.push(state.selected[slotIdx]);
    }

    state.selected[slotIdx] = item;
    state.inventory.splice(idx, 1);
    saveInventory();

    closeSelector();
    renderSlots();
}

function removeSlot(slotIdx) {
    const item = state.selected[slotIdx];
    if (!item) return;
    state.selected[slotIdx] = null;
    state.inventory.push(item);
    saveInventory();
    renderSlots();
    vibrate();
}

/* ═══════════════════════════════════════════════════════════
 * МНОЖИТЕЛИ КРАФТА: x0.5 – x2.5
 * Минимум = x0.5 (возврат 50%), максимум = x2.5
 * ═══════════════════════════════════════════════════════════ */
function getCraftMultiplier() {
    const r = Math.random() * 100;
    if (r < 40) return 0.5;   /* 40% — вернул половину */
    if (r < 65) return 0.7;   /* 25% — вернул 70% */
    if (r < 80) return 1.0;   /* 15% — вернул вложенное */
    if (r < 90) return 1.3;   /* 10% — +30% */
    if (r < 96) return 1.7;   /* 6%  — +70% */
    if (r < 99) return 2.0;   /* 3%  — удвоил */
    return 2.5;               /* 1%  — максимум */
}

function onCraft() {
    const items = state.selected.filter(i => i !== null);
    if (items.length < 3) { showToast('Выберите минимум 3 предмета', 'err'); return; }

    const total = items.reduce((s, x) => s + (x.stars || Math.round((x.price || 0) * 125)), 0);
    const mult = getCraftMultiplier();
    const winAmount = Math.floor(total * mult);

    /* Очищаем слоты (предметы не возвращаются) */
    state.selected = new Array(MAX_SLOTS).fill(null);

    if (mult >= 1) {
        /* ПОБЕДА — подбираем подходящий NFT + остаток на баланс */
        const r = pickGiftForWin(winAmount);

        if (r.gift) {
            state.inventory.push({
                id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: r.gift.name,
                price: r.gift.price,
                stars: r.gift.price,
                image: r.gift.image,
                timestamp: Date.now()
            });
            saveInventory();
            if (r.remainder > 0) {
                state.stars += r.remainder;
                saveStars();
            }
            showResult(mult, winAmount, total, r.gift, r.remainder);
        } else {
            state.stars += winAmount;
            saveStars();
            showResult(mult, winAmount, total, null, winAmount);
        }
    } else {
        /* ЧАСТИЧНЫЙ ВОЗВРАТ (0.5-0.99) — звёзды на баланс */
        state.stars += winAmount;
        saveStars();
        showResult(mult, winAmount, total, null, winAmount);
    }

    vibrate(mult >= 1 ? 'success' : 'light');
    updateBalanceUI();
}

/* ═══════════ RESULT ═══════════ */
function showResult(mult, winAmount, total, gift, remainder) {
    $('resultMult').textContent = 'x' + mult.toFixed(2);
    $('resultDetail').textContent = `Крафт на ${total.toLocaleString('ru-RU')} ⭐`;

    const box = $('resultBox');
    box.style.borderColor = '';

    if (mult >= 1 && gift) {
        /* Полная победа с NFT */
        $('resultImg').src = gift.image;
        $('resultImg').onerror = function() { this.onerror = null; this.src = GIFT_FALLBACK; };
        $('resultImg').style.display = 'block';
        $('resultName').textContent = gift.name;
        let balText = `+${gift.price.toLocaleString('ru-RU')} ⭐ (предмет)`;
        if (remainder > 0) balText += ` + ${remainder.toLocaleString('ru-RU')} ⭐`;
        $('resultBalance').innerHTML = `<img src="${STAR_ICON}" alt=""> ${balText}`;
        $('resultBalance').style.color = 'var(--star)';
        $('resultMult').style.color = 'var(--accent)';
        box.style.borderColor = 'var(--accent)';
    } else if (mult >= 1) {
        /* Победа только звёздами */
        $('resultImg').src = STAR_ICON;
        $('resultImg').style.display = 'block';
        $('resultName').textContent = 'Награда за крафт';
        $('resultBalance').innerHTML = `<img src="${STAR_ICON}" alt=""> +${winAmount.toLocaleString('ru-RU')}`;
        $('resultBalance').style.color = 'var(--star)';
        $('resultMult').style.color = 'var(--accent)';
        box.style.borderColor = 'var(--accent)';
    } else if (mult >= 0.5) {
        /* Частичный возврат */
        $('resultImg').src = STAR_ICON;
        $('resultImg').style.display = 'block';
        $('resultName').textContent = 'Частичный возврат';
        $('resultBalance').innerHTML = `<img src="${STAR_ICON}" alt=""> +${winAmount.toLocaleString('ru-RU')} (было ${total.toLocaleString('ru-RU')})`;
        $('resultBalance').style.color = 'var(--gold)';
        $('resultMult').style.color = 'var(--gold)';
        box.style.borderColor = 'var(--gold)';
    } else {
        /* Совсем проигрыш (не бывает, но на всякий случай) */
        $('resultImg').src = GIFT_FALLBACK;
        $('resultImg').style.display = 'block';
        $('resultName').textContent = 'Не повезло';
        $('resultBalance').innerHTML = `−${total.toLocaleString('ru-RU')} ⭐`;
        $('resultBalance').style.color = 'var(--red)';
        $('resultMult').style.color = 'var(--red)';
        box.style.borderColor = 'var(--red)';
    }

    $('resultOverlay').classList.add('show');
    renderSlots();
}

function closeResult() {
    $('resultOverlay').classList.remove('show');
    $('resultBalance').style.color = '';
    $('resultMult').style.color = 'var(--star)';
    $('resultBox').style.borderColor = '';
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

/* ═══════════ ЭКСПОРТ ═══════════ */
window.openSelector = openSelector;
window.closeSelector = closeSelector;
window.selectItem = selectItem;
window.removeSlot = removeSlot;
window.onCraft = onCraft;
window.closeResult = closeResult;