-- Add phone_number column to votes table if it doesn't exist
ALTER TABLE votes ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_votes_phone_number ON votes(phone_number);
