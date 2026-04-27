/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Café Sativa Concierge

   Laviche-as-navigation. The foyer is the only walked space in
   the CS wing now; Laviche is how patrons get to the rooms.

   FLOW
     1. Player walks into foyer
     2. Sees subtle pulsing ring on the floor near Laviche
        (visual affordance: 'something to interact with here')
     3. Clicks the ring (or Laviche herself)
     4. Modal overlay slides up from bottom
     5. Player picks a room from the directory
     6. Open rooms → navigate to cs-{roomid}.html
        Coming-soon rooms → toast 'Opening soon — check back'
     7. Close button (or click outside) dismisses

   The modal is plain HTML over the canvas. NOT a 3D text panel:
   - 5-10× more readable on mobile
   - Rich layout (grid of cards) trivially easy
   - Tappable buttons feel like normal UI
   - Doesn't have to compete with scene lighting

   ROOM CATALOG
     Each entry: id, name, tagline, summary, status, themeColor.
     Status = 'open' (URL exists) | 'soon' (placeholder).
     When per-room scenes ship, flip status from 'soon' to 'open'.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Catalog ──────────────────────────────────────────────────
  const ROOMS = [
    {
      id: 'bar',
      name: 'Cocktail Bar',
      tagline: 'Liquid Artistry, Reimagined',
      summary: 'A walnut-and-brass cocktail temple. Backbar lined with rare bottles; pendants throw warm pools over the marble counter.',
      status: 'open',
      themeColor: '#c9a84c',
    },
    {
      id: 'main-lounge',
      name: 'Main Lounge',
      tagline: 'Where Conversations Find Their Rhythm',
      summary: 'The intimate performance lounge. Home of "At The Table" — Episode 1 of the Verse Alkemist sessions.',
      status: 'open',
      themeColor: '#3a4a38',
      featured: true,
    },
    {
      id: 'smoke-lounge',
      name: 'Smoke Lounge',
      tagline: 'Contemplation, Elevated',
      summary: 'Plush deep-seated armchairs, soft amber glow, the scent of curated leaf. A sanctuary for the slow burn.',
      status: 'open',
      themeColor: '#a06030',
    },
    {
      id: 'cigar',
      name: 'Cigar Lounge',
      tagline: 'Members\u2019 Quarters',
      summary: 'Oxblood leather, dark walnut, a wall of humidors. VIP membership required \u2014 a quiet room for private counsel.',
      status: 'open',
      themeColor: '#7a1525',
      vipOnly: true,
    },
    {
      id: 'culinary',
      name: 'Culinary Theater',
      tagline: 'Gastronomy as Performance',
      summary: 'The kitchen-as-stage. Tiered velvet seating faces the chef\u2019s line. Ticketed tastings, broadcast live.',
      status: 'open',
      themeColor: '#e8a050',
    },
    {
      id: 'courtyard',
      name: 'Courtyard',
      tagline: 'Open-Air Sanctuary',
      summary: 'Olive trees, warm stone pavers, a live fire pit, a strand of glowing lights overhead. The transition between rooms.',
      status: 'open',
      themeColor: '#c0a878',
    },
    {
      id: 'cold-stoned',
      name: 'Cold Stoned',
      tagline: 'Artisan Frozen Indulgence',
      summary: 'Café Sativa\u2019s gelato pocket. Eight rotating flavors hand-folded daily; the chocolate is unholy.',
      status: 'open',
      themeColor: '#d4a577',
    },
  ];

  // ─── Floor hotspot ring (in-scene) ───────────────────────────
  // A subtle pulsing ring on the floor right in front of Laviche.
  // Clicking it opens the directory. The ring sits at y=0.03 — just
  // above the floor plane — so it doesn't z-fight the rug.
  function buildHotspot() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    // Ring at the player-facing edge of the desk so they walk
    // toward it naturally on entering the foyer
    const ring = document.createElement('a-ring');
    ring.id = 'cs-concierge-hotspot';
    ring.setAttribute('position', '25 0.03 -21.5');
    ring.setAttribute('rotation', '-90 0 0');
    ring.setAttribute('radius-inner', 0.55);
    ring.setAttribute('radius-outer', 0.7);
    ring.setAttribute('material', 'color: #c9a84c; emissive: #c9a84c; emissiveIntensity: 0.8; opacity: 0.85; transparent: true; side: double');
    ring.classList.add('clickable');
    ring.setAttribute('data-cs-concierge', 'true');

    // Subtle pulse animation
    ring.setAttribute('animation__pulse',
      'property: material.emissiveIntensity; from: 0.5; to: 1.0; dur: 1400; dir: alternate; loop: true; easing: easeInOutSine');
    ring.setAttribute('animation__scale',
      'property: scale; from: 1 1 1; to: 1.08 1.08 1.08; dur: 1400; dir: alternate; loop: true; easing: easeInOutSine');

    // Click handler
    ring.addEventListener('click', openDirectory);

    scene.appendChild(ring);
    console.log('[CSConcierge] hotspot placed at (25, 0.03, -21.5)');
  }

  // ─── Modal styles (injected once) ────────────────────────────
  function injectStyles() {
    if (document.getElementById('cs-concierge-styles')) return;
    const css = document.createElement('style');
    css.id = 'cs-concierge-styles';
    css.textContent = `
      .cs-modal-backdrop {
        position: fixed; inset: 0; z-index: 9000;
        background: rgba(8, 6, 4, 0.78);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        opacity: 0; pointer-events: none;
        transition: opacity 320ms ease-out;
      }
      .cs-modal-backdrop.cs-open {
        opacity: 1; pointer-events: auto;
      }
      .cs-modal {
        position: fixed; left: 50%; bottom: 0;
        width: min(92vw, 1100px);
        max-height: 88vh; overflow-y: auto;
        transform: translate(-50%, 100%);
        background: linear-gradient(180deg, #1a1410 0%, #0e0a07 100%);
        color: #f4ecd8;
        border: 1px solid rgba(201, 168, 76, 0.35);
        border-bottom: none;
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.6);
        z-index: 9001;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        transition: transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .cs-modal-backdrop.cs-open .cs-modal {
        transform: translate(-50%, 0);
      }
      .cs-modal-header {
        display: flex; align-items: center; gap: 16px;
        padding: 24px 28px 18px;
        border-bottom: 1px solid rgba(201, 168, 76, 0.18);
      }
      .cs-modal-portrait {
        width: 56px; height: 56px; border-radius: 50%;
        background: linear-gradient(135deg, #c9a84c 0%, #5a3828 100%);
        flex-shrink: 0; display: grid; place-items: center;
        font-size: 22px; font-weight: 700; color: #1a1410;
        border: 2px solid rgba(201, 168, 76, 0.5);
      }
      .cs-modal-title {
        flex: 1; min-width: 0;
      }
      .cs-modal-greeting {
        font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase;
        color: #c9a84c; margin: 0 0 4px;
      }
      .cs-modal-subgreeting {
        font-size: 16px; color: rgba(244, 236, 216, 0.78); margin: 0;
        line-height: 1.45;
      }
      .cs-modal-close {
        background: transparent; border: 1px solid rgba(201, 168, 76, 0.4);
        color: #c9a84c; font-size: 18px; line-height: 1;
        width: 36px; height: 36px; border-radius: 50%;
        cursor: pointer; transition: all 180ms ease;
        display: grid; place-items: center; flex-shrink: 0;
      }
      .cs-modal-close:hover {
        background: rgba(201, 168, 76, 0.15);
        border-color: #c9a84c;
      }
      .cs-modal-body {
        padding: 22px 28px 28px;
      }
      .cs-rooms-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 14px;
      }
      .cs-room-card {
        background: rgba(255, 255, 255, 0.025);
        border: 1px solid rgba(201, 168, 76, 0.15);
        border-radius: 10px;
        padding: 18px 18px 14px;
        cursor: pointer;
        transition: all 220ms ease;
        position: relative; overflow: hidden;
      }
      .cs-room-card::before {
        content: ''; position: absolute; left: 0; top: 0; bottom: 0;
        width: 3px; background: var(--accent, #c9a84c);
        opacity: 0.7;
      }
      .cs-room-card:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(201, 168, 76, 0.5);
        transform: translateY(-2px);
      }
      .cs-room-card.cs-featured {
        background: rgba(201, 168, 76, 0.08);
        border-color: rgba(201, 168, 76, 0.4);
      }
      .cs-room-name {
        font-size: 17px; font-weight: 600; margin: 0 0 4px;
        color: #f4ecd8;
        display: flex; align-items: center; justify-content: space-between;
        gap: 8px;
      }
      .cs-room-tagline {
        font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
        color: var(--accent, #c9a84c); margin: 0 0 10px;
      }
      .cs-room-summary {
        font-size: 13px; line-height: 1.55;
        color: rgba(244, 236, 216, 0.7); margin: 0 0 14px;
      }
      .cs-room-cta {
        display: flex; align-items: center; justify-content: space-between;
        gap: 8px;
      }
      .cs-room-status {
        font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
        padding: 3px 8px; border-radius: 999px;
        background: rgba(201, 168, 76, 0.15); color: #c9a84c;
      }
      .cs-room-status.cs-soon {
        background: rgba(244, 236, 216, 0.08);
        color: rgba(244, 236, 216, 0.55);
      }
      .cs-room-status.cs-vip {
        background: rgba(122, 21, 37, 0.25);
        color: #e89090;
      }
      .cs-room-arrow {
        font-size: 18px; color: var(--accent, #c9a84c);
        transition: transform 180ms ease;
      }
      .cs-room-card:hover .cs-room-arrow {
        transform: translateX(4px);
      }
      .cs-room-card.cs-disabled {
        cursor: default;
      }
      .cs-room-card.cs-disabled:hover {
        transform: none;
      }
      .cs-toast {
        position: fixed; left: 50%; bottom: 32px;
        transform: translate(-50%, 120%);
        background: #1a1410; color: #f4ecd8;
        border: 1px solid rgba(201, 168, 76, 0.4);
        padding: 12px 22px; border-radius: 999px;
        font-size: 14px; font-family: inherit;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        z-index: 9100;
        transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .cs-toast.cs-show {
        transform: translate(-50%, 0);
      }
      @media (max-width: 600px) {
        .cs-modal-header { padding: 18px 18px 14px; }
        .cs-modal-body { padding: 16px 18px 22px; }
        .cs-rooms-grid { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(css);
  }

  // ─── Modal build (lazy, on first open) ───────────────────────
  let modalEl = null;

  function buildModal() {
    if (modalEl) return modalEl;

    const backdrop = document.createElement('div');
    backdrop.className = 'cs-modal-backdrop';
    backdrop.id = 'cs-concierge-modal';

    backdrop.innerHTML = `
      <div class="cs-modal" role="dialog" aria-modal="true" aria-labelledby="cs-modal-title">
        <div class="cs-modal-header">
          <div class="cs-modal-portrait" aria-hidden="true">L</div>
          <div class="cs-modal-title">
            <p class="cs-modal-greeting" id="cs-modal-title">Welcome \u2014 Laviche, your concierge</p>
            <p class="cs-modal-subgreeting">Where would you like to go this evening? Each room is its own atmosphere; tell me which calls you.</p>
          </div>
          <button class="cs-modal-close" type="button" aria-label="Close">\u2715</button>
        </div>
        <div class="cs-modal-body">
          <div class="cs-rooms-grid">
            ${ROOMS.map((r) => `
              <div class="cs-room-card ${r.featured ? 'cs-featured' : ''} ${r.status === 'soon' ? 'cs-disabled' : ''}"
                   style="--accent: ${r.themeColor};"
                   data-room-id="${r.id}"
                   data-room-status="${r.status}">
                <h3 class="cs-room-name">
                  <span>${r.name}</span>
                  ${r.featured ? '<span class="cs-room-status">Featured</span>' : ''}
                </h3>
                <p class="cs-room-tagline">${r.tagline}</p>
                <p class="cs-room-summary">${r.summary}</p>
                <div class="cs-room-cta">
                  <span class="cs-room-status ${r.status === 'soon' ? 'cs-soon' : ''} ${r.vipOnly ? 'cs-vip' : ''}">
                    ${r.vipOnly ? 'VIP Only' : r.status === 'soon' ? 'Opening Soon' : 'Open'}
                  </span>
                  <span class="cs-room-arrow">\u2192</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Click handlers
    backdrop.addEventListener('click', (e) => {
      // Click on backdrop (not modal itself) closes
      if (e.target === backdrop) closeDirectory();
    });
    backdrop.querySelector('.cs-modal-close').addEventListener('click', closeDirectory);
    backdrop.querySelectorAll('.cs-room-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-room-id');
        const status = card.getAttribute('data-room-status');
        const room = ROOMS.find((r) => r.id === id);
        if (status === 'open') {
          // Navigate to per-room scene
          window.location.href = `cs-${id}.html`;
        } else {
          showToast(`${room.name} is opening soon \u2014 we\u2019ll send you a note when it\u2019s ready.`);
        }
      });
    });

    document.body.appendChild(backdrop);
    modalEl = backdrop;
    return backdrop;
  }

  // ─── Open / close ────────────────────────────────────────────
  function openDirectory() {
    injectStyles();
    const m = buildModal();
    requestAnimationFrame(() => m.classList.add('cs-open'));
    // Pause player movement while modal is open so arrow keys don't
    // walk you off through walls. Tank-controls listens for this flag.
    window.__csModalOpen = true;
    document.addEventListener('keydown', escClose);
  }

  function closeDirectory() {
    if (!modalEl) return;
    modalEl.classList.remove('cs-open');
    window.__csModalOpen = false;
    document.removeEventListener('keydown', escClose);
  }

  function escClose(e) {
    if (e.key === 'Escape') closeDirectory();
  }

  // ─── Toast ───────────────────────────────────────────────────
  let toastTimer = null;
  function showToast(message) {
    let t = document.querySelector('.cs-toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'cs-toast';
      document.body.appendChild(t);
    }
    t.textContent = message;
    clearTimeout(toastTimer);
    requestAnimationFrame(() => t.classList.add('cs-show'));
    toastTimer = setTimeout(() => t.classList.remove('cs-show'), 3200);
  }

  // ─── Public API (for triggers from other scripts / debug) ────
  window.CSConcierge = {
    open: openDirectory,
    close: closeDirectory,
    rooms: ROOMS,
  };

  // ─── face-target component ───────────────────────────────────
  // Rotates an entity around Y axis to face another entity. Smoothed
  // for natural motion. Configurable flip in case the GLB's authored
  // forward vector doesn't match three.js convention.
  //
  // Schema:
  //   target: selector for the entity to face (default: #camera-rig)
  //   smooth: 0=instant catch-up, 1=never moves (default 0.08 = snappy)
  //   offsetY: extra rotation in DEGREES (default 0)
  //   flip: 1 = front faces -Z at rot 0 (three.js standard)
  //         -1 = front faces +Z at rot 0 (some authored GLBs)
  //         (default 1 — adjust per GLB if she shows her back)
  //
  // Usage:
  //   <a-entity face-target="target: #camera-rig; smooth: 0.92"></a-entity>
  if (window.AFRAME && !AFRAME.components['face-target']) {
    AFRAME.registerComponent('face-target', {
      schema: {
        target: { type: 'selector', default: '#camera-rig' },
        smooth: { type: 'number', default: 0.08 },
        offsetY: { type: 'number', default: 0 },
        flip:    { type: 'number', default: 1 },
      },
      _tmpV: null,
      _logCount: 0,
      init: function () {
        this._tmpV = new THREE.Vector3();
        this._logCount = 0;
      },
      tick: function () {
        if (!this.data.target) return;
        const me = this.el.object3D;

        // Use WORLD positions, not local. The camera-rig is at scene
        // root so its local == world, but Laviche could be nested
        // (root → cs-room-foyer → laviche), in which case `me.position`
        // is local. getWorldPosition resolves through parents.
        me.updateWorldMatrix(true, false);
        const myWorldX = me.matrixWorld.elements[12];
        const myWorldZ = me.matrixWorld.elements[14];
        const tgt = this.data.target.object3D;
        tgt.updateWorldMatrix(true, false);
        const tWorldX = tgt.matrixWorld.elements[12];
        const tWorldZ = tgt.matrixWorld.elements[14];

        const dx = tWorldX - myWorldX;
        const dz = tWorldZ - myWorldZ;

        // Compute desired y-rotation. Two conventions:
        //   flip = +1 → front faces -Z at rot 0 (three.js standard).
        //               atan2(dx, -dz) gives the rotation needed.
        //   flip = -1 → front faces +Z at rot 0.
        //               atan2(dx, dz) gives the rotation needed.
        let desired;
        if (this.data.flip > 0) {
          desired = Math.atan2(dx, -dz);
        } else {
          desired = Math.atan2(dx, dz);
        }
        desired += THREE.MathUtils.degToRad(this.data.offsetY);

        // Smooth interpolate (lerp on the unit circle, shortest path).
        const cur = me.rotation.y;
        let diff = desired - cur;
        while (diff >  Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        const next = cur + diff * (1 - this.data.smooth);

        // Apply via setAttribute so A-Frame's attribute system holds
        // the new rotation and doesn't overwrite it from the original
        // 'rotation: 0 0 0' attribute the next tick. setAttribute on
        // rotation also keeps the inspector / dev tools in sync.
        this.el.setAttribute('rotation', {
          x: THREE.MathUtils.radToDeg(me.rotation.x),
          y: THREE.MathUtils.radToDeg(next),
          z: THREE.MathUtils.radToDeg(me.rotation.z),
        });

        // Debug: log first 30 ticks to confirm component is alive
        // and see what direction we're computing.
        if (this._logCount < 5) {
          this._logCount++;
          console.log(
            `[face-target] me(${myWorldX.toFixed(2)},${myWorldZ.toFixed(2)}) ` +
            `tgt(${tWorldX.toFixed(2)},${tWorldZ.toFixed(2)}) ` +
            `dx=${dx.toFixed(2)} dz=${dz.toFixed(2)} ` +
            `flip=${this.data.flip} ` +
            `desired=${THREE.MathUtils.radToDeg(desired).toFixed(0)}° ` +
            `cur=${THREE.MathUtils.radToDeg(cur).toFixed(0)}°`
          );
        }
      },
    });
    console.log('[CSConcierge] face-target component registered');
  }

  // ─── Attach face-target to Laviche ───────────────────────────
  // Laviche is loaded by cafe-sativa-props.js as <a-entity> with
  // gltf-model. We find her after the GLB loads and attach the
  // face-target component so her body tracks the player.
  function attachLavicheFaceTarget() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    // Search for the Laviche GLB entity. cafe-sativa-props doesn't
    // give her a stable ID, so we match by gltf-model src.
    const all = scene.querySelectorAll('[gltf-model]');
    let laviche = null;
    all.forEach((el) => {
      const src = el.getAttribute('gltf-model');
      if (src && src.indexOf('concierge-laviche') !== -1) {
        laviche = el;
      }
    });

    if (!laviche) {
      console.log('[CSConcierge] Laviche GLB not yet in DOM, retrying...');
      setTimeout(attachLavicheFaceTarget, 500);
      return;
    }

    // Already has face-target? Don't double-attach.
    if (laviche.getAttribute('face-target')) {
      console.log('[CSConcierge] face-target already attached to Laviche');
      return;
    }

    // Attach. Smooth 0.92 means each frame moves 8% toward target
    // yaw — slow, dignified turn (matches Laviche's vibe).
    //
    // flip: -1 — empirically determined for THIS GLB. With the
    // standard three.js convention (flip:1, atan2(dx,-dz)) she
    // turned her BACK to the camera, meaning her authored forward
    // is +Z, not -Z. flip:-1 uses atan2(dx,dz) so her front
    // (the +Z side of the GLB) rotates toward the target.
    laviche.setAttribute('face-target', 'target: #camera-rig; smooth: 0.92; flip: -1');
    console.log('[CSConcierge] Laviche now tracks the player');
  }

  // ─── Floating speech bubble above Laviche ────────────────────
  // When player enters the foyer, show a CSS speech bubble anchored
  // to Laviche's screen position with her greeting line. Bubble has
  // a 'View directory' button (passive prompt — patron must opt in).
  // Auto-dismisses after 8s OR if the patron interacts.
  //
  // We use a screen-space DOM bubble (not a 3D text panel) for the
  // same reasons as the modal: readable, doesn't fight with scene
  // lighting, easy to style. Position is updated each frame via
  // project-from-3D-to-screen so it follows Laviche as the player
  // walks around her.
  let _bubbleEl = null;
  let _bubbleAnchorEl = null;
  let _bubbleTimer = null;

  function getLavicheEl() {
    const all = document.querySelectorAll('[gltf-model]');
    for (const el of all) {
      const src = el.getAttribute('gltf-model');
      if (src && src.indexOf('concierge-laviche') !== -1) return el;
    }
    return null;
  }

  function showLavicheBubble(message) {
    if (_bubbleEl) return;  // already showing
    _bubbleAnchorEl = getLavicheEl();
    if (!_bubbleAnchorEl) return;

    _bubbleEl = document.createElement('div');
    _bubbleEl.id = 'cs-laviche-bubble';
    _bubbleEl.innerHTML = `
      <div class="cs-bubble-name">Laviche · Concierge</div>
      <div class="cs-bubble-text">${message}</div>
      <div class="cs-bubble-actions">
        <button class="cs-bubble-btn" data-action="directory">View directory →</button>
        <button class="cs-bubble-dismiss" aria-label="Dismiss">×</button>
      </div>
      <div class="cs-bubble-tail"></div>
    `;
    document.body.appendChild(_bubbleEl);

    _bubbleEl.querySelector('[data-action="directory"]').addEventListener('click', () => {
      hideLavicheBubble();
      openDirectory();
    });
    _bubbleEl.querySelector('.cs-bubble-dismiss').addEventListener('click', hideLavicheBubble);

    // Auto-dismiss after 8s if untouched
    _bubbleTimer = setTimeout(hideLavicheBubble, 8000);

    // Position update loop — keep bubble anchored above Laviche
    const camEl = document.querySelector('a-camera, [camera]');
    if (!camEl) return;
    const camera = camEl.getObject3D('camera');
    if (!camera) return;

    const tmpVec = new THREE.Vector3();
    function updatePosition() {
      if (!_bubbleEl || !_bubbleAnchorEl) return;
      const obj = _bubbleAnchorEl.object3D;
      // Anchor ~2m above Laviche's base (over her head)
      tmpVec.setFromMatrixPosition(obj.matrixWorld);
      tmpVec.y += 2.0;
      tmpVec.project(camera);
      // Convert NDC to screen pixels
      const x = (tmpVec.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-tmpVec.y * 0.5 + 0.5) * window.innerHeight;
      // Hide if behind camera or off-screen
      const onScreen = tmpVec.z < 1 && x > 0 && x < window.innerWidth && y > 0 && y < window.innerHeight;
      _bubbleEl.style.display = onScreen ? 'block' : 'none';
      _bubbleEl.style.left = `${x}px`;
      _bubbleEl.style.top = `${y}px`;
      requestAnimationFrame(updatePosition);
    }
    updatePosition();
  }

  function hideLavicheBubble() {
    if (_bubbleTimer) { clearTimeout(_bubbleTimer); _bubbleTimer = null; }
    if (_bubbleEl) { _bubbleEl.remove(); _bubbleEl = null; }
    _bubbleAnchorEl = null;
  }

  // Inject bubble styles once
  function injectBubbleStyles() {
    if (document.getElementById('cs-bubble-styles')) return;
    const css = document.createElement('style');
    css.id = 'cs-bubble-styles';
    css.textContent = `
      #cs-laviche-bubble {
        position: fixed;
        transform: translate(-50%, -100%);
        background: linear-gradient(180deg, #1a1410 0%, #0c0805 100%);
        color: #f4ead5;
        border: 1px solid #c9a84c;
        border-radius: 12px;
        padding: 14px 18px 12px;
        max-width: 340px;
        min-width: 260px;
        font-family: 'Cinzel', 'Georgia', serif;
        box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 24px rgba(201,168,76,0.15);
        z-index: 1000;
        pointer-events: auto;
        animation: csBubbleIn 0.4s ease-out;
      }
      @keyframes csBubbleIn {
        from { opacity: 0; transform: translate(-50%, -85%); }
        to   { opacity: 1; transform: translate(-50%, -100%); }
      }
      #cs-laviche-bubble .cs-bubble-name {
        font-size: 11px; font-weight: 700; letter-spacing: 0.15em;
        text-transform: uppercase; color: #c9a84c; margin-bottom: 6px;
      }
      #cs-laviche-bubble .cs-bubble-text {
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px; line-height: 1.5; color: #f4ead5;
        margin-bottom: 12px;
      }
      #cs-laviche-bubble .cs-bubble-actions {
        display: flex; align-items: center; justify-content: space-between;
        gap: 8px;
      }
      #cs-laviche-bubble .cs-bubble-btn {
        background: #c9a84c; color: #1a1410; border: none;
        padding: 8px 14px; border-radius: 6px;
        font-family: system-ui, sans-serif; font-size: 13px; font-weight: 600;
        cursor: pointer; transition: background 0.2s;
      }
      #cs-laviche-bubble .cs-bubble-btn:hover { background: #d4b860; }
      #cs-laviche-bubble .cs-bubble-dismiss {
        background: transparent; color: #8a7a5a; border: none;
        font-size: 22px; cursor: pointer; padding: 0 6px; line-height: 1;
      }
      #cs-laviche-bubble .cs-bubble-dismiss:hover { color: #c9a84c; }
      #cs-laviche-bubble .cs-bubble-tail {
        position: absolute; bottom: -8px; left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 16px; height: 16px;
        background: #0c0805;
        border-right: 1px solid #c9a84c;
        border-bottom: 1px solid #c9a84c;
      }
      @media (max-width: 600px) {
        #cs-laviche-bubble { max-width: 80vw; min-width: 200px; padding: 12px 14px 10px; }
      }
    `;
    document.head.appendChild(css);
  }

  // ─── Make Laviche herself clickable ──────────────────────────
  // Player can tap her directly to open the directory — same as
  // tapping the floor ring. We add the 'clickable' class + click
  // handler after her GLB loads.
  function makeLavicheClickable() {
    const laviche = getLavicheEl();
    if (!laviche) {
      setTimeout(makeLavicheClickable, 500);
      return;
    }
    if (laviche.dataset.clickableAttached === '1') return;
    laviche.classList.add('clickable');
    laviche.addEventListener('click', () => {
      hideLavicheBubble();
      openDirectory();
    });
    laviche.dataset.clickableAttached = '1';
    console.log('[CSConcierge] Laviche is now tappable');
  }

  // ─── Greet on foyer entry (passive — bubble + chat, NOT modal) ─
  // When player enters the foyer footprint and dwells 1.2s, show
  // the speech bubble above Laviche with her greeting. Player must
  // opt in to the directory via:
  //   - tapping the bubble's 'View directory' button
  //   - tapping Laviche herself
  //   - tapping the floor ring
  //   - opening chat (chat is also populated with the greeting)
  let _greetFired = false;
  function greetOnFoyerEntry() {
    if (_greetFired) return;
    const rig = document.getElementById('camera-rig');
    if (!rig) {
      setTimeout(greetOnFoyerEntry, 500);
      return;
    }

    // Foyer footprint per cafe-sativa-wing.js: x=22..28, z=-24..-17
    const FOYER = { xMin: 22, xMax: 28, zMin: -24, zMax: -17 };
    const DWELL_MS = 1200;
    let dwellStart = null;

    const interval = setInterval(() => {
      if (_greetFired) {
        clearInterval(interval);
        return;
      }
      const p = rig.object3D.position;
      const inFoyer = p.x >= FOYER.xMin && p.x <= FOYER.xMax &&
                      p.z >= FOYER.zMin && p.z <= FOYER.zMax;
      if (inFoyer) {
        if (dwellStart === null) {
          dwellStart = Date.now();
        } else if (Date.now() - dwellStart >= DWELL_MS) {
          _greetFired = true;
          clearInterval(interval);
          console.log('[CSConcierge] foyer dwell met, showing speech bubble');
          // Pull the greeting line from the catalog so we stay in sync
          // with whatever GuideSystem.greetings['cafe-sativa-foyer'] says.
          let greeting = 'Welcome back, darling. How may I help you?';
          if (window.GuideSystem &&
              window.GuideSystem.greetings &&
              window.GuideSystem.greetings['cafe-sativa-foyer'] &&
              window.GuideSystem.greetings['cafe-sativa-foyer'].laviche) {
            greeting = window.GuideSystem.greetings['cafe-sativa-foyer'].laviche;
          }
          showLavicheBubble(greeting);
        }
      } else {
        dwellStart = null;
      }
    }, 200);
  }

  // ─── Boot ────────────────────────────────────────────────────
  function boot() {
    const scene = document.querySelector('a-scene');
    if (!scene) {
      document.addEventListener('DOMContentLoaded', boot, { once: true });
      return;
    }
    const go = () => {
      injectBubbleStyles();
      setTimeout(buildHotspot, 500);
      setTimeout(attachLavicheFaceTarget, 1500);
      setTimeout(makeLavicheClickable, 1500);
      setTimeout(greetOnFoyerEntry, 2000);
    };
    if (scene.hasLoaded) go();
    else scene.addEventListener('loaded', go);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
