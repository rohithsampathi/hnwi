"use client";

import { useState, useEffect } from "react";
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

interface PriveExchangePageProps {
  onNavigate?: (route: string) => void;
}

export function PriveExchangePage({ onNavigate }: PriveExchangePageProps) {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<AssetCategoryData | null>(null);
  const [assetCategories, setAssetCategories] = useState<AssetCategoryData[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Intelligence integration
  const opportunityScoring = useOpportunityScoring();
  const { trackOpportunityView } = useIntelligenceActions();

  // Load opportunities data
  useEffect(() => {
    async function loadOpportunities() {
      try {
        setLoading(true);
        const data = await getOpportunities();
        setOpportunities(data);
        
        // Generate asset categories from real opportunity data
        const categories = generateAssetCategoriesFromOpportunities(data);
        setAssetCategories(categories);
        
        setError(null);
      } catch (err) {
        setError("Failed to load investment opportunities");
      } finally {
        setLoading(false);
      }
    }
    loadOpportunities();
  }, []);

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
            <CrownLoader size="lg" text="Verifying member access..." />
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
          />
        )}
    </>
  );
}