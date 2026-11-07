// Homepage sign-in + "Start a project" form. The form opens a ticket, shown to clients in My projects.
// Signed-out visitors fill in the form first; pressing send signs them in with Google, brings them
// back here and sends the saved draft, so they never have to type it twice.
import { supabase, pageUrl } from "./supabase.js";

const DRAFT_KEY = "cc-draft";
const $ = id => document.getElementById(id);
const form = $("contactForm");

const store = {
  get() { try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)); } catch { return null; } },
  set(v) { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch {} },
  clear() { try { sessionStorage.removeItem(DRAFT_KEY); } catch {} }
};

function toast(text) {
  const t = Object.assign(document.createElement("div"), { className: "toast", textContent: text });
  t.setAttribute("role", "status");
  document.body.append(t);
  setTimeout(() => t.remove(), 6000);
}

function signIn(back) {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: pageUrl(back), queryParams: { prompt: "select_account" } }
  });
}

// ---------- Nav: one button. "Start a project" signed out, avatar + "My projects" signed in ----------
function renderNav(session, profile) {
  const slot = $("authSlot");
  if (!session) {
    // Returning clients sign in from the small link under the form and land in My projects
    $("signInLink").addEventListener("click", async e => {
      e.currentTarget.disabled = true;
      const { error } = await signIn("portal.html");
      if (error) { e.currentTarget.disabled = false; toast(error.message); }
    });
    return;
  }
  $("returning").classList.add("hidden");
  const link = Object.assign(document.createElement("a"), { className: "pill magnetic", href: "portal.html" });
  const url = profile?.avatar_url;
  if (url?.startsWith("https://")) {
    const img = Object.assign(document.createElement("img"), { className: "av", src: url, alt: "" });
    img.referrerPolicy = "no-referrer";
    link.append(img);
  }
  link.append(document.createTextNode("My projects"));
  slot.replaceChildren(link);
}

// ---------- Form ----------
const CATEGORY = { "Changes to an existing project": "change_request", "Not sure yet": "question" };

async function sendTicket(d) {
  const btn = $("sendBtn");
  btn.disabled = true;
  const name = (d.name || "").trim();
  const { data, error } = await supabase.from("tickets").insert({
    title: `${d.type}${name ? " for " + name : ""}`.slice(0, 140),
    description: d.message.trim(),
    category: CATEGORY[d.type] ?? "new_project"
  }).select("id").single();
  btn.disabled = false;
  if (error) { toast(error.message); return; }
  store.clear();
  form.reset();
  form.classList.add("hidden");
  $("sentId").textContent = "#" + data.id;
  $("sentLink").href = `portal.html#t=${data.id}`;
  $("sent").classList.remove("hidden");
  $("sent").scrollIntoView({ behavior: "smooth", block: "center" });
}

function fill(d) {
  if (!d) return;
  form.elements.name.value = d.name ?? "";
  form.elements.type.value = d.type ?? form.elements.type.value;
  form.elements.message.value = d.message ?? "";
}

// ---------- Start ----------
const params = new URLSearchParams(location.search);
const { data: { session } } = await supabase.auth.getSession();
let profile = null;
if (session) {
  ({ data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", session.user.id).single());
}
renderNav(session, profile);

if (params.get("error_description")) toast(params.get("error_description"));

if (session) {
  $("sendLabel").textContent = "Send request";
  $("formNote").textContent = `Signed in as ${session.user.email}. We'll reply in My projects.`;
  if (!form.elements.name.value && profile?.full_name) form.elements.name.value = profile.full_name;
}

// Back from Google with a saved draft: send it now
if (params.has("send")) {
  history.replaceState(null, "", location.pathname + "#contact");
  const draft = store.get();
  document.getElementById("contact").scrollIntoView({ block: "start" });
  if (session && draft?.message) await sendTicket(draft);
  else fill(draft);
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  if (session) return sendTicket(d);
  store.set(d);
  $("sendBtn").disabled = true;
  const { error } = await signIn("index.html?send=1");
  if (error) { $("sendBtn").disabled = false; toast(error.message); }
});
