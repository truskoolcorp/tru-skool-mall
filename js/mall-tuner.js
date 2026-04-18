/* ═══════════════════════════════════════════════════════════════════
   TRU SKOOL MALL — Room Tuner (backtick ` toggles)

   - Loads room transform overrides from Supabase at boot
   - Provides overlay UI to adjust position/rotation/scale/spawn per room
   - Writes back to Supabase on save; applies live to the scene
   - Works alongside store-rooms.js — does NOT replace it

   USAGE:
   1. Include this AFTER store-rooms.js in index.html
   2. Press ` (backtick) to toggle the tuner overlay
   3. Pick a room, drag sliders or type numbers, click Save

   The tuner mutates the live GLB transforms AND updates
   window.STORE_ROOMS so store-rooms.js picks up the new values
   on the next zone entry.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── CONFIG ────────────────────────────────────────────────────────
  var SUPABASE_URL = 'https://ugdaqdhthleyhvsubxis.supabase.co';
  var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnZGFxZGh0aGxleWh2c3VieGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzI1ODUsImV4cCI6MjA4NTc0ODU4NX0.VlHoUXozjiDZYS7-d9n_cdGMsJKB61rPK-2d9tHQtV4';
  var TABLE = 'mall_room_tuning';
  var TOGGLE_KEY = '`'; // backtick

  // ─── STATE ─────────────────────────────────────────────────────────
  var state = {
    rows: [],           // rows from supabase
    selected: null,     // { label, slot_index }
    open: false,
    dirty: false,
  };

  // ─── SUPABASE HELPERS ──────────────────────────────────────────────
  function sbHeaders() {
    return {
      'apikey': SUPABASE_ANON,
      'Authorization': 'Bearer ' + SUPABASE_ANON,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
  }

  function fetchRows() {
    return fetch(SUPABASE_URL + '/rest/v1/' + TABLE + '?select=*&order=label.asc,slot_index.asc', {
      headers: sbHeaders(),
    }).then(function (r) {
      if (!r.ok) throw new Error('fetch ' + r.status);
      return r.json();
    });
  }

  function saveRow(row) {
    var q = '?label=eq.' + encodeURIComponent(row.label) +
            '&slot_index=eq.' + row.slot_index;
    var body = {
      position_x: row.position_x, position_y: row.position_y, position_z: row.position_z,
      rotation_x: row.rotation_x, rotation_y: row.rotation_y, rotation_z: row.rotation_z,
      scale_x: row.scale_x, scale_y: row.scale_y, scale_z: row.scale_z,
      spawn_x: row.spawn_x, spawn_y: row.spawn_y, spawn_z: row.spawn_z,
      spawn_rot_y: row.spawn_rot_y,
      zone_x: row.zone_x, zone_z: row.zone_z, zone_w: row.zone_w, zone_d: row.zone_d,
      updated_by: 'tuner',
    };
    return fetch(SUPABASE_URL + '/rest/v1/' + TABLE + q, {
      method: 'PATCH',
      headers: sbHeaders(),
      body: JSON.stringify(body),
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t); });
      return r.json();
    });
  }

  // ─── APPLY TO LIVE SCENE ───────────────────────────────────────────
  // Find the loaded GLB entity for a given label/slot and update its transform
  function findRoomEntity(label, slotIndex) {
    var container = document.getElementById('store-room-container');
    if (!container) return null;
    // Escape double quotes in label for CSS selector safety
    var safe = label.replace(/"/g, '\\"');
    var sel = '[data-room-label="' + safe + '"]' +
              '[data-room-slot="' + slotIndex + '"]';
    return container.querySelector(sel);
  }

  function applyRowToScene(row) {
    var el = findRoomEntity(row.label, row.slot_index);
    if (!el) return false;
    el.setAttribute('position', row.position_x + ' ' + row.position_y + ' ' + row.position_z);
    el.setAttribute('rotation', row.rotation_x + ' ' + row.rotation_y + ' ' + row.rotation_z);
    el.setAttribute('scale', row.scale_x + ' ' + row.scale_y + ' ' + row.scale_z);
    return true;
  }

  // Push all rows into window.STORE_ROOMS (and ROOM_ZONES) so the next
  // zone-enter uses tuned values
  function syncToStoreRooms() {
    if (!window.STORE_ROOMS) return;
    var byLabel = {};
    state.rows.forEach(function (r) {
      if (!byLabel[r.label]) byLabel[r.label] = [];
      byLabel[r.label][r.slot_index] = r;
    });

    Object.keys(byLabel).forEach(function (label) {
      var cfg = window.STORE_ROOMS[label];
      if (!cfg) return;
      var slots = byLabel[label];

      // Multi-room shape
      if (cfg.rooms && Array.isArray(cfg.rooms)) {
        for (var i = 0; i < cfg.rooms.length && i < slots.length; i++) {
          var r = slots[i];
          if (!r) continue;
          cfg.rooms[i].position = r.position_x + ' ' + r.position_y + ' ' + r.position_z;
          cfg.rooms[i].rotation = r.rotation_x + ' ' + r.rotation_y + ' ' + r.rotation_z;
          cfg.rooms[i].scale    = r.scale_x + ' ' + r.scale_y + ' ' + r.scale_z;
        }
      }
      // Single-room shape (room object at top level)
      else if (cfg.room) {
        var r0 = slots[0];
        if (r0) {
          cfg.room.position = r0.position_x + ' ' + r0.position_y + ' ' + r0.position_z;
          cfg.room.rotation = r0.rotation_x + ' ' + r0.rotation_y + ' ' + r0.rotation_z;
          cfg.room.scale    = r0.scale_x + ' ' + r0.scale_y + ' ' + r0.scale_z;
        }
      }

      // Spawn point — stash on the cfg for any consumer that wants it
      var spawn = slots[0];
      if (spawn && spawn.spawn_x != null) {
        cfg.spawn = {
          x: spawn.spawn_x, y: spawn.spawn_y, z: spawn.spawn_z,
          rotY: spawn.spawn_rot_y,
        };
      }

      // Sync ROOM_ZONES (detection bounds) from slot 0's zone_* fields
      if (window.ROOM_ZONES && spawn && spawn.zone_x != null) {
        for (var zi = 0; zi < window.ROOM_ZONES.length; zi++) {
          if (window.ROOM_ZONES[zi].label === label) {
            window.ROOM_ZONES[zi].x = spawn.zone_x;
            window.ROOM_ZONES[zi].z = spawn.zone_z;
            window.ROOM_ZONES[zi].w = spawn.zone_w;
            window.ROOM_ZONES[zi].d = spawn.zone_d;
            break;
          }
        }
      }
    });

    // Nudge the StoreRoomSystem to rebuild the current zone with new values
    if (window.StoreRoomSystem && typeof window.StoreRoomSystem.reloadCurrent === 'function') {
      window.StoreRoomSystem.reloadCurrent();
    }
  }

  // Teleport camera rig to the room's spawn point (for quick visual check)
  function teleportToSpawn(row) {
    if (row.spawn_x == null) return;
    var rig = document.getElementById('camera-rig');
    if (!rig) return;
    rig.setAttribute('position', row.spawn_x + ' ' + (row.spawn_y || 1.6) + ' ' + row.spawn_z);
    var cam = rig.querySelector('[camera]');
    if (cam && row.spawn_rot_y != null) {
      cam.setAttribute('rotation', '0 ' + row.spawn_rot_y + ' 0');
    }
  }

  // ─── UI ────────────────────────────────────────────────────────────
  function injectStyle() {
    if (document.getElementById('mall-tuner-style')) return;
    var s = document.createElement('style');
    s.id = 'mall-tuner-style';
    s.textContent = [
      '#mall-tuner{position:fixed;top:0;right:0;width:380px;height:100vh;',
      '  background:rgba(10,8,20,0.96);color:#e8e0ff;font:13px/1.4 monospace;',
      '  border-left:2px solid #a060e0;z-index:99999;display:none;',
      '  flex-direction:column;box-shadow:-10px 0 30px rgba(0,0,0,0.6);}',
      '#mall-tuner.open{display:flex;}',
      '#mall-tuner header{padding:12px 14px;background:linear-gradient(90deg,#2a1050,#50208a);',
      '  border-bottom:1px solid #a060e0;display:flex;justify-content:space-between;align-items:center;}',
      '#mall-tuner header h2{margin:0;font-size:14px;letter-spacing:1px;color:#fff;}',
      '#mall-tuner header .hint{font-size:10px;opacity:0.7;}',
      '#mall-tuner .body{flex:1;overflow-y:auto;padding:10px 14px;}',
      '#mall-tuner select{width:100%;padding:6px;background:#1a1030;color:#fff;',
      '  border:1px solid #a060e0;border-radius:4px;font:12px monospace;margin-bottom:10px;}',
      '#mall-tuner .grp{margin-bottom:12px;padding:8px;background:rgba(160,96,224,0.08);',
      '  border-left:2px solid #a060e0;border-radius:2px;}',
      '#mall-tuner .grp h3{margin:0 0 6px;font-size:11px;letter-spacing:1px;color:#c090ff;',
      '  text-transform:uppercase;}',
      '#mall-tuner .row{display:grid;grid-template-columns:20px 1fr 70px;gap:6px;',
      '  align-items:center;margin-bottom:4px;}',
      '#mall-tuner .row label{font-size:11px;color:#a080c0;}',
      '#mall-tuner .row input[type=range]{width:100%;}',
      '#mall-tuner .row input[type=number]{width:70px;padding:2px 4px;',
      '  background:#0a0515;color:#fff;border:1px solid #553377;border-radius:3px;',
      '  font:11px monospace;}',
      '#mall-tuner footer{padding:10px 14px;border-top:1px solid #553377;display:flex;gap:6px;}',
      '#mall-tuner button{flex:1;padding:8px;background:#a060e0;color:#fff;border:0;',
      '  border-radius:4px;cursor:pointer;font:bold 11px monospace;letter-spacing:1px;}',
      '#mall-tuner button:hover{background:#c080ff;}',
      '#mall-tuner button.secondary{background:#2a1848;}',
      '#mall-tuner button.secondary:hover{background:#3a2058;}',
      '#mall-tuner .status{padding:6px 14px;font-size:11px;color:#80c090;}',
      '#mall-tuner .status.err{color:#ff6060;}',
      '#mall-tuner .dirty{color:#ffc040;font-weight:bold;}',
    ].join('');
    document.head.appendChild(s);
  }

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'style') n.style.cssText = attrs[k];
      else if (k.slice(0, 2) === 'on') n[k] = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  function buildOverlay() {
    var root = el('div', { id: 'mall-tuner' });

    var hdr = el('header', {}, [
      el('h2', {}, ['🎛 ROOM TUNER']),
      el('span', { class: 'hint' }, ['` to close']),
    ]);

    var body = el('div', { class: 'body' });

    var select = el('select', { id: 'tuner-select' });

    var groups = el('div', { id: 'tuner-groups' });

    body.appendChild(select);
    body.appendChild(groups);

    var status = el('div', { class: 'status', id: 'tuner-status' }, ['Ready.']);

    var footer = el('footer', {}, [
      el('button', { class: 'secondary', id: 'tuner-teleport' }, ['TELEPORT']),
      el('button', { class: 'secondary', id: 'tuner-reset' }, ['RELOAD']),
      el('button', { id: 'tuner-save' }, ['SAVE']),
    ]);

    root.appendChild(hdr);
    root.appendChild(body);
    root.appendChild(status);
    root.appendChild(footer);
    document.body.appendChild(root);
    return root;
  }

  var axisGroups = [
    { title: 'Position', keys: ['position_x', 'position_y', 'position_z'],
      min: -100, max: 100, step: 0.1 },
    { title: 'Rotation', keys: ['rotation_x', 'rotation_y', 'rotation_z'],
      min: -180, max: 180, step: 1 },
    { title: 'Scale', keys: ['scale_x', 'scale_y', 'scale_z'],
      min: 0.001, max: 5, step: 0.001 },
    { title: 'Spawn Point', keys: ['spawn_x', 'spawn_y', 'spawn_z', 'spawn_rot_y'],
      min: -100, max: 100, step: 0.1 },
    { title: 'Zone', keys: ['zone_x', 'zone_z', 'zone_w', 'zone_d'],
      min: -100, max: 100, step: 0.5 },
  ];

  function renderGroups(row) {
    var host = document.getElementById('tuner-groups');
    host.innerHTML = '';
    if (!row) return;
    axisGroups.forEach(function (g) {
      var box = el('div', { class: 'grp' });
      box.appendChild(el('h3', {}, [g.title]));
      g.keys.forEach(function (k) {
        var lbl = k.split('_').slice(1).join('_').toUpperCase() || k.toUpperCase();
        var val = row[k];
        if (val == null) val = 0;
        var range = el('input', {
          type: 'range', min: g.min, max: g.max, step: g.step, value: val,
          'data-key': k,
        });
        var num = el('input', {
          type: 'number', min: g.min, max: g.max, step: g.step, value: val,
          'data-key': k,
        });
        range.oninput = function () { num.value = range.value; updateField(k, parseFloat(range.value)); };
        num.oninput = function () { range.value = num.value; updateField(k, parseFloat(num.value)); };
        box.appendChild(el('div', { class: 'row' }, [el('label', {}, [lbl]), range, num]));
      });
      host.appendChild(box);
    });
  }

  function updateField(key, val) {
    if (!state.selected) return;
    var row = state.rows.find(function (r) {
      return r.label === state.selected.label && r.slot_index === state.selected.slot_index;
    });
    if (!row) return;
    row[key] = val;
    state.dirty = true;
    setStatus('Unsaved changes', false, true);
    applyRowToScene(row);
  }

  function populateSelect() {
    var sel = document.getElementById('tuner-select');
    sel.innerHTML = '';
    state.rows.forEach(function (r) {
      var label = r.label + (r.slot_index > 0 ? ' [' + r.slot_index + ']' : '') +
                  ' — ' + (r.src ? r.src.split('/').pop() : '');
      sel.appendChild(el('option', { value: r.label + '|' + r.slot_index }, [label]));
    });
    sel.onchange = function () {
      var parts = sel.value.split('|');
      state.selected = { label: parts[0], slot_index: parseInt(parts[1], 10) };
      var row = state.rows.find(function (rr) {
        return rr.label === state.selected.label && rr.slot_index === state.selected.slot_index;
      });
      renderGroups(row);
    };
    if (state.rows.length) {
      sel.value = state.rows[0].label + '|' + state.rows[0].slot_index;
      sel.onchange();
    }
  }

  function setStatus(msg, isErr, isDirty) {
    var s = document.getElementById('tuner-status');
    if (!s) return;
    s.className = 'status' + (isErr ? ' err' : '') + (isDirty ? ' dirty' : '');
    s.textContent = msg;
  }

  function wireButtons() {
    document.getElementById('tuner-save').onclick = function () {
      if (!state.selected) return;
      var row = state.rows.find(function (r) {
        return r.label === state.selected.label && r.slot_index === state.selected.slot_index;
      });
      if (!row) return;
      setStatus('Saving...');
      saveRow(row).then(function () {
        state.dirty = false;
        syncToStoreRooms();
        setStatus('✓ Saved ' + row.label + ' [' + row.slot_index + ']');
      }).catch(function (e) {
        setStatus('✗ ' + e.message, true);
      });
    };
    document.getElementById('tuner-reset').onclick = function () {
      setStatus('Reloading from Supabase...');
      load().then(function () { setStatus('✓ Reloaded'); });
    };
    document.getElementById('tuner-teleport').onclick = function () {
      if (!state.selected) return;
      var row = state.rows.find(function (r) {
        return r.label === state.selected.label && r.slot_index === state.selected.slot_index;
      });
      if (!row) return;
      teleportToSpawn(row);
      setStatus('→ Teleported to ' + row.label + ' spawn');
    };
  }

  function toggle() {
    var root = document.getElementById('mall-tuner');
    if (!root) return;
    state.open = !state.open;
    root.classList.toggle('open', state.open);
  }

  // ─── LOAD ──────────────────────────────────────────────────────────
  function load() {
    return fetchRows().then(function (rows) {
      state.rows = rows;
      syncToStoreRooms();
      // Apply to any already-loaded rooms in the scene
      rows.forEach(applyRowToScene);
      populateSelect();
      console.log('[MallTuner] Loaded', rows.length, 'room configs from Supabase');
    }).catch(function (e) {
      console.error('[MallTuner] load failed', e);
      setStatus('✗ Load failed: ' + e.message, true);
    });
  }

  // ─── BOOT ──────────────────────────────────────────────────────────
  function boot() {
    injectStyle();
    buildOverlay();
    wireButtons();

    document.addEventListener('keydown', function (e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' ||
                       e.target.tagName === 'SELECT')) return;
      if (e.key === TOGGLE_KEY) { e.preventDefault(); toggle(); }
    });

    load();
  }

  // Expose for manual use / debugging
  window.MallTuner = {
    open: function () { if (!state.open) toggle(); },
    close: function () { if (state.open) toggle(); },
    reload: load,
    state: state,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
