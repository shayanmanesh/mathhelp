// Performance Tracking System for Math Help Testing System
// Advanced user progress tracking and performance analytics

const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const { redisManager } = require('../database/redis-config');
const EventEmitter = require('events');

class PerformanceTracker extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Tracking settings
            trackingEnabled: true,
            realTimeTracking: true,
            batchSize: 100,
            
            // Performance calculation settings
            movingAverageWindow: 10,
            masteryThreshold: 0.8,
            fluencyThreshold: 0.9,
            retentionPeriod: 30, // days
            
            // IRT parameters
            irtEnabled: true,
            abilityUpdateThreshold: 0.1,
            
            // Progress tracking
            progressMilestones: [10, 25, 50, 100, 250, 500, 1000],
            streakMilestones: [3, 7, 14, 30, 60, 100],
            
            ...config
        };
        
        this.pgPool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'mathhelp',
            user: process.env.DB_USER || 'mathhelp',
            password: process.env.DB_PASSWORD || 'password'
        });
        
        this.mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
        this.mongodb = null;
        this.redis = redisManager;
        
        this.performanceCache = new Map();
        this.eventQueue = [];
        
        this.initializeSystem();
    }
    
    async initializeSystem() {
        try {
            await this.mongoClient.connect();
            this.mongodb = this.mongoClient.db('mathhelp_testing');
            
            // Start batch processing
            this.startBatchProcessing();
            
            console.log('Performance tracker initialized');
        } catch (error) {
            console.error('Performance tracker initialization error:', error);
            throw error;
        }
    }
    
    startBatchProcessing() {
        // Process queued events periodically
        setInterval(() => this.processEventQueue(), 5000);
        
        // Update performance metrics periodically
        setInterval(() => this.updatePerformanceMetrics(), 60000);
        
        // Clean up old data
        setInterval(() => this.cleanupOldData(), 3600000); // Every hour
    }
    
    // ============================================
    // PERFORMANCE TRACKING
    // ============================================
    
    /**
     * Track user's attempt on a question
     */
    async trackAttempt(userId, questionId, isCorrect, responseTime, metadata = {}) {
        const attemptData = {
            userId,
            questionId,
            isCorrect,
            responseTime,
            timestamp: new Date(),
            metadata
        };
        
        if (this.config.realTimeTracking) {
            await this.processAttemptImmediately(attemptData);
        } else {
            this.eventQueue.push({ type: 'attempt', data: attemptData });
        }
        
        // Emit event
        this.emit('attemptTracked', attemptData);
    }
    
    async processAttemptImmediately(attemptData) {
        const { userId, questionId, isCorrect, responseTime } = attemptData;
        
        // Update user performance metrics
        await this.updateUserPerformance(userId, questionId, isCorrect, responseTime);
        
        // Update skill mastery
        await this.updateSkillMastery(userId, questionId, isCorrect);
        
        // Update ability estimation (IRT)
        if (this.config.irtEnabled) {
            await this.updateAbilityEstimation(userId, questionId, isCorrect);
        }
        
        // Check for achievements and milestones
        await this.checkPerformanceMilestones(userId);
        
        // Store detailed analytics
        await this.storePerformanceAnalytics(attemptData);
    }
    
    async updateUserPerformance(userId, questionId, isCorrect, responseTime) {
        // Get current performance data
        const currentPerformance = await this.getCurrentPerformance(userId);
        
        // Calculate new metrics
        const newMetrics = this.calculateUpdatedMetrics(currentPerformance, isCorrect, responseTime);
        
        // Update in database
        await this.pgPool.query(`
            UPDATE users SET
                total_questions_attempted = total_questions_attempted + 1,
                total_correct_answers = total_correct_answers + $1,
                current_accuracy = $2,
                avg_response_time = $3,
                last_activity_date = CURRENT_DATE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
        `, [
            isCorrect ? 1 : 0,
            newMetrics.accuracy,
            newMetrics.avgResponseTime,
            userId
        ]);
        
        // Update cache
        this.performanceCache.set(userId, newMetrics);
        
        // Store in Redis for real-time access
        await this.redis.client.hset(`user_performance:${userId}`, {
            accuracy: newMetrics.accuracy,
            avgResponseTime: newMetrics.avgResponseTime,
            totalAttempts: newMetrics.totalAttempts,
            correctAttempts: newMetrics.correctAttempts,
            lastUpdate: Date.now()
        });
    }
    
    async getCurrentPerformance(userId) {
        // Check cache first
        if (this.performanceCache.has(userId)) {
            return this.performanceCache.get(userId);
        }
        
        // Get from database
        const result = await this.pgPool.query(`
            SELECT 
                total_questions_attempted,
                total_correct_answers,
                current_accuracy,
                avg_response_time
            FROM users
            WHERE id = $1
        `, [userId]);
        
        if (result.rows.length === 0) {
            return {
                totalAttempts: 0,
                correctAttempts: 0,
                accuracy: 0,
                avgResponseTime: 0
            };
        }
        
        const row = result.rows[0];
        return {
            totalAttempts: row.total_questions_attempted || 0,
            correctAttempts: row.total_correct_answers || 0,
            accuracy: row.current_accuracy || 0,
            avgResponseTime: row.avg_response_time || 0
        };
    }
    
    calculateUpdatedMetrics(currentPerformance, isCorrect, responseTime) {
        const newTotalAttempts = currentPerformance.totalAttempts + 1;
        const newCorrectAttempts = currentPerformance.correctAttempts + (isCorrect ? 1 : 0);
        
        // Calculate moving average for response time
        const alpha = 1 / Math.min(newTotalAttempts, this.config.movingAverageWindow);
        const newAvgResponseTime = currentPerformance.avgResponseTime * (1 - alpha) + responseTime * alpha;
        
        return {
            totalAttempts: newTotalAttempts,
            correctAttempts: newCorrectAttempts,
            accuracy: newCorrectAttempts / newTotalAttempts,
            avgResponseTime: newAvgResponseTime
        };
    }
    
    // ============================================
    // SKILL MASTERY TRACKING
    // ============================================
    
    async updateSkillMastery(userId, questionId, isCorrect) {
        // Get question's skill
        const skillResult = await this.pgPool.query(`
            SELECT s.id, s.name, s.subject_id
            FROM skills s
            JOIN questions q ON s.id = q.skill_id
            WHERE q.id = $1
        `, [questionId]);
        
        if (skillResult.rows.length === 0) return;
        
        const skill = skillResult.rows[0];
        
        // Get current skill mastery
        const masteryResult = await this.pgPool.query(`
            SELECT * FROM user_skills
            WHERE user_id = $1 AND skill_id = $2
        `, [userId, skill.id]);
        
        let currentMastery = {
            attempts: 0,
            correct: 0,
            mastery_level: 'not_started',
            confidence: 0
        };
        
        if (masteryResult.rows.length > 0) {
            currentMastery = masteryResult.rows[0];
        }
        
        // Update mastery data
        const newAttempts = currentMastery.attempts + 1;
        const newCorrect = currentMastery.correct + (isCorrect ? 1 : 0);
        const newAccuracy = newCorrect / newAttempts;
        
        // Calculate mastery level
        const masteryLevel = this.calculateMasteryLevel(newAccuracy, newAttempts);
        const confidence = this.calculateMasteryConfidence(newAccuracy, newAttempts);
        
        // Update or insert skill mastery
        await this.pgPool.query(`
            INSERT INTO user_skills (user_id, skill_id, attempts, correct, mastery_level, confidence, last_practiced)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, skill_id) DO UPDATE SET
                attempts = EXCLUDED.attempts,
                correct = EXCLUDED.correct,
                mastery_level = EXCLUDED.mastery_level,
                confidence = EXCLUDED.confidence,
                last_practiced = EXCLUDED.last_practiced
        `, [userId, skill.id, newAttempts, newCorrect, masteryLevel, confidence]);
        
        // Check if skill was just mastered
        if (masteryLevel === 'mastered' && currentMastery.mastery_level !== 'mastered') {
            await this.onSkillMastered(userId, skill);
        }
        
        // Update subject progress
        await this.updateSubjectProgress(userId, skill.subject_id);
    }
    
    calculateMasteryLevel(accuracy, attempts) {
        if (attempts < 5) return 'learning';
        if (accuracy >= this.config.masteryThreshold && attempts >= 10) return 'mastered';
        if (accuracy >= 0.6) return 'practicing';
        return 'struggling';
    }
    
    calculateMasteryConfidence(accuracy, attempts) {
        // Simple confidence calculation based on accuracy and attempt count
        const attemptWeight = Math.min(attempts / 20, 1); // Max weight at 20 attempts
        return accuracy * attemptWeight;
    }
    
    async onSkillMastered(userId, skill) {
        // Award points for mastering skill
        await this.awardMasteryPoints(userId, skill);
        
        // Emit mastery event
        this.emit('skillMastered', { userId, skill });
        
        // Store mastery achievement
        await this.mongodb.collection('masteryAchievements').insertOne({
            userId,
            skillId: skill.id,
            skillName: skill.name,
            timestamp: new Date()
        });
    }
    
    async updateSubjectProgress(userId, subjectId) {
        // Get all skills in subject
        const skillsResult = await this.pgPool.query(`
            SELECT COUNT(*) as total_skills
            FROM skills
            WHERE subject_id = $1
        `, [subjectId]);
        
        const totalSkills = parseInt(skillsResult.rows[0].total_skills);
        
        // Get mastered skills count
        const masteredResult = await this.pgPool.query(`
            SELECT COUNT(*) as mastered_skills
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = $1 AND s.subject_id = $2 AND us.mastery_level = 'mastered'
        `, [userId, subjectId]);
        
        const masteredSkills = parseInt(masteredResult.rows[0].mastered_skills);
        const progress = totalSkills > 0 ? masteredSkills / totalSkills : 0;
        
        // Update subject progress
        await this.pgPool.query(`
            INSERT INTO user_subjects (user_id, subject_id, progress, mastered_skills, total_skills)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, subject_id) DO UPDATE SET
                progress = EXCLUDED.progress,
                mastered_skills = EXCLUDED.mastered_skills,
                total_skills = EXCLUDED.total_skills,
                updated_at = CURRENT_TIMESTAMP
        `, [userId, subjectId, progress, masteredSkills, totalSkills]);
    }
    
    // ============================================
    // ABILITY ESTIMATION (IRT)
    // ============================================
    
    async updateAbilityEstimation(userId, questionId, isCorrect) {
        // Get question parameters
        const questionResult = await this.pgPool.query(`
            SELECT difficulty_parameter, discrimination_parameter, guessing_parameter
            FROM questions
            WHERE id = $1
        `, [questionId]);
        
        if (questionResult.rows.length === 0) return;
        
        const question = questionResult.rows[0];
        
        // Get current ability estimate
        const currentAbility = await this.getCurrentAbilityEstimate(userId);
        
        // Calculate new ability using Maximum Likelihood Estimation
        const newAbility = this.calculateNewAbility(
            currentAbility,
            question.difficulty_parameter,
            question.discrimination_parameter,
            question.guessing_parameter || 0,
            isCorrect
        );
        
        // Update if change is significant
        if (Math.abs(newAbility - currentAbility) > this.config.abilityUpdateThreshold) {
            await this.updateAbilityEstimate(userId, newAbility);
        }
    }
    
    async getCurrentAbilityEstimate(userId) {
        const result = await this.pgPool.query(`
            SELECT ability_estimate FROM users WHERE id = $1
        `, [userId]);
        
        return result.rows[0]?.ability_estimate || 0.0;
    }
    
    calculateNewAbility(currentAbility, difficulty, discrimination, guessing, isCorrect) {
        // Simplified Newton-Raphson method for ability estimation
        const learningRate = 0.1;
        
        // Calculate probability of correct response
        const p = guessing + (1 - guessing) * (1 / (1 + Math.exp(-discrimination * (currentAbility - difficulty))));
        
        // Calculate derivatives
        const dP_dTheta = discrimination * (1 - guessing) * p * (1 - p) / (1 - guessing * (1 - p));
        const d2P_dTheta2 = discrimination * discrimination * (1 - guessing) * p * (1 - p) * (1 - 2 * p) / Math.pow(1 - guessing * (1 - p), 2);
        
        // Update ability estimate
        const numerator = (isCorrect ? 1 : 0) - p;
        const denominator = dP_dTheta;
        
        const abilityChange = learningRate * numerator / denominator;
        
        return Math.max(-4, Math.min(4, currentAbility + abilityChange));
    }
    
    async updateAbilityEstimate(userId, newAbility) {
        await this.pgPool.query(`
            UPDATE users SET
                ability_estimate = $1,
                ability_updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
        `, [newAbility, userId]);
        
        // Store ability history
        await this.mongodb.collection('abilityHistory').insertOne({
            userId,
            ability: newAbility,
            timestamp: new Date()
        });
    }
    
    // ============================================
    // PERFORMANCE MILESTONES
    // ============================================
    
    async checkPerformanceMilestones(userId) {
        const performance = await this.getCurrentPerformance(userId);
        
        // Check attempt milestones
        for (const milestone of this.config.progressMilestones) {
            if (performance.totalAttempts === milestone) {
                await this.onProgressMilestone(userId, 'attempts', milestone);
                break;
            }
        }
        
        // Check correct answer milestones
        for (const milestone of this.config.progressMilestones) {
            if (performance.correctAttempts === milestone) {
                await this.onProgressMilestone(userId, 'correct_answers', milestone);
                break;
            }
        }
        
        // Check accuracy milestones
        if (performance.totalAttempts >= 50 && performance.accuracy >= 0.9) {
            await this.onAccuracyMilestone(userId, performance.accuracy);
        }
    }
    
    async onProgressMilestone(userId, type, milestone) {
        // Emit milestone event
        this.emit('progressMilestone', { userId, type, milestone });
        
        // Store milestone achievement
        await this.mongodb.collection('progressMilestones').insertOne({
            userId,
            type,
            milestone,
            timestamp: new Date()
        });
        
        // Award achievement points
        await this.awardMilestonePoints(userId, type, milestone);
    }
    
    async onAccuracyMilestone(userId, accuracy) {
        this.emit('accuracyMilestone', { userId, accuracy });
        
        await this.mongodb.collection('accuracyMilestones').insertOne({
            userId,
            accuracy,
            timestamp: new Date()
        });
    }
    
    // ============================================
    // PERFORMANCE ANALYTICS
    // ============================================
    
    async storePerformanceAnalytics(attemptData) {
        const { userId, questionId, isCorrect, responseTime, metadata } = attemptData;
        
        // Enhanced analytics data
        const analyticsData = {
            ...attemptData,
            hour: new Date().getHours(),
            dayOfWeek: new Date().getDay(),
            sessionData: metadata.sessionData || null,
            deviceInfo: metadata.deviceInfo || null,
            difficultyLevel: await this.getQuestionDifficulty(questionId),
            skillArea: await this.getQuestionSkillArea(questionId)
        };
        
        // Store in MongoDB for complex analytics
        await this.mongodb.collection('performanceAnalytics').insertOne(analyticsData);
        
        // Update Redis counters
        await this.updateRedisCounters(userId, isCorrect, responseTime);
    }
    
    async getQuestionDifficulty(questionId) {
        const result = await this.pgPool.query(`
            SELECT difficulty_parameter FROM questions WHERE id = $1
        `, [questionId]);
        
        return result.rows[0]?.difficulty_parameter || 0;
    }
    
    async getQuestionSkillArea(questionId) {
        const result = await this.pgPool.query(`
            SELECT s.name, sub.name as subject_name
            FROM questions q
            JOIN skills s ON q.skill_id = s.id
            JOIN subjects sub ON s.subject_id = sub.id
            WHERE q.id = $1
        `, [questionId]);
        
        return result.rows[0] || { name: 'Unknown', subject_name: 'Unknown' };
    }
    
    async updateRedisCounters(userId, isCorrect, responseTime) {
        const today = new Date().toISOString().split('T')[0];
        
        // Daily counters
        await this.redis.client.hincrby(`daily_stats:${userId}:${today}`, 'attempts', 1);
        if (isCorrect) {
            await this.redis.client.hincrby(`daily_stats:${userId}:${today}`, 'correct', 1);
        }
        
        // Response time tracking
        await this.redis.client.lpush(`response_times:${userId}`, responseTime);
        await this.redis.client.ltrim(`response_times:${userId}`, 0, 99); // Keep last 100
        
        // Set expiration for daily stats (7 days)
        await this.redis.client.expire(`daily_stats:${userId}:${today}`, 7 * 24 * 60 * 60);
    }
    
    // ============================================
    // PROGRESS REPORTING
    // ============================================
    
    async generateProgressReport(userId, timeframe = '7d') {
        const timeframeDays = this.parseTimeframe(timeframe);
        const startDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);
        
        const [basicProgress, skillProgress, subjectProgress, milestones] = await Promise.all([
            this.getBasicProgress(userId, startDate),
            this.getSkillProgress(userId, startDate),
            this.getSubjectProgress(userId, startDate),
            this.getProgressMilestones(userId, startDate)
        ]);
        
        return {
            userId,
            timeframe,
            reportDate: new Date(),
            basicProgress,
            skillProgress,
            subjectProgress,
            milestones,
            recommendations: await this.generateProgressRecommendations(userId, basicProgress, skillProgress)
        };
    }
    
    async getBasicProgress(userId, startDate) {
        const result = await this.pgPool.query(`
            SELECT 
                COUNT(*) as total_attempts,
                COUNT(*) FILTER (WHERE is_correct = true) as correct_attempts,
                ROUND(AVG(duration_seconds), 2) as avg_response_time,
                COUNT(DISTINCT DATE(submitted_at)) as active_days
            FROM user_attempts
            WHERE user_id = $1 AND submitted_at >= $2
        `, [userId, startDate]);
        
        const stats = result.rows[0];
        return {
            totalAttempts: parseInt(stats.total_attempts),
            correctAttempts: parseInt(stats.correct_attempts),
            accuracy: stats.total_attempts > 0 ? stats.correct_attempts / stats.total_attempts : 0,
            avgResponseTime: parseFloat(stats.avg_response_time) || 0,
            activeDays: parseInt(stats.active_days)
        };
    }
    
    async getSkillProgress(userId, startDate) {
        const result = await this.pgPool.query(`
            SELECT 
                s.name as skill_name,
                us.mastery_level,
                us.confidence,
                COUNT(ua.id) as recent_attempts,
                COUNT(ua.id) FILTER (WHERE ua.is_correct = true) as recent_correct
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            LEFT JOIN user_attempts ua ON s.id = (
                SELECT skill_id FROM questions WHERE id = ua.question_id
            ) AND ua.user_id = $1 AND ua.submitted_at >= $2
            WHERE us.user_id = $1
            GROUP BY s.name, us.mastery_level, us.confidence
            ORDER BY us.confidence DESC
        `, [userId, startDate]);
        
        return result.rows.map(row => ({
            skillName: row.skill_name,
            masteryLevel: row.mastery_level,
            confidence: row.confidence,
            recentAttempts: parseInt(row.recent_attempts) || 0,
            recentCorrect: parseInt(row.recent_correct) || 0,
            recentAccuracy: row.recent_attempts > 0 ? row.recent_correct / row.recent_attempts : 0
        }));
    }
    
    async getSubjectProgress(userId, startDate) {
        const result = await this.pgPool.query(`
            SELECT 
                sub.name as subject_name,
                us.progress,
                us.mastered_skills,
                us.total_skills
            FROM user_subjects us
            JOIN subjects sub ON us.subject_id = sub.id
            WHERE us.user_id = $1
            ORDER BY us.progress DESC
        `, [userId]);
        
        return result.rows.map(row => ({
            subjectName: row.subject_name,
            progress: row.progress,
            masteredSkills: row.mastered_skills,
            totalSkills: row.total_skills
        }));
    }
    
    async getProgressMilestones(userId, startDate) {
        const milestones = await this.mongodb.collection('progressMilestones').find({
            userId,
            timestamp: { $gte: startDate }
        }).sort({ timestamp: -1 }).toArray();
        
        return milestones.map(milestone => ({
            type: milestone.type,
            milestone: milestone.milestone,
            achievedAt: milestone.timestamp
        }));
    }
    
    async generateProgressRecommendations(userId, basicProgress, skillProgress) {
        const recommendations = [];
        
        // Low accuracy recommendation
        if (basicProgress.accuracy < 0.7) {
            recommendations.push({
                type: 'accuracy',
                priority: 'high',
                message: 'Focus on understanding concepts before speed',
                suggestion: 'Review struggling skills and use hints when needed'
            });
        }
        
        // Slow response time recommendation
        if (basicProgress.avgResponseTime > 60) {
            recommendations.push({
                type: 'speed',
                priority: 'medium',
                message: 'Work on improving response time',
                suggestion: 'Practice basic facts and common problem types'
            });
        }
        
        // Skill-specific recommendations
        const strugglingSkills = skillProgress.filter(skill => skill.masteryLevel === 'struggling');
        if (strugglingSkills.length > 0) {
            recommendations.push({
                type: 'skill_focus',
                priority: 'high',
                message: `Focus on ${strugglingSkills.length} struggling skill(s)`,
                suggestion: `Review: ${strugglingSkills.map(s => s.skillName).join(', ')}`
            });
        }
        
        return recommendations;
    }
    
    // ============================================
    // BATCH PROCESSING
    // ============================================
    
    async processEventQueue() {
        if (this.eventQueue.length === 0) return;
        
        const batch = this.eventQueue.splice(0, this.config.batchSize);
        
        for (const event of batch) {
            try {
                if (event.type === 'attempt') {
                    await this.processAttemptImmediately(event.data);
                }
            } catch (error) {
                console.error('Error processing event:', error);
            }
        }
    }
    
    async updatePerformanceMetrics() {
        // Update global performance metrics
        await this.calculateSystemWideMetrics();
        
        // Update user rankings
        await this.updateUserRankings();
        
        // Clean up expired cache entries
        this.cleanupCache();
    }
    
    async calculateSystemWideMetrics() {
        const result = await this.pgPool.query(`
            SELECT 
                COUNT(DISTINCT user_id) as total_users,
                COUNT(*) as total_attempts,
                COUNT(*) FILTER (WHERE is_correct = true) as total_correct,
                ROUND(AVG(duration_seconds), 2) as avg_response_time
            FROM user_attempts
            WHERE submitted_at >= CURRENT_DATE - INTERVAL '24 hours'
        `);
        
        const metrics = result.rows[0];
        
        // Store in Redis
        await this.redis.client.hset('system_metrics', {
            totalUsers: metrics.total_users,
            totalAttempts: metrics.total_attempts,
            totalCorrect: metrics.total_correct,
            systemAccuracy: metrics.total_attempts > 0 ? metrics.total_correct / metrics.total_attempts : 0,
            avgResponseTime: metrics.avg_response_time || 0,
            lastUpdated: Date.now()
        });
    }
    
    async updateUserRankings() {
        // Update accuracy rankings
        const accuracyRankings = await this.pgPool.query(`
            SELECT user_id, current_accuracy
            FROM users
            WHERE total_questions_attempted >= 10
            ORDER BY current_accuracy DESC
            LIMIT 1000
        `);
        
        // Clear and repopulate leaderboard
        await this.redis.client.del('rankings:accuracy');
        for (let i = 0; i < accuracyRankings.rows.length; i++) {
            const user = accuracyRankings.rows[i];
            await this.redis.client.zadd('rankings:accuracy', user.current_accuracy, user.user_id);
        }
    }
    
    cleanupCache() {
        const now = Date.now();
        const cacheTimeout = 300000; // 5 minutes
        
        for (const [key, value] of this.performanceCache.entries()) {
            if (now - value.lastUpdated > cacheTimeout) {
                this.performanceCache.delete(key);
            }
        }
    }
    
    async cleanupOldData() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionPeriod);
        
        // Clean up old analytics data
        await this.mongodb.collection('performanceAnalytics').deleteMany({
            timestamp: { $lt: cutoffDate }
        });
        
        // Clean up old ability history
        await this.mongodb.collection('abilityHistory').deleteMany({
            timestamp: { $lt: cutoffDate }
        });
        
        console.log('Cleaned up old performance data');
    }
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
    parseTimeframe(timeframe) {
        const match = timeframe.match(/^(\d+)([hdwmy])$/);
        if (!match) return 7;
        
        const [, num, unit] = match;
        const multipliers = {
            h: 1/24,
            d: 1,
            w: 7,
            m: 30,
            y: 365
        };
        
        return parseInt(num) * multipliers[unit];
    }
    
    async awardMasteryPoints(userId, skill) {
        // This would integrate with the gamification system
        const points = 50; // Base points for mastering a skill
        
        // Emit event for gamification system
        this.emit('pointsAwarded', { userId, points, reason: 'skill_mastery', skill });
    }
    
    async awardMilestonePoints(userId, type, milestone) {
        // Calculate points based on milestone
        const points = Math.floor(milestone / 10) * 10;
        
        // Emit event for gamification system
        this.emit('pointsAwarded', { userId, points, reason: 'milestone', type, milestone });
    }
    
    // ============================================
    // API METHODS
    // ============================================
    
    async getUserPerformanceData(userId) {
        const [currentPerformance, skillMastery, subjectProgress, recentActivity] = await Promise.all([
            this.getCurrentPerformance(userId),
            this.getUserSkillMastery(userId),
            this.getUserSubjectProgress(userId),
            this.getRecentActivity(userId)
        ]);
        
        return {
            currentPerformance,
            skillMastery,
            subjectProgress,
            recentActivity,
            abilityEstimate: await this.getCurrentAbilityEstimate(userId)
        };
    }
    
    async getUserSkillMastery(userId) {
        const result = await this.pgPool.query(`
            SELECT 
                s.name as skill_name,
                sub.name as subject_name,
                us.mastery_level,
                us.confidence,
                us.attempts,
                us.correct,
                us.last_practiced
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            JOIN subjects sub ON s.subject_id = sub.id
            WHERE us.user_id = $1
            ORDER BY us.confidence DESC
        `, [userId]);
        
        return result.rows;
    }
    
    async getUserSubjectProgress(userId) {
        const result = await this.pgPool.query(`
            SELECT 
                sub.name as subject_name,
                us.progress,
                us.mastered_skills,
                us.total_skills
            FROM user_subjects us
            JOIN subjects sub ON us.subject_id = sub.id
            WHERE us.user_id = $1
            ORDER BY us.progress DESC
        `, [userId]);
        
        return result.rows;
    }
    
    async getRecentActivity(userId, limit = 10) {
        const result = await this.pgPool.query(`
            SELECT 
                ua.submitted_at,
                ua.is_correct,
                ua.duration_seconds,
                q.title as question_title,
                s.name as skill_name
            FROM user_attempts ua
            JOIN questions q ON ua.question_id = q.id
            JOIN skills s ON q.skill_id = s.id
            WHERE ua.user_id = $1
            ORDER BY ua.submitted_at DESC
            LIMIT $2
        `, [userId, limit]);
        
        return result.rows;
    }
    
    async getPerformanceTrends(userId, timeframe = '30d') {
        const timeframeDays = this.parseTimeframe(timeframe);
        const startDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);
        
        const trends = await this.mongodb.collection('performanceAnalytics').aggregate([
            {
                $match: {
                    userId,
                    timestamp: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$timestamp' },
                        month: { $month: '$timestamp' },
                        day: { $dayOfMonth: '$timestamp' }
                    },
                    attempts: { $sum: 1 },
                    correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
                    avgResponseTime: { $avg: '$responseTime' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]).toArray();
        
        return trends.map(trend => ({
            date: new Date(trend._id.year, trend._id.month - 1, trend._id.day),
            attempts: trend.attempts,
            correct: trend.correct,
            accuracy: trend.attempts > 0 ? trend.correct / trend.attempts : 0,
            avgResponseTime: trend.avgResponseTime
        }));
    }
    
    // ============================================
    // SHUTDOWN
    // ============================================
    
    async close() {
        await this.pgPool.end();
        await this.mongoClient.close();
        console.log('Performance tracker closed');
    }
}

module.exports = PerformanceTracker;