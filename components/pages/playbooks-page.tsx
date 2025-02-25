// components/pages/playbooks-page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PremiumPlaybookCard } from "@/components/premium-playbook-card"
import { useTheme } from "@/contexts/theme-context"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Loader2, Shield } from "lucide-react"
import { Heading2, Paragraph } from "@/components/ui/typography"
import { useToast } from "@/components/ui/use-toast"
import { MetaTags } from "../meta-tags"

interface PurchasedReport {
  report_id: string
  purchased_at: string
  valid_until: string
  is_active: boolean
}

interface UserData {
  purchased_reports: PurchasedReport[]
  user_id: string
  email: string
}

interface ReportMetadata {
  id: string
  title: string
  description: string
  industry: string
  image?: string
  products?: string[]
  tags?: string[]
}

interface ReportData {
  metadata: ReportMetadata
  structure: Array<{
    type: string
    content: string
    elements: Array<any>
  }>
}

interface Playbook {
  id: string
  title: string
  description: string
  image: string | JSX.Element
  isPurchased: boolean
  industry: string
  valid_until: string
  purchased_at: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://uwind.onrender.com"

export function PlayBooksPage({
  onNavigate,
  userEmail,
}: {
  onNavigate: (route: string) => void
  userEmail: string
}) {
  const { theme } = useTheme()
  const { markStepAsCompleted } = useOnboarding()
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchPlaybooks = useCallback(async () => {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("userId")
      const token = localStorage.getItem("token")

      if (!userId || !token) {
        throw new Error("Authentication details not found")
      }

      // First fetch user data to get purchased reports
      const userResponse = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user data: ${userResponse.status}`)
      }

      const userData: UserData = await userResponse.json()
      // console.log("User data fetched:", userData)

      // Filter active purchased reports
      const activeReports = userData.purchased_reports.filter(report => report.is_active)
      // console.log("Active reports:", activeReports)

      // Fetch details for each report
      const playbookPromises = activeReports.map(async (report) => {
        try {
          const reportResponse = await fetch(`${API_BASE_URL}/api/reports/${report.report_id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })

          if (!reportResponse.ok) {
            console.error(`Failed to fetch report ${report.report_id}:`, reportResponse.status)
            return null
          }

          const reportData: ReportData = await reportResponse.json()
          // console.log(`Report ${report.report_id} data:`, reportData)

          return {
            id: report.report_id,
            title: reportData.metadata?.title || 'Untitled Playbook',
            description: reportData.metadata?.description || '',
            image: reportData.metadata?.image || "/placeholder.svg?height=200&width=300&text=Report",
            isPurchased: true,
            industry: reportData.metadata?.industry || "Unknown",
            valid_until: report.valid_until,
            purchased_at: report.purchased_at
          }
        } catch (error) {
          console.error(`Error fetching report ${report.report_id}:`, error)
          return null
        }
      })

      const resolvedPlaybooks = (await Promise.all(playbookPromises)).filter((book): book is Playbook => book !== null)
      // console.log("Final playbooks data:", resolvedPlaybooks)
      
      setPlaybooks(resolvedPlaybooks)
    } catch (error) {
      console.error('Error fetching playbooks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch your playbooks. Please try again later.",
        variant: "destructive",
      })
      setPlaybooks([])
    } finally {
      setIsLoading(false)
    }
  }, [toast]) // Add toast to dependencies

  const handlePlaybookClick = useCallback((playbookId: string) => {
    onNavigate(`playbook/${playbookId}`)
  }, [onNavigate]) // Add onNavigate to dependencies

  const formatValidUntil = useCallback((date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [])

  useEffect(() => {
    if (markStepAsCompleted) {
      markStepAsCompleted("playbooks")
    }
    fetchPlaybooks()
  }, [markStepAsCompleted, fetchPlaybooks]) // Add both dependencies

  // Handle navigation to browse playbooks
  const handleBrowsePlaybooks = useCallback(() => {
    onNavigate("play-books")
  }, [onNavigate])

  return (
    <>
      <MetaTags
        title="War Room | HNWI Chronicles"
        description="Access your strategic playbooks for high-net-worth individuals."
        image="https://hnwichronicles.com/war-room-og-image.jpg"
        url="https://hnwichronicles.com/war-room"
      />
      <Layout
        title={
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-primary" />
            <Heading2>War Room</Heading2>
          </div>
        }
        showBackButton
        onNavigate={onNavigate}
      >
        <Card className={`w-full ${theme === "dark" ? "bg-[#121212] text-white" : "bg-white text-[#121212]"}`}>
          <CardHeader>
            <div className="space-y-1">
              <Heading2 className="text-primary">Your Strategic Arsenal</Heading2>
              <Paragraph className="text-sm text-muted-foreground">
                Access your purchased playbooks and strategic guides
              </Paragraph>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {playbooks.length === 0 ? (
                  <div className="text-center py-8">
                    <Paragraph>You haven't purchased any playbooks yet.</Paragraph>
                    <button
                      onClick={handleBrowsePlaybooks}
                      className="mt-4 text-primary hover:text-primary/80 underline"
                    >
                      Browse available playbooks
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playbooks.map((playbook) => (
                      <div key={playbook.id} className="flex flex-col">
                        <PremiumPlaybookCard
                          playbook={playbook}
                          onClick={() => handlePlaybookClick(playbook.id)}
                          onPurchase={() => {}}
                        />
                        <Paragraph className="text-xs text-muted-foreground mt-2">
                          Valid until: {formatValidUntil(playbook.valid_until)}
                        </Paragraph>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Layout>
    </>
  )
}