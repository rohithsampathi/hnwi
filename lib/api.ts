// lib/api.ts
// Centralized API layer using secure-api for all auth handling

import secureApi, { 
  getAuthenticatedUserId,
  getAuthenticatedUser,
  isUserAuthenticated,
  CacheControl 
} from "@/lib/secure-api"

// Use centralized auth check from secure-api
// Import auth manager to ensure initialization
import { authManager } from '@/lib/auth-manager';

const getCurrentUserId = () => {
  // Ensure auth manager is initialized before getting user ID
  authManager.ensureInitialized();
  return getAuthenticatedUserId();
};
const getCurrentUser = () => {
  // Ensure auth manager is initialized before getting user
  authManager.ensureInitialized();
  return getAuthenticatedUser();
};

// Helper function to check if error is authentication-related
const isAuthError = (error: any): boolean => {
  const errorMessage = error?.message || error?.toString() || '';
  return errorMessage.includes('Authentication required') || 
         errorMessage.includes('please log in') || 
         errorMessage.includes('Session expired') ||
         error?.status === 401 ||
         error?.status === 403;
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
    const data: CryptoResponse = await secureApi.get(`/api/financial/crypto?time_range=${timeRange}`, true)
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
    // Call new secure Family Office endpoint
    const data = await secureApi.get('/api/developments/social-events', true);
    
    // Handle new response format: {events: [...], total_count, user_tier, etc.}
    if (data.events && Array.isArray(data.events)) {
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
        attendees: event.attendees || 0,
        summary: event.summary,
        category: event.category,
        start_date: event.start_date,
        end_date: event.end_date,
        venue: event.venue,
        status: event.status,
        metadata: event.metadata,
        tags: event.tags
      }));
    }
    
    return [];
  } catch (error: any) {
    console.error('getEvents error:', error);
    console.error('getEvents error status:', error?.status);
    console.error('getEvents error response:', error?.response);

    // Handle tier requirement with enhanced error details
    if (error?.status === 403 || error?.response?.status === 403) {
      const errorDetail = error.detail || error.error || error?.response?.data || {};
      const tierError = {
        status: 403,
        detail: {
          error: errorDetail.error || "Social Hub requires a premium tier",
          current_tier: errorDetail.current_tier || "unknown",
          required_tier: errorDetail.required_tier || "premium",
          upgrade_url: errorDetail.upgrade_url || "/subscription/upgrade",
          feature: errorDetail.feature || "social_events_access"
        }
      };
      console.error('Throwing tier error:', tierError);
      throw tierError;
    }

    throw new Error('Unable to load events. Please try again later.');
  }
}

// Investment Opportunities - SOTA Structure
export interface Opportunity {
  // MongoDB/API identifiers (id is normalized from _id or opportunity_id)
  _id?: string;
  id: string; // Always populated by normalization layer
  opportunity_id?: string;
  reference_number?: string;

  // TIER 0: Quick Snapshot (10 seconds)
  title: string;
  subtitle?: string;
  asset_category?: string;
  asset_subcategory?: string;
  asset_class?: string;
  minimum_investment_usd?: number;
  minimum_investment_display?: string;
  tier?: 'tier_100k' | 'tier_500k' | 'tier_1m' | 'tier_10m';
  expected_return_annual_low?: number;
  expected_return_annual_high?: number;
  risk_free_multiple?: number;
  victor_score?: number; // Out of 10 (legacy)
  victor_rating?: 'JUICY' | 'MODERATE' | 'FAR-FETCHED'; // Legacy
  prive_score?: number; // New Privé scoring (out of 10)
  prive_rating?: 'JUICY' | 'MODERATE' | 'FAR-FETCHED'; // New Privé rating
  prive_rating_composite?: string; // Combined rating display
  prive_rating_rationale?: string; // Explanation of the rating
  liquidity_level?: string;
  risk_level?: 'Low' | 'Medium' | 'High';
  verified?: boolean;
  is_active: boolean;
  is_featured?: boolean;
  is_new?: boolean;

  // TIER 1: Investment Thesis (30 seconds)
  investment_thesis?: {
    what_youre_buying?: string;
    why_this_makes_money?: Array<{
      driver: string;
      mechanism: string;
      value_creation?: string | number | null;
      value_creation_display?: string; // Human-readable value creation
      evidence?: string;
    }>;
    the_catch?: string[];
    the_catch_label?: string; // Dynamic label from API (e.g., "Investment Considerations")
    victor_verdict_one_line?: string; // Legacy field
    prive_verdict?: string; // New Privé branding
  };

  // TIER 2: Financial Structure
  pricing?: {
    base_price_usd?: number;
    price_per_sqft?: number;
    market_rate_per_sqft?: number;
    discount_percentage?: number;
    transaction_costs?: any;
    total_investment_required?: number;
  };
  payment_plan?: {
    payment_type?: string;
    schedule?: any[];
  };
  return_analysis?: {
    scenarios?: {
      conservative?: any;
      base_case?: any;
      optimistic?: any;
    };
    risk_free_comparison?: any;
  };

  // TIER 3: Exit Strategy
  exit_strategy?: {
    primary_exit?: any;
    secondary_exit?: any;
    tertiary_exit?: any;
    emergency_exit?: any;
    holding_costs?: any;
  };

  // TIER 4: Risk Analysis
  risk_analysis?: {
    overall_risk_level?: string;
    overall_risk_score?: number;
    risk_factors?: any[];
    risk_factors_label?: string; // Dynamic label from API (e.g., "Key Risks")
    downside_scenarios?: any[];
    red_flags?: any[];
    red_flags_label?: string; // Dynamic label from API (e.g., "Risk Warnings")
  };

  // TIER 5: Asset Details
  asset_details?: {
    property_type?: string;
    bedrooms?: number;
    total_area_sqft?: number;
    location?: {
      full_address?: string;
      coordinates?: { latitude: number; longitude: number };
      nearby_landmarks?: string[];
    };
    developer?: {
      name?: string;
      established?: number;
      assets_under_management?: string;
    };
    timeline?: any;
    amenities?: string[];
  };

  // TIER 6: Legal Structure
  legal_structure?: any;

  // TIER 7: Tax Analysis
  tax_analysis?: any;

  // TIER 8: Comparables
  comparable_opportunities?: any[];

  // TIER 9: Citations
  citations_and_sources?: any[];

  // Legacy Compatibility Fields
  description?: string;
  start_date: string;
  end_date: string;
  region: string;
  country: string;
  industry?: string;
  product?: string;
  type?: string;
  value?: string;
  riskLevel?: string;
  expectedReturn?: string;
  investmentHorizon?: string;
  pros?: string[];
  cons?: string[];
  fullAnalysis?: string;

  // Victor analysis fields (legacy)
  victor_reasoning?: string;
  strategic_insights?: string;
  opportunity_window?: string;
  risk_assessment?: string;
  elite_pulse_alignment?: string;
  key_factors?: string;
  implementation?: string;
  victor_action?: string;
  confidence_level?: number;
  hnwi_alignment?: string;
}

export async function getOpportunities(bustCache: boolean = false): Promise<Opportunity[]> {
  try {
    // Add timestamp parameter to bust cache when needed
    const endpoint = bustCache
      ? `/api/opportunities?_t=${Date.now()}`
      : '/api/opportunities';

    // Pass bustCache flag to secureApi to add cache-busting headers
    const data = await secureApi.get(endpoint, true, bustCache);

    // Normalize MongoDB _id to id field for consistent access
    const normalized = Array.isArray(data) ? data.map((opp: any) => ({
      ...opp,
      id: opp.id || opp._id || opp.opportunity_id || String(Math.random()) // Ensure every opportunity has an id
    })) : [];

    return normalized as Opportunity[];
  } catch (error) {
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
export interface PriceHistoryEntry {
  timestamp: string;
  price: number;
  source: 'manual' | 'katherine_analysis' | 'system';
  confidence_score?: number;
  notes?: string;
}

export interface AppreciationMetrics {
  percentage: number;
  absolute: number;
  annualized: number;
  time_held_days: number;
}

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
    unit_count?: number;
    cost_per_unit?: number;
    entry_price?: number;  // Original purchase price per unit
    current_price?: number; // Alias for cost_per_unit
    tags?: string[];
    access_level?: 'owner' | 'heir' | 'shared';
  };
  heir_ids: string[];
  heir_names: string[];
  created_at: string;
  error?: string;
  // Price tracking
  price_history?: PriceHistoryEntry[];
  appreciation?: AppreciationMetrics;
  last_price_update?: string;
  // Elite Pulse Intelligence Enhancement from Backend
  elite_pulse_impact?: {
    risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
    timestamp?: string;
    summary?: string;
    ui_display?: {
      badge_text: string;
      tooltip_title: string;
      risk_indicator: string;
      risk_badge_color: string;
      concern_summary: string;
      recommendation?: string;
    };
    asset_specific_threat?: string;
    recommended_action?: string;
    timeline?: string;
    katherine_analysis?: string;
    // Nested Katherine AI Analysis (newer structure)
    katherine_ai_analysis?: {
      victor_reasoning?: string;
      strategic_assessment?: string;
      strategic_insights?: string;
      risk_assessment?: string;
    };
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

// getCurrentUserId is now imported from secure-api at the top

// Crown Vault Assets API
export async function getCrownVaultAssets(ownerId?: string): Promise<CrownVaultAsset[]> {
  try {
    const userId = ownerId || getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }
    // Call backend API directly for assets using authenticated client
    // Pass owner_id as query parameter as required by the API endpoint
    const data = await secureApi.get(`/api/crown-vault/assets/detailed?owner_id=${userId}`, true);
    const assets = data.assets || data || [];

    // Ensure each asset has proper structure (supports both MongoDB _id and asset_id formats)
    return assets.filter((asset: any) =>
      asset &&
      (asset._id || asset.asset_id || asset.id) // Accept MongoDB _id or other formats
    ).map((asset: any) => ({
      ...asset,
      // Normalize ID field
      id: asset._id || asset.asset_id || asset.id,
      asset_id: asset._id || asset.asset_id || asset.id,
      // Create asset_data from MongoDB fields or existing asset_data
      asset_data: asset.asset_data ? {
        name: asset.asset_data.name || 'Unnamed Asset',
        asset_type: asset.asset_data.asset_type || 'Unknown',
        value: asset.asset_data.value || 0,
        currency: asset.asset_data.currency || 'USD',
        location: asset.asset_data.location || '',
        notes: asset.asset_data.notes || '',
        ...asset.asset_data
      } : {
        // MongoDB structure: build asset_data from direct fields
        name: asset.decrypted_data?.name || `${asset.unit_count} ${asset.unit_type}`,
        asset_type: asset.unit_type || 'Unknown',
        value: (asset.unit_count || 0) * (asset.cost_per_unit || 0),
        currency: 'USD',
        location: asset.decrypted_data?.location || '',
        notes: asset.decrypted_data?.notes || '',
        unit_count: asset.unit_count,
        unit_type: asset.unit_type,
        cost_per_unit: asset.cost_per_unit
      },
      // Preserve elite_pulse_impact field from MongoDB
      elite_pulse_impact: asset.elite_pulse_impact || null,
      heir_ids: asset.heir_ids || [],
      heir_names: asset.heir_names || [],
      created_at: asset.created_at || new Date().toISOString(),
      // Preserve price tracking fields from backend
      price_history: asset.price_history || [],
      appreciation: asset.appreciation || null,
      last_price_update: asset.last_price_update || null
    }));
  } catch (error) {
    // Only log non-authentication errors to avoid console spam
    if (!isAuthError(error)) {
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
    
    // ONLY fetch stats endpoint - do NOT fetch heirs and assets here
    // The Crown Vault page already calls getCrownVaultAssets and getCrownVaultHeirs separately
    const statsData = await secureApi.get(
      `/api/crown-vault/stats?owner_id=${userId}`,
      true
    ).catch(() => null);

    if (!statsData) {
      throw new Error(`Error fetching Crown Vault stats`);
    }

    // No need to fetch heirs and assets data here
    // The backend stats endpoint should already include total_heirs and recent_activity
    

    // Transform backend stats format to match frontend expectations
    // Ensure proper format for asset_breakdown
    const assetBreakdown: CrownVaultStats['asset_breakdown'] = {};
    if (statsData.assets_by_type || statsData.asset_categories || statsData.asset_breakdown) {
      const breakdown = statsData.assets_by_type || statsData.asset_categories || statsData.asset_breakdown || {};
      for (const [key, value] of Object.entries(breakdown)) {
        if (typeof value === 'object' && value !== null) {
          assetBreakdown[key] = {
            count: (value as any).count || 0,
            total_value: (value as any).total_value || 0
          };
        }
      }
    }

    // Ensure proper format for recent_activity
    const recentActivity: CrownVaultStats['recent_activity'] = [];
    if (Array.isArray(statsData.recent_activity)) {
      recentActivity.push(...statsData.recent_activity.map((activity: any) => ({
        action: activity.action || 'unknown',
        asset_name: activity.asset_name,
        timestamp: activity.timestamp || new Date().toISOString(),
        details: activity.details || ''
      })));
    }

    const finalStats: CrownVaultStats = {
      total_assets: statsData.total_assets || 0,
      total_value: statsData.total_value_usd || statsData.total_value || 0,
      total_heirs: statsData.total_heirs || 0,
      last_updated: statsData.last_snapshot || statsData.last_updated || new Date().toISOString(),
      asset_breakdown: assetBreakdown,
      recent_activity: recentActivity
    };

    return finalStats;
  } catch (error) {
    // Only log non-authentication errors to avoid console spam
    if (!isAuthError(error)) {
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
    
    // Call backend API directly using authenticated client
    // Backend expects owner_id parameter
    const data = await secureApi.get(`/api/crown-vault/heirs?owner_id=${userId}`, true);
    
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
    
    // Return only the batch result - the calling component will refresh data if needed
    // This avoids duplicate API calls when the page already loads this data
    return batchResult;
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
    const data = await secureApi.put(endpoint, heirIds, true);
    
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
    name?: string;
    asset_type?: string;
    unit_count?: number;
    cost_per_unit?: number;
    entry_price?: number;
    value?: number; // Keep for backward compatibility
    currency?: string;
    location?: string;
    notes?: string;
    structured_data?: {
      name?: string;
      asset_type?: string;
      unit_count?: number;
      cost_per_unit?: number;
      entry_price?: number;
      currency?: string;
      location?: string;
      notes?: string;
    };
  }>
): Promise<CrownVaultAsset> {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }

    // If structured_data is provided, use it directly
    // Otherwise, construct the payload from individual fields
    const payload = updateData.structured_data ? updateData : {
      name: updateData.name,
      asset_type: updateData.asset_type,
      unit_count: updateData.unit_count,
      cost_per_unit: updateData.cost_per_unit,
      entry_price: updateData.entry_price,
      currency: updateData.currency,
      location: updateData.location,
      notes: updateData.notes
    };

    const result = await secureApi.put(
      `/api/crown-vault/assets/${assetId}`,
      payload,
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
    const userId = getCurrentUserId();

    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }

    const deleteUrl = `/api/crown-vault/assets/${assetId}`;
    const result = await secureApi.delete(deleteUrl, true);

    return {
      message: result.message || 'Asset deleted successfully'
    };
  } catch (error) {
    throw error;
  }
}

// Automatic Price Refresh - Katherine AI Service
export interface PriceRefreshResponse {
  success: boolean;
  asset_id: string;
  old_price: number;
  new_price: number;
  price_source: 'katherine_analysis' | 'manual';
  confidence_score?: number;
  appreciation: {
    percentage: number;
    absolute: number;
    annualized: number;
  };
  message: string;
  price_history_updated: boolean;
}

export async function refreshAssetPrice(
  assetId: string,
  manualPrice?: number
): Promise<PriceRefreshResponse> {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated. Please log in to access Crown Vault.');
    }

    const payload = manualPrice !== undefined
      ? { new_price: manualPrice }
      : { new_price: null }; // null triggers Katherine auto-fetch

    const result = await secureApi.post(
      `/api/crown-vault/assets/${assetId}/update-price`,
      payload,
      true
    );

    return {
      success: result.success || true,
      asset_id: result.asset_id || assetId,
      old_price: result.old_price || 0,
      new_price: result.new_price || 0,
      price_source: result.price_source || (manualPrice ? 'manual' : 'katherine_analysis'),
      confidence_score: result.confidence_score,
      appreciation: result.appreciation || {
        percentage: 0,
        absolute: 0,
        annualized: 0
      },
      message: result.message || 'Price updated successfully',
      price_history_updated: result.price_history_updated || true
    };
  } catch (error) {
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
    const data = await secureApi.get('/api/analytics/members', true);
    
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
    const data = await secureApi.get(`/api/analytics/activity/${page}`, true);

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

// Trusted Network Directory - Executor APIs
import type {
  Executor,
  ExecutorListResponse,
  ExecutorCategory,
  ExecutorSubcategory,
  IntroductionRequest,
  IntroductionResponse,
  UserIntroductionsResponse
} from "@/types/executor";

export interface ExecutorFilters {
  category?: ExecutorCategory;
  subcategory?: ExecutorSubcategory;
  jurisdiction?: string;
  language?: string;
  accepting_clients?: boolean;
  tier?: "strategic_partner" | "trusted_network";
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getExecutors(filters?: ExecutorFilters): Promise<ExecutorListResponse> {
  try {
    // Build query parameters
    const params = new URLSearchParams();

    if (filters?.category) params.append("category", filters.category);
    if (filters?.subcategory) params.append("subcategory", filters.subcategory);
    if (filters?.jurisdiction) params.append("jurisdiction", filters.jurisdiction);
    if (filters?.language) params.append("language", filters.language);
    if (filters?.accepting_clients !== undefined) params.append("accepting_clients", String(filters.accepting_clients));
    if (filters?.tier) params.append("tier", filters.tier);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.offset) params.append("offset", String(filters.offset));

    const queryString = params.toString();
    const endpoint = `/api/executors${queryString ? `?${queryString}` : ""}`;

    const data = await secureApi.get(endpoint, true);

    return {
      executors: data.executors || [],
      total: data.total || 0,
      limit: data.limit || 20,
      offset: data.offset || 0
    };
  } catch (error: any) {
    throw new Error(error?.message || "Unable to load executors. Please try again later.");
  }
}

export async function getExecutor(executorId: string): Promise<Executor> {
  try {
    const data = await secureApi.get(`/api/executors/${executorId}`, true);

    return data as Executor;
  } catch (error: any) {
    if (error?.status === 404) {
      throw new Error("Executor not found");
    }
    throw new Error(error?.message || "Unable to load executor details. Please try again later.");
  }
}

export async function requestIntroduction(
  executorId: string,
  request: IntroductionRequest
): Promise<IntroductionResponse> {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error("User not authenticated. Please log in to request introductions.");
    }

    const data = await secureApi.post(
      `/api/executors/${executorId}/request-introduction`,
      request,
      true
    );

    return {
      intro_id: data.intro_id,
      executor: data.executor,
      intro_sent_at: data.intro_sent_at,
      expected_response_time: data.expected_response_time,
      message: data.message || "Introduction request sent successfully"
    };
  } catch (error: any) {
    if (error?.status === 400) {
      throw new Error(error?.message || "Executor is not currently accepting new clients");
    }
    if (error?.status === 404) {
      throw new Error("Executor not found");
    }
    throw new Error(error?.message || "Unable to send introduction request. Please try again later.");
  }
}

export async function getUserIntroductions(userId?: string): Promise<UserIntroductionsResponse> {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId) {
      throw new Error("User not authenticated. Please log in to view introductions.");
    }

    const data = await secureApi.get(`/api/users/${currentUserId}/introductions`, true);

    return {
      introductions: data.introductions || [],
      total: data.total || 0
    };
  } catch (error: any) {
    throw new Error(error?.message || "Unable to load introduction history. Please try again later.");
  }
}