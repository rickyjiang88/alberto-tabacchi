/* Statistiche Alberto: Google Analytics viene caricato solo dopo il consenso. */
(function () {
  "use strict";
  var measurementId = "G-48N3ETK9N5";
  var storageKey = "alberto_analytics_consent_v1";
  var started = false;
  var panel = null;

  function getChoice() {
    try { return localStorage.getItem(storageKey); } catch (e) { return null; }
  }
  function setChoice(value) {
    try { localStorage.setItem(storageKey, value); } catch (e) {}
  }
  function startAnalytics() {
    window["ga-disable-" + measurementId] = false;
    if (started) { if (window.gtag) window.gtag("event", "page_view"); return; }
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { anonymize_ip: true });
    var tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    document.head.appendChild(tag);
  }
  function hidePanel() {
    if (panel) panel.hidden = true;
  }
  function choose(value) {
    setChoice(value);
    hidePanel();
    if (value === "accepted") startAnalytics();
    else window["ga-disable-" + measurementId] = true;
  }
  function showPanel() {
    if (!panel) return;
    panel.hidden = false;
  }
  function createControls() {
    var css = document.createElement("style");
    css.textContent = "#alberto-cookie-panel[hidden]{display:none!important}#alberto-cookie-panel{position:fixed;z-index:2147483640;left:16px;right:16px;bottom:16px;max-width:520px;background:#fff;color:#242424;border:1px solid #dedede;border-radius:16px;box-shadow:0 8px 35px rgba(0,0,0,.24);padding:18px;font:14px/1.45 Arial,sans-serif;text-align:left}#alberto-cookie-panel b{display:block;font-size:16px;margin-bottom:6px}#alberto-cookie-panel p{margin:0 0 12px}#alberto-cookie-panel .alberto-cookie-actions{display:flex;gap:10px;flex-wrap:wrap}#alberto-cookie-panel button{cursor:pointer;border:1px solid #b5101b;border-radius:8px;padding:10px 14px;font:700 13px Arial,sans-serif;flex:1 1 140px}#alberto-cookie-reject{background:#fff;color:#b5101b}#alberto-cookie-accept{background:#b5101b;color:#fff}#alberto-cookie-panel a{color:#b5101b}#alberto-cookie-settings{display:inline-block;margin:12px 0;color:inherit;font:12px Arial,sans-serif;text-decoration:underline;cursor:pointer}";
    document.head.appendChild(css);
    panel = document.createElement("section");
    panel.id = "alberto-cookie-panel";
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", "Preferenze statistiche");
    panel.hidden = true;
    panel.innerHTML = '<b>Statistiche del sito</b><p>Usiamo Google Analytics per capire quante persone visitano il sito e quali pagine consultano. Le statistiche facoltative si attivano solo se accetti. Puoi cambiare scelta in qualsiasi momento dal link “Impostazioni statistiche” in fondo alla pagina. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Informativa Google</a>.</p><div class="alberto-cookie-actions"><button type="button" id="alberto-cookie-reject">Rifiuta</button><button type="button" id="alberto-cookie-accept">Accetta statistiche</button></div>';
    document.body.appendChild(panel);
    document.getElementById("alberto-cookie-reject").addEventListener("click", function () { choose("declined"); });
    document.getElementById("alberto-cookie-accept").addEventListener("click", function () { choose("accepted"); });
    var footer = document.querySelector("footer");
    if (footer) {
      var settings = document.createElement("button");
      settings.id = "alberto-cookie-settings";
      settings.type = "button";
      settings.textContent = "Impostazioni statistiche";
      settings.addEventListener("click", showPanel);
      footer.appendChild(settings);
    }
    if (!getChoice()) showPanel();
  }
  if (getChoice() === "accepted") startAnalytics();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", createControls);
  else createControls();
})();
