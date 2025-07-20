document.addEventListener("DOMContentLoaded", () => {
  const gameDiv = document.getElementById("game");

  gameDiv.innerHTML = `
    <h3>🎮 Запуск игры</h3>
    <canvas id="gameCanvas" width="640" height="480" style="border:1px solid #444"></canvas>
    <p>WASD — управление. Грузится последний .gis проект.</p>
  `;

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const TILE_SIZE = 32;

  let player = { x: 1, y: 1 };
  let tiles = [];
  let layers = [];

  function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!layers.length) return;

    const viewWidth = Math.floor(canvas.width / TILE_SIZE);
    const viewHeight = Math.floor(canvas.height / TILE_SIZE);

    for (let l = 0; l <= 1; l++) {
      for (let y = 0; y < layers[l].length; y++) {
        for (let x = 0; x < layers[l][0].length; x++) {
          const id = layers[l][y][x];
          if (id >= 0 && tiles[id]) {
            ctx.drawImage(tiles[id], x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }

    // Игрок (прямоугольник)
    ctx.fillStyle = "#0f0";
    ctx.fillRect(player.x * TILE_SIZE, player.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  function loadFromGis(project) {
    tiles = [];
    layers = project.layers;

    for (let src of project.tiles) {
      const img = new Image();
      img.src = src;
      tiles.push(img);
    }

    drawGame();
  }

  window.addEventListener("keydown", (e) => {
    if (!layers.length) return;
    const col = layers[2]; // слой коллизий
    let nx = player.x;
    let ny = player.y;

    if (e.key === "w") ny--;
    if (e.key === "s") ny++;
    if (e.key === "a") nx--;
    if (e.key === "d") nx++;

    const inBounds = nx >= 0 && ny >= 0 && ny < col.length && nx < col[0].length;
    const blocked = inBounds ? col[ny][nx] !== -1 : true;

    if (inBounds && !blocked) {
      player.x = nx;
      player.y = ny;
      drawGame();
    }
  });

  // Автозагрузка последнего проекта
  if (window.loadedGisProject) {
    loadFromGis(window.loadedGisProject);
  } else {
    gameDiv.innerHTML += "<p style='color:red'>⚠ Загрузите .gis проект в разделе 'Экспорт'.</p>";
  }
});
