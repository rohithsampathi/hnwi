// components/elite/elite-citation-panel.tsx
// Elite dashboard citation panel with fixed height matching central column

"use client"

import React, { useState, useEffect } from "react"
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

interface Development {
  id: string
  title: string
  description: string
  industry: string
  product?: string
  date?: string
  summary: string
  url?: string
  numerical_data?: Array<{
    number: string
    unit: string
    context: string
    source?: string
  }>
}

interface EliteCitationPanelProps {
  citations: Citation[]
  selectedCitationId: string | null
  onClose: () => void
  onCitationSelect: (citationId: string) => void
  citationMap?: Map<string, number>
}

export function EliteCitationPanel({
  citations,
  selectedCitationId,
  onClose,
  onCitationSelect,
  citationMap
}: EliteCitationPanelProps) {
  const [loading, setLoading] = useState(false)
  const [developments, setDevelopments] = useState<Map<string, Development>>(new Map())
  const [allCitations, setAllCitations] = useState<Citation[]>(citations)
  const [localCitationMap, setLocalCitationMap] = useState<Map<string, number>>(citationMap || new Map())
  const desktopScrollRef = React.useRef<HTMLDivElement>(null)
  const mobileScrollRef = React.useRef<HTMLDivElement>(null)

  // Initialize local state when props change
  useEffect(() => {
    setAllCitations(citations)
    setLocalCitationMap(citationMap || new Map())
  }, [citations, citationMap])

  // Handle citation click - fetch development lazily when clicked
  const handleCitationClick = async (citationId: string) => {
    // Check if citation already exists
    const existingCitation = allCitations.find(c => c.id === citationId)

    if (!existingCitation) {
      // Get next citation number
      const nextNumber = Math.max(...allCitations.map(c => c.number), 0) + 1

      // Add to local citations list
      const newCitation: Citation = {
        id: citationId,
        number: nextNumber,
        originalText: `[Dev ID: ${citationId}]`
      }

      setAllCitations(prev => [...prev, newCitation])
      setLocalCitationMap(prev => new Map(prev).set(citationId, nextNumber))
    }

    // LAZY LOAD: Fetch development only when clicked (if not already fetched or marked as not found)
    if (!developments.has(citationId)) {
      setLoading(true)

      try {
        // First check if development exists to avoid 404 console errors
        const existsResponse = await fetch(`/api/developments/public/${citationId}/exists`)
        const { exists } = await existsResponse.json()

        if (!exists) {
          // Mark as not found without triggering 404 error
          setDevelopments(prev => new Map(prev).set(citationId, null as any))
          setLoading(false)
          onCitationSelect(citationId) // Still select the citation to show "not found" message
          return
        }

        // Development exists, fetch full data
        const response = await fetch(`/api/developments/public/${citationId}`)

        if (response.ok) {
          const dev = await response.json()
          const developmentId = dev._id || dev.id || citationId
          const summary = dev.summary || dev.analysis || ""

          const newDev: Development = {
            id: developmentId,
            title: dev.title || dev.name || `Development ${developmentId}`,
            description: dev.description || summary?.substring(0, 200) || "Development details",
            industry: dev.industry || "Market Intelligence",
            product: dev.product,
            date: dev.date || dev.created_at,
            summary: summary,
            url: dev.url,
            numerical_data: dev.numerical_data || []
          }

          setDevelopments(prev => new Map(prev).set(citationId, newDev))

          // Extract DEV IDs from this development but don't fetch them
          const devIdsInSummary = extractDevIds(summary)

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

            setAllCitations(newCitations)
            setLocalCitationMap(newCitationMap)
          }
        } else if (response.status === 404) {
          // 404 is expected - not all Dev IDs have corresponding records
          // Mark as "not found" in developments map to avoid re-fetching
          setDevelopments(prev => new Map(prev).set(citationId, null as any))
        }
      } catch (err) {
        // Network errors or other unexpected errors
        // Mark as "not found" to avoid re-fetching
        setDevelopments(prev => new Map(prev).set(citationId, null as any))
      } finally {
        setLoading(false)
      }
    }

    // Select the citation
    onCitationSelect(citationId)
  }

  // Auto-load the selected citation when panel opens (if one is selected)
  useEffect(() => {
    if (citations.length === 0) return

    // If a citation is already selected, load it automatically
    if (selectedCitationId && !developments.has(selectedCitationId)) {
      handleCitationClick(selectedCitationId)
    }
    // Otherwise, user must click a citation to load it (lazy loading)
  }, [selectedCitationId, citations.length]) // Run when selectedCitationId changes or citations are loaded

  // Auto-scroll to selected citation tab when panel opens or citation changes
  useEffect(() => {
    if (!selectedCitationId || allCitations.length === 0) return

    // Use requestAnimationFrame to ensure DOM is ready
    const scrollToSelected = () => {
      requestAnimationFrame(() => {
        // Try to find and scroll the selected button into view
        const desktopButton = desktopScrollRef.current?.querySelector(`[data-citation-id="${selectedCitationId}"]`) as HTMLElement
        const mobileButton = mobileScrollRef.current?.querySelector(`[data-citation-id="${selectedCitationId}"]`) as HTMLElement

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
  }, [selectedCitationId, allCitations.length])

  return (
    <>
      {/* Overlay Background - For both mobile and desktop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Desktop Panel - Fixed right sidebar full height */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex fixed right-0 top-0 bottom-0 w-[380px] flex-col bg-background border-l border-border z-50 shadow-xl"
      >
        {/* Desktop Header with Close Button */}
        <div className="px-4 py-4 border-b border-border bg-background/95 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base">Source Documents</h3>
              <Badge variant="secondary" className="text-xs">
                {allCitations.length}
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
              {allCitations.map((citation) => (
                <Button
                  key={citation.id}
                  variant={selectedCitationId === citation.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onCitationSelect(citation.id)}
                  data-citation-id={citation.id}
                  className={cn(
                    "px-3 py-1 h-8 text-xs font-medium whitespace-nowrap flex-shrink-0 min-w-[2.5rem] transition-colors duration-200",
                    selectedCitationId === citation.id
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <CrownLoader size="sm" text="Loading source..." />
              </div>
            ) : (
              <>
                {selectedCitationId && (
                  <motion.div
                    key={selectedCitationId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {(() => {
                      const dev = developments.get(selectedCitationId)
                      if (!dev) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Development not found</p>
                          </div>
                        )
                      }

                      return (
                        <CitationDevelopmentCard
                          development={dev}
                          citationNumber={citations.find(c => c.id === selectedCitationId)?.number}
                          onCitationClick={onCitationSelect}
                          citationMap={citationMap}
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
        className="md:hidden fixed inset-0 w-full z-50 h-full bg-background flex flex-col overflow-hidden shadow-xl"
      >
        {/* Mobile Header with Close Button */}
        <div className="px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Source Documents</h3>
              <Badge variant="secondary" className="text-xs">
                {allCitations.length} cited
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
              {allCitations.map((citation) => (
                <Button
                  key={citation.id}
                  variant={selectedCitationId === citation.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onCitationSelect(citation.id)}
                  data-citation-id={citation.id}
                  className={cn(
                    "px-3 py-1 h-8 text-xs font-medium whitespace-nowrap flex-shrink-0 min-w-[2.5rem] transition-colors duration-200",
                    selectedCitationId === citation.id
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <CrownLoader size="sm" text="Loading source..." />
              </div>
            ) : (
              <>
                {selectedCitationId && (
                  <motion.div
                    key={selectedCitationId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {(() => {
                      const dev = developments.get(selectedCitationId)
                      if (!dev) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Development not found</p>
                          </div>
                        )
                      }

                      return (
                        <CitationDevelopmentCard
                          development={dev}
                          citationNumber={allCitations.find(c => c.id === selectedCitationId)?.number}
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
