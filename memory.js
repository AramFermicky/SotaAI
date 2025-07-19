const memoryKey = 'sota_memory';

export function saveMemory(entry) {
  let mem = loadMemory();
  if (!mem) mem = [];
  mem.push({
    timestamp: Date.now(),
    user: entry.user,
    bot: entry.bot
  });
  localStorage.setItem(memoryKey, JSON.stringify(mem));
}

export function loadMemory() {
  const memStr = localStorage.getItem(memoryKey);
  if (!memStr) return null;
  try {
    return JSON.parse(memStr);
  } catch {
    return null;
  }
}