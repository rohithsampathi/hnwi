// components/ask-rohith/citation-panel.tsx
// Third column panel for displaying development citations from messages

"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CrownLoader } from "@/components/ui/crown-loader"
import { CitationDevelopmentCard } from "./citation-development-card"
import {
  X,
  FileText
} from "lucide-react"
import type { Citation } from "@/lib/parse-dev-citations"
import { parseDevCitations } from "@/lib/parse-dev-citations"
import { secureApi } from "@/lib/secure-api"
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

interface CitationPanelProps {
  citations: Citation[]
  selectedCitationId: string | null
  onClose: () => void
  onCitationSelect: (citationId: string) => void
}

export function CitationPanel({
  citations,
  selectedCitationId,
  onClose,
  onCitationSelect
}: CitationPanelProps) {
  const [loading, setLoading] = useState(false)
  const [developments, setDevelopments] = useState<Map<string, Development>>(new Map())
  const [globalCitationMap, setGlobalCitationMap] = useState<Map<string, number>>(new Map())

  // Recursively fetch ALL citation levels and build complete serial map
  useEffect(() => {
    if (citations.length === 0) return

    const fetchDevelopments = async () => {
      setLoading(true)
      try {
        const allDevs = new Map<string, Development>()
        const processedIds = new Set<string>()
        const globalMap = new Map<string, number>()
        let citationCounter = 1

        // Queue of citation IDs to fetch (BFS approach)
        const fetchQueue: string[] = citations.map(c => c.id)

        // Number main citations first
        citations.forEach(citation => {
          globalMap.set(citation.id, citationCounter++)
        })

        // Recursively fetch all levels
        while (fetchQueue.length > 0) {
          const currentId = fetchQueue.shift()!

          // Skip if already processed
          if (processedIds.has(currentId)) continue
          processedIds.add(currentId)

          try {
            const response = await fetch(`/api/developments/public/${currentId}`, {
              credentials: 'include'
            })

            if (response.ok) {
              const dev = await response.json()
              const developmentId = dev._id || dev.id || currentId

              // Store development
              allDevs.set(currentId, {
                id: developmentId,
                title: dev.title || dev.name || `Development ${developmentId}`,
                description: dev.description || dev.summary?.substring(0, 200) || "Development details",
                industry: dev.industry || "Market Intelligence",
                product: dev.product,
                date: dev.date || dev.created_at,
                summary: dev.summary || dev.analysis || "",
                url: dev.url,
                numerical_data: dev.numerical_data || []
              })

              // Parse citations from this development
              if (dev.summary || dev.analysis) {
                const text = dev.summary || dev.analysis
                const { citations: subCitations } = parseDevCitations(text)

                // Add new citations to global map and fetch queue
                subCitations.forEach(subCitation => {
                  if (!globalMap.has(subCitation.id)) {
                    globalMap.set(subCitation.id, citationCounter++)
                    fetchQueue.push(subCitation.id) // Fetch this citation recursively
                  }
                })
              }
            }
          } catch (err) {
            // Skip individual failures
            continue
          }
        }

        setDevelopments(allDevs)
        setGlobalCitationMap(globalMap)
      } catch (error) {
        // Silently handle fetch errors
      } finally {
        setLoading(false)
      }
    }

    fetchDevelopments()
  }, [citations])

  // Auto-scroll to selected citation tab when citation changes
  useEffect(() => {
    if (!selectedCitationId) return

    // Wait for panel animation and DOM
    const timer = setTimeout(() => {
      const selectedButton = document.querySelector(`button[data-citation-id="${selectedCitationId}"]`) as HTMLElement
      if (!selectedButton) return

      const scrollContainer = selectedButton.closest('.overflow-x-auto') as HTMLElement
      if (!scrollContainer) return

      // Get button's position relative to its offset parent
      const buttonLeft = selectedButton.offsetLeft
      const buttonWidth = selectedButton.offsetWidth
      const containerWidth = scrollContainer.clientWidth

      // Calculate position to center the button
      const targetScroll = buttonLeft - (containerWidth / 2) + (buttonWidth / 2)

      // Set scroll position directly
      scrollContainer.scrollLeft = targetScroll
    }, 400)

    return () => clearTimeout(timer)
  }, [selectedCitationId])

  return (
    <>
      {/* Mobile Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="md:hidden fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Desktop Panel - Traditional 3-column sidebar */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "min(400px, 30vw)", opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex h-[calc(100vh-180px)] bg-background border-l border-border flex-col overflow-hidden flex-shrink-0"
      >
        {/* Desktop Header */}
        <div className="px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Source Documents</h3>
              <Badge variant="secondary" className="text-xs">
                {citations.length} cited
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Citation Tabs */}
        <div className="px-3 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-1 overflow-x-auto" id="rohith-citation-tabs-desktop">
            {citations.map((citation) => (
              <Button
                key={citation.id}
                variant={selectedCitationId === citation.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onCitationSelect(citation.id)}
                data-citation-id={citation.id}
                className={cn(
                  "px-3 py-1 h-8 text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors duration-200",
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

        {/* Desktop Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 pb-8">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <CrownLoader size="sm" text="Loading source..." />
              </div>
            ) : (
              <AnimatePresence mode="wait">
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
                          citationNumber={undefined}
                          onCitationClick={onCitationSelect}
                          citationMap={globalCitationMap}
                        />
                      )
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
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
        className="md:hidden fixed inset-0 w-full z-50 h-full bg-background flex flex-col overflow-hidden"
      >
        {/* Mobile Header */}
        <div className="px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Source Documents</h3>
              <Badge variant="secondary" className="text-xs">
                {citations.length} cited
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Citation Tabs */}
        <div className="px-3 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-1 overflow-x-auto" id="rohith-citation-tabs-mobile">
            {citations.map((citation) => (
              <Button
                key={citation.id}
                variant={selectedCitationId === citation.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onCitationSelect(citation.id)}
                data-citation-id={citation.id}
                className={cn(
                  "px-3 py-1 h-8 text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors duration-200",
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

        {/* Mobile Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 pb-8">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <CrownLoader size="sm" text="Loading source..." />
              </div>
            ) : (
              <AnimatePresence mode="wait">
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
                          citationNumber={undefined}
                          onCitationClick={onCitationSelect}
                          citationMap={globalCitationMap}
                        />
                      )
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </>
  )
}

export default CitationPanel