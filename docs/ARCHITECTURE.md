# Café Sativa Virtual Venue — Architecture

**Status:** v1.1 — April 2026 (supersedes v1)
**Target launch:** June 2026 — "At The Table" Episode 1 live event
**Owner:** Keith Ingram / Tru Skool Entertainment
**Repo:** github.com/truskoolcorp/tru-skool-mall (3D) + existing cafe-sativa.com Next.js repo
**Supabase project:** cafe-sativa-prod (ref `nwfxvhqbjtfvoopcadff`)

---

## 0. Changes from v1

This version incorporates three structural decisions made after v1 circulated:

- **Dual-surface product model.** The 2D site at cafe-sativa.com is the primary interface; the 3D mall at mall.truskool.net is a digital twin rendering the same data. Not "3D with a marketing site attached." Most customers use 2D; the 3D layer is value-add for those who want immersion.
- **Hosts ARE concierge.** The Railway-based AI agents (Laviche, Ginger, Ahnika, Echo, Anya) are the customer-facing concierge layer. No separate "concierge feature" to build. Same agents serve both surfaces with a single backend, with cross-surface memory (last 30 days, context-triggered only).
- **Cost-and-scope cuts.** Target $0 fixed monthly cost at launch. Zoom for Episode 1 instead of LiveKit native integration. Five routes instead of ten. Five tables that ship in week 1 instead of nine. Lovable dropped; stay on existing Next.js.

---

## 1. Product model

Café Sativa is a **digital hospitality platform with two rendering surfaces** sitting on one shared backend:

- **cafe-sativa.com** — Next.js on Vercel. Primary interface. Brand discovery, subscriptions, event tickets, host chat, account management. This is where 90%+ of users will enter the product.
- **mall.truskool.net** — A-Frame 3D venue. The same data rendered as walkable space. Hosts appear as avatars, events happen in rooms, membership gates physical access. This is the premium/immersive layer for users who want it.

Both surfaces:
- Authenticate against the same Supabase project
- Render room state, event state, and membership state from the same tables
- Route chat to the same agent orchestrator
- Take actions (reservations, ticket purchases, tier upgrades) that write to the same database

**Principle: the 3D mall never has data the 2D site doesn't have.** Anything Laviche says in the 3D Bar should be sayable at `/ask` on cafe-sativa.com. Anything you can buy in the 3D Cold Stoned should be buyable at `/shop`. The 3D layer is UX, not a separate product.

### Three-layer business context

Documented only so layer-1 schema doesn't paint layer-2 into a corner:

- **Layer 1 (this document):** Virtual venue. April-June 2026. Revenue from subscriptions + event tickets + merch.
- **Layer 2 (late 2026):** Persistent always-on presence. User-to-user voice, real-time avatar concierge, recurring programming. Requires more LiveKit investment and real-time avatar (Simli) integration.
- **Layer 3 (2027+):** Physical Tenerife venue. Virtual becomes the companion to physical (remote attendance, Gallery → in-store bridge).

---

## 2. June 2026 scope — what ships, what doesn't

### In scope

**On cafe-sativa.com (2D):**
- `/` — Homepage with hero, "enter the venue" CTA, three pillars (Sip/Smoke/Vibe), upcoming event teaser, membership teaser
- `/membership` — Three tiers (Explorer free, Regular $9.99/mo, VIP $24.99/mo), Stripe Checkout to upgrade
- `/events` — List of upcoming events + individual event pages with Stripe Checkout
- `/account` — Logged-in user's dashboard (subscription status, ticket history, Stripe Customer Portal link)
- `/ask` — Chat with Laviche (default host), same agent that appears in the 3D Bar
- `/experiences` — Single page describing all zones with a "walk the venue" CTA linking to mall.truskool.net

**On mall.truskool.net (3D):**
- Current v3 geometry (already shipped)
- Furniture pass 1 for the spine (Foyer, Gallery, Bar, Main Lounge default mode)
- Hosts render as avatars in their assigned rooms, clicking them opens chat
- VIP gate enforcement at Cigar Lounge (hard block)
- Cross-domain auth recognizes membership tier
- Merch appears as browsable items in Cold Stoned / Gallery (checkout bounces to 2D)

**Shared backend:**
- Auth (Supabase), single session recognized by both surfaces
- Stripe subscriptions (monthly billing) + one-time ticket purchases
- Agent orchestrator (existing Railway service) exposed via HTTP to both surfaces
- Event: "At The Table" Episode 1 on **June 15, 2026, 7:00 PM CDT** (placeholder — needs confirmation)

### Out of scope for June

- **Native LiveKit integration.** Ep 1 uses Zoom. LiveKit gets re-evaluated for Ep 2 based on what Ep 1 teaches us.
- **Stage/Lounge mode flip in 3D.** Deferred. Ep 1 is on Zoom, nobody's in the 3D Main Lounge during the event, so the flip doesn't matter yet.
- **Real-time avatar concierge** (Simli, animated Hedra portraits). Text chat only at launch. Avatars come in layer 2.
- **User-to-user voice chat** in the always-on Lounge.
- **Full merch fulfillment** (Shopify, Shipstation, physical shipping). Digital goods and subscription-bundled items only at launch.
- **Gallery marketplace** (users listing their own art). Only Tru Skool / Café Sativa / Verse Alkemist products at launch.
- **Admin dashboard features beyond what Command Center already has.**
- **Journal / Partners / Investors pages.** All deferred to post-launch (likely July).

### Deferred post-launch
- Unreal Engine premium tier
- Non-flagship brand backends (BiJaDi, H.O.E., Faithfully Faded etc.) — visual-only in the mall for now
- Physical Tenerife operations

---

## 3. System components

```
┌──────────────────────────────────┐     ┌──────────────────────────────────┐
│  cafe-sativa.com (Next.js)       │     │  mall.truskool.net (A-Frame)     │
│  PRIMARY SURFACE                 │     │  DIGITAL TWIN                    │
│                                  │     │                                  │
│  Routes:                         │     │  - 3D venue (v3 geometry)        │
│  /                               │     │  - Same host chat as /ask        │
│  /events + /events/[slug]        │◄────┤  - Same ticket list as /events   │
│  /membership                     │ SSO │  - Same merch as /shop           │
│  /account                        │     │  - VIP gate checks memberships   │
│  /ask  (chat with hosts)         │     │  - Minimap, teleport, presence   │
│  /experiences                    │     │                                  │
└─────────┬────────────────────────┘     └─────────┬────────────────────────┘
          │                                        │
          │       ┌───────────────────────┐        │
          ├──────►│  Agent Orchestrator   │◄───────┤
          │       │  (existing, Railway)  │        │
          │       │  MiniMAX M2.7 +       │        │
          │       │  persona routing      │        │
          │       └───────────┬───────────┘        │
          │                   │                    │
          ▼                   ▼                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Supabase (cafe-sativa-prod / nwfxvhqbjtfvoopcadff)                        │
│                                                                             │
│  Auth · Postgres · Realtime · Edge Functions · Storage                     │
│                                                                             │
│  Tables (June launch, see §5):                                             │
│    profiles, memberships, events, tickets, room_state,                     │
│    host_conversations, host_messages                                       │
│                                                                             │
│  Shared session cookies via auth bridge (see §7) — user signs in once,     │
│  recognized on both surfaces.                                              │
└──┬────────────────────────────────────┬────────────────────────────────────┘
   │                                    │
   ▼                                    ▼
┌────────────────┐              ┌────────────────┐
│  Stripe        │              │  Zoom          │
│                │              │                │
│  Subscriptions │              │  Ep 1 live     │
│  Ticket        │              │  event hosting │
│  checkout      │              │  (replace with │
│                │              │  LiveKit for   │
│                │              │  Ep 2+ if worth│
│                │              │  the work)     │
└────────────────┘              └────────────────┘
```

**Runtime costs at launch:**
- Vercel hobby tier: $0
- Supabase free tier: $0 (under 50k MAU)
- Stripe: $0 monthly, 2.9% + $0.30 per transaction
- Zoom: $0 if using existing account, $15/mo Pro if needed
- Resend (transactional email): $0 (3k emails/mo free tier)
- Agent orchestrator on Railway: existing, no new cost
- MiniMAX M2.7 API: variable, small compared to revenue

**Total fixed monthly cost: $0.** Only variable costs are Stripe fees on actual sales and LLM usage on actual chats.

---

## 4. `venue-config.json` — single source of truth for the venue

Shared config file consumed by both surfaces as a git submodule at `shared/venue-config.json`. Versioned independently so either app can ship without breaking the other.

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
      "entitlements": ["venue_access", "host_chat", "event_browse"]
    },
    {
      "id": "regular",
      "name": "Regular",
      "price_cents": 999,
      "stripe_price_id": "price_REGULAR_MONTHLY",
      "entitlements": [
        "venue_access", "host_chat", "event_browse",
        "event_free_attendance", "event_recordings",
        "merch_discount_10", "reserved_host_memory_90_days"
      ]
    },
    {
      "id": "vip",
      "name": "VIP",
      "price_cents": 2499,
      "stripe_price_id": "price_VIP_MONTHLY",
      "entitlements": [
        "venue_access", "host_chat", "event_browse",
        "event_free_attendance", "event_recordings",
        "merch_discount_20", "cigar_lounge_access",
        "priority_ticketing", "tenerife_priority_list",
        "reserved_host_memory_365_days"
      ]
    }
  ],

  "rooms": [
    {
      "id": "foyer",
      "label": "Entrance Foyer",
      "ceiling_m": 4,
      "capacity": 20,
      "host": "laviche",
      "tier_required": "explorer",
      "bounds": { "xMin": 23, "xMax": 27, "zMin": -21.5, "zMax": -18 }
    },
    {
      "id": "main-lounge",
      "label": "Main Lounge",
      "ceiling_m": 6,
      "capacity": 150,
      "host": "laviche",
      "tier_required": "explorer",
      "bounds": { "xMin": 17.5, "xMax": 32.5, "zMin": -46, "zMax": -37.5 }
    },
    {
      "id": "cigar",
      "label": "Cigar Lounge",
      "ceiling_m": 3,
      "capacity": 30,
      "host": "laviche",
      "tier_required": "vip",
      "bounds": { "xMin": 35.7, "xMax": 41.7, "zMin": -46, "zMax": -37.5 }
    }
    /* ...remaining 7 rooms — same shape... */
  ],

  "hosts": {
    "laviche": {
      "display_name": "Laviche Cárdenas",
      "rooms": ["foyer", "gallery", "bar", "main-lounge", "cigar", "cigar-airlock", "cold-stoned", "courtyard"],
      "default_on": ["/ask", "/"],
      "agent_endpoint": "https://agents.truskool.net/laviche"
    },
    "ginger": {
      "display_name": "Ginger Pelirroja",
      "rooms": ["wanderlust"],
      "default_on": [],
      "agent_endpoint": "https://agents.truskool.net/ginger"
    },
    "ahnika": {
      "display_name": "Ahnika Merlot",
      "rooms": ["faithfully-faded", "hoe"],
      "default_on": [],
      "agent_endpoint": "https://agents.truskool.net/ahnika"
    }
  },

  "stripe": {
    "publishable_key_env": "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "webhook_secret_env": "STRIPE_WEBHOOK_SECRET",
    "customer_portal_url": "https://billing.stripe.com/p/login/..."
  }
}
```

LiveKit config is intentionally not in the v1.1 config — Ep 1 uses Zoom, and LiveKit config gets added when we commit to it.

---

## 5. Supabase schema — the June 7 tables

Seven tables that ship in week 1. Everything else (products, orders, journal_posts, partner_applications) added post-launch when actually needed.

### 5.1 `profiles`

```sql
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text,
  avatar_url    text,
  is_admin      boolean default false not null,
  is_staff      boolean default false not null,   -- unlocks BOH + command center ops
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_admin_all" on public.profiles
  for all using ((select is_admin from public.profiles where id = auth.uid()));

-- Trigger: create profile on new auth.users insert
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 5.2 `memberships`

```sql
create type membership_tier as enum ('explorer', 'regular', 'vip');
create type membership_status as enum ('active', 'canceled', 'past_due', 'incomplete');

create table public.memberships (
  user_id                uuid primary key references public.profiles(id) on delete cascade,
  tier                   membership_tier not null default 'explorer',
  status                 membership_status not null default 'active',
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  current_period_end     timestamptz,
  created_at             timestamptz default now() not null,
  updated_at             timestamptz default now() not null
);

alter table public.memberships enable row level security;
create policy "memberships_self_read" on public.memberships
  for select using (auth.uid() = user_id);
-- Writes: Stripe webhook via service role only
```

### 5.3 `events`

```sql
create type event_status as enum ('draft', 'scheduled', 'live', 'ended', 'canceled');

create table public.events (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  title               text not null,
  description         text,
  series              text,
  room_id             text not null,
  starts_at           timestamptz not null,
  ends_at             timestamptz,
  status              event_status not null default 'draft',
  ticket_price_cents  integer default 0 not null,
  stripe_product_id   text,
  stripe_price_id     text,
  capacity            integer,
  free_for_tiers      membership_tier[] default '{}',
  -- Event hosting
  zoom_join_url       text,           -- set close to event time
  zoom_meeting_id     text,
  -- Post-event
  recording_url       text,
  -- Metadata
  hero_image_url      text,
  host_user_ids       uuid[] default '{}',
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

create index events_starts_at_idx on public.events (starts_at);
create index events_status_idx on public.events (status) where status in ('scheduled', 'live');

alter table public.events enable row level security;
create policy "events_public_read" on public.events
  for select using (status != 'draft' or auth.uid() in (select unnest(host_user_ids)));
```

### 5.4 `tickets`

```sql
create type ticket_source as enum ('purchased', 'comp', 'tier_included');
create type ticket_state as enum ('pending', 'valid', 'used', 'refunded');

create table public.tickets (
  id                        uuid primary key default gen_random_uuid(),
  event_id                  uuid not null references public.events(id) on delete cascade,
  user_id                   uuid not null references public.profiles(id) on delete cascade,
  source                    ticket_source not null,
  state                     ticket_state not null default 'pending',
  stripe_payment_intent_id  text,
  amount_paid_cents         integer default 0 not null,
  redemption_code           text unique not null default encode(gen_random_bytes(6), 'hex'),
  redeemed_at               timestamptz,
  created_at                timestamptz default now() not null,
  unique (event_id, user_id)
);

create index tickets_event_id_idx on public.tickets (event_id);
create index tickets_user_id_idx on public.tickets (user_id);

alter table public.tickets enable row level security;
create policy "tickets_self_read" on public.tickets
  for select using (auth.uid() = user_id);
```

### 5.5 `room_state`

```sql
create table public.room_state (
  room_id          text primary key,
  mode             text not null default 'default',
  active_event_id  uuid references public.events(id),
  updated_at       timestamptz default now() not null,
  updated_by       uuid references public.profiles(id)
);

alter table public.room_state enable row level security;
create policy "room_state_public_read" on public.room_state
  for select using (true);
create policy "room_state_staff_write" on public.room_state
  for all using ((select is_staff from public.profiles where id = auth.uid()));
```

### 5.6 `host_conversations` and `host_messages`

The core of the agent-native concierge. Same tables serve chat happening on `/ask`, in the 3D Bar, or anywhere else.

```sql
create table public.host_conversations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles(id) on delete cascade,
  session_id     text,                    -- for anonymous users (client-generated UUID)
  host_agent     text not null,           -- 'laviche', 'ginger', 'ahnika', etc.
  surface        text not null,           -- 'mall-3d', 'web-chat', 'email'
  room_id        text,                    -- null if not in 3D
  started_at     timestamptz default now() not null,
  ended_at       timestamptz,
  message_count  integer default 0,
  last_intent    text                     -- 'reserve', 'recommend', 'upgrade', 'support', 'browse'
);

create index host_conv_user_idx on public.host_conversations (user_id, started_at desc);
create index host_conv_session_idx on public.host_conversations (session_id, started_at desc);

create table public.host_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.host_conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant', 'system')),
  content         text not null,
  action_taken    text,                    -- 'reservation_created', 'ticket_purchased', etc.
  action_ref_id   uuid,                    -- FK to reservations/tickets/etc. if applicable
  created_at      timestamptz default now() not null
);

create index host_msg_conv_idx on public.host_messages (conversation_id, created_at);

alter table public.host_conversations enable row level security;
alter table public.host_messages enable row level security;

-- Users see their own conversations + messages
create policy "conv_self_read" on public.host_conversations
  for select using (auth.uid() = user_id);
create policy "msg_self_read" on public.host_messages
  for select using (
    conversation_id in (select id from public.host_conversations where user_id = auth.uid())
  );

-- Anonymous session access: client passes session_id header, Edge Function
-- validates and returns conversations matching that session_id
-- (no RLS policy needed — Edge Function uses service role)
```

**Cross-surface memory rule (enforced in the agent prompt, not the DB):**
- Regular tier: agent has access to user's last 90 days of `host_messages` as context
- VIP tier: agent has access to last 365 days
- Explorer tier: agent sees current conversation only (no cross-session memory)
- Memory is **never surfaced unprompted** — the agent only references it when the user's current message is contextually relevant. "You mentioned liking jazz last time; the Friday trio would fit" ✓. "I see you didn't finish checkout" ✗.

### 5.7 Seeds

```sql
-- Room state for all 10 wing rooms
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

-- Inaugural event
insert into public.events (
  slug, title, series, room_id, starts_at, status,
  ticket_price_cents, free_for_tiers, description
) values (
  'at-the-table-ep-1',
  'At The Table — Episode 1',
  'at-the-table',
  'main-lounge',
  '2026-06-15 19:00:00-05',
  'scheduled',
  1500,
  '{regular, vip}',
  'The inaugural At The Table episode. Intimate conversation over dinner.'
)
on conflict (slug) do nothing;
```

---

## 6. Agent-native concierge architecture

The concierge is the existing Railway-based agent orchestrator, exposed to both surfaces via HTTP.

### 6.1 Agent routing

The `venue-config.json` `hosts` object maps which agent responds where:

| Context | Agent | Notes |
|---|---|---|
| 3D rooms: foyer, gallery, bar, main-lounge, cigar, cigar-airlock, cold-stoned, courtyard | Laviche | Default Café Sativa host |
| 3D room: wanderlust | Ginger | Travel-focused persona |
| 3D rooms: faithfully-faded, hoe | Ahnika | Style/merch-focused persona |
| `/ask` on cafe-sativa.com (default) | Laviche | Site-specific default |
| `/ask?host=ginger` or `/ask?host=ahnika` | (as specified) | User can pick |

### 6.2 Message flow

```
User (2D or 3D surface)
      │
      │ POST /api/host/chat { conversation_id?, message, context }
      ▼
Edge Function: mint-agent-call
      │
      │ 1. Create or resume host_conversations row
      │ 2. Insert user's host_messages row
      │ 3. Fetch user membership tier → memory window (0, 90, or 365 days)
      │ 4. Fetch last N host_messages in this conversation
      │ 5. Fetch last N host_messages from other conversations (within memory window)
      │ 6. Build agent prompt with persona + memory + context + user message
      │ 7. Forward to Railway agent orchestrator
      │
      ▼
Agent orchestrator (existing Railway service)
      │
      │ - Routes to correct persona
      │ - Calls MiniMAX M2.7 with prompt
      │ - Parses response for structured action intents
      │
      ▼
Edge Function receives response
      │
      │ 1. Insert assistant's host_messages row
      │ 2. If response contains a structured action (reserve, buy_ticket, etc.)
      │    → execute through appropriate table write (see §6.3)
      │    → set host_messages.action_taken and action_ref_id
      │ 3. Return response to client
      │
      ▼
Client renders message (text bubble or avatar speech)
```

### 6.3 Actions agents can take

Agents get a small, safe set of direct-write capabilities. Authorization enforced in the Edge Function, not the agent:

**Allowed:**
- Create a ticket for a free event or tier-included event (if user qualifies)
- Generate a Stripe Checkout URL for a paid event or tier upgrade (doesn't complete the purchase — just creates the session)
- Flag a support case (creates a pending row the user can review and confirm)

**Not allowed:**
- Grant comp tickets unilaterally (staff-only flag required; agent can request, staff approves via Command Center)
- Change membership tier directly (must route through Stripe)
- Refund charges
- Delete data
- Send email on behalf of user

### 6.4 Rate limiting

Cost controls — prevents a runaway bot from running up MiniMAX API bills:

- Unauthenticated sessions: 10 messages per session per hour, 30 per day
- Explorer tier users: 50 messages per day
- Regular tier: 200 messages per day
- VIP tier: unlimited (soft cap at 1000 for abuse detection)

Enforced in the `mint-agent-call` Edge Function before forwarding to the orchestrator. Hitting the limit returns a polite "Let's pick this up tomorrow" message, not a 429.

### 6.5 The existing Railway orchestrator — what changes

Currently the orchestrator is called internally by Command Center and by scheduled jobs. It needs one new change: an HTTP endpoint per agent, callable from Supabase Edge Functions with a shared secret for auth.

Ballpark: 1-2 days of work to add `/agents/laviche/chat`, `/agents/ginger/chat`, `/agents/ahnika/chat` endpoints that take a message + prompt context and return a response. The agent persona logic and MiniMAX wiring already exist.

---

## 7. Auth & cross-domain SSO

Target: zero infra cost, minimum complexity.

### 7.1 Recommended: auth bridge flow

User signs in on cafe-sativa.com (Supabase Auth, standard email/password + magic link). Session cookie is scoped to cafe-sativa.com (can't be read by mall.truskool.net — different root domains).

When the user visits mall.truskool.net:
1. Client checks for a Supabase session (none, because different domain)
2. If the URL has `?bridge=1&token=<short-lived-token>`, client calls `supabase.auth.setSession(token)` and the session is now active on this domain too
3. Otherwise, if user clicks "Sign In" from the mall, they get redirected to `cafe-sativa.com/bridge?return=<mall-url>`
4. Bridge page on cafe-sativa.com: if user has a session, generates a one-time token (5-minute TTL) via Edge Function, redirects back to `mall.truskool.net?bridge=1&token=<token>`. If user doesn't have a session, shows login UI first, then bridges.

Two redirects, no DNS work, no custom domain coordination, zero recurring cost. Slightly clunkier UX than same-domain cookies but works immediately.

### 7.2 Alternative (deferred): same-domain via cafe.truskool.net

Serve cafe-sativa.com's content under `cafe.truskool.net` as well. Supabase cookies on `.truskool.net` share between `cafe.truskool.net` and `mall.truskool.net` automatically — no bridge needed.

Not doing this at launch because: (a) DNS + Vercel domain swap is additional work, (b) cafe-sativa.com the domain is a brand asset worth keeping as primary, (c) redirect from cafe-sativa.com → cafe.truskool.net adds its own UX friction.

Revisit post-launch if the bridge flow causes real user problems.

### 7.3 Guest / anonymous flow

Explorer tier requires no signup for venue walkthrough. Client generates a UUID stored in `localStorage` as anonymous `session_id`. Used for `host_conversations.session_id` and presence tracking.

If the user signs up later, their anonymous conversations get back-filled with their new `user_id` via a migration call on first sign-in. This preserves continuity — Laviche still remembers what they were looking at before they signed up.

---

## 8. Ticketing flow

### 8.1 Free events / tier-included attendance

User on `/events/at-the-table-ep-1` clicks **Claim Ticket**. Edge Function:
1. Checks user membership tier ∈ `events.free_for_tiers`
2. Inserts `tickets` row with `source = 'tier_included'`, `state = 'valid'`, `amount_paid_cents = 0`
3. Sends confirmation email with Zoom join URL and event details

Idempotent on `(event_id, user_id)` unique constraint.

### 8.2 Paid events — Explorer tier

1. Click **Buy Ticket — $15** → client calls `/api/ticket/create-checkout` Edge Function
2. Function creates Stripe Checkout session, stores a `tickets` row with `state = 'pending'` and `stripe_payment_intent_id` set
3. User redirected to Stripe-hosted checkout
4. Stripe webhook on `checkout.session.completed` → Edge Function validates signature, flips ticket to `state = 'valid'`, sends confirmation email
5. Ticket shows in user's `/account` page and as "You're in" on the event page

### 8.3 Episode 1 specifics

- Price: $15 for Explorer, free for Regular and VIP tier subscribers
- Capacity cap: 150 (Main Lounge seated capacity; soft cap for Zoom)
- Platform: Zoom (join URL populated into `events.zoom_join_url` ~24h before event)
- Confirmation email includes: Zoom link, event details, reminder that joining requires a valid ticket
- Refund window: up to 24h before event start (post-launch automation; for Ep 1 handle manually if needed)

---

## 9. "At The Table" Episode 1 — runbook

### 9.1 Format

- 90 minutes, **June 15 2026, 7:00 PM CDT**
- On Zoom (user joins via personal email link, not through the mall)
- Long-table format with host + 3-5 guests
- Q&A in final 20 minutes via Zoom raise-hand
- Recorded by Zoom (cloud or local), uploaded to Supabase Storage after event
- Rebroadcast as an episode on the Off the Map podcast network + YouTube

### 9.2 Run-of-show (simplified from v1)

- **T-24h:** Zoom meeting created, URL populated into `events.zoom_join_url`, confirmation email blast to ticket holders
- **T-2h:** Host tech check (internet, lighting, audio)
- **T-30m:** Guests join Zoom for warmup
- **T-15m:** Confirmation email reminder blast ("Starting in 15 minutes")
- **T-0:** Event status → `live`. Host starts Zoom recording. Show begins.
- **T+70m:** Q&A opens
- **T+90m:** Event ends. Event status → `ended`. Zoom recording saved.
- **T+24h:** Recording uploaded to Supabase Storage, `events.recording_url` populated, email to attendees with link. If Regular/VIP entitlement, recording is theirs permanently.

### 9.3 Decisions still pending on Ep 1 (flagged from v1)

- **Inaugural guest(s):** not yet identified. You solo, AI-hosted with Laviche, real-world guest, or hybrid?
- **Music bed:** Verse Alkemist instrumental (self-licensed) recommended
- **Theme / topic for episode 1:** needs a hook for marketing (What's the conversation?)

These need answers by **May 15** for marketing runway. Not blocking development work before then.

---

## 10. 8-week build plan (revised)

Anchored to June 15 launch. Shorter than v1's 10 weeks because LiveKit integration is dropped and the surface area is smaller.

| Week | Dates | Focus | Deliverables |
|---|---|---|---|
| 1 | Apr 20-26 | Schema + foundation | Fix Suspense error on cafe-sativa.com. Apply 7-table migration to `cafe-sativa-prod`. Create `shared/venue-config.json` repo. This doc reviewed/signed. |
| 2 | Apr 27-May 3 | Auth + membership | Auth bridge flow working end-to-end. `/membership` page live with Stripe Checkout. Can upgrade tier, webhook updates `memberships` table. |
| 3 | May 4-10 | Events + tickets | `/events` list + individual event page. Stripe ticket checkout for paid events. Tier-included ticket claim. Ep 1 seeded with placeholder Zoom URL. |
| 4 | May 11-17 | Agent concierge plumbing | Railway orchestrator HTTP endpoints for Laviche/Ginger/Ahnika. `/ask` route on cafe-sativa.com. 3D mall chat wired to orchestrator (replaces canned greetings). Rate limiting live. |
| 5 | May 18-24 | 3D furniture pass (spine) | Foyer, Gallery, Bar, Main Lounge furnished in default mode. VIP gate at Cigar enforces membership. Host avatars appear in their assigned rooms. |
| 6 | May 25-31 | Homepage + experiences | `/` polished. `/experiences` single-page overview with "walk the venue" CTA. `/account` page complete. |
| 7 | Jun 1-7 | End-to-end test + marketing | Full dry run with a friend: sign up → subscribe → buy ticket → get Zoom link → attend a test Zoom event → access recording. Email blast campaign to existing list. |
| 8 | Jun 8-15 | **LAUNCH WEEK** | Final polish. Bug fixes. **June 15: Ep 1 runs live.** |

**Post-launch (week 9+):**
- Survey attendees, publish recording, plan Ep 2
- Add deferred content: `/journal`, `/partners`, `/investors`
- Evaluate whether to migrate from Zoom to LiveKit for Ep 2

**Critical path:** Week 1 (schema + Suspense fix) → Week 2 (auth) → Week 3 (tickets) → Week 8 (launch). Weeks 4-7 are parallel / can compress if needed.

**Biggest risk:** Week 1 — if the Suspense error takes longer than 3 lines, or schema design reveals a problem once it meets the code, the whole plan slips. Mitigation: I can apply the schema today (it's non-destructive, empty project) so we start week 1 with that already done.

---

## 11. Open questions

Down from 8 in v1 to 5 here — cost-cut decisions and the agent-as-concierge call resolved the rest.

1. **Apply the schema today?** I have MCP access to `cafe-sativa-prod`. Say go and I run the migration in the next message. Non-destructive, reversible.

2. **cafe-sativa.com repo — fix the Suspense error.** I need the GitHub repo URL and confirmation I should look at it. If it's in `glyph-protocol` Vercel team (same as the mall), I already have implicit access via Vercel MCP. If it's elsewhere, I need you to point me.

3. **Episode 1 guest + topic.** Need by May 15 for marketing. You solo? Real guest? Hybrid with Laviche as AI co-host? What's the conversation about?

4. **Staff flag assignments.** Who gets `is_staff = true` at launch — just you, or add Diana and Nicoleta?

5. **Cigar Lounge enforcement strictness.** Hard block (non-VIP can't walk in the door) or soft (can peek in but menu items don't work)? My rec: soft for discovery, hard on interactive elements (humidor menu, drink ordering).

---

## 12. What happens after you approve this doc

Assuming you say go and answer Q1:

1. **Today:** I apply the 7-table schema migration to `cafe-sativa-prod`. Adds profiles, memberships, events, tickets, room_state, host_conversations, host_messages. Seeds the 10 room_state rows and Ep 1 event. Idempotent — safe to re-run.
2. **Today or tomorrow:** I create `shared/venue-config.json` and commit it (as a repo or as a file in both product repos — your call).
3. **This week:** If you share the cafe-sativa.com repo, I look at the Suspense error and ship a fix PR.
4. **Next week:** Start week 2 work (auth bridge + membership).

Week 1 can be done in a few days of focused work if the Suspense error is what I think it is. That puts us ahead of the plan before we start.
