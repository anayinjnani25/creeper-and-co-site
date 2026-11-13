// Hero: the Stydio wordmark, split as "sty / dio", with a thin window between the lines. Inside the window, thousands
// of particles spell our services and morph from word to word; the pointer scatters them and they spring
// back. Scrolling parts the lines and opens the window to the full screen, where the particles burst into
// a slow field behind the headline (still reacting to the pointer).
import * as THREE from "three";

const WORDS = ["Logo Design", "Brand Identity", "Packaging Design", "Website Dev"];   // our four services, nothing else
const HOLD = 2600;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = t => t * t * (3 - 2 * t);

export function mountHero(hero) {
  if (!hero) return;
  const stage = hero.querySelector(".hero-stage"), reel = hero.querySelector(".reel");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // wordmark letters rise in one after another
  hero.querySelectorAll(".mark .line").forEach((line, li) => {
    if (!line.querySelector(".ch")) {
    const html = [...line.childNodes].map(n => n.nodeType === 3
      ? [...n.textContent].map(c => c === " " ? " " : `<span class="ch">${c}</span>`).join("")
      : `<em><span class="ch">${n.textContent}</span></em>`).join("");
    line.innerHTML = html;
    }
    line.querySelectorAll(".ch").forEach((c, i) => c.style.setProperty("--d", `${li * 260 + i * 60}ms`));
  });
  requestAnimationFrame(() => setTimeout(() => stage.classList.add("ready"), 150));

  // scroll: 0 at the top, 1 when the stage is about to leave
  let p = 0, open = 0;
  const update = () => {
    const r = hero.getBoundingClientRect();
    p = clamp(-r.top / (r.height - innerHeight));
    open = 1 - (1 - clamp(p / .6)) ** 2; // eases out as it reaches full screen
    stage.style.setProperty("--p", p.toFixed(4));
    stage.style.setProperty("--open", open.toFixed(4));
    stage.classList.toggle("end", p > .7);
  };
  let queued = false;
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; update(); }); } }, { passive: true });
  addEventListener("resize", update);
  update();

  // ---------- particles ----------
  const canvas = document.createElement("canvas");
  canvas.className = "particles";
  reel.append(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10); // set in pixels on resize
  const N = innerWidth < 760 ? 4200 : 9000;
  const pos = new Float32Array(N * 3), vel = new Float32Array(N * 2), col = new Float32Array(N * 3), size = new Float32Array(N), seed = new Float32Array(N);
  // dark mode: bone and copper glowing (additive); light mode: navy and copper inks on paper
  const PALETTES = {
    dark: [[.922, .882, .835], [.922, .882, .835], [.922, .882, .835], [.847, .78, .729], [.851, .51, .306], [.753, .384, .18]],
    light: [[.082, .098, .275], [.082, .098, .275], [.082, .098, .275], [.753, .384, .18], [.2, .216, .416], [.753, .384, .18]]
  };
  const pick = new Uint8Array(N);
  for (let i = 0; i < N; i++) { pick[i] = (Math.random() * 6) | 0; size[i] = 1.4 + Math.random() * 2.2; seed[i] = Math.random(); }
  const paint = () => {
    const light = document.documentElement.dataset.theme === "light", pal = PALETTES[light ? "light" : "dark"];
    for (let i = 0; i < N; i++) col.set(pal[pick[i]], i * 3);
    if (geo.attributes.color) geo.attributes.color.needsUpdate = true;
    mat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending; mat.needsUpdate = true;
  };
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(size, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { dpr: { value: renderer.getPixelRatio() } },
    vertexShader: `attribute float size; attribute vec3 color; varying vec3 vC; uniform float dpr;
      void main() { vC = color; gl_PointSize = size * dpr; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `varying vec3 vC;
      void main() { float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(vC, smoothstep(.5, .05, d) * .9); }`
  });
  scene.add(new THREE.Points(geo, mat));
  paint();
  addEventListener("themechange", () => { paint(); if (reduced) renderer.render(scene, camera); });

  // targets: points sampled from each word drawn on a hidden canvas, and a scattered field
  let W = 0, H = 0, shapes = [], field = null;
  const sample = word => {
    const bandH = Math.max(110, innerHeight * .18 - 20), maxW = W * (innerWidth < 760 ? .86 : .8);
    const c = document.createElement("canvas"), g = c.getContext("2d");
    let fs = bandH * 1.05;
    g.font = `italic 400 ${fs}px Gloock, Georgia, serif`;
    fs = Math.min(fs, fs * maxW / g.measureText(word).width);
    c.width = Math.ceil(maxW) + 40; c.height = Math.ceil(fs * 1.3);
    g.font = `italic 400 ${fs}px Gloock, Georgia, serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#fff";
    g.fillText(word, c.width / 2, c.height / 2);
    const d = g.getImageData(0, 0, c.width, c.height).data, pts = [], step = Math.max(2, Math.round(fs / 34));
    for (let y = 0; y < c.height; y += step) for (let x = 0; x < c.width; x += step) if (d[(y * c.width + x) * 4 + 3] > 140) pts.push(x - c.width / 2, c.height / 2 - y);
    return pts;
  };
  const build = () => {
    W = stage.clientWidth; H = stage.clientHeight;
    renderer.setSize(W, H, false);
    Object.assign(camera, { left: -W / 2, right: W / 2, top: H / 2, bottom: -H / 2 }); camera.updateProjectionMatrix();
    shapes = WORDS.map(sample);
    field = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()); field[i * 2] = Math.cos(a) * r * W * .62; field[i * 2 + 1] = Math.sin(a) * r * H * .62; }
  };
  const ready = document.fonts.load("italic 80px Gloock").catch(() => {}).then(() => {
    build();
    for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * W; pos[i * 3 + 1] = (Math.random() - .5) * H; }
  });
  addEventListener("resize", () => ready.then(build));

  // pointer, in the same pixel space (y up, origin at the centre)
  const ptr = { x: 9e9, y: 9e9 };
  stage.addEventListener("pointermove", e => { const r = stage.getBoundingClientRect(); ptr.x = e.clientX - r.left - W / 2; ptr.y = H / 2 - (e.clientY - r.top); });
  stage.addEventListener("pointerleave", () => { ptr.x = ptr.y = 9e9; });

  let word = 0, nextAt = performance.now() + HOLD, visible = true;
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(stage);
  const tick = now => {
    requestAnimationFrame(tick);
    if (!visible || !shapes.length) return;
    if (now > nextAt) { word = (word + 1) % WORDS.length; nextAt = now + HOLD; }
    const pts = shapes[word], n = pts.length / 2, spread = smooth(clamp((open - .45) / .5)), t = now / 1000;
    for (let i = 0; i < N; i++) {
      const k = (i % n) * 2, ix = i * 3;
      // the word, with spare particles shimmering just around it, blended towards the open field
      const wob = i >= n ? 6 : 0, s = seed[i] * 6.28;
      let tx = pts[k] + Math.cos(t * 1.3 + s) * wob, ty = pts[k + 1] + Math.sin(t * 1.1 + s) * wob;
      tx += (field[i * 2] + Math.cos(t * .2 + s) * 30 - tx) * spread;
      ty += (field[i * 2 + 1] + Math.sin(t * .17 + s) * 30 - ty) * spread;
      let vx = vel[i * 2], vy = vel[i * 2 + 1];
      vx += (tx - pos[ix]) * .022; vy += (ty - pos[ix + 1]) * .022;
      const dx = pos[ix] - ptr.x, dy = pos[ix + 1] - ptr.y, d2 = dx * dx + dy * dy, R = 130;
      if (d2 < R * R) { const f = (1 - Math.sqrt(d2) / R) * 4.5 / (Math.sqrt(d2) + .1); vx += dx * f; vy += dy * f; }
      vx *= .86; vy *= .86;
      vel[i * 2] = vx; vel[i * 2 + 1] = vy;
      pos[ix] += vx; pos[ix + 1] += vy;
    }
    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  };
  if (reduced) ready.then(() => { const pts = shapes[0], n = pts.length / 2; for (let i = 0; i < N; i++) { pos[i * 3] = pts[(i % n) * 2]; pos[i * 3 + 1] = pts[(i % n) * 2 + 1]; } geo.attributes.position.needsUpdate = true; renderer.render(scene, camera); });
  else ready.then(() => requestAnimationFrame(tick));
}
