// Interactive Mathematical Tools for Math Help
// Comprehensive calculator and tool functionality

class InteractiveTools {
    constructor() {
        this.currentCalculator = 'basic';
        this.graphCanvas = null;
        this.graphContext = null;
        this.graphSettings = {
            xMin: -10,
            xMax: 10,
            yMin: -10,
            yMax: 10,
            gridSize: 1
        };
        this.init();
    }

    init() {
        this.setupCalculators();
        this.setupGraphing();
        this.setupGeometryCalculator();
        this.setupStatisticsCalculator();
        this.setupCalculusTools();
        this.setupMatrixCalculator();
        this.bindEvents();
    }

    // Calculator Tab Management
    showCalculator(type) {
        // Hide all calculators
        document.querySelectorAll('.calculator-widget').forEach(calc => {
            calc.classList.remove('active');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected calculator
        document.getElementById(`${type}-calc`).classList.add('active');
        event.target.classList.add('active');
        
        this.currentCalculator = type;
    }

    // Basic Calculator Functions
    setupCalculators() {
        window.appendToDisplay = (value) => {
            const screen = document.getElementById('calc-screen');
            if (screen.value === '0' || screen.value === 'Error') {
                screen.value = value;
            } else {
                screen.value += value;
            }
        };

        window.clearCalculator = () => {
            document.getElementById('calc-screen').value = '0';
        };

        window.deleteLast = () => {
            const screen = document.getElementById('calc-screen');
            if (screen.value.length > 1) {
                screen.value = screen.value.slice(0, -1);
            } else {
                screen.value = '0';
            }
        };

        window.calculate = () => {
            const screen = document.getElementById('calc-screen');
            try {
                const result = eval(screen.value.replace(/×/g, '*'));
                screen.value = result;
                
                // Track calculation
                if (window.viralGrowthSystem) {
                    window.viralGrowthSystem.trackEvent('calculation_performed', {
                        type: 'basic',
                        expression: screen.value
                    });
                }
            } catch (error) {
                screen.value = 'Error';
            }
        };
    }

    // Scientific Calculator Functions
    setupScientificCalculator() {
        window.sciFunction = (func) => {
            const screen = document.getElementById('sci-calc-screen');
            let value = parseFloat(screen.value);
            let result;

            try {
                switch (func) {
                    case 'sin':
                        result = Math.sin(value * Math.PI / 180);
                        break;
                    case 'cos':
                        result = Math.cos(value * Math.PI / 180);
                        break;
                    case 'tan':
                        result = Math.tan(value * Math.PI / 180);
                        break;
                    case 'log':
                        result = Math.log10(value);
                        break;
                    case 'ln':
                        result = Math.log(value);
                        break;
                    case 'sqrt':
                        result = Math.sqrt(value);
                        break;
                    case 'pow':
                        result = Math.pow(value, 2);
                        break;
                    case 'exp':
                        result = Math.exp(value);
                        break;
                    case 'pi':
                        result = Math.PI;
                        break;
                    case 'e':
                        result = Math.E;
                        break;
                    default:
                        result = value;
                }
                screen.value = result.toString();
            } catch (error) {
                screen.value = 'Error';
            }
        };
    }

    // Graphing Calculator
    setupGraphing() {
        window.plotFunction = () => {
            const functionInput = document.getElementById('function-input');
            const expression = functionInput.value;
            
            if (!this.graphCanvas) {
                this.graphCanvas = document.getElementById('graph-canvas');
                this.graphContext = this.graphCanvas.getContext('2d');
            }

            this.clearGraph();
            this.drawAxes();
            this.drawGrid();
            this.plotMathFunction(expression);
        };

        window.zoomIn = () => {
            this.graphSettings.xMin /= 0.8;
            this.graphSettings.xMax /= 0.8;
            this.graphSettings.yMin /= 0.8;
            this.graphSettings.yMax /= 0.8;
            this.redrawGraph();
        };

        window.zoomOut = () => {
            this.graphSettings.xMin *= 0.8;
            this.graphSettings.xMax *= 0.8;
            this.graphSettings.yMin *= 0.8;
            this.graphSettings.yMax *= 0.8;
            this.redrawGraph();
        };

        window.resetView = () => {
            this.graphSettings = {
                xMin: -10,
                xMax: 10,
                yMin: -10,
                yMax: 10,
                gridSize: 1
            };
            this.redrawGraph();
        };
    }

    clearGraph() {
        this.graphContext.clearRect(0, 0, this.graphCanvas.width, this.graphCanvas.height);
    }

    drawAxes() {
        const ctx = this.graphContext;
        const width = this.graphCanvas.width;
        const height = this.graphCanvas.height;
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // X-axis
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        
        // Y-axis
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        
        ctx.stroke();
    }

    drawGrid() {
        const ctx = this.graphContext;
        const width = this.graphCanvas.width;
        const height = this.graphCanvas.height;
        
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        const stepX = width / (this.graphSettings.xMax - this.graphSettings.xMin);
        const stepY = height / (this.graphSettings.yMax - this.graphSettings.yMin);
        
        // Vertical grid lines
        for (let x = 0; x <= width; x += stepX) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        
        // Horizontal grid lines
        for (let y = 0; y <= height; y += stepY) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        
        ctx.stroke();
    }

    plotMathFunction(expression) {
        const ctx = this.graphContext;
        const width = this.graphCanvas.width;
        const height = this.graphCanvas.height;
        
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        let firstPoint = true;
        const step = (this.graphSettings.xMax - this.graphSettings.xMin) / width;
        
        for (let x = this.graphSettings.xMin; x <= this.graphSettings.xMax; x += step) {
            try {
                const y = this.evaluateExpression(expression, x);
                const pixelX = ((x - this.graphSettings.xMin) / (this.graphSettings.xMax - this.graphSettings.xMin)) * width;
                const pixelY = height - ((y - this.graphSettings.yMin) / (this.graphSettings.yMax - this.graphSettings.yMin)) * height;
                
                if (firstPoint) {
                    ctx.moveTo(pixelX, pixelY);
                    firstPoint = false;
                } else {
                    ctx.lineTo(pixelX, pixelY);
                }
            } catch (error) {
                // Skip invalid points
            }
        }
        
        ctx.stroke();
    }

    evaluateExpression(expression, x) {
        // Simple expression evaluator (replace with more robust parser for production)
        let expr = expression.replace(/x/g, x.toString());
        expr = expr.replace(/\^/g, '**');
        expr = expr.replace(/sin/g, 'Math.sin');
        expr = expr.replace(/cos/g, 'Math.cos');
        expr = expr.replace(/tan/g, 'Math.tan');
        expr = expr.replace(/log/g, 'Math.log');
        expr = expr.replace(/sqrt/g, 'Math.sqrt');
        
        return eval(expr);
    }

    // Equation Solver
    setupEquationSolver() {
        window.solveEquation = () => {
            const equationInput = document.getElementById('equation-input');
            const solutionSteps = document.getElementById('solution-steps');
            const equation = equationInput.value;
            
            const solution = this.solveLinearEquation(equation);
            solutionSteps.innerHTML = solution;
        };
    }

    solveLinearEquation(equation) {
        // Simple linear equation solver
        try {
            const [left, right] = equation.split('=');
            const leftNum = this.extractCoefficients(left);
            const rightNum = this.extractCoefficients(right);
            
            const a = leftNum.coefficient - rightNum.coefficient;
            const b = rightNum.constant - leftNum.constant;
            
            const x = b / a;
            
            return `
                <div class="solution-step">
                    <h4>Step 1: Rearrange the equation</h4>
                    <p>Move all terms with x to the left side and constants to the right side</p>
                    <div class="equation-display">${a}x = ${b}</div>
                </div>
                <div class="solution-step">
                    <h4>Step 2: Solve for x</h4>
                    <p>Divide both sides by ${a}</p>
                    <div class="equation-display">x = ${b} ÷ ${a} = ${x}</div>
                </div>
                <div class="solution-answer">
                    <h4>Answer: x = ${x}</h4>
                </div>
            `;
        } catch (error) {
            return '<div class="error">Unable to solve this equation. Please check the format.</div>';
        }
    }

    extractCoefficients(expression) {
        // Extract coefficient of x and constant term
        let coefficient = 0;
        let constant = 0;
        
        // Simple regex-based extraction (improve for production)
        const xMatch = expression.match(/([+-]?\d*\.?\d*)x/);
        if (xMatch) {
            coefficient = parseFloat(xMatch[1] || '1');
        }
        
        const constantMatch = expression.match(/([+-]?\d+\.?\d*)(?!x)/g);
        if (constantMatch) {
            constant = constantMatch.reduce((sum, num) => sum + parseFloat(num), 0);
        }
        
        return { coefficient, constant };
    }

    // Geometry Calculator
    setupGeometryCalculator() {
        window.showShapeCalculator = () => {
            const shapeSelect = document.getElementById('shape-select');
            const shapeInputs = document.getElementById('shape-inputs');
            const shape = shapeSelect.value;
            
            let inputHTML = '';
            
            switch (shape) {
                case 'triangle':
                    inputHTML = `
                        <input type="number" id="triangle-base" placeholder="Base">
                        <input type="number" id="triangle-height" placeholder="Height">
                    `;
                    break;
                case 'circle':
                    inputHTML = `
                        <input type="number" id="circle-radius" placeholder="Radius">
                    `;
                    break;
                case 'rectangle':
                    inputHTML = `
                        <input type="number" id="rectangle-width" placeholder="Width">
                        <input type="number" id="rectangle-height" placeholder="Height">
                    `;
                    break;
                case 'sphere':
                    inputHTML = `
                        <input type="number" id="sphere-radius" placeholder="Radius">
                    `;
                    break;
            }
            
            shapeInputs.innerHTML = inputHTML;
        };

        window.calculateGeometry = () => {
            const shapeSelect = document.getElementById('shape-select');
            const geometryResult = document.getElementById('geometry-result');
            const shape = shapeSelect.value;
            
            let result = '';
            
            switch (shape) {
                case 'triangle':
                    const base = parseFloat(document.getElementById('triangle-base').value);
                    const height = parseFloat(document.getElementById('triangle-height').value);
                    const area = 0.5 * base * height;
                    result = `Area = ½ × ${base} × ${height} = ${area}`;
                    break;
                case 'circle':
                    const radius = parseFloat(document.getElementById('circle-radius').value);
                    const circleArea = Math.PI * Math.pow(radius, 2);
                    const circumference = 2 * Math.PI * radius;
                    result = `Area = π × ${radius}² = ${circleArea.toFixed(2)}<br>Circumference = 2π × ${radius} = ${circumference.toFixed(2)}`;
                    break;
                case 'rectangle':
                    const width = parseFloat(document.getElementById('rectangle-width').value);
                    const rectHeight = parseFloat(document.getElementById('rectangle-height').value);
                    const rectArea = width * rectHeight;
                    const perimeter = 2 * (width + rectHeight);
                    result = `Area = ${width} × ${rectHeight} = ${rectArea}<br>Perimeter = 2(${width} + ${rectHeight}) = ${perimeter}`;
                    break;
                case 'sphere':
                    const sphereRadius = parseFloat(document.getElementById('sphere-radius').value);
                    const sphereVolume = (4/3) * Math.PI * Math.pow(sphereRadius, 3);
                    const sphereArea = 4 * Math.PI * Math.pow(sphereRadius, 2);
                    result = `Volume = (4/3)π × ${sphereRadius}³ = ${sphereVolume.toFixed(2)}<br>Surface Area = 4π × ${sphereRadius}² = ${sphereArea.toFixed(2)}`;
                    break;
            }
            
            geometryResult.innerHTML = result;
        };
    }

    // Statistics Calculator
    setupStatisticsCalculator() {
        window.calculateStatistics = () => {
            const dataInput = document.getElementById('data-input');
            const statsResult = document.getElementById('stats-result');
            const data = dataInput.value.split(',').map(num => parseFloat(num.trim()));
            
            const mean = data.reduce((sum, num) => sum + num, 0) / data.length;
            const sortedData = [...data].sort((a, b) => a - b);
            const median = sortedData.length % 2 === 0 
                ? (sortedData[sortedData.length / 2 - 1] + sortedData[sortedData.length / 2]) / 2
                : sortedData[Math.floor(sortedData.length / 2)];
            
            const variance = data.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / data.length;
            const stdDev = Math.sqrt(variance);
            
            const result = `
                <div class="stat-result">
                    <h4>Statistical Analysis</h4>
                    <p><strong>Mean:</strong> ${mean.toFixed(2)}</p>
                    <p><strong>Median:</strong> ${median}</p>
                    <p><strong>Standard Deviation:</strong> ${stdDev.toFixed(2)}</p>
                    <p><strong>Variance:</strong> ${variance.toFixed(2)}</p>
                    <p><strong>Count:</strong> ${data.length}</p>
                </div>
            `;
            
            statsResult.innerHTML = result;
        };
    }

    // Calculus Tools
    setupCalculusTools() {
        window.calculateCalculus = () => {
            const calculusType = document.getElementById('calculus-type').value;
            const calculusInput = document.getElementById('calculus-input').value;
            const calculusResult = document.getElementById('calculus-result');
            
            let result = '';
            
            switch (calculusType) {
                case 'derivative':
                    result = this.calculateDerivative(calculusInput);
                    break;
                case 'integral':
                    result = this.calculateIntegral(calculusInput);
                    break;
                case 'limit':
                    result = this.calculateLimit(calculusInput);
                    break;
            }
            
            calculusResult.innerHTML = result;
        };
    }

    calculateDerivative(expression) {
        // Simple derivative calculator (extend for more complex functions)
        const derivatives = {
            'x': '1',
            'x^2': '2x',
            'x^3': '3x^2',
            'sin(x)': 'cos(x)',
            'cos(x)': '-sin(x)',
            'e^x': 'e^x',
            'ln(x)': '1/x'
        };
        
        const result = derivatives[expression] || 'Derivative not found in database';
        
        return `
            <div class="calculus-result">
                <h4>Derivative of ${expression}</h4>
                <p class="derivative-result">f'(x) = ${result}</p>
            </div>
        `;
    }

    calculateIntegral(expression) {
        // Simple integral calculator
        const integrals = {
            'x': 'x²/2 + C',
            'x^2': 'x³/3 + C',
            'x^3': 'x⁴/4 + C',
            'sin(x)': '-cos(x) + C',
            'cos(x)': 'sin(x) + C',
            'e^x': 'e^x + C',
            '1/x': 'ln|x| + C'
        };
        
        const result = integrals[expression] || 'Integral not found in database';
        
        return `
            <div class="calculus-result">
                <h4>Integral of ${expression}</h4>
                <p class="integral-result">∫${expression} dx = ${result}</p>
            </div>
        `;
    }

    calculateLimit(expression) {
        return `
            <div class="calculus-result">
                <h4>Limit of ${expression}</h4>
                <p>Advanced limit calculation requires more context. Please specify the approach value.</p>
            </div>
        `;
    }

    // Matrix Calculator
    setupMatrixCalculator() {
        window.createMatrix = () => {
            const matrixSize = document.getElementById('matrix-size').value;
            const matrixGrid = document.getElementById('matrix-grid');
            const [rows, cols] = matrixSize.split('x').map(Number);
            
            let gridHTML = '<div class="matrix-display">';
            for (let i = 0; i < rows; i++) {
                gridHTML += '<div class="matrix-row">';
                for (let j = 0; j < cols; j++) {
                    gridHTML += `<input type="number" class="matrix-cell" id="cell-${i}-${j}" placeholder="0">`;
                }
                gridHTML += '</div>';
            }
            gridHTML += '</div>';
            
            matrixGrid.innerHTML = gridHTML;
        };

        window.calculateMatrix = () => {
            const matrixSize = document.getElementById('matrix-size').value;
            const matrixResult = document.getElementById('matrix-result');
            const [rows, cols] = matrixSize.split('x').map(Number);
            
            // Get matrix values
            const matrix = [];
            for (let i = 0; i < rows; i++) {
                matrix[i] = [];
                for (let j = 0; j < cols; j++) {
                    const cellValue = document.getElementById(`cell-${i}-${j}`).value;
                    matrix[i][j] = parseFloat(cellValue) || 0;
                }
            }
            
            // Calculate determinant for square matrices
            if (rows === cols) {
                const det = this.calculateDeterminant(matrix);
                matrixResult.innerHTML = `
                    <div class="matrix-result">
                        <h4>Matrix Determinant</h4>
                        <p>det(A) = ${det}</p>
                    </div>
                `;
            } else {
                matrixResult.innerHTML = '<p>Determinant calculation requires a square matrix.</p>';
            }
        };
    }

    calculateDeterminant(matrix) {
        const n = matrix.length;
        
        if (n === 2) {
            return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        } else if (n === 3) {
            return matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
                   matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
                   matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
        } else {
            return 'Determinant calculation for matrices larger than 3x3 is not implemented yet.';
        }
    }

    redrawGraph() {
        const functionInput = document.getElementById('function-input');
        if (functionInput.value) {
            this.plotFunction();
        }
    }

    bindEvents() {
        // Initialize default calculator displays
        document.addEventListener('DOMContentLoaded', () => {
            this.showShapeCalculator();
            this.createMatrix();
        });
    }
}

// Initialize Interactive Tools
document.addEventListener('DOMContentLoaded', function() {
    window.interactiveTools = new InteractiveTools();
});

// Export for use in other modules
window.InteractiveTools = InteractiveTools;