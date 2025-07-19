export async function sendMessage(text) {
  const res = await fetch('https://cha-server.onrender.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  });

  const data = await res.json();
  return data.reply || '❓ Нет ответа.';
}

export function initCore() {}