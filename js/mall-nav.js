/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Navigation & Collision System
   
   MUST load BEFORE <a-scene> tag (A-Frame component registration)
   
   Corridor walls are at x=±15 (0.3m thick), so walkable is x=±14.7
   Store interiors are between corridor walls, accessible naturally
   ═══════════════════════════════════════════════════════════ */

(function() {
  if (typeof AFRAME === 'undefined') return;

  // Simple boundary clamp — keeps player inside the mall footprint
  // Stores are INSIDE the corridor walls, so one big zone works
  var BOUNDS = {
    xMin: -14,   // Inside left corridor wall (wall at x=-15)
    xMax: 14,    // Inside right corridor wall (wall at x=15)
    zMin: -65,   // Just before back wall (wall at z=-70)
    zMax: 14,    // Just past entrance archway
  };

  AFRAME.registerComponent('mall-nav', {
    schema: {
      enabled: { default: true },
    },

    init: function() {
      console.log('[MallNav] Collision active — bounds: x[' + BOUNDS.xMin + ',' + BOUNDS.xMax + '] z[' + BOUNDS.zMin + ',' + BOUNDS.zMax + ']');
    },

    tick: function() {
      if (!this.data.enabled) return;
      var pos = this.el.object3D.position;

      // Y-lock: stay on ground
      if (pos.y !== 0) pos.y = 0;

      // Clamp X
      if (pos.x < BOUNDS.xMin) pos.x = BOUNDS.xMin;
      if (pos.x > BOUNDS.xMax) pos.x = BOUNDS.xMax;

      // Clamp Z
      if (pos.z < BOUNDS.zMin) pos.z = BOUNDS.zMin;
      if (pos.z > BOUNDS.zMax) pos.z = BOUNDS.zMax;
    },
  });
})();
