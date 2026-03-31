/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Model Placer v4
   FBX→GLB avatars have 100x mesh scale (cm→visual).
   Entity scale 0.01 counters it. Frustum culling disabled.
   ═══════════════════════════════════════════════════════════ */

var ModelPlacer = {

  avatars: {
    'assets/models/laviche.glb': { pos: '2 0 0', rot: '0 180 0', id: 'glb-laviche', removes: ['avatar-laviche', 'laviche-avatar'] },
    'assets/models/ginger.glb':  { pos: '-4 0 -36', rot: '0 90 0', id: 'glb-ginger', removes: ['avatar-ginger'] },
    'assets/models/ahnika.glb':  { pos: '-4 0 -20', rot: '0 90 0', id: 'glb-ahnika', removes: ['avatar-ahnika'] },
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
    Object.keys(this.avatars).forEach(function(f) { self.tryLoadAvatar(scene, f); });
    Object.keys(this.furniture).forEach(function(f) { self.tryLoadFurniture(scene, f); });
    console.log('[ModelPlacer] v4 init — checking models...');
  },

  tryLoadAvatar: function(scene, file) {
    var self = this;
    fetch(file, { method: 'HEAD' }).then(function(r) {
      if (!r.ok) { console.log('[ModelPlacer] Not found: ' + file); return; }
      var cfg = self.avatars[file];

      var el = document.createElement('a-entity');
      el.setAttribute('id', cfg.id);
      el.setAttribute('gltf-model', file);
      el.setAttribute('position', cfg.pos);
      el.setAttribute('rotation', cfg.rot || '0 0 0');
      el.setAttribute('animation-mixer', 'loop: repeat; timeScale: 1');
      scene.appendChild(el);

      console.log('[ModelPlacer] Loading avatar: ' + cfg.id + ' from ' + file);

      el.addEventListener('model-loaded', function() {
        var mesh = el.getObject3D('mesh');
        if (!mesh) { console.warn('[ModelPlacer] No mesh for ' + cfg.id); return; }

        // Apply 0.01 scale to counter FBX 100x mesh scale
        el.object3D.scale.set(0.01, 0.01, 0.01);

        // Disable frustum culling so the avatar isn't hidden
        mesh.traverse(function(child) {
          if (child.isMesh) {
            child.frustumCulled = false;
            // Fix metallic/shiny skin
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

        console.log('[ModelPlacer] ✓ Avatar ' + cfg.id + ' — scale 0.01, frustum off, metalness 0');
      });

      el.addEventListener('model-error', function(e) {
        console.error('[ModelPlacer] ✗ Avatar error ' + cfg.id + ':', e.detail);
      });
    }).catch(function(err) { console.error('[ModelPlacer] Fetch error: ' + file, err); });
  },

  tryLoadFurniture: function(scene, file) {
    fetch(file, { method: 'HEAD' }).then(function(r) {
      if (!r.ok) return;
      ModelPlacer.furniture[file].forEach(function(p) {
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
