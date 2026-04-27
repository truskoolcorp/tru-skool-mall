/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Café Sativa Room Prop Catalog

   Shared catalog of prop placements for every CS room. Each
   per-room scene (cs-bar.html, cs-main-lounge.html, etc.)
   imports this and uses just its own room's entry.

   The main mall scene (index.html) only uses the 'foyer' entry —
   that lives in cafe-sativa-props.js because it renders alongside
   the live mall.

   ARCHITECTURE
     index.html  →  cafe-sativa-props.js  →  PROPS = { foyer: [...] }
     cs-bar.html →  cs-room-props.js (this file) → ROOM_PROPS.bar

   COORDINATE SYSTEM
     Each per-room scene uses a LOCAL coordinate system centered
     at room origin. Room is W × D meters; valid placement range:
       x: -W/2 to +W/2   (west to east)
       z: -D/2 to +D/2   (north/far wall to south/entrance)
       y: 0 (floor)      (props sit on floor; raised props use y>0)

     Player spawns near south wall (z = +D/2 - 1.2) facing north
     toward the room interior, so south-facing props face the
     player.

     The OLD wing-coords from cafe-sativa-wing.js (x=20..30,
     z=-37.5..-29.5 etc.) are NO LONGER USED for these placements.
     Each per-room HTML scene is fully self-contained.

   STARTING POSITIONS
     These are educated guesses based on real-world room layouts.
     Bar is currently the most-tested (cs-bar.html exists). Other
     rooms still need their per-room HTML scenes built — values
     below assume each room is approximately:
     - Bar: backbar against far wall, stools facing it from in front
     - Main lounge: stage at one short end, table+chair at center
     - Cigar lounge: armchair in corner with side table beside, humidor on far wall
     - Culinary: chef station at far end, tiered seating facing it, display in middle
     - Courtyard: olive tree in corner, fire pit center, bistro set opposite
     - Cold Stoned: display case at customer side, prep behind, menu on wall

     EVERYTHING IS APPROXIMATE. After the GLBs land, load any
     per-room scene with ?prop-tune=<roomId> to dial in positions
     visually with the slider panel from cafe-sativa-props.js.

   TUNING WORKFLOW
     1. Generate GLB → drops into assets/models/props/
     2. Load cs-<room>.html?prop-tune=<roomId>
     3. Drag sliders → live size+position readout
     4. Click "📋 Copy this prop" → manifest line in clipboard
     5. Replace the entry below with the tuned values
     6. Reload without ?prop-tune to confirm
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Per-room prop catalog ──────────────────────────────────
  const ROOM_PROPS = {

    // ═══ BAR ═════════════════════════════════════════════════
    // Bar is now built ENTIRELY from composition primitives in
    // cs-bar.html (see CSRoom.boot composition array). The Meshy
    // bar-counter-walnut.glb has been retired in favor of primitive
    // geometry that gives us:
    //   - Full control over proportions (7m bar, not the awkward
    //     2m Meshy gave us)
    //   - 36 bottles on 3 shelves (vs the GLB's frozen interior)
    //   - 7 stools in a precise row (brass + oxblood from primitives)
    //   - Every pendant gets its own point light
    //
    // Empty array = no Meshy props loaded for this room.
    'bar': [],

    // ═══ CIGAR LOUNGE (VIP) ══════════════════════════════════
    // Room: 5m × 4m × 3.0m centered at origin.
    //   x: -2.5 to +2.5    z: -2 to +2
    //
    // ═══ CIGAR LOUNGE ════════════════════════════════════════
    // Cigar is now built ENTIRELY from composition primitives in
    // cs-cigar.html. The Meshy GLBs (armchair, side-table, humidor)
    // are retired in favor of primitive geometry that gives:
    //   - Full control over chair proportions and rotation
    //   - 18-box humidor wall (vs the GLB's single small humidor)
    //   - Multi-shelf bookshelf (no Meshy GLB existed for this)
    //   - Persian rug for visual zoning
    //   - Two standing lamps with their own point lights
    //
    // Empty array = no Meshy props loaded for this room.
    'cigar': [],

    // ═══ MAIN LOUNGE ═════════════════════════════════════════
    // Room: 8m × 7m × 4.0m centered at origin.
    //   x: -4 to +4    z: -3.5 to +3.5
    //
    // Verse Alkemist sessions venue. Stage along the NORTH wall
    // (where performer sits, facing south toward audience), host
    // table center-stage for guest interview format, dining
    // chairs flanking it. Audience would stand/sit anywhere
    // facing the stage — implied by the 7m of depth.
    'main-lounge': [
      {
        // Stage platform along north wall. Performer faces SOUTH.
        src: 'assets/models/props/lounge-stage-platform.glb',
        instances: [
          { pos: '0 0 -2.8', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        // Host table on the stage — interview/discussion format
        src: 'assets/models/props/lounge-host-table.glb',
        instances: [
          { pos: '0 0 -2.0', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        // Two dining chairs flanking the host table
        src: 'assets/models/props/lounge-dining-chair.glb',
        instances: [
          { pos: '-0.9 0 -2.0', rot: '0  90 0', scale: '1.00 1.00 1.00' },
          { pos: ' 0.9 0 -2.0', rot: '0 -90 0', scale: '1.00 1.00 1.00' },
        ],
      },
    ],

    // ═══ SMOKE LOUNGE ════════════════════════════════════════
    // Room: 5m × 5m × 3.0m centered at origin.
    //   x: -2.5 to +2.5    z: -2.5 to +2.5
    //
    // Square cozy room. Two cognac armchairs angled toward each
    // other across a marble low table at the center. The marble
    // table includes hammered brass ashtray + whiskey glass details.
    'smoke-lounge': [
      {
        src: 'assets/models/props/smoke-armchair-cognac.glb',
        instances: [
          // Chairs flanking the table, angled ~30° inward
          { pos: '-1.0 0 -0.5', rot: '0  30 0', scale: '1.00 1.00 1.00' },
          { pos: ' 1.0 0 -0.5', rot: '0 -30 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        // Marble coffee table centered in the seating arrangement
        src: 'assets/models/props/smoke-low-table-marble.glb',
        instances: [
          { pos: '0 0 -0.5', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
    ],

    // ═══ CULINARY THEATER ════════════════════════════════════
    // Room: 7m × 6m × 3.5m centered at origin.
    //   x: -3.5 to +3.5    z: -3 to +3
    //
    // Theatrical layout: chef station against NORTH wall
    // (performer side), tiered seating on SOUTH (audience), with
    // a display counter at the entrance for menu browsing.
    'culinary': [
      {
        // Chef station at north wall — performer's prep area.
        src: 'assets/models/props/culinary-chef-station.glb',
        instances: [
          { pos: '0 0 -2.3', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        // Tiered seating facing the chef station (faces north)
        src: 'assets/models/props/culinary-tiered-seating.glb',
        instances: [
          { pos: '0 0 1.0', rot: '0 180 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        // Display counter near the entrance for menu/specials
        src: 'assets/models/props/culinary-display-counter.glb',
        instances: [
          { pos: '-2.5 0 1.5', rot: '0 90 0', scale: '1.00 1.00 1.00' },
        ],
      },
    ],

    // ═══ COURTYARD ═══════════════════════════════════════════
    // Room: 8m × 8m × 6.0m centered at origin.
    //   x: -4 to +4    z: -4 to +4
    //
    // Open square footprint, tall ceiling for "outdoor" feel.
    // Olive tree as anchor in NW corner, fire pit at center,
    // bistro set in SE corner across from the tree.
    'courtyard': [
      {
        // Olive tree in NW corner — natural shade/anchor
        src: 'assets/models/props/courtyard-olive-tree.glb',
        instances: [
          { pos: '-2.5 0 -2.5', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        // Fire pit at room center — gathering point
        src: 'assets/models/props/courtyard-fire-pit.glb',
        instances: [
          { pos: '0 0 0', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        // Bistro set across from olive tree, angled to face center
        src: 'assets/models/props/courtyard-bistro-set.glb',
        instances: [
          { pos: '2.0 0 1.5', rot: '0 -135 0', scale: '1.00 1.00 1.00' },
        ],
      },
    ],

    // ═══ COLD STONED ═════════════════════════════════════════
    // Room: 4m × 4m × 2.8m centered at origin.
    //   x: -2 to +2    z: -2 to +2
    //
    // Small gelato kiosk. Display case at customer-facing edge
    // (south, where player approaches), prep station behind it
    // (north), menu board on the east wall.
    'cold-stoned': [
      {
        // Display case facing customer (faces south, +Z)
        src: 'assets/models/props/cold-stoned-display-case.glb',
        instances: [
          { pos: '0 0 -0.3', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        // Prep station behind the display, parallel
        src: 'assets/models/props/cold-stoned-prep-station.glb',
        instances: [
          { pos: '0 0 -1.4', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        // Menu board mounted on east wall, faces west (into room).
        // snap=false so it can hang at eye-level off the floor.
        src: 'assets/models/props/cold-stoned-menu-board.glb',
        instances: [
          { pos: '1.85 1.5 -0.5', rot: '0 -90 0', scale: '1.00 1.00 1.00', snap: false },
        ],
      },
    ],
  };

  // Expose globally so per-room scenes can grab their entries.
  // Scenes use: window.CS_ROOM_PROPS['bar'] to get the bar's prop list.
  window.CS_ROOM_PROPS = ROOM_PROPS;

  console.log('[CS-RoomProps] catalog ready —', Object.keys(ROOM_PROPS).length, 'rooms');
})();
