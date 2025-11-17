// lib/map-markers.tsx
// Marker creation utilities for the interactive world map

import L from "leaflet"
import type { City } from "@/components/interactive-world-map"
import { getCategoryIcon } from "@/lib/map-utils"

/**
 * Get small marker icon based on category (for map dots)
 * Uses the SAME icons as getCategoryIcon in map-utils.ts, but scaled to 10x10
 * Returns SVG string for the small 10x10 icon inside the marker dot
 */
function getSmallMarkerIcon(city: City, isCrownVault: boolean, isVictor: boolean): string {
  const title = (city.title || '').toLowerCase()
  const analysis = (city.analysis || '').toLowerCase()
  const combined = title + ' ' + analysis
  const category = (city.category || '').toLowerCase()
  const industry = (city.industry || '').toLowerCase()
  const product = (city.product || '').toLowerCase()
  const backendData = (category + ' ' + industry + ' ' + product).toLowerCase()

  // Crown Vault assets - always show crown icon
  if (isCrownVault) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
      <path d="M5 21h14"/>
    </svg>`
  }

  // Privé Exchange (Victor scored) - show gem icon
  if (isVictor) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <path d="M6 3h12l4 6-10 13L2 9Z"/>
      <path d="M11 3 8 9l4 13 4-13-3-6"/>
      <path d="M2 9h20"/>
    </svg>`
  }

  // HNWI Pattern opportunities - use SAME icons as getCategoryIcon (map-utils.ts)
  // Check backend data first, then fallback to text matching
  // ORDER MATTERS: Check "real estate" BEFORE "estate" (villa) to avoid false matches

  // COMMERCIAL REAL ESTATE & BUILDINGS - Building with windows (CHECK FIRST!)
  // Must check before VILLAS because "Real Estate" contains "estate"
  if (backendData.includes('real estate') || backendData.includes('commercial') ||
      backendData.includes('office') || backendData.includes('building') ||
      backendData.includes('property') ||
      combined.includes('real estate') || combined.includes('property') ||
      combined.includes('commercial property') || combined.includes('real-estate')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <rect x="3" y="1" width="18" height="22" rx="1"/>
      <rect x="7" y="5" width="3" height="3"/>
      <rect x="14" y="5" width="3" height="3"/>
      <rect x="7" y="11" width="3" height="3"/>
      <rect x="14" y="11" width="3" height="3"/>
      <rect x="7" y="17" width="3" height="3"/>
      <rect x="14" y="17" width="3" height="3"/>
    </svg>`
  }

  // WATCHES & TIMEPIECES
  if (backendData.includes('watch') || backendData.includes('timepiece') ||
      backendData.includes('rolex') || backendData.includes('omega') ||
      backendData.includes('patek') || backendData.includes('cartier') ||
      combined.includes('watch') || combined.includes('rolex') ||
      combined.includes('omega') || combined.includes('patek') ||
      combined.includes('cartier') || combined.includes('tissot') ||
      combined.includes('seiko') || combined.includes('timepiece')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="1.5" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <circle cx="12" cy="12" r="6"/>
      <polyline points="12 10 12 12 13 13"/>
      <path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05"/>
      <path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"/>
    </svg>`
  }

  // APARTMENTS & RESIDENTIAL
  if (backendData.includes('apartment') || backendData.includes('residential') ||
      backendData.includes('condo') || backendData.includes('flat') ||
      combined.includes('apartment') || combined.includes('bhk') ||
      combined.includes('residential complex')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="1.5" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <rect x="6" y="3" width="12" height="18" rx="1"/>
      <line x1="6" y1="7" x2="18" y2="7"/>
      <line x1="6" y1="11" x2="18" y2="11"/>
      <line x1="6" y1="15" x2="18" y2="15"/>
      <line x1="10" y1="3" x2="10" y2="21"/>
      <line x1="14" y1="3" x2="14" y2="21"/>
    </svg>`
  }

  // VILLAS & LUXURY HOMES (after real estate check)
  if (backendData.includes('villa') || backendData.includes('mansion') ||
      backendData.includes('luxury home') || backendData.includes('estate') ||
      combined.includes('villa') || combined.includes('mansion') ||
      combined.includes('luxury home') ||
      (combined.includes('residence') && !combined.includes('watch'))) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="1.5" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>`
  }

  // VEHICLES & AUTOMOBILES
  if (backendData.includes('vehicle') || backendData.includes('car') ||
      backendData.includes('automobile') || backendData.includes('auto') ||
      combined.includes('car') || combined.includes('vehicle') ||
      combined.includes('harrier') || combined.includes('tata') ||
      combined.includes('automobile')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="1.5" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/>
      <path d="M9 17h6"/>
      <circle cx="17" cy="17" r="2"/>
    </svg>`
  }

  // LAND & AGRICULTURE
  if (backendData.includes('land') || backendData.includes('agriculture') ||
      backendData.includes('farm') || backendData.includes('plot') ||
      backendData.includes('acres') || backendData.includes('aquaculture') ||
      combined.includes('land') || combined.includes('plot') ||
      combined.includes('agriculture') || combined.includes('aquaculture') ||
      combined.includes('farm') || combined.includes('acres') ||
      combined.includes('living space')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="1.5" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <path d="M2 22h20"/>
      <path d="M3.77 10.77 2 9l2-2 1.77 1.77z"/>
      <path d="M7.54 14.54 6 13l2-2 1.54 1.54z"/>
      <path d="M11.31 18.31 10 17l2-2 1.31 1.31z"/>
      <path d="M15.08 22.08 14 21l2-2 1.08 1.08z"/>
      <path d="M18.77 10.77 17 9l2-2 1.77 1.77z"/>
      <path d="M14.54 14.54 13 13l2-2 1.54 1.54z"/>
      <path d="M10.31 18.31 9 17l2-2 1.31 1.31z"/>
      <path d="M6.08 22.08 5 21l2-2 1.08 1.08z"/>
    </svg>`
  }

  // GOLD & PRECIOUS METALS
  if (backendData.includes('gold') || backendData.includes('silver') ||
      backendData.includes('metal') || backendData.includes('precious metal') ||
      backendData.includes('bullion') ||
      combined.includes('gold bars') || combined.includes('gold bar') ||
      combined.includes('silver bars') || combined.includes('metal bars') ||
      (combined.includes('gold') && !combined.includes('jewelry'))) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="1.5" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <rect x="3" y="4" width="18" height="4" rx="1"/>
      <rect x="3" y="10" width="18" height="4" rx="1"/>
      <rect x="3" y="16" width="18" height="4" rx="1"/>
    </svg>`
  }

  // JEWELRY & COLLECTIBLES
  if (backendData.includes('jewelry') || backendData.includes('jewellery') ||
      backendData.includes('diamond') || backendData.includes('collectible') ||
      combined.includes('jewelry') || combined.includes('jewellery') ||
      combined.includes('necklace') || combined.includes('bracelet') ||
      combined.includes('earring') || combined.includes('pendant')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="1.5" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>`
  }

  // ART & LUXURY GOODS
  if (backendData.includes('art') || backendData.includes('painting') ||
      backendData.includes('sculpture') || backendData.includes('luxury') ||
      combined.includes('art') || combined.includes('painting') ||
      combined.includes('sculpture') || combined.includes('luxury')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="1.5" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M3 16l5-5 5 5 5-5 3 3"/>
    </svg>`
  }

  // Default: Generic opportunity/investment icon (layers - same as getCategoryIcon default)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="1.5" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>`
}

/**
 * Create a custom marker icon
 */
export function createCustomIcon(
  city: City,
  clusterIndex: number,
  theme: string,
  getColorFromValue: (value: string | undefined) => string,
  openPopupIndex: number | null
): L.DivIcon {
  const color = getColorFromValue(city.value || city.population)

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
      popupAnchor: [0, 25]
    })
  }

  // Default: always show fully visible colored dot
  const isCrownVault = city.source?.toLowerCase().includes('crown vault')
  const isVictor = !!city.victor_score

  // Choose icon SVG based on CATEGORY first, then fallback to source
  const iconSvg = getSmallMarkerIcon(city, isCrownVault, isVictor)

  // Make the marker blink (opacity change) if opportunity is new
  // STRICT CHECK: Only blink if is_new === true (not just truthy)
  const shouldBlink = city.is_new === true;
  const blinkAnimation = shouldBlink ? `
    <style>
      @keyframes blink-marker {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.3;
          transform: scale(0.95);
        }
      }
    </style>
  ` : ''

  const iconHtml = `
    ${blinkAnimation}
    <div style="
      position: relative;
      width: 16px;
      height: 16px;
    ">
      <div style="
        width: 16px;
        height: 16px;
        background: ${color};
        opacity: 1;
        border: 1px solid ${color};
        border-radius: 50%;
        box-shadow: 0 0 8px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        ${shouldBlink ? `animation: blink-marker 1s ease-in-out infinite;` : ''}
      ">
        ${iconSvg}
      </div>
    </div>
  `

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, 15]
  })
}

/**
 * Create a cluster icon
 */
export function createClusterIcon(count: number, primaryType: string, theme: string): L.DivIcon {
  const borderColor = theme === "dark" ? "#ddd" : "#333"
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
    popupAnchor: [0, 22]
  })
}
