// Learning Paths Data - Structured Mathematical Journeys
// Phase 11 Implementation for MathVerse

function getLearningPathCategories() {
    return [
        {
            id: 'foundations',
            title: 'Mathematical Foundations',
            icon: '🔢',
            description: 'Start your mathematical journey from the very beginning',
            pathCount: 4,
            conceptCount: 67,
            difficulties: ['beginner'],
            durations: ['medium', 'long'],
            focus: 'pure'
        },
        {
            id: 'algebra_geometry',
            title: 'Algebra & Geometry',
            icon: '📐',
            description: 'Master the building blocks of advanced mathematics',
            pathCount: 6,
            conceptCount: 89,
            difficulties: ['beginner', 'intermediate'],
            durations: ['medium', 'long'],
            focus: 'pure'
        },
        {
            id: 'calculus_analysis',
            title: 'Calculus & Analysis',
            icon: '📈',
            description: 'Explore the mathematics of change and infinite processes',
            pathCount: 5,
            conceptCount: 76,
            difficulties: ['intermediate', 'advanced'],
            durations: ['long'],
            focus: 'pure'
        },
        {
            id: 'applied_mathematics',
            title: 'Applied Mathematics',
            icon: '🔬',
            description: 'See mathematics in action across science and engineering',
            pathCount: 7,
            conceptCount: 94,
            difficulties: ['intermediate', 'advanced'],
            durations: ['medium', 'long'],
            focus: 'applied'
        },
        {
            id: 'discrete_computational',
            title: 'Discrete & Computational',
            icon: '💻',
            description: 'Mathematics for computer science and digital applications',
            pathCount: 5,
            conceptCount: 71,
            difficulties: ['intermediate', 'advanced'],
            durations: ['medium'],
            focus: 'computational'
        },
        {
            id: 'statistics_probability',
            title: 'Statistics & Probability',
            icon: '📊',
            description: 'Understand uncertainty and make data-driven decisions',
            pathCount: 4,
            conceptCount: 58,
            difficulties: ['beginner', 'intermediate', 'advanced'],
            durations: ['medium'],
            focus: 'applied'
        },
        {
            id: 'advanced_topics',
            title: 'Advanced Topics',
            icon: '🎓',
            description: 'Cutting-edge mathematics for serious students',
            pathCount: 8,
            conceptCount: 112,
            difficulties: ['advanced', 'expert'],
            durations: ['long'],
            focus: 'pure'
        },
        {
            id: 'exam_preparation',
            title: 'Exam Preparation',
            icon: '📝',
            description: 'Targeted preparation for specific exams and tests',
            pathCount: 6,
            conceptCount: 45,
            difficulties: ['beginner', 'intermediate', 'advanced'],
            durations: ['short', 'medium'],
            focus: 'applied'
        }
    ];
}

function getAllLearningPaths() {
    return [
        // Foundations Category
        {
            id: 'counting_to_algebra',
            category: 'foundations',
            title: 'From Counting to Algebra',
            icon: '🔢',
            description: 'Complete mathematical foundation from basic counting to algebraic thinking',
            minLevel: 1,
            maxLevel: 4,
            difficulty: 2,
            estimatedHours: 45,
            prerequisites: [],
            concepts: [
                {
                    id: 'natural_numbers',
                    title: 'Natural Numbers',
                    shortName: 'ℕ',
                    description: 'Understanding counting numbers and their properties',
                    estimatedHours: 3,
                    objectives: [
                        'Count objects systematically',
                        'Understand place value',
                        'Compare and order numbers'
                    ],
                    prerequisites: []
                },
                {
                    id: 'basic_operations',
                    title: 'Basic Operations',
                    shortName: '+−×÷',
                    description: 'Addition, subtraction, multiplication, and division',
                    estimatedHours: 8,
                    objectives: [
                        'Master basic arithmetic operations',
                        'Understand operation properties',
                        'Solve word problems'
                    ],
                    prerequisites: ['natural_numbers']
                },
                {
                    id: 'fractions_decimals',
                    title: 'Fractions & Decimals',
                    shortName: '½',
                    description: 'Understanding parts of wholes and decimal representation',
                    estimatedHours: 10,
                    objectives: [
                        'Work with fractions and mixed numbers',
                        'Convert between fractions and decimals',
                        'Add, subtract, multiply, and divide fractions'
                    ],
                    prerequisites: ['basic_operations']
                },
                {
                    id: 'integers',
                    title: 'Integers',
                    shortName: 'ℤ',
                    description: 'Positive and negative whole numbers',
                    estimatedHours: 6,
                    objectives: [
                        'Understand negative numbers',
                        'Operations with integers',
                        'Number line representation'
                    ],
                    prerequisites: ['basic_operations']
                },
                {
                    id: 'basic_algebra',
                    title: 'Introduction to Algebra',
                    shortName: 'x',
                    description: 'Variables, expressions, and simple equations',
                    estimatedHours: 12,
                    objectives: [
                        'Use variables to represent unknowns',
                        'Simplify algebraic expressions',
                        'Solve simple linear equations'
                    ],
                    prerequisites: ['fractions_decimals', 'integers']
                },
                {
                    id: 'ratios_proportions',
                    title: 'Ratios & Proportions',
                    shortName: 'a:b',
                    description: 'Comparing quantities and solving proportion problems',
                    estimatedHours: 6,
                    objectives: [
                        'Understand ratio relationships',
                        'Solve proportion problems',
                        'Apply to real-world situations'
                    ],
                    prerequisites: ['fractions_decimals']
                }
            ]
        },

        {
            id: 'geometry_fundamentals',
            category: 'foundations',
            title: 'Geometry Fundamentals',
            icon: '△',
            description: 'Essential geometric concepts from points to complex shapes',
            minLevel: 2,
            maxLevel: 5,
            difficulty: 2,
            estimatedHours: 38,
            prerequisites: ['basic_operations'],
            concepts: [
                {
                    id: 'points_lines_planes',
                    title: 'Points, Lines & Planes',
                    shortName: '•━',
                    description: 'Basic geometric objects and their relationships',
                    estimatedHours: 4,
                    objectives: [
                        'Identify geometric objects',
                        'Understand geometric relationships',
                        'Use geometric notation'
                    ],
                    prerequisites: []
                },
                {
                    id: 'angles',
                    title: 'Angles',
                    shortName: '∠',
                    description: 'Types of angles and angle measurements',
                    estimatedHours: 6,
                    objectives: [
                        'Classify angle types',
                        'Measure angles with protractor',
                        'Understand angle relationships'
                    ],
                    prerequisites: ['points_lines_planes']
                },
                {
                    id: 'triangles',
                    title: 'Triangles',
                    shortName: '△',
                    description: 'Triangle types, properties, and calculations',
                    estimatedHours: 8,
                    objectives: [
                        'Classify triangles by sides and angles',
                        'Apply triangle inequality',
                        'Calculate perimeter and area'
                    ],
                    prerequisites: ['angles']
                },
                {
                    id: 'quadrilaterals',
                    title: 'Quadrilaterals',
                    shortName: '□',
                    description: 'Four-sided shapes and their properties',
                    estimatedHours: 6,
                    objectives: [
                        'Identify quadrilateral types',
                        'Understand parallelogram properties',
                        'Calculate areas of quadrilaterals'
                    ],
                    prerequisites: ['triangles']
                },
                {
                    id: 'circles',
                    title: 'Circles',
                    shortName: '○',
                    description: 'Circle properties, circumference, and area',
                    estimatedHours: 8,
                    objectives: [
                        'Understand circle terminology',
                        'Calculate circumference and area',
                        'Work with semicircles and sectors'
                    ],
                    prerequisites: ['basic_algebra']
                },
                {
                    id: 'geometric_measurement',
                    title: 'Geometric Measurement',
                    shortName: '📏',
                    description: 'Perimeter, area, and volume calculations',
                    estimatedHours: 6,
                    objectives: [
                        'Apply area and perimeter formulas',
                        'Calculate surface area and volume',
                        'Solve measurement problems'
                    ],
                    prerequisites: ['quadrilaterals', 'circles']
                }
            ]
        },

        // Algebra & Geometry Category
        {
            id: 'linear_algebra_foundations',
            category: 'algebra_geometry',
            title: 'Linear Algebra Foundations',
            icon: '📊',
            description: 'From linear equations to systems and graphing',
            minLevel: 4,
            maxLevel: 7,
            difficulty: 3,
            estimatedHours: 52,
            prerequisites: ['basic_algebra'],
            concepts: [
                {
                    id: 'linear_equations',
                    title: 'Linear Equations',
                    shortName: 'ax+b=0',
                    description: 'Solving equations with one variable',
                    estimatedHours: 8,
                    objectives: [
                        'Solve linear equations in one variable',
                        'Use properties of equality',
                        'Check solutions and identify special cases'
                    ],
                    prerequisites: ['basic_algebra']
                },
                {
                    id: 'coordinate_plane',
                    title: 'Coordinate Plane',
                    shortName: '(x,y)',
                    description: 'Cartesian coordinates and plotting points',
                    estimatedHours: 6,
                    objectives: [
                        'Plot points on coordinate plane',
                        'Find distance between points',
                        'Understand quadrants and axes'
                    ],
                    prerequisites: ['integers']
                },
                {
                    id: 'linear_functions',
                    title: 'Linear Functions',
                    shortName: 'f(x)=mx+b',
                    description: 'Functions, graphs, and slope-intercept form',
                    estimatedHours: 10,
                    objectives: [
                        'Understand function notation',
                        'Graph linear functions',
                        'Find slope and y-intercept'
                    ],
                    prerequisites: ['linear_equations', 'coordinate_plane']
                },
                {
                    id: 'systems_linear_equations',
                    title: 'Systems of Linear Equations',
                    shortName: '{ax+by=c',
                    description: 'Solving systems by graphing, substitution, and elimination',
                    estimatedHours: 12,
                    objectives: [
                        'Solve systems graphically',
                        'Use substitution method',
                        'Apply elimination method'
                    ],
                    prerequisites: ['linear_functions']
                },
                {
                    id: 'inequalities',
                    title: 'Linear Inequalities',
                    shortName: 'x>a',
                    description: 'Solving and graphing inequalities',
                    estimatedHours: 8,
                    objectives: [
                        'Solve linear inequalities',
                        'Graph inequality solutions',
                        'Solve compound inequalities'
                    ],
                    prerequisites: ['linear_equations']
                },
                {
                    id: 'absolute_value',
                    title: 'Absolute Value',
                    shortName: '|x|',
                    description: 'Absolute value equations and inequalities',
                    estimatedHours: 8,
                    objectives: [
                        'Understand absolute value concept',
                        'Solve absolute value equations',
                        'Graph absolute value functions'
                    ],
                    prerequisites: ['inequalities']
                }
            ]
        },

        {
            id: 'quadratic_polynomials',
            category: 'algebra_geometry',
            title: 'Quadratics & Polynomials',
            icon: '📈',
            description: 'Explore curved relationships and polynomial algebra',
            minLevel: 5,
            maxLevel: 8,
            difficulty: 4,
            estimatedHours: 46,
            prerequisites: ['linear_functions'],
            concepts: [
                {
                    id: 'polynomial_basics',
                    title: 'Polynomial Basics',
                    shortName: 'P(x)',
                    description: 'Understanding polynomial terminology and operations',
                    estimatedHours: 6,
                    objectives: [
                        'Identify polynomial terms and degrees',
                        'Add and subtract polynomials',
                        'Understand polynomial vocabulary'
                    ],
                    prerequisites: ['basic_algebra']
                },
                {
                    id: 'factoring',
                    title: 'Factoring Polynomials',
                    shortName: 'ab',
                    description: 'Various factoring techniques for polynomials',
                    estimatedHours: 12,
                    objectives: [
                        'Factor out common factors',
                        'Factor quadratics by grouping',
                        'Use special factoring patterns'
                    ],
                    prerequisites: ['polynomial_basics']
                },
                {
                    id: 'quadratic_equations',
                    title: 'Quadratic Equations',
                    shortName: 'ax²+bx+c=0',
                    description: 'Solving quadratic equations by multiple methods',
                    estimatedHours: 10,
                    objectives: [
                        'Solve by factoring',
                        'Complete the square',
                        'Use quadratic formula'
                    ],
                    prerequisites: ['factoring']
                },
                {
                    id: 'quadratic_functions',
                    title: 'Quadratic Functions',
                    shortName: 'y=ax²+bx+c',
                    description: 'Graphing parabolas and understanding their properties',
                    estimatedHours: 10,
                    objectives: [
                        'Graph quadratic functions',
                        'Find vertex and axis of symmetry',
                        'Determine domain and range'
                    ],
                    prerequisites: ['quadratic_equations']
                },
                {
                    id: 'polynomial_functions',
                    title: 'Polynomial Functions',
                    shortName: 'P(x)=aₙxⁿ+...',
                    description: 'Higher degree polynomials and their behavior',
                    estimatedHours: 8,
                    objectives: [
                        'Analyze polynomial end behavior',
                        'Find zeros and factors',
                        'Sketch polynomial graphs'
                    ],
                    prerequisites: ['quadratic_functions']
                }
            ]
        },

        // Calculus & Analysis Category
        {
            id: 'precalculus_path',
            category: 'calculus_analysis',
            title: 'Pre-Calculus Mastery',
            icon: '🌊',
            description: 'Essential preparation for calculus success',
            minLevel: 6,
            maxLevel: 8,
            difficulty: 4,
            estimatedHours: 64,
            prerequisites: ['quadratic_functions'],
            concepts: [
                {
                    id: 'functions_domain_range',
                    title: 'Functions & Their Properties',
                    shortName: 'f(x)',
                    description: 'Deep understanding of functions, domain, and range',
                    estimatedHours: 8,
                    objectives: [
                        'Understand function concepts',
                        'Find domain and range',
                        'Compose and decompose functions'
                    ],
                    prerequisites: ['quadratic_functions']
                },
                {
                    id: 'exponential_logarithmic',
                    title: 'Exponential & Logarithmic Functions',
                    shortName: 'eˣ, log',
                    description: 'Growth, decay, and inverse relationships',
                    estimatedHours: 12,
                    objectives: [
                        'Understand exponential growth and decay',
                        'Work with logarithmic properties',
                        'Solve exponential and log equations'
                    ],
                    prerequisites: ['functions_domain_range']
                },
                {
                    id: 'trigonometry',
                    title: 'Trigonometry',
                    shortName: 'sin, cos, tan',
                    description: 'Trigonometric functions and their applications',
                    estimatedHours: 16,
                    objectives: [
                        'Understand unit circle',
                        'Work with trig identities',
                        'Solve trigonometric equations'
                    ],
                    prerequisites: ['circles', 'functions_domain_range']
                },
                {
                    id: 'conic_sections',
                    title: 'Conic Sections',
                    shortName: '⚬⚬⚬',
                    description: 'Circles, ellipses, parabolas, and hyperbolas',
                    estimatedHours: 10,
                    objectives: [
                        'Identify conic section types',
                        'Write equations in standard form',
                        'Graph conic sections'
                    ],
                    prerequisites: ['quadratic_functions']
                },
                {
                    id: 'sequences_series',
                    title: 'Sequences & Series',
                    shortName: 'Σ',
                    description: 'Patterns in numbers and infinite sums',
                    estimatedHours: 10,
                    objectives: [
                        'Identify arithmetic and geometric sequences',
                        'Find sums of finite and infinite series',
                        'Apply to real-world problems'
                    ],
                    prerequisites: ['exponential_logarithmic']
                },
                {
                    id: 'limits_intro',
                    title: 'Introduction to Limits',
                    shortName: 'lim',
                    description: 'Understanding approaching values',
                    estimatedHours: 8,
                    objectives: [
                        'Understand limit concept',
                        'Evaluate limits graphically and numerically',
                        'Recognize when limits don\'t exist'
                    ],
                    prerequisites: ['functions_domain_range']
                }
            ]
        },

        {
            id: 'calculus_differential',
            category: 'calculus_analysis',
            title: 'Differential Calculus',
            icon: '📉',
            description: 'The mathematics of instantaneous change',
            minLevel: 7,
            maxLevel: 9,
            difficulty: 5,
            estimatedHours: 58,
            prerequisites: ['limits_intro'],
            concepts: [
                {
                    id: 'limits_formal',
                    title: 'Formal Limits',
                    shortName: 'lim→',
                    description: 'Rigorous approach to limit calculations',
                    estimatedHours: 8,
                    objectives: [
                        'Apply limit laws',
                        'Evaluate indeterminate forms',
                        'Understand continuity'
                    ],
                    prerequisites: ['limits_intro']
                },
                {
                    id: 'derivatives_definition',
                    title: 'Definition of Derivative',
                    shortName: 'f\'(x)',
                    description: 'Understanding derivatives as limits',
                    estimatedHours: 10,
                    objectives: [
                        'Understand derivative as limit',
                        'Use definition to find derivatives',
                        'Interpret geometric meaning'
                    ],
                    prerequisites: ['limits_formal']
                },
                {
                    id: 'differentiation_rules',
                    title: 'Differentiation Rules',
                    shortName: 'd/dx',
                    description: 'Power, product, quotient, and chain rules',
                    estimatedHours: 12,
                    objectives: [
                        'Apply basic differentiation rules',
                        'Use product and quotient rules',
                        'Master the chain rule'
                    ],
                    prerequisites: ['derivatives_definition']
                },
                {
                    id: 'applications_derivatives',
                    title: 'Applications of Derivatives',
                    shortName: 'max/min',
                    description: 'Optimization and related rates',
                    estimatedHours: 14,
                    objectives: [
                        'Find critical points and extrema',
                        'Solve optimization problems',
                        'Work with related rates'
                    ],
                    prerequisites: ['differentiation_rules']
                },
                {
                    id: 'curve_analysis',
                    title: 'Curve Analysis',
                    shortName: 'f\'\'(x)',
                    description: 'Using derivatives to analyze function behavior',
                    estimatedHours: 10,
                    objectives: [
                        'Apply first and second derivative tests',
                        'Analyze concavity and inflection points',
                        'Sketch curves using calculus'
                    ],
                    prerequisites: ['applications_derivatives']
                },
                {
                    id: 'implicit_differentiation',
                    title: 'Implicit Differentiation',
                    shortName: 'dy/dx',
                    description: 'Differentiating implicitly defined functions',
                    estimatedHours: 6,
                    objectives: [
                        'Differentiate implicit equations',
                        'Find slopes of implicit curves',
                        'Apply to related rates'
                    ],
                    prerequisites: ['differentiation_rules']
                }
            ]
        },

        // Applied Mathematics Category
        {
            id: 'mathematical_modeling',
            category: 'applied_mathematics',
            title: 'Mathematical Modeling',
            icon: '🌐',
            description: 'Using mathematics to solve real-world problems',
            minLevel: 6,
            maxLevel: 9,
            difficulty: 4,
            estimatedHours: 42,
            prerequisites: ['differential_calculus', 'statistics_basics'],
            concepts: [
                {
                    id: 'modeling_principles',
                    title: 'Modeling Principles',
                    shortName: '🔄',
                    description: 'The mathematical modeling process',
                    estimatedHours: 6,
                    objectives: [
                        'Understand modeling cycle',
                        'Identify key variables',
                        'Make simplifying assumptions'
                    ],
                    prerequisites: []
                },
                {
                    id: 'linear_models',
                    title: 'Linear Models',
                    shortName: 'y=mx+b',
                    description: 'Linear relationships in real situations',
                    estimatedHours: 8,
                    objectives: [
                        'Create linear models from data',
                        'Interpret slope and intercept',
                        'Make predictions using models'
                    ],
                    prerequisites: ['modeling_principles', 'linear_functions']
                },
                {
                    id: 'exponential_models',
                    title: 'Exponential Models',
                    shortName: 'y=ae^(bx)',
                    description: 'Growth and decay phenomena',
                    estimatedHours: 8,
                    objectives: [
                        'Model exponential growth and decay',
                        'Work with half-life and doubling time',
                        'Apply to population and finance'
                    ],
                    prerequisites: ['exponential_logarithmic']
                },
                {
                    id: 'optimization_models',
                    title: 'Optimization Models',
                    shortName: 'max/min',
                    description: 'Finding optimal solutions',
                    estimatedHours: 10,
                    objectives: [
                        'Set up optimization problems',
                        'Use calculus to find optima',
                        'Interpret solutions in context'
                    ],
                    prerequisites: ['applications_derivatives']
                },
                {
                    id: 'differential_equation_models',
                    title: 'Differential Equation Models',
                    shortName: 'dy/dx=f(x,y)',
                    description: 'Modeling change with differential equations',
                    estimatedHours: 10,
                    objectives: [
                        'Set up differential equation models',
                        'Solve separable equations',
                        'Model population and cooling'
                    ],
                    prerequisites: ['implicit_differentiation']
                }
            ]
        },

        // Statistics & Probability Category
        {
            id: 'statistics_fundamentals',
            category: 'statistics_probability',
            title: 'Statistics Fundamentals',
            icon: '📊',
            description: 'Descriptive statistics and data analysis',
            minLevel: 4,
            maxLevel: 7,
            difficulty: 3,
            estimatedHours: 38,
            prerequisites: ['basic_algebra'],
            concepts: [
                {
                    id: 'data_types',
                    title: 'Data Types & Collection',
                    shortName: '📋',
                    description: 'Understanding different types of data',
                    estimatedHours: 4,
                    objectives: [
                        'Distinguish data types',
                        'Understand sampling methods',
                        'Identify bias sources'
                    ],
                    prerequisites: []
                },
                {
                    id: 'descriptive_statistics',
                    title: 'Descriptive Statistics',
                    shortName: 'x̄, σ',
                    description: 'Measures of center and spread',
                    estimatedHours: 10,
                    objectives: [
                        'Calculate mean, median, mode',
                        'Find variance and standard deviation',
                        'Interpret measures of spread'
                    ],
                    prerequisites: ['data_types']
                },
                {
                    id: 'data_visualization',
                    title: 'Data Visualization',
                    shortName: '📈',
                    description: 'Graphs and charts for data presentation',
                    estimatedHours: 8,
                    objectives: [
                        'Create appropriate graphs',
                        'Interpret data displays',
                        'Identify misleading graphics'
                    ],
                    prerequisites: ['descriptive_statistics']
                },
                {
                    id: 'correlation_regression',
                    title: 'Correlation & Regression',
                    shortName: 'r, ŷ',
                    description: 'Relationships between variables',
                    estimatedHours: 10,
                    objectives: [
                        'Calculate correlation coefficient',
                        'Find regression lines',
                        'Make predictions from models'
                    ],
                    prerequisites: ['data_visualization', 'linear_functions']
                },
                {
                    id: 'normal_distribution',
                    title: 'Normal Distribution',
                    shortName: '🔔',
                    description: 'The bell curve and its applications',
                    estimatedHours: 8,
                    objectives: [
                        'Understand normal distribution properties',
                        'Use empirical rule and z-scores',
                        'Apply to real-world data'
                    ],
                    prerequisites: ['descriptive_statistics']
                }
            ]
        },

        // Discrete & Computational Category
        {
            id: 'discrete_mathematics',
            category: 'discrete_computational',
            title: 'Discrete Mathematics',
            icon: '🔗',
            description: 'Mathematics for computer science and logic',
            minLevel: 5,
            maxLevel: 8,
            difficulty: 4,
            estimatedHours: 48,
            prerequisites: ['basic_algebra', 'sets_logic'],
            concepts: [
                {
                    id: 'sets_logic',
                    title: 'Sets & Logic',
                    shortName: '∈, ∧, ∨',
                    description: 'Foundation of mathematical reasoning',
                    estimatedHours: 8,
                    objectives: [
                        'Work with set operations',
                        'Understand logical operators',
                        'Construct truth tables'
                    ],
                    prerequisites: []
                },
                {
                    id: 'combinatorics',
                    title: 'Combinatorics',
                    shortName: 'C(n,r)',
                    description: 'Counting methods and arrangements',
                    estimatedHours: 10,
                    objectives: [
                        'Use multiplication principle',
                        'Calculate permutations and combinations',
                        'Apply pigeonhole principle'
                    ],
                    prerequisites: ['sets_logic']
                },
                {
                    id: 'graph_theory',
                    title: 'Graph Theory',
                    shortName: 'G=(V,E)',
                    description: 'Networks and connections',
                    estimatedHours: 12,
                    objectives: [
                        'Understand graph terminology',
                        'Find shortest paths',
                        'Identify special graph types'
                    ],
                    prerequisites: ['sets_logic']
                },
                {
                    id: 'algorithms',
                    title: 'Algorithms',
                    shortName: '→',
                    description: 'Step-by-step problem solving',
                    estimatedHours: 10,
                    objectives: [
                        'Analyze algorithm efficiency',
                        'Understand Big O notation',
                        'Compare sorting algorithms'
                    ],
                    prerequisites: ['graph_theory']
                },
                {
                    id: 'recursion',
                    title: 'Recursion',
                    shortName: 'f(n)=f(n-1)',
                    description: 'Self-referential definitions and solutions',
                    estimatedHours: 8,
                    objectives: [
                        'Write recursive definitions',
                        'Solve recurrence relations',
                        'Understand recursive algorithms'
                    ],
                    prerequisites: ['algorithms']
                }
            ]
        },

        // Advanced Topics Category
        {
            id: 'abstract_algebra',
            category: 'advanced_topics',
            title: 'Abstract Algebra',
            icon: '🎭',
            description: 'Groups, rings, and fields',
            minLevel: 8,
            maxLevel: 10,
            difficulty: 5,
            estimatedHours: 72,
            prerequisites: ['linear_algebra', 'number_theory'],
            concepts: [
                {
                    id: 'group_theory',
                    title: 'Group Theory',
                    shortName: '(G,∘)',
                    description: 'Algebraic structures with one operation',
                    estimatedHours: 18,
                    objectives: [
                        'Understand group axioms',
                        'Identify group examples',
                        'Work with subgroups and cosets'
                    ],
                    prerequisites: ['sets_logic']
                },
                {
                    id: 'ring_theory',
                    title: 'Ring Theory',
                    shortName: '(R,+,×)',
                    description: 'Algebraic structures with two operations',
                    estimatedHours: 16,
                    objectives: [
                        'Understand ring properties',
                        'Work with ideals',
                        'Study polynomial rings'
                    ],
                    prerequisites: ['group_theory']
                },
                {
                    id: 'field_theory',
                    title: 'Field Theory',
                    shortName: '(F,+,×)',
                    description: 'Fields and field extensions',
                    estimatedHours: 14,
                    objectives: [
                        'Understand field properties',
                        'Study finite fields',
                        'Explore field extensions'
                    ],
                    prerequisites: ['ring_theory']
                },
                {
                    id: 'galois_theory',
                    title: 'Galois Theory',
                    shortName: 'Gal(F/K)',
                    description: 'Connection between field theory and group theory',
                    estimatedHours: 16,
                    objectives: [
                        'Understand Galois groups',
                        'Apply fundamental theorem',
                        'Solve classical problems'
                    ],
                    prerequisites: ['field_theory']
                },
                {
                    id: 'representation_theory',
                    title: 'Representation Theory',
                    shortName: 'ρ: G→GL(V)',
                    description: 'Linear actions of groups',
                    estimatedHours: 12,
                    objectives: [
                        'Understand group representations',
                        'Work with characters',
                        'Apply to physics and chemistry'
                    ],
                    prerequisites: ['group_theory', 'linear_algebra']
                }
            ]
        },

        // Exam Preparation Category
        {
            id: 'sat_math_prep',
            category: 'exam_preparation',
            title: 'SAT Math Preparation',
            icon: '📝',
            description: 'Comprehensive preparation for SAT Math sections',
            minLevel: 4,
            maxLevel: 6,
            difficulty: 3,
            estimatedHours: 28,
            prerequisites: ['linear_functions', 'quadratic_equations'],
            concepts: [
                {
                    id: 'sat_algebra',
                    title: 'SAT Algebra',
                    shortName: 'x=?',
                    description: 'Linear equations and systems for SAT',
                    estimatedHours: 8,
                    objectives: [
                        'Solve linear equations efficiently',
                        'Work with systems graphically',
                        'Master word problems'
                    ],
                    prerequisites: ['linear_functions']
                },
                {
                    id: 'sat_geometry',
                    title: 'SAT Geometry',
                    shortName: '△□○',
                    description: 'Geometric concepts and calculations',
                    estimatedHours: 8,
                    objectives: [
                        'Apply area and volume formulas',
                        'Use coordinate geometry',
                        'Solve similarity problems'
                    ],
                    prerequisites: ['geometric_measurement', 'coordinate_plane']
                },
                {
                    id: 'sat_data_analysis',
                    title: 'SAT Data Analysis',
                    shortName: '📊',
                    description: 'Statistics and data interpretation',
                    estimatedHours: 6,
                    objectives: [
                        'Interpret graphs and tables',
                        'Calculate statistics',
                        'Understand experimental design'
                    ],
                    prerequisites: ['descriptive_statistics']
                },
                {
                    id: 'sat_advanced_math',
                    title: 'SAT Advanced Math',
                    shortName: 'f(x)',
                    description: 'Functions and advanced topics',
                    estimatedHours: 6,
                    objectives: [
                        'Work with quadratic functions',
                        'Understand exponential growth',
                        'Manipulate rational expressions'
                    ],
                    prerequisites: ['quadratic_functions', 'exponential_logarithmic']
                }
            ]
        }
    ];
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getLearningPathCategories, getAllLearningPaths };
} else {
    window.getLearningPathCategories = getLearningPathCategories;
    window.getAllLearningPaths = getAllLearningPaths;
}