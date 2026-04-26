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
    // BBOX REALITY CHECK (from probe at scale=1.0):
    //   bar-counter-walnut.glb     → W=2.00m H=1.26m D=0.97m
    //   bar-backbar-shelf.glb      → W=2.00m H=0.87m D=0.32m
    //   bar-stool-leather.glb      → W=0.94m H=2.00m D=0.94m  ⚠️ stool is 2m tall
    //
    // The Meshy outputs render about 2x bigger than the prompt's
    // stated dimensions across the board. Two options: shrink the
    // props 2x (makes counter/backbar ok-ish but loses detail) OR
    // accept Meshy's bigger scale and size the room around them.
    //
    // We pick a hybrid: counter & backbar stay at 1.0 (close to
    // intended), stool gets 0.42 to land at human-realistic height
    // (~0.85m). Room dimensions are bumped up in cs-bar.html to
    // accommodate the 2m-wide counter without feeling cramped.
    //
    // Local coords: room is 10m × 8m centered at origin.
    //   x: -5 to +5  (west to east)
    //   z: -4 to +4  (north/far wall to south/entrance)
    //
    // Layout: backbar against north wall (-z far), counter
    // parallel to it 1.5m closer to player, 3 stools at the south
    // face of the counter.
    'bar': [
      {
        // Counter — renders 2m × 1.26m × 0.97m at scale 1.0.
        // Auto-snap puts its base at y=0.
        src: 'assets/models/_archive/bar-counter-walnut.glb',
        instances: [
          { pos: '0 0 -0.5', rot: '0 0 0', scale: '1.00 1.00 1.00' },
        ],
      },
      {
        // Backbar shelf — renders 2m × 0.87m × 0.32m at scale 1.0.
        // Wall-mounted at counter-top height. snap=false because we
        // WANT it floating off the floor, mounted on the wall above
        // the counter. y=1.4 puts the shelf base at counter-top
        // height (counter is 1.26m tall).
        src: 'assets/models/props/bar-backbar-shelf.glb',
        instances: [
          { pos: '0 1.4 -3.7', rot: '0 0 0', scale: '1.00 1.00 1.00', snap: false },
        ],
      },
      {
        // Stool — 0.42x → ~0.4m × 0.84m × 0.4m. Auto-snap to floor.
        src: 'assets/models/props/bar-stool-leather.glb',
        instances: [
          { pos: '-1.5 0 0.4', rot: '0 0 0', scale: '0.42 0.42 0.42' },
          { pos: ' 0   0 0.4', rot: '0 0 0', scale: '0.42 0.42 0.42' },
          { pos: ' 1.5 0 0.4', rot: '0 0 0', scale: '0.42 0.42 0.42' },
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
