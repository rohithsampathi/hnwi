import type { CrownVaultAsset } from "@/lib/api";

type GenericRecord = Record<string, any>;

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const getAssetImpact = (asset: CrownVaultAsset): GenericRecord =>
  (asset.elite_pulse_impact as GenericRecord) || {};

export const getAssetUsdConversion = (asset: CrownVaultAsset): GenericRecord =>
  (getAssetImpact(asset).usd_conversion as GenericRecord) || {};

export const getAssetNativeCurrency = (asset: CrownVaultAsset): string =>
  String(
    getAssetImpact(asset).value_currency ||
      getAssetImpact(asset).market_context?.base_currency ||
      asset.asset_data?.currency ||
      "USD",
  )
    .trim()
    .toUpperCase() || "USD";

export const getAssetCurrency = (asset: CrownVaultAsset): string => {
  const usdConversion = getAssetUsdConversion(asset);
  if (toNumber(usdConversion.current_total_value_usd) != null || toNumber(usdConversion.entry_total_value_usd) != null) {
    return "USD";
  }
  return getAssetNativeCurrency(asset);
};

export const getAssetMarketContext = (asset: CrownVaultAsset): GenericRecord =>
  (getAssetImpact(asset).market_context as GenericRecord) || {};

export const getAssetLibraryContext = (asset: CrownVaultAsset): GenericRecord =>
  (getAssetImpact(asset).library_context as GenericRecord) || {};

export const getAssetCurrentValue = (asset: CrownVaultAsset): number | null => {
  const impact = getAssetImpact(asset);
  const usdConversion = getAssetUsdConversion(asset);
  const usdCurrentValue = toNumber(usdConversion.current_total_value_usd);
  if (usdCurrentValue != null) {
    return usdCurrentValue;
  }
  if (getAssetCurrency(asset) === "USD" && getAssetNativeCurrency(asset) !== "USD") {
    return null;
  }
  return (
    toNumber(impact.current_value_now) ??
    toNumber((asset as GenericRecord).current_total_value) ??
    toNumber(asset.asset_data?.value) ??
    null
  );
};

const COLLECTOR_FALLBACK_ONLY_TYPES = new Set([
  "luxury watch",
  "collection",
  "auction lot",
  "jewellery",
  "jewelry",
]);

const isCollectorFallbackOnlyRead = (asset: CrownVaultAsset): boolean => {
  const impact = getAssetImpact(asset);
  const marketContext = getAssetMarketContext(asset);
  const displayType = getAssetDisplayType(asset).toLowerCase();
  const action = String(impact.action_posture || "").trim().toLowerCase();
  const externalStatus = String(
    marketContext.external_market_evidence_status || marketContext.status || "",
  )
    .trim()
    .toLowerCase();
  const currentMarketSource = String(
    impact.current_market_source || marketContext.current_market_source || "",
  )
    .trim()
    .toLowerCase();
  const pricingAuthority = String(
    impact.pricing_authority || marketContext.pricing_authority || "",
  )
    .trim()
    .toLowerCase();

  if (!COLLECTOR_FALLBACK_ONLY_TYPES.has(displayType)) {
    return false;
  }
  if (action === "buy more" || action === "sell") {
    return false;
  }
  if (externalStatus === "matched_web_evidence" || externalStatus === "internal_plus_matched_web") {
    return false;
  }
  return currentMarketSource.startsWith("vault_") || pricingAuthority.startsWith("vault_");
};

export const getAssetEntryValue = (asset: CrownVaultAsset): number | null => {
  const usdConversion = getAssetUsdConversion(asset);
  const usdEntryValue = toNumber(usdConversion.entry_total_value_usd);
  if (usdEntryValue != null) {
    return usdEntryValue;
  }
  if (getAssetCurrency(asset) === "USD" && getAssetNativeCurrency(asset) !== "USD") {
    return null;
  }
  const topLevel = asset as GenericRecord;
  const unitCount =
    toNumber(asset.asset_data?.unit_count) ??
    toNumber(topLevel.unit_count) ??
    1;
  const entryUnitPrice =
    toNumber(topLevel.entry_price) ??
    toNumber(asset.asset_data?.entry_price) ??
    null;

  if (entryUnitPrice != null) {
    return entryUnitPrice * unitCount;
  }

  return toNumber(topLevel.entry_total_value);
};

export const getAssetChangeAmount = (asset: CrownVaultAsset): number | null => {
  if (isCollectorFallbackOnlyRead(asset)) {
    return null;
  }
  const currentValue = getAssetCurrentValue(asset);
  const entryValue = getAssetEntryValue(asset);
  if (currentValue == null || entryValue == null) {
    return toNumber(getAssetImpact(asset).value_change_amount);
  }
  return currentValue - entryValue;
};

export const getAssetChangePct = (asset: CrownVaultAsset): number | null => {
  if (isCollectorFallbackOnlyRead(asset)) {
    return null;
  }
  const currentValue = getAssetCurrentValue(asset);
  const entryValue = getAssetEntryValue(asset);
  if (currentValue == null || entryValue == null || entryValue === 0) {
    return toNumber(getAssetImpact(asset).value_change_pct);
  }
  return ((currentValue - entryValue) / entryValue) * 100;
};

export const getAssetActionPosture = (asset: CrownVaultAsset): string => {
  if (isCollectorFallbackOnlyRead(asset)) {
    return "unresolved";
  }
  return String(getAssetImpact(asset).action_posture || "").trim();
};

export const getAssetActionRationale = (asset: CrownVaultAsset): string => {
  if (isCollectorFallbackOnlyRead(asset)) {
    return "Current mark is still an internal vault anchor. Katherine has not yet validated an external market read for this collectible asset.";
  }
  return String(getAssetImpact(asset).action_rationale || "").trim();
};

export const getAssetTrendSummary = (asset: CrownVaultAsset): string =>
  String(getAssetImpact(asset).trend_summary || "").trim();

export const getAssetRiskProfile = (asset: CrownVaultAsset): string =>
  String(getAssetImpact(asset).risk_profile || "").trim();

const humanizeAssetLabel = (value: string): string =>
  value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export const getAssetDisplayType = (asset: CrownVaultAsset): string => {
  const impact = getAssetImpact(asset);
  const marketContext = getAssetMarketContext(asset);
  const rawText = [
    String(asset.asset_data?.name || ""),
    String(asset.asset_data?.notes || ""),
    String(asset.asset_data?.asset_type || ""),
    String(asset.asset_data?.unit_type || ""),
    String((impact as GenericRecord).asset_type_label || ""),
    String((impact as GenericRecord).property_type || ""),
    String((marketContext as GenericRecord).property_type || ""),
  ]
    .join(" ")
    .toLowerCase();

  if (rawText.includes("hostel")) {
    return "Income Property";
  }
  if (rawText.includes("aquaculture")) {
    return "Aquaculture Land";
  }
  if (rawText.includes("agricultural") || rawText.includes("farmland")) {
    return "Agricultural Land";
  }
  if (rawText.includes("living space") || rawText.includes("plot") || rawText.includes("sqyd")) {
    return "Land Plot";
  }
  if (rawText.includes("apartment") || rawText.includes("flat") || rawText.includes("3bhk")) {
    return "Apartment";
  }
  if (rawText.includes("house") || rawText.includes("residence")) {
    return "House";
  }
  if (rawText.includes("watch")) {
    return "Luxury Watch";
  }
  if (rawText.includes("gold") || rawText.includes("silver") || rawText.includes("bullion")) {
    return "Bullion";
  }
  if (rawText.includes("jewellery") || rawText.includes("jewelry") || rawText.includes("diamond")) {
    return "Jewellery";
  }
  if (rawText.includes("harrier") || rawText.includes("vehicle") || rawText.includes("car")) {
    return "Vehicle";
  }

  const candidates = [
    String((impact as GenericRecord).asset_type_label || "").trim(),
    String((impact as GenericRecord).property_type || "").trim(),
    String((impact as GenericRecord).asset_category || "").trim(),
    String((marketContext as GenericRecord).property_type || "").trim(),
    String(asset.asset_data?.asset_type || "").trim(),
    String(asset.asset_data?.unit_type || "").trim(),
  ].filter(Boolean);

  const firstSpecific = candidates.find((candidate) => {
    const normalized = candidate.toLowerCase();
    return !["property", "real estate", "asset", "alternative asset"].includes(normalized);
  });

  return humanizeAssetLabel(firstSpecific || candidates[0] || "Asset");
};

export const getAssetPricingAuthority = (asset: CrownVaultAsset): string => {
  const impact = getAssetImpact(asset);
  const marketContext = getAssetMarketContext(asset);
  return String(impact.pricing_authority || marketContext.pricing_authority || "").trim();
};

export const getAssetCurrentMarketSource = (asset: CrownVaultAsset): string => {
  const impact = getAssetImpact(asset);
  const marketContext = getAssetMarketContext(asset);
  return String(impact.current_market_source || marketContext.current_market_source || "").trim();
};

export const getAssetEntryDatePrecision = (asset: CrownVaultAsset): string =>
  String(asset.asset_data?.entry_date_precision || (asset as GenericRecord).entry_date_precision || "").trim();

export const getAssetPrecedentCount = (asset: CrownVaultAsset): number =>
  Number(getAssetLibraryContext(asset).precedent_count || 0);

export const getAssetPatternTitles = (asset: CrownVaultAsset): string[] => {
  const libraryContext = getAssetLibraryContext(asset);
  const rows = [
    ...(Array.isArray(libraryContext.pattern_intelligence) ? libraryContext.pattern_intelligence : []),
    ...(Array.isArray(libraryContext.matching_briefs) ? libraryContext.matching_briefs : []),
  ];
  const seen = new Set<string>();
  return rows
    .map((row) => String(row?.title || "").trim())
    .filter((title) => {
      if (!title) {
        return false;
      }
      const key = title.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 3);
};

const compactLibraryRows = (rows: unknown): GenericRecord[] =>
  Array.isArray(rows)
    ? rows
        .filter((row): row is GenericRecord => !!row && typeof row === "object")
        .slice(0, 5)
    : [];

export const getAssetMatchingBriefs = (asset: CrownVaultAsset): GenericRecord[] =>
  compactLibraryRows(getAssetLibraryContext(asset).matching_briefs);

export const getAssetPatternIntelligenceRows = (asset: CrownVaultAsset): GenericRecord[] =>
  compactLibraryRows(getAssetLibraryContext(asset).pattern_intelligence);

export const getAssetLibraryAdvisories = (asset: CrownVaultAsset): Array<{ label: string; value: string }> => {
  const libraryContext = getAssetLibraryContext(asset);
  const advisoryKeys: Array<[string, string]> = [
    ["jurisdiction_notes", "Jurisdiction"],
    ["legal_notes", "Legal"],
    ["tax_notes", "Tax"],
    ["structuring_notes", "Structuring"],
    ["governance_notes", "Governance"],
    ["heir_notes", "Heir"],
    ["corridor_notes", "Corridor"],
  ];

  return advisoryKeys
    .map(([key, label]) => {
      const value = String(libraryContext[key] || "").trim();
      return value ? { label, value } : null;
    })
    .filter((row): row is { label: string; value: string } => row !== null);
};

export const getAssetSignalState = (
  asset: CrownVaultAsset,
): "winning" | "under_pressure" | "stable" | "unresolved" => {
  if (isCollectorFallbackOnlyRead(asset)) {
    return "unresolved";
  }
  const posture = getAssetActionPosture(asset).toLowerCase();
  const changePct = getAssetChangePct(asset);
  if (!posture && changePct == null) {
    return "unresolved";
  }
  if (posture.includes("sell")) {
    return "under_pressure";
  }
  if (posture.includes("buy")) {
    return "winning";
  }
  if (changePct != null) {
    if (changePct > 0) {
      return "winning";
    }
    if (changePct < 0) {
      return "under_pressure";
    }
  }
  return "stable";
};

export const getAssetStatusLabel = (asset: CrownVaultAsset): string => {
  switch (getAssetSignalState(asset)) {
    case "winning":
      return "Doing well";
    case "under_pressure":
      return "Needs attention";
    case "stable":
      return "Stable";
    default:
      return "Still resolving";
  }
};

export const formatMoney = (value: number | null | undefined, currency = "USD"): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Not established";
  }
  const normalizedCurrency = currency.toUpperCase();
  const locale = normalizedCurrency === "INR" ? "en-IN" : undefined;
  const symbol =
    normalizedCurrency === "INR"
      ? "₹"
      : normalizedCurrency === "AED"
        ? "AED "
        : normalizedCurrency === "EUR"
          ? "€"
          : normalizedCurrency === "GBP"
            ? "£"
            : "$";

  return `${symbol}${value.toLocaleString(locale, { maximumFractionDigits: 2 })}`;
};

export const formatCompactMoney = (value: number | null | undefined, currency = "USD"): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Not established";
  }
  const normalizedCurrency = currency.toUpperCase();
  const symbol =
    normalizedCurrency === "INR"
      ? "₹"
      : normalizedCurrency === "AED"
        ? "AED "
        : normalizedCurrency === "EUR"
          ? "€"
          : normalizedCurrency === "GBP"
            ? "£"
            : "$";

  const absolute = Math.abs(value);
  if (normalizedCurrency === "INR") {
    if (absolute >= 10_000_000) {
      return `${symbol}${(value / 10_000_000).toFixed(2)}Cr`;
    }
    if (absolute >= 100_000) {
      return `${symbol}${(value / 100_000).toFixed(2)}L`;
    }
  }
  if (absolute >= 1_000_000_000) {
    return `${symbol}${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (absolute >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(2)}M`;
  }
  if (absolute >= 1_000) {
    return `${symbol}${(value / 1_000).toFixed(1)}K`;
  }
  return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

export const formatPercent = (value: number | null | undefined): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Not established";
  }
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
};

export type CurrencyTotals = Record<string, number>;

const currencySortWeight = (currency: string): number => {
  switch (currency.toUpperCase()) {
    case "INR":
      return 0;
    case "USD":
      return 1;
    case "AED":
      return 2;
    case "EUR":
      return 3;
    case "GBP":
      return 4;
    default:
      return 10;
  }
};

const sortCurrencyEntries = (totals: CurrencyTotals): Array<[string, number]> =>
  Object.entries(totals).sort(([leftCurrency, leftTotal], [rightCurrency, rightTotal]) => {
    const weightDiff = currencySortWeight(leftCurrency) - currencySortWeight(rightCurrency);
    if (weightDiff !== 0) {
      return weightDiff;
    }
    return Math.abs(rightTotal) - Math.abs(leftTotal);
  });

export const buildCurrencyTotals = (
  assets: CrownVaultAsset[],
  valueSelector: (asset: CrownVaultAsset) => number | null = getAssetCurrentValue,
): CurrencyTotals =>
  assets.reduce<CurrencyTotals>((totals, asset) => {
    const value = valueSelector(asset);
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return totals;
    }
    const currency = getAssetCurrency(asset);
    totals[currency] = (totals[currency] || 0) + value;
    return totals;
  }, {});

export const getDistinctAssetCurrencies = (
  assets: CrownVaultAsset[],
  valueSelector: (asset: CrownVaultAsset) => number | null = getAssetCurrentValue,
): string[] => sortCurrencyEntries(buildCurrencyTotals(assets, valueSelector)).map(([currency]) => currency);

export const hasMixedAssetCurrencies = (
  assets: CrownVaultAsset[],
  valueSelector: (asset: CrownVaultAsset) => number | null = getAssetCurrentValue,
): boolean => getDistinctAssetCurrencies(assets, valueSelector).length > 1;

export const formatCurrencyTotals = (totals: CurrencyTotals): string => {
  const entries = sortCurrencyEntries(totals);
  if (!entries.length) {
    return "Not established";
  }
  return entries.map(([currency, total]) => formatCompactMoney(total, currency)).join(" + ");
};

export const formatAssetCollectionValue = (
  assets: CrownVaultAsset[],
  valueSelector: (asset: CrownVaultAsset) => number | null = getAssetCurrentValue,
): string => formatCurrencyTotals(buildCurrencyTotals(assets, valueSelector));

export const latestAnalysisTimestamp = (assets: CrownVaultAsset[]): string | null => {
  const timestamps = assets
    .map((asset) => String(getAssetImpact(asset).timestamp || getAssetImpact(asset).updated_at || "").trim())
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  if (!timestamps.length) {
    return null;
  }
  return new Date(Math.max(...timestamps)).toISOString();
};

export const sumCurrentValue = (assets: CrownVaultAsset[]): number =>
  assets.reduce((sum, asset) => sum + (getAssetCurrentValue(asset) || 0), 0);

export const sumEntryValue = (assets: CrownVaultAsset[]): number =>
  assets.reduce((sum, asset) => sum + (getAssetEntryValue(asset) || 0), 0);

export const countAssetsByState = (assets: CrownVaultAsset[]) => {
  return assets.reduce(
    (acc, asset) => {
      const state = getAssetSignalState(asset);
      acc[state] += 1;
      return acc;
    },
    {
      winning: 0,
      under_pressure: 0,
      stable: 0,
      unresolved: 0,
    },
  );
};

export const countActionPostures = (assets: CrownVaultAsset[]) => {
  return assets.reduce(
    (acc, asset) => {
      const posture = getAssetActionPosture(asset).toLowerCase();
      if (posture.includes("buy")) {
        acc.buyMore += 1;
      } else if (posture.includes("sell")) {
        acc.sell += 1;
      } else if (posture.includes("hold")) {
        acc.hold += 1;
      } else {
        acc.unresolved += 1;
      }
      return acc;
    },
    { buyMore: 0, hold: 0, sell: 0, unresolved: 0 },
  );
};

export const sortAssetsByChange = (assets: CrownVaultAsset[]): CrownVaultAsset[] =>
  [...assets].sort((left, right) => (getAssetChangePct(right) || -Infinity) - (getAssetChangePct(left) || -Infinity));
