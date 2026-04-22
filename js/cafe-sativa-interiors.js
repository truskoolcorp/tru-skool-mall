/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Café Sativa Interiors (Furniture Pass)

   Furnishes all 10 rooms of the Café Sativa wing. This file is
   the companion to cafe-sativa-wing.js, which builds the SHELL
   (walls / floors / ceilings / doors / signage) but leaves every
   room empty.

   Split rationale
   ───────────────
   Shell geometry rarely changes — once the audit-validated layout
   landed in v3, the wing file stabilized. Interiors change all
   the time (brand updates, new seating clusters, event-day
   reconfigurations). Keeping the two concerns in separate files
   means interior edits don't risk breaking door alignment or
   collision AABBs.

   Load order (see index.html)
   ───────────────────────────
     js/cafe-sativa-wing.js         — shell (runs at scene init)
     js/cafe-sativa-interiors.js    — furniture (runs AFTER)

   Both hook into A-Frame's 'loaded' event. Shell renders first
   because it registers earlier via CafeSativaWing.init(); this
   file waits an extra tick so room floors exist before we place
   furniture on them.

   Furniture philosophy
   ────────────────────
   - Primitives only (a-box, a-cylinder, a-plane, a-cone, a-sphere,
     a-torus). No GLBs — the mall's 3-avatar GLB budget is spoken
     for. Primitives also keep the bundle size flat.
   - NO solid-wall collision on furniture. Chairs/tables/pedestals
     are walk-through. The room walls (from cafe-sativa-wing.js)
     are the only hard boundaries. Bar counters are the one
     exception — a bar should feel like a bar.
   - Textures reuse the existing generated atlas: #tex-wood-light,
     #tex-wood-dark, #tex-metal, #tex-carpet (loaded by
     texture-generator.js). Materials that won't have a texture
     ready fall back to flat colors — applyTextures() in
     store-interiors.js only auto-retextures, doesn't require it.
   - Per-room palettes match the shell ambient config from
     cafe-sativa-wing.js ROOMS, so furniture visually belongs in
     its room rather than standing out.

   Coordinate system
   ─────────────────
   Every room receives its world-space center (cx, cz) derived
   from the same xMin/xMax/zMin/zMax that the shell uses. Each
   furnishRoom_*() function positions its pieces in WORLD
   coordinates, not room-relative — this makes it easier to
   cross-reference with the shell code when debugging.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── DOM helpers ────────────────────────────────────────────────────
  function el(tag, attrs) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (attrs[k] !== undefined && attrs[k] !== null) {
          e.setAttribute(k, attrs[k]);
        }
      }
    }
    return e;
  }

  // Shorthand: a-box at (x,y,z) with (w,h,d) and a material string
  function box(x, y, z, w, h, d, material) {
    return el('a-box', {
      position: `${x} ${y} ${z}`,
      width: w,
      height: h,
      depth: d,
      material,
    });
  }

  function cyl(x, y, z, radius, height, material, rotation) {
    return el('a-cylinder', {
      position: `${x} ${y} ${z}`,
      radius,
      height,
      material,
      rotation: rotation || undefined,
    });
  }

  function plane(x, y, z, w, h, rotation, material) {
    return el('a-plane', {
      position: `${x} ${y} ${z}`,
      width: w,
      height: h,
      rotation,
      material,
    });
  }

  function sphere(x, y, z, radius, material) {
    return el('a-sphere', { position: `${x} ${y} ${z}`, radius, material });
  }

  function cone(x, y, z, rBot, rTop, height, rotation, material) {
    return el('a-cone', {
      position: `${x} ${y} ${z}`,
      'radius-bottom': rBot,
      'radius-top': rTop,
      height,
      rotation: rotation || undefined,
      material,
    });
  }

  function text(x, y, z, value, opts) {
    opts = opts || {};
    return el('a-text', {
      position: `${x} ${y} ${z}`,
      value,
      align: opts.align || 'center',
      color: opts.color || '#f1e5d1',
      width: opts.width || 4,
      rotation: opts.rotation || undefined,
    });
  }

  // Point-light emitter (for pendant lights, sconces, etc.)
  function pointLight(x, y, z, color, intensity, distance) {
    return el('a-entity', {
      position: `${x} ${y} ${z}`,
      light: `type: point; color: ${color}; intensity: ${intensity}; distance: ${distance}; decay: 2`,
    });
  }

  // Batch-append an array of entities into a parent group
  function appendAll(parent, nodes) {
    nodes.forEach((n) => {
      if (n) parent.appendChild(n);
    });
  }

  // ─── Furniture palettes (match the shell's per-room ambient) ────────
  const MAT = {
    // Woods
    oakWarm: 'color: #8b6f47; roughness: 0.7; metalness: 0.05',
    oakLight: 'src: #tex-wood-light; repeat: 2 1; roughness: 0.6',
    walnutDark: 'src: #tex-wood-dark; repeat: 2 1; roughness: 0.5',
    walnutSolid: 'color: #3a2418; roughness: 0.6; metalness: 0.05',

    // Metals
    brass: 'color: #c9a84c; metalness: 0.9; roughness: 0.2',
    brassDim: 'color: #8e7436; metalness: 0.85; roughness: 0.35',
    steelBrushed: 'color: #a8a8ac; metalness: 0.85; roughness: 0.4',
    matteBlack: 'color: #1a1a1a; metalness: 0.3; roughness: 0.7',

    // Upholstery
    leatherOxblood: 'color: #4a1a1f; roughness: 0.6; metalness: 0.1',
    velvetSage: 'color: #3a4a38; roughness: 0.9',
    velvetPlum: 'color: #3a1f2a; roughness: 0.9',
    linenCream: 'color: #d9cfba; roughness: 0.95',

    // Stones
    travertine: 'color: #e8e0d0; roughness: 0.8',
    marbleWarm: 'color: #efe6d2; roughness: 0.4; metalness: 0.05',
    stonePaver: 'color: #c0a878; roughness: 0.9',

    // Glass / accents
    glass: 'color: #d8e8ec; opacity: 0.25; transparent: true; metalness: 0.7; roughness: 0.1',
    amberGlow: 'color: #e8a050; emissive: #e8a050; emissiveIntensity: 0.6',
    sageWall: 'color: #2a3828; roughness: 0.9',
    cream: 'color: #f0e8da; roughness: 0.85',
  };

  // Small helper: a cushion (for sofas, chairs). Positioned so its top
  // face sits at (y + height). height is the cushion thickness.
  function cushion(x, y, z, w, d, thickness, material) {
    return box(x, y + thickness / 2, z, w, thickness, d, material);
  }

  // Helper: a side-table / coffee-table (square, flat top, 4 legs)
  function table(cx, cz, w, d, topY, material, legMaterial) {
    const nodes = [];
    const topT = 0.04;
    nodes.push(box(cx, topY, cz, w, topT, d, material));
    const legR = 0.03;
    const legH = topY - topT / 2;
    const lx = w / 2 - 0.08;
    const lz = d / 2 - 0.08;
    nodes.push(cyl(cx - lx, legH / 2, cz - lz, legR, legH, legMaterial || MAT.matteBlack));
    nodes.push(cyl(cx + lx, legH / 2, cz - lz, legR, legH, legMaterial || MAT.matteBlack));
    nodes.push(cyl(cx - lx, legH / 2, cz + lz, legR, legH, legMaterial || MAT.matteBlack));
    nodes.push(cyl(cx + lx, legH / 2, cz + lz, legR, legH, legMaterial || MAT.matteBlack));
    return nodes;
  }

  // Helper: a simple lounge armchair (1.0m × 1.0m footprint). `facing`
  // is yaw in degrees; 0 = chair faces +z. Returns an array of nodes.
  function armchair(cx, cz, facing, material) {
    const g = el('a-entity', {
      position: `${cx} 0 ${cz}`,
      rotation: `0 ${facing || 0} 0`,
    });
    // Base / seat cushion
    g.appendChild(box(0, 0.25, 0, 0.9, 0.18, 0.9, material));
    g.appendChild(box(0, 0.42, 0, 0.82, 0.14, 0.82, MAT.linenCream));
    // Back
    g.appendChild(box(0, 0.75, -0.4, 0.9, 0.9, 0.12, material));
    // Arms
    g.appendChild(box(-0.45, 0.45, 0.05, 0.08, 0.3, 0.7, material));
    g.appendChild(box(0.45, 0.45, 0.05, 0.08, 0.3, 0.7, material));
    // Feet — short tapered cylinders
    g.appendChild(cyl(-0.35, 0.08, -0.35, 0.03, 0.15, MAT.matteBlack));
    g.appendChild(cyl(0.35, 0.08, -0.35, 0.03, 0.15, MAT.matteBlack));
    g.appendChild(cyl(-0.35, 0.08, 0.35, 0.03, 0.15, MAT.matteBlack));
    g.appendChild(cyl(0.35, 0.08, 0.35, 0.03, 0.15, MAT.matteBlack));
    return g;
  }

  // Helper: a 2-seat sofa (1.8m wide). `facing`: same as armchair.
  function sofa(cx, cz, facing, material) {
    const g = el('a-entity', {
      position: `${cx} 0 ${cz}`,
      rotation: `0 ${facing || 0} 0`,
    });
    // Base frame
    g.appendChild(box(0, 0.25, 0, 1.8, 0.18, 0.9, material));
    // Two seat cushions
    g.appendChild(box(-0.45, 0.42, 0, 0.82, 0.14, 0.82, MAT.linenCream));
    g.appendChild(box(0.45, 0.42, 0, 0.82, 0.14, 0.82, MAT.linenCream));
    // Back — continuous
    g.appendChild(box(0, 0.75, -0.4, 1.8, 0.9, 0.12, material));
    // Arms
    g.appendChild(box(-0.9, 0.45, 0.05, 0.08, 0.3, 0.7, material));
    g.appendChild(box(0.9, 0.45, 0.05, 0.08, 0.3, 0.7, material));
    // Feet
    g.appendChild(cyl(-0.8, 0.08, -0.35, 0.03, 0.15, MAT.matteBlack));
    g.appendChild(cyl(0.8, 0.08, -0.35, 0.03, 0.15, MAT.matteBlack));
    g.appendChild(cyl(-0.8, 0.08, 0.35, 0.03, 0.15, MAT.matteBlack));
    g.appendChild(cyl(0.8, 0.08, 0.35, 0.03, 0.15, MAT.matteBlack));
    return g;
  }

  // Helper: a bar stool (tall, ~0.75m seat height)
  function barStool(cx, cz, material) {
    const g = el('a-entity', { position: `${cx} 0 ${cz}` });
    g.appendChild(cyl(0, 0.375, 0, 0.04, 0.75, MAT.brassDim));
    g.appendChild(cyl(0, 0.78, 0, 0.2, 0.05, material || MAT.leatherOxblood));
    // Footrest ring
    g.appendChild(el('a-torus', {
      position: '0 0.2 0',
      radius: 0.18,
      'radius-tubular': 0.012,
      rotation: '90 0 0',
      material: MAT.brassDim,
    }));
    return g;
  }

  // Helper: a bistro chair (for courtyard / cafe seating)
  function bistroChair(cx, cz, facing) {
    const g = el('a-entity', {
      position: `${cx} 0 ${cz}`,
      rotation: `0 ${facing || 0} 0`,
    });
    g.appendChild(cyl(0, 0.22, 0, 0.22, 0.04, MAT.steelBrushed));
    g.appendChild(cyl(0, 0.11, 0, 0.015, 0.22, MAT.steelBrushed));
    // Splayed back frame
    g.appendChild(box(0, 0.5, -0.2, 0.35, 0.55, 0.03, MAT.steelBrushed));
    return g;
  }

  // Helper: a potted plant (simple cylinder pot + sphere foliage)
  function plant(cx, cz, scale) {
    scale = scale || 1;
    const g = el('a-entity', { position: `${cx} 0 ${cz}` });
    const potR = 0.2 * scale;
    const potH = 0.35 * scale;
    g.appendChild(cyl(0, potH / 2, 0, potR, potH, MAT.walnutSolid));
    g.appendChild(sphere(0, potH + 0.35 * scale, 0, 0.38 * scale,
      'color: #3a5a2a; roughness: 0.9'));
    g.appendChild(sphere(-0.15 * scale, potH + 0.5 * scale, 0.1 * scale,
      0.22 * scale, 'color: #4a6a30; roughness: 0.9'));
    g.appendChild(sphere(0.2 * scale, potH + 0.42 * scale, -0.12 * scale,
      0.25 * scale, 'color: #2d4a20; roughness: 0.9'));
    return g;
  }

  // Helper: a small pendant lamp (cone + light)
  function pendantLamp(cx, cy, cz, tint) {
    const g = el('a-entity', { position: `${cx} ${cy} ${cz}` });
    // Cord
    g.appendChild(cyl(0, 0.5, 0, 0.008, 1.0, MAT.matteBlack));
    // Shade (inverted cone)
    g.appendChild(cone(0, 0, 0, 0.15, 0.05, 0.18, '180 0 0',
      `color: ${tint || '#2a1a10'}; metalness: 0.5; roughness: 0.4`));
    // Bulb
    g.appendChild(sphere(0, -0.08, 0, 0.05,
      'color: #ffcf80; emissive: #ffcf80; emissiveIntensity: 0.9'));
    g.appendChild(pointLight(0, -0.08, 0, '#ffcf80', 0.6, 5));
    return g;
  }

  // Helper: a framed wall picture. Mounted on a wall at (x, y, z),
  // facing along `axis` (with `dir` = +1 or -1 indicating which side
  // of the wall the frame's face is on). `w`/`h` are frame dimensions.
  // Draws a dark frame box with a colored plane for the "art".
  function framedArt(x, y, z, w, h, axis, dir, artColor) {
    const g = el('a-entity', { position: `${x} ${y} ${z}` });
    const frameT = 0.04;
    const frameD = 0.06;
    // Frame is thin in the wall-normal direction
    if (axis === 'x') {
      // Wall runs along z; frame faces ±x
      g.appendChild(box(0, 0, 0, frameD, h, w, MAT.walnutDark));
      g.appendChild(plane(dir * (frameD / 2 + 0.002), 0, 0,
        w * 0.88, h * 0.88, `0 ${dir > 0 ? 90 : -90} 0`,
        `color: ${artColor || '#c0a878'}; roughness: 0.85`));
    } else {
      // Wall runs along x; frame faces ±z
      g.appendChild(box(0, 0, 0, w, h, frameD, MAT.walnutDark));
      g.appendChild(plane(0, 0, dir * (frameD / 2 + 0.002),
        w * 0.88, h * 0.88, `0 ${dir > 0 ? 0 : 180} 0`,
        `color: ${artColor || '#c0a878'}; roughness: 0.85`));
    }
    return g;
  }

  // ─────────────────────────────────────────────────────────────────────
  // ROOM 1 — FOYER  (23..27, -21.5..-18)  ceiling 4
  // Small (4m × 3.5m) warm welcome room between the arcade and the
  // Gallery. Reception desk angled so guests naturally route around it
  // into the Gallery beyond.
  // ─────────────────────────────────────────────────────────────────────
  function furnishFoyer(root) {
    const g = el('a-entity', { id: 'cs-furn-foyer' });

    // Welcome rug (centered between the two doors)
    g.appendChild(plane(25, 0.02, -19.75, 2.4, 1.8, '-90 0 0',
      'color: #6a3a28; roughness: 0.95'));

    // Reception desk — 1.6m wide, along the east wall, facing the
    // arriving guest.  Desk sits at ~z=-20, pushed to the east so
    // approach from the south door flows around it.
    g.appendChild(box(26.4, 0.55, -20, 0.7, 1.1, 1.8, MAT.walnutDark));
    // Desk countertop (slight overhang)
    g.appendChild(box(26.4, 1.12, -20, 0.8, 0.04, 1.85, MAT.marbleWarm));
    // Concierge tablet / monitor
    g.appendChild(box(26.4, 1.25, -20.3, 0.3, 0.22, 0.02, MAT.matteBlack));
    // Small desk lamp
    g.appendChild(cyl(26.4, 1.16, -19.5, 0.04, 0.12, MAT.brass));
    g.appendChild(cone(26.4, 1.32, -19.5, 0.1, 0.05, 0.15, undefined,
      'color: #c9a84c; metalness: 0.7; roughness: 0.3'));

    // Flanking planters at the Gallery threshold
    g.appendChild(plant(23.7, -18.5, 0.9));
    g.appendChild(plant(26.3, -18.5, 0.9));

    // Pendant over the center
    g.appendChild(pendantLamp(25, 3.3, -19.75, '#2a1a10'));

    // Wall art behind the desk
    g.appendChild(framedArt(26.9, 2.1, -20, 0.9, 1.2, 'x', -1, '#d9cfba'));

    root.appendChild(g);
  }

  // ─────────────────────────────────────────────────────────────────────
  // ROOM 2 — GALLERY  (22..28, -29.5..-21.5)  ceiling 10 (DOUBLE-HEIGHT)
  // The first "wow" space. 4 pedestals in a grid, framed panels along
  // east and west walls, a central bench, and a pair of track-light
  // bars overhead.
  // ─────────────────────────────────────────────────────────────────────
  function furnishGallery(root) {
    const g = el('a-entity', { id: 'cs-furn-gallery' });

    // Four pedestals, rough 2m grid — leaves clear north-south sightline
    const pedPositions = [
      [23.6, -24], [26.4, -24],
      [23.6, -27], [26.4, -27],
    ];
    pedPositions.forEach(([x, z], i) => {
      // Pedestal body (white travertine, 0.9m tall, 0.5×0.5 footprint)
      g.appendChild(box(x, 0.45, z, 0.5, 0.9, 0.5, MAT.travertine));
      // Object on top — alternate a sphere and a torus so each is
      // distinct at a glance
      if (i % 2 === 0) {
        g.appendChild(sphere(x, 1.15, z, 0.18,
          'color: #c9a84c; metalness: 0.85; roughness: 0.25'));
      } else {
        g.appendChild(el('a-torus', {
          position: `${x} 1.15 ${z}`,
          radius: 0.18,
          'radius-tubular': 0.05,
          material: 'color: #4a1a1f; metalness: 0.3; roughness: 0.7',
        }));
      }
      // Small accent label plate
      g.appendChild(plane(x, 0.05, z + 0.26, 0.4, 0.06, '-90 0 0',
        'color: #3a2418; roughness: 0.8'));
    });

    // Framed panels on east wall (x=28) and west wall (x=22)
    // Hung at 3.5m (gallery is double-height so art sits higher)
    // West wall — series of 3
    [-23.5, -25.5, -27.5].forEach((z, i) => {
      const color = ['#a05040', '#5a7c5c', '#c5a155'][i];
      g.appendChild(framedArt(22.05, 3.2, z, 1.4, 1.8, 'x', 1, color));
    });
    // East wall — series of 3
    [-23.5, -25.5, -27.5].forEach((z, i) => {
      const color = ['#3a4a6a', '#c9a84c', '#6a3a4a'][i];
      g.appendChild(framedArt(27.95, 3.2, z, 1.4, 1.8, 'x', -1, color));
    });

    // Central bench (backless, cream linen on a dark wood base)
    g.appendChild(box(25, 0.2, -25.5, 2.4, 0.08, 0.5, MAT.walnutDark));
    g.appendChild(box(25, 0.32, -25.5, 2.4, 0.12, 0.45, MAT.linenCream));

    // Track lighting — two bars spanning the room's N-S axis at 8m
    g.appendChild(cyl(23.8, 8, -25.5, 0.025, 7, MAT.matteBlack, '90 0 0'));
    g.appendChild(cyl(26.2, 8, -25.5, 0.025, 7, MAT.matteBlack, '90 0 0'));
    // Spot heads — one per pedestal, aimed downward
    pedPositions.forEach(([x, z]) => {
      const trackX = x < 25 ? 23.8 : 26.2;
      g.appendChild(cone(trackX, 7.75, z, 0.08, 0, 0.18, '180 0 0',
        'color: #1a1a1a; emissive: #fff4d0; emissiveIntensity: 0.5'));
      g.appendChild(pointLight(x, 7.5, z, '#fff4d0', 0.5, 9));
    });

    // "GALLERY" wordmark on the north wall (z=-29.3)
    g.appendChild(text(25, 5.5, -29.3, 'GALLERY', {
      width: 6, color: '#c9a84c', rotation: '0 0 0',
    }));

    root.appendChild(g);
  }

  // ─────────────────────────────────────────────────────────────────────
  // ROOM 3 — COCKTAIL BAR  (20..30, -37.5..-29.5)  ceiling 4.5
  // Big charcoal room (10m × 8m). L-shaped bar along the west wall
  // with a long leg on the north, 6 stools, backbar bottle display,
  // 2 high-top cocktail tables mid-room.
  // ─────────────────────────────────────────────────────────────────────
  function furnishBar(root) {
    const g = el('a-entity', { id: 'cs-furn-bar' });

    // West leg of the L — runs n-s along x=21.2, from z=-36 to z=-31
    // Bar counter is 0.9m deep (extending east from the wall) and 1.1m tall
    g.appendChild(box(21.5, 0.55, -33.5, 0.9, 1.1, 5.0, MAT.walnutDark));
    // Bar-top (marble, 1.0m deep to overhang)
    g.appendChild(box(21.55, 1.12, -33.5, 1.0, 0.05, 5.1, MAT.marbleWarm));
    // Foot rail (brass) along the customer side of the west leg
    g.appendChild(cyl(22.05, 0.18, -33.5, 0.025, 4.9, MAT.brass, '90 0 0'));

    // North leg of the L — runs e-w along z=-30.2, from x=21 to x=25
    g.appendChild(box(23, 0.55, -30.2, 4.0, 1.1, 0.9, MAT.walnutDark));
    g.appendChild(box(23, 1.12, -30.25, 4.1, 0.05, 1.0, MAT.marbleWarm));
    g.appendChild(cyl(23, 0.18, -29.7, 0.025, 3.9, MAT.brass));

    // Bar stools along the west leg (east-facing customers)
    [-35, -34, -33, -32].forEach((z) => {
      g.appendChild(barStool(22.4, z, MAT.leatherOxblood));
    });
    // Stools along the north leg (south-facing customers)
    [22, 23, 24].forEach((x) => {
      g.appendChild(barStool(x, -29.3, MAT.leatherOxblood));
    });

    // Back-bar bottle display — wall-mounted shelves on the west wall
    // at x=20.1 (just inside the wall at x=20). Three shelves.
    [1.6, 2.2, 2.8].forEach((y) => {
      g.appendChild(box(20.15, y, -33.5, 0.08, 0.05, 4.5, MAT.brass));
    });
    // A row of bottles on the middle shelf — varied colors
    const bottleColors = ['#c9a84c', '#2a4a3a', '#8a2020', '#1a1a3a',
      '#c0a878', '#2a1a1a', '#d8c058', '#6a3028', '#4a5a3a'];
    bottleColors.forEach((c, i) => {
      g.appendChild(cyl(20.25, 2.42, -35.7 + i * 0.48, 0.04, 0.32,
        `color: ${c}; opacity: 0.85; transparent: true`));
    });

    // Back-bar mirror above the bottles
    g.appendChild(plane(20.11, 3.6, -33.5, 4.5, 0.8, '0 90 0',
      'color: #d8d8e0; metalness: 0.95; roughness: 0.08'));

    // Two high-top cocktail tables mid-room (east of the bar)
    [[26, -34], [27.5, -32]].forEach(([x, z]) => {
      // Tall table
      g.appendChild(cyl(x, 0.55, z, 0.05, 1.1, MAT.matteBlack));
      g.appendChild(cyl(x, 1.1, z, 0.35, 0.05, MAT.walnutDark));
      g.appendChild(cyl(x, 0.05, z, 0.3, 0.04, MAT.matteBlack));
      // Two stools at each
      g.appendChild(barStool(x - 0.7, z, MAT.leatherOxblood));
      g.appendChild(barStool(x + 0.7, z, MAT.leatherOxblood));
    });

    // Pendant lights over the bar (warm amber, lower than ceiling)
    g.appendChild(pendantLamp(22.2, 3.8, -35, '#c9a84c'));
    g.appendChild(pendantLamp(22.2, 3.8, -33.5, '#c9a84c'));
    g.appendChild(pendantLamp(22.2, 3.8, -32, '#c9a84c'));
    g.appendChild(pendantLamp(23.5, 3.8, -30.3, '#c9a84c'));

    // Wall art on the east wall — a single large panel
    g.appendChild(framedArt(29.95, 2.2, -34, 2.4, 1.5, 'x', -1, '#4a2828'));

    root.appendChild(g);
  }

  // ─────────────────────────────────────────────────────────────────────
  // ROOM 4 — MAIN LOUNGE  (17.5..32.5, -46..-37.5)  ceiling 6
  // The product-critical room — "At The Table" Ep 1 lives here.
  // 15m × 8.5m sage room. Stage on the north wall, DJ/host table
  // stage-right, three seating clusters across the audience floor.
  // ─────────────────────────────────────────────────────────────────────
  function furnishMainLounge(root) {
    const g = el('a-entity', { id: 'cs-furn-main-lounge' });

    // ── STAGE ──
    // Raised platform 10m wide, 2m deep, 0.35m high on the north wall
    // (leaving a back path to the Culinary door at z=-46).
    g.appendChild(box(25, 0.175, -44.5, 10.0, 0.35, 2.0, MAT.walnutDark));
    // Stage skirt (darker band along the south face of the platform)
    g.appendChild(box(25, 0.12, -43.5, 10.0, 0.25, 0.04, MAT.matteBlack));
    // Stage backdrop banner on the north wall (z=-46)
    g.appendChild(plane(25, 3, -45.95, 8.0, 3.5, '0 0 0',
      'color: #2a1810; roughness: 0.95'));
    g.appendChild(text(25, 3.6, -45.9, 'AT THE TABLE', {
      width: 10, color: '#c9a84c',
    }));
    g.appendChild(text(25, 2.6, -45.9, 'ep. 01 · cafe sativa', {
      width: 7, color: '#d9cfba',
    }));

    // Host table on the stage (center)
    appendAll(g, table(25, -44.6, 2.2, 0.9, 1.0, MAT.walnutDark, MAT.brassDim));
    // Two host chairs on stage
    g.appendChild(armchair(24.2, -44.2, 0, MAT.leatherOxblood));
    g.appendChild(armchair(25.8, -44.2, 0, MAT.leatherOxblood));

    // Standing mic to stage-left (for solo delivery moments)
    g.appendChild(cyl(22.5, 0.95, -44, 0.02, 1.2, MAT.matteBlack));
    g.appendChild(sphere(22.5, 1.55, -44, 0.06, MAT.matteBlack));

    // ── AUDIENCE FLOOR — three seating clusters ──
    // Cluster A (west): sofa facing stage + 2 chairs + coffee table
    g.appendChild(sofa(19.5, -41.5, 0, MAT.velvetSage));
    g.appendChild(armchair(18.5, -40, 45, MAT.leatherOxblood));
    g.appendChild(armchair(20.5, -40, -45, MAT.leatherOxblood));
    appendAll(g, table(19.5, -40.5, 0.9, 0.6, 0.4, MAT.walnutDark));

    // Cluster B (center): two sofas facing each other across a
    // longer coffee table
    g.appendChild(sofa(25, -40.5, 0, MAT.velvetSage));
    g.appendChild(sofa(25, -38.7, 180, MAT.velvetSage));
    appendAll(g, table(25, -39.6, 1.2, 0.6, 0.4, MAT.walnutDark));

    // Cluster C (east): sofa facing stage + 2 chairs + coffee table
    g.appendChild(sofa(30.5, -41.5, 0, MAT.velvetSage));
    g.appendChild(armchair(29.5, -40, 45, MAT.leatherOxblood));
    g.appendChild(armchair(31.5, -40, -45, MAT.leatherOxblood));
    appendAll(g, table(30.5, -40.5, 0.9, 0.6, 0.4, MAT.walnutDark));

    // ── DJ / TECH CORNER (stage-right / east end of stage) ──
    g.appendChild(box(31, 0.55, -44.5, 1.4, 1.0, 0.7, MAT.matteBlack));
    g.appendChild(box(31, 1.08, -44.5, 1.5, 0.03, 0.8, MAT.walnutDark));
    // Mixer on top (suggested)
    g.appendChild(box(31, 1.13, -44.5, 0.7, 0.08, 0.4, MAT.matteBlack));
    // Two small amber indicator lights
    g.appendChild(sphere(30.85, 1.18, -44.5, 0.02, MAT.amberGlow));
    g.appendChild(sphere(31.15, 1.18, -44.5, 0.02, MAT.amberGlow));

    // ── LIGHTING ──
    // Stage wash (two warm pars from the front)
    g.appendChild(pointLight(23, 4.5, -43.5, '#e8a050', 1.2, 10));
    g.appendChild(pointLight(27, 4.5, -43.5, '#e8a050', 1.2, 10));
    // Audience pendants over each cluster
    g.appendChild(pendantLamp(19.5, 4.8, -40.5, '#c08850'));
    g.appendChild(pendantLamp(25, 4.8, -39.6, '#c08850'));
    g.appendChild(pendantLamp(30.5, 4.8, -40.5, '#c08850'));

    root.appendChild(g);
  }

  // ─────────────────────────────────────────────────────────────────────
  // ROOM 5 — COLD STONED  (28..32, -26..-21.5)  ceiling 4
  // Tiny bright ice-cream / gelato window — 4m × 4.5m.
  // Curved glass counter, 2 stools at a narrow ledge, chalk menu.
  // ─────────────────────────────────────────────────────────────────────
  function furnishColdStoned(root) {
    const g = el('a-entity', { id: 'cs-furn-cold-stoned' });

    // Serving counter — runs along the north wall
    g.appendChild(box(30, 0.55, -25.3, 3.6, 1.1, 0.7, MAT.walnutLight || MAT.oakLight));
    // Glass sneezeguard (tall, slightly inset)
    g.appendChild(box(30, 1.4, -25.4, 3.4, 0.6, 0.5, MAT.glass));
    // Marble countertop
    g.appendChild(box(30, 1.12, -25.3, 3.7, 0.04, 0.75, MAT.marbleWarm));
    // Ice-cream tub inserts (6 colored puck shapes)
    const flavors = ['#f5d0b0', '#3a2418', '#e8c0c8',
      '#c0d8a0', '#d8a050', '#b8a0d8'];
    flavors.forEach((c, i) => {
      const x = 28.6 + (i % 3) * 0.7;
      const z = -25.15 - Math.floor(i / 3) * 0.25;
      g.appendChild(cyl(x, 1.16, z, 0.12, 0.05, `color: ${c}; roughness: 0.9`));
    });

    // Back wall menu board — chalk-on-slate effect
    g.appendChild(plane(30, 2.5, -25.95, 2.4, 1.2, '0 0 0',
      'color: #1a1a1a; roughness: 0.95'));
    g.appendChild(text(30, 2.8, -25.9, 'COLD STONED', {
      width: 3.5, color: '#f0e8da',
    }));
    g.appendChild(text(30, 2.3, -25.9, 'gelato · sorbet · affogato', {
      width: 3, color: '#c9a84c',
    }));

    // Narrow counter-height ledge under the west wall for 2 stools
    g.appendChild(box(28.5, 1.0, -23.5, 0.8, 0.05, 1.5, MAT.walnutDark));
    g.appendChild(barStool(28.5, -23, MAT.linenCream));
    g.appendChild(barStool(28.5, -24, MAT.linenCream));

    // Pendant over the counter
    g.appendChild(pendantLamp(30, 3.3, -24.2, '#ffffff'));

    root.appendChild(g);
  }

  // ─────────────────────────────────────────────────────────────────────
  // ROOM 6 — COURTYARD  (30..37, -31..-26)  ceiling 12 (open-air)
  // 7m × 5m stone-paved courtyard. Central fountain, 3 bistro sets,
  // planters along walls, string lights overhead.
  // ─────────────────────────────────────────────────────────────────────
  function furnishCourtyard(root) {
    const g = el('a-entity', { id: 'cs-furn-courtyard' });

    // Central fountain — 3-tier cake
    const fx = 33.5, fz = -28.5;
    // Base pool (wide, short cylinder)
    g.appendChild(cyl(fx, 0.15, fz, 1.1, 0.3, MAT.travertine));
    // Water surface
    g.appendChild(cyl(fx, 0.28, fz, 1.0, 0.04,
      'color: #3a6080; opacity: 0.7; transparent: true; metalness: 0.4'));
    // Middle tier
    g.appendChild(cyl(fx, 0.5, fz, 0.4, 0.35, MAT.travertine));
    // Top basin
    g.appendChild(cyl(fx, 0.85, fz, 0.25, 0.1, MAT.travertine));
    // Spout
    g.appendChild(cyl(fx, 1.05, fz, 0.04, 0.3, MAT.brass));

    // Bistro sets — 3 tables with 2 chairs each, corners of the room
    const bistroSpots = [
      [31.5, -27.0], [31.5, -30.0], [35.5, -27.0],
    ];
    bistroSpots.forEach(([bx, bz]) => {
      // Round table
      g.appendChild(cyl(bx, 0.37, bz, 0.04, 0.75, MAT.steelBrushed));
      g.appendChild(cyl(bx, 0.75, bz, 0.45, 0.04, MAT.marbleWarm));
      g.appendChild(cyl(bx, 0.02, bz, 0.25, 0.03, MAT.steelBrushed));
      // Two chairs opposite
      g.appendChild(bistroChair(bx - 0.7, bz, 90));
      g.appendChild(bistroChair(bx + 0.7, bz, -90));
    });

    // Planters along the east and south walls
    [[36.5, -27], [36.5, -29.5], [32, -30.8], [35, -30.8]].forEach(([x, z]) => {
      g.appendChild(box(x, 0.3, z, 0.7, 0.6, 0.4, MAT.walnutSolid));
      g.appendChild(plant(x, z + 0.05, 1.1));
    });

    // String lights — zigzag overhead at y=4 (courtyard is open-air to 12)
    const stringY = 4;
    const bulbColor = 'color: #ffcf80; emissive: #ffcf80; emissiveIntensity: 0.6';
    // Two cables spanning the courtyard
    [
      [30.1, -27.5, 36.9, -27.5],
      [30.1, -29.5, 36.9, -29.5],
    ].forEach(([x1, z1, x2, z2]) => {
      // Cable (thin box)
      const cx = (x1 + x2) / 2;
      const cz = (z1 + z2) / 2;
      const len = Math.abs(x2 - x1);
      g.appendChild(cyl(cx, stringY, cz, 0.006, len, MAT.matteBlack,
        '0 0 90'));
      // Bulbs every 1m
      for (let bx = x1 + 1; bx < x2; bx += 1.2) {
        g.appendChild(sphere(bx, stringY - 0.12, cz, 0.05, bulbColor));
      }
    });

    root.appendChild(g);
  }

  // ─────────────────────────────────────────────────────────────────────
  // ROOM 7 — CIGAR AIRLOCK  (32.5..35.7, -44.5..-43)  ceiling 3
  // Tiny transition room — 3.2m × 1.5m. Intentionally dim. Coat-check
  // bench, small humidor on a side table, two sconces, velvet rope
  // (already built in cafe-sativa-wing.js:348).
  // ─────────────────────────────────────────────────────────────────────
  function furnishCigarAirlock(root) {
    const g = el('a-entity', { id: 'cs-furn-cigar-airlock' });

    // Coat-check bench on the south wall (z=-43, bench along z=-43.3)
    g.appendChild(box(34.1, 0.2, -43.2, 1.8, 0.35, 0.4, MAT.walnutDark));
    g.appendChild(box(34.1, 0.38, -43.2, 1.8, 0.04, 0.4, MAT.leatherOxblood));

    // Small humidor table on the north wall
    g.appendChild(box(33.2, 0.4, -44.3, 0.5, 0.8, 0.35, MAT.walnutSolid));
    // Humidor box
    g.appendChild(box(33.2, 0.88, -44.3, 0.35, 0.16, 0.22, MAT.walnutDark));
    // Tiny brass clasp
    g.appendChild(box(33.2, 0.96, -44.18, 0.04, 0.02, 0.02, MAT.brass));

    // Wall sconces (dim amber)
    g.appendChild(cone(32.7, 1.9, -43.8, 0.08, 0.15, 0.2, undefined,
      `color: #3a2418; emissive: #c08850; emissiveIntensity: 0.4`));
    g.appendChild(cone(35.5, 1.9, -43.8, 0.08, 0.15, 0.2, undefined,
      `color: #3a2418; emissive: #c08850; emissiveIntensity: 0.4`));
    g.appendChild(pointLight(32.7, 1.9, -43.8, '#c08850', 0.4, 3));
    g.appendChild(pointLight(35.5, 1.9, -43.8, '#c08850', 0.4, 3));

    root.appendChild(g);
  }

  // ─────────────────────────────────────────────────────────────────────
  // ROOM 8 — CIGAR LOUNGE  (35.7..41.7, -46..-37.5)  ceiling 3 (VIP)
  // 6m × 8.5m oxblood-and-green room. VIP-gated by vip-gate.js.
  // Four leather armchairs around a low round table (the hero moment),
  // a couples booth on the east wall, humidor cabinet, cognac cart,
  // small performance alcove with a single stool.
  // ─────────────────────────────────────────────────────────────────────
  function furnishCigarLounge(root) {
    const g = el('a-entity', { id: 'cs-furn-cigar' });

    // Hero cluster — 4 armchairs around a low round table
    const hx = 37.5, hz = -41;
    // Low round table
    g.appendChild(cyl(hx, 0.3, hz, 0.55, 0.04, MAT.walnutDark));
    g.appendChild(cyl(hx, 0.15, hz, 0.05, 0.3, MAT.matteBlack));
    g.appendChild(cyl(hx, 0.03, hz, 0.4, 0.04, MAT.matteBlack));
    // Ashtray on the table
    g.appendChild(cyl(hx, 0.35, hz, 0.09, 0.025,
      'color: #3a2418; metalness: 0.6; roughness: 0.4'));
    // Four armchairs facing inward
    g.appendChild(armchair(hx - 1.2, hz, 90, MAT.leatherOxblood));
    g.appendChild(armchair(hx + 1.2, hz, -90, MAT.leatherOxblood));
    g.appendChild(armchair(hx, hz - 1.2, 180, MAT.leatherOxblood));
    g.appendChild(armchair(hx, hz + 1.2, 0, MAT.leatherOxblood));

    // Couples booth on the east wall (around x=41, z=-40 to -44)
    // A long curved banquette (approximated with a straight bench +
    // two side walls)
    g.appendChild(box(41, 0.25, -42, 0.6, 0.4, 3.5, MAT.leatherOxblood));
    g.appendChild(box(41, 0.75, -42, 0.3, 0.7, 3.5, MAT.leatherOxblood));
    // Two small cocktail tables in front of the booth
    g.appendChild(cyl(40.2, 0.37, -40.8, 0.04, 0.75, MAT.matteBlack));
    g.appendChild(cyl(40.2, 0.75, -40.8, 0.35, 0.04, MAT.walnutDark));
    g.appendChild(cyl(40.2, 0.37, -43.2, 0.04, 0.75, MAT.matteBlack));
    g.appendChild(cyl(40.2, 0.75, -43.2, 0.35, 0.04, MAT.walnutDark));

    // Humidor cabinet on the west wall (just inside the airlock door)
    g.appendChild(box(36.05, 1.0, -38.5, 0.5, 2.0, 0.9, MAT.walnutDark));
    g.appendChild(box(36.1, 1.0, -38.5, 0.03, 1.9, 0.85, MAT.glass));
    // Glowing interior hint
    g.appendChild(pointLight(36.2, 1.0, -38.5, '#c08850', 0.25, 1.5));

    // Cognac cart — south-west corner, 3-tier trolley
    g.appendChild(box(36.5, 0.25, -45, 0.8, 0.04, 0.5, MAT.walnutDark));
    g.appendChild(box(36.5, 0.7, -45, 0.8, 0.04, 0.5, MAT.walnutDark));
    g.appendChild(box(36.5, 1.1, -45, 0.8, 0.04, 0.5, MAT.walnutDark));
    // Corner posts
    [[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]].forEach(([dx, dz]) => {
      g.appendChild(cyl(36.5 + dx, 0.55, -45 + dz, 0.02, 1.1, MAT.brassDim));
    });
    // Small wheels
    [[-0.3, -0.18], [0.3, -0.18], [-0.3, 0.18], [0.3, 0.18]].forEach(([dx, dz]) => {
      g.appendChild(cyl(36.5 + dx, 0.04, -45 + dz, 0.04, 0.03, MAT.matteBlack,
        '90 0 0'));
    });
    // Three decanters on the middle shelf
    ['#c9a84c', '#8a4020', '#6a3020'].forEach((c, i) => {
      g.appendChild(cyl(36.3 + i * 0.2, 0.88, -45, 0.06, 0.22,
        `color: ${c}; opacity: 0.75; transparent: true`));
    });

    // Pendant lights (dim amber, low ceiling)
    g.appendChild(pendantLamp(hx, 2.5, hz, '#8a4020'));
    g.appendChild(pendantLamp(40.2, 2.5, -42, '#8a4020'));

    // Wall art on the south wall (z=-37.5)
    g.appendChild(framedArt(38.5, 1.9, -37.55, 1.8, 1.2, 'z', -1, '#3a4a38'));

    root.appendChild(g);
  }

  // ─────────────────────────────────────────────────────────────────────
  // ROOM 9 — BACK OF HOUSE  (15..20, -34.5..-29.5)  ceiling 3 (staff)
  // 5m × 5m utility room. Minimal by design — it's backstage. Prep
  // island center, wall shelving along north wall, a rolling rack.
  // ─────────────────────────────────────────────────────────────────────
  function furnishBoH(root) {
    const g = el('a-entity', { id: 'cs-furn-boh' });

    // Prep island — stainless steel
    g.appendChild(box(17.5, 0.45, -32, 2.0, 0.9, 0.8, MAT.steelBrushed));
    g.appendChild(box(17.5, 0.92, -32, 2.05, 0.03, 0.85, MAT.steelBrushed));

    // Wall shelving (north wall, z=-34.4) — 3 shelves
    [1.2, 1.8, 2.4].forEach((y) => {
      g.appendChild(box(17.5, y, -34.3, 4.5, 0.04, 0.3, MAT.steelBrushed));
      // Bracket legs
      g.appendChild(cyl(15.2, y - 0.02, -34.3, 0.015, 0.04, MAT.matteBlack));
      g.appendChild(cyl(17.5, y - 0.02, -34.3, 0.015, 0.04, MAT.matteBlack));
      g.appendChild(cyl(19.8, y - 0.02, -34.3, 0.015, 0.04, MAT.matteBlack));
    });
    // A few staged items on shelves
    g.appendChild(box(16, 1.32, -34.3, 0.2, 0.25, 0.15, MAT.cream));
    g.appendChild(box(16.5, 1.32, -34.3, 0.2, 0.25, 0.15, MAT.cream));
    g.appendChild(cyl(18.5, 1.95, -34.3, 0.1, 0.3, MAT.matteBlack));
    g.appendChild(cyl(19.2, 1.95, -34.3, 0.1, 0.3, MAT.matteBlack));

    // Rolling rack (east corner)
    g.appendChild(cyl(19.5, 0.9, -30.5, 0.02, 1.8, MAT.matteBlack));
    g.appendChild(cyl(19.5, 0.9, -31.2, 0.02, 1.8, MAT.matteBlack));
    g.appendChild(box(19.5, 1.75, -30.85, 0.04, 0.04, 0.8, MAT.matteBlack));
    // Trays
    g.appendChild(box(19.5, 0.5, -30.85, 0.6, 0.03, 0.6, MAT.steelBrushed));
    g.appendChild(box(19.5, 1.0, -30.85, 0.6, 0.03, 0.6, MAT.steelBrushed));
    g.appendChild(box(19.5, 1.5, -30.85, 0.6, 0.03, 0.6, MAT.steelBrushed));

    // Overhead fluorescent — cool white, functional
    g.appendChild(box(17.5, 2.95, -32, 1.2, 0.06, 0.2,
      'color: #e8e8e8; emissive: #ffffff; emissiveIntensity: 0.7'));
    g.appendChild(pointLight(17.5, 2.85, -32, '#ffffff', 0.8, 5));

    // "STAFF ONLY" text on the back wall (facing the Bar door)
    g.appendChild(text(17.5, 2.3, -29.55, 'STAFF ONLY', {
      width: 4, color: '#8a8a8a', rotation: '0 180 0',
    }));

    root.appendChild(g);
  }

  // ─────────────────────────────────────────────────────────────────────
  // ROOM 10 — CULINARY THEATER  (22.5..27.5, -51..-46)  ceiling 5
  // 5m × 5m bright demo kitchen. Island facing south (toward audience
  // seating), 2 rows of 3 chairs, overhead broadcast rig.
  // ─────────────────────────────────────────────────────────────────────
  function furnishCulinary(root) {
    const g = el('a-entity', { id: 'cs-furn-culinary' });

    // Demo kitchen island — runs E-W, closer to the north wall
    g.appendChild(box(25, 0.45, -49, 3.0, 0.9, 1.0, MAT.walnutLight || MAT.oakLight));
    g.appendChild(box(25, 0.92, -49, 3.05, 0.04, 1.05, MAT.marbleWarm));
    // Induction hob (two burners facing the audience)
    g.appendChild(box(25, 0.95, -49.3, 0.8, 0.02, 0.4, MAT.matteBlack));
    g.appendChild(cyl(24.8, 0.97, -49.3, 0.14, 0.02,
      'color: #1a1a1a; emissive: #c04020; emissiveIntensity: 0.3'));
    g.appendChild(cyl(25.2, 0.97, -49.3, 0.14, 0.02,
      'color: #1a1a1a; emissive: #c04020; emissiveIntensity: 0.3'));
    // Knives on a small magnetic strip (symbolic — just a brass bar)
    g.appendChild(box(25, 1.25, -48.6, 0.6, 0.02, 0.02, MAT.brassDim));

    // Two rows of audience chairs facing the island
    // Row 1 (closer) — 3 chairs at z=-47.5
    [24, 25, 26].forEach((x) => {
      g.appendChild(armchair(x, -47.3, 180, MAT.linenCream));
    });
    // Row 2 (back) — 3 chairs at z=-46.5
    [24, 25, 26].forEach((x) => {
      g.appendChild(armchair(x, -46.3, 180, MAT.linenCream));
    });

    // Overhead broadcast rig — 3 cameras + a truss
    // Truss (horizontal cylinder)
    g.appendChild(cyl(25, 4.5, -48, 0.05, 4.5, MAT.matteBlack, '0 0 90'));
    // Cameras hanging at each end + center
    [23.3, 25, 26.7].forEach((x) => {
      g.appendChild(box(x, 4.2, -48, 0.25, 0.2, 0.35, MAT.matteBlack));
      g.appendChild(cyl(x, 4.2, -47.8, 0.06, 0.08, MAT.matteBlack));
      // Red "rec" tally
      g.appendChild(sphere(x, 4.22, -47.7, 0.015,
        'color: #ff0000; emissive: #ff0000; emissiveIntensity: 0.9'));
    });
    // Mounting cables up to ceiling (y=5)
    [23.3, 25, 26.7].forEach((x) => {
      g.appendChild(cyl(x, 4.75, -48, 0.008, 0.5, MAT.matteBlack));
    });

    // Wall-mounted monitor on the north wall for cooking-camera feed
    g.appendChild(box(25, 2.3, -50.95, 1.5, 0.9, 0.05, MAT.matteBlack));
    g.appendChild(plane(25, 2.3, -50.92, 1.4, 0.82, '0 0 0',
      'color: #0a1824; roughness: 0.6'));

    // Bright key light
    g.appendChild(pointLight(25, 4.7, -48.5, '#fff4d0', 1.0, 8));
    g.appendChild(pointLight(25, 3, -47, '#fff4d0', 0.5, 6));

    // "CULINARY THEATER" wordmark on north wall above the monitor
    g.appendChild(text(25, 3.6, -50.9, 'CULINARY THEATER', {
      width: 5, color: '#c9a84c',
    }));

    root.appendChild(g);
  }

  // ─── Orchestrator ───────────────────────────────────────────────────
  const CafeSativaInteriors = {
    init() {
      const scene = document.querySelector('a-scene');
      if (!scene) {
        console.warn('[CSInteriors] no a-scene found, bailing');
        return;
      }

      // Single container so we can debug / toggle / remove all
      // CS furniture in one DOM node.
      const root = el('a-entity', { id: 'cafe-sativa-interiors' });
      scene.appendChild(root);

      try {
        furnishFoyer(root);
        furnishGallery(root);
        furnishBar(root);
        furnishMainLounge(root);
        furnishColdStoned(root);
        furnishCourtyard(root);
        furnishCigarAirlock(root);
        furnishCigarLounge(root);
        furnishBoH(root);
        furnishCulinary(root);
        console.log('[CSInteriors] Furnished 10 rooms.');
      } catch (err) {
        console.error('[CSInteriors] Failed during furnish:', err);
      }
    },
  };

  window.CafeSativaInteriors = CafeSativaInteriors;

  // Wait for scene loaded AND for the shell to have a chance to build
  // (cafe-sativa-wing.js runs on scene loaded too; we add a small
  // delay so floors exist for any future texture-inheritance logic).
  function boot() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;
    const start = () => setTimeout(() => CafeSativaInteriors.init(), 200);
    if (scene.hasLoaded) start();
    else scene.addEventListener('loaded', start);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
