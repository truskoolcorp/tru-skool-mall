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
    // ── SPINE (centered on x=25) ──
    {
      id: 'foyer',
      label: 'Entrance Foyer',
      xMin: 23, xMax: 27, zMin: -21.5, zMax: -17,
      ceilingY: 6,        // matches Gallery — eliminates see-through-ceiling
      floor: '#8b6f47',   // warm oak
      wall:  '#f0e8da',   // cream plaster
      ambient: { color: '#e8c080', intensity: 0.7 },
      doors: [
        { wall: 'west',  at: -18, width: 2.0 },   // entry from arcade (arcade runs z=-19..-17, spans full foyer west)
        { wall: 'north', at: 25, width: 2.4 },    // into Gallery
      ],
    },
    {
      id: 'gallery',
      label: 'Gallery Atrium',
      xMin: 22, xMax: 28, zMin: -29.5, zMax: -21.5,
      ceilingY: 6,        // was 10 — dropped to reduce door-lintel mass
      floor: '#e8e0d0',   // travertine
      wall:  '#fbf6eb',   // warm cream white
      ambient: { color: '#ffffff', intensity: 1.0 },
      doors: [
        { wall: 'south', at: 25, width: 2.4 },
        { wall: 'north', at: 25, width: 2.4 },
        { wall: 'east',  at: -24, width: 1.4 },  // into Cold Stoned
      ],
    },
    {
      id: 'bar',
      label: 'Cocktail Bar',
      xMin: 20, xMax: 30, zMin: -37.5, zMax: -29.5,
      ceilingY: 4.5,
      floor: '#3a2a20',
      wall:  '#2a1f18',   // charcoal
      ambient: { color: '#c08850', intensity: 0.85 },
      doors: [
        { wall: 'south', at: 25, width: 2.4 },
        { wall: 'north', at: 25, width: 3.0 },
        { wall: 'west',  at: -32, width: 1.4 },    // to BOH
        { wall: 'east',  at: -28.5, width: 1.8 },  // to Courtyard
      ],
    },
    {
      id: 'main-lounge',
      label: 'Main Lounge',
      xMin: 17.5, xMax: 32.5, zMin: -46, zMax: -37.5,
      ceilingY: 4.5,      // was 6 — dropped to reduce door-lintel mass
      floor: '#2a1a10',
      wall:  '#3a4a38',   // sage
      ambient: { color: '#c08850', intensity: 0.6 },
      doors: [
        { wall: 'south', at: 25, width: 3.0 },       // from Bar
        { wall: 'north', at: 25, width: 1.4 },       // to Culinary (behind stage)
        { wall: 'east',  at: -43.75, width: 1.4 },   // to Cigar Airlock
      ],
    },

    // ── EAST OF SPINE ──
    {
      id: 'cold-stoned',
      label: 'Cold Stoned Window',
      xMin: 28, xMax: 32, zMin: -26, zMax: -21.5,
      ceilingY: 6,        // matches Gallery — eliminates see-through-ceiling gap
      floor: '#f0ece0',
      wall:  '#fdfaf0',
      ambient: { color: '#ffffff', intensity: 1.2 },
      doors: [
        { wall: 'west',  at: -24, width: 1.4 },   // from Gallery
        { wall: 'north', at: 31, width: 1.4 },    // into Courtyard
      ],
    },
    {
      id: 'courtyard',
      label: 'Courtyard',
      xMin: 30, xMax: 37, zMin: -31, zMax: -26,
      ceilingY: 12,
      ceilingOmit: true,   // open-air
      floor: '#c0a878',    // warm stone pavers
      wall:  '#d0c0a0',
      ambient: { color: '#ffd8a0', intensity: 0.6 },
      doors: [
        { wall: 'south', at: 31, width: 1.4 },       // from Cold Stoned
        { wall: 'west',  at: -28.5, width: 1.8 },    // from Bar
      ],
    },
    {
      id: 'cigar-airlock',
      label: 'Cigar Airlock',
      xMin: 32.5, xMax: 35.7, zMin: -44.5, zMax: -43,
      ceilingY: 3,
      floor: '#2a2020',
      wall:  '#1a1410',
      ambient: { color: '#603020', intensity: 0.3 },
      doors: [
        { wall: 'west', at: -43.75, width: 1.4 },
        { wall: 'east', at: -43.75, width: 1.4 },
      ],
    },
    {
      id: 'cigar',
      label: 'Cigar Lounge',
      xMin: 35.7, xMax: 41.7, zMin: -46, zMax: -37.5,
      ceilingY: 3,
      floor: '#1a1008',
      wall:  '#2a3828',
      ambient: { color: '#a06030', intensity: 0.4 },
      doors: [
        { wall: 'west', at: -43.75, width: 1.4 },
      ],
      vipGated: true,
    },

    // ── WEST OF SPINE ──
    {
      id: 'boh',
      label: 'Back of House',
      xMin: 15, xMax: 20, zMin: -34.5, zMax: -29.5,
      ceilingY: 3,
      floor: '#606060',
      wall:  '#808080',
      ambient: { color: '#c0c0c0', intensity: 0.5 },
      doors: [
        { wall: 'east', at: -32, width: 1.4 },   // to Bar
      ],
      staffOnly: true,
    },
    {
      id: 'culinary',
      label: 'Culinary Theater',
      xMin: 22.5, xMax: 27.5, zMin: -51, zMax: -46,
      ceilingY: 4,        // was 5
      floor: '#c8c0b0',
      wall:  '#f4f0e8',
      ambient: { color: '#e8a050', intensity: 0.7 },
      doors: [
        { wall: 'south', at: 25, width: 1.4 },   // from Main Lounge (behind stage)
      ],
    },
  ];

  // ═══ Wing-level config ═══
  const WING = {
    wallT: 0.2,
    doorHeight: 2.4,
    // Entry arcade: 8m × 2m covered walkway from corridor wall to Foyer
    arcade: {
      xMin: 15, xMax: 23, zMin: -19, zMax: -17,
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

  // ─── Entry arcade: enclosed colonnade gallery from corridor to Foyer ───
  function buildArcade(parent) {
    const A = WING.arcade;
    const w = A.xMax - A.xMin;
    const d = A.zMax - A.zMin;
    const cx = (A.xMin + A.xMax) / 2;
    const cz = (A.zMin + A.zMax) / 2;

    const floorMat = 'color: #6a5438; roughness: 0.7; metalness: 0.1';
    const ceilMat  = 'color: #2a2420; roughness: 0.9; side: double';
    const wallMat  = 'color: #3a2a20; roughness: 0.85; metalness: 0.1';   // deep walnut
    const colMat   = 'color: #2a1d14; roughness: 0.8; metalness: 0.25';   // darker pilaster

    // Floor + ceiling
    parent.appendChild(makePlane(cx, 0.01, cz, w, d, -90, floorMat));
    parent.appendChild(makePlane(cx, A.ceilingY, cz, w, d, 90, ceilMat));

    // SOLID side walls — eliminates open-to-sky visual, gives a real "hall"
    // Walls pulled back 0.3m from the Foyer boundary (end at x=22.7 instead
    // of x=23) so the approach to the Foyer west door isn't a hard corner.
    const wallW   = (A.xMax - 0.3) - A.xMin;                  // 7.7m
    const wallCx  = A.xMin + wallW / 2;                       // centered on new length
    parent.appendChild(makeSolidBox(wallCx, A.ceilingY/2, A.zMin, wallW, A.ceilingY, 0.2, wallMat));
    parent.appendChild(makeSolidBox(wallCx, A.ceilingY/2, A.zMax, wallW, A.ceilingY, 0.2, wallMat));

    // Decorative pilasters — 3 per side along the new wall length
    const pilasterPositions = [A.xMin + 1.5, A.xMin + 4, A.xMax - 1.8];
    for (const x of pilasterPositions) {
      parent.appendChild(makeBox(x, A.ceilingY/2, A.zMin + 0.2, 0.4, A.ceilingY, 0.25, colMat));
      parent.appendChild(makeBox(x, A.ceilingY/2, A.zMax - 0.2, 0.4, A.ceilingY, 0.25, colMat));
      // Warm up-lights on each pilaster
      parent.appendChild(makeEntity({
        light: 'type: point; color: #e8a050; intensity: 0.35; distance: 3.5; decay: 2',
        position: `${x} ${A.ceilingY - 0.25} ${A.zMin + 0.3}`,
      }));
      parent.appendChild(makeEntity({
        light: 'type: point; color: #e8a050; intensity: 0.35; distance: 3.5; decay: 2',
        position: `${x} ${A.ceilingY - 0.25} ${A.zMax - 0.3}`,
      }));
    }
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
  // Invisible solid walls around the wing's bounding box. Backup against
  // rig-collider race conditions, player clipping, etc. The only opening
  // is at the arcade entry (x=15, z=-19..-17) where the player entered.
  //
  // Wing footprint: x=15..41.7, z=-51..-17 (arcade northmost at z=-17)
  // Fence height 10m — high enough that no look-up camera angle sees over.
  function buildPerimeterFence(parent) {
    const fMat = 'color: #000000; opacity: 0; transparent: true';
    const h = 10, hy = h / 2;
    const t = 0.3;
    // West fence — split around arcade opening (z=-19..-17)
    // South segment: z=-51 to -19, length 32, center z=-35
    parent.appendChild(makeSolidBox(15 - t/2, hy, -35, t, h, 32, fMat));
    // (No north segment — wing ends at z=-17 which IS the arcade opening)

    // East fence — x=41.7, z=-51 to -17, length 34, center z=-34
    parent.appendChild(makeSolidBox(41.7 + t/2, hy, -34, t, h, 34, fMat));

    // South fence — z=-17, x=15 to 41.7, length 26.7, center x=28.35
    // This closes the arcade's south side and Foyer/Cold Stoned's south
    // beyond where their own walls already exist.
    parent.appendChild(makeSolidBox(28.35, hy, -17 + t/2, 26.7, h, t, fMat));

    // North fence — z=-51, x=15 to 41.7, length 26.7, center x=28.35
    parent.appendChild(makeSolidBox(28.35, hy, -51 - t/2, 26.7, h, t, fMat));
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
