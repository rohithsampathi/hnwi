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
      },
      // Prevent caching issues in server-side rendering
      cache: 'no-store'
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
    // Since the API doesn't support individual opportunity endpoints,
    // fetch all opportunities and find the one with matching ID
    const opportunities = await getOpportunities();
    const opportunity = opportunities.find(opp => opp.id === id);
    
    if (!opportunity) {
      console.log(`Opportunity with ID ${id} not found in the collection`);
      return null;
    }
    
    return opportunity;
  } catch (error) {
    console.error(`Failed to fetch opportunity with ID ${id}:`, error);
    return null;
  }
}

// Crown Vault API Functions
export interface CrownVaultAsset {
  asset_id: string;
  asset_data: {
    name: string;
    asset_type: string;
    value: number;
    currency: string;
    location?: string;
    notes?: string;
  };
  heir_ids: string[];
  heir_names: string[];
  created_at: string;
}

export interface CrownVaultHeir {
  id: string;
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at: string;
}

export interface CrownVaultStats {
  total_assets: number;
  total_value: number;
  total_heirs: number;
  last_updated: string;
  asset_breakdown: {
    [key: string]: {
      count: number;
      total_value: number;
    };
  };
  recent_activity: {
    action: string;
    asset_name?: string;
    timestamp: string;
    details: string;
  }[];
}

export interface BatchAssetResponse {
  assets: CrownVaultAsset[];
  total_value: number;
  suggested_heirs: {
    name: string;
    relationship: string;
    confidence_score: number;
  }[];
}

// Get user ID from multiple sources (localStorage, session, mixpanel)
function getCurrentUserId(): string {
  if (typeof window !== 'undefined') {
    // First try localStorage
    let userId = localStorage.getItem('userId');
    if (userId && userId !== 'dev_user_id') {
      return userId;
    }

    // Try to get from mixpanel cookie which contains the user_id
    try {
      const mixpanelCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('mp_e6df9ca97b553d8a7954cda47f2f6516_mixpanel='));
      
      if (mixpanelCookie) {
        const mixpanelData = JSON.parse(decodeURIComponent(mixpanelCookie.split('=')[1]));
        if (mixpanelData.$user_id || mixpanelData.distinct_id) {
          const userId = mixpanelData.$user_id || mixpanelData.distinct_id;
          // Store it in localStorage for future use
          localStorage.setItem('userId', userId);
          return userId;
        }
      }
    } catch (error) {
      // Ignore cookie parsing errors
    }

    // Fallback to dev_user_id
    return 'dev_user_id';
  }
  return 'dev_user_id';
}

// Crown Vault Assets API
export async function getCrownVaultAssets(ownerId?: string): Promise<CrownVaultAsset[]> {
  try {
    const userId = ownerId || getCurrentUserId();
    // Call backend API directly for assets
    const response = await fetch(`${API_BASE_URL}/api/crown-vault/assets/detailed?owner_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Error fetching Crown Vault assets: ${response.status}`);
    }

    const data = await response.json();
    const assets = data.assets || data || [];
    
    // Ensure each asset has proper structure
    return assets.filter((asset: any) => 
      asset && 
      asset.asset_id && 
      asset.asset_data &&
      typeof asset.asset_data === 'object'
    ).map((asset: any) => ({
      ...asset,
      asset_data: {
        name: asset.asset_data.name || 'Unnamed Asset',
        asset_type: asset.asset_data.asset_type || 'Unknown',
        value: asset.asset_data.value || 0,
        currency: asset.asset_data.currency || 'USD',
        location: asset.asset_data.location || '',
        notes: asset.asset_data.notes || '',
        ...asset.asset_data
      },
      heir_ids: asset.heir_ids || [],
      heir_names: asset.heir_names || [],
      created_at: asset.created_at || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to fetch Crown Vault assets:', error);
    return [];
  }
}

export async function getCrownVaultStats(ownerId?: string): Promise<CrownVaultStats> {
  try {
    const userId = ownerId || getCurrentUserId();
    
    // Fetch stats, heirs, and assets in parallel  
    const [statsResponse, heirsResponse, assetsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/crown-vault/stats?owner_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        cache: 'no-store'
      }),
      fetch(`${API_BASE_URL}/api/crown-vault/heirs/?owner_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        cache: 'no-store'
      }),
      fetch(`${API_BASE_URL}/api/crown-vault/assets/detailed?owner_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        cache: 'no-store'
      })
    ]);

    if (!statsResponse.ok) {
      throw new Error(`Error fetching Crown Vault stats: ${statsResponse.status}`);
    }

    const statsData = await statsResponse.json();
    const heirsData = heirsResponse.ok ? await heirsResponse.json() : [];
    const heirsCount = Array.isArray(heirsData) ? heirsData.length : 0;
    const assetsData = assetsResponse.ok ? await assetsResponse.json() : [];

    // Generate recent activity from assets (most recent first)
    const recentActivity = Array.isArray(assetsData) ? assetsData
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA; // Newest first
      })
      .slice(0, 5) // Take only 5 most recent
      .map((asset: any) => ({
        action: "asset_added",
        asset_name: asset.asset_data?.name || 'Unnamed Asset',
        timestamp: asset.created_at || new Date().toISOString(),
        details: `Added ${asset.asset_data?.name || 'asset'} worth $${(asset.asset_data?.value || 0).toLocaleString()}`
      })) : [];

    // Transform backend stats format to match frontend expectations
    return {
      total_assets: statsData.total_assets || 0,
      total_value: statsData.total_value_usd || 0,
      total_heirs: heirsCount,
      last_updated: statsData.last_snapshot || new Date().toISOString(),
      asset_breakdown: statsData.assets_by_type || {},
      recent_activity: recentActivity
    };
  } catch (error) {
    console.error('Failed to fetch Crown Vault stats:', error);
    return {
      total_assets: 0,
      total_value: 0,
      total_heirs: 0,
      last_updated: new Date().toISOString(),
      asset_breakdown: {},
      recent_activity: []
    };
  }
}

export async function getCrownVaultHeirs(ownerId?: string): Promise<CrownVaultHeir[]> {
  try {
    const userId = ownerId || getCurrentUserId();
    // Call backend API directly to get heirs from MongoDB
    const response = await fetch(`${API_BASE_URL}/api/crown-vault/heirs/?owner_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Error fetching Crown Vault heirs: ${response.status}`);
    }

    const data = await response.json();
    const heirs = data.heirs || data || [];
    
    // Ensure each heir has proper structure
    const filteredHeirs = heirs.filter((heir: any) => 
      heir && (heir.id || heir.heir_id) && heir.name
    );
    
    return filteredHeirs.map((heir: any) => ({
      id: heir.id || heir.heir_id,
      name: heir.name || 'Unknown Heir',
      relationship: heir.relationship || 'Family Member',
      email: heir.email || '',
      phone: heir.phone || '',
      notes: heir.notes || '',
      created_at: heir.created_at || new Date().toISOString(),
      ...heir
    }));
  } catch (error) {
    console.error('Failed to fetch Crown Vault heirs:', error);
    return [];
  }
}

export async function processCrownVaultAssetsBatch(
  rawText: string,
  context?: string,
  ownerId?: string
): Promise<BatchAssetResponse> {
  try {
    const userId = ownerId || getCurrentUserId();
    // Call backend API directly for asset batch processing
    const response = await fetch(`${API_BASE_URL}/api/crown-vault/assets/batch?owner_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId
      },
      body: JSON.stringify({
        raw_text: rawText,
        context: context || ''
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error processing assets: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to process Crown Vault assets batch:', error);
    throw error;
  }
}

export async function createHeir(
  heirData: {
    name: string;
    relationship: string;
    email?: string;
    phone?: string;
    notes?: string;
  },
  ownerId?: string
): Promise<CrownVaultHeir> {
  try {
    const userId = ownerId || getCurrentUserId();
    
    // Filter out empty email and phone fields to avoid backend validation errors
    const filteredData = Object.entries(heirData).reduce((acc, [key, value]) => {
      if ((key === 'email' || key === 'phone') && value === '') {
        // Don't include empty email or phone fields
        return acc;
      }
      acc[key] = value;
      return acc;
    }, {} as any);
    
    // Use backend API directly for heir creation
    const response = await fetch(`${API_BASE_URL}/api/crown-vault/heirs/?owner_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId
      },
      body: JSON.stringify(filteredData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creating heir: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Transform backend response to match frontend interface
    return {
      id: data.id,
      name: data.name,
      relationship: data.relationship,
      email: data.email || '',
      phone: data.phone || '',
      notes: data.notes || '',
      created_at: data.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to create heir:', error);
    throw error;
  }
}

export async function updateHeir(
  heirId: string,
  heirData: {
    name?: string;
    relationship?: string;
    email?: string;
    phone?: string;
    notes?: string;
  },
  ownerId?: string
): Promise<CrownVaultHeir> {
  try {
    const userId = ownerId || getCurrentUserId();
    
    // Filter out empty email and phone fields to avoid backend validation errors
    const filteredData = Object.entries(heirData).reduce((acc, [key, value]) => {
      if ((key === 'email' || key === 'phone') && value === '') {
        // Don't include empty email or phone fields
        return acc;
      }
      acc[key] = value;
      return acc;
    }, {} as any);
    
    const response = await fetch(`${API_BASE_URL}/api/crown-vault/heirs/${heirId}?owner_id=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId
      },
      body: JSON.stringify(filteredData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error updating heir: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      id: data.heir?.id || heirId,
      name: data.heir?.name || heirData.name || '',
      relationship: data.heir?.relationship || heirData.relationship || '',
      email: data.heir?.email || heirData.email || '',
      phone: data.heir?.phone || heirData.phone || '',
      notes: data.heir?.notes || heirData.notes || '',
      created_at: data.heir?.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to update heir:', error);
    throw error;
  }
}

export async function deleteHeir(heirId: string, ownerId?: string): Promise<void> {
  try {
    const userId = ownerId || getCurrentUserId();
    const response = await fetch(`${API_BASE_URL}/api/crown-vault/heirs/${heirId}?owner_id=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error deleting heir: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Failed to delete heir:', error);
    throw error;
  }
}

export async function updateAssetHeirs(
  assetId: string,
  heirIds: string[],
  ownerId?: string
): Promise<{ success: boolean; message: string; heir_names: string[] }> {
  try {
    
    const userId = ownerId || getCurrentUserId();
    
    // Backend needs current user ID as query parameter for authentication and ownership validation
    const response = await fetch(`${API_BASE_URL}/api/crown-vault/assets/${assetId}/heirs?owner_id=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId  // Send actual current user ID
      },
      body: JSON.stringify(heirIds) // Array of heir ID strings
    });

    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Error updating asset heirs: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      success: data.success || true,
      message: data.message || 'Asset reassigned successfully',
      heir_names: data.heir_names || []
    };
  } catch (error) {
    console.error('Failed to update asset heirs:', error);
    throw error;
  }
}