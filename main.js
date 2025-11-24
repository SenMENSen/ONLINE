// Простейшая 3D сцена с комнатой и одной сферой-игроком.
// Всё локально, без онлайна, но 3D и ходьба уже есть.
// Потом добавим онлайн, если захочешь.

import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Камера
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 10);

// Рендерер
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Контролы камеры
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.update();

// Свет
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// Пол (комната)
const floorGeo = new THREE.PlaneGeometry(20, 20);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x222244 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Стены (простые коробки по периметру)
const wallMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const wallGeo = new THREE.BoxGeometry(20, 4, 0.2);

function makeWall(x, y, z, rotY) {
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(x, y, z);
  wall.rotation.y = rotY;
  scene.add(wall);
}

// 4 стены
makeWall(0, 2, -10, 0);
makeWall(0, 2, 10, 0);
makeWall(-10, 2, 0, Math.PI / 2);
makeWall(10, 2, 0, Math.PI / 2);

// Игрок — сфера
const playerGeo = new THREE.SphereGeometry(0.5, 32, 32);
const playerMat = new THREE.MeshStandardMaterial({ color: 0x00ffff });
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.set(0, 0.5, 0);
scene.add(player);

// Управление
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

const speed = 0.08;

function updatePlayer() {
  let dx = 0;
  let dz = 0;

  if (keys['w'] || keys['arrowup']) dz -= speed;
  if (keys['s'] || keys['arrowdown']) dz += speed;
  if (keys['a'] || keys['arrowleft']) dx -= speed;
  if (keys['d'] || keys['arrowright']) dx += speed;

  player.position.x += dx;
  player.position.z += dz;

  // Ограничения комнаты
  const limit = 9;
  player.position.x = Math.max(-limit, Math.min(limit, player.position.x));
  player.position.z = Math.max(-limit, Math.min(limit, player.position.z));

  // Камера немного следует за игроком
  const camOffset = new THREE.Vector3(0, 5, 10);
  const targetPos = player.position.clone().add(camOffset);
  camera.position.lerp(targetPos, 0.05);
  controls.target.lerp(player.position, 0.1);
  controls.update();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

function animate() {
  requestAnimationFrame(animate);
  updatePlayer();
  renderer.render(scene, camera);
}

animate();
