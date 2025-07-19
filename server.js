import express from "express";
import cors from "cors";
import fs from "fs/promises";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const USERS_FILE = "./users.json";

// --- Вспомогательные функции ---
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// --- Регистрация ---
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || !email.endsWith("@cha.com")) {
    return res.status(400).json({ error: "Invalid email or password" });
  }
  const users = await readUsers();
  if (users[email]) return res.status(400).json({ error: "User exists" });

  users[email] = { password, inbox: [], sent: [], drafts: [] };
  await saveUsers(users);
  res.json({ message: "Registered" });
});

// --- Вход ---
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const users = await readUsers();
  if (!users[email] || users[email].password !== password) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
  res.json({ message: "Logged in" });
});

// --- Получить письма ---
app.get("/mails/:folder", async (req, res) => {
  const email = req.query.email;
  const folder = req.params.folder;
  if (!email || !email.endsWith("@cha.com")) {
    return res.status(400).json({ error: "Invalid email" });
  }
  const users = await readUsers();
  if (!users[email]) return res.status(400).json({ error: "User not found" });
  if (!["inbox", "sent", "drafts"].includes(folder)) {
    return res.status(400).json({ error: "Invalid folder" });
  }
  res.json(users[email][folder]);
});

// --- Отправить письмо ---
app.post("/send", async (req, res) => {
  const { from, to, subject, body } = req.body;
  if (
    !from || !to || !subject || !body ||
    !from.endsWith("@cha.com") || !to.endsWith("@cha.com")
  ) {
    return res.status(400).json({ error: "Invalid data" });
  }
  const users = await readUsers();
  if (!users[from] || !users[to]) {
    return res.status(400).json({ error: "User(s) not found" });
  }
  const now = new Date().toISOString();
  const msg = { from, subject, body, time: now };

  users[to].inbox.push(msg);
  users[from].sent.push({ to, subject, body, time: now });

  await saveUsers(users);
  res.json({ message: "Sent" });
});

// --- Запуск сервера ---
app.listen(PORT, () => {
  console.log(`CMAIL server running on port ${PORT}`);
});