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
      status: 'soon',
      themeColor: '#c9a84c',
    },
    {
      id: 'main-lounge',
      name: 'Main Lounge',
      tagline: 'Where Conversations Find Their Rhythm',
      summary: 'The intimate performance lounge. Home of "At The Table" — Episode 1 of the Verse Alkemist sessions.',
      status: 'soon',
      themeColor: '#3a4a38',
      featured: true,
    },
    {
      id: 'smoke-lounge',
      name: 'Smoke Lounge',
      tagline: 'Contemplation, Elevated',
      summary: 'Plush deep-seated armchairs, soft amber glow, the scent of curated leaf. A sanctuary for the slow burn.',
      status: 'soon',
      themeColor: '#a06030',
    },
    {
      id: 'cigar',
      name: 'Cigar Lounge',
      tagline: 'Members\u2019 Quarters',
      summary: 'Oxblood leather, dark walnut, a wall of humidors. VIP membership required \u2014 a quiet room for private counsel.',
      status: 'soon',
      themeColor: '#7a1525',
      vipOnly: true,
    },
    {
      id: 'culinary',
      name: 'Culinary Theater',
      tagline: 'Gastronomy as Performance',
      summary: 'The kitchen-as-stage. Tiered velvet seating faces the chef\u2019s line. Ticketed tastings, broadcast live.',
      status: 'soon',
      themeColor: '#e8a050',
    },
    {
      id: 'courtyard',
      name: 'Courtyard',
      tagline: 'Open-Air Sanctuary',
      summary: 'Olive trees, warm stone pavers, a live fire pit, a strand of glowing lights overhead. The transition between rooms.',
      status: 'soon',
      themeColor: '#c0a878',
    },
    {
      id: 'cold-stoned',
      name: 'Cold Stoned',
      tagline: 'Artisan Frozen Indulgence',
      summary: 'Café Sativa\u2019s gelato pocket. Eight rotating flavors hand-folded daily; the chocolate is unholy.',
      status: 'soon',
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

  // ─── Boot ────────────────────────────────────────────────────
  function boot() {
    const scene = document.querySelector('a-scene');
    if (!scene) {
      document.addEventListener('DOMContentLoaded', boot, { once: true });
      return;
    }
    const go = () => setTimeout(buildHotspot, 500);
    if (scene.hasLoaded) go();
    else scene.addEventListener('loaded', go);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
