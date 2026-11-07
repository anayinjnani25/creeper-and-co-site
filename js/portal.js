// Client + admin ticket portal. Every rule about who can see or change what is enforced by
// row level security in Supabase; this file only decides what to show.
// All user-written text is rendered with textContent, never innerHTML.
import { supabase, pageUrl } from "./supabase.js";
import { mountScene, mountCursor } from "./scene.js";

mountScene(document.getElementById("bg"));
mountCursor();

const $ = id => document.getElementById(id);
const LABEL = {
  category: { new_project: "New project", change_request: "Change request", bug: "Bug", question: "Question" },
  status: { open: "Open", in_progress: "In progress", waiting_on_client: "Waiting on client", resolved: "Resolved", closed: "Closed" },
  priority: { low: "Low", normal: "Normal", high: "High", urgent: "Urgent" }
};

// ---------- Session ----------
const { data: { session } } = await supabase.auth.getSession();
// Signing in happens on the homepage (nav "Sign in" or the Start a project form)
if (!session) { location.replace(pageUrl("index.html#contact")); await new Promise(() => {}); } // stop here while redirecting
supabase.auth.onAuthStateChange((event) => { if (event === "SIGNED_OUT") location.replace(pageUrl("index.html")); });

const { data: me, error: meErr } = await supabase.from("profiles")
  .select("id, email, full_name, avatar_url, role").eq("id", session.user.id).single();
if (meErr) { toast("Could not load your profile. Try signing in again.", true); throw meErr; }
const isAdmin = me.role === "admin";
// the studio works from the admin panel
if (isAdmin) { const t = location.hash.match(/^#t=(\d+)$/); location.replace(pageUrl(t ? `admin.html#/messages/${t[1]}` : "admin.html")); await new Promise(() => {}); }

// ---------- Helpers ----------
function el(tag, props = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  n.append(...kids.filter(Boolean));
  return n;
}
function toast(text, bad = false) {
  const t = el("div", { class: "toast" + (bad ? " bad" : ""), text, role: "status" });
  document.body.append(t);
  setTimeout(() => t.remove(), 4500);
}
const when = iso => new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const who = p => p ? (p.full_name || p.email) : "Unknown";
const initials = p => who(p).split(/\s+/).map(s => s[0]).join("").slice(0, 2).toUpperCase();
function avatar(p) {
  if (p?.avatar_url?.startsWith("https://")) return el("img", { class: "avatar", src: p.avatar_url, alt: "", referrerpolicy: "no-referrer" });
  return el("span", { class: "avatar", text: initials(p) });
}
const pill = (kind, value) => el("span", { class: `pill ${kind[0]}-${value}`, text: LABEL[kind][value] });

// ---------- Header ----------
$("avatar").replaceWith(Object.assign(avatar(me), { id: "avatar" }));
$("name").textContent = who(me);
$("role").textContent = "Client";
$("signout").addEventListener("click", () => supabase.auth.signOut());

// The studio team (admins), so the chat can show who replied and who is on it
const { data: staffData } = await supabase.from("profiles").select("id, full_name, email, avatar_url, role").eq("role", "admin");
const staff = new Map((staffData ?? []).map(p => [p.id, p]));

// ---------- Views ----------
const portal = $("portal");
function show(view) {
  if (view !== "detail") stopPolling();
  $("newPanel").classList.toggle("hidden", view !== "new");
  $("detail").classList.toggle("hidden", view !== "detail");
  portal.classList.toggle("detail", view !== "list");
  $("main").classList.toggle("chatting", view === "detail");
}
document.querySelectorAll("[data-back]").forEach(b => b.addEventListener("click", () => { history.replaceState(null, "", "#"); show("list"); markCurrent(null); }));
$("newBtn").addEventListener("click", () => { history.replaceState(null, "", "#new"); show("new"); markCurrent(null); $("n-title").focus(); });

// ---------- Ticket list ----------
let tickets = [];
async function loadList() {
  let q = supabase.from("tickets")
    .select("id, title, category, status, priority, updated_at")
    .order("updated_at", { ascending: false }).limit(200);
  const f = $("filter").value;
  if (f === "active") q = q.not("status", "in", "(resolved,closed)");
  else if (f !== "all") q = q.eq("status", f);
  const { data, error } = await q;
  if (error) return toast(error.message, true);
  tickets = data;
  const list = $("list");
  if (!tickets.length) {
    list.replaceChildren(el("li", { class: "empty", text: "Nothing yet. Start a project and we'll get back to you." }));
    return;
  }
  list.replaceChildren(...tickets.map(t => el("li", {},
    el("button", { type: "button", "data-id": t.id, onclick: () => openTicket(t.id) },
      el("span", { class: "t-title", text: t.title }),
      el("span", { class: "t-meta" },
        pill("status", t.status),
        (t.priority === "high" || t.priority === "urgent") && pill("priority", t.priority),
        el("span", { text: `#${t.id} · ${LABEL.category[t.category]}` }),
        el("span", { text: "· " + when(t.updated_at) })
      )
    )
  )));
  markCurrent(currentId);
}
function markCurrent(id) {
  document.querySelectorAll(".list button").forEach(b => b.setAttribute("aria-current", String(b.dataset.id === String(id))));
}
$("filter").addEventListener("change", loadList);

// ---------- New ticket ----------
$("newForm").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = e.submitter; btn.disabled = true;
  const f = new FormData(e.target);
  const { data, error } = await supabase.from("tickets")
    .insert({ title: f.get("title").trim(), description: f.get("description").trim(), category: f.get("category") })
    .select("id").single();
  btn.disabled = false;
  if (error) return toast(error.message, true);
  e.target.reset();
  toast("Request sent. We'll be in touch soon.");
  await loadList();
  openTicket(data.id);
});

// ---------- Ticket detail: a chat with the studio ----------
let currentId = null, current = null, lastCount = -1, poll = null;
const day = iso => { const d = new Date(iso); return d.toDateString() === new Date().toDateString() ? "Today" : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); };
const time = iso => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
const studioAvatar = () => el("span", { class: "avatar studio-mini", text: "C&" });
function stopPolling() { clearInterval(poll); poll = null; }

async function openTicket(id) {
  currentId = id; lastCount = -1;
  history.replaceState(null, "", `#t=${id}`);
  markCurrent(id);
  // row level security only returns your own requests: anyone else's id comes back as "not found"
  const { data: t, error } = await supabase.from("tickets")
    .select("id, title, description, category, status, priority, assigned_to, created_at, updated_at")
    .eq("id", id).single();
  if (error) { toast("That request could not be found.", true); return show("new"); }
  current = t;
  $("d-title").textContent = t.title;
  $("d-ref").textContent = `Request #${t.id} · ${LABEL.category[t.category]}`;
  $("d-status").replaceChildren(pill("status", t.status));
  const closed = t.status === "closed";
  $("replyForm").classList.toggle("hidden", closed);
  $("composeMeta").classList.toggle("hidden", closed);
  $("closedNote").classList.toggle("hidden", !closed);
  drawSide(t);
  show("detail");
  await loadMessages(id);
  stopPolling();
  poll = setInterval(() => { if (!document.hidden && currentId === id) loadMessages(id, true); }, 15000); // new replies show up without a refresh
}

function drawSide(t) {
  const lead = staff.get(t.assigned_to);
  const kv = (k, v) => el("div", { class: "kv-row" }, el("span", { text: k }), typeof v === "string" ? el("b", { text: v }) : v);
  const others = tickets.filter(x => x.id !== t.id).slice(0, 5);
  $("d-side").replaceChildren(...[
    el("div", { class: "side-block" }, el("h4", { text: "Your request" }),
      kv("Status", pill("status", t.status)), kv("Type", LABEL.category[t.category]), kv("Priority", LABEL.priority[t.priority]),
      kv("Opened", new Date(t.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }))),
    el("div", { class: "side-block" }, el("h4", { text: "Who's on it" }),
      el("div", { class: "lead" }, lead ? avatar(lead) : studioAvatar(), el("div", {}, el("b", { text: lead ? who(lead) : "The studio team" }), el("small", { text: "Creeper & Co." })))),
    el("div", { class: "side-block" }, el("h4", { text: "The brief" }), el("p", { class: "brief", text: t.description })),
    others.length ? el("div", { class: "side-block" }, el("h4", { text: "Your other requests" }),
      el("div", { class: "mini" }, ...others.map(x => el("button", { type: "button", onclick: () => openTicket(x.id) }, el("span", { text: `#${x.id} ${x.title}` }), pill("status", x.status))))) : null
  ].filter(Boolean));
}

async function loadMessages(id, quiet = false) {
  const { data, error } = await supabase.from("ticket_messages")
    .select("id, body, author_id, created_at, author:profiles!ticket_messages_author_id_fkey(full_name, email, avatar_url, role)")
    .eq("ticket_id", id).order("created_at");
  if (error) { if (!quiet) toast(error.message, true); return; }
  if (quiet && data.length === lastCount) return;
  const isNew = lastCount >= 0 && data.length > lastCount;
  lastCount = data.length;
  const items = [{ at: current.created_at, mine: true, author: me, body: `${current.title}\n\n${current.description}` },
    ...data.map(m => ({ at: m.created_at, mine: m.author_id === me.id, author: m.author, body: m.body }))];
  const box = $("thread"); box.replaceChildren();
  let d = "";
  for (const it of items) {
    if (day(it.at) !== d) { d = day(it.at); box.append(el("div", { class: "day", text: d })); }
    box.append(el("div", { class: "msg" + (it.mine ? " mine" : "") },
      it.mine ? null : (it.author?.avatar_url?.startsWith("https://") ? avatar(it.author) : studioAvatar()),
      el("div", { class: "bub", text: it.body }),
      el("div", { class: "by", text: `${it.mine ? "You" : who(it.author) + " · Creeper & Co."} · ${time(it.at)}` })));
  }
  if (!data.length) box.append(el("p", { class: "waiting", text: "We've got your request. A reply usually comes within one working day, and it will show up here." }));
  const sc = $("chScroll");
  if (!quiet || isNew) requestAnimationFrame(() => sc.scrollTop = sc.scrollHeight);
  if (quiet && isNew) loadList();
}

const replyBox = $("r-body");
replyBox.addEventListener("input", () => { replyBox.style.height = "auto"; replyBox.style.height = Math.min(160, replyBox.scrollHeight) + "px"; });
replyBox.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("replyForm").requestSubmit(); } });
$("replyForm").addEventListener("submit", async e => {
  e.preventDefault();
  const body = replyBox.value.trim();
  if (!body || !currentId) return;
  const btn = e.target.querySelector(".send"); btn.disabled = true;
  const { error } = await supabase.from("ticket_messages").insert({ ticket_id: currentId, body });
  btn.disabled = false;
  if (error) return toast(error.message, true);
  replyBox.value = ""; replyBox.style.height = "";
  await loadMessages(currentId);
  loadList();
});

// ---------- Start ----------
await loadList();
const m = location.hash.match(/^#t=(\d+)$/);
if (m) openTicket(Number(m[1]));
else if (location.hash === "#new" || !tickets.length) show("new");
else if (tickets.length && matchMedia("(min-width: 861px)").matches) openTicket(tickets[0].id);
else show("list");
