const memoryKey = 'sota_memory';
const sessionKey = 'sota_session_id';
const userKey = 'sota_user';

let sessionId = null;
let chatHistory = [];
let currentUser = null;

// Инициализация сессии и пользователя
async function initSession() {
  currentUser = JSON.parse(localStorage.getItem(userKey));
  sessionId = localStorage.getItem(sessionKey);

  if (!sessionId) {
    const res = await fetch('https://cha-server.onrender.com/api/session');
    const data = await res.json();
    sessionId = data.sessionId;
    localStorage.setItem(sessionKey, sessionId);
  }

  const historyRes = await fetch(`https://cha-server.onrender.com/api/history/${sessionId}`);
  const historyData = await historyRes.json();
  chatHistory = historyData.history || [];
  renderHistory();
  return sessionId;
}

// Рендер истории сообщений
function renderHistory() {
  const chat = document.getElementById('chat');
  chat.innerHTML = '';
  for (const msg of chatHistory) {
    const div = document.createElement('div');
    div.textContent = msg.text;
    div.className = msg.role === 'user' ? 'user' : 'bot';
    chat.appendChild(div);
  }
  chat.scrollTop = chat.scrollHeight;
}

// Сохраняем историю на сервер
async function saveHistory() {
  await fetch(`https://cha-server.onrender.com/api/history/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history: chatHistory })
  });
}

// Отправка сообщения в чат
async function sendMessage(text) {
  if (!sessionId) await initSession();

  chatHistory.push({ role: 'user', text });
  renderHistory();

  const res = await fetch('https://cha-server.onrender.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, sessionId })
  });

  const data = await res.json();
  chatHistory.push({ role: 'bot', text: data.reply });
  renderHistory();

  await saveHistory();
  return data.reply;
}

// Регистрация пользователя
async function register(email, password, displayName) {
  const res = await fetch('https://cha-server.onrender.com/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName })
  });
  const data = await res.json();
  if (res.ok) {
    currentUser = data.user;
    localStorage.setItem(userKey, JSON.stringify(currentUser));
    return { success: true };
  } else {
    return { success: false, error: data.error };
  }
}

// Вход пользователя
async function login(email, password) {
  const res = await fetch('https://cha-server.onrender.com/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok) {
    currentUser = data.user;
    localStorage.setItem(userKey, JSON.stringify(currentUser));
    return { success: true };
  } else {
    return { success: false, error: data.error };
  }
}

// Экспорт для UI
window.sendMessage = sendMessage;
window.initSession = initSession;
window.register = register;
window.login = login;
window.getCurrentUser = () => currentUser;