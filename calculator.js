let display = document.getElementById('calc-screen');
let currentInput = '';
let operator = '';
let firstOperand = '';
let waitingForOperand = false;

function updateDisplay(value) {
    display.value = value;
}

function appendToDisplay(value) {
    if (waitingForOperand) {
        currentInput = value;
        waitingForOperand = false;
    } else {
        if (currentInput === '0' && value !== '.') {
            currentInput = value;
        } else {
            currentInput += value;
        }
    }
    updateDisplay(currentInput);
}

function clearCalculator() {
    currentInput = '';
    operator = '';
    firstOperand = '';
    waitingForOperand = false;
    updateDisplay('0');
}

function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
        updateDisplay(currentInput);
    } else {
        currentInput = '';
        updateDisplay('0');
    }
}

function calculate() {
    let result;
    const prev = parseFloat(firstOperand);
    const current = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(current)) return;

    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                updateDisplay('Error');
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }

    currentInput = result.toString();
    operator = '';
    firstOperand = '';
    waitingForOperand = true;
    updateDisplay(currentInput);
}

function setOperator(nextOperator) {
    const inputValue = parseFloat(currentInput);

    if (firstOperand === '') {
        firstOperand = inputValue;
    } else if (operator) {
        const currentValue = firstOperand || 0;
        const result = performCalculation[operator](currentValue, inputValue);

        currentInput = String(result);
        firstOperand = result;
        updateDisplay(currentInput);
    }

    waitingForOperand = true;
    operator = nextOperator;
}

const performCalculation = {
    '/': (firstOperand, secondOperand) => firstOperand / secondOperand,
    '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
    '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
    '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
    '=': (firstOperand, secondOperand) => secondOperand
};

document.addEventListener('DOMContentLoaded', function() {
    updateDisplay('0');
    
    document.addEventListener('keydown', function(event) {
        const key = event.key;
        
        if ('0123456789.'.includes(key)) {
            appendToDisplay(key);
        } else if ('+-*/'.includes(key)) {
            setOperator(key);
        } else if (key === 'Enter' || key === '=') {
            calculate();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            clearCalculator();
        } else if (key === 'Backspace') {
            deleteLast();
        }
    });
});