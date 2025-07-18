// Performance Tracker for Math Platforms
// Real-time monitoring and alerting for Core Web Vitals

class PerformanceTracker {
  constructor() {
    this.config = {
      monitoring: {
        enabled: true,
        sampleRate: 1.0,
        bufferSize: 100,
        reportingInterval: 30000, // 30 seconds
        endpoint: '/api/performance-metrics'
      },
      
      alerts: {
        enabled: true,
        thresholds: {
          LCP: { warning: 2000, critical: 2500 },
          INP: { warning: 150, critical: 200 },
          CLS: { warning: 0.05, critical: 0.1 },
          FCP: { warning: 1500, critical: 1800 },
          TTFB: { warning: 600, critical: 800 }
        },
        cooldown: 300000 // 5 minutes between alerts
      },
      
      analytics: {
        trackUser: true,
        trackSession: true,
        trackPage: true,
        trackDevice: true,
        trackNetwork: true
      },
      
      storage: {
        type: 'localStorage', // 'localStorage', 'sessionStorage', 'indexedDB'
        prefix: 'perf_',
        maxAge: 86400000 // 24 hours
      }
    };
    
    this.metrics = {
      buffer: [],
      aggregated: {},
      alerts: new Map(),
      session: this.generateSessionId()
    };
    
    this.observers = new Map();
    this.init();
  }

  init() {
    this.setupWebVitalsObservers();
    this.setupCustomMetrics();
    this.setupErrorTracking();
    this.setupResourceTiming();
    this.setupNetworkMonitoring();
    this.setupReporting();
    this.loadHistoricalData();
  }

  // ============================================
  // WEB VITALS OBSERVERS
  // ============================================

  setupWebVitalsObservers() {
    // LCP Observer
    this.setupLCPObserver();
    
    // INP Observer (2024 metric)
    this.setupINPObserver();
    
    // CLS Observer
    this.setupCLSObserver();
    
    // FCP Observer
    this.setupFCPObserver();
    
    // TTFB from Navigation Timing
    this.measureTTFB();
  }

  setupLCPObserver() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.recordMetric({
          type: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          element: lastEntry.element?.tagName,
          size: lastEntry.size,
          url: lastEntry.url,
          timestamp: performance.now()
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('LCP', observer);
    } catch (e) {
      console.error('LCP Observer setup failed:', e);
    }
  }

  setupINPObserver() {
    try {
      let inpValue = 0;
      const processedInteractions = new Set();
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Only process event timing entries
          if (entry.entryType === 'event') {
            const interactionId = entry.interactionId;
            
            // Skip if we've already processed this interaction
            if (interactionId && processedInteractions.has(interactionId)) {
              continue;
            }
            
            if (interactionId) {
              processedInteractions.add(interactionId);
            }
            
            const duration = entry.duration;
            
            // Update INP value (always track the worst interaction)
            if (duration > inpValue) {
              inpValue = duration;
              
              this.recordMetric({
                type: 'INP',
                value: duration,
                eventType: entry.name,
                target: entry.target?.tagName,
                processingStart: entry.processingStart,
                processingEnd: entry.processingEnd,
                timestamp: performance.now()
              });
            }
          }
        }
      });
      
      observer.observe({ 
        entryTypes: ['event'],
        buffered: true,
        durationThreshold: 16 // Track events > 16ms
      });
      
      this.observers.set('INP', observer);
    } catch (e) {
      console.error('INP Observer setup failed:', e);
    }
  }

  setupCLSObserver() {
    try {
      let clsValue = 0;
      let clsEntries = [];
      let sessionValue = 0;
      let sessionEntries = [];
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Only count layout shifts without recent user input
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
            
            // If this entry is more than 1s after the previous one or
            // more than 5s after the first one, start a new session
            if (sessionEntries.length &&
                (entry.startTime - lastSessionEntry.startTime > 1000 ||
                 entry.startTime - firstSessionEntry.startTime > 5000)) {
              // Record the previous session if it's worse than current
              if (sessionValue > clsValue) {
                clsValue = sessionValue;
                clsEntries = [...sessionEntries];
              }
              sessionValue = entry.value;
              sessionEntries = [entry];
            } else {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            }
            
            this.recordMetric({
              type: 'CLS',
              value: Math.max(clsValue, sessionValue),
              sources: sessionEntries.map(e => ({
                node: e.sources?.[0]?.node?.tagName,
                previousRect: e.sources?.[0]?.previousRect,
                currentRect: e.sources?.[0]?.currentRect
              })),
              timestamp: performance.now()
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('CLS', observer);
    } catch (e) {
      console.error('CLS Observer setup failed:', e);
    }
  }

  setupFCPObserver() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric({
              type: 'FCP',
              value: entry.startTime,
              timestamp: performance.now()
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('FCP', observer);
    } catch (e) {
      console.error('FCP Observer setup failed:', e);
    }
  }

  measureTTFB() {
    // Use Navigation Timing API
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const ttfb = timing.responseStart - timing.requestStart;
      
      if (ttfb > 0) {
        this.recordMetric({
          type: 'TTFB',
          value: ttfb,
          timestamp: performance.now()
        });
      }
    }
    
    // Also use newer Navigation Timing API v2
    if (window.performance && window.performance.getEntriesByType) {
      const [navigation] = performance.getEntriesByType('navigation');
      if (navigation && navigation.responseStart) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        this.recordMetric({
          type: 'TTFB',
          value: ttfb,
          timestamp: performance.now()
        });
      }
    }
  }

  // ============================================
  // CUSTOM METRICS
  // ============================================

  setupCustomMetrics() {
    // Math rendering metrics
    this.trackMathRendering();
    
    // Ad loading metrics
    this.trackAdPerformance();
    
    // User interaction metrics
    this.trackUserInteractions();
  }

  trackMathRendering() {
    // Monitor MathJax performance
    if (window.MathJax) {
      const originalTypeset = MathJax.typeset;
      MathJax.typeset = async (...args) => {
        const startTime = performance.now();
        const result = await originalTypeset.apply(MathJax, args);
        const duration = performance.now() - startTime;
        
        this.recordMetric({
          type: 'math-render',
          value: duration,
          count: args[0]?.length || 1,
          timestamp: performance.now()
        });
        
        return result;
      };
    }
  }

  trackAdPerformance() {
    // Monitor ad loading times
    window.addEventListener('ad-loaded', (event) => {
      this.recordMetric({
        type: 'ad-load',
        value: event.detail.loadTime,
        adType: event.detail.type,
        size: event.detail.size,
        network: event.detail.network,
        timestamp: performance.now()
      });
    });
    
    // Monitor ad viewability
    window.addEventListener('ad-viewable', (event) => {
      this.recordMetric({
        type: 'ad-viewable',
        value: event.detail.viewableTime,
        adId: event.detail.id,
        timestamp: performance.now()
      });
    });
  }

  trackUserInteractions() {
    // Click tracking
    let lastClickTime = 0;
    document.addEventListener('click', (event) => {
      const now = performance.now();
      const timeSinceLastClick = now - lastClickTime;
      lastClickTime = now;
      
      if (timeSinceLastClick < 500) {
        // Potential rage click
        this.recordMetric({
          type: 'rage-click',
          value: timeSinceLastClick,
          target: event.target.tagName,
          timestamp: now
        });
      }
    });
    
    // Scroll performance
    let scrollTimer;
    let scrollStartTime;
    document.addEventListener('scroll', () => {
      if (!scrollStartTime) {
        scrollStartTime = performance.now();
      }
      
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const scrollDuration = performance.now() - scrollStartTime;
        this.recordMetric({
          type: 'scroll-session',
          value: scrollDuration,
          scrollDepth: this.getScrollDepth(),
          timestamp: performance.now()
        });
        scrollStartTime = null;
      }, 150);
    }, { passive: true });
  }

  // ============================================
  // ERROR TRACKING
  // ============================================

  setupErrorTracking() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordMetric({
        type: 'js-error',
        value: 1,
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: performance.now()
      });
    });
    
    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordMetric({
        type: 'promise-rejection',
        value: 1,
        reason: event.reason?.toString(),
        timestamp: performance.now()
      });
    });
    
    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.recordMetric({
          type: 'resource-error',
          value: 1,
          resource: event.target.src || event.target.href,
          resourceType: event.target.tagName,
          timestamp: performance.now()
        });
      }
    }, true);
  }

  // ============================================
  // RESOURCE TIMING
  // ============================================

  setupResourceTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Track slow resources
          if (entry.duration > 1000) {
            this.recordMetric({
              type: 'slow-resource',
              value: entry.duration,
              name: entry.name,
              resourceType: entry.initiatorType,
              transferSize: entry.transferSize,
              timestamp: performance.now()
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', observer);
    }
  }

  // ============================================
  // NETWORK MONITORING
  // ============================================

  setupNetworkMonitoring() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      // Initial network info
      this.recordMetric({
        type: 'network-info',
        value: connection.downlink || 0,
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
        saveData: connection.saveData,
        timestamp: performance.now()
      });
      
      // Monitor network changes
      connection.addEventListener('change', () => {
        this.recordMetric({
          type: 'network-change',
          value: connection.downlink || 0,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          timestamp: performance.now()
        });
      });
    }
  }

  // ============================================
  // RECORDING AND AGGREGATION
  // ============================================

  recordMetric(metric) {
    // Add metadata
    metric.page = window.location.pathname;
    metric.session = this.metrics.session;
    metric.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    metric.deviceType = this.getDeviceType();
    
    // Add to buffer
    this.metrics.buffer.push(metric);
    
    // Check buffer size
    if (this.metrics.buffer.length >= this.config.monitoring.bufferSize) {
      this.flushMetrics();
    }
    
    // Check for alerts
    this.checkAlerts(metric);
    
    // Update aggregated metrics
    this.updateAggregatedMetrics(metric);
  }

  updateAggregatedMetrics(metric) {
    const key = metric.type;
    if (!this.metrics.aggregated[key]) {
      this.metrics.aggregated[key] = {
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        values: []
      };
    }
    
    const agg = this.metrics.aggregated[key];
    agg.count++;
    agg.sum += metric.value;
    agg.min = Math.min(agg.min, metric.value);
    agg.max = Math.max(agg.max, metric.value);
    agg.values.push(metric.value);
    
    // Calculate percentiles
    if (agg.values.length >= 10) {
      agg.p50 = this.percentile(agg.values, 0.5);
      agg.p75 = this.percentile(agg.values, 0.75);
      agg.p90 = this.percentile(agg.values, 0.9);
      agg.p99 = this.percentile(agg.values, 0.99);
    }
  }

  // ============================================
  // ALERTING
  // ============================================

  checkAlerts(metric) {
    if (!this.config.alerts.enabled) return;
    
    const thresholds = this.config.alerts.thresholds[metric.type];
    if (!thresholds) return;
    
    const lastAlert = this.metrics.alerts.get(metric.type);
    const now = Date.now();
    
    // Check cooldown
    if (lastAlert && (now - lastAlert < this.config.alerts.cooldown)) {
      return;
    }
    
    let alertLevel = null;
    if (metric.value >= thresholds.critical) {
      alertLevel = 'critical';
    } else if (metric.value >= thresholds.warning) {
      alertLevel = 'warning';
    }
    
    if (alertLevel) {
      this.triggerAlert({
        type: metric.type,
        level: alertLevel,
        value: metric.value,
        threshold: thresholds[alertLevel],
        timestamp: now
      });
      
      this.metrics.alerts.set(metric.type, now);
    }
  }

  triggerAlert(alert) {
    // Console warning
    console.warn(`Performance Alert [${alert.level}]:`, alert);
    
    // Custom event
    window.dispatchEvent(new CustomEvent('performance-alert', {
      detail: alert
    }));
    
    // Send alert to backend
    this.sendAlert(alert);
  }

  // ============================================
  // REPORTING
  // ============================================

  setupReporting() {
    // Periodic reporting
    setInterval(() => {
      this.flushMetrics();
    }, this.config.monitoring.reportingInterval);
    
    // Report on page unload
    window.addEventListener('pagehide', () => {
      this.flushMetrics(true);
    });
    
    // Report on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushMetrics();
      }
    });
  }

  flushMetrics(immediate = false) {
    if (this.metrics.buffer.length === 0) return;
    
    const metrics = [...this.metrics.buffer];
    this.metrics.buffer = [];
    
    const payload = {
      metrics: metrics,
      aggregated: this.getAggregatedSummary(),
      session: this.metrics.session,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    if (immediate && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(payload)], { 
        type: 'application/json' 
      });
      navigator.sendBeacon(this.config.monitoring.endpoint, blob);
    } else {
      fetch(this.config.monitoring.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(error => {
        console.error('Failed to send metrics:', error);
        // Re-add metrics to buffer for retry
        this.metrics.buffer.unshift(...metrics);
      });
    }
    
    // Store locally
    this.storeMetricsLocally(payload);
  }

  sendAlert(alert) {
    fetch('/api/performance-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alert: alert,
        context: {
          page: window.location.pathname,
          session: this.metrics.session,
          aggregated: this.getAggregatedSummary()
        }
      })
    }).catch(error => {
      console.error('Failed to send alert:', error);
    });
  }

  // ============================================
  // STORAGE
  // ============================================

  storeMetricsLocally(payload) {
    try {
      const key = `${this.config.storage.prefix}${Date.now()}`;
      const data = JSON.stringify(payload);
      
      if (this.config.storage.type === 'localStorage') {
        localStorage.setItem(key, data);
        this.cleanupOldData();
      } else if (this.config.storage.type === 'sessionStorage') {
        sessionStorage.setItem(key, data);
      }
    } catch (e) {
      console.error('Failed to store metrics locally:', e);
    }
  }

  loadHistoricalData() {
    if (this.config.storage.type !== 'localStorage') return;
    
    const keys = Object.keys(localStorage).filter(k => 
      k.startsWith(this.config.storage.prefix)
    );
    
    const historical = [];
    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        historical.push(data);
      } catch (e) {
        // Invalid data, remove it
        localStorage.removeItem(key);
      }
    });
    
    // Process historical data
    this.processHistoricalData(historical);
  }

  processHistoricalData(historical) {
    // Calculate trends
    const trends = {};
    const metricTypes = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];
    
    metricTypes.forEach(type => {
      const values = [];
      historical.forEach(payload => {
        const metrics = payload.metrics.filter(m => m.type === type);
        metrics.forEach(m => values.push(m.value));
      });
      
      if (values.length > 0) {
        trends[type] = {
          average: this.average(values),
          median: this.percentile(values, 0.5),
          p75: this.percentile(values, 0.75),
          trend: this.calculateTrend(values)
        };
      }
    });
    
    this.metrics.trends = trends;
  }

  cleanupOldData() {
    const now = Date.now();
    const maxAge = this.config.storage.maxAge;
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.config.storage.prefix)) {
        const timestamp = parseInt(key.replace(this.config.storage.prefix, ''));
        if (now - timestamp > maxAge) {
          localStorage.removeItem(key);
        }
      }
    });
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  getScrollDepth() {
    const winHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercent = (scrollTop + winHeight) / docHeight;
    return Math.min(Math.round(scrollPercent * 100), 100);
  }

  percentile(values, p) {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  average(values) {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = this.average(firstHalf);
    const secondAvg = this.average(secondHalf);
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 10) return 'degrading';
    if (change < -10) return 'improving';
    return 'stable';
  }

  getAggregatedSummary() {
    const summary = {};
    
    Object.entries(this.metrics.aggregated).forEach(([key, data]) => {
      summary[key] = {
        count: data.count,
        average: data.sum / data.count,
        min: data.min,
        max: data.max,
        p50: data.p50 || null,
        p75: data.p75 || null,
        p90: data.p90 || null,
        p99: data.p99 || null
      };
    });
    
    return summary;
  }

  // ============================================
  // PUBLIC API
  // ============================================

  getMetrics() {
    return {
      current: this.metrics.buffer,
      aggregated: this.getAggregatedSummary(),
      trends: this.metrics.trends || {},
      session: this.metrics.session
    };
  }

  mark(name) {
    performance.mark(name);
    this.recordMetric({
      type: 'custom-mark',
      value: performance.now(),
      name: name,
      timestamp: performance.now()
    });
  }

  measure(name, startMark, endMark) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      
      this.recordMetric({
        type: 'custom-measure',
        value: measure.duration,
        name: name,
        startTime: measure.startTime,
        timestamp: performance.now()
      });
      
      return measure.duration;
    } catch (e) {
      console.error('Failed to measure:', e);
      return null;
    }
  }

  destroy() {
    // Clean up observers
    this.observers.forEach((observer, key) => {
      observer.disconnect();
    });
    this.observers.clear();
    
    // Flush remaining metrics
    this.flushMetrics(true);
  }
}

// Initialize tracker
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.performanceTracker = new PerformanceTracker();
  });
} else {
  window.performanceTracker = new PerformanceTracker();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceTracker;
}