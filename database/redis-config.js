// Redis Configuration and Data Structures for Math Help Testing System
// High-performance caching and real-time leaderboards

const redis = require('redis');

// Redis Client Configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: process.env.REDIS_DB || 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    commandTimeout: 5000,
    family: 4,
    keepAlive: true,
    
    // Connection pooling
    lazyConnect: true,
    maxConnections: 10,
    
    // Cluster configuration (if using Redis Cluster)
    enableOfflineQueue: false,
    
    // Key expiration defaults
    defaultTTL: 3600, // 1 hour
    longTTL: 86400,   // 24 hours
    shortTTL: 300     // 5 minutes
};

// Create Redis client
const client = redis.createClient(redisConfig);

// Error handling
client.on('error', (error) => {
    console.error('Redis Client Error:', error);
});

client.on('connect', () => {
    console.log('Redis Client Connected');
});

client.on('ready', () => {
    console.log('Redis Client Ready');
});

// ============================================
// REDIS DATA STRUCTURES AND OPERATIONS
// ============================================

class RedisManager {
    constructor() {
        this.client = client;
    }

    // ============================================
    // LEADERBOARD OPERATIONS
    // ============================================

    // Update user score in leaderboard
    async updateLeaderboard(leaderboardType, userId, score, userInfo = {}) {
        const key = `leaderboard:${leaderboardType}`;
        const pipeline = this.client.pipeline();
        
        // Add to sorted set with score
        pipeline.zadd(key, score, userId);
        
        // Store user info for leaderboard display
        if (Object.keys(userInfo).length > 0) {
            pipeline.hset(`user:${userId}:info`, userInfo);
        }
        
        // Set expiration if it's a temporary leaderboard
        if (leaderboardType.startsWith('weekly') || leaderboardType.startsWith('daily')) {
            const expiration = leaderboardType.startsWith('weekly') ? 
                7 * 24 * 3600 : 24 * 3600;
            pipeline.expire(key, expiration);
        }
        
        await pipeline.exec();
    }

    // Get leaderboard rankings
    async getLeaderboard(leaderboardType, start = 0, end = 99, withScores = true) {
        const key = `leaderboard:${leaderboardType}`;
        
        let rankings;
        if (withScores) {
            rankings = await this.client.zrevrange(key, start, end, 'WITHSCORES');
        } else {
            rankings = await this.client.zrevrange(key, start, end);
        }
        
        // Format results
        const results = [];
        for (let i = 0; i < rankings.length; i += withScores ? 2 : 1) {
            const userId = rankings[i];
            const score = withScores ? parseFloat(rankings[i + 1]) : null;
            const rank = start + Math.floor(i / (withScores ? 2 : 1)) + 1;
            
            // Get user info
            const userInfo = await this.client.hgetall(`user:${userId}:info`);
            
            results.push({
                rank,
                userId,
                score,
                username: userInfo.username || 'Unknown',
                displayName: userInfo.displayName || userInfo.username || 'Unknown',
                avatar: userInfo.avatar || null,
                gradeLevel: userInfo.gradeLevel || null
            });
        }
        
        return results;
    }

    // Get user's rank in leaderboard
    async getUserRank(leaderboardType, userId) {
        const key = `leaderboard:${leaderboardType}`;
        const rank = await this.client.zrevrank(key, userId);
        const score = await this.client.zscore(key, userId);
        
        return {
            rank: rank !== null ? rank + 1 : null,
            score: score !== null ? parseFloat(score) : null
        };
    }

    // Create subject-specific leaderboards
    async createSubjectLeaderboards(subjects) {
        const pipeline = this.client.pipeline();
        
        subjects.forEach(subject => {
            const key = `leaderboard:subject:${subject}`;
            // Initialize with empty sorted set
            pipeline.zadd(key, 0, 'placeholder');
            pipeline.zrem(key, 'placeholder');
            pipeline.expire(key, redisConfig.longTTL);
        });
        
        await pipeline.exec();
    }

    // ============================================
    // USER SESSION MANAGEMENT
    // ============================================

    // Store user session data
    async storeUserSession(userId, sessionData) {
        const key = `session:${userId}`;
        const data = {
            ...sessionData,
            lastActivity: Date.now(),
            createdAt: sessionData.createdAt || Date.now()
        };
        
        await this.client.hset(key, data);
        await this.client.expire(key, redisConfig.defaultTTL);
    }

    // Get user session
    async getUserSession(userId) {
        const key = `session:${userId}`;
        const session = await this.client.hgetall(key);
        
        if (Object.keys(session).length === 0) {
            return null;
        }
        
        // Convert numeric fields
        ['lastActivity', 'createdAt', 'currentAbility', 'standardError', 'questionsAnswered'].forEach(field => {
            if (session[field]) {
                session[field] = parseFloat(session[field]);
            }
        });
        
        return session;
    }

    // Update user session
    async updateUserSession(userId, updates) {
        const key = `session:${userId}`;
        const updateData = {
            ...updates,
            lastActivity: Date.now()
        };
        
        await this.client.hset(key, updateData);
        await this.client.expire(key, redisConfig.defaultTTL);
    }

    // ============================================
    // QUESTION CACHING
    // ============================================

    // Cache frequently accessed questions
    async cacheQuestion(questionId, questionData) {
        const key = `question:${questionId}`;
        
        await this.client.setex(
            key,
            redisConfig.longTTL,
            JSON.stringify(questionData)
        );
    }

    // Get cached question
    async getCachedQuestion(questionId) {
        const key = `question:${questionId}`;
        const cached = await this.client.get(key);
        
        return cached ? JSON.parse(cached) : null;
    }

    // Cache question sets for adaptive testing
    async cacheQuestionSet(setId, questions) {
        const key = `questionset:${setId}`;
        
        await this.client.setex(
            key,
            redisConfig.shortTTL,
            JSON.stringify(questions)
        );
    }

    // Get cached question set
    async getCachedQuestionSet(setId) {
        const key = `questionset:${setId}`;
        const cached = await this.client.get(key);
        
        return cached ? JSON.parse(cached) : null;
    }

    // ============================================
    // ADAPTIVE TESTING CACHE
    // ============================================

    // Store adaptive test state
    async storeAdaptiveTestState(sessionId, state) {
        const key = `adaptive:${sessionId}`;
        
        await this.client.setex(
            key,
            redisConfig.defaultTTL,
            JSON.stringify(state)
        );
    }

    // Get adaptive test state
    async getAdaptiveTestState(sessionId) {
        const key = `adaptive:${sessionId}`;
        const cached = await this.client.get(key);
        
        return cached ? JSON.parse(cached) : null;
    }

    // Update adaptive test state
    async updateAdaptiveTestState(sessionId, updates) {
        const key = `adaptive:${sessionId}`;
        const current = await this.getAdaptiveTestState(sessionId);
        
        if (current) {
            const updated = { ...current, ...updates };
            await this.client.setex(
                key,
                redisConfig.defaultTTL,
                JSON.stringify(updated)
            );
        }
    }

    // ============================================
    // PERFORMANCE METRICS
    // ============================================

    // Track question response times
    async trackResponseTime(questionId, responseTime) {
        const key = `metrics:response_time:${questionId}`;
        
        // Use Redis streams for time-series data
        await this.client.xadd(
            key,
            '*',
            'response_time', responseTime,
            'timestamp', Date.now()
        );
        
        // Keep only last 1000 entries
        await this.client.xtrim(key, 'MAXLEN', '~', 1000);
    }

    // Get average response time for question
    async getAverageResponseTime(questionId) {
        const key = `metrics:response_time:${questionId}`;
        const entries = await this.client.xrange(key, '-', '+');
        
        if (entries.length === 0) return null;
        
        const times = entries.map(entry => parseFloat(entry[1][1]));
        return times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    // Track system performance
    async trackSystemMetric(metricName, value) {
        const key = `metrics:system:${metricName}`;
        
        await this.client.xadd(
            key,
            '*',
            'value', value,
            'timestamp', Date.now()
        );
        
        // Keep only last 24 hours of data
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        await this.client.xtrim(key, 'MINID', oneDayAgo);
    }

    // ============================================
    // RATE LIMITING
    // ============================================

    // Check rate limit for user
    async checkRateLimit(userId, action, limit = 100, window = 3600) {
        const key = `rate_limit:${userId}:${action}`;
        const current = await this.client.incr(key);
        
        if (current === 1) {
            await this.client.expire(key, window);
        }
        
        return {
            allowed: current <= limit,
            current: current,
            limit: limit,
            remaining: Math.max(0, limit - current)
        };
    }

    // ============================================
    // REAL-TIME NOTIFICATIONS
    // ============================================

    // Publish real-time updates
    async publishUpdate(channel, data) {
        await this.client.publish(channel, JSON.stringify(data));
    }

    // Subscribe to real-time updates
    async subscribeToUpdates(channel, callback) {
        const subscriber = this.client.duplicate();
        
        subscriber.on('message', (receivedChannel, message) => {
            if (receivedChannel === channel) {
                try {
                    const data = JSON.parse(message);
                    callback(data);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            }
        });
        
        await subscriber.subscribe(channel);
        return subscriber;
    }

    // ============================================
    // ACHIEVEMENT TRACKING
    // ============================================

    // Track user achievements
    async trackAchievement(userId, achievementType, progress) {
        const key = `achievement:${userId}:${achievementType}`;
        
        await this.client.hset(key, {
            progress: progress,
            lastUpdated: Date.now()
        });
        
        await this.client.expire(key, redisConfig.longTTL);
    }

    // Get achievement progress
    async getAchievementProgress(userId, achievementType) {
        const key = `achievement:${userId}:${achievementType}`;
        const data = await this.client.hgetall(key);
        
        return data.progress ? {
            progress: parseFloat(data.progress),
            lastUpdated: parseInt(data.lastUpdated)
        } : null;
    }

    // ============================================
    // ANALYTICS AGGREGATION
    // ============================================

    // Store daily aggregated data
    async storeDailyAggregation(date, data) {
        const key = `analytics:daily:${date}`;
        
        await this.client.setex(
            key,
            redisConfig.longTTL * 30, // Keep for 30 days
            JSON.stringify(data)
        );
    }

    // Get daily aggregated data
    async getDailyAggregation(date) {
        const key = `analytics:daily:${date}`;
        const cached = await this.client.get(key);
        
        return cached ? JSON.parse(cached) : null;
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    // Clear user-specific cache
    async clearUserCache(userId) {
        const pattern = `*:${userId}:*`;
        const keys = await this.client.keys(pattern);
        
        if (keys.length > 0) {
            await this.client.del(...keys);
        }
    }

    // Get Redis statistics
    async getRedisStats() {
        const info = await this.client.info();
        const keyspace = await this.client.info('keyspace');
        
        return {
            info: info,
            keyspace: keyspace,
            memoryUsage: await this.client.memory('usage'),
            connectedClients: await this.client.client('list')
        };
    }

    // Health check
    async healthCheck() {
        try {
            await this.client.ping();
            return { status: 'healthy', timestamp: Date.now() };
        } catch (error) {
            return { status: 'unhealthy', error: error.message, timestamp: Date.now() };
        }
    }

    // Close connection
    async close() {
        await this.client.quit();
    }
}

// ============================================
// INITIALIZATION AND EXPORT
// ============================================

// Initialize Redis manager
const redisManager = new RedisManager();

// Initialize default leaderboards
async function initializeLeaderboards() {
    const leaderboards = [
        'global_points',
        'global_streak',
        'global_accuracy',
        'weekly_points',
        'weekly_streak',
        'daily_points',
        'algebra_points',
        'geometry_points',
        'calculus_points',
        'grade_9_points',
        'grade_10_points',
        'grade_11_points',
        'grade_12_points'
    ];
    
    const pipeline = redisManager.client.pipeline();
    
    leaderboards.forEach(board => {
        const key = `leaderboard:${board}`;
        pipeline.zadd(key, 0, 'placeholder');
        pipeline.zrem(key, 'placeholder');
        
        // Set appropriate expiration
        if (board.startsWith('weekly')) {
            pipeline.expire(key, 7 * 24 * 3600);
        } else if (board.startsWith('daily')) {
            pipeline.expire(key, 24 * 3600);
        }
    });
    
    await pipeline.exec();
    console.log('Leaderboards initialized');
}

// Initialize on startup
client.on('ready', async () => {
    try {
        await initializeLeaderboards();
        console.log('Redis initialization complete');
    } catch (error) {
        console.error('Redis initialization error:', error);
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down Redis connection...');
    await redisManager.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down Redis connection...');
    await redisManager.close();
    process.exit(0);
});

module.exports = {
    RedisManager,
    redisManager,
    redisConfig,
    client
};