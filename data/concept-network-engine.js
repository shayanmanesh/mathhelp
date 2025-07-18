// Concept Network Engine - Mathematical Knowledge Graph
// Phase 11 Implementation for MathVerse

class ConceptNetworkEngine {
    constructor() {
        this.conceptsDatabase = getCoreConceptsDatabase();
        this.networkGraph = this.buildKnowledgeGraph();
        this.clusters = null;
        this.pathCache = new Map();
    }

    // Build the complete knowledge graph
    buildKnowledgeGraph() {
        const graph = {
            nodes: new Map(),
            edges: new Map(),
            adjacencyList: new Map()
        };

        // Add all concepts as nodes
        this.conceptsDatabase.forEach(concept => {
            graph.nodes.set(concept.id, {
                ...concept,
                inDegree: 0,
                outDegree: 0,
                centrality: 0
            });
            graph.adjacencyList.set(concept.id, new Set());
        });

        // Add connections as edges
        this.conceptsDatabase.forEach(concept => {
            concept.connections.forEach(connectionId => {
                const targetConcept = this.conceptsDatabase.find(c => c.id === connectionId);
                if (targetConcept) {
                    const edgeId = `${concept.id}-${connectionId}`;
                    const reverseEdgeId = `${connectionId}-${concept.id}`;
                    
                    // Determine connection type
                    const connectionType = this.determineConnectionType(concept, targetConcept);
                    
                    if (!graph.edges.has(edgeId) && !graph.edges.has(reverseEdgeId)) {
                        graph.edges.set(edgeId, {
                            source: concept.id,
                            target: connectionId,
                            type: connectionType,
                            weight: this.calculateConnectionWeight(concept, targetConcept)
                        });

                        // Update adjacency list
                        graph.adjacencyList.get(concept.id).add(connectionId);
                        graph.adjacencyList.get(connectionId).add(concept.id);

                        // Update degrees
                        const sourceNode = graph.nodes.get(concept.id);
                        const targetNode = graph.nodes.get(connectionId);
                        sourceNode.outDegree++;
                        targetNode.inDegree++;
                    }
                }
            });
        });

        // Calculate centrality measures
        this.calculateCentralityMeasures(graph);

        return graph;
    }

    // Determine the type of connection between two concepts
    determineConnectionType(concept1, concept2) {
        // Prerequisites: if concept1 is significantly easier than concept2
        const difficultyDiff = concept2.difficulty_range[0] - concept1.difficulty_range[1];
        if (difficultyDiff >= 2) {
            return 'prerequisite';
        }

        // Applications: if one concept applies another in a specific domain
        if (this.isApplicationConnection(concept1, concept2)) {
            return 'application';
        }

        // Default to related concepts
        return 'related';
    }

    // Check if connection represents an application relationship
    isApplicationConnection(concept1, concept2) {
        const applicationIndicators = [
            'application', 'applied', 'real-world', 'practical',
            'physics', 'engineering', 'economics', 'computer science'
        ];

        const concept1Text = (concept1.title + ' ' + concept1.tags.join(' ')).toLowerCase();
        const concept2Text = (concept2.title + ' ' + concept2.tags.join(' ')).toLowerCase();

        return applicationIndicators.some(indicator => 
            concept1Text.includes(indicator) || concept2Text.includes(indicator)
        );
    }

    // Calculate connection weight based on concept similarity
    calculateConnectionWeight(concept1, concept2) {
        let weight = 1.0;

        // Category similarity
        if (concept1.category === concept2.category) {
            weight += 0.5;
        }

        // Tag overlap
        const commonTags = concept1.tags.filter(tag => concept2.tags.includes(tag));
        weight += commonTags.length * 0.2;

        // Difficulty proximity
        const difficultyDiff = Math.abs(concept1.difficulty_range[0] - concept2.difficulty_range[0]);
        weight += Math.max(0, 1 - difficultyDiff * 0.1);

        return Math.min(3.0, weight); // Cap at 3.0
    }

    // Calculate various centrality measures
    calculateCentralityMeasures(graph) {
        // Degree centrality
        graph.nodes.forEach(node => {
            const totalDegree = node.inDegree + node.outDegree;
            node.degreeCentrality = totalDegree / (graph.nodes.size - 1);
        });

        // Betweenness centrality (simplified)
        this.calculateBetweennessCentrality(graph);

        // PageRank-style importance
        this.calculatePageRankCentrality(graph);
    }

    // Calculate betweenness centrality
    calculateBetweennessCentrality(graph) {
        const betweenness = new Map();
        graph.nodes.forEach((_, nodeId) => {
            betweenness.set(nodeId, 0);
        });

        // For each pair of nodes, find shortest paths
        graph.nodes.forEach((_, sourceId) => {
            const shortestPaths = this.calculateShortestPaths(graph, sourceId);
            
            graph.nodes.forEach((_, targetId) => {
                if (sourceId !== targetId) {
                    const path = shortestPaths.get(targetId);
                    if (path && path.length > 2) {
                        // Add to betweenness for intermediate nodes
                        for (let i = 1; i < path.length - 1; i++) {
                            const currentBetweenness = betweenness.get(path[i]) || 0;
                            betweenness.set(path[i], currentBetweenness + 1);
                        }
                    }
                }
            });
        });

        // Normalize and store
        const maxBetweenness = Math.max(...betweenness.values());
        graph.nodes.forEach((node, nodeId) => {
            node.betweennessCentrality = maxBetweenness > 0 ? 
                (betweenness.get(nodeId) || 0) / maxBetweenness : 0;
        });
    }

    // Calculate PageRank-style centrality
    calculatePageRankCentrality(graph, damping = 0.85, iterations = 50) {
        const pageRank = new Map();
        const nodeCount = graph.nodes.size;
        
        // Initialize
        graph.nodes.forEach((_, nodeId) => {
            pageRank.set(nodeId, 1.0 / nodeCount);
        });

        // Iterate
        for (let i = 0; i < iterations; i++) {
            const newPageRank = new Map();
            
            graph.nodes.forEach((_, nodeId) => {
                let rank = (1 - damping) / nodeCount;
                
                // Sum contributions from connected nodes
                graph.adjacencyList.get(nodeId).forEach(neighborId => {
                    const neighborOutDegree = graph.adjacencyList.get(neighborId).size;
                    if (neighborOutDegree > 0) {
                        rank += damping * (pageRank.get(neighborId) / neighborOutDegree);
                    }
                });
                
                newPageRank.set(nodeId, rank);
            });
            
            // Update
            newPageRank.forEach((rank, nodeId) => {
                pageRank.set(nodeId, rank);
            });
        }

        // Store normalized values
        const maxPageRank = Math.max(...pageRank.values());
        graph.nodes.forEach((node, nodeId) => {
            node.pageRankCentrality = pageRank.get(nodeId) / maxPageRank;
            node.centrality = node.pageRankCentrality; // Use as main centrality measure
        });
    }

    // Build network data for visualization
    buildConceptNetwork(categoryFilter = 'all', connectionTypes = ['prerequisite', 'related', 'application']) {
        const nodes = [];
        const links = [];

        // Filter nodes by category
        this.networkGraph.nodes.forEach((node, nodeId) => {
            if (categoryFilter === 'all' || node.category === categoryFilter) {
                nodes.push({
                    id: nodeId,
                    title: node.title,
                    shortName: this.getShortName(node.title),
                    category: node.category,
                    difficulty_range: node.difficulty_range,
                    centrality: node.centrality,
                    connections: node.connections
                });
            }
        });

        const nodeIds = new Set(nodes.map(n => n.id));

        // Filter links by type and ensure both nodes are included
        this.networkGraph.edges.forEach((edge, edgeId) => {
            if (connectionTypes.includes(edge.type) && 
                nodeIds.has(edge.source) && 
                nodeIds.has(edge.target)) {
                links.push({
                    source: edge.source,
                    target: edge.target,
                    type: edge.type,
                    weight: edge.weight
                });
            }
        });

        return { nodes, links };
    }

    // Generate short name for concept display
    getShortName(title) {
        // Create abbreviations for common mathematical terms
        const abbreviations = {
            'derivative': 'f\'',
            'integral': '∫',
            'limit': 'lim',
            'function': 'f(x)',
            'equation': 'eq',
            'theorem': 'thm',
            'probability': 'P',
            'statistics': 'stats',
            'triangle': '△',
            'circle': '○',
            'square': '□',
            'natural numbers': 'ℕ',
            'integers': 'ℤ',
            'rational numbers': 'ℚ',
            'real numbers': 'ℝ',
            'complex numbers': 'ℂ'
        };

        const lowerTitle = title.toLowerCase();
        for (const [full, abbrev] of Object.entries(abbreviations)) {
            if (lowerTitle.includes(full)) {
                return abbrev;
            }
        }

        // Default: first word or first few characters
        const words = title.split(' ');
        if (words.length > 1) {
            return words[0];
        }
        return title.length > 8 ? title.substring(0, 8) + '...' : title;
    }

    // Calculate shortest paths using BFS
    calculateShortestPaths(graph, sourceId) {
        const distances = new Map();
        const paths = new Map();
        const queue = [sourceId];
        
        distances.set(sourceId, 0);
        paths.set(sourceId, [sourceId]);

        while (queue.length > 0) {
            const currentId = queue.shift();
            const currentDistance = distances.get(currentId);
            const currentPath = paths.get(currentId);

            graph.adjacencyList.get(currentId).forEach(neighborId => {
                if (!distances.has(neighborId)) {
                    distances.set(neighborId, currentDistance + 1);
                    paths.set(neighborId, [...currentPath, neighborId]);
                    queue.push(neighborId);
                }
            });
        }

        return paths;
    }

    // Find learning path between two concepts
    findLearningPath(fromConceptName, toConceptName) {
        // Find concept IDs
        const fromConcept = this.conceptsDatabase.find(c => 
            c.title.toLowerCase().includes(fromConceptName.toLowerCase())
        );
        const toConcept = this.conceptsDatabase.find(c => 
            c.title.toLowerCase().includes(toConceptName.toLowerCase())
        );

        if (!fromConcept || !toConcept) {
            return null;
        }

        // Check cache
        const cacheKey = `${fromConcept.id}-${toConcept.id}`;
        if (this.pathCache.has(cacheKey)) {
            return this.pathCache.get(cacheKey);
        }

        // Use shortest path with learning-optimized weights
        const path = this.findOptimalLearningPath(fromConcept.id, toConcept.id);
        
        // Convert IDs to titles
        const pathTitles = path ? path.map(conceptId => {
            const concept = this.conceptsDatabase.find(c => c.id === conceptId);
            return concept ? concept.title : conceptId;
        }) : null;

        // Cache result
        this.pathCache.set(cacheKey, pathTitles);
        
        return pathTitles;
    }

    // Find optimal learning path considering difficulty progression
    findOptimalLearningPath(sourceId, targetId) {
        const distances = new Map();
        const paths = new Map();
        const priorityQueue = [{ id: sourceId, cost: 0 }];
        
        distances.set(sourceId, 0);
        paths.set(sourceId, [sourceId]);

        while (priorityQueue.length > 0) {
            // Sort by cost (simple priority queue)
            priorityQueue.sort((a, b) => a.cost - b.cost);
            const current = priorityQueue.shift();
            
            if (current.id === targetId) {
                return paths.get(targetId);
            }

            const currentCost = distances.get(current.id);
            const currentPath = paths.get(current.id);

            this.networkGraph.adjacencyList.get(current.id).forEach(neighborId => {
                const edgeCost = this.calculateLearningCost(current.id, neighborId);
                const newCost = currentCost + edgeCost;

                if (!distances.has(neighborId) || newCost < distances.get(neighborId)) {
                    distances.set(neighborId, newCost);
                    paths.set(neighborId, [...currentPath, neighborId]);
                    priorityQueue.push({ id: neighborId, cost: newCost });
                }
            });
        }

        return null; // No path found
    }

    // Calculate learning cost between two concepts
    calculateLearningCost(fromId, toId) {
        const fromConcept = this.networkGraph.nodes.get(fromId);
        const toConcept = this.networkGraph.nodes.get(toId);
        
        if (!fromConcept || !toConcept) return Infinity;

        let cost = 1.0; // Base cost

        // Difficulty jump penalty
        const difficultyJump = toConcept.difficulty_range[0] - fromConcept.difficulty_range[1];
        if (difficultyJump > 1) {
            cost += difficultyJump * 0.5; // Penalty for large difficulty jumps
        }

        // Category change penalty
        if (fromConcept.category !== toConcept.category) {
            cost += 0.3;
        }

        // Reward for natural progression (prerequisites)
        const edge = this.networkGraph.edges.get(`${fromId}-${toId}`);
        if (edge && edge.type === 'prerequisite') {
            cost *= 0.7; // Discount for prerequisite relationships
        }

        return cost;
    }

    // Get concept hierarchy for hierarchical layout
    getConceptHierarchy(nodes, links) {
        const hierarchy = {
            levels: new Map(),
            maxLevel: 0
        };

        // Assign levels based on difficulty
        nodes.forEach(node => {
            const level = node.difficulty_range ? node.difficulty_range[0] : 5;
            if (!hierarchy.levels.has(level)) {
                hierarchy.levels.set(level, []);
            }
            hierarchy.levels.get(level).push(node);
            hierarchy.maxLevel = Math.max(hierarchy.maxLevel, level);
        });

        return hierarchy;
    }

    // Cluster concepts by category and connections
    clusterConcepts(nodes, links) {
        const clusters = {};

        // Primary clustering by category
        nodes.forEach(node => {
            if (!clusters[node.category]) {
                clusters[node.category] = [];
            }
            clusters[node.category].push(node);
        });

        // Secondary clustering by strong connections within categories
        Object.keys(clusters).forEach(category => {
            const categoryNodes = clusters[category];
            const subclusters = this.findSubclusters(categoryNodes, links);
            
            if (subclusters.length > 1) {
                subclusters.forEach((subcluster, i) => {
                    const subclusterKey = `${category}_${i + 1}`;
                    clusters[subclusterKey] = subcluster;
                });
                delete clusters[category];
            }
        });

        return clusters;
    }

    // Find subclusters within a category using connection strength
    findSubclusters(nodes, links) {
        if (nodes.length <= 3) return [nodes]; // Too small to subcluster

        const nodeIds = new Set(nodes.map(n => n.id));
        const internalLinks = links.filter(link => 
            nodeIds.has(link.source.id || link.source) && 
            nodeIds.has(link.target.id || link.target)
        );

        // Simple clustering based on connection density
        const visited = new Set();
        const subclusters = [];

        nodes.forEach(node => {
            if (!visited.has(node.id)) {
                const cluster = this.depthFirstCluster(node, nodes, internalLinks, visited);
                if (cluster.length > 0) {
                    subclusters.push(cluster);
                }
            }
        });

        return subclusters.length > 1 ? subclusters : [nodes];
    }

    // Depth-first clustering
    depthFirstCluster(startNode, allNodes, links, visited) {
        const cluster = [];
        const stack = [startNode];

        while (stack.length > 0) {
            const node = stack.pop();
            if (visited.has(node.id)) continue;

            visited.add(node.id);
            cluster.push(node);

            // Find connected nodes
            links.forEach(link => {
                const sourceId = link.source.id || link.source;
                const targetId = link.target.id || link.target;

                if (sourceId === node.id && !visited.has(targetId)) {
                    const targetNode = allNodes.find(n => n.id === targetId);
                    if (targetNode) stack.push(targetNode);
                }
                if (targetId === node.id && !visited.has(sourceId)) {
                    const sourceNode = allNodes.find(n => n.id === sourceId);
                    if (sourceNode) stack.push(sourceNode);
                }
            });
        }

        return cluster;
    }

    // Calculate network statistics
    calculateNetworkStatistics(nodes, links) {
        const totalConcepts = nodes.length;
        const totalConnections = links.length;
        const maxPossibleConnections = (totalConcepts * (totalConcepts - 1)) / 2;
        const density = maxPossibleConnections > 0 ? 
            Math.round((totalConnections / maxPossibleConnections) * 100) : 0;
        const avgConnections = totalConcepts > 0 ? 
            Math.round((totalConnections * 2) / totalConcepts * 10) / 10 : 0;

        return {
            totalConcepts,
            totalConnections,
            density,
            avgConnections,
            categories: [...new Set(nodes.map(n => n.category))].length,
            difficultyLevels: Math.max(...nodes.map(n => n.difficulty_range[1])) - 
                             Math.min(...nodes.map(n => n.difficulty_range[0])) + 1
        };
    }

    // Search concepts by name or content
    searchConcepts(query) {
        if (!query || query.length < 2) return [];

        const queryLower = query.toLowerCase();
        
        return this.conceptsDatabase
            .filter(concept => {
                return concept.title.toLowerCase().includes(queryLower) ||
                       concept.category.toLowerCase().includes(queryLower) ||
                       concept.tags.some(tag => tag.toLowerCase().includes(queryLower));
            })
            .map(concept => ({
                id: concept.id,
                title: concept.title,
                category: concept.category,
                difficulty_range: concept.difficulty_range
            }))
            .slice(0, 10);
    }

    // Get detailed information about a concept
    getConceptDetails(conceptId) {
        const concept = this.conceptsDatabase.find(c => c.id === conceptId);
        if (!concept) return null;

        const networkNode = this.networkGraph.nodes.get(conceptId);
        const connections = this.networkGraph.adjacencyList.get(conceptId);

        return {
            ...concept,
            centrality: networkNode ? networkNode.centrality : 0,
            connectionCount: connections ? connections.size : 0,
            connectedConcepts: connections ? Array.from(connections).map(id => {
                const connectedConcept = this.conceptsDatabase.find(c => c.id === id);
                return connectedConcept ? {
                    id: connectedConcept.id,
                    title: connectedConcept.title,
                    category: connectedConcept.category
                } : null;
            }).filter(Boolean) : []
        };
    }

    // Generate concept recommendations based on user's current concept
    generateRecommendations(conceptId, userLevel = 5, maxRecommendations = 5) {
        const concept = this.networkGraph.nodes.get(conceptId);
        if (!concept) return [];

        const recommendations = [];
        const connections = this.networkGraph.adjacencyList.get(conceptId);

        // Add directly connected concepts
        connections.forEach(connectedId => {
            const connectedConcept = this.networkGraph.nodes.get(connectedId);
            if (connectedConcept && Math.abs(connectedConcept.difficulty_range[0] - userLevel) <= 2) {
                recommendations.push({
                    id: connectedId,
                    title: connectedConcept.title,
                    reason: 'Directly related concept',
                    relevanceScore: connectedConcept.centrality + (2 - Math.abs(connectedConcept.difficulty_range[0] - userLevel))
                });
            }
        });

        // Add concepts from same category at appropriate level
        this.conceptsDatabase.forEach(otherConcept => {
            if (otherConcept.id !== conceptId && 
                otherConcept.category === concept.category &&
                Math.abs(otherConcept.difficulty_range[0] - userLevel) <= 1 &&
                !recommendations.find(r => r.id === otherConcept.id)) {
                
                recommendations.push({
                    id: otherConcept.id,
                    title: otherConcept.title,
                    reason: 'Same category, appropriate level',
                    relevanceScore: 1 + (1 - Math.abs(otherConcept.difficulty_range[0] - userLevel))
                });
            }
        });

        // Sort by relevance and return top recommendations
        return recommendations
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, maxRecommendations);
    }

    // Export network data for external analysis
    exportNetworkData() {
        return {
            nodes: Array.from(this.networkGraph.nodes.values()),
            edges: Array.from(this.networkGraph.edges.values()),
            statistics: this.calculateNetworkStatistics(
                Array.from(this.networkGraph.nodes.values()),
                Array.from(this.networkGraph.edges.values())
            )
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConceptNetworkEngine;
} else {
    window.ConceptNetworkEngine = ConceptNetworkEngine;
}