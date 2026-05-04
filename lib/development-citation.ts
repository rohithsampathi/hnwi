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
  "short_summary",
] as const

const HBYTE_SUMMARY_FIELDS = [
  "hbyte_summary",
  "executive_summary",
] as const

const FIRST_ANALYSIS_SECTION =
  /(?:^|\n)\s*(?:#{1,6}\s*)?(?:\*\*)?(?:Why This Matters|Winners?|Losers?|Potential Moves?|Key Moves\s*(?:&|and)\s*Market Shifts|Market Shifts|Long[-\s]Term Wealth Impact|Wealth Impact|Sentiment Tracker|HNWI Sentiment)(?:\*\*)?\s*:?(?=\n|$)/i

type DevelopmentPayload = Record<string, unknown>

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
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

export function pickCitationAnalysisText(payload: DevelopmentPayload): string {
  const fullHByteSummary = pickHByteSummary(payload)
  const descriptionText = cleanText(payload.description)

  for (const field of FULL_ANALYSIS_FIELDS) {
    const text = cleanText(payload[field])
    if (text) {
      const withHByteSummary = mergeFullHByteSummary(text, fullHByteSummary)
      return mergeFullHByteSummary(withHByteSummary, descriptionText, false)
    }
  }

  return fullHByteSummary || descriptionText
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
