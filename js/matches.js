// "Always begin from the end": a brick-red wall of half-open matchboxes, columns drifting in opposite
// directions, with one closed Creeper & Co. box in the middle. Click it: it pops up, the drawer slides
// out and inside it's a sticker collage with our social handles.
// The wall shows the illustrated boxes in assets/matches; the centre Creeper & Co. box is painted in labels.js.
// This file builds the wall, the
// glossy vinyl sticker collage inside the big drawer (stickers.js) and the open/close behaviour.
import { MAIN_LABEL, renderBox, renderSleeve } from "./labels.js";
const BOX_COUNT = 40; // illustrated boxes cut from the brief's two sheets: assets/matches/m01.webp … m40.webp
import { kinds, droplets } from "./stickers.js";
function canvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }

// ---------- inside the big drawer: glossy vinyl stickers on a red tray ----------
function collage() {
  const CW = 800, CH = 980;
  const [c, g] = canvas(CW, CH);
  const floor = g.createRadialGradient(CW * .35, CH * .3, 40, CW * .5, CH * .5, CH * .8);
  floor.addColorStop(0, "#4A2F72"); floor.addColorStop(.6, "#2A1A3D"); floor.addColorStop(1, "#140B20");
  g.fillStyle = floor; g.fillRect(0, 0, CW, CH);
  const K = kinds;
  const items = [ // [sticker, x, y, rotation]: placed in the gaps the social stickers leave
    [K.spiky({ r: 66, fill: "#8B6CFF" }), .88, .09, .3], [K.smiley({ r: 40 }), .1, .25, .1],
    [K.logo({ r: 44 }), .52, .48, -.2], [K.word("studio", { size: 50 }), .78, .58, -.08], [K.badge({ r: 46 }), .97, .45, .2],
    [K.flower({ r: 50 }), .13, .9, .2], [K.barcode("PRODUCE", { w: 220, h: 110 }), .24, 1.01, .2], [K.word("design", { size: 40 }), .74, .23, .1]
  ];
  items.forEach(([s, x, y, rot]) => { g.save(); g.translate(x * CW, y * CH); g.rotate(rot); g.drawImage(s, -s.width / 2, -s.height / 2); g.restore(); });
  droplets(g, 60, CW, CH);
  return c.toDataURL("image/png");
}

// the socials are stickers too (painted the same way), each one a link
const SOCIALS = [ // TODO: replace "#" with the real profile links
  { cls: "s-insta", name: "Instagram, @creeperandco", href: "#", paint: () => kinds.word("instagram", { size: 60, sub: "@creeperandco" }) },
  { cls: "s-behance", name: "Behance", href: "#", paint: () => kinds.spiky({ r: 84, fill: "#6A4BD1", text: "Bē", ink: "#EFC7A8", sub: "BEHANCE" }) },
  { cls: "s-linkedin", name: "LinkedIn", href: "#", paint: () => kinds.badge({ r: 74, fill: "#D9824E", text: "in", ink: "#0D0715", sub: "LINKEDIN" }) },
  { cls: "s-mail", name: "Email hello@creeperand.co", href: "mailto:hello@creeperand.co", paint: () => kinds.blob("say hi!", { fill: "#D9824E", size: 50, sub: "hello@creeperand.co", seed: 9 }) },
  { cls: "s-start", name: "Start a project", href: "#contact", paint: () => kinds.barcode("START A PROJECT", { w: 340, h: 160, top: "CREEPER & CO. · NO. 26" }) }
];

export function mountMatches() {
  const sec = document.getElementById("hello");
  if (!sec) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wall = sec.querySelector(".wall");

  // ---------- the wall ----------
  const boxes = Array.from({ length: BOX_COUNT }, (_, i) => `assets/matches/m${String(i + 1).padStart(2, "0")}.webp`);
  const COLS = 12, ROWS = 7;
  for (let col = 0; col < COLS; col++) {
    const column = document.createElement("div");
    column.className = "mcol" + (col % 2 ? " down" : "");
    column.style.animationDuration = (50 + (col % 3) * 10) + "s";
    const items = [];
    for (let r = 0; r < ROWS; r++) items.push(`<img class="mbx" alt="" decoding="async" src="${boxes[(col * 7 + r * 3) % boxes.length]}">`);
    column.innerHTML = items.join("") + items.join(""); // twice, so the loop is seamless
    wall.append(column);
  }
  if (reduced) wall.classList.add("still");

  // ---------- the centre box ----------
  const main = sec.querySelector(".mainbox");
  const stage = sec.querySelector(".mb-stage");
  main.querySelector(".box").src = renderBox(MAIN_LABEL, 0).url;
  stage.querySelector(".big-sleeve").style.backgroundImage = `url(${renderSleeve(MAIN_LABEL)})`;
  stage.querySelector(".big-drawer").style.backgroundImage = `url(${collage()})`;
  stage.querySelector(".stickers").innerHTML = SOCIALS.map((s, i) =>
    `<a class="stk ${s.cls}" href="${s.href}" aria-label="${s.name}" ${s.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""} style="--d:${.6 + i * .08}s"><img alt="" src="${s.paint().toDataURL("image/png")}"></a>`).join("");

  const open = () => {
    if (stage.classList.contains("on")) return;
    main.classList.add("pop");
    main.setAttribute("aria-expanded", "true");
    setTimeout(() => { stage.hidden = false; requestAnimationFrame(() => stage.classList.add("on")); sec.classList.add("opened"); }, reduced ? 0 : 380);
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
