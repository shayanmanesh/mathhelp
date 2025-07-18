// Accessibility System - WCAG 2.1 AA Compliance
// Handles form labels, heading hierarchy, color contrast, and screen reader support

class AccessibilitySystem {
    constructor() {
        this.contrastRatios = {
            AA: {
                normal: 4.5,
                large: 3.0
            },
            AAA: {
                normal: 7.0,
                large: 4.5
            }
        };
        
        this.improvedColors = {
            text: {
                primary: '#212529',      // High contrast dark gray
                secondary: '#495057',    // Medium contrast gray
                light: '#6c757d',       // Accessible light gray
                inverse: '#ffffff'      // White on dark backgrounds
            },
            backgrounds: {
                primary: '#ffffff',     // White
                secondary: '#f8f9fa',   // Light gray
                dark: '#212529',        // Dark for inverse
                accent: '#e9ecef'       // Accent background
            },
            interactive: {
                link: '#0056b3',        // Accessible blue (WCAG AA)
                linkHover: '#004085',   // Darker blue on hover
                linkVisited: '#6f42c1', // Purple for visited
                focus: '#0056b3',       // Focus outline color
                error: '#dc3545',       // Error red
                success: '#28a745'      // Success green
            }
        };
        
        this.init();
    }

    init() {
        this.fixFormAccessibility();
        this.fixHeadingHierarchy();
        this.improveColorContrast();
        this.addSkipNavigation();
        this.enhanceKeyboardNavigation();
        this.addAriaLabels();
    }

    // Fix all form accessibility issues
    fixFormAccessibility() {
        // Find all form inputs without labels
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Check if input has associated label
            const id = input.id || this.generateUniqueId('input');
            input.id = id;
            
            // Check for existing label
            let label = document.querySelector(`label[for="${id}"]`);
            
            if (!label && !input.getAttribute('aria-label')) {
                // Try to find parent label
                label = input.closest('label');
                
                if (!label) {
                    // Create label based on input attributes
                    const labelText = this.generateLabelText(input);
                    
                    if (input.type === 'submit' || input.type === 'button') {
                        // Buttons should use aria-label
                        input.setAttribute('aria-label', labelText);
                    } else {
                        // Create visible or screen-reader only label
                        label = document.createElement('label');
                        label.setAttribute('for', id);
                        label.textContent = labelText;
                        
                        // Insert label before input
                        input.parentNode.insertBefore(label, input);
                    }
                }
            }
            
            // Add required aria attributes
            if (input.hasAttribute('required')) {
                input.setAttribute('aria-required', 'true');
            }
            
            // Add error messages association
            const errorElement = input.parentElement.querySelector('.error-message');
            if (errorElement) {
                const errorId = errorElement.id || this.generateUniqueId('error');
                errorElement.id = errorId;
                input.setAttribute('aria-describedby', errorId);
            }
        });

        // Fix select elements
        document.querySelectorAll('select').forEach(select => {
            if (!select.getAttribute('aria-label') && !document.querySelector(`label[for="${select.id}"]`)) {
                const label = document.createElement('label');
                label.setAttribute('for', select.id || this.generateUniqueId('select'));
                label.textContent = this.generateLabelText(select);
                select.parentNode.insertBefore(label, select);
            }
        });
    }

    // Generate appropriate label text based on input
    generateLabelText(input) {
        // Check common attributes for label hints
        const placeholder = input.getAttribute('placeholder');
        const name = input.getAttribute('name');
        const type = input.getAttribute('type');
        
        if (placeholder) {
            return placeholder;
        }
        
        if (name) {
            // Convert name to readable format
            return name
                .replace(/([A-Z])/g, ' $1')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase())
                .trim();
        }
        
        // Default labels based on type
        const defaultLabels = {
            'email': 'Email Address',
            'password': 'Password',
            'search': 'Search',
            'tel': 'Phone Number',
            'url': 'Website URL',
            'number': 'Number',
            'date': 'Date',
            'time': 'Time'
        };
        
        return defaultLabels[type] || 'Input Field';
    }

    // Fix heading hierarchy issues
    fixHeadingHierarchy() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        const headingIssues = [];
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.substring(1));
            
            // Check for skipped levels
            if (lastLevel > 0 && level > lastLevel + 1) {
                headingIssues.push({
                    element: heading,
                    issue: `Skipped heading level from H${lastLevel} to H${level}`,
                    suggestedLevel: lastLevel + 1
                });
            }
            
            // Check for multiple H1s
            if (level === 1 && document.querySelectorAll('h1').length > 1) {
                if (index > 0) {
                    headingIssues.push({
                        element: heading,
                        issue: 'Multiple H1 tags found',
                        suggestedLevel: 2
                    });
                }
            }
            
            lastLevel = level;
        });
        
        // Fix heading issues
        headingIssues.forEach(issue => {
            console.warn(`Heading hierarchy issue: ${issue.issue}`);
            // Optionally fix automatically
            // const newHeading = document.createElement(`h${issue.suggestedLevel}`);
            // newHeading.innerHTML = issue.element.innerHTML;
            // newHeading.className = issue.element.className;
            // issue.element.parentNode.replaceChild(newHeading, issue.element);
        });
    }

    // Improve color contrast throughout the site
    improveColorContrast() {
        // Create and inject improved color CSS
        const contrastCSS = `
            /* High Contrast Color Improvements */
            :root {
                --text-primary: ${this.improvedColors.text.primary};
                --text-secondary: ${this.improvedColors.text.secondary};
                --text-light: ${this.improvedColors.text.light};
                --bg-primary: ${this.improvedColors.backgrounds.primary};
                --bg-secondary: ${this.improvedColors.backgrounds.secondary};
                --link-color: ${this.improvedColors.interactive.link};
                --link-hover: ${this.improvedColors.interactive.linkHover};
                --link-visited: ${this.improvedColors.interactive.linkVisited};
                --focus-color: ${this.improvedColors.interactive.focus};
            }
            
            /* Ensure sufficient contrast for body text */
            body {
                color: var(--text-primary);
                background-color: var(--bg-primary);
            }
            
            /* Improve link contrast */
            a {
                color: var(--link-color);
                text-decoration: underline;
            }
            
            a:hover {
                color: var(--link-hover);
            }
            
            a:visited {
                color: var(--link-visited);
            }
            
            /* Focus indicators */
            a:focus,
            button:focus,
            input:focus,
            select:focus,
            textarea:focus {
                outline: 3px solid var(--focus-color);
                outline-offset: 2px;
            }
            
            /* High contrast buttons */
            button, .btn {
                background-color: var(--link-color);
                color: white;
                border: 2px solid transparent;
                font-weight: 600;
            }
            
            button:hover, .btn:hover {
                background-color: var(--link-hover);
            }
            
            /* Form labels */
            label {
                color: var(--text-primary);
                font-weight: 600;
                margin-bottom: 0.25rem;
                display: block;
            }
            
            /* Placeholder text with sufficient contrast */
            ::placeholder {
                color: var(--text-light);
                opacity: 1;
            }
            
            /* Error messages */
            .error-message {
                color: ${this.improvedColors.interactive.error};
                font-weight: 600;
            }
            
            /* Success messages */
            .success-message {
                color: ${this.improvedColors.interactive.success};
                font-weight: 600;
            }
            
            /* Ensure text on colored backgrounds has contrast */
            .primary-bg {
                background-color: var(--link-color);
                color: white;
            }
            
            .dark-bg {
                background-color: var(--text-primary);
                color: white;
            }
            
            /* High contrast mode support */
            @media (prefers-contrast: high) {
                :root {
                    --text-primary: #000000;
                    --bg-primary: #ffffff;
                    --link-color: #0000ee;
                    --link-visited: #551a8b;
                }
                
                * {
                    border-color: #000000 !important;
                }
            }
            
            /* Dark mode with high contrast */
            @media (prefers-color-scheme: dark) {
                :root {
                    --text-primary: #ffffff;
                    --text-secondary: #e9ecef;
                    --text-light: #adb5bd;
                    --bg-primary: #121212;
                    --bg-secondary: #1e1e1e;
                    --link-color: #4dabf7;
                    --link-hover: #74c0fc;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'accessibility-contrast-styles';
        styleSheet.textContent = contrastCSS;
        document.head.appendChild(styleSheet);
    }

    // Add skip navigation for screen readers
    addSkipNavigation() {
        if (document.getElementById('skip-navigation')) return;
        
        const skipNav = document.createElement('div');
        skipNav.id = 'skip-navigation';
        skipNav.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#main-navigation" class="skip-link">Skip to navigation</a>
            <a href="#search" class="skip-link">Skip to search</a>
        `;
        
        // Add skip navigation styles
        const skipNavStyles = `
            .skip-link {
                position: absolute;
                top: -40px;
                left: 0;
                background: var(--link-color);
                color: white;
                padding: 8px;
                text-decoration: none;
                font-weight: 600;
                z-index: 100;
            }
            
            .skip-link:focus {
                top: 0;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = skipNavStyles;
        document.head.appendChild(styleSheet);
        
        // Insert at the beginning of body
        document.body.insertBefore(skipNav, document.body.firstChild);
        
        // Ensure main content has ID
        const main = document.querySelector('main') || document.querySelector('[role="main"]');
        if (main && !main.id) {
            main.id = 'main-content';
        }
    }

    // Enhance keyboard navigation
    enhanceKeyboardNavigation() {
        // Add keyboard event listeners for custom components
        document.addEventListener('keydown', (e) => {
            // Tab navigation improvements
            if (e.key === 'Tab') {
                const activeElement = document.activeElement;
                
                // Ensure focus is visible
                if (activeElement) {
                    activeElement.classList.add('keyboard-focus');
                }
            }
            
            // Escape key closes modals/dropdowns
            if (e.key === 'Escape') {
                this.closeActiveModals();
            }
            
            // Arrow key navigation for menus
            if (e.key.startsWith('Arrow')) {
                this.handleArrowKeyNavigation(e);
            }
        });
        
        // Remove focus indicator on mouse click
        document.addEventListener('mousedown', () => {
            document.querySelectorAll('.keyboard-focus').forEach(el => {
                el.classList.remove('keyboard-focus');
            });
        });
    }

    // Add comprehensive ARIA labels
    addAriaLabels() {
        // Navigation
        const nav = document.querySelector('nav') || document.querySelector('.main-nav');
        if (nav && !nav.getAttribute('aria-label')) {
            nav.setAttribute('aria-label', 'Main navigation');
        }
        
        // Search forms
        document.querySelectorAll('form[role="search"], .search-form').forEach(form => {
            form.setAttribute('role', 'search');
            form.setAttribute('aria-label', 'Site search');
        });
        
        // Buttons without text
        document.querySelectorAll('button').forEach(button => {
            if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
                // Try to determine purpose from class or icon
                if (button.querySelector('.fa-search') || button.classList.contains('search')) {
                    button.setAttribute('aria-label', 'Search');
                } else if (button.querySelector('.fa-close') || button.classList.contains('close')) {
                    button.setAttribute('aria-label', 'Close');
                } else if (button.querySelector('.fa-menu') || button.classList.contains('menu')) {
                    button.setAttribute('aria-label', 'Menu');
                }
            }
        });
        
        // Images
        document.querySelectorAll('img').forEach(img => {
            if (!img.getAttribute('alt')) {
                if (img.classList.contains('logo')) {
                    img.setAttribute('alt', 'Math Help logo');
                } else if (img.classList.contains('decorative')) {
                    img.setAttribute('alt', '');
                    img.setAttribute('role', 'presentation');
                } else {
                    // Generate alt text from src or surrounding context
                    const altText = this.generateAltText(img);
                    img.setAttribute('alt', altText);
                }
            }
        });
        
        // Tables
        document.querySelectorAll('table').forEach(table => {
            if (!table.querySelector('caption') && !table.getAttribute('aria-label')) {
                table.setAttribute('aria-label', 'Data table');
            }
        });
    }

    // Helper functions
    generateUniqueId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generateAltText(img) {
        const src = img.src;
        const fileName = src.split('/').pop().split('.')[0];
        return fileName
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    closeActiveModals() {
        document.querySelectorAll('.modal.show, .dropdown.show').forEach(element => {
            element.classList.remove('show');
        });
    }

    handleArrowKeyNavigation(e) {
        const menuItems = document.querySelectorAll('[role="menuitem"]');
        if (menuItems.length === 0) return;
        
        const currentIndex = Array.from(menuItems).indexOf(document.activeElement);
        let nextIndex;
        
        switch (e.key) {
            case 'ArrowDown':
                nextIndex = currentIndex + 1 < menuItems.length ? currentIndex + 1 : 0;
                break;
            case 'ArrowUp':
                nextIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : menuItems.length - 1;
                break;
            default:
                return;
        }
        
        e.preventDefault();
        menuItems[nextIndex].focus();
    }

    // Check contrast ratio between two colors
    checkContrastRatio(foreground, background) {
        const getLuminance = (color) => {
            const rgb = color.match(/\d+/g);
            const sRGB = rgb.map(val => {
                val = val / 255;
                return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
        };
        
        const l1 = getLuminance(foreground);
        const l2 = getLuminance(background);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        
        return {
            ratio: ratio,
            passesAA: ratio >= this.contrastRatios.AA.normal,
            passesAAA: ratio >= this.contrastRatios.AAA.normal
        };
    }
}

// Initialize accessibility system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.accessibilitySystem = new AccessibilitySystem();
});