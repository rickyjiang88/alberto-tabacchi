/* Statistiche Fidelity: sole letture, dati già presenti. */
(function(){
'use strict';
var records=null, loading=null,customers=null;
var labels=['Colazione','Pranzo','Aperitivo','Altri orari'];
var weekdays=['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
var money=new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'});
function byId(id){return document.getElementById(id)}
function clean(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]))}
function asDate(t){if(t&&typeof t.toDate==='function')return t.toDate();if(t&&t.seconds)return new Date(t.seconds*1000);return null}
function localInfo(d){var a=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',hour:'2-digit',minute:'2-digit',weekday:'short',day:'2-digit',month:'2-digit',year:'numeric',hourCycle:'h23'}).formatToParts(d);
 var o={};a.forEach(p=>{if(p.type!=='literal')o[p.type]=p.value});
 var h=Number(o.hour),b=h>=6&&h<11?0:h>=11&&h<16?1:h>=16&&h<23?2:3;
 var day=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(o.weekday);
 return {band:b,weekday:day,day:(o.day||'')+'/'+(o.month||'')+'/'+(o.year||''),time:o.hour+':'+o.minute};
}
function sample(days){var cutoff=days?Date.now()-days*86400000:0,byCustomer=new Map(),slots=[0,0,0,0],week=[0,0,0,0,0,0,0],total=0,count=0;
 (customers||[]).forEach(c=>{if(typeof fidelityIsTestAccount==='function'&&fidelityIsTestAccount(c))return;byCustomer.set(c.code,{code:c.code,name:[c.name,c.surname].filter(Boolean).join(' ')||c.email||c.code,email:c.email||'',spent:0,count:0,bands:[0,0,0,0],week:[0,0,0,0,0,0,0],history:[]})});
 (records||[]).forEach(t=>{
   if(t.type!=='PURCHASE'&&t.type!=='WALLET_PURCHASE')return;
   var c=byCustomer.get(String(t.customerCode||''));if(!c)return;
   var d=asDate(t.createdAt);if(!d||!Number.isFinite(d.getTime())||d.getTime()<cutoff)return;
   var v=localInfo(d),amount=Number(t.amount||0);if(!Number.isFinite(amount)||amount<0)amount=0;
   c.count++;c.spent+=amount;c.bands[v.band]++;if(v.weekday>=0)c.week[v.weekday]++;
   c.history.push({date:d,local:v,amount:amount});
   slots[v.band]++;if(v.weekday>=0)week[v.weekday]++;count++;total+=amount;
 });
 return {byCustomer,slots,week,count,total};
}
function bars(values,names){var max=Math.max(1,...values);
 return values.map((v,i)=>'<div class="fcb-barrow"><span>'+clean(names[i])+'</span><div class="fcb-track"><i style="width:'+Math.round(v/max*100)+'%"></i></div><b>'+v+'</b></div>').join('');
}
function render(){
 var box=byId('fcb-body');if(!box||!records)return;
 var days=Number(byId('fcb-range')?.value||90),s=sample(days),q=(byId('fcb-filter')?.value||'all'),term=(byId('fcb-search')?.value||'').toLowerCase().trim();
 var opts=[],routes=[[0,1,'Colazione → pranzo'],[1,0,'Pranzo → colazione'],[1,2,'Pranzo → aperitivo'],[2,1,'Aperitivo → pranzo']];
 s.byCustomer.forEach(c=>{for(var r of routes){if(c.bands[r[0]]>=2&&c.bands[r[1]]===0&&(q==='all'||q===r[0]+'-'+r[1]))opts.push({c,route:r})}});
 opts=opts.filter(x=>!term||[x.c.name,x.c.email,x.c.code].some(v=>String(v).toLowerCase().includes(term)));
 opts.sort((a,b)=>b.c.bands[b.route[0]]-a.c.bands[a.route[0]]||b.c.spent-a.c.spent);
 var html='<div class="fcb-stats"><div><small>ACQUISTI REGISTRATI</small><b>'+s.count+'</b></div><div><small>SPESA REGISTRATA</small><b>'+money.format(s.total)+'</b></div><div><small>CLIENTI CON ACQUISTI</small><b>'+Array.from(s.byCustomer.values()).filter(c=>c.count).length+'</b></div></div>';
 html+='<div class="fcb-charts"><div><h3>Quando acquistano</h3>'+bars(s.slots,labels)+'</div><div><h3>In quali giorni</h3>'+bars(s.week,weekdays)+'</div></div>';
 html+='<h3>Opportunità per altri momenti della giornata ('+opts.length+')</h3><p class="fcb-note">Clienti con almeno 2 acquisti registrati in una fascia e nessuno nella fascia proposta, nel periodo selezionato.</p>';
 html+=opts.length?'<div class="fcb-table"><table><thead><tr><th>Cliente</th><th>Proposta</th><th>Acquisti</th><th>Spesa</th></tr></thead><tbody>'+opts.slice(0,150).map(x=>'<tr><td><button type="button" data-fcb-client="'+clean(x.c.code)+'">'+clean(x.c.name)+'</button></td><td>'+x.route[2]+'</td><td>'+x.c.bands[x.route[0]]+'</td><td>'+money.format(x.c.spent)+'</td></tr>').join('')+'</tbody></table></div>':'<p class="fcb-note">Nessun cliente per i filtri selezionati.</p>';
 html+='<p class="fcb-note">Le fasce sono basate sull’ora della transazione, non sui prodotti consumati. Ricariche, bonus e account di test sono esclusi. Non sono incluse visite senza Fidelity.</p>';
 box.innerHTML=html;
 box.querySelectorAll('[data-fcb-client]').forEach(b=>b.addEventListener('click',()=>window.openFidelityCustomerFromList?.(b.dataset.fcbClient)));
}
async function load(force){
 if(loading)return loading;
 if(records&&!force){render();return}
 if(typeof fidelityApi==='undefined'||!fidelityApi){byId('fcb-body').textContent='Accesso Fidelity non ancora disponibile. Riprova.';return}
 var box=byId('fcb-body');box.textContent='Caricamento movimenti Fidelity…';
 loading=(async()=>{
 var result=await Promise.all([
 fidelityApi.getDocs(fidelityApi.collection(fidelityApi.db,'fidelityCustomers')),
 fidelityApi.getDocs(fidelityApi.collection(fidelityApi.db,'fidelityTransactions'))
 ]);
 customers=[];records=[];result[0].forEach(d=>customers.push({code:d.id,...d.data()}));result[1].forEach(d=>records.push(d.data()));
 render();
 })();
 try{await loading}catch(e){box.textContent='Impossibile leggere le statistiche: '+(e.code||e.message)}
 finally{loading=null}
}
function showCustomer(code){
 var box=byId('fcb-profile');if(!box)return;
 box.innerHTML='<b>Abitudini di acquisto</b> <button type="button" class="fcb-detail-btn">VISUALIZZA</button><p class="fcb-note">Scopri giorni, orari e importi degli acquisti Fidelity.</p>';
 box.querySelector('button').addEventListener('click',async()=>{
 await load();if(!records)return;
 var range=Number(byId('fcb-range')?.value||90),c=sample(range).byCustomer.get(code);
 if(!c){box.textContent='Nessun dato Fidelity per questo profilo.';return}
 c.history.sort((a,b)=>b.date-a.date);
 box.innerHTML='<h3>Abitudini di '+clean(c.name)+'</h3><div class="fcb-stats"><div><small>ACQUISTI</small><b>'+c.count+'</b></div><div><small>SPESA</small><b>'+money.format(c.spent)+'</b></div></div><div class="fcb-charts"><div><h4>Per fascia</h4>'+bars(c.bands,labels)+'</div><div><h4>Per giorno</h4>'+bars(c.week,weekdays)+'</div></div><h4>Ultimi acquisti con data e ora</h4>'+(c.history.length?c.history.slice(0,12).map(x=>'<div class="fcb-event">'+x.local.day+' · <b>'+x.local.time+'</b> · '+money.format(x.amount)+'</div>').join(''):'<p class="fcb-note">Nessun acquisto registrato nel periodo.</p>');
 });
}
function init(){
 if(byId('fcb-section'))return;
 var target=byId('fidelityCustomerList');if(!target)return;
 var panel=document.createElement('div');panel.id='fcb-section';panel.className='card';
 panel.innerHTML='<div class="fcb-head"><div><small>ALBERTO FIDELITY · STATISTICHE</small><h2>Quando vengono i tuoi clienti?</h2><p class="fcb-note">Analisi delle ore di acquisto: colazione, pranzo e aperitivo.</p></div><button type="button" class="red" id="fcb-load">ANALIZZA</button></div><div class="fcb-options"><label>Periodo <select id="fcb-range"><option value="30">30 giorni</option><option value="90" selected>90 giorni</option><option value="180">180 giorni</option><option value="0">Tutto lo storico</option></select></label><label>Promuovi <select id="fcb-filter"><option value="all">Tutti</option><option value="0-1">Colazione → pranzo</option><option value="1-0">Pranzo → colazione</option><option value="1-2">Pranzo → aperitivo</option><option value="2-1">Aperitivo → pranzo</option></select></label><label>Nome <input id="fcb-search" type="search" placeholder="Cerca cliente"></label></div><div id="fcb-body" aria-live="polite"><p class="fcb-note">Premi ANALIZZA per leggere gli acquisti già registrati.</p></div>';
 target.closest('.card').insertAdjacentElement('afterend',panel);
 var card=byId('fidelityCustomerCard');if(card){
 var p=document.createElement('div');p.id='fcb-profile';p.className='fcb-profile';card.querySelector('#fidCustomerDetails')?.insertAdjacentElement('afterend',p);
 }
 byId('fcb-load').addEventListener('click',()=>load(true));
 ['fcb-range','fcb-filter','fcb-search'].forEach(id=>byId(id).addEventListener(id==='fcb-search'?'input':'change',render));
 var css=document.createElement('style');css.textContent='#fcb-section{scroll-margin-top:24px}#fcb-section .fcb-head{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}#fcb-section h2{margin:8px 0}#fcb-section .fcb-options{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0}#fcb-section .fcb-options label{font-size:12px;font-weight:bold;display:flex;flex-direction:column;gap:6px}#fcb-section .fcb-options input,#fcb-section .fcb-options select{width:auto;min-width:140px;max-width:100%}.fcb-note{font-size:12px;line-height:1.5;color:#6b5c56}.fcb-stats{display:flex;flex-wrap:wrap;gap:9px;margin:15px 0}.fcb-stats>div{flex:1;min-width:110px;border-radius:12px;background:#fff0ed;padding:14px}.fcb-stats small{display:block;font-size:10px;font-weight:800;color:#7e5148}.fcb-stats b{font-size:21px;color:#b5101b;display:block;margin-top:6px}.fcb-charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:17px}.fcb-chart-row{display:flex}.fcb-barrow{display:grid;grid-template-columns:82px 1fr 35px;gap:8px;align-items:center;margin:9px 0;font-size:12px}.fcb-track{height:11px;background:#f1ece8;border-radius:20px;overflow:hidden}.fcb-track i{display:block;height:100%;background:#b5101b;border-radius:20px}.fcb-table{overflow-x:auto;max-height:390px;overflow-y:auto}.fcb-table table{border-collapse:collapse;width:100%;font-size:12px}.fcb-table th,.fcb-table td{text-align:left;padding:11px 9px;border-bottom:1px solid #eee}.fcb-table button{border:0;background:transparent;color:#a5101b;font-weight:800;text-align:left;text-decoration:underline}.fcb-profile{background:#fff8f5;padding:12px;border-radius:10px;margin:12px 0}.fcb-detail-btn{background:#b5101b;color:white;border:0;border-radius:8px;padding:9px 12px;font-weight:bold}.fcb-event{font-size:12px;padding:8px;border-bottom:1px solid #eee}';document.head.appendChild(css);
}
window.showFidelityCustomerBehavior=showCustomer;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();