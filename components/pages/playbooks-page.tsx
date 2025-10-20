// components/pages/playbooks-page.tsx

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PremiumPlaybookCard } from "@/components/premium-playbook-card"
import { useTheme } from "@/contexts/theme-context"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Loader2, Shield } from "lucide-react"
import { CheckmateLoader } from "@/components/ui/checkmate-loader"
import { Heading2, Paragraph } from "@/components/ui/typography"
import { useToast } from "@/components/ui/use-toast"
import { MetaTags } from "../meta-tags"
import { secureApi } from "@/lib/secure-api"

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
  valid_until?: string
  purchased_at?: string
  paymentButtonId?: string
}

// Store constants
const DEFAULT_RAZORPAY_BUTTON_ID = "pl_Pn7fgca55mS4zy" // Default button
const PREMIUM_RAZORPAY_BUTTON_ID = "pl_PpVywDxD3udMiw" // Premium button

// Available playbooks for purchase
const AVAILABLE_PLAYBOOKS: Playbook[] = [
  {
    id: "pb_001",
    title: "How to Sell 2 Crore Apartments in India",
    description: "Master the art of selling luxury apartments in India's competitive real estate market.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Real Estate",
    paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_002",
    title: "Selling a ₹10 Cr Villa Holiday Home to HNWIs & NRIs",
    description: "Highlighting luxury, exclusivity, and investment potential to attract affluent buyers seeking a premium lifestyle getaway.",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Real Estate",
    paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_003",
    title: "Selling a ₹35 Cr Ultra-Luxury Estate to Billionaire Buyers",
    description: "Positioning high-end estates as legacy investments with unique value propositions tailored to ultra-wealthy clientele.",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Real Estate",
    paymentButtonId: PREMIUM_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_004",
    title: "Positioning a ₹50 Cr Commercial Luxury Tower for Global Investors",
    description: "Showcasing commercial luxury real estate as a high-yield investment with premium brand positioning.",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Real Estate",
    paymentButtonId: PREMIUM_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_005",
    title: "Selling a ₹90 Lakh Luxury Car in India to First-Time HNWI Buyers",
    description: "Targeting aspirational buyers by emphasizing exclusivity, performance, and lifestyle benefits.",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Automotive",
    paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_006",
    title: "Introducing a ₹5 Cr Hypercar to Collectors and Enthusiasts",
    description: "Crafting elite experience-driven launches to attract high-net-worth auto enthusiasts and collectors.",
    image: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Automotive",
    paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_007",
    title: "Launching a ₹5 Million Watch in the Indian Market",
    description: "Creating demand by leveraging brand heritage, storytelling, and influencer-driven exclusivity.",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Luxury Goods",
    paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_008",
    title: "Selling ₹10 Cr Private Memberships for Exclusive Global Retreats",
    description: "Marketing private retreats as status symbols and must-have lifestyle investments for HNWIs.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Travel & Hospitality",
    paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_009",
    title: "Launching a ₹2 Cr Private Art Collection to Elite Collectors",
    description: "Positioning art as an investment and passion purchase through storytelling and exclusivity.",
    image: "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Art & Collectibles",
    paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_010",
    title: "Selling a ₹100 Cr Bespoke Investment Fund to HNWI Families",
    description: "Positioning bespoke financial products as secure, high-growth opportunities for wealth preservation.",
    image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Finance",
    paymentButtonId: PREMIUM_RAZORPAY_BUTTON_ID,
  },
  {
    id: "pb_011",
    title: "Introducing a ₹25 Cr Private Island Experience to HNWIs",
    description: "Positioning private island experiences as the pinnacle of luxury and exclusivity.",
    image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPurchased: false,
    industry: "Travel & Hospitality",
    paymentButtonId: PREMIUM_RAZORPAY_BUTTON_ID,
  },
]

// Fallback playbook data for pb_001 which we know is purchased by users
const FALLBACK_PLAYBOOK: Playbook = {
  id: "pb_001",
  title: "How to Sell 2 Crore Apartments in India",
  description: "Master the art of selling luxury apartments in India's competitive real estate market.",
  image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  isPurchased: true,
  industry: "Real Estate",
  paymentButtonId: DEFAULT_RAZORPAY_BUTTON_ID,
}


export function PlayBooksPage({
  onNavigate,
  userEmail,
  userData,
}: {
  onNavigate: (route: string) => void
  userEmail: string
  userData?: any
}) {
  const { theme } = useTheme()
  const { markStepAsCompleted } = useOnboarding()
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [availablePlaybooks, setAvailablePlaybooks] = useState<Playbook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStore, setIsLoadingStore] = useState(true)
  const { toast } = useToast()
  const hasCompletedStep = useRef(false)
  const fetchAttempted = useRef(false)

  // Extract purchased reports from userData if available
  const getPurchasedReports = useCallback(() => {
    // First try to get from userData directly
    if (userData?.purchased_reports) {
      return userData.purchased_reports;
    }
    
    // Then try profile path which is the structure we saw in the provided data
    if (userData?.profile?.purchased_reports) {
      return userData.profile.purchased_reports;
    }
    
    // Return an empty array if no purchased reports found
    return [];
  }, [userData]);
  
  // A way to check known users with purchased playbooks - now also verifies purchased_reports
  const hasDefaultPlaybook = useCallback(() => {
    const hasPurchasedReports = getPurchasedReports().length > 0;
    return (
      (userEmail === "info@montaigne.co" && hasPurchasedReports) || 
      userEmail === "rohith.sampathi@gmail.com" ||
      userEmail === "goapropertyhub@gmail.com" ||
      userEmail === "r.v.kharvannan@gmail.com" ||
      userEmail === "info@ycombinator.com"
    );
  }, [userEmail, getPurchasedReports]);

  // Load available playbooks for store section
  const loadAvailablePlaybooks = useCallback(() => {
    const purchasedReportIds = getPurchasedReports().map((report: any) => report.report_id);
    
    // Filter out already purchased playbooks
    const filteredPlaybooks = AVAILABLE_PLAYBOOKS.map(playbook => ({
      ...playbook,
      isPurchased: purchasedReportIds.includes(playbook.id)
    })).filter(playbook => !playbook.isPurchased);
    
    setAvailablePlaybooks(filteredPlaybooks);
    setIsLoadingStore(false);
  }, [getPurchasedReports]);

  const fetchPlaybooks = useCallback(async () => {
    if (fetchAttempted.current) return;
    fetchAttempted.current = true;
    setIsLoading(true);
    
    try {
      // Try multiple auth methods
      let userId = localStorage.getItem("userId");
      // Auth via cookies
      
      // If not in localStorage, try from userData
      if ((!userId || !token) && userData) {
        userId = userData.user_id || userData.profile?.user_id;
        token = userData.token;
      }
      
      // Get purchased reports from userData first
      const purchasedReports = getPurchasedReports();
      
      if (purchasedReports.length > 0) {
        // We already have report data from userData, use it directly
        const userPlaybooks = purchasedReports
          .filter(report => report.is_active)
          .map(report => {
            // Create a playbook entry from the report data
            return {
              id: report.report_id,
              title: report.report_id === "pb_001" ? FALLBACK_PLAYBOOK.title : `Playbook ${report.report_id}`,
              description: report.report_id === "pb_001" ? FALLBACK_PLAYBOOK.description : "Your premium strategic playbook",
              image: report.report_id === "pb_001" ? FALLBACK_PLAYBOOK.image : "/placeholder.svg?height=200&width=300&text=Report",
              isPurchased: true,
              industry: report.report_id === "pb_001" ? "Real Estate" : "Premium",
              valid_until: report.valid_until,
              purchased_at: report.purchased_at,
            };
          });
          
        setPlaybooks(userPlaybooks);
        setIsLoading(false);
        return;
      }
      
      // If we have auth info, try to fetch from API
      if (userId && token) {
        try {
          // First fetch user data to get purchased reports
          const userDataResponse: UserData = await secureApi.get(`/api/users/${userId}`, true);
            
          // Filter active purchased reports
          const activeReports = userDataResponse.purchased_reports.filter(report => report.is_active);
          
          // If there are active reports, fetch details for each
          if (activeReports.length > 0) {
            const playbookPromises = activeReports.map(async (report) => {
              try {
                const reportData: ReportData = await secureApi.get(`/api/reports/${report.report_id}`, true);
                    
                return {
                  id: report.report_id,
                  title: reportData.metadata?.title || (report.report_id === "pb_001" ? FALLBACK_PLAYBOOK.title : 'Untitled Playbook'),
                  description: reportData.metadata?.description || (report.report_id === "pb_001" ? FALLBACK_PLAYBOOK.description : ''),
                  image: reportData.metadata?.image || (report.report_id === "pb_001" ? FALLBACK_PLAYBOOK.image : "/placeholder.svg?height=200&width=300&text=Report"),
                  isPurchased: true,
                  industry: reportData.metadata?.industry || (report.report_id === "pb_001" ? "Real Estate" : "Unknown"),
                  valid_until: report.valid_until,
                  purchased_at: report.purchased_at
                };
                } catch (error) {
                  // If error fetching report details, use fallback for known reports
                  if (report.report_id === "pb_001") {
                    return {
                      ...FALLBACK_PLAYBOOK,
                      valid_until: report.valid_until,
                      purchased_at: report.purchased_at
                    };
                  }
                  return null;
                }
              });

              const resolvedPlaybooks = (await Promise.all(playbookPromises)).filter((book): book is Playbook => book !== null);
              setPlaybooks(resolvedPlaybooks);
              setIsLoading(false);
              return;
            }
        } catch (apiError) {
          // Continue to fallback handling
        }
      }
      
      // Fallback: If the user is known to have pb_001
      if (hasDefaultPlaybook()) {
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        
        setPlaybooks([
          {
            ...FALLBACK_PLAYBOOK,
            valid_until: oneMonthFromNow.toISOString(),
            purchased_at: new Date().toISOString()
          }
        ]);
      } else {
        setPlaybooks([]);
      }
    } catch (error) {
      
      // Fallback for known users even if everything else fails
      if (hasDefaultPlaybook()) {
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        
        setPlaybooks([
          {
            ...FALLBACK_PLAYBOOK,
            valid_until: oneMonthFromNow.toISOString(),
            purchased_at: new Date().toISOString()
          }
        ]);
      } else {
        setPlaybooks([]);
        toast({
          title: "Error",
          description: "Failed to fetch your playbooks. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, userData, getPurchasedReports, hasDefaultPlaybook, toast]);

  const handlePlaybookClick = useCallback((playbookId: string) => {
    onNavigate(`playbook/${playbookId}`);
  }, [onNavigate]);

  const formatValidUntil = useCallback((date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  useEffect(() => {
    // Only mark step as completed once
    if (!hasCompletedStep.current && markStepAsCompleted) {
      markStepAsCompleted("playbooks");
      hasCompletedStep.current = true;
    }
    
    // Fetch playbooks once
    fetchPlaybooks();
    // Load available playbooks for store
    loadAvailablePlaybooks();
    
    // Add timeout fallback to ensure UI doesn't get stuck
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        
        // Show fallback for known users
        if (hasDefaultPlaybook()) {
          const oneMonthFromNow = new Date();
          oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
          
          setPlaybooks([
            {
              ...FALLBACK_PLAYBOOK,
              valid_until: oneMonthFromNow.toISOString(),
              purchased_at: new Date().toISOString()
            }
          ]);
        }
      }
      if (isLoadingStore) {
        setIsLoadingStore(false);
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [fetchPlaybooks, loadAvailablePlaybooks, hasDefaultPlaybook, isLoading, isLoadingStore, markStepAsCompleted]);

  // Handle playbook purchase
  const handlePlaybookPurchase = useCallback((playbookId: string) => {
    setAvailablePlaybooks((prevPlaybooks) => 
      prevPlaybooks.filter((playbook) => playbook.id !== playbookId)
    );
    toast({
      title: "Intelligence Acquired",
      description: "Strategic playbook secured in your private vault.",
    });
  }, [toast]);

  return (
    <>
      <MetaTags
        title="War Room: Strategic Playbooks & Intelligence | HNWI Chronicles"
        description="HNWI Pattern Intelligence and exclusive playbooks. Where smart wealth accesses the insights that create generational advantage."
        image="https://app.hnwichronicles.com/images/war-room-og.png"
        url="https://app.hnwichronicles.com/war-room"
      />
      <>
        <div className="w-full">
          <div className="w-full">
            <p className="text-muted-foreground text-base leading-tight">
              Intelligence whispered between family offices. Strategic briefings for generational decisions.
            </p>
          </div>
          <div className="w-full">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <CheckmateLoader size="lg" text="Loading your strategic playbooks..." />
              </div>
            ) : (
              <>
                {playbooks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={`text-base ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Your vault awaits its first strategic intelligence.</p>
                    <p className="text-muted-foreground text-sm mt-2">Curated insights below. Each playbook contains moves your competitors don't see.</p>
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
                        <p className="text-xs text-muted-foreground mt-2">
                          Valid until: {formatValidUntil(playbook.valid_until)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Store Section */}
          <div className="w-full">
            <div className="border-t border-border">
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Explore the Store</h3>
                <p className="text-muted-foreground text-base leading-tight">
                  Private intelligence from the inner circle. Strategic playbooks that shaped billion-dollar moves.
                </p>
              </div>

              {isLoadingStore ? (
                <div className="flex justify-center items-center h-64">
                  <CheckmateLoader size="lg" text="Loading strategic intelligence..." />
                </div>
              ) : (
                <>
                  {availablePlaybooks.length === 0 ? (
                    <div className="text-center py-8">
                      <p className={`text-base ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Your intelligence vault is complete.</p>
                      <p className="text-muted-foreground text-sm mt-2">New whispered strategies arriving from the inner circle soon.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availablePlaybooks.map((playbook) => (
                        <PremiumPlaybookCard
                          key={playbook.id}
                          playbook={playbook}
                          onClick={() => {}} // Not clickable since not purchased
                          onPurchase={() => handlePlaybookPurchase(playbook.id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </>
    </>
  )
}