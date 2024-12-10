"use client"

import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import mermaid from "mermaid"
import { diagrams } from "./database-diagrams"

// Define the type for diagram keys
type DiagramType = keyof typeof diagramExplanations;

const diagramExplanations = {
  erd: `
    Entity Relationship Diagram (ERD)
    
    Dette diagram viser databasens grundlæggende struktur og relationer mellem tabeller. 
    Det illustrerer hvordan hoteller, gæster, værelser og bookinger er forbundet, 
    samt hvordan forskellige services som cykeludlejning og konferencebookinger 
    integreres i systemet.

    Nøglerelationer:
    • Hoteller → Værelser: Et hotel har mange værelser
    • Gæster → Bookinger: En gæst kan have flere bookinger
    • Værelser → Bookinger: Et værelse kan have flere bookinger over tid
  `,
  schema: `
    Database Schema Oversigt
    
    Dette diagram giver et overblik over databasens hovedkomponenter og deres 
    indbyrdes forbindelser. Det viser de centrale tabeller og deres rolle i systemet.

    Hovedkomponenter:
    • Kernetabeller: Hoteller, Gæster, Værelser, Bookinger
    • Tillægstjenester: Cykeludlejning, Konferencebookinger
    • Administration: Hotelpersonale
  `,
  views: `
    Database Views Relationer
    
    Oversigt over systemets forskellige views og deres datakilder. Views bruges til 
    at forenkle komplekse forespørgsler og give relevante datasyn til forskellige 
    brugergrupper.

    Primære Views:
    • Ledige værelser
    • Aktuelle bookinger
    • Hotelbelægning
    • VIP-gæster
    • Personalefordeling
  `,
  statistics: `
    Hotel System Statistikker
    
    Visualisering af centrale nøgletal og statistikker for hotelsystemet. 
    Dette giver ledelsen mulighed for at overvåge performance og træffe 
    datadrevne beslutninger.

    Nøglemetrikker:
    • Bookingstatistikker
    • Omsætningsanalyse
    • Belægningsgrad
    • Kundesegmentering
  `,
  performance: `
    Database Performance Metrikker
    
    Teknisk oversigt over databasens ydeevne og ressourceforbrug. 
    Dette hjælper med at identificere flaskehalse og optimeringsmuligheder.

    Målinger:
    • Svartider: Gennemsnit 45ms
    • Belastning: Spidsbelastning 1000 forespørgsler/sek
    • Lagerplads: 500GB total, 2GB vækst/måned
    • Cache effektivitet: 99% buffer hit rate
  `,
  dataflow: `
    System Data Flow
    
    Illustration af hvordan data bevæger sig gennem systemet ved typiske operationer 
    som bookinger. Dette viser samspillet mellem forskellige systemkomponenter.

    Flow beskrivelse:
    • Klient sender bookingforespørgsel
    • API verificerer tilgængelighed
    • Database opdateres
    • Bekræftelse sendes tilbage
  `,
  deployment: `
    Deployment Arkitektur
    
    Oversigt over systemets tekniske infrastruktur og hvordan forskellige 
    komponenter er forbundet. Dette viser hvordan systemet er skaleret og sikret.

    Komponenter:
    • Load Balancer: Fordeler trafik
    • Web Servere: Håndterer requests
    • Database: Primary og Replica for redundans
  `,
  checkin: `
    Check-in Process
    
    Detaljeret flow over check-in processen fra gæstens ankomst til 
    nøgleudlevering. Dette sikrer en konsistent og effektiv check-in oplevelse.

    Processtrin:
    • Gæst ankommer
    • Booking verificeres
    • Værelse tildeles
    • Nøgler udleveres
  `,
  booking: `
    Booking Process
    
    Komplet oversigt over bookingprocessen fra start til slut. 
    Dette viser interaktionen mellem gæst, reception, system og database.

    Procestrin:
    • Gæst anmoder om booking
    • System checker tilgængelighed
    • Booking bekræftes
    • Bekræftelse sendes
  `
} as const;

export default function ExportDiagramsButton() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      // Initialize mermaid
      mermaid.initialize({
        startOnLoad: true,
        theme: "dark",
        securityLevel: "loose",
        fontFamily: "var(--font-geist-sans)",
      })
      
      const html2pdf = (await import('html2pdf.js')).default
      
      // Create container
      const container = document.createElement('div')
      container.style.padding = '40px'
      container.style.background = '#ffffff'
      
      // Add header section
      const header = document.createElement('div')
      header.style.marginBottom = '40px'
      header.innerHTML = `
        <div style="text-align: center;">
          <h1 style="font-size: 32px; color: #000; margin-bottom: 20px;">
            Hotel Database System
          </h1>
          <h2 style="font-size: 24px; color: #666; margin-bottom: 20px;">
            Teknisk Dokumentation & Database Diagrammer
          </h2>
          <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
            Genereret: ${new Date().toLocaleDateString('da-DK')}
          </p>
          <p style="color: #666; max-width: 600px; margin: 0 auto;">
            Dette dokument indeholder tekniske diagrammer og forklaringer
            for hotel database systemet. Dokumentationen dækker system arkitektur,
            database struktur, og centrale processer.
          </p>
        </div>
      `
      container.appendChild(header)

      // Add table of contents
      const toc = document.createElement('div')
      toc.style.marginBottom = '40px'
      toc.innerHTML = `
        <h2 style="font-size: 24px; color: #000; margin-bottom: 20px;">Indholdsfortegnelse</h2>
        <ol style="color: #333; line-height: 1.6;">
          ${Object.entries(diagramExplanations).map(([key,]) => `
            <li>${getDiagramTitle(key)}</li>
          `).join('')}
        </ol>
      `
      container.appendChild(toc)

      // Create temporary container for rendering diagrams
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      document.body.appendChild(tempContainer)

      // Get all diagram types
      const diagramTypes = Object.keys(diagramExplanations) as DiagramType[]

      // Render each diagram type
      for (const type of diagramTypes) {
        const section = document.createElement('div')
        section.style.pageBreakBefore = 'always'
        section.style.marginBottom = '60px'
        
        // Add title and explanation
        section.innerHTML = `
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 24px; color: #000; margin-bottom: 15px;">
              ${getDiagramTitle(type)}
            </h2>
            <div style="color: #333; white-space: pre-line; font-size: 14px; margin-bottom: 20px;">
              ${diagramExplanations[type]}
            </div>
          </div>
        `

        try {
          // Create and render Mermaid diagram
          const diagramContainer = document.createElement('div')
          diagramContainer.style.backgroundColor = '#121212'
          diagramContainer.style.padding = '20px'
          diagramContainer.style.borderRadius = '8px'
          diagramContainer.style.marginBottom = '40px'

          // Render the diagram
          const { svg } = await mermaid.render(
            `mermaid-${type}`, 
            diagrams[type as keyof typeof diagrams]
          )
          
          diagramContainer.innerHTML = svg
          section.appendChild(diagramContainer)
          container.appendChild(section)
        } catch (error) {
          console.error(`Failed to render diagram ${type}:`, error)
        }
      }

      // Remove temporary container
      document.body.removeChild(tempContainer)

      // Configure PDF options
      const opt = {
        margin: 15,
        filename: 'hotel-database-documentation.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      }

      // Generate PDF
      await html2pdf().set(opt).from(container).save()

      toast({
        title: "Eksport Fuldført",
        description: "Din dokumentation er blevet eksporteret til PDF",
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        variant: "destructive",
        title: "Eksport Fejlede",
        description: "Der opstod en fejl under eksporten",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button 
        onClick={handleExport} 
        disabled={isExporting}
        className="gap-2"
      >
        <FileDown className="h-4 w-4" />
        {isExporting ? 'Eksporterer...' : 'Eksporter Alle Diagrammer'}
      </Button>
    </div>
  )
}

function getDiagramTitle(type: string): string {
  const titles: Record<string, string> = {
    erd: "Entity Relationship Diagram",
    schema: "Database Schema Oversigt",
    views: "Database Views Relationer",
    statistics: "Hotel System Statistikker",
    performance: "Database Performance Metrikker",
    dataflow: "System Data Flow",
    deployment: "Deployment Arkitektur",
    checkin: "Check-in Process",
    booking: "Booking Process"
  }
  return titles[type] || type
} 