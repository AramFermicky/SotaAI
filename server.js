import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const usersFile = "./data/users.json";

// ------- Вспомогательные функции -------
async function readUsers() {
  try {
    const data = await fs.readFile(usersFile, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveUsers(data) {
  await fs.writeFile(usersFile, JSON.stringify(data, null, 2));
}

// ------- CMAIL API -------

// Регистрация
app.post("/cmail/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email.endsWith("@cha.com") || !password) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const users = await readUsers();
  if (users[email]) {
    return res.status(400).json({ error: "User already exists" });
  }

  users[email] = { password, inbox: [], sent: [], drafts: [] };
  await saveUsers(users);
  res.json({ message: "Registered" });
});

// Вход
app.post("/cmail/login", async (req, res) => {
  const { email, password } = req.body;
  const users = await readUsers();
  if (!users[email] || users[email].password !== password) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  res.json({ message: "Logged in" });
});

// Получение писем
app.get("/cmail/mails/:folder", async (req, res) => {
  const { email } = req.query;
  const folder = req.params.folder;

  if (!email.endsWith("@cha.com")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const users = await readUsers();
  if (!users[email]) return res.status(400).json({ error: "User not found" });
  if (!["inbox", "sent", "drafts"].includes(folder)) {
    return res.status(400).json({ error: "Invalid folder" });
  }

  res.json(users[email][folder]);
});

// Отправка писем
app.post("/cmail/send", async (req, res) => {
  const { from, to, subject, body } = req.body;
  if (!from || !to || !subject || !body) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const users = await readUsers();
  if (!users[from] || !users[to]) {
    return res.status(400).json({ error: "User(s) not found" });
  }

  const time = new Date().toISOString();
  const mail = { from, subject, body, time };

  users[to].inbox.push(mail);
  users[from].sent.push({ to, subject, body, time });

  await saveUsers(users);
  res.json({ message: "Mail sent" });
});

// ------- Запуск -------
app.listen(PORT, () => {
  console.log("CMAIL server is running on port", PORT);
});