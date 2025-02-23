// components/pages/play-books-page.tsx

"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PremiumPlaybookCard } from "@/components/premium-playbook-card"
import { useTheme } from "@/contexts/theme-context"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Loader2, Shield } from "lucide-react"
import { Heading2, Paragraph } from "@/components/ui/typography"
import { useToast } from "@/components/ui/use-toast"
import { MetaTags } from "../meta-tags"

interface Playbook {
  id: string
  title: string
  description: string
  image: string | JSX.Element
  isPurchased: boolean
  industry: string
  paymentButtonId?: string
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

  const fetchPlaybooks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          type: "purchased"
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const purchasedPlaybooks = data.reports.map((report: any) => ({
        id: report.metadata.id,
        title: report.metadata.title,
        description: report.metadata.description,
        image: report.metadata.image || "/placeholder.svg?height=200&width=300&text=Report",
        isPurchased: true, // These are all purchased playbooks
        industry: report.metadata.industry || "Unknown",
        paymentButtonId: report.metadata.paymentButtonId,
      }))

      setPlaybooks(purchasedPlaybooks)
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
  }

  useEffect(() => {
    markStepAsCompleted("playbooks")
    fetchPlaybooks()
  }, [markStepAsCompleted])

  const handlePlaybookClick = async (playbookId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${playbookId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.status} ${response.statusText}`)
      }

      await response.json() // Verify we can get the data
      onNavigate(`playbook/${playbookId}`)
    } catch (error) {
      console.error('Error fetching playbook:', error)
      toast({
        title: "Error",
        description: "Failed to load playbook content. Please try again.",
        variant: "destructive",
      })
    }
  }

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
                      onClick={() => onNavigate("play-books")}
                      className="mt-4 text-primary hover:text-primary/80 underline"
                    >
                      Browse available playbooks
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playbooks.map((playbook) => (
                      <PremiumPlaybookCard
                        key={playbook.id}
                        playbook={playbook}
                        onClick={() => handlePlaybookClick(playbook.id)}
                        onPurchase={() => {}} // Not needed for purchased playbooks
                      />
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