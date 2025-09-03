/* ==========================
   UTILITY FUNCTIONS
========================== */
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
function loadProducts() {
  const allProducts = store.get('catalogProducts', []);
  if (allProducts.length > 0) {
    return {
      beats: allProducts.filter(p => p.category === 'beats'),
      music: allProducts.filter(p => p.category === 'music'),
      packs: allProducts.filter(p => p.category === 'sample-packs'),
      presets: allProducts.filter(p => p.category === 'vocal-presets')
    };
  }
  return {
    beats: seedBeats.map(b => ({ ...b, category: 'beats' })),
    music: seedBeats.map(b => ({ ...b, category: 'music', id: `${b.id}-music` })),
    packs: seedPacks.map(p => ({ ...p, category: 'sample-packs' })),
    presets: seedPresets.map(pr => ({ ...pr, category: 'vocal-presets' }))
  };
}
async function loadProductsFromServer() {
  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('Failed to load products');
    const products = await response.json();
    return {
      beats: products.filter(p => p.category === 'beats'),
      music: products.filter(p => p.category === 'music'),
      packs: products.filter(p => p.category === 'sample-packs'),
      presets: products.filter(p => p.category === 'vocal-presets')
    };
  } catch (e) {
    console.warn('No products.json found, using seed data');
    throw e;
  }
}

/* ==========================
   RENDER FUNCTIONS
========================== */
function cardBeat(b) {
  const tags = b.tags ? b.tags.map(t => `<span class="badge">${t}</span>`).join('') : '';
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
        <div class="progress-bar">
          <div class="progress-fill" data-id="${b.id}"></div>
        </div>
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
        <p class="text-sm text-neutral-400">${it.files ? `${it.files} files` : it.daw || ''}</p>
        <div class="flex items-center justify-between">
          <span class="font-semibold">R${it.price}</span>
          <button class="btn" data-action="add" data-id="${it.id}">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
}

/* ==========================
   PAGE RENDERERS
========================== */
function renderBeats() {
  const grid = $('#beatsGrid');
  if (!grid) return;
  const sortSelect = $('#sortSelect');
  let currentSort = 'newest';
  if (sortSelect) {
    sortSelect.onchange = (e) => {
      currentSort = e.target.value;
      renderGrid();
    };
  }
  function renderGrid() {
    const products = loadProducts();
    const sorted = sortProducts(products.beats, currentSort);
    grid.innerHTML = sorted.map(cardBeat).join('');
    bindBeatActions();
  }
  renderGrid();
}
function renderMusic() {
  const grid = $('#musicGrid');
  if (!grid) return;
  const sortSelect = $('#sortSelect');
  let currentSort = 'newest';
  if (sortSelect) {
    sortSelect.onchange = (e) => {
      currentSort = e.target.value;
      renderGrid();
    };
  }
  function renderGrid() {
    const products = loadProducts();
    const sorted = sortProducts(products.music, currentSort);
    grid.innerHTML = sorted.map(cardBeat).join('');
    bindBeatActions();
  }
  renderGrid();
}
function renderPacks() {
  const grid = $('#packsGrid');
  if (!grid) return;
  const sortSelect = $('#sortSelect');
  let currentSort = 'newest';
  if (sortSelect) {
    sortSelect.onchange = (e) => {
      currentSort = e.target.value;
      renderGrid();
    };
  }
  function renderGrid() {
    const products = loadProducts();
    const sorted = sortProducts(products.packs, currentSort);
    grid.innerHTML = sorted.map(cardSimple).join('');
    bindGenericActions('packs');
  }
  renderGrid();
}
function renderPresets() {
  const grid = $('#presetsGrid');
  if (!grid) return;
  const sortSelect = $('#sortSelect');
  let currentSort = 'newest';
  if (sortSelect) {
    sortSelect.onchange = (e) => {
      currentSort = e.target.value;
      renderGrid();
    };
  }
  function renderGrid() {
    const products = loadProducts();
    const sorted = sortProducts(products.presets, currentSort);
    grid.innerHTML = sorted.map(cardSimple).join('');
    bindGenericActions('presets');
  }
  renderGrid();
}
function renderFeatured() {
  const grid = $('#featuredBeats');
  if (!grid) return;
  const products = loadProducts();
  const featured = products.beats.slice(0, 3);
  grid.innerHTML = featured.map(cardBeat).join('');
  bindBeatActions();
}
function sortProducts(products, sortBy) {
  if (sortBy === 'price-low') {
    return [...products].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    return [...products].sort((a, b) => b.price - a.price);
  }
  return products;
}

/* ==========================
   EVENT BINDING
========================== */
function bindBeatActions() {
  $$('.play-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const audio = btn.getAttribute('data-audio');
      const title = btn.getAttribute('data-title');
      playPreview(id, audio, title);
    };
  });
  $$('button[data-action="add"]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const products = loadProducts();
      const allItems = [...products.beats, ...products.music];
      const item = allItems.find(i => i.id === id);
      if (item) addToCart({ id: item.id, title: item.title, price: item.price });
    };
  });
}
function bindGenericActions(category) {
  $$('button[data-action="add"]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const products = loadProducts();
      const items = category === 'packs' ? products.packs : products.presets;
      const item = items.find(i => i.id === id);
      if (item) addToCart({ id: item.id, title: item.title, price: item.price });
    };
  });
}
function playPreview(id, audioUrl, title) {
  const btnSpan = $(`.play-btn[data-id="${id}"] span`);
  const progressFill = $(`.progress-fill[data-id="${id}"]`);
  if (currentPlayingId === id) {
    if (currentAudio.paused) {
      currentAudio.play();
      btnSpan.textContent = 'Pause';
    } else {
      currentAudio.pause();
      btnSpan.textContent = 'Play';
      if (progressFill) progressFill.style.width = `${(currentAudio.currentTime / currentAudio.duration) * 100}%`;
    }
    return;
  }
  if (currentAudio) {
    currentAudio.pause();
    clearInterval(progressInterval);
    const oldBtn = $(`.play-btn[data-id="${currentPlayingId}"] span`);
    if (oldBtn) oldBtn.textContent = 'Play';
    const oldProgress = $(`.progress-fill[data-id="${currentPlayingId}"]`);
    if (oldProgress) oldProgress.style.width = '0%';
  }
  currentAudio = new Audio(audioUrl);
  currentAudio.play();
  btnSpan.textContent = 'Pause';
  currentPlayingId = id;
  const nowPlaying = $('#nowPlaying');
  if (nowPlaying) nowPlaying.textContent = title;
  if (progressFill) progressFill.style.width = '0%';
  progressInterval = setInterval(() => {
    if (currentAudio && progressFill) {
      const progress = (currentAudio.currentTime / currentAudio.duration) * 100 || 0;
      progressFill.style.width = `${progress}%`;
    }
  }, 100);
  currentAudio.onended = () => {
    clearInterval(progressInterval);
    if (progressFill) progressFill.style.width = '0%';
    btnSpan.textContent = 'Play';
    currentPlayingId = null;
    if (nowPlaying) nowPlaying.textContent = '—';
  };
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

/* ==========================
   ADMIN FUNCTIONS
========================== */
function initAdmin() {
  const loginForm = $('#loginForm');
  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();
      const password = $('#password').value;
      if (password === 'admin') {
        $('#loginSection').style.display = 'none';
        $('#uploadSection').style.display = 'block';
      } else {
        $('#loginError').style.display = 'block';
      }
    };
  }
  const categorySelect = $('#category');
  if (categorySelect) {
    categorySelect.onchange = () => {
      updateFields();
      updatePreview();
    };
  }
  const uploadForm = $('#uploadForm');
  if (uploadForm) {
    uploadForm.oninput = updatePreview;
  }
  const uploadBtn = $('#uploadBtn');
  if (uploadBtn) {
    uploadBtn.onclick = uploadProduct;
  }
  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      $('#uploadSection').style.display = 'none';
      $('#loginSection').style.display = 'block';
      $('#password').value = '';
      $('#loginError').style.display = 'none';
    };
  }
  updateFields();
  updatePreview();
}
function updateFields() {
  $$('.conditional-field').forEach(field => field.style.display = 'none');
  const cat = $('#category').value;
  if (cat === 'Beats' || cat === 'Music') {
    $('#bpmField').style.display = 'block';
    $('#keyField').style.display = 'block';
    $('#audioField').style.display = 'block';
  } else if (cat === 'Sample Packs') {
    $('#filesField').style.display = 'block';
  } else if (cat === 'Vocal Presets') {
    $('#dawField').style.display = 'block';
  }
}
function updatePreview() {
  const title = $('#title').value || 'Product Title';
  const price = $('#price').value || '0';
  const cover = $('#cover').value || 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=640&h=400&dpr=2';
  const audio = $('#audio').value;
  const bpm = $('#bpm').value;
  const key = $('#key').value;
  const daw = $('#daw').value;
  const files = $('#files').value;
  const tagsStr = $('#tags').value;
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).map(t => `<span class="badge">${t}</span>`).join('') : '';
  const cat = $('#category').value;
  let details = 'Details will appear here';
  if (cat === 'Beats' || cat === 'Music') {
    details = `${bpm || 120} BPM • ${key || 'Cmin'}`;
  } else if (cat === 'Sample Packs') {
    details = `${files || 0} files`;
  } else if (cat === 'Vocal Presets') {
    details = daw || 'DAW';
  }
  $('#previewTitle').textContent = title;
  $('#previewDetails').textContent = details;
  $('#previewPrice').textContent = `R${price}`;
  $('#previewCover').src = cover;
  $('#previewTags').innerHTML = tags;
  if (audio && (cat === 'Beats' || cat === 'Music')) {
    $('#previewAudio source').src = audio;
    $('#previewAudio').load();
    $('#previewAudio').style.display = 'block';
  } else {
    $('#previewAudio').style.display = 'none';
  }
}
function uploadProduct() {
  const categoryDisplay = $('#category').value;
  const category = categoryDisplay.toLowerCase().replace(/ /g, '-');
  const title = $('#title').value;
  const price = parseFloat($('#price').value);
  const cover = $('#cover').value;
  const downloadLink = $('#downloadLink').value;
  const tagsStr = $('#tags').value;
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];
  if (!title || !price || !cover || !downloadLink) {
    showStatus('error', 'Please fill all required fields');
    return;
  }
  const item = {
    id: `product-${Date.now()}`,
    title,
    price,
    cover,
    downloadLink,
    tags,
    category
  };
  if (category === 'beats' || category === 'music') {
    item.audio = $('#audio').value;
    item.bpm = parseInt($('#bpm').value) || 120;
    item.key = $('#key').value || 'Cmin';
  } else if (category === 'sample-packs') {
    item.files = parseInt($('#files').value) || 0;
  } else if (category === 'vocal-presets') {
    item.daw = $('#daw').value;
  }
  const all = store.get('catalogProducts', []);
  all.push(item);
  store.set('catalogProducts', all);
  showStatus('success', 'Product uploaded successfully');
  $$('#uploadForm input').forEach(input => input.value = '');
  updatePreview();
}
function showStatus(type, message) {
  const status = $('#uploadStatus');
  if (!status) return;
  status.classList.remove('upload-success', 'upload-error', 'upload-loading');
  status.classList.add(`upload-${type}`);
  status.textContent = message;
  status.style.display = 'block';
  setTimeout(() => status.style.display = 'none', 5000);
}

/* ==========================
   INITIALIZATION
========================== */
async function initCatalog() {
  try {
    const serverProducts = await loadProductsFromServer();
    const all = [
      ...serverProducts.beats,
      ...serverProducts.music,
      ...serverProducts.packs,
      ...serverProducts.presets
    ];
    store.set('catalogProducts', all);
  } catch (e) {
    const allSeed = [
      ...seedBeats.map(b => ({ ...b, category: 'beats' })),
      ...seedBeats.map(b => ({ ...b, category: 'music', id: `${b.id}-music` })),
      ...seedPacks.map(p => ({ ...p, category: 'sample-packs' })),
      ...seedPresets.map(pr => ({ ...pr, category: 'vocal-presets' }))
    ];
    store.set('catalogProducts', allSeed);
  }
}
const categoriesDropdowns = $$('.categories-dropdown');
categoriesDropdowns.forEach(d => {
  d.addEventListener('click', (e) => {
    if (window.innerWidth <= 767) {
      d.classList.toggle('open');
      e.stopPropagation();
    }
  });
});
document.addEventListener('click', () => {
  categoriesDropdowns.forEach(d => d.classList.remove('open'));
});
initCatalog().then(() => {
  cartCount();
  if ($('#beatsGrid')) renderBeats();
  if ($('#musicGrid')) renderMusic();
  if ($('#packsGrid')) renderPacks();
  if ($('#presetsGrid')) renderPresets();
  if ($('#featuredBeats')) renderFeatured();
  if ($('#cartList')) renderCart();
  if ($('#loginForm')) initAdmin();
});