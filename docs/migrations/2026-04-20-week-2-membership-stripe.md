# 2026-04-20 — Week 2: Membership + Stripe Checkout + webhook sync

Shipped to `cafe-sativa.com` repo. This document records what went live
and what's still pending so it's searchable in the mall-repo history.

## What landed

cafe-sativa commit `b760693` on main. Vercel deployment
`dpl_ECtWaxDiwcBLtvvrzef7MdWZQHWy` — green, production.

### API routes

**POST /api/create-checkout-session**
- Requires signed-in Supabase user (returns 401 + `code:
  'not_authenticated'` otherwise)
- Accepts `{ tier: 'regular' | 'vip' }` (matches `public.membership_tier`
  enum)
- Reuses `memberships.stripe_customer_id` to avoid duplicate Stripe
  customer records on resubscribe
- Attaches `metadata: { user_id, tier }` to BOTH the Checkout Session
  and the Subscription via `subscription_data.metadata`
- Accepts env vars under both new names (`STRIPE_PRICE_REGULAR_MONTHLY`,
  `STRIPE_PRICE_VIP_MONTHLY`) and legacy names (`STRIPE_PRICE_INSIDER`,
  `STRIPE_PRICE_FOUNDING`) as fallbacks

**POST /api/webhooks/stripe**
- Verifies `stripe-signature` against `STRIPE_WEBHOOK_SECRET`
- Handles three events:
  - `checkout.session.completed` — first purchase; upserts membership
    with tier, status, customer_id, subscription_id, current_period_end
  - `customer.subscription.updated` — tier changes, renewals, status
    transitions (active → past_due → canceled)
  - `customer.subscription.deleted` — sets status to `canceled` but
    keeps the row so period_end is preserved for UI ("access through
    Apr 30")
- Falls back to `stripe_customer_id` lookup when subscription metadata
  is missing (for subs created directly in Stripe Dashboard)
- All writes go through service-role client (bypasses RLS)
- `extractPeriodEnd()` helper reads `current_period_end` from
  `items.data[0]` — in Stripe SDK v18+, `current_period_end` lives on
  each subscription item, not the subscription root, because subs can
  now have items on different billing cycles

**GET /api/stripe-verify**
- Debugging endpoint that reports which env vars are set and whether
  each price resolves in the Stripe API
- Works as a post-deploy smoke test

### Pages

**/membership**
- Suspense-wrapped (reads `useSearchParams`)
- Reads from `members_v` view to show current tier, status, and
  renewal date inline when signed in
- Handles `?success=1&tier=regular|vip` with green banner
- Handles `?canceled=1` with neutral canceled banner
- Unauth upgrade click: redirects through
  `/auth/signin?redirect=/membership?intent=<tier>` and auto-resumes
  checkout after sign-in
- Shows "Current plan" on active tier; "Upgrade to VIP" or "Downgrade
  to Regular" on adjacent tiers

**/account**
- Reads `members_v` for tier, status, current_period_end, is_staff,
  is_admin, display_name
- Human labels: "VIP", "Active", "renews June 15, 2026"
- Staff/admin badge rendered when applicable
- Contextual upgrade CTA based on current tier

## Architectural notes

- **Why DB is a read replica of Stripe, not vice versa.** Stripe is
  the source of truth for subscription state. The `memberships` table
  is a write-through cache populated by webhook. If the webhook drops
  an event, the next event re-syncs from full subscription data. We
  never reconstruct state from a single `checkout.session` — we always
  retrieve the Subscription and write from that.

- **Why metadata on BOTH session and subscription.** Stripe's
  `checkout.session.completed` fires once. After that, all status
  changes fire on the Subscription, not the Session. By putting
  `{ user_id, tier }` on the subscription too (via
  `subscription_data.metadata`), later events know who they're for
  without a customer-id lookup.

- **Why the customer-id fallback.** Subscriptions created directly in
  the Stripe Dashboard (or via a future customer portal self-upgrade
  flow) won't carry our metadata. The fallback path finds the user by
  their stored `stripe_customer_id`, updates the existing row's
  status, and leaves tier unchanged (since we can't infer it from
  `price_id` without a mapping table).

## Outstanding for final end-to-end

Both are Vercel env var changes, not code changes. Once these land,
checkout → webhook → access grant works completely.

1. **Set `STRIPE_WEBHOOK_SECRET`** — currently missing in production.
   Without it, the webhook returns 500 for every event and no
   subscription will ever grant access in the DB. To get it:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://www.cafe-sativa.com/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Save, then click into the new endpoint and reveal the signing
     secret (starts with `whsec_...`)
   - In Vercel → `virtual-cafe-sativa` → Settings → Env Vars, add
     `STRIPE_WEBHOOK_SECRET` with that value, for Production

2. **Fix `NEXT_PUBLIC_SITE_URL`** — currently set to
   `https://virtual-cafe-sativa.vercel.app` (the preview alias).
   Successful Stripe checkouts redirect to
   `{NEXT_PUBLIC_SITE_URL}/membership?success=1&tier=vip`, which means
   paying customers currently land on a non-canonical URL. Change in
   Vercel env vars to `https://www.cafe-sativa.com`.

After both changes, redeploy is automatic from the env var edit.

## Remaining week 2 work (optional, not blocking Ep 1)

Stripe Customer Portal integration. Lets users update payment methods,
view invoices, and cancel their own subscription without contacting
us. Add a "Manage billing" button on `/account` that opens a Stripe
portal session. Stripe side: enable Customer Portal in Dashboard →
Settings → Billing → Customer portal. Small route to add:
`POST /api/create-portal-session`.

Not blocking Ep 1 since cancellation can also happen via direct email
for now.

## Next up (week 3)

`/events` and `/events/[slug]` pages + Stripe ticket checkout. See
`docs/ARCHITECTURE.md` §10.
