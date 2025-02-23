import type { LocationPrice, MetalData } from "@/types/metals"

export function groupMetalDataByLocation(metalsData: MetalData[]) {
  const locationMap = new Map<string, LocationPrice[]>()

  metalsData.forEach((metal) => {
    metal.location_prices.forEach((locationPrice) => {
      if (!locationMap.has(locationPrice.location)) {
        locationMap.set(locationPrice.location, [])
      }
      locationMap.get(locationPrice.location)?.push({
        ...locationPrice,
        timestamp: metal.timestamp,
        base_price_usd: metal.base_price_usd,
        metal_name: metal.name,
      })
    })
  })

  return Array.from(locationMap.entries()).map(([location, prices]) => ({
    location,
    prices: prices.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  }))
}

export function getLatestLocationPrices(metalsData: MetalData[]) {
  if (!metalsData.length) return []

  // Get the most recent metal data entry
  const latestData = metalsData.reduce((latest, current) => {
    return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
  }, metalsData[0])

  return latestData.location_prices
}

