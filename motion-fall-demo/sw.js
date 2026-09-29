const CACHE_VERSION = 'motion-fall-v5';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-192.svg',
  './icon-512.svg',
  './vendor/three.module.js',
  './vendor/three.core.js',
  './vendor/cannon-es.js',
  './vendor/OrbitControls.js',
  './vendor/RoomEnvironment.js',
  './vendor/RGBELoader.js',
  './vendor/HDRLoader.js',
  './vendor/GLTFLoader.js',
  './vendor/utils/BufferGeometryUtils.js',
  './vendor/utils/SkeletonUtils.js',
  './vendor/README.txt',
  './assets/README.txt'
];

async function postCacheStatus(client) {
  const cache = await caches.open(CACHE_VERSION);
  const results = await Promise.all(APP_SHELL.map(async (request) => Boolean(await cache.match(request))));
  const cached = results.filter(Boolean).length;
  const message = {
    type: 'OFFLINE_READY',
    cacheVersion: CACHE_VERSION,
    expected: APP_SHELL.length,
    cached,
    complete: cached === APP_SHELL.length
  };
  if (client) {
    client.postMessage(message);
    return;
  }
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  clients.forEach((windowClient) => windowClient.postMessage(message));
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => postCacheStatus())
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
    return;
  }
  if (event.data?.type === 'CHECK_CACHE' || event.data?.type === 'GET_CACHE_STATUS') {
    event.waitUntil(postCacheStatus(event.source));
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok && url.pathname.includes('/assets/')) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => {
        if (request.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 503, statusText: 'Offline resource unavailable' });
      });
    })
  );
});
