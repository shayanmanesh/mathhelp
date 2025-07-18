// Responsive Math Rendering System
// Scalable typography with MathML and MathJax fallback

class ResponsiveMathRenderer {
  constructor(options = {}) {
    this.config = {
      breakpoints: {
        mobile: 320,
        tablet: 768,
        desktop: 1024,
        wide: 1440
      },
      
      typography: {
        baseSize: 16, // Base font size in pixels
        scaleRatio: 1.25, // Modular scale ratio
        lineHeight: 1.6,
        mathScale: {
          mobile: 0.85,
          tablet: 0.95,
          desktop: 1.0,
          wide: 1.1
        }
      },
      
      rendering: {
        preferMathML: true,
        enableSVG: true,
        enableZoom: true,
        caching: true,
        progressive: true
      },
      
      layout: {
        maxMathWidth: {
          mobile: '100%',
          tablet: '90%',
          desktop: '80%',
          wide: '1200px'
        },
        horizontalPadding: {
          mobile: '1rem',
          tablet: '2rem',
          desktop: '3rem',
          wide: '4rem'
        }
      },
      
      accessibility: {
        enableAria: true,
        enableKeyboard: true,
        contrastMode: false,
        reduceMotion: false
      }
    };
    
    this.state = {
      currentBreakpoint: 'desktop',
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      mathElements: new Map(),
      renderQueue: [],
      isRendering: false
    };
    
    this.cache = new Map();
    this.observer = null;
    
    this.init();
  }

  init() {
    this.detectEnvironment();
    this.setupMathJax();
    this.setupViewportMonitoring();
    this.setupIntersectionObserver();
    this.injectStyles();
    this.processInitialContent();
  }

  // ============================================
  // ENVIRONMENT DETECTION
  // ============================================

  detectEnvironment() {
    // Detect current breakpoint
    this.updateBreakpoint();
    
    // Detect MathML support
    this.state.mathMLSupported = this.checkMathMLSupport();
    
    // Detect touch capability
    this.state.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Detect reduced motion preference
    this.config.accessibility.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Detect high contrast preference
    this.config.accessibility.contrastMode = window.matchMedia('(prefers-contrast: high)').matches;
  }

  checkMathMLSupport() {
    const div = document.createElement('div');
    div.innerHTML = '<math><mfrac><mn>1</mn><mn>2</mn></mfrac></math>';
    document.body.appendChild(div);
    const supported = div.firstChild?.firstChild?.namespaceURI === 'http://www.w3.org/1998/Math/MathML';
    document.body.removeChild(div);
    return supported;
  }

  updateBreakpoint() {
    const width = window.innerWidth;
    const breakpoints = this.config.breakpoints;
    
    if (width < breakpoints.tablet) {
      this.state.currentBreakpoint = 'mobile';
    } else if (width < breakpoints.desktop) {
      this.state.currentBreakpoint = 'tablet';
    } else if (width < breakpoints.wide) {
      this.state.currentBreakpoint = 'desktop';
    } else {
      this.state.currentBreakpoint = 'wide';
    }
  }

  // ============================================
  // MATHJAX CONFIGURATION
  // ============================================

  setupMathJax() {
    window.MathJax = {
      ...window.MathJax,
      
      loader: {
        load: ['[tex]/html', '[tex]/physics', '[tex]/ams']
      },
      
      tex: {
        packages: {'[+]': ['html', 'physics', 'ams']},
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true
      },
      
      svg: {
        fontCache: 'global',
        scale: this.getMathScale(),
        minScale: 0.5,
        matchFontHeight: true,
        mtextInheritFont: true,
        merrorInheritFont: true,
        unknownFamily: 'serif',
        displayAlign: 'center',
        displayIndent: '0'
      },
      
      chtml: {
        scale: this.getMathScale(),
        minScale: 0.5,
        matchFontHeight: true,
        mtextInheritFont: true,
        merrorInheritFont: true,
        displayAlign: 'center',
        displayIndent: '0',
        adaptiveCSS: true
      },
      
      options: {
        menuOptions: {
          settings: {
            zoom: 'DoubleClick',
            zscale: '150%',
            renderer: 'SVG',
            alt: true,
            cmd: true,
            ctrl: true,
            shift: true
          }
        }
      },
      
      startup: {
        ready: () => {
          MathJax.startup.defaultReady();
          this.onMathJaxReady();
        }
      }
    };
  }

  getMathScale() {
    return this.config.typography.mathScale[this.state.currentBreakpoint] || 1.0;
  }

  onMathJaxReady() {
    console.log('MathJax ready for responsive rendering');
    
    // Override MathJax typeset to add responsive features
    const originalTypeset = MathJax.typeset;
    MathJax.typeset = async (elements) => {
      const result = await originalTypeset.call(MathJax, elements);
      this.postProcessMath();
      return result;
    };
  }

  // ============================================
  // VIEWPORT MONITORING
  // ============================================

  setupViewportMonitoring() {
    // Resize handler with debouncing
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.handleViewportChange();
      }, 250);
    });
    
    // Orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleViewportChange();
      }, 100);
    });
    
    // Visual viewport API for better mobile support
    if ('visualViewport' in window) {
      window.visualViewport.addEventListener('resize', () => {
        this.handleVisualViewportChange();
      });
    }
  }

  handleViewportChange() {
    const oldBreakpoint = this.state.currentBreakpoint;
    const oldWidth = this.state.viewportWidth;
    
    this.state.viewportWidth = window.innerWidth;
    this.state.viewportHeight = window.innerHeight;
    this.updateBreakpoint();
    
    // Re-render if breakpoint changed
    if (oldBreakpoint !== this.state.currentBreakpoint) {
      this.updateMathScale();
      this.reRenderAllMath();
    }
    
    // Handle width changes for fluid typography
    else if (Math.abs(oldWidth - this.state.viewportWidth) > 50) {
      this.updateFluidTypography();
    }
  }

  handleVisualViewportChange() {
    // Handle zoom and keyboard appearance on mobile
    if (window.visualViewport) {
      const scale = window.visualViewport.scale;
      const height = window.visualViewport.height;
      
      // Adjust math rendering for zoom
      if (scale !== 1) {
        this.adjustForZoom(scale);
      }
    }
  }

  // ============================================
  // MATH ELEMENT PROCESSING
  // ============================================

  processInitialContent() {
    // Find all math elements
    const mathElements = this.findMathElements();
    
    mathElements.forEach(element => {
      this.processMathElement(element);
    });
  }

  findMathElements() {
    const selectors = [
      '.math',
      '.math-inline',
      '.math-display',
      '[data-math]',
      'math', // MathML
      '.MathJax',
      '.MathJax_Display',
      'mjx-container'
    ];
    
    return document.querySelectorAll(selectors.join(', '));
  }

  processMathElement(element) {
    // Generate unique ID
    const id = element.id || `math-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    element.id = id;
    
    // Store element data
    this.state.mathElements.set(id, {
      element,
      content: this.extractMathContent(element),
      type: this.detectMathType(element),
      rendered: false,
      viewport: null
    });
    
    // Add responsive wrapper
    this.wrapMathElement(element);
    
    // Apply responsive attributes
    this.applyResponsiveAttributes(element);
    
    // Queue for rendering
    this.queueForRendering(element);
  }

  extractMathContent(element) {
    // Try different content sources
    return element.textContent || 
           element.dataset.math || 
           element.getAttribute('alttext') || 
           '';
  }

  detectMathType(element) {
    if (element.classList.contains('math-inline') || 
        element.tagName === 'SPAN' ||
        element.style.display === 'inline') {
      return 'inline';
    }
    return 'display';
  }

  wrapMathElement(element) {
    if (element.parentElement?.classList.contains('math-responsive-wrapper')) {
      return; // Already wrapped
    }
    
    const wrapper = document.createElement('div');
    wrapper.className = 'math-responsive-wrapper';
    wrapper.setAttribute('role', 'math');
    wrapper.setAttribute('aria-label', this.generateAriaLabel(element));
    
    // Set wrapper type
    const type = this.detectMathType(element);
    wrapper.classList.add(`math-wrapper-${type}`);
    
    // Wrap element
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
  }

  generateAriaLabel(element) {
    const content = this.extractMathContent(element);
    // Convert LaTeX to speech text (simplified)
    return content
      .replace(/\^{?(\w+)}?/g, ' to the power of $1')
      .replace(/_{?(\w+)}?/g, ' subscript $1')
      .replace(/\\frac{([^}]+)}{([^}]+)}/g, '$1 over $2')
      .replace(/\\sqrt{([^}]+)}/g, 'square root of $1')
      .replace(/\\sum/g, 'sum')
      .replace(/\\int/g, 'integral')
      .replace(/\\pi/g, 'pi')
      .replace(/\\infty/g, 'infinity');
  }

  applyResponsiveAttributes(element) {
    const breakpoint = this.state.currentBreakpoint;
    
    // Add breakpoint class
    element.classList.add(`math-${breakpoint}`);
    
    // Set responsive font size
    const scale = this.getMathScale();
    element.style.fontSize = `${scale}em`;
    
    // Enable touch interactions
    if (this.state.isTouchDevice) {
      element.setAttribute('tabindex', '0');
      element.style.cursor = 'pointer';
      this.addTouchHandlers(element);
    }
  }

  // ============================================
  // RENDERING QUEUE
  // ============================================

  queueForRendering(element) {
    this.state.renderQueue.push(element);
    
    if (!this.state.isRendering) {
      this.processRenderQueue();
    }
  }

  async processRenderQueue() {
    if (this.state.renderQueue.length === 0) {
      this.state.isRendering = false;
      return;
    }
    
    this.state.isRendering = true;
    
    // Process in batches
    const batchSize = this.state.currentBreakpoint === 'mobile' ? 3 : 10;
    const batch = this.state.renderQueue.splice(0, batchSize);
    
    // Render batch
    await this.renderMathBatch(batch);
    
    // Continue processing
    requestAnimationFrame(() => this.processRenderQueue());
  }

  async renderMathBatch(elements) {
    // Check if elements are in viewport
    const visibleElements = elements.filter(el => this.isElementInViewport(el));
    const hiddenElements = elements.filter(el => !this.isElementInViewport(el));
    
    // Render visible elements first
    if (visibleElements.length > 0) {
      await this.renderElements(visibleElements);
    }
    
    // Queue hidden elements for lazy rendering
    hiddenElements.forEach(el => {
      const data = this.state.mathElements.get(el.id);
      if (data) {
        data.viewport = 'hidden';
      }
    });
  }

  async renderElements(elements) {
    // Try MathML first if supported
    if (this.config.rendering.preferMathML && this.state.mathMLSupported) {
      elements.forEach(el => {
        if (this.renderAsMathML(el)) {
          this.markAsRendered(el);
        }
      });
    }
    
    // Use MathJax for remaining elements
    const unrendered = elements.filter(el => {
      const data = this.state.mathElements.get(el.id);
      return data && !data.rendered;
    });
    
    if (unrendered.length > 0 && window.MathJax) {
      try {
        await MathJax.typesetPromise(unrendered);
        unrendered.forEach(el => this.markAsRendered(el));
      } catch (error) {
        console.error('MathJax rendering error:', error);
      }
    }
  }

  renderAsMathML(element) {
    const content = this.extractMathContent(element);
    const mathML = this.convertToMathML(content);
    
    if (mathML) {
      element.innerHTML = mathML;
      return true;
    }
    
    return false;
  }

  convertToMathML(latex) {
    // Basic LaTeX to MathML conversion
    // In production, use a proper converter library
    const conversions = {
      '\\frac{([^}]+)}{([^}]+)}': '<mfrac><mrow>$1</mrow><mrow>$2</mrow></mfrac>',
      '\\sqrt{([^}]+)}': '<msqrt><mrow>$1</mrow></msqrt>',
      '\\sum': '<mo>∑</mo>',
      '\\int': '<mo>∫</mo>',
      '\\pi': '<mi>π</mi>',
      '\\infty': '<mi>∞</mi>',
      '_([^{])': '<msub><mrow></mrow><mrow>$1</mrow></msub>',
      '_{([^}]+)}': '<msub><mrow></mrow><mrow>$1</mrow></msub>',
      '\\^([^{])': '<msup><mrow></mrow><mrow>$1</mrow></msup>',
      '\\^{([^}]+)}': '<msup><mrow></mrow><mrow>$1</mrow></msup>'
    };
    
    let mathML = latex;
    
    // Apply conversions
    Object.entries(conversions).forEach(([pattern, replacement]) => {
      const regex = new RegExp(pattern, 'g');
      mathML = mathML.replace(regex, replacement);
    });
    
    // Wrap in math tags
    return `<math xmlns="http://www.w3.org/1998/Math/MathML">${mathML}</math>`;
  }

  markAsRendered(element) {
    const data = this.state.mathElements.get(element.id);
    if (data) {
      data.rendered = true;
      data.renderTime = Date.now();
    }
    
    element.classList.add('math-rendered');
  }

  // ============================================
  // INTERSECTION OBSERVER
  // ============================================

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        const data = this.state.mathElements.get(element.id);
        
        if (!data) return;
        
        if (entry.isIntersecting) {
          // Element entering viewport
          if (!data.rendered) {
            this.queueForRendering(element);
          }
          data.viewport = 'visible';
        } else {
          // Element leaving viewport
          data.viewport = 'hidden';
        }
      });
    }, options);
    
    // Observe all math elements
    this.state.mathElements.forEach(data => {
      this.observer.observe(data.element);
    });
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

  // ============================================
  // RESPONSIVE UPDATES
  // ============================================

  updateMathScale() {
    const scale = this.getMathScale();
    
    // Update MathJax configuration
    if (window.MathJax) {
      MathJax.config.svg.scale = scale;
      MathJax.config.chtml.scale = scale;
    }
    
    // Update rendered elements
    this.state.mathElements.forEach(data => {
      if (data.rendered) {
        data.element.style.fontSize = `${scale}em`;
      }
    });
  }

  async reRenderAllMath() {
    console.log(`Re-rendering math for ${this.state.currentBreakpoint} breakpoint`);
    
    // Clear render states
    this.state.mathElements.forEach(data => {
      data.rendered = false;
      data.element.classList.remove('math-rendered');
      
      // Update classes
      ['mobile', 'tablet', 'desktop', 'wide'].forEach(bp => {
        data.element.classList.remove(`math-${bp}`);
      });
      data.element.classList.add(`math-${this.state.currentBreakpoint}`);
    });
    
    // Re-render all visible elements
    const visibleElements = Array.from(this.state.mathElements.values())
      .filter(data => data.viewport === 'visible')
      .map(data => data.element);
    
    if (visibleElements.length > 0) {
      await this.renderElements(visibleElements);
    }
  }

  updateFluidTypography() {
    // Calculate fluid font sizes
    const vw = this.state.viewportWidth;
    const minWidth = this.config.breakpoints.mobile;
    const maxWidth = this.config.breakpoints.desktop;
    
    // Clamp viewport width
    const clampedVw = Math.max(minWidth, Math.min(maxWidth, vw));
    
    // Calculate fluid scale
    const minScale = 0.85;
    const maxScale = 1.0;
    const scale = minScale + (maxScale - minScale) * ((clampedVw - minWidth) / (maxWidth - minWidth));
    
    // Apply to math elements
    document.documentElement.style.setProperty('--math-fluid-scale', scale);
  }

  // ============================================
  // TOUCH INTERACTIONS
  // ============================================

  addTouchHandlers(element) {
    let touchStartTime;
    let touchStartPos = { x: 0, y: 0 };
    let lastTapTime = 0;
    
    element.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      touchStartPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }, { passive: true });
    
    element.addEventListener('touchend', (e) => {
      const touchDuration = Date.now() - touchStartTime;
      const touchEndPos = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };
      
      // Calculate movement
      const deltaX = Math.abs(touchEndPos.x - touchStartPos.x);
      const deltaY = Math.abs(touchEndPos.y - touchStartPos.y);
      
      // Tap detection
      if (touchDuration < 300 && deltaX < 10 && deltaY < 10) {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTime;
        
        // Double tap to zoom
        if (timeSinceLastTap < 300) {
          this.handleMathZoom(element);
          lastTapTime = 0;
        } else {
          lastTapTime = now;
          // Single tap - show controls
          this.showMathControls(element);
        }
      }
    });
    
    // Pinch to zoom
    let initialDistance = 0;
    let currentScale = 1;
    
    element.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialDistance = this.getTouchDistance(e.touches);
        currentScale = parseFloat(element.dataset.scale || 1);
      }
    }, { passive: true });
    
    element.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        e.preventDefault();
        const currentDistance = this.getTouchDistance(e.touches);
        const scale = currentScale * (currentDistance / initialDistance);
        
        // Limit scale
        const limitedScale = Math.max(0.5, Math.min(3, scale));
        element.style.transform = `scale(${limitedScale})`;
        element.dataset.scale = limitedScale;
      }
    });
  }

  getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  handleMathZoom(element) {
    const currentScale = parseFloat(element.dataset.scale || 1);
    const newScale = currentScale > 1.5 ? 1 : 2;
    
    element.style.transform = `scale(${newScale})`;
    element.dataset.scale = newScale;
    
    // Smooth transition
    element.style.transition = 'transform 0.3s ease';
    setTimeout(() => {
      element.style.transition = '';
    }, 300);
  }

  showMathControls(element) {
    // Remove existing controls
    this.hideAllMathControls();
    
    const controls = document.createElement('div');
    controls.className = 'math-controls';
    controls.innerHTML = `
      <button class="math-control-btn" data-action="zoom-in" aria-label="Zoom in">🔍+</button>
      <button class="math-control-btn" data-action="zoom-out" aria-label="Zoom out">🔍-</button>
      <button class="math-control-btn" data-action="copy" aria-label="Copy">📋</button>
      <button class="math-control-btn" data-action="speak" aria-label="Read aloud">🔊</button>
    `;
    
    // Position controls
    const wrapper = element.closest('.math-responsive-wrapper');
    wrapper.appendChild(controls);
    
    // Add event handlers
    controls.addEventListener('click', (e) => {
      const btn = e.target.closest('.math-control-btn');
      if (btn) {
        const action = btn.dataset.action;
        this.handleControlAction(element, action);
      }
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => controls.remove(), 5000);
  }

  hideAllMathControls() {
    document.querySelectorAll('.math-controls').forEach(controls => {
      controls.remove();
    });
  }

  handleControlAction(element, action) {
    switch (action) {
      case 'zoom-in':
        const currentScale = parseFloat(element.dataset.scale || 1);
        const newScaleIn = Math.min(3, currentScale * 1.2);
        element.style.transform = `scale(${newScaleIn})`;
        element.dataset.scale = newScaleIn;
        break;
        
      case 'zoom-out':
        const currentScaleOut = parseFloat(element.dataset.scale || 1);
        const newScaleOut = Math.max(0.5, currentScaleOut / 1.2);
        element.style.transform = `scale(${newScaleOut})`;
        element.dataset.scale = newScaleOut;
        break;
        
      case 'copy':
        this.copyMathContent(element);
        break;
        
      case 'speak':
        this.speakMathContent(element);
        break;
    }
  }

  copyMathContent(element) {
    const content = this.extractMathContent(element);
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content).then(() => {
        this.showToast('Math expression copied!');
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    }
  }

  speakMathContent(element) {
    if (!('speechSynthesis' in window)) return;
    
    const content = this.generateAriaLabel(element);
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'math-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // ============================================
  // SVG DIAGRAM SUPPORT
  // ============================================

  processSVGDiagrams() {
    const svgElements = document.querySelectorAll('svg.math-diagram, [data-math-diagram]');
    
    svgElements.forEach(svg => {
      this.makeResponsiveSVG(svg);
    });
  }

  makeResponsiveSVG(svg) {
    // Remove fixed dimensions
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    
    // Add viewBox if missing
    if (!svg.hasAttribute('viewBox')) {
      const bbox = svg.getBBox();
      svg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    }
    
    // Add responsive wrapper
    if (!svg.parentElement.classList.contains('svg-responsive-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'svg-responsive-wrapper';
      svg.parentNode.insertBefore(wrapper, svg);
      wrapper.appendChild(svg);
    }
    
    // Add responsive classes
    svg.classList.add('math-diagram-responsive');
    
    // Enable pan and zoom for complex diagrams
    if (svg.querySelectorAll('*').length > 20) {
      this.enableSVGPanZoom(svg);
    }
  }

  enableSVGPanZoom(svg) {
    let isPanning = false;
    let startPoint = { x: 0, y: 0 };
    let viewBox = svg.viewBox.baseVal;
    
    svg.addEventListener('mousedown', (e) => {
      isPanning = true;
      startPoint = { x: e.clientX, y: e.clientY };
      svg.style.cursor = 'grabbing';
    });
    
    svg.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      
      const dx = (startPoint.x - e.clientX) * viewBox.width / svg.clientWidth;
      const dy = (startPoint.y - e.clientY) * viewBox.height / svg.clientHeight;
      
      viewBox.x += dx;
      viewBox.y += dy;
      
      startPoint = { x: e.clientX, y: e.clientY };
    });
    
    svg.addEventListener('mouseup', () => {
      isPanning = false;
      svg.style.cursor = 'grab';
    });
    
    // Mouse wheel zoom
    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      const scale = e.deltaY > 0 ? 1.1 : 0.9;
      const point = this.getSVGPoint(svg, e);
      
      viewBox.x = point.x - (point.x - viewBox.x) * scale;
      viewBox.y = point.y - (point.y - viewBox.y) * scale;
      viewBox.width *= scale;
      viewBox.height *= scale;
    });
    
    svg.style.cursor = 'grab';
  }

  getSVGPoint(svg, event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }

  // ============================================
  // POST-PROCESSING
  // ============================================

  postProcessMath() {
    // Add responsive features to MathJax output
    const mathJaxElements = document.querySelectorAll('mjx-container, .MathJax');
    
    mathJaxElements.forEach(element => {
      // Ensure proper attributes
      if (!element.id) {
        element.id = `mathjax-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Add to tracking if not already tracked
      if (!this.state.mathElements.has(element.id)) {
        this.processMathElement(element);
      }
      
      // Add responsive features
      this.addResponsiveFeatures(element);
    });
  }

  addResponsiveFeatures(element) {
    // Make focusable for keyboard navigation
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
    
    // Add keyboard navigation
    element.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          this.showMathControls(element);
          e.preventDefault();
          break;
        case '+':
        case '=':
          this.handleControlAction(element, 'zoom-in');
          e.preventDefault();
          break;
        case '-':
        case '_':
          this.handleControlAction(element, 'zoom-out');
          e.preventDefault();
          break;
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            this.copyMathContent(element);
          }
          break;
      }
    });
    
    // High contrast mode adjustments
    if (this.config.accessibility.contrastMode) {
      element.classList.add('high-contrast');
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================

  refresh() {
    // Re-scan for new math content
    const newElements = this.findMathElements();
    
    newElements.forEach(element => {
      if (!this.state.mathElements.has(element.id)) {
        this.processMathElement(element);
      }
    });
  }

  setBreakpoint(breakpoint) {
    if (this.config.breakpoints[breakpoint]) {
      this.state.currentBreakpoint = breakpoint;
      this.updateMathScale();
      this.reRenderAllMath();
    }
  }

  enableAccessibilityMode(mode, enabled) {
    this.config.accessibility[mode] = enabled;
    
    if (mode === 'contrastMode') {
      document.body.classList.toggle('math-high-contrast', enabled);
    }
  }

  getStatistics() {
    return {
      totalElements: this.state.mathElements.size,
      renderedElements: Array.from(this.state.mathElements.values()).filter(d => d.rendered).length,
      currentBreakpoint: this.state.currentBreakpoint,
      mathScale: this.getMathScale(),
      cacheSize: this.cache.size
    };
  }

  destroy() {
    // Clean up observers
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleViewportChange);
    window.removeEventListener('orientationchange', this.handleViewportChange);
    
    // Clear state
    this.state.mathElements.clear();
    this.cache.clear();
  }

  // ============================================
  // STYLES
  // ============================================

  injectStyles() {
    if (document.getElementById('responsive-math-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'responsive-math-styles';
    style.textContent = `
      /* Base responsive math styles */
      .math-responsive-wrapper {
        position: relative;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        max-width: 100%;
        margin: 1rem 0;
      }
      
      .math-wrapper-inline {
        display: inline-block;
        vertical-align: middle;
        margin: 0 0.25em;
      }
      
      .math-wrapper-display {
        display: block;
        text-align: center;
        margin: 1.5rem 0;
        padding: 1rem;
      }
      
      /* Responsive typography */
      .math-mobile {
        font-size: 0.85em;
      }
      
      .math-tablet {
        font-size: 0.95em;
      }
      
      .math-desktop {
        font-size: 1em;
      }
      
      .math-wide {
        font-size: 1.1em;
      }
      
      /* Fluid typography */
      @media screen and (min-width: ${this.config.breakpoints.mobile}px) and (max-width: ${this.config.breakpoints.desktop}px) {
        .math-responsive-wrapper {
          font-size: calc(0.85rem + 0.15 * ((100vw - ${this.config.breakpoints.mobile}px) / (${this.config.breakpoints.desktop} - ${this.config.breakpoints.mobile})));
        }
      }
      
      /* Touch interactions */
      .math-responsive-wrapper[tabindex]:focus {
        outline: 2px solid #007aff;
        outline-offset: 2px;
      }
      
      .math-responsive-wrapper.touch-active {
        background: rgba(0, 122, 255, 0.1);
      }
      
      /* Math controls */
      .math-controls {
        position: absolute;
        top: -40px;
        right: 0;
        display: flex;
        gap: 4px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 20px;
        padding: 4px;
        z-index: 100;
      }
      
      .math-control-btn {
        width: 32px;
        height: 32px;
        background: transparent;
        border: none;
        color: white;
        font-size: 16px;
        border-radius: 16px;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .math-control-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      /* Toast notifications */
      .math-toast {
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
      
      .math-toast.show {
        transform: translateX(-50%) translateY(0);
      }
      
      /* SVG diagrams */
      .svg-responsive-wrapper {
        position: relative;
        width: 100%;
        padding-bottom: 75%; /* 4:3 aspect ratio */
        height: 0;
        overflow: hidden;
      }
      
      .svg-responsive-wrapper svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      
      .math-diagram-responsive {
        max-width: 100%;
        height: auto;
      }
      
      /* Scrollbar styling */
      .math-responsive-wrapper::-webkit-scrollbar {
        height: 8px;
      }
      
      .math-responsive-wrapper::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
      
      .math-responsive-wrapper::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      
      .math-responsive-wrapper::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      
      /* High contrast mode */
      .math-high-contrast .math-responsive-wrapper {
        background: white;
        color: black;
        border: 2px solid black;
      }
      
      .math-high-contrast .MathJax,
      .math-high-contrast mjx-container {
        filter: contrast(2) brightness(1.2);
      }
      
      /* Print styles */
      @media print {
        .math-responsive-wrapper {
          overflow: visible;
          page-break-inside: avoid;
        }
        
        .math-controls {
          display: none;
        }
        
        .math-responsive-wrapper[data-scale] {
          transform: none !important;
        }
      }
      
      /* Loading states */
      .math-loading {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        min-height: 2em;
        border-radius: 4px;
      }
      
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Responsive tables for matrices */
      .math-matrix-wrapper {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      .math-matrix-wrapper table {
        min-width: 100%;
        border-collapse: collapse;
      }
      
      /* Mobile-specific adjustments */
      @media (max-width: ${this.config.breakpoints.tablet}px) {
        .math-wrapper-display {
          padding: 0.5rem;
          margin: 1rem -1rem;
          background: #f8f9fa;
        }
        
        .math-responsive-wrapper {
          font-size: 0.9em;
        }
        
        /* Larger touch targets */
        .math-responsive-wrapper[tabindex] {
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
      
      /* Landscape orientation adjustments */
      @media (orientation: landscape) and (max-height: 500px) {
        .math-wrapper-display {
          margin: 0.5rem 0;
          padding: 0.5rem;
        }
        
        .math-responsive-wrapper {
          font-size: 0.85em;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.responsiveMath = new ResponsiveMathRenderer();
  });
} else {
  window.responsiveMath = new ResponsiveMathRenderer();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponsiveMathRenderer;
}