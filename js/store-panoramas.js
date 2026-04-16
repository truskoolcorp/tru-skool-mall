/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Store Panorama System v2 (A-Frame)
   
   v2 FIXES:
   - Sphere centered on ZONE TRIGGER (where user stands)
   - Larger radius so user is comfortably inside
   - Hides primitive store shell/walls when panorama active
   - Keeps interactive items (avatars, clickable props) visible
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

// Zone trigger centers (where USER stands when in zone)
const ZONE_CENTERS = {
  'Concrete Rose':      { x: -7,  y: 1.6, z: -8,  radius: 10 },
  'BiJaDi':             { x: 7,   y: 1.6, z: -8,  radius: 10 },
  'Faithfully Faded':   { x: -7,  y: 1.6, z: -22, radius: 10 },
  'H.O.E.':             { x: 7,   y: 1.6, z: -22, radius: 10 },
  'Wanderlust':         { x: -7,  y: 1.6, z: -38, radius: 10 },
  'Cafe Sativa':        { x: 7,   y: 1.6, z: -38, radius: 10 },
  'The Verse Alkemist': { x: 0,   y: 1.6, z: -58, radius: 14 },
};

const ZONE_ENTITY_MAP = {
  'Concrete Rose':      'zone-concrete-rose',
  'BiJaDi':             'zone-bijadi',
  'Faithfully Faded':   'zone-faithfully-faded',
  'H.O.E.':             'zone-hoe',
  'Wanderlust':         'zone-wanderlust',
  'Cafe Sativa':        'zone-cafe-sativa',
  'The Verse Alkemist': 'zone-verse-alkemist',
};

const StorePanoramaSystem = {
  spheres: {},
  hiddenElements: {},
  _lastZone: null,

  init() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    Object.keys(STORE_PANORAMAS).forEach(zoneName => {
      const src = STORE_PANORAMAS[zoneName];
      const center = ZONE_CENTERS[zoneName];
      if (!center) return;

      const sphere = document.createElement('a-sphere');
      sphere.setAttribute('radius', center.radius);
      sphere.setAttribute('position', `${center.x} ${center.y} ${center.z}`);
      sphere.setAttribute('segments-width', '64');
      sphere.setAttribute('segments-height', '32');
      sphere.setAttribute('material', `src: ${src}; side: back; shader: flat; opacity: 0; transparent: true; fog: false`);
      sphere.setAttribute('visible', 'false');
      sphere.classList.add('panorama-sphere');

      scene.appendChild(sphere);
      this.spheres[zoneName] = sphere;
    });

    setInterval(() => this.update(), 300);
    console.log('[Panoramas v2] Loaded ' + Object.keys(this.spheres).length + ' store panoramas');
  },

  hideStoreShell(zoneName) {
    const entityId = ZONE_ENTITY_MAP[zoneName];
    if (!entityId) return;
    const zone = document.getElementById(entityId);
    if (!zone) return;

    if (!this.hiddenElements[zoneName]) this.hiddenElements[zoneName] = [];

    // Hide large structural boxes (walls/shell)
    const boxes = zone.querySelectorAll('a-box');
    boxes.forEach(box => {
      const width = parseFloat(box.getAttribute('width') || '0');
      const height = parseFloat(box.getAttribute('height') || '0');
      const depth = parseFloat(box.getAttribute('depth') || '0');
      // Only hide big structural elements (walls, shell)
      if (width >= 6 || height >= 6 || depth >= 6) {
        this.hiddenElements[zoneName].push({
          el: box,
          wasVisible: box.getAttribute('visible') !== 'false' && box.getAttribute('visible') !== false
        });
        box.setAttribute('visible', 'false');
      }
    });

    // Hide text labels on walls (storefront signage)
    const texts = zone.querySelectorAll('a-text');
    texts.forEach(t => {
      this.hiddenElements[zoneName].push({
        el: t,
        wasVisible: t.getAttribute('visible') !== 'false' && t.getAttribute('visible') !== false
      });
      t.setAttribute('visible', 'false');
    });

    // Hide the zone-specific point light (panorama provides its own lighting feel)
    const lights = zone.querySelectorAll('a-entity[light]');
    lights.forEach(l => {
      this.hiddenElements[zoneName].push({
        el: l,
        wasVisible: l.getAttribute('visible') !== 'false' && l.getAttribute('visible') !== false
      });
      l.setAttribute('visible', 'false');
    });
  },

  restoreStoreShell(zoneName) {
    const items = this.hiddenElements[zoneName];
    if (!items) return;
    items.forEach(item => {
      if (item.wasVisible) {
        item.el.setAttribute('visible', 'true');
      }
    });
    delete this.hiddenElements[zoneName];
  },

  update() {
    const zone = (window.MallState && MallState.currentZone) || '';

    if (zone !== this._lastZone) {
      if (this._lastZone && ZONE_ENTITY_MAP[this._lastZone]) {
        this.restoreStoreShell(this._lastZone);
      }

      this._lastZone = zone;

      Object.keys(this.spheres).forEach(name => {
        const sphere = this.spheres[name];
        if (name === zone) {
          sphere.setAttribute('visible', 'true');
          sphere.setAttribute('material', 'opacity', 1.0);
          this.hideStoreShell(name);
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
        console.log('[Panoramas] Entered: ' + zone);
      }
    }

    // Slow rotation on active panorama
    Object.keys(this.spheres).forEach(name => {
      const sphere = this.spheres[name];
      const visible = sphere.getAttribute('visible');
      if (visible === 'true' || visible === true) {
        sphere.object3D.rotation.y += 0.0002;
      }
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  if (scene) {
    const go = () => setTimeout(() => StorePanoramaSystem.init(), 3000);
    if (scene.hasLoaded) go();
    else scene.addEventListener('loaded', go);
  }
});

window.StorePanoramaSystem = StorePanoramaSystem;
