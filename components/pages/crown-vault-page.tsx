"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/contexts/theme-context";
import { useAuthPopup } from "@/contexts/auth-popup-context";
import { usePageDataCache } from "@/contexts/page-data-cache-context";
import { Heading2 } from "@/components/ui/typography";
import { PageHeaderWithBack } from "@/components/ui/back-button";
import { PageWrapper } from "@/components/ui/page-wrapper";
import {
  Crown, Shield, Plus, Lock, Brain, Database, User, Mail, Phone, FileText,
  Edit, X, Save, Building, DollarSign
} from "lucide-react";
import { getVisibleIconColor, getVisibleHeadingColor, getVisibleTextColor } from "@/lib/colors";

// Component imports
import { SummarySection } from "@/components/crown-vault/summary-section";
import { AssetsSection } from "@/components/crown-vault/assets-section";
import { HeirsSection } from "@/components/crown-vault/heirs-section";
import { ActivitySection } from "@/components/crown-vault/activity-section";
import { AddAssetsModal } from "@/components/crown-vault/add-assets-modal";
import { AssetDetailsPanel } from "@/components/crown-vault/asset-details-panel";
import { CrownLoader } from "@/components/ui/crown-loader";

// API imports
import {
  getCrownVaultAssets,
  getCrownVaultStats, 
  getCrownVaultHeirs,
  processCrownVaultAssetsBatch,
  createHeir,
  updateHeir,
  deleteHeir,
  type CrownVaultAsset,
  type CrownVaultHeir,
  type CrownVaultStats
} from "@/lib/api";
import {
  countAssetsByState,
  formatAssetCollectionValue,
  formatCompactMoney,
  formatPercent,
  getAssetActionPosture,
  getAssetChangePct,
  getAssetDisplayType,
  getAssetCurrentValue,
  getAssetCurrency,
} from "@/lib/crown-vault-intelligence";

interface CrownVaultPageProps {
  onNavigate?: (page: string) => void;
}

// Skeleton component for loading states
const SkeletonCard = () => (
  <Card className="h-full">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

export function CrownVaultPage({ onNavigate = () => {} }: CrownVaultPageProps) {
  const { theme } = useTheme();
  const { showAuthPopup } = useAuthPopup();
  const { setCachedData, clearCachedData } = usePageDataCache();
  const searchParams = useSearchParams();

  // Core state - Initialize with cached data if available
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<CrownVaultAsset[]>([]);
  const [heirs, setHeirs] = useState<CrownVaultHeir[]>([]);
  const [stats, setStats] = useState<CrownVaultStats | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "assets" | "heirs" | "activity">("summary");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssetDetailOpen, setIsAssetDetailOpen] = useState(false);
  const [isHeirDetailOpen, setIsHeirDetailOpen] = useState(false);
  const [isAddHeirModalOpen, setIsAddHeirModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<{assets: CrownVaultAsset[], totalValue: number} | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<CrownVaultAsset | null>(null);
  const [selectedHeir, setSelectedHeir] = useState<CrownVaultHeir | null>(null);

  // Form states
  const [rawText, setRawText] = useState("");
  const [context, setContext] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState(0);

  // Heir form states
  const [newHeirData, setNewHeirData] = useState({
    name: "",
    relationship: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [editingHeir, setEditingHeir] = useState<string | null>(null);
  const [editingHeirData, setEditingHeirData] = useState<any>(null);
  const [deletingHeirs, setDeletingHeirs] = useState<Set<string>>(new Set());
  const [isCreatingHeir, setIsCreatingHeir] = useState(false);

  const { toast } = useToast();
  const isLoadingData = useRef(false);

  // Helper function to detect authentication errors
  const isAuthenticationError = (error: any): boolean => {
    const errorMessage = error?.message || error?.toString() || '';
    return errorMessage.includes('Authentication required') || 
           errorMessage.includes('please log in') || 
           error?.status === 401;
  };
  
  // Helper function to detect permission errors
  const isPermissionError = (error: any): boolean => {
    return error?.status === 403 || 
           (error?.message && error.message.includes('403')) ||
           (error?.message && error.message.includes('Forbidden'));
  };

  // Processing phases for asset upload
  const processingPhases = [
    { icon: Brain, text: "AI analyzing your asset description..." },
    { icon: Database, text: "Structuring asset data securely..." },
    { icon: Lock, text: "Encrypting sensitive information..." },
    { icon: Shield, text: "Finalizing vault security protocols..." }
  ];

  // Handle URL query parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    const assetId = searchParams.get('asset');

    if (tab) {
      // Set the active tab based on query parameter
      if (tab === 'assets') {
        setActiveTab('assets');
      } else if (tab === 'heirs') {
        setActiveTab('heirs');
      } else if (tab === 'activity') {
        setActiveTab('activity');
      } else {
        setActiveTab('summary');
      }
    }

    // If there's an asset ID, we'll handle it after assets are loaded
    if (assetId && assets.length > 0) {
      const targetAsset = assets.find(a =>
        a.id === assetId || a._id === assetId || a.asset_id === assetId
      );
      if (targetAsset) {
        setSelectedAsset(targetAsset);
        // Optionally open the asset detail modal or scroll to it
        // For now, just select it
      }
    }
  }, [searchParams, assets]);

  // Load initial data function - defined outside useEffect so it can be called from auth callback
  const loadInitialData = useCallback(async () => {
    // Prevent concurrent loads
    if (isLoadingData.current) return;
    isLoadingData.current = true;

    // Crown Vault is a live decision surface. Never trust warm page cache here.
    clearCachedData('crown-vault');
    setLoading(true);

      try {
        const [assetsData, statsData, heirsData] = await Promise.allSettled([
          getCrownVaultAssets(),
          getCrownVaultStats(),
          getCrownVaultHeirs()
        ]);

        // Check for authentication and permission errors
        const failedResults = [assetsData, statsData, heirsData].filter(result => result.status === 'rejected');
        const hasAuthErrors = failedResults.some(result => isAuthenticationError(result.reason));
        const hasPermissionErrors = failedResults.some(result => isPermissionError(result.reason));
        
        if (hasAuthErrors && failedResults.length > 0) {
          // Show auth popup instead of console errors
          showAuthPopup({
            title: "Authentication Required",
            description: "Please sign in to access your Crown Vault data.",
            onSuccess: () => {
              // Retry loading data after successful login
              isLoadingData.current = false; // Reset flag to allow reload
              setTimeout(() => {
                loadInitialData();
              }, 500);
            }
          });
          return;
        }
        
        if (hasPermissionErrors && failedResults.length > 0) {
          // Show permission error message
          toast({
            title: "Premium Feature",
            description: "Crown Vault requires a premium subscription. Please upgrade your account to access this feature.",
            variant: "destructive"
          });
          // Don't return - show the page with empty data
        }
        
        // Handle successful data loading
        let newAssets: CrownVaultAsset[] = [];
        let newHeirs: CrownVaultHeir[] = [];
        let newStats: CrownVaultStats | null = null;

        if (assetsData.status === 'fulfilled') {
          newAssets = assetsData.value;
          setAssets(newAssets);
        }

        let loadedStats = null;
        if (statsData.status === 'fulfilled') {
          loadedStats = statsData.value;
        }

        if (heirsData.status === 'fulfilled') {
          const heirsArray = heirsData.value;
          newHeirs = heirsArray;
          setHeirs(newHeirs);

          // Update stats with actual heirs count if stats were loaded
          if (loadedStats) {
            newStats = {
              ...loadedStats,
              total_heirs: heirsArray.length  // Use actual heirs count
            };
            setStats(newStats);
          }
        } else if (loadedStats) {
          // If heirs failed but stats succeeded, still set stats
          newStats = loadedStats;
          setStats(newStats);
        }

        // Cache the loaded data (10-minute TTL) with timestamp
        setCachedData('crown-vault', {
          assets: newAssets,
          heirs: newHeirs,
          stats: newStats,
          timestamp: Date.now(),
          ttl: 600000
        }, 600000);

        // Handle non-auth errors (if any)
        const nonAuthErrors = failedResults.filter(result => !isAuthenticationError(result.reason));
        if (nonAuthErrors.length > 0) {
          toast({
            title: "Partial Loading Error",
            description: "Some vault data could not be loaded. Please try refreshing.",
            variant: "destructive"
          });
        }

    } catch (error) {
      if (isAuthenticationError(error)) {
        showAuthPopup({
          title: "Authentication Required",
          description: "Please sign in to access your Crown Vault data.",
          onSuccess: () => {
            isLoadingData.current = false; // Reset flag to allow reload
            setTimeout(() => {
              loadInitialData();
            }, 500);
          }
        });
      } else {
        toast({
          title: "Error Loading Vault",
          description: "Failed to load your Crown Vault data. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
      isLoadingData.current = false;
    }
  }, [clearCachedData, setCachedData, showAuthPopup, toast]);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Asset processing handler
  const handleAddAssets = async () => {
    if (rawText.length < 50) return;

    setIsProcessing(true);
    setProcessingPhase(0);

    const phases = [0, 1, 2, 3];
    for (const phase of phases) {
      setProcessingPhase(phase);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const result = await processCrownVaultAssetsBatch(rawText, context);
      
      if (!result || !result.assets || result.assets.length === 0) {
        toast({
          title: "No Assets Detected",
          description: "Could not extract any assets from your input. Please provide more details.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      setAssets(prevAssets => [...prevAssets, ...result.assets]);

      // Update stats
      const newTotalValue = result.assets.reduce((sum, asset) => sum + (asset.asset_data?.value || 0), 0);
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total_assets: prev.total_assets + result.assets.length,
          last_updated: new Date().toISOString(),
        } : prev);
      }

      // Show detailed success modal instead of just toast
      setSuccessData({ assets: result.assets, totalValue: newTotalValue });
      setIsSuccessModalOpen(true);

      setRawText("");
      setContext("");
      setIsAddModalOpen(false);
      setActiveTab('assets');

    } catch (error) {
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process assets. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Heir management handlers
  const handleCreateHeir = async () => {
    const finalRelationship = newHeirData.relationship === "custom" ? "" : newHeirData.relationship;
    
    if (!newHeirData.name.trim() || !finalRelationship.trim()) {
      toast({
        title: "Missing Information",
        description: "Name and relationship are required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreatingHeir(true);
      
      const result = await createHeir({
        name: newHeirData.name.trim(),
        relationship: finalRelationship.trim(),
        email: newHeirData.email.trim() || undefined,
        phone: newHeirData.phone.trim() || undefined,
        notes: newHeirData.notes.trim() || undefined
      });
      const newHeir = result.heir

      setHeirs(prevHeirs => [...prevHeirs, newHeir]);

      // Update stats with new heirs count
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total_heirs: prev.total_heirs + 1
        } : prev);
      }

      toast({
        title: "✓ Heir Added Successfully",
        description: `${newHeir.name} has been added as a designated heir.`,
        variant: "default"
      });

      setNewHeirData({
        name: "",
        relationship: "",
        email: "",
        phone: "",
        notes: ""
      });
      setIsAddHeirModalOpen(false);

    } catch (error) {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create heir. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingHeir(false);
    }
  };

  const handleDeleteHeir = async (heirId: string, heirName: string) => {
    if (!confirm(`Are you sure you want to delete ${heirName}? This will remove them from all assigned assets.`)) {
      return;
    }

    setDeletingHeirs(prev => new Set([...prev, heirId]));

    try {
      await deleteHeir(heirId);
      
      setHeirs(prevHeirs => prevHeirs.filter(heir => heir.id !== heirId));
      setAssets(prevAssets => prevAssets.map(asset => ({
        ...asset,
        heir_ids: asset.heir_ids?.filter(id => id !== heirId) || [],
        heir_names: asset.heir_names?.filter((_, index) => asset.heir_ids?.[index] !== heirId) || []
      })));

      // Update stats with new heirs count
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total_heirs: Math.max(0, prev.total_heirs - 1)
        } : prev);
      }

      toast({
        title: "✓ Heir Deleted",
        description: `${heirName} has been removed from your legacy plan.`,
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete heir. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingHeirs(prev => {
        const newSet = new Set(prev);
        newSet.delete(heirId);
        return newSet;
      });
    }
  };

  // Utility functions
  const getHeirAssets = (heirId: string) => {
    return assets.filter(asset => asset.heir_ids && asset.heir_ids.includes(heirId));
  };

  const startHeirEditing = (heir: CrownVaultHeir) => {
    setEditingHeir(heir.id);
    setEditingHeirData({
      name: heir.name || '',
      relationship: heir.relationship || '',
      email: heir.email || '',
      phone: heir.phone || '',
      notes: heir.notes || ''
    });
  };

  const handleUpdateHeir = async (heirId: string, data: any) => {
    try {
      await updateHeir(heirId, data);
      
      // Update heirs list
      setHeirs(prev => prev.map(heir => 
        heir.id === heirId 
          ? { ...heir, ...data }
          : heir
      ));
      
      // Reset editing state
      setEditingHeir(null);
      setEditingHeirData(null);
      
      toast({
        title: "Success",
        description: "Heir updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update heir. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Tab content renderer
  const renderTabContent = () => {
    if (activeTab === 'summary') {
      return (
        <SummarySection
          stats={stats}
          assets={assets}
          onAddAssets={() => setIsAddModalOpen(true)}
          onNavigateToTab={(tab: string) => setActiveTab(tab as "summary" | "assets" | "heirs" | "activity")}
        />
      );
    }
    if (activeTab === 'assets') {
      return (
        <AssetsSection
          assets={assets}
          heirs={heirs}
          onAddAssets={() => setIsAddModalOpen(true)}
          onAssetClick={(asset) => {
            setSelectedAsset(asset);
            setIsAssetDetailOpen(true);
          }}
          setAssets={setAssets}
        />
      );
    }
    if (activeTab === 'heirs') {
      return (
        <HeirsSection
          heirs={heirs}
          assets={assets}
          setIsAddHeirModalOpen={setIsAddHeirModalOpen}
          setSelectedHeir={setSelectedHeir}
          setIsHeirDetailOpen={setIsHeirDetailOpen}
          startHeirEditing={startHeirEditing}
          handleDeleteHeir={handleDeleteHeir}
          getHeirAssets={getHeirAssets}
          deletingHeirs={deletingHeirs}
        />
      );
    }
    if (activeTab === 'activity') {
      return (
        <ActivitySection stats={stats} />
      );
    }
    return null;
  };

  const tabOptions: Array<{
    id: "summary" | "assets" | "heirs" | "activity";
    label: string;
    title: string;
    description: string;
  }> = [
    {
      id: "summary",
      label: "Summary",
      title: "Vault Summary",
      description: "Portfolio value, Katherine posture, heir coverage, and current allocation in one view.",
    },
    {
      id: "assets",
      label: "Assets",
      title: "Asset Registry",
      description: "Review each asset, its current valuation rail, and Katherine-backed market context.",
    },
    {
      id: "heirs",
      label: "Heirs",
      title: "Heir Exposure",
      description: "Track beneficiary assignments and identify assets that still need succession mapping.",
    },
    {
      id: "activity",
      label: "Activity",
      title: "Vault Activity",
      description: "Audit the most recent changes, sync events, and Crown Vault state updates.",
    },
  ];

  const activeTabMeta = tabOptions.find((tab) => tab.id === activeTab) ?? tabOptions[0];


  return (
    <PageWrapper>
      <div className="space-y-6 px-4 pb-24 sm:px-6 lg:px-8 lg:pb-10">
        <PageHeaderWithBack
          title="Crown Vault"
          description="Track current value, heir exposure, and Katherine-backed asset intelligence from one secured surface."
          onNavigate={onNavigate}
          icon={Crown}
        />

        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <CrownLoader size="lg" text="Encrypting generational assets..." />
          </div>
        ) : (
          <>
            <Card className="border-border/60 bg-card/70 shadow-sm">
              <CardContent className="flex flex-col gap-4 p-4 md:p-5">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Vault Navigation
                  </p>
                  <Heading2 className="text-2xl font-bold text-foreground">
                    {activeTabMeta.title}
                  </Heading2>
                  <p className="max-w-3xl text-sm text-muted-foreground">
                    {activeTabMeta.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-background/70 p-2">
                  {tabOptions.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 sm:px-4 ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="min-h-[50vh]">
              {renderTabContent()}
            </div>

            <AddAssetsModal
          isAddModalOpen={isAddModalOpen}
          setIsAddModalOpen={setIsAddModalOpen}
          rawText={rawText}
          setRawText={setRawText}
          context={context}
          setContext={setContext}
          handleAddAssets={handleAddAssets}
          isProcessing={isProcessing}
          processingPhase={processingPhase}
        />

        {/* Asset Addition Success Modal */}
        <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                Assets Successfully Added to Your Vault
              </DialogTitle>
            </DialogHeader>

            {successData && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {successData.assets.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Asset{successData.assets.length > 1 ? 's' : ''} Added
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {formatAssetCollectionValue(successData.assets, getAssetCurrentValue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Value Secured
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Asset Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Added Assets:</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {successData.assets.map((asset, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              {getAssetDisplayType(asset).toLowerCase().includes('property') || getAssetDisplayType(asset).toLowerCase().includes('land') || getAssetDisplayType(asset).toLowerCase().includes('apartment') || getAssetDisplayType(asset).toLowerCase().includes('house') ? (
                                <Building className="h-4 w-4 text-primary" />
                              ) : (
                                <DollarSign className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {asset.asset_data.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {getAssetDisplayType(asset)} • {asset.asset_data.location || 'Location TBD'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-foreground">
                              {formatCompactMoney(getAssetCurrentValue(asset), getAssetCurrency(asset))}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getAssetCurrency(asset)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Security Notice */}
                <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-200">
                        Enterprise-Grade Security Applied
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        Your assets are protected with military-grade encryption and stored securely in your Crown Vault.
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsSuccessModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setIsSuccessModalOpen(false);
                      setActiveTab('assets');
                    }}
                    className="gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    View All Assets
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

            <Dialog
              open={isAssetDetailOpen}
              onOpenChange={(open) => {
                setIsAssetDetailOpen(open);
                if (!open) {
                  setSelectedAsset(null);
                }
              }}
            >
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-xl font-semibold">
                      {selectedAsset?.asset_data?.name || "Asset Detail"}
                    </DialogTitle>
                    {selectedAsset && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {[getAssetDisplayType(selectedAsset), selectedAsset.asset_data.location].filter(Boolean).join(" • ")}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAssetDetailOpen(false);
                      setSelectedAsset(null);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogHeader>

                {selectedAsset && (
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-4">
                      <Card className="border-border/60 bg-card/70">
                        <CardContent className="p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Current Value
                          </p>
                          <p className="mt-2 text-xl font-bold text-foreground">
                            {formatCompactMoney(getAssetCurrentValue(selectedAsset), getAssetCurrency(selectedAsset))}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-border/60 bg-card/70">
                        <CardContent className="p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Since Entry
                          </p>
                          <p className="mt-2 text-xl font-bold text-foreground">
                            {typeof getAssetChangePct(selectedAsset) === "number"
                              ? formatPercent(getAssetChangePct(selectedAsset))
                              : "Not established"}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-border/60 bg-card/70">
                        <CardContent className="p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Posture
                          </p>
                          <p className="mt-2 text-xl font-bold text-foreground">
                            {getAssetActionPosture(selectedAsset) || "Still resolving"}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-border/60 bg-card/70">
                        <CardContent className="p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Heirs
                          </p>
                          <p className="mt-2 text-base font-semibold text-foreground">
                            {selectedAsset.heir_names?.length ? selectedAsset.heir_names.join(", ") : "Not assigned"}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <AssetDetailsPanel
                      asset={selectedAsset}
                      isExpanded
                      showToggle={false}
                      onToggleExpanded={() => setIsAssetDetailOpen(false)}
                      onAssetUpdated={(updatedAsset) => {
                        setAssets((previousAssets) =>
                          previousAssets.map((asset) =>
                            asset.asset_id === updatedAsset.asset_id ? updatedAsset : asset,
                          ),
                        );
                        setSelectedAsset(updatedAsset);
                      }}
                    />
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Heir Detail Modal */}
            <Dialog open={isHeirDetailOpen} onOpenChange={setIsHeirDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle className="text-xl font-semibold">Heir Details</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsHeirDetailOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>

            {selectedHeir && (
              <div className="space-y-6">
                {/* Header Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className={`text-2xl font-bold ${getVisibleTextColor(theme, 'accent')}`}>
                            {selectedHeir.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">{selectedHeir.name}</h2>
                          <Badge variant="secondary" className="mt-1 badge-primary">
                            {selectedHeir.relationship.charAt(0).toUpperCase() + selectedHeir.relationship.slice(1).toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setIsHeirDetailOpen(false);
                          startHeirEditing(selectedHeir);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact Information
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedHeir.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedHeir.email}</span>
                      </div>
                    )}
                    {selectedHeir.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedHeir.phone}</span>
                      </div>
                    )}
                    {!selectedHeir.email && !selectedHeir.phone && (
                      <p className="text-muted-foreground text-sm">No contact information provided</p>
                    )}
                  </CardContent>
                </Card>

                {/* Inheritance Summary */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Inheritance Summary
                    </h3>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const heirAssets = getHeirAssets(selectedHeir.id);
                      const totalValueLabel = formatAssetCollectionValue(heirAssets, getAssetCurrentValue);
                      const stateCounts = countAssetsByState(heirAssets);
                      
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center">
                              <p className={`text-2xl font-bold ${getVisibleTextColor(theme, 'accent')}`}>{heirAssets.length}</p>
                              <p className="text-sm text-muted-foreground">Assets</p>
                            </div>
                            <div className="text-center">
                              <p className={`text-2xl font-bold ${getVisibleTextColor(theme, 'accent')}`}>{totalValueLabel}</p>
                              <p className="text-sm text-muted-foreground">Current Value</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-950/20">
                              <p className="text-lg font-semibold text-green-700 dark:text-green-400">{stateCounts.winning}</p>
                              <p className="text-[11px] uppercase tracking-wide text-green-700/80 dark:text-green-400/80">Good</p>
                            </div>
                            <div className="rounded-lg bg-zinc-100 p-3 text-center dark:bg-zinc-900/40">
                              <p className="text-lg font-semibold text-foreground">{stateCounts.stable}</p>
                              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Stable</p>
                            </div>
                            <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-950/20">
                              <p className="text-lg font-semibold text-red-700 dark:text-red-400">{stateCounts.under_pressure + stateCounts.unresolved}</p>
                              <p className="text-[11px] uppercase tracking-wide text-red-700/80 dark:text-red-400/80">Attention</p>
                            </div>
                          </div>

                          {heirAssets.length > 0 ? (
                            <div className="space-y-2">
                              <h4 className="font-medium text-foreground mb-2">Inherited Assets:</h4>
                              {heirAssets.map((asset) => (
                                <div key={asset.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <div>
                                    <p className="font-medium text-foreground">{asset.asset_data.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {getAssetDisplayType(asset)}
                                      {asset.asset_data.location ? ` • ${asset.asset_data.location}` : ""}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {getAssetActionPosture(asset) || "Still resolving"}
                                      {typeof getAssetChangePct(asset) === "number" ? ` • ${formatPercent(getAssetChangePct(asset))}` : ""}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-foreground">
                                      {formatCompactMoney(getAssetCurrentValue(asset), getAssetCurrency(asset))}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">No assets assigned yet</p>
                          )}
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedHeir.notes && (
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Notes
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground whitespace-pre-wrap">{selectedHeir.notes}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="text-center text-sm text-muted-foreground">
                  Added on {new Date(selectedHeir.created_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

            {/* Heir Edit Modal */}
            <Dialog open={editingHeir !== null} onOpenChange={() => {
              setEditingHeir(null);
              setEditingHeirData(null);
            }}>
          <DialogContent className="max-w-lg">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Edit Heir
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingHeir(null);
                  setEditingHeirData(null);
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>

            {editingHeirData && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingHeir && editingHeirData) {
                  handleUpdateHeir(editingHeir, editingHeirData);
                }
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={editingHeirData.name}
                    onChange={(e) => setEditingHeirData({...editingHeirData, name: e.target.value})}
                    placeholder="Enter heir's name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Select value={editingHeirData.relationship} onValueChange={(value) => setEditingHeirData({...editingHeirData, relationship: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Spouse", "Child", "Parent", "Sibling", "Grandchild", "Grandparent", "Other Family", "Friend", "Business Partner", "Charitable Organization", "Trust", "Other"].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingHeirData.email}
                    onChange={(e) => setEditingHeirData({...editingHeirData, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editingHeirData.phone}
                    onChange={(e) => setEditingHeirData({...editingHeirData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editingHeirData.notes}
                    onChange={(e) => setEditingHeirData({...editingHeirData, notes: e.target.value})}
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingHeir(null);
                      setEditingHeirData(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!editingHeirData.name.trim() || !editingHeirData.relationship}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export default CrownVaultPage;
