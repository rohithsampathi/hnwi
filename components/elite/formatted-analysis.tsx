// components/elite/formatted-analysis.tsx
// Parser for analysis text with markdown heading support

"use client"

import React from "react"
import { CitationText } from "./citation-text"

interface FormattedAnalysisProps {
  text: string
  onCitationClick?: (citationId: string) => void
  citationMap?: Map<string, number>
  className?: string
}

interface ParsedSection {
  type: 'heading' | 'content'
  content: string
  level?: number
}

/**
 * Parse analysis text:
 * - Remove redundant metadata prefix (Location, Entry Investment, Risk Profile)
 * - Convert markdown headings (##) to styled headings
 * - Preserve citations
 */
function parseAnalysis(text: string): ParsedSection[] {
  const sections: ParsedSection[] = []

  // Step 1: Remove metadata lines (Location, Entry Investment, Risk Profile)
  let cleanedText = text

  // Remove lines that match metadata patterns
  const metadataPatterns = [
    /^Location:.*$/m,
    /^Entry Investment:.*$/m,
    /^Risk Profile:.*$/m,
    /^Source:.*$/m
  ]

  for (const pattern of metadataPatterns) {
    cleanedText = cleanedText.replace(pattern, '')
  }

  // Clean up any extra blank lines at the start
  cleanedText = cleanedText.trim()

  // Step 2: Parse headings and content from cleaned text
  const contentLines = cleanedText.split(/\r?\n/)
  let currentContent = ''

  for (const line of contentLines) {
    const trimmedLine = line.trim()

    if (!trimmedLine) continue // Skip empty lines

    // Check for markdown heading (## or ###)
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)/)

    if (headingMatch) {
      // Save accumulated content before this heading
      if (currentContent.trim()) {
        sections.push({
          type: 'content',
          content: currentContent.trim()
        })
        currentContent = ''
      }

      // Add heading
      sections.push({
        type: 'heading',
        content: headingMatch[2],
        level: headingMatch[1].length
      })
    } else {
      // Accumulate regular content
      currentContent += (currentContent ? ' ' : '') + trimmedLine
    }
  }

  // Add any remaining content
  if (currentContent.trim()) {
    sections.push({
      type: 'content',
      content: currentContent.trim()
    })
  }

  return sections
}

export function FormattedAnalysis({
  text,
  onCitationClick,
  citationMap,
  className = ""
}: FormattedAnalysisProps) {
  const sections = React.useMemo(() => parseAnalysis(text), [text])

  return (
    <div className={`space-y-3 ${className}`}>
      {sections.map((section, index) => {
        if (section.type === 'heading') {
          const HeadingTag = section.level === 1 ? 'h1' :
                            section.level === 2 ? 'h2' :
                            section.level === 3 ? 'h3' : 'h4'
          const headingClass = section.level === 1 ? 'text-sm font-bold text-primary mt-3 mb-2' :
                              section.level === 2 ? 'text-xs font-bold text-primary mt-3 mb-1.5' :
                              'text-xs font-semibold text-primary mt-2 mb-1'

          return (
            <HeadingTag key={index} className={headingClass}>
              {section.content}
            </HeadingTag>
          )
        }

        return (
          <div key={index} className="text-xs leading-relaxed">
            <CitationText
              text={section.content}
              onCitationClick={onCitationClick}
              citationMap={citationMap}
              className="text-xs"
            />
          </div>
        )
      })}
    </div>
  )
}

