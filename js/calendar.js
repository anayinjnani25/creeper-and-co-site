// "Let's build something ___": a standing desk calendar. Pages turn on their own every couple of seconds,
// and scrolling turns them too:
// each step lifts the bottom corner first, curls the page up and over the rings, and the next word is
// underneath. The turning page is three hinged strips, each bending a little more than the one above.
const WORDS = ["innovative", "bold", "memorable", "beautiful", "timeless", "different", "loud", "iconic", "yours"];
const STRIPS = [.5, .3, .2]; // share of the page height, top to bottom

const page = n => {
  const i = ((n % WORDS.length) + WORDS.length) % WORDS.length, w = WORDS[i];
  return `<div class="cal-page"><span class="cal-no">No. ${String(i + 1).padStart(2, "0")}</span>`
    + `<span class="cal-word" style="--len:${w.length}">${w}<b>.</b></span>`
    + `<span class="cal-foot">Stydio · 2026</span></div>`;
};
const smooth = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);

export function mountCalendar(el) {
  if (!el) return;
  const pad = el.querySelector(".cal-pad"), under = el.querySelector(".cal-under"), turn = el.querySelector(".cal-turn");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // build the three strips of the turning page; each shows its slice of the same page
  const strips = STRIPS.map((h, k) => {
    const s = document.createElement("div");
    s.className = "cal-strip" + (k === STRIPS.length - 1 ? " last" : "");
    s.style.height = `${h * 100}%`;
    s.innerHTML = `<div class="sf"></div><div class="sb"></div>`;
    turn.append(s);
    return s;
  });
  const fit = () => { const h = pad.offsetHeight; let o = 0; strips.forEach((s, k) => { s.querySelector(".sf").style.setProperty("--ph", `${h}px`); s.style.setProperty("--off", `${o}px`); o += STRIPS[k] * h; }); };
  new ResizeObserver(fit).observe(pad); fit();

  let shown = -1;
  const setPages = i => {
    if (i === shown) return;
    shown = i;
    under.innerHTML = page(i + 1);
    strips.forEach(s => s.querySelector(".sf").innerHTML = page(i));
  };

  // p in [0,1]: how far the top page has turned
  const bend = p => {
    const h = pad.offsetHeight, lift = Math.sin(Math.PI * p);
    const a = [180 * smooth(p), 26 * lift, 34 * lift];          // the lower strips curl further than the top one
    let t = "";
    strips.forEach((s, k) => {
      t += (k ? ` translateY(${STRIPS[k - 1] * h}px)` : "") + ` rotateX(${a[k]}deg)`;
      s.style.transform = t.trim();
      s.style.setProperty("--lit", (lift * (.35 + k * .25)).toFixed(3));
    });
    under.style.setProperty("--shade", (lift * .9).toFixed(3));
    under.style.visibility = p > 0 ? "visible" : "hidden"; // only needed while a page is turning
    turn.style.setProperty("--fade", (1 - smooth((p - .82) / .18)).toFixed(3)); // gone once it is over the top
    turn.style.visibility = p >= .999 ? "hidden" : "visible";
  };

  // every STEP pixels of scrolling while the calendar is on screen turns one page (back again when scrolling up);
  // when the scrolling stops mid-turn, the page settles onto the nearest whole page
  const STEP = 260;
  let pos = 0, lastY = scrollY, settle = null, tween = 0;
  const draw = () => {
    const i = Math.floor(pos), f = smooth((pos - i - .15) / .7); // each page holds still, then turns
    if (reduced) { setPages(Math.round(pos)); bend(0); return; }
    setPages(i); bend(f);
  };
  const onScreen = () => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  addEventListener("scroll", () => {
    const dy = scrollY - lastY; lastY = scrollY;
    if (!onScreen()) return;
    cancelAnimationFrame(tween);
    pos += Math.max(-.6, Math.min(.6, dy / STEP)); // a sudden jump turns at most part of a page
    requestAnimationFrame(draw);
    clearTimeout(settle);
    settle = setTimeout(() => {
      const from = pos, to = Math.round(pos), t0 = performance.now();
      if (from === to) return;
      (function step(now) {
        const k = Math.min(1, (now - t0) / 380); pos = from + (to - from) * smooth(k); draw();
        if (k < 1) tween = requestAnimationFrame(step);
      })(t0);
    }, 160);
  }, { passive: true });
  // and on its own: while on screen, it turns a page every couple of seconds (paused while the visitor scrolls)
  const HOLD = 1500, TURN = 1100;
  let busyUntil = 0;
  addEventListener("scroll", () => busyUntil = performance.now() + 1200, { passive: true });
  const turnNext = () => {
    if (document.hidden || !onScreen() || performance.now() < busyUntil) return;
    cancelAnimationFrame(tween);
    const from = pos, to = Math.floor(pos + 1e-6) + 1, t0 = performance.now();
    if (reduced) { pos = to; draw(); return; }
    (function step(now) {
      const k = Math.min(1, (now - t0) / TURN); pos = from + (to - from) * k; draw(); // linear: draw() already eases the turn
      if (k < 1) tween = requestAnimationFrame(step);
    })(t0);
  };
  setInterval(turnNext, HOLD + TURN);
  el.calendarAt = p => { pos = p; draw(); }; // lets a test hold the calendar at any point of a turn
  draw();
}
