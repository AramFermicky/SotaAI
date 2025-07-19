// ------------------- УТИЛИТЫ -------------------

function getUsers() {
  return JSON.parse(localStorage.getItem("cmail_users") || "{}");
}

function saveUsers(users) {
  localStorage.setItem("cmail_users", JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem("cmail_current_user");
}

function setCurrentUser(email) {
  localStorage.setItem("cmail_current_user", email);
}

function clearCurrentUser() {
  localStorage.removeItem("cmail_current_user");
}

// ------------------- АВТОРИЗАЦИЯ -------------------

function showError(msg) {
  document.getElementById("auth-error").innerText = msg;
}

function login() {
  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const pass = document.getElementById("login-password").value;

  if (!email.endsWith("@cha.com")) return showError("Только адреса @cha.com!");

  const users = getUsers();
  if (!(email in users)) return showError("Пользователь не найден.");
  if (users[email].password !== pass) return showError("Неверный пароль.");

  setCurrentUser(email);
  loadFolder("inbox");
  showMailSection();
}

function register() {
  const email = document.getElementById("reg-email").value.trim().toLowerCase();
  const pass = document.getElementById("reg-password").value;

  if (!email.endsWith("@cha.com")) return showError("Регистрация только с адресом @cha.com!");
  if (!email.includes("@") || !pass) return showError("Введите корректные данные.");

  const users = getUsers();
  if (email in users) return showError("Пользователь уже существует!");

  users[email] = { password: pass, inbox: [], sent: [], drafts: [] };
  saveUsers(users);

  setCurrentUser(email);
  loadFolder("inbox");
  showMailSection();
}

function logout() {
  clearCurrentUser();
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("mail-section").style.display = "none";
  showError("");
}

// ------------------- ПОЧТА -------------------

let currentFolder = "inbox";

function toggleComposer() {
  const composer = document.getElementById("composer");
  composer.style.display = composer.style.display === "none" ? "block" : "none";
}

function sendMail() {
  const to = document.getElementById("mail-to").value.trim().toLowerCase();
  const subject = document.getElementById("mail-subject").value;
  const body = document.getElementById("mail-body").value;
  const from = getCurrentUser();

  if (!to.endsWith("@cha.com")) return alert("Можно отправлять только на @cha.com");

  const users = getUsers();
  if (!(to in users)) return alert("Получатель не найден!");

  const msg = { from, subject, body, time: new Date().toLocaleString() };

  users[to].inbox.push(msg);
  users[from].sent.push({ to, subject, body, time: msg.time });

  saveUsers(users);
  alert("Отправлено!");

  document.getElementById("mail-to").value = "";
  document.getElementById("mail-subject").value = "";
  document.getElementById("mail-body").value = "";
  toggleComposer();
  loadFolder("sent");
}

function loadFolder(folder) {
  currentFolder = folder;
  const email = getCurrentUser();
  if (!email) return;

  const users = getUsers();
  const list = document.getElementById("inbox-list");
  const search = document.getElementById("search-input").value.toLowerCase();

  let items = users[email][folder] || [];

  // фильтр по поиску
  if (search) {
    items = items.filter(msg =>
      (msg.subject || "").toLowerCase().includes(search) ||
      (msg.body || "").toLowerCase().includes(search)
    );
  }

  document.getElementById("user-email").innerText = `${email} (${folder})`;
  list.innerHTML = "";

  if (items.length === 0) {
    list.innerHTML = "<li>Нет писем.</li>";
    return;
  }

  items.slice().reverse().forEach(msg => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${msg.from ? "От" : "Кому"}: ${msg.from || msg.to}</strong>
      <strong>Тема: ${msg.subject}</strong>
      <div>${msg.body}</div>
      <small>${msg.time}</small>
    `;
    list.appendChild(li);
  });
}

// ------------------- КОМАНДЫ -------------------

function runCommand() {
  const cmd = document.getElementById("command-input").value.toLowerCase();
  const users = getUsers();
  const email = getCurrentUser();
  const folder = users[email][currentFolder];

  if (cmd.includes("последнее")) {
    if (folder.length === 0) return alert("Нет писем.");
    const last = folder[folder.length - 1];
    alert(`Тема: ${last.subject}\nОт/Кому: ${last.from || last.to}\n${last.body}`);
  } else if (cmd.includes("удали")) {
    if (folder.length === 0) return alert("Удалять нечего.");
    folder.pop();
    saveUsers(users);
    alert("Удалено последнее письмо.");
    loadFolder(currentFolder);
  } else if (cmd.includes("от")) {
    const name = cmd.split("от")[1].trim();
    document.getElementById("search-input").value = name;
    loadFolder(currentFolder);
  } else {
    alert("Неизвестная команда.");
  }

  document.getElementById("command-input").value = "";
}

// ------------------- НАСТРОЙКИ -------------------

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("cmail_theme", document.body.classList.contains("dark") ? "dark" : "light");
}

function setBackgroundFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.body.style.backgroundImage = `url(${reader.result})`;
    document.body.classList.add("custom-bg");
    localStorage.setItem("cmail_bg", reader.result);
  };
  reader.readAsDataURL(file);
}

function setBackgroundFromUrl() {
  const url = document.getElementById("bg-url").value.trim();
  if (!url) return alert("Введите URL изображения.");
  document.body.style.backgroundImage = `url(${url})`;
  document.body.classList.add("custom-bg");
  localStorage.setItem("cmail_bg", url);
}

function clearBackground() {
  document.body.style.backgroundImage = "none";
  document.body.classList.remove("custom-bg");
  localStorage.removeItem("cmail_bg");
}

// ------------------- ИНИЦИАЛИЗАЦИЯ -------------------

function showMailSection() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("mail-section").style.display = "block";
}

window.onload = () => {
  const current = getCurrentUser();
  if (current) {
    loadFolder("inbox");
    showMailSection();
  }

  const theme = localStorage.getItem("cmail_theme");
  if (theme === "dark") document.body.classList.add("dark");

  const bg = localStorage.getItem("cmail_bg");
  if (bg) {
    document.body.style.backgroundImage = `url(${bg})`;
    document.body.classList.add("custom-bg");
  }
};