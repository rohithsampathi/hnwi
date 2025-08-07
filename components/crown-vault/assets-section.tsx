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
                className="group relative"
              >
                {/* ======= ULTRA-PREMIUM CROWN VAULT ASSET CARD ======= */}
                
                {/* Multi-Layer Background System - Like Swiss Watch Faces */}
                <div className="absolute -inset-2 bg-gradient-to-br from-slate-900/5 via-blue-900/5 to-purple-900/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="absolute -inset-1 bg-gradient-to-br from-amber-400/8 via-gold-400/6 to-amber-600/8 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-lg blur-sm opacity-60 group-hover:opacity-100 transition-all duration-400" />
                
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

                {/* The Crown Vault Card Sanctuary */}
                <Card 
                  className="relative h-full cursor-pointer overflow-hidden
                             bg-gradient-to-br from-card via-background to-card/90
                             dark:from-slate-900/95 dark:via-slate-900/98 dark:to-slate-800/95
                             border-2 border-primary/10 dark:border-primary/20
                             backdrop-blur-xl shadow-2xl
                             hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)]
                             hover:border-primary/30 hover:bg-gradient-to-br hover:from-card hover:to-primary/5
                             dark:hover:to-primary/10
                             transition-all duration-500 ease-out
                             group-hover:scale-[1.01] group-hover:-translate-y-0.5"
                  onClick={() => onAssetClick(asset)}
                >
                  {/* Floating Ambient Elements - Museum Quality */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-400/6 via-gold-400/4 to-transparent rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-600/4 via-indigo-600/3 to-transparent rounded-full blur-2xl" />
                  <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-bl from-purple-500/3 to-transparent rounded-full blur-xl" />
                  
                  <CardContent className="relative p-8 space-y-6">
                    
                    {/* ======= CROWN HEADER: ASSET IDENTITY & SECURITY ======= */}
                    <div className="flex items-start justify-between mb-1">
                      
                      {/* Asset Crown: Icon + Classification */}
                      <div className="flex items-center gap-4">
                        {/* Levitating Asset Icon */}
                        <div className="relative group/icon">
                          <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 to-primary/30 rounded-xl blur-lg opacity-40 group-hover/icon:opacity-70 transition-opacity duration-300" />
                          <div className="relative p-3 bg-gradient-to-br from-card via-background to-card
                                         border-2 border-secondary/20 rounded-xl shadow-lg
                                         group-hover/icon:shadow-xl group-hover/icon:scale-105 group-hover/icon:border-secondary/40
                                         transition-all duration-300">
                            <IconComponent className="h-6 w-6 text-secondary drop-shadow-sm" />
                          </div>
                        </div>
                        
                        {/* Asset Classification Badge */}
                        <div className="space-y-1">
                          <Badge variant="outline" 
                                 className="text-xs font-bold border-2 border-border 
                                            bg-gradient-to-r from-card to-muted
                                            text-foreground shadow-sm px-3 py-1
                                            hover:border-secondary/50 hover:bg-gradient-to-r hover:from-secondary/10 hover:to-secondary/5
                                            transition-all duration-300">
                            {formatAssetType(asset.asset_data.asset_type || 'Premium Asset')}
                          </Badge>
                        </div>
                      </div>
                      
                    </div>

                    {/* ======= THE VALUE THRONE: HERO ELEMENT ======= */}
                    <div className="space-y-3">
                      {/* Asset Name - Sophisticated Typography */}
                      <h3 className="font-bold text-xl leading-tight text-foreground 
                                    line-clamp-2 tracking-tight hover:text-secondary 
                                    transition-colors duration-300 cursor-pointer">
                        {asset.asset_data.name || 'Unnamed Crown Asset'}
                      </h3>
                      
                      {/* Asset Value - Premium Display */}
                      <div className="py-4 px-5 bg-gradient-to-br from-primary/5 via-secondary/3 to-accent/5 rounded-xl border border-primary/10">
                        <div className="flex items-baseline gap-3">
                          <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded blur-sm" />
                            <span className="relative text-4xl font-black bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent tracking-tight leading-none">
                              ${formatValue(asset.asset_data.value || 0, asset.asset_data.currency)}
                            </span>
                          </div>
                          <div className="px-2.5 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-md border border-primary/20">
                            <span className="text-xs font-bold text-primary">
                              {asset.asset_data.currency || 'USD'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Location - Premium Display */}
                      {asset.asset_data.location && (
                        <div className="flex items-center gap-2 py-2">
                          <div className="p-2 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {asset.asset_data.location}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {asset.asset_data.notes && (
                        <div className="py-3 border-t border-border/30">
                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                              Notes
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">
                              {asset.asset_data.notes}
                            </p>
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

                    {/* ======= PROVENANCE FOOTER ======= */}
                    <div className="flex items-center justify-center pt-4 border-t-2 border-slate-200/30 dark:border-slate-700/30">
                      
                      {/* Combined Secured Status */}
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 
                                     dark:from-emerald-950/30 dark:to-green-950/20 border border-emerald-200/50 
                                     dark:border-emerald-700/30 rounded-full shadow-sm">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 tracking-widest">
                          SECURED ON {new Date(asset.created_at || Date.now()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
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