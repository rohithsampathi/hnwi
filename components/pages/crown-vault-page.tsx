"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { 
  Crown, 
  Plus, 
  Shield, 
  Clock, 
  DollarSign, 
  Users, 
  Building, 
  Car, 
  Gem, 
  Palette,
  Search,
  Filter,
  Lock,
  Vault,
  Network,
  Activity,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getCrownVaultAssets, 
  getCrownVaultStats, 
  getCrownVaultHeirs,
  processCrownVaultAssetsBatch,
  updateAssetHeirs,
  CrownVaultAsset,
  CrownVaultHeir,
  CrownVaultStats,
  BatchAssetResponse
} from "@/lib/api";

interface CrownVaultPageProps {
  onNavigate?: (route: string) => void;
}

const processingPhases = [
  { id: 0, text: "Analyzing your input...", icon: Activity, duration: 2000 },
  { id: 1, text: "Identifying assets and heirs...", icon: Network, duration: 2000 },
  { id: 2, text: "Encrypting with multi-key security...", icon: Lock, duration: 2000 },
  { id: 3, text: "Securing in your vault...", icon: Vault, duration: 1000 }
];

export function CrownVaultPage({ onNavigate }: CrownVaultPageProps) {
  const [assets, setAssets] = useState<CrownVaultAsset[]>([]);
  const [heirs, setHeirs] = useState<CrownVaultHeir[]>([]);
  const [stats, setStats] = useState<CrownVaultStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState(0);
  const [rawText, setRawText] = useState("");
  const [context, setContext] = useState("");
  const [activeTab, setActiveTab] = useState("assets");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("value-desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [newlyAddedAssets, setNewlyAddedAssets] = useState<Set<string>>(new Set());
  const [heirUpdateLoading, setHeirUpdateLoading] = useState<Set<string>>(new Set());
  const [selectedAsset, setSelectedAsset] = useState<CrownVaultAsset | null>(null);
  const [isAssetDetailOpen, setIsAssetDetailOpen] = useState(false);
  
  const { toast } = useToast();

  // Load initial data on page load with parallel API calls
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Parallel API calls for better performance
        const [assetsData, statsData, heirsData] = await Promise.allSettled([
          getCrownVaultAssets(),
          getCrownVaultStats(),
          getCrownVaultHeirs()
        ]);

        if (assetsData.status === 'fulfilled') {
          setAssets(assetsData.value);
        } else {
          console.error('Failed to load assets:', assetsData.reason);
        }

        if (statsData.status === 'fulfilled') {
          setStats(statsData.value);
        } else {
          console.error('Failed to load stats:', statsData.reason);
        }

        if (heirsData.status === 'fulfilled') {
          setHeirs(heirsData.value);
        } else {
          console.error('Failed to load heirs:', heirsData.reason);
        }

      } catch (error) {
        console.error('Error loading Crown Vault data:', error);
        toast({
          title: "Error Loading Vault",
          description: "Failed to load your Crown Vault data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [toast]);

  const getAssetIcon = (assetType: string) => {
    switch (assetType.toLowerCase()) {
      case "real estate": return Building;
      case "vehicle": case "vehicles": return Car;
      case "jewelry": case "precious metals": return Gem;
      case "art": case "collectibles": return Palette;
      default: return DollarSign;
    }
  };

  const formatValue = (value: number, currency: string = "USD") => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const getTotalValue = () => {
    return stats?.total_value || assets.reduce((total, asset) => {
      return total + (asset?.asset_data?.value || 0);
    }, 0);
  };

  const handleAddAssets = async () => {
    if (rawText.length < 50) return;
    
    try {
      setIsProcessing(true);
      setProcessingPhase(0);

      // Execute processing phases with proper timing
      for (let i = 0; i < processingPhases.length; i++) {
        setProcessingPhase(i);
        await new Promise(resolve => setTimeout(resolve, processingPhases[i].duration));
      }

      // Make the actual API call
      const result: BatchAssetResponse = await processCrownVaultAssetsBatch(rawText, context);
      
      // Update state with new assets
      const updatedAssets = [...assets, ...result.assets];
      setAssets(updatedAssets);
      
      // Track newly added assets for highlighting
      const newAssetIds = new Set(result.assets.map(a => a.asset_id));
      setNewlyAddedAssets(newAssetIds);
      
      // Update stats by refetching
      const updatedStats = await getCrownVaultStats();
      setStats(updatedStats);

      // Show success notification
      toast({
        title: "✓ Assets Secured Successfully",
        description: `${result.assets.length} asset${result.assets.length > 1 ? 's' : ''} added to your vault`,
        variant: "default"
      });

      // Reset form and navigate to assets tab
      setRawText("");
      setContext("");
      setIsAddModalOpen(false);
      setActiveTab("assets");

      // Remove highlighting after 3 seconds
      setTimeout(() => {
        setNewlyAddedAssets(new Set());
      }, 3000);

    } catch (error) {
      console.error('Asset processing error:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process assets. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHeirReassignment = async (assetId: string, newHeirIds: string[]) => {
    try {
      setHeirUpdateLoading(prev => new Set([...prev, assetId]));
      
      const result = await updateAssetHeirs(assetId, newHeirIds);
      
      // Update the asset in state
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.asset_id === assetId 
            ? { ...asset, heir_ids: newHeirIds, heir_names: result.heir_names }
            : asset
        )
      );

      toast({
        title: "Asset Reassigned",
        description: result.message,
        variant: "default"
      });

    } catch (error) {
      console.error('Heir reassignment error:', error);
      toast({
        title: "Reassignment Failed",
        description: "Failed to reassign asset. Please try again.",
        variant: "destructive"
      });
    } finally {
      setHeirUpdateLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(assetId);
        return newSet;
      });
    }
  };

  const handleAssetClick = (asset: CrownVaultAsset) => {
    setSelectedAsset(asset);
    setIsAssetDetailOpen(true);
  };

  const filteredAssets = assets.filter(asset => {
    // Safety check for asset data structure
    if (!asset || !asset.asset_data || !asset.heir_names) {
      return false;
    }

    const matchesSearch = (asset.asset_data.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (asset.asset_data.asset_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (asset.asset_data.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterBy === "all") return matchesSearch;
    if (filterBy.startsWith("heir-")) {
      const heirName = filterBy.replace("heir-", "");
      return matchesSearch && asset.heir_names.some(name => 
        (name || '').toLowerCase().includes(heirName.toLowerCase())
      );
    }
    return matchesSearch && (asset.asset_data.asset_type || '').toLowerCase() === filterBy.toLowerCase();
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    // Safety checks for sorting
    if (!a?.asset_data || !b?.asset_data) return 0;

    switch (sortBy) {
      case "value-desc":
        return (b.asset_data.value || 0) - (a.asset_data.value || 0);
      case "value-asc":
        return (a.asset_data.value || 0) - (b.asset_data.value || 0);
      case "date":
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      case "type":
        return (a.asset_data.asset_type || '').localeCompare(b.asset_data.asset_type || '');
      default:
        return 0;
    }
  });

  // Skeleton loader component
  const SkeletonCard = () => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout title="Crown Vault" onNavigate={onNavigate}>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-8 w-8 text-primary animate-pulse" />
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <div>
                      <Skeleton className="h-3 w-16 mb-2" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Crown Vault" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Crown Vault</h1>
              <Badge variant="secondary" className="ml-2">
                <Lock className="h-3 w-3 mr-1" />
                256-bit AES Encrypted
              </Badge>
            </div>
            <p className="text-muted-foreground">Discreetly organize your legacy with bank-grade encryption</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Assets
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{formatValue(getTotalValue())}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Vault className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Assets</p>
                  <p className="text-2xl font-bold">{stats?.total_assets || assets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Heirs</p>
                  <p className="text-2xl font-bold">{stats?.total_heirs || heirs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">
                    {stats?.last_updated 
                      ? new Date(stats.last_updated).toLocaleString()
                      : "2 minutes ago"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="heirs">Heirs</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-4">
            {/* Assets Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets by name, type, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-border/50 bg-background/80 text-foreground placeholder:text-foreground/50 dark:placeholder:text-muted-foreground hover:border-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40 border-2 border-border/50 bg-background/80 text-foreground hover:border-primary/30 transition-colors">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-2 border-border/50 shadow-xl">
                    <SelectItem value="all" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">All Assets</SelectItem>
                    <SelectItem value="real estate" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Real Estate</SelectItem>
                    <SelectItem value="vehicles" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Vehicles</SelectItem>
                    <SelectItem value="jewelry" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Jewelry</SelectItem>
                    <SelectItem value="art" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Art</SelectItem>
                    {heirs.map(heir => (
                      <SelectItem key={heir.id} value={`heir-${heir.name.toLowerCase()}`} className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">
                        {heir.name}'s Assets
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 border-2 border-border/50 bg-background/80 text-foreground hover:border-primary/30 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-2 border-border/50 shadow-xl">
                    <SelectItem value="value-desc" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Value (High to Low)</SelectItem>
                    <SelectItem value="value-asc" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Value (Low to High)</SelectItem>
                    <SelectItem value="date" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Date Added</SelectItem>
                    <SelectItem value="type" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Asset Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assets Grid */}
            {sortedAssets.length === 0 ? (
              <Card className="p-12 text-center">
                <Vault className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your Crown Vault Awaits</h3>
                <p className="text-muted-foreground mb-4">Start securing your legacy with military-grade encryption</p>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Asset
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedAssets.map((asset) => {
                  // Safety checks for asset rendering
                  if (!asset || !asset.asset_data || !asset.asset_id) {
                    return null;
                  }

                  const IconComponent = getAssetIcon(asset.asset_data.asset_type || '');
                  const isNewlyAdded = newlyAddedAssets.has(asset.asset_id);
                  const isUpdating = heirUpdateLoading.has(asset.asset_id);
                  
                  return (
                    <motion.div
                      key={asset.asset_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={isNewlyAdded ? "ring-2 ring-primary shadow-lg" : ""}
                    >
                      <Card 
                        className="h-full hover:shadow-lg transition-shadow cursor-pointer" 
                        onClick={() => handleAssetClick(asset)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-5 w-5 text-primary" />
                              <Badge variant="outline" className="text-xs border-2 border-primary/30 bg-primary/10 text-primary font-semibold dark:border-primary/60 dark:bg-primary/20 dark:text-white">
                                {asset.asset_data.asset_type || 'Unknown'}
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="text-lg">{asset.asset_data.name || 'Unnamed Asset'}</CardTitle>
                          <div className="text-2xl font-bold text-primary">
                            {formatValue(asset.asset_data.value || 0, asset.asset_data.currency)}
                          </div>
                          {asset.asset_data.location && (
                            <Badge variant="secondary" className="w-fit bg-secondary/20 text-secondary-foreground border border-secondary/40 font-medium dark:bg-secondary/30 dark:border-secondary/60 dark:text-white">
                              {asset.asset_data.location}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-foreground/70 dark:text-muted-foreground">Assigned to:</p>
                              <div onClick={(e) => e.stopPropagation()}>
                                <Select
                                  value={(asset.heir_ids && asset.heir_ids[0]) || ""}
                                  onValueChange={(heirId) => handleHeirReassignment(asset.asset_id, [heirId])}
                                  disabled={isUpdating}
                                >
                                  <SelectTrigger className="w-full border-2 border-border/50 dark:border-border bg-background/60 dark:bg-background text-foreground hover:border-primary/30 transition-colors">
                                    <SelectValue 
                                      placeholder={
                                        isUpdating ? (
                                          <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Updating...
                                          </div>
                                        ) : (asset.heir_names && asset.heir_names.length > 0) 
                                            ? asset.heir_names.join(", ") 
                                            : "Unassigned"
                                      } 
                                    />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover border-2 border-border/50 shadow-xl">
                                    {heirs.map((heir) => (
                                      <SelectItem key={heir.id} value={heir.id} className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">
                                        {heir.name} ({heir.relationship})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            {asset.asset_data.notes && (
                              <p className="text-sm text-foreground/80 dark:text-muted-foreground font-medium">{asset.asset_data.notes}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="heirs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heirs.map((heir) => (
                <Card key={heir.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {heir.name || 'Unknown Heir'}
                    </CardTitle>
                    <CardDescription className="text-foreground/70 dark:text-muted-foreground font-medium">{heir.relationship || 'Family Member'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-foreground/80 dark:text-muted-foreground font-medium">
                        {assets.filter(a => a.heir_ids && a.heir_ids.includes(heir.id)).length} assets assigned
                      </p>
                      {heir.email && (
                        <p className="text-sm text-foreground/70 dark:text-muted-foreground">
                          Email: {heir.email}
                        </p>
                      )}
                      {heir.phone && (
                        <p className="text-sm text-foreground/70 dark:text-muted-foreground">
                          Phone: {heir.phone}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recent_activity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Activity className="h-4 w-4 mt-1 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{activity.details}</p>
                          <p className="text-xs text-foreground/60 dark:text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-foreground/70 dark:text-muted-foreground">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Vault Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Encryption Status</p>
                      <p className="text-sm text-foreground/70 dark:text-muted-foreground">Multi-key encryption active</p>
                    </div>
                    <Badge variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Last Sync</p>
                      <p className="text-sm text-foreground/70 dark:text-muted-foreground">Vault synchronized 2 minutes ago</p>
                    </div>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Recent
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Assets Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Assets to Your Vault</DialogTitle>
              <DialogDescription>
                Describe your assets naturally. Include asset details, values, and heir assignments. Our AI will structure everything securely.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Textarea
                  placeholder="I have a 5-bedroom villa in Mumbai worth $2M going to my daughter Priya..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="min-h-32 resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-foreground/60 dark:text-muted-foreground font-medium">
                    {rawText.length < 50 ? `${50 - rawText.length} characters needed` : `${rawText.length} characters`}
                  </span>
                </div>
              </div>

              <div>
                <Input
                  placeholder="Context/Notes (e.g., Estate Planning 2025)"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddAssets}
                  disabled={rawText.length < 50}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Process & Secure
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Processing Modal */}
        <Dialog open={isProcessing} onOpenChange={() => {}}>
          <DialogContent className="max-w-md">
            <div className="text-center py-8">
              <div className="mb-4">
                {processingPhases[processingPhase] && (() => {
                  const IconComponent = processingPhases[processingPhase].icon;
                  return <IconComponent className="h-16 w-16 text-primary mx-auto animate-pulse" />;
                })()}
              </div>
              <h3 className="text-lg font-semibold mb-4">
                {processingPhases[processingPhase]?.text || "Processing..."}
              </h3>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((processingPhase + 1) / processingPhases.length) * 100}%` }}
                />
              </div>
              <p className="text-sm text-foreground/70 dark:text-muted-foreground mt-2">
                Phase {processingPhase + 1} of {processingPhases.length}
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Asset Detail Modal */}
        <Dialog open={isAssetDetailOpen} onOpenChange={setIsAssetDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedAsset && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {(() => {
                      const IconComponent = getAssetIcon(selectedAsset.asset_data?.asset_type || '');
                      return <IconComponent className="h-6 w-6 text-primary" />;
                    })()}
                    {selectedAsset.asset_data?.name || 'Unnamed Asset'}
                  </DialogTitle>
                  <DialogDescription>
                    Detailed view of your asset information and heir assignments
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Asset Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Asset Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-foreground/70 dark:text-muted-foreground font-medium">Asset Type</p>
                          <Badge variant="secondary" className="mt-1">
                            {selectedAsset.asset_data?.asset_type || 'Unknown'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-foreground/70 dark:text-muted-foreground font-medium">Value</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatValue(selectedAsset.asset_data?.value || 0, selectedAsset.asset_data?.currency)}
                          </p>
                        </div>
                        {selectedAsset.asset_data?.location && (
                          <div>
                            <p className="text-sm text-foreground/70 dark:text-muted-foreground font-medium">Location</p>
                            <p className="font-medium">{selectedAsset.asset_data.location}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-foreground/70 dark:text-muted-foreground font-medium">Created</p>
                          <p className="font-medium">
                            {selectedAsset.created_at 
                              ? new Date(selectedAsset.created_at).toLocaleDateString()
                              : 'Recently'
                            }
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Heir Assignment</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-foreground/70 dark:text-muted-foreground font-medium mb-2">Currently Assigned To:</p>
                          {selectedAsset.heir_names && selectedAsset.heir_names.length > 0 ? (
                            <div className="space-y-2">
                              {selectedAsset.heir_names.map((heirName, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{heirName}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-foreground/60 dark:text-muted-foreground italic">No heirs assigned</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-foreground/70 dark:text-muted-foreground font-medium mb-2">Reassign Asset:</p>
                          <Select
                            value={(selectedAsset.heir_ids && selectedAsset.heir_ids[0]) || ""}
                            onValueChange={(heirId) => {
                              handleHeirReassignment(selectedAsset.asset_id, [heirId]);
                              // Update selected asset in modal
                              const updatedAsset = {...selectedAsset};
                              updatedAsset.heir_ids = [heirId];
                              // Find heir name from heirs list
                              const heir = heirs.find(h => h.id === heirId);
                              if (heir) {
                                updatedAsset.heir_names = [heir.name];
                              }
                              setSelectedAsset(updatedAsset);
                            }}
                            disabled={heirUpdateLoading.has(selectedAsset.asset_id)}
                          >
                            <SelectTrigger className="w-full border-2 border-border/50 bg-background/80 text-foreground hover:border-primary/30 transition-colors">
                              <SelectValue placeholder="Select heir..." />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-2 border-border/50 shadow-xl">
                              {heirs.map((heir) => (
                                <SelectItem key={heir.id} value={heir.id} className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">
                                  {heir.name} ({heir.relationship})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Notes Section */}
                  {selectedAsset.asset_data?.notes && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground/80 dark:text-muted-foreground">{selectedAsset.asset_data.notes}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsAssetDetailOpen(false)}>
                      Close
                    </Button>
                    <Button 
                      onClick={() => {
                        toast({
                          title: "Asset Updated",
                          description: "Asset information has been saved.",
                          variant: "default"
                        });
                        setIsAssetDetailOpen(false);
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}