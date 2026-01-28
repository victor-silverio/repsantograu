const CACHE_NAME = 'santo-grau-v58';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html?v=10',
  '/fotos.html?v=10',
  '/404.html?v=10',
  '/styles.css?v=10',
  '/src/script.min.js?v=10',
  '/manifest.json?v=10',
  '/icons/logo_rep_transparente.webp?v=10',
  '/imagens/frente_reitoria.webp?v=10',
  '/imagens/fundo_mobile.webp?v=10',
  '/fonts/montserrat-v31-latin-700.woff2?v=10',
  '/fonts/montserrat-v31-latin-regular.woff2?v=10',
  '/fonts/playfair-display-v40-latin-700.woff2?v=10',
  '/icons/favicon-192x192.png?v=10',
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

  const isCriticalPage =
    url.pathname === '/' ||
    url.pathname.endsWith('index.html') ||
    url.pathname.endsWith('styles.css') ||
    url.pathname.endsWith('fotos.html');

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request, {
        ignoreSearch: true,
      });

      if (isCriticalPage) {
        try {
          const networkResponse = await fetch(event.request, {
            cache: 'reload',
          });
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }
        } catch {
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
