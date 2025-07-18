// Semantic Search Engine with AI-Powered Understanding
// Phase 11 Implementation for MathVerse

class SemanticSearchEngine {
    constructor() {
        this.conceptsDatabase = getCoreConceptsDatabase();
        this.conceptSystem = new ConceptExplanationSystem();
        this.synonymDatabase = this.initializeSynonymDatabase();
        this.semanticRelations = this.initializeSemanticRelations();
        this.searchHistory = [];
        this.userContext = this.loadUserContext();
    }

    // Initialize synonym and related terms database
    initializeSynonymDatabase() {
        return {
            // Mathematical synonyms and alternative terms
            'derivative': ['differentiation', 'rate of change', 'slope', 'tangent', 'gradient'],
            'integral': ['integration', 'antiderivative', 'area under curve', 'accumulation'],
            'limit': ['approach', 'tends to', 'converges', 'asymptote'],
            'function': ['mapping', 'relation', 'transformation', 'operation'],
            'equation': ['formula', 'expression', 'identity', 'relation'],
            'variable': ['unknown', 'parameter', 'symbol', 'placeholder'],
            'triangle': ['three-sided', 'triangular', 'trigon'],
            'circle': ['round', 'circular', 'circumference', 'radius'],
            'square': ['quadrilateral', 'four-sided', 'rectangular'],
            'probability': ['chance', 'likelihood', 'odds', 'possibility'],
            'statistics': ['data analysis', 'statistical', 'data science', 'metrics'],
            'algebra': ['algebraic', 'symbolic math', 'variables and equations'],
            'geometry': ['geometric', 'spatial', 'shapes and space'],
            'calculus': ['differential', 'integral', 'infinitesimal'],
            'number': ['numeral', 'digit', 'quantity', 'amount', 'value'],
            'addition': ['plus', 'sum', 'adding', 'combine'],
            'subtraction': ['minus', 'difference', 'subtract', 'take away'],
            'multiplication': ['times', 'product', 'multiply', 'scale'],
            'division': ['divide', 'quotient', 'split', 'ratio'],
            'fraction': ['part', 'portion', 'ratio', 'division'],
            'percentage': ['percent', 'per hundred', 'proportion'],
            'angle': ['rotation', 'turn', 'corner', 'bend'],
            'area': ['surface', 'space', 'coverage', 'extent'],
            'volume': ['capacity', 'space', '3D measurement', 'cubic'],
            'perimeter': ['boundary', 'edge', 'outline', 'circumference'],
            'graph': ['chart', 'plot', 'visualization', 'diagram'],
            'theorem': ['principle', 'law', 'rule', 'statement'],
            'proof': ['demonstration', 'verification', 'justification', 'argument'],
            'solution': ['answer', 'result', 'resolution', 'outcome']
        };
    }

    // Initialize semantic relationships between concepts
    initializeSemanticRelations() {
        return {
            // Hierarchical relationships
            hierarchical: {
                'mathematics': ['algebra', 'geometry', 'calculus', 'statistics', 'probability'],
                'algebra': ['linear_equations', 'quadratic_equations', 'polynomials', 'variables'],
                'geometry': ['triangles', 'circles', 'angles', 'area', 'volume'],
                'calculus': ['limits', 'derivatives', 'integrals', 'differential_equations'],
                'statistics': ['probability_basics', 'distributions', 'hypothesis_testing'],
                'numbers': ['natural_numbers', 'integers', 'fractions', 'decimals']
            },
            
            // Conceptual relationships
            conceptual: {
                'quadratic_equations': ['parabolas', 'factoring', 'quadratic_formula'],
                'triangles': ['pythagorean_theorem', 'trigonometry', 'angles'],
                'derivatives': ['limits', 'rates_of_change', 'optimization'],
                'probability_basics': ['statistics', 'combinatorics', 'random_variables'],
                'fractions': ['decimals', 'percentages', 'ratios', 'proportions']
            },

            // Application relationships
            applications: {
                'calculus': ['physics', 'engineering', 'economics', 'optimization'],
                'statistics': ['data_science', 'research', 'quality_control', 'surveys'],
                'geometry': ['architecture', 'design', 'navigation', 'art'],
                'algebra': ['problem_solving', 'modeling', 'computer_science'],
                'probability': ['gambling', 'insurance', 'machine_learning', 'genetics']
            },

            // Historical relationships
            historical: {
                'calculus': ['newton', 'leibniz', '17th_century'],
                'geometry': ['euclid', 'ancient_greece', 'elements'],
                'algebra': ['al_khwarizmi', 'islamic_golden_age', 'medieval'],
                'probability': ['pascal', 'fermat', 'games_of_chance']
            }
        };
    }

    // Main search function with semantic understanding
    search(query, filters = {}) {
        // Preprocess query
        const processedQuery = this.preprocessQuery(query);
        
        // Get base results
        const baseResults = this.performBasicSearch(processedQuery, filters);
        
        // Enhance with semantic understanding
        const semanticResults = this.enhanceWithSemantics(processedQuery, baseResults, filters);
        
        // Rank results
        const rankedResults = this.rankResults(semanticResults, processedQuery);
        
        // Personalize based on user context
        const personalizedResults = this.personalizeResults(rankedResults);
        
        // Store search for learning
        this.recordSearch(query, personalizedResults);
        
        return personalizedResults;
    }

    // Preprocess search query
    preprocessQuery(query) {
        const processed = {
            original: query,
            normalized: query.toLowerCase().trim(),
            tokens: [],
            synonyms: [],
            concepts: [],
            intent: null,
            difficulty_indicators: [],
            question_type: null
        };

        // Tokenize
        processed.tokens = processed.normalized.split(/\s+/).filter(token => token.length > 1);
        
        // Identify question type
        processed.question_type = this.identifyQuestionType(processed.normalized);
        
        // Expand with synonyms
        processed.synonyms = this.expandWithSynonyms(processed.tokens);
        
        // Identify mathematical concepts
        processed.concepts = this.identifyMathematicalConcepts(processed.tokens);
        
        // Determine intent
        processed.intent = this.determineSearchIntent(processed);
        
        // Identify difficulty indicators
        processed.difficulty_indicators = this.identifyDifficultyIndicators(processed.normalized);

        return processed;
    }

    // Identify question type (what, how, why, when, etc.)
    identifyQuestionType(query) {
        const questionPatterns = {
            'what': /^what (is|are|does|do)/i,
            'how': /^how (to|do|does|can)/i,
            'why': /^why (is|are|does|do)/i,
            'when': /^when (is|was|do|does)/i,
            'where': /^where (is|are|can|does)/i,
            'who': /^who (is|was|invented|discovered)/i,
            'definition': /(define|definition|meaning|explain)/i,
            'example': /(example|examples|instance|case)/i,
            'comparison': /(difference|compare|vs|versus|between)/i,
            'procedure': /(steps|process|method|algorithm|solve)/i,
            'application': /(use|application|applied|real.world|practical)/i
        };

        for (const [type, pattern] of Object.entries(questionPatterns)) {
            if (pattern.test(query)) {
                return type;
            }
        }

        return 'general';
    }

    // Expand query terms with synonyms
    expandWithSynonyms(tokens) {
        const expanded = [...tokens];
        
        tokens.forEach(token => {
            for (const [key, synonyms] of Object.entries(this.synonymDatabase)) {
                if (key === token || synonyms.includes(token)) {
                    expanded.push(key, ...synonyms);
                }
            }
        });

        return [...new Set(expanded)]; // Remove duplicates
    }

    // Identify mathematical concepts in query
    identifyMathematicalConcepts(tokens) {
        const concepts = [];
        
        this.conceptsDatabase.forEach(concept => {
            const conceptTerms = [
                concept.title.toLowerCase(),
                concept.category.toLowerCase(),
                ...concept.tags.map(tag => tag.toLowerCase())
            ];

            // Check if any query token matches concept terms
            const hasMatch = tokens.some(token => 
                conceptTerms.some(term => 
                    term.includes(token) || token.includes(term)
                )
            );

            if (hasMatch) {
                concepts.push(concept.id);
            }
        });

        return concepts;
    }

    // Determine search intent
    determineSearchIntent(processed) {
        const { question_type, tokens, normalized } = processed;
        
        // Intent classification based on patterns
        if (question_type === 'definition' || /what is|define/.test(normalized)) {
            return 'definition';
        }
        
        if (question_type === 'how' || /solve|calculate|find/.test(normalized)) {
            return 'procedure';
        }
        
        if (question_type === 'example' || /example|sample/.test(normalized)) {
            return 'examples';
        }
        
        if (/formula|equation/.test(normalized)) {
            return 'formula';
        }
        
        if (/proof|prove|demonstrate/.test(normalized)) {
            return 'proof';
        }
        
        if (/application|use|practical/.test(normalized)) {
            return 'application';
        }

        return 'general';
    }

    // Identify difficulty level indicators in query
    identifyDifficultyIndicators(query) {
        const indicators = {
            beginner: ['basic', 'simple', 'easy', 'intro', 'elementary', 'beginner'],
            intermediate: ['intermediate', 'moderate', 'regular', 'standard'],
            advanced: ['advanced', 'complex', 'difficult', 'hard', 'challenging', 'expert'],
            specific_levels: {
                'elementary': [1, 2, 3],
                'middle school': [3, 4, 5],
                'high school': [4, 5, 6],
                'college': [6, 7, 8],
                'graduate': [8, 9, 10]
            }
        };

        const found = [];
        
        for (const [level, keywords] of Object.entries(indicators)) {
            if (level === 'specific_levels') continue;
            
            if (keywords.some(keyword => query.includes(keyword))) {
                found.push(level);
            }
        }

        // Check specific level mentions
        for (const [level, range] of Object.entries(indicators.specific_levels)) {
            if (query.includes(level)) {
                found.push({ level, range });
            }
        }

        return found;
    }

    // Perform basic text search
    performBasicSearch(processed, filters) {
        const { tokens, synonyms, concepts } = processed;
        const searchTerms = [...new Set([...tokens, ...synonyms])];
        
        return this.conceptsDatabase.filter(concept => {
            // Direct concept matches
            if (concepts.includes(concept.id)) {
                return true;
            }

            // Text matching
            const searchableText = [
                concept.title,
                concept.category,
                ...concept.tags,
                ...Object.values(concept.explanations).map(exp => exp.title + ' ' + exp.content)
            ].join(' ').toLowerCase();

            const hasTextMatch = searchTerms.some(term => searchableText.includes(term));
            
            // Apply filters
            if (filters.categories && filters.categories.length > 0) {
                if (!filters.categories.includes(concept.category)) {
                    return false;
                }
            }

            if (filters.maxDifficulty) {
                if (concept.difficulty_range[0] > filters.maxDifficulty) {
                    return false;
                }
            }

            if (filters.minDifficulty) {
                if (concept.difficulty_range[1] < filters.minDifficulty) {
                    return false;
                }
            }

            return hasTextMatch;
        });
    }

    // Enhance results with semantic relationships
    enhanceWithSemantics(processed, baseResults, filters) {
        const enhanced = [...baseResults];
        const { concepts, intent } = processed;

        // Add semantically related concepts
        concepts.forEach(conceptId => {
            const related = this.getSemanticallySimilar(conceptId, filters);
            enhanced.push(...related.filter(r => !enhanced.find(e => e.id === r.id)));
        });

        // Add intent-specific results
        if (intent === 'examples') {
            // Prioritize concepts with rich examples
            enhanced.forEach(concept => {
                concept.semantic_score = (concept.semantic_score || 1) * 
                    (concept.explanations && Object.keys(concept.explanations).length > 2 ? 1.5 : 1);
            });
        }

        return enhanced;
    }

    // Get semantically similar concepts
    getSemanticallySimilar(conceptId, filters) {
        const similar = [];
        
        // Check hierarchical relationships
        for (const [parent, children] of Object.entries(this.semanticRelations.hierarchical)) {
            if (children.includes(conceptId)) {
                // Add siblings
                children.forEach(sibling => {
                    if (sibling !== conceptId) {
                        const concept = this.conceptsDatabase.find(c => c.id === sibling);
                        if (concept) similar.push(concept);
                    }
                });
            }
        }

        // Check conceptual relationships
        if (this.semanticRelations.conceptual[conceptId]) {
            this.semanticRelations.conceptual[conceptId].forEach(relatedId => {
                const concept = this.conceptsDatabase.find(c => c.id === relatedId);
                if (concept) similar.push(concept);
            });
        }

        return similar.filter(concept => this.passesFilters(concept, filters));
    }

    // Check if concept passes filters
    passesFilters(concept, filters) {
        if (filters.categories && filters.categories.length > 0) {
            if (!filters.categories.includes(concept.category)) {
                return false;
            }
        }

        if (filters.maxDifficulty) {
            if (concept.difficulty_range[0] > filters.maxDifficulty) {
                return false;
            }
        }

        return true;
    }

    // Rank search results
    rankResults(results, processed) {
        return results.map(result => {
            let score = 1;

            // Title match bonus
            if (result.title.toLowerCase().includes(processed.normalized)) {
                score += 2;
            }

            // Tag match bonus
            const tagMatches = result.tags.filter(tag => 
                processed.tokens.some(token => tag.toLowerCase().includes(token))
            ).length;
            score += tagMatches * 0.5;

            // Direct concept match bonus
            if (processed.concepts.includes(result.id)) {
                score += 3;
            }

            // Difficulty appropriateness
            if (processed.difficulty_indicators.length > 0) {
                // Implementation would adjust score based on difficulty match
            }

            // Semantic score
            score += result.semantic_score || 0;

            return { ...result, search_score: score };
        }).sort((a, b) => b.search_score - a.search_score);
    }

    // Personalize results based on user context
    personalizeResults(results) {
        // Apply user's learning history, preferences, and level
        return results.map(result => {
            let personalScore = result.search_score;

            // User level appropriateness
            if (this.userContext.level) {
                const levelDiff = Math.abs(this.userContext.level - result.difficulty_range[0]);
                personalScore *= Math.max(0.5, 1 - levelDiff * 0.1);
            }

            // Interest matching
            if (this.userContext.interests) {
                const hasInterestMatch = this.userContext.interests.some(interest => 
                    result.tags.includes(interest) || result.category === interest
                );
                if (hasInterestMatch) personalScore *= 1.3;
            }

            return { ...result, personal_score: personalScore };
        }).sort((a, b) => b.personal_score - a.personal_score);
    }

    // Natural language interpretation
    interpretNaturalLanguage(query) {
        const interpretation = {
            searchTerms: [],
            intent: null,
            concepts: [],
            difficulty: null,
            questionType: null
        };

        // Extract key mathematical terms
        const mathTerms = this.extractMathematicalTerms(query);
        interpretation.searchTerms = mathTerms;

        // Determine intent from question structure
        interpretation.intent = this.determineSearchIntent({ normalized: query.toLowerCase() });
        interpretation.questionType = this.identifyQuestionType(query);

        // Extract mentioned concepts
        interpretation.concepts = this.identifyMathematicalConcepts(mathTerms);

        return interpretation;
    }

    // Extract mathematical terms from natural language
    extractMathematicalTerms(query) {
        const terms = [];
        const words = query.toLowerCase().split(/\s+/);

        // Check against known mathematical vocabulary
        words.forEach(word => {
            if (this.synonymDatabase[word] || Object.values(this.synonymDatabase).flat().includes(word)) {
                terms.push(word);
            }
        });

        // Look for mathematical concepts in multi-word phrases
        this.conceptsDatabase.forEach(concept => {
            const conceptTitle = concept.title.toLowerCase();
            if (query.toLowerCase().includes(conceptTitle)) {
                terms.push(conceptTitle);
            }
        });

        return [...new Set(terms)];
    }

    // Search by mathematical formula
    searchByFormula(formula) {
        // Normalize formula (remove spaces, standardize notation)
        const normalizedFormula = this.normalizeFormula(formula);
        
        // Search for concepts containing this formula
        return this.conceptsDatabase.filter(concept => {
            return Object.values(concept.explanations).some(explanation => {
                const content = explanation.content + ' ' + (explanation.examples || []).join(' ');
                return this.containsFormula(content, normalizedFormula);
            });
        });
    }

    // Normalize mathematical formula for comparison
    normalizeFormula(formula) {
        return formula
            .replace(/\s+/g, '') // Remove spaces
            .replace(/\*/g, '') // Remove explicit multiplication
            .replace(/\^/g, '**') // Standardize exponentiation
            .toLowerCase();
    }

    // Check if content contains a formula
    containsFormula(content, formula) {
        const normalizedContent = this.normalizeFormula(content);
        return normalizedContent.includes(formula);
    }

    // Get search suggestions
    getSuggestions(query) {
        if (query.length < 2) return [];

        const suggestions = [];
        const queryLower = query.toLowerCase();

        // Direct title matches
        this.conceptsDatabase.forEach(concept => {
            if (concept.title.toLowerCase().includes(queryLower)) {
                suggestions.push({
                    id: concept.id,
                    title: concept.title,
                    description: concept.explanations[Object.keys(concept.explanations)[0]]?.content?.substring(0, 100) + '...',
                    tags: concept.tags.slice(0, 3),
                    type: 'concept'
                });
            }
        });

        // Tag matches
        this.conceptsDatabase.forEach(concept => {
            concept.tags.forEach(tag => {
                if (tag.toLowerCase().includes(queryLower) && !suggestions.find(s => s.id === concept.id)) {
                    suggestions.push({
                        id: concept.id,
                        title: concept.title,
                        description: `Related to: ${tag}`,
                        tags: concept.tags.slice(0, 3),
                        type: 'tag_match'
                    });
                }
            });
        });

        // Synonym matches
        for (const [key, synonyms] of Object.entries(this.synonymDatabase)) {
            if (key.includes(queryLower) || synonyms.some(syn => syn.includes(queryLower))) {
                const relatedConcepts = this.conceptsDatabase.filter(concept => 
                    concept.title.toLowerCase().includes(key) || 
                    concept.tags.some(tag => tag.toLowerCase().includes(key))
                );
                
                relatedConcepts.forEach(concept => {
                    if (!suggestions.find(s => s.id === concept.id)) {
                        suggestions.push({
                            id: concept.id,
                            title: concept.title,
                            description: `Related term: ${key}`,
                            tags: concept.tags.slice(0, 3),
                            type: 'synonym_match'
                        });
                    }
                });
            }
        }

        return suggestions.slice(0, 8); // Limit to 8 suggestions
    }

    // Generate semantic insights about search results
    generateSemanticInsights(query, results, interpretation = null) {
        const insights = [];

        // Query analysis insight
        if (interpretation) {
            insights.push({
                type: 'Query Analysis',
                content: `I interpreted your question as seeking ${interpretation.intent} about ${interpretation.concepts.length} mathematical concept${interpretation.concepts.length !== 1 ? 's' : ''}.`
            });
        }

        // Results distribution insight
        const categories = [...new Set(results.map(r => r.category))];
        if (categories.length > 1) {
            insights.push({
                type: 'Topic Distribution',
                content: `Your search spans ${categories.length} mathematical areas: ${categories.join(', ')}.`
            });
        }

        // Difficulty analysis
        const difficulties = results.map(r => r.difficulty_range[0]);
        const avgDifficulty = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
        insights.push({
            type: 'Difficulty Analysis',
            content: `Results range from beginner to advanced level, with an average difficulty of level ${Math.round(avgDifficulty)}.`
        });

        // Learning path suggestion
        if (results.length > 3) {
            const sortedByDifficulty = results.sort((a, b) => a.difficulty_range[0] - b.difficulty_range[0]);
            insights.push({
                type: 'Learning Path',
                content: `Consider starting with "${sortedByDifficulty[0].title}" and progressing to "${sortedByDifficulty[sortedByDifficulty.length - 1].title}".`
            });
        }

        return insights;
    }

    // Get related search suggestions
    getRelatedSearches(query) {
        const related = [];
        const processed = this.preprocessQuery(query);

        // Related concepts
        processed.concepts.forEach(conceptId => {
            const concept = this.conceptsDatabase.find(c => c.id === conceptId);
            if (concept) {
                concept.connections.forEach(connectionId => {
                    const connected = this.conceptsDatabase.find(c => c.id === connectionId);
                    if (connected) {
                        related.push(connected.title);
                    }
                });
            }
        });

        // Hierarchical relationships
        for (const [parent, children] of Object.entries(this.semanticRelations.hierarchical)) {
            if (children.some(child => processed.concepts.includes(child))) {
                related.push(parent);
                children.forEach(child => {
                    const concept = this.conceptsDatabase.find(c => c.id === child);
                    if (concept && !processed.concepts.includes(child)) {
                        related.push(concept.title);
                    }
                });
            }
        }

        return [...new Set(related)].slice(0, 6);
    }

    // Get concept by ID
    getConceptById(id) {
        return this.conceptsDatabase.find(concept => concept.id === id);
    }

    // Load user context from storage
    loadUserContext() {
        const stored = localStorage.getItem('mathverse-user-context');
        return stored ? JSON.parse(stored) : {
            level: 5,
            interests: [],
            searchHistory: [],
            preferredTypes: []
        };
    }

    // Record search for learning and improvement
    recordSearch(query, results) {
        this.searchHistory.push({
            query,
            timestamp: Date.now(),
            resultCount: results.length,
            topResult: results[0]?.id
        });

        // Keep only recent searches
        this.searchHistory = this.searchHistory.slice(-50);
        
        // Update user context
        this.updateUserContext(query, results);
    }

    // Update user context based on search behavior
    updateUserContext(query, results) {
        const processed = this.preprocessQuery(query);
        
        // Update preferred categories
        if (results.length > 0) {
            const categories = results.map(r => r.category);
            categories.forEach(category => {
                this.userContext.preferredTypes.push(category);
            });
            
            // Keep only recent preferences
            this.userContext.preferredTypes = this.userContext.preferredTypes.slice(-20);
        }

        // Save updated context
        localStorage.setItem('mathverse-user-context', JSON.stringify(this.userContext));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SemanticSearchEngine;
} else {
    window.SemanticSearchEngine = SemanticSearchEngine;
}