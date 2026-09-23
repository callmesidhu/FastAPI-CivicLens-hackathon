// CivicLens Service Worker v2
// Strategy: Network-first for API calls, Cache-first for static assets, Stale-while-revalidate for pages

const CACHE_NAME = 'civiclens-v2';
const RUNTIME_CACHE = 'civiclens-runtime-v2';
const MAP_TILE_CACHE = 'civiclens-tiles-v2';
const API_CACHE = 'civiclens-api-v2';          // Dedicated cache for facility/ticket API responses

// Static shell assets to precache on install
const PRECACHE_URLS = [
  '/',
  '/map',
  '/manifest.json',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/favicon.ico',
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precache partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const allowedCaches = [CACHE_NAME, RUNTIME_CACHE, MAP_TILE_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !allowedCaches.includes(key))
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch Router ─────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-http
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // ── Facility / Ticket API calls → Network-first with API_CACHE fallback ──
  const isApiCall =
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/facilities') ||
    url.pathname.includes('/tickets') ||
    url.port === '8000';

  if (isApiCall) {
    event.respondWith(networkFirstWithApiCache(request));
    return;
  }

  // ── Map tiles (satellite imagery, vector, OSRM routing) → Cache-first ──
  const isMapResource =
    url.hostname.includes('arcgisonline.com') ||
    url.hostname.includes('cartocdn.com') ||
    url.hostname.includes('basemaps.cartocdn.com') ||
    url.hostname.includes('project-osrm.org') ||
    url.hostname.includes('openstreetmap.org') ||
    url.pathname.endsWith('.pbf') ||
    url.pathname.endsWith('.mvt');

  if (isMapResource) {
    event.respondWith(cacheFirst(request, MAP_TILE_CACHE));
    return;
  }

  // ── Next.js static assets → Cache-first (immutable hashed filenames) ──
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // ── Page navigation → Stale-while-revalidate ──
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
    return;
  }

  // ── Everything else → Network with runtime fallback ──
  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

// ─── Strategies ───────────────────────────────────────────────────────────────

/**
 * Network-first with dedicated API cache.
 * On success: stores response in API_CACHE with a custom "sw-cached-at" header.
 * On network failure: returns the stale cached response.
 */
async function networkFirstWithApiCache(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const networkResponse = await fetch(request.clone());
    if (networkResponse.ok) {
      // Clone and annotate with cache timestamp
      const body = await networkResponse.clone().arrayBuffer();
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cached-at', new Date().toISOString());
      const annotated = new Response(body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers,
      });
      cache.put(request, annotated);
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      console.log('[SW] Serving stale API response for:', request.url);
      return cached;
    }
    return new Response(JSON.stringify({ error: 'Offline — no cached data', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'sw-offline': 'true' },
    });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request.clone());
    if (networkResponse.ok) cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request.clone());
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
  const fetchPromise = fetch(request.clone()).then((networkResponse) => {
    if (networkResponse.ok) cache.put(request, networkResponse.clone());
    return networkResponse;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// ─── Background Sync (pending offline reports) ────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-reports') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: 'SW_SYNC_TRIGGER', tag: 'sync-offline-reports' })
        );
      })
    );
  }
});

// ─── Push Notifications ───────────────────────────────────────────────────────
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

// ─── Message handler (from SyncManager) ──────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CACHE_WARMUP_DONE') {
    console.log('[SW] Cache warm-up confirmed by client. Facilities:', event.data.count);
  }
});
