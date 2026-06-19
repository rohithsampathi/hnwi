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
  "hbyte_summary",
  "castle_brief_enriched",
  "castle_brief",
  "castle_original_brief",
  "full_castle_brief",
  "castle_quality_score",
  "castle_source_fidelity_score",
  "castle_content_audit_band",
] as const

const V31_BODY_FIELDS = [
  "full_text",
  "castle_original_brief",
  "castle_brief_enriched",
  "castle_brief",
  "full_castle_brief",
  "full_analysis",
  "analysis",
  "content",
  "brief_source_text",
  "public_mirror_excerpt",
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
    .replace(/\bCastle Briefs?\b/g, "Source Brief")
    .replace(/\bcastle briefs?\b/g, "source brief")
    .replace(/\bCastle confirmations?\b/g, "source confirmations")
    .replace(/\bcastle confirmations?\b/g, "source confirmations")
    .replace(/\bCastle\b/g, "Source")
    .replace(/\bcastle\b/g, "source")
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

function hasAnyText(payload: DevelopmentPayload, fields: readonly string[]): boolean {
  return fields.some((field) => Boolean(cleanText(payload[field])))
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
    hasAnyText(payload, V31_MARKER_FIELDS)
  )
}

function humanizeValue(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatScore(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }

  return cleanText(value)
}

function formatPercent(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    const normalized = value > 1 ? value : value * 100
    return `${Math.round(normalized)}%`
  }

  const text = cleanText(value)
  return text ? humanizeValue(text) : ""
}

function arrayToPlainList(value: unknown, maxItems = 4): string[] {
  if (!Array.isArray(value)) return []

  return value
    .slice(0, maxItems)
    .map((item) => {
      if (typeof item === "string") return humanizeValue(item)
      if (!item || typeof item !== "object") return ""

      const objectItem = item as Record<string, unknown>
      const directText = pickFirstText(objectItem, [
        "summary",
        "description",
        "issue",
        "issue_type",
        "label",
        "name",
        "atom",
        "signal",
      ])
      if (directText) return humanizeValue(directText)

      return ""
    })
    .filter(Boolean)
}

function buildQualityRead(payload: DevelopmentPayload): string {
  const lines: string[] = []
  const qualityScore = formatScore(payload.castle_quality_score)
  const auditBand = cleanText(payload.castle_content_audit_band)
  const completenessScore = formatScore(payload.castle_six_book_standard_score)
  const validationStatus = cleanText(payload.castle_validation_status)

  if (qualityScore) lines.push(`Quality score: ${qualityScore}.`)
  if (auditBand) lines.push(`Review band: ${humanizeValue(auditBand)}.`)
  if (completenessScore) lines.push(`Completeness score: ${completenessScore}.`)
  if (validationStatus) lines.push(`Review state: ${humanizeValue(validationStatus)}.`)

  return lines.join("\n")
}

function buildSourceFidelityRead(payload: DevelopmentPayload): string {
  const lines: string[] = []
  const fidelityScore = formatScore(payload.castle_source_fidelity_score)
  const fidelityStatus = cleanText(payload.castle_source_fidelity_status)
  const issues = arrayToPlainList(payload.castle_source_fidelity_issues, 3)

  if (fidelityScore) lines.push(`Fidelity score: ${fidelityScore}.`)
  if (fidelityStatus) lines.push(`Evidence boundary: ${humanizeValue(fidelityStatus)}.`)
  if (issues.length) lines.push(`Open source checks: ${issues.join("; ")}.`)

  return lines.join("\n")
}

function buildPatternMemoryRead(payload: DevelopmentPayload): string {
  const lines: string[] = []
  const counts = [
    ["Historic pattern memory", payload.castle_historic_pattern_memory_count],
    ["Seasoned pattern memory", payload.castle_seasoned_pattern_memory_count],
    ["Prior pattern memory", payload.castle_prior_pattern_memory_count],
    ["Subsequent pattern memory", payload.castle_subsequent_pattern_memory_count],
  ] as const
  const countLines = counts
    .map(([label, value]) => {
      const score = formatScore(value)
      return score ? `${label}: ${score}` : ""
    })
    .filter(Boolean)
  const learningAtoms = arrayToPlainList(payload.product_aquarium_learning_atoms, 5)

  if (countLines.length) lines.push(`${countLines.join("; ")}.`)
  if (learningAtoms.length) lines.push(`Evidence atoms: ${learningAtoms.join("; ")}.`)

  return lines.join("\n")
}

function buildDecisionPostureRead(payload: DevelopmentPayload): string {
  const finalVerdict = payload.final_verdict
  if (!finalVerdict || typeof finalVerdict !== "object") return ""

  const verdict = finalVerdict as Record<string, unknown>
  const lines: string[] = []
  const decision = pickFirstText(verdict, ["verdict", "decision", "status"])
  const posture = pickFirstText(verdict, ["decision_posture", "posture", "route_posture"])
  const conditions = pickFirstText(verdict, ["conditions", "condition"])
  const rawText = pickFirstText(verdict, ["raw_text", "rationale", "summary"])
  const confidence = formatPercent(verdict.confidence)

  if (decision) lines.push(`Verdict: ${humanizeValue(decision)}.`)
  if (posture) lines.push(`Decision posture: ${humanizeValue(posture)}.`)
  if (conditions) lines.push(`Conditions: ${conditions}.`)
  if (rawText) lines.push(rawText.endsWith(".") ? rawText : `${rawText}.`)
  if (confidence) lines.push(`Confidence: ${confidence}.`)

  return lines.join("\n")
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
  const rawSummary = pickFirstText(payload, ["summary"])
  const summaryContainsBodySections = FIRST_ANALYSIS_SECTION.test(rawSummary)
  const sourceSummaryCandidate = summaryContainsBodySections
    ? pickFirstText(payload, ["card_summary", "description"])
    : pickFirstText(payload, ["summary", "card_summary", "description"])
  const sourceSummaryFallback = pickFirstText(payload, ["card_summary", "description"])
  const sourceSummaryBody = stripSummaryHeading(
    hbyteSummary &&
      sourceSummaryFallback &&
      (containsComparableText(hbyteSummary, sourceSummaryCandidate) ||
        containsComparableText(sourceSummaryCandidate, hbyteSummary))
      ? sourceSummaryFallback
      : sourceSummaryCandidate
  )

  if (hbyteSummary) {
    parts.push(`HByte Summary\n${hbyteSummary}`)
  }

  if (
    sourceSummaryBody &&
    !containsComparableText(hbyteSummary, sourceSummaryBody) &&
    !containsComparableText(sourceSummaryBody, hbyteSummary)
  ) {
    parts.push(`Source Summary\n${sourceSummaryBody}`)
  }

  const bodyText = pickFirstText(payload, V31_BODY_FIELDS) || (summaryContainsBodySections ? rawSummary : "")
  const bodyWithoutDuplicateLead = stripDuplicateLeadBlock(bodyText, [
    hbyteSummary,
    sourceSummaryBody,
    descriptionText,
  ])
  if (bodyWithoutDuplicateLead) {
    parts.push(bodyWithoutDuplicateLead)
  }

  const decisionPosture = buildDecisionPostureRead(payload)
  const qualityRead = buildQualityRead(payload)
  const sourceFidelityRead = buildSourceFidelityRead(payload)
  const patternMemoryRead = buildPatternMemoryRead(payload)

  if (decisionPosture) parts.push(`Decision Posture\n${decisionPosture}`)
  if (qualityRead) parts.push(`Quality Read\n${qualityRead}`)
  if (sourceFidelityRead) parts.push(`Source Fidelity\n${sourceFidelityRead}`)
  if (patternMemoryRead) parts.push(`Pattern Memory\n${patternMemoryRead}`)

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

  if (isV31CitationPayload(payload)) {
    const v31Text = buildV31CitationAnalysis(payload, fullHByteSummary, descriptionText)
    if (v31Text) {
      return {
        text: v31Text,
        sourceField: fullHByteSummary ? "hbyte_summary" : "source_record",
        label: fullHByteSummary ? "HByte" : "Source Record",
      }
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
