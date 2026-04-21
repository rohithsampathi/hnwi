"use client";

import {
  Brain,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Scale,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { CrownVaultAsset } from "@/lib/api";
import { AppreciationMetrics } from "./appreciation-metrics";
import { PriceHistoryTimeline } from "./price-history-timeline";
import { PriceRefreshButton } from "./price-refresh-button";
import { CitationText } from "@/components/elite/citation-text";
import {
  formatCompactMoney,
  formatMoney,
  formatPercent,
  getAssetActionPosture,
  getAssetActionRationale,
  getAssetCurrency,
  getAssetChangeAmount,
  getAssetChangePct,
  getAssetCurrentMarketSource,
  getAssetCurrentValue,
  getAssetEntryDatePrecision,
  getAssetImpact,
  getAssetLibraryAdvisories,
  getAssetMatchingBriefs,
  getAssetMarketContext,
  getAssetPatternIntelligenceRows,
  getAssetPatternTitles,
  getAssetPrecedentCount,
  getAssetPricingAuthority,
  getAssetRiskProfile,
  getAssetStatusLabel,
  getAssetTrendSummary,
} from "@/lib/crown-vault-intelligence";

interface AssetDetailsPanelProps {
  asset: CrownVaultAsset;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onAssetUpdated?: (updatedAsset: CrownVaultAsset) => void;
  className?: string;
  showToggle?: boolean;
}

const DetailMetric = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <Card className="border-border/60 bg-background/60">
    <CardContent className="p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </CardContent>
  </Card>
);

export function AssetDetailsPanel({
  asset,
  isExpanded,
  onToggleExpanded,
  onAssetUpdated,
  className = "",
  showToggle = true,
}: AssetDetailsPanelProps) {
  const hasAppreciation = !!asset.appreciation;
  const hasPriceHistory = !!asset.price_history && asset.price_history.length > 0;
  const impact = getAssetImpact(asset);
  const marketContext = getAssetMarketContext(asset);
  const currentValue = getAssetCurrentValue(asset);
  const displayCurrency = getAssetCurrency(asset);
  const changeAmount = getAssetChangeAmount(asset);
  const changePct = getAssetChangePct(asset);
  const posture = getAssetActionPosture(asset);
  const rationale = getAssetActionRationale(asset);
  const trendSummary = getAssetTrendSummary(asset);
  const riskProfile = getAssetRiskProfile(asset);
  const pricingAuthority = getAssetPricingAuthority(asset);
  const currentMarketSource = getAssetCurrentMarketSource(asset);
  const entryDatePrecision = getAssetEntryDatePrecision(asset);
  const patternTitles = getAssetPatternTitles(asset);
  const precedentCount = getAssetPrecedentCount(asset);
  const patternRows = getAssetPatternIntelligenceRows(asset);
  const matchingBriefs = getAssetMatchingBriefs(asset);
  const libraryAdvisories = getAssetLibraryAdvisories(asset);
  const analysis = String(
    impact.analysis ||
      impact.katherine_analysis ||
      impact.katherine_ai_analysis?.strategic_assessment ||
      "",
  ).trim();
  const evidencePreview = Array.isArray(marketContext.market_evidence_preview)
    ? marketContext.market_evidence_preview.slice(0, 3)
    : [];
  const marketNotes = String(
    marketContext.current_market_notes ||
      marketContext.market_key_insight ||
      "",
  ).trim();
  const marketPhase = String(marketContext.market_phase || "").trim().replace(/_/g, " ");
  const externalEvidenceStatus = String(
    marketContext.external_market_evidence_status || marketContext.status || "",
  ).trim();
  const impactTimestamp = impact.timestamp || impact.updated_at;

  const hasDetailsToShow =
    !!analysis ||
    !!posture ||
    !!trendSummary ||
    !!riskProfile ||
    precedentCount > 0 ||
    matchingBriefs.length > 0 ||
    patternRows.length > 0 ||
    libraryAdvisories.length > 0 ||
    evidencePreview.length > 0 ||
    hasAppreciation ||
    hasPriceHistory;

  if (!hasDetailsToShow) {
    return null;
  }

  const showDetails = showToggle ? isExpanded : true;

  return (
    <div className={className}>
      {showToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpanded}
          className="w-full justify-between rounded-xl border border-border/60 bg-background/50 px-4 py-2 text-xs font-semibold hover:bg-muted/40"
        >
          <span>{isExpanded ? "Hide Katherine detail" : "Open Katherine detail"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>
      )}

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-4">
              <Card className="border-border/60 bg-card/70 shadow-sm">
                <CardHeader className="gap-4 pb-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2.5">
                          <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Katherine Detail
                          </p>
                          <CardTitle className="text-lg">Decision Surface</CardTitle>
                        </div>
                      </div>
                      <p className="max-w-3xl text-sm text-muted-foreground">
                        Stored market evidence, library context, and Katherine posture attached to this asset.
                      </p>
                    </div>

                    <Badge variant="outline" className="w-fit">
                      {posture || getAssetStatusLabel(asset)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 text-sm">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <DetailMetric
                      label="Value Now"
                      value={formatMoney(currentValue, displayCurrency)}
                    />
                    <DetailMetric
                      label="Change Since Entry"
                      value={
                        typeof changeAmount === "number"
                          ? `${formatMoney(changeAmount, displayCurrency)} • ${formatPercent(changePct)}`
                          : "Not established"
                      }
                    />
                    <DetailMetric
                      label="Posture"
                      value={posture || getAssetStatusLabel(asset)}
                    />
                    <DetailMetric
                      label="Risk Profile"
                      value={riskProfile || "No stored risk profile yet"}
                    />
                  </div>

                  {(analysis || rationale || trendSummary) && (
                    <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Decision Read
                        </p>
                        <Badge variant="outline">{posture || "Unresolved"}</Badge>
                      </div>
                      {analysis && (
                        <p className="text-sm leading-6 text-foreground">
                          <CitationText text={analysis} />
                        </p>
                      )}
                      {trendSummary && (
                        <p className="mt-3 text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Trend:</span>{" "}
                          <CitationText text={trendSummary} />
                        </p>
                      )}
                      {rationale && (
                        <p className="mt-3 text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Why:</span>{" "}
                          <CitationText text={rationale} />
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Scale className="h-4 w-4 text-primary" />
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Market Evidence
                        </p>
                      </div>
                      <div className="space-y-2 text-sm">
                        {pricingAuthority && (
                          <p>
                            <span className="font-semibold text-foreground">Pricing authority:</span> {pricingAuthority}
                          </p>
                        )}
                        {currentMarketSource && (
                          <p>
                            <span className="font-semibold text-foreground">Current market source:</span> {currentMarketSource}
                          </p>
                        )}
                        {marketPhase && (
                          <p>
                            <span className="font-semibold text-foreground">Market phase:</span> {marketPhase}
                          </p>
                        )}
                        {externalEvidenceStatus && (
                          <p>
                            <span className="font-semibold text-foreground">Evidence status:</span> {externalEvidenceStatus}
                          </p>
                        )}
                        {marketNotes && (
                          <p className="text-muted-foreground">
                            <CitationText text={marketNotes} />
                          </p>
                        )}
                        {evidencePreview.length > 0 && (
                          <div className="space-y-2 pt-2">
                            {evidencePreview.map((row: any, index: number) => (
                              <div
                                key={`${row.title || row.url || "evidence"}-${index}`}
                                className="rounded-lg border border-border/60 bg-card/60 p-3"
                              >
                                <p className="text-sm font-medium text-foreground">{row.title || row.source || "Matched evidence"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {row.result_type || row.page_type || row.domain || "Market evidence"}
                                </p>
                                {row.url && (
                                  <a
                                    href={row.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                  >
                                    Open source
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Library Context
                        </p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-semibold text-foreground">Precedent count:</span>{" "}
                          {precedentCount > 0 ? precedentCount : "No corridor precedent attached yet"}
                        </p>
                        {entryDatePrecision && (
                          <p>
                            <span className="font-semibold text-foreground">Entry date precision:</span> {entryDatePrecision}
                          </p>
                        )}
                        {patternTitles.length > 0 && (
                          <div className="space-y-2 pt-2">
                            {patternTitles.map((title) => (
                              <div key={title} className="rounded-lg border border-border/60 bg-card/60 p-3 text-sm text-foreground">
                                {title}
                              </div>
                            ))}
                          </div>
                        )}
                        {libraryAdvisories.length > 0 && (
                          <div className="space-y-2 pt-2">
                            {libraryAdvisories.map((row) => (
                              <div key={`${row.label}-${row.value}`} className="rounded-lg border border-border/60 bg-card/60 p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                  {row.label}
                                </p>
                                <p className="mt-1 text-sm text-foreground">
                                  <CitationText text={row.value} />
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        {matchingBriefs.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Matching Briefs
                            </p>
                            {matchingBriefs.map((row, index) => (
                              <div
                                key={`${row.title || row.devid || "brief"}-${index}`}
                                className="rounded-lg border border-border/60 bg-card/60 p-3"
                              >
                                <p className="text-sm font-medium text-foreground">{row.title || "Relevant brief"}</p>
                                {(row.location || row.product) && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {[row.location, row.product].filter(Boolean).join(" • ")}
                                  </p>
                                )}
                                {row.summary && (
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    <CitationText text={String(row.summary)} />
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {patternRows.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Pattern Intelligence
                            </p>
                            {patternRows.map((row, index) => (
                              <div
                                key={`${row.title || row.devid || "pattern"}-${index}`}
                                className="rounded-lg border border-border/60 bg-card/60 p-3"
                              >
                                <p className="text-sm font-medium text-foreground">{row.title || "Pattern read"}</p>
                                {row.summary && (
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    <CitationText text={String(row.summary)} />
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {(impactTimestamp || entryDatePrecision) && (
                    <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                      {impactTimestamp ? `Last analysis ${new Date(impactTimestamp).toLocaleString()}` : ""}
                      {impactTimestamp && entryDatePrecision ? " • " : ""}
                      {entryDatePrecision ? `Entry date precision ${entryDatePrecision}` : ""}
                    </div>
                  )}
                </CardContent>
              </Card>

              {hasAppreciation && asset.appreciation && (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <Card className="border-border/60 bg-card/70">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">Performance Metrics</p>
                        <PriceRefreshButton
                          asset={asset}
                          onPriceUpdated={onAssetUpdated}
                          variant="outline"
                          size="sm"
                        />
                      </div>
                      <AppreciationMetrics
                        appreciation={asset.appreciation}
                        currency={displayCurrency}
                        entryPrice={asset.asset_data.entry_price}
                        currentPrice={asset.asset_data.cost_per_unit || asset.asset_data.current_price}
                      />
                    </CardContent>
                  </Card>

                  {hasPriceHistory && (
                    <PriceHistoryTimeline
                      priceHistory={asset.price_history!}
                      currency={displayCurrency}
                      entryPrice={asset.asset_data.entry_price}
                    />
                  )}
                </div>
              )}

              <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                Katherine 2.0 library-native read projected into Crown Vault.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
