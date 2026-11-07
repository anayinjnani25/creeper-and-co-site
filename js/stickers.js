// Glossy vinyl stickers, the kind slapped on fruit and laptops: a thick white die-cut edge, a semi-gloss
// shine, a few creases where it didn't sit flat, and a soft shadow. Each one is painted on its own canvas.
const BOLD = "'Archivo Black', 'Familjen Grotesk', sans-serif", MONO = "'Familjen Grotesk', system-ui, sans-serif";
const INK = "#141414";

function cv(w, h) { const c = document.createElement("canvas"); c.width = Math.ceil(w); c.height = Math.ceil(h); return [c, c.getContext("2d")]; }
function rnd(seed) { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
function rrect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function starPath(g, cx, cy, n, r1, r2, rot = -Math.PI / 2) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); }
function wobble(g, cx, cy, rx, ry, n, amt, seed) { // soft blob outline
  const r = rnd(seed), k = Array.from({ length: n }, () => 1 + (r() - .5) * amt);
  g.beginPath();
  for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2, f = k[Math.floor(i / 64 * n) % n] * .5 + k[Math.ceil(i / 64 * n) % n] * .5; g.lineTo(cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f); }
  g.closePath();
}
function scallop(g, cx, cy, r, n) { g.beginPath(); for (let i = 0; i <= 120; i++) { const a = i / 120 * Math.PI * 2, rr = r * (1 + .07 * Math.cos(a * n)); g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); }
function face(g, cx, cy, s, ink = INK) {
  g.fillStyle = ink; g.beginPath(); g.ellipse(cx - 9 * s, cy - 5 * s, 3 * s, 5 * s, 0, 0, 7); g.ellipse(cx + 9 * s, cy - 5 * s, 3 * s, 5 * s, 0, 0, 7); g.fill();
  g.strokeStyle = ink; g.lineWidth = 3 * s; g.lineCap = "round"; g.beginPath(); g.arc(cx, cy + 2 * s, 11 * s, .35, Math.PI - .35); g.stroke(); g.lineCap = "butt";
}

// Turn an artwork canvas into a finished sticker: white edge grown out of its alpha, shadow, shine, creases.
function finish(art, edge, seed) {
  const m = edge + 18, W = art.width + m * 2, H = art.height + m * 2;
  const [sil, s] = cv(W, H);
  for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; for (const k of [1, .55]) s.drawImage(art, m + Math.cos(a) * edge * k, m + Math.sin(a) * edge * k); }
  s.globalCompositeOperation = "source-in"; s.fillStyle = "#FFFFFF"; s.fillRect(0, 0, W, H);
  const [c, g] = cv(W, H), r = rnd(seed);
  g.save(); g.shadowColor = "rgba(10,4,20,.42)"; g.shadowBlur = 14; g.shadowOffsetX = 3; g.shadowOffsetY = 8; g.drawImage(sil, 0, 0); g.restore();
  g.drawImage(art, m, m);
  g.globalCompositeOperation = "source-atop";
  // semi-gloss: a broad diagonal sheen and a little shade towards the bottom edge
  const a = r() * .6 - .3, gl = g.createLinearGradient(W * (.1 + a), 0, W * (.6 + a), H);
  gl.addColorStop(0, "rgba(255,255,255,0)"); gl.addColorStop(.38, "rgba(255,255,255,.28)"); gl.addColorStop(.46, "rgba(255,255,255,.05)"); gl.addColorStop(1, "rgba(0,0,0,.10)");
  g.fillStyle = gl; g.fillRect(0, 0, W, H);
  // creases: a bright ridge with a dark line beside it
  for (let i = 0; i < 2; i++) {
    const x = W * (.2 + r() * .6), y = H * (.2 + r() * .6), dx = (r() - .5) * W * .5, dy = (r() - .5) * H * .5;
    g.lineWidth = 2; g.strokeStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + dx * .5 + 8, y + dy * .5 - 6, x + dx, y + dy); g.stroke();
    g.lineWidth = 1.5; g.strokeStyle = "rgba(0,0,0,.14)"; g.beginPath(); g.moveTo(x + 2, y + 2.5); g.quadraticCurveTo(x + dx * .5 + 10, y + dy * .5 - 3.5, x + dx + 2, y + dy + 2.5); g.stroke();
  }
  // a couple of tiny trapped air bubbles
  for (let i = 0; i < 3; i++) { const x = m + r() * art.width, y = m + r() * art.height; g.fillStyle = "rgba(255,255,255,.4)"; g.beginPath(); g.arc(x, y, 1.5 + r() * 2, 0, 7); g.fill(); }
  return c;
}

// ---------- the sticker kinds ----------
export const kinds = {
  // a word cut out letter by letter (thick black lowercase), optional small line under it
  word(str, { size = 64, ink = INK, sub = null, subInk = "#555" } = {}) {
    const [t, tg] = cv(10, 10); tg.font = `${size}px ${BOLD}`;
    const w = tg.measureText(str).width, h = size * (sub ? 1.5 : 1.12);
    const [a, g] = cv(w + 8, h);
    g.font = `${size}px ${BOLD}`; g.fillStyle = ink; g.textBaseline = "alphabetic"; g.fillText(str, 4, size * .86);
    if (sub) { g.font = `500 ${size * .2}px ${MONO}`; g.fillStyle = subInk; g.textAlign = "center"; g.fillText(sub, (w + 8) / 2, size * 1.3); }
    return finish(a, size * .16, str.length * 7);
  },
  // soft blob with a word on it
  blob(str, { fill = "#D9824E", ink = INK, size = 52, sub = null, seed = 3 } = {}) {
    const [t, tg] = cv(10, 10); tg.font = `${size}px ${BOLD}`; const tw = tg.measureText(str).width;
    const w = Math.max(tw, sub ? size * .27 * .82 * sub.length : 0) + size * 1.3, h = size * (sub ? 2.5 : 2.1);
    const [a, g] = cv(w, h);
    wobble(g, w / 2, h / 2, w / 2 - 2, h / 2 - 2, 9, .16, seed); g.fillStyle = fill; g.fill();
    g.font = `${size}px ${BOLD}`; g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(str, w / 2, h / 2 - (sub ? size * .22 : 0));
    if (sub) { g.font = `500 ${size * .27}px ${MONO}`; g.fillText(sub, w / 2, h / 2 + size * .52); }
    return finish(a, 12, seed);
  },
  // produce-style barcode label
  barcode(label, { w = 300, h = 150, top = null } = {}) {
    const [a, g] = cv(w, h);
    rrect(g, 1, 1, w - 2, h - 2, 14); g.fillStyle = "#FBFAF6"; g.fill(); g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 2; g.stroke();
    const r = rnd(label.length); let x = 26;
    const by = top ? 44 : 20, bh = h - by - 50;
    if (top) { g.font = `500 15px ${MONO}`; g.fillStyle = INK; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(top, 26, 26); }
    while (x < w - 26) { const bw = 1 + Math.floor(r() * 4); g.fillStyle = INK; g.fillRect(x, by, bw, bh); x += bw + 1 + Math.floor(r() * 4); }
    g.font = `${Math.min(26, w / label.length * 1.5)}px ${BOLD}`; g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, w / 2, h - 26);
    return finish(a, 9, label.length * 3);
  },
  // scalloped badge with a star (or a word) in the middle
  badge({ r = 80, fill = "#6A4BD1", starFill = "#EFC7A8", text = null, ink = "#EFC7A8", sub = null } = {}) {
    const [a, g] = cv(r * 2.2, r * 2.2), c = r * 1.1;
    scallop(g, c, c, r, 14); g.fillStyle = fill; g.fill();
    if (text) { g.font = `${r * .8}px ${BOLD}`; g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, c, c - (sub ? r * .12 : 0));
      if (sub) { g.font = `500 ${r * .14}px ${MONO}`; g.fillText(sub, c, c + r * .5); } }
    else { starPath(g, c, c, 5, r * .62, r * .27); g.fillStyle = starFill; g.fill(); }
    return finish(a, 11, r);
  },
  // sharp spiky burst
  spiky({ r = 80, fill = "#8B6CFF", text = null, ink = "#FFFFFF", sub = null } = {}) {
    const [a, g] = cv(r * 2.1, r * 2.1), c = r * 1.05, q = rnd(r);
    g.beginPath(); for (let i = 0; i < 18; i++) { const rr = i % 2 ? r * (.55 + q() * .1) : r * (.85 + q() * .15), ang = i / 18 * Math.PI * 2; g.lineTo(c + Math.cos(ang) * rr, c + Math.sin(ang) * rr); } g.closePath(); g.fillStyle = fill; g.fill();
    if (text) { g.font = `${r * .62}px ${BOLD}`; g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, c, c - (sub ? r * .1 : 0));
      if (sub) { g.font = `500 ${r * .13}px ${MONO}`; g.fillText(sub, c, c + r * .34); } }
    return finish(a, 10, r + 1);
  },
  // pink flower with a smile
  flower({ r = 70, fill = "#CDBEF5", core = "#F4F0FA" } = {}) {
    const [a, g] = cv(r * 2.2, r * 2.2), c = r * 1.1;
    g.fillStyle = fill; for (let i = 0; i < 6; i++) { const ang = i / 6 * Math.PI * 2; g.beginPath(); g.arc(c + Math.cos(ang) * r * .55, c + Math.sin(ang) * r * .55, r * .45, 0, 7); g.fill(); }
    g.fillStyle = core; g.beginPath(); g.arc(c, c, r * .5, 0, 7); g.fill(); face(g, c, c, r / 40);
    return finish(a, 10, r + 2);
  },
  // round smiley
  smiley({ r = 60, fill = "#EFC7A8" } = {}) {
    const [a, g] = cv(r * 2, r * 2); g.fillStyle = fill; g.beginPath(); g.arc(r, r, r - 1, 0, 7); g.fill(); face(g, r, r, r / 26);
    return finish(a, 10, r + 3);
  },
  // the C& mark on a dark disc
  logo({ r = 64 } = {}) {
    const [a, g] = cv(r * 2, r * 2); g.fillStyle = "#2A1A3D"; g.beginPath(); g.arc(r, r, r - 1, 0, 7); g.fill();
    g.save(); g.translate(r - 32 * r / 52, r - 32 * r / 52); g.scale(r / 52, r / 52);
    g.fillStyle = "#F4F0FA"; g.fill(new Path2D("M50.5 12.5C46 8.6 40.2 6.5 33.6 6.5 19 6.5 6.5 17.9 6.5 32.6S18.7 58.5 33.4 58.5c6.9 0 12.9-2.4 17.4-6.6l-3.4-5.2c-3.5 3-7.7 4.6-12.4 4.6-9.6 0-16-8.3-16-18.6S25.3 13.8 34.8 13.8c3.9 0 7.4 1.2 10.2 3.4l2.2 6.2h3.3z"));
    g.fillStyle = "#D9824E"; g.beginPath(); g.arc(50.6, 51, 3.1, 0, 7); g.fill(); g.font = "italic 25px Fraunces, Georgia, serif"; g.fillStyle = "#F4F0FA"; g.textAlign = "center"; g.fillText("&", 36, 44); g.restore();
    return finish(a, 10, r + 4);
  }
};

// water droplets beading on the vinyl, as on fresh fruit
export function droplets(g, n, w, h, seed = 11) {
  const r = rnd(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, s = 2 + r() * r() * 9;
    const d = g.createRadialGradient(x - s * .3, y - s * .3, s * .1, x, y, s);
    d.addColorStop(0, "rgba(255,255,255,.75)"); d.addColorStop(.35, "rgba(255,255,255,.12)"); d.addColorStop(.85, "rgba(0,0,0,.10)"); d.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = d; g.beginPath(); g.ellipse(x, y, s, s * .9, 0, 0, 7); g.fill();
  }
}
