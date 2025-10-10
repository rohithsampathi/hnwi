"use client";

import { AlertCircle, Shield, Brain, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { CrownVaultAsset } from "@/lib/api";
import { AppreciationMetrics } from "./appreciation-metrics";
import { PriceHistoryTimeline } from "./price-history-timeline";
import { PriceRefreshButton } from "./price-refresh-button";
import { CitationText } from "@/components/elite/citation-text";

interface AssetDetailsPanelProps {
  asset: CrownVaultAsset;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onAssetUpdated?: (updatedAsset: CrownVaultAsset) => void;
  className?: string;
}

export function AssetDetailsPanel({
  asset,
  isExpanded,
  onToggleExpanded,
  onAssetUpdated,
  className = ""
}: AssetDetailsPanelProps) {
  const hasAppreciation = !!asset.appreciation;
  const hasPriceHistory = !!asset.price_history && asset.price_history.length > 0;
  const hasElitePulseImpact = !!asset.elite_pulse_impact;

  // Show details panel if any data is available
  const hasDetailsToShow = hasAppreciation || hasPriceHistory || hasElitePulseImpact;

  if (!hasDetailsToShow) {
    return null;
  }

  return (
    <div className={className}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between hover:bg-primary/10"
      >
        <span className="text-xs font-medium">
          {isExpanded ? 'Hide Details' : 'View Performance & Analysis'}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </Button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {/* Elite Pulse Impact Alert */}
              {hasElitePulseImpact && asset.elite_pulse_impact && (
                <Alert
                  variant={
                    asset.elite_pulse_impact.risk_level === 'HIGH'
                      ? 'destructive'
                      : 'default'
                  }
                  className={
                    asset.elite_pulse_impact.risk_level === 'MEDIUM'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                      : asset.elite_pulse_impact.risk_level === 'LOW'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : ''
                  }
                >
                  <div className="flex items-start space-x-2">
                    {asset.elite_pulse_impact.risk_level === 'HIGH' ? (
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                    ) : asset.elite_pulse_impact.risk_level === 'MEDIUM' ? (
                      <AlertCircle className="h-4 w-4 mt-0.5 text-orange-600" />
                    ) : (
                      <Shield className="h-4 w-4 mt-0.5 text-green-600" />
                    )}
                    <div className="flex-1 space-y-2">
                      <AlertTitle className="flex items-center justify-between">
                        <span>Elite Pulse Market Impact</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            asset.elite_pulse_impact.risk_level === 'HIGH'
                              ? 'border-red-500 text-red-700 bg-red-50 dark:text-red-400'
                              : asset.elite_pulse_impact.risk_level === 'MEDIUM'
                              ? 'border-orange-500 text-orange-700 bg-orange-50 dark:text-orange-400'
                              : 'border-green-500 text-green-700 bg-green-50 dark:text-green-400'
                          }`}
                        >
                          {asset.elite_pulse_impact.risk_level} RISK
                        </Badge>
                      </AlertTitle>
                      <AlertDescription className="text-sm space-y-2">
                        {asset.elite_pulse_impact.summary && (
                          <p>
                            <CitationText text={asset.elite_pulse_impact.summary} />
                          </p>
                        )}
                        {asset.elite_pulse_impact.ui_display?.concern_summary && (
                          <p>
                            <CitationText
                              text={asset.elite_pulse_impact.ui_display.concern_summary}
                            />
                          </p>
                        )}
                        {asset.elite_pulse_impact.ui_display?.recommendation && (
                          <div className="mt-2 p-2 bg-background/50 rounded">
                            <p className="text-xs font-semibold mb-1">
                              Recommended Action:
                            </p>
                            <p className="text-xs">
                              <CitationText
                                text={asset.elite_pulse_impact.ui_display.recommendation}
                              />
                            </p>
                          </div>
                        )}
                        {asset.elite_pulse_impact.timestamp && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Analysis: {new Date(asset.elite_pulse_impact.timestamp).toLocaleDateString()}
                          </p>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}

              {/* Appreciation Metrics & Price Refresh */}
              {hasAppreciation && asset.appreciation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold">Performance Metrics</h4>
                      <PriceRefreshButton
                        asset={asset}
                        onPriceUpdated={onAssetUpdated}
                        variant="outline"
                        size="sm"
                      />
                    </div>
                    <AppreciationMetrics
                      appreciation={asset.appreciation}
                      currency={asset.asset_data.currency}
                      entryPrice={asset.asset_data.entry_price}
                      currentPrice={asset.asset_data.cost_per_unit || asset.asset_data.current_price}
                    />
                  </div>

                  {/* Price History Timeline */}
                  {hasPriceHistory && (
                    <PriceHistoryTimeline
                      priceHistory={asset.price_history!}
                      currency={asset.asset_data.currency}
                      entryPrice={asset.asset_data.entry_price}
                    />
                  )}
                </div>
              )}

              {/* Katherine AI Attribution */}
              <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground italic border-t pt-3">
                <Brain className="h-3 w-3" />
                <span>Analysis powered by Katherine Sterling-Chen AI • Elite Pulse Intelligence</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
