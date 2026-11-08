const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../api/chat.js'), 'utf8');
test('all old proxy methods return provider-free 410 without CORS, redirects, secrets or body access', async () => {
  const calls = [], scope = { module: { exports: null }, fetch: () => { throw Error('Provider must never run'); },
    process: new Proxy({}, { get() { throw Error('Credentials must never be read'); } }) };
  vm.runInNewContext(source, scope);
  for (const method of ['POST', 'GET', 'OPTIONS', 'HEAD', 'PUT']) {
    const req = { method, get body() { throw Error('Request payload must never be forwarded'); } };
    const headers = {}, res = { setHeader: (key, value) => { headers[key] = value; }, status(code) { this.code = code; return this; }, json(data) { calls.push(data); return data; } };
    await scope.module.exports(req, res);
    assert.equal(res.code, 410); assert.equal(headers['Cache-Control'], 'no-store');
    assert.equal(headers['Access-Control-Allow-Origin'], undefined); assert.equal(headers.Location, undefined);
    assert.equal(calls.at(-1).code, 'legacy_chat_retired');
  }
});
test('no direct provider implementation or browser secret recommendation survives in repaired paths', () => {
  assert.doesNotMatch(source, /api\.anthropic\.com|ANTHROPIC_API_KEY|x-api-key|messages\.slice/);
  assert.doesNotMatch(fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8'), /localStorage\.setItem\('ANTHROPIC_API_KEY'|ChatEngine\.useDirectAPI|proxies requests securely/);
});
