const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');
const element = (id) => document.getElementById(id);
const reply = (body, ok = true) => ({ ok, status: ok ? 200 : 500, json: async () => body });

async function submit(id) {
  element(id).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  // Let the fetch and JSON promise callbacks finish before checking the UI.
  for (let i = 0; i < 10; i++) await Promise.resolve();
}

beforeEach(() => {
  document.body.innerHTML = html;
  global.fetch = jest.fn();
  new Function('document', 'fetch', app)(document, global.fetch);
});

async function login() {
  fetch.mockResolvedValueOnce(reply({ id: 1, firstName: 'Test', lastName: 'User', error: '' }));
  element('login').value = 'test';
  element('password').value = 'password';
  await submit('login-form');
}

test('invalid credentials keep the collection hidden and show feedback', async () => {
  fetch.mockResolvedValueOnce(reply({ id: 0, error: 'No Records Found' }));
  await submit('login-form');
  expect(element('colors-view').hidden).toBe(true);
  expect(element('login-message').textContent).toBe('Invalid username or password.');
});

test('adding a color trims its name and clears the input after success', async () => {
  await login();
  fetch.mockResolvedValueOnce(reply({ error: '' }));
  element('color').value = '  Orange  ';
  await submit('add-form');
  expect(fetch).toHaveBeenLastCalledWith('/LAMPAPI/AddColor.php', expect.objectContaining({
    method: 'POST', body: JSON.stringify({ userId: 1, color: 'Orange' }),
  }));
  expect(element('add-message').textContent).toBe('Added Orange.');
  expect(element('color').value).toBe('');
});

test('failed adds preserve the input so the user can retry', async () => {
  await login();
  fetch.mockResolvedValueOnce(reply({ error: 'Database connection failed' }, false));
  element('color').value = 'Blue';
  await submit('add-form');
  expect(element('add-message').textContent).toBe('Database connection failed');
  expect(element('color').value).toBe('Blue');
});

test('search renders color names as text, never HTML', async () => {
  await login();
  const name = '<img src=x onerror=alert(1)>';
  fetch.mockResolvedValueOnce(reply({ results: [name], error: '' }));
  await submit('search-form');
  expect(element('results').children).toHaveLength(1);
  expect(element('results').firstChild.textContent).toBe(name);
  expect(element('results').querySelector('img')).toBeNull();
});

test('logout clears results and blocks further color requests', async () => {
  await login();
  element('results').innerHTML = '<li>Blue</li>';
  element('logout-button').click();
  expect(element('results').children).toHaveLength(0);
  expect(element('colors-view').hidden).toBe(true);
  expect(element('login-view').hidden).toBe(false);
  fetch.mockClear();
  await submit('add-form');
  expect(fetch).not.toHaveBeenCalled();
});
