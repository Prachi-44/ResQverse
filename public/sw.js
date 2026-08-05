const CACHE_NAME = 'resqverse-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg'
];

// Install Service Worker and cache essential shell files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('ResQVerse: Pre-caching offline shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate and clean up deprecated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('ResQVerse: Removing deprecated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch interceptor with Network-First strategy for pages/scripts, falling back to cache
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip browser extensions or chrome:// URLs
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful network responses for offline use
        if (response.status === 200) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseCopy);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache on network failure
        console.log('ResQVerse: Network unavailable. Retrieving cached asset:', event.request.url);
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If the request is for a navigation page (e.g. router paths), return cached index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline: Resource not available in cache.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
      })
  );
});

// ============================================================
// PUSH NOTIFICATION HANDLER
// ============================================================
// When a push message is received, display an emergency notification
// with vibration pattern for urgent alerts.
self.addEventListener('push', (event) => {
  let data = {
    title: '🚨 RESQVERSE EMERGENCY SOS',
    body: 'An emergency SOS has been triggered! Open app for details.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'sos-emergency',
    url: '/sos-success'
  };

  // Try to parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      data = { ...data, ...pushData };
    } catch (e) {
      // If not JSON, use text as body
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: true, // Keep notification visible until user interacts
    silent: false,            // Play notification sound
    vibrate: [
      500, 200, 500, 200, 500, 200,   // Three long pulses
      100, 100, 100, 100, 100, 100,   // Rapid short pulses
      500, 200, 500, 200, 500         // Three more long pulses
    ],
    actions: [
      { action: 'open', title: '📍 View Location' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: { url: data.url }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============================================================
// NOTIFICATION CLICK HANDLER
// ============================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/dashboard';

  if (event.action === 'dismiss') {
    return; // Just close the notification
  }

  // Focus existing window or open new one
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Open a new window if none exists
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
