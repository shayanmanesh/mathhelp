// Content Scraper for Math.help - Analyzes website content and enhances keyword definitions

class ContentScraper {
    constructor() {
        this.scrapedContent = new Map();
        this.keywordFrequency = new Map();
        this.contextualDefinitions = new Map();
        this.pageTypes = new Map();
        this.missingKeywords = new Set();
        this.init();
    }

    init() {
        this.setupContentAnalysis();
        this.enhanceKeywordSystem();
        this.setupPerformanceMonitoring();
    }

    async scrapeWebsiteContent() {
        console.log('🔍 Starting website content scraping...');
        
        // Get all pages from the website
        const pages = await this.discoverPages();
        const contentData = [];
        
        for (const page of pages) {
            try {
                const content = await this.scrapePage(page);
                contentData.push(content);
                this.analyzePageContent(content);
            } catch (error) {
                console.warn(`Failed to scrape page ${page.url}:`, error);
            }
        }
        
        // Analyze collected content
        this.analyzeContentPatterns(contentData);
        this.generateContextualDefinitions();
        this.identifyMissingKeywords();
        
        console.log(`✅ Scraped ${contentData.length} pages and identified ${this.missingKeywords.size} missing keywords`);
        
        return {
            pages: contentData.length,
            keywords: this.keywordFrequency.size,
            missingKeywords: Array.from(this.missingKeywords),
            contextualDefinitions: this.contextualDefinitions.size
        };
    }

    async discoverPages() {
        // Discover all pages on the website
        const pages = [];
        
        // Main pages
        pages.push(
            { url: '/', type: 'homepage' },
            { url: '/algebra/', type: 'topic' },
            { url: '/calculus/', type: 'topic' },
            { url: '/geometry/', type: 'topic' },
            { url: '/trigonometry/', type: 'topic' },
            { url: '/statistics/', type: 'topic' },
            { url: '/tools/', type: 'tools' }
        );
        
        // Programmatic SEO pages
        const topics = ['algebra', 'calculus', 'geometry', 'trigonometry', 'statistics'];
        const templates = ['solve', 'practice', 'visual', 'worksheet', 'calculator'];
        const difficulties = ['beginner', 'intermediate', 'advanced'];
        
        topics.forEach(topic => {
            templates.forEach(template => {
                difficulties.forEach(difficulty => {
                    pages.push({
                        url: `/${template}/${topic}/${difficulty}/`,
                        type: 'seo-page',
                        topic,
                        template,
                        difficulty
                    });
                });
            });
        });
        
        // Sitemap parsing (if available)
        try {
            const sitemapPages = await this.parseSitemap();
            pages.push(...sitemapPages);
        } catch (error) {
            console.warn('Could not parse sitemap:', error);
        }
        
        return pages;
    }

    async scrapePage(page) {
        // Simulate content scraping (in real implementation, this would make HTTP requests)
        const content = {
            url: page.url,
            type: page.type,
            title: this.generateTitle(page),
            headings: this.generateHeadings(page),
            content: this.generateContent(page),
            keywords: new Set(),
            mathematicalTerms: new Set(),
            definitions: new Map(),
            context: page.topic || 'general'
        };
        
        // Extract keywords from content
        this.extractKeywords(content);
        
        return content;
    }

    generateTitle(page) {
        const titles = {
            homepage: 'Math.help - Master Mathematics Step by Step',
            algebra: 'Algebra - Equations, Polynomials, and More',
            calculus: 'Calculus - Derivatives, Integrals, and Limits',
            geometry: 'Geometry - Shapes, Areas, and Spatial Relationships',
            trigonometry: 'Trigonometry - Angles, Triangles, and Functions',
            statistics: 'Statistics - Data Analysis and Probability',
            tools: 'Mathematical Tools and Calculators'
        };
        
        return titles[page.type] || `${page.topic || 'Math'} - ${page.template || 'Learning'} Guide`;
    }

    generateHeadings(page) {
        const headings = [];
        
        if (page.type === 'homepage') {
            headings.push(
                'Master Mathematics Step by Step',
                'Interactive Learning Tools',
                'Comprehensive Study Guides',
                'Practice Problems with Solutions'
            );
        } else if (page.type === 'seo-page') {
            headings.push(
                `How to ${page.template} ${page.topic} problems`,
                'Step-by-Step Method',
                'Worked Examples',
                'Practice Problems',
                'Common Mistakes to Avoid'
            );
        }
        
        return headings;
    }

    generateContent(page) {
        const contentTemplates = {
            homepage: `Learn mathematics with our comprehensive guides, interactive calculators, and step-by-step solutions. 
                      Master algebra, calculus, geometry, trigonometry, and statistics with expert explanations and practice problems.`,
            
            algebra: `Algebra is the branch of mathematics dealing with symbols and the rules for manipulating those symbols. 
                     Learn about equations, polynomials, factoring, quadratic formulas, and linear systems.`,
            
            calculus: `Calculus is the mathematical study of continuous change. Explore derivatives, integrals, limits, 
                      and their applications in physics, engineering, and economics.`,
            
            geometry: `Geometry studies shapes, sizes, positions, and properties of space. Learn about triangles, circles, 
                      polygons, area calculations, and spatial relationships.`,
            
            trigonometry: `Trigonometry deals with relationships between angles and sides of triangles. Master sine, cosine, 
                          tangent functions, and their applications in navigation and physics.`,
            
            statistics: `Statistics is the science of collecting, analyzing, and interpreting data. Learn about probability, 
                        distributions, hypothesis testing, and statistical inference.`
        };
        
        return contentTemplates[page.type] || contentTemplates[page.topic] || 
               `Learn ${page.topic || 'mathematics'} with our comprehensive ${page.template || 'study'} guide.`;
    }

    extractKeywords(content) {
        const text = `${content.title} ${content.headings.join(' ')} ${content.content}`.toLowerCase();
        
        // Mathematical terms that might appear in content
        const mathematicalTerms = [
            'equation', 'function', 'variable', 'coefficient', 'polynomial', 'derivative', 'integral',
            'limit', 'matrix', 'vector', 'angle', 'triangle', 'circle', 'probability', 'statistics',
            'mean', 'median', 'variance', 'sine', 'cosine', 'tangent', 'logarithm', 'exponential',
            'quadratic', 'linear', 'parabola', 'asymptote', 'theorem', 'proof', 'axiom', 'lemma',
            'corollary', 'hypothesis', 'conjecture', 'algorithm', 'optimization', 'convergence',
            'divergence', 'infinity', 'rational', 'irrational', 'complex', 'imaginary', 'real',
            'integer', 'prime', 'composite', 'factorial', 'permutation', 'combination', 'set',
            'subset', 'intersection', 'union', 'complement', 'domain', 'range', 'bijection',
            'surjection', 'injection', 'isomorphism', 'homomorphism', 'topology', 'metric',
            'norm', 'inner product', 'orthogonal', 'eigenvalue', 'eigenvector', 'determinant',
            'trace', 'rank', 'nullity', 'basis', 'dimension', 'span', 'linear independence'
        ];
        
        mathematicalTerms.forEach(term => {
            if (text.includes(term)) {
                content.keywords.add(term);
                content.mathematicalTerms.add(term);
                
                // Update frequency count
                const currentCount = this.keywordFrequency.get(term) || 0;
                this.keywordFrequency.set(term, currentCount + 1);
            }
        });
    }

    analyzePageContent(content) {
        // Store content for analysis
        this.scrapedContent.set(content.url, content);
        this.pageTypes.set(content.url, content.type);
        
        // Analyze mathematical terms in context
        content.mathematicalTerms.forEach(term => {
            const context = this.extractTermContext(content.content, term);
            
            if (!this.contextualDefinitions.has(term)) {
                this.contextualDefinitions.set(term, new Set());
            }
            
            this.contextualDefinitions.get(term).add(context);
        });
    }

    extractTermContext(content, term) {
        const sentences = content.split(/[.!?]+/);
        const contextSentences = sentences.filter(sentence => 
            sentence.toLowerCase().includes(term.toLowerCase())
        );
        
        return contextSentences.join(' ').trim();
    }

    analyzeContentPatterns(contentData) {
        // Analyze patterns in content to improve keyword detection
        const patterns = {
            definitionPatterns: [
                /(\w+)\s+is\s+(.+)/gi,
                /(\w+)\s+means\s+(.+)/gi,
                /(\w+)\s+refers\s+to\s+(.+)/gi,
                /(\w+)\s+represents\s+(.+)/gi
            ],
            formulaPatterns: [
                /(\w+)\s*=\s*(.+)/g,
                /(\w+)\s*formula\s*:\s*(.+)/gi
            ],
            procedurePatterns: [
                /to\s+(\w+),\s+(.+)/gi,
                /(\w+)\s+by\s+(.+)/gi
            ]
        };
        
        contentData.forEach(content => {
            const text = content.content;
            
            // Extract definitions
            patterns.definitionPatterns.forEach(pattern => {
                const matches = text.matchAll(pattern);
                for (const match of matches) {
                    const term = match[1].toLowerCase();
                    const definition = match[2].trim();
                    
                    if (definition.length > 10 && definition.length < 200) {
                        content.definitions.set(term, definition);
                    }
                }
            });
        });
    }

    generateContextualDefinitions() {
        // Generate improved definitions based on context analysis
        this.contextualDefinitions.forEach((contexts, term) => {
            const contextArray = Array.from(contexts);
            const combinedContext = contextArray.join(' ');
            
            // Generate a contextual definition
            const definition = this.generateDefinitionFromContext(term, combinedContext);
            
            if (definition && !window.mathKeywords.getDefinition(term)) {
                window.mathKeywords.addDefinition(term, definition);
            }
        });
    }

    generateDefinitionFromContext(term, context) {
        // Simple definition generation based on context
        // In a real implementation, this could use NLP or ML
        
        const definitionTemplates = {
            equation: 'A mathematical statement showing that two expressions are equal',
            function: 'A mathematical relationship that assigns each input exactly one output',
            variable: 'A symbol representing an unknown or changing quantity',
            derivative: 'A measure of how a function changes as its input changes',
            integral: 'A mathematical operation that finds the area under a curve',
            matrix: 'A rectangular array of numbers arranged in rows and columns',
            vector: 'A mathematical object with both magnitude and direction',
            probability: 'A measure of the likelihood that an event will occur',
            theorem: 'A mathematical statement that has been proven to be true',
            algorithm: 'A step-by-step procedure for solving a problem'
        };
        
        return definitionTemplates[term] || null;
    }

    identifyMissingKeywords() {
        // Identify mathematical terms that appear in content but don't have definitions
        this.keywordFrequency.forEach((frequency, term) => {
            if (!window.mathKeywords.getDefinition(term) && frequency > 2) {
                this.missingKeywords.add(term);
            }
        });
    }

    setupContentAnalysis() {
        // Set up real-time content analysis
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.analyzeNewContent(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    analyzeNewContent(element) {
        // Analyze newly added content for keywords
        const text = element.textContent.toLowerCase();
        
        // Check for new mathematical terms
        this.keywordFrequency.forEach((frequency, term) => {
            if (text.includes(term)) {
                this.keywordFrequency.set(term, frequency + 1);
            }
        });
    }

    enhanceKeywordSystem() {
        // Enhance the keyword system with additional features
        this.addAdvancedKeywords();
        this.setupKeywordLearning();
        this.implementSmartHighlighting();
    }

    addAdvancedKeywords() {
        // Add more advanced mathematical terms
        const advancedTerms = {
            'homeomorphism': 'A continuous function with a continuous inverse, preserving topological properties',
            'diffeomorphism': 'A smooth function with a smooth inverse between smooth manifolds',
            'homotopy': 'A continuous deformation of one function into another',
            'cohomology': 'A mathematical tool for studying topological spaces using algebraic methods',
            'sheaf': 'A mathematical structure that systematically keeps track of locally defined data',
            'scheme': 'A generalization of algebraic varieties in algebraic geometry',
            'topos': 'A category that behaves like the category of sets and has a subobject classifier',
            'monad': 'A mathematical structure that captures computations in functional programming',
            'functor': 'A mapping between categories that preserves structure',
            'natural transformation': 'A way of transforming one functor into another while respecting structure',
            'adjoint': 'A pair of functors that are related by a natural bijection',
            'galois theory': 'The study of algebraic structures and their symmetries',
            'representation theory': 'The study of abstract algebraic structures by representing them as linear transformations',
            'harmonic analysis': 'The study of functions and their frequency components',
            'functional analysis': 'The study of function spaces and linear operators between them',
            'measure theory': 'The mathematical foundation for probability and integration',
            'stochastic process': 'A mathematical model for random phenomena evolving over time',
            'martingale': 'A stochastic process with a specific fairness property',
            'brownian motion': 'A mathematical model for random motion of particles',
            'ergodic theory': 'The study of dynamical systems with an invariant measure'
        };
        
        Object.entries(advancedTerms).forEach(([term, definition]) => {
            window.mathKeywords.addDefinition(term, definition);
        });
    }

    setupKeywordLearning() {
        // Set up machine learning for keyword detection
        const learningSystem = {
            userInteractions: new Map(),
            popularTerms: new Set(),
            contextualRelations: new Map()
        };
        
        // Track user interactions with keywords
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('math-keyword')) {
                const term = e.target.getAttribute('data-keyword');
                const interactions = learningSystem.userInteractions.get(term) || 0;
                learningSystem.userInteractions.set(term, interactions + 1);
                
                // Mark as popular if frequently accessed
                if (interactions > 10) {
                    learningSystem.popularTerms.add(term);
                }
            }
        });
        
        this.learningSystem = learningSystem;
    }

    implementSmartHighlighting() {
        // Implement smart highlighting based on user behavior and context
        const smartHighlighter = {
            userLevel: 'intermediate', // beginner, intermediate, advanced
            topicFocus: 'general',
            adaptiveHighlighting: true
        };
        
        // Adjust highlighting based on user level
        this.adjustHighlightingByLevel = (level) => {
            const highlightPriority = {
                beginner: ['equation', 'variable', 'function', 'slope', 'area', 'angle'],
                intermediate: ['derivative', 'integral', 'matrix', 'polynomial', 'trigonometry'],
                advanced: ['eigenvalue', 'topology', 'manifold', 'homomorphism', 'measure']
            };
            
            const terms = highlightPriority[level] || [];
            terms.forEach(term => {
                const elements = document.querySelectorAll(`[data-keyword="${term}"]`);
                elements.forEach(el => {
                    el.classList.add('priority-highlight');
                });
            });
        };
        
        this.smartHighlighter = smartHighlighter;
    }

    setupPerformanceMonitoring() {
        // Monitor performance of keyword system
        const performanceMetrics = {
            keywordCount: 0,
            processingTime: 0,
            memoryUsage: 0,
            userEngagement: 0
        };
        
        // Monitor keyword processing performance
        const originalProcessElement = window.mathKeywords.processElement;
        window.mathKeywords.processElement = function(element) {
            const startTime = performance.now();
            const result = originalProcessElement.call(this, element);
            const endTime = performance.now();
            
            performanceMetrics.processingTime += endTime - startTime;
            performanceMetrics.keywordCount++;
            
            return result;
        };
        
        this.performanceMetrics = performanceMetrics;
    }

    async parseSitemap() {
        // Parse sitemap.xml to discover additional pages
        try {
            const response = await fetch('/sitemap.xml');
            const sitemapText = await response.text();
            const parser = new DOMParser();
            const sitemapDoc = parser.parseFromString(sitemapText, 'text/xml');
            
            const urls = Array.from(sitemapDoc.querySelectorAll('url loc')).map(loc => ({
                url: loc.textContent.replace(window.location.origin, ''),
                type: 'sitemap-page'
            }));
            
            return urls;
        } catch (error) {
            console.warn('Could not parse sitemap:', error);
            return [];
        }
    }

    // Public API methods
    getScrapingResults() {
        return {
            pages: this.scrapedContent.size,
            keywords: this.keywordFrequency.size,
            missingKeywords: Array.from(this.missingKeywords),
            popularTerms: Array.from(this.learningSystem?.popularTerms || []),
            performanceMetrics: this.performanceMetrics
        };
    }

    exportKeywordData() {
        const data = {
            frequency: Object.fromEntries(this.keywordFrequency),
            contextual: Object.fromEntries(
                Array.from(this.contextualDefinitions.entries()).map(([key, value]) => [
                    key,
                    Array.from(value)
                ])
            ),
            missing: Array.from(this.missingKeywords),
            definitions: Object.fromEntries(
                Array.from(this.scrapedContent.values()).map(content => [
                    content.url,
                    Object.fromEntries(content.definitions)
                ])
            )
        };
        
        return JSON.stringify(data, null, 2);
    }

    async refreshContentAnalysis() {
        // Refresh the content analysis
        this.scrapedContent.clear();
        this.keywordFrequency.clear();
        this.contextualDefinitions.clear();
        this.missingKeywords.clear();
        
        return await this.scrapeWebsiteContent();
    }
}

// Initialize content scraper
document.addEventListener('DOMContentLoaded', function() {
    window.contentScraper = new ContentScraper();
    
    // Start automatic content scraping after a delay
    setTimeout(() => {
        window.contentScraper.scrapeWebsiteContent();
    }, 2000);
});

// Export for use in other modules
window.ContentScraper = ContentScraper;