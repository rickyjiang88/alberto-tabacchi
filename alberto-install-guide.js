const CSS="\n#alberto-app-guide[hidden],#alberto-app-guide [hidden]{display:none!important}\n#alberto-app-guide{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(22,16,14,.69);padding:16px;overflow-y:auto;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif}\n#alberto-app-guide *{box-sizing:border-box}\n#alberto-app-guide .ag-panel{position:relative;isolation:isolate;width:min(510px,100%);max-height:calc(100dvh - 32px);overflow-y:auto;overscroll-behavior:contain;background:#fffaf5;border-radius:24px;box-shadow:0 24px 80px rgba(0,0,0,.3);color:#261d1a}\n#alberto-app-guide .ag-header{padding:24px 24px 21px;background:linear-gradient(145deg,#bd121f,#87101c);color:white;position:relative}\n#alberto-app-guide .ag-brand{display:flex;gap:11px;align-items:center;font-size:11px;font-weight:850;letter-spacing:.13em}\n#alberto-app-guide .ag-logo{width:39px;height:39px;object-fit:cover;background:#fff;border-radius:11px;padding:3px}\n#alberto-app-guide .ag-close{position:absolute;right:13px;top:12px;border:0;border-radius:999px;width:36px;height:36px;color:#fff;background:rgba(255,255,255,.2);font-size:24px;line-height:1;cursor:pointer}\n#alberto-app-guide h2{font-size:clamp(23px,5vw,29px);line-height:1.12;letter-spacing:-.04em;margin:17px 0 8px;font-weight:900;color:white}\n#alberto-app-guide .ag-subtitle{margin:0;font-size:13px;line-height:1.5;color:#fff5f4}\n#alberto-app-guide .ag-content{padding:19px 23px 21px}\n#alberto-app-guide .ag-switch{display:grid;grid-template-columns:1fr 1fr;padding:4px;border:1px solid #e5d9d2;background:#f4ede7;border-radius:14px;gap:4px;margin-bottom:14px}\n#alberto-app-guide .ag-tab{border:0;background:transparent;border-radius:10px;padding:11px 9px;font-size:13px;font-weight:850;color:#70625d;cursor:pointer}\n#alberto-app-guide .ag-tab[aria-selected=true]{background:white;color:#b5101b;box-shadow:0 1px 5px #e1d3ca}\n#alberto-app-guide .ag-step{display:grid;grid-template-columns:58px 1fr;align-items:center;gap:12px;border:1px solid #eee2da;background:#fff;border-radius:14px;padding:11px 12px;margin:9px 0}\n#alberto-app-guide .ag-symbol{height:53px;width:55px;border-radius:12px;background:#fff1ef;color:#b5101b;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-weight:950;font-size:26px}\n#alberto-app-guide .ag-symbol small{color:#8a1e28;font-size:9px;letter-spacing:.01em;font-weight:900}\n#alberto-app-guide .ag-step b{display:block;font-size:13px;line-height:1.27;margin-bottom:4px;color:#251c18}\n#alberto-app-guide .ag-step p{font-size:12px;line-height:1.45;color:#635750;margin:0}\n#alberto-app-guide .ag-step-count{color:#b5101b;font-size:10px;font-weight:900;letter-spacing:.05em}\n#alberto-app-guide .ag-smallnote{font-size:11px;line-height:1.4;color:#675b53;background:#f6eee7;padding:10px 11px;border-radius:10px;margin:11px 0 15px}\n#alberto-app-guide .ag-optout{display:flex;align-items:center;gap:10px;min-height:40px;cursor:pointer;font-size:13px;font-weight:750;color:#2c211e}\n#alberto-app-guide .ag-optout input{appearance:auto!important;accent-color:#b5101b;width:19px;height:19px;flex-shrink:0;margin:0;cursor:pointer}\n#alberto-app-guide .ag-primary{display:block;width:100%;margin:11px 0 5px;border:0;border-radius:13px;background:#b5101b;color:white;font-size:13px;font-weight:900;padding:15px;min-height:48px;cursor:pointer}\n#alberto-app-guide .ag-secondary{display:block;margin:8px auto 0;text-align:center;border:0;background:transparent;padding:7px;font-size:12px;font-weight:700;color:#7b6861;cursor:pointer}\n#alberto-app-guide .ag-inline-link{display:block;text-align:center;color:#b5101b;font-size:11px;margin:4px 0 0;text-decoration:underline}\n@media(max-width:520px){#alberto-app-guide{padding:9px}#alberto-app-guide .ag-panel{max-height:calc(100dvh - 18px);border-radius:20px}#alberto-app-guide .ag-header{padding:18px 18px 17px}#alberto-app-guide .ag-content{padding:13px 16px 17px}#alberto-app-guide .ag-step{padding:8px 10px;margin:7px 0;grid-template-columns:49px 1fr;gap:9px}#alberto-app-guide .ag-symbol{width:48px;height:48px;font-size:24px}#alberto-app-guide .ag-step p{font-size:11px}#alberto-app-guide .ag-smallnote{font-size:10px;margin:9px 0 10px}}\n";
const HTML="<div class=\"ag-panel\" role=\"document\">\n  <div class=\"ag-header\">\n    <button type=\"button\" class=\"ag-close\" aria-label=\"Chiudi guida\" data-ag-close>×</button>\n    <div class=\"ag-brand\"><img class=\"ag-logo\" src=\"/fidelity-preview/icon-180.png\" alt=\"\"> ALBERTO FIDELITY</div>\n    <h2 id=\"alberto-app-guide-title\">Alberto, sempre con te.</h2>\n    <p class=\"ag-subtitle\">Metti l'icona sul telefono e accedi a punti, prenotazioni e portafoglio come in un'app.</p>\n  </div>\n  <div class=\"ag-content\">\n    <div class=\"ag-switch\" role=\"tablist\" aria-label=\"Scegli il telefono\">\n      <button type=\"button\" class=\"ag-tab\" role=\"tab\" id=\"ag-tab-ios\" aria-controls=\"ag-steps-ios\" aria-selected=\"false\" data-ag-platform=\"ios\">iPhone</button>\n      <button type=\"button\" class=\"ag-tab\" role=\"tab\" id=\"ag-tab-android\" aria-controls=\"ag-steps-android\" aria-selected=\"false\" data-ag-platform=\"android\">Android</button>\n    </div>\n    <div id=\"ag-steps-ios\" role=\"tabpanel\" aria-labelledby=\"ag-tab-ios\" hidden>\n      <div class=\"ag-step\"><div class=\"ag-symbol\">◉<small>SAFARI</small></div><div><span class=\"ag-step-count\">PASSO 1</span><b>Apri Alberto con Safari</b><p>Se stai usando un altro browser, apri questa pagina in Safari.</p></div></div>\n      <div class=\"ag-step\"><div class=\"ag-symbol\">⇧<small>CONDIVIDI</small></div><div><span class=\"ag-step-count\">PASSO 2</span><b>Tocca Condividi</b><p>In Safari tocca l'icona di condivisione (quadrato con freccia verso l'alto). Se non la vedi, apri prima il menu della pagina.</p></div></div>\n      <div class=\"ag-step\"><div class=\"ag-symbol\">＋<small>HOME</small></div><div><span class=\"ag-step-count\">PASSO 3</span><b>Aggiungi alla schermata Home</b><p>Scorri le opzioni e seleziona «Aggiungi alla schermata Home».</p></div></div>\n      <div class=\"ag-step\"><div class=\"ag-symbol\">✓<small>AGGIUNGI</small></div><div><span class=\"ag-step-count\">PASSO 4</span><b>Conferma l'aggiunta</b><p>Se disponibile, attiva «Apri come app web», poi premi «Aggiungi».</p></div></div>\n    </div>\n    <div id=\"ag-steps-android\" role=\"tabpanel\" aria-labelledby=\"ag-tab-android\" hidden>\n      <div class=\"ag-step\"><div class=\"ag-symbol\">◎<small>CHROME</small></div><div><span class=\"ag-step-count\">PASSO 1</span><b>Apri Alberto in Chrome</b><p>Apri la pagina di Alberto Fidelity con Google Chrome.</p></div></div>\n      <div class=\"ag-step\"><div class=\"ag-symbol\">⋮<small>MENU</small></div><div><span class=\"ag-step-count\">PASSO 2</span><b>Tocca i tre puntini ⋮</b><p>Li trovi nel menu in alto a destra di Chrome.</p></div></div>\n      <div class=\"ag-step\"><div class=\"ag-symbol\">＋<small>INSTALLA</small></div><div><span class=\"ag-step-count\">PASSO 3</span><b>Scegli Installa app</b><p>Seleziona «Installa app» o «Aggiungi alla schermata Home» (la voce può cambiare).</p></div></div>\n      <div class=\"ag-step\"><div class=\"ag-symbol\">✓<small>CONFERMA</small></div><div><span class=\"ag-step-count\">PASSO 4</span><b>Conferma e apri l'icona</b><p>Premi «Installa» o «Aggiungi» e apri Alberto dalla schermata Home.</p></div></div>\n    </div>\n    <div class=\"ag-smallnote\" id=\"ag-context-note\">Non serve scaricare nulla dall'App Store o da Google Play.</div>\n    <label class=\"ag-optout\" for=\"ag-no-more\"><input type=\"checkbox\" id=\"ag-no-more\"> <span>Non mostrare più</span></label>\n    <button type=\"button\" class=\"ag-primary\" id=\"ag-action\">Ho capito</button>\n    <button type=\"button\" class=\"ag-secondary\" data-ag-close>Chiudi e continua</button>\n  </div>\n</div>";

(function(){
  'use strict';
  var STORAGE_KEY='alberto-install-guide-hide-v1';
  var shell=null,wasOverflow='',deferredPrompt=null,shown=false;
  function standalone(){return window.navigator.standalone===true||window.matchMedia('(display-mode: standalone)').matches}
  function mobile(){return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
  function device(){return /Android/i.test(navigator.userAgent)?'android':'ios'}
  function dismissed(){try{return localStorage.getItem(STORAGE_KEY)==='yes'}catch(_){return false}}
  function onAppPage(){return location.pathname.indexOf('/fidelity-preview/')===0}
  function setup(){
    if(shell)return;
    var s=document.createElement('style');
    s.id='alberto-install-guide-styles';s.textContent=CSS;document.head.appendChild(s);
    shell=document.createElement('div');
    shell.id='alberto-app-guide';shell.setAttribute('role','dialog');shell.setAttribute('aria-modal','true');shell.setAttribute('aria-labelledby','alberto-app-guide-title');shell.hidden=true;
    shell.innerHTML=HTML;document.body.appendChild(shell);
    shell.querySelectorAll('[data-ag-platform]').forEach(function(b){b.addEventListener('click',function(){select(b.getAttribute('data-ag-platform'))})});
    shell.querySelectorAll('[data-ag-close]').forEach(function(b){b.addEventListener('click',hide)});
    shell.addEventListener('click',function(e){if(e.target===shell)hide()});
    shell.querySelector('#ag-action').addEventListener('click',async function(){
      if(!onAppPage()){saveChoice();hide();location.assign('/fidelity-preview/');return}
      if(device()==='android'&&deferredPrompt){
        var p=deferredPrompt;deferredPrompt=null;saveChoice();hide();
        try{await p.prompt();await p.userChoice}catch(e){console.warn('Installazione Alberto',e)}
        return;
      }
      hide();
    });
    select(device());
  }
  function select(platform){
    if(!shell)return;
    ['ios','android'].forEach(function(p){
      var active=p===platform;
      shell.querySelector('#ag-tab-'+p).setAttribute('aria-selected',String(active));
      shell.querySelector('#ag-steps-'+p).hidden=!active;
    });
    var note=shell.querySelector('#ag-context-note'),action=shell.querySelector('#ag-action');
    if(!onAppPage()){
      note.textContent='Per installare la versione corretta dell’app, prima apri Alberto Fidelity. Poi segui questi 4 passaggi.';
      action.textContent='Apri Alberto Fidelity';
    }else{
      note.textContent="Non serve scaricare nulla dall'App Store o da Google Play.";
      action.textContent=platform==='android'&&deferredPrompt?'Installa adesso':'Ho capito';
    }
  }
  function saveChoice(){
    if(shell&&shell.querySelector('#ag-no-more').checked){try{localStorage.setItem(STORAGE_KEY,'yes')}catch(_){}}
  }
  function hide(){
    if(!shell||shell.hidden)return;
    saveChoice();shell.hidden=true;document.body.style.overflow=wasOverflow;
  }
  function show(){
    if(!mobile()||standalone()||dismissed())return;
    if(!onAppPage()&&new URLSearchParams(location.search).get('next')==='preordina')return;
    if(!document.body)return;
    setup();
    if(shown)return;
    shown=true;wasOverflow=document.body.style.overflow;
    select(device());shell.hidden=false;document.body.style.overflow='hidden';
  }
  window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault();deferredPrompt=e;
    if(shell)select(device());
  });
  window.addEventListener('appinstalled',hide);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')hide()});
  window.AlbertoInstallGuide={show:show,hide:hide};
})();
