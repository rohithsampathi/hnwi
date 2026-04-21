// components/pages/map-page.tsx
// Dedicated full-screen map page with same filters as home dashboard

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { InteractiveWorldMap, City } from "@/components/interactive-world-map"
import { CrownLoader } from "@/components/ui/crown-loader"
import { useToast } from "@/components/ui/use-toast"
import { getCommandCentreOpportunities } from "@/lib/api"
import { usePageDataCache } from "@/contexts/page-data-cache-context"

export function MapPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { getCachedData, setCachedData, isCacheValid } = usePageDataCache()

  // Cache key for map data
  const cacheKey = 'global-map-opportunities'
  const cachedData = getCachedData(cacheKey)
  const hasValidCache = isCacheValid(cacheKey)

  // State
  const [cities, setCities] = useState<City[]>(cachedData?.cities || [])
  const [isLoading, setIsLoading] = useState(true)
  const [showCrownAssets, setShowCrownAssets] = useState(true)
  const [showPriveOpportunities, setShowPriveOpportunities] = useState(true)
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true)

  // Fetch map data (Crown Vault + Privé + HNWI patterns)
  const fetchMapData = useCallback(async (forceRefresh = false) => {
    try {
      // Show cached data immediately if present, but always refresh the LIVE map in the background.
      if (!forceRefresh && hasValidCache && cachedData?.cities?.length > 0) {
        setCities(cachedData.cities)
      }

      setIsLoading(true)

      const commandCentreData = await getCommandCentreOpportunities({
        includeCrownVault: true,
        view: 'all',
        timeframe: 'LIVE',
        bustCache: true
      })

      const allCities: City[] = []

      // Process unified Command Centre opportunities
      if (Array.isArray(commandCentreData)) {
        const opportunityCities = commandCentreData
          .filter((opp: any) => opp.latitude && opp.longitude)
          .map((opp: any) => ({
            _id: opp._id || opp.id || opp.opportunity_id,
            id: opp.id || opp._id || opp.opportunity_id,
            name: opp.location || opp.title,
            country: opp.country || opp.product || 'Unknown',
            latitude: Number(opp.latitude),
            longitude: Number(opp.longitude),
            type:
              opp.source === 'User Crown Vault'
                ? 'crown'
                : opp.source === 'Privé Exchange'
                  ? 'prive'
                  : 'hnwi',
            title: opp.title,
            tier: opp.tier,
            value: opp.value || opp.minimum_investment_display || opp.minimum_investment_usd?.toString() || '0',
            category: opp.category,
            industry: opp.industry,
            product: opp.product,
            analysis: opp.analysis,
            elite_pulse_analysis: opp.elite_pulse_analysis,
            victor_score: opp.victor_score || opp.prive_rating,
            risk: opp.risk_level || opp.risk || 'medium',
            source: opp.source,
            start_date: opp.start_date || opp.date,
            devIds: opp.devIds || opp.dev_ids || (opp.devid ? [opp.devid] : undefined),
            hasCitations: Array.isArray(opp.devIds || opp.dev_ids) ? true : !!opp.devid,
            is_new: opp.is_new || false
          }))
        allCities.push(...opportunityCities)
      }

      setCities(allCities)

      // Cache the combined data briefly as a fallback, but never trust it as the source of truth.
      setCachedData(cacheKey, {
        cities: allCities,
        timestamp: Date.now(),
        ttl: 30000
      }, 30000)

    } catch (error) {
      toast({
        title: "Loading Error",
        description: "Unable to load map data. Using cached version if available.",
        variant: "destructive",
        duration: 3000,
      })

      // Keep existing data on error
    } finally {
      setIsLoading(false)
    }
  }, [hasValidCache, cachedData, cacheKey, setCachedData, toast])

  // Initial load
  useEffect(() => {
    fetchMapData()
  }, [fetchMapData])

  // Filter cities based on toggle states
  const filteredCities = cities.filter(city => {
    if (city.type === 'crown' && !showCrownAssets) return false
    if (city.type === 'prive' && !showPriveOpportunities) return false
    if (city.type === 'hnwi' && !showHNWIPatterns) return false
    return true
  })

  // Handle navigation
  const handleNavigate = (route: string) => {
    if (route === "back" || route === "dashboard") {
      router.push("/dashboard")
    } else if (route.startsWith("opportunity/")) {
      const opportunityId = route.split("/")[1]
      router.push(`/opportunity/${opportunityId}`)
    } else {
      router.push(`/${route}`)
    }
  }

  if (isLoading && cities.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <CrownLoader size="lg" text="Loading global intelligence..." />
      </div>
    )
  }

  return (
    <div className="w-full h-screen fixed top-0 left-0 right-0 bottom-0">
      <InteractiveWorldMap
        cities={filteredCities}
        showControls={true}
        showCrownAssets={showCrownAssets}
        showPriveOpportunities={showPriveOpportunities}
        showHNWIPatterns={showHNWIPatterns}
        onToggleCrownAssets={() => setShowCrownAssets(prev => !prev)}
        onTogglePriveOpportunities={() => setShowPriveOpportunities(prev => !prev)}
        onToggleHNWIPatterns={() => setShowHNWIPatterns(prev => !prev)}
        onNavigate={handleNavigate}
        showCrisisOverlay={true}
      />
    </div>
  )
}
