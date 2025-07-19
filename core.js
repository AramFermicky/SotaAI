import { loadMemory, saveMemory, addMessage, loadSessionId, saveSessionId } from './memory.js';

let sessionId = loadSessionId();

export async function initCore() {
  if (!sessionId) {
    // Запрос на сервер за новым sessionId
    const res = await fetch('https://cha-server.onrender.com/api/session');
    const data = await res.json();
    sessionId = data.sessionId;
    saveSessionId(sessionId);
  }
}

export async function sendMessage(text) {
  addMessage(text, 'user');

  const res = await fetch('https://cha-server.onrender.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, sessionId })
  });

  const data = await res.json();

  if (data.reply) {
    addMessage(data.reply, 'bot');
    return data.reply;
  }

  return '❓ Нет ответа.';
}