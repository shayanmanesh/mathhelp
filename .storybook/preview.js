// Storybook preview configuration

import '../design-tokens/tokens.css';
import '../accessibility/math-a11y.css';
import '../ad-optimization-styles.css';

// Import MathJax for math rendering
const mathJaxScript = document.createElement('script');
mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
mathJaxScript.async = true;
document.head.appendChild(mathJaxScript);

// Import design tokens
import { MathDesignTokens } from '../design-tokens/tokens.js';

// Import accessibility
import { MathAccessibility } from '../accessibility/math-a11y.js';

// Import components
import '../components/atoms.js';
import '../components/molecules.js';
import '../components/organisms.js';
import '../components/templates.js';
import '../components/pages.js';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  
  viewport: {
    viewports: {
      mobile: {
        name: 'Mobile',
        styles: {
          width: '375px',
          height: '667px',
        },
      },
      tablet: {
        name: 'Tablet',
        styles: {
          width: '768px',
          height: '1024px',
        },
      },
      desktop: {
        name: 'Desktop',
        styles: {
          width: '1280px',
          height: '800px',
        },
      },
    },
  },
  
  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: MathDesignTokens.colors.ui.background.primary,
      },
      {
        name: 'dark',
        value: MathDesignTokens.colors.ui.background.inverse,
      },
      {
        name: 'high-contrast',
        value: MathDesignTokens.colors.highContrast.background,
      },
    ],
  },
  
  a11y: {
    element: '#root',
    config: {},
    options: {
      checks: { 'color-contrast': { enabled: true } },
      rules: {
        'color-contrast': { enabled: true },
        'valid-lang': { enabled: true },
        'landmark-one-main': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'label': { enabled: true },
        'button-name': { enabled: true },
        'image-alt': { enabled: true },
      },
    },
  },
  
  docs: {
    theme: {
      brandTitle: 'Math Help Design System',
      brandUrl: 'https://math.help',
      brandImage: '/logo.png',
      fontBase: MathDesignTokens.typography.fontFamily.text.primary,
      fontCode: MathDesignTokens.typography.fontFamily.text.monospace,
    },
  },
};

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: ['light', 'dark', 'high-contrast'],
      showName: true,
    },
  },
  mathMode: {
    name: 'Math Mode',
    description: 'Enable math rendering',
    defaultValue: 'enabled',
    toolbar: {
      icon: 'calculator',
      items: ['enabled', 'disabled'],
      showName: true,
    },
  },
  a11yMode: {
    name: 'Accessibility Mode',
    description: 'Enable accessibility features',
    defaultValue: 'default',
    toolbar: {
      icon: 'accessibility',
      items: ['default', 'screen-reader', 'keyboard-only', 'high-contrast'],
      showName: true,
    },
  },
};

const withTheme = (Story, context) => {
  const theme = context.globals.theme;
  
  // Apply theme
  document.body.className = theme === 'high-contrast' ? 'high-contrast-math' : '';
  
  if (theme === 'dark') {
    document.documentElement.style.setProperty('--color-bg-primary', MathDesignTokens.colors.ui.background.inverse);
    document.documentElement.style.setProperty('--color-text-primary', MathDesignTokens.colors.ui.text.inverse);
  } else if (theme === 'high-contrast') {
    document.documentElement.style.setProperty('--color-bg-primary', MathDesignTokens.colors.highContrast.background);
    document.documentElement.style.setProperty('--color-text-primary', MathDesignTokens.colors.highContrast.foreground);
  } else {
    document.documentElement.style.setProperty('--color-bg-primary', MathDesignTokens.colors.ui.background.primary);
    document.documentElement.style.setProperty('--color-text-primary', MathDesignTokens.colors.ui.text.primary);
  }
  
  return Story();
};

const withMathJax = (Story, context) => {
  const mathMode = context.globals.mathMode;
  
  if (mathMode === 'enabled' && window.MathJax) {
    // Re-render math after story renders
    setTimeout(() => {
      window.MathJax.typesetPromise?.();
    }, 100);
  }
  
  return Story();
};

const withAccessibility = (Story, context) => {
  const a11yMode = context.globals.a11yMode;
  
  // Initialize accessibility features
  if (!window.mathAccessibility) {
    window.mathAccessibility = new MathAccessibility();
  }
  
  // Apply accessibility mode
  switch (a11yMode) {
    case 'screen-reader':
      window.mathAccessibility.config.screenReader.verbosity = 'verbose';
      break;
    case 'keyboard-only':
      window.mathAccessibility.config.keyboard.enabled = true;
      document.body.classList.add('keyboard-navigation');
      break;
    case 'high-contrast':
      window.mathAccessibility.config.visual.highContrast = true;
      window.mathAccessibility.applyHighContrast();
      break;
    default:
      // Reset to defaults
      break;
  }
  
  return Story();
};

export const decorators = [withTheme, withMathJax, withAccessibility];

// Custom viewport for responsive testing
export const customViewports = {
  mathMobile: {
    name: 'Math Mobile',
    styles: {
      width: '375px',
      height: '812px',
    },
  },
  mathTablet: {
    name: 'Math Tablet',
    styles: {
      width: '768px',
      height: '1024px',
    },
  },
  mathDesktop: {
    name: 'Math Desktop',
    styles: {
      width: '1440px',
      height: '900px',
    },
  },
};

// Storybook-specific styles
const style = document.createElement('style');
style.textContent = `
  /* Storybook preview styles */
  .sb-show-main {
    padding: 1rem;
  }
  
  .sb-show-main.sb-main-padded {
    padding: 2rem;
  }
  
  /* Math expression preview styles */
  .math-preview-container {
    border: 1px dashed var(--color-border-light);
    border-radius: var(--radius-md);
    padding: var(--spacing-4);
    margin: var(--spacing-4) 0;
    background-color: var(--color-bg-secondary);
  }
  
  /* Component preview grid */
  .component-preview-grid {
    display: grid;
    gap: var(--spacing-4);
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  
  /* Accessibility indicator */
  .a11y-indicator {
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 5px 10px;
    background: var(--color-info);
    color: white;
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    z-index: 9999;
  }
`;
document.head.appendChild(style);