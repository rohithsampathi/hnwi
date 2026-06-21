// components/elite/elite-citation-panel.tsx
// Elite dashboard citation panel with fixed height matching central column

"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CrownLoader } from "@/components/ui/crown-loader"
import { CitationDevelopmentCard } from "@/components/ask-rohith/citation-development-card"
import { X, FileText } from "lucide-react"
import type { Citation } from "@/lib/parse-dev-citations"
import { extractDevIds } from "@/lib/parse-dev-citations"
import { cn } from "@/lib/utils"
import {
  buildCitationSourceDevelopment,
  type CitationSourceDevelopment,
} from "@/lib/development-citation"

type Development = CitationSourceDevelopment

function uniqueCitations(citations: Citation[]): Citation[] {
  const seen = new Set<string>()
  const unique: Citation[] = []

  citations.forEach((citation) => {
    const id = String(citation.id || '').trim()
    const normalizedId = id.toLowerCase()
    if (!normalizedId || seen.has(normalizedId)) return

    seen.add(normalizedId)
    unique.push({ ...citation, id })
  })

  return unique
}

interface EliteCitationPanelProps {
  citations: Citation[]
  selectedCitationId: string | null
  onClose: () => void
  onCitationSelect: (citationId: string) => void
  citationMap?: Map<string, number>
  preloadedSources?: Map<string, Development>
  shareId?: string
  hideUnavailablePublicSources?: boolean
  preferRemoteSources?: boolean
  disableRemoteFetch?: boolean
}

export function EliteCitationPanel({
  citations,
  selectedCitationId,
  onClose,
  onCitationSelect,
  citationMap,
  preloadedSources,
  shareId,
  hideUnavailablePublicSources = false,
  preferRemoteSources = false,
  disableRemoteFetch = false
}: EliteCitationPanelProps) {
  const [loading, setLoading] = useState(false)
  const [loadingCitationId, setLoadingCitationId] = useState<string | null>(null)
  const [developments, setDevelopments] = useState<Map<string, Development>>(new Map())
  const [allCitations, setAllCitations] = useState<Citation[]>(uniqueCitations(citations))
  const [localCitationMap, setLocalCitationMap] = useState<Map<string, number>>(citationMap || new Map())
  const desktopScrollRef = React.useRef<HTMLDivElement>(null)
  const mobileScrollRef = React.useRef<HTMLDivElement>(null)
  const effectivePreloadedSources = preferRemoteSources ? undefined : preloadedSources

  // Initialize local state when props change
  useEffect(() => {
    setAllCitations(uniqueCitations(citations))
    setLocalCitationMap(citationMap || new Map())
  }, [citations, citationMap])

  const visibleCitations = React.useMemo(() => {
    if (!hideUnavailablePublicSources) {
      return allCitations
    }

    if (!effectivePreloadedSources || effectivePreloadedSources.size === 0) {
      return []
    }

    return allCitations.filter((citation) => {
      const loadedDevelopment = developments.get(citation.id)
      return Boolean(effectivePreloadedSources.get(citation.id) || loadedDevelopment)
    })
  }, [allCitations, developments, effectivePreloadedSources, hideUnavailablePublicSources])

  const activeSelectedCitationId = React.useMemo(() => {
    if (!hideUnavailablePublicSources) {
      return selectedCitationId
    }

    if (!selectedCitationId) {
      return visibleCitations[0]?.id ?? null
    }

    return visibleCitations.some((citation) => citation.id === selectedCitationId)
      ? selectedCitationId
      : visibleCitations[0]?.id ?? null
  }, [hideUnavailablePublicSources, selectedCitationId, visibleCitations])

  // Handle citation click - fetch development lazily when clicked
  const handleCitationClick = useCallback(async (citationId: string) => {
    const normalizedCitationId = citationId.trim()
    let resolvedSource: Development | undefined = developments.get(normalizedCitationId)

    // Check if citation already exists
    const existingCitation = allCitations.find(c => c.id === normalizedCitationId)

    if (!existingCitation) {
      // Get next citation number
      const nextNumber = Math.max(...allCitations.map(c => c.number), 0) + 1

      // Add to local citations list
      const newCitation: Citation = {
        id: normalizedCitationId,
        number: nextNumber,
        originalText: `[Dev ID: ${normalizedCitationId}]`
      }

      setAllCitations(prev => uniqueCitations([...prev, newCitation]))
      setLocalCitationMap(prev => new Map(prev).set(normalizedCitationId, nextNumber))
    }

    // LAZY LOAD: Fetch the full public development/castle brief when clicked.
    // If the current page already carries the exact source packet for this ID,
    // show it immediately and upgrade it only when the public source returns a
    // real citation payload.
    if (!developments.has(normalizedCitationId)) {
      const preloadedSource = effectivePreloadedSources?.get(normalizedCitationId)
      if (preloadedSource) {
        resolvedSource = preloadedSource
        setDevelopments(prev => new Map(prev).set(normalizedCitationId, preloadedSource))
      }

      setLoading(!preloadedSource && !disableRemoteFetch)
      setLoadingCitationId(disableRemoteFetch ? null : normalizedCitationId)

      if (disableRemoteFetch) {
        if (!preloadedSource) {
          setDevelopments(prev => new Map(prev).set(normalizedCitationId, null as any))
        }
        setLoading(false)
        setLoadingCitationId(null)
      } else {
        try {
          const controller = new AbortController()
          const timeoutId = window.setTimeout(() => controller.abort(), 12000)
          const shareQuery = shareId ? `?share_id=${encodeURIComponent(shareId)}` : ''
          const response = await fetch(`/api/developments/public/${encodeURIComponent(normalizedCitationId)}${shareQuery}`, {
            signal: controller.signal,
          })
          window.clearTimeout(timeoutId)

          if (response.ok) {
            const payload = await response.json()
            const newDev = buildCitationSourceDevelopment(payload, normalizedCitationId)

            if (newDev) {
              resolvedSource = newDev
              setDevelopments(prev => new Map(prev).set(normalizedCitationId, newDev))
            } else if (!preloadedSource) {
              setDevelopments(prev => new Map(prev).set(normalizedCitationId, null as any))
            }

            // Extract DEV IDs from this development but don't fetch them
            const devIdsInSummary = extractDevIds(newDev?.summary || preloadedSource?.summary || "")

            if (devIdsInSummary.length > 0) {
              const newCitations = [...allCitations]
              const newCitationMap = new Map(localCitationMap)
              let nextNumber = Math.max(...allCitations.map(c => c.number), 0) + 1

              devIdsInSummary.forEach(devId => {
                if (!newCitationMap.has(devId)) {
                  newCitationMap.set(devId, nextNumber)
                  newCitations.push({
                    id: devId,
                    number: nextNumber,
                    originalText: `[Dev ID: ${devId}]`
                  })
                  nextNumber++
                }
              })

              setAllCitations(uniqueCitations(newCitations))
              setLocalCitationMap(newCitationMap)
            }
          } else if (!preloadedSource) {
            setDevelopments(prev => new Map(prev).set(normalizedCitationId, null as any))
          }
        } catch (err) {
          if (!preloadedSource) {
            setDevelopments(prev => new Map(prev).set(normalizedCitationId, null as any))
          }
        } finally {
          setLoading(false)
          setLoadingCitationId(null)
        }
      }
    }

    if (hideUnavailablePublicSources && !resolvedSource && !effectivePreloadedSources?.get(normalizedCitationId)) {
      setAllCitations(prev => prev.filter(citation => citation.id !== normalizedCitationId))
      setLocalCitationMap(prev => {
        const next = new Map(prev)
        next.delete(normalizedCitationId)
        return next
      })
      const nextAvailable = allCitations.find((citation) => (
        citation.id !== normalizedCitationId &&
        Boolean(effectivePreloadedSources?.get(citation.id) || developments.get(citation.id))
      ))
      if (nextAvailable) {
        onCitationSelect(nextAvailable.id)
      }
      return
    }

    // Select the citation
    onCitationSelect(normalizedCitationId)
  }, [allCitations, developments, disableRemoteFetch, effectivePreloadedSources, hideUnavailablePublicSources, localCitationMap, onCitationSelect, shareId])

  // Auto-load the selected citation when panel opens (if one is selected)
  useEffect(() => {
    if (visibleCitations.length === 0) return

    // If a citation is already selected, load it automatically
    if (activeSelectedCitationId && !developments.has(activeSelectedCitationId)) {
      handleCitationClick(activeSelectedCitationId)
    }
    // Otherwise, user must click a citation to load it (lazy loading)
  }, [activeSelectedCitationId, visibleCitations.length, developments, handleCitationClick]) // Run when selectedCitationId changes or citations are loaded

  useEffect(() => {
    if (!hideUnavailablePublicSources || !activeSelectedCitationId || activeSelectedCitationId === selectedCitationId) {
      return
    }

    onCitationSelect(activeSelectedCitationId)
  }, [activeSelectedCitationId, hideUnavailablePublicSources, onCitationSelect, selectedCitationId])

  // Auto-scroll to selected citation tab when panel opens or citation changes
  useEffect(() => {
    if (!activeSelectedCitationId || visibleCitations.length === 0) return
    const selectedCitationNumber = visibleCitations.find(c => c.id === activeSelectedCitationId)?.number
    if (!selectedCitationNumber) return

    // Use requestAnimationFrame to ensure DOM is ready
    const scrollToSelected = () => {
      requestAnimationFrame(() => {
        // Try to find and scroll the selected button into view
        const desktopButton = desktopScrollRef.current?.querySelector(`[data-citation-number="${selectedCitationNumber}"]`) as HTMLElement
        const mobileButton = mobileScrollRef.current?.querySelector(`[data-citation-number="${selectedCitationNumber}"]`) as HTMLElement

        if (desktopButton) {
          desktopButton.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          })
        }

        if (mobileButton) {
          mobileButton.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          })
        }
      })
    }

    // Small delay to ensure panel animation completes
    const timer = setTimeout(scrollToSelected, 300)
    return () => clearTimeout(timer)
  }, [activeSelectedCitationId, visibleCitations])

  return (
    <>
      {/* Overlay Background - For both mobile and desktop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[10001]"
        onClick={onClose}
      />

      {/* Desktop Panel - Fixed right sidebar full height */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex fixed right-0 top-0 bottom-0 w-[380px] flex-col bg-background border-l border-border z-[10002] shadow-xl"
      >
        {/* Desktop Header with Close Button */}
        <div className="px-4 py-4 border-b border-border bg-background/95 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base">Source Evidence</h3>
              <Badge variant="secondary" className="text-xs">
                {visibleCitations.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-muted hover:text-foreground rounded-md"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Desktop Citation Tabs */}
        <div className="px-3 py-3 border-b border-border bg-muted/30 flex-shrink-0">
          <div ref={desktopScrollRef} className="overflow-x-auto scrollbar-hide max-w-full">
            <div className="flex gap-1 pb-1 min-w-max">
              {visibleCitations.map((citation) => (
                <Button
                  key={citation.id}
                  variant={activeSelectedCitationId === citation.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleCitationClick(citation.id)}
                  data-citation-number={citation.number}
                  aria-label={`Citation ${citation.number}`}
                  className={cn(
                    "px-3 py-1 h-8 text-xs font-medium whitespace-nowrap flex-shrink-0 min-w-[2.5rem] transition-colors duration-200",
                    activeSelectedCitationId === citation.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted-foreground/10"
                  )}
                >
                  [{citation.number}]
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Content */}
        <ScrollArea className="flex-1 px-4">
          <div className="py-4">
            {loading && loadingCitationId === activeSelectedCitationId ? (
              <div className="flex items-center justify-center py-8">
                <CrownLoader size="sm" text="Loading source..." />
              </div>
            ) : (
              <>
                {activeSelectedCitationId && (
                  <motion.div
                    key={activeSelectedCitationId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {(() => {
                      const dev = developments.get(activeSelectedCitationId) || effectivePreloadedSources?.get(activeSelectedCitationId)
                      if (!dev) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Source evidence not available in this public packet</p>
                          </div>
                        )
                      }

                      return (
                          <CitationDevelopmentCard
                          development={dev}
                          citationNumber={visibleCitations.find(c => c.id === activeSelectedCitationId)?.number}
                          onCitationClick={handleCitationClick}
                          citationMap={localCitationMap}
                        />
                      )
                    })()}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </motion.div>

      {/* Mobile Panel - Full screen overlay */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden fixed inset-0 w-full z-[10002] h-full bg-background flex flex-col overflow-hidden shadow-xl"
      >
        {/* Mobile Header with Close Button */}
        <div className="px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Source Evidence</h3>
              <Badge variant="secondary" className="text-xs">
                {visibleCitations.length} cited
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 text-muted-foreground hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Citation Tabs */}
        <div className="px-3 py-3 border-b border-border bg-muted/30">
          <div ref={mobileScrollRef} className="overflow-x-auto scrollbar-hide max-w-full">
            <div className="flex gap-1 pb-1 min-w-max">
              {visibleCitations.map((citation) => (
                <Button
                  key={citation.id}
                  variant={activeSelectedCitationId === citation.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleCitationClick(citation.id)}
                  data-citation-number={citation.number}
                  aria-label={`Citation ${citation.number}`}
                  className={cn(
                    "px-3 py-1 h-8 text-xs font-medium whitespace-nowrap flex-shrink-0 min-w-[2.5rem] transition-colors duration-200",
                    activeSelectedCitationId === citation.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted-foreground/10"
                  )}
                >
                  [{citation.number}]
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {loading && loadingCitationId === activeSelectedCitationId ? (
              <div className="flex items-center justify-center py-8">
                <CrownLoader size="sm" text="Loading source..." />
              </div>
            ) : (
              <>
                {activeSelectedCitationId && (
                  <motion.div
                    key={activeSelectedCitationId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {(() => {
                      const dev = developments.get(activeSelectedCitationId) || effectivePreloadedSources?.get(activeSelectedCitationId)
                      if (!dev) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Source evidence not available in this public packet</p>
                          </div>
                        )
                      }

                      return (
                        <CitationDevelopmentCard
                          development={dev}
                          citationNumber={visibleCitations.find(c => c.id === activeSelectedCitationId)?.number}
                          onCitationClick={handleCitationClick}
                          citationMap={localCitationMap}
                        />
                      )
                    })()}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </>
  )
}
