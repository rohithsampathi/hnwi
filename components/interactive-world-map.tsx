// components/interactive-world-map.tsx
// React Leaflet - Best-in-class open source map library
// Full documentation: https://react-leaflet.js.org/

"use client"

import React, { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet"
import { useTheme } from "@/contexts/theme-context"
import { MapPin, Building2, Crown, Globe, Linkedin, Gem, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { parseDevCitations } from "@/lib/parse-dev-citations"
import { CitationText } from "@/components/elite/citation-text"
import chroma from "chroma-js"

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
      // Get current zoom level - don't zoom out if already zoomed in
      const currentZoom = map.getZoom()
      const targetZoom = Math.max(currentZoom, zoomLevel)  // Use higher of current or target zoom

      // Fly to city with offset so marker appears in upper area with popup below
      map.flyTo([city.latitude, city.longitude], targetZoom, {
        duration: 2.5,
        easeLinearity: 0.15,
        animate: true,
        // Offset to position marker in upper third of screen
        offset: [0, -150]  // Negative Y moves view DOWN, making marker appear HIGHER
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
      // Smooth, progressive zoom out animation (3.5 seconds)
      map.flyTo([20, 0], 2, {
        duration: 3.5,           // Longer duration for smoother feel
        easeLinearity: 0.15,     // More gradual easing (less linear)
        animate: true
      })
      // Reset state after animation completes
      setTimeout(() => {
        onReset()
      }, 3600)
    }
  }, [shouldReset, map, onReset])

  return null
}

// Component to handle map clicks (close popups and reset icons)
function MapClickHandler({
  onMapClick
}: {
  onMapClick: () => void
}) {
  const map = useMap()

  React.useEffect(() => {
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      // Check if click target is the map itself (not a marker or popup)
      const target = e.originalEvent.target as HTMLElement

      // If clicking on the map tile layer (not markers or popups)
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
  const markerRefs = React.useRef<Map<string, any>>(new Map())

  // Parse value string to number for color calculation
  const parseValueToNumber = React.useCallback((value: string | undefined): number => {
    if (!value) return 0

    // Remove $ and commas
    const cleanValue = value.replace(/[$,]/g, '')

    // Extract number and suffix
    const match = cleanValue.match(/([\d.]+)([KMB])?/)
    if (!match) return 0

    const num = parseFloat(match[1])
    const suffix = match[2]

    // Convert to actual value
    if (suffix === 'K') return num * 1000
    if (suffix === 'M') return num * 1000000
    if (suffix === 'B') return num * 1000000000

    return num
  }, [])

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

    // Create rank-based mapping: sort unique values and assign rank positions
    const uniqueValues = [...new Set(values)].sort((a, b) => a - b)
    const rankMap = new Map<number, number>()

    uniqueValues.forEach((value, index) => {
      // Assign position from 0 to 1 based on rank
      const position = uniqueValues.length > 1 ? index / (uniqueValues.length - 1) : 0
      rankMap.set(value, position)
    })

    return { minValue: min, maxValue: max, valueRankMap: rankMap }
  }, [cities, parseValueToNumber])

  // Spread markers at same location in a circle pattern
  const clusterCities = React.useMemo(() => {
    // Group cities by exact location
    const locationGroups = new Map<string, City[]>()

    cities.forEach(city => {
      const key = `${city.latitude.toFixed(6)},${city.longitude.toFixed(6)}`
      if (!locationGroups.has(key)) {
        locationGroups.set(key, [])
      }
      locationGroups.get(key)!.push(city)
    })

    // Spread out markers at same location
    const spreadCities: Array<{ cities: [City]; center: City }> = []

    locationGroups.forEach((citiesAtLocation, locationKey) => {
      if (citiesAtLocation.length === 1) {
        // Single marker - no need to spread
        spreadCities.push({
          cities: [citiesAtLocation[0]],
          center: citiesAtLocation[0]
        })
      } else {
        // Multiple markers at same location - arrange in a grid/matrix
        // Calculate grid dimensions (e.g., 2x2, 3x3, 4x4)
        const count = citiesAtLocation.length
        const gridSize = Math.ceil(Math.sqrt(count)) // E.g., 4 items = 2x2, 9 items = 3x3

        // Zoom-dependent spacing - distance between dots in grid
        // Dots should be very close together, almost overlapping
        const getGridSpacing = (zoom: number) => {
          if (zoom <= 3) return 0.010  // Very close at global view
          if (zoom <= 5) return 0.005  // Very close at continental view
          if (zoom <= 7) return 0.003  // Very close at country view
          if (zoom <= 9) return 0.0015 // Very close at regional view
          return 0.00008 // Very close at street level (~9m)
        }

        const spacing = getGridSpacing(currentZoom)

        citiesAtLocation.forEach((city, index) => {
          // Calculate grid position (row, col)
          const row = Math.floor(index / gridSize)
          const col = index % gridSize

          // Center the grid around the original point
          const centerOffset = (gridSize - 1) / 2
          const offsetLat = (row - centerOffset) * spacing
          const offsetLng = (col - centerOffset) * spacing / Math.cos(city.latitude * Math.PI / 180)

          // Create a new city object with offset coordinates
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
  }, [cities, currentZoom])

  // Tile layer URL based on theme
  // Use dark_all for dark mode - dark grey with visible labels
  const tileUrl = theme === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"

  // Create chroma.js color scale with 1000+ smooth shades
  // Emerald → Topaz → Ruby gradient using professional color library
  const colorScale = React.useMemo(() => {
    const scale = chroma.scale([
      '#0d5c3a', // Deep dark emerald (cheapest)
      '#17a561', // Vibrant emerald
      '#2dd17f', // Bright emerald green
      '#50e991', // Light emerald
      '#ffd700', // Pure golden topaz (midpoint - maximum brightness!)
      '#ffb000', // Rich golden amber
      '#ff8c00', // Deep amber/orange
      '#e63946', // Bright ruby red
      '#c1121f', // Rich ruby
      '#800020'  // Deep dark burgundy ruby (most expensive)
    ])
    .mode('lch') // LCH color space for vibrant, perceptually uniform gradients

    // Generate exactly 1000 color stops as array
    return scale.colors(1000)
  }, [])

  // Get color based on value: Emerald (cheap) to Ruby (expensive)
  // Uses rank-based distribution with 1000 pre-generated color shades
  const getColorFromValue = React.useCallback((value: string | undefined): string => {
    const numValue = parseValueToNumber(value)

    if (numValue === 0 || valueRankMap.size === 0) {
      // Fallback to mid-range color (topaz)
      return colorScale[499] // Middle of 1000 colors
    }

    // Get rank-based position (0 to 1) from pre-calculated map
    const position = valueRankMap.get(numValue) ?? 0.5

    // Map position to one of 1000 colors (index 0-999)
    const colorIndex = Math.floor(position * 999)
    const color = colorScale[colorIndex]

    return color
  }, [valueRankMap, parseValueToNumber, colorScale])

  // Get category-specific icon based on asset type
  const getCategoryIcon = (city: City, iconColor: string): string => {
    const title = (city.title || '').toLowerCase()
    const analysis = (city.analysis || '').toLowerCase()
    const combined = title + ' ' + analysis
    const category = (city.category || '').toLowerCase()
    const industry = (city.industry || '').toLowerCase()
    const product = (city.product || '').toLowerCase()

    // If backend provides category/industry/product, use it first (most accurate)
    if (category || industry || product) {
      const backendData = (category + ' ' + industry + ' ' + product).toLowerCase()

      // WATCHES & TIMEPIECES
      if (backendData.includes('watch') || backendData.includes('timepiece') ||
          backendData.includes('rolex') || backendData.includes('omega') ||
          backendData.includes('patek') || backendData.includes('cartier')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><circle cx="12" cy="12" r="6"/><polyline points="12 10 12 12 13 13"/><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05"/><path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"/></svg>`
      }

      // APARTMENTS & RESIDENTIAL
      if (backendData.includes('apartment') || backendData.includes('residential') ||
          backendData.includes('condo') || backendData.includes('flat')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><rect x="6" y="3" width="12" height="18" rx="1"/><line x1="6" y1="7" x2="18" y2="7"/><line x1="6" y1="11" x2="18" y2="11"/><line x1="6" y1="15" x2="18" y2="15"/><line x1="10" y1="3" x2="10" y2="21"/><line x1="14" y1="3" x2="14" y2="21"/></svg>`
      }

      // VILLAS & LUXURY HOMES
      if (backendData.includes('villa') || backendData.includes('mansion') ||
          backendData.includes('luxury home') || backendData.includes('estate')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
      }

      // COMMERCIAL REAL ESTATE & BUILDINGS
      if (backendData.includes('commercial') || backendData.includes('office') ||
          backendData.includes('building') || backendData.includes('property')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21V7l5-4v18"/><path d="M19 21V10l-5-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/></svg>`
      }

      // VEHICLES & AUTOMOBILES
      if (backendData.includes('vehicle') || backendData.includes('car') ||
          backendData.includes('automobile') || backendData.includes('auto')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`
      }

      // LAND & AGRICULTURE
      if (backendData.includes('land') || backendData.includes('agriculture') ||
          backendData.includes('farm') || backendData.includes('plot') ||
          backendData.includes('acres') || backendData.includes('aquaculture')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="M2 22h20"/><path d="M3.77 10.77 2 9l2-2 1.77 1.77z"/><path d="M7.54 14.54 6 13l2-2 1.54 1.54z"/><path d="M11.31 18.31 10 17l2-2 1.31 1.31z"/><path d="M15.08 22.08 14 21l2-2 1.08 1.08z"/><path d="M18.77 10.77 17 9l2-2 1.77 1.77z"/><path d="M14.54 14.54 13 13l2-2 1.54 1.54z"/><path d="M10.31 18.31 9 17l2-2 1.31 1.31z"/><path d="M6.08 22.08 5 21l2-2 1.08 1.08z"/></svg>`
      }

      // GOLD & PRECIOUS METALS
      if (backendData.includes('gold') || backendData.includes('silver') ||
          backendData.includes('metal') || backendData.includes('precious metal') ||
          backendData.includes('bullion')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>`
      }

      // JEWELRY & COLLECTIBLES
      if (backendData.includes('jewelry') || backendData.includes('jewellery') ||
          backendData.includes('gem') || backendData.includes('diamond') ||
          backendData.includes('collectible')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`
      }

      // ART & LUXURY GOODS
      if (backendData.includes('art') || backendData.includes('painting') ||
          backendData.includes('sculpture') || backendData.includes('luxury')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M3 16l5-5 5 5 5-5 3 3"/></svg>`
      }
    }

    // Fallback to text matching if no category provided or category didn't match

    // Land / Farm / Agriculture / Living Spaces - Use wheat/grain icon
    if (combined.includes('land') || combined.includes('plot') ||
        combined.includes('agriculture') || combined.includes('aquaculture') ||
        combined.includes('farm') || combined.includes('acres') ||
        combined.includes('living space')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="M2 22h20"/><path d="M3.77 10.77 2 9l2-2 1.77 1.77z"/><path d="M7.54 14.54 6 13l2-2 1.54 1.54z"/><path d="M11.31 18.31 10 17l2-2 1.31 1.31z"/><path d="M15.08 22.08 14 21l2-2 1.08 1.08z"/><path d="M18.77 10.77 17 9l2-2 1.77 1.77z"/><path d="M14.54 14.54 13 13l2-2 1.54 1.54z"/><path d="M10.31 18.31 9 17l2-2 1.31 1.31z"/><path d="M6.08 22.08 5 21l2-2 1.08 1.08z"/></svg>`
    }

    // Watches / Timepieces - Check early to avoid being caught by other categories
    if (combined.includes('watch') || combined.includes('rolex') ||
        combined.includes('timepiece') || title.includes('tissot') ||
        title.includes('seiko') || title.includes('patek') ||
        combined.includes('omega') || combined.includes('cartier')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><circle cx="12" cy="12" r="6"/><polyline points="12 10 12 12 13 13"/><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05"/><path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"/></svg>`
    }

    // Real Estate - Check before vehicles to avoid conflicts
    if (combined.includes('real estate') || combined.includes('property') ||
        combined.includes('commercial property') || combined.includes('real-estate')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21V7l5-4v18"/><path d="M19 21V10l-5-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/></svg>`
    }

    // Vehicles / Cars
    if (combined.includes('car') || combined.includes('vehicle') ||
        title.includes('harrier') || title.includes('tata') ||
        combined.includes('automobile')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`
    }

    // Apartments / Buildings - Single tall tower icon
    if (combined.includes('apartment') || title.includes('bhk') ||
        combined.includes('residential complex')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><rect x="6" y="3" width="12" height="18" rx="1"/><line x1="6" y1="7" x2="18" y2="7"/><line x1="6" y1="11" x2="18" y2="11"/><line x1="6" y1="15" x2="18" y2="15"/><line x1="10" y1="3" x2="10" y2="21"/><line x1="14" y1="3" x2="14" y2="21"/></svg>`
    }

    // Villas / Mansions - Luxury home (check after watches to avoid conflicts)
    if (combined.includes('villa') || combined.includes('mansion') ||
        combined.includes('luxury home') ||
        (combined.includes('residence') && !combined.includes('watch'))) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
    }

    // Gold / Metal Bars
    if (combined.includes('gold bars') || combined.includes('gold bar') ||
        combined.includes('silver bars') || combined.includes('metal bars') ||
        (combined.includes('gold') && !combined.includes('jewelry'))) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>`
    }

    // Default: Generic opportunity/investment icon (dollar sign or gem)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`
  }

  // Create circular marker with color based on value
  // Show category icon ONLY when popup is open for this marker
  const createCustomIcon = React.useCallback((city: City, clusterIndex: number) => {
    const color = getColorFromValue(city.value || city.population)
    const borderColor = theme === "dark" ? "#fff" : "#000"

    // Show icon ONLY when popup is open for this specific marker
    const shouldShowIcon = openPopupIndex === clusterIndex

    if (shouldShowIcon) {
      const categoryIcon = getCategoryIcon(city, color)

      // Show category icon with colored background
      const iconHtml = `
        <div style="
          width: 36px;
          height: 36px;
          background: ${theme === "dark" ? "rgba(26, 26, 26, 0.9)" : "rgba(255, 255, 255, 0.9)"};
          border: 2px solid ${color};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          ${categoryIcon}
        </div>
      `

      return L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, 25]  // Push popup down below the 36px icon
      })
    }

    // Default: always show semi-transparent colored dot (90% opacity)
    // Add icon based on source: Crown for Crown Vault, Gem for Privé Exchange/Victor, Globe for others
    const isCrownVault = city.source?.toLowerCase().includes('crown vault')
    const isVictor = !!city.victor_score

    // Choose icon SVG based on source (using exact Lucide icon paths)
    let iconSvg = ''
    if (isCrownVault) {
      // Crown icon for Crown Vault (Lucide Crown) - White for visibility
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
        <path d="M5 21h14"/>
      </svg>`
    } else if (isVictor) {
      // Gem icon for Privé Exchange (Lucide Gem) - White for visibility
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <path d="M6 3h12l4 6-10 13L2 9Z"/>
        <path d="M11 3 8 9l4 13 4-13-3-6"/>
        <path d="M2 9h20"/>
      </svg>`
    } else {
      // Globe icon for all other opportunities - HNWI World (Lucide Globe) - White for visibility
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
        <path d="M2 12h20"/>
      </svg>`
    }

    const iconHtml = `
      <div style="
        width: 16px;
        height: 16px;
        background: ${color};
        opacity: 0.90;
        border: 1px solid ${color};
        border-radius: 50%;
        box-shadow: 0 0 8px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        ${iconSvg}
      </div>
    `

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, 15]  // Push popup down below the 16px dot
    })
  }, [theme, getColorFromValue, openPopupIndex])

  // Create cluster icon - larger circle with count
  const createClusterIcon = (count: number, primaryType: string) => {
    const borderColor = theme === "dark" ? "#ddd" : "#333"
    // Muted amber/gold for clusters
    const bgColor = theme === "dark" ? "hsl(45, 50%, 45%)" : "hsl(30, 55%, 50%)"
    const textColor = theme === "dark" ? "#fff" : "#fff"

    const iconHtml = `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background: ${bgColor};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        font-weight: bold;
        font-size: 14px;
        color: ${textColor};
      ">
        ${count}
      </div>
    `

    return L.divIcon({
      html: iconHtml,
      className: 'cluster-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, 22]  // Push popup down below the 32px cluster
    })
  }

  const handleCityClick = (city: City, clusterIndex: number, expandDetails: boolean = false) => {
    setSelectedCity(city)
    setFlyToCity(city)

    // Set popup index immediately to trigger icon change
    setOpenPopupIndex(clusterIndex)

    // If clicking from a cluster, mark this city to auto-expand after zoom
    if (expandDetails) {
      setCityToExpand(city)
    } else {
      setCityToExpand(null)
    }

    // Open the popup after a small delay to ensure marker is rendered
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
      // Small delay to ensure map has finished rendering and markers are placed
      const timer = setTimeout(() => {
        // Find the cluster index for this city
        const clusterIdx = clusterCities.findIndex(cluster =>
          cluster.cities.some(c =>
            c.latitude === cityToExpand.latitude &&
            c.longitude === cityToExpand.longitude &&
            c.title === cityToExpand.title
          )
        )

        if (clusterIdx !== -1) {
          // Set expanded state first
          setExpandedPopupIndex(clusterIdx)

          // Get the marker ref and open its popup
          const markerKey = `${cityToExpand.latitude}-${cityToExpand.longitude}-${cityToExpand.title}`
          const markerRef = markerRefs.current.get(markerKey)

          if (markerRef) {
            // Open popup after a small delay to ensure expansion state is set
            setTimeout(() => {
              markerRef.openPopup()
            }, 200)
          }

          setCityToExpand(null) // Clear after expanding
        }
      }, 2600) // Wait for fly animation to complete (2.5s animation + 100ms buffer)

      return () => clearTimeout(timer)
    }
  }, [cityToExpand, currentZoom, clusterCities])

  const handleReset = () => {
    // Clear all city-related state to prevent conflicts
    setFlyToCity(null)
    setSelectedCity(null)
    setOpenPopupIndex(null)
    setExpandedPopupIndex(null)
    setResetView(true)
    setForceRender(prev => prev + 1)

    // Close all open popups by closing them through Leaflet
    markerRefs.current.forEach((markerRef) => {
      if (markerRef && markerRef.closePopup) {
        markerRef.closePopup()
      }
    })
  }

  // Handle map clicks - reset icons to dots
  const handleMapClick = React.useCallback(() => {
    // Clear all city-related state
    setOpenPopupIndex(null)
    setExpandedPopupIndex(null)
    setSelectedCity(null)
    setFlyToCity(null)
    setCityToExpand(null)

    // Close all open popups
    markerRefs.current.forEach((markerRef) => {
      if (markerRef && markerRef.closePopup) {
        markerRef.closePopup()
      }
    })

    // Force re-render to update icons
    setTimeout(() => {
      setForceRender(prev => prev + 1)
    }, 10)
  }, [])

  // Format text labels: First Letter Of Every Word Capital, remove underscores, no all caps
  const formatLabel = (text: string | undefined) => {
    if (!text) return text

    // Replace underscores with spaces
    let formatted = text.replace(/_/g, ' ')

    // Convert from all caps or mixed case to Title Case
    formatted = formatted.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return formatted
  }

  // Format value to ensure K/M suffix
  const formatValue = (value: string | undefined) => {
    if (!value) return value

    // If already has K, M, B suffix, return as is
    if (/[KMB]$/i.test(value)) return value

    // Extract number from string like "$420" or "420" or "$1,000,000"
    const match = value.match(/\$?([\d,]+)/)
    if (!match) return value

    const num = parseFloat(match[1].replace(/,/g, ''))
    const prefix = value.startsWith('$') ? '$' : ''

    // Always format based on the actual numeric value
    if (num >= 1000000) {
      return `${prefix}${(num / 1000000).toFixed(0)}M`
    } else if (num >= 1000) {
      return `${prefix}${(num / 1000).toFixed(0)}K`
    } else if (num >= 1) {
      // For values < 1000, assume they represent thousands in the data model
      return `${prefix}${num}K`
    }

    return value
  }

  // Clean analysis text by removing redundant "Entry Investment: ... Risk Profile: ..." prefix
  const cleanAnalysisText = (analysis: string | undefined) => {
    if (!analysis) return analysis

    // Remove pattern: "Entry Investment: $XXX (...) Risk Profile: XXX - "
    // This pattern appears at the start of many analysis texts
    const cleanedText = analysis.replace(/^Entry Investment:\s*\$?[\d,]+[KMB]?\s*\([^)]*\)\s*Risk Profile:\s*[^\-]+\s*-\s*/i, '')

    return cleanedText.trim()
  }

  // Format source label
  const formatSource = (source: string | undefined) => {
    if (!source) return source
    const lowerSource = source.toLowerCase()

    if (lowerSource === 'moev4' || lowerSource === 'moe v4') {
      return 'Live HNWI Data'
    }

    if (lowerSource === 'prive exchange' || lowerSource === 'privé exchange') {
      return 'Market Place'
    }

    return source
  }

  // Remove lock emoji from Crown Vault titles
  const cleanTitle = (title: string | undefined, source: string | undefined) => {
    if (!title) return title

    // Remove 🔐 emoji from Crown Vault opportunities
    if (source?.toLowerCase().includes('crown vault')) {
      return title.replace(/🔐\s*/g, '').trim()
    }

    return title
  }

  // Generate tier based on value for Market Place opportunities
  const generateTier = (value: string | undefined, source: string | undefined): string | undefined => {
    if (!value || !source) return undefined

    // Only generate tier for Prive Exchange/Market Place
    const lowerSource = source.toLowerCase()
    if (lowerSource !== 'prive exchange' && lowerSource !== 'privé exchange') {
      return undefined
    }

    // Extract numeric value
    const match = value.match(/\$?([\d,]+)/)
    if (!match) return undefined

    let num = parseFloat(match[1].replace(/,/g, ''))

    // If value has K suffix, multiply by 1000
    if (/K$/i.test(value)) {
      num = num * 1000
    }
    // If value has M suffix, multiply by 1,000,000
    else if (/M$/i.test(value)) {
      num = num * 1000000
    }
    // Assume values without suffix are in thousands
    else if (num >= 1 && num < 1000) {
      num = num * 1000
    }

    // Classify into tiers
    if (num >= 1000000) {
      return '$1M+ Tier'
    } else if (num >= 500000) {
      return '$500K Tier'
    } else if (num >= 100000) {
      return '$100K Tier'
    }

    return undefined
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
        <TileLayer
          url={tileUrl}
        />

        {/* Zoom controls at bottom right */}
        <ZoomControl position="bottomright" />

        {/* Clustered City Markers */}
        {clusterCities.map((cluster, clusterIndex) => {
          const isCluster = cluster.cities.length > 1
          const center = cluster.center

          // Determine primary type for cluster (most common type)
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
              icon={isCluster ? createClusterIcon(cluster.cities.length, primaryType) : createCustomIcon(center, clusterIndex)}
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
                  // Track which popup is open to show icon
                  setOpenPopupIndex(clusterIndex)

                  // Only reset expanded index if not auto-opening from cluster click
                  if (!cityToExpand) {
                    setExpandedPopupIndex(null)
                  }
                }}
                onClose={() => {
                  // Use setTimeout to ensure state updates happen after Leaflet closes the popup
                  setTimeout(() => {
                    // Clear all city-related state FIRST
                    setOpenPopupIndex(null)
                    setExpandedPopupIndex(null)
                    setSelectedCity(null)
                    setFlyToCity(null)
                    setCityToExpand(null)

                    // Force re-render AFTER state is cleared (small delay to ensure state updates are processed)
                    setTimeout(() => {
                      setForceRender(prev => prev + 1)
                    }, 10)
                  }, 0)
                }}
              >
                {isCluster ? (
                  /* Cluster Popup - Show list of opportunities */
                  <div className={`p-3 ${theme === "dark" ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}>
                    <h3 className="font-bold text-sm mb-3 text-primary">
                      {cluster.cities.length} Opportunities in this area
                    </h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {cluster.cities.map((city, cityIndex) => (
                        <div
                          key={`cluster-city-${cityIndex}`}
                          className="p-2 rounded border border-border hover:bg-muted cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Find the cluster index for this city after zoom
                            const targetClusterIndex = clusterCities.findIndex(c =>
                              c.cities.some(ct => ct.title === city.title)
                            )
                            handleCityClick(city, targetClusterIndex >= 0 ? targetClusterIndex : clusterIndex, true)
                          }}
                        >
                          {city.start_date && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {new Date(city.start_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          )}
                          <p className="font-semibold text-xs mb-1 flex items-center gap-1.5">
                            {city.source?.toLowerCase().includes('crown vault') && (
                              <Crown className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                            )}
                            {cleanTitle(city.title, city.source) || city.name}
                          </p>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>{city.value ? formatValue(city.value) : ''}</span>
                            <span>{city.risk}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Click an opportunity to view details
                    </p>
                  </div>
                ) : (
                  /* Single City Popup */
                  <div className={`p-3 min-w-[300px] ${theme === "dark" ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}>
                    {/* Publish Date */}
                    {center.start_date && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(center.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    )}

                    {/* Title */}
                    {center.title && (
                      <h3 className="font-bold text-sm mb-2 text-primary flex items-center gap-2">
                        {center.source?.toLowerCase().includes('crown vault') && (
                          <Crown className="h-4 w-4 text-amber-500" />
                        )}
                        {cleanTitle(center.title, center.source)}
                      </h3>
                    )}

                {/* Location Info - Always visible */}
                <div className="mb-2 pb-2 border-b border-border">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {center.country}
                  </p>
                </div>

                {/* Fixed Data - Always visible */}
                <div className="space-y-1.5">
                  {center.value && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Entry Investment:</span>
                      <span className="text-xs font-bold text-primary">{formatValue(center.value)}</span>
                    </div>
                  )}

                  {center.risk && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Risk Profile:</span>
                      <span className="text-xs font-medium">{formatLabel(center.risk)}</span>
                    </div>
                  )}

                  {center.source && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Source:</span>
                      <span className="text-xs font-medium">{formatSource(center.source)}</span>
                    </div>
                  )}

                  {center.victor_score && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Opportunity Demand:</span>
                      <span className="text-xs font-medium">{formatLabel(center.victor_score)}</span>
                    </div>
                  )}
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setExpandedPopupIndex(expandedPopupIndex === clusterIndex ? null : clusterIndex)}
                  className="w-full mt-3 px-3 py-1.5 text-xs font-medium rounded transition-colors bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {expandedPopupIndex === clusterIndex ? "Collapse ▲" : "View Details ▼"}
                </button>

                {/* Expanded Details */}
                {expandedPopupIndex === clusterIndex && (
                  <div className="mt-3 pt-3 border-t border-border space-y-3 expanded-details">

                    {/* Analysis */}
                    {center.analysis && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 font-semibold">Analysis:</p>
                        <div className="text-xs leading-relaxed">
                          <CitationText
                            text={cleanAnalysisText(center.analysis)}
                            onCitationClick={onCitationClick}
                            citationMap={citationMap}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Elite Pulse Analysis */}
                    {center.elite_pulse_analysis && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 font-semibold">Elite Pulse:</p>
                        <div className="text-xs leading-relaxed">
                          <CitationText
                            text={cleanAnalysisText(center.elite_pulse_analysis)}
                            onCitationClick={onCitationClick}
                            citationMap={citationMap}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Executors */}
                    {center.executors && center.executors.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 font-semibold">Executor{center.executors.length > 1 ? 's' : ''}:</p>
                        <div className="space-y-2">
                          {center.executors.map((executor, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2 bg-muted/50 rounded-md p-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate">{executor.name}</p>
                                {executor.role && (
                                  <p className="text-xs text-muted-foreground truncate">{executor.role}</p>
                                )}
                              </div>

                              {/* Strategic Trusted Partner - Show Website and LinkedIn */}
                              {executor.strategic_trusted_partner ? (
                                <div className="flex items-center gap-1.5">
                                  {executor.website && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        window.open(executor.website, '_blank', 'noopener,noreferrer')
                                      }}
                                      className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                      title="Visit Website"
                                    >
                                      <Globe className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  {executor.linkedin && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        window.open(executor.linkedin, '_blank', 'noopener,noreferrer')
                                      }}
                                      className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                      title="View LinkedIn"
                                    >
                                      <Linkedin className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                /* Regular Executor - Show Request Introduction */
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // TODO: Implement introduction request flow
                                  }}
                                  className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity whitespace-nowrap"
                                >
                                  Request Introduction
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button - At the bottom of expanded details */}
                    {onNavigate && (
                      <div className="pt-3 mt-3 border-t border-border">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()

                            // Route based on source
                            if (center.source?.toLowerCase().includes('crown vault')) {
                              // Crown Vault asset - go to Crown Vault page
                              onNavigate('crown-vault')
                            } else if (center.victor_score) {
                              // Privé Exchange opportunity with Victor analysis - go to Privé Exchange with ID
                              const opportunityParam = center._id || center.id || encodeURIComponent(center.title || center.name || '')
                              onNavigate(`prive-exchange?opportunity=${opportunityParam}`)
                            } else {
                              // All other opportunities (MOEv4, etc.) - go to Executors page with filters

                              // Map opportunity industry/category to executor category and subcategory
                              const mapToExecutorFilters = (opp: typeof center) => {
                                const industry = (opp.industry || '').toLowerCase()
                                const category = (opp.category || '').toLowerCase()
                                const product = (opp.product || '').toLowerCase()
                                const title = (opp.title || '').toLowerCase()
                                const combined = `${industry} ${category} ${product} ${title}`

                                // Real Estate → Alternative Assets > Real Estate
                                if (combined.includes('real estate') || combined.includes('property') ||
                                    combined.includes('apartment') || combined.includes('villa') ||
                                    combined.includes('residential') || combined.includes('commercial')) {
                                  return { category: 'alternative_assets', subcategory: 'real_estate' }
                                }

                                // Art → Alternative Assets > Art & Collectibles
                                if (combined.includes('art') || combined.includes('painting') ||
                                    combined.includes('sculpture') || combined.includes('collectible')) {
                                  return { category: 'alternative_assets', subcategory: 'art_collectibles' }
                                }

                                // Precious Metals → Alternative Assets > Precious Metals
                                if (combined.includes('gold') || combined.includes('silver') ||
                                    combined.includes('precious metal') || combined.includes('bullion')) {
                                  return { category: 'alternative_assets', subcategory: 'precious_metals' }
                                }

                                // Crypto/Digital Assets → Alternative Assets > Cryptocurrency
                                if (combined.includes('crypto') || combined.includes('cryptocurrency') ||
                                    combined.includes('bitcoin') || combined.includes('blockchain')) {
                                  return { category: 'alternative_assets', subcategory: 'crypto' }
                                }

                                // Private Equity → Alternative Assets > Private Equity
                                if (combined.includes('private equity') || combined.includes('venture capital') ||
                                    combined.includes('startup') || combined.includes('pre-ipo')) {
                                  return { category: 'alternative_assets', subcategory: 'private_equity' }
                                }

                                // Watches, Jewelry, Luxury Goods → Alternative Assets (no specific subcategory)
                                if (combined.includes('watch') || combined.includes('jewelry') ||
                                    combined.includes('luxury goods') || combined.includes('collectibles')) {
                                  return { category: 'alternative_assets', subcategory: null }
                                }

                                // Tax → Tax Optimization
                                if (combined.includes('tax') || combined.includes('taxation')) {
                                  // International Tax
                                  if (combined.includes('international') || combined.includes('cross-border')) {
                                    return { category: 'tax_optimization', subcategory: 'international_tax' }
                                  }
                                  // Offshore Structures
                                  if (combined.includes('offshore') || combined.includes('structure')) {
                                    return { category: 'tax_optimization', subcategory: 'offshore_structures' }
                                  }
                                  // Residency Planning
                                  if (combined.includes('residency') || combined.includes('relocation')) {
                                    return { category: 'tax_optimization', subcategory: 'residency_planning' }
                                  }
                                  // Tax Compliance
                                  if (combined.includes('compliance') || combined.includes('filing')) {
                                    return { category: 'tax_optimization', subcategory: 'compliance' }
                                  }
                                  return { category: 'tax_optimization', subcategory: null }
                                }

                                // Immigration & Visa → Legal Services > Immigration
                                if (combined.includes('visa') || combined.includes('immigration') ||
                                    combined.includes('citizenship') || combined.includes('residency')) {
                                  return { category: 'legal_services', subcategory: 'immigration' }
                                }

                                // Trust → Legal Services > Trust Formation or Wealth Planning > Estate Planning
                                if (combined.includes('trust')) {
                                  if (combined.includes('formation') || combined.includes('setup')) {
                                    return { category: 'legal_services', subcategory: 'trust_formation' }
                                  }
                                  return { category: 'wealth_planning', subcategory: 'estate_planning' }
                                }

                                // Estate Planning → Wealth Planning > Estate Planning
                                if (combined.includes('estate planning') || combined.includes('inheritance') ||
                                    combined.includes('succession')) {
                                  return { category: 'wealth_planning', subcategory: 'estate_planning' }
                                }

                                // Retirement → Wealth Planning > Retirement Planning
                                if (combined.includes('retirement') || combined.includes('pension')) {
                                  return { category: 'wealth_planning', subcategory: 'retirement_planning' }
                                }

                                // Philanthropy → Wealth Planning > Philanthropy
                                if (combined.includes('philanthropy') || combined.includes('charity') ||
                                    combined.includes('giving') || combined.includes('foundation')) {
                                  return { category: 'wealth_planning', subcategory: 'philanthropy' }
                                }

                                // Insurance → Wealth Planning > Insurance
                                if (combined.includes('insurance') || combined.includes('risk management')) {
                                  return { category: 'wealth_planning', subcategory: 'insurance' }
                                }

                                // Corporate Law → Legal Services > Corporate Law
                                if (combined.includes('corporate') || combined.includes('company formation') ||
                                    combined.includes('business structure')) {
                                  return { category: 'legal_services', subcategory: 'corporate_law' }
                                }

                                // Legal/Compliance → Legal Services
                                if (combined.includes('legal') || combined.includes('law') ||
                                    combined.includes('compliance') || combined.includes('regulation')) {
                                  return { category: 'legal_services', subcategory: null }
                                }

                                // Family Office → Family Office
                                if (combined.includes('family office')) {
                                  // Setup
                                  if (combined.includes('setup') || combined.includes('establish')) {
                                    return { category: 'family_office', subcategory: 'setup' }
                                  }
                                  // Governance
                                  if (combined.includes('governance') || combined.includes('succession')) {
                                    return { category: 'family_office', subcategory: 'governance' }
                                  }
                                  // Concierge
                                  if (combined.includes('concierge') || combined.includes('lifestyle')) {
                                    return { category: 'family_office', subcategory: 'concierge' }
                                  }
                                  // Education
                                  if (combined.includes('education') || combined.includes('next-gen')) {
                                    return { category: 'family_office', subcategory: 'education' }
                                  }
                                  return { category: 'family_office', subcategory: null }
                                }

                                // Portfolio Management → Family Office
                                if (combined.includes('portfolio management') || combined.includes('wealth management')) {
                                  return { category: 'family_office', subcategory: null }
                                }

                                // Default: no filters
                                return { category: null, subcategory: null }
                              }

                              const filters = mapToExecutorFilters(center)
                              let route = 'trusted-network'

                              // Build URL with filters
                              const params = new URLSearchParams()
                              if (filters.category) params.append('category', filters.category)
                              if (filters.subcategory) params.append('subcategory', filters.subcategory)

                              if (params.toString()) {
                                route = `trusted-network?${params.toString()}`
                              }

                              onNavigate(route)
                            }
                          }}
                          className="w-full px-3 py-2 text-xs font-medium rounded transition-colors bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-1"
                        >
                          {center.source?.toLowerCase().includes('crown vault') || center.victor_score
                            ? 'Know More →'
                            : 'Execute →'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Fallback for simple markers */}
                {!center.title && (
                  <>
                    {center.population && (
                      <div className="mt-2">
                        <p className="text-xs">Value: {formatValue(center.population)}</p>
                      </div>
                    )}
                    {center.type && (
                      <p className="text-xs capitalize mt-1">Type: {center.type}</p>
                    )}
                  </>
                )}
              </div>
                )}
              </Popup>
            </Marker>
          )
        })}

        {/* Fly to city helper */}
        <FlyToCity city={flyToCity} />

        {/* Reset view helper */}
        <ResetView
          shouldReset={resetView}
          onReset={() => setResetView(false)}
        />

        {/* Map click handler - reset icons to dots on map click */}
        <MapClickHandler onMapClick={handleMapClick} />
      </MapContainer>

      {/* Mobile World View - Matching desktop styling */}
      <button
        onClick={handleReset}
        className="no-hover-transform lg:hidden fixed bottom-[120px] md:bottom-[60px] left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-auto text-xs h-7 px-2.5 flex items-center gap-1 transition-colors rounded-3xl group text-muted-foreground hover:bg-black whitespace-nowrap select-none focus:outline-none"
        aria-label="World View"
        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
      >
        <span className={theme === 'dark' ? 'group-hover:text-primary' : 'group-hover:text-white'}>🌍 World View</span>
      </button>

      {/* Mobile Filter Controls - Icon only, horizontal layout */}
      <div className="lg:hidden fixed bottom-[170px] md:bottom-[110px] left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-auto">
        <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-full px-3 py-2 shadow-lg">
          {onToggleCrownAssets && (
            <button
              onClick={onToggleCrownAssets}
              className={`no-hover-transform w-8 h-8 flex items-center justify-center transition-colors rounded-full group ${
                showCrownAssets
                  ? theme === 'dark'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-black text-white'
                  : 'text-muted-foreground hover:bg-black'
              }`}
              aria-label="Toggle Crown Assets"
            >
              <Crown className={`h-4 w-4 ${!showCrownAssets ? (theme === 'dark' ? 'group-hover:text-primary' : 'group-hover:text-white') : ''}`} />
            </button>
          )}

          {onTogglePriveOpportunities && (
            <button
              onClick={onTogglePriveOpportunities}
              className={`no-hover-transform w-8 h-8 flex items-center justify-center transition-colors rounded-full group ${
                showPriveOpportunities
                  ? theme === 'dark'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-black text-white'
                  : 'text-muted-foreground hover:bg-black'
              }`}
              aria-label="Toggle Privé Opportunities"
            >
              <TrendingUp className={`h-4 w-4 ${!showPriveOpportunities ? (theme === 'dark' ? 'group-hover:text-primary' : 'group-hover:text-white') : ''}`} />
            </button>
          )}

          {onToggleHNWIPatterns && (
            <button
              onClick={onToggleHNWIPatterns}
              className={`no-hover-transform w-8 h-8 flex items-center justify-center transition-colors rounded-full group ${
                showHNWIPatterns
                  ? theme === 'dark'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-black text-white'
                  : 'text-muted-foreground hover:bg-black'
              }`}
              aria-label="Toggle HNWI Patterns"
            >
              <Globe className={`h-4 w-4 ${!showHNWIPatterns ? (theme === 'dark' ? 'group-hover:text-primary' : 'group-hover:text-white') : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Desktop Navigation - Filters and Jump To Section */}
      <div className="hidden lg:block fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-auto">
        <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
          {/* Filter Buttons */}
          {onToggleCrownAssets && (
            <button
              onClick={onToggleCrownAssets}
              className={`no-hover-transform text-xs h-7 px-2.5 flex items-center gap-1 transition-colors rounded-3xl group ${
                showCrownAssets
                  ? theme === 'dark'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'bg-black text-white font-medium'
                  : 'text-muted-foreground hover:bg-black'
              }`}
            >
              <Crown className={`h-3.5 w-3.5 ${!showCrownAssets ? (theme === 'dark' ? 'group-hover:text-primary' : 'group-hover:text-white') : ''}`} />
              <span className={!showCrownAssets ? (theme === 'dark' ? 'group-hover:text-primary' : 'group-hover:text-white') : ''}>Crown Assets</span>
            </button>
          )}

          {onTogglePriveOpportunities && (
            <button
              onClick={onTogglePriveOpportunities}
              className={`no-hover-transform text-xs h-7 px-2.5 flex items-center gap-1 transition-colors rounded-3xl group ${
                showPriveOpportunities
                  ? theme === 'dark'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'bg-black text-white font-medium'
                  : 'text-muted-foreground hover:bg-black'
              }`}
            >
              <TrendingUp className={`h-3.5 w-3.5 ${!showPriveOpportunities ? (theme === 'dark' ? 'group-hover:text-primary' : 'group-hover:text-white') : ''}`} />
              <span className={!showPriveOpportunities ? (theme === 'dark' ? 'group-hover:text-primary' : 'group-hover:text-white') : ''}>Privé Opportunities</span>
            </button>
          )}

          {onToggleHNWIPatterns && (
            <button
              onClick={onToggleHNWIPatterns}
              className={`no-hover-transform text-xs h-7 px-2.5 flex items-center gap-1 transition-colors rounded-3xl group ${
                showHNWIPatterns
                  ? theme === 'dark'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'bg-black text-white font-medium'
                  : 'text-muted-foreground hover:bg-black'
              }`}
            >
              <Globe className={`h-3.5 w-3.5 ${!showHNWIPatterns ? (theme === 'dark' ? 'group-hover:text-primary' : 'group-hover:text-white') : ''}`} />
              <span className={!showHNWIPatterns ? (theme === 'dark' ? 'group-hover:text-primary' : 'group-hover:text-white') : ''}>HNWI Patterns</span>
            </button>
          )}

          <div className="h-4 w-px bg-border mx-1" />

          <span className="text-xs font-medium text-muted-foreground mr-1">Jump to:</span>

          <button
            onClick={handleReset}
            className="no-hover-transform text-xs h-7 px-2.5 flex items-center gap-1 transition-colors rounded-3xl group text-muted-foreground hover:bg-black"
          >
            <span className={theme === 'dark' ? 'group-hover:text-primary' : 'group-hover:text-white'}>🌍 World View</span>
          </button>
        </div>
      </div>

      {/* Custom marker styles */}
      <style jsx global>{`
        /* Force Leaflet popup pane to high z-index to appear above Live Data button */
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
        /* Position popup below marker */
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
        .border-border {
          border-color: ${theme === "dark" ? "#555" : "#e5e5e5"} !important;
        }
        .text-muted-foreground {
          color: ${theme === "dark" ? "#bbb" : "#666"} !important;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* Citation styles - clickable Dev ID references */
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
        citation:active {
          transform: translateY(1px);
        }
        .citation-content {
          line-height: 1.6;
        }
        /* Expand/Collapse button hover effect */
        .leaflet-popup-content button:hover {
          opacity: 0.8;
        }
        /* Smooth expand/collapse animation - grow downward */
        .expanded-details {
          animation: slideDown 0.2s ease-out;
          transform-origin: top;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: scaleY(0.8);
          }
          to {
            opacity: 1;
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  )
}
