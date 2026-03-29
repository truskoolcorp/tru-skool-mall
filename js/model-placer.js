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

    // ─── CHARACTER AVATARS ───
    'assets/models/laviche.glb': [
      { pos: '0 0 2', rot: '0 180 0', scale: '1 1 1', store: 'entrance', id: 'avatar-laviche' },
    ],

    'assets/models/ginger.glb': [
      { pos: '-7 0 -36', rot: '0 60 0', scale: '1 1 1', store: 'wanderlust', id: 'avatar-ginger' },
    ],

    'assets/models/ahnika.glb': [
      { pos: '-7 0 -20', rot: '0 60 0', scale: '1 1 1', store: 'faithfully-faded', id: 'avatar-ahnika' },
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

    // Set position, rotation, scale
    entity.setAttribute('position', placement.pos);
    if (placement.rot) entity.setAttribute('rotation', placement.rot);
    if (placement.scale) entity.setAttribute('scale', placement.scale);

    // Load the GLTF model
    entity.setAttribute('gltf-model', modelFile);

    // Set an ID for reference
    var id = placement.id || ('model-' + modelFile.split('/').pop().replace('.glb', '') + '-' + index);
    entity.setAttribute('id', id);

    // Add shadow
    entity.setAttribute('shadow', 'cast: true; receive: true');

    // Add to scene
    scene.appendChild(entity);

    // Handle model load events
    entity.addEventListener('model-loaded', function() {
      console.log('[ModelPlacer] Rendered: ' + id + ' at ' + placement.pos);

      // Auto-center on ground if model is floating
      // (Some Sketchfab models have origin at center instead of bottom)
      // Uncomment below to auto-fix:
      // var mesh = entity.getObject3D('mesh');
      // if (mesh) {
      //   var box = new THREE.Box3().setFromObject(mesh);
      //   var yOffset = -box.min.y;
      //   var pos = entity.getAttribute('position');
      //   entity.setAttribute('position', pos.x + ' ' + (pos.y + yOffset) + ' ' + pos.z);
      // }
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
