// Service Worker for 학급 홈페이지 PWA
// SuperClaude Framework Mobile Optimization

const CACHE_NAME = 'class-homepage-v1';
const OFFLINE_URL = '/offline';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/class',
  '/offline',
  '/manifest.json',
  '/styles/globals.css',
  '/styles/mobile-optimized.css',
  // Add core JavaScript and CSS files
  '/_next/static/css/app/layout.css',
];

// Dynamic content cache strategy
const RUNTIME_CACHE = 'runtime-cache-v1';

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const { method, url } = request;
  
  // Only handle GET requests
  if (method !== 'GET') return;
  
  // Skip non-http requests
  if (!url.startsWith('http')) return;
  
  // Handle different types of requests with different strategies
  if (url.includes('/api/')) {
    // API requests - network first, cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (url.includes('/_next/static/')) {
    // Static assets - cache first
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Pages - stale while revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Network first strategy for API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's a critical API, return offline response
    return new Response(
      JSON.stringify({ 
        error: '오프라인 상태입니다. 네트워크 연결을 확인해주세요.',
        offline: true 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache first strategy for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline fallback for images
    if (request.destination === 'image') {
      return new Response('', {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' }
      });
    }
    
    throw error;
  }
}

// Stale while revalidate for pages
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Update cache in background
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  // Return cached version immediately, or wait for network
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    return await fetchPromise;
  } catch (error) {
    // Network failed and no cache, return offline page
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    
    throw error;
  }
}

// Background sync for form submissions when back online
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  // Implement background sync logic for offline form submissions
  const pendingData = await getStoredPendingData();
  
  for (const data of pendingData) {
    try {
      await fetch(data.url, {
        method: data.method,
        headers: data.headers,
        body: data.body
      });
      
      // Remove from pending after successful sync
      await removePendingData(data.id);
      
      // Notify user of successful sync
      self.registration.showNotification('동기화 완료', {
        body: '오프라인 중 저장된 데이터가 성공적으로 동기화되었습니다.',
        icon: '/icons/icon-192x192.png',
        tag: 'sync-complete'
      });
      
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}

// Push notification handler
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.url,
    actions: [
      {
        action: 'open',
        title: '열기'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

// Utility functions for IndexedDB operations
async function getStoredPendingData() {
  // Implement IndexedDB storage for offline data
  return [];
}

async function removePendingData(id) {
  // Remove synced data from IndexedDB
  console.log('Removing synced data:', id);
}

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PERFORMANCE_MEASURE') {
    // Log performance metrics
    console.log('Performance measure:', event.data.measure);
  }
});