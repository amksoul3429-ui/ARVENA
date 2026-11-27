const CACHE = 'asteria-shell-v5';
const BASE = new URL('./', self.location).pathname;
const SHELL = [BASE, BASE + 'index.html', BASE + 'manifest.webmanifest', BASE + 'favicon.svg', BASE + 'asteria-mark.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    // Precache Vite's fingerprinted entry assets for a real offline first launch.
    const response = await fetch(BASE + 'index.html', { cache: 'reload' });
    if (!response.ok) throw new Error('Unable to fetch the ASTERIA application shell.');
    const html = await response.clone().text();
    await cache.put(BASE + 'index.html', response);
    const pattern = /(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g;
    const assets = [...html.matchAll(pattern)]
      .map((match) => new URL(match[1], self.location.origin))
      .filter((url) => url.origin === self.location.origin && url.pathname.startsWith(BASE))
      .map((url) => url.href);
    if (assets.length) await cache.addAll(assets);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(BASE + 'index.html', copy));
        }
        return response;
      })
      .catch(() => caches.match(BASE + 'index.html')));
    return;
  }
  if (['script', 'style', 'image', 'font'].includes(event.request.destination)) {
    event.respondWith(fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request)));
  }
});
