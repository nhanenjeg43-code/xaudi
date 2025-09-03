/* ==========================
   UTILITY FUNCTIONS
========================== */

// Local storage helper
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

// DOM selectors
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/* ==========================
   SEED DATA
========================== */

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
    cover: 'https://images.pexels.com/photos/373945/pexels-photo-373945.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
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
    cover: 'https://images.pexels.com/photos/164837/pexels-photo-164837.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
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
    cover: 'https://images.pexels.com/photos/414999/pexels-photo-414999.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
    files: 120,
    downloadLink: 'https://drive.google.com/example4'
  },
  {
    id: 'pack-2',
    title: 'Synth Essentials',
    price: 24.99,
    cover: 'https://images.pexels.com/photos/164879/pexels-photo-164879.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
    files: 80,
    downloadLink: 'https://drive.google.com/example5'
  }
];

const seedPresets = [
  {
    id: 'preset-1',
    title: 'Vocal Chain Pro',
    price: 14.99,
    cover: 'https://images.pexels.com/photos/166094/pexels-photo-166094.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
    daw: 'FL Studio',
    downloadLink: 'https://drive.google.com/example6'
  },
  {
    id: 'preset-2',
    title: 'R&B Vocal Master',
    price: 19.99,
    cover: 'https://images.pexels.com/photos/166093/pexels-photo-166093.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2',
    daw: 'Ableton',
    downloadLink: 'https://drive.google.com/example7'
  }
];

/* ==========================
   STATE VARIABLES
========================== */

let currentAudio = null;
let currentPlayingId = null;
let progressInterval = null;

/* ==========================
   DATA LOADING
========================== */

// Load products from localStorage
function loadProducts() {
  // First try to load from the new catalogProducts system
  const allProducts = store.get('catalogProducts', []);
  
  if (allProducts.length > 0) {
    // If we have products from the new system, organize them by category
    const beats = allProducts.filter(p => p.category === 'beats');
    const music = allProducts.filter(p => p.category === 'music');
    const packs = allProducts.filter(p => p.category === 'sample-packs');
    const presets = allProducts.filter(p => p.category === 'vocal-presets');
    
    return { beats, packs, presets, music };
  }
  
  // Fall back to the old system if no products in new system
  const beats = store.get('catalogBeats', seedBeats);
  const packs = store.get('catalogPacks', seedPacks);
  const presets = store.get('catalogPresets', seedPresets);
  const music = store.get('catalogMusic', seedBeats);
  
  return { beats, packs, presets, music };
}

// Load products from server.json
async function loadProductsFromServer() {
  try {
    const response = await fetch('/products.json');
    if (!response.ok) throw new Error('Failed to load products');

    const products = await response.json();

    return {
      beats: products.filter(p => p.category === 'beats'),
      music: products.filter(p => p.category === 'music'),
      packs: products.filter(p => p.category === 'sample-packs'),
      presets: products.filter(p => p.category === 'vocal-presets')
    };
  } catch (error) {
    console.error('Error loading products:', error);
    return loadProducts(); // fallback
  }
}

/* ==========================
   CATALOG INITIALIZATION
========================== */

function initCatalog() {
  if (!store.get('catalogBeats')) store.set('catalogBeats', seedBeats);
  if (!store.get('catalogPacks')) store.set('catalogPacks', seedPacks);
  if (!store.get('catalogPresets')) store.set('catalogPresets', seedPresets);
  if (!store.get('catalogMusic')) store.set('catalogMusic', seedBeats);
}

/* ==========================
   AUDIO PLAYER FUNCTIONS
========================== */

function playPreview(id, audioUrl, title) {
  const progressBar = $('#audioProgress');

  // Stop current audio if playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
    clearInterval(progressInterval);

    // Reset previous play button
    if (currentPlayingId) {
      const prevBtn = $(`button[data-id="${currentPlayingId}"]`);
      if (prevBtn) {
        prevBtn.innerHTML = '<span>Play</span>';
        prevBtn.classList.remove('playing');
      }
    }
  }

  // Stop if clicking the same button
  if (currentPlayingId === id) {
    currentPlayingId = null;
    updateNowPlaying('—');
    if (progressBar) progressBar.style.width = '0%';
    return;
  }

  // Update now playing
  updateNowPlaying(title);

  // Play new audio
  currentAudio = new Audio(audioUrl);
  currentPlayingId = id;

  const playBtn = $(`button[data-id="${id}"]`);
  if (playBtn) {
    playBtn.innerHTML = '<span>Stop</span>';
    playBtn.classList.add('playing');
  }

  currentAudio.play();

  // Update progress bar
  if (progressBar) {
    progressBar.style.width = '0%';
    progressInterval = setInterval(() => {
      if (currentAudio && currentAudio.duration > 0) {
        const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
        progressBar.style.width = percent + '%';
      }
    }, 100);
  }

  currentAudio.onended = () => {
    if (playBtn) {
      playBtn.innerHTML = '<span>Play</span>';
      playBtn.classList.remove('playing');
    }
    currentPlayingId = null;
    updateNowPlaying('—');
    if (progressBar) progressBar.style.width = '0%';
    clearInterval(progressInterval);
    currentAudio = null;
  };
}

function updateNowPlaying(title) {
  const nowPlaying = $('#nowPlaying');
  if (nowPlaying) nowPlaying.textContent = title;
}

/* ==========================
   RENDER FUNCTIONS
========================== */

function renderBeats() {
  const grid = $('#beatsGrid');
  if (!grid) return;

  const products = loadProducts();
  const beats = window.serverProducts?.beats || products.beats || [];
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

function renderMusic() {
  const grid = $('#musicGrid');
  if (!grid) return;

  const products = loadProducts();
  const music = window.serverProducts?.music || products.music || [];
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
    else list.reverse();

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

function renderPacks() {
  const grid = $('#packsGrid');
  if (!grid) return;

  const products = loadProducts();
  const packs = window.serverProducts?.packs || products.packs || [];

  grid.innerHTML = packs.map(p => cardSimple({
    ...p,
    subtitle: `${p.files || 50} files`
  })).join('');

  $$('button[data-add-generic]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-add-generic');
      const item = packs.find(i => i.id === id);
      if (item) addToCart({ id: item.id, title: item.title, price: item.price });
    };
  });
}

function renderPresets() {
  const grid = $('#presetsGrid');
  if (!grid) return;

  const products = loadProducts();
  const presets = window.serverProducts?.presets || products.presets || [];

  grid.innerHTML = presets.map(p => cardSimple({
    ...p,
    subtitle: p.daw || 'FL Studio'
  })).join('');

  $$('button[data-add-generic]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-add-generic');
      const item = presets.find(i => i.id === id);
      if (item) addToCart({ id: item.id, title: item.title, price: item.price });
    };
  });
}

function renderFeatured() {
  const grid = $('#featuredBeats');
  if (!grid) return;

  const products = loadProducts();
  const beats = (window.serverProducts?.beats || products.beats || []).slice(0, 3);

  grid.innerHTML = beats.map(b => beatCard({
    ...b,
    subtitle: `${b.bpm || 120} BPM • ${b.key || 'Cmin'}`
  })).join('');
  bindBeatActions();
}

/* ==========================
   CARD COMPONENTS
========================== */

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
        <div class="flex items-center gap-2">${tags}</div>
        <div class="flex items-center gap-2">
          <button class="btn play-btn" data-id="${b.id}" data-audio="${b.audio}" data-title="${b.title}"><span>Play</span></button>
          <button class="btn" data-action="add" data-id="${b.id}">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
}

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

/* ==========================
   EVENT BINDING
========================== */

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
      const products = loadProducts();
      const allBeats = [...products.beats, ...products.music];
      const item = allBeats.find(i => i.id === id);
      if (item) addToCart({ id: item.id, title: item.title, price: item.price });
    };
  });
}

/* ==========================
   CART FUNCTIONS
========================== */

function addToCart(item) {
  const cart = store.get('cart', []);
  cart.push(item);
  store.set('cart', cart);
  cartCount();
  alert(`Added "${item.title}" to cart!`);
}

function cartCount() {
  const count = store.get('cart', []).length;
  $$('#cartCount').forEach(el => el.textContent = count);
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


// ========== PAGE UTILITIES (footer year, checkout button) ==========
window.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Checkout demo "Pay" handling
  const payBtn = $('#payBtn');
  if (payBtn) {
    const updatePayState = () => {
      const hasItems = store.get('cart', []).length > 0;
      payBtn.disabled = !hasItems;
      if (payBtn.disabled) {
        payBtn.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        payBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    };
    updatePayState();

    payBtn.addEventListener('click', () => {
      const cart = store.get('cart', []);
      if (!cart.length) return;

      const total = cart.reduce((sum, i) => sum + (i.price || 0), 0);
      // Generate a simple receipt with download placeholders
      const receiptLines = cart.map((i, idx) => `${idx + 1}. ${i.title} — R${(i.price||0).toFixed(2)}`);
      const message = [
        '✅ Payment simulated successfully!',
        '',
        'Your order:',
        ...receiptLines,
        '',
        `Total: R${total.toFixed(2)}`,
        '',
        'Downloads are available from your purchase email or dashboard in a real integration.',
      ].join('\n');

      alert(message);
      // Clear cart after "payment"
      store.set('cart', []);
      renderCart?.();
      cartCount();
      updatePayState();
    });
  }
});
/* ==========================
   INITIALIZATION
========================== */

// Initialize the catalog when the script loads
initCatalog();

// Initialize cart count
cartCount();

// Render pages based on current page
if (typeof renderBeats === 'function' && $('#beatsGrid')) renderBeats();
if (typeof renderMusic === 'function' && $('#musicGrid')) renderMusic();
if (typeof renderPacks === 'function' && $('#packsGrid')) renderPacks();
if (typeof renderPresets === 'function' && $('#presetsGrid')) renderPresets();
if (typeof renderFeatured === 'function' && $('#featuredBeats')) renderFeatured();
if (typeof renderCart === 'function' && $('#cartList')) renderCart();
