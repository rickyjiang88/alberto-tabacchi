/* Alberto Shop Manager · Schede HACCP di compilazione.
 * BOZZA LOCALE: nessun accesso a Firebase, nessuna modifica a dati Shop/Fidelity.
 * Non sostituisce un archivio condiviso/validato. */
(function(){
"use strict";
if(!window.matchMedia("(max-width:760px)").matches)return;
const main=document.querySelector("main");
if(!main||document.getElementById("haccpScadenze"))return;

const ALLERGENS=[
["1","Cereali con glutine"],["2","Crostacei"],["3","Uova"],["4","Pesce"],
["5","Arachidi"],["6","Soia"],["7","Latte"],["8","Frutta a guscio"],
["9","Sedano"],["10","Senape"],["11","Sesamo"],["12","Anidride solforosa e solfiti"],
["13","Lupini"],["14","Molluschi"]
];
const field=(key,label,kind="text",required=true,options=[])=>({key,label,kind,required,options});
const types=[
{id:"haccpScadenze",title:"Scadenze prodotti",intro:"Controlla scadenze, lotti e conservazione.",color:"gold",fields:[
 field("prodotto","Nome prodotto"),field("lotto","Lotto"),field("fornitore","Fornitore","text",false),
 field("scadenza","Data di scadenza o TMC","date"),field("tipoData","Tipo di data","select",true,["Scadenza","TMC / da consumarsi preferibilmente entro"]),
 field("conservazione","Luogo e modalità di conservazione"),field("esito","Esito controllo","select",true,["Conforme","Da verificare","Non conforme","Prodotto scartato"]),
 field("azione","Azioni e note","textarea",false)]},
{id:"haccpAllergeniTotale",title:"Libro allergeni completo",intro:"Una scheda per ogni ricetta, con ingredienti e numeri dei 14 allergeni.",color:"rose",allergens:true,fields:[
 field("piatto","Nome piatto / ricetta"),field("categoria","Categoria","select",true,["Primo","Secondo","Contorno","Piatto unico","Tavola fredda","Colazione","Altro"]),
 field("ingredienti","Ingredienti completi e prodotti utilizzati","textarea"),field("note","Note / aggiornamento ricetta","textarea",false)]},
{id:"haccpAllergeniGiornaliero",title:"Libro allergeni giornaliero",intro:"Le ricette preparate oggi e gli allergeni verificati per ogni piatto.",color:"rose",allergens:true,fields:[
 field("piatto","Nome piatto del giorno"),field("ricettaBase","Ricetta del libro completo / riferimento","text",false),
 field("ingredienti","Ingredienti effettivi / variazioni","textarea"),field("note","Note allergeni e sostituzioni","textarea",false)]},
{id:"haccpPulizia",title:"Pulizia e sanificazione",intro:"Registra interventi effettivamente eseguiti secondo il piano pulizie.",color:"green",fields:[
 field("zona","Area o attrezzatura"),field("intervento","Intervento eseguito"),field("prodotto","Detergente / disinfettante utilizzato","text",false),
 field("esito","Esito","select",true,["Conforme","Da ripetere","Non conforme"]),
 field("azione","Azioni correttive / note","textarea",false)]},
{id:"haccpFrigoriferi",title:"Controllo frigoriferi",intro:"Inserisci la temperatura misurata e l'eventuale anomalia. Nessun limite viene preimpostato.",color:"blue",fields:[
 field("attrezzatura","Frigorifero / congelatore / identificativo"),field("temperatura","Temperatura misurata (°C)","number"),
 field("limite","Limite previsto dal tuo manuale (°C)","text",false),
 field("esito","Esito","select",true,["Conforme","Da verificare","Non conforme"]),
 field("azione","Anomalia e azione correttiva","textarea",false)]}
];
const STORAGE="alberto-haccp-bozze-locali-v1";
const NOW=()=>{const a=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Rome",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date());const x=Object.fromEntries(a.filter(z=>z.type!=="literal").map(z=>[z.type,z.value]));return x.year+"-"+x.month+"-"+x.day+"T"+x.hour+":"+x.minute};
const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const read=()=>{try{const a=JSON.parse(localStorage.getItem(STORAGE)||"[]");return Array.isArray(a)?a:[]}catch(e){return []}};
const store=entries=>{localStorage.setItem(STORAGE,JSON.stringify(entries))};
function markupField(f){
 const id="al-haccp-"+f.key;
 const label='<label for="'+id+'">'+esc(f.label)+(f.required?' <span class="al-haccp-required">*</span>':"")+'</label>';
 const attrs=' id="'+id+'" name="'+esc(f.key)+'" '+(f.required?"required ":"")+' autocomplete="off"';
 if(f.kind==="select")return '<div class="al-haccp-field">'+label+'<select'+attrs+'><option value="">Scegli…</option>'+f.options.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("")+'</select></div>';
 if(f.kind==="textarea")return '<div class="al-haccp-field full">'+label+'<textarea rows="3"'+attrs+'></textarea></div>';
 return '<div class="al-haccp-field">'+label+'<input type="'+(f.kind==="number"?"number":f.kind==="date"?"date":"text")+'"'+(f.kind==="number"?' step="0.1" inputmode="decimal"':"")+attrs+'></div>';
}
function allergensMarkup(){
return '<fieldset class="al-haccp-allergens"><legend>Allergeni presenti (numeri UE) <span class="al-haccp-required">*</span></legend>'+
 '<div class="al-haccp-allergens-grid">'+ALLERGENS.map(a=>'<label><input type="checkbox" name="allergeni" value="'+a[0]+'"><span><b>'+a[0]+'</b> '+esc(a[1])+'</span></label>').join("")+'</div>'+
 '<label class="al-haccp-none"><input type="checkbox" name="allergenNone" value="Nessuno"> Nessuno dei 14 allergeni, dopo verifica ingredienti</label>'+
 '<p class="al-haccp-help">Inserisci solo allergeni verificati: il sistema non li calcola dalle ricette.</p></fieldset>';
}
function build(t){
 const sec=document.createElement("section");sec.id=t.id;sec.className="panel al-haccp-panel al-haccp-"+t.color;
 sec.innerHTML='<div class="al-haccp-top"><div><span class="al-haccp-overline">HACCP · REGISTRI</span><h2>'+esc(t.title)+'</h2><p>'+esc(t.intro)+'</p></div><button class="al-haccp-return" type="button">Tutte le sezioni</button></div>'+
 '<div class="al-haccp-warning"><strong>Archivio locale provvisorio</strong><p>Queste schede sono bozze salvate solo su questo dispositivo. Non sono sincronizzate tra dipendenti o telefoni e non sostituiscono il registro HACCP ufficiale: per quello serve un archivio condiviso e validato con il piano di autocontrollo.</p></div>'+
 '<form class="al-haccp-form"><div class="al-haccp-fields">'+
 '<div class="al-haccp-field"><label>Locale / sede <span class="al-haccp-required">*</span></label><input name="sede" required autocomplete="organization" placeholder="Es. sede Alberto"></div>'+
 '<div class="al-haccp-field"><label>Operatore che ha eseguito il controllo <span class="al-haccp-required">*</span></label><input name="operatore" required autocomplete="name"></div>'+
 '<div class="al-haccp-field"><label>Data e ora effettive <span class="al-haccp-required">*</span></label><input type="datetime-local" name="dataOra" required></div>'+
 t.fields.map(markupField).join("")+'</div>'+
 (t.allergens?allergensMarkup():"")+
 '<div class="al-haccp-actions"><button type="submit" class="al-haccp-save">Salva bozza sul dispositivo</button><button type="button" class="al-haccp-export">Esporta registro CSV</button><button type="button" class="al-haccp-print">Stampa</button></div>'+
 '<p class="al-haccp-message" role="status"></p></form>'+
 '<div class="al-haccp-records"><div class="al-haccp-records-title"><h3>Registrazioni su questo dispositivo</h3><span class="al-haccp-count">0 schede</span></div><div class="al-haccp-list"></div></div>';
 main.append(sec);
 const form=sec.querySelector("form"),msg=sec.querySelector(".al-haccp-message");
 const date=form.elements.namedItem("dataOra");date.value=NOW();
 const sede=form.elements.namedItem("sede");try{sede.value=localStorage.getItem("alberto-haccp-sede-draft")||""}catch(e){}
 sec.querySelector(".al-haccp-return").addEventListener("click",()=>{
   if(typeof window.tab==="function")window.tab("dashboard");
   document.querySelector('[data-al-go="more"]')?.click();
 });
 form.addEventListener("submit",e=>{
  e.preventDefault();if(!form.reportValidity())return;
  const data={};const values=new FormData(form);for(const [k,v] of values.entries()){if(k==="allergeni"||k==="allergenNone")continue;data[k]=String(v).trim()}
  if(t.allergens){
   const selected=[...form.querySelectorAll('input[name="allergeni"]:checked')].map(x=>x.value);
   const none=!!form.querySelector('input[name="allergenNone"]:checked');
   if(!selected.length&&!none){msg.textContent="Verifica gli allergeni e seleziona i numeri oppure «Nessuno».";
    msg.dataset.error="1";return}
   if(selected.length&&none){msg.textContent="Non puoi selezionare insieme allergeni presenti e «Nessuno».";
    msg.dataset.error="1";return}
   data.allergeni=selected.join(", ")||(none?"Nessuno":"");
  }
  if(data.esito==="Non conforme"&&!data.azione){msg.textContent="Per una non conformità indica l'azione correttiva effettuata.";msg.dataset.error="1";return}
  if(t.id==="haccpScadenze"&&data.esito==="Prodotto scartato"&&!data.azione){msg.textContent="Indica come è stato gestito il prodotto scartato.";msg.dataset.error="1";return}
  try{
   const all=read();
   all.unshift({id:Date.now()+"-"+Math.random().toString(36).slice(2),type:t.id,created:new Date().toISOString(),data});
   store(all);
   localStorage.setItem("alberto-haccp-sede-draft",data.sede);
   msg.textContent="Bozza salvata solo sul dispositivo. Esporta regolarmente il CSV: non è un archivio condiviso.";
   msg.dataset.error="0";
   const who=data.operatore,site=data.sede;form.reset();date.value=NOW();sede.value=site;
   form.elements.namedItem("operatore").value=who;
   showRecords(t,sec);
  }catch(err){msg.textContent="Impossibile salvare la bozza sul dispositivo. Esporta o stampa i dati; verifica lo spazio disponibile.";msg.dataset.error="1"}
 });
 sec.querySelector(".al-haccp-export").addEventListener("click",()=>download(t));
 sec.querySelector(".al-haccp-print").addEventListener("click",()=>window.print());
 showRecords(t,sec);
}
function showRecords(t,sec){
 const rows=read().filter(x=>x.type===t.id);
 sec.querySelector(".al-haccp-count").textContent=rows.length+" schede";
 const list=sec.querySelector(".al-haccp-list");
 if(!rows.length){list.innerHTML='<p class="al-haccp-empty">Ancora nessuna scheda compilata su questo dispositivo.</p>';return}
 list.innerHTML=rows.slice(0,100).map(x=>{
  const d=x.data||{};
  const label=d.piatto||d.prodotto||d.attrezzatura||d.zona||t.title;
  const overview=Object.entries(d).filter(([key,v])=>!["sede","operatore","dataOra"].includes(key)&&String(v).trim()).slice(0,5).map(([key,v])=>'<span><b>'+esc(key.replace(/([A-Z])/g," $1"))+':</b> '+esc(v)+'</span>').join("");
  return '<article class="al-haccp-entry"><div class="al-haccp-entry-heading"><b>'+esc(label)+'</b><span>'+esc(String(d.dataOra||"").replace("T"," "))+'</span></div><small>'+esc(d.sede||"")+' · '+esc(d.operatore||"")+'</small><div class="al-haccp-entry-fields">'+overview+'</div></article>';
 }).join("");
}
function download(t){
 const rows=read().filter(x=>x.type===t.id);
 const sec=document.getElementById(t.id),msg=sec.querySelector(".al-haccp-message");
 if(!rows.length){msg.textContent="Non ci sono ancora registrazioni da esportare.";return}
 const keys=["created","sede","operatore","dataOra",...t.fields.map(f=>f.key),...(t.allergens?["allergeni"]:[])];
 // Neutralizza l'eventuale interpretazione come formula in un foglio elettronico.
 const csvValue=value=>{
  let s=String(value??"").replace(/[\u0000-\u001f\u007f]/g," ");
  if(/^[\s]*[=+@-]/.test(s))s="'"+s;
  return '"'+s.replace(/"/g,'""')+'"';
 };
 const csv="\uFEFF"+[keys.join(";"),...rows.map(x=>keys.map(k=>csvValue(k==="created"?x.created:(x.data||{})[k])).join(";"))].join("\r\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="HACCP_"+t.id+"_"+new Date().toISOString().slice(0,10)+".csv";document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),15000);
 msg.textContent="Esportazione richiesta. Conserva una copia del file: le bozze non sono sincronizzate.";
}
types.forEach(build);
})();