const FULL_ANALYSIS_FIELDS = [
  "castle_brief_enriched",
  "castle_brief",
  "full_castle_brief",
  "full_analysis",
  "analysis",
  "content",
  "summary",
] as const

const SHORT_DESCRIPTION_FIELDS = [
  "description",
  "hbyte_summary",
  "short_summary",
  "summary",
] as const

type DevelopmentPayload = Record<string, unknown>

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

export function pickCitationAnalysisText(payload: DevelopmentPayload): string {
  for (const field of FULL_ANALYSIS_FIELDS) {
    const text = cleanText(payload[field])
    if (text) return text
  }

  return ""
}

export function pickCitationDescription(payload: DevelopmentPayload, analysisText: string): string {
  for (const field of SHORT_DESCRIPTION_FIELDS) {
    const text = cleanText(payload[field])
    if (text) return text.substring(0, 220)
  }

  return analysisText.substring(0, 220) || "Development details"
}
