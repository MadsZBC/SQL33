"use client"

import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import html2pdf from "html2pdf.js"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function ExportDocumentationButton() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      // Create a temporary container
      const container = document.createElement('div')
      container.style.padding = '40px'
      container.style.background = '#ffffff'
      
      // Add title section
      const titleSection = document.createElement('div')
      titleSection.innerHTML = `
        <h1 style="font-size: 32px; font-weight: bold; text-align: center; margin-bottom: 20px; color: #000;">
          Hotel Database System
        </h1>
        <p style="text-align: center; color: #666; margin-bottom: 40px;">
          Technical Documentation and Database Architecture
        </p>
      `
      container.appendChild(titleSection)

      // Add diagrams section
      const diagramsSection = document.createElement('div')
      diagramsSection.innerHTML = `
        <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #000;">
          Database Architecture Diagrams
        </h2>
      `
      
      // Clone all diagrams
      const diagrams = document.querySelectorAll('.mermaid')
      diagrams.forEach((diagram, index) => {
        const diagramContainer = document.createElement('div')
        diagramContainer.style.marginBottom = '40px'
        diagramContainer.style.pageBreakBefore = index > 0 ? 'always' : 'auto'
        
        const title = document.createElement('h3')
        title.textContent = getDiagramTitle(index)
        title.style.marginBottom = '20px'
        title.style.color = '#000'
        
        diagramContainer.appendChild(title)
        diagramContainer.appendChild(diagram.cloneNode(true))
        diagramsSection.appendChild(diagramContainer)
      })
      
      container.appendChild(diagramsSection)

      // Add documentation section
      const documentation = document.querySelector('.prose')
      if (documentation) {
        const docSection = document.createElement('div')
        docSection.style.pageBreakBefore = 'always'
        docSection.innerHTML = `
          <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #000;">
            Technical Documentation
          </h2>
        `
        docSection.appendChild(documentation.cloneNode(true))
        container.appendChild(docSection)
      }

      // Configure PDF options
      const opt = {
        margin: 10,
        filename: 'hotel-database-documentation.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      }

      // Generate PDF
      await html2pdf().set(opt).from(container).save()

      toast({
        title: "Export Successful",
        description: "Documentation has been exported to PDF",
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error exporting the documentation",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button 
      onClick={handleExport} 
      disabled={isExporting}
      className="gap-2"
      size="lg"
    >
      <FileDown className="h-5 w-5" />
      {isExporting ? 'Exporting Documentation...' : 'Export Full Documentation'}
    </Button>
  )
}

function getDiagramTitle(index: number): string {
  const titles = [
    'Entity Relationship Diagram',
    'Database Schema Overview',
    'Database Views Relationships',
    'Hotel System Statistics',
    'Database Performance Metrics',
    'System Data Flow',
    'Deployment Architecture',
    'Check-in Process',
    'Booking Process'
  ]
  return titles[index] || `Diagram ${index + 1}`
} 