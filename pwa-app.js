// PWA App Controller for Math Help
// Manages service worker, offline functionality, and app features

class PWAController {
  constructor() {
    this.config = {
      updateCheckInterval: 3600000, // 1 hour
      syncInterval: 300000, // 5 minutes
      offlineContentLimit: 100, // Max offline items
      notificationPermission: false,
      installPromptEvent: null
    };
    
    this.state = {
      isOnline: navigator.onLine,
      isStandalone: this.isStandalone(),
      hasUpdate: false,
      syncPending: false,
      offlineContent: new Map()
    };
    
    this.init();
  }

  async init() {
    // Check if PWA is supported
    if (!this.isPWASupported()) {
      console.log('PWA features not fully supported');
      return;
    }
    
    // Register service worker
    await this.registerServiceWorker();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize features
    this.initializeOfflineSupport();
    this.initializeNotifications();
    this.initializeBackgroundSync();
    this.initializeInstallPrompt();
    
    // Check for updates periodically
    this.startUpdateCheck();
  }

  // ============================================
  // SERVICE WORKER MANAGEMENT
  // ============================================

  isPWASupported() {
    return 'serviceWorker' in navigator && 
           'caches' in window && 
           'indexedDB' in window;
  }

  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered:', registration.scope);
      
      // Store registration
      this.registration = registration;
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        this.handleUpdateFound();
      });
      
      // Handle service worker states
      if (registration.waiting) {
        this.handleUpdateWaiting();
      }
      
      if (registration.active) {
        this.handleServiceWorkerReady();
      }
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  handleUpdateFound() {
    const newWorker = this.registration.installing;
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New update available
        this.state.hasUpdate = true;
        this.notifyUpdateAvailable();
      }
    });
  }

  handleUpdateWaiting() {
    this.state.hasUpdate = true;
    this.notifyUpdateAvailable();
  }

  handleServiceWorkerReady() {
    console.log('Service Worker ready');
    
    // Setup message channel
    this.setupMessageChannel();
    
    // Check cache status
    this.checkCacheStatus();
  }

  setupMessageChannel() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event.data);
    });
  }

  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'UPDATE_AVAILABLE':
        this.state.hasUpdate = true;
        this.notifyUpdateAvailable();
        break;
        
      case 'OFFLINE_MODE_READY':
        this.showNotification('Offline Mode', data.message);
        break;
        
      case 'SYNC_COMPLETE':
        this.state.syncPending = false;
        this.updateSyncStatus();
        break;
        
      default:
        console.log('Unknown message from SW:', data);
    }
  }

  notifyUpdateAvailable() {
    // Create update notification
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <p>A new version of Math Help is available!</p>
        <button class="update-btn" onclick="window.pwaController.updateApp()">Update Now</button>
        <button class="dismiss-btn" onclick="this.parentElement.parentElement.remove()">Later</button>
      </div>
    `;
    
    document.body.appendChild(notification);
  }

  async updateApp() {
    if (!this.registration.waiting) return;
    
    // Tell waiting service worker to take control
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload when new service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  // ============================================
  // OFFLINE SUPPORT
  // ============================================

  initializeOfflineSupport() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.state.isOnline = true;
      this.handleOnline();
    });
    
    window.addEventListener('offline', () => {
      this.state.isOnline = false;
      this.handleOffline();
    });
    
    // Initial status
    this.updateOnlineStatus();
  }

  handleOnline() {
    console.log('App is online');
    this.updateOnlineStatus();
    
    // Trigger sync
    this.triggerBackgroundSync();
    
    // Show notification
    this.showToast('You\'re back online!');
  }

  handleOffline() {
    console.log('App is offline');
    this.updateOnlineStatus();
    
    // Show notification
    this.showToast('You\'re offline. Content saved locally.');
  }

  updateOnlineStatus() {
    document.body.classList.toggle('offline', !this.state.isOnline);
    
    // Update UI indicators
    const indicator = document.querySelector('.online-indicator');
    if (indicator) {
      indicator.textContent = this.state.isOnline ? 'Online' : 'Offline';
      indicator.className = `online-indicator ${this.state.isOnline ? 'online' : 'offline'}`;
    }
  }

  async cacheContent(type, id, content) {
    if (!navigator.serviceWorker.controller) return;
    
    // Send to service worker for caching
    navigator.serviceWorker.controller.postMessage({
      type: `CACHE_${type.toUpperCase()}`,
      id: id,
      content: content
    });
    
    // Track offline content
    this.state.offlineContent.set(`${type}-${id}`, {
      type,
      id,
      title: content.title,
      cachedAt: Date.now()
    });
    
    // Limit offline content
    if (this.state.offlineContent.size > this.config.offlineContentLimit) {
      const oldestKey = Array.from(this.state.offlineContent.entries())
        .sort((a, b) => a[1].cachedAt - b[1].cachedAt)[0][0];
      this.state.offlineContent.delete(oldestKey);
    }
    
    this.updateOfflineContentUI();
  }

  updateOfflineContentUI() {
    const count = this.state.offlineContent.size;
    const indicator = document.querySelector('.offline-content-count');
    
    if (indicator) {
      indicator.textContent = count;
      indicator.style.display = count > 0 ? 'block' : 'none';
    }
  }

  getOfflineContent() {
    return Array.from(this.state.offlineContent.values());
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  async initializeNotifications() {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }
    
    // Check current permission
    this.config.notificationPermission = Notification.permission === 'granted';
    
    // Setup UI for requesting permission
    this.setupNotificationUI();
  }

  setupNotificationUI() {
    const enableBtn = document.querySelector('.enable-notifications-btn');
    if (!enableBtn) return;
    
    if (Notification.permission === 'granted') {
      enableBtn.textContent = 'Notifications Enabled';
      enableBtn.disabled = true;
    } else if (Notification.permission === 'denied') {
      enableBtn.textContent = 'Notifications Blocked';
      enableBtn.disabled = true;
    } else {
      enableBtn.addEventListener('click', () => this.requestNotificationPermission());
    }
  }

  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      this.config.notificationPermission = permission === 'granted';
      
      if (permission === 'granted') {
        this.showNotification('Notifications Enabled', 'You\'ll receive study reminders and updates');
        this.subscribeToPush();
      }
      
      this.setupNotificationUI();
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  }

  async subscribeToPush() {
    if (!this.registration || !('pushManager' in this.registration)) {
      return;
    }
    
    try {
      // Get public key from server
      const response = await fetch('/api/push/vapid-public-key');
      const { publicKey } = await response.json();
      
      // Subscribe to push
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      });
      
      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
      
      console.log('Push subscription successful');
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  showNotification(title, body, options = {}) {
    if (!this.config.notificationPermission) return;
    
    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'math-help-notification',
      requireInteraction: false
    };
    
    if (this.registration && this.registration.showNotification) {
      this.registration.showNotification(title, {
        body,
        ...defaultOptions,
        ...options
      });
    } else if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        ...defaultOptions,
        ...options
      });
    }
  }

  // ============================================
  // BACKGROUND SYNC
  // ============================================

  async initializeBackgroundSync() {
    if (!('sync' in this.registration)) {
      console.log('Background Sync not supported');
      return;
    }
    
    // Register periodic sync
    this.registerPeriodicSync();
  }

  async registerPeriodicSync() {
    try {
      await this.registration.sync.register('sync-data');
      console.log('Background sync registered');
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }

  async triggerBackgroundSync() {
    if (!this.registration || !('sync' in this.registration)) return;
    
    try {
      await this.registration.sync.register('sync-data');
      this.state.syncPending = true;
      this.updateSyncStatus();
    } catch (error) {
      console.error('Sync trigger failed:', error);
    }
  }

  updateSyncStatus() {
    const indicator = document.querySelector('.sync-indicator');
    if (indicator) {
      indicator.classList.toggle('syncing', this.state.syncPending);
      indicator.title = this.state.syncPending ? 'Syncing...' : 'Synced';
    }
  }

  // Store data for background sync
  async queueForSync(type, data) {
    const db = await this.openDatabase();
    const tx = db.transaction(type, 'readwrite');
    const store = tx.objectStore(type);
    
    await store.add({
      ...data,
      queuedAt: Date.now()
    });
    
    // Trigger sync if online
    if (this.state.isOnline) {
      this.triggerBackgroundSync();
    }
  }

  // ============================================
  // INSTALL PROMPT
  // ============================================

  initializeInstallPrompt() {
    // Intercept install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.config.installPromptEvent = e;
      this.showInstallPrompt();
    });
    
    // Check if already installed
    window.addEventListener('appinstalled', () => {
      console.log('App installed');
      this.hideInstallPrompt();
      this.showToast('Math Help installed successfully!');
    });
    
    // iOS install instructions
    if (this.isIOS() && !this.isStandalone()) {
      this.showIOSInstallPrompt();
    }
  }

  showInstallPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'pwa-install-prompt';
    prompt.innerHTML = `
      <div class="install-content">
        <img src="/icons/icon-96x96.png" alt="Math Help">
        <div class="install-text">
          <h3>Install Math Help</h3>
          <p>Install our app for offline access and a better experience</p>
        </div>
        <div class="install-actions">
          <button class="install-btn" onclick="window.pwaController.installApp()">Install</button>
          <button class="dismiss-btn" onclick="window.pwaController.dismissInstallPrompt()">Not Now</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(prompt);
    
    // Auto-hide after 30 seconds
    setTimeout(() => this.dismissInstallPrompt(), 30000);
  }

  async installApp() {
    if (!this.config.installPromptEvent) return;
    
    try {
      this.config.installPromptEvent.prompt();
      const result = await this.config.installPromptEvent.userChoice;
      
      console.log('Install prompt result:', result.outcome);
      
      if (result.outcome === 'accepted') {
        this.hideInstallPrompt();
      }
      
      this.config.installPromptEvent = null;
    } catch (error) {
      console.error('Install failed:', error);
    }
  }

  dismissInstallPrompt() {
    const prompt = document.querySelector('.pwa-install-prompt');
    if (prompt) {
      prompt.remove();
    }
    
    // Don't show again for 7 days
    localStorage.setItem('installPromptDismissed', Date.now());
  }

  hideInstallPrompt() {
    const prompt = document.querySelector('.pwa-install-prompt');
    if (prompt) {
      prompt.remove();
    }
  }

  showIOSInstallPrompt() {
    // Check if already dismissed recently
    const dismissed = localStorage.getItem('iosInstallDismissed');
    if (dismissed && Date.now() - dismissed < 7 * 24 * 60 * 60 * 1000) {
      return;
    }
    
    const prompt = document.createElement('div');
    prompt.className = 'ios-install-prompt';
    prompt.innerHTML = `
      <div class="ios-install-content">
        <h3>Install Math Help</h3>
        <p>Tap <img src="/icons/ios-share.svg" alt="Share"> then "Add to Home Screen"</p>
        <button onclick="this.parentElement.parentElement.remove(); localStorage.setItem('iosInstallDismissed', Date.now())">Got it</button>
      </div>
    `;
    
    document.body.appendChild(prompt);
  }

  // ============================================
  // UPDATE CHECKING
  // ============================================

  startUpdateCheck() {
    // Check immediately
    this.checkForUpdates();
    
    // Then check periodically
    setInterval(() => {
      this.checkForUpdates();
    }, this.config.updateCheckInterval);
  }

  async checkForUpdates() {
    if (!navigator.serviceWorker.controller) return;
    
    navigator.serviceWorker.controller.postMessage({
      type: 'CHECK_UPDATE'
    });
  }

  // ============================================
  // UTILITIES
  // ============================================

  isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  }

  isIOS() {
    return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
  }

  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MathHelpDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create stores if they don't exist
        ['pendingProgress', 'pendingQuizzes', 'activityLog'].forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
          }
        });
      };
    });
  }

  showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'pwa-toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  setupEventListeners() {
    // Handle app visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.state.isOnline) {
        this.checkForUpdates();
      }
    });
    
    // Handle share functionality
    if (navigator.share) {
      document.addEventListener('click', (e) => {
        if (e.target.matches('.share-btn')) {
          this.handleShare(e.target);
        }
      });
    }
    
    // Handle file inputs for math problems
    document.addEventListener('change', (e) => {
      if (e.target.matches('input[type="file"][accept*="image"]')) {
        this.handleMathImageUpload(e.target);
      }
    });
  }

  async handleShare(button) {
    const data = {
      title: button.dataset.title || 'Math Help',
      text: button.dataset.text || 'Check out this math problem!',
      url: button.dataset.url || window.location.href
    };
    
    try {
      await navigator.share(data);
      console.log('Content shared successfully');
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  }

  async handleMathImageUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Process image for math OCR
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/math/ocr', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        // Handle OCR result
        window.dispatchEvent(new CustomEvent('math-ocr-complete', {
          detail: result
        }));
      }
    } catch (error) {
      console.error('Math OCR failed:', error);
      this.showToast('Failed to process image');
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================

  async saveProgress(data) {
    if (this.state.isOnline) {
      try {
        const response = await fetch('/api/progress/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Save failed');
        
        return await response.json();
      } catch (error) {
        // Queue for sync
        await this.queueForSync('pendingProgress', data);
        throw error;
      }
    } else {
      // Queue for sync when online
      await this.queueForSync('pendingProgress', data);
      return { offline: true, queued: true };
    }
  }

  async cacheLesson(lessonId, lessonData) {
    await this.cacheContent('lesson', lessonId, lessonData);
  }

  async cacheMathExpression(expression, rendered) {
    if (!navigator.serviceWorker.controller) return;
    
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_MATH_EXPRESSION',
      expression,
      rendered
    });
  }

  enableOfflineMode() {
    if (!navigator.serviceWorker.controller) return;
    
    navigator.serviceWorker.controller.postMessage({
      type: 'ENABLE_OFFLINE_MODE'
    });
    
    this.showToast('Downloading content for offline use...');
  }

  getStatus() {
    return {
      isOnline: this.state.isOnline,
      isStandalone: this.state.isStandalone,
      hasUpdate: this.state.hasUpdate,
      syncPending: this.state.syncPending,
      offlineContentCount: this.state.offlineContent.size,
      notificationsEnabled: this.config.notificationPermission
    };
  }
}

// Initialize PWA controller
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pwaController = new PWAController();
  });
} else {
  window.pwaController = new PWAController();
}

// Add CSS for PWA UI elements
const style = document.createElement('style');
style.textContent = `
  .pwa-update-notification,
  .pwa-install-prompt,
  .ios-install-prompt {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 16px;
    z-index: 10000;
    max-width: 400px;
    width: 90%;
    animation: slideUp 0.3s ease;
  }
  
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  .update-content,
  .install-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .install-content img {
    width: 48px;
    height: 48px;
  }
  
  .install-text h3 {
    margin: 0 0 4px 0;
    font-size: 18px;
  }
  
  .install-text p {
    margin: 0;
    font-size: 14px;
    color: #666;
  }
  
  .update-btn,
  .install-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
  }
  
  .dismiss-btn {
    background: transparent;
    border: none;
    color: #666;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
  }
  
  .pwa-toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 14px;
    transition: transform 0.3s ease;
    z-index: 10000;
  }
  
  .pwa-toast.show {
    transform: translateX(-50%) translateY(0);
  }
  
  .online-indicator {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .online-indicator.online {
    background: #2ecc71;
    color: white;
  }
  
  .online-indicator.offline {
    background: #e74c3c;
    color: white;
  }
  
  .sync-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2ecc71;
    margin-left: 8px;
  }
  
  .sync-indicator.syncing {
    background: #f39c12;
    animation: pulse 1s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  
  body.offline .online-only {
    opacity: 0.5;
    pointer-events: none;
  }
  
  body.offline .offline-message {
    display: block;
  }
  
  .offline-message {
    display: none;
    background: #fff3cd;
    color: #856404;
    padding: 12px;
    border-radius: 6px;
    margin: 16px 0;
    text-align: center;
  }
  
  .offline-content-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #e74c3c;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }
  
  .ios-install-prompt {
    text-align: center;
  }
  
  .ios-install-prompt img {
    width: 20px;
    height: 20px;
    vertical-align: middle;
  }
  
  .ios-install-prompt button {
    margin-top: 12px;
    background: #007aff;
    color: white;
    border: none;
    padding: 8px 24px;
    border-radius: 20px;
    font-size: 14px;
  }
`;
document.head.appendChild(style);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWAController;
}