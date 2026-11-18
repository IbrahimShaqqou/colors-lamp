// Real HTTP -> PHP -> MySQL checks. Run against a disposable seeded database.
const base = process.env.COLORS_TEST_API_URL || 'http://127.0.0.1:8080';
async function post(endpoint, body) {
  const response = await fetch(`${base}/${endpoint}.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

test('login returns the seeded user and expected JSON fields', async () => {
  const result = await post('Login', { login: 'ci-user', password: 'ci-password' });
  expect(result.status).toBe(200);
  expect(result.body).toEqual({ id: 1, firstName: 'CI', lastName: 'User', error: '' });
});

test('invalid credentials do not authenticate', async () => {
  const result = await post('Login', { login: 'ci-user', password: 'wrong' });
  expect(result.body.id).toBe(0);
  expect(result.body.error).not.toBe('');
});

test('add and search persist colors and keep users collections separate', async () => {
  const name = `CI-${Date.now()}`;
  const added = await post('AddColor', { userId: 1, color: name });
  expect(added).toEqual({ status: 200, body: { error: '' } });
  const found = await post('SearchColors', { userId: 1, search: name });
  expect(found.status).toBe(200);
  expect(found.body).toEqual({ results: [name], searchResults: name, error: '' });
  const other = await post('SearchColors', { userId: 2, search: name });
  expect(other.body.results).toEqual([]);
});

test('empty color names return a JSON validation error', async () => {
  const result = await post('AddColor', { userId: 1, color: '   ' });
  expect(result.status).toBe(400);
  expect(result.body.error).toMatch(/color/);
});

test('malformed JSON returns HTTP 400 and a JSON error', async () => {
  const response = await fetch(`${base}/Login.php`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad',
  });
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: 'Invalid JSON body' });
});
