// components/intelligence/crown-vault-assets-tags.tsx
// Crown Vault Assets with Tags Component
// Displays user's crown vault assets with their tag information

"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  TrendingUp, 
  Crown,
  Users,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Tag,
  Building,
  Car,
  Gem,
  Palette,
  DollarSign
} from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getCrownVaultAssets, type CrownVaultAsset } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface CrownVaultAssetsTagsProps {
  className?: string
  onActionClick?: (action: string, context: any) => void
}

const getAssetIcon = (assetType: string) => {
  switch (assetType.toLowerCase()) {
    case "real estate": return Building;
    case "vehicle": case "vehicles": return Car;
    case "jewelry": case "precious metals": return Gem;
    case "art": case "collectibles": return Palette;
    default: return DollarSign;
  }
}

const formatValue = (value: number, currency: string = "USD") => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return `${value.toLocaleString()}`;
}

export function CrownVaultAssetsTags({ className, onActionClick }: CrownVaultAssetsTagsProps) {
  const [assets, setAssets] = useState<CrownVaultAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['assets']))
  const { toast } = useToast()

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const assetsData = await getCrownVaultAssets()
        setAssets(assetsData)
      } catch (err: any) {
        console.error('Failed to fetch crown vault assets:', err)
        setError(err.message || 'Failed to load assets')
        toast({
          title: "Error Loading Assets",
          description: "Failed to load your Crown Vault assets. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssets()
  }, [toast])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleActionClick = (action: string, context: any) => {
    onActionClick?.(action, context)
  }

  const assetsWithTags = useMemo(() => {
    return displayAssets.filter(asset => {
      // For now, we'll simulate tag information based on elite_pulse_impact
      // In the real implementation, tags would come from the backend
      return asset.elite_pulse_impact || asset.asset_data
    })
  }, [displayAssets])

  const totalValue = useMemo(() => {
    return displayAssets.reduce((sum, asset) => sum + (asset.asset_data?.value || 0), 0)
  }, [displayAssets])

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Crown Vault Assets</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Crown className="h-8 w-8 mx-auto mb-3 opacity-50 animate-pulse" />
            <p>Loading your Crown Vault assets...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Crown Vault Assets</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Shield className="h-8 w-8 mx-auto mb-3 text-red-500" />
            <p className="text-red-600">Failed to load assets</p>
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show placeholder data if no assets or if there's an error
  const shouldShowPlaceholder = assets.length === 0 || error

  // Placeholder assets for demonstration
  const placeholderAssets = [
    {
      asset_id: "demo_asset_1",
      asset_data: {
        name: "Manhattan Penthouse",
        asset_type: "real estate",
        value: 12500000,
        currency: "USD",
        location: "Manhattan, New York",
        notes: "Premium downtown penthouse with Central Park views"
      },
      heir_ids: ["demo_heir_1"],
      heir_names: ["Alexandra Sterling"],
      created_at: "2024-01-15T10:30:00Z",
      elite_pulse_impact: {
        risk_level: "MEDIUM" as const,
        ui_display: {
          badge_text: "MEDIUM RISK",
          tooltip_title: "Real Estate Market Volatility",
          risk_indicator: "Market fluctuations expected",
          risk_badge_color: "orange",
          concern_summary: "NYC real estate showing signs of correction, monitor closely"
        }
      }
    },
    {
      asset_id: "demo_asset_2", 
      asset_data: {
        name: "Rare Art Collection",
        asset_type: "art",
        value: 3800000,
        currency: "USD",
        location: "Private Gallery, London",
        notes: "Curated collection of contemporary and classical pieces"
      },
      heir_ids: ["demo_heir_2"],
      heir_names: ["Marcus Sterling"],
      created_at: "2024-02-10T14:20:00Z",
      elite_pulse_impact: {
        risk_level: "LOW" as const,
        ui_display: {
          badge_text: "LOW RISK",
          tooltip_title: "Stable Alternative Asset",
          risk_indicator: "Historically stable",
          risk_badge_color: "green", 
          concern_summary: "Art market remains strong with consistent appreciation"
        }
      }
    }
  ]

  const displayAssets = shouldShowPlaceholder ? placeholderAssets : assets

  if (shouldShowPlaceholder && assets.length === 0 && !error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Crown Vault Assets</h3>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
              Demo Mode
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-6">
            <Crown className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="mb-2">Preview your Crown Vault assets with intelligent tagging</p>
            <p className="text-sm mb-4">Below are examples of how your assets would appear with our tag system</p>
            <div className="flex justify-center space-x-2 mb-4">
              <Badge variant="secondary" className="text-xs">Asset Intelligence</Badge>
              <Badge variant="outline" className="text-xs">Smart Categorization</Badge>
              <Badge variant="outline" className="text-xs">Risk Analysis</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full intelligence-card", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative intelligence-pulse">
              <Crown className="h-6 w-6 text-primary" />
              <Tag className="h-3 w-3 text-primary absolute -top-1 -right-1" />
            </div>
            <div>
              <h3 className="text-lg font-semibold intelligence-accent-gold">Crown Vault Assets</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs intelligence-badge">
                  {displayAssets.length} Assets
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ${formatValue(totalValue)} Total
                </Badge>
                {shouldShowPlaceholder && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    Demo Mode
                  </Badge>
                )}
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">
                    {shouldShowPlaceholder ? "Preview Mode" : "Tag System Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleActionClick('refresh_assets', {})}
            className="text-xs"
          >
            Refresh Assets
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Assets with Tags Section */}
        <div className="space-y-3">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => toggleSection('assets')}
          >
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Assets & Tags</h4>
              <Badge variant="secondary" className="text-xs">
                {assetsWithTags.length} Tagged
              </Badge>
            </div>
            {expandedSections.has('assets') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {expandedSections.has('assets') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {assetsWithTags.map((asset, index) => {
                const IconComponent = getAssetIcon(asset.asset_data?.asset_type || '')
                
                // Generate tag information based on asset data
                const assetTags = []
                
                // Add asset type tag
                if (asset.asset_data?.asset_type) {
                  assetTags.push({
                    name: asset.asset_data.asset_type,
                    type: 'category',
                    color: 'bg-blue-100 text-blue-800'
                  })
                }
                
                // Add location tag if available
                if (asset.asset_data?.location) {
                  assetTags.push({
                    name: asset.asset_data.location,
                    type: 'location',
                    color: 'bg-green-100 text-green-800'
                  })
                }
                
                // Add value tier tag
                const value = asset.asset_data?.value || 0
                if (value >= 1000000) {
                  assetTags.push({
                    name: 'High Value',
                    type: 'value',
                    color: 'bg-purple-100 text-purple-800'
                  })
                } else if (value >= 100000) {
                  assetTags.push({
                    name: 'Medium Value',
                    type: 'value',
                    color: 'bg-orange-100 text-orange-800'
                  })
                } else {
                  assetTags.push({
                    name: 'Standard',
                    type: 'value',
                    color: 'bg-gray-100 text-gray-800'
                  })
                }
                
                // Add elite pulse impact tag if available
                if (asset.elite_pulse_impact) {
                  const riskLevel = asset.elite_pulse_impact.risk_level
                  const riskColor = riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' : 
                                   riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-green-100 text-green-800'
                  assetTags.push({
                    name: `${riskLevel} Risk`,
                    type: 'risk',
                    color: riskColor
                  })
                }

                return (
                  <div
                    key={asset.asset_id}
                    className="p-4 rounded-lg border bg-gradient-to-r from-background to-muted/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <div>
                          <h5 className="font-semibold">{asset.asset_data?.name || 'Unnamed Asset'}</h5>
                          <p className="text-sm text-muted-foreground">
                            ${formatValue(asset.asset_data?.value || 0, asset.asset_data?.currency)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Asset ID</p>
                        <p className="text-xs font-mono">{asset.asset_id.slice(-8)}</p>
                      </div>
                    </div>
                    
                    {/* Tags Display */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {assetTags.map((tag, tagIndex) => (
                          <Badge 
                            key={tagIndex} 
                            variant="outline" 
                            className={cn("text-xs", tag.color)}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Elite Pulse Impact if available */}
                    {asset.elite_pulse_impact && (
                      <div className="mt-3 pt-3 border-t border-border/20">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Elite Pulse Analysis:</p>
                        <p className="text-sm">{asset.elite_pulse_impact.ui_display?.concern_summary || 'Risk assessment available'}</p>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full"
                      onClick={() => handleActionClick('view_asset', {
                        asset_id: asset.asset_id,
                        name: asset.asset_data?.name,
                        tags: assetTags
                      })}
                    >
                      View Asset Details
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                )
              })}
            </motion.div>
          )}
        </div>

        {/* Summary Section */}
        <div className="space-y-3">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => toggleSection('summary')}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold">Portfolio Summary</h4>
            </div>
            {expandedSections.has('summary') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.has('summary') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                    <p className="text-lg font-bold">{displayAssets.length}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <p className="text-lg font-bold">${formatValue(totalValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tagged Assets</p>
                    <p className="text-lg font-bold">{assetsWithTags.length}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Value</p>
                    <p className="text-lg font-bold">
                      ${formatValue(displayAssets.length > 0 ? totalValue / displayAssets.length : 0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mt-3 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Crown Vault • {shouldShowPlaceholder ? "Preview Mode" : "Tag System Active"}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleActionClick('manage_tags', {})}
            disabled={shouldShowPlaceholder}
          >
            Manage Tags
          </Button>
          <Button
            size="sm"
            onClick={() => handleActionClick('view_crown_vault', {})}
            className="bg-primary hover:bg-primary/90"
            disabled={shouldShowPlaceholder}
          >
            {shouldShowPlaceholder ? "Connect Assets" : "View Crown Vault"}
          </Button>
        </div>
        {shouldShowPlaceholder && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Connect your Crown Vault to see real asset data and manage tags
          </p>
        )}
      </CardContent>
    </Card>
  )
}