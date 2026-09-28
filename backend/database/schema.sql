-- =====================================================
-- Emotion Learning System (ELS) - Database Schema
-- Database: PostgreSQL
-- =====================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
-- Stores registered users for authentication
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster login
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

-- =====================================================
-- 2. VIDEOS TABLE
-- =====================================================
-- Stores learning video metadata
-- =====================================================

CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_seconds INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. LEARNING SESSIONS TABLE
-- =====================================================
-- Represents one learning attempt by a user
-- =====================================================

CREATE TABLE IF NOT EXISTS learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    video_id UUID NOT NULL,

    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,

    average_engagement_score NUMERIC(5,2),
    dominant_emotion VARCHAR(50),

    CONSTRAINT fk_learning_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_learning_video
        FOREIGN KEY (video_id)
        REFERENCES videos(id)
        ON DELETE CASCADE
);

-- Indexes for analytics & joins
CREATE INDEX IF NOT EXISTS idx_sessions_user
ON learning_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_video
ON learning_sessions(video_id);

-- =====================================================
-- 4. EMOTION LOGS TABLE
-- =====================================================
-- Stores time-series emotion data per session
-- =====================================================

CREATE TABLE IF NOT EXISTS emotion_logs (
    id BIGSERIAL PRIMARY KEY,

    session_id UUID NOT NULL,

    emotion VARCHAR(50) NOT NULL,
    confidence NUMERIC(4,3),

    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_emotion_session
        FOREIGN KEY (session_id)
        REFERENCES learning_sessions(id)
        ON DELETE CASCADE
);

-- Indexes for fast time-series queries
CREATE INDEX IF NOT EXISTS idx_emotion_session
ON emotion_logs(session_id);

CREATE INDEX IF NOT EXISTS idx_emotion_time
ON emotion_logs(captured_at);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
