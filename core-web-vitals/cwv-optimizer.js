// Core Web Vitals Optimizer for Math Platforms
// Optimized for 2024-2025 requirements with INP focus

class CoreWebVitalsOptimizer {
  constructor() {
    this.config = {
      // Performance thresholds (Google's requirements)
      thresholds: {
        LCP: { good: 2500, needsImprovement: 4000 }, // milliseconds
        INP: { good: 200, needsImprovement: 500 },   // milliseconds
        CLS: { good: 0.1, needsImprovement: 0.25 },  // score
        FCP: { good: 1800, needsImprovement: 3000 }, // milliseconds
        TTFB: { good: 800, needsImprovement: 1800 }  // milliseconds
      },
      
      // Math-specific configurations
      math: {
        renderingStrategy: 'progressive', // 'progressive', 'lazy', 'eager'
        cacheEnabled: true,
        serverSideRendering: true,
        preloadFormulas: true,
        maxConcurrentRenders: 3
      },
      
      // Resource limits
      resources: {
        maxResourcesPerPage: 50, // Mobile optimization
        criticalCSSInlineLimit: 14000, // bytes
        maxJSBundleSize: 200000, // bytes
        imageOptimization: true
      },
      
      // Monitoring
      monitoring: {
        enabled: true,
        sampleRate: 1.0, // 100% sampling
        reportingEndpoint: '/api/cwv-metrics',
        realUserMonitoring: true
      }
    };
    
    this.metrics = {
      LCP: [],
      INP: [],
      CLS: [],
      FCP: [],
      TTFB: []
    };
    
    this.init();
  }

  init() {
    this.setupPerformanceObservers();
    this.optimizeMathRendering();
    this.implementResourceHints();
    this.setupINPOptimization();
    this.configureLazyLoading();
    this.injectCriticalCSS();
    this.setupMetricsReporting();
  }

  // ============================================
  // PERFORMANCE OBSERVERS
  // ============================================

  setupPerformanceObservers() {
    // LCP Observer
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.error('LCP Observer error:', e);
      }

      // INP Observer (new in 2024)
      try {
        const inpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'event' || entry.entryType === 'first-input') {
              const duration = entry.duration;
              this.recordMetric('INP', duration);
              
              // Warn if INP exceeds threshold
              if (duration > this.config.thresholds.INP.good) {
                console.warn(`High INP detected: ${duration}ms for ${entry.name}`);
                this.optimizeInteraction(entry);
              }
            }
          }
        });
        inpObserver.observe({ 
          entryTypes: ['event', 'first-input'],
          buffered: true,
          durationThreshold: 40 // React to interactions > 40ms
        });
      } catch (e) {
        console.error('INP Observer error:', e);
      }

      // CLS Observer
      let clsValue = 0;
      let clsEntries = [];
      
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        }
        this.recordMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // FCP Observer
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('FCP', entry.startTime);
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    }

    // Navigation Timing for TTFB
    if (window.performance && window.performance.timing) {
      const navigationTiming = window.performance.timing;
      const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
      this.recordMetric('TTFB', ttfb);
    }
  }

  // ============================================
  // INP OPTIMIZATION (NEW FOR 2024)
  // ============================================

  setupINPOptimization() {
    // Debounce high-frequency events
    this.debounceHighFrequencyEvents();
    
    // Implement interaction scheduling
    this.setupInteractionScheduler();
    
    // Optimize event listeners
    this.optimizeEventListeners();
    
    // Setup yield patterns for long tasks
    this.implementYieldPatterns();
  }

  debounceHighFrequencyEvents() {
    const events = ['scroll', 'resize', 'mousemove', 'touchmove'];
    
    events.forEach(eventType => {
      let scheduled = false;
      const originalHandler = window[`on${eventType}`];
      
      window.addEventListener(eventType, (e) => {
        if (!scheduled) {
          scheduled = true;
          requestAnimationFrame(() => {
            if (originalHandler) originalHandler(e);
            scheduled = false;
          });
        }
      }, { passive: true });
    });
  }

  setupInteractionScheduler() {
    // Priority queue for interactions
    this.interactionQueue = {
      high: [],    // User interactions < 50ms
      medium: [],  // UI updates < 100ms
      low: []      // Background tasks < 200ms
    };
    
    // Process queue with requestIdleCallback
    const processQueue = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback((deadline) => {
          while (deadline.timeRemaining() > 0) {
            const task = this.getNextTask();
            if (task) {
              const startTime = performance.now();
              task.callback();
              const duration = performance.now() - startTime;
              
              // Monitor task duration
              if (duration > 50) {
                console.warn(`Long task detected: ${task.name} took ${duration}ms`);
              }
            } else {
              break;
            }
          }
          
          // Schedule next batch
          if (this.hasPendingTasks()) {
            processQueue();
          }
        }, { timeout: 1000 });
      }
    };
    
    // Start processing
    processQueue();
  }

  optimizeEventListeners() {
    // Convert to passive listeners where possible
    const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel'];
    
    passiveEvents.forEach(eventType => {
      document.addEventListener(eventType, () => {}, { passive: true });
    });
    
    // Delegate events to reduce listener count
    document.body.addEventListener('click', (e) => {
      const target = e.target;
      
      // Handle math expression clicks
      if (target.closest('.math-expression')) {
        this.scheduleInteraction('high', () => {
          this.handleMathClick(target);
        });
      }
      
      // Handle button clicks
      if (target.closest('button, .btn')) {
        this.scheduleInteraction('high', () => {
          this.handleButtonClick(target);
        });
      }
    }, { passive: false });
  }

  implementYieldPatterns() {
    // Yield pattern for long-running tasks
    window.yieldToMain = () => {
      return new Promise(resolve => {
        setTimeout(resolve, 0);
      });
    };
    
    // Chunked processing for math rendering
    window.processInChunks = async function*(items, chunkSize = 5) {
      for (let i = 0; i < items.length; i += chunkSize) {
        yield items.slice(i, i + chunkSize);
        await window.yieldToMain();
      }
    };
  }

  scheduleInteraction(priority, callback, name = 'Anonymous') {
    const task = {
      callback,
      name,
      timestamp: performance.now()
    };
    
    this.interactionQueue[priority].push(task);
    
    // Process immediately for high priority
    if (priority === 'high') {
      requestAnimationFrame(() => {
        const task = this.interactionQueue.high.shift();
        if (task) task.callback();
      });
    }
  }

  // ============================================
  // MATH RENDERING OPTIMIZATION
  // ============================================

  optimizeMathRendering() {
    if (!window.MathJax) return;
    
    // Configure MathJax 3.0 for optimal performance
    window.MathJax = {
      ...window.MathJax,
      startup: {
        ...window.MathJax.startup,
        document: document,
        typeset: false, // Manual control
        ready: () => {
          MathJax.startup.defaultReady();
          this.setupProgressiveMathRendering();
        }
      },
      options: {
        ...window.MathJax.options,
        enableMenu: false, // Reduce INP
        enableEnrichment: false, // Faster rendering
        renderActions: {
          findScript: [10, (doc) => {
            // Prioritize visible math
            const scripts = this.prioritizeMathScripts(doc);
            return scripts;
          }, '']
        }
      },
      svg: {
        fontCache: 'global', // Better caching
        internalSpeechTitles: false // Reduce payload
      },
      chtml: {
        minScale: 0.5,
        mtextInheritFont: true,
        merrorInheritFont: true,
        scale: 1
      }
    };
  }

  setupProgressiveMathRendering() {
    const mathElements = document.querySelectorAll('.math-expression, [data-math]');
    const visibleMath = [];
    const hiddenMath = [];
    
    // Categorize by visibility
    mathElements.forEach(element => {
      if (this.isElementVisible(element)) {
        visibleMath.push(element);
      } else {
        hiddenMath.push(element);
      }
    });
    
    // Render visible math first
    this.renderMathBatch(visibleMath, 'immediate');
    
    // Lazy render hidden math
    if (hiddenMath.length > 0) {
      this.setupLazyMathRendering(hiddenMath);
    }
  }

  async renderMathBatch(elements, priority = 'normal') {
    const chunkSize = priority === 'immediate' ? 5 : 3;
    
    for await (const chunk of window.processInChunks(elements, chunkSize)) {
      await new Promise(resolve => {
        MathJax.typesetPromise(chunk).then(() => {
          resolve();
        }).catch(error => {
          console.error('Math rendering error:', error);
          resolve();
        });
      });
    }
  }

  setupLazyMathRendering(elements) {
    if ('IntersectionObserver' in window) {
      const mathObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            
            // Schedule rendering with lower priority
            this.scheduleInteraction('medium', () => {
              MathJax.typesetPromise([element]).then(() => {
                mathObserver.unobserve(element);
              });
            }, 'Math Rendering');
          }
        });
      }, {
        rootMargin: '50px' // Start rendering 50px before visible
      });
      
      elements.forEach(element => mathObserver.observe(element));
    }
  }

  // ============================================
  // RESOURCE OPTIMIZATION
  // ============================================

  implementResourceHints() {
    const head = document.head;
    
    // Preconnect to critical origins
    const preconnects = [
      'https://cdn.jsdelivr.net', // MathJax CDN
      'https://fonts.googleapis.com',
      'https://www.googletagmanager.com'
    ];
    
    preconnects.forEach(origin => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      head.appendChild(link);
    });
    
    // DNS prefetch for additional resources
    const dnsPrefetches = [
      'https://www.google-analytics.com',
      'https://pagead2.googlesyndication.com'
    ];
    
    dnsPrefetches.forEach(origin => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = origin;
      head.appendChild(link);
    });
    
    // Preload critical resources
    this.preloadCriticalResources();
  }

  preloadCriticalResources() {
    // Preload MathJax core
    const mathJaxPreload = document.createElement('link');
    mathJaxPreload.rel = 'preload';
    mathJaxPreload.as = 'script';
    mathJaxPreload.href = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    mathJaxPreload.crossOrigin = 'anonymous';
    document.head.appendChild(mathJaxPreload);
    
    // Preload critical fonts
    const fontPreload = document.createElement('link');
    fontPreload.rel = 'preload';
    fontPreload.as = 'font';
    fontPreload.type = 'font/woff2';
    fontPreload.href = '/fonts/math-font.woff2';
    fontPreload.crossOrigin = 'anonymous';
    document.head.appendChild(fontPreload);
    
    // Preload above-the-fold images
    this.preloadVisibleImages();
  }

  preloadVisibleImages() {
    const images = document.querySelectorAll('img[src]');
    const visibleImages = Array.from(images).filter(img => {
      const rect = img.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    
    visibleImages.forEach(img => {
      if (!img.loading || img.loading !== 'lazy') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        
        if (img.srcset) {
          link.imageSrcset = img.srcset;
          link.imageSizes = img.sizes;
        }
        
        document.head.appendChild(link);
      }
    });
  }

  // ============================================
  // LAZY LOADING
  // ============================================

  configureLazyLoading() {
    // Native lazy loading for images
    document.querySelectorAll('img').forEach(img => {
      if (!this.isElementVisible(img) && !img.loading) {
        img.loading = 'lazy';
        
        // Add dimensions to prevent CLS
        if (!img.width && img.naturalWidth) {
          img.width = img.naturalWidth;
        }
        if (!img.height && img.naturalHeight) {
          img.height = img.naturalHeight;
        }
      }
    });
    
    // Lazy load iframes
    document.querySelectorAll('iframe').forEach(iframe => {
      if (!this.isElementVisible(iframe)) {
        iframe.loading = 'lazy';
      }
    });
    
    // Setup intersection observer for complex elements
    this.setupComplexLazyLoading();
  }

  setupComplexLazyLoading() {
    const lazyElements = document.querySelectorAll('[data-lazy]');
    
    if ('IntersectionObserver' in window && lazyElements.length > 0) {
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const lazyType = element.dataset.lazy;
            
            switch (lazyType) {
              case 'widget':
                this.loadWidget(element);
                break;
              case 'video':
                this.loadVideo(element);
                break;
              case 'diagram':
                this.loadDiagram(element);
                break;
            }
            
            lazyObserver.unobserve(element);
          }
        });
      }, {
        rootMargin: '100px'
      });
      
      lazyElements.forEach(element => lazyObserver.observe(element));
    }
  }

  // ============================================
  // CRITICAL CSS
  // ============================================

  injectCriticalCSS() {
    // Critical CSS for above-the-fold content
    const criticalCSS = `
      /* Reset and base styles */
      *,*::before,*::after{box-sizing:border-box}
      body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.5}
      
      /* Layout critical styles */
      .container{max-width:1200px;margin:0 auto;padding:0 1rem}
      .header{position:sticky;top:0;background:#fff;z-index:1000;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
      
      /* Typography critical */
      h1,h2,h3{margin-top:0;line-height:1.2}
      h1{font-size:2.5rem}
      h2{font-size:2rem}
      h3{font-size:1.5rem}
      p{margin-top:0}
      
      /* Math expression placeholders */
      .math-expression{display:inline-block;min-height:1.5em;min-width:3em;background:#f0f0f0;border-radius:4px}
      .math-expression.loaded{background:transparent}
      
      /* Button critical */
      .btn{display:inline-block;padding:0.5rem 1rem;border:none;border-radius:4px;cursor:pointer;text-decoration:none;transition:background-color 0.2s}
      .btn-primary{background:#3498db;color:#fff}
      .btn-primary:hover{background:#2980b9}
      
      /* Loading states */
      .skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:skeleton 1.5s infinite}
      @keyframes skeleton{0%{background-position:200% 0}100%{background-position:-200% 0}}
      
      /* Responsive critical */
      @media(max-width:768px){
        h1{font-size:2rem}
        h2{font-size:1.5rem}
        h3{font-size:1.25rem}
        .container{padding:0 0.5rem}
      }
    `;
    
    // Check if critical CSS is already inlined
    if (!document.getElementById('critical-css')) {
      const style = document.createElement('style');
      style.id = 'critical-css';
      style.textContent = criticalCSS;
      document.head.insertBefore(style, document.head.firstChild);
    }
    
    // Load non-critical CSS asynchronously
    this.loadNonCriticalCSS();
  }

  loadNonCriticalCSS() {
    const nonCriticalStyles = [
      '/ad-optimization-styles.css',
      '/design-tokens/tokens.css',
      '/accessibility/math-a11y.css'
    ];
    
    nonCriticalStyles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = function() {
        this.onload = null;
        this.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });
  }

  // ============================================
  // METRICS AND REPORTING
  // ============================================

  recordMetric(metric, value) {
    // Store metric
    this.metrics[metric].push({
      value: value,
      timestamp: performance.now(),
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
    
    // Check against thresholds
    const threshold = this.config.thresholds[metric];
    if (threshold) {
      const status = value <= threshold.good ? 'good' :
                    value <= threshold.needsImprovement ? 'needs-improvement' : 'poor';
      
      // Log warnings for poor metrics
      if (status === 'poor') {
        console.warn(`Poor ${metric}: ${value}${metric === 'CLS' ? '' : 'ms'}`);
      }
      
      // Update metric status
      this.updateMetricStatus(metric, status, value);
    }
    
    // Report to analytics
    if (this.config.monitoring.enabled) {
      this.reportMetric(metric, value);
    }
  }

  updateMetricStatus(metric, status, value) {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('cwv-metric', {
      detail: {
        metric: metric,
        status: status,
        value: value,
        threshold: this.config.thresholds[metric]
      }
    }));
    
    // Update UI indicators if present
    const indicator = document.querySelector(`[data-cwv-metric="${metric}"]`);
    if (indicator) {
      indicator.className = `cwv-indicator cwv-${status}`;
      indicator.textContent = `${metric}: ${value}${metric === 'CLS' ? '' : 'ms'}`;
    }
  }

  reportMetric(metric, value) {
    // Batch metrics for efficient reporting
    if (!this.metricsBatch) {
      this.metricsBatch = [];
    }
    
    this.metricsBatch.push({
      metric: metric,
      value: value,
      timestamp: Date.now(),
      page: window.location.pathname,
      deviceType: this.getDeviceType(),
      connectionType: this.getConnectionType()
    });
    
    // Send batch when ready
    if (this.metricsBatch.length >= 10) {
      this.sendMetricsBatch();
    }
  }

  sendMetricsBatch() {
    if (!this.metricsBatch || this.metricsBatch.length === 0) return;
    
    const batch = [...this.metricsBatch];
    this.metricsBatch = [];
    
    // Use sendBeacon for reliability
    if ('sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify({
        metrics: batch,
        session: this.getSessionId(),
        userAgent: navigator.userAgent
      })], { type: 'application/json' });
      
      navigator.sendBeacon(this.config.monitoring.reportingEndpoint, blob);
    } else {
      // Fallback to fetch
      fetch(this.config.monitoring.reportingEndpoint, {
        method: 'POST',
        body: JSON.stringify({ metrics: batch }),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      }).catch(error => {
        console.error('Failed to report metrics:', error);
      });
    }
  }

  setupMetricsReporting() {
    // Report metrics on page unload
    window.addEventListener('pagehide', () => {
      this.sendMetricsBatch();
    });
    
    // Periodic reporting
    setInterval(() => {
      this.sendMetricsBatch();
    }, 30000); // Every 30 seconds
    
    // Report on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.sendMetricsBatch();
      }
    });
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    );
  }

  getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  getConnectionType() {
    if ('connection' in navigator) {
      return navigator.connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  getNextTask() {
    if (this.interactionQueue.high.length > 0) {
      return this.interactionQueue.high.shift();
    }
    if (this.interactionQueue.medium.length > 0) {
      return this.interactionQueue.medium.shift();
    }
    if (this.interactionQueue.low.length > 0) {
      return this.interactionQueue.low.shift();
    }
    return null;
  }

  hasPendingTasks() {
    return (
      this.interactionQueue.high.length > 0 ||
      this.interactionQueue.medium.length > 0 ||
      this.interactionQueue.low.length > 0
    );
  }

  optimizeInteraction(entry) {
    // Log slow interactions for debugging
    console.log('Slow interaction detected:', {
      type: entry.name,
      duration: entry.duration,
      target: entry.target,
      processingStart: entry.processingStart,
      processingEnd: entry.processingEnd
    });
    
    // Specific optimizations based on interaction type
    if (entry.name === 'click') {
      this.optimizeClickHandlers();
    } else if (entry.name === 'keydown') {
      this.optimizeKeyboardHandlers();
    }
  }

  optimizeClickHandlers() {
    // Implement click handler optimizations
    console.log('Optimizing click handlers...');
  }

  optimizeKeyboardHandlers() {
    // Implement keyboard handler optimizations
    console.log('Optimizing keyboard handlers...');
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cwvOptimizer = new CoreWebVitalsOptimizer();
  });
} else {
  window.cwvOptimizer = new CoreWebVitalsOptimizer();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CoreWebVitalsOptimizer;
}