"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Opportunity } from "@/lib/api";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onReadMore: () => void;
  showNewRibbon?: boolean;
}

export function OpportunityCard({ 
  opportunity, 
  onReadMore, 
  showNewRibbon = false 
}: OpportunityCardProps) {
  return (
    <Card className="bg-card flex flex-col relative">
      {/* New Ribbon */}
      {showNewRibbon && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-sm shadow-sm">
            New
          </div>
        </div>
      )}
      
      <CardContent className="p-6 flex-grow">
        <h3 className="text-lg font-semibold mb-2">
          {opportunity.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
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
        <div className="space-y-1 text-xs text-muted-foreground">
          {opportunity.expectedReturn && (
            <p>
              Expected Return:{" "}
              <span className="font-medium text-foreground">
                {opportunity.expectedReturn}
              </span>
            </p>
          )}
          {opportunity.investmentHorizon && (
            <p>
              Investment Horizon:{" "}
              <span className="font-medium text-foreground">
                {opportunity.investmentHorizon}
              </span>
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0">
        <Button
          className="w-full"
          variant="default"
          onClick={onReadMore}
        >
          Read More
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper function to determine if an opportunity is new (within 7 days)
export function isOpportunityNew(opportunity: Opportunity): boolean {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const startDate = new Date(opportunity.start_date);
  return startDate >= sevenDaysAgo;
}