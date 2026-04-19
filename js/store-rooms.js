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
  // 'The Verse Alkemist': DISABLED — awaiting Meshy walkable studio GLB.
  // Original config preserved in git history (commit before this one).
  // When the new walkable music-studio.glb lands in assets/models/rooms/,
  // restore the block and re-tune positions via the Room Tuner.

  // 'Cafe Sativa': DISABLED — replaced by js/cafe-sativa-wing.js (programmatic
  // 6-room wing built from official floor plan dimensions). The old GLB
  // loaders (jazz-club.glb, smoking-lounge.glb, cold-stoned.glb) remain in
  // assets/models/rooms/ and can be reused as interior props in specific
  // rooms of the new wing in a later PR.
};

// Zone detection bounds
var ROOM_ZONES = [
  { label: 'The Verse Alkemist', x: 0,  z: -58, w: 10, d: 10 },
  // 'Cafe Sativa' removed — handled by cafe-sativa-wing.js
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
