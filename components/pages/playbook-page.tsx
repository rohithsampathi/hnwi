// components/pages/playbook-page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { Layout } from "@/components/layout/layout"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen } from "lucide-react"
import { PlaybookContent } from "@/components/playbook-content"
import { PlaybookSidebar } from "@/components/playbook-sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { Heading2, Heading3, Paragraph } from "@/components/ui/typography"
import { MobilePlaybookView } from "@/components/mobile-playbook-view"
import ChessLoader from "@/components/chess-loader"

interface PlaybookSection {
  type: string
  content: string
  elements: any[]
}

interface ReportMetadata {
  id: string
  title: string
  industry: string
  products?: string[]
  tags?: string[]
  created_at?: string
  updated_at?: string
  version?: number
  status?: string
  description?: string
}

interface Report {
  metadata: ReportMetadata
  structure: PlaybookSection[]
}

import { secureApi } from "@/lib/secure-api"

export function PlaybookPage({ 
  playbookId, 
  onNavigate 
}: { 
  playbookId: string
  onNavigate: (route: string) => void 
}) {
  const { theme } = useTheme()
  const { toast } = useToast()
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<number>(0)
  const [isMobileView, setIsMobileView] = useState(false)

  const fetchPlaybook = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const headers: HeadersInit = {
        "Content-Type": "application/json"
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const data = await secureApi.get(`/api/reports/${playbookId}`, true, { enableCache: true, cacheDuration: 600000 }); // 10 minutes for individual reports
      
      setReport({
        metadata: {
          ...data.metadata,
        },
        structure: [
          ...data.structure,
          {
            type: "channel_performance_rating",
            content: "Channel Performance Rating",
            elements: [
              {
                type: "channel_performance_rating",
                content: "Channel Performance Analysis",
                elements: [],
              },
            ],
          },
          {
            type: "market_data",
            content: "Market Data",
            elements: [
              {
                type: "market_data",
                content: "Market Data Analysis",
                elements: [],
              },
            ],
          },
          {
            type: "competitive_intelligence",
            content: "Competitive Intelligence",
            elements: [
              {
                type: "competitive_intelligence",
                content: "Competitive Intelligence Analysis",
                elements: [],
              },
            ],
          },
          {
            type: "hnwi_thinking",
            content: "What HNWIs are Thinking?",
            elements: [
              {
                type: "hnwi_thinking",
                content: "HNWI Thinking Analysis",
                elements: [],
              },
            ],
          },
        ],
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => setIsLoading(false), 1500) // Minimum 1.5s loading time for animation
    }
  }, [playbookId, toast])

  useEffect(() => {
    fetchPlaybook()
  }, [fetchPlaybook])

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    handleResize() // Set initial value
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  if (!report && !isLoading) {
    return (
      <Layout 
        title={
          <div className="flex items-center space-x-2">
            <BookOpen className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
            <Heading2 className={`${theme === "dark" ? "text-white" : "text-black"}`}>Report Not Found</Heading2>
          </div>
        } 
        showBackButton 
        onNavigate={() => onNavigate("my-playbooks")}
      >
        <div className={`w-full ${theme === "dark" ? "text-white" : "text-[#121212]"}`}>
          <div className="p-6">
            <div className="text-center py-8">
              <Paragraph className="text-destructive">The requested report could not be found.</Paragraph>
              <Button variant="outline" onClick={() => onNavigate("my-playbooks")} className="mt-4">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Return to Reports
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title={
        report ? (
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
              <Heading2 className={`${theme === "dark" ? "text-white" : "text-black"}`}>
                {report.metadata.title}
              </Heading2>
            </div>
            {report.metadata.industry && (
              <p className="text-sm text-muted-foreground mt-1">
                Industry: {report.metadata.industry}
              </p>
            )}
          </div>
        ) : undefined
      }
      showBackButton
      onNavigate={() => onNavigate("my-playbooks")}
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <ChessLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >

          {isMobileView ? (
            <MobilePlaybookView 
              sections={report.structure} 
              industry={report.metadata.industry} 
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row gap-6"
            >
              <div className="md:w-1/4 md:max-w-xs">
                <div className="h-full">
                  <div className="mb-2">
                    {/* Header moved to main layout title */}
                  </div>
                  <PlaybookSidebar
                    sections={report.structure}
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                  />
                </div>
              </div>

              <div className="flex-grow md:w-3/4">
                <div className="h-full">
                  <div>
                    {report.structure.length === 0 ? (
                      <Paragraph>No sections found in this report.</Paragraph>
                    ) : (
                      <PlaybookContent 
                        section={report.structure[activeSection]}
                        industry={report.metadata.industry}
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </Layout>
  )
}