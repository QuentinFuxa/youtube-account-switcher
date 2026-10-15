import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRules, normalizeSettings, accountChooserURL, youtubeURL } from '../routing.js';

function route(input, type = 'main_frame', method = 'get', settings = {}) {
  const rule = buildRules(settings).filter(({ condition: c }) =>
    c.resourceTypes.includes(type) && (!c.requestMethods || c.requestMethods.includes(method)) &&
    new RegExp(c.regexFilter, c.isUrlFilterCaseSensitive ? '' : 'i').test(input)
  ).sort((a, b) => b.priority - a.priority)[0];
  if (rule?.action.type !== 'redirect') return input;
  const url = new URL(input);
  for (const p of rule.action.redirect.transform.queryTransform.addOrReplaceParams) url.searchParams.set(p.key, p.value);
  return url.href;
}

test('migrates v1 defaults and validates configuration', () => {
  assert.deepEqual(normalizeSettings(), { enabled: true, accountIndex: 1 });
  assert.deepEqual(normalizeSettings({ enabled: false, accountIndex: '2' }), { enabled: false, accountIndex: 2 });
  for (const accountIndex of [-1, 100, 1.2, 'junk']) assert.throws(() => normalizeSettings({ accountIndex }));
});
for (const path of ['/', '/watch?v=abc&t=32', '/shorts/abc', '/results?search_query=music', '/playlist?list=abc']) {
  test('routes once and preserves destination: ' + path, () => {
    const input = 'https://www.youtube.com' + path + '#section';
    const output = route(input);
    assert.equal(new URL(output).searchParams.get('authuser'), '1');
    assert.equal(new URL(output).hash, '#section');
    assert.equal(route(output), output);
    const original = new URL(input);
    const result = new URL(output); result.searchParams.delete('authuser');
    assert.equal(result.href, original.href);
  });
}
test('replaces an explicit different account and keeps account 0 valid', () => {
  assert.equal(route('https://www.youtube.com/?authuser=0&v=abc'), 'https://www.youtube.com/?authuser=1&v=abc');
  assert.equal(route('https://www.youtube.com/?authuser=10'), 'https://www.youtube.com/?authuser=1');
  assert.equal(route('https://www.youtube.com/', 'main_frame', 'get', { accountIndex: 0 }), 'https://www.youtube.com/?authuser=0');
});
test('does not intercept login, error or selection pages', () => {
  for (const path of ['/oops', '/oops?authuser=0', '/signin?next=x', '/logout', '/signin_passive', '/signin_session', '/channel_switcher', '/account']) {
    const url = 'https://www.youtube.com' + path;
    assert.equal(route(url), url);
  }
});
test('matches only intended hosts, document GET requests and embedded players', () => {
  for (const url of ['https://evilyoutube.com/', 'https://www.youtube.com.evil.test/', 'https://studio.youtube.com/', 'https://accounts.google.com/', 'https://example.com/?next=https://www.youtube.com/']) assert.equal(route(url), url);
  for (const host of ['youtube.com', 'm.youtube.com', 'music.youtube.com']) assert.match(route('https://' + host + '/'), /authuser=1/);
  const embed = 'https://www.youtube.com/embed/abc?start=10';
  assert.match(route(embed, 'sub_frame'), /start=10&authuser=1/);
  for (const type of ['xmlhttprequest', 'script', 'image', 'media']) assert.equal(route(embed, type), embed);
  assert.equal(route('https://www.youtube.com/api', 'main_frame', 'post'), 'https://www.youtube.com/api');
  assert.equal(route('https://www.youtube.com/', 'sub_frame'), 'https://www.youtube.com/');
  assert.equal(route(embed, 'main_frame', 'get', { enabled: false }), embed);
});
test('opens a genuine Google chooser and safely repairs an error destination', () => {
  const chooser = new URL(accountChooserURL());
  assert.equal(chooser.origin, 'https://accounts.google.com');
  assert.equal(chooser.searchParams.get('continue'), 'https://www.youtube.com/');
  for (const input of [undefined, 'https://www.youtube.com/oops', 'https://evil.test/', 'javascript:alert(1)']) {
    assert.equal(youtubeURL(input, 2), 'https://www.youtube.com/?authuser=2');
  }
  assert.equal(youtubeURL('https://www.youtube.com/watch?v=abc&t=20#x', 2), 'https://www.youtube.com/watch?v=abc&t=20&authuser=2#x');
});
