"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Check, ExternalLink, FileText, Share2 } from "lucide-react"

import { CitationDevelopmentCard } from "@/components/ask-rohith/citation-development-card"
import { CitationText } from "@/components/elite/citation-text"
import { Header } from "@/components/layout/header"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { CrownLoader } from "@/components/ui/crown-loader"
import { useTheme } from "@/contexts/theme-context"
import { useCitationManager } from "@/hooks/use-citation-manager"
import {
  buildCitationSourceDevelopment,
  type CitationSourceDevelopment,
} from "@/lib/development-citation"
import { CITATION_REFERENCE_PATTERN, parseDevCitations } from "@/lib/parse-dev-citations"
import type { Citation } from "@/lib/parse-dev-citations"
import type { HNWIWorldDevelopment } from "@/types/hnwi-world"

interface SharedDevelopmentClientProps {
  development: HNWIWorldDevelopment
  developmentId: string
}

function briefBodyFor(development: HNWIWorldDevelopment): string {
  const candidates = [
    development.full_text,
    development.castle_brief_enriched,
    development.castle_brief,
    development.summary,
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0)

  const citationPattern = new RegExp(CITATION_REFERENCE_PATTERN, "i")
  const citationBearingBody = candidates.find((value) => citationPattern.test(value))

  return (citationBearingBody || candidates[0] || "").trim()
}

function normalizeBriefBody(value: string): string {
  return value
    .replace(/\s+(##\s+)/g, "\n\n$1")
    .replace(/\s+(\*\*(?:Winners?|Losers?|Potential Moves?)\*\*\s*:)/gi, "\n\n$1")
    .replace(/\s+(Reversal condition\s*:)/gi, "\n\n$1")
    .replace(/\s+(Stress Test\s*:)/gi, "\n\n$1")
    .replace(/\s+(Bottom Line\s*:)/gi, "\n\n$1")
    .replace(/\s+(HNWI Sentiment\s*:)/gi, "\n\n$1")
    .replace(/\s+(Opportunity Window\s*:)/gi, "\n\n$1")
    .replace(/\s+(Primary Concern\s*:)/gi, "\n\n$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function splitBriefBlocks(value: string): string[] {
  return normalizeBriefBody(value)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
}

function displayDate(value?: string): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

interface SharedCitationRailProps {
  citations: Citation[]
  citationMap: Map<string, number>
  selectedCitationId: string | null
  selectedSource: CitationSourceDevelopment | null | undefined
  loadingCitationId: string | null
  onCitationSelect: (citationId: string) => void
}

function SharedCitationRail({
  citations,
  citationMap,
  selectedCitationId,
  selectedSource,
  loadingCitationId,
  onCitationSelect,
}: SharedCitationRailProps) {
  const activeCitationNumber = selectedCitationId ? citationMap.get(selectedCitationId) : undefined

  return (
    <aside className="w-full lg:w-[32%]">
      <div className="sticky top-24 rounded-2xl border border-border bg-background p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-foreground">
              Source Evidence
            </h2>
          </div>
          <span className="rounded-full border border-border px-2 py-1 text-xs font-semibold text-muted-foreground">
            {citations.length} cited
          </span>
        </div>

        <div className="mb-4 flex max-h-28 flex-wrap gap-2 overflow-y-auto">
          {citations.map((citation) => (
            <Button
              key={citation.id}
              type="button"
              variant={citation.id === selectedCitationId ? "default" : "outline"}
              size="sm"
              onClick={() => onCitationSelect(citation.id)}
              className="h-8 min-w-10 px-2 text-xs"
              aria-label={`Open citation ${citation.number}`}
            >
              [{citation.number}]
            </Button>
          ))}
        </div>

        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
          {loadingCitationId && loadingCitationId === selectedCitationId ? (
            <div className="flex items-center justify-center py-8">
              <CrownLoader size="sm" text="Loading source..." />
            </div>
          ) : selectedSource ? (
            <CitationDevelopmentCard
              development={selectedSource}
              citationNumber={activeCitationNumber}
              onCitationClick={onCitationSelect}
              citationMap={citationMap}
            />
          ) : (
            <div className="rounded-lg border border-border/70 p-4 text-sm text-muted-foreground">
              Select an inline citation to open the source packet.
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default function SharedDevelopmentClient({
  development,
  developmentId,
}: SharedDevelopmentClientProps) {
  const { theme } = useTheme()
  const [isCopied, setIsCopied] = useState(false)
  const fullBrief = useMemo(() => briefBodyFor(development), [development])
  const briefBlocks = useMemo(() => splitBriefBlocks(fullBrief), [fullBrief])
  const initialCitations = useMemo(() => parseDevCitations(normalizeBriefBody(fullBrief)).citations, [fullBrief])
  const [sourceDevelopments, setSourceDevelopments] = useState<Map<string, CitationSourceDevelopment | null>>(new Map())
  const [loadingCitationId, setLoadingCitationId] = useState<string | null>(null)

  const {
    citations,
    citationMap,
    selectedCitationId,
    openCitation,
    setSelectedCitationId,
  } = useCitationManager(initialCitations)

  const loadCitationSource = useCallback(async (citationId: string) => {
    const normalizedCitationId = citationId.trim()
    if (!normalizedCitationId || sourceDevelopments.has(normalizedCitationId)) {
      return
    }

    setLoadingCitationId(normalizedCitationId)
    try {
      const response = await fetch(`/api/developments/public/${encodeURIComponent(normalizedCitationId)}`)
      if (!response.ok) {
        setSourceDevelopments((current) => new Map(current).set(normalizedCitationId, null))
        return
      }

      const payload = await response.json()
      const source = buildCitationSourceDevelopment(payload, normalizedCitationId)
      setSourceDevelopments((current) => new Map(current).set(normalizedCitationId, source))
    } catch {
      setSourceDevelopments((current) => new Map(current).set(normalizedCitationId, null))
    } finally {
      setLoadingCitationId(null)
    }
  }, [sourceDevelopments])

  const handleCitationClick = useCallback((citationId: string) => {
    const normalizedCitationId = citationId.trim()
    setSelectedCitationId(normalizedCitationId)
    openCitation(normalizedCitationId)
    void loadCitationSource(normalizedCitationId)
  }, [loadCitationSource, openCitation, setSelectedCitationId])

  useEffect(() => {
    if (!selectedCitationId && citations[0]?.id) {
      handleCitationClick(citations[0].id)
      return
    }

    if (selectedCitationId) {
      void loadCitationSource(selectedCitationId)
    }
  }, [citations, handleCitationClick, loadCitationSource, selectedCitationId])

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 3000)
    } catch {
      const textArea = document.createElement("textarea")
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 3000)
    }
  }

  const renderedDate = displayDate(development.date)
  const sourceUrl = development.url
  const selectedSource = selectedCitationId ? sourceDevelopments.get(selectedCitationId) : undefined

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-50">
        <Header
          showBackButton={false}
          onNavigate={(route) => {
            if (route === "dashboard") {
              window.location.href = "https://www.hnwichronicles.com"
            }
          }}
        >
          <ThemeToggle />
          <Button
            onClick={handleShare}
            variant={isCopied ? "default" : "outline"}
            size="sm"
            className={`gap-2 hidden sm:flex transition-all ${
              isCopied
                ? theme === "light"
                  ? "bg-black text-white border-black"
                  : "bg-primary text-primary-foreground"
                : theme === "light"
                  ? "hover:bg-black hover:text-white hover:border-black"
                  : ""
            }`}
          >
            {isCopied ? (
              <>
                <Check className="h-3 w-3" />
                Link Copied
              </>
            ) : (
              <>
                <Share2 className="h-3 w-3" />
                Share
              </>
            )}
          </Button>
        </Header>
      </div>

      <main className="flex-1 w-full px-4 py-5 md:py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
          <article className={`w-full ${citations.length > 0 ? "lg:w-[68%]" : "lg:w-full"} transition-all duration-300`}>
            <div className="rounded-2xl border border-border bg-background px-4 py-5 shadow-sm md:px-8 md:py-8">
              <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span>HNWI World</span>
                <span className="text-muted-foreground/50">/</span>
                <span>Full Library Brief</span>
                {renderedDate && (
                  <>
                    <span className="text-muted-foreground/50">/</span>
                    <span>{renderedDate}</span>
                  </>
                )}
              </div>

              <div className="mb-8 border-b border-border pb-6">
                <h1 className={`max-w-4xl text-3xl font-black leading-tight md:text-5xl ${
                  theme === "dark" ? "text-primary" : "text-black"
                }`}>
                  {development.title}
                </h1>
                {development.description && (
                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                    {development.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {development.industry && (
                    <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {development.industry}
                    </span>
                  )}
                  {sourceUrl && (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Source
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {briefBlocks.map((block, index) => {
                  const headingMatch = block.match(/^##\s+(.+)$/)
                  if (headingMatch) {
                    return (
                      <h2
                        key={`brief-heading-${index}`}
                        className={`border-t border-border pt-6 text-xl font-black uppercase tracking-[0.12em] md:text-2xl ${
                          theme === "dark" ? "text-primary" : "text-black"
                        }`}
                      >
                        {headingMatch[1].trim()}
                      </h2>
                    )
                  }

                  const subheadingMatch = block.match(/^\*\*((?:Winners?|Losers?|Potential Moves?))\*\*\s*:\s*(.*)$/i)
                  if (subheadingMatch) {
                    return (
                      <section key={`brief-subsection-${index}`} className="space-y-3 rounded-lg border border-border/70 p-4">
                        <h3 className="text-base font-black uppercase tracking-[0.12em] text-muted-foreground">
                          {subheadingMatch[1]}
                        </h3>
                        {subheadingMatch[2] && (
                          <CitationText
                            text={subheadingMatch[2]}
                            onCitationClick={handleCitationClick}
                            citationMap={citationMap}
                            className="text-base font-medium leading-8 text-foreground/90"
                            options={{ convertMarkdownBold: true, preserveLineBreaks: true }}
                          />
                        )}
                      </section>
                    )
                  }

                  return (
                    <div key={`brief-block-${index}`} className="text-base font-medium leading-8 text-foreground/90">
                      <CitationText
                        text={block}
                        onCitationClick={handleCitationClick}
                        citationMap={citationMap}
                        options={{ convertMarkdownBold: true, preserveLineBreaks: true }}
                      />
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
                Shared HNWI World brief
              </div>
            </div>
          </article>

          {citations.length > 0 && (
            <SharedCitationRail
              citations={citations}
              citationMap={citationMap}
              selectedCitationId={selectedCitationId}
              selectedSource={selectedSource}
              loadingCitationId={loadingCitationId}
              onCitationSelect={handleCitationClick}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-border/30 px-4 py-4 md:py-5 flex-shrink-0 bg-background">
        <div className="mx-auto max-w-7xl text-center space-y-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            A product of <span className="font-semibold text-primary">Montaigne</span>
          </p>
          <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
            © 2026 All Rights Reserved. HNWI Chronicles.
          </p>
        </div>
      </footer>
    </div>
  )
}
