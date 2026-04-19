/* ═══════════════════════════════════════════════════════════════════════
   DEBUG — Collision Overlay

   Renders every entry in MallCollider's collision registry as a
   semi-transparent red wireframe box, sitting exactly where the
   invisible collision surface is. Also adds a HUD readout showing
   the player's current world position.

   Enabled by:
     - URL query string: ?debug=collision
     - Or: localStorage.setItem('debug_collision', '1') then reload
     - Or: window.DebugCollision.enable() from the JS console

   Disable with DebugCollision.disable() or remove the flag.

   The overlay auto-refreshes every 500ms so it stays in sync with
   any walls that get added dynamically (CS wing renders asynchronously
   after the scene loads).
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const STORAGE_KEY = 'debug_collision';
  let enabled = false;
  let refreshTimer = null;
  let overlayRoot = null;
  let hudEl = null;
  let rafId = null;

  function shouldEnable() {
    try {
      if (new URLSearchParams(window.location.search).get('debug') === 'collision') return true;
      if (localStorage.getItem(STORAGE_KEY) === '1') return true;
    } catch (e) { /* ignore */ }
    return false;
  }

  function makeOverlay() {
    const scene = document.querySelector('a-scene');
    if (!scene) return null;
    let root = document.getElementById('debug-collision-root');
    if (!root) {
      root = document.createElement('a-entity');
      root.setAttribute('id', 'debug-collision-root');
      scene.appendChild(root);
    }
    return root;
  }

  function clearOverlay() {
    if (!overlayRoot) return;
    while (overlayRoot.firstChild) overlayRoot.removeChild(overlayRoot.firstChild);
  }

  function makeHUD() {
    if (hudEl) return hudEl;
    const el = document.createElement('div');
    el.id = 'debug-collision-hud';
    el.style.cssText = [
      'position:fixed', 'bottom:20px', 'left:20px',
      'background:rgba(0,0,0,0.85)', 'color:#ff4444',
      'font-family:monospace', 'font-size:12px',
      'padding:10px 14px', 'border:1px solid #ff4444',
      'border-radius:6px', 'z-index:9999',
      'max-width:420px', 'line-height:1.5',
      'pointer-events:none', 'white-space:pre',
    ].join(';');
    document.body.appendChild(el);
    hudEl = el;
    return el;
  }

  function removeHUD() {
    if (hudEl && hudEl.parentNode) hudEl.parentNode.removeChild(hudEl);
    hudEl = null;
  }

  // Get the collision registry. It's a Map in the closure of mall-collision.js.
  // MallCollider exposes .refresh() but not the registry directly. We grab it
  // by iterating through all elements with [solid-wall] attribute and
  // re-computing AABBs the same way the collision module does.
  function snapshotSolidWalls() {
    const walls = [];
    document.querySelectorAll('[solid-wall]').forEach((el) => {
      if (!el.object3D) return;
      const obj = el.object3D;
      obj.updateMatrixWorld(true);
      const mesh = el.getObject3D('mesh');
      if (!mesh || !mesh.geometry) return;
      const box = new THREE.Box3().setFromObject(obj);
      walls.push({
        el,
        minX: box.min.x, maxX: box.max.x,
        minY: box.min.y, maxY: box.max.y,
        minZ: box.min.z, maxZ: box.max.z,
        id: el.id || el.className || '(unnamed)',
      });
    });
    return walls;
  }

  function renderOverlay() {
    if (!enabled) return;
    if (!overlayRoot) overlayRoot = makeOverlay();
    if (!overlayRoot) return;
    clearOverlay();

    const PLAYER_RADIUS = 0.28; // matches mall-collision.js
    const walls = snapshotSolidWalls();

    walls.forEach((w, i) => {
      // Two boxes per wall:
      //  (1) the visible wall geometry itself — faint red
      //  (2) the AABB expanded by PLAYER_RADIUS — bright red wireframe
      //      (this is what ACTUALLY blocks you)
      const cx = (w.minX + w.maxX) / 2;
      const cy = (w.minY + w.maxY) / 2;
      const cz = (w.minZ + w.maxZ) / 2;
      const wx = (w.maxX - w.minX) + PLAYER_RADIUS * 2;
      const wy = (w.maxY - w.minY);
      const wz = (w.maxZ - w.minZ) + PLAYER_RADIUS * 2;

      const box = document.createElement('a-box');
      box.setAttribute('position', `${cx} ${cy} ${cz}`);
      box.setAttribute('width', wx);
      box.setAttribute('height', wy);
      box.setAttribute('depth', wz);
      box.setAttribute('material', 'color: #ff3333; opacity: 0.18; transparent: true; side: double');
      box.setAttribute('data-debug-wall', w.id);
      overlayRoot.appendChild(box);

      // Floor-level number label so you can count which wall is which
      const label = document.createElement('a-text');
      label.setAttribute('value', String(i));
      label.setAttribute('position', `${cx} 0.05 ${cz}`);
      label.setAttribute('rotation', '-90 0 0');
      label.setAttribute('color', '#ffff00');
      label.setAttribute('align', 'center');
      label.setAttribute('width', 2);
      overlayRoot.appendChild(label);
    });

    updateHUDHeader(walls.length);
  }

  function updateHUDHeader(wallCount) {
    if (!hudEl) return;
    // Header (static-ish) — position line is updated per-frame
    hudEl.dataset.wallCount = wallCount;
  }

  function updatePositionReadout() {
    if (!enabled) return;
    const rig = document.getElementById('camera-rig') || document.querySelector('[camera]');
    if (!rig || !hudEl) {
      rafId = requestAnimationFrame(updatePositionReadout);
      return;
    }
    const p = rig.object3D.position;
    const wallCount = hudEl.dataset.wallCount || '?';

    // Find any AABBs the player is currently INSIDE or within 0.5m of
    const PR = 0.28;
    const nearby = [];
    document.querySelectorAll('[solid-wall]').forEach((el, i) => {
      if (!el.object3D) return;
      const box = new THREE.Box3().setFromObject(el.object3D);
      const minX = box.min.x - PR, maxX = box.max.x + PR;
      const minZ = box.min.z - PR, maxZ = box.max.z + PR;
      const inside = (p.x >= minX && p.x <= maxX && p.z >= minZ && p.z <= maxZ);
      const dx = p.x < minX ? minX - p.x : (p.x > maxX ? p.x - maxX : 0);
      const dz = p.z < minZ ? minZ - p.z : (p.z > maxZ ? p.z - maxZ : 0);
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (inside || dist < 0.5) {
        nearby.push({
          idx: i,
          id: el.id || el.className || '?',
          inside, dist: dist.toFixed(2),
          bbox: `x[${minX.toFixed(2)},${maxX.toFixed(2)}] z[${minZ.toFixed(2)},${maxZ.toFixed(2)}]`,
        });
      }
    });

    const lines = [];
    lines.push(`═ COLLISION DEBUG ═`);
    lines.push(`walls tracked: ${wallCount}`);
    lines.push(`player pos: x=${p.x.toFixed(2)} y=${p.y.toFixed(2)} z=${p.z.toFixed(2)}`);
    lines.push(``);
    if (nearby.length === 0) {
      lines.push(`NO nearby walls (open space)`);
    } else {
      lines.push(`NEARBY (within 0.5m or INSIDE):`);
      nearby.slice(0, 6).forEach((n) => {
        lines.push(`  [${n.idx}] ${n.inside ? '⚠ INSIDE' : `d=${n.dist}m`} ${n.id}`);
        lines.push(`        ${n.bbox}`);
      });
      if (nearby.length > 6) lines.push(`  ... and ${nearby.length - 6} more`);
    }
    hudEl.textContent = lines.join('\n');

    rafId = requestAnimationFrame(updatePositionReadout);
  }

  function enable() {
    if (enabled) return;
    enabled = true;
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
    overlayRoot = makeOverlay();
    makeHUD();
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(renderOverlay, 500);
    renderOverlay();
    if (rafId) cancelAnimationFrame(rafId);
    updatePositionReadout();
    console.log('[DebugCollision] ENABLED — red boxes = collision AABBs (expanded by 0.28m player radius)');
  }

  function disable() {
    enabled = false;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    clearOverlay();
    if (overlayRoot && overlayRoot.parentNode) overlayRoot.parentNode.removeChild(overlayRoot);
    overlayRoot = null;
    removeHUD();
    console.log('[DebugCollision] disabled');
  }

  function init() {
    if (shouldEnable()) {
      const scene = document.querySelector('a-scene');
      if (scene && scene.hasLoaded) {
        setTimeout(enable, 800);
      } else if (scene) {
        scene.addEventListener('loaded', () => setTimeout(enable, 800));
      } else {
        document.addEventListener('DOMContentLoaded', init, { once: true });
      }
    }
  }

  window.DebugCollision = { enable, disable };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
