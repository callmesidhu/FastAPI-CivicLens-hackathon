// CivicLens Service Worker
// Strategy: Network-first for API calls, Cache-first for static assets, Stale-while-revalidate for pages

const CACHE_NAME = 'civiclens-v1';
const RUNTIME_CACHE = 'civiclens-runtime-v1';
const MAP_TILE_CACHE = 'civiclens-tiles-v1';

// Static shell assets to precache on install
const PRECACHE_URLS = [
  '/',
  '/map',
  '/manifest.json',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/favicon.ico',
];

// Install: precache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precache partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  const allowedCaches = [CACHE_NAME, RUNTIME_CACHE, MAP_TILE_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !allowedCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: smart routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, etc.)
  if (request.method !== 'GET') return;

  // Skip chrome-extension, ws, etc.
  if (!url.protocol.startsWith('http')) return;

  // API calls → Network-first (fallback to cache if offline)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/facilities') || url.port === '8000') {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  // Map tiles (Esri, CartoCSS, OSRM) → Cache-first with short TTL
  if (
    url.hostname.includes('arcgisonline.com') ||
    url.hostname.includes('cartocdn.com') ||
    url.hostname.includes('basemaps.cartocdn.com') ||
    url.hostname.includes('project-osrm.org')
  ) {
    event.respondWith(cacheFirst(request, MAP_TILE_CACHE));
    return;
  }

  // Next.js static assets (_next/static) → Cache-first (immutable)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Pages → Stale-while-revalidate
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
    return;
  }

  // Everything else → Network with runtime cache fallback
  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

// ─── Strategies ──────────────────────────────────────────────

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// Background sync: replay queued offline reports when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-reports') {
    event.waitUntil(syncOfflineReports());
  }
});

async function syncOfflineReports() {
  try {
    const { openDB } = await import('/idb.mjs').catch(() => null) || {};
    // Placeholder: actual sync is handled by SyncManager component
    console.log('[SW] Background sync: offline-reports triggered');
  } catch (err) {
    console.warn('[SW] Sync error:', err);
  }
}

// Push notifications (future)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || 'New update from CivicLens',
    icon: '/pwa-icon-192.png',
    badge: '/pwa-icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/map' },
    actions: [
      { action: 'open', title: 'Open Map' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'CivicLens', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/map';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
