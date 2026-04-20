/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Navigation & Collision System
   
   MUST load BEFORE <a-scene> tag (A-Frame component registration)
   
   Corridor walls are at x=±15 (0.3m thick), so walkable is x=±14.7
   Store interiors are between corridor walls, accessible naturally
   ═══════════════════════════════════════════════════════════ */

(function() {
  if (typeof AFRAME === 'undefined') return;

  // Simple boundary clamp — keeps player inside the mall footprint.
  //
  // The mall has two zones:
  //   - Main corridor: x=-14 to x=14 (between corridor walls at ±15)
  //   - CS wing V3: x=15 to x=41.7, z=-51 to -18 (entry arcade + 10 rooms)
  //
  // The mall-collision system handles fine-grained wall blocking inside
  // rooms. This clamp only sets the OUTER bounds of the whole mall
  // footprint so players can't walk off into the void.
  //
  // zMax is +18 to accommodate the front plaza courtyard (PR 5).
  var BOUNDS = {
    xMin: -14,   // Inside left corridor wall (wall at x=-15)
    xMax: 43,    // Just past east edge of CS wing (extends to x=41.7)
    zMin: -68,   // Just before main-mall back wall at z=-70 (covers CS Culinary at z=-51 too)
    zMax: 18,    // Past the plaza courtyard (extends to z=+18)
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
