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
});
