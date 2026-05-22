"use client"

import { useMemo, useState } from "react"
import { Check, Share2 } from "lucide-react"

import { DevelopmentStream } from "@/components/development-stream"
import { EliteCitationPanel } from "@/components/elite/elite-citation-panel"
import { Header } from "@/components/layout/header"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { useCitationManager } from "@/hooks/use-citation-manager"
import { parseDevCitations } from "@/lib/parse-dev-citations"
import type { HNWIWorldDevelopment } from "@/types/hnwi-world"

interface SharedDevelopmentClientProps {
  development: HNWIWorldDevelopment
  developmentId: string
}

export default function SharedDevelopmentClient({
  development,
  developmentId,
}: SharedDevelopmentClientProps) {
  const { theme } = useTheme()
  const [isCopied, setIsCopied] = useState(false)
  const initialCitations = useMemo(
    () => parseDevCitations(development.summary || "").citations,
    [development.summary]
  )
  const [isCitationRailOpen, setIsCitationRailOpen] = useState(false)

  const {
    citations,
    citationMap,
    selectedCitationId,
    openCitation,
    setSelectedCitationId,
  } = useCitationManager(initialCitations)

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

      <main className="flex-1 w-full px-4 pt-4 pb-4 md:pt-5 md:pb-5">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className={`w-full ${isCitationRailOpen ? "lg:w-[70%]" : "lg:w-full"} transition-all duration-300`}>
            <DevelopmentStream
              selectedIndustry="All"
              duration="7d"
              getIndustryColor={() => ""}
              expandedDevelopmentId={developmentId}
              developments={[development]}
              isLoading={false}
              onCitationClick={(citationId) => {
                setIsCitationRailOpen(true)
                openCitation(citationId)
              }}
              citationMap={citationMap}
            />
          </div>

          {isCitationRailOpen && (
            <EliteCitationPanel
              citations={citations}
              selectedCitationId={selectedCitationId}
              onClose={() => setIsCitationRailOpen(false)}
              onCitationSelect={setSelectedCitationId}
              citationMap={citationMap}
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
