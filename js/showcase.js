// Selected work as a scroll-driven showcase. The stage pins and the scroll plays it like a film:
// a close-up drift across a mosaic of our work, a pull-back to the whole wall, then four chapters
// (logo, identity, packaging, websites) where one big piece rises through the middle while smaller
// pieces float past at their own speeds. Website pieces are links to the live sites.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

const SITES = {
  uor: ["https://anayinjnani25.github.io/under-one-roof/", "Under One Roof"],
  vq: ["https://anayinjnani25.github.io/velqura-site/", "Velqura"],
  yuga: ["https://anayinjnani25.github.io/yuga-lotus-locker/#/explore", "Yuga Lotus Locker"],
};
const SHOTS = {
  uor1: ["uor", "uor-1", "Under One Roof homepage"], uor3: ["uor", "uor-3", "Under One Roof collection"], uor5: ["uor", "uor-5", "Under One Roof footer"],
  vq: ["vq", "vq-home", "Velqura homepage"], vqabout: ["vq", "vq-about", "Velqura about page"], vqprod: ["vq", "vq-products", "Velqura products"],
  yuga: ["yuga", "yuga-explore", "Yuga Lotus Locker 3D cutaway"], yugahow: ["yuga", "yuga-how", "Yuga Lotus Locker puzzle"], yugas: ["yuga", "yuga-yugas", "Yuga Lotus Locker, the four yugas"],
};
const cap = t => `<span class="sc-cap">${t}</span>`;
// every piece of work, as a tile
const EV = "assets/work/elvaro/", VQ = "assets/work/velqura/";
const img = (src, alt) => `<img data-src="${src}" alt="${alt}">`;
const TILE = {
  // logos
  logoElvaro: () => `<div class="sc-tile k-logo k-elv">${img(EV + "logo-primary.svg", "Elvaro logo")}${cap("Logo · Elvaro")}</div>`,
  elvRoundel: () => `<div class="sc-tile k-logo k-elvteal">${img(EV + "roundel.svg", "Elvaro roundel")}${cap("Roundel · Elvaro")}</div>`,
  elvMono: () => `<div class="sc-tile k-logo k-elvteal k-mono">${img(EV + "monogram-teal.svg", "Elvaro monogram")}${cap("Monogram · Elvaro")}</div>`,
  logoVelqura: () => `<div class="sc-tile k-vq"><img src="assets/velqura-logo-white.svg" alt="Velqura logo">${cap("Logo · Velqura")}</div>`,
  vqSymbol: () => `<div class="sc-tile k-logo k-vqsym">${img(VQ + "symbol.svg", "Velqura symbol, a Q with a teal droplet")}${cap("Symbol · Velqura")}</div>`,
  // identity
  elvStationery: () => `<div class="sc-tile wide k-photo">${img(EV + "stationery.webp", "Elvaro letterhead, folder and business cards")}${cap("Stationery · Elvaro")}</div>`,
  elvBands: () => `<div class="sc-tile k-photo">${img(EV + "bands.webp", "Elvaro retro bands pattern")}${cap("Pattern · Elvaro")}</div>`,
  vqPrint: () => `<div class="sc-tile k-photo">${img(VQ + "print.webp", "Velqura product brochure and visiting card")}${cap("Print · Velqura")}</div>`,
  // packaging
  vqBuckets: () => `<div class="sc-tile wide k-photo">${img(VQ + "buckets.webp", "Velqura product buckets, each category in its own colour")}${cap("Product range · Velqura")}</div>`,
  vqCap: () => `<div class="sc-tile k-photo">${img(VQ + "cap.webp", "Velqura Ultrabond URP cap top")}${cap("Cap · Velqura")}</div>`,
  elvKit: () => `<div class="sc-tile wide k-photo">${img(EV + "kit.webp", "Elvaro material sample kit, swatch card and tote")}${cap("Sample kit · Elvaro")}</div>`,
  elvBox: () => `<div class="sc-tile k-photo">${img(EV + "box-lid.webp", "Elvaro sample kit box lid")}${cap("Box lid · Elvaro")}</div>`,
  elvSwatch: () => `<div class="sc-tile k-fit">${img(EV + "swatch-card.webp", "Elvaro material swatch card")}${cap("Swatch card · Elvaro")}</div>`,
  // websites
  web: k => { const [s, im, alt] = SHOTS[k], [href, name] = SITES[s];
    return `<a class="sc-tile wide k-web" href="${href}" target="_blank" rel="noopener"><img data-src="assets/work/${im}.webp" alt="${alt}"><span class="sc-visit">${name} <i>↗</i></span></a>`; },
  stat04: () => `<div class="sc-tile k-stat s-cop"><b>04</b><small>services, one studio</small></div>`,
  stat2: () => `<div class="sc-tile k-stat s-bone"><b>2</b><small>humans, design + code</small></div>`,
  statWorld: () => `<div class="sc-tile k-stat s-navy"><b>Remote</b><small>working worldwide</small></div>`,
  cta: () => `<div class="sc-tile k-cta"><small>Now booking · 2026</small><b>Your brand <em>next?</em></b><a class="pill magnetic" href="#contact">Start a project <span>→</span></a></div>`,
};
const tile = key => { const [k, arg] = key.split(":"); return TILE[k](arg); };

const ROWS = [
  ["vqSymbol", "web:uor1", "logoVelqura", "elvBox", "stat04", "vqCap"],
  ["logoElvaro", "elvStationery", "web:vq", "vqBuckets", "elvBands", "elvRoundel"],
  ["stat2", "web:yuga", "vqPrint", "elvSwatch", "elvKit", "statWorld"],
];
const BEATS = [
  { n: "01", cat: "Logo design", sub: "Elvaro and Velqura. Marks that hold up, from a favicon to a billboard.", hero: "logoElvaro", sats: ["logoVelqura", "elvRoundel", "vqSymbol"] },
  { n: "02", cat: "Brand identity", sub: "Stationery, print and patterns, so each brand looks like itself everywhere.", hero: "elvStationery", sats: ["vqPrint", "elvMono", "elvBands"] },
  { n: "03", cat: "Packaging design", sub: "Velqura's colour-coded product range and Elvaro's material sample kit.", hero: "vqBuckets", sats: ["elvKit", "vqCap", "elvBox"] },
  { n: "04", cat: "Website design", sub: "Under One Roof, Velqura and Yuga Lotus Locker. Tap one to visit.", hero: "web:uor1", sats: ["web:vq", "web:yuga"] },
  { n: "", cat: "", sub: "", hero: "cta", sats: ["stat04", "stat2", "statWorld"] },
];
// where the small pieces float, as [x in vw, y in vh when the chapter is centred, speed]; kept off the label in the bottom-left
const SAT = [[34, 24, 150], [-31, -24, 110], [27, -32, 200]];
// the timeline, in screens of scroll
const INTRO = .85, STEP = .55, LEN = .8, HOLD = .25;
const startOf = i => INTRO + i * STEP;
const END = startOf(BEATS.length - 1) + LEN * .5 + HOLD;

export function mountShowcase(root) {
  if (!root) return;
  const stage = root.querySelector(".sc-stage");
  stage.innerHTML = `<div class="sc-mosaic">${ROWS.map(r => `<div class="sc-row">${r.map(tile).join("")}</div>`).join("")}</div>
    <div class="sc-beats">${BEATS.map((b, i) => `<div class="sc-beat" data-i="${i}">
      ${b.cat ? `<div class="sc-label"><small>${b.n} / 04</small><b>${b.cat}</b><span>${b.sub}</span></div>` : ""}
      ${b.sats.map((s, j) => `<div class="sc-sat" data-j="${j}">${tile(s)}</div>`).join("")}
      <div class="sc-hero">${tile(b.hero)}</div></div>`).join("")}</div>`;
  const mosaic = stage.querySelector(".sc-mosaic"), beats = [...stage.querySelectorAll(".sc-beat")];
  const parts = beats.map(b => ({ el: b, hero: b.querySelector(".sc-hero"), label: b.querySelector(".sc-label"), sats: [...b.querySelectorAll(".sc-sat")] }));
  const fixed = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // images load once the section is near
  new IntersectionObserver(([e], io) => { if (!e.isIntersecting) return; io.disconnect();
    root.querySelectorAll("img[data-src]").forEach(i => { i.src = i.dataset.src; i.removeAttribute("data-src"); }); }, { rootMargin: "120% 0px" }).observe(root);


  if (fixed) { root.classList.add("sc-static"); return; }

  let W = 0, H = 0, fit = 1, A = [0, 0], B = [0, 0];
  const centre = el => [el.offsetLeft + el.offsetWidth / 2, el.offsetTop + el.offsetHeight / 2];   // tiles sit straight in the mosaic's box
  const size = () => {
    root.style.height = `${(END + 1) * innerHeight}px`;
    W = mosaic.offsetWidth; H = mosaic.offsetHeight;
    fit = Math.min(innerWidth * .94 / W, innerHeight * .84 / H);
    const tiles = mosaic.querySelectorAll(".sc-tile");
    A = centre(tiles[6]); B = centre(tiles[9]);   // the close-up drifts from the Elvaro logo to the Velqura product range
    frame();
  };
  const place = (s, cx, cy, o = 1) => {
    mosaic.style.transform = `translate3d(${(innerWidth / 2 - cx * s).toFixed(1)}px, ${(innerHeight / 2 - cy * s).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
    mosaic.style.opacity = o.toFixed(3);
    mosaic.style.visibility = o < .01 ? "hidden" : "";
  };
  const frame = () => {
    const vh = innerHeight, vw = innerWidth;
    const u = clamp(-root.getBoundingClientRect().top / vh, 0, END);
    // 1 · close-up drift, 2 · pull back to the whole wall, 3 · it fades as the first chapter rises
    const zoom = fit * 2.4, mid = [W / 2, H / 2];
    if (u < .3) { const t = ease(u / .3); place(zoom, lerp(A[0], B[0], t), lerp(A[1], B[1], t)); }
    else if (u < .58) { const t = ease((u - .3) / .28); place(lerp(zoom, fit, t), lerp(B[0], mid[0], t), lerp(B[1], mid[1], t)); }
    else { const t = clamp((u - .66) / .3); place(fit * (1 + t * .12), mid[0], mid[1], 1 - t); }
    // chapters
    parts.forEach((p, i) => {
      const last = i === parts.length - 1;
      let t = (u - startOf(i)) / LEN;
      if (last) t = Math.min(t, .5);
      const on = t > -.02 && t < 1.02;
      p.el.style.visibility = on ? "" : "hidden";
      if (!on) return;
      const y = t < .4 ? (1 - ease(clamp(t / .4))) * 78 : t < .6 ? -(t - .4) / .2 * 4 : -4 - ease((t - .6) / .4) * 84;
      p.hero.style.transform = `translate3d(-50%, calc(-50% + ${(y * vh / 100).toFixed(1)}px), 0)`;
      p.sats.forEach((s, j) => { const [x, y0, k] = SAT[j], narrow = vw < 760 ? .8 : 1;
        s.style.transform = `translate3d(calc(-50% + ${(x * narrow * vw / 100).toFixed(1)}px), calc(-50% + ${((y0 + (.5 - t) * k) * vh / 100).toFixed(1)}px), 0)`; });
      if (p.label) { const o = clamp((.3 - Math.abs(t - .5)) / .12); p.label.style.opacity = o.toFixed(3); p.label.style.transform = `translate3d(0, ${((1 - o) * 18).toFixed(1)}px, 0)`; p.label.style.visibility = o < .01 ? "hidden" : ""; }
    });
  };
  let queued = false;
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; frame(); }); } }, { passive: true });
  addEventListener("resize", size);
  document.fonts?.ready.then(size);
  size();
}
