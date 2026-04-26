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
    // Room: 6m × 5m × 3.2m centered at origin.
    //   x: -3 to +3  (west to east)
    //   z: -2.5 to +2.5  (north/far wall to south/entrance)
    //
    // GLB ANALYSIS (measured via Box3 in console):
    //   bar-counter-walnut.glb is actually a COMPLETE BAR UNIT:
    //   - Counter base (wood paneling, brass details) at floor
    //   - White service shelf running through middle at y=0.72m
    //   - Built-in backbar with glass-front bottle display above
    //   - Total height: 1.26m
    //   So this single GLB is the entire bar — no separate
    //   backbar shelf needed (would render as a redundant shelf
    //   floating in mid-air).
    //
    //   bar-stool-leather.glb at scale 1.0 is 2m tall (Meshy
    //   exported 2x oversized). At scale 0.30 → ~0.60m seat
    //   height, which sits 12cm BELOW the white service shelf
    //   at 0.72m. Reads as a proper counter-height bar.
    //
    // Layout: counter centered, 3 stools at front face. No
    // separate backbar (it's built into the counter GLB).
    'bar': [
      {
        // Counter — auto-snap to floor. Centered, with back face
        // ~50cm off the back wall for breathing room.
        src: 'assets/models/_archive/bar-counter-walnut.glb',
        instances: [
          { pos: '0 0 -0.5', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        // Stools at south face of counter. Counter front face is
        // at z = -0.5 + 0.485 ≈ z=0, so stools at z=0.4 leaves
        // proper knee clearance. Spaced 0.6m apart.
        //
        // Scale 0.30 → ~0.60m seat height (clearly below the
        // white service shelf at 0.72m). Patron sits comfortably
        // with elbows resting on the white shelf.
        src: 'assets/models/props/bar-stool-leather.glb',
        instances: [
          { pos: '-0.6 0 0.4', rot: '0 0 0', scale: '0.30 0.30 0.30' },
          { pos: ' 0   0 0.4', rot: '0 0 0', scale: '0.30 0.30 0.30' },
          { pos: ' 0.6 0 0.4', rot: '0 0 0', scale: '0.30 0.30 0.30' },
        ],
      },
    ],

    // ═══ MAIN LOUNGE ═════════════════════════════════════════
    // Layout: stage at the south end (back wall for performer),
    // host table + chair at center, audience implied by empty
    // space facing the stage.
    'main-lounge': [
      {
        src: 'assets/models/props/lounge-stage-platform.glb',
        instances: [
          // Stage along the south wall (z=-46 is the back), facing north
          { pos: '25 0 -45', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/lounge-host-table.glb',
        instances: [
          // Centered table for host/guest seating during sessions
          { pos: '25 0 -41.5', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/lounge-dining-chair.glb',
        instances: [
          // Two chairs at the host table — one each side
          { pos: '24 0 -41.5', rot: '0 90 0', scale: '1.00 1.00 1.00' },
          { pos: '26 0 -41.5', rot: '0 -90 0', scale: '1.00 1.00 1.00' },
        ],
      },
    ],

    // ═══ SMOKE LOUNGE ════════════════════════════════════════
    // No coordinates assigned in old wing layout — when per-room
    // scene is built, place it in its own local coordinate system
    // (e.g. centered at origin with appropriate bounds). These
    // values assume a 6m × 6m room with origin at center.
    //
    // Cigar-focused (no hookah). The cigar + ashtray for this
    // room are baked into cigar-side-table-walnut.glb's ashtray
    // detail when we place that prop here too — but the catalog
    // entry below uses smoke-specific furniture for visual variety.
    'smoke-lounge': [
      {
        src: 'assets/models/props/smoke-armchair-cognac.glb',
        instances: [
          // Two armchairs flanking the table, slightly angled toward each other
          { pos: '-1.2 0 -1', rot: '0 30 0', scale: '1.00 1.00 1.00' },
          { pos: '1.2 0 -1', rot: '0 -30 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/smoke-low-table-marble.glb',
        instances: [
          // Coffee table in the middle of the seating arrangement
          // (already includes a hammered brass ashtray + whiskey glass)
          { pos: '0 0 0', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
    ],

    // ═══ CIGAR LOUNGE (VIP) ══════════════════════════════════
    // Layout: armchair pair in the SW corner, side table between
    // them, humidor against the far wall.
    'cigar': [
      {
        src: 'assets/models/props/cigar-armchair-oxblood.glb',
        instances: [
          // Two armchairs facing each other across the side table
          { pos: '37 0 -42', rot: '0 30 0', scale: '1.00 1.00 1.00' },
          { pos: '39 0 -42', rot: '0 -30 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/cigar-side-table-walnut.glb',
        instances: [
          // Side table between the two armchairs
          { pos: '38 0 -42', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/cigar-humidor.glb',
        instances: [
          // Humidor against the east wall (far end of room)
          { pos: '41 0 -41.5', rot: '0 -90 0', scale: '1.00 1.00 1.00' },
        ],
      },
    ],

    // ═══ CULINARY THEATER ════════════════════════════════════
    // Layout: chef station against far wall (south), tiered
    // seating facing it (north), display counter at the entrance.
    'culinary': [
      {
        src: 'assets/models/props/culinary-chef-station.glb',
        instances: [
          // Chef station at south wall, performer side
          { pos: '25 0 -50', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/culinary-tiered-seating.glb',
        instances: [
          // Tiered seating on north side, facing south toward chef
          { pos: '25 0 -47', rot: '0 180 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/culinary-display-counter.glb',
        instances: [
          // Display counter near entrance for browsing tonight's menu
          { pos: '23 0 -48.5', rot: '0 90 0', scale: '1.00 1.00 1.00' },
        ],
      },
    ],

    // ═══ COURTYARD ═══════════════════════════════════════════
    // Layout: olive tree in NE corner (anchor), fire pit center,
    // bistro set opposite the tree for variety.
    'courtyard': [
      {
        src: 'assets/models/props/courtyard-olive-tree.glb',
        instances: [
          // Olive tree in NE corner — natural anchor / shade source
          { pos: '35.5 0 -27.5', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/courtyard-fire-pit.glb',
        instances: [
          // Fire pit at room center
          { pos: '33.5 0 -28.5', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/courtyard-bistro-set.glb',
        instances: [
          // Bistro set across from the olive tree
          { pos: '31.5 0 -29.5', rot: '0 45 0', scale: '1.00 1.00 1.00' },
        ],
      },
    ],

    // ═══ COLD STONED ═════════════════════════════════════════
    // Layout: display case along customer wall, prep station
    // behind it, menu board hanging on side wall.
    'cold-stoned': [
      {
        src: 'assets/models/props/cold-stoned-display-case.glb',
        instances: [
          // Display case at customer-facing edge
          { pos: '30 0 -23.5', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/cold-stoned-prep-station.glb',
        instances: [
          // Prep station behind the display, parallel
          { pos: '30 0 -25', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/cold-stoned-menu-board.glb',
        instances: [
          // Menu board on the east wall, visible from entrance
          { pos: '31.5 0 -22.5', rot: '0 -90 0', scale: '1.00 1.00 1.00' },
        ],
      },
    ],
  };

  // Expose globally so per-room scenes can grab their entries.
  // Scenes use: window.CS_ROOM_PROPS['bar'] to get the bar's prop list.
  window.CS_ROOM_PROPS = ROOM_PROPS;

  console.log('[CS-RoomProps] catalog ready —', Object.keys(ROOM_PROPS).length, 'rooms');
})();
