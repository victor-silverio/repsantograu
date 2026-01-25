const CACHE_NAME = 'santo-grau-v11';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/404.html',
  '/styles.css',
  '/src/script.js',
  '/manifest.json',
  '/icons/logo_rep_transparente.webp',
  '/imagens/frente_reitoria.webp',
  '/imagens/fundo_mobile.webp',
  '/icons/favicon-192x192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {

      const cachedResponse = await cache.match(event.request);

      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {

          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => {

          if (event.request.mode === 'navigate') {
            return cache.match('/404.html');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});