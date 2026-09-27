const loginView = document.querySelector('#login-view');
const colorsView = document.querySelector('#colors-view');
const loginForm = document.querySelector('#login-form');
const addForm = document.querySelector('#add-form');
const searchForm = document.querySelector('#search-form');
const loginMessage = document.querySelector('#login-message');
const addMessage = document.querySelector('#add-message');
const searchMessage = document.querySelector('#search-message');
const results = document.querySelector('#results');
const displayName = document.querySelector('#display-name');

let currentUser = null;

async function post(endpoint, body) {
  const response = await fetch(`/LAMPAPI/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return payload;
}

function showMessage(element, text) {
  element.textContent = text;
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage(loginMessage, 'Signing in...');
  try {
    const data = await post('Login.php', {
      login: loginForm.login.value,
      password: loginForm.password.value,
    });
    if (!data.id) {
      showMessage(loginMessage, 'Invalid username or password.');
      return;
    }
    currentUser = data;
    displayName.textContent = `${data.firstName} ${data.lastName}`;
    loginForm.reset();
    showMessage(loginMessage, '');
    loginView.hidden = true;
    colorsView.hidden = false;
  } catch (error) {
    showMessage(loginMessage, error.message);
  }
});

addForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentUser) return;
  const color = addForm.color.value.trim();
  showMessage(addMessage, 'Adding...');
  try {
    const data = await post('AddColor.php', { userId: currentUser.id, color });
    if (data.error) throw new Error(data.error);
    showMessage(addMessage, `Added ${color}.`);
    addForm.reset();
  } catch (error) {
    showMessage(addMessage, error.message);
  }
});

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentUser) return;
  results.replaceChildren();
  showMessage(searchMessage, 'Searching...');
  try {
    const data = await post('SearchColors.php', {
      userId: currentUser.id,
      search: searchForm.search.value.trim(),
    });
    for (const color of data.results) {
      const item = document.createElement('li');
      item.textContent = color;
      results.append(item);
    }
    showMessage(
      searchMessage,
      data.results.length ? `${data.results.length} color(s) found.` : 'No matching colors found.',
    );
  } catch (error) {
    showMessage(searchMessage, error.message);
  }
});

document.querySelector('#logout-button').addEventListener('click', () => {
  currentUser = null;
  results.replaceChildren();
  addForm.reset();
  searchForm.reset();
  showMessage(addMessage, '');
  showMessage(searchMessage, '');
  colorsView.hidden = true;
  loginView.hidden = false;
});

