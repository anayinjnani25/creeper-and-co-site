// The second half of the page changes direction (css/finale.css):
//   0.00–0.30  Reviews turns away like a cube face and Contact swings round from the right
//   0.30–0.66  Contact holds still, flat and crisp, for the form
//   0.66–0.96  the matchbox wall slides in from the right and pushes Contact back
// plus a small arrow in the corner that shows which way the page is moving.
const clamp = v => Math.min(1, Math.max(0, v));
const smooth = t => t * t * (3 - 2 * t);
const AT = { reviews: 0, contact: .48, hello: 1 };   // where each section sits inside the finale's scroll

export function mountFinale() {
  const root = document.getElementById("finale");
  if (!root) return;
  const stage = root.querySelector(".fin-stage"), box = root.querySelector(".fin-box");
  const a = root.querySelector(".fin-a"), b = root.querySelector(".fin-b"), c = root.querySelector(".fin-c");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fits = () => !reduced && innerWidth > 860 && innerHeight >= 600;
  let on = false, p = 0;

  const progress = () => { const r = root.getBoundingClientRect(); return clamp(-r.top / (r.height - innerHeight || 1)); };
  const update = () => {
    if (!on) return;
    p = progress();
    const t = smooth(clamp((p - .02) / .28)), k = smooth(clamp((p - .66) / .3));
    box.style.setProperty("--ry", `${(-90 * t).toFixed(2)}deg`);
    a.style.setProperty("--shade", (t * .6).toFixed(3));
    b.style.setProperty("--shade", (t < 1 ? (1 - t) * .6 : 0).toFixed(3));
    stage.classList.toggle("flat", t >= .999);
    stage.style.setProperty("--k", k.toFixed(4));
    c.style.setProperty("--k", k.toFixed(4));
    c.classList.toggle("parked", k <= 0);
  };
  const toggle = () => {
    const want = fits();
    if (want === on) return update();
    on = want;
    document.documentElement.classList.toggle("finale-on", on);
    [box, a, b, c, stage].forEach(el => el.removeAttribute("style"));
    stage.classList.remove("flat"); c.classList.remove("parked");
    update();
  };

  // Links and code that jump to #reviews, #contact or #hello land at the right moment inside the finale
  window.scrollToSection = (id, opts = {}) => {
    const el = document.getElementById(id);
    if (!el) return false;
    let y;
    if (on && id in AT) { const top = root.getBoundingClientRect().top + scrollY; y = top + AT[id] * (root.offsetHeight - innerHeight); }
    else y = el.getBoundingClientRect().top + scrollY;
    if (window.lenis && !opts.immediate) window.lenis.scrollTo(y, { duration: 1.4, easing: t => 1 - Math.pow(1 - t, 4) });
    else if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true });
    else scrollTo(0, y);
    return true;
  };

  let queued = false;
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; update(); arrow(); }); } }, { passive: true });
  addEventListener("resize", () => { toggle(); arrow(); });
  toggle();

  // arriving from another page with #contact or #hello in the address
  const hash = location.hash.slice(1);
  if (on && hash in AT && hash !== "reviews") setTimeout(() => window.scrollToSection(hash, { immediate: true }), 60);

  // ---------- direction arrow ----------
  const dir = document.createElement("div");
  dir.className = "dir-arrow"; dir.setAttribute("aria-hidden", "true");
  dir.innerHTML = "<span>↓</span>";
  document.body.append(dir);
  const glyph = dir.firstChild;
  let last = "";
  function arrow() {
    let d = "down";
    const mid = innerHeight / 2;
    if (on) { const r = root.getBoundingClientRect(); if (r.top <= 0 && r.bottom >= mid) { if (p > .02 && p < .3) d = "turn"; else if (p > .66 && p < .96) d = "left"; } }
    if (d === last) return;
    last = d;
    glyph.textContent = d === "turn" ? "⟲" : "↓";
    glyph.style.transform = d === "right" ? "rotate(-90deg)" : d === "left" ? "rotate(90deg)" : "none";
  }
  arrow();
}
