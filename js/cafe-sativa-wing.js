/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Café Sativa Wing (v3, from official floor plan)

   Rebuilds the Café Sativa experience from scratch using room
   dimensions locked from the official hand-drawn floor plan and
   labeled cutaway renders in Google Drive:

     Entrance Foyer              3.66 × 5.49 m  (12 × 18 ft)
     Cocktail Bar + Cold Stoned  5.49 × 6.71 m  (18 × 22 ft)
     Central Gallery             6.71 × 6.71 m  (22 × 22 ft)
     Main Lounge (+ built-in stage) 7.62 × 7.62 m (25 × 25 ft)
     Cigar Lounge (members only) 5.49 × 6.71 m  (18 × 22 ft)
     Event / Culinary Space      3.96 × 8.53 m  (13 × 28 ft)

   This file renders the architectural shells only — walls,
   floors, ceilings, door openings, ambient lighting, and room
   labels. Furniture/props and persona presence come in later
   PRs.

   Coordinate system:
   - Mall corridor runs along -Z at x=0 (visitor walks north/negative Z).
   - Café Sativa occupies the east side of the corridor.
   - Wing footprint spans roughly x=[3 .. 23], z=[-46 .. -25].
   - Entry from the mall corridor is on the west wall of the
     Entrance Foyer, facing west (toward the corridor).

   Flow:
     Entry (from mall) → Foyer → Bar → Gallery (hub)
       → south: Main Lounge (with stage)
       → east:  Event / Culinary
       → wedged: Cigar Lounge (gated, members-only)
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Room spec: center x, center z, width (x-axis), depth (z-axis), label ───
  // All dimensions in meters. Center coords so walls compute via ± half-dims.
  const WING = {
    // Top-level wing anchor — all room positions are relative to (0,0,0)
    // and translated to this origin at render time.
    origin: { x: 13, z: -35 },

    // CEILING height (uniform across wing)
    ceilingY: 3.2,

    // WALL thickness
    wallT: 0.15,
  };

  // Each room has center-relative x/z (before origin translation) and w/d.
  // Layout drawn on a grid where the entrance is at south-west (lowest z
  // is north, highest z is south). Picture looking down from above:
  //
  //   Cigar(5.5w × 6.7d)  MainLounge(7.6 × 7.6)  Culinary(4 × 8.5)
  //   └─────────────────┴───────────────────────┴────────────────┘
  //                     Gallery (6.7 × 6.7)
  //                     └───────────────────────┘
  //   Bar + ColdStoned(5.5 × 6.7)          Foyer(3.7 × 5.5)
  //   └───────────────────┘                └──────────────┘  ← entry (mall side)
  //
  const ROOMS = [
    // ENTRANCE FOYER — at the south-east corner (entry from mall corridor)
    // Entry door pierces west wall
    {
      id: 'cs-foyer',
      label: 'Entrance Foyer',
      x: -6.5, z: 5.5,
      w: 3.66, d: 5.49,
      floor: '#6b4c2e',        // warm oak planks
      wall:  '#e8dfcd',        // cream plaster
      ambient: { color: '#e8c080', intensity: 0.6 },
      doors: [
        // West door opens to the mall corridor (entry into the wing)
        { wall: 'west', offset: 0, width: 1.6 },
        // North door opens to Cocktail Bar
        { wall: 'north', offset: 0, width: 1.8 },
      ],
    },

    // COCKTAIL BAR + COLD STONED — north of Foyer, west side of wing
    {
      id: 'cs-bar',
      label: 'Cocktail Bar + Cold Stoned',
      x: -6.5, z: -0.75,
      w: 5.49, d: 6.71,
      floor: '#2a2a2a',        // polished concrete dark grey
      wall:  '#1a1410',        // charcoal
      ambient: { color: '#c08850', intensity: 0.9 },
      doors: [
        { wall: 'south', offset: 0, width: 1.8 },   // to Foyer
        { wall: 'east',  offset: 0, width: 2.0 },   // to Gallery
      ],
    },

    // CENTRAL GALLERY — center hub
    {
      id: 'cs-gallery',
      label: 'Central Gallery',
      x: 0, z: -0.75,
      w: 6.71, d: 6.71,
      floor: '#d8cfbc',        // travertine cream
      wall:  '#f4efe4',        // cream white
      ambient: { color: '#ffffff', intensity: 0.85 },
      doors: [
        { wall: 'west',  offset: 0, width: 2.0 },   // from Bar
        { wall: 'north', offset: 0, width: 2.2 },   // to Main Lounge
        { wall: 'east',  offset: 0, width: 2.0 },   // to Culinary
        { wall: 'south', offset: 2.2, width: 1.4 }, // alt to Foyer (optional peek)
      ],
    },

    // MAIN LOUNGE (with built-in stage) — north of Gallery
    {
      id: 'cs-main-lounge',
      label: 'Main Lounge',
      x: 0, z: -7.8,
      w: 7.62, d: 7.62,
      floor: '#3a2518',        // dark oak chevron
      wall:  '#5c6a56',        // sage green
      ambient: { color: '#c08850', intensity: 0.55 },
      doors: [
        { wall: 'south', offset: 0, width: 2.2 },   // from Gallery
        { wall: 'west',  offset: -2, width: 1.4 },  // to Cigar Lounge
        { wall: 'east',  offset: -2, width: 1.4 },  // to Culinary
      ],
      // Built-in stage sits against the north wall, raised 0.3m.
      // Dimensions and placement rendered separately (see buildMainLoungeStage).
      hasStage: true,
    },

    // CIGAR LOUNGE — west of Main Lounge (members only)
    {
      id: 'cs-cigar',
      label: 'Cigar Lounge',
      x: -6.7, z: -7.8,
      w: 5.49, d: 6.71,
      floor: '#2a1a0e',        // dark walnut
      wall:  '#2a3a2a',        // deep forest leather
      ambient: { color: '#a06030', intensity: 0.45 },
      memberOnly: true,
      doors: [
        // Single door from Main Lounge (gated)
        { wall: 'east', offset: -2, width: 1.4 },
      ],
    },

    // EVENT / CULINARY — east of Main Lounge
    {
      id: 'cs-culinary',
      label: 'Event / Culinary',
      x: 6.8, z: -4.25,  // centered between Gallery (north at z=-4.1) and Main Lounge (south at z=-4.4)
      w: 3.96, d: 8.53,
      floor: '#2e2e2e',        // polished concrete
      wall:  '#e8e4dc',        // subway-tile light
      ambient: { color: '#e8a050', intensity: 0.7 }, // copper heat-lamp warmth
      doors: [
        { wall: 'west', offset: 3, width: 1.8 },    // from Gallery (upper)
        { wall: 'west', offset: -3, width: 1.4 },   // from Main Lounge (lower)
      ],
    },
  ];

  // ─── Build helpers ───────────────────────────────────────────

  function makeEntity(attrs) {
    const e = document.createElement('a-entity');
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function makeBox(x, y, z, w, h, d, material) {
    const e = document.createElement('a-box');
    e.setAttribute('position', `${x} ${y} ${z}`);
    e.setAttribute('width', w);
    e.setAttribute('height', h);
    e.setAttribute('depth', d);
    e.setAttribute('material', material);
    return e;
  }

  // Same as makeBox but additionally marks the entity as a solid wall
  // for the mall collision system. Used for wall segments only — not for
  // furniture or stage platforms.
  function makeSolidBox(x, y, z, w, h, d, material) {
    const e = makeBox(x, y, z, w, h, d, material);
    e.setAttribute('solid-wall', '');
    return e;
  }

  function makePlane(x, y, z, w, d, rotX, material) {
    const e = document.createElement('a-plane');
    e.setAttribute('position', `${x} ${y} ${z}`);
    e.setAttribute('rotation', `${rotX} 0 0`);
    e.setAttribute('width', w);
    e.setAttribute('height', d);
    e.setAttribute('material', material);
    return e;
  }

  // Build a wall with a centered door cut-out by emitting two wall segments
  // plus a lintel above the opening. Returns an array of entities.
  function makeWallSegmented(axis, wallX, wallZ, wallW, wallH, thickness, material, doors) {
    const parts = [];

    // Sort door openings along the wall length
    const openings = (doors || []).slice().sort((a, b) => a.offset - b.offset);

    // If no doors, emit solid wall
    if (openings.length === 0) {
      parts.push(
        axis === 'x'
          ? makeSolidBox(wallX, wallH / 2, wallZ, wallW, wallH, thickness, material)
          : makeSolidBox(wallX, wallH / 2, wallZ, thickness, wallH, wallW, material)
      );
      return parts;
    }

    // Walk the wall emitting segments between openings and lintels above openings
    const half = wallW / 2;
    let cursor = -half;

    for (const door of openings) {
      const dStart = door.offset - door.width / 2;
      const dEnd   = door.offset + door.width / 2;

      // Segment before door
      if (dStart > cursor) {
        const segW = dStart - cursor;
        const segCenter = (cursor + dStart) / 2;
        parts.push(
          axis === 'x'
            ? makeSolidBox(wallX + segCenter, wallH / 2, wallZ, segW, wallH, thickness, material)
            : makeSolidBox(wallX, wallH / 2, wallZ + segCenter, thickness, wallH, segW, material)
        );
      }

      // Lintel above door (door opening ~2.1m tall, lintel fills from 2.1 to wallH)
      // Lintels are NOT solid — player walks under them, not through them.
      const lintelY = 2.1 + (wallH - 2.1) / 2;
      const lintelH = wallH - 2.1;
      if (lintelH > 0.05) {
        const doorCenter = door.offset;
        parts.push(
          axis === 'x'
            ? makeBox(wallX + doorCenter, lintelY, wallZ, door.width, lintelH, thickness, material)
            : makeBox(wallX, lintelY, wallZ + doorCenter, thickness, lintelH, door.width, material)
        );
      }

      cursor = dEnd;
    }

    // Final segment after last door
    if (cursor < half) {
      const segW = half - cursor;
      const segCenter = (cursor + half) / 2;
      parts.push(
        axis === 'x'
          ? makeSolidBox(wallX + segCenter, wallH / 2, wallZ, segW, wallH, thickness, material)
          : makeSolidBox(wallX, wallH / 2, wallZ + segCenter, thickness, wallH, segW, material)
      );
    }

    return parts;
  }

  function buildRoom(parent, room) {
    const g = makeEntity({
      id: room.id,
      'data-room-label': room.label,
      position: `${WING.origin.x + room.x} 0 ${WING.origin.z + room.z}`,
    });

    const h = WING.ceilingY;
    const t = WING.wallT;
    const w = room.w;
    const d = room.d;

    const wallMat = `color: ${room.wall}; roughness: 0.85; metalness: 0.0`;
    const floorMat = `color: ${room.floor}; roughness: 0.6; metalness: 0.1`;
    const ceilMat  = `color: #15110c; roughness: 0.95`;

    // Floor
    const floor = makePlane(0, 0.01, 0, w, d, -90, floorMat);
    g.appendChild(floor);

    // Ceiling (light source side down)
    const ceil = makePlane(0, h, 0, w, d, 90, ceilMat);
    g.appendChild(ceil);

    // Walls — collect door specs per wall
    const doorsByWall = { north: [], south: [], east: [], west: [] };
    (room.doors || []).forEach((door) => {
      if (doorsByWall[door.wall]) doorsByWall[door.wall].push(door);
    });

    // North wall (negative z direction, at z = -d/2)
    makeWallSegmented('x', 0, -d / 2, w, h, t, wallMat, doorsByWall.north)
      .forEach((p) => g.appendChild(p));

    // South wall (positive z direction, at z = +d/2)
    makeWallSegmented('x', 0, d / 2, w, h, t, wallMat, doorsByWall.south)
      .forEach((p) => g.appendChild(p));

    // East wall (positive x, at x = +w/2)
    makeWallSegmented('z', w / 2, 0, d, h, t, wallMat, doorsByWall.east)
      .forEach((p) => g.appendChild(p));

    // West wall (negative x, at x = -w/2)
    makeWallSegmented('z', -w / 2, 0, d, h, t, wallMat, doorsByWall.west)
      .forEach((p) => g.appendChild(p));

    // Ambient room light
    if (room.ambient) {
      g.appendChild(makeEntity({
        light: `type: point; color: ${room.ambient.color}; intensity: ${room.ambient.intensity}; distance: ${Math.max(w, d) * 1.5}; decay: 1.5`,
        position: `0 ${h - 0.4} 0`,
      }));
    }

    // Built-in stage for Main Lounge (north wall, raised 0.3m)
    if (room.hasStage) {
      const stageW = 4.2;
      const stageD = 2.4;
      const stageY = 0.3;
      // Platform
      g.appendChild(makeBox(0, stageY / 2, -d / 2 + stageD / 2 + 0.2,
        stageW, stageY, stageD,
        'color: #1a100a; roughness: 0.6; metalness: 0.15'));
      // Edge glow strip
      g.appendChild(makeBox(0, stageY + 0.01, -d / 2 + stageD + 0.2,
        stageW, 0.03, 0.05,
        'color: #c9a961; emissive: #c9a961; emissiveIntensity: 0.5'));
    }

    // Subtle floor label (hidden at eye level, visible from above in tuner)
    const label = document.createElement('a-text');
    label.setAttribute('value', room.label);
    label.setAttribute('position', `0 0.02 0`);
    label.setAttribute('rotation', '-90 0 0');
    label.setAttribute('align', 'center');
    label.setAttribute('color', '#8a8070');
    label.setAttribute('width', w * 0.6);
    label.setAttribute('opacity', '0.22');
    g.appendChild(label);

    // Member-only door: velvet rope visual in front of Cigar Lounge entrance
    // (actual access check handled in PR 6)
    if (room.memberOnly) {
      const ropeX = w / 2 + 0.3;
      g.appendChild(makeBox(ropeX, 0.9, 0, 0.05, 0.05, 1.4,
        'color: #8a1a1a; emissive: #8a1a1a; emissiveIntensity: 0.2'));
      g.appendChild(makeBox(ropeX, 0.45, -0.7, 0.08, 0.9, 0.08,
        'color: #c9a961; metalness: 0.6; roughness: 0.3'));
      g.appendChild(makeBox(ropeX, 0.45, 0.7, 0.08, 0.9, 0.08,
        'color: #c9a961; metalness: 0.6; roughness: 0.3'));
    }

    parent.appendChild(g);
    return g;
  }

  // ─── External wing signage — visible from the mall corridor ─
  function buildSignage(parent) {
    const sig = makeEntity({
      id: 'cs-wing-signage',
      position: `${WING.origin.x - 6.5 - 5.49 / 2 - 0.1} 0 ${WING.origin.z + 5.5}`,
    });

    // "CAFÉ SATIVA" text on the foyer west wall, facing -x (toward corridor)
    const title = document.createElement('a-text');
    title.setAttribute('value', 'CAFÉ SATIVA');
    title.setAttribute('position', '-0.1 2.4 0');
    title.setAttribute('rotation', '0 -90 0');
    title.setAttribute('align', 'center');
    title.setAttribute('color', '#c9a961');
    title.setAttribute('width', '5');
    sig.appendChild(title);

    const sub = document.createElement('a-text');
    sub.setAttribute('value', 'Sip • Stage • Gallery');
    sub.setAttribute('position', '-0.1 1.9 0');
    sub.setAttribute('rotation', '0 -90 0');
    sub.setAttribute('align', 'center');
    sub.setAttribute('color', '#f5e6d3');
    sub.setAttribute('width', '3');
    sub.setAttribute('opacity', '0.7');
    sig.appendChild(sub);

    parent.appendChild(sig);
  }

  // ─── Entry point ─────────────────────────────────────────────
  const CafeSativaWing = {
    build: function () {
      const scene = document.querySelector('a-scene');
      if (!scene) return;

      // Remove any previous wing (supports hot reload / retry)
      const prev = document.getElementById('cs-wing');
      if (prev) prev.remove();

      const wing = makeEntity({
        id: 'cs-wing',
        'data-wing': 'cafe-sativa',
      });
      scene.appendChild(wing);

      ROOMS.forEach((room) => buildRoom(wing, room));
      buildSignage(wing);

      console.log('[CafeSativaWing] Built 6 rooms @', WING.origin);
    },

    // Exported for the tuner to live-introspect
    ROOMS: ROOMS,
    WING: WING,
  };

  window.CafeSativaWing = CafeSativaWing;

  // Build on scene-loaded
  document.addEventListener('DOMContentLoaded', function () {
    const scene = document.querySelector('a-scene');
    if (!scene) return;
    const go = () => CafeSativaWing.build();
    if (scene.hasLoaded) go();
    else scene.addEventListener('loaded', go);
  });
})();
