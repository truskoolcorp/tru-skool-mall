/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Café Sativa Interiors (FOYER ONLY)

   We've pivoted: Café Sativa is no longer a fully-walkable venue
   with corridor-connected rooms. Instead, the foyer is the only
   walked space. Patrons enter, meet Laviche the concierge, use a
   directory to pick which room they want to explore, and teleport
   into that room's dedicated standalone scene.

   This file builds ONLY the foyer interior:
     - Welcome rug
     - Concierge desk (placeholder primitive until the Meshy
       foyer-reception-desk.glb lands via cafe-sativa-props.js)
     - Laviche NPC placeholder (cylinder until concierge-laviche.glb)
     - Two ambient pendant glows

   Per-room rooms (Bar, Lounge, etc.) live in their own future
   scene files — none of those exist in this wing anymore.

   Footprint: foyer is x=22..28, z=-24..-17 (6m × 7m, ceil 6m)
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Material palette ───────────────────────────────────────────────
  const MAT = {
    walnutDark: 'src: #tex-wood-dark;  repeat: 2 1; color: #5a3828; roughness: 0.6',
    brass:      'color: #c9a84c; metalness: 0.9; roughness: 0.2',
    marbleWarm: 'src: #tex-marble; repeat: 2 1; color: #f4ecd8; roughness: 0.3; metalness: 0.05',
    leather:    'src: #tex-leather; repeat: 2 2; color: #5a2528; roughness: 0.65',
    amberGlow:  'color: #c9a84c; emissive: #c9a84c; emissiveIntensity: 0.9',
    warmGlow:   'color: #ffcf80; emissive: #ffcf80; emissiveIntensity: 0.8',
    rug:        'src: #tex-carpet; repeat: 3 2; color: #8a4a38; roughness: 0.95',
    skin:       'color: #d4a577; roughness: 0.7',
    velvetGreen: 'color: #2a4a38; roughness: 0.9',
  };

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

  function sphere(x, y, z, radius, material) {
    const e = document.createElement('a-sphere');
    e.setAttribute('position', `${x} ${y} ${z}`);
    e.setAttribute('radius', radius);
    e.setAttribute('material', material);
    return e;
  }

  function rug(cx, cz, w, d, material) {
    return box(cx, 0.02, cz, w, 0.04, d, material);
  }

  // ─── Foyer ──────────────────────────────────────────────────────────
  function buildFoyer(root) {
    const g = [];

    // Welcome rug
    g.push(rug(25, -20.5, 3.0, 4.0, MAT.rug));

    // Concierge desk against north wall
    g.push(box(25, 0.55, -22.5, 2.4, 1.1, 0.8, MAT.walnutDark));
    g.push(box(25, 1.13, -22.5, 2.5, 0.04, 0.85, MAT.marbleWarm));
    g.push(box(25, 0.35, -22.1, 2.4, 0.04, 0.02, MAT.brass));

    // Brass desk lamp
    g.push(cyl(25.9, 1.15, -22.5, 0.04, 0.4, MAT.brass));
    g.push(sphere(25.9, 1.45, -22.5, 0.12, MAT.warmGlow));

    // Laviche NPC placeholder
    g.push(cyl(25, 0.45, -23.2, 0.18, 0.9, MAT.velvetGreen));
    g.push(cyl(25, 1.15, -23.2, 0.20, 0.5, MAT.velvetGreen));
    g.push(sphere(25, 1.55, -23.2, 0.14, MAT.skin));

    // Ceiling pendants
    g.push(cyl(23.5, 4.6, -20, 0.15, 0.18, MAT.amberGlow));
    g.push(cyl(26.5, 4.6, -20, 0.15, 0.18, MAT.amberGlow));

    g.forEach((el) => root.appendChild(el));
    return g.length;
  }

  const CafeSativaInteriors = {
    init() {
      const scene = document.querySelector('a-scene');
      if (!scene) {
        console.warn('[CSInteriors] no <a-scene>, bailing');
        return;
      }
      const root = document.createElement('a-entity');
      root.id = 'cafe-sativa-interiors';
      scene.appendChild(root);

      const sub = document.createElement('a-entity');
      sub.setAttribute('data-cs-room', 'foyer');
      sub.id = 'cs-room-foyer';
      root.appendChild(sub);

      const count = buildFoyer(sub);
      console.log('[CSInteriors] Furnished foyer.', `pieces:${count}`);
    },
  };

  window.CafeSativaInteriors = CafeSativaInteriors;

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
