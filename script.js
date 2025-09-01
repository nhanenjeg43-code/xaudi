// Add this function to your script.js
function loadProducts() {
  // Load products from all categories
  const beats = store.get('catalogBeats', seedBeats);
  const packs = store.get('catalogPacks', seedPacks);
  const presets = store.get('catalogPresets', seedPresets);
  
  return { beats, packs, presets };
}

// Update the initCatalog function
function initCatalog() {
  if (!store.get('catalogBeats')) store.set('catalogBeats', seedBeats);
  if (!store.get('catalogPacks')) store.set('catalogPacks', seedPacks);
  if (!store.get('catalogPresets')) store.set('catalogPresets', seedPresets);
  
  // Also initialize music with beats data
  if (!store.get('catalogMusic')) store.set('catalogMusic', seedBeats);
}
