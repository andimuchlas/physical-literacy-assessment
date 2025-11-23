-- ================================================
-- ADD WEIGHT AND HEIGHT COLUMNS ONLY
-- Physical Literacy Assessment
-- ================================================
-- Script ini AMAN untuk database yang sudah ada data
-- Hanya menambahkan kolom weight dan height tanpa menghapus data
-- ================================================

-- Add weight column (berat badan dalam kg)
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2);

-- Add height column (tinggi badan dalam cm)
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2);

-- Add comments untuk dokumentasi
COMMENT ON COLUMN participants.weight IS 'Berat badan peserta dalam kilogram (kg)';
COMMENT ON COLUMN participants.height IS 'Tinggi badan peserta dalam sentimeter (cm)';

-- Add constraints untuk validasi (optional - bisa dihapus jika tidak perlu)
ALTER TABLE participants 
DROP CONSTRAINT IF EXISTS check_weight_range;

ALTER TABLE participants 
ADD CONSTRAINT check_weight_range CHECK (weight IS NULL OR (weight >= 20 AND weight <= 200));

ALTER TABLE participants 
DROP CONSTRAINT IF EXISTS check_height_range;

ALTER TABLE participants 
ADD CONSTRAINT check_height_range CHECK (height IS NULL OR (height >= 50 AND height <= 250));

-- Verify kolom sudah ditambahkan
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'participants'
AND column_name IN ('weight', 'height');

-- Check jumlah data tidak berkurang
SELECT COUNT(*) as total_participants FROM participants;

-- ================================================
-- SELESAI! ✅
-- ================================================
-- Kolom weight dan height berhasil ditambahkan
-- Data yang sudah ada TIDAK TERGANGGU
-- Kolom weight dan height akan berisi NULL untuk data lama
-- Data baru akan otomatis menyimpan weight dan height
-- ================================================
