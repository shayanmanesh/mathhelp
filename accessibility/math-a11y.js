// Math Accessibility System
// Comprehensive accessibility features for mathematical content

class MathAccessibility {
  constructor() {
    this.config = {
      // MathML support detection
      mathMLSupported: this.checkMathMLSupport(),
      
      // Screen reader preferences
      screenReader: {
        verbosity: 'verbose', // 'terse', 'verbose', 'descriptive'
        language: 'en',
        mathSpeakStyle: 'default', // 'default', 'brief', 'sbrief'
        chemSpeakEnabled: false
      },
      
      // Keyboard navigation
      keyboard: {
        enabled: true,
        shortcuts: this.getDefaultShortcuts(),
        customShortcuts: {}
      },
      
      // Visual preferences
      visual: {
        highContrast: false,
        fontSize: 'medium',
        lineSpacing: 'normal',
        mathScale: 1.0
      },
      
      // Interaction preferences
      interaction: {
        tooltipsEnabled: true,
        hoverDelay: 500,
        focusIndicatorStyle: 'default'
      }
    };
    
    this.init();
  }

  init() {
    this.setupMathJaxAccessibility();
    this.setupKeyboardNavigation();
    this.setupScreenReaderSupport();
    this.setupVisualEnhancements();
    this.setupInteractionHandlers();
    this.loadUserPreferences();
  }

  // ============================================
  // MATHJAX ACCESSIBILITY CONFIGURATION
  // ============================================

  setupMathJaxAccessibility() {
    if (window.MathJax) {
      window.MathJax = {
        ...window.MathJax,
        options: {
          ...window.MathJax.options,
          renderActions: {
            addMenu: [0, '', ''],
            addMathML: [170, 'addMathML', 'addMathML'],
            addDescriptions: [180, 'addDescriptions', 'addDescriptions']
          },
          menuOptions: {
            settings: {
              assistiveMml: true,
              collapsible: true,
              explorer: true,
              zoom: 'DoubleClick',
              zoomScale: 200
            }
          }
        },
        a11y: {
          speech: true,
          braille: true,
          subtitles: true,
          magnification: true,
          semantic: true,
          complexity: true,
          collapse: true,
          explorer: {
            walker: true,
            highlight: 'flame',
            background: 'blue',
            foreground: 'black',
            speech: true,
            generation: 'lazy',
            subtitle: true,
            ruleset: 'mathspeak-default'
          }
        },
        sre: {
          speech: {
            domain: 'mathspeak',
            style: 'default',
            locale: 'en'
          },
          braille: {
            format: 'nemeth',
            locale: 'en'
          },
          walker: {
            highlight: true,
            speech: true,
            move: true,
            expand: true
          }
        }
      };
    }
  }

  // ============================================
  // MATHML SUPPORT
  // ============================================

  checkMathMLSupport() {
    const div = document.createElement('div');
    div.innerHTML = '<math><mrow><mn>1</mn></mrow></math>';
    document.body.appendChild(div);
    const supported = div.firstChild && div.firstChild.firstChild && 
                     div.firstChild.firstChild.namespaceURI === 'http://www.w3.org/1998/Math/MathML';
    document.body.removeChild(div);
    return supported;
  }

  generateMathML(latex) {
    // Convert LaTeX to MathML for screen readers
    const mathML = {
      // Basic expressions
      'x^2': '<math><msup><mi>x</mi><mn>2</mn></msup></math>',
      '\\frac{a}{b}': '<math><mfrac><mi>a</mi><mi>b</mi></mfrac></math>',
      '\\sqrt{x}': '<math><msqrt><mi>x</mi></msqrt></math>',
      '\\sum_{i=1}^{n}': '<math><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover></math>',
      '\\int_{a}^{b}': '<math><msubsup><mo>∫</mo><mi>a</mi><mi>b</mi></msubsup></math>'
    };
    
    return mathML[latex] || this.convertLatexToMathML(latex);
  }

  convertLatexToMathML(latex) {
    // Complex LaTeX to MathML conversion
    // This would integrate with MathJax's toMathML functionality
    if (window.MathJax && window.MathJax.tex2mml) {
      return window.MathJax.tex2mml(latex);
    }
    
    // Fallback: Basic conversion
    return `<math><mtext>${latex}</mtext></math>`;
  }

  // ============================================
  // SCREEN READER SUPPORT
  // ============================================

  setupScreenReaderSupport() {
    // Add ARIA live regions for dynamic content
    this.createAriaLiveRegions();
    
    // Enhance math expressions with descriptions
    this.enhanceMathExpressions();
    
    // Setup speech synthesis for math reading
    this.setupMathSpeech();
  }

  createAriaLiveRegions() {
    // Status region for general announcements
    if (!document.getElementById('math-status')) {
      const status = document.createElement('div');
      status.id = 'math-status';
      status.className = 'sr-only';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.setAttribute('aria-atomic', 'true');
      document.body.appendChild(status);
    }
    
    // Alert region for important announcements
    if (!document.getElementById('math-alert')) {
      const alert = document.createElement('div');
      alert.id = 'math-alert';
      alert.className = 'sr-only';
      alert.setAttribute('role', 'alert');
      alert.setAttribute('aria-live', 'assertive');
      alert.setAttribute('aria-atomic', 'true');
      document.body.appendChild(alert);
    }
  }

  enhanceMathExpressions() {
    const expressions = document.querySelectorAll('.math-expression, .MathJax');
    
    expressions.forEach(expr => {
      if (!expr.hasAttribute('role')) {
        expr.setAttribute('role', 'math');
        expr.setAttribute('tabindex', '0');
        
        // Add aria-label with readable description
        const latex = expr.getAttribute('data-latex') || expr.textContent;
        const description = this.generateMathDescription(latex);
        expr.setAttribute('aria-label', description);
        
        // Add MathML alternative
        if (this.config.mathMLSupported) {
          const mathML = this.generateMathML(latex);
          expr.setAttribute('aria-describedby', `mathml-${this.generateId()}`);
          
          const mathMLElement = document.createElement('div');
          mathMLElement.id = expr.getAttribute('aria-describedby');
          mathMLElement.className = 'sr-only';
          mathMLElement.innerHTML = mathML;
          expr.appendChild(mathMLElement);
        }
      }
    });
  }

  generateMathDescription(latex) {
    // Convert LaTeX to spoken mathematics
    const descriptions = {
      // Arithmetic
      '+': 'plus',
      '-': 'minus',
      '*': 'times',
      '/': 'divided by',
      '=': 'equals',
      '!=': 'not equals',
      '<': 'less than',
      '>': 'greater than',
      '<=': 'less than or equal to',
      '>=': 'greater than or equal to',
      
      // Algebra
      'x^2': 'x squared',
      'x^3': 'x cubed',
      'x^n': 'x to the power of n',
      '\\sqrt{x}': 'square root of x',
      '\\sqrt[3]{x}': 'cube root of x',
      '\\frac{a}{b}': 'a over b',
      
      // Calculus
      '\\lim': 'limit',
      '\\sum': 'sum',
      '\\int': 'integral',
      '\\partial': 'partial derivative',
      '\\infty': 'infinity',
      
      // Greek letters
      '\\alpha': 'alpha',
      '\\beta': 'beta',
      '\\gamma': 'gamma',
      '\\delta': 'delta',
      '\\pi': 'pi',
      '\\theta': 'theta'
    };
    
    let description = latex;
    
    // Replace known patterns
    Object.entries(descriptions).forEach(([pattern, spoken]) => {
      description = description.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), spoken);
    });
    
    // Handle complex patterns
    description = this.processComplexPatterns(description);
    
    return description;
  }

  processComplexPatterns(latex) {
    // Handle fractions
    latex = latex.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2');
    
    // Handle exponents
    latex = latex.replace(/\^{([^}]+)}/g, ' to the power of $1');
    latex = latex.replace(/\^(\d+)/g, ' to the power of $1');
    
    // Handle subscripts
    latex = latex.replace(/_{([^}]+)}/g, ' subscript $1');
    latex = latex.replace(/_(\d+)/g, ' subscript $1');
    
    // Handle roots
    latex = latex.replace(/\\sqrt\[(\d+)\]\{([^}]+)\}/g, '$1-th root of $2');
    latex = latex.replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1');
    
    // Handle integrals
    latex = latex.replace(/\\int_{([^}]+)}\^{([^}]+)}/g, 'integral from $1 to $2');
    
    // Handle sums
    latex = latex.replace(/\\sum_{([^}]+)}\^{([^}]+)}/g, 'sum from $1 to $2');
    
    return latex;
  }

  setupMathSpeech() {
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
      this.loadVoices();
      
      // Listen for voice changes
      this.speechSynthesis.addEventListener('voiceschanged', () => {
        this.loadVoices();
      });
    }
  }

  loadVoices() {
    this.voices = this.speechSynthesis.getVoices();
    this.mathVoice = this.voices.find(voice => 
      voice.lang.startsWith(this.config.screenReader.language)
    ) || this.voices[0];
  }

  speakMath(text, options = {}) {
    if (!this.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.mathVoice;
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    
    this.speechSynthesis.speak(utterance);
  }

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================

  setupKeyboardNavigation() {
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    
    // Add keyboard hints to interactive elements
    this.addKeyboardHints();
  }

  getDefaultShortcuts() {
    return {
      // Navigation
      'ArrowLeft': 'navigateLeft',
      'ArrowRight': 'navigateRight',
      'ArrowUp': 'navigateUp',
      'ArrowDown': 'navigateDown',
      'Home': 'navigateStart',
      'End': 'navigateEnd',
      
      // Exploration
      'Enter': 'explore',
      'Space': 'toggleExpansion',
      'Escape': 'exitExploration',
      
      // Reading
      'r': 'readExpression',
      'R': 'readExpressionVerbose',
      'd': 'describeExpression',
      
      // Interaction
      'h': 'showHelp',
      'm': 'showMathMenu',
      'c': 'copyExpression',
      's': 'toggleSpeech',
      
      // Zoom
      '+': 'zoomIn',
      '-': 'zoomOut',
      '0': 'zoomReset'
    };
  }

  handleKeyboardNavigation(event) {
    if (!this.config.keyboard.enabled) return;
    
    const target = event.target;
    const isMathElement = target.matches('.math-expression, .MathJax, [role="math"]');
    
    if (!isMathElement) return;
    
    const shortcut = this.config.keyboard.shortcuts[event.key];
    const customShortcut = this.config.keyboard.customShortcuts[event.key];
    
    const action = customShortcut || shortcut;
    
    if (action && this[action]) {
      event.preventDefault();
      this[action](target);
    }
  }

  // Navigation actions
  navigateLeft(element) {
    this.navigateMathElement(element, 'left');
  }

  navigateRight(element) {
    this.navigateMathElement(element, 'right');
  }

  navigateUp(element) {
    this.navigateMathElement(element, 'up');
  }

  navigateDown(element) {
    this.navigateMathElement(element, 'down');
  }

  navigateMathElement(element, direction) {
    // Use MathJax explorer if available
    if (window.MathJax && window.MathJax.explorer) {
      window.MathJax.explorer.Move(direction);
      return;
    }
    
    // Fallback navigation
    const parts = this.getMathParts(element);
    const currentIndex = parseInt(element.getAttribute('data-math-index')) || 0;
    
    let newIndex;
    switch (direction) {
      case 'left':
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case 'right':
        newIndex = Math.min(parts.length - 1, currentIndex + 1);
        break;
      case 'up':
        newIndex = this.findParentIndex(parts, currentIndex);
        break;
      case 'down':
        newIndex = this.findChildIndex(parts, currentIndex);
        break;
    }
    
    if (newIndex !== currentIndex) {
      element.setAttribute('data-math-index', newIndex);
      this.highlightMathPart(element, parts[newIndex]);
      this.announceMathPart(parts[newIndex]);
    }
  }

  getMathParts(element) {
    // Parse math expression into navigable parts
    const parts = [];
    
    // This would integrate with MathJax's semantic tree
    // For now, simple tokenization
    const tokens = element.textContent.match(/[a-zA-Z]+|\d+|[+\-*/=<>()[\]{}]|\\[a-zA-Z]+/g) || [];
    
    tokens.forEach((token, index) => {
      parts.push({
        type: this.getTokenType(token),
        value: token,
        index: index,
        parent: null,
        children: []
      });
    });
    
    return parts;
  }

  getTokenType(token) {
    if (/^\d+$/.test(token)) return 'number';
    if (/^[a-zA-Z]$/.test(token)) return 'variable';
    if (/^[+\-*/=<>]$/.test(token)) return 'operator';
    if (/^[()[\]{}]$/.test(token)) return 'delimiter';
    if (/^\\[a-zA-Z]+$/.test(token)) return 'command';
    return 'unknown';
  }

  highlightMathPart(element, part) {
    // Remove existing highlights
    element.querySelectorAll('.math-highlight').forEach(el => {
      el.classList.remove('math-highlight');
    });
    
    // Add new highlight
    // This would integrate with MathJax's highlighting
    const highlight = document.createElement('span');
    highlight.className = 'math-highlight';
    highlight.style.backgroundColor = 'rgba(52, 152, 219, 0.3)';
    highlight.style.outline = '2px solid #3498db';
    
    // Wrap the part in highlight
    // Simplified - actual implementation would use MathJax API
    element.innerHTML = element.innerHTML.replace(
      part.value,
      `<span class="math-highlight">${part.value}</span>`
    );
  }

  announceMathPart(part) {
    const description = this.describeMathPart(part);
    this.announce(description);
  }

  describeMathPart(part) {
    const typeDescriptions = {
      number: 'number',
      variable: 'variable',
      operator: 'operator',
      delimiter: 'delimiter',
      command: 'command'
    };
    
    const type = typeDescriptions[part.type] || part.type;
    const value = this.generateMathDescription(part.value);
    
    return `${type}: ${value}`;
  }

  explore(element) {
    // Enter exploration mode
    element.classList.add('math-exploring');
    this.announce('Entering math exploration mode. Use arrow keys to navigate.');
  }

  exitExploration(element) {
    // Exit exploration mode
    element.classList.remove('math-exploring');
    this.announce('Exiting math exploration mode.');
  }

  readExpression(element) {
    const description = element.getAttribute('aria-label') || 
                       this.generateMathDescription(element.textContent);
    this.speakMath(description);
  }

  readExpressionVerbose(element) {
    const description = this.generateVerboseDescription(element);
    this.speakMath(description, { rate: 0.8 });
  }

  generateVerboseDescription(element) {
    // Generate detailed description with structure
    const latex = element.getAttribute('data-latex') || element.textContent;
    let description = `Mathematical expression: ${this.generateMathDescription(latex)}. `;
    
    // Add structure information
    const structure = this.analyzeMathStructure(latex);
    description += `This expression contains ${structure.join(', ')}.`;
    
    return description;
  }

  analyzeMathStructure(latex) {
    const structures = [];
    
    if (latex.includes('\\frac')) structures.push('fractions');
    if (latex.includes('^')) structures.push('exponents');
    if (latex.includes('_')) structures.push('subscripts');
    if (latex.includes('\\sqrt')) structures.push('roots');
    if (latex.includes('\\sum')) structures.push('summations');
    if (latex.includes('\\int')) structures.push('integrals');
    if (latex.includes('\\lim')) structures.push('limits');
    
    return structures.length ? structures : ['simple terms'];
  }

  // ============================================
  // VISUAL ENHANCEMENTS
  // ============================================

  setupVisualEnhancements() {
    // Apply high contrast if needed
    this.applyHighContrast();
    
    // Setup focus indicators
    this.setupFocusIndicators();
    
    // Setup hover effects
    this.setupHoverEffects();
  }

  applyHighContrast() {
    if (this.config.visual.highContrast || 
        window.matchMedia('(prefers-contrast: high)').matches) {
      document.body.classList.add('high-contrast-math');
      this.updateMathColors(true);
    }
  }

  updateMathColors(highContrast) {
    const root = document.documentElement;
    
    if (highContrast) {
      // Apply high contrast colors from design tokens
      root.style.setProperty('--color-expression-variable', '#00ff00');
      root.style.setProperty('--color-expression-constant', '#ffffff');
      root.style.setProperty('--color-expression-operator', '#ffffff');
      root.style.setProperty('--color-expression-function', '#ffff00');
      root.style.setProperty('--color-expression-delimiter', '#ffffff');
    } else {
      // Reset to default colors
      root.style.removeProperty('--color-expression-variable');
      root.style.removeProperty('--color-expression-constant');
      root.style.removeProperty('--color-expression-operator');
      root.style.removeProperty('--color-expression-function');
      root.style.removeProperty('--color-expression-delimiter');
    }
  }

  setupFocusIndicators() {
    // Add custom focus styles for math elements
    const style = document.createElement('style');
    style.textContent = `
      .math-expression:focus,
      .MathJax:focus,
      [role="math"]:focus {
        outline: 3px solid var(--color-border-focus);
        outline-offset: 2px;
        border-radius: var(--radius-md);
      }
      
      .math-expression:focus-visible,
      .MathJax:focus-visible,
      [role="math"]:focus-visible {
        outline: 3px solid var(--color-border-focus);
        outline-offset: 4px;
        box-shadow: var(--shadow-focus-default);
      }
      
      .high-contrast-math .math-expression:focus,
      .high-contrast-math .MathJax:focus,
      .high-contrast-math [role="math"]:focus {
        outline-color: #00ffff;
        outline-width: 4px;
      }
    `;
    document.head.appendChild(style);
  }

  setupHoverEffects() {
    if (!this.config.interaction.tooltipsEnabled) return;
    
    document.addEventListener('mouseover', (event) => {
      const target = event.target;
      if (target.matches('.math-expression, .MathJax, [role="math"]')) {
        this.showMathTooltip(target);
      }
    });
    
    document.addEventListener('mouseout', (event) => {
      const target = event.target;
      if (target.matches('.math-expression, .MathJax, [role="math"]')) {
        this.hideMathTooltip();
      }
    });
  }

  showMathTooltip(element) {
    clearTimeout(this.tooltipTimeout);
    
    this.tooltipTimeout = setTimeout(() => {
      const tooltip = this.createMathTooltip(element);
      document.body.appendChild(tooltip);
      
      // Position tooltip
      const rect = element.getBoundingClientRect();
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.top = `${rect.bottom + 5}px`;
      
      // Ensure tooltip is visible
      const tooltipRect = tooltip.getBoundingClientRect();
      if (tooltipRect.right > window.innerWidth) {
        tooltip.style.left = `${window.innerWidth - tooltipRect.width - 10}px`;
      }
      
      tooltip.classList.add('visible');
    }, this.config.interaction.hoverDelay);
  }

  createMathTooltip(element) {
    const tooltip = document.createElement('div');
    tooltip.className = 'math-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.id = `tooltip-${this.generateId()}`;
    
    const description = element.getAttribute('aria-label') || 
                       this.generateMathDescription(element.textContent);
    
    tooltip.innerHTML = `
      <div class="tooltip-content">
        <div class="tooltip-header">Math Expression</div>
        <div class="tooltip-description">${description}</div>
        <div class="tooltip-hint">Press Enter to explore</div>
      </div>
    `;
    
    element.setAttribute('aria-describedby', tooltip.id);
    
    return tooltip;
  }

  hideMathTooltip() {
    clearTimeout(this.tooltipTimeout);
    
    const tooltip = document.querySelector('.math-tooltip');
    if (tooltip) {
      tooltip.classList.remove('visible');
      setTimeout(() => tooltip.remove(), 300);
    }
  }

  // ============================================
  // INTERACTION HANDLERS
  // ============================================

  setupInteractionHandlers() {
    // Copy math expressions
    this.setupCopyHandlers();
    
    // Context menu for math
    this.setupContextMenu();
    
    // Gesture support
    this.setupGestureSupport();
  }

  setupCopyHandlers() {
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        const activeElement = document.activeElement;
        if (activeElement.matches('.math-expression, .MathJax, [role="math"]')) {
          this.copyMathExpression(activeElement);
        }
      }
    });
  }

  copyMathExpression(element) {
    const latex = element.getAttribute('data-latex') || element.textContent;
    const mathML = this.generateMathML(latex);
    
    // Copy both LaTeX and MathML formats
    if (navigator.clipboard) {
      const clipboardData = new ClipboardEvent('copy').clipboardData || new DataTransfer();
      clipboardData.setData('text/plain', latex);
      clipboardData.setData('text/html', mathML);
      clipboardData.setData('application/mathml+xml', mathML);
      
      navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([latex], { type: 'text/plain' }),
          'text/html': new Blob([mathML], { type: 'text/html' }),
          'application/mathml+xml': new Blob([mathML], { type: 'application/mathml+xml' })
        })
      ]).then(() => {
        this.announce('Math expression copied to clipboard');
      });
    }
  }

  setupContextMenu() {
    document.addEventListener('contextmenu', (event) => {
      const target = event.target;
      if (target.matches('.math-expression, .MathJax, [role="math"]')) {
        event.preventDefault();
        this.showMathContextMenu(event, target);
      }
    });
  }

  showMathContextMenu(event, element) {
    // Remove existing menu
    const existingMenu = document.querySelector('.math-context-menu');
    if (existingMenu) existingMenu.remove();
    
    const menu = document.createElement('div');
    menu.className = 'math-context-menu';
    menu.setAttribute('role', 'menu');
    
    const menuItems = [
      { label: 'Copy LaTeX', action: () => this.copyLatex(element) },
      { label: 'Copy MathML', action: () => this.copyMathML(element) },
      { label: 'Read Aloud', action: () => this.readExpression(element) },
      { label: 'Show Steps', action: () => this.showSteps(element) },
      { label: 'Zoom In', action: () => this.zoomMath(element, 1.2) },
      { label: 'Zoom Out', action: () => this.zoomMath(element, 0.8) },
      { divider: true },
      { label: 'Math Settings', action: () => this.showMathSettings() }
    ];
    
    menuItems.forEach(item => {
      if (item.divider) {
        const divider = document.createElement('div');
        divider.className = 'menu-divider';
        menu.appendChild(divider);
      } else {
        const menuItem = document.createElement('button');
        menuItem.className = 'menu-item';
        menuItem.setAttribute('role', 'menuitem');
        menuItem.textContent = item.label;
        menuItem.onclick = () => {
          item.action();
          menu.remove();
        };
        menu.appendChild(menuItem);
      }
    });
    
    document.body.appendChild(menu);
    
    // Position menu
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    
    // Close on outside click
    document.addEventListener('click', () => menu.remove(), { once: true });
  }

  setupGestureSupport() {
    // Pinch to zoom for math expressions
    let initialDistance = 0;
    let initialScale = 1;
    
    document.addEventListener('touchstart', (event) => {
      if (event.touches.length === 2) {
        const target = event.target;
        if (target.matches('.math-expression, .MathJax, [role="math"]')) {
          initialDistance = this.getDistance(event.touches[0], event.touches[1]);
          initialScale = parseFloat(target.style.transform?.match(/scale\(([\d.]+)\)/)?.[1] || 1);
        }
      }
    });
    
    document.addEventListener('touchmove', (event) => {
      if (event.touches.length === 2 && initialDistance > 0) {
        const target = event.target;
        if (target.matches('.math-expression, .MathJax, [role="math"]')) {
          const currentDistance = this.getDistance(event.touches[0], event.touches[1]);
          const scale = (currentDistance / initialDistance) * initialScale;
          target.style.transform = `scale(${Math.max(0.5, Math.min(3, scale))})`;
        }
      }
    });
  }

  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  announce(message, priority = 'polite') {
    const liveRegion = priority === 'assertive' ? 
                      document.getElementById('math-alert') : 
                      document.getElementById('math-status');
    
    if (liveRegion) {
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  generateId() {
    return `math-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  zoomMath(element, scale) {
    const currentScale = parseFloat(element.style.transform?.match(/scale\(([\d.]+)\)/)?.[1] || 1);
    const newScale = currentScale * scale;
    element.style.transform = `scale(${Math.max(0.5, Math.min(3, newScale))})`;
  }

  showMathSettings() {
    // Show accessibility settings dialog
    const dialog = document.createElement('dialog');
    dialog.className = 'math-settings-dialog';
    dialog.innerHTML = `
      <h2>Math Accessibility Settings</h2>
      <form>
        <fieldset>
          <legend>Screen Reader</legend>
          <label>
            <input type="radio" name="verbosity" value="terse"> Terse
          </label>
          <label>
            <input type="radio" name="verbosity" value="verbose" checked> Verbose
          </label>
          <label>
            <input type="radio" name="verbosity" value="descriptive"> Descriptive
          </label>
        </fieldset>
        
        <fieldset>
          <legend>Visual</legend>
          <label>
            <input type="checkbox" name="highContrast"> High Contrast
          </label>
          <label>
            Math Scale: <input type="range" name="mathScale" min="0.5" max="2" step="0.1" value="1">
          </label>
        </fieldset>
        
        <fieldset>
          <legend>Interaction</legend>
          <label>
            <input type="checkbox" name="tooltips" checked> Show Tooltips
          </label>
          <label>
            <input type="checkbox" name="speech" checked> Enable Speech
          </label>
        </fieldset>
        
        <div class="dialog-actions">
          <button type="button" class="cancel">Cancel</button>
          <button type="submit" class="save">Save Settings</button>
        </div>
      </form>
    `;
    
    document.body.appendChild(dialog);
    dialog.showModal();
    
    // Handle form submission
    dialog.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      this.saveSettings(new FormData(event.target));
      dialog.close();
    });
    
    // Handle cancel
    dialog.querySelector('.cancel').addEventListener('click', () => {
      dialog.close();
    });
    
    // Clean up on close
    dialog.addEventListener('close', () => {
      dialog.remove();
    });
  }

  saveSettings(formData) {
    // Update configuration
    this.config.screenReader.verbosity = formData.get('verbosity');
    this.config.visual.highContrast = formData.get('highContrast') === 'on';
    this.config.visual.mathScale = parseFloat(formData.get('mathScale'));
    this.config.interaction.tooltipsEnabled = formData.get('tooltips') === 'on';
    
    // Apply changes
    this.applySettings();
    
    // Save to localStorage
    localStorage.setItem('mathA11ySettings', JSON.stringify(this.config));
    
    this.announce('Settings saved');
  }

  applySettings() {
    // Apply visual settings
    if (this.config.visual.highContrast) {
      document.body.classList.add('high-contrast-math');
      this.updateMathColors(true);
    } else {
      document.body.classList.remove('high-contrast-math');
      this.updateMathColors(false);
    }
    
    // Apply math scale
    document.documentElement.style.setProperty('--math-scale', this.config.visual.mathScale);
  }

  loadUserPreferences() {
    const saved = localStorage.getItem('mathA11ySettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        Object.assign(this.config, settings);
        this.applySettings();
      } catch (e) {
        console.error('Failed to load accessibility settings:', e);
      }
    }
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mathAccessibility = new MathAccessibility();
  });
} else {
  window.mathAccessibility = new MathAccessibility();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathAccessibility;
}