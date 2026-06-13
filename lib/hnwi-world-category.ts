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
  "hnwi intelligence",
  "castle brief",
  "castle briefs",
  "decision memory",
  "decision memo",
  "kingdom library",
  "kingdom_library",
  "library intelligence",
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
  luxury_and_collectibles: "Collectibles",
  tax_and_succession: "Tax",
  life_insurance_and_legacy: "Financial Services",
  wealth_migration: "Immigration",
  alternatives: "Financial Services",
  hnwi_strategy: "Financial Services",
  hnwi_intelligence: "Financial Services",
}

const APPROVED_CATEGORY_LABELS = new Set([
  "Real Estate",
  "Art",
  "Collectibles",
  "Financial Services",
  "Immigration",
  "Precious Metal",
  "Tourism",
  "Lifestyle",
  "Automotive",
  "Fintech",
  "Hospitality",
  "Wealth Management",
  "Security",
  "Tax",
  "Luxury Travel",
])

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

function approvedCategoryLabel(value: unknown): string | null {
  for (const candidate of toCandidateList(value)) {
    if (!isUsableCategory(candidate)) continue
    const formatted = formatHnwiWorldCategoryLabel(candidate)
    if (APPROVED_CATEGORY_LABELS.has(formatted)) {
      return formatted
    }
  }
  return null
}

export function resolveHnwiWorldCategory(development: HNWIWorldDevelopment): string {
  const dev = development as DevelopmentWithCategoryFields
  const approvedIndustry = approvedCategoryLabel(dev.industry)
  if (approvedIndustry) {
    return approvedIndustry
  }

  const candidates = [
    dev.metadata?.category,
    dev.metadata?.category_name,
    dev.metadata?.primary_category,
    dev.classification?.category,
    dev.classification?.primary_category,
    dev.category,
    dev.category_name,
    dev.primary_category,
    dev.market_category,
    dev.sector,
    dev.vertical,
    dev.topic,
    dev.asset_class,
    dev.product,
    dev.tags,
  ]

  for (const candidate of candidates) {
    const approvedValue = approvedCategoryLabel(candidate)
    if (approvedValue) {
      return approvedValue
    }

    const usableValue = toCandidateList(candidate).find(isUsableCategory)
    if (usableValue) {
      const formatted = formatHnwiWorldCategoryLabel(usableValue)
      if (APPROVED_CATEGORY_LABELS.has(formatted)) {
        return formatted
      }
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
