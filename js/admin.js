// Studio admin panel. Who may read or change what is enforced by row level security in Supabase
// (admins can read every request, profile and message); this file only draws it.
// All user-written text goes in with textContent, never innerHTML.
import { supabase, pageUrl } from "./supabase.js";

const $ = id => document.getElementById(id);
const LABEL = {
  category: { new_project: "New project", change_request: "Change request", bug: "Bug", question: "Question" },
  status: { open: "Open", in_progress: "In progress", waiting_on_client: "Waiting on client", resolved: "Resolved", closed: "Closed" },
  priority: { low: "Low", normal: "Normal", high: "High", urgent: "Urgent" }
};
const STATUSES = Object.keys(LABEL.status);
const CAT_COLOR = { new_project: "#D9824E", change_request: "#6A4BD1", bug: "#D2483F", question: "#CDBEF5" };
const active = s => s !== "resolved" && s !== "closed";
const DAY = 864e5, HOUR = 36e5;

// ---------- session: admins only ----------
const { data: { session } } = await supabase.auth.getSession();
if (!session) { location.replace(pageUrl("index.html#contact")); await new Promise(() => {}); }
supabase.auth.onAuthStateChange(e => { if (e === "SIGNED_OUT") location.replace(pageUrl("index.html")); });
const { data: me } = await supabase.from("profiles").select("id, email, full_name, avatar_url, role").eq("id", session.user.id).single();
if (me?.role !== "admin") { location.replace(pageUrl("portal.html")); await new Promise(() => {}); }

// ---------- helpers ----------
function el(tag, props = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  n.append(...kids.flat(Infinity).filter(k => k != null && k !== false));
  return n;
}
const NS = "http://www.w3.org/2000/svg";
function sv(tag, attrs = {}, ...kids) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
  n.append(...kids.flat(Infinity).filter(Boolean));
  return n;
}
const icon = d => { const s = sv("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }); s.innerHTML = d; return s; }; // fixed icon paths only
const I = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  down: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>'
};
function toast(text, bad = false) {
  const t = el("div", { class: "toast" + (bad ? " bad" : ""), role: "status", text });
  document.body.append(t); setTimeout(() => t.remove(), 3800);
}
const who = p => p ? (p.full_name || p.email) : "Unknown";
const initials = p => who(p).split(/[\s@.]+/).filter(Boolean).map(s => s[0]).join("").slice(0, 2).toUpperCase();
function avatar(p, cls = "") {
  if (p?.avatar_url?.startsWith("https://")) return el("img", { class: `av ${cls}`, src: p.avatar_url, alt: "", referrerpolicy: "no-referrer" });
  return el("span", { class: `av ${cls}`, text: initials(p), "aria-hidden": "true" });
}
function rel(iso) {
  const d = Date.now() - new Date(iso);
  if (d < 6e4) return "just now";
  if (d < HOUR) return `${Math.floor(d / 6e4)} min ago`;
  if (d < DAY) return `${Math.floor(d / HOUR)} hr ago`;
  if (d < 2 * DAY) return "yesterday";
  if (d < 7 * DAY) return `${Math.floor(d / DAY)} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
const fmtDate = iso => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const fmtWhen = iso => new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const fmtTime = iso => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
const hrs = ms => ms < HOUR ? `${Math.max(1, Math.round(ms / 6e4))} min` : ms < 2 * DAY ? `${(ms / HOUR).toFixed(ms < 10 * HOUR ? 1 : 0)} hr` : `${(ms / DAY).toFixed(1)} days`;
const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const statusEl = s => el("span", { class: `status s-${s}` }, el("span", { text: LABEL.status[s] }));
const prioTag = p => el("span", { class: "tag" + (p === "urgent" ? " hot" : p === "high" ? " warm" : ""), text: LABEL.priority[p] });
function change(now, before, { invert = false, suffix = "%" } = {}) {
  if (!before && !now) return el("span", { class: "chg flat", text: "—" });
  if (!before) return el("span", { class: "chg", text: "new" });
  const pct = Math.round((now - before) / before * 100);
  const good = invert ? pct <= 0 : pct >= 0;
  return el("span", { class: "chg" + (pct === 0 ? " flat" : good ? "" : " down"), text: `${pct > 0 ? "↑" : pct < 0 ? "↓" : ""} ${Math.abs(pct)}${suffix}` });
}

// ---------- data ----------
const S = { tickets: [], people: new Map(), msgs: [], admins: [], reviews: [] };
async function load() {
  const [t, p, m, rv] = await Promise.all([
    supabase.from("tickets").select("id, title, description, category, status, priority, assigned_to, created_by, created_at, updated_at").order("updated_at", { ascending: false }).limit(2000),
    supabase.from("profiles").select("id, email, full_name, avatar_url, role, created_at").limit(5000),
    supabase.from("ticket_messages").select("id, ticket_id, author_id, body, is_internal, created_at").order("created_at").limit(10000),
    supabase.from("reviews").select("id, author_id, display_name, company, rating, body, status, created_at").order("created_at", { ascending: false }).limit(1000)
  ]);
  const err = t.error || p.error || m.error || rv.error;
  if (err) { toast(err.message, true); return; }
  S.people = new Map(p.data.map(x => [x.id, x]));
  S.admins = p.data.filter(x => x.role === "admin");
  S.msgs = m.data;
  S.reviews = rv.data;
  $("c-reviews").textContent = S.reviews.filter(x => x.status === "pending").length;
  const by = new Map();
  for (const x of S.msgs) (by.get(x.ticket_id) ?? by.set(x.ticket_id, []).get(x.ticket_id)).push(x);
  S.tickets = t.data.map(x => {
    const msgs = by.get(x.id) ?? [];
    const pub = msgs.filter(y => !y.is_internal);
    const last = pub.at(-1);
    const firstStaff = pub.find(y => S.people.get(y.author_id)?.role === "admin");
    return Object.assign(x, {
      client: S.people.get(x.created_by), msgs, last,
      lastAt: [x.updated_at, last?.created_at].filter(Boolean).sort().at(-1),
      needsReply: active(x.status) && (!last || S.people.get(last.author_id)?.role !== "admin"),
      firstReplyMs: firstStaff ? new Date(firstStaff.created_at) - new Date(x.created_at) : null
    });
  }).sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  const needs = S.tickets.filter(x => x.needsReply).length;
  $("c-projects").textContent = S.tickets.filter(x => active(x.status)).length;
  $("c-messages").textContent = needs;
  $("bellDot").classList.toggle("hidden", !needs);
  $("d-badge").textContent = needs; $("d-badge").classList.toggle("hidden", !needs);
}
const clients = () => [...S.people.values()].filter(p => p.role !== "admin").map(p => {
  const reqs = S.tickets.filter(t => t.created_by === p.id);
  return { ...p, reqs, open: reqs.filter(t => active(t.status)).length, lastAt: reqs[0]?.lastAt ?? p.created_at };
}).sort((a, b) => b.lastAt.localeCompare(a.lastAt));

async function updateTicket(id, patch, note = "Saved") {
  const { error } = await supabase.from("tickets").update(patch).eq("id", id);
  if (error) return toast(error.message, true);
  toast(note); await refresh();
}
async function sendMessage(ticketId, body, internal) {
  const { error } = await supabase.from("ticket_messages").insert({ ticket_id: ticketId, body, is_internal: internal });
  if (error) { toast(error.message, true); return false; }
  await refresh(); return true;
}

// ---------- header ----------
$("me").replaceWith(Object.assign(avatar(me, "me"), { id: "me", title: who(me) }));
function drawTeam() {
  const t = $("team"); t.replaceChildren(...S.admins.slice(0, 4).map(a => Object.assign(avatar(a), { title: who(a) })));
  if (S.admins.length > 4) t.append(el("span", { class: "av", text: `+${S.admins.length - 4}` }));
}
$("d-out").addEventListener("click", () => supabase.auth.signOut());
$("d-refresh").addEventListener("click", async () => { await refresh(); toast("Up to date"); });
$("d-inbox").addEventListener("click", () => { msgFilter = "needs"; location.hash = "#/messages"; });
$("bell").addEventListener("click", () => { msgFilter = "needs"; location.hash = "#/messages"; });
$("d-theme").addEventListener("click", () => {
  const light = document.documentElement.dataset.theme !== "light";
  if (light) document.documentElement.dataset.theme = "light"; else delete document.documentElement.dataset.theme;
  try { localStorage.setItem("cc-admin-theme", light ? "light" : "dark"); } catch (e) {}
});

// ---------- small charts ----------
function miniBars(vals) {
  const max = Math.max(1, ...vals), w = 16, gap = 6, h = 52;
  return sv("svg", { width: vals.length * (w + gap), height: h, "aria-hidden": "true" },
    vals.map((v, i) => [sv("rect", { x: i * (w + gap), y: 0, width: w, height: h, rx: 8, style: "fill:rgba(255,255,255,.12)" }),
      sv("rect", { x: i * (w + gap), y: h - Math.max(10, v / max * h), width: w, height: Math.max(10, v / max * h), rx: 8, style: `fill:${i === vals.length - 1 ? "#F4F0FA" : "rgba(244,240,250,.55)"}` })]));
}
function spark(vals) {
  const w = 110, h = 44, max = Math.max(1, ...vals), step = w / Math.max(1, vals.length - 1);
  const pts = vals.map((v, i) => [i * step, h - 4 - v / max * (h - 10)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const id = "sg" + Math.random().toString(36).slice(2, 7), [lx, ly] = pts.at(-1);
  return sv("svg", { width: w, height: h, viewBox: `-4 -4 ${w + 8} ${h + 8}`, "aria-hidden": "true" },
    sv("defs", {}, sv("linearGradient", { id, x1: 0, x2: 0, y1: 0, y2: 1 }, sv("stop", { offset: 0, style: "stop-color:var(--ink);stop-opacity:.16" }), sv("stop", { offset: 1, style: "stop-color:var(--ink);stop-opacity:0" }))),
    sv("path", { d: `${d} L${w} ${h} L0 ${h}Z`, fill: `url(#${id})` }),
    sv("path", { d, fill: "none", style: "stroke:var(--tangerine)", "stroke-width": 2, "stroke-linejoin": "round" }),
    sv("circle", { cx: lx, cy: ly, r: 4, style: "fill:var(--card);stroke:var(--tangerine)", "stroke-width": 2 }));
}
function ring(pct, label) {
  const r = 20, c = 2 * Math.PI * r;
  return sv("svg", { width: 56, height: 56, viewBox: "0 0 56 56", "aria-hidden": "true" },
    sv("circle", { cx: 28, cy: 28, r, fill: "none", style: "stroke:var(--chip)", "stroke-width": 6 }),
    sv("circle", { cx: 28, cy: 28, r, fill: "none", style: "stroke:var(--tangerine)", "stroke-width": 6, "stroke-linecap": "round", "stroke-dasharray": `${c * pct} ${c}`, transform: "rotate(-90 28 28)" }),
    sv("text", { x: 28, y: 32, "text-anchor": "middle", style: "fill:var(--ink);font:600 11px var(--sans)" }, document.createTextNode(label)));
}
function gauge(score) {
  const W = 260, H = 150, cx = W / 2, cy = 130, R = 100, g = sv("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", style: "max-width:300px", "aria-hidden": "true" });
  const at = (f, r) => [cx - Math.cos(f * Math.PI) * r, cy - Math.sin(f * Math.PI) * r];
  for (let i = 0; i <= 40; i++) { const f = i / 40, [x1, y1] = at(f, R + 10), [x2, y2] = at(f, R + (i % 5 ? 16 : 20));
    g.append(sv("line", { x1, y1, x2, y2, "stroke-width": 1.6, "stroke-linecap": "round", style: `stroke:${f <= score / 100 ? "#F4F0FA" : "rgba(244,240,250,.25)"}` })); }
  const arc = (f0, f1, r) => { const [x0, y0] = at(f0, r), [x1, y1] = at(f1, r); return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`; };
  g.append(sv("defs", {}, sv("linearGradient", { id: "gg", x1: 0, x2: 1 }, sv("stop", { offset: 0, "stop-color": "#6A4BD1" }), sv("stop", { offset: 1, "stop-color": "#F4F0FA" }))),
    sv("path", { d: arc(0, 1, R - 8), fill: "none", stroke: "rgba(244,240,250,.12)", "stroke-width": 16, "stroke-linecap": "round" }),
    score > 0 && sv("path", { d: arc(0, Math.max(.001, score / 100), R - 8), fill: "none", stroke: "url(#gg)", "stroke-width": 16, "stroke-linecap": "round" }));
  const [kx, ky] = at(score / 100, R - 8);
  g.append(sv("circle", { cx: kx, cy: ky, r: 9, fill: "#F4F0FA", stroke: "#120B1C", "stroke-width": 3 }));
  return g;
}
// bar chart with a hover tooltip; bars: [{ label, value, rows: [[k, v]], hi }]
function barChart(bars, { height = 230 } = {}) {
  const W = 760, H = height, pl = 40, pb = 26, pt = 10, max = Math.max(4, ...bars.map(b => b.value));
  const nice = Math.ceil(max / 4) * 4, bw = (W - pl) / bars.length;
  const wrap = el("div", { class: "chart" }), tip = el("div", { class: "tip", style: "opacity:0" });
  const svg = sv("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": bars.map(b => `${b.label}: ${b.value}`).join(", ") },
    sv("defs", {}, sv("pattern", { id: "hatch", width: 7, height: 7, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" },
      sv("rect", { width: 7, height: 7, style: "fill:var(--chip)" }), sv("line", { x1: 0, y1: 0, x2: 0, y2: 7, style: "stroke:var(--violet);stroke-opacity:.45", "stroke-width": 3 }))));
  for (let i = 0; i <= 4; i++) { const y = pt + (H - pb - pt) * (1 - i / 4);
    svg.append(sv("line", { x1: pl, x2: W, y1: y, y2: y, style: "stroke:var(--line)", "stroke-dasharray": i ? "3 4" : null }),
      sv("text", { x: 0, y: y + 4 }, document.createTextNode(String(nice * i / 4)))); }
  const avg = bars.reduce((s, b) => s + b.value, 0) / bars.length;
  if (avg) { const y = pt + (H - pb - pt) * (1 - avg / nice);
    svg.append(sv("line", { x1: pl, x2: W, y1: y, y2: y, style: "stroke:var(--ink);stroke-opacity:.35", "stroke-dasharray": "2 3" }),
      sv("text", { x: W - 4, y: y - 6, "text-anchor": "end" }, document.createTextNode(`avg ${avg.toFixed(1)}`))); }
  bars.forEach((b, i) => {
    const h = Math.max(b.value ? 14 : 6, b.value / nice * (H - pb - pt)), x = pl + i * bw + bw * .22, w = bw * .56, y = H - pb - h;
    const r = sv("rect", { x, y, width: w, height: h, rx: Math.min(w / 2, 14), style: b.hi ? "fill:var(--tangerine)" : "fill:url(#hatch)" });
    const hit = sv("rect", { x: pl + i * bw, y: pt, width: bw, height: H - pb - pt, fill: "transparent", style: "cursor:default" });
    hit.addEventListener("pointerenter", () => {
      tip.replaceChildren(el("b", { text: b.title ?? b.label }), ...b.rows.map(([k, v]) => el("div", {}, el("span", { text: k }), el("span", { text: String(v) }))));
      tip.style.left = `${(x + w / 2) / W * 100}%`; tip.style.top = `${y / H * 100}%`; tip.style.opacity = 1;
    });
    hit.addEventListener("pointerleave", () => tip.style.opacity = 0);
    svg.append(r, sv("text", { x: x + w / 2, y: H - 6, "text-anchor": "middle", style: b.hi ? "fill:var(--ink);font-weight:600" : null }, document.createTextNode(b.label)), hit);
  });
  wrap.append(svg, tip);
  return wrap;
}
function donut(parts) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1, r = 52, c = 2 * Math.PI * r;
  const g = sv("svg", { width: 150, height: 150, viewBox: "0 0 150 150", "aria-hidden": "true" });
  let off = 0;
  g.append(sv("circle", { cx: 75, cy: 75, r, fill: "none", style: "stroke:var(--chip)", "stroke-width": 20 }));
  for (const p of parts) { const len = p.value / total * c;
    if (len) g.append(sv("circle", { cx: 75, cy: 75, r, fill: "none", stroke: p.color, "stroke-width": 20, "stroke-dasharray": `${Math.max(0, len - 3)} ${c}`, "stroke-dashoffset": -off, transform: "rotate(-90 75 75)" }));
    off += len; }
  const top = [...parts].sort((a, b) => b.value - a.value)[0];
  g.append(sv("text", { x: 75, y: 76, "text-anchor": "middle", style: "fill:var(--ink);font:500 24px var(--sans)" }, document.createTextNode(`${Math.round(top.value / total * 100)}%`)),
    sv("text", { x: 75, y: 96, "text-anchor": "middle", style: "fill:var(--muted);font:11px var(--sans)" }, document.createTextNode(top.label)));
  return g;
}

// ---------- shared bits ----------
const card = (cls, ...kids) => el("section", { class: `card ${cls}` }, ...kids);
const head = (title, info, ...right) => el("div", { class: "card-h" }, el("h2", {}, title, info && el("span", { class: "info", title: info, text: "i" })), ...right);
function kpi({ dark, tint, label, info, num, delta, viz, foot, href, onclick }) {
  return card((dark ? "dark " : "") + (tint ? "tint " : "") + "kpi",
    el("div", { class: "label" }, label, info && el("span", { class: "info", title: info, text: "i" })),
    el("div", { class: "num", text: String(num) }),
    viz && el("div", { class: "viz" }, viz),
    el("div", { class: "delta" }, ...delta),
    foot && el("div", { class: "foot" }, href ? el("a", { href, text: foot }) : el("button", { class: "link", type: "button", text: foot, onclick })));
}
function segmented(options, current, onpick) {
  return el("div", { class: "seg", role: "group" }, options.map(([v, label, n]) =>
    el("button", { type: "button", "aria-pressed": String(v === current), onclick: () => onpick(v) }, label, n != null && el("span", { class: "count", text: String(n) }))));
}
function pageHead(title, ...right) { return el("div", { class: "page-head" }, el("h1", { text: title }), el("div", { class: "right" }, ...right)); }
const liveChip = () => el("span", { class: "live" }, el("i"), `${clients().length}`, el("small", { text: "clients" }));
function csv(rows, name) {
  const safe = v => { let s = String(v ?? ""); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; }; // no spreadsheet formulas
  const blob = new Blob([rows.map(r => r.map(safe).join(",")).join("\n")], { type: "text/csv" });
  const a = el("a", { href: URL.createObjectURL(blob), download: name }); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ---------- DASHBOARD ----------
let range = 30, chartYear = new Date().getFullYear();
function dashboard() {
  const now = Date.now(), span = range * DAY;
  const inR = (iso, k = 0) => { const t = new Date(iso).getTime(); return t > now - span * (k + 1) && t <= now - span * k; };
  const T = S.tickets, act = T.filter(t => active(t.status));
  const newNow = T.filter(t => inR(t.created_at)), newBefore = T.filter(t => inR(t.created_at, 1));
  const needs = T.filter(t => t.needsReply);
  const replyNow = newNow.map(t => t.firstReplyMs).filter(v => v != null), replyBefore = newBefore.map(t => t.firstReplyMs).filter(v => v != null);
  const medNow = median(replyNow), medBefore = median(replyBefore);
  const within = list => list.length ? Math.round(list.filter(t => t.firstReplyMs != null && t.firstReplyMs <= DAY).length / list.length * 100) : 0;
  const score = within(newNow.length ? newNow : T), scoreBefore = within(newBefore);
  const weeks = Array.from({ length: 8 }, (_, i) => T.filter(t => { const a = now - (8 - i) * 7 * DAY, b = a + 7 * DAY, c = new Date(t.created_at).getTime(); return c > a && c <= b; }).length);
  const months = Array.from({ length: 12 }, (_, m) => { const ms = T.filter(t => { const d = new Date(t.created_at); return d.getFullYear() === chartYear && d.getMonth() === m; });
    return median(ms.map(t => t.firstReplyMs).filter(v => v != null)) ?? 0; }).slice(0, 12);
  const years = [...new Set([new Date().getFullYear(), ...T.map(t => new Date(t.created_at).getFullYear())])].sort();

  const v = el("div", {},
    pageHead("Dashboard", liveChip()),
    el("div", { class: "toolbar" },
      segmented([[30, "30 days"], [90, "90 days"], [365, "12 months"]], range, r => { range = r; render(); }),
      el("span", { class: "stamp" }, icon(I.clock), `${new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}, last ${range === 365 ? "12 months" : range + " days"}`),
      el("div", { class: "right" },
        el("a", { class: "btn", href: "#/projects" }, icon(I.chart), "All projects"),
        el("button", { class: "btn dark", type: "button", onclick: exportTickets }, icon(I.down), "Export"))),
    el("div", { class: "grid g4" },
      kpi({ dark: true, label: "Active requests", info: "Requests that are not resolved or closed.", num: act.length,
        delta: [change(newNow.length, newBefore.length), el("span", { text: "new vs last period" })],
        viz: miniBars(["open", "in_progress", "waiting_on_client"].map(s => act.filter(t => t.status === s).length)), foot: "See projects", href: "#/projects" }),
      kpi({ label: "New requests", info: `Opened in the last ${range} days.`, num: newNow.length,
        delta: [change(newNow.length, newBefore.length), el("span", { text: "vs last period" })], viz: spark(weeks), foot: "See all requests", href: "#/projects" }),
      kpi({ label: "Needs a reply", info: "Active requests where the client wrote last.", num: needs.length,
        delta: [el("span", { text: `of ${act.length} active` })], viz: ring(act.length ? needs.length / act.length : 0, `${act.length ? Math.round(needs.length / act.length * 100) : 0}%`),
        foot: "Open inbox", onclick: () => { msgFilter = "needs"; location.hash = "#/messages"; } }),
      kpi({ tint: true, label: "First reply time", info: "Median time from a new request to our first reply.", num: medNow == null ? "—" : hrs(medNow),
        delta: [medNow != null && medBefore != null ? change(medNow, medBefore, { invert: true }) : el("span", { class: "chg flat", text: "—" }), el("span", { text: "vs last period" })],
        viz: miniBarsLight(months.slice(-8)), foot: "See messages", href: "#/messages" })),
    el("div", { class: "grid g-wide" },
      card("dark", head("Reply score", "Share of requests answered within 24 hours."),
        el("div", { class: "gauge" }, gauge(score), el("div", { class: "g-num" }, el("b", { text: String(score) }), " ", change(score, scoreBefore, { suffix: "" }), el("small", { text: "of 100 points" }))),
        el("p", { style: "font-weight:600;margin-bottom:4px", text: score >= 80 ? "Clients hear back fast" : score >= 50 ? "Mostly on time" : "Replies are slipping" }),
        el("p", { class: "muted", style: "font-size:13px", text: `${score}% of requests got a reply within a day. ${needs.length ? `${needs.length} waiting on us right now.` : "Nothing waiting on us right now."}` }),
        el("div", { class: "kpi" }, el("div", { class: "foot" }, el("button", { class: "link", type: "button", text: "Reply to what's waiting", onclick: () => { msgFilter = "needs"; location.hash = "#/messages"; } })))),
      card("", head("Requests", null, el("span", { class: "sub", text: `${T.filter(t => new Date(t.created_at).getFullYear() === chartYear).length} in ${chartYear}` }),
        el("span", { class: "grow" }), segmented(years.slice(-3).map(y => [y, String(y)]), chartYear, y => { chartYear = y; render(); })),
        barChart(Array.from({ length: 12 }, (_, m) => {
          const inM = t => { const d = new Date(t); return d.getFullYear() === chartYear && d.getMonth() === m; };
          const made = T.filter(t => inM(t.created_at)), label = new Date(chartYear, m, 1).toLocaleDateString(undefined, { month: "short" });
          return { label, title: `${label} ${chartYear}`, value: made.length, hi: chartYear === new Date().getFullYear() && m === new Date().getMonth(),
            rows: [["Requests", made.length], ["Resolved", made.filter(t => !active(t.status)).length], ["New clients", clients().filter(c => inM(c.created_at)).length]] };
        })))),
    el("div", { class: "grid g-half" },
      card("", head("When clients write", "Messages and new requests from clients, by day and time."), heatmap()),
      card("", head("Request types"), el("div", { class: "donut-wrap" },
        el("div", {}, el("div", { class: "big-num", text: String(T.length) }), el("p", { class: "muted", style: "font-size:13px;margin-bottom:16px", text: "requests all time" }),
          el("div", { class: "rows" }, Object.entries(LABEL.category).map(([k, l]) => el("div", { class: "r" }, el("span", {}, el("i", { style: `background:${CAT_COLOR[k]}` }), l), el("span", { text: String(T.filter(t => t.category === k).length) }))))),
        donut(Object.entries(LABEL.category).map(([k, l]) => ({ label: l, value: T.filter(t => t.category === k).length, color: CAT_COLOR[k] })))))),
    el("div", { class: "grid g-half" },
      card("", head("Latest activity"), activity()),
      card("", head("Team", "Active requests assigned to each admin."), workload())));
  return v;
}
function miniBarsLight(vals) {
  const max = Math.max(1, ...vals), w = 7, gap = 4, h = 44;
  return sv("svg", { width: vals.length * (w + gap), height: h, "aria-hidden": "true" },
    vals.map((v, i) => sv("rect", { x: i * (w + gap), y: h - Math.max(6, v / max * h), width: w, height: Math.max(6, v / max * h), rx: 3.5, style: `fill:var(--ink);opacity:${i === vals.length - 1 ? 1 : .35}` })));
}
function heatmap() {
  const bands = [["12–8 AM", 0, 8], ["8 AM–12 PM", 8, 12], ["12–4 PM", 12, 16], ["4 PM–12 AM", 16, 24]];
  const grid = bands.map(() => Array(7).fill(0));
  const events = [...S.tickets.map(t => t.created_at), ...S.msgs.filter(m => S.people.get(m.author_id)?.role !== "admin").map(m => m.created_at)];
  for (const iso of events) { const d = new Date(iso), day = (d.getDay() + 6) % 7, h = d.getHours(); grid[bands.findIndex(b => h >= b[1] && h < b[2])][day]++; }
  const max = Math.max(1, ...grid.flat());
  const shade = v => v ? `color-mix(in srgb, ${v / max > .75 ? "var(--tangerine)" : "var(--violet)"} ${Math.round(25 + v / max * 75)}%, var(--chip))` : "var(--chip)";
  return el("div", {},
    el("div", { class: "heat" }, el("span"), ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => el("span", { class: "hd", text: d })),
      bands.map(([l], r) => [el("span", { text: l }), grid[r].map(v => el("span", { class: "c", style: `background:${shade(v)}`, title: `${v} from clients` }))])),
    el("div", { class: "legend", style: "justify-content:flex-end;margin-top:12px" }, "0", [0, .25, .5, .75, 1].map(f => el("i", { style: `background:${shade(f * max)}` })), `${max}+`));
}
function activity() {
  const ev = [...S.tickets.map(t => ({ at: t.created_at, t, p: t.client, text: "opened a request" })),
    ...S.msgs.filter(m => !m.is_internal).map(m => ({ at: m.created_at, t: S.tickets.find(t => t.id === m.ticket_id), p: S.people.get(m.author_id), text: m.body }))]
    .filter(e => e.t).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 7);
  if (!ev.length) return el("p", { class: "empty", text: "No activity yet." });
  return el("div", { class: "feed" }, ev.map(e => el("button", { type: "button", onclick: () => location.hash = `#/projects/${e.t.id}` },
    avatar(e.p), el("span", { style: "min-width:0" }, el("span", { class: "t", text: `${who(e.p)} · #${e.t.id} ${e.t.title}` }), el("span", { class: "s", text: e.text })),
    el("time", { text: rel(e.at) }))));
}
function workload() {
  const act = S.tickets.filter(t => active(t.status)), max = Math.max(1, act.length);
  const rows = [...S.admins.map(a => [avatar(a), who(a), act.filter(t => t.assigned_to === a.id).length]),
    [el("span", { class: "av", text: "—" }), "Unassigned", act.filter(t => !t.assigned_to).length]];
  return el("div", { class: "workload" }, rows.map(([av, name, n]) => el("div", { class: "w" }, av,
    el("div", {}, el("span", { text: name }), el("div", { class: "meter" }, el("i", { style: `width:${n / max * 100}%` }))), el("b", { text: String(n) }))));
}
function exportTickets(list = S.tickets) {
  csv([["Request", "Title", "Client", "Email", "Type", "Status", "Priority", "Opened", "Last activity"],
    ...list.map(t => [t.id, t.title, who(t.client), t.client?.email, LABEL.category[t.category], LABEL.status[t.status], LABEL.priority[t.priority], t.created_at, t.lastAt])],
    `creeper-requests-${new Date().toISOString().slice(0, 10)}.csv`);
}

// ---------- PROJECTS ----------
let pStatus = "active", pCat = "all", pQuery = "";
function projects() {
  const T = S.tickets, monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const count = s => s === "all" ? T.length : s === "active" ? T.filter(t => active(t.status)).length : s === "needs" ? T.filter(t => t.needsReply).length : T.filter(t => t.status === s).length;
  const rowsFor = () => T.filter(t => (pStatus === "all" || (pStatus === "active" ? active(t.status) : pStatus === "needs" ? t.needsReply : t.status === pStatus))
    && (pCat === "all" || t.category === pCat)
    && (!pQuery || `#${t.id} ${t.title} ${who(t.client)} ${t.client?.email}`.toLowerCase().includes(pQuery)));
  const tbody = el("tbody");
  const fill = () => {
    const rows = rowsFor();
    tbody.replaceChildren(...(rows.length ? rows.map(t => el("tr", { tabindex: 0, onclick: () => location.hash = `#/projects/${t.id}`, onkeydown: e => { if (e.key === "Enter") location.hash = `#/projects/${t.id}`; } },
      el("td", { class: "ref", text: `#${t.id}` }),
      el("td", {}, el("div", { class: "who" }, avatar(t.client), el("div", {}, el("b", { text: who(t.client) }), el("small", { text: t.client?.email ?? "" })))),
      el("td", {}, el("div", { class: "ttl", text: t.title, title: t.title }), t.needsReply && el("span", { class: "tag needs", style: "margin-top:4px", text: "Needs reply" })),
      el("td", {}, el("span", { class: "tag", text: LABEL.category[t.category] })),
      el("td", {}, prioTag(t.priority)),
      el("td", { class: "num", text: String(t.msgs.filter(m => !m.is_internal).length) }),
      el("td", { class: "muted", text: rel(t.lastAt) }),
      el("td", {}, statusEl(t.status)))) : [el("tr", {}, el("td", { colspan: 8, class: "empty", text: "No requests match." }))]));
  };
  fill();
  const search = el("input", { placeholder: "Request, title or client", value: pQuery, "aria-label": "Search requests", oninput: e => { pQuery = e.target.value.trim().toLowerCase(); fill(); } });
  return el("div", {},
    pageHead("Projects", liveChip()),
    el("div", { class: "grid g4" },
      kpi({ dark: true, label: "Active", num: count("active"), delta: [el("span", { text: `${T.filter(t => t.status === "open").length} open, ${T.filter(t => t.status === "in_progress").length} in progress` })] }),
      kpi({ label: "Needs a reply", num: count("needs"), delta: [el("span", { text: "client wrote last" })] }),
      kpi({ label: "Waiting on client", num: count("waiting_on_client"), delta: [el("span", { text: "ball is in their court" })] }),
      kpi({ label: "Resolved this month", num: T.filter(t => !active(t.status) && new Date(t.updated_at) >= monthStart).length, delta: [el("span", { text: `${T.filter(t => t.status === "closed").length} closed all time` })] })),
    el("div", { class: "toolbar" },
      segmented([["active", "Active", count("active")], ["needs", "Needs reply", count("needs")], ...STATUSES.map(s => [s, LABEL.status[s], count(s)]), ["all", "All", count("all")]], pStatus, s => { pStatus = s; render(); }),
      el("button", { class: "btn", type: "button", onclick: () => exportTickets(rowsFor()) }, icon(I.down), "Export CSV")),
    card("table-card",
      el("div", { class: "table-head" },
        el("label", { class: "search" }, icon(I.search), search),
        el("div", { class: "chips" }, [["all", "All types"], ...Object.entries(LABEL.category)].map(([k, l]) => el("button", { type: "button", "aria-pressed": String(pCat === k), text: l, onclick: () => { pCat = k; render(); } })))),
      el("div", { class: "tbl-scroll" }, el("table", {},
        el("thead", {}, el("tr", {}, ["Request", "Client", "Title", "Type", "Priority", "Messages", "Last activity", "Status"].map((h, i) => el("th", { class: i === 5 ? "num" : null, text: h })))),
        tbody))));
}

// ---------- the request drawer ----------
const drawer = $("drawer"), scrim = $("scrim");
let drawerFor = null, lastFocus = null;
function openDrawer(content, key) {
  if (drawerFor === null) lastFocus = document.activeElement;
  drawerFor = key;
  drawer.replaceChildren(...content);
  drawer.classList.remove("hidden"); scrim.classList.remove("hidden");
  requestAnimationFrame(() => { drawer.classList.add("on"); scrim.classList.add("on"); });
  drawer.querySelector(".close")?.focus({ preventScroll: true });
}
function closeDrawer(updateHash = true) {
  if (drawerFor === null) return;
  drawerFor = null;
  drawer.classList.remove("on"); scrim.classList.remove("on");
  setTimeout(() => { if (drawerFor === null) { drawer.classList.add("hidden"); scrim.classList.add("hidden"); } }, 420);
  if (updateHash) { const base = location.hash.split("/").slice(0, 2).join("/"); if (base !== location.hash) history.replaceState(null, "", base); }
  lastFocus?.focus?.({ preventScroll: true });
}
scrim.addEventListener("click", () => closeDrawer());
addEventListener("keydown", e => { if (e.key === "Escape") { if (!$("palette").classList.contains("hidden")) closePalette(); else closeDrawer(); } });

function ticketDrawer(id) {
  const t = S.tickets.find(x => x.id === id);
  if (!t) { toast("That request could not be found.", true); return closeDrawer(); }
  const c = t.client, theirs = S.tickets.filter(x => x.created_by === t.created_by);
  const sel = (label, map, val, col) => el("div", { class: "field" }, el("label", { text: label }),
    el("select", { onchange: e => updateTicket(t.id, { [col]: e.target.value || null }) },
      Object.entries(map).map(([k, l]) => Object.assign(el("option", { value: k, text: l }), { selected: k === (val ?? "") }))));
  const idx = STATUSES.indexOf(t.status);
  openDrawer([
    el("div", { class: "d-head" }, el("h2", { id: "drawerTitle", text: `Request #${t.id}` }), el("button", { class: "close", type: "button", "aria-label": "Close", text: "✕", onclick: () => closeDrawer() })),
    el("div", { class: "d-body" },
      el("div", { class: "meta-row" }, statusEl(t.status), el("span", { text: `Opened ${fmtWhen(t.created_at)}` }), el("span", { class: "tag", text: LABEL.category[t.category] }), prioTag(t.priority), t.needsReply && el("span", { class: "tag needs", text: "Needs reply" })),
      el("div", { class: "steps", role: "group", "aria-label": "Move status" }, STATUSES.map((s, i) =>
        el("button", { type: "button", class: i < idx ? "done" : i === idx ? "cur" : "", "aria-pressed": String(i === idx), title: `Set to ${LABEL.status[s]}`, onclick: () => i !== idx && updateTicket(t.id, { status: s }, `Moved to ${LABEL.status[s]}`) },
          el("i", { text: String(i + 1) }), LABEL.status[s]))),
      el("div", { class: "box" }, el("h4", { text: "The request" }), el("p", { class: "title", text: t.title }), el("p", { class: "body", text: t.description })),
      el("div", { class: "pair" },
        sel("Status", LABEL.status, t.status, "status"), sel("Priority", LABEL.priority, t.priority, "priority"),
        sel("Assigned to", { "": "Nobody", ...Object.fromEntries(S.admins.map(a => [a.id, who(a)])) }, t.assigned_to, "assigned_to")),
      el("div", { class: "box client-card" }, avatar(c, "lg"),
        el("div", { class: "grow" }, el("b", { text: who(c) }), el("small", { text: c?.email ?? "" }), el("small", { text: `${theirs.length} request${theirs.length === 1 ? "" : "s"} · client since ${c ? fmtDate(c.created_at) : "—"}` })),
        el("a", { class: "btn small", href: `#/clients/${t.created_by}` }, "View client")),
      el("div", { class: "box" }, el("h4", { text: "Conversation" }), thread(t, true), composer(t))),
    el("div", { class: "d-foot" },
      el("a", { class: "btn small", href: `#/messages/${t.id}` }, icon(I.mail), "Open in messages"),
      el("span", { class: "grow" }),
      active(t.status)
        ? [t.status !== "closed" && el("button", { class: "btn small danger", type: "button", text: "Close", onclick: () => updateTicket(t.id, { status: "closed" }, "Closed") }),
           el("button", { class: "btn small dark", type: "button", onclick: () => updateTicket(t.id, { status: "resolved" }, "Marked resolved") }, icon(I.check), "Mark resolved")]
        : el("button", { class: "btn small dark", type: "button", text: "Reopen", onclick: () => updateTicket(t.id, { status: "in_progress" }, "Reopened") }))
  ], `t${id}`);
}

// a conversation: the request itself first, then every message, grouped by day
function thread(t, compact = false) {
  const items = [{ at: t.created_at, p: t.client, body: t.description, first: true }, ...t.msgs.map(m => ({ at: m.created_at, p: S.people.get(m.author_id), body: m.body, note: m.is_internal }))];
  const box = el("div", { class: "thread" });
  let day = "";
  for (const it of compact ? items.slice(-12) : items) {
    const d = new Date(it.at).toDateString();
    if (d !== day) { day = d; box.append(el("div", { class: "day", text: d === new Date().toDateString() ? "Today" : fmtDate(it.at) })); }
    const staff = it.p?.role === "admin";
    box.append(el("div", { class: "msg" + (staff ? " staff" : "") + (it.note ? " note" : "") }, avatar(it.p),
      el("div", { class: "bub", text: it.first ? `${t.title}\n\n${it.body}` : it.body }),
      el("div", { class: "by", text: `${it.note ? "Internal note · " : ""}${who(it.p)} · ${fmtTime(it.at)}` })));
  }
  return box;
}
function composer(t) {
  if (t.status === "closed") return el("p", { class: "muted", style: "font-size:13px;margin-top:12px", text: "This request is closed. Reopen it to reply." });
  const ta = el("textarea", { rows: 1, maxlength: 5000, placeholder: `Reply to ${who(t.client).split(" ")[0]}…`, "aria-label": "Reply" });
  const internal = el("input", { type: "checkbox" });
  const go = async () => {
    const body = ta.value.trim(); if (!body) return;
    ta.disabled = true;
    const ok = await sendMessage(t.id, body, internal.checked);
    ta.disabled = false; if (ok) { ta.value = ""; }
  };
  ta.addEventListener("input", () => { ta.style.height = "auto"; ta.style.height = Math.min(160, ta.scrollHeight) + "px"; });
  ta.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(); } });
  return el("div", { class: "composer", style: "margin-top:14px" },
    el("div", { class: "quick" }, ["Thanks, we're on it.", "Could you send a few more details?", "Done! Take a look and tell us what you think."].map(q =>
      el("button", { type: "button", text: q, onclick: () => { ta.value = q; ta.focus(); } }))),
    el("div", { class: "compose-box" }, ta, el("button", { class: "send", type: "button", "aria-label": "Send", onclick: go }, icon(I.send))),
    el("div", { class: "compose-meta" }, el("label", { class: "check" }, internal, "Internal note (only the studio sees it)"),
      el("span", {}, el("kbd", { text: "Enter" }), " to send, ", el("kbd", { text: "Shift" }), " + ", el("kbd", { text: "Enter" }), " for a new line")));
}

// ---------- MESSAGES ----------
let msgFilter = "all", msgQuery = "", msgCurrent = null;
function messages(id) {
  const T = S.tickets;
  const list = T.filter(t => (msgFilter === "all" || (msgFilter === "needs" ? t.needsReply : !active(t.status)))
    && (!msgQuery || `${t.title} ${who(t.client)} ${t.msgs.map(m => m.body).join(" ")}`.toLowerCase().includes(msgQuery)));
  msgCurrent = id ?? (msgCurrent && T.some(t => t.id === msgCurrent) ? msgCurrent : (matchMedia("(min-width: 761px)").matches ? list[0]?.id : null));
  const t = T.find(x => x.id === msgCurrent);
  const items = el("div", { class: "in-items" }, list.length ? list.map(x => el("button", { type: "button", "aria-current": String(x.id === msgCurrent), class: x.needsReply ? "unread" : "", onclick: () => location.hash = `#/messages/${x.id}` },
    avatar(x.client), el("b", { text: who(x.client) }), el("time", { text: rel(x.lastAt) }),
    el("span", { class: "t", text: `#${x.id} · ${x.title}` }),
    el("span", { class: "s", text: x.last ? `${S.people.get(x.last.author_id)?.role === "admin" ? "You: " : ""}${x.last.body}` : x.description }))) : el("p", { class: "empty", text: "Nothing here." }));
  const q = el("input", { placeholder: "Search people or messages", value: msgQuery, "aria-label": "Search messages", onchange: e => { msgQuery = e.target.value.trim().toLowerCase(); render(); } });
  const v = el("div", {},
    pageHead("Messages", liveChip()),
    card("inbox" + (t && id ? " reading" : ""),
      el("section", { class: "in-list" },
        el("div", { class: "card-h", style: "margin:0 4px" }, el("h2", { text: "Inbox" }), el("span", { class: "count", text: `${T.filter(x => x.needsReply).length} need a reply` })),
        segmented([["all", "All"], ["needs", "Needs reply"], ["done", "Done"]], msgFilter, f => { msgFilter = f; render(); }),
        el("label", { class: "search" }, icon(I.search), q),
        items),
      t ? el("section", { class: "in-thread" },
        el("div", { class: "th-head" },
          el("a", { class: "close", href: "#/messages", "aria-label": "Back to inbox", style: "display:none" }, icon(I.back)),
          avatar(t.client), el("div", { class: "grow" }, el("b", { text: who(t.client) }), el("small", { text: `#${t.id} · ${t.title}` })),
          statusEl(t.status),
          el("a", { class: "btn small", href: `#/projects/${t.id}` }, "Request"),
          active(t.status) ? el("button", { class: "btn small", type: "button", onclick: () => updateTicket(t.id, { status: "resolved" }, "Marked done") }, icon(I.check), "Mark done") : null),
        el("div", { class: "th-scroll" }, thread(t)),
        el("div", { class: "th-compose" }, composer(t)))
        : el("section", { class: "in-thread" }, el("p", { class: "empty", style: "align-self:center", text: "Pick a conversation." })),
      t ? clientSide(t) : el("section", { class: "in-side" })));
  // phones: a back arrow in the thread header
  if (matchMedia("(max-width: 760px)").matches) v.querySelector(".th-head .close")?.style.removeProperty("display");
  requestAnimationFrame(() => { const s = v.querySelector(".th-scroll"); if (s) s.scrollTop = s.scrollHeight; });
  return v;
}
function clientSide(t) {
  const c = t.client, theirs = S.tickets.filter(x => x.created_by === t.created_by);
  return el("section", { class: "in-side" },
    el("div", { class: "head" }, avatar(c, "lg"), el("b", { class: "name", text: who(c) }),
      el("span", { class: "tag", text: theirs.length > 1 ? "Repeat client" : "New client" })),
    el("div", { class: "kv" },
      el("div", {}, el("span", { text: "Requests" }), el("b", { text: String(theirs.length) })),
      el("div", {}, el("span", { text: "Active" }), el("b", { text: String(theirs.filter(x => active(x.status)).length) })),
      el("div", {}, el("span", { text: "Client since" }), el("b", { text: c ? fmtDate(c.created_at) : "—" }))),
    el("div", { class: "kv" }, el("h4", { text: "Contact" }),
      c?.email && el("a", { class: "link", href: `mailto:${c.email}`, style: "text-align:left;overflow-wrap:anywhere", text: c.email })),
    el("div", { class: "kv" }, el("h4", { text: "Their requests" }),
      el("div", { class: "mini" }, theirs.slice(0, 6).map(x => el("button", { type: "button", onclick: () => location.hash = `#/messages/${x.id}` },
        el("span", { text: `#${x.id} ${x.title}` }), statusEl(x.status))))),
    el("a", { class: "btn", style: "justify-content:center", href: `#/clients/${t.created_by}` }, "View client"));
}

// ---------- CLIENTS ----------
let cFilter = "all", cQuery = "";
function clientsView() {
  const C = clients(), monthAgo = Date.now() - 30 * DAY;
  const list = C.filter(c => (cFilter === "all" || (cFilter === "active" ? c.open : cFilter === "repeat" ? c.reqs.length > 1 : new Date(c.created_at) > monthAgo))
    && (!cQuery || `${who(c)} ${c.email}`.toLowerCase().includes(cQuery)));
  const tbody = el("tbody", {}, list.length ? list.map(c => el("tr", { tabindex: 0, onclick: () => location.hash = `#/clients/${c.id}`, onkeydown: e => { if (e.key === "Enter") location.hash = `#/clients/${c.id}`; } },
    el("td", {}, el("div", { class: "who" }, avatar(c), el("div", {}, el("b", { text: who(c) }), el("small", { text: c.email })))),
    el("td", { class: "num", text: String(c.reqs.length) }),
    el("td", { class: "num", text: String(c.open) }),
    el("td", { class: "muted", text: rel(c.lastAt) }),
    el("td", { class: "muted", text: fmtDate(c.created_at) }),
    el("td", {}, el("div", { class: "chips" }, c.open && el("span", { class: "tag", text: "Active" }), c.reqs.length > 1 && el("span", { class: "tag", text: "Repeat" }),
      new Date(c.created_at) > monthAgo && el("span", { class: "tag warm", text: "New" }), !c.reqs.length && el("span", { class: "muted", text: "No requests yet" }))))) :
    [el("tr", {}, el("td", { colspan: 6, class: "empty", text: "No clients match." }))]);
  const withReq = C.filter(c => c.reqs.length);
  return el("div", {},
    pageHead("Clients", liveChip()),
    el("div", { class: "toolbar" },
      segmented([["all", "All", C.length], ["active", "Active", C.filter(c => c.open).length], ["repeat", "Repeat", C.filter(c => c.reqs.length > 1).length], ["new", "New", C.filter(c => new Date(c.created_at) > monthAgo).length]], cFilter, f => { cFilter = f; render(); }),
      el("button", { class: "btn", type: "button", onclick: () => csv([["Name", "Email", "Requests", "Active", "Last activity", "Client since"], ...list.map(c => [who(c), c.email, c.reqs.length, c.open, c.lastAt, c.created_at])], "creeper-clients.csv") }, icon(I.down), "Export")),
    el("div", { class: "grid g4" },
      kpi({ dark: true, label: "Clients", num: C.length, delta: [el("span", { text: `${C.filter(c => c.open).length} with an active request` })] }),
      kpi({ label: "New this month", num: C.filter(c => new Date(c.created_at) > monthAgo).length, delta: [el("span", { text: "signed up in the last 30 days" })] }),
      kpi({ label: "Repeat rate", num: `${withReq.length ? Math.round(C.filter(c => c.reqs.length > 1).length / withReq.length * 100) : 0}%`, delta: [el("span", { text: "came back with another request" })] }),
      kpi({ tint: true, label: "Requests per client", num: withReq.length ? (S.tickets.length / withReq.length).toFixed(1) : "0", delta: [el("span", { text: "on average" })] })),
    card("table-card",
      el("div", { class: "table-head" }, el("h2", { style: "font-size:15px;font-weight:600", text: `All clients · ${list.length}` }),
        el("label", { class: "search" }, icon(I.search), el("input", { placeholder: "Name or email", value: cQuery, "aria-label": "Search clients", onchange: e => { cQuery = e.target.value.trim().toLowerCase(); render(); } }))),
      el("div", { class: "tbl-scroll" }, el("table", {},
        el("thead", {}, el("tr", {}, ["Client", "Requests", "Active", "Last activity", "Client since", "Tags"].map((h, i) => el("th", { class: i === 1 || i === 2 ? "num" : null, text: h })))),
        tbody))));
}
function clientDrawer(id) {
  const c = clients().find(x => x.id === id) ?? S.people.get(id);
  if (!c) { toast("That client could not be found.", true); return closeDrawer(); }
  const reqs = S.tickets.filter(t => t.created_by === id);
  openDrawer([
    el("div", { class: "d-head" }, el("h2", { id: "drawerTitle", text: "Client" }), el("button", { class: "close", type: "button", "aria-label": "Close", text: "✕", onclick: () => closeDrawer() })),
    el("div", { class: "d-body" },
      el("div", { class: "box client-card" }, avatar(c, "lg"), el("div", { class: "grow" }, el("b", { text: who(c) }), el("small", { text: c.email }), el("small", { text: `Client since ${fmtDate(c.created_at)}` }))),
      el("div", { class: "pair" },
        el("div", { class: "box" }, el("h4", { text: "Requests" }), el("div", { class: "big-num", text: String(reqs.length) })),
        el("div", { class: "box" }, el("h4", { text: "Active" }), el("div", { class: "big-num", text: String(reqs.filter(t => active(t.status)).length) })),
        el("div", { class: "box" }, el("h4", { text: "Last activity" }), el("div", { style: "font-weight:600;margin-top:10px", text: reqs[0] ? rel(reqs[0].lastAt) : "—" }))),
      el("div", { class: "box" }, el("h4", { text: "Their requests" }),
        reqs.length ? el("div", { class: "feed" }, reqs.map(t => el("button", { type: "button", onclick: () => location.hash = `#/projects/${t.id}` },
          el("span", { class: "ref", text: `#${t.id}` }), el("span", { style: "min-width:0" }, el("span", { class: "t", text: t.title }), el("span", { class: "s", text: `${LABEL.category[t.category]} · ${rel(t.lastAt)}` })), statusEl(t.status))))
          : el("p", { class: "muted", text: "No requests yet." }))),
    el("div", { class: "d-foot" }, el("span", { class: "grow" }), el("a", { class: "btn small dark", href: `mailto:${c.email}` }, icon(I.mail), "Email client"))
  ], `c${id}`);
}

// ---------- REVIEWS: approve what goes on the homepage ----------
let rvFilter = "pending";
async function setReview(id, patch, note) {
  const q = patch ? supabase.from("reviews").update(patch).eq("id", id) : supabase.from("reviews").delete().eq("id", id);
  const { error } = await q;
  if (error) return toast(error.message, true);
  toast(note); await refresh();
}
function reviewsView() {
  const R = S.reviews, count = f => f === "all" ? R.length : R.filter(x => x.status === f).length;
  const list = R.filter(x => rvFilter === "all" || x.status === rvFilter);
  const avg = R.filter(x => x.status === "approved");
  return el("div", {},
    pageHead("Reviews", el("a", { class: "btn", href: "./#reviews", target: "_blank", rel: "noopener" }, "See them on the site")),
    el("div", { class: "grid g4" },
      kpi({ dark: true, label: "Waiting for you", num: count("pending"), delta: [el("span", { text: "new reviews to approve" })] }),
      kpi({ label: "On the site", num: count("approved"), delta: [el("span", { text: "shown in the house of cards" })] }),
      kpi({ label: "Average rating", num: avg.length ? (avg.reduce((a, x) => a + x.rating, 0) / avg.length).toFixed(1) : "—", delta: [el("span", { text: "of approved reviews" })] }),
      kpi({ tint: true, label: "Hidden", num: count("hidden"), delta: [el("span", { text: "kept off the site" })] })),
    el("div", { class: "toolbar" }, segmented([["pending", "Waiting", count("pending")], ["approved", "On the site", count("approved")], ["hidden", "Hidden", count("hidden")], ["all", "All", count("all")]], rvFilter, f => { rvFilter = f; render(); })),
    list.length ? el("div", { class: "grid rv-grid" }, list.map(x => {
      const author = S.people.get(x.author_id);
      return card("rv-card-admin",
        el("div", { class: "card-h" }, el("span", { class: "rv-stars-admin", text: "★".repeat(x.rating) + "☆".repeat(5 - x.rating), "aria-label": `${x.rating} out of 5` }),
          el("span", { class: `status s-${x.status === "approved" ? "resolved" : x.status === "pending" ? "open" : "closed"}` }, el("span", { text: { pending: "Waiting", approved: "On the site", hidden: "Hidden" }[x.status] }))),
        el("p", { class: "rv-body-admin", text: `“${x.body}”` }),
        el("div", { class: "who" }, avatar(author), el("div", {}, el("b", { text: x.display_name + (x.company ? ` · ${x.company}` : "") }), el("small", { text: `${author?.email ?? "Unknown account"} · ${fmtWhen(x.created_at)}` }))),
        el("div", { class: "rv-act" },
          x.status !== "approved" && el("button", { class: "btn small dark", type: "button", onclick: () => setReview(x.id, { status: "approved" }, "Approved: it's on the site") }, icon(I.check), "Approve"),
          x.status !== "hidden" && el("button", { class: "btn small", type: "button", text: "Hide", onclick: () => setReview(x.id, { status: "hidden" }, "Hidden from the site") }),
          el("button", { class: "btn small danger", type: "button", text: "Delete", onclick: () => confirm("Delete this review for good?") && setReview(x.id, null, "Deleted") })));
    })) : card("", el("p", { class: "empty", text: rvFilter === "pending" ? "No reviews waiting. When a client leaves one, it shows up here first." : "Nothing here." })));
}

// ---------- search palette (Ctrl K) ----------
const pal = $("palette"), pq = $("pq"), pres = $("pres");
let palSel = 0;
function openPalette() { pal.classList.remove("hidden"); scrim.classList.remove("hidden"); requestAnimationFrame(() => scrim.classList.add("on")); pq.value = ""; drawPalette(); pq.focus(); }
function closePalette() { pal.classList.add("hidden"); if (drawerFor === null) { scrim.classList.remove("on"); setTimeout(() => drawerFor === null && scrim.classList.add("hidden"), 300); } }
function drawPalette() {
  const q = pq.value.trim().toLowerCase();
  const res = [
    ...S.tickets.filter(t => !q || `#${t.id} ${t.title} ${who(t.client)}`.toLowerCase().includes(q)).slice(0, 6).map(t => ({ text: `#${t.id} ${t.title}`, sub: who(t.client), go: `#/projects/${t.id}` })),
    ...clients().filter(c => q && `${who(c)} ${c.email}`.toLowerCase().includes(q)).slice(0, 4).map(c => ({ text: who(c), sub: "Client", go: `#/clients/${c.id}` })),
    ...(q ? S.msgs.filter(m => !m.is_internal && m.body.toLowerCase().includes(q)).slice(0, 4).map(m => ({ text: m.body.slice(0, 80), sub: `Message on #${m.ticket_id}`, go: `#/messages/${m.ticket_id}` })) : [])
  ];
  palSel = Math.min(palSel, Math.max(0, res.length - 1));
  pres.replaceChildren(...(res.length ? res.map((r, i) => el("li", {}, el("button", { type: "button", class: i === palSel ? "sel" : "", onclick: () => { closePalette(); location.hash = r.go; } },
    el("span", { text: r.text }), el("small", { text: r.sub })))) : [el("li", { class: "empty", text: "Nothing found." })]));
  pres._res = res;
}
pq.addEventListener("input", () => { palSel = 0; drawPalette(); });
pq.addEventListener("keydown", e => {
  const res = pres._res ?? [];
  if (e.key === "ArrowDown") { palSel = Math.min(res.length - 1, palSel + 1); drawPalette(); e.preventDefault(); }
  if (e.key === "ArrowUp") { palSel = Math.max(0, palSel - 1); drawPalette(); e.preventDefault(); }
  if (e.key === "Enter" && res[palSel]) { closePalette(); location.hash = res[palSel].go; }
});
$("d-search").addEventListener("click", openPalette);
addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); } });
scrim.addEventListener("click", () => { if (!pal.classList.contains("hidden")) closePalette(); });

// ---------- router ----------
function parse() { const m = location.hash.match(/^#\/(\w+)(?:\/([\w-]+))?/); return { name: m?.[1] ?? "dashboard", id: m?.[2] ?? null }; }
let lastPage = null;
function render() {
  const { name, id } = parse();
  const page = { dashboard: 1, projects: 1, messages: 1, clients: 1, reviews: 1 }[name] ? name : "dashboard";
  document.querySelectorAll("#tabs a").forEach(a => a.dataset.route === page ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  const y = page === lastPage ? scrollY : 0;
  const view = page === "projects" ? projects() : page === "messages" ? messages(id ? Number(id) : null) : page === "clients" ? clientsView() : page === "reviews" ? reviewsView() : dashboard();
  $("view").replaceChildren(view);
  document.title = `${page[0].toUpperCase() + page.slice(1)} · Studio admin · Creeper & Co.`;
  if (page !== lastPage) scrollTo(0, 0); else scrollTo(0, y);
  lastPage = page;
  if (page === "projects" && id) ticketDrawer(Number(id));
  else if (page === "clients" && id) clientDrawer(id);
  else closeDrawer(false);
}
async function refresh() { await load(); drawTeam(); render(); }
addEventListener("hashchange", render);

await load();
drawTeam();
render();
