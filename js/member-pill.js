/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Member Pill (top-bar auth widget)

   Shows one of three states in the top nav:
   1. Loading  — subtle spinner while Supabase client hydrates
   2. Guest    — "Sign In" link to cafe-sativa.com/auth/signin
   3. Member   — email + tier badge + "Sign Out"

   Depends on: MallAuth (js/supabase-client.js)
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const PILL_ID = 'mall-member-pill';

  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'style') Object.assign(e.style, attrs[k]);
        else if (k === 'onclick') e.addEventListener('click', attrs[k]);
        else e.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach((c) => {
        if (typeof c === 'string') e.appendChild(document.createTextNode(c));
        else if (c) e.appendChild(c);
      });
    }
    return e;
  }

  function mountPill() {
    // Remove any previous pill
    const prev = document.getElementById(PILL_ID);
    if (prev) prev.remove();

    const pill = el('div', {
      id: PILL_ID,
      style: {
        position: 'fixed',
        top: '10px',
        right: '14px',
        zIndex: 10000,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        background: 'rgba(20, 16, 10, 0.85)',
        color: '#f5e6d3',
        border: '1px solid rgba(201, 169, 97, 0.35)',
        borderRadius: '999px',
        padding: '6px 14px',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'opacity 0.2s ease',
      },
    });
    document.body.appendChild(pill);
    return pill;
  }

  function renderLoading(pill) {
    pill.innerHTML = '';
    pill.appendChild(el('span', { style: { opacity: '0.6' } }, '…'));
  }

  function renderGuest(pill) {
    pill.innerHTML = '';
    const link = el(
      'a',
      {
        href: window.MallAuth.signInUrl(window.location.href),
        style: {
          color: '#c9a961',
          textDecoration: 'none',
          fontWeight: '500',
        },
      },
      'Sign In'
    );
    pill.appendChild(link);
  }

  function renderMember(pill, user, membership) {
    pill.innerHTML = '';

    // Tier dot color. VIP = primary amber; Regular = muted amber;
    // Explorer = dim cream. Matches the cafe-sativa palette.
    const tierColor = {
      vip: '#c29355',      // primary — matches website tokens
      regular: '#8B6F3E',  // muted amber
      explorer: 'rgba(245, 230, 211, 0.4)',
    }[membership.tier] || 'rgba(245,230,211,0.4)';

    pill.appendChild(el('span', {
      style: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: tierColor,
        display: 'inline-block',
      },
    }));

    // Email (truncated)
    const emailText = user.email || 'Member';
    const shortEmail = emailText.length > 22
      ? emailText.slice(0, 20) + '…'
      : emailText;
    pill.appendChild(el('span', { style: { opacity: '0.85' } }, shortEmail));

    // Tier label — only show for paid tiers (VIP, Regular).
    // Explorer is the default so we don't brag about it.
    if (membership.active && (membership.tier === 'vip' || membership.tier === 'regular')) {
      const tierLabel = membership.tier === 'vip' ? 'VIP' : 'REGULAR';
      pill.appendChild(el('span', {
        style: {
          fontSize: '10px',
          letterSpacing: '0.08em',
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid ' + tierColor,
          color: tierColor,
        },
      }, tierLabel));
    }

    // Sign out
    const out = el('a', {
      href: '#',
      style: {
        color: '#f5e6d3',
        opacity: '0.6',
        textDecoration: 'none',
        marginLeft: '4px',
        cursor: 'pointer',
      },
      onclick: async (e) => {
        e.preventDefault();
        await window.MallAuth.signOut();
        refresh();
      },
    }, 'Sign out');
    pill.appendChild(out);
  }

  async function refresh() {
    if (!window.MallAuth) return;
    const pill = mountPill();
    renderLoading(pill);

    await window.MallAuth.init();
    const user = await window.MallAuth.getCurrentUser();

    if (!user) {
      renderGuest(pill);
      return;
    }

    const membership = await window.MallAuth.getMembership();
    renderMember(pill, user, membership);
  }

  // Expose globally so membership-gated rooms can query
  window.MallMemberPill = { refresh };

  // Initial render on ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refresh);
  } else {
    refresh();
  }

  // Re-render when auth state changes elsewhere
  window.addEventListener('mall-auth-change', refresh);
})();
