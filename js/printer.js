// How we work: when the printer scrolls into view it prints the four stages one ticket at a time,
// pausing between each like a receipt printer, and ticks them off in the list beside it.
export function mountPrinter(root) {
  if (!root) return;
  const printer = root.querySelector(".printer"), feed = root.querySelector(".feed"), strip = root.querySelector(".strip");
  const tickets = [...strip.children], legend = [...root.querySelectorAll(".how-legend li")];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const show = n => {
    // the paper slides out of the mouth down to the end of ticket n (the page grows with it)
    const to = tickets.slice(0, n).reduce((s, t) => s + t.offsetHeight, 0), from = feed.offsetHeight;
    feed.style.height = `${to}px`;
    if (!reduced && from !== to) feed.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 900, easing: "cubic-bezier(.45,.05,.3,1)" });
    legend.forEach((li, i) => { li.classList.toggle("done", i < n); li.classList.toggle("now", i === n - 1); });
  };
  show(0);
  addEventListener("resize", () => show(printed));
  let printed = 0, started = false;
  const run = () => {
    if (reduced) { printed = tickets.length; return show(printed); }
    printer.classList.add("printing");
    const next = () => {
      show(++printed);
      if (printed < tickets.length) setTimeout(next, 1300);
      else setTimeout(() => printer.classList.remove("printing"), 900);
    };
    setTimeout(next, 300);
  };
  new IntersectionObserver(([e], io) => {
    if (e.isIntersecting && !started) { started = true; io.disconnect(); run(); }
  }, { threshold: .35 }).observe(printer);
}
