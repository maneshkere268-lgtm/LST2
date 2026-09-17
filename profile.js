// profile.js — Профиль + вывод подарков
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
    updateWithdrawBadges();
}

function renderCard(item) {
    const stars = item.stars || Math.round((item.price || 0) * 125);
    let rarityClass = '';
    if (stars >= 6250) rarityClass = 'legendary';
    else if (stars >= 1250) rarityClass = 'epic';
    else if (stars >= 375) rarityClass = 'rare';

    return `
        <div class="inv-card" data-gift-id="${item.id}">
            <img src="${item.image}" alt="" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'" onclick="openItemModal('${item.id}')">
            <div class="inv-card-name" onclick="openItemModal('${item.id}')">${window.escapeHtml(item.name || '')}</div>
            <div class="inv-card-price ${rarityClass}" onclick="openItemModal('${item.id}')">
                <img src="${window.STAR_ICON}" alt="">
                ${window.formatStars(stars)}
            </div>
            <div class="inv-card-actions">
                <button class="inv-card-btn inv-card-btn-sell" onclick="event.stopPropagation();quickSell('${item.id}')">Продать</button>
                <button class="inv-card-btn inv-card-btn-withdraw" onclick="event.stopPropagation();openWithdrawModal('${item.id}')">Вывести</button>
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

/* ═══════════════════════════════════════════════════════════
 * ВЫВОД ПОДАРКОВ
 * ═══════════════════════════════════════════════════════════ */
const WITHDRAW_BOT = '@lootstar_gamebot';
const REFERRAL_TARGET = 15;
const REFERRAL_HIDDEN = 10;
const REFERRAL_MIN_TURNOVER = 150000;

let currentWithdrawGift = null;

/* ─── Оборот ─── */
function getTurnover() {
    return parseInt(localStorage.getItem('userTurnover')) || 0;
}
function addTurnover(stars) {
    localStorage.setItem('userTurnover', (getTurnover() + stars).toString());
    window.FB?.save();
}

/* ─── Рефералы ─── */
function getReferralAccepted() {
    return parseInt(localStorage.getItem('referralAccepted')) || 0;
}
function getReferralHidden() {
    return parseInt(localStorage.getItem('referralHidden')) || 0;
}
function getTotalInvited() {
    return parseInt(localStorage.getItem('totalInvited')) || 0;
}
function getWithdrawCycles() {
    return parseInt(localStorage.getItem('withdrawCycles')) || 0;
}

/* ─── Требования ─── */
function getRequiredTurnover(giftStars) {
    const cycles = getWithdrawCycles();
    return giftStars * 1000 * Math.pow(10, cycles);
}
function getRequiredReferrals() {
    return REFERRAL_TARGET + REFERRAL_HIDDEN;
}

/* ─── Открытие модалки ─── */
function openWithdrawModal(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    currentWithdrawGift = item;
    renderWithdrawModal();
    document.getElementById('withdrawModal').classList.add('open');
}

function renderWithdrawModal() {
    const item = currentWithdrawGift;
    if (!item) return;

    const content = document.getElementById('withdrawContent');
    if (!content) return;

    const required = getRequiredTurnover(item.stars);
    const current = getTurnover();
    const accepted = getReferralAccepted();
    const needRefs = getRequiredReferrals();

    /* Этап 1: не хватает оборота */
    if (current < required) {
        const left = required - current;
        const percent = Math.min(100, (current / required) * 100);
        content.innerHTML = `
            <div class="withdraw-title">Вывод подарка</div>
            <div class="withdraw-gift">
                <img src="${item.image}" alt="" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'">
                <div class="withdraw-gift-name">${window.escapeHtml(item.name)}</div>
                <div class="withdraw-gift-price">
                    <img src="${window.STAR_ICON}" alt="">${window.formatStars(item.stars)}
                </div>
            </div>
            <div class="withdraw-progress-text">
                До вывода осталось: <b>${window.formatStars(left)}</b> оборота
            </div>
            <div class="withdraw-progress-bar">
                <div style="width:${percent}%"></div>
            </div>
            <div class="withdraw-progress-sub">
                ${window.formatStars(current)} / ${window.formatStars(required)}
            </div>
            <button class="withdraw-btn disabled" disabled>Вывести</button>
            <button class="withdraw-close" onclick="closeWithdrawModal()">Закрыть</button>
        `;
        return;
    }

    /* Этап 2: нужно привести друзей */
    if (accepted < needRefs) {
        const visibleAccepted = Math.min(accepted, REFERRAL_TARGET);
        const refPercent = Math.min(100, (visibleAccepted / REFERRAL_TARGET) * 100);
        content.innerHTML = `
            <div class="withdraw-title">Вывод подарка</div>
            <div class="withdraw-gift">
                <img src="${item.image}" alt="" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'">
                <div class="withdraw-gift-name">${window.escapeHtml(item.name)}</div>
                <div class="withdraw-gift-price">
                    <img src="${window.STAR_ICON}" alt="">${window.formatStars(item.stars)}
                </div>
            </div>
            <div class="withdraw-info">
                Чтобы вывести подарок, приведи <b>${REFERRAL_TARGET}</b> друзей
            </div>
            <div class="withdraw-refs-bar">
                <div style="width:${refPercent}%"></div>
            </div>
            <div class="withdraw-refs-sub">
                ${visibleAccepted} / ${REFERRAL_TARGET}
            </div>
            <div class="withdraw-info-sub">
                Условие для друга: сделать <b>${window.formatStars(REFERRAL_MIN_TURNOVER)}</b> оборота
                и зайти в бота <b>${WITHDRAW_BOT}</b>, чтобы закрепиться за тобой.
            </div>
            <button class="withdraw-btn" onclick="copyBotLink()">Пригласить друга</button>
            <button class="withdraw-btn secondary" onclick="checkReferrals()">Проверить друзей</button>
            <button class="withdraw-close" onclick="closeWithdrawModal()">Закрыть</button>
        `;
        return;
    }

    /* Этап 3: всё выполнено */
    content.innerHTML = `
        <div class="withdraw-title">Вывод подарка</div>
        <div class="withdraw-gift">
            <img src="${item.image}" alt="" onerror="this.onerror=null;this.src='${window.GIFT_FALLBACK}'">
            <div class="withdraw-gift-name">${window.escapeHtml(item.name)}</div>
            <div class="withdraw-gift-price">
                <img src="${window.STAR_ICON}" alt="">${window.formatStars(item.stars)}
            </div>
        </div>
        <div class="withdraw-info">
            ✅ Условия выполнены.<br>Подарок готов к выводу.
        </div>
        <div class="withdraw-info-sub">
            После вывода следующего подарка потребуется оборот ×10 от текущего.
        </div>
        <button class="withdraw-btn" onclick="confirmWithdraw()">Забрать подарок</button>
        <button class="withdraw-close" onclick="closeWithdrawModal()">Закрыть</button>
    `;
}

/* ─── Проверка рефералов ─── */
function checkReferrals() {
    const totalInvited = getTotalInvited();
    const visibleAccepted = Math.min(totalInvited, REFERRAL_TARGET);
    const hiddenCount = Math.min(totalInvited - visibleAccepted, REFERRAL_HIDDEN);
    const realAccepted = totalInvited - hiddenCount;

    localStorage.setItem('referralAccepted', realAccepted.toString());
    localStorage.setItem('referralHidden', hiddenCount.toString());

    if (realAccepted >= getRequiredReferrals()) {
        showToast('Все друзья засчитаны!', 'ok');
    } else {
        showToast(`Засчитано ${visibleAccepted} из ${REFERRAL_TARGET}`, 'ok');
    }
    renderWithdrawModal();
}

/* ─── Подтверждение вывода ─── */
function confirmWithdraw() {
    if (!currentWithdrawGift) return;
    const idx = inventory.findIndex(i => i.id === currentWithdrawGift.id);
    if (idx === -1) { closeWithdrawModal(); return; }

    inventory.splice(idx, 1);
    saveInventory();

    localStorage.setItem('withdrawCycles', (getWithdrawCycles() + 1).toString());
    localStorage.setItem('referralAccepted', '0');
    localStorage.setItem('referralHidden', '0');
    localStorage.setItem('totalInvited', '0');

    showToast('Подарок отправлен на вывод!', 'ok');
    closeWithdrawModal();
    updateProfileUI();
    renderInventory();
    window.vibrate('success');
}

/* ─── Копирование ссылки на бота ─── */
function copyBotLink() {
    const link = `https://t.me/${WITHDRAW_BOT.replace('@', '')}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            showToast('Ссылка скопирована', 'ok');
        }).catch(() => {
            showToast(link, 'ok');
        });
    } else {
        showToast(link, 'ok');
    }
}

/* ─── Закрытие ─── */
function closeWithdrawModal() {
    document.getElementById('withdrawModal').classList.remove('open');
    currentWithdrawGift = null;
}

document.getElementById('withdrawModal')?.addEventListener('click', e => {
    if (e.target.id === 'withdrawModal') closeWithdrawModal();
});

/* ─── Обновление бейджей «Готово» ─── */
function updateWithdrawBadges() {
    document.querySelectorAll('[data-gift-id]').forEach(card => {
        const id = card.dataset.giftId;
        const item = inventory.find(i => i.id === id);
        if (!item) return;
        const required = getRequiredTurnover(item.stars);
        const ready = getTurnover() >= required && getReferralAccepted() >= getRequiredReferrals();
        const btn = card.querySelector('.inv-card-btn-withdraw');
        if (btn) btn.classList.toggle('locked', !ready);
        let badge = card.querySelector('.inv-card-ready-badge');
        if (ready && !badge) {
            badge = document.createElement('div');
            badge.className = 'inv-card-ready-badge';
            badge.textContent = 'Готово';
            card.appendChild(badge);
        } else if (!ready && badge) {
            badge.remove();
        }
    });
}

/* ═══════════ ЭКСПОРТ ═══════════ */
window.openItemModal = openItemModal;
window.closeItemModal = closeItemModal;
window.sellItem = sellItem;
window.upgradeItem = upgradeItem;
window.openSellAllModal = openSellAllModal;
window.closeSellAllModal = closeSellAllModal;
window.confirmSellAll = confirmSellAll;
window.quickSell = quickSell;
window.quickUpgrade = quickUpgrade;

window.openWithdrawModal = openWithdrawModal;
window.closeWithdrawModal = closeWithdrawModal;
window.checkReferrals = checkReferrals;
window.confirmWithdraw = confirmWithdraw;
window.copyBotLink = copyBotLink;
window.getTurnover = getTurnover;
window.addTurnover = addTurnover;
window.getRequiredTurnover = getRequiredTurnover;
window.getRequiredReferrals = getRequiredReferrals;
window.updateWithdrawBadges = updateWithdrawBadges;