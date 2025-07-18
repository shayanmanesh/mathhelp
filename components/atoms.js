// Atomic Design System - Atoms
// Base building blocks for Math Help UI

// ============================================
// BUTTON ATOMS
// ============================================

class Button {
    constructor(options = {}) {
        this.variant = options.variant || 'primary'; // primary, secondary, tertiary, ghost, danger
        this.size = options.size || 'medium'; // small, medium, large
        this.icon = options.icon || null;
        this.loading = options.loading || false;
        this.disabled = options.disabled || false;
        this.fullWidth = options.fullWidth || false;
    }

    render(text, onClick) {
        const button = document.createElement('button');
        button.className = this.getClassNames();
        button.disabled = this.disabled || this.loading;
        button.onclick = onClick;
        
        if (this.loading) {
            button.innerHTML = `
                <span class="button-spinner"></span>
                <span class="button-text">Loading...</span>
            `;
        } else {
            button.innerHTML = `
                ${this.icon ? `<span class="button-icon">${this.icon}</span>` : ''}
                <span class="button-text">${text}</span>
            `;
        }
        
        return button;
    }

    getClassNames() {
        const classes = [
            'btn',
            `btn-${this.variant}`,
            `btn-${this.size}`,
            this.fullWidth ? 'btn-full' : '',
            this.loading ? 'btn-loading' : '',
            this.disabled ? 'btn-disabled' : ''
        ];
        return classes.filter(c => c).join(' ');
    }
}

// ============================================
// INPUT ATOMS
// ============================================

class Input {
    constructor(options = {}) {
        this.type = options.type || 'text'; // text, number, email, password, search
        this.size = options.size || 'medium';
        this.variant = options.variant || 'default'; // default, math, error, success
        this.icon = options.icon || null;
        this.placeholder = options.placeholder || '';
        this.required = options.required || false;
        this.pattern = options.pattern || null;
        this.mathMode = options.mathMode || false; // For LaTeX input
    }

    render(name, value = '') {
        const wrapper = document.createElement('div');
        wrapper.className = `input-wrapper input-${this.size} input-${this.variant}`;
        
        const input = document.createElement('input');
        input.type = this.type;
        input.name = name;
        input.id = name;
        input.value = value;
        input.placeholder = this.placeholder;
        input.required = this.required;
        input.className = 'input-field';
        
        if (this.pattern) {
            input.pattern = this.pattern;
        }
        
        if (this.mathMode) {
            input.className += ' math-input';
            input.setAttribute('data-math-mode', 'true');
        }
        
        let html = '';
        if (this.icon) {
            html += `<span class="input-icon">${this.icon}</span>`;
        }
        
        wrapper.appendChild(input);
        
        if (this.mathMode) {
            const preview = document.createElement('div');
            preview.className = 'math-preview';
            preview.id = `${name}-preview`;
            wrapper.appendChild(preview);
            
            // Add math rendering on input
            input.addEventListener('input', (e) => {
                this.renderMathPreview(e.target.value, preview);
            });
        }
        
        return wrapper;
    }

    renderMathPreview(latex, previewElement) {
        if (window.katex) {
            try {
                katex.render(latex, previewElement, {
                    throwOnError: false,
                    displayMode: true
                });
            } catch (e) {
                previewElement.textContent = 'Invalid expression';
            }
        }
    }
}

// ============================================
// TYPOGRAPHY ATOMS
// ============================================

class Typography {
    static Heading(level, text, options = {}) {
        const HeadingTag = `h${level}`;
        const heading = document.createElement(HeadingTag);
        heading.className = `heading heading-${level} ${options.className || ''}`;
        heading.textContent = text;
        
        if (options.subheading) {
            const sub = document.createElement('span');
            sub.className = 'heading-sub';
            sub.textContent = options.subheading;
            heading.appendChild(sub);
        }
        
        return heading;
    }

    static Paragraph(text, options = {}) {
        const p = document.createElement('p');
        p.className = `paragraph ${options.size || 'medium'} ${options.className || ''}`;
        p.innerHTML = text; // Allow for inline formatting
        return p;
    }

    static Label(text, forInput, options = {}) {
        const label = document.createElement('label');
        label.htmlFor = forInput;
        label.className = `label ${options.required ? 'label-required' : ''} ${options.className || ''}`;
        label.textContent = text;
        
        if (options.required) {
            const asterisk = document.createElement('span');
            asterisk.className = 'required-asterisk';
            asterisk.textContent = ' *';
            label.appendChild(asterisk);
        }
        
        if (options.helper) {
            const helper = document.createElement('span');
            helper.className = 'label-helper';
            helper.textContent = options.helper;
            label.appendChild(helper);
        }
        
        return label;
    }

    static MathExpression(latex, options = {}) {
        const span = document.createElement('span');
        span.className = `math-expression ${options.display ? 'math-display' : 'math-inline'}`;
        span.setAttribute('data-latex', latex);
        
        if (window.katex) {
            katex.render(latex, span, {
                throwOnError: false,
                displayMode: options.display || false
            });
        } else {
            span.textContent = latex;
        }
        
        return span;
    }
}

// ============================================
// ICON ATOMS
// ============================================

class Icon {
    static icons = {
        // Math operations
        plus: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
        minus: '<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>',
        multiply: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
        divide: '<svg viewBox="0 0 24 24"><circle cx="12" cy="6" r="2"/><path d="M5 11h14v2H5z"/><circle cx="12" cy="18" r="2"/></svg>',
        equals: '<svg viewBox="0 0 24 24"><path d="M19 10H5V8h14v2zm0 4H5v2h14v-2z"/></svg>',
        
        // Navigation
        arrow_right: '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>',
        arrow_left: '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',
        arrow_down: '<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>',
        arrow_up: '<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>',
        
        // Actions
        check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
        close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
        search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
        help: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',
        
        // Educational
        book: '<svg viewBox="0 0 24 24"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.95V8c1.35-1.1 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>',
        calculator: '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm10 2h-6v-2h6v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm-4 4h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>',
        graph: '<svg viewBox="0 0 24 24"><path d="M3 13h2v7H3zm4-8h2v12H7zm4 4h2v8h-2zm4-2h2v10h-2zm4-4h2v14h-2z"/></svg>',
        
        // Feedback
        star: '<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
        star_outline: '<svg viewBox="0 0 24 24"><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>',
        error: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
        success: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
        warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>'
    };

    static render(name, options = {}) {
        const iconSvg = this.icons[name] || this.icons.help;
        const wrapper = document.createElement('span');
        wrapper.className = `icon icon-${name} ${options.size || 'medium'} ${options.className || ''}`;
        wrapper.innerHTML = iconSvg;
        
        if (options.color) {
            wrapper.style.color = options.color;
        }
        
        return wrapper;
    }
}

// ============================================
// BADGE ATOMS
// ============================================

class Badge {
    constructor(options = {}) {
        this.variant = options.variant || 'default'; // default, primary, success, warning, danger, info
        this.size = options.size || 'medium';
        this.rounded = options.rounded || false;
        this.icon = options.icon || null;
    }

    render(text) {
        const badge = document.createElement('span');
        badge.className = `badge badge-${this.variant} badge-${this.size} ${this.rounded ? 'badge-rounded' : ''}`;
        
        if (this.icon) {
            badge.appendChild(Icon.render(this.icon, { size: 'small' }));
        }
        
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        badge.appendChild(textSpan);
        
        return badge;
    }
}

// ============================================
// LOADING ATOMS
// ============================================

class Loading {
    static Spinner(options = {}) {
        const spinner = document.createElement('div');
        spinner.className = `spinner spinner-${options.size || 'medium'} ${options.className || ''}`;
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'spinner-dot';
            spinner.appendChild(dot);
        }
        
        return spinner;
    }

    static Skeleton(options = {}) {
        const skeleton = document.createElement('div');
        skeleton.className = `skeleton skeleton-${options.type || 'text'} ${options.className || ''}`;
        
        if (options.width) skeleton.style.width = options.width;
        if (options.height) skeleton.style.height = options.height;
        
        return skeleton;
    }

    static ProgressBar(value, max = 100, options = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = `progress-bar ${options.className || ''}`;
        
        const bar = document.createElement('div');
        bar.className = `progress-bar-fill progress-bar-${options.variant || 'primary'}`;
        bar.style.width = `${(value / max) * 100}%`;
        
        if (options.showValue) {
            const label = document.createElement('span');
            label.className = 'progress-bar-label';
            label.textContent = `${Math.round((value / max) * 100)}%`;
            bar.appendChild(label);
        }
        
        wrapper.appendChild(bar);
        return wrapper;
    }
}

// ============================================
// DIVIDER ATOMS
// ============================================

class Divider {
    static Horizontal(options = {}) {
        const divider = document.createElement('hr');
        divider.className = `divider divider-horizontal ${options.className || ''}`;
        
        if (options.margin) {
            divider.style.margin = options.margin;
        }
        
        return divider;
    }

    static Vertical(options = {}) {
        const divider = document.createElement('div');
        divider.className = `divider divider-vertical ${options.className || ''}`;
        
        if (options.height) {
            divider.style.height = options.height;
        }
        
        return divider;
    }

    static WithText(text, options = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = `divider-wrapper ${options.className || ''}`;
        
        const leftLine = document.createElement('div');
        leftLine.className = 'divider-line';
        
        const textElement = document.createElement('span');
        textElement.className = 'divider-text';
        textElement.textContent = text;
        
        const rightLine = document.createElement('div');
        rightLine.className = 'divider-line';
        
        wrapper.appendChild(leftLine);
        wrapper.appendChild(textElement);
        wrapper.appendChild(rightLine);
        
        return wrapper;
    }
}

// ============================================
// TOOLTIP ATOM
// ============================================

class Tooltip {
    constructor(options = {}) {
        this.position = options.position || 'top'; // top, right, bottom, left
        this.trigger = options.trigger || 'hover'; // hover, click
        this.delay = options.delay || 200;
    }

    render(content, targetElement) {
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip-${this.position}`;
        tooltip.innerHTML = content;
        
        if (this.trigger === 'hover') {
            let timeout;
            targetElement.addEventListener('mouseenter', () => {
                timeout = setTimeout(() => {
                    this.show(tooltip, targetElement);
                }, this.delay);
            });
            
            targetElement.addEventListener('mouseleave', () => {
                clearTimeout(timeout);
                this.hide(tooltip);
            });
        } else if (this.trigger === 'click') {
            targetElement.addEventListener('click', (e) => {
                e.stopPropagation();
                if (tooltip.classList.contains('tooltip-visible')) {
                    this.hide(tooltip);
                } else {
                    this.show(tooltip, targetElement);
                }
            });
            
            document.addEventListener('click', () => {
                this.hide(tooltip);
            });
        }
        
        return tooltip;
    }

    show(tooltip, target) {
        document.body.appendChild(tooltip);
        const rect = target.getBoundingClientRect();
        
        // Position tooltip based on position prop
        const positions = {
            top: {
                top: rect.top - tooltip.offsetHeight - 8,
                left: rect.left + (rect.width - tooltip.offsetWidth) / 2
            },
            bottom: {
                top: rect.bottom + 8,
                left: rect.left + (rect.width - tooltip.offsetWidth) / 2
            },
            left: {
                top: rect.top + (rect.height - tooltip.offsetHeight) / 2,
                left: rect.left - tooltip.offsetWidth - 8
            },
            right: {
                top: rect.top + (rect.height - tooltip.offsetHeight) / 2,
                left: rect.right + 8
            }
        };
        
        const pos = positions[this.position];
        tooltip.style.top = `${pos.top}px`;
        tooltip.style.left = `${pos.left}px`;
        tooltip.classList.add('tooltip-visible');
    }

    hide(tooltip) {
        tooltip.classList.remove('tooltip-visible');
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 200);
    }
}

// Export all atoms
const Atoms = {
    Button,
    Input,
    Typography,
    Icon,
    Badge,
    Loading,
    Divider,
    Tooltip
};

window.MathHelpAtoms = Atoms;