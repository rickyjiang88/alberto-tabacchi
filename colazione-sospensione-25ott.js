/* Sospensione temporanea della pagina Colazione: solo domenica 25 ottobre 2026, ora di Milano.
   Lunedì 26 ottobre il sito torna automaticamente normale, senza altri aggiornamenti. */
(function () {
  'use strict';

  var suspensionDate = '2026-10-25';
  var className = 'alberto-colazione-sospesa';
  var style = document.createElement('style');
  style.textContent =
    'html.' + className + ' a[href*="colazione.html"],' +
    'html.' + className + ' article.alberto-colazione-card {display:none!important;}';
  document.head.appendChild(style);

  function dateInMilan() {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Rome',
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    var values = {};
    parts.forEach(function (p) { values[p.type] = p.value; });
    return values.year + '-' + values.month + '-' + values.day;
  }

  function refreshVisibility() {
    var suspended = dateInMilan() === suspensionDate;
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
