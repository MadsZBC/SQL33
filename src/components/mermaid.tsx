"use client"

import { useEffect, useRef } from "react"
import mermaid from "mermaid"

// Initialize mermaid with custom configuration
mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "var(--font-geist-sans)",
  sequence: {
    actorFontFamily: "var(--font-geist-sans)",
    noteFontFamily: "var(--font-geist-sans)",
    messageFontFamily: "var(--font-geist-sans)",
  },
  flowchart: {
    htmlLabels: true,
    curve: "basis",
    padding: 15,
    nodeSpacing: 50,
    rankSpacing: 50,
    diagramPadding: 8,
  },
  er: {
    entityPadding: 15,
    fontSize: 12,
    useMaxWidth: true,
  },
})

export default function Mermaid({ chart }: { chart: string }) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const renderDiagram = async () => {
      if (elementRef.current) {
        elementRef.current.innerHTML = ''
        try {
          const { svg } = await mermaid.render('mermaid-diagram', chart)
          if (elementRef.current) {
            elementRef.current.innerHTML = svg
          }
        } catch (error) {
          console.error('Failed to render mermaid diagram:', error)
          elementRef.current.innerHTML = 'Failed to render diagram'
        }
      }
    }

    // Add a small delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      renderDiagram()
    }, 100)

    return () => {
      clearTimeout(timer)
      if (elementRef.current) {
        elementRef.current.innerHTML = ''
      }
    }
  }, [chart])

  return <div ref={elementRef} className="mermaid" />
} 