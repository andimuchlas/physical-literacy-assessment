-- ================================================
-- ADD WEIGHT AND HEIGHT COLUMNS TO PARTICIPANTS TABLE
-- Physical Literacy Assessment
-- ================================================

-- Add weight column (in kg)
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2);

-- Add height column (in cm)
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2);

-- Add comments for documentation
COMMENT ON COLUMN participants.weight IS 'Berat badan peserta dalam kilogram (kg)';
COMMENT ON COLUMN participants.height IS 'Tinggi badan peserta dalam sentimeter (cm)';

-- Optional: Add constraints
ALTER TABLE participants 
ADD CONSTRAINT check_weight_range CHECK (weight >= 20 AND weight <= 200);

ALTER TABLE participants 
ADD CONSTRAINT check_height_range CHECK (height >= 50 AND height <= 250);

-- Verify the changes
SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'participants'
AND column_name IN ('weight', 'height');
