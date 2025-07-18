// Educational A/B Testing Framework
// Inspired by UpGrade (Gates Foundation) - Addresses unique educational testing challenges

class EducationalABFramework {
  constructor(config = {}) {
    this.config = {
      // Core configuration
      apiEndpoint: config.apiEndpoint || '/api/experiments/',
      userId: config.userId || this.generateUserId(),
      classroomId: config.classroomId || null,
      schoolId: config.schoolId || null,
      gradeLevel: config.gradeLevel || null,
      
      // Testing parameters
      minSampleSize: config.minSampleSize || 100,
      confidenceLevel: config.confidenceLevel || 0.95,
      minimumDetectableEffect: config.minimumDetectableEffect || 0.05,
      
      // Educational specific
      clusterRandomization: config.clusterRandomization !== false,
      balanceAcrossClasses: config.balanceAcrossClasses !== false,
      ensureMinimumLearning: config.ensureMinimumLearning !== false,
      
      // Ethical safeguards
      allowOptOut: config.allowOptOut !== false,
      parentalConsent: config.parentalConsent || false,
      maxExperimentDuration: config.maxExperimentDuration || 90, // days
      
      // Storage
      storage: config.storage || 'localStorage',
      cookieExpiry: config.cookieExpiry || 365 // days
    };
    
    this.experiments = new Map();
    this.metrics = new Map();
    this.assignments = new Map();
    this.learningOutcomes = new Map();
    
    this.init();
  }

  async init() {
    // Load existing assignments
    this.loadAssignments();
    
    // Fetch active experiments
    await this.fetchActiveExperiments();
    
    // Initialize metrics collection
    this.initializeMetrics();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Check for expired experiments
    this.checkExpiredExperiments();
  }

  // ============================================
  // EXPERIMENT MANAGEMENT
  // ============================================

  async fetchActiveExperiments() {
    try {
      const response = await fetch(`${this.config.apiEndpoint}active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const experiments = await response.json();
        experiments.forEach(exp => {
          this.experiments.set(exp.id, new EducationalExperiment(exp));
        });
      }
    } catch (error) {
      console.error('Failed to fetch experiments:', error);
      // Use local fallback experiments
      this.loadLocalExperiments();
    }
  }

  loadLocalExperiments() {
    // Default experiments for offline/fallback operation
    const defaultExperiments = [
      {
        id: 'onboarding_flow',
        name: 'Onboarding Flow Optimization',
        type: 'multivariate',
        status: 'active',
        variants: [
          { id: 'control', name: 'Traditional', weight: 0.5 },
          { id: 'guided', name: 'Guided Tour', weight: 0.25 },
          { id: 'interactive', name: 'Interactive Tutorial', weight: 0.25 }
        ],
        metrics: ['signup_rate', 'completion_rate', 'time_to_first_problem'],
        clustering: 'individual'
      },
      {
        id: 'problem_difficulty',
        name: 'Adaptive Difficulty Testing',
        type: 'factorial',
        status: 'active',
        factors: {
          'initial_difficulty': ['easy', 'medium', 'adaptive'],
          'progression_speed': ['slow', 'moderate', 'fast']
        },
        metrics: ['problem_completion', 'learning_gain', 'frustration_events'],
        clustering: 'classroom'
      },
      {
        id: 'gamification_elements',
        name: 'Gamification Impact Study',
        type: 'sequential',
        status: 'active',
        phases: [
          { id: 'baseline', duration: 14 },
          { id: 'badges', duration: 14 },
          { id: 'leaderboard', duration: 14 },
          { id: 'full_gamification', duration: 14 }
        ],
        metrics: ['engagement_time', 'problems_solved', 'return_rate', 'learning_velocity'],
        clustering: 'school'
      }
    ];
    
    defaultExperiments.forEach(exp => {
      this.experiments.set(exp.id, new EducationalExperiment(exp));
    });
  }

  // ============================================
  // ASSIGNMENT & RANDOMIZATION
  // ============================================

  getVariant(experimentId, context = {}) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'active') {
      return { variant: 'control', assigned: false };
    }
    
    // Check existing assignment
    const existingAssignment = this.getExistingAssignment(experimentId);
    if (existingAssignment) {
      return existingAssignment;
    }
    
    // Determine assignment level
    const assignmentLevel = this.determineAssignmentLevel(experiment, context);
    
    // Perform assignment based on clustering
    let variant;
    switch (assignmentLevel) {
      case 'school':
        variant = this.assignSchoolLevel(experiment, context);
        break;
      case 'classroom':
        variant = this.assignClassroomLevel(experiment, context);
        break;
      case 'individual':
      default:
        variant = this.assignIndividualLevel(experiment, context);
    }
    
    // Store assignment
    this.storeAssignment(experimentId, variant, assignmentLevel);
    
    // Track assignment event
    this.trackEvent('experiment_assigned', {
      experiment_id: experimentId,
      variant: variant.id,
      assignment_level: assignmentLevel,
      ...context
    });
    
    return { variant: variant.id, assigned: true, details: variant };
  }

  determineAssignmentLevel(experiment, context) {
    if (!this.config.clusterRandomization) {
      return 'individual';
    }
    
    // Check experiment clustering configuration
    if (experiment.clustering) {
      return experiment.clustering;
    }
    
    // Determine based on context
    if (context.schoolId && experiment.requiresSchoolClustering) {
      return 'school';
    }
    
    if (context.classroomId && this.config.balanceAcrossClasses) {
      return 'classroom';
    }
    
    return 'individual';
  }

  assignSchoolLevel(experiment, context) {
    const schoolId = context.schoolId || this.config.schoolId;
    if (!schoolId) {
      return this.assignIndividualLevel(experiment, context);
    }
    
    // Use school ID as randomization unit
    const hash = this.hashString(`${experiment.id}-${schoolId}`);
    return this.selectVariantByHash(experiment, hash);
  }

  assignClassroomLevel(experiment, context) {
    const classroomId = context.classroomId || this.config.classroomId;
    if (!classroomId) {
      return this.assignIndividualLevel(experiment, context);
    }
    
    // Check classroom balance
    const classroomAssignments = this.getClassroomAssignments(experiment.id, classroomId);
    
    if (this.config.balanceAcrossClasses) {
      return this.balancedAssignment(experiment, classroomAssignments);
    }
    
    // Use classroom ID as randomization unit
    const hash = this.hashString(`${experiment.id}-${classroomId}`);
    return this.selectVariantByHash(experiment, hash);
  }

  assignIndividualLevel(experiment, context) {
    const userId = context.userId || this.config.userId;
    
    // Check user eligibility
    if (!this.isUserEligible(experiment, context)) {
      return experiment.getControlVariant();
    }
    
    // Random assignment
    const hash = this.hashString(`${experiment.id}-${userId}`);
    return this.selectVariantByHash(experiment, hash);
  }

  balancedAssignment(experiment, existingAssignments) {
    const variantCounts = new Map();
    
    // Count existing assignments
    experiment.variants.forEach(v => variantCounts.set(v.id, 0));
    existingAssignments.forEach(assignment => {
      const count = variantCounts.get(assignment.variant) || 0;
      variantCounts.set(assignment.variant, count + 1);
    });
    
    // Find least assigned variant
    let minCount = Infinity;
    let selectedVariant = null;
    
    experiment.variants.forEach(variant => {
      const count = variantCounts.get(variant.id);
      if (count < minCount) {
        minCount = count;
        selectedVariant = variant;
      }
    });
    
    return selectedVariant || experiment.getControlVariant();
  }

  selectVariantByHash(experiment, hash) {
    const normalizedHash = hash / 0xFFFFFFFF;
    let cumulative = 0;
    
    for (const variant of experiment.variants) {
      cumulative += variant.weight;
      if (normalizedHash <= cumulative) {
        return variant;
      }
    }
    
    return experiment.variants[experiment.variants.length - 1];
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // ============================================
  // METRICS & TRACKING
  // ============================================

  initializeMetrics() {
    // Educational engagement metrics
    this.registerMetric('engagement_time', {
      type: 'continuous',
      unit: 'seconds',
      aggregation: 'mean',
      minimumSampleSize: 50
    });
    
    this.registerMetric('problems_solved', {
      type: 'count',
      unit: 'problems',
      aggregation: 'sum',
      normalizeBy: 'session_count'
    });
    
    this.registerMetric('problem_completion', {
      type: 'rate',
      unit: 'percentage',
      aggregation: 'mean',
      minimumSampleSize: 100
    });
    
    // Learning effectiveness metrics
    this.registerMetric('learning_gain', {
      type: 'continuous',
      unit: 'points',
      aggregation: 'mean',
      requiresPrePost: true,
      minimumDuration: 7 // days
    });
    
    this.registerMetric('concept_mastery', {
      type: 'binary',
      unit: 'boolean',
      aggregation: 'proportion',
      threshold: 0.8 // 80% correct
    });
    
    this.registerMetric('learning_velocity', {
      type: 'rate',
      unit: 'concepts_per_hour',
      aggregation: 'median',
      outlierRemoval: true
    });
    
    // Retention metrics
    this.registerMetric('return_rate', {
      type: 'binary',
      unit: 'boolean',
      aggregation: 'proportion',
      window: 7 // days
    });
    
    this.registerMetric('session_frequency', {
      type: 'count',
      unit: 'sessions_per_week',
      aggregation: 'mean',
      minimumDuration: 14 // days
    });
    
    // Conversion metrics
    this.registerMetric('signup_rate', {
      type: 'binary',
      unit: 'boolean',
      aggregation: 'proportion',
      goal: 0.25 // 25% target
    });
    
    this.registerMetric('demo_request_rate', {
      type: 'binary',
      unit: 'boolean',
      aggregation: 'proportion',
      goal: 0.15 // 15% target
    });
    
    this.registerMetric('premium_conversion', {
      type: 'binary',
      unit: 'boolean',
      aggregation: 'proportion',
      revenueImpact: true,
      goal: 0.10 // 10% target
    });
    
    // User experience metrics
    this.registerMetric('frustration_events', {
      type: 'count',
      unit: 'events',
      aggregation: 'sum',
      inverse: true, // Lower is better
      threshold: 3 // Max acceptable per session
    });
    
    this.registerMetric('help_requests', {
      type: 'count',
      unit: 'requests',
      aggregation: 'mean',
      contextual: true
    });
    
    this.registerMetric('time_to_first_success', {
      type: 'duration',
      unit: 'seconds',
      aggregation: 'median',
      inverse: true // Lower is better
    });
  }

  registerMetric(name, config) {
    this.metrics.set(name, {
      name,
      ...config,
      data: new Map(),
      summary: null,
      lastUpdated: null
    });
  }

  trackEvent(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        session_id: this.getSessionId(),
        user_id: this.config.userId,
        classroom_id: this.config.classroomId,
        school_id: this.config.schoolId,
        grade_level: this.config.gradeLevel
      }
    };
    
    // Process event for metrics
    this.processEventForMetrics(event);
    
    // Store event
    this.storeEvent(event);
    
    // Send to analytics
    this.sendToAnalytics(event);
  }

  processEventForMetrics(event) {
    // Map events to metrics
    const metricMappings = {
      'problem_started': ['engagement_time'],
      'problem_completed': ['problems_solved', 'problem_completion', 'learning_velocity'],
      'problem_abandoned': ['frustration_events', 'problem_completion'],
      'concept_mastered': ['concept_mastery', 'learning_gain'],
      'session_start': ['return_rate', 'session_frequency'],
      'signup_completed': ['signup_rate'],
      'demo_requested': ['demo_request_rate'],
      'premium_purchased': ['premium_conversion'],
      'help_clicked': ['help_requests'],
      'first_problem_solved': ['time_to_first_success']
    };
    
    const relevantMetrics = metricMappings[event.name] || [];
    
    relevantMetrics.forEach(metricName => {
      const metric = this.metrics.get(metricName);
      if (metric) {
        this.updateMetric(metric, event);
      }
    });
  }

  updateMetric(metric, event) {
    const experimentAssignments = this.getActiveAssignments();
    
    experimentAssignments.forEach(assignment => {
      const key = `${assignment.experimentId}-${assignment.variant}`;
      
      if (!metric.data.has(key)) {
        metric.data.set(key, {
          values: [],
          count: 0,
          sum: 0,
          conversions: 0,
          sessions: new Set()
        });
      }
      
      const data = metric.data.get(key);
      
      switch (metric.type) {
        case 'continuous':
          const value = event.properties[metric.name] || 0;
          data.values.push(value);
          data.sum += value;
          data.count++;
          break;
          
        case 'count':
          data.count++;
          data.sessions.add(event.properties.session_id);
          break;
          
        case 'binary':
          data.count++;
          if (event.properties.converted || event.properties.success) {
            data.conversions++;
          }
          break;
          
        case 'rate':
          const numerator = event.properties.numerator || (event.properties.success ? 1 : 0);
          const denominator = event.properties.denominator || 1;
          data.values.push(numerator / denominator);
          data.count++;
          break;
          
        case 'duration':
          const duration = event.properties.duration || 
                          (event.properties.end_time - event.properties.start_time);
          if (duration) {
            data.values.push(duration);
            data.count++;
          }
          break;
      }
      
      metric.lastUpdated = Date.now();
    });
  }

  // ============================================
  // STATISTICAL ANALYSIS
  // ============================================

  analyzeExperiment(experimentId, options = {}) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;
    
    const analysis = {
      experiment_id: experimentId,
      experiment_name: experiment.name,
      status: experiment.status,
      start_date: experiment.startDate,
      current_date: Date.now(),
      duration_days: Math.floor((Date.now() - experiment.startDate) / (1000 * 60 * 60 * 24)),
      total_participants: this.getParticipantCount(experimentId),
      variants: {},
      metrics: {},
      recommendations: []
    };
    
    // Analyze each variant
    experiment.variants.forEach(variant => {
      analysis.variants[variant.id] = {
        name: variant.name,
        participants: this.getVariantParticipants(experimentId, variant.id),
        weight: variant.weight
      };
    });
    
    // Analyze each metric
    experiment.metrics.forEach(metricName => {
      const metric = this.metrics.get(metricName);
      if (!metric) return;
      
      const metricAnalysis = this.analyzeMetric(experimentId, metric, options);
      analysis.metrics[metricName] = metricAnalysis;
    });
    
    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);
    
    // Check for statistical significance
    analysis.winner = this.determineWinner(analysis);
    
    return analysis;
  }

  analyzeMetric(experimentId, metric, options) {
    const analysis = {
      name: metric.name,
      type: metric.type,
      variants: {}
    };
    
    const controlKey = `${experimentId}-control`;
    const controlData = metric.data.get(controlKey);
    
    if (!controlData) return analysis;
    
    // Calculate control statistics
    const controlStats = this.calculateStatistics(controlData, metric);
    analysis.variants['control'] = controlStats;
    
    // Calculate treatment statistics
    const experiment = this.experiments.get(experimentId);
    experiment.variants.forEach(variant => {
      if (variant.id === 'control') return;
      
      const variantKey = `${experimentId}-${variant.id}`;
      const variantData = metric.data.get(variantKey);
      
      if (variantData) {
        const variantStats = this.calculateStatistics(variantData, metric);
        
        // Calculate relative improvement
        variantStats.improvement = this.calculateImprovement(
          controlStats.value,
          variantStats.value,
          metric.inverse
        );
        
        // Perform statistical test
        variantStats.significance = this.performStatisticalTest(
          controlData,
          variantData,
          metric,
          options
        );
        
        analysis.variants[variant.id] = variantStats;
      }
    });
    
    return analysis;
  }

  calculateStatistics(data, metric) {
    const stats = {
      sample_size: data.count,
      sessions: data.sessions ? data.sessions.size : data.count
    };
    
    switch (metric.type) {
      case 'continuous':
      case 'rate':
      case 'duration':
        stats.value = data.values.length > 0 ? 
          data.values.reduce((a, b) => a + b, 0) / data.values.length : 0;
        stats.std_dev = this.calculateStandardDeviation(data.values);
        stats.std_error = stats.std_dev / Math.sqrt(data.values.length);
        stats.confidence_interval = this.calculateConfidenceInterval(
          stats.value,
          stats.std_error
        );
        break;
        
      case 'count':
        stats.value = metric.normalizeBy === 'session_count' && data.sessions.size > 0 ?
          data.count / data.sessions.size : data.count;
        break;
        
      case 'binary':
        stats.value = data.count > 0 ? data.conversions / data.count : 0;
        stats.std_error = Math.sqrt(
          (stats.value * (1 - stats.value)) / data.count
        );
        stats.confidence_interval = this.calculateConfidenceInterval(
          stats.value,
          stats.std_error
        );
        break;
    }
    
    return stats;
  }

  performStatisticalTest(controlData, treatmentData, metric, options) {
    const minSampleSize = options.minSampleSize || 
                         metric.minimumSampleSize || 
                         this.config.minSampleSize;
    
    // Check sample size requirements
    if (controlData.count < minSampleSize || treatmentData.count < minSampleSize) {
      return {
        significant: false,
        p_value: null,
        confidence: null,
        reason: 'insufficient_sample_size',
        required_sample_size: minSampleSize
      };
    }
    
    let pValue;
    
    switch (metric.type) {
      case 'binary':
        pValue = this.proportionZTest(
          controlData.conversions,
          controlData.count,
          treatmentData.conversions,
          treatmentData.count
        );
        break;
        
      case 'continuous':
      case 'rate':
      case 'duration':
        pValue = this.tTest(
          controlData.values,
          treatmentData.values
        );
        break;
        
      case 'count':
        pValue = this.poissonTest(
          controlData.count,
          treatmentData.count,
          controlData.sessions?.size || 1,
          treatmentData.sessions?.size || 1
        );
        break;
    }
    
    const confidence = 1 - pValue;
    const significant = pValue < (1 - this.config.confidenceLevel);
    
    return {
      significant,
      p_value: pValue,
      confidence,
      confidence_level: this.config.confidenceLevel
    };
  }

  proportionZTest(successes1, trials1, successes2, trials2) {
    const p1 = successes1 / trials1;
    const p2 = successes2 / trials2;
    const pPooled = (successes1 + successes2) / (trials1 + trials2);
    
    const se = Math.sqrt(
      pPooled * (1 - pPooled) * (1/trials1 + 1/trials2)
    );
    
    const z = Math.abs(p1 - p2) / se;
    
    // Two-tailed test
    return 2 * (1 - this.normalCDF(z));
  }

  tTest(values1, values2) {
    const n1 = values1.length;
    const n2 = values2.length;
    
    const mean1 = values1.reduce((a, b) => a + b, 0) / n1;
    const mean2 = values2.reduce((a, b) => a + b, 0) / n2;
    
    const var1 = values1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0) / (n1 - 1);
    const var2 = values2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0) / (n2 - 1);
    
    const se = Math.sqrt(var1/n1 + var2/n2);
    const t = Math.abs(mean1 - mean2) / se;
    const df = n1 + n2 - 2;
    
    // Approximate p-value using normal distribution for large samples
    if (df > 30) {
      return 2 * (1 - this.normalCDF(t));
    }
    
    // Use t-distribution for small samples
    return 2 * (1 - this.tCDF(t, df));
  }

  poissonTest(count1, count2, exposure1, exposure2) {
    const rate1 = count1 / exposure1;
    const rate2 = count2 / exposure2;
    
    const rateRatio = rate2 / rate1;
    const logRateRatio = Math.log(rateRatio);
    
    const se = Math.sqrt(1/count1 + 1/count2);
    const z = Math.abs(logRateRatio) / se;
    
    return 2 * (1 - this.normalCDF(z));
  }

  // ============================================
  // EDUCATIONAL SPECIFIC FEATURES
  // ============================================

  trackLearningOutcome(userId, conceptId, score, context = {}) {
    const outcome = {
      user_id: userId,
      concept_id: conceptId,
      score: score,
      timestamp: Date.now(),
      ...context
    };
    
    // Store for long-term analysis
    if (!this.learningOutcomes.has(userId)) {
      this.learningOutcomes.set(userId, []);
    }
    this.learningOutcomes.get(userId).push(outcome);
    
    // Check for concept mastery
    const mastery = this.checkConceptMastery(userId, conceptId);
    if (mastery.achieved) {
      this.trackEvent('concept_mastered', {
        concept_id: conceptId,
        attempts: mastery.attempts,
        time_to_mastery: mastery.timeToMastery
      });
    }
    
    // Calculate learning gain if applicable
    this.calculateLearningGain(userId, conceptId);
  }

  checkConceptMastery(userId, conceptId) {
    const outcomes = this.learningOutcomes.get(userId) || [];
    const conceptOutcomes = outcomes.filter(o => o.concept_id === conceptId);
    
    if (conceptOutcomes.length === 0) {
      return { achieved: false, attempts: 0 };
    }
    
    // Check last N attempts
    const recentAttempts = conceptOutcomes.slice(-5);
    const averageScore = recentAttempts.reduce((sum, o) => sum + o.score, 0) / recentAttempts.length;
    
    const mastered = averageScore >= 0.8; // 80% threshold
    
    return {
      achieved: mastered,
      attempts: conceptOutcomes.length,
      averageScore: averageScore,
      timeToMastery: mastered ? 
        conceptOutcomes[conceptOutcomes.length - 1].timestamp - conceptOutcomes[0].timestamp : null
    };
  }

  calculateLearningGain(userId, conceptId) {
    const outcomes = this.learningOutcomes.get(userId) || [];
    const conceptOutcomes = outcomes.filter(o => o.concept_id === conceptId);
    
    if (conceptOutcomes.length < 2) return null;
    
    // Pre-test: first attempt
    const preTest = conceptOutcomes[0].score;
    
    // Post-test: average of last 3 attempts
    const postTests = conceptOutcomes.slice(-3);
    const postTest = postTests.reduce((sum, o) => sum + o.score, 0) / postTests.length;
    
    // Normalized learning gain
    const gain = (postTest - preTest) / (1 - preTest);
    
    this.trackEvent('learning_gain_calculated', {
      concept_id: conceptId,
      pre_test: preTest,
      post_test: postTest,
      normalized_gain: gain,
      attempts: conceptOutcomes.length
    });
    
    return gain;
  }

  // ============================================
  // ETHICAL SAFEGUARDS
  // ============================================

  isUserEligible(experiment, context) {
    // Check parental consent if required
    if (this.config.parentalConsent && !context.hasParentalConsent) {
      return false;
    }
    
    // Check opt-out status
    if (this.config.allowOptOut && this.hasOptedOut(experiment.id)) {
      return false;
    }
    
    // Ensure minimum learning guarantee
    if (this.config.ensureMinimumLearning) {
      const learningScore = this.getUserLearningScore(context.userId);
      if (learningScore < experiment.minimumLearningThreshold) {
        // Assign to best performing variant
        return false;
      }
    }
    
    // Check experiment duration
    const daysSinceStart = (Date.now() - experiment.startDate) / (1000 * 60 * 60 * 24);
    if (daysSinceStart > this.config.maxExperimentDuration) {
      return false;
    }
    
    return true;
  }

  hasOptedOut(experimentId) {
    const optOuts = this.getStoredValue('experiment_opt_outs') || [];
    return optOuts.includes(experimentId);
  }

  optOut(experimentId) {
    const optOuts = this.getStoredValue('experiment_opt_outs') || [];
    if (!optOuts.includes(experimentId)) {
      optOuts.push(experimentId);
      this.setStoredValue('experiment_opt_outs', optOuts);
    }
    
    // Remove assignment
    this.assignments.delete(experimentId);
    this.saveAssignments();
    
    // Track opt-out
    this.trackEvent('experiment_opt_out', { experiment_id: experimentId });
  }

  getUserLearningScore(userId) {
    const outcomes = this.learningOutcomes.get(userId) || [];
    if (outcomes.length === 0) return 1.0; // Default to high score
    
    // Calculate average performance across all concepts
    const totalScore = outcomes.reduce((sum, o) => sum + o.score, 0);
    return totalScore / outcomes.length;
  }

  // ============================================
  // RECOMMENDATIONS
  // ============================================

  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Check sample size
    Object.entries(analysis.variants).forEach(([variantId, data]) => {
      if (data.participants < this.config.minSampleSize) {
        recommendations.push({
          type: 'sample_size',
          severity: 'warning',
          message: `Variant "${data.name}" needs ${this.config.minSampleSize - data.participants} more participants for reliable results`
        });
      }
    });
    
    // Check for significant results
    let hasSignificantResults = false;
    Object.entries(analysis.metrics).forEach(([metricName, metricData]) => {
      Object.entries(metricData.variants).forEach(([variantId, variantData]) => {
        if (variantData.significance?.significant) {
          hasSignificantResults = true;
          
          const improvement = variantData.improvement;
          recommendations.push({
            type: 'significant_result',
            severity: 'success',
            message: `${variantId} shows ${improvement.toFixed(1)}% improvement in ${metricName}`,
            metric: metricName,
            variant: variantId,
            improvement: improvement
          });
        }
      });
    });
    
    // Check experiment duration
    if (analysis.duration_days > this.config.maxExperimentDuration) {
      recommendations.push({
        type: 'duration',
        severity: 'error',
        message: 'Experiment has exceeded maximum duration and should be concluded'
      });
    }
    
    // Learning outcome checks
    const learningMetrics = ['learning_gain', 'concept_mastery', 'learning_velocity'];
    learningMetrics.forEach(metric => {
      if (analysis.metrics[metric]) {
        Object.entries(analysis.metrics[metric].variants).forEach(([variantId, data]) => {
          if (variantId !== 'control' && data.improvement < -5) {
            recommendations.push({
              type: 'learning_impact',
              severity: 'error',
              message: `${variantId} shows negative impact on ${metric}. Consider stopping this variant.`,
              metric: metric,
              variant: variantId
            });
          }
        });
      }
    });
    
    // Winner recommendation
    if (hasSignificantResults && analysis.duration_days >= 14) {
      recommendations.push({
        type: 'conclusion',
        severity: 'info',
        message: 'Experiment has significant results and sufficient duration. Consider concluding and implementing the winning variant.'
      });
    }
    
    return recommendations;
  }

  determineWinner(analysis) {
    let winner = null;
    let maxImprovement = 0;
    
    // Consider primary metric (first in list)
    const primaryMetric = Object.keys(analysis.metrics)[0];
    if (!primaryMetric) return null;
    
    const metricData = analysis.metrics[primaryMetric];
    
    Object.entries(metricData.variants).forEach(([variantId, data]) => {
      if (variantId === 'control') return;
      
      if (data.significance?.significant && data.improvement > maxImprovement) {
        maxImprovement = data.improvement;
        winner = {
          variant: variantId,
          metric: primaryMetric,
          improvement: data.improvement,
          confidence: data.significance.confidence
        };
      }
    });
    
    // Validate winner doesn't harm learning outcomes
    if (winner && this.config.ensureMinimumLearning) {
      const learningMetrics = ['learning_gain', 'concept_mastery'];
      
      for (const metric of learningMetrics) {
        if (analysis.metrics[metric]) {
          const variantData = analysis.metrics[metric].variants[winner.variant];
          if (variantData && variantData.improvement < -5) {
            // Reject winner if it harms learning
            return {
              variant: 'control',
              reason: 'treatment_harms_learning',
              rejected_variant: winner.variant
            };
          }
        }
      }
    }
    
    return winner;
  }

  // ============================================
  // STORAGE & PERSISTENCE
  // ============================================

  loadAssignments() {
    const stored = this.getStoredValue('ab_assignments');
    if (stored) {
      try {
        const assignments = JSON.parse(stored);
        Object.entries(assignments).forEach(([expId, data]) => {
          this.assignments.set(expId, data);
        });
      } catch (e) {
        console.error('Failed to load assignments:', e);
      }
    }
  }

  saveAssignments() {
    const assignments = {};
    this.assignments.forEach((data, expId) => {
      assignments[expId] = data;
    });
    
    this.setStoredValue('ab_assignments', JSON.stringify(assignments));
  }

  getStoredValue(key) {
    if (this.config.storage === 'localStorage') {
      return localStorage.getItem(key);
    } else if (this.config.storage === 'sessionStorage') {
      return sessionStorage.getItem(key);
    } else if (this.config.storage === 'cookie') {
      return this.getCookie(key);
    }
    return null;
  }

  setStoredValue(key, value) {
    if (this.config.storage === 'localStorage') {
      localStorage.setItem(key, value);
    } else if (this.config.storage === 'sessionStorage') {
      sessionStorage.setItem(key, value);
    } else if (this.config.storage === 'cookie') {
      this.setCookie(key, value, this.config.cookieExpiry);
    }
  }

  getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  // ============================================
  // UTILITIES
  // ============================================

  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    return this.sessionId;
  }

  calculateStandardDeviation(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(x => Math.pow(x - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    
    return Math.sqrt(variance);
  }

  calculateConfidenceInterval(mean, standardError, confidence = null) {
    confidence = confidence || this.config.confidenceLevel;
    const z = this.getZScore(confidence);
    
    return {
      lower: mean - z * standardError,
      upper: mean + z * standardError,
      confidence: confidence
    };
  }

  calculateImprovement(control, treatment, inverse = false) {
    if (control === 0) return 0;
    
    const improvement = ((treatment - control) / control) * 100;
    return inverse ? -improvement : improvement;
  }

  getZScore(confidence) {
    // Common z-scores
    const zScores = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576
    };
    
    return zScores[confidence] || 1.96;
  }

  normalCDF(z) {
    // Approximation of the cumulative distribution function for standard normal
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    
    return z > 0 ? 1 - p : p;
  }

  tCDF(t, df) {
    // Approximation for t-distribution CDF
    // For large df, approaches normal distribution
    if (df > 30) {
      return this.normalCDF(t);
    }
    
    // Simple approximation for small df
    const x = df / (df + t * t);
    const a = df / 2;
    const b = 0.5;
    
    // Incomplete beta function approximation
    let sum = 0;
    for (let i = 0; i < 100; i++) {
      const term = Math.pow(x, a) * Math.pow(1 - x, b) / (a * this.beta(a, b));
      sum += term;
      if (term < 1e-10) break;
    }
    
    return 0.5 + (t > 0 ? 1 : -1) * sum / 2;
  }

  beta(a, b) {
    // Beta function
    return this.gamma(a) * this.gamma(b) / this.gamma(a + b);
  }

  gamma(n) {
    // Simplified gamma function for positive integers
    if (n === 1) return 1;
    return (n - 1) * this.gamma(n - 1);
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  setupEventListeners() {
    // Track page views
    this.trackEvent('page_view', {
      url: window.location.href,
      referrer: document.referrer
    });
    
    // Track session start
    if (!sessionStorage.getItem('session_started')) {
      this.trackEvent('session_start');
      sessionStorage.setItem('session_started', 'true');
    }
    
    // Track engagement time
    let startTime = Date.now();
    let totalEngagementTime = 0;
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        totalEngagementTime += Date.now() - startTime;
        this.trackEvent('engagement_time_update', {
          engagement_time: totalEngagementTime / 1000 // Convert to seconds
        });
      } else {
        startTime = Date.now();
      }
    });
    
    // Track before unload
    window.addEventListener('beforeunload', () => {
      totalEngagementTime += Date.now() - startTime;
      this.trackEvent('session_end', {
        total_engagement_time: totalEngagementTime / 1000,
        total_problems_solved: this.getProblemsSolved()
      });
    });
  }

  getProblemsSolved() {
    // This would be implemented based on your specific tracking
    return parseInt(sessionStorage.getItem('problems_solved') || '0');
  }

  // ============================================
  // REPORTING
  // ============================================

  async sendToAnalytics(event) {
    // Batch events for efficiency
    if (!this.eventBatch) {
      this.eventBatch = [];
      this.scheduleBatchSend();
    }
    
    this.eventBatch.push(event);
    
    // Send immediately if batch is large
    if (this.eventBatch.length >= 50) {
      this.sendBatch();
    }
  }

  scheduleBatchSend() {
    setTimeout(() => {
      if (this.eventBatch && this.eventBatch.length > 0) {
        this.sendBatch();
      }
    }, 5000); // Send every 5 seconds
  }

  async sendBatch() {
    const events = [...this.eventBatch];
    this.eventBatch = [];
    
    try {
      await fetch(`${this.config.apiEndpoint}events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      console.error('Failed to send analytics batch:', error);
      // Re-queue events
      this.eventBatch.unshift(...events);
    }
  }

  getExistingAssignment(experimentId) {
    return this.assignments.get(experimentId);
  }

  storeAssignment(experimentId, variant, level) {
    this.assignments.set(experimentId, {
      experimentId,
      variant: variant.id,
      variantDetails: variant,
      assignmentLevel: level,
      assignedAt: Date.now()
    });
    
    this.saveAssignments();
  }

  getActiveAssignments() {
    const active = [];
    
    this.assignments.forEach((assignment, experimentId) => {
      const experiment = this.experiments.get(experimentId);
      if (experiment && experiment.status === 'active') {
        active.push(assignment);
      }
    });
    
    return active;
  }

  getClassroomAssignments(experimentId, classroomId) {
    // In a real implementation, this would query a database
    // For now, return empty array
    return [];
  }

  getParticipantCount(experimentId) {
    // In a real implementation, this would query analytics
    // For now, return a simulated count
    return Math.floor(Math.random() * 5000) + 1000;
  }

  getVariantParticipants(experimentId, variantId) {
    const total = this.getParticipantCount(experimentId);
    const experiment = this.experiments.get(experimentId);
    const variant = experiment.variants.find(v => v.id === variantId);
    
    return Math.floor(total * variant.weight);
  }

  checkExpiredExperiments() {
    this.experiments.forEach((experiment, id) => {
      const daysSinceStart = (Date.now() - experiment.startDate) / (1000 * 60 * 60 * 24);
      
      if (daysSinceStart > this.config.maxExperimentDuration && experiment.status === 'active') {
        experiment.status = 'expired';
        console.warn(`Experiment ${id} has exceeded maximum duration and was automatically expired`);
      }
    });
  }

  storeEvent(event) {
    // Store in IndexedDB for offline support
    if ('indexedDB' in window) {
      this.storeEventInIndexedDB(event);
    }
  }

  async storeEventInIndexedDB(event) {
    // Implementation would use IndexedDB for offline event storage
    // This is a placeholder for the actual implementation
  }
}

// ============================================
// EDUCATIONAL EXPERIMENT CLASS
// ============================================

class EducationalExperiment {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type; // 'ab', 'multivariate', 'factorial', 'sequential'
    this.status = config.status || 'active';
    this.startDate = config.startDate || Date.now();
    this.endDate = config.endDate;
    
    this.variants = config.variants || [];
    this.metrics = config.metrics || [];
    this.clustering = config.clustering || 'individual';
    
    this.factors = config.factors; // For factorial designs
    this.phases = config.phases; // For sequential designs
    
    this.minimumLearningThreshold = config.minimumLearningThreshold || 0.6;
    this.requiresSchoolClustering = config.requiresSchoolClustering || false;
    
    this.normalizeVariantWeights();
  }

  normalizeVariantWeights() {
    const totalWeight = this.variants.reduce((sum, v) => sum + (v.weight || 1), 0);
    
    this.variants.forEach(variant => {
      variant.weight = (variant.weight || 1) / totalWeight;
    });
  }

  getControlVariant() {
    return this.variants.find(v => v.id === 'control') || this.variants[0];
  }

  getCurrentPhase() {
    if (this.type !== 'sequential' || !this.phases) return null;
    
    const daysSinceStart = (Date.now() - this.startDate) / (1000 * 60 * 60 * 24);
    let cumulativeDays = 0;
    
    for (const phase of this.phases) {
      cumulativeDays += phase.duration;
      if (daysSinceStart <= cumulativeDays) {
        return phase;
      }
    }
    
    return this.phases[this.phases.length - 1];
  }
}

// ============================================
// EXPORT AND INITIALIZATION
// ============================================

// Initialize framework
const educationalAB = new EducationalABFramework({
  apiEndpoint: '/api/experiments/',
  minSampleSize: 100,
  confidenceLevel: 0.95,
  clusterRandomization: true,
  ensureMinimumLearning: true
});

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EducationalABFramework, EducationalExperiment, educationalAB };
} else {
  window.EducationalABFramework = EducationalABFramework;
  window.educationalAB = educationalAB;
}