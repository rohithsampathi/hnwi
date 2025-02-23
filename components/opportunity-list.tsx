"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Paragraph } from "@/components/ui/typography"
import { getOpportunityIcon } from "@/lib/invest-scan-data"
import type { Opportunity } from "@/lib/invest-scan-data"

interface OpportunityListProps {
  opportunities: Opportunity[]
  onOpportunitySelect: (opportunityId: string) => void
}

export function OpportunityList({ opportunities, onOpportunitySelect }: OpportunityListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {opportunities.map((opportunity) => {
        const Icon = getOpportunityIcon(opportunity.type)
        return (
          <Card key={opportunity.id} className="bg-card text-card-foreground">
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
              <Button variant="outline" onClick={() => onOpportunitySelect(opportunity.id)}>
                View Details
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

