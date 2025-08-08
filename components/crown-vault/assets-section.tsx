"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  Plus, Shield, Users, Building, Car, Gem, Palette, DollarSign, 
  Search, Loader2, Vault, MapPin
} from "lucide-react";
import { motion } from "framer-motion";
import { CrownVaultAsset, CrownVaultHeir, updateAssetHeirs } from "@/lib/api";

interface AssetsSectionProps {
  assets: CrownVaultAsset[];
  heirs: CrownVaultHeir[];
  onAddAssets: () => void;
  onAssetClick: (asset: CrownVaultAsset) => void;
  setAssets: React.Dispatch<React.SetStateAction<CrownVaultAsset[]>>;
}

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
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return `${value.toLocaleString()}`;
};

const formatAssetType = (type: string) => {
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getUniqueAssetTypes = (assets: CrownVaultAsset[]) => {
  const types = new Set<string>();
  assets.forEach(asset => {
    if (asset?.asset_data?.asset_type) {
      types.add(asset.asset_data.asset_type.toLowerCase());
    }
  });
  return Array.from(types);
};

export function AssetsSection({ assets, heirs, onAddAssets, onAssetClick, setAssets }: AssetsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("value-desc");
  const [heirUpdateLoading, setHeirUpdateLoading] = useState<Set<string>>(new Set());
  const [newlyAddedAssets, setNewlyAddedAssets] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();

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

  return (
    <div className="space-y-6">
      {/* Assets Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Search Bar - Full Width on Mobile */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets by name, type, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-2 border-border/50 bg-background/80 text-foreground placeholder:text-foreground/50 dark:placeholder:text-muted-foreground hover:border-primary/30 focus:border-primary transition-colors"
          />
        </div>
        
        {/* Controls - Stack on Mobile, Row on Desktop */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <Button onClick={onAddAssets} className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="sm:inline">Add Assets</span>
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full sm:w-36 border-2 border-border/50 bg-background/80 text-foreground hover:border-primary/30 transition-colors">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-2 border-border/50 shadow-xl max-h-64 overflow-y-auto">
                <SelectItem value="all" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">All Assets</SelectItem>
                {getUniqueAssetTypes(assets).map(type => (
                  <SelectItem key={type} value={type} className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">
                    {formatAssetType(type)}
                  </SelectItem>
                ))}
                {heirs.map(heir => (
                  <SelectItem key={heir.id} value={`heir-${heir.name.toLowerCase()}`} className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">
                    {heir.name}'s Assets
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-36 border-2 border-border/50 bg-background/80 text-foreground hover:border-primary/30 transition-colors">
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
      </div>
      
      {/* Assets Grid */}
      {sortedAssets.length === 0 ? (
        <Card className="p-12 text-center">
          <Vault className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your Crown Vault Awaits</h3>
          <p className="text-muted-foreground mb-4">Start securing your legacy with military-grade encryption</p>
          <Button onClick={onAddAssets}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Asset
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAssets.map((asset) => {
            // Safety checks for asset rendering and decryption errors
            if (!asset || !asset.asset_data || !asset.asset_id) {
              return null;
            }
            
            // Handle decryption failures gracefully
            if (asset.asset_data.decryption_error || asset.error) {
              return (
                <Card key={asset.asset_id} className="p-6 border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                  <div className="text-center space-y-3">
                    <Shield className="h-8 w-8 text-red-500 mx-auto" />
                    <h3 className="font-semibold text-red-700 dark:text-red-300">Decryption Error</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Unable to decrypt this asset. Please contact support.
                    </p>
                    <Badge variant="destructive" className="text-xs">
                      Asset ID: {asset.asset_id?.slice(-8)}
                    </Badge>
                  </div>
                </Card>
              );
            }
            const IconComponent = getAssetIcon(asset.asset_data.asset_type || '');
            const isNewlyAdded = newlyAddedAssets.has(asset.asset_id);
            const isUpdating = heirUpdateLoading.has(asset.asset_id);
            
            return (
              <motion.div
                key={asset.asset_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="group relative overflow-hidden"
              >
                {/* ======= ULTRA-PREMIUM CROWN VAULT ASSET CARD ======= */}
                
                {/* Multi-Layer Background System - Matching Summary Cards */}
                <div className="absolute -inset-3 bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20 rounded-2xl blur-lg opacity-60 group-hover:opacity-90 transition-all duration-500" />
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-xl blur-md opacity-80 group-hover:opacity-100 transition-all duration-400" />
                
                {/* Shimmer effect - Matching Summary Cards */}
                <div className="absolute inset-0 -top-px overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                </div>
                
                {/* New Asset Announcement */}
                {isNewlyAdded && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full blur-md animate-pulse" />
                      <Badge className="relative bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold text-xs px-3 py-1 shadow-xl border border-emerald-400/30">
                        ✦ ACQUIRED
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Ultra-Premium Asset Card - Matching Summary Cards */}
                <Card 
                  className="relative h-full cursor-pointer overflow-hidden
                             bg-gradient-to-br from-background via-background/98 to-background/95
                             dark:from-slate-900/98 dark:via-slate-900/95 dark:to-slate-800/98
                             border-2 border-primary/30 dark:border-primary/40
                             backdrop-blur-xl shadow-2xl
                             hover:shadow-[0_25px_60px_rgba(34,_197,_94,_0.15)]
                             hover:border-primary/50 hover:bg-gradient-to-br hover:from-background hover:to-primary/5
                             dark:hover:to-primary/10
                             transition-all duration-500 ease-out
                             group-hover:scale-[1.02] group-hover:-translate-y-1"
                  onClick={() => onAssetClick(asset)}
                >
                  {/* Floating Ambient Elements - App Theme Colors */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-secondary/8 via-secondary/4 to-transparent rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/6 via-primary/3 to-transparent rounded-full blur-2xl" />
                  <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-gradient-to-bl from-accent/4 to-transparent rounded-full blur-xl" />
                  
                  <CardContent className="relative p-8 space-y-8">
                    
                    {/* ======= PREMIUM ASSET HEADER - Matching Summary Cards ======= */}
                    <div className="flex items-center justify-between mb-6">
                      {/* Premium Asset Icon */}
                      <div className="relative group/icon">
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-primary/20 rounded-2xl blur-lg opacity-60 group-hover/icon:opacity-90 transition-opacity duration-300" />
                        <div className="relative p-4 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl border-2 border-secondary/30 shadow-xl
                                       group-hover/icon:shadow-2xl group-hover/icon:scale-105 group-hover/icon:border-secondary/50
                                       transition-all duration-300">
                          <IconComponent className="h-8 w-8 text-secondary drop-shadow-lg" />
                        </div>
                      </div>
                      
                      {/* Asset Status Indicators */}
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                        <div className="w-1 h-1 bg-emerald-400/70 rounded-full animate-ping" />
                      </div>
                    </div>
                    
                    {/* ======= PREMIUM ASSET VALUE DISPLAY - Matching Summary Cards ======= */}
                    <div className="space-y-6">
                      {/* Asset Name - Premium Typography */}
                      <div className="space-y-3">
                        <p className="text-sm text-foreground font-bold tracking-wide uppercase opacity-90">Asset Name</p>
                        <h3 className="text-2xl font-black text-foreground leading-tight tracking-tight line-clamp-2 
                                      hover:text-secondary transition-colors duration-300">
                          {asset.asset_data.name || 'Unnamed Crown Asset'}
                        </h3>
                        <div className="w-full h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
                      </div>

                      {/* Asset Classification Badge */}
                      <div className="mb-6">
                        <Badge variant="outline" 
                               className="text-xs font-bold border-2 border-secondary/30 
                                          bg-gradient-to-r from-secondary/10 to-secondary/5
                                          text-secondary shadow-lg px-4 py-2 rounded-xl
                                          hover:border-secondary/50 hover:bg-gradient-to-r hover:from-secondary/20 hover:to-secondary/10
                                          transition-all duration-300">
                          {formatAssetType(asset.asset_data.asset_type || 'Premium Asset')}
                        </Badge>
                      </div>
                      
                      {/* Asset Value - Ultra Premium Display Matching Summary Cards */}
                      <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-2xl blur-sm" />
                        <div className="relative p-6 bg-gradient-to-br from-primary/5 via-secondary/3 to-accent/5 rounded-2xl border-2 border-primary/20
                                       hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                              <DollarSign className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wider text-primary/80 font-bold">Asset Value</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="relative">
                              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded blur-lg" />
                              <span className="relative text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">
                                ${formatValue(asset.asset_data.value || 0, asset.asset_data.currency)}
                              </span>
                              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-px bg-primary/60" />
                              <span className="text-xs font-bold text-primary tracking-widest uppercase">
                                {asset.asset_data.currency || 'USD'} Secured
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Location - Premium Display */}
                      {asset.asset_data.location && (
                        <div className="relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-2xl blur-sm" />
                          <div className="relative p-4 bg-gradient-to-br from-accent/5 to-accent/3 rounded-2xl border-2 border-accent/20
                                         hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl">
                                <MapPin className="h-5 w-5 text-accent" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider text-accent/80 font-bold">Location</p>
                                <p className="text-lg font-black text-accent">
                                  {asset.asset_data.location}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes - Premium Display */}
                      {asset.asset_data.notes && (
                        <div className="relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent rounded-2xl blur-sm" />
                          <div className="relative p-4 bg-gradient-to-br from-secondary/5 to-secondary/3 rounded-2xl border-2 border-secondary/20
                                         hover:border-secondary/40 hover:shadow-lg hover:shadow-secondary/10 transition-all duration-300">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-px bg-secondary/60" />
                                <p className="text-xs uppercase tracking-widest text-secondary/80 font-bold">Asset Notes</p>
                              </div>
                              <p className="text-sm text-foreground leading-relaxed font-medium">
                                {asset.asset_data.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Heir Assignment */}
                    <div className="py-3 border-t border-border/30">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                            Heir Designation
                          </p>
                          {asset.heir_names && asset.heir_names.length > 0 ? (
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {asset.heir_names[0]}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {heirs.find(h => h.id === asset.heir_ids?.[0])?.relationship || 'Beneficiary'}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              Unassigned
                            </p>
                          )}
                        </div>
        
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={(asset.heir_ids && asset.heir_ids[0]) || ""}
                            onValueChange={(heirId) => handleHeirReassignment(asset.asset_id, [heirId])}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-auto h-auto border-0 bg-transparent p-0 hover:bg-transparent focus:ring-0 focus:ring-offset-0">
                              <div>
                                {asset.heir_names && asset.heir_names.length > 0 ? (
                                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full 
                                                 flex items-center justify-center text-primary-foreground font-bold text-base cursor-pointer
                                                 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    {isUpdating ? (
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                      asset.heir_names[0].charAt(0).toUpperCase()
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-muted border-2 border-dashed border-border 
                                                 rounded-full flex items-center justify-center cursor-pointer
                                                 hover:border-primary/50 transition-colors duration-300">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-2 border-border 
                                                     shadow-2xl min-w-64 rounded-xl backdrop-blur-md"
                                                   side="bottom" align="end" sideOffset={8}>
                              {heirs.map((heir) => {
                                const isSelected = asset.heir_ids?.includes(heir.id);
                                return (
                                  <SelectItem key={heir.id} value={heir.id} 
                                              className="py-4 px-4 hover:bg-secondary/10 
                                                       focus:bg-secondary/10 rounded-lg mx-1 my-1
                                                       transition-all duration-200 relative overflow-hidden
                                                       [&_[data-radix-select-item-indicator]]:!hidden
                                                       [&_.lucide-check]:!hidden
                                                       [&_[data-state=checked]]:!hidden
                                                       before:absolute before:inset-0 before:z-10 before:bg-transparent">
                                    <div className="flex items-center gap-4 w-full">
                                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full 
                                                     flex items-center justify-center text-primary-foreground font-bold text-base
                                                     shadow-md">
                                        {heir.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex-1 space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-popover-foreground text-sm">
                                            {heir.name}
                                          </span>
                                          {isSelected && (
                                            <div className="w-2 h-2 bg-secondary rounded-full shadow-sm" />
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-semibold capitalize">
                                          {heir.relationship}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* ======= PREMIUM FOOTER - Matching Summary Cards ======= */}
                    <div className="flex items-center justify-center pt-6 border-t-2 border-primary/20">
                      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-50 to-green-50 
                                     dark:from-emerald-950/30 dark:to-green-950/20 border-2 border-emerald-200/50 
                                     dark:border-emerald-700/30 rounded-full shadow-lg">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                        <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 tracking-widest uppercase">
                          Secured On {new Date(asset.created_at || Date.now()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Bottom accent bar - Matching Summary Cards */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-b-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                    
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}