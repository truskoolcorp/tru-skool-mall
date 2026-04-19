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
  //   - CS wing: extends east of the main corridor, x=16 to x=38
  //
  // The CS wing's physical walls + the mall-collision system handle
  // fine-grained wall blocking inside the wing. This clamp only sets
  // the OUTER bounds of the whole mall footprint so players can't
  // walk off into the void beyond the east edge of the wing.
  //
  // zMax is +18 to accommodate the front plaza courtyard added in PR 5.
  var BOUNDS = {
    xMin: -14,   // Inside left corridor wall (wall at x=-15)
    xMax: 40,    // Just past east edge of CS wing (wing extends to x=38)
    zMin: -65,   // Just before back wall (wall at z=-70)
    zMax: 18,    // Past the plaza courtyard (courtyard extends to z=+18)
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
