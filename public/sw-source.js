// Service Worker for HNWI Chronicles
// This file provides push notification support and offline capabilities

// INCREMENT VERSION TO FORCE CACHE UPDATE
const CACHE_VERSION = '2.1.0'; // Updated to fix assessment issues
const CACHE_NAME = `hnwi-chronicles-v${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/logo.png',
  '/icon-192x192.png',
  '/badge-72x72.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete ALL old caches that don't match current version
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Clear any assessment-related data from all caches
        return caches.open(CACHE_NAME).then((cache) => {
          return cache.keys().then((requests) => {
            const assessmentRequests = requests.filter(request => {
              const url = new URL(request.url);
              return url.pathname.includes('/assessment') ||
                     url.pathname.includes('/simulation');
            });
            return Promise.all(
              assessmentRequests.map(request => cache.delete(request))
            );
          });
        });
      })
      .then(() => {
        console.log('[SW] Service Worker activated with version:', CACHE_VERSION);
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // CRITICAL: Never cache assessment/simulation related endpoints
  const url = new URL(event.request.url);
  const isAssessmentEndpoint = url.pathname.includes('/assessment') ||
                                url.pathname.includes('/simulation');

  // For assessment endpoints, always use network-only strategy
  if (isAssessmentEndpoint) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response('Assessment service temporarily unavailable', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If request is successful, clone and cache the response
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If not in cache and it's a navigation request, serve offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // For other requests, return a basic response
            return new Response('Service Unavailable', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {

  let notificationData = {};
  
  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (error) {
    notificationData = {
      title: 'HNWI Chronicles',
      body: event.data?.text() || 'You have a new notification'
    };
  }

  const notificationOptions = {
    body: notificationData.content || notificationData.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: notificationData.id || 'hnwi-notification',
    timestamp: Date.now(),
    requireInteraction: notificationData.priority === 'urgent',
    vibrate: [200, 100, 200],
    data: {
      ...notificationData,
      clickUrl: notificationData.actionUrl || notificationData.clickUrl || '/',
      notificationId: notificationData.id
    },
    actions: [
      {
        action: 'view',
        title: notificationData.actionLabel || 'View',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-192x192.png'
      }
    ]
  };

  const title = notificationData.title || 'HNWI Chronicles';

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});

// Notification click event - handle user interaction with notifications
self.addEventListener('notificationclick', (event) => {

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  // Handle dismiss action
  if (action === 'dismiss') {
    return;
  }

  // Handle view action or default click
  const urlToOpen = data.clickUrl || '/';

  event.waitUntil(
    self.clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
    .then((clients) => {
      // Check if there's already a window/tab open with the target URL
      const existingClient = clients.find(client => 
        client.url === urlToOpen || client.url === self.location.origin + urlToOpen
      );

      if (existingClient && 'focus' in existingClient) {
        return existingClient.focus();
      }

      // Check if there's any window open for this origin
      const appClient = clients.find(client => 
        client.url.startsWith(self.location.origin)
      );

      if (appClient && 'navigate' in appClient && 'focus' in appClient) {
        return appClient.navigate(urlToOpen).then(() => appClient.focus());
      }

      // If no window/tab is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
    .catch((error) => {
    })
  );

  // Track notification click for analytics
  if (data.notificationId) {
    // Send analytics event to track notification engagement
    fetch('/api/analytics/notification-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: data.notificationId,
        action: action || 'click',
        timestamp: Date.now()
      })
    }).catch(() => {
      // Ignore analytics errors
    });
  }
});

// Notification close event - handle when user dismisses notification
self.addEventListener('notificationclose', (event) => {
  
  const data = event.notification.data || {};
  
  // Track notification close for analytics
  if (data.notificationId) {
    fetch('/api/analytics/notification-close', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: data.notificationId,
        timestamp: Date.now()
      })
    }).catch(() => {
      // Ignore analytics errors
    });
  }
});

// Background sync event - handle offline actions
self.addEventListener('sync', (event) => {

  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Sync notification status with server when back online
      fetch('/api/notifications/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: Date.now(),
          action: 'sync'
        })
      }).catch(() => {
        // Ignore sync errors
      })
    );
  }
});

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {

  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;

      case 'CLEAR_CACHE':
        // Clear all caches on demand
        event.waitUntil(
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => caches.delete(cacheName))
            );
          }).then(() => {
            console.log('[SW] All caches cleared');
            // Notify clients that cache was cleared
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({ type: 'CACHE_CLEARED' });
              });
            });
          })
        );
        break;

      case 'CLEAR_ASSESSMENT_CACHE':
        // Clear only assessment-related cache entries
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
            return cache.keys().then((requests) => {
              const assessmentRequests = requests.filter(request => {
                const url = new URL(request.url);
                return url.pathname.includes('/assessment') ||
                       url.pathname.includes('/simulation');
              });
              return Promise.all(
                assessmentRequests.map(request => cache.delete(request))
              );
            });
          }).then(() => {
            console.log('[SW] Assessment cache cleared');
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({ type: 'ASSESSMENT_CACHE_CLEARED' });
              });
            });
          })
        );
        break;

      case 'CACHE_NOTIFICATION':
        // Cache notification data for offline access
        if (event.data.notification) {
          caches.open(CACHE_NAME)
            .then(cache => {
              const request = new Request(`/notifications/${event.data.notification.id}`);
              const response = new Response(JSON.stringify(event.data.notification), {
                headers: { 'Content-Type': 'application/json' }
              });
              return cache.put(request, response);
            });
        }
        break;

      default:
    }
  }
});

