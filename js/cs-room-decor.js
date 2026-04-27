/* ═══════════════════════════════════════════════════════════════
   CS-Room Decor — composition helpers for atmospheric room scenes

   Builds Base44-quality interior compositions out of A-Frame
   primitives. Each helper takes a config and adds a carefully-
   arranged set of geometry to the scene.

   PHILOSOPHY
   We learned the hard way that single Meshy hero props in a flat-
   colored box make the room look like a Roblox demo. Real luxury
   interiors have:
     - Multiple small items arranged with intent (rows of bottles,
       lines of stools, candle clusters)
     - Architectural detail (baseboards, crown molding, wainscoting)
     - Multiple discrete light sources (pendants, candles, sconces)
       — not one big dome
     - Textured/composed wall surfaces, not flat colors

   This module gives the room boot an arsenal of helpers to build
   that out of A-Frame primitives (a-box, a-cylinder, a-plane, etc.)
   without depending on Meshy GLBs.

   USAGE
   Each room's HTML passes a `composition` array to CSRoom.boot:

     CSRoom.boot({
       id: 'bar',
       width: 10, depth: 6, height: 3.6,
       theme: { ... },
       composition: [
         { type: 'baseboard', height: 0.15, color: '#c9a84c' },
         { type: 'crownMolding', height: 0.20, color: '#c9a84c' },
         { type: 'pendantArray', count: 5, axis: 'x', color: '#c9a84c' },
         { type: 'bottleWall', wall: 'north', shelves: 3, perShelf: 12 },
         { type: 'stoolRow', count: 7, z: 0.6, axis: 'x' },
         { type: 'barCounter', length: 6, depth: 0.7, height: 1.1 },
       ],
     });

   The boot calls CSDecor.build(scene, comp, roomConfig) for each
   item in the composition. Order matters — baseboards before
   bottles so bottles sit on top.
   ═══════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const CSDecor = {};

  // ─── Color helpers ────────────────────────────────────────────
  // Many composition items want a slightly-darker or slightly-
  // brighter shade of a base color (for shelves, trim, etc.).
  function shadeColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 0xff;
    const g = (num >> 8) & 0xff;
    const b = num & 0xff;
    const factor = 1 + (percent / 100);
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v * factor)));
    const nr = clamp(r), ng = clamp(g), nb = clamp(b);
    return '#' + ((nr << 16) | (ng << 8) | nb).toString(16).padStart(6, '0');
  }

  // ─── Public dispatcher ────────────────────────────────────────
  CSDecor.build = function (scene, comp, roomConfig) {
    const fn = HANDLERS[comp.type];
    if (!fn) {
      console.warn(`[CSDecor] unknown composition type: ${comp.type}`);
      return;
    }
    try {
      fn(scene, comp, roomConfig);
    } catch (e) {
      console.error(`[CSDecor] error in ${comp.type}:`, e);
    }
  };

  // ─── Handlers ─────────────────────────────────────────────────
  const HANDLERS = {};

  // ─── BASEBOARD ────────────────────────────────────────────────
  // Thin band along the bottom of all 4 walls, slightly inset so
  // it reads as architectural trim. Standard baseboard 10-15cm tall.
  HANDLERS.baseboard = function (scene, comp, room) {
    const h = comp.height || 0.15;
    const color = comp.color || room.theme.accent;
    const halfW = room.width / 2;
    const halfD = room.depth / 2;
    const t = 0.04; // thickness off the wall
    const y = h / 2;

    [
      // North (back wall): full width
      { x: 0, y, z: -halfD + t / 2, w: room.width, d: t },
      // South (front wall, with door gap)
      // Skip south, OR build as 2 segments around door — keep simple, full width with thin
      { x: 0, y, z:  halfD - t / 2, w: room.width, d: t },
      // East (right wall)
      { x:  halfW - t / 2, y, z: 0, w: t, d: room.depth },
      // West (left wall)
      { x: -halfW + t / 2, y, z: 0, w: t, d: room.depth },
    ].forEach((s, i) => {
      const box = document.createElement('a-box');
      box.setAttribute('id', `baseboard-${i}`);
      box.setAttribute('position', `${s.x} ${s.y} ${s.z}`);
      box.setAttribute('width', s.w);
      box.setAttribute('height', h);
      box.setAttribute('depth', s.d);
      box.setAttribute('color', color);
      box.setAttribute('material', `shader: standard; metalness: 0.3; roughness: 0.6`);
      scene.appendChild(box);
    });
    console.log(`[CSDecor] baseboard installed (${color})`);
  };

  // ─── CROWN MOLDING ────────────────────────────────────────────
  // Thin band at the very top of all 4 walls. Same as baseboard
  // but at ceiling height.
  HANDLERS.crownMolding = function (scene, comp, room) {
    const h = comp.height || 0.20;
    const color = comp.color || room.theme.accent;
    const halfW = room.width / 2;
    const halfD = room.depth / 2;
    const t = 0.05;
    const y = room.height - h / 2;

    [
      { x: 0, y, z: -halfD + t / 2, w: room.width, d: t },
      { x: 0, y, z:  halfD - t / 2, w: room.width, d: t },
      { x:  halfW - t / 2, y, z: 0, w: t, d: room.depth },
      { x: -halfW + t / 2, y, z: 0, w: t, d: room.depth },
    ].forEach((s, i) => {
      const box = document.createElement('a-box');
      box.setAttribute('id', `crown-${i}`);
      box.setAttribute('position', `${s.x} ${s.y} ${s.z}`);
      box.setAttribute('width', s.w);
      box.setAttribute('height', h);
      box.setAttribute('depth', s.d);
      box.setAttribute('color', color);
      box.setAttribute('material', `shader: standard; metalness: 0.4; roughness: 0.5`);
      scene.appendChild(box);
    });
    console.log(`[CSDecor] crown molding installed (${color})`);
  };

  // ─── PENDANT ARRAY ────────────────────────────────────────────
  // Row of evenly-spaced pendant lights from the ceiling. Each
  // pendant gets its own point light for atmospheric multi-source
  // illumination (Base44's bar has 5 pendants like this).
  HANDLERS.pendantArray = function (scene, comp, room) {
    const count = comp.count || 5;
    const axis = comp.axis || 'x';      // 'x' = along width, 'z' = along depth
    const color = comp.color || room.theme.accent;
    const cordLen = comp.cordLength || 0.6;
    const z = comp.z !== undefined ? comp.z : 0;  // offset along non-axis
    const x = comp.x !== undefined ? comp.x : 0;
    const span = axis === 'x' ? room.width * 0.7 : room.depth * 0.7;
    const startCoord = -span / 2;
    const step = count > 1 ? span / (count - 1) : 0;
    const ceilingY = room.height - 0.05;
    const shadeY = ceilingY - cordLen - 0.05;

    for (let i = 0; i < count; i++) {
      const offset = startCoord + step * i;
      const pX = axis === 'x' ? offset : x;
      const pZ = axis === 'z' ? offset : z;

      // Cord (thin black cylinder)
      const cord = document.createElement('a-cylinder');
      cord.setAttribute('position', `${pX} ${ceilingY - cordLen / 2} ${pZ}`);
      cord.setAttribute('radius', 0.01);
      cord.setAttribute('height', cordLen);
      cord.setAttribute('color', '#1a1410');
      scene.appendChild(cord);

      // Lampshade (small inverted cone via cylinder)
      const shade = document.createElement('a-cylinder');
      shade.setAttribute('position', `${pX} ${shadeY} ${pZ}`);
      shade.setAttribute('radius-top', 0.06);
      shade.setAttribute('radius-bottom', 0.14);
      shade.setAttribute('height', 0.18);
      shade.setAttribute('color', '#1a1410');
      shade.setAttribute('material', 'shader: standard; metalness: 0.5; roughness: 0.4');
      scene.appendChild(shade);

      // Bulb (warm glow sphere)
      const bulb = document.createElement('a-sphere');
      bulb.setAttribute('position', `${pX} ${shadeY - 0.08} ${pZ}`);
      bulb.setAttribute('radius', 0.05);
      bulb.setAttribute('color', '#fff4d4');
      bulb.setAttribute('material', 'shader: flat');  // unaffected by lighting, always glowing
      scene.appendChild(bulb);

      // Point light shining downward
      const light = document.createElement('a-light');
      light.setAttribute('type', 'point');
      light.setAttribute('position', `${pX} ${shadeY - 0.15} ${pZ}`);
      light.setAttribute('color', color);
      light.setAttribute('intensity', 4);
      light.setAttribute('distance', 4);
      light.setAttribute('decay', 1.5);
      scene.appendChild(light);
    }
    console.log(`[CSDecor] ${count} pendants along ${axis}-axis`);
  };

  // ─── BAR COUNTER (primitives) ─────────────────────────────────
  // Long boxy bar built from primitives. Looks like a counter from
  // the front (deep walnut), top surface in lighter wood/marble.
  // Use this when we don't want the Meshy GLB.
  HANDLERS.barCounter = function (scene, comp, room) {
    const length = comp.length || 6;
    const depth = comp.depth || 0.65;
    const height = comp.height || 1.10;
    const x = comp.x !== undefined ? comp.x : 0;
    const z = comp.z !== undefined ? comp.z : -1.5;
    const baseColor = comp.color || '#3a2618';   // deep walnut
    const topColor = comp.topColor || '#1a0e08'; // dark marble

    // Body (front face)
    const body = document.createElement('a-box');
    body.setAttribute('id', 'bar-body');
    body.setAttribute('position', `${x} ${height / 2} ${z}`);
    body.setAttribute('width', length);
    body.setAttribute('height', height);
    body.setAttribute('depth', depth);
    body.setAttribute('color', baseColor);
    body.setAttribute('material', 'shader: standard; metalness: 0.2; roughness: 0.7');
    scene.appendChild(body);

    // Top surface (slightly overhangs)
    const top = document.createElement('a-box');
    top.setAttribute('id', 'bar-top');
    top.setAttribute('position', `${x} ${height + 0.025} ${z + 0.04}`);
    top.setAttribute('width', length + 0.1);
    top.setAttribute('height', 0.05);
    top.setAttribute('depth', depth + 0.08);
    top.setAttribute('color', topColor);
    top.setAttribute('material', 'shader: standard; metalness: 0.6; roughness: 0.2');
    scene.appendChild(top);

    // Brass kick rail at bottom-front
    const kickrail = document.createElement('a-cylinder');
    kickrail.setAttribute('rotation', '0 0 90');
    kickrail.setAttribute('position', `${x} 0.15 ${z + depth / 2 + 0.08}`);
    kickrail.setAttribute('radius', 0.02);
    kickrail.setAttribute('height', length);
    kickrail.setAttribute('color', room.theme.accent);
    kickrail.setAttribute('material', 'shader: standard; metalness: 0.9; roughness: 0.3');
    scene.appendChild(kickrail);

    console.log(`[CSDecor] bar counter ${length}m × ${depth}m × ${height}m`);
  };

  // ─── BOTTLE WALL ──────────────────────────────────────────────
  // Multiple shelves with rows of bottles on each. THIS is what
  // makes the bar look real — Base44's bar has dozens of bottles
  // backlit on dark shelves. Bottles are tiny capsules in varied
  // bottle colors (emerald, amber, deep red, blue, clear).
  HANDLERS.bottleWall = function (scene, comp, room) {
    const wall = comp.wall || 'north';
    const shelves = comp.shelves || 3;
    const perShelf = comp.perShelf || 12;
    const length = comp.length || room.width * 0.7;
    const startY = comp.startY !== undefined ? comp.startY : 1.4;
    const shelfGap = comp.shelfGap || 0.4;
    const shelfColor = comp.shelfColor || '#1a0e08';

    // Determine wall coords
    let baseZ, baseX, axis;
    const halfD = room.depth / 2;
    const halfW = room.width / 2;
    if (wall === 'north') { baseZ = -halfD + 0.15; baseX = 0; axis = 'x'; }
    else if (wall === 'south') { baseZ = halfD - 0.15; baseX = 0; axis = 'x'; }
    else if (wall === 'east')  { baseZ = 0; baseX = halfW - 0.15; axis = 'z'; }
    else if (wall === 'west')  { baseZ = 0; baseX = -halfW + 0.15; axis = 'z'; }

    // Bottle palette — varied jewel tones for visual richness
    const bottleColors = ['#0a3d2a', '#7a3a0a', '#601020', '#0a2d50', '#d4d4d0', '#0e1f0c', '#5a1a30', '#a0500a'];

    for (let s = 0; s < shelves; s++) {
      const shelfY = startY + s * shelfGap;

      // The shelf itself — thin dark plank
      const shelf = document.createElement('a-box');
      shelf.setAttribute('position', `${baseX} ${shelfY} ${baseZ}`);
      if (axis === 'x') {
        shelf.setAttribute('width', length);
        shelf.setAttribute('depth', 0.18);
      } else {
        shelf.setAttribute('width', 0.18);
        shelf.setAttribute('depth', length);
      }
      shelf.setAttribute('height', 0.025);
      shelf.setAttribute('color', shelfColor);
      shelf.setAttribute('material', 'shader: standard; metalness: 0.2; roughness: 0.5');
      scene.appendChild(shelf);

      // Bottles on this shelf
      const startCoord = -length / 2 + length / (perShelf * 2);
      const step = length / perShelf;
      for (let b = 0; b < perShelf; b++) {
        const c = startCoord + step * b;
        const bX = axis === 'x' ? baseX + c : baseX;
        const bZ = axis === 'z' ? baseZ + c : baseZ;
        const bColor = bottleColors[(s * perShelf + b) % bottleColors.length];

        // Bottle body (cylinder)
        const bottle = document.createElement('a-cylinder');
        bottle.setAttribute('position', `${bX} ${shelfY + 0.13} ${bZ}`);
        bottle.setAttribute('radius', 0.025);
        bottle.setAttribute('height', 0.20);
        bottle.setAttribute('color', bColor);
        bottle.setAttribute('material', `shader: standard; metalness: 0.4; roughness: 0.3; opacity: 0.85; transparent: true`);
        scene.appendChild(bottle);

        // Bottle neck (small cap)
        const neck = document.createElement('a-cylinder');
        neck.setAttribute('position', `${bX} ${shelfY + 0.255} ${bZ}`);
        neck.setAttribute('radius', 0.011);
        neck.setAttribute('height', 0.04);
        neck.setAttribute('color', shadeColor(bColor, -30));
        scene.appendChild(neck);
      }
    }
    console.log(`[CSDecor] bottle wall: ${shelves} shelves × ${perShelf} bottles = ${shelves * perShelf} bottles on ${wall} wall`);
  };

  // ─── STOOL ROW ────────────────────────────────────────────────
  // Line of bar stools built from primitives — gold post + brown
  // disc seat + small footrail ring. Like Base44's bar stools.
  HANDLERS.stoolRow = function (scene, comp, room) {
    const count = comp.count || 7;
    const z = comp.z !== undefined ? comp.z : -0.6;
    const axis = comp.axis || 'x';
    const length = comp.length || room.width * 0.85;
    const seatHeight = comp.seatHeight || 0.75;
    const seatColor = comp.seatColor || '#7a3a2a';      // oxblood
    const postColor = comp.postColor || room.theme.accent;

    const startCoord = -length / 2;
    const step = count > 1 ? length / (count - 1) : 0;

    for (let i = 0; i < count; i++) {
      const offset = startCoord + step * i;
      const sX = axis === 'x' ? offset : 0;
      const sZ = axis === 'z' ? offset : z;

      // Post
      const post = document.createElement('a-cylinder');
      post.setAttribute('position', `${sX} ${seatHeight / 2} ${sZ}`);
      post.setAttribute('radius', 0.03);
      post.setAttribute('height', seatHeight);
      post.setAttribute('color', postColor);
      post.setAttribute('material', 'shader: standard; metalness: 0.85; roughness: 0.3');
      scene.appendChild(post);

      // Base disc on floor
      const base = document.createElement('a-cylinder');
      base.setAttribute('position', `${sX} 0.015 ${sZ}`);
      base.setAttribute('radius', 0.18);
      base.setAttribute('height', 0.03);
      base.setAttribute('color', postColor);
      base.setAttribute('material', 'shader: standard; metalness: 0.85; roughness: 0.3');
      scene.appendChild(base);

      // Footrail ring (torus)
      const ring = document.createElement('a-torus');
      ring.setAttribute('position', `${sX} 0.20 ${sZ}`);
      ring.setAttribute('rotation', '90 0 0');
      ring.setAttribute('radius', 0.16);
      ring.setAttribute('radius-tubular', 0.012);
      ring.setAttribute('color', postColor);
      ring.setAttribute('material', 'shader: standard; metalness: 0.85; roughness: 0.3');
      scene.appendChild(ring);

      // Seat (cushioned disc)
      const seat = document.createElement('a-cylinder');
      seat.setAttribute('position', `${sX} ${seatHeight + 0.04} ${sZ}`);
      seat.setAttribute('radius', 0.18);
      seat.setAttribute('height', 0.09);
      seat.setAttribute('color', seatColor);
      seat.setAttribute('material', 'shader: standard; metalness: 0.05; roughness: 0.85');
      scene.appendChild(seat);
    }
    console.log(`[CSDecor] ${count} stools along ${axis}-axis`);
  };

  // ─── WAINSCOTING ──────────────────────────────────────────────
  // Lower-wall paneling band (typical 80-100cm tall) on selected
  // walls. Adds a panel-line effect as a series of vertical strips.
  HANDLERS.wainscoting = function (scene, comp, room) {
    const height = comp.height || 1.0;
    const walls = comp.walls || ['north', 'east', 'west'];
    const color = comp.color || shadeColor(room.theme.wall, -10);
    const stripeColor = comp.stripeColor || room.theme.accent;
    const halfW = room.width / 2;
    const halfD = room.depth / 2;
    const t = 0.03;

    walls.forEach((wallId) => {
      let pos, w, d, axisSpan;
      if (wallId === 'north') { pos = { x: 0, y: height / 2, z: -halfD + t / 2 }; w = room.width; d = t; axisSpan = room.width; }
      else if (wallId === 'south') { pos = { x: 0, y: height / 2, z: halfD - t / 2 }; w = room.width; d = t; axisSpan = room.width; }
      else if (wallId === 'east')  { pos = { x: halfW - t / 2, y: height / 2, z: 0 }; w = t; d = room.depth; axisSpan = room.depth; }
      else if (wallId === 'west')  { pos = { x: -halfW + t / 2, y: height / 2, z: 0 }; w = t; d = room.depth; axisSpan = room.depth; }

      // Background panel
      const panel = document.createElement('a-box');
      panel.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
      panel.setAttribute('width', w);
      panel.setAttribute('height', height);
      panel.setAttribute('depth', d);
      panel.setAttribute('color', color);
      panel.setAttribute('material', 'shader: standard; metalness: 0.1; roughness: 0.85');
      scene.appendChild(panel);

      // Top rail (the chair-rail molding cap)
      const rail = document.createElement('a-box');
      rail.setAttribute('position', `${pos.x} ${height + 0.025} ${pos.z}`);
      rail.setAttribute('width', wallId === 'north' || wallId === 'south' ? room.width : t * 1.5);
      rail.setAttribute('height', 0.05);
      rail.setAttribute('depth', wallId === 'east' || wallId === 'west' ? room.depth : t * 1.5);
      rail.setAttribute('color', stripeColor);
      rail.setAttribute('material', 'shader: standard; metalness: 0.7; roughness: 0.3');
      scene.appendChild(rail);
    });
    console.log(`[CSDecor] wainscoting on ${walls.join(', ')}`);
  };

  // ─── PICTURE FRAMES ───────────────────────────────────────────
  // Row of framed art on a chosen wall. Just black frames with
  // dim color centers — sells the "this is a real room" feel.
  HANDLERS.pictureFrames = function (scene, comp, room) {
    const wall = comp.wall || 'east';
    const count = comp.count || 3;
    const y = comp.y || 1.7;
    const w = comp.frameWidth || 0.6;
    const h = comp.frameHeight || 0.8;
    const length = comp.length || room.width * 0.6;
    const colors = comp.colors || ['#3a2618', '#5a1a30', '#0a2d50']; // muted art tones
    const halfW = room.width / 2;
    const halfD = room.depth / 2;

    let baseX, baseZ, axis, t = 0.04;
    if (wall === 'north') { baseZ = -halfD + t; baseX = 0; axis = 'x'; }
    else if (wall === 'south') { baseZ = halfD - t; baseX = 0; axis = 'x'; }
    else if (wall === 'east')  { baseZ = 0; baseX = halfW - t; axis = 'z'; }
    else if (wall === 'west')  { baseZ = 0; baseX = -halfW + t; axis = 'z'; }

    const startCoord = -length / 2 + length / (count * 2);
    const step = length / count;
    for (let i = 0; i < count; i++) {
      const c = startCoord + step * i;
      const fX = axis === 'x' ? baseX + c : baseX;
      const fZ = axis === 'z' ? baseZ + c : baseZ;

      // Frame outer
      const frame = document.createElement('a-box');
      frame.setAttribute('position', `${fX} ${y} ${fZ}`);
      frame.setAttribute('width', axis === 'x' ? w : 0.04);
      frame.setAttribute('height', h);
      frame.setAttribute('depth', axis === 'z' ? w : 0.04);
      frame.setAttribute('color', '#0a0805');
      frame.setAttribute('material', 'shader: standard; metalness: 0.4; roughness: 0.4');
      scene.appendChild(frame);

      // Art (slightly inset)
      const art = document.createElement('a-plane');
      art.setAttribute('position', `${fX} ${y} ${fZ + (axis === 'x' ? 0 : (wall === 'east' ? -0.03 : 0.03))}`);
      if (axis === 'x') {
        art.setAttribute('rotation', wall === 'north' ? '0 0 0' : '0 180 0');
      } else {
        art.setAttribute('rotation', wall === 'east' ? '0 -90 0' : '0 90 0');
      }
      art.setAttribute('width', w * 0.85);
      art.setAttribute('height', h * 0.85);
      art.setAttribute('color', colors[i % colors.length]);
      art.setAttribute('material', 'shader: flat; opacity: 0.6');
      scene.appendChild(art);
    }
    console.log(`[CSDecor] ${count} picture frames on ${wall} wall`);
  };

  // ─── CANDLE CLUSTER ───────────────────────────────────────────
  // Small group of candles with warm point lights — for atmospheric
  // floor-candle look (Base44 smoke lounge).
  HANDLERS.candleCluster = function (scene, comp, room) {
    const positions = comp.positions || [
      { x: -2, z: -1 }, { x: 2, z: -1 }, { x: 0, z: 1.5 },
      { x: -2.5, z: 1 }, { x: 2.5, z: 1 }, { x: 0, z: -1.5 },
    ];

    positions.forEach((p, i) => {
      // Wax (white cylinder)
      const wax = document.createElement('a-cylinder');
      wax.setAttribute('position', `${p.x} 0.1 ${p.z}`);
      wax.setAttribute('radius', 0.04);
      wax.setAttribute('height', 0.2);
      wax.setAttribute('color', '#f4ead5');
      wax.setAttribute('material', 'shader: standard; metalness: 0; roughness: 0.9');
      scene.appendChild(wax);

      // Flame (small bright cone)
      const flame = document.createElement('a-cone');
      flame.setAttribute('position', `${p.x} 0.24 ${p.z}`);
      flame.setAttribute('radius-bottom', 0.018);
      flame.setAttribute('radius-top', 0);
      flame.setAttribute('height', 0.05);
      flame.setAttribute('color', '#ffb84a');
      flame.setAttribute('material', 'shader: flat');
      scene.appendChild(flame);

      // Warm point light at flame
      const light = document.createElement('a-light');
      light.setAttribute('type', 'point');
      light.setAttribute('position', `${p.x} 0.3 ${p.z}`);
      light.setAttribute('color', '#ffaa55');
      light.setAttribute('intensity', 1.5);
      light.setAttribute('distance', 1.5);
      light.setAttribute('decay', 2);
      scene.appendChild(light);
    });
    console.log(`[CSDecor] ${positions.length} candles`);
  };

  // ─── STAR CEILING ─────────────────────────────────────────────
  // Replace ceiling color with a deep navy + scattered tiny white
  // points (stars). For courtyard-style outdoor feel.
  HANDLERS.starCeiling = function (scene, comp, room) {
    const count = comp.count || 80;
    const halfW = room.width / 2 - 0.5;
    const halfD = room.depth / 2 - 0.5;
    const y = room.height - 0.05;
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 2 * halfW;
      const z = (Math.random() - 0.5) * 2 * halfD;
      const r = 0.03 + Math.random() * 0.04;
      const star = document.createElement('a-sphere');
      star.setAttribute('position', `${x} ${y} ${z}`);
      star.setAttribute('radius', r);
      star.setAttribute('color', '#ffffff');
      star.setAttribute('material', 'shader: flat');
      scene.appendChild(star);
    }
    console.log(`[CSDecor] ${count} stars`);
  };

  // ─── HUMIDOR WALL ─────────────────────────────────────────────
  // Cigar humidor display: N horizontal shelves with M cedar cigar
  // boxes per shelf, glass-fronted display. Each box is a flat
  // tobacco-brown rectangle with a thin brass clasp at center —
  // reads as a closed humidor box at a glance.
  //
  // Use cases beyond cigar lounge:
  //   - Tea/spice display in culinary (swap colors to ochre/sage)
  //   - Apothecary/cocktail bitters wall (smoke lounge)
  HANDLERS.humidorWall = function (scene, comp, room) {
    const wall = comp.wall || 'north';
    const shelves = comp.shelves || 3;
    const perShelf = comp.perShelf || 6;
    const length = comp.length || room.width * 0.6;
    const startY = comp.startY !== undefined ? comp.startY : 1.4;
    const shelfGap = comp.shelfGap || 0.55;
    const shelfColor = comp.shelfColor || '#2a1a0e';
    const boxColors = comp.boxColors || [
      '#3a1f12', '#4a2a18', '#2e1808', '#5a341c',
      '#3e2010', '#4e2a16', '#3a1f12', '#5a3416',
    ];

    // Determine wall coords
    const halfD = room.depth / 2;
    const halfW = room.width / 2;
    let baseZ, baseX, axis;
    if (wall === 'north') { baseZ = -halfD + 0.18; baseX = 0; axis = 'x'; }
    else if (wall === 'south') { baseZ = halfD - 0.18; baseX = 0; axis = 'x'; }
    else if (wall === 'east')  { baseZ = 0; baseX = halfW - 0.18; axis = 'z'; }
    else if (wall === 'west')  { baseZ = 0; baseX = -halfW + 0.18; axis = 'z'; }

    for (let s = 0; s < shelves; s++) {
      const shelfY = startY + s * shelfGap;

      // The shelf plank — cedar-tone, slightly proud of the wall
      const shelf = document.createElement('a-box');
      shelf.setAttribute('position', `${baseX} ${shelfY - 0.03} ${baseZ}`);
      if (axis === 'x') {
        shelf.setAttribute('width', length);
        shelf.setAttribute('depth', 0.28);
      } else {
        shelf.setAttribute('width', 0.28);
        shelf.setAttribute('depth', length);
      }
      shelf.setAttribute('height', 0.04);
      shelf.setAttribute('color', shelfColor);
      shelf.setAttribute('material', 'shader: standard; metalness: 0.15; roughness: 0.7');
      scene.appendChild(shelf);

      // Cigar boxes lined up on the shelf
      const startCoord = -length / 2 + length / (perShelf * 2);
      const step = length / perShelf;
      for (let b = 0; b < perShelf; b++) {
        const c = startCoord + step * b;
        const bX = axis === 'x' ? baseX + c : baseX;
        const bZ = axis === 'z' ? baseZ + c : baseZ;
        const bColor = boxColors[(s * perShelf + b) % boxColors.length];

        // Box body — wider than tall, deep enough to read as a box
        const box = document.createElement('a-box');
        box.setAttribute('position', `${bX} ${shelfY + 0.08} ${bZ}`);
        if (axis === 'x') {
          box.setAttribute('width', step * 0.78);
          box.setAttribute('depth', 0.22);
        } else {
          box.setAttribute('width', 0.22);
          box.setAttribute('depth', step * 0.78);
        }
        box.setAttribute('height', 0.16);
        box.setAttribute('color', bColor);
        box.setAttribute('material', 'shader: standard; metalness: 0.1; roughness: 0.8');
        scene.appendChild(box);

        // Brass clasp at the front-center of the box (small box detail)
        const clasp = document.createElement('a-box');
        const claspZ = axis === 'x' ? bZ + 0.115 : bZ;
        const claspX = axis === 'z' ? bX + 0.115 : bX;
        clasp.setAttribute('position', `${claspX} ${shelfY + 0.08} ${claspZ}`);
        clasp.setAttribute('width', axis === 'x' ? 0.04 : 0.005);
        clasp.setAttribute('height', 0.04);
        clasp.setAttribute('depth', axis === 'x' ? 0.005 : 0.04);
        clasp.setAttribute('color', room.theme.accent);
        clasp.setAttribute('material', 'shader: standard; metalness: 0.9; roughness: 0.3');
        scene.appendChild(clasp);
      }
    }
    console.log(`[CSDecor] humidor wall: ${shelves} shelves × ${perShelf} boxes = ${shelves * perShelf} boxes on ${wall} wall`);
  };

  // ─── WINGBACK CHAIR ───────────────────────────────────────────
  // Tufted leather wingback: tall arched back, two side wings, broad
  // seat cushion, four wooden legs. Built from a-box/a-cylinder
  // primitives. Optional brass nailhead trim along the arms.
  //
  // Spawned at (x, z) facing a direction (rotation y in degrees).
  // Use cases beyond cigar lounge:
  //   - Main lounge VIP seating
  //   - Smoke lounge accent chairs
  HANDLERS.wingbackChair = function (scene, comp, room) {
    const x = comp.x !== undefined ? comp.x : 0;
    const z = comp.z !== undefined ? comp.z : 0;
    const rotY = comp.rotY !== undefined ? comp.rotY : 0;
    const leatherColor = comp.color || '#5a1a1a';   // oxblood
    const woodColor = comp.woodColor || '#1a0e08';   // dark mahogany
    const accent = comp.accent || room.theme.accent; // brass nailheads

    // Group everything under a pivot entity so we can rotate the whole chair
    const chair = document.createElement('a-entity');
    chair.setAttribute('position', `${x} 0 ${z}`);
    chair.setAttribute('rotation', `0 ${rotY} 0`);
    scene.appendChild(chair);

    // Seat cushion (tufted leather block)
    const seat = document.createElement('a-box');
    seat.setAttribute('position', '0 0.45 0');
    seat.setAttribute('width', 0.85);
    seat.setAttribute('height', 0.18);
    seat.setAttribute('depth', 0.80);
    seat.setAttribute('color', leatherColor);
    seat.setAttribute('material', 'shader: standard; metalness: 0.05; roughness: 0.85');
    chair.appendChild(seat);

    // Backrest (tall, slightly back-tilted via offset z)
    const back = document.createElement('a-box');
    back.setAttribute('position', '0 1.05 -0.36');
    back.setAttribute('width', 0.85);
    back.setAttribute('height', 1.10);
    back.setAttribute('depth', 0.18);
    back.setAttribute('color', leatherColor);
    back.setAttribute('material', 'shader: standard; metalness: 0.05; roughness: 0.85');
    chair.appendChild(back);

    // Two wings (extending forward from the upper backrest, the iconic shape)
    [-1, 1].forEach((side) => {
      const wing = document.createElement('a-box');
      wing.setAttribute('position', `${side * 0.40} 1.20 -0.20`);
      wing.setAttribute('width', 0.10);
      wing.setAttribute('height', 0.78);
      wing.setAttribute('depth', 0.50);
      wing.setAttribute('color', leatherColor);
      wing.setAttribute('material', 'shader: standard; metalness: 0.05; roughness: 0.85');
      chair.appendChild(wing);
    });

    // Two armrests (front-to-back, lower than wings)
    [-1, 1].forEach((side) => {
      const arm = document.createElement('a-box');
      arm.setAttribute('position', `${side * 0.40} 0.70 0.10`);
      arm.setAttribute('width', 0.10);
      arm.setAttribute('height', 0.18);
      arm.setAttribute('depth', 0.55);
      arm.setAttribute('color', leatherColor);
      arm.setAttribute('material', 'shader: standard; metalness: 0.05; roughness: 0.85');
      chair.appendChild(arm);
    });

    // Brass nailhead trim — small studs along each arm front edge.
    // 5 studs per arm, evenly spaced.
    [-1, 1].forEach((side) => {
      for (let i = 0; i < 5; i++) {
        const stud = document.createElement('a-sphere');
        const armFrontZ = 0.10 + 0.55 / 2 - 0.04;
        const studZ = armFrontZ - i * 0.10;
        stud.setAttribute('position', `${side * 0.45} 0.70 ${studZ}`);
        stud.setAttribute('radius', 0.012);
        stud.setAttribute('color', accent);
        stud.setAttribute('material', 'shader: standard; metalness: 0.9; roughness: 0.25');
        chair.appendChild(stud);
      }
    });

    // 4 wooden legs (square posts)
    [
      { x: -0.36, z: -0.36 },
      { x:  0.36, z: -0.36 },
      { x: -0.36, z:  0.36 },
      { x:  0.36, z:  0.36 },
    ].forEach((leg) => {
      const post = document.createElement('a-box');
      post.setAttribute('position', `${leg.x} 0.18 ${leg.z}`);
      post.setAttribute('width', 0.08);
      post.setAttribute('height', 0.36);
      post.setAttribute('depth', 0.08);
      post.setAttribute('color', woodColor);
      post.setAttribute('material', 'shader: standard; metalness: 0.1; roughness: 0.6');
      chair.appendChild(post);
    });

    console.log(`[CSDecor] wingback chair at (${x}, ${z}) rot ${rotY}°`);
  };

  // ─── COFFEE TABLE ─────────────────────────────────────────────
  // Low table, mahogany top + brass pedestal base. Round or square
  // configurable via shape: 'round' | 'square'.
  //
  // Use cases beyond cigar lounge:
  //   - Smoke lounge low tables in the conversation pit
  //   - Main lounge cocktail tables
  HANDLERS.coffeeTable = function (scene, comp, room) {
    const x = comp.x !== undefined ? comp.x : 0;
    const z = comp.z !== undefined ? comp.z : 0;
    const shape = comp.shape || 'round';
    const radius = comp.radius || 0.45;
    const height = comp.height || 0.45;
    const topColor = comp.topColor || '#1a0e08';     // dark mahogany
    const baseColor = comp.baseColor || room.theme.accent; // brass

    if (shape === 'round') {
      const top = document.createElement('a-cylinder');
      top.setAttribute('position', `${x} ${height} ${z}`);
      top.setAttribute('radius', radius);
      top.setAttribute('height', 0.05);
      top.setAttribute('color', topColor);
      top.setAttribute('material', 'shader: standard; metalness: 0.4; roughness: 0.3');
      scene.appendChild(top);

      // Pedestal base (slim brass column)
      const post = document.createElement('a-cylinder');
      post.setAttribute('position', `${x} ${height / 2} ${z}`);
      post.setAttribute('radius', 0.04);
      post.setAttribute('height', height);
      post.setAttribute('color', baseColor);
      post.setAttribute('material', 'shader: standard; metalness: 0.9; roughness: 0.25');
      scene.appendChild(post);

      // Base disc on floor
      const disc = document.createElement('a-cylinder');
      disc.setAttribute('position', `${x} 0.015 ${z}`);
      disc.setAttribute('radius', radius * 0.55);
      disc.setAttribute('height', 0.03);
      disc.setAttribute('color', baseColor);
      disc.setAttribute('material', 'shader: standard; metalness: 0.9; roughness: 0.25');
      scene.appendChild(disc);
    } else {
      const top = document.createElement('a-box');
      top.setAttribute('position', `${x} ${height} ${z}`);
      top.setAttribute('width', radius * 2);
      top.setAttribute('height', 0.05);
      top.setAttribute('depth', radius * 2);
      top.setAttribute('color', topColor);
      top.setAttribute('material', 'shader: standard; metalness: 0.4; roughness: 0.3');
      scene.appendChild(top);
      // 4 legs at corners
      const off = radius - 0.05;
      [[-off,-off],[off,-off],[-off,off],[off,off]].forEach(([lx,lz]) => {
        const leg = document.createElement('a-box');
        leg.setAttribute('position', `${x+lx} ${height/2} ${z+lz}`);
        leg.setAttribute('width', 0.05);
        leg.setAttribute('height', height);
        leg.setAttribute('depth', 0.05);
        leg.setAttribute('color', baseColor);
        leg.setAttribute('material', 'shader: standard; metalness: 0.9; roughness: 0.3');
        scene.appendChild(leg);
      });
    }
    console.log(`[CSDecor] coffee table at (${x}, ${z}) ${shape}`);
  };

  // ─── STANDING LAMP ────────────────────────────────────────────
  // Tall floor lamp: brass post, weighted base, conical shade,
  // bulb sphere, point light. Casts a warm pool of light from
  // the floor up. Pairs well next to a wingback chair.
  //
  // Use cases beyond cigar lounge:
  //   - Main lounge accent lighting
  //   - Reading corner in the library section
  HANDLERS.standingLamp = function (scene, comp, room) {
    const x = comp.x !== undefined ? comp.x : 0;
    const z = comp.z !== undefined ? comp.z : 0;
    const height = comp.height || 1.6;
    const shadeColor = comp.shadeColor || '#3a1f12';
    const postColor = comp.postColor || room.theme.accent;
    const bulbColor = comp.bulbColor || '#fff4d4';
    const lightColor = comp.lightColor || '#ffaa55';
    const lightIntensity = comp.lightIntensity || 5;

    // Base disc on the floor
    const base = document.createElement('a-cylinder');
    base.setAttribute('position', `${x} 0.025 ${z}`);
    base.setAttribute('radius', 0.18);
    base.setAttribute('height', 0.05);
    base.setAttribute('color', postColor);
    base.setAttribute('material', 'shader: standard; metalness: 0.9; roughness: 0.3');
    scene.appendChild(base);

    // Post
    const post = document.createElement('a-cylinder');
    post.setAttribute('position', `${x} ${height / 2} ${z}`);
    post.setAttribute('radius', 0.025);
    post.setAttribute('height', height);
    post.setAttribute('color', postColor);
    post.setAttribute('material', 'shader: standard; metalness: 0.9; roughness: 0.3');
    scene.appendChild(post);

    // Lampshade (tapered cylinder for lampshade silhouette).
    // Sized for proper standing-lamp proportion — earlier 0.22 bottom
    // radius read as an oversized pendant.
    const shade = document.createElement('a-cylinder');
    shade.setAttribute('position', `${x} ${height + 0.10} ${z}`);
    shade.setAttribute('radius-top', 0.10);
    shade.setAttribute('radius-bottom', 0.14);
    shade.setAttribute('height', 0.22);
    shade.setAttribute('color', shadeColor);
    shade.setAttribute('material', 'shader: standard; metalness: 0.1; roughness: 0.85');
    scene.appendChild(shade);

    // Glowing bulb just below the shade opening
    const bulb = document.createElement('a-sphere');
    bulb.setAttribute('position', `${x} ${height + 0.04} ${z}`);
    bulb.setAttribute('radius', 0.045);
    bulb.setAttribute('color', bulbColor);
    bulb.setAttribute('material', 'shader: flat');
    scene.appendChild(bulb);

    // Warm point light
    const light = document.createElement('a-light');
    light.setAttribute('type', 'point');
    light.setAttribute('position', `${x} ${height + 0.04} ${z}`);
    light.setAttribute('color', lightColor);
    light.setAttribute('intensity', lightIntensity);
    light.setAttribute('distance', 3.5);
    light.setAttribute('decay', 1.5);
    scene.appendChild(light);

    console.log(`[CSDecor] standing lamp at (${x}, ${z}) h=${height}`);
  };

  // ─── BOOKSHELF ────────────────────────────────────────────────
  // Multi-row library shelf — N shelves with M book spines each.
  // Books are flat thin boxes in varied muted colors (leather-bound
  // library aesthetic).
  //
  // Use cases beyond cigar lounge:
  //   - Library section in main lounge
  //   - Vintage decor in smoke lounge
  HANDLERS.bookshelf = function (scene, comp, room) {
    const wall = comp.wall || 'west';
    const shelves = comp.shelves || 4;
    const perShelf = comp.perShelf || 14;
    const length = comp.length || room.depth * 0.6;
    const startY = comp.startY !== undefined ? comp.startY : 0.3;
    const shelfGap = comp.shelfGap || 0.45;
    const shelfColor = comp.shelfColor || '#1f1208';
    const bookColors = comp.bookColors || [
      '#3a1f12', '#1f2a3a', '#5a1a30', '#2e2818',
      '#3a3018', '#4a1818', '#1f3528', '#3a2418',
      '#2a2030', '#5a3a18', '#1a3540', '#3e1818',
    ];

    const halfD = room.depth / 2;
    const halfW = room.width / 2;
    let baseZ, baseX, axis;
    if (wall === 'north') { baseZ = -halfD + 0.12; baseX = 0; axis = 'x'; }
    else if (wall === 'south') { baseZ = halfD - 0.12; baseX = 0; axis = 'x'; }
    else if (wall === 'east')  { baseZ = 0; baseX = halfW - 0.12; axis = 'z'; }
    else if (wall === 'west')  { baseZ = 0; baseX = -halfW + 0.12; axis = 'z'; }

    for (let s = 0; s < shelves; s++) {
      const shelfY = startY + s * shelfGap;

      // Shelf plank (mahogany)
      const shelf = document.createElement('a-box');
      shelf.setAttribute('position', `${baseX} ${shelfY - 0.02} ${baseZ}`);
      if (axis === 'x') {
        shelf.setAttribute('width', length);
        shelf.setAttribute('depth', 0.20);
      } else {
        shelf.setAttribute('width', 0.20);
        shelf.setAttribute('depth', length);
      }
      shelf.setAttribute('height', 0.025);
      shelf.setAttribute('color', shelfColor);
      shelf.setAttribute('material', 'shader: standard; metalness: 0.1; roughness: 0.7');
      scene.appendChild(shelf);

      // Books — varied widths so the row reads "real library", not a
      // grid of identical bricks.
      const startCoord = -length / 2;
      let cursor = startCoord;
      for (let b = 0; b < perShelf; b++) {
        // Random-ish width based on (s,b) so it's stable across reloads
        const widthSeed = ((s * 17 + b * 31) % 7) / 7;
        const bookW = 0.04 + widthSeed * 0.04;          // 4cm to 8cm
        const bookH = 0.20 + ((s * 13 + b * 7) % 5) / 50;  // ~20-30cm
        if (cursor + bookW > -startCoord) break;        // out of room
        const c = cursor + bookW / 2;
        const bX = axis === 'x' ? baseX + c : baseX;
        const bZ = axis === 'z' ? baseZ + c : baseZ;
        const bColor = bookColors[(s * perShelf + b) % bookColors.length];

        const book = document.createElement('a-box');
        book.setAttribute('position', `${bX} ${shelfY + bookH / 2} ${bZ}`);
        if (axis === 'x') {
          book.setAttribute('width', bookW);
          book.setAttribute('depth', 0.16);
        } else {
          book.setAttribute('width', 0.16);
          book.setAttribute('depth', bookW);
        }
        book.setAttribute('height', bookH);
        book.setAttribute('color', bColor);
        book.setAttribute('material', 'shader: standard; metalness: 0.05; roughness: 0.85');
        scene.appendChild(book);

        cursor += bookW + 0.005;  // tiny gap between books
      }
    }
    console.log(`[CSDecor] bookshelf: ${shelves} shelves on ${wall} wall`);
  };

  // ─── FLOOR RUG ────────────────────────────────────────────────
  // A darkened rectangular plane on the floor for visual zoning
  // (delineates a seating area from the rest of the room). Use a
  // subtle pattern color or a flat dark tone — the rug doesn't
  // need detail at this rendering scale, just shape.
  //
  // Use cases beyond cigar lounge:
  //   - Conversation pit in smoke lounge
  //   - Stage area in main lounge
  HANDLERS.floorRug = function (scene, comp, room) {
    const x = comp.x !== undefined ? comp.x : 0;
    const z = comp.z !== undefined ? comp.z : 0;
    const width = comp.width || 3;
    const depth = comp.depth || 2;
    const color = comp.color || '#3a1818';     // muted oxblood
    const trimColor = comp.trimColor || room.theme.accent;
    const trimWidth = comp.trimWidth || 0.10;

    // Rug body
    const rug = document.createElement('a-plane');
    rug.setAttribute('position', `${x} 0.012 ${z}`);
    rug.setAttribute('rotation', '-90 0 0');
    rug.setAttribute('width', width);
    rug.setAttribute('height', depth);
    rug.setAttribute('color', color);
    rug.setAttribute('material', 'shader: standard; metalness: 0; roughness: 0.95');
    scene.appendChild(rug);

    // Brass-ish thin trim border via 4 thin planes around the edges
    [
      { px: x, pz: z - depth / 2 + trimWidth / 2, w: width, d: trimWidth }, // top edge
      { px: x, pz: z + depth / 2 - trimWidth / 2, w: width, d: trimWidth }, // bottom edge
      { px: x - width / 2 + trimWidth / 2, pz: z, w: trimWidth, d: depth },  // left edge
      { px: x + width / 2 - trimWidth / 2, pz: z, w: trimWidth, d: depth },  // right edge
    ].forEach((edge) => {
      const e = document.createElement('a-plane');
      e.setAttribute('position', `${edge.px} 0.013 ${edge.pz}`);
      e.setAttribute('rotation', '-90 0 0');
      e.setAttribute('width', edge.w);
      e.setAttribute('height', edge.d);
      e.setAttribute('color', trimColor);
      e.setAttribute('material', 'shader: standard; metalness: 0.6; roughness: 0.5; opacity: 0.7; transparent: true');
      scene.appendChild(e);
    });

    console.log(`[CSDecor] floor rug ${width}m × ${depth}m at (${x}, ${z})`);
  };

  // ─── HERO GLB ─────────────────────────────────────────────────
  // Drop in a Meshy GLB at a specific location, scale, rotation.
  // Same auto-snap behavior as cs-room-boot's loadProps. Use this
  // when you want one specific hero piece (the actual chef station,
  // a real fire pit) rather than building from primitives.
  HANDLERS.heroGLB = function (scene, comp, room) {
    const el = document.createElement('a-entity');
    el.setAttribute('id', `hero-${comp.id || Date.now()}`);
    el.setAttribute('gltf-model', comp.src);
    el.setAttribute('position', comp.pos || '0 0 0');
    if (comp.rot)   el.setAttribute('rotation', comp.rot);
    if (comp.scale) el.setAttribute('scale', comp.scale);
    el.setAttribute('shadow', 'cast: true; receive: true');
    scene.appendChild(el);

    // Auto-snap to floor (same as cs-room-boot)
    el.addEventListener('model-loaded', function onLoaded() {
      el.removeEventListener('model-loaded', onLoaded);
      try {
        const obj = el.getObject3D('mesh');
        if (!obj || !window.THREE) return;
        const box = new window.THREE.Box3().setFromObject(obj);
        const size = box.getSize(new window.THREE.Vector3());
        const fileName = comp.src.split('/').pop();
        if (comp.snap !== false) {
          const minY = box.min.y;
          const currentY = el.getAttribute('position').y;
          if (Math.abs(minY) > 0.01) {
            el.setAttribute('position', {
              x: el.getAttribute('position').x,
              y: currentY - minY,
              z: el.getAttribute('position').z,
            });
          }
        }
        console.log(`[CSDecor] heroGLB ${fileName}: W=${size.x.toFixed(2)}m H=${size.y.toFixed(2)}m D=${size.z.toFixed(2)}m`);
      } catch (e) { /* ignore */ }
    });
  };

  // ─── PUBLIC API ───────────────────────────────────────────────
  global.CSDecor = CSDecor;
  console.log('[CSDecor] composition library ready —', Object.keys(HANDLERS).length, 'handlers');

})(window);
