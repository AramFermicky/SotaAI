import { getSmartReply } from './brain.js';

let memory = [];

export function initCore() {
  memory = [];
}

export async function sendMessage(text) {
  memory.push(text);
  if (memory.length > 5) memory.shift();

  const reply = getSmartReply(text, memory);
  memory.push(reply);
  return reply;
}