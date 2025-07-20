// js/main.js

function showTab(tabId) {
  const tabs = ['menu', 'editor', 'editor3d', 'export', 'play'];
  tabs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === tabId ? 'block' : 'none';
  });

  // Подключение модулей при необходимости
  if (tabId === 'editor') {
    import('./editor.js');
  } else if (tabId === 'editor3d') {
    import('./editor3d.js');
  } else if (tabId === 'export') {
    import('./export.js');
  } else if (tabId === 'play') {
    import('./game.js');
  }
}

// Привязка к кнопкам в меню
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.menu-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      showTab(tab);
    });
  });

  showTab('menu');
});
