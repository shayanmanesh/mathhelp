// Platform Integration Manager
// Coordinates all optimization systems for Math Help

class PlatformIntegration {
  constructor() {
    this.config = {
      systems: {
        schemaMarkup: true,
        adOptimization: true,
        headerBidding: true,
        componentSystem: true,
        designTokens: true,
        accessibility: true,
        coreWebVitals: true,
        mathJaxOptimization: true,
        technicalSEO: true,
        mobileOptimization: true,
        performanceTracking: true
      },
      
      initialization: {
        async: true,
        priority: [
          'designTokens',
          'coreWebVitals',
          'mathJaxOptimization',
          'performanceTracking',
          'accessibility',
          'technicalSEO',
          'componentSystem',
          'adOptimization',
          'headerBidding',
          'schemaMarkup',
          'mobileOptimization'
        ],
        timeout: 10000 // 10 seconds max init time
      },
      
      monitoring: {
        healthCheck: true,
        interval: 60000, // 1 minute
        alertThreshold: 3, // failures before alert
        autoRecover: true
      }
    };
    
    this.systems = new Map();
    this.status = 'initializing';
    this.errors = [];
    this.metrics = {
      loadTime: {},
      failures: {},
      recoveries: {}
    };
    
    this.init();
  }

  async init() {
    console.log('Math Help Platform Integration starting...');
    const startTime = performance.now();
    
    try {
      // Load critical systems first
      await this.loadCriticalSystems();
      
      // Load remaining systems
      await this.loadSecondarySystems();
      
      // Setup inter-system communication
      this.setupSystemCommunication();
      
      // Start monitoring
      this.startHealthMonitoring();
      
      // Platform ready
      this.status = 'ready';
      const loadTime = performance.now() - startTime;
      console.log(`Platform ready in ${loadTime.toFixed(2)}ms`);
      
      // Dispatch ready event
      window.dispatchEvent(new CustomEvent('platform-ready', {
        detail: {
          loadTime,
          systems: Array.from(this.systems.keys())
        }
      }));
      
    } catch (error) {
      console.error('Platform initialization failed:', error);
      this.status = 'error';
      this.handleInitError(error);
    }
  }

  // ============================================
  // SYSTEM LOADING
  // ============================================

  async loadCriticalSystems() {
    const critical = [
      'designTokens',
      'coreWebVitals',
      'mathJaxOptimization',
      'performanceTracking'
    ];
    
    for (const systemName of critical) {
      if (this.config.systems[systemName]) {
        await this.loadSystem(systemName, true);
      }
    }
  }

  async loadSecondarySystems() {
    const secondary = this.config.initialization.priority.filter(name => 
      !['designTokens', 'coreWebVitals', 'mathJaxOptimization', 'performanceTracking'].includes(name)
    );
    
    // Load in parallel with timeout
    const promises = secondary.map(systemName => {
      if (this.config.systems[systemName]) {
        return this.loadSystem(systemName, false);
      }
      return Promise.resolve();
    });
    
    await Promise.race([
      Promise.all(promises),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Secondary systems timeout')), 5000)
      )
    ]).catch(error => {
      console.warn('Some secondary systems failed to load:', error);
    });
  }

  async loadSystem(name, critical = false) {
    const startTime = performance.now();
    
    try {
      let system;
      
      switch (name) {
        case 'designTokens':
          // Design tokens are already loaded via CSS
          system = { name, status: 'loaded', type: 'css' };
          break;
          
        case 'coreWebVitals':
          if (window.cwvOptimizer) {
            system = window.cwvOptimizer;
          } else {
            throw new Error('Core Web Vitals optimizer not found');
          }
          break;
          
        case 'mathJaxOptimization':
          if (window.mathJaxOptimizer) {
            system = window.mathJaxOptimizer;
          } else {
            throw new Error('MathJax optimizer not found');
          }
          break;
          
        case 'performanceTracking':
          if (window.performanceTracker) {
            system = window.performanceTracker;
          } else {
            throw new Error('Performance tracker not found');
          }
          break;
          
        case 'accessibility':
          if (window.mathAccessibility) {
            system = window.mathAccessibility;
          } else {
            await this.loadScript('/accessibility/math-a11y.js');
            system = window.mathAccessibility;
          }
          break;
          
        case 'technicalSEO':
          if (window.mathSEO) {
            system = window.mathSEO;
          } else {
            await this.loadScript('/technical-seo/math-seo.js');
            system = window.mathSEO;
          }
          break;
          
        case 'componentSystem':
          if (window.MathHelpAtoms) {
            system = {
              atoms: window.MathHelpAtoms,
              molecules: window.MathHelpMolecules,
              organisms: window.MathHelpOrganisms,
              templates: window.MathHelpTemplates,
              pages: window.MathHelpPages
            };
          } else {
            await this.loadComponentSystem();
            system = {
              atoms: window.MathHelpAtoms,
              molecules: window.MathHelpMolecules,
              organisms: window.MathHelpOrganisms,
              templates: window.MathHelpTemplates,
              pages: window.MathHelpPages
            };
          }
          break;
          
        case 'adOptimization':
          if (window.adOptimizer) {
            system = window.adOptimizer;
          } else {
            await this.loadScript('/ad-optimization-system.js');
            system = window.adOptimizer;
          }
          break;
          
        case 'headerBidding':
          if (window.headerBidding) {
            system = window.headerBidding;
          } else {
            await this.loadScript('/header-bidding-enhanced.js');
            system = window.headerBidding;
          }
          break;
          
        case 'schemaMarkup':
          if (window.schemaMarkup) {
            system = window.schemaMarkup;
          } else {
            await this.loadScript('/schema-markup-enhanced.js');
            system = window.schemaMarkup;
          }
          break;
          
        case 'mobileOptimization':
          if (window.mobileOptimizer) {
            system = window.mobileOptimizer;
          } else {
            await this.loadScript('/mobile/mobile-optimizer.js');
            system = window.mobileOptimizer;
          }
          break;
      }
      
      if (system) {
        this.systems.set(name, system);
        const loadTime = performance.now() - startTime;
        this.metrics.loadTime[name] = loadTime;
        console.log(`Loaded ${name} in ${loadTime.toFixed(2)}ms`);
      }
      
    } catch (error) {
      console.error(`Failed to load ${name}:`, error);
      this.errors.push({ system: name, error, timestamp: Date.now() });
      
      if (critical) {
        throw error;
      }
    }
  }

  async loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(script);
    });
  }

  async loadComponentSystem() {
    const components = [
      '/components/atoms.js',
      '/components/molecules.js',
      '/components/organisms.js',
      '/components/templates.js',
      '/components/pages.js'
    ];
    
    for (const src of components) {
      await this.loadScript(src);
    }
  }

  // ============================================
  // SYSTEM COMMUNICATION
  // ============================================

  setupSystemCommunication() {
    // Setup event-based communication between systems
    this.setupPerformanceIntegration();
    this.setupAdIntegration();
    this.setupAccessibilityIntegration();
    this.setupMathIntegration();
  }

  setupPerformanceIntegration() {
    // Connect CWV optimizer with performance tracker
    if (this.systems.has('coreWebVitals') && this.systems.has('performanceTracking')) {
      window.addEventListener('cwv-metric', (event) => {
        const tracker = this.systems.get('performanceTracking');
        tracker.recordMetric({
          type: `cwv-${event.detail.metric}`,
          value: event.detail.value,
          status: event.detail.status,
          timestamp: performance.now()
        });
      });
    }
  }

  setupAdIntegration() {
    // Connect ad systems
    if (this.systems.has('adOptimization') && this.systems.has('headerBidding')) {
      const adOptimizer = this.systems.get('adOptimization');
      const headerBidding = this.systems.get('headerBidding');
      
      // Share bid data
      window.addEventListener('bid-complete', (event) => {
        adOptimizer.updateBidData(event.detail);
      });
      
      // Coordinate refresh
      window.addEventListener('ad-refresh-needed', (event) => {
        headerBidding.refreshSlot(event.detail.slotId);
      });
    }
  }

  setupAccessibilityIntegration() {
    // Connect accessibility with math rendering
    if (this.systems.has('accessibility') && this.systems.has('mathJaxOptimization')) {
      window.addEventListener('math-rendered', (event) => {
        const accessibility = this.systems.get('accessibility');
        accessibility.enhanceMathElement(event.detail.element);
      });
    }
  }

  setupMathIntegration() {
    // Coordinate math rendering across systems
    if (this.systems.has('mathJaxOptimization')) {
      const mathOptimizer = this.systems.get('mathJaxOptimization');
      
      // Notify other systems when math is ready
      window.addEventListener('mathjax-ready', () => {
        // Update SEO
        if (this.systems.has('technicalSEO')) {
          const seo = this.systems.get('technicalSEO');
          seo.updateMathContent();
        }
        
        // Update accessibility
        if (this.systems.has('accessibility')) {
          const a11y = this.systems.get('accessibility');
          a11y.scanForMathContent();
        }
      });
    }
  }

  // ============================================
  // HEALTH MONITORING
  // ============================================

  startHealthMonitoring() {
    if (!this.config.monitoring.healthCheck) return;
    
    setInterval(() => {
      this.checkSystemHealth();
    }, this.config.monitoring.interval);
    
    // Initial check
    this.checkSystemHealth();
  }

  checkSystemHealth() {
    const health = {
      timestamp: Date.now(),
      systems: {},
      overall: 'healthy'
    };
    
    this.systems.forEach((system, name) => {
      const status = this.checkSystemStatus(system, name);
      health.systems[name] = status;
      
      if (status.status === 'error') {
        health.overall = 'degraded';
        this.handleSystemError(name, status);
      }
    });
    
    // Check memory usage
    if (performance.memory) {
      health.memory = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      };
      
      if (health.memory.percentage > 90) {
        health.overall = 'critical';
        this.handleMemoryPressure();
      }
    }
    
    // Dispatch health status
    window.dispatchEvent(new CustomEvent('platform-health', {
      detail: health
    }));
    
    return health;
  }

  checkSystemStatus(system, name) {
    const status = {
      name,
      status: 'healthy',
      metrics: {}
    };
    
    try {
      // System-specific health checks
      switch (name) {
        case 'performanceTracking':
          const metrics = system.getMetrics();
          status.metrics = {
            bufferSize: metrics.current.length,
            sessionsTracked: Object.keys(metrics.aggregated).length
          };
          break;
          
        case 'coreWebVitals':
          // Check if observers are active
          if (system.observers && system.observers.size > 0) {
            status.metrics.activeObservers = system.observers.size;
          } else {
            status.status = 'degraded';
          }
          break;
          
        case 'mathJaxOptimization':
          status.metrics = {
            cacheSize: system.cache ? system.cache.size : 0,
            activeRenders: system.activeRenders || 0
          };
          break;
          
        case 'adOptimization':
          if (system.getMetrics) {
            const adMetrics = system.getMetrics();
            status.metrics = {
              adsLoaded: adMetrics.adsLoaded || 0,
              viewability: adMetrics.viewability || 0
            };
          }
          break;
      }
      
    } catch (error) {
      status.status = 'error';
      status.error = error.message;
    }
    
    return status;
  }

  handleSystemError(name, status) {
    // Track failures
    if (!this.metrics.failures[name]) {
      this.metrics.failures[name] = 0;
    }
    this.metrics.failures[name]++;
    
    // Check if we should attempt recovery
    if (this.config.monitoring.autoRecover && 
        this.metrics.failures[name] >= this.config.monitoring.alertThreshold) {
      this.attemptSystemRecovery(name);
    }
  }

  async attemptSystemRecovery(name) {
    console.log(`Attempting to recover ${name}...`);
    
    try {
      // Remove failed system
      this.systems.delete(name);
      
      // Reload system
      await this.loadSystem(name, false);
      
      // Track recovery
      if (!this.metrics.recoveries[name]) {
        this.metrics.recoveries[name] = 0;
      }
      this.metrics.recoveries[name]++;
      
      // Reset failure count
      this.metrics.failures[name] = 0;
      
      console.log(`Successfully recovered ${name}`);
      
    } catch (error) {
      console.error(`Failed to recover ${name}:`, error);
      
      // Dispatch critical error
      window.dispatchEvent(new CustomEvent('platform-critical-error', {
        detail: {
          system: name,
          error: error.message,
          failures: this.metrics.failures[name]
        }
      }));
    }
  }

  handleMemoryPressure() {
    console.warn('High memory usage detected, initiating cleanup...');
    
    // Clear caches
    if (this.systems.has('mathJaxOptimization')) {
      const mathOptimizer = this.systems.get('mathJaxOptimization');
      if (mathOptimizer.clearCache) {
        mathOptimizer.clearCache();
      }
    }
    
    // Reduce ad density temporarily
    if (this.systems.has('adOptimization')) {
      const adOptimizer = this.systems.get('adOptimization');
      if (adOptimizer.reduceAdDensity) {
        adOptimizer.reduceAdDensity();
      }
    }
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  handleInitError(error) {
    // Log to console
    console.error('Platform initialization error:', error);
    
    // Track error
    this.errors.push({
      type: 'init-error',
      error: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
    
    // Attempt fallback initialization
    this.initializeFallbackMode();
  }

  initializeFallbackMode() {
    console.log('Initializing platform in fallback mode...');
    
    // Load only critical systems synchronously
    try {
      // Basic math rendering
      if (window.MathJax) {
        MathJax.startup.defaultReady();
      }
      
      // Basic performance monitoring
      this.setupBasicMonitoring();
      
      // Dispatch fallback ready
      window.dispatchEvent(new CustomEvent('platform-fallback-ready', {
        detail: {
          mode: 'fallback',
          errors: this.errors
        }
      }));
      
    } catch (error) {
      console.error('Fallback initialization failed:', error);
    }
  }

  setupBasicMonitoring() {
    // Minimal performance monitoring
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log(`Performance: ${entry.name} - ${entry.duration}ms`);
          }
        });
        observer.observe({ entryTypes: ['navigation', 'paint'] });
      } catch (e) {
        console.error('Basic monitoring setup failed:', e);
      }
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================

  getSystem(name) {
    return this.systems.get(name);
  }

  getStatus() {
    return {
      status: this.status,
      systems: Array.from(this.systems.keys()),
      errors: this.errors,
      metrics: this.metrics
    };
  }

  async reloadSystem(name) {
    if (this.systems.has(name)) {
      this.systems.delete(name);
    }
    return await this.loadSystem(name, false);
  }

  shutdown() {
    console.log('Shutting down platform integration...');
    
    // Disconnect all observers
    this.systems.forEach((system, name) => {
      if (system.destroy) {
        system.destroy();
      }
    });
    
    // Clear systems
    this.systems.clear();
    
    // Update status
    this.status = 'shutdown';
  }
}

// Initialize platform integration
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mathHelpPlatform = new PlatformIntegration();
  });
} else {
  window.mathHelpPlatform = new PlatformIntegration();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlatformIntegration;
}