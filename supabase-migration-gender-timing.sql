-- Migration: Add gender and response time tracking
-- Date: 2025-11-12

-- Add gender column to participants table
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('L', 'P', 'Laki-laki', 'Perempuan'));

-- Add response time column to participants table
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS response_time_seconds INTEGER DEFAULT 0;

-- Add response time column to responses table (per question)
ALTER TABLE responses 
ADD COLUMN IF NOT EXISTS response_time_ms INTEGER DEFAULT 0;

-- Add quality flags to participants table
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS has_straight_lining BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS response_quality VARCHAR(20) CHECK (response_quality IN ('good', 'suspicious', 'invalid'));

-- Create index for gender filtering
CREATE INDEX IF NOT EXISTS idx_participants_gender ON participants(gender);

-- Create index for quality analysis
CREATE INDEX IF NOT EXISTS idx_participants_quality ON participants(response_quality);
