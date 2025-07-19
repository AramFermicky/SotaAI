// auth.js
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const usersFile = path.resolve('./users.json');

async function loadUsers() {
  try {
    const data = await fs.readFile(usersFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveUsers(users) {
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf-8');
}

function isValidChaEmail(email) {
  return typeof email === 'string' && email.endsWith('@cha.com');
}

export async function registerUser(email, password, displayName = null) {
  if (!isValidChaEmail(email)) {
    return { success: false, error: 'Email должен оканчиваться на @cha.com' };
  }

  const users = await loadUsers();
  if (users.find(u => u.email === email)) {
    return { success: false, error: 'Пользователь уже существует' };
  }

  const id = uuidv4();
  const user = {
    id,
    email,
    password, // В будущем - хешируй пароль!
    displayName: displayName || email.split('@')[0],
    chats: {}
  };

  users.push(user);
  await saveUsers(users);
  return { success: true, user };
}

export async function loginUser(email, password) {
  const users = await loadUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { success: false, error: 'Неверные данные' };
  return { success: true, user };
}