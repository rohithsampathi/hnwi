"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Store } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { CrownLoader } from "@/components/ui/crown-loader";
import { getOpportunities, Opportunity } from "@/lib/api";
import { Heading2 } from "@/components/ui/typography";
import { OpportunityAtlasNew as OpportunityAtlas } from "@/components/opportunity-atlas-new";
import { AssetCategoryData, generateAssetCategoriesFromOpportunities } from "@/lib/opportunity-atlas-data";

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
        console.error("Failed to fetch opportunities:", err);
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
    <Layout 
      currentPage="prive-exchange"
      title={
        <div className="flex items-center space-x-2">
          <Store className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
          <Heading2 className={`${theme === "dark" ? "text-white" : "text-black"}`}>Privé Exchange</Heading2>
        </div>
      }
      showBackButton 
      onNavigate={handleNavigation}
    >
      <div className="flex flex-col h-full relative">
        <div className="px-4 py-2">
          <p className="text-muted-foreground text-base leading-tight">
            Off-market opportunities. Member referrals only.
          </p>
        </div>

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

          <div className="flex-grow px-4 pb-4 space-y-6">
            {/* Opportunity Atlas - Now shows opportunities in right panel */}
            <OpportunityAtlas
              categories={assetCategories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}