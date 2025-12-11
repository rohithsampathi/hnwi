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
 * - Remove ONLY standalone metadata lines (short single-line metadata)
 * - Convert markdown headings (##) to styled headings
 * - Preserve citations and all analysis content
 */
function parseAnalysis(text: string): ParsedSection[] {
  const sections: ParsedSection[] = []

  // Step 1: Remove ALL metadata header variations from start of analysis
  let cleanedText = text

  // Universal metadata removal pattern - handles ANY combination of metadata fields
  // Captures everything from start until "Risk Profile: XXX -" and removes it
  // This works for any combination of: Conviction, Location, Entry Investment, Expected Return
  cleanedText = cleanedText.replace(
    /^(?:(?:Conviction|Location|Entry Investment|Expected Return):\s*.+?\s+)*Risk Profile:\s*[\w\s-]+?\s+-\s+/i,
    ''
  )

  // Fallback: If no "Risk Profile -" pattern, try just removing metadata fields at start
  if (cleanedText === text) {
    cleanedText = cleanedText.replace(
      /^(?:Conviction|Location|Entry Investment|Expected Return|Risk Profile):\s*.+?\s+-\s+/i,
      ''
    )
  }

  // Also handle case where metadata is on separate lines
  const lines = cleanedText.split(/\r?\n/)
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim()

    // Keep empty lines
    if (!trimmed) return true

    // Remove standalone metadata lines
    const isStandaloneMetadata =
      /^Location:\s*.+$/i.test(trimmed) && trimmed.length < 200 ||
      /^Conviction:\s*\d+\.?\d*\/10\s*\([A-Z\s-]+\)$/i.test(trimmed) ||
      /^Entry Investment:\s*\$[\d,K]+-?\$?[\d,K]*$/i.test(trimmed) ||
      /^Expected Return:\s*\d+-?\d*%(\s+over\s+\d+-?\d*\s+(months?|years?))?$/i.test(trimmed) ||
      /^Risk Profile:\s*[\w-]+$/i.test(trimmed) ||
      /^[-–—]+$/.test(trimmed)

    return !isStandaloneMetadata
  })

  cleanedText = filteredLines.join('\n').trim()

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
              options={{
                convertMarkdownBold: true,
                preserveLineBreaks: true
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

