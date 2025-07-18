// Math Help Calculator - Enhanced for engagement and usability
// Tracks usage for analytics and optimization

let display = '';
let history = [];
let lastResult = null;

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    const screen = document.getElementById('calc-screen');
    if (screen) {
        screen.value = '0';
    }
    
    // Track calculator load
    if (typeof analytics !== 'undefined') {
        analytics.track('calculator_loaded', {
            page: window.location.pathname
        });
    }
});

// Append value to display
function appendToDisplay(value) {
    const screen = document.getElementById('calc-screen');
    
    if (display === '' && value !== '-' && isNaN(value)) {
        return; // Don't start with operators except minus
    }
    
    if (display === '0' && !isNaN(value)) {
        display = value;
    } else {
        display += value;
    }
    
    screen.value = display || '0';
    
    // Track button press
    trackCalculatorAction('button_press', { button: value });
}

// Clear calculator
function clearCalculator() {
    display = '';
    const screen = document.getElementById('calc-screen');
    screen.value = '0';
    
    trackCalculatorAction('clear');
}

// Delete last character
function deleteLast() {
    display = display.slice(0, -1);
    const screen = document.getElementById('calc-screen');
    screen.value = display || '0';
    
    trackCalculatorAction('delete');
}

// Calculate result
function calculate() {
    const screen = document.getElementById('calc-screen');
    
    if (display === '') {
        return;
    }
    
    try {
        // Replace display symbols with JavaScript operators
        let expression = display
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E');
        
        // Evaluate the expression safely
        const result = evaluateExpression(expression);
        
        // Store in history
        history.push({
            expression: display,
            result: result,
            timestamp: new Date()
        });
        
        // Update display
        screen.value = result;
        lastResult = result;
        display = result.toString();
        
        // Track calculation
        trackCalculatorAction('calculate', {
            expression: display,
            result: result
        });
        
    } catch (error) {
        screen.value = 'Error';
        display = '';
        
        trackCalculatorAction('error', {
            expression: display,
            error: error.message
        });
    }
}

// Safe expression evaluation
function evaluateExpression(expr) {
    // Remove any potentially dangerous characters
    const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, '');
    
    // Create a safe evaluation context
    const Math = window.Math;
    
    // Use Function constructor for safer eval
    try {
        const func = new Function('Math', `return ${sanitized}`);
        const result = func(Math);
        
        // Round to avoid floating point issues
        return Math.round(result * 100000000) / 100000000;
    } catch (e) {
        throw new Error('Invalid expression');
    }
}

// Advanced calculator functions (for future enhancement)
const advancedFunctions = {
    sin: (x) => Math.sin(x * Math.PI / 180), // Degrees
    cos: (x) => Math.cos(x * Math.PI / 180),
    tan: (x) => Math.tan(x * Math.PI / 180),
    sqrt: Math.sqrt,
    pow: Math.pow,
    log: Math.log10,
    ln: Math.log,
    abs: Math.abs,
    factorial: (n) => {
        if (n < 0) return NaN;
        if (n === 0) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
};

// Keyboard support
document.addEventListener('keydown', function(e) {
    const screen = document.getElementById('calc-screen');
    if (!screen) return;
    
    // If calculator is not in focus, don't process
    if (!document.querySelector('.calculator-section').contains(document.activeElement)) {
        return;
    }
    
    const key = e.key;
    
    if (key >= '0' && key <= '9') {
        appendToDisplay(key);
    } else if (key === '.') {
        appendToDisplay('.');
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        appendToDisplay(key);
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearCalculator();
    } else if (key === 'Backspace') {
        e.preventDefault();
        deleteLast();
    }
});

// Analytics tracking
function trackCalculatorAction(action, data = {}) {
    // Track user engagement with calculator
    if (typeof analytics !== 'undefined') {
        analytics.track('calculator_' + action, {
            ...data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        });
    }
    
    // Also send to Google Analytics if available
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: 'Calculator',
            event_label: data.button || data.expression || '',
            value: data.result || 0
        });
    }
}

// Get calculation history (for future features)
function getHistory() {
    return history.slice(-10); // Last 10 calculations
}

// Clear history
function clearHistory() {
    history = [];
    trackCalculatorAction('clear_history');
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        appendToDisplay,
        clearCalculator,
        deleteLast,
        calculate,
        evaluateExpression,
        getHistory,
        clearHistory
    };
}