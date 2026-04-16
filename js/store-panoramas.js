/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Store Panorama System v3 (A-Frame)
   
   v3 CORE FIX:
   - Single sphere that FOLLOWS the camera position
   - User is ALWAYS centered inside the sphere (impossible to see edge)
   - Texture swaps based on current zone
   - Primitive store walls hidden when inside a panorama zone
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

const ZONE_ENTITY_MAP = {
  'Concrete Rose':      'zone-concrete-rose',
  'BiJaDi':             'zone-bijadi',
  'Faithfully Faded':   'zone-faithfully-faded',
  'H.O.E.':             'zone-hoe',
  'Wanderlust':         'zone-wanderlust',
  'Cafe Sativa':        'zone-cafe-sativa',
  'The Verse Alkemist': 'zone-verse-alkemist',
};

// Register a component that keeps the sphere following the camera
AFRAME.registerComponent('follow-camera', {
  tick: function() {
    const cam = document.querySelector('[camera]');
    if (!cam) return;
    const camPos = new THREE.Vector3();
    cam.object3D.getWorldPosition(camPos);
    this.el.object3D.position.copy(camPos);
    // Slow rotation for parallax feel
    this.el.object3D.rotation.y += 0.0002;
  }
});

const StorePanoramaSystem = {
  sphere: null,
  material: null,
  textures: {},
  hiddenElements: {},
  _lastZone: null,
  _targetOpacity: 0,
  _currentOpacity: 0,

  init() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    // Pre-load all panorama textures
    const loader = new THREE.TextureLoader();
    Object.entries(STORE_PANORAMAS).forEach(([zoneName, src]) => {
      loader.load(src,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          this.textures[zoneName] = tex;
          console.log('[Panoramas] Loaded: ' + zoneName);
        },
        undefined,
        (err) => console.warn('[Panoramas] Failed: ' + src, err)
      );
    });

    // Create ONE sphere that follows the camera
    const sphere = document.createElement('a-sphere');
    sphere.setAttribute('radius', '20');
    sphere.setAttribute('segments-width', '64');
    sphere.setAttribute('segments-height', '32');
    sphere.setAttribute('position', '0 1.6 14');
    sphere.setAttribute('material', 'side: back; shader: flat; opacity: 0; transparent: true; fog: false');
    sphere.setAttribute('visible', 'false');
    sphere.setAttribute('follow-camera', '');
    sphere.id = 'panorama-sphere';
    // Render LAST so it doesn't write to depth buffer
    sphere.addEventListener('loaded', () => {
      const mesh = sphere.getObject3D('mesh');
      if (mesh) {
        mesh.renderOrder = -1;  // Render first (background)
        mesh.material.depthWrite = false;
        mesh.material.depthTest = false;
        this.material = mesh.material;
      }
    });
    scene.appendChild(sphere);
    this.sphere = sphere;

    // Start update loop
    setInterval(() => this.update(), 200);

    // Also fade on animation frame for smooth opacity
    const fade = () => {
      requestAnimationFrame(fade);
      if (!this.material) return;
      this._currentOpacity += (this._targetOpacity - this._currentOpacity) * 0.08;
      this.material.opacity = this._currentOpacity;
      this.sphere.object3D.visible = this._currentOpacity > 0.01;
    };
    fade();

    console.log('[Panoramas v3] Camera-following sphere initialized');
  },

  hideStoreShell(zoneName) {
    const entityId = ZONE_ENTITY_MAP[zoneName];
    if (!entityId) return;
    const zone = document.getElementById(entityId);
    if (!zone) return;

    this.hiddenElements[zoneName] = [];

    // Hide ALL children of the zone (entire primitive store)
    // but keep the zone itself (for positioning/data-store)
    Array.from(zone.children).forEach(child => {
      const tag = child.tagName.toLowerCase();
      // Hide visual elements but keep triggers
      if (['a-box', 'a-text', 'a-sphere', 'a-cylinder', 'a-plane',
           'a-dodecahedron', 'a-circle', 'a-entity'].includes(tag)) {
        const wasVisible = child.getAttribute('visible') !== 'false' && child.getAttribute('visible') !== false;
        this.hiddenElements[zoneName].push({ el: child, wasVisible });
        child.setAttribute('visible', 'false');
      }
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
      // Restore previous zone
      if (this._lastZone && ZONE_ENTITY_MAP[this._lastZone]) {
        this.restoreStoreShell(this._lastZone);
      }

      this._lastZone = zone;

      // Check if this zone has a panorama
      if (this.textures[zone] && this.material) {
        this.material.map = this.textures[zone];
        this.material.needsUpdate = true;
        this._targetOpacity = 1.0;
        this.hideStoreShell(zone);
        console.log('[Panoramas] Entered: ' + zone);
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
