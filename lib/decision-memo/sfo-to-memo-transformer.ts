// lib/decision-memo/sfo-to-memo-transformer.ts
// Transforms SFO Pattern Audit artifact data into DecisionMemoData format
// This allows reusing the premium simulation UI components

import { DecisionMemoData, Mistake, Opportunity } from './memo-types';
import { ICArtifact } from './pattern-audit-types';

interface SFOArtifact {
  thesis_summary?: string;
  verdict?: {
    verdict: string;
    single_sentence: string;
    thesis_survives: boolean;
  };
  sequence?: Array<{
    order: number;
    action: string;
    owner: string;
    timeline: string;
    why_this_order: string;
  }>;
  failure_modes?: Array<{
    trigger: string;
    mechanism: string;
    damage: string;
    mitigation: string;
    category?: string;
  }>;
  pattern_anchors?: Array<{
    pattern_name: string;
    pattern_class: string;
    historical_behavior: string;
    confidence: string;
  }>;
  next_step?: {
    action: string;
    executor: string;
    timeline: string;
    unlocks: string;
    if_blocked: string;
  };
  scope?: {
    in_scope: string[];
    out_of_scope: string[];
    valid_until: string;
  };
  intelligence_sources?: {
    precedents_reviewed: number;
    sequence_corrections: number;
    failure_modes: number;
    regulatory_anchors: number;
  };
  // New SOTA components
  deal_overview?: {
    move_type: string;
    target_size: string;
    jurisdictions: string;
    timeline: string;
    risk_pool: string;
    financing: string;
    hold_period: string;
  };
  investment_thesis?: {
    why_makes_sense: string[];
    hidden_risks: string[];
  };
  rich_verdict?: {
    what_they_think_safe: string;
    what_is_fragile: string;
    why_fragile: string;
    consequence_if_unchanged: string;
    correct_sequence: string;
  };
  stop_list?: Array<{
    number: number;
    stop_action: string;
    until_condition: string;
  }>;
  alternatives_considered?: Array<{
    alternative: string;
    why_not_selected: string;
    comparative_metrics: Record<string, any>;
  }>;
  dd_checklist?: {
    total_items: number;
    items: Array<{
      category: string;
      item: string;
      status: string;
      priority: string;
    }>;
  };
  matched_opportunities?: Array<{
    title: string;
    why_relevant: string;
  }>;
  implied_ips?: {
    primary_objective: string;
    risk_tolerance: string;
    liquidity_horizon: string;
    investment_horizon: string;
    decision_authority: string;
    confidence_score: number;
    tax_jurisdictions?: string[];
    geographic_targets?: Record<string, string>;
  };
  return_scenarios?: {
    base_case: { probability: number; annual_return_pct: string };
    bull_case: { probability: number; annual_return_pct: string };
    bear_case: { probability: number; annual_return_pct: string };
    expected_value: string;
    risk_reward_assessment: string;
  };
}

/**
 * Parse jurisdiction from deal_overview and implied_ips
 * Handles: "India → UAE", "United States", or extracts from tax_jurisdictions
 */
function parseJurisdictions(
  jurisdictions: string,
  impliedIps?: {
    tax_jurisdictions?: string[];
    geographic_targets?: Record<string, string>;
  }
): { source: string; destination: string } {
  // First try arrow format: "India → UAE"
  if (jurisdictions?.includes('→')) {
    const parts = jurisdictions.split('→').map(s => s.trim());
    if (parts.length === 2) {
      return { source: parts[0], destination: parts[1] };
    }
  }

  // Try " to " format: "India to UAE"
  if (jurisdictions?.includes(' to ')) {
    const altParts = jurisdictions.split(' to ').map(s => s.trim());
    if (altParts.length === 2) {
      return { source: altParts[0], destination: altParts[1] };
    }
  }

  // Use implied_ips.tax_jurisdictions if available
  // First entry is typically source country, subsequent entries are targets
  const taxJurisdictions = impliedIps?.tax_jurisdictions || [];
  const geoTargets = Object.keys(impliedIps?.geographic_targets || {});

  if (taxJurisdictions.length >= 2) {
    // For domestic moves: ["United States", "Florida", "Miami"] -> US, Florida
    // For international: ["India", "Singapore"] -> India, Singapore
    const source = taxJurisdictions[0];
    // Find first target that's different from source (could be state/city or country)
    const destination = taxJurisdictions.find(j => j !== source) || taxJurisdictions[1];
    return { source, destination };
  }

  if (geoTargets.length >= 2) {
    // Use geographic targets as fallback
    const source = geoTargets[0];
    const destination = geoTargets.find(j => j !== source && j !== 'Other') || geoTargets[1];
    return { source, destination };
  }

  // Single jurisdiction - same source and destination (domestic investment)
  if (jurisdictions && jurisdictions !== 'target market') {
    return { source: jurisdictions, destination: jurisdictions };
  }

  // NO FALLBACK - show "—" when data is unavailable
  return { source: '—', destination: '—' };
}

/**
 * Calculate total savings from investment thesis
 * NO FALLBACK: Returns '—' if no real data available
 */
function calculateSavings(artifact: SFOArtifact): string {
  // Extract potential cost from failure modes
  let totalCost = 0;
  artifact.failure_modes?.forEach(mode => {
    const match = mode.damage.match(/\$?([\d.]+)([MK]?)/i);
    if (match) {
      let val = parseFloat(match[1]);
      if (match[2]?.toUpperCase() === 'M') val *= 1000000;
      if (match[2]?.toUpperCase() === 'K') val *= 1000;
      totalCost += val;
    }
  });

  // NO FALLBACK - if no real costs found, show placeholder
  if (totalCost === 0) {
    return '—';
  }

  // Always format as $XM for consistency
  if (totalCost >= 1000000) {
    return `$${(totalCost / 1000000).toFixed(1)}M`;
  } else if (totalCost >= 100000) {
    return `$${(totalCost / 1000).toFixed(0)}K`;
  } else if (totalCost >= 1000) {
    return `$${(totalCost / 1000).toFixed(1)}K`;
  }
  // For values under 1000, still show as K to maintain scale expectation
  return `$${(totalCost / 1000).toFixed(2)}K`;
}

/**
 * Determine exposure class from investment profile
 */
function determineExposureClass(artifact: SFOArtifact): string {
  const targetSize = artifact.deal_overview?.target_size || '';
  const riskPool = artifact.deal_overview?.risk_pool || '';

  if (targetSize.includes('10M') || targetSize.includes('$10M+')) {
    return 'Global Strategist';
  } else if (targetSize.includes('5M') || targetSize.includes('$5M')) {
    return 'Cross-Border Navigator';
  } else if (targetSize.includes('1M') || targetSize.includes('$1M')) {
    return 'Regional Optimizer';
  } else if (riskPool.includes('Aspirational')) {
    return 'Growth Architect';
  }
  return 'Strategic Migrant';
}

/**
 * Transform failure modes to mistakes format
 */
function transformFailureModesToMistakes(artifact: SFOArtifact): Mistake[] {
  const mistakes: Mistake[] = [];

  // Add failure modes as high-priority mistakes
  artifact.failure_modes?.forEach((mode, index) => {
    mistakes.push({
      title: mode.trigger,
      cost: mode.damage,
      urgency: mode.category?.includes('GOVERNANCE') ? 'Critical' : 'High',
      fix: mode.mitigation
    });
  });

  // Add hidden risks as medium-priority items
  // NO PLACEHOLDER COSTS - use actual data or show "—"
  artifact.investment_thesis?.hidden_risks?.forEach((risk, index) => {
    if (!mistakes.find(m => m.title.includes(risk.split(':')[0]))) {
      mistakes.push({
        title: risk.split(':')[0] || risk.substring(0, 50),
        cost: '—',  // No fake placeholder costs
        urgency: 'Medium',
        fix: risk.split(':')[1]?.trim() || 'Implement risk mitigation protocol'
      });
    }
  });

  return mistakes.slice(0, 6); // Limit to 6 items for UI
}

/**
 * Get coordinates for a jurisdiction/location
 */
function getJurisdictionCoordinates(jurisdiction: string): { lat: number; lng: number } {
  const coords: Record<string, { lat: number; lng: number }> = {
    // Major US states/cities
    'United States': { lat: 38.9072, lng: -77.0369 }, // DC
    'USA': { lat: 38.9072, lng: -77.0369 },
    'US': { lat: 38.9072, lng: -77.0369 },
    'Florida': { lat: 27.9944, lng: -81.7603 },
    'Miami': { lat: 25.7617, lng: -80.1918 },
    'New York': { lat: 40.7128, lng: -74.0060 },
    'California': { lat: 36.7783, lng: -119.4179 },
    'Texas': { lat: 31.9686, lng: -99.9018 },
    'Delaware': { lat: 38.9108, lng: -75.5277 },

    // International financial hubs
    'Dubai': { lat: 25.2048, lng: 55.2708 },
    'UAE': { lat: 25.2048, lng: 55.2708 },
    'United Arab Emirates': { lat: 25.2048, lng: 55.2708 },
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'Hong Kong': { lat: 22.3193, lng: 114.1694 },
    'Switzerland': { lat: 46.8182, lng: 8.2275 },
    'Zurich': { lat: 47.3769, lng: 8.5417 },
    'Luxembourg': { lat: 49.8153, lng: 6.1296 },
    'Monaco': { lat: 43.7384, lng: 7.4246 },
    'Cayman Islands': { lat: 19.3133, lng: -81.2546 },
    'British Virgin Islands': { lat: 18.4207, lng: -64.6400 },
    'BVI': { lat: 18.4207, lng: -64.6400 },
    'Jersey': { lat: 49.2144, lng: -2.1312 },
    'Isle of Man': { lat: 54.2361, lng: -4.5481 },

    // Major countries
    'India': { lat: 20.5937, lng: 78.9629 },
    'United Kingdom': { lat: 51.5074, lng: -0.1278 },
    'UK': { lat: 51.5074, lng: -0.1278 },
    'London': { lat: 51.5074, lng: -0.1278 },
    'France': { lat: 48.8566, lng: 2.3522 },
    'Germany': { lat: 52.5200, lng: 13.4050 },
    'Canada': { lat: 45.4215, lng: -75.6972 },
    'Australia': { lat: -33.8688, lng: 151.2093 },
    'Japan': { lat: 35.6762, lng: 139.6503 },
    'China': { lat: 39.9042, lng: 116.4074 },
    'Portugal': { lat: 38.7223, lng: -9.1393 },
    'Thailand': { lat: 13.7563, lng: 100.5018 },
    'Malaysia': { lat: 3.1390, lng: 101.6869 },
    'Indonesia': { lat: -6.2088, lng: 106.8456 }
  };

  // Normalize jurisdiction name
  const normalized = jurisdiction.trim();
  return coords[normalized] || coords['United States']; // Default to US
}

/**
 * Transform pattern anchors to opportunities format
 */
function transformPatternAnchorsToOpportunities(artifact: SFOArtifact): Opportunity[] {
  const opportunities: Opportunity[] = [];
  const { source, destination } = parseJurisdictions(
    artifact.deal_overview?.jurisdictions || '',
    artifact.implied_ips
  );

  const destCoords = getJurisdictionCoordinates(destination);

  // Add pattern anchors as opportunities
  artifact.pattern_anchors?.forEach((anchor, index) => {
    const confidence = anchor.confidence === 'CRITICAL' ? 95
      : anchor.confidence === 'HIGH' ? 85
      : anchor.confidence === 'MEDIUM' ? 70
      : 60;

    opportunities.push({
      title: anchor.pattern_name,
      location: destination,
      country: destination,
      category: anchor.pattern_class,
      industry: 'Wealth Structuring',
      tier: anchor.confidence === 'CRITICAL' ? '$1M Tier' : '$500K Tier',
      expected_return: anchor.historical_behavior.substring(0, 100) + '...',
      dev_id: `PATTERN_${index + 1}`,
      dna_match_score: confidence,
      latitude: destCoords.lat,
      longitude: destCoords.lng
    });
  });

  // Add matched opportunities if available
  artifact.matched_opportunities?.forEach((opp, index) => {
    opportunities.push({
      title: opp.title,
      location: destination,
      country: destination,
      category: 'Matched Opportunity',
      industry: 'Investment',
      tier: '$500K Tier',
      expected_return: opp.why_relevant,
      dev_id: `MATCHED_${index + 1}`,
      dna_match_score: 80,
      latitude: destCoords.lat,
      longitude: destCoords.lng
    });
  });

  return opportunities;
}

/**
 * Build memo text from rich verdict and other components
 */
function buildMemoText(artifact: SFOArtifact): string {
  const rv = artifact.rich_verdict;
  const thesis = artifact.investment_thesis;
  const stopList = artifact.stop_list;

  let memo = '# EXECUTIVE VERDICT\n\n';

  if (rv) {
    memo += `## What You Think Is Safe\n${rv.what_they_think_safe}\n\n`;
    memo += `## What Is Actually Fragile\n${rv.what_is_fragile}\n\n`;
    memo += `## Why\n${rv.why_fragile}\n\n`;
    memo += `## Consequence If Unchanged\n${rv.consequence_if_unchanged}\n\n`;
    memo += `## Correct Sequence\n${rv.correct_sequence}\n\n`;
  }

  if (thesis) {
    memo += '# INVESTMENT THESIS\n\n';
    memo += '## Why This Makes Sense\n';
    thesis.why_makes_sense?.forEach(reason => {
      memo += `- ${reason}\n`;
    });
    memo += '\n## Hidden Risks\n';
    thesis.hidden_risks?.forEach(risk => {
      memo += `- ${risk}\n`;
    });
    memo += '\n';
  }

  if (stopList && stopList.length > 0) {
    memo += '# STOP LIST\n\n';
    stopList.forEach(item => {
      memo += `**${item.number}. ${item.stop_action}**\nUntil: ${item.until_condition}\n\n`;
    });
  }

  return memo;
}

/**
 * Main transformer function
 */
export function transformSFOToMemoData(
  artifact: SFOArtifact,
  intakeId: string,
  generatedAt?: string
): DecisionMemoData {
  const { source, destination } = parseJurisdictions(
    artifact.deal_overview?.jurisdictions || '',
    artifact.implied_ips
  );
  const mistakes = transformFailureModesToMistakes(artifact);
  const opportunities = transformPatternAnchorsToOpportunities(artifact);

  return {
    success: true,
    intake_id: intakeId,
    generated_at: generatedAt || new Date().toISOString(),

    preview_data: {
      // Core metrics
      total_savings: calculateSavings(artifact),
      exposure_class: determineExposureClass(artifact),
      opportunities_count: opportunities.length,
      mistakes_count: mistakes.length,
      intelligence_count: artifact.intelligence_sources?.precedents_reviewed || 0,

      // Detailed data for Page2 and Page3
      all_mistakes: mistakes,
      all_opportunities: opportunities,
      all_intelligence: [],

      // Jurisdiction data for Page1
      source_jurisdiction: source,
      destination_jurisdiction: destination,

      // Rich verdict data
      rich_verdict: artifact.rich_verdict,

      // Executive verdict
      executive_verdict: artifact.verdict?.single_sentence || artifact.thesis_summary || '',

      // Sequence data for timeline
      execution_sequence: artifact.sequence || [],

      // Stop list
      stop_list: artifact.stop_list || [],

      // Investment thesis
      investment_thesis: artifact.investment_thesis,

      // DD Checklist
      dd_checklist: artifact.dd_checklist,

      // Return scenarios
      return_scenarios: artifact.return_scenarios,

      // Deal overview
      deal_overview: artifact.deal_overview
    },

    memo_data: {
      memo_text: buildMemoText(artifact),
      evidence_anchors: artifact.pattern_anchors?.map(anchor => ({
        dev_id: `PATTERN_${anchor.pattern_name.replace(/\s+/g, '_')}`,
        title: anchor.pattern_name,
        exit_complexity: anchor.pattern_class,
        liquidity_horizon: anchor.confidence
      })) || [],
      kgv3_intelligence_used: {
        precedents: artifact.intelligence_sources?.precedents_reviewed || 0,
        failure_modes: artifact.intelligence_sources?.failure_modes || 0,
        sequencing_rules: artifact.intelligence_sources?.sequence_corrections || 0,
        jurisdictions: 3
      },
      generated_at: generatedAt || new Date().toISOString()
    },

    full_memo_url: `/api/decision-memo/download/${intakeId}`
  };
}

/**
 * Transform ICArtifact (frontend format) to memo data
 */
export function transformICArtifactToMemoData(
  artifact: ICArtifact,
  intakeId: string
): DecisionMemoData {
  // Convert ICArtifact to SFOArtifact format
  const sfoArtifact: SFOArtifact = {
    thesis_summary: artifact.thesisSummary,
    verdict: {
      verdict: artifact.verdict.verdict,
      single_sentence: artifact.verdict.singleSentence,
      thesis_survives: artifact.verdict.thesisSurvives
    },
    sequence: artifact.sequence.map((step, i) => ({
      order: step.order,
      action: step.action,
      owner: step.owner,
      timeline: step.timeline || '',
      why_this_order: step.whyThisOrder || ''
    })),
    failure_modes: artifact.failureModes.map(mode => ({
      trigger: mode.trigger,
      mechanism: mode.mechanism,
      damage: mode.damage,
      mitigation: mode.mitigation,
      category: (mode as any).category || 'ECONOMIC' // Backend may include category
    })),
    pattern_anchors: artifact.patternAnchors.map(anchor => ({
      pattern_name: anchor.patternName,
      pattern_class: anchor.patternClass,
      historical_behavior: anchor.historicalBehavior,
      confidence: anchor.confidence
    })),
    next_step: artifact.nextStep ? {
      action: artifact.nextStep.action,
      executor: artifact.nextStep.executor,
      timeline: artifact.nextStep.timeline,
      unlocks: artifact.nextStep.unlocks,
      if_blocked: artifact.nextStep.ifBlocked
    } : undefined,
    scope: artifact.scope ? {
      in_scope: artifact.scope.inScope,
      out_of_scope: artifact.scope.outOfScope,
      valid_until: artifact.scope.validUntil
    } : undefined,
    intelligence_sources: {
      precedents_reviewed: artifact.intelligenceSources?.developmentsMatched || 0,
      sequence_corrections: artifact.intelligenceSources?.sequencingRulesApplied || 0,
      failure_modes: artifact.intelligenceSources?.failurePatternsMatched || 0,
      regulatory_anchors: (artifact.intelligenceSources as any)?.regulatoryAnchors || 0
    },
    // Add SOTA components - convert camelCase back to snake_case for SFOArtifact
    deal_overview: (artifact as any).dealOverview ? {
      move_type: (artifact as any).dealOverview.moveType || '',
      target_size: (artifact as any).dealOverview.targetSize || '',
      jurisdictions: (artifact as any).dealOverview.jurisdictions || '',
      timeline: (artifact as any).dealOverview.timeline || '',
      risk_pool: (artifact as any).dealOverview.riskPool || '',
      financing: (artifact as any).dealOverview.financing || '',
      hold_period: (artifact as any).dealOverview.holdPeriod || ''
    } : undefined,
    investment_thesis: (artifact as any).investmentThesis ? {
      why_makes_sense: (artifact as any).investmentThesis.whyMakesSense || [],
      hidden_risks: (artifact as any).investmentThesis.hiddenRisks || []
    } : undefined,
    rich_verdict: (artifact as any).richVerdict ? {
      what_they_think_safe: (artifact as any).richVerdict.whatTheyThinkSafe || '',
      what_is_fragile: (artifact as any).richVerdict.whatIsFragile || '',
      why_fragile: (artifact as any).richVerdict.whyFragile || '',
      consequence_if_unchanged: (artifact as any).richVerdict.consequenceIfUnchanged || '',
      correct_sequence: (artifact as any).richVerdict.correctSequence || ''
    } : undefined,
    stop_list: ((artifact as any).stopList || []).map((item: any) => ({
      number: item.number || 0,
      stop_action: item.stopAction || '',
      until_condition: item.untilCondition || ''
    })),
    alternatives_considered: (artifact as any).alternativesConsidered,
    dd_checklist: (artifact as any).ddChecklist ? {
      total_items: (artifact as any).ddChecklist.totalItems || 0,
      items: ((artifact as any).ddChecklist.items || []).map((item: any) => ({
        category: item.category || '',
        item: item.item || '',
        status: item.status || 'pending',
        priority: item.priority || 'medium'
      }))
    } : undefined,
    matched_opportunities: (artifact as any).matchedOpportunities,
    return_scenarios: (artifact as any).returnScenarios,
    // Also add impliedIps for jurisdiction extraction
    implied_ips: (artifact as any).impliedIps ? {
      primary_objective: (artifact as any).impliedIps.primaryObjective || '',
      risk_tolerance: (artifact as any).impliedIps.riskTolerance || '',
      liquidity_horizon: (artifact as any).impliedIps.liquidityHorizon || '',
      investment_horizon: (artifact as any).impliedIps.investmentHorizon || '',
      decision_authority: (artifact as any).impliedIps.decisionAuthority || '',
      confidence_score: (artifact as any).impliedIps.confidenceScore || 0,
      tax_jurisdictions: (artifact as any).impliedIps.taxJurisdictions || [],
      geographic_targets: (artifact as any).impliedIps.geographicTargets || {}
    } : undefined
  };

  return transformSFOToMemoData(sfoArtifact, intakeId, artifact.generatedAt);
}
