"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Mermaid from "./mermaid"
import ExportDiagramsButton from "./export-diagrams-button"

// Define the diagrams object with Mermaid syntax for each diagram type
export const diagrams: Record<string, string> = {
  erd: `
erDiagram
    HOTELLER ||--o{ VAERELSER : has
    HOTELLER ||--o{ HOTEL_PERSONALE : employs
    HOTELLER ||--o{ BOOKINGER : contains
    GAESTER ||--o{ BOOKINGER : makes
    GAESTER ||--o{ CYKEL_UDLEJNING : rents
    GAESTER ||--o{ KONFERENCE_BOOKINGER : books
    VAERELSER ||--o{ BOOKINGER : "reserved in"

    HOTELLER {
        int hotel_id PK
        string hotel_navn
        string adresse
        enum hotel_type "S/L"
        timestamp oprettet_den
    }

    GAESTER {
        int gaeste_id PK
        string fornavn
        string efternavn
        string telefon
        string email
        string adresse
        enum gaeste_type "D/F/U"
        enum status "Aktiv/Inaktiv/VIP"
        text noter
        timestamp oprettet_den
    }

    VAERELSER {
        int vaerelse_id PK
        int hotel_id FK
        enum vaerelse_type "D/S/F"
        decimal pris
        boolean tilgaengelig
    }

    BOOKINGER {
        int booking_id PK
        int gaeste_id FK
        int hotel_id FK
        int vaerelse_id FK
        date check_ind_dato
        date check_ud_dato
        boolean online_booking
        boolean fdm_medlem
        decimal total_pris
        enum booking_status "Bekraeftet/Afventende/Annulleret"
    }

    HOTEL_PERSONALE {
        int personale_id PK
        int hotel_id FK
        string fornavn
        string efternavn
        enum stilling "Administrator/Receptionist/Leder"
        date ansaettelses_dato
        decimal loen
    }

    CYKEL_UDLEJNING {
        int cykel_id PK
        int gaeste_id FK
        enum cykel_type "El-cykel/Ladcykel"
        string laasekode
        date start_dato
        date slut_dato
        enum status "Ledig/Udlejet"
    }

    KONFERENCE_BOOKINGER {
        int konference_id PK
        int hotel_id FK
        int gaeste_id FK
        date start_dato
        date slut_dato
        int antal_gaester
        text kunde_oensker
        string forplejning
        string udstyr
    }
  `,
  schema: `
graph TB
    subgraph "Core Tables" 
        H["🏨 Hoteller"]
        G["👥 Gæster"]
        V["🛏️ Værelser"]
        B["📅 Bookinger"]
    end
    
    subgraph "Additional Services"
        C["🚲 Cykel Udlejning"]
        K["🎯 Konference Bookinger"]
    end
    
    subgraph "Management"
        P["👤 Hotel Personale"]
    end
    
    H -->|has| V
    H -->|contains| B
    H -->|employs| P
    G -->|makes| B
    G -->|rents| C
    G -->|books| K
    V -->|reserved in| B

    classDef default fill:#1F2937,stroke:#4B5563,color:#E5E7EB;
    classDef core fill:#374151,stroke:#4B5563,color:#E5E7EB;
    class H,G,V,B core;
  `,
  views: `
graph LR
    subgraph "Database Views"
        A["📊 v_ledige_værelser"]
        B["📋 v_aktuelle_bookinger"]
        C["📈 v_hotel_belægning"]
        D["⭐ v_vip_gæster"]
        E["👥 v_personale_fordeling"]
    end
    
    subgraph "Source Tables"
        H["🏨 Hoteller"]
        V["🛏️ Værelser"]
        B1["📅 Bookinger"]
        G["👥 Gæster"]
        P["👤 Personale"]
    end
    
    H -->|source| A
    V -->|source| A
    B1 -->|source| A
    H -->|source| B
    G -->|source| B
    B1 -->|source| B
    H -->|source| C
    V -->|source| C
    B1 -->|source| C
    G -->|source| D
    B1 -->|source| D
    H -->|source| E
    P -->|source| E

    classDef default fill:#1F2937,stroke:#4B5563,color:#E5E7EB;
    classDef view fill:#374151,stroke:#4B5563,color:#E5E7EB;
    class A,B,C,D,E view;
  `,
  statistics: `
graph TB
    subgraph Key Metrics
        A[Booking Statistics]
        B[Revenue Analysis]
        C[Occupancy Rates]
        D[Customer Segments]
    end
    
    A --> E[Monthly Trends]
    A --> F[Seasonal Patterns]
    B --> G[Revenue per Room]
    B --> H[Total Revenue]
    C --> I[Room Utilization]
    C --> J[Peak Periods]
    D --> K[Guest Types]
    D --> L[Booking Patterns]
  `,
  performance: `
graph LR
    subgraph Database Metrics
        A[Query Performance]
        B[Storage Usage]
        C[Index Stats]
        D[Cache Metrics]
    end
    
    A --> E[Avg Response: 45ms]
    A --> F[Peak Load: 1000 qps]
    A --> G[Total Queries: 1M]
    B --> H[Total: 500GB]
    B --> I[Growth: 2GB/month]
    C --> J[Size: 50GB]
    C --> K[Usage: 95%]
    D --> L[Buffer Hit: 99%]
    D --> M[Query Cache: 85%]
  `,
  dataflow: `
sequenceDiagram
    participant C as Client
    participant A as API
    participant D as Database
    participant S as Storage
    
    C->>A: Request Booking
    A->>D: Check Availability
    D->>A: Room Status
    A->>D: Create Booking
    D->>S: Store Data
    S->>D: Confirm Storage
    D->>A: Booking Created
    A->>C: Confirmation
  `,
  deployment: `
graph TB
    subgraph Production
        A[Load Balancer]
        B[Web Server 1]
        C[Web Server 2]
        D[Database Primary]
        E[Database Replica]
    end
    
    A --> B
    A --> C
    B --> D
    C --> D
    D --> E
  `,
  checkin: `
stateDiagram-v2
    [*] --> Arrival
    Arrival --> CheckIn: Guest Arrives
    CheckIn --> RoomAssignment: Verify Booking
    RoomAssignment --> KeyHandover: Room Ready
    KeyHandover --> Complete: Keys Given
    Complete --> [*]
  `,
  booking: `
sequenceDiagram
    participant G as Guest
    participant R as Reception
    participant S as System
    participant D as Database
    
    G->>R: Request Booking
    R->>S: Check Availability
    S->>D: Query Rooms
    D->>S: Available Rooms
    S->>R: Show Options
    R->>G: Present Choices
    G->>R: Confirm Booking
    R->>S: Create Booking
    S->>D: Store Booking
    D->>S: Confirm
    S->>R: Booking Complete
    R->>G: Confirmation
  `
}


// Define a type for the valid diagram keys
type DiagramType = 'erd' | 'schema' | 'views' | 'statistics' | 'performance' | 'dataflow' | 'deployment' | 'checkin' | 'booking';

export default function DatabaseDiagrams() {
  const [activeTab, setActiveTab] = useState<DiagramType>('deployment')
  const [key, setKey] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Handle initial mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Force re-render when tab changes
  useEffect(() => {
    if (mounted) {
      setKey(prev => prev + 1)
    }
  }, [activeTab, mounted])

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <ExportDiagramsButton />
        </div>
        <div className="h-[600px] w-full bg-[#121212] rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ExportDiagramsButton />
      </div>
      <Tabs 
        defaultValue="deployment" 
        className="space-y-4" 
        onValueChange={(value) => setActiveTab(value as DiagramType)}
      >
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="erd">ERD</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="views">Views</TabsTrigger>
          <TabsTrigger value="statistics">Stats</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="dataflow">Data Flow</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="checkin">Check-in</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>{getDiagramTitle(activeTab)}</CardTitle>
            <CardDescription>{getDiagramDescription(activeTab)}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto bg-[#121212] p-4 rounded-lg" data-diagram-type={activeTab}>
              <Mermaid key={`${activeTab}-${key}`} chart={diagrams[activeTab]} />
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}

function getDiagramTitle(type: DiagramType): string {
  const titles: Record<DiagramType, string> = {
    erd: "Entity Relationship Diagram",
    schema: "Database Schema Overview",
    views: "Database Views Relationships",
    statistics: "Hotel System Statistics",
    performance: "Database Performance Metrics",
    dataflow: "System Data Flow",
    deployment: "Deployment Architecture",
    checkin: "Check-in Process",
    booking: "Booking Process"
  }
  return titles[type]
}

function getDiagramDescription(type: DiagramType): string {
  const descriptions: Record<DiagramType, string> = {
    erd: "Shows the relationships between all database tables",
    schema: "Visual representation of the database structure",
    views: "Illustrates how views connect different tables",
    statistics: "Key metrics and utilization statistics",
    performance: "Database performance and resource utilization metrics",
    dataflow: "Visualizes how data flows through the system",
    deployment: "Shows the system deployment architecture",
    checkin: "Illustrates the guest check-in process",
    booking: "Shows the booking process flow"
  }
  return descriptions[type]
}