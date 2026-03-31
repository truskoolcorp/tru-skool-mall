/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Model Placer v3 (Clean)
   ═══════════════════════════════════════════════════════════ */

var ModelPlacer = {

  avatars: {
    'assets/models/laviche.glb': { pos: '2 0 2', rot: '0 200 0', id: 'glb-laviche', removes: ['avatar-laviche', 'laviche-avatar'] },
    'assets/models/ginger.glb':  { pos: '-7 0 -36', rot: '0 60 0', id: 'glb-ginger', removes: ['avatar-ginger'] },
    'assets/models/ahnika.glb':  { pos: '-7 0 -20', rot: '0 60 0', id: 'glb-ahnika', removes: ['avatar-ahnika'] },
  },

  furniture: {
    'assets/models/clothing-rack.glb': [
      { pos: '-12 0 -7', rot: '0 90 0', s: '1.2 1.2 1.2' },
      { pos: '-12 0 -21', rot: '0 90 0', s: '1.2 1.2 1.2' },
      { pos: '12 0 -21', rot: '0 -90 0', s: '1.2 1.2 1.2' }
    ],
    'assets/models/mannequin.glb':    [{ pos: '-7.5 0 -6', rot: '0 60 0' }, { pos: '7.5 0 -6', rot: '0 -60 0' }],
    'assets/models/display-case.glb': [{ pos: '9 0 -7', rot: '0 -90 0' }, { pos: '1 0 -57' }],
    'assets/models/turntable.glb':    [{ pos: '0 1 -59', rot: '0 180 0', s: '1.5 1.5 1.5' }],
    'assets/models/globe.glb':        [{ pos: '-9 1.5 -38', s: '2 2 2' }],
  },

  init: function() {
    var scene = document.querySelector('a-scene');
    if (!scene) return;
    var self = this;

    Object.keys(this.avatars).forEach(function(file) {
      self.tryLoadAvatar(scene, file);
    });
    Object.keys(this.furniture).forEach(function(file) {
      self.tryLoadFurniture(scene, file);
    });

    console.log('[ModelPlacer] Checking for models...');
  },

  tryLoadAvatar: function(scene, file) {
    var self = this;
    fetch(file, { method: 'HEAD' }).then(function(r) {
      if (!r.ok) return;
      var cfg = self.avatars[file];

      var el = document.createElement('a-entity');
      el.setAttribute('id', cfg.id);
      el.setAttribute('gltf-model', file);
      el.setAttribute('position', cfg.pos);
      el.setAttribute('rotation', cfg.rot || '0 0 0');
      // DO NOT set scale here — set it after model loads to avoid frustum culling
      el.setAttribute('animation-mixer', 'loop: repeat; timeScale: 1');
      scene.appendChild(el);

      el.addEventListener('model-loaded', function() {
        var mesh = el.getObject3D('mesh');
        if (!mesh) return;

        // Find and fix the 100x FBX scale on the mesh node
        mesh.traverse(function(node) {
          if (node.scale && node.scale.x > 10) {
            node.scale.set(1, 1, 1);
            node.updateMatrixWorld(true);
          }
        });

        // Fix metallic skin
        mesh.traverse(function(child) {
          if (child.isMesh && child.material) {
            var mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(function(m) {
              m.metalness = 0.0;
              m.roughness = 0.7;
              m.needsUpdate = true;
            });
          }
        });

        // Remove old placeholders
        if (cfg.removes) {
          cfg.removes.forEach(function(oldId) {
            var old = document.getElementById(oldId);
            if (old && old.parentNode) old.parentNode.removeChild(old);
          });
        }

        console.log('[ModelPlacer] Avatar: ' + cfg.id + ' loaded, scale fixed, metalness→0');
      });

      el.addEventListener('model-error', function(e) {
        console.warn('[ModelPlacer] Avatar error ' + cfg.id + ':', e.detail);
      });
    }).catch(function() {});
  },

  tryLoadFurniture: function(scene, file) {
    fetch(file, { method: 'HEAD' }).then(function(r) {
      if (!r.ok) return;
      var placements = ModelPlacer.furniture[file];
      placements.forEach(function(p, i) {
        var el = document.createElement('a-entity');
        el.setAttribute('gltf-model', file);
        el.setAttribute('position', p.pos);
        if (p.rot) el.setAttribute('rotation', p.rot);
        if (p.s) el.setAttribute('scale', p.s);
        el.setAttribute('shadow', 'cast: true; receive: true');
        scene.appendChild(el);
      });
    }).catch(function() {});
  },
};

document.addEventListener('DOMContentLoaded', function() {
  var scene = document.querySelector('a-scene');
  if (scene) {
    var go = function() { setTimeout(function() { ModelPlacer.init(); }, 2000); };
    if (scene.hasLoaded) go();
    else scene.addEventListener('loaded', go);
  }
});

window.ModelPlacer = ModelPlacer;
