const CACHE='alberto-fidelity-preview-v3';
const ASSETS=['/fidelity-preview/icon.svg','/fidelity-preview/manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('alberto-fidelity-preview-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);if(url.origin!==self.location.origin)return;
 if(request.mode==='navigate'&&url.pathname.startsWith('/fidelity-preview/')){
  event.respondWith(fetch(new Request(request,{cache:'no-store'})));return;
 }
 if(ASSETS.includes(url.pathname)){
  event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)))}return response}).catch(()=>caches.match(request)));}
});

// Notifiche push: gestione in background per la PWA installata.
// L'iscrizione e l'invio sicuro saranno configurati separatamente.
self.addEventListener('push',event=>{
 let payload={};
 try{payload=event.data?event.data.json():{}}catch(_){payload={body:event.data?event.data.text():''}}
 const title=String(payload.title||payload.notification?.title||'Alberto Fidelity');
 const body=String(payload.body||payload.notification?.body||'Hai un nuovo aggiornamento.');
 const url=String(payload.url||payload.data?.url||'/fidelity-preview/');
 const safeUrl=url.startsWith('/')&&!url.startsWith('//')?url:'/fidelity-preview/';
 event.waitUntil(self.registration.showNotification(title,{
  body,icon:'/fidelity-preview/icon-180.png',badge:'/fidelity-preview/icon-180.png',
  tag:String(payload.tag||payload.data?.tag||((payload.data?.kind||'push')+'-'+(payload.data?.broadcastId||payload.data?.campaignDate||payload.data?.orderId||'alberto'))),
  data:{url:safeUrl}
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const url=new URL(event.notification.data?.url||'/fidelity-preview/',self.location.origin).href;
 event.waitUntil((async()=>{
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows){if(new URL(client.url).origin===self.location.origin){await client.focus();if('navigate' in client)await client.navigate(url);return}}
  await self.clients.openWindow(url);
 })());
});
