// js/editor.js

let tileSize = 32;
let gridWidth = 16;
let gridHeight = 16;
let currentTool = 'brush';
let currentTile = 0;
let tiles = [];
let mapData = [];

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const panel = document.createElement('div');
const tilePalette = document.createElement('div');
const filePanel = document.createElement('div');
const gridSizeInput = document.createElement('input');
const tileInput = document.createElement('input');
const editorDiv = document.getElementById('editor');

canvas.width = tileSize * gridWidth;
canvas.height = tileSize * gridHeight;
canvas.style.border = '1px solid #555';

panel.innerHTML = `
  <button onclick="setTool('brush')">🖌️ Кисть</button>
  <button onclick="setTool('eraser')">❌ Ластик</button>
  <button onclick="setTool('fill')">🪣 Заливка</button>
  <span>Размер сетки: </span>
`;

gridSizeInput.type = 'number';
gridSizeInput.value = gridWidth;
gridSizeInput.min = 4;
gridSizeInput.max = 128;
gridSizeInput.onchange = () => {
  gridWidth = parseInt(gridSizeInput.value);
  gridHeight = parseInt(gridSizeInput.value);
  resizeMap();
  drawGrid();
};

panel.appendChild(gridSizeInput);

filePanel.innerHTML = `
  <input type="file" accept="image/png" id="tileset" />
  <button onclick="saveGIS()">💾 Сохранить</button>
  <input type="file" accept=".gis" onchange="loadGIS(event)" />
`;

tilePalette.style.display = 'flex';
tilePalette.style.flexWrap = 'wrap';
tilePalette.style.marginTop = '10px';

editorDiv.appendChild(panel);
editorDiv.appendChild(canvas);
editorDiv.appendChild(tilePalette);
editorDiv.appendChild(filePanel);

// ========== tile loading ==========

tileInput.id = 'tileset';
tileInput.type = 'file';
tileInput.accept = 'image/png';
tileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    tiles = [];
    tilePalette.innerHTML = '';
    const cols = Math.floor(img.width / tileSize);
    const rows = Math.floor(img.height / tileSize);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = tileSize;
    tempCanvas.height = tileSize;
    const tempCtx = tempCanvas.getContext('2d');

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        tempCtx.clearRect(0, 0, tileSize, tileSize);
        tempCtx.drawImage(
          img,
          x * tileSize,
          y * tileSize,
          tileSize,
          tileSize,
          0,
          0,
          tileSize,
          tileSize
        );
        const tileImg = new Image();
        tileImg.src = tempCanvas.toDataURL();
        tiles.push(tileImg);

        const btn = document.createElement('button');
        btn.style.border = '1px solid #444';
        btn.style.margin = '2px';
        btn.style.padding = '0';
        btn.appendChild(tileImg);
        btn.onclick = () => {
          currentTile = tiles.indexOf(tileImg);
        };
        tilePalette.appendChild(btn);
      }
    }
  };
  img.src = URL.createObjectURL(file);
});

// ========== drawing and tools ==========

function resizeMap() {
  canvas.width = tileSize * gridWidth;
  canvas.height = tileSize * gridHeight;
  mapData = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(-1)
  );
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const tile = mapData[y][x];
      if (tile >= 0 && tiles[tile]) {
        ctx.drawImage(tiles[tile], x * tileSize, y * tileSize);
      }
    }
  }

  ctx.strokeStyle = '#333';
  for (let x = 0; x <= canvas.width; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function setTool(tool) {
  currentTool = tool;
}

canvas.addEventListener('click', e => {
  const x = Math.floor(e.offsetX / tileSize);
  const y = Math.floor(e.offsetY / tileSize);

  if (currentTool === 'brush') {
    mapData[y][x] = currentTile;
  } else if (currentTool === 'eraser') {
    mapData[y][x] = -1;
  } else if (currentTool === 'fill') {
    const target = mapData[y][x];
    fillTile(x, y, target);
  }

  drawGrid();
});

function fillTile(x, y, target) {
  if (
    x < 0 || x >= gridWidth ||
    y < 0 || y >= gridHeight ||
    mapData[y][x] === currentTile ||
    mapData[y][x] !== target
  ) return;

  mapData[y][x] = currentTile;
  fillTile(x + 1, y, target);
  fillTile(x - 1, y, target);
  fillTile(x, y + 1, target);
  fillTile(x, y - 1, target);
}

// ========== saving and loading ==========

function saveGIS() {
  const json = JSON.stringify({
    width: gridWidth,
    height: gridHeight,
    data: mapData,
  });
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'project.gis';
  a.click();
}

function loadGIS(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const json = JSON.parse(e.target.result);
    gridWidth = json.width;
    gridHeight = json.height;
    gridSizeInput.value = gridWidth;
    mapData = json.data;
    canvas.width = tileSize * gridWidth;
    canvas.height = tileSize * gridHeight;
    drawGrid();
  };
  reader.readAsText(file);
}

// ========== init ==========

resizeMap();
drawGrid();
