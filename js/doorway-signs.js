/* ═══════════════════════════════════════════════════════════════════
   TRU SKOOL MALL — Doorway Signs + Primitive Cleanup

   Rather than rewriting index.html and risking breaking the asset
   block (which has your base64 texture images baked in), this script
   runs at boot and:

   1. Removes the 7 store-primitive <a-entity id="zone-*"> blocks
      so they don't conflict with GLB rooms
   2. Removes the primitive mini-avatars inside them
   3. Injects clean doorway signs at each store's corridor position
   4. Auto-hides a sign when its GLB room loads

   Load ORDER in index.html:
     <script src="js/store-rooms.js"></script>
     <script src="js/mall-tuner.js"></script>
     <script src="js/doorway-signs.js"></script>   <-- add this
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Stores whose primitives should be removed.
  // zone-entrance is NOT in this list — that's the Grand Entrance archway, keep it.
  var PRIMITIVES_TO_REMOVE = [
    'zone-concrete-rose',
    'zone-bijadi',
    'zone-faithfully-faded',
    'zone-hoe',
    'zone-wanderlust',
    'zone-cafe-sativa',
    'zone-verse-alkemist',
  ];

  // Doorway sign definitions — one per store.
  // `side` is 'left' (store on negative-X side, sign faces east/+90deg)
  // or 'right' (store on positive-X side, sign faces west/-90deg)
  // or 'back' (end-of-mall, faces toward camera along -Z)
  var SIGNS = [
    { label: 'Concrete Rose',       pos: [-10, 0, -8],   side: 'left',  color: '#c94060', sub: 'Luxury Streetwear',     name: 'CONCRETE ROSE' },
    { label: 'BiJaDi',              pos: [10, 0, -8],    side: 'right', color: '#d4c0a8', sub: 'Beyond Enough.',        name: 'BiJaDi' },
    { label: 'Faithfully Faded',    pos: [-10, 0, -22],  side: 'left',  color: '#FFADED', sub: 'Just be Blunt.',        name: 'FAITHFULLY FADED' },
    { label: 'H.O.E.',              pos: [10, 0, -22],   side: 'right', color: '#e8c060', sub: 'Crown Culture',         name: 'H.O.E.' },
    { label: 'Wanderlust',          pos: [-10, 0, -38],  side: 'left',  color: '#60c890', sub: 'Travel · Adventure',    name: 'WANDERLUST' },
    { label: 'Cafe Sativa',         pos: [10, 0, -38],   side: 'right', color: '#c09060', sub: 'Sip. Smoke. Vibe.',     name: 'CAFÉ SATIVA' },
    { label: 'The Verse Alkemist',  pos: [0, 0, -58],    side: 'back',  color: '#a060e0', sub: 'Walls of the World',    name: 'THE VERSE ALKEMIST' },
  ];

  // Register the doorway-sign component (handles auto-hide when GLB room loads)
  if (window.AFRAME && !AFRAME.components['doorway-sign']) {
    AFRAME.registerComponent('doorway-sign', {
      schema: { label: { type: 'string' } },
      init: function () {
        var self = this;
        this._iv = setInterval(function () {
          var container = document.getElementById('store-room-container');
          if (!container) return;
          var safe = self.data.label.replace(/"/g, '\\"');
          var loaded = container.querySelector('[data-room-label="' + safe + '"]');
          self.el.setAttribute('visible', loaded ? 'false' : 'true');
        }, 500);
      },
      remove: function () { clearInterval(this._iv); },
    });
  }

  // Build one doorway sign entity for a store
  function buildSign(def) {
    var root = document.createElement('a-entity');
    root.className = 'doorway-sign clickable';
    root.setAttribute('position', def.pos.join(' '));
    root.setAttribute('data-store', def.label);
    root.setAttribute('doorway-sign', 'label: ' + def.label);

    var text = document.createElement('a-text');
    var sub  = document.createElement('a-text');
    var strip = document.createElement('a-box');
    var lamp = document.createElement('a-entity');

    if (def.side === 'left') {
      // Store is on -X side of corridor; doorway opens to the right (+X)
      // Face into corridor: rotation 0 90 0
      text.setAttribute('position', '4.5 5.5 0');
      text.setAttribute('rotation', '0 90 0');
      sub.setAttribute('position', '4.5 4.8 0');
      sub.setAttribute('rotation', '0 90 0');
      strip.setAttribute('position', '4.55 3 0');
      strip.setAttribute('width', '0.02');
      strip.setAttribute('depth', '4');
      lamp.setAttribute('position', '4 5 0');
    } else if (def.side === 'right') {
      // Store on +X; doorway opens to the left (-X). rotation 0 -90 0
      text.setAttribute('position', '-4.5 5.5 0');
      text.setAttribute('rotation', '0 -90 0');
      sub.setAttribute('position', '-4.5 4.8 0');
      sub.setAttribute('rotation', '0 -90 0');
      strip.setAttribute('position', '-4.55 3 0');
      strip.setAttribute('width', '0.02');
      strip.setAttribute('depth', '4');
      lamp.setAttribute('position', '-4 5 0');
    } else {
      // 'back' — end of corridor, facing +Z toward camera
      text.setAttribute('position', '0 7 -4.8');
      sub.setAttribute('position', '0 6.2 -4.8');
      strip.setAttribute('position', '0 5.5 -4.8');
      strip.setAttribute('width', '8');
      strip.setAttribute('depth', '0.02');
      lamp.setAttribute('position', '0 6 -3');
    }

    text.setAttribute('value', def.name);
    text.setAttribute('align', 'center');
    text.setAttribute('color', def.color);
    text.setAttribute('width', def.side === 'back' ? '12' : '8');
    text.setAttribute('font', 'mozillavr');

    sub.setAttribute('value', def.sub);
    sub.setAttribute('align', 'center');
    sub.setAttribute('color', def.color);
    sub.setAttribute('width', '5');
    sub.setAttribute('font', 'mozillavr');
    sub.setAttribute('opacity', '0.75');

    strip.setAttribute('height', '0.08');
    strip.setAttribute('material',
      'color: ' + def.color + '; emissive: ' + def.color + '; emissiveIntensity: 0.6');

    lamp.setAttribute('light',
      'type: point; color: ' + def.color + '; intensity: 0.6; distance: 10; decay: 1.5');

    root.appendChild(text);
    root.appendChild(sub);
    root.appendChild(strip);
    root.appendChild(lamp);
    return root;
  }

  function removePrimitives() {
    var removed = 0;
    PRIMITIVES_TO_REMOVE.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
        removed++;
      }
    });
    if (removed) console.log('[DoorwaySigns] Removed ' + removed + ' store primitives');
  }

  function injectSigns() {
    var scene = document.querySelector('a-scene');
    if (!scene) return;
    SIGNS.forEach(function (def) {
      scene.appendChild(buildSign(def));
    });
    console.log('[DoorwaySigns] Injected ' + SIGNS.length + ' doorway signs');
  }

  function go() {
    removePrimitives();
    injectSigns();
  }

  // Run as soon as the scene is ready
  document.addEventListener('DOMContentLoaded', function () {
    var scene = document.querySelector('a-scene');
    if (!scene) return;
    if (scene.hasLoaded) go();
    else scene.addEventListener('loaded', go);
  });
})();
