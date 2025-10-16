"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Gem } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { usePageDataCache } from "@/contexts/page-data-cache-context";
import { CrownLoader } from "@/components/ui/crown-loader";
import { getOpportunities, Opportunity } from "@/lib/api";
import { Heading2 } from "@/components/ui/typography";
import { PageHeaderWithBack } from "@/components/ui/back-button";
import { OpportunityAtlasNew as OpportunityAtlas } from "@/components/opportunity-atlas-new";
import { AssetCategoryData, generateAssetCategoriesFromOpportunities } from "@/lib/opportunity-atlas-data";
import { useOpportunityScoring, useIntelligenceActions } from "@/lib/hooks/use-intelligence";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { useIntelligenceData } from "@/hooks/use-intelligence-data";
import { getCurrentUser } from "@/lib/auth-manager";

interface PriveExchangePageProps {
  onNavigate?: (route: string) => void;
}

export function PriveExchangePage({ onNavigate }: PriveExchangePageProps) {
  const { theme } = useTheme();
  const { getCachedData, setCachedData, isCacheValid } = usePageDataCache();
  const searchParams = useSearchParams();

  // Check for cached data
  const cachedData = getCachedData('prive-exchange');
  const hasValidCache = isCacheValid('prive-exchange');

  const [selectedCategory, setSelectedCategory] = useState<AssetCategoryData | null>(null);
  const [assetCategories, setAssetCategories] = useState<AssetCategoryData[]>(cachedData?.assetCategories || []);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(cachedData?.opportunities || []);
  const [loading, setLoading] = useState(!hasValidCache);
  const [error, setError] = useState<string | null>(null);
  const [targetOpportunityId, setTargetOpportunityId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // Intelligence integration
  const opportunityScoring = useOpportunityScoring();
  const { trackOpportunityView } = useIntelligenceActions();

  // Get intelligence data with Victor analysis only for Prive Exchange
  const {
    data: intelligenceData,
    loading: intelligenceLoading,
    error: intelligenceError
  } = useIntelligenceData(userData, {
    loadCrownVaultMongoDB: false,     // No MongoDB Crown Vault data needed
    loadKatherineAnalysis: false,      // No Katherine analysis needed
    loadVictorAnalysis: true           // Victor analysis needed for opportunity scoring
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getCurrentUser();
        setUserData(user);
      } catch (err) {
        // Error handled silently
      }
    };
    loadUserData();
  }, []);

  // Check for opportunity parameter in URL or sessionStorage
  useEffect(() => {
    // First try URL params
    const opportunityParam = searchParams.get('opportunity');
    if (opportunityParam) {
      setTargetOpportunityId(opportunityParam);
      return;
    }

    // Then check sessionStorage (set by navigation from other pages)
    const storedOpportunity = sessionStorage.getItem('nav_param_opportunity');
    if (storedOpportunity) {
      setTargetOpportunityId(storedOpportunity);
      // Clean up the parameter after reading
      sessionStorage.removeItem('nav_param_opportunity');
    }
  }, [searchParams]);

  // Load opportunities data and merge with Victor analysis
  useEffect(() => {
    async function loadOpportunities() {
      try {
        // Check if we have valid cached data
        const cached = getCachedData('prive-exchange');
        const isCacheValid = cached && (Date.now() - cached.timestamp < (cached.ttl || 600000));

        // If cache is valid, skip API calls entirely
        if (isCacheValid && cached.opportunities?.length > 0) {
          setOpportunities(cached.opportunities);
          setAssetCategories(cached.assetCategories || []);
          setLoading(false);
          return;
        }

        // No valid cache - show loading and fetch data
        setLoading(true);
        const basicOpportunities = await getOpportunities();

        // Merge with Victor analysis data if available
        let enrichedOpportunities = basicOpportunities;

        if (intelligenceData && intelligenceData.victorOpportunities) {
          // Create a map of Victor opportunities by opportunity_id for O(1) lookup
          const victorMap = new Map();
          intelligenceData.victorOpportunities.forEach((victor: any) => {
            // Victor analysis should have opportunity_id field from backend
            if (victor.opportunity_id) {
              victorMap.set(victor.opportunity_id, victor);
            }
          });


          // Match opportunities with Victor analysis using direct ID matching
          enrichedOpportunities = basicOpportunities.map((opp: any) => {
            // Try both 'id' and '_id' fields for MongoDB compatibility
            const oppId = opp.id || opp._id;
            const victorMatch = oppId ? victorMap.get(oppId) : null;

            if (victorMatch) {

              // Helper function to replace MOE v4 with HNWI
              const replaceMoeV4 = (text: string | null | undefined): string => {
                if (!text || typeof text !== 'string') return text || ''
                return text
                  .replace(/MOE v4/gi, 'HNWI')
                  .replace(/MOE v\.4/gi, 'HNWI')
                  .replace(/MOE version 4/gi, 'HNWI')
                  .replace(/\bMOE\s+v4\b/gi, 'HNWI')
              };

              return {
                ...opp,
                // Merge Victor analysis fields with MOE v4 replacement
                victor_reasoning: replaceMoeV4(victorMatch.victor_reasoning || victorMatch.reasoning),
                strategic_insights: replaceMoeV4(victorMatch.strategic_insights),
                opportunity_window: replaceMoeV4(victorMatch.opportunity_window),
                risk_assessment: replaceMoeV4(victorMatch.risk_assessment || victorMatch.hnwi_alignment),
                elite_pulse_alignment: replaceMoeV4(victorMatch.elite_pulse_alignment),
                key_factors: replaceMoeV4(victorMatch.key_factors),
                implementation: replaceMoeV4(victorMatch.implementation),
                victor_action: victorMatch.victor_action,
                confidence_level: victorMatch.confidence_level,
                victor_score: victorMatch.victor_score || victorMatch.score,
                pros: victorMatch.pros,
                cons: victorMatch.cons,
                hnwi_alignment: replaceMoeV4(victorMatch.hnwi_alignment || victorMatch.moe_v4_alignment)
              };
            } else {
            }
            return opp;
          });
        }

        setOpportunities(enrichedOpportunities);

        // Generate asset categories from enriched opportunity data
        const categories = generateAssetCategoriesFromOpportunities(enrichedOpportunities);
        setAssetCategories(categories);

        // Cache the data (10-minute TTL) with timestamp
        setCachedData('prive-exchange', {
          opportunities: enrichedOpportunities,
          assetCategories: categories,
          timestamp: Date.now(),
          ttl: 600000
        }, 600000);

        setError(null);
      } catch (err) {
        setError("Failed to load investment opportunities");
      } finally {
        setLoading(false);
      }
    }

    // Only load when we have both userData and intelligence data (or intelligence loading is complete)
    if (userData && (!intelligenceLoading || intelligenceData)) {
      loadOpportunities();
    }
  }, [userData, intelligenceData, intelligenceLoading, getCachedData, setCachedData]);

  const handleCategorySelect = (category: AssetCategoryData | null) => {
    setSelectedCategory(category);
  };

  const handleNavigation = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    }
  };

  return (
    <>
        {(loading || intelligenceLoading) ? (
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            <CrownLoader size="lg" text="Loading intelligence data..." />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : (

          <OpportunityAtlas
            categories={assetCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            opportunityScoring={opportunityScoring}
            onOpportunityView={trackOpportunityView}
            targetOpportunityId={targetOpportunityId}
          />
        )}
    </>
  );
}