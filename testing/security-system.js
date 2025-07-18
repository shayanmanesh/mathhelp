// Comprehensive Security and Anti-Cheating System
// Advanced security measures for Math Help Testing System

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const { redisManager } = require('../database/redis-config');

class SecuritySystem {
    constructor(config = {}) {
        this.config = {
            // JWT Configuration
            jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
            jwtExpiresIn: '24h',
            
            // Password Security
            saltRounds: 12,
            minPasswordLength: 8,
            requirePasswordComplexity: true,
            
            // Rate Limiting
            rateLimitWindow: 15 * 60 * 1000, // 15 minutes
            rateLimitAttempts: 5,
            
            // Anti-Cheating Parameters
            maxResponseTime: 600000, // 10 minutes
            minResponseTime: 1000, // 1 second
            suspiciousPatternThreshold: 0.8,
            ipChangeThreshold: 3,
            
            // Browser Security
            enableBrowserLockdown: true,
            allowedBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
            
            // Session Security
            sessionTimeout: 3600000, // 1 hour
            maxConcurrentSessions: 3,
            
            // Monitoring
            enableAuditLogging: true,
            suspiciousActivityThreshold: 10,
            
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
            
            // Initialize security tables
            await this.initializeSecurityTables();
            
            console.log('Security system initialized');
        } catch (error) {
            console.error('Security system initialization error:', error);
            throw error;
        }
    }
    
    async initializeSecurityTables() {
        // Create security audit table
        await this.pgPool.query(`
            CREATE TABLE IF NOT EXISTS security_audit (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id),
                event_type VARCHAR(50) NOT NULL,
                severity VARCHAR(20) NOT NULL,
                description TEXT,
                ip_address INET,
                user_agent TEXT,
                session_id VARCHAR(255),
                metadata JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create suspicious activities table
        await this.pgPool.query(`
            CREATE TABLE IF NOT EXISTS suspicious_activities (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id),
                activity_type VARCHAR(50) NOT NULL,
                risk_score DECIMAL(3,2) DEFAULT 0.0,
                details JSONB,
                resolved BOOLEAN DEFAULT FALSE,
                resolved_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create security violations table
        await this.pgPool.query(`
            CREATE TABLE IF NOT EXISTS security_violations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id),
                violation_type VARCHAR(50) NOT NULL,
                violation_count INTEGER DEFAULT 1,
                penalty_applied VARCHAR(50),
                expires_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
    
    // ============================================
    // AUTHENTICATION SECURITY
    // ============================================
    
    /**
     * Hash password with bcrypt
     */
    async hashPassword(password) {
        if (!this.validatePassword(password)) {
            throw new Error('Password does not meet security requirements');
        }
        
        return await bcrypt.hash(password, this.config.saltRounds);
    }
    
    /**
     * Verify password
     */
    async verifyPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
    
    /**
     * Validate password complexity
     */
    validatePassword(password) {
        if (password.length < this.config.minPasswordLength) {
            return false;
        }
        
        if (this.config.requirePasswordComplexity) {
            const hasUppercase = /[A-Z]/.test(password);
            const hasLowercase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            
            return hasUppercase && hasLowercase && hasNumbers && hasSpecialChar;
        }
        
        return true;
    }
    
    /**
     * Generate JWT token
     */
    generateToken(userId, sessionId, additional = {}) {
        const payload = {
            userId,
            sessionId,
            iat: Math.floor(Date.now() / 1000),
            ...additional
        };
        
        return jwt.sign(payload, this.config.jwtSecret, {
            expiresIn: this.config.jwtExpiresIn
        });
    }
    
    /**
     * Verify JWT token
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, this.config.jwtSecret);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
    
    /**
     * Create secure session
     */
    async createSession(userId, deviceInfo, ipAddress, userAgent) {
        const sessionId = crypto.randomUUID();
        const sessionData = {
            userId,
            sessionId,
            deviceInfo,
            ipAddress,
            userAgent,
            createdAt: new Date(),
            lastActivity: new Date(),
            isActive: true
        };
        
        // Store session in Redis
        await this.redis.client.setex(
            `session:${sessionId}`,
            this.config.sessionTimeout / 1000,
            JSON.stringify(sessionData)
        );
        
        // Check for concurrent sessions
        await this.enforceSessionLimits(userId, sessionId);
        
        // Log security event
        await this.logSecurityEvent(userId, 'session_created', 'info', 'New session created', {
            sessionId,
            ipAddress,
            userAgent
        });
        
        return sessionData;
    }
    
    /**
     * Validate session
     */
    async validateSession(sessionId) {
        const sessionData = await this.redis.client.get(`session:${sessionId}`);
        
        if (!sessionData) {
            throw new Error('Session not found or expired');
        }
        
        const session = JSON.parse(sessionData);
        
        // Check if session is still active
        if (!session.isActive) {
            throw new Error('Session is not active');
        }
        
        // Update last activity
        session.lastActivity = new Date();
        await this.redis.client.setex(
            `session:${sessionId}`,
            this.config.sessionTimeout / 1000,
            JSON.stringify(session)
        );
        
        return session;
    }
    
    /**
     * Enforce session limits
     */
    async enforceSessionLimits(userId, newSessionId) {
        const pattern = `session:*`;
        const allSessions = await this.redis.client.keys(pattern);
        
        const userSessions = [];
        for (const sessionKey of allSessions) {
            const sessionData = await this.redis.client.get(sessionKey);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (session.userId === userId && session.isActive) {
                    userSessions.push({ key: sessionKey, session });
                }
            }
        }
        
        // If user has too many sessions, terminate oldest ones
        if (userSessions.length >= this.config.maxConcurrentSessions) {
            userSessions.sort((a, b) => new Date(a.session.lastActivity) - new Date(b.session.lastActivity));
            
            const sessionsToTerminate = userSessions.slice(0, userSessions.length - this.config.maxConcurrentSessions + 1);
            
            for (const sessionInfo of sessionsToTerminate) {
                await this.terminateSession(sessionInfo.session.sessionId);
            }
        }
    }
    
    /**
     * Terminate session
     */
    async terminateSession(sessionId) {
        const sessionData = await this.redis.client.get(`session:${sessionId}`);
        
        if (sessionData) {
            const session = JSON.parse(sessionData);
            session.isActive = false;
            session.terminatedAt = new Date();
            
            await this.redis.client.setex(
                `session:${sessionId}`,
                300, // Keep for 5 minutes for audit
                JSON.stringify(session)
            );
            
            await this.logSecurityEvent(session.userId, 'session_terminated', 'info', 'Session terminated', {
                sessionId
            });
        }
    }
    
    // ============================================
    // ANTI-CHEATING MEASURES
    // ============================================
    
    /**
     * Analyze user behavior for cheating patterns
     */
    async analyzeUserBehavior(userId, sessionId, behaviorData) {
        const analysis = {
            userId,
            sessionId,
            timestamp: new Date(),
            riskScore: 0,
            flags: [],
            evidence: []
        };
        
        // Check response time patterns
        const responseTimeRisk = await this.analyzeResponseTimes(userId, behaviorData.responseTimes);
        analysis.riskScore += responseTimeRisk.score;
        if (responseTimeRisk.flags.length > 0) {
            analysis.flags.push(...responseTimeRisk.flags);
            analysis.evidence.push(...responseTimeRisk.evidence);
        }
        
        // Check accuracy patterns
        const accuracyRisk = await this.analyzeAccuracyPatterns(userId, behaviorData.accuracyData);
        analysis.riskScore += accuracyRisk.score;
        if (accuracyRisk.flags.length > 0) {
            analysis.flags.push(...accuracyRisk.flags);
            analysis.evidence.push(...accuracyRisk.evidence);
        }
        
        // Check browser/device consistency
        const deviceRisk = await this.analyzeDeviceConsistency(userId, behaviorData.deviceData);
        analysis.riskScore += deviceRisk.score;
        if (deviceRisk.flags.length > 0) {
            analysis.flags.push(...deviceRisk.flags);
            analysis.evidence.push(...deviceRisk.evidence);
        }
        
        // Check IP address patterns
        const ipRisk = await this.analyzeIpPatterns(userId, behaviorData.ipAddress);
        analysis.riskScore += ipRisk.score;
        if (ipRisk.flags.length > 0) {
            analysis.flags.push(...ipRisk.flags);
            analysis.evidence.push(...ipRisk.evidence);
        }
        
        // Check keystroke patterns (if available)
        if (behaviorData.keystrokeData) {
            const keystrokeRisk = await this.analyzeKeystrokePatterns(userId, behaviorData.keystrokeData);
            analysis.riskScore += keystrokeRisk.score;
            if (keystrokeRisk.flags.length > 0) {
                analysis.flags.push(...keystrokeRisk.flags);
                analysis.evidence.push(...keystrokeRisk.evidence);
            }
        }
        
        // Store analysis results
        await this.storeBehaviorAnalysis(analysis);
        
        // Take action if risk score is high
        if (analysis.riskScore >= this.config.suspiciousPatternThreshold) {
            await this.handleSuspiciousActivity(userId, analysis);
        }
        
        return analysis;
    }
    
    /**
     * Analyze response time patterns
     */
    async analyzeResponseTimes(userId, responseTimes) {
        const analysis = { score: 0, flags: [], evidence: [] };
        
        if (!responseTimes || responseTimes.length === 0) {
            return analysis;
        }
        
        // Check for unreasonably fast responses
        const fastResponses = responseTimes.filter(time => time < this.config.minResponseTime);
        if (fastResponses.length > responseTimes.length * 0.3) {
            analysis.score += 0.4;
            analysis.flags.push('fast_responses');
            analysis.evidence.push(`${fastResponses.length} responses faster than ${this.config.minResponseTime}ms`);
        }
        
        // Check for consistent response times (possible automation)
        const variance = this.calculateVariance(responseTimes);
        const mean = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        const coefficientOfVariation = Math.sqrt(variance) / mean;
        
        if (coefficientOfVariation < 0.1) {
            analysis.score += 0.3;
            analysis.flags.push('consistent_timing');
            analysis.evidence.push(`Low variation in response times (CV: ${coefficientOfVariation.toFixed(3)})`);
        }
        
        // Check for timing patterns that suggest external help
        const suspiciousPatterns = this.detectTimingPatterns(responseTimes);
        if (suspiciousPatterns.length > 0) {
            analysis.score += 0.2;
            analysis.flags.push('timing_patterns');
            analysis.evidence.push(`Suspicious timing patterns detected: ${suspiciousPatterns.join(', ')}`);
        }
        
        return analysis;
    }
    
    /**
     * Analyze accuracy patterns
     */
    async analyzeAccuracyPatterns(userId, accuracyData) {
        const analysis = { score: 0, flags: [], evidence: [] };
        
        if (!accuracyData || accuracyData.length === 0) {
            return analysis;
        }
        
        // Check for sudden accuracy improvements
        const accuracyTrend = this.calculateAccuracyTrend(accuracyData);
        if (accuracyTrend.suddenImprovement > 0.4) {
            analysis.score += 0.3;
            analysis.flags.push('sudden_improvement');
            analysis.evidence.push(`Sudden accuracy improvement of ${(accuracyTrend.suddenImprovement * 100).toFixed(1)}%`);
        }
        
        // Check for perfect accuracy on difficult questions
        const difficultQuestions = accuracyData.filter(item => item.difficulty > 0.5);
        const perfectDifficultAccuracy = difficultQuestions.every(item => item.isCorrect);
        
        if (perfectDifficultAccuracy && difficultQuestions.length > 5) {
            analysis.score += 0.4;
            analysis.flags.push('perfect_difficult_accuracy');
            analysis.evidence.push(`Perfect accuracy on ${difficultQuestions.length} difficult questions`);
        }
        
        return analysis;
    }
    
    /**
     * Analyze device consistency
     */
    async analyzeDeviceConsistency(userId, deviceData) {
        const analysis = { score: 0, flags: [], evidence: [] };
        
        // Get historical device data
        const historicalData = await this.getUserDeviceHistory(userId);
        
        // Check for device switching during test
        if (deviceData.deviceSwitches && deviceData.deviceSwitches > 0) {
            analysis.score += 0.3;
            analysis.flags.push('device_switching');
            analysis.evidence.push(`Device switched ${deviceData.deviceSwitches} times during test`);
        }
        
        // Check for suspicious browser features
        if (deviceData.browserFeatures) {
            const suspiciousFeatures = this.detectSuspiciousBrowserFeatures(deviceData.browserFeatures);
            if (suspiciousFeatures.length > 0) {
                analysis.score += 0.2;
                analysis.flags.push('suspicious_browser_features');
                analysis.evidence.push(`Suspicious browser features: ${suspiciousFeatures.join(', ')}`);
            }
        }
        
        return analysis;
    }
    
    /**
     * Analyze IP address patterns
     */
    async analyzeIpPatterns(userId, ipAddress) {
        const analysis = { score: 0, flags: [], evidence: [] };
        
        // Get IP address history
        const ipHistory = await this.getUserIpHistory(userId);
        
        // Check for VPN/proxy usage
        if (await this.isVpnOrProxy(ipAddress)) {
            analysis.score += 0.2;
            analysis.flags.push('vpn_proxy_usage');
            analysis.evidence.push(`IP address ${ipAddress} appears to be a VPN/proxy`);
        }
        
        // Check for frequent IP changes
        const uniqueIps = new Set(ipHistory.map(entry => entry.ip));
        if (uniqueIps.size > this.config.ipChangeThreshold) {
            analysis.score += 0.3;
            analysis.flags.push('frequent_ip_changes');
            analysis.evidence.push(`${uniqueIps.size} different IP addresses used recently`);
        }
        
        return analysis;
    }
    
    /**
     * Analyze keystroke patterns
     */
    async analyzeKeystrokePatterns(userId, keystrokeData) {
        const analysis = { score: 0, flags: [], evidence: [] };
        
        // Check for robotic keystroke patterns
        if (keystrokeData.dwellTimes && keystrokeData.flightTimes) {
            const roboticScore = this.calculateRoboticScore(keystrokeData.dwellTimes, keystrokeData.flightTimes);
            if (roboticScore > 0.7) {
                analysis.score += 0.4;
                analysis.flags.push('robotic_keystrokes');
                analysis.evidence.push(`Robotic keystroke pattern detected (score: ${roboticScore.toFixed(3)})`);
            }
        }
        
        // Check for copy-paste patterns
        if (keystrokeData.copyPasteEvents && keystrokeData.copyPasteEvents > 0) {
            analysis.score += 0.2;
            analysis.flags.push('copy_paste_usage');
            analysis.evidence.push(`${keystrokeData.copyPasteEvents} copy-paste events detected`);
        }
        
        return analysis;
    }
    
    /**
     * Handle suspicious activity
     */
    async handleSuspiciousActivity(userId, analysis) {
        // Store suspicious activity
        await this.pgPool.query(`
            INSERT INTO suspicious_activities (user_id, activity_type, risk_score, details)
            VALUES ($1, $2, $3, $4)
        `, [userId, 'behavior_analysis', analysis.riskScore, JSON.stringify(analysis)]);
        
        // Log security event
        await this.logSecurityEvent(userId, 'suspicious_activity', 'warning', 'Suspicious behavior detected', {
            riskScore: analysis.riskScore,
            flags: analysis.flags,
            evidence: analysis.evidence
        });
        
        // Take appropriate action based on risk score
        if (analysis.riskScore >= 0.9) {
            await this.applySecurityMeasure(userId, 'account_suspension', 'High risk behavior detected');
        } else if (analysis.riskScore >= 0.7) {
            await this.applySecurityMeasure(userId, 'additional_verification', 'Suspicious behavior detected');
        } else if (analysis.riskScore >= 0.5) {
            await this.applySecurityMeasure(userId, 'warning', 'Potentially suspicious behavior detected');
        }
    }
    
    /**
     * Apply security measure
     */
    async applySecurityMeasure(userId, measureType, reason) {
        const expiresAt = new Date();
        let penaltyDuration = 0;
        
        switch (measureType) {
            case 'account_suspension':
                penaltyDuration = 24 * 60 * 60 * 1000; // 24 hours
                break;
            case 'additional_verification':
                penaltyDuration = 60 * 60 * 1000; // 1 hour
                break;
            case 'warning':
                penaltyDuration = 0; // No expiration for warnings
                break;
        }
        
        if (penaltyDuration > 0) {
            expiresAt.setTime(expiresAt.getTime() + penaltyDuration);
        }
        
        await this.pgPool.query(`
            INSERT INTO security_violations (user_id, violation_type, penalty_applied, expires_at)
            VALUES ($1, $2, $3, $4)
        `, [userId, 'suspicious_behavior', measureType, penaltyDuration > 0 ? expiresAt : null]);
        
        // Terminate active sessions if suspended
        if (measureType === 'account_suspension') {
            await this.terminateAllUserSessions(userId);
        }
        
        await this.logSecurityEvent(userId, 'security_measure_applied', 'warning', reason, {
            measureType,
            expiresAt: penaltyDuration > 0 ? expiresAt : null
        });
    }
    
    // ============================================
    // BROWSER SECURITY
    // ============================================
    
    /**
     * Validate browser security
     */
    async validateBrowserSecurity(userAgent, browserFingerprint) {
        const security = { isSecure: true, violations: [], warnings: [] };
        
        // Check browser type
        const browserInfo = this.parseBrowserInfo(userAgent);
        if (!this.config.allowedBrowsers.includes(browserInfo.name)) {
            security.violations.push('unsupported_browser');
            security.isSecure = false;
        }
        
        // Check for automation tools
        if (this.detectAutomationTools(userAgent, browserFingerprint)) {
            security.violations.push('automation_detected');
            security.isSecure = false;
        }
        
        // Check for developer tools
        if (browserFingerprint.devToolsOpen) {
            security.warnings.push('developer_tools_detected');
        }
        
        // Check for screen sharing
        if (browserFingerprint.screenSharing) {
            security.violations.push('screen_sharing_detected');
            security.isSecure = false;
        }
        
        return security;
    }
    
    /**
     * Detect automation tools
     */
    detectAutomationTools(userAgent, browserFingerprint) {
        const automationIndicators = [
            'selenium',
            'phantomjs',
            'chromedriver',
            'webdriver',
            'puppeteer',
            'playwright'
        ];
        
        const userAgentLower = userAgent.toLowerCase();
        
        // Check user agent
        if (automationIndicators.some(indicator => userAgentLower.includes(indicator))) {
            return true;
        }
        
        // Check browser fingerprint
        if (browserFingerprint) {
            if (browserFingerprint.webdriver === true) return true;
            if (browserFingerprint.plugins && browserFingerprint.plugins.length === 0) return true;
            if (browserFingerprint.languages && browserFingerprint.languages.length === 0) return true;
        }
        
        return false;
    }
    
    /**
     * Parse browser information
     */
    parseBrowserInfo(userAgent) {
        const browsers = {
            'Chrome': /Chrome\/(\d+)/,
            'Firefox': /Firefox\/(\d+)/,
            'Safari': /Version\/(\d+).*Safari/,
            'Edge': /Edg\/(\d+)/
        };
        
        for (const [name, regex] of Object.entries(browsers)) {
            const match = userAgent.match(regex);
            if (match) {
                return {
                    name,
                    version: match[1]
                };
            }
        }
        
        return { name: 'Unknown', version: '0' };
    }
    
    // ============================================
    // MONITORING AND AUDIT
    // ============================================
    
    /**
     * Log security event
     */
    async logSecurityEvent(userId, eventType, severity, description, metadata = {}) {
        if (!this.config.enableAuditLogging) return;
        
        await this.pgPool.query(`
            INSERT INTO security_audit (user_id, event_type, severity, description, metadata)
            VALUES ($1, $2, $3, $4, $5)
        `, [userId, eventType, severity, description, JSON.stringify(metadata)]);
        
        // Also store in MongoDB for analytics
        await this.mongodb.collection('securityLogs').insertOne({
            userId,
            eventType,
            severity,
            description,
            metadata,
            timestamp: new Date()
        });
    }
    
    /**
     * Monitor security metrics
     */
    async monitorSecurityMetrics() {
        const metrics = {
            suspiciousActivities: 0,
            securityViolations: 0,
            activeThreats: 0,
            alertLevel: 'normal'
        };
        
        // Count recent suspicious activities
        const suspiciousCount = await this.pgPool.query(`
            SELECT COUNT(*) as count
            FROM suspicious_activities
            WHERE created_at > NOW() - INTERVAL '1 hour'
            AND NOT resolved
        `);
        
        metrics.suspiciousActivities = parseInt(suspiciousCount.rows[0].count);
        
        // Count security violations
        const violationCount = await this.pgPool.query(`
            SELECT COUNT(*) as count
            FROM security_violations
            WHERE created_at > NOW() - INTERVAL '1 hour'
        `);
        
        metrics.securityViolations = parseInt(violationCount.rows[0].count);
        
        // Determine alert level
        if (metrics.suspiciousActivities > this.config.suspiciousActivityThreshold) {
            metrics.alertLevel = 'high';
        } else if (metrics.suspiciousActivities > this.config.suspiciousActivityThreshold / 2) {
            metrics.alertLevel = 'medium';
        }
        
        // Store metrics in Redis
        await this.redis.client.setex('security_metrics', 300, JSON.stringify(metrics));
        
        return metrics;
    }
    
    /**
     * Generate security report
     */
    async generateSecurityReport(timeframe = '24h') {
        const report = {
            timeframe,
            generatedAt: new Date(),
            summary: {},
            topThreats: [],
            recommendations: []
        };
        
        // Get summary statistics
        const summaryQuery = await this.pgPool.query(`
            SELECT 
                COUNT(*) as total_events,
                COUNT(DISTINCT user_id) as affected_users,
                COUNT(*) FILTER (WHERE severity = 'critical') as critical_events,
                COUNT(*) FILTER (WHERE severity = 'warning') as warning_events,
                COUNT(*) FILTER (WHERE severity = 'info') as info_events
            FROM security_audit
            WHERE created_at > NOW() - INTERVAL '${timeframe}'
        `);
        
        report.summary = summaryQuery.rows[0];
        
        // Get top threats
        const threatsQuery = await this.pgPool.query(`
            SELECT 
                event_type,
                COUNT(*) as count,
                COUNT(DISTINCT user_id) as unique_users
            FROM security_audit
            WHERE created_at > NOW() - INTERVAL '${timeframe}'
            AND severity IN ('critical', 'warning')
            GROUP BY event_type
            ORDER BY count DESC
            LIMIT 10
        `);
        
        report.topThreats = threatsQuery.rows;
        
        // Generate recommendations
        report.recommendations = this.generateSecurityRecommendations(report.summary, report.topThreats);
        
        return report;
    }
    
    /**
     * Generate security recommendations
     */
    generateSecurityRecommendations(summary, threats) {
        const recommendations = [];
        
        if (summary.critical_events > 0) {
            recommendations.push({
                priority: 'high',
                type: 'immediate_action',
                description: `${summary.critical_events} critical security events require immediate attention`
            });
        }
        
        if (summary.affected_users > 50) {
            recommendations.push({
                priority: 'medium',
                type: 'monitoring',
                description: `${summary.affected_users} users affected by security events - consider enhanced monitoring`
            });
        }
        
        threats.forEach(threat => {
            if (threat.count > 10) {
                recommendations.push({
                    priority: 'medium',
                    type: 'pattern_analysis',
                    description: `High frequency of ${threat.event_type} events (${threat.count} occurrences) - investigate patterns`
                });
            }
        });
        
        return recommendations;
    }
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
    /**
     * Calculate variance
     */
    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }
    
    /**
     * Detect timing patterns
     */
    detectTimingPatterns(responseTimes) {
        const patterns = [];
        
        // Check for regular intervals
        const intervals = [];
        for (let i = 1; i < responseTimes.length; i++) {
            intervals.push(responseTimes[i] - responseTimes[i - 1]);
        }
        
        const intervalVariance = this.calculateVariance(intervals);
        if (intervalVariance < 1000) { // Less than 1 second variance
            patterns.push('regular_intervals');
        }
        
        return patterns;
    }
    
    /**
     * Calculate accuracy trend
     */
    calculateAccuracyTrend(accuracyData) {
        const windowSize = 5;
        let maxImprovement = 0;
        
        for (let i = windowSize; i < accuracyData.length; i++) {
            const recentAccuracy = accuracyData.slice(i - windowSize, i).filter(item => item.isCorrect).length / windowSize;
            const previousAccuracy = accuracyData.slice(i - windowSize * 2, i - windowSize).filter(item => item.isCorrect).length / windowSize;
            
            const improvement = recentAccuracy - previousAccuracy;
            maxImprovement = Math.max(maxImprovement, improvement);
        }
        
        return { suddenImprovement: maxImprovement };
    }
    
    /**
     * Calculate robotic score for keystrokes
     */
    calculateRoboticScore(dwellTimes, flightTimes) {
        const dwellVariance = this.calculateVariance(dwellTimes);
        const flightVariance = this.calculateVariance(flightTimes);
        
        // Low variance indicates robotic behavior
        const dwellScore = Math.max(0, 1 - dwellVariance / 1000);
        const flightScore = Math.max(0, 1 - flightVariance / 1000);
        
        return (dwellScore + flightScore) / 2;
    }
    
    /**
     * Detect suspicious browser features
     */
    detectSuspiciousBrowserFeatures(features) {
        const suspicious = [];
        
        if (features.webdriver) suspicious.push('webdriver');
        if (features.headless) suspicious.push('headless');
        if (features.automationExtension) suspicious.push('automation_extension');
        if (features.plugins && features.plugins.length === 0) suspicious.push('no_plugins');
        
        return suspicious;
    }
    
    /**
     * Check if IP is VPN or proxy
     */
    async isVpnOrProxy(ipAddress) {
        // This would integrate with a VPN/proxy detection service
        // For now, return false as a placeholder
        return false;
    }
    
    /**
     * Get user device history
     */
    async getUserDeviceHistory(userId, days = 30) {
        const result = await this.pgPool.query(`
            SELECT DISTINCT metadata->>'deviceInfo' as device_info, created_at
            FROM security_audit
            WHERE user_id = $1
            AND created_at > NOW() - INTERVAL '${days} days'
            AND metadata->>'deviceInfo' IS NOT NULL
            ORDER BY created_at DESC
        `, [userId]);
        
        return result.rows;
    }
    
    /**
     * Get user IP history
     */
    async getUserIpHistory(userId, days = 30) {
        const result = await this.pgPool.query(`
            SELECT DISTINCT ip_address as ip, created_at
            FROM security_audit
            WHERE user_id = $1
            AND created_at > NOW() - INTERVAL '${days} days'
            AND ip_address IS NOT NULL
            ORDER BY created_at DESC
        `, [userId]);
        
        return result.rows;
    }
    
    /**
     * Store behavior analysis
     */
    async storeBehaviorAnalysis(analysis) {
        await this.mongodb.collection('behaviorAnalysis').insertOne(analysis);
    }
    
    /**
     * Terminate all user sessions
     */
    async terminateAllUserSessions(userId) {
        const pattern = `session:*`;
        const allSessions = await this.redis.client.keys(pattern);
        
        for (const sessionKey of allSessions) {
            const sessionData = await this.redis.client.get(sessionKey);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (session.userId === userId) {
                    await this.terminateSession(session.sessionId);
                }
            }
        }
    }
    
    /**
     * Get security status for user
     */
    async getSecurityStatus(userId) {
        const violations = await this.pgPool.query(`
            SELECT * FROM security_violations
            WHERE user_id = $1
            AND (expires_at IS NULL OR expires_at > NOW())
            ORDER BY created_at DESC
        `, [userId]);
        
        const suspiciousActivities = await this.pgPool.query(`
            SELECT COUNT(*) as count
            FROM suspicious_activities
            WHERE user_id = $1
            AND created_at > NOW() - INTERVAL '24 hours'
            AND NOT resolved
        `, [userId]);
        
        return {
            violations: violations.rows,
            suspiciousActivityCount: parseInt(suspiciousActivities.rows[0].count),
            status: violations.rows.length > 0 ? 'restricted' : 'normal'
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

module.exports = SecuritySystem;