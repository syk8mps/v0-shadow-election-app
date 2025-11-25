-- Insert all 27 participating parties for Dutch 2025 elections
-- Updated party names to exact official names and improved color palette for better distinctiveness
DELETE FROM votes;
DELETE FROM parties;
ALTER SEQUENCE parties_id_seq RESTART WITH 1;

INSERT INTO parties (name, abbreviation, color) VALUES
('PVV', 'PVV', '#FF4444'),
('GROENLINKS / PvdA', 'GL-PvdA', '#FF8C3A'),
('VVD', 'VVD', '#0047AB'),
('Nieuw Sociaal Contract', 'NSC', '#00A86B'),
('D66', 'D66', '#97C000'),
('BoerBurgerBeweging', 'BBB', '#FFB81C'),
('CDA', 'CDA', '#009ACD'),
('Socialistische Partij', 'SP', '#EE1C25'),
('DENK', 'DENK', '#4B9BFF'),
('Partij voor de Dieren', 'PvdD', '#70C649'),
('Forum voor Democratie', 'FvD', '#0F4A38'),
('Staatkundig Gereformeerde Partij', 'SGP', '#003DA5'),
('ChristenUnie', 'CU', '#FF8000'),
('Volt', 'Volt', '#9C27B0'),
('JA21', 'JA21', '#C41E3A'),
('Vrede voor Dieren', 'VvD', '#FF69B4'),
('Belang Van Nederland', 'BVNL', '#1E90FF'),
('BIJ1', 'BIJ1', '#FFD700'),
('Libertaire Partij', 'LP', '#8B4513'),
('50PLUS', '50PLUS', '#00CED1'),
('Piratenpartij', 'PP', '#000000'),
('Fryske Nasjonale Partij', 'FNP', '#DC143C'),
('Vrij Verbond', 'VV', '#FF00FF'),
('DE LINIE', 'DL', '#20B2AA'),
('NL PLAN', 'NLP', '#FF4500'),
('ELLECT', 'ELLECT', '#4169E1'),
('Partij voor de Rechtsstaat', 'PvdR', '#808080');
