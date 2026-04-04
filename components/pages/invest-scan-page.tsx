"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { RegionPanel } from "@/components/region-panel"
import { OpportunityList } from "@/components/opportunity-list"
import { Heading2 } from "@/components/ui/typography"
import { PageHeaderWithBack } from "@/components/ui/back-button"
import { DollarSign, Loader2 } from "lucide-react"
import { CrownLoader } from "@/components/ui/crown-loader"
import { getCommandCentreOpportunities, Opportunity } from "@/lib/api"
import type { Opportunity as GlobeOpportunity, Region as GlobeRegion } from "@/lib/invest-scan-data"

// Dynamically import the Globe component with SSR disabled
const InvestmentGlobe = dynamic<{ regions: GlobeRegion[]; onRegionSelect: (regionId: string) => void }>(
  () => import("@/components/investment-globe").then((module) => module.InvestmentGlobe),
  { ssr: false }
)

// Transform API data into the format needed by the globe component
type RegionData = GlobeRegion

// Map region names to region IDs and coordinates
const regionMap: Record<string, { id: string; position: [number, number] }> = {
  "North America": { id: "na", position: [-100, 40] },
  "Europe": { id: "eu", position: [15, 50] },
  "Asia Pacific": { id: "ap", position: [100, 20] },
  "South America": { id: "sa", position: [-60, -20] },
  "Middle East": { id: "me", position: [45, 25] },
  "Global": { id: "global", position: [0, 0] }
};

export function InvestScanPage({ onNavigate }: { onNavigate?: (route: string) => void } = {}) {
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regions, setRegions] = useState<RegionData[]>([])
  
  // Fetch all opportunities on component mount
  useEffect(() => {
    async function loadOpportunities() {
      try {
        setLoading(true)
        const data = await getCommandCentreOpportunities({
          includeCrownVault: false,
          view: "all",
          timeframe: "LIVE",
        })
        setOpportunities(data)
        
        // Group opportunities by region
        const regionGroups = data.reduce((acc, opp) => {
          const region = opp.region || opp.country || "Global"
          if (!acc[region]) {
            acc[region] = []
          }
          acc[region].push(opp)
          return acc
        }, {} as Record<string, Opportunity[]>)
        
        // Transform into regions array
        const formattedRegions = Object.keys(regionGroups).map(regionName => {
          const regionInfo = regionMap[regionName] || { 
            id: regionName.toLowerCase().replace(/\s+/g, '-'),
            position: [0, 0] // Default position if region not in map
          }
          
          const regionOpportunities: GlobeOpportunity[] = regionGroups[regionName].map((opportunity) => ({
            id: opportunity.id,
            title: opportunity.title,
            type: opportunity.type || opportunity.asset_category || "Opportunity",
            value: opportunity.value || opportunity.minimum_investment_display || "Confidential",
            description: opportunity.description || opportunity.subtitle || "",
            fullAnalysis: opportunity.fullAnalysis || opportunity.investment_thesis?.what_youre_buying || "",
            riskLevel: (opportunity.riskLevel as GlobeOpportunity["riskLevel"]) || opportunity.risk_level || "Medium",
            expectedReturn: opportunity.expectedReturn || (
              opportunity.expected_return_annual_low && opportunity.expected_return_annual_high
                ? `${opportunity.expected_return_annual_low}-${opportunity.expected_return_annual_high}%`
                : opportunity.expected_return_annual_low
                  ? `${opportunity.expected_return_annual_low}%`
                  : "Confidential"
            ),
            investmentHorizon: opportunity.investmentHorizon || opportunity.time_horizon_display?.time_horizon || "Medium-term",
            pros: opportunity.pros || [],
            cons: opportunity.cons || [],
          }))

          return {
            id: regionInfo.id,
            name: regionName,
            position: regionInfo.position,
            opportunities: regionOpportunities
          }
        })
        
        setRegions(formattedRegions)
        setError(null)
      } catch (err) {
        setError("Failed to load investment opportunities")
      } finally {
        setLoading(false)
      }
    }

    loadOpportunities()
  }, [])
  
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
  }
  
  const handleOpportunitySelect = (opportunityId: string) => {
    if (selectedRegion) {
      router.push(`/opportunity/${opportunityId}`)
    }
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-[50vh]">
          <CrownLoader size="lg" text="Accessing private deal flow..." />
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="text-center">
          <h3 className="text-xl font-medium text-red-500 mb-2">Intelligence Access Unavailable</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="w-full">
        <InvestmentGlobe regions={regions} onRegionSelect={handleRegionSelect} />
        <RegionPanel 
          regions={regions} 
          selectedRegion={selectedRegion} 
          onRegionSelect={handleRegionSelect} 
        />
        {selectedRegion && (
          <OpportunityList
            opportunities={regions.find((r) => r.id === selectedRegion)?.opportunities || []}
            onOpportunitySelect={handleOpportunitySelect}
          />
        )}
      </div>
    </>
  )
}
