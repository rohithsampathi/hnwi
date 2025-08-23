// components/pages/region-page.tsx

"use client"

import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heading2, Paragraph } from "@/components/ui/typography"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Building2, Briefcase, DollarSign, ChevronRight } from "lucide-react"
import { regions } from "@/lib/invest-scan-data"

interface RegionPageProps {
  region: string
}

export function RegionPage({ region }: RegionPageProps) {
  const router = useRouter()

  const regionData = regions.find((r) => r.id === region)

  if (!regionData) {
    return <div>Region not found</div>
  }

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case "Real Estate":
        return Building2
      case "Private Equity":
        return Briefcase
      default:
        return DollarSign
    }
  }

  return (
    <Layout
      currentPage="invest-scan"
      title={
        <div className="flex items-center space-x-2">
          <DollarSign className="w-6 h-6 text-primary" />
          <Heading2>Invest Scan: {regionData.name}</Heading2>
        </div>
      }
      showBackButton
      onNavigate={() => router.push("/invest-scan")}
    >
      <Card className="w-full bg-background text-foreground">
        <CardHeader>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Invest Scan</span>
            <ChevronRight className="w-4 h-4" />
            <span>{regionData.name}</span>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Investment Opportunities in {regionData.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regionData.opportunities.map((opportunity) => {
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Read Full Analysis</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>{opportunity.title} - Full Analysis</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <Paragraph>{opportunity.fullAnalysis}</Paragraph>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </Layout>
  )
}

