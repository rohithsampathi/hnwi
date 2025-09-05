// lib/api.ts

import { secureApi } from "@/lib/secure-api"
import { getValidToken } from "@/lib/auth-utils"

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
    const data: CryptoResponse = await secureApi.get(`/api/financial/crypto?time_range=${timeRange}`, true, { enableCache: true, cacheDuration: 180000 })
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
    const data = await secureApi.get('/api/events/', true, { enableCache: true, cacheDuration: 600000 }); // 10 minutes for social events
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
    const data = await secureApi.get('/api/opportunities', true, { enableCache: true, cacheDuration: 600000 }); // 10 minutes for investment opportunities
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
    decryption_error?: boolean;
  };
  heir_ids: string[];
  heir_names: string[];
  created_at: string;
  error?: string;
  // Elite Pulse Intelligence Enhancement from Backend
  elite_pulse_impact?: {
    risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
    ui_display: {
      badge_text: string;
      tooltip_title: string;
      risk_indicator: string;
      risk_badge_color: string;
      concern_summary: string;
    };
    asset_specific_threat?: string;
    recommended_action?: string;
    timeline?: string;
    katherine_analysis?: string;
  };
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
    // Backend gets user_id from authentication context
    const data = await secureApi.get('/api/crown-vault/assets/detailed', true, { enableCache: true, cacheDuration: 600000 });
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
    // Backend expects owner_id parameter
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
    // Backend expects owner_id parameter
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
  ownerId?: string,
  structuredData?: any
): Promise<BatchAssetResponse & { refreshedData: { assets: any[]; heirs: any[]; stats: any } }> {
  try {
    const userId = ownerId || getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }
    
    // Backend expects array format for batch processing
    // Support both raw_text and structured_data in the same request
    const assetData: any = {
      raw_text: rawText
    };
    
    if (context) {
      assetData.context = context;
    }
    
    if (structuredData) {
      assetData.structured_data = structuredData;
    }
    
    const batchData = [assetData];
    
    // Call backend API directly for asset batch processing using authenticated client
    // Backend gets user_id from authentication context, not query param
    const batchResult = await secureApi.post('/api/crown-vault/assets/batch', batchData);
    
    // Get fresh data after successful batch processing (cache-busting)
    const refreshedData = await Promise.all([
      secureApi.get(`/api/crown-vault/assets/detailed?owner_id=${userId}`, true, { enableCache: false }),
      secureApi.get(`/api/crown-vault/heirs?owner_id=${userId}`, true, { enableCache: false }),
      secureApi.get(`/api/crown-vault/stats?owner_id=${userId}`, true, { enableCache: false })
    ]);
    
    return { ...batchResult, refreshedData };
  } catch (error) {
    throw error;
  }
}

// New function for creating a single asset with full format support
export async function createCrownVaultAsset(
  assetData: {
    raw_text?: string;
    structured_data?: {
      name: string;
      asset_type: 'stocks' | 'bonds' | 'real_estate' | 'crypto' | 'other';
      value: number;
      currency?: string;
      location?: string;
      account_number?: string;
      contact?: string;
      growth_rate?: number;
      maturity_date?: string;
      notes?: string;
      unit_count?: number;
      unit_type?: string;
      cost_per_unit?: number;
    };
    context?: string;
    heir_ids?: string[];
  },
  ownerId?: string
): Promise<string & { refreshedData: { assets: any[]; heirs: any[]; stats: any } }> {
  try {
    const userId = ownerId || getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }
    
    // Call backend API directly for single asset creation
    const assetId = await secureApi.post('/api/crown-vault/assets', assetData);
    
    // Return the created asset ID - cache will auto-refresh on next request
    return assetId;
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
    // Backend expects owner_id parameter
    const data = await secureApi.post(`/api/crown-vault/heirs?owner_id=${userId}`, filteredData);
    
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
    
    return heir;
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
    
    // Return updated heir data - cache will auto-refresh on next request
    return data;
    
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
    
    // Deletion successful - cache will auto-refresh on next request
    const refreshedData = { assets: [], heirs: [], stats: null };
    
    return { refreshedData };
  } catch (error) {
    throw error;
  }
}

export async function updateAssetHeirs(
  assetId: string,
  heirIds: string[],
  ownerId?: string
): Promise<{ success: boolean; message: string; heir_names: string[]; refreshedData?: { assets: any[]; heirs: any[]; stats: any } }> {
  try {
    const userId = ownerId || getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }
    
    // Call Next.js API route (URL masked) - same pattern as other Crown Vault endpoints
    const endpoint = `/api/crown-vault/assets/${assetId}/heirs`;
    const data = await secureApi.put(endpoint, { heir_ids: heirIds }, true);
    
    // Return updated data with proper structure
    return {
      success: data.success || true,
      message: data.message || 'Asset reassigned successfully',
      heir_names: data.heir_names || []
    };
  } catch (error) {
    throw error;
  }
}

// Update Crown Vault Asset
export async function updateCrownVaultAsset(
  assetId: string,
  updateData: Partial<{
    name: string;
    asset_type: string;
    value: number;
    currency: string;
    location: string;
    notes: string;
  }>
): Promise<CrownVaultAsset> {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }

    const result = await secureApi.put(
      `/api/crown-vault/assets/${assetId}`,
      { asset_data: updateData },
      true
    );

    return result.asset;
  } catch (error) {
    throw error;
  }
}

// Delete Crown Vault Asset
export async function deleteCrownVaultAsset(assetId: string): Promise<{ message: string }> {
  try {
    console.log('deleteCrownVaultAsset called with assetId:', assetId);
    
    const userId = getCurrentUserId();
    console.log('Current user ID:', userId);
    
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }

    const deleteUrl = `/api/crown-vault/assets/${assetId}`;
    console.log('DELETE URL:', deleteUrl);
    console.log('Making secureApi.delete call...');
    
    const result = await secureApi.delete(deleteUrl, true);
    console.log('Delete API result:', result);
    
    return {
      message: result.message || 'Asset deleted successfully'
    };
  } catch (error) {
    console.error('Error in deleteCrownVaultAsset:', error);
    throw error;
  }
}

// Analytics and Member Stats
export interface MemberAnalytics {
  total_members: number;
  active_members_24h: number;
  current_online: number;
  regions: {
    [key: string]: number;
  };
}

export async function getMemberAnalytics(): Promise<MemberAnalytics> {
  try {
    const data = await secureApi.get('/api/analytics/members', true, { 
      enableCache: true, 
      cacheDuration: 60000 // 1-minute cache for real-time feel
    });
    
    return {
      total_members: data.total_members || 0,
      active_members_24h: data.active_members_24h || 0,
      current_online: data.current_online || 0,
      regions: data.regions || {}
    };
  } catch (error) {
    // Fallback to reasonable defaults if analytics unavailable
    return {
      total_members: 0,
      active_members_24h: 0,
      current_online: 0,
      regions: {}
    };
  }
}

// Real-time activity tracking
export interface ActivityStats {
  page_viewers: number;
  recent_actions: number;
  trending_content: string[];
}

export async function getPageActivity(page: string): Promise<ActivityStats> {
  try {
    const data = await secureApi.get(`/api/analytics/activity/${page}`, true, { 
      enableCache: true, 
      cacheDuration: 30000 // 30-second cache for activity data
    });
    
    return {
      page_viewers: data.page_viewers || 0,
      recent_actions: data.recent_actions || 0,
      trending_content: data.trending_content || []
    };
  } catch (error) {
    return {
      page_viewers: 0,
      recent_actions: 0,
      trending_content: []
    };
  }
}