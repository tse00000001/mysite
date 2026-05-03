import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js/+esm";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/postprocessing/RenderPass.js/+esm";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js/+esm";

const audio = document.getElementById("audio-player");
const playBtn = document.getElementById("play-btn");
const audioUpload = document.getElementById("audio-upload");
const fileNameDisplay = document.getElementById("file-name-display");
const statusText = document.getElementById("status-text");
const lyricFlash = document.getElementById("lyric-flash");
const webglContainer = document.getElementById("webgl-container");

let audioContext;
let analyser;
let dataArray;
let isPlaying = false;
let audioSource = null;
let objectUrl = null;

const lyricsWords = [
  "NIGHT",
  "SYSTEM",
  "HACK",
  "PULSE",
  "URBAN",
  "RUSH",
  "NEON",
  "GLITCH",
];

function setStatus(text, className) {
  statusText.textContent = text;
  statusText.className = className;
}

audioUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }

  objectUrl = URL.createObjectURL(file);
  audio.src = objectUrl;
  fileNameDisplay.textContent = file.name;
  setStatus("READY TO LINK", "status-ready");
});

playBtn.addEventListener("click", () => {
  if (!audio.src || audio.src === window.location.href) {
    alert("先に「LOAD MP3」ボタンから楽曲ファイルを読み込んでください。");
    return;
  }

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;

    audioSource = audioContext.createMediaElementSource(audio);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  }

  if (isPlaying) {
    audio.pause();
    playBtn.textContent = "Initialize System";
    setStatus("READY TO LINK", "status-ready");
    isPlaying = false;
  } else {
    audioContext.resume().then(() => {
      audio.play();
      playBtn.textContent = "System Override";
      setStatus("NEURAL LINK ACTIVE", "status-active");
      isPlaying = true;
    });
  }
});

audio.addEventListener("ended", () => {
  playBtn.textContent = "Initialize System";
  setStatus("READY TO LINK", "status-ready");
  isPlaying = false;
});

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.015);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 28;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x050505, 1);
webglContainer.appendChild(renderer.domElement);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.1;
bloomPass.strength = 0.5;
bloomPass.radius = 1.0;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const coreGroup = new THREE.Group();
scene.add(coreGroup);

const geoOuter = new THREE.IcosahedronGeometry(12, 2);
const matOuter = new THREE.MeshBasicMaterial({
  color: 0x00ffcc,
  wireframe: true,
  transparent: true,
  opacity: 0.15,
  blending: THREE.AdditiveBlending,
});
const outerSphere = new THREE.Mesh(geoOuter, matOuter);
coreGroup.add(outerSphere);

const geoInner = new THREE.IcosahedronGeometry(6, 4);
const matInner = new THREE.MeshPhongMaterial({
  color: 0x220055,
  emissive: 0xff00ff,
  shininess: 100,
  wireframe: false,
  flatShading: true,
});
const innerShape = new THREE.Mesh(geoInner, matInner);
coreGroup.add(innerShape);

const basePositions = geoInner.attributes.position.clone();

const particlesGeometry = new THREE.BufferGeometry();
const posArray = new Float32Array(1500 * 3);

for (let i = 0; i < posArray.length; i += 1) {
  posArray[i] = (Math.random() - 0.5) * 120;
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(posArray, 3),
);
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.15,
  color: 0xffffff,
  transparent: true,
  blending: THREE.AdditiveBlending,
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

const ambientLight = new THREE.AmbientLight(0x222222);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xff00ff, 1, 100);
scene.add(pointLight);

function getViewportSize() {
  return {
    width: Math.max(1, webglContainer.clientWidth || window.innerWidth),
    height: Math.max(1, webglContainer.clientHeight || window.innerHeight),
  };
}

function getResponsiveCameraZ(width, height) {
  const aspect = width / height;

  if (aspect < 0.55) {
    return 44;
  }

  if (aspect < 0.75) {
    return 38;
  }

  if (width <= 700) {
    return 34;
  }

  if (width <= 1000) {
    return 31;
  }

  if (width <= 1300) {
    return 29;
  }

  return 25;
}

function resizeScene() {
  const { width, height } = getViewportSize();

  camera.aspect = width / height;
  camera.position.z = getResponsiveCameraZ(width, height);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
  bloomPass.setSize(width, height);
}

window.addEventListener("resize", resizeScene);
resizeScene();

let time = 0;
let lastBeatTime = 0;
const vertex = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  time += 0.01;

  outerSphere.rotation.y += 0.003;
  innerShape.rotation.x -= 0.005;
  innerShape.rotation.y -= 0.005;
  particlesMesh.rotation.y -= 0.001;

  if (isPlaying && analyser) {
    analyser.getByteFrequencyData(dataArray);

    let bassAvg = 0;
    let midAvg = 0;

    for (let i = 0; i < 10; i += 1) {
      bassAvg += dataArray[i];
    }

    for (let i = 20; i < 60; i += 1) {
      midAvg += dataArray[i];
    }

    bassAvg /= 10;
    midAvg /= 40;

    bloomPass.strength = 0.5 + (bassAvg / 255) * 3.0;

    const positionAttribute = innerShape.geometry.attributes.position;

    for (let i = 0; i < positionAttribute.count; i += 1) {
      vertex.fromBufferAttribute(basePositions, i);
      const normalizeVertex = vertex.clone().normalize();
      const audioIndex = i % analyser.frequencyBinCount;
      const audioVal = dataArray[audioIndex] / 255.0;
      const wave = Math.sin(time * 5 + vertex.x * 2 + vertex.y * 2) * 0.5;
      const displacement = audioVal * 4.0 + (midAvg / 255) * wave;

      vertex.add(normalizeVertex.multiplyScalar(displacement));
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    positionAttribute.needsUpdate = true;
    innerShape.geometry.computeVertexNormals();

    const colorMix = bassAvg / 255;
    matInner.emissive.setRGB(1 - colorMix, colorMix * 0.5, 1);
    pointLight.intensity = (bassAvg / 255) * 5;

    if (bassAvg > 220 && Date.now() - lastBeatTime > 250) {
      lyricFlash.textContent =
        lyricsWords[Math.floor(Math.random() * lyricsWords.length)];
      lyricFlash.style.opacity = 1;
      camera.position.x = (Math.random() - 0.5) * 0.5;
      camera.position.y = (Math.random() - 0.5) * 0.5;
      lastBeatTime = Date.now();
    } else {
      lyricFlash.style.opacity = Math.max(
        0,
        Number(lyricFlash.style.opacity) - 0.08,
      );
      camera.position.x += (0 - camera.position.x) * 0.1;
      camera.position.y += (0 - camera.position.y) * 0.1;
    }
  } else {
    bloomPass.strength = 0.5 + Math.sin(time * 2) * 0.2;
  }

  composer.render();
}

animate();
