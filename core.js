// core.js — Ядро ИИ СОТА
import { getMoodResponse } from './mood.js';
import { updatePersonality } from './personality.js';
import { saveMemory, loadMemory } from './memory.js';
import { sendToCHA } from './serverbridge.js';  // Импорт связи с сервером

let memory = [];

export function initCore() {
  memory = loadMemory() || [];
  console.log('🔁 СОТА: Память загружена. Кол-во сообщений:', memory.length);
}

export async function sendMessage(text) {
  updatePersonality(text);
  const reply = getMoodResponse(text);
  saveMemory({ user: text, bot: reply });

  // Отправляем данные на сервер cha.com
  await sendToCHA({ user: text, bot: reply, time: Date.now() });

  return reply;
}