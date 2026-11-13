// The second half of the page stops moving in a straight line: each section arrives from its own direction,
// scrubbed with the scroll (css in index.html, "Entrances"). --e goes 0 → 1 as the section's top travels from
// the bottom of the screen to near the top; at 1 the section is flat and untouched.
const clamp = v => Math.min(1, Math.max(0, v));
const ease = t => t * t * (3 - 2 * t);   // soft start and soft landing

export function mountEntrances() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const els = [...document.querySelectorAll("[data-enter]")];
  if (!els.length) return;
  document.documentElement.classList.add("entrances");
  const update = () => {
    const vh = innerHeight;
    els.forEach(el => {
      const top = el.getBoundingClientRect().top;
      const span = Number(el.dataset.span) || .95;            // how much of the screen the entrance takes
      const e = ease(clamp((vh - top) / (vh * span)));
      el.style.setProperty("--e", e.toFixed(4));
      el.classList.toggle("entered", e >= .999);   // drop the transform entirely once it has landed
    });
  };
  let queued = false;
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; update(); }); } }, { passive: true });
  addEventListener("resize", update);
  update();
}
