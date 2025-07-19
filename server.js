// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3030;

// Подключаемся к MongoDB
mongoose.connect('mongodb://localhost:27017/sota_users', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB подключён'))
.catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Схема пользователя
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  data: { type: Object, default: {} },     // Полные данные пользователя
  updatedAt: { type: Date, default: Date.now } // Дата обновления данных
});

const User = mongoose.model('User', userSchema);

app.use(cors());
app.use(bodyParser.json());

// Получить данные пользователя по email
app.get('/api/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json({ data: user.data, updatedAt: user.updatedAt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать или обновить данные пользователя
app.post('/api/user/:email', async (req, res) => {
  const { data, updatedAt } = req.body;
  if (!data || !updatedAt) {
    return res.status(400).json({ error: 'Недостаточно данных' });
  }

  try {
    let user = await User.findOne({ email: req.params.email });
    const clientUpdatedAt = new Date(updatedAt);

    if (!user) {
      user = new User({
        email: req.params.email,
        data,
        updatedAt: clientUpdatedAt
      });
    } else {
      // Обновляем данные только если они новее
      if (clientUpdatedAt > user.updatedAt) {
        user.data = data;
        user.updatedAt = clientUpdatedAt;
      }
    }

    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер СОТА запущен на порту ${PORT}`);
});