-- Expand client_ip column to store device fingerprints
ALTER TABLE votes 
ALTER COLUMN client_ip TYPE VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_votes_client_ip ON votes(client_ip);
