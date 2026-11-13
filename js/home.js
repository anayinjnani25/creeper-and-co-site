// Homepage sign-in + "Start a project" form. The form opens a WhatsApp chat with the studio, the message
// already written. Returning clients still sign in with Google from the nav to see My projects.
import { supabase, pageUrl } from "./supabase.js";

const $ = id => document.getElementById(id);
const form = $("contactForm");

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
    // Returning clients sign in from the nav button or the small link under the form, and land in My projects
    ["navSignIn", "signInLink"].forEach(id => $(id).addEventListener("click", async e => {
      const btn = e.currentTarget;
      btn.disabled = true;
      const { error } = await signIn("portal.html");
      if (error) { btn.disabled = false; toast(error.message); }
    }));
    return;
  }
  $("navSignIn").remove();
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

// ---------- Form: the enquiry goes to the studio's WhatsApp, already written out ----------
const WHATSAPP = "918669180693";
const waLink = d => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  `Hi Stydio!${d.name?.trim() ? ` I'm ${d.name.trim()}.` : ""}\nI need: ${d.type}\n\n${(d.message || "").trim()}`)}`;

function sendWhatsApp(d) {
  const url = waLink(d);
  const win = window.open(url, "_blank");   // not "noopener": that makes open() return null even when the tab opened
  if (win) win.opener = null;
  if (!win) location.href = url;          // pop-up blocked (or a phone): go straight to WhatsApp
  form.classList.add("hidden");
  $("sentLink").href = url;
  $("sent").classList.remove("hidden");
  $("sent").scrollIntoView({ behavior: "smooth", block: "center" });
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
  if (!form.elements.name.value && profile?.full_name) form.elements.name.value = profile.full_name;
}

form.addEventListener("submit", e => {
  e.preventDefault();
  sendWhatsApp(Object.fromEntries(new FormData(form)));
});
