// memory.js
// Хранилище памяти диалога в виде массива объектов {sender: 'user'|'bot', text: '...'}

let memoryData = [];

// Добавить сообщение в память
export function addToMemory(sender, text) {
  if (!sender || !text) return;
  // Ограничим размер памяти до последних 100 сообщений
  if (memoryData.length >= 100) memoryData.shift();
  memoryData.push({ sender, text });
}

// Получить всю память (массив)
export function getMemory() {
  return memoryData;
}

// Очистить память
export function clearMemory() {
  memoryData = [];
}

// Экспорт памяти в JSON-строку
export function exportMemory() {
  try {
    return JSON.stringify(memoryData);
  } catch {
    return '[]';
  }
}

// Импорт памяти из JSON-строки
export function importMemory(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return false;
    // Проверим структуру элементов
    for (const item of parsed) {
      if (
        typeof item !== 'object' ||
        !['user', 'bot'].includes(item.sender) ||
        typeof item.text !== 'string'
      ) {
        return false;
      }
    }
    memoryData = parsed;
    return true;
  } catch {
    return false;
  }
}