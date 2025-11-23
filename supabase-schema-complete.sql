-- ================================================
-- COMPLETE DATABASE SCHEMA
-- Physical Literacy Assessment System
-- ================================================
-- INSTRUKSI: Copy semua script ini dan jalankan di Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. CREATE TABLES
-- ================================================

-- Table: participants
CREATE TABLE IF NOT EXISTS participants (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(10),
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  cognitive_score INTEGER DEFAULT 0,
  psychological_score INTEGER DEFAULT 0,
  social_score INTEGER DEFAULT 0,
  digit_span_score INTEGER DEFAULT 0,
  response_time_seconds INTEGER,
  has_straight_lining BOOLEAN DEFAULT FALSE,
  response_quality VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: questions
CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  domain VARCHAR(50) NOT NULL CHECK (domain IN ('cognitive', 'psychological', 'social')),
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'likert')),
  options JSONB,
  correct_answer INTEGER,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: responses
CREATE TABLE IF NOT EXISTS responses (
  id BIGSERIAL PRIMARY KEY,
  participant_id BIGINT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: digit_span_results
CREATE TABLE IF NOT EXISTS digit_span_results (
  id BIGSERIAL PRIMARY KEY,
  participant_id BIGINT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('forward', 'reversed')),
  max_span INTEGER NOT NULL,
  attempts INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 2. ADD CONSTRAINTS
-- ================================================

-- Weight constraints (20-200 kg)
ALTER TABLE participants 
DROP CONSTRAINT IF EXISTS check_weight_range;

ALTER TABLE participants 
ADD CONSTRAINT check_weight_range CHECK (weight IS NULL OR (weight >= 20 AND weight <= 200));

-- Height constraints (50-250 cm)
ALTER TABLE participants 
DROP CONSTRAINT IF EXISTS check_height_range;

ALTER TABLE participants 
ADD CONSTRAINT check_height_range CHECK (height IS NULL OR (height >= 50 AND height <= 250));

-- Response quality constraints
ALTER TABLE participants 
DROP CONSTRAINT IF EXISTS participants_response_quality_check;

ALTER TABLE participants 
ADD CONSTRAINT participants_response_quality_check CHECK (response_quality IS NULL OR response_quality IN ('good', 'suspicious', 'invalid'));

-- ================================================
-- 3. CREATE INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_gender ON participants(gender);
CREATE INDEX IF NOT EXISTS idx_participants_response_quality ON participants(response_quality);
CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(domain);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(order_index);
CREATE INDEX IF NOT EXISTS idx_responses_participant ON responses(participant_id);
CREATE INDEX IF NOT EXISTS idx_responses_question ON responses(question_id);
CREATE INDEX IF NOT EXISTS idx_digit_span_participant ON digit_span_results(participant_id);

-- ================================================
-- 4. ADD COMMENTS
-- ================================================

COMMENT ON TABLE participants IS 'Tabel data peserta assessment';
COMMENT ON COLUMN participants.weight IS 'Berat badan peserta dalam kilogram (kg)';
COMMENT ON COLUMN participants.height IS 'Tinggi badan peserta dalam sentimeter (cm)';
COMMENT ON COLUMN participants.response_quality IS 'Kualitas respons: good, suspicious, invalid';
COMMENT ON COLUMN participants.has_straight_lining IS 'Indikator straight-lining (jawaban monoton)';

-- ================================================
-- 5. INSERT SAMPLE QUESTIONS
-- ================================================

-- Delete existing questions if any
TRUNCATE TABLE questions CASCADE;

-- Insert cognitive questions (multiple choice)
INSERT INTO questions (domain, question_text, question_type, options, correct_answer, order_index) VALUES
('cognitive', 'Apa nama olahraga yang menggunakan raket dan kok?', 'multiple_choice', '["Tenis", "Badminton", "Squash", "Tenis Meja"]', 1, 1),
('cognitive', 'Berapa jumlah pemain dalam satu tim sepak bola?', 'multiple_choice', '["9 orang", "10 orang", "11 orang", "12 orang"]', 2, 2),
('cognitive', 'Apa nama gerakan dasar dalam lari?', 'multiple_choice', '["Melompat", "Melangkah", "Mengayuh", "Berenang"]', 1, 3),
('cognitive', 'Olahraga apa yang dilakukan di air?', 'multiple_choice', '["Basket", "Voli", "Renang", "Badminton"]', 2, 4),
('cognitive', 'Apa fungsi pemanasan sebelum olahraga?', 'multiple_choice', '["Mendinginkan tubuh", "Mengistirahatkan otot", "Mempersiapkan tubuh", "Menambah berat badan"]', 2, 5),
('cognitive', 'Berapa lama waktu yang ideal untuk berolahraga setiap hari?', 'multiple_choice', '["10 menit", "30 menit", "2 jam", "4 jam"]', 1, 6),
('cognitive', 'Apa yang harus dilakukan setelah berolahraga?', 'multiple_choice', '["Makan banyak", "Pendinginan", "Tidur langsung", "Main game"]', 1, 7),
('cognitive', 'Olahraga apa yang baik untuk melatih keseimbangan?', 'multiple_choice', '["Yoga", "Lari", "Sepak bola", "Basket"]', 0, 8),
('cognitive', 'Apa manfaat utama dari berolahraga teratur?', 'multiple_choice', '["Menambah uang", "Menjaga kesehatan", "Membuat lelah", "Menambah tinggi badan"]', 1, 9),
('cognitive', 'Berapa kali seminggu sebaiknya anak berolahraga?', 'multiple_choice', '["1 kali", "3-5 kali", "Setiap hari tanpa istirahat", "Tidak perlu"]', 1, 10);

-- Insert psychological questions (Likert 0-4)
INSERT INTO questions (domain, question_text, question_type, order_index) VALUES
('psychological', 'Saya merasa senang ketika berolahraga', 'likert', 1),
('psychological', 'Saya percaya diri dengan kemampuan olahraga saya', 'likert', 2),
('psychological', 'Saya menikmati aktivitas fisik di sekolah', 'likert', 3),
('psychological', 'Saya merasa bersemangat untuk mencoba olahraga baru', 'likert', 4),
('psychological', 'Saya tidak mudah menyerah saat belajar gerakan baru', 'likert', 5),
('psychological', 'Saya merasa bangga ketika berhasil melakukan gerakan olahraga', 'likert', 6),
('psychological', 'Saya tidak takut membuat kesalahan saat berolahraga', 'likert', 7),
('psychological', 'Saya termotivasi untuk meningkatkan kemampuan olahraga', 'likert', 8),
('psychological', 'Saya merasa nyaman saat berpartisipasi dalam aktivitas fisik', 'likert', 9),
('psychological', 'Saya percaya bahwa olahraga penting untuk kesehatan', 'likert', 10),
('psychological', 'Saya suka tantangan dalam olahraga', 'likert', 11),
('psychological', 'Saya merasa bahagia setelah berolahraga', 'likert', 12),
('psychological', 'Saya tidak cemas saat mengikuti kompetisi olahraga', 'likert', 13),
('psychological', 'Saya yakin dapat mencapai target olahraga saya', 'likert', 14),
('psychological', 'Saya merasa energik setelah melakukan aktivitas fisik', 'likert', 15),
('psychological', 'Saya menikmati proses belajar keterampilan olahraga baru', 'likert', 16),
('psychological', 'Saya merasa rileks ketika berolahraga', 'likert', 17),
('psychological', 'Saya bangga dengan pencapaian olahraga saya', 'likert', 18),
('psychological', 'Saya termotivasi oleh teman-teman saat berolahraga', 'likert', 19),
('psychological', 'Saya merasa olahraga membuat saya lebih bahagia', 'likert', 20);

-- Insert social questions (Likert 0-4)
INSERT INTO questions (domain, question_text, question_type, order_index) VALUES
('social', 'Saya suka berolahraga bersama teman-teman', 'likert', 1),
('social', 'Saya dapat bekerja sama dengan baik dalam tim olahraga', 'likert', 2),
('social', 'Saya menghormati lawan saat berkompetisi', 'likert', 3),
('social', 'Saya membantu teman yang kesulitan saat berolahraga', 'likert', 4),
('social', 'Saya dapat berkomunikasi dengan baik dalam tim', 'likert', 5),
('social', 'Saya menghargai pendapat teman dalam olahraga', 'likert', 6),
('social', 'Saya menerima kekalahan dengan sportif', 'likert', 7),
('social', 'Saya mendukung teman saat mereka bermain', 'likert', 8),
('social', 'Saya dapat berbagi peralatan olahraga dengan teman', 'likert', 9),
('social', 'Saya mengikuti aturan permainan dengan baik', 'likert', 10),
('social', 'Saya merasa nyaman bermain dengan teman baru', 'likert', 11),
('social', 'Saya dapat menyelesaikan konflik dengan baik saat berolahraga', 'likert', 12),
('social', 'Saya menghargai kemampuan olahraga teman-teman', 'likert', 13),
('social', 'Saya senang mengajarkan olahraga kepada teman', 'likert', 14),
('social', 'Saya dapat menerima kritik dari teman atau pelatih', 'likert', 15),
('social', 'Saya aktif berkontribusi dalam kegiatan olahraga kelompok', 'likert', 16),
('social', 'Saya menghormati keputusan wasit atau guru olahraga', 'likert', 17),
('social', 'Saya dapat bermain dengan adil tanpa curang', 'likert', 18),
('social', 'Saya senang berkenalan dengan orang baru melalui olahraga', 'likert', 19),
('social', 'Saya dapat menjadi pemimpin yang baik dalam tim olahraga', 'likert', 20);

-- ================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE digit_span_results ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 7. CREATE RLS POLICIES
-- ================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON questions;
DROP POLICY IF EXISTS "Enable insert for all users" ON participants;
DROP POLICY IF EXISTS "Enable insert for all users" ON responses;
DROP POLICY IF EXISTS "Enable insert for all users" ON digit_span_results;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON participants;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON responses;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON digit_span_results;

-- Public read for questions
CREATE POLICY "Enable read access for all users" ON questions FOR SELECT USING (true);

-- Public insert for participants, responses, digit_span_results
CREATE POLICY "Enable insert for all users" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON digit_span_results FOR INSERT WITH CHECK (true);

-- Authenticated users can read all data (for admin dashboard)
CREATE POLICY "Enable read for authenticated users" ON participants FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON responses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON digit_span_results FOR SELECT USING (auth.role() = 'authenticated');

-- ================================================
-- 8. VERIFY INSTALLATION
-- ================================================

-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('participants', 'questions', 'responses', 'digit_span_results');

-- Check participants columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'participants'
ORDER BY ordinal_position;

-- Check questions count
SELECT domain, COUNT(*) as total
FROM questions
GROUP BY domain
ORDER BY domain;

-- Sample query
SELECT 
  'participants' as table_name, COUNT(*) as row_count FROM participants
UNION ALL
SELECT 'questions', COUNT(*) FROM questions
UNION ALL
SELECT 'responses', COUNT(*) FROM responses
UNION ALL
SELECT 'digit_span_results', COUNT(*) FROM digit_span_results;

-- ================================================
-- INSTALLATION COMPLETE! ✅
-- ================================================
-- Next steps:
-- 1. Verify all tables created successfully
-- 2. Check questions inserted (should be 50 questions)
-- 3. Test insert a participant from the app
-- 4. Create admin user for dashboard access
-- ================================================
