// ---------------------------------------------------------------------------
// Header: "Charlene Lee" → c·l·l, and the hero nav → top nav bar
//
// Home page: the logo starts as the big lettering (over .name-slot) and the nav
// starts in the hero (over .nav-slot). Both scroll up with the page like normal
// content. Only when each one gets close to the top does it shrink and dock
// into the bar. While the logo docks:
//   - the C of "Charlene" slides into place as the c
//   - the L of "Lee" slides left to become the right-hand l
//   - every other letter fades out
//   - the middle l and the two dots fade in on their own
//   - at the very end, C and L hand over to the exact c·l·l logo shapes
// Other pages: everything is docked from the start.
// ---------------------------------------------------------------------------
(() => {
  const header = document.querySelector("[data-header]");
  if (!header) return;
  const inner = header.querySelector(".header-inner");
  const logo = header.querySelector("[data-logo]");
  const nav = header.querySelector("[data-nav-bar]");
  const svg = logo.querySelector("svg");
  const nameSlot = document.querySelector("[data-name-slot]");
  const navSlot = document.querySelector("[data-nav-slot]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const keeps = [...svg.querySelectorAll(".word .keep")].map((el) => ({ el, dx: +el.dataset.to }));
  const fades = [...svg.querySelectorAll(".word .fade")];
  const markEnd = [...svg.querySelectorAll(".mark .end")];
  const markMid = [...svg.querySelectorAll(".mark .mid")];

  // invisible boxes so each letter is easy to hover, not just its ink
  svg.querySelectorAll(".ltr").forEach((g) => {
    const b = g.getBBox();
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    Object.entries({ x: b.x, y: b.y, width: b.width, height: b.height, class: "hit" })
      .forEach(([k, v]) => r.setAttribute(k, v));
    g.prepend(r);
  });

  // mark the current page in the nav
  const page = document.body.dataset.page;
  nav.querySelectorAll("[data-nav]").forEach((a) => {
    if (a.dataset.nav === page) a.setAttribute("aria-current", "page");
  });

  const BASE_W = 350, BASE_H = 54;
  const LOGO_ZONE = 90;   // px from the top where the logo starts to shrink/morph
  const NAV_ZONE = 70;    // same for the nav
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t);
  const range = (t, a, b) => clamp((t - a) / (b - a));

  let G;
  function measure() {
    const H = header.offsetHeight;
    const cs = getComputedStyle(inner);
    const ir = inner.getBoundingClientRect();
    const left = ir.left + parseFloat(cs.paddingLeft);
    const right = ir.right - parseFloat(cs.paddingRight);
    const small = innerWidth < 600;

    const markPx = small ? 20 : 24;                    // docked c·l·l height
    const ls1 = markPx / 48;                            // mark is ~48 svg units tall
    const navS1 = small ? 0.8125 : 0.875;               // docked nav: 13px / 14px
    const navW = nav.offsetWidth, navH = nav.offsetHeight;

    G = {
      logoEnd: { x: left, y: (H - BASE_H * ls1) / 2, s: ls1 },
      navEnd: { x: right - navW * navS1, y: (H - navH * navS1) / 2, s: navS1 },
    };
    if (nameSlot) {
      const r = nameSlot.getBoundingClientRect();
      G.logoStart = { docTop: r.top + scrollY, x: r.left, s: r.width / BASE_W };
    }
    if (navSlot) {
      navSlot.style.width = navW + "px";
      navSlot.style.height = navH + "px";
      const r = navSlot.getBoundingClientRect();
      G.navStart = { docTop: r.top + scrollY, x: r.left, s: 1 };
    }
  }

  // where an element is: riding with the page, then easing into its docked spot
  function place(start, end, zone) {
    if (!start) return { ...end, q: 1 };
    const top = start.docTop - scrollY;
    let q = clamp(1 - (top - end.y) / zone);
    if (reduce) q = q >= 1 ? 1 : 0;
    const e = ease(q);
    return { x: lerp(start.x, end.x, e), y: Math.max(top, end.y), s: lerp(start.s, end.s, e), q };
  }

  function render() {
    const L = place(G.logoStart, G.logoEnd, LOGO_ZONE);
    logo.style.transform = `translate(${L.x}px, ${L.y}px) scale(${L.s})`;

    const q = L.q;
    fades.forEach((el) => {
      el.style.opacity = 1 - range(q, 0.05, 0.5);
      el.style.transform = `scale(${1 - 0.4 * range(q, 0.05, 0.5)})`;
    });
    const slide = ease(range(q, 0.1, 0.8));
    const handoff = range(q, 0.8, 1);
    keeps.forEach(({ el, dx }) => {
      el.style.transform = `translateX(${dx * slide}px)`;
      el.style.opacity = 1 - handoff;
    });
    markEnd.forEach((el) => (el.style.opacity = handoff));
    markMid.forEach((el) => (el.style.opacity = range(q, 0.45, 0.9)));
    logo.classList.toggle("is-docked", q >= 1);

    const N = place(G.navStart, G.navEnd, NAV_ZONE);
    nav.style.transform = `translate(${N.x}px, ${N.y}px) scale(${N.s})`;

    header.style.setProperty("--bar", range(q, 0.6, 1));
  }

  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; render(); });
  }, { passive: true });
  const refresh = () => { measure(); render(); };
  addEventListener("resize", refresh);
  refresh();
  document.fonts?.ready.then(refresh);   // fonts can shift the hero after first paint
})();

// ---------------------------------------------------------------------------
// Typing tagline: types each line in data-phrases, pauses, deletes, repeats.
// ---------------------------------------------------------------------------
(() => {
  const el = document.querySelector("[data-typer]");
  if (!el) return;
  const out = el.querySelector(".typed");
  const phrases = el.dataset.phrases.split("|");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const TYPE = 55, DELETE = 28, HOLD = 1800, GAP = 350;

  (async () => {
    let i = 0;
    out.textContent = phrases[0];
    while (true) {
      await wait(HOLD);
      const next = phrases[(i + 1) % phrases.length];
      if (reduce) { out.textContent = next; i++; continue; }
      el.classList.add("is-typing");
      for (let t = out.textContent; t.length; t = t.slice(0, -1)) {
        out.textContent = t;
        await wait(DELETE);
      }
      out.textContent = "";
      await wait(GAP);
      for (let k = 1; k <= next.length; k++) {
        out.textContent = next.slice(0, k);
        await wait(TYPE);
      }
      el.classList.remove("is-typing");
      i++;
    }
  })();
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
