// ---------------------------------------------------------------------------
// Header logo: "Charlene Lee" → c·l·l
// On the home page the logo starts as the big lettering in the hero (parked over
// .name-slot). As you scroll it rides up with the page, shrinks into the header,
// and morphs: the other letters fade, C + l + L slide together, two dots appear.
// Other pages show the finished c·l·l mark straight away.
// ---------------------------------------------------------------------------
(() => {
  const header = document.querySelector("[data-header]");
  if (!header) return;
  const logo = header.querySelector("[data-logo]");
  const svg = logo.querySelector("svg");
  const slot = document.querySelector("[data-name-slot]");
  const inner = header.querySelector(".header-inner");
  const keeps = [...svg.querySelectorAll(".keep")].map((el) => ({ el, dx: +el.dataset.to }));
  const fades = [...svg.querySelectorAll(".fade")];
  const dots = [...svg.querySelectorAll(".dot")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const BASE_W = 350, BASE_H = 54, MARK_H = 22;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const range = (t, a, b) => clamp((t - a) / (b - a));

  // mark the current page in the nav
  const page = document.body.dataset.page;
  header.querySelectorAll("[data-nav]").forEach((a) => {
    if (a.dataset.nav === page) a.setAttribute("aria-current", "page");
  });

  let geo;
  function measure() {
    const headerH = header.offsetHeight;
    const cs = getComputedStyle(inner);
    const x1 = inner.getBoundingClientRect().left + parseFloat(cs.paddingLeft);
    const y1 = (headerH - MARK_H) / 2;
    geo = { x1, y1, s1: MARK_H / BASE_H };
    if (slot) {
      const r = slot.getBoundingClientRect();
      geo.slotDocTop = r.top + scrollY;
      geo.x0 = r.left;
      geo.s0 = r.width / BASE_W;
    }
  }

  function render() {
    let p = 1, x = geo.x1, y = geo.y1, s = geo.s1;
    if (slot) {
      const travel = Math.max(1, geo.slotDocTop - geo.y1);
      p = reduce ? (scrollY > travel / 2 ? 1 : 0) : clamp(scrollY / travel);
      const e = ease(p);
      y = Math.max(geo.slotDocTop - scrollY, geo.y1);   // rides with the page, then docks
      x = lerp(geo.x0, geo.x1, e);
      s = lerp(geo.s0, geo.s1, e);
    }
    logo.style.transform = `translate(${x}px, ${y}px) scale(${s})`;

    // letter morph happens in the second half of the trip
    const m = ease(range(p, 0.3, 0.9));
    fades.forEach((el) => {
      el.style.opacity = String(1 - range(m, 0, 0.6));
      el.style.transform = `scale(${1 - 0.35 * m})`;
    });
    keeps.forEach(({ el, dx }) => { el.style.transform = `translateX(${dx * m}px)`; });
    const d = range(p, 0.75, 1);
    dots.forEach((el) => {
      el.style.opacity = String(d);
      el.style.transform = `scale(${0.3 + 0.7 * ease(d)})`;
    });

    header.classList.toggle("is-stuck", p >= 1);
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; render(); });
  };

  measure();
  render();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { measure(); render(); });
  // fonts can shift the hero after first paint
  document.fonts?.ready.then(() => { measure(); render(); });
})();

// Small progressive enhancements. Every page works without this file.

// Fade sections in as they scroll into view.
const revealables = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  revealables.forEach((el) => io.observe(el));
} else {
  revealables.forEach((el) => el.classList.add("is-in"));
}

// Archive: highlight the project currently on screen in the left index.
const indexLinks = [...document.querySelectorAll(".index a[href^='#']")];
if (indexLinks.length && "IntersectionObserver" in window) {
  const byId = new Map(indexLinks.map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        indexLinks.forEach((a) => a.classList.remove("is-active"));
        byId.get(e.target.id)?.classList.add("is-active");
      }
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );
  byId.forEach((_, id) => {
    const el = document.getElementById(id);
    if (el) spy.observe(el);
  });
}

// Studio pieces carousel.
document.querySelectorAll("[data-carousel]").forEach((root) => {
  const slides = [...root.querySelectorAll(".slide")];
  const prev = root.querySelector("[data-prev]");
  const next = root.querySelector("[data-next]");
  let i = 0;
  const show = (n) => {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, k) => s.classList.toggle("is-active", k === i));
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
  };
  prev.addEventListener("click", () => show(i - 1));
  next.addEventListener("click", () => show(i + 1));
  show(0);
});
