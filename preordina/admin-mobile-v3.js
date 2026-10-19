/* Solo elementi grafici: nessuna chiamata a database o modifica alla logica gestionale. */
(function(){
const items=[["dashboard","⌂","Home"],["orders","▣","Ordini"],["bookingPanel","▦","Prenota"],["fidelityPanel","♙","Clienti"],["more","☰","Altro"]];
const nav=document.createElement("nav");nav.className="am-mobile-nav";nav.setAttribute("aria-label","Navigazione gestore");
nav.innerHTML=items.map(([id,icon,name])=>'<button type="button" data-am-tab="'+id+'" '+(id==="dashboard"?'class="am-active"':'')+'><span class="am-icon" aria-hidden="true">'+icon+'</span><span>'+name+'</span></button>').join("");
const dim=document.createElement("div");dim.className="am-dim";dim.setAttribute("aria-hidden","true");document.body.append(dim,nav);
const menu=document.querySelector(".tabs");
function close(){menu?.classList.remove("am-menu-open");dim.classList.remove("am-visible");}
function sync(id){nav.querySelectorAll("button").forEach(b=>b.classList.toggle("am-active",b.dataset.amTab===id||(b.dataset.amTab==="more"&&!items.slice(0,4).some(x=>x[0]===id))));}
function openTab(id){close();if(typeof window.tab==="function"){window.tab(id);}else{document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("on",p.id===id));}sync(id);}
nav.addEventListener("click",e=>{const b=e.target.closest("button[data-am-tab]");if(!b)return;if(b.dataset.amTab==="more"){const open=!menu?.classList.contains("am-menu-open");menu?.classList.toggle("am-menu-open",open);dim.classList.toggle("am-visible",open);}else openTab(b.dataset.amTab);});
dim.addEventListener("click",close);
document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
menu?.addEventListener("click",e=>{const b=e.target.closest("button");if(!b||b.id==="soundBtn")return;setTimeout(()=>{close();const current=document.querySelector(".panel.on");if(current)sync(current.id);},0);});
document.addEventListener("click",e=>{const b=e.target.closest('[onclick*="tab("]');if(!b||b.closest(".tabs"))return;setTimeout(()=>{const active=document.querySelector(".panel.on");if(active)sync(active.id);},0);});
})();
