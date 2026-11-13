// Our own matchbox labels for the wall, painted on canvas in the studio's hand: limited inks, printed-paper grain,
// real names with Hindi touches. renderWallBox() turns a label into a half-open box with depth: the tray pushed
// up with match heads showing, the striker strip down the side, and a soft shadow.
export const LW = 300, LH = 360;
const SERIF = "Gloock, Georgia, serif", POSTER = "'Archivo Black', Impact, sans-serif", TYPE = "'Special Elite', 'Courier New', monospace";
const SANS = "'Familjen Grotesk', system-ui, sans-serif", HINDI = "'Yatra One', Gloock, serif";

// ---------- drawing kit ----------
function txt(g, s, x, y, font, fill, { align = "center", track = 0, base = "middle" } = {}) {
  g.save(); g.font = font; g.fillStyle = fill; g.textAlign = align; g.textBaseline = base;
  if ("letterSpacing" in g) g.letterSpacing = `${track}px`;
  g.fillText(s, x, y); g.restore();
}
// fit text to a width by shrinking the font size
function fit(g, s, x, y, size, family, fill, maxW, opts = {}) {
  g.save(); g.font = `${size}px ${family}`; if ("letterSpacing" in g) g.letterSpacing = `${opts.track || 0}px`;
  const w = g.measureText(s).width; g.restore();
  txt(g, s, x, y, `${Math.min(size, size * maxW / w)}px ${family}`, fill, opts);
}
const fillRect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
function poly(g, pts, fill) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = fill; g.fill(); }
function star(g, cx, cy, n, r1, r2, fill, rot = -Math.PI / 2) {
  g.beginPath(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
  g.closePath(); g.fillStyle = fill; g.fill();
}
function circle(g, cx, cy, r, fill) { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); }
function ring(g, cx, cy, r, w, stroke) { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.lineWidth = w; g.strokeStyle = stroke; g.stroke(); }
function sunburst(g, cx, cy, r, n, c) {
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, b = a + Math.PI / n; poly(g, [[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r], [cx + Math.cos(b) * r, cy + Math.sin(b) * r]], c); }
}
function frame(g, ink, { inset = 12, gap = 7, w1 = 3, w2 = 1 } = {}) {
  g.strokeStyle = ink; g.lineWidth = w1; g.strokeRect(inset, inset, LW - inset * 2, LH - inset * 2);
  g.lineWidth = w2; g.strokeRect(inset + gap, inset + gap, LW - (inset + gap) * 2, LH - (inset + gap) * 2);
}
function corners(g, ink, d = 19) { [[d, d], [LW - d, d], [d, LH - d], [LW - d, LH - d]].forEach(([x, y]) => star(g, x, y, 4, 8, 2.6, ink, 0)); }
function dots(g, x, y, w, h, step, r, fill) { g.fillStyle = fill; for (let yy = y; yy < y + h; yy += step) for (let xx = x + ((yy / step) % 2 ? step / 2 : 0); xx < x + w; xx += step) { g.beginPath(); g.arc(xx, yy, r, 0, 7); g.fill(); } }
// the small print every box carries
function smallPrint(g, ink, top = "SAFETY MATCHES", bottom = "AVG. CONTENTS 50 · EST. 2026") {
  txt(g, top, LW / 2, 36, `600 10px ${SANS}`, ink, { track: 2.4 });
  txt(g, bottom, LW / 2, LH - 34, `600 9px ${SANS}`, ink, { track: 1.6 });
}
function flame(g, cx, cy, s, outer, inner) {
  const f = (k, c) => { g.beginPath(); g.moveTo(cx, cy - 60 * s * k); g.bezierCurveTo(cx + 34 * s * k, cy - 18 * s * k, cx + 30 * s * k, cy + 30 * s * k, cx, cy + 34 * s * k);
    g.bezierCurveTo(cx - 30 * s * k, cy + 30 * s * k, cx - 34 * s * k, cy - 14 * s * k, cx, cy - 60 * s * k); g.fillStyle = c; g.fill(); };
  f(1, outer); if (inner) { g.save(); g.translate(0, 12 * s); f(.55, inner); g.restore(); }
}

// ---------- the labels ----------
export const LABELS = [
  { name: "slow-burn", head: "#B3261E", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#232966"); frame(g, "#D9824E"); corners(g, "#D9824E"); smallPrint(g, "#EBE1D5");
    sunburst(g, LW / 2, 150, 120, 28, "rgba(217,130,78,.12)");
    fillRect(g, LW / 2 - 16, 150, 32, 72, "#F4EBDD"); fillRect(g, LW / 2 - 16, 150, 32, 8, "#E0D2BC");
    g.strokeStyle = "#232966"; g.lineWidth = 3; g.beginPath(); g.moveTo(LW / 2, 150); g.lineTo(LW / 2, 138); g.stroke();
    flame(g, LW / 2, 118, .7, "#D9824E", "#F6D27A");
    fit(g, "SLOW BURN", LW / 2, 262, 44, POSTER, "#F4EBDD", 230, { track: 1 });
    txt(g, "brands that last", LW / 2, 296, `italic 20px ${SERIF}`, "#D9824E");
  } },
  { name: "chai-break", head: "#2F5D8A", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#F2E6D0"); frame(g, "#B3261E", { w1: 4 }); smallPrint(g, "#B3261E", "STRONG · SWEET · SAFETY MATCHES");
    txt(g, "चाय", LW / 2, 86, `52px ${HINDI}`, "#B3261E");
    // cup and saucer
    g.fillStyle = "#B3261E"; g.beginPath(); g.ellipse(LW / 2, 222, 78, 12, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(LW / 2 - 50, 150); g.lineTo(LW / 2 + 50, 150); g.quadraticCurveTo(LW / 2 + 46, 214, LW / 2, 216); g.quadraticCurveTo(LW / 2 - 46, 214, LW / 2 - 50, 150); g.fill();
    g.lineWidth = 9; g.strokeStyle = "#B3261E"; g.beginPath(); g.arc(LW / 2 + 52, 176, 16, -1.2, 1.4); g.stroke();
    fillRect(g, LW / 2 - 44, 162, 88, 6, "#F2E6D0");
    g.lineWidth = 4; g.lineCap = "round";
    [-22, 0, 22].forEach((dx, i) => { g.beginPath(); g.moveTo(LW / 2 + dx, 140); g.bezierCurveTo(LW / 2 + dx - 14, 126, LW / 2 + dx + 14, 116, LW / 2 + dx, 100 + i * 4); g.stroke(); });
    fit(g, "CHAI BREAK", LW / 2, 272, 40, POSTER, "#232966", 236);
    txt(g, "No. 4 · kadak", LW / 2, 302, `15px ${TYPE}`, "#B3261E");
  } },
  { name: "bright-idea", head: "#E2B45A", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#1D2B4A"); frame(g, "#F2C94C"); smallPrint(g, "#F2C94C");
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.strokeStyle = "#F2C94C"; g.lineWidth = 4; g.beginPath();
      g.moveTo(LW / 2 + Math.cos(a) * 66, 140 + Math.sin(a) * 66); g.lineTo(LW / 2 + Math.cos(a) * 88, 140 + Math.sin(a) * 88); g.stroke(); }
    circle(g, LW / 2, 134, 46, "#F2C94C");
    poly(g, [[LW / 2 - 24, 166], [LW / 2 + 24, 166], [LW / 2 + 18, 196], [LW / 2 - 18, 196]], "#F2C94C");
    [200, 210, 220].forEach(y => fillRect(g, LW / 2 - 18, y, 36, 6, "#C9D2E3"));
    g.strokeStyle = "#1D2B4A"; g.lineWidth = 3; g.beginPath(); g.moveTo(LW / 2 - 10, 164); g.lineTo(LW / 2 - 10, 142);
    for (let i = 0; i < 4; i++) g.arc(LW / 2 - 7.5 + i * 5, 140, 2.5, Math.PI, 0, false);
    g.lineTo(LW / 2 + 10, 164); g.stroke();
    fit(g, "BRIGHT IDEA", LW / 2, 270, 38, POSTER, "#F4EBDD", 236);
    txt(g, "strike when it hits", LW / 2, 300, `italic 18px ${SERIF}`, "#F2C94C");
  } },
  { name: "late-nights", head: "#1E1E1E", paint(g) {
    const sky = g.createLinearGradient(0, 0, 0, LH); sky.addColorStop(0, "#1A1033"); sky.addColorStop(1, "#2F3578");
    fillRect(g, 0, 0, LW, LH, sky); frame(g, "#EBE1D5"); smallPrint(g, "#EBE1D5");
    circle(g, 196, 110, 38, "#F4EBDD"); circle(g, 214, 98, 34, "#22143E");
    [[70, 80], [110, 130], [240, 160], [60, 170], [150, 70], [250, 66]].forEach(([x, y], i) => star(g, x, y, 4, i % 2 ? 6 : 4, 1.5, "#EBE1D5"));
    // skyline: wada gate, temple spire, rooftops
    g.fillStyle = "#11143A";
    g.fillRect(24, 214, 252, 40); g.fillRect(40, 192, 46, 30); g.fillRect(200, 186, 60, 36);
    poly(g, [[120, 214], [150, 150], [180, 214]], "#11143A"); circle(g, 150, 146, 5, "#11143A");
    g.beginPath(); g.arc(63, 192, 23, Math.PI, 0); g.fill();
    g.fillStyle = "#F2C94C"; [[50, 200], [70, 204], [212, 196], [236, 200], [212, 230], [60, 236], [140, 232]].forEach(([x, y]) => g.fillRect(x, y, 6, 8));
    fit(g, "LATE NIGHTS", LW / 2, 270, 36, POSTER, "#F4EBDD", 236);
    txt(g, "देर रात", LW / 2, 302, `22px ${HINDI}`, "#D9824E");
  } },
  { name: "hello-world", head: "#2E6B4F", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#1F4D4A"); frame(g, "#F4EBDD", { w1: 2 }); corners(g, "#E2B45A"); smallPrint(g, "#F4EBDD", "EXPORT QUALITY · SAFETY MATCHES");
    circle(g, LW / 2, 148, 76, "#F4EBDD");
    g.save(); g.beginPath(); g.arc(LW / 2, 148, 76, 0, 7); g.clip();
    g.strokeStyle = "#1F4D4A"; g.lineWidth = 3;
    [-50, -25, 0, 25, 50].forEach(dy => { g.beginPath(); g.moveTo(LW / 2 - 80, 148 + dy); g.lineTo(LW / 2 + 80, 148 + dy); g.stroke(); });
    [20, 45, 76].forEach(rx => { g.beginPath(); g.ellipse(LW / 2, 148, rx, 76, 0, 0, 7); g.stroke(); });
    g.fillStyle = "#E2B45A"; g.beginPath(); g.ellipse(LW / 2 - 18, 128, 26, 18, .4, 0, 7); g.fill(); g.beginPath(); g.ellipse(LW / 2 + 26, 168, 18, 26, -.3, 0, 7); g.fill();
    g.restore(); ring(g, LW / 2, 148, 76, 4, "#E2B45A");
    fit(g, "HELLO WORLD", LW / 2, 266, 36, POSTER, "#F4EBDD", 236);
    txt(g, "from here, everywhere", LW / 2, 296, `italic 17px ${SERIF}`, "#E2B45A");
  } },
  { name: "kerning", head: "#1E1E1E", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#F4EFE4"); frame(g, "#1E1E1E", { w1: 2, w2: 1 }); smallPrint(g, "#1E1E1E", "TYPE FOUNDRY · SAFETY MATCHES");
    txt(g, "A", 104, 156, `150px ${SERIF}`, "#1E1E1E"); txt(g, "a", 196, 172, `italic 130px ${SERIF}`, "#C0392B");
    g.strokeStyle = "#C0392B"; g.lineWidth = 1.5; g.setLineDash([4, 4]);
    [[150, 70, 150, 238], [166, 70, 166, 238]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); });
    g.setLineDash([]); txt(g, "−12", 158, 250, `12px ${TYPE}`, "#C0392B");
    fit(g, "KERNING CO.", LW / 2, 284, 34, POSTER, "#1E1E1E", 230);
    txt(g, "mind the gap", LW / 2, 312, `14px ${TYPE}`, "#1E1E1E");
  } },
  { name: "monsoon", head: "#2F5D8A", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#2F5D8A"); frame(g, "#F4EBDD"); smallPrint(g, "#F4EBDD", "DAMP-PROOF · SAFETY MATCHES");
    g.strokeStyle = "rgba(244,235,221,.45)"; g.lineWidth = 2;
    for (let i = 0; i < 26; i++) { const x = 30 + (i * 37) % 240, y = 56 + (i * 53) % 150; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + 16); g.stroke(); }
    g.fillStyle = "#F2C94C"; g.beginPath(); g.moveTo(LW / 2 - 84, 168); g.quadraticCurveTo(LW / 2, 50, LW / 2 + 84, 168);
    for (let i = 3; i >= 0; i--) g.quadraticCurveTo(LW / 2 - 84 + (i + .5) * 42, 152, LW / 2 - 84 + i * 42, 168);
    g.fill();
    g.strokeStyle = "#F4EBDD"; g.lineWidth = 5; g.beginPath(); g.moveTo(LW / 2, 110); g.lineTo(LW / 2, 222); g.arc(LW / 2 + 12, 222, 12, Math.PI, 0, true); g.stroke();
    fit(g, "MONSOON", LW / 2, 266, 44, POSTER, "#F4EBDD", 232, { track: 2 });
    txt(g, "बारिश", LW / 2, 302, `24px ${HINDI}`, "#F2C94C");
  } },
  { name: "lotus", head: "#C0392B", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#173F35"); frame(g, "#E9A6B7"); corners(g, "#E9A6B7"); smallPrint(g, "#F4EBDD");
    circle(g, LW / 2, 150, 84, "rgba(233,166,183,.12)");
    const petal = (a, len, w, c) => { g.save(); g.translate(LW / 2, 196); g.rotate(a); g.beginPath(); g.moveTo(0, 0);
      g.bezierCurveTo(w, -len * .4, w * .6, -len * .9, 0, -len); g.bezierCurveTo(-w * .6, -len * .9, -w, -len * .4, 0, 0); g.fillStyle = c; g.fill(); g.restore(); };
    [-1.15, 1.15].forEach(a => petal(a, 84, 26, "#C7607A")); [-.62, .62].forEach(a => petal(a, 100, 28, "#E07F98")); petal(0, 112, 30, "#F2B6C6");
    g.fillStyle = "#2E6B4F"; g.beginPath(); g.ellipse(LW / 2, 204, 92, 14, 0, 0, 7); g.fill();
    fit(g, "LOTUS", LW / 2, 262, 48, POSTER, "#F4EBDD", 220, { track: 4 });
    txt(g, "कमल", LW / 2, 298, `24px ${HINDI}`, "#E9A6B7");
  } },
  { name: "golden-ratio", head: "#E2B45A", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#141414"); frame(g, "#D6A84F", { w1: 1.5, w2: 1 }); smallPrint(g, "#D6A84F", "1 : 1.618 · SAFETY MATCHES");
    // golden spiral in its rectangles
    let x = 46, y = 64, w = 208, h = 128, dir = 0;
    g.strokeStyle = "#5A4A2A"; g.lineWidth = 1; g.strokeRect(x, y, w, h);
    g.strokeStyle = "#D6A84F"; g.lineWidth = 3;
    for (let i = 0; i < 7; i++) {
      const s = Math.min(w, h); let cx, cy, a0;
      if (dir === 0) { cx = x + s; cy = y + s; a0 = Math.PI; g.strokeStyle = "#5A4A2A"; g.lineWidth = 1; g.strokeRect(x, y, s, s); x += s; w -= s; }
      else if (dir === 1) { cx = x; cy = y + s; a0 = -Math.PI / 2; g.strokeStyle = "#5A4A2A"; g.lineWidth = 1; g.strokeRect(x, y, w, s); y += s; h -= s; }
      else if (dir === 2) { cx = x + w - s; cy = y; a0 = 0; g.strokeStyle = "#5A4A2A"; g.lineWidth = 1; g.strokeRect(x + w - s, y, s, s); w -= s; }
      else { cx = x + s; cy = y + h - s; a0 = Math.PI / 2; g.strokeStyle = "#5A4A2A"; g.lineWidth = 1; g.strokeRect(x, y + h - s, w, s); h -= s; }
      g.strokeStyle = "#D6A84F"; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, s, a0, a0 + Math.PI / 2); g.stroke();
      dir = (dir + 1) % 4;
    }
    fit(g, "GOLDEN RATIO", LW / 2, 252, 34, POSTER, "#D6A84F", 236);
    txt(g, "proportion, properly", LW / 2, 284, `italic 18px ${SERIF}`, "#F4EBDD");
  } },
  { name: "peacock", head: "#2F5D8A", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#0F3B4A"); frame(g, "#E2B45A"); smallPrint(g, "#E2B45A");
    g.strokeStyle = "rgba(226,180,90,.5)"; g.lineWidth = 1.2;
    for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(LW / 2, 236); g.quadraticCurveTo(LW / 2 + i * 5, 160, LW / 2 + i * 9, 70); g.stroke(); }
    g.save(); g.translate(LW / 2, 138);
    [[58, 76, "#2E8B57"], [44, 60, "#E2B45A"], [32, 44, "#1F6F8B"], [20, 28, "#123B6B"], [9, 12, "#0B1E3A"]].forEach(([rx, ry, c]) => { g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.fillStyle = c; g.fill(); });
    g.restore();
    fit(g, "PEACOCK", LW / 2, 266, 42, POSTER, "#F4EBDD", 230, { track: 2 });
    txt(g, "मोर", LW / 2, 302, `24px ${HINDI}`, "#E2B45A");
  } },
  { name: "kite-day", head: "#C0392B", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#8FC3E0"); frame(g, "#1D2B4A"); smallPrint(g, "#1D2B4A", "SANKRANTI SPECIAL");
    g.save(); g.translate(170, 128); g.rotate(-.25);
    poly(g, [[0, -66], [52, 0], [0, 66], [-52, 0]], "#C0392B"); poly(g, [[0, -66], [52, 0], [0, 0]], "#F2C94C"); poly(g, [[0, 0], [-52, 0], [0, 66]], "#F2C94C");
    g.strokeStyle = "#1D2B4A"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -66); g.lineTo(0, 66); g.moveTo(-52, 0); g.lineTo(52, 0); g.stroke();
    poly(g, [[0, 66], [-12, 84], [12, 84]], "#C0392B");
    g.restore();
    g.strokeStyle = "#1D2B4A"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(186, 192); g.bezierCurveTo(140, 230, 90, 190, 46, 236); g.stroke();
    fit(g, "KITE DAY", LW / 2, 270, 44, POSTER, "#1D2B4A", 232, { track: 2 });
    txt(g, "पतंग", LW / 2, 306, `24px ${HINDI}`, "#C0392B");
  } },
  { name: "mango", head: "#2E6B4F", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#3E6B2E"); frame(g, "#F2C94C"); corners(g, "#F2C94C"); smallPrint(g, "#F4EBDD", "ALPHONSO GRADE");
    g.save(); g.translate(LW / 2, 156); g.rotate(-.35); g.scale(.86, .86);
    const mg = g.createRadialGradient(-20, -24, 6, 0, 0, 84); mg.addColorStop(0, "#FFD86B"); mg.addColorStop(.7, "#F2A33A"); mg.addColorStop(1, "#D9682B");
    g.beginPath(); g.moveTo(0, -78); g.bezierCurveTo(64, -76, 72, 36, 18, 74); g.bezierCurveTo(-30, 104, -74, 40, -58, -18); g.bezierCurveTo(-50, -56, -28, -78, 0, -78); g.fillStyle = mg; g.fill();
    g.fillStyle = "#2E6B4F"; g.beginPath(); g.moveTo(0, -78); g.bezierCurveTo(30, -112, 74, -104, 92, -88); g.bezierCurveTo(60, -70, 26, -66, 0, -78); g.fill();
    g.restore();
    fit(g, "MANGO SEASON", LW / 2, 270, 34, POSTER, "#F4EBDD", 236);
    txt(g, "आम", LW / 2, 304, `24px ${HINDI}`, "#F2C94C");
  } },
  { name: "pixels", head: "#C0622E", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#11143A"); smallPrint(g, "#C46A38", "8-BIT · SAFETY MATCHES");
    g.strokeStyle = "#C46A38"; g.lineWidth = 2; g.setLineDash([6, 6]); g.strokeRect(16, 16, LW - 32, LH - 32); g.setLineDash([]);
    const F = ["....X....", "...XXX...", "...XXX...", "..XXOXX..", ".XXOOOXX.", ".XOOYOOX.", "XXOYYYOXX", "XOOYYYOOX", ".XOOYOOX.", "..XXXXX.."];
    const C = { X: "#E8467C", O: "#F28C38", Y: "#F6D27A" }, P = 13, ox = LW / 2 - 4.5 * P, oy = 64;
    F.forEach((row, r) => [...row].forEach((ch, c) => { if (C[ch]) fillRect(g, ox + c * P, oy + r * P, P - 1, P - 1, C[ch]); }));
    fillRect(g, LW / 2 - 6, oy + 10 * P, 12, 46, "#F4EBDD");
    fit(g, "LATE NIGHT", LW / 2, 262, 36, POSTER, "#4FD1C5", 230, { track: 2 });
    fit(g, "PIXELS", LW / 2, 298, 30, POSTER, "#E8467C", 200, { track: 6 });
  } },
  { name: "first-draft", head: "#1E1E1E", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#C9A877"); dots(g, 20, 20, LW - 40, LH - 40, 16, 1, "rgba(60,40,20,.18)"); frame(g, "#3A2A20", { w1: 2 }); smallPrint(g, "#3A2A20", "HB · SAFETY MATCHES");
    g.strokeStyle = "#C0392B"; g.lineWidth = 3; g.lineCap = "round"; g.beginPath(); g.moveTo(52, 170);
    for (let i = 0; i < 9; i++) g.bezierCurveTo(70 + i * 22, 120 + (i % 2) * 70, 80 + i * 22, 200 - (i % 2) * 80, 92 + i * 22, 160);
    g.stroke();
    g.save(); g.translate(LW / 2 + 10, 118); g.rotate(-.7);
    fillRect(g, -90, -12, 150, 24, "#F2C94C"); fillRect(g, -90, -12, 150, 6, "#E0AE2E"); fillRect(g, -106, -12, 18, 24, "#9A9A9A"); fillRect(g, -122, -12, 18, 24, "#E07F98");
    poly(g, [[60, -12], [92, 0], [60, 12]], "#F0D9B5"); poly(g, [[82, -4], [92, 0], [82, 4]], "#2A2A2A");
    g.restore();
    fit(g, "FIRST DRAFT", LW / 2, 262, 38, POSTER, "#2A1A12", 236);
    txt(g, "never the last", LW / 2, 294, `16px ${TYPE}`, "#3A2A20");
  } },
  { name: "grid", head: "#C0392B", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#EEE9DF"); smallPrint(g, "#1E1E1E", "SWISS STYLE · SAFETY MATCHES");
    g.strokeStyle = "rgba(30,30,30,.25)"; g.lineWidth = 1;
    for (let x = 30; x <= 270; x += 30) { g.beginPath(); g.moveTo(x, 50); g.lineTo(x, 230); g.stroke(); }
    for (let y = 50; y <= 230; y += 30) { g.beginPath(); g.moveTo(30, y); g.lineTo(270, y); g.stroke(); }
    circle(g, 180, 130, 70, "#C0392B"); fillRect(g, 30, 170, 120, 30, "#1E1E1E");
    g.strokeStyle = "#1E1E1E"; g.lineWidth = 6; g.beginPath(); g.moveTo(60, 60); g.lineTo(240, 230); g.stroke();
    txt(g, "GRID", 30, 268, `46px ${POSTER}`, "#1E1E1E", { align: "left" });
    txt(g, "system.", 30, 304, `italic 26px ${SERIF}`, "#C0392B", { align: "left" });
    txt(g, "Nº 12", 270, 268, `600 12px ${SANS}`, "#1E1E1E", { align: "right", track: 1 });
  } },
  { name: "diya", head: "#E2B45A", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#6B1F2E"); frame(g, "#E2B45A"); corners(g, "#E2B45A"); smallPrint(g, "#F4EBDD", "FESTIVE PACK");
    const glow = g.createRadialGradient(LW / 2, 120, 4, LW / 2, 120, 110); glow.addColorStop(0, "rgba(246,210,122,.55)"); glow.addColorStop(1, "rgba(246,210,122,0)");
    g.fillStyle = glow; g.fillRect(0, 0, LW, 240);
    flame(g, LW / 2, 122, .75, "#F2A33A", "#FFF1B8");
    g.fillStyle = "#C9682B"; g.beginPath(); g.moveTo(LW / 2 - 82, 170); g.quadraticCurveTo(LW / 2, 252, LW / 2 + 82, 170); g.quadraticCurveTo(LW / 2 + 96, 158, LW / 2 + 108, 160); g.quadraticCurveTo(LW / 2 + 90, 176, LW / 2 + 70, 182); g.lineTo(LW / 2 - 82, 170); g.fill();
    g.fillStyle = "#E2B45A"; [[-50, 186], [-20, 196], [10, 198], [40, 192]].forEach(([dx, y]) => { g.beginPath(); g.arc(LW / 2 + dx, y, 4, 0, 7); g.fill(); });
    fit(g, "DIYA", LW / 2, 264, 52, POSTER, "#F4EBDD", 200, { track: 6 });
    txt(g, "दीया", LW / 2, 302, `26px ${HINDI}`, "#E2B45A");
  } },
  { name: "tiger", head: "#1E1E1E", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#E8862E"); smallPrint(g, "#1E1E1E", "EXTRA STRONG");
    g.fillStyle = "#1E1E1E";
    for (let i = 0; i < 9; i++) { const y = 54 + i * 22, s = i % 2 ? 1 : -1; g.beginPath(); g.moveTo(s > 0 ? 16 : LW - 16, y); g.quadraticCurveTo(LW / 2, y + 18 * s, s > 0 ? 200 + (i * 13) % 50 : 100 - (i * 11) % 50, y + 6); g.lineTo(s > 0 ? 16 : LW - 16, y + 12); g.fill(); }
    fillRect(g, 30, 240, LW - 60, 78, "#1E1E1E");
    fit(g, "TIGER", LW / 2, 270, 40, POSTER, "#E8862E", 200, { track: 8 });
    txt(g, "बाघ · STRIPES", LW / 2, 300, `18px ${HINDI}`, "#F4EBDD");
  } },
  { name: "spark", head: "#C0622E", paint(g) {
    fillRect(g, 0, 0, LW, LH, "#3A4088"); frame(g, "#EBE1D5", { w1: 2 }); smallPrint(g, "#EBE1D5");
    sunburst(g, LW / 2, 140, 150, 36, "rgba(235,225,213,.08)");
    star(g, LW / 2, 140, 8, 82, 30, "#D9824E", 0); star(g, LW / 2, 140, 8, 46, 18, "#F6D27A", Math.PI / 8); circle(g, LW / 2, 140, 10, "#F4EBDD");
    fit(g, "SPARK", LW / 2, 264, 50, POSTER, "#F4EBDD", 210, { track: 6 });
    txt(g, "every brand starts with one", LW / 2, 298, `italic 16px ${SERIF}`, "#EBE1D5");
  } }
];

// ---------- printed-paper finish ----------
function finish(g, w, h) {
  const d = g.getImageData(0, 0, w, h), p = d.data;
  for (let i = 0; i < p.length; i += 4) { const n = (Math.random() - .5) * 16; p[i] += n; p[i + 1] += n; p[i + 2] += n; }
  g.putImageData(d, 0, 0);
  // a touch of misregistration wear and a soft vignette
  const v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .78);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(20,10,30,.22)"); g.fillStyle = v; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(255,255,255,.06)"; g.fillRect(0, 0, w, 3);
}
export function paintLabel(def) {
  const c = document.createElement("canvas"); c.width = LW; c.height = LH;
  const g = c.getContext("2d"); def.paint(g); finish(g, LW, LH); return c;
}

// ---------- the box: tray pushed up, sticks showing, striker on the side ----------
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = c => Math.max(0, Math.min(255, Math.round(c + (k < 0 ? c * k : (255 - c) * k)))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
export function renderWallBox(def, open = 80) {
  const lab = paintLabel(def);
  const D = 30, dx = D * .82, dy = -D * .62, PAD = 26;                  // depth of the box, drawn up and to the right
  const W = Math.ceil(LW + dx + PAD * 2), H = Math.ceil(LH + open - dy + PAD * 2 + 10);
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  const sx = PAD, sy = PAD - dy + open;                                  // sleeve front, top-left
  const tx = sx + 8, tw = LW - 16, ty = sy - open;                       // tray front, top-left

  // shadow of the whole box
  // (the shape is drawn far off the canvas and only its shadow is thrown back onto it)
  const OFF = 4000, top = open > 0 ? sy - Math.max(16, open * .32) : sy;
  g.save(); g.shadowColor = "rgba(10,5,20,.55)"; g.shadowBlur = 24; g.shadowOffsetY = 14; g.shadowOffsetX = -4 + OFF;
  poly(g, [[sx - OFF, top], [sx + LW + dx - OFF, top + dy], [sx + LW + dx - OFF, sy + LH + dy], [sx - OFF, sy + LH]], "#000"); g.restore();

  // sleeve top face (mostly hidden by the tray)
  poly(g, [[sx, sy], [sx + LW, sy], [sx + LW + dx, sy + dy], [sx + dx, sy + dy]], "#D9CDB8");

  if (open > 0) {
    // inside of the tray, seen from above
    poly(g, [[tx, ty], [tx + tw, ty], [tx + tw + dx, ty + dy], [tx + dx, ty + dy]], "#6E5C44");
    const n = 12, rows = 3, sw = (tw - 12) / n, wallH = Math.max(16, open * .32);
    // sticks standing in rows, back to front; only the front row shows its wooden shaft above the tray wall
    for (let r = 0; r < rows; r++) {
      const k = 1 - (r + .5) / rows, ox = tx + dx * k + 6, oy = ty + dy * k + 8;
      for (let i = 0; i < n; i++) {
        const lift = Math.sin(i * 3.3 + r * 2) * 2.2, hx = ox + i * sw + sw / 2 + Math.sin(i * 7.1 + r) * 1.2, hy = oy + lift;
        if (r === rows - 1) {                                            // front row: the shafts
          const wood = g.createLinearGradient(hx - sw * .3, 0, hx + sw * .3, 0);
          wood.addColorStop(0, "#B9894F"); wood.addColorStop(.45, "#EBCB96"); wood.addColorStop(1, "#A97842");
          g.fillStyle = wood; g.fillRect(hx - sw * .26, hy, sw * .52, sy - hy);
        }
        const hg = g.createRadialGradient(hx - 2, hy - 3, .5, hx, hy, sw * .6);
        hg.addColorStop(0, "rgba(255,255,255,.75)"); hg.addColorStop(.3, def.head); hg.addColorStop(1, shade(def.head, -.5));
        g.fillStyle = hg; g.beginPath(); g.ellipse(hx, hy, sw * .42, sw * .5, 0, 0, 7); g.fill();
      }
    }
    // tray right wall, and its low front wall
    poly(g, [[tx + tw, sy - wallH], [tx + tw + dx, sy - wallH + dy], [tx + tw + dx, sy + dy], [tx + tw, sy]], "#CDBFA6");
    const front = g.createLinearGradient(0, sy - wallH, 0, sy); front.addColorStop(0, "#F3ECDE"); front.addColorStop(1, "#D8CAB2");
    fillRect(g, tx, sy - wallH, tw, wallH, front);
    fillRect(g, tx, sy - wallH, tw, 2, "#FFFDF6");
  }

  // striker side: brown sandpaper strip with grit
  const side = [[sx + LW, sy], [sx + LW + dx, sy + dy], [sx + LW + dx, sy + LH + dy], [sx + LW, sy + LH]];
  poly(g, side, "#6E3A24");
  g.save(); g.beginPath(); side.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip();
  for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < .5 ? "rgba(0,0,0,.35)" : "rgba(255,210,170,.18)"; g.fillRect(sx + LW + Math.random() * dx, sy + dy + Math.random() * (LH - dy), 1.2, 1.2); }
  const sg = g.createLinearGradient(sx + LW, 0, sx + LW + dx, 0); sg.addColorStop(0, "rgba(0,0,0,.35)"); sg.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = sg; g.fillRect(sx + LW, sy + dy, dx, LH - dy);
  g.restore();

  // sleeve front: white board edge with the printed label on it
  fillRect(g, sx, sy, LW, LH, "#F1EADC");
  g.drawImage(lab, sx + 3, sy + 3, LW - 6, LH - 6);
  const edge = g.createLinearGradient(0, sy, 0, sy + 12); edge.addColorStop(0, "rgba(255,255,255,.55)"); edge.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = edge; g.fillRect(sx, sy, LW, 12);
  const left = g.createLinearGradient(sx, 0, sx + 14, 0); left.addColorStop(0, "rgba(255,255,255,.25)"); left.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = left; g.fillRect(sx, sy, 14, LH);
  return { url: c.toDataURL("image/png"), w: W, h: H };
}
