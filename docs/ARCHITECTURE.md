# Café Sativa Virtual Venue — Architecture

**Status:** Draft v1 — April 2026
**Target launch:** June 2026 (10-week plan from April 19)
**Owner:** Keith Ingram / Tru Skool Entertainment
**Scope of this document:** Everything needed to ship the inaugural "At The Table" episode in June as a paid event inside a functional 3D virtual venue, plus the schema and systems that keep working after launch.

---

## 1. Vision & product layers

Café Sativa is planned as three layers, phased over two years. This document covers only layer 1 in detail; layers 2 and 3 are noted so layer 1's schema choices don't paint us into a corner.

**Layer 1 — Virtual venue (April–June 2026, this doc).**
Members sign up at cafe-sativa.com, walk the 3D venue at mall.truskool.net, attend ticketed events in the Main Lounge, buy merch, browse the Gallery. Explorer tier free, Regular $9.99/mo, VIP $24.99/mo. Revenue from subscriptions, ticket sales, merch, and Gallery listing fees. Single inaugural event target: "At The Table" episode 1, June 2026.

**Layer 2 — Hybrid AI+human programming (late 2026).**
AI-hosted shows (Ginger, Laviche, Ahnika as guides and MCs), human guest episodes, persistent "always-on" Lounge presence where members hang out between events. Simli real-time avatars on the guide side, LiveKit for human-to-human.

**Layer 3 — Physical Tenerife venue (2027+).**
Real Café Sativa location, Canary Islands ZEC tax structure, J-1 sponsorship pipeline for operations staff. Virtual venue becomes the always-on companion to the physical space (remote attendance of physical events, gallery listings bridge to in-store retail).

Layer 1 is what pays for layer 2 and 3. The schema and APIs below are designed so layer 2 can drop in without a rewrite.

---

## 2. What ships in June 2026 — scope lock

### In scope
- Member auth (Supabase Auth on cafe-sativa.com, SSO to mall.truskool.net)
- Three paid tiers with Stripe subscriptions: Explorer (free), Regular ($9.99/mo), VIP ($24.99/mo)
- 10-room 3D venue (current v3 geometry — already shipped)
- Event listings, ticketing, and live attendance for a scheduled event
- Main Lounge mode-flip (Stage during events, Lounge otherwise)
- Live audio/video for events via LiveKit (speakers + attendees listen-only by default, optional Q&A mic)
- Gallery product listings with buy links (merch catalog)
- VIP-gated Cigar Lounge access (hard enforcement, not cosmetic)
- "At The Table" episode 1 as the inaugural paid event

### Out of scope for June
- Non-Lounge live events (Gallery openings, Bar DJ sets — all later)
- AI avatars in real-time (Simli, Hedra, etc. — layer 2)
- User-to-user voice chat in the always-on Lounge (layer 2)
- Gallery-as-marketplace for user listings (only brand merch at launch)
- Physical venue integration
- Event recordings library (can record to S3, playback UI is later)

### Explicitly deferred
- Unreal Engine premium tier (28-week roadmap, starts post-launch)
- Non-flagship brands (BiJaDi, H.O.E., etc.) inside the mall get no backend hookups yet — they're visual only

---

## 3. System components

```
┌────────────────────────────┐       ┌────────────────────────────┐
│  cafe-sativa.com           │       │  mall.truskool.net         │
│  (Next.js, Vercel)         │       │  (static A-Frame site)     │
│                            │       │                            │
│  - Marketing landing       │       │  - 3D venue walkthrough    │
│  - Signup / signin         │◄──────┤  - MallAuth reads session  │
│  - Billing (Stripe portal) │  SSO  │  - Event attendance UI     │
│  - Event listings          │       │  - LiveKit room join       │
│  - Merch + Gallery browse  │       │  - VIP gate enforcement    │
│  - Profile / tier mgmt     │       │  - Presence + chat         │
└────────────┬───────────────┘       └────────────┬───────────────┘
             │                                    │
             ▼                                    ▼
┌──────────────────────────────────────────────────────────────────┐
│  Supabase (project: cafe-sativa-prod / nwfxvhqbjtfvoopcadff)     │
│                                                                   │
│  - Auth (shared session across *.truskool.net + cafe-sativa.com)  │
│  - Postgres (schema defined §5)                                   │
│  - Realtime (presence, chat, room_state mode flips)               │
│  - Edge Functions (Stripe webhooks, ticket redemption, LK tokens) │
│  - Storage (event recordings, member avatars, gallery images)     │
└──┬────────────────┬──────────────────┬────────────────┬──────────┘
   │                │                  │                │
   ▼                ▼                  ▼                ▼
┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐
│  Stripe  │  │  LiveKit     │  │  Shopify /  │  │  Command    │
│          │  │  Cloud       │  │  Shipstation│  │  Center     │
│ Billing, │  │              │  │             │  │ (existing,  │
│ ticket   │  │ Audio/video  │  │ Merch fulf. │  │ admin app   │
│ checkout │  │ for events   │  │ (optional)  │  │ for ops)    │
└──────────┘  └──────────────┘  └─────────────┘  └─────────────┘
```

**Runtime surfaces:**
- `cafe-sativa.com` — Next.js on Vercel, public marketing + account + commerce
- `mall.truskool.net` — Static A-Frame on Vercel (current repo), 3D venue
- `command.truskool.net` — existing ops dashboard (Command Center). Gets new tabs for event runbook, live attendee dashboard, merch sales, membership stats
- Supabase `cafe-sativa-prod` — single source of truth for everything backend

**Why one Supabase project for everything:** cross-domain session sharing only works when both sites hit the same auth instance. Splitting would mean building a federation layer we don't have time for. The `dallasite-crm` project (`ugdaqdhthleyhvsubxis`) stays separate for lead/CRM data unrelated to the Café Sativa product.

---

## 4. `venue-config.json` — single source of truth for the venue

The current 3D geometry is hard-coded in `js/cafe-sativa-wing.js`. That's fine for the geometry itself. But membership tiers, event schedule, merch listings, and room metadata should not live in JS. They live in a versioned config file read at build time (for the static mall) and at request time (for the Next.js site).

**Location:** `shared/venue-config.json` (new package, consumed by both repos as a git submodule OR published to a private npm registry — TBD; git submodule is simpler).

**Schema:**

```json
{
  "version": "2026.06.01",
  "venue": {
    "slug": "cafe-sativa-virtual",
    "name": "Café Sativa",
    "tagline": "Sip · Smoke · Vibe",
    "launch_date": "2026-06-15T19:00:00-05:00"
  },

  "tiers": [
    {
      "id": "explorer",
      "name": "Explorer",
      "price_cents": 0,
      "stripe_price_id": null,
      "entitlements": ["venue_access", "gallery_view", "event_browse"]
    },
    {
      "id": "regular",
      "name": "Regular",
      "price_cents": 999,
      "stripe_price_id": "price_REGULAR_MONTHLY",
      "entitlements": [
        "venue_access", "gallery_view", "gallery_buy", "event_browse",
        "event_free_attendance", "event_recordings", "merch_discount_10"
      ]
    },
    {
      "id": "vip",
      "name": "VIP",
      "price_cents": 2499,
      "stripe_price_id": "price_VIP_MONTHLY",
      "entitlements": [
        "venue_access", "gallery_view", "gallery_buy", "event_browse",
        "event_free_attendance", "event_recordings", "merch_discount_20",
        "cigar_lounge_access", "priority_ticketing",
        "tenerife_priority_list"
      ]
    }
  ],

  "rooms": [
    {
      "id": "foyer",
      "label": "Entrance Foyer",
      "ceiling_m": 4,
      "capacity": 20,
      "modes": ["foyer"],
      "default_mode": "foyer",
      "tier_required": "explorer",
      "bounds": { "xMin": 23, "xMax": 27, "zMin": -21.5, "zMax": -18 }
    },
    {
      "id": "main-lounge",
      "label": "Main Lounge",
      "ceiling_m": 6,
      "capacity": 150,
      "modes": ["lounge", "stage"],
      "default_mode": "lounge",
      "tier_required": "explorer",
      "bounds": { "xMin": 17.5, "xMax": 32.5, "zMin": -46, "zMax": -37.5 }
    },
    {
      "id": "cigar",
      "label": "Cigar Lounge",
      "ceiling_m": 3,
      "capacity": 30,
      "modes": ["lounge"],
      "default_mode": "lounge",
      "tier_required": "vip",
      "bounds": { "xMin": 35.7, "xMax": 41.7, "zMin": -46, "zMax": -37.5 }
    }
    /* ...remaining 7 rooms... */
  ],

  "stripe": {
    "publishable_key_env": "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "webhook_secret_env": "STRIPE_WEBHOOK_SECRET",
    "customer_portal_url": "https://billing.stripe.com/p/login/..."
  },

  "livekit": {
    "url_env": "LIVEKIT_URL",
    "api_key_env": "LIVEKIT_API_KEY",
    "api_secret_env": "LIVEKIT_API_SECRET",
    "room_naming_pattern": "cs-event-{event_id}"
  }
}
```

**Consumers:**
- Mall renderer reads `rooms[].tier_required` to enforce VIP gates. Reads `rooms[].default_mode` and subscribes to Realtime updates on `room_state` table for live mode flips.
- Next.js site reads `tiers[]` to render the pricing page, compares against a user's active subscription to determine available entitlements.
- Command Center admin tools read this too so there's one place to update pricing.

**Versioning:** `version` string is the source-of-truth for cache-busting. Bumped whenever the file changes. Both apps watch it and refetch config when it changes.

---

## 5. Supabase schema

One schema to support the June launch plus layer-2 growth without a rewrite. RLS policies are inline on each table.

### 5.1 `profiles`

Mirrors Supabase Auth users with app-specific fields. Populated by a trigger on `auth.users` insert.

```sql
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  display_name text,
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null,
  -- Internal
  is_admin    boolean default false not null,
  is_staff    boolean default false not null  -- unlocks BOH staff-only area
);

alter table public.profiles enable row level security;

create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_admin_all" on public.profiles
  for all using ((select is_admin from public.profiles where id = auth.uid()));
```

### 5.2 `memberships`

Current subscription tier per user. Updated by Stripe webhook.

```sql
create type membership_tier as enum ('explorer', 'regular', 'vip');
create type membership_status as enum ('active', 'canceled', 'past_due', 'incomplete');

create table public.memberships (
  user_id              uuid primary key references public.profiles(id) on delete cascade,
  tier                 membership_tier not null default 'explorer',
  status               membership_status not null default 'active',
  stripe_customer_id   text unique,
  stripe_subscription_id text unique,
  current_period_end   timestamptz,
  created_at           timestamptz default now() not null,
  updated_at           timestamptz default now() not null
);

alter table public.memberships enable row level security;

create policy "memberships_self_read" on public.memberships
  for select using (auth.uid() = user_id);
-- No direct writes; all writes via Stripe webhook through service-role key
```

### 5.3 `events`

Scheduled events. "At The Table" episode 1 is row 1.

```sql
create type event_status as enum ('draft', 'scheduled', 'live', 'ended', 'canceled');

create table public.events (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  description     text,
  series          text,                  -- 'at-the-table', 'cipher-sessions', etc.
  room_id         text not null,         -- references venue-config rooms[].id
  starts_at       timestamptz not null,
  ends_at         timestamptz,           -- may be null while live (close on end_event)
  status          event_status not null default 'draft',
  -- Ticketing
  ticket_price_cents integer default 0 not null,
  stripe_product_id  text,
  stripe_price_id    text,
  capacity           integer,            -- null = unlimited
  free_for_tiers     membership_tier[] default '{}',  -- e.g. {regular, vip}
  -- LiveKit
  livekit_room_name  text,                -- set when event goes live
  -- Metadata
  hero_image_url     text,
  host_user_ids      uuid[] default '{}',  -- references profiles(id)
  created_at         timestamptz default now() not null,
  updated_at         timestamptz default now() not null
);

create index events_starts_at_idx on public.events (starts_at);
create index events_status_idx on public.events (status) where status in ('scheduled', 'live');

alter table public.events enable row level security;

create policy "events_public_read" on public.events
  for select using (status != 'draft' or auth.uid() in (select unnest(host_user_ids)));
-- Writes via admin only (service role)
```

### 5.4 `tickets`

A record of "user X has a ticket for event Y."

```sql
create type ticket_source as enum ('purchased', 'comp', 'tier_included');
create type ticket_state as enum ('valid', 'used', 'refunded');

create table public.tickets (
  id                uuid primary key default gen_random_uuid(),
  event_id          uuid not null references public.events(id) on delete cascade,
  user_id           uuid not null references public.profiles(id) on delete cascade,
  source            ticket_source not null,
  state             ticket_state not null default 'valid',
  stripe_payment_intent_id text,           -- null for comps and tier-included
  amount_paid_cents integer default 0 not null,
  redemption_code   text unique not null default encode(gen_random_bytes(6), 'hex'),
  redeemed_at       timestamptz,
  created_at        timestamptz default now() not null,
  unique (event_id, user_id)               -- one ticket per user per event
);

create index tickets_event_id_idx on public.tickets (event_id);
create index tickets_user_id_idx on public.tickets (user_id);

alter table public.tickets enable row level security;

create policy "tickets_self_read" on public.tickets
  for select using (auth.uid() = user_id);
-- Writes via Edge Functions (purchase handler, comp grant)
```

### 5.5 `room_state`

The live mode of each mode-switchable room. Watched via Realtime. Main Lounge's row flips between `lounge` and `stage` around events.

```sql
create table public.room_state (
  room_id       text primary key,        -- 'main-lounge', 'bar', etc.
  mode          text not null default 'default',
  active_event_id uuid references public.events(id),
  updated_at    timestamptz default now() not null,
  updated_by    uuid references public.profiles(id)
);

alter table public.room_state enable row level security;

create policy "room_state_public_read" on public.room_state
  for select using (true);
-- Writes by staff only (via Command Center or Edge Function)
create policy "room_state_staff_write" on public.room_state
  for all using ((select is_staff from public.profiles where id = auth.uid()));
```

### 5.6 `presence`

Who's in the venue right now and where. Updated client-side via Supabase Realtime Presence channels (no table insert needed); included here as a logical table for reference. Realtime Presence lives in-memory on the Supabase channel, not in Postgres.

Logical shape per presence entry:
```
{
  user_id: uuid,
  display_name: string,
  avatar_url: string | null,
  room_id: string,
  joined_at: timestamptz
}
```

### 5.7 `products` & `orders`

Minimal merch catalog for launch. Full Shopify integration is a later option; for June, products are a flat table with Stripe price IDs.

```sql
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  description     text,
  brand           text,                  -- 'cafe-sativa', 'tru-skool', etc.
  image_urls      text[] default '{}',
  price_cents     integer not null,
  stripe_price_id text,
  stock           integer,               -- null = unlimited/digital
  active          boolean default true not null,
  created_at      timestamptz default now() not null
);

alter table public.products enable row level security;
create policy "products_public_read" on public.products
  for select using (active = true);

create type order_status as enum ('pending', 'paid', 'fulfilled', 'canceled', 'refunded');

create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id),
  product_id        uuid not null references public.products(id),
  quantity          integer not null default 1,
  unit_price_cents  integer not null,    -- snapshot at time of order
  total_cents       integer not null,
  status            order_status not null default 'pending',
  stripe_session_id text unique,
  shipping_address  jsonb,
  created_at        timestamptz default now() not null,
  updated_at        timestamptz default now() not null
);

alter table public.orders enable row level security;
create policy "orders_self_read" on public.orders
  for select using (auth.uid() = user_id);
```

### 5.8 Helper views

```sql
-- Denormalized membership-with-profile for reads
create view public.members_v as
  select
    p.id, p.email, p.display_name, p.avatar_url,
    coalesce(m.tier, 'explorer'::membership_tier) as tier,
    coalesce(m.status, 'active'::membership_status) as status,
    m.current_period_end
  from public.profiles p
  left join public.memberships m on m.user_id = p.id;

-- Upcoming events a user has access to
create view public.my_events_v as
  select
    e.*,
    case
      when t.id is not null then 'ticketed'
      when e.ticket_price_cents = 0 then 'free'
      when (select tier from public.memberships where user_id = auth.uid()) = any(e.free_for_tiers) then 'tier_included'
      else 'purchase_required'
    end as access
  from public.events e
  left join public.tickets t on t.event_id = e.id and t.user_id = auth.uid() and t.state = 'valid'
  where e.status in ('scheduled', 'live')
  order by e.starts_at;
```

### 5.9 Seeds

Seed data for launch:

```sql
-- Seed the 10 rooms (room_state rows only; full metadata in venue-config.json)
insert into public.room_state (room_id, mode) values
  ('foyer', 'foyer'),
  ('gallery', 'gallery'),
  ('bar', 'bar'),
  ('main-lounge', 'lounge'),
  ('cold-stoned', 'cafe'),
  ('courtyard', 'courtyard'),
  ('cigar-airlock', 'airlock'),
  ('cigar', 'lounge'),
  ('boh', 'boh'),
  ('culinary', 'culinary')
on conflict (room_id) do nothing;

-- Seed the inaugural event
insert into public.events (
  slug, title, series, room_id,
  starts_at, status,
  ticket_price_cents, free_for_tiers,
  description
) values (
  'at-the-table-ep-1',
  'At The Table — Episode 1',
  'at-the-table',
  'main-lounge',
  '2026-06-15 19:00:00-05',           -- TBD, placeholder
  'scheduled',
  1500,                                  -- $15 general admission
  '{regular, vip}',
  'The inaugural At The Table episode. Intimate conversation over dinner.'
);
```

---

## 6. LiveKit integration

LiveKit handles the live audio/video for events. It sits alongside (not inside) the A-Frame mall.

### 6.1 Room lifecycle

1. **Staff creates event** in Command Center → `events` row in `scheduled` state.
2. **20 minutes before start** — LiveKit room is created via server API call (Supabase Edge Function). Room name = `cs-event-{event_id}`. Event row updated with `livekit_room_name`.
3. **Doors open 5 minutes before start** — `room_state` for `main-lounge` flipped to `stage`. Ticketed users see a "Take your seat" CTA in the mall UI.
4. **Attendee joins** — Mall client requests a LiveKit access token from an Edge Function (`/mint-lk-token`). The function verifies the user has a valid ticket and returns a signed token scoped to that room with role `listener` (unless the user is in `events.host_user_ids`, in which case `publisher`).
5. **Event goes live** — Host publishes audio/video. Staff flips event status to `live`.
6. **Q&A mic** — Explorer and Regular tickets are listener-only. A "Request to speak" UI allows attendees to raise hand; hosts approve, and that user is granted a temporary `publisher` token for 2 minutes via a second Edge Function.
7. **Event ends** — Staff clicks End in Command Center. Event status → `ended`. LiveKit room scheduled for destruction 5 minutes later. Recording (if enabled) uploaded to Supabase Storage. `main-lounge` room_state flips back to `lounge`.

### 6.2 Client-side mount point

Mall renderer adds an invisible DOM element near the Main Lounge stage area that holds the LiveKit `<audio>` / `<video>` elements when an event is live. Audio is spatialized using the `panner-component` in A-Frame — louder near the stage, softer at the back. Video renders on a plane placed at the stage wall, visible throughout Main Lounge.

### 6.3 Pricing check

LiveKit Cloud pricing at launch volume (~100 concurrent for one 90-min event): roughly $0.004/participant-minute, so 100 × 90 × $0.004 = **$36/event**. Fits on the Build plan (pay-as-you-go). Monthly floor is $0 if no events that month.

---

## 7. Stage/Lounge mode flip

Main Lounge has two modes. The geometry is identical; what changes is what's inside and who can do what.

### 7.1 Lounge mode (default, always-on)

- Scattered seating clusters, ambient music playing
- LiveKit room NOT active
- Anyone in venue can enter (Explorer tier minimum)
- Chat enabled, voice disabled (layer 2 feature)

### 7.2 Stage mode (during a scheduled event)

- Stage platform rendered (raised 0.3m, spotlit)
- Runway extends from stage into room (for "At The Table" long-table format)
- Seating rearranged as rows facing stage
- LiveKit room active, spatial audio live
- Access control: ticketed users only (valid ticket in `tickets` table for active event)

### 7.3 Flip mechanism

The flip is driven by the `room_state.mode` column for `main-lounge`. Client subscribes to Realtime updates on this table. When `mode` changes to `stage`:
1. Remove lounge furniture entities (scattered seats) from the Main Lounge a-entity group
2. Add stage furniture entities (platform, runway, rows of chairs, LiveKit video plane)
3. Activate LiveKit join flow
4. Update minimap room color to indicate live event

Reverse on mode change back to `lounge`.

Furniture entities are tagged `data-mode="lounge"` or `data-mode="stage"` in their render code; flip handler just hides/shows the matching group. No re-rendering of geometry needed.

### 7.4 Who triggers the flip

Manual by staff via Command Center (safer for launch) OR automatic via scheduled job 5 minutes before `events.starts_at` (post-launch once confident). Launch = manual.

---

## 8. Auth & cross-domain SSO

Goal: a user signs in once at cafe-sativa.com and is recognized automatically when they open mall.truskool.net.

### 8.1 Mechanism

Both sites point at the same Supabase project (`cafe-sativa-prod`). Supabase Auth sets a session cookie. The cookie domain is configured to `.truskool.net` so cafe-sativa.com (via `www.cafe-sativa.com`) CAN'T share cookies directly with mall.truskool.net — different root domains.

**Two viable options:**

- **Option A — Serve cafe-sativa.com under truskool.net.** e.g. `cafe.truskool.net` as the canonical domain, and `cafe-sativa.com` as a permanent redirect. Then both apps are on `*.truskool.net` and the Supabase cookie on `.truskool.net` shares cleanly.

- **Option B — Auth redirect flow.** Mall detects no session, redirects user to `https://cafe-sativa.com/auth/bridge?redirect=<mall_url>`. Bridge page reads local session, sets a short-lived token in a URL fragment, redirects back. Mall reads token, swaps for a Supabase session via `setSession()`. Works across arbitrary domains but adds a round-trip.

**Recommendation: Option A.** The marketing domain `cafe-sativa.com` still works (redirect), but the authenticated product lives on `cafe.truskool.net`. Keeps the architecture simple and avoids the bridge page. Current `js/supabase-client.js` already assumes cross-domain via cookies — Option A makes that actually true.

### 8.2 Guest flow (no account)

Explorer tier requires no signup for mall walkthrough. Users can explore the venue entirely anonymously. "Sign In" CTAs appear when they try to:
- Attend a ticketed event
- Enter the Cigar Lounge (VIP gate)
- Buy from Gallery / Cold Stoned
- Use chat (prevent anonymous spam)

Anonymous users get a client-generated UUID stored in `localStorage` for presence; it's discarded if they later sign in (session migrates to real user_id).

---

## 9. Ticketing flow

### 9.1 Free events / tier-included attendance

User browses events → clicks Attend → server creates a `tickets` row with `source = 'tier_included'`, `amount_paid_cents = 0`. Idempotent on `(event_id, user_id)` unique constraint.

### 9.2 Paid events — Explorer tier

1. User clicks **Buy Ticket — $15**
2. Client calls `/edge/create-checkout-session` with `event_id`
3. Edge Function creates Stripe Checkout session, stores `session_id` in a pending `tickets` row (state stays `valid` but ticket is unusable until payment)
4. User completes checkout on Stripe
5. Stripe webhook → `/edge/stripe-webhook` with `checkout.session.completed`
6. Webhook validates signature, marks the ticket `valid`, sets `stripe_payment_intent_id`, sends confirmation email

### 9.3 Paid events — Regular/VIP free attendance

Tier includes event attendance. On click-Attend, Edge Function checks membership tier ∈ `events.free_for_tiers` and inserts `tickets` row with `source = 'tier_included'`, no Stripe.

### 9.4 Redemption

At event time, mall client checks `tickets` table for `{event_id: X, user_id: me, state: 'valid'}`. If found, LiveKit token minted and user is admitted to stage mode. Ticket state flips to `used` on join. Reuse OK within same event (they can leave and rejoin), but `used` state is used for analytics.

### 9.5 Refunds

Stripe webhook handles `charge.refunded`. Updates `tickets.state` to `refunded`. Future attendance denied. Refund window = 24h before event start.

---

## 10. "At The Table" — inaugural episode runbook

Bolted on later if you want a dedicated ops doc. For now:

### 10.1 Format

- 90 minutes
- Main Lounge in Stage mode
- One host + 3-5 seated guests at a long runway-table format (stage extends as a table runway into the room)
- Attendees watch from arranged seating facing the runway
- Q&A in final 20 min via raise-hand
- Recorded; published to Transistor + YouTube (Off the Map podcast network)

### 10.2 Tech run-of-show

- T-60 min: Staff verifies Main Lounge geometry, tests LiveKit room
- T-30 min: Host + guests do tech check in the LiveKit room
- T-20 min: `events.livekit_room_name` populated, Edge Function confirms room ready
- T-5 min: Staff flips `main-lounge.room_state.mode` → `stage`. "Doors open" UI appears for ticket holders.
- T-0: Host starts LiveKit stream, event status → `live`
- T+85 min: Host wraps, final 5 min of Q&A ends
- T+90 min: Staff clicks End. Recording uploads. `room_state.mode` → `lounge`.
- T+120 min: Email to attendees with recording link (if applicable)

### 10.3 Unknowns for this specific event

- **Who is the inaugural guest / format partner?** (Not specified yet. Could be Keith solo, could be a real-world guest, could be AI-hosted with Laviche.)
- **Date certain?** Doc assumes June 15 2026 as placeholder; needs lock-in for marketing runway.
- **Music bed during lounge mode?** Needs licensed track or original score.

Flagged in Open Questions §13.

---

## 11. 10-week build plan

Anchored to a June 15 launch. Weeks are calendar weeks starting Monday.

| Week | Dates | Goals | Key deliverables |
|---|---|---|---|
| 1 | Apr 20–26 | Architecture doc (this), Supabase schema, venue-config.json | Schema migration applied, config file published, this doc reviewed and signed off |
| 2 | Apr 27–May 3 | Auth + SSO, domain swap to cafe.truskool.net | Sign-in works from both surfaces, cookie propagation verified |
| 3 | May 4–10 | Stripe subscriptions, tier enforcement, VIP gate at Cigar | Can upgrade Explorer → Regular → VIP, Cigar Lounge blocks non-VIP |
| 4 | May 11–17 | Furniture pass 1 — spine (Foyer, Gallery, Bar, Main Lounge lounge-mode) | Rooms feel inhabited in always-on mode |
| 5 | May 18–24 | Main Lounge stage-mode geometry + mode-flip plumbing | Flip works end-to-end from Command Center button |
| 6 | May 25–31 | LiveKit integration, token minting, audio/video in stage mode | Test event: staff publishes, test attendee listens |
| 7 | Jun 1–7 | Ticketing — Stripe Checkout, webhook, redemption | Can buy a ticket, redemption admits to stage mode |
| 8 | Jun 8–14 | Furniture pass 2 — east/west branches (Cold Stoned, Cigar, Courtyard, Culinary), Gallery product listings | Merch appears, rooms styled |
| 9 | Jun 15 | **LAUNCH: At The Table Episode 1.** All hands. | Live event runs successfully |
| 10 | Jun 16–21 | Post-launch polish: recording playback, stability fixes, member feedback | Punch-list done, ready for Episode 2 planning |

**Critical path:** Weeks 1 (schema) → 2 (auth) → 6 (LiveKit) → 7 (tickets) → 9 (launch). If auth slips past week 2, everything after cascades. Buffer: weeks 4 and 8 (furniture) can compress if needed — rooms can look 80% at launch.

**Risks (ranked):**
1. **LiveKit integration timing.** First time we're wiring it. Budget week 6 fully, and plan a contingency week 7 if token flow turns out to be finicky.
2. **Cross-domain SSO.** Option A (cafe.truskool.net) is simple but requires DNS and Vercel domain swap. If that runs into issues, fallback to Option B (bridge page).
3. **Stripe webhook reliability.** Test with `stripe trigger` extensively in week 3. Idempotency matters.
4. **Event recording + playback.** If week 9 recording fails, acceptable — Episode 2 can include Ep 1 recap. Don't block launch on this.

---

## 12. Out of scope for this document (covered elsewhere)

- Furniture specifications for each room (separate PR per area, weeks 4 & 8)
- Unreal Engine premium tier architecture (separate doc, starts post-launch)
- Non-flagship brand backends (BiJaDi, H.O.E., Faithfully Faded, etc.) — these live on their own Supabase projects when they need them
- Physical Tenerife operations, J-1 sponsorship flow, ZEC structure
- AI agent orchestration (Ginger, Laviche, Ahnika) — Railway lives separately
- Podcast pipeline (Jellypod, Transistor, YouTube) — existing infrastructure

---

## 13. Open questions

I've made calls on everything needed to start executing. These are the decisions that aren't mine to make:

1. **Domain swap.** Option A (cafe.truskool.net as authenticated canonical, cafe-sativa.com as redirect) vs. Option B (bridge flow). My rec: A. Your call.

2. **Inaugural event — who + when.** Doc uses June 15 2026 placeholder. Need a real date to run marketing. Need to know: you solo, real guest, or AI-hosted with Laviche?

3. **Merch fulfillment.** Stripe-only (digital-first, no shipping) vs. Shopify integration for physical goods (adds ~1 week). For launch I recommend digital/lightweight only (downloadable tracks, digital art prints, subscription upgrades) and defer physical merch until the Tenerife run launches.

4. **Ticket price for At The Table Ep 1.** Doc has $15 placeholder. Options: free-for-all as a launch giveaway, $15 Explorer (free for Regular+/VIP), $25 to feel premium. My rec: free for Regular/VIP tier (gets people to sign up in advance), $15 for Explorer (low-enough barrier for the event-curious).

5. **Recording policy.** Is the event recording included with the ticket, or only available to Regular/VIP tiers? Doc's venue-config has `event_recordings` as a Regular+ entitlement. Confirm.

6. **Music license.** Ambient music in Lounge mode needs licensing. Options: your own Verse Alkemist tracks (free, self-licensed, narratively consistent), or a third-party jazz library. Rec: Verse Alkemist.

7. **BOH access.** Doc has `is_staff` flag. Who gets it at launch? Just you? Add Diana? Nicoleta?

8. **Cigar Lounge enforcement strictness.** Full collision block (VIP can enter, others physically can't walk through the velvet rope)? Or softer — non-VIP can peek in but an overlay appears saying "VIP required"? My rec: soft for launch (accessibility + discovery), hard gate on interactive elements (can't use the humidor menu, can't chat with the attendant). People who want to upgrade will.

Send me your answers on these eight and I'll fold them into a v1.1 of this doc. For items where you just want my rec, say "go with rec" and I'll lock them.

---

## 14. What happens after this doc is approved

1. Apply schema migration to `cafe-sativa-prod` (Supabase) — 15 min
2. Create `shared/venue-config.json` repo — 30 min
3. Wire both mall.truskool.net and cafe-sativa.com to read from it — 1-2 days
4. Start week 2 (auth + SSO)

Week 1 tasks are mostly this doc + schema. Once you approve, I can apply the schema TODAY, which puts us technically one day ahead.
