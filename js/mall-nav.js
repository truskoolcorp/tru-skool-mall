/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Navigation & Collision System
   
   Level 2 collision: zone-based walkable area enforcement
   
   Features:
   - Walkable zones defined as rectangles (corridor + each store interior)
   - SLIDING collision — hit a wall, slide along it (not hard snap)
   - Y-axis lock (can't fly up or fall down)
   - Automatic detection of corridor vs store interior
   - Teleporting into a store remains valid (teleport coords are in store bounds)
   ═══════════════════════════════════════════════════════════ */

(function() {
  if (typeof AFRAME === 'undefined') return;

  // ─── Walkable zones ───
  // Corridor: the main walking path between stores (narrow to match storefront walls)
  // Stores: the interior of each store (accessible only via teleport)
  const WALKABLE_ZONES = [
    // Main corridor — between the storefront walls (±5) and entrance to back wall
    // Extends slightly beyond entrance (z=14) and nearly to back wall (z=-65)
    { name: 'corridor',         xMin: -4.5,  xMax: 4.5,  zMin: -65, zMax: 14 },

    // Store interiors — accessed via teleport (Store Directory buttons)
    { name: 'concrete-rose',    xMin: -13.5, xMax: -5.5, zMin: -12, zMax: -4 },
    { name: 'bijadi',           xMin: 5.5,   xMax: 13.5, zMin: -12, zMax: -4 },
    { name: 'faithfully-faded', xMin: -13.5, xMax: -5.5, zMin: -26, zMax: -18 },
    { name: 'hoe',              xMin: 5.5,   xMax: 13.5, zMin: -26, zMax: -18 },
    { name: 'wanderlust',       xMin: -13.5, xMax: -5.5, zMin: -42, zMax: -34 },
    { name: 'cafe-sativa',      xMin: 5.5,   xMax: 13.5, zMin: -42, zMax: -34 },
    { name: 'verse-alkemist',   xMin: -6,    xMax: 6,    zMin: -64, zMax: -52 },
  ];

  // Check if a world position (x, z) is inside any walkable zone
  function pointInAnyZone(x, z) {
    for (const zone of WALKABLE_ZONES) {
      if (x >= zone.xMin && x <= zone.xMax &&
          z >= zone.zMin && z <= zone.zMax) {
        return zone;
      }
    }
    return null;
  }

  AFRAME.registerComponent('mall-nav', {
    schema: {
      enabled: { default: true },
      debug:   { default: false },
    },

    init() {
      // Starting position = entrance
      this.lastValid = { x: 0, z: 14 };
      this.currentZoneName = 'corridor';

      // Expose for debugging
      window.MallNav = this;

      console.log('[MallNav] Collision system active');
    },

    tick() {
      if (!this.data.enabled) return;

      const obj = this.el.object3D;
      const pos = obj.position;

      // ─── Y-LOCK: player stays at ground level ───
      if (Math.abs(pos.y) > 0.001) {
        pos.y = 0;
      }

      const newX = pos.x;
      const newZ = pos.z;

      // ─── Check if new position is valid ───
      const newZone = pointInAnyZone(newX, newZ);

      if (newZone) {
        // Valid position — update last-valid and detect zone transition
        this.lastValid.x = newX;
        this.lastValid.z = newZ;

        if (newZone.name !== this.currentZoneName) {
          if (this.data.debug) {
            console.log(`[MallNav] Zone transition: ${this.currentZoneName} → ${newZone.name}`);
          }
          this.currentZoneName = newZone.name;
        }
        return;
      }

      // ─── Invalid position — try SLIDING COLLISION ───
      // Try keeping only the X movement (as if Z hit a wall)
      const xOnly = pointInAnyZone(newX, this.lastValid.z);
      if (xOnly) {
        pos.z = this.lastValid.z;
        this.lastValid.x = newX;
        this.currentZoneName = xOnly.name;
        return;
      }

      // Try keeping only the Z movement (as if X hit a wall)
      const zOnly = pointInAnyZone(this.lastValid.x, newZ);
      if (zOnly) {
        pos.x = this.lastValid.x;
        this.lastValid.z = newZ;
        this.currentZoneName = zOnly.name;
        return;
      }

      // Both axes invalid — full snap-back to last valid position
      pos.x = this.lastValid.x;
      pos.z = this.lastValid.z;
    },
  });

  // ─── Also expose walkable zones + detector for other scripts ───
  window.MallWalkableZones = WALKABLE_ZONES;
  window.MallPointInZone = pointInAnyZone;
})();
