"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  Brain,
  Crown,
  DollarSign,
  Shield,
  TrendingUp,
  Users,
  Vault,
} from "lucide-react";
import { SecurePieChart } from "@/components/ui/secure-pie-chart";
import { CrownVaultAsset, CrownVaultStats } from "@/lib/api";
import { processAssetCategories } from "@/lib/category-utils";
import { LUXURY_COLOR_PALETTE } from "@/lib/chart-colors";
import {
  buildCurrencyTotals,
  countActionPostures,
  countAssetsByState,
  formatAssetCollectionValue,
  formatCompactMoney,
  formatPercent,
  getAssetActionPosture,
  getAssetChangePct,
  getAssetCurrency,
  getAssetCurrentValue,
  getAssetDisplayType,
  getAssetEntryValue,
  getAssetPatternTitles,
  getAssetPrecedentCount,
  getAssetStatusLabel,
  hasMixedAssetCurrencies,
  latestAnalysisTimestamp,
  sortAssetsByChange,
  sumCurrentValue,
  sumEntryValue,
} from "@/lib/crown-vault-intelligence";

interface SummarySectionProps {
  stats: CrownVaultStats | null;
  assets: CrownVaultAsset[];
  onAddAssets: () => void;
  onNavigateToTab: (tab: string) => void;
}

const SummaryMetricCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  tone = "default",
}: {
  title: string;
  value: string;
  subtext: string;
  icon: any;
  tone?: "default" | "good" | "warn";
}) => {
  const toneClasses =
    tone === "good"
      ? "border-emerald-200/70 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20"
      : tone === "warn"
        ? "border-amber-200/70 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20"
        : "border-border/60 bg-card/70";

  return (
    <Card className={toneClasses}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{subtext}</p>
          </div>
          <div className="rounded-full bg-background/70 p-3 shadow-sm">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AssetSignalRow = ({
  asset,
  showChange = true,
}: {
  asset: CrownVaultAsset;
  showChange?: boolean;
}) => {
  const currentValue = getAssetCurrentValue(asset);
  const posture = getAssetActionPosture(asset) || getAssetStatusLabel(asset);
  const patternTitle = getAssetPatternTitles(asset)[0];
  const currentCurrency = getAssetCurrency(asset);
  const changePct = getAssetChangePct(asset);

  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{asset.asset_data.name}</p>
          <p className="text-xs text-muted-foreground">
            {getAssetDisplayType(asset)}
            {asset.asset_data.location ? ` • ${asset.asset_data.location}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-foreground">{formatCompactMoney(currentValue, currentCurrency)}</p>
          <p className="text-xs text-muted-foreground">{posture}</p>
        </div>
      </div>
      {patternTitle && (
        <p className="mt-3 text-xs text-muted-foreground">
          Library pattern: <span className="text-foreground">{patternTitle}</span>
        </p>
      )}
      {showChange && (
        <p className="mt-2 text-xs text-muted-foreground">
          {typeof changePct === "number" ? `${formatPercent(changePct)} • ${getAssetStatusLabel(asset)}` : getAssetStatusLabel(asset)}
        </p>
      )}
    </div>
  );
};

export function SummarySection({ stats, assets, onAddAssets, onNavigateToTab }: SummarySectionProps) {
  const currentCurrencyTotals = buildCurrencyTotals(assets, getAssetCurrentValue);
  const hasMixedCurrencies = hasMixedAssetCurrencies(assets, getAssetCurrentValue);
  const assetCategories = processAssetCategories(
    assets,
    hasMixedCurrencies ? { mode: "count" } : { valueResolver: getAssetCurrentValue },
  );
  const totalCurrentValue = sumCurrentValue(assets);
  const totalEntryValue = sumEntryValue(assets);
  const totalChangeAmount = totalEntryValue > 0 ? totalCurrentValue - totalEntryValue : null;
  const totalChangePct =
    totalEntryValue > 0 && totalChangeAmount != null ? (totalChangeAmount / totalEntryValue) * 100 : null;
  const stateCounts = countAssetsByState(assets);
  const postureCounts = countActionPostures(assets);
  const latestSync = latestAnalysisTimestamp(assets);
  const assetsWithHeirs = assets.filter((asset) => (asset.heir_names || []).length > 0).length;
  const unassignedAssets = Math.max(assets.length - assetsWithHeirs, 0);
  const libraryBackedAssets = assets.filter((asset) => getAssetPrecedentCount(asset) > 0).length;
  const topWinners = sortAssetsByChange(assets).filter((asset) => getAssetStatusLabel(asset) === "Doing well").slice(0, 3);
  const watchlistAssets = assets
    .filter((asset) => {
      const label = getAssetStatusLabel(asset);
      return label === "Needs attention" || label === "Still resolving";
    })
    .slice(0, 3);

  const recentActivity = stats?.recent_activity || [];
  const currentValueLabel = formatAssetCollectionValue(assets, getAssetCurrentValue);
  const entryValueLabel = formatAssetCollectionValue(assets, getAssetEntryValue);
  const changeValueLabel = formatAssetCollectionValue(
    assets.filter((asset) => getAssetCurrentValue(asset) != null && getAssetEntryValue(asset) != null),
    (asset) => {
      const currentValue = getAssetCurrentValue(asset);
      const entryValue = getAssetEntryValue(asset);
      if (currentValue == null || entryValue == null) {
        return null;
      }
      return currentValue - entryValue;
    },
  );
  const currencyCount = Object.keys(currentCurrencyTotals).length;

  return (
    <div className="space-y-8">
      <Card className="border-border/60 bg-card/70 shadow-sm">
        <CardHeader className="gap-6 pb-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Vault Summary</p>
                  <CardTitle className="text-2xl sm:text-3xl">Crown Vault Overview</CardTitle>
                </div>
              </div>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Stored Katherine state across current value, movement since entry, action posture, heir coverage,
                and attached library context.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/80 p-4 xl:max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Latest Katherine sync</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {latestSync ? new Date(latestSync).toLocaleString() : "Not yet established"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {libraryBackedAssets} of {assets.length} assets already carry corridor or precedent intelligence.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SummaryMetricCard
              title="Current Portfolio Value"
              value={currentValueLabel}
              subtext={
                hasMixedCurrencies
                  ? `${assets.length} assets across ${currencyCount} currencies`
                  : `${assets.length} assets under Katherine tracking`
              }
              icon={DollarSign}
            />
            <SummaryMetricCard
              title="Since Entry"
              value={
                hasMixedCurrencies
                  ? changeValueLabel
                  : totalChangeAmount == null
                    ? "Not established"
                    : `${formatCompactMoney(totalChangeAmount)} • ${formatPercent(totalChangePct)}`
              }
              subtext={
                hasMixedCurrencies
                  ? entryValueLabel === "Not established"
                    ? "Entry basis still incomplete on some assets"
                    : `Entry basis ${entryValueLabel} • Mixed currencies shown separately`
                  : totalEntryValue > 0
                    ? `Entry basis ${formatCompactMoney(totalEntryValue)}`
                    : "Entry basis still incomplete on some assets"
              }
              icon={TrendingUp}
              tone={
                hasMixedCurrencies
                  ? "default"
                  : totalChangeAmount != null && totalChangeAmount >= 0
                    ? "good"
                    : "warn"
              }
            />
            <SummaryMetricCard
              title="Doing Well"
              value={String(stateCounts.winning)}
              subtext={`${postureCounts.buyMore} assets currently read as buy more`}
              icon={Shield}
              tone="good"
            />
            <SummaryMetricCard
              title="Needs Attention"
              value={String(stateCounts.under_pressure)}
              subtext={`${postureCounts.sell} assets currently read as sell or under pressure`}
              icon={AlertTriangle}
              tone="warn"
            />
            <SummaryMetricCard
              title="Heir Coverage"
              value={`${assetsWithHeirs}/${assets.length}`}
              subtext={unassignedAssets === 0 ? "Every asset is assigned to an heir" : `${unassignedAssets} assets still need heir assignment`}
              icon={Users}
            />
            <SummaryMetricCard
              title="Library-Backed Assets"
              value={String(libraryBackedAssets)}
              subtext={`${stateCounts.unresolved} assets still need stronger corridor proof`}
              icon={Brain}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/60 bg-background/75">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">What Is Working</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topWinners.length > 0 ? (
                  topWinners.map((asset) => <AssetSignalRow key={asset.asset_id} asset={asset} />)
                ) : (
                  <p className="text-sm text-muted-foreground">No clear outperformers have been established yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-background/75">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">What Needs Attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {watchlistAssets.length > 0 ? (
                  watchlistAssets.map((asset) => <AssetSignalRow key={asset.asset_id} asset={asset} />)
                ) : (
                  <p className="text-sm text-muted-foreground">No stressed assets are surfacing right now.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {assets.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Allocation and Exposure</h2>
            <p className="text-sm text-muted-foreground">
              {hasMixedCurrencies
                ? "Current vault composition across asset categories by asset count. Mixed currencies are shown separately above so the UI does not fabricate a single false total."
                : "Current vault composition across asset categories. This uses the current value rail, not the older static upload-only view."}
            </p>
          </div>
          <div className="grid items-center gap-8 xl:grid-cols-2">
            <SecurePieChart
              data={assetCategories}
              totalValue={hasMixedCurrencies ? assets.length : totalCurrentValue}
              centerLabel={hasMixedCurrencies ? "Asset Mix" : "Crown Vault"}
              centerValueLabel={hasMixedCurrencies ? `${assets.length} assets` : undefined}
              valueFormatter={hasMixedCurrencies ? (value) => `${value} ${value === 1 ? "asset" : "assets"}` : undefined}
              colors={LUXURY_COLOR_PALETTE}
              height={460}
              className="w-full"
            />
            <Card className="border-border/60 bg-card/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Current Read</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Hold</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{postureCounts.hold}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Buy More</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{postureCounts.buyMore}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Sell</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{postureCounts.sell}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Unresolved</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{postureCounts.unresolved}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">State</p>
                  <p className="mt-2 leading-6 text-muted-foreground">
                    Counts above reflect the stored Katherine posture and unresolved-state rails. Open an asset to see
                    only the stored market evidence, library context, and rationale attached to that row.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={onAddAssets}>
              <Vault className="mr-2 h-4 w-4" />
              Add new assets
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigateToTab("assets")}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Review asset-level Katherine reads
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigateToTab("heirs")}>
              <Users className="mr-2 h-4 w-4" />
              Review heir exposure
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 3).map((activity, index) => (
                <button
                  key={`${activity.timestamp}-${index}`}
                  className="flex w-full items-start gap-3 rounded-xl border border-border/60 bg-card/60 p-4 text-left transition-colors hover:bg-muted/40"
                  onClick={() => onNavigateToTab("activity")}
                >
                  <Activity className="mt-0.5 h-4 w-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent Crown Vault activity yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
