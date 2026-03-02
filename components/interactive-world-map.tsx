// components/interactive-world-map.tsx
// React Leaflet - Best-in-class open source map library
// Full documentation: https://react-leaflet.js.org/

"use client"

import React, { useState, useMemo, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from "react-leaflet"
import L from "leaflet"
import { useTheme } from "@/contexts/theme-context"
import "leaflet/dist/leaflet.css"
import { MAP_CONFIG } from "@/lib/map-config"

// Components
import { FlyToCity, ResetView, MapClickHandler, ZoomTracker, PopupZoomHandler } from "@/components/map/map-helpers"
import { MapFilterControlsMobile, MapFilterControlsDesktop } from "@/components/map/map-filter-controls"
import { MapPopupCluster } from "@/components/map/map-popup-cluster"
import { MapPopupSingle } from "@/components/map/map-popup-single"
import { MapStyles } from "@/components/map/map-styles"
import { CrisisOverlay } from "@/components/map/crisis-overlay"
import { CrisisEventMarkers } from "@/components/map/crisis-event-markers"
import { CrisisAlertBox } from "@/components/map/crisis-alert-box"
import { useCrisisIntelligence } from "@/contexts/crisis-intelligence-context"

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

// Migration flow between two cities
export interface MigrationFlow {
  source: City
  destination: City
  volume: number // Number of HNWIs migrating
  type: 'inflow' | 'outflow' // Relative to destination
  label?: string // e.g., "+6,700 HNWIs to Dubai"
  color?: string // Override color (e.g. verdict-based)
  // Midpoint marker (for audit arcs — dot at center of arc)
  midpoint?: {
    iconSvg: string       // SVG string for the icon inside the dot
    title: string         // Popup header e.g. "Hyderabad → Lisbon"
    subtitle: string      // e.g. "Real Estate Transfer"
    status: string        // e.g. "Completed", "In Progress"
    statusColor: string   // e.g. "#22C55E"
    details?: Record<string, string> // Key-value pairs for popup
    exploreUrl?: string   // Navigation URL for Explore button
    hasAccess?: boolean   // Whether user has access to view full audit
    // Corridor navigation (for multiple audits on same route)
    corridorKey?: string  // Unique corridor identifier
    currentIndex?: number // Current audit index being shown
    totalAudits?: number  // Total audits in this corridor
  }
}

// IATA-style 3-letter codes for route labels on arcs
const CITY_CODES: Record<string, string> = {
  // India
  'Hyderabad': 'HYD', 'Mumbai': 'BOM', 'Delhi': 'DEL', 'New Delhi': 'DEL',
  'Bangalore': 'BLR', 'Chennai': 'MAA', 'Kolkata': 'CCU', 'Pune': 'PNQ', 'Ahmedabad': 'AMD',
  'Yavatmal': 'YML',
  // Europe
  'Lisbon': 'LIS', 'Porto': 'OPO', 'London': 'LON', 'Zurich': 'ZRH', 'Geneva': 'GVA',
  'Paris': 'PAR', 'Berlin': 'BER', 'Frankfurt': 'FRA', 'Munich': 'MUC',
  'Milan': 'MIL', 'Rome': 'ROM', 'Amsterdam': 'AMS', 'Madrid': 'MAD',
  'Barcelona': 'BCN', 'Dublin': 'DUB', 'Athens': 'ATH', 'Vienna': 'VIE',
  'Monaco': 'MCM', 'Luxembourg': 'LUX', 'Valletta': 'MLA', 'Nicosia': 'NIC',
  // Middle East
  'Dubai': 'DXB', 'Abu Dhabi': 'AUH', 'Riyadh': 'RUH', 'Doha': 'DOH', 'Bahrain': 'BAH',
  // Asia-Pacific
  'Singapore': 'SG', 'Hong Kong': 'HKG', 'Tokyo': 'TYO', 'Sydney': 'SYD',
  'Melbourne': 'MEL', 'Auckland': 'AKL', 'Bangkok': 'BKK', 'Kuala Lumpur': 'KUL',
  'Shanghai': 'SHA', 'Beijing': 'PEK', 'Seoul': 'SEL', 'Taipei': 'TPE',
  // Americas
  'New York': 'NYC', 'Miami': 'MIA', 'San Francisco': 'SFO', 'Los Angeles': 'LAX',
  'Toronto': 'YYZ', 'Vancouver': 'YVR', 'Panama City': 'PTY', 'Nassau': 'NAS',
  'George Town': 'GCM', 'Sao Paulo': 'GRU',
  // Africa
  'Port Louis': 'MRU', 'Cape Town': 'CPT', 'Johannesburg': 'JNB',
  // Countries (fallback)
  'India': 'IND', 'Portugal': 'PRT', 'United Arab Emirates': 'UAE', 'UAE': 'UAE',
  'United States': 'USA', 'USA': 'USA', 'United Kingdom': 'GBR', 'UK': 'GBR',
  'Switzerland': 'CHE', 'Spain': 'ESP', 'France': 'FRA', 'Germany': 'DEU',
  'Italy': 'ITA', 'Netherlands': 'NLD', 'Japan': 'JPN', 'Australia': 'AUS',
  'Canada': 'CAN', 'Mexico': 'MEX', 'Thailand': 'THA', 'Malaysia': 'MYS',
  'Greece': 'GRC', 'Malta': 'MLT', 'Cyprus': 'CYP', 'Mauritius': 'MUS',
  'New Zealand': 'NZL', 'Ireland': 'IRL', 'Bahamas': 'BHS', 'Cayman Islands': 'CYM',
  'Panama': 'PAN', 'South Korea': 'KOR', 'China': 'CHN', 'Brazil': 'BRA',
  'South Africa': 'ZAF',
}

function getCityCode(name: string): string {
  return CITY_CODES[name] || name.slice(0, 3).toUpperCase()
}

// Compute curved airline-route arc using quadratic bezier (visually dramatic on Mercator)
function computeAirRouteArc(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
  numPoints: number = 60
): [number, number][] {
  const dLat = lat2 - lat1
  const dLon = lon2 - lon1
  const dist = Math.sqrt(dLat * dLat + dLon * dLon)

  // If points are very close, return straight line
  if (dist < 0.5) return [[lat1, lon1], [lat2, lon2]]

  // Perpendicular offset vector (rotated 90° counterclockwise)
  const perpLat = -dLon / dist
  const perpLon = dLat / dist

  // Arc height: 25% of distance — produces dramatic visible curves
  const arcHeight = dist * 0.25

  // Control point: midpoint + perpendicular offset (curves "left" of travel direction)
  const ctrlLat = (lat1 + lat2) / 2 + perpLat * arcHeight
  const ctrlLon = (lon1 + lon2) / 2 + perpLon * arcHeight

  // Quadratic Bezier interpolation
  const points: [number, number][] = []
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    const lat = (1 - t) ** 2 * lat1 + 2 * (1 - t) * t * ctrlLat + t ** 2 * lat2
    const lon = (1 - t) ** 2 * lon1 + 2 * (1 - t) * t * ctrlLon + t ** 2 * lon2
    points.push([lat, lon])
  }
  return points
}

interface InteractiveWorldMapProps {
  width?: number | string
  height?: number | string
  showControls?: boolean
  cities?: City[]
  migrationFlows?: MigrationFlow[] // Migration arrows between cities
  onCitationClick?: (citationId: string) => void
  citationMap?: Map<string, number> | Record<string, any>
  onNavigate?: (route: string) => void
  onCorridorNavigate?: (corridorKey: string, direction: 'prev' | 'next') => void // Navigate between audits in same corridor
  onPopupClose?: (corridorKey: string) => void // Called when popup closes (for resetting audit index)
  // Filter controls
  showCrownAssets?: boolean
  showPriveOpportunities?: boolean
  showHNWIPatterns?: boolean
  onToggleCrownAssets?: () => void
  onTogglePriveOpportunities?: () => void
  onToggleHNWIPatterns?: () => void
  hideCrownAssetsToggle?: boolean // Hide Crown Assets toggle (for assessment)
  useAbsolutePositioning?: boolean // Use absolute positioning for controls (assessment mode)
  // Crisis overlay — when true, country boundaries are always highlighted + toggle for alert box
  showCrisisOverlay?: boolean
}

export function InteractiveWorldMap({
  width = "100%",
  height = "100%",
  showControls = true,
  cities = [],
  migrationFlows = [],
  onCitationClick,
  citationMap,
  onNavigate,
  onCorridorNavigate,
  onPopupClose,
  showCrownAssets = true,
  showPriveOpportunities = true,
  showHNWIPatterns = true,
  onToggleCrownAssets,
  onTogglePriveOpportunities,
  onToggleHNWIPatterns,
  hideCrownAssetsToggle = false,
  useAbsolutePositioning = false,
  showCrisisOverlay = false,
}: InteractiveWorldMapProps) {
  const { theme } = useTheme()
  const {
    showCrisisAlert, toggleCrisisAlert,
    crisisData, crisisZoneMap, crisisCounts, crisisColors, crisisLocations,
  } = useCrisisIntelligence()
  // State
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [flyToCity, setFlyToCity] = useState<City | null>(null)
  const [resetView, setResetView] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(2.5)
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null)
  const [cityToExpand, setCityToExpand] = useState<City | null>(null)
  const [openClusterId, setOpenClusterId] = useState<string | null>(null)
  const [forceRender, setForceRender] = useState(0)
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 2000000 })
  const [hoveredCorridorKey, setHoveredCorridorKey] = useState<string | null>(null)
  const [selectedCorridorKey, setSelectedCorridorKey] = useState<string | null>(null) // Persist highlight when popup is open
  const [hoveredDestination, setHoveredDestination] = useState<string | null>(null)
  const markerRefs = React.useRef<Map<string, any>>(new Map())

  // Wrapper to prevent unnecessary price range updates (prevents infinite loop in rc-slider)
  const handlePriceRangeChange = useCallback((newRange: { min: number; max: number }) => {
    setSelectedPriceRange(prev => {
      // Only update if values actually changed (prevents re-render with same values)
      if (prev.min !== newRange.min || prev.max !== newRange.max) {
        return newRange;
      }
      return prev; // Return same reference to prevent re-render
    });
  }, []);

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
  // Use fixed range (0-2000000) for consistent coloring, not dataset min/max
  const getColor = useCallback(
    (value: string | undefined) => getColorFromValue(value, 0, 2000000),
    []
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

  // Calculate dynamic min zoom based on viewport - uses centralized MAP_CONFIG
  const [minZoomLevel, setMinZoomLevel] = useState(MAP_CONFIG.zoom.default)

  React.useEffect(() => {
    const calculateMinZoom = () => {
      if (typeof window !== 'undefined') {
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight
        const aspectRatio = screenWidth / screenHeight

        // Use centralized zoom calculation logic
        const zoom = MAP_CONFIG.calculateMinZoom(aspectRatio, screenHeight)

        setMinZoomLevel(zoom)
        setCurrentZoom(zoom) // Also update current zoom
      }
    }

    calculateMinZoom()
    window.addEventListener('resize', calculateMinZoom)
    // Also listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(calculateMinZoom, 100) // Delay to ensure dimensions are updated
    })

    return () => {
      window.removeEventListener('resize', calculateMinZoom)
      window.removeEventListener('orientationchange', calculateMinZoom)
    }
  }, [])

  // Define map bounds from centralized config
  const maxBounds: [[number, number], [number, number]] = [
    MAP_CONFIG.bounds.southwest,
    MAP_CONFIG.bounds.northeast
  ]

  return (
    <div className={`relative w-full h-full overflow-hidden ${theme === 'dark' ? 'bg-[#202124]' : 'bg-[#f5f5f5]'}`}>
      <MapContainer
        key={`map-${minZoomLevel}`} // Force re-render when zoom changes
        center={[20, 0]}
        zoom={minZoomLevel}
        minZoom={minZoomLevel}
        maxZoom={MAP_CONFIG.zoom.max}
        style={{ width: "100%", height: "100%", position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        zoomControl={false}
        scrollWheelZoom={true}
        attributionControl={false}
        worldCopyJump={false}
        zoomSnap={MAP_CONFIG.zoomSnap}
        zoomDelta={MAP_CONFIG.zoomDelta}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}  // Makes bounds completely rigid - no elastic scrolling
        bounceAtZoomLimits={false}  // Prevents bounce effect at zoom limits
      >
        <TileLayer url={tileUrl} noWrap={true} />

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

          // Check if this marker should blink (new opportunity) and give it higher z-index
          const isBlinking = !isCluster && (center.is_new === true || (center as any).isNew === true)

          return (
            <Marker
              key={`marker-${center._id || center.id || ''}-${center.latitude.toFixed(6)}-${center.longitude.toFixed(6)}-${center.title || ''}`}
              position={[center.latitude, center.longitude]}
              icon={isCluster
                ? createClusterIcon(cluster.cities.length, primaryType, theme)
                : createCustomIcon(center, clusterIndex, theme, getColor, isOpen ? clusterIndex : null)
              }
              zIndexOffset={isBlinking ? 10000 : isCluster ? 100 : 0}
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

        {/* Migration Flow Arcs — Premium Airline Routes with Glow + Destination Markers */}
        {migrationFlows.map((flow, index) => {
          // Compute curved airline-route arc (bezier)
          const arcPositions = computeAirRouteArc(
            flow.source.latitude, flow.source.longitude,
            flow.destination.latitude, flow.destination.longitude,
            60
          )

          const baseColor = flow.color || (flow.type === 'inflow' ? '#22C55E' : '#EF4444')
          const hasAccess = flow.midpoint?.hasAccess ?? true

          // Make inaccessible corridors more subtle - desaturated gray with lower opacity
          const color = hasAccess ? baseColor : '#666666'
          const auditCount = flow.midpoint?.totalAudits || 1
          const arcWeight = Math.min(1.5 + auditCount * 1, 6)

          // Corridor key for hover dimming
          const corridorKey = flow.midpoint?.corridorKey || `${flow.source.name}→${flow.destination.name}`
          const isHovered = hoveredCorridorKey === corridorKey || selectedCorridorKey === corridorKey || (hoveredDestination !== null && flow.destination.name === hoveredDestination)
          // CRITICAL: Purchased corridors (hasAccess) never get dimmed - they always stay at full visibility
          const isDimmed = !hasAccess && (hoveredCorridorKey !== null || selectedCorridorKey !== null || hoveredDestination !== null) && !isHovered

          // Additional opacity reduction for inaccessible corridors
          const accessOpacityMultiplier = hasAccess ? 1 : 0.4

          // Destination marker — black dot with neon arc-color border/glow
          const destinationIcon = flow.midpoint ? L.divIcon({
            className: 'custom-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
            popupAnchor: [0, 15],
            html: `<div style="position:relative;width:16px;height:16px;">
              <div style="width:16px;height:16px;background:#0A0A0A;border:2px solid ${color};border-radius:50%;box-shadow:0 0 8px ${color};display:flex;align-items:center;justify-content:center;position:relative;">${flow.midpoint.iconSvg}</div>
            </div>`
          }) : null

          // Airline-style route label — pill badge at the arc midpoint
          const arcMid = arcPositions[Math.floor(arcPositions.length / 2)]
          const routeTag = `${getCityCode(flow.source.name)} → ${getCityCode(flow.destination.name)}`
          const labelTextColor = hasAccess ? color : '#F2F2F2' // Slightly off-white (95% white) for inaccessible corridors
          const badgeTextColor = hasAccess ? '#0A0A0A' : '#F2F2F2' // Match label color for inaccessible corridors
          const countBadge = `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;border-radius:50%;background:${color};color:${badgeTextColor};font-size:11px;font-weight:900;flex-shrink:0;line-height:1;">${auditCount}</span>`
          const labelOpacity = isDimmed ? 0.2 : 1.0 // Dim labels when corridor is not hovered
          // Blur only inaccessible corridor labels when not hovered; never blur purchased corridors
          const labelBlur = (!hasAccess && !isHovered) ? 'blur(3px)' : 'none'
          const routeLabel = L.divIcon({
            className: '',
            iconSize: [0, 0],
            iconAnchor: [0, 0],
            html: `<div style="
              display:inline-flex;align-items:center;gap:5px;
              padding:3px 5px 3px 9px;border-radius:12px;
              background:rgba(10,10,10,0.85);backdrop-filter:blur(4px);
              border:1px solid ${color}44;
              font-size:11px;font-weight:700;letter-spacing:0.5px;
              font-family:Inter,system-ui,sans-serif;
              color:${labelTextColor};white-space:nowrap;pointer-events:none;
              text-transform:uppercase;
              box-shadow:0 0 6px ${color}33;
              opacity:${labelOpacity};
              filter:${labelBlur};
              transition:opacity 0.2s ease, filter 0.2s ease;
              transform:translate(-50%, -50%);
            "><span style="width:6px;height:6px;border-radius:50%;background:${color};flex-shrink:0;"></span>${routeTag}${countBadge}</div>`
          })

          return (
            <React.Fragment key={corridorKey}>
              {/* Invisible wide hit area for easy clicking when zoomed out */}
              <Polyline
                positions={arcPositions}
                pathOptions={{
                  color: color,
                  weight: Math.max(arcWeight + 12, 18), // Always at least 18px wide for clicks
                  opacity: 0, // Completely invisible
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
                eventHandlers={{
                  mouseover: () => {
                    setHoveredCorridorKey(corridorKey)
                  },
                  mouseout: () => {
                    setHoveredCorridorKey(null)
                  },
                  popupopen: () => {
                    setSelectedCorridorKey(corridorKey)
                  },
                  popupclose: () => {
                    // Clear all selection states and reset audit index to 0
                    setSelectedCorridorKey(null)
                    setHoveredCorridorKey(null)
                    setHoveredDestination(null)
                    if (onPopupClose) {
                      onPopupClose(corridorKey)
                    }
                  }
                }}
              >
                {!flow.midpoint && (
                  <Popup autoPan={false} keepInView={false}>
                    <div className="text-sm">
                      <div className="font-semibold mb-1">
                        {flow.source.name} → {flow.destination.name}
                      </div>
                      <div style={{ color }}>
                        {flow.label || `${flow.volume.toLocaleString()} HNWIs`}
                      </div>
                    </div>
                  </Popup>
                )}
                {flow.midpoint && (
                  <Popup maxWidth={340} autoPan={false} keepInView={false}>
                    <div
                      className={`w-full ${theme === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-black'}`}
                      style={{ maxWidth: '340px' }}
                    >
                      <div className="p-3">
                        {/* Title with counter badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-sm text-primary">
                            {flow.midpoint.title}
                          </h3>
                          {flow.midpoint.totalAudits && flow.midpoint.totalAudits > 1 && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-gold/10 text-gold border border-gold/20 whitespace-nowrap">
                              {(flow.midpoint.currentIndex || 0) + 1}/{flow.midpoint.totalAudits}
                            </span>
                          )}
                        </div>

                        {/* Subtitle — type label */}
                        <div className="mb-2 pb-2 border-b border-border">
                          <p className="text-xs text-muted-foreground">
                            {flow.midpoint.subtitle}
                          </p>
                        </div>

                        {/* Metrics — 2-column grid for details, 1-column for summary */}
                        <div className="space-y-2">
                          {flow.midpoint.status && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">Status: </span>
                              <span className="font-medium">{flow.midpoint.status}</span>
                            </div>
                          )}

                          {/* 2-column grid for non-summary fields */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {flow.midpoint.details && Object.entries(flow.midpoint.details).map(([key, val]) => {
                              const isVerdict = key === 'Verdict';
                              const isSummary = key === 'Summary';
                              const isHighlight = key === 'Value' || key === 'Transaction' || key === 'Tax Savings' || key === 'Annual Savings';
                              const verdictClass = isVerdict
                                ? (val as string).toUpperCase() === 'PROCEED' ? 'verdict-proceed'
                                  : (val as string).toUpperCase() === 'ABORT' ? 'verdict-abort'
                                  : 'verdict-restructure'
                                : '';

                              // Summary gets its own section below, skip it here
                              if (isSummary) return null;

                              return (
                                <div key={key} className="text-xs">
                                  <div className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">{key}</div>
                                  {isVerdict ? (
                                    <div className={`font-bold ${verdictClass}`}>
                                      {(val as string).toUpperCase()}
                                    </div>
                                  ) : (
                                    <div className={isHighlight ? 'font-bold text-primary' : 'font-medium'}>
                                      {val}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Summary - full width at bottom */}
                          {flow.midpoint.details?.Summary && (
                            <div className="pt-2 border-t border-border">
                              <div className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Summary</div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{flow.midpoint.details.Summary}</p>
                            </div>
                          )}
                        </div>

                        {/* Corridor navigation arrows (if multiple audits) */}
                        {flow.midpoint.totalAudits && flow.midpoint.totalAudits > 1 && onCorridorNavigate && flow.midpoint.corridorKey && (
                          <div className="pt-3 mt-3 border-t border-border">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => onCorridorNavigate(flow.midpoint!.corridorKey!, 'prev')}
                                className="px-3 py-1.5 text-xs font-medium rounded transition-colors bg-surface hover:bg-surface-hover border border-border flex items-center gap-1"
                                title="Previous audit"
                              >
                                <span>←</span>
                                <span className="hidden sm:inline">Previous</span>
                              </button>
                              <span className="text-xs text-muted-foreground px-2">
                                Audit {(flow.midpoint.currentIndex || 0) + 1} of {flow.midpoint.totalAudits}
                              </span>
                              <button
                                onClick={() => onCorridorNavigate(flow.midpoint!.corridorKey!, 'next')}
                                className="px-3 py-1.5 text-xs font-medium rounded transition-colors bg-surface hover:bg-surface-hover border border-border flex items-center gap-1"
                                title="Next audit"
                              >
                                <span className="hidden sm:inline">Next</span>
                                <span>→</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Action button — access-aware */}
                        {flow.midpoint.exploreUrl && onNavigate && (
                          <div className={`${flow.midpoint.totalAudits && flow.midpoint.totalAudits > 1 ? 'pt-2 mt-2' : 'pt-3 mt-3 border-t border-border'}`}>
                            <button
                              onClick={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); const url = flow.midpoint!.exploreUrl!.replace(/^\//, ''); setTimeout(() => onNavigate(url), 0); }}
                              className="w-full px-3 py-2 text-xs font-medium rounded transition-colors bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-1"
                            >
                              {flow.midpoint.hasAccess ? 'Explore Full Memo' : 'Initiate New Plan'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                )}
                {/* Tooltip that follows cursor on hover */}
                <Tooltip
                  permanent={false}
                  sticky={true}
                  direction="top"
                  offset={[0, -10]}
                  opacity={1}
                  className="corridor-label-tooltip"
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 5px 3px 9px',
                      borderRadius: '12px',
                      background: 'rgba(10,10,10,0.85)',
                      backdropFilter: 'blur(4px)',
                      border: `1px solid ${color}44`,
                      fontSize: '11px',
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                      fontFamily: 'Inter,system-ui,sans-serif',
                      color: labelTextColor,
                      whiteSpace: 'nowrap',
                      textTransform: 'uppercase',
                      boxShadow: `0 0 6px ${color}33`,
                      filter: labelBlur,
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }}></span>
                    {routeTag}
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: color,
                      color: badgeTextColor,
                      fontSize: '11px',
                      fontWeight: '900',
                      flexShrink: 0,
                      lineHeight: 1
                    }}>
                      {auditCount}
                    </span>
                  </div>
                </Tooltip>
              </Polyline>
              {/* Glow layer — wider, translucent line for premium depth */}
              <Polyline
                positions={arcPositions}
                pathOptions={{
                  color: color,
                  weight: arcWeight + 5,
                  opacity: (isDimmed ? 0.03 : (isHovered ? 0.2 : (hasAccess ? 0.15 : 0.12))) * accessOpacityMultiplier,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
                interactive={false}
              />
              {/* Base solid line — subtle track */}
              <Polyline
                positions={arcPositions}
                pathOptions={{
                  color: color,
                  weight: arcWeight,
                  opacity: (isDimmed ? 0.08 : (isHovered ? 0.5 : (hasAccess ? 0.4 : 0.3))) * accessOpacityMultiplier,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
                interactive={false}
              />
              {/* Animated flowing dash layer — shows movement direction (visual only, no interaction) */}
              <Polyline
                positions={arcPositions}
                pathOptions={{
                  color: color,
                  weight: arcWeight + 0.5,
                  opacity: (isDimmed ? 0.15 : (isHovered ? 1 : (hasAccess ? 1 : 0.7))) * accessOpacityMultiplier,
                  dashArray: '8, 16',
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
                interactive={false}
              />
              {/* Destination marker — audit summary dot at destination city */}
              {flow.midpoint && destinationIcon && (
                <Marker
                  position={[flow.destination.latitude, flow.destination.longitude]}
                  icon={destinationIcon}
                  zIndexOffset={20000}
                  eventHandlers={{
                    mouseover: () => {
                      setHoveredDestination(flow.destination.name)
                    },
                    mouseout: () => {
                      setHoveredDestination(null)
                    },
                    popupopen: () => {
                      setSelectedCorridorKey(corridorKey)
                    },
                    popupclose: () => {
                      // Clear all selection states and reset audit index to 0
                      setSelectedCorridorKey(null)
                      setHoveredCorridorKey(null)
                      setHoveredDestination(null)
                      if (onPopupClose) {
                        onPopupClose(corridorKey)
                      }
                    }
                  }}
                >
                  <Popup maxWidth={340} autoPan={false} keepInView={false}>
                    <div
                      className={`w-full ${theme === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-black'}`}
                      style={{ maxWidth: '340px' }}
                    >
                      <div className="p-3">
                        {/* Title with counter badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-sm text-primary">
                            {flow.midpoint.title}
                          </h3>
                          {flow.midpoint.totalAudits && flow.midpoint.totalAudits > 1 && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-gold/10 text-gold border border-gold/20 whitespace-nowrap">
                              {(flow.midpoint.currentIndex || 0) + 1}/{flow.midpoint.totalAudits}
                            </span>
                          )}
                        </div>

                        {/* Subtitle — type label */}
                        <div className="mb-2 pb-2 border-b border-border">
                          <p className="text-xs text-muted-foreground">
                            {flow.midpoint.subtitle}
                          </p>
                        </div>

                        {/* Metrics — 2-column grid for details, 1-column for summary */}
                        <div className="space-y-2">
                          {flow.midpoint.status && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">Status: </span>
                              <span className="font-medium">{flow.midpoint.status}</span>
                            </div>
                          )}

                          {/* 2-column grid for non-summary fields */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {flow.midpoint.details && Object.entries(flow.midpoint.details).map(([key, val]) => {
                              const isVerdict = key === 'Verdict';
                              const isSummary = key === 'Summary';
                              const isHighlight = key === 'Value' || key === 'Transaction' || key === 'Tax Savings' || key === 'Annual Savings';
                              const verdictClass = isVerdict
                                ? (val as string).toUpperCase() === 'PROCEED' ? 'verdict-proceed'
                                  : (val as string).toUpperCase() === 'ABORT' ? 'verdict-abort'
                                  : 'verdict-restructure'
                                : '';

                              // Summary gets its own section below, skip it here
                              if (isSummary) return null;

                              return (
                                <div key={key} className="text-xs">
                                  <div className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">{key}</div>
                                  {isVerdict ? (
                                    <div className={`font-bold ${verdictClass}`}>
                                      {(val as string).toUpperCase()}
                                    </div>
                                  ) : (
                                    <div className={isHighlight ? 'font-bold text-primary' : 'font-medium'}>
                                      {val}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Summary - full width at bottom */}
                          {flow.midpoint.details?.Summary && (
                            <div className="pt-2 border-t border-border">
                              <div className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Summary</div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{flow.midpoint.details.Summary}</p>
                            </div>
                          )}
                        </div>

                        {/* Corridor navigation arrows (if multiple audits) */}
                        {flow.midpoint.totalAudits && flow.midpoint.totalAudits > 1 && onCorridorNavigate && flow.midpoint.corridorKey && (
                          <div className="pt-3 mt-3 border-t border-border">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => onCorridorNavigate(flow.midpoint!.corridorKey!, 'prev')}
                                className="px-3 py-1.5 text-xs font-medium rounded transition-colors bg-surface hover:bg-surface-hover border border-border flex items-center gap-1"
                                title="Previous audit"
                              >
                                <span>←</span>
                                <span className="hidden sm:inline">Previous</span>
                              </button>
                              <span className="text-xs text-muted-foreground px-2">
                                Audit {(flow.midpoint.currentIndex || 0) + 1} of {flow.midpoint.totalAudits}
                              </span>
                              <button
                                onClick={() => onCorridorNavigate(flow.midpoint!.corridorKey!, 'next')}
                                className="px-3 py-1.5 text-xs font-medium rounded transition-colors bg-surface hover:bg-surface-hover border border-border flex items-center gap-1"
                                title="Next audit"
                              >
                                <span className="hidden sm:inline">Next</span>
                                <span>→</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Action button — access-aware */}
                        {flow.midpoint.exploreUrl && onNavigate && (
                          <div className={`${flow.midpoint.totalAudits && flow.midpoint.totalAudits > 1 ? 'pt-2 mt-2' : 'pt-3 mt-3 border-t border-border'}`}>
                            <button
                              onClick={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); const url = flow.midpoint!.exploreUrl!.replace(/^\//, ''); setTimeout(() => onNavigate(url), 0); }}
                              className="w-full px-3 py-2 text-xs font-medium rounded transition-colors bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-1"
                            >
                              {flow.midpoint.hasAccess ? 'Explore Full Memo' : 'Initiate New Plan'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
              {/* Airline-style route label at arc midpoint — always show for purchased, or when destination hovered */}
              {(
                hasAccess || // Always show for purchased corridors (any zoom level)
                (hoveredDestination !== null && flow.destination.name === hoveredDestination) // Show when destination hovered (any zoom)
              ) && hoveredCorridorKey !== corridorKey && (
                <Marker
                  position={arcMid}
                  icon={routeLabel}
                  interactive={false}
                  zIndexOffset={10000}
                />
              )}
            </React.Fragment>
          )
        })}

        {/* Crisis Intelligence Overlay — threat zones (only when backend data loaded) */}
        {crisisData && crisisColors && (
          <>
            <CrisisOverlay visible={showCrisisOverlay} zoneMap={crisisZoneMap} colors={crisisColors} />
            <CrisisEventMarkers visible={showCrisisAlert} locations={crisisLocations} />
          </>
        )}

        {/* Map Helper Components */}
        <FlyToCity city={flyToCity} />
        <ResetView shouldReset={resetView} onReset={() => setResetView(false)} minZoom={minZoomLevel} />
        <MapClickHandler onMapClick={handleMapClick} />
        <ZoomTracker onZoomChange={setCurrentZoom} />
        <PopupZoomHandler />
      </MapContainer>

      {/* Filter Controls - Mobile */}
      {onToggleCrownAssets && onTogglePriveOpportunities && onToggleHNWIPatterns && (
        <MapFilterControlsMobile
          selectedPriceRange={selectedPriceRange}
          onPriceRangeChange={handlePriceRangeChange}
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
          showCrisisAlert={showCrisisAlert}
          onToggleCrisisAlert={showCrisisOverlay ? toggleCrisisAlert : undefined}
        />
      )}

      {/* Filter Controls - Desktop */}
      {onToggleCrownAssets && onTogglePriveOpportunities && onToggleHNWIPatterns && (
        <MapFilterControlsDesktop
          selectedPriceRange={selectedPriceRange}
          onPriceRangeChange={handlePriceRangeChange}
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
          showCrisisAlert={showCrisisAlert}
          onToggleCrisisAlert={showCrisisOverlay ? toggleCrisisAlert : undefined}
        />
      )}

      {/* Standalone Crisis Intel toggle — shown when crisis overlay is enabled but full filter bar is absent */}
      {showCrisisOverlay && !onToggleCrownAssets && (
        <div
          style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 10000, pointerEvents: 'auto' }}
        >
          <button
            onClick={toggleCrisisAlert}
            style={{
              fontSize: 12,
              padding: '6px 12px',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: `1px solid ${showCrisisAlert ? 'rgba(239, 68, 68, 0.3)' : (theme === 'dark' ? '#262626' : '#d4d4d4')}`,
              background: showCrisisAlert
                ? (theme === 'dark' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)')
                : (theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)'),
              color: showCrisisAlert
                ? (theme === 'dark' ? '#F87171' : '#DC2626')
                : (theme === 'dark' ? '#A3A3A3' : '#666'),
              fontWeight: showCrisisAlert ? 600 : 500,
              backdropFilter: 'blur(12px)',
              cursor: 'pointer',
              boxShadow: showCrisisAlert
                ? '0 0 12px rgba(239, 68, 68, 0.15)'
                : '0 2px 8px rgba(0,0,0,0.2)',
              transition: 'all 0.2s',
            }}
            aria-label="Crisis Intel"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <span>Crisis Intel</span>
          </button>
        </div>
      )}

      {/* Crisis Alert Box */}
      {showCrisisOverlay && showCrisisAlert && crisisData && crisisColors && (
        <div
          style={{
            position: useAbsolutePositioning ? 'absolute' : 'fixed',
            top: useAbsolutePositioning ? 12 : 96,
            right: useAbsolutePositioning ? 12 : 16,
            zIndex: 10000,
            pointerEvents: 'auto',
            maxWidth: 'min(360px, calc(100vw - 24px))',
          }}
        >
          <CrisisAlertBox
            visible={showCrisisAlert}
            theme={theme}
            alert={crisisData.alert}
            counts={crisisCounts}
            colors={crisisColors}
          />
        </div>
      )}

      {/* Crisis Legend — bottom-right when crisis overlay is active */}
      {showCrisisOverlay && showCrisisAlert && crisisData && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            zIndex: 10000,
            pointerEvents: 'auto',
            background: theme === 'dark' ? 'rgba(10, 10, 10, 0.88)' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(12px)',
            borderRadius: 8,
            padding: '8px 12px',
            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            fontSize: 11,
          }}
        >
          {/* War: red → amber by severity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', gap: 2, width: 26, justifyContent: 'center' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', border: '1.5px solid rgba(239,68,68,0.6)' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B', border: '1.5px solid rgba(245,158,11,0.5)' }} />
            </div>
            <span style={{ color: theme === 'dark' ? '#A3A3A3' : '#525252', fontWeight: 500 }}>
              War (by severity)
            </span>
          </div>
          {/* Geopolitical & AI: fuchsia */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', gap: 2, width: 26, justifyContent: 'center' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg, #C026D3, #E879F9)', border: '1.5px solid rgba(217,70,239,0.5)', boxShadow: '0 0 6px rgba(217,70,239,0.4)' }} />
            </div>
            <span style={{ color: theme === 'dark' ? '#A3A3A3' : '#525252', fontWeight: 500 }}>
              Geopolitical &amp; AI
            </span>
          </div>
        </div>
      )}

      {/* Map Styles */}
      <MapStyles theme={theme} />
    </div>
  )
}
