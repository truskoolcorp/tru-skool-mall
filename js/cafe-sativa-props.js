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

    // ─── FOYER (x=22..28, z=-24..-17, ceil 6) ──────────────────
    'foyer': [
      {
        // Reception desk — Concierge_Desk.glb from Meshy.
        //
        // CRITICAL: GLB has a baked-in scale matrix on its root
        // node (0.01 on all axes), so the 'native' bbox of
        // [-75..75, -24..24, -59..0] actually renders as
        // [-0.75..0.75, -0.24..0.24, -0.59..0] — a 1.5m × 0.5m
        // × 0.6m model. To get a 3m × 1m × 1.18m desk, manifest
        // scale needs to be 2 (NOT 0.02).
        //
        // (My first attempt scaled 0.02, which combined with the
        // baked 0.01 → 0.0002 effective scale → desk was a
        // 0.03m speck, invisible to the eye. Took two GLB
        // inspection rounds to spot the baked matrix.)
        //
        // Also stripped: 'Rectangle' backdrop mesh, Directional
        // Light, Default Ambient Light, orphan camera node — all
        // were Meshy render-scene artifacts that came along for
        // the ride in the export.
        //
        // Y bbox post-final-scale: [-0.48, 0.48] → origin at
        // y=0.48 puts base on floor.
        // Z bbox post-final-scale: [-1.18, 0] → origin at z=-22
        // puts back of desk at z=-23.18.
        src: 'assets/models/props/foyer-reception-desk.glb',
        instances: [
          { pos: '25 0.48 -22', rot: '0 0 0', scale: '2 2 2' },
        ],
      },
      {
        // Laviche the concierge.
        //
        // SAME baked-transform issue as the desk. Her GLB has an
        // SCALE NOTE — corrected after the "Laviche bigger than the
        // mall" incident:
        //
        // GLB structure: Armature (node 25) has scale [0.01,0.01,0.01]
        // applied to its children (char1 mesh + Hips skeleton). The
        // position-accessor bbox is Y:[0, 1.70] — and those vertex
        // values are ALREADY in meters (Mixamo exports rigged humans
        // at human scale in vertex buffer; the 0.01 Armature scale is
        // a Blender unit-system artifact).
        //
        // When three.js GLTFLoader imports a skinned mesh, it flattens
        // the Armature transform into the bind pose, so the rendered
        // mesh ends up at native vertex-buffer size (1.70m) regardless
        // of the Armature's 0.01.
        //
        // Last session we assumed the 0.01 was applying at runtime and
        // compensated with manifest scale 100. Result: 1.70m × 100 =
        // 170m tall — bigger than the entire mall.
        //
        // Correct manifest scale is 1.0 → renders at native 1.70m.
        //
        // Position z=-23.6: 0.4m behind the back face of the desk.
        src: 'assets/models/props/concierge-laviche.glb',
        instances: [
          { pos: '25 0 -23.6', rot: '0 0 0', scale: '1 1 1' },
        ],
      },
    ],

    // ── DEPRECATED: bar / main-lounge / cigar / gallery / cold-stoned ──
    // All removed. The Meshy GLBs we generate for those rooms will be
    // placed in per-room standalone scenes (cs-bar.html, etc.) — not
    // in this main mall scene.
    //
    // The bar-counter-walnut.glb already generated is preserved in
    // assets/models/_archive/ for the future cs-bar.html build.

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

    // ── One-time effective-bbox probe ──
    // Logs actual rendered world-space size after GLTFLoader finishes.
    // Solves the recurring "what scale does this Meshy GLB need?"
    // problem by reporting truth instead of us guessing from the
    // accessor min/max.
    el.addEventListener('model-loaded', function onLoaded() {
      el.removeEventListener('model-loaded', onLoaded);
      try {
        const obj = el.getObject3D('mesh');
        if (!obj || !window.THREE) return;
        const box = new window.THREE.Box3().setFromObject(obj);
        const size = box.getSize(new window.THREE.Vector3());
        const fileName = src.split('/').pop();
        console.log(
          `[CSProps:bbox] ${fileName} @ scale=${spec.scale || '1 1 1'} → ` +
          `W=${size.x.toFixed(2)}m  H=${size.y.toFixed(2)}m  D=${size.z.toFixed(2)}m`
        );
      } catch (e) { /* ignore */ }
    });

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
