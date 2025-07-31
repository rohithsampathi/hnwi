"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Filter, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getOpportunities, Opportunity } from "@/lib/api";
import { Heading2 } from "@/components/ui/typography";
import { LiveButton } from "@/components/live-button";
import { OpportunityAtlas } from "@/components/opportunity-atlas";
import { RegionCards, RegionData } from "@/components/region-cards";
import { OpportunityFilterDrawer, FilterSettings } from "@/components/opportunity-filter-drawer";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { OpportunityCard, isOpportunityNew } from "@/components/opportunity-card";
import { AssetCategoryData, generateAssetCategoriesFromOpportunities } from "@/lib/opportunity-atlas-data";
import { motion, AnimatePresence } from "framer-motion";

interface PriveExchangePageProps {
  onNavigate?: (route: string) => void;
}

export function PriveExchangePage({ onNavigate }: PriveExchangePageProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<AssetCategoryData | null>(null);
  const [assetCategories, setAssetCategories] = useState<AssetCategoryData[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterSettings>({
    ticketBand: [],
    horizon: [],
    risk: [],
    postingDate: []
  });
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch all opportunities on mount
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

  // Load filter settings from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('prive-exchange-filters');
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }
  }, []);

  // Save filter settings to localStorage
  useEffect(() => {
    localStorage.setItem('prive-exchange-filters', JSON.stringify(filters));
  }, [filters]);

  // Get filtered opportunities based on selected category and filters
  const getFilteredOpportunities = () => {
    let filtered = selectedCategory ? selectedCategory.opportunities : opportunities;
    
    // Apply additional filters
    if (filters.risk.length > 0) {
      filtered = filtered.filter(opp => 
        filters.risk.some(risk => 
          opp.riskLevel?.toLowerCase().includes(risk.toLowerCase())
        )
      );
    }
    
    // Filter by posting date
    if (filters.postingDate.length > 0 && !filters.postingDate.includes('all')) {
      const now = new Date();
      filtered = filtered.filter(opp => {
        const oppDate = new Date(opp.start_date);
        return filters.postingDate.some(period => {
          if (period === 'last-7') {
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return oppDate >= sevenDaysAgo;
          }
          if (period === 'last-30') {
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return oppDate >= thirtyDaysAgo;
          }
          if (period === 'last-90') {
            const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            return oppDate >= ninetyDaysAgo;
          }
          return true;
        });
      });
    }
    
    return filtered;
  };

  const filteredOpportunities = getFilteredOpportunities();
  
  // Group opportunities by region
  const regions = filteredOpportunities.reduce((acc, opp) => {
    const region = opp.region || "Unknown";
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(opp);
    return acc;
  }, {} as Record<string, Opportunity[]>);

  // Create region data with counts
  const regionData: RegionData[] = Object.keys(regions).map(regionName => ({
    id: regionName.toLowerCase().replace(/\s+/g, '-'),
    name: regionName,
    opportunityCount: regions[regionName].length
  }));

  // Add regions with zero opportunities for completeness
  const allRegions = ["North America", "Europe", "Asia Pacific", "South America", "Middle East & Africa", "Global"];
  allRegions.forEach(regionName => {
    if (!regionData.find(r => r.name === regionName)) {
      regionData.push({
        id: regionName.toLowerCase().replace(/\s+/g, '-'),
        name: regionName,
        opportunityCount: 0
      });
    }
  });

  // Get opportunities for selected region
  const selectedRegionOpportunities = selectedRegion 
    ? regions[regionData.find(r => r.id === selectedRegion)?.name || ''] || []
    : [];

  // Unified navigation handler for all routes
  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    
    if (path === "back") {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("skipSplash", "true");
      }
      router.push("/");
    } else {
      if (typeof window !== 'undefined' && window.handleGlobalNavigation) {
        window.handleGlobalNavigation(path);
      } else {
        if (path === "dashboard") {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem("skipSplash", "true");
          }
          router.push("/");
        } else {
          try {
            router.push(`/${path.replace(/^\/+/, "")}`);
          } catch (e) {
            console.error("Navigation failed:", e);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem("skipSplash", "true");
            }
            router.push("/");
          }
        }
      }
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: AssetCategoryData | null) => {
    setSelectedCategory(category);
    setSelectedRegion(null); // Reset region when category changes
  };

  // Handle region selection
  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterSettings) => {
    setFilters(newFilters);
  };

  // Breadcrumb navigation
  const getBreadcrumbItems = () => {
    const items = [
      {
        label: "Privé Exchange",
        onClick: () => {
          setSelectedCategory(null);
          setSelectedRegion(null);
        },
        isActive: !selectedCategory && !selectedRegion
      }
    ];

    if (selectedCategory) {
      items.push({
        label: selectedCategory.name,
        onClick: () => setSelectedRegion(null),
        isActive: !selectedRegion
      });
    }

    if (selectedRegion) {
      const regionName = regionData.find(r => r.id === selectedRegion)?.name || selectedRegion;
      items.push({
        label: regionName,
        isActive: true
      });
    }

    return items;
  };

  if (loading) {
    return (
      <Layout 
        title={
          <div className="flex items-center gap-2">
            <span>Privé Exchange</span>
            <Badge className="bg-primary">Beta</Badge>
          </div>
        } 
        showBackButton 
        onNavigate={handleNavigation}
      >
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout 
        title={
          <div className="flex items-center gap-2">
            <span>Privé Exchange</span>
            <Badge className="bg-primary">Beta</Badge>
          </div>
        } 
        showBackButton 
        onNavigate={handleNavigation}
      >
        <div className="text-center p-8">
          <h3 className="text-xl font-medium text-red-500 mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title={
        <div className="flex items-center gap-2">
          <span>Privé Exchange</span>
          <Badge className="bg-primary">Beta</Badge>
          <LiveButton />
        </div>
      } 
      showBackButton 
      onNavigate={handleNavigation}
    >
      <div className="flex flex-col h-full relative">
        {/* Header */}
        <div className="space-y-2 px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heading2 className="text-primary">Privé Exchange</Heading2>
              <Badge className="bg-primary">Beta</Badge>
              <LiveButton />
            </div>
            {(selectedCategory || selectedRegion) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {Object.values(filters).some(arr => arr.length > 0) && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {Object.values(filters).reduce((sum, arr) => sum + arr.length, 0)}
                  </Badge>
                )}
              </Button>
            )}
          </div>
          <p className="font-body tracking-wide text-xl text-muted-foreground">
            Exclusive opportunities for elite investors
          </p>
        </div>

        {/* Breadcrumb Navigation */}
        {(selectedCategory || selectedRegion) && (
          <div className="px-4 pb-4">
            <BreadcrumbNav items={getBreadcrumbItems()} />
          </div>
        )}

        <div className="flex-grow px-4 pb-4 space-y-6">
          {/* Opportunity Atlas - Always visible at top */}
          <OpportunityAtlas
            categories={assetCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />

          {/* Region Cards - Show when category is selected */}
          <RegionCards
            selectedCategory={selectedCategory}
            regions={regionData}
            onRegionSelect={handleRegionSelect}
          />

          {/* Opportunity Grid - Show when region is selected */}
          <AnimatePresence>
            {selectedRegion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {regionData.find(r => r.id === selectedRegion)?.name} Opportunities
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegionOpportunities.length} investment{selectedRegionOpportunities.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                
                {selectedRegionOpportunities.length === 0 ? (
                  <div className="text-center p-8 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground mb-2">
                      No opportunities available in this region for {selectedCategory?.name}.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      New deals are added regularly. Check back soon.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {selectedRegionOpportunities.map((opportunity) => (
                      <OpportunityCard
                        key={opportunity.id}
                        opportunity={opportunity}
                        showNewRibbon={isOpportunityNew(opportunity)}
                        onReadMore={() => router.push(`/opportunity/${opportunity.id}`)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Drawer */}
        <OpportunityFilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isMobile={isMobile}
        />
      </div>
    </Layout>
  );
}