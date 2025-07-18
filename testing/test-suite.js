// Comprehensive Test Suite for Math Help Testing System
// Jest-based testing framework with comprehensive coverage

const AdaptiveTestingEngine = require('./adaptive-testing-engine');
const { QuestionTypeManager } = require('./question-types');
const GamificationSystem = require('./gamification-system');
const SecuritySystem = require('./security-system');
const AnalyticsDashboard = require('./analytics-dashboard');
const PerformanceTracker = require('./performance-tracker');

describe('Math Help Testing System', () => {
    let testEngine;
    let questionManager;
    let gamificationSystem;
    let securitySystem;
    let analytics;
    let performanceTracker;
    
    beforeAll(async () => {
        // Initialize test systems
        testEngine = new AdaptiveTestingEngine();
        questionManager = new QuestionTypeManager();
        gamificationSystem = new GamificationSystem();
        securitySystem = new SecuritySystem();
        analytics = new AnalyticsDashboard();
        performanceTracker = new PerformanceTracker();
    });
    
    afterAll(async () => {
        // Clean up connections
        await testEngine.close();
        await gamificationSystem.close();
        await securitySystem.close();
        await analytics.close();
        await performanceTracker.close();
    });
    
    describe('Adaptive Testing Engine', () => {
        describe('IRT Calculations', () => {
            test('should calculate probability correctly', () => {
                const ability = 1.0;
                const difficulty = 0.5;
                const discrimination = 1.2;
                const guessing = 0.25;
                
                const probability = testEngine.calculateProbability(ability, difficulty, discrimination, guessing);
                
                expect(probability).toBeGreaterThan(0);
                expect(probability).toBeLessThan(1);
                expect(probability).toBeCloseTo(0.814, 2);
            });
            
            test('should handle edge cases for probability calculation', () => {
                // Very low ability
                const lowProb = testEngine.calculateProbability(-3, 0, 1, 0);
                expect(lowProb).toBeGreaterThan(0);
                expect(lowProb).toBeLessThan(0.1);
                
                // Very high ability
                const highProb = testEngine.calculateProbability(3, 0, 1, 0);
                expect(highProb).toBeGreaterThan(0.9);
                expect(highProb).toBeLessThan(1);
            });
        });
        
        describe('Question Selection', () => {
            test('should select questions with maximum information', () => {
                const questions = [
                    { id: '1', difficulty: -1, discrimination: 1.0 },
                    { id: '2', difficulty: 0, discrimination: 1.2 },
                    { id: '3', difficulty: 1, discrimination: 0.8 }
                ];
                
                const selectedQuestion = testEngine.selectQuestionByMaxInfo(questions, 0.5);
                
                expect(selectedQuestion).toBeDefined();
                expect(selectedQuestion.id).toBe('2'); // Should select question closest to ability
            });
            
            test('should avoid recently asked questions', () => {
                const questions = [
                    { id: '1', difficulty: 0, discrimination: 1.0 },
                    { id: '2', difficulty: 0, discrimination: 1.0 },
                    { id: '3', difficulty: 0, discrimination: 1.0 }
                ];
                
                const recentQuestions = ['1', '2'];
                
                const selectedQuestion = testEngine.selectQuestionByMaxInfo(questions, 0, recentQuestions);
                
                expect(selectedQuestion.id).toBe('3');
            });
        });
        
        describe('Ability Estimation', () => {
            test('should update ability estimate based on responses', () => {
                const responses = [
                    { questionId: '1', isCorrect: true, difficulty: 0, discrimination: 1.0 },
                    { questionId: '2', isCorrect: false, difficulty: 1, discrimination: 1.0 },
                    { questionId: '3', isCorrect: true, difficulty: 0.5, discrimination: 1.2 }
                ];
                
                const ability = testEngine.estimateAbilityMLE(responses, 0);
                
                expect(ability).toBeGreaterThan(-2);
                expect(ability).toBeLessThan(2);
                expect(typeof ability).toBe('number');
            });
            
            test('should handle empty response set', () => {
                const ability = testEngine.estimateAbilityMLE([], 0);
                expect(ability).toBe(0); // Should return initial ability
            });
        });
        
        describe('Stopping Rules', () => {
            test('should stop when standard error is below threshold', () => {
                const responses = Array(20).fill({
                    questionId: '1',
                    isCorrect: true,
                    difficulty: 0,
                    discrimination: 1.0
                });
                
                const shouldStop = testEngine.shouldStopTest(responses, 1.0);
                
                expect(shouldStop.shouldStop).toBe(true);
                expect(shouldStop.reason).toBe('standard_error');
            });
            
            test('should stop when maximum questions reached', () => {
                const responses = Array(50).fill({
                    questionId: '1',
                    isCorrect: true,
                    difficulty: 0,
                    discrimination: 1.0
                });
                
                const shouldStop = testEngine.shouldStopTest(responses, 1.0);
                
                expect(shouldStop.shouldStop).toBe(true);
                expect(shouldStop.reason).toBe('max_questions');
            });
        });
    });
    
    describe('Question Type System', () => {
        describe('Multiple Choice Questions', () => {
            test('should create valid multiple choice question', () => {
                const content = {
                    stem: 'What is 2 + 2?',
                    options: [
                        { id: 'a', text: '3', isCorrect: false },
                        { id: 'b', text: '4', isCorrect: true },
                        { id: 'c', text: '5', isCorrect: false }
                    ]
                };
                
                const question = questionManager.createQuestion('multiple_choice', content);
                
                expect(question).toBeDefined();
                expect(question.type).toBe('multiplechoice');
                
                const rendered = question.render();
                expect(rendered.options).toHaveLength(3);
            });
            
            test('should validate question content', () => {
                const invalidContent = {
                    stem: 'What is 2 + 2?',
                    options: [
                        { id: 'a', text: '4', isCorrect: true }
                    ] // Only one option
                };
                
                const validation = questionManager.validateQuestion('multiple_choice', invalidContent);
                
                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('At least 2 options are required');
            });
            
            test('should evaluate responses correctly', () => {
                const content = {
                    stem: 'What is 2 + 2?',
                    options: [
                        { id: 'a', text: '3', isCorrect: false },
                        { id: 'b', text: '4', isCorrect: true },
                        { id: 'c', text: '5', isCorrect: false }
                    ]
                };
                
                const question = questionManager.createQuestion('multiple_choice', content);
                
                const correctResponse = { selectedOption: 'b' };
                const incorrectResponse = { selectedOption: 'a' };
                
                const correctResult = question.evaluate(correctResponse);
                const incorrectResult = question.evaluate(incorrectResponse);
                
                expect(correctResult.isCorrect).toBe(true);
                expect(correctResult.score).toBe(1.0);
                
                expect(incorrectResult.isCorrect).toBe(false);
                expect(incorrectResult.score).toBe(0.0);
            });
        });
        
        describe('Short Answer Questions', () => {
            test('should evaluate numeric answers with tolerance', () => {
                const content = {
                    stem: 'What is the square root of 16?',
                    correctAnswer: '4',
                    inputType: 'numeric',
                    tolerance: 0.01
                };
                
                const question = questionManager.createQuestion('short_answer', content);
                
                const exactResponse = { answer: '4' };
                const closeResponse = { answer: '4.005' };
                const farResponse = { answer: '3.5' };
                
                const exactResult = question.evaluate(exactResponse);
                const closeResult = question.evaluate(closeResponse);
                const farResult = question.evaluate(farResponse);
                
                expect(exactResult.isCorrect).toBe(true);
                expect(closeResult.isCorrect).toBe(true);
                expect(farResult.isCorrect).toBe(false);
            });
            
            test('should handle case sensitivity settings', () => {
                const content = {
                    stem: 'What is the capital of France?',
                    correctAnswer: 'Paris',
                    inputType: 'text'
                };
                
                const question = questionManager.createQuestion('short_answer', content, {
                    caseSensitive: false
                });
                
                const response = { answer: 'paris' };
                const result = question.evaluate(response);
                
                expect(result.isCorrect).toBe(true);
            });
        });
        
        describe('Equation Editor Questions', () => {
            test('should validate equation syntax', () => {
                const content = {
                    stem: 'Enter the quadratic formula',
                    correctAnswer: 'x = (-b ± sqrt(b^2 - 4ac)) / (2a)'
                };
                
                const question = questionManager.createQuestion('equation_editor', content);
                
                const validEquation = 'x = (-b + sqrt(b^2 - 4*a*c)) / (2*a)';
                const invalidEquation = 'x = (-b + sqrt(b^2 - 4*a*c)) / (2*a';
                
                const validResult = question.validateEquationSyntax(validEquation);
                const invalidResult = question.validateEquationSyntax(invalidEquation);
                
                expect(validResult.isValid).toBe(true);
                expect(invalidResult.isValid).toBe(false);
                expect(invalidResult.error).toContain('parenthesis');
            });
        });
    });
    
    describe('Gamification System', () => {
        describe('Point System', () => {
            test('should award points for correct answers', async () => {
                const userId = 'test-user-1';
                const points = await gamificationSystem.awardPoints(userId, 'correct_answer', {
                    difficulty: 'medium',
                    streakDays: 5
                });
                
                expect(points).toBeGreaterThan(0);
                expect(points).toBeGreaterThan(10); // Base points with multipliers
            });
            
            test('should apply difficulty multipliers', async () => {
                const userId = 'test-user-2';
                
                const easyPoints = await gamificationSystem.awardPoints(userId, 'correct_answer', {
                    difficulty: 'easy'
                });
                
                const hardPoints = await gamificationSystem.awardPoints(userId, 'correct_answer', {
                    difficulty: 'hard'
                });
                
                expect(hardPoints).toBeGreaterThan(easyPoints);
            });
        });
        
        describe('Streak System', () => {
            test('should track daily streaks correctly', async () => {
                const userId = 'test-user-3';
                
                const streak = await gamificationSystem.updateStreak(userId, 'question_correct');
                
                expect(streak).toBeGreaterThanOrEqual(1);
                expect(typeof streak).toBe('number');
            });
            
            test('should not increment streak for same day activity', async () => {
                const userId = 'test-user-4';
                
                const firstStreak = await gamificationSystem.updateStreak(userId, 'question_correct');
                const secondStreak = await gamificationSystem.updateStreak(userId, 'question_correct');
                
                expect(secondStreak).toBe(firstStreak);
            });
        });
        
        describe('Achievement System', () => {
            test('should check achievement requirements', async () => {
                const userId = 'test-user-5';
                
                const meetsRequirement = await gamificationSystem.checkAchievementRequirements(
                    userId,
                    'questions_correct',
                    { count: 1 }
                );
                
                expect(typeof meetsRequirement).toBe('boolean');
            });
            
            test('should award achievement when requirements are met', async () => {
                const userId = 'test-user-6';
                
                const awarded = await gamificationSystem.checkAndAwardAchievement(
                    userId,
                    'first_correct',
                    { questionsCorrect: 1 }
                );
                
                expect(typeof awarded).toBe('boolean');
            });
        });
    });
    
    describe('Security System', () => {
        describe('Authentication', () => {
            test('should hash passwords securely', async () => {
                const password = 'testPassword123!';
                const hashedPassword = await securitySystem.hashPassword(password);
                
                expect(hashedPassword).toBeDefined();
                expect(hashedPassword).not.toBe(password);
                expect(hashedPassword.length).toBeGreaterThan(50);
            });
            
            test('should verify passwords correctly', async () => {
                const password = 'testPassword123!';
                const hashedPassword = await securitySystem.hashPassword(password);
                
                const isValid = await securitySystem.verifyPassword(password, hashedPassword);
                const isInvalid = await securitySystem.verifyPassword('wrongPassword', hashedPassword);
                
                expect(isValid).toBe(true);
                expect(isInvalid).toBe(false);
            });
            
            test('should validate password complexity', () => {
                const weakPassword = 'weak';
                const strongPassword = 'StrongP@ssw0rd123';
                
                const weakResult = securitySystem.validatePassword(weakPassword);
                const strongResult = securitySystem.validatePassword(strongPassword);
                
                expect(weakResult).toBe(false);
                expect(strongResult).toBe(true);
            });
        });
        
        describe('Session Management', () => {
            test('should create secure sessions', async () => {
                const userId = 'test-user-7';
                const deviceInfo = { browser: 'Chrome', os: 'Windows' };
                const ipAddress = '192.168.1.1';
                const userAgent = 'Mozilla/5.0...';
                
                const session = await securitySystem.createSession(userId, deviceInfo, ipAddress, userAgent);
                
                expect(session).toBeDefined();
                expect(session.sessionId).toBeDefined();
                expect(session.userId).toBe(userId);
                expect(session.isActive).toBe(true);
            });
            
            test('should validate active sessions', async () => {
                const userId = 'test-user-8';
                const deviceInfo = { browser: 'Firefox', os: 'MacOS' };
                const ipAddress = '192.168.1.2';
                const userAgent = 'Mozilla/5.0...';
                
                const session = await securitySystem.createSession(userId, deviceInfo, ipAddress, userAgent);
                const validatedSession = await securitySystem.validateSession(session.sessionId);
                
                expect(validatedSession).toBeDefined();
                expect(validatedSession.userId).toBe(userId);
            });
        });
        
        describe('Anti-Cheating', () => {
            test('should detect suspicious response times', async () => {
                const userId = 'test-user-9';
                const sessionId = 'session-123';
                
                const suspiciousData = {
                    responseTimes: [100, 102, 98, 101, 99], // Too consistent
                    accuracyData: [],
                    deviceData: {},
                    ipAddress: '192.168.1.3'
                };
                
                const analysis = await securitySystem.analyzeUserBehavior(userId, sessionId, suspiciousData);
                
                expect(analysis.riskScore).toBeGreaterThan(0);
                expect(analysis.flags).toContain('consistent_timing');
            });
            
            test('should detect automation tools', () => {
                const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/91.0.4472.101 Safari/537.36';
                const browserFingerprint = { webdriver: true, plugins: [] };
                
                const isAutomation = securitySystem.detectAutomationTools(userAgent, browserFingerprint);
                
                expect(isAutomation).toBe(true);
            });
        });
    });
    
    describe('Analytics Dashboard', () => {
        describe('Real-time Metrics', () => {
            test('should collect system metrics', async () => {
                const metrics = {
                    activeUsers: 100,
                    activeSessions: 50,
                    questionsPerMinute: 25,
                    avgResponseTime: 30,
                    accuracyRate: 0.75
                };
                
                // Mock the metrics collection
                jest.spyOn(analytics, 'getActiveUsersCount').mockResolvedValue(metrics.activeUsers);
                jest.spyOn(analytics, 'getActiveSessionsCount').mockResolvedValue(metrics.activeSessions);
                jest.spyOn(analytics, 'getQuestionsPerMinute').mockResolvedValue(metrics.questionsPerMinute);
                jest.spyOn(analytics, 'getAverageResponseTime').mockResolvedValue(metrics.avgResponseTime);
                jest.spyOn(analytics, 'getCurrentAccuracyRate').mockResolvedValue(metrics.accuracyRate);
                
                const collectedMetrics = await analytics.collectRealTimeMetrics();
                
                expect(collectedMetrics).toBeDefined();
            });
        });
        
        describe('Performance Analytics', () => {
            test('should generate user performance analytics', async () => {
                const userId = 'test-user-10';
                const timeframe = '7d';
                
                const analytics_data = await analytics.getUserPerformanceAnalytics(userId, timeframe);
                
                expect(analytics_data).toBeDefined();
                expect(analytics_data.userId).toBe(userId);
                expect(analytics_data.timeframe).toBe(timeframe);
                expect(analytics_data.basicStats).toBeDefined();
            });
        });
        
        describe('System Health', () => {
            test('should check system health', async () => {
                const health = await analytics.getSystemHealth();
                
                expect(health).toBeDefined();
                expect(health.overall).toBeDefined();
                expect(health.database).toBeDefined();
                expect(health.redis).toBeDefined();
                expect(health.mongodb).toBeDefined();
            });
        });
    });
    
    describe('Performance Tracker', () => {
        describe('Skill Mastery', () => {
            test('should calculate mastery level correctly', () => {
                const highAccuracy = performanceTracker.calculateMasteryLevel(0.9, 15);
                const lowAccuracy = performanceTracker.calculateMasteryLevel(0.4, 10);
                const fewAttempts = performanceTracker.calculateMasteryLevel(0.8, 3);
                
                expect(highAccuracy).toBe('mastered');
                expect(lowAccuracy).toBe('struggling');
                expect(fewAttempts).toBe('learning');
            });
            
            test('should calculate mastery confidence', () => {
                const highConfidence = performanceTracker.calculateMasteryConfidence(0.9, 20);
                const lowConfidence = performanceTracker.calculateMasteryConfidence(0.5, 5);
                
                expect(highConfidence).toBeGreaterThan(0.8);
                expect(lowConfidence).toBeLessThan(0.3);
            });
        });
        
        describe('Ability Estimation', () => {
            test('should calculate new ability estimate', () => {
                const currentAbility = 0.5;
                const difficulty = 0.0;
                const discrimination = 1.0;
                const guessing = 0.0;
                const isCorrect = true;
                
                const newAbility = performanceTracker.calculateNewAbility(
                    currentAbility,
                    difficulty,
                    discrimination,
                    guessing,
                    isCorrect
                );
                
                expect(newAbility).toBeGreaterThan(currentAbility);
                expect(newAbility).toBeLessThan(4);
                expect(newAbility).toBeGreaterThan(-4);
            });
        });
        
        describe('Progress Tracking', () => {
            test('should track performance metrics', async () => {
                const userId = 'test-user-11';
                const questionId = 'question-123';
                const isCorrect = true;
                const responseTime = 25.5;
                
                await performanceTracker.trackAttempt(userId, questionId, isCorrect, responseTime);
                
                // Verify that the attempt was tracked
                const performance = await performanceTracker.getCurrentPerformance(userId);
                
                expect(performance).toBeDefined();
                expect(performance.totalAttempts).toBeGreaterThan(0);
            });
        });
    });
    
    describe('Integration Tests', () => {
        describe('End-to-End Test Flow', () => {
            test('should complete full adaptive test cycle', async () => {
                const userId = 'integration-test-user';
                const testConfig = {
                    testType: 'practice',
                    subjectId: 'math-algebra',
                    maxQuestions: 10,
                    timeLimit: 600
                };
                
                // Start test
                const testSession = await testEngine.startAdaptiveTest(userId, testConfig);
                expect(testSession).toBeDefined();
                expect(testSession.sessionId).toBeDefined();
                
                // Answer questions
                for (let i = 0; i < 5; i++) {
                    const questionData = await testEngine.getNextQuestion(testSession.sessionId);
                    expect(questionData).toBeDefined();
                    
                    const isCorrect = Math.random() > 0.5;
                    const responseTime = Math.random() * 30 + 10;
                    
                    const result = await testEngine.submitAnswer(
                        testSession.sessionId,
                        questionData.question.id,
                        isCorrect ? 'correct' : 'incorrect',
                        { responseTime }
                    );
                    
                    expect(result).toBeDefined();
                    expect(result.isCorrect).toBe(isCorrect);
                }
                
                // End test
                const results = await testEngine.endAdaptiveTest(testSession.sessionId);
                expect(results).toBeDefined();
                expect(results.finalAbility).toBeDefined();
                expect(results.questionCount).toBe(5);
            });
        });
        
        describe('Performance Integration', () => {
            test('should update all systems when tracking performance', async () => {
                const userId = 'integration-user-2';
                const questionId = 'integration-question-1';
                const isCorrect = true;
                const responseTime = 15.2;
                
                // Track performance
                await performanceTracker.trackAttempt(userId, questionId, isCorrect, responseTime);
                
                // Verify gamification system received the event
                const userStats = await gamificationSystem.getUserStats(userId);
                expect(userStats).toBeDefined();
                
                // Verify analytics received the data
                const performanceData = await analytics.getUserPerformanceAnalytics(userId, '1d');
                expect(performanceData).toBeDefined();
            });
        });
    });
    
    describe('Error Handling', () => {
        test('should handle invalid question types gracefully', () => {
            expect(() => {
                questionManager.createQuestion('invalid_type', {});
            }).toThrow('Unsupported question type');
        });
        
        test('should handle database connection errors', async () => {
            // Mock database error
            const mockError = new Error('Database connection failed');
            jest.spyOn(testEngine.pgPool, 'query').mockRejectedValueOnce(mockError);
            
            try {
                await testEngine.getQuestionFromDatabase('test-id');
            } catch (error) {
                expect(error).toBeDefined();
            }
        });
        
        test('should handle malformed responses', async () => {
            const userId = 'error-test-user';
            const questionId = 'error-test-question';
            const malformedResponse = null;
            
            try {
                await performanceTracker.trackAttempt(userId, questionId, malformedResponse, 'invalid-time');
            } catch (error) {
                expect(error).toBeDefined();
            }
        });
    });
    
    describe('Performance Benchmarks', () => {
        test('should complete IRT calculations within time limit', () => {
            const startTime = Date.now();
            
            for (let i = 0; i < 1000; i++) {
                const ability = Math.random() * 4 - 2;
                const difficulty = Math.random() * 4 - 2;
                const discrimination = Math.random() * 2 + 0.5;
                const guessing = Math.random() * 0.3;
                
                testEngine.calculateProbability(ability, difficulty, discrimination, guessing);
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(1000); // Should complete in under 1 second
        });
        
        test('should handle high concurrent user load', async () => {
            const concurrentUsers = 100;
            const promises = [];
            
            for (let i = 0; i < concurrentUsers; i++) {
                const userId = `load-test-user-${i}`;
                const promise = performanceTracker.trackAttempt(userId, 'load-test-question', true, 20);
                promises.push(promise);
            }
            
            const startTime = Date.now();
            await Promise.all(promises);
            const endTime = Date.now();
            
            const duration = endTime - startTime;
            expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
        });
    });
    
    describe('Data Consistency', () => {
        test('should maintain data integrity across systems', async () => {
            const userId = 'consistency-test-user';
            const questionId = 'consistency-test-question';
            const isCorrect = true;
            const responseTime = 25.0;
            
            // Track performance
            await performanceTracker.trackAttempt(userId, questionId, isCorrect, responseTime);
            
            // Wait for async operations to complete
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check that data is consistent across systems
            const performanceData = await performanceTracker.getCurrentPerformance(userId);
            const userStats = await gamificationSystem.getUserStats(userId);
            
            expect(performanceData.totalAttempts).toBeGreaterThan(0);
            expect(userStats.total_questions_attempted).toBeGreaterThanOrEqual(performanceData.totalAttempts);
        });
    });
});

// Test utilities
class TestDataGenerator {
    static generateRandomUser() {
        return {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            username: `testuser${Math.floor(Math.random() * 1000)}`,
            email: `test${Math.floor(Math.random() * 1000)}@example.com`,
            gradeLevel: Math.floor(Math.random() * 12) + 1
        };
    }
    
    static generateRandomQuestion() {
        const types = ['multiple_choice', 'short_answer', 'equation_editor'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        return {
            id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            difficulty: Math.random() * 4 - 2,
            discrimination: Math.random() * 2 + 0.5,
            guessing: Math.random() * 0.3,
            content: this.generateQuestionContent(type)
        };
    }
    
    static generateQuestionContent(type) {
        switch (type) {
            case 'multiple_choice':
                return {
                    stem: 'What is 2 + 2?',
                    options: [
                        { id: 'a', text: '3', isCorrect: false },
                        { id: 'b', text: '4', isCorrect: true },
                        { id: 'c', text: '5', isCorrect: false },
                        { id: 'd', text: '6', isCorrect: false }
                    ]
                };
            case 'short_answer':
                return {
                    stem: 'What is the square root of 16?',
                    correctAnswer: '4',
                    inputType: 'numeric'
                };
            case 'equation_editor':
                return {
                    stem: 'Enter the quadratic formula',
                    correctAnswer: 'x = (-b ± sqrt(b^2 - 4ac)) / (2a)'
                };
            default:
                return { stem: 'Test question' };
        }
    }
    
    static generateTestSession(userId, questionCount = 10) {
        const questions = [];
        for (let i = 0; i < questionCount; i++) {
            questions.push(this.generateRandomQuestion());
        }
        
        return {
            sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            questions,
            responses: [],
            startTime: new Date(),
            endTime: null,
            isCompleted: false
        };
    }
}

// Mock data for testing
const mockQuestions = [
    {
        id: 'q1',
        title: 'Basic Addition',
        difficulty_parameter: -1.0,
        discrimination_parameter: 1.2,
        guessing_parameter: 0.25,
        content: {
            stem: 'What is 5 + 3?',
            options: [
                { id: 'a', text: '7', isCorrect: false },
                { id: 'b', text: '8', isCorrect: true },
                { id: 'c', text: '9', isCorrect: false },
                { id: 'd', text: '10', isCorrect: false }
            ]
        }
    },
    {
        id: 'q2',
        title: 'Basic Multiplication',
        difficulty_parameter: 0.0,
        discrimination_parameter: 1.0,
        guessing_parameter: 0.25,
        content: {
            stem: 'What is 7 × 6?',
            options: [
                { id: 'a', text: '40', isCorrect: false },
                { id: 'b', text: '42', isCorrect: true },
                { id: 'c', text: '44', isCorrect: false },
                { id: 'd', text: '46', isCorrect: false }
            ]
        }
    },
    {
        id: 'q3',
        title: 'Advanced Algebra',
        difficulty_parameter: 1.5,
        discrimination_parameter: 1.5,
        guessing_parameter: 0.25,
        content: {
            stem: 'Solve for x: 2x + 5 = 13',
            options: [
                { id: 'a', text: '3', isCorrect: false },
                { id: 'b', text: '4', isCorrect: true },
                { id: 'c', text: '5', isCorrect: false },
                { id: 'd', text: '6', isCorrect: false }
            ]
        }
    }
];

module.exports = {
    TestDataGenerator,
    mockQuestions
};