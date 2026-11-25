const CACHE = 'astrelia-knowledge-shell-v5';
const BASE = new URL('./', self.location).pathname;
const SHELL = [BASE, BASE + 'index.html', BASE + 'manifest.webmanifest', BASE + 'favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;

  // Always check the network for app navigations so deployed releases reach installed PWAs.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(BASE + 'index.html', copy));
          }
          return response;
        })
        .catch(() => caches.match(BASE + 'index.html'))
    );
    return;
  }

  // Prefer deployed assets so installed PWAs receive new releases immediately.
  if (['script', 'style', 'image', 'font'].includes(event.request.destination)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
