"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Gem } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
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
import { EnhancedCacheService } from "@/lib/services/enhanced-cache-service";

interface PriveExchangePageProps {
  onNavigate?: (route: string) => void;
}

export function PriveExchangePage({ onNavigate }: PriveExchangePageProps) {
  const { theme } = useTheme();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<AssetCategoryData | null>(null);
  const [assetCategories, setAssetCategories] = useState<AssetCategoryData[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetOpportunityId, setTargetOpportunityId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // Intelligence integration
  const opportunityScoring = useOpportunityScoring();
  const { trackOpportunityView } = useIntelligenceActions();

  // Victor analysis now comes directly with opportunities from /api/opportunities
  // No need to load intelligence data separately
  const {
    data: intelligenceData,
    loading: intelligenceLoading,
    error: intelligenceError
  } = useIntelligenceData(userData, {
    loadCrownVaultMongoDB: false,     // No MongoDB Crown Vault data needed
    loadKatherineAnalysis: false,      // No Katherine analysis needed
    loadVictorAnalysis: false          // Victor analysis comes with opportunities directly
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
        setLoading(true);

        // CRITICAL FIX: Clear stale opportunities cache to force fresh data
        // This ensures users see the latest data (e.g., updated Yavatmal)
        // Service Worker caches /api/opportunities for 5 minutes
        await EnhancedCacheService.clearOpportunitiesCache();

        // Bust cache by adding timestamp parameter to force fresh fetch
        const basicOpportunities = await getOpportunities(true);

        // Flatten Victor analysis data from nested victor_analysis object
        // Backend returns: { victor_analysis: { score, rating, verdict, pros, cons, ... } }
        // Frontend expects: { victor_score, victor_rating, victor_reasoning, pros, cons, ... }
        let enrichedOpportunities = basicOpportunities.map((opp: any) => {
          if (opp.victor_analysis) {
            const va = opp.victor_analysis;
            return {
              ...opp,
              // Map nested Victor fields to flat fields expected by UI
              victor_score: va.score || va.victor_score,
              victor_rating: va.rating || va.victor_rating,
              victor_reasoning: va.verdict || va.one_line_thesis || va.hnwi_thesis_alignment || va.reasoning,
              victor_action: va.verdict || va.one_line_thesis,
              confidence_level: va.confidence || va.confidence_level,
              pros: va.pros,
              cons: va.cons,
              risk_assessment: va.risk_assessment,
              opportunity_window: va.opportunity_window,
              strategic_insights: va.pattern_match || va.hnwi_thesis_alignment,
              hnwi_alignment: va.hnwi_thesis_alignment || va.pattern_match
            };
          }
          return opp;
        });

        // Legacy: Merge with Victor analysis data from intelligence endpoint if available
        // This is now deprecated since Victor data comes directly with opportunities
        if (intelligenceData && intelligenceData.victorOpportunities) {
          // Create TWO maps: one for ID matching, one for title matching
          const victorMapById = new Map();
          const victorMapByTitle = new Map();

          intelligenceData.victorOpportunities.forEach((victor: any) => {
            // Map by ID (opportunity_id, id, or _id)
            const victorId = victor.opportunity_id || victor.id || victor._id;
            if (victorId) {
              victorMapById.set(victorId, victor);
            }

            // Map by normalized title for fallback matching
            const victorTitle = (victor.title || victor.opportunity_title || victor.name || '').toLowerCase().trim();
            if (victorTitle) {
              victorMapByTitle.set(victorTitle, victor);
            }
          });


          // Match opportunities with Victor analysis from intelligence endpoint (legacy fallback)
          // This merges additional Victor data if available from intelligence endpoint
          enrichedOpportunities = enrichedOpportunities.map((opp: any) => {
            // Strategy 1: Try ID matching first (most reliable)
            const oppId = opp.id || opp._id || opp.opportunity_id;
            let victorMatch = oppId ? victorMapById.get(oppId) : null;

            // Strategy 2: Fallback to title matching if ID match failed
            if (!victorMatch) {
              const oppTitle = (opp.title || opp.name || '').toLowerCase().trim();
              victorMatch = oppTitle ? victorMapByTitle.get(oppTitle) : null;
            }

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
                victor_rating: victorMatch.victor_score || victorMatch.score, // Map victor_score to victor_rating for UI badge
                pros: victorMatch.pros,
                cons: victorMatch.cons,
                hnwi_alignment: replaceMoeV4(victorMatch.hnwi_alignment || victorMatch.moe_v4_alignment)
              };
            }
            return opp;
          });
        }

        setOpportunities(enrichedOpportunities);

        // Generate asset categories from enriched opportunity data
        const categories = generateAssetCategoriesFromOpportunities(enrichedOpportunities);
        setAssetCategories(categories);

        setError(null);
      } catch (err) {
        setError("Failed to load investment opportunities");
      } finally {
        setLoading(false);
      }
    }

    // Load opportunities once user data is available
    // Victor analysis comes directly with opportunities, no need to wait for intelligence data
    if (userData) {
      loadOpportunities();
    }
  }, [userData]);

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
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            <CrownLoader size="lg" text="Loading opportunities..." />
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