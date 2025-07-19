import { getMoodResponse } from './mood.js';
import { updatePersonality } from './personality.js';
import { saveMemory, loadMemory } from './memory.js';
import { sendToCHA } from './serverbridge.js';

let memory = [];

export function initCore() {
  memory = loadMemory() || [];
  console.log('🔁 СОТА: Память загружена. Кол-во сообщений:', memory.length);
}

export async function sendMessage(text) {
  updatePersonality(text);
  const serverReply = await sendToCHA({ user: text });
  saveMemory({ user: text, bot: serverReply });
  return serverReply;
}