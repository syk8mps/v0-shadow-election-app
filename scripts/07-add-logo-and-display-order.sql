-- Add logo_url and display_order columns if they don't exist
ALTER TABLE parties 
ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 999;

-- Update display_order based on the specified party order
UPDATE parties SET display_order = 1 WHERE abbreviation = 'D66';
UPDATE parties SET display_order = 2 WHERE abbreviation = 'PVV';
UPDATE parties SET display_order = 3 WHERE abbreviation = 'VVD';
UPDATE parties SET display_order = 4 WHERE abbreviation = 'PVDA';
UPDATE parties SET display_order = 5 WHERE abbreviation = 'CDA';
UPDATE parties SET display_order = 6 WHERE abbreviation = 'JA21';
UPDATE parties SET display_order = 7 WHERE abbreviation = 'FVD';
UPDATE parties SET display_order = 8 WHERE abbreviation = 'BBB';
UPDATE parties SET display_order = 9 WHERE abbreviation = 'DENK';
UPDATE parties SET display_order = 10 WHERE abbreviation = 'SGP';
UPDATE parties SET display_order = 11 WHERE abbreviation = 'PDD';
UPDATE parties SET display_order = 12 WHERE abbreviation = 'CU';
UPDATE parties SET display_order = 13 WHERE abbreviation = 'SP';
UPDATE parties SET display_order = 14 WHERE abbreviation = '50PLUS';
UPDATE parties SET display_order = 15 WHERE abbreviation = 'VOLT';
UPDATE parties SET display_order = 16 WHERE abbreviation = 'BIJ1';
UPDATE parties SET display_order = 17 WHERE abbreviation = 'NSC';
UPDATE parties SET display_order = 18 WHERE abbreviation = 'BVNL';
UPDATE parties SET display_order = 19 WHERE abbreviation = 'VVD2';
UPDATE parties SET display_order = 20 WHERE abbreviation = 'PIRAT';
UPDATE parties SET display_order = 21 WHERE abbreviation = 'FNP';
UPDATE parties SET display_order = 22 WHERE abbreviation = 'LP';
UPDATE parties SET display_order = 23 WHERE abbreviation = 'LINIE';
UPDATE parties SET display_order = 24 WHERE abbreviation = 'NLPLAN';
UPDATE parties SET display_order = 25 WHERE abbreviation = 'VRIJ';
UPDATE parties SET display_order = 26 WHERE abbreviation = 'ELLECT';
UPDATE parties SET display_order = 27 WHERE abbreviation = 'PVR';
