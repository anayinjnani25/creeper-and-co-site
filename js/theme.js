// Runs in <head> before the page paints, so a saved light theme doesn't flash dark first
// (inline scripts are blocked by the CSP). The toggle button in the nav is wired up at the end.
(() => {
  const KEY = "cc-theme", root = document.documentElement;
  try { if (localStorage.getItem(KEY) === "light") root.dataset.theme = "light"; } catch (e) {}
  const set = mode => {
    root.dataset.theme = mode;
    try { localStorage.setItem(KEY, mode); } catch (e) {}
    dispatchEvent(new CustomEvent("themechange", { detail: mode }));
  };
  addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
      const sync = () => {
        const light = root.dataset.theme === "light";
        btn.setAttribute("aria-pressed", String(light));
        btn.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
      };
      sync();
      btn.addEventListener("click", () => { set(root.dataset.theme === "light" ? "dark" : "light"); sync(); });
    });
  });
})();
