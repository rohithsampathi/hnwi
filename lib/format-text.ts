// lib/format-text.ts
// Centralized text formatting utilities for development summaries and citations

export interface AnalysisSection {
  title: string
  content: Array<{
    text: string
    isBullet: boolean
  }>
}

export interface FormattedAnalysis {
  summary: string
  sections: AnalysisSection[]
  winners?: AnalysisSection
  losers?: AnalysisSection
  potentialMoves?: AnalysisSection
}

const toTitleCase = (str: string) => {
  // Remove ** formatting
  const cleanStr = str.replace(/\*\*/g, '');
  // Convert to title case (capitalize first letter of each word)
  return cleanStr
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format development summary text with headings and bullets
 * Used across HNWI World, Citation Panel, and anywhere development text appears
 */
export function formatAnalysis(summary: string): FormattedAnalysis {
  const lines = summary.split("\n")
  let currentSection = { title: "", content: [] as Array<{text: string, isBullet: boolean}> }
  const sections = [] as Array<{title: string, content: Array<{text: string, isBullet: boolean}>}>
  const summaryContent = [] as string[]
  let winners: AnalysisSection | undefined
  let losers: AnalysisSection | undefined
  let potentialMoves: AnalysisSection | undefined

  lines.forEach((line) => {
    const trimmedLine = line.trim()
    if (trimmedLine === "") return

    // Check for special sub-section markers (Winners:, Losers:, Potential Moves:)
    // Allow optional markdown bold markers (**) and whitespace before colon
    const isSpecialSubSection = /^\*{0,2}(Winners?|Losers?|Potential Moves?)\*{0,2}\s*:?$/i.test(trimmedLine)

    // Check for markdown style ## headings and handle all uppercase headings
    if ((trimmedLine.startsWith("##") || trimmedLine.toUpperCase() === trimmedLine || isSpecialSubSection) && trimmedLine !== "") {
      if (currentSection.title) {
        const lowerTitle = currentSection.title.toLowerCase()

        // Check if this is a special section to extract separately
        if (lowerTitle.includes("winner")) {
          winners = { ...currentSection }
        } else if (lowerTitle.includes("loser")) {
          losers = { ...currentSection }
        } else if (lowerTitle.includes("potential") && lowerTitle.includes("move")) {
          potentialMoves = { ...currentSection }
        } else {
          sections.push(currentSection)
        }

        currentSection = { title: "", content: [] }
      }
      // Remove ## prefix if present, and remove trailing colon for special sub-sections
      let titleText = trimmedLine.startsWith("##") ? trimmedLine.substring(2).trim() : trimmedLine
      if (isSpecialSubSection) {
        // Remove markdown bold markers, trailing colon, and whitespace
        titleText = titleText.replace(/^\*{0,2}/, '').replace(/\*{0,2}\s*:?$/, '')
      }
      currentSection.title = toTitleCase(titleText)
    } else if (currentSection.title) {
      const explicitBulletPoint = trimmedLine.startsWith("-") || trimmedLine.startsWith("•") || /^\d+\.\s/.test(trimmedLine)

      // Sections where ONLY lines starting with "Text:" pattern should be bullets
      const colonBasedBulletSections = [
        "winners",
        "losers",
        "potential moves",
        "potential move",
        "key moves",
        "market shifts",
        "long term",
        "long-term",
        "wealth impact",
        "sentiment tracker",
        "hnwi sentiment"
      ]
      const isColonBasedSection = colonBasedBulletSections.some(section =>
        currentSection.title.toLowerCase().includes(section)
      )

      // Check BEFORE removing bullet markers AND markdown bold markers - pattern is "Text:" at start
      const lineWithoutMarker = trimmedLine.replace(/^[-•]\s*|^\d+\.\s*/, "").replace(/^\*{0,2}/, '').replace(/\*{0,2}:/, ':')
      const startsWithColonPattern = /^[A-Z][^:]+:/.test(lineWithoutMarker)
      const shouldBeBulletWithColon = isColonBasedSection && startsWithColonPattern

      // Legacy sections that treat ALL lines as bullets (if any remain)
      const allLinesBulletSections = [] // Empty now - all sections use colon-based logic
      const shouldTreatAsBullet = allLinesBulletSections.some(section =>
        currentSection.title.toLowerCase().includes(section)
      )

      // Sections that should NOT be split by periods (all colon-based sections)
      const shouldNotSplit = isColonBasedSection

      let formattedText = trimmedLine.replace(/^[-•]\s*|^\d+\.\s*/, "")
      // Convert markdown bold (**text**) to HTML bold
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Also bold formatting for specific side headings with colons
      formattedText = formattedText.replace(
        /(Winners:|Losers:|Potential Moves:|Opportunities:|Risks:|Recommendations & Future Paths:|Entry Point:|Entry Points:|Potential Move:)/g,
        "<strong>$1</strong>",
      )
      // ADDITIVE: Bold any text before a colon at the start of a line (sub-sub-headings)
      // This catches patterns like "Key Strategy:", "Important Note:", etc.
      // Only if not already wrapped in <strong> tags
      if (!formattedText.includes('<strong>') && formattedText.match(/^[A-Z][^:]+:/)) {
        formattedText = formattedText.replace(/^([^:]+:)/, '<strong>$1</strong>')
      }

      // If this is a bullet section, split by periods and create separate bullets
      // EXCEPT for Winners/Losers/Potential Moves which should keep full lines as single bullets
      if (shouldTreatAsBullet && !explicitBulletPoint && !shouldNotSplit) {
        // Split by periods but keep periods that are likely abbreviations or decimals
        const parts = formattedText.split(/\.\s+(?=[A-Z])/).filter(part => part.trim().length > 0)

        parts.forEach((part, index) => {
          let cleanPart = part.trim()
          // Add period back if it was removed and it's not the last part
          if (index < parts.length - 1 && !cleanPart.endsWith('.')) {
            cleanPart += '.'
          }

          if (cleanPart.length > 0) {
            currentSection.content.push({
              text: cleanPart,
              isBullet: true,
            })
          }
        })
      } else {
        // Regular processing for other content
        // For colon-based sections: only lines with "Text:" pattern get bullets
        // For other sections: use shouldTreatAsBullet logic
        const isBulletPoint = explicitBulletPoint || shouldTreatAsBullet || shouldBeBulletWithColon

        currentSection.content.push({
          text: formattedText,
          isBullet: isBulletPoint,
        })
      }
    } else {
      // Remove ## prefix from summary content as well, if present
      const formattedLine = trimmedLine.startsWith("##") ? trimmedLine.substring(2).trim() : trimmedLine
      summaryContent.push(formattedLine)
    }
  })

  if (currentSection.title) {
    const lowerTitle = currentSection.title.toLowerCase()

    // Check if this is a special section to extract separately
    if (lowerTitle.includes("winner")) {
      // Ensure ALL items in Winners section have bullets
      winners = {
        ...currentSection,
        content: currentSection.content.map(item => ({
          ...item,
          isBullet: true  // Force all items to be bullets
        }))
      }
    } else if (lowerTitle.includes("loser")) {
      // Ensure ALL items in Losers section have bullets
      losers = {
        ...currentSection,
        content: currentSection.content.map(item => ({
          ...item,
          isBullet: true  // Force all items to be bullets
        }))
      }
    } else if (lowerTitle.includes("potential") && lowerTitle.includes("move")) {
      // Ensure ALL items in Potential Moves section have bullets
      potentialMoves = {
        ...currentSection,
        content: currentSection.content.map(item => ({
          ...item,
          isBullet: true  // Force all items to be bullets
        }))
      }
    } else {
      sections.push(currentSection)
    }
  }

  // Ensure "Why This Matters" section appears FIRST (before Winners/Losers/Potential Moves nested rendering)
  // This is critical for proper visual hierarchy in the UI
  const sortedSections = [...sections].sort((a, b) => {
    const aIsWhy = a.title.toLowerCase().includes('why') && a.title.toLowerCase().includes('matter')
    const bIsWhy = b.title.toLowerCase().includes('why') && b.title.toLowerCase().includes('matter')

    if (aIsWhy && !bIsWhy) return -1  // a comes first
    if (!aIsWhy && bIsWhy) return 1   // b comes first
    return 0  // maintain original order
  })

  return {
    summary: summaryContent.join("\n"),
    sections: sortedSections,
    winners,
    losers,
    potentialMoves,
  }
}
