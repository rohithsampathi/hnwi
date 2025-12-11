// components/interactive-world-map.tsx
// React Leaflet - Best-in-class open source map library
// Full documentation: https://react-leaflet.js.org/

"use client"

import React, { useState, useMemo, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { useTheme } from "@/contexts/theme-context"
import "leaflet/dist/leaflet.css"

// Components
import { FlyToCity, ResetView, MapClickHandler, ZoomTracker } from "@/components/map/map-helpers"
import { MapFilterControlsMobile, MapFilterControlsDesktop } from "@/components/map/map-filter-controls"
import { MapPopupCluster } from "@/components/map/map-popup-cluster"
import { MapPopupSingle } from "@/components/map/map-popup-single"
import { MapStyles } from "@/components/map/map-styles"

// Utilities
import {
  createColorScale,
  calculateValueRanking,
  getColorFromValue,
  clusterCities as clusterCitiesFn,
  createPriceRangeMatcher
} from "@/lib/map-color-utils"
import { createCustomIcon, createClusterIcon } from "@/lib/map-markers"

export interface City {
  name: string
  country: string
  latitude: number
  longitude: number
  population?: string
  type?: string
  // Opportunity data
  _id?: string
  id?: string
  title?: string
  tier?: string
  value?: string
  risk?: string
  analysis?: string
  source?: string
  victor_score?: string
  elite_pulse_analysis?: string
  category?: string
  industry?: string
  product?: string
  start_date?: string
  is_new?: boolean
  // Citation data
  devIds?: string[]
  hasCitations?: boolean
  // Executor data
  executors?: Array<{
    name: string
    email?: string
    phone?: string
    role?: string
    strategic_trusted_partner?: boolean
    website?: string
    linkedin?: string
  }>
  // Price data (from command centre for Crown Vault assets)
  cost_per_unit?: number
  unit_count?: number
  current_price?: number
  entry_price?: number
  appreciation?: {
    percentage: number
    absolute: number
    annualized: number
    time_held_days: number
  }
  price_history?: Array<{
    timestamp: string
    price: number
    source: 'manual' | 'katherine_analysis' | 'system'
    confidence_score?: number
    notes?: string
  }>
  last_price_update?: string
  // Katherine AI analysis text
  katherine_analysis?: string
}

interface InteractiveWorldMapProps {
  width?: number | string
  height?: number | string
  showControls?: boolean
  cities?: City[]
  onCitationClick?: (citationId: string) => void
  citationMap?: Map<string, number>
  onNavigate?: (route: string) => void
  // Filter controls
  showCrownAssets?: boolean
  showPriveOpportunities?: boolean
  showHNWIPatterns?: boolean
  onToggleCrownAssets?: () => void
  onTogglePriveOpportunities?: () => void
  onToggleHNWIPatterns?: () => void
  hideCrownAssetsToggle?: boolean // Hide Crown Assets toggle (for assessment)
  useAbsolutePositioning?: boolean // Use absolute positioning for controls (assessment mode)
}

export function InteractiveWorldMap({
  width = "100%",
  height = "100%",
  showControls = true,
  cities = [],
  onCitationClick,
  citationMap,
  onNavigate,
  showCrownAssets = true,
  showPriveOpportunities = true,
  showHNWIPatterns = true,
  onToggleCrownAssets,
  onTogglePriveOpportunities,
  onToggleHNWIPatterns,
  hideCrownAssetsToggle = false,
  useAbsolutePositioning = false
}: InteractiveWorldMapProps) {
  const { theme } = useTheme()

  // State
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [flyToCity, setFlyToCity] = useState<City | null>(null)
  const [resetView, setResetView] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(1.8)
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null)
  const [cityToExpand, setCityToExpand] = useState<City | null>(null)
  const [openClusterId, setOpenClusterId] = useState<string | null>(null)
  const [forceRender, setForceRender] = useState(0)
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000000 })
  const markerRefs = React.useRef<Map<string, any>>(new Map())

  // ROOT FIX: Store scroll positions at MAP level, keyed by clusterId
  // This survives all re-renders caused by city updates during calibration
  const [clusterScrollPositions, setClusterScrollPositions] = useState<Map<string, number>>(new Map())

  // Callback to update scroll position for a cluster
  const updateScrollPosition = useCallback((clusterId: string, position: number) => {
    setClusterScrollPositions(prev => {
      const next = new Map(prev)
      next.set(clusterId, position)
      return next
    })
  }, [])

  // Tile layer URL based on theme
  const tileUrl = theme === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"

  // Create color scale (1000 colors)
  const colorScale = useMemo(() => createColorScale(), [])

  // Calculate value rankings
  const { minValue, maxValue, valueRankMap } = useMemo(
    () => calculateValueRanking(cities),
    [cities]
  )

  // Price range matcher
  const matchesPriceRange = useMemo(
    () => createPriceRangeMatcher(selectedPriceRange),
    [selectedPriceRange]
  )

  // Cluster cities by location
  const clusterCities = useMemo(
    () => clusterCitiesFn(cities, currentZoom, matchesPriceRange),
    [cities, currentZoom, matchesPriceRange]
  )

  // Get color from value (memoized callback)
  const getColor = useCallback(
    (value: string | undefined) => getColorFromValue(value, valueRankMap, colorScale),
    [valueRankMap, colorScale]
  )

  // Generate stable cluster ID from coordinates
  const getClusterId = useCallback((city: City) => {
    return `${city.latitude.toFixed(6)}-${city.longitude.toFixed(6)}`
  }, [])

  // Handle city click
  const handleCityClick = useCallback((city: City, clusterId: string, expandDetails: boolean = false) => {
    setSelectedCity(city)
    setFlyToCity(city)
    setOpenClusterId(clusterId)

    if (expandDetails) {
      setCityToExpand(city)
    } else {
      setCityToExpand(null)
    }

    // Open the popup after a small delay
    setTimeout(() => {
      const markerKey = `${city.latitude}-${city.longitude}-${city.title}`
      const markerRef = markerRefs.current.get(markerKey)
      if (markerRef) {
        markerRef.openPopup()
      }
    }, 100)
  }, [])

  // Auto-expand details after zoom completes
  React.useEffect(() => {
    if (cityToExpand && currentZoom >= 7) {
      const timer = setTimeout(() => {
        const clusterId = getClusterId(cityToExpand)
        setExpandedClusterId(clusterId)

        const markerKey = `${cityToExpand.latitude}-${cityToExpand.longitude}-${cityToExpand.title}`
        const markerRef = markerRefs.current.get(markerKey)

        if (markerRef) {
          setTimeout(() => {
            markerRef.openPopup()
          }, 200)
        }

        setCityToExpand(null)
      }, 2600)

      return () => clearTimeout(timer)
    }
  }, [cityToExpand, currentZoom, getClusterId])

  // Handle map reset
  const handleReset = useCallback(() => {
    setFlyToCity(null)
    setSelectedCity(null)
    setOpenClusterId(null)
    setExpandedClusterId(null)
    setResetView(true)
    setForceRender(prev => prev + 1)

    markerRefs.current.forEach((markerRef) => {
      if (markerRef && markerRef.closePopup) {
        markerRef.closePopup()
      }
    })
  }, [])

  // Handle map clicks
  const handleMapClick = useCallback(() => {
    setOpenClusterId(null)
    setExpandedClusterId(null)
    setSelectedCity(null)
    setFlyToCity(null)
    setCityToExpand(null)

    markerRefs.current.forEach((markerRef) => {
      if (markerRef && markerRef.closePopup) {
        markerRef.closePopup()
      }
    })

    setTimeout(() => {
      setForceRender(prev => prev + 1)
    }, 10)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={1.8}
        minZoom={1.8}
        maxZoom={18}
        style={{ width: "100%", height: "100%", position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        zoomControl={false}
        scrollWheelZoom={true}
        attributionControl={false}
        worldCopyJump={true}
      >
        <TileLayer url={tileUrl} noWrap={false} />

        {/* Clustered City Markers */}
        {clusterCities.map((cluster, clusterIndex) => {
          const isCluster = cluster.cities.length > 1
          const center = cluster.center
          const clusterId = getClusterId(center)

          // Determine primary type for cluster
          let primaryType = "pin"
          if (isCluster) {
            const typeCounts = cluster.cities.reduce((acc, city) => {
              const type = city.type || "pin"
              acc[type] = (acc[type] || 0) + 1
              return acc
            }, {} as Record<string, number>)

            primaryType = Object.entries(typeCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
          }

          const markerKey = `${center.latitude}-${center.longitude}-${center.title}`
          const isOpen = openClusterId === clusterId

          return (
            <Marker
              key={`marker-${center._id || center.id || ''}-${center.latitude.toFixed(6)}-${center.longitude.toFixed(6)}-${center.title || ''}`}
              position={[center.latitude, center.longitude]}
              icon={isCluster
                ? createClusterIcon(cluster.cities.length, primaryType, theme)
                : createCustomIcon(center, clusterIndex, theme, getColor, isOpen ? clusterIndex : null)
              }
              ref={(ref) => {
                if (ref) {
                  markerRefs.current.set(markerKey, ref)
                }
              }}
              eventHandlers={{
                click: () => {
                  if (!isCluster) {
                    handleCityClick(center, clusterId)
                  } else {
                    // For clusters, open the popup to show all cities
                    const markerKey = `${center.latitude}-${center.longitude}-${center.title}`
                    const markerRef = markerRefs.current.get(markerKey)
                    if (markerRef) {
                      markerRef.openPopup()
                    }
                    setOpenClusterId(clusterId)
                    setSelectedCity(center)
                    setFlyToCity(center)
                  }
                }
              }}
            >
              <Popup
                key={`popup-${center._id || center.id || ''}-${center.latitude}-${center.longitude}`}
                maxWidth={isCluster ? 500 : 400}
                autoPan={false}
                keepInView={false}
                onOpen={() => {
                  setOpenClusterId(clusterId)
                  if (!cityToExpand) {
                    setExpandedClusterId(null)
                  }
                }}
                onClose={() => {
                  setTimeout(() => {
                    setOpenClusterId(null)
                    setExpandedClusterId(null)
                    setSelectedCity(null)
                    setFlyToCity(null)
                    setCityToExpand(null)

                    setTimeout(() => {
                      setForceRender(prev => prev + 1)
                    }, 10)
                  }, 0)
                }}
              >
                {isCluster ? (
                  <MapPopupCluster
                    cities={cluster.cities}
                    theme={theme}
                    onCityClick={(city) => {
                      const targetClusterId = getClusterId(city)
                      handleCityClick(city, targetClusterId, true)
                    }}
                    clusterCities={clusterCities}
                    clusterIndex={clusterIndex}
                  />
                ) : (
                  <MapPopupSingle
                    city={center}
                    theme={theme}
                    expandedClusterId={expandedClusterId}
                    clusterId={clusterId}
                    onExpand={() => setExpandedClusterId(expandedClusterId === clusterId ? null : clusterId)}
                    onCitationClick={onCitationClick}
                    citationMap={citationMap}
                    onNavigate={onNavigate}
                    scrollPosition={clusterScrollPositions.get(clusterId) || 0}
                    onScrollPositionChange={updateScrollPosition}
                  />
                )}
              </Popup>
            </Marker>
          )
        })}

        {/* Map Helper Components */}
        <FlyToCity city={flyToCity} />
        <ResetView shouldReset={resetView} onReset={() => setResetView(false)} />
        <MapClickHandler onMapClick={handleMapClick} />
        <ZoomTracker onZoomChange={setCurrentZoom} />
      </MapContainer>

      {/* Filter Controls - Mobile */}
      {onToggleCrownAssets && onTogglePriveOpportunities && onToggleHNWIPatterns && (
        <MapFilterControlsMobile
          selectedPriceRange={selectedPriceRange}
          onPriceRangeChange={setSelectedPriceRange}
          showCrownAssets={showCrownAssets}
          showPriveOpportunities={showPriveOpportunities}
          showHNWIPatterns={showHNWIPatterns}
          onToggleCrownAssets={onToggleCrownAssets}
          onTogglePriveOpportunities={onTogglePriveOpportunities}
          onToggleHNWIPatterns={onToggleHNWIPatterns}
          onReset={handleReset}
          theme={theme}
          currentZoom={currentZoom}
          hideCrownAssetsToggle={hideCrownAssetsToggle}
          useAbsolutePositioning={useAbsolutePositioning}
        />
      )}

      {/* Filter Controls - Desktop */}
      {onToggleCrownAssets && onTogglePriveOpportunities && onToggleHNWIPatterns && (
        <MapFilterControlsDesktop
          selectedPriceRange={selectedPriceRange}
          onPriceRangeChange={setSelectedPriceRange}
          showCrownAssets={showCrownAssets}
          showPriveOpportunities={showPriveOpportunities}
          showHNWIPatterns={showHNWIPatterns}
          onToggleCrownAssets={onToggleCrownAssets}
          onTogglePriveOpportunities={onTogglePriveOpportunities}
          onToggleHNWIPatterns={onToggleHNWIPatterns}
          onReset={handleReset}
          theme={theme}
          currentZoom={currentZoom}
          hideCrownAssetsToggle={hideCrownAssetsToggle}
          useAbsolutePositioning={useAbsolutePositioning}
        />
      )}

      {/* Map Styles */}
      <MapStyles theme={theme} />
    </div>
  )
}
