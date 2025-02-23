// components/region-panel.tsx

"use client"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import type { Region } from "@/lib/invest-scan-data"
import { Badge } from "@/components/ui/badge"
import { Crown, MapPin, Building2, Briefcase } from "lucide-react"

interface RegionPanelProps {
  regions: Region[]
  selectedRegion: string | null
  onRegionSelect: (region: string) => void
}

const regionIcons = {
  na: Building2,
  eu: Briefcase,
  ap: Crown,
  sa: MapPin,
  me: MapPin,
} as const

export function RegionPanel({ regions, selectedRegion, onRegionSelect }: RegionPanelProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {regions.map((region) => {
        const isSelected = selectedRegion === region.id
        const Icon = regionIcons[region.id as keyof typeof regionIcons] || MapPin
        
        return (
          <motion.div 
            key={region.id} 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-300 ${
                isSelected 
                  ? "ring-2 ring-primary shadow-lg bg-primary/5" 
                  : "hover:shadow-md hover:bg-accent/5"
              }`}
              onClick={() => onRegionSelect(region.id)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <Icon
                    className={`w-16 h-16 ${
                      isSelected ? "text-primary" : "text-muted-foreground"
                    } transition-colors`}
                  />
                  <h3 className={`font-bold text-lg ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}>
                    {region.name}
                  </h3>
                  <Badge 
                    variant={isSelected ? "default" : "secondary"} 
                    className="text-xs font-medium"
                  >
                    {region.opportunities.length} Opportunities
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}