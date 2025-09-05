// components/intelligence/opportunity-tiers.tsx
// Three-Tier Opportunity Explorer - $100K / $500K / $1M+ Investment Tiers

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Target,
  DollarSign,
  Clock,
  Shield,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  CheckCircle,
  Eye
} from "lucide-react"
import { 
  parseRuschaIntelligence, 
  type ParsedIntelligence, 
  type OpportunityTier,
  getOpportunityColor,
  formatCapital,
  getTierName
} from "@/lib/intelligence-parser"

interface OpportunityTiersProps {
  intelligence: any
  onOpportunitySelect?: (opportunity: OpportunityTier) => void
  className?: string
}

export function OpportunityTiers({ intelligence, onOpportunitySelect, className }: OpportunityTiersProps) {
  const [parsedData, setParsedData] = useState<ParsedIntelligence | null>(null)
  const [selectedTier, setSelectedTier] = useState<'1' | '2' | '3'>('1')
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityTier | null>(null)

  useEffect(() => {
    console.log('🎯 OpportunityTiers: Intelligence received:', {
      hasIntelligence: !!intelligence,
      hasOpportunityAlignment: !!intelligence?.opportunity_alignment,
      hasVictorAnalysis: !!intelligence?.opportunity_alignment?.victor_analysis,
      opportunitiesCount: intelligence?.opportunity_alignment?.victor_analysis?.analyzed_opportunities?.length || 0
    })
    
    // Use actual JSON structure from backend
    if (intelligence?.opportunity_alignment?.victor_analysis?.analyzed_opportunities) {
      const opportunities = intelligence.opportunity_alignment.victor_analysis.analyzed_opportunities
      
      console.log('🎯 OpportunityTiers: Processing opportunities:', opportunities.length)
      
      const structuredOpportunities = opportunities.map((opp: any, index: number) => {
        // Parse capital requirement from value field
        const valueNum = parseFloat(opp.value?.replace(/[$,]/g, '')) || 100000
        
        // Assign tier based on victor_rating and value
        let tier: 1 | 2 | 3 = 2 // default to tier 2
        if (opp.victor_rating === 'juicy') tier = 1
        else if (opp.victor_rating === 'far_fetched' || valueNum > 500000) tier = 3
        else if (opp.victor_rating === 'moderate') tier = 2
        
        return {
          tier,
          title: opp.title || `Strategic Opportunity ${index + 1}`,
          capital: {
            min: Math.max(valueNum * 0.8, 75000),
            max: valueNum * 1.2,
            display: opp.value || '$100K-$500K'
          },
          riskRating: (opp.riskLevel as 'Low' | 'Medium' | 'High') || 'Medium',
          timeline: opp.investmentHorizon || '3-6 months',
          implementation: [
            opp.victor_reasoning || 'Strategic implementation required',
            ...(opp.pros?.slice(0, 2) || ['Detailed execution plan available'])
          ],
          juiciness: (opp.victor_rating?.toUpperCase() as 'JUICY' | 'MODERATE' | 'FAR-FETCHED') || 'MODERATE',
          description: opp.description || opp.fullAnalysis || 
            'Comprehensive market analysis reveals significant potential'
        }
      })
      
      const structuredParsed: ParsedIntelligence = {
        executiveSummary: 'Strategic opportunities identified based on current market analysis and Victor AI alignment scoring',
        opportunities: structuredOpportunities,
        timingWindows: opportunities
          .filter((opp: any) => opp.victor_action === 'BUY' || opp.victor_action === 'HOLD')
          .map((opp: any) => ({
            opportunity: opp.title || "Market Window",
            urgency: opp.victor_rating === 'juicy' ? 'urgent' :
                    opp.victor_rating === 'moderate' ? 'medium' : 'strategic',
            duration: opp.investmentHorizon || "Strategic timeline"
          })),
        marketAssessment: {
          juicy: opportunities.filter((o: any) => o.victor_rating === 'juicy').map((o: any) => o.title),
          moderate: opportunities.filter((o: any) => o.victor_rating === 'moderate').map((o: any) => o.title),
          farFetched: opportunities.filter((o: any) => o.victor_rating === 'far_fetched').map((o: any) => o.title)
        },
        confidence: intelligence?.ruscha_intelligence?.confidence || 0.87,
        generatedAt: new Date().toISOString(),
        expertsAnalyzed: 6,
        hoursInvested: '120+ hours',
        wealthMigration: null
      }
      
      console.log('🎯 OpportunityTiers: Structured opportunities created:', structuredOpportunities.length)
      setParsedData(structuredParsed)
    }
  }, [intelligence])

  if (!parsedData || parsedData.opportunities.length === 0) {
    return (
      <Card className={`border-border/40 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Target className="h-5 w-5 animate-pulse" />
            <span>Loading opportunity intelligence...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const tier1Opportunities = parsedData.opportunities.filter(opp => opp.tier === 1)
  const tier2Opportunities = parsedData.opportunities.filter(opp => opp.tier === 2)
  const tier3Opportunities = parsedData.opportunities.filter(opp => opp.tier === 3)

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low': return <Shield className="h-4 w-4 text-green-600" />
      case 'Medium': return <AlertCircle className="h-4 w-4 text-amber-600" />
      case 'High': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Shield className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleOpportunityClick = (opportunity: OpportunityTier) => {
    setSelectedOpportunity(opportunity)
    onOpportunitySelect?.(opportunity)
  }

  const OpportunityCard = ({ opportunity, isSelected }: { opportunity: OpportunityTier; isSelected: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => handleOpportunityClick(opportunity)}
    >
      <Card className={`border-2 ${isSelected ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getOpportunityColor(opportunity.juiciness)}>
                  {opportunity.juiciness}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {opportunity.riskRating} Risk
                </Badge>
              </div>
              <h4 className="text-lg font-semibold leading-tight">
                {opportunity.title}
              </h4>
            </div>
            <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isSelected ? 'rotate-90' : ''}`} />
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Capital</div>
                  <div className="font-semibold text-sm">
                    {formatCapital(opportunity.capital)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Timeline</div>
                  <div className="font-semibold text-sm">
                    {opportunity.timeline || 'TBD'}
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Efficiency */}
            {opportunity.taxEfficiency && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-xs text-green-700 dark:text-green-400">Tax Efficiency</div>
                    <div className="font-semibold text-sm text-green-600">
                      {opportunity.taxEfficiency}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Implementation Preview */}
            {opportunity.implementation.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Implementation</div>
                <div className="space-y-1">
                  {opportunity.implementation.slice(0, 2).map((step, index) => (
                    <div key={index} className="flex items-start space-x-2 text-xs">
                      <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{step}</span>
                    </div>
                  ))}
                  {opportunity.implementation.length > 2 && (
                    <div className="text-xs text-primary">
                      +{opportunity.implementation.length - 2} more steps
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Professional Note */}
            {opportunity.professionalNote && (
              <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  ⚠️ {opportunity.professionalNote}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={(e) => {
                e.stopPropagation()
                handleOpportunityClick(opportunity)
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Full Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Three-Tier Header */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Target className="h-6 w-6 mr-3 text-primary" />
                Investment Opportunities
              </h2>
              <p className="text-muted-foreground mt-1">
                Three-tier capital deployment framework
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Total Opportunities: {parsedData.opportunities.length}</div>
              <div className="flex items-center space-x-1 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{parsedData.opportunities.filter(o => o.juiciness === 'JUICY').length} JUICY</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tier Tabs */}
      <Tabs value={selectedTier} onValueChange={(value) => setSelectedTier(value as '1' | '2' | '3')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="1" className="text-sm">
            <DollarSign className="h-4 w-4 mr-1" />
            $100K
            <Badge variant="secondary" className="ml-2 text-xs">
              {tier1Opportunities.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="2" className="text-sm">
            <DollarSign className="h-4 w-4 mr-1" />
            $500K
            <Badge variant="secondary" className="ml-2 text-xs">
              {tier2Opportunities.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="3" className="text-sm">
            <DollarSign className="h-4 w-4 mr-1" />
            $1M+
            <Badge variant="secondary" className="ml-2 text-xs">
              {tier3Opportunities.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="1" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-lg font-semibold">{getTierName(1)}</h3>
              <Badge variant="outline">
                {tier1Opportunities.length} Available
              </Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tier1Opportunities.map((opportunity, index) => (
                <OpportunityCard 
                  key={index} 
                  opportunity={opportunity} 
                  isSelected={selectedOpportunity?.title === opportunity.title}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="2" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-lg font-semibold">{getTierName(2)}</h3>
              <Badge variant="outline">
                {tier2Opportunities.length} Available
              </Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tier2Opportunities.map((opportunity, index) => (
                <OpportunityCard 
                  key={index} 
                  opportunity={opportunity} 
                  isSelected={selectedOpportunity?.title === opportunity.title}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="3" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-lg font-semibold">{getTierName(3)}</h3>
              <Badge variant="outline">
                {tier3Opportunities.length} Available
              </Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tier3Opportunities.map((opportunity, index) => (
                <OpportunityCard 
                  key={index} 
                  opportunity={opportunity} 
                  isSelected={selectedOpportunity?.title === opportunity.title}
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Opportunity Details */}
      {selectedOpportunity && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                  Implementation Roadmap
                </h3>
                <Badge className={getOpportunityColor(selectedOpportunity.juiciness)}>
                  {selectedOpportunity.juiciness}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">{selectedOpportunity.title}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <div className="text-lg font-bold text-primary">
                        {formatCapital(selectedOpportunity.capital)}
                      </div>
                      <div className="text-xs text-muted-foreground">Capital Required</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <div className="flex items-center justify-center space-x-1">
                        {getRiskIcon(selectedOpportunity.riskRating)}
                        <span className="text-lg font-bold">
                          {selectedOpportunity.riskRating}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">Risk Level</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <div className="text-lg font-bold text-amber-600">
                        {selectedOpportunity.timeline || 'TBD'}
                      </div>
                      <div className="text-xs text-muted-foreground">Timeline</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {selectedOpportunity.taxEfficiency || 'Variable'}
                      </div>
                      <div className="text-xs text-muted-foreground">Tax Benefit</div>
                    </div>
                  </div>
                </div>

                {selectedOpportunity.implementation.length > 0 && (
                  <div>
                    <h5 className="font-semibold mb-3">Implementation Steps</h5>
                    <div className="space-y-2">
                      {selectedOpportunity.implementation.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mt-0.5">
                            {index + 1}
                          </div>
                          <div className="flex-1 text-sm">{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}