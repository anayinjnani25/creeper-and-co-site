// Realistic upright matchboxes for the wall, drawn on canvas: a cardboard tray pushed up out of the
// sleeve, a row of wooden matchsticks with glossy heads, a printed paper label with grain and wear,
// white cardboard edges and a soft shadow. Used for the centre Stydio box.
import { WORDMARK, Y } from "./brandmark.js";
const SERIF = "Gloock, Georgia, serif", MONO = "'Familjen Grotesk', system-ui, sans-serif";
const HINDI = "'Yatra One', Gloock, serif";
export const LW = 300, LH = 360;          // printed label (sleeve top) size
const PAD = 28;                           // room for the shadow around each box
const MARK_C = "M162.6,288.1c-31.2,0 -58.6,-5.8 -82.1,-17.5c-23.5,-11.6 -41.8,-28 -54.9,-49.1c-13.1,-21.1 -19.6,-45.7 -19.6,-73.8c0,-28.3 6.5,-52.9 19.6,-73.8c13.1,-20.9 31.6,-37.1 55.6,-48.6c24,-11.5 52.4,-17.3 85.3,-17.3c7.9,0 14.5,0.3 19.8,0.9c5.3,0.6 10.2,1.3 14.8,2c4.6,0.7 9.8,1.4 15.7,2c5.9,0.6 13.3,0.9 22.1,0.9l7.2,48c0,0.1 0,0.1 0,0.2c-0.1,0.6 -0.1,1.2 -0.1,1.9c0,0.6 0.1,1.1 0.1,1.6c0.1,1.3 0.3,2.6 0.7,3.7c0.2,0.6 0.4,1.3 0.7,1.9l2.2,14.7h-3.6c-2.6,-14.2 -7.9,-26.7 -15.7,-37.6c-7.8,-10.9 -17.5,-19.6 -29.2,-25.9c-11.6,-6.4 -24.5,-9.5 -38.7,-9.5c-13.9,0 -26.8,3.4 -38.5,10.1c-11.8,6.7 -21.8,16.1 -30.2,28.1c-8.4,12.2 -14.9,26.8 -19.6,43.7c-4.7,16.9 -7,35.5 -7,55.6c0,26.6 4.1,49.9 12.2,69.7c8.2,19.8 19.7,35.2 34.6,46.1c8.6,6.3 18.2,10.8 28.6,13.5l0.4,3c0,0 0.1,0 0.1,0l0.1,0.8c0.1,0 0.2,0 0.3,0l0.1,0.8c0.2,0 0.3,0 0.5,0l0.1,0.7c0.2,0 0.4,0 0.6,0l0.1,0.6c0.2,0 0.5,0 0.7,0l0.1,0.4c0.3,0 0.5,0 0.8,0l0,0.3c0.3,0 0.6,0 0.9,0l0,0.1c9.2,0 17.5,0.4 24.9,1.1c1.4,0.1 2.8,0.3 4.1,0.5c0.1,0 0.3,0 0.4,0c-4.5,0.3 -9.2,0.4 -14.2,0.4zM223.6,261.6c15,-13.8 24.3,-33.1 27.9,-57.8h3.6l-9.7,71.9c-3.3,0.7 -6.6,1.2 -10.1,1.6c-3.2,0.3 -6.5,0.5 -9.8,0.5c-3.4,0 -6.8,-0.2 -10,-0.5c-4.3,-0.4 -8.5,-1.2 -12.6,-2.2c7.6,-3.3 14.4,-7.9 20.6,-13.6zM202.3,286.5c-8,-1.1 -16.4,-2.2 -25,-3.2c-8.6,-1.1 -18.6,-1.6 -29.9,-1.6l-5.2,-38.9c0.5,-0.6 0.8,-1.2 1.2,-1.9c0.5,-0.9 0.9,-1.8 1.1,-2.8c0.3,-0.9 0.5,-1.9 0.6,-3c0.1,-0.6 0.1,-1.2 0.1,-1.8c0,-0.7 0,-1.4 -0.1,-2c-0.1,-1.2 -0.3,-2.4 -0.7,-3.5c-0.3,-1.1 -0.7,-2.1 -1.2,-3c-0.1,-0.3 -0.3,-0.5 -0.4,-0.8c-1.1,-1.9 -2.3,-4 -3.4,-6c-0.2,-0.4 -0.4,-0.9 -0.6,-1.4l-0.7,-5.2c0,-0.5 0,-1.1 0.1,-1.6c0.2,-1.5 0.5,-2.9 0.9,-4.4c0,-0.1 0.1,-0.3 0.1,-0.4c0.1,-0.4 0.3,-0.7 0.4,-1.1h1.1c3.6,24.7 12.9,44 27.9,57.8c15,13.8 34,20.7 57.1,20.7c20.2,0 37.7,-5.5 52.6,-16.4c14.9,-10.9 26.4,-26.3 34.6,-46.1c8.2,-19.8 12.2,-43 12.2,-69.7c0,-20.2 -2.3,-38.7 -7,-55.6c-4.7,-16.9 -11.2,-31.5 -19.6,-43.7c-8.4,-12 -18.5,-21.4 -30.2,-28.1c-7.7,-4.4 -15.9,-7.4 -24.6,-8.9l-0.1,-1c0,0 -0.1,0 -0.1,0l-0.1,-0.8c-0.1,0 -0.2,0 -0.3,0l-0.1,-0.8c-0.2,0 -0.3,0 -0.5,0l-0.1,-0.7c-0.2,0 -0.4,0 -0.6,0l-0.1,-0.6c-0.2,0 -0.5,0 -0.7,0l-0.1,-0.4c-0.3,0 -0.5,0 -0.8,0l0,-0.3c-0.3,0 -0.6,0 -0.9,0l0,-0.1c-8.5,0 -15.5,-0.3 -21.3,-0.8c-0.8,-0.1 -1.6,-0.2 -2.3,-0.2c3.1,-0.1 6.6,-0.2 10.3,-0.2c32.9,0 61.3,5.8 85.3,17.3c24,11.5 42.5,27.7 55.6,48.6c13.1,20.9 19.6,45.5 19.6,73.8c0,28.1 -6.5,52.7 -19.6,73.8c-13.1,21.1 -31.4,37.5 -54.9,49.1c-23.5,11.6 -50.9,17.5 -82.1,17.5c-10.1,0 -19.1,-0.5 -27.2,-1.6zM161.7,48.1c-7.8,10.9 -13,23.5 -15.7,37.6h-3.6l10.2,-68c0.8,-0.1 1.5,-0.2 2.3,-0.3c2.5,-0.2 5.1,-0.4 7.7,-0.4c2.8,0 5.6,0.1 8.4,0.4c5,0.5 9.9,1.5 14.6,2.9c1.8,0.5 3.5,1.2 5.2,1.8c-11.6,6.4 -21.3,15 -29.1,25.9z";
const MARK_AMP = "M222.9,175.8v0c0.1,-2.7 -0.2,-5 -0.8,-7c-0.6,-2 -1.2,-4 -1.8,-6c-0.6,-2 -0.9,-4.4 -0.8,-7.1v0c0.1,-2.5 0.9,-4.9 2.4,-7.2c1.5,-2.3 3.6,-4.3 6.2,-5.8c2.7,-1.5 5.8,-2.3 9.5,-2.3v0c5.1,0 9.2,1.5 12.4,4.4c3.2,2.9 4.7,7.3 4.6,13.2v0c-0.2,6.3 -1.8,12.3 -4.9,18.1c-3.1,5.8 -7.5,11 -13.3,15.6c-5.7,4.5 -12.7,8.1 -20.8,10.7c-8.1,2.6 -17.3,4 -27.6,4v0c-13.9,0 -25.2,-2.5 -33.9,-7.4v0c-4,-2.2 -7.4,-4.8 -10.3,-7.8v0c-1.3,1.2 -2.4,2.4 -3.4,3.6v0c-2.4,2.9 -4.1,5.8 -5,8.6c-0.9,2.8 -1.4,5.6 -1.4,8.4v0c0,3.1 0.6,5.8 1.8,8c1.2,2.2 2.4,4.3 3.6,6.4c1.2,2 1.8,4.4 1.8,7v0c0.1,3.5 -1.3,6.6 -4.1,9.2c-2.8,2.6 -6.3,3.9 -10.6,4v0c-4.7,0.1 -8.6,-1.5 -11.7,-4.6c-3.1,-3.2 -4.7,-7.8 -4.8,-13.9v0c0,-6.5 2.3,-13.5 7,-20.9v0c4.4,-6.9 11.8,-14.1 22.2,-21.8v0c-1.4,-2.1 -2.6,-4.4 -3.5,-6.9v0c-3.5,-8.8 -4.2,-18.9 -2.1,-30.4v0c1.6,-8.6 4.6,-16.5 9.1,-23.6c4.5,-7.1 10.1,-13.3 16.8,-18.4c6.7,-5.1 14.3,-9.1 22.6,-11.9c8.3,-2.8 17.1,-4.2 26.3,-4.2v0c7.7,0 14.6,1.2 20.7,3.5c6,2.4 10.7,5.6 14,9.6v0c0.6,0.7 1.1,1.4 1.6,2.1v0c2.8,-2.2 5.1,-4.3 6.8,-6.4v0c1.9,-2.2 3.2,-4.4 4.1,-6.7c0.8,-2.2 1.2,-4.6 1.1,-7v0c0,-3.1 -0.6,-5.7 -1.7,-8c-1.1,-2.2 -2.2,-4.4 -3.3,-6.4c-1.1,-2 -1.6,-4.3 -1.7,-6.7v0c-0.1,-3.6 1.3,-6.8 4.2,-9.6c2.8,-2.8 6.6,-4.2 11.4,-4.2v0c5,-0.1 9,1.4 11.9,4.6c2.9,3.2 4.4,7.6 4.5,13.1v0c0,4.5 -1,8.9 -3.1,13.2c-2.1,4.3 -5.3,8.8 -9.8,13.3c-4.5,4.6 -10.4,9.6 -17.7,15v0l-3.9,3c0.1,1.3 0.2,2.5 0.1,3.8v0c-0.1,2.9 -0.8,5.2 -1.9,7.1c-1.2,1.9 -3.2,3 -6,3.3v0c-4.5,0.3 -9.3,1.7 -14.5,4v0c-1.6,0.7 -3.3,1.6 -5.1,2.6v0l-47.7,36.1c0.2,1.1 0.4,2.2 0.7,3.3v0c1.7,7.7 4.8,13.4 9.3,17.2c4.5,3.8 10,5.8 16.5,5.8v0c3.3,0 6.3,-0.4 9.2,-1.3c2.8,-0.9 5.3,-2.2 7.5,-3.9c2.2,-1.7 3.9,-3.8 5.2,-6.2c1.3,-2.4 2,-5.2 2.1,-8.2zM171.7,160.5v0l37.7,-28.6c0.7,-3.4 1.2,-7.5 1.6,-12.4v0c0.5,-7 -0.2,-12.1 -1.9,-15.4c-1.8,-3.3 -4.5,-4.9 -8.2,-4.9v0c-3.9,0 -7.6,1.6 -11.3,4.8c-3.7,3.2 -7,8.2 -10,14.8c-2.9,6.6 -5.1,15 -6.6,25.1v0c-0.9,6.1 -1.4,11.6 -1.3,16.6z";

// ---------- small drawing helpers ----------
const T = (g, s, x, y, font, fill, align = "center") => { g.font = font; g.fillStyle = fill; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y); };
const rect = (g, x, y, w, h, fill) => { g.fillStyle = fill; g.fillRect(x, y, w, h); };
function starP(g, cx, cy, n, r1, r2, rot = -Math.PI / 2) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); }
function cMark(g, cx, cy, s, ink, amp = "#D9824E") {   // two Cs face to face, holding the &
  const k = s * .195;
  g.save(); g.translate(cx - 196 * k, cy - 148 * k); g.scale(k, k);
  g.fillStyle = ink; g.fill(new Path2D(MARK_C), "evenodd"); g.fillStyle = amp; g.fill(new Path2D(MARK_AMP), "evenodd");
  g.restore();
}

// draw the logo from its path data: the wordmark centred at (cx, cy) w wide, or the y alone fitted to h
function wordmark(g, cx, cy, w, ink, acc) {
  const [x, y, vw, vh] = WORDMARK.viewBox, k = w / vw;
  g.save(); g.translate(cx - w / 2 - x * k, cy - vh * k / 2 - y * k); g.scale(k, k);
  g.fillStyle = ink; g.fill(new Path2D(WORDMARK.ink)); g.fillStyle = acc; g.fill(new Path2D(WORDMARK.acc)); g.restore();
}
function yMark(g, cx, cy, h, fill) {
  const [x, y, vw, vh] = Y.viewBox, k = h / vh;
  g.save(); g.translate(cx - (x + vw / 2) * k, cy - (y + vh / 2) * k); g.scale(k, k); g.fillStyle = fill; g.fill(new Path2D(Y.d)); g.restore();
}

// The Stydio box: navy and copper, the one everything points at
export const MAIN_LABEL = { head: "#D9824E", paint(g) {
  rect(g, 0, 0, LW, LH, "#151946");
  g.strokeStyle = "#EBE1D5"; g.lineWidth = 3; g.strokeRect(14, 14, LW - 28, LH - 28); g.lineWidth = 1; g.strokeRect(22, 22, LW - 44, LH - 44);
  [[22, 22], [LW - 22, 22], [22, LH - 22], [LW - 22, LH - 22]].forEach(([x, y]) => { starP(g, x, y, 4, 9, 3, 0); g.fillStyle = "#EBE1D5"; g.fill(); });
  T(g, "SAFETY MATCHES", LW / 2, 56, `500 12px ${MONO}`, "#EBE1D5");
  g.strokeStyle = "#EBE1D5"; g.lineWidth = 2; g.beginPath(); g.arc(LW / 2, 150, 66, 0, 7); g.stroke();
  starP(g, LW / 2, 150, 16, 58, 50, 0); g.fillStyle = "#EBE1D5"; g.fill();
  g.fillStyle = "#151946"; g.beginPath(); g.arc(LW / 2, 150, 46, 0, 7); g.fill();
  yMark(g, LW / 2, 152, 50, "#D9824E");
  wordmark(g, LW / 2, 252, 190, "#EBE1D5", "#D9824E");
  T(g, "BRANDING · PACKAGING · WEB", LW / 2, 290, `600 11px ${MONO}`, "#EBE1D5");
  T(g, "STRIKE TO SAY HELLO · EST. 2026", LW / 2, 322, `500 10px ${MONO}`, "#EBE1D5");
} };

// ---------- realism ----------
function paper(g, w, h) { // grain, a soft vignette and a little wear on the corners
  const d = g.getImageData(0, 0, w, h), p = d.data;
  for (let i = 0; i < p.length; i += 4) { const n = (Math.random() - .5) * 18; p[i] += n; p[i + 1] += n; p[i + 2] += n; }
  g.putImageData(d, 0, 0);
  const v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .75);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(21,25,70,.18)"); g.fillStyle = v; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(0, 0, w, 3);
}
function label(def) { const c = document.createElement("canvas"); c.width = LW; c.height = LH; const g = c.getContext("2d"); def.paint(g); paper(g, LW, LH); return c; }

// matchsticks standing in the tray, seen from above: wooden ends and glossy heads, packed tightly
function sticks(g, x, y, w, h, head) {
  const n = 12, sw = w / n;
  for (let i = 0; i < n; i++) {
    const sx = x + i * sw + sw / 2 + (Math.sin(i * 7.3) * 1.5), lift = Math.sin(i * 3.1) * 4;
    const wood = g.createLinearGradient(sx - sw / 2, 0, sx + sw / 2, 0);
    wood.addColorStop(0, "#B9894F"); wood.addColorStop(.45, "#E9C690"); wood.addColorStop(1, "#A97842");
    g.fillStyle = wood; g.fillRect(sx - sw * .36, y + 14 + lift, sw * .72, h);
    const hg = g.createRadialGradient(sx - 3, y + 12 + lift, 1, sx, y + 16 + lift, sw * .62);
    hg.addColorStop(0, "rgba(255,255,255,.65)"); hg.addColorStop(.25, head); hg.addColorStop(1, shade(head, -.45));
    g.fillStyle = hg; g.beginPath(); g.ellipse(sx, y + 16 + lift, sw * .5, sw * .62, 0, 0, 7); g.fill();
  }
}
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); const f = c => Math.max(0, Math.min(255, Math.round(c + (k < 0 ? c * k : (255 - c) * k)))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }

// One full box: tray pushed up by `open` px out of the sleeve. Returns a data URL (shadow baked in).
export function renderBox(def, open = 90) {
  const lab = label(def);
  const w = LW + PAD * 2, h = LH + open + PAD * 2 + 14;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d");
  const sx = PAD, sy = PAD + open;           // sleeve top-left
  // soft shadow under the whole box
  g.save(); g.shadowColor = "rgba(21,25,70,.45)"; g.shadowBlur = 22; g.shadowOffsetY = 12;
  g.fillStyle = "#000"; g.fillRect(sx + 4, PAD + 6, LW - 8, LH + open - 6); g.restore();
  // tray: cardboard walls, then the sticks inside
  const tx = sx + 8, ty = PAD, tw = LW - 16, th = open + 40;
  g.fillStyle = "#EFE6D6"; g.fillRect(tx, ty, tw, th);
  g.fillStyle = "#D8CCB6"; g.fillRect(tx + 7, ty + 7, tw - 14, th);
  sticks(g, tx + 9, ty + 4, tw - 18, th, def.head);
  const lip = g.createLinearGradient(0, ty, 0, ty + 8); lip.addColorStop(0, "#FBF6EC"); lip.addColorStop(1, "#E2D7C2");
  g.fillStyle = lip; g.fillRect(tx, ty, tw, 6);
  // sleeve: white cardboard edge, label, a little shadow cast onto the tray
  g.save(); g.shadowColor = "rgba(0,0,0,.35)"; g.shadowBlur = 8; g.shadowOffsetY = -2;
  g.fillStyle = "#F4EFE6"; g.fillRect(sx, sy, LW, LH + 10); g.restore();
  g.drawImage(lab, sx + 3, sy + 3, LW - 6, LH - 6);
  const edge = g.createLinearGradient(0, sy, 0, sy + 10); edge.addColorStop(0, "rgba(255,255,255,.6)"); edge.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = edge; g.fillRect(sx, sy, LW, 10);
  g.fillStyle = "#D9D1C3"; g.fillRect(sx, sy + LH, LW, 10); // bottom face of the sleeve
  return { url: c.toDataURL("image/png"), w, h };
}

// Just the sleeve with its label, for the opened view
export function renderSleeve(def) {
  const lab = label(def);
  const c = document.createElement("canvas"); c.width = LW + 12; c.height = LH + 22;
  const g = c.getContext("2d");
  g.fillStyle = "#F4EFE6"; g.fillRect(0, 0, LW + 12, LH + 12);
  g.drawImage(lab, 6, 6, LW, LH);
  g.fillStyle = "#D9D1C3"; g.fillRect(0, LH + 12, LW + 12, 10);
  return c.toDataURL("image/png");
}
