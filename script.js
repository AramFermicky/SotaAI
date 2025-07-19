const API = "https://cha-server.onrender.com";

let currentEmail = null;

// ------------------- АВТОРИЗАЦИЯ -------------------

function showError(msg) {
  document.getElementById("auth-error").innerText = msg;
}

async function login() {
  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const password = document.getElementById("login-password").value;

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    currentEmail = email;
    showMailSection();
    loadFolder("inbox");
  } else {
    showError(data.error || "Ошибка входа");
  }
}

async function register() {
  const email = document.getElementById("reg-email").value.trim().toLowerCase();
  const password = document.getElementById("reg-password").value;

  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    currentEmail = email;
    showMailSection();
    loadFolder("inbox");
  } else {
    showError(data.error || "Ошибка регистрации");
  }
}

function logout() {
  currentEmail = null;
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("mail-section").style.display = "none";
  showError("");
}

// ------------------- ПОЧТА -------------------

let currentFolder = "inbox";

async function loadFolder(folder) {
  if (!currentEmail) return;
  currentFolder = folder;

  const res = await fetch(`${API}/mails/${folder}?email=${encodeURIComponent(currentEmail)}`);
  const data = await res.json();

  const list = document.getElementById("inbox-list");
  document.getElementById("user-email").innerText = `${currentEmail} (${folder})`;

  list.innerHTML = "";

  if (!data || data.length === 0) {
    list.innerHTML = "<li>Нет писем.</li>";
    return;
  }

  const search = document.getElementById("search-input").value.toLowerCase();
  const filtered = data.filter(msg =>
    msg.subject?.toLowerCase().includes(search) || msg.body?.toLowerCase().includes(search)
  );

  filtered.reverse().forEach(msg => {
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

async function sendMail() {
  const to = document.getElementById("mail-to").value.trim().toLowerCase();
  const subject = document.getElementById("mail-subject").value;
  const body = document.getElementById("mail-body").value;

  const res = await fetch(`${API}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: currentEmail, to, subject, body })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Письмо отправлено!");
    document.getElementById("mail-to").value = "";
    document.getElementById("mail-subject").value = "";
    document.getElementById("mail-body").value = "";
    toggleComposer();
    loadFolder("sent");
  } else {
    alert(data.error || "Ошибка отправки");
  }
}

// ------------------- КОМАНДЫ -------------------

async function runCommand() {
  const input = document.getElementById("command-input").value.toLowerCase();
  const res = await fetch(`${API}/mails/${currentFolder}?email=${currentEmail}`);
  const data = await res.json();

  if (!data || data.length === 0) return alert("Нет писем");

  if (input.includes("последнее")) {
    const msg = data[data.length - 1];
    alert(`Тема: ${msg.subject}\nОт/Кому: ${msg.from || msg.to}\n${msg.body}`);
  } else if (input.includes("удали")) {
    alert("Удаление пока доступно только вручную");
  } else {
    alert("Неизвестная команда");
  }

  document.getElementById("command-input").value = "";
}

// ------------------- ТЕМА / ФОН -------------------

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

// ------------------- UI -------------------

function toggleComposer() {
  const composer = document.getElementById("composer");
  composer.style.display = composer.style.display === "none" ? "block" : "none";
}

function showMailSection() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("mail-section").style.display = "block";
}

window.onload = () => {
  const theme = localStorage.getItem("cmail_theme");
  if (theme === "dark") document.body.classList.add("dark");

  const bg = localStorage.getItem("cmail_bg");
  if (bg) {
    document.body.style.backgroundImage = `url(${bg})`;
    document.body.classList.add("custom-bg");
  }
};