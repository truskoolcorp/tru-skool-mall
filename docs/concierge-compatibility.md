# Mall text concierge: local compatibility candidate

## Status and provenance

This local candidate is based on verified [Mall commit bb1a25c3](https://github.com/truskoolcorp/tru-skool-mall/commit/bb1a25c3321e55cfd5ed7a058c33d85c18da5726). The source review covered all 80 nonbinary files at that commit; binary media were omitted. No repository instruction files, existing CI workflow, or original test framework were present. This source review does not establish a full 3D build or browser pass.

The verified entry points are [index.html](https://github.com/truskoolcorp/tru-skool-mall/blob/bb1a25c3321e55cfd5ed7a058c33d85c18da5726/index.html), [the original chat engine](https://github.com/truskoolcorp/tru-skool-mall/blob/bb1a25c3321e55cfd5ed7a058c33d85c18da5726/js/chat-engine.js), and [the alternate direct-provider handler](https://github.com/truskoolcorp/tru-skool-mall/blob/bb1a25c3321e55cfd5ed7a058c33d85c18da5726/api/chat.js). Only index loads this engine. No executable source at that commit calls `/api/chat`; the [original README](https://github.com/truskoolcorp/tru-skool-mall/blob/bb1a25c3321e55cfd5ed7a058c33d85c18da5726/README.md) still recommended the obsolete proxy and browser-key setup. This candidate removes those instructions. External consumers and historical deployments are not ruled out by repository search.

The client targets the reviewed [Café v2 durable-client contract at ccf7f63a](https://github.com/truskoolcorp/cafe-sativa/blob/ccf7f63a8292ce4374b2832b9886d1a7e2fef8e6/docs/concierge-durable-client.md), proposed in [Café PR47](https://github.com/truskoolcorp/cafe-sativa/pull/47), including request validation, identity fences, read-only status, recovery grants, and CORS. Do not assume that contract is deployed. Café durable mode is OFF and must remain OFF until separately approved database/configuration rollout work is complete.

No production endpoint was invoked by these tests, no provider was called, no migration or configuration was applied, and nothing was pushed or deployed.

## Client behavior

- GET `https://www.cafe-sativa.com/api/concierge/status` with `cache: no-store` before every **new** send. Require boolean `durable_enabled` and `text_admissions_enabled`. Durable mode additionally requires `durable_payload_version: 2`.
- A missing/404/5xx/malformed capability does **not** mean legacy mode. Fail closed with an honest service notice and leave the draft available.
- When capability explicitly reports durable mode off, send the existing legacy body shape with the original opaque guest session and `X-Concierge-Durable: 0`. No invented server-side idempotency claim is made for legacy requests.
- Durable requests have one cryptographically random UUIDv7 and matching integer issuance milliseconds. Persist the exact serialized body before POST. `host`, text, session, conversation, `mall-3d` surface, room, ID, and issuance time never change during recovery.
- All network calls explicitly use `credentials: omit`. `X-Concierge-Requester: guest:<original session>` is an identity fence, not authentication. Signing into Mall does not turn this into a signed-in Café request or shared account memory.
- A 200 with a nonempty reply is a reply. 202, busy, quota, maintenance, upgrade and unknown failures are service notices, not invented host replies. No fallback product claims, prices, sizes, or canned answers are produced.
- Recovery is user-triggered, bounded, and status-first. POST the original body to `/status`. Only explicit `202 recovery_required: true` allows one replay POST with the identical body. No background retry, automatic new ID, elapsed-time reset, or polling loop exists.
- A recovery rejection, even `admitted: false`, rate limiting, or 400, cannot release a request that may already have been sent. Only a committed reply or explicit verified terminal marker releases that chain. Expiry alone is not proof of terminality.
- A fresh known pre-dispatch rejection can release the composer. A mode/upgrade response requires a page reload before another new send. Rejected drafts may be restored but never automatically resubmitted.
- Uncertain **legacy** requests are also retained. They cannot safely use durable status/replay, so the composer stays paused and directs the visitor to support. There is deliberately no “discard and resend” button. Separate Mall navigation remains available.

### Storage, sessions and tabs

Each request uses an independent immutable localStorage key. Storage access, malformed retained records, oversize records and failed write verification fail closed. A current session's record cannot overwrite or clear another request's body. Requests from a different guest session are never displayed or reassigned. Returning to the original session makes its pending work recoverable again.

Web Locks serializes initial guest-session creation and new/recovery operations across same-origin tabs. It is required for text chat, including legacy mode. Without it, text chat fails closed instead of relying on a non-atomic expiring localStorage lease. This is an intentional compatibility tradeoff for old browsers; it requires product acceptance before publication. Server-side durable admission is still required to prevent duplicate provider dispatch, including after a tab is closed or a browser lock is released.

Conversation pointers now include guest session and host in their keys. Existing host-only pointers remain untouched but are not imported because their session ownership cannot be proven. Existing bounded opaque session IDs are kept. A visitor may start a fresh conversation rather than inherit an old unscoped pointer.

Storage events update pending controls across tabs. Real host/session changes invalidate an in-flight UI operation and prevent late replies or replay grants from being applied to the wrong context. Same-guide room movement emits no identity change. Mall authentication events are ignored by this credential-omitting guest client, so token refresh cannot invalidate an otherwise valid reply. Session changes clear visible history. Close/open does not discard pending work. BFCache restoration rechecks the current guest session. A confirmed reply or terminal result received after real navigation is retained as a bounded, schema-validated outcome on the original immutable request record. Returning to that exact host/session exposes “Show saved result”; consuming it is serialized under the same lock, uses no network even in legacy mode, and releases that original request. Transient recovery denials never become terminal outcomes. Session initialization uses its own generation so host changes cannot abandon startup or late startup callbacks overwrite a new session.

Original request text and any unconsumed known result are stored locally until safely resolved; users on a shared browser should understand this privacy property.

### UI and time bounds

`chat-engine.js` remains a classic script, loading the transport module with dynamic import. The input starts disabled until safe initialization. The composer is bounded to 2,000 characters. It clears only after the original body has been successfully retained. “Check original message” remains available for pending durable work; all unresolved work is handled one record at a time.

Network deadlines are 10 seconds for capability, 15 seconds for status, and 65 seconds for send/replay. Aborting browser I/O does **not** imply provider cancellation or release the original request. Repeated clicks do not queue new sends. Successful replies and user text use `textContent`, never raw HTML. Chat service notices are not narrated as host speech.

## Retiring `/api/chat`

The original deployed file accepts caller-controlled system/messages, uses wildcard CORS, and directly calls Anthropic with the Mall environment key. It does not traverse Café origin checks, quotas, text maintenance, or the durable ledger. It is an alternate paid entry point even though the inspected current chat engine does not use it.

The safest candidate is a small provider-free **HTTP 410** handler for every method, with `Cache-Control: no-store` and static canonical endpoint metadata. It reads no request body, provider key or environment secret. It has no `fetch`, wildcard CORS, proxy, or redirect. A redirect would not translate the old `{system,messages}` contract and could encourage unsafe retries. A forwarding proxy would create a second operational path and imply authentication that has not been implemented.

This is a **material behavior change for untracked direct `/api/chat` consumers**. The release owner must approve including it. Do not restore the provider fallback to make old consumers appear successful. Inventory and update consumers or give them the explicit retirement result.

Deploying this file at the current alias would not disable old deployment URLs or already-running invocations. Separately authorized rollout controls must inventory accessible historical deployments/aliases and prevent them from starting direct paid work before claiming that the bypass is eliminated. Do not remove unrelated voice, event, room, or YouTube functionality. Provider-secret cleanup and deployment access changes require their own approved action; this patch performs neither.

## Rollout ordering and gates

1. Review this Mall patch against the **current complete upstream checkout**. All 80 nonbinary baseline files were reviewed, but no full repository build was performed. Recheck upstream changes and external callers before publication.
2. Prepare and approve a Café **no-migration capability/client preparation release** if needed. PR47 includes a migration and must not be merged merely to publish the status endpoint. Its database and configuration changes require their separate exact approvals.
3. Verify the canonical Café origin serves the reviewed uncached capability, accepts both fence headers through approved CORS, returns explicit off-mode capability, and keeps durable mode OFF. A 404/old server would intentionally block this new Mall client.
4. Approve the browser requirements, guest-only messaging, session-scoped conversation transition, and proxy retirement behavior. Obtain any required publication/deployment approval separately.
5. From a full checkout run synthetic tests, real-browser local/network-mocked QA, and exact-commit CI. Test desktop/mobile layouts, pending controls, close/open, back/forward, multiple tabs, reload, interrupted requests, room navigation, storage failure, and voice independence. No live paid chat is necessary for these checks.
6. Only after approved publication, verify exact deployment SHA/aliases and the retired route's provider-free behavior without invoking any old paid endpoint. Previously deployed copies require independent coverage.
7. Durable enablement remains a separate later operation: reviewed migration, policy, quota/capacity, retention, writer coordination, drains, old deployment controls, recovery and provider reconciliation. This Mall client does not grant any of those approvals.

Do not roll an outstanding durable request into legacy mode or mint a fresh ID after an error. Text maintenance and retained status recovery are distinct from disabling durable handling.

## Validation evidence and limits

Run `npm test` for the dependency-free Node synthetic suite (51 passing tests in this candidate). The suite mocks capability, status, provider-facing API responses, localStorage, Web Locks and DOM; it never opens the production endpoints. It covers immutable v2 issuance, legacy off-mode, pending202, upgrade409, fresh and recovery rate/busy denials, lost responses, timeouts, reload, same-ID explicit replay, expiry/terminal distinctions, duplicate clicks, concurrent tabs, independently retained IDs, host/auth/session changes, storage corruption, guest isolation, HTML safety, and provider-free retirement.

The dependency-free GitHub workflow in `.github/workflows/chat-safety.yml` runs `npm test` and the runtime syntax checks using Node 24, read-only repository permission, no stored checkout credentials, no provider secrets, and no deployment step. It does not install package dependencies. A workflow file is not evidence that remote CI has run.

Also run `node --check js/chat-engine.js`, `node --check js/concierge-transport.mjs`, `node --check js/guide-system.js`, `node --check api/chat.js`, and `git diff --check`.

These are not full browser/3D rendering checks, real CORS/preflight checks, a deployed contract verification, provider accounting validation, deployment coverage, or CI for an upstream commit. The original repository has no build/lint/test script; the new `npm test` exercises only this candidate's synthetic regression suite. No test result here means the Mall is production-ready or authorizes durable enablement.
