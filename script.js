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

  const music = store.get('catalogBeats', []);

  grid.innerHTML = music.map(b => cardSimple({
    ...b,
    subtitle: `${b.bpm || 120} BPM • ${b.key || 'Cmin'}`
  })).join('');

  $$('button[data-add-generic]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-add-generic');
      const item = store.get('catalogBeats', []).find(i => i.id === id);
      if (item) addToCart({ id: item.id, title: item.title, price: item.price });
    };
  });
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

  $$('button[data-add-generic]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-add-generic');
      const item = store.get('catalogPresets', []).find(i => i.id === id);
      if (item) addToCart({ id: item.id, title: item.title, price: item.price });
    };
  });
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
          <button class="btn play-btn" data-id="${b.id}"><span>Play</span></button>
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

// Init on page load
function init() {
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();

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
