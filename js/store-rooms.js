/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Store Room System (GLB rooms only)

   NO PANORAMAS. Each store with a room GLB loads it when
   you enter the zone.

   v2 CHANGES (2026-04-17):
   - Supports multi-room stores via cfg.rooms[] array
   - Backwards compatible with single-room cfg.room
   - Tags each loaded entity with data-room-label + data-room-slot
     so the Room Tuner can find and mutate them live
   - Cleaner unload (removes entities vs nuking innerHTML)
   - Added Cafe Sativa (jazz club + smoking lounge + cold stoned)
   - Optional spawn point teleport on zone entry
   ═══════════════════════════════════════════════════════════ */

(function() {

var STORE_ROOMS = {
  'The Verse Alkemist': {
    // Single-room shape (backwards compatible)
    room: {
      src: 'assets/models/rooms/music-studio.glb',
      position: '0 0 -58',
      scale: '0.05 0.05 0.05',
      rotation: '0 0 0',
    },
    props: [
      { id: 'va-turntable',  src: 'assets/models/studio/turntable.glb',  position: '-1.2 0.82 -60',   scale: '0.5 0.5 0.5',   rotation: '0 0 0' },
      { id: 'va-mic',        src: 'assets/models/studio/mic.glb',        position: '0.5 0.82 -59.5',  scale: '0.4 0.4 0.4',   rotation: '0 15 0' },
      { id: 'va-mixer',      src: 'assets/models/studio/mixer.glb',      position: '0 0.82 -60.2',    scale: '0.6 0.6 0.6',   rotation: '0 0 0' },
      { id: 'va-headphones', src: 'assets/models/studio/headphones.glb', position: '1.6 0.85 -59',    scale: '0.25 0.25 0.25', rotation: '0 -30 0', clickable: true },
      { id: 'va-monitor-l',  src: 'assets/models/studio/monitor.glb',    position: '-1.8 0.85 -60.5', scale: '0.3 0.3 0.3',   rotation: '0 25 0' },
      { id: 'va-monitor-r',  src: 'assets/models/studio/monitor.glb',    position: '1.8 0.85 -60.5',  scale: '0.3 0.3 0.3',   rotation: '0 -25 0' },
      { id: 'va-mpc',        src: 'assets/models/studio/mpc.glb',        position: '1.2 0.82 -60',    scale: '0.3 0.3 0.3',   rotation: '0 0 0' },
    ],
    lights: [
      { color: '#a060e0', intensity: 1.5, distance: 8, position: '0 3 -58' },
      { color: '#fff2d8', intensity: 0.8, distance: 6, position: '0 4 -56' },
      { color: '#a060e0', intensity: 0.6, distance: 5, position: '0 0.5 -60' },
    ],
    hideZone: 'zone-verse-alkemist',
  },

  'Cafe Sativa': {
    // Multi-room shape — three connected sections
    rooms: [
      // Slot 0: Main jazz club / bar lounge
      {
        src: 'assets/models/rooms/jazz-club.glb',
        scale: '0.6 0.6 0.6',
        position: '10 6.96 -38',
        rotation: '0 90 0',
      },
      // Slot 1: Smoking lounge (cigars/hookah)
      {
        src: 'assets/models/rooms/smoking-lounge.glb',
        scale: '0.4 0.4 0.4',
        position: '13 6.76 -42',
        rotation: '0 0 0',
      },
      // Slot 2: Cold Stoned gelato
      {
        src: 'assets/models/rooms/cold-stoned.glb',
        scale: '0.005 0.005 0.005',
        position: '10 -0.09 -34',
        rotation: '0 90 0',
      },
    ],
    lights: [
      { color: '#c09060', intensity: 1.2, distance: 12, position: '10 4 -38' },
      { color: '#ffe0a0', intensity: 0.8, distance: 8,  position: '10 3 -36' },
      { color: '#ff8040', intensity: 0.5, distance: 6,  position: '13 3 -42' },
    ],
    hideZone: 'zone-cafe-sativa',
  },
};

// Zone detection bounds
var ROOM_ZONES = [
  { label: 'The Verse Alkemist', x: 0,  z: -58, w: 10, d: 10 },
  { label: 'Cafe Sativa',        x: 8,  z: -38, w: 8,  d: 10 },
];

var StoreRoomSystem = {
  container: null,
  hiddenZone: null,
  _last: null,

  init: function() {
    var scene = document.querySelector('a-scene');
    if (!scene) return;

    this.container = document.createElement('a-entity');
    this.container.id = 'store-room-container';
    scene.appendChild(this.container);

    var S = this;
    setInterval(function() { S.update(); }, 200);

    console.log('[StoreRooms v2] Ready — multi-room support, tuner-aware');
  },

  detect: function() {
    var rig = document.getElementById('camera-rig');
    if (!rig) return null;
    var p = rig.getAttribute('position');
    for (var i = 0; i < ROOM_ZONES.length; i++) {
      var z = ROOM_ZONES[i];
      if (p.x >= z.x - z.w/2 && p.x <= z.x + z.w/2 &&
          p.z >= z.z - z.d/2 && p.z <= z.z + z.d/2)
        return z;
    }
    return null;
  },

  // Normalize cfg into an array of room defs regardless of shape
  _rooms: function(cfg) {
    if (cfg.rooms && Array.isArray(cfg.rooms)) return cfg.rooms;
    if (cfg.room) return [cfg.room];
    return [];
  },

  loadRoom: function(label) {
    var cfg = STORE_ROOMS[label];
    if (!cfg) return;

    this.unloadRoom();
    var S = this;

    // Hide the primitive store zone
    if (cfg.hideZone) {
      var oldZone = document.getElementById(cfg.hideZone);
      if (oldZone) {
        oldZone.setAttribute('visible', 'false');
        S.hiddenZone = oldZone;
      }
    }

    // Load all rooms (1 or many)
    var rooms = this._rooms(cfg);
    rooms.forEach(function(r, i) {
      var room = document.createElement('a-entity');
      room.setAttribute('gltf-model', r.src);
      room.setAttribute('position', r.position);
      room.setAttribute('scale', r.scale);
      room.setAttribute('rotation', r.rotation || '0 0 0');

      // ─── TUNER HOOKS ───────────────────────────────────────
      // The mall-tuner.js overlay finds entities by these attrs
      room.setAttribute('data-room-label', label);
      room.setAttribute('data-room-slot', String(i));
      room.classList.add('tunable-room');

      room.addEventListener('model-loaded', function() {
        var mesh = room.getObject3D('mesh');
        if (mesh) mesh.traverse(function(ch) { if (ch.isMesh) ch.frustumCulled = false; });
        console.log('[StoreRooms] Loaded ' + label + ' [' + i + ']: ' + r.src);
      });

      room.addEventListener('model-error', function(e) {
        console.warn('[StoreRooms] Failed to load ' + label + ' [' + i + ']: ' + r.src, e);
      });

      S.container.appendChild(room);
    });

    // Props (still single-list per store)
    (cfg.props || []).forEach(function(p) {
      var e = document.createElement('a-entity');
      e.id = p.id;
      e.setAttribute('gltf-model', p.src);
      e.setAttribute('position', p.position);
      e.setAttribute('scale', p.scale);
      e.setAttribute('rotation', p.rotation || '0 0 0');
      if (p.clickable) e.classList.add('clickable');
      e.addEventListener('model-loaded', function() {
        var mesh = e.getObject3D('mesh');
        if (mesh) mesh.traverse(function(ch) { if (ch.isMesh) ch.frustumCulled = false; });
      });
      S.container.appendChild(e);
    });

    // Lights
    (cfg.lights || []).forEach(function(l) {
      var le = document.createElement('a-entity');
      le.setAttribute('light', 'type:point; color:' + l.color +
        '; intensity:' + l.intensity + '; distance:' + l.distance + '; decay:1.5');
      le.setAttribute('position', l.position);
      S.container.appendChild(le);
    });

    // Optional: teleport avatar to spawn point set by tuner
    if (cfg.spawn && cfg.spawn.x != null) {
      // Don't auto-teleport on normal zone entry — that's jarring.
      // The tuner's TELEPORT button is the intended trigger.
      // We just stash the value for the tuner to use.
    }
  },

  unloadRoom: function() {
    // Properly remove entities (lets A-Frame clean up Three.js resources)
    if (this.container) {
      while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
      }
    }
    if (this.hiddenZone) {
      this.hiddenZone.setAttribute('visible', 'true');
      this.hiddenZone = null;
    }
  },

  update: function() {
    var zone = this.detect();
    var label = zone ? zone.label : null;
    if (label === this._last) return;

    this.unloadRoom();
    this._last = label;

    if (label && STORE_ROOMS[label]) {
      this.loadRoom(label);
    }
  },

  // Called by mall-tuner.js after it loads Supabase values
  // so a zone you're already standing in picks up new transforms
  reloadCurrent: function() {
    var saved = this._last;
    this._last = null; // force update() to re-load
    // update() will fire on the next interval tick
  },
};

document.addEventListener('DOMContentLoaded', function() {
  var scene = document.querySelector('a-scene');
  if (scene) {
    var go = function() { setTimeout(function() { StoreRoomSystem.init(); }, 2000); };
    if (scene.hasLoaded) go(); else scene.addEventListener('loaded', go);
  }
});

window.StoreRoomSystem = StoreRoomSystem;
window.STORE_ROOMS = STORE_ROOMS;
window.ROOM_ZONES = ROOM_ZONES;

})();
