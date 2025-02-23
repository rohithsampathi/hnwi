// components/pages/playbook-page.tsx

"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useTheme } from "@/contexts/theme-context"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Heading2, Heading3, Paragraph } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Your custom UI pieces:
import { PlaybookLoader } from "@/components/playbook-loader"
import { PlaybookSidebar } from "@/components/playbook-sidebar"
import { PlaybookContent } from "@/components/playbook-content"
// Or if you prefer "Report" from your snippet, you can incorporate that too.

// Types for the server response:
interface ReportData {
  metadata: {
    id: string
    title: string
    description?: string
    industry?: string
  }
  structure: Array<{
    type: string
    content: string
    elements: Array<any>
  }>
}

// We can unify it into a local "Playbook" shape
interface Playbook {
  id: string
  title: string
  description?: string
  industry?: string
  structure: Array<{
    type: string
    content: string
    elements: Array<any>
  }>
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://uwind.onrender.com"

export function PlaybookPage({
  playbookId,
  onNavigate,
}: {
  playbookId: string
  onNavigate: (route: string) => void
}) {
  const { theme } = useTheme()

  const [playbook, setPlaybook] = useState<Playbook | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0)

  // Navigate back to War Room or wherever you want:
  const handleBack = useCallback(() => {
    onNavigate("war-room")
  }, [onNavigate])

  // Main fetch function
  const fetchPlaybook = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // IMPORTANT: Correct GET endpoint
      const response = await fetch(`${API_BASE_URL}/api/reports/${playbookId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch playbook. Status: ${response.status}`)
      }

      const data: ReportData = await response.json()

      // Convert server shape => local shape
      const loadedPlaybook: Playbook = {
        id: data.metadata.id,
        title: data.metadata.title,
        description: data.metadata.description,
        industry: data.metadata.industry,
        structure: data.structure || [],
      }

      setPlaybook(loadedPlaybook)
    } catch (error: any) {
      console.error("Error fetching playbook:", error)
      // Optionally show a toast, etc.
    } finally {
      setIsLoading(false)
    }
  }, [playbookId])

  useEffect(() => {
    fetchPlaybook()
  }, [fetchPlaybook])

  // Render
  return (
    <Layout
      title={
        <div className="flex items-center space-x-2">
          {/* If you want an icon here: */}
          {/* <BookOpen className="w-6 h-6 text-primary" /> */}
          <Heading2>Playbook</Heading2>
        </div>
      }
      showBackButton={true}
      onNavigate={onNavigate}
    >
      {isLoading ? (
        <PlaybookLoader />
      ) : !playbook ? (
        // If the fetch failed or there's no data
        <div className="text-center py-10">
          <Paragraph className="text-red-500">Failed to load playbook or access denied.</Paragraph>
          <Button variant="outline" onClick={handleBack} className="mt-4">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Return to War Room
          </Button>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:space-x-4">
          {/* Sidebar on the left (desktop) */}
          <div className="md:w-64 flex-shrink-0 mb-4 md:mb-0">
            <Card
              className={`h-full overflow-hidden ${
                theme === "dark" ? "bg-[#1E1E1E] text-white" : "bg-white text-[#121212]"
              }`}
            >
              <CardHeader>
                <Heading3>{playbook.title}</Heading3>
                {playbook.industry && (
                  <Paragraph className="text-xs text-muted-foreground">
                    Industry: {playbook.industry}
                  </Paragraph>
                )}
              </CardHeader>
              <PlaybookSidebar
                sections={playbook.structure}
                activeSection={activeSectionIndex}
                onSectionChange={setActiveSectionIndex}
              />
            </Card>
          </div>

          {/* Main content area */}
          <div className="flex-1">
            <Card
              className={`h-full ${
                theme === "dark" ? "bg-[#1E1E1E] text-white" : "bg-white text-[#121212]"
              }`}
            >
              <CardContent>
                {playbook.structure.length === 0 ? (
                  <Paragraph>No sections found in this playbook.</Paragraph>
                ) : (
                  // The "activeSectionIndex" controls which structure item to show
                  <PlaybookContent
                    section={playbook.structure[activeSectionIndex]}
                    // If you have an "analysisResult" or "industry" prop, pass them:
                    industry={playbook.industry}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  )
}
