"use client"

import { useEffect, useRef } from "react"
import mermaid from "mermaid"

mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "var(--font-geist-sans)",
})

export default function Mermaid({ chart }: { chart: string }) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (elementRef.current) {
      mermaid.render("mermaid", chart).then(({ svg }) => {
        if (elementRef.current) {
          elementRef.current.innerHTML = svg
        }
      })
    }
  }, [chart])

  return <div ref={elementRef} className="mermaid" />
} 