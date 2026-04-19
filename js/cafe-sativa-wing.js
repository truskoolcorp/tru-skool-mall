/* ═══════════════════════════════════════════════════════════════════════
   CAFÉ SATIVA — WING V2 (Master Plan Spec)
   ═══════════════════════════════════════════════════════════════════════

   Built to the locked master-plan floor plan:

     Flow: Entrance → Gallery → Bar → Main Lounge → (Culinary | Cigar)
     Total: ~22m × 20m (~4,700 sq ft, ~440 m²)

   9 rooms:

     1. Entrance Foyer          4 × 3.5m   — 4m ceiling, host stand
     2. Cold Stoned Window      4 × 4.5m   — 4m, street-facing (east wall)
     3. Cocktail Bar            10 × 8m    — 4.5m, horseshoe + bottle wall
     4. Gallery Atrium          6 × 8m     — 10m DOUBLE HEIGHT, art + NFT wall
     5. Main Lounge (Stage)     15 × 8.5m  — 6m, jazz stage + runway
     6. Cigar Lounge            6 × 8.5m   — 3m, airlock, switchable glass
     7. Culinary Theater        10 × 5m    — 5m, open demo kitchen
     8. Courtyard               5 × 5m     — open to 12m shell, open-air
     9. Back of House           5 × 5m     — 3m, staff corridor

   Golden rules:
     - No guest accidentally walks into smoke (airlock + VIP gate)
     - No smoke leaks into sip/vibe (separate ventilation conceptually)
     - Energy builds, doesn't clash (Gallery as psychological transition)

   Spatial placement in mall:
     The wing sits EAST of the main corridor (x > 15). Players enter by
     walking through a door opening cut into the corridor's east wall.
     Wing occupies x = [16, 38], z = [-40, -18] (centered at x=27, z=-29).

     Mall outer shell ceiling is at Y=12. Rooms have inset ceilings at
     their own heights with plenum space above (dark, unrendered).

   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ═══ Wing-level configuration ═══
  const WING = {
    // World-space anchor for the wing. All room positions are relative.
    // Wing footprint: 22m wide (x) × 22m deep (z), centered at anchor.
    // Mall corridor right wall is at x=15; wing starts at x=16 (1m gap
    // for the wall thickness + entry vestibule feeling).
    origin: { x: 27, z: -29 },

    // Mall outer shell ceiling (matches corridor at y=12). Lower room
    // ceilings are inset below this. The space between a room ceiling
    // and the 12m shell is dark plenum — not rendered as a visible
    // surface, just sits in shadow.
    shellCeilingY: 12,

    // Wall thickness for interior partitions.
    wallT: 0.2,

    // Door opening specs.
    doorHeight: 2.4,      // standard door height (taller than previous 2.1 — more grand)
    doorWidth:  1.6,      // single door
    doubleWide: 2.4,      // double-wide opening (Gallery arches)
    airlockGap: 1.2,      // airlock vestibule between cigar doors
  };

  // ═══ Room definitions ═══
  // Each room's x/z is the CENTER position, relative to wing origin.
  // w/d are width (x-axis) and depth (z-axis).
  // ceilingY is the room's own inset ceiling height.
  //
  // Layout (looking down, +z is further from mall entrance = deeper into wing):
  //
  //   x-axis →  west (mall corridor side)  →  east (street side)
  //                 x = -11            0             +11
  //   z -10 ┌──────────────┬────────────────────┬──────────────┐
  //   ▲     │ CULINARY     │    MAIN LOUNGE    │   CIGAR      │
  //   │     │ THEATER      │     (STAGE)        │   LOUNGE     │
  //   │     │ 10×5         │    15×8.5          │   6×8.5      │
  //   │     │              │                    │  [airlock]   │
  //   z  -2 ├──────────────┼────────────────────┼──────────────┤
  //         │              │                    │              │
  //         │   BOH        │  BAR (10×8)        │  COURTYARD   │
  //         │  5×5         │  ← horseshoe       │  5×5         │
  //         │              │                    │  (open-air)  │
  //   z +5 ├──────────────┼────────────────────┼──────────────┤
  //         │              │   GALLERY ATRIUM   │              │
  //         │              │   6×8 (10m high)   │              │
  //   z +9 │              ├────────┬───────────┤  COLD STONED │
  //         │              │        │            │  4×4.5       │
  //         │              │ FOYER  │            │  (street-    │
  //         │              │ 4×3.5  │            │   facing)    │
  //   z+11 └──────────────┴────────┴────────────┴──────────────┘
  //                        ↓
  //                 WING ENTRANCE (from mall corridor, west side)
  //
  // Note: this layout deviates slightly from a strict rectangle. The
  // Foyer is small (3.5m deep) so the wing's total depth is 22m, with
  // 2m of "entry buffer" in front of the Foyer for approach.
  //
  const ROOMS = [
    {
      id: 'foyer',
      label: 'Entrance Foyer',
      // Foyer is on the west (corridor) side, centered z-wise lower (near entry)
      x: -5, z: 9.25,
      w: 4,  d: 3.5,
      ceilingY: 4,
      floor: '#8b6f47',           // warm oak
      wall:  '#f0e8da',           // cream plaster
      ambient: { color: '#e8c080', intensity: 0.7 },
      // Door openings:
      //   south wall: the WING ENTRY — connects from mall corridor
      //     (this is the door in the mall's east corridor wall)
      //   north wall: leads INTO the Gallery Atrium
      doors: [
        { wall: 'south', offset: 0, width: 1.8 },  // main entry
        { wall: 'north', offset: 0, width: 2.4 },  // into Gallery (double-wide arch)
      ],
    },

    {
      id: 'gallery',
      label: 'Gallery Atrium',
      // Gallery is the CENTRAL hub — directly north of Foyer, between
      // Bar (east) and... actually per master plan flow, Foyer → Gallery
      // → Bar. So Gallery is ABOVE Foyer (smaller z), Bar is further
      // north still. Let me re-read the flow:
      //
      //   Entrance → Gallery → Bar → Lounge → (Cigar | Culinary)
      //
      // So from Foyer, you walk forward (smaller z) into Gallery.
      // From Gallery, you walk further forward (smaller z) into Bar.
      // From Bar, you walk further forward into Main Lounge.
      // From Main Lounge, you branch east (Cigar) or west (Culinary).
      //
      // This means the wing is organized as progressive rooms along
      // the z-axis, deepening as you go in.
      x: -5, z: 3.5,
      w: 6,  d: 8,
      ceilingY: 10,  // DOUBLE HEIGHT — the "reveal" moment
      floor: '#e8e0d0',           // travertine
      wall:  '#fbf6eb',           // warm cream white
      ambient: { color: '#ffffff', intensity: 1.0 },  // bright, gallery-lit
      doors: [
        { wall: 'south', offset: 0, width: 2.4 },  // from Foyer
        { wall: 'north', offset: 0, width: 2.4 },  // into Bar
      ],
    },

    {
      id: 'bar',
      label: 'Cocktail Bar',
      x: -3, z: -4.5,
      w: 10, d: 8,
      ceilingY: 4.5,
      floor: '#3a2a20',           // polished dark concrete
      wall:  '#2a1f18',           // charcoal
      ambient: { color: '#c08850', intensity: 0.85 },  // amber, seductive
      doors: [
        { wall: 'south', offset: 0, width: 2.4 },  // from Gallery
        { wall: 'north', offset: 0, width: 3.0 },  // into Main Lounge (wider, more flow)
        // Staff door to BOH (west wall)
        { wall: 'west', offset: 0, width: 1.4 },
      ],
    },

    {
      id: 'main-lounge',
      label: 'Main Lounge',   // "The Stage" in event mode
      x: -3, z: -13,
      w: 15, d: 8.5,
      ceilingY: 6,  // tall — stage truss + lighting rigs
      floor: '#2a1a10',           // dark oak chevron
      wall:  '#3a4a38',           // sage
      ambient: { color: '#c08850', intensity: 0.6 },
      doors: [
        { wall: 'south', offset: 0, width: 3.0 },  // from Bar
        // Branch points at the north end:
        { wall: 'west', offset: -3, width: 1.4 },  // into Culinary
        { wall: 'east', offset: -3, width: 1.6 },  // into Cigar Airlock
      ],
    },

    {
      id: 'culinary',
      label: 'Culinary Theater',
      x: -11, z: -14.75,  // west of Main Lounge's north-west end
      w: 10, d: 5,
      ceilingY: 5,
      floor: '#c8c0b0',           // polished concrete
      wall:  '#f4f0e8',           // subway-tile light
      ambient: { color: '#e8a050', intensity: 0.7 },  // copper heat-lamp warmth
      doors: [
        { wall: 'east', offset: 1.75, width: 1.4 },  // from Main Lounge NW corner
        // Staff door to BOH
        { wall: 'south', offset: 0, width: 1.2 },
      ],
    },

    {
      id: 'cigar-airlock',
      label: 'Cigar Lounge Entrance',
      // The airlock is a TINY vestibule between Main Lounge and Cigar.
      // Two doors, one on each side, never open at the same time (visually).
      x: 5, z: -14.75,
      w: WING.airlockGap + 0.8, d: 1.5,
      ceilingY: 3,
      floor: '#2a2020',
      wall:  '#1a1410',           // very dark, transitional
      ambient: { color: '#603020', intensity: 0.3 },  // dim
      doors: [
        { wall: 'west', offset: 0, width: 1.4 },  // from Main Lounge east side
        { wall: 'east', offset: 0, width: 1.4 },  // into Cigar Lounge proper
      ],
      vipGated: false,  // airlock itself is accessible — the INNER door gates
    },

    {
      id: 'cigar',
      label: 'Cigar Lounge',
      x: 9, z: -13,
      w: 6, d: 8.5,
      ceilingY: 3,  // INTENTIONALLY LOW — cozy, per master plan
      floor: '#1a1008',           // dark walnut
      wall:  '#2a3828',           // forest-green leather feel
      ambient: { color: '#a06030', intensity: 0.4 },  // dim, moody
      doors: [
        { wall: 'west', offset: 0, width: 1.4 },  // from airlock
      ],
      vipGated: true,   // VIP tier required — handled by CS access system
    },

    {
      id: 'courtyard',
      label: 'Courtyard',
      x: 9, z: -4.5,
      w: 5, d: 5,
      ceilingY: 12,  // open-air — room ceiling = mall outer shell
      ceilingOmit: true,  // don't render a ceiling plane (it's sky)
      floor: '#c0a878',           // warm stone pavers
      wall:  '#d0c0a0',           // sandstone
      ambient: { color: '#ffd8a0', intensity: 0.6 },  // warm exterior light
      doors: [
        // Access from the Bar (spillover)
        { wall: 'west', offset: 0, width: 1.8 },
        // Access from Cold Stoned (to the south)
        { wall: 'south', offset: 0, width: 1.4 },
      ],
    },

    {
      id: 'cold-stoned',
      label: 'Cold Stoned Window',
      x: 9, z: 3.5,
      w: 4, d: 4.5,
      ceilingY: 4,
      floor: '#f0ece0',           // bright tile
      wall:  '#fdfaf0',           // bright white
      ambient: { color: '#ffffff', intensity: 1.2 },  // bright daytime
      doors: [
        { wall: 'north', offset: 0, width: 1.4 },  // into Courtyard
        // "Street-facing window" — just a wall panel stylized as a window
        // (no actual street outside yet; handled as decoration in render)
      ],
    },

    {
      id: 'boh',
      label: 'Back of House',
      x: -11, z: -4.5,
      w: 5, d: 5,
      ceilingY: 3,
      floor: '#606060',           // utility concrete
      wall:  '#808080',           // industrial gray
      ambient: { color: '#c0c0c0', intensity: 0.5 },
      doors: [
        { wall: 'east',  offset: 0, width: 1.4 },  // to Bar (staff corridor)
        { wall: 'north', offset: 0, width: 1.2 },  // to Culinary
      ],
      staffOnly: true,  // visually distinct — players can enter but signage says STAFF
    },
  ];

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

  // Wall segment marked solid for the mall collision system.
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

  function makeText(x, y, z, rotY, value, color, width) {
    const e = document.createElement('a-text');
    e.setAttribute('position', `${x} ${y} ${z}`);
    e.setAttribute('rotation', `0 ${rotY} 0`);
    e.setAttribute('value', value);
    e.setAttribute('color', color || '#c9a84c');
    e.setAttribute('width', width || 4);
    e.setAttribute('align', 'center');
    return e;
  }

  // ─── Wall-with-doors segmenter ────────────────────────────────────────
  // Given one wall of a room, emit N solid-wall box segments with gaps
  // at each door specified. Also emits a non-solid lintel above each
  // door so players walk under the opening.
  function makeWallSegmented(axis, wallX, wallZ, wallW, wallH, thickness, material, doors) {
    const parts = [];
    const half = wallW / 2;

    doors = (doors || []).slice().sort((a, b) => a.offset - b.offset);

    if (doors.length === 0) {
      parts.push(
        axis === 'x'
          ? makeSolidBox(wallX, wallH / 2, wallZ, wallW, wallH, thickness, material)
          : makeSolidBox(wallX, wallH / 2, wallZ, thickness, wallH, wallW, material)
      );
      return parts;
    }

    let cursor = -half;
    for (const door of doors) {
      const dStart = door.offset - door.width / 2;
      const dEnd   = door.offset + door.width / 2;

      // Segment before this door
      if (dStart > cursor) {
        const segW = dStart - cursor;
        const segCenter = (cursor + dStart) / 2;
        parts.push(
          axis === 'x'
            ? makeSolidBox(wallX + segCenter, wallH / 2, wallZ, segW, wallH, thickness, material)
            : makeSolidBox(wallX, wallH / 2, wallZ + segCenter, thickness, wallH, segW, material)
        );
      }

      // Lintel above door (non-solid, so player walks under)
      const lintelY = WING.doorHeight + (wallH - WING.doorHeight) / 2;
      const lintelH = wallH - WING.doorHeight;
      if (lintelH > 0.05) {
        parts.push(
          axis === 'x'
            ? makeBox(wallX + door.offset, lintelY, wallZ, door.width, lintelH, thickness, material)
            : makeBox(wallX, lintelY, wallZ + door.offset, thickness, lintelH, door.width, material)
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

  // ─── Single room builder ──────────────────────────────────────────────
  function buildRoom(parent, room) {
    const g = makeEntity({
      id: `cs-room-${room.id}`,
      'data-room-label': room.label,
      position: `${WING.origin.x + room.x} 0 ${WING.origin.z + room.z}`,
    });

    const h = room.ceilingY;
    const t = WING.wallT;
    const w = room.w;
    const d = room.d;

    const wallMat  = `color: ${room.wall}; roughness: 0.85; metalness: 0.0`;
    const floorMat = `color: ${room.floor}; roughness: 0.6; metalness: 0.1`;
    const ceilMat  = `color: #2a2420; roughness: 0.9; side: double`;

    // Floor
    g.appendChild(makePlane(0, 0.01, 0, w, d, -90, floorMat));

    // Ceiling (unless room is open-air like Courtyard)
    if (!room.ceilingOmit) {
      g.appendChild(makePlane(0, h, 0, w, d, 90, ceilMat));
    }

    // Build each wall with door openings
    const doorsByWall = { north: [], south: [], east: [], west: [] };
    (room.doors || []).forEach((door) => {
      if (doorsByWall[door.wall]) doorsByWall[door.wall].push(door);
    });

    makeWallSegmented('x', 0, -d / 2, w, h, t, wallMat, doorsByWall.north)
      .forEach((p) => g.appendChild(p));
    makeWallSegmented('x', 0,  d / 2, w, h, t, wallMat, doorsByWall.south)
      .forEach((p) => g.appendChild(p));
    makeWallSegmented('z',  w / 2, 0, d, h, t, wallMat, doorsByWall.east)
      .forEach((p) => g.appendChild(p));
    makeWallSegmented('z', -w / 2, 0, d, h, t, wallMat, doorsByWall.west)
      .forEach((p) => g.appendChild(p));

    // Ambient room light near the ceiling
    if (room.ambient) {
      g.appendChild(makeEntity({
        light: `type: point; color: ${room.ambient.color}; intensity: ${room.ambient.intensity}; distance: ${Math.max(w, d) * 1.8}; decay: 1.5`,
        position: `0 ${h - 0.5} 0`,
      }));
    }

    // Floor-level room label (diagnostic — helps orient during walkthrough)
    g.appendChild(makeText(0, 0.03, 0, 0, room.label.toUpperCase(), '#555555', Math.min(w, d) * 0.9));

    // VIP gate indicator on the Cigar door (non-gameplay visual cue)
    if (room.vipGated) {
      // Velvet rope visual at the entrance (west door of Cigar)
      const rope = makeEntity({
        position: `${-w / 2 + 0.4} 0.5 0`,
        rotation: '0 0 0',
      });
      // Two stanchion posts + rope between them
      rope.appendChild(makeBox(0, 0.5, -0.4, 0.08, 1.0, 0.08, 'color: #c9a84c; metalness: 0.9; roughness: 0.2'));
      rope.appendChild(makeBox(0, 0.5,  0.4, 0.08, 1.0, 0.08, 'color: #c9a84c; metalness: 0.9; roughness: 0.2'));
      rope.appendChild(makeBox(0, 0.85, 0, 0.04, 0.04, 0.8, 'color: #6a0d1a; metalness: 0.1; roughness: 0.9'));
      g.appendChild(rope);
    }

    parent.appendChild(g);
  }

  // ─── Wing shell — outer walls that close off the wing from the sky ────
  // These walls form the perimeter that the master-plan master shape sits
  // inside. Because we've placed rooms to tile the 22×22 footprint, most
  // of the perimeter is already covered by room walls. But the wing's
  // outer-facing walls (especially east = street-facing, north = back
  // alley) need a shell so we don't see the skybox through gaps.
  //
  // For now we rely on the rooms' own outer walls. If gaps appear at
  // walkthrough time, we add shell panels here.
  function buildWingShell(parent) {
    // Floor under the whole wing (safety net in case any room floor misses)
    const floorMat = 'color: #1a1410; roughness: 0.9';
    const floor = makePlane(WING.origin.x, 0, WING.origin.z, 22, 22, -90, floorMat);
    parent.appendChild(floor);

    // No outer ceiling — the mall's 12m shell ceiling above the corridor
    // doesn't extend over the wing. We rely on a skybox or dark void.
    // The wing is covered by its rooms' own inset ceilings.
  }

  // ─── Wing entry cue — a signed archway at the wing entrance ──────────
  // Visible from the main mall corridor, announces "Café Sativa" to
  // entering guests.
  function buildEntryCue(parent) {
    // The Foyer's south wall is at world z = origin.z + foyer.z + foyer.d/2
    //   = -29 + 9.25 + 1.75 = -18
    // The Foyer is centered at world x = origin.x + foyer.x
    //   = 27 + (-5) = 22
    // So the entry door is at world (22, 0, -18).
    //
    // Place signage + torches just in front of it on the corridor side.

    const sign = makeEntity({
      position: `22 3.2 -18.5`,
      rotation: '0 180 0',
    });
    // Glowing "CAFÉ SATIVA" text
    const text = document.createElement('a-text');
    text.setAttribute('value', 'CAFÉ SATIVA');
    text.setAttribute('color', '#c9a84c');
    text.setAttribute('align', 'center');
    text.setAttribute('width', 6);
    text.setAttribute('font', 'mozillavr');
    sign.appendChild(text);

    // Tagline below
    const tag = document.createElement('a-text');
    tag.setAttribute('value', 'SIP  •  SMOKE  •  VIBE');
    tag.setAttribute('color', '#888');
    tag.setAttribute('position', '0 -0.6 0');
    tag.setAttribute('align', 'center');
    tag.setAttribute('width', 4);
    sign.appendChild(tag);

    parent.appendChild(sign);

    // Two amber wall sconces flanking the door
    const sconceMat = 'color: #c9a84c; emissive: #c9a84c; emissiveIntensity: 0.7';
    parent.appendChild(makeBox(20.5, 2.2, -18.1, 0.2, 0.4, 0.2, sconceMat));
    parent.appendChild(makeBox(23.5, 2.2, -18.1, 0.2, 0.4, 0.2, sconceMat));

    // Point lights at each sconce
    parent.appendChild(makeEntity({
      light: 'type: point; color: #c9a84c; intensity: 0.6; distance: 4; decay: 2',
      position: '20.5 2.2 -18.1',
    }));
    parent.appendChild(makeEntity({
      light: 'type: point; color: #c9a84c; intensity: 0.6; distance: 4; decay: 2',
      position: '23.5 2.2 -18.1',
    }));
  }

  // ─── Door in mall corridor wall — opening for the wing entry ──────────
  // The mall's east corridor wall is at x=15, runs from z=-70 to z=10.
  // We need a door opening at z ≈ -18 so players can walk from the
  // corridor into the CS Foyer. The corridor wall itself is a single
  // large box in index.html, so we can't easily segment it here. Instead:
  // we add a THIN door-frame visual and rely on the fact that the
  // corridor wall is just visually solid. Players walking east at z=-18
  // will hit the collision, but the door opening is where they expect
  // to pass through.
  //
  // For now, we'll add a visible door-frame archway at the boundary,
  // and accept that collision needs an override. TODO: in a follow-up,
  // cut a physical gap in the corridor wall by replacing index.html's
  // single wall with a segmented version.
  function buildCorridorEntry(parent) {
    // Door frame at x=15 (corridor wall), z=-18 (lining up with Foyer)
    const frameMat = 'color: #2a1f18; roughness: 0.7; metalness: 0.3';

    // Top lintel
    parent.appendChild(makeBox(15, 2.8, -18, 0.4, 0.4, 2.2, frameMat));
    // Left jamb (toward z=-17)
    parent.appendChild(makeBox(15, 1.3, -16.9, 0.4, 2.6, 0.2, frameMat));
    // Right jamb (toward z=-19.1)
    parent.appendChild(makeBox(15, 1.3, -19.1, 0.4, 2.6, 0.2, frameMat));

    // "Welcome" sign on corridor side (facing west into corridor)
    const welcome = document.createElement('a-text');
    welcome.setAttribute('value', '→  Enter the Lounge');
    welcome.setAttribute('color', '#c9a84c');
    welcome.setAttribute('position', '14.7 1.8 -18');
    welcome.setAttribute('rotation', '0 -90 0');
    welcome.setAttribute('align', 'center');
    welcome.setAttribute('width', 3);
    parent.appendChild(welcome);
  }

  // ─── Main render ──────────────────────────────────────────────────────
  function render() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    // Remove any previous wing (PR 2 / PR 6 old wing) so we start clean
    ['cs-wing-root', 'cs-wing-entry'].forEach((id) => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    });

    const root = makeEntity({ id: 'cs-wing-root' });

    buildWingShell(root);
    ROOMS.forEach((room) => buildRoom(root, room));
    buildEntryCue(root);
    buildCorridorEntry(root);

    scene.appendChild(root);

    // Refresh mall collision system after all solid walls are in place
    setTimeout(() => {
      if (window.MallCollider && typeof window.MallCollider.refresh === 'function') {
        window.MallCollider.refresh();
      }
    }, 300);

    console.log('[CS Wing V2] Rendered', ROOMS.length, 'rooms per master-plan spec');
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

  // Public API
  window.CSWingV2 = { render, ROOMS, WING };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
