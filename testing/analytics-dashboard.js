// Comprehensive Analytics Dashboard for Math Help Testing System
// Real-time performance tracking and data visualization

const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const { redisManager } = require('../database/redis-config');
const EventEmitter = require('events');

class AnalyticsDashboard extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Dashboard refresh intervals
            realTimeInterval: 5000, // 5 seconds
            cacheInterval: 60000, // 1 minute
            reportInterval: 300000, // 5 minutes
            
            // Data retention periods
            realTimeRetention: 86400000, // 24 hours
            historicalRetention: 2592000000, // 30 days
            
            // Performance thresholds
            performanceThresholds: {
                responseTime: 500, // ms
                accuracy: 0.7,
                engagement: 0.8,
                completion: 0.9
            },
            
            // Alert settings
            enableAlerts: true,
            alertThresholds: {
                systemLoad: 0.8,
                errorRate: 0.05,
                userDropoff: 0.3
            },
            
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
        
        this.metricsCache = new Map();
        this.alertsHistory = [];
        
        this.initializeSystem();
    }
    
    async initializeSystem() {
        try {
            await this.mongoClient.connect();
            this.mongodb = this.mongoClient.db('mathhelp_testing');
            
            // Initialize analytics views
            await this.initializeAnalyticsViews();
            
            // Start real-time monitoring
            this.startRealTimeMonitoring();
            
            console.log('Analytics dashboard initialized');
        } catch (error) {
            console.error('Analytics dashboard initialization error:', error);
            throw error;
        }
    }
    
    async initializeAnalyticsViews() {
        // Create materialized views for performance
        await this.pgPool.query(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS user_performance_summary AS
            SELECT 
                u.id as user_id,
                u.username,
                u.grade_level,
                u.total_points,
                u.streak_days,
                COUNT(ua.id) as total_attempts,
                COUNT(ua.id) FILTER (WHERE ua.is_correct = true) as correct_attempts,
                ROUND(AVG(ua.duration_seconds), 2) as avg_response_time,
                ROUND(
                    (COUNT(ua.id) FILTER (WHERE ua.is_correct = true)::DECIMAL / 
                     NULLIF(COUNT(ua.id), 0)) * 100, 2
                ) as accuracy_percentage,
                MAX(ua.submitted_at) as last_activity
            FROM users u
            LEFT JOIN user_attempts ua ON u.id = ua.user_id
            GROUP BY u.id, u.username, u.grade_level, u.total_points, u.streak_days
            WITH DATA;
        `);
        
        await this.pgPool.query(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS question_performance_summary AS
            SELECT 
                q.id as question_id,
                q.title,
                q.difficulty_parameter,
                q.discrimination_parameter,
                sub.name as subject_name,
                s.name as skill_name,
                COUNT(ua.id) as total_attempts,
                COUNT(ua.id) FILTER (WHERE ua.is_correct = true) as correct_attempts,
                ROUND(
                    (COUNT(ua.id) FILTER (WHERE ua.is_correct = true)::DECIMAL / 
                     NULLIF(COUNT(ua.id), 0)) * 100, 2
                ) as success_rate,
                ROUND(AVG(ua.duration_seconds), 2) as avg_response_time,
                COUNT(DISTINCT ua.user_id) as unique_users
            FROM questions q
            LEFT JOIN user_attempts ua ON q.id = ua.question_id
            LEFT JOIN skills s ON q.skill_id = s.id
            LEFT JOIN subjects sub ON s.subject_id = sub.id
            GROUP BY q.id, q.title, q.difficulty_parameter, q.discrimination_parameter, sub.name, s.name
            WITH DATA;
        `);
        
        await this.pgPool.query(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS daily_usage_summary AS
            SELECT 
                DATE(created_at) as date,
                COUNT(DISTINCT user_id) as active_users,
                COUNT(*) as total_sessions,
                ROUND(AVG(duration_minutes), 2) as avg_session_duration,
                SUM(questions_answered) as total_questions,
                SUM(questions_correct) as total_correct,
                COUNT(*) FILTER (WHERE completed = true) as completed_sessions
            FROM test_sessions
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            WITH DATA;
        `);
        
        // Create indexes for better performance
        await this.pgPool.query(`
            CREATE INDEX IF NOT EXISTS idx_user_attempts_submitted_at 
            ON user_attempts(submitted_at);
        `);
        
        await this.pgPool.query(`
            CREATE INDEX IF NOT EXISTS idx_test_sessions_created_at 
            ON test_sessions(created_at);
        `);
    }
    
    // ============================================
    // REAL-TIME MONITORING
    // ============================================
    
    startRealTimeMonitoring() {
        // Start periodic data collection
        setInterval(() => this.collectRealTimeMetrics(), this.config.realTimeInterval);
        setInterval(() => this.refreshCachedMetrics(), this.config.cacheInterval);
        setInterval(() => this.generatePerformanceReports(), this.config.reportInterval);
        
        // Monitor system health
        setInterval(() => this.monitorSystemHealth(), this.config.realTimeInterval);
    }
    
    async collectRealTimeMetrics() {
        try {
            const timestamp = new Date();
            const metrics = {
                timestamp,
                activeUsers: await this.getActiveUsersCount(),
                activeSessions: await this.getActiveSessionsCount(),
                questionsPerMinute: await this.getQuestionsPerMinute(),
                avgResponseTime: await this.getAverageResponseTime(),
                accuracyRate: await this.getCurrentAccuracyRate(),
                systemLoad: await this.getSystemLoad(),
                errorRate: await this.getErrorRate()
            };
            
            // Store in Redis for real-time access
            await this.redis.client.zadd('real_time_metrics', Date.now(), JSON.stringify(metrics));
            
            // Keep only last 24 hours of data
            const cutoff = Date.now() - this.config.realTimeRetention;
            await this.redis.client.zremrangebyscore('real_time_metrics', 0, cutoff);
            
            // Store in MongoDB for historical analysis
            await this.mongodb.collection('realTimeMetrics').insertOne(metrics);
            
            // Emit event for subscribers
            this.emit('metricsUpdated', metrics);
            
            // Check for alerts
            await this.checkAlerts(metrics);
            
        } catch (error) {
            console.error('Real-time metrics collection error:', error);
        }
    }
    
    async getActiveUsersCount() {
        const result = await this.redis.client.zcard('active_users');
        return result || 0;
    }
    
    async getActiveSessionsCount() {
        const pattern = 'session:*';
        const keys = await this.redis.client.keys(pattern);
        let activeCount = 0;
        
        for (const key of keys) {
            const sessionData = await this.redis.client.get(key);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (session.isActive) {
                    activeCount++;
                }
            }
        }
        
        return activeCount;
    }
    
    async getQuestionsPerMinute() {
        const oneMinuteAgo = new Date(Date.now() - 60000);
        const result = await this.pgPool.query(`
            SELECT COUNT(*) as count
            FROM user_attempts
            WHERE submitted_at >= $1
        `, [oneMinuteAgo]);
        
        return parseInt(result.rows[0].count) || 0;
    }
    
    async getAverageResponseTime() {
        const fiveMinutesAgo = new Date(Date.now() - 300000);
        const result = await this.pgPool.query(`
            SELECT AVG(duration_seconds) as avg_time
            FROM user_attempts
            WHERE submitted_at >= $1
        `, [fiveMinutesAgo]);
        
        return parseFloat(result.rows[0].avg_time) || 0;
    }
    
    async getCurrentAccuracyRate() {
        const tenMinutesAgo = new Date(Date.now() - 600000);
        const result = await this.pgPool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE is_correct = true) as correct
            FROM user_attempts
            WHERE submitted_at >= $1
        `, [tenMinutesAgo]);
        
        const total = parseInt(result.rows[0].total);
        const correct = parseInt(result.rows[0].correct);
        
        return total > 0 ? correct / total : 0;
    }
    
    async getSystemLoad() {
        // This would integrate with system monitoring tools
        // For now, return a simulated value
        return Math.random() * 0.8;
    }
    
    async getErrorRate() {
        const fiveMinutesAgo = new Date(Date.now() - 300000);
        const errorCount = await this.mongodb.collection('errorLogs').countDocuments({
            timestamp: { $gte: fiveMinutesAgo }
        });
        
        const totalRequests = await this.mongodb.collection('requestLogs').countDocuments({
            timestamp: { $gte: fiveMinutesAgo }
        });
        
        return totalRequests > 0 ? errorCount / totalRequests : 0;
    }
    
    // ============================================
    // PERFORMANCE ANALYTICS
    // ============================================
    
    async getUserPerformanceAnalytics(userId, timeframe = '7d') {
        const timeframeDays = this.parseTimeframe(timeframe);
        const startDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);
        
        const [basicStats, progressTrend, skillBreakdown, streakHistory] = await Promise.all([
            this.getUserBasicStats(userId, startDate),
            this.getUserProgressTrend(userId, startDate),
            this.getUserSkillBreakdown(userId, startDate),
            this.getUserStreakHistory(userId, startDate)
        ]);
        
        return {
            userId,
            timeframe,
            basicStats,
            progressTrend,
            skillBreakdown,
            streakHistory,
            recommendations: await this.generateUserRecommendations(userId, basicStats)
        };
    }
    
    async getUserBasicStats(userId, startDate) {
        const result = await this.pgPool.query(`
            SELECT 
                COUNT(*) as total_attempts,
                COUNT(*) FILTER (WHERE is_correct = true) as correct_attempts,
                ROUND(AVG(duration_seconds), 2) as avg_response_time,
                COUNT(DISTINCT DATE(submitted_at)) as active_days,
                MIN(submitted_at) as first_attempt,
                MAX(submitted_at) as last_attempt
            FROM user_attempts
            WHERE user_id = $1 AND submitted_at >= $2
        `, [userId, startDate]);
        
        const stats = result.rows[0];
        const accuracy = stats.total_attempts > 0 ? 
            (stats.correct_attempts / stats.total_attempts) : 0;
        
        return {
            totalAttempts: parseInt(stats.total_attempts),
            correctAttempts: parseInt(stats.correct_attempts),
            accuracy: Math.round(accuracy * 100) / 100,
            avgResponseTime: parseFloat(stats.avg_response_time) || 0,
            activeDays: parseInt(stats.active_days),
            firstAttempt: stats.first_attempt,
            lastAttempt: stats.last_attempt
        };
    }
    
    async getUserProgressTrend(userId, startDate) {
        const result = await this.pgPool.query(`
            SELECT 
                DATE(submitted_at) as date,
                COUNT(*) as attempts,
                COUNT(*) FILTER (WHERE is_correct = true) as correct,
                ROUND(AVG(duration_seconds), 2) as avg_time
            FROM user_attempts
            WHERE user_id = $1 AND submitted_at >= $2
            GROUP BY DATE(submitted_at)
            ORDER BY date
        `, [userId, startDate]);
        
        return result.rows.map(row => ({
            date: row.date,
            attempts: parseInt(row.attempts),
            correct: parseInt(row.correct),
            accuracy: row.attempts > 0 ? row.correct / row.attempts : 0,
            avgTime: parseFloat(row.avg_time) || 0
        }));
    }
    
    async getUserSkillBreakdown(userId, startDate) {
        const result = await this.pgPool.query(`
            SELECT 
                s.name as skill_name,
                sub.name as subject_name,
                COUNT(*) as attempts,
                COUNT(*) FILTER (WHERE ua.is_correct = true) as correct,
                ROUND(AVG(ua.duration_seconds), 2) as avg_time,
                us.mastery_level
            FROM user_attempts ua
            JOIN questions q ON ua.question_id = q.id
            JOIN skills s ON q.skill_id = s.id
            JOIN subjects sub ON s.subject_id = sub.id
            LEFT JOIN user_skills us ON ua.user_id = us.user_id AND s.id = us.skill_id
            WHERE ua.user_id = $1 AND ua.submitted_at >= $2
            GROUP BY s.name, sub.name, us.mastery_level
            ORDER BY attempts DESC
        `, [userId, startDate]);
        
        return result.rows.map(row => ({
            skillName: row.skill_name,
            subjectName: row.subject_name,
            attempts: parseInt(row.attempts),
            correct: parseInt(row.correct),
            accuracy: row.attempts > 0 ? row.correct / row.attempts : 0,
            avgTime: parseFloat(row.avg_time) || 0,
            masteryLevel: row.mastery_level
        }));
    }
    
    async getUserStreakHistory(userId, startDate) {
        const streaks = await this.mongodb.collection('streakHistory').find({
            userId,
            timestamp: { $gte: startDate }
        }).sort({ timestamp: 1 }).toArray();
        
        return streaks.map(streak => ({
            date: streak.timestamp,
            streakDays: streak.streakDays,
            activity: streak.activity,
            isNewStreak: streak.isNewStreak
        }));
    }
    
    async generateUserRecommendations(userId, stats) {
        const recommendations = [];
        
        // Accuracy-based recommendations
        if (stats.accuracy < this.config.performanceThresholds.accuracy) {
            recommendations.push({
                type: 'accuracy',
                priority: 'high',
                message: 'Focus on accuracy by reviewing fundamental concepts',
                action: 'practice_basics',
                details: {
                    currentAccuracy: stats.accuracy,
                    targetAccuracy: this.config.performanceThresholds.accuracy
                }
            });
        }
        
        // Response time recommendations
        if (stats.avgResponseTime > this.config.performanceThresholds.responseTime) {
            recommendations.push({
                type: 'speed',
                priority: 'medium',
                message: 'Work on solving problems more efficiently',
                action: 'speed_practice',
                details: {
                    currentTime: stats.avgResponseTime,
                    targetTime: this.config.performanceThresholds.responseTime
                }
            });
        }
        
        // Engagement recommendations
        if (stats.activeDays < 5) {
            recommendations.push({
                type: 'engagement',
                priority: 'medium',
                message: 'Try to practice more regularly for better retention',
                action: 'daily_practice',
                details: {
                    currentDays: stats.activeDays,
                    targetDays: 7
                }
            });
        }
        
        return recommendations;
    }
    
    // ============================================
    // SYSTEM ANALYTICS
    // ============================================
    
    async getSystemAnalytics(timeframe = '24h') {
        const timeframeDays = this.parseTimeframe(timeframe);
        const startDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);
        
        const [usage, performance, content, errors] = await Promise.all([
            this.getSystemUsageStats(startDate),
            this.getSystemPerformanceStats(startDate),
            this.getContentAnalytics(startDate),
            this.getErrorAnalytics(startDate)
        ]);
        
        return {
            timeframe,
            usage,
            performance,
            content,
            errors,
            health: await this.getSystemHealth()
        };
    }
    
    async getSystemUsageStats(startDate) {
        const result = await this.pgPool.query(`
            SELECT 
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(*) as total_sessions,
                ROUND(AVG(duration_minutes), 2) as avg_session_duration,
                SUM(questions_answered) as total_questions,
                SUM(questions_correct) as total_correct
            FROM test_sessions
            WHERE created_at >= $1
        `, [startDate]);
        
        const stats = result.rows[0];
        
        return {
            uniqueUsers: parseInt(stats.unique_users),
            totalSessions: parseInt(stats.total_sessions),
            avgSessionDuration: parseFloat(stats.avg_session_duration) || 0,
            totalQuestions: parseInt(stats.total_questions),
            totalCorrect: parseInt(stats.total_correct),
            overallAccuracy: stats.total_questions > 0 ? 
                stats.total_correct / stats.total_questions : 0
        };
    }
    
    async getSystemPerformanceStats(startDate) {
        const [dbStats, redisStats] = await Promise.all([
            this.getDatabasePerformanceStats(startDate),
            this.getRedisPerformanceStats()
        ]);
        
        return {
            database: dbStats,
            redis: redisStats,
            responseTime: await this.getSystemResponseTime(startDate)
        };
    }
    
    async getDatabasePerformanceStats(startDate) {
        const result = await this.pgPool.query(`
            SELECT 
                COUNT(*) as total_queries,
                ROUND(AVG(duration_seconds), 4) as avg_query_time
            FROM query_logs
            WHERE timestamp >= $1
        `, [startDate]);
        
        return result.rows[0] || { total_queries: 0, avg_query_time: 0 };
    }
    
    async getRedisPerformanceStats() {
        const info = await this.redis.client.info('memory');
        const memoryUsage = info.split('\r\n').find(line => line.startsWith('used_memory:'));
        
        return {
            memoryUsage: memoryUsage ? memoryUsage.split(':')[1] : 'unknown',
            connectedClients: await this.redis.client.client('list').then(list => list.split('\n').length - 1)
        };
    }
    
    async getSystemResponseTime(startDate) {
        const metrics = await this.mongodb.collection('realTimeMetrics').find({
            timestamp: { $gte: startDate }
        }).sort({ timestamp: -1 }).limit(100).toArray();
        
        if (metrics.length === 0) return 0;
        
        const avgResponseTime = metrics.reduce((sum, metric) => sum + metric.avgResponseTime, 0) / metrics.length;
        return Math.round(avgResponseTime * 100) / 100;
    }
    
    async getContentAnalytics(startDate) {
        const result = await this.pgPool.query(`
            SELECT 
                sub.name as subject_name,
                COUNT(*) as total_attempts,
                COUNT(*) FILTER (WHERE ua.is_correct = true) as correct_attempts,
                COUNT(DISTINCT ua.user_id) as unique_users,
                ROUND(AVG(ua.duration_seconds), 2) as avg_response_time
            FROM user_attempts ua
            JOIN questions q ON ua.question_id = q.id
            JOIN skills s ON q.skill_id = s.id
            JOIN subjects sub ON s.subject_id = sub.id
            WHERE ua.submitted_at >= $1
            GROUP BY sub.name
            ORDER BY total_attempts DESC
        `, [startDate]);
        
        return result.rows.map(row => ({
            subjectName: row.subject_name,
            totalAttempts: parseInt(row.total_attempts),
            correctAttempts: parseInt(row.correct_attempts),
            accuracy: row.total_attempts > 0 ? row.correct_attempts / row.total_attempts : 0,
            uniqueUsers: parseInt(row.unique_users),
            avgResponseTime: parseFloat(row.avg_response_time) || 0
        }));
    }
    
    async getErrorAnalytics(startDate) {
        const errors = await this.mongodb.collection('errorLogs').find({
            timestamp: { $gte: startDate }
        }).toArray();
        
        const errorsByType = {};
        const errorsByEndpoint = {};
        
        errors.forEach(error => {
            errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
            errorsByEndpoint[error.endpoint] = (errorsByEndpoint[error.endpoint] || 0) + 1;
        });
        
        return {
            totalErrors: errors.length,
            errorsByType,
            errorsByEndpoint,
            recentErrors: errors.slice(-10) // Last 10 errors
        };
    }
    
    async getSystemHealth() {
        const [dbHealth, redisHealth, mongoHealth] = await Promise.all([
            this.checkDatabaseHealth(),
            this.checkRedisHealth(),
            this.checkMongoHealth()
        ]);
        
        const overallHealth = dbHealth.healthy && redisHealth.healthy && mongoHealth.healthy;
        
        return {
            overall: overallHealth ? 'healthy' : 'degraded',
            database: dbHealth,
            redis: redisHealth,
            mongodb: mongoHealth,
            timestamp: new Date()
        };
    }
    
    async checkDatabaseHealth() {
        try {
            const result = await this.pgPool.query('SELECT 1 as health');
            return {
                healthy: result.rows.length > 0,
                responseTime: Date.now() - performance.now()
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message
            };
        }
    }
    
    async checkRedisHealth() {
        try {
            const pong = await this.redis.client.ping();
            return {
                healthy: pong === 'PONG',
                responseTime: Date.now() - performance.now()
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message
            };
        }
    }
    
    async checkMongoHealth() {
        try {
            const adminDb = this.mongodb.admin();
            const result = await adminDb.ping();
            return {
                healthy: result.ok === 1,
                responseTime: Date.now() - performance.now()
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message
            };
        }
    }
    
    // ============================================
    // ALERTS AND MONITORING
    // ============================================
    
    async checkAlerts(metrics) {
        const alerts = [];
        
        // System load alert
        if (metrics.systemLoad > this.config.alertThresholds.systemLoad) {
            alerts.push({
                type: 'system_load',
                severity: 'warning',
                message: `High system load: ${(metrics.systemLoad * 100).toFixed(1)}%`,
                threshold: this.config.alertThresholds.systemLoad,
                current: metrics.systemLoad,
                timestamp: new Date()
            });
        }
        
        // Error rate alert
        if (metrics.errorRate > this.config.alertThresholds.errorRate) {
            alerts.push({
                type: 'error_rate',
                severity: 'critical',
                message: `High error rate: ${(metrics.errorRate * 100).toFixed(1)}%`,
                threshold: this.config.alertThresholds.errorRate,
                current: metrics.errorRate,
                timestamp: new Date()
            });
        }
        
        // Response time alert
        if (metrics.avgResponseTime > this.config.performanceThresholds.responseTime) {
            alerts.push({
                type: 'response_time',
                severity: 'warning',
                message: `Slow response time: ${metrics.avgResponseTime}s`,
                threshold: this.config.performanceThresholds.responseTime,
                current: metrics.avgResponseTime,
                timestamp: new Date()
            });
        }
        
        if (alerts.length > 0) {
            await this.processAlerts(alerts);
        }
    }
    
    async processAlerts(alerts) {
        for (const alert of alerts) {
            // Store alert
            await this.mongodb.collection('alerts').insertOne(alert);
            
            // Add to history
            this.alertsHistory.push(alert);
            
            // Keep only last 100 alerts in memory
            if (this.alertsHistory.length > 100) {
                this.alertsHistory = this.alertsHistory.slice(-100);
            }
            
            // Emit alert event
            this.emit('alert', alert);
            
            // Log critical alerts
            if (alert.severity === 'critical') {
                console.error('CRITICAL ALERT:', alert.message);
            }
        }
    }
    
    // ============================================
    // REPORTING
    // ============================================
    
    async generatePerformanceReports() {
        const reports = {
            daily: await this.generateDailyReport(),
            weekly: await this.generateWeeklyReport(),
            monthly: await this.generateMonthlyReport()
        };
        
        // Store reports
        await this.mongodb.collection('performanceReports').insertOne({
            timestamp: new Date(),
            ...reports
        });
        
        return reports;
    }
    
    async generateDailyReport() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const result = await this.pgPool.query(`
            SELECT 
                COUNT(DISTINCT user_id) as active_users,
                COUNT(*) as total_sessions,
                SUM(questions_answered) as total_questions,
                SUM(questions_correct) as total_correct,
                ROUND(AVG(duration_minutes), 2) as avg_session_duration
            FROM test_sessions
            WHERE created_at >= $1 AND created_at < $2
        `, [yesterday, today]);
        
        return result.rows[0];
    }
    
    async generateWeeklyReport() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const result = await this.pgPool.query(`
            SELECT 
                COUNT(DISTINCT user_id) as active_users,
                COUNT(*) as total_sessions,
                SUM(questions_answered) as total_questions,
                SUM(questions_correct) as total_correct,
                ROUND(AVG(duration_minutes), 2) as avg_session_duration
            FROM test_sessions
            WHERE created_at >= $1
        `, [weekAgo]);
        
        return result.rows[0];
    }
    
    async generateMonthlyReport() {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        const result = await this.pgPool.query(`
            SELECT 
                COUNT(DISTINCT user_id) as active_users,
                COUNT(*) as total_sessions,
                SUM(questions_answered) as total_questions,
                SUM(questions_correct) as total_correct,
                ROUND(AVG(duration_minutes), 2) as avg_session_duration
            FROM test_sessions
            WHERE created_at >= $1
        `, [monthAgo]);
        
        return result.rows[0];
    }
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
    parseTimeframe(timeframe) {
        const match = timeframe.match(/^(\d+)([hdwmy])$/);
        if (!match) return 1;
        
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
    
    async refreshCachedMetrics() {
        // Refresh materialized views
        await this.pgPool.query('REFRESH MATERIALIZED VIEW user_performance_summary');
        await this.pgPool.query('REFRESH MATERIALIZED VIEW question_performance_summary');
        await this.pgPool.query('REFRESH MATERIALIZED VIEW daily_usage_summary');
        
        console.log('Analytics views refreshed');
    }
    
    async monitorSystemHealth() {
        const health = await this.getSystemHealth();
        
        if (!health.overall) {
            console.warn('System health degraded:', health);
        }
        
        // Store health check
        await this.mongodb.collection('healthChecks').insertOne(health);
        
        // Emit health event
        this.emit('healthCheck', health);
    }
    
    // ============================================
    // API METHODS
    // ============================================
    
    async getDashboardData(timeframe = '24h') {
        const [systemAnalytics, realTimeMetrics, alerts] = await Promise.all([
            this.getSystemAnalytics(timeframe),
            this.getRealTimeMetrics(100),
            this.getRecentAlerts(50)
        ]);
        
        return {
            systemAnalytics,
            realTimeMetrics,
            alerts,
            health: systemAnalytics.health,
            timestamp: new Date()
        };
    }
    
    async getRealTimeMetrics(limit = 100) {
        const metrics = await this.redis.client.zrevrange('real_time_metrics', 0, limit - 1);
        return metrics.map(metric => JSON.parse(metric));
    }
    
    async getRecentAlerts(limit = 50) {
        const alerts = await this.mongodb.collection('alerts')
            .find({})
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();
        
        return alerts;
    }
    
    async getDetailedUserAnalytics(userId, timeframe = '7d') {
        return await this.getUserPerformanceAnalytics(userId, timeframe);
    }
    
    async getContentPerformanceAnalytics(timeframe = '7d') {
        const timeframeDays = this.parseTimeframe(timeframe);
        const startDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);
        
        const [questionPerformance, skillPerformance] = await Promise.all([
            this.getQuestionPerformanceAnalytics(startDate),
            this.getSkillPerformanceAnalytics(startDate)
        ]);
        
        return {
            timeframe,
            questionPerformance,
            skillPerformance
        };
    }
    
    async getQuestionPerformanceAnalytics(startDate) {
        const result = await this.pgPool.query(`
            SELECT 
                q.id,
                q.title,
                q.difficulty_parameter,
                COUNT(*) as attempts,
                COUNT(*) FILTER (WHERE ua.is_correct = true) as correct,
                ROUND(AVG(ua.duration_seconds), 2) as avg_time,
                COUNT(DISTINCT ua.user_id) as unique_users
            FROM questions q
            JOIN user_attempts ua ON q.id = ua.question_id
            WHERE ua.submitted_at >= $1
            GROUP BY q.id, q.title, q.difficulty_parameter
            ORDER BY attempts DESC
            LIMIT 100
        `, [startDate]);
        
        return result.rows.map(row => ({
            questionId: row.id,
            title: row.title,
            difficulty: row.difficulty_parameter,
            attempts: parseInt(row.attempts),
            correct: parseInt(row.correct),
            accuracy: row.attempts > 0 ? row.correct / row.attempts : 0,
            avgTime: parseFloat(row.avg_time) || 0,
            uniqueUsers: parseInt(row.unique_users)
        }));
    }
    
    async getSkillPerformanceAnalytics(startDate) {
        const result = await this.pgPool.query(`
            SELECT 
                s.id,
                s.name,
                sub.name as subject_name,
                COUNT(*) as attempts,
                COUNT(*) FILTER (WHERE ua.is_correct = true) as correct,
                ROUND(AVG(ua.duration_seconds), 2) as avg_time,
                COUNT(DISTINCT ua.user_id) as unique_users
            FROM skills s
            JOIN questions q ON s.id = q.skill_id
            JOIN user_attempts ua ON q.id = ua.question_id
            JOIN subjects sub ON s.subject_id = sub.id
            WHERE ua.submitted_at >= $1
            GROUP BY s.id, s.name, sub.name
            ORDER BY attempts DESC
        `, [startDate]);
        
        return result.rows.map(row => ({
            skillId: row.id,
            skillName: row.name,
            subjectName: row.subject_name,
            attempts: parseInt(row.attempts),
            correct: parseInt(row.correct),
            accuracy: row.attempts > 0 ? row.correct / row.attempts : 0,
            avgTime: parseFloat(row.avg_time) || 0,
            uniqueUsers: parseInt(row.unique_users)
        }));
    }
    
    // ============================================
    // CLEANUP AND SHUTDOWN
    // ============================================
    
    async close() {
        await this.pgPool.end();
        await this.mongoClient.close();
        console.log('Analytics dashboard closed');
    }
}

module.exports = AnalyticsDashboard;