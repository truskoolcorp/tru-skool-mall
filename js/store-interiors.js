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
    this.enhanceCafeSativa(scene);
    this.enhanceVerseAlkemist(scene);
    this.addCeilingDetails(scene);
    this.addAvatars(scene);

    // Apply textures after TextureGen has created them
    setTimeout(() => this.applyTextures(scene), 1200);

    console.log('[Interiors] Enhanced store interiors with textures loaded');
  },

  // ─── Store Floor Planes (separate from corridor) ───
  addStoreFloors(scene) {
    const stores = [
      { pos: '-10 0.01 -8', size: '8 8', tex: 'carpet-dark', color: '#1a0a10' },   // Concrete Rose
      { pos: '10 0.01 -8', size: '8 8', tex: 'carpet-dark', color: '#1a1510' },     // BiJaDi
      { pos: '-10 0.01 -22', size: '8 8', tex: 'carpet-dark', color: '#1a0510' },   // Faithfully Faded
      { pos: '10 0.01 -22', size: '8 8', tex: 'carpet-dark', color: '#1a1508' },    // H.O.E.
      { pos: '-10 0.01 -38', size: '8 8', tex: 'wood-dark', color: '#3a2a18' },     // Wanderlust
      { pos: '10 0.01 -38', size: '8 8', tex: 'wood-dark', color: '#2a1a10' },      // Cafe Sativa
      { pos: '0 0.01 -58', size: '14 12', tex: 'carpet-dark', color: '#0a0515' },   // Verse Alkemist
    ];
    stores.forEach(s => {
      const sizes = s.size.split(' ');
      this.addEntity(scene, s.pos, `
        <a-plane rotation="-90 0 0" width="${sizes[0]}" height="${sizes[1]}"
          material="src: #tex-${s.tex}; repeat: 4 4; roughness: 0.85; color: ${s.color}"></a-plane>
      `);
    });
  },

  // ─── Apply textures to furniture after TextureGen loads ───
  applyTextures(scene) {
    // Apply wood textures to counters
    scene.querySelectorAll('[data-tex="wood-dark"]').forEach(el => {
      el.setAttribute('material', 'src: #tex-wood-dark; repeat: 2 2; roughness: 0.5; metalness: 0.1');
    });
    scene.querySelectorAll('[data-tex="leather"]').forEach(el => {
      el.setAttribute('material', 'src: #tex-leather-brown; repeat: 2 2; roughness: 0.7');
    });
    scene.querySelectorAll('[data-tex="metal"]').forEach(el => {
      el.setAttribute('material', 'src: #tex-metal-brushed; repeat: 1 1; metalness: 0.8; roughness: 0.3');
    });
    console.log('[Interiors] Textures applied to furniture');
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
        <a-box position="-0.6 1.5 0" width="0.4" height="0.9" depth="0.06" material="color: #1a0a10; opacity: 0.9"></a-box>
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
      <a-box position="3 1.05 2" width="1.85" height="0.04" depth="0.75" material="src: #tex-metal-brushed; metalness: 0.6; roughness: 0.3"></a-box>
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
        <a-box position="0.3 1.5 0" width="0.38" height="0.9" depth="0.04" material="color: #1a0a10"></a-box>
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
      <!-- Bar counter with bottles -->
      <a-box position="-2 0.55 0" width="3" height="1.1" depth="0.7" material="src: #tex-wood-dark; repeat: 3 1; roughness: 0.4; metalness: 0.15"></a-box>
      <a-box position="-2 1.15 0" width="3.1" height="0.06" depth="0.75" material="src: #tex-metal-brushed; metalness: 0.5; roughness: 0.3"></a-box>
      <!-- Bottles on bar -->
      <a-cylinder position="-2.5 1.5 0.1" radius="0.05" height="0.6" material="color: #4a6a3a; metalness: 0.3"></a-cylinder>
      <a-cylinder position="-2.2 1.45 0.1" radius="0.05" height="0.5" material="color: #8a6020; metalness: 0.4"></a-cylinder>
      <a-cylinder position="-1.8 1.5 0.1" radius="0.05" height="0.6" material="color: #3a2a2a; metalness: 0.3"></a-cylinder>

      <!-- Bar stools (realistic: thin leg + seat + footrest) -->
      <a-entity position="-2.5 0 1">
        <a-cylinder position="0 0.45 0" radius="0.03" height="0.9" material="color: #2a2a2a; metalness: 0.6"></a-cylinder>
        <a-cylinder position="0 0.92 0" radius="0.18" height="0.05" material="color: #5a3a1a; roughness: 0.5"></a-cylinder>
        <a-cylinder position="0 0.3 0" radius="0.15" height="0.02" material="color: #2a2a2a; metalness: 0.6"></a-cylinder>
      </a-entity>
      <a-entity position="-1.5 0 1">
        <a-cylinder position="0 0.45 0" radius="0.03" height="0.9" material="color: #2a2a2a; metalness: 0.6"></a-cylinder>
        <a-cylinder position="0 0.92 0" radius="0.18" height="0.05" material="color: #5a3a1a; roughness: 0.5"></a-cylinder>
        <a-cylinder position="0 0.3 0" radius="0.15" height="0.02" material="color: #2a2a2a; metalness: 0.6"></a-cylinder>
      </a-entity>

      <!-- Lounge sign (replaces coffee menu) -->
      <a-plane position="0 4.5 -3.85" width="3.5" height="1.8" material="color: #1a1410; roughness: 0.9"></a-plane>
      <a-text value="CAFE SATIVA" position="0 5 -3.82" align="center" color="#c09060" width="4" font="mozillavr"></a-text>
      <a-text value="SIP . SMOKE . VIBE" position="0 4.4 -3.82" align="center" color="#e8d8c8" width="3" opacity="0.6"></a-text>
      <a-text value="THE STAGE | THE GALLERY | THE KITCHEN\\nTHE CIGAR LOUNGE | THE BAR | THE LOUNGE" position="0 3.8 -3.82" align="center" color="#a08060" width="2.8" wrap-count="40" opacity="0.5"></a-text>

      <!-- Lounge seating (leather sofa) -->
      <a-entity position="2 0 -2">
        <a-box position="0 0.25 0" width="1.8" height="0.5" depth="0.8" material="src: #tex-leather-brown; repeat: 2 1; roughness: 0.7"></a-box>
        <a-box position="0 0.55 -0.35" width="1.8" height="0.4" depth="0.1" material="src: #tex-leather-brown; repeat: 2 1; roughness: 0.7"></a-box>
        <!-- Throw pillows -->
        <a-box position="-0.5 0.55 0" width="0.3" height="0.25" depth="0.25" rotation="0 0 10" material="color: #c09060; opacity: 0.8"></a-box>
        <a-box position="0.5 0.55 0" width="0.3" height="0.25" depth="0.25" rotation="0 0 -10" material="color: #8a6040; opacity: 0.8"></a-box>
      </a-entity>

      <!-- Low table (textured wood top + metal legs) -->
      <a-entity position="2 0 -0.8">
        <a-box position="0 0.35 0" width="1" height="0.04" depth="0.5" material="src: #tex-wood-light; repeat: 2 1; roughness: 0.4"></a-box>
        <a-box position="-0.4 0.17 -0.18" width="0.04" height="0.34" depth="0.04" material="color: #2a2a2a; metalness: 0.5"></a-box>
        <a-box position="0.4 0.17 -0.18" width="0.04" height="0.34" depth="0.04" material="color: #2a2a2a; metalness: 0.5"></a-box>
        <a-box position="-0.4 0.17 0.18" width="0.04" height="0.34" depth="0.04" material="color: #2a2a2a; metalness: 0.5"></a-box>
        <a-box position="0.4 0.17 0.18" width="0.04" height="0.34" depth="0.04" material="color: #2a2a2a; metalness: 0.5"></a-box>
      </a-entity>

      <!-- Cigar humidor display (textured wood) -->
      <a-box position="-3 1 -3.3" width="0.8" height="0.5" depth="0.5" material="src: #tex-wood-dark; repeat: 1 1; roughness: 0.3; metalness: 0.15"></a-box>
      <a-box position="-3 1.3 -3.3" width="0.82" height="0.05" depth="0.52" material="src: #tex-wood-dark; repeat: 1 1; roughness: 0.3"></a-box>

      <!-- Gallery frames on wall (art marketplace) -->
      <a-plane position="-1.5 3.5 -3.85" width="1.2" height="0.9" material="color: #2a2030; opacity: 0.8"></a-plane>
      <a-box position="-1.5 3.5 -3.87" width="1.3" height="1" depth="0.03" material="color: #c09060; metalness: 0.5"></a-box>
      <a-plane position="1.5 3.5 -3.85" width="1" height="1.2" material="color: #201a2a; opacity: 0.8"></a-plane>
      <a-box position="1.5 3.5 -3.87" width="1.1" height="1.3" depth="0.03" material="color: #c09060; metalness: 0.5"></a-box>

      <!-- Vinyl on wall (music venue element) -->
      <a-cylinder position="3 4 -3.8" radius="0.4" height="0.02" material="color: #111; metalness: 0.5"></a-cylinder>
      <a-circle position="3 4 -3.78" radius="0.12" material="color: #c09060"></a-circle>

      <!-- Warm ambient light -->
      <a-entity light="type: point; color: #e8a060; intensity: 0.4; distance: 8; decay: 1.5" position="0 3 0"></a-entity>
    `);
  },

  // ─── The Verse Alkemist Interior ───
  enhanceVerseAlkemist(scene) {
    const base = '0 0 -58';
    this.addEntity(scene, base, `
      <!-- Sound absorption panels -->
      <a-box position="-6 3 -2" width="0.3" height="4" depth="3" material="color: #1a0a20; roughness: 0.95"></a-box>
      <a-box position="6 3 -2" width="0.3" height="4" depth="3" material="color: #1a0a20; roughness: 0.95"></a-box>

      <!-- LED strips on walls -->
      <a-box position="-5.8 0.1 -2" width="0.05" height="0.05" depth="8" material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.5; opacity: 0.6; transparent: true"></a-box>
      <a-box position="5.8 0.1 -2" width="0.05" height="0.05" depth="8" material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.5; opacity: 0.6; transparent: true"></a-box>

      <!-- Monitor/screen behind booth -->
      <a-plane position="0 5 -4.7" width="4" height="2" material="color: #0a0515; emissive: #a060e0; emissiveIntensity: 0.08"></a-plane>
      <a-text value="THE VERSE ALKEMIST" position="0 5.3 -4.65" align="center" color="#a060e0" width="5" opacity="0.4"></a-text>
      <a-text value="WALLS OF THE WORLD EP" position="0 4.7 -4.65" align="center" color="#e0d0f0" width="4" opacity="0.3"></a-text>

      <!-- Crate of vinyl records -->
      <a-box position="-2 0.3 -1" width="0.8" height="0.6" depth="0.5" material="color: #2a2a2a"></a-box>
      <a-box position="-2 0.35 -1.05" width="0.7" height="0.5" depth="0.02" material="color: #a060e0; opacity: 0.5"></a-box>

      <!-- MPC/drum machine -->
      <a-box position="-1 1.2 -3" width="0.5" height="0.1" depth="0.4" material="color: #2a2a2a; metalness: 0.5"></a-box>
      <a-box position="-1 1.3 -3" width="0.4" height="0.02" depth="0.3" material="color: #333; emissive: #a060e0; emissiveIntensity: 0.1"></a-box>

      <!-- Additional mic with pop filter -->
      <a-cylinder position="-2 1.5 0" radius="0.025" height="2.5" material="color: #888"></a-cylinder>
      <a-sphere position="-2 2.8 0" radius="0.08" material="color: #444"></a-sphere>
      <a-ring position="-2 2.8 0.15" radius-inner="0.08" radius-outer="0.12" material="color: #555; opacity: 0.5; transparent: true"></a-ring>

      <!-- Headphones on hook -->
      <a-torus position="1 3 -4.5" radius="0.15" radius-tubular="0.025" rotation="0 90 20" material="color: #2a2a2a; metalness: 0.5"></a-torus>
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
    // Laviche — Grand Entrance hostess (gold/platinum accent)
    this.addAvatar(scene, {
      pos: '2 0 2', rot: '0 200 0', id: 'avatar-laviche',
      skin: '#c49470', hair: '#1a0a05', hairStyle: 'long',
      top: '#1a1a1a', bottom: '#1a1a1a', shoes: '#c9a84c',
      accent: '#c9a84c', label: 'LAVICHE', labelColor: '#c9a84c'
    });
    // Ginger — Wanderlust store (red hair, green accent)
    this.addAvatar(scene, {
      pos: '-7 0 -36', rot: '0 60 0', id: 'avatar-ginger',
      skin: '#f0d0b8', hair: '#a03020', hairStyle: 'long',
      top: '#e8e0d8', bottom: '#60c890', shoes: '#3a3a3a',
      accent: '#60c890', label: 'GINGER', labelColor: '#60c890'
    });
    // Ahnika — Faithfully Faded store (dark hair, pink accent)
    this.addAvatar(scene, {
      pos: '-7 0 -20', rot: '0 60 0', id: 'avatar-ahnika',
      skin: '#d4a880', hair: '#0a0508', hairStyle: 'medium',
      top: '#FFADED', bottom: '#420420', shoes: '#1a1a1a',
      accent: '#FFADED', label: 'AHNIKA', labelColor: '#FFADED'
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
