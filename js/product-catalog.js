/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Product Catalog System
   Clickable product displays, detail panels, IMAGE SUPPORT
   ═══════════════════════════════════════════════════════════ */

const ProductCatalog = {

  // ─── Product Database (with image support) ───
  // img: URL to product image (replace placeholders with real photos)
  // Place product images in assets/products/ or use external URLs
  stores: {
    'concrete-rose': {
      name: 'Concrete Rose',
      tagline: 'Where the streets meet high fashion.',
      url: 'https://concrete-rose.world',
      color: '#c94060',
      hero: 'assets/products/cr-hero.jpg',
      products: [
        { id: 'cr-001', name: 'Rose Emblem Bomber', price: 185, category: 'Outerwear', img: 'assets/products/cr-bomber.jpg', desc: 'Heavyweight satin bomber with embroidered concrete rose emblem. Oversized fit, ribbed cuffs.', featured: true },
        { id: 'cr-002', name: 'Thorns Hoodie', price: 95, category: 'Hoodies', img: 'assets/products/cr-hoodie.jpg', desc: 'French terry pullover with thorn vine graphic across the chest. Kangaroo pocket, dropped shoulders.' },
        { id: 'cr-003', name: 'Cracked Pavement Tee', price: 55, category: 'Tees', img: 'assets/products/cr-tee.jpg', desc: 'Premium cotton tee with cracked concrete texture print. Relaxed boxy fit.' },
        { id: 'cr-004', name: 'Stem & Stone Joggers', price: 110, category: 'Bottoms', img: 'assets/products/cr-joggers.jpg', desc: 'Tapered fleece joggers with rose stem embroidery down the left leg. Zippered pockets.' },
        { id: 'cr-005', name: 'Petal Cap', price: 45, category: 'Accessories', img: 'assets/products/cr-cap.jpg', desc: 'Structured six-panel cap with rose petal logo. Adjustable strap.' },
      ]
    },

    'bijadi': {
      name: 'BiJaDi',
      tagline: 'Beyond Enough.',
      url: 'https://bijadi.net',
      color: '#d4c0a8',
      hero: 'assets/products/bj-hero.jpg',
      products: [
        { id: 'bj-001', name: 'The Family Series Hoodie', price: 145, category: 'The Family Series', img: 'assets/products/bj-hoodie.jpg', desc: 'Ultra-soft fleece hoodie from The Family Series. Platinum embroidered crest. Unisex sizing.', featured: true },
        { id: 'bj-002', name: 'Little B.E. Onesie', price: 45, category: 'Little B.E.', img: 'assets/products/bj-onesie.jpg', desc: 'Organic cotton baby onesie with "Beyond Enough" in rose gold foil. 0-12 months.' },
        { id: 'bj-003', name: 'Legacy Polo', price: 95, category: 'The Family Series', img: 'assets/products/bj-polo.jpg', desc: 'Pique cotton polo with platinum BiJaDi monogram. Tailored fit.' },
        { id: 'bj-004', name: 'Little B.E. Kids Tee', price: 35, category: 'Little B.E.', img: 'assets/products/bj-kids-tee.jpg', desc: 'Soft cotton kids tee with playful BiJaDi characters. Sizes 2T-8.' },
        { id: 'bj-005', name: 'Platinum Link Bracelet', price: 225, category: 'Accessories', img: 'assets/products/bj-bracelet.jpg', desc: 'Stainless steel link bracelet with platinum finish and BiJaDi clasp.' },
      ]
    },

    'faithfully-faded': {
      name: 'Faithfully Faded',
      tagline: 'Just be Blunt.',
      url: 'https://faithfully-faded.com',
      color: '#FFADED',
      hero: 'assets/products/ff-hero.jpg',
      products: [
        { id: 'ff-001', name: 'Hooded Baseball Jersey Dress', price: 120, category: 'Dresses', img: 'assets/products/ff-dress.jpg', desc: 'Oversized hooded baseball jersey dress. Mesh panels, snap front. Statement piece.', featured: true },
        { id: 'ff-002', name: 'Blunt Crop Hoodie', price: 75, category: 'Hoodies', img: 'assets/products/ff-crop-hoodie.jpg', desc: 'Boxy cropped hoodie with "Just be Blunt" back print. French terry, raw hem.' },
        { id: 'ff-003', name: 'Faded Script Tee', price: 45, category: 'Tees', img: 'assets/products/ff-tee.jpg', desc: 'Vintage wash tee with faded script graphic. Relaxed fit, ring-spun cotton.' },
        { id: 'ff-004', name: '420 Joggers', price: 85, category: 'Bottoms', img: 'assets/products/ff-joggers.jpg', desc: 'Fleece joggers in #420420 colorway. Side stripe detail, elastic cuffs.' },
        { id: 'ff-005', name: 'Butterfly Beanie', price: 30, category: 'Accessories', img: 'assets/products/ff-beanie.jpg', desc: 'Ribbed knit beanie with embroidered butterfly motif. One size.' },
      ]
    },

    'hoe': {
      name: 'H.O.E.',
      tagline: 'Wear your crown.',
      url: 'https://truskoolcorp.wixstudio.com/h-o-e',
      color: '#e8c060',
      hero: 'assets/products/ho-hero.jpg',
      products: [
        { id: 'ho-001', name: 'Crown Royal Jacket', price: 210, category: 'Outerwear', img: 'assets/products/ho-jacket.jpg', desc: 'Structured oversized jacket with crown embroidery on the back. Gold hardware, quilted lining.', featured: true },
        { id: 'ho-002', name: 'Sovereign Hoodie', price: 105, category: 'Hoodies', img: 'assets/products/ho-hoodie.jpg', desc: 'Heavyweight hoodie with metallic gold H.O.E. logo. Brushed interior.' },
        { id: 'ho-003', name: 'Throne Tee', price: 50, category: 'Tees', img: 'assets/products/ho-tee.jpg', desc: 'Premium tee with regal crest graphic. Oversized drop shoulder.' },
        { id: 'ho-004', name: 'Scepter Chain', price: 165, category: 'Accessories', img: 'assets/products/ho-chain.jpg', desc: 'Gold-plated chain with scepter pendant. 24-inch length.' },
        { id: 'ho-005', name: 'Dynasty Shorts', price: 70, category: 'Bottoms', img: 'assets/products/ho-shorts.jpg', desc: 'Mesh basketball shorts with crown side panel. Elastic waist.' },
      ]
    },

    'wanderlust': {
      name: 'Wanderlust',
      tagline: 'Explore everything.',
      url: 'https://wanderlustfashionstore.com',
      color: '#60c890',
      hero: 'assets/products/wl-hero.jpg',
      products: [
        { id: 'wl-001', name: 'Globe Trotter Pack', price: 155, category: 'Bags', img: 'assets/products/wl-pack.jpg', desc: 'Weather-resistant backpack with padded laptop sleeve. Passport pocket, luggage strap.', featured: true },
        { id: 'wl-002', name: 'Passport Stamp Hoodie', price: 95, category: 'Hoodies', img: 'assets/products/wl-hoodie.jpg', desc: 'Hoodie with custom passport stamp print from global destinations. Warm fleece lining.' },
        { id: 'wl-003', name: 'Coordinates Tee', price: 50, category: 'Tees', img: 'assets/products/wl-tee.jpg', desc: 'Tee printed with GPS coordinates of iconic travel destinations. Soft tri-blend.' },
        { id: 'wl-004', name: 'Trail Joggers', price: 90, category: 'Bottoms', img: 'assets/products/wl-joggers.jpg', desc: 'Lightweight joggers with zip pockets. Moisture-wicking fabric for travel.' },
        { id: 'wl-005', name: 'Explorer Hat', price: 40, category: 'Accessories', img: 'assets/products/wl-hat.jpg', desc: 'Wide-brim adventure hat with Wanderlust compass logo. UPF 50+ protection.' },
      ]
    },

    'cafe-sativa': {
      name: 'Cafe Sativa',
      tagline: 'Sip. Smoke. Vibe.',
      url: 'https://cafe-sativa.com',
      color: '#c09060',
      hero: 'assets/products/cs-hero.jpg',
      products: [
        { id: 'cs-001', name: 'Cloud Nine Blend', price: 22, category: 'Coffee', img: 'assets/products/cs-coffee.jpg', desc: 'Medium roast single-origin from Ethiopian highlands. Notes of dark chocolate and citrus.', featured: true },
        { id: 'cs-002', name: 'Ceramic Mug - "Sip"', price: 28, category: 'Merch', img: 'assets/products/cs-mug.jpg', desc: 'Hand-thrown ceramic mug with Cafe Sativa logo. 12oz capacity, microwave safe.' },
        { id: 'cs-003', name: 'Vibe Sessions Tee', price: 45, category: 'Merch', img: 'assets/products/cs-tee.jpg', desc: 'Vintage wash tee with Cafe Sativa retro logo. Inspired by ITC Benguiat typography.' },
        { id: 'cs-004', name: 'Artisan Rolling Tray', price: 35, category: 'Accessories', img: 'assets/products/cs-tray.jpg', desc: 'Handcrafted wooden rolling tray with carved Cafe Sativa motif. Sustainably sourced.' },
        { id: 'cs-005', name: 'Candle - "Smoke Ring"', price: 38, category: 'Lifestyle', img: 'assets/products/cs-candle.jpg', desc: 'Soy wax candle with notes of tobacco flower, cedar, and vanilla. 60hr burn time.' },
      ]
    },

    'verse-alkemist': {
      name: 'The Verse Alkemist',
      tagline: 'Words into weapons. Beats into anthems.',
      url: 'https://versealkemist.net',
      color: '#a060e0',
      hero: 'assets/products/va-hero.jpg',
      products: [
        { id: 'va-001', name: 'Walls of the World EP', price: 12, category: 'Music', img: 'assets/products/va-ep.jpg', desc: 'Digital download of the Walls of the World EP. Five tracks of lyrical alchemy.', featured: true },
        { id: 'va-002', name: 'Alkemist Logo Hoodie', price: 85, category: 'Merch', img: 'assets/products/va-hoodie.jpg', desc: 'Heavyweight hoodie with The Verse Alkemist logo in metallic purple ink.' },
        { id: 'va-003', name: 'Cipher Tee', price: 45, category: 'Merch', img: 'assets/products/va-tee.jpg', desc: 'Black tee with lyric fragments from the EP. Screen printed, limited run.' },
        { id: 'va-004', name: 'Beat Lab Snapback', price: 40, category: 'Accessories', img: 'assets/products/va-snapback.jpg', desc: 'Flat-brim snapback with embroidered turntable icon.' },
        { id: 'va-005', name: 'Vinyl Sticker Pack', price: 10, category: 'Accessories', img: 'assets/products/va-stickers.jpg', desc: 'Set of 6 die-cut stickers featuring album art and lyric snippets.' },
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
    console.log('[Catalog] Product system initialized with image support');
  },

  // ─── Create Product Detail Panel DOM ───
  createPanelDOM() {
    var panel = document.createElement('div');
    panel.id = 'product-panel';
    panel.className = 'hidden';
    panel.innerHTML =
      '<div class="pp-backdrop" onclick="ProductCatalog.closePanel()"></div>' +
      '<div class="pp-card">' +
        '<button class="pp-close" onclick="ProductCatalog.closePanel()">&times;</button>' +
        '<div class="pp-store-header">' +
          '<span id="pp-store-name"></span>' +
          '<span id="pp-store-tag"></span>' +
        '</div>' +
        '<div id="pp-product-grid"></div>' +
        '<div id="pp-product-detail" class="hidden">' +
          '<button class="pp-back" onclick="ProductCatalog.showGrid()">&larr; Back to products</button>' +
          '<div class="pp-detail-content">' +
            '<div class="pp-detail-visual" id="pp-detail-visual"></div>' +
            '<div class="pp-detail-info">' +
              '<h3 id="pp-detail-name"></h3>' +
              '<span id="pp-detail-cat" class="pp-cat-badge"></span>' +
              '<p id="pp-detail-desc"></p>' +
              '<div class="pp-detail-price" id="pp-detail-price"></div>' +
              '<a id="pp-detail-link" class="pp-shop-btn" target="_blank" rel="noopener">Shop Now &rarr;</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<a id="pp-store-link" class="pp-visit-store" target="_blank" rel="noopener">Visit Full Store &rarr;</a>' +
      '</div>';
    document.body.appendChild(panel);
  },

  // ─── Create 3D Product Display Entities ───
  createProductDisplays() {
    var scene = document.querySelector('a-scene');
    if (!scene) return;

    var storePositions = {
      'concrete-rose':    { base: [-10, 0, -8],  facing: 'right', offset: [1, 0, 0] },
      'bijadi':           { base: [10, 0, -8],   facing: 'left',  offset: [-1, 0, 0] },
      'faithfully-faded': { base: [-10, 0, -22], facing: 'right', offset: [1, 0, 0] },
      'hoe':              { base: [10, 0, -22],  facing: 'left',  offset: [-1, 0, 0] },
      'wanderlust':       { base: [-10, 0, -38], facing: 'right', offset: [1, 0, 0] },
      'cafe-sativa':      { base: [10, 0, -38],  facing: 'left',  offset: [-1, 0, 0] },
      'verse-alkemist':   { base: [0, 0, -58],   facing: 'front', offset: [0, 0, 2] },
    };

    var self = this;

    Object.keys(storePositions).forEach(function(storeId) {
      var config = storePositions[storeId];
      var store = self.stores[storeId];
      if (!store) return;

      var featured = store.products.find(function(p) { return p.featured; }) || store.products[0];
      if (!featured) return;

      var sign = document.createElement('a-entity');
      var sx = config.base[0] + config.offset[0] * 3;
      var sy = 3.5;
      var sz = config.base[2] + config.offset[2];

      sign.setAttribute('position', sx + ' ' + sy + ' ' + sz);
      sign.setAttribute('class', 'clickable');
      sign.setAttribute('data-store-id', storeId);

      var rotY = config.facing === 'right' ? 90 : config.facing === 'left' ? -90 : 0;

      // If product has an image, show it as a textured plane in 3D
      var imageHtml = '';
      if (featured.img) {
        imageHtml = '<a-plane width="1.8" height="1.2" position="0 -0.3 0.02" rotation="0 ' + rotY + ' 0" ' +
          'material="src: url(' + featured.img + '); transparent: true; opacity: 0.9; side: double" ' +
          'class="clickable"></a-plane>';
      }

      sign.innerHTML =
        '<a-plane width="2.5" height="2" rotation="0 ' + rotY + ' 0" ' +
          'material="color: ' + store.color + '; opacity: 0.12; transparent: true; side: double"></a-plane>' +
        imageHtml +
        '<a-text value="TAP TO BROWSE" position="0 0.7 0" rotation="0 ' + rotY + ' 0" ' +
          'align="center" color="' + store.color + '" width="2.5" opacity="0.8"></a-text>' +
        '<a-text value="' + featured.name + '" position="0 -0.7 0" rotation="0 ' + rotY + ' 0" ' +
          'align="center" color="#fff" width="2"></a-text>' +
        '<a-text value="$' + featured.price + '" position="0 -0.95 0" rotation="0 ' + rotY + ' 0" ' +
          'align="center" color="' + store.color + '" width="2.5" font="mozillavr"></a-text>';

      scene.appendChild(sign);

      sign.addEventListener('click', function() {
        self.openStore(storeId);
      });
    });
  },

  // ─── Open Store Panel ───
  openStore(storeId) {
    var store = this.stores[storeId];
    if (!store) return;

    this._activeStore = storeId;
    this._panelOpen = true;

    var panel = document.getElementById('product-panel');
    panel.classList.remove('hidden');

    document.getElementById('pp-store-name').textContent = store.name;
    document.getElementById('pp-store-name').style.color = store.color;
    document.getElementById('pp-store-tag').textContent = store.tagline;
    document.getElementById('pp-store-link').href = store.url;
    document.getElementById('pp-store-link').style.borderColor = store.color;
    document.getElementById('pp-store-link').style.color = store.color;

    this.showGrid();

    if (typeof addChatMessage === 'function') {
      var guide = (window.MallState && window.MallState.currentGuide) || 'laviche';
      addChatMessage(guide, 'Browsing ' + store.name + ' \u2014 ' + store.tagline + ' Take your time, darling.');
    }
  },

  // ─── Show Product Grid (with images) ───
  showGrid() {
    var store = this.stores[this._activeStore];
    if (!store) return;
    var self = this;

    document.getElementById('pp-product-detail').classList.add('hidden');
    var grid = document.getElementById('pp-product-grid');
    grid.classList.remove('hidden');

    grid.innerHTML = store.products.map(function(p) {
      var visualContent;
      if (p.img) {
        visualContent = '<img src="' + p.img + '" alt="' + p.name + '" class="pp-item-img" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
          '<div class="pp-item-icon-fallback" style="display:none">' + self.getCategoryIcon(p.category) + '</div>';
      } else {
        visualContent = '<div class="pp-item-icon">' + self.getCategoryIcon(p.category) + '</div>';
      }

      return '<div class="pp-grid-item" onclick="ProductCatalog.showProduct(\'' + p.id + '\')" style="--accent: ' + store.color + '">' +
        '<div class="pp-item-visual" style="background: linear-gradient(135deg, ' + store.color + '22, ' + store.color + '08);">' +
          visualContent +
        '</div>' +
        '<div class="pp-item-info">' +
          '<span class="pp-item-name">' + p.name + '</span>' +
          '<span class="pp-item-price">$' + p.price + '</span>' +
        '</div>' +
        (p.featured ? '<span class="pp-featured-badge">FEATURED</span>' : '') +
      '</div>';
    }).join('');
  },

  // ─── Show Single Product (with image) ───
  showProduct(productId) {
    var store = this.stores[this._activeStore];
    if (!store) return;

    var product = store.products.find(function(p) { return p.id === productId; });
    if (!product) return;

    this._activeProduct = productId;

    document.getElementById('pp-product-grid').classList.add('hidden');
    var detail = document.getElementById('pp-product-detail');
    detail.classList.remove('hidden');

    document.getElementById('pp-detail-name').textContent = product.name;
    document.getElementById('pp-detail-name').style.color = store.color;
    document.getElementById('pp-detail-cat').textContent = product.category;
    document.getElementById('pp-detail-cat').style.background = store.color + '22';
    document.getElementById('pp-detail-cat').style.color = store.color;
    document.getElementById('pp-detail-desc').textContent = product.desc;
    document.getElementById('pp-detail-price').textContent = '$' + product.price;
    document.getElementById('pp-detail-price').style.color = store.color;

    var link = document.getElementById('pp-detail-link');
    link.href = store.url;
    link.style.background = store.color;

    // Visual — show product image or fallback
    var visual = document.getElementById('pp-detail-visual');
    if (product.img) {
      visual.innerHTML = '<img src="' + product.img + '" alt="' + product.name + '" class="pp-detail-img" ' +
        'onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'<div style=font-size:48px;opacity:0.4>' + this.getCategoryIcon(product.category) + '</div>\'">';
      visual.style.background = 'linear-gradient(135deg, ' + store.color + '10, ' + store.color + '05)';
    } else {
      visual.style.background = 'linear-gradient(135deg, ' + store.color + '15, ' + store.color + '05)';
      visual.innerHTML = '<div style="font-size:48px;opacity:0.4">' + this.getCategoryIcon(product.category) + '</div>';
    }
  },

  // ─── Close Panel ───
  closePanel() {
    this._panelOpen = false;
    document.getElementById('product-panel').classList.add('hidden');
  },

  // ─── Category Icons ───
  getCategoryIcon(category) {
    var icons = {
      'Outerwear': '\uD83E\uDDE5', 'Hoodies': '\uD83D\uDC55', 'Tees': '\uD83D\uDC5A',
      'Bottoms': '\uD83D\uDC56', 'Accessories': '\uD83D\uDC8D', 'Dresses': '\uD83D\uDC57',
      'Bags': '\uD83C\uDF92', 'Music': '\uD83C\uDFB5', 'Merch': '\uD83C\uDFF7',
      'Coffee': '\u2615', 'Lifestyle': '\uD83D\uDD6F', 'The Family Series': '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66',
      'Little B.E.': '\uD83D\uDC76',
    };
    return icons[category] || '\uD83C\uDFF7';
  },
};

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', function() {
  var scene = document.querySelector('a-scene');
  if (scene) {
    if (scene.hasLoaded) {
      ProductCatalog.init();
    } else {
      scene.addEventListener('loaded', function() { ProductCatalog.init(); });
    }
  }
});

window.ProductCatalog = ProductCatalog;
