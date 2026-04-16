/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Store Panorama System v6 (A-Frame)
   
   v6 FIX: When entering a panorama zone, hide EVERYTHING in
   the mall scene except: lights, camera rig, avatars, the
   panorama sphere, and the current store's detailed props.
   
   Before v6: Only hid the current zone's primitive walls, so
   other stores' signs/logos leaked through the panorama.
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

const PANORAMA_ZONES = [
  { label: 'Concrete Rose',      x: -8,  z: -8,  w: 4,  d: 6 },
  { label: 'BiJaDi',             x: 8,   z: -8,  w: 4,  d: 6 },
  { label: 'Faithfully Faded',   x: -8,  z: -22, w: 4,  d: 6 },
  { label: 'H.O.E.',             x: 8,   z: -22, w: 4,  d: 6 },
  { label: 'Wanderlust',         x: -8,  z: -38, w: 4,  d: 6 },
  { label: 'Cafe Sativa',        x: 8,   z: -38, w: 4,  d: 6 },
  { label: 'The Verse Alkemist', x: 0,   z: -58, w: 10, d: 8 },
];

// Map each panorama zone to the detailed 3D content that should stay visible
// (currently only Verse Alkemist has detailed 3D studio props)
const ZONE_KEEP_IDS = {
  'The Verse Alkemist': ['va-detailed-studio'],
};

// ALWAYS kept visible (regardless of zone)
const ALWAYS_KEEP_IDS = new Set([
  'camera-rig',
  'panorama-sphere',
  'glb-laviche', 'glb-ginger', 'glb-ahnika',
]);

// Follow-camera component
if (typeof AFRAME !== 'undefined' && !AFRAME.components['follow-camera']) {
  AFRAME.registerComponent('follow-camera', {
    tick: function() {
      const cam = document.querySelector('[camera]');
      if (!cam) return;
      const camPos = new THREE.Vector3();
      cam.object3D.getWorldPosition(camPos);
      this.el.object3D.position.copy(camPos);
      this.el.object3D.rotation.y += 0.0002;
    }
  });
}

const StorePanoramaSystem = {
  sphere: null,
  material: null,
  textures: {},
  hiddenElements: [],
  _lastZoneLabel: null,
  _targetOpacity: 0,
  _currentOpacity: 0,

  init() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    const loader = new THREE.TextureLoader();
    Object.entries(STORE_PANORAMAS).forEach(([label, src]) => {
      loader.load(src,
        (tex) => {
          if (THREE.SRGBColorSpace !== undefined) {
            tex.colorSpace = THREE.SRGBColorSpace;
          }
          this.textures[label] = tex;
          console.log('[Panoramas v6] Loaded: ' + label);
        },
        undefined,
        (err) => console.warn('[Panoramas] Failed: ' + src, err)
      );
    });

    const sphere = document.createElement('a-sphere');
    sphere.setAttribute('radius', '20');
    sphere.setAttribute('segments-width', '64');
    sphere.setAttribute('segments-height', '32');
    sphere.setAttribute('position', '0 1.6 14');
    sphere.setAttribute('material', 'side: back; shader: flat; opacity: 0; transparent: true; fog: false');
    sphere.setAttribute('visible', 'false');
    sphere.setAttribute('follow-camera', '');
    sphere.id = 'panorama-sphere';
    sphere.addEventListener('loaded', () => {
      const mesh = sphere.getObject3D('mesh');
      if (mesh) {
        mesh.renderOrder = -1;
        mesh.material.depthWrite = false;
        mesh.material.depthTest = false;
        this.material = mesh.material;
      }
    });
    scene.appendChild(sphere);
    this.sphere = sphere;

    setInterval(() => this.update(), 200);

    const fade = () => {
      requestAnimationFrame(fade);
      if (!this.material) return;
      this._currentOpacity += (this._targetOpacity - this._currentOpacity) * 0.15;
      this.material.opacity = this._currentOpacity;
      this.sphere.object3D.visible = this._currentOpacity > 0.02;
    };
    fade();

    console.log('[Panoramas v6] Initialized — aggressive scene hiding');
  },

  detectZone() {
    const rig = document.getElementById('camera-rig');
    if (!rig) return null;
    const pos = rig.getAttribute('position');
    const px = pos.x, pz = pos.z;

    for (const zone of PANORAMA_ZONES) {
      const halfW = zone.w / 2;
      const halfD = zone.d / 2;
      if (px >= zone.x - halfW && px <= zone.x + halfW &&
          pz >= zone.z - halfD && pz <= zone.z + halfD) {
        return zone;
      }
    }
    return null;
  },

  // Hide ALL scene geometry except the essential stuff
  hideAllScenery(currentZoneLabel) {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    const keepIds = new Set(ALWAYS_KEEP_IDS);
    // Add zone-specific keep items (e.g., va-detailed-studio for Verse Alkemist)
    const extra = ZONE_KEEP_IDS[currentZoneLabel] || [];
    extra.forEach(id => keepIds.add(id));

    this.hiddenElements = [];

    Array.from(scene.children).forEach(child => {
      const tag = (child.tagName || '').toLowerCase();

      // Never touch these
      if (tag === 'a-assets') return;
      if (keepIds.has(child.id)) return;
      // Keep anything with a light component
      if (child.getAttribute && child.getAttribute('light') !== null) return;

      // Hide if currently visible
      const currentVis = child.getAttribute('visible');
      const wasVisible = currentVis !== 'false' && currentVis !== false;
      if (wasVisible) {
        this.hiddenElements.push({ el: child, wasVisible });
        child.setAttribute('visible', 'false');
      }
    });

    console.log('[Panoramas v6] Hidden ' + this.hiddenElements.length + ' scene elements');
  },

  restoreAllScenery() {
    this.hiddenElements.forEach(item => {
      if (item.wasVisible) {
        item.el.setAttribute('visible', 'true');
      }
    });
    this.hiddenElements = [];
  },

  update() {
    const zone = this.detectZone();
    const currentLabel = zone ? zone.label : null;

    if (currentLabel !== this._lastZoneLabel) {
      console.log('[Panoramas v6] Zone change: "' + (this._lastZoneLabel || 'corridor') +
                  '" → "' + (currentLabel || 'corridor') + '"');

      // Always restore scenery first
      this.restoreAllScenery();

      this._lastZoneLabel = currentLabel;

      if (currentLabel && this.textures[currentLabel] && this.material) {
        // Entering panorama zone: swap texture, fade in, hide scenery
        this.material.map = this.textures[currentLabel];
        this.material.needsUpdate = true;
        this._targetOpacity = 1.0;
        // Short delay so fade-in starts before hiding (smoother transition)
        setTimeout(() => this.hideAllScenery(currentLabel), 50);
      } else {
        this._targetOpacity = 0;
      }
    }
  },
};

document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  if (scene) {
    const go = () => setTimeout(() => StorePanoramaSystem.init(), 2000);
    if (scene.hasLoaded) go();
    else scene.addEventListener('loaded', go);
  }
});

window.StorePanoramaSystem = StorePanoramaSystem;
