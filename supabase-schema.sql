-- Database Schema for Physical Literacy Assessment System
-- Run these SQL commands in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  cognitive_score INTEGER DEFAULT 0,
  psychological_score INTEGER DEFAULT 0,
  social_score INTEGER DEFAULT 0,
  digit_span_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  domain VARCHAR(50) NOT NULL CHECK (domain IN ('cognitive', 'psychological', 'social')),
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'likert')),
  options JSONB, -- For multiple choice: ["Option A", "Option B", "Option C", "Option D"]
  correct_answer INTEGER, -- For cognitive questions (0-based index)
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
  id BIGSERIAL PRIMARY KEY,
  participant_id BIGINT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_value INTEGER NOT NULL, -- Index of selected option or Likert value (0-4)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create digit_span_results table
CREATE TABLE IF NOT EXISTS digit_span_results (
  id BIGSERIAL PRIMARY KEY,
  participant_id BIGINT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('forward', 'reversed')),
  max_span INTEGER NOT NULL,
  attempts INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(domain);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(order_index);
CREATE INDEX IF NOT EXISTS idx_responses_participant ON responses(participant_id);
CREATE INDEX IF NOT EXISTS idx_digit_span_participant ON digit_span_results(participant_id);

-- Insert sample cognitive questions (multiple choice)
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

-- Insert sample psychological questions (Likert 0-4)
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

-- Insert sample social questions (Likert 0-4)
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

-- Enable Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE digit_span_results ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only for questions)
CREATE POLICY "Enable read access for all users" ON questions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON digit_span_results FOR INSERT WITH CHECK (true);

-- For admin access, you'll need to create policies based on authenticated users
-- This will be set up after creating admin authentication
