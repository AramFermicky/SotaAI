import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(bodyParser.json());

function getMoodReply(message) {
  const lower = message.toLowerCase();
  const time = new Date().getHours();
  const emojify = (text, emoji) => `${text} ${emoji}`;

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

  // Время суток
  if (time >= 5 && time < 12) return "Доброе утро!";
  if (time >= 12 && time < 18) return "Добрый день!";
  if (time >= 18 && time < 23) return "Добрый вечер!";
  return "Спокойной ночи...";
}

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  console.log(`[${new Date().toLocaleTimeString()}] Пользователь: ${message}`);

  if (!message) {
    return res.status(400).json({ reply: '⚠️ Пустое сообщение.' });
  }

  const reply = getMoodReply(message);
  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`CHA-сервер запущен на порту ${PORT}`);
});