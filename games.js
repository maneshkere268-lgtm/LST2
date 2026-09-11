document.addEventListener('DOMContentLoaded', () => {
    const savedStars = localStorage.getItem('userStars');
    const userStars = savedStars !== null ? parseInt(savedStars) : 12500;
    const bal = document.getElementById('balanceDisplay');
    if (bal) bal.textContent = userStars.toLocaleString('ru-RU');

    const name = localStorage.getItem('userName') || 'Username';
    const un = document.getElementById('userName');
    if (un) un.textContent = name;
});

function vibrate() {
    try { if (navigator.vibrate) navigator.vibrate(15); } catch(e) {}
}
document.addEventListener('click', e => {
    const el = e.target.closest('.game-card, .bnav button');
    if (el) vibrate();
});