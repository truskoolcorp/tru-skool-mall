/* ═══════════════════════════════════════════════════════════════
   CS-Room — shared per-room scene boot

   Builds a self-contained Café Sativa room scene from a config
   object. Used by cs-bar.html, cs-main-lounge.html, etc. to share
   identical room geometry, lighting, and prop-loading logic.

   COORDINATE SYSTEM
   Each per-room scene uses a LOCAL coordinate system centered at
   the origin (NOT the wing's negative-z coords from the unified
   mall). Player spawns at (0, 1.6, +halfDepth - 1) facing south
   (negative Z), walks IN to explore.

       Z+ ─── entrance wall (door behind player at spawn)
       │
       │     ┌─────────────────────┐  +halfWidth
       │     │                     │
       │     │     ROOM CENTER     │
       │     │       (0, 0)        │
       │     │                     │
       │     └─────────────────────┘  -halfWidth
       │
       Z- ─── far wall

   USAGE (in cs-bar.html, etc.)

     <body>
       <a-scene id="room-scene" ...></a-scene>
       <script src="js/cs-room-boot.js"></script>
       <script>
         CSRoom.boot({
           id: 'bar',
           name: 'Cocktail Bar',
           tagline: 'Liquid Artistry, Reimagined',
           width: 10, depth: 8, height: 4.5,
           theme: {
             wall: '#1a1410',           // dark walnut
             floor: '#0f0a06',          // near-black wood
             ceiling: '#0a0805',
             accent: '#c9a84c',         // brass gold
             ambient: '#3a2e1a',        // warm room glow
           },
         });
       </script>

   WHAT BOOT DOES
     1. Reads room config + theme
     2. Procedurally generates floor, ceiling, 4 walls
     3. Adds entrance archway (south wall) + back-to-mall portal
     4. Adds room lighting (ambient + accent spotlights)
     5. Loads props from window.CS_ROOM_PROPS[config.id] via the
        prop loader from cafe-sativa-props.js (same tuner system)
     6. Sets up player spawn, movement controls, collision boundary
   ═══════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const CSRoom = {};

  /**
   * Build a room scene from config.
   * Must be called after a-scene element exists in the DOM.
   */
  CSRoom.boot = function (config) {
    if (!config || !config.id) {
      console.error('[CSRoom] boot() requires { id, ... } config');
      return;
    }

    // Sensible defaults
    const cfg = Object.assign({
      width: 10,
      depth: 8,
      height: 4.5,
      theme: {
        wall: '#1a1410',
        floor: '#0f0a06',
        ceiling: '#0a0805',
        accent: '#c9a84c',
        ambient: '#3a2e1a',
      },
      backUrl: 'index.html',
    }, config);

    // Wait for scene + dependencies
    const scene = document.querySelector('a-scene');
    if (!scene) {
      console.error('[CSRoom] no <a-scene> in DOM');
      return;
    }

    if (scene.hasLoaded) {
      buildRoom(cfg);
    } else {
      scene.addEventListener('loaded', () => buildRoom(cfg));
    }
  };

  function buildRoom(cfg) {
    console.log('[CSRoom] building room:', cfg.id, '—', cfg.name);

    const scene = document.querySelector('a-scene');
    const halfW = cfg.width / 2;
    const halfD = cfg.depth / 2;
    const h = cfg.height;
    const t = cfg.theme;

    // ─── ENVIRONMENT ────────────────────────────────────────────
    // Solid background color set on <a-scene> via the `background`
    // attribute is enough — no need for a-sky which can occlude
    // interior geometry on some renderers.
    // Fog removed: it was hiding the back wall on dark interiors.

    // ─── ROOM SHELL ─────────────────────────────────────────────
    // Floor — slightly larger than room footprint to avoid edge
    // peek-through if the wall geometry is off by a hair.
    const floor = document.createElement('a-box');
    floor.setAttribute('id', 'floor');
    floor.setAttribute('position', '0 0 0');
    floor.setAttribute('width', cfg.width + 0.1);
    floor.setAttribute('height', 0.05);
    floor.setAttribute('depth', cfg.depth + 0.1);
    floor.setAttribute('color', t.floor);
    floor.setAttribute('shadow', 'receive: true');
    scene.appendChild(floor);

    // Ceiling
    const ceil = document.createElement('a-box');
    ceil.setAttribute('id', 'ceiling');
    ceil.setAttribute('position', `0 ${h} 0`);
    ceil.setAttribute('width', cfg.width + 0.1);
    ceil.setAttribute('height', 0.05);
    ceil.setAttribute('depth', cfg.depth + 0.1);
    ceil.setAttribute('color', t.ceiling);
    scene.appendChild(ceil);

    // Walls (single helper, 4 calls)
    addWall(scene, 'wall-north', `0 ${h / 2} ${-halfD}`,    cfg.width, h, '0 0 0',     t.wall);
    addWall(scene, 'wall-east',  `${halfW} ${h / 2} 0`,     cfg.depth, h, '0 -90 0',   t.wall);
    addWall(scene, 'wall-west',  `${-halfW} ${h / 2} 0`,    cfg.depth, h, '0 90 0',    t.wall);

    // South wall (entrance side) — split into 3 pieces to leave
    // a doorway gap in the middle for the back-to-mall portal.
    const doorW = 1.6;
    const doorH = 2.4;
    const sideW = (cfg.width - doorW) / 2;
    addWall(scene, 'wall-south-l', `${-(halfW - sideW / 2)} ${h / 2} ${halfD}`, sideW, h,        '0 180 0', t.wall);
    addWall(scene, 'wall-south-r', `${ halfW - sideW / 2}   ${h / 2} ${halfD}`, sideW, h,        '0 180 0', t.wall);
    addWall(scene, 'wall-south-t', `0 ${h - (h - doorH) / 2} ${halfD}`,         doorW, h - doorH,'0 180 0', t.wall);

    // ─── DOORWAY ────────────────────────────────────────────────
    // Three pieces make the door GAP read as a real door from inside:
    //
    //   1. Backdrop plane BEHIND the gap (outside the room).
    //      Without this, the gap shows pure void/black, which looks
    //      identical to a dark wall. The backdrop gives "looking
    //      into a lit hallway" depth cue.
    //
    //   2. Glow accent plane INSIDE the gap. Brighter opacity so
    //      it clearly reads as a portal, not a smudge.
    //
    //   3. Brass frame around the opening + EXIT label centered
    //      above. Together they signal "this is the way out."
    //
    // The actual exit interaction is handled by cs-boundary's
    // exitZ trigger — walking through this gap auto-redirects.

    // 1. Backdrop — sits 1.5m OUTSIDE the south wall, painted in a
    //    warm corridor color so the doorway reads as lit space
    //    beyond, not void.
    const doorBackdrop = document.createElement('a-plane');
    doorBackdrop.setAttribute('id', 'door-backdrop');
    doorBackdrop.setAttribute('position', `0 ${doorH / 2} ${halfD + 1.5}`);
    doorBackdrop.setAttribute('rotation', '0 0 0'); // faces -Z (into the room)
    doorBackdrop.setAttribute('width', doorW + 1);
    doorBackdrop.setAttribute('height', doorH);
    doorBackdrop.setAttribute('color', '#3a2614'); // warm corridor brown
    doorBackdrop.setAttribute('side', 'double');
    scene.appendChild(doorBackdrop);

    // 2. Glow panel inside the doorway — bright enough to clearly
    //    pop as the focal exit, faces inward.
    const portalIn = document.createElement('a-plane');
    portalIn.setAttribute('id', 'door-glow-inside');
    portalIn.setAttribute('position', `0 ${doorH / 2} ${halfD - 0.04}`);
    portalIn.setAttribute('rotation', '0 180 0');
    portalIn.setAttribute('width', doorW - 0.05);
    portalIn.setAttribute('height', doorH - 0.05);
    portalIn.setAttribute('color', t.accent);
    portalIn.setAttribute('opacity', 0.35);
    portalIn.setAttribute('side', 'front');
    portalIn.setAttribute('material', 'shader: flat; transparent: true');
    scene.appendChild(portalIn);

    // 3a. Brass frame around the opening — top + 2 sides, ~5cm thick.
    //     Positions follow the doorway boundary in the south wall.
    const frameThickness = 0.06;
    const frameZ = halfD - 0.02; // slightly inside south wall

    // Top of frame (just above door opening)
    const frameTop = document.createElement('a-box');
    frameTop.setAttribute('position', `0 ${doorH + frameThickness / 2} ${frameZ}`);
    frameTop.setAttribute('width', doorW + frameThickness * 2);
    frameTop.setAttribute('height', frameThickness);
    frameTop.setAttribute('depth', 0.05);
    frameTop.setAttribute('color', t.accent);
    scene.appendChild(frameTop);

    // Left side of frame
    const frameLeft = document.createElement('a-box');
    frameLeft.setAttribute('position', `${-doorW / 2 - frameThickness / 2} ${doorH / 2} ${frameZ}`);
    frameLeft.setAttribute('width', frameThickness);
    frameLeft.setAttribute('height', doorH);
    frameLeft.setAttribute('depth', 0.05);
    frameLeft.setAttribute('color', t.accent);
    scene.appendChild(frameLeft);

    // Right side of frame
    const frameRight = document.createElement('a-box');
    frameRight.setAttribute('position', `${doorW / 2 + frameThickness / 2} ${doorH / 2} ${frameZ}`);
    frameRight.setAttribute('width', frameThickness);
    frameRight.setAttribute('height', doorH);
    frameRight.setAttribute('depth', 0.05);
    frameRight.setAttribute('color', t.accent);
    scene.appendChild(frameRight);

    // 3b. "EXIT ←" label above the door, faces the room interior
    const exitLabel = document.createElement('a-text');
    exitLabel.setAttribute('value', '← EXIT');
    exitLabel.setAttribute('align', 'center');
    exitLabel.setAttribute('color', t.accent);
    exitLabel.setAttribute('width', 4);
    exitLabel.setAttribute('position', `0 ${doorH + 0.35} ${halfD - 0.03}`);
    exitLabel.setAttribute('rotation', '0 180 0');
    exitLabel.setAttribute('side', 'front');
    exitLabel.setAttribute('material', 'shader: flat');
    scene.appendChild(exitLabel);

    // ─── LIGHTING ───────────────────────────────────────────────
    // Three.js r155+ uses physically-based lighting by default
    // (when colorManagement: true). Light intensity values now
    // expect candela-style numbers — roughly 5-10x higher than
    // legacy mode. With low values everything renders near-black.
    //
    // Reference: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733
    //
    // Key insight: PBR materials in optimized GLBs reflect light
    // multiplicatively. A dark walnut counter reflects ~10% of
    // incoming light, so to look "lit" it needs ~10x more light
    // than a white-painted wall would.

    // Ambient — neutral white at high intensity. This is what
    // makes walls and props visible at all.
    const ambient = document.createElement('a-light');
    ambient.setAttribute('type', 'ambient');
    ambient.setAttribute('color', '#ffffff');
    ambient.setAttribute('intensity', 3.5);
    scene.appendChild(ambient);

    // Directional — sun-like for proper shading on prop surfaces.
    // Without this, props look flat-shaded blob-like.
    const dir = document.createElement('a-light');
    dir.setAttribute('type', 'directional');
    dir.setAttribute('color', '#ffffff');
    dir.setAttribute('intensity', 2.5);
    dir.setAttribute('position', `2 ${h} 2`);
    scene.appendChild(dir);

    // Center point — warm color accent over focal area
    const spot = document.createElement('a-light');
    spot.setAttribute('type', 'point');
    spot.setAttribute('color', t.accent);
    spot.setAttribute('intensity', 8);
    spot.setAttribute('distance', Math.max(cfg.width, cfg.depth) * 1.5);
    spot.setAttribute('decay', 1);
    spot.setAttribute('position', `0 ${h - 0.5} 0`);
    scene.appendChild(spot);

    // ─── PROPS ──────────────────────────────────────────────────
    // Loaded via the per-room catalog (js/cs-room-props.js).
    // Each prop's instances spec uses LOCAL coordinates — for
    // per-room scenes, we use room-local coords, not the unified
    // wing's coords. Re-tune via ?prop-tune=<roomId>.
    if (window.CS_ROOM_PROPS && window.CS_ROOM_PROPS[cfg.id]) {
      loadProps(scene, cfg.id);
    } else {
      console.warn('[CSRoom] no props in catalog for', cfg.id);
    }

    // ─── COMPOSITION (Base44-style atmospheric decor) ───────────
    // Each composition entry adds carefully-arranged primitive
    // geometry (bottle walls, pendant arrays, baseboards, candles,
    // etc.) to make the room feel like a real interior space.
    // Handled by js/cs-room-decor.js — see CSDecor.build for the
    // full handler list.
    //
    // Order matters: baseboards/wainscoting go before bottles, so
    // bottles sit visually on top. Iterate the composition as authored.
    if (cfg.composition && Array.isArray(cfg.composition)) {
      if (window.CSDecor && typeof window.CSDecor.build === 'function') {
        cfg.composition.forEach((item) => CSDecor.build(scene, item, cfg));
        console.log(`[CSRoom] composition built: ${cfg.composition.length} items`);
      } else {
        console.warn('[CSRoom] composition specified but CSDecor not loaded');
      }
    }

    // ─── PLAYER ─────────────────────────────────────────────────
    // Spawn near the south door, looking north (-Z) into the room.
    //
    // Important: rig rotation alone does NOT control camera direction
    // — look-controls overrides per frame. We use the rig's rotation
    // for movement direction and apply an initial yaw to the camera's
    // look-controls via its `pitchObject` / `yawObject` post-attach.
    const spawnX = 0;
    const spawnY = 1.6;
    const spawnZ = halfD - 1.2;
    console.log(`[CSRoom] player spawn: (${spawnX}, ${spawnY}, ${spawnZ}), facing -Z (north)`);
    console.log(`[CSRoom] room bounds: x[${-halfW}..${halfW}] y[0..${h}] z[${-halfD}..${halfD}]`);

    const rig = document.createElement('a-entity');
    rig.setAttribute('id', 'player-rig');
    rig.setAttribute('position', `${spawnX} ${spawnY} ${spawnZ}`);

    // ─── NAVIGATION ─────────────────────────────────────────────
    // Use the SAME tank-controls component the foyer/main mall uses
    // (registered globally in js/mall-nav.js). W/S walks forward in
    // look-direction; A/D rotates the rig in place — NOT strafe.
    // This is what makes the per-room nav feel identical to the rest
    // of the mall.
    //
    // IMPORTANT: js/mall-nav.js MUST be loaded in every cs-*.html
    // scene before this boot runs, or tank-controls won't exist as
    // a component.
    if (AFRAME.components['tank-controls']) {
      rig.setAttribute('tank-controls', 'walkSpeed: 3.0; turnSpeed: 1.8');
    } else {
      console.warn('[CSRoom] tank-controls not registered — falling back to movement-controls. Did you load js/mall-nav.js?');
      rig.setAttribute('movement-controls', 'fly: false; constrainToNavMesh: false; speed: 0.18');
    }

    const cam = document.createElement('a-entity');
    cam.setAttribute('camera', '');
    cam.setAttribute('position', '0 0 0');
    // look-controls handles mouse-drag for free-look (pitch + yaw of
    // the camera itself). tank-controls drives the rig body. They
    // compose: rig yaw + camera local yaw = world look direction.
    cam.setAttribute('look-controls', 'pointerLockEnabled: false; touchEnabled: true');
    cam.setAttribute('cursor', 'rayOrigin: mouse; fuse: false');
    cam.setAttribute('raycaster', 'objects: .clickable; far: 20');
    rig.appendChild(cam);

    scene.appendChild(rig);

    // ─── SPAWN FACING ───────────────────────────────────────────
    // tank-controls' init resets rig.position and rig.rotation to
    // (0,0,0). We need to:
    //   1. Re-apply our spawn position (was set above, but tank-controls
    //      ran AFTER setAttribute and zeroed it)
    //   2. Rotate rig 180° on Y so its forward (-Z) points -Z = into
    //      the room (toward the bar at z=-1.3), not toward the door
    //      at z=+halfD.
    //
    // We do this in requestAnimationFrame so it runs AFTER tank-controls'
    // init (which fires synchronously during setAttribute).
    requestAnimationFrame(() => {
      rig.object3D.position.set(spawnX, spawnY, spawnZ);
      rig.object3D.rotation.y = Math.PI; // face -Z (into the room)
      console.log(`[CSRoom] respawned rig at (${spawnX}, ${spawnY}, ${spawnZ}) facing -Z`);
    });

    // Boundary clamp + door auto-transition.
    //
    // Two responsibilities:
    //  1. Clamp player to room bounds on east/west/north walls
    //  2. If player crosses the SOUTH boundary (where the door is),
    //     auto-redirect to the main mall instead of letting them
    //     walk into the void.
    //
    // Player radius 0.3m matches the foyer's PLAYER_RADIUS — wall
    // surface stops feel solid right at the visual contact point,
    // not 0.5m before like the previous overcautious buffer.
    const PR = 0.3;
    const exitUrl = cfg.backUrl || 'index.html';
    const boundStr =
      `minX: ${-halfW + PR}; ` +
      `maxX: ${ halfW - PR}; ` +
      `minZ: ${-halfD + PR}; ` +
      `exitZ: ${ halfD - PR}; ` +    // crossing this triggers exit
      `exitUrl: ${exitUrl}`;
    rig.setAttribute('cs-boundary', boundStr);
    console.log(`[CSRoom] boundary set: ${boundStr}`);

    console.log('[CSRoom] ✓ room built —', cfg.id);
  }

  // ─── HELPERS ──────────────────────────────────────────────────
  function addWall(scene, id, position, width, height, rotation, color) {
    const wall = document.createElement('a-plane');
    wall.setAttribute('id', id);
    wall.setAttribute('position', position);
    wall.setAttribute('rotation', rotation);
    wall.setAttribute('width', width);
    wall.setAttribute('height', height);
    wall.setAttribute('color', color);
    wall.setAttribute('side', 'double');
    wall.setAttribute('shadow', 'receive: true');
    scene.appendChild(wall);
  }

  function loadProps(scene, roomId) {
    const props = window.CS_ROOM_PROPS[roomId];
    let total = 0;
    props.forEach((prop, propIdx) => {
      prop.instances.forEach((spec, instIdx) => {
        const el = document.createElement('a-entity');
        el.setAttribute('id', `prop-${roomId}-${propIdx}-${instIdx}`);
        el.setAttribute('data-prop-room', roomId);
        el.setAttribute('data-prop-slot', `${propIdx}/${instIdx}`);
        el.setAttribute('data-prop-src', prop.src);
        el.setAttribute('gltf-model', prop.src);
        el.setAttribute('position', spec.pos);
        if (spec.rot)   el.setAttribute('rotation', spec.rot);
        if (spec.scale) el.setAttribute('scale', spec.scale);
        el.setAttribute('shadow', 'cast: true; receive: true');
        scene.appendChild(el);

        // After load: measure bbox + auto-snap to floor.
        // Many GLBs (especially Meshy outputs) have their geometric
        // origin at the model's CENTER rather than its base, which
        // means setting y=0 buries half the prop below the floor.
        // We measure the world-space bbox after load, then nudge the
        // entity up by `-bbox.min.y` so its bottom hits y=0 exactly.
        //
        // To DISABLE this auto-snap (e.g. for wall-mounted props that
        // should hover off the floor), set spec.snap = false.
        el.addEventListener('model-loaded', function onLoaded() {
          el.removeEventListener('model-loaded', onLoaded);
          try {
            const obj = el.getObject3D('mesh');
            if (!obj || !window.THREE) return;
            const box = new window.THREE.Box3().setFromObject(obj);
            const size = box.getSize(new window.THREE.Vector3());
            const fileName = prop.src.split('/').pop();

            // Auto-snap to floor unless disabled
            const snap = spec.snap !== false;
            if (snap) {
              const minY = box.min.y;
              const currentY = el.getAttribute('position').y;
              if (Math.abs(minY) > 0.01) {
                el.setAttribute('position', {
                  x: el.getAttribute('position').x,
                  y: currentY - minY,
                  z: el.getAttribute('position').z,
                });
                console.log(
                  `[CSRoom:snap] ${fileName} bbox.min.y=${minY.toFixed(2)} → ` +
                  `pos.y ${currentY.toFixed(2)} → ${(currentY - minY).toFixed(2)}`
                );
              }
            }

            console.log(
              `[CSRoom:bbox] ${fileName} @ scale=${spec.scale || '1 1 1'} → ` +
              `W=${size.x.toFixed(2)}m  H=${size.y.toFixed(2)}m  D=${size.z.toFixed(2)}m`
            );
          } catch (e) { /* ignore */ }
        });

        // Track for tuner
        if (!window.__CS_INSTANCES) window.__CS_INSTANCES = [];
        window.__CS_INSTANCES.push({
          roomId, slot: `${propIdx}/${instIdx}`, el, src: prop.src,
        });
        total++;
      });
    });
    console.log(`[CSRoom] loaded ${total} prop instances from ${props.length} prop types`);
  }

  // ─── BOUNDARY COMPONENT ──────────────────────────────────────
  // Clamps player to room bounds on east/west/north. Crossing the
  // south boundary (where the door is) triggers a redirect to the
  // mall, simulating "walking out through the door."
  //
  // Why redirect-on-cross instead of clamp-on-cross for the door?
  // The clamp would let player press into the door and bounce back,
  // which feels broken because the door is a clearly visible exit.
  // The redirect feels natural — you're leaving the room.
  if (window.AFRAME && !AFRAME.components['cs-boundary']) {
    AFRAME.registerComponent('cs-boundary', {
      schema: {
        minX:    { type: 'number', default: -10 },
        maxX:    { type: 'number', default:  10 },
        minZ:    { type: 'number', default: -10 },
        exitZ:   { type: 'number', default:  10 },  // crossing = exit
        exitUrl: { type: 'string', default: ''  },
      },
      tick: function () {
        const p = this.el.object3D.position;
        if (p.x < this.data.minX) p.x = this.data.minX;
        if (p.x > this.data.maxX) p.x = this.data.maxX;
        if (p.z < this.data.minZ) p.z = this.data.minZ;

        // Door exit trigger
        if (p.z > this.data.exitZ && this.data.exitUrl && !this._exiting) {
          this._exiting = true; // prevent multiple fires
          console.log('[CSRoom:exit] player walked through door — returning to mall');
          // Tiny delay so console message flushes before navigation
          setTimeout(() => { window.location.href = this.data.exitUrl; }, 50);
        }
      },
    });
  }

  global.CSRoom = CSRoom;
})(window);
