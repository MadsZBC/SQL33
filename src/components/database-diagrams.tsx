"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Mermaid from "./mermaid"

interface DatabaseMetrics {
  queryPerformance: {
    avgResponse: string
    peakLoad: string
  }
  storageUsage: {
    total: string
    growth: string
  }
  indexStats: {
    size: string
    usage: string
  }
  cacheMetrics: {
    bufferHit: string
    queryCache: string
  }
}

// Define a type for the valid diagram keys
type DiagramType = 'erd' | 'schema' | 'views' | 'statistics' | 'performance';

export default function DatabaseDiagrams() {
  const [activeTab, setActiveTab] = useState<DiagramType>('erd')
  const [metrics, setMetrics] = useState<DatabaseMetrics | null>(null)

  // Fetch metrics every 30 seconds
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/database/metrics')
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const diagrams: Record<DiagramType, string> = {
    erd: `
    erDiagram
      GUESTS ||--o{ BOOKINGS : "makes"
      GUESTS ||--o{ CONFERENCE_BOOKINGS : "makes"
      HOTELS ||--o{ ROOMS : "has"
      HOTELS ||--o{ HOTEL_STAFF : "employs"
      HOTELS ||--o{ BIKE_RENTALS : "offers"
      ROOMS ||--o{ BOOKINGS : "included in"
      
      GUESTS {
        int guest_id PK
        string first_name
        string last_name
        string phone
        string email
        string address
        enum guest_type
        enum status
        text notes
        timestamp created_at
      }

      HOTELS {
        int hotel_id PK
        string hotel_name
        string address
        string phone
        string email
        enum hotel_type
        int room_count
        decimal daily_rate
      }

      ROOMS {
        int room_id PK
        int hotel_id FK
        enum room_type
        decimal price
      }

      BOOKINGS {
        int booking_id PK
        int guest_id FK
        int hotel_id FK
        int room_id FK
        date check_in_date
        date check_out_date
        boolean online_booking
        boolean fdm_member
        decimal total_price
        enum booking_status
      }

      HOTEL_STAFF {
        int staff_id PK
        string first_name
        string last_name
        enum position
        int hotel_id FK
        date hire_date
        decimal salary
        text notes
      }

      BIKE_RENTALS {
        int bike_id PK
        enum bike_type
        string lock_code
        date rental_start
        date rental_end
        int guest_id FK
        enum status
        int last_renter_id FK
      }

      CONFERENCE_BOOKINGS {
        int conference_id PK
        int hotel_id FK
        int guest_id FK
        date start_date
        date end_date
        int guest_count
        text requirements
        string catering
        string equipment
      }
    `,
    schema: `
    graph TB
      subgraph Database Schema
        A[Hotels] --> B[Bookings]
        A --> C[Conference Bookings]
        A --> E[Rooms]
        A --> F[Hotel Staff]
        A --> G[Bike Rentals]
        E --> B
        
        %% Improved contrast for dark mode
        style A fill:#ffd700,stroke:#fff,stroke-width:2px,color:#000
        style B fill:#a8c6ff,stroke:#fff,stroke-width:2px,color:#000
        style C fill:#ffb7ff,stroke:#fff,stroke-width:2px,color:#000
        style E fill:#90EE90,stroke:#fff,stroke-width:2px,color:#000
        style F fill:#ffb3b3,stroke:#fff,stroke-width:2px,color:#000
        style G fill:#87CEEB,stroke:#fff,stroke-width:2px,color:#000

        %% Add labels with better contrast
        linkStyle default stroke:#fff,stroke-width:2px
      end
    `,
    views: `
    graph LR
      subgraph Database Views
        A[Available Rooms] --> B[Hotels + Rooms]
        C[Current Bookings] --> D[Bookings + Guests]
        E[Monthly Revenue] --> F[Bookings + Hotels]
        G[VIP Guests] --> H[Guests + Bookings]
        I[Popular Rooms] --> J[Bookings + Rooms]
        
        %% Improved contrast for dark mode
        style A fill:#ffd700,stroke:#fff,stroke-width:2px,color:#000
        style C fill:#a8c6ff,stroke:#fff,stroke-width:2px,color:#000
        style E fill:#ffb7ff,stroke:#fff,stroke-width:2px,color:#000
        style G fill:#90EE90,stroke:#fff,stroke-width:2px,color:#000
        style I fill:#ffb3b3,stroke:#fff,stroke-width:2px,color:#000
        style B fill:#fff,stroke:#fff,stroke-width:2px,color:#000
        style D fill:#fff,stroke:#fff,stroke-width:2px,color:#000
        style F fill:#fff,stroke:#fff,stroke-width:2px,color:#000
        style H fill:#fff,stroke:#fff,stroke-width:2px,color:#000
        style J fill:#fff,stroke:#fff,stroke-width:2px,color:#000

        %% Add labels with better contrast
        linkStyle default stroke:#fff,stroke-width:2px
      end
    `,
    statistics: `
    graph TB
      subgraph Hotel Statistics
        direction TB
        
        subgraph Occupancy Rates
          A[Room Utilization]
          A1[Luxury Hotels: 85%]
          A2[Standard Hotels: 72%]
          A --> A1
          A --> A2
        end

        subgraph Booking Types
          B[Booking Distribution]
          B1[Online Bookings: 65%]
          B2[Direct Bookings: 25%]
          B3[Partner Bookings: 10%]
          B --> B1
          B --> B2
          B --> B3
        end

        subgraph Guest Analysis
          C[Guest Categories]
          C1[VIP Guests: 15%]
          C2[Regular Guests: 60%]
          C3[Corporate Guests: 25%]
          C --> C1
          C --> C2
          C --> C3
        end

        subgraph Revenue Metrics
          D[Monthly Revenue]
          D1[Rooms: 70%]
          D2[Conferences: 20%]
          D3[Bike Rentals: 10%]
          D --> D1
          D --> D2
          D --> D3
        end

        %% Improved contrast for dark mode
        style A fill:#ffd700,stroke:#fff,stroke-width:2px,color:#000
        style B fill:#a8c6ff,stroke:#fff,stroke-width:2px,color:#000
        style C fill:#ffb7ff,stroke:#fff,stroke-width:2px,color:#000
        style D fill:#90EE90,stroke:#fff,stroke-width:2px,color:#000
        
        style A1 fill:#fff,stroke:#fff,stroke-width:2px,color:#000
        style A2 fill:#fff,stroke:#fff,stroke-width:2px,color:#000
        style B1 fill:#fff,stroke:#fff,stroke-width:2px,color:#000
        style B2 fill:#fff,stroke:#fff,stroke-width:2px,color:#000
        style B3 fill:#fff,stroke:#fff,stroke-width:2px,color:#000
        style C1 fill:#fff,stroke:#fff,stroke-width:2px,color:#000
        style C2 fill:#fff,stroke:#fff,stroke-width:2px,color:#000
        style C3 fill:#fff,stroke:#fff,stroke-width:2px,color:#000
        style D1 fill:#fff,stroke:#fff,stroke-width:2px,color:#000
        style D2 fill:#fff,stroke:#fff,stroke-width:2px,color:#000
        style D3 fill:#fff,stroke:#fff,stroke-width:2px,color:#000

        linkStyle default stroke:#fff,stroke-width:2px
      end
    `,
    performance: metrics ? `
    graph TD
      subgraph Database Performance
        A[Query Performance] --> B[Avg Response: ${metrics.queryPerformance.avgResponse}]
        A --> C[Peak Load: ${metrics.queryPerformance.peakLoad}]
        
        D[Storage Usage] --> E[Total: ${metrics.storageUsage.total}]
        D --> F[Growth: ${metrics.storageUsage.growth}/month]
        
        G[Index Statistics] --> H[Size: ${metrics.indexStats.size}]
        G --> I[Usage: ${metrics.indexStats.usage}]
        
        J[Cache Hit Ratio] --> K[Buffer Hit: ${metrics.cacheMetrics.bufferHit}]
        J --> L[Query Cache: ${metrics.cacheMetrics.queryCache}]

        %% Style improvements for better readability
        style A fill:#FFD700,stroke:#333,stroke-width:2px,color:#000
        style D fill:#87CEEB,stroke:#333,stroke-width:2px,color:#000
        style G fill:#FFC0CB,stroke:#333,stroke-width:2px,color:#000
        style J fill:#98FB98,stroke:#333,stroke-width:2px,color:#000
      end
    ` : ''
  }

  return (
    <Tabs 
      defaultValue="erd" 
      className="space-y-4" 
      onValueChange={(value) => setActiveTab(value as DiagramType)}
    >
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="erd">ERD Diagram</TabsTrigger>
        <TabsTrigger value="schema">Schema Overview</TabsTrigger>
        <TabsTrigger value="views">Views Relationships</TabsTrigger>
        <TabsTrigger value="statistics">Statistics</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
      </TabsList>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "erd" && "Entity Relationship Diagram"}
            {activeTab === "schema" && "Database Schema Overview"}
            {activeTab === "views" && "Database Views Relationships"}
            {activeTab === "statistics" && "Hotel System Statistics"}
            {activeTab === "performance" && "Database Performance Metrics"}
          </CardTitle>
          <CardDescription>
            {activeTab === "erd" && "Shows the relationships between all database tables"}
            {activeTab === "schema" && "Visual representation of the database structure"}
            {activeTab === "views" && "Illustrates how views connect different tables"}
            {activeTab === "statistics" && "Key metrics and utilization statistics from the hotel system"}
            {activeTab === "performance" && "Database performance and resource utilization metrics"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Mermaid chart={diagrams[activeTab]} />
          </div>
        </CardContent>
      </Card>
    </Tabs>
  )
}