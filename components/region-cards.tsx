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
      className={`space-y-4 ${className}`}
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {selectedCategory.name} Opportunities by Region
        </h3>
        <p className="text-sm text-muted-foreground">
          Select a region to view available investment opportunities
        </p>
      </div>
      
      {/* Desktop: Single row - center aligned */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-2 justify-center">
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
                  w-32 h-32 transition-all duration-300 cursor-pointer
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
                <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
                  <Icon
                    className={`w-8 h-8 mb-2 ${
                      hasOpportunities ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <h4
                    className={`font-medium text-xs mb-2 ${
                      hasOpportunities ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {region.name}
                  </h4>
                  <Badge
                    variant={hasOpportunities ? "default" : "secondary"}
                    className="text-xs px-2 py-0.5"
                  >
                    {region.opportunityCount}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Mobile: Two rows - center aligned */}
      <div className="md:hidden grid grid-cols-3 gap-3 justify-items-center">
        {regions.map((region) => {
          const { icon: Icon } = regionIconMap[region.name as keyof typeof regionIconMap] || 
            { icon: Globe2 };
          const hasOpportunities = region.opportunityCount > 0;
          
          return (
            <motion.div
              key={region.id}
              whileHover={hasOpportunities ? { scale: 1.02 } : undefined}
              whileTap={hasOpportunities ? { scale: 0.98 } : undefined}
            >
              <Card
                className={`
                  h-24 transition-all duration-300 cursor-pointer
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
                <CardContent className="p-2 flex flex-col items-center justify-center text-center h-full">
                  <Icon
                    className={`w-6 h-6 mb-1 ${
                      hasOpportunities ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <h4
                    className={`font-medium text-xs mb-1 ${
                      hasOpportunities ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {region.name.split(" ")[0]}
                  </h4>
                  <Badge
                    variant={hasOpportunities ? "default" : "secondary"}
                    className="text-xs px-1 py-0"
                  >
                    {region.opportunityCount}
                  </Badge>
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