# 2026-04-20 — Initial schema migration applied

Applied to Supabase project `cafe-sativa-prod` (ref `nwfxvhqbjtfvoopcadff`).
Schema defined in `docs/ARCHITECTURE.md` §5.

## Migrations run (in order)

1. `001_profiles_and_enums` — profiles table + auth.users trigger +
   updated_at helper + 5 enum types (membership_tier, membership_status,
   event_status, ticket_source, ticket_state)
2. `002_memberships` — memberships table, self-read RLS, Stripe indexes
3. `003_events` — events table, public-read (non-draft) RLS
4. `004_tickets` — tickets table, self-read RLS, unique (event_id, user_id)
5. `005_room_state` — room_state table, public-read + staff-write RLS
6. `006_host_conversations` — host_conversations + host_messages tables,
   message_count bump trigger, self-read RLS
7. `007_views` — members_v and my_events_v (security_invoker=true so RLS
   flows through)
8. `008_seed_rooms_and_ep1` — 10 room_state rows + At The Table Ep 1

## Verification

- `list_tables` confirmed all 7 tables with RLS enabled
- `room_state` count = 10 (all CS wing rooms)
- `events` count = 1 (Ep 1 at `2026-06-15 19:00:00-05`)
- All other tables empty (correct — no users or tickets yet)

## What's next

Edge Functions will be added later (not via apply_migration — those are
code, not schema). Expected:
- `stripe-webhook` for `customer.subscription.*` and
  `checkout.session.completed` events
- `create-checkout-session` for ticket and subscription purchases
- `mint-agent-call` for concierge — handles rate limiting, memory window
  lookup, Railway orchestrator call
- `bridge-token` for auth bridge flow (short-lived tokens for cross-domain
  SSO)

Indexes added pre-emptively:
- `events (starts_at)`
- `events (status) where status in ('scheduled', 'live')` — partial
- `tickets (event_id)`, `tickets (user_id)`
- `tickets (state) where state = 'valid'` — partial
- `memberships (stripe_customer_id)`, `memberships (current_period_end)`
- `host_conversations (user_id, started_at desc)` — partial where user_id not null
- `host_conversations (session_id, started_at desc)` — partial where session_id not null
- `host_conversations (host_agent, started_at desc)`
- `host_messages (conversation_id, created_at)`

## Key design decisions

- **Service-role writes for Stripe, comp tickets, action handoff from
  agents.** No client-side insert/update policies on memberships or
  tickets — too much trust surface.
- **Anonymous chat via session_id.** Pre-login users get a localStorage
  UUID that writes to `host_conversations.session_id`. Edge Function uses
  service role to read/write. When anonymous user signs up, we back-fill
  `user_id` on their existing conversations in a migration call.
- **Cross-surface memory via the same host_messages table.** No separate
  "2D chat history" and "3D chat history." Laviche in the 3D Bar and
  Laviche on /ask share one conversation log per user.
- **security_invoker on views** — views inherit the caller's RLS
  instead of the view-creator's. Prevents privilege escalation.

