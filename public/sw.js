const CACHE_NAME = 'hnwi-chronicles-v1';
const STATIC_CACHE = 'hnwi-static-v1';

// Critical intelligence that must persist offline
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/_next/static/css/',
  '/_next/static/chunks/'
];

// Intelligence routes that benefit from caching
const INTELLIGENCE_ROUTES = [
  '/invest-scan',
  '/crown-vault', 
  '/prive-exchange',
  '/api/analytics/members',
  '/api/crown-vault/stats'
];

// Install: Cache core intelligence architecture
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean obsolete intelligence caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE
            )
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Intelligence-first caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API intelligence: Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => 
          caches.match(request)
            .then(response => response || new Response('{"offline": true}', {
              headers: { 'Content-Type': 'application/json' }
            }))
        )
    );
    return;
  }

  // Static assets: Cache first, network fallback
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
    );
    return;
  }

  // Navigation: Network first for fresh intelligence
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => 
          caches.match(request)
            .then(response => response || caches.match('/'))
        )
    );
    return;
  }

  // Default: Network first
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Background sync for critical intelligence updates
self.addEventListener('sync', event => {
  if (event.tag === 'intelligence-sync') {
    event.waitUntil(syncIntelligence());
  }
});

async function syncIntelligence() {
  try {
    // Sync critical intelligence when back online
    await fetch('/api/analytics/members');
    await fetch('/api/crown-vault/stats');
  } catch (error) {
    console.log('Intelligence sync deferred');
  }
}

// Push notifications for market intelligence
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: 'intelligence-update',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Intelligence'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});