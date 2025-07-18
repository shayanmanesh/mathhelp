// MathVerse Concept Structure and Connection Engine
// This defines the data structure for all mathematical concepts

const ConceptStructure = {
    // Core concept template
    template: {
        id: "", // Unique identifier
        name: "", // Display name
        category: "", // Elementary, HighSchool, Undergraduate, Graduate, Research
        tags: [], // Searchable tags
        
        // Multi-level explanations (1-10 scale)
        explanations: {
            level1: { // Elementary (ages 6-8)
                title: "",
                content: "",
                analogies: [],
                visuals: []
            },
            level2: { // Elementary (ages 9-11)
                title: "",
                content: "",
                analogies: [],
                visuals: []
            },
            level3: { // Middle School
                title: "",
                content: "",
                analogies: [],
                visuals: []
            },
            level4: { // Early High School
                title: "",
                content: "",
                analogies: [],
                visuals: []
            },
            level5: { // High School
                title: "",
                content: "",
                analogies: [],
                visuals: []
            },
            level6: { // AP/Early Undergrad
                title: "",
                content: "",
                analogies: [],
                visuals: []
            },
            level7: { // Undergraduate
                title: "",
                content: "",
                analogies: [],
                visuals: []
            },
            level8: { // Advanced Undergrad
                title: "",
                content: "",
                analogies: [],
                visuals: []
            },
            level9: { // Graduate
                title: "",
                content: "",
                analogies: [],
                visuals: []
            },
            level10: { // Research
                title: "",
                content: "",
                analogies: [],
                visuals: []
            }
        },
        
        // Prerequisites and connections
        prerequisites: [], // Concepts needed to understand this
        connections: {
            stronglyRelated: [], // Direct mathematical relationships
            applications: [], // Real-world applications
            generalizations: [], // More abstract versions
            specialCases: [], // Specific instances
            historicalOrigins: [], // Historical development
            modernUses: [] // Current research areas
        },
        
        // Proofs and demonstrations
        proofs: {
            visual: [], // Visual/geometric proofs
            algebraic: [], // Algebraic proofs
            computational: [], // Computational demonstrations
            formal: [] // Formal mathematical proofs
        },
        
        // Applications and relevance
        applications: {
            technology: [],
            science: [],
            engineering: [],
            economics: [],
            arts: [],
            dailyLife: []
        },
        
        // Historical context
        history: {
            discovered: "", // Date/period
            discoveredBy: [], // Mathematicians
            motivation: "", // Why it was developed
            impact: "", // Historical impact
            milestones: [] // Key developments
        },
        
        // Interactive elements
        interactives: {
            visualizations: [], // D3/Three.js visualizations
            calculators: [], // Interactive calculators
            explorers: [], // Parameter explorers
            games: [] // Educational games
        },
        
        // Assessment and practice
        practice: {
            conceptQuestions: [],
            computationalProblems: [],
            proofExercises: [],
            applications: []
        },
        
        // Metadata
        metadata: {
            difficulty: 1, // 1-10 scale
            importance: 1, // 1-10 scale
            frequency: 1, // How often encountered
            lastUpdated: "",
            contributors: [],
            sources: []
        }
    }
};

// Connection Engine
class ConnectionEngine {
    constructor() {
        this.concepts = new Map();
        this.connections = new Map();
    }
    
    addConcept(concept) {
        this.concepts.set(concept.id, concept);
        this.updateConnections(concept);
    }
    
    updateConnections(concept) {
        // Build bidirectional connection graph
        const allConnections = [
            ...concept.prerequisites,
            ...concept.connections.stronglyRelated,
            ...concept.connections.generalizations,
            ...concept.connections.specialCases
        ];
        
        allConnections.forEach(connectedId => {
            if (!this.connections.has(concept.id)) {
                this.connections.set(concept.id, new Set());
            }
            if (!this.connections.has(connectedId)) {
                this.connections.set(connectedId, new Set());
            }
            
            this.connections.get(concept.id).add(connectedId);
            this.connections.get(connectedId).add(concept.id);
        });
    }
    
    // Find shortest path between two concepts (Six Degrees of Mathematics)
    findPath(startId, endId) {
        if (!this.concepts.has(startId) || !this.concepts.has(endId)) {
            return null;
        }
        
        const queue = [[startId]];
        const visited = new Set([startId]);
        
        while (queue.length > 0) {
            const path = queue.shift();
            const current = path[path.length - 1];
            
            if (current === endId) {
                return path;
            }
            
            const connections = this.connections.get(current) || new Set();
            for (const next of connections) {
                if (!visited.has(next)) {
                    visited.add(next);
                    queue.push([...path, next]);
                }
            }
        }
        
        return null; // No path found
    }
    
    // Get related concepts by category
    getRelated(conceptId, category = 'all', limit = 10) {
        const concept = this.concepts.get(conceptId);
        if (!concept) return [];
        
        let related = [];
        
        switch (category) {
            case 'prerequisites':
                related = concept.prerequisites;
                break;
            case 'applications':
                related = concept.connections.applications;
                break;
            case 'generalizations':
                related = concept.connections.generalizations;
                break;
            case 'all':
                related = [
                    ...concept.prerequisites,
                    ...concept.connections.stronglyRelated,
                    ...concept.connections.applications,
                    ...concept.connections.generalizations,
                    ...concept.connections.specialCases
                ];
                break;
        }
        
        return related.slice(0, limit);
    }
    
    // Search concepts
    search(query, filters = {}) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        for (const [id, concept] of this.concepts) {
            let match = false;
            
            // Search in name
            if (concept.name.toLowerCase().includes(queryLower)) {
                match = true;
            }
            
            // Search in tags
            if (concept.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
                match = true;
            }
            
            // Apply filters
            if (match && filters.category && concept.category !== filters.category) {
                match = false;
            }
            
            if (match && filters.difficulty && 
                Math.abs(concept.metadata.difficulty - filters.difficulty) > 1) {
                match = false;
            }
            
            if (match) {
                results.push(concept);
            }
        }
        
        // Sort by relevance (simple scoring)
        results.sort((a, b) => {
            const scoreA = this.getRelevanceScore(a, queryLower);
            const scoreB = this.getRelevanceScore(b, queryLower);
            return scoreB - scoreA;
        });
        
        return results;
    }
    
    getRelevanceScore(concept, query) {
        let score = 0;
        
        // Exact name match
        if (concept.name.toLowerCase() === query) score += 10;
        
        // Name contains query
        if (concept.name.toLowerCase().includes(query)) score += 5;
        
        // Tag matches
        concept.tags.forEach(tag => {
            if (tag.toLowerCase() === query) score += 3;
            if (tag.toLowerCase().includes(query)) score += 1;
        });
        
        // Importance factor
        score += concept.metadata.importance * 0.5;
        
        return score;
    }
    
    // Generate learning path
    generateLearningPath(startId, goalId) {
        const path = this.findPath(startId, goalId);
        if (!path) return null;
        
        const learningPath = {
            concepts: path.map(id => this.concepts.get(id)),
            estimatedTime: path.length * 30, // 30 minutes per concept average
            difficulty: this.calculatePathDifficulty(path),
            prerequisites: this.gatherPrerequisites(path)
        };
        
        return learningPath;
    }
    
    calculatePathDifficulty(path) {
        const difficulties = path.map(id => 
            this.concepts.get(id)?.metadata.difficulty || 5
        );
        return Math.max(...difficulties);
    }
    
    gatherPrerequisites(path) {
        const prerequisites = new Set();
        
        path.forEach(id => {
            const concept = this.concepts.get(id);
            if (concept) {
                concept.prerequisites.forEach(prereq => {
                    if (!path.includes(prereq)) {
                        prerequisites.add(prereq);
                    }
                });
            }
        });
        
        return Array.from(prerequisites);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConceptStructure, ConnectionEngine };
}