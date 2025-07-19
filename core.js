// core.js
// Модуль общения с ботом СОТА через HTTP API

const API_URL = 'https://cha-server.onrender.com/api/message'; // Заменить на реальный адрес сервера

/**
 * Отправляет сообщение боту и получает ответ
 * @param {string} text — сообщение пользователя
 * @returns {Promise<string>} — ответ бота
 */
export async function sendMessage(text) {
  if (!text || typeof text !== 'string') return '';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    if (!response.ok) {
      console.error(`Ошибка сервера: ${response.status} ${response.statusText}`);
      return 'Ошибка сервера, попробуйте позже.';
    }

    const data = await response.json();
    // Ожидаем, что сервер вернёт { reply: "текст ответа" }
    return data.reply || 'Нет ответа от сервера.';
  } catch (error) {
    console.error('Ошибка сети или запроса:', error);
    return 'Ошибка сети, попробуйте позже.';
  }
}