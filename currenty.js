// currency.js — общая двухвалютная система LootStar
// Звёзды (star) + Серебро (silver)

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════
    // КОНСТАНТЫ
    // ═══════════════════════════════════════════════════════
    const CURRENCY = {
        STAR: 'star',
        SILVER: 'silver'
    };

    const ICONS = {
        star: 'star.png',
        silver: 'silver-star.png'
    };

    const DEFAULTS = {
        stars: 15,
        silver: 1000
    };

    const MIN_BET = 25;
    const SILVER_BONUS = 500;

    // ═══════════════════════════════════════════════════════
    // ИНИЦИАЛИЗАЦИЯ
    // ═══════════════════════════════════════════════════════
    function init() {
        if (localStorage.getItem('userStars') === null) {
            localStorage.setItem('userStars', DEFAULTS.stars.toString());
        }
        if (localStorage.getItem('userSilver') === null) {
            localStorage.setItem('userSilver', DEFAULTS.silver.toString());
        }
        if (localStorage.getItem('userInventory') === null) {
            localStorage.setItem('userInventory', '[]');
        }
    }

    // ═══════════════════════════════════════════════════════
    // БАЛАНСЫ
    // ═══════════════════════════════════════════════════════
    function getStars() {
        return Math.max(0, parseInt(localStorage.getItem('userStars')) || 0);
    }
    function getSilver() {
        return Math.max(0, parseInt(localStorage.getItem('userSilver')) || 0);
    }
    function setStars(v) {
        localStorage.setItem('userStars', Math.max(0, Math.floor(v)).toString());
    }
    function setSilver(v) {
        localStorage.setItem('userSilver', Math.max(0, Math.floor(v)).toString());
    }
    function getBalance(currency) {
        return currency === CURRENCY.STAR ? getStars() : getSilver();
    }
    function setBalance(currency, value) {
        if (currency === CURRENCY.STAR) setStars(value);
        else setSilver(value);
    }

    // ═══════════════════════════════════════════════════════
    // СПИСАНИЕ / НАЧИСЛЕНИЕ
    // ═══════════════════════════════════════════════════════
    function spend(currency, amount) {
        if (amount <= 0) return false;
        const bal = getBalance(currency);
        if (bal < amount) return false;
        setBalance(currency, bal - amount);
        return true;
    }
    function earn(currency, amount) {
        if (amount <= 0) return;
        setBalance(currency, getBalance(currency) + amount);
    }

    // ═══════════════════════════════════════════════════════
    // ИНВЕНТАРЬ
    // ═══════════════════════════════════════════════════════
    function getInventory() {
        try {
            const raw = localStorage.getItem('userInventory');
            const inv = raw ? JSON.parse(raw) : [];
            return Array.isArray(inv) ? inv : [];
        } catch (e) { return []; }
    }
    function saveInventory(inv) {
        localStorage.setItem('userInventory', JSON.stringify(inv));
    }
    function getInventoryByCurrency(currency) {
        return getInventory().filter(item => {
            const isSilver = !!item.isSilver;
            return currency === CURRENCY.SILVER ? isSilver : !isSilver;
        });
    }

    // ═══════════════════════════════════════════════════════
    // ПРОВЕРКА ПУСТОЙ ВАЛЮТЫ
    // ═══════════════════════════════════════════════════════
    function isCurrencyEmpty(currency) {
        const balance = getBalance(currency);
        const inv = getInventoryByCurrency(currency);
        return balance === 0 && inv.length === 0;
    }

    function checkSilverBonus() {
        if (isCurrencyEmpty(CURRENCY.SILVER)) {
            setSilver(getSilver() + SILVER_BONUS);
            return SILVER_BONUS;
        }
        return 0;
    }

    // ═══════════════════════════════════════════════════════
    // УТИЛИТЫ
    // ═══════════════════════════════════════════════════════
    function getIcon(currency) {
        return ICONS[currency] || ICONS.star;
    }
    function getName(currency) {
        return currency === CURRENCY.STAR ? 'звёзды' : 'серебро';
    }
    function format(amount) {
        return Math.round(amount).toLocaleString('ru-RU');
    }

    // Обновление UI балансов (хедер)
    function refreshUI() {
        const stars = getStars();
        const silver = getSilver();

        const starEl = document.getElementById('balanceDisplay');
        const silverEl = document.getElementById('silverDisplay');
        if (starEl) starEl.textContent = format(stars);
        if (silverEl) silverEl.textContent = format(silver);

        window.dispatchEvent(new CustomEvent('currencyUpdate', {
            detail: { stars, silver }
        }));
    }

    // ═══════════════════════════════════════════════════════
    // ЭКСПОРТ
    // ═══════════════════════════════════════════════════════
    window.CURRENCY = CURRENCY;
    window.MIN_BET = MIN_BET;

    window.getStars = getStars;
    window.getSilver = getSilver;
    window.setStars = setStars;
    window.setSilver = setSilver;
    window.getBalance = getBalance;
    window.setBalance = setBalance;

    window.spendCurrency = spend;
    window.earnCurrency = earn;

    window.getInventory = getInventory;
    window.saveInventory = saveInventory;
    window.getInventoryByCurrency = getInventoryByCurrency;

    window.isCurrencyEmpty = isCurrencyEmpty;
    window.checkSilverBonus = checkSilverBonus;

    window.getCurrencyIcon = getIcon;
    window.getCurrencyName = getName;
    window.formatCurrency = format;
    window.refreshCurrencyUI = refreshUI;

    // ═══════════════════════════════════════════════════════
    // АВТОЗАПУСК
    // ═══════════════════════════════════════════════════════
    init();

    document.addEventListener('DOMContentLoaded', () => {
        refreshUI();
        const bonus = checkSilverBonus();
        if (bonus > 0) {
            setTimeout(() => {
                showSilverBonusToast(bonus);
                refreshUI();
            }, 800);
        }
    });

    window.addEventListener('focus', refreshUI);

    function showSilverBonusToast(amount) {
        const toast = document.createElement('div');
        toast.className = 'silver-bonus-toast';
        toast.innerHTML = `<img src="${ICONS.silver}" alt=""><span>+${amount} серебра (бонус)</span>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3600);
    }

    console.log('💰 Currency system loaded');
})();