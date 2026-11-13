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
  badge({ r = 80, fill = "#C0622E", starFill = "#EBE1D5", text = null, ink = "#EBE1D5", sub = null } = {}) {
    const [a, g] = cv(r * 2.2, r * 2.2), c = r * 1.1;
    scallop(g, c, c, r, 14); g.fillStyle = fill; g.fill();
    if (text) { g.font = `${r * .8}px ${BOLD}`; g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, c, c - (sub ? r * .12 : 0));
      if (sub) { g.font = `500 ${r * .14}px ${MONO}`; g.fillText(sub, c, c + r * .5); } }
    else { starPath(g, c, c, 5, r * .62, r * .27); g.fillStyle = starFill; g.fill(); }
    return finish(a, 11, r);
  },
  // sharp spiky burst
  spiky({ r = 80, fill = "#C46A38", text = null, ink = "#FFFFFF", sub = null } = {}) {
    const [a, g] = cv(r * 2.1, r * 2.1), c = r * 1.05, q = rnd(r);
    g.beginPath(); for (let i = 0; i < 18; i++) { const rr = i % 2 ? r * (.55 + q() * .1) : r * (.85 + q() * .15), ang = i / 18 * Math.PI * 2; g.lineTo(c + Math.cos(ang) * rr, c + Math.sin(ang) * rr); } g.closePath(); g.fillStyle = fill; g.fill();
    if (text) { g.font = `${r * .62}px ${BOLD}`; g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, c, c - (sub ? r * .1 : 0));
      if (sub) { g.font = `500 ${r * .13}px ${MONO}`; g.fillText(sub, c, c + r * .34); } }
    return finish(a, 10, r + 1);
  },
  // pink flower with a smile
  flower({ r = 70, fill = "#D8C7BA", core = "#EBE1D5" } = {}) {
    const [a, g] = cv(r * 2.2, r * 2.2), c = r * 1.1;
    g.fillStyle = fill; for (let i = 0; i < 6; i++) { const ang = i / 6 * Math.PI * 2; g.beginPath(); g.arc(c + Math.cos(ang) * r * .55, c + Math.sin(ang) * r * .55, r * .45, 0, 7); g.fill(); }
    g.fillStyle = core; g.beginPath(); g.arc(c, c, r * .5, 0, 7); g.fill(); face(g, c, c, r / 40);
    return finish(a, 10, r + 2);
  },
  // round smiley
  smiley({ r = 60, fill = "#EBE1D5" } = {}) {
    const [a, g] = cv(r * 2, r * 2); g.fillStyle = fill; g.beginPath(); g.arc(r, r, r - 1, 0, 7); g.fill(); face(g, r, r, r / 26);
    return finish(a, 10, r + 3);
  },
  // the face-to-face mark on a dark disc
  logo({ r = 64 } = {}) {
    const [a, g] = cv(r * 2, r * 2); g.fillStyle = "#232966"; g.beginPath(); g.arc(r, r, r - 1, 0, 7); g.fill();
    const k = r * 1.34 / 392; g.save(); g.translate(r - 196 * k, r - 148 * k); g.scale(k, k); g.fillStyle = "#EBE1D5"; g.fill(new Path2D("M162.6,288.1c-31.2,0 -58.6,-5.8 -82.1,-17.5c-23.5,-11.6 -41.8,-28 -54.9,-49.1c-13.1,-21.1 -19.6,-45.7 -19.6,-73.8c0,-28.3 6.5,-52.9 19.6,-73.8c13.1,-20.9 31.6,-37.1 55.6,-48.6c24,-11.5 52.4,-17.3 85.3,-17.3c7.9,0 14.5,0.3 19.8,0.9c5.3,0.6 10.2,1.3 14.8,2c4.6,0.7 9.8,1.4 15.7,2c5.9,0.6 13.3,0.9 22.1,0.9l7.2,48c0,0.1 0,0.1 0,0.2c-0.1,0.6 -0.1,1.2 -0.1,1.9c0,0.6 0.1,1.1 0.1,1.6c0.1,1.3 0.3,2.6 0.7,3.7c0.2,0.6 0.4,1.3 0.7,1.9l2.2,14.7h-3.6c-2.6,-14.2 -7.9,-26.7 -15.7,-37.6c-7.8,-10.9 -17.5,-19.6 -29.2,-25.9c-11.6,-6.4 -24.5,-9.5 -38.7,-9.5c-13.9,0 -26.8,3.4 -38.5,10.1c-11.8,6.7 -21.8,16.1 -30.2,28.1c-8.4,12.2 -14.9,26.8 -19.6,43.7c-4.7,16.9 -7,35.5 -7,55.6c0,26.6 4.1,49.9 12.2,69.7c8.2,19.8 19.7,35.2 34.6,46.1c8.6,6.3 18.2,10.8 28.6,13.5l0.4,3c0,0 0.1,0 0.1,0l0.1,0.8c0.1,0 0.2,0 0.3,0l0.1,0.8c0.2,0 0.3,0 0.5,0l0.1,0.7c0.2,0 0.4,0 0.6,0l0.1,0.6c0.2,0 0.5,0 0.7,0l0.1,0.4c0.3,0 0.5,0 0.8,0l0,0.3c0.3,0 0.6,0 0.9,0l0,0.1c9.2,0 17.5,0.4 24.9,1.1c1.4,0.1 2.8,0.3 4.1,0.5c0.1,0 0.3,0 0.4,0c-4.5,0.3 -9.2,0.4 -14.2,0.4zM223.6,261.6c15,-13.8 24.3,-33.1 27.9,-57.8h3.6l-9.7,71.9c-3.3,0.7 -6.6,1.2 -10.1,1.6c-3.2,0.3 -6.5,0.5 -9.8,0.5c-3.4,0 -6.8,-0.2 -10,-0.5c-4.3,-0.4 -8.5,-1.2 -12.6,-2.2c7.6,-3.3 14.4,-7.9 20.6,-13.6zM202.3,286.5c-8,-1.1 -16.4,-2.2 -25,-3.2c-8.6,-1.1 -18.6,-1.6 -29.9,-1.6l-5.2,-38.9c0.5,-0.6 0.8,-1.2 1.2,-1.9c0.5,-0.9 0.9,-1.8 1.1,-2.8c0.3,-0.9 0.5,-1.9 0.6,-3c0.1,-0.6 0.1,-1.2 0.1,-1.8c0,-0.7 0,-1.4 -0.1,-2c-0.1,-1.2 -0.3,-2.4 -0.7,-3.5c-0.3,-1.1 -0.7,-2.1 -1.2,-3c-0.1,-0.3 -0.3,-0.5 -0.4,-0.8c-1.1,-1.9 -2.3,-4 -3.4,-6c-0.2,-0.4 -0.4,-0.9 -0.6,-1.4l-0.7,-5.2c0,-0.5 0,-1.1 0.1,-1.6c0.2,-1.5 0.5,-2.9 0.9,-4.4c0,-0.1 0.1,-0.3 0.1,-0.4c0.1,-0.4 0.3,-0.7 0.4,-1.1h1.1c3.6,24.7 12.9,44 27.9,57.8c15,13.8 34,20.7 57.1,20.7c20.2,0 37.7,-5.5 52.6,-16.4c14.9,-10.9 26.4,-26.3 34.6,-46.1c8.2,-19.8 12.2,-43 12.2,-69.7c0,-20.2 -2.3,-38.7 -7,-55.6c-4.7,-16.9 -11.2,-31.5 -19.6,-43.7c-8.4,-12 -18.5,-21.4 -30.2,-28.1c-7.7,-4.4 -15.9,-7.4 -24.6,-8.9l-0.1,-1c0,0 -0.1,0 -0.1,0l-0.1,-0.8c-0.1,0 -0.2,0 -0.3,0l-0.1,-0.8c-0.2,0 -0.3,0 -0.5,0l-0.1,-0.7c-0.2,0 -0.4,0 -0.6,0l-0.1,-0.6c-0.2,0 -0.5,0 -0.7,0l-0.1,-0.4c-0.3,0 -0.5,0 -0.8,0l0,-0.3c-0.3,0 -0.6,0 -0.9,0l0,-0.1c-8.5,0 -15.5,-0.3 -21.3,-0.8c-0.8,-0.1 -1.6,-0.2 -2.3,-0.2c3.1,-0.1 6.6,-0.2 10.3,-0.2c32.9,0 61.3,5.8 85.3,17.3c24,11.5 42.5,27.7 55.6,48.6c13.1,20.9 19.6,45.5 19.6,73.8c0,28.1 -6.5,52.7 -19.6,73.8c-13.1,21.1 -31.4,37.5 -54.9,49.1c-23.5,11.6 -50.9,17.5 -82.1,17.5c-10.1,0 -19.1,-0.5 -27.2,-1.6zM161.7,48.1c-7.8,10.9 -13,23.5 -15.7,37.6h-3.6l10.2,-68c0.8,-0.1 1.5,-0.2 2.3,-0.3c2.5,-0.2 5.1,-0.4 7.7,-0.4c2.8,0 5.6,0.1 8.4,0.4c5,0.5 9.9,1.5 14.6,2.9c1.8,0.5 3.5,1.2 5.2,1.8c-11.6,6.4 -21.3,15 -29.1,25.9z"), "evenodd"); g.fillStyle = "#D9824E"; g.fill(new Path2D("M222.9,175.8v0c0.1,-2.7 -0.2,-5 -0.8,-7c-0.6,-2 -1.2,-4 -1.8,-6c-0.6,-2 -0.9,-4.4 -0.8,-7.1v0c0.1,-2.5 0.9,-4.9 2.4,-7.2c1.5,-2.3 3.6,-4.3 6.2,-5.8c2.7,-1.5 5.8,-2.3 9.5,-2.3v0c5.1,0 9.2,1.5 12.4,4.4c3.2,2.9 4.7,7.3 4.6,13.2v0c-0.2,6.3 -1.8,12.3 -4.9,18.1c-3.1,5.8 -7.5,11 -13.3,15.6c-5.7,4.5 -12.7,8.1 -20.8,10.7c-8.1,2.6 -17.3,4 -27.6,4v0c-13.9,0 -25.2,-2.5 -33.9,-7.4v0c-4,-2.2 -7.4,-4.8 -10.3,-7.8v0c-1.3,1.2 -2.4,2.4 -3.4,3.6v0c-2.4,2.9 -4.1,5.8 -5,8.6c-0.9,2.8 -1.4,5.6 -1.4,8.4v0c0,3.1 0.6,5.8 1.8,8c1.2,2.2 2.4,4.3 3.6,6.4c1.2,2 1.8,4.4 1.8,7v0c0.1,3.5 -1.3,6.6 -4.1,9.2c-2.8,2.6 -6.3,3.9 -10.6,4v0c-4.7,0.1 -8.6,-1.5 -11.7,-4.6c-3.1,-3.2 -4.7,-7.8 -4.8,-13.9v0c0,-6.5 2.3,-13.5 7,-20.9v0c4.4,-6.9 11.8,-14.1 22.2,-21.8v0c-1.4,-2.1 -2.6,-4.4 -3.5,-6.9v0c-3.5,-8.8 -4.2,-18.9 -2.1,-30.4v0c1.6,-8.6 4.6,-16.5 9.1,-23.6c4.5,-7.1 10.1,-13.3 16.8,-18.4c6.7,-5.1 14.3,-9.1 22.6,-11.9c8.3,-2.8 17.1,-4.2 26.3,-4.2v0c7.7,0 14.6,1.2 20.7,3.5c6,2.4 10.7,5.6 14,9.6v0c0.6,0.7 1.1,1.4 1.6,2.1v0c2.8,-2.2 5.1,-4.3 6.8,-6.4v0c1.9,-2.2 3.2,-4.4 4.1,-6.7c0.8,-2.2 1.2,-4.6 1.1,-7v0c0,-3.1 -0.6,-5.7 -1.7,-8c-1.1,-2.2 -2.2,-4.4 -3.3,-6.4c-1.1,-2 -1.6,-4.3 -1.7,-6.7v0c-0.1,-3.6 1.3,-6.8 4.2,-9.6c2.8,-2.8 6.6,-4.2 11.4,-4.2v0c5,-0.1 9,1.4 11.9,4.6c2.9,3.2 4.4,7.6 4.5,13.1v0c0,4.5 -1,8.9 -3.1,13.2c-2.1,4.3 -5.3,8.8 -9.8,13.3c-4.5,4.6 -10.4,9.6 -17.7,15v0l-3.9,3c0.1,1.3 0.2,2.5 0.1,3.8v0c-0.1,2.9 -0.8,5.2 -1.9,7.1c-1.2,1.9 -3.2,3 -6,3.3v0c-4.5,0.3 -9.3,1.7 -14.5,4v0c-1.6,0.7 -3.3,1.6 -5.1,2.6v0l-47.7,36.1c0.2,1.1 0.4,2.2 0.7,3.3v0c1.7,7.7 4.8,13.4 9.3,17.2c4.5,3.8 10,5.8 16.5,5.8v0c3.3,0 6.3,-0.4 9.2,-1.3c2.8,-0.9 5.3,-2.2 7.5,-3.9c2.2,-1.7 3.9,-3.8 5.2,-6.2c1.3,-2.4 2,-5.2 2.1,-8.2zM171.7,160.5v0l37.7,-28.6c0.7,-3.4 1.2,-7.5 1.6,-12.4v0c0.5,-7 -0.2,-12.1 -1.9,-15.4c-1.8,-3.3 -4.5,-4.9 -8.2,-4.9v0c-3.9,0 -7.6,1.6 -11.3,4.8c-3.7,3.2 -7,8.2 -10,14.8c-2.9,6.6 -5.1,15 -6.6,25.1v0c-0.9,6.1 -1.4,11.6 -1.3,16.6z"), "evenodd"); g.restore();
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
