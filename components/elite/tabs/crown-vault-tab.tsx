// components/elite/tabs/crown-vault-tab.tsx
// Crown Vault portfolio impact analysis tab

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Activity, AlertCircle, CheckCircle2, ArrowRight, Loader2, Clock, ChevronDown, ChevronUp, TrendingDown, TrendingUp, Shield } from "lucide-react"
import { CrownLoader } from "@/components/ui/crown-loader"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context"
import { useAuthPopup } from "@/contexts/auth-popup-context"
import { getMetallicCardStyle } from "@/lib/colors"
import { getCrownVaultAssets, type CrownVaultAsset } from "@/lib/api"
import { secureApi } from "@/lib/secure-api"
import type { ProcessedIntelligenceData, User } from "@/types/dashboard"

interface CrownVaultTabProps {
  data: ProcessedIntelligenceData
  onNavigate: (route: string) => void
  user: User
}

export function CrownVaultTab({ data, onNavigate, user }: CrownVaultTabProps) {
  const { theme } = useTheme()
  const { showAuthPopup } = useAuthPopup()
  const metallicStyle = getMetallicCardStyle(theme)
  
  // State for fetching Crown Vault assets (parent doesn't load them)
  const [assets, setAssets] = useState<CrownVaultAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set())
  
  // Helper function to detect authentication errors
  const isAuthenticationError = (error: any): boolean => {
    const errorMessage = error?.message || error?.toString() || '';
    return errorMessage.includes('Authentication required') || 
           errorMessage.includes('please log in') || 
           error?.status === 401;
  };
  
  // Fetch Crown Vault assets with Elite Pulse impact data
  useEffect(() => {
    let isMounted = true;
    
    async function fetchAssetsWithImpact() {
      if (!user?.userId) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        
        // Use secureApi directly to call external backend with detailed assets
        const detailedAssets = await secureApi.get(`/api/crown-vault/assets/detailed?owner_id=${user.userId}`, true)
        
        
        if (!isMounted) return;
        
        // Process assets to extract impact data following the real MongoDB structure
        const processedAssets = detailedAssets.map((asset: any) => {

          return {
            ...asset,
            id: asset._id || asset.id, // MongoDB uses _id
            // Extract latest tags from tags array (tags[0].tags)
            tags: asset.tags?.[0]?.tags || [],
            // Elite Pulse impact data (direct from MongoDB)
            elite_pulse_impact: asset.elite_pulse_impact,
            // Asset basic info using MongoDB field structure
            asset_data: {
              name: asset.decrypted_data?.name || `${asset.unit_count} ${asset.unit_type}`,
              asset_type: asset.unit_type,
              value: asset.unit_count * asset.cost_per_unit,
              unit_count: asset.unit_count,
              unit_type: asset.unit_type,
              cost_per_unit: asset.cost_per_unit,
              ...asset.asset_data
            },
            // Calculate total value from MongoDB fields
            total_value: asset.unit_count * asset.cost_per_unit
          }
        })
        
        setAssets(processedAssets)
        setError(null)
      } catch (err) {
        if (!isMounted) return;
        
        
        if (isAuthenticationError(err)) {
          // Show auth popup instead of generic error
          showAuthPopup({
            title: "Authentication Required",
            description: "Please sign in to view your Crown Vault impact analysis.",
            onSuccess: () => {
              // Retry loading data after successful login
              setTimeout(() => {
                fetchAssetsWithImpact();
              }, 100);
            }
          });
        } else {
          setError('Failed to load Crown Vault impact analysis')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    fetchAssetsWithImpact()
    
    return () => {
      isMounted = false;
    };
  }, [user?.userId, showAuthPopup])
  
  const hasAssets = assets && assets.length > 0
  
  // Helper functions for asset cards
  const toggleAssetExpansion = (assetId: string) => {
    setExpandedAssets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(assetId)) {
        newSet.delete(assetId)
      } else {
        newSet.add(assetId)
      }
      return newSet
    })
  }
  
  const getRiskIcon = (riskLevel: string) => {
    switch(riskLevel) {
      case 'HIGH': return <TrendingDown className="h-3 w-3" />
      case 'MEDIUM': return <AlertCircle className="h-3 w-3" />
      case 'LOW': return <Shield className="h-3 w-3" />
      default: return <Activity className="h-3 w-3" />
    }
  }
  
  const getActionUrgency = (timeline: string) => {
    if (timeline?.includes('30 days') || timeline?.includes('immediate')) return 'urgent'
    if (timeline?.includes('60 days') || timeline?.includes('near-term')) return 'moderate'
    return 'normal'
  }
  
  const formatAssetType = (assetType: string) => {
    if (!assetType) return ''
    // Convert snake_case to sentence case
    return assetType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <Crown className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Crown Vault Integration</h2>
            <p className="text-sm text-muted-foreground">Advanced portfolio impact analysis</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        
        {hasAssets && (
          <div className="mt-6 space-y-4 max-w-4xl mx-auto">
            {(() => {
              const assetsWithImpact = assets.filter((asset: any) => 
                (asset.tags && asset.tags.length > 0) || asset.elite_pulse_impact
              );
              const criticalAssets = assets.filter((asset: any) => 
                asset.elite_pulse_impact?.risk_level === 'HIGH' || 
                asset.elite_pulse_impact?.risk_level === 'MEDIUM'
              );
              
              return (
                <>
                  <h4 className="font-semibold mb-4 flex items-center text-foreground text-left">
                    <Activity className="h-4 w-4 mr-2" />
                    Top 3 High & Medium Impact Assets 
                    <Badge variant="outline" className="ml-2">
                      {criticalAssets.length} Critical | {assetsWithImpact.length} Total
                    </Badge>
                  </h4>
                  
                  <div className="grid gap-4">
                    {assets
                      .filter((asset: any) => 
                        // Only show assets with HIGH or MEDIUM risk levels
                        asset.elite_pulse_impact?.risk_level === 'HIGH' || 
                        asset.elite_pulse_impact?.risk_level === 'MEDIUM'
                      )
                .sort((a: any, b: any) => {
                  // Sort by risk level priority: HIGH > MEDIUM > LOW
                  const riskPriority = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                  const aRisk = riskPriority[a.elite_pulse_impact?.risk_level] || 0;
                  const bRisk = riskPriority[b.elite_pulse_impact?.risk_level] || 0;
                  if (aRisk !== bRisk) return bRisk - aRisk;
                  
                  // Secondary sort by asset value for same risk level
                  const aValue = a.asset_data?.value || 0;
                  const bValue = b.asset_data?.value || 0;
                  return bValue - aValue;
                })
                .slice(0, 3)
                .map((asset: any, index: number) => {
                  const impactTags = asset.tags || []
                  const eliteImpact = asset.elite_pulse_impact
                  const riskLevel = eliteImpact?.risk_level || 'LOW'
                  const riskColor = eliteImpact?.risk_badge_color || 'green'
                  const assetId = asset.id || asset.asset_id || `asset-${index}`
                  const isExpanded = expandedAssets.has(assetId)
                  const actionUrgency = getActionUrgency(eliteImpact?.action_timeline)
                  
                  return (
                    <motion.div
                      key={assetId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={cn(
                        metallicStyle.className,
                        "text-left border-l-4 relative cursor-pointer transition-all duration-200",
                        // Enhanced border colors for high impact using app primary colors
                        riskColor === 'red' ? 'border-l-primary/80 shadow-lg shadow-primary/20' :
                        riskColor === 'orange' ? 'border-l-primary/60 shadow-lg shadow-primary/15' : 
                        'border-l-primary/40',
                        // Special highlighting for HIGH risk assets using app primary colors
                        riskLevel === 'HIGH' && 'ring-1 ring-primary/40 bg-primary/5',
                        riskLevel === 'MEDIUM' && 'ring-1 ring-primary/30 bg-primary/3',
                        // Hover effects
                        'hover:shadow-lg hover:scale-[1.02] hover:ring-1 hover:ring-primary/20'
                      )}
                      style={metallicStyle.style}
                      onClick={() => toggleAssetExpansion(assetId)}
                    >
                      <div className="p-4">
                        {/* Asset Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {getRiskIcon(riskLevel)}
                                <h5 className="font-semibold text-foreground text-sm">
                                  {asset.asset_data?.name || `${asset.unit_count} ${asset.unit_type}`}
                                </h5>
                              </div>
                              <div className="flex items-center space-x-2">
                                {eliteImpact && (
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs flex items-center space-x-1",
                                      riskColor === 'red' ? 'border-primary/50 text-primary' :
                                      riskColor === 'orange' ? 'border-primary/40 text-primary' :
                                      'border-primary/30 text-primary'
                                    )}
                                  >
                                    <span>{riskLevel}</span>
                                  </Badge>
                                )}
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {formatAssetType(asset.asset_data?.asset_type || asset.unit_type)}
                              </span>
                              {asset.total_value && (
                                <span className="font-medium text-foreground">
                                  ${asset.total_value.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick Impact Summary - Always Visible */}
                        {eliteImpact && (
                          <div className="mb-3 p-2 bg-muted/30 rounded">
                            <div className="flex items-center space-x-2 mb-1">
                              <AlertCircle className={`h-3 w-3 ${
                                riskColor === 'red' ? 'text-primary' :
                                riskColor === 'orange' ? 'text-primary' : 'text-primary'
                              }`} />
                              <span className="text-xs font-medium text-primary">Key Concern</span>
                              {eliteImpact.action_timeline && (
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs ml-auto",
                                    actionUrgency === 'urgent' ? 'border-primary/50 text-primary' :
                                    actionUrgency === 'moderate' ? 'border-primary/40 text-primary' :
                                    'border-primary/30 text-primary'
                                  )}
                                >
                                  {eliteImpact.action_timeline}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-foreground leading-relaxed">
                              {eliteImpact.key_concern}
                            </p>
                          </div>
                        )}
                        
                        {/* Expandable Detailed Section */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3 border-t border-border pt-3"
                          >
                            {/* Elite Pulse Details */}
                            {eliteImpact && (
                              <div className="space-y-2">
                                {eliteImpact.confidence_score && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Confidence Score</span>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-16 h-1 bg-muted rounded">
                                        <div 
                                          className="h-full bg-primary rounded"
                                          style={{ width: `${(eliteImpact.confidence_score * 100)}%` }}
                                        />
                                      </div>
                                      <span className="text-foreground font-medium">{Math.round(eliteImpact.confidence_score * 100)}%</span>
                                    </div>
                                  </div>
                                )}
                                
                                {eliteImpact.katherine_conviction && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">HC Conviction</span>
                                    <Badge variant="outline" className="text-xs">
                                      {eliteImpact.katherine_conviction}
                                    </Badge>
                                  </div>
                                )}
                                
                                {eliteImpact.ui_display?.action_needed && (
                                  <div className="p-2 bg-primary/5 rounded">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <CheckCircle2 className="h-3 w-3 text-primary" />
                                      <span className="text-xs font-medium text-primary">Recommended Action</span>
                                    </div>
                                    <p className="text-xs text-foreground pl-5">
                                      {eliteImpact.ui_display.action_needed}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            
                            {/* Whisper Intelligence */}
                            {eliteImpact?.whisper_intelligence && (
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <Crown className="h-3 w-3 text-primary" />
                                  <span className="text-xs font-medium text-primary">Key Finding</span>
                                </div>
                                <p className="text-xs text-foreground italic leading-relaxed">
                                  "{eliteImpact.whisper_intelligence}"
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}
                        
                        {/* Expand/Collapse Hint */}
                        <div className="mt-2 text-center">
                          <div className="text-xs text-muted-foreground flex items-center justify-center space-x-1">
                            <span>Click to {isExpanded ? 'collapse' : 'expand'} details</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                
                    {/* No high/medium impact assets found */}
                    {assets.length > 0 && assets.filter(asset => 
                      asset.elite_pulse_impact?.risk_level === 'HIGH' || 
                      asset.elite_pulse_impact?.risk_level === 'MEDIUM'
                    ).length === 0 && (
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 text-green-500/60 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Critical Impact Assets</h3>
                        <p className="text-muted-foreground mb-4">
                          Your portfolio currently shows no assets with high or medium risk impact levels.
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Elite Pulse analysis will appear here when risk factors are detected.
                        </div>
                      </div>
                    )}
            </div>
            
                    {/* Access Crown Vault Button */}
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Impact analysis for {assetsWithImpact.length} assets ({criticalAssets.length} critical)
                        </div>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate('crown-vault')}
                          className="hover:text-white"
                        >
                          <Crown className="h-3 w-3 mr-1" />
                          View All Assets
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                )
              })()}
          </div>
        )}

        {!hasAssets && !loading && (
          <div className="text-center py-12">
            <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Assets Found</h3>
            <p className="text-muted-foreground mb-6">
              Add assets to your Crown Vault to see portfolio impact analysis here.
            </p>
            <Button 
              variant="outline"
              onClick={() => onNavigate('crown-vault')}
              className="hover:text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Go to Crown Vault
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <CrownLoader message="Loading Asset Impact Analysis through Encrypted Route" />
          </div>
        )}
      </div>
    </motion.div>
  )
}