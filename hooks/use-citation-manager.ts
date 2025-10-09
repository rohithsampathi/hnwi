import { useCallback, useMemo, useState } from "react"
import type { Citation } from "@/lib/parse-dev-citations"

const normalizeCitations = (citations: Citation[]): Citation[] => {
  if (!citations || citations.length === 0) {
    return []
  }

  return citations.map((citation, index) => ({
    ...citation,
    number: index + 1
  }))
}

export interface CitationManager {
  citations: Citation[]
  setCitations: (citations: Citation[]) => void
  citationMap: Map<string, number>
  selectedCitationId: string | null
  setSelectedCitationId: (citationId: string | null) => void
  isPanelOpen: boolean
  openCitation: (citationId: string) => void
  closePanel: () => void
  setPanelOpen: (open: boolean) => void
}

export function useCitationManager(initialCitations: Citation[] = []): CitationManager {
  const [citations, setCitationsState] = useState<Citation[]>(normalizeCitations(initialCitations))
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(
    initialCitations.length > 0 ? initialCitations[0].id : null
  )
  const [isPanelOpen, setPanelOpen] = useState(false)

  const citationMap = useMemo(() => {
    const map = new Map<string, number>()
    citations.forEach((citation) => {
      map.set(citation.id, citation.number)
    })
    return map
  }, [citations])

  const setCitations = useCallback((nextCitations: Citation[]) => {
    const normalized = normalizeCitations(nextCitations)
    setCitationsState(normalized)

    if (normalized.length === 0) {
      setSelectedCitationId(null)
      setPanelOpen(false)
      return
    }

    setSelectedCitationId((current) => {
      if (!current) {
        return normalized[0].id
      }

      const stillExists = normalized.some((citation) => citation.id === current)
      return stillExists ? current : normalized[0].id
    })
  }, [])

  const openCitation = useCallback((citationId: string) => {
    console.log('🔓 openCitation called with ID:', citationId)
    console.log('📋 Current citations:', citations)
    console.log('🗺️ Citation exists in map?', citationMap.has(citationId))

    setSelectedCitationId(citationId)
    setPanelOpen(true)

    console.log('✅ Set selectedCitationId to:', citationId)
    console.log('✅ Set isPanelOpen to: true')
  }, [citations, citationMap])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  return {
    citations,
    setCitations,
    citationMap,
    selectedCitationId,
    setSelectedCitationId,
    isPanelOpen,
    openCitation,
    closePanel,
    setPanelOpen
  }
}
