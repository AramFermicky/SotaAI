// js/editor3d.js

import * as THREE from 'https://cdn.skypack.dev/three@0.155.0';

let scene, camera, renderer, controls;
let blocks = [];
let currentTool = 'brush';
let gridSize = 10;
let voxelSize = 1;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let plane;

const editor3d = document.getElementById('editor3d');

function init3D() {
  // Container
  const container = document.createElement('div');
  editor3d.appendChild(container);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(800, 600);
  renderer.setClearColor(0x0e0e1a);
  container.appendChild(renderer.domElement);

  // Scene & camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, 800 / 600, 0.1, 1000);
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);

  // Light
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  // Grid
  const grid = new THREE.GridHelper(gridSize, gridSize);
  scene.add(grid);

  // Invisible plane for interaction
  plane = new THREE.Mesh(
    new THREE.PlaneGeometry(gridSize, gridSize),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  plane.rotateX(-Math.PI / 2);
  scene.add(plane);

  // Controls (manual orbit)
  let isDragging = false;
  let prev = { x: 0, y: 0 };
  renderer.domElement.addEventListener('mousedown', e => {
    isDragging = true;
    prev.x = e.clientX;
    prev.y = e.clientY;
  });
  renderer.domElement.addEventListener('mouseup', () => {
    isDragging = false;
  });
  renderer.domElement.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    prev.x = e.clientX;
    prev.y = e.clientY;
    camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -dx * 0.005);
    camera.position.y += dy * 0.02;
    camera.lookAt(0, 0, 0);
  });

  // Scroll zoom
  renderer.domElement.addEventListener('wheel', e => {
    camera.position.multiplyScalar(e.deltaY > 0 ? 1.1 : 0.9);
  });

  // Click to add/remove
  renderer.domElement.addEventListener('click', onClick3D);

  animate();

  createUI();
}

function onClick3D(event) {
  const bounds = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(plane);

  if (intersects.length > 0) {
    const point = intersects[0].point;
    const x = Math.round(point.x);
    const y = 0.5;
    const z = Math.round(point.z);

    if (currentTool === 'brush') {
      addBlock(x, y, z);
    } else if (currentTool === 'eraser') {
      removeBlockAt(x, y, z);
    }
  }
}

function addBlock(x, y, z) {
  // Avoid duplicates
  if (blocks.find(b => b.position.x === x && b.position.z === z)) return;

  const geo = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
  const mat = new THREE.MeshStandardMaterial({ color: 0x00ffee });
  const cube = new THREE.Mesh(geo, mat);
  cube.position.set(x, y, z);
  scene.add(cube);
  blocks.push(cube);
}

function removeBlockAt(x, y, z) {
  const block = blocks.find(b => b.position.x === x && b.position.z === z);
  if (block) {
    scene.remove(block);
    blocks = blocks.filter(b => b !== block);
  }
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function createUI() {
  const panel = document.createElement('div');
  panel.style.marginTop = '12px';

  panel.innerHTML = `
    <button onclick="setTool3D('brush')">🧱 Кисть</button>
    <button onclick="setTool3D('eraser')">🧨 Удалить</button>
    <button onclick="exportScene3D('pis')">💾 Экспорт .pis</button>
    <button onclick="exportScene3D('gfm')">📦 Экспорт .gfm</button>
    <input type="file" accept=".pis" id="loadPIS" />
  `;

  const input = panel.querySelector('#loadPIS');
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const json = JSON.parse(evt.target.result);
      loadPIS(json);
    };
    reader.readAsText(file);
  };

  editor3d.appendChild(panel);
}

window.setTool3D = tool => {
  currentTool = tool;
};

window.exportScene3D = format => {
  const data = blocks.map(b => ({
    x: b.position.x,
    y: b.position.y,
    z: b.position.z,
    color: b.material.color.getHex(),
  }));

  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download =
    format === 'gfm' ? 'scene.gfm' : format === 'pis' ? 'project.pis' : 'scene.gis';
  a.click();
};

function loadPIS(data) {
  blocks.forEach(b => scene.remove(b));
  blocks = [];

  data.forEach(obj => {
    const geo = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
    const mat = new THREE.MeshStandardMaterial({ color: obj.color });
    const cube = new THREE.Mesh(geo, mat);
    cube.position.set(obj.x, obj.y, obj.z);
    scene.add(cube);
    blocks.push(cube);
  });
}

// Инициализация
init3D();
