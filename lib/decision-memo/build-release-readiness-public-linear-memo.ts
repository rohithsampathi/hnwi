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

type PeerMetricCard = {
  label: string;
  value: number;
  description: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  highlight?: boolean;
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

function finiteValue(value: unknown): number | undefined {
  const numeric = numberValue(value);
  return numeric > 0 ? numeric : undefined;
}

function recordValue(value: unknown): RecordLike {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as RecordLike) : {};
}

function arrayValue<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function stringList(value: unknown): string[] {
  return arrayValue(value)
    .map((item) => {
      if (typeof item === 'string') return cleanText(item);
      const record = recordValue(item);
      return cleanText(record.label || record.title || record.name || record.detail || record.summary || '');
    })
    .filter(Boolean);
}

function genericCrisisText(value: string): boolean {
  return (
    /\bFamily resilience test\s+\d+\b/i.test(value) ||
    /Authority, record, or adviser dependency blocks clean release/i.test(value) ||
    /Name owner, proof file, alternate action, and stop authority/i.test(value) ||
    /Bank delay, Principal absence, counsel objection, family veto, or document mismatch/i.test(value) ||
    /Control must be operational before option exercise/i.test(value)
  );
}

function specificCrisisText(value: unknown, fallback: string): string {
  const text = cleanText(value);
  return text && !genericCrisisText(text) ? text : fallback;
}

function repeatedMayfairCrisisBody(value: unknown): boolean {
  const text = cleanText(value);
  return (
    /Bank acceptance or transfer timing can stop the purchase after seller timing starts/i.test(text) ||
    /Route releases only with primary and alternate bank acceptance, signed source evidence, and transfer authority/i.test(text)
  );
}

function resilienceTemplate(controlValue: string, index: number): {
  name: string;
  impact: string;
  recovery: string;
  riskLevel: string;
  channels: string[];
} {
  const control = controlValue.toLowerCase();

  if (/record|mismatch|document|entity chart|self-certification|conflict/i.test(control)) {
    return {
      name: 'Record mismatch across cash, title, tax, bank, and family authority',
      impact:
        'Cash source, title holder, beneficial owner, tax residence, bank account name, and family authority can describe different versions of the move.',
      recovery:
        'Operator and counsel reconcile owner, signer, bank, title, tax, and family-authority records before transfer instruction; unresolved mismatch holds release.',
      riskLevel: 'HIGH',
      channels: ['Records', 'Tax', 'Bank', 'Authority'],
    };
  }

  if (/absence|unavailable|signer|substitution|72/i.test(control)) {
    return {
      name: '72-hour absence drill inside exchange or completion',
      impact:
        'Principal, bank lead, counsel, signer, or operator absence can stop retrieval, explanation, transfer authority, or the stop decision inside the live window.',
      recovery:
        'Alternate signer, document retrieval map, adviser contact tree, and stop authority must work without the absent person before release.',
      riskLevel: 'CRITICAL',
      channels: ['Absence readiness', 'Signing', 'Record retrieval'],
    };
  }

  if (/bank|rail|sow|sof|source|fund/i.test(controlValue)) {
    return {
      name: 'Primary and alternate bank rails fail the same acceptance story',
      impact:
        'A second rail does not protect the purchase unless it has accepted the same buyer, SoW/SoF, signer, FX, KYC, sanctions, timetable, and route facts.',
      recovery:
        'Hold release until both primary and alternate rails independently clear the route conditions before seller timing hardens.',
      riskLevel: 'CRITICAL',
      channels: ['Bank acceptance', 'SoW / SoF', 'FX and transfer timing'],
    };
  }

  if (/counsel|objection|question/i.test(control)) {
    return {
      name: 'Counsel objection inside the seller-timing window',
      impact:
        'A late title, SDLT, residence, IHT, entity-route, or reporting objection can turn seller timing into pressure before the corrected route is signed.',
      recovery:
        'Pause bid, deposit, FX instruction, and exchange authority until counsel signs the corrected route or the principal signs stop.',
      riskLevel: 'HIGH',
      channels: ['Counsel sign-off', 'Title', 'SDLT', 'Residence'],
    };
  }

  if (/family|fairness|veto|g1|g2|g3|use|succession/i.test(control)) {
    return {
      name: 'Family-use, veto, and fairness conflict before close',
      impact:
        'Named use, spouse veto, G2 fairness, daughter/son expectations, or G3 continuity can become an implied promise before the title and carry record catches up.',
      recovery:
        'Sign the use boundary, veto rights, carry owner, future transfer language, fairness minute, and decision-memory record before visibility or exchange.',
      riskLevel: 'HIGH',
      channels: ['Family-use', 'Fairness', 'Succession'],
    };
  }

  if (/seller|deposit|timing|exchange|exclusivity/i.test(control)) {
    return {
      name: 'Seller timing tries to outrun release authority',
      impact:
        'Broker pressure, exclusivity, deposit, exchange, or public commitment can harden the route before title, tax, bank, source, and family gates clear.',
      recovery:
        'Keep buying authority blocked unless walk-away price, counsel sign-off, bank acceptance, and family authority are recorded before release.',
      riskLevel: 'HIGH',
      channels: ['Seller timing', 'Deposit', 'Walk-away discipline'],
    };
  }

  if (/tax|residence|fig|iht|school|education/i.test(control)) {
    return {
      name: 'UK residence, school-use, FIG, and IHT exposure changes the route',
      impact:
        'Family use or education purpose can turn a property purchase into a residence, school, remittance, or long-term estate-planning exposure.',
      recovery:
        'Document day-count, family-use calendar, school or guardian path, FIG eligibility, and long-term residence/IHT review before release.',
      riskLevel: 'HIGH',
      channels: ['Residence', 'Education', 'IHT'],
    };
  }

  if (/title|search|survey|security|privacy|insurance/i.test(control)) {
    return {
      name: 'Title, search, security, or operating file contradicts the family-use thesis',
      impact:
        'Search, tenure, planning, listed-building, security, fixtures, insurance, or completion mechanics can change bid authority after the family has emotionally committed.',
      recovery:
        'Reflect capex, survey adjustment, title correction, insurance/security file, and completion sequence in bid authority or stop the route.',
      riskLevel: 'HIGH',
      channels: ['Title', 'Searches', 'Security', 'Insurance'],
    };
  }

  if (/memory|decision/i.test(control)) {
    return {
      name: 'Decision-memory packet cannot explain why capital moved',
      impact:
        'Future family members or advisers may know that Mayfair was bought but not why this route released, held, changed, or stopped.',
      recovery:
        'Store release rule, evidence register, contradiction register, owners, source anchors, and next annual review before exchange.',
      riskLevel: 'HIGH',
      channels: ['Decision memory', 'Retrieval', 'Family explanation'],
    };
  }

  const defaults = [
    resilienceTemplate('record mismatch', index),
    resilienceTemplate('counsel objection', index),
    resilienceTemplate('family fairness', index),
  ];
  return defaults[index % defaults.length];
}

function resilienceScenarioFromControl(row: RecordLike, index: number): RecordLike {
  const control = cleanText(row.control || row.test || row.scenario || row.event || '');
  const template = resilienceTemplate(control, index);
  return {
    id: cleanText(row.id || `route_resilience_${index + 1}`),
    name: specificCrisisText(row.name || row.scenario || row.event, template.name),
    impact: specificCrisisText(
      row.stress_event || row.stress_response || row.failure || row.consequence || row.impact,
      template.impact,
    ),
    recovery: specificCrisisText(
      row.release_test || row.release_effect || row.release_response || row.mitigation || row.response,
      template.recovery,
    ),
    risk_level: cleanText(row.risk_level || row.status || template.riskLevel),
    sources: stringList(row.sources).length ? stringList(row.sources) : ['Family release evidence packet'],
    impact_channels: stringList(row.impact_channels).length ? stringList(row.impact_channels) : template.channels,
  };
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
  const routeRecord = recordValue(route);
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
  const capitalFlow = recordValue(spine.capitalFlow);
  const roadmapRows = uniqueRows(reportRows(roadmapSection), 12);
  const responsibilityRows = uniqueRows(reportRows(responsibilitySection), 10);
  const mismatchRows = uniqueRows(reportRows(recordMismatchSection), 10);
  const counselRows = uniqueRows(reportRows(counselSection), 12);
  const continuityRows = uniqueRows(reportRows(continuitySection), 10);
  const crisisRows = uniqueRows(reportRows(crisisSection), 10);
  const antiFragilityRows = uniqueRows(reportRows(antiFragilitySection), 10);
  const routeCrisis = recordValue((selectedRoute as any)?.crisisResilience);
  const routeAntiFragility = recordValue((selectedRoute as any)?.antiFragility);
  const routeCrisisOverall = recordValue(routeCrisis.overall);
  const routeCrisisScenarios = arrayValue<RecordLike>(routeCrisis.scenarios);
  const routeCrisisRisks = arrayValue<RecordLike>(routeCrisis.routeRisks);
  const routePriorityEvents = arrayValue<RecordLike>(routeCrisis.priorityEvents);
  const routeBankEscalations = arrayValue<RecordLike>(routeCrisis.bankComplianceEscalation);
  const routeDecisionFlags = stringList(routeCrisis.decisionFlags);
  const routeCrisisSignalCount =
    finiteValue(routeCrisis.signalCount) ||
    routeCrisisScenarios.length + routeCrisisRisks.length + routePriorityEvents.length;
  const routeCrisisEventCount = finiteValue(routeCrisis.eventCount) || routeCrisisScenarios.length || routePriorityEvents.length;
  const routeCrisisSourceFamilies = stringList(routeCrisis.sourceFamilies);
  const routeCrisisSourceCount = finiteValue(routeCrisis.sourceCount) || routeCrisisSourceFamilies.length || 2;
  const routeCrisisStressRows = arrayValue<RecordLike>(crisisContinuity.crisisResilienceStressTest);
  const routeAntiFragilityStressRows =
    arrayValue<RecordLike>(routeAntiFragility.stressTest).length
      ? arrayValue<RecordLike>(routeAntiFragility.stressTest)
      : arrayValue<RecordLike>(crisisContinuity.antifragileResilienceTest);
  const sourceValue = money(metrics.propertyValueUsd);
  const dutyValue = money(metrics.totalDutiesUsd);
  const allInValue = money(metrics.totalAcquisitionCostUsd);
  const annualCarry = money(metrics.annualCarryingCostUsd);
  const generatedAt = (payload as { generatedAt?: string }).generatedAt || new Date().toISOString();
  const propertyValueUsd = finiteValue(metrics.propertyValueUsd);
  const peersInCorridor = finiteValue(capitalFlow.peers_in_corridor);
  const flowIntensity = finiteValue(capitalFlow.flow_intensity_index) || finiteValue(capitalFlow.flow_intensity);
  const selectedAssetBasisM = propertyValueUsd ? propertyValueUsd / 1_000_000 : undefined;
  const peerMetricCards: PeerMetricCard[] = [];
  if (peersInCorridor) {
    peerMetricCards.push({
      label: 'Corridor records',
      value: peersInCorridor,
      description: 'Route-pattern and capital-flow records mapped to the Dubai / GCC -> Mayfair corridor.',
      decimals: 0,
    });
  }
  if (flowIntensity) {
    peerMetricCards.push({
      label: 'Flow intensity',
      value: flowIntensity,
      description: 'Route-readiness market-context index; not public transaction volume.',
      decimals: 0,
      highlight: true,
    });
  }
  if (selectedAssetBasisM) {
    peerMetricCards.push({
      label: 'Selected asset basis',
      value: selectedAssetBasisM,
      prefix: 'US$',
      suffix: 'M',
      description: 'GBP 49.5M guide converted at the memo FX basis; not a corridor median.',
      decimals: 1,
    });
  }
  const nativeDriverBullets = [
    ...arrayValue<RecordLike>(route.routeMemoSpine?.marketBidDiscipline?.rows)
      .map((row) => cleanText(row.release_test || row.principal_question || row.control))
      .filter(Boolean),
    ...arrayValue<RecordLike>(recordValue(routeRecord.marketBidDiscipline).rows)
      .map((row) => cleanText(row.release_test || row.principal_question || row.control))
      .filter(Boolean),
    ...arrayValue<string>(routeRecord.nativeRouteDrivers).map(cleanText).filter(Boolean),
  ].slice(0, 6);
  const crisisRead = cleanText(
    routeCrisis.read ||
      routeCrisisOverall.summary ||
      'The purchase releases only if bank acceptance, source evidence, title authority, family veto, and record retrieval remain operable under pressure.',
  );
  const routeSpecificResilienceScenarios = routeAntiFragilityStressRows
    .map((row, index) => resilienceScenarioFromControl(row, index))
    .filter((scenario) => cleanText(scenario.name));
  const normalizedRouteCrisisScenarios = routeCrisisScenarios
    .map((scenario, index) => {
      const name = cleanText(scenario.name || scenario.scenario || `Route crisis event ${index + 1}`);
      const template = resilienceTemplate(name, index);
      const rawImpact = scenario.impact || scenario.route_consequence || scenario.consequence;
      const rawRecovery = scenario.recovery || scenario.required_response || scenario.hard_next_move || scenario.response;
      const channels = stringList(scenario.impact_channels);
      return {
        id: cleanText(scenario.id || `route_crisis_${index + 1}`),
        name,
        impact: repeatedMayfairCrisisBody(rawImpact) ? template.impact : specificCrisisText(rawImpact, template.impact),
        recovery: repeatedMayfairCrisisBody(rawRecovery) ? template.recovery : specificCrisisText(rawRecovery, template.recovery),
        risk_level: cleanText(scenario.risk_level || scenario.status || template.riskLevel),
        sources: stringList(scenario.sources),
        impact_channels: channels.length ? channels : template.channels,
      };
    })
    .filter((scenario) => {
      const combined = `${scenario.name} ${scenario.impact} ${scenario.recovery}`;
      return !genericCrisisText(combined);
    });
  const routeCrisisScenarioNames = new Set(normalizedRouteCrisisScenarios.map((scenario) => scenario.name.toLowerCase()));
  const repairedRouteCrisisScenarios = [
    ...normalizedRouteCrisisScenarios,
    ...routeSpecificResilienceScenarios.filter((scenario) => {
      const name = cleanText(scenario.name).toLowerCase();
      if (!name || routeCrisisScenarioNames.has(name)) return false;
      routeCrisisScenarioNames.add(name);
      return true;
    }),
  ].slice(0, 8);
  const crisisMarketRegimes = arrayValue<RecordLike>(routeCrisis.marketRegimes).length
    ? arrayValue<RecordLike>(routeCrisis.marketRegimes)
    : [
        {
          id: 'uk-title-sdlt-seller-timing',
          label: 'UK title, SDLT, and seller-timing regime',
          status: 'Release-critical',
          detail: 'Counsel sign-off must align buyer capacity, title class, SDLT/surcharge position, deposit terms, exclusivity, and completion timing before seller commitment hardens.',
          impact_channels: ['Title', 'SDLT', 'Seller timing'],
        },
        {
          id: 'source-receiving-bank-rail',
          label: 'UAE source rail and UK receiving-bank KYC regime',
          status: 'Release-critical',
          detail: 'Source-wealth, source-of-funds, sending bank, receiving bank, FX authority, transfer limits, signer authority, sanctions, and escalation owner must clear before funds move.',
          impact_channels: ['SoW / SoF', 'KYC', 'FX'],
        },
        {
          id: 'family-use-fairness-regime',
          label: 'Family-use, fairness, and decision-memory regime',
          status: 'Release-critical',
          detail: 'The route must record who uses the property, who can stop the move, who owns carry, how G1/G2/G3 fairness is protected, and where the decision file can be retrieved.',
          impact_channels: ['Family-use', 'Fairness', 'Decision memory'],
        },
      ];
  const routeCrisisData = {
    overall_resilience: {
      score: finiteValue(routeCrisisOverall.score),
      rating: cleanText(routeCrisisOverall.rating || 'Release-critical'),
      summary: cleanText(routeCrisisOverall.summary || crisisRead),
      worst_case_loss: cleanText(
        routeCrisisOverall.worst_case_loss ||
          routeCrisisOverall.worstCaseLoss ||
          'Duty drag, trapped deposit timing, bank freeze, and family conflict after public commitment.',
      ),
      recovery_time: cleanText(
        routeCrisisOverall.recovery_time ||
          routeCrisisOverall.recoveryTime ||
          '72-hour proof drill before release; 7-day counsel, bank, and title close path after release.',
      ),
      buffer_required: cleanText(
        routeCrisisOverall.buffer_required ||
          routeCrisisOverall.bufferRequired ||
          'Primary rail, alternate rail, named signers, evidence index, and stop authority.',
      ),
      key_vulnerabilities: stringList(
        routeCrisisOverall.key_vulnerabilities || routeCrisisOverall.keyVulnerabilities,
      ),
    },
    commander_brief: {
      route_read: crisisRead,
      execution_focus: cleanText(
        routeCrisis.executionFocus ||
          'Bank acceptance, title authority, source evidence, family veto, and record retrieval must remain operable under pressure.',
      ),
      macro_regime: cleanText(
        routeCrisis.macroRegime ||
          'UK title and SDLT, receiving-bank KYC, UAE source rail, seller timing, and family-use visibility.',
      ),
      crisis_verdict: crisisRead,
      operating_window: cleanText(
        routeCrisis.operatingWindow || 'Before exclusivity, deposit, FX instruction, exchange, or seller commitment.',
      ),
    },
    key_metrics: {
      worst_case_loss: cleanText(
        routeCrisisOverall.worst_case_loss ||
          routeCrisisOverall.worstCaseLoss ||
          'Duty drag, trapped deposit timing, bank freeze, and family conflict after public commitment.',
      ),
      recovery_time: cleanText(
        routeCrisisOverall.recovery_time ||
          routeCrisisOverall.recoveryTime ||
          '72-hour proof drill before release; 7-day counsel, bank, and title close path after release.',
      ),
      required_buffer: cleanText(
        routeCrisisOverall.buffer_required ||
          routeCrisisOverall.bufferRequired ||
          'Primary rail, alternate rail, named signers, evidence index, and stop authority.',
      ),
    },
    scenarios: repairedRouteCrisisScenarios.length
      ? repairedRouteCrisisScenarios
      : crisisRows.map((row, index) => ({
          name: cleanText(row[0] || `Route crisis event ${index + 1}`),
          impact: cleanText(row[1] || row[2]),
          recovery: cleanText(row[3] || row[2]),
          risk_level: 'HIGH',
          sources: ['Route release-readiness packet'],
        })),
    priority_events: routePriorityEvents,
    route_risks: routeCrisisRisks,
    market_regimes: crisisMarketRegimes,
    bank_compliance_escalation_simulation: routeBankEscalations.map((item, index) => ({
      scenario: cleanText(item.scenario || `Bank escalation ${index + 1}`),
      breakpoint: cleanText(item.breakpoint),
      required_response: cleanText(item.required_response || item.requiredResponse),
    })),
    decision_flags: routeDecisionFlags.length
      ? routeDecisionFlags
      : [
          'Hold if primary and alternate bank rails are not accepted.',
          'Hold if family authority and succession records do not describe the same route.',
          'Stop if the purchase is justified as yield-first while duty drag and carrying cost are accepted for family control.',
        ],
    source_families: routeCrisisSourceFamilies.length
      ? routeCrisisSourceFamilies
      : ['Official bank-compliance source register', 'Family release evidence packet'],
    signal_count: routeCrisisSignalCount || 7,
    event_count: routeCrisisEventCount || 6,
    source_count: routeCrisisSourceCount,
    market_regime_count: finiteValue(routeCrisis.marketRegimeCount) || crisisMarketRegimes.length,
    decision_window_days: finiteValue(routeCrisis.decisionWindowDays) || 7,
    bottom_line: {
      one_sentence: crisisRead,
    },
  };

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
        advisors: [
          {
            role: 'UK tax counsel',
            burden: 'Written SDLT, surcharge, residence/IHT, relief-exclusion, overseas-property, and filing position controls whether capital can move.',
          },
          {
            role: 'UK property counsel',
            burden: 'Title class, seller authority, searches, restrictions, deposit terms, exchange mechanics, and completion timetable control whether the seller file can harden.',
          },
          {
            role: 'Bank rail owner',
            burden: 'Source rail, UK receiving rail, alternate rail, FX authority, transfer limits, signer authority, KYC, sanctions, and rate-refresh rule must clear before funds move.',
          },
          {
            role: 'Family-office operator / CFO',
            burden: 'Family-use purpose, carry owner, fairness record, stop authority, decision memory, and evidence-index location must be fixed before the route becomes executable.',
          },
        ],
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
    route_confidence_signal: 'Release-gated',
    route_confidence_detail:
      'The route has enough market, tax, duty, bank, title, source, and family-authority context to govern negotiation, while capital remains blocked until signed gates clear.',
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
    peer_cohort_stats: {
      total_peers: peersInCorridor,
      metric_cards: peerMetricCards,
      metric_labels: {
        total_peers: 'Corridor records',
        total_peers_subtitle: 'Route-pattern and capital-flow records mapped to the corridor',
        last_6_months: 'Flow intensity',
        last_6_months_subtitle: 'Route-readiness market-context index',
        avg_deal_value: 'Selected asset basis',
        avg_deal_value_subtitle: 'Guide-price conversion used by the memo',
      },
      native_driver_bullets: nativeDriverBullets,
      data_quality: 'Route-pattern and capital-flow read; not a public transaction-volume dataset.',
      is_relocating: false,
    },
    hnwi_trends: nativeDriverBullets,
    hnwi_trends_confidence: flowIntensity ? Math.min(0.95, Math.max(0.35, flowIntensity / 100)) : undefined,
    hnwi_trends_data_quality: {
      scientific_grounding: 'native_library_route_compiler',
      collections_queried: 3,
      data_sources: ['Route-pattern source records', 'Mayfair market/bid discipline file', 'Capital-flow readiness read'],
      note: 'Market context sharpens bid discipline and timing; release authority still comes from signed tax, bank, title, source, and family gates.',
    },
    capital_flow_data: capitalFlow,
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
      : routeCrisisStressRows,
    antifragile_resilience_test: antiFragilityRows.length
      ? rowsToObjects(antiFragilityRows, ['control', 'stress_response', 'release_effect', 'owner'])
      : routeAntiFragilityStressRows,
    crisis_data: routeCrisisData,
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
