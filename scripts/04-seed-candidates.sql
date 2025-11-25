-- Sample candidates for demonstration (you should replace these with real candidates)
INSERT INTO candidates (party_id, name, position) VALUES
-- D66
(1, 'Jan Paternotte', 1),
(1, 'Pepijn van Houwelingen', 2),
-- PVV
(2, 'Geert Wilders', 1),
(2, 'Derk Jan Eppink', 2),
-- Continue for other parties...
ON CONFLICT (party_id, name) DO NOTHING;
