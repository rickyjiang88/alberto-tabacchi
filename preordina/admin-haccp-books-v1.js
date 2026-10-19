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
const AUTO="alberto-haccp-nuove-ricette-auto-locali-v1";
const ALIASES="alberto-haccp-collegamenti-ricette-locali-v1";
let catalog=null,latest=null,preview=[],sharedDrafts={},sharedAliases={},activeMenuNames=null;
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
 '<p class="al-books-info" id="al-books-full-message">Il libro contiene le ricette storiche e le nuove ricette registrate automaticamente come bozze. Ingredienti e allergeni vanno verificati.</p>'+
 '<div id="al-books-new-recipes"></div></div>');
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
function localRecipes(){
 let rows=[];
 try{const found=JSON.parse(localStorage.getItem("alberto-haccp-bozze-locali-v1")||"[]");if(Array.isArray(found))rows=found}catch(e){}
 const unique=new Map();
 for(const row of rows){
  if(row.type!=="haccpAllergeniTotale")continue;
  const d=row.data||{},name=String(d.piatto||"").trim(),ingredients=String(d.ingredienti||"").trim();
  if(!name||!ingredients||unique.has(norm(name)))continue; // il registro ordina i più recenti prima
  const allergenNumbers=String(d.allergeni||"").match(/\b(1[0-4]|[1-9])\b/g)||[];
  unique.set(norm(name),{name,ingredients,category:String(d.categoria||"Altro"),
   allergenNumbers:[...new Set(allergenNumbers.map(Number))].sort((a,b)=>a-b),
   allergensSource:String(d.allergeni||""),checks:String(d.note||""),
   verified:false,source:"Nuova ricetta inserita sul dispositivo"});
 }
 return [...unique.values()];
}
function candidatesFromMenu(items){
 if(!Array.isArray(items))return;
 const copy=loadLocal(AUTO);
 for(const row of items){
  const name=String(row&&row.name||"").trim().slice(0,180),key=norm(name);
  if(!key||["nuovopiatto","nuovoprodotto","piatto","prodotto"].includes(key)||!name)continue;
  if(!copy[key])copy[key]={name,category:String(row.category||""),description:String(row.description||"").slice(0,800)};
 }
 writeLocal(AUTO,copy);
}
function sharedRecipes(){
 return Object.values(sharedDrafts).filter(r=>r&&typeof r==="object"&&typeof r.name==="string");
}
function allNewRecipes(){
 const map=new Map();
 for(const row of Object.values(loadLocal(AUTO))){
  if(row&&row.name)map.set(norm(row.name),{name:row.name,category:row.category||"",description:row.description||""});
 }
 for(const row of sharedRecipes())map.set(norm(row.name),{...map.get(norm(row.name)),...row});
 for(const row of localRecipes())map.set(norm(row.name),{...map.get(norm(row.name)),...row});
 return [...map.values()].filter(r=>r.name);
}
function readAlias(name){
 const n=norm(name),key="r"+n,server=sharedAliases[key];
 const local=loadLocal(ALIASES)[n];
 const dest=typeof server==="string"?server:typeof local==="string"?local:"";
 return catalog?.recipes?.find(x=>norm(x.name)===norm(dest))||null;
}
function getMatch(name){
 if(!catalog)return null;
 const n=norm(name);
 const manual=localRecipes().filter(r=>norm(r.name)===n);
 if(manual.length===1)return manual[0];
 const server=sharedRecipes().filter(r=>norm(r.name)===n&&String(r.ingredients||"").trim()&&Array.isArray(r.allergenNumbers));
 if(server.length===1)return server[0];
 const exact=catalog.recipes.filter(r=>norm(r.name)===n);
 if(exact.length===1)return exact[0];
 // Collegamento ESPLICITO confermato dall'operatore: non indovina mai la ricetta.
 return readAlias(name);
}
function recipeGroup(cat){
 const c=norm(cat);
 // Evita che MATERIE PRIME sia interpretato come PRIMI.
 if(c.startsWith("prim"))return "primi";
 if(c.startsWith("second"))return "secondi";
 if(c.startsWith("contorn"))return "contorni";
 if(c==="piattounico"||c==="unicopiatto")return "unico";
 return "";
}
function recipeSuggestions(item){
 const group=recipeGroup(item.category),name=norm(item.name).replace(/polipo/g,"polpo");
 const tokenize=s=>new Set(String(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/polipo/g,"polpo").split(/[^a-z0-9]+/).filter(x=>x.length>3&&!["fresche","freschi","bolognese","cucina","cinese","piatti"].includes(x)));
 const words=tokenize(item.name);
 return catalog.recipes.filter(r=>recipeGroup(r.category)===group&&group).map(r=>{
  const w=tokenize(r.name),shared=[...words].filter(x=>w.has(x)).length;
  const score=shared/(Math.max(1,Math.max(words.size,w.size)))+((name.includes(norm(r.name))||norm(r.name).includes(name))?.18:0);
  return {recipe:r,score,shared};
 }).filter(x=>x.shared>=2&&x.score>=0.4)
 .sort((a,b)=>b.score-a.score||a.recipe.name.localeCompare(b.recipe.name,"it"))
 .map(x=>x.recipe);
}
function quickReuseSuggestion(item){
 const options=recipeSuggestions(item);
 if(!options.length)return null;
 const tok=n=>new Set(String(n||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
 .replace(/polipo/g,"polpo").replace(/ragu/g,"ragu")
 .split(/[^a-z0-9]+/).filter(w=>w.length>3&&!["freschi","fresche","fresco","fresca","cinese","cucina","bolognese","piatti"].includes(w)));
 const src=tok(item.name),score=r=>{
  const dest=tok(r.name),equal=[...src].filter(w=>dest.has(w)).length;
  return equal/Math.max(src.size,dest.size,1);
 };
 const first=options[0],top=score(first),runner=options[1]?score(options[1]):0;
 return top>=0.77&&top-runner>=0.20&&src.size>=2?first:null;
}
function isRecipeEntered(r){
 // Ingrediente e allergeni devono essere esplicitamente compilati;
 // un campo allergeni vuoto non significa mai "nessuno".
 return Boolean(String(r.ingredients||"").trim()&&String(r.allergensSource||"").trim()&&Array.isArray(r.allergenNumbers));
}
function renderNewDishCard(r,registered){
 const key=norm(r.name),options=registered?[]:recipeSuggestions(r);
 const quick=registered?null:quickReuseSuggestion(r);
 const quickHtml=quick?'<div class="al-books-quick"><p><b>Forse è già registrata:</b> '+esc(quick.name)+'</p>'+
 '<p class="al-books-info">Ingredienti della ricetta esistente: '+esc(quick.ingredients)+'</p>'+
 '<button type="button" class="al-books-fill" data-al-alias-quick="'+esc(key)+'" data-al-alias-quick-recipe="'+esc(norm(quick.name))+'">Stessa ricetta? Collega in un tocco</button></div>':"";
 const select=!registered&&options.length?'<details class="al-books-linker"><summary>Altre ricette / Collegamento manuale</summary>'+
   '<p>Confronta ingredienti e allergeni: collega solo se è la stessa ricetta.</p>'+
   '<select data-al-alias-select="'+esc(key)+'"><option value="">Scegli la ricetta da riutilizzare…</option>'+
   options.map(x=>'<option value="'+esc(norm(x.name))+'">'+esc(x.name)+'</option>').join("")+'</select>'+
   '<div class="al-books-alias-preview" data-al-alias-preview="'+esc(key)+'"></div>'+
   '<button type="button" class="al-books-fill" data-al-alias-link="'+esc(key)+'">Conferma collegamento</button></details>':
   (!registered?'<p class="al-books-info">Nessuna ricetta simile trovata: completa solo se è un piatto nuovo.</p>':"");
 const description=isRecipeEntered(r)?'<p>Ingredienti: '+esc(r.ingredients)+'</p>'+
   '<p>Allergeni inseriti: '+esc(r.allergenNumbers.join(", ")||"Nessuno dei 14")+'</p>'+
   '<p class="al-books-info">Ingredienti registrati, ma etichette e allergeni restano da verificare.</p>':
   (r.ingredients?'<p>Ingredienti inseriti: '+esc(r.ingredients)+'</p>'+
    '<p class="al-books-missing">Allergeni ancora da inserire o confermare.</p>':
    '<p class="al-books-missing">Nome salvato. Ingredienti e allergeni ancora da completare.</p>');
 return '<article class="al-books-dish">'+
 '<div class="al-books-dish-top"><b>'+esc(r.name)+'</b><span class="'+(registered?'al-books-ok':'al-books-pending')+'">'+(registered?'Dati inseriti':'Da completare')+'</span></div>'+
 description+quickHtml+select+
 '<button type="button" class="al-books-fill al-books-fill-secondary" data-al-complete="'+esc(key)+'">'+(registered?'Modifica ingredienti e allergeni':r.ingredients?'Completa o correggi allergeni':'Completa ingredienti e allergeni')+'</button></article>';
}
function paintNewRecipes(){
 const box=document.getElementById("al-books-new-recipes");if(!box||!catalog)return;
 const wasOpen=Boolean(box.querySelector("#al-books-registered-group")?.open);
 const oldOpen=Boolean(box.querySelector("#al-books-old-group")?.open);
 const known=new Set(catalog.recipes.map(r=>norm(r.name)));
 const newItems=allNewRecipes().filter(r=>!known.has(norm(r.name))&&!readAlias(r.name));
 const pending=newItems.filter(r=>!isRecipeEntered(r));
 const registered=newItems.filter(isRecipeEntered);
 // Le bozze di giorni vecchi rimangono salvate ma non intasano il lavoro di oggi.
 const today=activeMenuNames?pending.filter(r=>activeMenuNames.has(norm(r.name))):pending;
 const old=activeMenuNames?pending.filter(r=>!activeMenuNames.has(norm(r.name))):[];
 const pendingHtml='<section class="al-books-pending-group"><h4>Da controllare nel menù attuale ('+today.length+')</h4>'+
 '<p class="al-books-info">I piatti già registrati non vanno riscritti. Conferma solo i collegamenti sicuri; completa le ricette veramente nuove.</p>'+
 (today.length?today.map(r=>renderNewDishCard(r,false)).join(""):'<p class="al-books-info">Nessuna nuova ricetta da completare per il menù attuale.</p>')+
 '</section>';
 const oldHtml='<details id="al-books-old-group" class="al-books-registered-group"'+(oldOpen?' open':'')+'>'+
 '<summary>Ricette di altri giorni ancora da completare ('+old.length+')</summary>'+
 '<p class="al-books-info">Queste schede restano conservate. Potrai completarle quando torneranno nel menù.</p>'+
 (old.length?old.map(r=>renderNewDishCard(r,false)).join(""):'<p class="al-books-info">Nessuna ricetta precedente in attesa.</p>')+
 '</details>';
 const registeredHtml='<details id="al-books-registered-group" class="al-books-registered-group"'+(wasOpen?' open':'')+'>'+
 '<summary>Ricette registrate ('+registered.length+')</summary>'+
 '<p class="al-books-info">Ingredienti e allergeni sono stati inseriti. Non significa che siano già verificati: controlla le etichette effettive prima della stampa definitiva.</p>'+
 (registered.length?registered.map(r=>renderNewDishCard(r,true)).join(""):'<p class="al-books-info">Qui compariranno le ricette dopo che avrai inserito ingredienti e allergeni.</p>')+
 '</details>';
 box.innerHTML=pendingHtml+oldHtml+registeredHtml;
}
async function readShared(){
 if(typeof window.haccpReadDailyMenu!=="function")throw Error("Firebase non ancora disponibile");
 const live=await window.haccpReadDailyMenu();
 sharedDrafts=live.recipeDrafts||{};
 sharedAliases=live.recipeAliases||{};
 activeMenuNames=new Set((live.items||[]).filter(r=>r&&r.available!==false).map(r=>norm(r.name)));
 candidatesFromMenu(live.items);
 paintNewRecipes();
 return live;
}
async function refreshComplete(){
 try{await loadCatalog();await readShared();showText("al-books-full-message","Ricettario aggiornato. Le nuove ricette rimangono in bozza finché non sono complete e verificate.",false)}
 catch(e){showText("al-books-full-message","Libro storico disponibile. Impossibile sincronizzare le nuove ricette: "+(e.message||e),true);paintNewRecipes()}
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
 '<p class="al-books-missing">Il piatto è registrato come bozza nel libro completo. Completa ingredienti e allergeni prima della versione definitiva.</p>')+'</article>').join("");
 const pdfBtn=document.getElementById("al-books-open-daily");if(pdfBtn){pdfBtn.disabled=!preview.length;pdfBtn.textContent=pend?"Apri PDF BOZZA ("+pend+" da verificare)":"Apri PDF verificato del giorno"}
}
async function refresh(){
 const btn=document.getElementById("al-books-refresh");btn.disabled=true;showText("al-books-menu-date","Caricamento menù e ricette…",false);
 try{
  await loadCatalog();
  if(typeof window.haccpReadDailyMenu!=="function")throw Error("Collegamento al menù Firebase non ancora disponibile. Riapri il pannello.");
  const live=await readShared();
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
 try{const c=await loadCatalog();let syncError="";
 try{await readShared()}catch(err){syncError="Nuove ricette condivise non disponibili: "+(err.message||err)}
 const printable=c.sourceText.split("\n").filter(line=>!/^<PARSED TEXT FOR PAGE:/i.test(line.trim()));
 if(syncError)printable.push("","ATTENZIONE: "+syncError+". Libro storico e bozze locali soltanto.");
 const known=new Set(c.recipes.map(x=>norm(x.name))),extras=allNewRecipes().filter(x=>!known.has(norm(x.name))&&!readAlias(x.name));
 if(extras.length){
  printable.push("","","APPENDICE - RICETTE REGISTRATE AUTOMATICAMENTE DAL MENU");
  printable.push("ATTENZIONE: BOZZE DA VERIFICARE, NON SONO RICETTE APPROVATE","");
  for(const row of extras){
   printable.push((row.category||"PIATTO")+" - "+row.name);
   printable.push("Ingredienti: "+(row.ingredients||"DA COMPLETARE"));
   printable.push("Allergeni: "+(Array.isArray(row.allergenNumbers)?(row.allergenNumbers.join(", ")||"Nessuno dei 14 registrato"):"DA VERIFICARE"));
   if(row.checks)printable.push("Note: "+row.checks);
   printable.push("");
  }
 }
 const aliasNames=allNewRecipes().filter(x=>readAlias(x.name));
 if(aliasNames.length){printable.push("","NOMI ALTERNATIVI COLLEGATI A RICETTE ESISTENTI");
  for(const row of aliasNames)printable.push(row.name+" -> "+readAlias(row.name).name+" (collegamento confermato dall'operatore)");
 }
 const pdf=pdfLines(printable,"Libro completo ingredienti e allergeni");openPdf(pdf,"Alberto_Libro_Allergeni_Completo_Consultazione.pdf",popup,fullBox);
 showText("al-books-full-message","Libro aperto. Mantieni le verifiche pendenti: questa copia non certifica etichette e ricette.",false)}
 catch(e){if(popup&&!popup.closed)popup.close();showText("al-books-full-message","Errore apertura PDF: "+(e.message||e),true)}
});
document.getElementById("al-books-refresh").addEventListener("click",refresh);
function historyList(){const a=loadLocal(HISTORY);return Array.isArray(a)?a:[]}
function showHistory(){
 const box=document.getElementById("al-books-history"),history=historyList();
 box.innerHTML=history.length?history.slice(0,40).map((x,i)=>'<button type="button" data-al-history="'+i+'">'+esc(shortDate(x.date))+' · '+esc(x.title||"Documento")+' · '+(x.draft?"Bozza":"Verificato")+'</button>').join(""):'<p class="al-books-info">Nessuna copia salvata su questo dispositivo.</p>';
}
/* A4 giornaliero in una pagina: SOLO piatto, ingredienti, allergeni.
 * Condivide la stessa funzione con PDF del giorno e ristampa dello storico.
 * Le note delle ricette e le conferme sul dispositivo non vengono stampate. */
function pdfDailyOnePage(snapshot){
 const pageW=595,pageH=842,margin=26,tableW=543;
 const colWidths=[170,292,81],xPos=[margin,margin+170,margin+462],pad=7;
 const weights={};
 const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
 const capitals=[667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611];
 const small=[556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500];
 for(let i=0;i<26;i++){weights[chars[i]]=capitals[i];weights[chars[i+26]]=small[i]}
 Object.assign(weights,{" ":278,".":278,",":278,":":278,";":278,"-":333,"'":191,"(":333,")":333,"/":278,"*":389,"&":667,"!":278,"?":556,"@":1015,"+":584,"=":584});
 const normalizedChar=c=>String(c).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").charAt(0)||c;
 const widthText=(s,pt,bold)=>{let w=0;for(const ch of String(s)){const normChar=normalizedChar(ch);w+=(weights[normChar]||556)}return w*pt*(bold?1.035:1)/1000};
 function linesOf(value,maxW,pt,bold){
  const words=String(value??"").replace(/\s+/g," ").trim().split(" ").filter(Boolean);
  if(!words.length)return [""];
  const out=[];let line="";
  for(const word of words){
   const trial=line?line+" "+word:word;
   if(widthText(trial,pt,bold)<=maxW){line=trial;continue}
   if(line){out.push(line);line=""}
   if(widthText(word,pt,bold)<=maxW){line=word;continue}
   let part="";
   for(const ch of word){if(part&&widthText(part+ch,pt,bold)>maxW){out.push(part);part=""}part+=ch}
   line=part;
  }
  if(line)out.push(line);
  return out.length?out:[""];
 }
 const rows=Array.isArray(snapshot.rows)?snapshot.rows:[];
 const printable=rows.map(r=>{
  const allergens=r.matched===false?"DA VERIFICARE":
   (Array.isArray(r.allergenNumbers)?(r.allergenNumbers.length?r.allergenNumbers.join(", "):"Nessuno dei 14"):"DA VERIFICARE");
  return [String(r.name||"PIATTO SENZA NOME"),String(r.ingredients||"DA COMPLETARE"),allergens];
 });
 const firstRowTop=714,footMin=42,usable=firstRowTop-footMin;
 let font=9.2,plan=[],height=0;
 for(;font>=6.8;font-=0.2){
  const lh=font+2.5;
  plan=printable.map(cols=>{
   const lns=cols.map((t,i)=>linesOf(t,colWidths[i]-pad*2,i===0?font+0.3:font,i===0));
   return {cols,lines:lns,height:Math.max(29,Math.max(...lns.map(x=>x.length))*lh+13)};
  });
  height=plan.reduce((a,r)=>a+r.height,0);
  if(height<=usable)break;
 }
 if(height>usable)throw Error("Menù troppo lungo per una pagina A4 leggibile. Riduci il testo o verifica il numero di piatti.");
 const textOps=[];
 function txt(x,y,str,pt=9,bold=false,color="0.15 0.13 0.13"){
  textOps.push(color+" rg BT /"+(bold?"F2":"F1")+" "+pt.toFixed(2)+" Tf 1 0 0 1 "+x.toFixed(2)+" "+y.toFixed(2)+" Tm ("+safePdf(str)+") Tj ET\n");
 }
 textOps.push("0.71 0.05 0.12 rg "+margin+" 817 "+tableW+" 4 re f\n");
 txt(margin,792,"ALBERTO  |  LIBRO ALLERGENI DEL GIORNO",14,true,"0.57 0.07 0.12");
 txt(margin,770,"Data: "+shortDate(snapshot.date)+"  -  "+printable.length+" piatti",10,true);
 if(snapshot.draft)txt(margin,751,"BOZZA - VERIFICHE ALLERGENI DA COMPLETARE",9,true,"0.63 0.17 0.12");
 else txt(margin,751,"Ingredienti e allergeni dei piatti del giorno",9,false);
 // Testata della tabella: righe e colonne sempre sulla stessa pagina.
 textOps.push("0.94 0.89 0.88 rg "+margin+" 714 "+tableW+" 22 re f\n");
 txt(xPos[0]+pad,721,"PIATTO",9,true,"0.46 0.10 0.16");
 txt(xPos[1]+pad,721,"INGREDIENTI",9,true,"0.46 0.10 0.16");
 txt(xPos[2]+pad,721,"ALLERGENI",8.5,true,"0.46 0.10 0.16");
 let y=firstRowTop,idx=0;
 for(const row of plan){
  const lower=y-row.height;
  if(idx%2===0)textOps.push("0.985 0.981 0.974 rg "+margin+" "+lower.toFixed(2)+" "+tableW+" "+row.height.toFixed(2)+" re f\n");
  textOps.push("0.85 0.83 0.82 RG 0.45 w "+margin+" "+lower.toFixed(2)+" m "+(margin+tableW)+" "+lower.toFixed(2)+" l S\n");
  const lh=font+2.5;
  for(let c=0;c<3;c++){
   row.lines[c].forEach((t,n)=>txt(xPos[c]+pad,y-11.5-n*lh,t,c===0?font+0.3:font,c===0,c===0?"0.17 0.11 0.11":"0.17 0.17 0.17"));
  }
  y=lower;idx++;
 }
 textOps.push("0.84 0.81 0.80 RG 0.6 w "+margin+" 714 m "+margin+" "+(714-height).toFixed(2)+" l S\n");
 textOps.push("0.84 0.81 0.80 RG 0.6 w "+(margin+tableW)+" 714 m "+(margin+tableW)+" "+(714-height).toFixed(2)+" l S\n");
 txt(margin,24,"ALBERTO | Menù del "+shortDate(snapshot.date)+" | "+printable.length+" piatti",8,false,"0.42 0.39 0.39");
 const stream=textOps.join("");
 const obj=[];
 obj[1]="<< /Type /Catalog /Pages 2 0 R >>";
 obj[2]="<< /Type /Pages /Count 1 /Kids [5 0 R] >>";
 obj[3]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
 obj[4]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
 obj[5]="<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+pageW+" "+pageH+"] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 6 0 R >>";
 obj[6]="<< /Length "+stream.length+" >>\nstream\n"+stream+"endstream";
 let buffer="%PDF-1.4\n",offset=[0];
 for(let i=1;i<obj.length;i++){offset[i]=buffer.length;buffer+=i+" 0 obj\n"+obj[i]+"\nendobj\n"}
 const xref=buffer.length;
 buffer+="xref\n0 "+obj.length+"\n0000000000 65535 f \n";
 for(let i=1;i<obj.length;i++)buffer+=String(offset[i]).padStart(10,"0")+" 00000 n \n";
 buffer+="trailer\n<< /Size "+obj.length+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF";
 return new Blob([buffer],{type:"application/pdf"});
}
function pdfForSnapshot(x){return pdfDailyOnePage(x)}
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
fullBox.addEventListener("change",e=>{
 const select=e.target.closest("[data-al-alias-select]");if(!select)return;
 const panel=fullBox.querySelector('[data-al-alias-preview="'+select.dataset.alAliasSelect+'"]');
 if(!panel)return;
 const rec=catalog?.recipes.find(x=>norm(x.name)===select.value);
 panel.innerHTML=rec?'<p><b>Ingredienti registrati:</b> '+esc(rec.ingredients)+'</p>'+
 '<p><b>Allergeni del libro:</b> '+esc(rec.allergenNumbers.join(", ")||"Nessuno dei 14")+'</p>'+
 '<p class="al-books-info">Controlla la ricetta reale e le etichette attuali. Questo collegamento non equivale ad approvare gli allergeni.</p>':"";
});
fullBox.addEventListener("click",async e=>{
 const button=e.target.closest("[data-al-alias-link],[data-al-alias-quick]");if(!button)return;
 const key=button.dataset.alAliasLink||button.dataset.alAliasQuick;
 const from=allNewRecipes().find(x=>norm(x.name)===key);
 const dropdown=fullBox.querySelector('[data-al-alias-select="'+key+'"]');
 const destName=button.dataset.alAliasQuickRecipe||dropdown?.value;
 const dest=catalog?.recipes.find(x=>norm(x.name)===destName);
 if(!from||!dest){window.alert("Scegli prima la ricetta da riutilizzare.");return}
 if(!window.confirm("Confermi che «"+from.name+"» è preparato con gli STESSI ingredienti di «"+dest.name+"»? Se è diverso, scegli «È un piatto nuovo». Le etichette e gli allergeni andranno comunque verificati."))return;
 button.disabled=true;
 const local=loadLocal(ALIASES);local[key]=dest.name;
 if(!writeLocal(ALIASES,local)){window.alert("Non è stato possibile salvare il collegamento sul telefono.");button.disabled=false;return}
 try{
  if(typeof window.haccpSaveRecipeAlias==="function"){await window.haccpSaveRecipeAlias(from.name,dest.name);sharedAliases["r"+key]=dest.name}
  else throw Error("Collegamento Firebase non disponibile");
  showText("al-books-full-message","Collegamento salvato: «"+from.name+"» usa la ricetta «"+dest.name+"». Ingredienti e allergeni sono ancora da verificare.",false);
 }catch(err){
  showText("al-books-full-message","Collegamento salvato SOLO su questo telefono. Sincronizzazione Firebase non riuscita: "+(err.message||err),true);
 }
 paintNewRecipes();
 if(latest){preview=classify(latest.items);paintDishes()}
});
fullBox.addEventListener("click",e=>{
 const btn=e.target.closest("[data-al-complete]");if(!btn)return;
 const item=allNewRecipes().find(r=>norm(r.name)===btn.dataset.alComplete);if(!item)return;
 const detail=full.querySelector(".al-books-manual"),form=detail&&detail.querySelector("form");
 if(!form)return;
 detail.open=true;
 const name=form.elements.namedItem("piatto");if(name)name.value=item.name;
 const cat=form.elements.namedItem("categoria");
 if(cat){
  const c=norm(item.category);
  const v=c.includes("prim")?"Primo":c.includes("second")?"Secondo":c.includes("contorn")?"Contorno":c.includes("unico")?"Piatto unico":"Altro";
  cat.value=v;
 }
 const ingredients=form.elements.namedItem("ingredienti");if(ingredients)ingredients.value=item.ingredients||"";
 const notes=form.elements.namedItem("note");if(notes)notes.value=item.checks||"";
 form.querySelectorAll('input[name="allergeni"]').forEach(x=>x.checked=Array.isArray(item.allergenNumbers)&&item.allergenNumbers.includes(Number(x.value)));
 const none=form.querySelector('input[name="allergenNone"]');if(none)none.checked=Array.isArray(item.allergenNumbers)&&!item.allergenNumbers.length&&Boolean(item.ingredients);
 detail.scrollIntoView({behavior:"smooth",block:"start"});
});
window.addEventListener("alberto-haccp-menu-saved",e=>{
 try{candidatesFromMenu(e.detail?.items);paintNewRecipes()}catch(e){}
});
window.addEventListener("alberto-haccp-recipe-details-saved",async e=>{
 const data=e.detail||{};
 try{
  if(typeof window.haccpSaveRecipeDetails!=="function")throw Error("Firebase non disponibile");
  const entry=await window.haccpSaveRecipeDetails(data);
  sharedDrafts["r"+norm(entry.name)]={...entry};
  paintNewRecipes();
  if(latest){preview=classify(latest.items);paintDishes()}
  showText("al-books-full-message","Ricetta «"+entry.name+"» salvata anche nel libro condiviso. Verifica prima della stampa definitiva.",false);
 }catch(err){paintNewRecipes();showText("al-books-full-message","La scheda rimane su questo dispositivo; sincronizzazione non riuscita: "+(err.message||err),true)}
});
document.addEventListener("click",e=>{
 if(e.target.closest('[data-al-go="haccpAllergeniGiornaliero"]'))setTimeout(refresh,50);
 if(e.target.closest('[data-al-go="haccpAllergeniTotale"]'))setTimeout(refreshComplete,50);
});
showHistory();
})();