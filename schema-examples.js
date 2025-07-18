// Schema Markup Examples for Different Page Types

// Example 1: Algebra Course Page
const algebraCourseSchema = {
    course: {
        name: "Complete Algebra Course",
        description: "Master algebra from basics to advanced topics with step-by-step lessons and practice problems",
        url: "/algebra/",
        courseCode: "ALG-101",
        level: "High School to College",
        duration: "PT20H", // 20 hours total
        workload: "PT3H", // 3 hours per week
        skills: [
            "Solving linear equations",
            "Quadratic equations",
            "Polynomial operations",
            "Factoring",
            "Systems of equations"
        ],
        sections: [
            {
                name: "Introduction to Algebra",
                description: "Basic concepts and terminology",
                duration: "PT1H"
            },
            {
                name: "Linear Equations",
                description: "Solving one-variable linear equations",
                duration: "PT2H"
            },
            {
                name: "Quadratic Equations",
                description: "Solving quadratic equations using various methods",
                duration: "PT3H"
            }
        ],
        rating: {
            ratingValue: "4.9",
            reviewCount: "2341"
        }
    }
};

// Example 2: Quadratic Equation Solver Page
const quadraticSolverSchema = {
    solver: {
        name: "Quadratic Equation Solver",
        description: "Solve quadratic equations instantly with step-by-step solutions",
        url: "/algebra/quadratic-solver/",
        features: [
            "Step-by-step solutions",
            "Multiple solution methods",
            "Graph visualization",
            "Discriminant analysis",
            "Complex number support"
        ],
        solutionTypes: ["Algebraic", "Graphical", "Numerical"],
        mathTypes: ["Algebra"],
        problemTypes: ["Quadratic equations", "Parabolas", "Roots finding"]
    },
    problems: [
        {
            title: "Standard Form Quadratic",
            question: "Solve x² + 5x + 6 = 0",
            expression: "x^2 + 5x + 6 = 0",
            difficulty: "Easy",
            answer: "x = -2 or x = -3",
            answerExpression: "x = -2, x = -3",
            solution: "Factor the quadratic: (x + 2)(x + 3) = 0",
            steps: [
                {
                    title: "Identify coefficients",
                    description: "a = 1, b = 5, c = 6",
                    expression: "ax^2 + bx + c = 0"
                },
                {
                    title: "Factor the expression",
                    description: "Find two numbers that multiply to 6 and add to 5",
                    expression: "(x + 2)(x + 3) = 0"
                },
                {
                    title: "Solve each factor",
                    description: "Set each factor equal to zero",
                    expression: "x + 2 = 0 or x + 3 = 0"
                }
            ]
        }
    ]
};

// Example 3: Calculus Practice Problems
const calculusPracticeSchema = {
    title: "Calculus Practice Problems - Derivatives",
    description: "Practice differentiation with these carefully selected problems",
    url: "/calculus/practice/derivatives/",
    level: "AP Calculus / College",
    topic: "Derivatives",
    topicDescription: "Finding derivatives using various rules and techniques",
    estimatedTime: "PT45M",
    ageRange: "16-22",
    concepts: ["Power rule", "Product rule", "Chain rule", "Implicit differentiation"],
    skills: ["Differentiation", "Algebraic manipulation", "Function analysis"],
    problems: [
        {
            title: "Power Rule",
            type: "Exercise",
            question: "Find the derivative of f(x) = 3x⁴ - 2x² + 5x - 7",
            expression: "f(x) = 3x^4 - 2x^2 + 5x - 7",
            difficulty: "Easy",
            level: "AP Calculus AB",
            answer: "f'(x) = 12x³ - 4x + 5",
            answerExpression: "f'(x) = 12x^3 - 4x + 5",
            solution: "Apply the power rule to each term",
            steps: [
                {
                    title: "Apply power rule to first term",
                    description: "Derivative of 3x⁴ is 12x³",
                    expression: "d/dx(3x^4) = 12x^3"
                },
                {
                    title: "Apply power rule to remaining terms",
                    description: "Continue with each term",
                    expression: "d/dx(-2x^2 + 5x - 7) = -4x + 5 + 0"
                }
            ]
        },
        {
            title: "Chain Rule",
            type: "Exercise",
            question: "Find the derivative of f(x) = (2x + 1)⁵",
            expression: "f(x) = (2x + 1)^5",
            difficulty: "Medium",
            answer: "f'(x) = 10(2x + 1)⁴",
            answerExpression: "f'(x) = 10(2x + 1)^4"
        }
    ]
};

// Example 4: Math Quiz
const algebraQuizSchema = {
    quiz: {
        title: "Algebra Fundamentals Quiz",
        description: "Test your understanding of basic algebra concepts",
        url: "/algebra/quiz/fundamentals/",
        level: "High School",
        topic: "Algebra Basics",
        duration: "PT20M",
        questions: [
            {
                text: "Solve for x: 2x + 5 = 13",
                options: ["x = 4", "x = 6", "x = 8", "x = 9"],
                correctAnswer: "x = 4",
                correctIndex: 1,
                topic: "Linear Equations"
            },
            {
                text: "Factor: x² - 9",
                options: ["(x-3)(x-3)", "(x+3)(x-3)", "(x+3)(x+3)", "Cannot be factored"],
                correctAnswer: "(x+3)(x-3)",
                correctIndex: 2,
                topic: "Factoring"
            },
            {
                text: "Simplify: 3x + 2x - x",
                options: ["4x", "5x", "6x", "3x"],
                correctAnswer: "4x",
                correctIndex: 1,
                topic: "Combining Like Terms"
            }
        ]
    }
};

// Example 5: FAQ Page
const mathHelpFAQSchema = {
    faq: {
        title: "Math Help - Frequently Asked Questions",
        description: "Find answers to common questions about using Math Help and learning mathematics",
        url: "/faq/",
        questions: [
            {
                question: "Is Math Help really free to use?",
                answer: "Yes, Math Help is completely free to use. All our calculators, lessons, and practice problems are available at no cost. We believe everyone should have access to quality math education resources."
            },
            {
                question: "How do I solve quadratic equations?",
                answer: "There are several methods to solve quadratic equations: factoring, using the quadratic formula, completing the square, or graphing. Our quadratic equation solver shows you step-by-step solutions using all these methods. Visit our algebra section to learn more."
            },
            {
                question: "What topics does Math Help cover?",
                answer: "Math Help covers a wide range of mathematics topics including: Algebra (linear equations, quadratic equations, polynomials), Calculus (derivatives, integrals, limits), Geometry (shapes, proofs, trigonometry), Statistics (probability, data analysis), and more advanced topics."
            },
            {
                question: "Can I use Math Help on my mobile device?",
                answer: "Yes! Math Help is fully responsive and works on all devices including smartphones, tablets, and desktop computers. You can even add it to your home screen for quick access."
            },
            {
                question: "How accurate are the calculators?",
                answer: "Our calculators use advanced mathematical algorithms and are thoroughly tested for accuracy. We use arbitrary-precision arithmetic where needed to ensure results are correct to many decimal places."
            }
        ]
    }
};

// Example 6: Implementation for a complete page
function implementSchemaForAlgebraPage() {
    const pageData = {
        url: "/algebra/",
        title: "Algebra Help - Equations, Functions & Graphing Tools",
        description: "Master algebra with our comprehensive guides, equation solvers, and graphing calculators.",
        breadcrumbs: [
            { name: "Home", url: "/" },
            { name: "Algebra", url: "/algebra/" }
        ],
        course: algebraCourseSchema.course,
        problems: [
            {
                title: "Linear Equations Practice",
                question: "Solve: 3x - 7 = 14",
                expression: "3x - 7 = 14",
                answer: "x = 7",
                difficulty: "Easy"
            }
        ],
        faq: {
            questions: [
                {
                    question: "What is algebra?",
                    answer: "Algebra is a branch of mathematics that uses symbols (usually letters) to represent unknown values in equations and expressions."
                },
                {
                    question: "Why is algebra important?",
                    answer: "Algebra forms the foundation for advanced mathematics and is essential for fields like science, engineering, economics, and computer science."
                }
            ]
        }
    };
    
    // Generate and inject the schema
    const schema = window.enhancedSchemaMarkup.generatePageSchema(pageData);
    window.enhancedSchemaMarkup.injectSchema(schema);
}

// Example 7: Math Solver implementation
function implementMathSolverSchema() {
    const solverSchema = window.enhancedSchemaMarkup.generateMathSolverSchema({
        name: "Universal Math Solver",
        description: "Solve any mathematical problem with step-by-step solutions",
        url: "/tools/math-solver/",
        features: [
            "Step-by-step solutions",
            "Multiple solution methods",
            "Graph visualization",
            "LaTeX rendering",
            "Solution export (PDF/Image)",
            "Solution history"
        ],
        solutionTypes: ["Algebraic", "Numeric", "Graphical", "Series expansion"],
        mathTypes: ["Algebra", "Calculus", "Trigonometry", "Statistics", "Linear Algebra", "Differential Equations"],
        problemTypes: [
            "Equations (linear, quadratic, polynomial)",
            "Inequalities",
            "Systems of equations",
            "Derivatives (partial, implicit)",
            "Integrals (definite, indefinite)",
            "Limits",
            "Series and sequences",
            "Matrix operations",
            "Statistical analysis"
        ]
    });
    
    window.enhancedSchemaMarkup.injectSchema(solverSchema);
}

// Example 8: Practice Problems Page
function implementPracticeProblemsSchema() {
    const practiceSchema = window.enhancedSchemaMarkup.generatePracticeProblemsSchema({
        title: "Algebra Practice Problems",
        description: "Comprehensive algebra practice with instant feedback",
        url: "/algebra/practice/",
        level: "High School",
        topic: "Algebra",
        topicDescription: "Linear equations, quadratic equations, and polynomials",
        estimatedTime: "PT1H",
        ageRange: "14-18",
        concepts: ["Equations", "Factoring", "Graphing", "Word problems"],
        skills: ["Problem solving", "Algebraic manipulation", "Critical thinking"],
        problems: [
            {
                title: "Two-Step Equation",
                question: "Solve: 4x + 3 = 19",
                expression: "4x + 3 = 19",
                difficulty: "Easy",
                answer: "x = 4",
                solution: "Subtract 3 from both sides, then divide by 4",
                steps: [
                    {
                        title: "Subtract 3 from both sides",
                        description: "4x + 3 - 3 = 19 - 3",
                        expression: "4x = 16"
                    },
                    {
                        title: "Divide both sides by 4",
                        description: "4x ÷ 4 = 16 ÷ 4",
                        expression: "x = 4"
                    }
                ]
            },
            {
                title: "Quadratic by Factoring",
                question: "Solve: x² - 5x + 6 = 0",
                expression: "x^2 - 5x + 6 = 0",
                difficulty: "Medium",
                answer: "x = 2 or x = 3",
                solution: "Factor as (x - 2)(x - 3) = 0"
            }
        ]
    });
    
    window.enhancedSchemaMarkup.injectSchema(practiceSchema);
}

// Export examples for use
window.schemaExamples = {
    algebraCourse: algebraCourseSchema,
    quadraticSolver: quadraticSolverSchema,
    calculusPractice: calculusPracticeSchema,
    algebraQuiz: algebraQuizSchema,
    mathHelpFAQ: mathHelpFAQSchema,
    implementAlgebraPage: implementSchemaForAlgebraPage,
    implementMathSolver: implementMathSolverSchema,
    implementPracticeProblems: implementPracticeProblemsSchema
};