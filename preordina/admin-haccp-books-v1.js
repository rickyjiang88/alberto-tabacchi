/* Alberto HACCP · Consultazione libro completo e stampa libro giornaliero.
 * Lettura menu da Firebase tramite API in sola lettura; nessun salvataggio di ricette in Firebase.
 * Conferme e archivio di lavoro SOLO locali, non archivio HACCP ufficiale condiviso. */
(function(){
"use strict";
if(!window.matchMedia("(max-width:760px)").matches)return;
const full=document.getElementById("haccpAllergeniTotale");
const daily=document.getElementById("haccpAllergeniGiornaliero");
if(!full||!daily||document.getElementById("al-books-full"))return;
const DATA="/preordina/haccp-allergeni-data-v1.json?v=20261019b";
const APPROVALS="alberto-haccp-conferme-ricette-locali-v1";
const HISTORY="alberto-haccp-giornalieri-locali-v1";
let catalog=null,latest=null,preview=[];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=s=>String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
const dateIT=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Rome",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()).replace(/(\d{2})\/(\d{2})\/(\d{4})/,"$3-$1-$2");
const shortDate=iso=>{const a=String(iso||"").split("-");return a.length===3?a[2]+"/"+a[1]+"/"+a[0]:String(iso||"")};
const loadLocal=(key)=>{try{const d=JSON.parse(localStorage.getItem(key)||"{}");return d&&typeof d==="object"?d:{}}catch(e){return {}}};
const writeLocal=(key,x)=>{try{localStorage.setItem(key,JSON.stringify(x));return true}catch(e){return false}};
async function loadCatalog(){
 if(catalog)return catalog;
 const resp=await fetch(DATA,{cache:"no-store",credentials:"same-origin"});
 if(!resp.ok)throw Error("Il ricettario non è raggiungibile (HTTP "+resp.status+").");
 const obj=await resp.json();
 if(!obj||!Array.isArray(obj.recipes)||!obj.sourceText)throw Error("Dati del libro incompleti");
 catalog=obj;return obj;
}
function addBookPanel(section,id,html){
 const parent=section.querySelector(".al-haccp-top")?.parentElement||section;
 const box=document.createElement("div");box.id=id;box.className="al-books-area";box.innerHTML=html;
 const warning=section.querySelector(".al-haccp-warning");
 if(warning)warning.before(box);else parent.prepend(box);
 const form=section.querySelector(".al-haccp-form");
 const list=section.querySelector(".al-haccp-records");
 if(form){
  const detail=document.createElement("details");detail.className="al-books-manual";
  detail.innerHTML='<summary>Compila o consulta una scheda manuale (bozza locale)</summary>';
  form.before(detail);detail.append(form);if(list)detail.append(list);
 }
 return box;
}
const fullBox=addBookPanel(full,"al-books-full",
 '<div class="al-books-card"><h3>Libro completo · ricettario permanente</h3>'+
 '<p>Consultazione del libro ingredienti e allergeni già raccolto. Le ricette con verifiche aperte non sono approvate automaticamente.</p>'+
 '<div class="al-books-actions"><button type="button" id="al-books-open-full">Apri il libro in PDF</button></div>'+
 '<p class="al-books-info" id="al-books-full-message">Il file è generato dal materiale del libro integrato del 19 ottobre. È una copia di consultazione, non una nuova convalida degli allergeni.</p></div>');
const dailyBox=addBookPanel(daily,"al-books-daily",
 '<div class="al-books-card"><h3>Libro giornaliero · dal menù del giorno</h3>'+
 '<p>I piatti arrivano dal menù che hai già salvato in Shop Manager. Nessun inserimento doppio.</p>'+
 '<div class="al-books-actions"><button type="button" id="al-books-refresh">Leggi il menù salvato</button>'+
 '<button type="button" id="al-books-open-daily" disabled>Apri PDF del giorno</button></div>'+
 '<p id="al-books-menu-date" class="al-books-info">Apri la scheda per leggere il menù da Firebase.</p>'+
 '<p class="al-books-info">Le ricette nuove o non ancora controllate risultano <b>DA VERIFICARE</b>. Il PDF sarà marcato come bozza finché non saranno state confermate.</p>'+
 '<div id="al-books-dishes" class="al-books-dishes"></div></div>'+
 '<div class="al-books-card"><h3>Archivio dei PDF giornalieri</h3>'+
 '<p class="al-books-info">Le copie sono salvate solo su questo dispositivo: non sono un archivio HACCP condiviso. Per conservarle ufficialmente servirà il salvataggio protetto sul server.</p>'+
 '<div id="al-books-history" class="al-books-history"></div></div>');
function showText(id,message,bad){const el=document.getElementById(id);if(el){el.textContent=message;el.dataset.error=bad?"1":"0"}}
function safeName(str){return String(str||"").slice(0,190)}
function idFor(r){return norm(r.name)+"|"+norm(r.ingredients)+"|"+r.allergenNumbers.join(",")}
function isApproved(r){return Boolean(loadLocal(APPROVALS)[idFor(r)])}
function approve(r,yes){
 const v=loadLocal(APPROVALS),id=idFor(r);
 if(yes)v[id]={confirmedAt:new Date().toISOString()};else delete v[id];
 if(!writeLocal(APPROVALS,v))showText("al-books-menu-date","Errore nel salvataggio locale della verifica.",true);
}
function getMatch(name){
 if(!catalog)return null;
 const n=norm(name),exact=catalog.recipes.filter(r=>norm(r.name)===n);
 // Nessuna corrispondenza parziale: piatti con ingredienti diversi possono avere nomi simili.
 return exact.length===1?exact[0]:null;
}
function classify(items){
 return items.filter(x=>x&&x.available!==false).map(x=>{
  const name=safeName(x.name),found=getMatch(name);
  return {name,category:String(x.category||""),description:String(x.description||""),
   ingredients:found?found.ingredients:"",
   allergenNumbers:found?found.allergenNumbers:[],
   allergensSource:found?found.allergensSource:"",
   source:found?found.source:"",
   checks:found?found.checks:"",
   approved:found?isApproved(found):false,
   matched:!!found,recipeKey:found?idFor(found):null};
 });
}
function paintDishes(){
 const box=document.getElementById("al-books-dishes");if(!box)return;
 if(!preview.length){box.innerHTML='<p class="al-books-missing">Nessun piatto disponibile nel menù salvato.</p>';return}
 const ok=preview.filter(x=>x.approved).length,pend=preview.length-ok;
 box.innerHTML='<p class="al-books-summary"><b>'+preview.length+' piatti</b> · '+ok+' verificati su questo dispositivo · <strong>'+pend+' da verificare</strong></p>'+
 preview.map((r,i)=>'<article class="al-books-dish"><div class="al-books-dish-top"><b>'+esc(r.name)+'</b><span class="'+(r.approved?'al-books-ok':'al-books-pending')+'">'+(r.approved?'Verificato':'Da verificare')+'</span></div>'+
 (r.matched?'<p>Ingredienti: '+esc(r.ingredients)+'</p><p><b>Allergeni indicati nel ricettario:</b> '+esc(r.allergenNumbers.join(", ")||"Nessuno dei 14")+'</p>'+
 (r.checks?'<p class="al-books-note">Note: '+esc(r.checks)+'</p>':'')+
 '<label class="al-books-confirm"><input type="checkbox" data-al-book-confirm="'+i+'" '+(r.approved?'checked':'')+'> Ho verificato ingredienti, etichette e allergeni effettivi di questa ricetta.</label>':
 '<p class="al-books-missing">Ricetta non riconosciuta nel libro. Prima di produrre il documento definitivo, registrare e verificare ingredienti e allergeni.</p>')+'</article>').join("");
 const pdfBtn=document.getElementById("al-books-open-daily");if(pdfBtn){pdfBtn.disabled=!preview.length;pdfBtn.textContent=pend?"Apri PDF BOZZA ("+pend+" da verificare)":"Apri PDF verificato del giorno"}
}
async function refresh(){
 const btn=document.getElementById("al-books-refresh");btn.disabled=true;showText("al-books-menu-date","Caricamento menù e ricette…",false);
 try{
  await loadCatalog();
  if(typeof window.haccpReadDailyMenu!=="function")throw Error("Collegamento al menù Firebase non ancora disponibile. Riapri il pannello.");
  const live=await window.haccpReadDailyMenu();
  if(!live||!Array.isArray(live.items))throw Error("Menù giornaliero non valido.");
  latest=live;preview=classify(live.items);
  const stamp=live.updatedAt?new Date(live.updatedAt).toLocaleString("it-IT",{timeZone:"Europe/Rome",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"Data salvataggio non disponibile";
  showText("al-books-menu-date","Menù letto da Firebase · Ultimo salvataggio: "+stamp+". Verifica che i piatti siano quelli di oggi.",false);
  paintDishes();
 }catch(e){latest=null;preview=[];paintDishes();showText("al-books-menu-date","Impossibile leggere il menù aggiornato: "+(e.message||e)+". Nessun PDF giornaliero generato.",true)}
 finally{btn.disabled=false}
}
dailyBox.addEventListener("change",e=>{
 const box=e.target.closest("input[data-al-book-confirm]");if(!box)return;
 const i=Number(box.dataset.alBookConfirm),row=preview[i],recipe=row&&getMatch(row.name);
 if(!recipe){box.checked=false;return}
 if(box.checked){if(!window.confirm("Confermi di avere controllato le etichette attuali, gli ingredienti reali e tutti gli allergeni per «"+row.name+"»? La conferma resta su questo dispositivo.")){box.checked=false;return}}
 approve(recipe,box.checked);preview=classify(latest.items);paintDishes();
});
function safePdf(s){const latin=String(s??"").normalize("NFC");const code=[];for(const c of latin){const n=c.charCodeAt(0);let b=n;if(n===0x2019||n===0x2018)b=39;else if(n===0x2013||n===0x2014)b=45;else if(n===0x2022)b=45;else if(n>255)b=63;if(b===40||b===41||b===92)code.push("\\"+String.fromCharCode(b));else if(b<32||b>126)code.push("\\"+b.toString(8).padStart(3,"0"));else code.push(String.fromCharCode(b))}return code.join("")}
function wrapText(str,max){
 const text=String(str??"").replace(/\s+/g," ").trim();if(!text)return [""];
 const words=text.split(" "),lines=[];let cur="";
 for(const word of words){
  if(cur&&(cur+" "+word).length>max){lines.push(cur);cur=""}
  if(word.length>max){if(cur){lines.push(cur);cur=""};for(let i=0;i<word.length;i+=max)lines.push(word.slice(i,i+max))}
  else cur+=(cur?" ":"")+word;
 }
 if(cur)lines.push(cur);return lines;
}
function pdfLines(lines,title){
 // PDF 1.4, font Helvetica (WinAnsiEncoding). Piccolo generatore locale, senza librerie esterne.
 const rows=[];
 for(const line of lines){const parts=wrapText(line,103);rows.push(...parts)}
 const perPage=51,pages=[];for(let i=0;i<rows.length;i+=perPage)pages.push(rows.slice(i,i+perPage));if(!pages.length)pages.push([]);
 const objects=[],ids=pages.map((_,i)=>4+i*2),contents=pages.map((_,i)=>5+i*2);
 objects[1]="<< /Type /Catalog /Pages 2 0 R >>";
 objects[2]="<< /Type /Pages /Count "+pages.length+" /Kids ["+ids.map(id=>id+" 0 R").join(" ")+"] >>";
 objects[3]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
 for(let i=0;i<pages.length;i++){
  objects[ids[i]]="<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents "+contents[i]+" 0 R >>";
  let ops="0.72 0.08 0.13 rg 40 802 515 4 re f\n0 0 0 rg\nBT /F1 14 Tf 42 817 Td ("+safePdf("ALBERTO | "+title)+") Tj ET\n";
  let y=779;for(const line of pages[i]){ops+="BT /F1 9 Tf 42 "+y+" Td ("+safePdf(line)+") Tj ET\n";y-=14}
  ops+="BT /F1 8 Tf 42 30 Td ("+safePdf("ALBERTO - "+(i+1)+"/"+pages.length+" | Documento generato per consultazione e registrazione")+") Tj ET\n";
  objects[contents[i]]="<< /Length "+ops.length+" >>\nstream\n"+ops+"endstream";
 }
 let buffer="%PDF-1.4\n",offset=[0];
 for(let i=1;i<objects.length;i++){offset[i]=buffer.length;buffer+=i+" 0 obj\n"+objects[i]+"\nendobj\n"}
 const xref=buffer.length;
 buffer+="xref\n0 "+objects.length+"\n0000000000 65535 f \n";
 for(let i=1;i<objects.length;i++)buffer+=String(offset[i]).padStart(10,"0")+" 00000 n \n";
 buffer+="trailer\n<< /Size "+objects.length+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF";
 return new Blob([buffer],{type:"application/pdf"});
}
function openPdf(blob,filename,popup,dest){
 const url=URL.createObjectURL(blob);
 const container=dest||dailyBox;
 const box=container.querySelector(".al-books-download");
 if(box)box.remove();
 const a=document.createElement("a");a.className="al-books-download";a.href=url;a.download=filename;a.textContent="Scarica "+filename;
 container.append(a);
 if(popup&&!popup.closed){try{popup.location.replace(url)}catch(e){/* link manuale */}}
 else a.click();
 // Mantieni disponibile il link del PDF anche nei browser che bloccano i popup.
 setTimeout(()=>{if(a.isConnected)a.remove();URL.revokeObjectURL(url)},300000);
}
function popupAtClick(){try{const p=window.open("about:blank","_blank");if(p){p.document.write("<!doctype html><title>Alberto PDF</title><p>Preparazione PDF…</p>");p.document.close()}return p}catch(e){return null}}
document.getElementById("al-books-open-full").addEventListener("click",async()=>{
 const popup=popupAtClick();
 showText("al-books-full-message","Preparazione libro completo…",false);
 try{const c=await loadCatalog();const pdf=pdfLines(c.sourceText.split("\n"),"Libro completo ingredienti e allergeni");openPdf(pdf,"Alberto_Libro_Allergeni_Completo_Consultazione.pdf",popup,fullBox);
 showText("al-books-full-message","Libro aperto. Mantieni le verifiche pendenti: questa copia non certifica etichette e ricette.",false)}
 catch(e){if(popup&&!popup.closed)popup.close();showText("al-books-full-message","Errore apertura PDF: "+(e.message||e),true)}
});
document.getElementById("al-books-refresh").addEventListener("click",refresh);
function historyList(){const a=loadLocal(HISTORY);return Array.isArray(a)?a:[]}
function showHistory(){
 const box=document.getElementById("al-books-history"),history=historyList();
 box.innerHTML=history.length?history.slice(0,40).map((x,i)=>'<button type="button" data-al-history="'+i+'">'+esc(shortDate(x.date))+' · '+esc(x.title||"Documento")+' · '+(x.draft?"Bozza":"Verificato")+'</button>').join(""):'<p class="al-books-info">Nessuna copia salvata su questo dispositivo.</p>';
}
function pdfForSnapshot(x){
 const lines=["Data: "+shortDate(x.date), "Creato: "+(x.createdAt||""), x.draft?"BOZZA - VERIFICHE INCOMPLETE - NON USARE COME INFORMATIVA DEFINITIVA":"Verifiche registrate sul dispositivo corrente", "","ELENCO DEI PIATTI DEL GIORNO", ""];
 for(const row of x.rows){lines.push(String(row.category||"")+" - "+row.name);
  lines.push("Ingredienti: "+(row.ingredients||"DA VERIFICARE"));
  lines.push("Allergeni: "+(row.matched?(row.allergenNumbers.length?row.allergenNumbers.join(", "):"Nessuno dei 14 dichiarati nella ricetta"):"DA VERIFICARE"));
  lines.push(row.approved?"Ricetta verificata sul dispositivo.":"ATTENZIONE: RICETTA NON VERIFICATA");
  if(row.checks)lines.push("Note: "+row.checks);
  lines.push("");
 }
 lines.push("Le etichette e le preparazioni effettive prevalgono sui dati importati.");
 return pdfLines(lines,"Allergeni del giorno "+shortDate(x.date));
}
document.getElementById("al-books-open-daily").addEventListener("click",()=>{
 if(!preview.length||!latest)return;
 const pop=popupAtClick(),date=dateIT(),draft=preview.some(x=>!x.approved);
 const snap={date,title:preview.length+" piatti",draft,createdAt:new Date().toISOString(),rows:preview.map(x=>({...x})),menuUpdatedAt:latest.updatedAt||null};
 const records=historyList();
 records.unshift(snap);
 // Conserva versioni dello stesso giorno. Nessun sovrascrivere automaticamente.
 if(!writeLocal(HISTORY,records.slice(0,180)))showText("al-books-menu-date","Attenzione: PDF prodotto, ma copia locale non archiviata per spazio insufficiente.",true);
 showHistory();
 openPdf(pdfForSnapshot(snap),"Alberto_Allergeni_Giorno_"+date+(draft?"_BOZZA":"")+".pdf",pop);
});
dailyBox.addEventListener("click",e=>{
 const btn=e.target.closest("[data-al-history]");if(!btn)return;
 const record=historyList()[Number(btn.dataset.alHistory)];if(!record)return;
 const pop=popupAtClick();openPdf(pdfForSnapshot(record),"Alberto_Allergeni_Archivio_"+record.date+".pdf",pop);
});
document.addEventListener("click",e=>{
 if(e.target.closest('[data-al-go="haccpAllergeniGiornaliero"]'))setTimeout(refresh,50);
});
showHistory();
})();