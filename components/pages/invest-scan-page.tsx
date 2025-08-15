"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Layout } from "@/components/layout/layout"
import { RegionPanel } from "@/components/region-panel"
import { OpportunityList } from "@/components/opportunity-list"
import { Heading2 } from "@/components/ui/typography"
import { DollarSign, Loader2 } from "lucide-react"
import { CrownLoader } from "@/components/ui/crown-loader"
import { getOpportunities, Opportunity } from "@/lib/api"

// Dynamically import the Globe component with SSR disabled
const InvestmentGlobe = dynamic(
  () => import("@/components/investment-globe"),
  { ssr: false }
)

// Transform API data into the format needed by the globe component
interface RegionData {
  id: string;
  name: string;
  position: [number, number];
  opportunities: Opportunity[];
}

// Map region names to region IDs and coordinates
const regionMap: Record<string, { id: string; position: [number, number] }> = {
  "North America": { id: "na", position: [-100, 40] },
  "Europe": { id: "eu", position: [15, 50] },
  "Asia Pacific": { id: "ap", position: [100, 20] },
  "South America": { id: "sa", position: [-60, -20] },
  "Middle East": { id: "me", position: [45, 25] },
  "Global": { id: "global", position: [0, 0] }
};

export function InvestScanPage() {
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
        const data = await getOpportunities()
        setOpportunities(data)
        
        // Group opportunities by region
        const regionGroups = data.reduce((acc, opp) => {
          const region = opp.region
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
          
          return {
            id: regionInfo.id,
            name: regionName,
            position: regionInfo.position,
            opportunities: regionGroups[regionName]
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
      <Layout
        title={
          <div className="flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-primary" />
            <Heading2>Invest Scan</Heading2>
          </div>
        }
        showBackButton
      >
        <div className="flex items-center justify-center h-[50vh]">
          <CrownLoader size="lg" text="Accessing private deal flow..." />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout
        title={
          <div className="flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-primary" />
            <Heading2>Invest Scan</Heading2>
          </div>
        }
        showBackButton
      >
        <div className="text-center p-8">
          <h3 className="text-xl font-medium text-red-500 mb-2">Intelligence Access Unavailable</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title={
        <div className="flex items-center space-x-2">
          <DollarSign className="w-6 h-6 text-primary" />
          <Heading2>Invest Scan</Heading2>
        </div>
      }
      showBackButton
    >
      <div className="space-y-8">
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
    </Layout>
  )
}