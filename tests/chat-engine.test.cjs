// Synthetic DOM plus actual transport. No browser, external network or provider.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const SESSION_KEY = 'mall:concierge:session-id';
function storage(items = new Map([[SESSION_KEY, 'opaque-session']])) {
  return { items, get length() { return items.size; }, key: i => [...items.keys()][i] ?? null,
    getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value), removeItem: key => items.delete(key) };
}
function coordinator() {
  const held = new Set();
  return { async request(key, options, callback) {
    if (typeof options === 'function') { callback = options; options = {}; }
    if (held.has(key)) return callback(null);
    held.add(key); try { return await callback({ name: key }); } finally { held.delete(key); }
  } };
}
async function harness(options = {}) {
  const module = await import('../js/concierge-transport.mjs');
  const nodes = new Map(), events = new Map(), calls = [], network = [], voice = [], local = options.local ?? storage(), locks = options.locks ?? coordinator();
  class Element {
    constructor(tag) { this.tagName = tag; this.children = []; this._text = ''; this.hidden = false; this.disabled = false; this.value = ''; this.parent = null; }
    set id(id) { this._id = id; nodes.set(id, this); } get id() { return this._id; }
    set textContent(value) { this._text = value; this.children = []; } get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
    set innerHTML(value) { throw Error('Executable HTML not permitted in repaired chat'); }
    appendChild(node) { node.parent = this; this.children.push(node); return node; }
    setAttribute(name, value) { this[name] = value; }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this); nodes.delete(this.id); }
  }
  for (const id of ['chat-input', 'chat-send', 'chat-messages', 'chat-pending', 'chat-original', 'chat-pending-detail', 'chat-status', 'chat-recover']) {
    const el = new Element('div'); el.id = id;
  }
  const document = { getElementById: id => nodes.get(id), createElement: tag => new Element(tag) };
  const window = { MallState: { currentZone: 'Grand Hall', voiceEnabled: true }, addEventListener: (event, fn) => {
    const list = events.get(event) ?? []; list.push(fn); events.set(event, list);
  } };
  const fetcher = (url, init) => {
    calls.push({ url, init });
    if (init.method === 'GET') return Promise.resolve({ status: 200, json: async () => ({ durable_enabled: options.durable !== false, durable_payload_version: 2, text_admissions_enabled: true }) });
    return new Promise((resolve, reject) => { network.push({ resolve, reject }); init.signal.addEventListener('abort', () => reject(Error('Timeout'))); });
  };
  const scope = { window, document, localStorage: local, navigator: { locks }, crypto: webcrypto, console,
    GuideSystem: { _currentGuide: 'laviche' }, VoiceNarration: { speak: (...args) => voice.push(args) },
    __transportModule: { createConciergeTransport: () => module.createConciergeTransport({ fetcher, getStorage: () => local, locks }) } };
  const code = fs.readFileSync(path.join(root, 'js/chat-engine.js'), 'utf8').replace("import('./concierge-transport.mjs')", 'Promise.resolve(__transportModule)');
  vm.runInNewContext(code, scope);
  const tick = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
  await tick();
  return { nodes, calls, voice, local, locks, engine: window.ChatEngine, tick,
    type(text) { nodes.get('chat-input').value = text; }, send: () => window.sendChat(), recover: () => window.ChatEngine.recover(),
    status: () => nodes.get('chat-status').textContent,
    text: () => nodes.get('chat-messages').textContent,
    pending: () => !nodes.get('chat-pending').hidden,
    respond(status = 200, data = { message: 'Actual reply', conversation_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }) {
      assert.ok(network.length); network.shift().resolve({ status, json: async () => data });
    },
    reject() { network.shift().reject(Error('Lost response')); },
    event(name, event = {}) { for (const fn of events.get(name) ?? []) fn(event); },
    host(host) { if (scope.GuideSystem._currentGuide === host) return; scope.GuideSystem._currentGuide = host; for (const fn of events.get('mall-guide-change') ?? []) fn({}); },
    posts() { return calls.filter(call => call.init.method === 'POST'); },
  };
}
test('UI retains draft until persisted and double-click cannot send twice', async () => {
  const h = await harness(); h.type('Hello'); const operation = h.send();
  assert.equal(h.nodes.get('chat-input').value, 'Hello'); assert.equal(h.nodes.get('chat-input').disabled, true);
  await h.send(); await h.tick(); assert.equal(h.posts().length, 1); assert.equal(h.nodes.get('chat-input').value, '');
  h.respond(); await operation; assert.match(h.text(), /HelloActual reply/); assert.equal(h.nodes.get('chat-input').disabled, false);
});
test('pending202 renders recovery control and never invents/speaks a host reply', async () => {
  const h = await harness(); h.type('Question'); const operation = h.send(); await h.tick(); h.respond(202, { state: 'DISPATCHED' }); await operation;
  assert.equal(h.pending(), true); assert.equal(h.nodes.get('chat-input').disabled, true);
  assert.equal(h.nodes.get('chat-original').textContent, 'Question'); assert.equal(h.nodes.get('chat-recover').hidden, false);
  assert.match(h.status(), /unresolved/); assert.equal(h.voice.length, 0); assert.equal(h.text(), 'Question');
  const recover = h.recover(); await h.tick(); h.respond(); await recover;
  assert.equal(h.pending(), false); assert.equal(h.nodes.get('chat-input').disabled, false); assert.match(h.text(), /Actual reply/);
});
test('rate limiting is a service notice, with no canned fallback, and restores rejected draft', async () => {
  const h = await harness(); h.type('Shop for streetwear'); const operation = h.send(); await h.tick(); h.respond(429, { rate_limited: true }); await operation;
  assert.match(h.status(), /message limit/); assert.equal(h.voice.length, 0); assert.equal(h.text(), 'Shop for streetwear');
  assert.equal(h.nodes.get('chat-input').value, 'Shop for streetwear'); assert.equal(h.pending(), false);
});
test('upgrade409 requires reload and never retries a new ID', async () => {
  const h = await harness(); h.type('Hello'); const operation = h.send(); await h.tick(); h.respond(409, { code: 'request_upgrade_required', admitted: false }); await operation;
  assert.match(h.status(), /Reload/); assert.equal(h.nodes.get('chat-input').disabled, true); await h.send(); assert.equal(h.posts().length, 1);
});
test('lost response reload exposes retained original and does not resend automatically', async () => {
  const h = await harness(); h.type('Original'); const operation = h.send(); await h.tick(); h.reject(); await operation;
  const reload = await harness({ local: h.local, locks: h.locks });
  assert.equal(reload.posts().length, 0); assert.equal(reload.pending(), true);
  assert.equal(reload.nodes.get('chat-input').disabled, true); assert.equal(reload.nodes.get('chat-original').textContent, 'Original');
});
test('legacy uncertainty blocks across reload and hides unsafe recovery control', async () => {
  const h = await harness({ durable: false }); h.type('Original'); const operation = h.send(); await h.tick(); h.reject(); await operation;
  const reload = await harness({ local: h.local }); assert.equal(reload.pending(), true); assert.equal(reload.nodes.get('chat-recover').hidden, true);
  assert.match(reload.nodes.get('chat-pending-detail').textContent, /contact support/); await reload.recover(); assert.equal(reload.posts().length, 0);
});
test('terminal state releases composer without resending retained text', async () => {
  const h = await harness(); h.type('Original'); const operation = h.send(); await h.tick(); h.respond(202, {}); await operation;
  const recovery = h.recover(); await h.tick(); h.respond(409, { code: 'request_terminal', terminal: true }); await recovery;
  assert.equal(h.nodes.get('chat-input').disabled, false); assert.equal(h.pending(), false); assert.equal(h.posts().length, 2); assert.equal(h.voice.length, 0);
});
test('room/host navigation suppresses stale reply and retains original for returning host', async () => {
  const h = await harness(); h.type('Original'); const operation = h.send(); await h.tick(); h.host('ginger'); h.respond(); await operation;
  assert.doesNotMatch(h.text(), /Actual reply/); assert.equal(h.voice.length, 0); assert.equal(h.pending(), false);
  h.host('laviche'); assert.equal(h.pending(), true); assert.equal(h.nodes.get('chat-input').disabled, true);
});
test('guest session change clears old visible history and never migrates retained request', async () => {
  const h = await harness(); h.type('Private original'); const operation = h.send(); await h.tick();
  h.local.setItem(SESSION_KEY, 'other-session'); h.event('storage', { key: SESSION_KEY }); await h.tick(); h.respond(); await operation;
  assert.equal(h.text(), ''); assert.equal(h.pending(), false); assert.equal(h.voice.length, 0);
  h.local.setItem(SESSION_KEY, 'opaque-session'); h.event('storage', { key: SESSION_KEY }); await h.tick();
  assert.equal(h.pending(), true); assert.equal(h.nodes.get('chat-original').textContent, 'Private original');
});
test('auth change does not interrupt valid guest recovery or change requester', async () => {
  const h = await harness(); h.type('Original'); const operation = h.send(); await h.tick(); h.respond(202, {}); await operation;
  const recovery = h.recover(); await h.tick(); h.event('mall-auth-change', { detail: { user: { id: 'signed-in-id' } } });
  h.respond(202, { recovery_required: true }); await h.tick();
  assert.equal(h.posts().length, 3); h.respond(); await recovery; assert.equal(h.pending(), false);
  assert.ok(h.posts().every(call => call.init.headers['X-Concierge-Requester'] === 'guest:opaque-session' && call.init.credentials === 'omit'));
});
test('storage events expose other tab’s pending message and cross-tab sends stay serialized', async () => {
  const h = await harness(), other = await harness({ local: h.local, locks: h.locks }); h.type('Original'); const operation = h.send(); await h.tick();
  other.event('storage', { key: [...h.local.items.keys()].find(key => key.startsWith('tru-skool:concierge:pending:')) });
  assert.equal(other.pending(), true); assert.equal(other.nodes.get('chat-input').disabled, true); await other.send(); assert.equal(other.posts().length, 0);
  h.respond(); await operation; other.event('storage', { key: 'tru-skool:concierge:pending:changed' }); assert.equal(other.pending(), false);
});
test('user and API text are rendered as text, never HTML', async () => {
  const h = await harness(); const injection = '<img src=x onerror=alert(1)>';
  h.type(injection); const operation = h.send(); await h.tick(); h.respond(200, { message: injection }); await operation;
  assert.equal(h.text(), injection + injection); assert.equal(h.nodes.get('chat-messages').children.length, 2);
});
test('old host-only conversation IDs are not attached to a possibly different guest', async () => {
  const local = storage(); local.setItem('mall:concierge:conv-id:laviche', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  const h = await harness({ local }); h.type('New scoped request'); const operation = h.send(); await h.tick();
  assert.equal(JSON.parse(h.posts()[0].init.body).conversation_id, null); h.respond(); await operation;
  assert.ok(local.getItem('mall:concierge:conv-id:v2:opaque-session:laviche'));
});
test('static UI wiring includes retained notice, input bound, and no direct proxy path', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /id="chat-input" maxlength="2000" disabled/); assert.match(html, /ChatEngine\.recover\(\)/);
  assert.match(html, /Signing in does not share Café chat history/);
  const js = fs.readFileSync(path.join(root, 'js/chat-engine.js'), 'utf8');
  assert.doesNotMatch(js, /fallbackResponse|api\.anthropic\.com|\/api\/chat|innerHTML/);
  assert.match(fs.readFileSync(path.join(root, 'js/guide-system.js'), 'utf8'), /mall-guide-change/);
});
test('late session initialization cannot replace a newer guest session', async () => {
  const held = [];
  const locks = { request(key, callback) {
    assert.equal(key, 'mall:concierge:session-init');
    return new Promise(resolve => { Promise.resolve(callback()).then(id => held.push(() => resolve(id))); });
  } };
  const h = await harness({ locks }); assert.equal(held.length, 1);
  h.local.setItem(SESSION_KEY, 'newer-session'); h.event('storage', { key: SESSION_KEY }); await h.tick();
  assert.equal(held.length, 2); held[1](); await h.tick(); assert.equal(h.engine._session, 'newer-session');
  held[0](); await h.tick(); assert.equal(h.engine._session, 'newer-session');
  assert.equal(h.nodes.get('chat-input').disabled, false);
});
test('irrelevant auth refresh and same-guide movement preserve a known legacy reply', async () => {
  for (const event of ['TOKEN_REFRESHED', 'INITIAL_SESSION', 'SIGNED_IN']) {
    const h = await harness({ durable: false }); h.type('Original'); const operation = h.send(); await h.tick();
    h.event('mall-auth-change', { detail: { event, user: { id: 'mall-account' } } }); h.host('laviche'); h.respond(); await operation;
    assert.match(h.text(), /Actual reply/); assert.equal(h.pending(), false); assert.equal(h.nodes.get('chat-input').disabled, false);
  }
});
test('legacy reply arriving after host navigation is saved for original host, even after reload', async () => {
  const h = await harness({ durable: false }); h.type('Original'); const operation = h.send(); await h.tick();
  const original = h.posts()[0].init.body; h.host('ginger'); h.respond(); await operation;
  assert.doesNotMatch(h.text(), /Actual reply/); assert.equal(h.voice.length, 0);
  const reload = await harness({ local: h.local, durable: false });
  assert.equal(reload.pending(), true); assert.equal(reload.nodes.get('chat-recover').hidden, false);
  assert.equal(reload.nodes.get('chat-recover').textContent, 'Show saved result');
  assert.equal(reload.engine._transport.inspect('laviche', 'opaque-session').pending[0].body, original);
  await reload.recover(); assert.match(reload.text(), /Actual reply/); assert.equal(reload.posts().length, 0);
  assert.equal(reload.pending(), false); assert.equal(reload.nodes.get('chat-input').disabled, false);
});
test('legacy known result cannot be displayed in a replacement guest session', async () => {
  const h = await harness({ durable: false }); h.type('Original'); const operation = h.send(); await h.tick();
  h.local.setItem(SESSION_KEY, 'replacement-session'); h.event('storage', { key: SESSION_KEY }); await h.tick(); h.respond(); await operation;
  await h.recover(); assert.equal(h.text(), ''); assert.equal(h.voice.length, 0);
  h.local.setItem(SESSION_KEY, 'opaque-session'); h.event('storage', { key: SESSION_KEY }); await h.tick();
  assert.equal(h.nodes.get('chat-recover').textContent, 'Show saved result'); await h.recover(); assert.match(h.text(), /Actual reply/);
  assert.equal(h.posts().length, 1);
});
test('guide change during delayed session initialization does not leave chat disabled', async () => {
  const held = [];
  const locks = { request(key, callback) {
    return new Promise(resolve => Promise.resolve(callback()).then(id => held.push(() => resolve(id))));
  } };
  const h = await harness({ locks }); h.host('ginger'); held[0](); await h.tick();
  assert.equal(h.engine._session, 'opaque-session'); assert.equal(h.nodes.get('chat-input').disabled, false);
});
test('actual guide system emits lifecycle events only when active guide really changes', () => {
  const events = [], scope = { window: { MallState: { chatOpen: false }, dispatchEvent: event => events.push(event) },
    document: { querySelector: () => null }, CustomEvent: function (type, args) { this.type = type; this.detail = args.detail; } };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/guide-system.js'), 'utf8'), scope);
  scope.window.GuideSystem.switchGuide('laviche', 'new-laviche-zone'); assert.equal(events.length, 0);
  scope.window.GuideSystem.switchGuide('ginger', 'wanderlust'); assert.equal(events.length, 1);
  scope.window.GuideSystem.switchGuide('ginger', 'another-zone'); assert.equal(events.length, 1);
});
