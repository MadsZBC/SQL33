'use client';

import mermaid from 'mermaid';
import { useEffect, useRef } from 'react';

interface MermaidProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
      });
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div className="mermaid" ref={containerRef}>
      {chart}
    </div>
  );
} 