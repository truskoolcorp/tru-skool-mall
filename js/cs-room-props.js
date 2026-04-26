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

   COORDINATE BOUNDS (from cafe-sativa-wing.js)
     Each room's per-scene world has its OWN local coordinate
     system. The bounds below are how the rooms USED to be laid
     out in the unified wing — useful as starting positions but
     each per-room scene can re-center if it wants.

       bar:           x=20..30,    z=-37.5..-29.5  ceil=4.5
       main-lounge:   x=17.5..32.5, z=-46..-37.5   ceil=4.5
       smoke-lounge:  TBD (not in old wing layout)
       cigar:         x=35.7..41.7, z=-46..-37.5   ceil=3
       culinary:      x=22.5..27.5, z=-51..-46     ceil=4
       courtyard:     x=30..37,    z=-31..-26      ceil=12
       cold-stoned:   x=28..32,    z=-26..-21.5    ceil=6

   STARTING POSITIONS
     These are educated guesses based on real-world room layouts:
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
    // Layout: backbar against north wall, counter parallel to it,
    // stools at the south face of the counter.
    'bar': [
      {
        src: 'assets/models/_archive/bar-counter-walnut.glb',
        instances: [
          // Counter centered E-W, set back from north wall by counter depth + 1m walking space
          { pos: '25 0 -33', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/bar-backbar-shelf.glb',
        instances: [
          // Backbar pressed against north wall, behind counter
          { pos: '25 0 -36', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/bar-stool-leather.glb',
        instances: [
          // Three stools at south face of counter, evenly spaced
          { pos: '23 0 -31.5', rot: '0 0 0', scale: '1.00 1.00 1.00' },
          { pos: '25 0 -31.5', rot: '0 0 0', scale: '1.00 1.00 1.00' },
          { pos: '27 0 -31.5', rot: '0 0 0', scale: '1.00 1.00 1.00' },
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
    'smoke-lounge': [
      {
        src: 'assets/models/props/smoke-armchair-cognac.glb',
        instances: [
          // Two armchairs flanking the table, slightly angled toward each other
          { pos: '-1.5 0 -1', rot: '0 30 0', scale: '1.00 1.00 1.00' },
          { pos: '1.5 0 -1', rot: '0 -30 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/smoke-low-table-marble.glb',
        instances: [
          // Coffee table in the middle of the seating arrangement
          { pos: '0 0 0', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        src: 'assets/models/props/smoke-hookah-brass.glb',
        instances: [
          // Hookah next to one of the armchairs
          { pos: '-2.2 0 -1.8', rot: '0 0 0', scale: '1.00 1.00 1.00' },
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
