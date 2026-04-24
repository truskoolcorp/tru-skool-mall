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
    xMin: -14,    // Inside left corridor wall (wall at x=-15)
    xMax: 41.5,   // Inside CS wing's east edge (wing xMax=41.7, leaves 0.2m buffer)
    zMin: -50.8,  // Inside CS wing's south edge (Culinary zMin=-51, leaves buffer)
    zMax: 18,     // Past the plaza courtyard (extends to z=+18)
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

  // ─── Tank-style rig controls ──────────────────────────────────────────
  // W/S (or ↑/↓) walk forward/back along the camera's facing direction.
  // A/D (or ←/→) rotate the rig in place (yaw) instead of side-stepping.
  //
  // Mouse drag still available via look-controls on the camera for
  // pitch and free-look. This component only drives the RIG (body),
  // not the camera's look direction — they combine naturally because
  // the rig's yaw rotates the camera that's parented to it.
  //
  // Why custom instead of movement-controls' strafe: walking a narrow
  // indoor space with strafe feels awkward — players press left and
  // slide sideways instead of turning to look where they're going.
  // Tank-style matches how real hallway walkthroughs read.
  AFRAME.registerComponent('tank-controls', {
    schema: {
      walkSpeed: { default: 3.0 },     // m/sec forward/back
      turnSpeed: { default: 1.8 },     // rad/sec yaw
      enabled:   { default: true },
    },

    init: function () {
      this.keys = Object.create(null);
      this._onKeyDown = this._onKeyDown.bind(this);
      this._onKeyUp   = this._onKeyUp.bind(this);
      window.addEventListener('keydown', this._onKeyDown);
      window.addEventListener('keyup',   this._onKeyUp);
      window.addEventListener('blur', () => { this.keys = Object.create(null); });
      this._forward = new THREE.Vector3();

      var rig = this.el.object3D;

      // Deterministic spawn: position (0, 0, 0) facing -Z (north, into the
      // mall toward the CS wing entry at z=-18). Overrides any stale state
      // from a previous movement-controls install or reload.
      rig.position.set(0, 0, 0);
      rig.rotation.set(0, 0, 0);

      // Reset camera's local rotation too — look-controls is disabled but
      // may have left a non-zero rotation in the camera object3D.
      var cam = this.el.querySelector('[camera]');
      if (cam) cam.object3D.rotation.set(0, 0, 0);

      console.log('[TankControls] active — W/S walk, A/D turn. Spawn:',
        rig.position.x.toFixed(2), rig.position.y.toFixed(2), rig.position.z.toFixed(2),
        'yaw:', (rig.rotation.y * 180 / Math.PI).toFixed(1) + '°');
    },

    remove: function () {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup',   this._onKeyUp);
    },

    _onKeyDown: function (e) {
      // Ignore if user is typing into a chat/input
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
      this.keys[e.code] = true;
    },

    _onKeyUp: function (e) {
      this.keys[e.code] = false;
    },

    tick: function (time, delta) {
      if (!this.data.enabled) return;
      var dt = delta / 1000;
      if (dt > 0.1) dt = 0.1;   // cap timestep after tab-switch etc.

      var k = this.keys;
      var turn = 0;
      var walk = 0;
      if (k.KeyA || k.ArrowLeft)  turn += 1;   // left = CCW (positive yaw in A-Frame)
      if (k.KeyD || k.ArrowRight) turn -= 1;
      if (k.KeyW || k.ArrowUp)    walk += 1;
      if (k.KeyS || k.ArrowDown)  walk -= 1;

      var rig = this.el.object3D;

      // Rotate rig in place
      if (turn !== 0) {
        rig.rotation.y += turn * this.data.turnSpeed * dt;
      }

      // Walk along rig's current forward vector.
      // Rig has rotation.y; forward in its local frame is -Z (A-Frame
      // convention: camera looks down -Z). Apply yaw to get world forward.
      if (walk !== 0) {
        var yaw = rig.rotation.y;
        var fx = -Math.sin(yaw);
        var fz = -Math.cos(yaw);
        var step = walk * this.data.walkSpeed * dt;
        rig.position.x += fx * step;
        rig.position.z += fz * step;
      }
    },
  });
})();
