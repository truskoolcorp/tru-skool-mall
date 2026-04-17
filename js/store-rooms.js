/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Store Room System
   
   GLB rooms loaded on-demand when player enters zone.
   No panoramas. Room geometry IS the environment.
   
   Stores with rooms:
   - The Verse Alkemist → music-studio.glb (home studio with turntable, speakers, desk, etc.)
   - Cafe Sativa → jazz-club.glb (main lounge) + smoking-lounge.glb + cold-stoned.glb
   
   Stores without rooms yet keep their A-Frame primitive shells:
   - Concrete Rose, BiJaDi, Faithfully Faded, H.O.E., Wanderlust
   ═══════════════════════════════════════════════════════════ */

(function() {

// ═══ ROOM CONFIGURATIONS ═══
// Scale/position calculated from native model bounds analysis
var STORE_ROOMS = {

  // ─── VERSE ALKEMIST ───
  // music-studio.glb: native 125.6 x 172.9 x 243.0 units, floor Y at -46.9
  // Has built-in: turntable, speakers, desk, chair, headphones, piano, guitar, screen, sofa, vinyl records
  'The Verse Alkemist': {
    rooms: [{
      src: 'assets/models/rooms/music-studio.glb',
      scale: '0.08 0.08 0.08',
      position: '-0.2 3.75 -53',  // Y=46.9*0.08=3.75 lifts floor to y=0
      rotation: '0 0 0',
    }],
    lights: [
      { color: '#a060e0', intensity: 1.2, distance: 12, position: '0 4 -58' },
      { color: '#fff2d8', intensity: 0.6, distance: 8, position: '0 5 -55' },
    ],
    hideZone: 'zone-verse-alkemist',
  },

  // ─── CAFÉ SATIVA ───
  // Multi-section venue: "Sip. Smoke. Vibe."
  // Section 1: Jazz Club (main lounge/bar) — 14.5 x 20.1 x 9.3 native, floor Y at -11.6
  // Section 2: Smoking Lounge (cigars/hookah) — 21.7 x 18.1 x 4.3 native, floor Y at -16.9
  // Section 3: Cold Stoned (CBD gelato) — 2081 x 518 x 1187 native (millimeter scale), floor Y at 18.4
  'Cafe Sativa': {
    rooms: [
      // Main lounge/bar (jazz club voxel — only 65KB!)
      {
        src: 'assets/models/rooms/jazz-club.glb',
        scale: '0.6 0.6 0.6',          // ~8.7m x 12m x 5.6m
        position: '10 6.96 -38',        // Y=11.6*0.6=6.96 lifts floor to y=0
        rotation: '0 90 0',             // Rotate to face corridor
      },
      // Smoking lounge (connected behind main lounge)
      {
        src: 'assets/models/rooms/smoking-lounge.glb',
        scale: '0.4 0.4 0.4',          // ~8.7m x 7.2m x 1.7m
        position: '13 6.76 -42',        // Y=16.9*0.4=6.76, offset behind jazz club
        rotation: '0 0 0',
      },
      // Cold Stoned gelato (section to the side)
      {
        src: 'assets/models/rooms/cold-stoned.glb',
        scale: '0.005 0.005 0.005',     // ~10.4m x 2.6m x 5.9m
        position: '10 -0.09 -34',       // Y=-18.4*0.005=-0.09
        rotation: '0 90 0',
      },
    ],
    lights: [
      { color: '#c09060', intensity: 1.2, distance: 12, position: '10 4 -38' },  // Warm amber
      { color: '#ffe0a0', intensity: 0.8, distance: 8, position: '10 3 -36' },   // Golden glow
      { color: '#ff8040', intensity: 0.5, distance: 6, position: '13 3 -42' },   // Smoking lounge warm
    ],
    hideZone: 'zone-cafe-sativa',
  },
};

// ═══ ZONE DETECTION ═══
var ROOM_ZONES = [
  { label: 'The Verse Alkemist', x: 0,  z: -58, w: 10, d: 10 },
  { label: 'Cafe Sativa',        x: 8,  z: -38, w: 8,  d: 10 },
];

// ═══ SYSTEM ═══
var StoreRoomSystem = {
  container: null,
  hiddenZoneEl: null,
  _last: null,

  init: function() {
    var scene = document.querySelector('a-scene');
    if (!scene) return;

    this.container = document.createElement('a-entity');
    this.container.id = 'store-room-container';
    scene.appendChild(this.container);

    var S = this;
    setInterval(function() { S.update(); }, 250);
    console.log('[StoreRooms] Ready — VA + Cafe Sativa');
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

  loadRoom: function(label) {
    var cfg = STORE_ROOMS[label];
    if (!cfg) return;
    this.container.innerHTML = '';
    var S = this;

    // Hide old primitive zone
    if (cfg.hideZone) {
      var el = document.getElementById(cfg.hideZone);
      if (el) {
        el.setAttribute('visible', 'false');
        Array.from(el.children).forEach(function(c) {
          c.setAttribute('visible', 'false');
        });
        S.hiddenZoneEl = el;
      }
    }

    // Load ALL room sections (supports multi-section venues)
    (cfg.rooms || []).forEach(function(roomCfg, idx) {
      var room = document.createElement('a-entity');
      room.id = 'store-room-' + idx;
      room.setAttribute('gltf-model', roomCfg.src);
      room.setAttribute('position', roomCfg.position);
      room.setAttribute('scale', roomCfg.scale);
      room.setAttribute('rotation', roomCfg.rotation || '0 0 0');
      room.addEventListener('model-loaded', function() {
        var mesh = room.getObject3D('mesh');
        if (mesh) {
          mesh.traverse(function(ch) {
            if (ch.isMesh) {
              ch.frustumCulled = false;
              // Fix overly metallic materials
              if (ch.material) {
                var mats = Array.isArray(ch.material) ? ch.material : [ch.material];
                mats.forEach(function(m) {
                  if (m.metalness > 0.8) m.metalness = 0.3;
                  m.needsUpdate = true;
                });
              }
            }
          });
        }
        console.log('[StoreRooms] Section ' + idx + ' loaded: ' + roomCfg.src);
      });
      S.container.appendChild(room);
    });

    // Lights
    (cfg.lights || []).forEach(function(l) {
      var le = document.createElement('a-entity');
      le.setAttribute('light', 'type:point; color:' + l.color +
        '; intensity:' + l.intensity + '; distance:' + l.distance + '; decay:1.5');
      le.setAttribute('position', l.position);
      S.container.appendChild(le);
    });

    console.log('[StoreRooms] Loaded: ' + label + ' (' + (cfg.rooms || []).length + ' sections)');
  },

  unloadRoom: function() {
    this.container.innerHTML = '';
    if (this.hiddenZoneEl) {
      this.hiddenZoneEl.setAttribute('visible', 'true');
      Array.from(this.hiddenZoneEl.children).forEach(function(c) {
        c.setAttribute('visible', 'true');
      });
      this.hiddenZoneEl = null;
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

})();
