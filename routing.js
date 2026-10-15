export function normalizeSettings(settings = {}) {
  const accountIndex = Number(settings.accountIndex ?? 1);
  if (!Number.isInteger(accountIndex) || accountIndex < 0 || accountIndex > 99) {
    throw new Error('Choisissez un numéro de compte entre 0 et 99.');
  }
  return { enabled: settings.enabled !== false, accountIndex };
}

export function buildRules(settings) {
  const { enabled, accountIndex } = normalizeSettings(settings);
  if (!enabled) return [];
  const host = '^https?://(www\\.|m\\.|music\\.)?youtube\\.com/';
  const pages = ['main_frame', 'sub_frame'];
  const redirect = { type: 'redirect', redirect: { transform: { queryTransform: {
    addOrReplaceParams: [{ key: 'authuser', value: String(accountIndex) }]
  } } } };
  return [
    // Keep authentication, account selection and error pages accessible.
    { id: 10, priority: 3, action: { type: 'allow' }, condition: {
      regexFilter: host + '(oops|signin|logout|signin_passive|signin_session|channel_switcher|account)([/?#]|$)',
      resourceTypes: pages
    } },
    // Explicit stop condition prevents repeated redirects.
    { id: 11, priority: 2, action: { type: 'allow' }, condition: {
      regexFilter: host + '[^?]*\\?([^#]*&)?authuser=' + accountIndex + '(&|#|$)',
      resourceTypes: pages, isUrlFilterCaseSensitive: true
    } },
    { id: 12, priority: 1, action: redirect, condition: {
      regexFilter: host, resourceTypes: ['main_frame'], requestMethods: ['get']
    } },
    { id: 13, priority: 1, action: redirect, condition: {
      regexFilter: host + 'embed/', resourceTypes: ['sub_frame'], requestMethods: ['get']
    } }
  ];
}

export function accountChooserURL() {
  const url = new URL('https://accounts.google.com/AccountChooser');
  url.searchParams.set('service', 'youtube');
  url.searchParams.set('continue', 'https://www.youtube.com/');
  return url.href;
}

export function youtubeURL(input, accountIndex) {
  let url;
  try { url = new URL(input); } catch { /* Default to homepage. */ }
  if (!url || !/^https?:$/.test(url.protocol) || !/^(www\.|m\.|music\.)?youtube\.com$/.test(url.hostname) ||
      /^\/(oops|signin|logout|channel_switcher|account)(\/|$)/.test(url.pathname)) {
    url = new URL('https://www.youtube.com/');
  }
  url.searchParams.set('authuser', String(normalizeSettings({ accountIndex }).accountIndex));
  return url.href;
}
