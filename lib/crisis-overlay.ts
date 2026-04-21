// lib/crisis-overlay.ts
// Crisis Intelligence Overlay — country-level threat classification
// All data fetched from backend API: GET /api/crisis-intelligence


const CRISIS_CACHE_TTL_MS = 5000
let cachedCrisisIntelligence: CrisisIntelligenceResponse | null = null
let cachedCrisisIntelligenceAt = 0
let inflightCrisisIntelligence: Promise<CrisisIntelligenceResponse> | null = null

export type CrisisStatus = "red" | "amber" | "yellow";

export interface CrisisZone {
  name: string;
  iso3: string;
  /** ISO 3166-1 numeric code — matches world-atlas TopoJSON IDs */
  numericId: string;
  status: CrisisStatus;
  label: string;
  detail: string;
  /** Domain determines polygon color: war=red/amber/yellow, everything else=fuchsia */
  crisisDomain?: CrisisDomain;
}

export interface CrisisAlert {
  title: string;
  body: string;
  cta: string;
  timestamp: string;
  severity: "critical" | "high" | "elevated";
  impacts: CrisisImpact[];
  chokepoints: string[];
}

export interface CrisisImpact {
  asset: string;
  movement: string;
  value?: string;
  current_value?: string;
  previous_value?: string;
  delta?: string;
  delta_value?: string;
  direction?: "up" | "down" | "flat";
  detail: string;
}

export interface CrisisColorConfig {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeOpacity: number;
  text: string;
  label: string;
}

export type CrisisDomain = "war" | "geopolitical" | "ai" | "macro" | "banking";

export interface CrisisWorkforceImpact {
  companies: string[];
  total_jobs_affected: number;
  sectors: string[];
  detail: string;
}

export interface CrisisLocation {
  key: string;
  lat: number;
  lng: number;
  event: string;
  event_date?: string;
  status?: CrisisStatus;
  crisis_domain?: CrisisDomain;
  workforce_impact?: CrisisWorkforceImpact;
  asset_impacts?: string[];
}

export interface CrisisIntelligenceResponse {
  zones: CrisisZone[];
  alert: CrisisAlert;
  colors: Record<CrisisStatus, CrisisColorConfig>;
  locations: CrisisLocation[];
  updatedAt: string;
}

export interface CrisisCounts {
  red: number;
  amber: number;
  yellow: number;
  total: number;
}

// ─── FETCH FROM BACKEND ─────────────────────────────────────────────

// Convert snake_case backend response → camelCase frontend types
function normalizeCrisisDomain(value: unknown): CrisisDomain | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  switch (value) {
    case "military_conflict":
      return "war";
    case "war":
    case "geopolitical":
    case "ai":
    case "macro":
    case "banking":
      return value;
    default:
      return undefined;
  }
}

function transformBackendResponse(data: any): CrisisIntelligenceResponse {
  const zones: CrisisZone[] = (data.zones || []).map((z: any) => ({
    name: z.name,
    iso3: z.iso3,
    numericId: z.numeric_id || z.numericId,
    status: z.status,
    label: z.label,
    detail: z.detail,
    crisisDomain: normalizeCrisisDomain(z.crisis_domain || z.crisisDomain),
  }));

  const alert: CrisisAlert = {
    title: data.alert?.title || "",
    body: data.alert?.body || "",
    cta: data.alert?.cta || "",
    timestamp: data.alert?.timestamp || "",
    severity: data.alert?.severity || "elevated",
    impacts: (data.alert?.impacts || []).map((i: any) => ({
      asset: i.asset,
      movement: i.movement,
      value: i.value,
      current_value: i.current_value,
      previous_value: i.previous_value,
      delta: i.delta,
      delta_value: i.delta_value,
      direction: i.direction,
      detail: i.detail,
    })),
    chokepoints: data.alert?.chokepoints || [],
  };

  const colors: Record<CrisisStatus, CrisisColorConfig> = {} as any;
  for (const tier of ["red", "amber", "yellow"] as CrisisStatus[]) {
    const c = data.colors?.[tier];
    if (c) {
      colors[tier] = {
        fill: c.fill,
        fillOpacity: c.fill_opacity ?? c.fillOpacity ?? 0.15,
        stroke: c.stroke,
        strokeOpacity: c.stroke_opacity ?? c.strokeOpacity ?? 0.5,
        text: c.text,
        label: c.label,
      };
    }
  }

  // Backend sends locations as dict { key: { lat, lng, event, crisis_domain, ... } }
  const locations: CrisisLocation[] = [];
  if (data.locations && typeof data.locations === "object") {
    for (const [key, loc] of Object.entries(data.locations as Record<string, any>)) {
      if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
        locations.push({
          key,
          lat: loc.lat,
          lng: loc.lng,
          event: loc.event || "",
          event_date: loc.event_date || undefined,
          status: loc.status || undefined,
          crisis_domain: normalizeCrisisDomain(loc.crisis_domain),
          workforce_impact: loc.workforce_impact || undefined,
          asset_impacts: Array.isArray(loc.asset_impacts)
            ? loc.asset_impacts.map((a: any) =>
                typeof a === "string" ? a : a.asset || a.movement || String(a)
              )
            : undefined,
        });
      }
    }
  }

  return {
    zones,
    alert,
    colors,
    locations,
    updatedAt: data.updated_at || data.updatedAt || "",
  };
}

export async function fetchCrisisIntelligence(): Promise<CrisisIntelligenceResponse> {
  const now = Date.now()
  if (cachedCrisisIntelligence && now - cachedCrisisIntelligenceAt < CRISIS_CACHE_TTL_MS) {
    return cachedCrisisIntelligence
  }

  if (inflightCrisisIntelligence) {
    return inflightCrisisIntelligence
  }

  inflightCrisisIntelligence = (async () => {
    const bust = Date.now()
    const response = await fetch(`/api/crisis-intelligence?t=${bust}`, {
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })

    if (!response.ok) {
      throw new Error(`${response.status}`)
    }

    const payload = transformBackendResponse(await response.json())
    cachedCrisisIntelligence = payload
    cachedCrisisIntelligenceAt = Date.now()
    return payload
  })().finally(() => {
    inflightCrisisIntelligence = null
  })

  return inflightCrisisIntelligence
}

// ─── DERIVED HELPERS ─────────────────────────────────────────────────

export function buildZoneMap(zones: CrisisZone[]): Record<string, CrisisZone> {
  // Prefer the highest-severity zone first, then break ties by domain.
  // War must outrank non-war domains; within non-war ties, geopolitical
  // outranks AI, which outranks banking/macro.
  const statusRank: Record<string, number> = { red: 0, amber: 1, yellow: 2 };
  const domainRank: Record<string, number> = {
    war: 0,
    geopolitical: 1,
    ai: 2,
    banking: 3,
    macro: 4,
  };
  const map: Record<string, CrisisZone> = {};
  for (const z of zones) {
    const existing = map[z.numericId];
    const candidateStatus = statusRank[z.status] ?? 9;
    const existingStatus = existing ? (statusRank[existing.status] ?? 9) : 9;
    const candidateDomain = domainRank[z.crisisDomain || "macro"] ?? 9;
    const existingDomain = existing ? (domainRank[existing.crisisDomain || "macro"] ?? 9) : 9;

    if (
      !existing ||
      candidateStatus < existingStatus ||
      (candidateStatus === existingStatus && candidateDomain < existingDomain)
    ) {
      map[z.numericId] = z;
    }
  }
  return map;
}

export function computeCrisisCounts(zones: CrisisZone[]): CrisisCounts {
  const red = zones.filter(z => z.status === "red").length;
  const amber = zones.filter(z => z.status === "amber").length;
  const yellow = zones.filter(z => z.status === "yellow").length;
  return { red, amber, yellow, total: red + amber + yellow };
}
