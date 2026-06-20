type OpportunityDisplaySource = Partial<{
  analysis: unknown
  elite_pulse_analysis: unknown
  full_analysis: unknown
  full_text: unknown
  full_castle_brief: unknown
  castle_brief_enriched: unknown
  castle_brief: unknown
  brief_source_text: unknown
  source_summary: unknown
  castle_source_summary: unknown
  source_summary_structured: unknown
  castle_source_summary_structured: unknown
  hbyte_summary: unknown
  card_summary: unknown
  summary: unknown
  description: unknown
  public_mirror_excerpt: unknown
  title: unknown
  name: unknown
  brief_title: unknown
  source_title: unknown
  product: unknown
  value: unknown
  minimum_investment_display: unknown
  value_original: unknown
  value_native: unknown
  value_currency: unknown
  value_usd: unknown
  minimum_investment_usd: unknown
}>

const asCleanText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  return ''
}

const firstText = (...values: unknown[]): string => {
  for (const value of values) {
    const text = asCleanText(value)
    if (text) return text
  }
  return ''
}

export const structuredOpportunitySummaryText = (value: unknown): string => {
  if (!value || typeof value !== 'object') {
    return asCleanText(value)
  }

  const record = value as Record<string, unknown>
  const lines = [
    record.summary_sentence,
    record.summary,
    record.rationale,
    record.next_action,
    record.evidence_basis ? `Evidence basis: ${asCleanText(record.evidence_basis)}` : '',
  ].map(asCleanText).filter(Boolean)

  const moneyAnchors = Array.isArray(record.money_anchors)
    ? record.money_anchors
        .map(anchor => {
          if (!anchor || typeof anchor !== 'object') return ''
          return asCleanText((anchor as Record<string, unknown>).raw)
        })
        .filter(Boolean)
    : []

  if (moneyAnchors.length > 0) {
    lines.push(`Money anchors: ${moneyAnchors.join(', ')}`)
  }

  return lines.join('\n')
}

export const resolveOpportunityAnalysisText = (opp: OpportunityDisplaySource): string => firstText(
  opp.analysis,
  opp.elite_pulse_analysis,
  opp.full_analysis,
  opp.full_text,
  opp.full_castle_brief,
  opp.castle_brief_enriched,
  opp.castle_brief,
  opp.brief_source_text,
  opp.source_summary,
  opp.castle_source_summary,
  structuredOpportunitySummaryText(opp.source_summary_structured),
  structuredOpportunitySummaryText(opp.castle_source_summary_structured),
  opp.hbyte_summary,
  opp.card_summary,
  opp.summary,
  opp.description,
  opp.public_mirror_excerpt,
)

export const resolveOpportunitySummaryText = (
  opp: OpportunityDisplaySource,
  analysisText: string,
): string => firstText(
  opp.card_summary,
  opp.hbyte_summary,
  opp.summary,
  opp.source_summary,
  opp.castle_source_summary,
  structuredOpportunitySummaryText(opp.source_summary_structured),
  structuredOpportunitySummaryText(opp.castle_source_summary_structured),
  opp.description,
  opp.public_mirror_excerpt,
  analysisText,
)

export const resolveOpportunityTitle = (
  opp: OpportunityDisplaySource,
  fallback: string,
): string => firstText(
  opp.title,
  opp.name,
  opp.brief_title,
  opp.source_title,
  opp.product,
  fallback,
  'Opportunity',
)

export const resolveOpportunityValue = (opp: OpportunityDisplaySource): string | undefined => firstText(
  opp.value,
  opp.minimum_investment_display,
  opp.value_original,
  opp.value_native && opp.value_currency ? `${opp.value_currency} ${opp.value_native}` : '',
  opp.value_usd ? `USD ${opp.value_usd}` : '',
  opp.minimum_investment_usd ? `USD ${opp.minimum_investment_usd}` : '',
) || undefined
