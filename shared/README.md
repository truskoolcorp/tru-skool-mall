# `shared/venue-config.json` — Single source of truth

This file is the canonical description of the Café Sativa virtual venue:
tiers, rooms, hosts, Stripe wiring, event platform, rate limits, memory
policy. Both product surfaces read from it.

## Who consumes this

| Surface | How it reads the config |
|---|---|
| **mall.truskool.net** (this repo) | `fetch('/shared/venue-config.json')` at runtime. Cached in-memory after first load. |
| **cafe-sativa.com** (separate repo) | Build-time `fetch('https://mall.truskool.net/shared/venue-config.json')` — copies into `public/venue-config.json`. Or use the sync script (see below). |
| **Command Center** (existing ops app) | Reads via Supabase Edge Function wrapper that adds auth + caching. |
| **Railway agent orchestrator** | Loads at startup, polls for version changes every 5 minutes. |

## Why not put it in Supabase?

Rooms, tiers, and host persona metadata change rarely (maybe monthly). Putting
them in Postgres adds a round-trip to every page render for data that's
effectively static, and forces a mental split between "config-like data in
the DB" and "transactional data in the DB." This way, anything that changes
per-user (subscriptions, tickets, chat history) lives in Supabase; anything
that's shared across all users lives in this JSON.

## Versioning

`version` is a date-string following `YYYY.MM.DD` (with optional `.N` suffix
for same-day revisions, e.g. `2026.06.01.2`). Bump it every time you edit
the file. Both apps watch this field and invalidate their caches on change.

`updated_at` is a full ISO-8601 timestamp for human-readable diffs.

## Editing safely

1. Room bounds in `rooms[].bounds` **must match** the world-space geometry
   rendered by `js/cafe-sativa-wing.js`. If you change bounds here, update
   the render. If you change the render, update here. They should never
   drift. The `tools/audit-wing.js` script validates room bounds; extend
   it to cross-check against this file when both change together.

2. Stripe price IDs (`price_REGULAR_MONTHLY`, `price_VIP_MONTHLY`) are
   placeholders until real prices are created in Stripe Dashboard. Don't
   deploy them to prod; the website should fail loudly if it tries to
   checkout with a placeholder ID rather than silently succeeding.

3. Adding a room: bump `version`, add full entry with bounds + ceiling
   height + capacity + host assignment + tier_required. Also add a
   `room_state` row in Supabase (via migration — see `docs/migrations/`).

4. Adding a tier: bump `version`, add entry with unique `id`, `price_cents`
   and matching Stripe product + price. Also update the `membership_tier`
   enum in Supabase — requires a migration since enums can't grow via
   RLS-safe DML alone.

5. Adding a host: bump `version`, add entry with `rooms[]` list, agent
   endpoint, and persona summary. The Railway orchestrator needs a
   matching route.

## Sync script (optional)

For cafe-sativa.com to pick up new versions without manual copy-paste:

```bash
#!/usr/bin/env bash
# cafe-sativa/scripts/sync-venue-config.sh
set -euo pipefail

URL="https://mall.truskool.net/shared/venue-config.json"
OUT="public/venue-config.json"

curl -sfSL "$URL" > "$OUT.tmp"
# Validate it's JSON
python3 -c "import json, sys; json.load(open('$OUT.tmp'))"
mv "$OUT.tmp" "$OUT"
echo "Synced venue-config.json ($(python3 -c "import json; print(json.load(open('$OUT'))['version'])"))"
```

Call this from `npm run prebuild` so every `vercel deploy` picks up the
latest config. For now it's manual — the file is small and doesn't change
often enough to be worth a cron.

## Split later?

The architecture doc (`docs/ARCHITECTURE.md` §12) flags this file as
"in mall repo for now, split later." When to split:

- When non-flagship brands start consuming it (BiJaDi, H.O.E., etc. have
  their own rooms and hosts)
- When there's more than one web property editing it simultaneously
- When publish-to-consumers latency matters (publishing via CDN instead
  of raw GitHub fetch)

Until any of those things are true, keeping it in the mall repo is the
cheapest option that works.
