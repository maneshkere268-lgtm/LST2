// config.js — общие константы LootStar
// Подключать ПЕРВЫМ на всех страницах.

window.LOOTSTAR_CONFIG = {
    TON_TO_STARS: 125,
    STAR_ICON: 'star.png',
    SILVER_ICON: 'silver.png',
    GIFT_FALLBACK: 'star.png',
    ROOT_ITEMS: new Set(['Bear', 'Gift', 'Cake', 'Trophy']),
    MIN_PRICES: {
        'Bear': 15,
        'Gift': 25,
        'Cake': 50,
        'Trophy': 100
    }
};

window.TON_TO_STARS   = window.LOOTSTAR_CONFIG.TON_TO_STARS;
window.STAR_ICON      = window.LOOTSTAR_CONFIG.STAR_ICON;
window.GIFT_FALLBACK  = window.LOOTSTAR_CONFIG.GIFT_FALLBACK;
window.ROOT_ITEMS     = window.LOOTSTAR_CONFIG.ROOT_ITEMS;
window.MIN_PRICES     = window.LOOTSTAR_CONFIG.MIN_PRICES;

// ── Общие утилиты ──
window.normalizeApostrophes = function (str) {
    return String(str || '').replace(/[\u2018\u2019\u02BC\u0060\u00B4]/g, "'");
};

window.encodePathPart = function (str) {
    return encodeURIComponent(window.normalizeApostrophes(String(str).trim()));
};

window.formatStars = function (stars) {
    return Math.round(stars).toLocaleString('ru-RU');
};

window.escapeHtml = function (str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
};

window.vibrate = function (style) {
    try {
        if (navigator.vibrate) {
            navigator.vibrate(
                style === 'success' ? [30, 20, 50] :
                style === 'error'   ? [60, 30, 60] :
                15
            );
        }
    } catch (e) {}
};