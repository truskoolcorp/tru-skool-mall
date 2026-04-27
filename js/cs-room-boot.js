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
    // Build a real architectural door: deep recessed jamb showing
    // wall thickness, a paneled wooden door (rails + stiles + 4
    // recessed panels), brass doorknob + kickplate, warm corridor
    // light visible beyond through the doorway.
    //
    // Layout (cross-section, looking down):
    //
    //     INSIDE ROOM   ←→   DOORWAY   ←→   OUTSIDE
    //     z=halfD-0.5       z=halfD          z=halfD+0.6
    //     |                                  |
    //     | jamb-inside     wood door        backdrop (warm corridor)
    //     | (brass casing)  (paneled)
    //
    // The door is slightly inset from the south wall so you can see
    // the jamb depth as you approach. Walking south through the
    // gap triggers cs-boundary's exitZ → redirect to mall foyer.
    const t_door = t.accent;        // brass for hardware/casing
    const woodDark = '#2a1810';     // door body (deep walnut)
    const woodMid  = '#3a2614';     // panel insets (slightly lighter)

    // 1. CORRIDOR BACKDROP — warm-lit space VISIBLE beyond the door.
    //    Sits 0.6m outside the south wall. With wood door geometry
    //    in front, what you see through the doorway is the soft
    //    glow of the corridor — sells the illusion of "real exit
    //    leading somewhere".
    const corridorGlow = document.createElement('a-plane');
    corridorGlow.setAttribute('id', 'corridor-glow');
    corridorGlow.setAttribute('position', `0 ${doorH / 2} ${halfD + 0.6}`);
    corridorGlow.setAttribute('rotation', '0 0 0');
    corridorGlow.setAttribute('width', doorW + 0.4);
    corridorGlow.setAttribute('height', doorH + 0.2);
    corridorGlow.setAttribute('color', '#5a3818');     // warm corridor amber
    corridorGlow.setAttribute('side', 'double');
    corridorGlow.setAttribute('material', 'shader: flat; emissive: #5a3818; emissiveIntensity: 0.6');
    scene.appendChild(corridorGlow);

    // Add a single warm point light just outside the doorway so
    // light spills into the room from the corridor — adds depth.
    const corridorLight = document.createElement('a-light');
    corridorLight.setAttribute('type', 'point');
    corridorLight.setAttribute('position', `0 ${doorH / 2} ${halfD + 0.4}`);
    corridorLight.setAttribute('color', '#ff9a4a');
    corridorLight.setAttribute('intensity', 2.5);
    corridorLight.setAttribute('distance', 4);
    corridorLight.setAttribute('decay', 1.5);
    scene.appendChild(corridorLight);

    // 2. JAMB (door casing) — recessed brass-trimmed frame around
    //    the opening, INSIDE the room. Three pieces: head jamb (top)
    //    + 2 side jambs. ~10cm deep so you see the wall thickness
    //    when approaching the door.
    const jambDepth = 0.20;        // depth of jamb (wall thickness)
    const jambThick = 0.10;        // 10cm casing band
    const jambZ = halfD - jambDepth / 2;

    // Head jamb (top of doorway)
    const jambTop = document.createElement('a-box');
    jambTop.setAttribute('id', 'jamb-top');
    jambTop.setAttribute('position', `0 ${doorH + jambThick / 2} ${jambZ}`);
    jambTop.setAttribute('width', doorW + jambThick * 2);
    jambTop.setAttribute('height', jambThick);
    jambTop.setAttribute('depth', jambDepth);
    jambTop.setAttribute('color', t_door);
    jambTop.setAttribute('material', 'shader: standard; metalness: 0.7; roughness: 0.3');
    scene.appendChild(jambTop);

    // Left side jamb
    const jambLeft = document.createElement('a-box');
    jambLeft.setAttribute('id', 'jamb-left');
    jambLeft.setAttribute('position', `${-doorW / 2 - jambThick / 2} ${doorH / 2} ${jambZ}`);
    jambLeft.setAttribute('width', jambThick);
    jambLeft.setAttribute('height', doorH + jambThick);  // overlap with head
    jambLeft.setAttribute('depth', jambDepth);
    jambLeft.setAttribute('color', t_door);
    jambLeft.setAttribute('material', 'shader: standard; metalness: 0.7; roughness: 0.3');
    scene.appendChild(jambLeft);

    // Right side jamb
    const jambRight = document.createElement('a-box');
    jambRight.setAttribute('id', 'jamb-right');
    jambRight.setAttribute('position', `${doorW / 2 + jambThick / 2} ${doorH / 2} ${jambZ}`);
    jambRight.setAttribute('width', jambThick);
    jambRight.setAttribute('height', doorH + jambThick);
    jambRight.setAttribute('depth', jambDepth);
    jambRight.setAttribute('color', t_door);
    jambRight.setAttribute('material', 'shader: standard; metalness: 0.7; roughness: 0.3');
    scene.appendChild(jambRight);

    // 3. WOODEN DOOR — actual paneled door, hung in the jamb but
    //    set slightly ajar (rotated 25° on its left hinge) so the
    //    corridor glow spills through the gap. Sells "this opens".
    //
    //    Door body is a thin slab; on top of it we mount 4 panel
    //    insets (slightly proud) using woodMid to suggest classic
    //    raised-panel construction. Brass doorknob on the right.
    const doorPivot = document.createElement('a-entity');
    doorPivot.setAttribute('id', 'door-pivot');
    // Hinge along left edge: pivot at x = -doorW/2, z = halfD - 0.05
    // Door swings open INWARD (-Z direction = into the room)
    doorPivot.setAttribute('position', `${-doorW / 2} 0 ${halfD - 0.05}`);
    doorPivot.setAttribute('rotation', '0 25 0');  // 25° ajar
    scene.appendChild(doorPivot);

    // Door slab — child of pivot, offset so its left edge is at pivot
    const doorSlab = document.createElement('a-box');
    doorSlab.setAttribute('position', `${doorW / 2} ${doorH / 2} 0`);
    doorSlab.setAttribute('width', doorW - 0.04);
    doorSlab.setAttribute('height', doorH - 0.04);
    doorSlab.setAttribute('depth', 0.05);
    doorSlab.setAttribute('color', woodDark);
    doorSlab.setAttribute('material', 'shader: standard; metalness: 0.1; roughness: 0.7');
    doorPivot.appendChild(doorSlab);

    // 4 paneled insets (2x2 grid on the door face). Each panel is
    // a thin box mounted slightly proud of the door slab.
    const panelMargin = 0.10;       // gap from door edges
    const railHeight  = 0.08;       // horizontal rail dividing top/bottom panels
    const stileWidth  = 0.06;       // vertical stile dividing L/R panels
    const panelW = (doorW - 0.04 - panelMargin * 2 - stileWidth) / 2;
    const panelH = (doorH - 0.04 - panelMargin * 2 - railHeight) / 2;
    const panelZ = 0.028;           // proud of slab face (front side)

    [
      { x: -(panelW + stileWidth) / 2, y: doorH / 2 + (panelH + railHeight) / 2 },  // top-left
      { x:  (panelW + stileWidth) / 2, y: doorH / 2 + (panelH + railHeight) / 2 },  // top-right
      { x: -(panelW + stileWidth) / 2, y: doorH / 2 - (panelH + railHeight) / 2 },  // bottom-left
      { x:  (panelW + stileWidth) / 2, y: doorH / 2 - (panelH + railHeight) / 2 },  // bottom-right
    ].forEach((p, i) => {
      const panel = document.createElement('a-box');
      panel.setAttribute('position', `${doorW / 2 + p.x} ${p.y} ${panelZ}`);
      panel.setAttribute('width', panelW);
      panel.setAttribute('height', panelH);
      panel.setAttribute('depth', 0.012);
      panel.setAttribute('color', woodMid);
      panel.setAttribute('material', 'shader: standard; metalness: 0.1; roughness: 0.65');
      doorPivot.appendChild(panel);
    });

    // Brass doorknob — sphere on the right side of the door,
    // about waist-height (1.0m).
    const knob = document.createElement('a-sphere');
    knob.setAttribute('position', `${doorW - 0.15} 1.0 0.04`);
    knob.setAttribute('radius', 0.04);
    knob.setAttribute('color', t_door);
    knob.setAttribute('material', 'shader: standard; metalness: 0.9; roughness: 0.2');
    doorPivot.appendChild(knob);

    // Knob backplate (small disc behind the knob)
    const knobPlate = document.createElement('a-cylinder');
    knobPlate.setAttribute('position', `${doorW - 0.15} 1.0 0.025`);
    knobPlate.setAttribute('rotation', '90 0 0');
    knobPlate.setAttribute('radius', 0.06);
    knobPlate.setAttribute('height', 0.005);
    knobPlate.setAttribute('color', t_door);
    knobPlate.setAttribute('material', 'shader: standard; metalness: 0.9; roughness: 0.2');
    doorPivot.appendChild(knobPlate);

    // Brass kickplate at bottom of door
    const kickplate = document.createElement('a-box');
    kickplate.setAttribute('position', `${doorW / 2} 0.18 0.027`);
    kickplate.setAttribute('width', doorW - 0.10);
    kickplate.setAttribute('height', 0.20);
    kickplate.setAttribute('depth', 0.008);
    kickplate.setAttribute('color', t_door);
    kickplate.setAttribute('material', 'shader: standard; metalness: 0.9; roughness: 0.25');
    doorPivot.appendChild(kickplate);

    // 4. EXIT label above the doorway, faces room interior
    const exitLabel = document.createElement('a-text');
    exitLabel.setAttribute('value', 'EXIT');
    exitLabel.setAttribute('align', 'center');
    exitLabel.setAttribute('color', t_door);
    exitLabel.setAttribute('width', 3);
    exitLabel.setAttribute('position', `0 ${doorH + jambThick + 0.30} ${halfD - 0.03}`);
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
    // tank-controls' init zeroes rig.position and rig.rotation in
    // its init handler. Default rig rotation y=0 means forward (-Z)
    // points NORTH = toward the bar at z=-1.3. That's what we want.
    //
    // We just need to re-apply our spawn POSITION after tank-controls'
    // init zeroes it. Rotation stays at 0 → facing the bar.
    requestAnimationFrame(() => {
      rig.object3D.position.set(spawnX, spawnY, spawnZ);
      rig.object3D.rotation.set(0, 0, 0);
      console.log(`[CSRoom] respawned rig at (${spawnX}, ${spawnY}, ${spawnZ}) facing -Z (bar)`);
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
