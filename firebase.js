// firebase.js — Firestore синхронизация (users/<username>)
// Гости из браузера (без Telegram) НЕ создают записи в Firebase.
(function () {
    'use strict';

    const firebaseConfig = {
        apiKey: "AIzaSyALTiDEy8DrBEXsbbd7w1jF-t6mZU2JdlU",
        authDomain: "lootstarcasino.firebaseapp.com",
        projectId: "lootstarcasino",
        storageBucket: "lootstarcasino.firebasestorage.app",
        messagingSenderId: "1014560778669",
        appId: "1:1014560778669:web:a9a1fa4203b1c8292fd924",
        measurementId: "G-5135MZ7JTR"
    };

    if (!window.firebase) {
        console.error('❌ Firebase SDK не подключён');
        return;
    }

    // ── Проверка: реальный ли Telegram-пользователь ──
    const isRealTelegramUser =
        window.TG &&
        window.TG.isTelegram === true &&
        window.TG.user &&
        window.TG.user.id &&
        !String(window.TG.user.id).startsWith('guest_') &&
        !String(window.TG.user.id).startsWith('demo');

    if (!isRealTelegramUser) {
        console.log('🚫 Браузер/демо — Firebase отключён, данные только в localStorage');
        window.FB = {
            disabled: true,
            db: null,
            userRef: null,
            docId: null,
            save: () => {},
            load: async () => false,
            subscribe: () => {},
            unsubscribe: () => {}
        };
        return;
    }

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // ── Doc ID = username (без @), fallback на id_<telegram_id> ──
    function buildDocId() {
        const u = window.TG.user;
        const uname = (u.username || '').replace(/^@/, '').trim().toLowerCase();
        if (uname) return uname;
        return 'id_' + u.id;
    }

    const docId = buildDocId();
    const userRef = db.collection('users').doc(docId);

    const sync = {
        isSaving: false,
        pending: false,
        isListening: false,
        lastRemoteUpdate: 0,
        unsubscribe: null
    };

    function collectLocalState() {
        let inventory = [];
        try {
            const raw = localStorage.getItem('userInventory');
            const arr = raw ? JSON.parse(raw) : [];
            inventory = Array.isArray(arr) ? arr : [];
        } catch (e) {}

        return {
            telegramId: window.TG.user.id,
            username: (window.TG.user.username || '').replace(/^@/, ''),
            firstName: window.TG.user.first_name || '',
            lastName: window.TG.user.last_name || '',
            photoUrl: window.TG.user.photo_url || '',
            stars: parseInt(localStorage.getItem('userStars')) || 0,
            silver: parseInt(localStorage.getItem('userSilver')) || 0,
            inventory,
            updatedAt: Date.now()
        };
    }

    async function saveToFirebase() {
        if (sync.isSaving) { sync.pending = true; return; }
        sync.isSaving = true;
        sync.pending = false;

        try {
            await userRef.set({
                ...collectLocalState(),
                serverUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            sync.lastRemoteUpdate = Date.now();
        } catch (e) {
            console.error('❌ Firebase save error:', e);
        }

        sync.isSaving = false;
        if (sync.pending) { sync.pending = false; saveToFirebase(); }
    }

    // ── Сравнение инвентарей ──
    // Возвращает true, если локальный "богаче" (длиннее или совпадает по длине)
    // В этом случае НЕ даём Firestore перезаписать локальный.
    function localInventoryIsFresh(remoteInv) {
        let localInv = [];
        try {
            const raw = localStorage.getItem('userInventory');
            localInv = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(localInv)) localInv = [];
        } catch (e) { localInv = []; }

        if (!Array.isArray(remoteInv)) return true;
        if (localInv.length > remoteInv.length) return true;
        if (localInv.length === remoteInv.length) {
            // Если длины одинаковые — сравниваем по timestamp последнего предмета
            const localMax = localInv.reduce((m, i) => Math.max(m, i.timestamp || 0), 0);
            const remoteMax = remoteInv.reduce((m, i) => Math.max(m, i.timestamp || 0), 0);
            return localMax >= remoteMax;
        }
        return false;
    }

    function applyRemoteData(data) {
        let changed = false;

        if (typeof data.stars === 'number') {
            const local = parseInt(localStorage.getItem('userStars')) || 0;
            // Если локальный баланс больше — не перезаписываем
            if (data.stars > local) {
                localStorage.setItem('userStars', String(data.stars));
                changed = true;
            } else if (data.stars < local && local - data.stars < 100000) {
                // Если разница небольшая — тоже не трогаем
            } else {
                localStorage.setItem('userStars', String(data.stars));
                changed = true;
            }
        }

        if (typeof data.silver === 'number') {
            const local = parseInt(localStorage.getItem('userSilver')) || 0;
            if (data.silver !== local) {
                localStorage.setItem('userSilver', String(data.silver));
                changed = true;
            }
        }

        // ── Ключевое: не даём Firestore затереть свежий локальный инвентарь ──
        if (Array.isArray(data.inventory)) {
            if (localInventoryIsFresh(data.inventory)) {
                // Локальный свежее — пушим его наверх, не трогаем localStorage
                // console.log('🛡️ Локальный инвентарь свежее — оставляем, пушим в Firestore');
                sync.lastRemoteUpdate = Date.now(); // защита от эха
                saveToFirebase();
            } else {
                const localRaw = localStorage.getItem('userInventory');
                const localInv = localRaw ? JSON.parse(localRaw) : [];
                if (JSON.stringify(data.inventory) !== JSON.stringify(localInv)) {
                    localStorage.setItem('userInventory', JSON.stringify(data.inventory));
                    changed = true;
                }
            }
        }

        if (changed) {
            window.dispatchEvent(new CustomEvent('firebaseDataLoaded', {
                detail: {
                    stars: data.stars,
                    silver: data.silver,
                    inventory: data.inventory
                }
            }));
        }
    }

    async function loadFromFirebase() {
        try {
            const doc = await userRef.get();
            if (!doc.exists) {
                await saveToFirebase();
                return false;
            }
            applyRemoteData(doc.data());
            return true;
        } catch (e) {
            console.error('❌ Firebase load error:', e);
            return false;
        }
    }

    function subscribeToFirebase() {
        if (sync.isListening) return;
        sync.isListening = true;

        sync.unsubscribe = userRef.onSnapshot((doc) => {
            if (!doc.exists) return;
            // Защита от эха: если мы только что сами записали — не применяем
            if (Date.now() - sync.lastRemoteUpdate < 3000) return;
            applyRemoteData(doc.data());
        }, (err) => {
            console.error('❌ Firebase onSnapshot error:', err);
            setTimeout(() => {
                sync.isListening = false;
                subscribeToFirebase();
            }, 5000);
        });
    }

    function unsubscribeFromFirebase() {
        if (sync.unsubscribe) {
            sync.unsubscribe();
            sync.unsubscribe = null;
            sync.isListening = false;
        }
    }

    window.addEventListener('beforeunload', () => {
        unsubscribeFromFirebase();
        saveToFirebase();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) saveToFirebase();
    });

    window.FB = {
        disabled: false,
        db,
        userRef,
        docId,
        save: saveToFirebase,
        load: loadFromFirebase,
        subscribe: subscribeToFirebase,
        unsubscribe: unsubscribeFromFirebase
    };

    (async function autoInit() {
        await loadFromFirebase();
        subscribeToFirebase();
        console.log('🔥 Firebase users/' + docId);
    })();
})();