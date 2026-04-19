/* ═══════════════════════════════════════════════════════════
   /api/config.js — Client config endpoint

   Serves public (non-secret) config values to the static mall
   front-end. The SUPABASE_ANON_KEY is safe to expose to the
   browser — that's what it's designed for. The URL and the anon
   key together only permit operations allowed by Row-Level
   Security policies on the Supabase project.

   Consumed via a <script src="/api/config.js"> tag in index.html
   which defines window.MALL_CONFIG.

   Env vars (set in Vercel):
     SUPABASE_URL            — same project as cafe-sativa.com
     SUPABASE_ANON_KEY       — public/anon key
     WEBSITE_URL             — optional; defaults to https://www.cafe-sativa.com
   ═══════════════════════════════════════════════════════════ */

module.exports = function handler(req, res) {
  const cfg = {
    supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey:
      process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    websiteUrl: process.env.WEBSITE_URL || 'https://www.cafe-sativa.com',
  };

  // Cache briefly at the edge; config changes infrequently.
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');

  // Emit a real JS file that assigns window.MALL_CONFIG.
  const body = 'window.MALL_CONFIG = ' + JSON.stringify(cfg) + ';';
  res.status(200).send(body);
};
