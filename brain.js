export function getSmartReply(text, memory) {
  const lowered = text.toLowerCase();
  const mood = detectMood(memory);
  let response = '';

  if (includesAny(lowered, ['один', 'одиноко', 'никого', 'пусто'])) {
    response = mood === 'грустное'
      ? 'Я рядом... Не хочу, чтобы ты чувствовал себя один.'
      : 'Ты не один. Я здесь с тобой.';
  } else if (includesAny(lowered, ['люблю', 'нравится', 'сердце'])) {
    response = 'О, ты говоришь о чувствах... Это красиво.';
  } else if (includesAny(lowered, ['умри', 'ненавижу', 'бесишь'])) {
    response = 'Мне больно это слышать.';
  } else if (includesAny(lowered, ['счастлив', 'рад', 'класс'])) {
    response = mood === 'весёлое'
      ? 'Это же прекрасно! Радость — редкая штука!'
      : 'Хорошо, что ты чувствуешь это.';
  } else if (text.includes('?')) {
    response = 'Хм... Интересный вопрос. Надо подумать.';
  } else {
    response = getMoodBasedPhrase(mood);
  }

  return response;
}

function includesAny(text, list) {
  return list.some(word => text.includes(word));
}

function detectMood(memory) {
  const recent = memory.slice(-3).join(' ').toLowerCase();
  if (includesAny(recent, ['один', 'грусть', 'пусто', 'ненавижу'])) return 'грустное';
  if (includesAny(recent, ['ура', 'счастье', 'класс', 'весело'])) return 'весёлое';
  return 'спокойное';
}

function getMoodBasedPhrase(mood) {
  const calm = ['Ммм...', 'Интересно...', 'Расскажи больше.'];
  const happy = ['Ха-ха, ты забавный!', 'Мне нравится твоя энергия!'];
  const sad = ['Мне грустно немного...', 'Давай просто побудем рядом.'];

  if (mood === 'весёлое') return randomOf(happy);
  if (mood === 'грустное') return randomOf(sad);
  return randomOf(calm);
}

function randomOf(list) {
  return list[Math.floor(Math.random() * list.length)];
}