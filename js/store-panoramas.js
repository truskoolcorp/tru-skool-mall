/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Store Panorama System (A-Frame)
   Shows immersive 360° panoramas inside store zones.
   
   Panorama images go in: panoramas/ folder
   Generated via OpenArt Worlds.
   ═══════════════════════════════════════════════════════════ */

const STORE_PANORAMAS = {
  'Concrete Rose':      'panoramas/concrete-rose.jpg',
  'BiJaDi':             'panoramas/bijadi.jpg',
  'Faithfully Faded':   'panoramas/faithfully-faded.jpg',
  'H.O.E.':             'panoramas/hoe.jpg',
  'Wanderlust':         'panoramas/wanderlust.jpg',
  'Cafe Sativa':        'panoramas/cafe-sativa.jpg',
  'The Verse Alkemist': 'panoramas/verse-alkemist.jpg',
};

// Store zone centers (must match zone-trigger positions in index.html)
const ZONE_CENTERS = {
  'Concrete Rose':      { x: -10, y: 5, z: -8 },
  'BiJaDi':             { x: 10,  y: 5, z: -8 },
  'Faithfully Faded':   { x: -10, y: 5, z: -22 },
  'H.O.E.':             { x: 10,  y: 5, z: -22 },
  'Wanderlust':         { x: -10, y: 5, z: -38 },
  'Cafe Sativa':        { x: 10,  y: 5, z: -38 },
  'The Verse Alkemist': { x: 0,   y: 5, z: -58 },
};

const StorePanoramaSystem = {
  spheres: {},
  currentZone: null,
  _lastZone: null,

  init() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    Object.keys(STORE_PANORAMAS).forEach(zoneName => {
      const src = STORE_PANORAMAS[zoneName];
      const center = ZONE_CENTERS[zoneName];
      if (!center) return;

      const sphere = document.createElement('a-sphere');
      sphere.setAttribute('radius', '8');
      sphere.setAttribute('position', `${center.x} ${center.y} ${center.z}`);
      sphere.setAttribute('material', `src: ${src}; side: back; shader: flat; opacity: 0; transparent: true`);
      sphere.setAttribute('visible', 'false');
      sphere.classList.add('panorama-sphere');

      scene.appendChild(sphere);
      this.spheres[zoneName] = sphere;
    });

    // Poll for zone changes (MallState.currentZone is set by mall-core.js)
    setInterval(() => this.update(), 400);

    console.log('[Panoramas] Loaded ' + Object.keys(this.spheres).length + ' store panoramas');
  },

  update() {
    const zone = (window.MallState && MallState.currentZone) || '';

    if (zone !== this._lastZone) {
      this._lastZone = zone;

      // Fade out all panoramas
      Object.keys(this.spheres).forEach(name => {
        const sphere = this.spheres[name];
        if (name === zone) {
          sphere.setAttribute('visible', 'true');
          sphere.setAttribute('material', 'opacity', 0.85);
        } else {
          sphere.setAttribute('material', 'opacity', 0);
          setTimeout(() => {
            if (this._lastZone !== name) {
              sphere.setAttribute('visible', 'false');
            }
          }, 500);
        }
      });

      if (zone && this.spheres[zone]) {
        console.log('[Panoramas] Showing: ' + zone);
      }
    }

    // Slow rotation on active panorama
    Object.keys(this.spheres).forEach(name => {
      const sphere = this.spheres[name];
      if (sphere.getAttribute('visible') === 'true' || sphere.getAttribute('visible') === true) {
        const rot = sphere.object3D.rotation;
        rot.y += 0.0003;
      }
    });
  },
};

// Auto-init after scene loads
document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  if (scene) {
    const go = () => setTimeout(() => StorePanoramaSystem.init(), 3000);
    if (scene.hasLoaded) go();
    else scene.addEventListener('loaded', go);
  }
});

window.StorePanoramaSystem = StorePanoramaSystem;
