// KaiMini service worker – zmień VERSION przy każdej aktualizacji
const VERSION = 'kaimini-1.3';
const FF_CACHE = 'kaimini-ffmpeg-0.12.10';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== FF_CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // ffmpeg z CDN – zapamiętaj na stałe (konwerter działa potem offline)
  if (req.url.startsWith('https://cdn.jsdelivr.net/npm/@ffmpeg/core@')) {
    e.respondWith(caches.open(FF_CACHE).then(c => c.match(req).then(r => r || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }
  if (new URL(req.url).origin !== location.origin) return;
  // najpierw cache (działa offline), wersję zmienia nowy sw.js
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req)));
});
