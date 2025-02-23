// components/pages/playbook-store-page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PremiumPlaybookCard } from "@/components/premium-playbook-card"
import { useTheme } from "@/contexts/theme-context"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Loader2, BookOpen } from "lucide-react"
import { Heading2 } from "@/components/ui/typography"
import { useToast } from "@/components/ui/use-toast"
import { MetaTags } from "../meta-tags"

interface Playbook {
  id: string
  title: string
  description: string
  image: string | JSX.Element | string
  isPurchased: boolean
  industry: string
  paymentButtonId?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://uwind.onrender.com"

// Update button IDs
const DEFAULT_RAZORPAY_BUTTON_ID = "pl_Pn7fgca55mS4zy" // Default button
const PREMIUM_RAZORPAY_BUTTON_ID = "pl_PpVywDxD3udMiw" // Premium button

// Update PLACEHOLDER_PLAYBOOKS with stock image URLs
const PLACEHOLDER_PLAYBOOKS: Playbook[] = [
  {
    id: "pb_001",
    title: "How to Sell 2 Crore Apartments in India",
    description: "Master the art of selling luxury apartments in India's competitive real estate market.",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Real Estate",
    paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_002",
    title: "Selling a ₹10 Cr Villa Holiday Home to HNWIs & NRIs",
    description:
      "Highlighting luxury, exclusivity, and investment potential to attract affluent buyers seeking a premium lifestyle getaway.",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Real Estate",
    paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_003",
    title: "Selling a ₹35 Cr Ultra-Luxury Estate to Billionaire Buyers",
    description:
      "Positioning high-end estates as legacy investments with unique value propositions tailored to ultra-wealthy clientele.",
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Real Estate",
    paymentButtonId: PREMIUM_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_004",
    title: "Positioning a ₹50 Cr Commercial Luxury Tower for Global Investors",
    description: "Showcasing commercial luxury real estate as a high-yield investment with premium brand positioning.",
    image:
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Real Estate",
    paymentButtonId: PREMIUM_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_005",
    title: "Selling a ₹90 Lakh Luxury Car in India to First-Time HNWI Buyers",
    description: "Targeting aspirational buyers by emphasizing exclusivity, performance, and lifestyle benefits.",
    image:
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Automotive",
    paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_006",
    title: "Introducing a ₹5 Cr Hypercar to Collectors and Enthusiasts",
    description: "Crafting elite experience-driven launches to attract high-net-worth auto enthusiasts and collectors.",
    image:
      "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Automotive",
    paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_007",
    title: "Launching a ₹5 Million Watch in the Indian Market",
    description: "Creating demand by leveraging brand heritage, storytelling, and influencer-driven exclusivity.",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Luxury Goods",
    paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_008",
    title: "Selling ₹10 Cr Private Memberships for Exclusive Global Retreats",
    description: "Marketing private retreats as status symbols and must-have lifestyle investments for HNWIs.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Travel & Hospitality",
    paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_009",
    title: "Launching a ₹2 Cr Private Art Collection to Elite Collectors",
    description: "Positioning art as an investment and passion purchase through storytelling and exclusivity.",
    image:
      "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Art & Collectibles",
    paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_010",
    title: "Selling a ₹100 Cr Bespoke Investment Fund to UHNWI Families",
    description: "Positioning bespoke financial products as secure, high-growth opportunities for wealth preservation.",
    image:
      "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Finance",
    paymentButtonId: PREMIUM_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_011",
    title: "Introducing a ₹25 Cr Private Island Experience to HNWIs",
    description: "Positioning private island experiences as the pinnacle of luxury and exclusivity.",
    image:
      "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Travel & Hospitality",
    paymentButtonId: PREMIUM_RAZORPAY_BUTTON_ID,
  },
]

export function PlaybookStorePage({
  onNavigate,
  userEmail,
}: { onNavigate: (route: string) => void; userEmail: string }) {
  const { theme } = useTheme()
  const { markStepAsCompleted } = useOnboarding()
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchPlaybooks = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: "GET", // Explicitly set the method to GET
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()

      let apiPlaybooks = []
      if (Array.isArray(data.reports)) {
        apiPlaybooks = data.reports.map((report: any) => ({
          id: report.metadata.id,
          title: report.metadata.title,
          description: report.metadata.description,
          image: report.metadata.image || "/placeholder.svg?height=200&width=300&text=Report",
          isPurchased: report.metadata.isPurchased || false,
          industry: report.metadata.industry || "Unknown",
          paymentButtonId: report.metadata.paymentButtonId || DEFAULT_RAZORPAY_BUTTON_ID,
        }))
      } else {
        console.warn("Unexpected data format:", data)
      }

      const allPlaybooks = [
        ...apiPlaybooks,
        ...PLACEHOLDER_PLAYBOOKS.filter((p) => !apiPlaybooks.find((ap) => ap.id === p.id)),
      ]

      const updatedPlaybooks = allPlaybooks.map((playbook) => ({
        ...playbook,
        isPurchased:
          playbook.id === "pb_001" &&
          userEmail &&
          (userEmail === "rohith.sampathi@gmail.com" ||
            userEmail === "goapropertyhub@gmail.com" ||
            userEmail === "media@montaigne.co" ||
            userEmail === "r.v.kharvannan@gmail.com" ||
            userEmail === "info@ycombinator.com"),
      }))

      const unpurchasedPlaybooks = updatedPlaybooks.filter((playbook) => !playbook.isPurchased)
      setPlaybooks(unpurchasedPlaybooks)
    } catch (error) {
      let errorMessage = "An unknown error occurred while fetching playbooks."
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setPlaybooks(
        PLACEHOLDER_PLAYBOOKS.filter(
          (playbook) =>
            !(
              playbook.id === "pb_001" &&
              userEmail &&
              (userEmail === "rohith.sampathi@gmail.com" ||
                userEmail === "goapropertyhub@gmail.com" ||
                userEmail === "media@montaigne.co" ||
                userEmail === "r.v.kharvannan@gmail.com" ||
                userEmail === "info@ycombinator.com")
            ),
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [userEmail, toast])

  useEffect(() => {
    markStepAsCompleted("playbooks")
    fetchPlaybooks()
  }, [markStepAsCompleted, fetchPlaybooks])

  const handlePlaybookClick = async (playbookId: string, isPurchased: boolean) => {
    if (isPurchased) {
      onNavigate(`playbook/${playbookId}`)
    }
  }

  const handlePlaybookPurchase = useCallback(
    (playbookId: string) => {
      setPlaybooks((prevPlaybooks) => prevPlaybooks.filter((playbook) => playbook.id !== playbookId))
      toast({
        title: "Playbook Purchased",
        description: "The playbook has been added to your profile.",
      })
    },
    [toast],
  )

  return (
    <>
      <MetaTags
        title="Playbook Store | HNWI Chronicles"
        description="Explore and purchase strategic playbooks for high-net-worth individuals."
        image="https://hnwichronicles.com/playbook-store-og-image.jpg"
        url="https://hnwichronicles.com/playbook-store"
      />
      <Layout
        title={
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <Heading2>Playbook Store</Heading2>
          </div>
        }
        showBackButton
        onNavigate={onNavigate}
      >
        <Card className={`w-full ${theme === "dark" ? "bg-[#121212] text-white" : "bg-white text-[#121212]"}`}>
          <CardHeader>
            <Heading2 className="text-primary">Strategic Playbooks</Heading2>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playbooks.map((playbook) => (
                    <PremiumPlaybookCard
                      key={playbook.id}
                      playbook={playbook}
                      onPurchase={handlePlaybookPurchase}
                      onClick={() => handlePlaybookClick(playbook.id, playbook.isPurchased)}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Layout>
    </>
  )
}