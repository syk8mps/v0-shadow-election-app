-- Add candidates table for tracking votes on individual politicians
CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  party_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  position INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (party_id) REFERENCES parties(id),
  UNIQUE(party_id, name)
);

-- Update votes table to support candidate votes
ALTER TABLE votes ADD COLUMN IF NOT EXISTS vote_candidate_id INTEGER;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS counter_candidate_id INTEGER;
ALTER TABLE votes ADD FOREIGN KEY (vote_candidate_id) REFERENCES candidates(id);
ALTER TABLE votes ADD FOREIGN KEY (counter_candidate_id) REFERENCES candidates(id);

-- Add admin settings table for controlling result visibility
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add logo_url column to parties table
ALTER TABLE parties ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);
ALTER TABLE parties ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 999;

-- Insert initial admin settings
INSERT INTO admin_settings (setting_key, setting_value) 
VALUES ('results_visible', 'false'), ('admin_password', 'changeme')
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for candidates lookup
CREATE INDEX IF NOT EXISTS idx_candidates_party ON candidates(party_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidates ON votes(vote_candidate_id, counter_candidate_id);
