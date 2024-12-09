USE CBZHotels;

-- Disable foreign key checks and clean up existing data
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all existing data
TRUNCATE TABLE bookinger;
TRUNCATE TABLE cykel_udlejning;
TRUNCATE TABLE konference_bookinger;
TRUNCATE TABLE hotel_personale;
TRUNCATE TABLE gæster;
TRUNCATE TABLE værelser;
TRUNCATE TABLE hoteller;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Reset all auto-increment counters
ALTER TABLE bookinger AUTO_INCREMENT = 1;
ALTER TABLE cykel_udlejning AUTO_INCREMENT = 1;
ALTER TABLE konference_bookinger AUTO_INCREMENT = 1;
ALTER TABLE gæster AUTO_INCREMENT = 1;

-- 1. First, insert hotels
INSERT INTO hoteller (hotel_id, hotel_navn, adresse) VALUES
(1, 'The Pope', 'Vatikangade 1, 1111 Bispeborg'),
(2, 'Lucky Star', 'Bredgade 12, 2222 Hjemby'),
(3, 'Discount', 'Billigvej 7, 3333 Lilleby'),
(4, 'deLuxe', 'Kapital Avenue 99, 4444 Borgerslev'),
(5, 'Discount', 'Billiggade 12, 6666 Roslev');

-- 2. Then insert rooms with more rooms for each hotel
INSERT INTO værelser (værelse_id, hotel_id, værelse_type, pris) VALUES
-- The Pope
(1, 1, 'D', 200),
(2, 1, 'D', 200),
(3, 1, 'D', 200),
(11, 1, 'S', 150),
(12, 1, 'S', 150),
(21, 1, 'F', 220),
(22, 1, 'F', 220),
-- Lucky Star
(1, 2, 'D', 230),
(2, 2, 'D', 230),
(3, 2, 'D', 230),
(11, 2, 'S', 180),
(12, 2, 'S', 180),
(21, 2, 'F', 300),
(22, 2, 'F', 300),
-- Discount (Lilleby)
(1, 3, 'D', 175),
(2, 3, 'D', 175),
(11, 3, 'S', 150),
-- deLuxe
(1, 4, 'D', 400),
(2, 4, 'D', 400),
(3, 4, 'D', 400),
(11, 4, 'S', 350),
(21, 4, 'F', 500),
-- Discount (Roslev)
(1, 5, 'D', 170),
(2, 5, 'D', 170),
(11, 5, 'S', 140);

-- 3. Insert hotel staff (unchanged)
INSERT INTO hotel_personale (hotel_id, fornavn, efternavn, stillingsbetegnelse, ansættelsesdato, løn)
WITH RECURSIVE numbers AS (
    SELECT 1 AS n UNION ALL SELECT n + 1 FROM numbers WHERE n < 106
)
SELECT 
    FLOOR((n-1)/21) + 1 as hotel_id,
    CASE (n % 10)
        WHEN 0 THEN 'Jens'
        WHEN 1 THEN 'Maria'
        WHEN 2 THEN 'Henrik'
        WHEN 3 THEN 'Louise'
        WHEN 4 THEN 'Michael'
        WHEN 5 THEN 'Anne'
        WHEN 6 THEN 'Klaus'
        WHEN 7 THEN 'Camilla'
        WHEN 8 THEN 'Martin'
        ELSE 'Lene'
    END,
    CASE (n % 8)
        WHEN 0 THEN 'Møller'
        WHEN 1 THEN 'Schmidt'
        WHEN 2 THEN 'Poulsen'
        WHEN 3 THEN 'Knudsen'
        WHEN 4 THEN 'Mortensen'
        WHEN 5 THEN 'Eriksen'
        WHEN 6 THEN 'Winther'
        ELSE 'Berg'
    END,
    CASE 
        WHEN (n % 21) < 3 THEN 'Rengøringsassistent'
        WHEN (n % 21) < 5 THEN 'Leder'
        WHEN (n % 21) < 13 THEN 'Receptionist'
        ELSE 'Kok'
    END,
    DATE_SUB(CURRENT_DATE, INTERVAL (n % 1000) DAY),
    CASE 
        WHEN (n % 21) < 3 THEN 28000 + (RAND() * 3000)
        WHEN (n % 21) < 5 THEN 45000 + (RAND() * 5000)
        WHEN (n % 21) < 13 THEN 32000 + (RAND() * 4000)
        ELSE 35000 + (RAND() * 5000)
    END
FROM numbers
WHERE FLOOR((n-1)/21) + 1 <= 5;

-- 4. Insert guests
INSERT INTO gæster (fornavn, efternavn, telefon_nummer, email, adresse, status)
WITH RECURSIVE numbers AS (
    SELECT 1 AS n UNION ALL SELECT n + 1 FROM numbers WHERE n < 120
)
SELECT 
    CASE (n % 20)
        WHEN 0 THEN 'Anders'
        WHEN 1 THEN 'Marie'
        WHEN 2 THEN 'Peter'
        WHEN 3 THEN 'Sofia'
        WHEN 4 THEN 'Lars'
        WHEN 5 THEN 'Emma'
        WHEN 6 THEN 'Mikkel'
        WHEN 7 THEN 'Anna'
        WHEN 8 THEN 'Thomas'
        WHEN 9 THEN 'Laura'
        WHEN 10 THEN 'Christian'
        WHEN 11 THEN 'Ida'
        WHEN 12 THEN 'Frederik'
        WHEN 13 THEN 'Clara'
        WHEN 14 THEN 'Oliver'
        WHEN 15 THEN 'Victoria'
        WHEN 16 THEN 'William'
        WHEN 17 THEN 'Emily'
        WHEN 18 THEN 'Noah'
        ELSE 'Sophia'
    END,
    CASE (n % 15)
        WHEN 0 THEN 'Nielsen'
        WHEN 1 THEN 'Jensen'
        WHEN 2 THEN 'Hansen'
        WHEN 3 THEN 'Pedersen'
        WHEN 4 THEN 'Andersen'
        WHEN 5 THEN 'Christensen'
        WHEN 6 THEN 'Larsen'
        WHEN 7 THEN 'Sørensen'
        WHEN 8 THEN 'Rasmussen'
        WHEN 9 THEN 'Jørgensen'
        WHEN 10 THEN 'Petersen'
        WHEN 11 THEN 'Madsen'
        WHEN 12 THEN 'Kristensen'
        WHEN 13 THEN 'Olsen'
        ELSE 'Thomsen'
    END,
    CONCAT('+45 ', FLOOR(RAND() * (99999999 - 20000000) + 20000000)),
    CONCAT(
        LOWER(
            CASE (n % 20)
                WHEN 0 THEN 'anders'
                WHEN 1 THEN 'marie'
                WHEN 2 THEN 'peter'
                WHEN 3 THEN 'sofia'
                WHEN 4 THEN 'lars'
                WHEN 5 THEN 'emma'
                WHEN 6 THEN 'mikkel'
                WHEN 7 THEN 'anna'
                WHEN 8 THEN 'thomas'
                WHEN 9 THEN 'laura'
                WHEN 10 THEN 'christian'
                WHEN 11 THEN 'ida'
                WHEN 12 THEN 'frederik'
                WHEN 13 THEN 'clara'
                WHEN 14 THEN 'oliver'
                WHEN 15 THEN 'victoria'
                WHEN 16 THEN 'william'
                WHEN 17 THEN 'emily'
                WHEN 18 THEN 'noah'
                ELSE 'sophia'
            END
        ),
        n,
        '@',
        CASE (n % 5)
            WHEN 0 THEN 'gmail.com'
            WHEN 1 THEN 'hotmail.com'
            WHEN 2 THEN 'yahoo.com'
            WHEN 3 THEN 'outlook.com'
            ELSE 'example.com'
        END
    ),
    CONCAT(
        'Gade ',
        n,
        ', ',
        FLOOR(RAND() * 9000 + 1000),
        ' ',
        CASE (n % 10)
            WHEN 0 THEN 'København'
            WHEN 1 THEN 'Aarhus'
            WHEN 2 THEN 'Odense'
            WHEN 3 THEN 'Aalborg'
            WHEN 4 THEN 'Esbjerg'
            WHEN 5 THEN 'Randers'
            WHEN 6 THEN 'Kolding'
            WHEN 7 THEN 'Horsens'
            WHEN 8 THEN 'Vejle'
            ELSE 'Roskilde'
        END
    ),
    CASE 
        WHEN n % 10 = 0 THEN 'VIP'
        WHEN n % 20 = 0 THEN 'Inaktiv'
        ELSE 'Aktiv'
    END
FROM numbers;

-- 5. Insert bookings with better monthly distribution
INSERT INTO bookinger (gæste_id, hotel_id, værelse_id, check_ind_dato, check_ud_dato, online_booking, fdm_medlem, total_pris, booking_status)
WITH RECURSIVE dates AS (
    SELECT '2024-01-01' as date
    UNION ALL
    SELECT DATE_ADD(date, INTERVAL 1 DAY)
    FROM dates
    WHERE date < '2024-12-31'
),
monthly_dates AS (
    SELECT date, 
           LAST_DAY(date) as month_end,
           hotel_id,
           værelse_id
    FROM dates
    CROSS JOIN værelser
    WHERE DAY(date) IN (1, 5, 10, 15, 20, 25)  -- Multiple bookings per month
),
booking_dates AS (
    SELECT 
        date,
        DATE_ADD(date, INTERVAL 2 + FLOOR(RAND() * 3) DAY) as end_date,
        hotel_id,
        værelse_id
    FROM monthly_dates
)
SELECT 
    (ROW_NUMBER() OVER (ORDER BY date) % 120) + 1 as gæste_id,
    hotel_id,
    værelse_id,
    date as check_ind_dato,
    end_date as check_ud_dato,
    MOD(ROW_NUMBER() OVER (ORDER BY date), 2) = 0 as online_booking,
    MOD(ROW_NUMBER() OVER (ORDER BY date), 3) = 0 as fdm_medlem,
    CASE hotel_id
        WHEN 1 THEN 2000 + (RAND() * 1000)  -- The Pope
        WHEN 2 THEN 1800 + (RAND() * 700)   -- Lucky Star
        WHEN 3 THEN 1000 + (RAND() * 500)   -- Discount
        WHEN 4 THEN 3500 + (RAND() * 1500)  -- deLuxe
        ELSE 1000 + (RAND() * 500)          -- Discount
    END as total_pris,
    'Bekræftet' as booking_status
FROM booking_dates
WHERE date <= '2024-12-31'
ORDER BY RAND()  -- Randomize the distribution
LIMIT 500;  -- Increased limit for better coverage

-- 6. Insert bike rentals (unchanged)
INSERT INTO cykel_udlejning (cykel_type, låsekode, udlejnings_start_dato, udlejnings_slut_dato, gæste_id, status, sidste_lejer_id)
WITH RECURSIVE numbers AS (
    SELECT 1 AS n UNION ALL SELECT n + 1 FROM numbers WHERE n < 120
)
SELECT 
    CASE (n % 2)
        WHEN 0 THEN 'El-cykel'
        ELSE 'Ladcykel'
    END,
    CONCAT('KODE', LPAD(n, 4, '0')),
    CASE (n % 4)
        WHEN 0 THEN NULL
        ELSE DATE_ADD(CURRENT_DATE, INTERVAL (n % 30) - 15 DAY)
    END,
    CASE (n % 4)
        WHEN 0 THEN NULL
        ELSE DATE_ADD(CURRENT_DATE, INTERVAL (n % 30) - 13 DAY)
    END,
    CASE (n % 4)
        WHEN 0 THEN NULL
        ELSE (n % 120) + 1
    END,
    CASE (n % 4)
        WHEN 0 THEN 'Ledig'
        ELSE 'Udlejet'
    END,
    CASE (n % 4)
        WHEN 0 THEN NULL
        ELSE ((n + 30) % 120) + 1
    END
FROM numbers;

-- 7. Insert conference bookings with better distribution
INSERT INTO konference_bookinger (hotel_id, gæste_id, start_dato, slut_dato, antal_gæster, kunde_ønsker, forplejning, udstyr)
WITH RECURSIVE numbers AS (
    SELECT 1 AS n UNION ALL SELECT n + 1 FROM numbers WHERE n < 120
)
SELECT 
    (n % 5) + 1,  -- Ensure even distribution across all hotels
    (n % 120) + 1,
    DATE_ADD(CURRENT_DATE, INTERVAL (n % 365) DAY),  -- Spread throughout the year
    DATE_ADD(CURRENT_DATE, INTERVAL (n % 365) + 1 + (n % 3) DAY),  -- Variable duration
    20 + (n % 81),
    CASE (n % 4)
        WHEN 0 THEN 'Projektor og whiteboard ønskes'
        WHEN 1 THEN 'Særlige forplejningsønsker'
        WHEN 2 THEN 'Bordopstilling i U-form'
        ELSE 'Standard opstilling'
    END,
    CASE (n % 3)
        WHEN 0 THEN 'Fuld forplejning'
        WHEN 1 THEN 'Morgenmad og frokost'
        ELSE 'Kun kaffe/te service'
    END,
    CASE (n % 3)
        WHEN 0 THEN 'Projektor, whiteboard, højtalere'
        WHEN 1 THEN 'Basis AV-udstyr'
        ELSE 'Ingen særlige ønsker'
    END
FROM numbers;

-- 8. Insert Pope Francis as VIP guest
INSERT INTO gæster (fornavn, efternavn, telefon_nummer, email, adresse, status) 
VALUES (
    'Francis',
    'Pope',
    '+39 06 6982',
    'francis@vatican.va',
    'Vatican City',
    'VIP'
);

-- 9. Insert Pope's conference booking
INSERT INTO konference_bookinger (
    hotel_id,
    gæste_id,
    start_dato,
    slut_dato,
    antal_gæster,
    kunde_ønsker,
    forplejning,
    udstyr
) VALUES (
    1, -- The Pope hotel
    LAST_INSERT_ID(), -- Pave Francis ID
    CURRENT_DATE,
    DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY),
    50,
    'Særlige sikkerhedskrav og privat indgang ønskes',
    'Fuld forplejning med specielle diætkrav',
    'Projektor, lydanlæg, simultantolkning'
);