/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Enhanced Store Interiors
   Dynamic geometry: shelving, racks, mirrors, display cases,
   fitting rooms, counters, ceiling details
   ═══════════════════════════════════════════════════════════ */

const StoreInteriors = {

  init() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    this.enhanceConcreteRose(scene);
    this.enhanceBiJaDi(scene);
    this.enhanceFaithfullyFaded(scene);
    this.enhanceHOE(scene);
    this.enhanceWanderlust(scene);
    this.enhanceCafeSativa(scene);
    this.enhanceVerseAlkemist(scene);
    this.addCeilingDetails(scene);

    console.log('[Interiors] Enhanced store interiors loaded');
  },

  // ─── Helper: Create entity with children ───
  addEntity(scene, pos, children) {
    const wrapper = document.createElement('a-entity');
    wrapper.setAttribute('position', pos);
    wrapper.innerHTML = children;
    scene.appendChild(wrapper);
  },

  // ─── CONCRETE ROSE Interior ───
  enhanceConcreteRose(scene) {
    const base = '-10 0 -8';
    this.addEntity(scene, base, `
      <!-- Wall-mounted shelving unit -->
      <a-box position="-3 2.5 -3.5" width="3" height="0.08" depth="0.6" material="color: #333; metalness: 0.4"></a-box>
      <a-box position="-3 3.5 -3.5" width="3" height="0.08" depth="0.6" material="color: #333; metalness: 0.4"></a-box>
      <a-box position="-3 1.5 -3.5" width="3" height="0.08" depth="0.6" material="color: #333; metalness: 0.4"></a-box>

      <!-- Folded items on shelves -->
      <a-box position="-3.5 2.7 -3.4" width="0.4" height="0.25" depth="0.35" material="color: #2a1520"></a-box>
      <a-box position="-2.8 2.7 -3.4" width="0.4" height="0.25" depth="0.35" material="color: #1a1a1a"></a-box>
      <a-box position="-3.5 3.7 -3.4" width="0.4" height="0.25" depth="0.35" material="color: #c94060; opacity: 0.8"></a-box>

      <!-- Mirror (reflective panel) -->
      <a-plane position="3 3 -3.5" width="1.5" height="3" material="color: #aab; metalness: 0.95; roughness: 0.05"></a-plane>
      <a-box position="3 3 -3.55" width="1.7" height="3.2" depth="0.05" material="color: #1a1a1a"></a-box>

      <!-- Additional mannequin -->
      <a-cylinder position="-1 1.2 1" radius="0.25" height="2.4" material="color: #2a2a2a"></a-cylinder>
      <a-sphere position="-1 2.7 1" radius="0.18" material="color: #2a2a2a"></a-sphere>

      <!-- Shoe display (low shelf) -->
      <a-box position="-2 0.3 1.5" width="2" height="0.6" depth="0.8" material="color: #222"></a-box>
      <a-box position="-2.3 0.65 1.5" width="0.3" height="0.1" depth="0.15" material="color: #c94060"></a-box>
      <a-box position="-1.7 0.65 1.5" width="0.3" height="0.1" depth="0.15" material="color: #1a1a1a"></a-box>

      <!-- Track lighting -->
      <a-cylinder position="0 7.5 0" radius="0.05" height="8" rotation="0 0 90" material="color: #333"></a-cylinder>
      <a-cone position="-2 7.2 -1" radius-bottom="0.15" radius-top="0" height="0.3" rotation="180 0 0" material="color: #333; emissive: #c94060; emissiveIntensity: 0.3"></a-cone>
      <a-cone position="0 7.2 1" radius-bottom="0.15" radius-top="0" height="0.3" rotation="180 0 0" material="color: #333; emissive: #c94060; emissiveIntensity: 0.3"></a-cone>

      <!-- Graffiti art frame on back wall -->
      <a-plane position="0 4.5 -3.85" width="2.5" height="1.8" material="color: #c94060; opacity: 0.15; transparent: true"></a-plane>
      <a-text value="C R" position="0 4.5 -3.82" align="center" color="#c94060" width="5" font="mozillavr" opacity="0.3"></a-text>
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

  // ─── Faithfully Faded Interior ───
  enhanceFaithfullyFaded(scene) {
    const base = '-10 0 -22';
    this.addEntity(scene, base, `
      <!-- Clothing racks (multiple) -->
      <a-entity position="-2 0 -1">
        <a-box position="0 2 0" width="3" height="0.06" depth="0.06" material="color: #555"></a-box>
        <a-box position="-1.5 1 0" width="0.06" height="2" depth="0.06" material="color: #555"></a-box>
        <a-box position="1.5 1 0" width="0.06" height="2" depth="0.06" material="color: #555"></a-box>
        <!-- Hanging items -->
        <a-box position="-0.8 1.6 0" width="0.4" height="0.8" depth="0.05" material="color: #420420; opacity: 0.8"></a-box>
        <a-box position="0 1.6 0" width="0.4" height="0.8" depth="0.05" material="color: #FFADED; opacity: 0.6"></a-box>
        <a-box position="0.8 1.6 0" width="0.4" height="0.8" depth="0.05" material="color: #1a0a10"></a-box>
      </a-entity>

      <!-- Butterfly wall art -->
      <a-text value="🦋" position="0 5 -3.8" align="center" color="#FFADED" width="6" opacity="0.3"></a-text>

      <!-- Neon sign glow -->
      <a-box position="0 5.5 -3.85" width="4" height="0.6" depth="0.05" material="color: #FFADED; emissive: #FFADED; emissiveIntensity: 0.2; opacity: 0.3; transparent: true"></a-box>

      <!-- Counter/checkout -->
      <a-box position="3 0.5 2" width="1.5" height="1" depth="2" material="color: #2a1520; roughness: 0.7"></a-box>
      <a-box position="3 1.1 2" width="0.4" height="0.08" depth="0.3" material="color: #333; metalness: 0.5"></a-box>

      <!-- Full-length mirror -->
      <a-plane position="-4 3 -1" width="1" height="3.5" rotation="0 90 0" material="color: #aab; metalness: 0.95; roughness: 0.05"></a-plane>
      <a-box position="-4.05 3 -1" width="0.05" height="3.7" depth="1.2" material="color: #420420"></a-box>

      <!-- Hat display -->
      <a-cylinder position="2 1 -2" radius="0.4" height="1.2" material="color: #2a1520"></a-cylinder>
      <a-cylinder position="2 1.7 -2" radius="0.2" height="0.3" material="color: #FFADED; opacity: 0.7"></a-cylinder>
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

  // ─── Café Sativa Interior ───
  enhanceCafeSativa(scene) {
    const base = '10 0 -38';
    this.addEntity(scene, base, `
      <!-- Espresso machine on counter -->
      <a-box position="-2 1.3 0.3" width="0.5" height="0.5" depth="0.4" material="color: #444; metalness: 0.6"></a-box>
      <a-cylinder position="-2 1.7 0.3" radius="0.05" height="0.3" material="color: #666; metalness: 0.8"></a-cylinder>

      <!-- Bar stools -->
      <a-entity position="-1 0 1.5">
        <a-cylinder position="0 0.4 0" radius="0.15" height="0.8" material="color: #3a2a1a"></a-cylinder>
        <a-cylinder position="0 0.85 0" radius="0.2" height="0.08" material="color: #5a4a3a; metalness: 0.3"></a-cylinder>
      </a-entity>
      <a-entity position="0 0 1.5">
        <a-cylinder position="0 0.4 0" radius="0.15" height="0.8" material="color: #3a2a1a"></a-cylinder>
        <a-cylinder position="0 0.85 0" radius="0.2" height="0.08" material="color: #5a4a3a; metalness: 0.3"></a-cylinder>
      </a-entity>

      <!-- Menu board -->
      <a-plane position="0 4 -3.85" width="3" height="2" material="color: #1a1410; roughness: 0.9"></a-plane>
      <a-text value="MENU" position="0 4.7 -3.82" align="center" color="#c09060" width="3" font="mozillavr"></a-text>
      <a-text value="Cloud Nine Blend . . . $5\\nGolden Hour Latte . . . $6\\nSativa Sunset Cold Brew . . $7\\nTenerife Espresso . . . . $4" position="0 3.8 -3.82" align="center" color="#e8d8c8" width="2.5" wrap-count="35"></a-text>

      <!-- Shelving with coffee bags -->
      <a-box position="-3 3 -3.5" width="2" height="0.08" depth="0.5" material="color: #4a3a2a"></a-box>
      <a-box position="-3 4 -3.5" width="2" height="0.08" depth="0.5" material="color: #4a3a2a"></a-box>
      <a-box position="-3.3 3.3 -3.4" width="0.3" height="0.4" depth="0.2" material="color: #6a4a2a"></a-box>
      <a-box position="-2.8 3.3 -3.4" width="0.3" height="0.4" depth="0.2" material="color: #8a6a4a"></a-box>
      <a-box position="-3.3 4.3 -3.4" width="0.3" height="0.4" depth="0.2" material="color: #c09060"></a-box>

      <!-- Small cafe table -->
      <a-entity position="2 0 -2">
        <a-cylinder position="0 0.4 0" radius="0.06" height="0.8" material="color: #3a2a1a"></a-cylinder>
        <a-cylinder position="0 0.82 0" radius="0.4" height="0.04" material="color: #5a4a3a; roughness: 0.7"></a-cylinder>
        <a-cylinder position="0.1 0.88 0.05" radius="0.08" height="0.12" material="color: #f0e8d8"></a-cylinder>
      </a-entity>

      <!-- Vinyl record art on wall -->
      <a-cylinder position="3 4 -3.8" radius="0.4" height="0.02" rotation="0 0 0" material="color: #111; metalness: 0.5"></a-cylinder>
      <a-circle position="3 4 -3.78" radius="0.12" material="color: #c09060"></a-circle>
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
