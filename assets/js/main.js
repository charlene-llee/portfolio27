// ---------------------------------------------------------------------------
// Header: "Charlene Lee" → c·l·l (left of the bar), "• Contact" → Contact (right)
//
// Home page: both start in the hero (over .name-slot / .contact-slot) and scroll
// like normal content. Once one gets within LANDING_ZONE px of its spot in the bar,
// it keeps moving at page speed and then decelerates evenly to a stop in the bar,
// so there's no jump, no speed-up and no hard stop. While the logo lands:
//   - the C of "Charlene" slides into place as the c
//   - the L of "Lee" slides left to become the right-hand l
//   - every other letter fades out
//   - the middle l and the two dots fade in on their own
//   - at the very end, C and L hand over to the exact c·l·l logo shapes
// Other pages: everything is already in the bar.
// ---------------------------------------------------------------------------
(() => {
  const header = document.querySelector("[data-header]");
  if (!header) return;
  const inner = header.querySelector(".header-inner");
  const logo = header.querySelector("[data-logo]");
  const contact = header.querySelector("[data-contact]");
  const dot = contact.querySelector(".contact-dot");
  const svg = logo.querySelector("svg");
  const nameSlot = document.querySelector("[data-name-slot]");
  const contactSlot = document.querySelector("[data-contact-slot]");
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
  header.querySelectorAll("[data-nav]").forEach((a) => {
    if (a.dataset.nav === page) a.setAttribute("aria-current", "page");
  });

  const BASE_W = 350;
  const MARK_UNITS = 48, MARK_TOP = 5.6;   // c·l·l height / top inside the lettering's 350×54 box
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const range = (t, a, b) => clamp((t - a) / (b - a));

  let G;
  function measure() {
    const small = innerWidth <= 700;
    const zone = small ? 70 : 110;           // LANDING_ZONE: how close to the bar before anything changes
    const cs = getComputedStyle(inner);
    const ir = inner.getBoundingClientRect();
    const left = ir.left + parseFloat(cs.paddingLeft);
    const right = ir.right - parseFloat(cs.paddingRight);
    const rowMid = small ? 60 : header.offsetHeight / 2;   // phones: lower row of a two-row bar

    const markPx = small ? 19 : 21;          // c·l·l height in the bar (21px in Figma)
    const ls = markPx / MARK_UNITS;
    const cw = contact.offsetWidth, ch = contact.offsetHeight;

    G = {
      zone,
      logoEnd: { x: left, y: rowMid - markPx / 2 - MARK_TOP * ls, s: ls },
      contactEnd: { x: right - cw, y: rowMid - ch / 2, s: 1 },
    };
    if (nameSlot) {
      const r = nameSlot.getBoundingClientRect();
      G.logoStart = { docTop: r.top + scrollY, x: r.left, s: r.width / BASE_W };
    }
    if (contactSlot) {
      contactSlot.style.width = cw + "px";
      contactSlot.style.height = ch + "px";
      const r = contactSlot.getBoundingClientRect();
      G.contactStart = { docTop: r.top + scrollY, x: r.left, s: 1 };
    }
  }

  // Where an element is for the current scroll. p: 0 = in the hero, 1 = in the bar.
  // Inside the landing zone the distance left to travel is zone·(1−p)², which starts
  // at page speed and slows evenly to zero, so it glides in rather than snapping.
  function place(start, end) {
    if (!start) return { ...end, p: 1 };
    const top = start.docTop - scrollY;
    const z = G.zone;
    const into = (start.docTop - end.y - z) - scrollY;   // > 0: not in the zone yet
    if (into > 0) return { x: start.x, y: top, s: start.s, p: 0 };
    let p = clamp(-into / (2 * z));
    if (reduce) p = p > 0 ? 1 : 0;
    const e = smooth(p);
    return {
      x: lerp(start.x, end.x, e),
      y: end.y + z * (1 - p) * (1 - p),
      s: lerp(start.s, end.s, e),
      p,
    };
  }

  function render() {
    const L = place(G.logoStart, G.logoEnd);
    logo.style.transform = `translate(${L.x}px, ${L.y}px) scale(${L.s})`;

    const q = L.p;
    fades.forEach((el) => {
      el.style.opacity = 1 - range(q, 0.05, 0.45);
      el.style.transform = `scale(${1 - 0.4 * range(q, 0.05, 0.45)})`;
    });
    const slide = smooth(range(q, 0.1, 0.75));
    const handoff = range(q, 0.75, 0.95);
    keeps.forEach(({ el, dx }) => {
      el.style.transform = `translateX(${dx * slide}px)`;
      el.style.opacity = 1 - handoff;
    });
    markEnd.forEach((el) => (el.style.opacity = handoff));
    markMid.forEach((el) => (el.style.opacity = range(q, 0.4, 0.85)));
    logo.classList.toggle("is-docked", q >= 1);

    const C = place(G.contactStart, G.contactEnd);
    contact.style.transform = `translate(${C.x}px, ${C.y}px)`;
    dot.style.opacity = 1 - range(C.p, 0, 0.6);
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
// Doodle: hover draws out c · l · l (CSS does the drawing). On touch screens,
// where there's no hover, a tap toggles it.
// ---------------------------------------------------------------------------
(() => {
  const d = document.querySelector("[data-doodle]");
  if (!d || matchMedia("(hover: hover)").matches) return;
  d.addEventListener("click", () => d.classList.toggle("is-drawn"));
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
