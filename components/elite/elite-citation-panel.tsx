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
}

export function EliteCitationPanel({
  citations,
  selectedCitationId,
  onClose,
  onCitationSelect
}: EliteCitationPanelProps) {
  const [loading, setLoading] = useState(false)
  const [developments, setDevelopments] = useState<Map<string, Development>>(new Map())

  // Fetch development data when citations change
  useEffect(() => {
    if (citations.length === 0) return

    const fetchDevelopments = async () => {
      setLoading(true)
      try {
        const citationIds = citations.map(c => c.id)
        const newDevs = new Map<string, Development>()

        // Fetch each development individually from public endpoint
        for (const citationId of citationIds) {
          try {
            const response = await fetch(`/api/developments/public/${citationId}`, {
              credentials: 'include'
            })

            if (response.ok) {
              const dev = await response.json()
              const developmentId = dev._id || dev.id || citationId

              newDevs.set(citationId, {
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
            }
          } catch (err) {
            continue
          }
        }

        setDevelopments(newDevs)
      } catch (error) {
        // Silently handle fetch errors
      } finally {
        setLoading(false)
      }
    }

    fetchDevelopments()
  }, [citations])

  return (
    <>
      {/* Mobile Overlay Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="md:hidden fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Desktop Panel - Sidebar in third column */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 320, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex w-[320px] flex-col bg-background border-l border-border h-[calc(100vh-280px)] sticky top-6"
      >
        {/* Desktop Header */}
        <div className="px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm flex-shrink-0">
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
              className="h-8 w-8 p-0 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Citation Tabs */}
        <div className="px-3 py-3 border-b border-border bg-muted/30 flex-shrink-0">
          <div className="overflow-x-auto scrollbar-hide max-w-full">
            <div className="flex gap-1 pb-1 min-w-max">
              {citations.map((citation) => (
                <Button
                  key={citation.id}
                  variant={selectedCitationId === citation.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onCitationSelect(citation.id)}
                  className={cn(
                    "px-3 py-1 h-8 text-xs font-medium whitespace-nowrap flex-shrink-0 min-w-[2.5rem]",
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
        className="md:hidden fixed inset-0 w-full z-50 h-full bg-background flex flex-col overflow-hidden"
      >
        {/* Mobile Header with Close Button */}
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
              className="h-10 w-10 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Citation Tabs */}
        <div className="px-3 py-3 border-b border-border bg-muted/30">
          <div className="overflow-x-auto scrollbar-hide max-w-full">
            <div className="flex gap-1 pb-1 min-w-max">
              {citations.map((citation) => (
                <Button
                  key={citation.id}
                  variant={selectedCitationId === citation.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onCitationSelect(citation.id)}
                  className={cn(
                    "px-3 py-1 h-8 text-xs font-medium whitespace-nowrap flex-shrink-0 min-w-[2.5rem]",
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
                          citationNumber={citations.find(c => c.id === selectedCitationId)?.number}
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