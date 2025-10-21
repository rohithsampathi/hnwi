// lib/map-color-utils.ts
// Color calculations and clustering utilities for the map

import chroma from "chroma-js"
import type { City } from "@/components/interactive-world-map"
import { parseValueToNumber } from "@/lib/map-utils"

/**
 * Create a color scale with 1000 smooth shades
 * Emerald → Topaz → Ruby gradient
 */
export function createColorScale(): string[] {
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
 * Get color from value using rank-based distribution
 */
export function getColorFromValue(
  value: string | undefined,
  valueRankMap: Map<number, number>,
  colorScale: string[]
): string {
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

  // Group cities by exact location
  const locationGroups = new Map<string, City[]>()

  filteredByPrice.forEach(city => {
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
 */
export function createPriceRangeMatcher(selectedPriceRange: { min: number; max: number }) {
  return (city: City): boolean => {
    const value = parseValueToNumber(city.value || city.population)
    return value >= selectedPriceRange.min && value <= selectedPriceRange.max
  }
}
