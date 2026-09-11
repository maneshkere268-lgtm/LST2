const $ = id => document.getElementById(id);
const STAR_ICON = 'star.png';
const GIFT_FALLBACK = 'star.png';
const BET_PHASE_SECONDS = 7;
const MIN_BET = 25;

/* ═══════════════════════════════════════════════════════════
 * ПОЛНЫЙ СПИСОК ПРЕДМЕТОВ (цены в звёздах, 1 TON = 125⭐)
 * Из файла Fine Pen.txt
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

/* Специальные предметы (наши) */
const SPECIAL_GIFTS = [
    { name: 'Trophy', price: 100, image: '../trophy.png' },
    { name: 'Bear', price: 20, image: '../bear.png' },
    { name: 'Gift', price: 35, image: '../gift.png' },
    { name: 'Cake', price: 60, image: '../cake.png' }
];

function pickGiftForWin(amount) {
    /* Возвращает { gift, remainder } — предмет и остаток на баланс */
    const all = [...GIFTS, ...SPECIAL_GIFTS].filter(g => g.price <= amount);
    if (!all.length) return { gift: null, remainder: amount };
    all.sort((a, b) => b.price - a.price);
    const best = all[0];
    return { gift: best, remainder: amount - best.price };
}

/* ═══════════ STATE ═══════════ */
let state = {
    stars: 0,
    phase: 'waiting',
    multiplier: 1.00,
    crashPoint: 1.00,
    timer: BET_PHASE_SECONDS,
    myBet: null,
    bots: [],
    history: [],
    raf: null
};

document.addEventListener('DOMContentLoaded', init);

function init() {
    const savedStars = localStorage.getItem('userStars');
    state.stars = savedStars !== null ? parseInt(savedStars) : 12500;

    const name = localStorage.getItem('userName') || 'Username';
    $('userName').textContent = name;

    const historyRaw = localStorage.getItem('crashHistory');
    if (historyRaw) { try { state.history = JSON.parse(historyRaw) || []; } catch(e){} }
    if (!state.history.length) {
        for (let i = 0; i < 12; i++) state.history.push(generateCrashPoint());
        saveHistory();
    }

    buildStars();
    renderHistory();
    updateBalanceUI();
    startBettingPhase();
}

function saveHistory() {
    localStorage.setItem('crashHistory', JSON.stringify(state.history.slice(0, 20)));
}
function saveStars() { localStorage.setItem('userStars', state.stars.toString()); }

function updateBalanceUI() {
    $('balanceDisplay').textContent = state.stars.toLocaleString('ru-RU');
}

/* ═══════════ STARS BG ═══════════ */
function buildStars() {
    const f = $('starsField');
    if (!f) return;
    const colors = ['', 'gold', 'blue', 'green'];
    let h = '';
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const d = Math.random() * 2 + 0.8;
        const c = colors[Math.floor(Math.random() * colors.length)];
        const dur = (2 + Math.random() * 3).toFixed(2);
        const delay = (Math.random() * 3).toFixed(2);
        const cls = [c, d > 2.2 ? 'big' : ''].filter(Boolean).join(' ');
        h += `<span class="${cls}" style="left:${x}%;top:${y}%;width:${d}px;height:${d}px;animation-duration:${dur}s;animation-delay:${delay}s;"></span>`;
    }
    for (let i = 0; i < 3; i++) {
        const x = 30 + Math.random() * 70;
        const y = Math.random() * 30;
        h += `<div class="shooting-star" style="left:${x}%;top:${y}%;animation-delay:${(Math.random() * 6).toFixed(2)}s;"></div>`;
    }
    f.innerHTML = h;
}

/* ═══════════ CRASH POINT ═══════════ */
function generateCrashPoint() {
    const roll = Math.random() * 100;
    if (roll < 2) return 1.00;
    if (roll < 40) return Math.round((1.01 + Math.random() * 0.5) * 100) / 100;
    if (roll < 70) return Math.round((1.5 + Math.random() * 1.5) * 100) / 100;
    if (roll < 90) return Math.round((3 + Math.random() * 7) * 100) / 100;
    if (roll < 98) return Math.round((10 + Math.random() * 40) * 100) / 100;
    return Math.round((50 + Math.random() * 200) * 100) / 100;
}

function speedFor(m) {
    if (m < 1.5) return 0.06;
    if (m < 2) return 0.12;
    if (m < 3) return 0.2;
    if (m < 5) return 0.3;
    if (m < 10) return 0.5;
    if (m < 50) return 0.8;
    return 1.2;
}

/* ═══════════ BOTS ═══════════ */
const BOT_NAMES = ['happiness', 'Whisperify', 'woof', 'Eternal Sunset', 'Медведев', 'xRocket', 'Яна', 'Артём', 'фаня', 'Winx', 'core', 'mod', 'AI', 'Pupik777', 'Коммух', 'Holder Ronaldo', 'Акбар', 'wselywx', 'Adry', 'Iris', 'Дмитрий', 'админ', 'молодой мошенник', 'Mr.Ronaldo', 'БОСС', 'Легенда', 'Олдара', 'pipisa', 'Swix', 'merci', 'ZOV ZOV', 'dormidontic', 'never', 'Маркет', 'zz', 'Ghost face', 'Knox', 'Sunan Khan', 'катёнак', 'Traxer', 'sippy', 'Уолтер', 'Рома', 'gg.next', 'dark moon'];

function generateBots() {
    const c = 2 + Math.floor(Math.random() * 3);
    const s = BOT_NAMES.slice().sort(() => Math.random() - 0.5);
    const r = [];
    for (let i = 0; i < c; i++) {
        const n = s[i % s.length];
        const b = Math.floor(Math.random() * 150) + 50;
        const w = Math.random() < 0.55;
        let m = w ? (Math.random() < 0.8 ? +(1.01 + Math.random() * 8.99).toFixed(2) : +(10 + Math.random() * 40).toFixed(2)) : 0;
        r.push({ name: n, bet: b, willCashout: w, cashoutMult: m, cashedOut: false, lost: false });
    }
    return r;
}

/* ═══════════ HISTORY ═══════════ */
function pushHistory(v) {
    state.history.unshift(v);
    state.history = state.history.slice(0, 20);
    saveHistory();
    renderHistory();
}
function renderHistory() {
    const t = $('historyTrack');
    t.innerHTML = state.history.map(v => {
        let c = 'history-item';
        if (v >= 10) c += ' mega';
        else if (v >= 2) c += ' high';
        return `<div class="${c}">x${v.toFixed(2)}</div>`;
    }).join('');
}

/* ═══════════ BETS LIST ═══════════ */
function renderBets() {
    const l = $('betsList');
    let h = '';
    if (state.myBet) {
        const b = state.myBet;
        let mh = b.cashedOut ? `<span class="bet-mult won">x${b.cashoutMult.toFixed(2)} ✓</span>` : state.phase === 'crashed' ? `<span class="bet-mult lost">x${state.crashPoint.toFixed(2)}</span>` : state.phase === 'flying' ? `<span class="bet-mult live">x${state.multiplier.toFixed(2)}</span>` : '<span class="bet-mult pending">—</span>';
        const da = b.cashedOut ? Math.floor(b.amount * b.cashoutMult) : Math.floor(b.amount * (state.phase === 'flying' ? state.multiplier : 1));
        const r = pickGiftForWin(da);
        const ph = r.gift ? `<img src="${r.gift.image}" alt="${r.gift.name}" onerror="this.onerror=null;this.src='${GIFT_FALLBACK}'">` : '';
        h += `<div class="bet-item me"><div class="bet-left"><div class="bet-avatar">Я</div><div><div class="bet-name">Вы</div><div class="bet-amount"><img src="${STAR_ICON}"> ${da}</div></div></div><div class="bet-right">${mh}</div><div class="bet-prize">${ph}</div></div>`;
    }
    state.bots.forEach(b => {
        let mh = b.cashedOut ? `<span class="bet-mult won">x${b.cashoutMult.toFixed(2)} ✓</span>` : (b.lost || state.phase === 'crashed') ? `<span class="bet-mult lost">x${state.crashPoint.toFixed(2)}</span>` : state.phase === 'flying' ? `<span class="bet-mult live">x${state.multiplier.toFixed(2)}</span>` : '<span class="bet-mult pending">—</span>';
        const da = b.cashedOut ? Math.floor(b.bet * b.cashoutMult) : Math.floor(b.bet * (state.phase === 'flying' ? state.multiplier : 1));
        const r = pickGiftForWin(da);
        const ph = r.gift ? `<img src="${r.gift.image}" alt="${r.gift.name}" onerror="this.onerror=null;this.src='${GIFT_FALLBACK}'">` : '';
        let ic = 'bet-item' + (b.cashedOut ? ' won' : (b.lost || state.phase === 'crashed') ? ' lost' : '');
        h += `<div class="${ic}"><div class="bet-left"><div class="bet-avatar">${b.name[0]}</div><div><div class="bet-name">${b.name}</div><div class="bet-amount"><img src="${STAR_ICON}"> ${da}</div></div></div><div class="bet-right">${mh}</div><div class="bet-prize">${ph}</div></div>`;
    });
    l.innerHTML = h;
}

/* ═══════════ LOTTIE ═══════════ */
function setLottie(activeId) {
    const players = { wait: $('waitLottie'), round: $('roundLottie'), crash: $('crashLottie') };
    Object.keys(players).forEach(k => {
        const p = players[k];
        if (p) { p.classList.remove('active'); try { if (k === 'crash') p.stop(); } catch(e){} }
    });
    if (activeId && players[activeId]) {
        const p = players[activeId];
        p.classList.add('active');
        try { if (activeId === 'crash') { p.stop(); setTimeout(() => p.play(), 100); } else p.play(); } catch(e){}
    }
}

/* ═══════════ PHASES ═══════════ */
function startBettingPhase() {
    state.phase = 'waiting';
    state.myBet = null;
    state.timer = BET_PHASE_SECONDS;
    state.bots = generateBots();
    state.multiplier = 1.00;
    $('statusLabel').textContent = 'Ожидание раунда';
    $('statusLabel').style.display = 'block';
    $('timerNumber').style.display = 'block';
    $('timerNumber').textContent = state.timer;
    $('currentMult').style.display = 'none';
    setLottie('wait');
    renderBets();
    updateMainBtn();

    const i = setInterval(() => {
        state.timer--;
        $('timerNumber').textContent = state.timer;
        if (state.timer <= 0) { clearInterval(i); startRound(); }
    }, 1000);
}

function startRound() {
    state.phase = 'flying';
    state.crashPoint = generateCrashPoint();
    state.multiplier = 1.00;
    $('statusLabel').style.display = 'none';
    $('timerNumber').style.display = 'none';
    $('currentMult').style.display = 'block';
    $('currentMult').classList.remove('crashed');
    $('currentMult').textContent = 'x1.00';
    setLottie('round');
    updateMainBtn();

    let last = performance.now();
    let acc = 0;

    function tick(now) {
        if (state.phase !== 'flying') return;
        const dt = (now - last) / 1000;
        last = now;
        acc += dt * speedFor(state.multiplier);
        while (acc >= 0.01) {
            state.multiplier = Math.min(state.crashPoint, state.multiplier + 0.01);
            acc -= 0.01;
        }
        $('currentMult').textContent = 'x' + state.multiplier.toFixed(2);
        state.bots.forEach(b => { if (!b.cashedOut && !b.lost && b.willCashout && state.multiplier >= b.cashoutMult) b.cashedOut = true; });
        if (!tick._last || now - tick._last > 120) { renderBets(); tick._last = now; }
        if (state.multiplier >= state.crashPoint) { crashRound(); return; }
        state.raf = requestAnimationFrame(tick);
    }
    state.raf = requestAnimationFrame(tick);
}

function crashRound() {
    state.phase = 'crashed';
    cancelAnimationFrame(state.raf);
    state.multiplier = state.crashPoint;
    $('currentMult').textContent = 'x' + state.crashPoint.toFixed(2);
    $('currentMult').classList.add('crashed');
    setLottie('crash');
    state.bots.forEach(b => { if (!b.cashedOut) b.lost = true; });
    updateMainBtn();
    pushHistory(state.crashPoint);
    renderBets();

    if (state.myBet && !state.myBet.cashedOut) {
        showToast(`💥 Краш на x${state.crashPoint.toFixed(2)} — ставка сгорела`, 'err');
    }

    setTimeout(startBettingPhase, 2500);
}

/* ═══════════ BTN ═══════════ */
function updateMainBtn() {
    const b = $('mainBtn');
    b.className = 'place-btn';
    b.disabled = false;

    if (state.phase === 'waiting') {
        if (state.myBet) { b.textContent = 'Ставка принята, ждите'; b.disabled = true; }
        else { b.textContent = 'Сделать ставку'; }
    } else if (state.phase === 'flying') {
        if (!state.myBet) { b.textContent = 'Раунд уже идёт'; b.disabled = true; }
        else if (state.myBet.cashedOut) { b.textContent = `Забрано x${state.myBet.cashoutMult.toFixed(2)} ✓`; b.disabled = true; }
        else {
            const win = Math.floor(state.myBet.amount * state.multiplier);
            b.textContent = `Забрать ${win.toLocaleString('ru-RU')} ⭐`;
            b.classList.add('cashout');
        }
    } else if (state.phase === 'crashed') {
        if (state.myBet && !state.myBet.cashedOut) { b.textContent = 'Ставка сгорела 💥'; b.classList.add('lost'); }
        else { b.textContent = 'Раунд завершён'; }
        b.disabled = true;
    }
}

function onMainBtn() {
    if (state.phase === 'waiting') {
        if (state.myBet) return;
        const amount = parseInt($('betAmount').value) || MIN_BET;
        if (amount < MIN_BET) { showToast(`Минимум ${MIN_BET} звёзд`, 'err'); return; }
        if (amount > state.stars) { showToast('Недостаточно звёзд', 'err'); return; }

        state.stars -= amount;
        saveStars();
        updateBalanceUI();
        state.myBet = { amount, cashedOut: false, cashoutMult: 0 };
        updateMainBtn();
        vibrate('light');
    } else if (state.phase === 'flying') {
        if (!state.myBet || state.myBet.cashedOut) return;
        state.myBet.cashedOut = true;
        state.myBet.cashoutMult = state.multiplier;
        const win = Math.floor(state.myBet.amount * state.multiplier);
        const r = pickGiftForWin(win);

        let inventory = [];
        try { inventory = JSON.parse(localStorage.getItem('userInventory') || '[]'); } catch(e){ inventory = []; }

        if (r.gift && r.gift.price >= 100) {
            /* Крупный приз — в инвентарь */
            inventory.push({
                id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: r.gift.name,
                price: r.gift.price,
                stars: r.gift.price,
                image: r.gift.image,
                timestamp: Date.now()
            });
            localStorage.setItem('userInventory', JSON.stringify(inventory));
            state.stars += r.remainder;
            showToast(`🎁 ${r.gift.name} + ${r.remainder.toLocaleString('ru-RU')} ⭐`, 'ok');
        } else {
            /* Мелкий — всё на баланс */
            state.stars += win;
            showToast(`Забрано ${win.toLocaleString('ru-RU')} ⭐ (x${state.multiplier.toFixed(2)})`, 'ok');
        }

        saveStars();
        updateBalanceUI();
        updateMainBtn();
        vibrate('success');
    }
}

/* ═══════════ HELPERS ═══════════ */
function setBet(v) { $('betAmount').value = v; }
function setBetMax() { $('betAmount').value = Math.max(MIN_BET, state.stars); }

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

window.setBet = setBet;
window.setBetMax = setBetMax;
window.onMainBtn = onMainBtn;