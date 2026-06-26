import type {
  ReleaseReadinessShareCard,
  ReleaseReadinessSharePayload,
  ReleaseReadinessShareReportSection,
} from '@/lib/decision-memo/build-release-readiness-share-surface';
import {
  buildRouteScopedDecisionMemoSurface,
  type RouteIntelligenceOptionV2,
  type RouteIntelligenceV2,
} from '@/lib/decision-memo/route-intelligence-v2';

type RecordLike = Record<string, any>;

type PublicLinearMemoSeed = {
  memoData: RecordLike;
  backendData: RecordLike;
  fullArtifact: RecordLike;
};

function cleanText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\bRelease Differently\b/gi, 'Approved to negotiate under signed gates; no capital release')
    .replace(/\bGated negotiation only only\b/gi, 'Approved to negotiate under signed gates; no capital release')
    .replace(/\bGated negotiation only\b/gi, 'Approved to negotiate under signed gates; no capital release')
    .replace(/\bproceed[-\s]modified\b/gi, 'Proceed under signed gates')
    .replace(/\bExpected value creation\b/gi, 'Scenario discipline output')
    .replace(/\bExpected Net Worth\b/gi, 'Scenario net position')
    .replace(/\bNet Benefit\b/gi, 'Route discipline read')
    .replace(/\bcompiler internals\b/gi, 'private build details')
    .replace(/\bAI\b/g, 'source-wealth concentration')
    .replace(/\bfallback\b/gi, 'alternate')
    .replace(/\s+/g, ' ')
    .trim();
}

function numberValue(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function money(value: unknown): string {
  const numeric = numberValue(value);
  if (numeric <= 0) return '';
  const absolute = Math.abs(numeric);
  const sign = numeric < 0 ? '-' : '';
  if (absolute >= 1_000_000) return `${sign}~US$${(absolute / 1_000_000).toFixed(1)}M`;
  if (absolute >= 1_000) return `${sign}~US$${Math.round(absolute / 1_000).toLocaleString('en-US')}K`;
  return `${sign}~US$${Math.round(absolute).toLocaleString('en-US')}`;
}

function reportSection(
  payload: ReleaseReadinessSharePayload,
  ...ids: string[]
): ReleaseReadinessShareReportSection | undefined {
  const wanted = new Set(ids.map((id) => id.toLowerCase()));
  return payload.reportSections.find((section) => wanted.has(String(section.id).toLowerCase()));
}

function reportRows(section: ReleaseReadinessShareReportSection | undefined, limit?: number): string[][] {
  const rows = section?.table?.rows ?? [];
  return typeof limit === 'number' ? rows.slice(0, limit) : rows;
}

function reportCard(
  section: ReleaseReadinessShareReportSection | undefined,
  labelNeedle: string,
): ReleaseReadinessShareCard | undefined {
  const needle = labelNeedle.toLowerCase();
  return section?.cards?.find((card) => cleanText(card.label).toLowerCase().includes(needle));
}

function cardValue(
  section: ReleaseReadinessShareReportSection | undefined,
  labelNeedle: string,
  fallback = 'Signed gate controls release',
): string {
  const card = reportCard(section, labelNeedle);
  return cleanText(card?.value || card?.title || fallback);
}

function cardNote(
  section: ReleaseReadinessShareReportSection | undefined,
  labelNeedle: string,
  fallback = '',
): string {
  const card = reportCard(section, labelNeedle);
  return cleanText(card?.body || fallback);
}

function uniqueRows(rows: string[][], limit?: number): string[][] {
  const seen = new Set<string>();
  const output: string[][] = [];
  for (const row of rows) {
    const key = row.map((cell) => cleanText(cell)).join('|');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(row);
    if (limit && output.length >= limit) break;
  }
  return output;
}

function rowsToObjects(rows: string[][], keys: string[]): Record<string, string>[] {
  return rows.map((row) => Object.fromEntries(keys.map((key, index) => [key, cleanText(row[index] || '')])));
}

function corridorParts(payload: ReleaseReadinessSharePayload): [string, string] {
  const corridor = cleanText(payload.corridor || payload.routeIntelligenceV2?.corridor || '');
  const parts = corridor.split(/\s*->\s*/).map((part) => part.trim()).filter(Boolean);
  return [parts[0] || 'Source jurisdiction', parts[1] || 'Destination jurisdiction'];
}

function routeOptionsForMemo(route: RouteIntelligenceV2): RouteIntelligenceOptionV2[] {
  return route.pressureVariants?.length ? route.pressureVariants : route.routeOptions;
}

function selectedRouteMetrics(
  payload: ReleaseReadinessSharePayload,
  selectedRoute?: RouteIntelligenceOptionV2,
): RecordLike {
  return ((selectedRoute as any)?.metrics ?? (payload.selectedRoute as any)?.metrics ?? {}) as RecordLike;
}

function buildPublicLinearMemoSeed(
  payload: ReleaseReadinessSharePayload,
  selectedRouteOverride?: RouteIntelligenceOptionV2,
): PublicLinearMemoSeed {
  const [sourceJurisdiction, destinationJurisdiction] = corridorParts(payload);
  const route = payload.routeIntelligenceV2;
  const selectedRoute = (selectedRouteOverride ?? payload.selectedRoute) as unknown as RouteIntelligenceOptionV2;
  const metrics = selectedRouteMetrics(payload, selectedRoute);
  const selectedRouteName = cleanText(selectedRoute?.routeName || payload.selectedRoute.routeName);
  const selectedRouteType = cleanText(selectedRoute?.routeType || payload.selectedRoute.routeType);
  const selectedRouteDecision = cleanText(selectedRoute?.verdict || payload.decision);
  const selectedRouteReleaseRule = cleanText(
    selectedRoute?.releaseRule ||
      selectedRoute?.releaseEffect ||
      payload.releaseRule,
  );
  const selectedRouteRationale = cleanText(
    selectedRoute?.releaseEffect ||
      selectedRoute?.failureMode ||
      payload.rationale ||
      selectedRouteReleaseRule,
  );
  const selectedRoutePurpose = cleanText(selectedRoute?.bestUse || payload.purpose);
  const inputFrame = reportSection(payload, 'input-frame');
  const taxSection = reportSection(payload, 'tax-legal-route-readiness');
  const capitalSection = reportSection(payload, 'capital-exposure-proof');
  const marketSection = reportSection(payload, 'market-intelligence');
  const continuitySection = reportSection(payload, 'g1-g2-g3-continuity', 'generation_to_generation-continuity');
  const crisisSection = reportSection(payload, 'crisis-resilience');
  const antiFragilitySection = reportSection(payload, 'anti-fragility');
  const responsibilitySection = reportSection(payload, 'responsibility-transfer');
  const recordMismatchSection = reportSection(payload, 'record-mismatch');
  const counselSection = reportSection(payload, 'counsel-operator-questions');
  const roadmapSection = reportSection(payload, 'implementation-roadmap');
  const spine = (route.routeMemoSpine ?? {}) as RecordLike;
  const gateStandards = (spine.gateStandards ?? {}) as RecordLike;
  const operationalChain = (spine.operationalChain ?? {}) as RecordLike;
  const familyReadiness = (spine.familyReadiness ?? {}) as RecordLike;
  const crisisContinuity = (spine.crisisAndContinuity ?? {}) as RecordLike;
  const roadmapRows = uniqueRows(reportRows(roadmapSection), 12);
  const responsibilityRows = uniqueRows(reportRows(responsibilitySection), 10);
  const mismatchRows = uniqueRows(reportRows(recordMismatchSection), 10);
  const counselRows = uniqueRows(reportRows(counselSection), 12);
  const continuityRows = uniqueRows(reportRows(continuitySection), 10);
  const crisisRows = uniqueRows(reportRows(crisisSection), 10);
  const antiFragilityRows = uniqueRows(reportRows(antiFragilitySection), 10);
  const sourceValue = money(metrics.propertyValueUsd);
  const dutyValue = money(metrics.totalDutiesUsd);
  const allInValue = money(metrics.totalAcquisitionCostUsd);
  const annualCarry = money(metrics.annualCarryingCostUsd);
  const generatedAt = (payload as { generatedAt?: string }).generatedAt || new Date().toISOString();

  const previewData = {
    source_jurisdiction: sourceJurisdiction,
    destination_jurisdiction: destinationJurisdiction,
    exposure_class: selectedRouteType,
    verdict: selectedRouteDecision,
    risk_level: cleanText(payload.riskLevel || 'Evidence-gated release'),
    data_quality: 'Public release-readiness snapshot',
    data_quality_note: 'Built from the published compact read model; private source files remain gate-controlled.',
    total_savings: allInValue || dutyValue,
    route_intelligence_v2: route,
    zero_trust_move_intake: payload.user_inputs,
    executive_summary: {
      headline_metric: {
        label: 'Selected route all-in outlay',
        value: allInValue || 'Signed gate controls release',
        description: selectedRouteRationale,
      },
      evidence_basis_note: 'Public claims source-backed; private release evidence remains gate-controlled.',
    },
    input_snapshot: {
      house_standard_intake: {
        live_move_the_room_does_not_fully_trust_yet: cleanText(payload.move),
        current_substitute_story: cleanText(inputFrame?.intro || selectedRoutePurpose),
        house_relief_to_be_earned: [selectedRouteReleaseRule],
        what_cannot_fail: payload.holdConditions?.slice(0, 4) ?? [],
        trust_gap_signals: payload.stopConditions?.slice(0, 4) ?? [],
      },
      mandate: {
        move_description: cleanText(payload.move),
        expected_outcome: selectedRouteDecision,
        target_locations: [destinationJurisdiction],
      },
      constraints: {
        decision_window_days: 7,
        selected_route: selectedRouteName,
        capital_rule: cleanText(payload.capitalRule),
      },
      decision_rails: {
        advisors: ['UK tax counsel', 'UK property counsel', 'bank rail owner', 'family office operator / CFO'],
        heirs: ['G1 principal', 'G2 named family user', 'G2 fairness owner', 'G3 next-generation record'],
      },
    },
    house_grade_memo: {
      decision_signal: {
        value: selectedRouteDecision,
        rationale: selectedRouteRationale,
        release_rule: selectedRouteReleaseRule,
      },
      corrected_thesis: {
        room_believed: cleanText(inputFrame?.intro || 'The room was evaluating the move through market attractiveness and family-use logic.'),
        actual_truth: cleanText(`${selectedRouteDecision}. ${selectedRouteReleaseRule}`),
        what_changed: 'Route selection, capital release, tax, title, source, bank rails, authority, continuity, and decision memory are governed together.',
      },
      house_mandate_at_risk: {
        headline: selectedRoutePurpose,
        items: [
          selectedRoutePurpose,
          cleanText(payload.capitalRule),
          selectedRouteReleaseRule,
        ].filter(Boolean),
      },
      route_architecture: {
        items: payload.routeOptions.map((option) => ({
          label: cleanText(option.routeName),
          value: cleanText(option.releaseRule),
          detail: cleanText(option.bestUse || option.verdict),
        })),
      },
      economic_and_capital_proof: {
        transaction_value: sourceValue || cardValue(capitalSection, 'transaction', 'Gate mapped'),
        capital_deployed: allInValue || cardValue(capitalSection, 'all-in', 'Signed gate controls release'),
        day_one_loss: dutyValue || cardValue(capitalSection, 'duty', 'Signed gate controls release'),
        net_yield: annualCarry ? `-${annualCarry} annual carry` : 'Use-led carry model',
        appreciation_basis: cardNote(marketSection, 'market', 'Not relied on for release'),
        drawdown_floor: cardValue(crisisSection, 'resilience', 'Release-critical'),
      },
      decision_requirements: {
        must_be_true: payload.advanceConditions?.slice(0, 6) ?? [],
        stop_conditions: payload.stopConditions?.slice(0, 6) ?? [],
        can_be_carried_next: payload.holdConditions?.slice(0, 6) ?? [],
      },
      family_office_action_path: {
        day_7: payload.advanceConditions?.slice(0, 3) ?? [],
        day_30: payload.holdConditions?.slice(0, 3) ?? [],
        day_90: ['Write the route lesson and decision memory back into the family-office record.'],
      },
      continuity_and_g1_g2_g3_consequence: {
        items: continuitySection?.cards?.map((card) => ({
          label: cleanText(card.label),
          value: cleanText(card.title || card.value),
          detail: cleanText(card.body),
        })) ?? [],
        succession_layer_map: rowsToObjects(continuityRows, ['layer', 'loss_if_unfixed', 'owner', 'release_lock']),
      },
      evidence_status: {
        validated_core: ['Selected route, public source register, duty/capital read, and release conditions are present in the published read model.'],
        modeled_core: ['Private bank, source, title, tax, and family-authority files remain signed-gate evidence.'],
        adjacent_intelligence: payload.methodDrivers.slice(0, 4).map((driver) => cleanText(driver.title)),
        blocked_unknown: payload.privateEvidence.slice(0, 4).map((item) => cleanText(item.label || item.decisionUse)),
      },
    },
    cross_border_audit_summary: {
      executive_summary: cleanText(taxSection?.intro || 'The selected route is modeled for release readiness; counsel sign-off controls release.'),
      acquisition_audit: {
        property_value_usd: numberValue(metrics.propertyValueUsd),
        property_value_formatted: sourceValue,
        total_stamp_duties_usd: numberValue(metrics.totalDutiesUsd),
        total_stamp_duties_formatted: dutyValue,
        total_acquisition_cost_usd: numberValue(metrics.totalAcquisitionCostUsd),
        total_acquisition_cost_formatted: allInValue,
        day_one_loss_amount_formatted: dutyValue,
        primary_fee_label: 'SDLT',
        secondary_fee_label: 'Non-resident / additional-dwelling surcharge',
        buyer_category: selectedRouteName,
        route_name: selectedRouteName,
        route_type: selectedRouteType,
      },
    },
    capital_flow_data: spine.capitalFlow ?? {},
    mechanical_control_test: spine.mechanicalControl ?? {},
    operational_chain_readiness: operationalChain.readiness ?? {},
    information_flow_dashboard: operationalChain.informationFlow ?? [],
    responsibility_transfer_matrix: responsibilityRows.length
      ? rowsToObjects(responsibilityRows, ['action', 'primaryOwner', 'fallbackOwner', 'releaseCondition'])
      : operationalChain.responsibilityTransfer ?? [],
    record_mismatch_map: {
      matrix: mismatchRows.length
        ? rowsToObjects(mismatchRows, ['record', 'currentRead', 'targetRead', 'releaseStatus'])
        : operationalChain.recordMismatch ?? [],
    },
    authority_and_veto_matrix: familyReadiness.authorityAndVeto ?? {},
    family_consequence_register: familyReadiness.consequences ?? [],
    programmatic_dd_checklist: spine.dueDiligenceChecklist ?? [],
    execution_sequence: roadmapRows.length
      ? rowsToObjects(roadmapRows, ['step', 'action', 'owner', 'releaseGate'])
      : gateStandards.executionSequence ?? [],
    scenario_tree_data: {
      critical_gates: gateStandards.criticalGates ?? [],
      abort_triggers: gateStandards.abortTriggers ?? [],
      decision_window_days: 7,
    },
    crisis_resilience_stress_test: crisisRows.length
      ? rowsToObjects(crisisRows, ['stress_event', 'control', 'release_test', 'owner'])
      : crisisContinuity.crisisResilienceStressTest ?? [],
    antifragile_resilience_test: antiFragilityRows.length
      ? rowsToObjects(antiFragilityRows, ['control', 'stress_response', 'release_effect', 'owner'])
      : crisisContinuity.antifragileResilienceTest ?? [],
    crisis_data: {
      scenarios: crisisRows.map((row, index) => ({
        name: row[0] || `Crisis scenario ${index + 1}`,
        impact: row[1] || row[2],
        recovery: row[3] || row[2],
        verdict: row[2] || 'Signed gate controls release',
      })),
    },
    heir_management_data: {
      authority_and_veto_matrix: familyReadiness.authorityAndVeto ?? {},
      third_generation_problem: crisisContinuity.generationalView ?? {},
      heir_specific_read: continuityRows.map((row) => row.join(' - ')),
    },
    counsel_operator_questions: counselRows,
  };

  const memoData = {
    success: true,
    intake_id: payload.reference,
    generated_at: generatedAt,
    preview_data: previewData,
    memo_data: {
      status: 'completed',
      reference: payload.reference,
      surface: 'release_readiness_public_linear_route_memo',
    },
    full_artifact: {
      preview_data: previewData,
      thesis: cleanText(payload.move),
      thesisSummary: cleanText(payload.rationale || payload.releaseRule),
    },
  };

  const backendData = {
    preview_data: previewData,
    risk_assessment: previewData.house_grade_memo.decision_signal,
    fullArtifact: memoData.full_artifact,
    full_artifact: memoData.full_artifact,
  };

  return {
    memoData,
    backendData,
    fullArtifact: memoData.full_artifact,
  };
}

export function buildPublicRouteScopedMemoSurface(
  payload: ReleaseReadinessSharePayload,
  selectedRoute: RouteIntelligenceOptionV2,
) {
  const seed = buildPublicLinearMemoSeed(payload, selectedRoute);
  const route = payload.routeIntelligenceV2;
  return buildRouteScopedDecisionMemoSurface({
    memoData: seed.memoData,
    backendData: seed.backendData,
    fullArtifact: seed.fullArtifact,
    route: selectedRoute,
    routes: routeOptionsForMemo(route),
  });
}
