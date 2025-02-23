// components/world-map-invest-scan.tsx

"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heading3, Paragraph } from "@/components/ui/typography"
import { Building2, Briefcase, DollarSign, MapPin } from "lucide-react"
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps"
import { scaleLinear } from "d3-scale"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { regions } from "@/lib/invest-scan-data"
import Link from "next/link"

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json"

export function WorldMapInvestScan() {
  const { theme } = useTheme()
  const [selectedRegion, setSelectedRegion] = useState<(typeof regions)[0] | null>(null)
  const { toast } = useToast()

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case "Real Estate":
        return Building2
      case "Private Equity":
        return Briefcase
      case "Hospitality":
        return MapPin
      default:
        return DollarSign
    }
  }

  const colorScale = scaleLinear<string>()
    .domain([0, 2, 3])
    .range(["#FF5722", "#FFC107", "#4CAF50"])

  const handleTalkToConcierge = (opportunity: (typeof regions)[0]["opportunities"][0]) => {
    toast({
      title: "Concierge Notified",
      description: `Our concierge has been notified about your interest in ${opportunity.title}. They will contact you shortly.`,
      duration: 5000,
    })
  }

  return (
    <Card className="w-full bg-background text-foreground">
      <CardContent>
        <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-border">
          <ComposableMap projection="geoMercator">
            <ZoomableGroup center={[0, 20]} zoom={1}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={theme === "dark" ? "#2A2A2A" : "#DDD"}
                      stroke={theme === "dark" ? "#666" : "#FFF"}
                    />
                  ))
                }
              </Geographies>
              {regions.map((region) => (
                <Marker key={region.id} coordinates={region.position}>
                  <circle
                    r={10}
                    fill={colorScale(region.opportunities.length)}
                    stroke="#FFF"
                    strokeWidth={2}
                    onClick={() => setSelectedRegion(region)}
                    style={{ cursor: "pointer" }}
                  />
                  <text
                    textAnchor="middle"
                    y={-15}
                    style={{ 
                      fontFamily: "system-ui", 
                      fill: theme === "dark" ? "#fff" : "#000", 
                      fontSize: "14px" 
                    }}
                  >
                    {region.name}
                  </text>
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        </div>
        {selectedRegion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <Heading3 className="text-2xl font-bold mb-4">
              Opportunities in {selectedRegion.name}
            </Heading3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {selectedRegion.opportunities.map((opportunity) => {
                const Icon = getOpportunityIcon(opportunity.type)
                return (
                  <Card key={opportunity.id} className="bg-card text-card-foreground flex flex-col">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary">{opportunity.type}</Badge>
                        <Badge variant="outline">{opportunity.value}</Badge>
                      </div>
                      <Paragraph className="text-sm mb-4">{opportunity.description}</Paragraph>
                    </CardContent>
                    <CardFooter className="mt-auto">
                      <Link href={`/invest-scan/${selectedRegion.id}/${opportunity.id}`} passHref>
                        <Button variant="outline" className="w-full">
                          Read More
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}