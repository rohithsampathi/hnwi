// lib/intelligence-parser.ts
// Intelligence Parser for MoE v4 Presidential Brief
// Parses Ruscha-style intelligence markdown into structured data

export interface OpportunityTier {
  tier: 1 | 2 | 3
  title: string
  capital: {
    min: number
    max: number
    display: string
  }
  riskRating: 'Low' | 'Medium' | 'High'
  timeline: string
  taxEfficiency?: string
  professionalNote?: string
  implementation: string[]
  juiciness: 'JUICY' | 'MODERATE' | 'FAR-FETCHED'
  minimumNetWorth?: string
  description?: string
}

export interface TimingWindow {
  duration: string
  opportunity: string
  urgency: 'urgent' | 'medium' | 'strategic'
}

export interface WealthMigration {
  volume: string
  from: string
  to: string
  confidence?: number
}

export interface ParsedIntelligence {
  executiveSummary: string
  opportunities: OpportunityTier[]
  timingWindows: TimingWindow[]
  wealthMigration?: WealthMigration
  marketAssessment: {
    juicy: string[]
    moderate: string[]
    farFetched: string[]
  }
  confidence: number
  generatedAt: string
  expertsAnalyzed: number
  hoursInvested: string
}

export function parseRuschaIntelligence(data: string, metadata?: any): ParsedIntelligence {
  
  const lines = data.split('\n').filter(line => line.trim());
  
  let executiveSummary = ''
  const opportunities: OpportunityTier[] = []
  const timingWindows: TimingWindow[] = []
  let wealthMigration: WealthMigration | undefined
  const marketAssessment = { juicy: [] as string[], moderate: [] as string[], farFetched: [] as string[] }
  
  let currentSection = ''
  let currentTier: 1 | 2 | 3 | null = null
  let currentOpportunity: Partial<OpportunityTier> | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip markdown headers and empty lines
    if (line.startsWith('**') && line.endsWith('**')) {
      currentSection = line.replace(/\*\*/g, '').toUpperCase()
      continue
    }
    
    // Extract executive summary
    if (currentSection.includes('EXECUTIVE') && line && !line.includes('$')) {
      if (!executiveSummary && line.length > 50) {
        executiveSummary = line
      }
    }
    
    // Extract wealth migration
    if (line.includes('$') && line.includes('B') && line.includes('migration')) {
      const volumeMatch = line.match(/\$[\d.]+B/)
      if (volumeMatch) {
        wealthMigration = {
          volume: volumeMatch[0] + ' tracked wealth migration',
          from: 'Traditional assets',
          to: 'Emerging opportunities'
        }
      }
    }
    
    // Extract tier information
    if (line.includes('TIER') && line.includes('OPPORTUNITIES')) {
      const tierMatch = line.match(/TIER (\d+)/)
      if (tierMatch) {
        currentTier = parseInt(tierMatch[1]) as 1 | 2 | 3
      }
    }
    
    // Parse opportunities - looking for actual backend format
    // The backend uses "1. **Delaware Series LLC Multi-State Tax Framework**" or PRIORITY sections
    if (currentTier && line && !line.includes('TIER') && !line.includes('OPPORTUNITIES')) {
      // Look for numbered opportunities with bold formatting
      const opportunityMatch = line.match(/^\d+\.\s*\*\*(.+?)\*\*/) || 
                              line.match(/^\d+\.\s*(.+)/)
      
      if (opportunityMatch) {
        
        // Save previous opportunity
        if (currentOpportunity?.title) {
          opportunities.push(currentOpportunity as OpportunityTier)
        }
        
        currentOpportunity = {
          tier: currentTier,
          title: opportunityMatch[1].trim(),
          capital: { min: 0, max: 0, display: '' },
          riskRating: 'Medium',
          timeline: '',
          implementation: [],
          juiciness: 'MODERATE'
        }
      }
    }
    
    // Also parse PRIORITY sections as opportunities
    if (line.match(/^PRIORITY \d+:/)) {
      const priorityMatch = line.match(/^PRIORITY (\d+):\s*(.+)/)
      if (priorityMatch) {
        
        // Save previous opportunity
        if (currentOpportunity?.title) {
          opportunities.push(currentOpportunity as OpportunityTier)
        }
        
        // Assign tier based on priority number (1-3 map to tiers 1-3)
        const priorityNum = parseInt(priorityMatch[1])
        const tier = Math.min(priorityNum, 3) as 1 | 2 | 3
        
        currentOpportunity = {
          tier,
          title: priorityMatch[2].trim(),
          capital: { min: 0, max: 0, display: '' },
          riskRating: 'Medium', 
          timeline: '',
          implementation: [],
          juiciness: 'MODERATE'
        }
      }
      
      // Extract capital requirements - updated for backend format
      if (currentOpportunity && (line.includes('Capital Required:') || line.includes('Total Capital Required:'))) {
        const capitalMatch = line.match(/\$([0-9,]+)K?-?\$?([0-9,]+)?K/) ||
                            line.match(/\$([0-9,]+)K/)
        if (capitalMatch) {
          
          const min = parseInt(capitalMatch[1].replace(',', '')) * 1000
          const max = capitalMatch[2] ? parseInt(capitalMatch[2].replace(',', '')) * 1000 : min * 1.5
          currentOpportunity.capital = {
            min,
            max,
            display: capitalMatch[0]
          }
        }
      }
      
      // Extract risk rating
      if (currentOpportunity && line.includes('Risk Rating:')) {
        const riskMatch = line.match(/Risk Rating:\s*(Low|Medium|High)/)
        if (riskMatch) {
          currentOpportunity.riskRating = riskMatch[1] as 'Low' | 'Medium' | 'High'
        }
      }
      
      // Extract timeline
      if (currentOpportunity && line.includes('Timeline:')) {
        const timelineMatch = line.match(/Timeline:\s*(.+)/)
        if (timelineMatch) {
          currentOpportunity.timeline = timelineMatch[1]
        }
      }
      
      // Extract tax efficiency
      if (currentOpportunity && line.includes('Tax Efficiency:')) {
        const taxMatch = line.match(/Tax Efficiency:\s*(.+)/)
        if (taxMatch) {
          currentOpportunity.taxEfficiency = taxMatch[1]
        }
      }
      
      // Extract professional note
      if (currentOpportunity && line.includes('Professional')) {
        currentOpportunity.professionalNote = line
      }
      
      // Extract implementation steps
      if (currentOpportunity && line.includes('Implementation:')) {
        const implMatch = line.match(/Implementation:\s*(.+)/)
        if (implMatch) {
          currentOpportunity.implementation = implMatch[1].split(/\d+\)/).map(step => step.trim()).filter(step => step)
        }
      }
    }
    
    // Extract market assessment
    if (currentSection.includes('MARKET INTELLIGENCE')) {
      if (line.includes('JUICY:')) {
        const juicyMatch = line.match(/JUICY:\s*(.+)/)
        if (juicyMatch) {
          marketAssessment.juicy.push(juicyMatch[1])
        }
      }
      if (line.includes('MODERATE:')) {
        const moderateMatch = line.match(/MODERATE:\s*(.+)/)
        if (moderateMatch) {
          marketAssessment.moderate.push(moderateMatch[1])
        }
      }
      if (line.includes('FAR-FETCHED:')) {
        const farFetchedMatch = line.match(/FAR-FETCHED:\s*(.+)/)
        if (farFetchedMatch) {
          marketAssessment.farFetched.push(farFetchedMatch[1])
        }
      }
    }
    
    // Extract timing windows - looking for actual backend format
    if (currentSection.includes('TIMING CATALYST') || line.includes('Professional Timeline:')) {
      // Look for Professional Timeline entries
      const timelineMatch = line.match(/Professional Timeline:\s*(.+)/)
      if (timelineMatch && currentOpportunity) {
        const timeline = timelineMatch[1]
        const urgency = timeline.includes('4-6 weeks') || timeline.includes('2-3 weeks') ? 'urgent' :
                       timeline.includes('8-12 weeks') || timeline.includes('6-8 weeks') ? 'medium' : 'strategic'
        
        
        timingWindows.push({
          duration: timeline,
          opportunity: currentOpportunity.title || 'Strategic Opportunity',
          urgency
        })
      }
      
      // Also look for standalone timing patterns
      const windowMatch = line.match(/(\d+-?\d*\s*(?:week|month|weeks|months))\s*(?:window|timeline|implementation):\s*(.+)/)
      if (windowMatch) {
        const duration = windowMatch[1]
        const urgency = duration.includes('week') ? 'urgent' :
                       duration.includes('3') && duration.includes('month') ? 'medium' : 'strategic'
        
        
        timingWindows.push({
          duration: duration,
          opportunity: windowMatch[2] || 'Market Opportunity',
          urgency
        })
      }
    }
  }
  
  // Save last opportunity
  if (currentOpportunity?.title) {
    opportunities.push(currentOpportunity as OpportunityTier)
  }
  
  // Assign juiciness ratings based on market assessment
  opportunities.forEach(opp => {
    if (marketAssessment.juicy.some(j => opp.title.toLowerCase().includes(j.toLowerCase()))) {
      opp.juiciness = 'JUICY'
    } else if (marketAssessment.farFetched.some(f => opp.title.toLowerCase().includes(f.toLowerCase()))) {
      opp.juiciness = 'FAR-FETCHED'
    }
  })


  return {
    executiveSummary: executiveSummary || 'HNWI portfolios facing critical rebalancing with emerging opportunities',
    opportunities,
    timingWindows,
    wealthMigration,
    marketAssessment,
    confidence: metadata?.confidence || 0.87,
    generatedAt: metadata?.generated_at || new Date().toISOString(),
    expertsAnalyzed: 6,
    hoursInvested: '2.5 hours'
  }
}

// Utility functions for UI components
export function getOpportunityColor(juiciness: string): string {
  switch (juiciness) {
    case 'JUICY': return 'text-primary bg-primary/10 border-primary/20'
    case 'MODERATE': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200'
    case 'FAR-FETCHED': return 'text-muted-foreground bg-muted/30 border-muted-foreground/20'
    default: return 'text-muted-foreground bg-muted/30'
  }
}

export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'urgent': return 'text-primary bg-primary/10 border-primary/30'
    case 'medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200'
    case 'strategic': return 'text-muted-foreground bg-muted/30 border-border'
    default: return 'text-muted-foreground'
  }
}

export function formatCapital(capital: OpportunityTier['capital']): string {
  if (capital.min === capital.max) {
    return `$${(capital.min / 1000).toLocaleString()}K`
  }
  return `$${(capital.min / 1000).toLocaleString()}K-$${(capital.max / 1000).toLocaleString()}K`
}

export function getTierName(tier: number): string {
  switch (tier) {
    case 1: return 'Tier 1: $100K Opportunities'
    case 2: return 'Tier 2: $500K Opportunities'  
    case 3: return 'Tier 3: $1M+ Opportunities'
    default: return 'Opportunities'
  }
}