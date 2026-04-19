/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Courtyard Plaza (Tenerife / Dallas)

   Adds a walkable 30×15m plaza directly in front of the Grand
   Entrance so the mall doesn't end abruptly in void. The plaza
   is a themed outdoor space the player can look at and walk
   around in, but not beyond — an invisible wall at the plaza
   perimeter keeps them contained.

   Two themes are selectable via a nav button and persist in
   localStorage ('mall_plaza_theme' → 'tenerife' | 'dallas'):

     Tenerife (default) — pale sandstone paving, palm trees,
       fountain, ocean/volcanic-mountain horizon skybox, ambient
       audio of surf and wind.

     Dallas — warm brick and concrete paving, oak trees, a
       stone water feature, Dallas-skyline silhouette skybox,
       ambient audio of distant city buzz.

   Mall interior lighting is not touched. The theme only affects
   what you see and hear outside the Grand Entrance.

   Coordinate system:
   - Grand Entrance arch is at z=+3 (world).
   - Plaza extends from the arch outward toward +z, occupying
     roughly z=[+3 .. +18] with width 30m (x=[-15 .. +15]).
   - Player's initial position is z=+14 (set by camera rig), so
     they start in the plaza looking at the mall entrance.

   Dependencies: mall-collision.js (for solid-wall component on
   the plaza perimeter).
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const PLAZA = {
    // Plaza footprint (front of the arch, facing out)
    centerX: 0,
    centerZ: 11,      // arch at z=+3, plaza extends +3..+18 (depth 15, center at +10.5)
    width: 30,
    depth: 15,
    floorY: 0,
    wallY: 0,
    wallH: 4,         // invisible wall height (covers head bob)
  };

  // ═══ Theme definitions ═══
  const THEMES = {
    tenerife: {
      skyTop:     '#6fb4d6',
      skyMid:     '#b3d7e8',
      skyBottom:  '#e8d8b0',
      skyImage:   null,                      // gradient only for now
      fog:        { color: '#c6dbe6', density: 0.006 },
      pavingColor: '#d8c89c',                // pale sandstone
      pavingRoughness: 0.8,
      tree: 'palm',
      treeCount: 6,
      waterFeature: 'fountain',
      waterColor: '#4a8fb4',
      distantScenery: 'ocean-mountain',      // horizon silhouette
      ambient: {
        // Lightweight synthesized audio using WebAudio API (no external files)
        type: 'surf',
      },
      label: 'Tenerife',
      toggleIcon: '🌴',
    },

    dallas: {
      skyTop:     '#8aa0c4',
      skyMid:     '#b5bcc8',
      skyBottom:  '#d8c8ac',
      skyImage:   null,
      fog:        { color: '#bab2a2', density: 0.005 },
      pavingColor: '#a87050',                // warm brick/concrete
      pavingRoughness: 0.85,
      tree: 'oak',
      treeCount: 5,
      waterFeature: 'stonepool',
      waterColor: '#5e6b7a',
      distantScenery: 'skyline',
      ambient: {
        type: 'cityhum',
      },
      label: 'Dallas',
      toggleIcon: '🏙',
    },
  };

  // ═══ Helpers ═══
  function el(tag, attrs) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
      }
    }
    return e;
  }

  // Simple vertical gradient skybox using a large sphere with custom shader.
  // Falls back to solid color if shader support is questionable.
  function makeSkybox(theme) {
    const sky = document.createElement('a-entity');
    sky.id = 'plaza-sky';

    // Big sphere, rendered inside
    const sphere = document.createElement('a-sphere');
    sphere.setAttribute('radius', 500);
    sphere.setAttribute('segments-height', 32);
    sphere.setAttribute('segments-width', 32);
    // Use a material with vertex-color gradient by setting back-facing
    // material. A-Frame's 'a-sky' supports `color` only, so we emulate
    // a gradient using a 1px tall CSS canvas texture.
    const canvas = document.createElement('canvas');
    canvas.width = 4; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, theme.skyTop);
    grad.addColorStop(0.55, theme.skyMid);
    grad.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 4, 256);
    const dataUrl = canvas.toDataURL('image/png');
    sphere.setAttribute('material',
      `shader: flat; src: ${dataUrl}; side: back; fog: false`);
    sphere.setAttribute('scale', '-1 1 1'); // flip so we see inside
    sky.appendChild(sphere);

    return sky;
  }

  // Distant scenery silhouette — a thin ring of low-opacity horizon
  // shapes rendered at a fixed radius.
  function makeDistantScenery(theme) {
    const g = document.createElement('a-entity');
    g.id = 'plaza-scenery';

    const R = 200;  // distance from origin
    const yBase = 0;

    if (theme.distantScenery === 'ocean-mountain') {
      // Volcanic mountain silhouette on the Tenerife horizon (south/east)
      for (let i = 0; i < 12; i++) {
        const angle = -Math.PI / 2 + (i - 5.5) * 0.06;
        const x = Math.cos(angle) * R;
        const z = Math.sin(angle) * R;
        const height = 20 + Math.sin(i * 1.3) * 12 + (i === 6 ? 18 : 0); // Teide peak in middle
        const m = document.createElement('a-triangle');
        m.setAttribute('vertex-a', `0 ${height} 0`);
        m.setAttribute('vertex-b', `-18 0 0`);
        m.setAttribute('vertex-c', `18 0 0`);
        m.setAttribute('position', `${x} ${yBase} ${z}`);
        m.setAttribute('rotation', `0 ${-angle * 180 / Math.PI + 90} 0`);
        m.setAttribute('material', 'shader: flat; color: #7a8d9c; opacity: 0.85; transparent: true; fog: false; side: double');
        g.appendChild(m);
      }
      // Ocean plane (flat disc extending to horizon at sea level, just below y=0)
      const ocean = document.createElement('a-circle');
      ocean.setAttribute('radius', R - 1);
      ocean.setAttribute('rotation', '-90 0 0');
      ocean.setAttribute('position', '0 -0.5 0');
      ocean.setAttribute('material', 'shader: flat; color: #2b6a8a; opacity: 0.5; transparent: true; fog: false');
      g.appendChild(ocean);
    } else if (theme.distantScenery === 'skyline') {
      // Dallas skyline silhouette (north side — BoA plaza, Reunion Tower, etc.)
      const buildings = [
        { x: -30, w: 8,  h: 36 },
        { x: -18, w: 10, h: 44 },
        { x: -4,  w: 6,  h: 52 },  // Reunion-ish
        { x: 6,   w: 12, h: 60 },  // BoA-ish
        { x: 20,  w: 8,  h: 40 },
        { x: 34,  w: 7,  h: 32 },
      ];
      buildings.forEach((b) => {
        const building = document.createElement('a-box');
        building.setAttribute('width', b.w);
        building.setAttribute('height', b.h);
        building.setAttribute('depth', 2);
        building.setAttribute('position', `${b.x} ${b.h / 2} ${-R * 0.8}`);
        building.setAttribute('material', 'shader: flat; color: #3a4556; opacity: 0.9; transparent: true; fog: false');
        g.appendChild(building);
      });
      // Ground plane under the skyline
      const ground = document.createElement('a-circle');
      ground.setAttribute('radius', R - 1);
      ground.setAttribute('rotation', '-90 0 0');
      ground.setAttribute('position', '0 -0.5 0');
      ground.setAttribute('material', 'shader: flat; color: #5a4438; opacity: 0.6; transparent: true; fog: false');
      g.appendChild(ground);
    }

    return g;
  }

  // Palm tree — simple trunk + fronds at top. Purely decorative, not solid.
  function makePalm(x, z) {
    const tree = document.createElement('a-entity');
    tree.setAttribute('position', `${x} 0 ${z}`);

    const trunk = document.createElement('a-cylinder');
    trunk.setAttribute('position', '0 3 0');
    trunk.setAttribute('radius', 0.2);
    trunk.setAttribute('height', 6);
    trunk.setAttribute('material', 'color: #6b4a2a; roughness: 0.9');
    tree.appendChild(trunk);

    // Fronds — 6 radial planes angled down
    for (let i = 0; i < 6; i++) {
      const frond = document.createElement('a-plane');
      frond.setAttribute('width', 3);
      frond.setAttribute('height', 0.8);
      frond.setAttribute('position', `0 6 0`);
      frond.setAttribute('rotation', `-30 ${i * 60} 0`);
      frond.setAttribute('material', 'color: #3a7a3a; side: double; opacity: 0.9; transparent: true');
      tree.appendChild(frond);
    }

    return tree;
  }

  // Oak tree — dense canopy sphere on a brown trunk
  function makeOak(x, z) {
    const tree = document.createElement('a-entity');
    tree.setAttribute('position', `${x} 0 ${z}`);

    const trunk = document.createElement('a-cylinder');
    trunk.setAttribute('position', '0 2.5 0');
    trunk.setAttribute('radius', 0.35);
    trunk.setAttribute('height', 5);
    trunk.setAttribute('material', 'color: #4a3020; roughness: 0.95');
    tree.appendChild(trunk);

    // Canopy — 3 overlapping spheres for a bushy look
    const leafMat = 'color: #4a6d3a; roughness: 0.85';
    const c1 = document.createElement('a-sphere');
    c1.setAttribute('position', '0 6 0');
    c1.setAttribute('radius', 2);
    c1.setAttribute('material', leafMat);
    tree.appendChild(c1);

    const c2 = document.createElement('a-sphere');
    c2.setAttribute('position', '1 5.5 0.5');
    c2.setAttribute('radius', 1.6);
    c2.setAttribute('material', leafMat);
    tree.appendChild(c2);

    const c3 = document.createElement('a-sphere');
    c3.setAttribute('position', '-1 5.5 -0.5');
    c3.setAttribute('radius', 1.6);
    c3.setAttribute('material', leafMat);
    tree.appendChild(c3);

    return tree;
  }

  function makeFountain(theme) {
    const f = document.createElement('a-entity');
    f.setAttribute('position', `${PLAZA.centerX} 0 ${PLAZA.centerZ}`);

    // Stone basin
    const basin = document.createElement('a-cylinder');
    basin.setAttribute('radius', 2.2);
    basin.setAttribute('height', 0.6);
    basin.setAttribute('position', '0 0.3 0');
    basin.setAttribute('material',
      `color: ${theme.waterFeature === 'fountain' ? '#c8bfa8' : '#6a625a'}; roughness: 0.9`);
    f.appendChild(basin);

    // Water surface
    const water = document.createElement('a-cylinder');
    water.setAttribute('radius', 2.0);
    water.setAttribute('height', 0.05);
    water.setAttribute('position', '0 0.62 0');
    water.setAttribute('material',
      `color: ${theme.waterColor}; opacity: 0.85; transparent: true; metalness: 0.4; roughness: 0.2`);
    f.appendChild(water);

    // Center pedestal + spout (fountain only)
    if (theme.waterFeature === 'fountain') {
      const ped = document.createElement('a-cylinder');
      ped.setAttribute('radius', 0.35);
      ped.setAttribute('height', 1.2);
      ped.setAttribute('position', '0 1.25 0');
      ped.setAttribute('material', 'color: #c8bfa8; roughness: 0.8');
      f.appendChild(ped);

      // Water jet (tapered cone, emissive light blue)
      const jet = document.createElement('a-cone');
      jet.setAttribute('radius-bottom', 0.12);
      jet.setAttribute('radius-top', 0.25);
      jet.setAttribute('height', 1.6);
      jet.setAttribute('position', '0 2.65 0');
      jet.setAttribute('material', `color: ${theme.waterColor}; opacity: 0.5; transparent: true; emissive: ${theme.waterColor}; emissiveIntensity: 0.15`);
      f.appendChild(jet);
    }

    return f;
  }

  // Paving — a big plane under the plaza
  function makePaving(theme) {
    const p = document.createElement('a-plane');
    p.setAttribute('rotation', '-90 0 0');
    p.setAttribute('position', `${PLAZA.centerX} 0.01 ${PLAZA.centerZ}`);
    p.setAttribute('width', PLAZA.width);
    p.setAttribute('height', PLAZA.depth);
    p.setAttribute('material',
      `color: ${theme.pavingColor}; roughness: ${theme.pavingRoughness}; metalness: 0.05`);
    return p;
  }

  // Invisible perimeter walls — 3 sides (front, left, right). Back side is
  // the mall entrance itself so we don't block the entrance.
  function makePerimeter() {
    const g = document.createElement('a-entity');
    g.id = 'plaza-perimeter';

    const front = PLAZA.centerZ + PLAZA.depth / 2;
    const left  = PLAZA.centerX - PLAZA.width / 2;
    const right = PLAZA.centerX + PLAZA.width / 2;

    // Front wall (far from mall)
    const f = document.createElement('a-box');
    f.setAttribute('position', `${PLAZA.centerX} ${PLAZA.wallH / 2} ${front}`);
    f.setAttribute('width', PLAZA.width);
    f.setAttribute('height', PLAZA.wallH);
    f.setAttribute('depth', 0.2);
    f.setAttribute('visible', 'false');
    f.setAttribute('solid-wall', '');
    g.appendChild(f);

    // Left wall
    const l = document.createElement('a-box');
    l.setAttribute('position', `${left} ${PLAZA.wallH / 2} ${PLAZA.centerZ}`);
    l.setAttribute('width', 0.2);
    l.setAttribute('height', PLAZA.wallH);
    l.setAttribute('depth', PLAZA.depth);
    l.setAttribute('visible', 'false');
    l.setAttribute('solid-wall', '');
    g.appendChild(l);

    // Right wall
    const r = document.createElement('a-box');
    r.setAttribute('position', `${right} ${PLAZA.wallH / 2} ${PLAZA.centerZ}`);
    r.setAttribute('width', 0.2);
    r.setAttribute('height', PLAZA.wallH);
    r.setAttribute('depth', PLAZA.depth);
    r.setAttribute('visible', 'false');
    r.setAttribute('solid-wall', '');
    g.appendChild(r);

    return g;
  }

  // ═══ Ambient audio — lightweight synthesized (no network fetch) ═══
  let _audioCtx = null;
  let _audioNode = null;

  function startAmbient(type) {
    stopAmbient();
    try {
      _audioCtx = _audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return;  // silent if audio not supported
    }
    const ctx = _audioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (type === 'surf') {
      // Soft low-frequency noise + filtered hiss = distant surf
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const d = buffer.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 380;
      filter.Q.value = 0.7;

      const gain = ctx.createGain();
      gain.gain.value = 0.08;

      // Slow amplitude LFO for wave rhythm
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.18;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.04;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();

      _audioNode = { src, filter, gain, lfo };
    } else if (type === 'cityhum') {
      // Low steady drone + occasional distant horn
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const d = buffer.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180;
      filter.Q.value = 0.4;

      const gain = ctx.createGain();
      gain.gain.value = 0.06;

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();

      _audioNode = { src, filter, gain };
    }
  }

  function stopAmbient() {
    if (!_audioNode) return;
    try {
      if (_audioNode.src) _audioNode.src.stop();
      if (_audioNode.lfo) _audioNode.lfo.stop();
    } catch (e) {}
    _audioNode = null;
  }

  // ═══ Plaza render / rerender ═══
  function clearPlaza() {
    ['plaza-sky', 'plaza-scenery', 'plaza-ground', 'plaza-perimeter', 'plaza-props']
      .forEach((id) => {
        const e = document.getElementById(id);
        if (e) e.remove();
      });
  }

  function renderPlaza(themeName) {
    const theme = THEMES[themeName] || THEMES.tenerife;
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    clearPlaza();

    // Sky
    scene.appendChild(makeSkybox(theme));

    // Distant scenery silhouette
    scene.appendChild(makeDistantScenery(theme));

    // Ground / paving
    const ground = document.createElement('a-entity');
    ground.id = 'plaza-ground';
    ground.appendChild(makePaving(theme));
    scene.appendChild(ground);

    // Props: trees + fountain
    const props = document.createElement('a-entity');
    props.id = 'plaza-props';

    // Trees arranged along plaza edges, not blocking center path
    const treeFn = theme.tree === 'palm' ? makePalm : makeOak;
    const margin = 2.5;
    const zFront = PLAZA.centerZ + PLAZA.depth / 2 - margin;
    const zBack  = PLAZA.centerZ - PLAZA.depth / 2 + margin;
    const xs = [-12, -7, -3, 3, 7, 12];
    for (let i = 0; i < Math.min(theme.treeCount, 6); i++) {
      const x = xs[i] + (Math.random() - 0.5) * 0.8;
      // Half front, half back
      const z = (i % 2 === 0) ? zFront : zBack;
      props.appendChild(treeFn(x, z));
    }

    // Water feature at center
    props.appendChild(makeFountain(theme));

    scene.appendChild(props);

    // Invisible perimeter walls (solid)
    scene.appendChild(makePerimeter());

    // Update fog to match theme
    scene.setAttribute('fog',
      `type: exponential; color: ${theme.fog.color}; density: ${theme.fog.density}`);

    // Refresh collider now that new solid walls exist
    setTimeout(() => {
      if (window.MallCollider) window.MallCollider.refresh();
    }, 300);

    // Swap ambient audio
    startAmbient(theme.ambient.type);

    console.log('[PlazaCourtyard] Rendered theme:', themeName);
  }

  // ═══ Theme toggle UI ═══
  function currentTheme() {
    try {
      return localStorage.getItem('mall_plaza_theme') || 'tenerife';
    } catch (e) {
      return 'tenerife';
    }
  }

  function setTheme(name) {
    try { localStorage.setItem('mall_plaza_theme', name); } catch (e) {}
    renderPlaza(name);
    updateToggleUI(name);
  }

  function mountToggleUI() {
    const existing = document.getElementById('plaza-theme-toggle');
    if (existing) existing.remove();

    const controls = document.getElementById('hud-controls');
    if (!controls) return;  // HUD not rendered yet, try later

    const btn = document.createElement('button');
    btn.id = 'plaza-theme-toggle';
    btn.className = 'hud-btn';
    btn.title = 'Switch courtyard theme';
    btn.onclick = () => {
      const next = currentTheme() === 'tenerife' ? 'dallas' : 'tenerife';
      setTheme(next);
    };
    // Insert before the mode button (last one)
    const modeBtn = document.getElementById('btn-mode');
    if (modeBtn) controls.insertBefore(btn, modeBtn);
    else controls.appendChild(btn);

    updateToggleUI(currentTheme());
  }

  function updateToggleUI(themeName) {
    const btn = document.getElementById('plaza-theme-toggle');
    if (!btn) return;
    const theme = THEMES[themeName] || THEMES.tenerife;
    btn.textContent = theme.toggleIcon;
    btn.title = 'Courtyard: ' + theme.label + ' (click to switch)';
  }

  // ═══ Boot ═══
  function init() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;
    const go = () => {
      renderPlaza(currentTheme());
      mountToggleUI();
    };
    if (scene.hasLoaded) {
      setTimeout(go, 600);
    } else {
      scene.addEventListener('loaded', () => setTimeout(go, 600));
    }
  }

  window.PlazaCourtyard = { render: renderPlaza, setTheme, currentTheme };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
