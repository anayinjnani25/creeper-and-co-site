// Runs before the page paints, so a saved light theme doesn't flash dark first (inline scripts are blocked by the CSP)
try { if (localStorage.getItem("cc-admin-theme") === "light") document.documentElement.dataset.theme = "light"; } catch (e) {}
