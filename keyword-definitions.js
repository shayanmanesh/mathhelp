// Mathematical Keyword Definitions System for Math.help
// Comprehensive dictionary with hover tooltips for all mathematical terms

class MathKeywordDefinitions {
    constructor() {
        this.definitions = this.initializeDefinitions();
        this.processedElements = new Set();
        this.tooltipElement = null;
        this.currentTooltip = null;
        this.init();
    }

    init() {
        this.createTooltipElement();
        this.setupEventListeners();
        this.processPageContent();
        this.setupMutationObserver();
    }

    initializeDefinitions() {
        return {
            // Algebra Terms
            'algebra': 'A branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas and equations.',
            'equation': 'A mathematical statement that shows two expressions are equal, connected by an equals sign (=).',
            'variable': 'A symbol (usually a letter) that represents an unknown number or quantity that can change.',
            'coefficient': 'A numerical factor that multiplies a variable in an algebraic expression.',
            'polynomial': 'An expression consisting of variables and coefficients combined using addition, subtraction, and multiplication.',
            'quadratic': 'An equation or expression of the second degree, typically containing a squared term like x².',
            'linear': 'Relating to or involving a straight line; in algebra, equations of the first degree.',
            'factoring': 'The process of breaking down a mathematical expression into its component factors.',
            'exponent': 'A number that shows how many times a base number is multiplied by itself.',
            'radical': 'An expression that contains a root symbol (√), indicating the root of a number.',
            'inequality': 'A mathematical statement showing that one expression is greater than, less than, or not equal to another.',
            'function': 'A mathematical relationship where each input has exactly one output.',
            'domain': 'The set of all possible input values (x-values) for a function.',
            'range': 'The set of all possible output values (y-values) for a function.',
            'inverse': 'A function that reverses the effect of another function.',
            'slope': 'A measure of the steepness of a line, calculated as rise over run.',
            'intercept': 'The point where a line crosses an axis on a coordinate plane.',
            'parabola': 'A U-shaped curve that is the graph of a quadratic function.',
            'vertex': 'The highest or lowest point of a parabola.',
            'discriminant': 'The part of the quadratic formula under the square root sign (b²-4ac).',

            // Calculus Terms
            'calculus': 'A branch of mathematics focused on rates of change (derivatives) and accumulation (integrals).',
            'derivative': 'A measure of how a function changes as its input changes; the slope of a tangent line.',
            'integral': 'The reverse of differentiation; represents the area under a curve.',
            'limit': 'The value that a function approaches as the input approaches a certain value.',
            'continuity': 'A property of functions where small changes in input result in small changes in output.',
            'differentiation': 'The process of finding the derivative of a function.',
            'integration': 'The process of finding the integral of a function.',
            'chain rule': 'A formula for computing the derivative of a composite function.',
            'product rule': 'A formula for finding the derivative of the product of two functions.',
            'quotient rule': 'A formula for finding the derivative of the quotient of two functions.',
            'fundamental theorem': 'The theorem connecting differentiation and integration as inverse operations.',
            'antiderivative': 'A function whose derivative is the given function; also called an indefinite integral.',
            'definite integral': 'An integral with specific upper and lower bounds that gives a numerical value.',
            'indefinite integral': 'An integral without bounds that represents a family of functions.',
            'optimization': 'The process of finding maximum or minimum values of functions.',
            'related rates': 'Problems involving rates of change of related quantities.',
            'implicit differentiation': 'A technique for finding derivatives of implicitly defined functions.',
            'partial derivative': 'A derivative of a function with respect to one variable while keeping others constant.',
            'gradient': 'A vector containing all partial derivatives of a multivariable function.',
            'divergence': 'A measure of how much a vector field spreads out from a point.',

            // Geometry Terms
            'geometry': 'A branch of mathematics concerned with shapes, sizes, positions, and properties of space.',
            'triangle': 'A polygon with three sides and three angles.',
            'rectangle': 'A quadrilateral with four right angles and opposite sides equal.',
            'circle': 'A round shape where every point is equidistant from the center.',
            'diameter': 'A straight line passing through the center of a circle, touching two points on the circumference.',
            'radius': 'The distance from the center of a circle to any point on its circumference.',
            'circumference': 'The perimeter or distance around a circle.',
            'area': 'The amount of space inside a two-dimensional shape.',
            'perimeter': 'The distance around the outside of a shape.',
            'volume': 'The amount of space inside a three-dimensional object.',
            'surface area': 'The total area of all surfaces of a three-dimensional object.',
            'angle': 'The space between two intersecting lines, measured in degrees.',
            'parallel': 'Lines that never meet and are always the same distance apart.',
            'perpendicular': 'Lines that meet at a right angle (90 degrees).',
            'congruent': 'Having the same shape and size.',
            'similar': 'Having the same shape but not necessarily the same size.',
            'polygon': 'A closed figure made up of three or more straight sides.',
            'quadrilateral': 'A polygon with four sides.',
            'pentagon': 'A polygon with five sides.',
            'hexagon': 'A polygon with six sides.',
            'octagon': 'A polygon with eight sides.',
            'pythagorean theorem': 'In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides.',
            'hypotenuse': 'The longest side of a right triangle, opposite the right angle.',
            'acute angle': 'An angle measuring less than 90 degrees.',
            'obtuse angle': 'An angle measuring more than 90 degrees but less than 180 degrees.',
            'right angle': 'An angle measuring exactly 90 degrees.',

            // Trigonometry Terms
            'trigonometry': 'The study of triangles and the relationships between their angles and sides.',
            'sine': 'A trigonometric function representing the ratio of opposite side to hypotenuse.',
            'cosine': 'A trigonometric function representing the ratio of adjacent side to hypotenuse.',
            'tangent': 'A trigonometric function representing the ratio of opposite side to adjacent side.',
            'secant': 'The reciprocal of cosine; sec(θ) = 1/cos(θ).',
            'cosecant': 'The reciprocal of sine; csc(θ) = 1/sin(θ).',
            'cotangent': 'The reciprocal of tangent; cot(θ) = 1/tan(θ).',
            'unit circle': 'A circle with radius 1 centered at the origin, used to define trigonometric functions.',
            'amplitude': 'The maximum displacement from the center line in a periodic function.',
            'period': 'The length of one complete cycle in a periodic function.',
            'frequency': 'The number of cycles per unit of time in a periodic function.',
            'phase shift': 'A horizontal shift in a trigonometric function.',
            'radian': 'A unit of angle measurement equal to about 57.3 degrees.',
            'degree': 'A unit of angle measurement; there are 360 degrees in a full circle.',
            'identity': 'An equation that is true for all values of the variable.',
            'law of sines': 'A formula relating the sides and angles of any triangle.',
            'law of cosines': 'A formula relating the sides and angles of any triangle, generalizing the Pythagorean theorem.',

            // Statistics Terms
            'statistics': 'The science of collecting, analyzing, and interpreting data.',
            'mean': 'The average of a set of numbers, calculated by adding them up and dividing by the count.',
            'median': 'The middle value in a sorted list of numbers.',
            'mode': 'The most frequently occurring value in a data set.',
            'range': 'The difference between the highest and lowest values in a data set.',
            'variance': 'A measure of how spread out the numbers in a data set are.',
            'standard deviation': 'The square root of variance; measures spread of data around the mean.',
            'probability': 'The likelihood of an event occurring, expressed as a number between 0 and 1.',
            'histogram': 'A bar chart showing the frequency distribution of data.',
            'correlation': 'A statistical measure of how closely two variables are related.',
            'regression': 'A statistical method for modeling the relationship between variables.',
            'normal distribution': 'A bell-shaped probability distribution that is symmetric around the mean.',
            'standard normal': 'A normal distribution with mean 0 and standard deviation 1.',
            'z-score': 'The number of standard deviations a value is from the mean.',
            'hypothesis test': 'A statistical method for making decisions about population parameters.',
            'p-value': 'The probability of obtaining results as extreme as observed, assuming the null hypothesis is true.',
            'confidence interval': 'A range of values that likely contains the true population parameter.',
            'sample': 'A subset of a population used to make inferences about the whole population.',
            'population': 'The entire group being studied in a statistical analysis.',
            'outlier': 'A data point that is significantly different from other observations.',

            // Advanced Terms
            'matrix': 'A rectangular array of numbers arranged in rows and columns.',
            'determinant': 'A scalar value calculated from a square matrix.',
            'eigenvalue': 'A scalar that indicates how much a vector is scaled during a linear transformation.',
            'eigenvector': 'A vector that only changes by a scalar factor during a linear transformation.',
            'complex number': 'A number of the form a + bi, where i is the imaginary unit.',
            'imaginary unit': 'The square root of -1, denoted by i.',
            'logarithm': 'The exponent to which a base must be raised to produce a given number.',
            'natural logarithm': 'A logarithm with base e (approximately 2.718).',
            'exponential function': 'A function of the form f(x) = aˣ where a is a positive constant.',
            'fibonacci sequence': 'A sequence where each number is the sum of the two preceding ones.',
            'golden ratio': 'The ratio φ = (1 + √5)/2 ≈ 1.618, found in many natural phenomena.',
            'infinity': 'A concept describing something without any bound or larger than any number.',
            'asymptote': 'A line that a curve approaches but never touches.',
            'recursive': 'A definition or procedure that refers to itself.',
            'permutation': 'An arrangement of objects where order matters.',
            'combination': 'A selection of objects where order does not matter.',
            'factorial': 'The product of all positive integers less than or equal to n, written as n!.',
            'proof': 'A logical argument that establishes the truth of a mathematical statement.',
            'theorem': 'A mathematical statement that has been proven to be true.',
            'lemma': 'A preliminary proposition used in proving a theorem.',
            'corollary': 'A proposition that follows easily from a theorem.',
            'axiom': 'A statement that is accepted as true without proof.',
            'conjecture': 'A mathematical statement that appears to be true but has not been proven.',

            // Number Theory
            'prime number': 'A natural number greater than 1 that has no positive divisors other than 1 and itself.',
            'composite number': 'A positive integer that has at least one positive divisor other than 1 and itself.',
            'greatest common divisor': 'The largest positive integer that divides two or more integers.',
            'least common multiple': 'The smallest positive integer that is divisible by two or more integers.',
            'euclidean algorithm': 'An efficient method for finding the greatest common divisor of two numbers.',
            'modular arithmetic': 'A system of arithmetic where numbers wrap around after reaching a certain value.',
            'congruence': 'A relation between two numbers having the same remainder when divided by a given number.',

            // Set Theory
            'set': 'A collection of distinct objects, considered as an object in its own right.',
            'subset': 'A set whose elements are all contained in another set.',
            'union': 'The combination of all elements from two or more sets.',
            'intersection': 'The set of elements that are common to two or more sets.',
            'complement': 'The set of elements not in a given set, relative to a universal set.',
            'empty set': 'A set containing no elements, denoted by ∅.',
            'cardinality': 'The number of elements in a set.',
            'venn diagram': 'A diagram using circles to show relationships between sets.',

            // Logic
            'logic': 'The study of valid reasoning and argument structure.',
            'proposition': 'A statement that is either true or false.',
            'conjunction': 'A logical operation that is true only when both operands are true (AND).',
            'disjunction': 'A logical operation that is true when at least one operand is true (OR).',
            'negation': 'A logical operation that reverses the truth value of a proposition (NOT).',
            'implication': 'A logical operation where if the first statement is true, then the second must be true.',
            'biconditional': 'A logical operation that is true when both operands have the same truth value.',
            'quantifier': 'A logical symbol that specifies the quantity of specimens in a domain.',
            'universal quantifier': 'A symbol (∀) meaning "for all" or "for every".',
            'existential quantifier': 'A symbol (∃) meaning "there exists" or "for some".'
        };
    }

    createTooltipElement() {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = 'math-tooltip';
        this.tooltipElement.style.display = 'none';
        document.body.appendChild(this.tooltipElement);
    }

    setupEventListeners() {
        // Global mouse events for tooltip positioning
        document.addEventListener('mousemove', (e) => {
            if (this.currentTooltip) {
                this.positionTooltip(e.clientX, e.clientY);
            }
        });

        // Hide tooltip when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.math-keyword')) {
                this.hideTooltip();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.currentTooltip) {
                this.hideTooltip();
            }
        });
    }

    processPageContent() {
        // Process all text content on the page
        const contentElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, div, span');
        
        contentElements.forEach(element => {
            if (!this.processedElements.has(element) && this.shouldProcessElement(element)) {
                this.processElement(element);
                this.processedElements.add(element);
            }
        });
    }

    shouldProcessElement(element) {
        // Skip elements that shouldn't be processed
        const skipClasses = ['math-tooltip', 'math-keyword', 'code', 'pre', 'script', 'style'];
        const skipTags = ['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT'];
        
        if (skipTags.includes(element.tagName)) return false;
        if (skipClasses.some(cls => element.classList.contains(cls))) return false;
        if (element.closest('script, style, code, pre')) return false;
        
        return element.textContent.trim().length > 0;
    }

    processElement(element) {
        // Get all text nodes
        const textNodes = this.getTextNodes(element);
        
        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            const highlightedText = this.highlightKeywords(text);
            
            if (highlightedText !== text) {
                // Create a temporary container
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = highlightedText;
                
                // Replace the text node with the highlighted content
                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                
                textNode.parentNode.replaceChild(fragment, textNode);
            }
        });
    }

    getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip text nodes inside already processed elements
                    if (node.parentNode.classList && node.parentNode.classList.contains('math-keyword')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return node.textContent.trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            }
        );
        
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        return textNodes;
    }

    highlightKeywords(text) {
        let highlightedText = text;
        
        // Sort keywords by length (longest first) to avoid partial matches
        const sortedKeywords = Object.keys(this.definitions).sort((a, b) => b.length - a.length);
        
        sortedKeywords.forEach(keyword => {
            // Create a case-insensitive regex that matches whole words
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            
            highlightedText = highlightedText.replace(regex, (match) => {
                return `<span class="math-keyword" data-keyword="${keyword.toLowerCase()}">${match}</span>`;
            });
        });
        
        return highlightedText;
    }

    setupMutationObserver() {
        // Watch for dynamically added content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Process new elements
                        const elementsToProcess = [node, ...node.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, div, span')];
                        
                        elementsToProcess.forEach(element => {
                            if (!this.processedElements.has(element) && this.shouldProcessElement(element)) {
                                this.processElement(element);
                                this.processedElements.add(element);
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    showTooltip(keyword, x, y) {
        const definition = this.definitions[keyword.toLowerCase()];
        if (!definition) return;
        
        this.tooltipElement.innerHTML = `
            <div class="tooltip-header">
                <strong>${keyword}</strong>
            </div>
            <div class="tooltip-content">
                ${definition}
            </div>
        `;
        
        this.tooltipElement.style.display = 'block';
        this.currentTooltip = keyword;
        this.positionTooltip(x, y);
    }

    hideTooltip() {
        this.tooltipElement.style.display = 'none';
        this.currentTooltip = null;
    }

    positionTooltip(x, y) {
        const tooltip = this.tooltipElement;
        const rect = tooltip.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let left = x + 10;
        let top = y + 10;
        
        // Adjust if tooltip goes off screen
        if (left + rect.width > windowWidth) {
            left = x - rect.width - 10;
        }
        
        if (top + rect.height > windowHeight) {
            top = y - rect.height - 10;
        }
        
        // Ensure tooltip doesn't go off the left or top edge
        left = Math.max(10, left);
        top = Math.max(10, top);
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    // Public API methods
    addDefinition(keyword, definition) {
        this.definitions[keyword.toLowerCase()] = definition;
    }

    removeDefinition(keyword) {
        delete this.definitions[keyword.toLowerCase()];
    }

    updateDefinition(keyword, definition) {
        this.definitions[keyword.toLowerCase()] = definition;
    }

    getDefinition(keyword) {
        return this.definitions[keyword.toLowerCase()];
    }

    refreshPage() {
        // Re-process all content
        this.processedElements.clear();
        this.processPageContent();
    }
}

// Initialize the system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.mathKeywords = new MathKeywordDefinitions();
    
    // Set up event delegation for keyword hover
    document.addEventListener('mouseenter', function(e) {
        if (e.target.classList.contains('math-keyword')) {
            const keyword = e.target.getAttribute('data-keyword');
            const rect = e.target.getBoundingClientRect();
            window.mathKeywords.showTooltip(keyword, rect.left + rect.width / 2, rect.top);
        }
    }, true);
    
    document.addEventListener('mouseleave', function(e) {
        if (e.target.classList.contains('math-keyword')) {
            window.mathKeywords.hideTooltip();
        }
    }, true);
});

// Export for use in other modules
window.MathKeywordDefinitions = MathKeywordDefinitions;