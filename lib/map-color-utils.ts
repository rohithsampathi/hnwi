// lib/map-color-utils.ts
// Color calculations and clustering utilities for the map

import chroma from "chroma-js"
import type { City } from "@/components/interactive-world-map"
import { parseValueToNumber } from "@/lib/map-utils"

export const MAP_PRICE_COLOR_MIN = 0
export const MAP_PRICE_COLOR_TOPAZ_START = 5_000_000
export const MAP_PRICE_COLOR_RUBY_START = 10_000_000
export const MAP_PRICE_COLOR_MAX = 20_000_000
export const MAP_PRICE_FILTER_MAX = MAP_PRICE_COLOR_MAX

// Gradient color stops - SINGLE SOURCE OF TRUTH for all map colors
// Green: under $5M, Yellow/Topaz: $5M-$10M, Red/Ruby: $10M+
// EXPORTED for use in both map markers AND price range slider
export const GRADIENT_COLORS = [
  // Green/Emerald - $0 to under $5M
  { pos: 0, color: [13, 92, 58], hex: '#0d5c3a' },      // $0
  { pos: 5, color: [15, 105, 65], hex: '#0f6941' },     // $1M
  { pos: 10, color: [18, 125, 75], hex: '#127d4b' },    // $2M
  { pos: 15, color: [23, 155, 92], hex: '#179b5c' },    // $3M
  { pos: 20, color: [27, 175, 105], hex: '#1baf69' },   // $4M

  // Yellow/Topaz - $5M to under $10M
  { pos: 25, color: [255, 215, 0], hex: '#ffd700' },    // $5M
  { pos: 30, color: [255, 210, 0], hex: '#ffd200' },    // $6M
  { pos: 35, color: [255, 205, 0], hex: '#ffcd00' },    // $7M
  { pos: 40, color: [255, 200, 0], hex: '#ffc800' },    // $8M
  { pos: 45, color: [255, 185, 0], hex: '#ffb900' },    // $9M

  // Red/Ruby - $10M+
  { pos: 50, color: [230, 57, 70], hex: '#e63946' },    // $10M
  { pos: 60, color: [220, 50, 65], hex: '#dc3241' },    // $12M
  { pos: 70, color: [210, 45, 60], hex: '#d22d3c' },    // $14M
  { pos: 80, color: [200, 40, 55], hex: '#c82837' },    // $16M
  { pos: 90, color: [193, 18, 31], hex: '#c1121f' },    // $18M
  { pos: 100, color: [128, 0, 32], hex: '#800020' }     // $20M+
] as const

type GradientColorStop = (typeof GRADIENT_COLORS)[number]

/**
 * Get color from gradient based on percentage (0-100)
 * This matches the exact logic used in the slider
 * EXPORTED for use in price range slider
 */
export function getGradientColorFromPercent(percent: number): string {
  // Find the two colors to interpolate between
  let lowerColor: GradientColorStop = GRADIENT_COLORS[0]
  let upperColor: GradientColorStop = GRADIENT_COLORS[GRADIENT_COLORS.length - 1]

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
 * Green: under $5M, Yellow/Topaz: $5M-$10M, Red/Ruby: $10M+
 */
export function createColorScale(): string[] {
  const scale = chroma.scale(GRADIENT_COLORS.map((stop) => stop.hex))
    .domain(GRADIENT_COLORS.map((stop) => stop.pos / 100))
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
    return { minValue: MAP_PRICE_COLOR_MIN, maxValue: MAP_PRICE_COLOR_MAX, valueRankMap: new Map() }
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
 * CRITICAL: When max is at the slider maximum, include ALL values above it.
 */
export function createPriceRangeMatcher(selectedPriceRange: { min: number; max: number }) {
  return (city: City): boolean => {
    const value = parseValueToNumber(city.value || city.population)

    if (selectedPriceRange.max === MAP_PRICE_FILTER_MAX) {
      return value >= selectedPriceRange.min
    }

    // Otherwise, normal range check
    return value >= selectedPriceRange.min && value <= selectedPriceRange.max
  }
}
