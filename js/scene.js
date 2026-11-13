// Shared look-and-feel for the portal pages: the site's 3D ring tunnel (with the morphing blob on the
// login page), the dot + ring cursor and magnetic buttons. Same shapes and colours as the homepage hero.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover)").matches;
const mouse = { x: 0, y: 0 };
addEventListener("pointermove", e => {
  mouse.x = e.clientX / innerWidth * 2 - 1;
  mouse.y = -(e.clientY / innerHeight * 2 - 1);
});

export function mountScene(canvas, { blob = false, blobAt = [2.2, .3] } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
  camera.position.set(0, 0, 7);
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas); resize();

  const focus = new THREE.Group();
  scene.add(focus);

  let blobMat = null;
  if (blob) {
    blobMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        uniform float uTime;
        varying vec3 vN; varying vec3 vView; varying float vD;
        void main() {
          vec3 p = position;
          float d = sin(p.x * 1.8 + uTime * .9) * sin(p.y * 2.1 + uTime * 1.1) * sin(p.z * 1.6 + uTime * .7);
          d += .5 * sin(p.y * 4.0 + uTime * 1.7) * sin(p.x * 3.5 - uTime);
          d *= .3;
          p += normal * d;
          vD = d;
          vN = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vView = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vN; varying vec3 vView; varying float vD;
        void main() {
          vec3 n = normalize(vN), v = normalize(vView);
          float fres = pow(1.0 - max(dot(n, v), 0.0), 2.2);
          vec3 deep = vec3(.082, .098, .275), violet = vec3(.753, .384, .18);
          vec3 lav = vec3(.922, .882, .835), tang = vec3(.851, .51, .306);
          float band = .5 + .5 * sin(vD * 14.0 + n.y * 4.0 + uTime * .6);
          vec3 col = mix(deep, violet, smoothstep(-.6, .9, n.y + vD * 2.0));
          col = mix(col, lav, band * .25);
          col += tang * pow(fres, 1.5) * .9 + lav * fres * .35;
          gl_FragColor = vec4(col, 1.0);
        }`
    });
    focus.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 48), blobMat));
  }

  const rings = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(2.3 + i * .75, .01 + i * .002, 8, 160),
      new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xD9824E : 0xC46A38, transparent: true, opacity: .5 - i * .045 })
    );
    m.position.z = -i * .9;
    rings.add(m);
  }
  focus.add(rings);

  const N = 1400, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 6 + Math.random() * 18, t = Math.random() * Math.PI * 2, u = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(u) * Math.cos(t); pos[i * 3 + 1] = r * Math.sin(u) * Math.sin(t); pos[i * 3 + 2] = r * Math.cos(u) - 6;
  }
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xD8C7BA, size: .035, transparent: true, opacity: .8 }));
  scene.add(stars);

  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (document.hidden) return;
    const t = reduced ? 0 : clock.getElapsedTime();
    const wide = camera.aspect > 1;
    focus.position.set(wide ? blobAt[0] : 0, wide ? blobAt[1] : 1.4, 0);
    if (blobMat) {
      blobMat.uniforms.uTime.value = t;
      focus.children[0].rotation.set(mouse.y * .3, t * .15 + mouse.x * .4, 0);
    }
    rings.children.forEach((r, i) => { r.rotation.z = t * (.05 + i * .01) * (i % 2 ? -1 : 1); r.position.z = -i * .9 + ((t * .6) % .9); });
    rings.rotation.set(mouse.y * .15, mouse.x * .2, 0);
    stars.rotation.y = t * .01;
    camera.position.x += (mouse.x * .5 - camera.position.x) * .04;
    camera.position.y += (mouse.y * .3 - camera.position.y) * .04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  })();
}

// Dot + ring cursor and magnetic buttons, as on the homepage
export function mountCursor() {
  if (!finePointer) return;
  const dot = Object.assign(document.createElement("div"), { className: "cursor" });
  const ring = Object.assign(document.createElement("div"), { className: "cursor-ring" });
  document.body.append(dot, ring);
  let rx = 0, ry = 0, dx = 0, dy = 0;
  addEventListener("pointermove", e => { dx = e.clientX; dy = e.clientY; dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%,-50%)`; });
  (function follow() {
    rx += (dx - rx) * .18; ry += (dy - ry) * .18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(follow);
  })();
  // Delegated so it also works for list items and buttons added later
  document.addEventListener("pointerover", e => ring.classList.toggle("hover", !!e.target.closest("a, button, input, textarea, select, label")));
  document.addEventListener("pointermove", e => {
    const b = e.target.closest(".magnetic");
    document.querySelectorAll(".magnetic").forEach(m => { if (m !== b) m.style.transform = ""; });
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
  });
}
