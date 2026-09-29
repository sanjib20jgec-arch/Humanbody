const CACHE_VERSION = 'hbl-shell-v4';
const MODEL_CACHE = 'hbl-atlas-bodyparts3d-4-0';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg'];

async function cacheNetworkResponse(cacheName, request, fallback = null) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallback) return caches.match(fallback);
    throw error;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('hbl-') && ![CACHE_VERSION, MODEL_CACHE].includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/@vite/') || url.pathname.includes('/src/')) return;

  if (url.pathname === '/models/atlas.json') {
    // The manifest is the version authority: prefer a fresh version, but keep
    // the previous manifest available when the user is offline.
    event.respondWith(cacheNetworkResponse(CACHE_VERSION, request));
    return;
  }

  // Phase 109: on-device pose assets work offline too.
  if (url.pathname.startsWith('/mediapipe-wasm/') || url.pathname.startsWith('/pose/')) {
    event.respondWith(caches.open(MODEL_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    }));
    return;
  }

  if (url.pathname.startsWith('/models/')) {
    event.respondWith(caches.open(MODEL_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    }));
    return;
  }

  event.respondWith(cacheNetworkResponse(CACHE_VERSION, request, '/index.html'));
});
