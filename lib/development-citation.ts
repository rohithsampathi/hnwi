const FULL_ANALYSIS_FIELDS = [
  "full_castle_brief",
  "castle_brief_enriched",
  "castle_brief",
  "full_text",
  "full_analysis",
  "analysis",
  "content",
  "summary",
  "reference",
  "claim_supported",
  "source_signal",
  "why_it_matters",
  "route_relevance",
  "decision_use",
  "pattern",
  "brief_source_text",
  "public_mirror_excerpt",
] as const

const SHORT_DESCRIPTION_FIELDS = [
  "claim_supported",
  "reference",
  "source_signal",
  "description",
  "short_summary",
] as const

const HBYTE_SUMMARY_FIELDS = [
  "hbyte_summary",
  "executive_summary",
] as const

const FIRST_ANALYSIS_SECTION =
  /(?:^|\n)\s*(?:#{1,6}\s*)?(?:\*\*)?(?:Why This Matters|Winners?|Losers?|Potential Moves?|Key Moves\s*(?:&|and)\s*Market Shifts|Market Shifts|Long[-\s]Term Wealth Impact|Wealth Impact|Sentiment Tracker|HNWI Sentiment)(?:\*\*)?\s*:?(?=\n|$)/i

type DevelopmentPayload = Record<string, unknown>

export interface CitationSourceDevelopment {
  id: string
  title: string
  description: string
  industry: string
  product?: string
  date?: string
  summary: string
  summaryLabel?: string
  summarySourceField?: string
  url?: string
  numerical_data?: Array<{
    number: string
    unit: string
    context: string
    source?: string
  }>
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function pickFirstText(payload: DevelopmentPayload, fields: readonly string[]): string {
  for (const field of fields) {
    const value = payload[field]
    const text = cleanText(value)
    if (text) return text
    if (value && typeof value === "object" && "$date" in value) {
      const dateText = cleanText((value as Record<string, unknown>).$date)
      if (dateText) return dateText
    }
  }

  return ""
}

function stripSummaryHeading(text: string): string {
  return text
    .replace(/^\s*#{1,6}\s+/, "")
    .replace(/^\s*(?:Executive Summary|HByte(?: Summary)?|Summary)\s*:?\s*/i, "")
    .trim()
}

function isTruncatedPreview(text: string): boolean {
  return /(?:\.\.\.|…|\.\.)\s*$/.test(stripSummaryHeading(text))
}

function pickHByteSummary(payload: DevelopmentPayload): string {
  for (const field of HBYTE_SUMMARY_FIELDS) {
    const text = cleanText(payload[field])
    if (text) return text
  }

  return ""
}

function sharesLeadingText(currentText: string, fullText: string): boolean {
  const previewPrefix = currentText.replace(/(?:\.\.\.|…|\.\.)\s*$/, "").trim().slice(0, 80).toLowerCase()
  return previewPrefix.length >= 40 && fullText.toLowerCase().startsWith(previewPrefix)
}

function shouldReplaceLeadingSummary(
  currentLeadingText: string,
  fullHByteSummary: string,
  allowTruncatedWithoutPrefix = true
): boolean {
  const current = stripSummaryHeading(currentLeadingText)
  const full = stripSummaryHeading(fullHByteSummary)

  if (!full) return false
  if (!current) return true
  if (full.length <= current.length) return false
  if (isTruncatedPreview(current)) {
    return allowTruncatedWithoutPrefix || sharesLeadingText(current, full)
  }

  return sharesLeadingText(current, full)
}

function mergeFullHByteSummary(
  analysisText: string,
  fullHByteSummary: string,
  allowTruncatedWithoutPrefix = true
): string {
  if (!fullHByteSummary) return analysisText
  if (!analysisText) return fullHByteSummary

  const firstSectionMatch = analysisText.match(FIRST_ANALYSIS_SECTION)
  const leadingText = firstSectionMatch
    ? analysisText.slice(0, firstSectionMatch.index).trim()
    : analysisText.trim()

  if (!shouldReplaceLeadingSummary(leadingText, fullHByteSummary, allowTruncatedWithoutPrefix)) {
    return analysisText
  }

  const cleanedFullSummary = stripSummaryHeading(fullHByteSummary)
  const hasSummaryHeading = /^\s*(?:#{1,6}\s+)?(?:Executive Summary|HByte(?: Summary)?|Summary)\s*:?\s*/i.test(leadingText)
  const replacement = hasSummaryHeading ? `HByte Summary\n${cleanedFullSummary}` : cleanedFullSummary

  if (!firstSectionMatch) {
    return replacement
  }

  return `${replacement}\n\n${analysisText.slice(firstSectionMatch.index).trimStart()}`
}

function citationSummaryLabel(sourceField: string): string {
  if (
    sourceField === "full_castle_brief" ||
    sourceField === "castle_brief_enriched" ||
    sourceField === "castle_brief"
  ) {
    return "Full Castle Brief"
  }

  if (sourceField === "hbyte_summary" || sourceField === "executive_summary") {
    return "HByte"
  }

  if (sourceField === "description") {
    return "Source Summary"
  }

  return "Source Record"
}

function pickCitationAnalysis(payload: DevelopmentPayload): {
  text: string
  sourceField: string
  label: string
} {
  const fullHByteSummary = pickHByteSummary(payload)
  const descriptionText = cleanText(payload.description)

  for (const field of FULL_ANALYSIS_FIELDS) {
    const text = cleanText(payload[field])
    if (text) {
      const withHByteSummary = mergeFullHByteSummary(text, fullHByteSummary)
      return {
        text: mergeFullHByteSummary(withHByteSummary, descriptionText, false),
        sourceField: field,
        label: citationSummaryLabel(field),
      }
    }
  }

  if (fullHByteSummary) {
    return {
      text: fullHByteSummary,
      sourceField: "hbyte_summary",
      label: citationSummaryLabel("hbyte_summary"),
    }
  }

  if (descriptionText) {
    return {
      text: descriptionText,
      sourceField: "description",
      label: citationSummaryLabel("description"),
    }
  }

  return {
    text: "",
    sourceField: "",
    label: "Source Brief",
  }
}

export function pickCitationAnalysisText(payload: DevelopmentPayload): string {
  return pickCitationAnalysis(payload).text
}

export function pickCitationDescription(payload: DevelopmentPayload, analysisText: string): string {
  const normalizedAnalysis = stripSummaryHeading(analysisText).toLowerCase()
  for (const field of SHORT_DESCRIPTION_FIELDS) {
    const text = cleanText(payload[field])
    const normalizedText = stripSummaryHeading(text).toLowerCase()
    if (text && normalizedText && normalizedText !== normalizedAnalysis) return text.substring(0, 220)
  }

  return ""
}

export function buildCitationSourceDevelopment(
  payload: unknown,
  fallbackId: string
): CitationSourceDevelopment | null {
  if (!payload || typeof payload !== "object") {
    return null
  }

  const source = payload as DevelopmentPayload
  const status = cleanText(source.status).toLowerCase()
  if (status === "not_found" || status === "missing") {
    return null
  }

  const nestedPayload = (
    (source.development && typeof source.development === "object" && source.development) ||
    (source.data && typeof source.data === "object" && source.data) ||
    (source.brief && typeof source.brief === "object" && source.brief) ||
    source
  ) as DevelopmentPayload

  const analysis = pickCitationAnalysis(nestedPayload)
  const summary = analysis.text
  const title = pickFirstText(nestedPayload, [
    "title",
    "brief_title",
    "source_title",
    "name",
  ])
  const description =
    pickCitationDescription(nestedPayload, summary) ||
    pickFirstText(nestedPayload, [
      "card_summary",
      "short_summary",
      "description",
      "brief_source_text",
      "public_mirror_excerpt",
    ])
  const id =
    pickFirstText(nestedPayload, [
      "_id",
      "id",
      "brief_id",
      "dev_id",
      "devid",
      "source_development_id",
    ]) || fallbackId

  if (!title && !summary && !description) {
    return null
  }

  return {
    id,
    title: title || "Source Evidence",
    description,
    industry:
      pickFirstText(nestedPayload, ["industry", "category"]) ||
      "Market Intelligence",
    product: pickFirstText(nestedPayload, ["product"]) || undefined,
    date:
      pickFirstText(nestedPayload, [
        "source_article_date",
        "source_published_at",
        "published_at",
        "article_date",
        "date",
        "start_date",
        "created_at",
        "generated_at",
      ]) || undefined,
    summary,
    summaryLabel: analysis.label,
    summarySourceField: analysis.sourceField || undefined,
    url:
      pickFirstText(nestedPayload, ["url", "source_url"]) ||
      undefined,
    numerical_data: Array.isArray(nestedPayload.numerical_data)
      ? (nestedPayload.numerical_data as CitationSourceDevelopment["numerical_data"])
      : [],
  }
}
