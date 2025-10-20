// lib/map-markers.tsx
// Marker creation utilities for the interactive world map

import L from "leaflet"
import type { City } from "@/components/interactive-world-map"
import { getCategoryIcon } from "@/lib/map-utils"

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

  // Choose icon SVG based on source (using exact Lucide icon paths)
  let iconSvg = ''
  if (isCrownVault) {
    // Crown icon for Crown Vault
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
      <path d="M5 21h14"/>
    </svg>`
  } else if (isVictor) {
    // Gem icon for Privé Exchange
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <path d="M6 3h12l4 6-10 13L2 9Z"/>
      <path d="M11 3 8 9l4 13 4-13-3-6"/>
      <path d="M2 9h20"/>
    </svg>`
  } else {
    // Globe icon for HNWI World
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
      <path d="M2 12h20"/>
    </svg>`
  }

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
