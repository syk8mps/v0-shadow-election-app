-- Add phone_number column to votes table to track which phone numbers have voted
ALTER TABLE votes ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_votes_phone_number ON votes(phone_number);
