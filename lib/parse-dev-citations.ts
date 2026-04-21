// lib/parse-dev-citations.ts
// Utility to parse [Dev ID: XXX] references and convert them to citations

export interface Citation {
  id: string
  number: number
  originalText: string
}

// CitationMap type - used by audit pages to store citation metadata
export interface CitationMapEntry {
  dev_id: string
  title: string
  summary?: string
  location?: string
}
export type CitationMap = Record<string, CitationMapEntry>

const CITATION_LABEL = '(?:Dev\\s*ID|DEVID|Article\\s*ID)'
const BRACKETED_CITATION_PATTERN = `\\[${CITATION_LABEL}\\s*[:\\-–—]\\s*([^\\]\\r\\n]+)\\]`

// Match bracketed reference forms like [Dev ID: 164], [DEVID - abc], [Article ID: xyz]
const DEV_ID_CAPTURE = new RegExp(BRACKETED_CITATION_PATTERN, 'gi')
const SIMPLE_NUMERIC_CITATION = /\[(\d+)\]/g
const RAW_ID_CAPTURE = new RegExp(`\\b${CITATION_LABEL}\\s*[:\\-–—]\\s*([A-Za-z0-9_-]{8,})\\b`, 'gi')

export function normalizeCitationReferences(text: string): string {
  if (!text) return ''

  return text.replace(RAW_ID_CAPTURE, (match, citationId, offset, source) => {
    const before = source[offset - 1]
    const after = source[offset + match.length]
    if (before === '[' && after === ']') {
      return match
    }
    return `[DEVID: ${String(citationId).trim()}]`
  })
}

// Helper to get value from either Map or plain object
// Uses duck typing instead of instanceof to handle cross-realm cases
function getFromMapOrObject(
  mapOrObj: Map<string, number> | Record<string, any> | undefined,
  key: string
): number | undefined {
  if (!mapOrObj) return undefined
  // Duck type check: if it has a .get method that's a function, treat it as a Map
  if (typeof (mapOrObj as any).get === 'function') {
    return (mapOrObj as Map<string, number>).get(key)
  }
  // Plain object - return undefined (don't use object values for citation numbers)
  return undefined
}

export function parseDevCitations(
  text: string,
  globalCitationMap?: Map<string, number> | Record<string, any>,
  startingNumber: number = 1
): {
  formattedText: string
  citations: Citation[]
} {
  const citations: Citation[] = []
  const seenIds = new Set<string>()
  let citationNumber = startingNumber

  if (!text) {
    return { formattedText: '', citations }
  }

  const normalizedText = normalizeCitationReferences(text)

  // Collect unique citation IDs from both formats
  const devIdMatches = Array.from(normalizedText.matchAll(DEV_ID_CAPTURE))
  const simpleMatches = Array.from(normalizedText.matchAll(SIMPLE_NUMERIC_CITATION))

  // Combine both match types
  const matches = [...devIdMatches, ...simpleMatches]

  matches.forEach(match => {
    const devId = match[1]?.trim()
    if (devId && !seenIds.has(devId)) {
      seenIds.add(devId)
      // Use global map number if available, otherwise use local counter
      // Use global map number if available, otherwise use local counter
      const displayNumber = getFromMapOrObject(globalCitationMap, devId) ?? citationNumber++
      citations.push({
        id: devId,
        number: displayNumber,
        originalText: match[0]
      })
    }
  })

  let formattedText = normalizedText

  citations.forEach(citation => {
    const escapedId = citation.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Match both labeled formats ([Dev ID: 164], [DEVID: abc], [Article ID: xyz]) and [164]
    const fullPattern = new RegExp(`\\[${CITATION_LABEL}\\s*[:\\-–—]\\s*${escapedId}\\]`, 'gi')
    const simplePattern = new RegExp(`\\[${escapedId}\\]`, 'g')

    // Replace full format first
    formattedText = formattedText.replace(
      fullPattern,
      `<citation data-id="${citation.id}" data-number="${citation.number}">[${citation.number}]</citation>`
    )

    // Then replace simple numeric format (only if it's a number)
    if (/^\d+$/.test(citation.id)) {
      formattedText = formattedText.replace(
        simplePattern,
        `<citation data-id="${citation.id}" data-number="${citation.number}">[${citation.number}]</citation>`
      )
    }
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

  const normalizedText = normalizeCitationReferences(text)

  // Extract from both formats
  const devIdMatches = Array.from(normalizedText.matchAll(DEV_ID_CAPTURE))
  const simpleMatches = Array.from(normalizedText.matchAll(SIMPLE_NUMERIC_CITATION))

  const allMatches = [...devIdMatches, ...simpleMatches]

  allMatches.forEach(match => {
    const devId = match[1]?.trim()
    if (devId && !seenIds.has(devId)) {
      seenIds.add(devId)
      ids.push(devId)
    }
  })

  return ids
}
