// Historical Timeline Data - Mathematical Discoveries Across 5,000 Years
// Phase 11 Implementation for MathVerse

function getHistoricalData() {
    return [
        // Ancient Mesopotamian & Egyptian (3000-500 BCE)
        {
            id: 'cuneiform_numbers',
            title: 'Cuneiform Number System',
            mathematician: 'Sumerian Scholars',
            year: -3000,
            civilization: 'mesopotamian',
            field: 'arithmetic',
            description: 'First written number system using base-60 (sexagesimal), still used today for time and angles.',
            impact: 'Foundation of all mathematical notation and calculation systems.',
            concepts: ['Number Systems', 'Base 60', 'Place Value'],
            modern_applications: 'Time measurement (60 seconds, 60 minutes), angle measurement (360 degrees)',
            influences: ['pythagorean_theorem', 'babylonian_algebra']
        },
        {
            id: 'egyptian_fractions',
            title: 'Egyptian Fraction System',
            mathematician: 'Egyptian Scribes',
            year: -2000,
            civilization: 'egyptian',
            field: 'arithmetic',
            description: 'Unit fractions (1/n) and the eye of Horus fractional system for practical calculations.',
            impact: 'First systematic approach to fractional quantities and division.',
            concepts: ['Fractions', 'Unit Fractions', 'Division'],
            modern_applications: 'Foundation for all fractional arithmetic and decimal systems'
        },
        {
            id: 'babylonian_algebra',
            title: 'Babylonian Quadratic Solutions',
            mathematician: 'Babylonian Mathematicians',
            year: -1800,
            civilization: 'mesopotamian',
            field: 'algebra',
            description: 'Systematic methods for solving quadratic equations using geometric approaches.',
            impact: 'First algebraic problem-solving techniques, predating formal algebra by millennia.',
            concepts: ['Quadratic Equations', 'Geometric Algebra', 'Problem Solving'],
            modern_applications: 'Engineering calculations, physics, computer graphics',
            influences: ['quadratic_formula', 'geometric_algebra']
        },
        {
            id: 'pythagorean_theorem',
            title: 'Pythagorean Theorem',
            mathematician: 'Pythagoras & Followers',
            year: -550,
            civilization: 'greek',
            field: 'geometry',
            description: 'In right triangles, the square of the hypotenuse equals the sum of squares of the other sides.',
            impact: 'Fundamental relationship in Euclidean geometry, basis for distance measurement.',
            concepts: ['Right Triangles', 'Squares', 'Geometric Relationships'],
            modern_applications: 'GPS navigation, computer graphics, architecture, physics',
            influences: ['euclidean_geometry', 'trigonometry', 'distance_formula']
        },
        {
            id: 'euclidean_geometry',
            title: 'Elements of Geometry',
            mathematician: 'Euclid',
            year: -300,
            civilization: 'greek',
            field: 'geometry',
            description: 'Systematic axiomatization of geometry, establishing logical proof methods.',
            impact: 'Model for mathematical rigor and logical reasoning for over 2000 years.',
            concepts: ['Axioms', 'Proofs', 'Geometric Constructions'],
            modern_applications: 'Mathematical foundations, computer science, engineering design',
            influences: ['non_euclidean_geometry', 'topology', 'formal_logic']
        },
        {
            id: 'archimedes_calculus',
            title: 'Method of Exhaustion',
            mathematician: 'Archimedes',
            year: -250,
            civilization: 'greek',
            field: 'calculus',
            description: 'Early integration techniques using infinite series to calculate areas and volumes.',
            impact: 'Precursor to integral calculus, demonstrated power of infinite processes.',
            concepts: ['Infinite Series', 'Integration', 'Limits'],
            modern_applications: 'Foundation for calculus, physics, engineering analysis',
            influences: ['integral_calculus', 'infinite_series', 'limits']
        },

        // Ancient Indian & Chinese (500 BCE - 1000 CE)
        {
            id: 'indian_zero',
            title: 'Concept of Zero',
            mathematician: 'Brahmagupta',
            year: 628,
            civilization: 'indian',
            field: 'arithmetic',
            description: 'First clear definition of zero as a number with arithmetic rules.',
            impact: 'Revolutionary concept enabling place-value systems and advanced mathematics.',
            concepts: ['Zero', 'Place Value', 'Arithmetic Operations'],
            modern_applications: 'All modern mathematics, computer science, digital technology',
            influences: ['decimal_system', 'algebra', 'calculus']
        },
        {
            id: 'aryabhata_trigonometry',
            title: 'Trigonometric Functions',
            mathematician: 'Aryabhata',
            year: 499,
            civilization: 'indian',
            field: 'geometry',
            description: 'Systematic study of sine functions and trigonometric calculations.',
            impact: 'Essential for astronomy, navigation, and understanding periodic phenomena.',
            concepts: ['Sine Function', 'Trigonometry', 'Astronomy'],
            modern_applications: 'Engineering, physics, signal processing, computer graphics',
            influences: ['modern_trigonometry', 'fourier_analysis', 'wave_theory']
        },
        {
            id: 'chinese_remainder',
            title: 'Chinese Remainder Theorem',
            mathematician: 'Sun Tzu',
            year: 100,
            civilization: 'chinese',
            field: 'number_theory',
            description: 'System for solving simultaneous congruences with different moduli.',
            impact: 'Fundamental result in number theory with applications in cryptography.',
            concepts: ['Modular Arithmetic', 'Congruences', 'System Solving'],
            modern_applications: 'Computer science, cryptography, error correction codes',
            influences: ['modern_cryptography', 'computer_algorithms']
        },
        {
            id: 'fibonacci_sequence',
            title: 'Liber Abaci & Fibonacci Numbers',
            mathematician: 'Leonardo Fibonacci',
            year: 1202,
            civilization: 'european',
            field: 'number_theory',
            description: 'Introduction of Hindu-Arabic numerals to Europe and discovery of Fibonacci sequence.',
            impact: 'Spread decimal system to Europe, revealed mathematical patterns in nature.',
            concepts: ['Fibonacci Numbers', 'Golden Ratio', 'Recursive Sequences'],
            modern_applications: 'Nature patterns, computer algorithms, financial modeling',
            influences: ['golden_ratio', 'mathematical_sequences', 'nature_mathematics']
        },

        // Islamic Golden Age (800-1200 CE)
        {
            id: 'al_khwarizmi_algebra',
            title: 'Al-Jabr (Algebra)',
            mathematician: 'Al-Khwarizmi',
            year: 820,
            civilization: 'islamic',
            field: 'algebra',
            description: 'Systematic treatment of linear and quadratic equations, founding algebra as a discipline.',
            impact: 'Created algebra as a mathematical field, influenced all subsequent mathematics.',
            concepts: ['Algebraic Equations', 'Unknown Variables', 'Systematic Methods'],
            modern_applications: 'All of mathematics, science, engineering, computer science',
            influences: ['modern_algebra', 'equation_solving', 'symbolic_mathematics']
        },
        {
            id: 'al_biruni_trigonometry',
            title: 'Advanced Trigonometry',
            mathematician: 'Al-Biruni',
            year: 1000,
            civilization: 'islamic',
            field: 'geometry',
            description: 'Refined trigonometric functions and applications to astronomy and geography.',
            impact: 'Enhanced precision in astronomical calculations and geographic measurements.',
            concepts: ['Trigonometric Tables', 'Spherical Trigonometry', 'Astronomy'],
            modern_applications: 'Navigation, astronomy, geodesy, engineering',
            influences: ['spherical_geometry', 'navigation_mathematics']
        },
        {
            id: 'omar_khayyam_algebra',
            title: 'Geometric Solution of Cubics',
            mathematician: 'Omar Khayyam',
            year: 1070,
            civilization: 'islamic',
            field: 'algebra',
            description: 'Geometric methods for solving cubic equations using conic sections.',
            impact: 'Advanced algebraic techniques beyond quadratics, precursor to higher algebra.',
            concepts: ['Cubic Equations', 'Conic Sections', 'Geometric Algebra'],
            modern_applications: 'Engineering, physics, computer graphics modeling',
            influences: ['polynomial_algebra', 'algebraic_geometry']
        },

        // European Renaissance (1400-1700)
        {
            id: 'cardano_formula',
            title: 'Solution of Cubic Equations',
            mathematician: 'Gerolamo Cardano',
            year: 1545,
            civilization: 'european',
            field: 'algebra',
            description: 'Algebraic formula for solving general cubic equations, introduced complex numbers.',
            impact: 'Breakthrough in algebra, led to development of complex number theory.',
            concepts: ['Cubic Formula', 'Complex Numbers', 'Algebraic Solutions'],
            modern_applications: 'Engineering, physics, computer science, signal processing',
            influences: ['complex_analysis', 'abstract_algebra', 'galois_theory']
        },
        {
            id: 'vieta_formulas',
            title: 'Vieta\'s Formulas',
            mathematician: 'François Viète',
            year: 1579,
            civilization: 'european',
            field: 'algebra',
            description: 'Relationship between coefficients and roots of polynomial equations.',
            impact: 'Connected algebra and geometry, advanced symbolic mathematics.',
            concepts: ['Polynomial Roots', 'Coefficients', 'Symbolic Algebra'],
            modern_applications: 'Computer algebra, numerical analysis, cryptography',
            influences: ['polynomial_theory', 'symbolic_computation']
        },
        {
            id: 'descartes_geometry',
            title: 'Analytic Geometry',
            mathematician: 'René Descartes',
            year: 1637,
            civilization: 'european',
            field: 'geometry',
            description: 'Coordinate system connecting algebra and geometry through equations.',
            impact: 'Unified algebra and geometry, enabled calculus development.',
            concepts: ['Coordinate System', 'Algebraic Curves', 'Analytic Methods'],
            modern_applications: 'Computer graphics, engineering design, physics, GPS',
            influences: ['calculus', 'vector_analysis', 'computer_graphics']
        },
        {
            id: 'fermat_number_theory',
            title: 'Fermat\'s Last Theorem',
            mathematician: 'Pierre de Fermat',
            year: 1637,
            civilization: 'european',
            field: 'number_theory',
            description: 'Famous conjecture about integer solutions to x^n + y^n = z^n for n > 2.',
            impact: 'Drove development of algebraic number theory and advanced proof techniques.',
            concepts: ['Diophantine Equations', 'Integer Solutions', 'Mathematical Proofs'],
            modern_applications: 'Cryptography, computer science, pure mathematics research',
            influences: ['algebraic_number_theory', 'elliptic_curves', 'modular_forms']
        },
        {
            id: 'newton_calculus',
            title: 'Calculus of Fluxions',
            mathematician: 'Isaac Newton',
            year: 1665,
            civilization: 'european',
            field: 'calculus',
            description: 'Method of fluxions (derivatives) and fluents (integrals) for analyzing motion.',
            impact: 'Revolutionized mathematics and physics, enabling scientific revolution.',
            concepts: ['Derivatives', 'Integrals', 'Infinite Series'],
            modern_applications: 'All of physics, engineering, economics, computer science',
            influences: ['differential_equations', 'mathematical_physics', 'optimization']
        },
        {
            id: 'leibniz_calculus',
            title: 'Differential Calculus',
            mathematician: 'Gottfried Leibniz',
            year: 1676,
            civilization: 'european',
            field: 'calculus',
            description: 'Modern notation for calculus and systematic development of differential methods.',
            impact: 'Standard calculus notation still used today, advanced analytical methods.',
            concepts: ['dx/dy Notation', 'Chain Rule', 'Integration by Parts'],
            modern_applications: 'Universal mathematical notation, all calculus applications',
            influences: ['mathematical_analysis', 'differential_geometry', 'mathematical_notation']
        },

        // Enlightenment Era (1700-1850)
        {
            id: 'euler_analysis',
            title: 'Euler\'s Identity',
            mathematician: 'Leonhard Euler',
            year: 1748,
            civilization: 'european',
            field: 'analysis',
            description: 'e^(iπ) + 1 = 0, connecting five fundamental mathematical constants.',
            impact: 'Unified different areas of mathematics, demonstrated deep mathematical connections.',
            concepts: ['Complex Exponentials', 'Mathematical Constants', 'Complex Analysis'],
            modern_applications: 'Signal processing, quantum mechanics, electrical engineering',
            influences: ['complex_analysis', 'fourier_analysis', 'mathematical_physics']
        },
        {
            id: 'gauss_number_theory',
            title: 'Disquisitiones Arithmeticae',
            mathematician: 'Carl Friedrich Gauss',
            year: 1801,
            civilization: 'european',
            field: 'number_theory',
            description: 'Systematic treatment of number theory including quadratic reciprocity.',
            impact: 'Established number theory as rigorous mathematical discipline.',
            concepts: ['Quadratic Reciprocity', 'Modular Arithmetic', 'Prime Numbers'],
            modern_applications: 'Cryptography, computer science, digital security',
            influences: ['algebraic_number_theory', 'cryptography', 'computational_mathematics']
        },
        {
            id: 'fourier_analysis',
            title: 'Fourier Series',
            mathematician: 'Joseph Fourier',
            year: 1807,
            civilization: 'european',
            field: 'analysis',
            description: 'Decomposition of functions into trigonometric series for solving heat equation.',
            impact: 'Revolutionized analysis of periodic phenomena and partial differential equations.',
            concepts: ['Trigonometric Series', 'Frequency Analysis', 'Heat Equation'],
            modern_applications: 'Signal processing, image compression, quantum mechanics, MRI',
            influences: ['harmonic_analysis', 'signal_processing', 'quantum_mechanics']
        },
        {
            id: 'abel_galois_theory',
            title: 'Impossibility of Quintic Solution',
            mathematician: 'Niels Henrik Abel',
            year: 1824,
            civilization: 'european',
            field: 'algebra',
            description: 'Proof that general quintic equations cannot be solved by radicals.',
            impact: 'Led to group theory and abstract algebra, changed understanding of solvability.',
            concepts: ['Group Theory', 'Abstract Algebra', 'Polynomial Solvability'],
            modern_applications: 'Cryptography, computer science, quantum mechanics',
            influences: ['galois_theory', 'abstract_algebra', 'group_theory']
        },

        // Modern Era (1850-1950)
        {
            id: 'riemann_geometry',
            title: 'Riemann Surfaces & Non-Euclidean Geometry',
            mathematician: 'Bernhard Riemann',
            year: 1854,
            civilization: 'european',
            field: 'geometry',
            description: 'Generalized geometry to curved spaces, foundation for general relativity.',
            impact: 'Revolutionized understanding of space and geometry, enabled Einstein\'s relativity.',
            concepts: ['Curved Geometry', 'Riemann Surfaces', 'Differential Geometry'],
            modern_applications: 'General relativity, cosmology, computer graphics, robotics',
            influences: ['general_relativity', 'differential_geometry', 'topology']
        },
        {
            id: 'cantor_set_theory',
            title: 'Set Theory & Infinity',
            mathematician: 'Georg Cantor',
            year: 1874,
            civilization: 'european',
            field: 'logic',
            description: 'Systematic study of infinite sets and different sizes of infinity.',
            impact: 'Foundation of modern mathematics, revolutionized understanding of infinity.',
            concepts: ['Infinite Sets', 'Cardinality', 'Set Operations'],
            modern_applications: 'Computer science, database theory, mathematical foundations',
            influences: ['mathematical_logic', 'computer_science', 'topology']
        },
        {
            id: 'hilbert_program',
            title: 'Hilbert\'s Program',
            mathematician: 'David Hilbert',
            year: 1900,
            civilization: 'european',
            field: 'logic',
            description: '23 problems defining future of mathematics, formalization program.',
            impact: 'Shaped 20th century mathematics, led to computer science foundations.',
            concepts: ['Mathematical Foundations', 'Formal Systems', 'Completeness'],
            modern_applications: 'Computer science, artificial intelligence, formal verification',
            influences: ['computer_science', 'mathematical_logic', 'artificial_intelligence']
        },
        {
            id: 'einstein_relativity',
            title: 'General Relativity',
            mathematician: 'Albert Einstein',
            year: 1915,
            civilization: 'european',
            field: 'geometry',
            description: 'Geometric theory of gravity using Riemannian geometry and tensor calculus.',
            impact: 'Revolutionized physics and astronomy, demonstrated mathematics-physics unity.',
            concepts: ['Spacetime Geometry', 'Tensor Calculus', 'Gravitational Fields'],
            modern_applications: 'GPS systems, cosmology, gravitational wave detection',
            influences: ['cosmology', 'mathematical_physics', 'differential_geometry']
        },
        {
            id: 'godel_incompleteness',
            title: 'Gödel\'s Incompleteness Theorems',
            mathematician: 'Kurt Gödel',
            year: 1931,
            civilization: 'european',
            field: 'logic',
            description: 'Fundamental limitations of formal mathematical systems.',
            impact: 'Shattered Hilbert\'s program, influenced computer science and philosophy.',
            concepts: ['Formal Systems', 'Decidability', 'Mathematical Logic'],
            modern_applications: 'Computer science, artificial intelligence, philosophy of mathematics',
            influences: ['computer_science', 'artificial_intelligence', 'mathematical_philosophy']
        },

        // Contemporary Era (1950-present)
        {
            id: 'shannon_information',
            title: 'Information Theory',
            mathematician: 'Claude Shannon',
            year: 1948,
            civilization: 'contemporary',
            field: 'probability',
            description: 'Mathematical foundation for information transmission and storage.',
            impact: 'Enabled digital revolution, internet, and modern communication systems.',
            concepts: ['Information Entropy', 'Channel Capacity', 'Error Correction'],
            modern_applications: 'Internet, mobile communications, data compression, cryptography',
            influences: ['computer_science', 'data_science', 'machine_learning']
        },
        {
            id: 'computer_algorithms',
            title: 'Algorithm Analysis',
            mathematician: 'Donald Knuth',
            year: 1968,
            civilization: 'contemporary',
            field: 'logic',
            description: 'Systematic analysis of computational algorithms and complexity.',
            impact: 'Foundation of computer science, optimization of computational methods.',
            concepts: ['Algorithm Complexity', 'Big O Notation', 'Computational Efficiency'],
            modern_applications: 'All computer software, artificial intelligence, data processing',
            influences: ['computer_science', 'artificial_intelligence', 'optimization_theory']
        },
        {
            id: 'chaos_theory',
            title: 'Chaos Theory',
            mathematician: 'Edward Lorenz',
            year: 1963,
            civilization: 'contemporary',
            field: 'analysis',
            description: 'Mathematical study of complex dynamical systems and sensitive dependence.',
            impact: 'Revolutionized understanding of complex systems in science and nature.',
            concepts: ['Dynamical Systems', 'Butterfly Effect', 'Strange Attractors'],
            modern_applications: 'Weather prediction, economics, biology, engineering systems',
            influences: ['complex_systems', 'mathematical_modeling', 'nonlinear_dynamics']
        },
        {
            id: 'rsa_cryptography',
            title: 'RSA Public Key Cryptography',
            mathematician: 'Rivest, Shamir, Adleman',
            year: 1977,
            civilization: 'contemporary',
            field: 'number_theory',
            description: 'Public key cryptography based on factoring large composite numbers.',
            impact: 'Enabled secure internet communications and digital commerce.',
            concepts: ['Public Key Cryptography', 'Prime Factorization', 'Modular Exponentiation'],
            modern_applications: 'Internet security, digital banking, e-commerce, secure communications',
            influences: ['digital_security', 'electronic_commerce', 'privacy_technology']
        },
        {
            id: 'machine_learning',
            title: 'Neural Networks & Deep Learning',
            mathematician: 'Geoffrey Hinton & Others',
            year: 1986,
            civilization: 'contemporary',
            field: 'probability',
            description: 'Mathematical models inspired by biological neural networks for pattern recognition.',
            impact: 'Enabled artificial intelligence revolution and automated decision making.',
            concepts: ['Neural Networks', 'Backpropagation', 'Gradient Descent'],
            modern_applications: 'AI, image recognition, natural language processing, autonomous vehicles',
            influences: ['artificial_intelligence', 'pattern_recognition', 'automated_systems']
        },
        {
            id: 'quantum_computing',
            title: 'Quantum Algorithms',
            mathematician: 'Peter Shor',
            year: 1994,
            civilization: 'contemporary',
            field: 'logic',
            description: 'Quantum algorithm for factoring integers exponentially faster than classical methods.',
            impact: 'Demonstrated quantum computing potential, threatens current cryptography.',
            concepts: ['Quantum Algorithms', 'Quantum Superposition', 'Quantum Entanglement'],
            modern_applications: 'Quantum computing, future cryptography, optimization problems',
            influences: ['quantum_computing', 'post_quantum_cryptography', 'quantum_information']
        },
        {
            id: 'perelman_poincare',
            title: 'Proof of Poincaré Conjecture',
            mathematician: 'Grigori Perelman',
            year: 2003,
            civilization: 'contemporary',
            field: 'topology',
            description: 'Resolution of century-old conjecture about 3-dimensional manifolds using Ricci flow.',
            impact: 'Major breakthrough in topology, demonstrated power of geometric analysis.',
            concepts: ['Topology', 'Ricci Flow', 'Geometric Analysis'],
            modern_applications: 'Pure mathematics, geometric modeling, theoretical physics',
            influences: ['geometric_topology', 'differential_geometry', 'mathematical_analysis']
        },
        {
            id: 'ai_mathematics',
            title: 'AI-Assisted Mathematical Discovery',
            mathematician: 'Various AI Systems',
            year: 2021,
            civilization: 'contemporary',
            field: 'logic',
            description: 'AI systems discovering new mathematical theorems and assisting in complex proofs.',
            impact: 'Changing how mathematics is discovered and verified, augmenting human creativity.',
            concepts: ['Automated Theorem Proving', 'Machine Learning', 'Computer-Assisted Proofs'],
            modern_applications: 'Mathematical research, theorem verification, conjecture generation',
            influences: ['automated_mathematics', 'computational_discovery', 'ai_research']
        }
    ];
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getHistoricalData };
} else {
    window.getHistoricalData = getHistoricalData;
}