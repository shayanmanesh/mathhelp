-- Math Help Comprehensive Testing System Database Schema
-- PostgreSQL Schema for structured educational data

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table with comprehensive profile data
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    grade_level INTEGER,
    school VARCHAR(255),
    birth_date DATE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    parent_email VARCHAR(255), -- For COPPA compliance
    consent_date TIMESTAMP WITH TIME ZONE,
    
    -- Adaptive testing parameters
    initial_ability_estimate DECIMAL(5,3) DEFAULT 0.0,
    current_ability_estimate DECIMAL(5,3) DEFAULT 0.0,
    ability_standard_error DECIMAL(5,3) DEFAULT 1.0,
    placement_test_completed BOOLEAN DEFAULT FALSE,
    total_questions_attempted INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    
    -- Gamification
    total_points INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    
    -- Privacy and compliance
    data_retention_consent BOOLEAN DEFAULT FALSE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT valid_grade_level CHECK (grade_level >= -2 AND grade_level <= 16),
    CONSTRAINT valid_ability_estimate CHECK (current_ability_estimate >= -4.0 AND current_ability_estimate <= 4.0)
);

-- Subjects and curriculum hierarchy
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    grade_level_min INTEGER,
    grade_level_max INTEGER,
    parent_subject_id UUID REFERENCES subjects(id),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Skills taxonomy for granular tracking
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    prerequisite_skills UUID[] DEFAULT '{}',
    learning_objectives TEXT[],
    difficulty_level INTEGER DEFAULT 1,
    estimated_time_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_difficulty_level CHECK (difficulty_level >= 1 AND difficulty_level <= 10)
);

-- Question types and templates
CREATE TABLE question_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    template_schema JSONB NOT NULL,
    scoring_algorithm VARCHAR(50) DEFAULT 'binary',
    supports_partial_credit BOOLEAN DEFAULT FALSE,
    requires_work_shown BOOLEAN DEFAULT FALSE,
    average_completion_time INTEGER DEFAULT 120, -- seconds
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Questions with IRT parameters
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id),
    skill_id UUID NOT NULL REFERENCES skills(id),
    question_type_id UUID NOT NULL REFERENCES question_types(id),
    
    -- IRT Parameters (calibrated)
    difficulty_parameter DECIMAL(5,3) DEFAULT 0.0, -- b parameter
    discrimination_parameter DECIMAL(5,3) DEFAULT 1.0, -- a parameter
    guessing_parameter DECIMAL(5,3) DEFAULT 0.0, -- c parameter
    
    -- Administrative
    grade_level_min INTEGER,
    grade_level_max INTEGER,
    estimated_time_seconds INTEGER DEFAULT 120,
    points_possible INTEGER DEFAULT 10,
    
    -- Content and metadata
    content_json JSONB NOT NULL,
    solution_json JSONB,
    hints_json JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    learning_standards TEXT[] DEFAULT '{}',
    
    -- Quality metrics
    times_used INTEGER DEFAULT 0,
    average_score DECIMAL(5,3) DEFAULT 0.0,
    discrimination_index DECIMAL(5,3) DEFAULT 0.0,
    p_value DECIMAL(5,3) DEFAULT 0.0, -- difficulty as proportion correct
    
    -- Lifecycle
    status VARCHAR(20) DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    retired_at TIMESTAMP WITH TIME ZONE,
    
    -- Version control
    version INTEGER DEFAULT 1,
    parent_question_id UUID REFERENCES questions(id),
    
    CONSTRAINT valid_difficulty_parameter CHECK (difficulty_parameter >= -4.0 AND difficulty_parameter <= 4.0),
    CONSTRAINT valid_discrimination_parameter CHECK (discrimination_parameter >= 0.0 AND discrimination_parameter <= 3.0),
    CONSTRAINT valid_guessing_parameter CHECK (guessing_parameter >= 0.0 AND guessing_parameter <= 1.0),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'review', 'published', 'retired'))
);

-- User attempts and responses
CREATE TABLE user_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    question_id UUID NOT NULL REFERENCES questions(id),
    
    -- Attempt details
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Response data
    response_json JSONB NOT NULL,
    work_shown_json JSONB,
    
    -- Scoring
    score DECIMAL(5,3) NOT NULL,
    max_score DECIMAL(5,3) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    partial_credit_details JSONB,
    
    -- Context
    session_id UUID,
    test_id UUID,
    assignment_id UUID,
    
    -- Analytics
    hint_count INTEGER DEFAULT 0,
    attempts_before_correct INTEGER DEFAULT 0,
    device_type VARCHAR(20),
    browser_info VARCHAR(200),
    
    -- IRT Update
    ability_before DECIMAL(5,3),
    ability_after DECIMAL(5,3),
    ability_se_before DECIMAL(5,3),
    ability_se_after DECIMAL(5,3),
    
    CONSTRAINT valid_score CHECK (score >= 0 AND score <= max_score),
    CONSTRAINT valid_duration CHECK (duration_seconds >= 0 AND duration_seconds <= 7200) -- 2 hours max
);

-- User skill mastery tracking
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    skill_id UUID NOT NULL REFERENCES skills(id),
    
    -- Mastery metrics
    mastery_level VARCHAR(20) DEFAULT 'attempted',
    mastery_score DECIMAL(5,3) DEFAULT 0.0,
    confidence_interval DECIMAL(5,3) DEFAULT 1.0,
    
    -- Progress tracking
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0,
    
    -- Dates
    first_attempted TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_attempted TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    mastery_achieved_at TIMESTAMP WITH TIME ZONE,
    
    -- Spaced repetition
    next_review_date TIMESTAMP WITH TIME ZONE,
    review_interval_days INTEGER DEFAULT 1,
    ease_factor DECIMAL(5,3) DEFAULT 2.5,
    
    UNIQUE(user_id, skill_id),
    CONSTRAINT valid_mastery_level CHECK (mastery_level IN ('attempted', 'familiar', 'proficient', 'mastered')),
    CONSTRAINT valid_mastery_score CHECK (mastery_score >= 0.0 AND mastery_score <= 1.0)
);

-- ============================================
-- GAMIFICATION TABLES
-- ============================================

-- Achievement definitions
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    icon_url VARCHAR(500),
    badge_color VARCHAR(20) DEFAULT '#3498db',
    
    -- Requirements
    requirement_type VARCHAR(30) NOT NULL,
    requirement_config JSONB NOT NULL,
    
    -- Rewards
    points_awarded INTEGER DEFAULT 0,
    badge_tier VARCHAR(20) DEFAULT 'bronze',
    
    -- Visibility
    is_hidden BOOLEAN DEFAULT FALSE,
    unlock_message TEXT,
    
    -- Lifecycle
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_requirement_type CHECK (requirement_type IN ('streak', 'questions_correct', 'skill_mastery', 'points_earned', 'time_spent', 'consecutive_days')),
    CONSTRAINT valid_badge_tier CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond'))
);

-- User achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    achievement_id UUID NOT NULL REFERENCES achievements(id),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress_data JSONB,
    
    UNIQUE(user_id, achievement_id)
);

-- Leaderboards
CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(30) NOT NULL,
    scope VARCHAR(30) NOT NULL,
    
    -- Filters
    subject_filter UUID REFERENCES subjects(id),
    grade_filter INTEGER,
    school_filter VARCHAR(255),
    
    -- Time periods
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Configuration
    max_participants INTEGER DEFAULT 1000,
    refresh_interval_minutes INTEGER DEFAULT 15,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_leaderboard_type CHECK (type IN ('points', 'streak', 'accuracy', 'questions_solved', 'time_spent')),
    CONSTRAINT valid_scope CHECK (scope IN ('global', 'school', 'grade', 'subject', 'friends'))
);

-- ============================================
-- TESTING AND ASSESSMENT TABLES
-- ============================================

-- Test definitions
CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    test_type VARCHAR(30) NOT NULL,
    
    -- Configuration
    is_adaptive BOOLEAN DEFAULT TRUE,
    max_questions INTEGER DEFAULT 30,
    time_limit_minutes INTEGER,
    
    -- Adaptive parameters
    starting_ability DECIMAL(5,3) DEFAULT 0.0,
    target_se DECIMAL(5,3) DEFAULT 0.3,
    min_questions INTEGER DEFAULT 10,
    max_questions_per_skill INTEGER DEFAULT 5,
    
    -- Content selection
    subject_filters UUID[] DEFAULT '{}',
    skill_filters UUID[] DEFAULT '{}',
    difficulty_range DECIMAL(5,3)[] DEFAULT '{-2.0, 2.0}',
    
    -- Availability
    available_from TIMESTAMP WITH TIME ZONE,
    available_until TIMESTAMP WITH TIME ZONE,
    
    -- Permissions
    created_by UUID REFERENCES users(id),
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Lifecycle
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_test_type CHECK (test_type IN ('placement', 'practice', 'assessment', 'quiz', 'exam'))
);

-- Test sessions
CREATE TABLE test_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    test_id UUID NOT NULL REFERENCES tests(id),
    
    -- Session state
    status VARCHAR(20) DEFAULT 'started',
    current_question_index INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_remaining_seconds INTEGER,
    
    -- Results
    total_questions INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    total_score DECIMAL(8,3) DEFAULT 0.0,
    percentage_score DECIMAL(5,3) DEFAULT 0.0,
    
    -- Adaptive results
    final_ability_estimate DECIMAL(5,3),
    final_ability_se DECIMAL(5,3),
    
    -- Metadata
    device_info JSONB,
    browser_info JSONB,
    
    CONSTRAINT valid_session_status CHECK (status IN ('started', 'paused', 'completed', 'abandoned', 'expired'))
);

-- ============================================
-- CONTENT AND MEDIA TABLES
-- ============================================

-- Media files for questions and solutions
CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    storage_path VARCHAR(500) NOT NULL,
    cdn_url VARCHAR(500),
    
    -- Metadata
    width INTEGER,
    height INTEGER,
    duration_seconds INTEGER,
    alt_text TEXT,
    
    -- Lifecycle
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 50000000) -- 50MB max
);

-- Question media relationships
CREATE TABLE question_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id),
    media_file_id UUID NOT NULL REFERENCES media_files(id),
    usage_type VARCHAR(30) NOT NULL,
    display_order INTEGER DEFAULT 0,
    
    UNIQUE(question_id, media_file_id, usage_type),
    CONSTRAINT valid_usage_type CHECK (usage_type IN ('question_image', 'solution_image', 'hint_image', 'graph', 'diagram', 'video', 'audio'))
);

-- ============================================
-- ANALYTICS AND REPORTING TABLES
-- ============================================

-- Daily user statistics
CREATE TABLE daily_user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    
    -- Activity metrics
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,
    
    -- Performance metrics
    average_score DECIMAL(5,3) DEFAULT 0.0,
    ability_change DECIMAL(5,3) DEFAULT 0.0,
    
    -- Engagement metrics
    streak_maintained BOOLEAN DEFAULT FALSE,
    achievements_earned INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    
    UNIQUE(user_id, date)
);

-- System performance metrics
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,3) NOT NULL,
    metric_type VARCHAR(30) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Context
    user_id UUID REFERENCES users(id),
    question_id UUID REFERENCES questions(id),
    session_id UUID,
    
    -- Metadata
    tags JSONB DEFAULT '{}',
    
    CONSTRAINT valid_metric_type CHECK (metric_type IN ('response_time', 'error_rate', 'completion_rate', 'engagement_score', 'difficulty_accuracy'))
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_grade_level ON users(grade_level);
CREATE INDEX idx_users_ability ON users(current_ability_estimate);

-- Question indexes
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_skill ON questions(skill_id);
CREATE INDEX idx_questions_type ON questions(question_type_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_parameter);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_published ON questions(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX idx_questions_content_search ON questions USING GIN(to_tsvector('english', title));

-- User attempts indexes
CREATE INDEX idx_user_attempts_user ON user_attempts(user_id);
CREATE INDEX idx_user_attempts_question ON user_attempts(question_id);
CREATE INDEX idx_user_attempts_submitted ON user_attempts(submitted_at);
CREATE INDEX idx_user_attempts_session ON user_attempts(session_id);
CREATE INDEX idx_user_attempts_correct ON user_attempts(is_correct);

-- User skills indexes
CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill ON user_skills(skill_id);
CREATE INDEX idx_user_skills_mastery ON user_skills(mastery_level);
CREATE INDEX idx_user_skills_review ON user_skills(next_review_date);

-- Test sessions indexes
CREATE INDEX idx_test_sessions_user ON test_sessions(user_id);
CREATE INDEX idx_test_sessions_test ON test_sessions(test_id);
CREATE INDEX idx_test_sessions_status ON test_sessions(status);
CREATE INDEX idx_test_sessions_started ON test_sessions(started_at);

-- Analytics indexes
CREATE INDEX idx_daily_stats_user_date ON daily_user_stats(user_id, date);
CREATE INDEX idx_daily_stats_date ON daily_user_stats(date);
CREATE INDEX idx_system_metrics_name_time ON system_metrics(metric_name, recorded_at);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- User performance summary
CREATE VIEW user_performance_summary AS
SELECT 
    u.id,
    u.username,
    u.current_ability_estimate,
    u.total_questions_attempted,
    u.total_correct_answers,
    CASE 
        WHEN u.total_questions_attempted > 0 
        THEN ROUND((u.total_correct_answers::DECIMAL / u.total_questions_attempted) * 100, 2)
        ELSE 0 
    END as accuracy_percentage,
    u.streak_days,
    u.total_points,
    COUNT(DISTINCT us.skill_id) as skills_attempted,
    COUNT(DISTINCT CASE WHEN us.mastery_level = 'mastered' THEN us.skill_id END) as skills_mastered
FROM users u
LEFT JOIN user_skills us ON u.id = us.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.current_ability_estimate, u.total_questions_attempted, 
         u.total_correct_answers, u.streak_days, u.total_points;

-- Question performance summary
CREATE VIEW question_performance_summary AS
SELECT 
    q.id,
    q.title,
    q.difficulty_parameter,
    q.discrimination_parameter,
    q.times_used,
    q.average_score,
    COUNT(ua.id) as total_attempts,
    COUNT(CASE WHEN ua.is_correct THEN 1 END) as correct_attempts,
    CASE 
        WHEN COUNT(ua.id) > 0 
        THEN ROUND((COUNT(CASE WHEN ua.is_correct THEN 1 END)::DECIMAL / COUNT(ua.id)) * 100, 2)
        ELSE 0 
    END as success_rate,
    AVG(ua.duration_seconds) as avg_duration_seconds
FROM questions q
LEFT JOIN user_attempts ua ON q.id = ua.question_id
WHERE q.status = 'published'
GROUP BY q.id, q.title, q.difficulty_parameter, q.discrimination_parameter, q.times_used, q.average_score;

-- Daily engagement metrics
CREATE VIEW daily_engagement_metrics AS
SELECT 
    date,
    COUNT(DISTINCT user_id) as active_users,
    SUM(questions_attempted) as total_questions,
    SUM(questions_correct) as total_correct,
    SUM(total_time_minutes) as total_time_minutes,
    AVG(average_score) as avg_score,
    COUNT(CASE WHEN streak_maintained THEN 1 END) as users_maintaining_streak
FROM daily_user_stats
GROUP BY date
ORDER BY date DESC;

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Update user stats when attempt is made
CREATE OR REPLACE FUNCTION update_user_stats_on_attempt()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user totals
    UPDATE users SET
        total_questions_attempted = total_questions_attempted + 1,
        total_correct_answers = total_correct_answers + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
        current_ability_estimate = COALESCE(NEW.ability_after, current_ability_estimate),
        ability_standard_error = COALESCE(NEW.ability_se_after, ability_standard_error),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
    
    -- Update question usage stats
    UPDATE questions SET
        times_used = times_used + 1,
        average_score = (
            SELECT AVG(score) 
            FROM user_attempts 
            WHERE question_id = NEW.question_id
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.question_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats_on_attempt
    AFTER INSERT ON user_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_on_attempt();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA SETUP
-- ============================================

-- Insert basic question types
INSERT INTO question_types (name, code, description, template_schema) VALUES
('Multiple Choice', 'MC', 'Traditional multiple choice with 4 options', 
 '{"type": "object", "properties": {"stem": {"type": "string"}, "options": {"type": "array", "items": {"type": "string"}, "minItems": 4, "maxItems": 4}, "correct_answer": {"type": "integer", "minimum": 0, "maximum": 3}}}'),
('Short Answer', 'SA', 'Numeric or short text response', 
 '{"type": "object", "properties": {"stem": {"type": "string"}, "answer_type": {"type": "string", "enum": ["numeric", "text"]}, "correct_answer": {"type": "string"}, "tolerance": {"type": "number"}}}'),
('True/False', 'TF', 'Binary choice question', 
 '{"type": "object", "properties": {"stem": {"type": "string"}, "correct_answer": {"type": "boolean"}}}'),
('Drag and Drop', 'DD', 'Interactive drag and drop matching', 
 '{"type": "object", "properties": {"stem": {"type": "string"}, "items": {"type": "array"}, "targets": {"type": "array"}, "correct_matches": {"type": "array"}}}'),
('Graph Plot', 'GP', 'Interactive graphing question', 
 '{"type": "object", "properties": {"stem": {"type": "string"}, "graph_type": {"type": "string"}, "expected_function": {"type": "string"}, "tolerance": {"type": "number"}}}');

-- Insert subject hierarchy
INSERT INTO subjects (name, code, description, grade_level_min, grade_level_max) VALUES
('Mathematics', 'MATH', 'All mathematics topics', -2, 16),
('Elementary Math', 'ELEM', 'Elementary mathematics K-5', -2, 5),
('Middle School Math', 'MIDDLE', 'Middle school mathematics 6-8', 6, 8),
('High School Math', 'HIGH', 'High school mathematics 9-12', 9, 12),
('College Math', 'COLLEGE', 'College level mathematics', 13, 16),
('Competition Math', 'COMP', 'Mathematical competitions and contests', 6, 12);

-- Insert sample achievements
INSERT INTO achievements (name, description, category, requirement_type, requirement_config, points_awarded, badge_tier) VALUES
('First Steps', 'Complete your first question correctly', 'milestone', 'questions_correct', '{"count": 1}', 10, 'bronze'),
('Problem Solver', 'Solve 10 questions correctly', 'milestone', 'questions_correct', '{"count": 10}', 50, 'bronze'),
('Math Enthusiast', 'Solve 100 questions correctly', 'milestone', 'questions_correct', '{"count": 100}', 200, 'silver'),
('Math Expert', 'Solve 1000 questions correctly', 'milestone', 'questions_correct', '{"count": 1000}', 1000, 'gold'),
('Week Warrior', 'Maintain a 7-day streak', 'streak', 'streak', '{"days": 7}', 100, 'silver'),
('Month Master', 'Maintain a 30-day streak', 'streak', 'streak', '{"days": 30}', 500, 'gold'),
('Perfect Score', 'Achieve 100% accuracy on 20 questions', 'accuracy', 'questions_correct', '{"count": 20, "accuracy": 1.0}', 300, 'gold'),
('Speed Demon', 'Complete 50 questions in under 30 seconds each', 'speed', 'questions_correct', '{"count": 50, "max_time": 30}', 250, 'silver');

-- Create sample leaderboards
INSERT INTO leaderboards (name, type, scope, start_date, end_date) VALUES
('Global Points Leaderboard', 'points', 'global', CURRENT_DATE - INTERVAL '1 week', CURRENT_DATE + INTERVAL '1 week'),
('Weekly Streak Champions', 'streak', 'global', CURRENT_DATE - INTERVAL '1 week', CURRENT_DATE),
('Monthly Accuracy Masters', 'accuracy', 'global', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE),
('Daily Question Solvers', 'questions_solved', 'global', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day');

-- Grant permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO math_help_app;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO math_help_app;