// Service Worker for Math Help PWA
// Enables offline access, background sync, and push notifications

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `math-help-${CACHE_VERSION}`;
const CONTENT_CACHE = `content-${CACHE_VERSION}`;
const MATH_CACHE = `math-expressions-${CACHE_VERSION}`;

// Core files to cache for offline access
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  
  // Core CSS
  '/design-tokens/tokens.css',
  '/mobile/responsive-math.css',
  
  // Core JavaScript
  '/core-web-vitals/cwv-optimizer.js',
  '/core-web-vitals/mathjax-performance.js',
  '/mobile/math-keyboard.js',
  '/mobile/responsive-math.js',
  '/interactive/math-quiz.js',
  '/engagement/engagement-tracker.js',
  '/gamification/gamification-system.js',
  '/recommendations/recommendation-engine.js',
  
  // MathJax
  'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
  
  // Icons and images
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  
  // Fonts
  '/fonts/math-font.woff2'
];

// Content types to cache dynamically
const CACHEABLE_CONTENT = [
  '/api/lessons/',
  '/api/problems/',
  '/api/quizzes/',
  '/content/',
  '/images/'
];

// Network-first resources
const NETWORK_FIRST = [
  '/api/user/',
  '/api/progress/',
  '/api/leaderboard/',
  '/api/recommendations/'
];

// ============================================
// SERVICE WORKER LIFECYCLE
// ============================================

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Install complete');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[ServiceWorker] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== CONTENT_CACHE && 
                cacheName !== MATH_CACHE) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Activate complete');
        // Take control of all clients
        return self.clients.claim();
      })
  );
});

// ============================================
// FETCH STRATEGIES
// ============================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different resource types with appropriate strategies
  if (isNetworkFirst(url)) {
    event.respondWith(networkFirst(request));
  } else if (isCoreAsset(url)) {
    event.respondWith(cacheFirst(request));
  } else if (isCacheableContent(url)) {
    event.respondWith(staleWhileRevalidate(request));
  } else if (url.pathname.includes('/api/')) {
    event.respondWith(networkWithCacheFallback(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

// Cache-first strategy
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    console.log('[ServiceWorker] Cache hit:', request.url);
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    return caches.match('/offline.html');
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CONTENT_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', request.url);
    const cached = await caches.match(request);
    return cached || caches.match('/offline.html');
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(CONTENT_CACHE);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  });
  
  return cached || fetchPromise;
}

// Network with cache fallback
async function networkWithCacheFallback(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      console.log('[ServiceWorker] Using cached API response:', request.url);
      return cached;
    }
    
    // Return offline response for API calls
    return new Response(JSON.stringify({
      offline: true,
      message: 'Content not available offline'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper functions
function isNetworkFirst(url) {
  return NETWORK_FIRST.some(path => url.pathname.includes(path));
}

function isCoreAsset(url) {
  return CORE_ASSETS.includes(url.pathname) || 
         CORE_ASSETS.includes(url.href);
}

function isCacheableContent(url) {
  return CACHEABLE_CONTENT.some(path => url.pathname.includes(path));
}

// ============================================
// BACKGROUND SYNC
// ============================================

// Register sync event
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event:', event.tag);
  
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  } else if (event.tag === 'sync-quiz-results') {
    event.waitUntil(syncQuizResults());
  } else if (event.tag === 'sync-user-activity') {
    event.waitUntil(syncUserActivity());
  }
});

// Sync user progress
async function syncProgress() {
  try {
    const db = await openDatabase();
    const tx = db.transaction('pendingProgress', 'readonly');
    const store = tx.objectStore('pendingProgress');
    const progressData = await store.getAll();
    
    for (const data of progressData) {
      try {
        const response = await fetch('/api/progress/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          // Remove synced data
          const deleteTx = db.transaction('pendingProgress', 'readwrite');
          await deleteTx.objectStore('pendingProgress').delete(data.id);
        }
      } catch (error) {
        console.error('[ServiceWorker] Progress sync failed:', error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Database error:', error);
  }
}

// Sync quiz results
async function syncQuizResults() {
  try {
    const db = await openDatabase();
    const tx = db.transaction('pendingQuizzes', 'readonly');
    const store = tx.objectStore('pendingQuizzes');
    const quizData = await store.getAll();
    
    for (const quiz of quizData) {
      try {
        const response = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quiz)
        });
        
        if (response.ok) {
          const deleteTx = db.transaction('pendingQuizzes', 'readwrite');
          await deleteTx.objectStore('pendingQuizzes').delete(quiz.id);
        }
      } catch (error) {
        console.error('[ServiceWorker] Quiz sync failed:', error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Database error:', error);
  }
}

// Sync user activity
async function syncUserActivity() {
  try {
    const db = await openDatabase();
    const tx = db.transaction('activityLog', 'readonly');
    const store = tx.objectStore('activityLog');
    const activities = await store.getAll();
    
    if (activities.length > 0) {
      const response = await fetch('/api/activity/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities })
      });
      
      if (response.ok) {
        // Clear synced activities
        const clearTx = db.transaction('activityLog', 'readwrite');
        await clearTx.objectStore('activityLog').clear();
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Activity sync failed:', error);
  }
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================

// Push event handler
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  let data = {
    title: 'Math Help',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png'
  };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false
  };
  
  // Handle different notification types
  if (data.type === 'study-reminder') {
    options.actions = [
      { action: 'study', title: 'Start Studying' },
      { action: 'snooze', title: 'Remind me later' }
    ];
    options.requireInteraction = true;
  } else if (data.type === 'streak-reminder') {
    options.body = `Don't lose your ${data.streakDays} day streak! Complete a problem to maintain it.`;
    options.actions = [
      { action: 'practice', title: 'Practice Now' }
    ];
  } else if (data.type === 'achievement') {
    options.body = `Congratulations! You've unlocked: ${data.achievementName}`;
    options.image = data.achievementImage;
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked:', event.action);
  event.notification.close();
  
  let targetUrl = '/';
  
  switch (event.action) {
    case 'study':
    case 'practice':
      targetUrl = '/practice';
      break;
    case 'snooze':
      // Schedule a new reminder
      scheduleReminder(30); // 30 minutes
      return;
    default:
      // Use URL from notification data if available
      if (event.notification.data && event.notification.data.url) {
        targetUrl = event.notification.data.url;
      }
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if needed
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Schedule a reminder
async function scheduleReminder(minutes) {
  const registration = self.registration;
  
  try {
    await registration.showNotification('Reminder Set', {
      body: `We'll remind you in ${minutes} minutes`,
      icon: '/icons/icon-192x192.png',
      tag: 'reminder-confirmation',
      requireInteraction: false
    });
    
    // Set timeout for new reminder
    setTimeout(() => {
      registration.showNotification('Study Reminder', {
        body: "Time to get back to studying!",
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'study-reminder',
        actions: [
          { action: 'study', title: 'Start Studying' },
          { action: 'snooze', title: 'Remind me later' }
        ],
        requireInteraction: true
      });
    }, minutes * 60 * 1000);
  } catch (error) {
    console.error('[ServiceWorker] Failed to schedule reminder:', error);
  }
}

// ============================================
// OFFLINE MATH CONTENT
// ============================================

// Cache math expressions for offline use
self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_MATH_EXPRESSION') {
    cacheMathExpression(event.data.expression, event.data.rendered);
  } else if (event.data.type === 'CACHE_LESSON_CONTENT') {
    cacheLessonContent(event.data.lessonId, event.data.content);
  } else if (event.data.type === 'ENABLE_OFFLINE_MODE') {
    enableOfflineMode();
  }
});

// Cache rendered math expressions
async function cacheMathExpression(expression, rendered) {
  try {
    const cache = await caches.open(MATH_CACHE);
    const response = new Response(rendered, {
      headers: { 'Content-Type': 'text/html' }
    });
    
    const url = new URL('/math/expression', self.location);
    url.searchParams.set('expr', expression);
    
    await cache.put(url, response);
    console.log('[ServiceWorker] Cached math expression:', expression);
  } catch (error) {
    console.error('[ServiceWorker] Failed to cache math:', error);
  }
}

// Cache lesson content for offline access
async function cacheLessonContent(lessonId, content) {
  try {
    const cache = await caches.open(CONTENT_CACHE);
    
    // Cache lesson data
    const lessonResponse = new Response(JSON.stringify(content), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(`/api/lessons/${lessonId}`, lessonResponse);
    
    // Cache associated images
    if (content.images) {
      for (const imageUrl of content.images) {
        try {
          const imageResponse = await fetch(imageUrl);
          if (imageResponse.ok) {
            await cache.put(imageUrl, imageResponse);
          }
        } catch (error) {
          console.error('[ServiceWorker] Failed to cache image:', imageUrl);
        }
      }
    }
    
    console.log('[ServiceWorker] Cached lesson:', lessonId);
  } catch (error) {
    console.error('[ServiceWorker] Failed to cache lesson:', error);
  }
}

// Enable full offline mode
async function enableOfflineMode() {
  try {
    // Cache all essential content
    const essentialContent = [
      '/api/lessons/featured',
      '/api/problems/daily',
      '/api/topics/list'
    ];
    
    const cache = await caches.open(CONTENT_CACHE);
    
    for (const url of essentialContent) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.error('[ServiceWorker] Failed to cache:', url);
      }
    }
    
    // Notify client
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'OFFLINE_MODE_READY',
        message: 'Essential content cached for offline use'
      });
    });
  } catch (error) {
    console.error('[ServiceWorker] Failed to enable offline mode:', error);
  }
}

// ============================================
// DATABASE HELPERS
// ============================================

// Open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MathHelpDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('pendingProgress')) {
        db.createObjectStore('pendingProgress', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('pendingQuizzes')) {
        db.createObjectStore('pendingQuizzes', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('activityLog')) {
        const store = db.createObjectStore('activityLog', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

// ============================================
// UPDATE HANDLING
// ============================================

// Check for updates
self.addEventListener('message', (event) => {
  if (event.data.type === 'CHECK_UPDATE') {
    checkForUpdate();
  }
});

async function checkForUpdate() {
  try {
    const response = await fetch('/version.json');
    const data = await response.json();
    
    if (data.version !== CACHE_VERSION) {
      // Notify clients about update
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE',
          version: data.version
        });
      });
    }
  } catch (error) {
    console.error('[ServiceWorker] Update check failed:', error);
  }
}

console.log('[ServiceWorker] Loaded successfully');