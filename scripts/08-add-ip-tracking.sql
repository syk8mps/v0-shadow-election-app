-- Add IP tracking to votes table for duplicate vote prevention
ALTER TABLE votes ADD COLUMN IF NOT EXISTS client_ip VARCHAR(45);

-- Create index for fast IP lookups
CREATE INDEX IF NOT EXISTS idx_votes_client_ip ON votes(client_ip);
