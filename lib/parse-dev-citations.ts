// lib/parse-dev-citations.ts
// Utility to parse [Dev ID: XXX] references and convert them to citations

export interface Citation {
  id: string
  number: number
  originalText: string
}

export function parseDevCitations(text: string): {
  formattedText: string
  citations: Citation[]
} {
  // Support both citation formats: [Dev ID: ...] and [DEVID - ...]
  const devIdPatterns = [
    /\[Dev ID:\s*([^\]]+)\]/g,  // Original format: [Dev ID: xyz]
    /\[DEVID\s*-\s*([^\]]+)\]/g  // New format: [DEVID - xyz]
  ]

  const citations: Citation[] = []
  const seenIds = new Set<string>()
  let citationNumber = 1

  // First pass: collect all unique Dev IDs from both patterns
  devIdPatterns.forEach(pattern => {
    pattern.lastIndex = 0 // Reset pattern
    let match
    while ((match = pattern.exec(text)) !== null) {
      const devId = match[1].trim()
      if (!seenIds.has(devId)) {
        seenIds.add(devId)
        citations.push({
          id: devId,
          number: citationNumber++,
          originalText: match[0]
        })
      }
    }
  })

  // Second pass: replace Dev IDs with citation numbers for both formats
  let formattedText = text
  citations.forEach(citation => {
    // Create regex patterns for both formats
    const escapedId = citation.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regexes = [
      new RegExp(`\\[Dev ID:\\s*${escapedId}\\]`, 'g'),
      new RegExp(`\\[DEVID\\s*-\\s*${escapedId}\\]`, 'g')
    ]

    regexes.forEach(regex => {
      formattedText = formattedText.replace(
        regex,
        `<citation data-id="${citation.id}" data-number="${citation.number}">[${citation.number}]</citation>`
      )
    })
  })

  return {
    formattedText,
    citations
  }
}

export function extractDevIds(text: string): string[] {
  // Support both citation formats: [Dev ID: ...] and [DEVID - ...]
  const devIdPatterns = [
    /\[Dev ID:\s*([^\]]+)\]/g,  // Original format: [Dev ID: xyz]
    /\[DEVID\s*-\s*([^\]]+)\]/g  // New format: [DEVID - xyz]
  ]

  const ids: string[] = []
  const seenIds = new Set<string>()

  devIdPatterns.forEach(pattern => {
    pattern.lastIndex = 0 // Reset pattern
    let match
    while ((match = pattern.exec(text)) !== null) {
      const devId = match[1].trim()
      if (!seenIds.has(devId)) {
        seenIds.add(devId)
        ids.push(devId)
      }
    }
  })

  return ids
}