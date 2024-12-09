-- First, drop existing views if they exist to avoid conflicts
DROP VIEW IF EXISTS v_hotel_månedlig_omsætning;
DROP VIEW IF EXISTS v_populære_værelser;
DROP VIEW IF EXISTS v_cykel_statistik;
DROP VIEW IF EXISTS v_konference_oversigt;
DROP VIEW IF EXISTS v_hotel_personale_oversigt;
DROP VIEW IF EXISTS v_gæster;
DROP VIEW IF EXISTS v_hoteller;
DROP VIEW IF EXISTS v_værelser;

-- Then create views in the correct order (most basic views first)
-- Basic views for reference data
CREATE VIEW v_gæster AS
SELECT gæste_id, fornavn, efternavn, status
FROM gæster
ORDER BY gæste_id;

CREATE VIEW v_hoteller AS
SELECT hotel_id, hotel_navn, hotel_type
FROM hoteller
ORDER BY hotel_id;

CREATE VIEW v_værelser AS
SELECT værelse_id, værelse_type, hotel_id
FROM værelser
ORDER BY hotel_id, værelse_id;

-- More complex views that depend on the basic tables
CREATE VIEW v_hotel_månedlig_omsætning AS
WITH RECURSIVE date_range AS (
    SELECT DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH) as date
    UNION ALL
    SELECT DATE_ADD(date, INTERVAL 1 MONTH)
    FROM date_range
    WHERE date < DATE_ADD(CURRENT_DATE, INTERVAL 6 MONTH)
),
months AS (
    SELECT DISTINCT DATE_FORMAT(date, '%Y-%m') as måned
    FROM date_range
)
SELECT 
    h.hotel_id,
    h.hotel_navn,
    m.måned,
    COUNT(b.booking_id) as antal_bookinger,
    COALESCE(SUM(b.total_pris), 0) as total_omsætning,
    COALESCE(ROUND(AVG(b.total_pris), 2), 0) as gennemsnit_per_booking
FROM hoteller h
CROSS JOIN months m
LEFT JOIN bookinger b ON h.hotel_id = b.hotel_id 
    AND b.booking_status = 'Bekræftet'
    AND DATE_FORMAT(b.check_ind_dato, '%Y-%m') = m.måned
GROUP BY h.hotel_id, h.hotel_navn, m.måned
ORDER BY h.hotel_id, m.måned;

-- View der viser populære værelses typer per hotel
CREATE OR REPLACE VIEW v_populære_værelser AS
SELECT 
    h.hotel_id,
    h.hotel_navn,
    v.værelse_type,
    COUNT(b.booking_id) as antal_bookinger,
    ROUND(AVG(b.total_pris), 2) as gennemsnits_pris,
    ROUND(COUNT(b.booking_id) * 100.0 / SUM(COUNT(b.booking_id)) OVER (PARTITION BY h.hotel_id), 2) as booking_procent
FROM værelser v
JOIN hoteller h ON v.hotel_id = h.hotel_id
LEFT JOIN bookinger b ON v.værelse_id = b.værelse_id 
    AND v.hotel_id = b.hotel_id
    AND b.booking_status = 'Bekræftet'
GROUP BY h.hotel_id, h.hotel_navn, v.værelse_type
ORDER BY h.hotel_id, booking_procent DESC;

-- View der viser cykel udlejnings statistik per hotel
CREATE OR REPLACE VIEW v_cykel_statistik AS
SELECT 
    b.hotel_id,
    h.hotel_navn,
    c.cykel_type,
    COUNT(*) as antal_cykler,
    SUM(CASE WHEN c.status = 'Udlejet' THEN 1 ELSE 0 END) as antal_udlejede,
    SUM(CASE WHEN c.status = 'Ledig' THEN 1 ELSE 0 END) as antal_ledige,
    ROUND(AVG(DATEDIFF(c.udlejnings_slut_dato, c.udlejnings_start_dato)), 1) as gns_udlejnings_dage
FROM cykel_udlejning c
JOIN gæster g ON c.gæste_id = g.gæste_id
JOIN bookinger b ON g.gæste_id = b.gæste_id
JOIN hoteller h ON b.hotel_id = h.hotel_id
GROUP BY b.hotel_id, h.hotel_navn, c.cykel_type
ORDER BY h.hotel_id, c.cykel_type;

-- View der viser konference booking oversigt per hotel
CREATE OR REPLACE VIEW v_konference_oversigt AS
SELECT 
    h.hotel_id,
    h.hotel_navn,
    k.konference_id,
    CONCAT(g.fornavn, ' ', g.efternavn) as gæst_navn,
    k.start_dato,
    k.slut_dato,
    k.antal_gæster,
    k.forplejning,
    k.udstyr,
    k.kunde_ønsker
FROM konference_bookinger k
JOIN hoteller h ON k.hotel_id = h.hotel_id
JOIN gæster g ON k.gæste_id = g.gæste_id
ORDER BY h.hotel_id, k.start_dato;

-- View der viser personale oversigt per hotel
CREATE OR REPLACE VIEW v_hotel_personale_oversigt AS
SELECT 
    h.hotel_id,
    h.hotel_navn,
    hp.stillingsbetegnelse,
    COUNT(*) as antal_ansatte,
    ROUND(AVG(hp.løn), 2) as gennemsnitsløn,
    MIN(hp.ansættelsesdato) as længst_ansættelse,
    MAX(hp.ansættelsesdato) as seneste_ansættelse
FROM hotel_personale hp
JOIN hoteller h ON hp.hotel_id = h.hotel_id
GROUP BY h.hotel_id, h.hotel_navn, hp.stillingsbetegnelse
ORDER BY h.hotel_id, hp.stillingsbetegnelse; 