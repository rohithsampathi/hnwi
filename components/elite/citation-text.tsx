// components/elite/citation-text.tsx
// Component to render text with clickable citations

"use client"

import React from "react"
import { parseDevCitations } from "@/lib/parse-dev-citations"

interface CitationTextProps {
  text: string | undefined | null
  onCitationClick?: (citationId: string) => void
  className?: string
  citationMap?: Map<string, number> // Map of citation ID to global number
}

export function CitationText({ text, onCitationClick, className = "", citationMap }: CitationTextProps) {
  if (!text) return null

  // Parse citations and get formatted text
  const { formattedText, citations } = parseDevCitations(text)

  // If no citations or no handler, just return the text
  if (citations.length === 0 || !onCitationClick) {
    return <span className={className}>{text}</span>
  }

  // Convert the formatted text with citation tags to React elements
  const parts = formattedText.split(/(<citation[^>]*>.*?<\/citation>)/g)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part is a citation
        const citationMatch = part.match(/<citation data-id="([^"]+)" data-number="(\d+)">\[(\d+)\]<\/citation>/)

        if (citationMatch) {
          const [, citationId, citationNumber] = citationMatch
          // Use global citation number from citationMap if available, otherwise use parsed number
          const displayNumber = citationMap?.get(citationId) ?? citationNumber
          return (
            <button
              key={index}
              onClick={() => onCitationClick(citationId)}
              className="inline-flex items-center justify-center text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 px-1 rounded transition-colors mx-0.5"
              aria-label={`Citation ${displayNumber}`}
            >
              [{displayNumber}]
            </button>
          )
        }

        return <span key={index}>{part}</span>
      })}
    </span>
  )
}