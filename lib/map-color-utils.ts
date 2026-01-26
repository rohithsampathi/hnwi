// lib/map-color-utils.ts
// Color calculations and clustering utilities for the map

import chroma from "chroma-js"
import type { City } from "@/components/interactive-world-map"
import { parseValueToNumber } from "@/lib/map-utils"

// Gradient color stops - SINGLE SOURCE OF TRUTH for all map colors
// Green: $0-$350K (0-17.5%), Yellow/Gold: $350K-$900K (17.5-45%), Red: $900K-$2M+ (45-100%)
// EXPORTED for use in both map markers AND price range slider
export const GRADIENT_COLORS = [
  // 🟢 GREEN (Emerald) - $0 to $350K (0-17.5%)
  { pos: 0, color: [13, 92, 58], hex: '#0d5c3a' },      // $0 - Deep dark emerald
  { pos: 3, color: [15, 105, 65], hex: '#0f6941' },     // $50K - Rich emerald
  { pos: 5, color: [18, 125, 75], hex: '#127d4b' },     // $100K - Deep emerald
  { pos: 8, color: [20, 140, 85], hex: '#148c55' },     // $150K - Vibrant emerald
  { pos: 10, color: [23, 155, 92], hex: '#179b5c' },    // $200K - Bright emerald
  { pos: 12.5, color: [25, 165, 98], hex: '#19a562' },  // $250K - Medium emerald
  { pos: 15, color: [27, 175, 105], hex: '#1baf69' },   // $300K - Light emerald
  { pos: 17.5, color: [30, 185, 110], hex: '#1eb96e' }, // $350K - Lighter emerald (GREEN ENDS)

  // 🟡 YELLOW/GOLD (Topaz) - $350K to $900K (17.5-45%)
  { pos: 17.5, color: [255, 215, 0], hex: '#ffd700' },  // $350K - Pure golden topaz (YELLOW STARTS)
  { pos: 22, color: [255, 210, 0], hex: '#ffd200' },    // $450K - Rich gold
  { pos: 27, color: [255, 205, 0], hex: '#ffcd00' },    // $550K - Bright gold
  { pos: 32, color: [255, 200, 0], hex: '#ffc800' },    // $650K - Deep gold
  { pos: 38, color: [255, 195, 0], hex: '#ffc300' },    // $750K - Rich golden amber
  { pos: 42, color: [255, 190, 0], hex: '#ffbe00' },    // $850K - Golden amber
  { pos: 45, color: [255, 185, 0], hex: '#ffb900' },    // $900K - Rich amber (GOLD ENDS)

  // 🔴 RED (Ruby) - $900K to $2M+ (45-100%)
  { pos: 45, color: [230, 57, 70], hex: '#e63946' },    // $900K - Bright ruby red (RED STARTS)
  { pos: 52, color: [220, 50, 65], hex: '#dc3241' },    // $1.05M - Rich ruby
  { pos: 60, color: [210, 45, 60], hex: '#d22d3c' },    // $1.2M - Deep ruby
  { pos: 68, color: [205, 42, 57], hex: '#cd2a39' },    // $1.36M - Deeper ruby
  { pos: 76, color: [200, 40, 55], hex: '#c82837' },    // $1.52M - Deep red ruby
  { pos: 84, color: [193, 18, 31], hex: '#c1121f' },    // $1.68M - Dark ruby
  { pos: 92, color: [185, 16, 29], hex: '#b9101d' },    // $1.84M - Darker ruby
  { pos: 100, color: [128, 0, 32], hex: '#800020' }     // $2M+ - Deep dark burgundy ruby
] as const

/**
 * Get color from gradient based on percentage (0-100)
 * This matches the exact logic used in the slider
 * EXPORTED for use in price range slider
 */
export function getGradientColorFromPercent(percent: number): string {
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
 * Green: $0-$350K (0-17.5%), Yellow/Gold: $350K-$900K (17.5-45%), Red: $900K-$2M+ (45-100%)
 */
export function createColorScale(): string[] {
  const scale = chroma.scale([
    '#0d5c3a', // $0 - Deep dark emerald
    '#0f6941', // $50K - Rich emerald
    '#127d4b', // $100K - Deep emerald
    '#148c55', // $150K - Vibrant emerald
    '#179b5c', // $200K - Bright emerald
    '#19a562', // $250K - Medium emerald
    '#1baf69', // $300K - Light emerald
    '#1eb96e', // $350K - Lighter emerald (GREEN ENDS)
    '#ffd700', // $350K - Pure golden topaz (YELLOW STARTS)
    '#ffd200', // $450K - Rich gold
    '#ffcd00', // $550K - Bright gold
    '#ffc800', // $650K - Deep gold
    '#ffc300', // $750K - Rich golden amber
    '#ffbe00', // $850K - Golden amber
    '#ffb900', // $900K - Rich amber (GOLD ENDS)
    '#e63946', // $900K - Bright ruby red (RED STARTS)
    '#dc3241', // $1.05M - Rich ruby
    '#d22d3c', // $1.2M - Deep ruby
    '#cd2a39', // $1.36M - Deeper ruby
    '#c82837', // $1.52M - Deep red ruby
    '#c1121f', // $1.68M - Dark ruby
    '#b9101d', // $1.84M - Darker ruby
    '#800020'  // $2M+ - Deep dark burgundy ruby
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
 * CRITICAL: When max is at 2M (slider at maximum), include ALL values >= 2M
 */
export function createPriceRangeMatcher(selectedPriceRange: { min: number; max: number }) {
  return (city: City): boolean => {
    const value = parseValueToNumber(city.value || city.population)

    // When slider is at max (2M+), include all values >= 2M
    const MAX_VALUE = 2000000
    if (selectedPriceRange.max === MAX_VALUE) {
      return value >= selectedPriceRange.min
    }

    // Otherwise, normal range check
    return value >= selectedPriceRange.min && value <= selectedPriceRange.max
  }
}
