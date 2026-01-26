// hooks/use-intelligence-data.ts
// Efficient data fetching and processing hook

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { secureApi } from "@/lib/secure-api"
import { getCurrentUser, getCurrentUserId } from "@/lib/auth-manager"
import { getOpportunities, getCrownVaultAssets, getCrownVaultStats } from "@/lib/api"
import type { IntelligenceData, ProcessedIntelligenceData } from "@/types/dashboard"

// Helper function to extract structured opportunities from Ruscha intelligence data
function extractRuschaTierOpportunities(ruschaData: string, tier: number): any[] {
  try {
    // First, fix broken formatting where characters are on separate lines
    // This handles cases like "$\n1\n3\nM" becoming "$13M"
    let cleanData = ruschaData

    // Fix broken dollar amounts like "$\n1\n3\nM" -> "$13M"
    cleanData = cleanData.replace(/\$\s*\n\s*(\d)/g, '$$1')
    cleanData = cleanData.replace(/(\d)\s*\n\s*(\d)/g, '$1$2')
    cleanData = cleanData.replace(/(\d)\s*\n\s*([KMB])/gi, '$1$2')

    // Fix broken words split across lines
    cleanData = cleanData.replace(/([a-z])\s*\n\s*([a-z])/g, '$1$2')
    cleanData = cleanData.replace(/([A-Z][a-z])\s*\n\s*([a-z])/g, '$1$2')

    // More aggressive cleaning for severely broken formatting
    // Look for patterns like "s\nu\np\ne\nr\nc\na\nr" and fix them
    cleanData = cleanData.replace(/([a-zA-Z])\s*\n\s*([a-zA-Z])\s*\n\s*([a-zA-Z])/g, '$1$2$3')


    // Define tier headers - be flexible with formatting
    const tierHeaders = {
      1: [
        'TIER 1: $100K OPPORTUNITIES', 'TIER 1:', 'TIER 1 OPPORTUNITIES',
        '$100K OPPORTUNITIES', '100K OPPORTUNITIES', 'Tier 1 Opportunities',
        'TIER 1 -', 'TIER 1–', 'TIER 1—',  // Different dash types
        'TIER ONE'
      ],
      2: [
        'TIER 2: $500K OPPORTUNITIES', 'TIER 2:', 'TIER 2 OPPORTUNITIES',
        '$500K OPPORTUNITIES', '500K OPPORTUNITIES', 'Tier 2 Opportunities',
        'TIER 2 -', 'TIER 2–', 'TIER 2—',
        'TIER TWO'
      ],
      3: [
        'TIER 3: $1M OPPORTUNITIES', 'TIER 3:', 'TIER 3 OPPORTUNITIES',
        '$1M OPPORTUNITIES', '1M OPPORTUNITIES', '$1M+ OPPORTUNITIES',
        'Tier 3 Opportunities', 'TIER 3 -', 'TIER 3–', 'TIER 3—',
        'TIER THREE'
      ]
    }

    // Find the tier section - try multiple strategies
    let tierStart = -1
    let headerFound = ''

    // Strategy 1: Look for exact tier headers
    for (const header of tierHeaders[tier as keyof typeof tierHeaders]) {
      tierStart = cleanData.indexOf(header)
      if (tierStart === -1) {
        tierStart = cleanData.toLowerCase().indexOf(header.toLowerCase())
      }
      if (tierStart !== -1) {
        headerFound = header
        break
      }
    }

    // Strategy 2: If not found, use regex to find "TIER X" pattern
    if (tierStart === -1) {
      const tierRegex = new RegExp(`TIER\\s*${tier}[:\\s\\-–—]`, 'i')
      const match = cleanData.match(tierRegex)
      if (match && match.index !== undefined) {
        tierStart = match.index
        headerFound = match[0]
      }
    }

    // Strategy 3: If still not found, look for the capital amount pattern
    if (tierStart === -1) {
      const capitalPatterns = {
        1: /\$100[,K\s]*OPPORTUNIT/i,
        2: /\$500[,K\s]*OPPORTUNIT/i,
        3: /\$1[,M.\s]*OPPORTUNIT/i
      }
      const capitalMatch = cleanData.match(capitalPatterns[tier as keyof typeof capitalPatterns])
      if (capitalMatch && capitalMatch.index !== undefined) {
        tierStart = capitalMatch.index
        headerFound = capitalMatch[0]
      }
    }

    if (tierStart === -1) {
      return []
    }


    // Find where this tier section ends
    let tierEnd = cleanData.length

    // Check for next tier headers
    const allNextHeaders = [
      ...tierHeaders[1], ...tierHeaders[2], ...tierHeaders[3],
      'MARKET INTELLIGENCE', 'TIMING CATALYST', 'IMPLEMENTATION',
      'EXECUTIVE SUMMARY', 'KEY OPPORTUNITIES', 'END OF OPPORTUNITIES'
    ]

    for (const nextHeader of allNextHeaders) {
      const nextPos = cleanData.indexOf(nextHeader, tierStart + headerFound.length + 10)
      if (nextPos !== -1 && nextPos < tierEnd && nextPos > tierStart) {
        tierEnd = nextPos
      }
    }

    const tierContent = cleanData.slice(tierStart, tierEnd)

    // Parse opportunities from the content
    const opportunities = []

    // Remove the tier header line (## TIER X: $XXX OPPORTUNITIES)
    const contentWithoutHeader = tierContent.replace(/^.*?TIER.*?OPPORTUNITIES.*?\n+/i, '')

    // SIMPLE PARSING: Split by ** markers (each opportunity starts with **Title**)
    // Next opportunity = next **, Next tier = ##
    const items = contentWithoutHeader
      .split(/\n(?=\*\*)/)  // Split on newline followed by **
      .map(item => {
        // Remove any ## content (next tier marker) from the end
        const hashIndex = item.indexOf('\n##')
        if (hashIndex > -1) {
          return item.substring(0, hashIndex).trim()
        }
        return item.trim()
      })
      .filter(item => item.length > 20 && item.startsWith('**'))  // Only blocks starting with **

    if (tier === 1) {
      items.forEach((item, i) => {
      })
    }

    // Process each item as an opportunity
    items.forEach((item, index) => {
      // Skip empty items
      if (!item || item.trim().length === 0) {
        return
      }

      const text = item.trim()

      // Skip the header line if it somehow got through
      if (text.toUpperCase().includes('TIER') && text.toUpperCase().includes('OPPORTUNITIES')) return

      // NEW FORMAT PARSING:
      // **Title**
      // Entry Investment: $XXX (details)
      // Risk Profile: XXX - description
      //
      // Description paragraph (only this goes in description)

      let title = ''
      let capital = ''
      let risk = ''
      let description = ''

      // Extract title from **Title**
      const titleMatch = text.match(/^\*\*(.*?)\*\*/)
      if (titleMatch) {
        title = titleMatch[1].trim()
      }

      // Extract Entry Investment line (for capital tag only)
      const investmentMatch = text.match(/Entry Investment:\s*\$?([\d,]+(?:,\d{3})*(?:\.\d+)?[KMB]?)/i)
      if (investmentMatch) {
        let amount = investmentMatch[1].replace(/,/g, '')

        // If it doesn't already have K/M/B suffix, format it
        if (!/[KMB]$/i.test(amount)) {
          const num = parseFloat(amount)
          if (num >= 1000000000) {
            amount = (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
          } else if (num >= 1000000) {
            amount = (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
          } else if (num >= 1000) {
            amount = (num / 1000).toFixed(0) + 'K'
          }
        }

        capital = '$' + amount
      }

      // Extract Risk Profile (for risk tag only)
      const riskMatch = text.match(/Risk Profile:\s*([^\-\n]+)/i)
      if (riskMatch) {
        risk = riskMatch[1].trim()
      }

      // Extract ONLY the description paragraph (after blank line following Risk Profile)
      const descriptionMatch = text.match(/Risk Profile:.*?\n\n(.+)/s)
      if (descriptionMatch) {
        description = descriptionMatch[1].trim()
      }

      // Fallback defaults if parsing failed
      if (!title) {
        title = `Opportunity ${index + 1}`
      }
      if (!capital) {
        capital = tier === 1 ? '$100K' : tier === 2 ? '$500K' : '$1M'
      }
      if (!risk) {
        risk = tier === 1 ? 'Low-Medium' : tier === 2 ? 'Medium' : 'Medium-High'
      }
      if (!description) {
        // Last resort: use full text but this shouldn't happen
        description = text
      }

      // Extract location
      let location = 'Global Markets'
      const locations = ['Miami', 'Hong Kong', 'Naples', 'Abu Dhabi', 'Paris', 'London', 'New York', 'Tokyo', 'Singapore', 'Dubai', 'Monaco', 'Zurich']
      for (const loc of locations) {
        if (text.includes(loc)) {
          location = loc
          break
        }
      }

      // Determine sector based on keywords
      let sector = 'Alternative Investment'
      if (text.match(/\bart\b/i) || text.includes('Art Basel')) sector = 'Art & Collectibles'
      else if (text.match(/real estate/i) || text.match(/property/i) || text.match(/waterfront/i)) sector = 'Real Estate'
      else if (text.match(/timepiece/i) || text.match(/watch/i)) sector = 'Luxury Timepieces'
      else if (text.match(/hospitality/i) || text.match(/hotel/i)) sector = 'Hospitality'
      else if (text.match(/auction/i)) sector = 'Auction Platform'
      else if (text.match(/collectible/i) || text.match(/diamond/i) || text.match(/coin/i)) sector = 'Collectibles'
      else if (text.match(/yacht/i) || text.match(/aircraft/i)) sector = 'Luxury Assets'
      else if (text.match(/wine/i)) sector = 'Wine Investment'
      else if (text.match(/crypto/i) || text.match(/digital/i)) sector = 'Digital Assets'

      opportunities.push({
        title: title || `Opportunity ${index + 1}`,
        totalCapitalRequired: capital,
        riskRating: risk,
        location: location,
        sector: sector,
        tier: tier,
        description: description // Full description, no truncation
      })

    })

    // Pattern 2: Look for sections with specific opportunity keywords
    if (opportunities.length === 0) {

      // Look for common opportunity patterns in the text
      const opportunityKeywords = [
        'Private Equity', 'Real Estate', 'Hedge Fund', 'Venture Capital',
        'Art Collection', 'Wine Investment', 'Yacht', 'Aircraft',
        'Commodity', 'Cryptocurrency', 'NFT', 'Alternative Investment',
        'Trust', 'Foundation', 'Family Office', 'Syndication',
        'REIT', 'ETF', 'Bond', 'Municipal', 'Treasury',
        'Gold', 'Silver', 'Precious Metal', 'Diamond',
        'Startup', 'IPO', 'Merger', 'Acquisition'
      ]

      // Split content into sentences/paragraphs
      const sections = tierContent.split(/(?:\n\n|\. |\n[-•*])/).filter(s => s.trim().length > 20)

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i]

        // Skip headers
        if (section.toUpperCase().includes('TIER') && section.toUpperCase().includes('OPPORTUNITIES')) continue

        // Check if this section mentions an investment opportunity
        const hasKeyword = opportunityKeywords.some(kw =>
          section.toLowerCase().includes(kw.toLowerCase())
        )

        const hasAmount = /\$[\d,]+[KMB]?/i.test(section)

        if (hasKeyword || hasAmount) {
          // Extract a title from the section
          let title = ''

          // Try to find a keyword that matches
          const matchedKeyword = opportunityKeywords.find(kw =>
            section.toLowerCase().includes(kw.toLowerCase())
          )

          if (matchedKeyword) {
            title = `${matchedKeyword} Opportunity`
          } else {
            // Use first few words
            const words = section.trim().split(/\s+/).slice(0, 5).join(' ')
            title = words.length > 50 ? words.substring(0, 50) + '...' : words
          }

          // Extract capital if mentioned
          const capitalMatch = section.match(/\$(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)/i)
          const capital = capitalMatch ?
            `$${capitalMatch[1]}` :
            `$${tier === 1 ? '100K-250K' : tier === 2 ? '500K-750K' : '1M-5M'}`

          // Extract risk if mentioned
          let risk = tier === 1 ? 'Low-Medium' : tier === 2 ? 'Medium' : 'Managed'
          if (section.toLowerCase().includes('low risk')) risk = 'Low'
          else if (section.toLowerCase().includes('high risk')) risk = 'High'
          else if (section.toLowerCase().includes('moderate') || section.toLowerCase().includes('medium')) risk = 'Medium'

          opportunities.push({
            title: title,
            totalCapitalRequired: capital,
            riskRating: risk,
            location: 'Global Markets',
            sector: matchedKeyword || 'Alternative Investment',
            tier: tier
          })

          // Limit to 5 opportunities per tier
          if (opportunities.length >= 5) break
        }
      }

    }

    // Pattern 3: Look for dollar amounts and create opportunities around them
    if (opportunities.length === 0) {

      const dollarMatches = tierContent.matchAll(/\$(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)[^\n]{0,200}/gi)
      let count = 0

      for (const match of dollarMatches) {
        if (count >= 3) break  // Limit to 3 opportunities

        const amount = match[1]
        const context = match[0]

        // Skip if this is the tier header
        if (context.includes('TIER') && context.includes('OPPORTUNITIES')) continue

        // Create opportunity from context
        const words = context.replace(/\$[\d,KMB.]+/g, '').trim().split(/\s+/).slice(0, 5).join(' ')

        opportunities.push({
          title: words || `Investment Opportunity ${count + 1}`,
          totalCapitalRequired: `$${amount}`,
          riskRating: tier === 1 ? 'Low-Medium' : tier === 2 ? 'Medium' : 'Managed',
          location: 'Strategic Markets',
          sector: 'Diversified Investment',
          tier: tier
        })

        count++
      }

    }

    // If still no opportunities found, create default ones based on tier
    if (opportunities.length === 0) {
      const defaults = {
        1: [
          { title: 'Entry-Level Alternative Investment', totalCapitalRequired: '$100,000', riskRating: 'Low-Medium' },
          { title: 'Emerging Market Opportunity', totalCapitalRequired: '$125,000', riskRating: 'Medium' },
          { title: 'Structured Product Access', totalCapitalRequired: '$100,000', riskRating: 'Low' }
        ],
        2: [
          { title: 'Growth Portfolio Expansion', totalCapitalRequired: '$500,000', riskRating: 'Medium' },
          { title: 'Private Market Access', totalCapitalRequired: '$500,000', riskRating: 'Medium-High' },
          { title: 'Real Estate Syndication', totalCapitalRequired: '$450,000', riskRating: 'Medium' }
        ],
        3: [
          { title: 'HNWI Pattern Intelligence Portfolio', totalCapitalRequired: '$1,000,000+', riskRating: 'Managed' },
          { title: 'Elite Private Equity Access', totalCapitalRequired: '$1,500,000', riskRating: 'Medium-High' },
          { title: 'Ultra-Premium Real Estate', totalCapitalRequired: '$2,000,000', riskRating: 'Low-Medium' }
        ]
      }

      const tierDefaults = defaults[tier as keyof typeof defaults]
      tierDefaults.forEach(def => {
        opportunities.push({
          ...def,
          location: 'Global Markets',
          sector: 'Premium Investments',
          tier: tier
        })
      })
    }

    return opportunities

  } catch (error) {
    // Error extracting opportunities - will return empty array
    return []
  }
}

interface UseIntelligenceDataOptions {
  loadCrownVaultMongoDB?: boolean  // Load actual Crown Vault MongoDB data (assets, stats)
  loadKatherineAnalysis?: boolean   // Load Katherine's Crown Vault analysis
  loadVictorAnalysis?: boolean      // Load Victor's opportunity analysis
}

interface UseIntelligenceDataResult {
  data: ProcessedIntelligenceData | null
  loading: boolean
  error: string | null
  refreshing: boolean
  refresh: () => void
}

export function useIntelligenceData(userData?: any, options?: UseIntelligenceDataOptions): UseIntelligenceDataResult {
  const [intelligenceData, setIntelligenceData] = useState<IntelligenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const fetchInProgressRef = useRef(false)

  // TEMPORARY: Always bust cache for debugging
  // TODO: Re-enable caching after verifying data is fresh
  const TEMPORARILY_DISABLE_CACHE = true;

  // CRITICAL FIX: Check URL parameter to trigger cache busting on mount
  // This solves the timing issue where events are dispatched before component mounts
  const initialForceRefresh = TEMPORARILY_DISABLE_CACHE || (typeof window !== 'undefined' &&
    (window.location.search.includes('refresh=') || window.location.search.includes('bust_cache=true')));

  const hasFetchedRef = useRef(false)
  const failureCountRef = useRef(0)
  const lastFailureTimeRef = useRef(0)

  const userId = useMemo(() => {
    // Use centralized auth manager for user ID
    const authUser = getCurrentUser()
    return userData?.id || userData?.user_id || userData?.userId || userData?._id || 
           authUser?.userId || authUser?.user_id || authUser?.id || getCurrentUserId()
  }, [userData])

  const fetchIntelligence = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Circuit breaker: If too many recent failures, wait before retrying
    const now = Date.now()
    const timeSinceLastFailure = now - lastFailureTimeRef.current
    const backoffTime = Math.min(5000 * Math.pow(2, failureCountRef.current), 30000) // Cap at 30 seconds

    if (failureCountRef.current >= 3 && timeSinceLastFailure < backoffTime && !forceRefresh) {
      setError(`Too many failures. Retrying in ${Math.ceil((backoffTime - timeSinceLastFailure) / 1000)} seconds...`)
      return
    }

    // Prevent duplicate fetches
    if (fetchInProgressRef.current && !forceRefresh) {
      return
    }

    // Skip if already fetched (unless forcing refresh)
    if (hasFetchedRef.current && !forceRefresh && intelligenceData) {
      setLoading(false)
      return
    }

    fetchInProgressRef.current = true

    try {
      setRefreshing(forceRefresh)

      // Determine which data to fetch based on options
      const shouldLoadCrownVaultMongoDB = options?.loadCrownVaultMongoDB ?? false // Default to false - only load on Crown Vault page
      const shouldLoadKatherineAnalysis = options?.loadKatherineAnalysis ?? true  // Default to true for Home Dashboard
      const shouldLoadVictorAnalysis = options?.loadVictorAnalysis ?? true       // Default to true for both Home and Prive

      // For Prive Exchange page, we only need Victor analysis and opportunities
      // Skip dashboard summary and intelligence if only Victor is needed
      const shouldLoadDashboardData = shouldLoadKatherineAnalysis // Only load dashboard data if Katherine analysis is needed

      // OPTIMIZED: Sequential request batching with proper delays to prevent rate limiting
      // Backend rate limiter needs ~200ms between requests even for whitelisted IPs

      let summaryData = null, intelligenceData = null, crownVaultData = null, opportunitiesData = null
      let realOpportunities = [], realCrownVaultAssets = [], realCrownVaultStats = null

      // Helper function to safely fetch with delay
      const fetchWithDelay = async (endpoint: string, cacheDuration: number, delay: number = 250) => {
        try {
          await new Promise(resolve => setTimeout(resolve, delay))
          // CRITICAL: Pass bustCache flag correctly (third param is boolean, not object)
          return await secureApi.get(endpoint, true, forceRefresh)
        } catch (error) {
          return null
        }
      }

      // Batch 1: Essential dashboard data (sequential with proper delays)
      if (shouldLoadDashboardData) {
        summaryData = await fetchWithDelay('/api/hnwi/dashboard/summary', 60000, 0) // No delay for first request
        intelligenceData = await fetchWithDelay('/api/hnwi/intelligence/latest', 300000, 300) // 300ms delay
      }

      // Batch 2: Analysis data (sequential with delays)
      if (shouldLoadKatherineAnalysis) {
        crownVaultData = await fetchWithDelay('/api/hnwi/katherine/analysis/latest', 300000, 300)
      }

      // Victor analysis endpoint removed - was returning 404
      // Opportunities are fetched from /api/opportunities instead
      if (shouldLoadVictorAnalysis) {
        // Skip - victor analysis integrated into opportunities data
        opportunitiesData = null
      }

      // Batch 3: MongoDB data (sequential - no parallel to avoid rate limits)
      try {
        // Get opportunities first
        realOpportunities = await fetchWithDelay('/api/opportunities', 600000, 300).then(data => data || [])

        if (shouldLoadCrownVaultMongoDB) {
          // Get Crown Vault data sequentially with delays
          const assetsResponse = await fetchWithDelay(`/api/crown-vault/assets/detailed?owner_id=${userId}`, 600000, 300)
          // API returns array directly, not wrapped in {assets: [...]}
          realCrownVaultAssets = Array.isArray(assetsResponse) ? assetsResponse : (assetsResponse?.assets || [])
          realCrownVaultStats = await fetchWithDelay(`/api/crown-vault/stats?owner_id=${userId}`, 600000, 300)
        }
      } catch (error) {
        // MongoDB data failed - use empty defaults
        realOpportunities = []
        realCrownVaultAssets = []
        realCrownVaultStats = null
      }

      // Combine all data sources
      setIntelligenceData({
        // Main intelligence for content display
        intelligence: intelligenceData,
        // Dashboard summary for metrics
        dashboardSummary: summaryData,
        // Crown vault for impact analysis
        crownVaultData: crownVaultData,
        // Opportunities for opportunities tab
        opportunitiesData: opportunitiesData,
        // Real database data
        realOpportunities: realOpportunities,
        realCrownVaultAssets: realCrownVaultAssets,
        realCrownVaultStats: realCrownVaultStats,
        // Fallback to intelligence data if others fail
        ...(intelligenceData || {})
      })
      setError(null)
      hasFetchedRef.current = true
      // Reset failure count on success
      failureCountRef.current = 0
      lastFailureTimeRef.current = 0
    } catch (error: any) {
      // Enhanced error handling for session degradation patterns
      let errorMessage = error.message || 'Failed to load intelligence data'

      // Detect backend session corruption patterns
      if (errorMessage.includes('user_context') ||
          errorMessage.includes('State object') ||
          errorMessage.includes('500')) {
        errorMessage = 'Backend session temporarily unavailable. Data will reload automatically.'

        // Auto-retry after session corruption (don't spam the user)
        if (!hasFetchedRef.current) {
          setTimeout(() => {
            fetchIntelligence(true) // Force refresh to rebuild session
          }, 3000) // Wait 3 seconds for backend to stabilize
        }
      } else if (errorMessage.includes('401') ||
                 errorMessage.includes('Authentication')) {
        errorMessage = 'Session expired. Please sign in again to continue.'
      } else if (errorMessage.includes('429') ||
                 errorMessage.includes('rate limit')) {
        errorMessage = 'Too many requests. Retrying automatically...'

        // Auto-retry rate limit after delay
        setTimeout(() => {
          fetchIntelligence(true)
        }, 5000)
      }

      // Track failures for circuit breaker
      failureCountRef.current += 1
      lastFailureTimeRef.current = Date.now()

      setError(errorMessage)
    } finally {
      setLoading(false)
      setRefreshing(false)
      fetchInProgressRef.current = false
    }
  }, [userId, options?.loadCrownVaultMongoDB, options?.loadKatherineAnalysis, options?.loadVictorAnalysis])

  const processedData = useMemo(() => {
    if (!intelligenceData) return null

    // Extract data from different sources - all APIs return {success: true, data: {...}}
    const summaryData = intelligenceData.dashboardSummary?.data || {}
    const intelligenceData_inner = intelligenceData.intelligence?.data || {}
    const crownVaultData = intelligenceData.crownVaultData?.data || {}
    const opportunitiesData_inner = intelligenceData.opportunitiesData?.data || {}

    // Real MongoDB data - prioritize this over analysis data
    const realOpportunities = intelligenceData.realOpportunities || []
    const realCrownVaultAssets = intelligenceData.realCrownVaultAssets || []
    const realCrownVaultStats = intelligenceData.realCrownVaultStats || {}

    // Helper function to replace MOE v4 with HNWI in text content AND clean citations
    const replaceMoeV4 = (text: string | null | undefined): string => {
      if (!text || typeof text !== 'string') return text || ''
      return text
        .replace(/MOE v4/gi, 'HNWI')
        .replace(/MOE v\.4/gi, 'HNWI')
        .replace(/MOE version 4/gi, 'HNWI')
        .replace(/\bMOE\s+v4\b/gi, 'HNWI')
        // CRITICAL FIX: Remove newlines before citations at the SOURCE
        .replace(/\n+(\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*[^\]]+\])/gi, ' $1')
        .replace(/\s{2,}(\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*[^\]]+\])/gi, ' $1')
    }

    // Handle intelligence data structure
    const intel = intelligenceData_inner
    const rawDashboardFormat = intel.dashboard_format || {}

    // Apply MOE v4 replacement to dashboard format fields
    const dashboardFormat = Object.keys(rawDashboardFormat).reduce((acc: any, key: string) => {
      const value = rawDashboardFormat[key]
      acc[key] = typeof value === 'string' ? replaceMoeV4(value) : value
      return acc
    }, {})
    const quality = intel.quality || {}
    const metrics = intel.metrics || {}

    // Extract Victor opportunities data - use actual API response structure
    const { opportunity_analysis, individual_analyses } = opportunitiesData_inner
    const rawVictorOpportunities = individual_analyses || []

    // Transform API response fields to match UI expectations
    const victorOpportunities = rawVictorOpportunities.map((opp: any, index: number) => {
      // Extract the Victor analysis text - check all possible field names
      const victorAnalysisText = opp.victor_analysis ||
                                 opp.victor_reasoning ||
                                 opp.reasoning ||
                                 opp.analysis ||
                                 opp.recommendation ||
                                 opp.investment_thesis ||
                                 opp.summary ||
                                 // If opportunity_analysis exists, try to extract relevant part
                                 (opportunity_analysis ? `Opportunity ${index + 1}: ${opportunity_analysis.split('\n')[index] || ''}` : '') ||
                                 'Strategic investment analysis pending'

      return {
        ...opp,
        // Map API fields to UI fields with MOE v4 replacement
        title: replaceMoeV4(opp.title || opp.opportunity_title || opp.name || opp.opportunity_name || `Opportunity ${index + 1}`),
        value: opp.value || opp.investment_amount || opp.capital_required || opp.minimum_investment || 'TBD',
        investmentHorizon: opp.investmentHorizon || opp.investment_horizon || opp.time_horizon || opp.timeline || 'Medium-term',
        riskLevel: opp.riskLevel || opp.risk_level || opp.risk_rating || opp.risk || 'Medium',
        expectedReturn: opp.expectedReturn || opp.expected_return || opp.return_potential || opp.returns || 'Market Rate',
        description: replaceMoeV4(opp.description || opp.summary || opp.overview || 'Strategic investment opportunity'),
        // Victor analysis core fields with MOE v4 replacement
        victor_score: opp.victor_score || opp.score || opp.rating,
        victor_action: opp.victor_action,
        victor_reasoning: replaceMoeV4(victorAnalysisText),
        analysis: replaceMoeV4(victorAnalysisText),
        // Additional Victor intelligence fields with MOE v4 replacement
        strategic_insights: replaceMoeV4(opp.strategic_insights),
        pros: opp.pros,
        cons: opp.cons,
        confidence_level: opp.confidence_level,
        hnwi_alignment: replaceMoeV4(opp.hnwi_alignment || opp.moe_v4_alignment),
        elite_pulse_alignment: replaceMoeV4(opp.elite_pulse_alignment),
        risk_assessment: replaceMoeV4(opp.risk_assessment),
        opportunity_window: replaceMoeV4(opp.opportunity_window),
        // Keep any additional fields with MOE v4 replacement
        key_factors: replaceMoeV4(opp.key_factors),
        implementation: replaceMoeV4(opp.implementation)
      }
    })

    const juicyOpportunities = victorOpportunities.filter((opp: any) => opp.victor_score === 'JUICY')
    const moderateOpportunities = victorOpportunities.filter((opp: any) => opp.victor_score === 'MODERATE')
    const farFetchedOpportunities = victorOpportunities.filter((opp: any) => opp.victor_score === 'FAR_FETCHED')


    return {
      // Raw intelligence data for display
      rawIntelligence: intel,
      rawIntelligenceData: intelligenceData, // Complete raw endpoint response

      // Dashboard summary for metrics cards ONLY
      dashboardSummary: summaryData,

      // Metrics from summary endpoint
      confidence: summaryData.confidence,
      opportunities: summaryData.opportunities,
      totalOpportunityValue: summaryData.totalOpportunityValue,
      totalOpportunityValueDelta: summaryData.totalOpportunityValueDelta,
      peerSignals: summaryData.peerSignals,

      // Use Victor opportunities exclusively (NO MongoDB merging)
      realOpportunities: [], // Empty to force Victor-only data

      // Victor analysis opportunities (standalone for any not in real DB)
      victorOpportunities: victorOpportunities,
      juicyOpportunities: juicyOpportunities,
      moderateOpportunities: moderateOpportunities,
      farFetchedOpportunities: farFetchedOpportunities,

      // REAL Crown Vault data from MongoDB for Crown Vault Impact tab - prioritize over Katherine analysis
      realCrownVaultAssets: realCrownVaultAssets,
      realCrownVaultStats: realCrownVaultStats,

      // Katherine Crown Vault analysis data (fallback/supplementary)
      crownVaultAnalysis: crownVaultData,

      // Intelligence content for display
      intelligenceSummary: intel,
      dashboardFormat: dashboardFormat,
      generatedAt: intel.timestamp || intel.created_at || new Date().toISOString(),

      // Intelligence content sections with MOE v4 replacement
      executiveSummary: replaceMoeV4(dashboardFormat.executive_summary),
      marketIntelligence: replaceMoeV4(dashboardFormat.market_assessment),
      timingAnalysis: replaceMoeV4(dashboardFormat.timing_analysis),
      assetAllocation: replaceMoeV4(dashboardFormat.asset_allocation),
      implementationRoadmap: replaceMoeV4(dashboardFormat.implementation),
      fullRuschaData: replaceMoeV4(intel.ruscha_analysis || intel.intelligence),

      // Crown Vault specific data - PRIORITIZE real MongoDB data over Katherine analysis
      crownVaultSummary: realCrownVaultStats.last_updated ?
        `Last updated: ${new Date(realCrownVaultStats.last_updated).toLocaleDateString()}` :
        replaceMoeV4(crownVaultData.summary || crownVaultData.analysis_summary || crownVaultData.executive_summary),
      totalExposure: realCrownVaultStats.total_value ||
                     crownVaultData.total_exposure || crownVaultData.totalExposure || crownVaultData.total_value,
      impactedAssets: realCrownVaultAssets.length > 0 ? realCrownVaultAssets :
                     (crownVaultData.impacted_assets ||
                      crownVaultData.assets ||
                      crownVaultData.portfolio_assets ||
                      crownVaultData.user_analyses?.[0]?.impacted_assets ||
                      crownVaultData.user_analyses?.[0]?.assets ||
                      crownVaultData.individual_analyses ||
                      []),

      // Structured tier opportunities from intelligence - check multiple sources
      tier1Opportunities: (() => {
        // Try multiple sources for tier data - prioritize most specific sources first
        const sources = [
          intel.ruscha_analysis,
          intel.intelligence,
          intelligenceData_inner.ruscha_analysis,
          intelligenceData_inner.intelligence,
          dashboardFormat.implementation, // Implementation often has tier breakdown
          dashboardFormat.market_assessment,
          dashboardFormat.executive_summary
        ]

        let ruschaData = ''
        for (const source of sources) {
          if (source && typeof source === 'string' && source.length > 100) {
            // Check if this source has tier 1 specific data
            // Look for TIER 1 explicitly first
            if (source.toUpperCase().includes('TIER 1') ||
                source.toUpperCase().includes('TIER 1:') ||
                source.includes('$100K OPPORTUNITIES') ||
                source.includes('100K OPPORTUNITIES')) {
              ruschaData = source
              break
            }
            // Fallback: any source with TIER or 100K
            if (!ruschaData && (source.toUpperCase().includes('TIER') || source.includes('100K'))) {
              ruschaData = source
            }
          }
        }

        // If still no data, check the entire response
        if (!ruschaData) {
          const fullData = JSON.stringify(intelligenceData_inner)
          if (fullData.includes('TIER') || fullData.includes('100K')) {
            // Extract the relevant section
            const tierMatch = fullData.match(/TIER[^}]{0,5000}/i)
            if (tierMatch) {
              ruschaData = tierMatch[0]
            }
          }
        }

        let tier1 = extractRuschaTierOpportunities(ruschaData, 1)

        return tier1
      })(),
      tier2Opportunities: (() => {
        // Try multiple sources for tier data
        const sources = [
          intel.ruscha_analysis,
          intel.intelligence,
          intelligenceData_inner.ruscha_analysis,
          intelligenceData_inner.intelligence,
          dashboardFormat.executive_summary,
          dashboardFormat.implementation,
          dashboardFormat.market_assessment
        ]

        let ruschaData = ''
        for (const source of sources) {
          if (source && typeof source === 'string' && source.length > 100) {
            // Check if this source has tier data
            if (source.toUpperCase().includes('TIER') ||
                source.includes('500K') ||
                source.includes('$500,000')) {
              ruschaData = source
              break
            }
          }
        }

        // If still no data, check the entire response
        if (!ruschaData) {
          const fullData = JSON.stringify(intelligenceData_inner)
          if (fullData.includes('TIER') || fullData.includes('500K')) {
            ruschaData = fullData
          }
        }

        let tier2 = extractRuschaTierOpportunities(ruschaData, 2)
        return tier2
      })(),
      tier3Opportunities: (() => {
        // Try multiple sources for tier data
        const sources = [
          intel.ruscha_analysis,
          intel.intelligence,
          intelligenceData_inner.ruscha_analysis,
          intelligenceData_inner.intelligence,
          dashboardFormat.executive_summary,
          dashboardFormat.implementation,
          dashboardFormat.market_assessment
        ]

        let ruschaData = ''
        for (const source of sources) {
          if (source && typeof source === 'string' && source.length > 100) {
            // Check if this source has tier data
            if (source.toUpperCase().includes('TIER') ||
                source.includes('1M') ||
                source.includes('$1,000,000') ||
                source.includes('$1-10M')) {
              ruschaData = source
              break
            }
          }
        }

        // If still no data, check the entire response
        if (!ruschaData) {
          const fullData = JSON.stringify(intelligenceData_inner)
          if (fullData.includes('TIER') || fullData.includes('1M')) {
            ruschaData = fullData
          }
        }

        let tier3 = extractRuschaTierOpportunities(ruschaData, 3)
        return tier3
      })(),

      // Elite pulse data from intelligence
      elitePulseData: {
        marketIntelligence: dashboardFormat.market_assessment,
        timingCatalyst: dashboardFormat.timing_analysis,
        implementationRoadmap: dashboardFormat.implementation,
        source: 'intelligence_endpoint'
      },

      // Legacy fields for compatibility
      networkData: {},
      wealthFlowData: {}
    }
  }, [intelligenceData])

  useEffect(() => {
    // Only fetch if we haven't already
    if (!hasFetchedRef.current) {
      // TEMPORARY: Always bust cache for debugging
      const TEMPORARILY_DISABLE_CACHE = true;

      // Use cache busting if URL parameter is present (from clear-cache redirect)
      const shouldBustCache = TEMPORARILY_DISABLE_CACHE || (typeof window !== 'undefined' &&
        (window.location.search.includes('refresh=') || window.location.search.includes('bust_cache=true')));

      fetchIntelligence(shouldBustCache)
    }
  }, []) // Empty dependency array - only run once on mount

  // Listen for cache clearing events and force refresh
  useEffect(() => {
    const handleClearCache = () => {
      console.log('[Intelligence Data] Force refreshing due to cache clear')
      hasFetchedRef.current = false // Reset fetched flag
      fetchIntelligence(true) // Force refresh
    }

    window.addEventListener('dashboard:clear-cache', handleClearCache)
    window.addEventListener('app-data:clear-intelligence', handleClearCache)

    return () => {
      window.removeEventListener('dashboard:clear-cache', handleClearCache)
      window.removeEventListener('app-data:clear-intelligence', handleClearCache)
    }
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
