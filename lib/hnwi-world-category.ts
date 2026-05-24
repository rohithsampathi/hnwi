import type { HNWIWorldDevelopment } from "@/types/hnwi-world"

export interface HNWIWorldCategoryTrend {
  industry: string
  total_count: number
}

type DevelopmentWithCategoryFields = HNWIWorldDevelopment & {
  category?: unknown
  category_name?: unknown
  primary_category?: unknown
  market_category?: unknown
  sector?: unknown
  vertical?: unknown
  topic?: unknown
  asset_class?: unknown
  tags?: unknown
  metadata?: Record<string, unknown>
  classification?: Record<string, unknown>
}

const INTERNAL_CATEGORY_VALUES = new Set([
  "",
  "[]",
  "{}",
  "null",
  "none",
  "n/a",
  "na",
  "unknown",
  "undefined",
  "promotion_packet",
  "promotion packet",
  "promo_packet",
  "promo packet",
])

const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  au_specific: "Financial Services",
  luxury_goods: "Collectibles",
  market_intelligence: "Financial Services",
  family_enterprise: "Financial Services",
  family_office: "Financial Services",
  real_estate: "Real Estate",
  private_equity: "Financial Services",
  wealth_management: "Wealth Management",
  precious_metals: "Precious Metal",
}

function toCandidateList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(toCandidateList)
  }

  if (typeof value !== "string") {
    return value == null ? [] : [String(value)]
  }

  const trimmed = value.trim()
  if (!trimmed) return []

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed)
      return Array.isArray(parsed) ? parsed.flatMap(toCandidateList) : [trimmed]
    } catch {
      return [trimmed]
    }
  }

  return [trimmed]
}

function isUsableCategory(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  return !INTERNAL_CATEGORY_VALUES.has(normalized)
}

export function formatHnwiWorldCategoryLabel(value: string): string {
  const normalized = value.trim().toLowerCase()
  if (CATEGORY_LABEL_OVERRIDES[normalized]) {
    return CATEGORY_LABEL_OVERRIDES[normalized]
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function resolveHnwiWorldCategory(development: HNWIWorldDevelopment): string {
  const dev = development as DevelopmentWithCategoryFields
  const candidates = [
    dev.category,
    dev.category_name,
    dev.primary_category,
    dev.market_category,
    dev.metadata?.category,
    dev.metadata?.category_name,
    dev.metadata?.primary_category,
    dev.classification?.category,
    dev.classification?.primary_category,
    dev.sector,
    dev.vertical,
    dev.topic,
    dev.asset_class,
    dev.tags,
    dev.industry,
    dev.product,
  ]

  for (const candidate of candidates) {
    const usableValue = toCandidateList(candidate).find(isUsableCategory)
    if (usableValue) {
      return formatHnwiWorldCategoryLabel(usableValue)
    }
  }

  return "Financial Services"
}

export function buildHnwiWorldCategoryTrends(developments: HNWIWorldDevelopment[]): HNWIWorldCategoryTrend[] {
  const counts = new Map<string, number>()

  for (const development of developments) {
    const category = resolveHnwiWorldCategory(development)
    counts.set(category, (counts.get(category) || 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([industry, total_count]) => ({ industry, total_count }))
    .sort((a, b) => b.total_count - a.total_count || a.industry.localeCompare(b.industry))
}
