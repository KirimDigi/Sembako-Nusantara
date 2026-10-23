// Sembako Nusantara Jepang - PWA Service Worker
// Super Lightweight, Zero-Egress Preservation Architecture
const CACHE_VERSION = 'sn-pwa-v1.0.1';
const STATIC_CACHE = `sn-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `sn-runtime-${CACHE_VERSION}`;

// Pre-cache core shell assets for instant 0ms offline load
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './pwa-icon.svg',
  './logo-transparent.png',
  './placeholder-upload.svg',
  './placeholder-upload-jp.svg',
  './placeholder-upload-en.svg',
  './whatsapp-icon.png'
];

// Install: pre-cache shell and immediately activate
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up older caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('sn-') && name !== STATIC_CACHE && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Purging outdated cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim()).then(() => {
      // Notify active tabs about successful update activation
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_VERSION });
        });
      });
    })
  );
});

// Listen for message from frontend app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: Egress-saving intelligent cache strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Skip chrome-extension, internal protocols, or analytics
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Strategy 1: HTML / Navigation Requests
  // Network-First with quick fallback to cached index.html
  // Ensures customer gets newest HTML when available, but 0 downtime if offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const indexCached = await caches.match('./index.html');
          if (indexCached) return indexCached;
          return caches.match('/');
        })
    );
    return;
  }

  // Strategy 2: Static Assets (JS, CSS, SVGs, Images, Web Fonts)
  // Cache-First with Stale-While-Revalidate:
  // Returns immediately from CacheStorage = 0 EGRESS / 0 BANDWIDTH USED!
  // Updates cache in the background when network permits.
  const isStaticAsset =
    url.pathname.includes('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache immediately (0 bytes egress from server!)
          // Silently revalidate in background if online
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {
              // Ignore background fetch failure, cached response already served
            });
          return cachedResponse;
        }

        // If not in cache yet, fetch over network and cache for next time
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
