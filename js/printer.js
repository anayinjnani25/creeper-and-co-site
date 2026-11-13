// How we work: the section pins and the scroll drives the printer. The page stands still while the strip
// feeds out of the mouth, Stage 01 first, each new ticket pushing the last one down. Scrolling back reels it in.
const clamp = v => Math.min(1, Math.max(0, v));
const ease = t => t * t * (3 - 2 * t);
const PEEK = 30;   // a little paper showing before the scroll starts, so it reads as a printer about to print

export function mountPrinter(root) {
  if (!root) return;
  const how = root.querySelector(".how"), copy = root.querySelector(".how-copy"), printer = root.querySelector(".printer");
  const strip = root.querySelector(".strip"), tickets = [...strip.children], legend = [...root.querySelectorAll(".how-legend li")];
  const mark = n => legend.forEach((li, i) => { li.classList.toggle("done", i < n); li.classList.toggle("now", i === n - 1); });
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return mark(tickets.length);

  const phone = matchMedia("(max-width: 860px)");
  let heights = [], ends = [], total = 0, lastY = -1, idle = 0;
  const measure = () => {
    heights = tickets.map(t => t.offsetHeight);
    let sum = 0; ends = heights.map(h => (sum += h)); total = sum;
  };
  // how far through the pinned stretch we are, 0 to 1
  const progress = () => {
    const y = scrollY;
    if (phone.matches) {   // on phones only the printer pins, below the copy
      const top = parseFloat(getComputedStyle(printer).top) || 0;
      const start = copy.getBoundingClientRect().bottom + y + 48 - top;
      const end = how.getBoundingClientRect().bottom + y - printer.offsetHeight - top;
      return clamp((y - start) / (end - start));
    }
    const r = root.getBoundingClientRect();
    return clamp(-r.top / (r.height - innerHeight));
  };
  // each ticket feeds out and comes to rest for a moment, like a receipt printer
  const feedAt = p => {
    const n = tickets.length, s = clamp((p - .03) / .94) * n, i = Math.min(n - 1, Math.floor(s));
    return (ends[i] - heights[i]) + heights[i] * ease(clamp((s - i) / .86));
  };
  const frame = () => {
    const y = Math.max(PEEK, feedAt(progress()));
    if (Math.abs(y - lastY) < .1) return;
    strip.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    if (lastY >= 0) {
      printer.classList.add("printing");
      clearTimeout(idle); idle = setTimeout(() => printer.classList.remove("printing"), 160);
    }
    lastY = y;
    mark(ends.filter((e, i) => y >= e - heights[i] * .45).length);
  };
  const remeasure = () => { measure(); lastY = -1; frame(); printer.classList.remove("printing"); };

  let queued = false;
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; frame(); }); } }, { passive: true });
  addEventListener("resize", remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);   // ticket heights change once the fonts land
  remeasure();
}
