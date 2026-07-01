import { buildPublicRouteScopedMemoSurface } from '@/lib/decision-memo/build-release-readiness-public-linear-memo';
import { ROUTE_INTELLIGENCE_V2_CONTRACT, type RouteIntelligenceOptionV2 } from '@/lib/decision-memo/route-intelligence-v2';

function routeOption(overrides: Partial<RouteIntelligenceOptionV2>): RouteIntelligenceOptionV2 {
  return {
    id: overrides.id || 'route',
    rank: overrides.rank || 1,
    routeName: overrides.routeName || 'Default route',
    routeType: overrides.routeType || 'Default route type',
    verdict: overrides.verdict || 'Default verdict',
    releaseRule: overrides.releaseRule || 'Hold',
    bestUse: overrides.bestUse || 'Default best use',
    economicRead: overrides.economicRead || 'Default economic read',
    failureMode: overrides.failureMode || 'Default failure mode',
    releaseEffect: overrides.releaseEffect || 'Default release effect',
    taxAudit: overrides.taxAudit || {},
    metrics: {
      propertyValueUsd: 10_000_000,
      bsdUsd: 0,
      absdUsd: 0,
      totalDutiesUsd: 1_000_000,
      totalAcquisitionCostUsd: 11_000_000,
      incrementalDutyVsRecommendedUsd: 0,
      dutyDragPct: 10,
      annualCarryingCostUsd: 100_000,
      dataQuality: 'test route data',
      mitigationTimeline: 'test route timeline',
      ...overrides.metrics,
    },
    jurisdictionValues: overrides.jurisdictionValues || [],
    evidenceGates: overrides.evidenceGates || [
      {
        gate: 'Route gate',
        owner: 'Family office',
        evidenceRequired: 'Signed route evidence',
        releaseStatus: 'Gate mapped',
        consequenceIfMissing: 'Capital remains blocked',
      },
    ],
    responsibilityTransfer: overrides.responsibilityTransfer || [],
    recordMismatchMap: overrides.recordMismatchMap || [],
    counselQuestionPack: overrides.counselQuestionPack || [],
    stressSignals: overrides.stressSignals || [],
    scenarios: overrides.scenarios || [],
  };
}

describe('buildPublicRouteScopedMemoSurface', () => {
  test('builds the linear memo from the selected route, not the payload default route', () => {
    const defaultRoute = routeOption({
      id: 'direct',
      rank: 1,
      routeName: 'Direct non-UK resident individual purchase',
      routeType: 'Direct buyer release route',
      verdict: 'Approved to negotiate under signed gates; no capital release',
      releaseRule: 'Release Differently',
      bestUse: 'Direct family control',
      releaseEffect: 'Direct route may advance under signed gates.',
      metrics: {
        totalDutiesUsd: 12_000_000,
        totalAcquisitionCostUsd: 78_000_000,
        dutyDragPct: 18,
      },
    });
    const selectedRoute = routeOption({
      id: 'structure',
      rank: 2,
      routeName: 'Family ownership structure readiness route',
      routeType: 'Structure-readiness route',
      verdict: 'Hold Until Structure Is Proven',
      releaseRule: 'Hold',
      bestUse: 'Only where counsel signs the ownership architecture.',
      releaseEffect: 'Hold the structure route until beneficial ownership, banking, reporting, succession, and family authority are signed.',
      failureMode: 'Wrapper optics add cost and scrutiny without solving authority.',
      metrics: {
        totalDutiesUsd: 13_000_000,
        totalAcquisitionCostUsd: 79_000_000,
        dutyDragPct: 19,
      },
    });
    const payload = {
      surfaceContract: 'hnwi_release_readiness_principal_share_v2',
      reference: 'HC9L7M2A4Q8P6',
      title: 'Proposed Move Release Readiness Memo',
      corridor: 'Dubai / United Arab Emirates -> London / United Kingdom',
      move: 'A family is reviewing a Mayfair townhouse.',
      user_inputs: {},
      decision: defaultRoute.verdict,
      releaseRule: defaultRoute.releaseRule,
      purpose: 'London family use and continuity.',
      capitalRule: 'No capital release without signed gates.',
      rationale: 'Default route rationale.',
      riskLevel: 'Evidence mapped',
      mitigation: 'Close signed gates.',
      selectedRoute: defaultRoute,
      routeOptions: [defaultRoute, selectedRoute],
      gateRows: [],
      advanceConditions: [],
      holdConditions: [],
      stopConditions: [],
      publicSources: [],
      privateEvidence: [],
      methodDrivers: [],
      citations: [],
      reportSections: [],
      routeIntelligenceV2: {
        surfaceContract: ROUTE_INTELLIGENCE_V2_CONTRACT,
        corridor: 'Dubai / United Arab Emirates -> London / United Kingdom',
        move: 'A family is reviewing a Mayfair townhouse.',
        recommendedRouteId: defaultRoute.id,
        routeOptions: [defaultRoute, selectedRoute],
      },
    } as any;

    const surface = buildPublicRouteScopedMemoSurface(payload, selectedRoute);
    const preview = surface.memoData.preview_data;

    expect(preview.house_grade_memo.decision_signal.value).toBe('Hold Until Structure Is Proven');
    expect(preview.house_grade_memo.decision_signal.release_rule).toBe('Hold');
    expect(preview.input_snapshot.constraints.selected_route).toBe('Family ownership structure readiness route');
    expect(preview.exposure_class).toBe('Structure-readiness route');
    expect(preview.executive_summary.headline_metric.value).toBe('US$79.0M');
    expect(preview.cross_border_audit_summary.acquisition_audit.buyer_category).toBe('Family ownership structure readiness route');
  });

  test('hydrates route-local release evidence and timeline gates for the public linear memo', () => {
    const selectedRoute = routeOption({
      id: 'direct',
      rank: 1,
      routeName: 'Direct non-UK resident individual purchase',
      routeType: 'Direct buyer release route',
      verdict: 'Approved to negotiate under signed gates; no capital release',
      releaseRule: 'Release Differently',
      bestUse: 'London family-use and continuity base.',
      releaseEffect: 'Direct route may advance only under signed gates.',
      evidenceGates: [
        {
          gate: 'Buyer capacity and title route',
          owner: 'UK property counsel',
          evidenceRequired: 'Exact buyer name, title class, option/deposit mechanics, completion timing, and whether approval is signed.',
          releaseStatus: 'signed before commitment',
          consequenceIfMissing: 'The family may sign a route that cannot carry the intended authority, use, or exit path.',
        },
        {
          gate: 'Base SDLT and Non-resident + additional-dwelling surcharges computation',
          owner: 'UK tax counsel',
          evidenceRequired: 'Written duty computation for this buyer profile, acquisition value, surcharge position, filing date, and payment mechanics.',
          releaseStatus: 'signed before duty payment',
          consequenceIfMissing: 'Non-recoverable duty drag can be accepted without the room understanding the real all-in cost.',
        },
        {
          gate: 'SoW / SoF corroboration',
          owner: 'UAE source bank + family office operator / CFO',
          evidenceRequired: 'Source-of-wealth and source-of-funds file with bank statements, sale or distribution records, tax support, transfer narrative, and beneficiary trail.',
          releaseStatus: 'signed before receiving-bank reliance',
          consequenceIfMissing: 'Bank compliance escalation can stop the move after seller timing has started.',
        },
        {
          gate: 'Primary and alternate banking rails',
          owner: 'UK receiving bank + UAE source bank',
          evidenceRequired: 'Named sending and receiving rails, signer mandates, FX authority, emergency alternate path, and reporting cadence.',
          releaseStatus: 'signed before irrevocable capital release',
          consequenceIfMissing: 'The asset can become hostage to one rail, one banker, or one unresolved KYC question.',
        },
        {
          gate: 'Family authority and veto',
          owner: 'Principal + family office operator / CFO',
          evidenceRequired: 'Who can approve, stop, sign, move funds, retrieve records, and explain the purchase without relying on one person.',
          releaseStatus: 'signed before visibility',
          consequenceIfMissing: 'Late family-home, next-generation, or fairness veto can convert a property decision into a family-governance event.',
        },
        {
          gate: 'Succession and decision memory',
          owner: 'Succession counsel + family office operator / CFO',
          evidenceRequired: 'Where the route decision, evidence file, title documents, bank approvals, future reporting pack, and next-generation decision record will live.',
          releaseStatus: 'signed before completion',
          consequenceIfMissing: 'The purchase may be explainable only by one memory-holder.',
        },
      ],
    });
    (selectedRoute as any).crisisResilience = {
      overall: {
        rating: 'Release-critical',
        summary: 'The Mayfair purchase survives only if bank acceptance, title authority, source evidence, family veto, and record retrieval remain operable under pressure.',
        worst_case_loss: 'Duty drag, trapped deposit timing, bank freeze, and family conflict after public commitment.',
        recovery_time: '72-hour proof drill before release; 7-day counsel, bank, and title close path after release.',
        buffer_required: 'Primary rail, alternate rail, named signers, evidence index, and stop authority.',
        key_vulnerabilities: ['single-bank rail', 'single-adviser dependency', 'unsigned family authority'],
      },
      read: 'The direct route releases only if the family can stop, explain, redirect, and retrieve the route under bank, principal-absence, counsel, and family-veto pressure.',
      signalCount: 7,
      eventCount: 6,
      sourceCount: 2,
      routeRisks: [
        {
          id: 'bank_acceptance',
          label: 'Bank acceptance before seller timing',
          status: 'Critical',
          detail: 'Receiving-bank acceptance must precede irrevocable seller commitment.',
          impact_channels: ['KYC', 'SoW/SoF', 'Transfer timing'],
        },
      ],
      priorityEvents: [
        {
          id: 'absence_drill',
          label: '72-hour absence drill',
          status: 'Release-critical',
          detail: 'Principal, bank lead, counsel, and operator absence must not stop retrieval, explanation, or stop authority.',
          impact_channels: ['Key-person dependency', 'Decision documentation', 'Bank/counsel continuity'],
        },
      ],
      bankComplianceEscalation: [
        {
          scenario: 'Receiving bank screening/KYC system flags enhanced due diligence after deposit timeline starts.',
          breakpoint: 'No accepted SoW/SoF pack or named escalation owner.',
          required_response: 'Pause release; use mapped alternate rail or extend option only after bank acceptance.',
        },
      ],
      decisionFlags: [
        'Hold if primary and alternate bank rails are not accepted.',
        'Hold if family authority and succession records do not describe the same route.',
      ],
      scenarios: [
        {
          id: 'bank_escalation_1',
          name: 'Receiving bank screening/KYC system flags enhanced due diligence after deposit timeline starts.',
          impact: 'Bank acceptance or transfer timing can stop the purchase after seller timing starts.',
          recovery: 'Route releases only with primary and alternate bank acceptance, signed source evidence, and transfer authority.',
          risk_level: 'HIGH',
          sources: ['Official bank-compliance source register', 'Family evidence pack'],
        },
        {
          id: 'resilience_1',
          name: 'Family resilience test 1',
          impact: 'Authority, record, or adviser dependency blocks clean release.',
          recovery: 'Name owner, proof file, alternate action, and stop authority before release.',
          risk_level: 'HIGH',
        },
      ],
    };
    (selectedRoute as any).antiFragility = {
      stressTest: [
        {
          control: 'Primary and alternate bank rails',
          stress_response: 'If primary rail slows, transfer remains paused until the alternate rail clears the same SoW/SoF, signer, FX, KYC, sanctions, timetable, and buyer-route conditions.',
          release_effect: 'Rail redundancy strengthens the route only when both rails are independently accepted.',
          owner: 'Bank rail owner',
        },
      ],
    };
    const payload = {
      surfaceContract: 'hnwi_release_readiness_principal_share_v2',
      reference: 'HC9L7M2A4Q8P6',
      title: 'Proposed Move Release Readiness Memo',
      corridor: 'Dubai / United Arab Emirates -> London / United Kingdom',
      move: 'A family is reviewing a Mayfair townhouse.',
      user_inputs: {
        live_decision: 'Approved to negotiate under signed gates.',
      },
      decision: selectedRoute.verdict,
      releaseRule: selectedRoute.releaseRule,
      purpose: selectedRoute.bestUse,
      capitalRule: 'No capital release without signed gates.',
      rationale: selectedRoute.releaseEffect,
      riskLevel: 'Evidence mapped',
      mitigation: 'Close signed gates.',
      selectedRoute,
      routeOptions: [selectedRoute],
      gateRows: [],
      advanceConditions: [],
      holdConditions: [],
      stopConditions: [],
      publicSources: [],
      privateEvidence: [],
      methodDrivers: [],
      citations: [],
      reportSections: [],
      routeIntelligenceV2: {
        surfaceContract: ROUTE_INTELLIGENCE_V2_CONTRACT,
        corridor: 'Dubai / United Arab Emirates -> London / United Kingdom',
        move: 'A family is reviewing a Mayfair townhouse.',
        recommendedRouteId: selectedRoute.id,
        routeOptions: [selectedRoute],
        routeMemoSpine: {
          marketBidDiscipline: {
            rows: [
              {
                control: 'Guide price versus all-in exposure',
                principal_question: 'Is the family approving the guide price or the full control exposure?',
                release_test: 'Principal minute acknowledges duty drag before bid release.',
              },
            ],
          },
          capitalFlow: {
            source: 'Dubai / United Arab Emirates',
            destination: 'London / United Kingdom',
            source_flows: [{ city: 'Dubai / GCC family capital', volume: 21, percentage: 100 }],
            destination_flows: [{ city: 'Mayfair / Prime Central London', volume: 21, percentage: 100, highlight: true }],
            flow_intensity_index: 72,
            flow_intensity: 72,
            peers_in_corridor: 21,
            velocity_change: 'Release-gated',
            pattern_signal: {
              title: 'CORRIDOR ACTIVITY PATTERN',
              badge: 'ACTIVE BUT GATED',
              narrative: 'Market context supports active review, but release is governed by evidence.',
            },
          },
        },
      },
    } as any;

    const surface = buildPublicRouteScopedMemoSurface(payload, selectedRoute);
    const preview = surface.memoData.preview_data;

    expect(preview.zero_trust_move_intake.records).toHaveLength(8);
    expect(preview.zero_trust_move_intake.records.map((row: any) => row.domain)).toEqual([
      'Title / buyer capacity',
      'SDLT / duty treatment',
      'Source wealth / source funds',
      'Bank rails / FX / signer',
      'Authority / stop right',
      'Family-use / purpose boundary',
      'Fairness / succession boundary',
      'Decision memory / retrieval',
    ]);
    expect(new Set(preview.zero_trust_move_intake.records.map((row: any) => row.current_record)).size).toBe(8);
    expect(preview.zero_trust_move_intake.records.find((row: any) => row.domain === 'Bank rails / FX / signer').current_record)
      .toContain('UAE source rail');
    expect(preview.zero_trust_move_intake.records.find((row: any) => row.domain === 'Authority / stop right').current_record)
      .toContain('Principal approval');
    expect(preview.zero_trust_move_intake.records.find((row: any) => row.domain === 'Family-use / purpose boundary').current_record)
      .toContain('London family-use and continuity base');
    expect(preview.zero_trust_move_intake.records.find((row: any) => row.domain === 'Decision memory / retrieval').current_record)
      .toContain('rejected routes');
    expect(JSON.stringify(preview.zero_trust_move_intake.records)).not.toMatch(
      /Family resilience test|Authority, record, or adviser dependency|Name owner, proof file|Evidence gated/,
    );
    expect(preview.zero_trust_move_intake.banking_rails.source_bank).toContain('UAE source rail');
    expect(preview.zero_trust_move_intake.banking_rails.primary_receiving_bank).toContain('UK receiving rail');
    expect(preview.zero_trust_move_intake.banking_rails.fallback_receiving_bank).toContain('Alternate rail');
    expect(preview.zero_trust_move_intake.adviser_inputs).toHaveLength(6);
    expect(preview.zero_trust_move_intake.adviser_inputs.map((row: any) => row.domain)).toEqual([
      'UK property counsel',
      'UK private-client tax counsel',
      'Source tax counsel',
      'Source and receiving banks',
      'Immigration and education advisers',
      'Succession counsel and family-office operator',
    ]);
    expect(preview.zero_trust_move_intake.adviser_inputs.every((row: any) => row.required_answer)).toBe(true);
    expect(JSON.stringify(preview.zero_trust_move_intake.adviser_inputs)).not.toMatch(
      /\bAdvis(?:e|o)r\s+\d\b|\bAdvisor\b|Evidence gated|This rail cannot remain/,
    );
    expect(preview.input_snapshot.decision_rails.advisors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'UK tax counsel',
          burden: expect.stringContaining('SDLT'),
        }),
        expect.objectContaining({
          role: 'Bank rail owner',
          burden: expect.stringContaining('alternate rail'),
        }),
      ]),
    );
    expect(JSON.stringify(preview.input_snapshot.decision_rails.advisors)).not.toMatch(
      /\bAdvis(?:e|o)r\s+\d\b|\bAdvisor\b|Evidence gated|This rail cannot remain/,
    );
    expect(preview.crisis_data.overall_resilience.rating).toBe('Release-critical');
    expect(preview.crisis_data.overall_resilience.worst_case_loss).toContain('Duty drag');
    expect(preview.crisis_data.overall_resilience.recovery_time).toContain('72-hour proof drill');
    expect(preview.crisis_data.signal_count).toBe(7);
    expect(preview.crisis_data.event_count).toBe(6);
    expect(preview.crisis_data.source_count).toBe(2);
    expect(preview.crisis_data.market_regime_count).toBe(3);
    expect(preview.crisis_data.route_risks[0].label).toBe('Bank acceptance before seller timing');
    expect(preview.crisis_data.priority_events[0].label).toBe('72-hour absence drill');
    expect(preview.crisis_data.bank_compliance_escalation_simulation[0].required_response).toContain('Pause release');
    expect(preview.antifragile_resilience_test[0].control).toBe('Primary and alternate bank rails');
    expect(preview.crisis_data.scenarios.map((scenario: any) => scenario.name)).toContain(
      'Primary and alternate bank rails fail the same acceptance story',
    );
    expect(preview.crisis_data.scenarios[0].impact).toContain('A second rail does not protect the purchase');
    expect(preview.crisis_data.scenarios[0].recovery).toContain('both primary and alternate rails independently clear');
    expect(JSON.stringify(preview.crisis_data)).not.toMatch(
      /Live corridor stress requires re-underwriting|Gate mapped|Capital release blocked|Response gated|Gate by event|Release-gate controlled|Family resilience test|Authority, record, or adviser dependency|Name owner, proof file|Bank acceptance or transfer timing can stop the purchase after seller timing starts|Route releases only with primary and alternate bank acceptance/,
    );
    expect(preview.peer_cohort_stats.total_peers).toBe(21);
    expect(preview.peer_cohort_stats.metric_cards.map((card: any) => card.label)).toEqual([
      'Corridor records',
      'Flow intensity',
      'Selected asset basis',
    ]);
    expect(preview.peer_cohort_stats.metric_cards.every((card: any) => card.value && card.value > 0)).toBe(true);
    expect(preview.capital_flow_data.peers_in_corridor).toBe(21);
    expect(preview.route_confidence_signal).toBe('Release-gated');
    expect(preview.hnwi_trends_data_quality.scientific_grounding).toBe('native_library_route_compiler');

    const decisionGates = preview.scenario_tree_data.decision_gates;
    expect(decisionGates).toHaveLength(6);
    expect(decisionGates[0]).toMatchObject({
      gate_number: 1,
      day: 1,
      check: 'Buyer capacity and title route',
    });
    expect(decisionGates[0].if_pass).toContain('UK property counsel');
    expect(decisionGates[0].if_fail).toContain('stays blocked');
    expect(decisionGates.every((gate: any) => gate.day && gate.check && gate.if_pass && gate.if_fail)).toBe(true);
  });
});
