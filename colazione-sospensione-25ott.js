/* Sospensione temporanea della pagina Colazione dal 24 ottobre 2026 ore 16:50 (Milano)
   fino al 25 ottobre ore 19:00 (Milano). Poi torna automaticamente normale. */
(function () {
  'use strict';

  var suspensionStart = Date.parse('2026-10-24T16:50:00+02:00');
  var suspensionEnd = Date.parse('2026-10-25T19:00:00+01:00');
  var className = 'alberto-colazione-sospesa';
  var style = document.createElement('style');
  style.textContent =
    'html.' + className + ' a[href*="colazione.html"],' +
    'html.' + className + ' article.alberto-colazione-card {display:none!important;}';
  document.head.appendChild(style);

  function refreshVisibility() {
    var now = Date.now();
    var suspended = now >= suspensionStart && now < suspensionEnd;
    document.documentElement.classList.toggle(className, suspended);
    if (suspended && /\/colazione\.html\/?$/i.test(location.pathname)) {
      location.replace('/');
    }
  }

  function identifyBreakfastCards() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      try {
        var url = new URL(link.getAttribute('href'), location.href);
        if (!/\/colazione\.html\/?$/i.test(url.pathname)) return;
        var article = link.closest('article');
        if (article && article.querySelectorAll('a[href]').length === 1) {
          article.classList.add('alberto-colazione-card');
        }
      } catch (e) { /* Ignora collegamenti non validi */ }
    });
  }

  refreshVisibility();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', identifyBreakfastCards, { once: true });
  } else {
    identifyBreakfastCards();
  }
  setInterval(refreshVisibility, 60000);
})();
