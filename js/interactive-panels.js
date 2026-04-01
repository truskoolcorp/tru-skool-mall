/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Interactive Panel Systems
   Config-driven gallery, music streaming, menus
   ═══════════════════════════════════════════════════════════ */

// ─── GALLERY CONFIG (swap weekly — just edit this array) ───
window.GALLERY_CONFIG = [
  {
    title: "Ginger Pelirroja Heritage Collection",
    artist: "Tru Skool Entertainment",
    image: "https://raw2.seadn.io/ethereum/0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949/abe1b2d91ee02996ff946675ffb52c72.png",
    buyUrl: "https://opensea.io/item/ethereum/0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949/5160",
    type: "nft",
    price: "0.05 ETH"
  },
  // Add more featured art below — swap these entries weekly
  // { title: "...", artist: "...", image: "https://...", buyUrl: "https://...", type: "nft|physical", price: "..." },
];

// ─── STREAMING CONFIG ───
window.STREAMING_CONFIG = {
  // Replace with actual Verse Alkemist Spotify artist/album/track URIs
  // Format: spotify:artist:XXXX or spotify:album:XXXX or spotify:track:XXXX
  // Or use full URLs: https://open.spotify.com/artist/XXXX
  spotifyEmbed: "https://open.spotify.com/embed/artist/YOUR_ARTIST_ID?theme=0",
  // Fallback: YouTube Music embed
  youtubePlaylist: "https://www.youtube.com/embed/videoseries?list=YOUR_PLAYLIST_ID",
  // Individual tracks (for headphone listening stations)
  tracks: [
    { name: "Walls of the World EP", spotifyUrl: "https://open.spotify.com/embed/album/YOUR_ALBUM_ID?theme=0" },
    { name: "Sodade Cypher", spotifyUrl: "https://open.spotify.com/embed/track/YOUR_TRACK_ID?theme=0" },
    { name: "Who's Your Daddy!?", spotifyUrl: "https://open.spotify.com/embed/track/YOUR_TRACK_ID?theme=0" },
    { name: "Can't Get You Outta My Mind", spotifyUrl: "https://open.spotify.com/embed/track/YOUR_TRACK_ID?theme=0" },
  ]
};

// ─── CAFÉ SATIVA MENU CONFIG ───
window.CAFE_MENU = {
  cigars: [
    { name: "Arturo Fuente Hemingway", origin: "Dominican Republic", strength: "Medium", pairing: "Canary Island Old Fashioned", price: "$18" },
    { name: "Padrón 1964 Anniversary", origin: "Nicaragua", strength: "Full", pairing: "Añejo Tequila Neat", price: "$22" },
    { name: "Oliva Serie V Melanio", origin: "Nicaragua", strength: "Medium-Full", pairing: "Single Malt Scotch", price: "$16" },
    { name: "My Father Le Bijou 1922", origin: "Nicaragua", strength: "Full", pairing: "Espresso Martini", price: "$20" },
    { name: "Davidoff Grand Cru", origin: "Dominican Republic", strength: "Mild-Medium", pairing: "Champagne", price: "$24" },
  ],
  cocktails: [
    { name: "Canary Island Old Fashioned", desc: "Bourbon, orange bitters, palm honey syrup, orange twist", price: "$15" },
    { name: "Sativa Sunset", desc: "Rum, passion fruit, lime, CBD-infused honey, mint", price: "$16" },
    { name: "The Alkemist", desc: "Hennessy, espresso, dark chocolate bitters, gold leaf", price: "$18" },
    { name: "Mediterranean Mule", desc: "Spanish gin, ginger beer, rosemary, blood orange", price: "$14" },
    { name: "Smoke & Mirrors", desc: "Mezcal, activated charcoal, agave, lime, smoked salt rim", price: "$17" },
  ],
  coldStoned: [
    { name: "Loop 12 Lemon Drop", desc: "Lemon gelato with CBD, candied lemon peel", cbd: "10mg", price: "$8" },
    { name: "Oak Cliff Chocolate", desc: "Rich dark chocolate gelato with CBD crumble", cbd: "15mg", price: "$9" },
    { name: "Tenerife Sunrise", desc: "Mango-passion fruit sorbet with CBD honey drizzle", cbd: "10mg", price: "$8" },
    { name: "Concrete Rose", desc: "Strawberry-rose gelato with CBD, edible flowers", cbd: "10mg", price: "$9" },
    { name: "Purple Haze", desc: "Lavender-blueberry gelato with CBD, honeycomb", cbd: "15mg", price: "$10" },
  ],
};

// ═══════════════════════════════════════════════════════════
// INTERACTIVE PANEL COMPONENT — Opens HTML overlay on click
// ═══════════════════════════════════════════════════════════

AFRAME.registerComponent('interactive-panel', {
  schema: {
    type: { type: 'string', default: '' },  // 'gallery', 'music', 'cigar-menu', 'cocktail-menu', 'gelato-menu'
    label: { type: 'string', default: 'Interact' },
    color: { type: 'string', default: '#c09060' },
  },

  init: function() {
    this.el.classList.add('clickable');
    var self = this;

    // Hover hint
    var hint = document.createElement('a-text');
    hint.setAttribute('value', '👆 ' + this.data.label);
    hint.setAttribute('position', '0 0.8 0');
    hint.setAttribute('align', 'center');
    hint.setAttribute('color', this.data.color);
    hint.setAttribute('width', '3');
    hint.setAttribute('visible', false);
    this.el.appendChild(hint);

    this.el.addEventListener('mouseenter', function() { hint.setAttribute('visible', true); });
    this.el.addEventListener('mouseleave', function() { hint.setAttribute('visible', false); });

    this.el.addEventListener('click', function() {
      self.openPanel();
    });
  },

  openPanel: function() {
    // Remove existing panel
    var existing = document.getElementById('interactive-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'interactive-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);';

    var content = '';
    switch(this.data.type) {
      case 'gallery': content = this.buildGallery(); break;
      case 'music': content = this.buildMusicPlayer(); break;
      case 'cigar-menu': content = this.buildCigarMenu(); break;
      case 'cocktail-menu': content = this.buildCocktailMenu(); break;
      case 'gelato-menu': content = this.buildGelatoMenu(); break;
      default: content = '<p>Coming soon...</p>';
    }

    overlay.innerHTML = `
      <div style="background:#1a1a24;border-radius:16px;max-width:700px;width:90%;max-height:80vh;overflow-y:auto;padding:30px;color:#e8e0d8;font-family:system-ui;position:relative;border:1px solid #333;">
        <button onclick="this.closest('#interactive-overlay').remove();document.querySelector('canvas')?.focus();" style="position:absolute;top:12px;right:16px;background:none;border:none;color:#888;font-size:24px;cursor:pointer;">&times;</button>
        ${content}
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) { overlay.remove(); document.querySelector('canvas')?.focus(); }
    });
  },

  buildGallery: function() {
    var items = window.GALLERY_CONFIG || [];
    if (items.length === 0) return '<h2 style="color:#c09060;">The Gallery</h2><p>No featured art this week. Check back soon!</p>';

    var html = '<h2 style="color:#c09060;margin:0 0 8px 0;">The Gallery — Featured Art</h2><p style="color:#888;margin:0 0 20px 0;">Click any piece to purchase</p>';
    items.forEach(function(item) {
      html += `
        <div style="display:flex;gap:16px;margin-bottom:20px;padding:16px;background:#12121a;border-radius:12px;border:1px solid #2a2a3a;cursor:pointer;" onclick="window.open('${item.buyUrl}','_blank')">
          <img src="${item.image}" style="width:120px;height:120px;object-fit:cover;border-radius:8px;" crossorigin="anonymous">
          <div>
            <h3 style="color:#e8d8c8;margin:0 0 4px 0;">${item.title}</h3>
            <p style="color:#a08060;margin:0 0 4px 0;">by ${item.artist}</p>
            <p style="color:#888;margin:0 0 8px 0;">${item.type === 'nft' ? 'NFT' : 'Physical Art'} · ${item.price}</p>
            <span style="color:#c09060;font-size:13px;">View on ${item.type === 'nft' ? 'OpenSea' : 'Store'} →</span>
          </div>
        </div>`;
    });
    return html;
  },

  buildMusicPlayer: function() {
    var cfg = window.STREAMING_CONFIG || {};
    var html = '<h2 style="color:#a060e0;margin:0 0 16px 0;">🎧 The Verse Alkemist</h2>';
    html += '<iframe style="border-radius:12px;width:100%;height:352px;border:none;" src="' + (cfg.spotifyEmbed || '') + '" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';
    if (cfg.tracks && cfg.tracks.length > 0) {
      html += '<div style="margin-top:16px;">';
      cfg.tracks.forEach(function(t) {
        html += '<div style="padding:10px;margin:6px 0;background:#12121a;border-radius:8px;cursor:pointer;border:1px solid #2a2a3a;" onclick="this.querySelector(\'iframe\')?.remove();var f=document.createElement(\'iframe\');f.src=\'' + t.spotifyUrl + '\';f.style.cssText=\'width:100%;height:80px;border:none;border-radius:8px;margin-top:8px;\';f.allow=\'autoplay;encrypted-media\';this.appendChild(f);"><span style="color:#a060e0;">▶</span> <span style="color:#e8d8c8;">' + t.name + '</span></div>';
      });
      html += '</div>';
    }
    return html;
  },

  buildCigarMenu: function() {
    var cigars = (window.CAFE_MENU || {}).cigars || [];
    var html = '<h2 style="color:#c09060;margin:0 0 8px 0;">🪵 The Cigar Lounge</h2><p style="color:#888;margin:0 0 16px 0;">Select a cigar for tasting notes and pairing</p>';
    cigars.forEach(function(c) {
      html += `<div style="padding:14px;margin:8px 0;background:#12121a;border-radius:10px;border:1px solid #2a2a3a;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h3 style="color:#e8d8c8;margin:0;">${c.name}</h3><span style="color:#c09060;">${c.price}</span>
        </div>
        <p style="color:#888;margin:4px 0 0 0;font-size:13px;">Origin: ${c.origin} · Strength: ${c.strength}</p>
        <p style="color:#a08060;margin:4px 0 0 0;font-size:13px;">Pairs with: ${c.pairing}</p>
      </div>`;
    });
    return html;
  },

  buildCocktailMenu: function() {
    var drinks = (window.CAFE_MENU || {}).cocktails || [];
    var html = '<h2 style="color:#c09060;margin:0 0 8px 0;">🍸 The Bar</h2><p style="color:#888;margin:0 0 16px 0;">Signature cocktails & spirits</p>';
    drinks.forEach(function(d) {
      html += `<div style="padding:14px;margin:8px 0;background:#12121a;border-radius:10px;border:1px solid #2a2a3a;">
        <div style="display:flex;justify-content:space-between;"><h3 style="color:#e8d8c8;margin:0;">${d.name}</h3><span style="color:#c09060;">${d.price}</span></div>
        <p style="color:#888;margin:4px 0 0 0;font-size:13px;">${d.desc}</p>
      </div>`;
    });
    return html;
  },

  buildGelatoMenu: function() {
    var items = (window.CAFE_MENU || {}).coldStoned || [];
    var html = '<h2 style="color:#e8d0ff;margin:0 0 8px 0;">🍦 Cold Stoned — CBD Gelato</h2><p style="color:#888;margin:0 0 16px 0;">Handcrafted CBD-infused gelato & sorbet</p>';
    items.forEach(function(g) {
      html += `<div style="padding:14px;margin:8px 0;background:#12121a;border-radius:10px;border:1px solid #2a2a3a;">
        <div style="display:flex;justify-content:space-between;"><h3 style="color:#e8d8c8;margin:0;">${g.name}</h3><span style="color:#e8d0ff;">${g.price}</span></div>
        <p style="color:#888;margin:4px 0 0 0;font-size:13px;">${g.desc}</p>
        <span style="display:inline-block;margin-top:6px;padding:2px 8px;background:#2a1a3a;border-radius:4px;color:#a080c0;font-size:11px;">CBD: ${g.cbd}</span>
      </div>`;
    });
    return html;
  },
});

// ═══════════════════════════════════════════════════════════
// GALLERY WALL COMPONENT — Loads art from config onto 3D wall
// ═══════════════════════════════════════════════════════════

AFRAME.registerComponent('gallery-wall', {
  schema: { index: { type: 'int', default: 0 } },
  init: function() {
    var items = window.GALLERY_CONFIG || [];
    var item = items[this.data.index];
    if (!item) return;

    // Load image as texture
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = item.image;
    var el = this.el;
    img.onload = function() {
      var tex = new THREE.Texture(img);
      tex.needsUpdate = true;
      var plane = el.querySelector('.gallery-art');
      if (plane) {
        plane.getObject3D('mesh').material.map = tex;
        plane.getObject3D('mesh').material.needsUpdate = true;
      }
    };

    // Make clickable
    this.el.classList.add('clickable');
    this.el.addEventListener('click', function() {
      window.open(item.buyUrl, '_blank');
    });
  }
});
