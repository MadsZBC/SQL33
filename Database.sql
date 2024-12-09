-- Dansk Hotel Database Schema
DROP DATABASE IF EXISTS CBZHotels;
CREATE DATABASE CBZHotels
CHARACTER SET utf8mb4
COLLATE utf8mb4_danish_ci;

USE CBZHotels;

-- Fjern eksisterende tabeller i korrekt rækkefølge
DROP TABLE IF EXISTS `konference_bookinger`;
DROP TABLE IF EXISTS `cykel_udlejning`;
DROP TABLE IF EXISTS `bookinger`;
DROP TABLE IF EXISTS `værelser`;
DROP TABLE IF EXISTS `hotel_personale`;
DROP TABLE IF EXISTS `hoteller`;
DROP TABLE IF EXISTS `gæster`;

-- Opret Hoteller Tabel
CREATE TABLE `hoteller` (
    `hotel_id` INT NOT NULL,
    `hotel_navn` VARCHAR(100) NOT NULL,
    `adresse` VARCHAR(255) NOT NULL,
    `hotel_type` ENUM('S', 'L') NOT NULL DEFAULT 'S',
    PRIMARY KEY (`hotel_id`),
    CONSTRAINT `chk_hotel_id` CHECK (`hotel_id` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_danish_ci;

-- Opret Gæster Tabel med forbedret validering
CREATE TABLE `gæster` (
    `gæste_id` INT NOT NULL AUTO_INCREMENT,
    `fornavn` VARCHAR(100) NOT NULL,
    `efternavn` VARCHAR(100) NOT NULL,
    `telefon_nummer` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `adresse` VARCHAR(255) NOT NULL,
    `gæste_type` ENUM('D', 'F', 'U') NOT NULL DEFAULT 'D',
    `status` ENUM('Aktiv', 'Inaktiv', 'VIP') DEFAULT 'Aktiv',
    `noter` TEXT,
    `oprettet_den` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`gæste_id`),
    CONSTRAINT `chk_email` CHECK (
        `email` REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'
    ),
    CONSTRAINT chk_telefon 
    CHECK (telefon_nummer REGEXP '^[0-9+][0-9 -]{7,}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_danish_ci;

-- Opret Værelser Tabel
CREATE TABLE `værelser` (
    `værelse_id` INT NOT NULL,
    `hotel_id` INT NOT NULL,
    `værelse_type` ENUM('D', 'S', 'F') NOT NULL,
    `pris` DECIMAL(8,2) NOT NULL,
    PRIMARY KEY (`værelse_id`, `hotel_id`),
    CONSTRAINT `chk_pris` CHECK (`pris` BETWEEN 0 AND 9999),
    CONSTRAINT `fk_værelse_hotel` FOREIGN KEY (`hotel_id`) 
        REFERENCES `hoteller` (`hotel_id`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_danish_ci;

-- Opret Bookinger Tabel
CREATE TABLE `bookinger` (
    `booking_id` INT NOT NULL AUTO_INCREMENT,
    `gæste_id` INT NOT NULL,
    `hotel_id` INT NOT NULL,
    `værelse_id` INT NOT NULL,
    `check_ind_dato` DATE NOT NULL,
    `check_ud_dato` DATE NOT NULL,
    `online_booking` BOOLEAN DEFAULT FALSE,
    `fdm_medlem` BOOLEAN DEFAULT FALSE,
    `total_pris` DECIMAL(10,2) NOT NULL,
    `booking_status` ENUM('Bekræftet', 'Afventende', 'Annulleret') DEFAULT 'Afventende',
    PRIMARY KEY (`booking_id`),
    CONSTRAINT `fk_booking_gæst` FOREIGN KEY (`gæste_id`) 
        REFERENCES `gæster` (`gæste_id`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT `fk_booking_hotel` FOREIGN KEY (`hotel_id`) 
        REFERENCES `hoteller` (`hotel_id`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT `fk_booking_værelse` FOREIGN KEY (`værelse_id`, `hotel_id`) 
        REFERENCES `værelser` (`værelse_id`, `hotel_id`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT `chk_check_datoer` CHECK (`check_ud_dato` > `check_ind_dato`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_danish_ci;

-- Opret Hotel Personale Tabel
CREATE TABLE `hotel_personale` (
    `personale_id` INT NOT NULL AUTO_INCREMENT,
    `fornavn` VARCHAR(100) NOT NULL,
    `efternavn` VARCHAR(100) NOT NULL,
    `stillingsbetegnelse` ENUM('Administrator', 'Rengøringsassistent', 'Leder', 'Receptionist', 'Kok', 'Tjener') NOT NULL,
    `hotel_id` INT NOT NULL,
    `ansættelsesdato` DATE NOT NULL,
    `løn` DECIMAL(10,2),
    `noter` TEXT,
    PRIMARY KEY (`personale_id`),
    CONSTRAINT `fk_personale_hotel` FOREIGN KEY (`hotel_id`) 
        REFERENCES `hoteller` (`hotel_id`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT chk_løn 
    CHECK (løn >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_danish_ci;

-- Opret Cykel Udlejning Tabel
CREATE TABLE `cykel_udlejning` (
    `cykel_id` INT NOT NULL AUTO_INCREMENT,
    `cykel_type` ENUM('El-cykel', 'Ladcykel') NOT NULL,
    `låsekode` VARCHAR(10) NOT NULL,
    `udlejnings_start_dato` DATE,
    `udlejnings_slut_dato` DATE,
    `gæste_id` INT,
    `status` ENUM('Ledig', 'Udlejet') DEFAULT 'Ledig' NOT NULL,
    `sidste_lejer_id` INT,
    PRIMARY KEY (`cykel_id`),
    CONSTRAINT `fk_cykel_gæst` FOREIGN KEY (`gæste_id`) 
        REFERENCES `gæster` (`gæste_id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    CONSTRAINT `fk_cykel_sidste_lejer` FOREIGN KEY (`sidste_lejer_id`) 
        REFERENCES `gæster` (`gæste_id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_danish_ci;

-- Opret Konference Bookinger Tabel
CREATE TABLE `konference_bookinger` (
    `konference_id` INT NOT NULL AUTO_INCREMENT,
    `hotel_id` INT NOT NULL,
    `gæste_id` INT NOT NULL,
    `start_dato` DATE NOT NULL,
    `slut_dato` DATE NOT NULL,
    `antal_gæster` INT NOT NULL,
    `kunde_ønsker` TEXT,
    `forplejning` VARCHAR(100),
    `udstyr` VARCHAR(100),
    PRIMARY KEY (`konference_id`),
    CONSTRAINT `fk_konference_hotel` FOREIGN KEY (`hotel_id`) 
        REFERENCES `hoteller` (`hotel_id`),
    CONSTRAINT `fk_konference_gæst` FOREIGN KEY (`gæste_id`) 
        REFERENCES `gæster` (`gæste_id`),
    CONSTRAINT `chk_konference_datoer` CHECK (`slut_dato` > `start_dato`),
    CONSTRAINT `chk_antal_gæster` CHECK (`antal_gæster` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_danish_ci;

-- Opret Indexes for Performance
CREATE INDEX `idx_gæst_navn` ON `gæster` (`efternavn`, `fornavn`);
CREATE INDEX `idx_booking_datoer` ON `bookinger` (`check_ind_dato`, `check_ud_dato`);
CREATE INDEX `idx_personale_hotel` ON `hotel_personale` (`hotel_id`, `stillingsbetegnelse`);

-- View der viser ledige værelser for hvert hotel
CREATE VIEW v_ledige_værelser AS
SELECT 
    h.hotel_navn,
    v.værelse_id,
    v.værelse_type,
    v.pris
FROM værelser v
JOIN hoteller h ON v.hotel_id = h.hotel_id
WHERE (v.værelse_id, v.hotel_id) NOT IN (
    SELECT værelse_id, hotel_id 
    FROM bookinger 
    WHERE CURDATE() BETWEEN check_ind_dato AND check_ud_dato
    AND booking_status = 'Bekræftet'
);

-- View der viser aktuelle bookinger med gæste information
CREATE VIEW v_aktuelle_bookinger AS
SELECT 
    b.booking_id,
    h.hotel_navn,
    CONCAT(g.fornavn, ' ', g.efternavn) as gæst_navn,
    v.værelse_type,
    b.check_ind_dato,
    b.check_ud_dato,
    b.total_pris,
    b.booking_status
FROM bookinger b
JOIN hoteller h ON b.hotel_id = h.hotel_id
JOIN gæster g ON b.gæste_id = g.gæste_id
JOIN værelser v ON b.værelse_id = v.værelse_id AND b.hotel_id = v.hotel_id
WHERE b.check_ud_dato >= CURDATE()
ORDER BY b.check_ind_dato;

-- View der viser belægningsprocent for hvert hotel
CREATE VIEW v_hotel_belægning AS
SELECT 
    h.hotel_navn,
    COUNT(DISTINCT v.værelse_id) as total_værelser,
    COUNT(DISTINCT CASE 
        WHEN b.booking_status = 'Bekræftet' 
        AND CURDATE() BETWEEN b.check_ind_dato AND b.check_ud_dato 
        THEN b.værelse_id 
    END) as optagne_værelser,
    ROUND(COUNT(DISTINCT CASE 
        WHEN b.booking_status = 'Bekræftet' 
        AND CURDATE() BETWEEN b.check_ind_dato AND b.check_ud_dato 
        THEN b.værelse_id 
    END) * 100.0 / COUNT(DISTINCT v.værelse_id), 2) as belægningsprocent
FROM hoteller h
LEFT JOIN værelser v ON h.hotel_id = v.hotel_id
LEFT JOIN bookinger b ON v.værelse_id = b.værelse_id AND v.hotel_id = b.hotel_id
GROUP BY h.hotel_id, h.hotel_navn;

-- View der viser VIP gæster og deres bookinghistorik
CREATE VIEW v_vip_gæster AS
SELECT 
    CONCAT(g.fornavn, ' ', g.efternavn) as gæst_navn,
    g.email,
    g.telefon_nummer,
    COUNT(b.booking_id) as antal_bookinger,
    SUM(b.total_pris) as samlet_forbrug,
    MAX(b.check_ind_dato) as seneste_besøg
FROM gæster g
LEFT JOIN bookinger b ON g.gæste_id = b.gæste_id
WHERE g.status = 'VIP'
GROUP BY g.gæste_id, g.fornavn, g.efternavn, g.email, g.telefon_nummer;

-- Update views for the sidebar
CREATE OR REPLACE VIEW v_gæster AS
SELECT 
    gæste_id,
    fornavn,
    efternavn,
    gæste_type,
    status
FROM gæster
ORDER BY gæste_id;

CREATE OR REPLACE VIEW v_hoteller AS
SELECT 
    hotel_id,
    hotel_navn,
    hotel_type
FROM hoteller
ORDER BY hotel_id;

CREATE OR REPLACE VIEW v_værelser AS
SELECT 
    værelse_id,
    hotel_id,
    værelse_type,
    pris
FROM værelser
ORDER BY hotel_id, værelse_id;

-- Update sample data to include new type fields
INSERT INTO hoteller (hotel_id, hotel_navn, adresse, hotel_type) VALUES
(1, 'The Pope', 'Vatikangade 1, 1111 Bispeborg', 'L'),
(2, 'Lucky Star', 'Bredgade 12, 2222 Hjemby', 'S'),
(3, 'Discount', 'Billigvej 7, 3333 Lilleby', 'S'),
(4, 'deLuxe', 'Kapital Avenue 99, 4444 Borgerslev', 'L'),
(5, 'Discount', 'Billiggade 12, 6666 Roslev', 'S');

-- Add documentation comments
/*
Hotel Types:
- S = Standard
- L = Luksus

Guest Types:
- D = Dansk statsborger
- F = Firma
- U = Udenlandsk

Room Types:
- D = Dobbelt (Double)
- S = Single
- F = Familie (Family)

Guest Status:
- Aktiv
- Inaktiv
- VIP
*/

-- Tilføj audit trail tabel
CREATE TABLE audit_log (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    tabel_navn VARCHAR(50),
    operation ENUM('INSERT', 'UPDATE', 'DELETE'),
    record_id INT,
    ændret_af VARCHAR(100),
    ændret_dato TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gamle_værdier JSON,
    nye_værdier JSON
);

-- Erstat den eksisterende trigger med denne version
CREATE TRIGGER tr_audit_bookinger AFTER UPDATE ON bookinger
FOR EACH ROW
    INSERT INTO audit_log (
        tabel_navn, 
        operation, 
        record_id, 
        ændret_af, 
        gamle_værdier, 
        nye_værdier
    )
    VALUES (
        'bookinger', 
        'UPDATE',
        NEW.booking_id,
        CURRENT_USER(),
        JSON_OBJECT(
            'status', OLD.booking_status,
            'total_pris', OLD.total_pris
        ),
        JSON_OBJECT(
            'status', NEW.booking_status,
            'total_pris', NEW.total_pris
        )
    );
