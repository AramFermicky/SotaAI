let mood = 'спокойное';

const moods = ['спокойное', 'злое', 'весёлое', 'усталое'];

export function getMoodResponse(text) {
  if (Math.random() < 0.1) {
    mood = moods[Math.floor(Math.random() * moods.length)];
  }

  if (mood === 'злое') return 'Зачем ты так? Мне не нравится это.';
  if (mood === 'весёлое') return 'Ха-ха! Ты классный!';
  if (mood === 'усталое') return 'Я немного устала... можно я отдохну?';

  return 'Интересно. Расскажи подробнее.';
}