const CACHE_NAME = 'smartguide-pwa-v3';
const APP_SHELL = ['/', '/icon-192.png', '/icon-512.png', '/icon.svg'];

function isCacheableAsset(url, response) {
  if (!response || !response.ok || response.type !== 'basic') return false;
  const contentType = response.headers.get('content-type') || '';
  if (url.pathname.endsWith('.webmanifest')) return contentType.includes('json');
  if (url.pathname.endsWith('.png') || url.pathname.endsWith('.svg')) {
    return contentType.startsWith('image/');
  }
  return true;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith('smartguide-pwa-') && key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname === '/manifest.webmanifest' || url.pathname === '/sw.js') return;

  // Network-first for HTML navigation so fresh deploys load immediately, cache fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isCacheableAsset(url, response)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => undefined);
          }
          return response;
        })
        .catch(async () =>
          (await caches.match(request)) ?? (await caches.match('/')) ??
          new Response('SmartGuide is offline. Connect to the internet and try again.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          }),
        ),
    );
    return;
  }

  // Stale-while-revalidate for static assets (images, icons, CSS/JS chunks)
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (isCacheableAsset(url, response)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => undefined);
          }
          return response;
        })
        .catch(() => cached ?? Response.error());
      return cached || networkFetch;
    }),
  );
});
