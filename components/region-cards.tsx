"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe2,
  Building2,
  LandPlot,
  Mountain,
  Palmtree,
  Factory
} from "lucide-react";
import { AssetCategoryData } from "@/lib/opportunity-atlas-data";

export interface RegionData {
  id: string;
  name: string;
  opportunityCount: number;
}

interface RegionCardsProps {
  selectedCategory: AssetCategoryData | null;
  regions: RegionData[];
  onRegionSelect: (regionId: string) => void;
  className?: string;
}

const regionIconMap = {
  "North America": { icon: Building2, id: "na" },
  "Europe": { icon: Factory, id: "eu" },
  "Asia Pacific": { icon: Mountain, id: "ap" },
  "South America": { icon: LandPlot, id: "sa" },
  "Middle East & Africa": { icon: Palmtree, id: "mea" },
  "Global": { icon: Globe2, id: "global" }
};

export function RegionCards({ 
  selectedCategory, 
  regions, 
  onRegionSelect, 
  className = "" 
}: RegionCardsProps) {
  if (!selectedCategory) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-2 ${className}`}
    >
      {/* Horizontal scrollable region selectors */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {regions.map((region) => {
          const { icon: Icon } = regionIconMap[region.name as keyof typeof regionIconMap] || 
            { icon: Globe2 };
          const hasOpportunities = region.opportunityCount > 0;
          
          return (
            <motion.div
              key={region.id}
              whileHover={hasOpportunities ? { scale: 1.02 } : undefined}
              whileTap={hasOpportunities ? { scale: 0.98 } : undefined}
              className="flex-shrink-0"
            >
              <Card
                className={`
                  h-10 min-w-max transition-all duration-300 cursor-pointer
                  ${hasOpportunities 
                    ? "bg-primary/5 hover:bg-primary/10 hover:shadow-md border-primary/20" 
                    : "bg-muted/30 border-muted cursor-not-allowed opacity-60"
                  }
                `}
                onClick={() => hasOpportunities && onRegionSelect(region.id)}
                role="button"
                tabIndex={hasOpportunities ? 0 : -1}
                aria-label={`${region.name} region with ${region.opportunityCount} opportunities`}
                aria-disabled={!hasOpportunities}
                onKeyDown={(e) => {
                  if (hasOpportunities && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRegionSelect(region.id);
                  }
                }}
              >
                <CardContent className="px-3 py-2 flex items-center gap-2 h-full">
                  <Icon
                    className={`w-4 h-4 ${
                      hasOpportunities ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${
                      hasOpportunities ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {region.name}
                    </span>
                    <Badge
                      variant={hasOpportunities ? "default" : "secondary"}
                      className="text-xs px-1.5 py-0"
                    >
                      {region.opportunityCount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* No opportunities message */}
      {regions.every(region => region.opportunityCount === 0) && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No opportunities available for {selectedCategory.name} at the moment.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            New deals are added regularly. Check back soon.
          </p>
        </div>
      )}
    </motion.div>
  );
}