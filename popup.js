const form = document.querySelector('form');
const enabled = document.querySelector('#enabled');
const accountIndex = document.querySelector('#accountIndex');
const status = document.querySelector('#status');
async function send(message) {
  const response = await chrome.runtime.sendMessage(message);
  if (!response?.ok) throw new Error(response?.error || 'Extension indisponible. Recharge-la dans chrome://extensions.');
  return response.value;
}
async function save() {
  if (!form.reportValidity()) throw new Error('Vérifie le numéro de compte.');
  return send({ type: 'save', settings: { enabled: enabled.checked, accountIndex: Number(accountIndex.value) } });
}
async function run(action) {
  try { await action(); } catch (error) { status.textContent = error.message; }
}
form.addEventListener('submit', event => {
  event.preventDefault();
  run(async () => { await save(); status.textContent = 'Réglages enregistrés.'; });
});
document.querySelector('#open').addEventListener('click', () => run(async () => {
  await save(); await send({ type: 'open' }); window.close();
}));
document.querySelector('#choose').addEventListener('click', () => run(async () => {
  await send({ type: 'choose' }); window.close();
}));
for (const control of document.querySelectorAll('button, input')) control.disabled = true;
run(async () => {
  const settings = await send({ type: 'settings' });
  enabled.checked = settings.enabled;
  accountIndex.value = settings.accountIndex;
  for (const control of document.querySelectorAll('button, input')) control.disabled = false;
});
