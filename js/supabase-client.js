/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Supabase Identity Bridge

   Shares auth with cafe-sativa.com via the same Supabase
   project (ref: nwfxvhqbjtfvoopcadff / cafe-sativa-prod).

   Flow:
   - Both apps use NEXT_PUBLIC_SUPABASE_URL + ANON_KEY pointing
     at the same project.
   - Supabase Auth session cookies are domain-scoped. If the
     Supabase project is configured to set cookies on
     ".truskool.net" (root domain), a user who signs in on
     cafe-sativa.com is transparently recognized on
     mall.truskool.net.
   - If the user is NOT signed in, the "Sign In" UI link sends
     them to cafe-sativa.com/auth/signin?redirect=<mall-url>.
     After auth, cafe-sativa.com redirects them back to the
     mall.

   Config injection (static site):
   - Vercel build exposes env as window.MALL_CONFIG via a small
     inline script injected by index.html just before this module
     loads. See index.html <script id="mall-config">.

   API surface (all on window.MallAuth):
   - init()              Load the Supabase JS client from CDN.
   - getCurrentUser()    → Promise<User | null>
   - getMembership()     → Promise<{ tier: 'explorer'|'regular'|'vip', active: bool }>
   - signInUrl(returnTo) → string (link to website's signin)
   - signOut()           → Promise
   - isReady()           → bool
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.56.0/dist/umd/supabase.js';

  // cafe-sativa.com base URL — where signin/membership/etc. live.
  // Override at build time via window.MALL_CONFIG.websiteUrl if needed.
  const DEFAULT_WEBSITE = 'https://www.cafe-sativa.com';

  const MallAuth = {
    _client: null,
    _ready: false,
    _loading: null,
    _user: null,

    // Lazy-load Supabase JS once
    init: function () {
      if (this._loading) return this._loading;

      this._loading = new Promise((resolve) => {
        // Read config from injected window.MALL_CONFIG
        const cfg = window.MALL_CONFIG || {};
        const url = cfg.supabaseUrl || '';
        const key = cfg.supabaseAnonKey || '';

        if (!url || !key) {
          console.warn('[MallAuth] Supabase config missing. Set MALL_CONFIG.supabaseUrl and supabaseAnonKey. Running in anonymous mode.');
          this._ready = true; // ready, but no client
          resolve(false);
          return;
        }

        // Inject Supabase UMD bundle
        const existing = document.querySelector('script[data-mall-supabase]');
        if (existing && window.supabase) {
          this._initClient(url, key, resolve);
          return;
        }

        const s = document.createElement('script');
        s.src = SUPABASE_CDN;
        s.async = true;
        s.defer = true;
        s.setAttribute('data-mall-supabase', '1');
        s.onload = () => this._initClient(url, key, resolve);
        s.onerror = () => {
          console.error('[MallAuth] Failed to load Supabase JS from CDN.');
          this._ready = true;
          resolve(false);
        };
        document.head.appendChild(s);
      });

      return this._loading;
    },

    _initClient: function (url, key, resolve) {
      try {
        this._client = window.supabase.createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
        this._ready = true;
        console.log('[MallAuth] Supabase client ready.');

        // Listen for auth state changes so the UI pill updates in real time
        this._client.auth.onAuthStateChange((event, session) => {
          this._user = session ? session.user : null;
          window.dispatchEvent(new CustomEvent('mall-auth-change', {
            detail: { user: this._user, event: event }
          }));
        });

        resolve(true);
      } catch (err) {
        console.error('[MallAuth] Supabase client init failed:', err);
        this._ready = true;
        resolve(false);
      }
    },

    isReady: function () {
      return this._ready;
    },

    getCurrentUser: async function () {
      if (!this._ready) await this.init();
      if (!this._client) return null;
      try {
        const { data, error } = await this._client.auth.getUser();
        if (error || !data || !data.user) return null;
        this._user = data.user;
        return data.user;
      } catch (err) {
        console.warn('[MallAuth] getCurrentUser failed:', err);
        return null;
      }
    },

    // Reads memberships table. Falls back to 'explorer' on any error
    // so the UI never breaks when the backend schema isn't fully set
    // up yet. Tier values mirror the cafe-sativa.com canonical enum:
    // 'explorer' (default/free), 'regular' (paid tier 1), 'vip'
    // (paid tier 2). Only status='active' memberships count — a
    // past_due / canceled / incomplete row falls back to 'explorer'.
    getMembership: async function () {
      if (!this._ready) await this.init();
      if (!this._client) return { tier: 'explorer', active: false };
      try {
        const user = await this.getCurrentUser();
        if (!user) return { tier: 'explorer', active: false };

        // public.memberships (user_id uuid, tier membership_tier,
        // status membership_status, ...) — 'active' is what counts
        // as a real subscription.
        const { data, error } = await this._client
          .from('memberships')
          .select('tier, status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.debug('[MallAuth] memberships query returned error (table may not exist yet):', error.message);
          return { tier: 'explorer', active: false };
        }
        if (!data) return { tier: 'explorer', active: false };

        const isActive = data.status === 'active';
        // If the subscription isn't active, treat them as explorer
        // regardless of what the row says the tier is.
        const effectiveTier = isActive && data.tier ? data.tier : 'explorer';
        return { tier: effectiveTier, active: isActive };
      } catch (err) {
        console.warn('[MallAuth] getMembership failed:', err);
        return { tier: 'explorer', active: false };
      }
    },

    signInUrl: function (returnTo) {
      const cfg = window.MALL_CONFIG || {};
      const site = cfg.websiteUrl || DEFAULT_WEBSITE;
      const ret = returnTo || (typeof window !== 'undefined' ? window.location.href : '');
      const q = ret ? ('?redirect=' + encodeURIComponent(ret)) : '';
      return site.replace(/\/$/, '') + '/auth/signin' + q;
    },

    signOut: async function () {
      if (!this._client) return;
      try {
        await this._client.auth.signOut();
      } catch (err) {
        console.warn('[MallAuth] signOut failed:', err);
      }
    },
  };

  window.MallAuth = MallAuth;

  // Auto-init on DOM ready so the UI pill appears quickly
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MallAuth.init());
  } else {
    MallAuth.init();
  }
})();
