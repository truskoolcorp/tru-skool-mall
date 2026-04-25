/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Café Sativa Props Loader

   Manifest-driven loading of Meshy-generated furniture GLBs
   into the CS wing rooms. Replaces the placeholder primitive
   interiors with real prop instances.

   ARCHITECTURE
     - PROPS map: roomId → array of {src, instances[]}
     - Each instance: {pos, rot?, scale?}
     - HEAD-fetch each unique GLB once. If missing, skip.
     - Multi-instance: load the GLB once on a hidden template,
       clone the Three.js scene into each instance entity.
       Network: 1 download per unique GLB.
     - Graceful fallback: missing GLB → just skip silently.
       The room is still walkable (walls/floor/ceiling exist).

   FILE NAMING CONVENTION
     assets/models/props/<category>-<object>-<variant>.glb
     e.g.  bar-counter-walnut.glb
           bar-stool-leather.glb
           lounge-armchair-oxblood.glb
           pendant-cone-brass.glb

   TUNER
     ?prop-tune=ROOM_ID                — list all instances in room,
                                         click one to start tuning
     ?prop-tune=ROOM_ID/SLOT           — go straight to slot N
     Arrow keys = move (shift=Y), R = rotate, +/- = scale, X = export
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Manifest ─────────────────────────────────────────────────
  // Each room: { src GLB path, instances: array of placement specs }
  //
  // Instance spec: { pos, rot?, scale? }
  //   pos    — world-space "x y z"
  //   rot    — Euler degrees "x y z" (default "0 0 0")
  //   scale  — uniform "1 1 1" (default — Meshy outputs are usually
  //            ~1m scale; tune via ?prop-tune)
  //
  // Initially all entries point at GLBs that don't exist yet — Keith
  // will Meshy-generate them and drop into assets/models/props/.
  // The loader HEAD-fetches each GLB and skips silently if missing.
  // So this manifest can ship empty-on-disk and gradually fill in.
  const PROPS = {

    // ─── BAR (x=20..30, z=-37.5..-29.5, ceil 4.5) ──────────────
    'bar': [
      {
        // NOTE: Meshy generation came back as ONE combined piece —
        // bar counter + backbar shelf with bottles all in a single
        // GLB. Bounding box: 2m × 1.26m × 0.97m. We scale 3× on X
        // to fill the 10m-wide room nicely while keeping the native
        // height (which is correct for a bar at ~1.26m).
        src: 'assets/models/props/bar-counter-walnut.glb',
        instances: [
          { pos: '25 0.63 -34', rot: '0 0 0', scale: '3 1 1' },
        ],
      },
      {
        src: 'assets/models/props/bar-stool-leather.glb',
        instances: [
          // Four stools facing the long counter from the south.
          // Bar counter front face is at z ≈ -34 + 0.49 ≈ -33.5.
          // Stools sit ~0.7m in front of that.
          { pos: '21.5 0 -32.8', rot: '0 0 0' },
          { pos: '23.5 0 -32.8', rot: '0 0 0' },
          { pos: '26.5 0 -32.8', rot: '0 0 0' },
          { pos: '28.5 0 -32.8', rot: '0 0 0' },
        ],
      },
      {
        src: 'assets/models/props/pendant-cone-brass.glb',
        instances: [
          // Three pendants hanging above the counter in a row
          { pos: '22 4.0 -33', rot: '0 0 0' },
          { pos: '25 4.0 -33', rot: '0 0 0' },
          { pos: '28 4.0 -33', rot: '0 0 0' },
        ],
      },
    ],

    // ─── MAIN LOUNGE (x=17.5..32.5, z=-46..-37.5, ceil 4.5) ────
    'main-lounge': [
      {
        src: 'assets/models/props/lounge-stage-platform.glb',
        instances: [
          // Performance stage at the south end (z=-44.5), 4m wide
          { pos: '25 0 -44.5', rot: '0 0 0' },
        ],
      },
      {
        src: 'assets/models/props/lounge-host-table.glb',
        instances: [
          // Round table in the center of the lounge
          { pos: '25 0 -41', rot: '0 0 0' },
        ],
      },
      {
        src: 'assets/models/props/lounge-dining-chair.glb',
        instances: [
          // 4 chairs around the table, facing center
          { pos: '24 0 -40.2', rot: '0 -180 0' },
          { pos: '26 0 -40.2', rot: '0 -180 0' },
          { pos: '24 0 -41.8', rot: '0 0 0' },
          { pos: '26 0 -41.8', rot: '0 0 0' },
        ],
      },
      {
        src: 'assets/models/props/wall-sconce-brass.glb',
        instances: [
          // Sconces on east + west walls
          { pos: '17.55 2.5 -41', rot: '0 90 0' },
          { pos: '32.45 2.5 -41', rot: '0 -90 0' },
        ],
      },
    ],

    // ─── CIGAR LOUNGE (x=35.7..41.7, z=-46..-37.5, ceil 3) ─────
    'cigar': [
      {
        src: 'assets/models/props/lounge-armchair-oxblood.glb',
        instances: [
          // 4-chair cluster around a center table at (38.7, ?, -41)
          { pos: '37.7 0 -41', rot: '0 90 0' },   // west, facing east
          { pos: '39.7 0 -41', rot: '0 -90 0' },  // east, facing west
          { pos: '38.7 0 -40', rot: '0 -180 0' }, // north, facing south
          { pos: '38.7 0 -42', rot: '0 0 0' },    // south, facing north
        ],
      },
      {
        src: 'assets/models/props/lounge-side-table-walnut.glb',
        instances: [
          // Center round table for the chair cluster
          { pos: '38.7 0 -41', rot: '0 0 0' },
        ],
      },
      {
        src: 'assets/models/props/cigar-humidor.glb',
        instances: [
          // East wall feature
          { pos: '41.4 0 -39', rot: '0 -90 0' },
        ],
      },
    ],

    // ─── FOYER (x=23..27, z=-21.5..-17, ceil 6) ────────────────
    'foyer': [
      {
        src: 'assets/models/props/foyer-reception-desk.glb',
        instances: [
          // North side of the foyer, facing the entrance
          { pos: '25 0 -20.5', rot: '0 -180 0' },
        ],
      },
    ],

    // ─── GALLERY (x=22..28, z=-29.5..-21.5, ceil 6) ────────────
    'gallery': [
      {
        src: 'assets/models/props/gallery-plinth.glb',
        instances: [
          // Three plinths spaced through the gallery
          { pos: '24 0 -24', rot: '0 0 0' },
          { pos: '26 0 -26', rot: '0 0 0' },
          { pos: '24 0 -28', rot: '0 0 0' },
        ],
      },
    ],

    // ─── COLD STONED (x=28..32, z=-26..-21.5, ceil 6) ──────────
    'cold-stoned': [
      {
        src: 'assets/models/props/gelato-display-case.glb',
        instances: [
          { pos: '30 0 -25.3', rot: '0 0 0' },
        ],
      },
    ],

  };

  // ─── State ────────────────────────────────────────────────────
  // Tracks loaded templates so we don't HEAD-fetch the same GLB
  // multiple times and so instances can reuse the loaded scene.
  const TEMPLATE_CACHE = new Map();   // src → Promise<bool exists>
  const INSTANCES = [];               // for tuner: list of {roomId, slot, el}

  // ─── Loading ──────────────────────────────────────────────────

  function checkExists(src) {
    if (TEMPLATE_CACHE.has(src)) return TEMPLATE_CACHE.get(src);
    const p = fetch(src, { method: 'HEAD' })
      .then((r) => r.ok)
      .catch(() => false);
    TEMPLATE_CACHE.set(src, p);
    return p;
  }

  function placeInstance(roomId, propIdx, instanceIdx, src, spec, parent) {
    const el = document.createElement('a-entity');
    el.setAttribute('id', `prop-${roomId}-${propIdx}-${instanceIdx}`);
    el.setAttribute('data-prop-room', roomId);
    el.setAttribute('data-prop-slot', `${propIdx}/${instanceIdx}`);
    el.setAttribute('data-prop-src', src);
    el.setAttribute('gltf-model', src);
    el.setAttribute('position', spec.pos);
    if (spec.rot)   el.setAttribute('rotation', spec.rot);
    if (spec.scale) el.setAttribute('scale', spec.scale);
    el.setAttribute('shadow', 'cast: true; receive: true');
    parent.appendChild(el);
    INSTANCES.push({ roomId, slot: `${propIdx}/${instanceIdx}`, el, src });
    return el;
  }

  async function loadRoom(roomId, scene) {
    const props = PROPS[roomId];
    if (!props || props.length === 0) return 0;

    // Sub-entity grouping per room
    const root = document.createElement('a-entity');
    root.id = 'props-' + roomId;
    root.setAttribute('data-prop-room-root', roomId);
    scene.appendChild(root);

    let placed = 0;
    let skipped = 0;

    for (let propIdx = 0; propIdx < props.length; propIdx++) {
      const prop = props[propIdx];
      const exists = await checkExists(prop.src);
      if (!exists) {
        skipped++;
        continue;
      }
      for (let i = 0; i < prop.instances.length; i++) {
        placeInstance(roomId, propIdx, i, prop.src, prop.instances[i], root);
        placed++;
      }
    }

    return { placed, skipped, totalProps: props.length };
  }

  // ─── Init ─────────────────────────────────────────────────────
  async function init() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    const roomIds = Object.keys(PROPS);
    let totalPlaced = 0;
    let totalSkipped = 0;

    for (const roomId of roomIds) {
      const result = await loadRoom(roomId, scene);
      if (result) {
        totalPlaced += result.placed;
        totalSkipped += result.skipped;
        if (result.skipped > 0) {
          console.log(`[CSProps] ${roomId}: placed ${result.placed} instances, skipped ${result.skipped}/${result.totalProps} prop types (GLBs missing)`);
        } else if (result.placed > 0) {
          console.log(`[CSProps] ${roomId}: placed ${result.placed} instances from ${result.totalProps} prop types`);
        }
      }
    }

    console.log(`[CSProps] Total placed: ${totalPlaced} instances. Skipped: ${totalSkipped} prop types (Meshy GLBs not yet generated).`);

    // Tuner activation
    initTuner();
  }

  // ─── Tuner ────────────────────────────────────────────────────
  function initTuner() {
    const params = new URLSearchParams(window.location.search);
    const tune = params.get('prop-tune');
    if (!tune) return;

    let target = null;

    if (tune.includes('/')) {
      // Direct slot tune: ?prop-tune=bar/0
      const [roomId, slot] = tune.split('/');
      target = INSTANCES.find((i) => i.roomId === roomId && i.slot.startsWith(slot + '/'));
    } else {
      // Room tune: list instances, let user click one
      const roomInstances = INSTANCES.filter((i) => i.roomId === tune);
      if (roomInstances.length === 0) {
        console.warn('[CSProps tune] no instances found for room:', tune);
        return;
      }
      console.log('[CSProps tune] instances in', tune + ':');
      roomInstances.forEach((i, idx) => console.log(`  ${idx}: ${i.slot} (${i.src})`));
      console.log('[CSProps tune] use ?prop-tune=' + tune + '/N to tune a specific slot');
      return;
    }

    if (!target) {
      console.warn('[CSProps tune] target not found:', tune);
      return;
    }

    showTunerPanel(target);
  }

  function showTunerPanel(target) {
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed; top: 80px; left: 20px; z-index: 9999;
      background: rgba(10,10,15,0.92); color: #fff; padding: 14px;
      font: 12px/1.5 monospace; border: 1px solid #c9a84c;
      border-radius: 8px; min-width: 320px; pointer-events: auto;
    `;
    panel.innerHTML = `
      <div style="font-weight:bold;color:#c9a84c;margin-bottom:6px;">
        PROP TUNE: ${target.roomId}/${target.slot}
      </div>
      <div style="font-size:10px;color:#888;margin-bottom:8px;">
        ${target.src}
      </div>
      <div id="prop-tune-readout">waiting for model...</div>
      <div style="margin-top:8px;color:#aaa;font-size:11px;">
        Arrows: move (Shift=Y) · R/Shift+R: rotate · +/−: scale · X: export
      </div>
    `;
    document.body.appendChild(panel);
    const readout = panel.querySelector('#prop-tune-readout');

    const update = () => {
      const p = target.el.getAttribute('position');
      const r = target.el.getAttribute('rotation');
      const s = target.el.getAttribute('scale');
      readout.innerHTML = `
        pos:   ${p.x.toFixed(2)} ${p.y.toFixed(2)} ${p.z.toFixed(2)}<br>
        rot:   ${r.x.toFixed(1)} ${r.y.toFixed(1)} ${r.z.toFixed(1)}<br>
        scale: ${s.x.toFixed(2)} ${s.y.toFixed(2)} ${s.z.toFixed(2)}
      `;
    };
    setTimeout(update, 500);

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const stepP = e.shiftKey && e.key.startsWith('Arrow') ? 0.1 : 0.25;
      const stepR = 15;
      const stepS = 0.1;

      const p = target.el.getAttribute('position');
      const r = target.el.getAttribute('rotation');
      const s = target.el.getAttribute('scale');
      let handled = true;

      switch (e.key) {
        case 'ArrowUp':    if (e.shiftKey) p.y += stepP; else p.z -= stepP; break;
        case 'ArrowDown':  if (e.shiftKey) p.y -= stepP; else p.z += stepP; break;
        case 'ArrowLeft':  p.x -= stepP; break;
        case 'ArrowRight': p.x += stepP; break;
        case 'r':          r.y += stepR; break;
        case 'R':          r.y -= stepR; break;
        case '+': case '=': { const ns = s.x + stepS; s.x = s.y = s.z = ns; break; }
        case '-': case '_': { const ns = Math.max(0.05, s.x - stepS); s.x = s.y = s.z = ns; break; }
        case 'x': case 'X':
          console.log(`[PropTune EXPORT] ${target.roomId}/${target.slot}:`);
          console.log(`  { pos: '${p.x.toFixed(2)} ${p.y.toFixed(2)} ${p.z.toFixed(2)}', rot: '${r.x.toFixed(1)} ${r.y.toFixed(1)} ${r.z.toFixed(1)}', scale: '${s.x.toFixed(2)} ${s.y.toFixed(2)} ${s.z.toFixed(2)}' },`);
          break;
        default: handled = false;
      }
      if (handled) {
        e.preventDefault();
        target.el.setAttribute('position', p);
        target.el.setAttribute('rotation', r);
        target.el.setAttribute('scale', s);
        update();
      }
    });
  }

  // ─── Boot ─────────────────────────────────────────────────────
  function boot() {
    const scene = document.querySelector('a-scene');
    if (!scene) {
      document.addEventListener('DOMContentLoaded', boot, { once: true });
      return;
    }
    const go = () => setTimeout(init, 800);  // delay so wing builds first
    if (scene.hasLoaded) go();
    else scene.addEventListener('loaded', go);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.CSProps = { PROPS, INSTANCES };
})();
