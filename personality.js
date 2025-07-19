let personality = {
  trust: 50,
  irritation: 20,
  curiosity: 50,
  energy: 70,
};

export function updatePersonality(text) {
  const rudeWords = ['дурак', 'идиот', 'тупой', 'хуй', 'блядь', 'сдохни'];
  const lowered = text.toLowerCase();

  rudeWords.forEach(word => {
    if (lowered.includes(word)) {
      personality.irritation = Math.min(100, personality.irritation + 10);
      personality.trust = Math.max(0, personality.trust - 10);
    }
  });

  if (text.includes('?')) {
    personality.curiosity = Math.min(100, personality.curiosity + 5);
  }

  personality.energy = Math.max(0, personality.energy - 2);

  console.log('Обновлён характер:', personality);
}

export function getPersonality() {
  return personality;
}