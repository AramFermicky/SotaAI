// chat_ws.js
// Клиент WebSocket для общего чата СОТА

const WS_URL = 'wss://cha-server.onrender.com'; // адрес WebSocket сервера, поменяй под свой

let ws = null;
let onMessageCallback = null;
let reconnectTimeout = 3000; // время ожидания перед переподключением (мс)
let reconnectTimer = null;

// Подключение к WebSocket серверу
export function connectWS() {
  if (ws) {
    ws.close();
    ws = null;
  }

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('WS: соединение открыто');
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  ws.onmessage = (event) => {
    const message = event.data;
    console.log('WS: получено сообщение:', message);
    if (typeof onMessageCallback === 'function') {
      onMessageCallback(message);
    }
  };

  ws.onclose = (event) => {
    console.log('WS: соединение закрыто, попытка переподключения через', reconnectTimeout, 'мс');
    reconnectTimer = setTimeout(connectWS, reconnectTimeout);
  };

  ws.onerror = (error) => {
    console.error('WS: ошибка:', error);
    ws.close();
  };
}

// Отправка сообщения на сервер через WebSocket
export function sendWSMessage(text) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('WS: соединение не открыто, сообщение не отправлено');
    return false;
  }
  ws.send(text);
  return true;
}

// Установка callback-функции для обработки входящих сообщений
export function setOnMessageCallback(callback) {
  if (typeof callback === 'function') {
    onMessageCallback = callback;
  } else {
    console.warn('WS: передан невалидный callback для обработки сообщений');
  }
}