// Shared dark/light mode script with persistence across pages
(function () {
  function apply(mode) {
    document.body.classList.toggle("dark", mode === "dark");
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      var isDark = document.body.classList.contains("dark");
      btn.textContent = isDark ? "Light" : "Dark";
      btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      btn.title = btn.getAttribute("aria-label");
    }
    try { localStorage.setItem("theme", mode); } catch (e) {}
  }

  // Decide initial mode: saved preference -> system preference -> light
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  var prefersDark = false;
  try { prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) {}

  var initial = saved || (prefersDark ? "dark" : "light");
  apply(initial);

  var btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", function () {
      apply(document.body.classList.contains("dark") ? "light" : "dark");
    });
  }
})();
