/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Model Placer v5
   Avatars are now inline in index.html with fix-avatar component.
   This file only handles optional furniture GLB loading.
   ═══════════════════════════════════════════════════════════ */

var ModelPlacer = {

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
    Object.keys(this.furniture).forEach(function(f) { self.tryLoadFurniture(scene, f); });
    console.log('[ModelPlacer] v5 — avatars are inline HTML, checking furniture...');
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
