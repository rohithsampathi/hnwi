// lib/parse-dev-citations.ts
// Utility to parse [Dev ID: XXX] references and convert them to citations

export interface Citation {
  id: string
  number: number
  originalText: string
}

const DEV_ID_CAPTURE = /\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*([^\]\r\n]+)\]/gi

export function parseDevCitations(text: string): {
  formattedText: string
  citations: Citation[]
} {
  const citations: Citation[] = []
  const seenIds = new Set<string>()
  let citationNumber = 1

  if (!text) {
    return { formattedText: '', citations }
  }

  // Collect unique citation IDs
  const matches = Array.from(text.matchAll(DEV_ID_CAPTURE))

  matches.forEach(match => {
    const devId = match[1]?.trim()
    if (devId && !seenIds.has(devId)) {
      seenIds.add(devId)
      citations.push({
        id: devId,
        number: citationNumber++,
        originalText: match[0]
      })
    }
  })

  let formattedText = text

  citations.forEach(citation => {
    const escapedId = citation.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const citationPattern = new RegExp(`\\[(?:Dev\\s*ID|DEVID)\\s*[:\\-–—]\\s*${escapedId}\\]`, 'gi')

    formattedText = formattedText.replace(
      citationPattern,
      `<citation data-id="${citation.id}" data-number="${citation.number}">[${citation.number}]</citation>`
    )
  })

  return {
    formattedText,
    citations
  }
}

export function extractDevIds(text: string): string[] {
  const ids: string[] = []
  const seenIds = new Set<string>()

  if (!text) return ids

  const matches = Array.from(text.matchAll(DEV_ID_CAPTURE))
  matches.forEach(match => {
    const devId = match[1]?.trim()
    if (devId && !seenIds.has(devId)) {
      seenIds.add(devId)
      ids.push(devId)
    }
  })

  return ids
}
