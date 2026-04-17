/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Store Room System (GLB rooms only)
   
   NO PANORAMAS. Each store with a room GLB loads it when
   you enter the zone. Stores without rooms keep their
   existing primitive A-Frame shells (no hiding).
   ═══════════════════════════════════════════════════════════ */

(function() {

var STORE_ROOMS = {
  'The Verse Alkemist': {
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
    // Which zone entity to hide when room loads (the old primitive store shell)
    hideZone: 'zone-verse-alkemist',
  },
};

// Zone detection bounds
var ROOM_ZONES = [
  { label: 'The Verse Alkemist', x: 0, z: -58, w: 10, d: 8 },
  // Add more as GLB rooms are built
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

    console.log('[StoreRooms] Ready — GLB rooms only, no panoramas');
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

    // Hide the old primitive store zone
    if (cfg.hideZone) {
      var oldZone = document.getElementById(cfg.hideZone);
      if (oldZone) {
        oldZone.setAttribute('visible', 'false');
        S.hiddenZone = oldZone;
      }
    }

    // Room GLB
    var room = document.createElement('a-entity');
    room.id = 'store-room-model';
    room.setAttribute('gltf-model', cfg.room.src);
    room.setAttribute('position', cfg.room.position);
    room.setAttribute('scale', cfg.room.scale);
    room.setAttribute('rotation', cfg.room.rotation);
    room.addEventListener('model-loaded', function() {
      var mesh = room.getObject3D('mesh');
      if (mesh) mesh.traverse(function(ch) { if (ch.isMesh) ch.frustumCulled = false; });
      console.log('[StoreRooms] Room loaded: ' + label);
    });
    S.container.appendChild(room);

    // Props
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
  },

  unloadRoom: function() {
    this.container.innerHTML = '';
    // Restore hidden zone
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
