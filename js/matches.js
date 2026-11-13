// "Always begin from the end": a brick-red wall of half-open matchboxes, columns drifting in opposite
// directions, with one closed Stydio box in the middle. Click it: it pops up, the drawer slides
// out and inside it's a sticker collage with our social handles.
// Every box on the wall is painted on canvas from our own label designs (matchbox-art.js); the centre
// Stydio box uses the same box renderer with its label from labels.js.
// This file builds the wall, the
// glossy vinyl sticker collage inside the big drawer (stickers.js) and the open/close behaviour.
import { MAIN_LABEL, renderSleeve } from "./labels.js";
import { LABELS, renderWallBox } from "./matchbox-art.js";
import { kinds, droplets } from "./stickers.js";
function canvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }

// ---------- inside the big drawer: glossy vinyl stickers on a red tray ----------
function collage() {
  const CW = 800, CH = 980;
  const [c, g] = canvas(CW, CH);
  const floor = g.createRadialGradient(CW * .35, CH * .3, 40, CW * .5, CH * .5, CH * .8);
  floor.addColorStop(0, "#3A4088"); floor.addColorStop(.6, "#232966"); floor.addColorStop(1, "#140B20");
  g.fillStyle = floor; g.fillRect(0, 0, CW, CH);
  const K = kinds;
  const items = [ // [sticker, x, y, rotation]: placed in the gaps the social stickers leave
    [K.spiky({ r: 66, fill: "#C46A38" }), .88, .09, .3], [K.smiley({ r: 40 }), .1, .25, .1],
    [K.logo({ r: 44 }), .52, .48, -.2], [K.word("studio", { size: 50 }), .78, .58, -.08], [K.badge({ r: 46 }), .97, .45, .2],
    [K.flower({ r: 50 }), .13, .9, .2], [K.barcode("PRODUCE", { w: 220, h: 110 }), .24, 1.01, .2], [K.word("design", { size: 40 }), .74, .23, .1]
  ];
  items.forEach(([s, x, y, rot]) => { g.save(); g.translate(x * CW, y * CH); g.rotate(rot); g.drawImage(s, -s.width / 2, -s.height / 2); g.restore(); });
  droplets(g, 60, CW, CH);
  return c.toDataURL("image/png");
}

// the socials are stickers too (painted the same way), each one a link
const SOCIALS = [ // TODO: replace "#" with the real profile links
  { cls: "s-insta", name: "Instagram, @stydio.studio", href: "#", paint: () => kinds.word("instagram", { size: 60, sub: "@stydio.studio" }) },
  { cls: "s-behance", name: "Behance", href: "#", paint: () => kinds.spiky({ r: 84, fill: "#C0622E", text: "Bē", ink: "#EBE1D5", sub: "BEHANCE" }) },
  { cls: "s-linkedin", name: "LinkedIn", href: "#", paint: () => kinds.badge({ r: 74, fill: "#D9824E", text: "in", ink: "#151946", sub: "LINKEDIN" }) },
  { cls: "s-mail", name: "Email support.stydio@gmail.com", href: "mailto:support.stydio@gmail.com", paint: () => kinds.blob("say hi!", { fill: "#D9824E", size: 50, sub: "support.stydio@gmail.com", seed: 9 }) },
  { cls: "s-start", name: "Start a project", href: "#contact", paint: () => kinds.barcode("START A PROJECT", { w: 340, h: 160, top: "STYDIO · NO. 26" }) }
];

export function mountMatches() {
  const sec = document.getElementById("hello");
  if (!sec) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wall = sec.querySelector(".wall");

  // ---------- the wall ----------
  // each label once, its tray pushed up by a different amount
  const boxes = LABELS.map((def, i) => renderWallBox(def, 40 + (i * 37) % 64).url);
  // Size the wall to the biggest screen it may be shown on (the wall is tilted 18°, so it has to cover the
  // rotated screen), and repeat each column three times so its drift never runs out of boxes.
  const W = Math.max(innerWidth, screen.width || 0, 1440), H = Math.max(innerHeight, screen.height || 0, 900);
  const sin = Math.sin(18 * Math.PI / 180), cos = Math.cos(18 * Math.PI / 180);
  const COLS = Math.ceil((W * cos + H * sin) * 1.1 / 184) + 2;
  const ROWS = Math.max(8, Math.ceil((W * sin + H * cos) * 1.1 / 228) + 1);   // a box is ~210px tall at 158px wide
  for (let col = 0; col < COLS; col++) {
    const column = document.createElement("div");
    column.className = "mcol" + (col % 2 ? " down" : "");
    column.style.animationDuration = (50 + (col % 3) * 10) + "s";
    const items = [];
    for (let r = 0; r < ROWS; r++) items.push(`<img class="mbx" alt="" decoding="async" src="${boxes[(col * 7 + r * 5) % boxes.length]}">`);
    column.innerHTML = items.join("").repeat(3); // three copies: the screen always sits inside the middle stretch
    wall.append(column);
  }
  if (reduced) wall.classList.add("still");

  // ---------- the centre box ----------
  const main = sec.querySelector(".mainbox");
  const stage = sec.querySelector(".mb-stage");
  main.querySelector(".box").src = renderWallBox(MAIN_LABEL, 0).url;
  stage.querySelector(".big-sleeve").style.backgroundImage = `url(${renderSleeve(MAIN_LABEL)})`;
  stage.querySelector(".big-drawer").style.backgroundImage = `url(${collage()})`;
  stage.querySelector(".stickers").innerHTML = SOCIALS.map((s, i) =>
    `<a class="stk ${s.cls}" href="${s.href}" aria-label="${s.name}" ${s.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""} style="--d:${.6 + i * .08}s"><img alt="" src="${s.paint().toDataURL("image/png")}"></a>`).join("");

  const open = () => {
    if (stage.classList.contains("on")) return;
    main.classList.add("pop");
    main.setAttribute("aria-expanded", "true");
    setTimeout(() => { stage.hidden = false; requestAnimationFrame(() => stage.classList.add("on")); sec.classList.add("opened"); if (window.lenis) window.lenis.scrollTo(sec, { duration: 1.1 }); else sec.scrollIntoView({ block: "start", behavior: "smooth" }); }, reduced ? 0 : 380);
  };
  const close = () => {
    stage.classList.remove("on");
    sec.classList.remove("opened");
    main.setAttribute("aria-expanded", "false");
    setTimeout(() => { stage.hidden = true; main.classList.remove("pop"); main.focus({ preventScroll: true }); }, reduced ? 0 : 650);
  };
  main.addEventListener("click", open);
  stage.querySelector(".mb-close").addEventListener("click", close);
  stage.addEventListener("click", e => { if (e.target === stage) close(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && stage.classList.contains("on")) close(); });
  stage.querySelector(".s-start").addEventListener("click", close);
}
