import { buildRules, normalizeSettings, accountChooserURL, youtubeURL } from './routing.js';

// Serialize mutations so startup cannot overwrite a later settings change.
let queue = Promise.resolve();
function configure(settings) {
  const task = queue.then(async () => {
    const next = normalizeSettings(settings ?? await chrome.storage.local.get(['enabled', 'accountIndex']));
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map(rule => rule.id), addRules: buildRules(next)
    });
    await chrome.storage.local.set(next);
    await chrome.action.setBadgeText({ text: next.enabled ? String(next.accountIndex) : 'OFF' });
    await chrome.action.setBadgeBackgroundColor({ color: next.enabled ? '#2459a6' : '#666666' });
    return next;
  });
  queue = task.catch(() => {});
  return task;
}
async function initialize() {
  await configure();
}
chrome.runtime.onInstalled.addListener(() => initialize().catch(console.error));
chrome.runtime.onStartup.addListener(() => initialize().catch(console.error));
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  const fromPage = sender.url?.startsWith('https://www.youtube.com/oops');
  const fromExtension = sender.url?.startsWith(chrome.runtime.getURL(''));
  if (!fromExtension && !fromPage) return;
  (async () => {
    if (message.type === 'settings') {
      return normalizeSettings(await chrome.storage.local.get(['enabled', 'accountIndex']));
    }
    if (message.type === 'save' && fromExtension) return configure(message.settings);
    if (message.type === 'choose') {
      await chrome.tabs.create({ url: accountChooserURL() });
      return true;
    }
    if (message.type === 'open' && fromExtension) {
      const settings = normalizeSettings(await chrome.storage.local.get(['enabled', 'accountIndex']));
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = youtubeURL(tab?.url, settings.accountIndex);
      if (tab?.id && /^https?:\/\/(www\.|m\.|music\.)?youtube\.com\//.test(tab.url || '')) {
        await chrome.tabs.update(tab.id, { url });
      } else {
        await chrome.tabs.create({ url });
      }
      return true;
    }
    throw new Error('Unknown action');
  })().then(value => respond({ ok: true, value }), error => respond({ ok: false, error: error.message }));
  return true;
});
