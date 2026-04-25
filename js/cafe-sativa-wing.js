/* ═══════════════════════════════════════════════════════════════════════
   CAFÉ SATIVA — WING V3 (audit-validated, shared walls, aligned doors)
   ═══════════════════════════════════════════════════════════════════════

   Rebuilt from the master plan with a straight flow spine:

     Foyer → Gallery → Bar → Main Lounge → (Culinary | Cigar via airlock)

   All rooms use WORLD coordinates directly (no wing-local translation).
   The layout is validated by tools/audit-wing.js before commit — all
   adjacencies share walls, all doors align, no orphans, no overlaps.

   Coordinate convention (matches mall corridor):
     - Mall entrance at z=+3 (large z). Back of mall at z=-70.
     - Smaller z = deeper = "north" in our internal terminology.
     - Mall corridor east wall at x=15. CS wing starts at x=15 (Entry
       Arcade piggybacks on this wall; rooms proper start at x=17).

   Room dimensions (master plan):
     1. Entrance Foyer           4.0 × 3.5   (4m ceiling)
     2. Gallery Atrium           6.0 × 8.0   (10m DOUBLE HEIGHT)
     3. Cocktail Bar            10.0 × 8.0   (4.5m ceiling)
     4. Main Lounge             15.0 × 8.5   (6m ceiling)
     5. Cold Stoned Window       4.0 × 4.5   (4m ceiling)
     6. Courtyard                7.0 × 5.0   (open-air)
     7. Cigar Airlock            3.2 × 1.5   (3m ceiling)
     8. Cigar Lounge             6.0 × 8.5   (3m ceiling)
     9. Back of House            5.0 × 5.0   (3m ceiling)
    10. Culinary Theater         5.0 × 5.0   (5m ceiling)

   Entry: 8m × 2m covered arcade from mall corridor (x=15) to Foyer (x=23).

   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ═══ Room definitions — WORLD coordinates ═══
  //
  // Door definition:
  //   wall:  'north' (at zMin), 'south' (at zMax),
  //          'east'  (at xMax), 'west'  (at xMin)
  //   at:    world-space CENTER coordinate along the door's wall axis
  //          (x for N/S walls, z for E/W walls)
  //   width: door opening width in meters (height is WING.doorHeight)
  //
  const ROOMS = [
    // ── FOYER ONLY ──
    // We've pivoted: Café Sativa is no longer a fully-walkable
    // multi-room venue. Instead, the foyer is the only walked space —
    // patrons meet Laviche (concierge), use a directory to pick a room,
    // and teleport into that room's dedicated standalone scene.
    //
    // Each room (Bar, Main Lounge, Cold Stoned, Cigar, Culinary,
    // Courtyard) lives in its own future scene file (cs-bar.html,
    // cs-main-lounge.html, etc.) — none of those rooms exist in this
    // wing anymore.
    //
    // Sized larger than original (was 4m × 4.5m) to give Laviche +
    // desk + directory panel comfortable space.
    {
      id: 'foyer',
      label: 'Café Sativa — Concierge',
      xMin: 22, xMax: 28, zMin: -24, zMax: -17,
      ceilingY: 6,
      floor: '#8b6f47',
      wall:  '#f0e8da',
      ambient: { color: '#e8c080', intensity: 0.9 },
      doors: [
        // Entry from arcade (arcade runs z=-19..-17 along foyer west wall)
        { wall: 'west', at: -18, width: 2.0 },
        // No other doors — Laviche's directory IS the navigation
      ],
    },
  ];

  // ── DEPRECATED ROOMS (removed) ──
  // gallery, bar, main-lounge, cold-stoned, courtyard, cigar-airlock,
  // cigar, boh, culinary — all moved to standalone per-room scenes
  // (not yet built; Foyer + Laviche + directory ships first).
  const _DEPRECATED_ROOMS = [
    // kept as reference for when individual rooms are rebuilt as
    // standalone scenes — original geometry coords:
    // gallery:        x=22..28,    z=-29.5..-21.5  ceil=6
    // bar:            x=20..30,    z=-37.5..-29.5  ceil=4.5
    // main-lounge:    x=17.5..32.5, z=-46..-37.5   ceil=4.5
    // cold-stoned:    x=28..32,    z=-26..-21.5    ceil=6
    // courtyard:      x=30..37,    z=-31..-26      ceil=12
    // cigar-airlock:  x=32.5..35.7, z=-44.5..-43   ceil=3
    // cigar:          x=35.7..41.7, z=-46..-37.5   ceil=3
    // boh:            x=15..20,    z=-34.5..-29.5  ceil=3
    // culinary:       x=22.5..27.5, z=-51..-46     ceil=4
  ];

  // ═══ Wing-level config ═══
  const WING = {
    wallT: 0.2,
    doorHeight: 2.4,
    // Entry arcade: 3m × 2m short threshold from mall corridor to Foyer
    // (was 8m long — Keith's feedback was 'too long, too columnar')
    arcade: {
      xMin: 20, xMax: 23, zMin: -19, zMax: -17,
      ceilingY: 4,
    },
  };

  // ═══ Helpers ═══
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

  // ─── Segmented wall builder (world-space) ─────────────────────────────
  // Emit solid-wall segments around door openings. Lintels above door
  // openings are non-solid boxes (players walk under them).
  //
  // axis: 'x' (wall runs along x-axis, perpendicular to z) or 'z'
  // fixed: perpendicular-axis coordinate of the wall
  // p0, p1: endpoints along the wall's axis
  // wallH: room ceiling height
  // material: wall material string
  // doors: array of {at, width} — door centers in wall-axis coords
  function buildWall(parent, axis, fixed, p0, p1, wallH, material, doors) {
    const t = WING.wallT;
    doors = (doors || []).slice().sort((a, b) => a.at - b.at);

    const pMin = Math.min(p0, p1), pMax = Math.max(p0, p1);

    if (doors.length === 0) {
      const center = (pMin + pMax) / 2;
      const length = pMax - pMin;
      if (axis === 'x') {
        parent.appendChild(makeSolidBox(center, wallH/2, fixed, length, wallH, t, material));
      } else {
        parent.appendChild(makeSolidBox(fixed, wallH/2, center, t, wallH, length, material));
      }
      return;
    }

    let cursor = pMin;
    for (const door of doors) {
      const dStart = door.at - door.width/2;
      const dEnd   = door.at + door.width/2;

      if (dStart > cursor + 0.001) {
        const segLen = dStart - cursor;
        const segCenter = (cursor + dStart) / 2;
        if (axis === 'x') {
          parent.appendChild(makeSolidBox(segCenter, wallH/2, fixed, segLen, wallH, t, material));
        } else {
          parent.appendChild(makeSolidBox(fixed, wallH/2, segCenter, t, wallH, segLen, material));
        }
      }

      // Lintel above door (fills the wall-above-door to the ceiling
      // so adjacent rooms stay visually separated). This is a single
      // wall-thick slab — looks dark from some angles but that's
      // correct architectural geometry.
      const lintelY = WING.doorHeight + (wallH - WING.doorHeight) / 2;
      const lintelH = wallH - WING.doorHeight;
      if (lintelH > 0.05) {
        if (axis === 'x') {
          parent.appendChild(makeBox(door.at, lintelY, fixed, door.width, lintelH, t, material));
        } else {
          parent.appendChild(makeBox(fixed, lintelY, door.at, t, lintelH, door.width, material));
        }
      }

      cursor = dEnd;
    }

    if (cursor < pMax - 0.001) {
      const segLen = pMax - cursor;
      const segCenter = (cursor + pMax) / 2;
      if (axis === 'x') {
        parent.appendChild(makeSolidBox(segCenter, wallH/2, fixed, segLen, wallH, t, material));
      } else {
        parent.appendChild(makeSolidBox(fixed, wallH/2, segCenter, t, wallH, segLen, material));
      }
    }
  }

  // ─── Single room builder ──────────────────────────────────────────────
  function buildRoom(parent, room, builtWalls) {
    const g = makeEntity({
      id: `cs-room-${room.id}`,
      'data-room-label': room.label,
    });

    const h = room.ceilingY;
    const wallMat  = `color: ${room.wall}; roughness: 0.85; metalness: 0.0`;
    const floorMat = `color: ${room.floor}; roughness: 0.6; metalness: 0.1`;
    const ceilMat  = `color: #2a2420; roughness: 0.9; side: double`;

    const w = room.xMax - room.xMin;
    const d = room.zMax - room.zMin;
    const cx = (room.xMin + room.xMax) / 2;
    const cz = (room.zMin + room.zMax) / 2;

    g.appendChild(makePlane(cx, 0.01, cz, w, d, -90, floorMat));
    if (!room.ceilingOmit) {
      g.appendChild(makePlane(cx, h, cz, w, d, 90, ceilMat));
    }

    const byWall = { north: [], south: [], east: [], west: [] };
    (room.doors || []).forEach((dr) => { if (byWall[dr.wall]) byWall[dr.wall].push(dr); });

    // Walls: north @ zMin (axis x), south @ zMax (axis x),
    //        east  @ xMax (axis z), west  @ xMin (axis z)
    //
    // Shared walls (between two adjacent rooms) were previously built
    // twice — once by each room — which caused z-fighting pixelation
    // on wall surfaces. Dedupe via `builtWalls` Set keyed by
    // "axis@fixedCoord" (e.g. "x@-21.5"). First room to claim a wall
    // line builds it; subsequent rooms skip. Wall heights between
    // adjacent rooms with different ceilings are reconciled by the
    // taller room claiming the wall first (we sort rooms descending
    // by height in buildAll).
    const tryWall = (axis, fixed, p0, p1, doors) => {
      const key = `${axis}@${fixed.toFixed(2)}`;
      if (builtWalls.has(key)) return;
      builtWalls.add(key);
      buildWall(g, axis, fixed, p0, p1, h, wallMat, doors);
    };
    tryWall('x', room.zMin, room.xMin, room.xMax, byWall.north);
    tryWall('x', room.zMax, room.xMin, room.xMax, byWall.south);
    tryWall('z', room.xMax, room.zMin, room.zMax, byWall.east);
    tryWall('z', room.xMin, room.zMin, room.zMax, byWall.west);

    if (room.ambient) {
      const maxDim = Math.max(w, d);
      g.appendChild(makeEntity({
        light: `type: point; color: ${room.ambient.color}; intensity: ${room.ambient.intensity}; distance: ${maxDim * 1.8}; decay: 1.5`,
        position: `${cx} ${h - 0.5} ${cz}`,
      }));
    }

    // Floor-level room labels intentionally NOT rendered — they
    // read backwards from player POV (image 4 showed 'CIGAR L'
    // upside-down on the floor, confusing). Rooms are identified
    // instead by wall signage (cafe-sativa-interiors.js wordmarks)
    // and doorway signs (doorway-signs.js).

    if (room.vipGated) {
      const rope = makeEntity({ position: `${room.xMin + 0.4} 0.5 ${cz}` });
      const postMat = 'color: #c9a84c; metalness: 0.9; roughness: 0.2';
      const ropeMat = 'color: #6a0d1a; metalness: 0.1; roughness: 0.9';
      rope.appendChild(makeBox(0, 0.5, -0.4, 0.08, 1.0, 0.08, postMat));
      rope.appendChild(makeBox(0, 0.5,  0.4, 0.08, 1.0, 0.08, postMat));
      rope.appendChild(makeBox(0, 0.85, 0, 0.04, 0.04, 0.8, ropeMat));
      g.appendChild(rope);
    }

    parent.appendChild(g);
  }

  // ─── Entry arcade: short clean threshold from mall corridor to Foyer ───
  // Keith feedback: too long + too columnar previously. Simplified to a
  // brief 3m portal with smooth walls, no pilasters, no decorative lights.
  function buildArcade(parent) {
    const A = WING.arcade;
    const w = A.xMax - A.xMin;
    const d = A.zMax - A.zMin;
    const cx = (A.xMin + A.xMax) / 2;
    const cz = (A.zMin + A.zMax) / 2;

    const floorMat = 'color: #6a5438; roughness: 0.7; metalness: 0.1';
    const ceilMat  = 'color: #2a2420; roughness: 0.9; side: double';
    const wallMat  = 'color: #3a2a20; roughness: 0.85; metalness: 0.1';   // deep walnut

    // Floor + ceiling
    parent.appendChild(makePlane(cx, 0.01, cz, w, d, -90, floorMat));
    parent.appendChild(makePlane(cx, A.ceilingY, cz, w, d, 90, ceilMat));

    // Smooth side walls — no pilasters, no decorative lights
    parent.appendChild(makeSolidBox(cx, A.ceilingY/2, A.zMin, w, A.ceilingY, 0.2, wallMat));
    parent.appendChild(makeSolidBox(cx, A.ceilingY/2, A.zMax, w, A.ceilingY, 0.2, wallMat));
  }

  // ─── Signage at the corridor entry ────────────────────────────────────
  function buildCorridorEntry(parent) {
    const sign = makeEntity({
      position: '14.7 3.2 -18',
      rotation: '0 -90 0',
    });
    const text = document.createElement('a-text');
    text.setAttribute('value', 'CAFE SATIVA');
    text.setAttribute('color', '#c9a84c');
    text.setAttribute('align', 'center');
    text.setAttribute('width', 6);
    text.setAttribute('font', 'mozillavr');
    sign.appendChild(text);

    const tag = document.createElement('a-text');
    tag.setAttribute('value', 'SIP  •  SMOKE  •  VIBE');
    tag.setAttribute('color', '#888');
    tag.setAttribute('position', '0 -0.6 0');
    tag.setAttribute('align', 'center');
    tag.setAttribute('width', 4);
    sign.appendChild(tag);

    parent.appendChild(sign);

    const sconceMat = 'color: #c9a84c; emissive: #c9a84c; emissiveIntensity: 0.7';
    parent.appendChild(makeBox(14.8, 2.2, -16.5, 0.2, 0.4, 0.2, sconceMat));
    parent.appendChild(makeBox(14.8, 2.2, -19.5, 0.2, 0.4, 0.2, sconceMat));

    parent.appendChild(makeEntity({
      light: 'type: point; color: #c9a84c; intensity: 0.6; distance: 4; decay: 2',
      position: '14.8 2.2 -16.5',
    }));
    parent.appendChild(makeEntity({
      light: 'type: point; color: #c9a84c; intensity: 0.6; distance: 4; decay: 2',
      position: '14.8 2.2 -19.5',
    }));
  }

  // ─── Wing perimeter safety fence ──────────────────────────────────────
  // Invisible solid walls around the foyer's bounding box. Tight cordon
  // — patrons can only walk arcade + foyer. Everything outside this
  // box is unreachable.
  //
  // Footprint: x=20..28 (arcade west to foyer east), z=-24..-17
  // (foyer south to arcade north). Single arcade opening at the
  // north edge of the west wall.
  function buildPerimeterFence(parent) {
    const fMat = 'color: #000000; opacity: 0; transparent: true';
    const h = 10, hy = h / 2;
    const t = 0.3;

    // West fence — split around arcade opening (z=-19..-17)
    // South segment: z=-24 to -19, length 5, center z=-21.5
    parent.appendChild(makeSolidBox(20 - t/2, hy, -21.5, t, h, 5, fMat));
    // (No north segment — wing ends at z=-17 which IS the arcade opening)

    // East fence — x=28, z=-24 to -17, length 7, center z=-20.5
    parent.appendChild(makeSolidBox(28 + t/2, hy, -20.5, t, h, 7, fMat));

    // South fence — z=-17, x=20 to 28, length 8, center x=24
    parent.appendChild(makeSolidBox(24, hy, -17 + t/2, 8, h, t, fMat));

    // North fence — z=-24, x=20 to 28, length 8, center x=24
    parent.appendChild(makeSolidBox(24, hy, -24 - t/2, 8, h, t, fMat));
  }

  // ─── Main render ──────────────────────────────────────────────────────
  function render() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    const existing = document.getElementById('cs-wing-root');
    if (existing) existing.remove();

    const root = makeEntity({ id: 'cs-wing-root' });

    buildArcade(root);
    // Shared-wall dedupe. See buildRoom for full explanation.
    // Sort rooms by ceiling height descending so tall-ceiling rooms
    // claim shared wall lines first — the shared wall then rises to
    // the tall ceiling, which is correct (short-ceiling room just has
    // its ceiling plane + a portion of the shared wall is "above
    // ceiling" in its view, invisible).
    const builtWalls = new Set();
    const roomsByHeight = ROOMS.slice().sort((a, b) => b.ceilingY - a.ceilingY);
    roomsByHeight.forEach((room) => buildRoom(root, room, builtWalls));
    buildCorridorEntry(root);
    buildPerimeterFence(root);

    scene.appendChild(root);

    setTimeout(() => {
      if (window.MallCollider && typeof window.MallCollider.refresh === 'function') {
        window.MallCollider.refresh();
      }
    }, 300);

    console.log('[CS Wing V3] Rendered', ROOMS.length, 'rooms + arcade (audit-validated layout)');
  }

  function init() {
    const scene = document.querySelector('a-scene');
    if (!scene) {
      document.addEventListener('DOMContentLoaded', init, { once: true });
      return;
    }
    if (scene.hasLoaded) {
      setTimeout(render, 400);
    } else {
      scene.addEventListener('loaded', () => setTimeout(render, 400));
    }
  }

  window.CSWingV3 = { render, ROOMS, WING };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
