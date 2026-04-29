/* ============================================================
   ReUse App — Main JavaScript
   ============================================================ */

// ── STATE ─────────────────────────────────────────────────────

const state = {
    currentSection: 'seccio_home',
    navHistory:     [],
    notifications:  [
        { icon: '💬', title: 'Nou missatge de Marta', sub: 'Et pregunta pel sofà beige', time: 'Fa 5 min' },
        { icon: '❤️', title: 'A Jordi li agrada el teu objecte', sub: 'Bicicleta de muntanya', time: 'Fa 1 hora' },
        { icon: '✅', title: 'Objecte marcat com a donat', sub: 'Mòbil Android — gràcies!', time: 'Ahir' },
    ],
    myItems: [
        { id: 1, name: 'Sofà beige',   emoji: '🛋️', estat: 'disponible', img: null },
        { id: 2, name: 'Mòbil Android', emoji: '📱', estat: 'reservat',   img: null },
        { id: 3, name: 'Bicicleta',    emoji: '🚲', estat: 'no-disp',    img: null },
    ],
    feedItems: [
        { id: 10, name: 'Sofà de 3 places',   emoji: '🛋️', user: 'Marta de Oliva', estat: 'poc',  desc: 'Sofà beix, bon estat, recollida a Granollers.', img: null },
        { id: 11, name: 'Mòbil Android',      emoji: '📱', user: 'Jordi',           estat: 'nou',  desc: 'Samsung Galaxy A14, no faig servir.', img: null },
        { id: 12, name: 'Bicicleta de muntanya', emoji: '🚲', user: 'Núria',        estat: 'usat', desc: 'BTT 26", canvis Shimano, bon estat general.', img: null },
        { id: 13, name: 'Llibres universitaris', emoji: '📚', user: 'Pere',         estat: 'poc',  desc: 'Enginyeria informàtica, 1r i 2n curs.', img: null },
        { id: 14, name: 'Cadira d\'oficina',  emoji: '🪑', user: 'Laia',            estat: 'nou',  desc: 'Ergonòmica, reposacaps, quasi nova.', img: null },
    ],
    profile: {
        name: 'Miansa',
        handle: 'uemissa',
        bio: 'M\'agrada donar una segona vida als objectes 🌱',
        img: null,
        publicats: 5,
        donats: 12,
        reservats: 3,
    },
    chats: [
        { id: 1, name: 'Marta de Oliva', emoji: '👩', preview: 'El sofà encara el tens disponible?', time: '12:30', unread: 2, online: true },
        { id: 2, name: 'Jordi',          emoji: '👦', preview: 'Gràcies! Vinc a buscar-ho demà.', time: '11:05', unread: 0, online: false },
        { id: 3, name: 'Núria',          emoji: '👩', preview: 'D\'acord, t\'aviso quan pugui!', time: 'Ahir', unread: 0, online: true },
    ],
    settings: {
        notifs:   true,
        darkMode: false,
        ubicació: true,
        emails:   false,
    },
    activeFilter: 'Tot',
    currentModalItem: null,
    uploadedImages: [],
    pendingNewItem: { name: '', cat: '', estat: 'Nou', desc: '', imgs: [] },
    favorites: new Set(),
};

// ── NAVIGATION ────────────────────────────────────────────────

const SHOW_MENU   = ['seccio_feed','seccio_afegir','seccio_perfil','seccio_xats'];
const NAV_MAP     = { 'seccio_feed':'nav-home', 'seccio_afegir':'nav-add', 'seccio_perfil':'nav-perfil', 'seccio_xats':'nav-msg' };
const BACK_SECTS  = ['seccio_login','seccio_registre','seccio_detail','seccio_notif','seccio_settings','seccio_edit_perfil'];

function nav(id, pushHistory = true) {
    if (pushHistory && state.currentSection !== id) {
        state.navHistory.push(state.currentSection);
    }

    document.querySelectorAll('.seccio').forEach(s => s.classList.remove('activa'));
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('activa');
    state.currentSection = id;

    // Menu visibility
    const menu = document.getElementById('menu');
    if (menu) menu.style.display = SHOW_MENU.includes(id) ? 'flex' : 'none';

    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        const show = BACK_SECTS.includes(id);
        backBtn.style.display = show ? 'flex' : 'none';
    }

    // Nav highlight
    if (NAV_MAP[id]) setNav(NAV_MAP[id]);

    // Scroll section to top
    el.scrollTop = 0;

    // Update toast bottom offset
    updateToastPos();
}

function goBack() {
    if (state.navHistory.length > 0) {
        const prev = state.navHistory.pop();
        nav(prev, false);
    } else {
        nav('seccio_home', false);
    }
}

function setNav(id) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

function updateToastPos() {
    const toast = document.getElementById('toast');
    const menu  = document.getElementById('menu');
    if (!toast || !menu) return;
    const menuVis = menu.style.display !== 'none';
    toast.style.bottom = menuVis ? `calc(${menu.offsetHeight}px + 10px)` : '20px';
}

// ── FEED ──────────────────────────────────────────────────────

function renderFeed(filter = 'Tot') {
    const list = document.getElementById('feed-list');
    if (!list) return;

    const ESTAT_LABELS = { 'nou':'Nou', 'poc':'Poc ús', 'usat':'Usat' };
    const ESTAT_BADGE  = { 'nou':'badge-nou', 'poc':'badge-poc', 'usat':'badge-usat' };

    const CAT_MAP = {
        'Mobles':     ['🛋️','🪑'],
        'Electrònica':['📱','💻'],
        'Roba':       ['👕','👗'],
        'Esports':    ['🚲','⚽'],
        'Llar':       ['🏠','🍳'],
    };

    const filtered = filter === 'Tot'
        ? state.feedItems
        : state.feedItems.filter(it => {
            const cats = CAT_MAP[filter] || [];
            return cats.includes(it.emoji);
        });

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Res per aquí</div><div class="empty-sub">No hi ha objectes en aquesta categoria.</div></div>`;
        return;
    }

    list.innerHTML = filtered.map(it => {
        const imgContent = it.img
            ? `<img src="${it.img}" alt="${it.name}">`
            : it.emoji;
        const badgeClass = ESTAT_BADGE[it.estat] || 'badge-poc';
        const badgeLabel = ESTAT_LABELS[it.estat] || it.estat;
        const isFav = state.favorites.has(it.id);

        return `
        <div class="item-card" onclick="openDetail(${it.id})">
            <div class="item-img">${imgContent}</div>
            <div class="item-body">
                <div>
                    <div class="item-title">${it.name}</div>
                    <div class="item-desc">${it.desc}</div>
                    <div class="item-user">Publicat per ${it.user}</div>
                </div>
                <div class="item-footer">
                    <span class="badge ${badgeClass}">${badgeLabel}</span>
                    <button class="btn-contact" onclick="event.stopPropagation();contactUser('${it.user}')">💬 Contactar</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function selPill(el) {
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    state.activeFilter = el.textContent;
    renderFeed(state.activeFilter);
}

function searchFeed(query) {
    const q = query.toLowerCase().trim();
    if (!q) { renderFeed(state.activeFilter); return; }

    const filtered = state.feedItems.filter(it =>
        it.name.toLowerCase().includes(q) ||
        it.user.toLowerCase().includes(q) ||
        it.desc.toLowerCase().includes(q)
    );

    const list = document.getElementById('feed-list');
    if (!list) return;

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Sense resultats</div><div class="empty-sub">Prova amb altres paraules clau.</div></div>`;
        return;
    }

    const ESTAT_BADGE  = { 'nou':'badge-nou', 'poc':'badge-poc', 'usat':'badge-usat' };
    const ESTAT_LABELS = { 'nou':'Nou', 'poc':'Poc ús', 'usat':'Usat' };

    list.innerHTML = filtered.map(it => {
        const imgContent = it.img ? `<img src="${it.img}" alt="${it.name}">` : it.emoji;
        return `
        <div class="item-card" onclick="openDetail(${it.id})">
            <div class="item-img">${imgContent}</div>
            <div class="item-body">
                <div>
                    <div class="item-title">${it.name}</div>
                    <div class="item-desc">${it.desc}</div>
                    <div class="item-user">Publicat per ${it.user}</div>
                </div>
                <div class="item-footer">
                    <span class="badge ${ESTAT_BADGE[it.estat]||'badge-poc'}">${ESTAT_LABELS[it.estat]||it.estat}</span>
                    <button class="btn-contact" onclick="event.stopPropagation();contactUser('${it.user}')">💬 Contactar</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function contactUser(user) {
    showToast(`💬 Missatge enviat a ${user}!`);
}

// ── DETAIL VIEW ───────────────────────────────────────────────

function openDetail(id) {
    const item = state.feedItems.find(it => it.id === id);
    if (!item) return;

    const section = document.getElementById('seccio_detail');
    const isFav = state.favorites.has(id);
    const ESTAT_LABELS = { 'nou':'Nou', 'poc':'Poc ús', 'usat':'Usat' };
    const ESTAT_BADGE  = { 'nou':'badge-nou', 'poc':'badge-poc', 'usat':'badge-usat' };

    const imgContent = item.img
        ? `<img src="${item.img}" alt="${item.name}">`
        : item.emoji;

    section.querySelector('.detail-content').innerHTML = `
        <div class="detail-img">${imgContent}</div>
        <div class="detail-body">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
                <div class="detail-title">${item.name}</div>
                <span class="badge ${ESTAT_BADGE[item.estat]||'badge-poc'}" style="flex-shrink:0;margin-top:4px;">${ESTAT_LABELS[item.estat]||item.estat}</span>
            </div>

            <div class="detail-user-row">
                <div class="detail-avatar">👤</div>
                <div>
                    <div class="detail-user-name">${item.user}</div>
                    <div class="detail-user-date">Publicat fa 2 dies · Granollers</div>
                </div>
            </div>

            <div class="detail-desc">${item.desc}</div>

            <div class="detail-actions">
                <button class="btn-primary" onclick="contactUser('${item.user}');showToast('💬 Missatge enviat!')">💬 Contactar</button>
                <button class="btn-fav ${isFav ? 'liked' : ''}" id="fav-btn-${id}" onclick="toggleFav(${id})">
                    ${isFav ? '❤️' : '🤍'}
                </button>
            </div>
        </div>
    `;

    nav('seccio_detail');
}

function toggleFav(id) {
    if (state.favorites.has(id)) {
        state.favorites.delete(id);
        showToast('💔 Eliminat de favorits');
    } else {
        state.favorites.add(id);
        showToast('❤️ Afegit a favorits!');
    }
    // Update button
    const btn = document.getElementById(`fav-btn-${id}`);
    if (btn) {
        btn.classList.toggle('liked', state.favorites.has(id));
        btn.textContent = state.favorites.has(id) ? '❤️' : '🤍';
    }
}

// ── PROFILE ───────────────────────────────────────────────────

function renderProfile() {
    const p = state.profile;

    // Avatar
    const av = document.getElementById('profile-avatar');
    if (av) av.innerHTML = p.img ? `<img src="${p.img}" alt="avatar">` : '👤';

    const nameEl = document.getElementById('profile-name');
    if (nameEl) nameEl.textContent = p.name;

    const handleEl = document.getElementById('profile-handle');
    if (handleEl) handleEl.textContent = `@${p.handle}`;

    const pubEl = document.getElementById('stat-publicats');
    if (pubEl) pubEl.textContent = p.publicats;
    const donEl = document.getElementById('stat-donats');
    if (donEl) donEl.textContent = p.donats;
    const resEl = document.getElementById('stat-reservats');
    if (resEl) resEl.textContent = p.reservats;

    renderMyItems();
}

function renderMyItems() {
    const container = document.getElementById('my-items-list');
    if (!container) return;

    const ESTAT_CONFIG = {
        'disponible': { dot: 'dot-disponible', label: 'Disponible',   color: 'var(--green-mid)' },
        'reservat':   { dot: 'dot-reservat',   label: 'Reservat',     color: '#f9a825' },
        'donat':      { dot: 'dot-donat',      label: 'Donat',        color: '#1565c0' },
        'no-disp':    { dot: 'dot-no',         label: 'No disponible', color: '#e53935' },
    };

    container.innerHTML = state.myItems.map(it => {
        const cfg = ESTAT_CONFIG[it.estat] || ESTAT_CONFIG['disponible'];
        const imgContent = it.img ? `<img src="${it.img}" alt="${it.name}">` : it.emoji;
        return `
        <div class="my-item">
            <div class="my-img">${imgContent}</div>
            <div class="my-body">
                <div class="my-name">${it.name}</div>
                <div class="estat-dot">
                    <div class="dot ${cfg.dot}"></div>
                    <span style="color:${cfg.color};font-size:12px;">${cfg.label}</span>
                </div>
            </div>
            <div class="my-item-actions">
                <button class="btn-estat" onclick="openModal(${it.id})">Canviar estat</button>
            </div>
        </div>`;
    }).join('');
}

// ── MODALS ────────────────────────────────────────────────────

function openModal(itemId) {
    state.currentModalItem = itemId;
    const item = state.myItems.find(it => it.id === itemId);
    const title = document.getElementById('modal-title');
    if (title && item) title.textContent = `Marcar "${item.name}" com a:`;
    document.getElementById('estat-modal').classList.add('open');
}

function closeModal(e) {
    const overlay = document.getElementById('estat-modal');
    if (!e || e.target === overlay) overlay.classList.remove('open');
}

function setEstat(estat) {
    document.getElementById('estat-modal').classList.remove('open');
    const item = state.myItems.find(it => it.id === state.currentModalItem);
    if (item) {
        item.estat = estat;
        renderMyItems();
        showToast(`✅ "${item.name}" marcat com a ${estat}`);
    }
}

function openNotifPanel() {
    renderNotifications();
    document.getElementById('notif-modal').classList.add('open');
}

function closeNotifModal(e) {
    const overlay = document.getElementById('notif-modal');
    if (!e || e.target === overlay) overlay.classList.remove('open');
}

function renderNotifications() {
    const list = document.getElementById('notif-list');
    if (!list) return;
    if (state.notifications.length === 0) {
        list.innerHTML = `<div class="empty-state"><div class="empty-icon">🔔</div><div class="empty-title">Sense notificacions</div></div>`;
        return;
    }
    list.innerHTML = state.notifications.map(n => `
        <div class="notif-item">
            <div class="notif-icon">${n.icon}</div>
            <div class="notif-text">
                <div class="notif-title">${n.title}</div>
                <div class="notif-sub">${n.sub}</div>
                <div class="notif-time">${n.time}</div>
            </div>
        </div>
    `).join('');

    // Clear badge
    const badge = document.getElementById('notif-badge');
    if (badge) badge.style.display = 'none';
}

function openSettingsPanel() {
    renderSettings();
    document.getElementById('settings-modal').classList.add('open');
}

function closeSettingsModal(e) {
    const overlay = document.getElementById('settings-modal');
    if (!e || e.target === overlay) overlay.classList.remove('open');
}

function renderSettings() {
    const s = state.settings;
    setToggle('toggle-notifs',   s.notifs);
    setToggle('toggle-ubicacio', s.ubicació);
    setToggle('toggle-emails',   s.emails);
}

function setToggle(id, val) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('on', val);
}

function toggleSetting(key) {
    state.settings[key] = !state.settings[key];
    renderSettings();
    showToast(state.settings[key] ? '✅ Activat' : '🔕 Desactivat');
}

// ── EDIT PROFILE ─────────────────────────────────────────────

function openEditProfile() {
    const p = state.profile;
    document.getElementById('edit-name').value    = p.name;
    document.getElementById('edit-handle').value  = p.handle;
    document.getElementById('edit-bio').value     = p.bio;

    const avatar = document.getElementById('edit-profile-avatar');
    if (avatar) avatar.innerHTML = p.img ? `<img src="${p.img}" alt="avatar">` : '👤';

    nav('seccio_edit_perfil');
}

function saveProfile() {
    state.profile.name   = document.getElementById('edit-name').value.trim()   || state.profile.name;
    state.profile.handle = document.getElementById('edit-handle').value.trim() || state.profile.handle;
    state.profile.bio    = document.getElementById('edit-bio').value.trim();

    renderProfile();
    goBack();
    showToast('✅ Perfil actualitzat!');
}

function handleAvatarUpload(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        state.profile.img = e.target.result;
        const avatar = document.getElementById('edit-profile-avatar');
        if (avatar) avatar.innerHTML = `<img src="${e.target.result}" alt="avatar">`;
    };
    reader.readAsDataURL(file);
}

// ── ADD ITEM ─────────────────────────────────────────────────

let addImgs = [];

function handleAddImages(input) {
    const files = Array.from(input.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            addImgs.push(e.target.result);
            renderAddImgPreviews();
        };
        reader.readAsDataURL(file);
    });
}

function renderAddImgPreviews() {
    const row = document.getElementById('img-preview-row');
    if (!row) return;
    row.innerHTML = addImgs.map((src, i) => `
        <div class="img-thumb-wrap">
            <img class="img-thumb" src="${src}" alt="preview ${i+1}">
            <button class="del-img" onclick="removeAddImg(${i})">×</button>
        </div>
    `).join('');
}

function removeAddImg(i) {
    addImgs.splice(i, 1);
    renderAddImgPreviews();
}

function selEstat(el) {
    document.querySelectorAll('.estat-btn').forEach(b => b.classList.remove('sel'));
    el.classList.add('sel');
}

function publishItem() {
    const nameInput = document.getElementById('item-name');
    const catInput  = document.getElementById('item-cat');
    const descInput = document.getElementById('item-desc');
    const estatSel  = document.querySelector('.estat-btn.sel');

    const name = nameInput ? nameInput.value.trim() : '';
    const cat  = catInput  ? catInput.value  : '';
    const desc = descInput ? descInput.value.trim() : '';
    const est  = estatSel  ? estatSel.textContent : 'Nou';

    if (!name) { showToast('⚠️ Afegeix un nom a l\'objecte'); return; }

    const EMOJI_MAP = { 'Mobles':'🛋️','Electrònica':'📱','Roba':'👕','Esports':'🚲','Llar i cuina':'🏠','Llibres':'📚','Altres':'📦' };
    const emoji = EMOJI_MAP[cat] || '📦';
    const ESTAT_MAP = { 'Nou':'nou','Poc ús':'poc','Normal':'poc','Usat':'usat' };

    const newItem = {
        id:    Date.now(),
        name,
        emoji,
        user:  state.profile.name,
        estat: ESTAT_MAP[est] || 'poc',
        desc:  desc || 'Sense descripció.',
        img:   addImgs[0] || null,
    };

    state.feedItems.unshift(newItem);
    state.myItems.unshift({ id: newItem.id, name, emoji, estat: 'disponible', img: addImgs[0] || null });
    state.profile.publicats++;

    // Reset form
    if (nameInput) nameInput.value = '';
    if (catInput)  catInput.value  = '';
    if (descInput) descInput.value = '';
    addImgs = [];
    renderAddImgPreviews();
    document.querySelectorAll('.estat-btn').forEach((b,i) => b.classList.toggle('sel', i===0));

    renderFeed(state.activeFilter);
    renderProfile();

    nav('seccio_feed');
    showToast('✅ Objecte publicat!');
}

// ── CHATS ─────────────────────────────────────────────────────

function renderChats() {
    const list = document.getElementById('chat-list');
    if (!list) return;

    list.innerHTML = state.chats.map(c => `
        <div class="chat-item" onclick="showToast('💬 Obrint xat amb ${c.name}...')">
            <div class="chat-avatar">
                ${c.emoji}
                ${c.online ? '<div class="chat-online"></div>' : ''}
            </div>
            <div class="chat-body">
                <div class="chat-name">${c.name}</div>
                <div class="chat-preview">${c.preview}</div>
            </div>
            <div class="chat-meta">
                <div class="chat-time">${c.time}</div>
                ${c.unread > 0 ? `<div class="chat-unread">${c.unread}</div>` : ''}
            </div>
        </div>
    `).join('');

    // Update nav dot
    const totalUnread = state.chats.reduce((sum, c) => sum + c.unread, 0);
    const dot = document.getElementById('nav-dot-msg');
    if (dot) dot.classList.toggle('show', totalUnread > 0);
}

// ── TOAST ─────────────────────────────────────────────────────

let toastTimer = null;

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── AUTH ──────────────────────────────────────────────────────

function doLogin() {
    const email = document.getElementById('login-email');
    const pass  = document.getElementById('login-pass');
    if (!email || !email.value.trim()) { showToast('⚠️ Introdueix el correu'); return; }
    if (!pass  || !pass.value)         { showToast('⚠️ Introdueix la contrasenya'); return; }
    nav('seccio_feed');
    showToast('✅ Sessió iniciada!');
}

function doRegister() {
    const user  = document.getElementById('reg-user');
    const email = document.getElementById('reg-email');
    const pass  = document.getElementById('reg-pass');
    if (!user  || !user.value.trim())  { showToast('⚠️ Introdueix un nom d\'usuari'); return; }
    if (!email || !email.value.trim()) { showToast('⚠️ Introdueix el correu'); return; }
    if (!pass  || !pass.value)         { showToast('⚠️ Introdueix la contrasenya'); return; }

    state.profile.name   = user.value.trim();
    state.profile.handle = user.value.trim().toLowerCase().replace(/\s/g,'_');

    nav('seccio_feed');
    showToast('🎉 Compte creat!');
}

// ── RESPONSIVE NAV HEIGHT ─────────────────────────────────────

function adaptNavHeight() {
    const menu = document.getElementById('menu');
    if (!menu) return;
    const safeBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0');
    // On small screens with very small nav, ensure touch targets
    const h = menu.offsetHeight;
    document.documentElement.style.setProperty('--nav-height', h + 'px');
    updateToastPos();
}

// ── INIT ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Hide menu initially
    document.getElementById('menu').style.display = 'none';

    // Render data
    renderFeed();
    renderProfile();
    renderChats();

    // Adapt nav height
    adaptNavHeight();
    window.addEventListener('resize', adaptNavHeight);

    // Search input
    const searchInput = document.getElementById('feed-search');
    if (searchInput) {
        searchInput.addEventListener('input', e => searchFeed(e.target.value));
    }
});
