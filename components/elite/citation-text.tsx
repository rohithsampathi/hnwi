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
  options?: {
    convertMarkdownBold?: boolean
    preserveLineBreaks?: boolean
    trim?: boolean
    renderLists?: boolean
    renderParagraphs?: boolean
    stripMarkdownBold?: boolean
  }
  citationDisplay?: "inline" | "block"
}

const convertMarkdownBold = (value: string): string => {
  // Convert markdown bold (**text**) to HTML bold
  let formatted = value.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Also bold formatting for specific side headings with colons (same as formatAnalysis)
  formatted = formatted.replace(
    /(Winners:|Losers:|Potential Moves:|Opportunities:|Risks:|Recommendations & Future Paths:|Entry Point:|Entry Points:|Potential Move:)/g,
    "<strong>$1</strong>",
  )

  // Bold any text before a colon at the start of a line (sub-sub-headings)
  // This catches patterns like "Key Strategy:", "Important Note:", etc.
  // Only if not already wrapped in <strong> tags
  if (!formatted.includes('<strong>') && formatted.match(/^[A-Z][^:]+:/)) {
    formatted = formatted.replace(/^([^:]+:)/, '<strong>$1</strong>')
  }

  return formatted
}

const convertLineBreaks = (value: string): string => {
  return value
    .replace(/\r\n/g, "\n")
    // CRITICAL FIX: Remove ALL whitespace/newlines before citations BEFORE splitting
    .replace(/[\s\n\r]+(\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*[^\]]+\])/gi, ' $1')
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{2,}/g, "<br/><br/>")
    .replace(/\n/g, "<br/>")
}

const convertLists = (value: string): string => {
  const lines = value.split(/\n+/)
  const result: string[] = []
  let inList = false

  lines.forEach((rawLine) => {
    const line = rawLine.trim()
    const listMatch = /^[-*]\s+(.*)/.exec(line)

    if (listMatch) {
      if (!inList) {
        result.push("<ul>")
        inList = true
      }
      result.push(`<li>${listMatch[1].trim()}</li>`)
    } else {
      if (inList) {
        result.push("</ul>")
        inList = false
      }
      result.push(line)
    }
  })

  if (inList) {
    result.push("</ul>")
  }

  return result.join("\n")
}

const convertParagraphs = (value: string): string => {
  // CRITICAL FIX: Remove ALL whitespace/newlines/br tags before citations BEFORE splitting into paragraphs
  const cleanedValue = value
    .replace(/[\s\n\r]+(\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*[^\]]+\])/gi, ' $1')
    .replace(/(<br\s*\/?>\s*)+(\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*[^\]]+\])/gi, ' $2')

  const chunks = cleanedValue
    .split(/(?:\n{2,}|<br\/><br\/>)/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)

  if (chunks.length <= 1) {
    return cleanedValue
  }

  return chunks.map((chunk) => `<p>${chunk}</p>`).join("")
}

export function CitationText({
  text,
  onCitationClick,
  className = "",
  citationMap,
  options,
  citationDisplay = "inline"
}: CitationTextProps) {
  if (!text) return null

  const {
    convertMarkdownBold: shouldConvertBold = false,
    preserveLineBreaks = false,
    trim = true,
    renderLists = false,
    renderParagraphs = false,
    stripMarkdownBold = !shouldConvertBold
  } = options || {}

  let processedText = trim ? text.trim() : text

  // Initial cleanup: Remove ALL whitespace/newlines before citations (not just 2+)
  processedText = processedText.replace(/[\s\n\r]+(\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*[^\]]+\])/gi, ' $1')

  if (stripMarkdownBold) {
    processedText = processedText.replace(/\*\*([^*]+)\*\*/g, "$1")
  }

  if (shouldConvertBold) {
    processedText = convertMarkdownBold(processedText)
  }
  if (preserveLineBreaks) {
    // convertLineBreaks now handles citation cleanup internally
    processedText = convertLineBreaks(processedText)
  }

  if (renderLists) {
    processedText = convertLists(processedText)
  }
  if (renderParagraphs) {
    // convertParagraphs now handles citation cleanup internally
    processedText = convertParagraphs(processedText)
  }

  // Final cleanup: remove any remaining formatting artifacts before citations
  processedText = processedText
    .replace(/(<br\s*\/?>)+(\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*[^\]]+\])/gi, ' $2')
    .replace(/<p>[\s]*(\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*[^\]]+\])/gi, '<p>$1')
    .replace(/(<\/p>)[\s]*(<p>)?[\s]*(\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*[^\]]+\])/gi, '$1 $3')

  // Parse citations and get formatted text
  const { formattedText, citations } = parseDevCitations(processedText)

  // FINAL AGGRESSIVE CLEANUP after citation parsing
  let cleanedFormattedText = formattedText
    // Remove <br/> tags before <citation> tags
    .replace(/(<br\s*\/?>[\s\n\r]*)+(<citation)/gi, ' $2')
    // Remove paragraph breaks before <citation> tags
    .replace(/(<\/p>[\s\n\r]*)+(<citation)/gi, '</p> $2')
    // Remove opening paragraph tags before <citation> tags
    .replace(/<p>[\s\n\r]*(<citation)/gi, '<p>$1')
    // Remove citations that are in their own paragraph
    .replace(/<p>[\s\n\r]*(<citation[^>]*>.*?<\/citation>)[\s\n\r]*<\/p>/gi, ' $1')
    // Clean up multiple spaces before citations
    .replace(/\s{2,}(<citation)/gi, ' $1')

  // If no citations or no handler, return text as HTML to preserve formatting
  if (citations.length === 0 || !onCitationClick) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: processedText }} />
  }

  // Convert the formatted text with citation tags to React elements
  const parts = cleanedFormattedText.split(/(<citation[^>]*>.*?<\/citation>)/g)

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
              className="inline-flex items-center justify-center text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 px-1 rounded transition-colors mx-0.5 align-baseline"
              aria-label={`Citation ${displayNumber}`}
            >
              [{displayNumber}]
            </button>
          )
        }

        // Render as HTML to preserve bold tags and other formatting
        return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />
      })}
    </span>
  )
}
