// auth.js
const SERVER_URL = 'https://cha-server.onrender.com';

// Проверка email на домен @cha.com
export function validateEmail(email) {
  return typeof email === 'string' && email.toLowerCase().endsWith('@cha.com');
}

// Вход
export async function login(email, password) {
  if (!validateEmail(email)) {
    return { success: false, error: 'Email должен быть на домене @cha.com' };
  }
  if (!password) {
    return { success: false, error: 'Введите пароль' };
  }
  try {
    const res = await fetch(`${SERVER_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || 'Ошибка сервера' };
    }
    const data = await res.json();
    return { success: true, user: data.user };
  } catch (e) {
    return { success: false, error: 'Ошибка сети' };
  }
}

// Регистрация
export async function register(email, password, displayName = null) {
  if (!validateEmail(email)) {
    return { success: false, error: 'Email должен быть на домене @cha.com' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Пароль должен быть минимум 6 символов' };
  }
  try {
    const res = await fetch(`${SERVER_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || 'Ошибка сервера' };
    }
    const data = await res.json();
    return { success: true, user: data.user };
  } catch (e) {
    return { success: false, error: 'Ошибка сети' };
  }
}