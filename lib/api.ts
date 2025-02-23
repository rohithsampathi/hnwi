// lib/api.ts

import { API_BASE_URL } from "@/config/api"

export interface CryptoData {
  symbol: string
  timestamp: string
  price_usd: number
  market_cap: number
  volume_24h: number
  percent_change_24h: number
  volume_7d?: number
  percent_change_7d?: number
  health_data?: {
    fear_greed_value: number
    fear_greed_classification: string
    bitcoin_dominance: number
    coindesk_price: number
    timestamp: string
  }
}

export interface CryptoResponse {
  data: {
    crypto: CryptoData[]
  }
  timestamp: string
  status: string
  message: string
}

export async function fetchCryptoData(timeRange: string): Promise<CryptoResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/financial/crypto?time_range=${timeRange}`)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }
    const data: CryptoResponse = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching crypto data:", error)
    throw error
  }
}

