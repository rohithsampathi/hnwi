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
  const devIdPattern = /\[Dev ID:\s*([^\]]+)\]/g
  const citations: Citation[] = []
  const seenIds = new Set<string>()
  let citationNumber = 1

  // First pass: collect all unique Dev IDs
  let match
  while ((match = devIdPattern.exec(text)) !== null) {
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

  // Second pass: replace Dev IDs with citation numbers
  let formattedText = text
  citations.forEach(citation => {
    const regex = new RegExp(
      `\\[Dev ID:\\s*${citation.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`,
      'g'
    )
    formattedText = formattedText.replace(
      regex,
      `<citation data-id="${citation.id}" data-number="${citation.number}">[${citation.number}]</citation>`
    )
  })

  return {
    formattedText,
    citations
  }
}

export function extractDevIds(text: string): string[] {
  const devIdPattern = /\[Dev ID:\s*([^\]]+)\]/g
  const ids: string[] = []
  const seenIds = new Set<string>()

  let match
  while ((match = devIdPattern.exec(text)) !== null) {
    const devId = match[1].trim()
    if (!seenIds.has(devId)) {
      seenIds.add(devId)
      ids.push(devId)
    }
  }

  return ids
}