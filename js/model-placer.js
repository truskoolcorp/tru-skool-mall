/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — 3D Model Placer
   Checks for downloaded GLTF models and places them in stores.
   Falls back to primitive geometry if models aren't found.
   ═══════════════════════════════════════════════════════════ */

const ModelPlacer = {

  // Each entry: model file → array of placements
  // When a model file is found, all placements are created
  placements: {

    // ─── CLOTHING RACKS ───
    'assets/models/clothing-rack.glb': [
      // Concrete Rose — two racks
      { pos: '-12 0 -7',   rot: '0 90 0', scale: '1.2 1.2 1.2', store: 'concrete-rose' },
      { pos: '-12 0 -9.5', rot: '0 90 0', scale: '1.2 1.2 1.2', store: 'concrete-rose' },
      // Faithfully Faded
      { pos: '-12 0 -21',  rot: '0 90 0', scale: '1.2 1.2 1.2', store: 'faithfully-faded' },
      { pos: '-12 0 -23',  rot: '0 90 0', scale: '1.2 1.2 1.2', store: 'faithfully-faded' },
      // H.O.E.
      { pos: '12 0 -21',   rot: '0 -90 0', scale: '1.2 1.2 1.2', store: 'hoe' },
      { pos: '12 0 -23',   rot: '0 -90 0', scale: '1.2 1.2 1.2', store: 'hoe' },
      // Wanderlust
      { pos: '-12 0 -37',  rot: '0 90 0', scale: '1.2 1.2 1.2', store: 'wanderlust' },
    ],

    'assets/models/clothing-rack-round.glb': [
      // Center of clothing stores
      { pos: '-9 0 -8',    rot: '0 0 0', scale: '1 1 1', store: 'concrete-rose' },
      { pos: '-9 0 -22',   rot: '0 0 0', scale: '1 1 1', store: 'faithfully-faded' },
      { pos: '9 0 -22',    rot: '0 0 0', scale: '1 1 1', store: 'hoe' },
    ],

    // ─── MANNEQUINS ───
    'assets/models/mannequin.glb': [
      // Concrete Rose entrance display
      { pos: '-7.5 0 -6',  rot: '0 60 0', scale: '1 1 1', store: 'concrete-rose' },
      // BiJaDi entrance
      { pos: '7.5 0 -6',   rot: '0 -60 0', scale: '1 1 1', store: 'bijadi' },
    ],

    'assets/models/mannequin-female.glb': [
      // Faithfully Faded — two female mannequins
      { pos: '-7.5 0 -20.5', rot: '0 45 0', scale: '1 1 1', store: 'faithfully-faded' },
      { pos: '-8.5 0 -23',   rot: '0 -30 0', scale: '1 1 1', store: 'faithfully-faded' },
      // BiJaDi
      { pos: '8.5 0 -9',     rot: '0 -45 0', scale: '1 1 1', store: 'bijadi' },
    ],

    'assets/models/mannequin-male.glb': [
      // Concrete Rose
      { pos: '-8.5 0 -9.5',  rot: '0 -20 0', scale: '1 1 1', store: 'concrete-rose' },
      // H.O.E.
      { pos: '7.5 0 -20.5',  rot: '0 -60 0', scale: '1 1 1', store: 'hoe' },
    ],

    // ─── DISPLAY CASES ───
    'assets/models/display-case.glb': [
      // BiJaDi — jewelry display
      { pos: '9 0 -7',      rot: '0 -90 0', scale: '1 1 1', store: 'bijadi' },
      { pos: '9 0 -9.5',    rot: '0 -90 0', scale: '1 1 1', store: 'bijadi' },
      // H.O.E. — chain/accessories display
      { pos: '9.5 0 -23.5', rot: '0 -90 0', scale: '1 1 1', store: 'hoe' },
      // Verse Alkemist — merch display
      { pos: '1 0 -57',     rot: '0 0 0',   scale: '1 1 1', store: 'verse-alkemist' },
    ],

    // ─── CAFE SATIVA ───
    'assets/models/store-cafe.glb': [
      // Full cafe scene — replaces all primitive geometry
      { pos: '10 0 -38', rot: '0 -90 0', scale: '1 1 1', store: 'cafe-sativa', replaces: true },
    ],

    'assets/models/cafe-assets.glb': [
      { pos: '10 0 -38', rot: '0 -90 0', scale: '1 1 1', store: 'cafe-sativa' },
    ],

    'assets/models/coffee-machine.glb': [
      { pos: '12 1 -37', rot: '0 -90 0', scale: '0.8 0.8 0.8', store: 'cafe-sativa' },
    ],

    'assets/models/cafe-table.glb': [
      { pos: '8 0 -36.5',  rot: '0 0 0',  scale: '1 1 1', store: 'cafe-sativa' },
      { pos: '8 0 -39.5',  rot: '0 45 0', scale: '1 1 1', store: 'cafe-sativa' },
    ],

    // ─── THE VERSE ALKEMIST ───
    'assets/models/turntable.glb': [
      { pos: '0 1 -59',  rot: '0 180 0', scale: '1.5 1.5 1.5', store: 'verse-alkemist' },
    ],

    'assets/models/speaker.glb': [
      { pos: '-2 0 -59',  rot: '0 160 0', scale: '1 1 1', store: 'verse-alkemist' },
      { pos: '2 0 -59',   rot: '0 -160 0', scale: '1 1 1', store: 'verse-alkemist' },
    ],

    'assets/models/microphone.glb': [
      { pos: '0 0 -57.5', rot: '0 180 0', scale: '1.2 1.2 1.2', store: 'verse-alkemist' },
    ],

    // ─── WANDERLUST ───
    'assets/models/globe.glb': [
      { pos: '-9 1.5 -38', rot: '0 0 0', scale: '2 2 2', store: 'wanderlust' },
    ],

    'assets/models/backpack.glb': [
      { pos: '-11 1 -36',  rot: '0 45 0', scale: '1.5 1.5 1.5', store: 'wanderlust' },
      { pos: '-11 1 -40',  rot: '0 -30 0', scale: '1.5 1.5 1.5', store: 'wanderlust' },
    ],

    'assets/models/suitcase.glb': [
      { pos: '-8 0 -36',  rot: '0 15 0', scale: '1.2 1.2 1.2', store: 'wanderlust' },
    ],

    // ─── CHARACTER AVATARS (FBX preferred for Mixamo animations, GLB fallback) ───
    'assets/models/laviche.fbx': [
      { pos: '2 0 4', rot: '0 200 0', scale: '1 1 1', store: 'entrance', id: 'fbx-laviche',
        replaces_ids: ['avatar-laviche', 'laviche-avatar', 'glb-laviche'], format: 'fbx' },
    ],
    'assets/models/laviche.glb': [
      { pos: '2 0 4', rot: '0 200 0', scale: '1 1 1', store: 'entrance', id: 'glb-laviche',
        replaces_ids: ['avatar-laviche', 'laviche-avatar'] },
    ],

    'assets/models/ginger.fbx': [
      { pos: '-8 0 -36', rot: '0 90 0', scale: '1 1 1', store: 'wanderlust', id: 'fbx-ginger',
        replaces_ids: ['avatar-ginger', 'glb-ginger'], format: 'fbx' },
    ],
    'assets/models/ginger.glb': [
      { pos: '-8 0 -36', rot: '0 90 0', scale: '1 1 1', store: 'wanderlust', id: 'glb-ginger',
        replaces_ids: ['avatar-ginger'] },
    ],

    'assets/models/ahnika.fbx': [
      { pos: '-9 0 -20', rot: '0 90 0', scale: '1 1 1', store: 'faithfully-faded', id: 'fbx-ahnika',
        replaces_ids: ['avatar-ahnika', 'glb-ahnika'], format: 'fbx' },
    ],
    'assets/models/ahnika.glb': [
      { pos: '-9 0 -20', rot: '0 90 0', scale: '1 1 1', store: 'faithfully-faded', id: 'glb-ahnika',
        replaces_ids: ['avatar-ahnika'] },
    ],

    // ─── MALL CORRIDOR (full replacement) ───
    'assets/models/mall-corridor.glb': [
      { pos: '0 0 -30', rot: '0 0 0', scale: '1 1 1', store: 'corridor', replaces: true },
    ],
  },

  // ─── Track which models loaded ───
  _loaded: {},
  _checked: 0,
  _total: 0,

  // ─── Initialize ───
  init() {
    var self = this;
    var scene = document.querySelector('a-scene');
    if (!scene) return;

    var modelFiles = Object.keys(this.placements);
    this._total = modelFiles.length;

    console.log('[ModelPlacer] Checking for ' + modelFiles.length + ' model files...');

    // Check each model file and load if found
    modelFiles.forEach(function(modelFile) {
      self.checkAndLoad(scene, modelFile);
    });
  },

  // ─── Check if a model file exists, then place all instances ───
  checkAndLoad(scene, modelFile) {
    var self = this;

    fetch(modelFile, { method: 'HEAD' })
      .then(function(response) {
        self._checked++;

        if (response.ok) {
          // If this is an FBX avatar, mark the GLB version to skip
          var glbEquiv = modelFile.replace('.fbx', '.glb');
          if (modelFile.endsWith('.fbx') && self.placements[glbEquiv]) {
            self._skipFiles = self._skipFiles || {};
            self._skipFiles[glbEquiv] = true;
            console.log('[ModelPlacer] FBX found — will skip GLB: ' + glbEquiv);
          }

          // Skip if this GLB was superseded by an FBX
          if (self._skipFiles && self._skipFiles[modelFile]) {
            console.log('[ModelPlacer] Skipping (FBX takes priority): ' + modelFile);
            return;
          }

          self._loaded[modelFile] = true;
          var placements = self.placements[modelFile];
          console.log('[ModelPlacer] Found: ' + modelFile + ' (' + placements.length + ' placements)');

          placements.forEach(function(placement, i) {
            self.placeModel(scene, modelFile, placement, i);
          });
        } else {
          console.log('[ModelPlacer] Not found: ' + modelFile + ' (using primitives)');
        }

        // Summary when all checked
        if (self._checked >= self._total) {
          var loadedCount = Object.keys(self._loaded).length;
          console.log('[ModelPlacer] Done: ' + loadedCount + '/' + self._total + ' model files loaded');
        }
      })
      .catch(function() {
        self._checked++;
      });
  },

  // ─── Place a single model instance ───
  placeModel(scene, modelFile, placement, index) {
    var entity = document.createElement('a-entity');

    entity.setAttribute('position', placement.pos);
    if (placement.rot) entity.setAttribute('rotation', placement.rot);
    if (placement.scale) entity.setAttribute('scale', placement.scale);

    // Load GLTF/GLB model
    entity.setAttribute('gltf-model', modelFile);

    var id = placement.id || ('model-' + modelFile.split('/').pop().replace('.glb', '') + '-' + index);
    entity.setAttribute('id', id);
    entity.setAttribute('shadow', 'cast: true; receive: true');

    // Check if this is an avatar model
    var isAvatar = modelFile.indexOf('laviche') !== -1 ||
                   modelFile.indexOf('ginger') !== -1 ||
                   modelFile.indexOf('ahnika') !== -1;

    // Enable animation playback for avatars (uses aframe-extras animation-mixer)
    if (isAvatar) {
      entity.setAttribute('animation-mixer', 'loop: repeat; timeScale: 1');
    }

    scene.appendChild(entity);

    entity.addEventListener('model-loaded', function() {
      console.log('[ModelPlacer] Rendered: ' + id + ' at ' + placement.pos);

      var mesh = entity.getObject3D('mesh');
      if (!mesh) return;

      if (isAvatar) {
        // Simple fix: FBX→GLB applies 100x scale to the mesh node.
        // Counter it with 0.01 entity scale. Mixamo origin = feet = y:0.
        entity.setAttribute('scale', '0.01 0.01 0.01');
        entity.setAttribute('position', {
          x: entity.getAttribute('position').x,
          y: 0,
          z: entity.getAttribute('position').z
        });

        // Fix shiny/metallic skin: override all materials to non-metallic
        mesh.traverse(function(child) {
          if (child.isMesh && child.material) {
            var mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(function(mat) {
              mat.metalness = 0.0;
              mat.roughness = 0.7;
              mat.needsUpdate = true;
            });
          }
        });

        var boneCount = 0;
        mesh.traverse(function(n) { if (n.isBone) boneCount++; });
        console.log('[ModelPlacer] Avatar ' + id + ': scale=0.01, y=0, ' + boneCount + ' bones, metalness→0');
      } else {
        // Non-avatar: standard auto-ground
        var box = new THREE.Box3().setFromObject(mesh);
        var yOffset = -box.min.y;
        if (Math.abs(yOffset) > 0.01) {
          var pos = entity.getAttribute('position');
          entity.setAttribute('position', {
            x: pos.x,
            y: pos.y + yOffset,
            z: pos.z
          });
          console.log('[ModelPlacer] Auto-grounded ' + id + ' (offset: ' + yOffset.toFixed(2) + ')');
        }
      }

      // Remove old placeholders
      if (placement.replaces_ids) {
        placement.replaces_ids.forEach(function(oldId) {
          var oldEl = document.getElementById(oldId);
          if (oldEl) {
            oldEl.parentNode.removeChild(oldEl);
            console.log('[ModelPlacer] Removed placeholder: #' + oldId);
          }
        });
      }
    });

    entity.addEventListener('model-error', function(e) {
      console.warn('[ModelPlacer] Error loading ' + modelFile + ':', e.detail);
    });
  },
};

// Auto-init when scene loads
document.addEventListener('DOMContentLoaded', function() {
  var scene = document.querySelector('a-scene');
  if (scene) {
    // Wait a bit for other systems to initialize first
    var start = function() {
      setTimeout(function() { ModelPlacer.init(); }, 1500);
    };
    if (scene.hasLoaded) start();
    else scene.addEventListener('loaded', start);
  }
});

window.ModelPlacer = ModelPlacer;
console.log('%c[Tru Skool Mall] Model Placer loaded — drop .glb files in assets/models/', 'color: #60c890');
