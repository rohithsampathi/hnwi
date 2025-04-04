// components/pages/playbook-page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { Layout } from "@/components/layout/layout"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://uwind.onrender.com"

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

      const response = await fetch(`${API_BASE_URL}/api/reports/${playbookId}`, {
        headers
      })

      if (!response.ok) {
        throw new Error("Failed to fetch report")
      }

      const data = await response.json()
      
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
      console.error("Error fetching report:", error)
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
      <Layout title="Report Not Found" showBackButton onNavigate={() => onNavigate("my-playbooks")}>
        <div className={`w-full ${theme === "dark" ? "text-white" : "text-[#121212]"}`}>
          <div className="p-6">
            <div className="text-center py-8">
              <Paragraph className="text-red-500">The requested report could not be found.</Paragraph>
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
        <div>
          <div className="flex items-center space-x-2">
            <Heading2>{report?.metadata.title || "Loading Report..."}</Heading2>
          </div>
          {report?.metadata.industry && (
            <Paragraph className="text-sm text-muted-foreground mt-1">
              Industry: {report.metadata.industry}
            </Paragraph>
          )}
        </div>
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
          <div className="flex justify-between items-center mb-4">
            <Heading2 className="text-2xl font-bold text-primary">
              {report.metadata.title}
            </Heading2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onNavigate("my-playbooks")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Button>
          </div>

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