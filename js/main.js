import * as THREE from "https://esm.sh/three@0.164.1";
import { RoundedBoxGeometry } from "https://esm.sh/three@0.164.1/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "https://esm.sh/three@0.164.1/examples/jsm/environments/RoomEnvironment.js";

// ========================================
// Portfolio data
// ========================================

const connectLinks = [
  {
    title: "X",
    url: "https://x.com/TaraMomon",
    secondaryTitle: "Open Contact Form",
    secondaryUrl: "https://forms.gle/F35c4ANW9pa9Lpts9",
  },
];

const portfolioLinks = [
  {
    label: "BEHANCE",
    title: "Visuals, Motion",
    linkText: "Visit",
    url: "https://www.behance.net/DesignTworks",
    image: "assets/works/Behance.png",
    imageAlt: "Behance card image",
  },
  {
    label: "NOTION",
    title: "Voxel Works",
    linkText: "Visit",
    url: "https://www.notion.so/tara-momon/Voxel-Works-Tara37-28b5d3648bde8018af70d601e7c6cfdf",
    image: "assets/works/notion.png",
    imageAlt: "Voxel Works card image",
  },
  {
    label: "LANCERS",
    title: "Client Work",
    linkText: "Visit",
    url: "https://www.lancers.jp/profile/DesignTworks?ref=header_menu",
    image: "assets/works/Lancers.png",
    imageAlt: "Work request card image",
  },
];

const selectedWorks = [
  {
    type: "image",
    label: "STILL",
    title: "Rabbit Bicycle",
    file: "assets/works/Rabbit_Bicycle.png",
    alt: "Rabbit Bicycle artwork",
    mediaClass: "about-card__media about-card__media--portrait",
  },
  {
    type: "image",
    label: "STILL",
    title: "Mothership Delivering Bike",
    file: "assets/works/Mothership_delivering_bike.png",
    alt: "Mothership Delivering Bike artwork",
    mediaClass: "about-card__media about-card__media--landscape",
  },
  {
    type: "video",
    label: "VIDEO",
    title: "The Giant Holographic",
    file: "assets/works/The_giant_holographic2.mp4",
    alt: "The Giant Holographic video artwork",
    mediaClass: "about-card__media about-card__media--video",
  },
];

// ========================================
// DOM setup
// ========================================

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const mobileNavLinks = document.querySelectorAll(".mobile-nav a");
const heroCanvasHost = document.getElementById("hero-canvas-host");
const linkCardGrid = document.getElementById("link-card-grid");
const selectedWorksGrid = document.getElementById("selected-works-grid");
const connectGrid = document.getElementById("connect-grid");
const workModal = document.getElementById("work-modal");
const workModalMedia = document.getElementById("work-modal-media");
const modalCloseButtons = document.querySelectorAll("[data-close-modal]");

function renderLinkCards() {
  const cardsMarkup = portfolioLinks
    .map((item) => {
      const descriptionMarkup = item.description
        ? `<p class="link-card__text">${item.description}</p>`
        : "";

      return `
        <article class="link-card">
          <a
            href="${item.url}"
            target="_blank"
            rel="noopener noreferrer"
            referrerpolicy="no-referrer"
          >
            <div class="link-card__image">
              <img src="${item.image}" alt="${item.imageAlt}" loading="lazy">
            </div>
            <div class="link-card__body">
              <span class="link-card__label">${item.label}</span>
              <h3 class="link-card__title">${item.title}</h3>
              ${descriptionMarkup}
              <div class="link-card__footer">
                <span>${item.linkText || "Visit"}</span>
                <span class="link-card__arrow" aria-hidden="true">→</span>
              </div>
            </div>
          </a>
        </article>
      `;
    })
    .join("");

  linkCardGrid.innerHTML = cardsMarkup;
}

function renderConnectCards() {
  const cardsMarkup = connectLinks
    .map(
      (item) => `
        <div class="connect-card">
          <a
            class="connect-card__link connect-card__link--primary"
            href="${item.url}"
            target="_blank"
            rel="noopener noreferrer"
            referrerpolicy="no-referrer"
          >
            <span class="connect-card__title">${item.title}</span>
          </a>
          ${
            item.secondaryTitle && item.secondaryUrl
              ? `
          <a
            class="connect-card__link connect-card__link--secondary"
            href="${item.secondaryUrl}"
            target="_blank"
            rel="noopener noreferrer"
            referrerpolicy="no-referrer"
          >
            <span class="connect-card__subtitle">${item.secondaryTitle}</span>
          </a>
          `
              : ""
          }
        </div>
      `,
    )
    .join("");

  connectGrid.innerHTML = cardsMarkup;
}

function createSelectedWorkMedia(item) {
  if (item.type === "video") {
    return `
      <div class="${item.mediaClass}">
        <video muted loop playsinline autoplay preload="metadata" aria-label="${item.alt}">
          <source src="${item.file}" type="video/mp4">
        </video>
      </div>
    `;
  }

  return `
    <div class="${item.mediaClass}">
      <img src="${item.file}" alt="${item.alt}" loading="lazy">
    </div>
  `;
}

function renderSelectedWorks() {
  const cardsMarkup = selectedWorks
    .map((item, index) => {
      const actionText = item.type === "video" ? "Play" : "View";
      const mediaMarkup = createSelectedWorkMedia(item);

      return `
        <article class="about-card">
          <button class="about-card__button" type="button" data-work-trigger="${index}">
            ${mediaMarkup}
            <div class="about-card__body">
              <div>
                <span class="about-card__label">${item.label}</span>
                <h3 class="about-card__title">${item.title}</h3>
              </div>
              <span class="about-card__action">${actionText}</span>
            </div>
          </button>
        </article>
      `;
    })
    .join("");

  selectedWorksGrid.innerHTML = cardsMarkup;
}

function openWorkModal(item) {
  if (item.type === "video") {
    workModalMedia.innerHTML = `
      <video controls autoplay muted loop playsinline aria-label="${item.title}">
        <source src="${item.file}" type="video/mp4">
      </video>
    `;
  } else {
    workModalMedia.innerHTML = `
      <img src="${item.file}" alt="${item.alt}" loading="eager">
    `;
  }

  workModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeWorkModal() {
  workModal.hidden = true;
  workModalMedia.innerHTML = "";
  document.body.style.overflow = "";
}

function setupSelectedWorksInteractions() {
  selectedWorksGrid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-work-trigger]");

    if (!trigger) {
      return;
    }

    const item = selectedWorks[Number(trigger.dataset.workTrigger)];

    if (!item) {
      return;
    }

    openWorkModal(item);
  });
}

function updateHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeMobileMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  mobileNav.hidden = true;
}

function toggleMobileMenu() {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  mobileNav.hidden = isOpen;
}

function initHeroCubes() {
  if (!heroCanvasHost) {
    return;
  }

  const host = heroCanvasHost;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x071a36, 10, 28);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(0x000000, 0);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(host.clientWidth || 1, host.clientHeight || 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  renderer.domElement.style.pointerEvents = "none";
  host.innerHTML = "";
  host.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    32,
    (host.clientWidth || 1) / (host.clientHeight || 1),
    0.1,
    100,
  );
  camera.position.set(0.8, 2.0, 12.5);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(
    new RoomEnvironment(renderer),
    0.04,
  ).texture;

  const ambient = new THREE.AmbientLight(0xd7ecff, 0.8);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0xc9ecff, 0x0a1630, 1.0);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(0xdff4ff, 2.1);
  keyLight.position.set(4.5, 8, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x7fd8ff, 2.8, 20, 2);
  fillLight.position.set(-3.2, 2.8, 5.5);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0xd8f8ff, 2.15, 22, 2);
  rimLight.position.set(5.5, 4.5, -1.5);
  scene.add(rimLight);

  const jewelAccentLight = new THREE.PointLight(0xc8ff9b, 0.72, 12, 2);
  jewelAccentLight.position.set(1.1, 1.35, 2.6);
  scene.add(jewelAccentLight);

  const amberAccentLight = new THREE.PointLight(0xd8fff0, 0.16, 10, 2);
  amberAccentLight.position.set(2.6, 0.2, 2.9);
  scene.add(amberAccentLight);

  const limeAccentLight = new THREE.PointLight(0xb8ff8f, 0.38, 10, 2);
  limeAccentLight.position.set(1.5, 1.2, 2.5);
  scene.add(limeAccentLight);

  const lowerFill = new THREE.PointLight(0x79d7ff, 0.95, 18, 2);
  lowerFill.position.set(1.8, -0.6, 4.2);
  scene.add(lowerFill);

  function createGlowTexture(
    size = 512,
    inner = "rgba(180,225,255,0.55)",
    outer = "rgba(180,225,255,0)",
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas 2D context could not be created.");
    }

    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.06,
      size / 2,
      size / 2,
      size * 0.5,
    );
    grad.addColorStop(0, inner);
    grad.addColorStop(0.35, "rgba(170,220,255,0.18)");
    grad.addColorStop(1, outer);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const glowTexture = createGlowTexture();

  function createGroundGlow(width, height, color = 0xbfeaff, opacity = 0.22) {
    const material = new THREE.MeshBasicMaterial({
      map: glowTexture,
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      material,
    );
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  const clusterGlow = createGroundGlow(11.6, 7.2, 0xc7e8ff, 0.09);
  clusterGlow.position.set(0.18, -1.3, 0.08);
  scene.add(clusterGlow);

  const frontGlow = createGroundGlow(6.6, 3.8, 0x8fe0ff, 0.06);
  frontGlow.position.set(-0.36, -1.22, 1.02);
  scene.add(frontGlow);

  const trailGlow = createGroundGlow(13.4, 3.2, 0x89d8ff, 0.032);
  trailGlow.position.set(-0.54, -1.27, -0.1);
  scene.add(trailGlow);

  const floorVeil = createGroundGlow(17.2, 4.8, 0xa7deff, 0.018);
  floorVeil.position.set(0.0, -1.3, 0.18);
  scene.add(floorVeil);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 12),
    new THREE.ShadowMaterial({
      opacity: 0.08,
      transparent: true,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.3;
  floor.receiveShadow = true;
  scene.add(floor);

  function glassMaterial({
    color,
    transmission = 1,
    opacity = 0.98,
    roughness = 0.08,
    thickness = 1.2,
    ior = 1.22,
    emissive = 0x000000,
    emissiveIntensity = 0,
    metalness = 0.02,
  } = {}) {
    return new THREE.MeshPhysicalMaterial({
      color,
      transparent: true,
      opacity,
      roughness,
      metalness,
      transmission,
      thickness,
      ior,
      reflectivity: 0.65,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.35,
      emissive,
      emissiveIntensity,
    });
  }

  const materials = {
    ice: glassMaterial({
      color: 0xe8fbff,
      transmission: 1,
      opacity: 0.46,
      roughness: 0.006,
      thickness: 2.45,
      ior: 1.27,
      emissive: 0xc5f5ff,
      emissiveIntensity: 0.09,
      metalness: 0.01,
    }),
    cyan: glassMaterial({
      color: 0x68e8ff,
      transmission: 1,
      opacity: 0.66,
      roughness: 0.012,
      thickness: 2.05,
      ior: 1.25,
      emissive: 0x2fdfff,
      emissiveIntensity: 0.38,
      metalness: 0.015,
    }),
    paleBlue: glassMaterial({
      color: 0xa7d9ff,
      transmission: 0.98,
      opacity: 0.56,
      roughness: 0.018,
      thickness: 1.85,
      ior: 1.24,
      emissive: 0x72c4ff,
      emissiveIntensity: 0.13,
      metalness: 0.02,
    }),
    navy: glassMaterial({
      color: 0x0d2f73,
      transmission: 0.94,
      roughness: 0.018,
      thickness: 3.05,
      opacity: 0.78,
      ior: 1.25,
      emissive: 0x1a58bd,
      emissiveIntensity: 0.24,
      metalness: 0.03,
    }),
    clear: glassMaterial({
      color: 0xf6fdff,
      transmission: 1,
      roughness: 0.01,
      thickness: 1.5,
      opacity: 0.42,
      ior: 1.24,
      emissive: 0xb6ecff,
      emissiveIntensity: 0.05,
      metalness: 0.01,
    }),
    lime: glassMaterial({
      color: 0xcfff79,
      transmission: 0.96,
      opacity: 0.62,
      roughness: 0.018,
      thickness: 1.9,
      ior: 1.23,
      emissive: 0xbaff62,
      emissiveIntensity: 0.2,
      metalness: 0.015,
    }),
    mint: glassMaterial({
      color: 0x6af4cf,
      transmission: 0.97,
      opacity: 0.66,
      roughness: 0.014,
      thickness: 2.05,
      ior: 1.24,
      emissive: 0x38efc9,
      emissiveIntensity: 0.22,
      metalness: 0.012,
    }),
    amber: glassMaterial({
      color: 0xe9f7d4,
      transmission: 0.92,
      opacity: 0.46,
      roughness: 0.018,
      thickness: 1.85,
      ior: 1.22,
      emissive: 0xd6ffe1,
      emissiveIntensity: 0.08,
      metalness: 0.012,
    }),
  };

  materials.ice.envMapIntensity = 2.05;
  materials.ice.clearcoatRoughness = 0.012;
  materials.cyan.envMapIntensity = 1.95;
  materials.cyan.clearcoatRoughness = 0.016;
  materials.paleBlue.envMapIntensity = 1.72;
  materials.paleBlue.clearcoatRoughness = 0.02;
  materials.navy.envMapIntensity = 1.72;
  materials.navy.clearcoatRoughness = 0.018;
  materials.clear.envMapIntensity = 1.95;
  materials.clear.clearcoatRoughness = 0.012;
  materials.lime.envMapIntensity = 1.62;
  materials.lime.clearcoatRoughness = 0.018;
  materials.mint.envMapIntensity = 1.86;
  materials.mint.clearcoatRoughness = 0.018;
  materials.amber.envMapIntensity = 1.64;
  materials.amber.clearcoatRoughness = 0.02;

  const themeNames = ["cyan", "navy", "ice"];
  let themeIndex = 0;

  const materialThemeState = { cyan: 1, navy: 0, ice: 0 };
  const materialThemeTarget = { cyan: 1, navy: 0, ice: 0 };
  let themePulse = 0;

  function createJewelCoreMaterial(color, opacity) {
    return new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
  }

  function createJewelEdgeMaterial(color, opacity) {
    return new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
  }

  const jewelCoreMaterials = {
    cyan: createJewelCoreMaterial(0x22eaff, 0.22),
    paleBlue: createJewelCoreMaterial(0x6fd7ff, 0.14),
    navy: createJewelCoreMaterial(0x1e65ff, 0.16),
    lime: createJewelCoreMaterial(0xc8ff57, 0.18),
    mint: createJewelCoreMaterial(0x2cf0ce, 0.2),
    amber: createJewelCoreMaterial(0xd8ffe6, 0.08),
  };

  const jewelEdgeMaterials = {
    cyan: createJewelEdgeMaterial(0xbaf7ff, 0.34),
    paleBlue: createJewelEdgeMaterial(0xc8ecff, 0.26),
    navy: createJewelEdgeMaterial(0x70a8ff, 0.26),
    lime: createJewelEdgeMaterial(0xe5ff9b, 0.3),
    mint: createJewelEdgeMaterial(0x9dffe8, 0.32),
    amber: createJewelEdgeMaterial(0xebfff6, 0.18),
    ice: createJewelEdgeMaterial(0xf3fdff, 0.24),
  };

  function setThemeTarget(name) {
    materialThemeTarget.cyan = name === "cyan" ? 1 : 0;
    materialThemeTarget.navy = name === "navy" ? 1 : 0;
    materialThemeTarget.ice = name === "ice" ? 1 : 0;
  }

  function mixColor(target, baseHex, emphasisHex, weight) {
    target.color.setHex(baseHex).lerp(new THREE.Color(emphasisHex), weight);
  }

  function mixEmissive(target, baseHex, emphasisHex, weight) {
    target.emissive.setHex(baseHex).lerp(new THREE.Color(emphasisHex), weight);
  }

  function applyMaterialTheme() {
    materialThemeState.cyan +=
      (materialThemeTarget.cyan - materialThemeState.cyan) * 0.15;
    materialThemeState.navy +=
      (materialThemeTarget.navy - materialThemeState.navy) * 0.15;
    materialThemeState.ice +=
      (materialThemeTarget.ice - materialThemeState.ice) * 0.15;

    const cyanWeight = materialThemeState.cyan;
    const navyWeight = materialThemeState.navy;
    const iceWeight = materialThemeState.ice;
    const pulseWeight = themePulse;

    mixColor(
      materials.cyan,
      0x68e8ff,
      0x21f0ff,
      cyanWeight * 0.86 + iceWeight * 0.16,
    );
    mixEmissive(materials.cyan, 0x2fdfff, 0x00e6ff, cyanWeight * 0.95);
    materials.cyan.emissiveIntensity =
      0.38 + cyanWeight * 0.42 + pulseWeight * 0.1;
    materials.cyan.opacity = 0.66 + cyanWeight * 0.06;
    materials.cyan.envMapIntensity =
      1.95 + cyanWeight * 0.38 + pulseWeight * 0.1;
    materials.cyan.thickness = 2.05 + cyanWeight * 0.32;

    mixColor(materials.navy, 0x0d2f73, 0x05236f, navyWeight * 0.9);
    mixEmissive(materials.navy, 0x1a58bd, 0x0f5ddb, navyWeight * 0.78);
    materials.navy.emissiveIntensity =
      0.24 + navyWeight * 0.2 + pulseWeight * 0.035;
    materials.navy.opacity = 0.78 + navyWeight * 0.08;
    materials.navy.envMapIntensity =
      1.72 + navyWeight * 0.32 + pulseWeight * 0.08;
    materials.navy.thickness = 3.05 + navyWeight * 0.34;

    mixColor(
      materials.ice,
      0xe8fbff,
      0xffffff,
      iceWeight * 0.75 + cyanWeight * 0.15,
    );
    mixEmissive(materials.ice, 0xc5f5ff, 0xe6fdff, iceWeight * 0.8);
    materials.ice.opacity = 0.46 - iceWeight * 0.08 + cyanWeight * 0.03;
    materials.ice.emissiveIntensity =
      0.09 + iceWeight * 0.2 + cyanWeight * 0.05 + pulseWeight * 0.045;
    materials.ice.envMapIntensity = 2.05 + iceWeight * 0.46 + pulseWeight * 0.1;
    materials.ice.thickness = 2.45 + iceWeight * 0.32;

    mixColor(materials.clear, 0xf6fdff, 0xffffff, iceWeight * 0.7);
    mixEmissive(materials.clear, 0xb6ecff, 0xe9fbff, iceWeight * 0.72);
    materials.clear.opacity = 0.42 - iceWeight * 0.08;
    materials.clear.emissiveIntensity =
      0.05 + iceWeight * 0.14 + pulseWeight * 0.035;
    materials.clear.envMapIntensity =
      1.95 + iceWeight * 0.42 + pulseWeight * 0.08;

    mixColor(
      materials.paleBlue,
      0xa7d9ff,
      0x62dfff,
      cyanWeight * 0.62 + iceWeight * 0.18,
    );
    mixEmissive(materials.paleBlue, 0x72c4ff, 0x38dfff, cyanWeight * 0.68);
    materials.paleBlue.emissiveIntensity =
      0.13 + cyanWeight * 0.16 + iceWeight * 0.07 + pulseWeight * 0.04;
    materials.paleBlue.envMapIntensity =
      1.72 + iceWeight * 0.18 + cyanWeight * 0.18;

    mixColor(
      materials.lime,
      0xcfff79,
      0xdfff55,
      iceWeight * 0.16 + cyanWeight * 0.08,
    );
    mixEmissive(
      materials.lime,
      0xbaff62,
      0xd6ff60,
      iceWeight * 0.24 + pulseWeight * 0.1,
    );
    materials.lime.emissiveIntensity =
      0.2 + cyanWeight * 0.04 + iceWeight * 0.035 + pulseWeight * 0.035;
    materials.lime.envMapIntensity = 1.62 + iceWeight * 0.12;

    mixColor(
      materials.mint,
      0x6af4cf,
      0x34f2d5,
      cyanWeight * 0.72 + iceWeight * 0.18,
    );
    mixEmissive(materials.mint, 0x38efc9, 0x14efd4, cyanWeight * 0.8);
    materials.mint.emissiveIntensity =
      0.22 + cyanWeight * 0.2 + iceWeight * 0.06 + pulseWeight * 0.065;
    materials.mint.opacity = 0.66 + cyanWeight * 0.055 - iceWeight * 0.025;
    materials.mint.envMapIntensity = 1.86 + cyanWeight * 0.3 + iceWeight * 0.12;

    mixColor(
      materials.amber,
      0xe9f7d4,
      0xf7fff0,
      iceWeight * 0.36 + cyanWeight * 0.08,
    );
    mixEmissive(
      materials.amber,
      0xd6ffe1,
      0xf2fff9,
      iceWeight * 0.45 + pulseWeight * 0.1,
    );
    materials.amber.emissiveIntensity =
      0.08 + iceWeight * 0.07 + cyanWeight * 0.025 + pulseWeight * 0.025;
    materials.amber.opacity = 0.46 + iceWeight * 0.035;
    materials.amber.envMapIntensity =
      1.64 + iceWeight * 0.14 + pulseWeight * 0.035;

    jewelCoreMaterials.cyan.opacity =
      0.22 + cyanWeight * 0.11 + pulseWeight * 0.08;
    jewelCoreMaterials.paleBlue.opacity =
      0.14 + cyanWeight * 0.08 + iceWeight * 0.05 + pulseWeight * 0.04;
    jewelCoreMaterials.navy.opacity =
      0.16 + navyWeight * 0.1 + pulseWeight * 0.035;
    jewelCoreMaterials.lime.opacity =
      0.18 + iceWeight * 0.05 + pulseWeight * 0.035;
    jewelCoreMaterials.mint.opacity =
      0.2 + cyanWeight * 0.12 + pulseWeight * 0.07;
    jewelCoreMaterials.amber.opacity =
      0.08 + iceWeight * 0.045 + pulseWeight * 0.02;

    jewelEdgeMaterials.cyan.opacity =
      0.34 + cyanWeight * 0.1 + pulseWeight * 0.07;
    jewelEdgeMaterials.paleBlue.opacity =
      0.26 + cyanWeight * 0.06 + iceWeight * 0.04 + pulseWeight * 0.04;
    jewelEdgeMaterials.navy.opacity =
      0.26 + navyWeight * 0.09 + pulseWeight * 0.04;
    jewelEdgeMaterials.lime.opacity =
      0.3 + iceWeight * 0.04 + pulseWeight * 0.035;
    jewelEdgeMaterials.mint.opacity =
      0.32 + cyanWeight * 0.09 + pulseWeight * 0.06;
    jewelEdgeMaterials.amber.opacity =
      0.18 + iceWeight * 0.04 + pulseWeight * 0.02;
    jewelEdgeMaterials.ice.opacity =
      0.24 + iceWeight * 0.08 + pulseWeight * 0.035;
  }

  const cluster = new THREE.Group();
  cluster.position.set(0.36, 0.84, -0.18);
  cluster.rotation.y = -0.38;
  cluster.rotation.x = 0.06;
  cluster.scale.setScalar(0.5);
  scene.add(cluster);

  const baseClusterTransform = {
    positionX: 0.36,
    positionY: 0.84,
    positionZ: -0.18,
    rotationX: 0.06,
    rotationY: -0.38,
    rotationZ: 0,
    scale: 0.5,
  };

  const interactionState = {
    isPointerDown: false,
    moved: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    dragRotationX: 0,
    dragRotationY: 0,
    targetRotationX: 0,
    targetRotationY: 0,
    impulseRotationY: 0,
  };

  const cubeLayout = [
    { x: -1.8, y: 0.0, z: 0.8, s: [1.12, 1.12, 1.12], m: "ice" },
    { x: -0.72, y: 0.0, z: 0.3, s: [1.18, 1.18, 1.18], m: "navy" },
    { x: 0.35, y: 0.0, z: 0.2, s: [1.14, 1.14, 1.14], m: "paleBlue" },
    { x: 1.42, y: 0.0, z: 0.15, s: [1.06, 1.06, 1.06], m: "cyan" },
    { x: 2.46, y: 0.02, z: 0.42, s: [1.08, 1.08, 1.08], m: "navy" },
    { x: -1.25, y: 1.08, z: 0.2, s: [1.12, 1.12, 1.12], m: "cyan" },
    { x: -0.2, y: 1.06, z: 0.55, s: [1.08, 1.08, 1.08], m: "cyan" },
    { x: 0.9, y: 1.05, z: 0.25, s: [1.12, 1.12, 1.12], m: "lime" },
    { x: 1.92, y: 1.02, z: 0.58, s: [1.02, 1.02, 1.02], m: "ice" },
    { x: -0.72, y: 2.15, z: 0.18, s: [1.1, 1.1, 1.1], m: "navy" },
    { x: 0.35, y: 2.16, z: 0.12, s: [1.16, 1.16, 1.16], m: "cyan" },
    { x: 1.45, y: 2.12, z: 0.5, s: [1.04, 1.04, 1.04], m: "paleBlue" },
    { x: -0.15, y: 3.25, z: 0.2, s: [1.08, 1.08, 1.08], m: "navy" },
    { x: 0.92, y: 3.24, z: 0.32, s: [1.1, 1.1, 1.1], m: "ice" },
    { x: 0.35, y: 4.32, z: 0.15, s: [1.02, 1.02, 1.02], m: "ice" },
    { x: 2.7, y: 0.56, z: 1.02, s: [0.78, 0.78, 0.78], m: "clear" },
    { x: 2.04, y: 2.0, z: 1.08, s: [0.84, 0.84, 0.84], m: "paleBlue" },
    { x: -1.82, y: 1.64, z: 0.98, s: [0.86, 0.86, 0.86], m: "clear" },
    { x: 0.42, y: 0.55, z: 1.08, s: [0.94, 0.94, 0.94], m: "ice" },
    { x: 1.14, y: 2.86, z: 0.92, s: [0.88, 0.88, 0.88], m: "paleBlue" },
  ];

  const cubes = [];

  for (const item of cubeLayout) {
    const geometry = new RoundedBoxGeometry(
      item.s[0],
      item.s[1],
      item.s[2],
      4,
      0.16,
    );
    const mesh = new THREE.Mesh(geometry, materials[item.m]);

    const coreMaterial = jewelCoreMaterials[item.m];
    if (coreMaterial) {
      const coreGeometry = new RoundedBoxGeometry(
        item.s[0] * 0.52,
        item.s[1] * 0.52,
        item.s[2] * 0.52,
        3,
        0.1,
      );
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      core.renderOrder = 2;
      mesh.add(core);
    }

    const edgeMaterial = jewelEdgeMaterials[item.m];
    if (edgeMaterial) {
      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry, 18),
        edgeMaterial,
      );
      edge.scale.setScalar(1.004);
      edge.renderOrder = 3;
      mesh.add(edge);
    }

    mesh.position.set(item.x, item.y, item.z);
    mesh.castShadow = true;
    mesh.rotation.set(
      THREE.MathUtils.degToRad((Math.random() - 0.5) * 8),
      THREE.MathUtils.degToRad((Math.random() - 0.5) * 12),
      THREE.MathUtils.degToRad((Math.random() - 0.5) * 8),
    );
    cluster.add(mesh);
    cubes.push(mesh);
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function resizeHeroScene() {
    const width = host.clientWidth || 1;
    const height = host.clientHeight || 1;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    if (width < 900) {
      camera.position.set(0.6, 1.95, 14.2);
      baseClusterTransform.positionX = 0.12;
      baseClusterTransform.positionY = 0.5;
      baseClusterTransform.positionZ = -0.08;
      baseClusterTransform.scale = 0.6;
    } else {
      camera.position.set(0.8, 2.0, 13.0);
      baseClusterTransform.positionX = 0.6;
      baseClusterTransform.positionY = 1.2;
      baseClusterTransform.positionZ = -0.18;
      baseClusterTransform.scale = 0.4;
    }

    cluster.position.set(
      baseClusterTransform.positionX,
      baseClusterTransform.positionY,
      baseClusterTransform.positionZ,
    );
    cluster.scale.setScalar(baseClusterTransform.scale);
  }

  function onPointerDown(event) {
    if (prefersReducedMotion.matches) {
      return;
    }

    interactionState.isPointerDown = true;
    interactionState.moved = false;
    interactionState.pointerId = event.pointerId;
    interactionState.startX = event.clientX;
    interactionState.startY = event.clientY;
    host.classList.add("is-dragging");
    host.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (
      !interactionState.isPointerDown ||
      interactionState.pointerId !== event.pointerId
    ) {
      return;
    }

    const deltaX = event.clientX - interactionState.startX;
    const deltaY = event.clientY - interactionState.startY;
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      interactionState.moved = true;
    }

    interactionState.targetRotationY = clamp(deltaX / width, -0.12, 0.12);
    interactionState.targetRotationX = clamp(deltaY / height, -0.08, 0.08);
  }

  function releasePointer(pointerId) {
    if (pointerId !== null) {
      host.releasePointerCapture?.(pointerId);
    }

    interactionState.isPointerDown = false;
    interactionState.pointerId = null;
    interactionState.targetRotationX = 0;
    interactionState.targetRotationY = 0;
    host.classList.remove("is-dragging");
  }

  function onPointerUp(event) {
    if (interactionState.pointerId !== event.pointerId) {
      return;
    }

    const travelX = event.clientX - interactionState.startX;
    releasePointer(event.pointerId);

    if (!interactionState.moved) {
      const direction = travelX >= 0 ? 1 : -1;
      interactionState.impulseRotationY += 0.095 * direction;
      interactionState.impulseRotationY = clamp(
        interactionState.impulseRotationY,
        -0.16,
        0.16,
      );
      themeIndex = (themeIndex + 1) % themeNames.length;
      setThemeTarget(themeNames[themeIndex]);
      themePulse = 1;
    }
  }

  function onPointerCancel(event) {
    if (interactionState.pointerId !== event.pointerId) {
      return;
    }
    releasePointer(event.pointerId);
  }

  host.addEventListener("pointerdown", onPointerDown);
  host.addEventListener("pointermove", onPointerMove);
  host.addEventListener("pointerup", onPointerUp);
  host.addEventListener("pointerleave", onPointerCancel);
  host.addEventListener("pointercancel", onPointerCancel);

  resizeHeroScene();
  window.addEventListener("resize", resizeHeroScene);

  const clock = new THREE.Clock();

  function animateHeroScene() {
    const elapsed = clock.getElapsedTime();
    themePulse += (0 - themePulse) * 0.08;
    applyMaterialTheme();

    if (!prefersReducedMotion.matches) {
      interactionState.dragRotationX +=
        (interactionState.targetRotationX - interactionState.dragRotationX) *
        0.095;
      interactionState.dragRotationY +=
        (interactionState.targetRotationY - interactionState.dragRotationY) *
        0.095;
      interactionState.impulseRotationY *= 0.91;

      const idleRotationY = Math.sin(elapsed * 0.22) * 0.05;
      const idleRotationX = Math.sin(elapsed * 0.18) * 0.018;
      const idleFloatY = Math.sin(elapsed * 0.35) * 0.08;

      cluster.rotation.y =
        baseClusterTransform.rotationY +
        idleRotationY +
        interactionState.dragRotationY +
        interactionState.impulseRotationY;
      cluster.rotation.x =
        baseClusterTransform.rotationX +
        idleRotationX +
        interactionState.dragRotationX * 0.98;
      cluster.rotation.z =
        baseClusterTransform.rotationZ - interactionState.dragRotationY * 0.22;
      cluster.position.y =
        baseClusterTransform.positionY +
        idleFloatY -
        interactionState.dragRotationX * 0.14;
      cluster.position.x =
        baseClusterTransform.positionX + interactionState.dragRotationY * 0.2;

      cubes.forEach((cube, index) => {
        cube.rotation.y += 0.0012 + index * 0.00002;
        cube.rotation.x += 0.00035;
      });

      fillLight.intensity = 2.8 + themePulse * 0.3;
      rimLight.intensity = 2.15 + themePulse * 0.55;
      lowerFill.intensity = 0.95 + themePulse * 0.18;
      jewelAccentLight.intensity = 0.72 + themePulse * 0.24;
      amberAccentLight.intensity = 0.16 + themePulse * 0.06;
      limeAccentLight.intensity = 0.38 + themePulse * 0.08;

      frontGlow.material.opacity =
        0.055 + Math.sin(elapsed * 1.1) * 0.007 + themePulse * 0.011;
      clusterGlow.material.opacity =
        0.09 + Math.sin(elapsed * 0.8) * 0.01 + themePulse * 0.009;
      trailGlow.material.opacity =
        0.03 + Math.sin(elapsed * 0.7) * 0.004 + themePulse * 0.004;
      floorVeil.material.opacity = 0.018 + Math.sin(elapsed * 0.55) * 0.003;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animateHeroScene);
  }

  animateHeroScene();
}

// ========================================
// GSAP animation
// ========================================

function animateHero() {
  if (!window.gsap) {
    return;
  }

  const heroTimeline = window.gsap.timeline({
    defaults: { ease: "power2.out" },
  });

  heroTimeline
    .from(".js-hero-title", {
      opacity: 0,
      y: 24,
      duration: 0.9,
    })
    .from(
      ".js-hero-media",
      {
        opacity: 0,
        y: 28,
        duration: 1,
      },
      "-=0.42",
    );
}

function setupSectionReveal() {
  const revealTargets = document.querySelectorAll(".js-reveal");

  if (!("IntersectionObserver" in window) || !window.gsap) {
    revealTargets.forEach((target) => {
      target.style.opacity = "1";
      target.style.transform = "translateY(0)";
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        window.gsap.to(entry.target, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        });

        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
    },
  );

  revealTargets.forEach((target) => observer.observe(target));
}

// ========================================
// Events
// ========================================

initHeroCubes();
renderLinkCards();
renderSelectedWorks();
renderConnectCards();
updateHeaderState();
animateHero();
setupSectionReveal();
setupSelectedWorksInteractions();

window.addEventListener("scroll", updateHeaderState);

menuToggle.addEventListener("click", toggleMobileMenu);

mobileNavLinks.forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 768) {
    closeMobileMenu();
  }
});

modalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeWorkModal);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !workModal.hidden) {
    closeWorkModal();
  }
});
