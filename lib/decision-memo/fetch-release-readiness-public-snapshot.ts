import type {
  ReleaseReadinessSharePayload,
  ReleaseReadinessSourceMap,
} from '@/lib/decision-memo/build-release-readiness-share-surface';
import { buildRouteZeroTrustMoveIntake } from '@/lib/decision-memo/route-intelligence-v2';
import {
  encodeDecisionMemoIdForPath,
  resolvePublicDecisionMemoId,
} from '@/lib/decision-memo/memo-id-aliases';

export const RELEASE_READINESS_PUBLIC_SNAPSHOT_CONTRACT =
  'hnwi_release_readiness_public_snapshot_v1';

const KINGDOM_CORE_PUBLIC_READ_URL =
  process.env.KINGDOM_CORE_BASE_URL?.trim().replace(/\/$/, '') ||
  'https://kingdom-core.montaigne.co';

const RELEASE_READINESS_SOURCE_EVIDENCE_CONTRACT =
  'granthika_release_readiness_source_evidence_aquarium_v1';

export class ReleaseReadinessPublicSnapshotError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ReleaseReadinessPublicSnapshotError';
    this.status = status;
  }
}

export type ReleaseReadinessPublicSnapshotPayload = ReleaseReadinessSharePayload & {
  success?: boolean;
  snapshotContract?: typeof RELEASE_READINESS_PUBLIC_SNAPSHOT_CONTRACT;
  intakeId?: string;
  intakeType?: string;
  generatedAt?: string;
  publishedReadModel?: boolean;
  payloadBytes?: number;
  cache?: {
    cacheable?: boolean;
    sMaxAgeSeconds?: number;
    staleWhileRevalidateSeconds?: number;
  };
  sourceMap?: ReleaseReadinessSourceMap & {
    source?: string;
    builder?: string;
    omits?: string[];
  };
  productAquariumPacket?: {
    contract?: string;
    authority?: string;
    storageRail?: string;
    graphEdgeShape?: string;
    counts?: Record<string, number>;
    outcomeAtoms?: string[];
    readback?: {
      status?: string;
      dueStates?: string[];
    };
  };
  degradedReason?: unknown;
};

type BackendErrorPayload = {
  detail?: unknown;
  error?: unknown;
  degradedReason?: unknown;
};

type RecordLike = Record<string, any>;

function recordValue(value: unknown): RecordLike {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as RecordLike) : {};
}

function arrayValue<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function numberValue(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function stringList(value: unknown): string[] {
  return arrayValue(value)
    .map((item) => {
      if (typeof item === 'string') return textValue(item);
      const record = recordValue(item);
      return textValue(record.label || record.title || record.name || record.detail || record.summary || '');
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
  const resolved = textValue(value);
  return resolved && !genericCrisisText(resolved) ? resolved : fallback;
}

function repeatedMayfairCrisisBody(value: unknown): boolean {
  const resolved = textValue(value);
  return (
    /Bank acceptance or transfer timing can stop the purchase after seller timing starts/i.test(resolved) ||
    /Route releases only with primary and alternate bank acceptance, signed source evidence, and transfer authority/i.test(resolved)
  );
}

function crisisConcept(value: string): string {
  if (/memory|decision|retrieval/i.test(value)) return 'decision-memory';
  if (/record|mismatch|document|conflict/i.test(value)) return 'record-mismatch';
  if (/72|absence|unavailable|signer|substitution/i.test(value)) return 'absence';
  if (/counsel|objection|question/i.test(value)) return 'counsel';
  if (/seller|deposit|timing|exchange|exclusivity/i.test(value)) return 'seller-timing';
  if (/tax|residence|fig|iht|school|education/i.test(value)) return 'tax-residence';
  if (/title|search|survey|security|privacy|insurance/i.test(value)) return 'property-operating';
  if (/bank|rail|kyc|sow|sof|source|fund|transfer/i.test(value)) return 'bank-rail';
  if (/family|fairness|veto|g1|g2|g3|use|succession/i.test(value)) return 'family-fairness';
  return '';
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

  if (/bank|rail|sow|sof|source|fund/i.test(control)) {
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

  return [
    resilienceTemplate('decision memory', index),
    resilienceTemplate('counsel objection', index),
    resilienceTemplate('record mismatch', index),
    resilienceTemplate('family fairness', index),
  ][index % 4];
}

function resilienceScenarioFromControl(row: RecordLike, index: number): RecordLike {
  const control = textValue(row.control || row.test || row.scenario || row.event || row.name || '');
  const template = resilienceTemplate(control, index);
  return {
    id: textValue(row.id) || `route_resilience_${index + 1}`,
    name: specificCrisisText(row.name || row.scenario || row.event, template.name),
    impact: specificCrisisText(
      row.stress_event || row.stress_response || row.failure || row.consequence || row.impact,
      template.impact,
    ),
    recovery: specificCrisisText(
      row.release_test || row.release_effect || row.release_response || row.mitigation || row.response,
      template.recovery,
    ),
    risk_level: textValue(row.risk_level || row.status || template.riskLevel),
    sources: stringList(row.sources).length ? stringList(row.sources) : ['Family release evidence packet'],
    impact_channels: stringList(row.impact_channels).length ? stringList(row.impact_channels) : template.channels,
  };
}

function normalizeCrisisScenario(row: RecordLike, index: number): RecordLike {
  const name = textValue(row.name || row.scenario || row.event) || `Route crisis event ${index + 1}`;
  const template = resilienceTemplate(name, index);
  const rawImpact = row.impact || row.route_consequence || row.consequence;
  const rawRecovery = row.recovery || row.required_response || row.hard_next_move || row.response;
  const impact = repeatedMayfairCrisisBody(rawImpact) ? template.impact : specificCrisisText(rawImpact, template.impact);
  const recovery = repeatedMayfairCrisisBody(rawRecovery) ? template.recovery : specificCrisisText(rawRecovery, template.recovery);
  const channels = stringList(row.impact_channels);
  return {
    id: textValue(row.id) || `route_crisis_${index + 1}`,
    name,
    impact,
    recovery,
    risk_level: textValue(row.risk_level || row.status || template.riskLevel),
    sources: stringList(row.sources),
    impact_channels: channels.length ? channels : template.channels,
  };
}

function repairRouteCrisisResilience(route: RecordLike): RecordLike {
  const crisis = recordValue(route.crisisResilience);
  if (!Object.keys(crisis).length) return route;

  const existingRows = arrayValue<RecordLike>(crisis.scenarios);
  const specificRows = existingRows
    .map((row, index) => normalizeCrisisScenario(row, index))
    .filter((row) => !genericCrisisText(`${row.name} ${row.impact} ${row.recovery}`));

  const usedConcepts = new Set(
    specificRows
      .map((row) => crisisConcept(`${row.name} ${row.impact} ${row.recovery}`))
      .filter(Boolean),
  );
  const usedNames = new Set(specificRows.map((row) => textValue(row.name).toLowerCase()).filter(Boolean));
  const antiFragilityRows = arrayValue<RecordLike>(recordValue(route.antiFragility).stressTest);
  const routeSpecificRows: RecordLike[] = [];

  antiFragilityRows.forEach((row, index) => {
    const scenario = resilienceScenarioFromControl(row, index);
    if (genericCrisisText(`${scenario.name} ${scenario.impact} ${scenario.recovery}`)) return;
    const name = textValue(scenario.name).toLowerCase();
    if (!name || usedNames.has(name)) return;
    const concept = crisisConcept(`${scenario.name} ${scenario.impact} ${scenario.recovery}`);
    if (concept && usedConcepts.has(concept)) return;
    if (concept) usedConcepts.add(concept);
    usedNames.add(name);
    routeSpecificRows.push(scenario);
  });

  const repairedScenarios = [...specificRows, ...routeSpecificRows].slice(0, 8);
  if (!repairedScenarios.length) return route;

  return {
    ...route,
    crisisResilience: {
      ...crisis,
      scenarios: repairedScenarios,
      eventCount: Math.max(numberValue(crisis.eventCount), repairedScenarios.length),
      signalCount: Math.max(numberValue(crisis.signalCount), repairedScenarios.length),
    },
  };
}

export function repairReleaseReadinessPublicSnapshotPayload(
  payload: ReleaseReadinessPublicSnapshotPayload,
): ReleaseReadinessPublicSnapshotPayload {
  const routeIntelligence = recordValue(payload.routeIntelligenceV2);
  if (!Object.keys(routeIntelligence).length) return payload;

  const repairRouteForPublicGet = (route: RecordLike): RecordLike => {
    const repairedRoute = repairRouteCrisisResilience(route);
    const zeroTrustMoveIntake = buildRouteZeroTrustMoveIntake(
      repairedRoute as any,
      repairedRoute.zeroTrustMoveIntake ?? repairedRoute.releaseEvidencePack,
    );
    return {
      ...repairedRoute,
      zeroTrustMoveIntake,
      releaseEvidencePack: zeroTrustMoveIntake,
    };
  };

  const repairedOptions = arrayValue<RecordLike>(routeIntelligence.routeOptions).map(repairRouteForPublicGet);
  const byId = new Map(repairedOptions.map((route) => [textValue(route.id), route]));
  const repairRouteReference = (value: unknown): unknown => {
    const route = recordValue(value);
    if (!Object.keys(route).length) return value;
    const id = textValue(route.id);
    return id && byId.has(id) ? byId.get(id) : repairRouteForPublicGet(route);
  };
  const selectedLiveOption = repairRouteReference(routeIntelligence.selectedLiveOption) as RecordLike;
  const proposedRoute = repairRouteReference(routeIntelligence.proposedRoute) as RecordLike;
  const topLevelCrisisSeed = repairRouteCrisisResilience({
    crisisResilience: routeIntelligence.crisisResilience,
    antiFragility:
      routeIntelligence.antiFragility ||
      selectedLiveOption.antiFragility ||
      proposedRoute.antiFragility ||
      repairedOptions[0]?.antiFragility,
  });
  const topLevelCrisis = recordValue(topLevelCrisisSeed.crisisResilience);
  const selectedCrisis = recordValue(selectedLiveOption.crisisResilience || proposedRoute.crisisResilience);
  const topLevelRows = arrayValue<RecordLike>(topLevelCrisis.scenarios);
  const selectedRows = arrayValue<RecordLike>(selectedCrisis.scenarios);
  const originalTopLevelRows = arrayValue<RecordLike>(recordValue(routeIntelligence.crisisResilience).scenarios);
  const originalTopLevelWasGeneric =
    !originalTopLevelRows.length ||
    originalTopLevelRows.some((row) =>
      genericCrisisText(`${textValue(row.name || row.scenario)} ${textValue(row.impact)} ${textValue(row.recovery)}`),
    );
  const publicCrisis =
    selectedRows.length && (originalTopLevelWasGeneric || topLevelRows.length < selectedRows.length)
      ? selectedCrisis
      : topLevelCrisis;

  return {
    ...payload,
    routeIntelligenceV2: ({
      ...routeIntelligence,
      routeOptions: repairedOptions,
      selectedLiveOption,
      proposedRoute,
      crisisResilience: Object.keys(publicCrisis).length
        ? publicCrisis
        : routeIntelligence.crisisResilience,
    } as unknown) as ReleaseReadinessPublicSnapshotPayload['routeIntelligenceV2'],
  };
}

function errorText(value: BackendErrorPayload): string {
  const message = value.detail ?? value.error ?? value.degradedReason;
  return typeof message === 'string' && message.trim()
    ? message.trim()
    : 'Release readiness public snapshot is not available.';
}

function assertPublicSnapshotPayload(
  value: unknown,
): asserts value is ReleaseReadinessPublicSnapshotPayload {
  if (!value || typeof value !== 'object') {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot payload was empty.');
  }

  const payload = value as Partial<ReleaseReadinessPublicSnapshotPayload>;
  if (payload.success === false) {
    throw new ReleaseReadinessPublicSnapshotError(
      typeof payload.degradedReason === 'string'
        ? payload.degradedReason
        : 'Release readiness public snapshot is not ready.',
      503,
    );
  }

  if (payload.snapshotContract !== RELEASE_READINESS_PUBLIC_SNAPSHOT_CONTRACT) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot contract mismatch.');
  }

  if (!payload.reference || !payload.selectedRoute || !Array.isArray(payload.routeOptions)) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot is missing required fields.');
  }

  const routeIntelligence = payload.routeIntelligenceV2;
  if (
    !routeIntelligence ||
    !Array.isArray(routeIntelligence.routeOptions) ||
    routeIntelligence.routeOptions.length === 0
  ) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot is missing route intelligence.');
  }
}

function assertCompletedMemoPayload(payload: ReleaseReadinessPublicSnapshotPayload): void {
  if (!Array.isArray(payload.publicSources) || payload.publicSources.length === 0) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot has no public source rows.', 503);
  }

  if (!Array.isArray(payload.privateEvidence) || payload.privateEvidence.length < 8) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot is missing private evidence classes.', 503);
  }

  if (!Array.isArray(payload.methodDrivers) || payload.methodDrivers.length === 0) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot is missing route judgment drivers.', 503);
  }

  if (!Array.isArray(payload.citations) || payload.citations.length === 0) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot is missing central citation rows.', 503);
  }

  if (!Array.isArray(payload.evidenceSections) || payload.evidenceSections.length === 0) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot is missing evidence methodology sections.', 503);
  }

  const sourceMap = payload.sourceMap;
  if (
    !sourceMap ||
    sourceMap.readback?.status !== 'central_source_read_model_ready' ||
    (sourceMap.readback?.dueStates?.length ?? 0) > 0 ||
    (sourceMap.centralSourceBriefs?.missingSourceBriefRows ?? 1) > 0 ||
    sourceMap.evidenceRows.privateEvidenceClasses !== payload.privateEvidence.length
  ) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public source map is not clean.', 503);
  }

  const aquarium = payload.productAquariumPacket;
  if (
    !aquarium ||
    aquarium.contract !== RELEASE_READINESS_SOURCE_EVIDENCE_CONTRACT ||
    aquarium.readback?.status !== 'accepted' ||
    (aquarium.readback?.dueStates?.length ?? 0) > 0
  ) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness Product Aquarium packet is not accepted.', 503);
  }

  const routes = payload.routeIntelligenceV2.routeOptions;
  if (!Array.isArray(routes) || routes.length < 5) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot is missing the five route options.', 503);
  }

  const requiredRouteFields = [
    'evidenceGates',
    'responsibilityTransfer',
    'recordMismatchMap',
    'counselQuestionPack',
    'stressSignals',
    'antiFragility',
    'crisisResilience',
    'g1g2g3',
    'sourceBoundary',
  ];
  const incompleteRoute = routes.find((route) => {
    const record = route as unknown as Record<string, unknown>;
    const metrics = (record.metrics && typeof record.metrics === 'object' ? record.metrics : {}) as Record<string, unknown>;
    const acquisitionRoute = metrics.routeHasAcquisition !== false;
    return requiredRouteFields.some((field) => {
      const value = record[field];
      if (Array.isArray(value)) return value.length === 0;
      if (value && typeof value === 'object') return Object.keys(value).length === 0;
      return !value;
    }) || (acquisitionRoute && (!Array.isArray(record.scenarios) || record.scenarios.length === 0));
  });

  if (incompleteRoute) {
    throw new ReleaseReadinessPublicSnapshotError(
      `Release readiness route intelligence is incomplete for ${incompleteRoute.routeName || incompleteRoute.id}.`,
      503,
    );
  }

  if (
    /Family resilience test\s+\d+|Authority, record, or adviser dependency blocks clean release|Name owner, proof file, alternate action, and stop authority/i.test(
      JSON.stringify(routes),
    )
  ) {
    throw new ReleaseReadinessPublicSnapshotError(
      'Release readiness route crisis intelligence contains anonymous resilience fallback rows.',
      503,
    );
  }
}

export async function fetchReleaseReadinessPublicSnapshot(
  intakeId: string,
): Promise<ReleaseReadinessPublicSnapshotPayload> {
  const publicIntakeId = resolvePublicDecisionMemoId(intakeId);
  const publicPathId = encodeDecisionMemoIdForPath(publicIntakeId);
  const response = await fetch(
    `${KINGDOM_CORE_PUBLIC_READ_URL}/api/decision-memo/release-readiness/public/${publicPathId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    },
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ReleaseReadinessPublicSnapshotError(
      errorText((payload ?? {}) as BackendErrorPayload),
      response.status,
    );
  }

  assertPublicSnapshotPayload(payload);
  const snapshot = repairReleaseReadinessPublicSnapshotPayload({
    ...payload,
    reference: publicIntakeId,
  });
  assertCompletedMemoPayload(snapshot);
  return snapshot;
}
