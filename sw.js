const CACHE_NAME = 'santo-grau-v45';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/fotos.html',
  '/404.html',
  '/styles.css',
  '/src/script.js',
  '/src/amenities.json',
  '/manifest.json',
  '/icons/logo_rep_transparente.webp',
  '/imagens/frente_reitoria.webp',
  '/imagens/fundo_mobile.webp',
  '/fonts/montserrat-v31-latin-700.woff2',
  '/fonts/montserrat-v31-latin-regular.woff2',
  '/fonts/playfair-display-v40-latin-700.woff2',
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

  const isCriticalPage = url.pathname === '/' ||
    url.pathname.endsWith('index.html') ||
    url.pathname.endsWith('styles.css') ||
    url.pathname.endsWith('fotos.html');

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);

      if (isCriticalPage) {

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }
        } catch (error) {

          if (cachedResponse) return cachedResponse;
        }

        return cachedResponse || fetch(event.request);

      } else {

        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      }
    })
  );
});