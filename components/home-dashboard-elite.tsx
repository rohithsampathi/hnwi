// components/home-dashboard-elite.tsx
// Interactive World Map Dashboard

"use client"

import React, { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import type { HomeDashboardEliteProps } from "@/types/dashboard"
import { CrownLoader } from "@/components/ui/crown-loader"
import { secureApi } from "@/lib/secure-api"
import type { City } from "@/components/interactive-world-map"
import { EliteCitationPanel } from "@/components/elite/elite-citation-panel"
import { extractDevIds } from "@/lib/parse-dev-citations"
import type { Citation } from "@/lib/parse-dev-citations"
import { useCitationManager } from "@/hooks/use-citation-manager"

// Dynamically import the map component with SSR disabled
const InteractiveWorldMap = dynamic(
  () => import("@/components/interactive-world-map").then(mod => mod.InteractiveWorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CrownLoader size="lg" text="Loading Global Intelligence" />
      </div>
    )
  }
)

interface Opportunity {
  title: string
  tier: string
  location: string
  latitude: number
  longitude: number
  country: string
  value: string
  risk: string
  analysis: string
  source: string
  victor_score?: string
  elite_pulse_analysis?: string
  category?: string  // Asset category from backend
  industry?: string  // Industry classification from backend
  product?: string   // Product type from backend
  start_date?: string  // Publish/start date
  executors?: Array<{
    name: string
    email?: string
    phone?: string
    role?: string
    strategic_trusted_partner?: boolean
    website?: string
    linkedin?: string
  }>
}

export function HomeDashboardElite({
  user,
  onNavigate,
  userData
}: HomeDashboardEliteProps) {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<string>('live') // Default: live data

  // Citation management
  const {
    citations: managedCitations,
    setCitations: setManagedCitations,
    citationMap,
    selectedCitationId,
    setSelectedCitationId,
    isPanelOpen,
    openCitation,
    closePanel
  } = useCitationManager()

  // Debug: Log when isPanelOpen changes
  useEffect(() => {
    console.log('🔔 isPanelOpen changed to:', isPanelOpen)
    console.log('🔔 managedCitations count:', managedCitations.length)
    if (isPanelOpen) {
      console.log('🎉 CITATION PANEL SHOULD NOW BE VISIBLE!')
    }
  }, [isPanelOpen, managedCitations])

  // Debug: Log when selectedCitationId changes
  useEffect(() => {
    console.log('🔔 selectedCitationId changed to:', selectedCitationId)
  }, [selectedCitationId])

  // Handle citation click from map popup
  const handleCitationClick = useCallback((citationId: string) => {
    console.log('🎯 handleCitationClick called with ID:', citationId)
    console.log('📚 Available citations:', managedCitations)
    console.log('🗺️ Citation map:', citationMap)
    console.log('📖 Opening citation...')
    openCitation(citationId)
    console.log('✅ Citation opened. Panel should be visible. isPanelOpen:', isPanelOpen)
  }, [openCitation, managedCitations, citationMap, isPanelOpen])

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        console.log(`🔍 Fetching opportunities from API (timeframe: ${timeframe})...`)
        const apiUrl = timeframe === 'live'
          ? '/api/command-centre/opportunities?include_crown_vault=true&include_executors=true'
          : `/api/command-centre/opportunities?timeframe=${timeframe}&include_crown_vault=true&include_executors=true`

        const response = await secureApi.get(apiUrl, true, {
          enableCache: true,
          cacheDuration: 600000 // 10 minutes
        })

        console.log('📊 API Response:', response)
        console.log('✅ Success:', response.success)
        console.log('📈 Total opportunities:', response.opportunities?.length || 0)

        if (response.success && response.opportunities) {
          console.log('🗺️ First 5 opportunities:', response.opportunities.slice(0, 5))

          // Debug: Check Four Seasons Alpina value
          const fourSeasonsOpp = response.opportunities.find((opp: Opportunity) =>
            opp.title?.toLowerCase().includes('four seasons') && opp.title?.toLowerCase().includes('alpina')
          )
          if (fourSeasonsOpp) {
            console.log('🏔️ Four Seasons Alpina - Backend value:', fourSeasonsOpp.value)
            console.log('🏔️ Four Seasons Alpina - Full data:', fourSeasonsOpp)
          }

          // Debug: Check if executors are in the response
          const oppsWithExecutors = response.opportunities.filter((opp: Opportunity) => opp.executors && opp.executors.length > 0)
          console.log(`👥 Opportunities with executors: ${oppsWithExecutors.length} out of ${response.opportunities.length}`)
          if (oppsWithExecutors.length > 0) {
            console.log('👥 First opportunity with executors:', oppsWithExecutors[0])
          }

          // Debug: Check if backend is sending category/industry/product
          const oppsWithCategory = response.opportunities.filter((opp: Opportunity) => opp.category || opp.industry || opp.product)
          console.log(`🏷️ Opportunities with category/industry/product: ${oppsWithCategory.length} out of ${response.opportunities.length}`)
          if (oppsWithCategory.length > 0) {
            console.log('🏷️ First opportunity with metadata:', {
              title: oppsWithCategory[0].title,
              category: oppsWithCategory[0].category,
              industry: oppsWithCategory[0].industry,
              product: oppsWithCategory[0].product
            })
          } else {
            console.warn('⚠️ Backend is NOT sending category/industry/product fields - using text matching for icons')
          }

          // Transform opportunities to city format for the map
          const cityData: City[] = response.opportunities
            .map((opp: Opportunity, index: number) => {
              // Use backend coordinates directly - no overrides
              let lat = opp.latitude
              let lng = opp.longitude
              let displayName = opp.location || opp.country || opp.title || 'Opportunity'

              // Log what we received from backend
              console.log(`📍 Using backend coordinates for "${opp.title}":`, {
                latitude: lat,
                longitude: lng,
                location: opp.location,
                country: opp.country
              })

              // Validate coordinates are within valid range
              if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
                console.warn(`⚠️ Invalid coordinates for "${opp.title}": lat=${lat}, lng=${lng}`)
                // Skip this opportunity if coordinates are invalid
                return null
              }

              // Warn if coordinates are (0, 0) - likely missing data
              if (lat === 0 && lng === 0) {
                console.warn(`⚠️ Missing coordinates (0,0) for "${opp.title}" - skipping`)
                return null
              }

              // Extract citations from analysis text
              const analysisText = opp.analysis || opp.elite_pulse_analysis || ''
              const devIds = extractDevIds(analysisText)

              return {
                name: displayName,
                country: opp.country || 'Unknown',
                latitude: lat,
                longitude: lng,
                population: opp.value,
                type: opp.source === "MOEv4" ? "finance" : "luxury",
                // Include full opportunity data
                title: opp.title,
                tier: opp.tier,
                value: opp.value,
                risk: opp.risk,
                analysis: opp.analysis,
                source: opp.source,
                victor_score: opp.victor_score,
                elite_pulse_analysis: opp.elite_pulse_analysis,
                // Category/Industry/Product from backend
                category: opp.category,
                industry: opp.industry,
                product: opp.product,
                start_date: opp.start_date,
                // Citation data
                devIds: devIds,
                hasCitations: devIds.length > 0,
                // Executor data
                executors: opp.executors
              }
            })
            .filter((city): city is City => city !== null) // Remove null entries

          console.log('🌍 Transformed cities:', cityData)

          // Debug: Check if executors made it to city data
          const citiesWithExecutors = cityData.filter(city => city.executors && city.executors.length > 0)
          console.log(`👥 Cities with executors: ${citiesWithExecutors.length} out of ${cityData.length}`)
          if (citiesWithExecutors.length > 0) {
            console.log('👥 First city with executors:', {
              title: citiesWithExecutors[0].title,
              executors: citiesWithExecutors[0].executors
            })
          }

          // Extract all citations across all opportunities
          const allCitations: Citation[] = []
          const seenIds = new Set<string>()
          let citationNumber = 1

          cityData.forEach(city => {
            if (city.devIds && city.devIds.length > 0) {
              city.devIds.forEach(devId => {
                if (!seenIds.has(devId)) {
                  seenIds.add(devId)
                  allCitations.push({
                    id: devId,
                    number: citationNumber++,
                    originalText: `[Dev ID: ${devId}]`
                  })
                }
              })
            }
          })

          if (allCitations.length > 0) {
            console.log(`📚 Found ${allCitations.length} total citations across opportunities`)
            setManagedCitations(allCitations)
          }

          setCities(cityData)
        } else {
          console.warn('⚠️ No opportunities in response')
        }
      } catch (error) {
        console.error('❌ Error fetching opportunities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunities()
  }, [timeframe]) // Re-fetch when timeframe changes

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CrownLoader size="lg" text="Loading Global Intelligence" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ marginTop: '40px' }}>
      <InteractiveWorldMap
        width="100%"
        height="100%"
        showControls={true}
        cities={cities}
        onCitationClick={handleCitationClick}
      />

      {/* Date Range Selector - Top Right */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg">
          <select
            value={timeframe}
            onChange={(e) => {
              setTimeframe(e.target.value)
              setLoading(true)
            }}
            className="px-4 py-2 bg-transparent text-sm font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
          >
            <option value="live">🔴 Live Data</option>
            <option value="7D">📅 Last 7 Days</option>
            <option value="14D">📅 Last 14 Days</option>
            <option value="21D">📅 Last 21 Days</option>
            <option value="1M">📅 Last Month</option>
            <option value="3M">📅 Last 3 Months</option>
            <option value="6M">📅 Last 6 Months</option>
          </select>
        </div>
      </div>

      {/* Citation Panel - Desktop: 3rd panel on right side */}
      {isPanelOpen && (
        <div className="hidden md:block fixed right-0 top-0 h-full w-96 z-[3000] bg-background shadow-2xl border-l border-border">
          <EliteCitationPanel
            citations={managedCitations}
            selectedCitationId={selectedCitationId}
            onClose={closePanel}
            onCitationSelect={setSelectedCitationId}
          />
        </div>
      )}

      {/* Citation Panel - Mobile: Popup modal overlay */}
      {isPanelOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
            <EliteCitationPanel
              citations={managedCitations}
              selectedCitationId={selectedCitationId}
              onClose={closePanel}
              onCitationSelect={setSelectedCitationId}
            />
          </div>
        </div>
      )}
    </div>
  )
}
