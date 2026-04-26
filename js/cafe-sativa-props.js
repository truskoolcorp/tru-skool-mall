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
        // GLB has a baked 0.01 scale matrix on its root node (a plain
        // mesh node, NOT a skinned hierarchy), so GLTFLoader preserves
        // the matrix at runtime. Native vertex bbox is ~150x48x59
        // units; with baked 0.01 it renders at 1.5m × 0.48m × 0.59m,
        // and at manifest scale 1.50 the final size is 2.25m × 0.72m
        // × 0.89m — concierge-counter proportions, hip-height to
        // Laviche.
        //
        // Tuned 2026-04-25 with the interactive prop tuner against
        // Laviche to find the right relative scale. Earlier scale 2
        // (3m × 0.96m × 1.18m) made the desk read taller than her
        // shoulders because the cylinder form has no transaction-
        // counter top to break up the silhouette.
        //
        // Stripped from the GLB on import: 'Rectangle' backdrop mesh,
        // Directional Light, Default Ambient Light, orphan camera
        // node — Meshy render-scene artifacts.
        src: 'assets/models/props/foyer-reception-desk.glb',
        instances: [
          { pos: '24.70 0.05 -22.00', rot: '0 0 0', scale: '1.50 1.50 1.50' },
        ],
      },
      {
        // Laviche the concierge.
        //
        // GLB has an Armature (node 25) at the scene root with scale
        // [0.01,0.01,0.01]. Position-accessor bbox is Y:[0, 1.70] —
        // those vertex values are already in meters (Mixamo exports
        // rigged humans at human scale in vertex buffer; the 0.01
        // Armature scale is a Blender unit-system artifact).
        //
        // When three.js GLTFLoader imports a skinned mesh it flattens
        // the Armature transform into the bind pose, so the rendered
        // mesh ends up at native vertex-buffer size (~0.84m × 1.70m
        // × 0.31m) regardless of the Armature's 0.01.
        //
        // Manifest scale 1.0 → renders at native ~1.70m human height.
        //
        // (Earlier we mistakenly compensated with scale 100, making
        // her 170m tall — bigger than the entire mall. Lesson learned:
        // skinned meshes ≠ plain meshes for transform flattening.)
        //
        // Tuned 2026-04-25 next to the desk so she stands at its back
        // edge, slightly camera-side of center, facing south.
        src: 'assets/models/props/concierge-laviche.glb',
        instances: [
          { pos: '24.40 0.05 -22.80', rot: '0 0 0', scale: '1.00 1.00 1.00' },
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
  // Two activation modes:
  //   ?prop-tune=foyer        → tune ALL props in foyer together
  //                            (best for relative-size dialing)
  //   ?prop-tune=foyer/0      → tune one specific instance
  function initTuner() {
    const params = new URLSearchParams(window.location.search);
    const tune = params.get('prop-tune');
    if (!tune) return;

    let targets = [];

    // The tuner runs in two contexts:
    //  1. Main mall scene (index.html) — INSTANCES has foyer props
    //  2. Per-room scene (cs-bar.html etc) — props are tracked in
    //     window.__CS_INSTANCES by cs-room-boot.js
    // Merge both so ?prop-tune=<roomId> works in either context.
    const allInstances = INSTANCES.concat(window.__CS_INSTANCES || []);

    if (tune.includes('/')) {
      // Single slot
      const [roomId, slot] = tune.split('/');
      const t = allInstances.find((i) => i.roomId === roomId && i.slot.startsWith(slot + '/'));
      if (t) targets = [t];
    } else {
      // Whole room — multi-prop tuner
      targets = allInstances.filter((i) => i.roomId === tune);
    }

    if (targets.length === 0) {
      console.warn('[CSProps tune] no instances found for:', tune);
      return;
    }

    showTunerPanel(targets);
  }

  // Get effective rendered bbox in meters (post-scale, world space).
  function measure(el) {
    if (!window.THREE) return null;
    const obj = el.getObject3D('mesh');
    if (!obj) return null;
    const box = new window.THREE.Box3().setFromObject(obj);
    const size = box.getSize(new window.THREE.Vector3());
    return { w: size.x, h: size.y, d: size.z };
  }

  function fileLabel(src) {
    return src.split('/').pop().replace('.glb', '');
  }

  function showTunerPanel(targets) {
    const panel = document.createElement('div');
    panel.id = 'prop-tuner-panel';
    panel.style.cssText = `
      position: fixed; top: 70px; left: 20px; z-index: 99999;
      background: rgba(10,10,15,0.95); color: #fff;
      padding: 14px; font: 12px/1.4 system-ui, monospace;
      border: 1px solid #c9a84c; border-radius: 10px;
      width: 360px; max-height: 90vh; overflow-y: auto;
      pointer-events: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'font-weight:700;color:#c9a84c;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = `
      <span>🎛️ PROP TUNER (${targets.length} ${targets.length === 1 ? 'prop' : 'props'})</span>
      <button id="tuner-copy-all" style="background:#c9a84c;color:#000;border:0;padding:5px 10px;border-radius:4px;cursor:pointer;font-weight:600;font-size:11px;">📋 Copy All</button>
    `;
    panel.appendChild(header);

    // Toast
    const toast = document.createElement('div');
    toast.style.cssText = 'background:rgba(60,200,90,0.2);border:1px solid #3cc85a;color:#7fe89c;padding:6px 10px;border-radius:4px;margin-bottom:10px;font-size:11px;display:none;';
    toast.id = 'tuner-toast';
    panel.appendChild(toast);

    // Build per-prop section
    targets.forEach((target, idx) => {
      const sec = document.createElement('div');
      sec.style.cssText = `
        background: rgba(255,255,255,0.04); border: 1px solid rgba(201,168,76,0.25);
        border-radius: 6px; padding: 10px; margin-bottom: 10px;
      `;

      const label = fileLabel(target.src);
      sec.innerHTML = `
        <div style="font-weight:600;color:#e8d8a8;margin-bottom:6px;font-size:12px;">
          ${label}
          <span style="color:#888;font-weight:400;font-size:10px;">  (${target.roomId}/${target.slot})</span>
        </div>
        <div id="dim-${idx}" style="font-size:11px;color:#9fb;margin-bottom:8px;font-family:monospace;">measuring…</div>

        <div style="margin-bottom:6px;">
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#aaa;">
            <span>SCALE</span><span id="s-val-${idx}">—</span>
          </div>
          <input type="range" id="s-${idx}" min="0.1" max="10" step="0.05" style="width:100%;accent-color:#c9a84c;">
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px;font-size:10px;">
          <div>
            <div style="color:#aaa;display:flex;justify-content:space-between;"><span>X</span><span id="px-val-${idx}">—</span></div>
            <input type="range" id="px-${idx}" min="-50" max="50" step="0.1" style="width:100%;accent-color:#888;">
          </div>
          <div>
            <div style="color:#aaa;display:flex;justify-content:space-between;"><span>Y</span><span id="py-val-${idx}">—</span></div>
            <input type="range" id="py-${idx}" min="-5" max="10" step="0.05" style="width:100%;accent-color:#888;">
          </div>
          <div>
            <div style="color:#aaa;display:flex;justify-content:space-between;"><span>Z</span><span id="pz-val-${idx}">—</span></div>
            <input type="range" id="pz-${idx}" min="-50" max="50" step="0.1" style="width:100%;accent-color:#888;">
          </div>
        </div>

        <div style="margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#aaa;">
            <span>ROT Y</span><span id="ry-val-${idx}">—</span>
          </div>
          <input type="range" id="ry-${idx}" min="-180" max="180" step="5" style="width:100%;accent-color:#888;">
        </div>

        <button id="copy-${idx}" style="width:100%;background:rgba(201,168,76,0.2);color:#c9a84c;border:1px solid #c9a84c;padding:6px;border-radius:4px;cursor:pointer;font-size:11px;">
          📋 Copy this prop's settings
        </button>
      `;
      panel.appendChild(sec);
    });

    // Footer hint
    const hint = document.createElement('div');
    hint.style.cssText = 'color:#888;font-size:10px;line-height:1.4;border-top:1px solid #333;padding-top:8px;margin-top:4px;';
    hint.innerHTML = `
      <strong style="color:#c9a84c;">Hotkeys</strong> (when panel is unfocused):<br>
      ↑↓ = Z move · ←→ = X · Shift+↑↓ = Y · R / Shift+R = rotate · +/− = scale<br>
      Drag sliders for fine control. Click Copy when settings look right.
    `;
    panel.appendChild(hint);

    document.body.appendChild(panel);

    // Wire each target to its sliders
    const wires = targets.map((target, idx) => {
      const sx = panel.querySelector(`#s-${idx}`);
      const px = panel.querySelector(`#px-${idx}`);
      const py = panel.querySelector(`#py-${idx}`);
      const pz = panel.querySelector(`#pz-${idx}`);
      const ry = panel.querySelector(`#ry-${idx}`);

      const sValEl  = panel.querySelector(`#s-val-${idx}`);
      const pxValEl = panel.querySelector(`#px-val-${idx}`);
      const pyValEl = panel.querySelector(`#py-val-${idx}`);
      const pzValEl = panel.querySelector(`#pz-val-${idx}`);
      const ryValEl = panel.querySelector(`#ry-val-${idx}`);
      const dimEl   = panel.querySelector(`#dim-${idx}`);

      const sync = () => {
        const p = target.el.getAttribute('position');
        const r = target.el.getAttribute('rotation');
        const s = target.el.getAttribute('scale');
        sx.value = s.x; px.value = p.x; py.value = p.y; pz.value = p.z; ry.value = r.y;
        sValEl.textContent  = (+sx.value).toFixed(2);
        pxValEl.textContent = (+px.value).toFixed(2);
        pyValEl.textContent = (+py.value).toFixed(2);
        pzValEl.textContent = (+pz.value).toFixed(2);
        ryValEl.textContent = (+ry.value).toFixed(0) + '°';

        const dim = measure(target.el);
        if (dim) {
          dimEl.innerHTML = `<span style="color:#9fb;">📏 actual:</span> W=${dim.w.toFixed(2)}m  H=${dim.h.toFixed(2)}m  D=${dim.d.toFixed(2)}m`;
        }
      };

      const apply = () => {
        target.el.setAttribute('scale', `${sx.value} ${sx.value} ${sx.value}`);
        target.el.setAttribute('position', `${px.value} ${py.value} ${pz.value}`);
        target.el.setAttribute('rotation', `0 ${ry.value} 0`);
        // Re-measure on next tick (after Three.js commits the transform)
        requestAnimationFrame(sync);
      };

      [sx, px, py, pz, ry].forEach((el) => el.addEventListener('input', apply));

      // Initial sync (wait for model-loaded)
      const trySync = () => {
        const dim = measure(target.el);
        if (dim) sync();
        else setTimeout(trySync, 200);
      };
      trySync();

      // Per-prop copy
      panel.querySelector(`#copy-${idx}`).addEventListener('click', () => {
        const out = formatExport(target);
        copyToClipboard(out);
        flashToast(`✓ Copied ${fileLabel(target.src)} settings`);
      });

      return { target, sync };
    });

    // Copy ALL
    panel.querySelector('#tuner-copy-all').addEventListener('click', () => {
      const lines = targets.map((t) => '// ' + fileLabel(t.src) + '\n' + formatExport(t)).join('\n\n');
      copyToClipboard(lines);
      flashToast(`✓ Copied ${targets.length} props`);
    });

    function flashToast(msg) {
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 1800);
    }

    // Keyboard nudge — operates on the FIRST target only
    // (sliders handle multi-prop precisely; keys are for quick single-prop)
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (!targets[0]) return;

      const tgt = targets[0];
      const stepP = e.shiftKey && e.key.startsWith('Arrow') ? 0.1 : 0.25;
      const stepR = 15;
      const stepS = 0.1;

      const p = tgt.el.getAttribute('position');
      const r = tgt.el.getAttribute('rotation');
      const s = tgt.el.getAttribute('scale');
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
        default: handled = false;
      }
      if (handled) {
        e.preventDefault();
        tgt.el.setAttribute('position', p);
        tgt.el.setAttribute('rotation', r);
        tgt.el.setAttribute('scale', s);
        wires[0].sync();
      }
    });
  }

  function formatExport(target) {
    const p = target.el.getAttribute('position');
    const r = target.el.getAttribute('rotation');
    const s = target.el.getAttribute('scale');
    return `        { pos: '${p.x.toFixed(2)} ${p.y.toFixed(2)} ${p.z.toFixed(2)}', rot: '${r.x.toFixed(1)} ${r.y.toFixed(1)} ${r.z.toFixed(1)}', scale: '${s.x.toFixed(2)} ${s.y.toFixed(2)} ${s.z.toFixed(2)}' },`;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
    console.log('[PropTune] Copied to clipboard:\n' + text);
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (_) { /* ignore */ }
    document.body.removeChild(ta);
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
