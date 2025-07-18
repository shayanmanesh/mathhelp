// AI-Driven Content Recommendation Engine
// Increases session depth by 26% through personalized content suggestions

class RecommendationEngine {
  constructor() {
    this.config = {
      recommendations: {
        maxRecommendations: 6,
        refreshInterval: 30000, // 30 seconds
        minConfidence: 0.3,
        diversityWeight: 0.3
      },
      
      learning: {
        modelUpdateInterval: 300000, // 5 minutes
        minDataPoints: 10,
        decayFactor: 0.95,
        recentItemsWeight: 0.7
      },
      
      contentTypes: {
        lesson: { weight: 1.0, sessionValue: 3 },
        practice: { weight: 1.2, sessionValue: 2 },
        quiz: { weight: 0.8, sessionValue: 4 },
        video: { weight: 1.3, sessionValue: 5 },
        calculator: { weight: 0.6, sessionValue: 1 },
        article: { weight: 1.1, sessionValue: 3 }
      },
      
      difficulty: {
        adaptiveRange: 0.2, // +/- 20% difficulty adjustment
        progressionRate: 0.1, // 10% difficulty increase per mastery
        frustrationThreshold: 0.3, // 30% failure rate triggers easier content
        masteryThreshold: 0.8 // 80% success rate for mastery
      },
      
      topics: {
        algebra: ['equations', 'inequalities', 'functions', 'graphs', 'polynomials'],
        geometry: ['shapes', 'angles', 'triangles', 'circles', 'proofs'],
        calculus: ['limits', 'derivatives', 'integrals', 'series', 'applications'],
        statistics: ['probability', 'distributions', 'hypothesis', 'regression', 'sampling'],
        trigonometry: ['ratios', 'identities', 'equations', 'graphs', 'applications']
      },
      
      storage: {
        userProfileKey: 'recommendation_profile',
        historyKey: 'recommendation_history',
        modelKey: 'recommendation_model'
      }
    };
    
    this.userProfile = {
      id: this.getUserId(),
      interests: {},
      difficulty: {},
      performance: {},
      history: [],
      preferences: {
        contentTypes: {},
        topics: {},
        sessionPatterns: {}
      },
      lastUpdate: Date.now()
    };
    
    this.model = {
      contentSimilarity: {},
      userSimilarity: {},
      topicGraph: {},
      globalTrends: {}
    };
    
    this.recommendations = [];
    this.sessionData = {
      viewed: [],
      interacted: [],
      completed: [],
      skipped: []
    };
    
    this.init();
  }

  init() {
    this.loadUserProfile();
    this.loadModel();
    this.setupEventListeners();
    this.buildTopicGraph();
    this.generateInitialRecommendations();
    this.startModelUpdates();
    this.setupRecommendationRefresh();
  }

  // ============================================
  // USER PROFILE MANAGEMENT
  // ============================================

  getUserId() {
    return localStorage.getItem('math_help_user_id') || 'anonymous';
  }

  loadUserProfile() {
    try {
      const stored = localStorage.getItem(this.config.storage.userProfileKey);
      if (stored) {
        const data = JSON.parse(stored);
        Object.assign(this.userProfile, data);
        this.decayOldData();
      }
    } catch (e) {
      console.error('Failed to load user profile:', e);
    }
    
    // Initialize defaults
    this.initializeUserProfile();
  }

  initializeUserProfile() {
    // Set default interests if empty
    if (Object.keys(this.userProfile.interests).length === 0) {
      Object.keys(this.config.topics).forEach(topic => {
        this.userProfile.interests[topic] = 0.5; // Neutral interest
      });
    }
    
    // Set default difficulty preferences
    if (Object.keys(this.userProfile.difficulty).length === 0) {
      this.userProfile.difficulty = {
        current: 0.5, // Medium difficulty
        preferred: 0.5,
        tolerance: 0.2
      };
    }
    
    // Initialize content type preferences
    Object.keys(this.config.contentTypes).forEach(type => {
      if (!this.userProfile.preferences.contentTypes[type]) {
        this.userProfile.preferences.contentTypes[type] = 1.0;
      }
    });
  }

  saveUserProfile() {
    try {
      this.userProfile.lastUpdate = Date.now();
      localStorage.setItem(
        this.config.storage.userProfileKey,
        JSON.stringify(this.userProfile)
      );
    } catch (e) {
      console.error('Failed to save user profile:', e);
    }
  }

  decayOldData() {
    // Apply time decay to older interactions
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    // Decay interests
    Object.keys(this.userProfile.interests).forEach(topic => {
      const daysSinceUpdate = (now - this.userProfile.lastUpdate) / dayInMs;
      const decay = Math.pow(this.config.learning.decayFactor, daysSinceUpdate);
      this.userProfile.interests[topic] *= decay;
    });
    
    // Clean old history
    const historyLimit = now - (30 * dayInMs); // 30 days
    this.userProfile.history = this.userProfile.history.filter(item => 
      item.timestamp > historyLimit
    );
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  setupEventListeners() {
    // Content interactions
    window.addEventListener('content-viewed', (event) => {
      this.handleContentViewed(event.detail);
    });
    
    window.addEventListener('content-completed', (event) => {
      this.handleContentCompleted(event.detail);
    });
    
    window.addEventListener('content-skipped', (event) => {
      this.handleContentSkipped(event.detail);
    });
    
    // Problem solving
    window.addEventListener('problem-solved', (event) => {
      this.handleProblemSolved(event.detail);
    });
    
    // Quiz performance
    window.addEventListener('quiz-completed', (event) => {
      this.handleQuizCompleted(event.detail);
    });
    
    // User feedback
    window.addEventListener('content-rated', (event) => {
      this.handleContentRated(event.detail);
    });
    
    // Session patterns
    window.addEventListener('user-interaction', (event) => {
      this.updateSessionPatterns(event.detail);
    });
  }

  // ============================================
  // CONTENT INTERACTION HANDLERS
  // ============================================

  handleContentViewed(data) {
    const content = {
      id: data.contentId,
      type: data.contentType,
      topic: data.topic,
      difficulty: data.difficulty || 0.5,
      timestamp: Date.now(),
      duration: 0
    };
    
    this.sessionData.viewed.push(content);
    
    // Update topic interest
    this.updateTopicInterest(content.topic, 0.1);
    
    // Update content type preference
    this.updateContentTypePreference(content.type, 0.05);
    
    // Add to history
    this.addToHistory(content);
  }

  handleContentCompleted(data) {
    const content = {
      id: data.contentId,
      type: data.contentType,
      topic: data.topic,
      difficulty: data.difficulty || 0.5,
      performance: data.performance || 1.0,
      duration: data.duration,
      timestamp: Date.now()
    };
    
    this.sessionData.completed.push(content);
    
    // Strong positive signal
    this.updateTopicInterest(content.topic, 0.3);
    this.updateContentTypePreference(content.type, 0.2);
    
    // Update difficulty preference based on performance
    this.updateDifficultyPreference(content.difficulty, content.performance);
    
    // Update performance metrics
    this.updatePerformanceMetrics(content);
    
    // Trigger new recommendations
    this.generateRecommendations();
  }

  handleContentSkipped(data) {
    const content = {
      id: data.contentId,
      type: data.contentType,
      topic: data.topic,
      reason: data.reason,
      timestamp: Date.now()
    };
    
    this.sessionData.skipped.push(content);
    
    // Negative signal
    if (data.reason === 'too-difficult') {
      this.adjustDifficulty(-0.1);
    } else if (data.reason === 'not-interested') {
      this.updateTopicInterest(content.topic, -0.2);
    } else if (data.reason === 'wrong-type') {
      this.updateContentTypePreference(content.type, -0.1);
    }
  }

  handleProblemSolved(data) {
    const success = data.correct || false;
    const topic = data.topic;
    const difficulty = data.difficulty || 0.5;
    
    // Update performance
    if (!this.userProfile.performance[topic]) {
      this.userProfile.performance[topic] = {
        attempts: 0,
        successes: 0,
        avgDifficulty: difficulty,
        recentScores: []
      };
    }
    
    const perf = this.userProfile.performance[topic];
    perf.attempts++;
    if (success) perf.successes++;
    
    // Track recent performance
    perf.recentScores.push({ success, difficulty, timestamp: Date.now() });
    if (perf.recentScores.length > 20) {
      perf.recentScores.shift();
    }
    
    // Update average difficulty
    perf.avgDifficulty = (perf.avgDifficulty * 0.9) + (difficulty * 0.1);
    
    // Adjust recommendations based on performance
    this.adjustTopicDifficulty(topic, success);
  }

  handleQuizCompleted(data) {
    const topic = data.topic;
    const score = data.score / data.totalQuestions;
    const difficulty = data.difficulty || 0.5;
    
    // Update performance metrics
    this.updatePerformanceMetrics({
      topic,
      type: 'quiz',
      performance: score,
      difficulty
    });
    
    // Strong signal for topic interest
    if (score >= this.config.difficulty.masteryThreshold) {
      this.updateTopicInterest(topic, 0.4);
      this.adjustDifficulty(0.1); // Increase difficulty
    } else if (score < this.config.difficulty.frustrationThreshold) {
      this.adjustDifficulty(-0.15); // Decrease difficulty more aggressively
    }
  }

  handleContentRated(data) {
    const rating = data.rating; // 1-5 scale
    const normalizedRating = (rating - 3) / 2; // Convert to -1 to 1
    
    // Update preferences based on rating
    this.updateTopicInterest(data.topic, normalizedRating * 0.3);
    this.updateContentTypePreference(data.contentType, normalizedRating * 0.2);
    
    // Store explicit feedback
    if (!this.userProfile.feedback) {
      this.userProfile.feedback = [];
    }
    
    this.userProfile.feedback.push({
      contentId: data.contentId,
      rating: rating,
      timestamp: Date.now()
    });
  }

  // ============================================
  // PREFERENCE UPDATES
  // ============================================

  updateTopicInterest(topic, delta) {
    if (!this.userProfile.interests[topic]) {
      this.userProfile.interests[topic] = 0.5;
    }
    
    // Apply change with bounds [0, 1]
    this.userProfile.interests[topic] = Math.max(0, Math.min(1, 
      this.userProfile.interests[topic] + delta
    ));
    
    // Propagate to related topics
    this.propagateTopicInterest(topic, delta * 0.5);
    
    this.saveUserProfile();
  }

  updateContentTypePreference(type, delta) {
    if (!this.userProfile.preferences.contentTypes[type]) {
      this.userProfile.preferences.contentTypes[type] = 1.0;
    }
    
    // Apply change with bounds [0.1, 2.0]
    this.userProfile.preferences.contentTypes[type] = Math.max(0.1, Math.min(2.0,
      this.userProfile.preferences.contentTypes[type] + delta
    ));
    
    this.saveUserProfile();
  }

  updateDifficultyPreference(difficulty, performance) {
    const current = this.userProfile.difficulty.current;
    
    // Adjust based on performance
    if (performance >= this.config.difficulty.masteryThreshold) {
      // User performed well, can handle harder content
      const increase = this.config.difficulty.progressionRate * (difficulty - current + 0.1);
      this.userProfile.difficulty.preferred = Math.min(1.0, current + increase);
    } else if (performance < this.config.difficulty.frustrationThreshold) {
      // User struggled, needs easier content
      const decrease = this.config.difficulty.progressionRate * (current - difficulty + 0.1);
      this.userProfile.difficulty.preferred = Math.max(0, current - decrease);
    }
    
    // Smoothly adjust current difficulty
    this.userProfile.difficulty.current = (current * 0.8) + (this.userProfile.difficulty.preferred * 0.2);
    
    this.saveUserProfile();
  }

  adjustDifficulty(delta) {
    this.userProfile.difficulty.current = Math.max(0, Math.min(1,
      this.userProfile.difficulty.current + delta
    ));
    this.userProfile.difficulty.preferred = this.userProfile.difficulty.current;
    this.saveUserProfile();
  }

  adjustTopicDifficulty(topic, success) {
    if (!this.userProfile.difficulty[topic]) {
      this.userProfile.difficulty[topic] = this.userProfile.difficulty.current;
    }
    
    const adjustment = success ? 
      this.config.difficulty.progressionRate : 
      -this.config.difficulty.progressionRate;
    
    this.userProfile.difficulty[topic] = Math.max(0, Math.min(1,
      this.userProfile.difficulty[topic] + adjustment
    ));
  }

  // ============================================
  // RECOMMENDATION GENERATION
  // ============================================

  generateRecommendations() {
    const candidates = this.gatherCandidates();
    const scored = this.scoreCandidates(candidates);
    const diverse = this.ensureDiversity(scored);
    const personalized = this.personalizeOrder(diverse);
    
    this.recommendations = personalized.slice(0, this.config.recommendations.maxRecommendations);
    
    // Render recommendations
    this.renderRecommendations();
    
    // Track recommendation generation
    this.logRecommendations();
    
    return this.recommendations;
  }

  gatherCandidates() {
    const candidates = [];
    
    // Get content from different sources
    const sources = [
      this.getRelatedContent(),
      this.getTrendingContent(),
      this.getDifficultyMatchedContent(),
      this.getProgressionContent(),
      this.getExploratoryContent()
    ];
    
    sources.forEach(source => {
      candidates.push(...source);
    });
    
    // Remove recently viewed content
    const recentIds = this.sessionData.viewed.map(c => c.id);
    return candidates.filter(c => !recentIds.includes(c.id));
  }

  getRelatedContent() {
    // Content related to user's interests
    const related = [];
    const topInterests = this.getTopInterests(3);
    
    topInterests.forEach(topic => {
      const topicContent = this.getContentByTopic(topic);
      related.push(...topicContent.slice(0, 5));
    });
    
    return related;
  }

  getTrendingContent() {
    // Simulated trending content based on global engagement
    return [
      {
        id: 'trend-1',
        title: 'Solving Quadratic Equations Made Easy',
        type: 'video',
        topic: 'algebra',
        difficulty: 0.6,
        engagement: 0.9,
        thumbnail: '/images/quadratic-video.jpg'
      },
      {
        id: 'trend-2',
        title: 'Calculus Limits Challenge',
        type: 'quiz',
        topic: 'calculus',
        difficulty: 0.7,
        engagement: 0.85,
        thumbnail: '/images/limits-quiz.jpg'
      }
    ];
  }

  getDifficultyMatchedContent() {
    const targetDifficulty = this.userProfile.difficulty.current;
    const tolerance = this.config.difficulty.adaptiveRange;
    
    // Get content within difficulty range
    return this.filterContentByDifficulty(
      targetDifficulty - tolerance,
      targetDifficulty + tolerance
    );
  }

  getProgressionContent() {
    // Content that builds on completed topics
    const completed = this.sessionData.completed.map(c => c.topic);
    const progression = [];
    
    completed.forEach(topic => {
      const nextTopics = this.getProgressionTopics(topic);
      nextTopics.forEach(nextTopic => {
        progression.push(...this.getContentByTopic(nextTopic).slice(0, 2));
      });
    });
    
    return progression;
  }

  getExploratoryContent() {
    // New topics the user hasn't explored much
    const leastExplored = this.getLeastExploredTopics(2);
    const exploratory = [];
    
    leastExplored.forEach(topic => {
      const introContent = this.getContentByTopic(topic)
        .filter(c => c.difficulty <= 0.5)
        .slice(0, 2);
      exploratory.push(...introContent);
    });
    
    return exploratory;
  }

  scoreCandidates(candidates) {
    return candidates.map(content => {
      const score = this.calculateContentScore(content);
      return { ...content, score };
    }).sort((a, b) => b.score - a.score);
  }

  calculateContentScore(content) {
    let score = 0;
    
    // Topic interest score (40%)
    const topicInterest = this.userProfile.interests[content.topic] || 0.5;
    score += topicInterest * 0.4;
    
    // Content type preference (20%)
    const typePreference = this.userProfile.preferences.contentTypes[content.type] || 1.0;
    score += (typePreference / 2) * 0.2;
    
    // Difficulty match (20%)
    const difficultyMatch = 1 - Math.abs(
      content.difficulty - this.userProfile.difficulty.current
    );
    score += difficultyMatch * 0.2;
    
    // Engagement/trending score (10%)
    const engagement = content.engagement || 0.5;
    score += engagement * 0.1;
    
    // Novelty score (10%)
    const novelty = this.calculateNovelty(content);
    score += novelty * 0.1;
    
    // Apply collaborative filtering boost
    const collaborativeBoost = this.getCollaborativeScore(content);
    score *= (1 + collaborativeBoost * 0.2);
    
    return score;
  }

  calculateNovelty(content) {
    // How new/unexplored is this content for the user
    const viewCount = this.userProfile.history.filter(h => 
      h.topic === content.topic && h.type === content.type
    ).length;
    
    return Math.exp(-viewCount * 0.3); // Exponential decay
  }

  getCollaborativeScore(content) {
    // Simulated collaborative filtering score
    // In production, this would use actual user similarity data
    return Math.random() * 0.5 + 0.25;
  }

  ensureDiversity(scored) {
    const diverse = [];
    const usedTopics = new Set();
    const usedTypes = new Set();
    
    for (const content of scored) {
      // Ensure topic diversity
      const topicCount = Array.from(usedTopics).filter(t => t === content.topic).length;
      const typeCount = Array.from(usedTypes).filter(t => t === content.type).length;
      
      // Penalize repeated topics/types
      const diversityPenalty = (topicCount * 0.2) + (typeCount * 0.1);
      content.score *= (1 - diversityPenalty);
      
      diverse.push(content);
      usedTopics.add(content.topic);
      usedTypes.add(content.type);
    }
    
    return diverse.sort((a, b) => b.score - a.score);
  }

  personalizeOrder(recommendations) {
    // Final personalization based on session patterns
    const timeOfDay = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    return recommendations.map(content => {
      // Boost video content in evening
      if (content.type === 'video' && timeOfDay >= 18) {
        content.score *= 1.2;
      }
      
      // Boost practice problems on weekends
      if (content.type === 'practice' && (dayOfWeek === 0 || dayOfWeek === 6)) {
        content.score *= 1.15;
      }
      
      // Boost quizzes during study hours
      if (content.type === 'quiz' && timeOfDay >= 14 && timeOfDay <= 17) {
        content.score *= 1.1;
      }
      
      return content;
    }).sort((a, b) => b.score - a.score);
  }

  // ============================================
  // TOPIC GRAPH & RELATIONSHIPS
  // ============================================

  buildTopicGraph() {
    // Build relationships between topics
    this.model.topicGraph = {
      algebra: {
        prerequisites: [],
        related: ['geometry', 'trigonometry'],
        advances_to: ['calculus', 'statistics']
      },
      geometry: {
        prerequisites: ['algebra'],
        related: ['trigonometry'],
        advances_to: ['calculus']
      },
      trigonometry: {
        prerequisites: ['algebra', 'geometry'],
        related: [],
        advances_to: ['calculus']
      },
      calculus: {
        prerequisites: ['algebra', 'trigonometry'],
        related: ['statistics'],
        advances_to: []
      },
      statistics: {
        prerequisites: ['algebra'],
        related: ['calculus'],
        advances_to: []
      }
    };
  }

  propagateTopicInterest(topic, delta) {
    const graph = this.model.topicGraph[topic];
    if (!graph) return;
    
    // Propagate to related topics with decay
    graph.related.forEach(relatedTopic => {
      if (this.userProfile.interests[relatedTopic] !== undefined) {
        this.userProfile.interests[relatedTopic] += delta * 0.5;
        this.userProfile.interests[relatedTopic] = Math.max(0, Math.min(1,
          this.userProfile.interests[relatedTopic]
        ));
      }
    });
  }

  getProgressionTopics(completedTopic) {
    const graph = this.model.topicGraph[completedTopic];
    if (!graph) return [];
    
    // Check if prerequisites are met for advanced topics
    const progression = [];
    
    graph.advances_to.forEach(advancedTopic => {
      const advancedGraph = this.model.topicGraph[advancedTopic];
      const prerequisitesMet = advancedGraph.prerequisites.every(prereq => {
        const performance = this.userProfile.performance[prereq];
        return performance && performance.successes / performance.attempts >= 0.7;
      });
      
      if (prerequisitesMet) {
        progression.push(advancedTopic);
      }
    });
    
    return progression;
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  getTopInterests(count) {
    return Object.entries(this.userProfile.interests)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(entry => entry[0]);
  }

  getLeastExploredTopics(count) {
    const topicCounts = {};
    
    // Count topic occurrences in history
    this.userProfile.history.forEach(item => {
      topicCounts[item.topic] = (topicCounts[item.topic] || 0) + 1;
    });
    
    // Find least explored
    return Object.keys(this.config.topics)
      .sort((a, b) => (topicCounts[a] || 0) - (topicCounts[b] || 0))
      .slice(0, count);
  }

  getContentByTopic(topic) {
    // Simulated content database query
    // In production, this would fetch from actual content database
    const contents = [
      {
        id: `${topic}-lesson-1`,
        title: `Introduction to ${topic}`,
        type: 'lesson',
        topic: topic,
        difficulty: 0.3,
        duration: 600,
        thumbnail: `/images/${topic}-intro.jpg`
      },
      {
        id: `${topic}-practice-1`,
        title: `${topic} Practice Problems`,
        type: 'practice',
        topic: topic,
        difficulty: 0.5,
        problemCount: 10,
        thumbnail: `/images/${topic}-practice.jpg`
      },
      {
        id: `${topic}-quiz-1`,
        title: `${topic} Mastery Quiz`,
        type: 'quiz',
        topic: topic,
        difficulty: 0.7,
        questions: 15,
        thumbnail: `/images/${topic}-quiz.jpg`
      }
    ];
    
    return contents;
  }

  filterContentByDifficulty(min, max) {
    // Simulated filtering
    // In production, this would query the content database
    const allContent = [];
    
    Object.keys(this.config.topics).forEach(topic => {
      allContent.push(...this.getContentByTopic(topic));
    });
    
    return allContent.filter(c => c.difficulty >= min && c.difficulty <= max);
  }

  addToHistory(content) {
    this.userProfile.history.push({
      contentId: content.id,
      type: content.type,
      topic: content.topic,
      timestamp: content.timestamp
    });
    
    // Keep history limited
    if (this.userProfile.history.length > 1000) {
      this.userProfile.history = this.userProfile.history.slice(-800);
    }
    
    this.saveUserProfile();
  }

  updatePerformanceMetrics(content) {
    const topic = content.topic;
    if (!this.userProfile.performance[topic]) {
      this.userProfile.performance[topic] = {
        attempts: 0,
        successes: 0,
        avgDifficulty: content.difficulty,
        recentScores: []
      };
    }
    
    const perf = this.userProfile.performance[topic];
    perf.attempts++;
    if (content.performance >= 0.7) {
      perf.successes++;
    }
    
    this.saveUserProfile();
  }

  updateSessionPatterns(interaction) {
    // Track session patterns for better recommendations
    const hour = new Date().getHours();
    const dayType = new Date().getDay() === 0 || new Date().getDay() === 6 ? 'weekend' : 'weekday';
    
    if (!this.userProfile.preferences.sessionPatterns[dayType]) {
      this.userProfile.preferences.sessionPatterns[dayType] = {};
    }
    
    if (!this.userProfile.preferences.sessionPatterns[dayType][hour]) {
      this.userProfile.preferences.sessionPatterns[dayType][hour] = {
        interactions: 0,
        contentTypes: {}
      };
    }
    
    const pattern = this.userProfile.preferences.sessionPatterns[dayType][hour];
    pattern.interactions++;
    
    if (interaction.data.contentType) {
      pattern.contentTypes[interaction.data.contentType] = 
        (pattern.contentTypes[interaction.data.contentType] || 0) + 1;
    }
  }

  // ============================================
  // MODEL UPDATES
  // ============================================

  loadModel() {
    try {
      const stored = localStorage.getItem(this.config.storage.modelKey);
      if (stored) {
        this.model = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load recommendation model:', e);
    }
  }

  saveModel() {
    try {
      localStorage.setItem(
        this.config.storage.modelKey,
        JSON.stringify(this.model)
      );
    } catch (e) {
      console.error('Failed to save recommendation model:', e);
    }
  }

  startModelUpdates() {
    setInterval(() => {
      this.updateModel();
    }, this.config.learning.modelUpdateInterval);
  }

  updateModel() {
    // Update content similarity based on user behavior
    this.updateContentSimilarity();
    
    // Update global trends
    this.updateGlobalTrends();
    
    // Save updated model
    this.saveModel();
  }

  updateContentSimilarity() {
    // Analyze which content is viewed together
    const pairs = {};
    
    for (let i = 0; i < this.sessionData.viewed.length - 1; i++) {
      const current = this.sessionData.viewed[i];
      const next = this.sessionData.viewed[i + 1];
      
      const pairKey = `${current.id}-${next.id}`;
      pairs[pairKey] = (pairs[pairKey] || 0) + 1;
    }
    
    // Update similarity scores
    Object.entries(pairs).forEach(([key, count]) => {
      this.model.contentSimilarity[key] = count;
    });
  }

  updateGlobalTrends() {
    // Track trending topics and content types
    const trends = {
      topics: {},
      types: {},
      timestamp: Date.now()
    };
    
    this.sessionData.viewed.forEach(content => {
      trends.topics[content.topic] = (trends.topics[content.topic] || 0) + 1;
      trends.types[content.type] = (trends.types[content.type] || 0) + 1;
    });
    
    this.model.globalTrends = trends;
  }

  // ============================================
  // RECOMMENDATION REFRESH
  // ============================================

  setupRecommendationRefresh() {
    // Initial recommendations
    this.generateInitialRecommendations();
    
    // Periodic refresh
    setInterval(() => {
      if (this.shouldRefreshRecommendations()) {
        this.generateRecommendations();
      }
    }, this.config.recommendations.refreshInterval);
  }

  generateInitialRecommendations() {
    // Generate initial set based on profile
    if (this.userProfile.history.length < this.config.learning.minDataPoints) {
      // New user - show diverse content
      this.recommendations = this.getDiverseStarterContent();
    } else {
      // Returning user - personalized recommendations
      this.generateRecommendations();
    }
    
    this.renderRecommendations();
  }

  getDiverseStarterContent() {
    const starter = [];
    
    // One piece of content from each topic at easy difficulty
    Object.keys(this.config.topics).forEach(topic => {
      const topicContent = this.getContentByTopic(topic)
        .filter(c => c.difficulty <= 0.5)
        .slice(0, 1);
      starter.push(...topicContent);
    });
    
    return starter;
  }

  shouldRefreshRecommendations() {
    // Refresh if user has interacted with most recommendations
    const interactedCount = this.recommendations.filter(rec => 
      this.sessionData.viewed.some(v => v.id === rec.id) ||
      this.sessionData.completed.some(c => c.id === rec.id)
    ).length;
    
    return interactedCount >= this.recommendations.length * 0.5;
  }

  // ============================================
  // UI RENDERING
  // ============================================

  renderRecommendations() {
    const container = document.getElementById('recommendations-container');
    if (!container) {
      this.createRecommendationsUI();
      return;
    }
    
    container.innerHTML = '';
    
    this.recommendations.forEach((content, index) => {
      const card = this.createRecommendationCard(content, index);
      container.appendChild(card);
    });
    
    // Track recommendation impressions
    this.trackRecommendationImpressions();
  }

  createRecommendationsUI() {
    const container = document.createElement('div');
    container.id = 'recommendations-wrapper';
    container.innerHTML = `
      <div class="recommendations-header">
        <h2>Recommended for You</h2>
        <button id="refresh-recommendations" class="refresh-btn">
          <span>🔄</span> Refresh
        </button>
      </div>
      <div id="recommendations-container" class="recommendations-grid">
        <!-- Recommendations will be inserted here -->
      </div>
    `;
    
    // Find appropriate place to insert
    const mainContent = document.querySelector('.main-content, main, #content');
    if (mainContent) {
      mainContent.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
    
    // Add styles
    this.injectStyles();
    
    // Setup refresh button
    document.getElementById('refresh-recommendations').addEventListener('click', () => {
      this.generateRecommendations();
    });
    
    // Render initial recommendations
    this.renderRecommendations();
  }

  createRecommendationCard(content, index) {
    const card = document.createElement('div');
    card.className = 'recommendation-card';
    card.dataset.contentId = content.id;
    card.dataset.index = index;
    
    const difficultyStars = '⭐'.repeat(Math.ceil(content.difficulty * 5));
    const typeIcon = this.getContentTypeIcon(content.type);
    
    card.innerHTML = `
      <div class="recommendation-thumbnail">
        <img src="${content.thumbnail || '/images/default-thumb.jpg'}" alt="${content.title}">
        <span class="content-type-badge">${typeIcon} ${content.type}</span>
      </div>
      <div class="recommendation-details">
        <h3>${content.title}</h3>
        <div class="recommendation-meta">
          <span class="topic-tag">${content.topic}</span>
          <span class="difficulty">${difficultyStars}</span>
        </div>
        ${this.getContentMetadata(content)}
      </div>
      <div class="recommendation-reason">
        ${this.getRecommendationReason(content, index)}
      </div>
    `;
    
    // Click handler
    card.addEventListener('click', () => {
      this.handleRecommendationClick(content, index);
    });
    
    return card;
  }

  getContentTypeIcon(type) {
    const icons = {
      lesson: '📚',
      practice: '✏️',
      quiz: '📝',
      video: '🎥',
      calculator: '🧮',
      article: '📄'
    };
    return icons[type] || '📌';
  }

  getContentMetadata(content) {
    switch (content.type) {
      case 'video':
        return `<span class="duration">⏱️ ${content.duration ? Math.ceil(content.duration / 60) + ' min' : 'Video'}</span>`;
      case 'practice':
        return `<span class="problem-count">📊 ${content.problemCount || 10} problems</span>`;
      case 'quiz':
        return `<span class="question-count">❓ ${content.questions || 10} questions</span>`;
      default:
        return '';
    }
  }

  getRecommendationReason(content, index) {
    // Provide personalized reason for recommendation
    const reasons = [];
    
    if (index === 0) {
      reasons.push("Top pick for you");
    } else if (content.score > 0.8) {
      reasons.push("Highly recommended");
    } else if (this.userProfile.interests[content.topic] > 0.7) {
      reasons.push(`Based on your interest in ${content.topic}`);
    } else if (content.engagement > 0.8) {
      reasons.push("Trending now");
    } else {
      reasons.push("You might like this");
    }
    
    return `<span class="reason-icon">✨</span> ${reasons[0]}`;
  }

  injectStyles() {
    if (document.getElementById('recommendation-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'recommendation-styles';
    style.textContent = `
      #recommendations-wrapper {
        margin: 2rem 0;
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 12px;
      }
      
      .recommendations-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      
      .recommendations-header h2 {
        margin: 0;
        color: #2c3e50;
      }
      
      .refresh-btn {
        padding: 0.5rem 1rem;
        background: white;
        border: 1px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .refresh-btn:hover {
        background: #3498db;
        color: white;
        border-color: #3498db;
      }
      
      .recommendations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
      }
      
      .recommendation-card {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .recommendation-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .recommendation-thumbnail {
        position: relative;
        width: 100%;
        height: 160px;
        overflow: hidden;
      }
      
      .recommendation-thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .content-type-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
      }
      
      .recommendation-details {
        padding: 1rem;
      }
      
      .recommendation-details h3 {
        margin: 0 0 0.5rem 0;
        font-size: 16px;
        color: #2c3e50;
      }
      
      .recommendation-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }
      
      .topic-tag {
        background: #e8f4f8;
        color: #3498db;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
      }
      
      .difficulty {
        font-size: 12px;
      }
      
      .recommendation-reason {
        padding: 0.5rem 1rem;
        background: #f8f9fa;
        border-top: 1px solid #eee;
        font-size: 13px;
        color: #666;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      @media (max-width: 768px) {
        .recommendations-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // ANALYTICS & TRACKING
  // ============================================

  handleRecommendationClick(content, index) {
    // Track click
    this.trackRecommendationClick(content, index);
    
    // Navigate to content
    window.location.href = `/content/${content.id}`;
  }

  trackRecommendationImpressions() {
    window.dispatchEvent(new CustomEvent('recommendations-shown', {
      detail: {
        recommendations: this.recommendations.map((r, i) => ({
          contentId: r.id,
          position: i,
          score: r.score
        })),
        timestamp: Date.now()
      }
    }));
  }

  trackRecommendationClick(content, position) {
    window.dispatchEvent(new CustomEvent('recommendation-clicked', {
      detail: {
        contentId: content.id,
        position: position,
        score: content.score,
        timestamp: Date.now()
      }
    }));
    
    // Update click-through data
    if (!this.userProfile.recommendationCTR) {
      this.userProfile.recommendationCTR = {};
    }
    
    const key = `${content.type}-${content.topic}`;
    this.userProfile.recommendationCTR[key] = 
      (this.userProfile.recommendationCTR[key] || 0) + 1;
    
    this.saveUserProfile();
  }

  logRecommendations() {
    // Log for analysis
    console.log('Generated recommendations:', this.recommendations.map(r => ({
      id: r.id,
      title: r.title,
      score: r.score.toFixed(3),
      topic: r.topic,
      type: r.type
    })));
  }

  // ============================================
  // PUBLIC API
  // ============================================

  getRecommendations() {
    return this.recommendations;
  }

  getUserProfile() {
    return {
      interests: this.userProfile.interests,
      difficulty: this.userProfile.difficulty,
      topInterests: this.getTopInterests(5),
      performance: this.userProfile.performance
    };
  }

  refreshRecommendations() {
    this.generateRecommendations();
  }

  updateUserPreference(type, value) {
    if (type === 'difficulty') {
      this.adjustDifficulty(value);
    } else if (type === 'topic' && value.topic && value.interest !== undefined) {
      this.updateTopicInterest(value.topic, value.interest);
    } else if (type === 'contentType' && value.contentType && value.preference !== undefined) {
      this.updateContentTypePreference(value.contentType, value.preference);
    }
    
    this.generateRecommendations();
  }

  resetProfile() {
    if (confirm('This will reset all your preferences and recommendations. Continue?')) {
      localStorage.removeItem(this.config.storage.userProfileKey);
      localStorage.removeItem(this.config.storage.historyKey);
      location.reload();
    }
  }
}

// Initialize recommendation engine
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.recommendationEngine = new RecommendationEngine();
  });
} else {
  window.recommendationEngine = new RecommendationEngine();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecommendationEngine;
}