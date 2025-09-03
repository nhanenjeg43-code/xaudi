// Global variables
let cart = [];
let currentAudio = null;
let currentAudioElement = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    updateCartCount();
    
    // Load products based on current page
    if (document.getElementById('featuredBeats')) {
        loadFeaturedBeats();
    }
    
    if (document.getElementById('beatsGrid')) {
        loadBeats();
    }
    
    if (document.getElementById('musicGrid')) {
        loadMusic();
    }
    
    if (document.getElementById('packsGrid')) {
        loadSamplePacks();
    }
    
    if (document.getElementById('presetsGrid')) {
        loadVocalPresets();
    }
    
    if (document.getElementById('cartList')) {
        loadCartItems();
        updateCartTotal();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Setup checkout button if exists
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
        payBtn.addEventListener('click', checkout);
    }
});

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count in the header
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(element => {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        element.textContent = totalItems;
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInputs = document.querySelectorAll('input[type="text"][id$="Search"], #searchBeats, #searchMusic, #searchPacks, #searchPresets');
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const id = this.id;
            if (id.includes('Beats')) filterAndSortProducts('beats');
            else if (id.includes('Music')) filterAndSortProducts('music');
            else if (id.includes('Packs')) filterAndSortProducts('sample-packs');
            else if (id.includes('Presets')) filterAndSortProducts('vocal-presets');
        });
    });
    
    // Sort functionality
    const sortSelects = document.querySelectorAll('select[id^="sort"]');
    sortSelects.forEach(select => {
        select.addEventListener('change', function() {
            const id = this.id;
            if (id.includes('Beats')) filterAndSortProducts('beats');
            else if (id.includes('Music')) filterAndSortProducts('music');
            else if (id.includes('Packs')) filterAndSortProducts('sample-packs');
            else if (id.includes('Presets')) filter极SortProducts('vocal-presets');
        });
    });
}

// Load featured beats on the homepage
function loadFeaturedBeats() {
    const featuredContainer = document.getElementById('featuredBeats');
    const beats = getProductsByCategory('beats');
    
    // Show only 3 featured beats
    const featuredBeats = beats.slice(0, 3);
    
    if (featuredBeats.length === 0) {
        featuredContainer.innerHTML = '<p class="text-neutral-400">No beats available yet.</p>';
        return;
    }
    
    featuredContainer.innerHTML = featuredBeats.map(beat => createProductCard(beat)).join('');
    
    // Initialize audio players for the featured beats
    initAudioPlayers();
}

// Load all beats
function loadBeats() {
    const beatsGrid = document.getElementById('beatsGrid');
    const beats = getProductsByCategory('beats');
    
    if (beats.length === 0) {
        beatsGrid.innerHTML = '<p class="text-neutral-400">No beats available yet.</p>';
        return;
    }
    
    beatsGrid.innerHTML = beats.map(beat => createProductCard(beat)).join('');
    
    // Initialize audio players
    initAudioPlayers();
}

// Load music
function loadMusic() {
    const musicGrid = document.getElementById('musicGrid');
    const music = getProductsByCategory('music');
    
    if (music.length === 0) {
        musicGrid.innerHTML = '<p class="text-neutral-400">No music available yet.</p>';
        return;
    }
    
    musicGrid.innerHTML = music.map(track => createProductCard(track)).join('');
    
    // Initialize audio players
    initAudioPlayers();
}

// Load sample packs
function loadSamplePacks() {
    const samplePacksGrid = document.getElementById('packsGrid');
    const samplePacks = getProductsByCategory('sample-packs');
    
    if (samplePacks.length === 0) {
        samplePacksGrid.innerHTML = '<p class="text-neutral-400">No sample packs available yet.</p>';
        return;
    }
    
    samplePacksGrid.innerHTML = samplePacks.map(pack => createProductCard(pack)).join('');
    
    // Initialize audio players
    initAudioPlayers();
}

// Load vocal presets
function loadVocalPresets() {
    const vocalPresetsGrid = document.getElementById('presetsGrid');
    const vocalPresets = getProductsByCategory('vocal-presets');
    
    if (vocalPresets.length === 0) {
        vocalPresetsGrid.innerHTML = '<p class="text-neutral-400">No vocal presets available yet.</p>';
        return;
    }
    
    vocalPresets极.innerHTML = vocalPresets.map(preset => createProductCard(preset)).join('');
    
    // Initialize audio players
    initAudioPlayers();
}

// Get products by category
function getProductsByCategory(category) {
    const categoryKey = `catalog${category.charAt(0).toUpperCase() + category.slice(1).replace('-', '')}`;
    const products = JSON.parse(localStorage.getItem(categoryKey) || '[]');
    
    // If no products in category-specific storage, try the general catalog
    if (products.length === 0) {
        const allProducts = JSON.parse(localStorage.getItem('catalogProducts') || '[]');
        return allProducts.filter(product => product.category === category);
    }
    
    return products;
}

// Create product card HTML
function createProductCard(product) {
    const tagsHtml = product.tags && product.tags.length > 0 
        ? product.tags.map(tag => `<span class="badge">${tag}</span>`).join('')
        : '';
    
    const details = product.category === 'beats' || product.category === 'music'
        ? `${product.bpm || '120'} BPM • ${product.key || 'Cmin'}`
        : product.category === 'vocal-presets'
        ? product.daw || 'FL Studio'
        : product.category === 'sample-packs'
        ? `${product.files || '50'} files`
        : '';
    
    return `
        <div class="card fade-in" data-id="${product.id}">
            <img class="w-full h-48 object-cover" src="${product.cover}" alt="${product.title}">
            <div class="p-4 space-y-3">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-medium">${product.title}</h3>
                        <p class="text-xs text-neutral-400">${details}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-lg font-semibold">R${product.price}</p>
                    </div>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    ${tagsHtml}
                </div>
                
                <!-- Audio Preview with Waveform -->
                <div class="mt-3">
                    <div class="waveform" id="waveform-${product.id}"></div>
                    <audio class="audio-player" id="audio-${product.id}" src="${product.audio || 'assets/audio/silence.wav'}"></audio>
                </div>
                
                <div class="flex items-center gap-2 pt-2">
                    <button class="btn add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}

// Initialize audio players and waveforms
function initAudioPlayers() {
    // Generate waveforms
    document.querySelectorAll('.waveform').forEach(waveform => {
        generateWaveform(waveform);
    });
    
    // Set up audio player event listeners
    document.querySelectorAll('.audio-player').forEach(audioElement => {
        audioElement.addEventListener('play', function() {
            // Pause any currently playing audio
            if (currentAudio && currentAudio !== this) {
                currentAudio.pause();
            }
            currentAudio = this;
            currentAudioElement = this;
            
            // Update now playing text on homepage
            if (document.getElementById('nowPlaying')) {
                const productId = this.id.replace('audio-', '');
                const productCard = document.querySelector(`[data-id="${productId}"]`);
                if (productCard) {
                    const productTitle = productCard.querySelector('h3').textContent;
                    document.getElementById('nowPlaying').textContent = productTitle;
                }
            }
        });
        
        audioElement.addEventListener('timeupdate', function() {
            // Update progress bar on homepage
            if (this === currentAudio && document.getElementById('audioProgress')) {
                const progress = (this.currentTime / this.duration) * 100;
                document.getElementById('audioProgress').style.width = `${progress}%`;
            }
        });
        
        audioElement.addEventListener('ended', function() {
            // Reset progress bar when audio ends
            if (document.getElementById('audioProgress')) {
                document.getElementById('audioProgress').style.width = '0%';
                document.getElementById('nowPlaying').textContent = '—';
            }
        });
    });
    
    // Set up add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            addToCart(productId);
        });
    });
}

// Generate random waveform
function generateWaveform(container) {
    container.innerHTML = '';
    
    // Create a simple random waveform
    for (let i = 0; i < 100; i++) {
        const bar = document.createElement('div');
        bar.className = 'waveform-bar';
        bar.style.left = i * 4 + 'px';
        bar.style.height = Math.random() * 30 + 5 + 'px';
        container.appendChild(bar);
    }
}

// Add product to cart
function addToCart(productId) {
    // Find the product in all categories
    let product = null;
    const categories = ['beats', 'music', 'sample-packs', 'vocal-presets'];
    
    for (const category of categories) {
        const products = getProductsByCategory(category);
        const foundProduct = products.find(p => p.id === productId);
        if (foundProduct) {
            product = foundProduct;
            break;
        }
    }
    
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            cover: product.cover,
            quantity: 1
        });
    }
    
    // Save cart and update UI
    saveCartToStorage();
    updateCartCount();
    
    // Show confirmation
    alert(`${product.title} added to cart!`);
}

// Load cart items on checkout page
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cartList');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-neutral-400 py-8 text-center">Your cart is empty.</p>';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item flex items-center justify-between gap-4 py-4 border-b border-neutral-800">
            <div class="flex items-center gap-4">
                <img src="${item.cover}" alt="${item.title}" class="w-16 h-16 object-cover rounded-xl">
                <div>
                    <h3 class="font-medium">${item.title}</h3>
                    <p class="text-sm text-neutral-400">R${item.price}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button class="quantity-btn bg-neutral-800 w-8 h-8 rounded" data-id="${item.id}" data-action="decrease">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn bg-neutral-800 w-8 h-8 rounded" data-id="${item.id}" data-action="increase">+</button>
                <button class="remove-btn ml-4 text-red-400 hover:text-red-300" data-id="${item.id}">Remove</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const action = this.getAttribute('data-action');
            updateCartQuantity(productId, action);
        });
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
        });
    });
}

// Update cart quantity
function updateCartQuantity(productId, action) {
    const item = cart.find(item => item.id === productId);
    
    if (!item) return;
    
    if (action === 'increase') {
        item.quantity += 1;
    } else if (action === 'decrease') {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
    }
    
    saveCartToStorage();
    loadCartItems();
    updateCartTotal();
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    loadCartItems();
    updateCartTotal();
    updateCartCount();
}

// Update cart total
function updateCartTotal() {
    const totalElement = document.getElementById('cartTotal');
    if (!totalElement) return;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalElement.textContent = `R${total.toFixed(2)}`;
}

// Filter and sort products
function filterAndSortProducts(category) {
    const grid = document.getElementById(`${category === 'sample-packs' ? 'packs' : category === 'vocal-presets' ? 'presets' : category}Grid`);
    if (!grid) return;
    
    const searchInput = document.getElementById(`search${category === 'sample-packs' ? 'Packs' : category === 'vocal-presets' ? 'Presets' : category.charAt(0).toUpperCase() + category.slice(1)}`);
    const sortSelect = document.getElementById(`sort${category === 'sample-packs' ? 'Packs' : category === 'vocal-presets' ? 'Presets' : category.charAt(0).toUpperCase() + category.slice(1)}`);
    
    if (!searchInput || !sortSelect) return;
    
    const query = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;
    
    let products = getProductsByCategory(category);
    
    // Filter products
    let filteredProducts = products.filter(product => 
        product.title.toLowerCase().includes(query) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query)))
    );
    
    // Sort products
    switch(sortBy) {
        case 'price-low':
        case 'priceLow':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
        case 'priceHigh':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
        case 'new':
        default:
            filteredProducts.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
            break;
    }
    
    grid.innerHTML = filteredProducts.length > 0 
        ? filteredProducts.map(product => createProductCard(product)).join('')
        : '<p class="text-neutral-400 col-span-full text-center py-12">No products found.</p>';
    
    initAudioPlayers();
}

// Checkout process
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // In a real application, this would integrate with a payment processor
    // For this demo, we'll just show a success message and clear the cart
    
    alert('Thank you for your purchase! Your download links will be sent to your email.');
    
    // Clear the cart
    cart = [];
    saveCartToStorage();
    updateCartCount();
    
    // Redirect to homepage after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}
