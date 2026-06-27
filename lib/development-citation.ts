const FULL_ANALYSIS_FIELDS = [
  "full_text",
  "castle_original_brief",
  "castle_brief_enriched",
  "castle_brief",
  "full_castle_brief",
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

const V31_MARKER_FIELDS = [
  "castle_brief_enriched",
  "castle_brief",
  "castle_original_brief",
  "full_castle_brief",
  "castle_quality_score",
  "castle_source_fidelity_score",
  "castle_content_audit_band",
] as const

const V31_BODY_FIELDS = [
  "castle_original_brief",
  "castle_brief_enriched",
  "castle_brief",
  "full_castle_brief",
] as const

const V31_SOURCE_NATIVE_FIELDS = [
  "full_text",
  "brief_source_text",
  "public_mirror_excerpt",
  "description",
] as const

const FIRST_ANALYSIS_SECTION =
  /(?:^|\n)\s*(?:#{1,6}\s*)?(?:\*\*)?(?:Why This Matters|Winners?|Losers?|Potential Moves?|Key Moves\s*(?:&|and)\s*Market Shifts|Market Shifts|Long[-\s]Term Wealth Impact|Wealth Impact|Sentiment Tracker|HNWI Sentiment)(?:\*\*)?\s*:?(?=\n|$)/i

type DevelopmentPayload = Record<string, unknown>

function asRecord(value: unknown): DevelopmentPayload {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as DevelopmentPayload)
    : {}
}

function sourceEvidenceRecord(payload: DevelopmentPayload): DevelopmentPayload {
  const direct = payload.source_evidence_record || payload.sourceEvidenceRecord
  if (direct && typeof direct === "object") return direct as DevelopmentPayload
  return {}
}

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
  return pickFirstTextWithField(payload, fields).text
}

function pickFirstTextWithField(
  payload: DevelopmentPayload,
  fields: readonly string[]
): { field: string; text: string } {
  for (const field of fields) {
    const value = payload[field]
    const text = cleanText(value)
    if (text) return { field, text }
    if (value && typeof value === "object" && "$date" in value) {
      const dateText = cleanText((value as Record<string, unknown>).$date)
      if (dateText) return { field, text: dateText }
    }
  }

  return { field: "", text: "" }
}

function stripSummaryHeading(text: string): string {
  return text
    .replace(/^\s*#{1,6}\s+/, "")
    .replace(/^\s*(?:Executive Summary|HByte(?: Summary)?|Summary)\s*:?\s*/i, "")
    .trim()
}

function normalizeComparableText(text: string): string {
  return stripSummaryHeading(text)
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

function containsComparableText(haystack: string, needle: string): boolean {
  const normalizedHaystack = normalizeComparableText(haystack)
  const normalizedNeedle = normalizeComparableText(needle)
  return normalizedNeedle.length >= 24 && normalizedHaystack.includes(normalizedNeedle)
}

function sanitizePublicCitationText(text: string): string {
  return text
    .replace(/(?:^|\n)\s*(?:Source\s+URL|Source\s+link|URL)\s*:\s*https?:\/\/[^\n]+(?=\n|$)/gi, "\n")
    .replace(/\bCastle Briefs?\b/g, "Source Brief")
    .replace(/\bcastle briefs?\b/g, "source brief")
    .replace(/\bCastle confirmations?\b/g, "source confirmations")
    .replace(/\bcastle confirmations?\b/g, "source confirmations")
    .replace(/\bCastle\b/g, "Source")
    .replace(/\bcastle\b/g, "source")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function trimSourceNativeCitationText(text: string): string {
  const sourceText = cleanText(text)
  if (!sourceText) return ""
  const markers = [
    "The library already places it next to",
    "Balanced pattern memory:",
    "current analogs:",
    "[DEVID-",
    "[DEVID_",
    "[DEVID-dev_",
  ]
  const lower = sourceText.toLowerCase()
  const cutAt = markers.reduce((currentCut, marker) => {
    const index = lower.indexOf(marker.toLowerCase())
    return index >= 0 ? Math.min(currentCut, index) : currentCut
  }, sourceText.length)
  return sourceText.slice(0, cutAt).trim()
}

function significantSourceTokens(text: string): Set<string> {
  const stopWords = new Set([
    "about",
    "after",
    "around",
    "brief",
    "crore",
    "estate",
    "estates",
    "home",
    "homes",
    "million",
    "print",
    "property",
    "sale",
    "seller",
    "source",
    "trophy",
    "with",
  ])

  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 4 && !stopWords.has(token))
  )
}

function tokenOverlapCount(sourceTokens: Set<string>, candidateText: string): number {
  const candidateTokens = significantSourceTokens(candidateText)
  let overlap = 0
  sourceTokens.forEach((token) => {
    if (candidateTokens.has(token)) overlap += 1
  })
  return overlap
}

function shouldPreferSourceNativeText(
  payload: DevelopmentPayload,
  summaryText: string,
  sourceNativeText: string
): boolean {
  if (!summaryText || !sourceNativeText) return false

  const sourceIdentity = pickFirstText(payload, [
    "source_title",
    "title",
    "brief_title",
    "product",
    "name",
  ])
  const sourceTokens = significantSourceTokens(sourceIdentity)
  if (sourceTokens.size < 1) return false

  const summaryLead = stripSummaryHeading(summaryText).slice(0, 260)
  const sourceNativeLead = stripSummaryHeading(sourceNativeText).slice(0, 260)
  const summaryOverlap = tokenOverlapCount(sourceTokens, summaryLead)
  const sourceNativeOverlap = tokenOverlapCount(sourceTokens, sourceNativeLead)

  return sourceNativeOverlap >= 1 && summaryOverlap < sourceNativeOverlap
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

function hasAnyPresentValue(payload: DevelopmentPayload, fields: readonly string[]): boolean {
  return fields.some((field) => {
    const value = payload[field]
    if (typeof value === "string") return Boolean(value.trim())
    if (typeof value === "number") return Number.isFinite(value)
    return value !== undefined && value !== null
  })
}

function isV31CitationPayload(payload: DevelopmentPayload): boolean {
  const sourceCollection = pickFirstText(payload, [
    "source_collection",
    "_source_collection",
    "connection_collection",
    "lineage_source_collection",
    "collection",
  ]).toLowerCase()

  return (
    sourceCollection.includes("castle_briefs_v31") ||
    hasAnyPresentValue(payload, V31_MARKER_FIELDS)
  )
}

function stripDuplicateLeadBlock(text: string, leadTexts: string[]): string {
  const trimmed = text.trim()
  if (!trimmed) return ""

  const firstSectionMatch = trimmed.match(FIRST_ANALYSIS_SECTION)
  if (!firstSectionMatch || firstSectionMatch.index === undefined) {
    return leadTexts.some((leadText) => containsComparableText(leadText, trimmed)) ? "" : trimmed
  }

  const leadingText = trimmed.slice(0, firstSectionMatch.index).trim()
  const shouldStripLead =
    !leadingText ||
    leadTexts.some(
      (leadText) =>
        containsComparableText(leadText, leadingText) ||
        containsComparableText(leadingText, leadText)
    )

  return shouldStripLead ? trimmed.slice(firstSectionMatch.index).trimStart() : trimmed
}

function buildV31CitationAnalysis(
  payload: DevelopmentPayload,
  fullHByteSummary: string,
  descriptionText: string
): string {
  const parts: string[] = []
  const hbyteSummary = stripSummaryHeading(fullHByteSummary)

  if (hbyteSummary) {
    parts.push(`HByte Summary\n${hbyteSummary}`)
  }

  const body = pickFirstTextWithField(payload, V31_BODY_FIELDS)
  const bodyWithoutDuplicateLead = stripDuplicateLeadBlock(body.text, [
    hbyteSummary,
    descriptionText,
  ])
  if (bodyWithoutDuplicateLead) {
    parts.push(bodyWithoutDuplicateLead)
  }

  return sanitizePublicCitationText(parts.join("\n\n").trim())
}

function citationSummaryLabel(sourceField: string): string {
  if (
    sourceField === "full_castle_brief" ||
    sourceField === "castle_brief_enriched" ||
    sourceField === "castle_brief" ||
    sourceField === "castle_original_brief"
  ) {
    return "Source Record"
  }

  if (sourceField === "hbyte_summary" || sourceField === "executive_summary") {
    return "HByte"
  }

  if (sourceField === "description") {
    return "Source Record"
  }

  return "Source Record"
}

function pickCitationAnalysis(payload: DevelopmentPayload): {
  text: string
  sourceField: string
  label: string
} {
  const evidence = sourceEvidenceRecord(payload)
  const evidenceSummary = asRecord(evidence.summary)
  const evidenceText =
    cleanText(evidenceSummary.display_text) ||
    cleanText(evidenceSummary.displayText) ||
    cleanText(evidenceSummary.source_brief) ||
    cleanText(evidenceSummary.sourceBrief)
  if (evidenceText) {
    return {
      text: sanitizePublicCitationText(trimSourceNativeCitationText(evidenceText)),
      sourceField:
        cleanText(evidenceSummary.display_field) ||
        cleanText(evidenceSummary.displayField) ||
        "source_evidence_record.summary.display_text",
      label:
        cleanText(evidenceSummary.display_label) ||
        cleanText(evidenceSummary.displayLabel) ||
        "Source Brief",
    }
  }

  const fullHByteSummary = pickHByteSummary(payload)
  const descriptionText = cleanText(payload.description)

  if (isV31CitationPayload(payload)) {
    const sourceNative = pickFirstTextWithField(payload, V31_SOURCE_NATIVE_FIELDS)
    const sourceNativeText = trimSourceNativeCitationText(sourceNative.text)
    if (shouldPreferSourceNativeText(payload, fullHByteSummary, sourceNativeText)) {
      return {
        text: sanitizePublicCitationText(sourceNativeText),
        sourceField: sourceNative.field,
        label: "Source Brief",
      }
    }

    const v31Body = pickFirstTextWithField(payload, V31_BODY_FIELDS)
    const v31Text = buildV31CitationAnalysis(payload, fullHByteSummary, descriptionText)
    return {
      text: v31Text,
      sourceField: fullHByteSummary ? "hbyte_summary" : (v31Body.field || (v31Text ? "source_record" : "")),
      label: fullHByteSummary ? "HByte" : (v31Body.text ? "Source Brief" : "Source Record"),
    }
  }

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
    if (
      text &&
      normalizedText &&
      normalizedText !== normalizedAnalysis &&
      !normalizedAnalysis.includes(normalizedText)
    ) {
      return text.substring(0, 220)
    }
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

  const evidence = sourceEvidenceRecord(nestedPayload)
  const evidenceSource = asRecord(evidence.source)
  const evidenceIds = asRecord(evidence.source_ids)
  const analysis = pickCitationAnalysis(nestedPayload)
  const summary = analysis.text
  if (isV31CitationPayload(nestedPayload) && !summary) {
    return null
  }

  const title =
    cleanText(evidenceSource.title) ||
    pickFirstText(nestedPayload, [
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
    cleanText(evidenceIds.castle_brief_id) ||
    cleanText(evidence.citation_id) ||
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
      cleanText(evidenceSource.category) ||
      pickFirstText(nestedPayload, ["industry", "category"]) ||
      "Market Intelligence",
    product: cleanText(evidenceSource.product) || pickFirstText(nestedPayload, ["product"]) || undefined,
    date:
      cleanText(evidenceSource.article_date) ||
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
      cleanText(evidenceSource.url) ||
      pickFirstText(nestedPayload, ["url", "source_url"]) ||
      undefined,
    numerical_data: Array.isArray(nestedPayload.numerical_data)
      ? (nestedPayload.numerical_data as CitationSourceDevelopment["numerical_data"])
      : [],
  }
}
