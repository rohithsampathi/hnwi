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

// Social Events
export interface SocialEvent {
  id: string
  name: string
  date: string
  time: string
  location: string
  attendees: string[]
  summary: string
  category: string
  start_date: string
  end_date: string
  venue: string
  status: string
  metadata?: {
    capacity?: number
    ticketing_url?: string
    contact_email?: string
  }
  tags?: string[]
}

export async function getEvents(): Promise<SocialEvent[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch events')
    }

    const data = await response.json()
    return data.events.map((event: any) => ({
      id: event.id,
      name: event.name,
      date: new Date(event.start_date).toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric', 
        year: 'numeric'
      }),
      time: new Date(event.start_date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric'
      }),
      location: event.location,
      attendees: event.attendees,
      summary: event.summary,
      category: event.category,
      start_date: event.start_date,
      end_date: event.end_date,
      venue: event.venue,
      status: event.status,
      metadata: event.metadata,
      tags: event.tags
    }))
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

// Investment Opportunities
export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  industry?: string;
  product?: string;
  is_active: boolean;
  region: string;
  country: string;
  type?: string;
  value?: string;
  riskLevel?: string;
  expectedReturn?: string;
  investmentHorizon?: string;
  pros?: string[];
  cons?: string[];
  fullAnalysis?: string;
}

export async function getOpportunities(): Promise<Opportunity[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/opportunities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching opportunities: ${response.status}`);
    }
    
    const data = await response.json();
    return data as Opportunity[];
  } catch (error) {
    console.error("Failed to fetch opportunities:", error);
    return [];
  }
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/opportunities/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // Make sure this works in both client and server components
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching opportunity: ${response.status}`);
    }
    
    return await response.json() as Opportunity;
  } catch (error) {
    console.error(`Failed to fetch opportunity with ID ${id}:`, error);
    return null;
  }
}