-- Add phone_number column to votes table for phone-based duplicate detection
-- This enables primary duplicate detection based on phone number (hashed)

-- Add phone_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'votes' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE votes ADD COLUMN phone_number VARCHAR(255);
  END IF;
END $$;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_votes_phone_number ON votes(phone_number);

-- Update existing records to have a placeholder
UPDATE votes SET phone_number = 'legacy_' || user_session_id WHERE phone_number IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN votes.phone_number IS 'Hashed phone number for duplicate vote detection (primary check)';
