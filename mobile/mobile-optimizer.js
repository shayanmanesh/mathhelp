// Mobile Optimization System for Math Platforms
// Responsive design and performance for mathematical content

class MobileOptimizer {
  constructor() {
    this.config = {
      viewport: {
        minWidth: 320,
        maxScale: 5.0,
        userScalable: true
      },
      
      touch: {
        minTargetSize: 44, // pixels (WCAG 2.5.5)
        swipeThreshold: 50, // pixels
        tapDelay: 300 // ms
      },
      
      math: {
        minFontSize: 14, // pixels
        maxWidth: '100vw',
        horizontalScroll: true,
        pinchZoom: true,
        doubleTapZoom: true
      },
      
      performance: {
        maxResources: 50,
        criticalInlineLimit: 14336, // 14KB
        lazyLoadOffset: '50px',
        networkAware: true
      },
      
      layout: {
        breakpoints: {
          mobile: 480,
          tablet: 768,
          desktop: 1024
        },
        gridColumns: {
          mobile: 4,
          tablet: 8,
          desktop: 12
        }
      }
    };
    
    this.deviceInfo = {
      isMobile: false,
      isTablet: false,
      hasTouch: false,
      pixelRatio: 1,
      connection: null
    };
    
    this.init();
  }

  init() {
    this.detectDevice();
    this.setupViewport();
    this.optimizeTouchInteractions();
    this.implementResponsiveLayout();
    this.optimizeMathRendering();
    this.setupGestureHandling();
    this.implementNetworkAwareLoading();
    this.monitorPerformance();
  }

  // ============================================
  // DEVICE DETECTION
  // ============================================

  detectDevice() {
    // Screen size detection
    const width = window.innerWidth;
    this.deviceInfo.isMobile = width <= this.config.layout.breakpoints.mobile;
    this.deviceInfo.isTablet = width > this.config.layout.breakpoints.mobile && 
                               width <= this.config.layout.breakpoints.tablet;
    
    // Touch capability
    this.deviceInfo.hasTouch = 'ontouchstart' in window || 
                               navigator.maxTouchPoints > 0 ||
                               navigator.msMaxTouchPoints > 0;
    
    // Pixel ratio
    this.deviceInfo.pixelRatio = window.devicePixelRatio || 1;
    
    // Connection type
    if ('connection' in navigator) {
      this.deviceInfo.connection = navigator.connection;
    }
    
    // Add device classes to body
    this.applyDeviceClasses();
    
    // Listen for orientation changes
    this.setupOrientationHandling();
  }

  applyDeviceClasses() {
    const classes = [];
    
    if (this.deviceInfo.isMobile) classes.push('device-mobile');
    if (this.deviceInfo.isTablet) classes.push('device-tablet');
    if (this.deviceInfo.hasTouch) classes.push('has-touch');
    if (this.deviceInfo.pixelRatio > 1) classes.push('high-dpi');
    
    document.body.className = document.body.className
      .split(' ')
      .filter(c => !c.startsWith('device-') && c !== 'has-touch' && c !== 'high-dpi')
      .concat(classes)
      .join(' ');
  }

  setupOrientationHandling() {
    const handleOrientation = () => {
      const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      document.body.setAttribute('data-orientation', orientation);
      
      // Re-optimize layout
      this.optimizeForOrientation(orientation);
    };
    
    window.addEventListener('orientationchange', handleOrientation);
    window.addEventListener('resize', debounce(handleOrientation, 300));
    
    // Initial setup
    handleOrientation();
  }

  // ============================================
  // VIEWPORT OPTIMIZATION
  // ============================================

  setupViewport() {
    // Ensure proper viewport meta tag
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    
    // Set optimal viewport settings
    viewport.content = `width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=${this.config.viewport.maxScale}, user-scalable=${this.config.viewport.userScalable ? 'yes' : 'no'}`;
    
    // Prevent zoom on input focus (iOS)
    this.preventInputZoom();
    
    // Handle safe areas (iPhone X+)
    this.setupSafeAreas();
  }

  preventInputZoom() {
    if (!this.deviceInfo.isMobile) return;
    
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Set minimum font size to prevent zoom
      const fontSize = window.getComputedStyle(input).fontSize;
      if (parseFloat(fontSize) < 16) {
        input.style.fontSize = '16px';
      }
      
      // Handle focus events
      input.addEventListener('focus', (e) => {
        if (this.deviceInfo.isMobile) {
          // Temporarily disable zoom
          const viewport = document.querySelector('meta[name="viewport"]');
          const originalContent = viewport.content;
          viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
          
          // Re-enable after blur
          input.addEventListener('blur', () => {
            viewport.content = originalContent;
          }, { once: true });
        }
      });
    });
  }

  setupSafeAreas() {
    // Add CSS for safe area handling
    const style = document.createElement('style');
    style.textContent = `
      @supports (padding: max(0px)) {
        .site-header,
        .site-footer,
        .fixed-bottom {
          padding-left: max(1rem, env(safe-area-inset-left));
          padding-right: max(1rem, env(safe-area-inset-right));
        }
        
        .site-header {
          padding-top: max(1rem, env(safe-area-inset-top));
        }
        
        .site-footer,
        .fixed-bottom {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // TOUCH OPTIMIZATION
  // ============================================

  optimizeTouchInteractions() {
    // Ensure minimum touch target sizes
    this.ensureTouchTargets();
    
    // Remove tap delay
    this.removeTapDelay();
    
    // Optimize scrolling
    this.optimizeScrolling();
    
    // Add touch feedback
    this.addTouchFeedback();
  }

  ensureTouchTargets() {
    const interactives = document.querySelectorAll('a, button, input, select, textarea, [role="button"], [onclick]');
    
    interactives.forEach(element => {
      const rect = element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      if (width < this.config.touch.minTargetSize || height < this.config.touch.minTargetSize) {
        // Increase touch target size
        element.style.position = 'relative';
        
        // Create invisible touch target
        const touchTarget = document.createElement('span');
        touchTarget.className = 'touch-target-extender';
        touchTarget.style.cssText = `
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          min-width: ${this.config.touch.minTargetSize}px;
          min-height: ${this.config.touch.minTargetSize}px;
          pointer-events: none;
        `;
        
        // Add to element
        element.style.minWidth = `${this.config.touch.minTargetSize}px`;
        element.style.minHeight = `${this.config.touch.minTargetSize}px`;
        element.classList.add('touch-optimized');
      }
    });
  }

  removeTapDelay() {
    // Use CSS touch-action to remove delay
    const style = document.createElement('style');
    style.textContent = `
      a, button, input, select, textarea, [role="button"] {
        touch-action: manipulation;
      }
      
      * {
        -webkit-tap-highlight-color: transparent;
      }
    `;
    document.head.appendChild(style);
    
    // FastClick alternative
    let touchStartTime;
    let touchStartX;
    let touchStartY;
    
    document.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      const touchEndTime = Date.now();
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      // Check if it's a tap
      const timeDiff = touchEndTime - touchStartTime;
      const distance = Math.sqrt(
        Math.pow(touchEndX - touchStartX, 2) + 
        Math.pow(touchEndY - touchStartY, 2)
      );
      
      if (timeDiff < this.config.touch.tapDelay && distance < 10) {
        const target = e.target;
        if (target.matches('a, button, input, select, [role="button"]')) {
          e.preventDefault();
          
          // Trigger click immediately
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          target.dispatchEvent(clickEvent);
        }
      }
    }, { passive: false });
  }

  optimizeScrolling() {
    // Momentum scrolling for iOS
    const scrollContainers = document.querySelectorAll('.scroll-container, .math-expression, .overflow-auto');
    
    scrollContainers.forEach(container => {
      container.style.webkitOverflowScrolling = 'touch';
      container.style.overflowScrolling = 'touch';
    });
    
    // Passive event listeners for better scrolling performance
    const passiveSupported = this.checkPassiveSupport();
    
    if (passiveSupported) {
      window.addEventListener('touchstart', () => {}, { passive: true });
      window.addEventListener('touchmove', () => {}, { passive: true });
      window.addEventListener('wheel', () => {}, { passive: true });
    }
  }

  checkPassiveSupport() {
    let supported = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: function() { supported = true; }
      });
      window.addEventListener('test', null, opts);
      window.removeEventListener('test', null, opts);
    } catch (e) {}
    return supported;
  }

  addTouchFeedback() {
    // Visual feedback for touch interactions
    const style = document.createElement('style');
    style.textContent = `
      .touch-feedback {
        position: relative;
        overflow: hidden;
      }
      
      .touch-feedback::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.1);
        transform: translate(-50%, -50%);
        transition: width 0.3s, height 0.3s;
      }
      
      .touch-feedback:active::after {
        width: 100%;
        height: 100%;
      }
      
      @media (hover: none) {
        button, a, [role="button"] {
          cursor: default;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Add feedback class to interactive elements
    document.querySelectorAll('button, a, [role="button"]').forEach(el => {
      el.classList.add('touch-feedback');
    });
  }

  // ============================================
  // RESPONSIVE LAYOUT
  // ============================================

  implementResponsiveLayout() {
    // Inject responsive grid system
    this.injectResponsiveGrid();
    
    // Setup responsive typography
    this.setupResponsiveTypography();
    
    // Handle responsive images
    this.optimizeResponsiveImages();
    
    // Create responsive tables
    this.makeTablesResponsive();
  }

  injectResponsiveGrid() {
    const style = document.createElement('style');
    style.textContent = `
      .container {
        width: 100%;
        margin: 0 auto;
        padding: 0 1rem;
      }
      
      @media (min-width: ${this.config.layout.breakpoints.mobile}px) {
        .container { max-width: ${this.config.layout.breakpoints.mobile}px; }
      }
      
      @media (min-width: ${this.config.layout.breakpoints.tablet}px) {
        .container { max-width: ${this.config.layout.breakpoints.tablet}px; }
      }
      
      @media (min-width: ${this.config.layout.breakpoints.desktop}px) {
        .container { max-width: ${this.config.layout.breakpoints.desktop}px; }
      }
      
      .row {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -0.5rem;
      }
      
      [class*="col-"] {
        padding: 0 0.5rem;
        width: 100%;
      }
      
      /* Mobile columns */
      @media (max-width: ${this.config.layout.breakpoints.mobile - 1}px) {
        ${this.generateGridColumns('mobile')}
      }
      
      /* Tablet columns */
      @media (min-width: ${this.config.layout.breakpoints.mobile}px) and (max-width: ${this.config.layout.breakpoints.tablet - 1}px) {
        ${this.generateGridColumns('tablet')}
      }
      
      /* Desktop columns */
      @media (min-width: ${this.config.layout.breakpoints.tablet}px) {
        ${this.generateGridColumns('desktop')}
      }
    `;
    document.head.appendChild(style);
  }

  generateGridColumns(breakpoint) {
    const columns = this.config.layout.gridColumns[breakpoint];
    let css = '';
    
    for (let i = 1; i <= columns; i++) {
      css += `.col-${breakpoint}-${i} { width: ${(i / columns) * 100}%; }\n`;
    }
    
    return css;
  }

  setupResponsiveTypography() {
    const style = document.createElement('style');
    style.textContent = `
      /* Fluid typography */
      html {
        font-size: 16px;
      }
      
      @media (max-width: ${this.config.layout.breakpoints.mobile}px) {
        html { font-size: 14px; }
        h1 { font-size: 1.75rem; }
        h2 { font-size: 1.5rem; }
        h3 { font-size: 1.25rem; }
      }
      
      @media (min-width: ${this.config.layout.breakpoints.mobile}px) and (max-width: ${this.config.layout.breakpoints.tablet}px) {
        html { font-size: 15px; }
        h1 { font-size: 2rem; }
        h2 { font-size: 1.75rem; }
        h3 { font-size: 1.5rem; }
      }
      
      /* Responsive line height */
      p, li {
        line-height: 1.6;
      }
      
      @media (max-width: ${this.config.layout.breakpoints.mobile}px) {
        p, li { line-height: 1.5; }
      }
    `;
    document.head.appendChild(style);
  }

  optimizeResponsiveImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Make images responsive
      if (!img.style.maxWidth) {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      }
      
      // Add loading attribute
      if (!img.loading && !this.isInViewport(img)) {
        img.loading = 'lazy';
      }
      
      // Generate srcset if not present
      if (!img.srcset && img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
      
      // Add sizes attribute for responsive images
      if (img.srcset && !img.sizes) {
        img.sizes = `(max-width: ${this.config.layout.breakpoints.mobile}px) 100vw,
                     (max-width: ${this.config.layout.breakpoints.tablet}px) 50vw,
                     33vw`;
      }
    });
  }

  makeTablesResponsive() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
      // Wrap table in responsive container
      if (!table.parentElement.classList.contains('table-responsive')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });
    
    // Add responsive table styles
    const style = document.createElement('style');
    style.textContent = `
      .table-responsive {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        margin-bottom: 1rem;
      }
      
      .table-responsive table {
        min-width: 100%;
        border-collapse: collapse;
      }
      
      @media (max-width: ${this.config.layout.breakpoints.mobile}px) {
        .table-responsive table,
        .table-responsive thead,
        .table-responsive tbody,
        .table-responsive th,
        .table-responsive td,
        .table-responsive tr {
          display: block;
        }
        
        .table-responsive thead tr {
          position: absolute;
          top: -9999px;
          left: -9999px;
        }
        
        .table-responsive tr {
          border: 1px solid #ccc;
          margin-bottom: 10px;
        }
        
        .table-responsive td {
          border: none;
          position: relative;
          padding-left: 50%;
        }
        
        .table-responsive td:before {
          content: attr(data-label);
          position: absolute;
          left: 6px;
          width: 45%;
          padding-right: 10px;
          white-space: nowrap;
          font-weight: bold;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // MATH RENDERING OPTIMIZATION
  // ============================================

  optimizeMathRendering() {
    // Make math expressions mobile-friendly
    this.setupResponsiveMath();
    
    // Enable pinch-to-zoom for math
    this.enableMathZoom();
    
    // Optimize font sizes
    this.optimizeMathFontSizes();
    
    // Add horizontal scrolling for wide equations
    this.setupMathScrolling();
  }

  setupResponsiveMath() {
    const style = document.createElement('style');
    style.textContent = `
      /* Responsive math containers */
      .math-expression,
      mjx-container,
      .MathJax {
        max-width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        position: relative;
      }
      
      /* Math scrolling indicator */
      .math-expression.scrollable::after,
      mjx-container.scrollable::after {
        content: '→';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        background: linear-gradient(to right, transparent, rgba(255,255,255,0.9));
        padding: 0.5rem;
        pointer-events: none;
        font-size: 1.5rem;
        color: #666;
      }
      
      /* Mobile math font sizes */
      @media (max-width: ${this.config.layout.breakpoints.mobile}px) {
        mjx-container,
        .MathJax {
          font-size: ${this.config.math.minFontSize}px !important;
        }
        
        mjx-math {
          white-space: nowrap !important;
        }
      }
      
      /* Touch-friendly math spacing */
      @media (hover: none) {
        .math-expression,
        mjx-container {
          padding: 0.5rem 0;
          margin: 0.5rem 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Add scrollable class to wide math
    this.detectScrollableMath();
  }

  detectScrollableMath() {
    const mathElements = document.querySelectorAll('.math-expression, mjx-container');
    
    mathElements.forEach(element => {
      if (element.scrollWidth > element.clientWidth) {
        element.classList.add('scrollable');
      }
    });
    
    // Re-check on resize
    window.addEventListener('resize', debounce(() => {
      this.detectScrollableMath();
    }, 300));
  }

  enableMathZoom() {
    if (!this.config.math.pinchZoom) return;
    
    const mathElements = document.querySelectorAll('.math-expression, mjx-container');
    
    mathElements.forEach(element => {
      let scale = 1;
      let initialDistance = 0;
      
      element.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          initialDistance = this.getDistance(e.touches[0], e.touches[1]);
        }
      }, { passive: true });
      
      element.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialDistance > 0) {
          const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
          scale = currentDistance / initialDistance;
          element.style.transform = `scale(${Math.min(3, Math.max(0.5, scale))})`;
        }
      }, { passive: true });
      
      element.addEventListener('touchend', () => {
        initialDistance = 0;
        // Optionally reset scale after a delay
        setTimeout(() => {
          element.style.transform = '';
        }, 3000);
      }, { passive: true });
    });
  }

  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  optimizeMathFontSizes() {
    const mathElements = document.querySelectorAll('mjx-container, .MathJax');
    
    mathElements.forEach(element => {
      const fontSize = window.getComputedStyle(element).fontSize;
      const size = parseFloat(fontSize);
      
      if (size < this.config.math.minFontSize) {
        element.style.fontSize = `${this.config.math.minFontSize}px`;
      }
    });
  }

  setupMathScrolling() {
    // Add touch-friendly scrolling to math containers
    const mathContainers = document.querySelectorAll('.math-expression, mjx-container');
    
    mathContainers.forEach(container => {
      if (container.scrollWidth > container.clientWidth) {
        // Add scroll hint
        let scrollHint = container.querySelector('.scroll-hint');
        if (!scrollHint) {
          scrollHint = document.createElement('div');
          scrollHint.className = 'scroll-hint';
          scrollHint.innerHTML = '← Swipe to see more →';
          container.appendChild(scrollHint);
        }
        
        // Hide hint on scroll
        container.addEventListener('scroll', () => {
          scrollHint.style.opacity = '0';
        }, { passive: true });
      }
    });
    
    // Add scroll hint styles
    const style = document.createElement('style');
    style.textContent = `
      .scroll-hint {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 1rem;
        font-size: 0.75rem;
        pointer-events: none;
        transition: opacity 0.3s;
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // GESTURE HANDLING
  // ============================================

  setupGestureHandling() {
    // Swipe gestures for navigation
    this.setupSwipeNavigation();
    
    // Double tap to zoom
    this.setupDoubleTapZoom();
    
    // Pull to refresh
    this.setupPullToRefresh();
  }

  setupSwipeNavigation() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      this.handleSwipe();
    }, { passive: true });
    
    const handleSwipe = () => {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Horizontal swipe
      if (Math.abs(deltaX) > this.config.touch.swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          // Swipe right
          this.onSwipeRight();
        } else {
          // Swipe left
          this.onSwipeLeft();
        }
      }
    };
    
    this.handleSwipe = handleSwipe;
  }

  onSwipeRight() {
    // Navigate to previous page/problem
    const prevButton = document.querySelector('.nav-prev, .prev-problem');
    if (prevButton) {
      prevButton.click();
    }
  }

  onSwipeLeft() {
    // Navigate to next page/problem
    const nextButton = document.querySelector('.nav-next, .next-problem');
    if (nextButton) {
      nextButton.click();
    }
  }

  setupDoubleTapZoom() {
    if (!this.config.math.doubleTapZoom) return;
    
    let lastTap = 0;
    
    document.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 300 && tapLength > 0) {
        const target = e.target.closest('.math-expression, mjx-container');
        if (target) {
          e.preventDefault();
          this.zoomElement(target);
        }
      }
      
      lastTap = currentTime;
    });
  }

  zoomElement(element) {
    const currentScale = element.style.transform.match(/scale\(([\d.]+)\)/);
    const scale = currentScale ? parseFloat(currentScale[1]) : 1;
    
    if (scale > 1) {
      // Reset zoom
      element.style.transform = '';
      element.style.zIndex = '';
    } else {
      // Zoom in
      element.style.transform = 'scale(1.5)';
      element.style.zIndex = '1000';
    }
  }

  setupPullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let pulling = false;
    
    const pullContainer = document.createElement('div');
    pullContainer.className = 'pull-to-refresh';
    pullContainer.innerHTML = '<div class="pull-indicator">↓ Pull to refresh</div>';
    document.body.insertBefore(pullContainer, document.body.firstChild);
    
    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].pageY;
        pulling = true;
      }
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      if (!pulling) return;
      
      currentY = e.touches[0].pageY;
      const pullDistance = currentY - startY;
      
      if (pullDistance > 0 && window.scrollY === 0) {
        pullContainer.style.height = `${Math.min(pullDistance, 100)}px`;
        
        if (pullDistance > 70) {
          pullContainer.querySelector('.pull-indicator').textContent = '↑ Release to refresh';
        }
      }
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
      if (!pulling) return;
      
      const pullDistance = currentY - startY;
      
      if (pullDistance > 70) {
        // Trigger refresh
        window.location.reload();
      } else {
        pullContainer.style.height = '0';
      }
      
      pulling = false;
    }, { passive: true });
  }

  // ============================================
  // NETWORK-AWARE LOADING
  // ============================================

  implementNetworkAwareLoading() {
    if (!this.config.performance.networkAware || !('connection' in navigator)) return;
    
    const connection = navigator.connection;
    
    // Monitor connection changes
    connection.addEventListener('change', () => {
      this.adaptToNetwork();
    });
    
    // Initial adaptation
    this.adaptToNetwork();
  }

  adaptToNetwork() {
    const connection = navigator.connection;
    const effectiveType = connection.effectiveType;
    const saveData = connection.saveData;
    
    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      // Low quality mode
      this.enableDataSaverMode();
    } else if (effectiveType === '3g') {
      // Medium quality mode
      this.enableMediumQualityMode();
    } else {
      // High quality mode
      this.enableHighQualityMode();
    }
  }

  enableDataSaverMode() {
    document.body.classList.add('data-saver-mode');
    
    // Disable auto-play videos
    document.querySelectorAll('video').forEach(video => {
      video.pause();
      video.preload = 'none';
    });
    
    // Use lower quality images
    document.querySelectorAll('img[data-low-src]').forEach(img => {
      img.src = img.dataset.lowSrc;
    });
    
    // Disable non-essential features
    this.disableNonEssentialFeatures();
  }

  enableMediumQualityMode() {
    document.body.classList.remove('data-saver-mode');
    document.body.classList.add('medium-quality-mode');
    
    // Standard quality images
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
    });
  }

  enableHighQualityMode() {
    document.body.classList.remove('data-saver-mode', 'medium-quality-mode');
    
    // High quality images
    document.querySelectorAll('img[data-high-src]').forEach(img => {
      img.src = img.dataset.highSrc;
    });
    
    // Enable all features
    this.enableAllFeatures();
  }

  disableNonEssentialFeatures() {
    // Disable animations
    document.body.style.setProperty('--animation-duration', '0.01ms');
    
    // Disable web fonts
    const style = document.createElement('style');
    style.textContent = `
      * { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; }
    `;
    style.id = 'data-saver-fonts';
    document.head.appendChild(style);
  }

  enableAllFeatures() {
    // Re-enable animations
    document.body.style.removeProperty('--animation-duration');
    
    // Re-enable web fonts
    const dataSaverFonts = document.getElementById('data-saver-fonts');
    if (dataSaverFonts) {
      dataSaverFonts.remove();
    }
  }

  // ============================================
  // PERFORMANCE MONITORING
  // ============================================

  monitorPerformance() {
    // Monitor frame rate
    this.monitorFrameRate();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor resource count
    this.monitorResourceCount();
  }

  monitorFrameRate() {
    let lastTime = performance.now();
    let frames = 0;
    let fps = 0;
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;
        
        // Warn if FPS drops below 30
        if (fps < 30 && fps > 0) {
          console.warn(`Low FPS detected: ${fps}`);
          this.optimizeForLowPerformance();
        }
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usedPercent > 90) {
          console.warn(`High memory usage: ${usedPercent.toFixed(2)}%`);
          this.reduceMemoryUsage();
        }
      }, 10000); // Check every 10 seconds
    }
  }

  monitorResourceCount() {
    const resources = performance.getEntriesByType('resource');
    
    if (resources.length > this.config.performance.maxResources) {
      console.warn(`Too many resources loaded: ${resources.length}`);
      
      // Log slowest resources
      const slowest = resources
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5);
      
      console.log('Slowest resources:', slowest.map(r => ({
        name: r.name,
        duration: r.duration,
        size: r.transferSize
      })));
    }
  }

  optimizeForLowPerformance() {
    // Reduce visual complexity
    document.body.classList.add('low-performance-mode');
    
    // Disable animations
    const style = document.createElement('style');
    style.textContent = `
      .low-performance-mode * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
    
    // Simplify shadows and effects
    document.querySelectorAll('[style*="box-shadow"]').forEach(el => {
      el.style.boxShadow = 'none';
    });
  }

  reduceMemoryUsage() {
    // Clear caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Remove non-visible images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!this.isInViewport(img)) {
        img.src = '';
        img.dataset.src = img.src;
      }
    });
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= window.innerHeight &&
      rect.bottom >= 0 &&
      rect.left <= window.innerWidth &&
      rect.right >= 0
    );
  }

  optimizeForOrientation(orientation) {
    if (orientation === 'landscape' && this.deviceInfo.isMobile) {
      // Reduce vertical spacing in landscape
      document.body.classList.add('landscape-optimized');
    } else {
      document.body.classList.remove('landscape-optimized');
    }
  }
}

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize mobile optimizer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mobileOptimizer = new MobileOptimizer();
  });
} else {
  window.mobileOptimizer = new MobileOptimizer();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileOptimizer;
}