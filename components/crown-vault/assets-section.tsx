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
  Search, Loader2, Vault, MapPin, FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { CrownVaultAsset, CrownVaultHeir, updateAssetHeirs } from "@/lib/api";
import { useTheme } from "@/contexts/theme-context";
import { getMetallicCardStyle, getVisibleSubtextColor } from "@/lib/colors";
import { getAssetImageForDisplay } from "@/lib/asset-image-assignment";

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

const getAssetBackgroundClass = (assetType: string) => {
  switch (assetType.toLowerCase()) {
    case "real estate": return "asset-bg-real-estate";
    case "vehicle": case "vehicles": return "asset-bg-vehicle";
    case "jewelry": case "precious metals": return "asset-bg-jewelry";
    case "art": case "collectibles": return "asset-bg-art";
    case "investment": case "stocks": case "bonds": return "asset-bg-investment";
    default: return "asset-bg-default";
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
  const { theme } = useTheme();
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
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* Left side: Add Assets Button and Search */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <Button onClick={onAddAssets} className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span>Add Assets</span>
          </Button>
          
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets by name, type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Right side: Filter and Sort Controls */}
        <div className="flex flex-col gap-3 lg:flex-row lg:gap-3 lg:flex-shrink-0">
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-full lg:w-36">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              {getUniqueAssetTypes(assets).map(type => (
                <SelectItem key={type} value={type}>
                  {formatAssetType(type)}
                </SelectItem>
              ))}
              {heirs.map(heir => (
                <SelectItem key={heir.id} value={`heir-${heir.name.toLowerCase()}`}>
                  {heir.name}'s Assets
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value-desc">Value (High to Low)</SelectItem>
              <SelectItem value="value-asc">Value (Low to High)</SelectItem>
              <SelectItem value="date">Date Added</SelectItem>
              <SelectItem value="type">Asset Type</SelectItem>
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
                {/* Flagship Asset Card - Matching Summary Cards Design */}
                <div 
                  className={`${getMetallicCardStyle(theme).className} hover:shadow-xl transition-all duration-300 cursor-pointer h-full overflow-hidden`} 
                  style={getMetallicCardStyle(theme).style}
                  onClick={() => onAssetClick(asset)}
                >
                  {/* Premium Asset Image - Full Width Top Banner */}
                  <div className="relative w-full h-48 mb-6">
                    <img
                      src={getAssetImageForDisplay(asset)}
                      alt={`Premium ${asset.asset_data.asset_type || 'asset'}`}
                      className="w-full h-full object-cover"
                      style={{ filter: 'blur(0.5px)' }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-black/40 text-white' : 'bg-black/70 text-white'} backdrop-blur-sm`}>
                        {formatAssetType(asset.asset_data.asset_type || 'Asset')}
                      </div>
                    </div>
                  </div>

                  {/* Card Content - Redesigned Layout */}
                  <div className="p-6 pt-0">

                    {/* Header Row: Title Left, Value Right */}
                    <div className="flex items-start justify-between mb-4">
                      {/* Left: Asset Title */}
                      <div className="flex-1 pr-4">
                        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>
                          {asset.asset_data.name || 'Unnamed Asset'}
                        </h3>
                      </div>
                      
                      {/* Right: Big Value with Subtext */}
                      <div className="text-right">
                        <p className={`text-3xl font-black leading-none ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
                          ${formatValue(asset.asset_data.value || 0, asset.asset_data.currency)}
                        </p>
                        <p className={`text-xs font-medium mt-1 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                          {asset.asset_data.currency || 'USD'} Secured
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    {asset.asset_data.location && (
                      <div className="text-left mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className={`h-4 w-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>
                            {asset.asset_data.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Asset Notes */}
                    {asset.asset_data.notes && (
                      <div className="text-left mb-4">
                        <div className="flex items-start gap-2 mb-1">
                          <FileText className={`h-4 w-4 mt-0.5 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
                          <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'} line-clamp-2`}>
                            {asset.asset_data.notes}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Heir Assignment - Flagship Style */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/20">
                    <div>
                      <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                        Heir Assignment
                      </p>
                      {asset.heir_names && asset.heir_names.length > 0 ? (
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-primary' : 'text-gray-800'}`}>
                          {asset.heir_names[0]}
                        </p>
                      ) : (
                        <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
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
                        <SelectTrigger className="w-auto h-auto border-0 bg-transparent p-0">
                          <div>
                            {asset.heir_names && asset.heir_names.length > 0 ? (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${theme === 'dark' ? 'bg-white/20 text-white' : 'bg-black/80 text-white'}`}>
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  asset.heir_names[0].charAt(0).toUpperCase()
                                )}
                              </div>
                            ) : (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/20' : 'bg-black/20'}`}>
                                <Users className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                              </div>
                            )}
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {heirs.map((heir) => (
                            <SelectItem key={heir.id} value={heir.id}>
                              {heir.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}