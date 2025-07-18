// Comprehensive Gamification System for Math Help Testing System
// Includes leaderboards, achievements, streaks, and social features

const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const { redisManager } = require('../database/redis-config');
const EventEmitter = require('events');

class GamificationSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Point system
            pointsPerCorrectAnswer: 10,
            pointsPerQuestionAttempt: 2,
            streakBonusMultiplier: 1.2,
            difficultyMultiplier: {
                easy: 1.0,
                medium: 1.5,
                hard: 2.0,
                expert: 2.5
            },
            
            // Achievement system
            achievementCategories: ['milestone', 'streak', 'accuracy', 'speed', 'mastery', 'social'],
            badgeTiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
            
            // Leaderboard settings
            leaderboardRefreshInterval: 300000, // 5 minutes
            leaderboardSize: 100,
            leaderboardTypes: ['global', 'grade', 'school', 'friends'],
            
            // Streak settings
            streakTimeWindow: 86400000, // 24 hours
            streakGracePeriod: 7200000, // 2 hours
            
            // Social features
            enableSocial: true,
            maxFriends: 50,
            
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
        
        this.initializeSystem();
    }
    
    async initializeSystem() {
        try {
            await this.mongoClient.connect();
            this.mongodb = this.mongoClient.db('mathhelp_testing');
            
            // Initialize achievement templates
            await this.initializeAchievements();
            
            // Initialize leaderboards
            await this.initializeLeaderboards();
            
            console.log('Gamification system initialized');
        } catch (error) {
            console.error('Gamification system initialization error:', error);
            throw error;
        }
    }
    
    // ============================================
    // POINT SYSTEM
    // ============================================
    
    /**
     * Award points for user actions
     */
    async awardPoints(userId, action, metadata = {}) {
        let points = 0;
        let multiplier = 1;
        
        switch (action) {
            case 'correct_answer':
                points = this.config.pointsPerCorrectAnswer;
                
                // Difficulty multiplier
                if (metadata.difficulty) {
                    multiplier *= this.config.difficultyMultiplier[metadata.difficulty] || 1;
                }
                
                // Streak bonus
                if (metadata.streakDays && metadata.streakDays > 0) {
                    multiplier *= Math.pow(this.config.streakBonusMultiplier, Math.min(metadata.streakDays, 30));
                }
                
                // Speed bonus
                if (metadata.responseTime && metadata.expectedTime) {
                    const speedRatio = metadata.expectedTime / metadata.responseTime;
                    if (speedRatio > 1.5) {
                        multiplier *= 1.1; // 10% bonus for fast responses
                    }
                }
                break;
                
            case 'question_attempt':
                points = this.config.pointsPerQuestionAttempt;
                break;
                
            case 'streak_milestone':
                points = metadata.streakDays * 5;
                break;
                
            case 'achievement_earned':
                points = metadata.achievementPoints || 0;
                break;
                
            case 'quiz_completed':
                points = metadata.questionsCorrect * 5;
                break;
                
            case 'skill_mastered':
                points = 50;
                break;
                
            default:
                points = 0;
        }
        
        const totalPoints = Math.floor(points * multiplier);
        
        if (totalPoints > 0) {
            await this.addPointsToUser(userId, totalPoints, action, metadata);
        }
        
        return totalPoints;
    }
    
    /**
     * Add points to user's total
     */
    async addPointsToUser(userId, points, action, metadata) {
        // Update PostgreSQL
        await this.pgPool.query(`
            UPDATE users 
            SET total_points = total_points + $1, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2
        `, [points, userId]);
        
        // Update Redis leaderboards
        await this.updateLeaderboards(userId, points, action);
        
        // Store point transaction
        await this.storePointTransaction(userId, points, action, metadata);
        
        // Check for achievements
        await this.checkAchievements(userId, action, metadata);
        
        // Emit event
        this.emit('pointsAwarded', { userId, points, action, metadata });
    }
    
    /**
     * Store point transaction for auditing
     */
    async storePointTransaction(userId, points, action, metadata) {
        await this.mongodb.collection('pointTransactions').insertOne({
            userId,
            points,
            action,
            metadata,
            timestamp: new Date(),
            balanceAfter: await this.getUserPoints(userId)
        });
    }
    
    /**
     * Get user's total points
     */
    async getUserPoints(userId) {
        const result = await this.pgPool.query(
            'SELECT total_points FROM users WHERE id = $1',
            [userId]
        );
        
        return result.rows[0]?.total_points || 0;
    }
    
    // ============================================
    // STREAK SYSTEM
    // ============================================
    
    /**
     * Update user's streak
     */
    async updateStreak(userId, activity = 'question_correct') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Get current streak data
        const streakData = await this.getStreakData(userId);
        
        let newStreakDays = 1;
        let isNewStreak = false;
        
        if (streakData) {
            const lastActivity = new Date(streakData.lastActivityDate);
            const lastActivityDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
            
            if (lastActivityDay.getTime() === today.getTime()) {
                // Already active today, no change to streak
                return streakData.currentStreak;
            } else if (lastActivityDay.getTime() === yesterday.getTime()) {
                // Consecutive day, extend streak
                newStreakDays = streakData.currentStreak + 1;
            } else {
                // Streak broken, start new
                newStreakDays = 1;
                isNewStreak = true;
            }
        }
        
        // Update streak in database
        await this.pgPool.query(`
            UPDATE users 
            SET streak_days = $1, 
                longest_streak = GREATEST(longest_streak, $1),
                last_activity_date = CURRENT_DATE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
        `, [newStreakDays, userId]);
        
        // Store streak history
        await this.storeStreakHistory(userId, newStreakDays, activity, isNewStreak);
        
        // Check for streak achievements
        await this.checkStreakAchievements(userId, newStreakDays);
        
        // Award streak bonus points
        if (newStreakDays > 1) {
            await this.awardPoints(userId, 'streak_milestone', { streakDays: newStreakDays });
        }
        
        // Emit event
        this.emit('streakUpdated', { userId, streakDays: newStreakDays, isNewStreak });
        
        return newStreakDays;
    }
    
    /**
     * Get user's streak data
     */
    async getStreakData(userId) {
        const result = await this.pgPool.query(`
            SELECT streak_days as currentStreak, 
                   longest_streak as longestStreak,
                   last_activity_date as lastActivityDate
            FROM users 
            WHERE id = $1
        `, [userId]);
        
        return result.rows[0] || null;
    }
    
    /**
     * Store streak history
     */
    async storeStreakHistory(userId, streakDays, activity, isNewStreak) {
        await this.mongodb.collection('streakHistory').insertOne({
            userId,
            streakDays,
            activity,
            isNewStreak,
            timestamp: new Date()
        });
    }
    
    /**
     * Check for streak achievements
     */
    async checkStreakAchievements(userId, streakDays) {
        const streakMilestones = [7, 14, 30, 60, 100, 365];
        
        for (const milestone of streakMilestones) {
            if (streakDays >= milestone) {
                await this.checkAndAwardAchievement(userId, `streak_${milestone}`, { streakDays });
            }
        }
    }
    
    // ============================================
    // ACHIEVEMENT SYSTEM
    // ============================================
    
    /**
     * Initialize achievement templates
     */
    async initializeAchievements() {
        const achievements = [
            // Milestone achievements
            {
                id: 'first_correct',
                name: 'First Steps',
                description: 'Answer your first question correctly',
                category: 'milestone',
                icon: '🎯',
                badgeTier: 'bronze',
                points: 10,
                requirements: {
                    type: 'questions_correct',
                    count: 1
                }
            },
            {
                id: 'problem_solver',
                name: 'Problem Solver',
                description: 'Answer 10 questions correctly',
                category: 'milestone',
                icon: '🧠',
                badgeTier: 'bronze',
                points: 50,
                requirements: {
                    type: 'questions_correct',
                    count: 10
                }
            },
            {
                id: 'math_enthusiast',
                name: 'Math Enthusiast',
                description: 'Answer 100 questions correctly',
                category: 'milestone',
                icon: '📚',
                badgeTier: 'silver',
                points: 200,
                requirements: {
                    type: 'questions_correct',
                    count: 100
                }
            },
            {
                id: 'math_expert',
                name: 'Math Expert',
                description: 'Answer 1000 questions correctly',
                category: 'milestone',
                icon: '👑',
                badgeTier: 'gold',
                points: 1000,
                requirements: {
                    type: 'questions_correct',
                    count: 1000
                }
            },
            
            // Streak achievements
            {
                id: 'streak_7',
                name: 'Week Warrior',
                description: 'Maintain a 7-day streak',
                category: 'streak',
                icon: '🔥',
                badgeTier: 'bronze',
                points: 100,
                requirements: {
                    type: 'streak_days',
                    count: 7
                }
            },
            {
                id: 'streak_30',
                name: 'Month Master',
                description: 'Maintain a 30-day streak',
                category: 'streak',
                icon: '⚡',
                badgeTier: 'silver',
                points: 500,
                requirements: {
                    type: 'streak_days',
                    count: 30
                }
            },
            {
                id: 'streak_100',
                name: 'Century Challenger',
                description: 'Maintain a 100-day streak',
                category: 'streak',
                icon: '💫',
                badgeTier: 'gold',
                points: 2000,
                requirements: {
                    type: 'streak_days',
                    count: 100
                }
            },
            
            // Accuracy achievements
            {
                id: 'perfect_10',
                name: 'Perfect Ten',
                description: 'Answer 10 questions correctly in a row',
                category: 'accuracy',
                icon: '🎯',
                badgeTier: 'bronze',
                points: 100,
                requirements: {
                    type: 'consecutive_correct',
                    count: 10
                }
            },
            {
                id: 'accuracy_master',
                name: 'Accuracy Master',
                description: 'Achieve 90% accuracy over 50 questions',
                category: 'accuracy',
                icon: '🏆',
                badgeTier: 'gold',
                points: 300,
                requirements: {
                    type: 'accuracy_rate',
                    rate: 0.9,
                    minimumQuestions: 50
                }
            },
            
            // Speed achievements
            {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Answer 20 questions in under 30 seconds each',
                category: 'speed',
                icon: '⚡',
                badgeTier: 'silver',
                points: 250,
                requirements: {
                    type: 'fast_answers',
                    count: 20,
                    maxTime: 30
                }
            },
            
            // Mastery achievements
            {
                id: 'algebra_master',
                name: 'Algebra Master',
                description: 'Master all algebra skills',
                category: 'mastery',
                icon: '🧮',
                badgeTier: 'gold',
                points: 500,
                requirements: {
                    type: 'subject_mastery',
                    subject: 'algebra'
                }
            },
            {
                id: 'geometry_master',
                name: 'Geometry Master',
                description: 'Master all geometry skills',
                category: 'mastery',
                icon: '📐',
                badgeTier: 'gold',
                points: 500,
                requirements: {
                    type: 'subject_mastery',
                    subject: 'geometry'
                }
            },
            
            // Social achievements
            {
                id: 'helpful_friend',
                name: 'Helpful Friend',
                description: 'Help 10 friends with questions',
                category: 'social',
                icon: '🤝',
                badgeTier: 'silver',
                points: 200,
                requirements: {
                    type: 'friends_helped',
                    count: 10
                }
            }
        ];
        
        // Insert achievements into database
        for (const achievement of achievements) {
            await this.pgPool.query(`
                INSERT INTO achievements (id, name, description, category, icon, badge_tier, points_awarded, requirement_type, requirement_config)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    points_awarded = EXCLUDED.points_awarded
            `, [
                achievement.id,
                achievement.name,
                achievement.description,
                achievement.category,
                achievement.icon,
                achievement.badgeTier,
                achievement.points,
                achievement.requirements.type,
                JSON.stringify(achievement.requirements)
            ]);
        }
    }
    
    /**
     * Check and award achievement
     */
    async checkAndAwardAchievement(userId, achievementId, metadata = {}) {
        // Check if user already has this achievement
        const existingAchievement = await this.pgPool.query(
            'SELECT id FROM user_achievements WHERE user_id = $1 AND achievement_id = $2',
            [userId, achievementId]
        );
        
        if (existingAchievement.rows.length > 0) {
            return false; // Already earned
        }
        
        // Get achievement details
        const achievement = await this.pgPool.query(
            'SELECT * FROM achievements WHERE id = $1',
            [achievementId]
        );
        
        if (achievement.rows.length === 0) {
            return false; // Achievement doesn't exist
        }
        
        const achievementData = achievement.rows[0];
        
        // Check if user meets requirements
        const meetsRequirements = await this.checkAchievementRequirements(
            userId,
            achievementData.requirement_type,
            achievementData.requirement_config
        );
        
        if (!meetsRequirements) {
            return false;
        }
        
        // Award achievement
        await this.awardAchievement(userId, achievementData, metadata);
        
        return true;
    }
    
    /**
     * Check if user meets achievement requirements
     */
    async checkAchievementRequirements(userId, requirementType, requirementConfig) {
        const config = typeof requirementConfig === 'string' ? 
            JSON.parse(requirementConfig) : requirementConfig;
        
        switch (requirementType) {
            case 'questions_correct':
                const correctCount = await this.pgPool.query(
                    'SELECT COUNT(*) FROM user_attempts WHERE user_id = $1 AND is_correct = true',
                    [userId]
                );
                return parseInt(correctCount.rows[0].count) >= config.count;
                
            case 'streak_days':
                const streakData = await this.getStreakData(userId);
                return streakData && streakData.currentStreak >= config.count;
                
            case 'accuracy_rate':
                const accuracyStats = await this.pgPool.query(`
                    SELECT 
                        COUNT(*) as total,
                        COUNT(*) FILTER (WHERE is_correct = true) as correct
                    FROM user_attempts 
                    WHERE user_id = $1
                `, [userId]);
                
                const stats = accuracyStats.rows[0];
                const total = parseInt(stats.total);
                const correct = parseInt(stats.correct);
                
                return total >= config.minimumQuestions && 
                       (correct / total) >= config.rate;
                
            case 'consecutive_correct':
                return await this.checkConsecutiveCorrect(userId, config.count);
                
            case 'fast_answers':
                const fastAnswers = await this.pgPool.query(`
                    SELECT COUNT(*) 
                    FROM user_attempts 
                    WHERE user_id = $1 
                    AND is_correct = true 
                    AND duration_seconds <= $2
                `, [userId, config.maxTime]);
                
                return parseInt(fastAnswers.rows[0].count) >= config.count;
                
            case 'subject_mastery':
                return await this.checkSubjectMastery(userId, config.subject);
                
            default:
                return false;
        }
    }
    
    /**
     * Check consecutive correct answers
     */
    async checkConsecutiveCorrect(userId, requiredCount) {
        const attempts = await this.pgPool.query(`
            SELECT is_correct 
            FROM user_attempts 
            WHERE user_id = $1 
            ORDER BY submitted_at DESC 
            LIMIT $2
        `, [userId, requiredCount]);
        
        if (attempts.rows.length < requiredCount) {
            return false;
        }
        
        return attempts.rows.every(row => row.is_correct);
    }
    
    /**
     * Check subject mastery
     */
    async checkSubjectMastery(userId, subject) {
        const masteryCount = await this.pgPool.query(`
            SELECT COUNT(*) 
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            JOIN subjects sub ON s.subject_id = sub.id
            WHERE us.user_id = $1 
            AND sub.code = $2 
            AND us.mastery_level = 'mastered'
        `, [userId, subject]);
        
        const totalSkills = await this.pgPool.query(`
            SELECT COUNT(*) 
            FROM skills s
            JOIN subjects sub ON s.subject_id = sub.id
            WHERE sub.code = $1
        `, [subject]);
        
        const mastered = parseInt(masteryCount.rows[0].count);
        const total = parseInt(totalSkills.rows[0].count);
        
        return mastered >= total * 0.8; // 80% mastery required
    }
    
    /**
     * Award achievement to user
     */
    async awardAchievement(userId, achievementData, metadata) {
        // Insert into user_achievements
        await this.pgPool.query(`
            INSERT INTO user_achievements (user_id, achievement_id, earned_at, progress_data)
            VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
        `, [userId, achievementData.id, JSON.stringify(metadata)]);
        
        // Award points
        await this.awardPoints(userId, 'achievement_earned', {
            achievementId: achievementData.id,
            achievementPoints: achievementData.points_awarded
        });
        
        // Store in MongoDB for analytics
        await this.mongodb.collection('gamificationData').insertOne({
            userId,
            type: 'achievement',
            timestamp: new Date(),
            data: {
                achievementId: achievementData.id,
                achievementName: achievementData.name,
                badgeTier: achievementData.badge_tier,
                points: achievementData.points_awarded
            },
            rewards: [{
                type: 'badge',
                value: achievementData.id,
                description: achievementData.name
            }]
        });
        
        // Emit event
        this.emit('achievementEarned', { userId, achievement: achievementData, metadata });
    }
    
    /**
     * Get user achievements
     */
    async getUserAchievements(userId) {
        const result = await this.pgPool.query(`
            SELECT a.*, ua.earned_at, ua.progress_data
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = $1
            ORDER BY ua.earned_at DESC
        `, [userId]);
        
        return result.rows;
    }
    
    /**
     * Check achievements for user action
     */
    async checkAchievements(userId, action, metadata) {
        const achievementChecks = {
            'correct_answer': [
                'first_correct',
                'problem_solver',
                'math_enthusiast',
                'math_expert',
                'perfect_10',
                'accuracy_master',
                'speed_demon'
            ],
            'streak_milestone': [
                'streak_7',
                'streak_30',
                'streak_100'
            ],
            'skill_mastered': [
                'algebra_master',
                'geometry_master'
            ]
        };
        
        const relevantAchievements = achievementChecks[action] || [];
        
        for (const achievementId of relevantAchievements) {
            await this.checkAndAwardAchievement(userId, achievementId, metadata);
        }
    }
    
    // ============================================
    // LEADERBOARD SYSTEM
    // ============================================
    
    /**
     * Initialize leaderboards
     */
    async initializeLeaderboards() {
        const leaderboards = [
            { name: 'Global Points', type: 'points', scope: 'global' },
            { name: 'Weekly Points', type: 'points', scope: 'weekly' },
            { name: 'Monthly Points', type: 'points', scope: 'monthly' },
            { name: 'Streak Champions', type: 'streak', scope: 'global' },
            { name: 'Accuracy Masters', type: 'accuracy', scope: 'global' },
            { name: 'Speed Leaders', type: 'speed', scope: 'global' }
        ];
        
        for (const board of leaderboards) {
            await this.pgPool.query(`
                INSERT INTO leaderboards (name, type, scope, is_active)
                VALUES ($1, $2, $3, true)
                ON CONFLICT (name) DO UPDATE SET
                    type = EXCLUDED.type,
                    scope = EXCLUDED.scope
            `, [board.name, board.type, board.scope]);
        }
    }
    
    /**
     * Update leaderboards
     */
    async updateLeaderboards(userId, points, action) {
        const userInfo = await this.pgPool.query(`
            SELECT username, grade_level, total_points, streak_days
            FROM users
            WHERE id = $1
        `, [userId]);
        
        if (userInfo.rows.length === 0) return;
        
        const user = userInfo.rows[0];
        
        // Update global points leaderboard
        await this.redis.updateLeaderboard('global_points', userId, user.total_points, {
            username: user.username,
            gradeLevel: user.grade_level
        });
        
        // Update weekly points leaderboard
        const weekKey = this.getWeekKey();
        await this.redis.updateLeaderboard(`weekly_points_${weekKey}`, userId, user.total_points, {
            username: user.username,
            gradeLevel: user.grade_level
        });
        
        // Update streak leaderboard
        if (user.streak_days > 0) {
            await this.redis.updateLeaderboard('streak_champions', userId, user.streak_days, {
                username: user.username,
                gradeLevel: user.grade_level
            });
        }
        
        // Update grade-specific leaderboards
        if (user.grade_level) {
            await this.redis.updateLeaderboard(`grade_${user.grade_level}_points`, userId, user.total_points, {
                username: user.username,
                gradeLevel: user.grade_level
            });
        }
    }
    
    /**
     * Get leaderboard data
     */
    async getLeaderboard(type, scope = 'global', limit = 100) {
        const leaderboardKey = `${type}_${scope}`;
        
        const rankings = await this.redis.getLeaderboard(leaderboardKey, 0, limit - 1);
        
        return {
            type,
            scope,
            rankings,
            lastUpdated: new Date(),
            totalParticipants: rankings.length
        };
    }
    
    /**
     * Get user's leaderboard position
     */
    async getUserLeaderboardPosition(userId, type, scope = 'global') {
        const leaderboardKey = `${type}_${scope}`;
        
        return await this.redis.getUserRank(leaderboardKey, userId);
    }
    
    /**
     * Get week key for weekly leaderboards
     */
    getWeekKey() {
        const now = new Date();
        const year = now.getFullYear();
        const week = Math.ceil(((now - new Date(year, 0, 1)) / 86400000 + 1) / 7);
        return `${year}_w${week}`;
    }
    
    // ============================================
    // SOCIAL FEATURES
    // ============================================
    
    /**
     * Add friend
     */
    async addFriend(userId, friendId) {
        if (!this.config.enableSocial) {
            throw new Error('Social features are disabled');
        }
        
        // Check if already friends
        const existing = await this.pgPool.query(`
            SELECT id FROM user_friends 
            WHERE (user_id = $1 AND friend_id = $2) 
            OR (user_id = $2 AND friend_id = $1)
        `, [userId, friendId]);
        
        if (existing.rows.length > 0) {
            throw new Error('Already friends');
        }
        
        // Check friend limit
        const friendCount = await this.pgPool.query(
            'SELECT COUNT(*) FROM user_friends WHERE user_id = $1',
            [userId]
        );
        
        if (parseInt(friendCount.rows[0].count) >= this.config.maxFriends) {
            throw new Error('Friend limit reached');
        }
        
        // Add friendship
        await this.pgPool.query(`
            INSERT INTO user_friends (user_id, friend_id, created_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
        `, [userId, friendId]);
        
        // Emit event
        this.emit('friendAdded', { userId, friendId });
    }
    
    /**
     * Get user's friends
     */
    async getUserFriends(userId) {
        const result = await this.pgPool.query(`
            SELECT u.id, u.username, u.total_points, u.streak_days,
                   uf.created_at as friendship_date
            FROM user_friends uf
            JOIN users u ON uf.friend_id = u.id
            WHERE uf.user_id = $1
            ORDER BY u.total_points DESC
        `, [userId]);
        
        return result.rows;
    }
    
    /**
     * Get friends leaderboard
     */
    async getFriendsLeaderboard(userId) {
        const friends = await this.getUserFriends(userId);
        const friendIds = friends.map(f => f.id);
        
        if (friendIds.length === 0) {
            return { rankings: [], totalParticipants: 0 };
        }
        
        // Include the user themselves
        friendIds.push(userId);
        
        const result = await this.pgPool.query(`
            SELECT id, username, total_points, streak_days
            FROM users
            WHERE id = ANY($1)
            ORDER BY total_points DESC
            LIMIT 50
        `, [friendIds]);
        
        return {
            rankings: result.rows.map((user, index) => ({
                rank: index + 1,
                userId: user.id,
                username: user.username,
                score: user.total_points,
                streakDays: user.streak_days
            })),
            totalParticipants: result.rows.length
        };
    }
    
    // ============================================
    // CHALLENGES AND COMPETITIONS
    // ============================================
    
    /**
     * Create challenge
     */
    async createChallenge(creatorId, challengeData) {
        const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const challenge = {
            id: challengeId,
            creatorId,
            title: challengeData.title,
            description: challengeData.description,
            type: challengeData.type, // 'accuracy', 'speed', 'endurance', 'custom'
            rules: challengeData.rules,
            rewards: challengeData.rewards,
            startDate: challengeData.startDate || new Date(),
            endDate: challengeData.endDate,
            maxParticipants: challengeData.maxParticipants || 100,
            isPublic: challengeData.isPublic || false,
            participants: [],
            leaderboard: [],
            status: 'active',
            createdAt: new Date()
        };
        
        await this.mongodb.collection('challenges').insertOne(challenge);
        
        // Create challenge leaderboard
        await this.redis.updateLeaderboard(`challenge_${challengeId}`, creatorId, 0, {
            username: challengeData.creatorUsername || 'Unknown'
        });
        
        return challengeId;
    }
    
    /**
     * Join challenge
     */
    async joinChallenge(userId, challengeId) {
        const challenge = await this.mongodb.collection('challenges').findOne({
            id: challengeId,
            status: 'active'
        });
        
        if (!challenge) {
            throw new Error('Challenge not found or inactive');
        }
        
        if (challenge.participants.includes(userId)) {
            throw new Error('Already participating in this challenge');
        }
        
        if (challenge.participants.length >= challenge.maxParticipants) {
            throw new Error('Challenge is full');
        }
        
        await this.mongodb.collection('challenges').updateOne(
            { id: challengeId },
            { $push: { participants: userId } }
        );
        
        // Initialize user in challenge leaderboard
        const userInfo = await this.pgPool.query(
            'SELECT username FROM users WHERE id = $1',
            [userId]
        );
        
        await this.redis.updateLeaderboard(`challenge_${challengeId}`, userId, 0, {
            username: userInfo.rows[0]?.username || 'Unknown'
        });
        
        return true;
    }
    
    /**
     * Update challenge progress
     */
    async updateChallengeProgress(userId, challengeId, progress) {
        await this.redis.updateLeaderboard(`challenge_${challengeId}`, userId, progress.score, {
            username: progress.username || 'Unknown',
            details: progress.details || {}
        });
        
        // Store progress in MongoDB
        await this.mongodb.collection('challengeProgress').insertOne({
            userId,
            challengeId,
            progress,
            timestamp: new Date()
        });
    }
    
    // ============================================
    // ANALYTICS AND INSIGHTS
    // ============================================
    
    /**
     * Get gamification analytics
     */
    async getGamificationAnalytics(userId) {
        const [userStats, achievements, leaderboardPositions] = await Promise.all([
            this.getUserStats(userId),
            this.getUserAchievements(userId),
            this.getUserLeaderboardPositions(userId)
        ]);
        
        return {
            userStats,
            achievements,
            leaderboardPositions,
            recommendations: await this.getRecommendations(userId)
        };
    }
    
    /**
     * Get user statistics
     */
    async getUserStats(userId) {
        const result = await this.pgPool.query(`
            SELECT 
                total_points,
                streak_days,
                longest_streak,
                total_questions_attempted,
                total_correct_answers,
                CASE 
                    WHEN total_questions_attempted > 0 
                    THEN ROUND((total_correct_answers::DECIMAL / total_questions_attempted) * 100, 2)
                    ELSE 0 
                END as accuracy_percentage
            FROM users
            WHERE id = $1
        `, [userId]);
        
        return result.rows[0] || {};
    }
    
    /**
     * Get user leaderboard positions
     */
    async getUserLeaderboardPositions(userId) {
        const leaderboards = ['global_points', 'streak_champions', 'weekly_points_' + this.getWeekKey()];
        const positions = {};
        
        for (const board of leaderboards) {
            try {
                positions[board] = await this.redis.getUserRank(board, userId);
            } catch (error) {
                positions[board] = { rank: null, score: null };
            }
        }
        
        return positions;
    }
    
    /**
     * Get recommendations for user
     */
    async getRecommendations(userId) {
        const recommendations = [];
        
        // Check current streak
        const streakData = await this.getStreakData(userId);
        if (streakData && streakData.currentStreak > 0) {
            recommendations.push({
                type: 'streak',
                message: `Keep your ${streakData.currentStreak}-day streak alive!`,
                action: 'Answer a question today',
                priority: 'high'
            });
        }
        
        // Check for near achievements
        const nearAchievements = await this.getNearAchievements(userId);
        nearAchievements.forEach(achievement => {
            recommendations.push({
                type: 'achievement',
                message: `You're close to earning "${achievement.name}"!`,
                action: achievement.nextStep,
                priority: 'medium'
            });
        });
        
        return recommendations;
    }
    
    /**
     * Get achievements user is close to earning
     */
    async getNearAchievements(userId) {
        // This would analyze user progress and return achievements they're close to earning
        // Implementation depends on specific achievement requirements
        return [];
    }
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
    /**
     * Get user's gamification summary
     */
    async getUserGamificationSummary(userId) {
        const [stats, achievements, position] = await Promise.all([
            this.getUserStats(userId),
            this.getUserAchievements(userId),
            this.getUserLeaderboardPosition(userId, 'points', 'global')
        ]);
        
        return {
            totalPoints: stats.total_points || 0,
            currentStreak: stats.streak_days || 0,
            longestStreak: stats.longest_streak || 0,
            achievementCount: achievements.length,
            globalRank: position.rank,
            accuracyPercentage: stats.accuracy_percentage || 0
        };
    }
    
    /**
     * Close database connections
     */
    async close() {
        await this.pgPool.end();
        await this.mongoClient.close();
    }
}

module.exports = GamificationSystem;