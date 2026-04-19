/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Product Catalog System
   REAL DATA + REAL IMAGES from live brand websites (March 2026)
   
   Image sources:
   - Concrete Rose: concrete-rose.world/images/
   - BiJaDi: bijadi.net/ (root-level images)
   - Faithfully Faded: MiniMAX mockups (site has no product photos yet)
   - H.O.E.: static.wixstatic.com CDN
   - Wanderlust: MiniMAX mockups (site is collection-based, no individual SKU photos)
   - Cafe Sativa: MiniMAX mockups (virtual venue, no product imagery)
   - Verse Alkemist: versealkemist.net Shopify CDN
   ═══════════════════════════════════════════════════════════ */

const ProductCatalog = {

  stores: {

    // ═══════════════════════════════════════════════════
    // CONCRETE ROSE — concrete-rose.world
    // REAL IMAGES from live site
    // ═══════════════════════════════════════════════════
    'concrete-rose': {
      name: 'Concrete Rose',
      tagline: 'Where Luxury Meets Strength.',
      url: 'https://concrete-rose.world',
      color: '#c94060',
      products: [
        { id: 'cr-001', name: 'Corset Dress', price: 220, category: 'Corset Dresses', img: 'https://www.concrete-rose.world/images/cream-corset-dress.png', desc: 'From the Corset Dresses collection. Sculpted bodice with flowing skirt, embodying the resilience and elegance at the heart of Concrete Rose.', featured: true },
        { id: 'cr-002', name: 'Two-Tone Trench Coat', price: 285, category: 'Outerwear', img: 'https://www.concrete-rose.world/images/trench-featured.png', desc: 'The Resilience Collection centerpiece. A dramatic two-tone trench coat that commands attention — strength and grace in perfect harmony.' },
        { id: 'cr-003', name: 'Varsity Set', price: 165, category: 'Varsity Edit', img: 'https://www.concrete-rose.world/images/varsity-set.png', desc: 'From the Varsity Edit collection. 3-piece set blending athletic heritage with luxury streetwear. Cream and rose colorway.' },
        { id: 'cr-004', name: 'Lace Hoodie Dress', price: 195, category: 'Romantic Lace', img: 'https://www.concrete-rose.world/images/lace-hoodie-dress.png', desc: 'The Romantic Lace collection. A hoodie dress reimagined with delicate lace overlays — street comfort meets runway elegance.' },
      ]
    },

    // ═══════════════════════════════════════════════════
    // BiJaDi — bijadi.net
    // REAL IMAGES from live site
    // ═══════════════════════════════════════════════════
    'bijadi': {
      name: 'BiJaDi',
      tagline: 'Beyond Enough.',
      url: 'https://bijadi.net',
      color: '#d4c0a8',
      products: [
        { id: 'bj-001', name: 'B.E. Hoodie', price: 145, category: 'B.E. Collection', img: 'https://www.bijadi.net/Hoodie-1.png', desc: 'Oversized fit with tone-on-tone B.E. embroidery. Gold-tip drawcord, woven hem label. Every garment carries a unique QR code unlocking a private digital family experience.', featured: true },
        { id: 'bj-002', name: 'B.E. Jogger', price: 110, category: 'B.E. Collection', img: 'https://www.bijadi.net/Jogger-1.png', desc: 'Relaxed fit tapered leg jogger with hidden message tag and gold hardware accents. Part of the B.E. first drop.' },
        { id: 'bj-003', name: 'B.E. Tee', price: 65, category: 'B.E. Collection', img: 'https://www.bijadi.net/Tee-1.png', desc: 'Breathable cotton with subtle B.E. detail. Ribbed crew neck, woven hem label. Elevated everyday essential.' },
        { id: 'bj-004', name: 'Little B.E. Collection', price: 85, category: 'Little B.E.', img: 'https://www.bijadi.net/Little_B.E.png', desc: 'For little souls, already enough. Mini Hoodie, Little Jogger, B.E. Tee — sizes 2T-8. QR code inside each garment unlocks digital memory journal for your family.' },
      ]
    },

    // ═══════════════════════════════════════════════════
    // FAITHFULLY FADED — faithfully-faded.com
    // No product photos on live site yet (pre-launch cards)
    // Using MiniMAX mockups as placeholders
    // ═══════════════════════════════════════════════════
    'faithfully-faded': {
      name: 'Faithfully Faded',
      tagline: 'Just be Blunt.',
      url: 'https://faithfully-faded.com',
      color: '#FFADED',
      products: [
        { id: 'ff-001', name: 'Hooded Baseball Jersey Dress', price: 69, category: 'Signature', img: 'assets/products/ff-dress.jpg', desc: 'Bestseller. Longline pinstripe jersey dress with relaxed oversized fit, classic raglan sleeves, matte gold button closures, and bold Faithfully Faded chest lettering. Cream pinstripe body with burgundy contrast sleeves/hood.', featured: true },
        { id: 'ff-002', name: 'Signature Crop Hoodie', price: 54, category: 'Streetwear', img: 'assets/products/ff-crop-hoodie.jpg', desc: 'Boxy cropped silhouette with the FF butterfly mark. French terry, raw hem. The streetwear essential.' },
        { id: 'ff-003', name: 'Butterfly Varsity Tee', price: 38, category: 'Essentials', img: 'assets/products/ff-tee.jpg', desc: 'New arrival. Premium cotton tee featuring the signature butterfly-pineapple mark — wings of the cannabis leaf, body of the pineapple. Born from culture.' },
        { id: 'ff-004', name: 'FF Butterfly Dad Cap', price: 32, category: 'Accessories', img: 'assets/products/ff-beanie.jpg', desc: 'Unstructured dad cap with embroidered butterfly logo in #420420 on #FFADED colorway. Adjustable back strap.' },
        { id: 'ff-005', name: 'Culture Joggers', price: 62, category: 'Streetwear', img: 'assets/products/ff-joggers.jpg', desc: 'Fleece joggers in the FF colorway. Tapered leg, elastic cuffs, side pocket detail. Free shipping over $75.' },
        { id: 'ff-006', name: 'Verde Edition Pullover', price: 78, category: 'Limited Edition', img: 'assets/products/ff-hero.jpg', desc: 'Limited edition. The Verde colorway pullover — same butterfly DNA, fresh green perspective. Once gone, gone.' },
      ]
    },

    // ═══════════════════════════════════════════════════
    // H.O.E. — Wix store
    // REAL IMAGES from Wix CDN
    // ═══════════════════════════════════════════════════
    'hoe': {
      name: 'H.O.E.',
      tagline: 'Happiness Over Everything.',
      url: 'https://truskoolcorp.wixstudio.com/h-o-e',
      color: '#e8c060',
      products: [
        { id: 'ho-001', name: 'Signature Hoodie', price: 56.85, category: 'Hoodies', img: 'https://static.wixstatic.com/media/caa6fd_7d20f9e3ddf4466e96dc33912a285864~mv2.png/v1/fill/w_600,h_600,al_c,q_90/caa6fd_7d20f9e3ddf4466e96dc33912a285864~mv2.png', desc: 'The H.O.E. Signature Hoodie — Happiness Over Everything. Heavyweight fleece with the full H.O.E. logo. Bold, comfortable, and unapologetically joyful.', featured: true },
        { id: 'ho-002', name: 'Basketball Shorts — Peace Issue', price: 46, category: 'Shorts', img: 'https://static.wixstatic.com/media/caa6fd_54addd0e8961461aa005a404262fc463~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85/caa6fd_54addd0e8961461aa005a404262fc463~mv2.jpg', desc: 'The Peace Issue basketball shorts. Mesh athletic fabric with H.O.E. branding. Part of the jersey collection.' },
        { id: 'ho-003', name: 'Basketball Jersey — Peace Issue', price: 37.50, category: 'Jerseys', img: 'https://static.wixstatic.com/media/caa6fd_58611de10fea488da5b64d988cafc7b5~mv2.png/v1/fill/w_600,h_600,al_c,q_90/caa6fd_58611de10fea488da5b64d988cafc7b5~mv2.png', desc: 'The Peace Issue basketball jersey. Pair with matching shorts for the full H.O.E. set.' },
        { id: 'ho-004', name: 'Basketball Jersey — Purpose Issue', price: 37.50, category: 'Jerseys', img: 'https://static.wixstatic.com/media/caa6fd_3f31da5a8935499fbd166cb215958bbf~mv2.png/v1/fill/w_600,h_600,al_c,q_90/caa6fd_3f31da5a8935499fbd166cb215958bbf~mv2.png', desc: 'The Purpose Issue basketball jersey. Different design, same energy — happiness over everything.' },
        { id: 'ho-005', name: 'Signature T-Shirt', price: 29.40, category: 'Tees', img: 'https://static.wixstatic.com/media/caa6fd_49528a4f676f4742b00417f4985604fc~mv2.png/v1/fill/w_523,h_600,al_c,q_90/caa6fd_49528a4f676f4742b00417f4985604fc~mv2.png', desc: 'The H.O.E. Signature T-Shirt. Clean logo, soft hand feel. Available in multiple colorways.' },
        { id: 'ho-006', name: 'Crop Sweatshirt', price: 0, category: 'Women', img: 'https://static.wixstatic.com/media/caa6fd_77f848a9b0c04489a572aef6558d48e6~mv2.png/v1/fill/w_600,h_600,al_c,q_90/caa6fd_77f848a9b0c04489a572aef6558d48e6~mv2.png', desc: 'H.O.E. Crop Sweatshirt in burnt orange/brick. Currently sold out — join waitlist on site.' },
        { id: 'ho-007', name: 'Bandeau Bikini', price: 36.58, category: 'Swim', img: 'https://static.wixstatic.com/media/caa6fd_51d5580f33fe4fbcae5258f370297682~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85/caa6fd_51d5580f33fe4fbcae5258f370297682~mv2.jpg', desc: 'H.O.E. Happiness Over Everything bandeau bikini. Bold tropical print with H.O.E. branding.' },
        { id: 'ho-008', name: 'String Bikini Top', price: 27.34, category: 'Swim', img: 'https://static.wixstatic.com/media/caa6fd_f7eb10f184084f5faf9c08dc7807db9f~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85/caa6fd_f7eb10f184084f5faf9c08dc7807db9f~mv2.jpg', desc: 'H.O.E. Happiness Over Everything string bikini top. Mix and match with any H.O.E. swim bottoms.' },
      ]
    },

    // ═══════════════════════════════════════════════════
    // WANDERLUST — wanderlustfashionstore.com
    // "Roam Free. Stay Rooted."
    // REAL PRODUCTS from live collection pages (32 total across 4 collections)
    // ═══════════════════════════════════════════════════
    'wanderlust': {
      name: 'Wanderlust',
      tagline: 'Roam Free. Stay Rooted.',
      url: 'https://wanderlustfashionstore.com',
      color: '#60c890',
      products: [
        { id: 'wl-001', name: 'Elevated Lounge Set', price: 185, category: 'Airport Chic', img: 'assets/products/wl-pack.jpg', desc: 'Best seller. Wrinkle-resistant set that blends comfort with sophistication. From check-in to touchdown, you look polished. Airport Chic: 8 pieces from $98.', featured: true },
        { id: 'wl-002', name: 'Cashmere Travel Wrap', price: 225, category: 'Airport Chic', img: 'assets/products/wl-hoodie.jpg', desc: 'Luxurious cashmere wrap that doubles as a blanket on long-haul flights. Curated by Ginger Pelirroja — European Elegance.' },
        { id: 'wl-003', name: 'Structured Tote Bag', price: 275, category: 'Airport Chic', img: 'assets/products/wl-hat.jpg', desc: 'Designed to slip under your airline seat while holding everything you need. Structured silhouette, premium materials.' },
        { id: 'wl-004', name: 'Linen Maxi Dress', price: 175, category: 'Resort Ready', img: 'assets/products/wl-tee.jpg', desc: 'Best seller. From sandy shores to sunset cocktails without missing a beat. Lightweight, breathable linen. Resort Ready: 8 pieces from $68.' },
        { id: 'wl-005', name: 'Crochet Cover-Up', price: 95, category: 'Resort Ready', img: 'assets/products/wl-joggers.jpg', desc: 'Beach-to-bar transition piece in natural crochet. Curated by Laviche Cardenas — Latin Soul.' },
        { id: 'wl-006', name: 'Raffia Beach Tote', price: 145, category: 'Resort Ready', img: 'assets/products/wl-hat.jpg', desc: 'Handwoven raffia tote. Oversized for towels, sunscreen, and a good book. Part of the Resort Ready collection.' },
        { id: 'wl-007', name: 'Tailored Blazer', price: 285, category: 'City Explorer', img: 'assets/products/wl-pack.jpg', desc: 'Best seller. Navigate cobblestone streets and museum halls without sacrificing style. Stretch fabric, hidden comfort features. City Explorer: 8 pieces from $85.' },
        { id: 'wl-008', name: 'Wool Coat', price: 395, category: 'City Explorer', img: 'assets/products/wl-hoodie.jpg', desc: 'Premium wool coat for European winters. Tailored fit, warm without bulk. Cushioned insoles and pockets where you need them.' },
        { id: 'wl-009', name: 'Leather Crossbody', price: 295, category: 'City Explorer', img: 'assets/products/wl-tee.jpg', desc: 'Hands-free exploring. Premium leather crossbody sized for wallet, phone, and passport. Part of the City Explorer collection.' },
        { id: 'wl-010', name: 'Reversible Slip Dress', price: 195, category: 'Night & Day', img: 'assets/products/wl-joggers.jpg', desc: 'Best seller. Two looks in one — day touring to evening dining. Night & Day: 8 pieces from $78. Curated by Ahnika Merlot — Cosmopolitan Chic.' },
        { id: 'wl-011', name: 'Day-to-Night Jumpsuit', price: 235, category: 'Night & Day', img: 'assets/products/wl-hat.jpg', desc: 'One piece, endless possibilities. Dress it up with heels or down with flats. DoT members get 15% off all Wanderlust collections.' },
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAFE SATIVA — cafe-sativa.com
    // "Sip. Smoke. Vibe." — VIRTUAL LOUNGE VENUE
    // NOT a coffee shop. Six spaces + membership tiers.
    // Physical Tenerife venue 2026.
    // ═══════════════════════════════════════════════════
    'cafe-sativa': {
      name: 'Cafe Sativa',
      tagline: 'Sip. Smoke. Vibe.',
      url: 'https://cafe-sativa.com',
      color: '#c09060',
      products: [
        { id: 'cs-001', name: 'VIP Membership', price: 24.99, category: 'Membership', img: 'assets/products/cs-candle.jpg', desc: 'Monthly VIP. All live events, exclusive VIP-only experiences, priority guest Q&A, 20% merch discount, priority seating when Tenerife opens 2026. 2.1K+ community members.', featured: true },
        { id: 'cs-002', name: 'Regular Membership', price: 9.99, category: 'Membership', img: 'assets/products/cs-tray.jpg', desc: 'Monthly access to all live events on The Stage, buy/sell in The Gallery art marketplace, event recordings library, and member badge with perks.' },
        { id: 'cs-003', name: 'The Stage — Live Events', price: 0, category: 'The Stage', img: 'assets/products/cs-tee.jpg', desc: '"At The Table" interview series + live music performances. Next: Chef Maria Santos cooking demo. Ahnika Merlot live set Fridays. Free with membership.' },
        { id: 'cs-004', name: 'The Kitchen — Cooking Class', price: 25, category: 'The Kitchen', img: 'assets/products/cs-tray.jpg', desc: 'Live cooking classes with international chefs. Next: Nordic-Spanish Fusion, Mon 7PM EST. Recipes, techniques, and community. 47 events hosted to date.' },
        { id: 'cs-005', name: 'The Gallery — Art Marketplace', price: 0, category: 'The Gallery', img: 'assets/products/cs-candle.jpg', desc: 'Art exhibitions, buy/sell original work, artist spotlights. Current exhibition: "Digital Dreams" — 23 pieces available. 156 artworks sold.' },
        { id: 'cs-006', name: 'The Cigar Lounge', price: 0, category: 'Cigar Lounge', img: 'assets/products/cs-tee.jpg', desc: 'Tastings, ratings, ASMR sessions, expert recommendations. This week: Cuban vs. Dominican Showdown. Cigar & Whiskey Pairing Experience Tuesdays.' },
        { id: 'cs-007', name: 'The Bar — Cocktails', price: 0, category: 'The Bar', img: 'assets/products/cs-tray.jpg', desc: 'Signature cocktails, mixology classes, spirit education. Cocktail of the Week: Canary Island Old Fashioned. Part of the virtual lounge experience.' },
      ]
    },

    // ═══════════════════════════════════════════════════
    // THE VERSE ALKEMIST — versealkemist.net (Shopify)
    // REAL IMAGES from Shopify CDN
    // ═══════════════════════════════════════════════════
    'verse-alkemist': {
      name: 'The Verse Alkemist',
      tagline: 'Craft Your Sonic Journey.',
      url: 'https://versealkemist.net',
      color: '#a060e0',
      products: [
        { id: 'va-001', name: 'H.O.E. Crop Hoodie', price: 54.99, category: 'Merch', img: 'https://versealkemist.net/cdn/shop/files/womens-cropped-hoodie-black-front-6870da349bea6.jpg?v=1752226370&width=600', desc: 'H.O.E. Crop Hoodie — bold Happiness Over Everything branding on premium cropped fit. Available on the Verse Alkemist Shopify store.', featured: true },
        { id: 'va-002', name: 'H.O.E. Leggings with Pockets', price: 41.53, category: 'Merch', img: 'https://versealkemist.net/cdn/shop/files/all-over-print-recycled-leggings-with-pockets-white-front-69ab0b9cc32b7.jpg?v=1772817335&width=600', desc: 'Recycled all-over-print leggings with functional pockets. H.O.E. pattern throughout.' },
        { id: 'va-003', name: 'H.O.E. Dad Hat', price: 27, category: 'Accessories', img: 'https://versealkemist.net/cdn/shop/files/classic-dad-hat-black-front-6876b687aaba2.png?v=1752610455&width=600', desc: 'Classic dad hat with H.O.E. embroidered logo. Adjustable strap, unstructured fit.' },
        { id: 'va-004', name: 'H.O.E. Shorts', price: 27.06, category: 'Merch', img: 'https://versealkemist.net/cdn/shop/files/all-over-print-shorts-white-front-69ab086a2a7c4.jpg?v=1772816517&width=600', desc: 'All-over-print shorts with H.O.E. pattern. Lightweight, breathable.' },
        { id: 'va-005', name: 'H.O.E. Racerback Tank', price: 19.47, category: 'Merch', img: 'https://versealkemist.net/cdn/shop/files/womens-ideal-racerback-tank-top-black-front-69ab06a76d801.jpg?v=1772816063&width=600', desc: 'Women\'s fitted racerback tank top with H.O.E. branding. Clean, minimal, powerful.' },
        { id: 'va-006', name: 'Nah Imma Stay — Rusu Collection', price: 45, category: 'Collections', img: 'assets/products/va-stickers.jpg', desc: 'The Rusu Collection exclusive collaboration. Limited availability only at versealkemist.net.' },
      ]
    },
  },

  _panelOpen: false,
  _activeStore: null,
  _activeProduct: null,

  init() {
    this.createPanelDOM();
    this.createProductDisplays();
    console.log('[Catalog] Initialized — real images from CR, BiJaDi, H.O.E., TVA live sites');
  },

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

  createProductDisplays() {
    var scene = document.querySelector('a-scene');
    if (!scene) return;

    var storePositions = {
      'concrete-rose':    { base: [-10, 0, -8],  facing: 'right', offset: [1, 0, 0] },
      'bijadi':           { base: [10, 0, -8],   facing: 'left',  offset: [-1, 0, 0] },
      'faithfully-faded': { base: [-10, 0, -22], facing: 'right', offset: [1, 0, 0] },
      'hoe':              { base: [10, 0, -22],  facing: 'left',  offset: [-1, 0, 0] },
      'wanderlust':       { base: [-10, 0, -38], facing: 'right', offset: [1, 0, 0] },
      'cafe-sativa':      { base: [14, 0, -18],  facing: 'right', offset: [0, 0, -2], y: 2.1 },
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
      // Default height 3.5m suits the primitive-shell stores. The new
      // CS wing has a 2.8m ceiling, so CS overrides to 2.1m to sit just
      // below the door lintel — outside the Foyer, visible from the
      // main corridor as a "this is the entrance" marker.
      var sy = (typeof config.y === 'number') ? config.y : 3.5;
      var sz = config.base[2] + config.offset[2];

      sign.setAttribute('position', sx + ' ' + sy + ' ' + sz);
      sign.setAttribute('class', 'clickable');
      sign.setAttribute('data-store-id', storeId);

      var rotY = config.facing === 'right' ? 90 : config.facing === 'left' ? -90 : 0;

      var imageHtml = '';
      if (featured.img) {
        imageHtml = '<a-plane width="1.8" height="1.2" position="0 -0.3 0.02" rotation="0 ' + rotY + ' 0" ' +
          'material="src: url(' + featured.img + '); transparent: true; opacity: 0.9; side: double" ' +
          'class="clickable"></a-plane>';
      }

      var priceText = featured.price > 0 ? '$' + featured.price : 'FREE';

      sign.innerHTML =
        '<a-plane width="2.5" height="2" rotation="0 ' + rotY + ' 0" ' +
          'material="color: ' + store.color + '; opacity: 0.12; transparent: true; side: double"></a-plane>' +
        imageHtml +
        '<a-text value="TAP TO BROWSE" position="0 0.7 0" rotation="0 ' + rotY + ' 0" ' +
          'align="center" color="' + store.color + '" width="2.5" opacity="0.8"></a-text>' +
        '<a-text value="' + featured.name + '" position="0 -0.7 0" rotation="0 ' + rotY + ' 0" ' +
          'align="center" color="#fff" width="2"></a-text>' +
        '<a-text value="' + priceText + '" position="0 -0.95 0" rotation="0 ' + rotY + ' 0" ' +
          'align="center" color="' + store.color + '" width="2.5" font="mozillavr"></a-text>';

      scene.appendChild(sign);
      sign.addEventListener('click', function() { self.openStore(storeId); });
    });
  },

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
      addChatMessage(guide, 'Browsing ' + store.name + ' \u2014 ' + store.tagline);
    }
  },

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
      var priceLabel = p.price > 0 ? '$' + p.price : (p.price === 0 ? 'FREE' : '');

      return '<div class="pp-grid-item" onclick="ProductCatalog.showProduct(\'' + p.id + '\')" style="--accent: ' + store.color + '">' +
        '<div class="pp-item-visual" style="background: linear-gradient(135deg, ' + store.color + '22, ' + store.color + '08);">' +
          visualContent +
        '</div>' +
        '<div class="pp-item-info">' +
          '<span class="pp-item-name">' + p.name + '</span>' +
          '<span class="pp-item-price">' + priceLabel + '</span>' +
        '</div>' +
        (p.featured ? '<span class="pp-featured-badge">FEATURED</span>' : '') +
      '</div>';
    }).join('');
  },

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
    var priceLabel = product.price > 0 ? '$' + product.price : (product.price === 0 ? 'FREE' : '');
    document.getElementById('pp-detail-price').textContent = priceLabel;
    document.getElementById('pp-detail-price').style.color = store.color;
    var link = document.getElementById('pp-detail-link');
    link.href = store.url;
    link.style.background = store.color;
    var visual = document.getElementById('pp-detail-visual');
    if (product.img) {
      visual.innerHTML = '<img src="' + product.img + '" alt="' + product.name + '" class="pp-detail-img" ' +
        'onerror="this.style.display=\'none\'">';
      visual.style.background = 'linear-gradient(135deg, ' + store.color + '10, ' + store.color + '05)';
    } else {
      visual.style.background = 'linear-gradient(135deg, ' + store.color + '15, ' + store.color + '05)';
      visual.innerHTML = '<div style="font-size:48px;opacity:0.4">' + this.getCategoryIcon(product.category) + '</div>';
    }
  },

  closePanel() {
    this._panelOpen = false;
    document.getElementById('product-panel').classList.add('hidden');
  },

  getCategoryIcon(category) {
    var icons = {
      'Corset Dresses': '\uD83D\uDC57', 'Outerwear': '\uD83E\uDDE5', 'Varsity Edit': '\uD83C\uDFC6',
      'Romantic Lace': '\uD83C\uDF39', 'Accessories': '\uD83D\uDC8D',
      'B.E. Collection': '\u2728', 'Little B.E.': '\uD83D\uDC76',
      'Signature': '\uD83C\uDFF7', 'Streetwear': '\uD83D\uDC55', 'Essentials': '\uD83D\uDC5A',
      'Limited Edition': '\u2B50',
      'Hoodies': '\uD83E\uDDE5', 'Shorts': '\uD83E\uDE73', 'Jerseys': '\uD83C\uDFC0',
      'Tees': '\uD83D\uDC55', 'Swim': '\uD83D\uDC59', 'Women': '\uD83D\uDC57',
      'Airport Chic': '\u2708', 'Resort Ready': '\uD83C\uDF34', 'City Explorer': '\uD83C\uDFDB',
      'Night & Day': '\u2728',
      'Membership': '\u2B50', 'Events': '\uD83C\uDFAD', 'Experiences': '\uD83C\uDFA8',
      'The Stage': '\uD83C\uDFAD', 'The Kitchen': '\uD83D\uDC68\u200D\uD83C\uDF73', 'The Gallery': '\uD83C\uDFA8',
      'Cigar Lounge': '\uD83D\uDCA8', 'The Bar': '\uD83C\uDF78',
      'Merch': '\uD83C\uDFF7', 'Collections': '\uD83D\uDCE6', 'Music': '\uD83C\uDFB5',
    };
    return icons[category] || '\uD83C\uDFF7';
  },
};

document.addEventListener('DOMContentLoaded', function() {
  var scene = document.querySelector('a-scene');
  if (scene) {
    if (scene.hasLoaded) ProductCatalog.init();
    else scene.addEventListener('loaded', function() { ProductCatalog.init(); });
  }
});

window.ProductCatalog = ProductCatalog;
