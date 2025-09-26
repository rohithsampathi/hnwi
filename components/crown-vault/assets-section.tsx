"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus, Shield, Users, Building, Car, Gem, Palette, DollarSign,
  Search, Loader2, Vault, MapPin, FileText, AlertTriangle, Zap, Clock,
  Info, MoreVertical, Edit, Trash2, ChevronUp, BarChart3, ChevronDown,
  Brain, Target, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CrownVaultAsset, CrownVaultHeir, updateAssetHeirs, updateCrownVaultAsset, deleteCrownVaultAsset } from "@/lib/api";
import { useTheme } from "@/contexts/theme-context";
import { getMetallicCardStyle, getVisibleSubtextColor } from "@/lib/colors";
import { getAssetImageForDisplay } from "@/lib/asset-image-assignment";
import { EditAssetModal } from "./edit-asset-modal";
import { getCategoryGroup, getCategoryDisplayName } from "@/lib/category-utils";
import { CitationText } from "@/components/elite/citation-text";

interface AssetsSectionProps {
  assets: CrownVaultAsset[];
  heirs: CrownVaultHeir[];
  onAddAssets: () => void;
  onAssetClick: (asset: CrownVaultAsset) => void;
  setAssets: React.Dispatch<React.SetStateAction<CrownVaultAsset[]>>;
}

// Katherine Portfolio Analysis Component
const KatherinePortfolioAnalysis = ({ assets }: { assets: CrownVaultAsset[] }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract Katherine analysis data from assets
  const getKatherineAnalysis = () => {
    const analysisData = assets
      .filter(asset => asset.elite_pulse_impact?.katherine_ai_analysis)
      .map(asset => ({
        assetName: asset.asset_data.name,
        assetType: asset.asset_data.asset_type,
        assetValue: asset.asset_data.value,
        riskLevel: asset.elite_pulse_impact?.risk_level,
        analysis: asset.elite_pulse_impact?.katherine_ai_analysis
      }));

    // Aggregate portfolio insights
    const totalAnalyzedValue = analysisData.reduce((sum, item) => sum + (item.assetValue || 0), 0);
    const riskBreakdown = analysisData.reduce((acc, item) => {
      const risk = item.riskLevel || 'UNKNOWN';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get overall portfolio assessment
    const highRiskAssets = analysisData.filter(item => item.riskLevel === 'HIGH');
    const mediumRiskAssets = analysisData.filter(item => item.riskLevel === 'MEDIUM');
    const lowRiskAssets = analysisData.filter(item => item.riskLevel === 'LOW');

    // Generate portfolio summary
    const overallRisk = highRiskAssets.length > 0 ? 'HIGH' :
                       mediumRiskAssets.length > 2 ? 'MEDIUM' : 'LOW';

    return {
      analysisData,
      totalAnalyzedValue,
      riskBreakdown,
      highRiskAssets,
      mediumRiskAssets,
      lowRiskAssets,
      overallRisk,
      totalAssets: analysisData.length,
      analysisAvailable: analysisData.length > 0
    };
  };

  const portfolioAnalysis = getKatherineAnalysis();

  if (!portfolioAnalysis.analysisAvailable) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Katherine Portfolio Analysis</h3>
          <p className="text-muted-foreground mb-4">
            Portfolio analysis will be available once asset impact assessments are complete.
          </p>
          <Badge variant="outline" className="text-xs">
            Analysis in Progress
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6" style={getMetallicCardStyle(theme).style}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Katherine Sterling-Chen Portfolio Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Elite Pulse Intelligence Assessment • {portfolioAnalysis.totalAssets} Assets Analyzed
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                View Analysis
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 pb-6 space-y-6">

              {/* Portfolio Risk Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/20 border border-muted text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-foreground">
                    ${(portfolioAnalysis.totalAnalyzedValue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-muted-foreground">Analyzed Value</p>
                </div>

                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {portfolioAnalysis.riskBreakdown.HIGH || 0}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">High Risk Assets</p>
                </div>

                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                    {portfolioAnalysis.riskBreakdown.MEDIUM || 0}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Medium Risk Assets</p>
                </div>

                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {portfolioAnalysis.riskBreakdown.LOW || 0}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">Low Risk Assets</p>
                </div>
              </div>

              {/* Overall Portfolio Assessment */}
              <div className="p-4 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <h4 className="font-semibold text-primary">Overall Portfolio Risk Assessment</h4>
                  <Badge
                    variant="outline"
                    className={`ml-auto ${
                      portfolioAnalysis.overallRisk === 'HIGH' ? 'border-red-500 text-red-700 bg-red-50 dark:bg-red-950/20 dark:text-red-400' :
                      portfolioAnalysis.overallRisk === 'MEDIUM' ? 'border-orange-500 text-orange-700 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400' :
                      'border-green-500 text-green-700 bg-green-50 dark:bg-green-950/20 dark:text-green-400'
                    }`}
                  >
                    {portfolioAnalysis.overallRisk} RISK PORTFOLIO
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <CitationText
                    text={
                      portfolioAnalysis.overallRisk === 'HIGH'
                        ? `Portfolio contains ${portfolioAnalysis.highRiskAssets.length} high-risk assets requiring immediate attention. Katherine recommends diversification and risk mitigation strategies to protect your wealth against market volatility.`
                        : portfolioAnalysis.overallRisk === 'MEDIUM'
                        ? `Portfolio shows balanced risk exposure with ${portfolioAnalysis.mediumRiskAssets.length} medium-risk assets. Katherine suggests monitoring market conditions and maintaining current allocation while considering strategic rebalancing.`
                        : `Portfolio demonstrates conservative risk management with strong defensive positioning. Katherine recommends maintaining current allocation while exploring selective growth opportunities in emerging markets.`
                    }
                    className="text-sm"
                  />
                </div>
              </div>

              {/* High Risk Assets Detail */}
              {portfolioAnalysis.highRiskAssets.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    High Risk Assets Requiring Attention
                  </h4>
                  {portfolioAnalysis.highRiskAssets.slice(0, 3).map((asset, index) => (
                    <div key={index} className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-red-800 dark:text-red-300">{asset.assetName}</h5>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {formatAssetType(asset.assetType)} • ${formatValue(asset.assetValue || 0)}
                          </p>
                        </div>
                        <Badge variant="destructive" className="text-xs">HIGH RISK</Badge>
                      </div>
                      {asset.analysis?.strategic_assessment && (
                        <div className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                          <CitationText
                            text={asset.analysis.strategic_assessment}
                            className="text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Strategic Recommendations */}
              <div className="p-4 rounded-lg bg-muted/10 border border-muted">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Strategic Recommendations</h4>
                </div>
                <div className="space-y-3 text-sm">
                  {portfolioAnalysis.highRiskAssets.length > 0 && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-foreground">Immediate Risk Mitigation:</span>
                        <span className="text-muted-foreground ml-1">
                          Review and consider rebalancing {portfolioAnalysis.highRiskAssets.length} high-risk assets to reduce portfolio volatility.
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-medium text-foreground">Portfolio Diversification:</span>
                      <span className="text-muted-foreground ml-1">
                        Maintain geographic and sector diversification across your ${(portfolioAnalysis.totalAnalyzedValue / 1000000).toFixed(1)}M analyzed portfolio.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-medium text-foreground">Regular Monitoring:</span>
                      <span className="text-muted-foreground ml-1">
                        Schedule quarterly reviews to assess changing risk profiles and market conditions.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elite Pulse Intelligence Attribution */}
              <div className="border-t border-muted-foreground/20 pt-4">
                <p className="text-xs text-muted-foreground italic text-center">
                  Analysis powered by Elite Pulse Intelligence System • Katherine Sterling-Chen AI
                </p>
              </div>

            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// Impact Analysis Component
const ImpactAnalysisTag = ({ asset }: { asset: CrownVaultAsset }) => {
  const impact = asset.elite_pulse_impact;
  
  // Return null if no impact data available
  if (!impact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30 bg-primary/10 hover:bg-primary/20">
            IMPACT: ANALYZING
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-auto w-auto p-1 hover:bg-transparent">
                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs p-4 space-y-2">
              <div className="font-semibold">Impact Analysis</div>
              <div className="text-sm space-y-2">
                <div>
                  <div className="font-medium">Status:</div>
                  <div className="text-muted-foreground">Elite Pulse analysis in progress for this asset.</div>
                </div>
                <div className="text-xs text-muted-foreground border-t pt-2">
                  Analysis will be available within 24 hours
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  const riskLevel = impact.risk_level || 'UNKNOWN';
  const impactSummary = impact.ui_display?.concern_summary || 'Elite Pulse impact analysis available';
  const recommendations = impact.ui_display?.recommendation || 'Monitor market conditions';
  const analysisDate = impact.timestamp || new Date().toISOString();
  
  // Get impact tag styling
  const getTagStyle = () => {
    switch (riskLevel) {
      case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold text-primary border-primary/30 bg-primary/10 hover:bg-primary/20"
        >
          IMPACT: {riskLevel}
        </Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto w-auto p-1 hover:bg-transparent">
              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs p-4 space-y-2">
            <div className="font-semibold">Impact Analysis</div>
            <div className="text-sm space-y-2">
              <div>
                <div className="font-medium">Assessment:</div>
                <div className="text-muted-foreground">{impactSummary}</div>
              </div>
              <div>
                <div className="font-medium">Recommendations:</div>
                <div className="text-muted-foreground">{recommendations}</div>
              </div>
              <div className="text-xs text-muted-foreground border-t pt-2">
                Analysis: {new Date(analysisDate).toLocaleDateString()}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

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
  // Use category grouping logic to get the proper display name
  const categoryGroup = getCategoryGroup(type);
  const displayName = getCategoryDisplayName(categoryGroup);
  
  // If it returns a grouped category name, use it; otherwise use the original formatting
  if (displayName !== categoryGroup) {
    return displayName;
  }
  
  // Fallback to original formatting if no category grouping matched
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Elite Pulse Impact Badge Utilities
const getElitePulseImpactBadge = (asset: CrownVaultAsset) => {
  const impact = asset.elite_pulse_impact;
  if (!impact) return null;
  
  const riskLevel = impact.risk_level || 'UNKNOWN';
  const badgeText = impact.ui_display?.badge_text || `${riskLevel} RISK`;
  const riskColor = impact.ui_display?.risk_badge_color || 'gray';
  
  // Get appropriate icon based on risk level
  const getImpactIcon = () => {
    switch (riskLevel) {
      case 'HIGH': return AlertTriangle;
      case 'MEDIUM': return Clock;
      case 'LOW': return Shield;
      default: return Zap;
    }
  };

  // Get badge styling based on risk level
  const getBadgeStyle = () => {
    switch (riskLevel) {
      case 'HIGH':
        return {
          bg: 'bg-red-500/90 hover:bg-red-600/90',
          text: 'text-white',
          border: 'border-red-600',
          pulse: 'ring-2 ring-red-500/40 hover:ring-red-500/60 animate-hnwi-glow'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-orange-500/90 hover:bg-orange-600/90',
          text: 'text-white',
          border: 'border-orange-600',
          pulse: ''
        };
      case 'LOW':
        return {
          bg: 'bg-green-500/90 hover:bg-green-600/90',
          text: 'text-white',
          border: 'border-green-600',
          pulse: ''
        };
      default:
        return {
          bg: 'bg-gray-500/90 hover:bg-gray-600/90',
          text: 'text-white',
          border: 'border-gray-600',
          pulse: ''
        };
    }
  };

  const IconComponent = getImpactIcon();
  const style = getBadgeStyle();
  
  return {
    badgeText,
    riskLevel,
    icon: IconComponent,
    style,
    tooltip: impact.ui_display?.tooltip_title || `Elite Pulse Impact: ${riskLevel}`,
    concern: impact.ui_display?.concern_summary || 'Katherine Sterling-Chen risk assessment'
  };
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
  const [sortBy, setSortBy] = useState("risk");
  const [heirUpdateLoading, setHeirUpdateLoading] = useState<Set<string>>(new Set());
  const [newlyAddedAssets, setNewlyAddedAssets] = useState<Set<string>>(new Set());
  const [deletingAssets, setDeletingAssets] = useState<Set<string>>(new Set());
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<CrownVaultAsset | null>(null);
  
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

  // Handle asset deletion
  const handleDeleteAsset = async (asset: CrownVaultAsset) => {
    
    
    if (!confirm(`Are you sure you want to delete "${asset.asset_data.name}"? This action cannot be undone.`)) {
      
      return;
    }

    try {
      
      setDeletingAssets(prev => new Set([...prev, asset.asset_id]));
      
      
      const result = await deleteCrownVaultAsset(asset.asset_id);
      
      
      // Remove asset from state
      setAssets(prevAssets => prevAssets.filter(a => a.asset_id !== asset.asset_id));
      
      
      toast({
        title: "Asset Deleted",
        description: `${asset.asset_data.name} has been permanently removed from your vault.`,
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete asset. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(asset.asset_id);
        return newSet;
      });
    }
  };

  // Handle asset editing - open edit modal
  const handleEditAsset = (asset: CrownVaultAsset) => {
    
    setEditingAsset(asset);
    setEditModalOpen(true);
  };

  // Handle asset update from modal
  const handleAssetUpdated = (updatedAsset: CrownVaultAsset) => {
    if (!updatedAsset || !updatedAsset.asset_id) {
      return;
    }
    
    setAssets(prevAssets => 
      prevAssets.map(asset => 
        asset.asset_id === updatedAsset.asset_id ? updatedAsset : asset
      )
    );
  };

  // Handle edit modal close
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditingAsset(null);
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
      case "risk":
        // Sort by risk level: HIGH > MEDIUM > LOW > undefined
        const riskOrder: { [key: string]: number } = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
        const aRisk = a.elite_pulse_impact?.risk_level?.toUpperCase() || 'LOW';
        const bRisk = b.elite_pulse_impact?.risk_level?.toUpperCase() || 'LOW';
        const riskDiff = (riskOrder[aRisk] ?? 3) - (riskOrder[bRisk] ?? 3);

        // If same risk level, sort by value descending
        if (riskDiff === 0) {
          return (b.asset_data.value || 0) - (a.asset_data.value || 0);
        }
        return riskDiff;

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
    <div className="mt-10 space-y-6">
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
              <SelectItem value="risk">Risk Priority</SelectItem>
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
            const isDeleting = deletingAssets.has(asset.asset_id);
            
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
                  className={`${getMetallicCardStyle(theme).className} hover:shadow-xl transition-all duration-300 h-full overflow-hidden`}
                  style={getMetallicCardStyle(theme).style}
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
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-black/40 text-white' : 'bg-black/70 text-white'} backdrop-blur-sm`}>
                        {formatAssetType(asset.asset_data.asset_type || 'Asset')}
                      </div>
                      {/* Elite Pulse Impact Badge */}
                      {(() => {
                        const impactBadge = getElitePulseImpactBadge(asset);
                        if (!impactBadge) return null;
                        
                        const { icon: ImpactIcon, style, badgeText, tooltip, concern } = impactBadge;
                        
                        return (
                          <div
                            className={`group px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm cursor-help transition-all duration-200 hover:scale-105 ${style.pulse}`}
                            style={{
                              background: impactBadge.riskLevel === 'HIGH'
                                ? "linear-gradient(135deg, #DC143C 0%, #FF1744 25%, #B71C1C 50%, #FF1744 75%, #DC143C 100%)" // Metallic ruby
                                : impactBadge.riskLevel === 'MEDIUM'
                                ? "linear-gradient(135deg, #FFB300 0%, #FFC107 25%, #FF8F00 50%, #FFC107 75%, #FFB300 100%)" // Metallic topaz
                                : impactBadge.riskLevel === 'LOW'
                                ? "linear-gradient(135deg, #10B981 0%, #34D399 25%, #059669 50%, #34D399 75%, #10B981 100%)" // Metallic emerald
                                : "linear-gradient(135deg, #6B7280 0%, #9CA3AF 25%, #4B5563 50%, #9CA3AF 75%, #6B7280 100%)", // Metallic gray
                              border: impactBadge.riskLevel === 'HIGH'
                                ? "2px solid rgba(220, 20, 60, 0.5)"
                                : impactBadge.riskLevel === 'MEDIUM'
                                ? "2px solid rgba(255, 193, 7, 0.5)"
                                : impactBadge.riskLevel === 'LOW'
                                ? "2px solid rgba(16, 185, 129, 0.5)"
                                : "2px solid rgba(107, 114, 128, 0.5)",
                              boxShadow: impactBadge.riskLevel === 'HIGH'
                                ? "0 2px 8px rgba(220, 20, 60, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)"
                                : impactBadge.riskLevel === 'MEDIUM'
                                ? "0 2px 8px rgba(255, 193, 7, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)"
                                : impactBadge.riskLevel === 'LOW'
                                ? "0 2px 8px rgba(16, 185, 129, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)"
                                : "0 2px 8px rgba(107, 114, 128, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)",
                              color: "#ffffff",
                              textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)"
                            }}
                            title={`${tooltip}\n\n${concern}`}
                          >
                            <div className="flex items-center gap-1">
                              <ImpactIcon className="h-3 w-3" />
                              <span className="text-[10px] font-extrabold tracking-wide">
                                {badgeText}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Card Content - Redesigned Layout */}
                  <div className="p-6 pt-0">

                    {/* Header Row: Title Left, Actions Right */}
                    <div className="flex items-start justify-between mb-4">
                      {/* Left: Asset Title */}
                      <div className="flex-1 pr-4">
                        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>
                          {asset.asset_data.name || 'Unnamed Asset'}
                        </h3>
                        {/* Value with unit details */}
                        <div className="mt-2">
                          <p className={`text-2xl font-black leading-none ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
                            ${formatValue(asset.asset_data.value || 0, asset.asset_data.currency)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {asset.asset_data.unit_count && asset.asset_data.cost_per_unit ? (
                              <>
                                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                                  {asset.asset_data.unit_count} units @ {asset.asset_data.currency || 'USD'} {formatValue(asset.asset_data.cost_per_unit, asset.asset_data.currency)}/unit
                                </p>
                              </>
                            ) : (
                              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                                {asset.asset_data.currency || 'USD'} Secured
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Right: Asset Actions Dropdown */}
                      <div onClick={(e) => e.stopPropagation()} data-dropdown-container>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditAsset(asset);
                              }}
                              disabled={isDeleting || isUpdating}
                              className="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white focus:bg-primary focus:text-white"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Asset
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteAsset(asset);
                              }}
                              className="text-red-600 dark:text-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-300 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950 dark:focus:text-red-300"
                              disabled={isDeleting || isUpdating}
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              {isDeleting ? "Deleting..." : "Delete Asset"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Impact Analysis Tag */}
                    <div className="mb-4">
                      <ImpactAnalysisTag asset={asset} />
                    </div>

                    {/* Unit Details */}
                    {asset.asset_data.unit_count && asset.asset_data.cost_per_unit && (
                      <div className="text-left mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart3 className={`h-4 w-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>
                              Units: {asset.asset_data.unit_count}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                              Cost per unit: {asset.asset_data.currency || 'USD'} {formatValue(asset.asset_data.cost_per_unit, asset.asset_data.currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

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

      {/* Katherine Portfolio Analysis Section */}
      <KatherinePortfolioAnalysis assets={sortedAssets} />

      {/* Edit Asset Modal */}
      <EditAssetModal
        asset={editingAsset}
        isOpen={editModalOpen}
        onClose={handleEditModalClose}
        onAssetUpdated={handleAssetUpdated}
      />
    </div>
  );
}