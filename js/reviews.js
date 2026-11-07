// Reviews as a house of cards. Click it: the cards fall, the view swings down to the table, and
// approved client reviews land face-up among the rest. Only approved reviews are ever shown
// (row level security); new ones wait for an admin in the studio panel.
// Review text is user-written, so it goes in with textContent only.
import { supabase, pageUrl } from "./supabase.js";

const CW = 118, CH = 165, LEAN = 17 * Math.PI / 180;
const RANKS = ["A", "K", "Q", "J", "10", "9", "8"], SUITS = [["♥", true], ["♠", false], ["♦", true], ["♣", false]];
const DRAFT = "cc-review-draft";
const C_SVG = `<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M50.5 12.5C46 8.6 40.2 6.5 33.6 6.5 19 6.5 6.5 17.9 6.5 32.6S18.7 58.5 33.4 58.5c6.9 0 12.9-2.4 17.4-6.6l-3.4-5.2c-3.5 3-7.7 4.6-12.4 4.6-9.6 0-16-8.3-16-18.6S25.3 13.8 34.8 13.8c3.9 0 7.4 1.2 10.2 3.4l2.2 6.2h3.3z"/><circle cx="50.6" cy="51" r="3.1" fill="#D9824E"/><text x="36" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="25" fill="#D9824E">&amp;</text></svg>`;

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
    mid.append(el("div", "rv-pip rv-red", "♥"), el("p", "rv-quote", "No reviews yet. Worked with us? Yours could be the first."), el("div", "rv-co", "Leave a review below"));
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
  const shown = reviews?.length ? reviews : [null]; // no reviews yet: one card says so

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
