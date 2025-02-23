// components/pages/prive-exchange-page.tsx

"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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
import { regions } from "@/lib/invest-scan-data"
import { Badge } from "@/components/ui/badge"

interface PriveExchangePageProps {
  onNavigate: (route: string) => void
}

const regionIcons = {
  na: { icon: Building2, label: "North America" },
  eu: { icon: Factory, label: "Europe" },
  ap: { icon: Mountain, label: "Asia Pacific" },
  sa: { icon: LandPlot, label: "South America" },
  me: { icon: Palmtree, label: "Middle East" },
  global: { icon: Globe2, label: "Global" }
} as const

export function PriveExchangePage({ onNavigate }: PriveExchangePageProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const router = useRouter()

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
  }

  const handleNavigate = (route: string) => {
    if (route === "back") {
      setSelectedRegion(null)
    } else {
      router.push(route)
    }
  }

  // Group opportunities by region
  const regionCounts = regions.reduce((acc, region) => {
    acc[region.id] = region.opportunities.length
    return acc
  }, {} as Record<string, number>)

  return (
    <Layout title="Privé Exchange" onNavigate={onNavigate}>
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(regionIcons).map(([regionId, { icon: Icon, label }]) => {
              const count = regionCounts[regionId] || 0
              const isSelected = selectedRegion === regionId

              return (
                <motion.div
                  key={regionId}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? "ring-2 ring-primary shadow-lg bg-primary/5" 
                        : "hover:shadow-md hover:bg-accent/5"
                    }`}
                    onClick={() => handleRegionSelect(regionId)}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <Icon 
                        className={`w-12 h-12 mb-3 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`} 
                      />
                      <h3 className={`font-medium text-sm mb-2 ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}>
                        {label}
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
                  {regionIcons[selectedRegion as keyof typeof regionIcons].label} Opportunities
                </h2>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regions
                  .find(r => r.id === selectedRegion)
                  ?.opportunities.map((opportunity) => (
                    <Card key={opportunity.id} className="bg-card flex flex-col">
                      <CardContent className="p-6 flex-grow">
                        <h3 className="text-lg font-semibold mb-2">{opportunity.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {opportunity.description}
                        </p>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline">{opportunity.type}</Badge>
                          <Badge>{opportunity.value}</Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="px-6 pb-6 pt-0">
                        <Button 
                          className="w-full" 
                          variant="default"
                          onClick={() => router.push(`/invest-scan/${selectedRegion}/${opportunity.id}`)}
                        >
                          Read More
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  )
}