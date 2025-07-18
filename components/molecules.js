// Atomic Design System - Molecules
// Combinations of atoms forming functional UI components

// ============================================
// SEARCH BAR MOLECULE
// ============================================

class SearchBar {
    constructor(options = {}) {
        this.placeholder = options.placeholder || 'Search...';
        this.onSearch = options.onSearch || (() => {});
        this.suggestions = options.suggestions || [];
        this.mathMode = options.mathMode || false;
        this.filters = options.filters || null;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'search-bar-wrapper';
        
        // Search input container
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-bar';
        
        // Search icon
        const searchIcon = MathHelpAtoms.Icon.render('search', { size: 'small' });
        searchContainer.appendChild(searchIcon);
        
        // Input
        const input = new MathHelpAtoms.Input({
            type: 'search',
            placeholder: this.placeholder,
            mathMode: this.mathMode
        });
        const inputElement = input.render('search-input');
        searchContainer.appendChild(inputElement);
        
        // Search button
        const searchBtn = new MathHelpAtoms.Button({
            variant: 'primary',
            size: 'medium'
        });
        searchContainer.appendChild(searchBtn.render('Search', () => {
            const value = inputElement.querySelector('input').value;
            this.onSearch(value);
        }));
        
        wrapper.appendChild(searchContainer);
        
        // Filters
        if (this.filters) {
            const filterContainer = document.createElement('div');
            filterContainer.className = 'search-filters';
            
            this.filters.forEach(filter => {
                const filterChip = document.createElement('button');
                filterChip.className = 'filter-chip';
                filterChip.textContent = filter.label;
                filterChip.onclick = () => {
                    filterChip.classList.toggle('active');
                    filter.onChange(filterChip.classList.contains('active'));
                };
                filterContainer.appendChild(filterChip);
            });
            
            wrapper.appendChild(filterContainer);
        }
        
        // Suggestions dropdown
        if (this.suggestions.length > 0) {
            const suggestionsDropdown = this.createSuggestionsDropdown();
            wrapper.appendChild(suggestionsDropdown);
            
            // Show/hide suggestions on input
            const inputField = inputElement.querySelector('input');
            inputField.addEventListener('focus', () => {
                suggestionsDropdown.classList.add('visible');
            });
            
            inputField.addEventListener('blur', () => {
                setTimeout(() => {
                    suggestionsDropdown.classList.remove('visible');
                }, 200);
            });
        }
        
        return wrapper;
    }

    createSuggestionsDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'search-suggestions';
        
        this.suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <span class="suggestion-icon">${MathHelpAtoms.Icon.render(suggestion.icon || 'search', { size: 'small' }).outerHTML}</span>
                <span class="suggestion-text">${suggestion.text}</span>
                ${suggestion.category ? `<span class="suggestion-category">${suggestion.category}</span>` : ''}
            `;
            item.onclick = () => this.onSearch(suggestion.text);
            dropdown.appendChild(item);
        });
        
        return dropdown;
    }
}

// ============================================
// MATH EXPRESSION MOLECULE
// ============================================

class MathExpression {
    constructor(options = {}) {
        this.latex = options.latex || '';
        this.editable = options.editable || false;
        this.showSteps = options.showSteps || false;
        this.showCopyButton = options.showCopyButton || true;
        this.size = options.size || 'medium'; // small, medium, large
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = `math-expression-wrapper math-expression-${this.size}`;
        
        // Expression display
        const expressionContainer = document.createElement('div');
        expressionContainer.className = 'math-expression-display';
        
        if (this.editable) {
            const input = new MathHelpAtoms.Input({
                type: 'text',
                mathMode: true,
                placeholder: 'Enter LaTeX expression...'
            });
            const inputElement = input.render('math-expression-input', this.latex);
            expressionContainer.appendChild(inputElement);
        } else {
            const expression = MathHelpAtoms.Typography.MathExpression(this.latex, { display: true });
            expressionContainer.appendChild(expression);
        }
        
        wrapper.appendChild(expressionContainer);
        
        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'math-expression-actions';
        
        if (this.showCopyButton) {
            const copyBtn = new MathHelpAtoms.Button({
                variant: 'ghost',
                size: 'small',
                icon: MathHelpAtoms.Icon.render('copy', { size: 'small' }).outerHTML
            });
            actions.appendChild(copyBtn.render('Copy', () => {
                navigator.clipboard.writeText(this.latex);
                this.showToast('Copied to clipboard!');
            }));
        }
        
        if (this.showSteps) {
            const stepsBtn = new MathHelpAtoms.Button({
                variant: 'ghost',
                size: 'small',
                icon: MathHelpAtoms.Icon.render('book', { size: 'small' }).outerHTML
            });
            actions.appendChild(stepsBtn.render('Show Steps', () => {
                this.toggleSteps(wrapper);
            }));
        }
        
        wrapper.appendChild(actions);
        
        return wrapper;
    }

    toggleSteps(wrapper) {
        let stepsContainer = wrapper.querySelector('.math-expression-steps');
        
        if (!stepsContainer) {
            stepsContainer = document.createElement('div');
            stepsContainer.className = 'math-expression-steps';
            stepsContainer.innerHTML = this.generateSteps();
            wrapper.appendChild(stepsContainer);
        }
        
        stepsContainer.classList.toggle('visible');
    }

    generateSteps() {
        // This would be dynamically generated based on the expression
        return `
            <div class="step">
                <span class="step-number">1</span>
                <span class="step-description">Identify the expression type</span>
            </div>
            <div class="step">
                <span class="step-number">2</span>
                <span class="step-description">Apply appropriate rules</span>
            </div>
        `;
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('visible');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// ============================================
// PROBLEM CARD MOLECULE
// ============================================

class ProblemCard {
    constructor(options = {}) {
        this.problem = options.problem || {};
        this.showDifficulty = options.showDifficulty !== false;
        this.showTopic = options.showTopic !== false;
        this.interactive = options.interactive || false;
        this.onSolve = options.onSolve || (() => {});
        this.onBookmark = options.onBookmark || (() => {});
    }

    render() {
        const card = document.createElement('div');
        card.className = 'problem-card';
        
        // Header
        const header = document.createElement('div');
        header.className = 'problem-card-header';
        
        if (this.showDifficulty) {
            const difficulty = new MathHelpAtoms.Badge({
                variant: this.getDifficultyVariant(this.problem.difficulty),
                size: 'small'
            });
            header.appendChild(difficulty.render(this.problem.difficulty));
        }
        
        if (this.showTopic) {
            const topic = new MathHelpAtoms.Badge({
                variant: 'default',
                size: 'small'
            });
            header.appendChild(topic.render(this.problem.topic));
        }
        
        const bookmarkBtn = document.createElement('button');
        bookmarkBtn.className = 'bookmark-btn';
        bookmarkBtn.innerHTML = MathHelpAtoms.Icon.render(
            this.problem.bookmarked ? 'bookmark_filled' : 'bookmark_outline',
            { size: 'small' }
        ).outerHTML;
        bookmarkBtn.onclick = () => {
            this.problem.bookmarked = !this.problem.bookmarked;
            bookmarkBtn.innerHTML = MathHelpAtoms.Icon.render(
                this.problem.bookmarked ? 'bookmark_filled' : 'bookmark_outline',
                { size: 'small' }
            ).outerHTML;
            this.onBookmark(this.problem);
        };
        header.appendChild(bookmarkBtn);
        
        card.appendChild(header);
        
        // Problem content
        const content = document.createElement('div');
        content.className = 'problem-card-content';
        
        const title = MathHelpAtoms.Typography.Heading(3, this.problem.title);
        content.appendChild(title);
        
        const description = MathHelpAtoms.Typography.Paragraph(this.problem.description);
        content.appendChild(description);
        
        if (this.problem.expression) {
            const mathExpression = new MathExpression({
                latex: this.problem.expression,
                size: 'medium',
                showCopyButton: true
            });
            content.appendChild(mathExpression.render());
        }
        
        card.appendChild(content);
        
        // Interactive section
        if (this.interactive) {
            const interactiveSection = this.createInteractiveSection();
            card.appendChild(interactiveSection);
        }
        
        // Footer
        const footer = document.createElement('div');
        footer.className = 'problem-card-footer';
        
        const solveBtn = new MathHelpAtoms.Button({
            variant: 'primary',
            size: 'medium',
            fullWidth: true
        });
        footer.appendChild(solveBtn.render('Solve Problem', () => {
            this.onSolve(this.problem);
        }));
        
        card.appendChild(footer);
        
        return card;
    }

    getDifficultyVariant(difficulty) {
        const variants = {
            'Easy': 'success',
            'Medium': 'warning',
            'Hard': 'danger'
        };
        return variants[difficulty] || 'default';
    }

    createInteractiveSection() {
        const section = document.createElement('div');
        section.className = 'problem-interactive';
        
        const input = new MathHelpAtoms.Input({
            type: 'text',
            placeholder: 'Enter your answer...',
            mathMode: true
        });
        section.appendChild(input.render('problem-answer'));
        
        const checkBtn = new MathHelpAtoms.Button({
            variant: 'secondary',
            size: 'medium',
            icon: MathHelpAtoms.Icon.render('check', { size: 'small' }).outerHTML
        });
        section.appendChild(checkBtn.render('Check Answer', () => {
            const answer = section.querySelector('input').value;
            this.checkAnswer(answer, section);
        }));
        
        return section;
    }

    checkAnswer(answer, container) {
        const feedback = document.createElement('div');
        feedback.className = 'answer-feedback';
        
        // This would normally validate against the correct answer
        const isCorrect = Math.random() > 0.5; // Dummy validation
        
        if (isCorrect) {
            feedback.className += ' correct';
            feedback.innerHTML = `
                ${MathHelpAtoms.Icon.render('success', { size: 'small' }).outerHTML}
                <span>Correct! Well done!</span>
            `;
        } else {
            feedback.className += ' incorrect';
            feedback.innerHTML = `
                ${MathHelpAtoms.Icon.render('error', { size: 'small' }).outerHTML}
                <span>Not quite. Try again!</span>
            `;
        }
        
        // Remove existing feedback
        const existingFeedback = container.querySelector('.answer-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        container.appendChild(feedback);
    }
}

// ============================================
// FORM FIELD MOLECULE
// ============================================

class FormField {
    constructor(options = {}) {
        this.label = options.label || '';
        this.name = options.name || '';
        this.type = options.type || 'text';
        this.required = options.required || false;
        this.helper = options.helper || '';
        this.error = options.error || '';
        this.value = options.value || '';
        this.placeholder = options.placeholder || '';
        this.options = options.options || []; // For select fields
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = `form-field ${this.error ? 'has-error' : ''}`;
        
        // Label
        if (this.label) {
            const label = MathHelpAtoms.Typography.Label(this.label, this.name, {
                required: this.required,
                helper: this.helper
            });
            wrapper.appendChild(label);
        }
        
        // Input field
        let inputElement;
        
        if (this.type === 'select') {
            inputElement = this.createSelect();
        } else if (this.type === 'textarea') {
            inputElement = this.createTextarea();
        } else {
            const input = new MathHelpAtoms.Input({
                type: this.type,
                placeholder: this.placeholder,
                required: this.required,
                variant: this.error ? 'error' : 'default'
            });
            inputElement = input.render(this.name, this.value);
        }
        
        wrapper.appendChild(inputElement);
        
        // Error message
        if (this.error) {
            const errorMsg = document.createElement('span');
            errorMsg.className = 'field-error';
            errorMsg.textContent = this.error;
            wrapper.appendChild(errorMsg);
        }
        
        return wrapper;
    }

    createSelect() {
        const wrapper = document.createElement('div');
        wrapper.className = 'select-wrapper';
        
        const select = document.createElement('select');
        select.name = this.name;
        select.id = this.name;
        select.required = this.required;
        select.className = `select-field ${this.error ? 'error' : ''}`;
        
        // Add placeholder option
        if (this.placeholder) {
            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.textContent = this.placeholder;
            placeholderOption.disabled = true;
            placeholderOption.selected = !this.value;
            select.appendChild(placeholderOption);
        }
        
        // Add options
        this.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            optionElement.selected = option.value === this.value;
            select.appendChild(optionElement);
        });
        
        wrapper.appendChild(select);
        
        // Add dropdown icon
        const dropdownIcon = MathHelpAtoms.Icon.render('arrow_down', { size: 'small' });
        wrapper.appendChild(dropdownIcon);
        
        return wrapper;
    }

    createTextarea() {
        const textarea = document.createElement('textarea');
        textarea.name = this.name;
        textarea.id = this.name;
        textarea.placeholder = this.placeholder;
        textarea.required = this.required;
        textarea.className = `textarea-field ${this.error ? 'error' : ''}`;
        textarea.value = this.value;
        textarea.rows = 4;
        
        return textarea;
    }
}

// ============================================
// STAT CARD MOLECULE
// ============================================

class StatCard {
    constructor(options = {}) {
        this.label = options.label || '';
        this.value = options.value || 0;
        this.unit = options.unit || '';
        this.trend = options.trend || null; // 'up', 'down', 'neutral'
        this.trendValue = options.trendValue || '';
        this.icon = options.icon || null;
        this.color = options.color || 'primary';
    }

    render() {
        const card = document.createElement('div');
        card.className = `stat-card stat-card-${this.color}`;
        
        // Icon
        if (this.icon) {
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'stat-card-icon';
            iconWrapper.appendChild(MathHelpAtoms.Icon.render(this.icon, { size: 'large' }));
            card.appendChild(iconWrapper);
        }
        
        // Content
        const content = document.createElement('div');
        content.className = 'stat-card-content';
        
        const valueWrapper = document.createElement('div');
        valueWrapper.className = 'stat-value-wrapper';
        
        const value = document.createElement('span');
        value.className = 'stat-value';
        value.textContent = this.formatValue(this.value);
        valueWrapper.appendChild(value);
        
        if (this.unit) {
            const unit = document.createElement('span');
            unit.className = 'stat-unit';
            unit.textContent = this.unit;
            valueWrapper.appendChild(unit);
        }
        
        content.appendChild(valueWrapper);
        
        const label = document.createElement('div');
        label.className = 'stat-label';
        label.textContent = this.label;
        content.appendChild(label);
        
        // Trend
        if (this.trend) {
            const trend = document.createElement('div');
            trend.className = `stat-trend trend-${this.trend}`;
            
            const trendIcon = this.trend === 'up' ? 'arrow_up' : 
                            this.trend === 'down' ? 'arrow_down' : 'minus';
            trend.appendChild(MathHelpAtoms.Icon.render(trendIcon, { size: 'small' }));
            
            if (this.trendValue) {
                const trendText = document.createElement('span');
                trendText.textContent = this.trendValue;
                trend.appendChild(trendText);
            }
            
            content.appendChild(trend);
        }
        
        card.appendChild(content);
        
        return card;
    }

    formatValue(value) {
        if (typeof value === 'number') {
            if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
            }
            return value.toLocaleString();
        }
        return value;
    }
}

// ============================================
// NAVIGATION ITEM MOLECULE
// ============================================

class NavigationItem {
    constructor(options = {}) {
        this.label = options.label || '';
        this.href = options.href || '#';
        this.icon = options.icon || null;
        this.badge = options.badge || null;
        this.active = options.active || false;
        this.children = options.children || [];
        this.onClick = options.onClick || null;
    }

    render() {
        const item = document.createElement('li');
        item.className = `nav-item ${this.active ? 'active' : ''} ${this.children.length > 0 ? 'has-children' : ''}`;
        
        const link = document.createElement('a');
        link.href = this.href;
        link.className = 'nav-link';
        
        if (this.onClick) {
            link.onclick = (e) => {
                e.preventDefault();
                this.onClick();
            };
        }
        
        // Icon
        if (this.icon) {
            link.appendChild(MathHelpAtoms.Icon.render(this.icon, { size: 'small' }));
        }
        
        // Label
        const labelSpan = document.createElement('span');
        labelSpan.className = 'nav-label';
        labelSpan.textContent = this.label;
        link.appendChild(labelSpan);
        
        // Badge
        if (this.badge) {
            const badge = new MathHelpAtoms.Badge({
                variant: 'primary',
                size: 'small',
                rounded: true
            });
            link.appendChild(badge.render(this.badge));
        }
        
        // Dropdown arrow for items with children
        if (this.children.length > 0) {
            const arrow = MathHelpAtoms.Icon.render('arrow_down', { size: 'small' });
            arrow.className = 'nav-arrow';
            link.appendChild(arrow);
        }
        
        item.appendChild(link);
        
        // Children
        if (this.children.length > 0) {
            const subMenu = document.createElement('ul');
            subMenu.className = 'nav-submenu';
            
            this.children.forEach(child => {
                const childItem = new NavigationItem(child);
                subMenu.appendChild(childItem.render());
            });
            
            item.appendChild(subMenu);
            
            // Toggle submenu
            link.addEventListener('click', (e) => {
                if (this.children.length > 0) {
                    e.preventDefault();
                    item.classList.toggle('expanded');
                }
            });
        }
        
        return item;
    }
}

// ============================================
// ALERT MOLECULE
// ============================================

class Alert {
    constructor(options = {}) {
        this.type = options.type || 'info'; // info, success, warning, error
        this.title = options.title || '';
        this.message = options.message || '';
        this.dismissible = options.dismissible !== false;
        this.icon = options.icon || this.getDefaultIcon();
        this.actions = options.actions || [];
    }

    render() {
        const alert = document.createElement('div');
        alert.className = `alert alert-${this.type} ${this.dismissible ? 'dismissible' : ''}`;
        
        // Icon
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'alert-icon';
        iconWrapper.appendChild(MathHelpAtoms.Icon.render(this.icon, { size: 'medium' }));
        alert.appendChild(iconWrapper);
        
        // Content
        const content = document.createElement('div');
        content.className = 'alert-content';
        
        if (this.title) {
            const title = document.createElement('div');
            title.className = 'alert-title';
            title.textContent = this.title;
            content.appendChild(title);
        }
        
        if (this.message) {
            const message = document.createElement('div');
            message.className = 'alert-message';
            message.textContent = this.message;
            content.appendChild(message);
        }
        
        // Actions
        if (this.actions.length > 0) {
            const actionsWrapper = document.createElement('div');
            actionsWrapper.className = 'alert-actions';
            
            this.actions.forEach(action => {
                const btn = new MathHelpAtoms.Button({
                    variant: action.variant || 'ghost',
                    size: 'small'
                });
                actionsWrapper.appendChild(btn.render(action.label, action.onClick));
            });
            
            content.appendChild(actionsWrapper);
        }
        
        alert.appendChild(content);
        
        // Dismiss button
        if (this.dismissible) {
            const dismissBtn = document.createElement('button');
            dismissBtn.className = 'alert-dismiss';
            dismissBtn.innerHTML = MathHelpAtoms.Icon.render('close', { size: 'small' }).outerHTML;
            dismissBtn.onclick = () => {
                alert.classList.add('dismissing');
                setTimeout(() => alert.remove(), 300);
            };
            alert.appendChild(dismissBtn);
        }
        
        return alert;
    }

    getDefaultIcon() {
        const icons = {
            info: 'info',
            success: 'success',
            warning: 'warning',
            error: 'error'
        };
        return icons[this.type] || 'info';
    }
}

// ============================================
// BREADCRUMB MOLECULE
// ============================================

class Breadcrumb {
    constructor(options = {}) {
        this.items = options.items || [];
        this.separator = options.separator || '/';
    }

    render() {
        const nav = document.createElement('nav');
        nav.className = 'breadcrumb';
        nav.setAttribute('aria-label', 'Breadcrumb');
        
        const list = document.createElement('ol');
        list.className = 'breadcrumb-list';
        
        this.items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'breadcrumb-item';
            
            if (index === this.items.length - 1) {
                // Current page
                const span = document.createElement('span');
                span.className = 'breadcrumb-current';
                span.textContent = item.label;
                span.setAttribute('aria-current', 'page');
                li.appendChild(span);
            } else {
                // Link
                const link = document.createElement('a');
                link.href = item.href;
                link.className = 'breadcrumb-link';
                link.textContent = item.label;
                li.appendChild(link);
                
                // Separator
                const separator = document.createElement('span');
                separator.className = 'breadcrumb-separator';
                separator.textContent = this.separator;
                separator.setAttribute('aria-hidden', 'true');
                li.appendChild(separator);
            }
            
            list.appendChild(li);
        });
        
        nav.appendChild(list);
        return nav;
    }
}

// Export all molecules
const Molecules = {
    SearchBar,
    MathExpression,
    ProblemCard,
    FormField,
    StatCard,
    NavigationItem,
    Alert,
    Breadcrumb
};

window.MathHelpMolecules = Molecules;