const memoryKey = 'sota_memory';
const sessionKey = 'sota_session_id';

export function loadMemory() {
  const mem = localStorage.getItem(memoryKey);
  return mem ? JSON.parse(mem) : [];
}

export function saveMemory(history) {
  localStorage.setItem(memoryKey, JSON.stringify(history.slice(-5)));
}

export function addMessage(text, role = 'user') {
  const history = loadMemory();
  history.push({ role, text });
  saveMemory(history);
  return history;
}

export function loadSessionId() {
  return localStorage.getItem(sessionKey);
}

export function saveSessionId(id) {
  localStorage.setItem(sessionKey, id);
}