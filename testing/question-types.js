// Question Types Implementation with LaTeX Support
// Comprehensive question formats for Math Help Testing System

class QuestionTypeManager {
    constructor() {
        this.supportedTypes = {
            'multiple_choice': MultipleChoiceQuestion,
            'short_answer': ShortAnswerQuestion,
            'true_false': TrueFalseQuestion,
            'drag_drop': DragDropQuestion,
            'graph_plot': GraphPlotQuestion,
            'equation_editor': EquationEditorQuestion,
            'step_by_step': StepByStepQuestion,
            'matching': MatchingQuestion,
            'fill_blanks': FillBlanksQuestion,
            'interactive_proof': InteractiveProofQuestion
        };
        
        this.latexRenderer = new LaTeXRenderer();
        this.validationRules = new ValidationRules();
    }
    
    /**
     * Create question instance based on type
     */
    createQuestion(type, content, config = {}) {
        const QuestionClass = this.supportedTypes[type];
        
        if (!QuestionClass) {
            throw new Error(`Unsupported question type: ${type}`);
        }
        
        return new QuestionClass(content, config, this.latexRenderer);
    }
    
    /**
     * Validate question content
     */
    validateQuestion(type, content) {
        const QuestionClass = this.supportedTypes[type];
        
        if (!QuestionClass) {
            throw new Error(`Unsupported question type: ${type}`);
        }
        
        return QuestionClass.validate(content);
    }
    
    /**
     * Get question type schema
     */
    getQuestionSchema(type) {
        const QuestionClass = this.supportedTypes[type];
        
        if (!QuestionClass) {
            throw new Error(`Unsupported question type: ${type}`);
        }
        
        return QuestionClass.getSchema();
    }
}

// ============================================
// BASE QUESTION CLASS
// ============================================

class BaseQuestion {
    constructor(content, config = {}, latexRenderer) {
        this.content = content;
        this.config = config;
        this.latex = latexRenderer;
        this.type = this.constructor.name.toLowerCase().replace('question', '');
        
        this.validate();
    }
    
    validate() {
        const schema = this.constructor.getSchema();
        const validation = this.constructor.validate(this.content);
        
        if (!validation.isValid) {
            throw new Error(`Invalid question content: ${validation.errors.join(', ')}`);
        }
    }
    
    render() {
        return {
            type: this.type,
            stem: this.latex.render(this.content.stem),
            ...this.renderSpecific()
        };
    }
    
    renderSpecific() {
        throw new Error('renderSpecific must be implemented by subclass');
    }
    
    evaluate(response) {
        throw new Error('evaluate must be implemented by subclass');
    }
    
    static validate(content) {
        throw new Error('validate must be implemented by subclass');
    }
    
    static getSchema() {
        throw new Error('getSchema must be implemented by subclass');
    }
}

// ============================================
// MULTIPLE CHOICE QUESTION
// ============================================

class MultipleChoiceQuestion extends BaseQuestion {
    constructor(content, config = {}, latexRenderer) {
        super(content, config, latexRenderer);
        
        this.config = {
            shuffleOptions: true,
            showCorrectAnswer: false,
            allowMultipleSelection: false,
            ...config
        };
    }
    
    renderSpecific() {
        let options = this.content.options.map((option, index) => ({
            id: option.id || `option_${index}`,
            text: this.latex.render(option.text),
            latex: option.latex || null,
            image: option.image || null,
            isCorrect: this.config.showCorrectAnswer ? option.isCorrect : undefined
        }));
        
        // Shuffle options if configured
        if (this.config.shuffleOptions) {
            options = this.shuffleArray(options);
        }
        
        return {
            options,
            allowMultipleSelection: this.config.allowMultipleSelection,
            instructions: this.config.allowMultipleSelection ? 
                'Select all correct answers.' : 
                'Select the best answer.'
        };
    }
    
    evaluate(response) {
        const correctOptions = this.content.options.filter(opt => opt.isCorrect);
        const selectedOptions = Array.isArray(response.selectedOptions) ? 
            response.selectedOptions : [response.selectedOption];
        
        if (this.config.allowMultipleSelection) {
            // All correct options must be selected, no incorrect options
            const correctIds = correctOptions.map(opt => opt.id);
            const selectedIds = selectedOptions.map(opt => opt.id || opt);
            
            const allCorrectSelected = correctIds.every(id => selectedIds.includes(id));
            const noIncorrectSelected = selectedIds.every(id => correctIds.includes(id));
            
            return {
                isCorrect: allCorrectSelected && noIncorrectSelected,
                score: this.calculatePartialCredit(correctIds, selectedIds),
                feedback: this.generateFeedback(correctIds, selectedIds)
            };
        } else {
            // Single selection
            const selectedId = selectedOptions[0]?.id || selectedOptions[0];
            const correctOption = correctOptions[0];
            
            return {
                isCorrect: selectedId === correctOption.id,
                score: selectedId === correctOption.id ? 1.0 : 0.0,
                feedback: this.generateSingleSelectionFeedback(selectedId, correctOption)
            };
        }
    }
    
    calculatePartialCredit(correctIds, selectedIds) {
        const totalCorrect = correctIds.length;
        const totalSelected = selectedIds.length;
        
        const correctSelections = selectedIds.filter(id => correctIds.includes(id)).length;
        const incorrectSelections = selectedIds.filter(id => !correctIds.includes(id)).length;
        
        // Award points for correct selections, deduct for incorrect ones
        const score = (correctSelections - incorrectSelections) / totalCorrect;
        return Math.max(0, Math.min(1, score));
    }
    
    generateFeedback(correctIds, selectedIds) {
        const missed = correctIds.filter(id => !selectedIds.includes(id));
        const incorrect = selectedIds.filter(id => !correctIds.includes(id));
        
        let feedback = '';
        
        if (missed.length > 0) {
            feedback += `You missed ${missed.length} correct option(s). `;
        }
        
        if (incorrect.length > 0) {
            feedback += `You selected ${incorrect.length} incorrect option(s). `;
        }
        
        if (missed.length === 0 && incorrect.length === 0) {
            feedback = 'Perfect! You selected all correct options.';
        }
        
        return feedback;
    }
    
    generateSingleSelectionFeedback(selectedId, correctOption) {
        if (selectedId === correctOption.id) {
            return 'Correct! ' + (correctOption.explanation || '');
        } else {
            const selectedOption = this.content.options.find(opt => opt.id === selectedId);
            return `Incorrect. ${selectedOption?.explanation || ''} The correct answer is: ${correctOption.text}`;
        }
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    static validate(content) {
        const errors = [];
        
        if (!content.stem || typeof content.stem !== 'string') {
            errors.push('Question stem is required and must be a string');
        }
        
        if (!content.options || !Array.isArray(content.options)) {
            errors.push('Options must be an array');
        } else {
            if (content.options.length < 2) {
                errors.push('At least 2 options are required');
            }
            
            const correctOptions = content.options.filter(opt => opt.isCorrect);
            if (correctOptions.length === 0) {
                errors.push('At least one correct option is required');
            }
            
            content.options.forEach((option, index) => {
                if (!option.text || typeof option.text !== 'string') {
                    errors.push(`Option ${index + 1} text is required and must be a string`);
                }
                
                if (typeof option.isCorrect !== 'boolean') {
                    errors.push(`Option ${index + 1} isCorrect must be a boolean`);
                }
            });
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    static getSchema() {
        return {
            type: 'object',
            required: ['stem', 'options'],
            properties: {
                stem: {
                    type: 'string',
                    description: 'The main question text with LaTeX support'
                },
                options: {
                    type: 'array',
                    minItems: 2,
                    maxItems: 10,
                    items: {
                        type: 'object',
                        required: ['text', 'isCorrect'],
                        properties: {
                            id: { type: 'string' },
                            text: { type: 'string' },
                            latex: { type: 'string' },
                            image: { type: 'string' },
                            isCorrect: { type: 'boolean' },
                            explanation: { type: 'string' }
                        }
                    }
                },
                explanation: { type: 'string' },
                hints: {
                    type: 'array',
                    items: { type: 'string' }
                }
            }
        };
    }
}

// ============================================
// SHORT ANSWER QUESTION
// ============================================

class ShortAnswerQuestion extends BaseQuestion {
    constructor(content, config = {}, latexRenderer) {
        super(content, config, latexRenderer);
        
        this.config = {
            caseSensitive: false,
            trimWhitespace: true,
            allowPartialCredit: true,
            ...config
        };
    }
    
    renderSpecific() {
        return {
            inputType: this.content.inputType || 'text',
            placeholder: this.content.placeholder || 'Enter your answer...',
            units: this.content.units || null,
            allowedCharacters: this.content.allowedCharacters || null,
            maxLength: this.content.maxLength || null,
            instructions: this.generateInstructions()
        };
    }
    
    generateInstructions() {
        let instructions = '';
        
        if (this.content.inputType === 'numeric') {
            instructions = 'Enter a numeric answer.';
            if (this.content.units) {
                instructions += ` Include units: ${this.content.units}`;
            }
        } else if (this.content.inputType === 'expression') {
            instructions = 'Enter your answer as a mathematical expression.';
        } else {
            instructions = 'Enter your answer as text.';
        }
        
        return instructions;
    }
    
    evaluate(response) {
        const userAnswer = this.normalizeAnswer(response.answer);
        const correctAnswers = Array.isArray(this.content.correctAnswer) ? 
            this.content.correctAnswer : [this.content.correctAnswer];
        
        // Check exact matches first
        for (const correctAnswer of correctAnswers) {
            const normalizedCorrect = this.normalizeAnswer(correctAnswer);
            
            if (this.content.inputType === 'numeric') {
                const result = this.evaluateNumericAnswer(userAnswer, normalizedCorrect);
                if (result.isCorrect) return result;
            } else if (this.content.inputType === 'expression') {
                const result = this.evaluateExpressionAnswer(userAnswer, normalizedCorrect);
                if (result.isCorrect) return result;
            } else {
                const result = this.evaluateTextAnswer(userAnswer, normalizedCorrect);
                if (result.isCorrect) return result;
            }
        }
        
        // Check for partial credit
        if (this.config.allowPartialCredit) {
            return this.calculatePartialCredit(userAnswer, correctAnswers);
        }
        
        return {
            isCorrect: false,
            score: 0.0,
            feedback: `Incorrect. The correct answer is: ${correctAnswers[0]}`
        };
    }
    
    evaluateNumericAnswer(userAnswer, correctAnswer) {
        const userNum = this.parseNumber(userAnswer);
        const correctNum = this.parseNumber(correctAnswer);
        
        if (userNum === null || correctNum === null) {
            return { isCorrect: false, score: 0.0, feedback: 'Invalid numeric format' };
        }
        
        const tolerance = this.content.tolerance || 0.01;
        const isCorrect = Math.abs(userNum - correctNum) <= tolerance;
        
        return {
            isCorrect,
            score: isCorrect ? 1.0 : 0.0,
            feedback: isCorrect ? 'Correct!' : `Close, but not within tolerance. Expected: ${correctNum}`
        };
    }
    
    evaluateExpressionAnswer(userAnswer, correctAnswer) {
        // This would integrate with a computer algebra system
        // For now, we'll do basic string comparison
        const simplified = this.simplifyExpression(userAnswer);
        const correctSimplified = this.simplifyExpression(correctAnswer);
        
        const isCorrect = simplified === correctSimplified;
        
        return {
            isCorrect,
            score: isCorrect ? 1.0 : 0.0,
            feedback: isCorrect ? 'Correct!' : `Incorrect. Expected: ${correctAnswer}`
        };
    }
    
    evaluateTextAnswer(userAnswer, correctAnswer) {
        const isCorrect = userAnswer === correctAnswer;
        
        return {
            isCorrect,
            score: isCorrect ? 1.0 : 0.0,
            feedback: isCorrect ? 'Correct!' : `Incorrect. Expected: ${correctAnswer}`
        };
    }
    
    normalizeAnswer(answer) {
        if (typeof answer !== 'string') return answer;
        
        let normalized = answer;
        
        if (this.config.trimWhitespace) {
            normalized = normalized.trim();
        }
        
        if (!this.config.caseSensitive) {
            normalized = normalized.toLowerCase();
        }
        
        return normalized;
    }
    
    parseNumber(value) {
        if (typeof value === 'number') return value;
        if (typeof value !== 'string') return null;
        
        // Remove common formatting
        const cleaned = value.replace(/[,\s]/g, '');
        const num = parseFloat(cleaned);
        
        return isNaN(num) ? null : num;
    }
    
    simplifyExpression(expression) {
        // Basic expression simplification
        // In a real implementation, this would use a CAS library
        return expression
            .replace(/\s+/g, '')
            .replace(/\*\*/g, '^')
            .toLowerCase();
    }
    
    calculatePartialCredit(userAnswer, correctAnswers) {
        // Implement partial credit logic based on similarity
        let maxScore = 0;
        let bestFeedback = '';
        
        correctAnswers.forEach(correctAnswer => {
            const similarity = this.calculateSimilarity(userAnswer, correctAnswer);
            const score = similarity > 0.7 ? similarity * 0.5 : 0; // 50% max for partial credit
            
            if (score > maxScore) {
                maxScore = score;
                bestFeedback = `Partially correct. You're on the right track. Expected: ${correctAnswer}`;
            }
        });
        
        return {
            isCorrect: false,
            score: maxScore,
            feedback: bestFeedback || 'Incorrect answer'
        };
    }
    
    calculateSimilarity(str1, str2) {
        // Simple Levenshtein distance-based similarity
        const len1 = str1.length;
        const len2 = str2.length;
        
        if (len1 === 0) return len2 === 0 ? 1 : 0;
        if (len2 === 0) return 0;
        
        const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
        
        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;
        
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        
        const distance = matrix[len1][len2];
        return 1 - distance / Math.max(len1, len2);
    }
    
    static validate(content) {
        const errors = [];
        
        if (!content.stem || typeof content.stem !== 'string') {
            errors.push('Question stem is required and must be a string');
        }
        
        if (!content.correctAnswer) {
            errors.push('Correct answer is required');
        }
        
        if (content.inputType === 'numeric' && content.tolerance !== undefined) {
            if (typeof content.tolerance !== 'number' || content.tolerance < 0) {
                errors.push('Tolerance must be a non-negative number');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    static getSchema() {
        return {
            type: 'object',
            required: ['stem', 'correctAnswer'],
            properties: {
                stem: { type: 'string' },
                correctAnswer: {
                    oneOf: [
                        { type: 'string' },
                        { type: 'number' },
                        { type: 'array', items: { type: 'string' } }
                    ]
                },
                inputType: {
                    type: 'string',
                    enum: ['text', 'numeric', 'expression']
                },
                tolerance: { type: 'number', minimum: 0 },
                units: { type: 'string' },
                placeholder: { type: 'string' },
                maxLength: { type: 'integer', minimum: 1 }
            }
        };
    }
}

// ============================================
// EQUATION EDITOR QUESTION
// ============================================

class EquationEditorQuestion extends BaseQuestion {
    constructor(content, config = {}, latexRenderer) {
        super(content, config, latexRenderer);
        
        this.config = {
            allowedFunctions: ['sin', 'cos', 'tan', 'log', 'ln', 'exp', 'sqrt'],
            allowedOperators: ['+', '-', '*', '/', '^', '(', ')'],
            allowedConstants: ['e', 'pi', 'i'],
            validateSyntax: true,
            ...config
        };
    }
    
    renderSpecific() {
        return {
            editorType: 'equation',
            allowedFunctions: this.config.allowedFunctions,
            allowedOperators: this.config.allowedOperators,
            allowedConstants: this.config.allowedConstants,
            placeholder: this.content.placeholder || 'Enter your equation...',
            instructions: 'Use the equation editor to enter your mathematical expression.',
            template: this.content.template || null,
            mathKeyboard: true
        };
    }
    
    evaluate(response) {
        const userEquation = response.equation;
        const correctEquations = Array.isArray(this.content.correctAnswer) ? 
            this.content.correctAnswer : [this.content.correctAnswer];
        
        // Validate syntax
        if (this.config.validateSyntax) {
            const syntaxValidation = this.validateEquationSyntax(userEquation);
            if (!syntaxValidation.isValid) {
                return {
                    isCorrect: false,
                    score: 0.0,
                    feedback: `Syntax error: ${syntaxValidation.error}`
                };
            }
        }
        
        // Check for algebraic equivalence
        for (const correctEquation of correctEquations) {
            const equivalence = this.checkAlgebraicEquivalence(userEquation, correctEquation);
            if (equivalence.isEquivalent) {
                return {
                    isCorrect: true,
                    score: 1.0,
                    feedback: 'Correct! Your equation is algebraically equivalent to the expected answer.'
                };
            }
        }
        
        return {
            isCorrect: false,
            score: 0.0,
            feedback: `Incorrect. Expected: ${correctEquations[0]}`
        };
    }
    
    validateEquationSyntax(equation) {
        // Basic syntax validation
        // In a real implementation, this would use a proper parser
        try {
            // Check for balanced parentheses
            let balance = 0;
            for (const char of equation) {
                if (char === '(') balance++;
                if (char === ')') balance--;
                if (balance < 0) {
                    return { isValid: false, error: 'Unmatched closing parenthesis' };
                }
            }
            
            if (balance !== 0) {
                return { isValid: false, error: 'Unmatched opening parenthesis' };
            }
            
            // Check for forbidden characters
            const allowedChars = /^[a-zA-Z0-9+\-*/^().\s=<>!]+$/;
            if (!allowedChars.test(equation)) {
                return { isValid: false, error: 'Contains forbidden characters' };
            }
            
            return { isValid: true };
        } catch (error) {
            return { isValid: false, error: error.message };
        }
    }
    
    checkAlgebraicEquivalence(equation1, equation2) {
        // This would integrate with a computer algebra system
        // For now, we'll do basic comparison
        const normalized1 = this.normalizeEquation(equation1);
        const normalized2 = this.normalizeEquation(equation2);
        
        return {
            isEquivalent: normalized1 === normalized2,
            confidence: normalized1 === normalized2 ? 1.0 : 0.0
        };
    }
    
    normalizeEquation(equation) {
        return equation
            .replace(/\s+/g, '')
            .replace(/\*\*/g, '^')
            .toLowerCase();
    }
    
    static validate(content) {
        const errors = [];
        
        if (!content.stem || typeof content.stem !== 'string') {
            errors.push('Question stem is required and must be a string');
        }
        
        if (!content.correctAnswer) {
            errors.push('Correct answer is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    static getSchema() {
        return {
            type: 'object',
            required: ['stem', 'correctAnswer'],
            properties: {
                stem: { type: 'string' },
                correctAnswer: {
                    oneOf: [
                        { type: 'string' },
                        { type: 'array', items: { type: 'string' } }
                    ]
                },
                template: { type: 'string' },
                placeholder: { type: 'string' }
            }
        };
    }
}

// ============================================
// LATEX RENDERER CLASS
// ============================================

class LaTeXRenderer {
    constructor(config = {}) {
        this.config = {
            displayMode: false,
            throwOnError: false,
            output: 'html',
            ...config
        };
    }
    
    render(text) {
        if (!text || typeof text !== 'string') {
            return text;
        }
        
        // Find LaTeX expressions in the text
        const latexRegex = /\$\$([^$]*)\$\$|\$([^$]*)\$/g;
        
        return text.replace(latexRegex, (match, displayMath, inlineMath) => {
            const mathContent = displayMath || inlineMath;
            const isDisplayMode = !!displayMath;
            
            return this.renderMath(mathContent, isDisplayMode);
        });
    }
    
    renderMath(latex, displayMode = false) {
        // In a real implementation, this would use KaTeX or MathJax
        // For now, we'll return a placeholder
        return `<span class="math-expression" data-latex="${latex}" data-display="${displayMode}">
            ${latex}
        </span>`;
    }
    
    validateLatex(latex) {
        // Basic LaTeX validation
        try {
            // Check for balanced braces
            let balance = 0;
            for (const char of latex) {
                if (char === '{') balance++;
                if (char === '}') balance--;
                if (balance < 0) {
                    return { isValid: false, error: 'Unmatched closing brace' };
                }
            }
            
            if (balance !== 0) {
                return { isValid: false, error: 'Unmatched opening brace' };
            }
            
            return { isValid: true };
        } catch (error) {
            return { isValid: false, error: error.message };
        }
    }
}

// ============================================
// VALIDATION RULES CLASS
// ============================================

class ValidationRules {
    constructor() {
        this.rules = {
            required: (value) => value !== null && value !== undefined && value !== '',
            minLength: (value, min) => typeof value === 'string' && value.length >= min,
            maxLength: (value, max) => typeof value === 'string' && value.length <= max,
            numeric: (value) => !isNaN(parseFloat(value)) && isFinite(value),
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            url: (value) => /^https?:\/\/.+/.test(value)
        };
    }
    
    validate(value, rules) {
        const errors = [];
        
        for (const [rule, param] of Object.entries(rules)) {
            const validator = this.rules[rule];
            
            if (validator && !validator(value, param)) {
                errors.push(`Validation failed for rule: ${rule}`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// ============================================
// EXPORT
// ============================================

module.exports = {
    QuestionTypeManager,
    MultipleChoiceQuestion,
    ShortAnswerQuestion,
    EquationEditorQuestion,
    LaTeXRenderer,
    ValidationRules
};