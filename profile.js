// profile.js — Профиль
const STORAGE = {
    userId: 'userId',
    userName: 'userName',
    balance: 'userStars',
    inventory: 'userInventory'
};

let userId = null;
let userName = null;
let userStars = 0;
let inventory = [];
let currentItem = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
    window.TG.updateHeaderUI();

    userId = window.TG.id;
    userName = window.TG.getShortName();

    localStorage.setItem(STORAGE.userId, String(userId));
    localStorage.setItem(STORAGE.userName, userName);

    userStars = parseInt(localStorage.getItem(STORAGE.balance)) || 0;

    loadInventory();
    updateProfileUI();
    renderInventory();

    window.addEventListener('firebaseDataLoaded', () => {
        userStars = parseInt(localStorage.getItem(STORAGE.balance)) || 0;
        loadInventory();
        updateProfileUI();
        renderInventory();
    });

    document.addEventListener('click', e => {
        const el = e.target.closest('button, .inv-card');
        if (el) window.vibrate();
    });
}

function loadInventory() {
    try {
        const raw = localStorage.getItem(STORAGE.inventory);
        inventory = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(inventory)) inventory = [];
    } catch (e) {
        inventory = [];
    }
}

function saveInventory() {
    localStorage.setItem(STORAGE.inventory, JSON.stringify(inventory));
    window.FB?.save();
}

function saveBalance() {
    localStorage.setItem(STORAGE.balance, userStars.toString());
    window.FB?.save();
}

function updateProfileUI() {
    const initial = userName.charAt(0).toUpperCase() || 'U';
    const avatarEl = document.getElementById('profileAvatar');
    const photo = window.TG.getPhoto();
    if (photo) {
        avatarEl.innerHTML = `<img src="${photo}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.onerror=null;this.parentNode.textContent='${initial}'">`;
    } else {
        avatarEl.textContent = initial;
    }

    document.getElementById('profileName').textContent = userName;
    document.getElementById('profileId').textContent = 'ID: ' + userId;
    document.getElementById('balanceDisplay').textContent = window.formatStars(userStars);
    document.getElementById('statBalance').textContent = window.formatStars(userStars);

    const totalValue = inventory.reduce((sum, item) => sum + (item.stars || Math.round((item.price || 0) * 125)), 0);
    document.getElementById('statGifts').textContent = inventory.length;
    document.getElementById('statValue').textContent = window.formatStars(totalValue);
}

function renderInventory() {
    const container = document.getElementById('inventoryContainer');

    if (!inventory.length) {
        container.innerHTML = `
            <div class="inv-empty">
                <div class="inv-empty-icon">🎁</div>
                <div class="inv-empty-text">Инвентарь пуст</div>
                <div style="font-size:12px;margin-top:8px;color:var(--text-2)">Открой кейс, чтобы получить предметы</div>
            </div>
        `;
        return;
    }

    const sorted = [...inventory].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    container.innerHTML = `<div class="inv-grid">${sorted.map(item => renderCard(item)).join('')}</div>`;
}

function renderCard(item) {
    const stars = item.stars || Math.round((item.price || 0) * 125);
    let rarityClass = '';
    if (stars >= 6250) rarityClass = 'legendary';
    else if (stars >= 1250) rarityClass = 'epic';
    else if (stars >= 375) rarityClass = 'rare';

    return `
        <div class="inv-card">
            <img src="${item.image}" alt="" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'" onclick="openItemModal('${item.id}')">
            <div class="inv-card-name" onclick="openItemModal('${item.id}')">${window.escapeHtml(item.name || '')}</div>
            <div class="inv-card-price ${rarityClass}" onclick="openItemModal('${item.id}')">
                <img src="${window.STAR_ICON}" alt="">
                ${window.formatStars(stars)}
            </div>
            <div class="inv-card-actions">
                <button class="inv-card-btn inv-card-btn-sell" onclick="event.stopPropagation();quickSell('${item.id}')">Продать</button>
                <button class="inv-card-btn inv-card-btn-upgrade" onclick="event.stopPropagation();quickUpgrade('${item.id}')">Апгрейд</button>
            </div>
        </div>
    `;
}

function openItemModal(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    currentItem = item;

    const img = document.getElementById('itemModalImg');
    img.src = item.image || window.GIFT_FALLBACK;
    img.onerror = function() { this.onerror = null; this.src = window.GIFT_FALLBACK; };

    document.getElementById('itemModalName').textContent = item.name || '';
    const stars = item.stars || Math.round((item.price || 0) * 125);
    document.getElementById('itemModalPrice').querySelector('span').textContent = window.formatStars(stars);

    document.getElementById('itemModal').classList.add('open');
    window.vibrate();
}

function closeItemModal() {
    document.getElementById('itemModal').classList.remove('open');
    currentItem = null;
}

document.getElementById('itemModal').addEventListener('click', (e) => {
    if (e.target.id === 'itemModal') closeItemModal();
});

function quickSell(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    currentItem = item;
    sellItem();
}

function quickUpgrade(itemId) {
    localStorage.setItem('upgradeItemId', itemId);
    window.location.href = 'upgrades.html';
}

function sellItem() {
    if (!currentItem) return;
    const stars = currentItem.stars || Math.round((currentItem.price || 0) * 125);

    userStars += stars;
    saveBalance();

    inventory = inventory.filter(i => i.id !== currentItem.id);
    saveInventory();

    updateProfileUI();
    renderInventory();
    if (document.getElementById('itemModal').classList.contains('open')) closeItemModal();

    showToast(`Продано за ${window.formatStars(stars)}`, 'ok');
    window.vibrate('success');
}

function openSellAllModal() {
    if (!inventory.length) { showToast('Инвентарь пуст', 'err'); return; }
    const totalStars = inventory.reduce((sum, item) => sum + (item.stars || Math.round((item.price || 0) * 125)), 0);
    document.getElementById('sellAllValue').textContent = window.formatStars(totalStars);
    document.getElementById('sellAllModal').classList.add('open');
    window.vibrate();
}

function closeSellAllModal() {
    document.getElementById('sellAllModal').classList.remove('open');
}

function confirmSellAll() {
    if (!inventory.length) return;
    const totalStars = inventory.reduce((sum, item) => sum + (item.stars || Math.round((item.price || 0) * 125)), 0);
    userStars += totalStars;
    saveBalance();

    const count = inventory.length;
    inventory = [];
    saveInventory();

    updateProfileUI();
    renderInventory();
    closeSellAllModal();
    showToast(`Продано ${count} предметов за ${window.formatStars(totalStars)}`, 'ok');
    window.vibrate('success');
}

document.getElementById('sellAllModal').addEventListener('click', (e) => {
    if (e.target.id === 'sellAllModal') closeSellAllModal();
});

function upgradeItem() {
    if (!currentItem) return;
    localStorage.setItem('upgradeItemId', currentItem.id);
    window.location.href = 'upgrades.html';
}

function showToast(msg, type = 'ok') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast show ' + type;
    setTimeout(() => toast.classList.remove('show'), 2500);
}

window.openItemModal = openItemModal;
window.closeItemModal = closeItemModal;
window.sellItem = sellItem;
window.upgradeItem = upgradeItem;
window.openSellAllModal = openSellAllModal;
window.closeSellAllModal = closeSellAllModal;
window.confirmSellAll = confirmSellAll;
window.quickSell = quickSell;
window.quickUpgrade = quickUpgrade;