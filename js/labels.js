// Realistic upright matchboxes for the wall, drawn on canvas: a cardboard tray pushed up out of the
// sleeve, a row of wooden matchsticks with glossy heads, a printed paper label with grain and wear,
// white cardboard edges and a soft shadow. Used for the centre Creeper & Co. box.
const SERIF = "Gloock, Georgia, serif", MONO = "'Familjen Grotesk', system-ui, sans-serif";
const HINDI = "'Yatra One', Gloock, serif";
export const LW = 300, LH = 360;          // printed label (sleeve top) size
const PAD = 28;                           // room for the shadow around each box
const C_PATH = "M50.5 12.5C46 8.6 40.2 6.5 33.6 6.5 19 6.5 6.5 17.9 6.5 32.6S18.7 58.5 33.4 58.5c6.9 0 12.9-2.4 17.4-6.6l-3.4-5.2c-3.5 3-7.7 4.6-12.4 4.6-9.6 0-16-8.3-16-18.6S25.3 13.8 34.8 13.8c3.9 0 7.4 1.2 10.2 3.4l2.2 6.2h3.3z";

// ---------- small drawing helpers ----------
const T = (g, s, x, y, font, fill, align = "center") => { g.font = font; g.fillStyle = fill; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y); };
const rect = (g, x, y, w, h, fill) => { g.fillStyle = fill; g.fillRect(x, y, w, h); };
function starP(g, cx, cy, n, r1, r2, rot = -Math.PI / 2) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); }
function cMark(g, cx, cy, s, ink, dot = "#D9824E") {
  g.save(); g.translate(cx - 32 * s, cy - 32 * s); g.scale(s, s);
  g.fillStyle = ink; g.fill(new Path2D(C_PATH)); g.fillStyle = dot; g.beginPath(); g.arc(50.6, 51, 3.1, 0, 7); g.fill();
  g.font = "italic 25px Fraunces, Georgia, serif"; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.fillText("&", 36, 44);
  g.restore();
}

// The Creeper & Co. box: burgundy and gold, the one everything points at
export const MAIN_LABEL = { head: "#D9824E", paint(g) {
  rect(g, 0, 0, LW, LH, "#2A1A3D");
  g.strokeStyle = "#EFC7A8"; g.lineWidth = 3; g.strokeRect(14, 14, LW - 28, LH - 28); g.lineWidth = 1; g.strokeRect(22, 22, LW - 44, LH - 44);
  [[22, 22], [LW - 22, 22], [22, LH - 22], [LW - 22, LH - 22]].forEach(([x, y]) => { starP(g, x, y, 4, 9, 3, 0); g.fillStyle = "#EFC7A8"; g.fill(); });
  T(g, "SAFETY MATCHES", LW / 2, 56, `500 12px ${MONO}`, "#EFC7A8");
  g.strokeStyle = "#EFC7A8"; g.lineWidth = 2; g.beginPath(); g.arc(LW / 2, 150, 66, 0, 7); g.stroke();
  starP(g, LW / 2, 150, 16, 58, 50, 0); g.fillStyle = "#EFC7A8"; g.fill();
  g.fillStyle = "#2A1A3D"; g.beginPath(); g.arc(LW / 2, 150, 46, 0, 7); g.fill();
  cMark(g, LW / 2, 150, 1.05, "#F4F0FA", "#EFC7A8");
  T(g, "Creeper & Co.", LW / 2, 252, `36px ${SERIF}`, "#F4F0FA");
  T(g, "क्रीपर एंड को.", LW / 2, 288, `20px ${HINDI}`, "#EFC7A8");
  T(g, "STRIKE TO SAY HELLO · EST. 2026", LW / 2, 322, `500 10px ${MONO}`, "#EFC7A8");
} };

// ---------- realism ----------
function paper(g, w, h) { // grain, a soft vignette and a little wear on the corners
  const d = g.getImageData(0, 0, w, h), p = d.data;
  for (let i = 0; i < p.length; i += 4) { const n = (Math.random() - .5) * 18; p[i] += n; p[i + 1] += n; p[i + 2] += n; }
  g.putImageData(d, 0, 0);
  const v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .75);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(20,10,40,.18)"); g.fillStyle = v; g.fillRect(0, 0, w, h);
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
  g.save(); g.shadowColor = "rgba(14,8,22,.45)"; g.shadowBlur = 22; g.shadowOffsetY = 12;
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
