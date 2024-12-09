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

const tables = [
  {
    name: 'hoteller',
    columns: [
      { name: 'hotel_id', type: 'INT', constraints: 'PRIMARY KEY, CHECK (hotel_id BETWEEN 1 AND 5)' },
      { name: 'hotel_navn', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'adresse', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
      { name: 'hotel_type', type: 'ENUM', constraints: "NOT NULL DEFAULT 'S', ('S', 'L')" },
    ]
  },
  {
    name: 'gæster',
    columns: [
      { name: 'gæste_id', type: 'INT', constraints: 'PRIMARY KEY, AUTO_INCREMENT' },
      { name: 'fornavn', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'efternavn', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'telefon_nummer', type: 'VARCHAR(20)', constraints: 'NOT NULL' },
      { name: 'email', type: 'VARCHAR(255)', constraints: 'NOT NULL, UNIQUE, CHECK (email REGEXP)' },
      { name: 'adresse', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
      { name: 'gæste_type', type: 'ENUM', constraints: "NOT NULL DEFAULT 'D', ('D', 'F', 'U')" },
      { name: 'status', type: 'ENUM', constraints: "DEFAULT 'Aktiv', ('Aktiv', 'Inaktiv', 'VIP')" },
      { name: 'noter', type: 'TEXT', constraints: 'NULL' },
      { name: 'oprettet_den', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP' },
    ]
  },
  {
    name: 'værelser',
    columns: [
      { name: 'værelse_id', type: 'INT', constraints: 'PRIMARY KEY (with hotel_id)' },
      { name: 'hotel_id', type: 'INT', constraints: 'PRIMARY KEY, FOREIGN KEY' },
      { name: 'værelse_type', type: 'ENUM', constraints: "NOT NULL, ('D', 'S', 'F')" },
      { name: 'pris', type: 'DECIMAL(8,2)', constraints: 'NOT NULL, CHECK (pris BETWEEN 0 AND 9999)' },
    ]
  },
  {
    name: 'bookinger',
    columns: [
      { name: 'booking_id', type: 'INT', constraints: 'PRIMARY KEY, AUTO_INCREMENT' },
      { name: 'gæste_id', type: 'INT', constraints: 'FOREIGN KEY NOT NULL' },
      { name: 'hotel_id', type: 'INT', constraints: 'FOREIGN KEY NOT NULL' },
      { name: 'værelse_id', type: 'INT', constraints: 'FOREIGN KEY NOT NULL' },
      { name: 'check_ind_dato', type: 'DATE', constraints: 'NOT NULL' },
      { name: 'check_ud_dato', type: 'DATE', constraints: 'NOT NULL' },
      { name: 'online_booking', type: 'BOOLEAN', constraints: 'DEFAULT FALSE' },
      { name: 'fdm_medlem', type: 'BOOLEAN', constraints: 'DEFAULT FALSE' },
      { name: 'total_pris', type: 'DECIMAL(10,2)', constraints: 'NOT NULL' },
      { name: 'booking_status', type: 'ENUM', constraints: "DEFAULT 'Afventende', ('Bekræftet', 'Afventende', 'Annulleret')" },
    ]
  },
  {
    name: 'hotel_personale',
    columns: [
      { name: 'personale_id', type: 'INT', constraints: 'PRIMARY KEY, AUTO_INCREMENT' },
      { name: 'fornavn', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'efternavn', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'stillingsbetegnelse', type: 'ENUM', constraints: "NOT NULL, ('Administrator', 'Rengøringsassistent', 'Leder', 'Receptionist', 'Kok', 'Tjener')" },
      { name: 'hotel_id', type: 'INT', constraints: 'FOREIGN KEY NOT NULL' },
      { name: 'ansættelsesdato', type: 'DATE', constraints: 'NOT NULL' },
      { name: 'løn', type: 'DECIMAL(10,2)', constraints: 'NULL' },
      { name: 'noter', type: 'TEXT', constraints: 'NULL' },
    ]
  },
  {
    name: 'cykel_udlejning',
    columns: [
      { name: 'cykel_id', type: 'INT', constraints: 'PRIMARY KEY, AUTO_INCREMENT' },
      { name: 'cykel_type', type: 'ENUM', constraints: "NOT NULL, ('El-cykel', 'Ladcykel')" },
      { name: 'låsekode', type: 'VARCHAR(10)', constraints: 'NOT NULL' },
      { name: 'udlejnings_start_dato', type: 'DATE', constraints: 'NULL' },
      { name: 'udlejnings_slut_dato', type: 'DATE', constraints: 'NULL' },
      { name: 'gæste_id', type: 'INT', constraints: 'FOREIGN KEY NULL' },
      { name: 'status', type: 'ENUM', constraints: "NOT NULL DEFAULT 'Ledig', ('Ledig', 'Udlejet')" },
      { name: 'sidste_lejer_id', type: 'INT', constraints: 'FOREIGN KEY NULL' },
    ]
  },
  {
    name: 'konference_bookinger',
    columns: [
      { name: 'konference_id', type: 'INT', constraints: 'PRIMARY KEY, AUTO_INCREMENT' },
      { name: 'hotel_id', type: 'INT', constraints: 'FOREIGN KEY NOT NULL' },
      { name: 'gæste_id', type: 'INT', constraints: 'FOREIGN KEY NOT NULL' },
      { name: 'start_dato', type: 'DATE', constraints: 'NOT NULL' },
      { name: 'slut_dato', type: 'DATE', constraints: 'NOT NULL' },
      { name: 'antal_gæster', type: 'INT', constraints: 'NOT NULL, CHECK (antal_gæster > 0)' },
      { name: 'kunde_ønsker', type: 'TEXT', constraints: 'NULL' },
      { name: 'forplejning', type: 'VARCHAR(100)', constraints: 'NULL' },
      { name: 'udstyr', type: 'VARCHAR(100)', constraints: 'NULL' },
    ]
  }
];

// Add documentation for types
const typeDocumentation = {
  hotelTypes: [
    { code: 'S', description: 'Standard hotel' },
    { code: 'L', description: 'Luksus hotel' }
  ],
  guestTypes: [
    { code: 'D', description: 'Dansk statsborger' },
    { code: 'F', description: 'Firma' },
    { code: 'U', description: 'Udenlandsk' }
  ],
  roomTypes: [
    { code: 'D', description: 'Dobbeltværelse' },
    { code: 'S', description: 'Single værelse' },
    { code: 'F', description: 'Familie værelse' }
  ],
  guestStatus: [
    { code: 'Aktiv', description: 'Normal aktiv gæst' },
    { code: 'Inaktiv', description: 'Inaktiv gæst' },
    { code: 'VIP', description: 'VIP gæst med særlige fordele' }
  ]
};

// Add this to your documentation tab content
const documentationContent = [
  {
    title: 'Systemarkitektur',
    content: `
• Database Type: MySQL/MariaDB
• Character Set: utf8mb4
• Collation: utf8mb4_danish_ci
• Storage Engine: InnoDB
• Constraints: Referential Integrity via Foreign Keys
• Indexing: B-tree indexes for performance optimization
    `
  },
  {
    title: 'Type Dokumentation',
    content: Object.entries(typeDocumentation)
      .map(([category, types]) => 
        `${category}:\n${types.map(t => `• ${t.code}: ${t.description}`).join('\n')}`
      )
      .join('\n\n')
  },
  {
    title: 'Performance Optimering',
    content: `
Indexes:
• idx_gæst_navn på gæster (efternavn, fornavn)
• idx_booking_datoer på bookinger (check_ind_dato, check_ud_dato)
• idx_personale_hotel på hotel_personale (hotel_id, stillingsbetegnelse)
    `
  }
];

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
  AND b.check_ind_dato <= CURDATE() AND b.check_ud_dato > CURDATE()
WHERE b.booking_id IS NULL;
    `,
    sampleResult: [
      { hotel_navn: 'Grand Hotel', værelse_id: 101, værelse_type: 'Dobbeltværelse', pris: 1000.00 },
      { hotel_navn: 'Seaside Resort', værelse_id: 205, værelse_type: 'Familieværelse', pris: 1500.00 },
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
];

const theoryContent = [
  {
    title: "Normalisering",
    content: `
      Databasen implementerer 3NF (Tredje Normalform):
      - Eliminerer gentagne grupper
      - Fjerner partielle afhængigheder
      - Fjerner transitive afhængigheder

      Eksempel på 3NF struktur:
      - hoteller (hotel_id, navn, adresse)
      - værelser (værelse_id, hotel_id, type, pris)
      - bookinger (booking_id, værelse_id, gæste_id, ...)

      Fordele ved 3NF:
      1. Balance mellem integritet og performance
      2. Minimerer dataredundans
      3. Lettere at opdatere data
      4. Reducerer risiko for anomalier
    `
  },
  {
    title: "Indeksering",
    content: `
      Systemet bruger forskellige indekstyper for optimering:
      - Simpelt indeks: CREATE INDEX \`idx_gæst_navn\` ON \`gæster\` (\`efternavn\`, \`fornavn\`);
      - Sammensat indeks: CREATE INDEX \`idx_booking_datoer\` ON \`bookinger\` (\`check_ind_dato\`, \`check_ud_dato\`);

      Fordele ved indeksering:
      1. Hurtigere søgninger
      2. Forbedret join-performance
      3. Optimeret sortering og gruppering
    `
  },
  {
    title: "Transaktionshåndtering",
    content: `
      Stored procedures implementerer ACID gennem:
      START TRANSACTION;
          -- operations
          IF error_condition THEN
              ROLLBACK;
          ELSE
              COMMIT;
          END IF;

      ACID-principper:
      - Atomicity: Transaktioner er atomare (alt eller intet)
      - Consistency: Data forbliver konsistent
      - Isolation: Transaktioner er isolerede fra hinanden
      - Durability: Gennemførte transaktioner er permanente
    `
  },
  {
    title: "Views",
    content: `
      Systemet bruger non-materialized views:
      CREATE OR REPLACE VIEW v_hotel_månedlig_omsætning AS
      SELECT 
          h.hotel_navn,
          DATE_FORMAT(b.check_ind_dato, '%Y-%m') as måned,
          COUNT(b.booking_id) as antal_bookinger
      FROM hoteller h
      LEFT JOIN bookinger b ON h.hotel_id = b.hotel_id

      Fordele ved non-materialized views:
      1. Altid opdateret data
      2. Ingen ekstra diskplads
      3. Automatisk vedligeholdelse

      Ulemper:
      1. Kan være langsommere end materialized views
      2. Belaster databasen ved hver forespørgsel
    `
  },
  {
    title: "Stored Procedures",
    content: `
      Eksempel på procedural logik:
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

      Fordele ved stored procedures:
      1. Forbedret sikkerhed
      2. Reduceret netværkstrafik
      3. Genbrugelig kode
      4. Nemmere vedligeholdelse
    `
  },
  {
    title: "Constraints",
    content: `
      Forskellige typer constraints sikrer dataintegritet:

      1. Domain Constraint:
         CONSTRAINT \`chk_pris\` CHECK (\`pris\` BETWEEN 0 AND 9999)

      2. Entity Constraint:
         PRIMARY KEY (\`booking_id\`)

      3. Referential Constraint:
         FOREIGN KEY (\`hotel_id\`) REFERENCES \`hoteller\` (\`hotel_id\`)

      4. User-Defined Constraint:
         CONSTRAINT \`chk_email\` CHECK (
             \`email\` REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'
         )

      Fordele ved constraints:
      1. Sikrer dataintegritet
      2. Forhindrer ugyldige data i at blive indsat
      3. Opretholder relationer mellem tabeller
    `
  },
  {
    title: "Database Design Principper",
    content: `
      Systemet følger centrale designprincipper:

      1. Single Responsibility Principle (SRP):
         - Hver tabel har ét klart formål
         - Værelser håndterer kun værelsesinformation
         - Bookinger håndterer kun bookingdetaljer

      2. Interface Segregation:
         - Views er opdelt efter specifikt formål
         - v_hotel_belægning fokuserer kun på belægning
         - v_vip_gæster fokuserer kun på VIP-information

      3. Dependency Inversion:
         - Tabeller afhænger af abstraktioner (foreign keys)
         - Løs kobling mellem moduler
         - Nemmere at vedligeholde og ændre
    `
  },
  {
    title: "Data Access Patterns",
    content: `
      Implementerede mønstre for dataadgang:

      1. Repository Pattern:
         - Views fungerer som repositories
         - Abstraherer kompleks SQL-logik
         - Giver konsistent grænseflade

      2. Unit of Work:
         - Transaktioner i stored procedures
         - Sikrer datakonsistens
         - Håndterer fejl gracefully

      3. Query Object:
         - Komplekse forespørgsler i views
         - Genbrugelig forretningslogik
         - Optimeret for performance
    `
  },
  {
    title: "Sikkerhedsprincipper",
    content: `
      Implementerede sikkerhedsmekanismer:

      1. Input Validering:
         - Constraint checks på alle inputs
         - Regulære udtryk for email/telefon
         - Datotype validering

      2. Access Control:
         - Role-based access (RBAC)
         - Procedure-niveau sikkerhed
         - View-baseret data isolation

      3. Audit Trail:
         - Logging af kritiske operationer
         - Timestamp på alle bookinger
         - Sporbarhed af ændringer
    `
  }
];

function generateSQLCommand(viewOrProcedure: any, params: Record<string, any>) {
  let sqlCommand = viewOrProcedure.sqlCommand;

  // Debug: Log parameters
  console.log("Parameters:", params);

  // Replace parameters in SQL command
  Object.entries(params).forEach(([key, value]) => {
    const paramValue = typeof value === 'boolean' 
      ? (value ? '1' : '0') 
      : typeof value === 'string' 
        ? `'${value}'` 
        : value;
    
    sqlCommand = sqlCommand.replace(new RegExp(`@${key}\\b`, 'g'), paramValue);
  });

  // Debug: Log generated SQL command
  console.log("Generated SQL Command:", sqlCommand);

  return sqlCommand;
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
          <label className="text-sm font-medium">{key}</label>
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
              className="border rounded px-2 py-1"
            />
          ) : key.includes('dato') ? (
            <input
              type="date"
              value={value as string}
              onChange={(e) => handleChange({ ...parameters, [key]: e.target.value })}
              className="border rounded px-2 py-1"
            />
          ) : (
            <input
              type="text"
              value={value as string}
              onChange={(e) => handleChange({ ...parameters, [key]: e.target.value })}
              className="border rounded px-2 py-1"
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
    hotel_id: 2,
    værelse_id: 101,
    check_ind_dato: new Date().toISOString().split('T')[0],
    check_ud_dato: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    online_booking: true,
    fdm_medlem: false
  });

  const [generatedSQL, setGeneratedSQL] = useState('');

  // Remove the useEffect and make handleGenerate more explicit
  const handleGenerate = () => {
    console.log("Generate button clicked"); // Debug log
    const procedure = procedures.find(p => p.name === 'sp_opret_booking');
    console.log("Found procedure:", procedure); // Log if procedure is found
    
    if (procedure) {
      try {
        const sql = generateSQLCommand(procedure, procedureParams);
        console.log("Generated SQL:", sql); // Debug log
        setGeneratedSQL(sql);
      } catch (error) {
        console.error("Error generating SQL:", error);
      }
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Hotel Database Schema</CardTitle>
              <CardDescription>Comprehensive overview of the hotel database system</CardDescription>
            </div>
            <ThemeToggle />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tables">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="tables">Tables</TabsTrigger>
                <TabsTrigger value="views">Views</TabsTrigger>
                <TabsTrigger value="procedures">Procedures</TabsTrigger>
                <TabsTrigger value="theory">Theory</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
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
                          <pre className="whitespace-pre-wrap overflow-x-auto">
                            {generateSQLCommand(view, viewParams)}
                          </pre>
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
                      <TableHead>Procedure Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Parameters</TableHead>
                      <TableHead>SQL Command</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {procedures.map((procedure) => (
                      <TableRow key={procedure.name}>
                        <TableCell>{procedure.name}</TableCell>
                        <TableCell>{procedure.description}</TableCell>
                        <TableCell>
                          <SQLParameterInputs 
                            parameters={procedureParams} 
                            onParameterChange={setProcedureParams}
                          />
                          <Button 
                            type="button"
                            onClick={() => {
                              console.log("Button clicked"); // Debug log
                              handleGenerate();
                            }}
                            className="mt-2"
                          >
                            Generate SQL
                          </Button>
                        </TableCell>
                        <TableCell>
                          <pre className="whitespace-pre-wrap overflow-x-auto">
                            {procedure.name === 'sp_opret_booking' ? generatedSQL : ''}
                          </pre>
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
                        <pre className="whitespace-pre-wrap">{item.content}</pre>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              <TabsContent value="documentation">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Systemarkitektur</AccordionTrigger>
                    <AccordionContent>
                      <p>Systemet er bygget på en relationel databasearkitektur med MySQL/MariaDB som RDBMS. Arkitekturen følger ACID-principperne:</p>
                      <ul className="list-disc pl-5">
                        <li>Atomicity: Transaktioner er atomare (alt eller intet)</li>
                        <li>Consistency: Data forbliver konsistent</li>
                        <li>Isolation: Transaktioner er isolerede fra hinanden</li>
                        <li>Durability: Gennemførte transaktioner er permanente</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Referentiel Integritet</AccordionTrigger>
                    <AccordionContent>
                      <p>Systemet bruger foreign keys til at opretholde referentiel integritet:</p>
                      <pre className="bg-muted p-2 rounded">
                        {`CONSTRAINT \`fk_booking_gæst\` FOREIGN KEY (\`gæste_id\`) 
    REFERENCES \`gæster\` (\`gæste_id\`) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE`}
                      </pre>
                      <p>Dette sikrer at:</p>
                      <ul className="list-disc pl-5">
                        <li>Der ikke kan oprettes bookinger for ikke-eksisterende gæster</li>
                        <li>Ændringer i gæste-ID'er automatisk propageres</li>
                        <li>Gæster med aktive bookinger ikke kan slettes</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Performance Optimering</AccordionTrigger>
                    <AccordionContent>
                      <p>Systemet bruger forskellige indekstyper for optimering:</p>
                      <pre className="bg-muted p-2 rounded">
                        {`-- Simpelt indeks
CREATE INDEX \`idx_gæst_navn\` 
ON \`gæster\` (\`efternavn\`, \`fornavn\`);

-- Sammensat indeks
CREATE INDEX \`idx_booking_datoer\` 
ON \`bookinger\` (\`check_ind_dato\`, \`check_ud_dato\`);`}
                      </pre>
                      <p>Disse indekser hjælper med at:</p>
                      <ul className="list-disc pl-5">
                        <li>Forbedre søgehastigheden</li>
                        <li>Optimere join-operationer</li>
                        <li>Reducere belastningen på databasen ved komplekse forespørgsler</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
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

function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.5rem] w-[1.3rem] dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

