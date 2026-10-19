
/* ALBERTO Shop Manager v4 — demo isolated (no Firebase, no network, no writes). */
(function(){
"use strict";
const NS="http://www.w3.org/2000/svg";
const paths={
home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
bag:'<path d="M4 8h16l-1 13H5L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-12 6 2 2 4-4"/>',
users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zm7 0v4h-4m4 3h-3"/>',
menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
food:'<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18m11-18c-3 2-4 5-4 9h4v9m0-18v18"/>',
truck:'<path d="M1 6h14v12H1zM15 10h4l4 5v3h-8z"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>',
wallet:'<rect x="3" y="6" width="18" height="15" rx="3"/><path d="M3 10h18M16 15h3"/>',
bell:'<path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10M10 21h4"/>',
chart:'<path d="M4 20V11m6 9V4m6 16v-7m5 7H2"/>',
gift:'<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9c-6 0-7-6-3-6 2 0 3 2 3 6Zm0 0c6 0 7-6 3-6-2 0-3 2-3 6Z"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
box:'<path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5m-9 5v10"/>',
check:'<path d="m4 12 5 5L20 6"/>',
arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
right:'<path d="m9 18 6-6-6-6"/>',
x:'<path d="M6 6 18 18M18 6 6 18"/>',
spark:'<path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Zm7 13 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
file:'<path d="M6 3h9l5 5v13H6zM15 3v6h5M9 14h8M9 18h6"/>',
settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>',
volume:'<path d="M3 9v6h4l5 4V5L7 9zm13-2a7 7 0 0 1 0 10"/>'
};
function icon(name,cls=""){return '<svg aria-hidden="true" class="v4-icon '+cls+'" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">'+(paths[name]||paths.box)+'</svg>'}
const routes=[
 ["orders","Ordini","bag"],
 ["bookingPanel","Prenotazioni","calendar"],
 ["menuHub","Gestione menù","food"],
 ["fidelityPanel","Clienti / Fidelity","users"],
 ["ddtPanel","Consegne / DDT","truck"],
 ["statsPanel","Statistiche","chart"],
 ["officePanel","Tavoli e gruppi","users"],
 ["stockPanel","Disponibilità","box"],
 ["servicePanel","Orari di ritiro","clock"],
 ["pushPanel","Notifiche push","bell"],
 ["promoPanel","Promozioni","gift"],
 ["products","Prodotti","bag"],
 ["daily","Piatti del giorno","food"],
 ["ups","Upselling","spark"],
 ["archivePanel","Archivio ordini","file"]
];
const originalHeader=document.querySelector("body>header");
if(originalHeader){
originalHeader.className="v4-header";
originalHeader.innerHTML='<div class="v4-brand"><div class="v4-logo"><img src="/preordina/shop-manager-icon.png?v=1" alt=""></div><div class="v4-brand-name">ALBERTO<small>SHOP MANAGER</small></div></div><div class="v4-header-actions"><span class="v4-demo-chip">DEMO 2.0</span><button type="button" class="v4-avatar" id="v4-profile" aria-label="Profilo e opzioni">'+icon("settings")+'</button></div>';
}
const dash=document.getElementById("dashboard");
if(dash){
 const kpi=(title,value,note,type,style="")=>'<div class="v4-kpi"><div class="v4-kpi-top"><span class="v4-kpi-label">'+title+'</span><span class="v4-kpi-icon '+style+'">'+icon(type)+'</span></div><strong class="v4-kpi-val '+(value.startsWith("€")?"money":"")+'">'+value+'</strong><small class="v4-kpi-note">'+note+'</small></div>';
 const quick=(id,label,ic,style)=>'<button type="button" class="v4-quick" data-v4-go="'+id+'"><span class="v4-quick-icon '+style+'">'+icon(ic,"lg")+'</span><span class="v4-quick-name">'+label+'</span></button>';
 dash.innerHTML=
 '<div class="v4-hero v4-mainhero"><div class="v4-eyebrow"><span class="dot"></span> IL TUO NEGOZIO, IN TEMPO REALE</div><h1>Tutto sotto controllo.</h1><p>Il tuo lavoro, più semplice. Tutto quello che serve in un unico posto.</p><div class="v4-hero-foot"><button type="button" data-v4-go="orders">Gestisci ordini '+icon("arrow","sm")+'</button><span class="v4-date">19 OTT 2026</span></div></div>'+
 '<div class="v4-summary-title"><h2>Panoramica</h2><span>Oggi · Esempio</span></div>'+
 '<div class="v4-kpi-grid">'+kpi("Ordini oggi","18","4 da confermare","bag")+kpi("Prenotazioni","12","8 confermate","calendar","green")+kpi("Incasso","€ 185","Preordini","wallet","amber")+kpi("Clienti","124","Totale iscritti · demo","users","purple")+'</div>'+
 '<div class="v4-urgent v4-action-card"><span class="v4-urgent-mark">'+icon("bell","lg")+'</span><div class="v4-urgent-copy"><strong>4 ordini da confermare</strong><small>Richiedono la tua attenzione</small></div><button type="button" data-v4-go="orders" aria-label="Visualizza ordini in attesa">'+icon("right")+'</button></div>'+
 '<div class="v4-summary-title"><h2>Accessi rapidi</h2><button type="button" data-v4-menu-open>Vedi tutto '+icon("right","sm")+'</button></div>'+
 '<div class="v4-quick-grid">'+quick("orders","Ordini","bag","")+quick("bookingPanel","Prenotazioni","calendar","green")+quick("fidelityPanel","Clienti","users","blue")+quick("menuHub","Gestione menù","food","orange")+quick("ddtPanel","Consegne / DDT","truck","purple")+quick("v4QR","Scanner QR","qr","dark")+'</div>'+
 '<div class="v4-summary-title"><h2>Ultime attività</h2><button type="button" data-v4-go="orders">Vedi ordini '+icon("right","sm")+'</button></div>'+
 '<div class="v4-activity">'+
 '<div class="v4-activity-item"><span class="v4-activity-icon">'+icon("bag")+'</span><span class="v4-activity-body"><b>Nuovo preordine #1043</b><small>Giulia Bianchi · Ritiro 12:45</small></span><small class="v4-activity-time">10:42</small></div>'+
 '<div class="v4-activity-item"><span class="v4-activity-icon green">'+icon("check")+'</span><span class="v4-activity-body"><b>Prenotazione confermata</b><small>Marco Rossi · 4 persone</small></span><small class="v4-activity-time">10:34</small></div>'+
 '<div class="v4-activity-item"><span class="v4-activity-icon">'+icon("users")+'</span><span class="v4-activity-body"><b>Nuovo cliente Fidelity</b><small>Nuova registrazione</small></span><small class="v4-activity-time">10:20</small></div>'+
 '</div><p class="v4-demo-only">ANTEPRIMA GRAFICA · Nessuna operazione reale</p>';
}
const sampleOrders=[
 {id:1043,name:"Giulia Bianchi",time:"12:45",summary:"1 × Primo + secondo",price:"€ 13,00",state:"waiting"},
 {id:1042,name:"Marco Rossi",time:"12:30",summary:"1 × Primo del giorno<br>1 × Acqua 0,5 L",price:"€ 9,00",state:"waiting"},
 {id:1041,name:"Anna Verdi",time:"13:00",summary:"1 × Secondo con contorno<br>1 × Bibita",price:"€ 13,00",state:"confirmed"}
];
const sampleBookings=[
 {name:"Marco Rossi",time:"12:30",count:4,state:"confirmed"},
 {name:"Giulia Bianchi",time:"13:00",count:6,state:"waiting"},
 {name:"Luca Ferri",time:"13:15",count:2,state:"waiting"}
];
let orderFilter="all";
const statuses={waiting:["Da confermare","wait"],confirmed:["Confermato","done"],delivered:["Consegnato","done"]};
function panelTop(kicker,title,subtitle,ic){return '<div class="v4-subhead"><div class="v4-subhead-left"><div class="v4-subkicker">'+kicker+'</div><h2>'+title+'</h2><p>'+subtitle+'</p></div><span>'+icon(ic,"lg")+'</span></div>';}
function renderOrders(){
 const o=document.getElementById("orders");if(!o)return;
 const selected=sampleOrders.filter(x=>orderFilter==="all"||x.state===orderFilter);
 o.innerHTML=panelTop("ALBERTO SHOP","Ordini","Controlla e gestisci i preordini ricevuti.","bag")+
 '<div class="v4-pills">'+[["all","Tutti"],["waiting","Da confermare"],["confirmed","Confermati"],["delivered","Consegnati"]].map(([key,label])=>'<button type="button" data-v4-filter="'+key+'" class="'+(orderFilter===key?"active":"")+'">'+label+'</button>').join("")+'</div>'+
 selected.map(x=>'<article class="v4-order-card"><div class="v4-order-header"><div><span class="v4-order-id">ORDINE #'+x.id+'</span><strong>'+x.name+'</strong><p>'+icon("clock","sm")+' Ritiro '+x.time+'</p></div><span class="v4-status '+statuses[x.state][1]+'">'+statuses[x.state][0]+'</span></div>'+
 '<div class="v4-order-details"><span>'+x.summary+'</span><b>'+x.price+'</b></div><div class="v4-order-buttons"><button type="button" class="primary" data-v4-order="'+x.id+'" data-v4-act="confirm">'+icon("check","sm")+' Conferma / stampa</button><button type="button" data-v4-order="'+x.id+'" data-v4-act="deliver">Consegnato</button></div></article>').join("")+
 (!selected.length?'<div class="card"><p>Nessun ordine in questa categoria (dati di esempio).</p></div>':"")+
 '<button type="button" data-v4-go="archivePanel" class="red" style="width:100%;margin:6px 0 10px">Vai all’archivio ordini '+icon("right","sm")+'</button>'+
 '<p class="v4-demo-only">I pulsanti simulano soltanto l’aspetto del pannello.</p>';
}
function renderBookings(){
 const el=document.getElementById("bookingPanel");if(!el)return;
 el.innerHTML=panelTop("GESTIONE TAVOLI","Prenotazioni","Orari e coperti, subito visibili.","calendar")+
 '<div class="v4-booking-date"><label for="v4Date">Giorno</label><input id="v4Date" type="date" value="2026-10-19" /></div>'+
 '<div class="v4-countline"><div><b>12</b><small>Richieste</small></div><div><b>8</b><small>Confermate</small></div><div><b>29</b><small>Coperti</small></div></div>'+
 sampleBookings.map((x,i)=>'<article class="v4-booking-card"><div class="v4-booking-top"><b>'+x.name+'</b><span class="v4-status '+statuses[x.state][1]+'">'+statuses[x.state][0]+'</span></div>'+
 '<div class="v4-booking-sub"><span>'+icon("clock","sm")+' '+x.time+'</span><span>'+icon("users","sm")+' '+x.count+' coperti</span></div>'+
 '<div class="v4-booking-actions"><button type="button" data-v4-booking="'+i+'" data-v4-action="confirm">'+icon("check","sm")+' Conferma</button><button type="button" class="secondary" data-v4-booking="'+i+'" data-v4-action="details">Dettagli</button></div></article>').join("")+
 '<p class="v4-demo-only">Dati e prenotazioni di esempio, non collegati al database.</p>';
}
renderOrders();renderBookings();
const drawer=document.createElement("div");drawer.className="v4-menu-overlay";drawer.id="v4Menu";drawer.setAttribute("aria-hidden","true");
drawer.innerHTML='<div class="v4-menu-drawer" role="dialog" aria-modal="true" aria-label="Tutte le sezioni"><div class="v4-menu-grab"></div><div class="v4-menu-head"><b>Tutte le sezioni</b><button type="button" data-v4-close aria-label="Chiudi">'+icon("x")+'</button></div><div class="v4-menu-title">Gestione del locale</div><div class="v4-menu-grid">'+routes.map(([id,name,ic])=>'<button type="button" data-v4-go="'+id+'">'+icon(ic)+' '+name+'</button>').join("")+
 '<button type="button" data-v4-sound>'+icon("volume")+' Suono ordini</button></div><div class="v4-menu-footer">DEMO · Stesse sezioni del gestionale ufficiale</div></div>';
const nav=document.createElement("nav");nav.className="v4-bottom-nav";nav.setAttribute("aria-label","Navigazione principale");
const navs=[["dashboard","Home","home"],["orders","Ordini","bag"],["v4QR","QR","qr"],["fidelityPanel","Clienti","users"],["more","Altro","menu"]];
nav.innerHTML=navs.map(([id,label,ic],i)=>'<button type="button" data-v4-nav="'+id+'" class="'+(i===0?"active ":"")+(id==="v4QR"?"v4-fab":"")+'" aria-label="'+label+'">'+(id==="v4QR"?'<span>'+icon(ic)+'</span>':icon(ic))+'<span>'+label+'</span></button>').join("");
document.body.append(drawer,nav);
function openDrawer(){drawer.classList.add("open");drawer.setAttribute("aria-hidden","false");}
function closeDrawer(){drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true");}
function updateNav(current,qr=false){nav.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.v4Nav===(qr?"v4QR":current)||b.dataset.v4Nav==="more"&&!qr&&!["dashboard","orders","fidelityPanel"].includes(current)));}
function setupQR(qr){
 const camera=document.getElementById("fidelityCameraCard");if(!camera)return;
 if(qr){
 camera.style.display="block";
 let area=document.getElementById("v4QrVisual");
 if(!area){area=document.createElement("div");area.id="v4QrVisual";area.innerHTML='<div style="height:190px;max-width:280px;margin:10px auto;border-radius:19px;background:linear-gradient(145deg,#2b131f,#501b2a);color:white;display:grid;place-items:center;position:relative"><div style="border:3px solid #fff;border-radius:19px;padding:28px;color:#fff">'+icon("qr","lg")+'</div></div><p style="font-size:12px;color:#8d7f84;text-align:center">Anteprima grafica scanner QR.<br>La fotocamera reale rimane nel pannello ufficiale.</p>';camera.append(area);}
 const video=camera.querySelector(".fid-camera");if(video)video.style.display="none";
 }else{
 camera.style.display="none";
 }
}
function goTo(id,qr=false){
 closeDrawer();
 if(id==="v4QR"){id="fidelityPanel";qr=true;}
 if(!document.getElementById(id))return;
 if(typeof window.tab==="function")window.tab(id);
 else document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("on",p.id===id));
 updateNav(id,qr);setupQR(qr);window.scrollTo({top:0,behavior:"instant"});
}
function toast(message){
 const old=document.getElementById("v4Toast");if(old)old.remove();
 const n=document.createElement("div");n.id="v4Toast";n.style.cssText="position:fixed;z-index:105;bottom:calc(92px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);max-width:calc(100% - 40px);width:max-content;background:#301c26;color:#fff;border-radius:14px;padding:12px 17px;font-size:12px;line-height:1.4;box-shadow:0 9px 25px #15081044;text-align:center";
 n.textContent=message;document.body.append(n);setTimeout(()=>n.remove(),2500);
}
document.addEventListener("click",ev=>{
 const el=ev.target.closest("button");if(!el)return;
 if(el.hasAttribute("data-v4-nav")){const id=el.getAttribute("data-v4-nav");if(id==="more")openDrawer();else goTo(id);return;}
 if(el.hasAttribute("data-v4-go")){goTo(el.getAttribute("data-v4-go"));return;}
 if(el.hasAttribute("data-v4-menu-open")){openDrawer();return;}
 if(el.hasAttribute("data-v4-close")){closeDrawer();return;}
 if(el.hasAttribute("data-v4-sound")){toast("La demo non riproduce suoni. Nel gestionale la funzione resta invariata.");return;}
 if(el.id==="v4-profile"){openDrawer();return;}
 if(el.hasAttribute("data-v4-filter")){orderFilter=el.dataset.v4Filter;renderOrders();return;}
 if(el.hasAttribute("data-v4-order")){
 const order=sampleOrders.find(x=>x.id===Number(el.dataset.v4Order));if(!order)return;
 if(el.dataset.v4Act==="confirm"){order.state="confirmed";toast("Conferma simulata · Nessuna stampa inviata");}
 else{order.state="delivered";toast("Consegna simulata · Nessuna modifica reale");}
 renderOrders();return;
 }
 if(el.hasAttribute("data-v4-booking")){
 const b=sampleBookings[Number(el.dataset.v4Booking)];if(!b)return;
 if(el.dataset.v4Action==="confirm"){b.state="confirmed";renderBookings();toast("Prenotazione confermata solo nella demo");}
 else toast("Scheda demo · "+b.name+" · "+b.count+" coperti");
 return;
 }
 if(el.hasAttribute("data-demo-tab")){const id=el.dataset.demoTab;updateNav(id);setupQR(false);return;}
});
drawer.addEventListener("click",e=>{if(e.target===drawer)closeDrawer();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDrawer();});
})();
