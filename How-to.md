# Test Lab Guide - Hotel Database System

## 1. Opsætning af Testmiljø

### 1.1 Forudsætninger
- MariaDB 11.1.2
- DBBeaver eller Beekeeper Studio
- Minimum 4GB fri diskplads
- Administratorrettigheder til databasen

### 1.2 Initial Database Oprettelse
```sql
-- Opret database med korrekt tegnsæt
CREATE DATABASE CBZHotels
CHARACTER SET utf8mb4
COLLATE utf8mb4_danish_ci;

-- Brug databasen
USE CBZHotels;
```

## 2. Installation af Skemaer

### 2.1 Rækkefølge for Installation
1. Kør `Database.sql` - opretter tabeller og constraints
2. Kør `views.sql` - opretter alle views
3. Kør `procedures.sql` - opretter stored procedures
4. Kør `sample_data.sql` - indsætter testdata

### 2.2 Verifikation af Installation
```sql
-- Tjek at alle tabeller er oprettet
SHOW TABLES;

-- Tjek at views er oprettet
SHOW FULL TABLES WHERE TABLE_TYPE LIKE 'VIEW';

-- Tjek stored procedures
SHOW PROCEDURE STATUS WHERE Db = 'CBZHotels';
```

## 3. Test Scenarier

### 3.1 Test af Constraints og Validering

#### Email Validering
```sql
-- Skal fejle (ugyldig email)
CALL sp_opret_gæst(
    'Test',           -- Fornavn
    'Testesen',      -- Efternavn
    '+4512345678',   -- Telefon
    'ugyldig.email', -- Ugyldig email
    'Testvej 1',     -- Adresse
    'Aktiv'          -- Status
);

-- Skal lykkes
CALL sp_opret_gæst(
    'Test',           -- Fornavn
    'Testesen',      -- Efternavn
    '+4512345678',   -- Telefon
    'test@example.com', -- Gyldig email
    'Testvej 1',     -- Adresse
    'Aktiv'          -- Status
);
```

#### Prisvalidering
```sql
-- Skal fejle (negativ pris)
INSERT INTO værelser (værelse_id, hotel_id, værelse_type, pris)
VALUES (999, 1, 'Enkeltværelse', -100);

-- Skal fejle (pris over maksimum)
INSERT INTO værelser (værelse_id, hotel_id, værelse_type, pris)
VALUES (999, 1, 'Enkeltværelse', 10000);
```

#### Booking Datovalidering
```sql
-- Skal fejle (check-ud før check-ind)
CALL sp_opret_booking(
    1,              -- Gæste ID
    1,              -- Hotel ID
    1,              -- Værelse ID
    '2024-03-15',   -- Check-ind dato
    '2024-03-14',   -- Check-ud dato (før check-ind)
    false,          -- Ikke online booking
    false           -- Ikke FDM medlem
);
```

### 3.2 Test af Booking Flow

#### 1. Opret Gæst
```sql
CALL sp_opret_gæst(
    'Test',           -- Fornavn
    'Testesen',      -- Efternavn
    '+4512345678',   -- Telefon
    'test@test.dk',  -- Email
    'Testvej 1',     -- Adresse
    'Aktiv'          -- Status
);
```

#### 2. Find Ledigt Værelse
```sql
-- Find ledige værelser for specifik periode
CALL sp_find_ledige_værelser(
    1,                    -- Hotel ID
    CURDATE(),           -- Check-ind dato
    DATE_ADD(CURDATE(), INTERVAL 2 DAY)  -- Check-ud dato
);
```

#### 3. Opret Booking
```sql
-- Opret booking med fundet værelse
CALL sp_opret_booking(
    LAST_INSERT_ID(),    -- Gæste ID fra trin 1
    1,                   -- Hotel ID
    1,                   -- Værelse ID fra trin 2
    CURDATE(),           -- Check-ind dato
    DATE_ADD(CURDATE(), INTERVAL 2 DAY),  -- Check-ud dato
    false,               -- Ikke online booking
    true                 -- FDM medlem (10% rabat)
);
```

#### 4. Opdater Booking Status
```sql
-- Test ændring af booking status
CALL sp_opdater_booking_status(
    LAST_INSERT_ID(),    -- Booking ID fra forrige trin
    'Annulleret'         -- Ny status
);
```

### 3.3 Test af Views og Rapporter

#### Belægningsprocent og Aktuelle Bookinger
```sql
-- Test af v_hotel_belægning
SELECT * FROM v_hotel_belægning;

-- Test af v_aktuelle_bookinger
SELECT * FROM v_aktuelle_bookinger
WHERE check_ind_dato >= CURDATE()
ORDER BY check_ind_dato;
```

#### Månedlig Omsætning og Populære Værelser
```sql
-- Test af v_hotel_månedlig_omsætning
SELECT * FROM v_hotel_månedlig_omsætning
WHERE måned = DATE_FORMAT(CURDATE(), '%Y-%m')
ORDER BY total_omsætning DESC;

-- Test af v_populære_værelser
SELECT * FROM v_populære_værelser
WHERE antal_bookinger > 0
ORDER BY booking_procent DESC;
```

#### VIP Gæster og Personale
```sql
-- Test af v_vip_gæster
SELECT * FROM v_vip_gæster
ORDER BY samlet_forbrug DESC;

-- Test af v_hotel_personale_oversigt
SELECT * FROM v_hotel_personale_oversigt
WHERE stillingsbetegnelse = 'Receptionist'
ORDER BY gennemsnitsløn DESC;
```

#### Cykel og Konference Oversigt
```sql
-- Test af v_cykel_statistik
SELECT * FROM v_cykel_statistik
WHERE antal_cykler > 0;

-- Test af v_konference_oversigt
SELECT * FROM v_konference_oversigt
WHERE tidligste_booking >= CURDATE()
ORDER BY antal_konferencer DESC;
```

### 3.4 Test af Cykeludlejning
```sql
-- Test cykeludlejning
CALL sp_udlej_cykel(
    1,                              -- Cykel ID
    LAST_INSERT_ID(),               -- Gæste ID
    CURDATE(),                      -- Start dato
    DATE_ADD(CURDATE(), INTERVAL 2 DAY)  -- Slut dato
);

-- Test udlejning af allerede udlejet cykel (skal fejle)
CALL sp_udlej_cykel(
    1,                              -- Samme cykel ID
    2,                              -- Anden gæst
    CURDATE(),                      -- Start dato
    DATE_ADD(CURDATE(), INTERVAL 2 DAY)  -- Slut dato
);
```

### 3.5 Test af Rabatter
```sql
-- Test kombineret FDM og online booking rabat
CALL sp_opret_booking(
    1,              -- Gæste ID
    1,              -- Hotel ID
    1,              -- Værelse ID
    CURDATE(),      -- Check-ind dato
    DATE_ADD(CURDATE(), INTERVAL 2 DAY),
    true,           -- Online booking (10% rabat)
    true            -- FDM medlem (12% rabat)
);

-- Verificer samlet rabat
SELECT total_pris, 
    (SELECT pris FROM værelser WHERE værelse_id = 1 AND hotel_id = 1) * 2 as original_pris
FROM bookinger 
WHERE booking_id = LAST_INSERT_ID();
```

### 3.6 Test af Personale Kvoter
```sql
-- Verificer personale fordeling per hotel
SELECT 
    hotel_id,
    SUM(CASE WHEN stillingsbetegnelse = 'Rengøringsassistent' THEN 1 ELSE 0 END) as antal_rengøring,
    SUM(CASE WHEN stillingsbetegnelse = 'Leder' THEN 1 ELSE 0 END) as antal_ledere,
    SUM(CASE WHEN stillingsbetegnelse = 'Receptionist' THEN 1 ELSE 0 END) as antal_reception,
    SUM(CASE WHEN stillingsbetegnelse = 'Kok' THEN 1 ELSE 0 END) as antal_køkken
FROM hotel_personale
GROUP BY hotel_id
HAVING 
    antal_rengøring = 3 
    AND antal_ledere = 2 
    AND antal_reception = 8 
    AND antal_køkken = 8;
```

### 3.7 Test af Konference Faciliteter på The Pope
```sql
-- Test konference booking kun på The Pope
CALL sp_opret_konference_booking(
    1,                -- The Pope hotel_id
    1,                -- Gæste ID
    CURDATE(),        -- Start dato
    DATE_ADD(CURDATE(), INTERVAL 2 DAY),
    50,               -- Antal gæster
    'Specielle ønsker for Pave Francis',
    'Fuld forplejning med specielle diætkrav',
    'Projektor, mikrofoner, simultantolkning'
);

-- Test konference booking på andet hotel (skal fejle)
CALL sp_opret_konference_booking(
    2,                -- Andet hotel (skal fejle)
    1,                -- Gæste ID
    CURDATE(),        -- Start dato
    DATE_ADD(CURDATE(), INTERVAL 2 DAY),
    50,               -- Antal gæster
    'Test',
    'Standard forplejning',
    'Standard udstyr'
);
```

## 4. Performance Tests

### 4.1 Indeks Performance
```sql
-- Aktiver performance schema
SET GLOBAL performance_schema = ON;

-- Test søgning på bookinger med datoer
EXPLAIN FORMAT=JSON
SELECT b.*, g.fornavn, g.efternavn
FROM bookinger b
JOIN gæster g ON b.gæste_id = g.gæste_id
WHERE b.check_ind_dato BETWEEN '2024-03-01' AND '2024-03-31'
AND b.booking_status = 'Bekræftet';

-- Test søgning på ledige værelser
EXPLAIN FORMAT=JSON
SELECT v.*, h.hotel_navn
FROM værelser v
JOIN hoteller h ON v.hotel_id = h.hotel_id
WHERE v.hotel_id = 1
AND NOT EXISTS (
    SELECT 1 FROM bookinger b
    WHERE b.værelse_id = v.værelse_id
    AND b.hotel_id = v.hotel_id
    AND b.booking_status = 'Bekræftet'
    AND '2024-03-15' BETWEEN b.check_ind_dato AND b.check_ud_dato
);

-- Tjek indeks anvendelse og statistik
SHOW INDEX FROM bookinger;
SHOW INDEX FROM værelser;
SHOW INDEX FROM gæster;

-- Tjek indeks statistik
ANALYZE TABLE bookinger, værelser, gæster;
SHOW TABLE STATUS WHERE Name IN ('bookinger', 'værelser', 'gæster');
```

### 4.2 Concurrent Access Test
```sql
-- Session 1: Forsøg booking
START TRANSACTION;
-- Check om værelset er ledigt
SELECT * FROM værelser v
WHERE v.værelse_id = 1 
AND v.hotel_id = 1
AND NOT EXISTS (
    SELECT 1 FROM bookinger b
    WHERE b.værelse_id = v.værelse_id
    AND b.hotel_id = v.hotel_id
    AND b.booking_status = 'Bekræftet'
    AND '2024-03-15' BETWEEN b.check_ind_dato AND b.check_ud_dato
) FOR UPDATE;
-- Vent 10 sekunder for at simulere samtidig adgang
DO SLEEP(10);
COMMIT;

-- Session 2: Samtidig booking forsøg
START TRANSACTION;
-- Skulle vente på Session 1's lås
SELECT * FROM værelser v
WHERE v.værelse_id = 1 
AND v.hotel_id = 1
AND NOT EXISTS (
    SELECT 1 FROM bookinger b
    WHERE b.værelse_id = v.værelse_id
    AND b.hotel_id = v.hotel_id
    AND b.booking_status = 'Bekræftet'
    AND '2024-03-15' BETWEEN b.check_ind_dato AND b.check_ud_dato
) FOR UPDATE;
COMMIT;
```

## 5. Sikkerhedstest

### 5.1 Brugerrettigheder
```sql
-- Opret testbrugere med forskellige roller
CREATE USER 'test_receptionist'@'localhost' 
IDENTIFIED BY 'password123';

CREATE USER 'test_manager'@'localhost'
IDENTIFIED BY 'password123';

CREATE USER 'test_rengøring'@'localhost'
IDENTIFIED BY 'password123';

-- Tildel roller
-- Receptionist rettigheder
GRANT SELECT, INSERT ON CBZHotels.bookinger TO 'test_receptionist'@'localhost';
GRANT SELECT ON CBZHotels.gæster TO 'test_receptionist'@'localhost';
GRANT SELECT ON CBZHotels.v_ledige_værelser TO 'test_receptionist'@'localhost';
GRANT SELECT ON CBZHotels.v_aktuelle_bookinger TO 'test_receptionist'@'localhost';
GRANT EXECUTE ON PROCEDURE CBZHotels.sp_opret_booking TO 'test_receptionist'@'localhost';
GRANT EXECUTE ON PROCEDURE CBZHotels.sp_find_ledige_værelser TO 'test_receptionist'@'localhost';

-- Rengøringspersonale rettigheder
GRANT SELECT ON CBZHotels.v_aktuelle_bookinger TO 'test_rengøring'@'localhost';

-- Manager rettigheder
GRANT ALL PRIVILEGES ON CBZHotels.* TO 'test_manager'@'localhost';

-- Test receptionist adgang
-- Log ind som test_receptionist og test:
SELECT * FROM v_ledige_værelser; -- Skal virke
SELECT * FROM v_hotel_månedlig_omsætning; -- Skal fejle
SELECT * FROM v_vip_gæster; -- Skal fejle

-- Test rengøring adgang
-- Log ind som test_rengøring og test:
SELECT * FROM v_aktuelle_bookinger; -- Skal virke
SELECT * FROM bookinger; -- Skal fejle

-- Tilføj rettigheder til views
GRANT SELECT ON CBZHotels.v_hotel_månedlig_omsætning TO 'test_manager'@'localhost';
GRANT SELECT ON CBZHotels.v_populære_værelser TO 'test_manager'@'localhost';
GRANT SELECT ON CBZHotels.v_cykel_statistik TO 'test_manager'@'localhost';
```

### 5.2 View-baseret Adgang
```sql
-- Test rengøringspersonale adgang
SELECT * FROM v_aktuelle_bookinger
WHERE check_ud_dato = CURDATE()
AND booking_status = 'Bekræftet'
ORDER BY hotel_navn, værelse_id;

-- Verificer at kun relevante data vises
SELECT COUNT(*) as total_bookinger FROM bookinger;  -- Total antal
SELECT COUNT(*) as dagens_bookinger FROM v_aktuelle_bookinger 
WHERE check_ud_dato = CURDATE(); -- Kun dagens
```

## 6. Backup og Recovery Test

### 6.1 Fuld Backup Test
```sql
-- Opret backup bruger med nødvendige rettigheder
CREATE USER 'backup_user'@'localhost' IDENTIFIED BY 'secure_backup_pw';
GRANT SELECT, SHOW VIEW, RELOAD, LOCK TABLES, REPLICATION CLIENT ON *.* TO 'backup_user'@'localhost';
FLUSH PRIVILEGES;

-- Tag fuld backup med mysqldump
mysqldump --user=backup_user --password=secure_backup_pw \
    --single-transaction \
    --routines \
    --triggers \
    --add-drop-table \
    CBZHotels > /backup/hotel_$(date +%Y%m%d).sql

-- Verificer backup fil
head -n 20 /backup/hotel_$(date +%Y%m%d).sql
tail -n 20 /backup/hotel_$(date +%Y%m%d).sql
```

### 6.2 Recovery Test
```sql
-- Opret test database
CREATE DATABASE hotel_test
CHARACTER SET utf8mb4
COLLATE utf8mb4_danish_ci;

-- Gendan backup til test database
mysql --user=backup_user --password=secure_backup_pw \
    hotel_test < /backup/hotel_$(date +%Y%m%d).sql

-- Verificer data i test database
USE hotel_test;

-- Sammenlign antal rækker i hovedtabeller
SELECT 'Originale database' as db_navn, 
    (SELECT COUNT(*) FROM CBZHotels.bookinger) as antal_bookinger,
    (SELECT COUNT(*) FROM CBZHotels.gæster) as antal_gæster,
    (SELECT COUNT(*) FROM CBZHotels.værelser) as antal_værelser
UNION ALL
SELECT 'Test database',
    (SELECT COUNT(*) FROM hotel_test.bookinger),
    (SELECT COUNT(*) FROM hotel_test.gæster),
    (SELECT COUNT(*) FROM hotel_test.værelser);

-- Test stored procedures i gendannet database
CALL hotel_test.sp_find_ledige_værelser(
    1, 
    CURDATE(), 
    DATE_ADD(CURDATE(), INTERVAL 2 DAY)
);
```

## 7. Oprydning

### 7.1 Fjern Testdata
```sql
-- Sikkerhedskopi af data der skal slettes
CREATE TABLE backup_deleted_bookinger AS
SELECT * FROM bookinger 
WHERE gæste_id IN (SELECT gæste_id FROM gæster WHERE email LIKE 'test%');

CREATE TABLE backup_deleted_gæster AS
SELECT * FROM gæster WHERE email LIKE 'test%';

-- Fjern test bookinger
DELETE FROM bookinger 
WHERE gæste_id IN (SELECT gæste_id FROM gæster WHERE email LIKE 'test%');

-- Fjern test gæster
DELETE FROM gæster WHERE email LIKE 'test%';

-- Fjern test cykel udlejninger
DELETE FROM cykel_udlejning
WHERE gæste_id NOT IN (SELECT gæste_id FROM gæster);
```

### 7.2 Reset Sekvenser og Oprydning
```sql
-- Reset auto_increment værdier
ALTER TABLE gæster AUTO_INCREMENT = 1;
ALTER TABLE bookinger AUTO_INCREMENT = 1;
ALTER TABLE cykel_udlejning AUTO_INCREMENT = 1;

-- Fjern testbrugere
DROP USER IF EXISTS 'test_receptionist'@'localhost';
DROP USER IF EXISTS 'test_manager'@'localhost';
DROP USER IF EXISTS 'backup_user'@'localhost';

-- Fjern test database hvis den eksisterer
DROP DATABASE IF EXISTS hotel_test;

-- Fjern backup tabeller
DROP TABLE IF EXISTS backup_deleted_bookinger;
DROP TABLE IF EXISTS backup_deleted_gæster;

-- Optimér tabeller efter omfattende sletning
OPTIMIZE TABLE gæster, bookinger, værelser, cykel_udlejning;
```
