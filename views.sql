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

-- First, let's add some trend analysis views
CREATE OR REPLACE VIEW v_booking_trends AS
SELECT 
    DATE_FORMAT(check_ind_dato, '%Y-%m') as booking_måned,
    COUNT(*) as antal_bookinger,
    SUM(total_pris) as samlet_omsætning,
    ROUND(AVG(total_pris), 2) as gennemsnit_pris,
    COUNT(DISTINCT gæste_id) as unikke_gæster,
    SUM(CASE WHEN online_booking = 1 THEN 1 ELSE 0 END) as online_bookinger,
    ROUND(AVG(DATEDIFF(check_ud_dato, check_ind_dato)), 1) as gns_opholdslængde
FROM bookinger
WHERE check_ind_dato >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(check_ind_dato, '%Y-%m')
ORDER BY booking_måned;

-- Add seasonal analysis view
CREATE OR REPLACE VIEW v_sæson_analyse AS
SELECT 
    h.hotel_navn,
    CASE 
        WHEN MONTH(b.check_ind_dato) IN (12,1,2) THEN 'Vinter'
        WHEN MONTH(b.check_ind_dato) IN (3,4,5) THEN 'Forår'
        WHEN MONTH(b.check_ind_dato) IN (6,7,8) THEN 'Sommer'
        ELSE 'Efterår'
    END as sæson,
    COUNT(*) as antal_bookinger,
    ROUND(AVG(b.total_pris), 2) as gns_pris,
    ROUND(SUM(b.total_pris), 2) as total_omsætning,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY h.hotel_id), 2) as sæson_fordeling_pct
FROM bookinger b
JOIN hoteller h ON b.hotel_id = h.hotel_id
WHERE b.check_ind_dato >= DATE_SUB(CURDATE(), INTERVAL 24 MONTH)
GROUP BY 
    h.hotel_navn,
    CASE 
        WHEN MONTH(b.check_ind_dato) IN (12,1,2) THEN 'Vinter'
        WHEN MONTH(b.check_ind_dato) IN (3,4,5) THEN 'Forår'
        WHEN MONTH(b.check_ind_dato) IN (6,7,8) THEN 'Sommer'
        ELSE 'Efterår'
    END;

-- Add customer segmentation view
CREATE OR REPLACE VIEW v_kunde_segmentering AS
SELECT 
    g.status as kunde_segment,
    COUNT(DISTINCT g.gæste_id) as antal_kunder,
    COUNT(b.booking_id) as antal_bookinger,
    ROUND(AVG(b.total_pris), 2) as gns_ordreværdi,
    ROUND(SUM(b.total_pris), 2) as total_omsætning,
    ROUND(COUNT(b.booking_id) * 100.0 / SUM(COUNT(b.booking_id)) OVER (), 2) as booking_andel_pct
FROM gæster g
LEFT JOIN bookinger b ON g.gæste_id = b.gæste_id
GROUP BY g.status;

-- Add room type performance analysis
CREATE OR REPLACE VIEW v_værelse_performance AS
SELECT 
    h.hotel_navn,
    v.værelse_type,
    COUNT(DISTINCT v.værelse_id) as antal_værelser,
    COUNT(b.booking_id) as antal_bookinger,
    ROUND(AVG(b.total_pris), 2) as gns_pris_pr_booking,
    ROUND(SUM(b.total_pris), 2) as total_omsætning,
    ROUND(COUNT(b.booking_id) * 100.0 / 
        (SELECT COUNT(*) FROM bookinger WHERE hotel_id = h.hotel_id), 2) as booking_andel_pct
FROM værelser v
LEFT JOIN bookinger b ON v.værelse_id = b.værelse_id AND v.hotel_id = b.hotel_id
JOIN hoteller h ON v.hotel_id = h.hotel_id
GROUP BY h.hotel_navn, v.værelse_type;

-- Add revenue per available room (RevPAR) analysis
CREATE OR REPLACE VIEW v_revpar_analyse AS
WITH DagligOmsætning AS (
    SELECT 
        h.hotel_id,
        h.hotel_navn,
        DATE(b.check_ind_dato) as dato,
        SUM(b.total_pris / DATEDIFF(b.check_ud_dato, b.check_ind_dato)) as daglig_omsætning,
        COUNT(DISTINCT v.værelse_id) as tilgængelige_værelser
    FROM hoteller h
    JOIN værelser v ON h.hotel_id = v.hotel_id
    LEFT JOIN bookinger b ON v.værelse_id = b.værelse_id 
        AND v.hotel_id = b.hotel_id
        AND b.check_ind_dato <= CURDATE()
        AND b.check_ud_dato > CURDATE()
    WHERE b.check_ind_dato >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY h.hotel_id, h.hotel_navn, DATE(b.check_ind_dato)
)
SELECT 
    hotel_navn,
    ROUND(AVG(daglig_omsætning / tilgængelige_værelser), 2) as revpar,
    ROUND(SUM(daglig_omsætning), 2) as total_omsætning,
    ROUND(AVG(daglig_omsætning), 2) as gns_daglig_omsætning
FROM DagligOmsætning
GROUP BY hotel_id, hotel_navn; 

-- Tilføj indexes for ofte brugte views
CREATE INDEX idx_booking_date_range ON bookinger (check_ind_dato, check_ud_dato, booking_status);
CREATE INDEX idx_hotel_room_type ON værelser (hotel_id, værelse_type);

-- Optimer v_hotel_månedlig_omsætning med materialized view
CREATE TABLE mv_hotel_månedlig_omsætning (
    hotel_id INT,
    hotel_navn VARCHAR(100),
    måned VARCHAR(7),
    antal_bookinger INT,
    total_omsætning DECIMAL(10,2),
    gennemsnit_per_booking DECIMAL(10,2),
    last_updated TIMESTAMP,
    PRIMARY KEY (hotel_id, måned)
); 