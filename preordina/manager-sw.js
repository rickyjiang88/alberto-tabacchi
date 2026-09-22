/* Alberto Manager: no orders, login credentials, or Firebase data cached. */
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname !== '/preordina/admin.html') return;
  event.respondWith(fetch(event.request, {cache:'no-store'}).catch(() =>
    new Response('<!doctype html><html lang="it"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#b5101b"><title>Alberto Manager · Offline</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f6f3;font:16px Arial;color:#222"><main style="padding:32px;text-align:center"><h1 style="color:#b5101b">ALBERTO MANAGER</h1><h2>Connessione assente</h2><p>Per gestire gli ordini serve una connessione Internet.</p><button onclick="location.reload()" style="border:0;border-radius:12px;background:#b5101b;color:white;padding:14px 28px;font-weight:bold">RIPROVA</button></main></body></html>', {headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})
  ));
});
