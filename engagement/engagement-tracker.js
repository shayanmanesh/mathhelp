// User Engagement Tracking System
// Optimizes for revenue through increased time on site and page views

class EngagementTracker {
  constructor() {
    this.config = {
      targets: {
        sessionDuration: 180, // 3+ minutes in seconds
        pagesPerSession: 3,   // 3+ pages per session
        scrollDepth: 75,      // 75% scroll depth
        interactionRate: 0.3  // 30% of users interact
      },
      
      tracking: {
        enabled: true,
        sampleRate: 1.0,
        debounceTime: 100,
        idleTimeout: 30000, // 30 seconds of inactivity
        heartbeatInterval: 15000 // 15 seconds
      },
      
      scoring: {
        pageView: 10,
        scrollMilestone: 5,
        interaction: 15,
        mediaEngagement: 20,
        quizCompletion: 50,
        calculatorUse: 30,
        socialShare: 40,
        commentPost: 35
      },
      
      storage: {
        sessionKey: 'engagement_session',
        historyKey: 'engagement_history',
        maxHistoryDays: 30
      }
    };
    
    this.session = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      pageViews: 0,
      totalTimeSpent: 0,
      activeTimeSpent: 0,
      interactions: [],
      scrollDepth: 0,
      score: 0,
      lastActivity: Date.now()
    };
    
    this.metrics = {
      realTime: {
        activeUsers: 0,
        avgSessionDuration: 0,
        avgPagesPerSession: 0,
        topContent: []
      },
      historical: []
    };
    
    this.init();
  }

  init() {
    this.loadSession();
    this.setupEventListeners();
    this.startHeartbeat();
    this.trackPageView();
    this.setupIdleDetection();
    this.setupUnloadHandling();
    this.initializeRealTimeMetrics();
  }

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  loadSession() {
    const stored = sessionStorage.getItem(this.config.storage.sessionKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Resume session if less than 30 minutes old
        if (Date.now() - data.lastActivity < 1800000) {
          this.session = data;
          this.session.resumed = true;
        }
      } catch (e) {
        console.error('Failed to load session:', e);
      }
    }
    
    // Load historical data
    this.loadHistoricalData();
  }

  saveSession() {
    try {
      sessionStorage.setItem(
        this.config.storage.sessionKey,
        JSON.stringify(this.session)
      );
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================
  // EVENT TRACKING
  // ============================================

  setupEventListeners() {
    // Page visibility
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });
    
    // Scroll tracking
    this.setupScrollTracking();
    
    // Click tracking
    document.addEventListener('click', (e) => {
      this.trackClick(e);
    });
    
    // Form interactions
    this.setupFormTracking();
    
    // Media engagement
    this.setupMediaTracking();
    
    // Internal link tracking
    this.setupInternalLinkTracking();
    
    // Time tracking
    this.setupTimeTracking();
  }

  setupScrollTracking() {
    let ticking = false;
    let maxScroll = 0;
    
    const updateScrollDepth = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercent = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        this.session.scrollDepth = Math.min(scrollPercent, 100);
        
        // Track milestones
        const milestones = [25, 50, 75, 90, 100];
        milestones.forEach(milestone => {
          if (maxScroll >= milestone && !this.session.interactions.some(i => 
            i.type === 'scroll' && i.value === milestone
          )) {
            this.trackInteraction('scroll', { milestone, depth: maxScroll });
            this.addScore(this.config.scoring.scrollMilestone);
          }
        });
      }
      
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDepth);
        ticking = true;
      }
    }, { passive: true });
  }

  trackClick(event) {
    const target = event.target;
    const interactionData = {
      tagName: target.tagName,
      className: target.className,
      id: target.id,
      text: target.textContent?.substring(0, 50)
    };
    
    // Track specific interaction types
    if (target.matches('button, .btn')) {
      this.trackInteraction('button-click', interactionData);
      this.addScore(this.config.scoring.interaction);
    } else if (target.matches('a[href^="#"]')) {
      this.trackInteraction('anchor-click', interactionData);
    } else if (target.matches('.math-expression')) {
      this.trackInteraction('math-interaction', interactionData);
      this.addScore(this.config.scoring.interaction);
    } else if (target.matches('.quiz-option, .quiz-submit')) {
      this.trackInteraction('quiz-interaction', interactionData);
    } else if (target.matches('.calculator-button')) {
      this.trackInteraction('calculator-interaction', interactionData);
    }
    
    // Update last activity
    this.updateActivity();
  }

  setupFormTracking() {
    // Quiz completions
    document.addEventListener('quiz-completed', (event) => {
      this.trackInteraction('quiz-completion', {
        quizId: event.detail.quizId,
        score: event.detail.score,
        timeSpent: event.detail.timeSpent
      });
      this.addScore(this.config.scoring.quizCompletion);
      
      // Boost ad revenue opportunity
      this.triggerAdRefresh('quiz-completion');
    });
    
    // Calculator usage
    document.addEventListener('calculator-used', (event) => {
      this.trackInteraction('calculator-usage', {
        calculatorType: event.detail.type,
        calculations: event.detail.calculations
      });
      this.addScore(this.config.scoring.calculatorUse);
    });
    
    // Form submissions
    document.addEventListener('submit', (event) => {
      if (event.target.matches('form')) {
        this.trackInteraction('form-submission', {
          formId: event.target.id,
          formClass: event.target.className
        });
      }
    });
  }

  setupMediaTracking() {
    // Video engagement
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.addEventListener('play', () => {
        this.trackInteraction('video-play', {
          src: video.src,
          duration: video.duration
        });
        this.addScore(this.config.scoring.mediaEngagement);
      });
      
      video.addEventListener('ended', () => {
        this.trackInteraction('video-complete', {
          src: video.src,
          watchTime: video.currentTime
        });
        this.addScore(this.config.scoring.mediaEngagement);
        
        // High engagement moment for ads
        this.triggerAdRefresh('video-complete');
      });
    });
    
    // Image interactions (zoom, fullscreen)
    document.addEventListener('image-zoomed', (event) => {
      this.trackInteraction('image-zoom', {
        src: event.detail.src
      });
    });
  }

  setupInternalLinkTracking() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        this.trackInteraction('internal-link', {
          from: window.location.pathname,
          to: new URL(link.href).pathname,
          text: link.textContent?.substring(0, 50)
        });
        
        // Track exit intent for current page
        this.savePageMetrics();
      }
    });
  }

  setupTimeTracking() {
    let hiddenTime = 0;
    let lastActiveTime = Date.now();
    
    // Track active vs idle time
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        const now = Date.now();
        if (now - lastActiveTime > 1000) {
          this.session.activeTimeSpent += now - lastActiveTime - hiddenTime;
          hiddenTime = 0;
        }
        lastActiveTime = now;
        this.updateActivity();
      }, { passive: true });
    });
    
    // Track tab switches
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        hiddenTime = Date.now();
      } else {
        if (hiddenTime > 0) {
          hiddenTime = Date.now() - hiddenTime;
        }
      }
    });
  }

  // ============================================
  // INTERACTION TRACKING
  // ============================================

  trackInteraction(type, data = {}) {
    const interaction = {
      type,
      data,
      timestamp: Date.now(),
      pageUrl: window.location.pathname,
      sessionTime: Date.now() - this.session.startTime
    };
    
    this.session.interactions.push(interaction);
    
    // Dispatch event for other systems
    window.dispatchEvent(new CustomEvent('user-interaction', {
      detail: interaction
    }));
    
    // Check engagement milestones
    this.checkEngagementMilestones();
  }

  trackPageView() {
    this.session.pageViews++;
    
    const pageData = {
      url: window.location.pathname,
      title: document.title,
      timestamp: Date.now(),
      referrer: document.referrer,
      entryTime: Date.now()
    };
    
    // Track in current session
    if (!this.session.pages) {
      this.session.pages = [];
    }
    this.session.pages.push(pageData);
    
    // Add score
    this.addScore(this.config.scoring.pageView);
    
    // Check if hitting target pages per session
    if (this.session.pageViews === this.config.targets.pagesPerSession) {
      this.triggerMilestone('target-pages-reached', {
        pages: this.session.pageViews
      });
    }
  }

  // ============================================
  // ENGAGEMENT SCORING
  // ============================================

  addScore(points) {
    this.session.score += points;
    
    // Check score-based milestones
    const scoreMilestones = [100, 250, 500, 1000];
    scoreMilestones.forEach(milestone => {
      if (this.session.score >= milestone && 
          !this.session.scoreMilestones?.includes(milestone)) {
        if (!this.session.scoreMilestones) {
          this.session.scoreMilestones = [];
        }
        this.session.scoreMilestones.push(milestone);
        this.triggerMilestone('score-milestone', {
          score: this.session.score,
          milestone
        });
      }
    });
  }

  calculateEngagementScore() {
    const weights = {
      timeSpent: 0.3,
      pageViews: 0.2,
      scrollDepth: 0.2,
      interactions: 0.3
    };
    
    const timeScore = Math.min(this.session.activeTimeSpent / this.config.targets.sessionDuration, 1);
    const pageScore = Math.min(this.session.pageViews / this.config.targets.pagesPerSession, 1);
    const scrollScore = this.session.scrollDepth / 100;
    const interactionScore = Math.min(this.session.interactions.length / 10, 1);
    
    return (
      timeScore * weights.timeSpent +
      pageScore * weights.pageViews +
      scrollScore * weights.scrollDepth +
      interactionScore * weights.interactions
    ) * 100;
  }

  // ============================================
  // MILESTONE TRACKING
  // ============================================

  checkEngagementMilestones() {
    const sessionDuration = (Date.now() - this.session.startTime) / 1000;
    
    // Time-based milestones
    const timeMilestones = [60, 180, 300, 600]; // 1min, 3min, 5min, 10min
    timeMilestones.forEach(seconds => {
      if (sessionDuration >= seconds && 
          !this.session.timeMilestones?.includes(seconds)) {
        if (!this.session.timeMilestones) {
          this.session.timeMilestones = [];
        }
        this.session.timeMilestones.push(seconds);
        this.triggerMilestone('time-milestone', {
          duration: seconds,
          formatted: this.formatDuration(seconds)
        });
        
        // Special handling for 3+ minute target
        if (seconds === 180) {
          this.triggerAdRefresh('engagement-milestone');
        }
      }
    });
    
    // Interaction rate
    const interactionRate = this.session.interactions.length / this.session.pageViews;
    if (interactionRate >= this.config.targets.interactionRate && 
        !this.session.highEngagement) {
      this.session.highEngagement = true;
      this.triggerMilestone('high-engagement', {
        interactionRate,
        score: this.session.score
      });
    }
  }

  triggerMilestone(type, data) {
    window.dispatchEvent(new CustomEvent('engagement-milestone', {
      detail: {
        type,
        data,
        session: {
          duration: (Date.now() - this.session.startTime) / 1000,
          pageViews: this.session.pageViews,
          score: this.session.score
        }
      }
    }));
    
    // Save milestone for gamification
    this.saveMilestone(type, data);
  }

  // ============================================
  // AD REVENUE OPTIMIZATION
  // ============================================

  triggerAdRefresh(trigger) {
    // Only refresh ads at high engagement moments
    if (this.canRefreshAds()) {
      window.dispatchEvent(new CustomEvent('engagement-ad-refresh', {
        detail: {
          trigger,
          engagementScore: this.calculateEngagementScore(),
          sessionDuration: (Date.now() - this.session.startTime) / 1000,
          pageViews: this.session.pageViews
        }
      }));
      
      this.session.lastAdRefresh = Date.now();
    }
  }

  canRefreshAds() {
    // Limit ad refreshes to once per minute at high engagement moments
    const lastRefresh = this.session.lastAdRefresh || 0;
    return Date.now() - lastRefresh > 60000;
  }

  // ============================================
  // IDLE DETECTION
  // ============================================

  setupIdleDetection() {
    let idleTimer;
    
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      if (this.session.idle) {
        this.session.idle = false;
        this.session.idleTime = Date.now() - this.session.idleStart;
        delete this.session.idleStart;
      }
      
      idleTimer = setTimeout(() => {
        this.session.idle = true;
        this.session.idleStart = Date.now();
        this.trackInteraction('idle-start');
      }, this.config.tracking.idleTimeout);
    };
    
    // Reset on any activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetIdleTimer, { passive: true });
    });
    
    // Start timer
    resetIdleTimer();
  }

  // ============================================
  // HEARTBEAT & PERSISTENCE
  // ============================================

  startHeartbeat() {
    // Regular heartbeat for session tracking
    this.heartbeatInterval = setInterval(() => {
      this.updateSessionTime();
      this.saveSession();
      this.sendAnalytics();
    }, this.config.tracking.heartbeatInterval);
  }

  updateSessionTime() {
    const now = Date.now();
    this.session.totalTimeSpent = now - this.session.startTime;
    
    // Update active time if not idle
    if (!this.session.idle) {
      this.session.activeTimeSpent += this.config.tracking.heartbeatInterval;
    }
  }

  updateActivity() {
    this.session.lastActivity = Date.now();
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.trackInteraction('tab-hidden');
      this.saveSession();
    } else {
      this.trackInteraction('tab-visible');
    }
  }

  setupUnloadHandling() {
    // Save session on page unload
    const saveOnUnload = () => {
      this.savePageMetrics();
      this.saveSession();
      this.saveToHistory();
    };
    
    window.addEventListener('beforeunload', saveOnUnload);
    window.addEventListener('pagehide', saveOnUnload);
  }

  // ============================================
  // METRICS & ANALYTICS
  // ============================================

  savePageMetrics() {
    const currentPage = this.session.pages?.[this.session.pages.length - 1];
    if (currentPage) {
      currentPage.exitTime = Date.now();
      currentPage.timeSpent = currentPage.exitTime - currentPage.entryTime;
      currentPage.scrollDepth = this.session.scrollDepth;
      currentPage.interactions = this.session.interactions.filter(i => 
        i.pageUrl === currentPage.url
      ).length;
    }
  }

  sendAnalytics() {
    if (!this.config.tracking.enabled) return;
    
    const metrics = {
      sessionId: this.session.id,
      duration: this.session.totalTimeSpent / 1000,
      activeDuration: this.session.activeTimeSpent / 1000,
      pageViews: this.session.pageViews,
      scrollDepth: this.session.scrollDepth,
      interactionCount: this.session.interactions.length,
      engagementScore: this.calculateEngagementScore(),
      score: this.session.score,
      milestones: {
        time: this.session.timeMilestones || [],
        score: this.session.scoreMilestones || []
      }
    };
    
    // Send to analytics endpoint
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(metrics)], { type: 'application/json' });
      navigator.sendBeacon('/api/engagement-metrics', blob);
    }
  }

  // ============================================
  // HISTORICAL DATA
  // ============================================

  loadHistoricalData() {
    try {
      const stored = localStorage.getItem(this.config.storage.historyKey);
      if (stored) {
        this.metrics.historical = JSON.parse(stored);
        this.cleanOldHistory();
      }
    } catch (e) {
      console.error('Failed to load historical data:', e);
    }
  }

  saveToHistory() {
    const summary = {
      sessionId: this.session.id,
      date: new Date().toISOString(),
      duration: this.session.totalTimeSpent / 1000,
      pageViews: this.session.pageViews,
      score: this.session.score,
      engagementScore: this.calculateEngagementScore(),
      milestones: {
        time: this.session.timeMilestones || [],
        score: this.session.scoreMilestones || []
      }
    };
    
    this.metrics.historical.push(summary);
    
    try {
      localStorage.setItem(
        this.config.storage.historyKey,
        JSON.stringify(this.metrics.historical)
      );
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }

  cleanOldHistory() {
    const cutoff = Date.now() - (this.config.storage.maxHistoryDays * 24 * 60 * 60 * 1000);
    this.metrics.historical = this.metrics.historical.filter(entry => 
      new Date(entry.date).getTime() > cutoff
    );
  }

  saveMilestone(type, data) {
    const milestone = {
      type,
      data,
      timestamp: Date.now(),
      sessionId: this.session.id
    };
    
    // Save for gamification system
    window.dispatchEvent(new CustomEvent('milestone-achieved', {
      detail: milestone
    }));
  }

  // ============================================
  // REAL-TIME METRICS
  // ============================================

  initializeRealTimeMetrics() {
    // Update real-time metrics every 5 seconds
    setInterval(() => {
      this.updateRealTimeMetrics();
    }, 5000);
  }

  updateRealTimeMetrics() {
    // Calculate averages from recent sessions
    const recentSessions = this.metrics.historical.slice(-100);
    
    if (recentSessions.length > 0) {
      this.metrics.realTime.avgSessionDuration = 
        recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length;
      
      this.metrics.realTime.avgPagesPerSession = 
        recentSessions.reduce((sum, s) => sum + s.pageViews, 0) / recentSessions.length;
    }
    
    // Include current session
    this.metrics.realTime.currentSession = {
      duration: this.session.totalTimeSpent / 1000,
      pageViews: this.session.pageViews,
      score: this.session.score,
      engagementScore: this.calculateEngagementScore()
    };
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // ============================================
  // PUBLIC API
  // ============================================

  getSessionMetrics() {
    return {
      id: this.session.id,
      duration: this.session.totalTimeSpent / 1000,
      activeDuration: this.session.activeTimeSpent / 1000,
      pageViews: this.session.pageViews,
      scrollDepth: this.session.scrollDepth,
      interactions: this.session.interactions.length,
      score: this.session.score,
      engagementScore: this.calculateEngagementScore(),
      isHighEngagement: this.session.highEngagement || false
    };
  }

  getRealTimeMetrics() {
    return this.metrics.realTime;
  }

  getHistoricalMetrics() {
    return {
      sessions: this.metrics.historical.length,
      avgDuration: this.metrics.realTime.avgSessionDuration,
      avgPageViews: this.metrics.realTime.avgPagesPerSession,
      totalMilestones: this.metrics.historical.reduce((sum, s) => 
        sum + (s.milestones.time.length + s.milestones.score.length), 0
      )
    };
  }

  trackCustomEvent(eventName, eventData) {
    this.trackInteraction('custom', {
      name: eventName,
      data: eventData
    });
  }

  destroy() {
    clearInterval(this.heartbeatInterval);
    this.saveSession();
    this.saveToHistory();
  }
}

// Initialize tracker
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.engagementTracker = new EngagementTracker();
  });
} else {
  window.engagementTracker = new EngagementTracker();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EngagementTracker;
}