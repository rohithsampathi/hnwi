import { headers } from "next/headers"
import type { HNWIWorldDevelopment } from "@/types/hnwi-world"

export interface SharedDevelopment extends HNWIWorldDevelopment {
  _id: string
  title: string
  description: string
  summary: string
  full_text?: string
  castle_brief?: string
  castle_brief_enriched?: string
  hbyte_summary?: string
  card_summary?: string
  date?: string
  url?: string
  industry: string
  product?: string
  score?: number
}

const SHARED_DEVELOPMENT_ID_ALIASES: Record<string, string> = {
  "delhi-trophy-homes-usd-131m-sale-print": "dev_8b294c5f2d7d3e99f85600f8",
}

export function resolveSharedDevelopmentId(developmentId: string): string {
  return SHARED_DEVELOPMENT_ID_ALIASES[developmentId] || developmentId
}

export async function getRequestBaseUrl(): Promise<string> {
  const headerStore = await headers()
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host")
  const protocol = headerStore.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https")

  if (host) {
    return `${protocol}://${host}`
  }

  return process.env.NEXT_PUBLIC_PRODUCTION_URL || "https://app.hnwichronicles.com"
}

export async function getSharedDevelopment(developmentId: string): Promise<SharedDevelopment | null> {
  try {
    const apiBaseUrl = await getRequestBaseUrl()
    const resolvedDevelopmentId = resolveSharedDevelopmentId(developmentId)

    const response = await fetch(`${apiBaseUrl}/api/developments/public/${encodeURIComponent(resolvedDevelopmentId)}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const record = data?.development && typeof data.development === "object" ? data.development : data

    if (!record || typeof record !== "object") {
      return null
    }

    const normalized = record as Record<string, unknown>
    const id =
      typeof normalized._id === "string"
        ? normalized._id
        : typeof normalized.id === "string"
          ? normalized.id
          : typeof normalized.dev_id === "string"
            ? normalized.dev_id
            : typeof normalized.source_development_id === "string"
              ? normalized.source_development_id
              : resolvedDevelopmentId

    if (!id || typeof normalized.title !== "string" || !normalized.title) {
      return null
    }

    const outwardId = developmentId === resolvedDevelopmentId ? id : developmentId

    return {
      _id: outwardId,
      id: outwardId,
      title: typeof normalized.title === "string" ? normalized.title : "",
      description: typeof normalized.description === "string" ? normalized.description : "",
      summary:
        typeof normalized.full_text === "string" && normalized.full_text
          ? normalized.full_text
          : typeof normalized.castle_brief_enriched === "string" && normalized.castle_brief_enriched
            ? normalized.castle_brief_enriched
            : typeof normalized.castle_brief === "string" && normalized.castle_brief
              ? normalized.castle_brief
              : typeof normalized.summary === "string"
                ? normalized.summary
                : "",
      full_text: typeof normalized.full_text === "string" ? normalized.full_text : undefined,
      castle_brief: typeof normalized.castle_brief === "string" ? normalized.castle_brief : undefined,
      castle_brief_enriched:
        typeof normalized.castle_brief_enriched === "string" ? normalized.castle_brief_enriched : undefined,
      hbyte_summary: typeof normalized.hbyte_summary === "string" ? normalized.hbyte_summary : undefined,
      card_summary: typeof normalized.card_summary === "string" ? normalized.card_summary : undefined,
      date: typeof normalized.date === "string" ? normalized.date : undefined,
      url: typeof normalized.url === "string" ? normalized.url : undefined,
      industry: typeof normalized.industry === "string" ? normalized.industry : "",
      product: typeof normalized.product === "string" ? normalized.product : undefined,
      score: typeof normalized.score === "number" ? normalized.score : undefined,
    }
  } catch {
    return null
  }
}
