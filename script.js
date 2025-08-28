
// --- Utilities ---
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)) }
};

// --- Seed demo catalog (can be replaced by your own) ---
const seedBeats = [
  { id: 'beat-01', title: 'Midnight Drive', price: 249, bpm: 90, key: 'Am', cover: 'https://images.pexels.com/photos/633409/pexels-photo-633409.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2', audio: 'assets/audio/silence.wav', tags: ['Trap','Dark'] },
  { id: 'beat-02', title: 'Sunset Bounce', price: 199, bpm: 100, key: 'Cm', cover: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2', audio: 'assets/audio/silence.wav', tags: ['Afro','Uplift'] },
  { id: 'beat-03', title: 'Neon Nights', price: 299, bpm: 140, key: 'Fm', cover: 'https://images.pexels.com/photos/2747446/pexels-photo-2747446.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2', audio: 'assets/audio/silence.wav', tags: ['Club','EDM'] },
];

const seedPacks = [
  { id: 'pack-01', title: 'Vocal Hooks Vol.1', price: 149, cover: 'https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2', files: 120, tags: ['Vocals','Hooks'] },
  { id: 'pack-02', title: 'Afro Essentials', price: 129, cover: 'https://images.pexels.com/photos/15905/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2', files: 220, tags: ['Afro','Percussion'] },
];

const seedPresets = [
  { id: 'preset-01', title: 'Clean Pop Vox', price: 99, daw: 'FL Studio', cover: 'https://images.pexels.com/photos/33779/hand-microphone-mic-hold.jpg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2' },
  { id: 'preset-02', title: 'Warm RnB Vox', price: 99, daw: 'Logic Pro', cover: 'https://images.pexels.com/photos/675960/pexels-photo-675960.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2' },
];

function initCatalog() {
  if (!store.get('catalogBeats')) store.set('catalogBeats', seedBeats);
  if (!store.get('catalogPacks')) store.set('catalogPacks', seedPacks);
  if (!store.get('catalogPresets')) store.set('catalogPresets', seedPresets);
}
initCatalog();

// --- Cart ---
function cartCount() {
  const cart = store.get('cart', []);
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const el = $('#cartCount'); if (el) el.textContent = count;
}
function addToCart(item) {
  const cart = store.get('cart', []);
  const idx = cart.findIndex(i => i.id === item.id);
  if (idx >= 0) cart[idx].qty += 1; else cart.push({ ...item, qty: 1 });
  store.set('cart', cart);
  cartCount();
}
function removeFromCart(id) {
  const cart = store.get('cart', []).filter(i => i.id !== id);
  store.set('cart', cart); renderCart();
}
function updateQty(id, qty) {
  const cart = store.get('cart', []);
  const item = cart.find(i => i.id === id); if (!item) return;
  item.qty = Math.max(1, qty|0); store.set('cart', cart); renderCart();
}

// --- Audio Player (single global) ---
const audio = new Audio();
let currentId = null;
audio.addEventListener('ended', () => {
  currentId = null; updateNowPlaying('—'); updateButtons();
});

function playTrack(track) {
  if (currentId === track.id && !audio.paused) {
    audio.pause(); updateButtons(); return;
  }
  audio.src = track.audio;
  audio.play().catch(()=>{});
  currentId = track.id;
  updateNowPlaying(track.title);
  updateButtons();
}

function updateNowPlaying(name) {
  const np = $('#nowPlaying'); if (np) np.textContent = name;
}

function updateButtons() {
  $$('.play-btn').forEach(btn => {
    const id = btn.getAttribute('data-id');
    const icon = btn.querySelector('span');
    if (id === currentId && !audio.paused) {
      btn.classList.add('bg-emerald-400','text-neutral-900');
      if (icon) icon.textContent = 'Pause';
    } else {
      btn.classList.remove('bg-emerald-400','text-neutral-900');
      if (icon) icon.textContent = 'Play';
    }
  });
}

// --- Render helpers ---
function beatCard(b) {
  const tags = (b.tags||[]).map(t=>`<span class="badge">${t}</span>`).join(' ');
  return `
  <div class="card">
    <img class="w-full h-40 object-cover" src="${b.cover}" alt="${b.title}">
    <div class="p-4 space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-medium">${b.title}</h3>
          <p class="text-xs text-neutral-400">${b.bpm} BPM • ${b.key}</p>
        </div>
        <div class="text-right">
          <p class="text-lg font-semibold">R${b.price}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        ${tags}
      </div>
      <div class="flex items-center gap-2">
        <button class="btn play-btn" data-id="${b.id}"><span>Play</span></button>
        <button class="btn" data-action="add" data-id="${b.id}">Add to Cart</button>
      </div>
    </div>
  </div>`;
}

function renderFeatured() {
  const el = $('#featuredBeats'); if (!el) return;
  const beats = store.get('catalogBeats', []).slice(0,3);
  el.innerHTML = beats.map(beatCard).join('');
  bindBeatActions();
}
function renderBeats() {
  const grid = $('#beatsGrid'); if (!grid) return;
  let beats = store.get('catalogBeats', []);
  const q = $('#searchBeats'); const s = $('#sortBeats');
  const apply = () => {
    let list = [...beats];
    const term = (q?.value||'').toLowerCase();
    if (term) list = list.filter(b => b.title.toLowerCase().includes(term) || (b.tags||[]).some(t=>t.toLowerCase().includes(term)));
    if (s?.value==='priceLow') list.sort((a,b)=>a.price-b.price);
    else if (s?.value==='priceHigh') list.sort((a,b)=>b.price-a.price);
    else list.reverse();
    grid.innerHTML = list.map(beatCard).join('');
    bindBeatActions();
  };
  if (q) q.oninput = apply;
  if (s) s.onchange = apply;
  apply();
}

function bindBeatActions() {
  $$('.play-btn').forEach(btn => btn.onclick = () => {
    const id = btn.getAttribute('data-id');
    const item = store.get('catalogBeats', []).find(i => i.id===id);
    if (item) playTrack(item);
  });
  $$('button[data-action="add"]').forEach(btn => btn.onclick = () => {
    const id = btn.getAttribute('data-id');
    const item = store.get('catalogBeats', []).find(i => i.id===id);
    if (item) addToCart({ id: item.id, title: item.title, price: item.price });
  });
  updateButtons();
}

function cardSimple(it) {
  return `
  <div class="card">
    <img class="w-full h-40 object-cover" src="${it.cover}" alt="${it.title}">
    <div class="p-4 space-y-3">
      <h3 class="font-medium">${it.title}</h3>
      <p class="text-sm text-neutral-400">${it.subtitle||''}</p>
      <div class="flex items-center justify-between">
        <span class="font-semibold">R${it.price}</span>
        <button class="btn" data-add-generic="${it.id}">Add to Cart</button>
      </div>
    </div>
  </div>`;
}

function renderMusic() {
  const grid = $('#musicGrid'); if (!grid) return;
  const beats = store.get('catalogBeats', []);
  grid.innerHTML = beats.map(b => cardSimple({ ...b, subtitle: `${b.bpm} BPM • ${b.key}` })).join('');
  $$('button[data-add-generic]').forEach(btn => btn.onclick = () => {
    const id = btn.getAttribute('data-add-generic');
    const item = store.get('catalogBeats', []).find(i => i.id===id);
    if (item) addToCart({ id: item.id, title: item.title, price: item.price });
  });
}

function renderPacks() {
  const grid = $('#packsGrid'); if (!grid) return;
  const packs = store.get('catalogPacks', []);
  grid.innerHTML = packs.map(p => cardSimple({ ...p, subtitle: `${p.files} files` })).join('');
  $$('button[data-add-generic]').forEach(btn => btn.onclick = () => {
    const id = btn.getAttribute('data-add-generic');
    const item = store.get('catalogPacks', []).find(i => i.id===id);
    if (item) addToCart({ id: item.id, title: item.title, price: item.price });
  });
}

function renderPresets() {
  const grid = $('#presetsGrid'); if (!grid) return;
  const presets = store.get('catalogPresets', []);
  grid.innerHTML = presets.map(p => cardSimple({ ...p, subtitle: p.daw })).join('');
  $$('button[data-add-generic]').forEach(btn => btn.onclick = () => {
    const id = btn.getAttribute('data-add-generic');
    const item = store.get('catalogPresets', []).find(i => i.id===id);
    if (item) addToCart({ id: item.id, title: item.title, price: item.price });
  });
}

function renderCart() {
  const wrap = $('#cartList'); if (!wrap) return;
  const cart = store.get('cart', []);
  wrap.innerHTML = cart.length ? cart.map(item => `
    <div class="flex items-center justify-between gap-4 border border-neutral-800 rounded-xl p-4">
      <div>
        <p class="font-medium">${item.title}</p>
        <p class="text-sm text-neutral-400">R${item.price} each</p>
      </div>
      <div class="flex items-center gap-2">
        <input type="number" min="1" value="${item.qty}" class="w-16 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800" data-qty="${item.id}" />
        <button class="btn" data-remove="${item.id}">Remove</button>
      </div>
    </div>
  `).join('') : '<p class="text-neutral-400">Your cart is empty.</p>';
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const t = $('#cartTotal'); if (t) t.textContent = 'R'+total;
  $$('input[data-qty]').forEach(inp => inp.onchange = () => updateQty(inp.getAttribute('data-qty'), parseInt(inp.value,10)||1));
  $$('button[data-remove]').forEach(btn => btn.onclick = () => removeFromCart(btn.getAttribute('data-remove')));
  cartCount();
}

function bindCheckout() {
  const pay = $('#payBtn');
  if (pay) pay.onclick = () => {
    alert('Demo payment successful! (Static site)');
    store.set('cart', []); renderCart(); cartCount();
  };
}

// Upload (client-side add to catalog)
function bindUpload() {
  const form = $('#uploadForm'); if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const beats = store.get('catalogBeats', []);
    const id = 'beat-' + (Date.now());
    let audioPath = 'assets/audio/silence.wav';
    const file = data.get('audio');
    if (file && file.name) {
      // Can't persist files on GitHub Pages from the browser, keep silence placeholder
    }
    const item = {
      id,
      title: data.get('title') || 'Untitled',
      price: Number(data.get('price')||0),
      bpm: 120, key: 'C',
      cover: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
      audio: audioPath,
      tags: String(data.get('tags')||'').split(',').map(s=>s.trim()).filter(Boolean)
    };
    beats.unshift(item); store.set('catalogBeats', beats);
    window.location.href = 'beats.html';
  };
}

function bindAdminUpload() {
  const form = $('#adminUploadForm'); if (!form) return;
  form.onsubmit = (e) => {
    e.preventDefault();
    alert('Saved locally (demo).');
  };
}

// Global init
function init() {
  // year
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  cartCount();
  renderFeatured();
  renderBeats();
  renderMusic();
  renderPacks();
  renderPresets();
  renderCart();
  bindCheckout();
  bindUpload();
  bindAdminUpload();
}
document.addEventListener('DOMContentLoaded', init);
