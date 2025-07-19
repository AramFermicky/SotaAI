const CHA_SERVER = "https://cha-server.onrender.com";

function validateServer(url) {
  if (!url.includes("cha-server.onrender.com")) {
    throw new Error("Недопустимый сервер — разрешён только cha-server.onrender.com");
  }
}

export async function sendToCHA(payload) {
  try {
    validateServer(CHA_SERVER);
    const res = await fetch(`${CHA_SERVER}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("❌ Ошибка связи с сервером cha:", err);
    return null;
  }
}