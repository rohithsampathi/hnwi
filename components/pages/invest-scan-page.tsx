"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Layout } from "@/components/layout/layout"
import { RegionPanel } from "@/components/region-panel"
import { OpportunityList } from "@/components/opportunity-list"
import { regions } from "@/lib/invest-scan-data"
import { Heading2 } from "@/components/ui/typography"
import { DollarSign } from "lucide-react"

// Dynamically import the Globe component with SSR disabled
const InvestmentGlobe = dynamic(
  () => import("@/components/investment-globe"),
  { ssr: false }
)

export function InvestScanPage() {  // Removed onNavigate prop
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
  }
  
  const handleOpportunitySelect = (opportunityId: string) => {
    if (selectedRegion) {
      router.push(`/invest-scan/${selectedRegion}/${opportunityId}`)
    }
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