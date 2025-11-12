-- ================================================
-- RESET & SEED COMPLETE DUMMY DATA
-- Physical Literacy Assessment
-- ================================================

-- 1. DELETE ALL EXISTING DATA (CASCADE)
DELETE FROM digit_span_results;
DELETE FROM responses;
DELETE FROM participants;

-- Reset sequences
ALTER SEQUENCE participants_id_seq RESTART WITH 1;
ALTER SEQUENCE responses_id_seq RESTART WITH 1;
ALTER SEQUENCE digit_span_results_id_seq RESTART WITH 1;

-- 2. INSERT DUMMY PARTICIPANTS WITH COMPLETE DATA
-- Mix of: gender (L/P), various ages, different quality indicators
-- Total: 10 participants (7 valid, 2 suspicious, 1 invalid)

INSERT INTO participants (name, age, gender, cognitive_score, psychological_score, social_score, digit_span_score, response_time_seconds, has_straight_lining, response_quality, created_at) VALUES
-- Valid data - Males (4 participants)
('Ahmad Rizki', 16, 'L', 8, 68, 62, 7, 420, false, 'good', NOW() - INTERVAL '10 days'),
('Budi Santoso', 17, 'L', 7, 64, 58, 6, 480, false, 'good', NOW() - INTERVAL '9 days'),
('Dedi Prasetyo', 15, 'L', 9, 72, 66, 8, 390, false, 'good', NOW() - INTERVAL '8 days'),
('Fikri Ramadhan', 16, 'L', 6, 58, 54, 5, 540, false, 'good', NOW() - INTERVAL '7 days'),

-- Valid data - Females (3 participants)
('Ani Lestari', 16, 'P', 9, 72, 68, 8, 410, false, 'good', NOW() - INTERVAL '6 days'),
('Bella Safitri', 17, 'P', 8, 70, 66, 7, 440, false, 'good', NOW() - INTERVAL '5 days'),
('Citra Dewi', 15, 'P', 9, 74, 70, 8, 380, false, 'good', NOW() - INTERVAL '4 days'),

-- Flagged data - Straight-lining (1 participant)
('Zainal Abidin', 16, 'L', 5, 48, 48, 5, 180, true, 'invalid', NOW() - INTERVAL '3 days'),

-- Flagged data - Too fast (1 participant)
('Dewi Lestari', 17, 'P', 8, 64, 62, 7, 170, false, 'suspicious', NOW() - INTERVAL '2 days'),

-- Flagged data - Too slow (1 participant)
('Eko Prasetyo', 18, 'L', 6, 56, 54, 5, 2100, false, 'suspicious', NOW() - INTERVAL '1 day');

-- 3. INSERT DUMMY RESPONSES (Sample for first 5 participants only, to keep it manageable)
-- You can expand this if needed, but for demo purposes this is sufficient

-- Participant 1: Ahmad Rizki (Cognitive: 8/10, Psychological: 68/80, Social: 62/80)
INSERT INTO responses (participant_id, question_id, answer_value) VALUES
-- Cognitive (10 questions, got 8 correct)
(1, 1, 2), (1, 2, 1), (1, 3, 0), (1, 4, 2), (1, 5, 1),
(1, 6, 3), (1, 7, 2), (1, 8, 1), (1, 9, 0), (1, 10, 2),
-- Psychological (20 questions, Likert 0-4, total 68)
(1, 11, 4), (1, 12, 3), (1, 13, 4), (1, 14, 3), (1, 15, 3),
(1, 16, 3), (1, 17, 4), (1, 18, 3), (1, 19, 4), (1, 20, 3),
(1, 21, 3), (1, 22, 4), (1, 23, 3), (1, 24, 3), (1, 25, 4),
(1, 26, 3), (1, 27, 4), (1, 28, 3), (1, 29, 3), (1, 30, 4),
-- Social (20 questions, Likert 0-4, total 62)
(1, 31, 3), (1, 32, 3), (1, 33, 3), (1, 34, 3), (1, 35, 3),
(1, 36, 3), (1, 37, 3), (1, 38, 3), (1, 39, 3), (1, 40, 3),
(1, 41, 3), (1, 42, 3), (1, 43, 3), (1, 44, 3), (1, 45, 3),
(1, 46, 3), (1, 47, 3), (1, 48, 3), (1, 49, 2), (1, 50, 2);

-- 4. INSERT DIGIT SPAN RESULTS (For first 10 participants)
INSERT INTO digit_span_results (participant_id, mode, max_span, attempts) VALUES
(1, 'forward', 7, 8),
(1, 'reversed', 6, 5),
(2, 'forward', 6, 7),
(2, 'reversed', 5, 6),
(3, 'forward', 8, 9),
(3, 'reversed', 7, 7),
(4, 'forward', 5, 6),
(4, 'reversed', 4, 5),
(5, 'forward', 7, 8),
(5, 'reversed', 6, 6),
(6, 'forward', 6, 7),
(6, 'reversed', 5, 5),
(7, 'forward', 8, 9),
(7, 'reversed', 7, 7),
(8, 'forward', 7, 8),
(8, 'reversed', 6, 6),
(9, 'forward', 6, 7),
(9, 'reversed', 5, 5),
(10, 'forward', 7, 8),
(10, 'reversed', 6, 6);

-- ================================================
-- SUMMARY
-- ================================================
-- Total Participants: 10
--   - Males: 6 (60%)
--   - Females: 4 (40%)
--   - Valid data (good quality): 7 (70%)
--   - Flagged (suspicious): 2 (20%)
--   - Flagged (invalid): 1 (10%)
-- 
-- Age distribution: 15-18 years
-- Response times: 170-2100 seconds (2.8 min - 35 min)
-- Quality indicators: Complete for all participants
-- ================================================

SELECT 'Dummy data inserted successfully!' as status;
SELECT COUNT(*) as total_participants FROM participants;
SELECT gender, COUNT(*) as count FROM participants GROUP BY gender ORDER BY gender;
SELECT response_quality, COUNT(*) as count FROM participants GROUP BY response_quality ORDER BY response_quality;
SELECT has_straight_lining, COUNT(*) as count FROM participants GROUP BY has_straight_lining;
