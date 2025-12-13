// lib/map-color-utils.ts
// Color calculations and clustering utilities for the map

import chroma from "chroma-js"
import type { City } from "@/components/interactive-world-map"
import { parseValueToNumber } from "@/lib/map-utils"

// Gradient color stops - matches the slider exactly
// Green: 0-100K (0-10%), Yellow/Gold: 100K-800K (10-80%), Red: 800K-1M (80-100%)
const GRADIENT_COLORS = [
  { pos: 0, color: [13, 92, 58], hex: '#0d5c3a' },      // 0K - Deep dark emerald
  { pos: 5, color: [23, 165, 97], hex: '#17a561' },     // 50K - Vibrant emerald
  { pos: 10, color: [45, 209, 127], hex: '#2dd17f' },   // 100K - Bright emerald green
  { pos: 20, color: [80, 233, 145], hex: '#50e991' },   // 200K - Light emerald
  { pos: 30, color: [120, 240, 160], hex: '#78f0a0' },  // 300K - Lighter emerald
  { pos: 40, color: [255, 215, 0], hex: '#ffd700' },    // 400K - Pure golden topaz
  { pos: 50, color: [255, 200, 0], hex: '#ffc800' },    // 500K - Bright gold
  { pos: 60, color: [255, 176, 0], hex: '#ffb000' },    // 600K - Rich golden amber
  { pos: 70, color: [255, 150, 0], hex: '#ff9600' },    // 700K - Deep amber
  { pos: 80, color: [230, 57, 70], hex: '#e63946' },    // 800K - Bright ruby red (RED STARTS HERE)
  { pos: 90, color: [193, 18, 31], hex: '#c1121f' },    // 900K - Rich ruby
  { pos: 100, color: [128, 0, 32], hex: '#800020' }     // 1M - Deep dark burgundy ruby
]

/**
 * Get color from gradient based on percentage (0-100)
 * This matches the exact logic used in the slider
 */
function getGradientColorFromPercent(percent: number): string {
  // Find the two colors to interpolate between
  let lowerColor = GRADIENT_COLORS[0]
  let upperColor = GRADIENT_COLORS[GRADIENT_COLORS.length - 1]

  for (let i = 0; i < GRADIENT_COLORS.length - 1; i++) {
    if (percent >= GRADIENT_COLORS[i].pos && percent <= GRADIENT_COLORS[i + 1].pos) {
      lowerColor = GRADIENT_COLORS[i]
      upperColor = GRADIENT_COLORS[i + 1]
      break
    }
  }

  // Interpolate between the two colors
  const range = upperColor.pos - lowerColor.pos
  const rangePct = range === 0 ? 0 : (percent - lowerColor.pos) / range

  const r = Math.round(lowerColor.color[0] + (upperColor.color[0] - lowerColor.color[0]) * rangePct)
  const g = Math.round(lowerColor.color[1] + (upperColor.color[1] - lowerColor.color[1]) * rangePct)
  const b = Math.round(lowerColor.color[2] + (upperColor.color[2] - lowerColor.color[2]) * rangePct)

  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Create a color scale with 1000 smooth shades
 * Emerald → Topaz → Ruby gradient
 * Green: 0-100K (0-10%), Yellow/Gold: 100K-800K (10-80%), Red: 800K-1M (80-100%)
 */
export function createColorScale(): string[] {
  const scale = chroma.scale([
    '#0d5c3a', // 0K - Deep dark emerald
    '#17a561', // 50K - Vibrant emerald
    '#2dd17f', // 100K - Bright emerald green
    '#50e991', // 200K - Light emerald
    '#78f0a0', // 300K - Lighter emerald
    '#ffd700', // 400K - Pure golden topaz
    '#ffc800', // 500K - Bright gold
    '#ffb000', // 600K - Rich golden amber
    '#ff9600', // 700K - Deep amber
    '#e63946', // 800K - Bright ruby red (RED STARTS HERE)
    '#c1121f', // 900K - Rich ruby
    '#800020'  // 1M - Deep dark burgundy ruby
  ])
  .mode('lch') // LCH color space for vibrant, perceptually uniform gradients

  return scale.colors(1000)
}

/**
 * Calculate min/max values and create value rank map
 */
export function calculateValueRanking(cities: City[]): {
  minValue: number
  maxValue: number
  valueRankMap: Map<number, number>
} {
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
}

/**
 * Get color from value using percentage-based distribution (matches slider logic)
 */
export function getColorFromValue(
  value: string | undefined,
  minValue: number,
  maxValue: number
): string {
  const numValue = parseValueToNumber(value)

  if (numValue === 0 || maxValue === minValue) {
    // Fallback to lowest color
    return GRADIENT_COLORS[0].hex
  }

  // Calculate percentage position (0-100) based on value within min-max range
  const percent = ((numValue - minValue) / (maxValue - minValue)) * 100

  // Clamp to 0-100 range
  const clampedPercent = Math.max(0, Math.min(100, percent))

  return getGradientColorFromPercent(clampedPercent)
}

/**
 * Cluster cities by location and spread them in a grid pattern
 */
export function clusterCities(
  cities: City[],
  currentZoom: number,
  matchesPriceRange: (city: City) => boolean
): Array<{ cities: [City]; center: City }> {
  // Filter cities by price range first
  const filteredByPrice = cities.filter(matchesPriceRange)

  // Filter out cities with invalid coordinates
  const validCities = filteredByPrice.filter(city => {
    return city.latitude !== undefined &&
           city.longitude !== undefined &&
           typeof city.latitude === 'number' &&
           typeof city.longitude === 'number' &&
           !isNaN(city.latitude) &&
           !isNaN(city.longitude)
  })

  // Group cities by exact location
  const locationGroups = new Map<string, City[]>()

  validCities.forEach(city => {
    const key = `${city.latitude.toFixed(6)},${city.longitude.toFixed(6)}`
    if (!locationGroups.has(key)) {
      locationGroups.set(key, [])
    }
    locationGroups.get(key)!.push(city)
  })

  // Spread out markers at same location
  const spreadCities: Array<{ cities: [City]; center: City }> = []

  locationGroups.forEach((citiesAtLocation) => {
    if (citiesAtLocation.length === 1) {
      // Single marker - no need to spread
      spreadCities.push({
        cities: [citiesAtLocation[0]],
        center: citiesAtLocation[0]
      })
    } else {
      // Multiple markers at same location - arrange in a grid/matrix
      const count = citiesAtLocation.length
      const gridSize = Math.ceil(Math.sqrt(count))

      // Fixed spacing - dots maintain same geographic distance at all zoom levels
      const spacing = 0.04

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
}

/**
 * Check if a city matches the selected price range
 * CRITICAL: When max is at 1M (slider at maximum), include ALL values >= 1M
 */
export function createPriceRangeMatcher(selectedPriceRange: { min: number; max: number }) {
  return (city: City): boolean => {
    const value = parseValueToNumber(city.value || city.population)

    // When slider is at max (1M+), include all values >= 1M
    const MAX_VALUE = 1000000
    if (selectedPriceRange.max === MAX_VALUE) {
      return value >= selectedPriceRange.min
    }

    // Otherwise, normal range check
    return value >= selectedPriceRange.min && value <= selectedPriceRange.max
  }
}
