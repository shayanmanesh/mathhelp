# Math Help Testing System Documentation

## Overview

The Math Help Testing System is a comprehensive educational platform designed to provide adaptive mathematical assessments, personalized learning experiences, and detailed performance analytics. The system leverages Item Response Theory (IRT) for adaptive testing, gamification for engagement, and advanced analytics for insights.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Testing Framework](#testing-framework)
6. [Deployment Guide](#deployment-guide)
7. [Performance Optimization](#performance-optimization)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

## Architecture Overview

The system follows a microservices architecture with the following key components:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Applications                     │
├─────────────────────────────────────────────────────────────┤
│                    API Gateway/Load Balancer                │
├─────────────────────────────────────────────────────────────┤
│  Adaptive Testing │  Gamification  │  Analytics  │  Security │
│     Engine        │     System     │  Dashboard  │  System   │
├─────────────────────────────────────────────────────────────┤
│              Data Layer (PostgreSQL, MongoDB, Redis)        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Backend**: Node.js with Express.js
- **Databases**: 
  - PostgreSQL (relational data)
  - MongoDB (analytics and flexible documents)
  - Redis (caching and real-time data)
- **Testing**: Jest with comprehensive test coverage
- **Security**: JWT authentication, bcrypt hashing, rate limiting
- **Performance**: Connection pooling, caching, async processing

## Core Components

### 1. Adaptive Testing Engine

The core component that implements Item Response Theory (IRT) for personalized question selection and ability estimation.

#### Key Features:
- **3-Parameter Logistic (3PL) Model**: Accounts for difficulty, discrimination, and guessing
- **Maximum Likelihood Estimation (MLE)**: For ability estimation
- **Adaptive Question Selection**: Using maximum information principle
- **Stopping Rules**: Based on standard error, confidence intervals, and maximum questions

#### Usage Example:
```javascript
const testEngine = new AdaptiveTestingEngine();

// Start adaptive test
const testSession = await testEngine.startAdaptiveTest(userId, {
    testType: 'practice',
    subjectId: 'algebra',
    maxQuestions: 20,
    timeLimit: 1800
});

// Get next question
const questionData = await testEngine.getNextQuestion(testSession.sessionId);

// Submit answer
const result = await testEngine.submitAnswer(
    testSession.sessionId,
    questionData.question.id,
    userResponse,
    { responseTime: 25.5 }
);
```

### 2. Question Type System

Supports multiple question formats with LaTeX rendering and sophisticated evaluation.

#### Supported Question Types:
- **Multiple Choice**: Single or multiple selection
- **Short Answer**: Text, numeric, or algebraic expressions
- **True/False**: Binary choice questions
- **Equation Editor**: Mathematical expression input
- **Drag & Drop**: Interactive element placement
- **Graph Plot**: Coordinate plotting
- **Step-by-Step**: Multi-step problem solving

#### Example Implementation:
```javascript
const questionManager = new QuestionTypeManager();

// Create multiple choice question
const mcQuestion = questionManager.createQuestion('multiple_choice', {
    stem: 'What is the derivative of $x^2$?',
    options: [
        { id: 'a', text: '$x$', isCorrect: false },
        { id: 'b', text: '$2x$', isCorrect: true },
        { id: 'c', text: '$x^2$', isCorrect: false },
        { id: 'd', text: '$2x^2$', isCorrect: false }
    ]
});

// Evaluate response
const result = mcQuestion.evaluate({ selectedOption: 'b' });
```

### 3. Gamification System

Comprehensive engagement system with points, achievements, streaks, and social features.

#### Features:
- **Point System**: Dynamic scoring based on difficulty and streaks
- **Achievement System**: 50+ achievements across multiple categories
- **Leaderboards**: Global, grade-level, and friend-based rankings
- **Streak Tracking**: Daily activity streaks with bonus multipliers
- **Social Features**: Friends, challenges, and collaborative learning

#### Achievement Categories:
- **Milestone**: Progress-based achievements
- **Streak**: Consistency-based achievements
- **Accuracy**: Performance-based achievements
- **Speed**: Efficiency-based achievements
- **Mastery**: Subject/skill completion achievements
- **Social**: Collaboration and helping achievements

### 4. Security System

Multi-layered security with authentication, session management, and anti-cheating measures.

#### Security Features:
- **JWT Authentication**: Secure token-based authentication
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Secure session handling with expiration
- **Rate Limiting**: Protection against abuse
- **Anti-Cheating**: Behavioral analysis and anomaly detection
- **Browser Security**: Automation detection and lockdown features

#### Anti-Cheating Measures:
- **Response Time Analysis**: Detects unusually fast/consistent responses
- **Accuracy Pattern Detection**: Identifies suspicious improvement patterns
- **Device Consistency**: Monitors device switching during tests
- **IP Address Tracking**: Flags VPN/proxy usage and frequent changes
- **Keystroke Analysis**: Detects robotic typing patterns
- **Browser Fingerprinting**: Identifies automation tools

### 5. Analytics Dashboard

Real-time monitoring and comprehensive analytics for users and system performance.

#### Analytics Features:
- **Real-Time Metrics**: Live system monitoring
- **User Performance**: Individual progress tracking
- **Content Analytics**: Question and skill performance
- **System Health**: Database, cache, and service monitoring
- **Alert System**: Automated notifications for issues
- **Reporting**: Daily, weekly, and monthly performance reports

#### Key Metrics:
- **Engagement**: Active users, session duration, completion rates
- **Performance**: Response times, accuracy rates, skill mastery
- **System**: Load, error rates, uptime, resource usage
- **Educational**: Learning progress, curriculum coverage, difficulty optimization

### 6. Performance Tracker

Advanced tracking system for skill mastery, ability estimation, and progress analytics.

#### Tracking Features:
- **Skill Mastery**: Comprehensive skill progression tracking
- **Ability Estimation**: IRT-based ability updates
- **Progress Milestones**: Achievement tracking and recommendations
- **Learning Analytics**: Detailed performance insights
- **Retention Tracking**: Long-term knowledge retention analysis

## Database Schema

### PostgreSQL Schema

The relational database stores structured data for users, questions, attempts, and core system entities.

#### Key Tables:
- **users**: User profiles and performance metrics
- **questions**: Question content and IRT parameters
- **skills**: Skill definitions and hierarchies
- **subjects**: Subject organization
- **user_attempts**: Individual question attempts
- **user_skills**: Skill mastery tracking
- **achievements**: Achievement definitions
- **user_achievements**: User achievement progress
- **test_sessions**: Test session management

#### Example Schema:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    grade_level INTEGER,
    total_points INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    ability_estimate DECIMAL(5,3) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    skill_id UUID REFERENCES skills(id),
    question_type_id UUID REFERENCES question_types(id),
    difficulty_parameter DECIMAL(5,3) DEFAULT 0.0,
    discrimination_parameter DECIMAL(5,3) DEFAULT 1.0,
    guessing_parameter DECIMAL(5,3) DEFAULT 0.0,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### MongoDB Collections

Document-based storage for flexible data structures and analytics.

#### Key Collections:
- **behaviorAnalysis**: User behavior patterns
- **performanceAnalytics**: Detailed performance metrics
- **realTimeMetrics**: Live system metrics
- **gamificationData**: Gamification events and rewards
- **securityLogs**: Security events and audit trails

### Redis Data Structures

High-performance caching and real-time data storage.

#### Key Structures:
- **Leaderboards**: Sorted sets for rankings
- **Session Data**: Hash maps for user sessions
- **Cache**: Temporary data storage
- **Real-Time Metrics**: Time-series data
- **Rate Limiting**: Request counters

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "securePassword123"
}
```

**Response:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "expiresIn": 3600
}
```

#### POST /api/auth/register
Create new user account.

**Request Body:**
```json
{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securePassword123",
    "gradeLevel": 10
}
```

### Adaptive Testing Endpoints

#### POST /api/tests/adaptive/start
Start new adaptive test session.

**Request Body:**
```json
{
    "testType": "practice",
    "subjectId": "123e4567-e89b-12d3-a456-426614174000",
    "maxQuestions": 20,
    "timeLimit": 1800
}
```

**Response:**
```json
{
    "sessionId": "session-123",
    "initialAbility": 0.0,
    "testConfig": {
        "testType": "practice",
        "maxQuestions": 20,
        "timeLimit": 1800
    }
}
```

#### GET /api/tests/adaptive/:sessionId/next
Get next question in adaptive test.

**Response:**
```json
{
    "question": {
        "id": "q-123",
        "type": "multiple_choice",
        "stem": "What is the derivative of $x^2$?",
        "options": [
            { "id": "a", "text": "$x$" },
            { "id": "b", "text": "$2x$" },
            { "id": "c", "text": "$x^2$" },
            { "id": "d", "text": "$2x^2$" }
        ]
    },
    "questionNumber": 5,
    "totalQuestions": 20,
    "estimatedAbility": 0.75
}
```

#### POST /api/tests/adaptive/:sessionId/submit
Submit answer for current question.

**Request Body:**
```json
{
    "questionId": "q-123",
    "response": "b",
    "responseTime": 25.5,
    "hintsUsed": 1
}
```

**Response:**
```json
{
    "isCorrect": true,
    "score": 1.0,
    "feedback": "Correct! The derivative of x² is 2x.",
    "pointsAwarded": 15,
    "newAbility": 0.82
}
```

### Analytics Endpoints

#### GET /api/analytics/user/:userId
Get comprehensive user analytics.

**Response:**
```json
{
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "basicStats": {
        "totalAttempts": 150,
        "correctAttempts": 120,
        "accuracy": 0.80,
        "avgResponseTime": 28.5,
        "activeDays": 15
    },
    "skillProgress": [
        {
            "skillName": "Linear Equations",
            "masteryLevel": "mastered",
            "confidence": 0.92,
            "recentAttempts": 5,
            "recentAccuracy": 1.0
        }
    ],
    "recommendations": [
        {
            "type": "skill_focus",
            "priority": "high",
            "message": "Focus on quadratic equations",
            "suggestion": "Practice factoring and completing the square"
        }
    ]
}
```

## Testing Framework

### Test Structure

The testing framework uses Jest with comprehensive test coverage across all system components.

#### Test Categories:
1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Component interaction testing
3. **End-to-End Tests**: Full system workflow testing
4. **Performance Tests**: Load and benchmark testing
5. **Security Tests**: Vulnerability and penetration testing

#### Running Tests:
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testNamePattern="Adaptive Testing Engine"

# Run tests with coverage
npm test -- --coverage

# Run performance benchmarks
npm run test:performance
```

### Test Coverage Requirements

- **Unit Tests**: 90% code coverage minimum
- **Integration Tests**: All API endpoints covered
- **End-to-End Tests**: Critical user workflows
- **Performance Tests**: Response time and throughput benchmarks
- **Security Tests**: Authentication, authorization, and data protection

## Deployment Guide

### Environment Setup

#### Development Environment:
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start database services
docker-compose up -d

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

#### Production Environment:
```bash
# Build production assets
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start ecosystem.config.js
```

### Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mathhelp
DB_USER=mathhelp
DB_PASSWORD=secure_password

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mathhelp_testing

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Performance Configuration
CACHE_TTL=3600
BATCH_SIZE=100
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - mongodb
      - redis

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: mathhelp
      POSTGRES_USER: mathhelp
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongodb:
    image: mongo:5
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure_password
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass redis_password
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  mongodb_data:
  redis_data:
```

## Performance Optimization

### Database Optimization

#### PostgreSQL Optimization:
- **Indexing**: Strategic indexes on frequently queried columns
- **Connection Pooling**: Limited connection pool size
- **Query Optimization**: Efficient query patterns and joins
- **Materialized Views**: Pre-computed aggregations for analytics

#### MongoDB Optimization:
- **Indexing**: Compound indexes for complex queries
- **Aggregation Pipeline**: Efficient data processing
- **Sharding**: Horizontal scaling for large datasets
- **Caching**: Query result caching

#### Redis Optimization:
- **Memory Management**: Appropriate eviction policies
- **Data Structures**: Optimal data structure selection
- **Pipelining**: Batch operations for efficiency
- **Clustering**: Multi-node setup for scalability

### Application Performance

#### Caching Strategy:
- **Application-Level Caching**: In-memory caching for frequently accessed data
- **Database Query Caching**: Redis-based query result caching
- **Session Caching**: Redis-based session storage
- **CDN Integration**: Static asset caching

#### Async Processing:
- **Event-Driven Architecture**: Asynchronous event processing
- **Queue Systems**: Background job processing
- **Batch Processing**: Bulk operations for efficiency
- **Streaming**: Real-time data processing

### Monitoring and Profiling

#### Performance Metrics:
- **Response Time**: API endpoint response times
- **Throughput**: Requests per second
- **Error Rates**: Application and database errors
- **Resource Usage**: CPU, memory, and disk usage

#### Monitoring Tools:
- **Application Monitoring**: New Relic, DataDog, or similar
- **Database Monitoring**: Built-in PostgreSQL/MongoDB monitoring
- **Infrastructure Monitoring**: Server and container metrics
- **Log Aggregation**: Centralized logging with ELK stack

## Security Considerations

### Authentication and Authorization

#### JWT Security:
- **Secret Management**: Secure JWT secret storage
- **Token Expiration**: Appropriate expiration times
- **Token Refresh**: Secure token refresh mechanism
- **Payload Validation**: Comprehensive token validation

#### Password Security:
- **Hashing**: bcrypt with appropriate salt rounds
- **Complexity Requirements**: Strong password policies
- **Breach Detection**: Monitoring for compromised credentials
- **Multi-Factor Authentication**: Optional 2FA support

### Data Protection

#### Encryption:
- **At Rest**: Database encryption for sensitive data
- **In Transit**: TLS/SSL for all communications
- **Key Management**: Secure encryption key storage
- **Data Masking**: Sensitive data protection in logs

#### Privacy:
- **Data Minimization**: Collect only necessary data
- **Consent Management**: User consent tracking
- **Right to Deletion**: Data deletion capabilities
- **Anonymization**: Personal data anonymization

### Security Monitoring

#### Threat Detection:
- **Anomaly Detection**: Behavioral analysis for threats
- **Intrusion Detection**: Network and application monitoring
- **Vulnerability Scanning**: Regular security assessments
- **Incident Response**: Documented response procedures

#### Compliance:
- **GDPR**: European data protection compliance
- **COPPA**: Children's privacy protection
- **FERPA**: Educational record protection
- **SOC 2**: Security and availability standards

## Troubleshooting

### Common Issues

#### Database Connection Issues:
```javascript
// Check connection pool status
console.log('Pool status:', pgPool.totalCount, pgPool.idleCount);

// Test database connectivity
try {
    await pgPool.query('SELECT 1');
    console.log('Database connected successfully');
} catch (error) {
    console.error('Database connection failed:', error);
}
```

#### Performance Issues:
```javascript
// Monitor query performance
const startTime = Date.now();
const result = await pgPool.query('SELECT * FROM users WHERE id = $1', [userId]);
const queryTime = Date.now() - startTime;

if (queryTime > 100) {
    console.warn(`Slow query detected: ${queryTime}ms`);
}
```

#### Memory Issues:
```javascript
// Monitor memory usage
const memoryUsage = process.memoryUsage();
console.log('Memory usage:', {
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
});
```

### Debugging Tools

#### Logging:
```javascript
// Structured logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Request logging middleware
app.use((req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        logger.info('Request completed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`
        });
    });
    
    next();
});
```

#### Error Handling:
```javascript
// Global error handler
app.use((error, req, res, next) => {
    logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method
    });
    
    res.status(500).json({
        error: 'Internal server error',
        requestId: req.id
    });
});

// Promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', {
        reason,
        promise
    });
});
```

### Health Checks

#### System Health Endpoint:
```javascript
app.get('/health', async (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {}
    };
    
    // Check database
    try {
        await pgPool.query('SELECT 1');
        health.services.database = 'healthy';
    } catch (error) {
        health.services.database = 'unhealthy';
        health.status = 'degraded';
    }
    
    // Check Redis
    try {
        await redisClient.ping();
        health.services.redis = 'healthy';
    } catch (error) {
        health.services.redis = 'unhealthy';
        health.status = 'degraded';
    }
    
    // Check MongoDB
    try {
        await mongodb.admin().ping();
        health.services.mongodb = 'healthy';
    } catch (error) {
        health.services.mongodb = 'unhealthy';
        health.status = 'degraded';
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
});
```

## Support and Maintenance

### Regular Maintenance Tasks

#### Daily:
- Monitor system health and performance
- Review error logs and alerts
- Check database and cache performance
- Validate backup integrity

#### Weekly:
- Update dependencies and security patches
- Review and optimize slow queries
- Analyze user feedback and issues
- Performance benchmarking

#### Monthly:
- Database maintenance and optimization
- Security audits and vulnerability assessments
- Capacity planning and scaling decisions
- User analytics and engagement review

### Support Resources

#### Documentation:
- API reference documentation
- User guides and tutorials
- System architecture diagrams
- Troubleshooting guides

#### Community:
- Developer forums and discussions
- GitHub issues and contributions
- Stack Overflow questions
- Educational webinars and workshops

---

*This documentation is maintained by the Math Help development team. For questions, issues, or contributions, please contact the development team or submit an issue on GitHub.*