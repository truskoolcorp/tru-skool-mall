import test from 'node:test';
import assert from 'node:assert/strict';
import { createConciergeTransport, createPendingStore, createRequestIdentity, CONCIERGE_URL } from '../js/concierge-transport.mjs';

const SESSION = 'original-opaque-mall-session', CONV = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const NOW = 1794132000000;
const body = (overrides = {}) => ({ host: 'laviche', message: 'Original question', session_id: SESSION, conversation_id: CONV, room_id: 'grand-hall', ...overrides });
function storage(items = new Map()) {
  return { items, get length() { return items.size; }, key: i => [...items.keys()][i] ?? null,
    getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value), removeItem: key => items.delete(key) };
}
function locks() {
  const active = new Set();
  return { async request(key, options, callback) {
    assert.equal(options.ifAvailable, true);
    if (active.has(key)) return callback(null);
    active.add(key);
    try { return await callback({ name: key }); } finally { active.delete(key); }
  } };
}
function harness(options = {}) {
  const local = options.storage ?? storage(), coordinator = options.locks ?? locks(), calls = [], pending = [], timers = new Map();
  let id = 0, timerId = 0;
  const fetcher = (url, init) => {
    calls.push({ url, init });
    if (init.method === 'GET') return Promise.resolve({ status: options.capabilityStatus ?? 200, json: async () => options.capability ?? {
      durable_enabled: options.durable !== false, durable_payload_version: 2, text_admissions_enabled: true,
    } });
    return new Promise((resolve, reject) => {
      pending.push({ resolve, reject });
      init.signal.addEventListener('abort', () => reject(Error('Aborted')));
    });
  };
  const transport = createConciergeTransport({ fetcher, getStorage: () => { if (options.blockedStorage) throw Error('Denied'); return local; },
    locks: options.noLocks ? null : coordinator, now: () => NOW,
    randomUUID: () => `00000000-0000-4000-8000-${(++id).toString(16).padStart(12, '0')}`,
    setTimer: (fn, delay) => { const id = ++timerId; timers.set(id, { fn, delay }); return id; }, clearTimer: id => timers.delete(id),
  });
  return { transport, local, coordinator, calls, pending,
    async tick() { for (let i = 0; i < 15; i++) await Promise.resolve(); },
    respond(status = 200, data = { message: 'Real server reply', conversation_id: CONV }) {
      const request = pending.shift(); assert.ok(request, 'Expected pending network call');
      request.resolve({ status, json: async () => data });
    },
    reject() { pending.shift().reject(Error('Lost response')); },
    timeout() { [...timers.values()].find(timer => timer.delay === 65000).fn(); },
    posts() { return calls.filter(call => call.init.method === 'POST'); },
    retained() { return transport.inspect('laviche', SESSION).pending; },
  };
}
async function unresolved(h, status = 202, data = { code: 'request_pending' }) {
  const operation = h.transport.send(body()); await h.tick();
  h.respond(status, data); await operation; return h.retained()[0];
}

test('UUIDv7 issuance is immutable and matches the actual Café contract', () => {
  const identity = createRequestIdentity(NOW, '12345678-1234-4abc-9def-123456789abc');
  assert.match(identity.request_id, /^[a-f0-9]{8}-[a-f0-9]{4}-7[a-f0-9]{3}-[89ab]/);
  assert.equal(parseInt(identity.request_id.slice(0, 8) + identity.request_id.slice(9, 13), 16), NOW);
  assert.equal(identity.issued_at, NOW);
  assert.throws(() => createRequestIdentity(-1, 'bad'));
});
test('persists exact v2 body before dispatch; never sends credentials', async () => {
  const h = harness(); const operation = h.transport.send(body()); await h.tick();
  const saved = h.retained()[0], post = h.posts()[0], wire = JSON.parse(post.init.body);
  assert.equal(saved.body, post.init.body);
  assert.equal(wire.surface, 'mall-3d'); assert.equal(wire.room_id, 'grand-hall');
  assert.equal(wire.issued_at, NOW); assert.equal(saved.id, wire.request_id);
  assert.equal(post.init.headers['X-Concierge-Durable'], '1');
  assert.equal(post.init.headers['X-Concierge-Requester'], `guest:${SESSION}`);
  assert.ok(h.calls.every(call => call.init.credentials === 'omit' && call.init.cache === 'no-store'));
  h.respond(); const result = await operation;
  assert.equal(result.kind, 'reply'); assert.equal(result.message, 'Real server reply'); assert.equal(h.retained().length, 0);
});
test('legacy-off compatibility preserves opaque session and old body, with explicit mode fence', async () => {
  const h = harness({ durable: false }), operation = h.transport.send(body()); await h.tick();
  const post = h.posts()[0], wire = JSON.parse(post.init.body);
  assert.equal(post.init.headers['X-Concierge-Durable'], '0');
  assert.equal(wire.session_id, SESSION); assert.equal(wire.request_id, undefined); assert.equal(wire.issued_at, undefined);
  assert.equal(h.retained()[0].mode, 'legacy'); h.respond(); assert.equal((await operation).kind, 'reply');
});
test('202 is an honest pending state, never a fabricated reply', async () => {
  const h = harness(), operation = h.transport.send(body()); await h.tick(); h.respond(202, { state: 'DISPATCHED' });
  const result = await operation;
  assert.equal(result.kind, 'notice'); assert.equal(result.resolved, false); assert.match(result.message, /unresolved/);
  await h.transport.send(body({ message: 'Duplicate' })); assert.equal(h.posts().length, 1); assert.equal(h.retained().length, 1);
});
test('lost response and reload retain exact original identity; recovery reads status first', async () => {
  const h = harness(), operation = h.transport.send(body()); await h.tick(); const original = h.posts()[0].init.body;
  h.reject(); assert.equal((await operation).resolved, false);
  const reload = harness({ storage: h.local, locks: h.coordinator });
  assert.equal(reload.retained()[0].body, original); assert.equal(reload.calls.length, 0);
  await reload.transport.send(body({ message: 'Edited draft', room_id: 'other-room' })); assert.equal(reload.calls.length, 0);
  const recovery = reload.transport.recover('laviche', SESSION); await reload.tick();
  assert.equal(reload.posts()[0].url, `${CONCIERGE_URL}/status`); assert.equal(reload.posts()[0].init.body, original);
  reload.respond(); assert.equal((await recovery).kind, 'reply'); assert.equal(reload.retained().length, 0);
});
test('bounded timeout retains request and never retries', async () => {
  const h = harness(), operation = h.transport.send(body()); await h.tick(); h.timeout();
  assert.equal((await operation).resolved, false); assert.equal(h.posts().length, 1); assert.equal(h.retained().length, 1);
});
test('recovery grant replays exact original body, and transient replay denial remains unresolved', async () => {
  for (const [status, data] of [[503, { code: 'capacity_busy', admitted: false }], [429, { rate_limited: true, admitted: false }], [400, { error: 'Bad request' }]]) {
    const h = harness(), original = await unresolved(h), recovery = h.transport.recover('laviche', SESSION); await h.tick();
    h.respond(202, { recovery_required: true }); await h.tick();
    assert.equal(h.posts().at(-1).url, CONCIERGE_URL); assert.equal(h.posts().at(-1).init.body, original.body);
    h.respond(status, data); const result = await recovery;
    assert.equal(result.resolved, false); assert.equal(h.retained()[0].body, original.body);
  }
});
test('missing status without explicit grant never replays', async () => {
  for (const [status, data] of [[404, { code: 'request_missing' }], [202, {}], [503, { code: 'durable_disabled' }], [409, { code: 'requester_changed' }], [503, { code: 'status_unavailable' }]]) {
    const h = harness(); await unresolved(h); const recovery = h.transport.recover('laviche', SESSION); await h.tick();
    h.respond(status, data); assert.equal((await recovery).resolved, false);
    assert.equal(h.posts().length, 2); assert.equal(h.retained().length, 1);
  }
});
test('expiry without terminal marker retains; verified terminal result releases without sending again', async () => {
  const h = harness(); await unresolved(h);
  let recovery = h.transport.recover('laviche', SESSION); await h.tick(); h.respond(410, { code: 'request_expired' });
  assert.equal((await recovery).resolved, false); assert.equal(h.retained().length, 1);
  recovery = h.transport.recover('laviche', SESSION); await h.tick(); h.respond(410, { code: 'request_expired', terminal: true });
  assert.equal((await recovery).resolved, true); assert.equal(h.retained().length, 0); assert.equal(h.posts().length, 3);
});
test('fresh upgrade409, rate limit and known capacity denial release safely without auto-retry', async () => {
  for (const [status, data] of [[409, { code: 'request_upgrade_required', admitted: false }], [429, { rate_limited: true }], [503, { code: 'capacity_busy', admitted: false }]]) {
    const h = harness(), operation = h.transport.send(body()); await h.tick(); h.respond(status, data);
    const result = await operation; assert.equal(result.kind, 'notice'); assert.equal(result.resolved, true);
    assert.equal(h.retained().length, 0); assert.equal(h.posts().length, 1);
    if (status === 409) assert.equal(result.upgradeRequired, true);
  }
});
test('unknown busy/failure or non-JSON success never resolves uncertainty', async () => {
  for (const [status, data] of [[503, { code: 'capacity_busy' }], [500, {}], [200, {}], [200, { message: '' }], [202, { message: 'not final' }]]) {
    const h = harness(), operation = h.transport.send(body()); await h.tick(); h.respond(status, data);
    assert.equal((await operation).resolved, false); assert.equal(h.retained().length, 1);
  }
});
test('maintenance during send never makes non-admission claim or clears prior uncertainty', async () => {
  const h = harness(), operation = h.transport.send(body()); await h.tick(); h.respond(503, { code: 'text_maintenance' });
  assert.equal((await operation).resolved, false); assert.equal(h.retained().length, 1);
});
test('legacy lost response remains blocked across reload; never attempts durable recovery or legacy replay', async () => {
  const h = harness({ durable: false }), operation = h.transport.send(body()); await h.tick(); h.reject(); await operation;
  const reload = harness({ storage: h.local, durable: true });
  const result = await reload.transport.recover('laviche', SESSION);
  assert.match(result.message, /Contact support/); assert.equal(reload.calls.length, 0);
  await reload.transport.send(body()); assert.equal(reload.calls.length, 0); assert.equal(reload.retained().length, 1);
});
test('capability absence, invalid version, and maintenance fail closed without POST', async () => {
  for (const options of [{ capabilityStatus: 404 }, { capabilityStatus: 503 }, { capability: {} },
    { capability: { durable_enabled: true, durable_payload_version: 1, text_admissions_enabled: true } },
    { capability: { durable_enabled: false, text_admissions_enabled: false } }]) {
    const h = harness(options), result = await h.transport.send(body());
    assert.equal(result.kind, 'notice'); assert.equal(h.posts().length, 0); assert.equal(h.retained().length, 0);
  }
});
test('storage blocked and Web Locks unavailable fail closed without any POST', async () => {
  for (const options of [{ blockedStorage: true }, { noLocks: true }]) {
    const h = harness(options), result = await h.transport.send(body()); assert.equal(result.blocked, true); assert.equal(h.posts().length, 0);
  }
});
test('storage read-back failure prevents dispatch', async () => {
  const local = storage(); local.setItem = () => {};
  const h = harness({ storage: local }); assert.equal((await h.transport.send(body())).blocked, true); assert.equal(h.posts().length, 0);
});
test('double click and concurrent tabs cannot dispatch a second request', async () => {
  const h = harness(), other = harness({ storage: h.local, locks: h.coordinator });
  const first = h.transport.send(body()); await h.tick();
  assert.equal((await h.transport.send(body())).busy, true);
  assert.equal((await other.transport.send(body())).busy, true); assert.equal(other.calls.length, 0);
  h.respond(202, {}); await first;
  await other.transport.send(body()); assert.equal(other.calls.length, 0); assert.equal(h.posts().length, 1);
});
test('cross-tab recovery is serialized and a cached answer clears only the original record', async () => {
  const h = harness(); await unresolved(h); const other = harness({ storage: h.local, locks: h.coordinator });
  const recovery = h.transport.recover('laviche', SESSION); await h.tick();
  assert.equal((await other.transport.recover('laviche', SESSION)).busy, true); assert.equal(other.calls.length, 0);
  h.respond(); await recovery; assert.equal(other.retained().length, 0);
});
test('session changes do not expose or mutate another session’s retained body', async () => {
  const h = harness(); await unresolved(h);
  assert.equal(h.transport.inspect('laviche', 'different-session').pending.length, 0);
  await h.transport.recover('laviche', 'different-session'); assert.equal(h.posts().length, 1);
  assert.equal(h.retained().length, 1);
});
test('session change before replay prevents POST and leaves original retained', async () => {
  const h = harness(); await unresolved(h); let current = true;
  const recovery = h.transport.recover('laviche', SESSION, () => current); await h.tick(); current = false;
  h.respond(202, { recovery_required: true }); assert.equal((await recovery).kind, 'stale');
  assert.equal(h.posts().length, 2); assert.equal(h.retained().length, 1);
});
test('session change before capability settles prevents initial send', async () => {
  const h = harness(); let current = true;
  const operation = h.transport.send(body(), () => current); current = false;
  assert.equal((await operation).kind, 'stale'); assert.equal(h.posts().length, 0); assert.equal(h.retained().length, 0);
});
test('session or host change while original is in-flight suppresses stale reply and preserves recovery', async () => {
  const h = harness(); let current = true;
  const operation = h.transport.send(body(), () => current); await h.tick(); current = false; h.respond();
  assert.equal((await operation).kind, 'stale'); assert.equal(h.retained().length, 1);
});
test('malformed, modified identity or overlarge retained data fails closed', async () => {
  for (const corrupt of [() => 'invalid json', raw => { const record = JSON.parse(raw); const wire = JSON.parse(record.body); wire.issued_at++; record.body = JSON.stringify(wire); return JSON.stringify(record); }, () => 'x'.repeat(32769)]) {
    const h = harness(); await unresolved(h); const [key, value] = [...h.local.items][0]; h.local.items.set(key, corrupt(value));
    assert.equal(h.transport.inspect('laviche', SESSION).blocked, true);
    await h.transport.send(body()); assert.equal(h.posts().length, 1);
  }
});
test('multiple retained request keys remain independent and resolve one at a time', async () => {
  const h = harness(), first = await unresolved(h), second = { ...first };
  const identity = createRequestIdentity(NOW + 1, '00000000-0000-4000-8000-000000000002');
  second.id = identity.request_id; second.body = JSON.stringify({ ...JSON.parse(first.body), ...identity, message: 'Other tab original' });
  const key = [...h.local.items.keys()][0].replace(first.id, second.id); h.local.items.set(key, JSON.stringify(second));
  assert.equal(h.retained().length, 2);
  const recovery = h.transport.recover('laviche', SESSION); await h.tick(); h.respond(); await recovery;
  assert.equal(h.retained().length, 1); assert.equal(h.retained()[0].body, second.body);
});
test('conversation access rejection releases only fresh send and requests explicit new conversation', async () => {
  const h = harness(), operation = h.transport.send(body()); await h.tick(); h.respond(403, { code: 'conversation_unavailable' });
  assert.equal((await operation).clearConversation, true); assert.equal(h.retained().length, 0);
});
test('stale legacy success stores bounded original-scope outcome, consumed without network', async () => {
  const h = harness({ durable: false }); let current = true;
  const operation = h.transport.send(body(), () => current); await h.tick(); const original = h.retained()[0];
  current = false; h.respond(); assert.equal((await operation).kind, 'stale');
  const completed = h.retained()[0]; assert.equal(completed.body, original.body); assert.equal(completed.id, original.id);
  assert.equal(completed.outcome.kind, 'reply');
  await h.transport.send(body()); assert.equal(h.posts().length, 1);
  const reload = harness({ storage: h.local, locks: h.coordinator });
  assert.equal((await reload.transport.recover('laviche', SESSION)).kind, 'reply');
  assert.equal(reload.calls.length, 0); assert.equal(reload.retained().length, 0);
});
test('stale recovery denial cannot be stored as a terminal outcome', async () => {
  const h = harness(); await unresolved(h); let current = true;
  const recovery = h.transport.recover('laviche', SESSION, () => current); await h.tick(); current = false;
  h.respond(503, { admitted: false, code: 'capacity_busy' }); await recovery;
  assert.equal(h.retained()[0].outcome, undefined); assert.equal(h.retained().length, 1);
});
test('malformed retained completion and overlarge outcome fail closed', async () => {
  const h = harness({ durable: false }); let current = true;
  const operation = h.transport.send(body(), () => current); await h.tick(); current = false; h.respond(); await operation;
  const [key, raw] = [...h.local.items][0], record = JSON.parse(raw);
  record.outcome.resolved = false; h.local.items.set(key, JSON.stringify(record));
  assert.equal(h.transport.inspect('laviche', SESSION).blocked, true);
  const h2 = harness({ durable: false }); let current2 = true;
  const send = h2.transport.send(body(), () => current2); await h2.tick(); current2 = false;
  h2.respond(200, { message: 'x'.repeat(21000) }); await send;
  assert.equal(h2.retained()[0].outcome, undefined); assert.equal(h2.retained().length, 1);
});
test('saved completion consumption is cross-tab serialized and never sends the original again', async () => {
  const h = harness({ durable: false }); let current = true;
  const operation = h.transport.send(body(), () => current); await h.tick(); current = false; h.respond(); await operation;
  const other = harness({ storage: h.local, locks: h.coordinator });
  const first = h.transport.recover('laviche', SESSION), second = other.transport.recover('laviche', SESSION);
  assert.equal((await first).kind, 'reply'); assert.equal((await second).busy, true);
  assert.equal(h.posts().length, 1); assert.equal(other.calls.length, 0); assert.equal(h.retained().length, 0);
});
