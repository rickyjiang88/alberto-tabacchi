/* Alberto · Tema Brasile temporaneo per il ballottaggio del 25 ottobre 2026.
   Attivo dal 24/10/2026 ore 16:50 (CEST) al 25/10/2026 ore 23:00 (CET).
   Nessuna modifica permanente ai CSS o al listino del sito. */
(function () {
  'use strict';
  var from = Date.parse('2026-10-24T16:50:00+02:00');
  var until = Date.parse('2026-10-25T23:00:00+01:00');
  var className = 'alberto-brasile-2026';
  var style = document.createElement('style');
  style.id = 'alberto-tema-brasile-2026';
  style.textContent = [
    'html.' + className + ' { --r:#087a38!important;--r2:#04602a!important;--red:#087a38!important;--br-green:#087a38;--br-blue:#163d96;--br-yellow:#ffdf24;--br-dark:#064e29; }',
    'html.' + className + ' body { accent-color:#087a38; }',
    'html.' + className + ' .site-topbar,html.' + className + ' .topbar:not(header),html.' + className + ' .topbar.header-site {background:#087a38!important;color:#fff!important;border-bottom:3px solid #ffdf24!important;}',
    'html.' + className + ' .site-topbar a,html.' + className + ' .site-topbar span {color:#fff!important;-webkit-text-fill-color:#fff!important;}',
    'html.' + className + ' header:not(.topbar) {border-bottom:4px solid #ffdf24!important;}',
    'html.' + className + ' header:not(.topbar) nav a.active,html.' + className + ' header:not(.topbar) nav a:hover,html.' + className + ' header:not(.topbar) .brand b,html.' + className + ' header:not(.topbar) .brand strong {color:#087a38!important;}',
    'html.' + className + ' header:not(.topbar) nav a {text-decoration-color:#087a38!important;}',
    'html.' + className + ' .pill,html.' + className + ' .btn:not(.ghost):not(.outline):not(.dark),html.' + className + ' .cta,html.' + className + ' .welcome-preorder {background:#087a38!important;color:#fff!important;border-color:#087a38!important;}',
    'html.' + className + ' .pill:hover,html.' + className + ' .btn:not(.ghost):not(.outline):not(.dark):hover {background:#065b2d!important;}',
    'html.' + className + ' .redlabel,html.' + className + ' .eyebrow.red,html.' + className + ' .service-strip span,html.' + className + ' .service-strip article>a span,html.' + className + ' .n,html.' + className + ' .local-seo-link,html.' + className + ' .marketing aside a {color:#087a38!important;}',
    'html.' + className + ' .hero .shade {background:linear-gradient(90deg,rgba(4,56,32,.92),rgba(3,49,45,.62) 58%,rgba(9,33,71,.12))!important;}',
    'html.' + className + ' .hero .eyebrow,html.' + className + ' .hero .ey,html.' + className + ' .hero-copy .eyebrow {color:#ffdf24!important;}',
    'html.' + className + ' .hero h1 {text-shadow:0 3px 18px rgba(0,0,0,.22);}',
    'html.' + className + ' .service-strip,html.' + className + ' .strip {border-top:5px solid #ffdf24!important;}',
    'html.' + className + ' .marketing,html.' + className + ' .local-seo,html.' + className + ' .services {background:#f6fff4!important;}',
    'html.' + className + ' .marketing aside,html.' + className + ' .three article,html.' + className + ' .local-seo-grid article {border-top-color:#087a38!important;}',
    'html.' + className + ' .contact,html.' + className + ' .contact-strip {background:#087a38!important;color:#fff!important;}',
    'html.' + className + ' footer {border-top:5px solid #ffdf24!important;background:#102e62!important;color:#eaf1ff!important;}',
    'html.' + className + ' .fid-home-promo {background:linear-gradient(120deg,#076b34 0%,#087a38 58%,#17429b 100%)!important;border-bottom:4px solid #ffdf24!important;}',
    'html.' + className + ' .fid-home-kicker {color:#ffdf24!important;}',
    'html.' + className + ' .fid-home-cta {color:#075a2c!important;background:#ffdf24!important;}',
    'html.' + className + ' .fid-home-login {color:#fff!important;}',
    'html.' + className + ' .welcome-card {border-top:5px solid #ffdf24!important;}',
    'html.' + className + ' .welcome-enter {border-color:#087a38!important;color:#087a38!important;}',
    'html.' + className + ' .brazil-2026-banner {display:flex;align-items:center;justify-content:center;gap:10px;padding:12px 18px;background:#153d93;color:#fff;border-bottom:4px solid #ffdf24;text-align:center;font:800 13px/1.35 Manrope,Arial,sans-serif;letter-spacing:.045em;}',
    'html.' + className + ' .brazil-2026-banner b {color:#ffdf24;}',
    'html.' + className + ' header.topbar {border-bottom:4px solid #ffdf24!important;}',
    'html.' + className + ' header.topbar .main-site-nav a.active-area,html.' + className + ' header.topbar .main-site-nav a:hover {color:#087a38!important;}',
    'html.' + className + ' header.topbar .site-toggle span {background:#087a38!important;}',
    '@media(max-width:650px){html.' + className + ' .brazil-2026-banner {padding:10px 12px;font-size:11px;letter-spacing:0;line-height:1.4;flex-wrap:wrap;}html.' + className + ' .fid-home-promo {border-bottom-width:3px!important;}}'
  ].join('\n');
  document.head.appendChild(style);

  function active() {
    var now = Date.now();
    return now >= from && now < until;
  }

  function applyTheme() {
    var on = active();
    document.documentElement.classList.toggle(className, on);
    if (!document.body) return;
    var banner = document.getElementById('alberto-brasile-2026-banner');
    if (!on) {
      if (banner) banner.remove();
      return;
    }
    // Solo sito informativo: non aggiungere banner nella schermata app Area Clienti.
    if (/\/areaclienti\.html$/i.test(location.pathname)) return;
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'alberto-brasile-2026-banner';
      banner.className = 'brazil-2026-banner';
      banner.setAttribute('role', 'note');
      banner.innerHTML = '<span aria-hidden="true">🇧🇷</span><span><b>SPECIALE BRASILE</b> · DOMENICA 25 OTTOBRE</span><span aria-hidden="true">🇧🇷</span>';
      var top = document.querySelector('.site-topbar');
      if (top && top.parentNode) top.insertAdjacentElement('afterend', banner);
      else document.body.insertBefore(banner, document.body.firstChild);
    }
  }

  applyTheme();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTheme, {once:true});
  }
  setInterval(applyTheme, 30000);
  if (Date.now() < until && until - Date.now() < 2147483647) {
    setTimeout(applyTheme, until - Date.now() + 10);
  }
  window.addEventListener('pageshow', applyTheme);
  document.addEventListener('visibilitychange', applyTheme);
})();
