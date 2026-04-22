/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — VIP Gate (Cigar Lounge)

   Gates the Cigar Airlock (and by extension the Cigar Lounge)
   to VIP members only. Non-VIP members get bounced back with
   a friendly upgrade overlay.

   How it works
   ────────────
   - A-Frame component `vip-gate` attaches to the camera-rig
     (same entity that has `mall-nav`).
   - Each tick it compares the rig position against a virtual
     tripwire at the west edge of the Cigar Airlock (x ≈ 32.5,
     with a 2.5m z-range around the door at z=-43.75).
   - When the user crosses into the trigger zone:
       * If cached tier === 'vip' → allow through (no-op).
       * Else → push position back outside the zone, then show
         the gate overlay on screen.
   - The overlay is plain HTML rendered over the A-Frame canvas.
     It does NOT pause the scene — movement still works, the user
     can walk away and close the overlay.

   Tier resolution
   ───────────────
   - Lazy: first tick that hits the trigger zone, we ask
     MallAuth.getMembership() and cache the result in memory.
   - Cache lifetime: 5 minutes. If the user upgrades in another
     tab, the cache expires and they'll get through next approach.
   - If MallAuth isn't ready / is offline, fail CLOSED (treat as
     non-VIP). Better to show a gate once to a legitimate VIP
     than to let the whole lounge be open if our auth layer is
     broken.

   Visual language
   ───────────────
   - Existing velvet rope (from cafe-sativa-wing.js line 348) gives
     a physical signal at the airlock door. The overlay is the
     harder stop.

   Dependencies
   ────────────
   - Loads AFTER js/mall-nav.js and js/supabase-client.js
   - Does NOT depend on member-pill (independent query path)
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (typeof AFRAME === 'undefined') return;

  // ─── Gate geometry ──────────────────────────────────────────────────
  // The cigar airlock is the room between the Main Lounge and the
  // Cigar Lounge proper. Its west door is at x=-43.75 on the east wall
  // of Main Lounge (z coord: -43.75). From cafe-sativa-wing.js:
  //   Cigar Airlock: xMin:32.5 xMax:35.7 zMin:-44.5 zMax:-43
  //   Cigar Lounge:  xMin:35.7 xMax:41.7 zMin:-46 zMax:-37.5
  //
  // Trigger: any x >= 32.3 within the z range of the airlock door.
  // We use 32.3 (not 32.5) so we catch the user *at* the door lip.
  // The push-back x is 32.1 so they clearly bounce off.
  const TRIGGER_X = 32.3;
  const PUSHBACK_X = 32.0;
  const TRIGGER_Z_MIN = -45.0;
  const TRIGGER_Z_MAX = -42.5;

  // Cache lifetime for the tier check (ms)
  const CACHE_TTL_MS = 5 * 60 * 1000;

  // Shared module state — one gate per page
  const state = {
    tierCache: null,       // { tier, active, fetchedAt }
    overlayOpen: false,
    fetchInFlight: null,   // debounce concurrent checks
    triggeredOnce: false,  // stop spamming the overlay
  };

  // ─── Tier resolution ────────────────────────────────────────────────
  function tierCacheFresh() {
    return (
      state.tierCache &&
      Date.now() - state.tierCache.fetchedAt < CACHE_TTL_MS
    );
  }

  function invalidateTierCache() {
    state.tierCache = null;
  }

  // Re-check tier on auth state changes (sign-in from another tab,
  // sign-out, membership upgrade in the checkout flow, etc.)
  window.addEventListener('mall-auth-change', invalidateTierCache);

  async function resolveTier() {
    if (tierCacheFresh()) return state.tierCache;

    // Coalesce parallel calls so a fast-moving user doesn't spawn
    // duplicate requests while crossing the tripwire.
    if (state.fetchInFlight) return state.fetchInFlight;

    state.fetchInFlight = (async () => {
      try {
        if (!window.MallAuth) {
          // Auth bridge not loaded — fail closed.
          return { tier: 'explorer', active: false, fetchedAt: Date.now() };
        }
        await window.MallAuth.init();
        const m = await window.MallAuth.getMembership();
        const result = {
          tier: m.tier || 'explorer',
          active: Boolean(m.active),
          fetchedAt: Date.now(),
        };
        state.tierCache = result;
        return result;
      } catch (err) {
        console.warn('[VipGate] tier resolution failed, failing closed', err);
        return { tier: 'explorer', active: false, fetchedAt: Date.now() };
      } finally {
        state.fetchInFlight = null;
      }
    })();

    return state.fetchInFlight;
  }

  // ─── Overlay UI ─────────────────────────────────────────────────────
  const OVERLAY_ID = 'vip-gate-overlay';

  function buildOverlay(user) {
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '20000',
      background: 'rgba(10, 6, 4, 0.88)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f1e5d1',
      animation: 'vipFadeIn 0.25s ease-out',
    });

    // Keyframes (inject once)
    if (!document.getElementById('vip-gate-style')) {
      const style = document.createElement('style');
      style.id = 'vip-gate-style';
      style.textContent = `
        @keyframes vipFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes vipSlideIn { from { transform: translateY(16px); opacity: 0 } to { transform: none; opacity: 1 } }
      `;
      document.head.appendChild(style);
    }

    const card = document.createElement('div');
    Object.assign(card.style, {
      maxWidth: '460px',
      width: 'calc(100% - 32px)',
      background: '#1a0f08',
      border: '1px solid rgba(194, 147, 85, 0.4)',
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
      animation: 'vipSlideIn 0.3s cubic-bezier(.2,.9,.3,1.4)',
    });
    overlay.appendChild(card);

    // Crown icon (inline SVG so no lucide dependency here)
    card.insertAdjacentHTML('beforeend', `
      <div style="width:56px;height:56px;border-radius:50%;background:rgba(194,147,85,0.1);border:1px solid rgba(194,147,85,0.4);display:flex;align-items:center;justify-content:center;margin:0 auto 20px">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c29355" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
          <path d="M5 21h14"/>
        </svg>
      </div>
    `);

    // Title
    const title = document.createElement('h2');
    title.textContent = 'VIP only past this point.';
    Object.assign(title.style, {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '28px',
      fontWeight: '700',
      margin: '0 0 12px',
      lineHeight: '1.2',
    });
    card.appendChild(title);

    // Subtitle
    const sub = document.createElement('p');
    sub.textContent =
      'The Cigar Lounge is our VIP members\u2019 space — master blender sessions, private tastings, and the good chairs.';
    Object.assign(sub.style, {
      fontSize: '15px',
      lineHeight: '1.6',
      color: '#b8a589',
      margin: '0 0 24px',
    });
    card.appendChild(sub);

    // Primary CTA — differs based on whether user is signed in
    const cfg = window.MALL_CONFIG || {};
    const websiteUrl = (cfg.websiteUrl || 'https://www.cafe-sativa.com').replace(/\/$/, '');
    const primary = document.createElement('a');

    if (!user) {
      // Anonymous — send to signin with intent=vip so after signin
      // they land on /membership ready to upgrade.
      primary.href =
        websiteUrl +
        '/auth/signin?redirect=' +
        encodeURIComponent('/membership?intent=vip');
      primary.textContent = 'Sign in and upgrade';
    } else {
      // Signed in but not VIP — send straight to membership with
      // intent=vip so the upgrade auto-resumes.
      primary.href = websiteUrl + '/membership?intent=vip';
      primary.textContent = 'Upgrade to VIP';
    }
    primary.target = '_top';
    Object.assign(primary.style, {
      display: 'inline-block',
      background: '#c29355',
      color: '#0a0604',
      fontWeight: '600',
      fontSize: '15px',
      textDecoration: 'none',
      padding: '12px 28px',
      borderRadius: '10px',
      marginBottom: '10px',
    });
    card.appendChild(primary);

    // Secondary: dismiss
    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.textContent = 'Not right now';
    Object.assign(dismiss.style, {
      display: 'block',
      background: 'transparent',
      border: 'none',
      color: '#8a7a68',
      fontSize: '13px',
      cursor: 'pointer',
      margin: '8px auto 0',
      padding: '8px',
    });
    dismiss.addEventListener('click', closeOverlay);
    card.appendChild(dismiss);

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });

    // Close on Escape
    const escHandler = (e) => {
      if (e.key === 'Escape') closeOverlay();
    };
    document.addEventListener('keydown', escHandler);
    overlay.dataset.escHandler = '1';
    overlay._escHandler = escHandler;

    return overlay;
  }

  function openOverlay(user) {
    if (state.overlayOpen) return;
    const overlay = buildOverlay(user);
    document.body.appendChild(overlay);
    state.overlayOpen = true;

    // Release pointer lock if A-Frame grabbed it — so the user can
    // actually click the CTA. A-Frame's look-controls will grab it
    // back when the user resumes movement.
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  function closeOverlay() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;
    if (overlay._escHandler) {
      document.removeEventListener('keydown', overlay._escHandler);
    }
    overlay.remove();
    state.overlayOpen = false;
    // Allow re-trigger next time the user approaches (unless they
    // walked away — then triggeredOnce resets naturally).
  }

  // ─── A-Frame component ──────────────────────────────────────────────
  AFRAME.registerComponent('vip-gate', {
    init: function () {
      console.log('[VipGate] Cigar Lounge gate armed.');
    },

    tick: function () {
      const pos = this.el.object3D.position;
      const insideZ = pos.z >= TRIGGER_Z_MIN && pos.z <= TRIGGER_Z_MAX;
      const insideX = pos.x >= TRIGGER_X;

      if (!insideZ) {
        // Walked away from the airlock — allow re-trigger next time
        state.triggeredOnce = false;
        return;
      }

      if (!insideX) return;
      if (state.triggeredOnce) return; // already bounced this approach

      // Try to use cached tier synchronously — zero-lag for VIPs
      // who have walked past before.
      if (tierCacheFresh() && state.tierCache.tier === 'vip') {
        return; // allow through
      }

      // Non-VIP (or cache stale): bounce them back + start a check.
      // Push back is instant — the user's next tick will clamp to
      // PUSHBACK_X, they literally can't step through.
      pos.x = PUSHBACK_X;
      state.triggeredOnce = true;

      resolveTier().then((result) => {
        if (result.tier === 'vip' && result.active) {
          // Oh, they ARE VIP — cache was cold. Unmark so they can
          // walk through next step without seeing the overlay.
          state.triggeredOnce = false;
          // Don't show the overlay
          return;
        }

        // Not VIP — show the gate. Pass the user so the CTA can
        // branch on "sign in" vs "upgrade".
        (async () => {
          const user = window.MallAuth
            ? await window.MallAuth.getCurrentUser()
            : null;
          openOverlay(user);
        })();
      });
    },
  });

  // Expose for manual trigger / testing:
  //   window.VipGate.test() → forces overlay open
  //   window.VipGate.clearCache() → force re-fetch on next approach
  window.VipGate = {
    test: () => {
      (async () => {
        const user = window.MallAuth
          ? await window.MallAuth.getCurrentUser()
          : null;
        openOverlay(user);
      })();
    },
    clearCache: invalidateTierCache,
    close: closeOverlay,
  };
})();
