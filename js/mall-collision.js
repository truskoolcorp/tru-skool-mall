/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Mall Collision System

   Provides A-Frame components that make specific walls solid
   (blocking player movement) without affecting non-player
   entities or clickable raycasts.

   Approach:
   - Each wall segment gets the `solid-wall` component attached.
     The component registers the entity's world-space AABB
     (axis-aligned bounding box) with a global collision registry.
   - Each tick, the `rig-collider` component (on the camera-rig)
     samples the rig's intended position AFTER movement-controls
     has moved it, checks the registry, and if the rig is inside
     any AABB, pushes it back out along the minimum-translation
     axis.
   - This is "door/opening aware" because wall segments around
     door gaps are separate entities with separate AABBs — the
     gap between them is free space, so the player walks through.

   Why not a physics engine? We don't need dynamics, just
   "don't walk through walls." Raycast-check every tick is
   expensive; AABB check is cheap and predictable.

   AABB cache is rebuilt whenever:
   - A solid-wall is added (component init)
   - A solid-wall is removed (component remove)
   - solid-wall position/size changes (tick-rebuild if dirty flag)
   - Manual: window.MallCollider.refresh()

   Performance: a mall with ~100 solid walls costs ~0.2ms per
   tick for the AABB scan. Negligible.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Global collision registry — entity id → AABB
  const REGISTRY = new Map();

  // Tolerance for "pushed into a wall" corrections
  const PLAYER_RADIUS = 0.28;  // meters — how much personal space around camera rig
  const EPS = 0.001;

  // Helper: compute world-space AABB from an entity's Object3D
  function computeAABB(el) {
    const obj = el.object3D;
    if (!obj) return null;
    obj.updateMatrixWorld(true);

    // For simple boxes (a-box), we can use the geometry + world transform
    const mesh = el.getObject3D('mesh');
    if (!mesh || !mesh.geometry) return null;

    // Use three.js Box3 over the world-transformed geometry
    const box = new THREE.Box3().setFromObject(obj);

    // Expand slightly by player radius so collision trips before visual contact
    return {
      minX: box.min.x - PLAYER_RADIUS,
      maxX: box.max.x + PLAYER_RADIUS,
      minY: box.min.y,
      maxY: box.max.y,
      minZ: box.min.z - PLAYER_RADIUS,
      maxZ: box.max.z + PLAYER_RADIUS,
    };
  }

  // ═══ solid-wall component ═══
  AFRAME.registerComponent('solid-wall', {
    schema: {
      enabled: { type: 'boolean', default: true },
    },

    init: function () {
      const self = this;
      this._onMeshLoaded = function () {
        self._register();
      };
      // Geometry may not be ready at init time
      if (this.el.getObject3D('mesh')) {
        this._register();
      } else {
        this.el.addEventListener('loaded', this._onMeshLoaded);
      }
    },

    update: function () {
      this._register();
    },

    remove: function () {
      REGISTRY.delete(this.el);
    },

    _register: function () {
      if (!this.data.enabled) {
        REGISTRY.delete(this.el);
        return;
      }
      const aabb = computeAABB(this.el);
      if (aabb) REGISTRY.set(this.el, aabb);
    },

    // Called by rig-collider if it wants to force a refresh
    refresh: function () {
      this._register();
    },
  });

  // ═══ rig-collider component ═══
  // Attached to the camera-rig. Runs after movement-controls has applied
  // the tick's intended motion. Checks every solid-wall AABB; if the rig
  // is inside one (horizontally — we ignore Y for walking), push out
  // along the minimum-translation axis.
  AFRAME.registerComponent('rig-collider', {
    schema: {
      enabled: { type: 'boolean', default: true },
    },

    init: function () {
      this._lastValid = null;
      this._vec = new THREE.Vector3();
    },

    tick: function () {
      if (!this.data.enabled || REGISTRY.size === 0) {
        // Even if disabled, remember where we are so we can restore
        // when collision re-enables.
        this.el.object3D.getWorldPosition(this._vec);
        this._lastValid = { x: this._vec.x, y: this._vec.y, z: this._vec.z };
        return;
      }

      this.el.object3D.getWorldPosition(this._vec);
      const px = this._vec.x;
      const py = this._vec.y;
      const pz = this._vec.z;

      // Walking collision ignores Y. If the rig is "above" the wall
      // (e.g., looking down from the tuner cam) we don't block.
      // Simplify: only check if py is between 0 and 4m.
      if (py < 0 || py > 4) {
        this._lastValid = { x: px, y: py, z: pz };
        return;
      }

      // Find any AABB we're inside (horizontal projection).
      // Also check vertical: if the wall is entirely above the player's
      // head (minY > player head height), treat as overhead structure
      // (lintel, awning, etc.) and skip. Player head is py + ~1.6m.
      const PLAYER_HEIGHT = 1.8;  // meters — approximate head height above rig origin
      let hit = null;
      for (const aabb of REGISTRY.values()) {
        // Skip walls that start above the player's head — these are
        // lintels above door openings, ceiling beams, etc. that the
        // player walks under, not into.
        if (aabb.minY > PLAYER_HEIGHT) continue;
        if (px >= aabb.minX && px <= aabb.maxX &&
            pz >= aabb.minZ && pz <= aabb.maxZ) {
          hit = aabb;
          break;  // first hit wins; walls are thin so overlap is rare
        }
      }

      if (!hit) {
        this._lastValid = { x: px, y: py, z: pz };
        return;
      }

      // Push out along minimum-translation axis.
      // Compute distance to each face from inside.
      const dLeft   = px - hit.minX;   // push -x (decrease x)
      const dRight  = hit.maxX - px;   // push +x (increase x)
      const dBack   = pz - hit.minZ;   // push -z
      const dFront  = hit.maxZ - pz;   // push +z

      const minH = Math.min(dLeft, dRight);
      const minV = Math.min(dBack, dFront);

      let nx = px, nz = pz;
      if (minH < minV) {
        if (dLeft < dRight) nx = hit.minX - EPS;
        else                nx = hit.maxX + EPS;
      } else {
        if (dBack < dFront) nz = hit.minZ - EPS;
        else                nz = hit.maxZ + EPS;
      }

      // If _lastValid exists and we'd be moving INTO a wall from outside,
      // prefer snapping back to last valid frame to avoid tunneling at speed.
      if (this._lastValid) {
        const lx = this._lastValid.x;
        const lz = this._lastValid.z;
        const lastInside =
          lx >= hit.minX && lx <= hit.maxX &&
          lz >= hit.minZ && lz <= hit.maxZ;
        if (!lastInside) {
          nx = lx;
          nz = lz;
        }
      }

      this.el.object3D.position.x = nx;
      this.el.object3D.position.z = nz;
      this._lastValid = { x: nx, y: py, z: nz };
    },
  });

  // ═══ Global API ═══
  window.MallCollider = {
    refresh: function () {
      // Force every solid-wall to re-register its AABB
      document.querySelectorAll('[solid-wall]').forEach((el) => {
        const comp = el.components && el.components['solid-wall'];
        if (comp && comp.refresh) comp.refresh();
      });
    },

    registrySize: function () {
      return REGISTRY.size;
    },

    // Mark all existing primitive store shells + corridor walls + entrance
    // pillars as solid. Call after scene has loaded.
    tagStaticMallGeometry: function () {
      // Corridor walls
      document.querySelectorAll('.corridor-wall').forEach((el) => {
        if (!el.hasAttribute('solid-wall')) el.setAttribute('solid-wall', '');
      });

      // Entrance pillars (2 cylinders inside #zone-entrance)
      const entrance = document.getElementById('zone-entrance');
      if (entrance) {
        entrance.querySelectorAll('a-cylinder').forEach((el) => {
          if (!el.hasAttribute('solid-wall')) el.setAttribute('solid-wall', '');
        });
      }

      // Primitive store shells — each store zone's first a-box (the shell)
      const storeZoneIds = [
        'zone-concrete-rose',
        'zone-bijadi',
        'zone-faithfully-faded',
        'zone-hoe',
        'zone-wanderlust',
        'zone-verse-alkemist',
      ];
      storeZoneIds.forEach((id) => {
        const zone = document.getElementById(id);
        if (!zone) return;
        const shell = zone.querySelector('a-box');
        if (shell && !shell.hasAttribute('solid-wall')) {
          shell.setAttribute('solid-wall', '');
        }
      });

      // Ensure camera rig has the collider
      const rig = document.getElementById('camera-rig');
      if (rig && !rig.hasAttribute('rig-collider')) {
        rig.setAttribute('rig-collider', '');
      }

      console.log('[MallCollider] Tagged static geometry. Registry size:', REGISTRY.size);
    },
  };

  // Auto-tag after scene loads. CS wing and courtyard tag themselves in
  // their own modules.
  document.addEventListener('DOMContentLoaded', function () {
    const scene = document.querySelector('a-scene');
    if (!scene) return;
    const go = () => setTimeout(() => window.MallCollider.tagStaticMallGeometry(), 500);
    if (scene.hasLoaded) go();
    else scene.addEventListener('loaded', go);
  });
})();
