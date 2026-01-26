// lib/hooks/useOpportunities.ts
// Centralized hook for fetching opportunities for both Assessment and Home Dashboard maps

import { useState, useEffect, useCallback } from 'react';
import { secureApi } from '@/lib/secure-api';
import type { City } from '@/components/interactive-world-map';
import { extractDevIds } from '@/lib/parse-dev-citations';
import type { Citation } from '@/lib/parse-dev-citations';

interface Opportunity {
  _id?: string;
  id?: string;
  title: string;
  tier: string;
  location: string;
  latitude: number;
  longitude: number;
  country: string;
  value: string;
  risk: string;
  analysis: string;
  source: string;
  victor_score?: string;
  elite_pulse_analysis?: string;
  category?: string;
  industry?: string;
  product?: string;
  start_date?: string;
  is_new?: boolean;
  executors?: Array<{
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    strategic_trusted_partner?: boolean;
    website?: string;
    linkedin?: string;
  }>;
  cost_per_unit?: number;
  unit_count?: number;
  current_price?: number;
  entry_price?: number;
  appreciation?: {
    percentage: number;
    absolute: number;
    annualized: number;
    time_held_days: number;
  };
  price_history?: Array<{
    timestamp: string;
    price: number;
    source: 'manual' | 'katherine_analysis' | 'system';
    confidence_score?: number;
    notes?: string;
  }>;
  last_price_update?: string;
  katherine_analysis?: string;
  elite_pulse_impact?: {
    katherine_analysis?: string;
    katherine_ai_analysis?: {
      strategic_assessment?: string;
    };
  };
}

interface UseOpportunitiesConfig {
  // Mode configuration
  isPublic?: boolean; // true for assessment (public), false for dashboard (authenticated)

  // Dashboard-specific options (ignored in public mode)
  timeframe?: string;
  isPersonalMode?: boolean;
  hasCompletedAssessment?: boolean;
  includeCrownVault?: boolean;

  // Public mode specific options
  publicEndpoint?: string; // Allow custom public endpoint

  // Filtering options (applied after fetch)
  filterCrownVault?: boolean; // Always true for assessment
  cleanCategories?: boolean; // Clean category names
}

interface UseOpportunitiesResult {
  cities: City[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  availableCategories: string[];
  refetch: () => Promise<void>;
}

// Helper function to clean category names (shared logic)
const cleanCategoryName = (category: string): string => {
  if (!category) return category;

  const cleanedCategory = category
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses content
    .replace(/\s*\[[^\]]*\]/g, '') // Remove bracket content
    .replace(/\s*-\s*(completed|under construction|ongoing|in progress|pending|active|inactive|sold|available)/gi, '')
    .replace(/\s+(completed|under construction|ongoing|in progress|pending|active|inactive|sold|available)/gi, '')
    .trim();

  return cleanedCategory;
};

// Transform opportunity to City format (shared logic)
const transformOpportunityToCity = (
  opp: Opportunity,
  cleanCategories: boolean = false
): City | null => {
  const lat = opp.latitude;
  const lng = opp.longitude;
  const displayName = opp.location || opp.country || opp.title || 'Opportunity';

  // Validate coordinates
  if (!lat || !lng || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }

  // Skip (0, 0) coordinates
  if (lat === 0 && lng === 0) {
    return null;
  }

  // Extract citations from both analysis fields
  const devIdsFromAnalysis = extractDevIds(opp.analysis || '');
  const devIdsFromElitePulse = extractDevIds(opp.elite_pulse_analysis || '');
  const devIds = Array.from(new Set([...devIdsFromAnalysis, ...devIdsFromElitePulse]));

  // Smart category correction (for misclassified opportunities)
  let correctedCategory = opp.category ?
    (cleanCategories ? cleanCategoryName(opp.category) : opp.category) :
    opp.category;

  const titleLower = (opp.title || '').toLowerCase();
  const analysisLower = (opp.analysis || '').toLowerCase();
  const combined = titleLower + ' ' + analysisLower;
  const categoryLower = (correctedCategory || '').toLowerCase();

  // Fix miscategorized automotive/vehicle items that are actually real estate
  if (categoryLower.includes('automotive') ||
      categoryLower.includes('vehicle') ||
      categoryLower === 'luxury vehicles' ||
      categoryLower === 'luxury vehicle') {
    const isRealEstate = combined.includes('residential') ||
      combined.includes('building') ||
      combined.includes('architecture') ||
      combined.includes('apartment') ||
      combined.includes('condo') ||
      combined.includes('real estate') ||
      combined.includes('property investment') ||
      combined.includes('branded residence') ||
      (titleLower.includes('investment') && (
        combined.includes('miami') ||
        combined.includes('tower') ||
        combined.includes('residence')
      ));

    if (isRealEstate) {
      correctedCategory = 'Real Estate';
    }
  }

  return {
    name: displayName,
    country: opp.country || 'Unknown',
    latitude: lat,
    longitude: lng,
    population: opp.value,
    type: opp.source === "MOEv4" ? "finance" : "luxury",
    _id: opp._id,
    id: opp.id,
    title: opp.title,
    tier: opp.tier,
    value: opp.value,
    risk: opp.risk,
    analysis: opp.analysis,
    source: opp.source,
    victor_score: opp.victor_score,
    elite_pulse_analysis: opp.elite_pulse_analysis,
    category: correctedCategory,
    industry: opp.industry,
    product: opp.product,
    start_date: opp.start_date,
    is_new: opp.is_new,
    devIds: devIds,
    hasCitations: devIds.length > 0,
    executors: opp.executors,
    cost_per_unit: opp.cost_per_unit,
    unit_count: opp.unit_count,
    current_price: opp.current_price,
    entry_price: opp.entry_price,
    appreciation: opp.appreciation,
    price_history: opp.price_history,
    last_price_update: opp.last_price_update,
    katherine_analysis: (opp.katherine_analysis && opp.katherine_analysis.trim()) ||
      (opp.elite_pulse_impact?.katherine_analysis && opp.elite_pulse_impact.katherine_analysis.trim()) ||
      (opp.elite_pulse_impact?.katherine_ai_analysis?.strategic_assessment &&
       opp.elite_pulse_impact.katherine_ai_analysis.strategic_assessment.trim()) ||
      null
  } as City;
};

export function useOpportunities(config: UseOpportunitiesConfig = {}): UseOpportunitiesResult {
  const {
    isPublic = false,
    timeframe = 'live',
    isPersonalMode = false,
    hasCompletedAssessment = false,
    includeCrownVault = false,
    publicEndpoint = '/api/public/assessment/preview-opportunities',
    filterCrownVault = false,
    cleanCategories = true
  } = config;

  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // TEMPORARY: Always bust cache for debugging
  // TODO: Re-enable caching after verifying data is fresh
  const TEMPORARILY_DISABLE_CACHE = false; // ✅ Re-enabled caching to prevent rapid refetches

  // CRITICAL FIX: Check URL parameter to trigger cache busting on mount
  // This solves the timing issue where events are dispatched before component mounts
  const initialBustCache = TEMPORARILY_DISABLE_CACHE || (typeof window !== 'undefined' &&
    (window.location.search.includes('refresh=') || window.location.search.includes('bust_cache=true')));

  const [bustCache, setBustCache] = useState(initialBustCache);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response: any;
      let opportunities: Opportunity[] = [];

      if (isPublic) {
        // PUBLIC MODE (Assessment)
        // Use public endpoint with its own filtering logic
        const res = await fetch(publicEndpoint);

        if (!res.ok) {
          throw new Error(`Failed to fetch opportunities: ${res.status}`);
        }

        const data = await res.json();

        // Handle both wrapped and direct array responses
        opportunities = data?.opportunities ||
                       (Array.isArray(data) ? data : data?.data || []);

        // Use total_count from response, or fall back to length
        const responseTotal = data?.total_count || opportunities.length;
        setTotalCount(responseTotal);

      } else {
        // AUTHENTICATED MODE (Home Dashboard)
        // Build API URL with all parameters
        const timeframeParam = timeframe === 'live' ? 'LIVE' : timeframe;
        const viewParam = (isPersonalMode && hasCompletedAssessment) ? 'personalized' : 'all';

        // Only request Crown Vault in personalized mode
        const shouldIncludeCrownVault = includeCrownVault && viewParam === 'personalized';

        const apiUrl = `/api/command-centre/opportunities?view=${viewParam}&timeframe=${timeframeParam}&include_crown_vault=${shouldIncludeCrownVault}`;

        // Use secureApi for authenticated requests with cache busting when needed
        response = await secureApi.get(apiUrl, true, bustCache);

        // Handle wrapped response from backend
        opportunities = response?.opportunities ||
                       (Array.isArray(response) ? response : []);

        // CLIENT-SIDE FILTERING: Apply timeframe and expiry filters
        const now = new Date();
        const beforeFilterCount = opportunities.length;

        opportunities = opportunities.filter(opp => {
          // 1. Filter out expired MOEv4 opportunities (180 days after DEVID brief creation)
          if (opp.source === 'MOEv4' && opp.start_date) {
            try {
              const startDate = new Date(opp.start_date);
              const expiryDate = new Date(startDate.getTime() + (180 * 24 * 60 * 60 * 1000)); // +180 days

              // Filter out expired opportunities
              if (expiryDate < now) {
                return false;
              }
            } catch {
              // Keep if date parsing fails
            }
          }

          // 2. Apply timeframe filter based on start_date
          if (timeframeParam !== 'LIVE' && opp.start_date) {
            try {
              const startDate = new Date(opp.start_date);

              // Calculate cutoff date based on timeframe
              let daysBack = 180; // Default for LIVE

              if (timeframeParam === '7D') daysBack = 7;
              else if (timeframeParam === '14D') daysBack = 14;
              else if (timeframeParam === '21D') daysBack = 21;
              else if (timeframeParam === '1M') daysBack = 30;
              else if (timeframeParam === '3M') daysBack = 90;
              else if (timeframeParam === '6M') daysBack = 180;

              const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

              // Keep only opportunities added within the timeframe
              if (startDate < cutoffDate) return false;
            } catch {
              // Keep if date parsing fails
            }
          }

          return true;
        });

        setTotalCount(opportunities.length);
      }

      // Transform opportunities to City format
      const transformedCities: City[] = opportunities
        .map(opp => {
          // Apply Crown Vault filtering for public mode (assessment)
          if (isPublic && filterCrownVault) {
            const isCrownAsset = opp.source?.toLowerCase().includes('crown vault') ||
                                 opp.source?.toLowerCase() === 'crown vault';
            if (isCrownAsset) {
              return null;
            }
          }

          return transformOpportunityToCity(opp, cleanCategories);
        })
        .filter((city): city is City => city !== null);

      // Deduplicate by ID
      const seenIds = new Set<string>();
      const deduplicatedCities = transformedCities.filter(city => {
        const uniqueId = city._id || city.id;
        if (!uniqueId) return true;

        if (seenIds.has(uniqueId)) {
          return false;
        }

        seenIds.add(uniqueId);
        return true;
      });

      // Only mark the last 5 added opportunities as "new" (based on start_date)
      // Sort by start_date descending to find the 5 most recent
      const sortedByDate = [...deduplicatedCities]
        .filter(city => city.start_date && city.is_new === true)
        .sort((a, b) => {
          const dateA = new Date(a.start_date!).getTime();
          const dateB = new Date(b.start_date!).getTime();
          return dateB - dateA; // Most recent first
        });

      // Get IDs of the last 5 added opportunities
      const last5Ids = new Set(
        sortedByDate.slice(0, 5).map(city => city._id || city.id).filter(Boolean)
      );

      // Update is_new flag: only true for the last 5 added
      deduplicatedCities.forEach(city => {
        const cityId = city._id || city.id;
        if (city.is_new === true && cityId && !last5Ids.has(cityId)) {
          city.is_new = false;
        }
      });

      // Extract available categories
      const categoriesSet = new Set<string>();
      deduplicatedCities.forEach(city => {
        if (city.category) {
          const cleanedCategory = cleanCategories ?
            cleanCategoryName(city.category) :
            city.category;
          if (cleanedCategory) {
            categoriesSet.add(cleanedCategory);
          }
        }
      });

      const sortedCategories = Array.from(categoriesSet).sort();
      setAvailableCategories(sortedCategories);

      setCities(deduplicatedCities);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch opportunities';
      setError(errorMessage);
    } finally {
      setLoading(false);
      // Reset bust cache flag after fetching
      if (bustCache) {
        setBustCache(false);

        // Clean up URL parameter to prevent continuous cache busting
        if (typeof window !== 'undefined' && window.location.search.includes('refresh=')) {
          const url = new URL(window.location.href);
          url.searchParams.delete('refresh');
          // Use replaceState to avoid adding to browser history
          window.history.replaceState({}, '', url.toString());
        }
      }
    }
  }, [
    isPublic,
    timeframe,
    isPersonalMode,
    // CRITICAL FIX: Don't refetch when hasCompletedAssessment changes in "all" mode
    // hasCompletedAssessment only matters when isPersonalMode is true
    // Removing this prevents unnecessary double-fetches on assessment status load
    // hasCompletedAssessment,
    includeCrownVault,
    publicEndpoint,
    filterCrownVault,
    cleanCategories,
    bustCache
  ]);

  // Fetch opportunities on mount and when config changes
  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Listen for cache clearing events and force refetch with cache busting
  useEffect(() => {
    const handleClearCache = () => {
      setBustCache(true) // This will trigger fetchOpportunities via dependency
    }

    window.addEventListener('dashboard:clear-cache', handleClearCache)
    window.addEventListener('app-data:clear-intelligence', handleClearCache)

    return () => {
      window.removeEventListener('dashboard:clear-cache', handleClearCache)
      window.removeEventListener('app-data:clear-intelligence', handleClearCache)
    }
  }, [])

  return {
    cities,
    loading,
    error,
    totalCount,
    availableCategories,
    refetch: fetchOpportunities
  };
}