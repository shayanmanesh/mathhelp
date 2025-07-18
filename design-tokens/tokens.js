// Design Tokens for Math Help Platform
// Specialized tokens for mathematical content with accessibility support

const MathDesignTokens = {
  // ============================================
  // COLOR SYSTEM
  // ============================================
  
  colors: {
    // Core Brand Colors
    brand: {
      primary: '#3498db',      // Main brand blue
      secondary: '#2ecc71',    // Success green
      tertiary: '#9b59b6',     // Purple accent
      quaternary: '#f39c12',   // Warning orange
    },
    
    // Mathematical Expression Colors
    expressions: {
      // Variables and unknowns
      variable: {
        default: '#3498db',
        highlighted: '#2980b9',
        muted: '#5dade2',
        contrast: '#1f618d'  // High contrast mode
      },
      
      // Constants and numbers
      constant: {
        default: '#2c3e50',
        pi: '#8e44ad',
        e: '#16a085',
        infinity: '#e74c3c',
        contrast: '#000000'  // High contrast mode
      },
      
      // Operators
      operator: {
        basic: '#34495e',      // +, -, *, /
        advanced: '#8e44ad',   // ∫, ∑, ∏
        logic: '#3498db',      // ∧, ∨, ¬
        set: '#16a085',        // ∈, ∉, ⊆
        contrast: '#000000'    // High contrast mode
      },
      
      // Functions
      function: {
        trig: '#e74c3c',       // sin, cos, tan
        log: '#f39c12',        // log, ln
        special: '#9b59b6',    // gamma, beta
        custom: '#1abc9c',     // User-defined
        contrast: '#000000'    // High contrast mode
      },
      
      // Brackets and delimiters
      delimiter: {
        parenthesis: '#7f8c8d',
        bracket: '#95a5a6',
        brace: '#bdc3c7',
        matched: '#27ae60',    // Matching pairs
        unmatched: '#e74c3c',  // Errors
        contrast: '#000000'    // High contrast mode
      }
    },
    
    // Feedback Colors
    feedback: {
      correct: {
        default: '#27ae60',
        light: '#58d68d',
        dark: '#1e8449',
        bg: '#d5f4e6',
        border: '#27ae60',
        contrast: '#00ff00'    // High contrast mode
      },
      
      incorrect: {
        default: '#e74c3c',
        light: '#ec7063',
        dark: '#c0392b',
        bg: '#fadbd8',
        border: '#e74c3c',
        contrast: '#ff0000'    // High contrast mode
      },
      
      partial: {
        default: '#f39c12',
        light: '#f5b041',
        dark: '#ca8a04',
        bg: '#fef5e7',
        border: '#f39c12',
        contrast: '#ffff00'    // High contrast mode
      },
      
      neutral: {
        default: '#95a5a6',
        light: '#bdc3c7',
        dark: '#7f8c8d',
        bg: '#ecf0f1',
        border: '#95a5a6',
        contrast: '#808080'    // High contrast mode
      },
      
      hint: {
        default: '#3498db',
        light: '#5dade2',
        dark: '#2874a6',
        bg: '#d6eaf8',
        border: '#3498db',
        contrast: '#0000ff'    // High contrast mode
      }
    },
    
    // UI Colors
    ui: {
      background: {
        primary: '#ffffff',
        secondary: '#f8f9fa',
        tertiary: '#e9ecef',
        inverse: '#2c3e50',
        overlay: 'rgba(0, 0, 0, 0.5)'
      },
      
      surface: {
        primary: '#ffffff',
        secondary: '#f8f9fa',
        elevated: '#ffffff',
        depressed: '#e9ecef',
        disabled: '#dee2e6'
      },
      
      border: {
        light: '#dee2e6',
        default: '#ced4da',
        dark: '#adb5bd',
        focus: '#3498db',
        error: '#e74c3c'
      },
      
      text: {
        primary: '#212529',
        secondary: '#6c757d',
        tertiary: '#adb5bd',
        inverse: '#ffffff',
        disabled: '#adb5bd',
        link: '#3498db',
        linkHover: '#2874a6'
      }
    },
    
    // Semantic Colors
    semantic: {
      info: '#3498db',
      success: '#27ae60',
      warning: '#f39c12',
      error: '#e74c3c',
      help: '#9b59b6'
    },
    
    // High Contrast Mode Colors
    highContrast: {
      background: '#000000',
      foreground: '#ffffff',
      primary: '#00ff00',
      secondary: '#ffff00',
      error: '#ff0000',
      border: '#ffffff',
      focus: '#00ffff'
    }
  },
  
  // ============================================
  // TYPOGRAPHY
  // ============================================
  
  typography: {
    // Font Families
    fontFamily: {
      // Text fonts
      text: {
        primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        secondary: 'Georgia, Cambria, "Times New Roman", serif',
        monospace: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace'
      },
      
      // Math fonts (MathJax compatible)
      math: {
        serif: '"Latin Modern Roman", "Computer Modern", "Times New Roman", serif',
        sansSerif: '"Latin Modern Sans", "Computer Modern Sans", Arial, sans-serif',
        script: '"Latin Modern Math", "STIX Two Math", "Cambria Math", serif',
        fraktur: '"Latin Modern Math", "STIX Two Math", serif',
        monospace: '"Latin Modern Mono", "Computer Modern Typewriter", monospace',
        doublestruck: '"Latin Modern Math", "STIX Two Math", serif'
      }
    },
    
    // Font Sizes
    fontSize: {
      // Text sizes
      text: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        md: '1rem',       // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem'     // 48px
      },
      
      // Math expression sizes (relative to surrounding text)
      math: {
        inline: '1em',
        display: '1.2em',
        script: '0.7em',
        scriptscript: '0.5em',
        large: '1.5em',
        Large: '2em',
        LARGE: '2.5em',
        huge: '3em',
        Huge: '4em'
      }
    },
    
    // Line Heights
    lineHeight: {
      // Text line heights
      text: {
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2
      },
      
      // Math line heights (for proper formula spacing)
      math: {
        inline: 1.2,
        display: 1.8,
        fraction: 2.4,
        matrix: 2.2,
        stretched: 3
      }
    },
    
    // Font Weights
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    
    // Letter Spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },
  
  // ============================================
  // SPACING SYSTEM
  // ============================================
  
  spacing: {
    // Base spacing scale
    base: {
      0: '0',
      1: '0.25rem',   // 4px
      2: '0.5rem',    // 8px
      3: '0.75rem',   // 12px
      4: '1rem',      // 16px
      5: '1.25rem',   // 20px
      6: '1.5rem',    // 24px
      7: '1.75rem',   // 28px
      8: '2rem',      // 32px
      10: '2.5rem',   // 40px
      12: '3rem',     // 48px
      16: '4rem',     // 64px
      20: '5rem',     // 80px
      24: '6rem'      // 96px
    },
    
    // Math-specific spacing
    math: {
      // Spacing around operators
      operator: {
        thin: '0.16667em',      // Thin space
        medium: '0.22222em',    // Medium space
        thick: '0.27778em',     // Thick space
        veryThick: '0.33333em'  // Very thick space
      },
      
      // Spacing in equations
      equation: {
        beforeDisplay: '1em',
        afterDisplay: '1em',
        interline: '0.5em',
        multiline: '1.2em'
      },
      
      // Matrix and array spacing
      matrix: {
        columnGap: '1em',
        rowGap: '0.5em',
        padding: '0.5em'
      },
      
      // Fraction spacing
      fraction: {
        barThickness: '0.04em',
        barPadding: '0.2em',
        scriptSpace: '0.1em'
      },
      
      // Root and radical spacing
      radical: {
        kernBefore: '0.1em',
        kernAfter: '0.1em',
        ruleThickness: '0.04em',
        verticalGap: '0.2em'
      }
    },
    
    // Component spacing
    component: {
      card: {
        padding: '1.5rem',
        gap: '1rem'
      },
      
      button: {
        paddingX: '1rem',
        paddingY: '0.5rem',
        gap: '0.5rem'
      },
      
      input: {
        paddingX: '0.75rem',
        paddingY: '0.5rem'
      },
      
      problem: {
        statementGap: '1.5rem',
        optionGap: '0.75rem',
        sectionGap: '2rem'
      }
    }
  },
  
  // ============================================
  // SIZING SYSTEM
  // ============================================
  
  sizing: {
    // Interactive element sizes
    interactive: {
      minHeight: {
        sm: '2rem',     // 32px
        md: '2.5rem',   // 40px
        lg: '3rem',     // 48px
        xl: '3.5rem'    // 56px
      },
      
      minWidth: {
        sm: '2rem',     // 32px
        md: '2.5rem',   // 40px
        lg: '3rem',     // 48px
        xl: '3.5rem'    // 56px
      },
      
      // Touch targets (WCAG 2.5.5)
      touchTarget: {
        minimum: '44px',
        recommended: '48px'
      }
    },
    
    // Math element sizes
    math: {
      // Minimum sizes for readability
      minFontSize: '14px',
      minSubscriptSize: '10px',
      
      // Maximum sizes for layout
      maxInlineHeight: '2em',
      maxDisplayWidth: '100%',
      
      // Symbol sizes
      symbol: {
        small: '0.5em',
        medium: '1em',
        large: '1.5em',
        xlarge: '2em'
      }
    },
    
    // Container widths
    container: {
      xs: '20rem',    // 320px
      sm: '24rem',    // 384px
      md: '28rem',    // 448px
      lg: '32rem',    // 512px
      xl: '36rem',    // 576px
      '2xl': '42rem', // 672px
      '3xl': '48rem', // 768px
      '4xl': '56rem', // 896px
      '5xl': '64rem', // 1024px
      '6xl': '72rem', // 1152px
      full: '100%'
    }
  },
  
  // ============================================
  // BORDER SYSTEM
  // ============================================
  
  borders: {
    radius: {
      none: '0',
      sm: '0.125rem',   // 2px
      md: '0.25rem',    // 4px
      lg: '0.5rem',     // 8px
      xl: '0.75rem',    // 12px
      '2xl': '1rem',    // 16px
      '3xl': '1.5rem',  // 24px
      full: '9999px'
    },
    
    width: {
      none: '0',
      thin: '1px',
      medium: '2px',
      thick: '4px',
      heavy: '8px'
    },
    
    style: {
      solid: 'solid',
      dashed: 'dashed',
      dotted: 'dotted',
      double: 'double'
    }
  },
  
  // ============================================
  // SHADOWS
  // ============================================
  
  shadows: {
    elevation: {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
    },
    
    focus: {
      default: '0 0 0 3px rgba(52, 152, 219, 0.5)',
      error: '0 0 0 3px rgba(231, 76, 60, 0.5)',
      success: '0 0 0 3px rgba(39, 174, 96, 0.5)',
      highContrast: '0 0 0 3px #00ffff'
    }
  },
  
  // ============================================
  // ANIMATION
  // ============================================
  
  animation: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms'
    },
    
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    
    // Math-specific animations
    math: {
      // Equation solving steps
      stepDelay: '500ms',
      stepDuration: '300ms',
      
      // Highlighting
      highlightDuration: '200ms',
      highlightEasing: 'ease-in-out',
      
      // Graph drawing
      drawDuration: '1000ms',
      drawEasing: 'ease-in-out'
    }
  },
  
  // ============================================
  // Z-INDEX LAYERS
  // ============================================
  
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
    debug: 9999
  },
  
  // ============================================
  // BREAKPOINTS
  // ============================================
  
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // ============================================
  // ACCESSIBILITY
  // ============================================
  
  accessibility: {
    // Focus indicators
    focus: {
      outlineWidth: '3px',
      outlineStyle: 'solid',
      outlineOffset: '2px',
      outlineColor: '#3498db',
      highContrastColor: '#00ffff'
    },
    
    // Screen reader helpers
    screenReader: {
      // Classes for screen reader only content
      visuallyHidden: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: '0'
      },
      
      // Focus visible for keyboard navigation
      focusVisible: {
        outline: '3px solid currentColor',
        outlineOffset: '2px'
      }
    },
    
    // Motion preferences
    reducedMotion: {
      animationDuration: '0.01ms',
      animationIterationCount: '1',
      transitionDuration: '0.01ms'
    },
    
    // Color contrast ratios
    contrast: {
      // WCAG AA standards
      aa: {
        normal: 4.5,
        large: 3
      },
      
      // WCAG AAA standards
      aaa: {
        normal: 7,
        large: 4.5
      }
    }
  }
};

// Export tokens
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathDesignTokens;
} else {
  window.MathDesignTokens = MathDesignTokens;
}