import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(bodyParser.json());

// Хранение истории сообщений для сессий (до 5 сообщений)
const sessionMemory = new Map();

function emojify(text, emoji) {
  return `${text} ${emoji}`;
}

function getMoodReply(message) {
  const lower = message.toLowerCase();
  const time = new Date().getHours();

  if (lower.includes("один") || lower.includes("груст")) {
    return emojify("Мне жаль, что ты чувствуешь себя так...", "🫂");
  } else if (lower.includes("смерть") || lower.includes("умирать")) {
    return emojify("Жизнь сложна, но ты не один.", "🖤");
  } else if (lower.includes("люблю") || lower.includes("сердце")) {
    return emojify("О, ты говоришь о чувствах...", "❤️");
  } else if (lower.includes("счастье") || lower.includes("ура")) {
    return emojify("Это прекрасно слышать!", "🌞");
  } else if (lower.includes("сон") || lower.includes("спать")) {
    return emojify("Может, пора немного отдохнуть?", "🌙");
  }

  if (time >= 5 && time < 12) return "Доброе утро!";
  if (time >= 12 && time < 18) return "Добрый день!";
  if (time >= 18 && time < 23) return "Добрый вечер!";
  return "Спокойной ночи...";
}

// Эндпоинт для создания сессии
app.get('/api/session', (req, res) => {
  const sessionId = uuidv4();
  sessionMemory.set(sessionId, []);
  res.json({ sessionId });
});

// Основной чат-эндпоинт с сессией
app.post('/api/chat', (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ reply: '⚠️ Пустое сообщение.' });
  }
  if (!sessionId || !sessionMemory.has(sessionId)) {
    return res.status(400).json({ reply: '⚠️ Некорректная сессия.' });
  }

  const history = sessionMemory.get(sessionId);
  history.push({ role: 'user', text: message });
  if (history.length > 5) history.shift();

  console.log(`[${new Date().toLocaleTimeString()}] [${sessionId}] Пользователь: ${message}`);

  const reply = getMoodReply(message);

  history.push({ role: 'bot', text: reply });
  sessionMemory.set(sessionId, history);

  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`CHA-сервер запущен на порту ${PORT}`);
});