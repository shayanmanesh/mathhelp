// Adaptive Testing Engine with Item Response Theory (IRT)
// Advanced implementation for Math Help Testing System

const { MongoClient } = require('mongodb');
const { Pool } = require('pg');
const { redisManager } = require('../database/redis-config');

class AdaptiveTestingEngine {
    constructor(config = {}) {
        this.config = {
            // IRT Parameters
            defaultAbility: 0.0,
            defaultStandardError: 1.0,
            targetStandardError: 0.3,
            maxIterations: 50,
            convergenceThreshold: 0.001,
            
            // Question Selection
            selectionAlgorithm: 'maximum_information', // 'maximum_information', 'owen', 'random'
            contentBalancing: true,
            exposureControl: true,
            maxExposureRate: 0.3,
            
            // Stopping Rules
            minQuestions: 10,
            maxQuestions: 30,
            maxTime: 1800, // 30 minutes
            confidenceLevel: 0.95,
            
            // Content Constraints
            subjectDistribution: {
                algebra: 0.4,
                geometry: 0.3,
                calculus: 0.3
            },
            
            ...config
        };
        
        this.pgPool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'mathhelp',
            user: process.env.DB_USER || 'mathhelp',
            password: process.env.DB_PASSWORD || 'password',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        
        this.mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
        this.mongodb = null;
        
        this.redis = redisManager;
        
        this.initializeDatabase();
    }
    
    async initializeDatabase() {
        try {
            await this.mongoClient.connect();
            this.mongodb = this.mongoClient.db('mathhelp_testing');
            console.log('Adaptive Testing Engine initialized');
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }
    
    // ============================================
    // CORE IRT ALGORITHMS
    // ============================================
    
    /**
     * Calculate probability of correct response using 3PL IRT model
     * P(θ) = c + (1-c) * exp(a(θ-b)) / (1 + exp(a(θ-b)))
     */
    calculateProbability(ability, difficulty, discrimination = 1.0, guessing = 0.0) {
        const exponent = discrimination * (ability - difficulty);
        const probability = guessing + (1 - guessing) * (Math.exp(exponent) / (1 + Math.exp(exponent)));
        
        return Math.max(0.001, Math.min(0.999, probability)); // Bound between 0.001 and 0.999
    }
    
    /**
     * Calculate information function for a question
     * I(θ) = a² * P(θ) * Q(θ) * (1-c)² / (P(θ) - c)²
     */
    calculateInformation(ability, difficulty, discrimination = 1.0, guessing = 0.0) {
        const probability = this.calculateProbability(ability, difficulty, discrimination, guessing);
        const q = 1 - probability;
        
        if (guessing === 0.0) {
            // 2PL model
            return Math.pow(discrimination, 2) * probability * q;
        } else {
            // 3PL model
            const numerator = Math.pow(discrimination, 2) * probability * q * Math.pow(1 - guessing, 2);
            const denominator = Math.pow(probability - guessing, 2);
            return numerator / denominator;
        }
    }
    
    /**
     * Calculate test information (sum of item informations)
     */
    calculateTestInformation(ability, questions) {
        return questions.reduce((sum, question) => {
            return sum + this.calculateInformation(
                ability,
                question.difficulty_parameter,
                question.discrimination_parameter,
                question.guessing_parameter
            );
        }, 0);
    }
    
    /**
     * Calculate standard error
     * SE(θ) = 1 / √I(θ)
     */
    calculateStandardError(ability, questions) {
        const information = this.calculateTestInformation(ability, questions);
        return information > 0 ? 1 / Math.sqrt(information) : this.config.defaultStandardError;
    }
    
    /**
     * Update ability estimate using Maximum Likelihood Estimation
     */
    updateAbilityMLE(currentAbility, responses) {
        let ability = currentAbility;
        let lastAbility = ability;
        
        for (let iteration = 0; iteration < this.config.maxIterations; iteration++) {
            let firstDerivative = 0;
            let secondDerivative = 0;
            
            for (const response of responses) {
                const { question, isCorrect } = response;
                const { difficulty_parameter: b, discrimination_parameter: a, guessing_parameter: c } = question;
                
                const probability = this.calculateProbability(ability, b, a, c);
                const q = 1 - probability;
                
                // First derivative (score function)
                const score = isCorrect ? (1 - probability) : (-probability);
                firstDerivative += a * score;
                
                // Second derivative (information function)
                if (c === 0.0) {
                    // 2PL model
                    secondDerivative -= Math.pow(a, 2) * probability * q;
                } else {
                    // 3PL model
                    const pMinusC = probability - c;
                    const term1 = Math.pow(a, 2) * probability * q * Math.pow(1 - c, 2);
                    const term2 = Math.pow(pMinusC, 2);
                    secondDerivative -= term1 / term2;
                }
            }
            
            // Newton-Raphson update
            if (Math.abs(secondDerivative) < 1e-10) break;
            
            ability = ability - (firstDerivative / secondDerivative);
            
            // Check convergence
            if (Math.abs(ability - lastAbility) < this.config.convergenceThreshold) {
                break;
            }
            
            lastAbility = ability;
        }
        
        return ability;
    }
    
    /**
     * Update ability estimate using Bayesian Expected A Posteriori (EAP)
     */
    updateAbilityEAP(currentAbility, responses, priorMean = 0.0, priorSD = 1.0) {
        const quadraturePoints = this.generateQuadraturePoints(-4, 4, 61);
        let numerator = 0;
        let denominator = 0;
        
        for (const point of quadraturePoints) {
            const { theta, weight } = point;
            
            // Calculate likelihood
            let likelihood = 1;
            for (const response of responses) {
                const { question, isCorrect } = response;
                const { difficulty_parameter: b, discrimination_parameter: a, guessing_parameter: c } = question;
                
                const probability = this.calculateProbability(theta, b, a, c);
                likelihood *= isCorrect ? probability : (1 - probability);
            }
            
            // Calculate prior density (normal distribution)
            const prior = this.normalDensity(theta, priorMean, priorSD);
            
            // Calculate posterior
            const posterior = likelihood * prior * weight;
            
            numerator += theta * posterior;
            denominator += posterior;
        }
        
        return denominator > 0 ? numerator / denominator : currentAbility;
    }
    
    /**
     * Generate quadrature points for numerical integration
     */
    generateQuadraturePoints(min, max, numPoints) {
        const points = [];
        const step = (max - min) / (numPoints - 1);
        
        for (let i = 0; i < numPoints; i++) {
            const theta = min + i * step;
            const weight = this.normalDensity(theta, 0, 1);
            points.push({ theta, weight });
        }
        
        return points;
    }
    
    /**
     * Calculate normal distribution density
     */
    normalDensity(x, mean = 0, sd = 1) {
        const coefficient = 1 / (sd * Math.sqrt(2 * Math.PI));
        const exponent = -0.5 * Math.pow((x - mean) / sd, 2);
        return coefficient * Math.exp(exponent);
    }
    
    // ============================================
    // QUESTION SELECTION ALGORITHMS
    // ============================================
    
    /**
     * Select next question using Maximum Information criterion
     */
    async selectQuestionMaxInfo(ability, usedQuestions, constraints = {}) {
        const query = this.buildQuestionQuery(constraints, usedQuestions);
        
        const result = await this.pgPool.query(query.sql, query.params);
        const candidates = result.rows;
        
        if (candidates.length === 0) {
            throw new Error('No suitable questions found');
        }
        
        // Calculate information for each candidate
        const questionsWithInfo = candidates.map(question => ({
            ...question,
            information: this.calculateInformation(
                ability,
                question.difficulty_parameter,
                question.discrimination_parameter,
                question.guessing_parameter
            )
        }));
        
        // Sort by information (descending)
        questionsWithInfo.sort((a, b) => b.information - a.information);
        
        // Apply exposure control
        const selectedQuestion = await this.applyExposureControl(questionsWithInfo, ability);
        
        return selectedQuestion;
    }
    
    /**
     * Select next question using Owen's method (balanced information and content)
     */
    async selectQuestionOwen(ability, usedQuestions, constraints = {}) {
        const query = this.buildQuestionQuery(constraints, usedQuestions);
        
        const result = await this.pgPool.query(query.sql, query.params);
        const candidates = result.rows;
        
        if (candidates.length === 0) {
            throw new Error('No suitable questions found');
        }
        
        // Calculate combined score (information + content balancing)
        const questionsWithScore = candidates.map(question => {
            const information = this.calculateInformation(
                ability,
                question.difficulty_parameter,
                question.discrimination_parameter,
                question.guessing_parameter
            );
            
            const contentScore = this.calculateContentScore(question, constraints);
            const combinedScore = information * 0.7 + contentScore * 0.3;
            
            return {
                ...question,
                information,
                contentScore,
                combinedScore
            };
        });
        
        // Sort by combined score (descending)
        questionsWithScore.sort((a, b) => b.combinedScore - a.combinedScore);
        
        return questionsWithScore[0];
    }
    
    /**
     * Apply exposure control to prevent overuse of certain questions
     */
    async applyExposureControl(candidates, ability) {
        if (!this.config.exposureControl) {
            return candidates[0];
        }
        
        // Get exposure rates from Redis
        const exposureRates = await Promise.all(
            candidates.map(async (question) => {
                const key = `exposure:${question.id}`;
                const rate = await this.redis.client.get(key);
                return {
                    ...question,
                    exposureRate: rate ? parseFloat(rate) : 0
                };
            })
        );
        
        // Filter out over-exposed questions
        const filteredQuestions = exposureRates.filter(
            question => question.exposureRate < this.config.maxExposureRate
        );
        
        if (filteredQuestions.length === 0) {
            // All questions are over-exposed, return the best one
            return candidates[0];
        }
        
        // Select from top 3 questions to introduce some randomness
        const topQuestions = filteredQuestions.slice(0, 3);
        const selectedIndex = Math.floor(Math.random() * topQuestions.length);
        const selectedQuestion = topQuestions[selectedIndex];
        
        // Update exposure rate
        await this.updateExposureRate(selectedQuestion.id);
        
        return selectedQuestion;
    }
    
    /**
     * Calculate content balancing score
     */
    calculateContentScore(question, constraints) {
        // Implement content balancing logic based on subject distribution
        const subjectWeight = this.config.subjectDistribution[question.subject_code] || 0.1;
        const difficultyScore = 1 - Math.abs(question.difficulty_parameter - constraints.targetDifficulty || 0);
        
        return subjectWeight * difficultyScore;
    }
    
    /**
     * Build SQL query for question selection
     */
    buildQuestionQuery(constraints, usedQuestions) {
        let sql = `
            SELECT q.*, s.code as subject_code
            FROM questions q
            JOIN subjects s ON q.subject_id = s.id
            WHERE q.status = 'published'
        `;
        
        const params = [];
        let paramIndex = 1;
        
        // Exclude used questions
        if (usedQuestions.length > 0) {
            sql += ` AND q.id NOT IN (${usedQuestions.map(() => `$${paramIndex++}`).join(',')})`;
            params.push(...usedQuestions);
        }
        
        // Apply constraints
        if (constraints.subjects && constraints.subjects.length > 0) {
            sql += ` AND s.code = ANY($${paramIndex++})`;
            params.push(constraints.subjects);
        }
        
        if (constraints.skills && constraints.skills.length > 0) {
            sql += ` AND q.skill_id = ANY($${paramIndex++})`;
            params.push(constraints.skills);
        }
        
        if (constraints.gradeLevel) {
            sql += ` AND q.grade_level_min <= $${paramIndex++} AND q.grade_level_max >= $${paramIndex++}`;
            params.push(constraints.gradeLevel, constraints.gradeLevel);
        }
        
        if (constraints.difficultyRange) {
            sql += ` AND q.difficulty_parameter BETWEEN $${paramIndex++} AND $${paramIndex++}`;
            params.push(constraints.difficultyRange[0], constraints.difficultyRange[1]);
        }
        
        sql += ' ORDER BY q.times_used ASC LIMIT 50';
        
        return { sql, params };
    }
    
    // ============================================
    // STOPPING RULES
    // ============================================
    
    /**
     * Check if test should stop based on multiple criteria
     */
    shouldStopTest(testState) {
        const { responses, currentAbility, startTime, questions } = testState;
        const currentTime = Date.now();
        const elapsedTime = (currentTime - startTime) / 1000; // seconds
        
        // Minimum questions requirement
        if (responses.length < this.config.minQuestions) {
            return { shouldStop: false, reason: 'minimum_questions_not_met' };
        }
        
        // Maximum questions limit
        if (responses.length >= this.config.maxQuestions) {
            return { shouldStop: true, reason: 'maximum_questions_reached' };
        }
        
        // Time limit
        if (elapsedTime >= this.config.maxTime) {
            return { shouldStop: true, reason: 'time_limit_exceeded' };
        }
        
        // Standard error criterion
        const standardError = this.calculateStandardError(currentAbility, questions);
        if (standardError <= this.config.targetStandardError) {
            return { shouldStop: true, reason: 'target_precision_achieved' };
        }
        
        // Confidence interval criterion
        const confidenceInterval = this.calculateConfidenceInterval(currentAbility, standardError);
        if (confidenceInterval.width <= 1.0) { // Adjust threshold as needed
            return { shouldStop: true, reason: 'confidence_interval_narrow' };
        }
        
        return { shouldStop: false, reason: 'continue_testing' };
    }
    
    /**
     * Calculate confidence interval for ability estimate
     */
    calculateConfidenceInterval(ability, standardError) {
        const z = 1.96; // 95% confidence
        const margin = z * standardError;
        
        return {
            lower: ability - margin,
            upper: ability + margin,
            width: 2 * margin
        };
    }
    
    // ============================================
    // TEST SESSION MANAGEMENT
    // ============================================
    
    /**
     * Start a new adaptive test session
     */
    async startAdaptiveTest(userId, testConfig = {}) {
        const sessionId = this.generateSessionId();
        
        // Get user's initial ability estimate
        const userQuery = 'SELECT current_ability_estimate, ability_standard_error FROM users WHERE id = $1';
        const userResult = await this.pgPool.query(userQuery, [userId]);
        
        const initialAbility = userResult.rows[0]?.current_ability_estimate || this.config.defaultAbility;
        const initialSE = userResult.rows[0]?.ability_standard_error || this.config.defaultStandardError;
        
        // Create test session
        const sessionQuery = `
            INSERT INTO test_sessions (id, user_id, test_id, status, started_at)
            VALUES ($1, $2, $3, 'started', CURRENT_TIMESTAMP)
            RETURNING *
        `;
        
        const sessionResult = await this.pgPool.query(sessionQuery, [
            sessionId,
            userId,
            testConfig.testId || null
        ]);
        
        // Initialize test state
        const testState = {
            sessionId,
            userId,
            testId: testConfig.testId,
            currentAbility: initialAbility,
            standardError: initialSE,
            responses: [],
            questions: [],
            startTime: Date.now(),
            constraints: testConfig.constraints || {},
            config: { ...this.config, ...testConfig }
        };
        
        // Store in Redis
        await this.redis.storeAdaptiveTestState(sessionId, testState);
        
        // Store in MongoDB for detailed analytics
        await this.mongodb.collection('adaptiveData').insertOne({
            userId,
            sessionId,
            testType: testConfig.testType || 'practice',
            responses: [],
            irtCalculations: {
                initialAbility,
                initialSE,
                algorithm: 'MLE',
                iterations: 0,
                convergence: false
            },
            selectionStrategy: {
                algorithm: this.config.selectionAlgorithm,
                parameters: this.config,
                contentConstraints: testConfig.constraints || {}
            },
            stoppingRules: {
                maxQuestions: this.config.maxQuestions,
                minQuestions: this.config.minQuestions,
                targetSE: this.config.targetStandardError,
                timeLimit: this.config.maxTime
            },
            metadata: {
                startTime: new Date(),
                deviceInfo: testConfig.deviceInfo || {},
                browserInfo: testConfig.browserInfo || {}
            }
        });
        
        return {
            sessionId,
            initialAbility,
            initialSE,
            testState
        };
    }
    
    /**
     * Get next question for adaptive test
     */
    async getNextQuestion(sessionId) {
        // Get test state from Redis
        const testState = await this.redis.getAdaptiveTestState(sessionId);
        
        if (!testState) {
            throw new Error('Test session not found');
        }
        
        // Check stopping rules
        const stopCheck = this.shouldStopTest(testState);
        
        if (stopCheck.shouldStop) {
            return await this.endAdaptiveTest(sessionId, stopCheck.reason);
        }
        
        // Select next question
        const usedQuestions = testState.questions.map(q => q.id);
        
        let nextQuestion;
        switch (this.config.selectionAlgorithm) {
            case 'maximum_information':
                nextQuestion = await this.selectQuestionMaxInfo(
                    testState.currentAbility,
                    usedQuestions,
                    testState.constraints
                );
                break;
            case 'owen':
                nextQuestion = await this.selectQuestionOwen(
                    testState.currentAbility,
                    usedQuestions,
                    testState.constraints
                );
                break;
            default:
                throw new Error(`Unknown selection algorithm: ${this.config.selectionAlgorithm}`);
        }
        
        // Get question content from MongoDB
        const questionContent = await this.mongodb.collection('questionBank').findOne({
            id: nextQuestion.id
        });
        
        // Update test state
        testState.questions.push(nextQuestion);
        await this.redis.updateAdaptiveTestState(sessionId, testState);
        
        return {
            question: {
                ...nextQuestion,
                content: questionContent?.content || {},
                hints: questionContent?.hints || [],
                media: questionContent?.media || []
            },
            testState: {
                currentAbility: testState.currentAbility,
                standardError: testState.standardError,
                questionsAnswered: testState.responses.length,
                totalQuestions: testState.questions.length,
                timeRemaining: this.config.maxTime - ((Date.now() - testState.startTime) / 1000)
            }
        };
    }
    
    /**
     * Submit answer and update ability estimate
     */
    async submitAnswer(sessionId, questionId, response, metadata = {}) {
        // Get test state
        const testState = await this.redis.getAdaptiveTestState(sessionId);
        
        if (!testState) {
            throw new Error('Test session not found');
        }
        
        // Find the question
        const question = testState.questions.find(q => q.id === questionId);
        
        if (!question) {
            throw new Error('Question not found in test session');
        }
        
        // Evaluate response
        const isCorrect = await this.evaluateResponse(questionId, response);
        const score = isCorrect ? 1.0 : 0.0;
        
        // Create response record
        const responseRecord = {
            questionId,
            response,
            isCorrect,
            score,
            timestamp: new Date(),
            responseTime: metadata.responseTime || null,
            hintsUsed: metadata.hintsUsed || 0,
            attemptsCount: metadata.attemptsCount || 1,
            abilityBefore: testState.currentAbility,
            standardErrorBefore: testState.standardError,
            question
        };
        
        // Update ability estimate
        testState.responses.push(responseRecord);
        
        const newAbility = this.updateAbilityMLE(testState.currentAbility, testState.responses);
        const newSE = this.calculateStandardError(newAbility, testState.questions);
        
        responseRecord.abilityAfter = newAbility;
        responseRecord.standardErrorAfter = newSE;
        
        // Update test state
        testState.currentAbility = newAbility;
        testState.standardError = newSE;
        
        await this.redis.updateAdaptiveTestState(sessionId, testState);
        
        // Store response in PostgreSQL
        await this.pgPool.query(`
            INSERT INTO user_attempts (
                user_id, question_id, response_json, score, max_score, is_correct,
                session_id, duration_seconds, hint_count, ability_before, ability_after,
                ability_se_before, ability_se_after, submitted_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
        `, [
            testState.userId,
            questionId,
            JSON.stringify(response),
            score,
            1.0,
            isCorrect,
            sessionId,
            metadata.responseTime || null,
            metadata.hintsUsed || 0,
            responseRecord.abilityBefore,
            responseRecord.abilityAfter,
            responseRecord.standardErrorBefore,
            responseRecord.standardErrorAfter
        ]);
        
        // Update MongoDB analytics
        await this.mongodb.collection('adaptiveData').updateOne(
            { sessionId },
            {
                $push: { responses: responseRecord },
                $set: {
                    'irtCalculations.finalAbility': newAbility,
                    'irtCalculations.finalSE': newSE,
                    'irtCalculations.convergence': newSE <= this.config.targetStandardError
                }
            }
        );
        
        return {
            isCorrect,
            score,
            abilityEstimate: newAbility,
            standardError: newSE,
            feedback: await this.generateFeedback(questionId, response, isCorrect)
        };
    }
    
    /**
     * End adaptive test session
     */
    async endAdaptiveTest(sessionId, reason = 'completed') {
        const testState = await this.redis.getAdaptiveTestState(sessionId);
        
        if (!testState) {
            throw new Error('Test session not found');
        }
        
        // Calculate final metrics
        const finalAbility = testState.currentAbility;
        const finalSE = testState.standardError;
        const totalQuestions = testState.responses.length;
        const correctAnswers = testState.responses.filter(r => r.isCorrect).length;
        const totalScore = testState.responses.reduce((sum, r) => sum + r.score, 0);
        const percentageScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        
        // Update test session in PostgreSQL
        await this.pgPool.query(`
            UPDATE test_sessions SET
                status = 'completed',
                completed_at = CURRENT_TIMESTAMP,
                total_questions = $1,
                questions_correct = $2,
                total_score = $3,
                percentage_score = $4,
                final_ability_estimate = $5,
                final_ability_se = $6
            WHERE id = $7
        `, [
            totalQuestions,
            correctAnswers,
            totalScore,
            percentageScore,
            finalAbility,
            finalSE,
            sessionId
        ]);
        
        // Update user's ability estimate
        await this.pgPool.query(`
            UPDATE users SET
                current_ability_estimate = $1,
                ability_standard_error = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
        `, [finalAbility, finalSE, testState.userId]);
        
        // Update MongoDB with final results
        await this.mongodb.collection('adaptiveData').updateOne(
            { sessionId },
            {
                $set: {
                    'metadata.endTime': new Date(),
                    'metadata.totalQuestions': totalQuestions,
                    'metadata.questionsCorrect': correctAnswers,
                    'metadata.averageResponseTime': this.calculateAverageResponseTime(testState.responses),
                    'irtCalculations.finalAbility': finalAbility,
                    'irtCalculations.finalSE': finalSE,
                    'irtCalculations.convergence': finalSE <= this.config.targetStandardError
                }
            }
        );
        
        // Clear Redis cache
        await this.redis.client.del(`adaptive:${sessionId}`);
        
        return {
            sessionId,
            reason,
            finalResults: {
                abilityEstimate: finalAbility,
                standardError: finalSE,
                totalQuestions,
                correctAnswers,
                percentageScore,
                totalScore,
                confidenceInterval: this.calculateConfidenceInterval(finalAbility, finalSE)
            }
        };
    }
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Evaluate user response
     */
    async evaluateResponse(questionId, response) {
        // Get question content from MongoDB
        const question = await this.mongodb.collection('questionBank').findOne({
            id: questionId
        });
        
        if (!question) {
            throw new Error('Question not found');
        }
        
        // Implement response evaluation logic based on question type
        switch (question.type) {
            case 'multiple_choice':
                return this.evaluateMultipleChoice(question, response);
            case 'short_answer':
                return this.evaluateShortAnswer(question, response);
            case 'true_false':
                return this.evaluateTrueFalse(question, response);
            default:
                throw new Error(`Unsupported question type: ${question.type}`);
        }
    }
    
    /**
     * Evaluate multiple choice response
     */
    evaluateMultipleChoice(question, response) {
        const correctOption = question.content.options.find(opt => opt.isCorrect);
        return response.selectedOption === correctOption.id;
    }
    
    /**
     * Evaluate short answer response
     */
    evaluateShortAnswer(question, response) {
        const correctAnswer = question.content.correctAnswer;
        const tolerance = question.content.tolerance || 0;
        
        if (typeof correctAnswer === 'number') {
            const numericResponse = parseFloat(response.answer);
            return Math.abs(numericResponse - correctAnswer) <= tolerance;
        } else {
            return response.answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
        }
    }
    
    /**
     * Evaluate true/false response
     */
    evaluateTrueFalse(question, response) {
        return response.answer === question.content.correctAnswer;
    }
    
    /**
     * Generate feedback for response
     */
    async generateFeedback(questionId, response, isCorrect) {
        const question = await this.mongodb.collection('questionBank').findOne({
            id: questionId
        });
        
        if (!question) {
            return { message: 'Question not found' };
        }
        
        return {
            isCorrect,
            message: isCorrect ? 'Correct!' : 'Incorrect. Try again.',
            explanation: question.solution?.steps?.[0]?.explanation || '',
            nextSteps: isCorrect ? 
                ['Great job! Moving to the next question.'] : 
                ['Review the solution and try similar problems.']
        };
    }
    
    /**
     * Calculate average response time
     */
    calculateAverageResponseTime(responses) {
        const responsesWithTime = responses.filter(r => r.responseTime);
        if (responsesWithTime.length === 0) return null;
        
        const totalTime = responsesWithTime.reduce((sum, r) => sum + r.responseTime, 0);
        return totalTime / responsesWithTime.length;
    }
    
    /**
     * Update question exposure rate
     */
    async updateExposureRate(questionId) {
        const key = `exposure:${questionId}`;
        const current = await this.redis.client.incr(key);
        
        if (current === 1) {
            await this.redis.client.expire(key, 86400); // 24 hours
        }
        
        // Calculate exposure rate based on total usage
        const total = await this.redis.client.get('total_questions_served') || 0;
        const rate = total > 0 ? current / total : 0;
        
        await this.redis.client.set(key, rate, 'EX', 86400);
    }
    
    /**
     * Get test analytics
     */
    async getTestAnalytics(sessionId) {
        const analytics = await this.mongodb.collection('adaptiveData').findOne({
            sessionId
        });
        
        return analytics;
    }
    
    /**
     * Close database connections
     */
    async close() {
        await this.pgPool.end();
        await this.mongoClient.close();
    }
}

module.exports = AdaptiveTestingEngine;