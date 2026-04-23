/* ═══════════════════════════════════════════════════════════════════
   TRU SKOOL MALL — Doorway Signs (v2, event-driven)

   v1 used a 500ms setInterval per sign to check for loaded GLB rooms.
   7 signs × 500ms polling contributed to INP jank.

   v2 uses one MutationObserver on store-room-container and updates
   sign visibility only when rooms actually load/unload.

   Load ORDER in index.html:
     <script src="js/store-rooms.js"></script>
     <script src="js/mall-tuner.js"></script>
     <script src="js/doorway-signs.js"></script>
     <script src="js/legacy-shim.js"></script>
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var PRIMITIVES_TO_REMOVE = [
    'zone-concrete-rose',
    'zone-bijadi',
    'zone-faithfully-faded',
    'zone-hoe',
    'zone-wanderlust',
    'zone-cafe-sativa',
    'zone-verse-alkemist',
  ];

  var SIGNS = [
    { label: 'Concrete Rose',       pos: [-10, 0, -8],   side: 'left',  color: '#c94060', sub: 'Luxury Streetwear',  name: 'CONCRETE ROSE' },
    { label: 'BiJaDi',              pos: [10, 0, -8],    side: 'right', color: '#d4c0a8', sub: 'Beyond Enough.',     name: 'BiJaDi' },
    { label: 'Faithfully Faded',    pos: [-10, 0, -22],  side: 'left',  color: '#FFADED', sub: 'Just be Blunt.',     name: 'FAITHFULLY FADED' },
    { label: 'H.O.E.',              pos: [10, 0, -22],   side: 'right', color: '#e8c060', sub: 'Crown Culture',      name: 'H.O.E.' },
    { label: 'Wanderlust',          pos: [-10, 0, -38],  side: 'left',  color: '#60c890', sub: 'Travel · Adventure', name: 'WANDERLUST' },
    { label: 'Cafe Sativa',         pos: [10, 0, -38],   side: 'right', color: '#c09060', sub: 'Sip. Smoke. Vibe.',  name: 'CAFE SATIVA' },
    { label: 'The Verse Alkemist',  pos: [0, 0, -58],    side: 'back',  color: '#a060e0', sub: 'Walls of the World', name: 'THE VERSE ALKEMIST' },
  ];

  var signByLabel = {};

  function buildSign(def) {
    var root  = document.createElement('a-entity');
    root.className = 'doorway-sign clickable';
    root.setAttribute('position', def.pos.join(' '));
    root.setAttribute('data-store', def.label);
    root.setAttribute('data-sign-label', def.label);

    var text  = document.createElement('a-text');
    var sub   = document.createElement('a-text');
    var strip = document.createElement('a-box');
    var lamp  = document.createElement('a-entity');

    if (def.side === 'left') {
      text.setAttribute('position', '4.5 5.5 0');   text.setAttribute('rotation', '0 90 0');
      sub.setAttribute('position', '4.5 4.8 0');    sub.setAttribute('rotation', '0 90 0');
      strip.setAttribute('position', '4.55 3 0');
      strip.setAttribute('width', '0.02');
      strip.setAttribute('depth', '4');
      lamp.setAttribute('position', '4 5 0');
    } else if (def.side === 'right') {
      text.setAttribute('position', '-4.5 5.5 0');  text.setAttribute('rotation', '0 -90 0');
      sub.setAttribute('position', '-4.5 4.8 0');   sub.setAttribute('rotation', '0 -90 0');
      strip.setAttribute('position', '-4.55 3 0');
      strip.setAttribute('width', '0.02');
      strip.setAttribute('depth', '4');
      lamp.setAttribute('position', '-4 5 0');
    } else {
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
    var n = 0;
    PRIMITIVES_TO_REMOVE.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.parentNode) { el.parentNode.removeChild(el); n++; }
    });
    if (n) console.log('[DoorwaySigns] Removed ' + n + ' store primitives');
  }

  function injectSigns() {
    var scene = document.querySelector('a-scene');
    if (!scene) return;
    SIGNS.forEach(function (def) {
      var sign = buildSign(def);
      scene.appendChild(sign);
      signByLabel[def.label] = sign;
    });
    console.log('[DoorwaySigns] Injected ' + SIGNS.length + ' doorway signs');
  }

  function refreshVisibility() {
    var container = document.getElementById('store-room-container');
    var loaded = {};
    if (container) {
      Array.prototype.forEach.call(
        container.querySelectorAll('[data-room-label]'),
        function (el) { loaded[el.getAttribute('data-room-label')] = true; }
      );
    }
    Object.keys(signByLabel).forEach(function (label) {
      signByLabel[label].setAttribute('visible', loaded[label] ? 'false' : 'true');
    });
  }

  function watchRoomContainer() {
    var tryObserve = function () {
      var container = document.getElementById('store-room-container');
      if (!container) { setTimeout(tryObserve, 250); return; }
      var observer = new MutationObserver(refreshVisibility);
      observer.observe(container, { childList: true, subtree: false });
      refreshVisibility();
      console.log('[DoorwaySigns] Watching store-room-container (event-driven)');
    };
    tryObserve();
  }

  function go() {
    removePrimitives();
    injectSigns();
    watchRoomContainer();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var scene = document.querySelector('a-scene');
    if (!scene) return;
    if (scene.hasLoaded) go();
    else scene.addEventListener('loaded', go);
  });
})();
