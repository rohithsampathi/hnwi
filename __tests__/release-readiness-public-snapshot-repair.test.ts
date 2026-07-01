import { repairReleaseReadinessPublicSnapshotPayload } from '@/lib/decision-memo/fetch-release-readiness-public-snapshot';

describe('repairReleaseReadinessPublicSnapshotPayload', () => {
  it('replaces anonymous Mayfair resilience fallback rows with named route pressure events', () => {
    const payload = {
      routeIntelligenceV2: {
        crisisResilience: {
          scenarios: [
            {
              id: 'resilience_1',
              name: 'Family resilience test 1',
              impact: 'Authority, record, or adviser dependency blocks clean release.',
              recovery: 'Name owner, proof file, alternate action, and stop authority before release.',
            },
          ],
        },
        routeOptions: [
          {
            id: 'direct_foreign_individual',
            routeName: 'Direct non-UK resident individual purchase',
            crisisResilience: {
              eventCount: 3,
              signalCount: 3,
              scenarios: [
                {
                  id: 'bank_escalation_1',
                  name: 'Receiving bank screening/KYC system flags enhanced due diligence after deposit timeline starts.',
                  impact: 'Bank acceptance or transfer timing can stop the purchase after seller timing starts.',
                  recovery: 'Route releases only with primary and alternate bank acceptance, signed source evidence, and transfer authority.',
                  risk_level: 'HIGH',
                },
                {
                  id: 'record_conflict_1',
                  name: 'Document names, entity chart, tax-residency self-certification, or source-bank narrative conflict.',
                  impact: 'Bank acceptance or transfer timing can stop the purchase after seller timing starts.',
                  recovery: 'Route releases only with primary and alternate bank acceptance, signed source evidence, and transfer authority.',
                  risk_level: 'HIGH',
                },
                {
                  id: 'absence_1',
                  name: 'Principal, bank lead, or counsel unavailable for 72 hours.',
                  impact: 'Bank acceptance or transfer timing can stop the purchase after seller timing starts.',
                  recovery: 'Route releases only with primary and alternate bank acceptance, signed source evidence, and transfer authority.',
                  risk_level: 'CRITICAL',
                },
                {
                  id: 'resilience_1',
                  name: 'Family resilience test 1',
                  impact: 'Authority, record, or adviser dependency blocks clean release.',
                  recovery: 'Name owner, proof file, alternate action, and stop authority before release.',
                  risk_level: 'HIGH',
                },
                {
                  id: 'resilience_2',
                  name: 'Family resilience test 2',
                  impact: 'Authority, record, or adviser dependency blocks clean release.',
                  recovery: 'Name owner, proof file, alternate action, and stop authority before release.',
                  risk_level: 'HIGH',
                },
              ],
            },
            antiFragility: {
              stressTest: [
                {
                  control: 'Primary and alternate banking rail',
                  release_test: 'Control must be operational before option exercise or equivalent hardening event.',
                  stress_event: 'Bank delay, Principal absence, counsel objection, family veto, or document mismatch.',
                },
                {
                  control: 'Decision-memory index',
                  release_test: 'Control must be operational before option exercise or equivalent hardening event.',
                  stress_event: 'Bank delay, Principal absence, counsel objection, family veto, or document mismatch.',
                },
                {
                  control: 'Counsel question pack',
                  release_test: 'Control must be operational before option exercise or equivalent hardening event.',
                  stress_event: 'Bank delay, Principal absence, counsel objection, family veto, or document mismatch.',
                },
                {
                  control: 'Record mismatch map',
                  release_test: 'Control must be operational before option exercise or equivalent hardening event.',
                  stress_event: 'Bank delay, Principal absence, counsel objection, family veto, or document mismatch.',
                },
              ],
            },
          },
        ],
        selectedLiveOption: {
          id: 'direct_foreign_individual',
          crisisResilience: {
            scenarios: [
              {
                id: 'resilience_1',
                name: 'Family resilience test 1',
                impact: 'Authority, record, or adviser dependency blocks clean release.',
                recovery: 'Name owner, proof file, alternate action, and stop authority before release.',
              },
            ],
          },
        },
      },
    } as any;

    const repaired = repairReleaseReadinessPublicSnapshotPayload(payload);
    const route = repaired.routeIntelligenceV2.routeOptions[0] as any;
    const selected = repaired.routeIntelligenceV2.selectedLiveOption as any;
    const serialized = JSON.stringify(repaired);

    expect(serialized).not.toMatch(/Family resilience test\s+\d+/);
    expect(serialized).not.toContain('Authority, record, or adviser dependency blocks clean release');
    expect(serialized).not.toContain('Name owner, proof file, alternate action, and stop authority');
    expect(serialized).not.toContain('Bank acceptance or transfer timing can stop the purchase after seller timing starts');
    expect(serialized).not.toContain('Route releases only with primary and alternate bank acceptance, signed source evidence, and transfer authority');
    expect(route.crisisResilience.scenarios.map((row: any) => row.name)).toEqual(
      expect.arrayContaining([
        'Receiving bank screening/KYC system flags enhanced due diligence after deposit timeline starts.',
        'Document names, entity chart, tax-residency self-certification, or source-bank narrative conflict.',
        'Principal, bank lead, or counsel unavailable for 72 hours.',
        'Counsel objection inside the seller-timing window',
      ]),
    );
    expect(selected.crisisResilience.scenarios.map((row: any) => row.name)).toEqual(route.crisisResilience.scenarios.map((row: any) => row.name));
    expect(route.crisisResilience.scenarios[0].impact).toContain('A second rail does not protect the purchase');
    expect(route.crisisResilience.scenarios[0].recovery).toContain('both primary and alternate rails independently clear');
    expect(route.crisisResilience.scenarios[1].impact).toContain('Cash source, title holder, beneficial owner');
    expect(route.crisisResilience.scenarios[1].recovery).toContain('Operator and counsel reconcile');
    expect(route.crisisResilience.scenarios[2].impact).toContain('Principal, bank lead, counsel, signer, or operator absence');
    expect(route.crisisResilience.scenarios[2].recovery).toContain('Alternate signer, document retrieval map');
    expect(new Set(route.crisisResilience.scenarios.map((row: any) => row.impact)).size).toBeGreaterThan(3);
    expect(new Set(route.crisisResilience.scenarios.map((row: any) => row.recovery)).size).toBeGreaterThan(3);
    expect((repaired.routeIntelligenceV2 as any).crisisResilience.scenarios.map((row: any) => row.name)).toContain(
      'Principal, bank lead, or counsel unavailable for 72 hours.',
    );
    expect(route.zeroTrustMoveIntake.records).toHaveLength(8);
    expect(route.releaseEvidencePack.records).toHaveLength(8);
    expect(route.zeroTrustMoveIntake.records.map((row: any) => row.domain)).toEqual([
      'Title / buyer capacity',
      'SDLT / duty treatment',
      'Source wealth / source funds',
      'Bank rails / FX / signer',
      'Authority / stop right',
      'Family-use / purpose boundary',
      'Fairness / succession boundary',
      'Decision memory / retrieval',
    ]);
    expect(new Set(route.zeroTrustMoveIntake.records.map((row: any) => row.current_record)).size).toBe(8);
    expect(route.zeroTrustMoveIntake.records.find((row: any) => row.domain === 'Bank rails / FX / signer').current_record)
      .toContain('UAE source rail');
    expect(route.zeroTrustMoveIntake.records.find((row: any) => row.domain === 'Authority / stop right').current_record)
      .toContain('Principal approval');
  });
});
