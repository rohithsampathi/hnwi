// hooks/use-intelligence-data.ts
// Efficient data fetching and processing hook

import { useState, useEffect, useCallback, useMemo } from "react"
import { secureApi } from "@/lib/secure-api"
import type { IntelligenceData, ProcessedIntelligenceData } from "@/types/dashboard"

// Helper function to extract structured opportunities from Ruscha intelligence data
function extractRuschaTierOpportunities(ruschaData: string, tier: number): any[] {
  const tierSections = {
    1: '**TIER 1: $100K OPPORTUNITIES**',
    2: '**TIER 2: $500K OPPORTUNITIES**',
    3: '**TIER 3: $1M OPPORTUNITIES**'
  }
  
  const nextTierSections = {
    1: '**TIER 2: $500K OPPORTUNITIES**',
    2: '**TIER 3: $1M OPPORTUNITIES**',
    3: '**MARKET INTELLIGENCE ASSESSMENT**'
  }
  
  try {
    const tierStart = ruschaData.indexOf(tierSections[tier as keyof typeof tierSections])
    if (tierStart === -1) return []
    
    const tierEnd = ruschaData.indexOf(nextTierSections[tier as keyof typeof nextTierSections])
    const tierContent = tierEnd === -1 ? ruschaData.slice(tierStart) : ruschaData.slice(tierStart, tierEnd)
    
    // Extract individual opportunities (numbered items)
    const opportunities = []
    const oppMatches = tierContent.match(/\n(\d+)\.\s\*\*(.*?)\*\*[^]*?(?=\n\d+\.\s\*\*|\n\*\*|$)/g)
    
    if (oppMatches) {
      opportunities.push(...oppMatches.map(match => {
        const lines = match.trim().split('\n')
        const titleMatch = lines[0].match(/\d+\.\s\*\*(.*?)\*\*/)
        const title = titleMatch ? titleMatch[1] : `Tier ${tier} Opportunity`
        
        // Extract detailed fields
        const capitalMatch = match.match(/Total Capital Required:\s*([^-\n]+)/i)
        const riskMatch = match.match(/Risk Rating:\s*([^-\n]+)/i)
        const netWorthMatch = match.match(/Minimum Net Worth:\s*([^-\n]+)/i)
        const taxEfficiencyMatch = match.match(/Tax Efficiency:\s*([^-\n]+)/i)
        const timelineMatch = match.match(/Professional Timeline:\s*([^-\n]+)/i)
        const implementationMatch = match.match(/Implementation:\s*([^]*?)(?=\n\s*-\s*Framework Note|\n\s*[A-Z]|\n\s*\*\*|$)/i)
        const frameworkNoteMatch = match.match(/Framework Note:\s*([^]*?)(?=\n\s*\*\*|$)/i)
        const locationMatch = match.match(/(?:Location|Geography|Region|Market):\s*([^-\n]+)/i)
        const sectorMatch = match.match(/(?:Sector|Industry|Asset Class):\s*([^-\n]+)/i)
        
        return {
          title: title,
          totalCapitalRequired: capitalMatch ? capitalMatch[1].trim() : `Tier ${tier} Capital`,
          riskRating: riskMatch ? riskMatch[1].trim() : 'Medium',
          minimumNetWorth: netWorthMatch ? netWorthMatch[1].trim() : null,
          taxEfficiency: taxEfficiencyMatch ? taxEfficiencyMatch[1].trim() : null,
          professionalTimeline: timelineMatch ? timelineMatch[1].trim() : null,
          implementation: implementationMatch ? implementationMatch[1].trim() : null,
          frameworkNote: frameworkNoteMatch ? frameworkNoteMatch[1].trim() : null,
          location: locationMatch ? locationMatch[1].trim() : null,
          sector: sectorMatch ? sectorMatch[1].trim() : null,
          content: match.trim(),
          tier: tier
        }
      }))
    }
    
    return opportunities
  } catch (error) {
    console.error('Error extracting tier opportunities:', error)
    return []
  }
}

interface UseIntelligenceDataResult {
  data: ProcessedIntelligenceData | null
  loading: boolean
  error: string | null
  refreshing: boolean
  refresh: () => void
}

export function useIntelligenceData(userData?: any): UseIntelligenceDataResult {
  const [intelligenceData, setIntelligenceData] = useState<IntelligenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const userId = useMemo(() => 
    userData?.id || userData?.user_id || userData?.userId || userData?._id || localStorage.getItem('userId'),
    [userData]
  )

  const fetchIntelligence = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setRefreshing(forceRefresh)
      // Call backend API directly with authentication - using HNWI integrated endpoint with 5-minute caching
      // Bypass cache on force refresh
      const data = await secureApi.get(`/api/hnwi/intelligence/dashboard/${userId}`, true, { 
        enableCache: !forceRefresh, 
        cacheDuration: 300000 // 5 minutes cache for intelligence data
      })
      setIntelligenceData(data)
      setError(null)
    } catch (error: any) {
      // Intelligence fetch failed - error logged to monitoring system
      setError(error.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [userId])

  const processedData = useMemo(() => {
    if (!intelligenceData) return null

    // Extract intelligence sections from HNWI integrated endpoint
    const intel = intelligenceData.intelligence || intelligenceData
    
    
    // Process opportunity alignment data
    const opportunities = intel.opportunity_alignment?.data?.analyzed_opportunities || []
    const juicyOpportunities = opportunities.filter((opp: any) => opp.victor_rating === 'juicy')
    const moderateOpportunities = opportunities.filter((opp: any) => opp.victor_rating === 'moderate') 
    const farFetchedOpportunities = opportunities.filter((opp: any) => opp.victor_rating === 'far_fetched')
    
    return {
      // Raw intelligence data for display
      rawIntelligence: intel,
      rawIntelligenceData: intelligenceData, // Complete raw endpoint response
      
      // Basic metadata - confidence already comes as decimal (0.9 = 90%)
      confidence: intel.elite_pulse?.confidence || intel.ruscha_intelligence?.confidence || 0.85,
      generatedAt: intelligenceData.timestamp || new Date().toISOString(),
      
      // Full intelligence summary (no parsing, just display the raw structure)
      intelligenceSummary: intel,
      
      // Process opportunities from opportunity_alignment
      opportunities: opportunities,
      juicyOpportunities: juicyOpportunities,
      moderateOpportunities: moderateOpportunities,
      farFetchedOpportunities: farFetchedOpportunities,
      
      // Process peer intelligence
      peerSignals: intel.peer_intelligence?.data || intel.peer_signals?.data || {},
      
      // Calculate total opportunity value
      totalOpportunityValue: opportunities.reduce((total: number, opp: any) => {
        const value = parseFloat(opp.value?.replace(/[^0-9.]/g, '') || '0')
        return total + value
      }, 0),
      
      // Extract executive summary from ruscha intelligence
      executiveSummary: (() => {
        const ruschaData = intel.ruscha_intelligence?.data
        if (!ruschaData) return ""
        
        // Find the executive summary section specifically
        const execSummaryStart = ruschaData.indexOf('**EXECUTIVE INTELLIGENCE SUMMARY**')
        if (execSummaryStart !== -1 && execSummaryStart >= 0) {
          const afterExecHeader = ruschaData.substring(execSummaryStart + '**EXECUTIVE INTELLIGENCE SUMMARY**'.length)
          const nextSectionStart = afterExecHeader.indexOf('**TIER 1:')
          if (nextSectionStart !== -1) {
            return afterExecHeader.substring(0, nextSectionStart).trim()
          }
          return afterExecHeader.trim()
        }
        return ""
      })(),
      
      // Extract market intelligence
      marketIntelligence: intel.ruscha_intelligence?.data?.split('**MARKET INTELLIGENCE ASSESSMENT**')[1]?.split('**ASSET CLASS ALLOCATION GUIDANCE**')[0] || "",
      
      // Process ruscha data for full analysis
      fullRuschaData: intel.ruscha_intelligence?.data || "Intelligence system processing your personalized brief...",
      
      // Crown Vault data - extract Asset Class Allocation Guidance from ruscha intelligence
      crownVaultSummary: (() => {
        const ruschaData = intel.ruscha_intelligence?.data
        if (!ruschaData) return ""
        
        // Extract Asset Class Allocation Guidance section
        const assetAllocationStart = ruschaData.indexOf('**ASSET CLASS ALLOCATION GUIDANCE**')
        if (assetAllocationStart !== -1) {
          const afterAllocationHeader = ruschaData.substring(assetAllocationStart + '**ASSET CLASS ALLOCATION GUIDANCE**'.length)
          const nextSectionStart = afterAllocationHeader.indexOf('**TIMING CATALYST ANALYSIS**')
          if (nextSectionStart !== -1) {
            return afterAllocationHeader.substring(0, nextSectionStart).trim()
          }
          return afterAllocationHeader.trim()
        }
        return ""
      })(),
      
      totalExposure: (() => {
        const ruschaData = intel.ruscha_intelligence?.data
        if (!ruschaData) return ""
        
        // Extract Total Exposure directly from Ruscha intelligence
        const exposureMatch = ruschaData.match(/Total Exposure:\s*([^\n]+)/i)
        return exposureMatch ? exposureMatch[1].trim() : ""
      })(),
                    
      // Extract impacted assets directly from ruscha intelligence analysis
      impactedAssets: (() => {
        const ruschaData = intel.ruscha_intelligence?.data
        if (!ruschaData) return []
        
        // Look for impacted assets section in the ruscha data
        const assetsSection = ruschaData.match(/\*\*IMPACTED ASSETS\*\*([^]*?)(?=\*\*|$)/i)
        if (!assetsSection) return []
        
        const assetsContent = assetsSection[1]
        const assetMatches = assetsContent.match(/(\d+)\.\s*\*\*([^*]+)\*\*([^]*?)(?=\d+\.\s*\*\*|$)/g)
        
        if (!assetMatches) return []
        
        return assetMatches.map((match, index) => {
          const lines = match.trim().split('\n')
          const titleMatch = lines[0].match(/\d+\.\s*\*\*([^*]+)\*\*/)
          const title = titleMatch ? titleMatch[1].trim() : `Asset ${index + 1}`
          
          // Extract structured data from the asset content
          const categoryMatch = match.match(/Category:\s*([^\n]+)/i)
          const riskMatch = match.match(/Risk Level:\s*([^\n]+)/i)
          const exposureMatch = match.match(/Exposure:\s*([^\n]+)/i)
          const impactMatch = match.match(/30-Day Impact:\s*([^\n]+)/i)
          const actionMatch = match.match(/Action Required:\s*([^\n]+)/i)
          const intelligenceMatch = match.match(/Intelligence Match:\s*([^\n]+)/i)
          
          return {
            asset: title,
            asset_id: title.toLowerCase().replace(/\s+/g, '-'),
            category: categoryMatch ? categoryMatch[1].trim() : '',
            risk_level: riskMatch ? riskMatch[1].trim().toUpperCase() : 'MEDIUM',
            exposure_amount: exposureMatch ? exposureMatch[1].trim() : '',
            thirty_day_impact: impactMatch ? impactMatch[1].trim() : '',
            action_required: actionMatch ? actionMatch[1].trim() : '',
            intelligence_match: intelligenceMatch ? intelligenceMatch[1].trim() : ''
          }
        })
      })(),
      networkData: intel.peer_intelligence?.data || intel.peer_signals?.data,
      wealthFlowData: intel.elite_pulse?.data,
      
      // Enhanced elite pulse data - extract multiple sections from Ruscha intelligence
      elitePulseData: (() => {
        const ruschaData = intel.ruscha_intelligence?.data
        if (!ruschaData) return null
        
        // Extract Market Intelligence Assessment - look until next major section
        const marketIntelligenceSection = ruschaData.match(/\*\*MARKET INTELLIGENCE ASSESSMENT\*\*([\s\S]*?)(?=\*\*TIMING CATALYST ANALYSIS\*\*|\*\*IMPLEMENTATION ROADMAP\*\*|$)/i)
        
        // Extract Timing Catalyst Analysis - look until next major section  
        const timingCatalystSection = ruschaData.match(/\*\*TIMING CATALYST ANALYSIS\*\*([\s\S]*?)(?=\*\*IMPLEMENTATION ROADMAP\*\*|\*\*MARKET INTELLIGENCE ASSESSMENT\*\*|$)/i)
        
        // Extract Implementation Roadmap - take everything from this section to the end
        const implementationRoadmapSection = ruschaData.match(/\*\*IMPLEMENTATION ROADMAP\*\*([\s\S]*?)$/i)
        
        // Debug section extraction
        console.log('=== SECTION EXTRACTION DEBUG ===')
        console.log('Market Intelligence found:', !!marketIntelligenceSection)
        console.log('Timing Catalyst found:', !!timingCatalystSection) 
        console.log('Implementation Roadmap found:', !!implementationRoadmapSection)
        
        if (implementationRoadmapSection) {
          console.log('Implementation Roadmap raw length:', implementationRoadmapSection[1].length)
          console.log('Implementation Roadmap sample:', implementationRoadmapSection[1].substring(0, 300))
          console.log('Implementation Roadmap full:', implementationRoadmapSection[1])
        }
        console.log('=== END SECTION DEBUG ===')

        // Return combined data if any sections are found
        if (marketIntelligenceSection || timingCatalystSection || implementationRoadmapSection) {
          return {
            marketIntelligence: marketIntelligenceSection ? marketIntelligenceSection[1].trim() : null,
            timingCatalyst: timingCatalystSection ? timingCatalystSection[1].trim() : null,
            implementationRoadmap: implementationRoadmapSection ? implementationRoadmapSection[1].trim() : null,
            source: 'market_intelligence'
          }
        }
        
        return null
      })(),
      
      // Extract structured Ruscha Tier opportunities for Opportunities tab
      tier1Opportunities: intel.ruscha_intelligence?.data ? extractRuschaTierOpportunities(intel.ruscha_intelligence.data, 1) : [],
      tier2Opportunities: intel.ruscha_intelligence?.data ? extractRuschaTierOpportunities(intel.ruscha_intelligence.data, 2) : [],
      tier3Opportunities: intel.ruscha_intelligence?.data ? extractRuschaTierOpportunities(intel.ruscha_intelligence.data, 3) : [],
      
      timingAnalysis: intel.ruscha_intelligence?.data?.split('**TIMING CATALYST ANALYSIS**')[1]?.split('**IMPLEMENTATION ROADMAP**')[0] || "",
      assetAllocation: intel.ruscha_intelligence?.data?.split('**ASSET CLASS ALLOCATION GUIDANCE**')[1]?.split('**TIMING CATALYST ANALYSIS**')[0] || "",
      implementationRoadmap: intel.ruscha_intelligence?.data?.split('**IMPLEMENTATION ROADMAP**')[1] || ""
    }
  }, [intelligenceData])

  useEffect(() => {
    fetchIntelligence(false) // Use cache on initial load
  }, [fetchIntelligence])

  const refresh = useCallback(() => {
    fetchIntelligence(true)
  }, [fetchIntelligence])

  return {
    data: processedData,
    loading,
    error,
    refreshing,
    refresh
  }
}

