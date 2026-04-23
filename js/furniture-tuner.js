/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Furniture Tuner

   A surgical editor for placing/rotating/scaling individual
   furniture primitives inside the Café Sativa wing (or any
   other interior scene we build later).

   Unlike js/mall-tuner.js (which edits whole GLB rooms stored
   in Supabase), this tool operates on in-memory A-Frame
   entities — primitives like <a-box>, <a-cylinder>, <a-plane>
   — and exports their final transforms as a JSON blob that
   we paste into the interior source file.

   Activation
   ──────────
   The tuner is INERT unless the URL contains ?tuner=1.
   Regular mall visitors never see it and pay zero load cost
   (the module early-exits on boot).

   Add a "starter set" of tunable primitives via ?starter=cs
   which bootstraps a small palette of chairs/tables/etc.
   pinned at the Foyer center — grab them, move them around,
   stack up a room, export.

   Controls
   ────────
   - Click any tunable entity → it becomes selected (outlined)
   - Keyboard while selected:
       WASD  — nudge X/Z by 0.1m
       Q/E   — nudge Y by 0.1m (shift = 0.5m)
       R/F   — rotate ±15° on Y axis
       +/-   — uniform scale ±10%
       X     — delete selected entity
       C     — clone selected entity (offset +0.5m x)
   - Panel in top-right:
       position/rotation/scale inputs (type or step)
       New-entity buttons (spawn a box/cyl/plane at camera)
       Export JSON button (downloads a patch file)
       Clear button (wipes tuner-added entities)

   Persistence
   ───────────
   Every edit is mirrored to localStorage under 'tuner:state'.
   On page reload (with ?tuner=1), the state restores, so a
   crashed browser doesn't lose work. The export button also
   downloads the current state.

   Dependencies
   ────────────
   Only A-Frame (already loaded). No new CDN deps, no extra
   libraries. Pure DOM + THREE.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Bail unless explicitly enabled — zero cost to regular visitors
  const params = new URLSearchParams(window.location.search);
  if (!params.has('tuner')) return;

  console.log('[FurnitureTuner] Enabled via ?tuner=1');

  // ─── State ────────────────────────────────────────────────────────
  const LS_KEY = 'cs-furniture-tuner:state-v1';
  const state = {
    selected: null,          // DOM element of current selection
    entities: [],            // tuner-tracked entities (for export)
    clipboard: null,         // for copy/paste between sessions
    nudgeStep: 0.1,          // meters per arrow-key nudge
  };

  // ─── Persistence ──────────────────────────────────────────────────
  function persist() {
    try {
      const snapshot = state.entities.map((el) => serialize(el));
      localStorage.setItem(LS_KEY, JSON.stringify(snapshot));
    } catch (e) {
      console.warn('[FurnitureTuner] persist failed:', e);
    }
  }

  function restore() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[FurnitureTuner] restore failed:', e);
      return [];
    }
  }

  // Serialize a tuner entity into a plain record we can JSON-dump
  function serialize(el) {
    const pos = el.getAttribute('position') || { x: 0, y: 0, z: 0 };
    const rot = el.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
    const scl = el.getAttribute('scale')    || { x: 1, y: 1, z: 1 };

    const rec = {
      tag: el.tagName.toLowerCase(),
      name: el.dataset.tunerName || '',
      position: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: rot.x, y: rot.y, z: rot.z },
      scale:    { x: scl.x, y: scl.y, z: scl.z },
    };

    // Shape attrs
    ['width', 'height', 'depth', 'radius'].forEach((attr) => {
      const v = el.getAttribute(attr);
      if (v !== null && v !== undefined && v !== '') rec[attr] = Number(v);
    });

    // Material (just store the raw attribute string — it might be a
    // full A-Frame material string like 'color: #..; roughness: ..')
    const mat = el.getAttribute('material');
    if (mat) {
      // Ensure we serialize as a string (A-Frame parses attributes into
      // objects sometimes). If it's an object, re-format it.
      if (typeof mat === 'string') {
        rec.material = mat;
      } else {
        rec.material = Object.entries(mat)
          .map(([k, v]) => `${k}: ${v}`).join('; ');
      }
    }

    return rec;
  }

  // ─── Visual selection marker ──────────────────────────────────────
  let selectionMarker = null;
  function ensureSelectionMarker() {
    if (selectionMarker) return selectionMarker;
    // A wireframe box that follows the selected entity
    selectionMarker = document.createElement('a-entity');
    selectionMarker.id = 'tuner-selection-marker';
    selectionMarker.innerHTML = `
      <a-box
        material="color: #c29355; opacity: 0.0; transparent: true; side: double"
        wireframe="true"
        wireframe-line-width="3"></a-box>
    `;
    document.querySelector('a-scene').appendChild(selectionMarker);
    return selectionMarker;
  }

  function updateSelectionMarker() {
    if (!state.selected) {
      if (selectionMarker) selectionMarker.setAttribute('visible', 'false');
      return;
    }
    const m = ensureSelectionMarker();
    m.setAttribute('visible', 'true');

    // Position the marker to wrap the selected entity's world AABB
    const obj = state.selected.object3D;
    if (!obj) return;
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Expand slightly so the outline is clearly around, not on
    size.addScalar(0.05);

    m.setAttribute('position', `${center.x} ${center.y} ${center.z}`);
    const inner = m.querySelector('a-box');
    inner.setAttribute('width',  Math.max(0.1, size.x));
    inner.setAttribute('height', Math.max(0.1, size.y));
    inner.setAttribute('depth',  Math.max(0.1, size.z));
  }

  // ─── Selection ────────────────────────────────────────────────────
  function select(el) {
    state.selected = el;
    updateSelectionMarker();
    renderPanel();
  }

  function clearSelection() {
    state.selected = null;
    updateSelectionMarker();
    renderPanel();
  }

  // Global raycaster-click handler
  function onSceneClick(e) {
    // Use A-Frame's built-in cursor click event which fires on
    // whatever entity the mouse ray hit. If panel consumed the
    // click, ignore.
    if (e.target.closest('#tuner-panel')) return;

    // Walk up to find a tuner-managed entity (we tag them with
    // data-tuner="1")
    let node = e.target;
    while (node && node !== document && !node.dataset.tuner) {
      node = node.parentElement;
    }
    if (node && node.dataset && node.dataset.tuner) {
      select(node);
    }
  }

  // ─── Keyboard nudge ───────────────────────────────────────────────
  function nudge(axis, delta) {
    if (!state.selected) return;
    const pos = state.selected.getAttribute('position') || { x: 0, y: 0, z: 0 };
    const n = { x: pos.x, y: pos.y, z: pos.z };
    n[axis] += delta;
    // Round to 2 decimals
    n[axis] = Math.round(n[axis] * 100) / 100;
    state.selected.setAttribute('position', n);
    updateSelectionMarker();
    renderPanel();
    persist();
  }

  function rotateY(delta) {
    if (!state.selected) return;
    const rot = state.selected.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
    const n = { x: rot.x, y: rot.y + delta, z: rot.z };
    n.y = Math.round(n.y * 10) / 10;
    state.selected.setAttribute('rotation', n);
    updateSelectionMarker();
    renderPanel();
    persist();
  }

  function scaleUniform(factor) {
    if (!state.selected) return;
    const s = state.selected.getAttribute('scale') || { x: 1, y: 1, z: 1 };
    const n = {
      x: Math.max(0.05, Math.round(s.x * factor * 100) / 100),
      y: Math.max(0.05, Math.round(s.y * factor * 100) / 100),
      z: Math.max(0.05, Math.round(s.z * factor * 100) / 100),
    };
    state.selected.setAttribute('scale', n);
    updateSelectionMarker();
    renderPanel();
    persist();
  }

  function onKeyDown(e) {
    // Don't intercept when typing in an input
    if (e.target.matches('input, textarea, select')) return;
    if (!state.selected) return;

    const step = e.shiftKey ? 0.5 : state.nudgeStep;
    switch (e.key.toLowerCase()) {
      case 'a': nudge('x', -step); e.preventDefault(); break;
      case 'd': nudge('x', +step); e.preventDefault(); break;
      case 's': nudge('z', +step); e.preventDefault(); break;
      case 'w': nudge('z', -step); e.preventDefault(); break;
      case 'q': nudge('y', -step); e.preventDefault(); break;
      case 'e': nudge('y', +step); e.preventDefault(); break;
      case 'r': rotateY(+15); e.preventDefault(); break;
      case 'f': rotateY(-15); e.preventDefault(); break;
      case '+': case '=': scaleUniform(1.1); e.preventDefault(); break;
      case '-': case '_': scaleUniform(0.9); e.preventDefault(); break;
      case 'x':
        if (confirm('Delete selected entity?')) {
          deleteSelected();
          e.preventDefault();
        }
        break;
      case 'c':
        cloneSelected();
        e.preventDefault();
        break;
      case 'escape':
        clearSelection();
        e.preventDefault();
        break;
    }
  }

  function deleteSelected() {
    if (!state.selected) return;
    const el = state.selected;
    state.entities = state.entities.filter((e) => e !== el);
    el.remove();
    clearSelection();
    persist();
  }

  function cloneSelected() {
    if (!state.selected) return;
    const src = state.selected;
    // Clone the serialized form, offset by +0.5m X, and respawn
    const rec = serialize(src);
    rec.position.x += 0.5;
    const fresh = spawnFromRecord(rec);
    select(fresh);
  }

  // ─── Spawning ─────────────────────────────────────────────────────
  function spawnFromRecord(rec) {
    const el = document.createElement(rec.tag);
    el.dataset.tuner = '1';
    if (rec.name) el.dataset.tunerName = rec.name;

    el.setAttribute('position', `${rec.position.x} ${rec.position.y} ${rec.position.z}`);
    el.setAttribute('rotation', `${rec.rotation.x} ${rec.rotation.y} ${rec.rotation.z}`);
    el.setAttribute('scale',    `${rec.scale.x} ${rec.scale.y} ${rec.scale.z}`);
    ['width', 'height', 'depth', 'radius'].forEach((k) => {
      if (rec[k] !== undefined) el.setAttribute(k, rec[k]);
    });
    if (rec.material) el.setAttribute('material', rec.material);

    document.querySelector('a-scene').appendChild(el);
    state.entities.push(el);
    return el;
  }

  // Spawn at roughly where the camera is looking (3m in front)
  function spawnAtCamera(tag, defaults) {
    const cam = document.querySelector('#camera');
    const rig = document.querySelector('#camera-rig');
    if (!cam || !rig) return null;

    const rigPos = new THREE.Vector3();
    rig.object3D.getWorldPosition(rigPos);

    const fwd = new THREE.Vector3(0, 0, -1);
    cam.object3D.getWorldQuaternion(new THREE.Quaternion()); // ensure updated
    fwd.applyQuaternion(cam.object3D.getWorldQuaternion(new THREE.Quaternion()));
    // Flatten to horizontal
    fwd.y = 0;
    fwd.normalize();
    const spawn = {
      x: Math.round((rigPos.x + fwd.x * 2.5) * 100) / 100,
      y: 0,
      z: Math.round((rigPos.z + fwd.z * 2.5) * 100) / 100,
    };

    const rec = {
      tag,
      position: spawn,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      ...defaults,
    };
    const el = spawnFromRecord(rec);
    select(el);
    persist();
    return el;
  }

  // ─── UI panel ─────────────────────────────────────────────────────
  let panelEl = null;
  function buildPanel() {
    const el = document.createElement('div');
    el.id = 'tuner-panel';
    Object.assign(el.style, {
      position: 'fixed',
      top: '56px',
      right: '14px',
      width: '320px',
      maxHeight: 'calc(100vh - 80px)',
      overflow: 'auto',
      zIndex: '15000',
      background: 'rgba(18, 13, 9, 0.95)',
      border: '1px solid rgba(194, 147, 85, 0.4)',
      borderRadius: '12px',
      padding: '14px 16px',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: '12px',
      color: '#f1e5d1',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    });
    document.body.appendChild(el);
    return el;
  }

  function renderPanel() {
    if (!panelEl) panelEl = buildPanel();
    const sel = state.selected;
    const lines = [];

    lines.push(`<div style="font-family: Georgia, serif; font-size: 14px; letter-spacing: .04em; color: #c29355; margin-bottom: 10px">TUNER · ${state.entities.length} entities</div>`);

    // Spawn palette
    lines.push('<div style="margin-bottom: 10px">Spawn at cursor:');
    lines.push('<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-top: 6px">');
    SPAWN_PRESETS.forEach((preset, i) => {
      lines.push(`<button data-spawn="${i}" style="${BTN_STYLE}" title="${preset.description}">${preset.label}</button>`);
    });
    lines.push('</div></div>');

    // Current selection
    if (!sel) {
      lines.push('<div style="opacity: .6; margin: 8px 0">Click a tuner-managed entity to edit it. Or spawn one above.</div>');
    } else {
      const p = sel.getAttribute('position') || { x: 0, y: 0, z: 0 };
      const r = sel.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
      const s = sel.getAttribute('scale')    || { x: 1, y: 1, z: 1 };

      lines.push(`<div style="border-top: 1px solid rgba(255,255,255,.1); padding-top: 10px; margin-top: 10px">`);
      lines.push(`<div style="margin-bottom: 6px"><strong>${sel.tagName.toLowerCase()}</strong> ${sel.dataset.tunerName ? '· ' + sel.dataset.tunerName : ''}</div>`);

      // Name input
      lines.push(`<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px">`);
      lines.push(`<span style="width: 20px">id</span>`);
      lines.push(`<input type="text" data-field="name" value="${(sel.dataset.tunerName || '').replace(/"/g, '&quot;')}" placeholder="e.g. cigar-armchair-nw" style="${INPUT_STYLE}" />`);
      lines.push(`</div>`);

      // Position row
      lines.push(`<div style="margin-bottom: 6px; opacity: .7">position</div>`);
      ['x', 'y', 'z'].forEach((axis) => {
        lines.push(`<div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px">`);
        lines.push(`<span style="width: 20px; opacity: .6">${axis}</span>`);
        lines.push(`<input type="number" step="0.1" data-field="position" data-axis="${axis}" value="${Number(p[axis]).toFixed(2)}" style="${INPUT_STYLE}" />`);
        lines.push(`</div>`);
      });

      // Rotation row
      lines.push(`<div style="margin: 8px 0 6px; opacity: .7">rotation (deg)</div>`);
      ['x', 'y', 'z'].forEach((axis) => {
        lines.push(`<div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px">`);
        lines.push(`<span style="width: 20px; opacity: .6">${axis}</span>`);
        lines.push(`<input type="number" step="5" data-field="rotation" data-axis="${axis}" value="${Number(r[axis]).toFixed(1)}" style="${INPUT_STYLE}" />`);
        lines.push(`</div>`);
      });

      // Scale row
      lines.push(`<div style="margin: 8px 0 6px; opacity: .7">scale</div>`);
      ['x', 'y', 'z'].forEach((axis) => {
        lines.push(`<div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px">`);
        lines.push(`<span style="width: 20px; opacity: .6">${axis}</span>`);
        lines.push(`<input type="number" step="0.1" data-field="scale" data-axis="${axis}" value="${Number(s[axis]).toFixed(2)}" style="${INPUT_STYLE}" />`);
        lines.push(`</div>`);
      });

      // Shape attrs (if any)
      const shapeAttrs = ['width', 'height', 'depth', 'radius'].filter((a) => {
        const v = sel.getAttribute(a);
        return v !== null && v !== undefined && v !== '';
      });
      if (shapeAttrs.length) {
        lines.push(`<div style="margin: 8px 0 6px; opacity: .7">shape</div>`);
        shapeAttrs.forEach((a) => {
          lines.push(`<div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px">`);
          lines.push(`<span style="width: 40px; opacity: .6">${a}</span>`);
          lines.push(`<input type="number" step="0.05" min="0.01" data-field="shape" data-attr="${a}" value="${Number(sel.getAttribute(a))}" style="${INPUT_STYLE}" />`);
          lines.push(`</div>`);
        });
      }

      // Material (free-form string)
      const mat = sel.getAttribute('material');
      const matStr = typeof mat === 'string' ? mat :
        (mat ? Object.entries(mat).map(([k, v]) => `${k}: ${v}`).join('; ') : '');
      lines.push(`<div style="margin: 8px 0 6px; opacity: .7">material</div>`);
      lines.push(`<textarea data-field="material" rows="2" style="${INPUT_STYLE}; resize: vertical; font-family: inherit">${matStr.replace(/</g, '&lt;')}</textarea>`);

      lines.push(`<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 10px">`);
      lines.push(`<button data-action="clone"  style="${BTN_STYLE}">Clone</button>`);
      lines.push(`<button data-action="delete" style="${BTN_STYLE}; color: #e8806a">Delete</button>`);
      lines.push(`</div>`);

      lines.push(`</div>`);
    }

    // Global actions
    lines.push(`<div style="border-top: 1px solid rgba(255,255,255,.1); padding-top: 10px; margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px">`);
    lines.push(`<button data-action="export" style="${BTN_STYLE}; background: rgba(194,147,85,0.2)">Export JSON</button>`);
    lines.push(`<button data-action="clear-all" style="${BTN_STYLE}; color: #e8806a">Clear All</button>`);
    lines.push(`</div>`);

    lines.push(`<div style="margin-top: 10px; font-size: 11px; opacity: .55; line-height: 1.5">WASD: move XZ · QE: Y · R/F: rot · +/-: scale · X: del · C: clone · Esc: deselect</div>`);

    panelEl.innerHTML = lines.join('\n');

    // Wire up inputs
    panelEl.querySelectorAll('input, textarea').forEach((input) => {
      input.addEventListener('input', onInputChange);
      input.addEventListener('change', onInputChange);
    });
    panelEl.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', onButtonClick);
    });
  }

  const INPUT_STYLE = [
    'flex: 1',
    'padding: 4px 6px',
    'background: rgba(0,0,0,0.4)',
    'border: 1px solid rgba(194,147,85,0.25)',
    'color: #f1e5d1',
    'font-family: inherit',
    'font-size: 11px',
    'border-radius: 4px',
    'outline: none',
    'width: 100%',
    'box-sizing: border-box',
  ].join('; ');

  const BTN_STYLE = [
    'padding: 6px 8px',
    'background: rgba(255,255,255,0.05)',
    'border: 1px solid rgba(194,147,85,0.3)',
    'color: #f1e5d1',
    'font-family: inherit',
    'font-size: 11px',
    'border-radius: 4px',
    'cursor: pointer',
  ].join('; ');

  function onInputChange(e) {
    if (!state.selected) return;
    const t = e.target;
    const field = t.dataset.field;
    if (field === 'name') {
      state.selected.dataset.tunerName = t.value;
      persist();
      return;
    }
    if (field === 'material') {
      state.selected.setAttribute('material', t.value);
      persist();
      return;
    }
    if (field === 'shape') {
      const attr = t.dataset.attr;
      state.selected.setAttribute(attr, t.value);
      updateSelectionMarker();
      persist();
      return;
    }

    // position / rotation / scale
    const axis = t.dataset.axis;
    const val = Number(t.value) || 0;
    const current = state.selected.getAttribute(field) || { x: 0, y: 0, z: 0 };
    const next = { x: current.x, y: current.y, z: current.z };
    next[axis] = val;
    state.selected.setAttribute(field, next);
    updateSelectionMarker();
    persist();
  }

  function onButtonClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    // Spawn preset
    if (btn.dataset.spawn !== undefined) {
      const preset = SPAWN_PRESETS[Number(btn.dataset.spawn)];
      spawnAtCamera(preset.tag, preset.defaults);
      return;
    }

    // Actions
    switch (btn.dataset.action) {
      case 'clone':
        cloneSelected();
        break;
      case 'delete':
        if (confirm('Delete selected?')) deleteSelected();
        break;
      case 'export':
        exportJSON();
        break;
      case 'clear-all':
        if (confirm(`Remove all ${state.entities.length} tuner entities?`)) {
          state.entities.forEach((el) => el.remove());
          state.entities = [];
          clearSelection();
          persist();
        }
        break;
    }
  }

  // ─── Spawn presets ────────────────────────────────────────────────
  // Minimal starter shapes. Each has a sensible default material and
  // shape that feels like "half of a piece of furniture" — builder
  // picks two or three of these and tunes them into a chair.
  const SPAWN_PRESETS = [
    {
      label: '▭ box',
      description: '0.5×0.5×0.5 box',
      tag: 'a-box',
      defaults: { width: 0.5, height: 0.5, depth: 0.5,
        material: 'color: #8b6f47; roughness: 0.7' },
    },
    {
      label: '▬ slab',
      description: '1×0.05×1 plane-like slab (tabletop, seat)',
      tag: 'a-box',
      defaults: { width: 1.0, height: 0.05, depth: 1.0,
        material: 'color: #8b6f47; roughness: 0.7' },
    },
    {
      label: '◯ cyl',
      description: '0.3 radius × 1.0 tall cylinder (leg, post)',
      tag: 'a-cylinder',
      defaults: { radius: 0.3, height: 1.0,
        material: 'color: #c9a84c; metalness: 0.9; roughness: 0.2' },
    },
    {
      label: '◉ disc',
      description: '0.5 radius × 0.05 tall (table top, rug)',
      tag: 'a-cylinder',
      defaults: { radius: 0.5, height: 0.05,
        material: 'color: #8b6f47; roughness: 0.7' },
    },
    {
      label: '▧ wall',
      description: '1.5×2×0.04 plane (art, mirror)',
      tag: 'a-box',
      defaults: { width: 1.5, height: 2.0, depth: 0.04,
        material: 'color: #c9a84c; roughness: 0.85' },
    },
    {
      label: '★ glow',
      description: 'Emissive sphere (fake light)',
      tag: 'a-sphere',
      defaults: { radius: 0.08,
        material: 'color: #ffcf80; emissive: #ffcf80; emissiveIntensity: 1' },
    },
  ];

  // ─── Export ───────────────────────────────────────────────────────
  function exportJSON() {
    const payload = {
      _comment: 'Furniture tuner export — paste into cafe-sativa-interiors.js',
      exportedAt: new Date().toISOString(),
      totalEntities: state.entities.length,
      entities: state.entities.map((el) => serialize(el)),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)],
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cs-furniture-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('[FurnitureTuner] exported', payload);
  }

  // ─── Starter set (?starter=cs) ────────────────────────────────────
  // If requested, drop in a small set of already-placed furniture
  // near the Foyer so there's something to click-and-edit right away.
  function loadStarter() {
    if (!params.has('starter')) return;
    // Starter set at Foyer center (world x=25, z=-19.75).
    // Minimal: 1 rug + 1 desk + 1 chair. Builder takes it from here.
    const starter = [
      {
        tag: 'a-box', name: 'foyer-rug',
        position: { x: 25, y: 0.02, z: -19.75 },
        rotation: { x: -90, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        width: 2.4, height: 0.02, depth: 1.8,
        material: 'color: #6a3a28; roughness: 0.95',
      },
      {
        tag: 'a-box', name: 'foyer-desk',
        position: { x: 26.4, y: 0.55, z: -20 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        width: 0.7, height: 1.1, depth: 1.8,
        material: 'color: #3a2418; roughness: 0.6',
      },
      {
        tag: 'a-cylinder', name: 'foyer-lamp',
        position: { x: 25, y: 3.3, z: -19.75 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        radius: 0.08, height: 0.2,
        material: 'color: #c9a84c; metalness: 0.9; roughness: 0.2',
      },
    ];
    starter.forEach((r) => spawnFromRecord(r));
    console.log('[FurnitureTuner] Starter set loaded (3 entities)');
  }

  // ─── Boot ─────────────────────────────────────────────────────────
  function boot() {
    const scene = document.querySelector('a-scene');
    if (!scene) {
      document.addEventListener('DOMContentLoaded', boot, { once: true });
      return;
    }
    const onReady = () => {
      // Restore previous session
      const prior = restore();
      if (prior.length > 0) {
        prior.forEach((rec) => spawnFromRecord(rec));
        console.log(`[FurnitureTuner] Restored ${prior.length} entities from localStorage`);
      }

      // Starter set (only if no prior session)
      if (prior.length === 0) loadStarter();

      // Click listener on scene (captures cursor-ray hits)
      document.addEventListener('click', onSceneClick, true);
      // Keyboard
      window.addEventListener('keydown', onKeyDown);

      // Initial panel
      renderPanel();

      // Refresh marker on every render tick (cheap — just a Box3 set)
      scene.addEventListener('render-target-loaded', () => {});
      setInterval(() => {
        if (state.selected) updateSelectionMarker();
      }, 250);

      console.log('[FurnitureTuner] Ready. Click entities or press spawn buttons.');
    };

    if (scene.hasLoaded) onReady();
    else scene.addEventListener('loaded', onReady);
  }

  boot();

  // Expose API for console debugging
  window.FurnitureTuner = {
    state,
    select,
    export: exportJSON,
    spawn: spawnFromRecord,
    clear: () => {
      state.entities.forEach((el) => el.remove());
      state.entities = [];
      clearSelection();
      persist();
    },
  };
})();
