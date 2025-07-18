// MathJax Performance Optimizer
// Server-side rendering support and caching for optimal Core Web Vitals

class MathJaxPerformanceOptimizer {
  constructor() {
    this.config = {
      rendering: {
        mode: 'hybrid', // 'client', 'server', 'hybrid'
        maxConcurrent: 3,
        chunkSize: 5,
        priorityQueue: true,
        enableCache: true
      },
      
      cache: {
        enabled: true,
        maxSize: 1000, // Maximum cached expressions
        ttl: 86400000, // 24 hours in milliseconds
        storage: 'localStorage', // 'localStorage', 'sessionStorage', 'indexedDB'
        compression: true
      },
      
      optimization: {
        lazyRender: true,
        precompile: true,
        inlineSVG: true,
        fontPreload: true,
        minifyOutput: true
      },
      
      performance: {
        targetRenderTime: 50, // ms per expression
        maxBlockingTime: 100, // ms
        yieldInterval: 16 // ms (one frame)
      }
    };
    
    this.cache = new Map();
    this.renderQueue = [];
    this.activeRenders = 0;
    this.statistics = {
      totalRenders: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageRenderTime: 0
    };
    
    this.init();
  }

  init() {
    this.setupMathJaxConfiguration();
    this.initializeCache();
    this.setupServerSideRendering();
    this.implementRenderingOptimizations();
    this.preloadMathFonts();
    this.setupPerformanceMonitoring();
  }

  // ============================================
  // MATHJAX CONFIGURATION
  // ============================================

  setupMathJaxConfiguration() {
    // MathJax 3.0 optimized configuration
    window.MathJax = {
      // Startup configuration
      startup: {
        ready: () => {
          MathJax.startup.defaultReady();
          MathJax.startup.promise.then(() => {
            this.onMathJaxReady();
          });
        },
        pageReady: () => {
          // Override default page ready to control rendering
          return this.controlledPageReady();
        }
      },
      
      // Core options
      options: {
        enableMenu: false, // Disable right-click menu for better INP
        enableEnrichment: false, // Disable accessibility enrichment for speed
        renderActions: {
          // Custom render actions for optimization
          addCaching: [1, '', this.addCachingAction.bind(this)],
          optimizeSVG: [170, '', this.optimizeSVGAction.bind(this)],
          measurePerformance: [190, '', this.measurePerformanceAction.bind(this)]
        }
      },
      
      // TeX input configuration
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
        // Packages optimized for performance
        packages: {'[+]': ['noerrors', 'noundefined']},
        // Error handling
        noerrors: {
          disabled: false,
          multiLine: true
        }
      },
      
      // SVG output configuration (fastest renderer)
      svg: {
        fontCache: 'global', // Share font cache globally
        internalSpeechTitles: false, // Disable for smaller output
        minScale: 0.5,
        scale: 1,
        mtextInheritFont: true, // Inherit page fonts
        merrorInheritFont: true,
        unknownFamily: 'serif',
        // Output optimization
        addMMLclasses: false, // Smaller output
        useFontCache: true
      },
      
      // CommonHTML output (fallback)
      chtml: {
        minScale: 0.5,
        matchFontHeight: true,
        mtextInheritFont: true,
        merrorInheritFont: true,
        scale: 1,
        // Performance options
        adaptiveCSS: false // Use fixed CSS for performance
      },
      
      // Lazy typesetting
      lazy: {
        typeset: true
      }
    };
  }

  // ============================================
  // SERVER-SIDE RENDERING
  // ============================================

  setupServerSideRendering() {
    // Check for pre-rendered content
    const preRendered = document.querySelectorAll('[data-math-prerendered]');
    
    preRendered.forEach(element => {
      const expression = element.dataset.mathExpression;
      const rendered = element.innerHTML;
      
      // Cache pre-rendered content
      this.setCacheEntry(expression, rendered);
      
      // Mark as rendered
      element.classList.add('math-rendered');
      element.removeAttribute('data-math-prerendered');
    });
    
    // Setup hybrid rendering
    this.setupHybridRendering();
  }

  setupHybridRendering() {
    // Intercept MathJax rendering
    const originalTypeset = MathJax.typeset;
    
    MathJax.typeset = async (elements) => {
      if (!elements) {
        elements = document.querySelectorAll('.math-expression:not(.math-rendered)');
      }
      
      const toRender = [];
      
      // Check cache first
      for (const element of elements) {
        const expression = this.extractExpression(element);
        const cached = await this.getCacheEntry(expression);
        
        if (cached) {
          // Use cached rendering
          element.innerHTML = cached;
          element.classList.add('math-rendered', 'math-cached');
          this.statistics.cacheHits++;
        } else {
          // Queue for rendering
          toRender.push(element);
          this.statistics.cacheMisses++;
        }
      }
      
      // Render uncached expressions
      if (toRender.length > 0) {
        await this.renderBatch(toRender);
      }
    };
  }

  // ============================================
  // RENDERING OPTIMIZATION
  // ============================================

  async renderBatch(elements) {
    // Sort by priority (visible first)
    const prioritized = this.prioritizeElements(elements);
    
    // Chunk processing
    const chunks = this.createRenderChunks(prioritized);
    
    for (const chunk of chunks) {
      await this.renderChunk(chunk);
      
      // Yield to main thread
      await this.yieldToMain();
    }
  }

  prioritizeElements(elements) {
    const visible = [];
    const hidden = [];
    
    elements.forEach(element => {
      if (this.isElementInViewport(element)) {
        visible.push(element);
      } else {
        hidden.push(element);
      }
    });
    
    // Sort visible by distance from viewport top
    visible.sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();
      return Math.abs(rectA.top) - Math.abs(rectB.top);
    });
    
    return [...visible, ...hidden];
  }

  createRenderChunks(elements) {
    const chunks = [];
    const chunkSize = this.config.rendering.chunkSize;
    
    for (let i = 0; i < elements.length; i += chunkSize) {
      chunks.push(elements.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  async renderChunk(chunk) {
    const startTime = performance.now();
    
    // Wait for available render slot
    while (this.activeRenders >= this.config.rendering.maxConcurrent) {
      await this.sleep(10);
    }
    
    this.activeRenders++;
    
    try {
      // Render with MathJax
      await MathJax.typesetPromise(chunk);
      
      // Post-process rendered elements
      for (const element of chunk) {
        await this.postProcessElement(element);
      }
      
    } catch (error) {
      console.error('MathJax rendering error:', error);
    } finally {
      this.activeRenders--;
    }
    
    const renderTime = performance.now() - startTime;
    this.updateStatistics('renderTime', renderTime);
  }

  async postProcessElement(element) {
    const expression = this.extractExpression(element);
    const rendered = element.innerHTML;
    
    // Optimize SVG output
    if (element.querySelector('svg')) {
      this.optimizeSVG(element);
    }
    
    // Cache the rendered output
    await this.setCacheEntry(expression, rendered);
    
    // Mark as rendered
    element.classList.add('math-rendered');
    
    // Remove processing attributes
    element.removeAttribute('data-math-processing');
  }

  optimizeSVG(element) {
    const svgs = element.querySelectorAll('svg');
    
    svgs.forEach(svg => {
      // Remove unnecessary attributes
      svg.removeAttribute('role');
      svg.removeAttribute('focusable');
      
      // Optimize paths
      const paths = svg.querySelectorAll('path');
      paths.forEach(path => {
        const d = path.getAttribute('d');
        if (d) {
          // Round path coordinates to reduce size
          path.setAttribute('d', this.optimizePath(d));
        }
      });
      
      // Add loading lazy attribute
      svg.setAttribute('loading', 'lazy');
      
      // Inline critical styles
      this.inlineSVGStyles(svg);
    });
  }

  optimizePath(pathData) {
    // Round coordinates to 2 decimal places
    return pathData.replace(/(\d+\.\d{3,})/g, (match) => {
      return parseFloat(match).toFixed(2);
    });
  }

  inlineSVGStyles(svg) {
    // Critical styles for math SVG
    const style = svg.querySelector('style') || document.createElementNS('http://www.w3.org/2000/svg', 'style');
    
    style.textContent = `
      .MJX-TEX { font-family: MJXTEX, serif; }
      .MJX-V { vertical-align: baseline; }
      .MJX-H { text-align: center; }
    `;
    
    if (!svg.querySelector('style')) {
      svg.insertBefore(style, svg.firstChild);
    }
  }

  // ============================================
  // CACHING SYSTEM
  // ============================================

  initializeCache() {
    // Load existing cache
    if (this.config.cache.storage === 'localStorage') {
      this.loadLocalStorageCache();
    } else if (this.config.cache.storage === 'indexedDB') {
      this.initIndexedDBCache();
    }
    
    // Setup cache cleanup
    this.setupCacheCleanup();
  }

  loadLocalStorageCache() {
    try {
      const cached = localStorage.getItem('mathJaxCache');
      if (cached) {
        const data = JSON.parse(cached);
        data.forEach(item => {
          if (Date.now() - item.timestamp < this.config.cache.ttl) {
            this.cache.set(item.key, item);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  }

  async initIndexedDBCache() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MathJaxCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('expressions')) {
          db.createObjectStore('expressions', { keyPath: 'key' });
        }
      };
    });
  }

  async getCacheEntry(expression) {
    const key = this.createCacheKey(expression);
    
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      if (Date.now() - entry.timestamp < this.config.cache.ttl) {
        return entry.value;
      } else {
        this.cache.delete(key);
      }
    }
    
    // Check persistent storage
    if (this.config.cache.storage === 'indexedDB' && this.db) {
      return await this.getIndexedDBEntry(key);
    }
    
    return null;
  }

  async setCacheEntry(expression, rendered) {
    const key = this.createCacheKey(expression);
    
    const entry = {
      key: key,
      value: this.config.cache.compression ? this.compress(rendered) : rendered,
      timestamp: Date.now(),
      size: rendered.length
    };
    
    // Memory cache
    this.cache.set(key, entry);
    
    // Persistent storage
    if (this.config.cache.storage === 'localStorage') {
      this.saveToLocalStorage();
    } else if (this.config.cache.storage === 'indexedDB' && this.db) {
      await this.saveToIndexedDB(entry);
    }
    
    // Check cache size
    this.checkCacheSize();
  }

  createCacheKey(expression) {
    // Create a unique key for the expression
    return btoa(expression).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  compress(html) {
    // Simple compression by removing whitespace
    return html
      .replace(/\s+/g, ' ')
      .replace(/> </g, '><')
      .trim();
  }

  saveToLocalStorage() {
    try {
      const data = Array.from(this.cache.values()).slice(-this.config.cache.maxSize);
      localStorage.setItem('mathJaxCache', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save cache:', error);
      // Clear cache if quota exceeded
      if (error.name === 'QuotaExceededError') {
        this.clearCache();
      }
    }
  }

  async saveToIndexedDB(entry) {
    const transaction = this.db.transaction(['expressions'], 'readwrite');
    const store = transaction.objectStore('expressions');
    await store.put(entry);
  }

  checkCacheSize() {
    if (this.cache.size > this.config.cache.maxSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, entries.length - this.config.cache.maxSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  setupCacheCleanup() {
    // Periodic cleanup
    setInterval(() => {
      const now = Date.now();
      const expired = [];
      
      this.cache.forEach((entry, key) => {
        if (now - entry.timestamp > this.config.cache.ttl) {
          expired.push(key);
        }
      });
      
      expired.forEach(key => this.cache.delete(key));
    }, 3600000); // Every hour
  }

  // ============================================
  // FONT OPTIMIZATION
  // ============================================

  preloadMathFonts() {
    const fonts = [
      {
        family: 'MathJax_Main',
        url: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2/MathJax_Main-Regular.woff2'
      },
      {
        family: 'MathJax_Math',
        url: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2/MathJax_Math-Italic.woff2'
      },
      {
        family: 'MathJax_Size1',
        url: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2/MathJax_Size1-Regular.woff2'
      }
    ];
    
    fonts.forEach(font => {
      // Preload font
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = font.url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      
      // CSS font-face
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: '${font.family}';
          src: url('${font.url}') format('woff2');
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    });
  }

  // ============================================
  // PERFORMANCE MONITORING
  // ============================================

  setupPerformanceMonitoring() {
    // Monitor render performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('MathJax')) {
            this.recordPerformance(entry);
          }
        }
      });
      
      observer.observe({ entryTypes: ['measure', 'mark'] });
    }
  }

  recordPerformance(entry) {
    // Update statistics
    this.statistics.totalRenders++;
    
    if (entry.duration) {
      const currentAvg = this.statistics.averageRenderTime;
      const newAvg = (currentAvg * (this.statistics.totalRenders - 1) + entry.duration) / this.statistics.totalRenders;
      this.statistics.averageRenderTime = newAvg;
      
      // Warn if render time exceeds target
      if (entry.duration > this.config.performance.targetRenderTime) {
        console.warn(`Slow MathJax render: ${entry.duration.toFixed(2)}ms for ${entry.name}`);
      }
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  extractExpression(element) {
    // Extract LaTeX expression from element
    return element.textContent || 
           element.dataset.mathExpression || 
           element.getAttribute('data-math') || 
           '';
  }

  isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= window.innerHeight &&
      rect.bottom >= 0 &&
      rect.left <= window.innerWidth &&
      rect.right >= 0
    );
  }

  async yieldToMain() {
    return new Promise(resolve => {
      if ('scheduler' in window && 'yield' in scheduler) {
        scheduler.yield().then(resolve);
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  updateStatistics(type, value) {
    // Update performance statistics
    if (type === 'renderTime') {
      const current = this.statistics.averageRenderTime;
      const count = this.statistics.totalRenders;
      this.statistics.averageRenderTime = (current * count + value) / (count + 1);
      this.statistics.totalRenders++;
    }
    
    // Report statistics
    this.reportStatistics();
  }

  reportStatistics() {
    // Dispatch custom event with statistics
    window.dispatchEvent(new CustomEvent('mathjax-statistics', {
      detail: this.statistics
    }));
  }

  clearCache() {
    this.cache.clear();
    
    if (this.config.cache.storage === 'localStorage') {
      localStorage.removeItem('mathJaxCache');
    } else if (this.config.cache.storage === 'indexedDB' && this.db) {
      const transaction = this.db.transaction(['expressions'], 'readwrite');
      transaction.objectStore('expressions').clear();
    }
  }

  // ============================================
  // MATHJAX HOOKS
  // ============================================

  onMathJaxReady() {
    console.log('MathJax optimized and ready');
    
    // Trigger initial render of visible math
    this.renderVisibleMath();
    
    // Setup intersection observer for lazy rendering
    this.setupLazyRendering();
  }

  renderVisibleMath() {
    const visible = document.querySelectorAll('.math-expression:not(.math-rendered)');
    const inViewport = Array.from(visible).filter(el => this.isElementInViewport(el));
    
    if (inViewport.length > 0) {
      MathJax.typeset(inViewport);
    }
  }

  setupLazyRendering() {
    if (!this.config.optimization.lazyRender) return;
    
    const observer = new IntersectionObserver((entries) => {
      const toRender = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => entry.target)
        .filter(el => !el.classList.contains('math-rendered'));
      
      if (toRender.length > 0) {
        MathJax.typeset(toRender);
      }
    }, {
      rootMargin: '100px'
    });
    
    document.querySelectorAll('.math-expression:not(.math-rendered)').forEach(el => {
      observer.observe(el);
    });
  }

  async controlledPageReady() {
    // Custom page ready logic
    await this.precompileCommonExpressions();
    return MathJax.startup.pageReady();
  }

  async precompileCommonExpressions() {
    if (!this.config.optimization.precompile) return;
    
    // Common math expressions to precompile
    const common = [
      'x^2', 'x^3', 'x^n',
      '\\frac{a}{b}', '\\frac{1}{2}', '\\frac{x}{y}',
      '\\sqrt{x}', '\\sqrt{2}', '\\sqrt{a^2 + b^2}',
      '\\sin(x)', '\\cos(x)', '\\tan(x)',
      '\\int f(x) dx', '\\sum_{i=1}^{n}',
      'e^x', '\\ln(x)', '\\log(x)'
    ];
    
    // Precompile in background
    for (const expr of common) {
      const cached = await this.getCacheEntry(expr);
      if (!cached) {
        // Create temporary element
        const temp = document.createElement('div');
        temp.style.position = 'absolute';
        temp.style.left = '-9999px';
        temp.textContent = expr;
        document.body.appendChild(temp);
        
        // Render and cache
        await MathJax.typesetPromise([temp]);
        await this.postProcessElement(temp);
        
        // Clean up
        document.body.removeChild(temp);
      }
    }
  }

  // Custom render actions
  addCachingAction(math, doc) {
    // Add caching attributes to math elements
    math.start.node.setAttribute('data-math-cached', 'pending');
  }

  optimizeSVGAction(math, doc) {
    // Optimize SVG output during rendering
    if (math.outputData && math.outputData.svg) {
      // Custom SVG optimizations
    }
  }

  measurePerformanceAction(math, doc) {
    // Measure rendering performance
    const renderTime = math.metrics ? math.metrics.renderTime : 0;
    if (renderTime > 0) {
      this.recordPerformance({
        name: 'MathJax.render',
        duration: renderTime
      });
    }
  }
}

// Initialize optimizer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mathJaxOptimizer = new MathJaxPerformanceOptimizer();
  });
} else {
  window.mathJaxOptimizer = new MathJaxPerformanceOptimizer();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathJaxPerformanceOptimizer;
}