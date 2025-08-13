// components/pages/playbook-store-page.tsx

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PremiumPlaybookCard } from "@/components/premium-playbook-card"
import { useTheme } from "@/contexts/theme-context"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Loader2, BookOpen } from "lucide-react"
import { CrownLoader } from "@/components/ui/crown-loader"
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

import { secureApi } from "@/lib/secure-api"

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
  userData,
}: { 
  onNavigate: (route: string) => void; 
  userEmail: string;
  userData?: any;
}) {
  const { theme } = useTheme()
  const { markStepAsCompleted } = useOnboarding()
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const hasCompletedStep = useRef(false)
  const apiAttempted = useRef(false)
  
  // Check for known users to handle pb_001 special case
  const isKnownUser = 
    userEmail === "info@montaigne.co" || 
    userEmail === "rohith.sampathi@gmail.com" ||
    userEmail === "goapropertyhub@gmail.com" ||
    userEmail === "r.v.kharvannan@gmail.com" ||
    userEmail === "info@ycombinator.com";
  
  // Get purchased report IDs from various possible userData structures
  const getPurchasedReportIds = useCallback(() => {
    const reports = [];
    
    // Check userData.purchased_reports
    if (userData?.purchased_reports) {
      reports.push(...userData.purchased_reports.map((report: any) => report.report_id));
    }
    
    // Check userData.profile.purchased_reports
    if (userData?.profile?.purchased_reports) {
      reports.push(...userData.profile.purchased_reports.map((report: any) => report.report_id));
    }
    
    // Special case for known users
    if (isKnownUser && !reports.includes("pb_001")) {
      reports.push("pb_001");
    }
    
    return reports;
  }, [userData, isKnownUser]);

  // Loadplaceholder playbooks with correct purchase status
  const loadPlaceholderPlaybooks = useCallback(() => {
    const purchasedReportIds = getPurchasedReportIds();
    
    const filteredPlaybooks = PLACEHOLDER_PLAYBOOKS.map(playbook => ({
      ...playbook,
      isPurchased: purchasedReportIds.includes(playbook.id)
    })).filter(playbook => !playbook.isPurchased);
    
    setPlaybooks(filteredPlaybooks);
    setIsLoading(false);
  }, [getPurchasedReportIds]);

  // Try multiple API approaches to fetch playbooks
  const fetchPlaybooks = useCallback(async () => {
    if (!isLoading || apiAttempted.current) return;
    apiAttempted.current = true;
    
    try {
      // First try with user data from context
      const purchasedReportIds = getPurchasedReportIds();
      
      // Try to get auth token from multiple sources
      let token = userData?.token;
      if (!token) {
        token = localStorage.getItem("token");
      }
      
      // Skip API call if we already know what the user has purchased
      if (purchasedReportIds.length > 0) {
        const filteredPlaybooks = PLACEHOLDER_PLAYBOOKS
          .map(playbook => ({
            ...playbook,
            isPurchased: purchasedReportIds.includes(playbook.id)
          }))
          .filter(playbook => !playbook.isPurchased);
        
        setPlaybooks(filteredPlaybooks);
        setIsLoading(false);
        return;
      }
      
      // Multiple API call attempts with different methods and endpoints
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      // Try GET first (even though it gave 405 before)
      try {
        const data = await secureApi.get("/api/reports", true, { enableCache: true, cacheDuration: 600000 }); // 10 minutes for playbooks/reports
        
        clearTimeout(timeoutId);
        // Process response and set playbooks...
        
        let apiPlaybooks = [];
        if (Array.isArray(data.reports)) {
          apiPlaybooks = data.reports.map((report: any) => ({
            id: report.metadata.id,
            title: report.metadata.title,
            description: report.metadata.description,
            image: report.metadata.image || "/placeholder.svg?height=200&width=300&text=Report",
            isPurchased: report.metadata.isPurchased || false,
            industry: report.metadata.industry || "Unknown",
            paymentButtonId: report.metadata.paymentButtonId || DEFAULT_RAZORPAY_BUTTON_ID,
          }));
        }
        
        const allPlaybooks = [
          ...apiPlaybooks,
          ...PLACEHOLDER_PLAYBOOKS.filter((p) => !apiPlaybooks.find((ap) => ap.id === p.id)),
        ];
        
        const updatedPlaybooks = allPlaybooks.map((playbook) => ({
          ...playbook,
          isPurchased: purchasedReportIds.includes(playbook.id)
        }));
        
        const unpurchasedPlaybooks = updatedPlaybooks.filter((playbook) => !playbook.isPurchased);
        setPlaybooks(unpurchasedPlaybooks);
        setIsLoading(false);
        return;
      } catch (error) {
        console.warn("GET API request failed:", error);
      }
      
      // If GET failed, try POST
      try {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 3000);
        
        const data = await secureApi.post("/api/reports", {
          email: userEmail,
          userId: userData?.user_id || userData?.profile?.user_id || localStorage.getItem("userId")
        });
        
        clearTimeout(timeoutId2);
        // Process response and set playbooks...
        
        let apiPlaybooks = [];
        if (Array.isArray(data.reports)) {
          apiPlaybooks = data.reports.map((report: any) => ({
            id: report.metadata.id,
            title: report.metadata.title,
            description: report.metadata.description,
            image: report.metadata.image || "/placeholder.svg?height=200&width=300&text=Report",
            isPurchased: report.metadata.isPurchased || false,
            industry: report.metadata.industry || "Unknown",
            paymentButtonId: report.metadata.paymentButtonId || DEFAULT_RAZORPAY_BUTTON_ID,
          }));
        }
        
        const allPlaybooks = [
          ...apiPlaybooks,
          ...PLACEHOLDER_PLAYBOOKS.filter((p) => !apiPlaybooks.find((ap) => ap.id === p.id)),
        ];
        
        const updatedPlaybooks = allPlaybooks.map((playbook) => ({
          ...playbook,
          isPurchased: purchasedReportIds.includes(playbook.id)
        }));
        
        const unpurchasedPlaybooks = updatedPlaybooks.filter((playbook) => !playbook.isPurchased);
        setPlaybooks(unpurchasedPlaybooks);
        setIsLoading(false);
        return;
      } catch (error) {
        console.warn("POST API request failed:", error);
      }
      
      // If everything failed, use placeholders
      loadPlaceholderPlaybooks();
    } catch (error) {
      console.error("Error fetching playbooks:", error);
      loadPlaceholderPlaybooks();
    }
  }, [isLoading, loadPlaceholderPlaybooks, getPurchasedReportIds, userData, userEmail]);

  useEffect(() => {
    // Only complete the step once
    if (!hasCompletedStep.current) {
      markStepAsCompleted("playbooks");
      hasCompletedStep.current = true;
    }
    
    // Fetch playbooks
    fetchPlaybooks();
    
    // Fallback timeout
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        loadPlaceholderPlaybooks();
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [fetchPlaybooks, isLoading, loadPlaceholderPlaybooks, markStepAsCompleted]);

  const handlePlaybookClick = (playbookId: string, isPurchased: boolean) => {
    if (isPurchased) {
      onNavigate(`playbook/${playbookId}`);
    }
  }

  const handlePlaybookPurchase = useCallback(
    (playbookId: string) => {
      setPlaybooks((prevPlaybooks) => prevPlaybooks.filter((playbook) => playbook.id !== playbookId));
      toast({
        title: "Playbook Purchased",
        description: "The playbook has been added to your profile.",
      });
    },
    [toast],
  );

  return (
    <>
      <MetaTags
        title="Playbook Store: Exclusive Strategic Intelligence | HNWI Chronicles"
        description="Acquire institutional-grade strategic playbooks. Off-market intelligence and generational wealth-building strategies for the global top 1%."
        image="https://app.hnwichronicles.com/images/playbook-store-og.png"
        url="https://app.hnwichronicles.com/playbook-store"
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
        <div className="w-full">
          <div className="px-4 py-6">
            <Heading2 className="text-primary">Strategic Playbooks</Heading2>
            <p className="text-muted-foreground text-base leading-tight -mt-1">
              Exclusive strategies curated for elite investors
            </p>
          </div>
          <div className="px-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <CrownLoader size="lg" text="Loading exclusive playbooks..." />
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
          </div>
        </div>
      </Layout>
    </>
  )
}