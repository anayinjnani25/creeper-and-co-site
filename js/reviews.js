// Reviews as a house of cards. Click it: the cards fall, the view swings down to the table, and
// approved client reviews land face-up among the rest. Only approved reviews are ever shown
// (row level security); new ones wait for an admin in the studio panel.
// Review text is user-written, so it goes in with textContent only.
import { supabase, pageUrl } from "./supabase.js";

const CW = 118, CH = 165, LEAN = 17 * Math.PI / 180;
const RANKS = ["A", "K", "Q", "J", "10", "9", "8"], SUITS = [["♥", true], ["♠", false], ["♦", true], ["♣", false]];
const DRAFT = "cc-review-draft";
const C_SVG = `<svg viewBox="0 0 392 296" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M162.6,288.1c-31.2,0 -58.6,-5.8 -82.1,-17.5c-23.5,-11.6 -41.8,-28 -54.9,-49.1c-13.1,-21.1 -19.6,-45.7 -19.6,-73.8c0,-28.3 6.5,-52.9 19.6,-73.8c13.1,-20.9 31.6,-37.1 55.6,-48.6c24,-11.5 52.4,-17.3 85.3,-17.3c7.9,0 14.5,0.3 19.8,0.9c5.3,0.6 10.2,1.3 14.8,2c4.6,0.7 9.8,1.4 15.7,2c5.9,0.6 13.3,0.9 22.1,0.9l7.2,48c0,0.1 0,0.1 0,0.2c-0.1,0.6 -0.1,1.2 -0.1,1.9c0,0.6 0.1,1.1 0.1,1.6c0.1,1.3 0.3,2.6 0.7,3.7c0.2,0.6 0.4,1.3 0.7,1.9l2.2,14.7h-3.6c-2.6,-14.2 -7.9,-26.7 -15.7,-37.6c-7.8,-10.9 -17.5,-19.6 -29.2,-25.9c-11.6,-6.4 -24.5,-9.5 -38.7,-9.5c-13.9,0 -26.8,3.4 -38.5,10.1c-11.8,6.7 -21.8,16.1 -30.2,28.1c-8.4,12.2 -14.9,26.8 -19.6,43.7c-4.7,16.9 -7,35.5 -7,55.6c0,26.6 4.1,49.9 12.2,69.7c8.2,19.8 19.7,35.2 34.6,46.1c8.6,6.3 18.2,10.8 28.6,13.5l0.4,3c0,0 0.1,0 0.1,0l0.1,0.8c0.1,0 0.2,0 0.3,0l0.1,0.8c0.2,0 0.3,0 0.5,0l0.1,0.7c0.2,0 0.4,0 0.6,0l0.1,0.6c0.2,0 0.5,0 0.7,0l0.1,0.4c0.3,0 0.5,0 0.8,0l0,0.3c0.3,0 0.6,0 0.9,0l0,0.1c9.2,0 17.5,0.4 24.9,1.1c1.4,0.1 2.8,0.3 4.1,0.5c0.1,0 0.3,0 0.4,0c-4.5,0.3 -9.2,0.4 -14.2,0.4zM223.6,261.6c15,-13.8 24.3,-33.1 27.9,-57.8h3.6l-9.7,71.9c-3.3,0.7 -6.6,1.2 -10.1,1.6c-3.2,0.3 -6.5,0.5 -9.8,0.5c-3.4,0 -6.8,-0.2 -10,-0.5c-4.3,-0.4 -8.5,-1.2 -12.6,-2.2c7.6,-3.3 14.4,-7.9 20.6,-13.6zM202.3,286.5c-8,-1.1 -16.4,-2.2 -25,-3.2c-8.6,-1.1 -18.6,-1.6 -29.9,-1.6l-5.2,-38.9c0.5,-0.6 0.8,-1.2 1.2,-1.9c0.5,-0.9 0.9,-1.8 1.1,-2.8c0.3,-0.9 0.5,-1.9 0.6,-3c0.1,-0.6 0.1,-1.2 0.1,-1.8c0,-0.7 0,-1.4 -0.1,-2c-0.1,-1.2 -0.3,-2.4 -0.7,-3.5c-0.3,-1.1 -0.7,-2.1 -1.2,-3c-0.1,-0.3 -0.3,-0.5 -0.4,-0.8c-1.1,-1.9 -2.3,-4 -3.4,-6c-0.2,-0.4 -0.4,-0.9 -0.6,-1.4l-0.7,-5.2c0,-0.5 0,-1.1 0.1,-1.6c0.2,-1.5 0.5,-2.9 0.9,-4.4c0,-0.1 0.1,-0.3 0.1,-0.4c0.1,-0.4 0.3,-0.7 0.4,-1.1h1.1c3.6,24.7 12.9,44 27.9,57.8c15,13.8 34,20.7 57.1,20.7c20.2,0 37.7,-5.5 52.6,-16.4c14.9,-10.9 26.4,-26.3 34.6,-46.1c8.2,-19.8 12.2,-43 12.2,-69.7c0,-20.2 -2.3,-38.7 -7,-55.6c-4.7,-16.9 -11.2,-31.5 -19.6,-43.7c-8.4,-12 -18.5,-21.4 -30.2,-28.1c-7.7,-4.4 -15.9,-7.4 -24.6,-8.9l-0.1,-1c0,0 -0.1,0 -0.1,0l-0.1,-0.8c-0.1,0 -0.2,0 -0.3,0l-0.1,-0.8c-0.2,0 -0.3,0 -0.5,0l-0.1,-0.7c-0.2,0 -0.4,0 -0.6,0l-0.1,-0.6c-0.2,0 -0.5,0 -0.7,0l-0.1,-0.4c-0.3,0 -0.5,0 -0.8,0l0,-0.3c-0.3,0 -0.6,0 -0.9,0l0,-0.1c-8.5,0 -15.5,-0.3 -21.3,-0.8c-0.8,-0.1 -1.6,-0.2 -2.3,-0.2c3.1,-0.1 6.6,-0.2 10.3,-0.2c32.9,0 61.3,5.8 85.3,17.3c24,11.5 42.5,27.7 55.6,48.6c13.1,20.9 19.6,45.5 19.6,73.8c0,28.1 -6.5,52.7 -19.6,73.8c-13.1,21.1 -31.4,37.5 -54.9,49.1c-23.5,11.6 -50.9,17.5 -82.1,17.5c-10.1,0 -19.1,-0.5 -27.2,-1.6zM161.7,48.1c-7.8,10.9 -13,23.5 -15.7,37.6h-3.6l10.2,-68c0.8,-0.1 1.5,-0.2 2.3,-0.3c2.5,-0.2 5.1,-0.4 7.7,-0.4c2.8,0 5.6,0.1 8.4,0.4c5,0.5 9.9,1.5 14.6,2.9c1.8,0.5 3.5,1.2 5.2,1.8c-11.6,6.4 -21.3,15 -29.1,25.9z"/><path fill="var(--tangerine,#D9824E)" fill-rule="evenodd" d="M222.9,175.8v0c0.1,-2.7 -0.2,-5 -0.8,-7c-0.6,-2 -1.2,-4 -1.8,-6c-0.6,-2 -0.9,-4.4 -0.8,-7.1v0c0.1,-2.5 0.9,-4.9 2.4,-7.2c1.5,-2.3 3.6,-4.3 6.2,-5.8c2.7,-1.5 5.8,-2.3 9.5,-2.3v0c5.1,0 9.2,1.5 12.4,4.4c3.2,2.9 4.7,7.3 4.6,13.2v0c-0.2,6.3 -1.8,12.3 -4.9,18.1c-3.1,5.8 -7.5,11 -13.3,15.6c-5.7,4.5 -12.7,8.1 -20.8,10.7c-8.1,2.6 -17.3,4 -27.6,4v0c-13.9,0 -25.2,-2.5 -33.9,-7.4v0c-4,-2.2 -7.4,-4.8 -10.3,-7.8v0c-1.3,1.2 -2.4,2.4 -3.4,3.6v0c-2.4,2.9 -4.1,5.8 -5,8.6c-0.9,2.8 -1.4,5.6 -1.4,8.4v0c0,3.1 0.6,5.8 1.8,8c1.2,2.2 2.4,4.3 3.6,6.4c1.2,2 1.8,4.4 1.8,7v0c0.1,3.5 -1.3,6.6 -4.1,9.2c-2.8,2.6 -6.3,3.9 -10.6,4v0c-4.7,0.1 -8.6,-1.5 -11.7,-4.6c-3.1,-3.2 -4.7,-7.8 -4.8,-13.9v0c0,-6.5 2.3,-13.5 7,-20.9v0c4.4,-6.9 11.8,-14.1 22.2,-21.8v0c-1.4,-2.1 -2.6,-4.4 -3.5,-6.9v0c-3.5,-8.8 -4.2,-18.9 -2.1,-30.4v0c1.6,-8.6 4.6,-16.5 9.1,-23.6c4.5,-7.1 10.1,-13.3 16.8,-18.4c6.7,-5.1 14.3,-9.1 22.6,-11.9c8.3,-2.8 17.1,-4.2 26.3,-4.2v0c7.7,0 14.6,1.2 20.7,3.5c6,2.4 10.7,5.6 14,9.6v0c0.6,0.7 1.1,1.4 1.6,2.1v0c2.8,-2.2 5.1,-4.3 6.8,-6.4v0c1.9,-2.2 3.2,-4.4 4.1,-6.7c0.8,-2.2 1.2,-4.6 1.1,-7v0c0,-3.1 -0.6,-5.7 -1.7,-8c-1.1,-2.2 -2.2,-4.4 -3.3,-6.4c-1.1,-2 -1.6,-4.3 -1.7,-6.7v0c-0.1,-3.6 1.3,-6.8 4.2,-9.6c2.8,-2.8 6.6,-4.2 11.4,-4.2v0c5,-0.1 9,1.4 11.9,4.6c2.9,3.2 4.4,7.6 4.5,13.1v0c0,4.5 -1,8.9 -3.1,13.2c-2.1,4.3 -5.3,8.8 -9.8,13.3c-4.5,4.6 -10.4,9.6 -17.7,15v0l-3.9,3c0.1,1.3 0.2,2.5 0.1,3.8v0c-0.1,2.9 -0.8,5.2 -1.9,7.1c-1.2,1.9 -3.2,3 -6,3.3v0c-4.5,0.3 -9.3,1.7 -14.5,4v0c-1.6,0.7 -3.3,1.6 -5.1,2.6v0l-47.7,36.1c0.2,1.1 0.4,2.2 0.7,3.3v0c1.7,7.7 4.8,13.4 9.3,17.2c4.5,3.8 10,5.8 16.5,5.8v0c3.3,0 6.3,-0.4 9.2,-1.3c2.8,-0.9 5.3,-2.2 7.5,-3.9c2.2,-1.7 3.9,-3.8 5.2,-6.2c1.3,-2.4 2,-5.2 2.1,-8.2zM171.7,160.5v0l37.7,-28.6c0.7,-3.4 1.2,-7.5 1.6,-12.4v0c0.5,-7 -0.2,-12.1 -1.9,-15.4c-1.8,-3.3 -4.5,-4.9 -8.2,-4.9v0c-3.9,0 -7.6,1.6 -11.3,4.8c-3.7,3.2 -7,8.2 -10,14.8c-2.9,6.6 -5.1,15 -6.6,25.1v0c-0.9,6.1 -1.4,11.6 -1.3,16.6z"/></svg>`;

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
function toast(text) { const t = el("div", "toast", text); t.setAttribute("role", "status"); document.body.append(t); setTimeout(() => t.remove(), 6000); }

// ---------- where each card stands in the house, and where it lands ----------
function house() {
  const out = [], step = 2 * CH * Math.sin(LEAN) + 16, h = CH * Math.cos(LEAN), lift = h + 6;
  for (let L = 0; L < 3; L++) {
    const n = 3 - L, y0 = -L * lift;
    for (let i = 0; i < n; i++) {
      const cx = (i - (n - 1) / 2) * step;
      for (const d of [-1, 1]) out.push({ L, t: `translate3d(${cx + d * CH * Math.sin(LEAN) / 2}px, ${y0 - h / 2}px, 0) rotateZ(${-d * LEAN}rad) rotateY(-90deg)` }); // stands edge-on, back towards the viewer's side
    }
    for (let i = 0; i < n - 1; i++) {
      const cx = (i + .5 - (n - 1) / 2) * step;
      out.push({ L, t: `translate3d(${cx}px, ${y0 - h - 3}px, 0) rotateX(90deg) rotateZ(90deg) rotateY(180deg)` });
    }
  }
  return out; // 15 cards, bottom level first
}
function landing(count, faceUp, narrow) {
  const k = narrow ? 1.2 : 1.45; // reviews are blown up so they can be read from above
  const spots = [], cols = narrow ? 2 : Math.min(faceUp, 4) || 1, rows = Math.ceil(faceUp / cols);
  for (let i = 0; i < faceUp; i++) {
    const c = i % cols, r = Math.floor(i / cols), inRow = Math.min(cols, faceUp - r * cols);
    spots.push({ x: (c - (inRow - 1) / 2) * 150 * k, z: (r - (rows - 1) / 2) * 200 * k, r: (Math.random() - .5) * 10, up: true, k });
  }
  for (let i = faceUp; i < count; i++) { // the rest scatter face-down around them
    const a = (i * 2.4) % (Math.PI * 2), rad = (narrow ? 330 : 470) + (i % 3) * 60;
    spots.push({ x: Math.cos(a) * rad * (narrow ? .75 : 1.25), z: Math.sin(a) * rad * .75, r: Math.random() * 360, up: false, k: 1 });
  }
  // face-up reviews always land on top of the face-down cards
  return spots.map((s, i) => ({ ...s, t: `translate3d(${s.x}px, ${s.up ? -12 : -1 - i * .3}px, ${s.z}px) rotateX(90deg) rotateZ(${s.r}deg) scale3d(${s.k}, ${s.k}, 1)${s.up ? "" : " rotateY(180deg)"}` }));
}

function face(review, i) {
  const [suit, red] = SUITS[i % 4], rank = RANKS[i % RANKS.length];
  const f = el("div", "rv-face");
  const idx = cls => { const d = el("div", `rv-idx ${cls}${red ? " rv-red" : ""}`); d.append(el("b", null, rank), el("i", null, suit)); return d; };
  const mid = el("div", "rv-mid");
  if (review) {
    mid.append(el("div", "rv-stars", "★".repeat(review.rating) + "☆".repeat(5 - review.rating)), el("p", "rv-quote", `“${review.body}”`), el("div", "rv-name", review.display_name));
    if (review.company) mid.append(el("div", "rv-co", review.company));
  } else {
    mid.append(el("div", "rv-pip rv-red", "♥"), el("p", "rv-quote", "This card is saved for your words. Worked with us? Tell the next client how it went."), el("div", "rv-co", "Leave a review below"));
  }
  f.append(idx("tl"), mid, idx("br"));
  return f;
}

export async function mountReviews() {
  const sec = document.getElementById("reviews");
  if (!sec) return;
  const stage = sec.querySelector(".rv-stage"), world = sec.querySelector(".rv-world");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const { data: reviews } = await supabase.from("reviews")
    .select("id, display_name, company, rating, body, created_at").eq("status", "approved")
    .order("created_at", { ascending: false }).limit(8);
  const shown = reviews?.length ? reviews : [null]; // no reviews yet: one card invites the first
  if (!reviews?.length) {   // until the first one is approved, the section asks rather than reports
    sec.querySelector(".rv-title").textContent = "Your words";
    sec.querySelector(".rv-sub").textContent = "Worked with us? Tell the next client how it went.";
  }

  const spots = house();
  const cards = spots.map((s, i) => {
    const c = el("div", "rv-card"), inner = el("div", "rv-in"), back = el("div", "rv-back");
    back.innerHTML = C_SVG; // fixed markup, no user text
    inner.append(face(i < shown.length ? shown[i] : null, i), back);
    c.append(inner);
    c.style.transform = s.t;
    world.append(c);
    return c;
  });

  // seen from the side as a real pyramid, swinging round a little as it comes into view; then it falls
  const view = (y, x) => `translateY(calc(250px * var(--s))) scale(var(--s)) rotateX(${x}deg) rotateY(${y}deg)`;
  const VIEW_IN = view(-78, -10), VIEW_UP = view(-38, -16);
  const VIEW_DOWN = `translateY(30px) scale(var(--s)) rotateX(-78deg) rotateY(0deg)`;
  world.style.transform = reduced ? VIEW_UP : VIEW_IN;
  let spread = false, anims = [], intro = null, auto = null;
  // start once the visitor has actually scrolled down to the cards (not during loading, when the page is still short)
  const startIntro = () => {
    const r = stage.getBoundingClientRect();
    if (spread || !document.querySelector(".loader.done") || r.top > innerHeight * .55 || r.bottom < innerHeight * .3) return;
    removeEventListener("scroll", startIntro);
    if (reduced) return;
    intro = world.animate([{ transform: VIEW_IN }, { transform: VIEW_UP }], { duration: 2600, easing: "cubic-bezier(.3,.1,.2,1)", fill: "forwards" });
    auto = setTimeout(knock, 3600); // the pyramid holds for a moment, then all the cards come down
  };
  addEventListener("scroll", startIntro, { passive: true });
  startIntro();

  function knock() {
    if (spread) return;
    clearTimeout(auto); intro?.cancel(); intro = null; world.style.transform = VIEW_UP;
    spread = true; stage.classList.add("spread"); stage.setAttribute("aria-expanded", "true");
    const narrow = matchMedia("(max-width: 760px)").matches;
    const land = landing(cards.length, Math.min(shown.length, narrow ? 4 : 8), narrow);
    anims = [world.animate([{ transform: VIEW_UP }, { transform: VIEW_DOWN }], { duration: reduced ? 1 : 1500, delay: reduced ? 0 : 350, easing: "cubic-bezier(.65,0,.25,1)", fill: "forwards" })];
    cards.forEach((card, i) => {
      const from = spots[i], to = land[i], top = 2 - from.L;
      const mid = `translate3d(${to.x * .4}px, ${-120 - Math.random() * 80}px, ${to.z * .4}px) rotateX(${40 + Math.random() * 60}deg) rotateZ(${(Math.random() - .5) * 140}deg)${to.up ? "" : " rotateY(180deg)"}`;
      anims.push(card.animate([
        { transform: from.t, easing: "cubic-bezier(.5,0,.9,.4)" },
        { transform: mid, offset: .42, easing: "cubic-bezier(.2,.6,.3,1)" },
        { transform: to.t }
      ], { duration: reduced ? 1 : 1250, delay: reduced ? 0 : top * 110 + Math.random() * 160, fill: "forwards" }));
    });
    sec.querySelector("#rvRestack").classList.remove("hidden");
  }
  function restack() {
    if (!spread) return;
    anims.forEach(a => a.reverse());
    Promise.all(anims.map(a => a.finished)).then(() => { anims.forEach(a => a.cancel()); anims = []; });
    spread = false; stage.classList.remove("spread"); stage.setAttribute("aria-expanded", "false");
    sec.querySelector("#rvRestack").classList.add("hidden");
  }
  stage.addEventListener("click", knock);
  stage.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); knock(); } });
  sec.querySelector("#rvRestack").addEventListener("click", restack);

  // screen readers get the reviews as a plain list
  const list = sec.querySelector(".rv-list");
  list.replaceChildren(...(reviews?.length ? reviews.map(r => el("li", null, `${r.rating} out of 5. “${r.body}” ${r.display_name}${r.company ? ", " + r.company : ""}`)) : [el("li", null, "No reviews yet.")]));

  // ---------- leave a review ----------
  const dlg = document.getElementById("rvDialog"), form = dlg.querySelector("form");
  const { data: { session } } = await supabase.auth.getSession();
  const open = async () => {
    if (session && !form.elements.display_name.value) {
      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", session.user.id).single();
      form.elements.display_name.value = p?.full_name ?? "";
    }
    dlg.querySelector(".rv-signin").classList.toggle("hidden", !!session);
    dlg.showModal();
  };
  sec.querySelector("#rvWrite").addEventListener("click", open);
  dlg.querySelector("[data-close]").addEventListener("click", () => dlg.close());
  const submit = async d => {
    const btn = form.querySelector("[type=submit]"); btn.disabled = true;
    const { error } = await supabase.from("reviews").insert({
      display_name: d.display_name.trim(), company: d.company.trim() || null, rating: Number(d.rating), body: d.body.trim()
    });
    btn.disabled = false;
    if (error) return toast(error.message);
    try { sessionStorage.removeItem(DRAFT); } catch {}
    form.reset(); dlg.close();
    toast("Thank you! Your review will show up once we've approved it.");
  };
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (session) return submit(d);
    try { sessionStorage.setItem(DRAFT, JSON.stringify(d)); } catch {}
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: pageUrl("index.html?review=1"), queryParams: { prompt: "select_account" } } });
    if (error) toast(error.message);
  });
  // back from Google with a saved review: send it
  if (new URLSearchParams(location.search).has("review")) {
    history.replaceState(null, "", location.pathname + "#reviews");
    let d = null; try { d = JSON.parse(sessionStorage.getItem(DRAFT)); } catch {}
    sec.scrollIntoView({ block: "start" });
    if (session && d?.body) submit(d);
  }
}
