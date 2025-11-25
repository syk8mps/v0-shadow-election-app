-- Insert sample candidates for all 27 parties
-- This is a template file. INSTRUCTIONS: Replace candidate names with real politician names for each party.
-- Party IDs are 1-27. Adjust the display_order to match the official candidate list position.

INSERT INTO candidates (name, position, party_id) VALUES
-- D66 (Party ID: Look up from database, typically first in list)
('Kees Verhoeven', 1, (SELECT id FROM parties WHERE abbreviation = 'D66')),
('Sigrid Kaag', 2, (SELECT id FROM parties WHERE abbreviation = 'D66')),
('Rob Jetten', 3, (SELECT id FROM parties WHERE abbreviation = 'D66')),

-- PVV
('Geert Wilders', 1, (SELECT id FROM parties WHERE abbreviation = 'PVV')),
('Derk Jan Eppink', 2, (SELECT id FROM parties WHERE abbreviation = 'PVV')),
('Maikel Zijlstra', 3, (SELECT id FROM parties WHERE abbreviation = 'PVV')),

-- VVD
('Mark Rutte', 1, (SELECT id FROM parties WHERE abbreviation = 'VVD')),
('Klaas Dijkhoff', 2, (SELECT id FROM parties WHERE abbreviation = 'VVD')),
('Edith Schippers', 3, (SELECT id FROM parties WHERE abbreviation = 'VVD')),

-- GroenLinks / PvdA
('Frans Timmermans', 1, (SELECT id FROM parties WHERE abbreviation = 'GL/PvdA')),
('Attje Kuiken', 2, (SELECT id FROM parties WHERE abbreviation = 'GL/PvdA')),
('Bart Keizers', 3, (SELECT id FROM parties WHERE abbreviation = 'GL/PvdA')),

-- CDA
('Wopke Hoekstra', 1, (SELECT id FROM parties WHERE abbreviation = 'CDA')),
('Pieter Heerma', 2, (SELECT id FROM parties WHERE abbreviation = 'CDA')),
('Mona Keijzer', 3, (SELECT id FROM parties WHERE abbreviation = 'CDA')),

-- JA21
('Joram Recchioni', 1, (SELECT id FROM parties WHERE abbreviation = 'JA21')),
('Gidi Markuszower', 2, (SELECT id FROM parties WHERE abbreviation = 'JA21')),
('Ines Folsche', 3, (SELECT id FROM parties WHERE abbreviation = 'JA21')),

-- Forum voor Democratie
('Thierry Baudet', 1, (SELECT id FROM parties WHERE abbreviation = 'FvD')),
('Derk Jan Eppink', 2, (SELECT id FROM parties WHERE abbreviation = 'FvD')),
('Torsten Lock', 3, (SELECT id FROM parties WHERE abbreviation = 'FvD')),

-- BBB
('Caroline van der Plas', 1, (SELECT id FROM parties WHERE abbreviation = 'BBB')),
('Henk Bleker', 2, (SELECT id FROM parties WHERE abbreviation = 'BBB')),
('Derk Jan Eppink', 3, (SELECT id FROM parties WHERE abbreviation = 'BBB')),

-- DENK
('Tunahan Kuzu', 1, (SELECT id FROM parties WHERE abbreviation = 'DENK')),
('Selçuk Öztürk', 2, (SELECT id FROM parties WHERE abbreviation = 'DENK')),
('Öztürk Duygu', 3, (SELECT id FROM parties WHERE abbreviation = 'DENK')),

-- SGP
('Kees van der Staaij', 1, (SELECT id FROM parties WHERE abbreviation = 'SGP')),
('Wim van Beek', 2, (SELECT id FROM parties WHERE abbreviation = 'SGP')),
('Hanneke van Marel', 3, (SELECT id FROM parties WHERE abbreviation = 'SGP')),

-- Partij voor de Dieren
('Esther Ouwehand', 1, (SELECT id FROM parties WHERE abbreviation = 'PvdD')),
('Erik van Esch', 2, (SELECT id FROM parties WHERE abbreviation = 'PvdD')),
('Bas Eickhout', 3, (SELECT id FROM parties WHERE abbreviation = 'PvdD')),

-- ChristenUnie
('Gert-Jan Segers', 1, (SELECT id FROM parties WHERE abbreviation = 'CU')),
('Jetta Klijnsma', 2, (SELECT id FROM parties WHERE abbreviation = 'CU')),
('Pieter Grinwis', 3, (SELECT id FROM parties WHERE abbreviation = 'CU')),

-- SP
('Lilian Marijnissen', 1, (SELECT id FROM parties WHERE abbreviation = 'SP')),
('Roos van Essen', 2, (SELECT id FROM parties WHERE abbreviation = 'SP')),
('Michiel van Nispen', 3, (SELECT id FROM parties WHERE abbreviation = 'SP')),

-- 50PLUS
('Henk Krol', 1, (SELECT id FROM parties WHERE abbreviation = '50PLUS')),
('Bart van der Paardt', 2, (SELECT id FROM parties WHERE abbreviation = '50PLUS')),
('Cornelis Kieft', 3, (SELECT id FROM parties WHERE abbreviation = '50PLUS')),

-- Volt
('Nilüfer Gündoğan', 1, (SELECT id FROM parties WHERE abbreviation = 'VOLT')),
('Derk Jan Eppink', 2, (SELECT id FROM parties WHERE abbreviation = 'VOLT')),

-- BIJ1
('Sylvana Simons', 1, (SELECT id FROM parties WHERE abbreviation = 'BIJ1')),
('Kwame Asante-Boateng', 2, (SELECT id FROM parties WHERE abbreviation = 'BIJ1')),

-- NSC
('Pieter Omtzigt', 1, (SELECT id FROM parties WHERE abbreviation = 'NSC')),

-- BVNL
('Derk Jan Eppink', 1, (SELECT id FROM parties WHERE abbreviation = 'BVNL')),

-- Vrede voor Dieren
('Candidate Name', 1, (SELECT id FROM parties WHERE abbreviation = 'VvD')),

-- Piratenpartij
('Candidate Name', 1, (SELECT id FROM parties WHERE abbreviation = 'PIRAAT')),

-- FNP
('Candidate Name', 1, (SELECT id FROM parties WHERE abbreviation = 'FNP')),

-- Libertaire Partij
('Candidate Name', 1, (SELECT id FROM parties WHERE abbreviation = 'LP')),

-- DE LINIE
('Candidate Name', 1, (SELECT id FROM parties WHERE abbreviation = 'LINIE')),

-- NL PLAN
('Candidate Name', 1, (SELECT id FROM parties WHERE abbreviation = 'PLAN')),

-- Vrij Verbond
('Candidate Name', 1, (SELECT id FROM parties WHERE abbreviation = 'VV')),

-- ELLECT
('Candidate Name', 1, (SELECT id FROM parties WHERE abbreviation = 'ELLECT')),

-- Partij voor de Rechtsstaat
('Candidate Name', 1, (SELECT id FROM parties WHERE abbreviation = 'PvdR'))
ON CONFLICT DO NOTHING;
