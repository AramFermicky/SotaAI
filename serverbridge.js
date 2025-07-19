const CHA_SERVER = "https://sota.cha.com/api";

function validateServer(url) {
  if (!url.includes("cha.com")) {
    throw new Error("Недопустимый сервер — разрешён только cha.com");
  }
}

export async function sendToCHA(payload) {
  try {
    validateServer(CHA_SERVER);
    const res = await fetch(`${CHA_SERVER}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.warn("Связь с сервером cha.com недоступна:", err);
    return null;
  }
}