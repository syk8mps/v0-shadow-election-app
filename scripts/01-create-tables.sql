-- Create parties table
CREATE TABLE IF NOT EXISTS parties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  abbreviation VARCHAR(20) NOT NULL UNIQUE,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  party_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  user_session_id VARCHAR(255) NOT NULL,
  vote_party_id INTEGER NOT NULL,
  counter_party_id INTEGER NOT NULL,
  vote_candidate_id INTEGER,
  counter_candidate_id INTEGER,
  phone_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vote_party_id) REFERENCES parties(id),
  FOREIGN KEY (counter_party_id) REFERENCES parties(id),
  FOREIGN KEY (vote_candidate_id) REFERENCES candidates(id),
  FOREIGN KEY (counter_candidate_id) REFERENCES candidates(id),
  UNIQUE(user_session_id)
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value)
VALUES 
  ('results_visible', 'false'),
  ('turnstile_enabled', 'true')
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_votes_user_session ON votes(user_session_id);
CREATE INDEX IF NOT EXISTS idx_votes_parties ON votes(vote_party_id, counter_party_id);
CREATE INDEX IF NOT EXISTS idx_votes_phone_number ON votes(phone_number);
CREATE INDEX IF NOT EXISTS idx_candidates_party ON candidates(party_id);
-- Add index for admin_settings lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);
