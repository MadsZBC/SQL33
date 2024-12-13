/* eslint-disable */
// @ts-nocheck

"use client"

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes"
import { ThemeProvider } from "next-themes"
import DatabaseGenerator from "./database-generator"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { MermaidDiagram } from './mermaid-diagram';

const tables = [
  {
    name: 'hoteller',
    columns: [
      { name: 'hotel_id', type: 'INT', constraints: 'NOT NULL' },
      { name: 'hotel_navn', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'adresse', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
      { name: 'hotel_type', type: 'ENUM', constraints: "NOT NULL DEFAULT 'S', ('S', 'L')" },
      { name: '_pk_hotel', type: 'CONSTRAINT', constraints: 'PRIMARY KEY (hotel_id)' },
      { name: '_chk_hotel_id', type: 'CONSTRAINT', constraints: 'CHECK (hotel_id BETWEEN 1 AND 5)' }
    ]
  },
  {
    name: 'gæster',
    columns: [
      { name: 'gæste_id', type: 'INT', constraints: 'NOT NULL AUTO_INCREMENT' },
      { name: 'fornavn', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'efternavn', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'telefon_nummer', type: 'VARCHAR(20)', constraints: 'NOT NULL' },
      { name: 'email', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
      { name: 'adresse', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
      { name: 'gæste_type', type: 'ENUM', constraints: "NOT NULL DEFAULT 'D', ('D', 'F', 'U')" },
      { name: 'status', type: 'ENUM', constraints: "DEFAULT 'Aktiv', ('Aktiv', 'Inaktiv', 'VIP')" },
      { name: 'noter', type: 'TEXT', constraints: 'NULL' },
      { name: 'oprettet_den', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP' },
      { name: '_pk_gæst', type: 'CONSTRAINT', constraints: 'PRIMARY KEY (gæste_id)' },
      { name: '_chk_email', type: 'CONSTRAINT', constraints: "CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$')" }
    ]
  },
  {
    name: 'værelser',
    columns: [
      { name: 'værelse_id', type: 'INT', constraints: 'NOT NULL' },
      { name: 'hotel_id', type: 'INT', constraints: 'NOT NULL' },
      { name: 'værelse_type', type: 'ENUM', constraints: "NOT NULL, ('D', 'S', 'F')" },
      { name: 'pris', type: 'DECIMAL(8,2)', constraints: 'NOT NULL' },
      { name: '_pk_værelse', type: 'CONSTRAINT', constraints: 'PRIMARY KEY (værelse_id, hotel_id)' },
      { name: '_chk_pris', type: 'CONSTRAINT', constraints: 'CHECK (pris BETWEEN 0 AND 9999)' },
      { name: '_fk_værelse_hotel', type: 'CONSTRAINT', constraints: 'FOREIGN KEY (hotel_id) REFERENCES hoteller(hotel_id)' }
    ]
  },
  {
    name: 'bookinger',
    columns: [
      { name: 'booking_id', type: 'INT', constraints: 'NOT NULL AUTO_INCREMENT' },
      { name: 'gæste_id', type: 'INT', constraints: 'NOT NULL' },
      { name: 'hotel_id', type: 'INT', constraints: 'NOT NULL' },
      { name: 'værelse_id', type: 'INT', constraints: 'NOT NULL' },
      { name: 'check_ind_dato', type: 'DATE', constraints: 'NOT NULL' },
      { name: 'check_ud_dato', type: 'DATE', constraints: 'NOT NULL' },
      { name: 'online_booking', type: 'BOOLEAN', constraints: 'DEFAULT FALSE' },
      { name: 'fdm_medlem', type: 'BOOLEAN', constraints: 'DEFAULT FALSE' },
      { name: 'total_pris', type: 'DECIMAL(10,2)', constraints: 'NOT NULL' },
      { name: 'booking_status', type: 'ENUM', constraints: "DEFAULT 'Afventende', ('Bekræftet', 'Afventende', 'Annulleret')" },
      { name: '_pk_booking', type: 'CONSTRAINT', constraints: 'PRIMARY KEY (booking_id)' },
      { name: '_fk_booking_gæst', type: 'CONSTRAINT', constraints: 'FOREIGN KEY (gæste_id) REFERENCES gæster(gæste_id)' },
      { name: '_fk_booking_hotel', type: 'CONSTRAINT', constraints: 'FOREIGN KEY (hotel_id) REFERENCES hoteller(hotel_id)' },
      { name: '_fk_booking_værelse', type: 'CONSTRAINT', constraints: 'FOREIGN KEY (værelse_id, hotel_id) REFERENCES værelser(værelse_id, hotel_id)' },
      { name: '_chk_booking_datoer', type: 'CONSTRAINT', constraints: 'CHECK (check_ud_dato > check_ind_dato)' }
    ]
  },
  {
    name: 'hotel_personale',
    columns: [
      { name: 'personale_id', type: 'INT', constraints: 'NOT NULL AUTO_INCREMENT' },
      { name: 'fornavn', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'efternavn', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'stillingsbetegnelse', type: 'ENUM', constraints: "NOT NULL, ('Administrator', 'Rengøringsassistent', 'Leder', 'Receptionist', 'Kok', 'Tjener')" },
      { name: 'hotel_id', type: 'INT', constraints: 'NOT NULL' },
      { name: 'ansættelsesdato', type: 'DATE', constraints: 'NOT NULL' },
      { name: 'løn', type: 'DECIMAL(10,2)', constraints: 'NULL' },
      { name: 'noter', type: 'TEXT', constraints: 'NULL' },
      { name: '_pk_personale', type: 'CONSTRAINT', constraints: 'PRIMARY KEY (personale_id)' },
      { name: '_fk_personale_hotel', type: 'CONSTRAINT', constraints: 'FOREIGN KEY (hotel_id) REFERENCES hoteller(hotel_id)' }
    ]
  },
  {
    name: 'cykel_udlejning',
    columns: [
      { name: 'cykel_id', type: 'INT', constraints: 'NOT NULL AUTO_INCREMENT' },
      { name: 'cykel_type', type: 'ENUM', constraints: "NOT NULL, ('El-cykel', 'Ladcykel')" },
      { name: 'låsekode', type: 'VARCHAR(10)', constraints: 'NOT NULL' },
      { name: 'udlejnings_start_dato', type: 'DATE', constraints: 'NULL' },
      { name: 'udlejnings_slut_dato', type: 'DATE', constraints: 'NULL' },
      { name: 'gæste_id', type: 'INT', constraints: 'NULL' },
      { name: 'status', type: 'ENUM', constraints: "NOT NULL DEFAULT 'Ledig', ('Ledig', 'Udlejet')" },
      { name: 'sidste_lejer_id', type: 'INT', constraints: 'NULL' },
      { name: '_pk_cykel', type: 'CONSTRAINT', constraints: 'PRIMARY KEY (cykel_id)' },
      { name: '_fk_cykel_gæst', type: 'CONSTRAINT', constraints: 'FOREIGN KEY (gæste_id) REFERENCES gæster(gæste_id)' },
      { name: '_fk_cykel_sidste_lejer', type: 'CONSTRAINT', constraints: 'FOREIGN KEY (sidste_lejer_id) REFERENCES gæster(gæste_id)' }
    ]
  },
  {
    name: 'konference_bookinger',
    columns: [
      { name: 'konference_id', type: 'INT', constraints: 'NOT NULL AUTO_INCREMENT' },
      { name: 'hotel_id', type: 'INT', constraints: 'NOT NULL' },
      { name: 'gæste_id', type: 'INT', constraints: 'NOT NULL' },
      { name: 'start_dato', type: 'DATE', constraints: 'NOT NULL' },
      { name: 'slut_dato', type: 'DATE', constraints: 'NOT NULL' },
      { name: 'antal_gæster', type: 'INT', constraints: 'NOT NULL' },
      { name: 'kunde_ønsker', type: 'TEXT', constraints: 'NULL' },
      { name: 'forplejning', type: 'VARCHAR(100)', constraints: 'NULL' },
      { name: 'udstyr', type: 'VARCHAR(100)', constraints: 'NULL' },
      { name: '_pk_konference', type: 'CONSTRAINT', constraints: 'PRIMARY KEY (konference_id)' },
      { name: '_fk_konference_hotel', type: 'CONSTRAINT', constraints: 'FOREIGN KEY (hotel_id) REFERENCES hoteller(hotel_id)' },
      { name: '_fk_konference_gæst', type: 'CONSTRAINT', constraints: 'FOREIGN KEY (gæste_id) REFERENCES gæster(gæste_id)' },
      { name: '_chk_konference_datoer', type: 'CONSTRAINT', constraints: 'CHECK (slut_dato > start_dato)' },
      { name: '_chk_antal_gæster', type: 'CONSTRAINT', constraints: 'CHECK (antal_gæster > 0)' }
    ]
  }
];

// ... (keep all the existing constants: tables, theoryContent)

const views = [
  {
    name: 'v_ledige_værelser',
    description: 'Viser ledige værelser for hvert hotel',
    sqlCommand: `
CREATE VIEW v_ledige_værelser AS
SELECT h.hotel_navn, v.værelse_id, v.værelse_type, v.pris
FROM hoteller h
JOIN værelser v ON h.hotel_id = v.hotel_id
LEFT JOIN bookinger b ON v.værelse_id = b.værelse_id
  AND v.hotel_id = b.hotel_id
  AND b.check_ind_dato <= CURDATE() 
  AND b.check_ud_dato > CURDATE()
WHERE b.booking_id IS NULL;
    `,
    sampleResult: [
      { hotel_navn: 'Grand Hotel', værelse_id: 101, værelse_type: 'Dobbeltværelse', pris: 1000.00 },
      { hotel_navn: 'Strandhotellet', værelse_id: 205, værelse_type: 'Familieværelse', pris: 1500.00 },
    ]
  },
  {
    name: 'v_aktuelle_bookinger',
    description: 'Viser aktuelle bookinger med gæste information',
    sqlCommand: `
CREATE VIEW v_aktuelle_bookinger AS
SELECT b.booking_id, h.hotel_navn, g.fornavn, g.efternavn, 
       b.check_ind_dato, b.check_ud_dato, b.total_pris
FROM bookinger b
JOIN hoteller h ON b.hotel_id = h.hotel_id
JOIN gæster g ON b.gæste_id = g.gæste_id
WHERE b.check_ind_dato <= CURDATE() AND b.check_ud_dato > CURDATE();
    `,
    sampleResult: [
      { booking_id: 1, hotel_navn: 'Grand Hotel', fornavn: 'John', efternavn: 'Doe', check_ind_dato: '2023-06-01', check_ud_dato: '2023-06-05', total_pris: 4000.00 },
      { booking_id: 2, hotel_navn: 'Seaside Resort', fornavn: 'Jane', efternavn: 'Smith', check_ind_dato: '2023-06-02', check_ud_dato: '2023-06-07', total_pris: 7500.00 },
    ]
  },
  {
    name: 'v_hotel_belægning',
    description: 'Viser belægningsprocent for hvert hotel',
    sqlCommand: `
CREATE VIEW v_hotel_belægning AS
SELECT h.hotel_navn,
       COUNT(v.værelse_id) AS total_værelser,
       COUNT(b.booking_id) AS bookede_værelser,
       (COUNT(b.booking_id) * 100.0 / COUNT(v.værelse_id)) AS belægningsprocent
FROM hoteller h
LEFT JOIN værelser v ON h.hotel_id = v.hotel_id
LEFT JOIN bookinger b ON v.værelse_id = b.værelse_id
  AND b.check_ind_dato <= CURDATE() AND b.check_ud_dato > CURDATE()
GROUP BY h.hotel_id, h.hotel_navn;
    `,
    sampleResult: [
      { hotel_navn: 'Grand Hotel', total_værelser: 100, bookede_værelser: 75, belægningsprocent: 75.00 },
      { hotel_navn: 'Seaside Resort', total_værelser: 50, bookede_værelser: 40, belægningsprocent: 80.00 },
    ]
  },
  {
    name: 'v_vip_gæster',
    description: 'Viser VIP gæster og deres bookinghistorik',
    sqlCommand: `
CREATE VIEW v_vip_gæster AS
SELECT g.gæste_id, g.fornavn, g.efternavn, g.email,
       COUNT(b.booking_id) AS antal_bookinger,
       SUM(b.total_pris) AS total_forbrug
FROM gæster g
LEFT JOIN bookinger b ON g.gæste_id = b.gæste_id
WHERE g.status = 'VIP'
GROUP BY g.gæste_id, g.fornavn, g.efternavn, g.email;
    `,
    sampleResult: [
      { gæste_id: 1, fornavn: 'Alice', efternavn: 'Johnson', email: 'alice@example.com', antal_bookinger: 5, total_forbrug: 25000.00 },
      { gæste_id: 2, fornavn: 'Bob', efternavn: 'Williams', email: 'bob@example.com', antal_bookinger: 3, total_forbrug: 15000.00 },
    ]
  },
  {
    name: 'v_personale_fordeling',
    description: 'Viser personalefordeling per hotel og type',
    sqlCommand: `
CREATE VIEW v_personale_fordeling AS
SELECT 
    h.hotel_navn,
    hp.stillingsbetegnelse,
    COUNT(*) as antal,
    GROUP_CONCAT(CONCAT(hp.fornavn, ' ', hp.efternavn)) as ansatte
FROM hotel_personale hp
JOIN hoteller h ON hp.hotel_id = h.hotel_id
GROUP BY h.hotel_navn, hp.stillingsbetegnelse;`
  },
  {
    name: 'v_konference_status',
    description: 'Viser aktuelle og kommende konferencer',
    sqlCommand: `
CREATE VIEW v_konference_status AS
SELECT 
    h.hotel_navn,
    k.start_dato,
    k.slut_dato,
    k.antal_gæster,
    CONCAT(g.fornavn, ' ', g.efternavn) as kontaktperson,
    k.forplejning,
    k.udstyr,
    k.kunde_ønsker
FROM konference_bookinger k
JOIN hoteller h ON k.hotel_id = h.hotel_id
JOIN gæster g ON k.gæste_id = g.gæste_id
WHERE k.slut_dato >= CURDATE()
ORDER BY k.start_dato;`
  }
];

const procedures = [
  {
    name: 'sp_opret_booking',
    description: 'Opretter en ny booking',
    sqlCommand: `
CREATE PROCEDURE sp_opret_booking(
  IN p_gæste_id INT,
  IN p_hotel_id INT,
  IN p_værelse_id INT,
  IN p_check_ind_dato DATE,
  IN p_check_ud_dato DATE
)
BEGIN
  DECLARE v_total_pris DECIMAL(10,2);
  DECLARE v_antal_dage INT;
  
  -- Beregn antal dage
  SET v_antal_dage = DATEDIFF(p_check_ud_dato, p_check_ind_dato);
  
  -- Beregn total pris
  SELECT v_antal_dage * pris INTO v_total_pris
  FROM værelser
  WHERE værelse_id = p_værelse_id;
  
  -- Indsæt ny booking
  INSERT INTO bookinger (gæste_id, hotel_id, værelse_id, check_ind_dato, check_ud_dato, total_pris, booking_status)
  VALUES (p_gæste_id, p_hotel_id, p_værelse_id, p_check_ind_dato, p_check_ud_dato, v_total_pris, 'Bekræftet');
  
  -- Returner booking_id
  SELECT LAST_INSERT_ID() AS booking_id;
END;
    `,
    sampleResult: [
      { booking_id: 123 }
    ]
  },
  {
    name: 'sp_opdater_booking_status',
    description: 'Opdaterer status for en eksisterende booking',
    sqlCommand: `
CREATE PROCEDURE sp_opdater_booking_status(
  IN p_booking_id INT,
  IN p_ny_status VARCHAR(20)
)
BEGIN
  UPDATE bookinger
  SET booking_status = p_ny_status
  WHERE booking_id = p_booking_id;
  
  SELECT ROW_COUNT() AS affected_rows;
END;
    `,
    sampleResult: [
      { affected_rows: 1 }
    ]
  },
  {
    name: 'sp_find_ledige_værelser',
    description: 'Finder ledige værelser for en given periode',
    sqlCommand: `
CREATE PROCEDURE sp_find_ledige_værelser(
  IN p_hotel_id INT,
  IN p_check_ind_dato DATE,
  IN p_check_ud_dato DATE
)
BEGIN
  SELECT v.værelse_id, v.værelse_type, v.pris
  FROM værelser v
  WHERE v.hotel_id = p_hotel_id
    AND v.værelse_id NOT IN (
      SELECT b.værelse_id
      FROM bookinger b
      WHERE b.hotel_id = p_hotel_id
        AND b.check_ind_dato < p_check_ud_dato
        AND b.check_ud_dato > p_check_ind_dato
    );
END;
    `,
    sampleResult: [
      { værelse_id: 101, værelse_type: 'Dobbeltværelse', pris: 1000.00 },
      { værelse_id: 102, værelse_type: 'Enkeltværelse', pris: 800.00 },
      { værelse_id: 103, værelse_type: 'Familieværelse', pris: 1500.00 },
    ]
  },
  {
    name: 'sp_hotel_rapport',
    description: 'Genererer en rapport over hotel aktivitet',
    sqlCommand: `
CREATE PROCEDURE sp_hotel_rapport(
  IN p_hotel_id INT,
  IN p_start_dato DATE,
  IN p_slut_dato DATE
)
BEGIN
  SELECT 
    COUNT(DISTINCT b.booking_id) AS antal_bookinger,
    SUM(b.total_pris) AS total_omsætning,
    AVG(DATEDIFF(b.check_ud_dato, b.check_ind_dato)) AS gns_ophold_dage,
    COUNT(DISTINCT g.gæste_id) AS unikke_gæster
  FROM hoteller h
  LEFT JOIN bookinger b ON h.hotel_id = b.hotel_id
  LEFT JOIN gæster g ON b.gæste_id = g.gæste_id
  WHERE h.hotel_id = p_hotel_id
    AND b.check_ind_dato >= p_start_dato
    AND b.check_ud_dato <= p_slut_dato;
END;
    `,
    sampleResult: [
      { antal_bookinger: 150, total_omsætning: 225000.00, gns_ophold_dage: 3.5, unikke_gæster: 120 }
    ]
  },
  {
    name: 'sp_opdater_personale_status',
    description: 'Verificerer korrekt personalefordeling per hotel',
    sqlCommand: `
CREATE PROCEDURE sp_opdater_personale_status(IN p_hotel_id INT)
BEGIN
    DECLARE v_rengøring INT;
    DECLARE v_ledere INT;
    DECLARE v_reception INT;
    DECLARE v_service INT;
    
    SELECT 
        COUNT(CASE WHEN stillingsbetegnelse = 'Rengøringsassistent' THEN 1 END) as rengøring,
        COUNT(CASE WHEN stillingsbetegnelse = 'Leder' THEN 1 END) as ledere,
        COUNT(CASE WHEN stillingsbetegnelse = 'Receptionist' THEN 1 END) as reception,
        COUNT(CASE WHEN stillingsbetegnelse IN ('Kok', 'Tjener') THEN 1 END) as service
    INTO v_rengøring, v_ledere, v_reception, v_service
    FROM hotel_personale
    WHERE hotel_id = p_hotel_id;
    
    -- Verificer minimumskrav
    IF v_rengøring < 3 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For få rengøringsmedarbejdere';
    END IF;
    
    IF v_ledere < 2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For få ledere';
    END IF;
    
    IF v_reception < 8 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For få receptionister';
    END IF;
    
    IF v_service < 8 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For få service medarbejdere';
    END IF;
END;`
  }
];

const theoryContent = [
  {
    title: "Normalisering",
    content: `
Normaliseringsprocessen er fundamental for databasedesign og sikrer dataintegritet gennem systematisk organisering af data. Her gennemgås hver normalform i detaljer:

\`\`\`mermaid
flowchart TD
    A[Database Normalisering] --> B[1NF: Grundlæggende Rydning]
    A --> C[2NF: Fjern Overlap]
    A --> D[3NF: Ryd op i Forbindelser]
    A --> E[BCNF: Avanceret Oprydning]

    B --> B1[Eksempel: Gæsteliste]
    B1[Adskil gentagne felter] --> B2[Telefoner i særskilt tabel]

    C --> C1[Eksempel: Booking]
    C1[Fjern delte informationer] --> C2[Separer værelse og pris]

    D --> D1[Eksempel: Medarbejderdata]
    D1[Fjern indirekte afhængigheder] --> D2[Adskil stillingsbetegnelse]

    E --> E1[Eksempel: Komplekse Systemer]
    E1[Optimer komplicerede relationer] --> E2[Forfin datastruktur]
\`\`\`

1. Første Normalform (1NF):
• Definition: Eliminerer gentagne grupper og sikrer atomare værdier
• Implementering:
  - Identificer og fjern gentagne kolonner
  - Opret separate tabeller for relaterede data
  - Definer primærnøgler for hver tabel
• Eksempel fra vores system:
  Før normalisering:
    Gæst(id, navn, telefon1, telefon2, telefon3)
  Efter 1NF:
    Gæst(id, navn)
    GæstTelefoner(gæst_id, telefonnummer)

2. Anden Normalform (2NF):
• Definition: Fjerner partielle afhængigheder
• Implementeringstrin:
  - Identificer alle partielle afhængigheder
  - Opret nye tabeller for disse afhængigheder
  - Etabler relationer via fremmednøgler
• Praktisk anvendelse:
  - Booking-system opdeling
  - Værelses-kategori relation
  - Prisstruktur normalisering

3. Tredje Normalform (3NF):
• Definition: Eliminerer transitive afhængigheder
• Hovedprincipper:
  - Alle attributter skal være afhængige af nøglen
  - Ingen attributter må være afhængige af ikke-nøgle attributter
• Systemeksempler:
  - Adresseopdeling i komponenter
  - Priskategori normalisering
  - Personalekategorisering

4. Boyce-Codd Normalform (BCNF):
• Avanceret normaliseringsform
• Anvendelsesområder:
  - Komplekse mange-til-mange relationer
  - Hierarkiske datastrukturer
• Implementering i vores system:
  - Personalevagtplaner
  - Værelseskategorisering
  - Prisstrukturering

Praktiske Overvejelser:
• Performance vs. Normalisering
• Strategisk denormalisering
• Vedligeholdelsesimplikationer
• Skalerbarhedsovervejelser`
  },
  {
    title: "Databaseindeksering",
    content: `
Indeksering er kritisk for databaseydeevne og optimering. Her er de centrale koncepter:

1. Primære Indekser:
• Automatisk oprettet på primærnøgler
• B-træ struktur for effektiv søgning
• Anvendelse i vores system:
  - hotel_id i hoteller tabellen
  - booking_id i bookinger tabellen
  - gæst_id i gæster tabellen

2. Sekundære Indekser:
• Formål og anvendelse:
  - Optimering af ofte brugte søgekriterier
  - Understøttelse af foreign key constraints
  - Forbedring af sorteringsoperationer
• Implementerede indekser:
  - check_ind_dato, check_ud_dato i bookinger
  - værelse_type i værelser
  - email i gæster

3. Sammensatte Indekser:
• Designprincipper:
  - Kolonne rækkefølge betydning
  - Selektivitet og kardinalitet
  - Anvendelsesmønstre
• Eksempler:
  - (hotel_id, check_ind_dato, check_ud_dato)
  - (gæst_id, booking_status)
  - (værelse_type, pris)

4. Indekseringsstrategier:
• Overvejelser ved indeksdesign:
  - Query patterns analyse
  - Write/read ratio evaluering
  - Storage overhead vurdering
• Vedligeholdelse:
  - Regelmæssig indeksanalyse
  - Fragmentering håndtering
  - Performance monitorering`
  },
  {
    title: "Transaktionshåndtering",
    content: `
Forståelse og implementering af transaktioner er essentielt for dataintegritet:

1. ACID Egenskaber:
• Atomaritet:
  - Transaktioner er udelelige enheder
  - Enten gennemføres alle operationer eller ingen
  - Implementeret via rollback mekanismer

• Konsistens:
  - Database forbliver i valid tilstand
  - Constraints overholdes
  - Referentiel integritet bevares

• Isolation:
  - Samtidige transaktioner påvirker ikke hinanden
  - Implementeret via låsemekanismer
  - Isolation levels i vores system

• Durability:
  - Gennemførte transaktioner er permanente
  - Implementeret via write-ahead logging
  - Recovery mekanismer

2. Isolationsniveauer:
• READ UNCOMMITTED:
  - Laveste isolationsniveau
  - Tillader dirty reads
  - Bruges kun i specielle tilfælde

• READ COMMITTED:
  - Standard i vores system
  - Forhindrer dirty reads
  - Balanceret performance

• REPEATABLE READ:
  - Forhindrer non-repeatable reads
  - Højere isolation
  - Bruges ved kritiske operationer

• SERIALIZABLE:
  - Højeste isolationsniveau
  - Komplet isolation
  - Anvendes ved finansielle transaktioner

3. Praktisk Implementering:
• Bookingprocessen:
  - Værelsetilgængelighed check
  - Prisopdatering
  - Bekræftelsesprocess

• Concurrent Booking Håndtering:
  - Låsestrategi
  - Deadlock prevention
  - Error recovery

4. Performance Optimering:
• Transaktionslængde:
  - Minimering af transaktionstid
  - Optimal batch størrelse
  - Resource management

• Låsestrategi:
  - Row-level locking
  - Table-level locking
  - Optimistisk vs. pessimistisk låsning`
  },
  {
    title: "Databasesikkerhed",
    content: `
Omfattende sikkerhedsstrategi for beskyttelse af hoteldata:

1. Adgangskontrol:
• Brugerautentificering:
  - Password hashing med bcrypt
  - Multi-faktor autentificering
  - Session management
  - Token-baseret adgang

• Rollebaseret Adgangskontrol (RBAC):
  - Systemadministrator
    * Fuld adgang til alle systemer
    * Backup og restore rettigheder
    * Brugeradministration
  
  - Hotelmanager
    * Fuld adgang til eget hotel
    * Rapporteringsværktøjer
    * Personalehåndtering
  
  - Receptionist
    * Booking administration
    * Gæstehåndtering
    * Begrænset rapport adgang
  
  - Rengøringspersonale
    * Værelsesstatus opdatering
    * Arbejdsplanlægning
    * Begrænset værelsesinfo

2. Datakryptering:
• Transport Layer Security:
  - TLS 1.3 protokol
  - Certifikathåndtering
  - Secure key exchange

• Data at Rest:
  - Transparent Data Encryption (TDE)
  - Backup kryptering
  - Key management system

3. Audit og Logging:
• Systemhændelser:
  - Login forsøg
  - Privilegerede handlinger
  - Systemændringer

• Dataændringer:
  - CRUD operationer
  - Tidsstempling
  - Brugeridentifikation

4. Compliance:
• GDPR Overholdelse:
  - Dataminimering
  - Formålsbegrænsning
  - Opbevaringspolitik
  - Datasubjekt rettigheder`
  },
  {
    title: "Ydeevneoptimering",
    content: `
Strategier og teknikker for optimal databaseydeevne:

1. Query Optimering:
• Eksekveringsplan Analyse:
  - EXPLAIN ANALYZE anvendelse
  - Indeksudnyttelse
  - Join optimering
  - Subquery evaluering

• Query Omskrivning:
  - Materialized Views
  - Common Table Expressions (CTE)
  - Temporary Tables
  - Derived Tables

2. Caching Strategier:
• Applikationsniveau:
  - Redis implementation
  - Cache invalidering
  - Cache warming
  - Hit/miss ratio monitorering

• Databaseniveau:
  - Buffer pool optimering
  - Query cache konfiguration
  - Prepared statements
  - Statement caching

3. Partitionering:
• Horisonal Partitionering:
  - Date-based partitioning
    * Bookinger pr. år
    * Historiske data
  - Range partitioning
    * Prisintervaller
    * Gæstekategorier

• Vertikal Partitionering:
  - Kolonnebaseret opdeling
  - Arkivering af historiske data
  - Cold/hot data separation

4. Hardware Optimering:
• Storage Configuration:
  - RAID setup
  - SSD anvendelse
  - I/O optimering

• Memory Management:
  - RAM allokering
  - Swap konfiguration
  - Buffer pools`
  },
  {
    title: "Backup og Recovery",
    content: `
Omfattende strategi for databeskyttelse og gendannelse:

1. Backup Typer:
• Fuld Backup:
  - Ugentlig komplet backup
  - Point-in-time recovery basis
  - Komprimering og kryptering
  - Offsite storage

• Inkrementel Backup:
  - Daglige ændringer
  - Hurtig backup proces
  - Minimal storage impact
  - Effektiv båndbreddeudnyttelse

• Differential Backup:
  - Mellem-niveau backup
  - Siden sidste fulde backup
  - Balance mellem storage og tid
  - Simplificeret recovery

2. Recovery Strategier:
• Point-in-Time Recovery:
  - Transaction log replay
  - Consistency check
  - Data validation
  - Application recovery

• Disaster Recovery:
  - Offsite backup restoration
  - Failover procedurer
  - Business continuity
  - Recovery time objectives

3. Backup Validering:
• Integrity Check:
  - Checksum validering
  - Restore test
  - Data completeness
  - Application consistency

• Performance Metrics:
  - Backup window
  - Recovery time
  - Storage efficiency
  - Network impact

4. Automatisering:
• Scheduled Jobs:
  - Backup rotation
  - Monitoring alerts
  - Status reporting
  - Cleanup procedures

• Verification:
  - Automated testing
  - Restore validation
  - Error handling
  - Notification system`
  },
  {
    title: "Skalerbarhed",
    content: `
Strategier for at håndtere voksende datamængder og belastning:

1. Vertikal Skalering:
• Hardware Opgradering:
  - CPU optimering
  - RAM udvidelse
  - Storage forbedring
  - Network kapacitet

• Software Optimering:
  - Konfigurationsjustering
  - Resource allocation
  - Thread management
  - Connection pooling

2. Horisontal Skalering:
• Read Replicas:
  - Load balancing
  - Read/write splitting
  - Replication lag handling
  - Failover configuration

• Sharding:
  - Data distribution
  - Shard key selection
  - Cross-shard queries
  - Shard balancing

3. Microservices:
• Service Opdeling:
  - Booking service
  - Customer service
  - Inventory service
  - Payment service

• Service Kommunikation:
  - API gateway
  - Message queues
  - Event sourcing
  - Circuit breakers

4. Cloud Integration:
• Cloud Services:
  - Managed databases
  - Auto-scaling
  - Load balancing
  - Backup services

• Hybrid Setup:
  - On-premise integration
  - Data synchronization
  - Failover scenarios
  - Security compliance`
  }
];

// Add this new documentation content
const documentationContent = [
  {
    title: "Systemarkitektur",
    content: `
• Databasetype: MySQL/MariaDB med InnoDB lagringsmotor
• Tegnsæt: utf8mb4 med dansk sortering (utf8mb4_danish_ci)
• Begrænsninger: Fuld referentiel integritet med fremmednøgler
• Visninger: Materialiserede visninger for optimeret ydeevne

ACID Principper:
• Atomaritet: Transaktioner er udelelige (alt eller intet)
• Konsistens: Data forbliver konsistent via begrænsninger og udløsere
• Isolation: Transaktioner er isolerede (READ COMMITTED isolationsniveau)
• Holdbarhed: Gennemførte transaktioner er permanente via InnoDB

Sikkerhedskopiering:
• Daglige komplette sikkerhedskopier
• Time-baserede inkrementelle sikkerhedskopier
• Binær log til punkt-i-tid gendannelse`
  },
  {
    title: "Database Design Mønstre",
    content: `
• Normalisering: Databasen følger 3NF/BCNF normalform
• Begrænsninger: CHECK begrænsninger for forretningsregler
• Indekser: Sammensatte indekser for optimerede sammenkoblinger
• Udløsere: Automatisk datavalidering og revisionslogning

Designmønstre:
• Stjernestruktur for bookinganalyse
• Langsomt ændrende dimensioner (SCD) for gæstehistorik
• Temporale tabeller for bookinghistorik
• Materialiserede visninger for ydeevneoptimering

Indeksstrategier:
• Sammensatte indekser: (hotel_id, check_ind_dato, check_ud_dato)
• Dækkende indekser: Inkluderer hyppigt anvendte kolonner
• Delvise indekser: For specifikke WHERE betingelser`
  },
  {
    title: "Ydeevneoptimering",
    content: `
Forespørgselsoptimering:
• EXPLAIN ANALYZE for ydeevneanalyse
• Optimal JOIN rækkefølge
• Effektiv brug af underforespørgsler
• Indeks-baserede opslag hvor muligt

Cachestrategi:
• Forespørgselscache: Deaktiveret (MySQL 8.0+)
• Bufferpool: Optimeret for InnoDB
• Tabelcache: Dimensioneret efter samtidige forbindelser

Overvågning:
• Ydeevnemetrikker
• Fejllogning
• Kapacitetsplanlægning`
  },
  {
    title: "Lagrede Procedurer",
    content: `
Bookingsystem:
• sp_opret_booking: Håndterer ny booking med validering
• sp_find_ledige_værelser: Optimeret søgning
• sp_hotel_rapport: Genererer ydeevnemetrikker

Fejlhåndtering:
• SIGNAL SQLSTATE for brugerdefinerede fejl
• Transaktionshåndtering med ROLLBACK
• Fejllogning i separat tabel

Parametre:
• IND/UD parametre for fleksibel brug
• Korrekt parametervalidering
• Standardværdier hvor relevant`
  },
  {
    title: "Visninger og Rapportering",
    content: `
Centrale Visninger:
• v_ledige_værelser: Realtidstilgængelighed
• v_aktuelle_bookinger: Nuværende bookinger
• v_hotel_belægning: Belægningsmetrikker
• v_vip_gæster: VIP-gæsteanalyse

Rapporteringsvisninger:
• v_hotel_månedlig_omsætning: Omsætningsanalyse
• v_populære_værelser: Værelses popularitet
• v_personale_fordeling: Personaledistribution

Ydeevneovervejelser:
• Indekserede visninger hvor muligt
• Materialiserede visninger for tunge beregninger
• Optimal JOIN optimering`
  },
  {
    title: "Sikkerhedsmodel",
    content: `
Adgangskontrol:
• Rollebaseret adgangskontrol (RBAC)
• Mindste privilegium princip
• Rækkeniveau sikkerhed via visninger

Databeskyttelse:
• Krypterede forbindelser (TLS)
• Hashede adgangskoder
• Revisionslogning

Brugerroller:
• db_admin: Fuld adgang
• hotel_leder: Læse/skrive for specifikt hotel
• receptionist: Begrænset skriveadgang
• analytiker: Skrivebeskyttet adgang til visninger`
  },
  {
    title: "Sikkerhedskopiering & Gendannelse",
    content: `
Sikkerhedskopieringsstrategi:
• Daglige komplette sikkerhedskopier
• Time-baserede inkrementelle sikkerhedskopier
• Binær log til punkt-i-tid gendannelse

Gendannelsesprocedurer:
• Punkt-i-tid gendannelse (PITR)
• Transaktionslog genafspilning
• Automatiseret gendannelsestest

Overvågning:
• Ydeevnemetrikker
• Fejllogning
• Kapacitetsplanlægning`
  }
];

function generateSQLCommand(viewOrProcedure: any, params: Record<string, any>) {
  let sqlCommand = viewOrProcedure.sqlCommand;

  // Replace parameters in SQL command
  Object.entries(params).forEach(([key, value]) => {
    // Format the value based on its type
    const paramValue = formatParamValue(value);
    
    // Replace both @param_name and p_param_name patterns
    sqlCommand = sqlCommand
      .replace(new RegExp(`@${key}\\b`, 'g'), paramValue)
      .replace(new RegExp(`p_${key}\\b`, 'g'), paramValue);
  });

  return sqlCommand;
}

// Helper function to format parameter values based on their type
function formatParamValue(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  switch (typeof value) {
    case 'boolean':
      return value ? '1' : '0';
    case 'number':
      return value.toString();
    case 'string':
      // Check if it's a date string
      if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
        return `'${value}'`;
      }
      return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
    default:
      return `'${String(value)}'`;
  }
}

// Add this interface for type safety
interface SQLParams {
  [key: string]: string | number | boolean;
}

// Add this component for parameter inputs
function SQLParameterInputs({ 
  parameters, 
  onParameterChange,
  onUpdate
}: { 
  parameters: SQLParams, 
  onParameterChange: (newParams: SQLParams) => void,
  onUpdate?: () => void
}) {
  const handleChange = (newParams: SQLParams) => {
    onParameterChange(newParams);
    onUpdate?.();
  };

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {Object.entries(parameters).map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <label className="text-sm font-medium truncate mb-1">{key}</label>
          {typeof value === 'boolean' ? (
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange({ ...parameters, [key]: e.target.checked })}
              className="h-4 w-4"
            />
          ) : typeof value === 'number' ? (
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange({ ...parameters, [key]: Number(e.target.value) })}
              className="border rounded px-2 py-1 text-sm w-full"
            />
          ) : key.includes('dato') ? (
            <input
              type="date"
              value={value as string}
              onChange={(e) => handleChange({ ...parameters, [key]: e.target.value })}
              className="border rounded px-2 py-1 text-sm w-full"
            />
          ) : (
            <input
              type="text"
              value={value as string}
              onChange={(e) => handleChange({ ...parameters, [key]: e.target.value })}
              className="border rounded px-2 py-1 text-sm w-full"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function HotelDatabaseSchema() {
  const [viewParams, setViewParams] = useState<SQLParams>({
    CURDATE: new Date().toISOString().split('T')[0]
  });

  const [procedureParams, setProcedureParams] = useState<SQLParams>({
    gæste_id: 1,
    hotel_id: 1,
    værelse_id: 101,
    check_ind_dato: new Date().toISOString().split('T')[0],
    check_ud_dato: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    ny_status: 'Bekræftet',
    start_dato: new Date().toISOString().split('T')[0],
    slut_dato: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0], // 30 days ahead
    online_booking: true,
    fdm_medlem: false,
    antal_gæster: 2,
    total_pris: 1000,
    booking_status: 'Bekræftet'
  });

  const [generatedSQLs, setGeneratedSQLs] = useState<Record<string, string>>({});

  // Update the handleGenerate function to handle all procedures
  const handleGenerate = (procedureName: string) => {
    const procedure = procedures.find(p => p.name === procedureName);
    
    if (procedure) {
      try {
        const sql = generateSQLCommand(procedure, procedureParams);
        setGeneratedSQLs(prev => ({
          ...prev,
          [procedureName]: sql
        }));
      } catch (error) {
        console.error(`Error generating SQL for ${procedureName}:`, error);
      }
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        <Card className="w-full max-w-[1400px] mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Hotel Database Skema</CardTitle>
              <CardDescription>Omfattende oversigt over hotel database systemet</CardDescription>
            </div>
            <TemaSkift />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tables">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="tables">Tabeller</TabsTrigger>
                <TabsTrigger value="views">Visninger</TabsTrigger>
                <TabsTrigger value="procedures">Procedurer</TabsTrigger>
                <TabsTrigger value="theory">Teori</TabsTrigger>
                <TabsTrigger value="documentation">Dokumentation</TabsTrigger>
                <TabsTrigger value="generator">Generator</TabsTrigger>
              </TabsList>
              <TabsContent value="tables">
                {tables.map((table) => (
                  <Card key={table.name} className="mt-4">
                    <CardHeader>
                      <CardTitle>{table.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Column</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Constraints</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {table.columns.map((column) => (
                            <TableRow key={column.name}>
                              <TableCell>{column.name}</TableCell>
                              <TableCell>{column.type}</TableCell>
                              <TableCell>{column.constraints}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="views">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>View Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Parameters</TableHead>
                      <TableHead>SQL Command</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {views.map((view) => (
                      <TableRow key={view.name}>
                        <TableCell>{view.name}</TableCell>
                        <TableCell>{view.description}</TableCell>
                        <TableCell>
                          <SQLParameterInputs 
                            parameters={viewParams} 
                            onParameterChange={setViewParams} 
                            onUpdate={handleGenerate}
                          />
                        </TableCell>
                        <TableCell>
                          <SyntaxHighlighter
                            language="sql"
                            style={vscDarkPlus}
                            customStyle={{
                              padding: '1rem',
                              borderRadius: '0.5rem',
                              margin: 0,
                            }}
                          >
                            {generateSQLCommand(view, viewParams)}
                          </SyntaxHighlighter>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="procedures">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Procedure Name</TableHead>
                      <TableHead className="w-[150px]">Description</TableHead>
                      <TableHead className="w-[200px]">Parameters</TableHead>
                      <TableHead>SQL Command</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {procedures.map((procedure) => (
                      <TableRow key={procedure.name} className="align-top">
                        <TableCell className="whitespace-nowrap">{procedure.name}</TableCell>
                        <TableCell>{procedure.description}</TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <SQLParameterInputs 
                              parameters={procedureParams} 
                              onParameterChange={setProcedureParams}
                            />
                            <Button 
                              type="button"
                              onClick={() => handleGenerate(procedure.name)}
                              className="w-full"
                            >
                              Generate SQL
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="w-[600px]">
                          {generatedSQLs[procedure.name] && (
                            <SyntaxHighlighter
                              language="sql"
                              style={vscDarkPlus}
                              customStyle={{
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                margin: 0,
                                fontSize: '0.75rem',
                                lineHeight: '1.2',
                                maxHeight: '500px',
                                width: '100%',
                                overflow: 'auto'
                              }}
                              showLineNumbers={true}
                              wrapLongLines={true}
                            >
                              {generatedSQLs[procedure.name]}
                            </SyntaxHighlighter>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="theory">
                <Accordion type="single" collapsible className="w-full">
                  {theoryContent.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>{item.title}</AccordionTrigger>
                      <AccordionContent>
                        {item.content.includes('```mermaid') ? (
                          <>
                            <MermaidDiagram 
                              chart={item.content
                                .split('```mermaid')[1]
                                .split('```')[0]
                                .trim()} 
                            />
                            <pre className="whitespace-pre-wrap">
                              {item.content.split('```mermaid')[2]}
                            </pre>
                          </>
                        ) : (
                          <pre className="whitespace-pre-wrap">{item.content}</pre>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              <TabsContent value="documentation">
                <Accordion type="single" collapsible className="w-full">
                  {documentationContent.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>{item.title}</AccordionTrigger>
                      <AccordionContent>
                        <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md">
                          {item.content}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              <TabsContent value="generator">
                <DatabaseGenerator views={views} procedures={procedures} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );
}

function TemaSkift() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.5rem] w-[1.3rem] dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
      <span className="sr-only">Skift tema</span>
    </Button>
  )
}


