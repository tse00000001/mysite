import * as THREE from "https://esm.sh/three@0.160.0";
import { GLTFLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "https://esm.sh/three@0.160.0/examples/jsm/utils/SkeletonUtils.js";

const ASSET_ROOT = "../../assets/Lab_UFO/";
const MAX_COWS = 5;
const MIN_VISIBLE_COWS = 3;
const FIRST_UFO_DELAY = 7;
const UFO_COOLDOWN = 8;
const REFILL_INTERVAL = 1.45;
const BEAM_RADIUS = 2.25;
const GROUND_Y = -1.18;

const host = document.querySelector("#scene-host");
const beam = document.querySelector("#ufo-beam");
const glow = document.querySelector(".ufo-glow");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 120);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
const loader = new GLTFLoader();
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const cows = [];
const clickableMeshes = [];
const ufoTarget = new THREE.Vector3(0, 1.3, -0.72);
const ufoEnterPosition = new THREE.Vector3(-4.0, 1.7, -1.1);
const ufoExitPosition = new THREE.Vector3(5.1, 1.0, -1.1);

let cowSource = null;
let ufoModel = null;
let elapsed = 0;
let refillTimer = 0;
let beamActive = false;
let ufoPhase = "hidden";
let ufoPhaseTime = 0;

const cowSetups = [
  {
    start: [-4.45, GROUND_Y, 0.14],
    target: [-2.18, GROUND_Y, -0.36],
    rot: 0.28,
    scale: 0.0118,
    delay: 0.8,
    speed: 0.66,
  },
  {
    start: [-1.72, GROUND_Y, 0.34],
    target: [-0.86, GROUND_Y, -0.26],
    rot: -0.08,
    scale: 0.0109,
    delay: 1.9,
    speed: 0.52,
  },
  {
    start: [1.88, GROUND_Y, 0.16],
    target: [0.55, GROUND_Y, -0.42],
    rot: -0.34,
    scale: 0.0114,
    delay: 1.2,
    speed: 0.58,
  },
  {
    start: [4.35, GROUND_Y, 0.1],
    target: [1.58, GROUND_Y, -0.3],
    rot: -0.58,
    scale: 0.0103,
    delay: 2.6,
    speed: 0.54,
  },
  {
    start: [0.12, GROUND_Y, 0.58],
    target: [0.02, GROUND_Y, -0.76],
    rot: 0.06,
    scale: 0.0098,
    delay: 3.4,
    speed: 0.48,
  },
];

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
host.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x7fb370, 2.45));

const sun = new THREE.DirectionalLight(0xfff4d2, 2.2);
sun.position.set(-3.5, 7, 5);
scene.add(sun);

const softFill = new THREE.DirectionalLight(0xbbe8ff, 0.78);
softFill.position.set(4, 4, -2);
scene.add(softFill);

const pasture = new THREE.Group();
scene.add(pasture);

Promise.all([loadGltf("cow.glb"), loadGltf("UFO.glb")])
  .then(([cowGltf, ufoGltf]) => {
    cowSource = cowGltf;
    createCows(cowGltf);
    createUfo(ufoGltf);
    setUfoPhase("hidden");
    resize();
    renderer.setAnimationLoop(animate);
  })
  .catch((error) => {
    console.error("Voxel Cow Rescue failed to load assets.", error);
  });

window.addEventListener("resize", resize);
host.addEventListener("pointerdown", onPointerDown);

function loadGltf(file) {
  return new Promise((resolve, reject) => {
    loader.load(`${ASSET_ROOT}${file}`, resolve, undefined, reject);
  });
}

function createCows(gltf) {
  cowSetups.forEach((setup, index) => {
    const model = SkeletonUtils.clone(gltf.scene);
    const mixer = new THREE.AnimationMixer(model);
    const actions = buildActions(gltf.animations, mixer);
    const cow = {
      index,
      model,
      mixer,
      actions,
      activeAction: null,
      state: "gone",
      stateTime: 0,
      walkDelay: setup.delay,
      walkSpeed: setup.speed,
      baseScale: setup.scale,
      target: new THREE.Vector3(),
      escapeTarget: new THREE.Vector3(),
      abductStart: new THREE.Vector3(),
      wobbleSeed: index * 0.9,
    };

    model.userData.cowIndex = index;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        child.userData.cowIndex = index;
        clickableMeshes.push(child);
      }
    });

    cows.push(cow);
    pasture.add(model);
    resetCow(cow, setup, "idle");
  });
}

function buildActions(animations, mixer) {
  return animations.reduce((actions, clip) => {
    actions[clip.name] = mixer.clipAction(clip);
    return actions;
  }, {});
}

function createUfo(gltf) {
  const ufoMesh = gltf.scene;
  const box = new THREE.Box3().setFromObject(ufoMesh);
  const center = box.getCenter(new THREE.Vector3());

  ufoMesh.position.sub(center);
  ufoModel = new THREE.Group();
  ufoModel.add(ufoMesh);
  ufoModel.scale.setScalar(0.012);
  scene.add(ufoModel);
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.04);
  elapsed += delta;

  updateCamera();
  updateUfo(delta);
  updateRefill(delta);
  cows.forEach((cow) => updateCow(cow, delta));
  renderer.render(scene, camera);
}

function updateCow(cow, delta) {
  if (cow.state === "gone" || cow.state === "safe") {
    return;
  }

  cow.stateTime += delta;

  if (cow.state !== "abducting") {
    cow.mixer.update(delta * (0.86 + cow.index * 0.06));
  }

  if (cow.state === "idle" && cow.stateTime > cow.walkDelay) {
    setCowState(cow, "walking");
    playCowAction(cow, "walk01");
  }

  if (cow.state === "walking") {
    const distance = cow.model.position.distanceTo(cow.target);
    moveToward(cow.model.position, cow.target, cow.walkSpeed * delta);
    faceMovement(cow.model, cow.target, 0.08);

    if (distance < 0.07) {
      setCowState(cow, "eating");
      playCowAction(cow, "eat01");
    }
  }

  if (cow.state === "escaping") {
    const distance = cow.model.position.distanceTo(cow.escapeTarget);
    moveToward(
      cow.model.position,
      cow.escapeTarget,
      cow.walkSpeed * 2.25 * delta,
    );
    faceMovement(cow.model, cow.escapeTarget, 0.22);

    if (distance < 0.09 || cow.stateTime > 4.8) {
      cow.mixer.stopAllAction();
      cow.model.visible = false;
      setCowState(cow, "safe");
    }
  }

  if (beamActive && canAbduct(cow)) {
    startAbduction(cow);
  }

  if (cow.state === "abducting") {
    updateAbduction(cow);
  }
}

function updateUfo(delta) {
  if (!ufoModel) {
    return;
  }

  ufoPhaseTime += delta;

  if (ufoPhase !== "hidden" && ufoPhase !== "cooldown") {
    ufoModel.rotation.y += delta * 0.3;
  }

  if (ufoPhase === "hidden" && ufoPhaseTime > FIRST_UFO_DELAY) {
    setUfoPhase("entering");
  }

  if (ufoPhase === "entering") {
    ufoModel.position.lerp(ufoTarget, delta * 0.68);
    if (ufoModel.position.distanceTo(ufoTarget) < 0.12 || ufoPhaseTime > 5) {
      setUfoPhase("hovering");
    }
  }

  if (ufoPhase === "hovering") {
    hoverUfo(delta);
    if (ufoPhaseTime > 1.3) {
      setUfoPhase("abducting");
    }
  }

  if (ufoPhase === "abducting") {
    hoverUfo(delta);
    const anyAbducting = cows.some((cow) => cow.state === "abducting");
    const anyCandidate = cows.some((cow) => canAbduct(cow));
    if (ufoPhaseTime > 8 && !anyAbducting && !anyCandidate) {
      setUfoPhase("leaving");
    }
    if (ufoPhaseTime > 12) {
      setUfoPhase("leaving");
    }
  }

  if (ufoPhase === "leaving") {
    ufoModel.position.lerp(ufoExitPosition, delta * 0.72);
    if (
      ufoModel.position.distanceTo(ufoExitPosition) < 0.15 ||
      ufoPhaseTime > 5
    ) {
      setUfoPhase("cooldown");
    }
  }

  if (ufoPhase === "cooldown" && ufoPhaseTime > UFO_COOLDOWN) {
    setUfoPhase("entering");
  }
}

function setUfoPhase(phase) {
  ufoPhase = phase;
  ufoPhaseTime = 0;

  if (phase === "hidden" || phase === "cooldown") {
    beamActive = false;
    beam.classList.remove("is-active");
    glow.classList.remove("is-active");
    if (ufoModel) {
      ufoModel.visible = false;
      ufoModel.position.copy(ufoEnterPosition);
    }
  }

  if (phase === "entering") {
    beamActive = false;
    beam.classList.remove("is-active");
    glow.classList.remove("is-active");
    ufoModel.visible = true;
    ufoModel.position.copy(ufoEnterPosition);
  }

  if (phase === "abducting") {
    beamActive = true;
    beam.classList.add("is-active");
    glow.classList.add("is-active");
  }

  if (phase === "leaving") {
    beamActive = false;
    beam.classList.remove("is-active");
    glow.classList.remove("is-active");
  }
}

function hoverUfo(delta) {
  const hover = Math.sin(elapsed * 1.35) * 0.08;
  ufoModel.position.x = THREE.MathUtils.lerp(
    ufoModel.position.x,
    ufoTarget.x,
    delta * 1.8,
  );
  ufoModel.position.y = ufoTarget.y + hover;
  ufoModel.position.z = THREE.MathUtils.lerp(
    ufoModel.position.z,
    ufoTarget.z,
    delta * 1.8,
  );
}

function updateRefill(delta) {
  if (!cowSource) {
    return;
  }

  const visibleCount = cows.filter((cow) => isVisibleInFrame(cow)).length;
  if (visibleCount >= MIN_VISIBLE_COWS) {
    refillTimer = 0;
    return;
  }

  refillTimer += delta;
  if (refillTimer < REFILL_INTERVAL) {
    return;
  }

  const cow = cows.find(
    (candidate) => candidate.state === "gone" || candidate.state === "safe",
  );
  if (!cow) {
    return;
  }

  refillTimer = 0;
  resetCow(cow, createSpawnSetup(cow.index), "walking");
}

function createSpawnSetup(index) {
  const fromLeft = (index + Math.floor(elapsed)) % 2 === 0;
  const lane = index % MAX_COWS;
  const startX = fromLeft ? -5.1 - lane * 0.14 : 5.1 + lane * 0.14;
  const targetX = THREE.MathUtils.clamp(
    (lane - 2) * 0.78 + Math.sin(elapsed + index) * 0.18,
    -1.75,
    1.75,
  );
  const targetZ = -0.24 - (lane % 3) * 0.18;
  const scale = 0.0102 + (lane % 4) * 0.0005;

  return {
    start: [startX, GROUND_Y, 0.34 + (lane % 2) * 0.18],
    target: [targetX, GROUND_Y, targetZ],
    rot: fromLeft ? 0.38 : -0.38,
    scale,
    delay: 0,
    speed: 0.92 + lane * 0.05,
  };
}

function isDisplayCow(cow) {
  return ["idle", "walking", "eating", "escaping", "abducting"].includes(
    cow.state,
  );
}

function isVisibleInFrame(cow) {
  return (
    isDisplayCow(cow) &&
    cow.model.visible &&
    Math.abs(cow.model.position.x) < 4.1
  );
}

function resetCow(cow, setup, initialState) {
  cow.mixer.stopAllAction();
  cow.activeAction = null;
  cow.baseScale = setup.scale;
  cow.walkDelay = setup.delay;
  cow.walkSpeed = setup.speed;
  cow.target.set(...setup.target);
  cow.escapeTarget.set(
    setup.start[0] < 0 ? -5.35 : 5.35,
    GROUND_Y,
    0.82 + cow.index * 0.05,
  );
  cow.model.visible = true;
  cow.model.position.set(...setup.start);
  cow.model.rotation.set(0, setup.rot, 0);
  cow.model.scale.setScalar(cow.baseScale);
  cow.wobbleSeed = cow.index * 0.9 + elapsed;

  setCowState(cow, initialState);
  playCowAction(cow, initialState === "walking" ? "walk01" : "Idle01", true, 0);
}

function canAbduct(cow) {
  if (!["idle", "walking", "eating"].includes(cow.state)) {
    return false;
  }

  const dx = cow.model.position.x - ufoTarget.x;
  const dz = cow.model.position.z - ufoTarget.z;
  return Math.hypot(dx, dz) < BEAM_RADIUS;
}

function startAbduction(cow) {
  setCowState(cow, "abducting");
  cow.abductStart.copy(cow.model.position);
  cow.mixer.stopAllAction();
}

function updateAbduction(cow) {
  const t = Math.min(cow.stateTime / 4.3, 1);
  const eased = easeInOutCubic(t);
  const wobble =
    Math.sin((cow.stateTime + cow.wobbleSeed) * 8) * (1 - eased) * 0.07;

  cow.model.position.x =
    THREE.MathUtils.lerp(cow.abductStart.x, ufoTarget.x, eased) + wobble;
  cow.model.position.y = THREE.MathUtils.lerp(
    cow.abductStart.y,
    ufoTarget.y - 0.62,
    eased,
  );
  cow.model.position.z = THREE.MathUtils.lerp(
    cow.abductStart.z,
    ufoTarget.z,
    eased,
  );
  cow.model.rotation.y += 0.035 + eased * 0.045;
  cow.model.scale.setScalar(
    cow.baseScale * THREE.MathUtils.lerp(1, 0.12, eased),
  );

  if (t >= 1) {
    cow.model.visible = false;
    setCowState(cow, "gone");
  }
}

function onPointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(clickableMeshes, true)[0];
  if (!hit) {
    return;
  }

  const cow = cows[hit.object.userData.cowIndex];
  if (!cow || !["idle", "walking", "eating"].includes(cow.state)) {
    return;
  }

  setCowState(cow, "escaping");
  playCowAction(cow, "Escape01", false);
}

function playCowAction(cow, name, loop = true, fade = 0.28) {
  const action = cow.actions[name] || cow.actions.Idle01;
  if (!action) {
    return;
  }

  if (cow.activeAction && cow.activeAction !== action) {
    cow.activeAction.fadeOut(fade);
  }

  action.reset();
  action.enabled = true;
  action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
  action.clampWhenFinished = !loop;
  action.fadeIn(fade).play();
  cow.activeAction = action;
}

function setCowState(cow, state) {
  cow.state = state;
  cow.stateTime = 0;
}

function faceMovement(model, target, amount) {
  const dx = target.x - model.position.x;
  const dz = target.z - model.position.z;
  if (Math.abs(dx) + Math.abs(dz) < 0.001) {
    return;
  }

  const targetRotation = Math.atan2(dx, dz) + Math.PI;
  model.rotation.y = THREE.MathUtils.lerp(
    model.rotation.y,
    targetRotation,
    amount,
  );
}

function moveToward(position, target, step) {
  const direction = target.clone().sub(position);
  const distance = direction.length();
  if (distance <= step || distance < 0.001) {
    position.copy(target);
    return;
  }

  position.addScaledVector(direction.normalize(), step);
}

function resize() {
  const { clientWidth, clientHeight } = host;
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
}

function updateCamera() {
  const narrow = window.innerWidth < 760;
  const wide = window.innerWidth / Math.max(window.innerHeight, 1) > 1.45;

  if (narrow) {
    camera.position.set(0, 2.1, 9.35);
    camera.lookAt(0, 0.22, -0.38);
    return;
  }

  if (wide) {
    camera.position.set(0, 2.0, 6.55);
    camera.lookAt(0, 0.02, -0.42);
    return;
  }

  camera.position.set(0, 2.35, 8.95);
  camera.lookAt(0, 0.22, -0.38);
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}
