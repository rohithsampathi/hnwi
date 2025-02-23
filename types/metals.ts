export interface LocationPrice {
  location: string
  bid: number
  ask: number
  spot: number
  premium_percent: number
  currency: string
  last_updated: string
  timestamp?: string
  base_price_usd?: number
  metal_name?: string
}

export interface MetalData {
  name: string
  timestamp: string
  base_price_usd: number
  price_per_gram: number
  price_per_kilo: number
  source: string
  location_prices: LocationPrice[]
}

export interface MetalsResponse {
  data: {
    metals: MetalData[]
  }
  timestamp: string
  status: string
  message: string
}

