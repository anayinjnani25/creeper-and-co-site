// Smooth, weighted scrolling (Lenis): the page glides and settles instead of jumping a notch per wheel tick.
// Lenis drives the real window scroll, so every scroll-driven section (hero, calendar, printer, reviews) keeps working.
// Off for reduced motion; touch devices keep their own native momentum.
import Lenis from "https://cdn.jsdelivr.net/npm/lenis@1.1.13/+esm";

export function mountSmoothScroll() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const lenis = new Lenis({
    lerp: 0.085,          // lower = heavier, longer glide
    wheelMultiplier: 0.9,
    smoothWheel: true
  });
  // in-page links (#work, #contact...) glide to their section instead of jumping
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const id = a.getAttribute("href"), el = id.length > 1 && document.querySelector(id);
    if (!el && id !== "#top") return;
    e.preventDefault();
    history.replaceState(null, "", id);
    if (window.scrollToSection && id.length > 1 && window.scrollToSection(id.slice(1))) return;   // sections inside the finale (js/finale.js)
    lenis.scrollTo(id === "#top" ? 0 : el, { duration: 1.4, easing: t => 1 - Math.pow(1 - t, 4) });
    history.replaceState(null, "", id);
  });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  // pause while a dialog is open so its own content scrolls
  document.addEventListener("toggle", () => document.querySelector("dialog[open]") ? lenis.stop() : lenis.start(), true);
  // stay still behind the loading screen (body.loading), then start
  const sync = () => document.body.classList.contains("loading") ? lenis.stop() : lenis.start();
  sync();
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  window.lenis = lenis;
  return lenis;
}
