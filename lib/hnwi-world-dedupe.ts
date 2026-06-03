import type { HNWIWorldDevelopment } from "@/types/hnwi-world"

type LooseDevelopment = HNWIWorldDevelopment & Record<string, unknown>

const normalizeText = (value: unknown): string =>
  typeof value === "string"
    ? value.trim().toLowerCase().replace(/\s+/g, " ")
    : value == null
      ? ""
      : String(value).trim().toLowerCase().replace(/\s+/g, " ")

const normalizeUrl = (value: unknown): string => {
  const raw = normalizeText(value)
  if (!raw) return ""

  try {
    const parsed = new URL(raw)
    parsed.hash = ""
    parsed.search = ""
    return parsed.toString().replace(/\/$/, "")
  } catch {
    return raw.split("#")[0].split("?")[0].replace(/\/$/, "")
  }
}

const normalizeDate = (value: unknown): string => {
  if (!value) return ""
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return normalizeText(value)
  return date.toISOString().slice(0, 10)
}

const readNestedString = (record: LooseDevelopment, path: string[]): string => {
  let current: unknown = record
  for (const key of path) {
    if (!current || typeof current !== "object") return ""
    current = (current as Record<string, unknown>)[key]
  }
  return normalizeText(current)
}

const qualityScore = (development: HNWIWorldDevelopment): number => {
  const record = development as LooseDevelopment
  let score = 0

  score += normalizeText(record.summary).length
  score += normalizeText(record.description).length
  score += normalizeText(record.title).length

  if (record.pattern_metadata) score += 300
  if (record.score != null) score += 50

  return score
}

export const getHnwiWorldDevelopmentCanonicalKey = (development: HNWIWorldDevelopment): string => {
  const record = development as LooseDevelopment
  const sourceUrl =
    normalizeUrl(record.source_url) ||
    normalizeUrl(record.url) ||
    normalizeUrl(readNestedString(record, ["metadata", "source_url"]))

  if (sourceUrl) return `url:${sourceUrl}`

  const sourceId =
    normalizeText(record.source_development_id) ||
    normalizeText(record.development_id) ||
    normalizeText(record.devid) ||
    readNestedString(record, ["metadata", "source_development_id"])

  if (sourceId) return `source:${sourceId}`

  const title = normalizeText(record.title)
  const date = normalizeDate(record.date)
  const description = normalizeText(record.description || record.summary).slice(0, 240)
  const category = normalizeText(record.industry || record.category || record.product)

  return `content:${title}|${date}|${category}|${description}`
}

export const dedupeHnwiWorldDevelopments = <T extends HNWIWorldDevelopment>(developments: T[]): T[] => {
  const bestByKey = new Map<string, T>()

  for (const development of developments) {
    const key = getHnwiWorldDevelopmentCanonicalKey(development)
    const existing = bestByKey.get(key)

    if (!existing || qualityScore(development) > qualityScore(existing)) {
      bestByKey.set(key, development)
    }
  }

  return Array.from(bestByKey.values())
}
