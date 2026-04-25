/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Café Sativa Hero Object Loader

   Replaces the primitive-box-and-cylinder interiors in rooms
   where we have a proper GLB hero object. Falls back silently
   to the primitive interior if the GLB is missing.

   The HERO map is the source of truth:
   - Each key is a room ID (matches cafe-sativa-wing.js ROOMS[].id)
   - Value: { src, pos, rot, scale }
     src: URL to the GLB
     pos: world-space position
     rot: world-space rotation (Euler degrees)
     scale: uniform scale factor ("1 1 1" or similar)

   When a hero loads, window.HERO_LOADED[roomId] = true. The
   interior builder in cafe-sativa-interiors.js checks this
   flag and returns early if a hero has claimed the room.

   Tuning:
   Launch with `?hero-tune=ROOM_ID` to enter tune mode. An
   overlay shows the current pos/rot/scale and arrow keys
   (with modifiers) nudge them. Press X to export the values
   to console. Paste into the HERO map and redeploy.

   LOADING ORDER:
   1. This module runs on scene-loaded
   2. For each HERO entry, HEAD-fetch the GLB
   3. If exists, append entity + mark HERO_LOADED[roomId]
   4. cafe-sativa-interiors.js ALSO runs on scene-loaded, slightly
      later; it checks HERO_LOADED[roomId] and skips primitive
      placement for claimed rooms
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Hero object map. Existing GLBs previously downloaded into the
  // repo. Positions are world-space centers of each room, height
  // adjusted so models sit on the floor (pos.y = 0).
  //
  // Rotations and scales below are INITIAL GUESSES. Each needs a
  // tuning pass (?hero-tune=room-id) to dial in.
  //
  // If a room's GLB turns out to be a full room-with-walls that
  // clips through our procedural walls, we can either:
  //   a) tune position to nest inside, accepting some wall z-fight
  //   b) shrink scale so only the interior furnishings are visible
  //   c) remove it and use a Meshy-generated prop-only GLB instead
  const HERO = {
    'cold-stoned': {
      src:   'assets/models/rooms/cold-stoned.glb',
      pos:   '30 0 -23.75',      // room center (xMin 28..xMax 32, zMin -26..zMax -21.5)
      rot:   '0 0 0',
      scale: '1 1 1',
      note:  'Ice cream parlor (5 meshes, Sketchfab CC-BY BrimanFunkman)',
      // When this loads, also suppress the primitive gelato case
      suppressPrimitives: true,
    },

    'cigar': {
      src:   'assets/models/rooms/smoking-lounge.glb',
      pos:   '38.7 0 -41.75',    // room center (xMin 35.7..xMax 41.7, zMin -46..zMax -37.5)
      rot:   '0 0 0',
      scale: '1 1 1',
      note:  'Cigar smoking lounge (2 meshes, Sketchfab CC-BY Home Design 3D)',
      suppressPrimitives: true,
    },

    'main-lounge': {
      src:   'assets/models/rooms/jazz-club.glb',
      pos:   '25 0 -41.75',      // room center (xMin 17.5..xMax 32.5, zMin -46..zMax -37.5)
      rot:   '0 0 0',
      scale: '1 1 1',
      note:  'Jazz club voxel (1 mesh, Sketchfab CC-BY empty_mirror)',
      suppressPrimitives: false, // keep our stage on top, jazz club fills ambient space
    },
  };

  // Studio props — placed in Verse Alkemist room (which is outside the
  // CS wing, but keeping them here for reference). Disabled until we
  // confirm VA room coords.
  const STUDIO_PROPS = {
    // 'verse-alkemist-turntable': { src: 'assets/models/studio/turntable.glb', pos: '...' }
  };

  window.HERO_LOADED = window.HERO_LOADED || {};

  function loadHero(roomId, entry) {
    return fetch(entry.src, { method: 'HEAD' }).then((r) => {
      if (!r.ok) {
        console.log('[HeroObjects] skip', roomId, '— GLB not found at', entry.src);
        return false;
      }
      const scene = document.querySelector('a-scene');
      if (!scene) return false;

      const el = document.createElement('a-entity');
      el.setAttribute('id', 'hero-' + roomId);
      el.setAttribute('data-hero-room', roomId);
      el.setAttribute('gltf-model', entry.src);
      el.setAttribute('position', entry.pos);
      el.setAttribute('rotation', entry.rot);
      el.setAttribute('scale', entry.scale);
      el.setAttribute('shadow', 'cast: true; receive: true');
      scene.appendChild(el);

      // Track load completion
      el.addEventListener('model-loaded', () => {
        window.HERO_LOADED[roomId] = {
          suppressPrimitives: entry.suppressPrimitives,
          note: entry.note,
        };
        console.log('[HeroObjects] loaded', roomId, '—', entry.note);
        // If the room was already built with primitives, remove them now
        if (entry.suppressPrimitives) {
          removePrimitivesForRoom(roomId);
        }
      });
      el.addEventListener('model-error', (e) => {
        console.warn('[HeroObjects] model-error', roomId, e.detail);
      });

      return true;
    }).catch((e) => {
      console.log('[HeroObjects] fetch failed for', roomId, e.message);
      return false;
    });
  }

  // Remove the primitive interior entities for a room, if they were
  // already built. We tag each primitive in cafe-sativa-interiors.js
  // with data-cs-room="<room-id>" for this.
  function removePrimitivesForRoom(roomId) {
    const selector = '[data-cs-room="' + roomId + '"]';
    const nodes = document.querySelectorAll(selector);
    nodes.forEach((n) => n.remove());
    console.log('[HeroObjects] removed', nodes.length, 'primitives for', roomId);
  }

  function init() {
    const scene = document.querySelector('a-scene');
    if (!scene) {
      document.addEventListener('DOMContentLoaded', init, { once: true });
      return;
    }
    const run = () => {
      Object.keys(HERO).forEach((roomId) => {
        loadHero(roomId, HERO[roomId]);
      });
    };
    if (scene.hasLoaded) run();
    else scene.addEventListener('loaded', run);
  }

  // ─── Tuner mode ────────────────────────────────────────────────
  // URL param: ?hero-tune=ROOM_ID activates a floating overlay that
  // lets you move/rotate/scale the hero GLB for that room and
  // export the values to console.
  function initTuner() {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('hero-tune');
    if (!roomId) return;

    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed; top: 80px; left: 20px; z-index: 9999;
      background: rgba(10,10,15,0.9); color: #fff; padding: 14px;
      font: 12px/1.5 monospace; border: 1px solid #c9a84c;
      border-radius: 8px; min-width: 280px; pointer-events: auto;
    `;
    panel.innerHTML = `
      <div style="font-weight:bold;color:#c9a84c;margin-bottom:6px;">
        HERO TUNE: ${roomId}
      </div>
      <div id="hero-tune-readout">waiting for model...</div>
      <div style="margin-top:8px;color:#aaa;font-size:11px;">
        Arrow keys: move (shift=Y), R/Shift+R: rotate, +/−: scale<br>
        X: export to console
      </div>
    `;
    document.body.appendChild(panel);

    const readout = panel.querySelector('#hero-tune-readout');
    let hero = null;

    const tryBind = () => {
      hero = document.getElementById('hero-' + roomId);
      if (!hero) { setTimeout(tryBind, 500); return; }
      updateReadout();
    };
    tryBind();

    function updateReadout() {
      if (!hero) return;
      const p = hero.getAttribute('position');
      const r = hero.getAttribute('rotation');
      const s = hero.getAttribute('scale');
      readout.innerHTML = `
        pos:   ${p.x.toFixed(2)} ${p.y.toFixed(2)} ${p.z.toFixed(2)}<br>
        rot:   ${r.x.toFixed(1)} ${r.y.toFixed(1)} ${r.z.toFixed(1)}<br>
        scale: ${s.x.toFixed(2)} ${s.y.toFixed(2)} ${s.z.toFixed(2)}
      `;
    }

    document.addEventListener('keydown', (e) => {
      if (!hero) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const STEP_P = e.shiftKey ? 0.1 : 0.25;
      const STEP_R = 15;
      const STEP_S = 0.1;

      const p = hero.getAttribute('position');
      const r = hero.getAttribute('rotation');
      const s = hero.getAttribute('scale');
      let handled = true;

      switch (e.key) {
        case 'ArrowUp':    if (e.shiftKey) p.y += STEP_P; else p.z -= STEP_P; break;
        case 'ArrowDown':  if (e.shiftKey) p.y -= STEP_P; else p.z += STEP_P; break;
        case 'ArrowLeft':  p.x -= STEP_P; break;
        case 'ArrowRight': p.x += STEP_P; break;
        case 'r':          r.y += STEP_R; break;
        case 'R':          r.y -= STEP_R; break;
        case '+': case '=': { const ns = s.x + STEP_S; s.x = s.y = s.z = ns; break; }
        case '-': case '_': { const ns = Math.max(0.1, s.x - STEP_S); s.x = s.y = s.z = ns; break; }
        case 'x': case 'X':
          console.log('[HeroTune] EXPORT for', roomId, ':');
          console.log(`  pos:   '${p.x.toFixed(2)} ${p.y.toFixed(2)} ${p.z.toFixed(2)}',`);
          console.log(`  rot:   '${r.x.toFixed(1)} ${r.y.toFixed(1)} ${r.z.toFixed(1)}',`);
          console.log(`  scale: '${s.x.toFixed(2)} ${s.y.toFixed(2)} ${s.z.toFixed(2)}',`);
          break;
        default: handled = false;
      }
      if (handled) {
        e.preventDefault();
        hero.setAttribute('position', p);
        hero.setAttribute('rotation', r);
        hero.setAttribute('scale', s);
        updateReadout();
      }
    });
  }

  init();
  initTuner();

  window.CSHeroObjects = { HERO, STUDIO_PROPS };
})();
