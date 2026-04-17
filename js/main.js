// ========================================
// Portfolio data
// ========================================

const heroImages = {
  desktop: "assets/hero/pc/PortfolioHub_PC.png",
  mobile: "assets/hero/sp/PortfolioHub_sp.png",
  alt: "DesignTworks portfolio hero visual",
};

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
const heroImageMobile = document.getElementById("hero-image-mobile");
const heroImageDefault = document.getElementById("hero-image-default");
const linkCardGrid = document.getElementById("link-card-grid");
const selectedWorksGrid = document.getElementById("selected-works-grid");
const connectGrid = document.getElementById("connect-grid");
const workModal = document.getElementById("work-modal");
const workModalMedia = document.getElementById("work-modal-media");
const modalCloseButtons = document.querySelectorAll("[data-close-modal]");

function applyHeroImages() {
  // Keep these references easy to find so a higher quality hero can be swapped in later.
  heroImageMobile.srcset = heroImages.mobile;
  heroImageDefault.src = heroImages.desktop;
  heroImageDefault.alt = heroImages.alt;
}

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

applyHeroImages();
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
