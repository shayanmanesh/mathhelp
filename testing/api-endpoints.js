// Comprehensive RESTful API Endpoints for Math Help Testing System
// Express.js server with all major endpoints

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { body, param, query, validationResult } = require('express-validator');

const AdaptiveTestingEngine = require('./adaptive-testing-engine');
const { QuestionTypeManager } = require('./question-types');
const GamificationSystem = require('./gamification-system');
const CurriculumManager = require('./curriculum-structure');
const { redisManager } = require('../database/redis-config');

class MathHelpAPI {
    constructor(config = {}) {
        this.app = express();
        this.config = {
            port: process.env.PORT || 3000,
            rateLimitWindow: 15 * 60 * 1000, // 15 minutes
            rateLimitMax: 100, // limit each IP to 100 requests per windowMs
            corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
            ...config
        };
        
        // Initialize subsystems
        this.adaptiveEngine = new AdaptiveTestingEngine();
        this.questionManager = new QuestionTypeManager();
        this.gamificationSystem = new GamificationSystem();
        this.curriculumManager = new CurriculumManager();
        this.redis = redisManager;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    
    // ============================================
    // MIDDLEWARE SETUP
    // ============================================
    
    setupMiddleware() {
        // Security middleware
        this.app.use(helmet());
        
        // CORS
        this.app.use(cors({
            origin: this.config.corsOrigins,
            credentials: true
        }));
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: this.config.rateLimitWindow,
            max: this.config.rateLimitMax,
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false
        });
        this.app.use('/api/', limiter);
        
        // Compression
        this.app.use(compression());
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
            next();
        });
        
        // Authentication middleware (simplified)
        this.app.use('/api/', this.authenticateUser.bind(this));
    }
    
    async authenticateUser(req, res, next) {
        // Skip authentication for public endpoints
        const publicEndpoints = ['/api/health', '/api/subjects', '/api/questions/public'];
        if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
            return next();
        }
        
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        try {
            // Verify token (simplified - in production, use proper JWT verification)
            const userId = await this.redis.client.get(`auth:${token}`);
            
            if (!userId) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }
            
            req.userId = userId;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Authentication failed' });
        }
    }
    
    // ============================================
    // ROUTE SETUP
    // ============================================
    
    setupRoutes() {
        // Health check
        this.app.get('/api/health', this.healthCheck.bind(this));
        
        // Authentication routes
        this.app.post('/api/auth/login', this.validateLogin, this.login.bind(this));
        this.app.post('/api/auth/register', this.validateRegistration, this.register.bind(this));
        this.app.post('/api/auth/logout', this.logout.bind(this));
        
        // User routes
        this.app.get('/api/users/profile', this.getUserProfile.bind(this));
        this.app.put('/api/users/profile', this.validateProfileUpdate, this.updateUserProfile.bind(this));
        this.app.get('/api/users/:userId/stats', this.validateUserId, this.getUserStats.bind(this));
        
        // Adaptive testing routes
        this.app.post('/api/tests/adaptive/start', this.validateTestStart, this.startAdaptiveTest.bind(this));
        this.app.get('/api/tests/adaptive/:sessionId/next', this.validateSessionId, this.getNextQuestion.bind(this));
        this.app.post('/api/tests/adaptive/:sessionId/submit', this.validateAnswerSubmission, this.submitAnswer.bind(this));
        this.app.post('/api/tests/adaptive/:sessionId/end', this.validateSessionId, this.endAdaptiveTest.bind(this));
        this.app.get('/api/tests/adaptive/:sessionId/analytics', this.validateSessionId, this.getTestAnalytics.bind(this));
        
        // Question routes
        this.app.get('/api/questions', this.validateQuestionQuery, this.getQuestions.bind(this));
        this.app.get('/api/questions/:questionId', this.validateQuestionId, this.getQuestion.bind(this));
        this.app.post('/api/questions', this.validateQuestionCreation, this.createQuestion.bind(this));
        this.app.put('/api/questions/:questionId', this.validateQuestionUpdate, this.updateQuestion.bind(this));
        this.app.delete('/api/questions/:questionId', this.validateQuestionId, this.deleteQuestion.bind(this));
        
        // Curriculum routes
        this.app.get('/api/subjects', this.getSubjects.bind(this));
        this.app.get('/api/subjects/:subjectId/skills', this.validateSubjectId, this.getSubjectSkills.bind(this));
        this.app.get('/api/skills/:skillId', this.validateSkillId, this.getSkill.bind(this));
        this.app.get('/api/skills/:skillId/questions', this.validateSkillId, this.getSkillQuestions.bind(this));
        this.app.get('/api/users/:userId/learning-path', this.validateUserId, this.getLearningPath.bind(this));
        this.app.get('/api/users/:userId/recommendations', this.validateUserId, this.getRecommendations.bind(this));
        
        // Gamification routes
        this.app.get('/api/users/:userId/achievements', this.validateUserId, this.getUserAchievements.bind(this));
        this.app.post('/api/users/:userId/points', this.validatePointsAward, this.awardPoints.bind(this));
        this.app.get('/api/leaderboards/:type', this.validateLeaderboardType, this.getLeaderboard.bind(this));
        this.app.get('/api/users/:userId/leaderboard-position', this.validateUserId, this.getLeaderboardPosition.bind(this));
        
        // Analytics routes
        this.app.get('/api/analytics/user/:userId', this.validateUserId, this.getUserAnalytics.bind(this));
        this.app.get('/api/analytics/system', this.getSystemAnalytics.bind(this));
        this.app.get('/api/analytics/curriculum/:subjectId', this.validateSubjectId, this.getCurriculumAnalytics.bind(this));
        
        // Standards routes
        this.app.get('/api/standards', this.getStandards.bind(this));
        this.app.get('/api/standards/:standardCode/skills', this.validateStandardCode, this.getStandardSkills.bind(this));
        this.app.get('/api/users/:userId/standards-coverage', this.validateUserId, this.getStandardsCoverage.bind(this));
        
        // Social features
        this.app.post('/api/users/:userId/friends', this.validateFriendRequest, this.addFriend.bind(this));
        this.app.get('/api/users/:userId/friends', this.validateUserId, this.getUserFriends.bind(this));
        this.app.get('/api/users/:userId/friends/leaderboard', this.validateUserId, this.getFriendsLeaderboard.bind(this));
        
        // Challenge routes
        this.app.post('/api/challenges', this.validateChallengeCreation, this.createChallenge.bind(this));
        this.app.get('/api/challenges', this.getChallenges.bind(this));
        this.app.post('/api/challenges/:challengeId/join', this.validateChallengeId, this.joinChallenge.bind(this));
        this.app.get('/api/challenges/:challengeId/leaderboard', this.validateChallengeId, this.getChallengeLeaderboard.bind(this));
    }
    
    // ============================================
    // VALIDATION MIDDLEWARE
    // ============================================
    
    get validateLogin() {
        return [
            body('email').isEmail().normalizeEmail(),
            body('password').isLength({ min: 6 }).trim(),
            this.handleValidationErrors
        ];
    }
    
    get validateRegistration() {
        return [
            body('username').isLength({ min: 3, max: 30 }).trim(),
            body('email').isEmail().normalizeEmail(),
            body('password').isLength({ min: 6 }).trim(),
            body('gradeLevel').optional().isInt({ min: -2, max: 16 }),
            this.handleValidationErrors
        ];
    }
    
    get validateProfileUpdate() {
        return [
            body('firstName').optional().isLength({ min: 1, max: 100 }).trim(),
            body('lastName').optional().isLength({ min: 1, max: 100 }).trim(),
            body('gradeLevel').optional().isInt({ min: -2, max: 16 }),
            body('school').optional().isLength({ min: 1, max: 255 }).trim(),
            this.handleValidationErrors
        ];
    }
    
    get validateUserId() {
        return [
            param('userId').isUUID(),
            this.handleValidationErrors
        ];
    }
    
    get validateSessionId() {
        return [
            param('sessionId').isLength({ min: 1, max: 100 }).trim(),
            this.handleValidationErrors
        ];
    }
    
    get validateTestStart() {
        return [
            body('testType').optional().isIn(['placement', 'practice', 'assessment', 'quiz']),
            body('subjectId').optional().isUUID(),
            body('maxQuestions').optional().isInt({ min: 5, max: 50 }),
            body('timeLimit').optional().isInt({ min: 300, max: 7200 }),
            this.handleValidationErrors
        ];
    }
    
    get validateAnswerSubmission() {
        return [
            body('questionId').isUUID(),
            body('response').exists(),
            body('responseTime').optional().isInt({ min: 0 }),
            body('hintsUsed').optional().isInt({ min: 0 }),
            this.handleValidationErrors
        ];
    }
    
    get validateQuestionQuery() {
        return [
            query('subjectId').optional().isUUID(),
            query('skillId').optional().isUUID(),
            query('difficulty').optional().isFloat({ min: -4, max: 4 }),
            query('type').optional().isIn(['multiple_choice', 'short_answer', 'true_false', 'equation_editor']),
            query('limit').optional().isInt({ min: 1, max: 100 }),
            this.handleValidationErrors
        ];
    }
    
    get validateQuestionId() {
        return [
            param('questionId').isUUID(),
            this.handleValidationErrors
        ];
    }
    
    get validateQuestionCreation() {
        return [
            body('title').isLength({ min: 1, max: 500 }).trim(),
            body('subjectId').isUUID(),
            body('skillId').isUUID(),
            body('questionTypeId').isUUID(),
            body('content').isObject(),
            body('difficultyParameter').optional().isFloat({ min: -4, max: 4 }),
            body('discriminationParameter').optional().isFloat({ min: 0, max: 3 }),
            this.handleValidationErrors
        ];
    }
    
    get validateQuestionUpdate() {
        return [
            param('questionId').isUUID(),
            body('title').optional().isLength({ min: 1, max: 500 }).trim(),
            body('content').optional().isObject(),
            body('difficultyParameter').optional().isFloat({ min: -4, max: 4 }),
            this.handleValidationErrors
        ];
    }
    
    get validateSubjectId() {
        return [
            param('subjectId').isUUID(),
            this.handleValidationErrors
        ];
    }
    
    get validateSkillId() {
        return [
            param('skillId').isUUID(),
            this.handleValidationErrors
        ];
    }
    
    get validatePointsAward() {
        return [
            body('action').isIn(['correct_answer', 'question_attempt', 'streak_milestone', 'achievement_earned']),
            body('metadata').optional().isObject(),
            this.handleValidationErrors
        ];
    }
    
    get validateLeaderboardType() {
        return [
            param('type').isIn(['points', 'streak', 'accuracy', 'speed']),
            query('scope').optional().isIn(['global', 'grade', 'school', 'friends']),
            query('limit').optional().isInt({ min: 1, max: 100 }),
            this.handleValidationErrors
        ];
    }
    
    get validateStandardCode() {
        return [
            param('standardCode').isLength({ min: 1, max: 50 }).trim(),
            this.handleValidationErrors
        ];
    }
    
    get validateFriendRequest() {
        return [
            body('friendId').isUUID(),
            this.handleValidationErrors
        ];
    }
    
    get validateChallengeCreation() {
        return [
            body('title').isLength({ min: 1, max: 200 }).trim(),
            body('description').isLength({ min: 1, max: 1000 }).trim(),
            body('type').isIn(['accuracy', 'speed', 'endurance', 'custom']),
            body('rules').isObject(),
            body('maxParticipants').optional().isInt({ min: 2, max: 1000 }),
            this.handleValidationErrors
        ];
    }
    
    get validateChallengeId() {
        return [
            param('challengeId').isLength({ min: 1, max: 100 }).trim(),
            this.handleValidationErrors
        ];
    }
    
    handleValidationErrors(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        next();
    }
    
    // ============================================
    // AUTHENTICATION ENDPOINTS
    // ============================================
    
    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Simplified login - in production, use proper password hashing
            const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const userId = `user_${Date.now()}`;
            
            // Store token in Redis with expiration
            await this.redis.client.setex(`auth:${token}`, 3600, userId);
            
            res.json({
                token,
                userId,
                expiresIn: 3600
            });
        } catch (error) {
            res.status(500).json({ error: 'Login failed' });
        }
    }
    
    async register(req, res) {
        try {
            const { username, email, password, gradeLevel } = req.body;
            
            // Simplified registration
            const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Store token in Redis
            await this.redis.client.setex(`auth:${token}`, 3600, userId);
            
            res.status(201).json({
                userId,
                token,
                username,
                email,
                expiresIn: 3600
            });
        } catch (error) {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
    
    async logout(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            
            if (token) {
                await this.redis.client.del(`auth:${token}`);
            }
            
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Logout failed' });
        }
    }
    
    // ============================================
    // USER ENDPOINTS
    // ============================================
    
    async getUserProfile(req, res) {
        try {
            const userId = req.userId;
            const profile = await this.getUserProfileData(userId);
            res.json(profile);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get user profile' });
        }
    }
    
    async updateUserProfile(req, res) {
        try {
            const userId = req.userId;
            const updates = req.body;
            
            // Update user profile in database
            const updatedProfile = await this.updateUserProfileData(userId, updates);
            
            res.json(updatedProfile);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update user profile' });
        }
    }
    
    async getUserStats(req, res) {
        try {
            const { userId } = req.params;
            const stats = await this.gamificationSystem.getUserStats(userId);
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get user stats' });
        }
    }
    
    // ============================================
    // ADAPTIVE TESTING ENDPOINTS
    // ============================================
    
    async startAdaptiveTest(req, res) {
        try {
            const userId = req.userId;
            const testConfig = req.body;
            
            const testSession = await this.adaptiveEngine.startAdaptiveTest(userId, testConfig);
            
            res.json({
                sessionId: testSession.sessionId,
                initialAbility: testSession.initialAbility,
                testConfig: testSession.testState.config
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to start adaptive test' });
        }
    }
    
    async getNextQuestion(req, res) {
        try {
            const { sessionId } = req.params;
            
            const questionData = await this.adaptiveEngine.getNextQuestion(sessionId);
            
            res.json(questionData);
        } catch (error) {
            if (error.message === 'Test session not found') {
                res.status(404).json({ error: 'Test session not found' });
            } else {
                res.status(500).json({ error: 'Failed to get next question' });
            }
        }
    }
    
    async submitAnswer(req, res) {
        try {
            const { sessionId } = req.params;
            const { questionId, response, responseTime, hintsUsed } = req.body;
            
            const result = await this.adaptiveEngine.submitAnswer(sessionId, questionId, response, {
                responseTime,
                hintsUsed
            });
            
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Failed to submit answer' });
        }
    }
    
    async endAdaptiveTest(req, res) {
        try {
            const { sessionId } = req.params;
            
            const results = await this.adaptiveEngine.endAdaptiveTest(sessionId);
            
            res.json(results);
        } catch (error) {
            res.status(500).json({ error: 'Failed to end adaptive test' });
        }
    }
    
    async getTestAnalytics(req, res) {
        try {
            const { sessionId } = req.params;
            
            const analytics = await this.adaptiveEngine.getTestAnalytics(sessionId);
            
            res.json(analytics);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get test analytics' });
        }
    }
    
    // ============================================
    // QUESTION ENDPOINTS
    // ============================================
    
    async getQuestions(req, res) {
        try {
            const { subjectId, skillId, difficulty, type, limit = 20 } = req.query;
            
            const questions = await this.getFilteredQuestions({
                subjectId,
                skillId,
                difficulty: difficulty ? parseFloat(difficulty) : null,
                type,
                limit: parseInt(limit)
            });
            
            res.json(questions);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get questions' });
        }
    }
    
    async getQuestion(req, res) {
        try {
            const { questionId } = req.params;
            
            const question = await this.getQuestionById(questionId);
            
            if (!question) {
                return res.status(404).json({ error: 'Question not found' });
            }
            
            res.json(question);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get question' });
        }
    }
    
    async createQuestion(req, res) {
        try {
            const questionData = req.body;
            questionData.createdBy = req.userId;
            
            const question = await this.createQuestionData(questionData);
            
            res.status(201).json(question);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create question' });
        }
    }
    
    async updateQuestion(req, res) {
        try {
            const { questionId } = req.params;
            const updates = req.body;
            
            const question = await this.updateQuestionData(questionId, updates);
            
            res.json(question);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update question' });
        }
    }
    
    async deleteQuestion(req, res) {
        try {
            const { questionId } = req.params;
            
            await this.deleteQuestionData(questionId);
            
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete question' });
        }
    }
    
    // ============================================
    // CURRICULUM ENDPOINTS
    // ============================================
    
    async getSubjects(req, res) {
        try {
            const subjects = await this.curriculumManager.getSubjectHierarchy();
            res.json(subjects);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get subjects' });
        }
    }
    
    async getSubjectSkills(req, res) {
        try {
            const { subjectId } = req.params;
            
            const skills = await this.curriculumManager.getSkillsForSubject(subjectId);
            
            res.json(skills);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get subject skills' });
        }
    }
    
    async getSkill(req, res) {
        try {
            const { skillId } = req.params;
            
            const skill = await this.getSkillById(skillId);
            
            if (!skill) {
                return res.status(404).json({ error: 'Skill not found' });
            }
            
            res.json(skill);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get skill' });
        }
    }
    
    async getSkillQuestions(req, res) {
        try {
            const { skillId } = req.params;
            const { difficulty, limit = 10 } = req.query;
            
            const questions = await this.curriculumManager.getQuestionsForSkill(
                skillId,
                difficulty ? parseFloat(difficulty) : null,
                parseInt(limit)
            );
            
            res.json(questions);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get skill questions' });
        }
    }
    
    async getLearningPath(req, res) {
        try {
            const { userId } = req.params;
            const { subjectId } = req.query;
            
            if (!subjectId) {
                return res.status(400).json({ error: 'Subject ID is required' });
            }
            
            const learningPath = await this.curriculumManager.getLearningPath(userId, subjectId);
            
            res.json(learningPath);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get learning path' });
        }
    }
    
    async getRecommendations(req, res) {
        try {
            const { userId } = req.params;
            
            const recommendations = await this.gamificationSystem.getRecommendations(userId);
            
            res.json(recommendations);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get recommendations' });
        }
    }
    
    // ============================================
    // GAMIFICATION ENDPOINTS
    // ============================================
    
    async getUserAchievements(req, res) {
        try {
            const { userId } = req.params;
            
            const achievements = await this.gamificationSystem.getUserAchievements(userId);
            
            res.json(achievements);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get user achievements' });
        }
    }
    
    async awardPoints(req, res) {
        try {
            const { userId } = req.params;
            const { action, metadata } = req.body;
            
            const points = await this.gamificationSystem.awardPoints(userId, action, metadata);
            
            res.json({ pointsAwarded: points });
        } catch (error) {
            res.status(500).json({ error: 'Failed to award points' });
        }
    }
    
    async getLeaderboard(req, res) {
        try {
            const { type } = req.params;
            const { scope = 'global', limit = 100 } = req.query;
            
            const leaderboard = await this.gamificationSystem.getLeaderboard(type, scope, parseInt(limit));
            
            res.json(leaderboard);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get leaderboard' });
        }
    }
    
    async getLeaderboardPosition(req, res) {
        try {
            const { userId } = req.params;
            const { type = 'points', scope = 'global' } = req.query;
            
            const position = await this.gamificationSystem.getUserLeaderboardPosition(userId, type, scope);
            
            res.json(position);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get leaderboard position' });
        }
    }
    
    // ============================================
    // ANALYTICS ENDPOINTS
    // ============================================
    
    async getUserAnalytics(req, res) {
        try {
            const { userId } = req.params;
            
            const analytics = await this.gamificationSystem.getGamificationAnalytics(userId);
            
            res.json(analytics);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get user analytics' });
        }
    }
    
    async getSystemAnalytics(req, res) {
        try {
            const analytics = await this.getSystemAnalyticsData();
            res.json(analytics);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get system analytics' });
        }
    }
    
    async getCurriculumAnalytics(req, res) {
        try {
            const { subjectId } = req.params;
            
            const analytics = await this.curriculumManager.getCurriculumAnalytics(subjectId);
            
            res.json(analytics);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get curriculum analytics' });
        }
    }
    
    // ============================================
    // STANDARDS ENDPOINTS
    // ============================================
    
    async getStandards(req, res) {
        try {
            const { system } = req.query;
            
            const standards = await this.getStandardsData(system);
            
            res.json(standards);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get standards' });
        }
    }
    
    async getStandardSkills(req, res) {
        try {
            const { standardCode } = req.params;
            
            const skills = await this.curriculumManager.getSkillsForStandard(standardCode);
            
            res.json(skills);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get standard skills' });
        }
    }
    
    async getStandardsCoverage(req, res) {
        try {
            const { userId } = req.params;
            const { system = 'CCSS' } = req.query;
            
            const coverage = await this.curriculumManager.getStandardsCoverage(userId, system);
            
            res.json(coverage);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get standards coverage' });
        }
    }
    
    // ============================================
    // SOCIAL ENDPOINTS
    // ============================================
    
    async addFriend(req, res) {
        try {
            const { userId } = req.params;
            const { friendId } = req.body;
            
            await this.gamificationSystem.addFriend(userId, friendId);
            
            res.json({ message: 'Friend added successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to add friend' });
        }
    }
    
    async getUserFriends(req, res) {
        try {
            const { userId } = req.params;
            
            const friends = await this.gamificationSystem.getUserFriends(userId);
            
            res.json(friends);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get user friends' });
        }
    }
    
    async getFriendsLeaderboard(req, res) {
        try {
            const { userId } = req.params;
            
            const leaderboard = await this.gamificationSystem.getFriendsLeaderboard(userId);
            
            res.json(leaderboard);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get friends leaderboard' });
        }
    }
    
    // ============================================
    // CHALLENGE ENDPOINTS
    // ============================================
    
    async createChallenge(req, res) {
        try {
            const challengeData = req.body;
            challengeData.creatorId = req.userId;
            
            const challengeId = await this.gamificationSystem.createChallenge(req.userId, challengeData);
            
            res.status(201).json({ challengeId });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create challenge' });
        }
    }
    
    async getChallenges(req, res) {
        try {
            const { status = 'active', limit = 20 } = req.query;
            
            const challenges = await this.getChallengesData(status, parseInt(limit));
            
            res.json(challenges);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get challenges' });
        }
    }
    
    async joinChallenge(req, res) {
        try {
            const { challengeId } = req.params;
            const userId = req.userId;
            
            await this.gamificationSystem.joinChallenge(userId, challengeId);
            
            res.json({ message: 'Joined challenge successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to join challenge' });
        }
    }
    
    async getChallengeLeaderboard(req, res) {
        try {
            const { challengeId } = req.params;
            
            const leaderboard = await this.redis.getLeaderboard(`challenge_${challengeId}`);
            
            res.json(leaderboard);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get challenge leaderboard' });
        }
    }
    
    // ============================================
    // UTILITY ENDPOINTS
    // ============================================
    
    async healthCheck(req, res) {
        try {
            const health = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                services: {
                    database: 'healthy',
                    redis: 'healthy',
                    mongodb: 'healthy'
                }
            };
            
            res.json(health);
        } catch (error) {
            res.status(500).json({
                status: 'unhealthy',
                error: error.message
            });
        }
    }
    
    // ============================================
    // ERROR HANDLING
    // ============================================
    
    setupErrorHandling() {
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                path: req.path,
                method: req.method
            });
        });
        
        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('API Error:', error);
            
            res.status(500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        });
    }
    
    // ============================================
    // HELPER METHODS
    // ============================================
    
    async getUserProfileData(userId) {
        // Implementation would query database
        return { userId, profile: 'data' };
    }
    
    async updateUserProfileData(userId, updates) {
        // Implementation would update database
        return { userId, updates };
    }
    
    async getFilteredQuestions(filters) {
        // Implementation would query database with filters
        return [];
    }
    
    async getQuestionById(questionId) {
        // Implementation would query database
        return null;
    }
    
    async createQuestionData(questionData) {
        // Implementation would create question in database
        return questionData;
    }
    
    async updateQuestionData(questionId, updates) {
        // Implementation would update question in database
        return updates;
    }
    
    async deleteQuestionData(questionId) {
        // Implementation would delete question from database
        return true;
    }
    
    async getSkillById(skillId) {
        // Implementation would query database
        return null;
    }
    
    async getSystemAnalyticsData() {
        // Implementation would gather system metrics
        return {};
    }
    
    async getStandardsData(system) {
        // Implementation would query standards database
        return [];
    }
    
    async getChallengesData(status, limit) {
        // Implementation would query challenges database
        return [];
    }
    
    // ============================================
    // SERVER METHODS
    // ============================================
    
    start() {
        this.app.listen(this.config.port, () => {
            console.log(`Math Help API server running on port ${this.config.port}`);
        });
    }
    
    async close() {
        if (this.adaptiveEngine) await this.adaptiveEngine.close();
        if (this.gamificationSystem) await this.gamificationSystem.close();
        if (this.curriculumManager) await this.curriculumManager.close();
    }
}

module.exports = MathHelpAPI;

// Start server if this file is run directly
if (require.main === module) {
    const api = new MathHelpAPI();
    api.start();
}