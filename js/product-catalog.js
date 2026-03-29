/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Product Catalog System
   Clickable product displays, detail panels, store links
   ═══════════════════════════════════════════════════════════ */

const ProductCatalog = {

  // ─── Product Database ───
  stores: {
    'concrete-rose': {
      name: 'Concrete Rose',
      tagline: 'Where the streets meet high fashion.',
      url: 'https://concrete-rose.world',
      color: '#c94060',
      products: [
        { id: 'cr-001', name: 'Rose Emblem Bomber', price: 185, category: 'Outerwear', desc: 'Heavyweight satin bomber with embroidered concrete rose emblem. Oversized fit, ribbed cuffs.', featured: true },
        { id: 'cr-002', name: 'Thorns Hoodie', price: 95, category: 'Hoodies', desc: 'French terry pullover with thorn vine graphic across the chest. Kangaroo pocket, dropped shoulders.' },
        { id: 'cr-003', name: 'Cracked Pavement Tee', price: 55, category: 'Tees', desc: 'Premium cotton tee with cracked concrete texture print. Relaxed boxy fit.' },
        { id: 'cr-004', name: 'Stem & Stone Joggers', price: 110, category: 'Bottoms', desc: 'Tapered fleece joggers with rose stem embroidery down the left leg. Zippered pockets.' },
        { id: 'cr-005', name: 'Petal Cap', price: 45, category: 'Accessories', desc: 'Structured six-panel cap with rose petal logo. Adjustable strap.' },
      ]
    },

    'bijadi': {
      name: 'BiJaDi',
      tagline: 'Beyond Enough.',
      url: 'https://bijadi.com',
      color: '#d4c0a8',
      products: [
        { id: 'bj-001', name: 'The Family Series Hoodie', price: 145, category: 'The Family Series', desc: 'Ultra-soft fleece hoodie from The Family Series. Platinum embroidered crest. Unisex sizing.', featured: true },
        { id: 'bj-002', name: 'Little B.E. Onesie', price: 45, category: 'Little B.E.', desc: 'Organic cotton baby onesie with "Beyond Enough" in rose gold foil. 0-12 months.' },
        { id: 'bj-003', name: 'Legacy Polo', price: 95, category: 'The Family Series', desc: 'Pique cotton polo with platinum BiJaDi monogram. Tailored fit.' },
        { id: 'bj-004', name: 'Little B.E. Kids Tee', price: 35, category: 'Little B.E.', desc: 'Soft cotton kids tee with playful BiJaDi characters. Sizes 2T-8.' },
        { id: 'bj-005', name: 'Platinum Link Bracelet', price: 225, category: 'Accessories', desc: 'Stainless steel link bracelet with platinum finish and BiJaDi clasp.' },
      ]
    },

    'faithfully-faded': {
      name: 'Faithfully Faded',
      tagline: 'Just be Blunt.',
      url: 'https://faithfully-faded.com',
      color: '#FFADED',
      products: [
        { id: 'ff-001', name: 'Hooded Baseball Jersey Dress', price: 120, category: 'Dresses', desc: 'Oversized hooded baseball jersey dress. Mesh panels, snap front. Statement piece.', featured: true },
        { id: 'ff-002', name: 'Blunt Crop Hoodie', price: 75, category: 'Hoodies', desc: 'Boxy cropped hoodie with "Just be Blunt" back print. French terry, raw hem.' },
        { id: 'ff-003', name: 'Faded Script Tee', price: 45, category: 'Tees', desc: 'Vintage wash tee with faded script graphic. Relaxed fit, ring-spun cotton.' },
        { id: 'ff-004', name: '420 Joggers', price: 85, category: 'Bottoms', desc: 'Fleece joggers in #420420 colorway. Side stripe detail, elastic cuffs.' },
        { id: 'ff-005', name: 'Butterfly Beanie', price: 30, category: 'Accessories', desc: 'Ribbed knit beanie with embroidered butterfly motif. One size.' },
      ]
    },

    'hoe': {
      name: 'H.O.E.',
      tagline: 'Wear your crown.',
      url: 'https://hoe.truskool.net',
      color: '#e8c060',
      products: [
        { id: 'ho-001', name: 'Crown Royal Jacket', price: 210, category: 'Outerwear', desc: 'Structured oversized jacket with crown embroidery on the back. Gold hardware, quilted lining.', featured: true },
        { id: 'ho-002', name: 'Sovereign Hoodie', price: 105, category: 'Hoodies', desc: 'Heavyweight hoodie with metallic gold H.O.E. logo. Brushed interior.' },
        { id: 'ho-003', name: 'Throne Tee', price: 50, category: 'Tees', desc: 'Premium tee with regal crest graphic. Oversized drop shoulder.' },
        { id: 'ho-004', name: 'Scepter Chain', price: 165, category: 'Accessories', desc: 'Gold-plated chain with scepter pendant. 24-inch length.' },
        { id: 'ho-005', name: 'Dynasty Shorts', price: 70, category: 'Bottoms', desc: 'Mesh basketball shorts with crown side panel. Elastic waist.' },
      ]
    },

    'wanderlust': {
      name: 'Wanderlust',
      tagline: 'Explore everything.',
      url: 'https://wanderlust.truskool.net',
      color: '#60c890',
      products: [
        { id: 'wl-001', name: 'Globe Trotter Pack', price: 155, category: 'Bags', desc: 'Weather-resistant backpack with padded laptop sleeve. Passport pocket, luggage strap.', featured: true },
        { id: 'wl-002', name: 'Passport Stamp Hoodie', price: 95, category: 'Hoodies', desc: 'Hoodie with custom passport stamp print from global destinations. Warm fleece lining.' },
        { id: 'wl-003', name: 'Coordinates Tee', price: 50, category: 'Tees', desc: 'Tee printed with GPS coordinates of iconic travel destinations. Soft tri-blend.' },
        { id: 'wl-004', name: 'Trail Joggers', price: 90, category: 'Bottoms', desc: 'Lightweight joggers with zip pockets. Moisture-wicking fabric for travel.' },
        { id: 'wl-005', name: 'Explorer Hat', price: 40, category: 'Accessories', desc: 'Wide-brim adventure hat with Wanderlust compass logo. UPF 50+ protection.' },
      ]
    },

    'cafe-sativa': {
      name: 'Cafe Sativa',
      tagline: 'Sip. Smoke. Vibe.',
      url: 'https://cafesativa.truskool.net',
      color: '#c09060',
      products: [
        { id: 'cs-001', name: 'Signature Blend - "Cloud Nine"', price: 22, category: 'Coffee', desc: 'Medium roast single-origin from Ethiopian highlands. Notes of dark chocolate and citrus.', featured: true },
        { id: 'cs-002', name: 'Ceramic Mug - "Sip"', price: 28, category: 'Merch', desc: 'Hand-thrown ceramic mug with Cafe Sativa logo. 12oz capacity, microwave safe.' },
        { id: 'cs-003', name: 'Vibe Sessions Tee', price: 45, category: 'Merch', desc: 'Vintage wash tee with Cafe Sativa retro logo. Inspired by ITC Benguiat typography.' },
        { id: 'cs-004', name: 'Rolling Tray - Artisan', price: 35, category: 'Accessories', desc: 'Handcrafted wooden rolling tray with carved Cafe Sativa motif. Sustainably sourced.' },
        { id: 'cs-005', name: 'Candle - "Smoke Ring"', price: 38, category: 'Lifestyle', desc: 'Soy wax candle with notes of tobacco flower, cedar, and vanilla. 60hr burn time.' },
      ]
    },

    'verse-alkemist': {
      name: 'The Verse Alkemist',
      tagline: 'Words into weapons. Beats into anthems.',
      url: 'https://theversealkemist.com',
      color: '#a060e0',
      products: [
        { id: 'va-001', name: 'Walls of the World EP (Digital)', price: 12, category: 'Music', desc: 'Digital download of the Walls of the World EP. Five tracks of lyrical alchemy.', featured: true },
        { id: 'va-002', name: 'Alkemist Logo Hoodie', price: 85, category: 'Merch', desc: 'Heavyweight hoodie with The Verse Alkemist logo in metallic purple ink.' },
        { id: 'va-003', name: 'Cipher Tee', price: 45, category: 'Merch', desc: 'Black tee with lyric fragments from the EP. Screen printed, limited run.' },
        { id: 'va-004', name: 'Beat Lab Snapback', price: 40, category: 'Accessories', desc: 'Flat-brim snapback with embroidered turntable icon.' },
        { id: 'va-005', name: 'Vinyl Sticker Pack', price: 10, category: 'Accessories', desc: 'Set of 6 die-cut stickers featuring album art and lyric snippets.' },
      ]
    },
  },

  // ─── Active UI State ───
  _panelOpen: false,
  _activeStore: null,
  _activeProduct: null,

  // ─── Initialize ───
  init() {
    this.createPanelDOM();
    this.createProductDisplays();
    console.log('[Catalog] Product system initialized');
  },

  // ─── Create Product Detail Panel DOM ───
  createPanelDOM() {
    const panel = document.createElement('div');
    panel.id = 'product-panel';
    panel.className = 'hidden';
    panel.innerHTML = `
      <div class="pp-backdrop" onclick="ProductCatalog.closePanel()"></div>
      <div class="pp-card">
        <button class="pp-close" onclick="ProductCatalog.closePanel()">×</button>
        <div class="pp-store-header">
          <span id="pp-store-name"></span>
          <span id="pp-store-tag"></span>
        </div>
        <div id="pp-product-grid"></div>
        <div id="pp-product-detail" class="hidden">
          <button class="pp-back" onclick="ProductCatalog.showGrid()">← Back to products</button>
          <div class="pp-detail-content">
            <div class="pp-detail-visual" id="pp-detail-visual"></div>
            <div class="pp-detail-info">
              <h3 id="pp-detail-name"></h3>
              <span id="pp-detail-cat" class="pp-cat-badge"></span>
              <p id="pp-detail-desc"></p>
              <div class="pp-detail-price" id="pp-detail-price"></div>
              <a id="pp-detail-link" class="pp-shop-btn" target="_blank" rel="noopener">Shop Now →</a>
            </div>
          </div>
        </div>
        <a id="pp-store-link" class="pp-visit-store" target="_blank" rel="noopener">Visit Full Store →</a>
      </div>
    `;
    document.body.appendChild(panel);
  },

  // ─── Create 3D Product Display Entities ───
  createProductDisplays() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    // Add clickable product podiums inside each store
    const storePositions = {
      'concrete-rose':    { base: [-10, 0, -8],  facing: 'right', offset: [1, 0, 0] },
      'bijadi':           { base: [10, 0, -8],   facing: 'left',  offset: [-1, 0, 0] },
      'faithfully-faded': { base: [-10, 0, -22], facing: 'right', offset: [1, 0, 0] },
      'hoe':              { base: [10, 0, -22],  facing: 'left',  offset: [-1, 0, 0] },
      'wanderlust':       { base: [-10, 0, -38], facing: 'right', offset: [1, 0, 0] },
      'cafe-sativa':      { base: [10, 0, -38],  facing: 'left',  offset: [-1, 0, 0] },
      'verse-alkemist':   { base: [0, 0, -58],   facing: 'front', offset: [0, 0, 2] },
    };

    for (const [storeId, config] of Object.entries(storePositions)) {
      const store = this.stores[storeId];
      if (!store) continue;

      const featured = store.products.find(p => p.featured) || store.products[0];
      if (!featured) continue;

      // Create interactive product sign near store entrance
      const sign = document.createElement('a-entity');
      const sx = config.base[0] + config.offset[0] * 3;
      const sy = 3.5;
      const sz = config.base[2] + config.offset[2];

      sign.setAttribute('position', `${sx} ${sy} ${sz}`);
      sign.setAttribute('class', 'clickable');
      sign.setAttribute('data-store-id', storeId);

      // Info board
      const rotY = config.facing === 'right' ? 90 : config.facing === 'left' ? -90 : 0;

      sign.innerHTML = `
        <a-plane width="2.5" height="1.6" rotation="0 ${rotY} 0"
          material="color: ${store.color}; opacity: 0.15; transparent: true; side: double">
        </a-plane>
        <a-text value="TAP TO BROWSE" position="0 0.5 0" rotation="0 ${rotY} 0"
          align="center" color="${store.color}" width="2.5" opacity="0.8"></a-text>
        <a-text value="${featured.name}" position="0 0.1 0" rotation="0 ${rotY} 0"
          align="center" color="#fff" width="2"></a-text>
        <a-text value="$${featured.price}" position="0 -0.3 0" rotation="0 ${rotY} 0"
          align="center" color="${store.color}" width="2.5" font="mozillavr"></a-text>
      `;

      scene.appendChild(sign);

      // Click handler
      sign.addEventListener('click', () => {
        this.openStore(storeId);
      });
    }
  },

  // ─── Open Store Panel ───
  openStore(storeId) {
    const store = this.stores[storeId];
    if (!store) return;

    this._activeStore = storeId;
    this._panelOpen = true;

    const panel = document.getElementById('product-panel');
    panel.classList.remove('hidden');

    // Header
    document.getElementById('pp-store-name').textContent = store.name;
    document.getElementById('pp-store-name').style.color = store.color;
    document.getElementById('pp-store-tag').textContent = store.tagline;
    document.getElementById('pp-store-link').href = store.url;
    document.getElementById('pp-store-link').style.borderColor = store.color;
    document.getElementById('pp-store-link').style.color = store.color;

    // Show grid
    this.showGrid();

    // Announce in chat
    if (typeof addChatMessage === 'function') {
      const guide = window.MallState?.currentGuide || 'laviche';
      addChatMessage(guide, `Browsing ${store.name} — ${store.tagline} Take your time, darling. 💎`);
    }
  },

  // ─── Show Product Grid ───
  showGrid() {
    const store = this.stores[this._activeStore];
    if (!store) return;

    document.getElementById('pp-product-detail').classList.add('hidden');
    const grid = document.getElementById('pp-product-grid');
    grid.classList.remove('hidden');

    grid.innerHTML = store.products.map(p => `
      <div class="pp-grid-item" onclick="ProductCatalog.showProduct('${p.id}')" style="--accent: ${store.color}">
        <div class="pp-item-visual" style="background: linear-gradient(135deg, ${store.color}22, ${store.color}08);">
          <div class="pp-item-icon">${this.getCategoryIcon(p.category)}</div>
        </div>
        <div class="pp-item-info">
          <span class="pp-item-name">${p.name}</span>
          <span class="pp-item-price">$${p.price}</span>
        </div>
        ${p.featured ? '<span class="pp-featured-badge">FEATURED</span>' : ''}
      </div>
    `).join('');
  },

  // ─── Show Single Product ───
  showProduct(productId) {
    const store = this.stores[this._activeStore];
    if (!store) return;

    const product = store.products.find(p => p.id === productId);
    if (!product) return;

    this._activeProduct = productId;

    document.getElementById('pp-product-grid').classList.add('hidden');
    const detail = document.getElementById('pp-product-detail');
    detail.classList.remove('hidden');

    document.getElementById('pp-detail-name').textContent = product.name;
    document.getElementById('pp-detail-name').style.color = store.color;
    document.getElementById('pp-detail-cat').textContent = product.category;
    document.getElementById('pp-detail-cat').style.background = store.color + '22';
    document.getElementById('pp-detail-cat').style.color = store.color;
    document.getElementById('pp-detail-desc').textContent = product.desc;
    document.getElementById('pp-detail-price').textContent = `$${product.price}`;
    document.getElementById('pp-detail-price').style.color = store.color;

    const link = document.getElementById('pp-detail-link');
    link.href = store.url;
    link.style.background = store.color;

    // Visual placeholder
    const visual = document.getElementById('pp-detail-visual');
    visual.style.background = `linear-gradient(135deg, ${store.color}15, ${store.color}05)`;
    visual.innerHTML = `<div style="font-size:48px;opacity:0.4">${this.getCategoryIcon(product.category)}</div>`;
  },

  // ─── Close Panel ───
  closePanel() {
    this._panelOpen = false;
    document.getElementById('product-panel').classList.add('hidden');
  },

  // ─── Category Icons ───
  getCategoryIcon(category) {
    const icons = {
      'Outerwear': '🧥', 'Hoodies': '👕', 'Tees': '👚', 'Bottoms': '👖',
      'Accessories': '💍', 'Dresses': '👗', 'Bags': '🎒', 'Music': '🎵',
      'Merch': '🏷', 'Coffee': '☕', 'Lifestyle': '🕯', 'The Family Series': '👨‍👩‍👧‍👦',
      'Little B.E.': '👶',
    };
    return icons[category] || '🏷';
  },
};

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for A-Frame scene to load
  const scene = document.querySelector('a-scene');
  if (scene) {
    if (scene.hasLoaded) {
      ProductCatalog.init();
    } else {
      scene.addEventListener('loaded', () => ProductCatalog.init());
    }
  }
});

window.ProductCatalog = ProductCatalog;
