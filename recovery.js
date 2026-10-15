// Only on YouTube's error page; never scrape account details or cookies.
(async () => {
  const response = await chrome.runtime.sendMessage({ type: 'settings' });
  if (!response?.ok || !response.value.enabled) return;
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = ':host{position:fixed;bottom:24px;left:24px;z-index:2147483647;max-width:390px}section{font:14px/1.5 system-ui,sans-serif;background:#fff;color:#202124;padding:20px;border:1px solid #dadce0;border-radius:8px}h2{font-size:16px;margin:0 0 8px}p{margin:0 0 14px}button{font:inherit;cursor:pointer;border:0;border-radius:5px;padding:9px 12px;background:#2459a6;color:#fff}button:last-child{margin-left:8px;background:#edf2fa;color:#2459a6}';
  const section = document.createElement('section');
  section.setAttribute('role', 'region');
  section.setAttribute('aria-label', 'YouTube Account Switcher');
  const heading = document.createElement('h2');
  heading.textContent = 'Vérifie le compte YouTube';
  const text = document.createElement('p');
  text.textContent = `Le compte n° ${response.value.accountIndex} est sélectionné. Il peut être déconnecté ou indisponible. Reconnecte ton compte secondaire, puis réessaie depuis l’extension.`;
  const choose = document.createElement('button');
  choose.textContent = 'Choisir un compte';
  choose.addEventListener('click', async () => {
    try {
      const result = await chrome.runtime.sendMessage({ type: 'choose' });
      if (!result?.ok) throw new Error();
    } catch { text.textContent = 'Ouvre accounts.google.com pour reconnecter ton compte secondaire.'; }
  });
  const dismiss = document.createElement('button');
  dismiss.textContent = 'Fermer';
  dismiss.addEventListener('click', () => host.remove());
  section.append(heading, text, choose, dismiss);
  root.append(style, section);
  document.documentElement.append(host);
})().catch(console.error);
