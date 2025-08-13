// lib/api.ts

import { SecureAPI, secureApi, CacheControl } from "@/lib/secure-api"

// Helper function to check if error is authentication-related
const isAuthError = (error: any): boolean => {
  const errorMessage = error?.message || error?.toString() || '';
  return errorMessage.includes('Authentication required') || 
         errorMessage.includes('please log in') || 
         error?.status === 401;
};

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
    const data: CryptoResponse = await SecureAPI.secureJsonFetch(
      SecureAPI.buildUrl(`/api/financial/crypto`, { time_range: timeRange }),
      { enableCache: true, cacheDuration: 180000 } // 3 minutes for market data
    )
    return data
  } catch (error) {
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
    const data = await SecureAPI.secureJsonFetch(
      SecureAPI.buildUrl(`/api/events/`),
      { enableCache: true, cacheDuration: 300000 } // 5 minutes for social events
    )
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
    console.error('Failed to fetch events:', error);
    throw new Error('Unable to load events. Please try again later.');
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
    const data = await SecureAPI.secureJsonFetch(
      SecureAPI.buildUrl(`/api/opportunities`),
      { enableCache: true, cacheDuration: 300000 } // 5 minutes for investment opportunities
    );
    return data as Opportunity[];
  } catch (error) {
    console.error('Failed to fetch opportunities from backend:', error);
    throw new Error('Unable to load investment opportunities. Please try again later.');
  }
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  try {
    // Since the API doesn't support individual opportunity endpoints,
    // fetch all opportunities and find the one with matching ID
    const opportunities = await getOpportunities();
    const opportunity = opportunities.find(opp => opp.id === id);
    
    if (!opportunity) {
      return null;
    }
    
    return opportunity;
  } catch (error) {
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
function getCurrentUserId(): string | null {
  if (typeof window !== 'undefined') {
    // First try SecureStorage (new auth system)
    try {
      const { SecureStorage } = require('@/lib/security/encryption');
      const userId = SecureStorage.getItem('userId');
      if (userId) {
        return userId;
      }
    } catch (error) {
      // SecureStorage not available, continue with localStorage
    }
    
    // Then try localStorage (old auth system)
    let userId = localStorage.getItem('userId');
    if (userId) {
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

    // No valid user ID found
    return null;
  }
  return null;
}

// Crown Vault Assets API
export async function getCrownVaultAssets(ownerId?: string): Promise<CrownVaultAsset[]> {
  try {
    const userId = ownerId || getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }
    // Call backend API directly for assets using authenticated client with 10-minute caching
    const data = await secureApi.get(`/api/crown-vault/assets/detailed?owner_id=${userId}`, true, { enableCache: true, cacheDuration: 600000 });
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
    // Only log non-authentication errors to avoid console spam
    if (!isAuthError(error)) {
      console.error('Failed to fetch Crown Vault assets:', error);
    }
    throw error; // Re-throw the original error for proper handling upstream
  }
}

export async function getCrownVaultStats(ownerId?: string): Promise<CrownVaultStats> {
  try {
    const userId = ownerId || getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }
    
    // Fetch stats, heirs, and assets in parallel with 10-minute caching for optimal UX
    const [statsData, heirsData, assetsData] = await Promise.all([
      secureApi.get(`/api/crown-vault/stats?owner_id=${userId}`, true, { enableCache: true, cacheDuration: 600000 }).catch(() => null),
      secureApi.get(`/api/crown-vault/heirs?owner_id=${userId}`, true, { enableCache: true, cacheDuration: 600000 }).catch(() => []),
      secureApi.get(`/api/crown-vault/assets/detailed?owner_id=${userId}`, true, { enableCache: true, cacheDuration: 600000 }).catch(() => [])
    ]);

    if (!statsData) {
      throw new Error(`Error fetching Crown Vault stats`);
    }

    // Backend returns direct array, not wrapped in {heirs: []}
    const heirsArray = Array.isArray(heirsData) ? heirsData : (heirsData?.heirs || []);
    const heirsCount = heirsArray.length;
    
    // Generate recent activity from assets data (most recent first)
    const assetsArray = Array.isArray(assetsData) ? assetsData : [];
    const recentActivity = assetsArray
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
      }));
    

    // Transform backend stats format to match frontend expectations
    const finalStats = {
      total_assets: statsData.total_assets || 0,
      total_value: statsData.total_value_usd || 0,
      total_heirs: heirsCount,
      last_updated: statsData.last_snapshot || new Date().toISOString(),
      asset_breakdown: statsData.assets_by_type || {},
      recent_activity: recentActivity  // Generated from assets data
    };
    
    return finalStats;
  } catch (error) {
    // Only log non-authentication errors to avoid console spam
    if (!isAuthError(error)) {
      console.error('Failed to fetch Crown Vault stats:', error);
    }
    throw error; // Re-throw the original error for proper handling upstream
  }
}

export async function getCrownVaultHeirs(ownerId?: string): Promise<CrownVaultHeir[]> {
  try {
    const userId = ownerId || getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }
    
    // Call backend API directly using authenticated client with 10-minute caching  
    const data = await secureApi.get(`/api/crown-vault/heirs?owner_id=${userId}`, true, { enableCache: true, cacheDuration: 600000 });
    
    // Backend returns direct array, not wrapped in {heirs: []}
    const heirs = Array.isArray(data) ? data : (data.heirs || []);
    
    // Ensure each heir has proper structure
    const filteredHeirs = heirs.filter((heir: any) => 
      heir && (heir.id || heir.heir_id) && heir.name
    );
    
    const finalHeirs = filteredHeirs.map((heir: any) => ({
      id: heir.id || heir.heir_id,
      name: heir.name,
      relationship: heir.relationship,
      email: heir.email,
      phone: heir.phone,
      notes: heir.notes,
      created_at: heir.created_at,
      ...heir
    }));
    
    return finalHeirs;
  } catch (error) {
    // Only log non-authentication errors to avoid console spam
    if (!isAuthError(error)) {
      console.error('Failed to fetch Crown Vault heirs:', error);
    }
    throw error; // Re-throw the original error for proper handling upstream
  }
}

export async function processCrownVaultAssetsBatch(
  rawText: string,
  context?: string,
  ownerId?: string
): Promise<BatchAssetResponse & { refreshedData: { assets: any[]; heirs: any[]; stats: any } }> {
  try {
    const userId = ownerId || getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }
    // Call backend API directly for asset batch processing using authenticated client
    const batchResult = await secureApi.post(`/api/crown-vault/assets/batch?owner_id=${userId}`, {
      raw_text: rawText,
      context: context || ''
    });
    
    // Get fresh data after successful batch processing
    const refreshedData = await CacheControl.refreshUserData(userId, secureApi);
    
    return { ...batchResult, refreshedData };
  } catch (error) {
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
): Promise<{ heir: CrownVaultHeir; refreshedData: { assets: any[]; heirs: any[]; stats: any } }> {
  try {
    const userId = ownerId || getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }
    
    // Filter out empty email and phone fields to avoid backend validation errors
    const filteredData = Object.entries(heirData).reduce((acc, [key, value]) => {
      if ((key === 'email' || key === 'phone') && value === '') {
        // Don't include empty email or phone fields
        return acc;
      }
      acc[key] = value;
      return acc;
    }, {} as any);
    
    // Use backend API directly for heir creation using authenticated client
    const data = await secureApi.post(`/api/crown-vault/heirs?owner_id=${userId}`, filteredData);
    
    // Get fresh data after successful creation
    const refreshedData = await CacheControl.refreshUserData(userId, secureApi);
    
    // Transform backend response to match frontend interface
    const heir = {
      id: data.id,
      name: data.name,
      relationship: data.relationship,
      email: data.email || '',
      phone: data.phone || '',
      notes: data.notes || '',
      created_at: data.created_at || new Date().toISOString()
    };
    
    return { heir, refreshedData };
  } catch (error) {
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
): Promise<{ heir: CrownVaultHeir; refreshedData: { assets: any[]; heirs: any[]; stats: any } }> {
  try {
    const userId = ownerId || getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }
    
    // Filter out empty email and phone fields to avoid backend validation errors
    const filteredData = Object.entries(heirData).reduce((acc, [key, value]) => {
      if ((key === 'email' || key === 'phone') && value === '') {
        // Don't include empty email or phone fields
        return acc;
      }
      acc[key] = value;
      return acc;
    }, {} as any);
    
    const data = await secureApi.put(`/api/crown-vault/heirs/${heirId}?owner_id=${userId}`, filteredData);
    
    // Get fresh data after successful update
    const refreshedData = await CacheControl.refreshUserData(userId, secureApi);
    
    const heir = {
      id: data.heir?.id || heirId,
      name: data.heir?.name || heirData.name || '',
      relationship: data.heir?.relationship || heirData.relationship || '',
      email: data.heir?.email || heirData.email || '',
      phone: data.heir?.phone || heirData.phone || '',
      notes: data.heir?.notes || heirData.notes || '',
      created_at: data.heir?.created_at || new Date().toISOString()
    };
    
    return { heir, refreshedData };
  } catch (error) {
    throw error;
  }
}

export async function deleteHeir(heirId: string, ownerId?: string): Promise<{ refreshedData: { assets: any[]; heirs: any[]; stats: any } }> {
  try {
    const userId = ownerId || getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }
    await secureApi.delete(`/api/crown-vault/heirs/${heirId}?owner_id=${userId}`);
    
    // Get fresh data after successful deletion
    const refreshedData = await CacheControl.refreshUserData(userId, secureApi);
    
    return { refreshedData };
  } catch (error) {
    throw error;
  }
}

export async function updateAssetHeirs(
  assetId: string,
  heirIds: string[],
  ownerId?: string
): Promise<{ success: boolean; message: string; heir_names: string[]; refreshedData: { assets: any[]; heirs: any[]; stats: any } }> {
  try {
    const userId = ownerId || getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }
    
    // Backend needs current user ID as query parameter for authentication and ownership validation
    const data = await secureApi.put(`/api/crown-vault/assets/${assetId}/heirs?owner_id=${userId}`, heirIds);
    
    // Get fresh data after successful asset heir update
    const refreshedData = await CacheControl.refreshUserData(userId, secureApi);
    
    return {
      success: data.success || true,
      message: data.message || 'Asset reassigned successfully',
      heir_names: data.heir_names || [],
      refreshedData
    };
  } catch (error) {
    throw error;
  }
}