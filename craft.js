// craft.js — Крафт
const $ = id => document.getElementById(id);
const MAX_SLOTS = 9;

let state = {
    stars: 0,
    inventory: [],
    selected: new Array(MAX_SLOTS).fill(null),
    selectingSlot: null
};

document.addEventListener('DOMContentLoaded', init);

function init() {
    window.TG.updateHeaderUI();
    state.stars = parseInt(localStorage.getItem('userStars')) || 12500;
    $('userName').textContent = window.TG.getShortName();

    loadInventory();
    updateBalanceUI();
    renderSlots();

    window.addEventListener('firebaseDataLoaded', (e) => {
        if (typeof e.detail.stars === 'number') {
            state.stars = e.detail.stars;
            updateBalanceUI();
        }
        if (Array.isArray(e.detail.inventory)) {
            state.inventory = e.detail.inventory;
            renderSlots();
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
                    <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'">
                    <div class="slot-price"><img src="${window.STAR_ICON}" alt="">${stars.toLocaleString('ru-RU')}</div>
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
                <img src="${item.image}" alt="" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'">
                <div class="inv-item-name">${window.escapeHtml(item.name)}</div>
                <div class="inv-item-price"><img src="${window.STAR_ICON}" alt="">${stars.toLocaleString('ru-RU')}</div>
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

function getCraftMultiplier() {
    const r = Math.random() * 100;
    if (r < 40) return 0.5;
    if (r < 65) return 0.7;
    if (r < 80) return 1.0;
    if (r < 90) return 1.3;
    if (r < 96) return 1.7;
    if (r < 99) return 2.0;
    return 2.5;
}

function onCraft() {
    const items = state.selected.filter(i => i !== null);
    if (items.length < 3) { showToast('Выберите минимум 3 предмета', 'err'); return; }

    const total = items.reduce((s, x) => s + (x.stars || Math.round((x.price || 0) * 125)), 0);
    const mult = getCraftMultiplier();
    const winAmount = Math.floor(total * mult);

    state.selected = new Array(MAX_SLOTS).fill(null);

    if (mult >= 1) {
        const r = window.pickGiftForWin(winAmount);
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
            if (r.remainder > 0) { state.stars += r.remainder; saveStars(); }
            showResult(mult, winAmount, total, r.gift, r.remainder);
        } else {
            state.stars += winAmount;
            saveStars();
            showResult(mult, winAmount, total, null, winAmount);
        }
    } else {
        state.stars += winAmount;
        saveStars();
        showResult(mult, winAmount, total, null, winAmount);
    }

    vibrate(mult >= 1 ? 'success' : 'light');
    updateBalanceUI();
}

function showResult(mult, winAmount, total, gift, remainder) {
    $('resultMult').textContent = 'x' + mult.toFixed(2);
    $('resultDetail').textContent = `Крафт на ${total.toLocaleString('ru-RU')} ⭐`;

    const box = $('resultBox');
    box.style.borderColor = '';

    if (mult >= 1 && gift) {
        $('resultImg').src = gift.image;
        $('resultImg').onerror = function() { this.onerror = null; this.src = window.GIFT_FALLBACK; };
        $('resultImg').style.display = 'block';
        $('resultName').textContent = gift.name;
        let balText = `+${gift.price.toLocaleString('ru-RU')} ⭐ (предмет)`;
        if (remainder > 0) balText += ` + ${remainder.toLocaleString('ru-RU')} ⭐`;
        $('resultBalance').innerHTML = `<img src="${window.STAR_ICON}" alt=""> ${balText}`;
        $('resultBalance').style.color = 'var(--star)';
        $('resultMult').style.color = 'var(--accent)';
        box.style.borderColor = 'var(--accent)';
    } else if (mult >= 1) {
        $('resultImg').src = window.STAR_ICON;
        $('resultImg').style.display = 'block';
        $('resultName').textContent = 'Награда за крафт';
        $('resultBalance').innerHTML = `<img src="${window.STAR_ICON}" alt=""> +${winAmount.toLocaleString('ru-RU')}`;
        $('resultBalance').style.color = 'var(--star)';
        $('resultMult').style.color = 'var(--accent)';
        box.style.borderColor = 'var(--accent)';
    } else if (mult >= 0.5) {
        $('resultImg').src = window.STAR_ICON;
        $('resultImg').style.display = 'block';
        $('resultName').textContent = 'Частичный возврат';
        $('resultBalance').innerHTML = `<img src="${window.STAR_ICON}" alt=""> +${winAmount.toLocaleString('ru-RU')} (было ${total.toLocaleString('ru-RU')})`;
        $('resultBalance').style.color = 'var(--gold)';
        $('resultMult').style.color = 'var(--gold)';
        box.style.borderColor = 'var(--gold)';
    } else {
        $('resultImg').src = window.GIFT_FALLBACK;
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

function showToast(msg, type = 'ok') {
    const t = $('toast');
    t.textContent = msg;
    t.className = 'toast show ' + type;
    setTimeout(() => t.classList.remove('show'), 2500);
}

window.openSelector = openSelector;
window.closeSelector = closeSelector;
window.selectItem = selectItem;
window.removeSlot = removeSlot;
window.onCraft = onCraft;
window.closeResult = closeResult;