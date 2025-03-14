// components/pages/play-books-page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { Layout } from "@/components/layout/layout"
// import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  showOnlyPurchased = true,
}: {
  onNavigate: (route: string) => void
  userEmail: string
  showOnlyPurchased?: boolean
}) {
  const { theme } = useTheme()
  const { markStepAsCompleted } = useOnboarding()
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Define playbook data for pb_001
  const pb001Data = {
    id: "pb_001",
    title: "How to Sell 2 Crore Apartments in India",
    description: "Master the art of selling luxury apartments in India's competitive real estate market.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: true,
    industry: "Real Estate",
    paymentButtonId: "pl_Pn7fgca55mS4zy"
  };

  // Use useCallback to prevent unnecessary rerenders
  const fetchPlaybooks = useCallback(async () => {
    setIsLoading(true)
    try {
      // Hardcoded list of emails with access to pb_001
      const pb001AccessEmails = [
        "media@montaigne.co",
        "info@montaigne.co",
        "r.v.kharvannan@gmail.com",
        "rohith.sampathi@gmail.com"
      ];

      // Check if current user has access to pb_001
      const hasPb001Access = pb001AccessEmails.includes(userEmail);
      
      // Create playbooks array
      const userPlaybooks = [];
      
      // Add pb_001 for authorized emails
      if (hasPb001Access) {
        userPlaybooks.push(pb001Data);
      }
      
      setPlaybooks(userPlaybooks);
    } catch (error) {
      console.error('Error in fetchPlaybooks:', error);
      setPlaybooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail])

  useEffect(() => {
    markStepAsCompleted("playbooks")
    fetchPlaybooks()
  }, [markStepAsCompleted, fetchPlaybooks])

  const handlePlaybookClick = async (playbookId: string) => {
    try {
      // Hardcoded list of emails with access to pb_001
      const pb001AccessEmails = [
        "media@montaigne.co", 
        "info@montaigne.co", 
        "r.v.kharvannan@gmail.com", 
        "rohith.sampathi@gmail.com"
      ];
      
      // Special handling for pb_001
      if (playbookId === "pb_001") {
        // Only authorized users can view this playbook
        if (pb001AccessEmails.includes(userEmail)) {
          onNavigate(`playbook/${playbookId}`);
        } else {
          toast({
            title: "Access Denied",
            description: "You don't have access to this playbook.",
            variant: "destructive",
          });
        }
        return;
      }
      
      // For other playbooks, fetch to verify it's available
      const response = await fetch(`${API_BASE_URL}/api/reports/${playbookId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
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
        <div className={`w-full ${theme === "dark" ? "text-white" : "text-[#121212]"} bg-transparent`}>
          <div className="p-6">
            <div className="space-y-1 mb-4">
              <Heading2 className="text-primary">Your Strategic Arsenal</Heading2>
              <Paragraph className="text-sm text-muted-foreground">
                Access your purchased playbooks and strategic guides
              </Paragraph>
            </div>
          </div>
          <div className="px-6 pb-6">
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
          </div>
        </div>
      </Layout>
    </>
  )
}