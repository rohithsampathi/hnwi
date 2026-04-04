// components/elite/tabs/crown-vault-tab.tsx
// Crown Vault portfolio impact analysis tab

"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Activity, AlertCircle, CheckCircle2, ArrowRight, Loader2, Clock, ChevronDown, ChevronUp, TrendingDown, TrendingUp, Shield } from "lucide-react"
import { CrownLoader } from "@/components/ui/crown-loader"
import { CitationText } from "../citation-text"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context"
import { useAuthPopup } from "@/contexts/auth-popup-context"
import { getMetallicCardStyle } from "@/lib/colors"
import type { ProcessedIntelligenceData, User } from "@/types/dashboard"
import type { CrownVaultAsset } from "@/lib/api"

interface CrownVaultTabProps {
  data: ProcessedIntelligenceData
  onNavigate: (route: string) => void
  user: User
  onCitationClick?: (citationId: string) => void
  citations?: Array<{ id: string; number: number; originalText: string }>
  citationMap?: Map<string, number>
}

type RiskLevel = "HIGH" | "MEDIUM" | "LOW"

interface DisplayElitePulseImpact {
  risk_level: RiskLevel
  risk_badge_color?: string
  key_concern?: string
  action_timeline?: string
  portfolio_conviction?: string
  whisper_intelligence?: string
  confidence_score?: number
  ui_display?: {
    action_needed?: string
  }
}

interface DisplayAsset {
  id: string
  asset_id?: string
  unit_count?: number
  unit_type?: string
  tags?: string[]
  asset_data: {
    name: string
    asset_type: string
    value: number
    currency: string
    location?: string
    notes?: string
  }
  total_value: number
  elite_pulse_impact: DisplayElitePulseImpact | null
}

function normalizeRiskLevel(value: unknown): RiskLevel {
  if (typeof value !== "string") {
    return "LOW"
  }

  const upperValue = value.toUpperCase()
  if (upperValue === "HIGH" || upperValue === "MEDIUM") {
    return upperValue
  }

  return "LOW"
}

export function CrownVaultTab({ data, onNavigate, user, onCitationClick, citations = [], citationMap: citationMapProp }: CrownVaultTabProps) {
  const { theme } = useTheme()
  const { showAuthPopup } = useAuthPopup()
  const metallicStyle = getMetallicCardStyle(theme)

  // Create citation map from global citations
  const fallbackCitationMap = useMemo(() => {
    const map = new Map<string, number>()
    citations.forEach(citation => {
      map.set(citation.id, citation.number)
    })
    return map
  }, [citations])

  const citationMap = citationMapProp ?? fallbackCitationMap

  // Use intelligence data from the hook

  // Use real Crown Vault data from MongoDB first, analysis as fallback
  const realCrownVaultAssets = data.realCrownVaultAssets ?? []
  const realCrownVaultStats = data.realCrownVaultStats
  const crownVaultAnalysis = data.crownVaultAnalysis || {}
  const analysisImpactedAssets = (data.impactedAssets || []) as Array<Record<string, any>>

  // Prioritize real MongoDB data over analysis
  const impactedAssets = realCrownVaultAssets.length > 0 ? realCrownVaultAssets : analysisImpactedAssets
  const totalExposure = realCrownVaultStats?.total_value || data.totalExposure
  const crownVaultSummary = realCrownVaultStats?.last_updated ?
    `${realCrownVaultStats.total_assets} assets worth $${(realCrownVaultStats.total_value || 0).toLocaleString()}` :
    data.crownVaultSummary


  // Process assets data - use elite_pulse_impact from backend directly
  const assets: DisplayAsset[] = impactedAssets.map((asset, index) => {
    const rawAsset = asset as CrownVaultAsset & Record<string, any>
    const rawImpact = rawAsset.elite_pulse_impact as Record<string, any> | undefined
    const assetValue = rawAsset.total_value || rawAsset.current_value || rawAsset.value ||
                      (rawAsset.unit_count && rawAsset.cost_per_unit ? rawAsset.unit_count * rawAsset.cost_per_unit : 0)
    const normalizedRiskLevel = normalizeRiskLevel(rawImpact?.risk_level)

    return {
      id: rawAsset.id || rawAsset._id || rawAsset.asset_id || `asset-${index}`,
      asset_id: rawAsset.asset_id,
      unit_count: rawAsset.unit_count,
      unit_type: rawAsset.unit_type,
      tags: rawAsset.tags || [],
      // Real Crown Vault assets have asset_data structure
      asset_data: rawAsset.asset_data
        ? {
            name: rawAsset.asset_data.name,
            asset_type: rawAsset.asset_data.asset_type,
            value: rawAsset.asset_data.value,
            currency: rawAsset.asset_data.currency,
            location: rawAsset.asset_data.location,
            notes: rawAsset.asset_data.notes,
          }
        : {
            name: rawAsset.asset_name || rawAsset.name || rawAsset.decrypted_data?.name || `Asset ${index + 1}`,
            asset_type: rawAsset.asset_type || rawAsset.type || rawAsset.unit_type || 'Investment',
            value: assetValue,
            currency: rawAsset.currency || 'USD',
            location: rawAsset.location || rawAsset.decrypted_data?.location || '',
            notes: rawAsset.notes || rawAsset.decrypted_data?.notes || ''
          },
      total_value: assetValue,
      // Use elite_pulse_impact from backend if available
      elite_pulse_impact: rawImpact ? (() => {
        return {
          ...rawImpact,
          // Normalize risk_level to uppercase for consistency
          risk_level: normalizedRiskLevel,
          // Map backend fields to UI fields for consistency
          risk_badge_color: rawImpact.ui_display?.risk_badge_color ||
                           (normalizedRiskLevel === 'HIGH' ? 'red' :
                            normalizedRiskLevel === 'MEDIUM' ? 'orange' : 'green'),
          key_concern: rawImpact.analysis ||
                      rawImpact.ui_display?.concern_summary ||
                      rawImpact.asset_specific_threat ||
                      'Latest portfolio analysis',
          action_timeline: rawImpact.timeline || 'Review recommended',
          portfolio_conviction: 'High',
          whisper_intelligence: rawImpact.recommendation ||
                              rawImpact.recommended_action ||
                              'Monitor asset performance closely',
          confidence_score: rawImpact.confidence_score ||
                           rawImpact.confidence_level ||
                           (normalizedRiskLevel === 'HIGH' ? 0.85 :
                            normalizedRiskLevel === 'MEDIUM' ? 0.75 : 0.65),
          ui_display: rawImpact.ui_display || {
            badge_text: normalizedRiskLevel,
            concern_summary: rawImpact.analysis || rawImpact.asset_specific_threat || '',
            action_needed: rawImpact.recommendation || rawImpact.recommended_action || 'Monitor asset performance'
          }
        }
      })() : null // If no elite_pulse_impact from backend, set to null to filter out later
    }
  })

  const hasAssets = assets && assets.length > 0
  const loading = false // Analysis data is already loaded


  // Helper functions for asset cards
  
  const getRiskIcon = (riskLevel: string) => {
    switch(riskLevel) {
      case 'HIGH': return <TrendingDown className="h-3 w-3" />
      case 'MEDIUM': return <AlertCircle className="h-3 w-3" />
      case 'LOW': return <Shield className="h-3 w-3" />
      default: return <Activity className="h-3 w-3" />
    }
  }
  
  const getActionUrgency = (timeline?: string) => {
    if (timeline?.includes('30 days') || timeline?.includes('immediate')) return 'urgent'
    if (timeline?.includes('60 days') || timeline?.includes('near-term')) return 'moderate'
    return 'normal'
  }
  
  const formatAssetType = (assetType?: string) => {
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
              // Only count assets that have impact analysis from backend
              const assetsWithImpact = assets.filter((asset) =>
                asset.elite_pulse_impact !== null && asset.elite_pulse_impact !== undefined
              )
              const criticalAssets = assets.filter((asset) =>
                asset.elite_pulse_impact &&
                asset.elite_pulse_impact.risk_level === 'HIGH'
              )
              const riskPriority: Record<RiskLevel, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 }
              
              return (
                <>
                  <h4 className="font-semibold mb-4 flex items-center text-foreground text-left">
                    <Activity className="h-4 w-4 mr-2" />
                    Portfolio Impact Analysis
                    <Badge variant="outline" className="ml-2">
                      {criticalAssets.length} High Risk | {assetsWithImpact.length} Total Assets
                    </Badge>
                  </h4>

                  <div className="grid gap-4">
                    {assets
                      .filter((asset) =>
                        // Show ALL assets with impact analysis from backend
                        asset.elite_pulse_impact !== null && asset.elite_pulse_impact !== undefined
                      )
                .sort((a, b) => {
                  // Sort by risk level priority: HIGH > MEDIUM > LOW (handle case variations)
                  const aRisk = a.elite_pulse_impact ? riskPriority[a.elite_pulse_impact.risk_level] : 0
                  const bRisk = b.elite_pulse_impact ? riskPriority[b.elite_pulse_impact.risk_level] : 0
                  if (aRisk !== bRisk) return bRisk - aRisk;
                  
                  // Secondary sort by asset value for same risk level
                  const aValue = a.asset_data?.value || 0;
                  const bValue = b.asset_data?.value || 0;
                  return bValue - aValue;
                })
                .slice(0, 3)
                .map((asset, index: number) => {
                  const impactTags = asset.tags || []
                  const eliteImpact = asset.elite_pulse_impact
                  const riskLevel = eliteImpact?.risk_level || 'LOW'
                  const riskColor = eliteImpact?.risk_badge_color || 'green'
                  const assetId = asset.id || asset.asset_id || `asset-${index}`
                  const actionUrgency = getActionUrgency(eliteImpact?.action_timeline)
                  
                  return (
                    <motion.div
                      key={assetId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={cn(
                        metallicStyle.className,
                        "text-left border-l-4 relative transition-all duration-200 cursor-pointer",
                        // Hover effects
                        'hover:shadow-lg hover:scale-[1.02]'
                      )}
                      style={{
                        ...metallicStyle.style,
                        borderLeftColor: riskLevel === 'HIGH'
                          ? '#DC143C' // Ruby red
                          : riskLevel === 'MEDIUM'
                          ? '#FFB300' // Topaz amber
                          : '#10B981' // Emerald green
                      }}
                      onClick={() => {
                        // Navigate to Crown Vault page assets tab with asset ID as query param
                        onNavigate(`crown-vault?tab=assets&asset=${assetId}`)
                      }}
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
                                  <div
                                    className={cn(
                                      "px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1",
                                      "transition-all duration-300 hover:scale-105 hover:shadow-lg group",
                                      riskLevel === 'HIGH' && "ring-2 ring-red-500/30 animate-hnwi-emphasis"
                                    )}
                                    style={{
                                      background: riskLevel === 'HIGH'
                                        ? "linear-gradient(135deg, #DC143C 0%, #FF1744 25%, #B71C1C 50%, #FF1744 75%, #DC143C 100%)" // Metallic ruby
                                        : riskLevel === 'MEDIUM'
                                        ? "linear-gradient(135deg, #FFB300 0%, #FFC107 25%, #FF8F00 50%, #FFC107 75%, #FFB300 100%)" // Metallic topaz
                                        : "linear-gradient(135deg, #10B981 0%, #34D399 25%, #059669 50%, #34D399 75%, #10B981 100%)", // Metallic emerald
                                      border: riskLevel === 'HIGH'
                                        ? "2px solid rgba(220, 20, 60, 0.5)"
                                        : riskLevel === 'MEDIUM'
                                        ? "2px solid rgba(255, 193, 7, 0.5)"
                                        : "2px solid rgba(16, 185, 129, 0.5)",
                                      boxShadow: riskLevel === 'HIGH'
                                        ? "0 2px 8px rgba(220, 20, 60, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)"
                                        : riskLevel === 'MEDIUM'
                                        ? "0 2px 8px rgba(255, 193, 7, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)"
                                        : "0 2px 8px rgba(16, 185, 129, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)",
                                      color: "#ffffff",
                                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)"
                                    }}
                                  >
                                    {riskLevel === 'HIGH' ? (
                                      <AlertCircle className="h-3 w-3" />
                                    ) : riskLevel === 'MEDIUM' ? (
                                      <Clock className="h-3 w-3" />
                                    ) : (
                                      <Shield className="h-3 w-3" />
                                    )}
                                    <span className="text-[10px] font-extrabold tracking-wide">{riskLevel} RISK</span>
                                  </div>
                                )}
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
                        
                        
                        {/* Detailed Section - Always Visible */}
                        <div className="space-y-3 border-t border-border pt-3 mt-3">
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
                                
                                {eliteImpact.portfolio_conviction && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Portfolio Conviction</span>
                                    <Badge variant="outline" className="text-xs">
                                      {eliteImpact.portfolio_conviction}
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
                                      <CitationText
                                        text={eliteImpact.ui_display.action_needed}
                                        onCitationClick={onCitationClick}
                                        citationMap={citationMap}
                                      />
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                        
                      </div>
                    </motion.div>
                  )
                })}
                
                    {/* No high/medium impact assets found */}
                    {assets.length > 0 && assets.filter(asset =>
                      asset.elite_pulse_impact &&
                      (asset.elite_pulse_impact.risk_level === 'HIGH' ||
                       asset.elite_pulse_impact.risk_level === 'MEDIUM')
                    ).length === 0 && (
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 text-green-500/60 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Critical Impact Assets</h3>
                        <p className="text-muted-foreground mb-4">
                          Your portfolio analysis shows no assets with high or medium risk levels requiring immediate attention.
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Elite Pulse continuously monitors your portfolio for emerging risks.
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
                          onClick={() => onNavigate('crown-vault?tab=assets')}
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
            <CrownLoader text="Loading Asset Impact Analysis through Encrypted Route" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
