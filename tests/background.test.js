import { test } from 'node:test';
import assert from 'node:assert/strict';

test('migrates old rule, persists settings, handles pause and rejects page mutations', async () => {
  let rules = [{ id: 1 }], settings = {};
  const listeners = {};
  const event = name => ({ addListener: fn => { listeners[name] = fn; } });
  globalThis.chrome = {
    runtime: { onInstalled: event('install'), onStartup: event('startup'), onMessage: event('message'), getURL: path => 'chrome-extension://test/' + path },
    declarativeNetRequest: {
      getDynamicRules: async () => rules,
      updateDynamicRules: async change => {
        rules = rules.filter(r => !change.removeRuleIds.includes(r.id)).concat(change.addRules);
      }
    },
    storage: { local: { get: async () => ({ ...settings }), set: async value => { settings = value; } } },
    action: { setBadgeText: async () => {}, setBadgeBackgroundColor: async () => {} },
    tabs: { create: async () => {} }
  };
  await import('../background.js');
  const send = (message, url = 'chrome-extension://test/popup.html') => new Promise(resolve => {
    const waiting = listeners.message(message, { url }, resolve);
    if (!waiting) resolve(undefined);
  });
  listeners.install();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(rules.some(r => r.id === 1), false);
  assert.equal(rules.length, 4);
  assert.deepEqual(settings, { enabled: true, accountIndex: 1 });
  assert.equal((await send({ type: 'save', settings: { enabled: false, accountIndex: 2 } })).ok, true);
  assert.equal(rules.length, 0);
  listeners.startup();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(rules.length, 0);
  assert.equal((await send({ type: 'save', settings: { accountIndex: -1 } })).ok, false);
  assert.equal((await send({ type: 'save', settings: { enabled: true } }, 'https://www.youtube.com/oops')).ok, false);
  assert.equal(await send({ type: 'choose' }, 'https://evil.test/'), undefined);
  assert.equal((await send({ type: 'settings' }, 'https://www.youtube.com/oops')).value.accountIndex, 2);
  delete globalThis.chrome;
});
