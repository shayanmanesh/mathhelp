// Comprehensive Curriculum Organization and Content Structure
// K-12 through Competition Level Mathematics

const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

class CurriculumManager {
    constructor(config = {}) {
        this.config = {
            enableStandards: true,
            defaultStandards: ['CCSS', 'TEKS', 'AP', 'IB'],
            skillMasteryThreshold: 0.8,
            prerequisiteStrength: 0.7,
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
        
        this.initializeDatabase();
    }
    
    async initializeDatabase() {
        try {
            await this.mongoClient.connect();
            this.mongodb = this.mongoClient.db('mathhelp_testing');
            
            // Initialize curriculum structure
            await this.initializeCurriculumStructure();
            
            console.log('Curriculum Manager initialized');
        } catch (error) {
            console.error('Curriculum initialization error:', error);
            throw error;
        }
    }
    
    // ============================================
    // CURRICULUM STRUCTURE INITIALIZATION
    // ============================================
    
    async initializeCurriculumStructure() {
        // Initialize subjects
        await this.initializeSubjects();
        
        // Initialize skills
        await this.initializeSkills();
        
        // Initialize learning paths
        await this.initializeLearningPaths();
        
        // Initialize standards alignment
        await this.initializeStandards();
    }
    
    /**
     * Initialize subject hierarchy
     */
    async initializeSubjects() {
        const subjects = [
            // Elementary Mathematics (K-5)
            {
                code: 'ELEM_MATH',
                name: 'Elementary Mathematics',
                description: 'Foundation mathematics for grades K-5',
                gradeMin: -2, // Pre-K
                gradeMax: 5,
                parentCode: null,
                displayOrder: 1,
                children: [
                    {
                        code: 'NUMBER_SENSE',
                        name: 'Number Sense',
                        description: 'Understanding numbers, counting, and place value',
                        gradeMin: -2,
                        gradeMax: 5,
                        displayOrder: 1
                    },
                    {
                        code: 'BASIC_OPERATIONS',
                        name: 'Basic Operations',
                        description: 'Addition, subtraction, multiplication, division',
                        gradeMin: -1,
                        gradeMax: 5,
                        displayOrder: 2
                    },
                    {
                        code: 'FRACTIONS_DECIMALS',
                        name: 'Fractions and Decimals',
                        description: 'Understanding and working with fractions and decimals',
                        gradeMin: 2,
                        gradeMax: 5,
                        displayOrder: 3
                    },
                    {
                        code: 'ELEM_GEOMETRY',
                        name: 'Elementary Geometry',
                        description: 'Basic shapes, measurement, and spatial reasoning',
                        gradeMin: -2,
                        gradeMax: 5,
                        displayOrder: 4
                    },
                    {
                        code: 'ELEM_MEASUREMENT',
                        name: 'Measurement',
                        description: 'Length, weight, volume, time, and money',
                        gradeMin: -1,
                        gradeMax: 5,
                        displayOrder: 5
                    },
                    {
                        code: 'ELEM_DATA',
                        name: 'Data and Probability',
                        description: 'Simple graphs, charts, and basic probability',
                        gradeMin: 1,
                        gradeMax: 5,
                        displayOrder: 6
                    }
                ]
            },
            
            // Middle School Mathematics (6-8)
            {
                code: 'MIDDLE_MATH',
                name: 'Middle School Mathematics',
                description: 'Intermediate mathematics for grades 6-8',
                gradeMin: 6,
                gradeMax: 8,
                parentCode: null,
                displayOrder: 2,
                children: [
                    {
                        code: 'RATIOS_PROPORTIONS',
                        name: 'Ratios and Proportions',
                        description: 'Understanding ratios, rates, and proportional relationships',
                        gradeMin: 6,
                        gradeMax: 8,
                        displayOrder: 1
                    },
                    {
                        code: 'INTEGERS_RATIONALS',
                        name: 'Integers and Rational Numbers',
                        description: 'Working with negative numbers and rational numbers',
                        gradeMin: 6,
                        gradeMax: 8,
                        displayOrder: 2
                    },
                    {
                        code: 'EXPRESSIONS_EQUATIONS',
                        name: 'Expressions and Equations',
                        description: 'Algebraic expressions and solving equations',
                        gradeMin: 6,
                        gradeMax: 8,
                        displayOrder: 3
                    },
                    {
                        code: 'FUNCTIONS_INTRO',
                        name: 'Introduction to Functions',
                        description: 'Understanding functions and their representations',
                        gradeMin: 7,
                        gradeMax: 8,
                        displayOrder: 4
                    },
                    {
                        code: 'MIDDLE_GEOMETRY',
                        name: 'Middle School Geometry',
                        description: 'Area, volume, similarity, and coordinate geometry',
                        gradeMin: 6,
                        gradeMax: 8,
                        displayOrder: 5
                    },
                    {
                        code: 'MIDDLE_STATISTICS',
                        name: 'Statistics and Probability',
                        description: 'Data analysis, statistics, and probability',
                        gradeMin: 6,
                        gradeMax: 8,
                        displayOrder: 6
                    }
                ]
            },
            
            // High School Mathematics (9-12)
            {
                code: 'HIGH_MATH',
                name: 'High School Mathematics',
                description: 'Advanced mathematics for grades 9-12',
                gradeMin: 9,
                gradeMax: 12,
                parentCode: null,
                displayOrder: 3,
                children: [
                    {
                        code: 'ALGEBRA_1',
                        name: 'Algebra I',
                        description: 'Linear equations, inequalities, and functions',
                        gradeMin: 8,
                        gradeMax: 10,
                        displayOrder: 1
                    },
                    {
                        code: 'GEOMETRY',
                        name: 'Geometry',
                        description: 'Euclidean geometry, proofs, and coordinate geometry',
                        gradeMin: 9,
                        gradeMax: 11,
                        displayOrder: 2
                    },
                    {
                        code: 'ALGEBRA_2',
                        name: 'Algebra II',
                        description: 'Quadratic functions, polynomials, and exponentials',
                        gradeMin: 9,
                        gradeMax: 12,
                        displayOrder: 3
                    },
                    {
                        code: 'PRECALCULUS',
                        name: 'Pre-Calculus',
                        description: 'Advanced functions, trigonometry, and limits',
                        gradeMin: 10,
                        gradeMax: 12,
                        displayOrder: 4
                    },
                    {
                        code: 'STATISTICS',
                        name: 'Statistics',
                        description: 'Statistical analysis and probability theory',
                        gradeMin: 9,
                        gradeMax: 12,
                        displayOrder: 5
                    }
                ]
            },
            
            // College Mathematics (13-16)
            {
                code: 'COLLEGE_MATH',
                name: 'College Mathematics',
                description: 'College-level mathematics',
                gradeMin: 13,
                gradeMax: 16,
                parentCode: null,
                displayOrder: 4,
                children: [
                    {
                        code: 'CALCULUS_1',
                        name: 'Calculus I',
                        description: 'Limits, derivatives, and basic integration',
                        gradeMin: 11,
                        gradeMax: 14,
                        displayOrder: 1
                    },
                    {
                        code: 'CALCULUS_2',
                        name: 'Calculus II',
                        description: 'Advanced integration and infinite series',
                        gradeMin: 12,
                        gradeMax: 15,
                        displayOrder: 2
                    },
                    {
                        code: 'CALCULUS_3',
                        name: 'Calculus III',
                        description: 'Multivariable calculus and vector calculus',
                        gradeMin: 13,
                        gradeMax: 16,
                        displayOrder: 3
                    },
                    {
                        code: 'LINEAR_ALGEBRA',
                        name: 'Linear Algebra',
                        description: 'Matrices, vector spaces, and linear transformations',
                        gradeMin: 13,
                        gradeMax: 16,
                        displayOrder: 4
                    },
                    {
                        code: 'DIFFERENTIAL_EQUATIONS',
                        name: 'Differential Equations',
                        description: 'Ordinary and partial differential equations',
                        gradeMin: 14,
                        gradeMax: 16,
                        displayOrder: 5
                    }
                ]
            },
            
            // Competition Mathematics
            {
                code: 'COMPETITION_MATH',
                name: 'Competition Mathematics',
                description: 'Mathematical competitions and contests',
                gradeMin: 6,
                gradeMax: 12,
                parentCode: null,
                displayOrder: 5,
                children: [
                    {
                        code: 'AMC_8',
                        name: 'AMC 8',
                        description: 'American Mathematics Competition for middle school',
                        gradeMin: 6,
                        gradeMax: 8,
                        displayOrder: 1
                    },
                    {
                        code: 'AMC_10',
                        name: 'AMC 10',
                        description: 'American Mathematics Competition for grades 9-10',
                        gradeMin: 9,
                        gradeMax: 10,
                        displayOrder: 2
                    },
                    {
                        code: 'AMC_12',
                        name: 'AMC 12',
                        description: 'American Mathematics Competition for grades 11-12',
                        gradeMin: 11,
                        gradeMax: 12,
                        displayOrder: 3
                    },
                    {
                        code: 'AIME',
                        name: 'AIME',
                        description: 'American Invitational Mathematics Examination',
                        gradeMin: 9,
                        gradeMax: 12,
                        displayOrder: 4
                    },
                    {
                        code: 'MATHCOUNTS',
                        name: 'MATHCOUNTS',
                        description: 'Middle school mathematics competition',
                        gradeMin: 6,
                        gradeMax: 8,
                        displayOrder: 5
                    }
                ]
            }
        ];
        
        // Insert subjects into database
        await this.insertSubjectsRecursively(subjects);
    }
    
    /**
     * Insert subjects recursively into database
     */
    async insertSubjectsRecursively(subjects, parentId = null) {
        for (const subject of subjects) {
            // Insert parent subject
            const result = await this.pgPool.query(`
                INSERT INTO subjects (code, name, description, grade_level_min, grade_level_max, parent_subject_id, display_order)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (code) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    grade_level_min = EXCLUDED.grade_level_min,
                    grade_level_max = EXCLUDED.grade_level_max,
                    display_order = EXCLUDED.display_order
                RETURNING id
            `, [
                subject.code,
                subject.name,
                subject.description,
                subject.gradeMin,
                subject.gradeMax,
                parentId,
                subject.displayOrder
            ]);
            
            const subjectId = result.rows[0].id;
            
            // Insert children if they exist
            if (subject.children && subject.children.length > 0) {
                await this.insertSubjectsRecursively(subject.children, subjectId);
            }
        }
    }
    
    /**
     * Initialize skills taxonomy
     */
    async initializeSkills() {
        const skillsData = await this.generateSkillsData();
        
        for (const skill of skillsData) {
            await this.pgPool.query(`
                INSERT INTO skills (code, name, description, subject_id, prerequisite_skills, learning_objectives, difficulty_level, estimated_time_minutes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (code) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    prerequisite_skills = EXCLUDED.prerequisite_skills,
                    learning_objectives = EXCLUDED.learning_objectives,
                    difficulty_level = EXCLUDED.difficulty_level,
                    estimated_time_minutes = EXCLUDED.estimated_time_minutes
            `, [
                skill.code,
                skill.name,
                skill.description,
                skill.subjectId,
                skill.prerequisites,
                skill.objectives,
                skill.difficulty,
                skill.estimatedTime
            ]);
        }
    }
    
    /**
     * Generate comprehensive skills data
     */
    async generateSkillsData() {
        const skills = [];
        
        // Get subject IDs
        const subjectMap = await this.getSubjectMap();
        
        // Elementary Number Sense Skills
        skills.push({
            code: 'NS_COUNTING_1_10',
            name: 'Counting 1-10',
            description: 'Count objects and numbers from 1 to 10',
            subjectId: subjectMap['NUMBER_SENSE'],
            prerequisites: [],
            objectives: ['Count objects from 1 to 10', 'Recognize numerals 1-10', 'Understand one-to-one correspondence'],
            difficulty: 1,
            estimatedTime: 30
        });
        
        skills.push({
            code: 'NS_COUNTING_1_100',
            name: 'Counting 1-100',
            description: 'Count objects and numbers from 1 to 100',
            subjectId: subjectMap['NUMBER_SENSE'],
            prerequisites: ['NS_COUNTING_1_10'],
            objectives: ['Count objects from 1 to 100', 'Skip count by 2s, 5s, and 10s', 'Understand place value'],
            difficulty: 2,
            estimatedTime: 45
        });
        
        skills.push({
            code: 'NS_PLACE_VALUE_TENS',
            name: 'Place Value (Tens)',
            description: 'Understand place value in two-digit numbers',
            subjectId: subjectMap['NUMBER_SENSE'],
            prerequisites: ['NS_COUNTING_1_100'],
            objectives: ['Identify tens and ones', 'Compose and decompose two-digit numbers', 'Compare two-digit numbers'],
            difficulty: 3,
            estimatedTime: 60
        });
        
        // Basic Operations Skills
        skills.push({
            code: 'OP_ADDITION_SINGLE',
            name: 'Single-Digit Addition',
            description: 'Add single-digit numbers',
            subjectId: subjectMap['BASIC_OPERATIONS'],
            prerequisites: ['NS_COUNTING_1_10'],
            objectives: ['Add numbers 0-9', 'Understand addition as combining', 'Use addition strategies'],
            difficulty: 2,
            estimatedTime: 45
        });
        
        skills.push({
            code: 'OP_ADDITION_DOUBLE',
            name: 'Two-Digit Addition',
            description: 'Add two-digit numbers with and without regrouping',
            subjectId: subjectMap['BASIC_OPERATIONS'],
            prerequisites: ['OP_ADDITION_SINGLE', 'NS_PLACE_VALUE_TENS'],
            objectives: ['Add two-digit numbers', 'Understand regrouping', 'Use standard algorithm'],
            difficulty: 4,
            estimatedTime: 60
        });
        
        // Algebra I Skills
        skills.push({
            code: 'ALG1_LINEAR_EQUATIONS',
            name: 'Linear Equations',
            description: 'Solve linear equations in one variable',
            subjectId: subjectMap['ALGEBRA_1'],
            prerequisites: ['EXPRESSIONS_EQUATIONS'],
            objectives: ['Solve one-step equations', 'Solve multi-step equations', 'Apply equation solving to problems'],
            difficulty: 5,
            estimatedTime: 90
        });
        
        skills.push({
            code: 'ALG1_SYSTEMS_EQUATIONS',
            name: 'Systems of Equations',
            description: 'Solve systems of linear equations',
            subjectId: subjectMap['ALGEBRA_1'],
            prerequisites: ['ALG1_LINEAR_EQUATIONS'],
            objectives: ['Solve by substitution', 'Solve by elimination', 'Graph systems of equations'],
            difficulty: 6,
            estimatedTime: 120
        });
        
        // Geometry Skills
        skills.push({
            code: 'GEO_BASIC_SHAPES',
            name: 'Basic Shapes',
            description: 'Identify and classify basic geometric shapes',
            subjectId: subjectMap['ELEM_GEOMETRY'],
            prerequisites: [],
            objectives: ['Identify circles, squares, triangles, rectangles', 'Classify shapes by properties', 'Draw basic shapes'],
            difficulty: 2,
            estimatedTime: 45
        });
        
        skills.push({
            code: 'GEO_PYTHAGOREAN',
            name: 'Pythagorean Theorem',
            description: 'Apply the Pythagorean theorem',
            subjectId: subjectMap['GEOMETRY'],
            prerequisites: ['GEO_BASIC_SHAPES'],
            objectives: ['State the Pythagorean theorem', 'Apply to find missing sides', 'Solve real-world problems'],
            difficulty: 6,
            estimatedTime: 90
        });
        
        // Calculus Skills
        skills.push({
            code: 'CALC1_LIMITS',
            name: 'Limits',
            description: 'Understand and evaluate limits',
            subjectId: subjectMap['CALCULUS_1'],
            prerequisites: ['PRECALCULUS'],
            objectives: ['Evaluate limits graphically', 'Evaluate limits algebraically', 'Understand continuity'],
            difficulty: 8,
            estimatedTime: 120
        });
        
        skills.push({
            code: 'CALC1_DERIVATIVES',
            name: 'Derivatives',
            description: 'Find derivatives using various rules',
            subjectId: subjectMap['CALCULUS_1'],
            prerequisites: ['CALC1_LIMITS'],
            objectives: ['Use power rule', 'Use product and quotient rules', 'Use chain rule'],
            difficulty: 9,
            estimatedTime: 150
        });
        
        return skills;
    }
    
    /**
     * Get subject ID mapping
     */
    async getSubjectMap() {
        const result = await this.pgPool.query('SELECT id, code FROM subjects');
        const map = {};
        
        result.rows.forEach(row => {
            map[row.code] = row.id;
        });
        
        return map;
    }
    
    /**
     * Initialize learning paths
     */
    async initializeLearningPaths() {
        const learningPaths = [
            {
                name: 'Elementary Math Foundation',
                description: 'Complete foundation in elementary mathematics',
                targetGrade: 5,
                estimatedWeeks: 36,
                skills: [
                    'NS_COUNTING_1_10',
                    'NS_COUNTING_1_100',
                    'NS_PLACE_VALUE_TENS',
                    'OP_ADDITION_SINGLE',
                    'OP_ADDITION_DOUBLE',
                    'GEO_BASIC_SHAPES'
                ]
            },
            {
                name: 'Algebra I Mastery',
                description: 'Complete mastery of Algebra I concepts',
                targetGrade: 9,
                estimatedWeeks: 40,
                skills: [
                    'ALG1_LINEAR_EQUATIONS',
                    'ALG1_SYSTEMS_EQUATIONS'
                ]
            },
            {
                name: 'Calculus Preparation',
                description: 'Comprehensive preparation for calculus',
                targetGrade: 12,
                estimatedWeeks: 36,
                skills: [
                    'CALC1_LIMITS',
                    'CALC1_DERIVATIVES'
                ]
            }
        ];
        
        // Store learning paths in MongoDB
        await this.mongodb.collection('learningPaths').deleteMany({});
        await this.mongodb.collection('learningPaths').insertMany(learningPaths);
    }
    
    /**
     * Initialize standards alignment
     */
    async initializeStandards() {
        const standards = [
            // Common Core State Standards
            {
                system: 'CCSS',
                grade: 'K',
                domain: 'CC',
                code: 'K.CC.1',
                description: 'Count to 100 by ones and by tens',
                skills: ['NS_COUNTING_1_100']
            },
            {
                system: 'CCSS',
                grade: '1',
                domain: 'OA',
                code: '1.OA.1',
                description: 'Use addition and subtraction within 20 to solve problems',
                skills: ['OP_ADDITION_SINGLE']
            },
            {
                system: 'CCSS',
                grade: '2',
                domain: 'NBT',
                code: '2.NBT.5',
                description: 'Fluently add and subtract within 100',
                skills: ['OP_ADDITION_DOUBLE']
            },
            
            // Texas Essential Knowledge and Skills
            {
                system: 'TEKS',
                grade: '9',
                domain: 'A',
                code: '9.A.5A',
                description: 'Solve linear equations in one variable',
                skills: ['ALG1_LINEAR_EQUATIONS']
            },
            {
                system: 'TEKS',
                grade: '10',
                domain: 'G',
                code: '10.G.7A',
                description: 'Apply the Pythagorean theorem',
                skills: ['GEO_PYTHAGOREAN']
            },
            
            // AP Calculus
            {
                system: 'AP',
                grade: '12',
                domain: 'CAL',
                code: 'AP.CAL.1.1',
                description: 'Interpret the meaning of a derivative',
                skills: ['CALC1_DERIVATIVES']
            }
        ];
        
        // Store standards in MongoDB
        await this.mongodb.collection('standards').deleteMany({});
        await this.mongodb.collection('standards').insertMany(standards);
    }
    
    // ============================================
    // CURRICULUM NAVIGATION AND QUERIES
    // ============================================
    
    /**
     * Get subject hierarchy
     */
    async getSubjectHierarchy() {
        const result = await this.pgPool.query(`
            SELECT s.*, 
                   COUNT(skills.id) as skill_count,
                   parent.name as parent_name
            FROM subjects s
            LEFT JOIN subjects parent ON s.parent_subject_id = parent.id
            LEFT JOIN skills ON s.id = skills.subject_id
            GROUP BY s.id, parent.name
            ORDER BY s.display_order
        `);
        
        return this.buildHierarchy(result.rows);
    }
    
    /**
     * Build hierarchical structure from flat data
     */
    buildHierarchy(flatData) {
        const hierarchy = [];
        const lookup = {};
        
        // First pass: create lookup table
        flatData.forEach(item => {
            lookup[item.id] = { ...item, children: [] };
        });
        
        // Second pass: build hierarchy
        flatData.forEach(item => {
            if (item.parent_subject_id) {
                lookup[item.parent_subject_id].children.push(lookup[item.id]);
            } else {
                hierarchy.push(lookup[item.id]);
            }
        });
        
        return hierarchy;
    }
    
    /**
     * Get skills for a subject
     */
    async getSkillsForSubject(subjectId) {
        const result = await this.pgPool.query(`
            SELECT s.*, 
                   COUNT(ua.id) as attempt_count,
                   AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) as success_rate
            FROM skills s
            LEFT JOIN user_attempts ua ON s.id = ua.skill_id
            WHERE s.subject_id = $1
            GROUP BY s.id
            ORDER BY s.difficulty_level, s.name
        `, [subjectId]);
        
        return result.rows;
    }
    
    /**
     * Get prerequisite chain for a skill
     */
    async getPrerequisiteChain(skillId) {
        const skill = await this.pgPool.query('SELECT * FROM skills WHERE id = $1', [skillId]);
        
        if (skill.rows.length === 0) {
            return [];
        }
        
        const prerequisites = skill.rows[0].prerequisite_skills || [];
        const chain = [];
        
        for (const prereqId of prerequisites) {
            const prereq = await this.pgPool.query('SELECT * FROM skills WHERE id = $1', [prereqId]);
            if (prereq.rows.length > 0) {
                chain.push(prereq.rows[0]);
                // Recursively get prerequisites of prerequisites
                const subChain = await this.getPrerequisiteChain(prereqId);
                chain.push(...subChain);
            }
        }
        
        return chain;
    }
    
    /**
     * Get learning path for user
     */
    async getLearningPath(userId, subjectId) {
        // Get user's current skill levels
        const userSkills = await this.pgPool.query(`
            SELECT us.*, s.code, s.name, s.difficulty_level, s.prerequisite_skills
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = $1 AND s.subject_id = $2
        `, [userId, subjectId]);
        
        // Get all skills for the subject
        const allSkills = await this.getSkillsForSubject(subjectId);
        
        // Calculate recommended next skills
        const recommendations = await this.calculateRecommendations(userSkills.rows, allSkills);
        
        return {
            currentSkills: userSkills.rows,
            recommendations,
            completionPercentage: this.calculateCompletionPercentage(userSkills.rows, allSkills)
        };
    }
    
    /**
     * Calculate skill recommendations
     */
    async calculateRecommendations(userSkills, allSkills) {
        const userSkillMap = {};
        userSkills.forEach(skill => {
            userSkillMap[skill.skill_id] = skill;
        });
        
        const recommendations = [];
        
        for (const skill of allSkills) {
            const userSkill = userSkillMap[skill.id];
            
            // Skip if already mastered
            if (userSkill && userSkill.mastery_level === 'mastered') {
                continue;
            }
            
            // Check if prerequisites are met
            const prerequisitesMet = await this.checkPrerequisites(skill.prerequisite_skills, userSkillMap);
            
            if (prerequisitesMet) {
                const priority = this.calculatePriority(skill, userSkill);
                recommendations.push({
                    skill,
                    priority,
                    reason: this.getRecommendationReason(skill, userSkill, prerequisitesMet)
                });
            }
        }
        
        // Sort by priority
        recommendations.sort((a, b) => b.priority - a.priority);
        
        return recommendations.slice(0, 5); // Return top 5 recommendations
    }
    
    /**
     * Check if prerequisites are met
     */
    async checkPrerequisites(prerequisiteSkills, userSkillMap) {
        if (!prerequisiteSkills || prerequisiteSkills.length === 0) {
            return true;
        }
        
        for (const prereqId of prerequisiteSkills) {
            const userSkill = userSkillMap[prereqId];
            
            if (!userSkill || userSkill.mastery_score < this.config.prerequisiteStrength) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Calculate recommendation priority
     */
    calculatePriority(skill, userSkill) {
        let priority = 0;
        
        // Base priority from difficulty (inverse - easier skills first)
        priority += (10 - skill.difficulty_level) * 10;
        
        // Boost if user has attempted but not mastered
        if (userSkill) {
            priority += userSkill.questions_attempted * 5;
            priority += userSkill.mastery_score * 20;
        }
        
        // Boost if skill is foundational (has many dependents)
        // This would require additional analysis
        
        return priority;
    }
    
    /**
     * Get recommendation reason
     */
    getRecommendationReason(skill, userSkill, prerequisitesMet) {
        if (!userSkill) {
            return 'New skill ready to learn';
        }
        
        if (userSkill.mastery_level === 'attempted') {
            return 'Continue practicing this skill';
        }
        
        if (userSkill.mastery_level === 'familiar') {
            return 'Build proficiency in this skill';
        }
        
        return 'Ready for the next challenge';
    }
    
    /**
     * Calculate completion percentage
     */
    calculateCompletionPercentage(userSkills, allSkills) {
        if (allSkills.length === 0) return 0;
        
        const masteredSkills = userSkills.filter(skill => skill.mastery_level === 'mastered');
        return Math.round((masteredSkills.length / allSkills.length) * 100);
    }
    
    // ============================================
    // STANDARDS ALIGNMENT
    // ============================================
    
    /**
     * Get standards for skill
     */
    async getStandardsForSkill(skillId) {
        const standards = await this.mongodb.collection('standards').find({
            skills: skillId
        }).toArray();
        
        return standards;
    }
    
    /**
     * Get skills for standard
     */
    async getSkillsForStandard(standardCode) {
        const standard = await this.mongodb.collection('standards').findOne({
            code: standardCode
        });
        
        if (!standard) return [];
        
        const skills = await this.pgPool.query(`
            SELECT * FROM skills WHERE id = ANY($1)
        `, [standard.skills]);
        
        return skills.rows;
    }
    
    /**
     * Get standards coverage for user
     */
    async getStandardsCoverage(userId, standardSystem = 'CCSS') {
        const standards = await this.mongodb.collection('standards').find({
            system: standardSystem
        }).toArray();
        
        const coverage = [];
        
        for (const standard of standards) {
            const skillIds = standard.skills || [];
            
            if (skillIds.length === 0) {
                continue;
            }
            
            const userSkills = await this.pgPool.query(`
                SELECT us.mastery_level, us.mastery_score
                FROM user_skills us
                WHERE us.user_id = $1 AND us.skill_id = ANY($2)
            `, [userId, skillIds]);
            
            const masteredCount = userSkills.rows.filter(s => s.mastery_level === 'mastered').length;
            const coveragePercent = (masteredCount / skillIds.length) * 100;
            
            coverage.push({
                standard,
                totalSkills: skillIds.length,
                masteredSkills: masteredCount,
                coveragePercent: Math.round(coveragePercent)
            });
        }
        
        return coverage;
    }
    
    // ============================================
    // ASSESSMENT ALIGNMENT
    // ============================================
    
    /**
     * Get questions for skill
     */
    async getQuestionsForSkill(skillId, difficulty = null, limit = 10) {
        let query = `
            SELECT q.*, qt.name as question_type_name
            FROM questions q
            JOIN question_types qt ON q.question_type_id = qt.id
            WHERE q.skill_id = $1 AND q.status = 'published'
        `;
        
        const params = [skillId];
        
        if (difficulty) {
            query += ` AND q.difficulty_parameter BETWEEN $2 AND $3`;
            params.push(difficulty - 0.5, difficulty + 0.5);
        }
        
        query += ` ORDER BY q.difficulty_parameter LIMIT $${params.length + 1}`;
        params.push(limit);
        
        const result = await this.pgPool.query(query, params);
        return result.rows;
    }
    
    /**
     * Get adaptive question sequence for skill
     */
    async getAdaptiveSequence(skillId, userAbility = 0.0) {
        const questions = await this.getQuestionsForSkill(skillId);
        
        // Sort by information value at user's ability level
        const questionsWithInfo = questions.map(q => ({
            ...q,
            information: this.calculateInformation(userAbility, q.difficulty_parameter, q.discrimination_parameter)
        }));
        
        questionsWithInfo.sort((a, b) => b.information - a.information);
        
        return questionsWithInfo.slice(0, 10);
    }
    
    /**
     * Calculate information function for question selection
     */
    calculateInformation(ability, difficulty, discrimination = 1.0) {
        const exponent = discrimination * (ability - difficulty);
        const probability = Math.exp(exponent) / (1 + Math.exp(exponent));
        const q = 1 - probability;
        
        return Math.pow(discrimination, 2) * probability * q;
    }
    
    // ============================================
    // CURRICULUM ANALYTICS
    // ============================================
    
    /**
     * Get curriculum analytics
     */
    async getCurriculumAnalytics(subjectId) {
        const skills = await this.getSkillsForSubject(subjectId);
        const totalSkills = skills.length;
        
        // Get user engagement data
        const engagementData = await this.pgPool.query(`
            SELECT 
                s.id,
                s.name,
                COUNT(DISTINCT ua.user_id) as unique_users,
                COUNT(ua.id) as total_attempts,
                AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) as success_rate,
                AVG(ua.duration_seconds) as avg_duration
            FROM skills s
            LEFT JOIN user_attempts ua ON s.id = ua.skill_id
            WHERE s.subject_id = $1
            GROUP BY s.id, s.name
            ORDER BY unique_users DESC
        `, [subjectId]);
        
        return {
            totalSkills,
            skillAnalytics: engagementData.rows,
            subjectMetrics: {
                totalUsers: engagementData.rows.reduce((sum, row) => sum + row.unique_users, 0),
                totalAttempts: engagementData.rows.reduce((sum, row) => sum + row.total_attempts, 0),
                averageSuccessRate: engagementData.rows.reduce((sum, row) => sum + row.success_rate, 0) / engagementData.rows.length || 0
            }
        };
    }
    
    /**
     * Get learning path analytics
     */
    async getLearningPathAnalytics(pathId) {
        const path = await this.mongodb.collection('learningPaths').findOne({
            _id: pathId
        });
        
        if (!path) return null;
        
        const analytics = {
            pathInfo: path,
            skillProgress: [],
            userMetrics: {
                totalUsers: 0,
                completedUsers: 0,
                averageProgress: 0
            }
        };
        
        // Get progress for each skill in the path
        for (const skillCode of path.skills) {
            const skill = await this.pgPool.query('SELECT * FROM skills WHERE code = $1', [skillCode]);
            
            if (skill.rows.length > 0) {
                const skillId = skill.rows[0].id;
                const progress = await this.pgPool.query(`
                    SELECT 
                        COUNT(DISTINCT user_id) as total_users,
                        COUNT(DISTINCT CASE WHEN mastery_level = 'mastered' THEN user_id END) as mastered_users,
                        AVG(mastery_score) as avg_mastery_score
                    FROM user_skills
                    WHERE skill_id = $1
                `, [skillId]);
                
                analytics.skillProgress.push({
                    skill: skill.rows[0],
                    metrics: progress.rows[0]
                });
            }
        }
        
        return analytics;
    }
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
    /**
     * Search skills by name or description
     */
    async searchSkills(query, limit = 20) {
        const result = await this.pgPool.query(`
            SELECT s.*, sub.name as subject_name
            FROM skills s
            JOIN subjects sub ON s.subject_id = sub.id
            WHERE s.name ILIKE $1 OR s.description ILIKE $1
            ORDER BY s.name
            LIMIT $2
        `, [`%${query}%`, limit]);
        
        return result.rows;
    }
    
    /**
     * Get skill by code
     */
    async getSkillByCode(skillCode) {
        const result = await this.pgPool.query(`
            SELECT s.*, sub.name as subject_name
            FROM skills s
            JOIN subjects sub ON s.subject_id = sub.id
            WHERE s.code = $1
        `, [skillCode]);
        
        return result.rows[0] || null;
    }
    
    /**
     * Close database connections
     */
    async close() {
        await this.pgPool.end();
        await this.mongoClient.close();
    }
}

module.exports = CurriculumManager;