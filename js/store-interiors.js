/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Enhanced Store Interiors
   Dynamic geometry: shelving, racks, mirrors, display cases,
   fitting rooms, counters, ceiling details
   ═══════════════════════════════════════════════════════════ */

const StoreInteriors = {

  init() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    // Add textured store floors
    this.addStoreFloors(scene);

    this.enhanceConcreteRose(scene);
    this.enhanceBiJaDi(scene);
    this.enhanceFaithfullyFaded(scene);
    this.enhanceHOE(scene);
    this.enhanceWanderlust(scene);
    // CS disabled — replaced by js/cafe-sativa-wing.js (clean rebuild from official floor plan)
    // this.enhanceCafeSativa(scene);
    this.enhanceVerseAlkemist(scene);
    this.addCeilingDetails(scene);
    // Avatars are now inline in index.html

    // Apply textures after scene is fully loaded
    setTimeout(() => this.applyTextures(scene), 4000);

    console.log('[Interiors] Enhanced store interiors with textures loaded');
  },

  // ─── Store Floor Planes (separate from corridor) ───
  addStoreFloors(scene) {
    const stores = [
      { pos: '-10 0.01 -8', size: '8 8', tex: 'carpet' },   // Concrete Rose
      { pos: '10 0.01 -8', size: '8 8', tex: 'carpet' },     // BiJaDi
      { pos: '-10 0.01 -22', size: '8 8', tex: 'carpet' },   // Faithfully Faded
      { pos: '10 0.01 -22', size: '8 8', tex: 'carpet' },    // H.O.E.
      { pos: '-10 0.01 -38', size: '8 8', tex: 'wood-dark' },     // Wanderlust
      // CS floor removed — handled by cafe-sativa-wing.js (per-room floors)
      // { pos: '10 0.01 -38', size: '8 8', tex: 'wood-dark' },      // Cafe Sativa
      { pos: '0 0.01 -58', size: '14 12', tex: 'carpet' },   // Verse Alkemist
    ];
    stores.forEach(s => {
      const sizes = s.size.split(' ');
      this.addEntity(scene, s.pos, `
        <a-plane rotation="-90 0 0" width="${sizes[0]}" height="${sizes[1]}"
          material="src: #tex-${s.tex}; repeat: 4 4; roughness: 0.85; color: #ffffff"></a-plane>
      `);
    });
  },

  // ─── Apply textures to furniture after TextureGen loads ───
  applyTextures(scene) {
    // Auto-texture remaining flat-colored surfaces
    var count = 0;
    scene.querySelectorAll('a-box, a-cylinder, a-plane, a-sphere').forEach(el => {
      var mat = el.getAttribute('material');
      if (!mat) return;
      // Skip if already has a texture
      var matStr = typeof mat === 'object' ? JSON.stringify(mat) : String(mat);
      if (matStr.indexOf('src') !== -1 || matStr.indexOf('tex-') !== -1) return;
      // Skip emissive/glow elements
      if (matStr.indexOf('emissive') !== -1) return;
      // Skip transparent elements
      if (matStr.indexOf('opacity') !== -1 && matStr.indexOf('opacity: 1') === -1) return;

      var color = typeof mat === 'object' ? mat.color : '';
      if (!color && typeof mat === 'string') {
        var cm = mat.match(/color:\s*(#[a-fA-F0-9]+)/);
        if (cm) color = cm[1];
      }
      if (!color) return;

      var hex = color.toLowerCase();
      var r = parseInt(hex.substr(1,2),16) || 0;
      var g = parseInt(hex.substr(3,2),16) || 0;
      var b = parseInt(hex.substr(5,2),16) || 0;
      var brightness = (r + g + b) / 3;
      var warmth = r - b; // positive = warm

      // Get element size for context
      var w = parseFloat(el.getAttribute('width') || el.getAttribute('radius') || '0');
      var h = parseFloat(el.getAttribute('height') || '0');
      var isLarge = (w > 1 || h > 2);
      var tag = el.tagName.toLowerCase();

      // Skip very bright colors (white, light accents)
      if (brightness > 150) return;
      // Skip brand accent colors (saturated colors)
      var saturation = Math.max(r,g,b) - Math.min(r,g,b);
      if (saturation > 80) return;

      var texId = null;
      var repeat = '2 2';

      if (isLarge) {
        // Large surfaces → concrete or wood
        if (warmth > 20 && brightness < 100) {
          texId = 'tex-wood-dark'; repeat = '3 2';
        } else {
          texId = 'tex-concrete'; repeat = '2 2';
        }
      } else if (tag === 'a-cylinder' && h > 1.5) {
        // Tall cylinders = pillars/stands → metal
        texId = 'tex-metal'; repeat = '1 2';
      } else if (warmth > 15 && brightness < 80) {
        // Warm dark small → wood-dark (furniture)
        texId = 'tex-wood-dark'; repeat = '2 1';
      } else if (warmth > 10 && brightness >= 80) {
        // Warm medium → wood-light (shelves)
        texId = 'tex-wood-light'; repeat = '2 1';
      } else if (brightness < 60) {
        // Neutral dark small → concrete
        texId = 'tex-concrete'; repeat = '2 2';
      } else {
        // Neutral medium small → metal
        texId = 'tex-metal'; repeat = '2 2';
      }

      if (texId) {
        el.setAttribute('material', 'src', '#' + texId);
        el.setAttribute('material', 'repeat', repeat);
        el.setAttribute('material', 'color', '#ffffff');
        count++;
      }
    });
    console.log('[Interiors] Auto-textured ' + count + ' flat surfaces');
  },

  // ─── Helper: Create entity with children ───
  addEntity(scene, pos, children) {
    const wrapper = document.createElement('a-entity');
    wrapper.setAttribute('position', pos);
    wrapper.innerHTML = children;
    scene.appendChild(wrapper);
  },

  // ─── CONCRETE ROSE Interior (Luxury Boutique) ───
  enhanceConcreteRose(scene) {
    const base = '-10 0 -8';
    this.addEntity(scene, base, `
      <!-- Realistic clothing rack (metal rail on legs) -->
      <a-entity position="-2 0 -1">
        <a-cylinder position="-1.2 1 0" radius="0.025" height="2" material="color: #c9a84c; metalness: 0.9; roughness: 0.1"></a-cylinder>
        <a-cylinder position="1.2 1 0" radius="0.025" height="2" material="color: #c9a84c; metalness: 0.9; roughness: 0.1"></a-cylinder>
        <a-cylinder position="0 2 0" radius="0.02" height="2.5" rotation="0 0 90" material="color: #c9a84c; metalness: 0.9; roughness: 0.1"></a-cylinder>
        <!-- Hanging garments -->
        <a-box position="-0.6 1.5 0" width="0.4" height="0.9" depth="0.06" material="color: #ffffff; opacity: 0.9"></a-box>
        <a-box position="0 1.5 0" width="0.4" height="0.85" depth="0.06" material="color: #c94060; opacity: 0.7"></a-box>
        <a-box position="0.6 1.5 0" width="0.4" height="0.95" depth="0.06" material="color: #2a1520"></a-box>
      </a-entity>

      <!-- Wall-mounted shelving unit (metal brackets + wood shelves) -->
      <a-box position="-3 1.5 -3.5" width="3" height="0.05" depth="0.45" material="src: #tex-wood-light; repeat: 3 1; roughness: 0.5"></a-box>
      <a-box position="-3 2.5 -3.5" width="3" height="0.05" depth="0.45" material="src: #tex-wood-light; repeat: 3 1; roughness: 0.5"></a-box>
      <a-box position="-3 3.5 -3.5" width="3" height="0.05" depth="0.45" material="src: #tex-wood-light; repeat: 3 1; roughness: 0.5"></a-box>
      <!-- Folded items on shelves -->
      <a-box position="-3.5 1.7 -3.4" width="0.35" height="0.2" depth="0.3" material="color: #2a1520"></a-box>
      <a-box position="-3 1.7 -3.4" width="0.35" height="0.2" depth="0.3" material="color: #1a1a1a"></a-box>
      <a-box position="-3.5 2.7 -3.4" width="0.35" height="0.2" depth="0.3" material="color: #c94060; opacity: 0.8"></a-box>
      <a-box position="-2.5 2.7 -3.4" width="0.35" height="0.2" depth="0.3" material="color: #f0e0d0"></a-box>

      <!-- Mannequin (torso form on stand) -->
      <a-entity position="-1 0 1">
        <a-cylinder position="0 0.3 0" radius="0.12" height="0.6" material="color: #1a1a1a; metalness: 0.4"></a-cylinder>
        <a-cylinder position="0 0.6 0" radius="0.03" height="0.3" material="color: #888; metalness: 0.8"></a-cylinder>
        <a-cylinder position="0 1 0" radius="0.22" height="0.6" material="color: #2a2a2a; roughness: 0.8"></a-cylinder>
        <a-cylinder position="0 1.5 0" radius="0.18" height="0.5" material="color: #2a2a2a; roughness: 0.8"></a-cylinder>
        <a-sphere position="0 2 0" radius="0.14" material="color: #2a2a2a; roughness: 0.8"></a-sphere>
      </a-entity>

      <!-- Full-length mirror (framed) -->
      <a-plane position="3 2.5 -3.5" width="1.2" height="2.8" material="color: #bbc; metalness: 0.95; roughness: 0.05"></a-plane>
      <a-box position="3 2.5 -3.55" width="1.35" height="3" depth="0.04" material="color: #c9a84c; metalness: 0.7"></a-box>

      <!-- Checkout counter (textured wood + glass) -->
      <a-box position="3 0.5 2" width="1.8" height="1" depth="0.7" material="src: #tex-wood-dark; repeat: 2 1; roughness: 0.5; metalness: 0.1"></a-box>
      <a-box position="3 1.05 2" width="1.85" height="0.04" depth="0.75" material="src: #tex-metal; metalness: 0.6; roughness: 0.3"></a-box>
      <!-- Register -->
      <a-box position="3.2 1.2 2" width="0.3" height="0.15" depth="0.25" material="color: #111; metalness: 0.4"></a-box>

      <!-- Track lighting rail -->
      <a-cylinder position="0 7.5 0" radius="0.03" height="8" rotation="0 0 90" material="color: #2a2a2a; metalness: 0.6"></a-cylinder>
      <a-cone position="-2 7.2 -1" radius-bottom="0.12" radius-top="0" height="0.25" rotation="180 0 0" material="color: #2a2a2a; emissive: #c94060; emissiveIntensity: 0.3"></a-cone>
      <a-cone position="1 7.2 1" radius-bottom="0.12" radius-top="0" height="0.25" rotation="180 0 0" material="color: #2a2a2a; emissive: #c94060; emissiveIntensity: 0.3"></a-cone>

      <!-- CR logo art on back wall -->
      <a-plane position="0 4.5 -3.85" width="2" height="1.5" material="color: #c94060; opacity: 0.1; transparent: true"></a-plane>
      <a-text value="CONCRETE ROSE" position="0 4.5 -3.82" align="center" color="#c94060" width="4" opacity="0.2"></a-text>
    `);
  },

  // ─── BiJaDi Interior ───
  enhanceBiJaDi(scene) {
    const base = '10 0 -8';
    this.addEntity(scene, base, `
      <!-- Glass display cases -->
      <a-box position="0 0.8 -2" width="2" height="1" depth="0.8" material="color: #e8d8c8; metalness: 0.3; roughness: 0.4"></a-box>
      <a-box position="0 1.6 -2" width="2" height="0.6" depth="0.8" material="color: #ddd; opacity: 0.15; transparent: true; metalness: 0.9"></a-box>

      <!-- Jewelry items on display -->
      <a-torus position="-0.3 1.5 -2" radius="0.1" radius-tubular="0.02" rotation="90 0 0" material="color: #c9a84c; metalness: 0.95"></a-torus>
      <a-torus position="0.3 1.5 -2" radius="0.12" radius-tubular="0.02" rotation="90 0 0" material="color: #d4c8b8; metalness: 0.95"></a-torus>

      <!-- Family photo wall -->
      <a-plane position="1 3 3.7" width="1.2" height="1.5" rotation="0 180 0" material="color: #2a2030; opacity: 0.8"></a-plane>
      <a-plane position="2.5 3 3.7" width="1" height="1.2" rotation="0 180 0" material="color: #2a2030; opacity: 0.8"></a-plane>

      <!-- Platinum accent columns -->
      <a-cylinder position="-3 4 -3" radius="0.15" height="8" material="color: #d4c8b8; metalness: 0.8; roughness: 0.2"></a-cylinder>
      <a-cylinder position="-3 4 3" radius="0.15" height="8" material="color: #d4c8b8; metalness: 0.8; roughness: 0.2"></a-cylinder>

      <!-- Folded items display table -->
      <a-box position="-2 0.5 0" width="2" height="1" depth="1.5" material="color: #f0e8e0; roughness: 0.6"></a-box>
      <a-box position="-2.3 1.1 0.2" width="0.5" height="0.2" depth="0.4" material="color: #f0e8e0"></a-box>
      <a-box position="-1.7 1.1 -0.2" width="0.5" height="0.2" depth="0.4" material="color: #d4c8b8"></a-box>

      <!-- Chandelier -->
      <a-entity position="0 7 0">
        <a-cylinder radius="0.3" height="0.1" material="color: #d4c8b8; metalness: 0.9"></a-cylinder>
        <a-sphere position="-0.3 -0.3 0" radius="0.06" material="color: #fff; emissive: #ffe8c0; emissiveIntensity: 0.8"></a-sphere>
        <a-sphere position="0.3 -0.3 0" radius="0.06" material="color: #fff; emissive: #ffe8c0; emissiveIntensity: 0.8"></a-sphere>
        <a-sphere position="0 -0.3 0.3" radius="0.06" material="color: #fff; emissive: #ffe8c0; emissiveIntensity: 0.8"></a-sphere>
        <a-sphere position="0 -0.3 -0.3" radius="0.06" material="color: #fff; emissive: #ffe8c0; emissiveIntensity: 0.8"></a-sphere>
      </a-entity>
    `);
  },

  // ─── Faithfully Faded Interior (Edgy Streetwear) ───
  enhanceFaithfullyFaded(scene) {
    const base = '-10 0 -22';
    this.addEntity(scene, base, `
      <!-- Realistic clothing rack #1 (metal pipe rack) -->
      <a-entity position="-2 0 -1">
        <a-cylinder position="-1.2 1 0" radius="0.02" height="2" material="color: #420420; metalness: 0.7"></a-cylinder>
        <a-cylinder position="1.2 1 0" radius="0.02" height="2" material="color: #420420; metalness: 0.7"></a-cylinder>
        <a-cylinder position="0 2 0" radius="0.015" height="2.5" rotation="0 0 90" material="color: #420420; metalness: 0.7"></a-cylinder>
        <!-- Hanging garments (thin fabric shapes) -->
        <a-box position="-0.7 1.5 0" width="0.38" height="0.85" depth="0.04" material="color: #420420; opacity: 0.85"></a-box>
        <a-box position="-0.2 1.5 0" width="0.38" height="0.8" depth="0.04" material="color: #FFADED; opacity: 0.7"></a-box>
        <a-box position="0.3 1.5 0" width="0.38" height="0.9" depth="0.04" material="color: #ffffff"></a-box>
        <a-box position="0.8 1.5 0" width="0.38" height="0.75" depth="0.04" material="color: #FFADED; opacity: 0.5"></a-box>
      </a-entity>

      <!-- Clothing rack #2 (along wall) -->
      <a-entity position="1 0 -3">
        <a-cylinder position="-1 1 0" radius="0.02" height="2" material="color: #420420; metalness: 0.7"></a-cylinder>
        <a-cylinder position="1 1 0" radius="0.02" height="2" material="color: #420420; metalness: 0.7"></a-cylinder>
        <a-cylinder position="0 2 0" radius="0.015" height="2.1" rotation="0 0 90" material="color: #420420; metalness: 0.7"></a-cylinder>
        <a-box position="-0.5 1.5 0" width="0.38" height="0.9" depth="0.04" material="color: #2a0f15"></a-box>
        <a-box position="0 1.5 0" width="0.38" height="0.7" depth="0.04" material="color: #FFADED; opacity: 0.6"></a-box>
        <a-box position="0.5 1.5 0" width="0.38" height="0.85" depth="0.04" material="color: #420420"></a-box>
      </a-entity>

      <!-- Butterfly neon sign on wall -->
      <a-text value="JUST BE BLUNT" position="0 5.5 -3.82" align="center" color="#FFADED" width="4" opacity="0.5"></a-text>
      <a-box position="0 5.5 -3.85" width="4.5" height="0.7" depth="0.03" material="color: #FFADED; emissive: #FFADED; emissiveIntensity: 0.15; opacity: 0.2; transparent: true"></a-box>

      <!-- Checkout counter -->
      <a-box position="3 0.5 2" width="1.5" height="1" depth="0.6" material="color: #2a1520; roughness: 0.6"></a-box>
      <a-box position="3 1.05 2" width="1.55" height="0.04" depth="0.65" material="color: #3a2530; roughness: 0.4"></a-box>
      <a-box position="3.2 1.2 2" width="0.25" height="0.12" depth="0.2" material="color: #111; metalness: 0.4"></a-box>

      <!-- Full-length mirror -->
      <a-plane position="-4 2.5 -1" width="1" height="3" rotation="0 90 0" material="color: #bbc; metalness: 0.95; roughness: 0.05"></a-plane>
      <a-box position="-4.04 2.5 -1" width="0.04" height="3.15" depth="1.15" material="color: #420420"></a-box>

      <!-- Hat display stand -->
      <a-entity position="2 0 -2">
        <a-cylinder position="0 0.7 0" radius="0.06" height="1.4" material="color: #420420; metalness: 0.5"></a-cylinder>
        <a-cylinder position="0 1.4 0" radius="0.15" height="0.04" material="color: #420420; metalness: 0.5"></a-cylinder>
        <a-cylinder position="0 1.5 0" radius="0.18" height="0.12" material="color: #FFADED; opacity: 0.7"></a-cylinder>
      </a-entity>

      <!-- Shoe shelf -->
      <a-box position="-2 0.2 2.5" width="1.5" height="0.04" depth="0.4" material="color: #2a1520; roughness: 0.5"></a-box>
      <a-box position="-2 0.6 2.5" width="1.5" height="0.04" depth="0.4" material="color: #2a1520; roughness: 0.5"></a-box>
    `);
  },

  // ─── H.O.E. Interior ───
  enhanceHOE(scene) {
    const base = '10 0 -22';
    this.addEntity(scene, base, `
      <!-- Throne display -->
      <a-box position="0 0.8 -3" width="1.2" height="1.6" depth="0.8" material="color: #1a1412; metalness: 0.3"></a-box>
      <a-box position="0 2 -3.3" width="1.4" height="1.5" depth="0.1" material="color: #1a1412"></a-box>
      <a-box position="0 2.8 -3.3" width="1.6" height="0.3" depth="0.1" material="color: #e8c060; metalness: 0.9"></a-box>

      <!-- Gold chain display wall -->
      <a-entity position="-2 3 -3.7">
        <a-box width="2" height="2" depth="0.05" material="color: #1a1412"></a-box>
        <a-torus position="-0.3 0.3 0.05" radius="0.15" radius-tubular="0.02" rotation="0 0 0" material="color: #e8c060; metalness: 0.9"></a-torus>
        <a-torus position="0.3 -0.2 0.05" radius="0.2" radius-tubular="0.025" rotation="0 0 0" material="color: #e8c060; metalness: 0.9"></a-torus>
      </a-entity>

      <!-- Shoe pedestals -->
      <a-cylinder position="-2 0.4 1" radius="0.3" height="0.8" material="color: #1a1412; metalness: 0.3"></a-cylinder>
      <a-cylinder position="-3 0.4 -1" radius="0.3" height="0.8" material="color: #1a1412; metalness: 0.3"></a-cylinder>

      <!-- Gold leaf accent panels -->
      <a-plane position="-4.3 4 0" width="0.1" height="2" rotation="0 90 0" material="color: #e8c060; emissive: #e8c060; emissiveIntensity: 0.2; opacity: 0.4; transparent: true"></a-plane>

      <!-- Mannequin with crown -->
      <a-entity position="-1 0 2">
        <a-cylinder position="0 1.2 0" radius="0.25" height="2.2" material="color: #1a1412"></a-cylinder>
        <a-sphere position="0 2.5 0" radius="0.2" material="color: #1a1412"></a-sphere>
        <a-cone position="0 2.85 0" radius-bottom="0.22" radius-top="0.15" height="0.2" material="color: #e8c060; metalness: 0.9"></a-cone>
      </a-entity>
    `);
  },

  // ─── Wanderlust Interior ───
  enhanceWanderlust(scene) {
    const base = '-10 0 -38';
    this.addEntity(scene, base, `
      <!-- World map on back wall -->
      <a-plane position="0 3.5 -3.85" width="6" height="3" material="color: #1a3a2a; roughness: 0.8"></a-plane>
      <a-text value="EXPLORE EVERYTHING" position="0 5.2 -3.8" align="center" color="#60c890" width="4" opacity="0.5"></a-text>

      <!-- Luggage display -->
      <a-box position="-3 0.4 -2" width="0.8" height="0.6" depth="0.5" material="color: #8a6a4a; roughness: 0.7"></a-box>
      <a-box position="-3 0.8 -2.5" width="0.6" height="0.45" depth="0.4" material="color: #6a5a3a; roughness: 0.7"></a-box>

      <!-- Postcard rack -->
      <a-box position="-3 2 1" width="0.1" height="2" depth="1.2" material="color: #4a3a2a"></a-box>
      <a-box position="-3.1 2.2 0.6" width="0.05" height="0.3" depth="0.22" material="color: #60c890; opacity: 0.7"></a-box>
      <a-box position="-3.1 2.2 1.0" width="0.05" height="0.3" depth="0.22" material="color: #a090e0; opacity: 0.7"></a-box>
      <a-box position="-3.1 2.2 1.4" width="0.05" height="0.3" depth="0.22" material="color: #e0a060; opacity: 0.7"></a-box>

      <!-- Compass floor inlay -->
      <a-ring position="0 0.02 0" rotation="-90 0 0" radius-inner="0.8" radius-outer="1.2" material="color: #60c890; emissive: #60c890; emissiveIntensity: 0.15; opacity: 0.3; transparent: true"></a-ring>
      <a-text value="N" position="0 0.03 -1" rotation="-90 0 0" align="center" color="#60c890" width="2" opacity="0.4"></a-text>

      <!-- Hat rack -->
      <a-cylinder position="3 2 -2" radius="0.08" height="4" material="color: #6a5a4a"></a-cylinder>
      <a-box position="3 3.5 -2" width="0.6" height="0.08" depth="0.08" material="color: #6a5a4a"></a-box>
    `);
  },

  // ─── Café Sativa Interior (LOUNGE — no coffee) ───
  enhanceCafeSativa(scene) {
    const base = '10 0 -38';
    this.addEntity(scene, base, `
      <!-- ═══ THE BAR (CLICKABLE) ═══ -->
      <a-entity position="-2 1.5 1" class="clickable" interactive-panel="type: cocktail-menu; label: View Cocktail Menu; color: #c09060"></a-entity>
      <a-box position="-2 0.55 0" width="3.5" height="1.1" depth="0.7" material="src: #tex-wood-dark; repeat: 3 1; roughness: 0.4; metalness: 0.15; color: #ffffff"></a-box>
      <a-box position="-2 1.15 0" width="3.6" height="0.06" depth="0.75" material="src: #tex-metal; metalness: 0.5; roughness: 0.3; color: #ffffff"></a-box>
      <!-- Bottles -->
      <a-cylinder position="-3 1.5 0.1" radius="0.05" height="0.6" material="color: #4a6a3a; metalness: 0.4"></a-cylinder>
      <a-cylinder position="-2.6 1.45 0.1" radius="0.05" height="0.5" material="color: #8a6020; metalness: 0.5"></a-cylinder>
      <a-cylinder position="-2.2 1.5 0.1" radius="0.05" height="0.6" material="color: #3a2a2a; metalness: 0.4"></a-cylinder>
      <a-cylinder position="-1.8 1.48 0.1" radius="0.04" height="0.55" material="color: #c9a84c; metalness: 0.6"></a-cylinder>
      <a-cylinder position="-1.3 1.5 0.1" radius="0.05" height="0.6" material="color: #2a4a4a; metalness: 0.4"></a-cylinder>
      <!-- Bar stools -->
      <a-entity position="-2.8 0 1">
        <a-cylinder position="0 0.45 0" radius="0.03" height="0.9" material="color: #2a2a2a; metalness: 0.6"></a-cylinder>
        <a-cylinder position="0 0.92 0" radius="0.18" height="0.05" material="src: #tex-leather; roughness: 0.5; color: #ffffff"></a-cylinder>
      </a-entity>
      <a-entity position="-2 0 1">
        <a-cylinder position="0 0.45 0" radius="0.03" height="0.9" material="color: #2a2a2a; metalness: 0.6"></a-cylinder>
        <a-cylinder position="0 0.92 0" radius="0.18" height="0.05" material="src: #tex-leather; roughness: 0.5; color: #ffffff"></a-cylinder>
      </a-entity>
      <a-entity position="-1.2 0 1">
        <a-cylinder position="0 0.45 0" radius="0.03" height="0.9" material="color: #2a2a2a; metalness: 0.6"></a-cylinder>
        <a-cylinder position="0 0.92 0" radius="0.18" height="0.05" material="src: #tex-leather; roughness: 0.5; color: #ffffff"></a-cylinder>
      </a-entity>

      <!-- ═══ COLD STONED GELATO BAR ═══ -->
      <a-entity position="3 0 2">
        <!-- Glass display case -->
        <a-box position="0 0.5 0" width="2" height="1" depth="0.8" material="color: #1a1a1a; roughness: 0.3; metalness: 0.2"></a-box>
        <a-box position="0 1.05 0" width="2.1" height="0.05" depth="0.85" material="color: #e8e8e8; metalness: 0.6; roughness: 0.2"></a-box>
        <!-- Glass front -->
        <a-box position="0 0.7 0.41" width="1.9" height="0.5" depth="0.02" material="color: #aaddff; opacity: 0.3; transparent: true; metalness: 0.4"></a-box>
        <!-- Gelato tubs (colorful) -->
        <a-cylinder position="-0.6 0.55 0" radius="0.12" height="0.15" material="color: #e8a0b0"></a-cylinder>
        <a-cylinder position="-0.3 0.55 0" radius="0.12" height="0.15" material="color: #a0d8a0"></a-cylinder>
        <a-cylinder position="0 0.55 0" radius="0.12" height="0.15" material="color: #d8c0a0"></a-cylinder>
        <a-cylinder position="0.3 0.55 0" radius="0.12" height="0.15" material="color: #b0a0e0"></a-cylinder>
        <a-cylinder position="0.6 0.55 0" radius="0.12" height="0.15" material="color: #e0d080"></a-cylinder>
        <!-- CLICKABLE gelato menu -->
        <a-entity position="0 0.5 0.5" class="clickable" interactive-panel="type: gelato-menu; label: View Gelato Menu; color: #e8d0ff"></a-entity>
        <!-- Sign -->
        <a-text value="COLD STONED" position="0 1.6 0" align="center" color="#e8d0ff" width="3" font="mozillavr"></a-text>
        <a-text value="CBD Infused Gelato" position="0 1.3 0" align="center" color="#a08060" width="2" opacity="0.6"></a-text>
      </a-entity>

      <!-- ═══ THE STAGE ═══ -->
      <a-entity position="0 0 -3.5">
        <!-- Raised platform -->
        <a-box position="0 0.15 0" width="4" height="0.3" depth="3" material="color: #2a1a10; roughness: 0.5"></a-box>
        <!-- Stage edge trim -->
        <a-box position="0 0.31 1.5" width="4" height="0.02" depth="0.05" material="color: #c9a84c; emissive: #c9a84c; emissiveIntensity: 0.3"></a-box>

        <!-- Spotlights -->
        <a-entity light="type: spot; color: #e8c060; intensity: 2; angle: 30; penumbra: 0.5; distance: 8; decay: 1.5" position="-1.5 5 0" rotation="-60 0 0"></a-entity>
        <a-entity light="type: spot; color: #c060a0; intensity: 1.5; angle: 25; penumbra: 0.5; distance: 8; decay: 1.5" position="1.5 5 0" rotation="-60 0 0"></a-entity>

        <!-- Mic stand on stage -->
        <a-cylinder position="0 0.3 0.3" radius="0.15" height="0.03" material="color: #333; metalness: 0.6"></a-cylinder>
        <a-cylinder position="0 1.3 0.3" radius="0.02" height="1.7" material="color: #555; metalness: 0.6"></a-cylinder>
        <a-sphere position="0 2.2 0.3" radius="0.06" material="color: #333; metalness: 0.5"></a-sphere>

        <!-- Jazz singer silhouette -->
        <a-cylinder position="-1 0.6 -0.5" radius="0.2" height="0.8" material="color: #1a0a10; roughness: 0.8"></a-cylinder>
        <a-sphere position="-1 1.15 -0.5" radius="0.15" material="color: #c49470; roughness: 0.6"></a-sphere>
        <a-sphere position="-1 1.3 -0.55" radius="0.17" material="color: #0a0508; roughness: 0.9"></a-sphere>

        <!-- Piano (stage left) -->
        <a-box position="1.2 0.6 -0.5" width="1" height="0.08" depth="0.5" material="color: #0a0a0a; metalness: 0.3"></a-box>
        <a-box position="1.2 0.8 -0.75" width="1" height="0.5" depth="0.06" material="color: #0a0a0a; metalness: 0.3"></a-box>
      </a-entity>

      <!-- ═══ SMOKERS LOUNGE ═══ -->
      <a-entity position="2.5 0 -1.5">
        <!-- Leather sofa -->
        <a-box position="0 0.25 0" width="2" height="0.5" depth="0.8" material="src: #tex-leather; repeat: 2 1; roughness: 0.7; color: #ffffff"></a-box>
        <a-box position="0 0.55 -0.35" width="2" height="0.45" depth="0.1" material="src: #tex-leather; repeat: 2 1; roughness: 0.7; color: #ffffff"></a-box>
        <!-- Pillows -->
        <a-box position="-0.6 0.55 0" width="0.3" height="0.25" depth="0.25" rotation="0 0 10" material="color: #c09060"></a-box>
        <a-box position="0.6 0.55 0" width="0.3" height="0.25" depth="0.25" rotation="0 0 -10" material="color: #8a6040"></a-box>

        <!-- Low table -->
        <a-box position="0 0.35 0.8" width="1.2" height="0.04" depth="0.6" material="src: #tex-wood-light; repeat: 2 1; roughness: 0.4; color: #ffffff"></a-box>
        <a-box position="-0.5 0.17 0.6" width="0.04" height="0.34" depth="0.04" material="color: #2a2a2a; metalness: 0.5"></a-box>
        <a-box position="0.5 0.17 0.6" width="0.04" height="0.34" depth="0.04" material="color: #2a2a2a; metalness: 0.5"></a-box>
        <a-box position="-0.5 0.17 1" width="0.04" height="0.34" depth="0.04" material="color: #2a2a2a; metalness: 0.5"></a-box>
        <a-box position="0.5 0.17 1" width="0.04" height="0.34" depth="0.04" material="color: #2a2a2a; metalness: 0.5"></a-box>

        <!-- Hookah/shisha -->
        <a-cylinder position="0 0.4 0.8" radius="0.08" height="0.5" material="color: #c9a84c; metalness: 0.7"></a-cylinder>
        <a-sphere position="0 0.7 0.8" radius="0.1" material="color: #4a3a2a; metalness: 0.3"></a-sphere>
        <a-cylinder position="0 0.82 0.8" radius="0.03" height="0.15" material="color: #888; metalness: 0.6"></a-cylinder>
      </a-entity>

      <!-- ═══ THE GALLERY (CLICKABLE — opens art marketplace) (Art on walls) ═══ -->
      <a-plane position="-3.8 3.5 -2" width="1.5" height="1.2" rotation="0 90 0" material="color: #2a1a10; roughness: 0.3"></a-plane>
      <a-plane position="-3.8 3.5 -2" width="1.4" height="1.1" rotation="0 90 0" material="color: #e8d8c0; emissive: #e8d0c0; emissiveIntensity: 0.05"></a-plane>
      <a-plane position="-3.8 3.5 0.5" width="1.5" height="1.2" rotation="0 90 0" material="color: #2a1a10; roughness: 0.3"></a-plane>
      <a-plane position="-3.8 3.5 0.5" width="1.4" height="1.1" rotation="0 90 0" material="color: #d8c8b0; emissive: #d8c0b0; emissiveIntensity: 0.05"></a-plane>

      <!-- ═══ CIGAR HUMIDOR (CLICKABLE) ═══ -->
      <a-entity position="-3.5 1.5 -3" class="clickable" interactive-panel="type: cigar-menu; label: Browse Cigars; color: #c09060"></a-entity>
      <a-box position="-3.5 1 -3.3" width="0.9" height="0.55" depth="0.55" material="src: #tex-wood-dark; repeat: 1 1; roughness: 0.3; metalness: 0.15; color: #ffffff"></a-box>
      <a-box position="-3.5 1.3 -3.3" width="0.92" height="0.05" depth="0.57" material="src: #tex-wood-dark; repeat: 1 1; roughness: 0.3; color: #ffffff"></a-box>

      <!-- ═══ SIGNAGE ═══ -->
      <a-plane position="0 5 -3.85" width="4" height="2" material="color: #1a1410; roughness: 0.9"></a-plane>
      <a-text value="CAFE SATIVA" position="0 5.2 -3.82" align="center" color="#c09060" width="5" font="mozillavr"></a-text>
      <a-text value="SIP . SMOKE . VIBE" position="0 4.6 -3.82" align="center" color="#e8d8c8" width="3" opacity="0.5"></a-text>
      <!-- Neon effect -->
      <a-box position="0 5.2 -3.84" width="3.5" height="0.5" depth="0.02" material="color: #c09060; emissive: #c09060; emissiveIntensity: 0.2; opacity: 0.15; transparent: true"></a-box>

      <!-- Cold Stoned neon -->
      <a-text value="COLD STONED" position="3 2.5 2.5" align="center" color="#e8d0ff" width="2.5" rotation="0 180 0"></a-text>
      <a-box position="3 2.5 2.5" width="2" height="0.4" depth="0.02" rotation="0 180 0" material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.15; opacity: 0.15; transparent: true"></a-box>

      <!-- Ambient warm lighting -->
      <a-entity light="type: point; color: #e8c060; intensity: 0.8; distance: 10; decay: 1.5" position="0 4 -2"></a-entity>
      <a-entity light="type: point; color: #c09060; intensity: 0.6; distance: 8; decay: 1.5" position="3 3 2"></a-entity>
    `);
  },


  // ─── The Verse Alkemist Interior ───
  enhanceVerseAlkemist(scene) {
    const base = '0 0 -58';
    this.addEntity(scene, base, `
      <!-- Sound absorption panels -->
      <a-box position="-6 3 -2" width="0.3" height="4" depth="3" material="color: #1a0a20; roughness: 0.95"></a-box>
      <a-box position="6 3 -2" width="0.3" height="4" depth="3" material="color: #1a0a20; roughness: 0.95"></a-box>
      <a-box position="-6 3 2" width="0.3" height="4" depth="3" material="color: #1a0a20; roughness: 0.95"></a-box>
      <a-box position="6 3 2" width="0.3" height="4" depth="3" material="color: #1a0a20; roughness: 0.95"></a-box>

      <!-- LED strips on walls + floor -->
      <a-box position="-5.8 0.1 -2" width="0.05" height="0.05" depth="8" material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.5; opacity: 0.6; transparent: true"></a-box>
      <a-box position="5.8 0.1 -2" width="0.05" height="0.05" depth="8" material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.5; opacity: 0.6; transparent: true"></a-box>
      <a-box position="0 0.02 -5.5" width="8" height="0.02" depth="0.05" material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.3; opacity: 0.4; transparent: true"></a-box>
      <a-box position="0 0.02 1" width="8" height="0.02" depth="0.05" material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.3; opacity: 0.4; transparent: true"></a-box>

      <!-- Back wall screen -->
      <a-plane position="0 5 -4.7" width="5" height="2.5" material="color: #0a0a14; emissive: #a060e0; emissiveIntensity: 0.05"></a-plane>
      <a-text value="THE VERSE ALKEMIST" position="0 5.5 -4.65" align="center" color="#a060e0" width="6" font="mozillavr" opacity="0.6"></a-text>
      <a-text value="WALLS OF THE WORLD EP" position="0 4.8 -4.65" align="center" color="#e0d0f0" width="4" opacity="0.3"></a-text>

      <!-- STUDIO DESK (center) -->
      <a-box position="0 0.8 -3.5" width="3" height="0.06" depth="1" material="color: #1a1a1a; metalness: 0.3; roughness: 0.4"></a-box>
      <a-box position="-1.4 0.4 -3.5" width="0.06" height="0.8" depth="0.8" material="color: #1a1a1a; metalness: 0.4"></a-box>
      <a-box position="1.4 0.4 -3.5" width="0.06" height="0.8" depth="0.8" material="color: #1a1a1a; metalness: 0.4"></a-box>
      <!-- Keyboard shelf -->
      <a-box position="0 0.65 -3.2" width="2.5" height="0.04" depth="0.5" material="color: #222; metalness: 0.3"></a-box>

      <!-- STUDIO MONITORS (left + right of desk) -->
      <a-entity position="-2.2 0.85 -4">
        <a-box width="0.35" height="0.5" depth="0.35" material="color: #1a1a1a; roughness: 0.3"></a-box>
        <a-circle position="0 0.05 0.18" radius="0.1" material="color: #333; emissive: #a060e0; emissiveIntensity: 0.1"></a-circle>
        <a-circle position="0 -0.1 0.18" radius="0.05" material="color: #444"></a-circle>
      </a-entity>
      <a-entity position="2.2 0.85 -4">
        <a-box width="0.35" height="0.5" depth="0.35" material="color: #1a1a1a; roughness: 0.3"></a-box>
        <a-circle position="0 0.05 0.18" radius="0.1" material="color: #333; emissive: #a060e0; emissiveIntensity: 0.1"></a-circle>
        <a-circle position="0 -0.1 0.18" radius="0.05" material="color: #444"></a-circle>
      </a-entity>

      <!-- BIG FLOOR SPEAKERS (left + right of stage) -->
      <a-entity position="-4.5 0 -3">
        <a-box width="0.7" height="1.2" depth="0.5" position="0 0.6 0" material="color: #0a0a0a; roughness: 0.3"></a-box>
        <a-circle position="0 0.85 0.26" radius="0.2" material="color: #1a1a1a; metalness: 0.3"></a-circle>
        <a-circle position="0 0.85 0.27" radius="0.08" material="color: #333"></a-circle>
        <a-circle position="0 0.45 0.26" radius="0.12" material="color: #1a1a1a; metalness: 0.3"></a-circle>
      </a-entity>
      <a-entity position="4.5 0 -3">
        <a-box width="0.7" height="1.2" depth="0.5" position="0 0.6 0" material="color: #0a0a0a; roughness: 0.3"></a-box>
        <a-circle position="0 0.85 0.26" radius="0.2" material="color: #1a1a1a; metalness: 0.3"></a-circle>
        <a-circle position="0 0.85 0.27" radius="0.08" material="color: #333"></a-circle>
        <a-circle position="0 0.45 0.26" radius="0.12" material="color: #1a1a1a; metalness: 0.3"></a-circle>
      </a-entity>

      <!-- MPC/DRUM MACHINE on desk -->
      <a-box position="-0.8 0.87 -3.5" width="0.5" height="0.08" depth="0.4" material="color: #2a2a2a; metalness: 0.5"></a-box>
      <a-box position="-0.8 0.92 -3.5" width="0.4" height="0.02" depth="0.3" material="color: #333; emissive: #a060e0; emissiveIntensity: 0.15"></a-box>

      <!-- TURNTABLE on desk -->
      <a-box position="0.8 0.87 -3.5" width="0.5" height="0.06" depth="0.4" material="color: #1a1a1a; metalness: 0.4"></a-box>
      <a-cylinder position="0.8 0.92 -3.5" radius="0.15" height="0.01" material="color: #222; metalness: 0.3"></a-cylinder>
      <a-cylinder position="0.8 0.93 -3.5" radius="0.01" height="0.02" material="color: #888; metalness: 0.8"></a-cylinder>

      <!-- CONDENSER MIC with boom arm -->
      <a-cylinder position="0 0 -3" radius="0.025" height="2.5" material="color: #666; metalness: 0.5"></a-cylinder>
      <a-box position="0 2.5 -3" width="0.8" height="0.03" depth="0.03" rotation="0 0 -15" material="color: #666; metalness: 0.5"></a-box>
      <a-cylinder position="0.35 2.4 -3" radius="0.04" height="0.15" rotation="0 0 0" material="color: #333; metalness: 0.6"></a-cylinder>
      <a-ring position="0.35 2.4 -2.85" radius-inner="0.06" radius-outer="0.09" material="color: #444; opacity: 0.4; transparent: true"></a-ring>

      <!-- VINYL RECORD CRATES -->
      <a-box position="-4 0.3 -1" width="0.8" height="0.6" depth="0.5" material="color: #2a2018"></a-box>
      <a-box position="-4 0.35 -1.05" width="0.7" height="0.5" depth="0.02" material="color: #a060e0; opacity: 0.4; transparent: true"></a-box>
      <a-box position="-4 0.3 0" width="0.8" height="0.6" depth="0.5" material="color: #2a2018"></a-box>

      <!-- CLICKABLE HEADPHONES (music player) -->
      <a-entity position="2 1.2 -2" class="clickable"
        interactive-panel="type: music; label: Stream Music; color: #a060e0">
        <a-torus radius="0.18" radius-tubular="0.035" rotation="0 0 10" material="color: #1a1a1a; metalness: 0.6; roughness: 0.3"></a-torus>
        <a-box position="0 0.15 0" width="0.38" height="0.04" depth="0.06" material="color: #1a1a1a; metalness: 0.5"></a-box>
        <a-cylinder position="-0.17 0 0" radius="0.07" height="0.04" rotation="90 0 0" material="color: #222; metalness: 0.4"></a-cylinder>
        <a-cylinder position="0.17 0 0" radius="0.07" height="0.04" rotation="90 0 0" material="color: #222; metalness: 0.4"></a-cylinder>
        <!-- Glow pulse -->
        <a-ring position="0 -0.3 0" rotation="-90 0 0" radius-inner="0.2" radius-outer="0.35"
          material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.4; opacity: 0.3; transparent: true"></a-ring>
      </a-entity>

      <!-- Second listening station -->
      <a-entity position="-3 1.2 -4" class="clickable"
        interactive-panel="type: music; label: Stream Sodade Cypher; color: #a060e0">
        <a-torus radius="0.15" radius-tubular="0.03" rotation="10 0 0" material="color: #2a2a2a; metalness: 0.5"></a-torus>
        <a-box position="0 0.12 0" width="0.32" height="0.03" depth="0.05" material="color: #2a2a2a; metalness: 0.4"></a-box>
        <a-ring position="0 -0.25 0" rotation="-90 0 0" radius-inner="0.15" radius-outer="0.3"
          material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.3; opacity: 0.25; transparent: true"></a-ring>
      </a-entity>

      <!-- Studio chair -->
      <a-entity position="0 0 -2.5">
        <a-box position="0 0.45 0" width="0.5" height="0.06" depth="0.5" material="color: #1a1a1a"></a-box>
        <a-box position="0 0.7 -0.23" width="0.5" height="0.5" depth="0.06" material="color: #1a1a1a"></a-box>
        <a-cylinder position="0 0.2 0" radius="0.03" height="0.4" material="color: #333; metalness: 0.5"></a-cylinder>
      </a-entity>
    `);
  },

  // ─── Ceiling Details (corridor-wide) ───
  addCeilingDetails(scene) {
    // Hanging light fixtures along corridor
    const lightPositions = [-5, -15, -25, -35, -45, -55];
    lightPositions.forEach(z => {
      this.addEntity(scene, `0 11 ${z}`, `
        <a-cylinder radius="0.4" height="0.1" material="color: #2a2a3a; metalness: 0.5"></a-cylinder>
        <a-cylinder radius="0.03" height="1" position="0 -0.5 0" material="color: #333"></a-cylinder>
        <a-sphere position="0 -1.1 0" radius="0.15" material="color: #e8d0ff; emissive: #e8d0ff; emissiveIntensity: 0.4; opacity: 0.8; transparent: true"></a-sphere>
      `);
    });

    // Decorative ceiling beams
    for (let z = -10; z >= -60; z -= 10) {
      this.addEntity(scene, `0 11.5 ${z}`, `
        <a-box width="30" height="0.3" depth="0.3" material="color: #1a1a28; metalness: 0.3"></a-box>
      `);
    }

    // TSE logo on ceiling at entrance
    this.addEntity(scene, '0 11.8 0', `
      <a-text value="TSE" rotation="90 0 0" align="center" color="#c9a84c" width="8" opacity="0.15"></a-text>
    `);
  },

  // ─── AI Persona Avatar Figures ───
  // These are stylized placeholder figures until Ready Player Me GLBs are added
  addAvatars(scene) {
    var avatarConfigs = [
      { glb: 'assets/models/laviche.glb', pos: '2 0 4', rot: '0 200 0', id: 'avatar-laviche',
        skin: '#c49470', hair: '#1a0a05', hairStyle: 'long',
        top: '#1a1a1a', bottom: '#1a1a1a', shoes: '#c9a84c',
        accent: '#c9a84c', label: 'LAVICHE', labelColor: '#c9a84c' },
      { glb: 'assets/models/ginger.glb', pos: '-4 0 -36', rot: '0 90 0', id: 'avatar-ginger',
        skin: '#f0d0b8', hair: '#a03020', hairStyle: 'long',
        top: '#e8e0d8', bottom: '#60c890', shoes: '#3a3a3a',
        accent: '#60c890', label: 'GINGER', labelColor: '#60c890' },
      { glb: 'assets/models/ahnika.glb', pos: '-4 0 -20', rot: '0 90 0', id: 'avatar-ahnika',
        skin: '#d4a880', hair: '#0a0508', hairStyle: 'medium',
        top: '#FFADED', bottom: '#420420', shoes: '#1a1a1a',
        accent: '#FFADED', label: 'AHNIKA', labelColor: '#FFADED' },
    ];
    var self = this;
    avatarConfigs.forEach(function(cfg) {
      // Check if GLB exists — if so, skip the stick figure (model-placer handles it)
      fetch(cfg.glb, { method: 'HEAD' }).then(function(r) {
        if (!r.ok) {
          // GLB not found — add stick figure fallback
          self.addAvatar(scene, cfg);
          console.log('[Interiors] Stick-figure fallback for ' + cfg.id);
        } else {
          console.log('[Interiors] GLB found for ' + cfg.id + ' — skipping stick figure');
        }
      }).catch(function() {
        self.addAvatar(scene, cfg);
      });
    });
  },

  addAvatar(scene, cfg) {
    const w = document.createElement('a-entity');
    w.setAttribute('id', cfg.id);
    w.setAttribute('position', cfg.pos);
    w.setAttribute('rotation', cfg.rot);

    // Stylized human figure (approximately 1.7m tall)
    w.innerHTML = `
      <!-- Shoes -->
      <a-box position="-0.08 0.04 0" width="0.12" height="0.08" depth="0.22" material="color: ${cfg.shoes}; roughness: 0.4"></a-box>
      <a-box position="0.08 0.04 0" width="0.12" height="0.08" depth="0.22" material="color: ${cfg.shoes}; roughness: 0.4"></a-box>
      <!-- Legs -->
      <a-cylinder position="-0.08 0.5 0" radius="0.06" height="0.8" material="color: ${cfg.bottom}; roughness: 0.7"></a-cylinder>
      <a-cylinder position="0.08 0.5 0" radius="0.06" height="0.8" material="color: ${cfg.bottom}; roughness: 0.7"></a-cylinder>
      <!-- Torso -->
      <a-box position="0 1.15 0" width="0.32" height="0.5" depth="0.18" material="color: ${cfg.top}; roughness: 0.6"></a-box>
      <!-- Arms -->
      <a-cylinder position="-0.22 1.05 0" radius="0.04" height="0.55" rotation="0 0 10" material="color: ${cfg.top}; roughness: 0.6"></a-cylinder>
      <a-cylinder position="0.22 1.05 0" radius="0.04" height="0.55" rotation="0 0 -10" material="color: ${cfg.top}; roughness: 0.6"></a-cylinder>
      <!-- Hands -->
      <a-sphere position="-0.24 0.75 0" radius="0.04" material="color: ${cfg.skin}; roughness: 0.6"></a-sphere>
      <a-sphere position="0.24 0.75 0" radius="0.04" material="color: ${cfg.skin}; roughness: 0.6"></a-sphere>
      <!-- Neck -->
      <a-cylinder position="0 1.45 0" radius="0.04" height="0.1" material="color: ${cfg.skin}; roughness: 0.5"></a-cylinder>
      <!-- Head -->
      <a-sphere position="0 1.6 0" radius="0.12" material="color: ${cfg.skin}; roughness: 0.5"></a-sphere>
      <!-- Hair -->
      <a-sphere position="0 1.68 -0.02" radius="0.13" material="color: ${cfg.hair}; roughness: 0.9"
        scale="${cfg.hairStyle === 'long' ? '1 1.1 1.1' : '1 1 1'}"></a-sphere>
      ${cfg.hairStyle === 'long' ? `
        <a-cylinder position="0 1.45 -0.08" radius="0.1" height="0.35" material="color: ${cfg.hair}; roughness: 0.9"></a-cylinder>
      ` : ''}
      <!-- Name label -->
      <a-text value="${cfg.label}" position="0 2 0" align="center" color="${cfg.labelColor}" width="2" opacity="0.7"></a-text>
      <!-- Accent glow ring at feet -->
      <a-ring position="0 0.02 0" rotation="-90 0 0" radius-inner="0.3" radius-outer="0.5"
        material="color: ${cfg.accent}; emissive: ${cfg.accent}; emissiveIntensity: 0.3; opacity: 0.2; transparent: true"></a-ring>
    `;

    scene.appendChild(w);
  },
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  if (scene) {
    if (scene.hasLoaded) StoreInteriors.init();
    else scene.addEventListener('loaded', () => StoreInteriors.init());
  }
});

window.StoreInteriors = StoreInteriors;
