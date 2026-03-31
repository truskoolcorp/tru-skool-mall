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
      { pos: '2 0 2', rot: '0 200 0', scale: '1 1 1', store: 'entrance', id: 'glb-laviche',
        replaces_ids: ['avatar-laviche', 'laviche-avatar'] },
    ],

    'assets/models/ginger.glb': [
      { pos: '-7 0 -36', rot: '0 60 0', scale: '1 1 1', store: 'wanderlust', id: 'glb-ginger',
        replaces_ids: ['avatar-ginger'] },
    ],

    'assets/models/ahnika.glb': [
      { pos: '-7 0 -20', rot: '0 60 0', scale: '1 1 1', store: 'faithfully-faded', id: 'glb-ahnika',
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

    // Check if this is an avatar model
    var isAvatar = modelFile.indexOf('laviche') !== -1 ||
                   modelFile.indexOf('ginger') !== -1 ||
                   modelFile.indexOf('ahnika') !== -1;

    // Add to scene
    scene.appendChild(entity);

    var self = this;

    // Handle model load events
    entity.addEventListener('model-loaded', function() {
      console.log('[ModelPlacer] Rendered: ' + id + ' at ' + placement.pos);

      var mesh = entity.getObject3D('mesh');
      if (!mesh) return;

      // Fix T-pose for avatar models — rotate arms down
      if (isAvatar) {
        self.fixTPose(mesh, id);
      }

      // Auto-ground: move model so its feet touch the floor
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

      // Remove old placeholder avatars that this GLB replaces
      if (placement.replaces_ids) {
        placement.replaces_ids.forEach(function(oldId) {
          var oldEl = document.getElementById(oldId);
          if (oldEl) {
            oldEl.parentNode.removeChild(oldEl);
            console.log('[ModelPlacer] Removed old placeholder: #' + oldId);
          }
        });
      }
    });

    entity.addEventListener('model-error', function(e) {
      console.warn('[ModelPlacer] Error loading ' + modelFile + ':', e.detail);
    });
  },

  // ─── Fix T-Pose: rotate arms down to natural standing position ───
  fixTPose(mesh, id) {
    var bonesFound = 0;

    mesh.traverse(function(bone) {
      if (!bone.isBone) return;
      var name = bone.name.toLowerCase();

      // Left upper arm — rotate down (positive Z rotation)
      if ((name.indexOf('leftupperarm') !== -1 || name.indexOf('leftshoulder') !== -1 ||
           name.indexOf('left_upper_arm') !== -1 || name.indexOf('l_upperarm') !== -1 ||
           name.indexOf('leftarm') !== -1 || name === 'left arm' ||
           name.indexOf('l_arm') !== -1) && name.indexOf('fore') === -1 && name.indexOf('lower') === -1) {
        bone.rotation.z += 1.2; // ~70 degrees down
        bonesFound++;
      }

      // Right upper arm — rotate down (negative Z rotation)
      if ((name.indexOf('rightupperarm') !== -1 || name.indexOf('rightshoulder') !== -1 ||
           name.indexOf('right_upper_arm') !== -1 || name.indexOf('r_upperarm') !== -1 ||
           name.indexOf('rightarm') !== -1 || name === 'right arm' ||
           name.indexOf('r_arm') !== -1) && name.indexOf('fore') === -1 && name.indexOf('lower') === -1) {
        bone.rotation.z -= 1.2; // ~70 degrees down
        bonesFound++;
      }
    });

    if (bonesFound > 0) {
      console.log('[ModelPlacer] Fixed T-pose for ' + id + ' (' + bonesFound + ' bones adjusted)');
    } else {
      // If no standard bone names found, try to find ANY arm-like bones
      var allBones = [];
      mesh.traverse(function(bone) {
        if (bone.isBone) allBones.push(bone.name);
      });
      console.log('[ModelPlacer] No arm bones found for ' + id + '. Skeleton bones: ' + allBones.slice(0, 15).join(', '));
    }
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
