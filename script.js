// Store utility functions
const store = {
  get: (key, fallback = []) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// DOM utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Seed data
const seedBeats = [
  {
    id: 'beat-1',
    title: 'Midnight Vibes',
    price: 29.99,
    cover: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
    audio: 'assets/audio/silence.wav',
    bpm: 85,
    key: 'Cmin',
    tags: ['Trap', 'Dark', 'HipHop'],
    downloadLink: 'https://drive.google.com/example1'
  },
  {
    id: 'beat-2',
    title: 'Summer Dreams',
    price: 24.99,
    cover: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
    audio: 'assets/audio/silence.wav',
    bpm: 95,
    key: 'Fmaj',
    tags: ['Pop', 'Chill', 'Summer'],
    downloadLink: 'https://drive.google.com/example2'
  },
  {
    id: 'beat-3',
    title: 'Urban Flow',
    price: 34.99,
    cover: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
    audio: 'assets/audio/silence.wav',
    bpm: 75,
    key: 'Gmin',
    tags: ['R&B', 'Soul', 'Urban'],
    downloadLink: 'https://drive.google.com/example3'
  }
];

const seedPacks = [
  {
    id: 'pack-1',
    title: 'Drum Kit Vol. 1',
    price: 19.99,
    cover: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
    files: 120,
    downloadLink: 'https://drive.google.com/example4'
  },
  {
    id: 'pack-2',
    title: 'Synth Essentials',
    price: 24.99,
    cover: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
    files: 80,
    downloadLink: 'https://drive.google.com/example5'
  }
];

const seedPresets = [
  {
    id: 'preset-1',
    title: 'Vocal Chain Pro',
    price: 14.99,
    cover: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
    daw: 'FL Studio',
    downloadLink: 'https://drive.google.com/example6'
  },
  {
    id: 'preset-2',
    title: 'R&B Vocal Master',
    price: 19.99,
    cover: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
    daw: 'Ableton',
    downloadLink: 'https://drive.google.com/example7'
  }
];

// Audio player state
let currentAudio = null;
let currentPlayingId = null;

// Load all products from store
function loadProducts() {
  const beats = store.get('catalogBeats', seedBeats);
  const packs = store.get('catalogPacks', seedPacks);
  const presets = store.get('catalogPresets', seedPresets);

  return { beats, packs, presets };
}

// Initialize catalog with seed data if missing
function initCatalog() {
  if (!store.get('catalogBeats')) store.set('catalogBeats', seedBeats);
  if (!store.get('catalogPacks')) store.set('catalogPacks', seedPacks);
  if (!store.get('catalogPresets')) store.set('catalogPresets', seedPresets);

  // Initialize music using beats data
  if (!store.get('catalogMusic')) store.set('catalogMusic', seedBeats);
}

// Play audio preview
function playPreview(id, audioUrl, title) {
  // Stop current audio if playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
    
    // Reset previous play button
    if (currentPlayingId) {
      const prevBtn = $(`button[data-id="${currentPlayingId}"]`);
      if (prevBtn) {
        prevBtn.innerHTML = '<span>Play</span>';
        prevBtn.classList.remove('playing');
      }
    }
  }

  // If clicking the same button that's already playing, just stop it
  if (currentPlayingId === id) {
    currentPlayingId = null;
    updateNowPlaying('—');
    return;
  }

  // Update now playing text
  updateNowPlaying(title);

  // Create and play new audio
  currentAudio = new Audio(audioUrl);
  currentPlayingId = id;
  
  // Update play button
  const playBtn = $(`button[data-id="${id}"]`);
  if (playBtn) {
    playBtn.innerHTML = '<span>Stop</span>';
    playBtn.classList.add('playing');
  }

  currentAudio.play();
  
  currentAudio.onended = () => {
    if (playBtn) {
      playBtn.innerHTML = '<span>Play</span>';
      playBtn.classList.remove('playing');
    }
    currentPlayingId = null;
    updateNowPlaying('—');
    currentAudio = null;
  };
}

// Update now playing text
function updateNowPlaying(title) {
  const nowPlaying = $('#nowPlaying');
  if (nowPlaying) {
    nowPlaying.textContent = title;
  }
}

// Render Beats page
function renderBeats() {
  const grid = $('#beatsGrid');
  if (!grid) return;

  let beats = store.get('catalogBeats', []);
  const q = $('#searchBeats');
  const s = $('#sortBeats');

  const apply = () => {
    let list = [...beats];
    const term = (q?.value || '').toLowerCase();

    if (term) {
      list = list.filter(b =>
        b.title.toLowerCase().includes(term) ||
        (b.tags || []).some(t => t.toLowerCase().includes(term))
      );
    }

    if (s?.value === 'priceLow') list.sort((a, b) => a.price - b.price);
    else if (s?.value === 'priceHigh') list.sort((a, b) => b.price - a.price);
    else list.reverse(); // newest first

    grid.innerHTML = list.map(beatCard).join('');
    bindBeatActions();
  };

  if (q) q.oninput = apply;
  if (s) s.onchange = apply;
  apply();
}

// Render Music page (uses beats data)
function renderMusic() {
  const grid = $('#musicGrid');
  if (!grid) return;

  let music = store.get('catalogBeats', []);
  const q = $('#searchMusic');
  const s = $('#sortMusic');

  const apply = () => {
    let list = [...music];
    const term = (q?.value || '').toLowerCase();

    if (term) {
      list = list.filter(b =>
        b.title.toLowerCase().includes(term) ||
        (b.tags || []).some(t => t.toLowerCase().includes(term))
      );
    }

    if (s?.value === 'priceLow') list.sort((a, b) => a.price - b.price);
    else if (s?.value === 'priceHigh') list.sort((a, b) => b.price - a.price);
    else list.reverse(); // newest first

    grid.innerHTML = list.map(b => beatCard({
      ...b,
      subtitle: `${b.bpm || 120} BPM • ${b.key || 'Cmin'}`
    })).join('');
    bindBeatActions();
  };

  if (q) q.oninput = apply;
  if (s) s.onchange = apply;
  apply();
}

// Render Packs page
function renderPacks() {
  const grid = $('#packsGrid');
  if (!grid) return;

  const packs = store.get('catalogPacks', []);

  grid.innerHTML = packs.map(p => cardSimple({
    ...p,
    subtitle: `${p.files || 50} files`
  })).join('');

  $$('button[data-add-generic]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-add-generic');
      const item = store.get('catalogPacks', []).find(i => i.id === id);
      if (item) addToCart({ id: item.id, title: item.title, price: item.price });
    };
  });
}

// Render Presets page
function renderPresets() {
  const grid = $('#presetsGrid');
  if (!grid) return;

  const presets = store.get('catalogPresets', []);

  grid.innerHTML = presets.map(p => cardSimple({
    ...p,
    subtitle: p.daw || 'FL Studio'
  })).join('');

  $$('button极[data-add-generic]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-add-generic');
      const item = store.get('catalogPresets', []).find(i => i.id === id);
      if (item) addToCart({ id: item.id, title: item.title, price: item.price });
    };
  });
}

// Render featured beats on homepage
function renderFeatured() {
  const grid = $('#featuredBeats');
  if (!grid) return;

  const beats = store.get('catalogBeats', []).slice(0, 3); // First 3 beats

  grid.innerHTML = beats.map(b => beatCard({
    ...b,
    subtitle: `${b.bpm || 120} BPM • ${b.key || 'Cmin'}`
  })).join('');
  bindBeatActions();
}

// Beat Card (detailed)
function beatCard(b) {
  const tags = (b.tags || []).map(t => `<span class="badge">${t}</span>`).join(' ');
  return `
    <div class="card">
      <img class="w-full h-40 object-cover" src="${b.cover}" alt="${b.title}" 
           onerror="this.src='https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2'">
      <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium">${b.title}</h3>
            <p class="text-xs text-neutral-400">${b.bpm || 120} BPM • ${b.key || 'Cmin'}</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-semibold">R${b.price}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          ${tags}
        </div>
        <div class="flex items-center gap-2">
          <button class="btn play-btn" data-id="${b.id}" data-audio="${b.audio}" data-title="${b.title}"><span>Play</span></button>
          <button class="btn" data-action="add" data-id="${b.id}">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
}

// Simple Card (generic)
function cardSimple(it) {
  return `
    <div class="card">
      <img class="w-full h-40 object-cover" src="${it.cover}" alt="${it.title}" 
           onerror="this.src='https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2'">
      <div class="p-4 space-y-3">
        <h3 class="font-medium">${it.title}</h3>
        <p class="text-sm text-neutral-400">${it.subtitle || ''}</p>
        <div class="flex items-center justify-between">
          <span class="font-semibold">R${it.price}</span>
          <button class="btn" data-add-generic="${it.id}">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
}

// Bind beat actions (play and add to cart)
function bindBeatActions() {
  // Play buttons
  $$('.play-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const audio = btn.getAttribute('data-audio');
      const title = btn.getAttribute('data-title');
      playPreview(id, audio, title);
    };
  });

  // Add to cart buttons
  $$('button[data-action="add"]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = store.get('catalogBeats', []).find(i => i.id === id);
      if (item) addToCart({ id: item.id, title: item.title, price: item.price });
    };
  });
}

// Cart functionality
function addToCart(item) {
  const cart = store.get('cart', []);
  cart.push(item);
  store.set('cart', cart);
  cartCount();
  
  // Show confirmation
  alert(`Added "${item.title}" to cart!`);
}

function cartCount() {
  const count = store.get('cart', []).length;
  $$('#cartCount').forEach(el => {
    el.textContent = count;
  });
}

function renderCart() {
  const list = $('#cartList');
  if (!list) return;

  const cart = store.get('cart', []);
  const total = $('#cartTotal');

  if (cart.length === 0) {
    list.innerHTML = '<p class="text-neutral-400 py-4">Your cart is empty.</p>';
    if (total) total.textContent = 'R0';
    return;
  }

  list.innerHTML = cart.map((item, index) => `
    <div class="flex items-center justify-between py-3 border-b border-neutral-800">
      <div>
        <p class="font-medium">${item.title}</p>
        <p class="text-sm text-neutral-400">R${item.price}</p>
      </div>
      <button class="text-red-400 hover:text-red-300" data-remove="${index}">Remove</button>
    </div>
  `).join('');

  if (total) {
    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
    total.textContent = `R${cartTotal.toFixed(2)}`;
  }

  // Bind remove buttons
  $$('button[data-remove]').forEach(btn => {
    btn.onclick = () => {
      const index = parseInt(btn.getAttribute('data-remove'));
      const cart = store.get('cart', []);
      cart.splice(index, 1);
      store.set('cart', cart);
      renderCart();
      cartCount();
    };
  });
}

// Upload form
function setupUpload() {
  const form = $('#uploadForm');
  if (!form) return;

  form.onsubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const title = formData.get('title');
    const price = parseFloat(formData.get('price'));
    const type = formData.get('type');
    const bpm = formData.get('bpm');
    const key = formData.get('key');
    const tags = formData.get('tags').split(',').map(t => t.trim()).filter(Boolean);

    const newItem = {
      id: `${type}-${Date.now()}`,
      title,
      price,
      cover: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
      audio: 'assets/audio/silence.wav',
      bpm: bpm || 120,
      key: key || 'Cmin',
      tags,
      downloadLink: '#'
    };

    const keyMap = {
      beats: 'catalogBeats',
      packs: 'catalogPacks',
      presets: 'catalogPresets'
    };

    const storeKey = keyMap[type];
    if (storeKey) {
      const items = store.get(storeKey, []);
      items.push(newItem);
      store.set(storeKey, items);
    }

    alert(`Uploaded "${title}" successfully!`);
    form.reset();
  };
}

// Initialize page based on current page
function initPage() {
  initCatalog();
  cartCount();

  if ($('#beatsGrid')) renderBeats();
  if ($('#musicGrid')) renderMusic();
  if ($('#packsGrid')) renderPacks();
  if ($('#presetsGrid')) renderPresets();
  if ($('#featuredBeats')) renderFeatured();
  if ($('#cartList')) renderCart();
  if ($('#uploadForm')) setupUpload();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);
[file content end]

[file name]: style.css
[file content begin]
/* Global styles */
.card {
  @apply rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-900/50 backdrop-blur transition-all hover:border-neutral-700;
}

.btn {
  @apply px-3 py-2 rounded-xl border border-neutral-800 text-sm transition-all hover:bg-neutral-800 hover:border-neutral-700;
}

.btn.playing {
  @apply bg-emerald-400/10 border-emerald-400/30 text-emerald-400;
}

.badge {
  @apply px-2 py-1 text-xs rounded-full bg-neutral-800 text-neutral-400;
}

/* Audio player styles */
.audio-player {
  width: 100%;
  height: 4px;
  background: #333;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}

.audio-progress {
  height: 100%;
  background: #10b981;
  width: 0%;
  transition: width 0.1s linear;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #404040;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #525252;
}
