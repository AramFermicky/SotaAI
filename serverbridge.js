const CHA_SERVER = "https://cha-server.onrender.com";

export async function sendToCHA(payload) {
  try {
    const res = await fetch(`${CHA_SERVER}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: payload.user })
    });
    const data = await res.json();
    return data.reply || "❓ Нет ответа.";
  } catch (err) {
    console.warn("❌ Ошибка связи с сервером cha:", err);
    return "❌ Нет связи с сервером.";
  }
}