# Teknisk Dokumentation: Hotel Database System
Version 1.0

## Indholdsfortegnelse
1. [Systemarkitektur](#1-systemarkitektur)
2. [Database Design](#2-database-design)
3. [SQL Koncepter](#3-sql-koncepter)
4. [Views](#4-views)
5. [Stored Procedures](#5-stored-procedures)
6. [Data Modellering](#6-data-modellering)
7. [Performance Optimering](#7-performance-optimering)
8. [Sikkerhed](#8-sikkerhed)

## 1. Systemarkitektur

### 1.1 Overordnet Arkitektur
Systemet er bygget på en relationel databasearkitektur med MySQL/MariaDB som RDBMS (Relational Database Management System). Arkitekturen følger ACID-principperne:

- **Atomicity**: Transaktioner er atomare (alt eller intet)
- **Consistency**: Data forbliver konsistent
- **Isolation**: Transaktioner er isolerede fra hinanden
- **Durability**: Gennemførte transaktioner er permanente

### 1.2 Teknisk Stack
- **Database Engine**: InnoDB
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_danish_ci (understøtter danske tegn)

## 2. Database Design

### 2.1 Normalisering og Databasedesign

#### 2.1.1 Normaliseringsformer
Vores database implementerer 3NF (Tredje Normalform), men der findes flere normaliseringsformer:

1. **Første Normalform (1NF)**
   - Eliminerer gentagne grupper
   - Skaber separate relationer for relaterede data
   - Identificerer hver række med en primærnøgle
   ```sql
   -- Før 1NF (dårlig praksis)
   gæster (
       gæste_id,
       navn,
       telefonnumre: "12345678, 87654321"  -- Flere værdier i én kolonne
   )
   
   -- Efter 1NF (korrekt)
   gæster (
       gæste_id,
       navn
   )
   telefonnumre (
       gæste_id,
       telefonnummer
   )
   ```

2. **Anden Normalform (2NF)**
   - Fjerner partielle afhængigheder
   - Alle ikke-nøgle attributter er fuldt afhængige af primærnøglen
   ```sql
   -- Eksempel på 2NF i vores system
   CREATE TABLE `bookinger` (
       `booking_id` INT NOT NULL AUTO_INCREMENT,
       `gæste_id` INT NOT NULL,
       `værelse_id` INT NOT NULL,
       `total_pris` DECIMAL(10,2),
       PRIMARY KEY (`booking_id`)
   )
   ```

3. **Tredje Normalform (3NF)**
   - Fjerner transitive afhængigheder
   - Implementeret i vores system gennem separate tabeller
   ```sql
   -- Eksempel på 3NF struktur
   hoteller (hotel_id, navn, adresse)
   værelser (værelse_id, hotel_id, type, pris)
   bookinger (booking_id, værelse_id, gæste_id, ...)
   ```

4. **Boyce-Codd Normalform (BCNF)**
   - Strengere version af 3NF
   - Ikke implementeret i vores system da det ville medføre:
     - Øget kompleksitet
     - Flere joins
     - Potentielt dårligere performance

5. **Fjerde Normalform (4NF)**
   - Håndterer multivalued dependencies
   - Ikke relevant for vores use case

6. **Femte Normalform (5NF)**
   - Håndterer join dependencies
   - Sjældent brugt i praksis

#### 2.1.2 Valg af Normaliseringsform
Vi valgte at implementere 3NF af følgende årsager:

1. **Balance mellem integritet og performance**
   ```sql
   -- Eksempel på effektiv 3NF struktur
   SELECT 
       h.hotel_navn,
       v.værelse_type,
       b.total_pris
   FROM hoteller h
   JOIN værelser v ON h.hotel_id = v.hotel_id
   JOIN bookinger b ON v.værelse_id = b.værelse_id
   ```

2. **Vedligeholdelse**
   - Minimerer dataredundans
   - Lettere at opdatere data
   - Reducerer risiko for anomalier

3. **Praktiske overvejelser**
   ```sql
   -- Eksempel på hvordan 3NF forenkler opdateringer
   UPDATE hoteller 
   SET adresse = 'Ny Adresse 123'
   WHERE hotel_id = 1;
   -- Opdaterer kun ét sted, propagerer automatisk
   ```

#### 2.1.3 Denormalisering i Specifikke Tilfælde
Vi har strategisk denormaliseret i enkelte tilfælde:

```sql
CREATE TABLE `bookinger` (
    `booking_id` INT NOT NULL AUTO_INCREMENT,
    `total_pris` DECIMAL(10,2),  -- Denormaliseret for performance
    `beregnet_pris` DECIMAL(10,2) AS (
        CASE 
            WHEN fdm_medlem THEN total_pris * 0.9
            ELSE total_pris
        END
    ) STORED  -- Cached beregning
)
```

Årsager til selektiv denormalisering:
1. **Performance Optimering**
   - Reducerer antallet af joins for hyppige forespørgsler
   - Cacher beregnede værdier

2. **Historisk Data**
   - Bevarer prishistorik selv ved prisændringer
   - Muliggør historisk rapportering

3. **Praktiske Behov**
   ```sql
   -- View der udnytter denormaliseret data
   CREATE VIEW v_booking_rapport AS
   SELECT 
       booking_id,
       total_pris,
       beregnet_pris,
       (total_pris - beregnet_pris) as rabat
   FROM bookinger
   -- Hurtigere end at beregne ved hver forespørgsel
   ```

#### 2.1.4 Indeksstrategier for Normaliseret Data
For at optimere performance i vores 3NF design:

```sql
-- Composite index for ofte brugte joins
CREATE INDEX idx_booking_search 
ON bookinger (hotel_id, check_ind_dato, booking_status);

-- Covering index for almindelige forespørgsler
CREATE INDEX idx_værelse_info
ON værelser (hotel_id, værelse_type, pris);
```

Dette giver os:
- Hurtig søgning på tværs af normaliserede tabeller
- Effektiv join-performance
- Optimal balance mellem dataintegritet og hastighed

### 2.2 Referentiel Integritet
Systemet bruger foreign keys til at opretholde referentiel integritet:

```sql
CONSTRAINT `fk_booking_gæst` FOREIGN KEY (`gæste_id`) 
    REFERENCES `gæster` (`gæste_id`) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE
```

Dette sikrer at:
- Der ikke kan oprettes bookinger for ikke-eksisterende gæster
- Ændringer i gæste-ID'er automatisk propageres
- Gæster med aktive bookinger ikke kan slettes

## 3. SQL Koncepter

### 3.1 JOIN Operationer
Systemet bruger forskellige typer af JOIN:

#### INNER JOIN
```sql
SELECT h.hotel_navn, v.værelse_type
FROM værelser v
JOIN hoteller h ON v.hotel_id = h.hotel_id
```
- Returnerer kun rækker hvor der er match i begge tabeller
- Bruges når vi skal have data der eksisterer i begge tabeller

#### LEFT JOIN
```sql
FROM hoteller h
LEFT JOIN bookinger b ON h.hotel_id = b.hotel_id
```
- Returnerer alle rækker fra venstre tabel og matchende rækker fra højre
- Bruges til at inkludere hoteller uden bookinger

### 3.2 Aggregeringsfunktioner
Systemet bruger forskellige aggregeringsfunktioner:

```sql
SELECT 
    COUNT(*) as antal_bookinger,
    SUM(total_pris) as samlet_omsætning,
    AVG(total_pris) as gennemsnit,
    MIN(check_ind_dato) as første_booking,
    MAX(check_ud_dato) as sidste_booking
FROM bookinger
```

- **COUNT**: Tæller antal rækker
- **SUM**: Summerer værdier
- **AVG**: Beregner gennemsnit
- **MIN/MAX**: Finder mindste/største værdi

### 3.3 Window Functions
Anvendt i views til avancerede beregninger:

```sql
COUNT(b.booking_id) * 100.0 / SUM(COUNT(b.booking_id)) 
    OVER (PARTITION BY h.hotel_id)
```

- **OVER**: Definerer vinduet for beregningen
- **PARTITION BY**: Grupperer data for window function

## 4. Views

### 4.1 Materialized vs. Non-Materialized Views
Systemet bruger non-materialized views:
```sql
CREATE OR REPLACE VIEW v_hotel_månedlig_omsætning AS
SELECT 
    h.hotel_navn,
    DATE_FORMAT(b.check_ind_dato, '%Y-%m') as måned,
    COUNT(b.booking_id) as antal_bookinger
FROM hoteller h
LEFT JOIN bookinger b ON h.hotel_id = b.hotel_id
```

Fordele:
- Altid opdateret data
- Ingen ekstra diskplads
- Automatisk vedligeholdelse

Ulemper:
- Kan være langsommere end materialized views
- Belaster databasen ved hver forespørgsel

### 4.2 View Optimering
Views er optimeret gennem:

1. **Indeks anvendelse**:
```sql
CREATE INDEX `idx_booking_datoer` 
ON `bookinger` (`check_ind_dato`, `check_ud_dato`);
```

2. **Effektiv JOIN rækkefølge**:
```sql
FROM værelser v
JOIN hoteller h ON v.hotel_id = h.hotel_id
LEFT JOIN bookinger b ON v.værelse_id = b.værelse_id
```

## 5. Stored Procedures

### 5.1 Procedural Logic
Eksempel på procedural logik:

```sql
CREATE PROCEDURE sp_opret_booking(
    IN p_gæste_id INT,
    IN p_hotel_id INT,
    -- andre parametre
)
BEGIN
    DECLARE v_værelse_pris DECIMAL(8,2);
    
    -- Fejlhåndtering
    IF p_check_ind_dato >= p_check_ud_dato THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ugyldig dato';
    END IF;
    
    -- Transaktionshåndtering
    START TRANSACTION;
    
    -- Forretningslogik
    INSERT INTO bookinger (/*felter*/) 
    VALUES (/*værdier*/);
    
    COMMIT;
END;
```

### 5.2 Transaktionshåndtering
Stored procedures implementerer ACID gennem:

```sql
START TRANSACTION;
    -- operations
    IF error_condition THEN
        ROLLBACK;
    ELSE
        COMMIT;
    END IF;
```

## 6. Data Modellering

### 6.1 Entity-Relationship Model
Systemet følger en Entity-Relationship model med:

- **Entiteter**: Hoteller, Gæster, Værelser, etc.
- **Relationer**: 1:N, N:M
- **Attributter**: Simple og sammensatte

### 6.2 Constraints
Forskellige typer constraints sikrer dataintegritet:

```sql
-- Domain Constraint
CONSTRAINT `chk_pris` 
    CHECK (`pris` BETWEEN 0 AND 9999)

-- Entity Constraint
PRIMARY KEY (`booking_id`)

-- Referential Constraint
FOREIGN KEY (`hotel_id`) 
    REFERENCES `hoteller` (`hotel_id`)
```

## 7. Performance Optimering

### 7.1 Indeksering
Systemet bruger forskellige indekstyper:

```sql
-- Simpelt indeks
CREATE INDEX `idx_gæst_navn` 
ON `gæster` (`efternavn`, `fornavn`);

-- Sammensat indeks
CREATE INDEX `idx_booking_datoer` 
ON `bookinger` (`check_ind_dato`, `check_ud_dato`);
```

### 7.2 Query Optimering
Eksempel på optimeret query:

```sql
EXPLAIN FORMAT=JSON
SELECT b.*, g.fornavn
FROM bookinger b
    JOIN gæster g ON b.gæste_id = g.gæste_id
WHERE b.check_ind_dato BETWEEN ? AND ?
    AND b.booking_status = 'Bekræftet'
```

## 8. Sikkerhed

### 8.1 Adgangskontrol
Implementeret gennem brugerroller:

```sql
CREATE USER 'hotel_receptionist'@'localhost';
GRANT SELECT, INSERT ON hotel.bookinger 
TO 'hotel_receptionist'@'localhost';
```

### 8.2 Input Validering
Implementeret gennem constraints og validering:

```sql
CONSTRAINT `chk_email` CHECK (
    `email` REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'
)
```

## Appendiks

### A. Fejlkoder
- 45000: Brugerdefinerede fejl
- 23000: Integrity constraint violation

### B. Performance Metrics
- Typisk svartid: < 100ms
- Maksimal concurrent connections: 150
- Buffer pool size: 128M

### C. Vedligeholdelse
```sql
-- Regelmæssig vedligeholdelse
ANALYZE TABLE bookinger, værelser, gæster;
OPTIMIZE TABLE bookinger, værelser, gæster;
```

### Konfiguration af Databasenavn

Systemet bruger følgende database navn:

```sql
USE CBZHotels;
```