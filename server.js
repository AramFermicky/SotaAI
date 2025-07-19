import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { registerUser, loginUser } from './auth.js';

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(bodyParser.json());

const dataDir = path.resolve('./session_data');
await fs.mkdir(dataDir, { recursive: true });

async function readHistory(sessionId) {
  const file = path.join(dataDir, `${sessionId}.json`);
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeHistory(sessionId, history) {
  const file = path.join(dataDir, `${sessionId}.json`);
  await fs.writeFile(file, JSON.stringify(history, null, 2), 'utf-8');
}

// Создать новую сессию
app.get('/api/session', async (req, res) => {
  const sessionId = uuidv4();
  await writeHistory(sessionId, []);
  res.json({ sessionId });
});

// Получить историю чата
app.get('/api/history/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const history = await readHistory(sessionId);
  res.json({ history });
});

// Сохранить историю чата
app.post('/api/history/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { history } = req.body;
  if (!Array.isArray(history)) return res.status(400).json({ error: 'Неверный формат истории' });
  await writeHistory(sessionId, history);
  res.json({ success: true });
});

// Обработка сообщений от клиента
app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ reply: '⚠️ Пустое сообщение.' });
  if (!sessionId) return res.status(400).json({ reply: '⚠️ Нет sessionId.' });

  const history = await readHistory(sessionId);
  history.push({ role: 'user', text: message });
  if (history.length > 100) history.shift();

  // Пока простой ответ, позже можно улучшить логику
  let reply = 'Привет! Я СОТА, пока не знаю, что ответить.';

  history.push({ role: 'bot', text: reply });

  await writeHistory(sessionId, history);
  res.json({ reply });
});

// --- Новые маршруты регистрации и логина ---

app.post('/api/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  const result = await registerUser(email, password, displayName);
  if (!result.success) return res.status(400).json({ error: result.error });
  res.json({ user: result.user });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  if (!result.success) return res.status(401).json({ error: result.error });
  res.json({ user: result.user });
});

app.listen(PORT, () => {
  console.log(`СОТА сервер с регистрацией запущен на порту ${PORT}`);
});