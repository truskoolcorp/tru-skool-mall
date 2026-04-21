# 2026-04-20 — Backfill pre-trigger auth users + comp Keith VIP

## Context

Keith's auth user (`kingram292@gmail.com`, uid
`6b36e0f8-4045-456f-9f5f-df5f3b4d10dc`) was created on 2026-04-16,
four days before migration `001_profiles_and_enums` installed the
`on_auth_user_created` trigger on `auth.users`. The trigger
normally inserts a matching `public.profiles` row on every new
auth user, but since it wasn't present at signup time, his profile
row was missing — `/account` fell back to the "Explorer (free)"
default.

Additionally, the discovery happened because Keith tried to go through
the upgrade flow end-to-end and verified the Stripe checkout page
rendered correctly with the right price ($9.99/mo) and business name
(Tru Skool Entertainment International Corp). He did NOT complete
the charge — and instead screenshotted the flow. So the webhook
path wasn't actually tested end-to-end yet. Payment gate is the
next verification step.

## Actions taken (applied directly to cafe-sativa-prod via SQL)

### 1. Backfill missing profiles

```sql
insert into public.profiles (id, email)
select id, email
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
```

Idempotent. Safe to re-run. Should be part of any future
deploy-to-new-project script.

### 2. Promote Keith to admin + staff + set display name

```sql
update public.profiles
set is_admin = true,
    is_staff = true,
    display_name = 'Keith'
where email = 'kingram292@gmail.com';
```

`is_staff` is required to write `room_state.mode` (via the
`room_state_staff_update` RLS policy) — needed during live event
mode flips from Command Center. `is_admin` is a future-proofing
flag; no policies check it yet but will when admin-only Edge
Functions are added.

### 3. Comp VIP membership

```sql
insert into public.memberships (user_id, tier, status)
select id, 'vip', 'active'
from public.profiles
where email = 'kingram292@gmail.com'
on conflict (user_id) do update set
  tier = 'vip',
  status = 'active';
```

Gives Keith full VIP access for testing and for operating the
venue. Note: no Stripe subscription is attached — so no renewal
date, no Stripe customer ID. Real paid subscriptions will be
created by the webhook. This comp is intentional and should be
treated as a "dogfood grant."

## Follow-up learnings

1. **Orphan-user risk exists on schema deploys to non-empty projects.**
   Any time we install a `handle_new_user`-style trigger on a project
   that already has `auth.users` rows, a backfill is needed. Add to
   the deploy runbook.

2. **Stripe product metadata is set in Stripe, not in our code.**
   The checkout page shows "Insider Plan" / "Café Sativa Insider"
   because those are the current product+price metadata in Stripe.
   Code labels say "Regular" but Stripe labels still say "Insider."
   Fix by going to Stripe Dashboard → Products → product
   `prod_ULxrCgCmYnTWOF` → rename to "Café Sativa Regular" /
   "Regular Plan". Same for VIP product `prod_ULxsmvOgLeiyYy` →
   rename to "Café Sativa VIP" / "VIP Plan". Cosmetic, not urgent.

3. **Webhook path still unverified end-to-end.** Keith stopped at
   the Stripe payment form (good call — no card to test with).
   To verify the rest of the path without charging a real card:
   - Option A (best): use Stripe test mode. Set Vercel env
     `STRIPE_SECRET_KEY` to `sk_test_...`, rebuild, charge with
     `4242 4242 4242 4242` / any future date / any CVC.
   - Option B: put a real card in, let it charge $9.99 (Regular)
     or $24.99 (VIP), verify membership row, then refund from
     Stripe Dashboard. Refunds don't auto-cancel subscriptions —
     we'd need to also cancel the subscription from Dashboard.
   - Option C: wait for Ep 1 sign-ups and hope for the best
     (don't do this).

## Current DB state after this session

| user | profile | membership (tier/status) | is_staff | is_admin |
| --- | --- | --- | --- | --- |
| kingram292@gmail.com | ✓ | vip/active (comp) | ✓ | ✓ |

Future signups via Supabase Auth will get profile rows
automatically via the trigger. No more orphans expected.
