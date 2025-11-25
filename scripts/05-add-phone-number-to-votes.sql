-- Add phone_number column to existing votes table
ALTER TABLE votes ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) DEFAULT 'test_user';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_votes_phone_number ON votes(phone_number);

-- Update existing records to have test_user as phone number
UPDATE votes SET phone_number = 'test_user' WHERE phone_number IS NULL;
