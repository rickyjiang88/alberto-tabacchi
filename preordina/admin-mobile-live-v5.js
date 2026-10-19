/* Alberto Shop Manager 3.0 — solo interfaccia; lascia intatti gli ID, i listener,
 * la logica Firebase, i punti, wallet, registrazioni, DDT, ordini e gli elementi esistenti. */
(function(){
"use strict";
if(!window.matchMedia("(max-width:760px)").matches)return;
const icons={
home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
bag:'<path d="M4 8h16l-1 13H5L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-12 6 2 2 4-4"/>',
users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zm7 0v4h-4m4 3v5m-4-5h4"/>',
menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
food:'<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18m11-18c-3 2-4 5-4 9h4v9m0-18v18"/>',
truck:'<path d="M1 6h14v12H1zM15 10h4l4 5v3h-8z"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>',
bell:'<path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10M10 21h4"/>',
chart:'<path d="M4 20V11m6 9V4m6 16v-7m5 7H2"/>',
gift:'<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9c-6 0-7-6-3-6 2 0 3 2 3 6Zm0 0c6 0 7-6 3-6-2 0-3 2-3 6Z"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
box:'<path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5m-9 5v10"/>',
arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
x:'<path d="M6 6 18 18M18 6 6 18"/>',
wallet:'<rect x="3" y="6" width="18" height="15" rx="3"/><path d="M3 10h18M16 15h3"/>',
file:'<path d="M6 3h9l5 5v13H6zM15 3v6h5M9 14h8M9 18h6"/>',
spark:'<path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Z"/>'
};
const ico=(name,cls="")=>'<svg class="al-v5-icon '+cls+'" aria-hidden="true" viewBox="0 0 24 24">'+(icons[name]||icons.box)+'</svg>';
const routes=[["orders","Ordini","bag"],["bookingPanel","Prenotazioni","calendar"],["menuHub","Gestione menù","food"],["fidelityPanel","Clienti / Fidelity","users"],["ddtPanel","Consegne / DDT","truck"],["statsPanel","Statistiche","chart"],["officePanel","Tavoli e gruppi","users"],["stockPanel","Disponibilità prodotti","box"],["servicePanel","Orari di ritiro","clock"],["pushPanel","Notifiche push","bell"],["promoPanel","Promozioni","gift"],["products","Prodotti","bag"],["daily","Piatti del giorno","food"],["ups","Upselling","spark"],["archivePanel","Archivio ordini","file"],["haccpScadenze","Scadenze prodotti","clock"],["haccpAllergeniTotale","Libro allergeni completo","file"],["haccpAllergeniGiornaliero","Libro allergeni giornaliero","food"],["haccpPulizia","Pulizia e sanificazione","spark"],["haccpFrigoriferi","Controllo frigoriferi","box"]];
/* Gruppi soltanto per la presentazione: le destinazioni rimangono quelle originali. */
const routeGroups=[
 {title:"Operatività",subtitle:"Da gestire durante il servizio",tone:"live",ids:["orders","bookingPanel","officePanel","servicePanel"]},
 {title:"Clienti e comunicazioni",subtitle:"Fidelity, avvisi e promozioni",tone:"clients",ids:["fidelityPanel","pushPanel","promoPanel"]},
 {title:"Gestione interna",subtitle:"Menù, prodotti e disponibilità",tone:"internal",ids:["menuHub","products","daily","stockPanel","ups"]},
 {title:"Controllo e documenti",subtitle:"Consegne, report e storico",tone:"control",ids:["ddtPanel","statsPanel","archivePanel"]},
 {title:"HACCP",subtitle:"Igiene alimentare · Schede da compilare",tone:"haccp",ids:["haccpScadenze","haccpAllergeniTotale","haccpAllergeniGiornaliero","haccpPulizia","haccpFrigoriferi"]}
];
function renderDrawerGroups(){
 const names=Object.fromEntries(routes.map(r=>[r[0],r]));
 return routeGroups.map(g=>{
  const buttons=g.ids.map((id,index)=>{
   const item=names[id];
   if(!item)return "";
   const primary=g.tone==="live"&&index<2;
   return '<button type="button" data-al-go="'+id+'" class="al-v6-menu-action'+(primary?' al-v6-action-priority':'')+'">'+
    '<span class="al-v6-action-icon">'+ico(item[2])+'</span>'+
    '<span class="al-v6-action-label">'+item[1]+'</span>'+
    (primary?'<span class="al-v6-action-chevron">'+ico("arrow","sm")+'</span>':'')+
    '</button>';
  }).join("");
  return '<section class="al-v6-menu-group al-v6-menu-group--'+g.tone+'">'+
   '<div class="al-v6-group-heading"><h3>'+g.title+'</h3><p>'+g.subtitle+'</p></div>'+
   '<div class="al-v6-group-grid">'+buttons+'</div></section>';
 }).join("");
}
const header=document.querySelector("body>header"),dash=document.getElementById("dashboard"),tabs=document.querySelector(".tabs");
if(!header||!dash||!tabs||document.getElementById("al-v5-nav"))return;
header.classList.add("al-v5-header");
const logo=document.createElement("img");logo.className="al-brand-icon";logo.src="/preordina/shop-manager-icon.png?v=1";logo.alt="";header.prepend(logo);
const title=header.querySelector("h1");if(title){const cap=document.createElement("span");cap.className="al-brand-caption";cap.textContent="GESTIONE LOCALE";title.append(cap)}
const hero=document.createElement("div");hero.className="al-v5-hero";hero.innerHTML='<div class="al-v5-eyebrow">ALBERTO · SHOP MANAGER 3.0</div><h2>Tutto sotto controllo.</h2><p>Ordini, prenotazioni, clienti e gestione locale in un unico posto.</p><div class="al-v5-hero-foot"><button type="button" data-al-go="orders">Gestisci ordini '+ico("arrow","sm")+'</button><span class="al-v5-date" id="al-v5-date"></span></div>';
dash.prepend(hero);
const date=hero.querySelector("#al-v5-date");if(date){date.textContent=new Intl.DateTimeFormat("it-IT",{timeZone:"Europe/Rome",day:"numeric",month:"short",year:"numeric"}).format(new Date()).toUpperCase()}
const sub=(name,detail)=>{const el=document.createElement("div");el.className="al-v5-section-head";el.innerHTML='<h3>'+name+'</h3><span>'+detail+'</span>';return el};
const kpis=dash.querySelector("#dashKpis");if(kpis)dash.insertBefore(sub("Panoramica","Dati aggiornati"),kpis);
const quick=document.createElement("div");quick.className="al-v5-quick-grid";
const links=[["orders","Ordini","bag"],["bookingPanel","Prenotazioni","calendar"],["fidelityPanel","Clienti","users"],["menuHub","Gestione menù","food"],["ddtPanel","Consegne / DDT","truck"],["qr","Scanner QR","qr"]];
for(const [id,label,ic] of links){const b=document.createElement("button");b.type="button";b.className="al-v5-quick";b.dataset.alGo=id;b.innerHTML='<span class="al-v5-quick-icon">'+ico(ic,"large")+'</span><span class="al-v5-quick-name">'+label+'</span>';quick.append(b)}
const quickhead=sub("Accessi rapidi","Gestisci il locale");if(kpis){kpis.after(quickhead);quickhead.after(quick)}
const recent=dash.querySelector(".card");if(recent)recent.before(sub("Ultimi ordini","Oggi"));
const bottom=document.createElement("nav");bottom.id="al-v5-nav";bottom.className="al-v5-bottom";bottom.setAttribute("aria-label","Navigazione principale");
bottom.innerHTML=[["dashboard","Home","home"],["orders","Ordini","bag"],["qr","QR","qr"],["fidelityPanel","Clienti","users"],["more","Altro","menu"]].map(([id,label,ic],n)=>'<button type="button" data-al-go="'+id+'" class="'+(n===0?"selected ":"")+(id==="qr"?"al-v5-qr":"")+'" aria-label="'+label+'">'+(id==="qr"?'<span class="al-v5-qr-round">'+ico(ic)+'</span>':ico(ic))+'<span>'+label+'</span></button>').join("");
const shade=document.createElement("div");shade.className="al-v5-shade";shade.id="al-v5-shade";shade.setAttribute("aria-hidden","true");
shade.innerHTML='<div class="al-v5-drawer" role="dialog" aria-modal="true" aria-label="Tutte le sezioni"><div class="al-v5-handle"></div><div class="al-v5-drawer-title"><strong>Tutte le sezioni</strong><button type="button" class="al-v5-close" data-al-close aria-label="Chiudi">×</button></div><div class="al-v6-menu-groups">'+renderDrawerGroups()+'</div><div class="al-v5-extra-controls" id="al-v5-controls"></div></div>';
document.body.append(shade,bottom);
// Il pulsante suono ORIGINALE rimane dov’è: stessa funzionalità, nessun elemento rimosso.
const soundAction=document.createElement("button");soundAction.type="button";soundAction.id="al-v5-audio";soundAction.textContent="🔔 Attiva suono ordini";shade.querySelector("#al-v5-controls").append(soundAction);
let isOpen=false;
function toggleMenu(shouldOpen){isOpen=shouldOpen;shade.classList.toggle("open",isOpen);shade.setAttribute("aria-hidden",isOpen?"false":"true");}
function refreshSelected(id){bottom.querySelectorAll("button").forEach(b=>b.classList.toggle("selected",b.dataset.alGo===id||b.dataset.alGo==="more"&&!["dashboard","orders","fidelityPanel","qr"].includes(id)))}
function navigate(id){
 if(id==="more"){toggleMenu(true);return}
 toggleMenu(false);
 if(id==="qr"){if(typeof window.tab==="function")window.tab("fidelityPanel");refreshSelected("qr");if(typeof window.openFidelityCamera==="function")window.openFidelityCamera();return}
 if(!document.getElementById(id))return;
 if(typeof window.tab==="function")window.tab(id); // usa la navigazione ORIGINALE, attiva gli stessi caricamenti e handler
 refreshSelected(id);
}
document.addEventListener("click",e=>{
 const close=e.target.closest("[data-al-close]");if(close){toggleMenu(false);return}
 if(e.target.closest("#al-v5-audio")){if(typeof window.enableOrderSound==="function"){window.enableOrderSound();soundAction.textContent="🔔 Suono attivo"}toggleMenu(false);return}
 const go=e.target.closest("button[data-al-go]");if(go){navigate(go.dataset.alGo);return}
 // Aggiorna soltanto la selezione quando i link ORIGINALI cambiano scheda.
 const original=e.target.closest('button[onclick*="tab("]');if(original){setTimeout(()=>{const current=document.querySelector("main .panel.on");if(current)refreshSelected(current.id)},0)}
});
shade.addEventListener("click",e=>{if(e.target===shade)toggleMenu(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape")toggleMenu(false)});
})();
