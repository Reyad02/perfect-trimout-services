document.getElementById("year").textContent = new Date().getFullYear();

const header = document.getElementById("site-header");
const navLinks = document.getElementById("nav-links");
const menuButton = document.getElementById("menu-button");
const sections = [...document.querySelectorAll("main section[id]")];
const links = [...document.querySelectorAll(".nav-link")];

menuButton.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

links.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) =>
        link.classList.toggle(
          "active",
          link.dataset.section === entry.target.id,
        ),
      );
    });
  },
  { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
);

sections.forEach((section) => sectionObserver.observe(section));

const updateHeaderState = () =>
  header.classList.toggle("scrolled", window.scrollY > 24);
window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

// Hero image slideshow

const heroSlides = document.querySelectorAll(".hero-slide");
let currentSlide = 0;

function loadHeroSlide(index) {
  const slide = heroSlides[index];

  if (slide.dataset.src && !slide.src) {
    slide.src = slide.dataset.src;
  }

  return slide;
}

if (heroSlides.length > 1) {
  // Load the first upcoming image in advance.
  loadHeroSlide(1);

  setInterval(() => {
    heroSlides[currentSlide].classList.remove("active");

    currentSlide = (currentSlide + 1) % heroSlides.length;

    const nextSlide = loadHeroSlide(currentSlide);

    nextSlide.classList.add("active");

    // Load the following image while this one is displayed.
    const followingSlide = (currentSlide + 1) % heroSlides.length;
    loadHeroSlide(followingSlide);
  }, 4000);
}

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 },
);

document
  .querySelectorAll(".reveal")
  .forEach((element) => revealObserver.observe(element));

// ---------------------------------------------------------------------------
// Project form → FormSubmit.co (works on localhost, file://, and deployed)
// ---------------------------------------------------------------------------

const form = document.getElementById("project-form");
const status = document.getElementById("form-status");
const isSpanish = document.documentElement.lang === "es";

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const data = new FormData(form);

  submitButton.disabled = true;
  status.classList.remove("hidden");
  status.textContent = isSpanish
    ? "Enviando tu solicitud..."
    : "Sending your project request...";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data,
    });

    const result = await response.json().catch(() => ({}));

    // FormSubmit returns { success: "true" | "false", message: "..." }
    if (!response.ok || result.success === "false") {
      throw new Error(
        result.message || `Form submission failed with status ${response.status}`,
      );
    }

    status.textContent = isSpanish
      ? "Gracias. Tu solicitud fue enviada al equipo de proyectos de PTS."
      : "Thank you. Your request was sent to the PTS project team.";
    form.reset();
  } catch (error) {
    console.error(error);
    status.textContent = isSpanish
      ? "No se pudo enviar la solicitud. Inténtalo de nuevo o llama al equipo de PTS."
      : "We could not send your request. Please try again or call the PTS team.";
  } finally {
    submitButton.disabled = false;
  }
});