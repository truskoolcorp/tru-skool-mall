/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Café Sativa Interiors (LEAN REBUILD)

   The first furniture pass (reverted in 5a5001e) shipped 440+
   primitives and 23 point lights, which ground the mall to a
   halt in Keith's browser. This version is the lean rebuild
   with a strict performance budget:

     Total primitives       ≤ 100
     Point lights           = 0
     <a-text> elements      ≤ 4
     Per-room ceiling       = 10 primitives

   Actual numbers this file ships:

     Primitives:  ~82
     Point lights: 0  (all glow is emissive materials)
     Text:         4  (stage title, gallery wordmark, staff sign, gelato menu)

   Why the cuts work
   ─────────────────
   Forward-rendered WebGL costs scale with primitives × lights
   per fragment. The old version's 440 × 23 was an order of
   magnitude past what A-Frame handles gracefully. Dropping
   lights to 0 alone buys most of the headroom back; halving
   primitives seals it.

   Visual quality lost
   ───────────────────
   - No chair legs / feet (an armchair is 1 box instead of 9)
   - No cast illumination from pendants/lamps — they glow but
     don't actually light their surroundings. The wing shell
     provides per-room ambient light, so rooms aren't dark,
     the "lamps" are just decorative.
   - No visible bottle rows on the bar — a single emissive
     strip suggests the glow of the backbar
   - Gelato tubs / sculpted pedestal objects gone — the
     pedestals themselves read as pedestals
   - String lights in the courtyard replaced with a single
     glowing emissive strand

   Structural gains
   ────────────────
   - No nested <a-entity> wrappers — each piece is a single
     primitive element, which means every piece is ONE
     Three.js mesh (was 4-10 per piece with wrappers).
   - Zero setAttribute('material', '...') calls that could
     trigger A-Frame's expensive component re-init during
     tuning — materials are set once at creation.

   Companion pieces
   ────────────────
   - Tuner (js/furniture-tuner.js, ?tuner=1): edit individual
     pieces interactively, export JSON, paste back in here
   - Converter (tools/convert-tuner-export.js): tuner export
     → clean source code fragment
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Material palette ───────────────────────────────────────────────
  // Every piece uses one of these. Having a small palette reduces
  // shader uniform uploads and keeps the wing feeling cohesive.
  //
  // Textures (from index.html <a-assets>) are used as detail maps.
  // The `color:` value acts as a multiplicative tint, so the hex
  // controls the shade while the texture adds grain/pattern.
  //
  // `repeat: X Y` tiles the texture across the primitive. Without
  // this a 3m-long counter would show one giant wood-grain blob.
  // Values are eyeballed — more tiles = finer grain.
  const MAT = {
    // Woods — now with grain
    oakWarm:    'src: #tex-wood-light; repeat: 2 1; color: #a8885a; roughness: 0.7',
    walnutDark: 'src: #tex-wood-dark;  repeat: 2 1; color: #5a3828; roughness: 0.6',

    // Metals
    brass:      'color: #c9a84c; metalness: 0.9; roughness: 0.2',
    steel:      'src: #tex-metal; repeat: 1 1; color: #b8b8bc; metalness: 0.85; roughness: 0.4',

    // Stones — marble and travertine get their textures
    marbleWarm: 'src: #tex-marble; repeat: 2 1; color: #f4ecd8; roughness: 0.3; metalness: 0.05',
    travertine: 'src: #tex-plaster; repeat: 2 2; color: #e8e0d0; roughness: 0.8',

    // Upholstery — leather benefits hugely from the leather texture
    leather:    'src: #tex-leather; repeat: 2 2; color: #5a2528; roughness: 0.65',
    velvetSage: 'color: #3a4a38; roughness: 0.95',
    linen:      'color: #d9cfba; roughness: 0.95',

    // Glows (emissive — NO associated point light, just bright color)
    amberGlow:  'color: #c9a84c; emissive: #c9a84c; emissiveIntensity: 0.9',
    warmGlow:   'color: #ffcf80; emissive: #ffcf80; emissiveIntensity: 0.8',
    redGlow:    'color: #c04020; emissive: #c04020; emissiveIntensity: 0.6',

    // Accents
    mirror:     'color: #d8d8e0; metalness: 0.95; roughness: 0.08',
    art1:       'color: #a05040; roughness: 0.85',
    art2:       'color: #5a7c5c; roughness: 0.85',
    art3:       'color: #3a4a6a; roughness: 0.85',
    matteBlack: 'color: #1a1a1a; metalness: 0.3; roughness: 0.7',
    ruby:       'src: #tex-leather; repeat: 3 2; color: #7a1525; roughness: 0.6',
    slate:      'color: #1a1a1a; roughness: 0.95',
    rug:        'src: #tex-carpet; repeat: 3 2; color: #8a4a38; roughness: 0.95',
    // Dark glass / ceramics for small detail pieces
    ceramic:    'color: #2a2a2e; roughness: 0.35; metalness: 0.1',
    // Clear glass — display cases, dome covers. Transparent with subtle sheen.
    glassClear: 'color: #d0e4f0; opacity: 0.35; transparent: true; side: double; metalness: 0.2; roughness: 0.1',
  };

  // ─── Primitive factories (no wrappers, one mesh each) ───────────────
  // All positions are WORLD-space. Every call emits exactly one
  // <a-*> element into the scene — no nested entities.

  function box(x, y, z, w, h, d, material) {
    const e = document.createElement('a-box');
    e.setAttribute('position', `${x} ${y} ${z}`);
    e.setAttribute('width', w);
    e.setAttribute('height', h);
    e.setAttribute('depth', d);
    e.setAttribute('material', material);
    return e;
  }

  function cyl(x, y, z, radius, height, material) {
    const e = document.createElement('a-cylinder');
    e.setAttribute('position', `${x} ${y} ${z}`);
    e.setAttribute('radius', radius);
    e.setAttribute('height', height);
    e.setAttribute('material', material);
    return e;
  }

  // A rotated wall plane. axis = 'x' (faces ±x, i.e. on an E/W wall)
  // or 'z' (faces ±z, on an N/S wall). dir = +1 | -1 picks which side.
  function wallArt(x, y, z, w, h, axis, dir, material) {
    const e = document.createElement('a-plane');
    e.setAttribute('position', `${x} ${y} ${z}`);
    e.setAttribute('width', w);
    e.setAttribute('height', h);
    if (axis === 'x') {
      e.setAttribute('rotation', `0 ${dir > 0 ? 90 : -90} 0`);
    } else {
      e.setAttribute('rotation', `0 ${dir > 0 ? 0 : 180} 0`);
    }
    e.setAttribute('material', material + '; side: double');
    return e;
  }

  function textNode(x, y, z, value, color, width, rotY) {
    const e = document.createElement('a-text');
    e.setAttribute('position', `${x} ${y} ${z}`);
    e.setAttribute('value', value);
    e.setAttribute('align', 'center');
    e.setAttribute('color', color);
    e.setAttribute('width', width);
    if (rotY) e.setAttribute('rotation', `0 ${rotY} 0`);
    return e;
  }

  // A flat rug (thin box lying on the floor, oriented horizontally
  // without needing rotation — just 0.04 height works fine).
  function rug(cx, cz, w, d, material) {
    return box(cx, 0.02, cz, w, 0.04, d, material);
  }

  // ─── Rooms ──────────────────────────────────────────────────────────
  // Each room function appends its pieces to the root container and
  // returns the count it added (for budget tracking in console).

  // FOYER (23..27, -21.5..-18) — 4 pieces
  function roomFoyer(root) {
    const g = [];
    g.push(rug(25, -19.75, 2.4, 1.8, MAT.rug));
    // Reception desk — base + marble top
    g.push(box(26.4, 0.55, -20, 0.7, 1.1, 1.8, MAT.walnutDark));
    g.push(box(26.4, 1.12, -20, 0.8, 0.04, 1.85, MAT.marbleWarm));
    // Ceiling pendant cluster (single emissive sphere = "the lamp")
    g.push(cyl(25, 3.4, -19.75, 0.12, 0.15, MAT.amberGlow));
    g.forEach((el) => root.appendChild(el));
    return g.length;
  }

  // GALLERY (22..28, -29.5..-21.5, ceil 10) — 12 pieces
  function roomGallery(root) {
    const g = [];
    // 3 pedestals with sculpture discs on top — the disc turns each
    // pedestal into 'art on display' rather than a white cube.
    [[24, -24], [26, -26], [24, -28]].forEach(([x, z]) => {
      g.push(box(x, 0.45, z, 0.5, 0.9, 0.5, MAT.travertine));
      g.push(cyl(x, 1.05, z, 0.15, 0.3, MAT.brass)); // sculpture
    });
    // 3 wall art panels — alternating walls to balance the room
    g.push(wallArt(22.05, 3,   -24, 1.4, 1.8, 'x', 1,  MAT.art1));
    g.push(wallArt(27.95, 3,   -26, 1.4, 1.8, 'x', -1, MAT.art2));
    g.push(wallArt(22.05, 3,   -28, 1.4, 1.8, 'x', 1,  MAT.art3));
    // Central bench
    g.push(box(25, 0.25, -25.5, 2.4, 0.2, 0.5, MAT.walnutDark));
    // Wordmark on the north wall — positioned near the top of the
    // room, sized for the 6m ceiling
    g.push(textNode(25, 4.2, -29.3, 'GALLERY', '#c9a84c', 5));
    g.forEach((el) => root.appendChild(el));
    return g.length;
  }

  // BAR (20..30, -37.5..-29.5) — 13 pieces
  function roomBar(root) {
    const g = [];
    // ─── Primitive bar counter REMOVED ─────────────────────────
    // The Meshy GLB at assets/models/props/bar-counter-walnut.glb
    // now provides the counter + backbar shelf + bottles all as one
    // hero piece (loaded via cafe-sativa-props.js).
    //
    // Remaining primitives below are FALLBACKS for stools and
    // pendants — the props loader will replace them when their
    // matching Meshy GLBs are generated.

    // Backbar glow strip (emissive plane tight to west wall) — kept
    // as primitive because it's a wall accent, not a hero object
    g.push(box(20.15, 2.2, -33.5, 0.02, 0.7, 4.5, MAT.amberGlow));
    // Back-bar mirror above — kept as primitive (architectural)
    g.push(wallArt(20.11, 3.4, -33.5, 4.5, 0.8, 'x', 1, MAT.mirror));
    // 4 round stools — primitive fallback until bar-stool-leather.glb
    // lands. When the GLB is on disk, the props loader places real
    // stools at z=-32.8; primitives at z=-32 to -35 will overlap, so
    // the next session that lands the stool GLB should also delete
    // these lines.
    [-35, -34, -33, -32].forEach((z) => {
      g.push(cyl(22.4, 0.4, z, 0.22, 0.8, MAT.leather));
    });
    // 3 pendant lamps — primitive fallback until pendant-cone-brass.glb
    // lands. Same as above — delete when GLB lands.
    [-34.5, -33.5, -32.5].forEach((z) => {
      g.push(cyl(21.55, 3.9, z, 0.12, 0.15, MAT.amberGlow));
    });
    g.forEach((el) => root.appendChild(el));
    return g.length;
  }

  // MAIN LOUNGE (17.5..32.5, -46..-37.5, ceil 4.5) — 13 pieces
  // Event-critical room — Ep 1 "At The Table" lives here.
  function roomMainLounge(root) {
    const g = [];
    // Stage platform (raised 0.35m, 10m wide × 2m deep)
    g.push(box(25, 0.175, -44.5, 10.0, 0.35, 2.0, MAT.walnutDark));
    // Stage backdrop banner (dark, on the north wall) — height
    // capped so top stays under 4.5m ceiling
    g.push(wallArt(25, 2.2, -45.95, 8.0, 3.0, 'z', 1, MAT.slate));
    // Stage title text — centered on the backdrop
    g.push(textNode(25, 3.1, -45.9, 'AT THE TABLE', '#c9a84c', 8));
    // Host table — raised so it sits properly above the stage.
    // Stage top is at y=0.35. Table top needs to be ~0.7m above
    // the stage so seated chairs fit under it.
    g.push(box(25, 1.0, -44.6, 2.2, 0.05, 0.9, MAT.walnutDark));
    // Microphone stand on the table (y shifted to match new table top)
    g.push(cyl(25, 1.25, -44.6, 0.015, 0.45, MAT.matteBlack)); // stem
    g.push(cyl(25, 1.52, -44.6, 0.05,  0.08, MAT.matteBlack)); // head
    // 2 host chairs with backs — seat and back positioned so the
    // chair sits ON the stage top (y=0.35) not sunken into it.
    // Seat 0.5m tall centered at y=0.65 → bottom=0.40 (on stage),
    // top=0.90 (passes under table top at 1.03).
    g.push(box(24.2, 0.65, -44.15, 0.5, 0.5, 0.5, MAT.leather));  // seat W
    g.push(box(24.2, 1.15, -43.9,  0.5, 0.9, 0.1, MAT.leather));  // back W (top at 1.60)
    g.push(box(25.8, 0.65, -44.15, 0.5, 0.5, 0.5, MAT.leather));  // seat E
    g.push(box(25.8, 1.15, -43.9,  0.5, 0.9, 0.1, MAT.leather));  // back E
    // 3 audience benches (simple sage-velvet boxes, facing stage)
    g.push(box(20,   0.3, -41, 3.0, 0.6, 0.7, MAT.velvetSage));
    g.push(box(25,   0.3, -41, 3.0, 0.6, 0.7, MAT.velvetSage));
    g.push(box(30,   0.3, -41, 3.0, 0.6, 0.7, MAT.velvetSage));
    // DJ table stage-right
    g.push(box(31, 0.55, -44.5, 1.4, 1.0, 0.7, MAT.matteBlack));
    g.forEach((el) => root.appendChild(el));
    return g.length;
  }

  // COLD STONED (28..32, -26..-21.5) — 5 pieces
  function roomColdStoned(root) {
    const g = [];
    // Wood counter base (walnut for richness)
    g.push(box(30, 0.55, -25.3, 3.6, 1.1, 0.7, MAT.walnutDark));
    // White marble countertop
    g.push(box(30, 1.12, -25.3, 3.65, 0.04, 0.75, MAT.marbleWarm));

    // Gelato display case — glass-walled cabinet on the counter.
    // Four low side panels (20cm tall) + a glass top panel.
    // Case footprint 3.0m × 0.55m, centered on counter at (30, ?, -25.3)
    const caseXMin = 30 - 1.5, caseXMax = 30 + 1.5;
    const caseZMin = -25.3 - 0.25, caseZMax = -25.3 + 0.25;
    const caseBaseY = 1.14, caseTopY = 1.46;
    // Front (south-facing) glass panel
    g.push(box(30, (caseBaseY + caseTopY)/2, caseZMax, 3.0, 0.32, 0.02, MAT.glassClear));
    // Back (north-facing) glass panel
    g.push(box(30, (caseBaseY + caseTopY)/2, caseZMin, 3.0, 0.32, 0.02, MAT.glassClear));
    // Left + right end caps
    g.push(box(caseXMin, (caseBaseY + caseTopY)/2, -25.3, 0.02, 0.32, 0.5, MAT.glassClear));
    g.push(box(caseXMax, (caseBaseY + caseTopY)/2, -25.3, 0.02, 0.32, 0.5, MAT.glassClear));
    // Glass top (slightly tinted)
    g.push(box(30, caseTopY, -25.3, 3.02, 0.02, 0.52, MAT.glassClear));

    // Gelato tubs inside the case — 5 flavors in a row
    const tubY = caseBaseY + 0.1;
    const tubFlavors = [
      { x: 28.7, color: '#a8c088' },   // pistachio
      { x: 29.35, color: '#e8a8b0' },  // strawberry
      { x: 30,   color: '#6a4428' },   // chocolate
      { x: 30.65, color: '#f0e4c8' },  // coconut
      { x: 31.3, color: '#e8a048' },   // mango
    ];
    tubFlavors.forEach((f) => {
      g.push(cyl(f.x, tubY, -25.3, 0.22, 0.18, `color: ${f.color}; roughness: 0.6`));
    });

    // Menu board: slate panel on brass pole (not floating)
    // Pole at x=30, z=-25.85 (behind counter), rising to panel
    g.push(cyl(30, 1.9, -25.88, 0.02, 1.4, MAT.brass));
    // Board (slate)
    g.push(wallArt(30, 2.9, -25.95, 2.4, 0.9, 'z', 1, MAT.slate));
    // Wordmark
    g.push(textNode(30, 2.95, -25.9, 'GELATO', '#e8e0d0', 2.8));
    g.push(textNode(30, 2.55, -25.9, 'Pistachio · Chocolate · Mango', '#c9a84c', 2.2));

    // Small brass bell on counter (register substitute)
    g.push(cyl(31.5, 1.18, -25.3, 0.06, 0.08, MAT.brass));

    // Pendant lamp hanging above counter
    g.push(cyl(30, 3.4, -25.3, 0.12, 0.1, MAT.brass));
    g.push(cyl(30, 3.05, -25.3, 0.08, 0.6, MAT.warmGlow));

    g.forEach((el) => root.appendChild(el));
    return g.length;
  }

  // COURTYARD (30..37, -31..-26, ceil 12 open-air) — 8 pieces
  function roomCourtyard(root) {
    const g = [];
    // 2-stack fountain
    g.push(cyl(33.5, 0.15, -28.5, 1.1, 0.3,  MAT.travertine));
    g.push(cyl(33.5, 0.6,  -28.5, 0.35, 0.6, MAT.travertine));
    // 2 bistro tables (round disc on stalk = 2 primitives each)
    g.push(cyl(31.5, 0.75, -27, 0.45, 0.04, MAT.marbleWarm));
    g.push(cyl(35.5, 0.75, -27, 0.45, 0.04, MAT.marbleWarm));
    // Place settings — tiny dark discs read as plates/coasters,
    // turns each "mushroom" into an occupied dining table
    g.push(cyl(31.5, 0.78, -27, 0.16, 0.01, MAT.ceramic));
    g.push(cyl(35.5, 0.78, -27, 0.16, 0.01, MAT.ceramic));
    // 2 bistro chairs at one of the tables (social)
    g.push(box(31.5, 0.25, -28, 0.4, 0.5, 0.4, MAT.steel));
    g.push(box(31.5, 0.25, -26, 0.4, 0.5, 0.4, MAT.steel));
    g.forEach((el) => root.appendChild(el));
    return g.length;
  }

  // CIGAR AIRLOCK (32.5..35.7, -44.5..-43) — 2 pieces
  function roomCigarAirlock(root) {
    const g = [];
    // Coat-check bench
    g.push(box(34.1, 0.2, -43.2, 1.8, 0.35, 0.4, MAT.walnutDark));
    // Small amber wall-glow (single emissive strip on east wall)
    g.push(box(35.65, 1.8, -43.75, 0.02, 0.3, 0.8, MAT.amberGlow));
    g.forEach((el) => root.appendChild(el));
    return g.length;
  }

  // CIGAR LOUNGE (35.7..41.7, -46..-37.5, VIP) — 8 pieces
  function roomCigarLounge(root) {
    const g = [];
    // Hero cluster: round low table + 4 leather armchairs with backs
    g.push(cyl(37.5, 0.3, -41, 0.55, 0.04, MAT.walnutDark));
    // W armchair: seat + back. Back is tall and thin, pushed to the west.
    g.push(box(36.5, 0.35, -41, 0.7, 0.7, 0.7, MAT.leather));  // seat
    g.push(box(36.15, 0.75, -41, 0.15, 0.9, 0.75, MAT.leather)); // back
    // E armchair
    g.push(box(38.5, 0.35, -41, 0.7, 0.7, 0.7, MAT.leather));
    g.push(box(38.85, 0.75, -41, 0.15, 0.9, 0.75, MAT.leather));
    // N armchair (facing south)
    g.push(box(37.5, 0.35, -40, 0.7, 0.7, 0.7, MAT.leather));
    g.push(box(37.5, 0.75, -39.65, 0.75, 0.9, 0.15, MAT.leather));
    // S armchair (facing north)
    g.push(box(37.5, 0.35, -42, 0.7, 0.7, 0.7, MAT.leather));
    g.push(box(37.5, 0.75, -42.35, 0.75, 0.9, 0.15, MAT.leather));
    // Ashtray — a black disc on the table, unambiguous cigar-lounge signal
    g.push(cyl(37.5, 0.34, -41, 0.1, 0.025, MAT.ceramic));
    // Couples banquette on east wall
    g.push(box(41, 0.45, -43, 0.6, 0.9, 2.5, MAT.ruby));
    // Humidor cabinet + its glow
    g.push(box(36.05, 1.0, -38.5, 0.3, 2.0, 0.9, MAT.walnutDark));
    g.push(box(36.22, 1.0, -38.5, 0.02, 1.8, 0.8, MAT.amberGlow));
    g.forEach((el) => root.appendChild(el));
    return g.length;
  }

  // BOH (15..20, -34.5..-29.5) — 3 pieces
  function roomBoH(root) {
    const g = [];
    // Prep island
    g.push(box(17.5, 0.45, -32, 2.0, 0.9, 0.8, MAT.steel));
    // Wall shelf (single piece, north wall)
    g.push(box(17.5, 2.0, -34.3, 4.5, 0.04, 0.3, MAT.steel));
    // Staff sign
    g.push(textNode(17.5, 2.4, -29.55, 'STAFF ONLY', '#8a8a8a', 4, 180));
    g.forEach((el) => root.appendChild(el));
    return g.length;
  }

  // CULINARY (22.5..27.5, -51..-46) — 11 pieces
  function roomCulinary(root) {
    const g = [];
    // Demo kitchen island
    g.push(box(25, 0.45, -49, 3.0, 0.9, 1.0, MAT.oakWarm));
    g.push(box(25, 0.92, -49, 3.05, 0.04, 1.05, MAT.marbleWarm));
    // Two circular induction hobs — reads unambiguously as cooktop
    g.push(cyl(24.5, 0.945, -49.2, 0.13, 0.01, MAT.redGlow));
    g.push(cyl(25.5, 0.945, -49.2, 0.13, 0.01, MAT.redGlow));
    // Stainless mixing bowl — tiny prep signal on the chef's side
    g.push(cyl(25, 0.98, -48.85, 0.12, 0.08, MAT.steel));
    // Monitor on north wall
    g.push(wallArt(25, 2.3, -50.95, 1.5, 0.9, 'z', 1, MAT.matteBlack));
    // 4 audience chairs (front row of 4)
    g.push(box(23.5, 0.3, -47.3, 0.5, 0.6, 0.5, MAT.linen));
    g.push(box(24.5, 0.3, -47.3, 0.5, 0.6, 0.5, MAT.linen));
    g.push(box(25.5, 0.3, -47.3, 0.5, 0.6, 0.5, MAT.linen));
    g.push(box(26.5, 0.3, -47.3, 0.5, 0.6, 0.5, MAT.linen));
    // Warm ceiling glow strip (emissive, not a light) — under 4m ceiling
    g.push(box(25, 3.8, -48.5, 2.0, 0.06, 0.2, MAT.warmGlow));
    g.forEach((el) => root.appendChild(el));
    return g.length;
  }

  // ─── Orchestrator ───────────────────────────────────────────────────
  const CafeSativaInteriors = {
    init() {
      const scene = document.querySelector('a-scene');
      if (!scene) {
        console.warn('[CSInteriors] no <a-scene> found, bailing');
        return;
      }

      const root = document.createElement('a-entity');
      root.id = 'cafe-sativa-interiors';
      scene.appendChild(root);

      // Each room gets its own tagged sub-entity so hero-objects.js can
      // remove it later if a GLB claims the room. Room IDs match the
      // ROOMS[].id in cafe-sativa-wing.js exactly.
      //
      // If window.HERO_LOADED[roomId] already exists with
      // suppressPrimitives:true, skip the primitive pass for that room —
      // the hero GLB has the room covered.
      const heroLoaded = window.HERO_LOADED || {};
      const skip = (roomId) => heroLoaded[roomId] && heroLoaded[roomId].suppressPrimitives;

      const roomWrap = (roomId, builder) => {
        if (skip(roomId)) {
          console.log('[CSInteriors] skip', roomId, '— hero GLB claimed it');
          return 0;
        }
        const sub = document.createElement('a-entity');
        sub.setAttribute('data-cs-room', roomId);
        sub.id = 'cs-room-' + roomId;
        root.appendChild(sub);
        return builder(sub);
      };

      const counts = {
        foyer:         roomWrap('foyer',         roomFoyer),
        gallery:       roomWrap('gallery',       roomGallery),
        bar:           roomWrap('bar',           roomBar),
        mainLounge:    roomWrap('main-lounge',   roomMainLounge),
        coldStoned:    roomWrap('cold-stoned',   roomColdStoned),
        courtyard:     roomWrap('courtyard',     roomCourtyard),
        cigarAirlock:  roomWrap('cigar-airlock', roomCigarAirlock),
        cigarLounge:   roomWrap('cigar',         roomCigarLounge),
        boh:           roomWrap('boh',           roomBoH),
        culinary:      roomWrap('culinary',      roomCulinary),
      };
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      console.log('[CSInteriors] Furnished CS wing.',
        Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(' '),
        `total:${total}`);
    },
  };

  window.CafeSativaInteriors = CafeSativaInteriors;

  // Boot — wait for scene loaded, small extra delay so the wing
  // shell (cafe-sativa-wing.js) has finished rendering its walls
  // and floors first.
  function boot() {
    const scene = document.querySelector('a-scene');
    if (!scene) {
      document.addEventListener('DOMContentLoaded', boot, { once: true });
      return;
    }
    const go = () => setTimeout(() => CafeSativaInteriors.init(), 300);
    if (scene.hasLoaded) go();
    else scene.addEventListener('loaded', go);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
