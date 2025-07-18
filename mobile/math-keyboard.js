// Touch-Optimized Math Keyboard Component
// Custom keyboard with symbol support and contextual switching

class MathKeyboard {
  constructor(options = {}) {
    this.config = {
      minTouchSize: 44, // iOS HIG minimum
      hapticFeedback: options.hapticFeedback !== false,
      soundFeedback: options.soundFeedback || false,
      theme: options.theme || 'light',
      position: options.position || 'bottom',
      animationDuration: 200,
      swipeThreshold: 50,
      longPressDelay: 500,
      contextual: options.contextual !== false
    };
    
    this.state = {
      isVisible: false,
      activeInput: null,
      currentLayout: 'numbers',
      capsLock: false,
      recentSymbols: [],
      customSymbols: [],
      history: [],
      cursorPosition: 0
    };
    
    this.layouts = this.defineLayouts();
    this.gestures = new Map();
    this.soundPool = null;
    
    this.init();
  }

  init() {
    this.createKeyboard();
    this.setupEventListeners();
    this.setupGestures();
    this.loadUserPreferences();
    this.injectStyles();
    
    if (this.config.soundFeedback) {
      this.initializeSounds();
    }
  }

  // ============================================
  // KEYBOARD LAYOUTS
  // ============================================

  defineLayouts() {
    return {
      numbers: {
        name: 'Numbers',
        rows: [
          ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
          ['(', ')', '[', ']', '{', '}', '<', '>', '=', '≠'],
          ['+', '-', '×', '÷', '^', '√', '!', '%', '±', 'π'],
          ['ABC', ',', '.', 'space', 'symbols', '⌫', '⏎']
        ]
      },
      
      letters: {
        name: 'Letters',
        rows: [
          ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
          ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
          ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
          ['123', ',', '.', 'space', 'symbols', '⏎']
        ]
      },
      
      symbols: {
        name: 'Symbols',
        rows: [
          ['∑', '∏', '∫', '∂', '∇', '∞', '∈', '∉', '⊂', '⊃'],
          ['α', 'β', 'γ', 'δ', 'θ', 'λ', 'μ', 'σ', 'φ', 'ω'],
          ['≤', '≥', '≈', '≡', '∝', '⊥', '∥', '∠', '°', '′'],
          ['sin', 'cos', 'tan', 'log', 'ln', 'lim', 'dx', '∮'],
          ['123', 'ABC', 'space', 'more', '⌫', '⏎']
        ]
      },
      
      advanced: {
        name: 'Advanced',
        rows: [
          ['∀', '∃', '∄', '∴', '∵', '⊕', '⊗', '⊙', '∧', '∨'],
          ['ℝ', 'ℂ', 'ℚ', 'ℤ', 'ℕ', '∅', '⊆', '⊇', '∩', '∪'],
          ['→', '←', '↔', '⇒', '⇐', '⇔', '↦', '⊢', '⊨', '∎'],
          ['₀', '₁', '₂', '³', '⁴', '⁵', 'ₓ', 'ᵢ', 'ⱼ', 'ₙ'],
          ['123', 'ABC', 'space', 'symbols', '⌫', '⏎']
        ]
      },
      
      fractions: {
        name: 'Fractions',
        rows: [
          ['½', '⅓', '⅔', '¼', '¾', '⅕', '⅖', '⅗', '⅘', '⅙'],
          ['⅐', '⅛', '⅜', '⅝', '⅞', '⅑', '⅒', '‰', '‱', '⁄'],
          ['numerator', '/', 'denominator', 'simplify'],
          ['123', 'ABC', 'space', 'symbols', '⌫', '⏎']
        ]
      },
      
      geometry: {
        name: 'Geometry',
        rows: [
          ['△', '□', '○', '⬟', '⬢', '⬡', '∟', '⊿', '▱', '◊'],
          ['∥', '⊥', '≅', '∼', '≃', '∢', '⌒', '⊙', '⌓', '⌔'],
          ['ray', 'line', 'segment', 'angle', 'arc'],
          ['123', 'ABC', 'space', 'symbols', '⌫', '⏎']
        ]
      }
    };
  }

  // ============================================
  // KEYBOARD CREATION
  // ============================================

  createKeyboard() {
    // Main container
    this.container = document.createElement('div');
    this.container.className = 'math-keyboard-container';
    this.container.setAttribute('aria-label', 'Math Keyboard');
    this.container.setAttribute('role', 'application');
    
    // Keyboard wrapper
    this.keyboard = document.createElement('div');
    this.keyboard.className = 'math-keyboard';
    
    // Layout indicator
    const header = document.createElement('div');
    header.className = 'keyboard-header';
    header.innerHTML = `
      <div class="layout-tabs">
        <button class="tab active" data-layout="numbers">123</button>
        <button class="tab" data-layout="letters">ABC</button>
        <button class="tab" data-layout="symbols">∑∫</button>
        <button class="tab" data-layout="advanced">∀∃</button>
      </div>
      <div class="keyboard-tools">
        <button class="tool-btn" id="voice-input" aria-label="Voice Input">🎤</button>
        <button class="tool-btn" id="keyboard-settings" aria-label="Settings">⚙️</button>
        <button class="tool-btn" id="hide-keyboard" aria-label="Hide Keyboard">⌨️</button>
      </div>
    `;
    
    // Keys container
    this.keysContainer = document.createElement('div');
    this.keysContainer.className = 'keyboard-keys';
    
    // Gesture overlay
    this.gestureOverlay = document.createElement('div');
    this.gestureOverlay.className = 'gesture-overlay';
    
    // Quick access bar
    this.quickAccessBar = document.createElement('div');
    this.quickAccessBar.className = 'quick-access-bar';
    this.quickAccessBar.innerHTML = `
      <div class="recent-symbols"></div>
      <div class="suggestions"></div>
    `;
    
    // Assemble keyboard
    this.keyboard.appendChild(header);
    this.keyboard.appendChild(this.quickAccessBar);
    this.keyboard.appendChild(this.keysContainer);
    this.keyboard.appendChild(this.gestureOverlay);
    this.container.appendChild(this.keyboard);
    
    // Add to DOM
    document.body.appendChild(this.container);
    
    // Render initial layout
    this.renderLayout('numbers');
  }

  renderLayout(layoutName) {
    const layout = this.layouts[layoutName];
    if (!layout) return;
    
    this.keysContainer.innerHTML = '';
    this.state.currentLayout = layoutName;
    
    // Update active tab
    document.querySelectorAll('.layout-tabs .tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.layout === layoutName);
    });
    
    // Create rows
    layout.rows.forEach((row, rowIndex) => {
      const rowElement = document.createElement('div');
      rowElement.className = 'keyboard-row';
      
      row.forEach(key => {
        const keyElement = this.createKey(key, rowIndex);
        rowElement.appendChild(keyElement);
      });
      
      this.keysContainer.appendChild(rowElement);
    });
    
    // Update suggestions
    this.updateSuggestions();
  }

  createKey(keyValue, rowIndex) {
    const key = document.createElement('button');
    key.className = 'keyboard-key';
    key.setAttribute('role', 'button');
    key.setAttribute('aria-label', this.getKeyLabel(keyValue));
    
    // Set minimum touch size
    key.style.minWidth = `${this.config.minTouchSize}px`;
    key.style.minHeight = `${this.config.minTouchSize}px`;
    
    // Special key classes
    const specialKeys = {
      'space': 'key-space',
      '⌫': 'key-backspace',
      '⏎': 'key-enter',
      '⇧': 'key-shift',
      '123': 'key-layout',
      'ABC': 'key-layout',
      'symbols': 'key-layout',
      'more': 'key-layout'
    };
    
    if (specialKeys[keyValue]) {
      key.classList.add(specialKeys[keyValue]);
    }
    
    // Multi-character keys
    const multiCharKeys = ['sin', 'cos', 'tan', 'log', 'ln', 'lim', 'dx'];
    if (multiCharKeys.includes(keyValue)) {
      key.classList.add('key-function');
    }
    
    // Key content
    if (keyValue === 'space') {
      key.innerHTML = '<span class="key-label">Space</span>';
    } else if (keyValue === '⇧') {
      key.innerHTML = '<span class="key-icon">⇧</span>';
      if (this.state.capsLock) {
        key.classList.add('active');
      }
    } else {
      key.innerHTML = `<span class="key-value">${keyValue}</span>`;
    }
    
    // Add data attributes
    key.dataset.key = keyValue;
    key.dataset.row = rowIndex;
    
    // Touch events
    this.addKeyListeners(key);
    
    return key;
  }

  addKeyListeners(key) {
    let touchStartTime;
    let longPressTimer;
    let touchStartPos = { x: 0, y: 0 };
    
    // Touch start
    key.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartTime = Date.now();
      touchStartPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      
      key.classList.add('pressed');
      
      // Haptic feedback
      if (this.config.hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
      
      // Sound feedback
      if (this.config.soundFeedback) {
        this.playKeySound();
      }
      
      // Long press detection
      longPressTimer = setTimeout(() => {
        this.handleLongPress(key);
      }, this.config.longPressDelay);
    });
    
    // Touch move (for swipe detection)
    key.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartPos.x;
      const deltaY = touch.clientY - touchStartPos.y;
      
      // Cancel long press if moved too much
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        clearTimeout(longPressTimer);
      }
    });
    
    // Touch end
    key.addEventListener('touchend', (e) => {
      e.preventDefault();
      clearTimeout(longPressTimer);
      key.classList.remove('pressed');
      
      const touchDuration = Date.now() - touchStartTime;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartPos.x;
      const deltaY = touch.clientY - touchStartPos.y;
      
      // Check for swipe
      if (Math.abs(deltaX) > this.config.swipeThreshold) {
        this.handleSwipe(key, deltaX > 0 ? 'right' : 'left');
      } else if (touchDuration < this.config.longPressDelay) {
        // Normal tap
        this.handleKeyPress(key.dataset.key);
      }
    });
    
    // Mouse events for testing
    key.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleKeyPress(key.dataset.key);
    });
  }

  // ============================================
  // KEY HANDLERS
  // ============================================

  handleKeyPress(keyValue) {
    if (!this.state.activeInput) return;
    
    // Layout switching
    if (['123', 'ABC', 'symbols', 'more'].includes(keyValue)) {
      this.switchLayout(keyValue);
      return;
    }
    
    // Special keys
    switch (keyValue) {
      case '⌫':
        this.handleBackspace();
        break;
      case '⏎':
        this.handleEnter();
        break;
      case '⇧':
        this.toggleShift();
        break;
      case 'space':
        this.insertText(' ');
        break;
      default:
        this.insertText(keyValue);
    }
    
    // Update suggestions
    this.updateSuggestions();
    
    // Add to recent symbols if it's a symbol
    if (this.isSymbol(keyValue)) {
      this.addToRecentSymbols(keyValue);
    }
  }

  handleLongPress(key) {
    const keyValue = key.dataset.key;
    
    // Haptic feedback for long press
    if (this.config.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Show alternate characters
    const alternates = this.getAlternateCharacters(keyValue);
    if (alternates.length > 0) {
      this.showAlternatePanel(key, alternates);
    }
  }

  handleSwipe(key, direction) {
    const keyValue = key.dataset.key;
    
    // Number keys: swipe up for superscript, down for subscript
    if (/^\d$/.test(keyValue)) {
      if (direction === 'up') {
        this.insertText(this.toSuperscript(keyValue));
      } else if (direction === 'down') {
        this.insertText(this.toSubscript(keyValue));
      }
    }
    
    // Custom swipe actions
    const swipeActions = this.gestures.get(`swipe-${direction}-${keyValue}`);
    if (swipeActions) {
      swipeActions();
    }
  }

  getAlternateCharacters(keyValue) {
    const alternates = {
      'a': ['α', 'ā', 'â', 'ä', 'à', 'á', 'ã'],
      'b': ['β', 'ḃ'],
      'c': ['ç', 'ć', 'č'],
      'd': ['δ', 'ḋ', 'đ'],
      'e': ['ε', 'ē', 'ê', 'ë', 'è', 'é'],
      'g': ['γ', 'ḡ'],
      'i': ['∞', 'ī', 'î', 'ï', 'ì', 'í'],
      'l': ['λ', 'ℓ'],
      'm': ['μ', 'ṁ'],
      'n': ['ν', 'ñ', 'ň'],
      'o': ['ω', 'ō', 'ô', 'ö', 'ò', 'ó'],
      'p': ['π', 'φ', 'ψ'],
      'r': ['ρ', 'ř'],
      's': ['σ', 'Σ', 'ś', 'š'],
      't': ['τ', 'θ', 'ť'],
      'u': ['υ', 'ū', 'û', 'ü', 'ù', 'ú'],
      'x': ['ξ', 'χ', '×'],
      'y': ['ψ', 'ÿ', 'ý'],
      'z': ['ζ', 'ž'],
      '=': ['≠', '≈', '≡', '≤', '≥', '≪', '≫'],
      '+': ['±', '⊕', '⊞'],
      '-': ['−', '⊖', '⊟'],
      '*': ['×', '·', '⊗', '⊙'],
      '/': ['÷', '⁄', '∕'],
      '(': ['⟨', '⌈', '⌊', '｛'],
      ')': ['⟩', '⌉', '⌋', '｝'],
      '<': ['≤', '≪', '⟨', '∠'],
      '>': ['≥', '≫', '⟩'],
      '0': ['∅', '⊘', '⊙'],
      '1': ['¹', '₁'],
      '2': ['²', '₂', '√'],
      '3': ['³', '₃', '∛'],
      '4': ['⁴', '₄', '∜'],
      '5': ['⁵', '₅'],
      '6': ['⁶', '₆'],
      '7': ['⁷', '₇'],
      '8': ['⁸', '₈', '∞'],
      '9': ['⁹', '₉']
    };
    
    return alternates[keyValue] || [];
  }

  showAlternatePanel(key, alternates) {
    // Remove any existing panel
    this.hideAlternatePanel();
    
    const panel = document.createElement('div');
    panel.className = 'alternate-panel';
    
    alternates.forEach(char => {
      const altKey = document.createElement('button');
      altKey.className = 'alternate-key';
      altKey.textContent = char;
      altKey.addEventListener('click', () => {
        this.insertText(char);
        this.hideAlternatePanel();
      });
      panel.appendChild(altKey);
    });
    
    // Position panel above key
    const keyRect = key.getBoundingClientRect();
    panel.style.left = `${keyRect.left}px`;
    panel.style.bottom = `${window.innerHeight - keyRect.top + 5}px`;
    
    document.body.appendChild(panel);
    
    // Auto-hide after timeout
    setTimeout(() => this.hideAlternatePanel(), 3000);
  }

  hideAlternatePanel() {
    const panel = document.querySelector('.alternate-panel');
    if (panel) {
      panel.remove();
    }
  }

  // ============================================
  // TEXT MANIPULATION
  // ============================================

  insertText(text) {
    if (!this.state.activeInput) return;
    
    const input = this.state.activeInput;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const value = input.value;
    
    // Insert text at cursor position
    const newValue = value.substring(0, start) + text + value.substring(end);
    input.value = newValue;
    
    // Update cursor position
    const newPosition = start + text.length;
    input.setSelectionRange(newPosition, newPosition);
    
    // Trigger input event
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Update history
    this.addToHistory({ action: 'insert', text, position: start });
  }

  handleBackspace() {
    if (!this.state.activeInput) return;
    
    const input = this.state.activeInput;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    
    if (start !== end) {
      // Delete selection
      input.value = input.value.substring(0, start) + input.value.substring(end);
      input.setSelectionRange(start, start);
    } else if (start > 0) {
      // Delete previous character
      input.value = input.value.substring(0, start - 1) + input.value.substring(start);
      input.setSelectionRange(start - 1, start - 1);
    }
    
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  handleEnter() {
    if (!this.state.activeInput) return;
    
    // Dispatch enter event
    const event = new KeyboardEvent('keypress', {
      key: 'Enter',
      keyCode: 13,
      bubbles: true
    });
    this.state.activeInput.dispatchEvent(event);
    
    // Hide keyboard on enter (optional)
    if (this.config.hideOnEnter) {
      this.hide();
    }
  }

  toggleShift() {
    this.state.capsLock = !this.state.capsLock;
    
    // Update shift key appearance
    const shiftKey = document.querySelector('.key-shift');
    if (shiftKey) {
      shiftKey.classList.toggle('active', this.state.capsLock);
    }
    
    // Update letter keys
    if (this.state.currentLayout === 'letters') {
      const letterKeys = document.querySelectorAll('.keyboard-key');
      letterKeys.forEach(key => {
        const value = key.dataset.key;
        if (/^[a-z]$/.test(value)) {
          const displayValue = this.state.capsLock ? value.toUpperCase() : value;
          key.querySelector('.key-value').textContent = displayValue;
        }
      });
    }
  }

  // ============================================
  // LAYOUT SWITCHING
  // ============================================

  switchLayout(command) {
    const layoutMap = {
      '123': 'numbers',
      'ABC': 'letters',
      'symbols': 'symbols',
      'more': 'advanced'
    };
    
    const newLayout = layoutMap[command] || command;
    if (this.layouts[newLayout]) {
      this.renderLayout(newLayout);
    }
  }

  // ============================================
  // CONTEXTUAL KEYBOARD
  // ============================================

  detectInputContext(input) {
    if (!this.config.contextual) return 'numbers';
    
    const value = input.value;
    const placeholder = input.placeholder || '';
    const type = input.dataset.mathType || input.type;
    
    // Check input type hints
    if (type === 'equation') return 'symbols';
    if (type === 'geometry') return 'geometry';
    if (type === 'fraction') return 'fractions';
    
    // Analyze current content
    if (/[a-zA-Z]/.test(value)) return 'letters';
    if (/[∫∑∏]/.test(value)) return 'advanced';
    if (/[αβγδ]/.test(value)) return 'symbols';
    
    // Analyze placeholder
    if (/angle|triangle|circle/i.test(placeholder)) return 'geometry';
    if (/fraction|numerator|denominator/i.test(placeholder)) return 'fractions';
    
    return 'numbers';
  }

  // ============================================
  // SUGGESTIONS
  // ============================================

  updateSuggestions() {
    if (!this.state.activeInput) return;
    
    const value = this.state.activeInput.value;
    const cursorPos = this.state.activeInput.selectionStart;
    
    // Get current word/expression
    const currentExpr = this.getCurrentExpression(value, cursorPos);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(currentExpr);
    
    // Render suggestions
    const suggestionsContainer = document.querySelector('.suggestions');
    suggestionsContainer.innerHTML = '';
    
    suggestions.slice(0, 5).forEach(suggestion => {
      const chip = document.createElement('button');
      chip.className = 'suggestion-chip';
      chip.textContent = suggestion.display;
      chip.addEventListener('click', () => {
        this.applySuggestion(suggestion);
      });
      suggestionsContainer.appendChild(chip);
    });
  }

  getCurrentExpression(value, position) {
    // Find word boundaries
    let start = position;
    let end = position;
    
    while (start > 0 && !/\s/.test(value[start - 1])) {
      start--;
    }
    
    while (end < value.length && !/\s/.test(value[end])) {
      end++;
    }
    
    return value.substring(start, end);
  }

  generateSuggestions(expr) {
    const suggestions = [];
    
    // Function completions
    if (expr.match(/^(s|si|sin?)$/)) {
      suggestions.push(
        { display: 'sin()', insert: 'sin()', cursorOffset: -1 },
        { display: 'sinh()', insert: 'sinh()', cursorOffset: -1 }
      );
    }
    
    if (expr.match(/^(c|co|cos?)$/)) {
      suggestions.push(
        { display: 'cos()', insert: 'cos()', cursorOffset: -1 },
        { display: 'cosh()', insert: 'cosh()', cursorOffset: -1 }
      );
    }
    
    if (expr.match(/^(t|ta|tan?)$/)) {
      suggestions.push(
        { display: 'tan()', insert: 'tan()', cursorOffset: -1 },
        { display: 'tanh()', insert: 'tanh()', cursorOffset: -1 }
      );
    }
    
    if (expr.match(/^(l|lo|log?)$/)) {
      suggestions.push(
        { display: 'log()', insert: 'log()', cursorOffset: -1 },
        { display: 'log₁₀()', insert: 'log₁₀()', cursorOffset: -1 },
        { display: 'ln()', insert: 'ln()', cursorOffset: -1 }
      );
    }
    
    // Common expressions
    if (expr.match(/^(sq|sqr|sqrt?)$/)) {
      suggestions.push(
        { display: '√', insert: '√' },
        { display: '√()', insert: '√()', cursorOffset: -1 }
      );
    }
    
    if (expr.match(/^(pi?)$/)) {
      suggestions.push({ display: 'π', insert: 'π' });
    }
    
    if (expr.match(/^(inf|infi|infin|infini|infinit|infinity?)$/)) {
      suggestions.push({ display: '∞', insert: '∞' });
    }
    
    // Greek letters
    if (expr.match(/^(alp|alph|alpha?)$/)) {
      suggestions.push({ display: 'α', insert: 'α' });
    }
    
    if (expr.match(/^(bet|beta?)$/)) {
      suggestions.push({ display: 'β', insert: 'β' });
    }
    
    if (expr.match(/^(gam|gamm|gamma?)$/)) {
      suggestions.push({ display: 'γ', insert: 'γ' });
    }
    
    return suggestions;
  }

  applySuggestion(suggestion) {
    const input = this.state.activeInput;
    const value = input.value;
    const cursorPos = input.selectionStart;
    
    // Find expression boundaries
    let start = cursorPos;
    while (start > 0 && !/\s/.test(value[start - 1])) {
      start--;
    }
    
    let end = cursorPos;
    while (end < value.length && !/\s/.test(value[end])) {
      end++;
    }
    
    // Replace expression with suggestion
    const newValue = value.substring(0, start) + suggestion.insert + value.substring(end);
    input.value = newValue;
    
    // Set cursor position
    const newPosition = start + suggestion.insert.length + (suggestion.cursorOffset || 0);
    input.setSelectionRange(newPosition, newPosition);
    
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Update suggestions
    this.updateSuggestions();
  }

  // ============================================
  // RECENT SYMBOLS
  // ============================================

  addToRecentSymbols(symbol) {
    // Remove if already exists
    this.state.recentSymbols = this.state.recentSymbols.filter(s => s !== symbol);
    
    // Add to beginning
    this.state.recentSymbols.unshift(symbol);
    
    // Keep only last 10
    this.state.recentSymbols = this.state.recentSymbols.slice(0, 10);
    
    // Update UI
    this.renderRecentSymbols();
    
    // Save to preferences
    this.saveUserPreferences();
  }

  renderRecentSymbols() {
    const container = document.querySelector('.recent-symbols');
    container.innerHTML = '';
    
    if (this.state.recentSymbols.length === 0) return;
    
    const label = document.createElement('span');
    label.className = 'recent-label';
    label.textContent = 'Recent:';
    container.appendChild(label);
    
    this.state.recentSymbols.forEach(symbol => {
      const btn = document.createElement('button');
      btn.className = 'recent-symbol';
      btn.textContent = symbol;
      btn.addEventListener('click', () => {
        this.insertText(symbol);
      });
      container.appendChild(btn);
    });
  }

  // ============================================
  // GESTURE SUPPORT
  // ============================================

  setupGestures() {
    // Two-finger swipe for undo/redo
    let touchPoints = [];
    
    this.gestureOverlay.addEventListener('touchstart', (e) => {
      touchPoints = Array.from(e.touches).map(touch => ({
        id: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY
      }));
    });
    
    this.gestureOverlay.addEventListener('touchmove', (e) => {
      Array.from(e.touches).forEach(touch => {
        const point = touchPoints.find(p => p.id === touch.identifier);
        if (point) {
          point.currentX = touch.clientX;
          point.currentY = touch.clientY;
        }
      });
      
      // Detect two-finger swipe
      if (touchPoints.length === 2) {
        const avgDeltaX = touchPoints.reduce((sum, p) => sum + (p.currentX - p.startX), 0) / 2;
        
        if (Math.abs(avgDeltaX) > this.config.swipeThreshold) {
          if (avgDeltaX > 0) {
            this.undo();
          } else {
            this.redo();
          }
          touchPoints = []; // Reset to prevent multiple triggers
        }
      }
    });
    
    // Three-finger tap for layout switch
    this.gestureOverlay.addEventListener('touchstart', (e) => {
      if (e.touches.length === 3) {
        e.preventDefault();
        this.cycleLayout();
      }
    });
    
    // Custom gesture registration
    this.gestures.set('swipe-up-space', () => this.insertText('^'));
    this.gestures.set('swipe-down-space', () => this.insertText('_'));
    this.gestures.set('swipe-left-backspace', () => this.clearAll());
    this.gestures.set('swipe-right-enter', () => this.submitExpression());
  }

  // ============================================
  // VOICE INPUT
  // ============================================

  setupVoiceInput() {
    const voiceBtn = document.getElementById('voice-input');
    if (!voiceBtn) return;
    
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      voiceBtn.style.display = 'none';
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    // Math-specific vocabulary
    const mathGrammar = '#JSGF V1.0; grammar math; public <math> = ' +
      'plus | minus | times | divided by | equals | ' +
      'square root | squared | cubed | to the power of | ' +
      'sine | cosine | tangent | log | natural log | ' +
      'pi | infinity | alpha | beta | gamma | delta | ' +
      'open parenthesis | close parenthesis | ' +
      'fraction | over | integral | sum | ' +
      'less than | greater than | less than or equal | greater than or equal;';
    
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    if (SpeechGrammarList) {
      const speechRecognitionList = new SpeechGrammarList();
      speechRecognitionList.addFromString(mathGrammar, 1);
      this.recognition.grammars = speechRecognitionList;
    }
    
    this.recognition.onstart = () => {
      voiceBtn.classList.add('recording');
      this.showVoiceFeedback('Listening...');
    };
    
    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      
      if (event.results[last].isFinal) {
        const mathText = this.convertSpeechToMath(transcript);
        this.insertText(mathText);
        this.hideVoiceFeedback();
      } else {
        this.showVoiceFeedback(transcript);
      }
    };
    
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      voiceBtn.classList.remove('recording');
      this.hideVoiceFeedback();
    };
    
    this.recognition.onend = () => {
      voiceBtn.classList.remove('recording');
      this.hideVoiceFeedback();
    };
    
    voiceBtn.addEventListener('click', () => {
      if (voiceBtn.classList.contains('recording')) {
        this.recognition.stop();
      } else {
        this.recognition.start();
      }
    });
  }

  convertSpeechToMath(speech) {
    const conversions = {
      'plus': '+',
      'minus': '-',
      'times': '×',
      'multiplied by': '×',
      'divided by': '÷',
      'over': '/',
      'equals': '=',
      'equal': '=',
      'not equal': '≠',
      'square root': '√',
      'squared': '²',
      'cubed': '³',
      'to the power of': '^',
      'to the': '^',
      'sine': 'sin',
      'cosine': 'cos',
      'tangent': 'tan',
      'log': 'log',
      'natural log': 'ln',
      'pi': 'π',
      'infinity': '∞',
      'alpha': 'α',
      'beta': 'β',
      'gamma': 'γ',
      'delta': 'δ',
      'theta': 'θ',
      'sigma': 'σ',
      'sum': '∑',
      'integral': '∫',
      'open parenthesis': '(',
      'close parenthesis': ')',
      'open paren': '(',
      'close paren': ')',
      'left paren': '(',
      'right paren': ')',
      'less than': '<',
      'greater than': '>',
      'less than or equal': '≤',
      'greater than or equal': '≥',
      'approximately': '≈'
    };
    
    let result = speech.toLowerCase();
    
    // Replace spoken math terms
    Object.entries(conversions).forEach(([spoken, symbol]) => {
      const regex = new RegExp(`\\b${spoken}\\b`, 'gi');
      result = result.replace(regex, symbol);
    });
    
    // Convert spoken numbers
    result = result.replace(/\bone\b/gi, '1');
    result = result.replace(/\btwo\b/gi, '2');
    result = result.replace(/\bthree\b/gi, '3');
    result = result.replace(/\bfour\b/gi, '4');
    result = result.replace(/\bfive\b/gi, '5');
    result = result.replace(/\bsix\b/gi, '6');
    result = result.replace(/\bseven\b/gi, '7');
    result = result.replace(/\beight\b/gi, '8');
    result = result.replace(/\bnine\b/gi, '9');
    result = result.replace(/\bzero\b/gi, '0');
    
    // Clean up spaces
    result = result.replace(/\s+([+\-×÷=<>])\s+/g, ' $1 ');
    result = result.replace(/\s+/g, ' ').trim();
    
    return result;
  }

  showVoiceFeedback(text) {
    let feedback = document.querySelector('.voice-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'voice-feedback';
      this.container.appendChild(feedback);
    }
    feedback.textContent = text;
    feedback.style.display = 'block';
  }

  hideVoiceFeedback() {
    const feedback = document.querySelector('.voice-feedback');
    if (feedback) {
      feedback.style.display = 'none';
    }
  }

  // ============================================
  // VISIBILITY CONTROL
  // ============================================

  show(input) {
    this.state.activeInput = input;
    this.state.isVisible = true;
    
    // Detect context and switch layout
    const context = this.detectInputContext(input);
    this.renderLayout(context);
    
    // Position keyboard
    this.positionKeyboard();
    
    // Show with animation
    this.container.classList.add('visible');
    
    // Update recent symbols
    this.renderRecentSymbols();
    
    // Focus management
    input.setAttribute('data-keyboard-active', 'true');
  }

  hide() {
    this.state.isVisible = false;
    this.container.classList.remove('visible');
    
    if (this.state.activeInput) {
      this.state.activeInput.removeAttribute('data-keyboard-active');
      this.state.activeInput = null;
    }
    
    // Hide any alternate panels
    this.hideAlternatePanel();
  }

  positionKeyboard() {
    if (this.config.position === 'bottom') {
      this.container.style.bottom = '0';
      this.container.style.top = 'auto';
    } else if (this.config.position === 'top') {
      this.container.style.top = '0';
      this.container.style.bottom = 'auto';
    }
    
    // Adjust viewport if needed
    if (this.state.activeInput) {
      this.ensureInputVisible();
    }
  }

  ensureInputVisible() {
    const input = this.state.activeInput;
    const inputRect = input.getBoundingClientRect();
    const keyboardHeight = this.container.offsetHeight;
    
    // Check if input is hidden by keyboard
    if (inputRect.bottom > window.innerHeight - keyboardHeight) {
      const scrollTop = window.scrollY + inputRect.bottom - (window.innerHeight - keyboardHeight) + 20;
      window.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  setupEventListeners() {
    // Tab switching
    document.addEventListener('click', (e) => {
      if (e.target.matches('.layout-tabs .tab')) {
        const layout = e.target.dataset.layout;
        this.renderLayout(layout);
      }
      
      if (e.target.id === 'hide-keyboard') {
        this.hide();
      }
      
      if (e.target.id === 'keyboard-settings') {
        this.showSettings();
      }
    });
    
    // Input focus handling
    document.addEventListener('focusin', (e) => {
      if (e.target.matches('input[type="text"], input[type="number"], textarea')) {
        if (e.target.dataset.mathKeyboard !== 'false') {
          this.show(e.target);
        }
      }
    });
    
    // Hide on outside click
    document.addEventListener('click', (e) => {
      if (this.state.isVisible && 
          !this.container.contains(e.target) && 
          e.target !== this.state.activeInput) {
        this.hide();
      }
    });
    
    // Voice input setup
    this.setupVoiceInput();
    
    // Orientation change
    window.addEventListener('orientationchange', () => {
      if (this.state.isVisible) {
        setTimeout(() => this.positionKeyboard(), 100);
      }
    });
  }

  // ============================================
  // PREFERENCES
  // ============================================

  loadUserPreferences() {
    try {
      const prefs = localStorage.getItem('mathKeyboardPrefs');
      if (prefs) {
        const data = JSON.parse(prefs);
        this.state.recentSymbols = data.recentSymbols || [];
        this.state.customSymbols = data.customSymbols || [];
        this.config.theme = data.theme || this.config.theme;
        this.config.soundFeedback = data.soundFeedback ?? this.config.soundFeedback;
        this.config.hapticFeedback = data.hapticFeedback ?? this.config.hapticFeedback;
      }
    } catch (e) {
      console.error('Failed to load preferences:', e);
    }
  }

  saveUserPreferences() {
    try {
      const data = {
        recentSymbols: this.state.recentSymbols,
        customSymbols: this.state.customSymbols,
        theme: this.config.theme,
        soundFeedback: this.config.soundFeedback,
        hapticFeedback: this.config.hapticFeedback
      };
      localStorage.setItem('mathKeyboardPrefs', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save preferences:', e);
    }
  }

  // ============================================
  // SETTINGS
  // ============================================

  showSettings() {
    const modal = document.createElement('div');
    modal.className = 'keyboard-settings-modal';
    modal.innerHTML = `
      <div class="settings-content">
        <h3>Keyboard Settings</h3>
        
        <div class="setting-item">
          <label>
            <input type="checkbox" id="haptic-feedback" ${this.config.hapticFeedback ? 'checked' : ''}>
            Haptic Feedback
          </label>
        </div>
        
        <div class="setting-item">
          <label>
            <input type="checkbox" id="sound-feedback" ${this.config.soundFeedback ? 'checked' : ''}>
            Sound Feedback
          </label>
        </div>
        
        <div class="setting-item">
          <label>Theme</label>
          <select id="theme-select">
            <option value="light" ${this.config.theme === 'light' ? 'selected' : ''}>Light</option>
            <option value="dark" ${this.config.theme === 'dark' ? 'selected' : ''}>Dark</option>
            <option value="auto" ${this.config.theme === 'auto' ? 'selected' : ''}>Auto</option>
          </select>
        </div>
        
        <div class="settings-actions">
          <button class="settings-cancel">Cancel</button>
          <button class="settings-save">Save</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event handlers
    modal.querySelector('.settings-cancel').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('.settings-save').addEventListener('click', () => {
      this.config.hapticFeedback = modal.querySelector('#haptic-feedback').checked;
      this.config.soundFeedback = modal.querySelector('#sound-feedback').checked;
      this.config.theme = modal.querySelector('#theme-select').value;
      
      this.saveUserPreferences();
      this.applyTheme();
      modal.remove();
    });
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  isSymbol(char) {
    return !/^[a-zA-Z0-9\s]$/.test(char);
  }

  toSuperscript(char) {
    const superscripts = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
      'n': 'ⁿ', 'i': 'ⁱ'
    };
    return superscripts[char] || char;
  }

  toSubscript(char) {
    const subscripts = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
      '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
      '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
      'a': 'ₐ', 'e': 'ₑ', 'i': 'ᵢ', 'j': 'ⱼ', 'n': 'ₙ',
      'x': 'ₓ'
    };
    return subscripts[char] || char;
  }

  getKeyLabel(key) {
    const labels = {
      '⌫': 'Backspace',
      '⏎': 'Enter',
      '⇧': 'Shift',
      'space': 'Space',
      '≠': 'Not equal',
      '≤': 'Less than or equal',
      '≥': 'Greater than or equal',
      '∞': 'Infinity',
      'π': 'Pi',
      '√': 'Square root',
      '∑': 'Sum',
      '∏': 'Product',
      '∫': 'Integral'
    };
    return labels[key] || key;
  }

  cycleLayout() {
    const layouts = ['numbers', 'letters', 'symbols', 'advanced'];
    const currentIndex = layouts.indexOf(this.state.currentLayout);
    const nextIndex = (currentIndex + 1) % layouts.length;
    this.renderLayout(layouts[nextIndex]);
  }

  undo() {
    // Implement undo functionality
    if (this.state.history.length > 0) {
      const lastAction = this.state.history.pop();
      // Reverse the action
      console.log('Undo:', lastAction);
    }
  }

  redo() {
    // Implement redo functionality
    console.log('Redo');
  }

  clearAll() {
    if (this.state.activeInput) {
      this.state.activeInput.value = '';
      this.state.activeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  submitExpression() {
    if (this.state.activeInput) {
      const event = new Event('submit', { bubbles: true });
      this.state.activeInput.form?.dispatchEvent(event);
    }
  }

  addToHistory(action) {
    this.state.history.push(action);
    // Keep only last 50 actions
    if (this.state.history.length > 50) {
      this.state.history.shift();
    }
  }

  // ============================================
  // SOUND FEEDBACK
  // ============================================

  initializeSounds() {
    // Create audio context for key sounds
    if (!window.AudioContext && !window.webkitAudioContext) return;
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    
    // Create simple click sound
    this.createClickSound();
  }

  createClickSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
    
    this.clickSound = { oscillator, gainNode };
  }

  playKeySound() {
    if (!this.audioContext || !this.config.soundFeedback) return;
    
    // Create a new oscillator for each click
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = 600 + Math.random() * 400; // Vary pitch slightly
    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }

  // ============================================
  // THEME MANAGEMENT
  // ============================================

  applyTheme() {
    const theme = this.config.theme === 'auto' ? 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') :
      this.config.theme;
    
    this.container.setAttribute('data-theme', theme);
  }

  // ============================================
  // STYLES
  // ============================================

  injectStyles() {
    if (document.getElementById('math-keyboard-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'math-keyboard-styles';
    style.textContent = `
      .math-keyboard-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--keyboard-bg, #f0f0f0);
        border-top: 1px solid var(--keyboard-border, #ddd);
        transform: translateY(100%);
        transition: transform ${this.config.animationDuration}ms ease-out;
        z-index: 10000;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }
      
      .math-keyboard-container.visible {
        transform: translateY(0);
      }
      
      .math-keyboard-container[data-theme="dark"] {
        --keyboard-bg: #1a1a1a;
        --keyboard-border: #333;
        --key-bg: #2a2a2a;
        --key-text: #e0e0e0;
        --key-border: #444;
        --key-shadow: rgba(0, 0, 0, 0.3);
        --key-active-bg: #3a3a3a;
        --special-key-bg: #0066cc;
        --special-key-text: #fff;
      }
      
      .math-keyboard-container[data-theme="light"] {
        --keyboard-bg: #f0f0f0;
        --keyboard-border: #ddd;
        --key-bg: #fff;
        --key-text: #333;
        --key-border: #ddd;
        --key-shadow: rgba(0, 0, 0, 0.1);
        --key-active-bg: #e0e0e0;
        --special-key-bg: #007aff;
        --special-key-text: #fff;
      }
      
      .math-keyboard {
        padding: 8px;
        padding-bottom: env(safe-area-inset-bottom, 8px);
      }
      
      .keyboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding: 0 4px;
      }
      
      .layout-tabs {
        display: flex;
        gap: 8px;
      }
      
      .layout-tabs .tab {
        padding: 6px 12px;
        background: var(--key-bg);
        border: 1px solid var(--key-border);
        border-radius: 6px;
        font-size: 14px;
        color: var(--key-text);
        transition: all 0.2s;
      }
      
      .layout-tabs .tab.active {
        background: var(--special-key-bg);
        color: var(--special-key-text);
        border-color: var(--special-key-bg);
      }
      
      .keyboard-tools {
        display: flex;
        gap: 8px;
      }
      
      .tool-btn {
        width: 36px;
        height: 36px;
        background: var(--key-bg);
        border: 1px solid var(--key-border);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: var(--key-text);
      }
      
      .tool-btn.recording {
        background: #ff3b30;
        color: white;
        animation: pulse 1s infinite;
      }
      
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.6; }
        100% { opacity: 1; }
      }
      
      .quick-access-bar {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        min-height: 32px;
      }
      
      .recent-symbols {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: 1;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      .recent-label {
        font-size: 12px;
        color: var(--key-text);
        opacity: 0.6;
        margin-right: 4px;
      }
      
      .recent-symbol {
        min-width: 32px;
        height: 32px;
        background: var(--key-bg);
        border: 1px solid var(--key-border);
        border-radius: 4px;
        font-size: 16px;
        color: var(--key-text);
      }
      
      .suggestions {
        display: flex;
        gap: 4px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      .suggestion-chip {
        padding: 4px 8px;
        background: var(--key-bg);
        border: 1px solid var(--key-border);
        border-radius: 12px;
        font-size: 14px;
        color: var(--key-text);
        white-space: nowrap;
      }
      
      .keyboard-keys {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .keyboard-row {
        display: flex;
        justify-content: center;
        gap: 4px;
      }
      
      .keyboard-key {
        min-width: ${this.config.minTouchSize}px;
        min-height: ${this.config.minTouchSize}px;
        background: var(--key-bg);
        border: 1px solid var(--key-border);
        border-radius: 6px;
        font-size: 20px;
        color: var(--key-text);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 2px var(--key-shadow);
        transition: all 0.1s;
        flex: 1;
        max-width: 60px;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      
      .keyboard-key.pressed {
        background: var(--key-active-bg);
        transform: scale(0.95);
        box-shadow: 0 0 1px var(--key-shadow);
      }
      
      .keyboard-key.key-space {
        flex: 3;
        max-width: none;
      }
      
      .keyboard-key.key-backspace,
      .keyboard-key.key-enter,
      .keyboard-key.key-shift {
        background: var(--special-key-bg);
        color: var(--special-key-text);
        flex: 1.5;
        max-width: 80px;
      }
      
      .keyboard-key.key-layout {
        font-size: 16px;
        flex: 1.2;
      }
      
      .keyboard-key.key-function {
        font-size: 16px;
        min-width: 60px;
      }
      
      .key-value {
        pointer-events: none;
      }
      
      .alternate-panel {
        position: fixed;
        background: var(--keyboard-bg);
        border: 1px solid var(--key-border);
        border-radius: 8px;
        padding: 4px;
        display: flex;
        gap: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        z-index: 10001;
      }
      
      .alternate-key {
        width: 36px;
        height: 36px;
        background: var(--key-bg);
        border: 1px solid var(--key-border);
        border-radius: 4px;
        font-size: 18px;
        color: var(--key-text);
      }
      
      .gesture-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
      }
      
      .voice-feedback {
        position: absolute;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        white-space: nowrap;
        display: none;
      }
      
      .keyboard-settings-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10002;
      }
      
      .settings-content {
        background: white;
        border-radius: 12px;
        padding: 20px;
        max-width: 300px;
        width: 90%;
      }
      
      .settings-content h3 {
        margin: 0 0 16px 0;
      }
      
      .setting-item {
        margin-bottom: 16px;
      }
      
      .setting-item label {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .setting-item select {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-top: 4px;
      }
      
      .settings-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 20px;
      }
      
      .settings-actions button {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
      }
      
      .settings-cancel {
        background: #f0f0f0;
        color: #333;
      }
      
      .settings-save {
        background: #007aff;
        color: white;
      }
      
      @media (max-width: 400px) {
        .keyboard-key {
          min-width: 36px;
          min-height: 36px;
          font-size: 18px;
          max-width: 48px;
        }
        
        .keyboard-key.key-function {
          font-size: 14px;
          min-width: 48px;
        }
      }
      
      @media (orientation: landscape) {
        .math-keyboard {
          padding: 4px;
        }
        
        .keyboard-key {
          min-height: 36px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // PUBLIC API
  // ============================================

  attachToInput(input) {
    input.addEventListener('focus', () => this.show(input));
  }

  detachFromInput(input) {
    input.removeEventListener('focus', () => this.show(input));
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    if (this.recognition) {
      this.recognition.stop();
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  setLayout(layout) {
    if (this.layouts[layout]) {
      this.renderLayout(layout);
    }
  }

  getStatistics() {
    return {
      recentSymbols: this.state.recentSymbols,
      mostUsedKeys: this.getMostUsedKeys(),
      sessionHistory: this.state.history.length,
      currentLayout: this.state.currentLayout
    };
  }

  getMostUsedKeys() {
    const frequency = {};
    
    this.state.history.forEach(action => {
      if (action.action === 'insert') {
        frequency[action.text] = (frequency[action.text] || 0) + 1;
      }
    });
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, count]) => ({ key, count }));
  }
}

// Auto-initialize for inputs with data-math-keyboard
document.addEventListener('DOMContentLoaded', () => {
  const mathKeyboard = new MathKeyboard();
  window.mathKeyboard = mathKeyboard;
  
  // Auto-attach to marked inputs
  const mathInputs = document.querySelectorAll('[data-math-keyboard="true"]');
  mathInputs.forEach(input => {
    mathKeyboard.attachToInput(input);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathKeyboard;
}