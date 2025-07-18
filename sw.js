// Service Worker for Math Help - Offline support and performance optimization
const CACHE_NAME = 'math-help-v1';
const STATIC_CACHE = 'math-help-static-v1';
const DYNAMIC_CACHE = 'math-help-dynamic-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/styles.css',
    '/enhanced-styles.css',
    '/tooltip-styles.css',
    '/offline.html',
    '/favicon.ico',
    '/manifest.json'
];

// Pages to cache for offline access
const OFFLINE_PAGES = [
    '/algebra/',
    '/calculus/',
    '/geometry/',
    '/trigonometry/',
    '/statistics/',
    '/tools/',
    '/ai-assistant.html'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Caching offline pages');
                return caches.open(CACHE_NAME);
            })
            .then(cache => {
                return cache.addAll(OFFLINE_PAGES);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            return cacheName.startsWith('math-help-') &&
                                   cacheName !== STATIC_CACHE &&
                                   cacheName !== DYNAMIC_CACHE &&
                                   cacheName !== CACHE_NAME;
                        })
                        .map(cacheName => {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip external requests
    if (!request.url.startsWith(self.location.origin)) return;
    
    // Handle different request types
    if (request.destination === 'document') {
        // HTML pages - network first, cache fallback
        event.respondWith(networkFirst(request));
    } else if (request.destination === 'image') {
        // Images - cache first, network fallback
        event.respondWith(cacheFirst(request));
    } else if (request.destination === 'script' || request.destination === 'style') {
        // Scripts and styles - stale while revalidate
        event.respondWith(staleWhileRevalidate(request));
    } else {
        // Everything else - network first
        event.respondWith(networkFirst(request));
    }
});

// Cache strategies

// Network first, falling back to cache
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // If it's a navigation request, show offline page
        if (request.destination === 'document') {
            return caches.match('/offline.html');
        }
        
        throw error;
    }
}

// Cache first, falling back to network
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Return placeholder image if available
        if (request.destination === 'image') {
            return caches.match('/images/placeholder.png');
        }
        
        throw error;
    }
}

// Stale while revalidate
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
            const cache = caches.open(STATIC_CACHE);
            cache.then(c => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    });
    
    return cachedResponse || fetchPromise;
}

// Handle background sync for offline form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'sync-calculations') {
        event.waitUntil(syncCalculations());
    }
});

async function syncCalculations() {
    try {
        const cache = await caches.open('math-help-offline-calcs');
        const requests = await cache.keys();
        
        const promises = requests.map(async request => {
            const response = await cache.match(request);
            const data = await response.json();
            
            // Send to server
            const serverResponse = await fetch('/api/calculations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (serverResponse.ok) {
                await cache.delete(request);
            }
        });
        
        await Promise.all(promises);
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

// Push notifications for math news updates
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New math content available!',
        icon: '/images/icon-192.png',
        badge: '/images/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Updates',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Math Help Updates', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/news/')
        );
    }
});

// Periodic background sync for news updates
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-math-news') {
        event.waitUntil(updateMathNews());
    }
});

async function updateMathNews() {
    try {
        const response = await fetch('/api/news/latest');
        const news = await response.json();
        
        const cache = await caches.open('math-help-news');
        await cache.put('/api/news/latest', new Response(JSON.stringify(news)));
        
        // Show notification if there are new articles
        if (news.hasUpdates) {
            self.registration.showNotification('New Math Articles', {
                body: `${news.newCount} new articles available`,
                icon: '/images/news-icon.png',
                tag: 'news-update'
            });
        }
    } catch (error) {
        console.error('News update failed:', error);
    }
}