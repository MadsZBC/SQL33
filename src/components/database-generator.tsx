"use client"

import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Sample data based on the actual SQL files
const VIEWS = [
  {
    name: 'v_hotel_månedlig_omsætning',
    description: 'Viser omsætning per hotel per måned',
    sqlCommand: `SELECT 
    h.hotel_navn,
    DATE_FORMAT(b.check_ind_dato, '%Y-%m') as måned,
    COUNT(b.booking_id) as antal_bookinger,
    SUM(b.total_pris) as total_omsætning,
    ROUND(AVG(b.total_pris), 2) as gennemsnit_per_booking
FROM hoteller h
LEFT JOIN bookinger b ON h.hotel_id = b.hotel_id
WHERE b.booking_status = 'Bekræftet'
GROUP BY h.hotel_id, h.hotel_navn, måned`,
    sampleResult: [
      {
        hotel_navn: 'The Pope',
        måned: '2024-03',
        antal_bookinger: 15,
        total_omsætning: 25000.00,
        gennemsnit_per_booking: 1666.67
      },
      {
        hotel_navn: 'Lucky Star',
        måned: '2024-03',
        antal_bookinger: 12,
        total_omsætning: 22000.00,
        gennemsnit_per_booking: 1833.33
      },
      {
        hotel_navn: 'Discount',
        måned: '2024-03',
        antal_bookinger: 10,
        total_omsætning: 15000.00,
        gennemsnit_per_booking: 1500.00
      },
      {
        hotel_navn: 'deLuxe',
        måned: '2024-03',
        antal_bookinger: 8,
        total_omsætning: 18000.00,
        gennemsnit_per_booking: 2250.00
      }
    ]
  },
  {
    name: 'v_populære_værelser',
    description: 'Viser statistik over populære værelsestyper',
    sqlCommand: `SELECT 
    h.hotel_navn,
    v.værelse_type,
    COUNT(b.booking_id) as antal_bookinger,
    ROUND(AVG(b.total_pris), 2) as gennemsnits_pris,
    ROUND(COUNT(b.booking_id) * 100.0 / SUM(COUNT(b.booking_id)) OVER (PARTITION BY h.hotel_id), 2) as booking_procent
FROM værelser v
JOIN hoteller h ON v.hotel_id = h.hotel_id
LEFT JOIN bookinger b ON v.værelse_id = b.værelse_id
WHERE b.booking_status = 'Bekræftet'
GROUP BY h.hotel_id, h.hotel_navn, v.værelse_type`,
    sampleResult: [
      {
        hotel_navn: 'The Pope',
        værelse_type: 'D',
        antal_bookinger: 25,
        gennemsnits_pris: 200.00,
        booking_procent: 45.5
      },
      {
        hotel_navn: 'Lucky Star',
        værelse_type: 'S',
        antal_bookinger: 15,
        gennemsnits_pris: 180.00,
        booking_procent: 30.0
      },
      {
        hotel_navn: 'Discount',
        værelse_type: 'F',
        antal_bookinger: 10,
        gennemsnits_pris: 175.00,
        booking_procent: 20.0
      }
    ]
  },
  {
    name: 'v_cykel_statistik',
    description: 'Viser statistik over cykeludlejning',
    sqlCommand: `SELECT 
    cykel_type,
    COUNT(*) as antal_cykler,
    SUM(CASE WHEN status = 'Udlejet' THEN 1 ELSE 0 END) as antal_udlejede,
    SUM(CASE WHEN status = 'Ledig' THEN 1 ELSE 0 END) as antal_ledige,
    ROUND(AVG(DATEDIFF(udlejnings_slut_dato, udlejnings_start_dato)), 1) as gns_udlejnings_dage
FROM cykel_udlejning
GROUP BY cykel_type`,
    sampleResult: [
      {
        cykel_type: 'El-cykel',
        antal_cykler: 60,
        antal_udlejede: 45,
        antal_ledige: 15,
        gns_udlejnings_dage: 2.5
      },
      {
        cykel_type: 'Ladcykel',
        antal_cykler: 60,
        antal_udlejede: 40,
        antal_ledige: 20,
        gns_udlejnings_dage: 3.0
      }
    ]
  },
  {
    name: 'v_konference_oversigt',
    description: 'Viser oversigt over konferencebookinger',
    sqlCommand: `SELECT 
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
JOIN gæster g ON k.gæste_id = g.gæste_id`,
    sampleResult: [
      {
        hotel_navn: 'The Pope',
        konference_id: 1,
        gæst_navn: 'Francis Pope',
        start_dato: '2024-03-15',
        slut_dato: '2024-03-16',
        antal_gæster: 50,
        forplejning: 'Fuld forplejning',
        udstyr: 'Projektor, whiteboard, højtalere',
        kunde_ønsker: 'Særlige forplejningsønsker'
      },
      {
        hotel_navn: 'Lucky Star',
        konference_id: 2,
        gæst_navn: 'Marie Jensen',
        start_dato: '2024-04-10',
        slut_dato: '2024-04-12',
        antal_gæster: 30,
        forplejning: 'Morgenmad og frokost',
        udstyr: 'Basis AV-udstyr',
        kunde_ønsker: 'Standard opstilling'
      }
    ]
  },
  {
    name: 'v_hotel_personale_oversigt',
    description: 'Viser oversigt over hotelpersonale',
    sqlCommand: `SELECT 
    h.hotel_navn,
    hp.stillingsbetegnelse,
    COUNT(*) as antal_ansatte,
    ROUND(AVG(hp.løn), 2) as gennemsnitsløn,
    MIN(hp.ansættelsesdato) as længst_ansættelse
FROM hotel_personale hp
JOIN hoteller h ON hp.hotel_id = h.hotel_id
GROUP BY h.hotel_navn, hp.stillingsbetegnelse`,
    sampleResult: [
      {
        hotel_navn: 'The Pope',
        stillingsbetegnelse: 'Rengøringsassistent',
        antal_ansatte: 3,
        gennemsnitsløn: 29500.00,
        længst_ansættelse: '2023-01-15'
      },
      {
        hotel_navn: 'Lucky Star',
        stillingsbetegnelse: 'Receptionist',
        antal_ansatte: 8,
        gennemsnitsløn: 34000.00,
        længst_ansættelse: '2023-02-01'
      },
      {
        hotel_navn: 'Discount',
        stillingsbetegnelse: 'Kok',
        antal_ansatte: 8,
        gennemsnitsløn: 36000.00,
        længst_ansættelse: '2023-03-01'
      }
    ]
  }
]

const PROCEDURES = [
  {
    name: 'sp_opret_booking',
    description: 'Opretter en ny booking med automatisk prisberegning',
    sqlCommand: `CALL sp_opret_booking(
  @gæste_id,
  @hotel_id,
  @værelse_id,
  @check_ind_dato,
  @check_ud_dato,
  @online_booking,
  @fdm_medlem
)`,
    parameters: ['gæste_id', 'hotel_id', 'værelse_id', 'check_ind_dato', 'check_ud_dato', 'online_booking', 'fdm_medlem'],
    sampleResult: [
      {
        booking_id: 1,
        total_pris: 400.00
      }
    ]
  },
  {
    name: 'sp_find_ledige_værelser',
    description: 'Finder ledige værelser i en given periode',
    sqlCommand: `CALL sp_find_ledige_værelser(
  @hotel_id,
  @check_ind_dato,
  @check_ud_dato
)`,
    parameters: ['hotel_id', 'check_ind_dato', 'check_ud_dato'],
    sampleResult: [
      {
        værelse_id: 1,
        værelse_type: 'Dobbeltværelse',
        pris: 200.00,
        hotel_navn: 'The Pope'
      }
    ]
  }
]

// Define a type for the sample result
type SampleResult = Record<string, string | number | boolean | Date>;

interface DatabaseItem {
  name: string;
  description: string;
  sqlCommand: string;
  parameters?: string[];
  sampleResult: SampleResult[];
}

interface DatabaseTheory {
  title: string;
  description: string;
  principles: string[];
  examples: string[];
}

const DATABASE_THEORY: DatabaseTheory[] = [
  {
    title: "Query Optimization",
    description: "Principper for optimering af database forespørgsler",
    principles: [
      "Brug af indekser for hurtigere søgning",
      "Minimering af table scans",
      "Optimering af JOIN operationer"
    ],
    examples: [
      "Composite indexes på ofte brugte søgefelter",
      "EXPLAIN ANALYZE for query performance",
      "Proper JOIN type selection (INNER vs LEFT)"
    ]
  },
  {
    title: "Data Integrity",
    description: "Sikring af datakvalitet og konsistens",
    principles: [
      "Constraint-based integrity",
      "Transaktionel integritet",
      "Referentiel integritet"
    ],
    examples: [
      "CHECK constraints på prisfelter",
      "FOREIGN KEY constraints mellem tabeller",
      "UNIQUE constraints på booking numre"
    ]
  },
  {
    title: "Performance Patterns",
    description: "Mønstre for optimal database performance",
    principles: [
      "Caching strategies",
      "Connection pooling",
      "Query result caching"
    ],
    examples: [
      "Materialized views for statiske data",
      "Prepared statements for gentagne queries",
      "Batch processing for store datasæt"
    ]
  }
];

function TheorySection() {
  return (
    <div className="space-y-6">
      {DATABASE_THEORY.map((theory) => (
        <Card key={theory.title}>
          <CardHeader>
            <CardTitle>{theory.title}</CardTitle>
            <CardDescription>{theory.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Principper:</h4>
                <ul className="list-disc pl-5">
                  {theory.principles.map((principle) => (
                    <li key={principle}>{principle}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium">Eksempler:</h4>
                <ul className="list-disc pl-5">
                  {theory.examples.map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DatabaseGenerator() {
  const [selectedType, setSelectedType] = useState<'view' | 'procedure'>('view')
  const [selectedItem, setSelectedItem] = useState<DatabaseItem | null>(null)
  const [params, setParams] = useState<Record<string, string | boolean | Date>>({})
  const [result, setResult] = useState<SampleResult[] | null>(null)

  const handleGenerate = () => {
    if (!selectedItem) return

    // Generate dynamic result based on parameters
    let generatedResult = [...selectedItem.sampleResult]

    if (selectedItem.name === 'sp_opret_booking') {
      const checkInDate = params.check_ind_dato as Date
      const checkOutDate = params.check_ud_dato as Date
      const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      const basePrice = 200 // Base price per night
      const total = days * basePrice

      generatedResult = [{
        booking_id: Math.floor(Math.random() * 1000) + 1,
        total_pris: total.toFixed(2),
        check_ind_dato: format(checkInDate, 'yyyy-MM-dd'),
        check_ud_dato: format(checkOutDate, 'yyyy-MM-dd'),
        antal_dage: days
      }]
    }

    setResult(generatedResult)
  }

  const renderParamInputs = () => {
    if (!selectedItem?.parameters) return null

    return (
      <div className="space-y-4 mt-4">
        {selectedItem.parameters.map((param) => {
          // Handle date parameters
          if (param.includes('dato')) {
            return (
              <div key={param} className="flex flex-col space-y-2">
                <Label>{param}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !params[param] && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {params[param] ? format(params[param] as Date, 'PPP') : "Vælg dato"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={params[param] as Date}
                      onSelect={(date) => {
                        if (date) {
                          setParams({ ...params, [param]: date })
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )
          }

          // Handle boolean parameters
          if (param === 'online_booking' || param === 'fdm_medlem') {
            return (
              <div key={param} className="flex flex-col space-y-2">
                <Label>{param}</Label>
                <Select
                  onValueChange={(value) => setParams({ ...params, [param]: value === 'true' })}
                  value={params[param]?.toString()}
                >
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder={`Vælg ${param}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ja</SelectItem>
                    <SelectItem value="false">Nej</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )
          }

          // Default input for other parameters
          return (
            <div key={param} className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor={param}>{param}</Label>
              <Input
                type={param.includes('pris') ? 'number' : 'text'}
                id={param}
                value={params[param]?.toString() || ''}
                onChange={(e) => setParams({ ...params, [param]: e.target.value })}
              />
            </div>
          )
        })}
      </div>
    )
  }

  const resetForm = () => {
    setParams({})
    setResult(null)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Vælg Type</Label>
        <Select 
          onValueChange={(value: 'view' | 'procedure') => {
            setSelectedType(value)
            setSelectedItem(null)
            resetForm()
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Vælg type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="view">View</SelectItem>
            <SelectItem value="procedure">Procedure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{selectedType === 'view' ? 'Vælg View' : 'Vælg Procedure'}</Label>
        <Select 
          onValueChange={(value) => {
            setSelectedItem(
              (selectedType === 'view' ? VIEWS : PROCEDURES).find(item => item.name === value) || null
            )
            resetForm()
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Vælg ${selectedType}`} />
          </SelectTrigger>
          <SelectContent>
            {(selectedType === 'view' ? VIEWS : PROCEDURES).map((item) => (
              <SelectItem key={item.name} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {renderParamInputs()}

      <div className="flex gap-2">
        <Button onClick={handleGenerate}>Generer</Button>
        <Button variant="outline" onClick={resetForm}>Nulstil</Button>
      </div>

      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedItem.name}</CardTitle>
            <CardDescription>{selectedItem.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">SQL Kommando:</h4>
                <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                  <code>{selectedItem.sqlCommand}</code>
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Resultat:</h4>
                {formatSampleResult(result || selectedItem.sampleResult)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <TheorySection />
    </div>
  )
}

const formatSampleResult = (result: SampleResult[]) => {
  if (result.length === 0) return 'No results'
  
  const headers = Object.keys(result[0])
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header) => (
            <TableHead key={header}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {result.map((row, index) => (
          <TableRow key={index}>
            {headers.map((header) => (
              <TableCell key={header}>
                {row[header] instanceof Date 
                  ? format(row[header] as Date, 'yyyy-MM-dd') 
                  : String(row[header])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

