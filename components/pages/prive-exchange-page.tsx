// components/pages/prive-exchange-page.tsx

// components/pages/prive-exchange-page.tsx

"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  Globe2,
  Building2,
  LandPlot,
  Mountain,
  Palmtree,
  Factory
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getOpportunities, Opportunity } from "@/lib/api"  // no placeholders
import { Heading2 } from "@/components/ui/typography"
import { LiveButton } from "@/components/live-button"

interface PriveExchangePageProps {
  onNavigate?: (route: string) => void
}

// Optional: Map region names to icons
const regionIconMap = {
  "North America": { icon: Building2, id: "na" },
  "Europe": { icon: Factory, id: "eu" },
  "Asia Pacific": { icon: Mountain, id: "ap" },
  "South America": { icon: LandPlot, id: "sa" },
  "Middle East": { icon: Palmtree, id: "me" },
  "Global": { icon: Globe2, id: "global" }
}

export function PriveExchangePage({ onNavigate }: PriveExchangePageProps) {
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all opportunities on mount
  useEffect(() => {
    async function loadOpportunities() {
      try {
        setLoading(true)
        const data = await getOpportunities()
        setOpportunities(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch opportunities:", err)
        setError("Failed to load investment opportunities")
      } finally {
        setLoading(false)
      }
    }
    loadOpportunities()
  }, [])

  // Group by region from the live data
  const regions = opportunities.reduce((acc, opp) => {
    const region = opp.region || "Unknown"
    if (!acc[region]) {
      acc[region] = []
    }
    acc[region].push(opp)
    return acc
  }, {} as Record<string, Opportunity[]>)

  // Region counts
  const regionCounts: Record<string, number> = {}
  for (const region of Object.keys(regions)) {
    regionCounts[region] = regions[region].length
  }

  // Unified navigation handler for all routes
  const handleNavigation = (path: string) => {
    // IMPORTANT: Always use onNavigate when available for all routes
    // This ensures proper handling by the app's navigation system
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    
    // Only as a fallback when onNavigate is not provided (direct access via URL)
    if (path === "back") {
      // Always go to dashboard when back is clicked
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("skipSplash", "true");
      }
      router.push("/");
    } else {
      // For all other routes, prefer the app's global navigation handler
      if (typeof window !== 'undefined' && window.handleGlobalNavigation) {
        window.handleGlobalNavigation(path);
      } else {
        // Last resort direct navigation - should rarely be used
        // Set skipSplash to ensure we don't show splash when going to dashboard
        if (path === "dashboard") {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem("skipSplash", "true");
          }
          router.push("/");
        } else {
          try {
            router.push(`/${path.replace(/^\/+/, "")}`);
          } catch (e) {
            console.error("Navigation failed:", e);
            // If navigation fails, go back to dashboard
            if (typeof window !== 'undefined') {
              sessionStorage.setItem("skipSplash", "true");
            }
            router.push("/");
          }
        }
      }
    }
  }

  // When user selects a region, store it
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
  }

  // Filter for current region
  const filteredOpportunities = selectedRegion ? regions[selectedRegion] || [] : []

  // If loading
  if (loading) {
    return (
      <Layout 
        title={
          <div className="flex items-center gap-2">
            <span>Privé Exchange</span>
            <Badge className="bg-primary">Beta</Badge>
          </div>
        } 
        showBackButton 
        onNavigate={handleNavigation}>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout 
        title={
          <div className="flex items-center gap-2">
            <span>Privé Exchange</span>
            <Badge className="bg-primary">Beta</Badge>
          </div>
        } 
        showBackButton 
        onNavigate={handleNavigation}>
        <div className="text-center p-8">
          <h3 className="text-xl font-medium text-red-500 mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Layout>
    )
  }

  // If no region is selected, show region tiles
  const regionNames = Object.keys(regions)

  return (
    <Layout 
      title={
        <div className="flex items-center gap-2">
          <span>Privé Exchange</span>
          <Badge className="bg-primary">Beta</Badge>
          <LiveButton />
        </div>
      } 
      showBackButton 
      onNavigate={handleNavigation}>
      <div className="flex flex-col h-full">
        <div className="space-y-2 px-4 py-6">
          <div className="flex items-center gap-2">
            <Heading2 className="text-primary">Privé Exchange</Heading2>
            <Badge className="bg-primary">Beta</Badge>
            <LiveButton />
          </div>
          <p className="font-body tracking-wide text-xl text-muted-foreground">
            Exclusive opportunities for elite investors
          </p>
        </div>
        <div className="flex-grow">
          {/* Region selection if none selected */}
          {!selectedRegion && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {regionNames.map((region) => {
                const count = regionCounts[region] || 0
                const { icon: Icon, id } = regionIconMap[region as keyof typeof regionIconMap] ||
                  { icon: Globe2, id: region.toLowerCase().replace(/\s+/g, "-") }
                const isSelected = selectedRegion === region

                return (
                  <motion.div
                    key={region}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? "ring-2 ring-primary shadow-lg bg-primary/5"
                          : "hover:shadow-md hover:bg-accent/5"
                      }`}
                      onClick={() => handleRegionSelect(region)}
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Icon
                          className={`w-12 h-12 mb-3 ${
                            isSelected ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <h3
                          className={`font-medium text-sm mb-2 ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {region}
                        </h3>
                        <Badge
                          variant={isSelected ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {count} Opportunities
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* If region is selected, show that region’s opportunities */}
          {selectedRegion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              <div className="flex items-center mb-6">
                <Button
                  variant="ghost"
                  className="mr-4"
                  onClick={() => setSelectedRegion(null)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Regions
                </Button>
                <h2 className="text-2xl font-semibold">
                  {selectedRegion} Opportunities
                </h2>
              </div>
              
              {filteredOpportunities.length === 0 ? (
                <div className="text-center p-6 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">
                    No opportunities available in this region yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredOpportunities.map((opportunity) => (
                    <Card key={opportunity.id} className="bg-card flex flex-col">
                      <CardContent className="p-6 flex-grow">
                        <h3 className="text-lg font-semibold mb-2">
                          {opportunity.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {opportunity.description}
                        </p>
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          {opportunity.type && (
                            <Badge variant="outline">{opportunity.type}</Badge>
                          )}
                          {opportunity.value && <Badge>{opportunity.value}</Badge>}
                          {opportunity.riskLevel && (
                            <Badge variant="secondary">
                              {opportunity.riskLevel} Risk
                            </Badge>
                          )}
                        </div>
                        {opportunity.expectedReturn && (
                          <p className="text-xs text-muted-foreground">
                            Expected Return:{" "}
                            <span className="font-medium text-foreground">
                              {opportunity.expectedReturn}
                            </span>
                          </p>
                        )}
                      </CardContent>
                      <CardFooter className="px-6 pb-6 pt-0">
                        <Button
                          className="w-full"
                          variant="default"
                          onClick={() => router.push(`/opportunity/${opportunity.id}`)}
                        >
                          Read More
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  )
}
