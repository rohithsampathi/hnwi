// components/interactive-world-map-refactored.tsx
// Interactive World Map - Refactored Modular Version
// React Leaflet - Best-in-class open source map library
// Full documentation: https://react-leaflet.js.org/

"use client"

import React, { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet"
import { useTheme } from "@/contexts/theme-context"
import { MapPin, Crown, Linkedin, Globe } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { CitationText } from "@/components/elite/citation-text"
import chroma from "chroma-js"

// Import modular utilities
import { parseValueToNumber, formatLabel, formatValue, formatSource, cleanTitle, cleanAnalysisText, generateTier } from "@/lib/map-utils"
import { createCustomIcon, createClusterIcon } from "@/lib/map-markers"
import { MapFilterControlsMobile, MapFilterControlsDesktop } from "@/components/map/map-filter-controls"

export interface City {
  name: string
  country: string
  latitude: number
  longitude: number
  population?: string
  type?: string
  // Opportunity data
  _id?: string  // MongoDB ID for deep linking
  id?: string   // Alternative ID field
  title?: string
  tier?: string
  value?: string
  risk?: string
  analysis?: string
  source?: string
  victor_score?: string
  elite_pulse_analysis?: string
  category?: string  // Asset category from backend
  industry?: string  // Industry classification from backend
  product?: string   // Product type from backend
  start_date?: string  // Publish/start date for the opportunity
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
}

interface InteractiveWorldMapProps {
  width?: number | string
  height?: number | string
  showControls?: boolean
  cities?: City[]
  onCitationClick?: (citationId: string) => void
  citationMap?: Map<string, number>  // Global citation numbering map
  onNavigate?: (route: string) => void  // Navigation handler for deep linking
  // Filter controls
  showCrownAssets?: boolean
  showPriveOpportunities?: boolean
  showHNWIPatterns?: boolean
  onToggleCrownAssets?: () => void
  onTogglePriveOpportunities?: () => void
  onToggleHNWIPatterns?: () => void
}

// Component to fly to city
function FlyToCity({ city, zoomLevel = 8 }: { city: City | null; zoomLevel?: number }) {
  const map = useMap()

  React.useEffect(() => {
    if (city) {
      const currentZoom = map.getZoom()
      const targetZoom = Math.max(currentZoom, zoomLevel)

      map.flyTo([city.latitude, city.longitude], targetZoom, {
        duration: 2.5,
        easeLinearity: 0.15,
        animate: true,
        offset: [0, -150]
      })
    }
  }, [city, map, zoomLevel])

  return null
}

// Component to reset view
function ResetView({ shouldReset, onReset }: { shouldReset: boolean, onReset: () => void }) {
  const map = useMap()

  React.useEffect(() => {
    if (shouldReset) {
      map.flyTo([20, 0], 2, {
        duration: 3.5,
        easeLinearity: 0.15,
        animate: true
      })
      setTimeout(() => {
        onReset()
      }, 3600)
    }
  }, [shouldReset, map, onReset])

  return null
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  const map = useMap()

  React.useEffect(() => {
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const target = e.originalEvent.target as HTMLElement

      if (target.classList.contains('leaflet-container') ||
          target.classList.contains('leaflet-tile') ||
          target.classList.contains('leaflet-tile-pane') ||
          target.parentElement?.classList.contains('leaflet-tile-pane')) {
        onMapClick()
      }
    }

    map.on('click', handleMapClick)
    return () => {
      map.off('click', handleMapClick)
    }
  }, [map, onMapClick])

  return null
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
  onToggleHNWIPatterns
}: InteractiveWorldMapProps) {
  const { theme } = useTheme()
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [flyToCity, setFlyToCity] = useState<City | null>(null)
  const [resetView, setResetView] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(2)
  const [expandedPopupIndex, setExpandedPopupIndex] = useState<number | null>(null)
  const [cityToExpand, setCityToExpand] = useState<City | null>(null)
  const [openPopupIndex, setOpenPopupIndex] = useState<number | null>(null)
  const [forceRender, setForceRender] = useState(0)
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all')
  const markerRefs = React.useRef<Map<string, any>>(new Map())

  // Check if city value falls within selected price range
  const matchesPriceRange = React.useCallback((city: City): boolean => {
    if (selectedPriceRange === 'all') return true

    const value = parseValueToNumber(city.value || city.population)

    switch (selectedPriceRange) {
      case '0-100k':
        return value >= 0 && value < 100000
      case '100k-500k':
        return value >= 100000 && value < 500000
      case '500k-1m':
        return value >= 500000 && value < 1000000
      case '1m+':
        return value >= 1000000
      default:
        return true
    }
  }, [selectedPriceRange])

  // Calculate min/max values AND create sorted value map for rank-based coloring
  const { minValue, maxValue, valueRankMap } = React.useMemo(() => {
    const values = cities
      .map(city => parseValueToNumber(city.value || city.population))
      .filter(val => val > 0)

    if (values.length === 0) {
      return { minValue: 0, maxValue: 1000000, valueRankMap: new Map() }
    }

    const min = Math.min(...values)
    const max = Math.max(...values)

    const uniqueValues = [...new Set(values)].sort((a, b) => a - b)
    const rankMap = new Map<number, number>()

    uniqueValues.forEach((value, index) => {
      const position = uniqueValues.length > 1 ? index / (uniqueValues.length - 1) : 0
      rankMap.set(value, position)
    })

    return { minValue: min, maxValue: max, valueRankMap: rankMap }
  }, [cities])

  // Spread markers at same location in a grid pattern
  const clusterCities = React.useMemo(() => {
    const filteredByPrice = cities.filter(matchesPriceRange)

    const locationGroups = new Map<string, City[]>()

    filteredByPrice.forEach(city => {
      const key = `${city.latitude.toFixed(6)},${city.longitude.toFixed(6)}`
      if (!locationGroups.has(key)) {
        locationGroups.set(key, [])
      }
      locationGroups.get(key)!.push(city)
    })

    const spreadCities: Array<{ cities: [City]; center: City }> = []

    locationGroups.forEach((citiesAtLocation, locationKey) => {
      if (citiesAtLocation.length === 1) {
        spreadCities.push({
          cities: [citiesAtLocation[0]],
          center: citiesAtLocation[0]
        })
      } else {
        const count = citiesAtLocation.length
        const gridSize = Math.ceil(Math.sqrt(count))

        const getGridSpacing = (zoom: number) => {
          if (zoom <= 3) return 0.010
          if (zoom <= 5) return 0.005
          if (zoom <= 7) return 0.003
          if (zoom <= 9) return 0.0015
          return 0.00008
        }

        const spacing = getGridSpacing(currentZoom)

        citiesAtLocation.forEach((city, index) => {
          const row = Math.floor(index / gridSize)
          const col = index % gridSize

          const centerOffset = (gridSize - 1) / 2
          const offsetLat = (row - centerOffset) * spacing
          const offsetLng = (col - centerOffset) * spacing / Math.cos(city.latitude * Math.PI / 180)

          const spreadCity = {
            ...city,
            latitude: city.latitude + offsetLat,
            longitude: city.longitude + offsetLng
          }

          spreadCities.push({
            cities: [spreadCity],
            center: spreadCity
          })
        })
      }
    })

    return spreadCities
  }, [cities, currentZoom, matchesPriceRange])

  // Tile layer URL based on theme
  const tileUrl = theme === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"

  // Create chroma.js color scale with 1000+ smooth shades
  const colorScale = React.useMemo(() => {
    const scale = chroma.scale([
      '#0d5c3a', '#17a561', '#2dd17f', '#50e991', '#ffd700',
      '#ffb000', '#ff8c00', '#e63946', '#c1121f', '#800020'
    ]).mode('lch')

    return scale.colors(1000)
  }, [])

  // Get color based on value
  const getColorFromValue = React.useCallback((value: string | undefined): string => {
    const numValue = parseValueToNumber(value)

    if (numValue === 0 || valueRankMap.size === 0) {
      return colorScale[499]
    }

    const position = valueRankMap.get(numValue) ?? 0.5
    const colorIndex = Math.floor(position * 999)
    const color = colorScale[colorIndex]

    return color
  }, [valueRankMap, colorScale])

  const handleCityClick = (city: City, clusterIndex: number, expandDetails: boolean = false) => {
    setSelectedCity(city)
    setFlyToCity(city)
    setOpenPopupIndex(clusterIndex)

    if (expandDetails) {
      setCityToExpand(city)
    } else {
      setCityToExpand(null)
    }

    setTimeout(() => {
      const markerKey = `${city.latitude}-${city.longitude}-${city.title}`
      const markerRef = markerRefs.current.get(markerKey)
      if (markerRef) {
        markerRef.openPopup()
      }
    }, 100)
  }

  // Effect to auto-expand details after zoom completes
  React.useEffect(() => {
    if (cityToExpand && currentZoom >= 7) {
      const timer = setTimeout(() => {
        const clusterIdx = clusterCities.findIndex(cluster =>
          cluster.cities.some(c =>
            c.latitude === cityToExpand.latitude &&
            c.longitude === cityToExpand.longitude &&
            c.title === cityToExpand.title
          )
        )

        if (clusterIdx !== -1) {
          setExpandedPopupIndex(clusterIdx)

          const markerKey = `${cityToExpand.latitude}-${cityToExpand.longitude}-${cityToExpand.title}`
          const markerRef = markerRefs.current.get(markerKey)

          if (markerRef) {
            setTimeout(() => {
              markerRef.openPopup()
            }, 200)
          }

          setCityToExpand(null)
        }
      }, 2600)

      return () => clearTimeout(timer)
    }
  }, [cityToExpand, currentZoom, clusterCities])

  const handleReset = () => {
    setFlyToCity(null)
    setSelectedCity(null)
    setOpenPopupIndex(null)
    setExpandedPopupIndex(null)
    setResetView(true)
    setForceRender(prev => prev + 1)

    markerRefs.current.forEach((markerRef) => {
      if (markerRef && markerRef.closePopup) {
        markerRef.closePopup()
      }
    })
  }

  // Handle map clicks - reset icons to dots
  const handleMapClick = React.useCallback(() => {
    setOpenPopupIndex(null)
    setExpandedPopupIndex(null)
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

  // Map opportunity to executor filters helper
  const mapToExecutorFilters = (opp: City) => {
    const industry = (opp.industry || '').toLowerCase()
    const category = (opp.category || '').toLowerCase()
    const product = (opp.product || '').toLowerCase()
    const title = (opp.title || '').toLowerCase()
    const combined = `${industry} ${category} ${product} ${title}`

    if (combined.includes('real estate') || combined.includes('property') ||
        combined.includes('apartment') || combined.includes('villa') ||
        combined.includes('residential') || combined.includes('commercial')) {
      return { category: 'alternative_assets', subcategory: 'real_estate' }
    }

    if (combined.includes('art') || combined.includes('painting') ||
        combined.includes('sculpture') || combined.includes('collectible')) {
      return { category: 'alternative_assets', subcategory: 'art_collectibles' }
    }

    if (combined.includes('gold') || combined.includes('silver') ||
        combined.includes('precious metal') || combined.includes('bullion')) {
      return { category: 'alternative_assets', subcategory: 'precious_metals' }
    }

    if (combined.includes('crypto') || combined.includes('cryptocurrency') ||
        combined.includes('bitcoin') || combined.includes('blockchain')) {
      return { category: 'alternative_assets', subcategory: 'crypto' }
    }

    if (combined.includes('private equity') || combined.includes('venture capital') ||
        combined.includes('startup') || combined.includes('pre-ipo')) {
      return { category: 'alternative_assets', subcategory: 'private_equity' }
    }

    if (combined.includes('watch') || combined.includes('jewelry') ||
        combined.includes('luxury goods') || combined.includes('collectibles')) {
      return { category: 'alternative_assets', subcategory: null }
    }

    if (combined.includes('tax') || combined.includes('taxation')) {
      if (combined.includes('international') || combined.includes('cross-border')) {
        return { category: 'tax_optimization', subcategory: 'international_tax' }
      }
      if (combined.includes('offshore') || combined.includes('structure')) {
        return { category: 'tax_optimization', subcategory: 'offshore_structures' }
      }
      if (combined.includes('residency') || combined.includes('relocation')) {
        return { category: 'tax_optimization', subcategory: 'residency_planning' }
      }
      if (combined.includes('compliance') || combined.includes('filing')) {
        return { category: 'tax_optimization', subcategory: 'compliance' }
      }
      return { category: 'tax_optimization', subcategory: null }
    }

    // Continue with more mappings...
    return { category: null, subcategory: null }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        style={{ width: "100%", height: "100%", position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        zoomControl={false}
        scrollWheelZoom={true}
        attributionControl={false}
        onZoomEnd={(e) => setCurrentZoom(e.target.getZoom())}
      >
        <TileLayer url={tileUrl} />
        <ZoomControl position="bottomright" />

        {/* Clustered City Markers */}
        {clusterCities.map((cluster, clusterIndex) => {
          const isCluster = cluster.cities.length > 1
          const center = cluster.center

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

          return (
            <Marker
              key={`cluster-${clusterIndex}-${center.latitude}-${center.longitude}-${valueRankMap.size}-${currentZoom}-${openPopupIndex}-${forceRender}`}
              position={[center.latitude, center.longitude]}
              icon={isCluster
                ? createClusterIcon(cluster.cities.length, primaryType, theme)
                : createCustomIcon(center, clusterIndex, theme, getColorFromValue, openPopupIndex)}
              ref={(ref) => {
                if (ref && !isCluster) {
                  markerRefs.current.set(markerKey, ref)
                }
              }}
              eventHandlers={{
                click: () => {
                  if (!isCluster) {
                    handleCityClick(center, clusterIndex)
                  }
                }
              }}
            >
              <Popup
                maxWidth={isCluster ? 500 : 400}
                autoPan={false}
                keepInView={false}
                onOpen={() => {
                  setOpenPopupIndex(clusterIndex)
                  if (!cityToExpand) {
                    setExpandedPopupIndex(null)
                  }
                }}
                onClose={() => {
                  setTimeout(() => {
                    setOpenPopupIndex(null)
                    setExpandedPopupIndex(null)
                    setSelectedCity(null)
                    setFlyToCity(null)
                    setCityToExpand(null)

                    setTimeout(() => {
                      setForceRender(prev => prev + 1)
                    }, 10)
                  }, 0)
                }}
              >
                {/* Popup content will be added next */}
                <div className={`p-3 ${theme === "dark" ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}>
                  <p className="text-xs">Popup content</p>
                </div>
              </Popup>
            </Marker>
          )
        })}

        <FlyToCity city={flyToCity} />
        <ResetView shouldReset={resetView} onReset={() => setResetView(false)} />
        <MapClickHandler onMapClick={handleMapClick} />
      </MapContainer>

      {/* Filter Controls */}
      <MapFilterControlsMobile
        selectedPriceRange={selectedPriceRange}
        onPriceRangeChange={setSelectedPriceRange}
        showCrownAssets={showCrownAssets}
        showPriveOpportunities={showPriveOpportunities}
        showHNWIPatterns={showHNWIPatterns}
        onToggleCrownAssets={onToggleCrownAssets || (() => {})}
        onTogglePriveOpportunities={onTogglePriveOpportunities || (() => {})}
        onToggleHNWIPatterns={onToggleHNWIPatterns || (() => {})}
        onReset={handleReset}
        theme={theme}
      />

      <MapFilterControlsDesktop
        selectedPriceRange={selectedPriceRange}
        onPriceRangeChange={setSelectedPriceRange}
        showCrownAssets={showCrownAssets}
        showPriveOpportunities={showPriveOpportunities}
        showHNWIPatterns={showHNWIPatterns}
        onToggleCrownAssets={onToggleCrownAssets || (() => {})}
        onTogglePriveOpportunities={onTogglePriveOpportunities || (() => {})}
        onToggleHNWIPatterns={onToggleHNWIPatterns || (() => {})}
        onReset={handleReset}
        theme={theme}
      />

      {/* Custom marker styles */}
      <style jsx global>{`
        .leaflet-popup-pane {
          z-index: 700 !important;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .cluster-marker {
          background: transparent;
          border: none;
        }
        .leaflet-popup {
          bottom: auto !important;
          top: 0 !important;
        }
        .leaflet-popup-content-wrapper {
          background: ${theme === "dark" ? "#1a1a1a" : "#fff"} !important;
          color: ${theme === "dark" ? "#fff" : "#000"} !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, ${theme === "dark" ? "0.5" : "0.15"}) !important;
          border: 1px solid ${theme === "dark" ? "#444" : "transparent"} !important;
          max-height: 500px !important;
          overflow-y: auto !important;
        }
        .leaflet-popup-tip {
          background: ${theme === "dark" ? "#1a1a1a" : "#fff"} !important;
          border: 1px solid ${theme === "dark" ? "#444" : "transparent"} !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
          min-width: 300px !important;
          max-width: 400px !important;
        }
        citation {
          display: inline;
          color: hsl(var(--primary));
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          border-bottom: 1px dashed hsl(var(--primary));
          transition: all 0.2s ease;
          padding: 0 2px;
        }
        citation:hover {
          background-color: hsl(var(--primary) / 0.1);
          border-bottom-style: solid;
        }
      `}</style>
    </div>
  )
}
