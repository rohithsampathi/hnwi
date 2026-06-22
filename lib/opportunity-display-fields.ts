type OpportunityDisplaySource = Partial<{
  command_centre_analysis_structured: unknown
  command_centre_analysis_contract: unknown
  command_centre_reuse_contract: unknown
  command_centre_display_summary: unknown
  source_fidelity_status: unknown
  source_fidelity_warnings: unknown
  principal_decision_read: unknown
  decision_memo_trigger: unknown
  pressure_test_prompt: unknown
  reusable_product_insight: unknown
  outcome_atom: unknown
  product_aquarium_packet: unknown
  product_aquarium_vector_text: unknown
  product_aquarium_writeback_status: unknown
  shodhana_product_aquarium_repair_packet: unknown
  shodhana_latest_outcome_atom: unknown
  product_aquarium_repair_outcome_atom: unknown
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
  location: unknown
  city: unknown
  state: unknown
  address: unknown
  country: unknown
  latitude: unknown
  longitude: unknown
  value: unknown
  minimum_investment_display: unknown
  value_original: unknown
  value_native: unknown
  value_currency: unknown
  value_usd: unknown
  minimum_investment_usd: unknown
  source: unknown
  connection_source: unknown
  source_collection: unknown
  _source_collection: unknown
  lineage_source_collection: unknown
  source_surface: unknown
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

const CENTRAL_SUMMARY_PENDING = 'Command Centre summary pending from centralized backend packet.'

const SARASOTA_SOURCE_FIDELITY_SUMMARY =
  'Source fidelity conflict: the source body references 8501 Midnight Pass Road / Crystal Waters in Sarasota at $29,995,000, while the opportunity label references Palm Beach or Aspen. Treat this as validation_gap_due; do not underwrite until the source URL, asset address, comp set, buyer-depth signal, discount path, and downside trigger are re-read from the central Castle brief.'

const inlineReferenceSuffix = (value: unknown): string => {
  const text = asCleanText(value)
  if (!text) return ''
  const match = text.match(/\s(\[(?:\d+|(?:Dev\s*ID|DEVID|Article\s*ID|Source\s*ID|Evidence\s*ID|Route\s*Witness|Witness\s*ID|Pattern\s*ID)\s*[:\-–—][^\]\r\n]+)\])\s*$/i)
  return match?.[1] || ''
}

const hasSarasotaPalmBeachSourceMix = (opp: OpportunityDisplaySource): boolean => {
  const labelText = [
    opp.title,
    opp.name,
    opp.brief_title,
    opp.source_title,
    opp.product,
    opp.location,
    opp.city,
    opp.state,
    opp.address,
    opp.country,
  ].map(asCleanText).join(' ').toLowerCase()
  const bodyText = [
    opp.command_centre_display_summary,
    commandCentreStructuredDisplayText(opp.command_centre_analysis_structured),
    opp.principal_decision_read,
    opp.reusable_product_insight,
    opp.decision_memo_trigger,
    opp.pressure_test_prompt,
    opp.analysis,
    opp.elite_pulse_analysis,
    opp.full_analysis,
    opp.hbyte_summary,
    opp.card_summary,
    opp.summary,
    opp.description,
    opp.source_summary,
    opp.brief_source_text,
    opp.public_mirror_excerpt,
  ].map(asCleanText).join(' ').toLowerCase()
  const allText = `${labelText} ${bodyText}`

  const hasSarasotaAsset =
    bodyText.includes('8501 midnight pass') ||
    bodyText.includes('crystal waters') ||
    bodyText.includes('siesta key') ||
    bodyText.includes('sarasota')
  const hasWrongLane =
    labelText.includes('palm beach') ||
    allText.includes('palm beach trophy homes') ||
    allText.includes('aspen estate auction')

  return hasSarasotaAsset && hasWrongLane
}

export const sanitizeCommandCentreOpportunityDisplaySource = <T extends OpportunityDisplaySource>(
  opp: T,
): T => {
  if (!hasSarasotaPalmBeachSourceMix(opp)) {
    return opp
  }

  const citationSuffix = inlineReferenceSuffix(
    firstText(
      opp.command_centre_display_summary,
      opp.analysis,
      opp.summary,
      opp.description,
      opp.card_summary,
      opp.hbyte_summary,
    ),
  )
  const displaySummary = `${SARASOTA_SOURCE_FIDELITY_SUMMARY}${citationSuffix ? ` ${citationSuffix}` : ''}`

  return {
    ...opp,
    name: 'Sarasota',
    location: 'Sarasota, Florida',
    city: 'Sarasota',
    state: 'Florida',
    country: 'United States',
    latitude: 27.3364,
    longitude: -82.5307,
    command_centre_display_summary: displaySummary,
    principal_decision_read: displaySummary,
    analysis: displaySummary,
    summary: displaySummary,
    description: displaySummary,
    card_summary: displaySummary,
    hbyte_summary: displaySummary,
    source_fidelity_status: 'source_fidelity_due',
    source_fidelity_warnings: [
      'palm_beach_label_mixed_with_sarasota_asset',
      'aspen_label_mixed_with_florida_asset',
    ],
  } as T
}

const isCitationOnlyText = (value: string): boolean => {
  const stripped = value.replace(/\[(?:Dev\s*ID|DEVID|Article\s*ID|Source\s*ID|Evidence\s*ID|Route\s*Witness|Witness\s*ID|Pattern\s*ID)\s*[:\-–—]?\s*[^\]\r\n]+\]/gi, '').trim()
  return stripped.length === 0
}

const titleCaseLabel = (value: string): string => value
  .replace(/_/g, ' ')
  .replace(/\b\w/g, letter => letter.toUpperCase())

const cleanCentralVectorText = (value: unknown): string => {
  const text = asCleanText(value)
  if (!text) return ''

  const segments = text.split('|').map(segment => segment.trim()).filter(Boolean)
  const lines: string[] = []
  const seenLines = new Set<string>()
  const metadataAllowlist = new Set([
    'source_summary',
    'money_anchors',
    'decision_posture',
    'actionability',
    'pattern_memory_status',
    'memory_strength',
  ])

  for (const segment of segments) {
    if (/^https?:\/\//i.test(segment) || isCitationOnlyText(segment)) {
      continue
    }

    const metadataMatch = segment.match(/^([a-z_]+):(.+)$/i)
    let line = segment
    if (metadataMatch) {
      const key = metadataMatch[1]?.trim().toLowerCase()
      const body = metadataMatch[2]?.trim()
      if (!key || !body || !metadataAllowlist.has(key)) {
        continue
      }
      line = `${titleCaseLabel(key)}: ${body}`
    }

    const normalized = line.toLowerCase()
    if (seenLines.has(normalized)) continue
    seenLines.add(normalized)
    lines.push(line)
  }

  // Segment 0 is often the title. Keep the first material read plus evidence
  // metadata, but avoid turning vector text into a full source body.
  return lines.slice(0, 5).join('\n')
}

const INLINE_CITATION_PATTERN =
  /\[(?:Dev\s*ID|DEVID|Article\s*ID|Source\s*ID|Evidence\s*ID|Route\s*Witness|Witness\s*ID|Pattern\s*ID)\s*[:\-–—]\s*[^\]\r\n]+\]/i

export const appendOpportunityCitationText = (
  value: string,
  citationIds: string[],
): string => {
  const text = asCleanText(value)
  if (!text || INLINE_CITATION_PATTERN.test(text)) {
    return text
  }

  const citationId = citationIds.map(asCleanText).find(Boolean)
  return citationId ? `${text} [DEVID: ${citationId}]` : text
}

export const structuredOpportunitySummaryText = (value: unknown): string => {
  if (!value || typeof value !== 'object') {
    return asCleanText(value)
  }

  const record = value as Record<string, unknown>
  const rawLines = [
    cleanCentralVectorText(record.vector_text),
    record.summary_sentence,
    record.summary,
    record.source_summary,
    record.principal_decision_read,
    record.decision_posture,
    record.pattern_memory,
    record.rationale,
    record.reusable_product_insight,
    record.next_action,
    record.decision_memo_trigger,
    record.pressure_test_prompt,
    record.outcome_atom,
    record.evidence_basis ? `Evidence basis: ${asCleanText(record.evidence_basis)}` : '',
  ].map(asCleanText).filter(Boolean)
  const seenLines = new Set<string>()
  const lines = rawLines.filter(line => {
    const key = line.toLowerCase()
    if (seenLines.has(key)) return false
    seenLines.add(key)
    return true
  })

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

const commandCentreStructuredDisplayText = (value: unknown): string => {
  if (!value || typeof value !== 'object') {
    return asCleanText(value)
  }

  const record = value as Record<string, unknown>
  const displaySummary = asCleanText(record.display_summary)
  if (displaySummary) {
    return displaySummary
  }

  const sourceSummary = asCleanText(record.source_summary)
  const fidelityStatus = asCleanText(record.source_fidelity_status)
  const warnings = Array.isArray(record.source_fidelity_warnings)
    ? record.source_fidelity_warnings.map(asCleanText).filter(Boolean)
    : []
  if (sourceSummary && (fidelityStatus === 'source_fidelity_due' || warnings.length > 0)) {
    return `${sourceSummary} Source fidelity due: ${warnings.join(', ') || 'validation_due'}.`
  }

  return firstText(
    sourceSummary,
    record.principal_decision_read,
    record.reusable_product_insight,
  )
}

const centralOpportunityText = (opp: OpportunityDisplaySource): string => firstText(
  opp.command_centre_display_summary,
  commandCentreStructuredDisplayText(opp.command_centre_analysis_structured),
  opp.principal_decision_read,
  opp.reusable_product_insight,
  opp.decision_memo_trigger,
  opp.pressure_test_prompt,
  opp.outcome_atom,
  structuredOpportunitySummaryText(opp.product_aquarium_packet),
  structuredOpportunitySummaryText(opp.shodhana_product_aquarium_repair_packet),
  cleanCentralVectorText(opp.product_aquarium_vector_text),
)

const isCastleBackedCommandCentreRow = (opp: OpportunityDisplaySource): boolean => {
  const markers = [
    opp.connection_source,
    opp.source_collection,
    opp._source_collection,
    opp.lineage_source_collection,
    opp.source_surface,
  ].map(value => asCleanText(value).toLowerCase())

  return Boolean(
    opp.castle_source_summary ||
    opp.castle_source_summary_structured ||
    opp.castle_brief ||
    opp.castle_brief_enriched ||
    opp.full_castle_brief ||
    markers.some(marker => marker.includes('castle')),
  )
}

const legacyNonCastleOpportunityText = (opp: OpportunityDisplaySource): string => firstText(
  opp.analysis,
  opp.elite_pulse_analysis,
  opp.full_analysis,
  opp.hbyte_summary,
  opp.card_summary,
  opp.summary,
  opp.source_summary,
  structuredOpportunitySummaryText(opp.source_summary_structured),
  opp.description,
  opp.public_mirror_excerpt,
)

// Visible map analysis should stay on Command Centre display fields. Castle
// bodies are evidence/source material and are intentionally not promoted here.
export const resolveOpportunityAnalysisText = (opp: OpportunityDisplaySource): string => {
  const displayOpp = sanitizeCommandCentreOpportunityDisplaySource(opp)
  return centralOpportunityText(displayOpp) ||
    (isCastleBackedCommandCentreRow(displayOpp) ? CENTRAL_SUMMARY_PENDING : legacyNonCastleOpportunityText(displayOpp))
}

export const resolveOpportunitySummaryText = (
  opp: OpportunityDisplaySource,
  analysisText: string,
): string => {
  const displayOpp = sanitizeCommandCentreOpportunityDisplaySource(opp)
  return centralOpportunityText(displayOpp) ||
  (isCastleBackedCommandCentreRow(displayOpp) ? CENTRAL_SUMMARY_PENDING : firstText(
    displayOpp.card_summary,
    displayOpp.hbyte_summary,
    displayOpp.summary,
    displayOpp.source_summary,
    structuredOpportunitySummaryText(displayOpp.source_summary_structured),
    displayOpp.description,
    displayOpp.public_mirror_excerpt,
    analysisText,
  ))
}

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
