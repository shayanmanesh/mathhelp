// MongoDB Schema and Collection Setup for Math Help Testing System
// Use this script to initialize MongoDB collections with proper indexes and validation

// Database: mathhelp_testing
use mathhelp_testing;

// ============================================
// QUESTION BANK COLLECTION
// ============================================

// Questions with rich content and multimedia support
db.createCollection("questionBank", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["id", "title", "type", "content", "difficulty", "subject", "skills"],
            properties: {
                id: {
                    bsonType: "string",
                    description: "Unique identifier matching PostgreSQL UUID"
                },
                title: {
                    bsonType: "string",
                    minLength: 1,
                    maxLength: 500,
                    description: "Question title"
                },
                type: {
                    bsonType: "string",
                    enum: ["multiple_choice", "short_answer", "true_false", "drag_drop", "graph_plot", "equation_editor", "interactive"],
                    description: "Question type"
                },
                content: {
                    bsonType: "object",
                    required: ["stem"],
                    properties: {
                        stem: {
                            bsonType: "string",
                            description: "Main question text with LaTeX support"
                        },
                        options: {
                            bsonType: "array",
                            items: {
                                bsonType: "object",
                                required: ["text", "isCorrect"],
                                properties: {
                                    text: { bsonType: "string" },
                                    isCorrect: { bsonType: "bool" },
                                    explanation: { bsonType: "string" },
                                    latex: { bsonType: "string" }
                                }
                            }
                        },
                        correctAnswer: {
                            bsonType: ["string", "number", "array"],
                            description: "Correct answer(s)"
                        },
                        tolerance: {
                            bsonType: "number",
                            minimum: 0,
                            description: "Numeric tolerance for answers"
                        },
                        units: {
                            bsonType: "string",
                            description: "Expected units for numeric answers"
                        }
                    }
                },
                solution: {
                    bsonType: "object",
                    properties: {
                        steps: {
                            bsonType: "array",
                            items: {
                                bsonType: "object",
                                required: ["step", "explanation"],
                                properties: {
                                    step: { bsonType: "string" },
                                    explanation: { bsonType: "string" },
                                    latex: { bsonType: "string" },
                                    imageUrl: { bsonType: "string" }
                                }
                            }
                        },
                        finalAnswer: { bsonType: "string" },
                        workingNotes: { bsonType: "string" }
                    }
                },
                hints: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["text", "level"],
                        properties: {
                            text: { bsonType: "string" },
                            level: { bsonType: "int", minimum: 1, maximum: 5 },
                            latex: { bsonType: "string" },
                            imageUrl: { bsonType: "string" }
                        }
                    }
                },
                difficulty: {
                    bsonType: "object",
                    required: ["level", "irtParameter"],
                    properties: {
                        level: { bsonType: "int", minimum: 1, maximum: 10 },
                        irtParameter: { bsonType: "double" },
                        discrimination: { bsonType: "double" },
                        guessing: { bsonType: "double" }
                    }
                },
                subject: {
                    bsonType: "string",
                    description: "Subject code from PostgreSQL"
                },
                skills: {
                    bsonType: "array",
                    items: { bsonType: "string" },
                    description: "Array of skill codes"
                },
                gradeLevel: {
                    bsonType: "object",
                    properties: {
                        min: { bsonType: "int", minimum: -2, maximum: 16 },
                        max: { bsonType: "int", minimum: -2, maximum: 16 }
                    }
                },
                media: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["type", "url"],
                        properties: {
                            type: { 
                                bsonType: "string",
                                enum: ["image", "video", "audio", "interactive", "graph", "diagram"]
                            },
                            url: { bsonType: "string" },
                            altText: { bsonType: "string" },
                            caption: { bsonType: "string" },
                            width: { bsonType: "int" },
                            height: { bsonType: "int" }
                        }
                    }
                },
                tags: {
                    bsonType: "array",
                    items: { bsonType: "string" }
                },
                standards: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["system", "code"],
                        properties: {
                            system: { 
                                bsonType: "string",
                                enum: ["CCSS", "TEKS", "NGSS", "IB", "AP"]
                            },
                            code: { bsonType: "string" },
                            description: { bsonType: "string" }
                        }
                    }
                },
                analytics: {
                    bsonType: "object",
                    properties: {
                        timesUsed: { bsonType: "int", minimum: 0 },
                        averageScore: { bsonType: "double", minimum: 0, maximum: 1 },
                        averageTimeSeconds: { bsonType: "int", minimum: 0 },
                        discriminationIndex: { bsonType: "double" },
                        difficultyIndex: { bsonType: "double" }
                    }
                },
                metadata: {
                    bsonType: "object",
                    properties: {
                        createdBy: { bsonType: "string" },
                        createdAt: { bsonType: "date" },
                        updatedAt: { bsonType: "date" },
                        version: { bsonType: "int", minimum: 1 },
                        status: { 
                            bsonType: "string",
                            enum: ["draft", "review", "published", "retired"]
                        },
                        language: { bsonType: "string" },
                        estimatedTime: { bsonType: "int", minimum: 0 }
                    }
                }
            }
        }
    }
});

// ============================================
// USER ANALYTICS COLLECTION
// ============================================

db.createCollection("userAnalytics", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["userId", "date", "metrics"],
            properties: {
                userId: {
                    bsonType: "string",
                    description: "User UUID from PostgreSQL"
                },
                date: {
                    bsonType: "date",
                    description: "Date of the analytics record"
                },
                metrics: {
                    bsonType: "object",
                    required: ["questionsAttempted", "questionsCorrect", "totalTime"],
                    properties: {
                        questionsAttempted: { bsonType: "int", minimum: 0 },
                        questionsCorrect: { bsonType: "int", minimum: 0 },
                        totalTime: { bsonType: "int", minimum: 0 },
                        averageScore: { bsonType: "double", minimum: 0, maximum: 1 },
                        abilityEstimate: { bsonType: "double" },
                        abilityStandardError: { bsonType: "double" },
                        streakDays: { bsonType: "int", minimum: 0 },
                        pointsEarned: { bsonType: "int", minimum: 0 }
                    }
                },
                skillMetrics: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["skillId", "attempted", "correct", "masteryLevel"],
                        properties: {
                            skillId: { bsonType: "string" },
                            attempted: { bsonType: "int", minimum: 0 },
                            correct: { bsonType: "int", minimum: 0 },
                            masteryLevel: { 
                                bsonType: "string",
                                enum: ["attempted", "familiar", "proficient", "mastered"]
                            },
                            timeSpent: { bsonType: "int", minimum: 0 },
                            lastAttempt: { bsonType: "date" }
                        }
                    }
                },
                subjectMetrics: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["subjectId", "attempted", "correct"],
                        properties: {
                            subjectId: { bsonType: "string" },
                            attempted: { bsonType: "int", minimum: 0 },
                            correct: { bsonType: "int", minimum: 0 },
                            averageScore: { bsonType: "double", minimum: 0, maximum: 1 },
                            timeSpent: { bsonType: "int", minimum: 0 }
                        }
                    }
                },
                sessionData: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["sessionId", "startTime", "endTime"],
                        properties: {
                            sessionId: { bsonType: "string" },
                            startTime: { bsonType: "date" },
                            endTime: { bsonType: "date" },
                            questionsAttempted: { bsonType: "int", minimum: 0 },
                            questionsCorrect: { bsonType: "int", minimum: 0 },
                            deviceType: { bsonType: "string" },
                            browserInfo: { bsonType: "string" }
                        }
                    }
                },
                learningPath: {
                    bsonType: "object",
                    properties: {
                        currentPath: { bsonType: "string" },
                        progress: { bsonType: "double", minimum: 0, maximum: 1 },
                        recommendedNext: {
                            bsonType: "array",
                            items: { bsonType: "string" }
                        },
                        strengthAreas: {
                            bsonType: "array",
                            items: { bsonType: "string" }
                        },
                        weaknessAreas: {
                            bsonType: "array",
                            items: { bsonType: "string" }
                        }
                    }
                }
            }
        }
    }
});

// ============================================
// ADAPTIVE DATA COLLECTION
// ============================================

db.createCollection("adaptiveData", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["userId", "sessionId", "responses"],
            properties: {
                userId: {
                    bsonType: "string",
                    description: "User UUID"
                },
                sessionId: {
                    bsonType: "string",
                    description: "Test session UUID"
                },
                testType: {
                    bsonType: "string",
                    enum: ["placement", "practice", "assessment", "quiz", "exam"]
                },
                responses: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["questionId", "response", "isCorrect", "timestamp"],
                        properties: {
                            questionId: { bsonType: "string" },
                            response: { bsonType: ["string", "number", "array", "object"] },
                            isCorrect: { bsonType: "bool" },
                            score: { bsonType: "double", minimum: 0, maximum: 1 },
                            timestamp: { bsonType: "date" },
                            responseTime: { bsonType: "int", minimum: 0 },
                            hintsUsed: { bsonType: "int", minimum: 0 },
                            attemptsCount: { bsonType: "int", minimum: 1 },
                            abilityBefore: { bsonType: "double" },
                            abilityAfter: { bsonType: "double" },
                            standardErrorBefore: { bsonType: "double" },
                            standardErrorAfter: { bsonType: "double" }
                        }
                    }
                },
                irtCalculations: {
                    bsonType: "object",
                    properties: {
                        initialAbility: { bsonType: "double" },
                        finalAbility: { bsonType: "double" },
                        initialSE: { bsonType: "double" },
                        finalSE: { bsonType: "double" },
                        iterations: { bsonType: "int", minimum: 0 },
                        convergence: { bsonType: "bool" },
                        algorithm: { bsonType: "string" },
                        parameters: { bsonType: "object" }
                    }
                },
                selectionStrategy: {
                    bsonType: "object",
                    properties: {
                        algorithm: { 
                            bsonType: "string",
                            enum: ["maximum_information", "owen", "random", "content_balanced"]
                        },
                        parameters: { bsonType: "object" },
                        contentConstraints: {
                            bsonType: "object",
                            properties: {
                                subjectDistribution: { bsonType: "object" },
                                skillBalance: { bsonType: "object" },
                                difficultyRange: { bsonType: "array" }
                            }
                        }
                    }
                },
                stoppingRules: {
                    bsonType: "object",
                    properties: {
                        maxQuestions: { bsonType: "int", minimum: 1 },
                        minQuestions: { bsonType: "int", minimum: 1 },
                        targetSE: { bsonType: "double", minimum: 0 },
                        timeLimit: { bsonType: "int", minimum: 0 },
                        confidenceLevel: { bsonType: "double", minimum: 0, maximum: 1 }
                    }
                },
                metadata: {
                    bsonType: "object",
                    properties: {
                        startTime: { bsonType: "date" },
                        endTime: { bsonType: "date" },
                        totalQuestions: { bsonType: "int", minimum: 0 },
                        questionsCorrect: { bsonType: "int", minimum: 0 },
                        averageResponseTime: { bsonType: "double", minimum: 0 },
                        deviceInfo: { bsonType: "object" },
                        browserInfo: { bsonType: "object" }
                    }
                }
            }
        }
    }
});

// ============================================
// LEARNING ANALYTICS COLLECTION
// ============================================

db.createCollection("learningAnalytics", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["userId", "timestamp", "eventType"],
            properties: {
                userId: { bsonType: "string" },
                timestamp: { bsonType: "date" },
                eventType: {
                    bsonType: "string",
                    enum: ["question_start", "question_submit", "hint_request", "solution_view", "video_play", "login", "logout", "achievement_earned"]
                },
                eventData: {
                    bsonType: "object",
                    properties: {
                        questionId: { bsonType: "string" },
                        sessionId: { bsonType: "string" },
                        response: { bsonType: ["string", "number", "array", "object"] },
                        score: { bsonType: "double" },
                        timeSpent: { bsonType: "int" },
                        hintsUsed: { bsonType: "int" },
                        difficulty: { bsonType: "double" },
                        subject: { bsonType: "string" },
                        skills: { bsonType: "array", items: { bsonType: "string" } }
                    }
                },
                context: {
                    bsonType: "object",
                    properties: {
                        deviceType: { bsonType: "string" },
                        browserInfo: { bsonType: "string" },
                        location: { bsonType: "string" },
                        referrer: { bsonType: "string" },
                        userAgent: { bsonType: "string" },
                        screenResolution: { bsonType: "string" },
                        timezone: { bsonType: "string" }
                    }
                },
                learningContext: {
                    bsonType: "object",
                    properties: {
                        studyMode: { 
                            bsonType: "string",
                            enum: ["practice", "homework", "test", "review", "exploration"]
                        },
                        goal: { bsonType: "string" },
                        timeAllotted: { bsonType: "int" },
                        collaborators: { bsonType: "array", items: { bsonType: "string" } },
                        resources: { bsonType: "array", items: { bsonType: "string" } }
                    }
                }
            }
        }
    }
});

// ============================================
// GAMIFICATION DATA COLLECTION
// ============================================

db.createCollection("gamificationData", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["userId", "type", "timestamp"],
            properties: {
                userId: { bsonType: "string" },
                type: {
                    bsonType: "string",
                    enum: ["achievement", "badge", "level_up", "streak", "leaderboard", "challenge"]
                },
                timestamp: { bsonType: "date" },
                data: {
                    bsonType: "object",
                    properties: {
                        achievementId: { bsonType: "string" },
                        badgeId: { bsonType: "string" },
                        level: { bsonType: "int" },
                        streakDays: { bsonType: "int" },
                        points: { bsonType: "int" },
                        rank: { bsonType: "int" },
                        leaderboardType: { bsonType: "string" },
                        challengeId: { bsonType: "string" },
                        challengeStatus: { bsonType: "string" }
                    }
                },
                rewards: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["type", "value"],
                        properties: {
                            type: { 
                                bsonType: "string",
                                enum: ["points", "badge", "title", "avatar", "theme", "unlock"]
                            },
                            value: { bsonType: ["string", "int", "double"] },
                            description: { bsonType: "string" }
                        }
                    }
                },
                socialData: {
                    bsonType: "object",
                    properties: {
                        shared: { bsonType: "bool" },
                        likes: { bsonType: "int", minimum: 0 },
                        comments: { bsonType: "int", minimum: 0 },
                        friends: { bsonType: "array", items: { bsonType: "string" } }
                    }
                }
            }
        }
    }
});

// ============================================
// INDEXES FOR PERFORMANCE
// ============================================

// Question Bank indexes
db.questionBank.createIndex({ "id": 1 }, { unique: true });
db.questionBank.createIndex({ "subject": 1 });
db.questionBank.createIndex({ "skills": 1 });
db.questionBank.createIndex({ "difficulty.level": 1 });
db.questionBank.createIndex({ "difficulty.irtParameter": 1 });
db.questionBank.createIndex({ "gradeLevel.min": 1, "gradeLevel.max": 1 });
db.questionBank.createIndex({ "metadata.status": 1 });
db.questionBank.createIndex({ "tags": 1 });
db.questionBank.createIndex({ "analytics.averageScore": 1 });
db.questionBank.createIndex({ "analytics.discriminationIndex": 1 });
db.questionBank.createIndex({ "content.stem": "text", "title": "text" });

// User Analytics indexes
db.userAnalytics.createIndex({ "userId": 1, "date": 1 }, { unique: true });
db.userAnalytics.createIndex({ "userId": 1 });
db.userAnalytics.createIndex({ "date": 1 });
db.userAnalytics.createIndex({ "metrics.abilityEstimate": 1 });
db.userAnalytics.createIndex({ "metrics.streakDays": 1 });
db.userAnalytics.createIndex({ "skillMetrics.skillId": 1 });
db.userAnalytics.createIndex({ "skillMetrics.masteryLevel": 1 });

// Adaptive Data indexes
db.adaptiveData.createIndex({ "userId": 1, "sessionId": 1 }, { unique: true });
db.adaptiveData.createIndex({ "userId": 1 });
db.adaptiveData.createIndex({ "sessionId": 1 });
db.adaptiveData.createIndex({ "responses.questionId": 1 });
db.adaptiveData.createIndex({ "responses.timestamp": 1 });
db.adaptiveData.createIndex({ "irtCalculations.finalAbility": 1 });
db.adaptiveData.createIndex({ "metadata.startTime": 1 });

// Learning Analytics indexes
db.learningAnalytics.createIndex({ "userId": 1, "timestamp": 1 });
db.learningAnalytics.createIndex({ "userId": 1 });
db.learningAnalytics.createIndex({ "timestamp": 1 });
db.learningAnalytics.createIndex({ "eventType": 1 });
db.learningAnalytics.createIndex({ "eventData.questionId": 1 });
db.learningAnalytics.createIndex({ "eventData.sessionId": 1 });
db.learningAnalytics.createIndex({ "eventData.subject": 1 });
db.learningAnalytics.createIndex({ "eventData.skills": 1 });

// Gamification Data indexes
db.gamificationData.createIndex({ "userId": 1, "timestamp": 1 });
db.gamificationData.createIndex({ "userId": 1 });
db.gamificationData.createIndex({ "type": 1 });
db.gamificationData.createIndex({ "timestamp": 1 });
db.gamificationData.createIndex({ "data.achievementId": 1 });
db.gamificationData.createIndex({ "data.leaderboardType": 1 });
db.gamificationData.createIndex({ "data.challengeId": 1 });

// ============================================
// AGGREGATION PIPELINE EXAMPLES
// ============================================

// User performance aggregation
db.userAnalytics.aggregate([
    {
        $match: {
            "userId": "user-id-here",
            "date": { $gte: new Date("2025-01-01") }
        }
    },
    {
        $group: {
            _id: "$userId",
            totalQuestions: { $sum: "$metrics.questionsAttempted" },
            totalCorrect: { $sum: "$metrics.questionsCorrect" },
            averageScore: { $avg: "$metrics.averageScore" },
            currentStreak: { $max: "$metrics.streakDays" },
            totalPoints: { $sum: "$metrics.pointsEarned" },
            lastActivity: { $max: "$date" }
        }
    }
]);

// Question difficulty calibration
db.questionBank.aggregate([
    {
        $match: {
            "metadata.status": "published",
            "analytics.timesUsed": { $gte: 50 }
        }
    },
    {
        $project: {
            id: 1,
            title: 1,
            currentDifficulty: "$difficulty.irtParameter",
            empiricalDifficulty: "$analytics.difficultyIndex",
            discrimination: "$analytics.discriminationIndex",
            usage: "$analytics.timesUsed",
            needsRecalibration: {
                $gt: [
                    { $abs: { $subtract: ["$difficulty.irtParameter", "$analytics.difficultyIndex"] } },
                    0.5
                ]
            }
        }
    },
    {
        $match: { needsRecalibration: true }
    }
]);

// Leaderboard aggregation
db.userAnalytics.aggregate([
    {
        $match: {
            "date": { $gte: new Date("2025-01-01") }
        }
    },
    {
        $group: {
            _id: "$userId",
            totalPoints: { $sum: "$metrics.pointsEarned" },
            totalQuestions: { $sum: "$metrics.questionsAttempted" },
            totalCorrect: { $sum: "$metrics.questionsCorrect" },
            currentStreak: { $max: "$metrics.streakDays" },
            accuracy: {
                $avg: {
                    $cond: [
                        { $gt: ["$metrics.questionsAttempted", 0] },
                        { $divide: ["$metrics.questionsCorrect", "$metrics.questionsAttempted"] },
                        0
                    ]
                }
            }
        }
    },
    {
        $sort: { totalPoints: -1 }
    },
    {
        $limit: 100
    }
]);

// Skill mastery progression
db.userAnalytics.aggregate([
    {
        $match: { "userId": "user-id-here" }
    },
    {
        $unwind: "$skillMetrics"
    },
    {
        $group: {
            _id: "$skillMetrics.skillId",
            currentLevel: { $last: "$skillMetrics.masteryLevel" },
            totalAttempted: { $sum: "$skillMetrics.attempted" },
            totalCorrect: { $sum: "$skillMetrics.correct" },
            totalTime: { $sum: "$skillMetrics.timeSpent" },
            lastAttempt: { $max: "$skillMetrics.lastAttempt" },
            progressHistory: {
                $push: {
                    date: "$date",
                    level: "$skillMetrics.masteryLevel",
                    attempted: "$skillMetrics.attempted",
                    correct: "$skillMetrics.correct"
                }
            }
        }
    },
    {
        $sort: { lastAttempt: -1 }
    }
]);

// Print success message
print("MongoDB schema and indexes created successfully!");
print("Collections created: questionBank, userAnalytics, adaptiveData, learningAnalytics, gamificationData");
print("Indexes created for optimal query performance");
print("Validation rules applied for data integrity");