// lib/crisis-overlay.ts
// Crisis Intelligence Overlay — country-level threat classification
// All data fetched from backend API: GET /api/crisis-intelligence

import { secureApi } from "@/lib/secure-api";

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

export type CrisisDomain = "geopolitical" | "ai" | "macro";

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
function transformBackendResponse(data: any): CrisisIntelligenceResponse {
  const zones: CrisisZone[] = (data.zones || []).map((z: any) => ({
    name: z.name,
    iso3: z.iso3,
    numericId: z.numeric_id || z.numericId,
    status: z.status,
    label: z.label,
    detail: z.detail,
    crisisDomain: z.crisis_domain || z.crisisDomain || undefined,
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
          status: loc.status || undefined,
          crisis_domain: loc.crisis_domain || undefined,
          workforce_impact: loc.workforce_impact || undefined,
          asset_impacts: loc.asset_impacts || undefined,
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
  // Viewer accounts (audit.viewer / hnwi@montaigne.co) authenticate via report Bearer token.
  // The report token is stored in sessionStorage by the audit popup on login.
  // We pass it as Authorization so the Next.js route can forward it to the backend —
  // the SecurityMiddleware accepts any valid JWT signed with the same secret.
  const reportToken =
    typeof window !== "undefined"
      ? sessionStorage.getItem("latest_report_token")
      : null;

  if (reportToken) {
    const resp = await fetch("/api/crisis-intelligence", {
      credentials: "include",
      headers: { Authorization: `Bearer ${reportToken}` },
    });
    if (!resp.ok) throw new Error(`${resp.status}`);
    return transformBackendResponse(await resp.json());
  }

  const data = await secureApi.get("/api/crisis-intelligence", true);
  return transformBackendResponse(data);
}

// ─── DERIVED HELPERS ─────────────────────────────────────────────────

export function buildZoneMap(zones: CrisisZone[]): Record<string, CrisisZone> {
  // Hierarchy: War > Geopolitical > AI. If duplicate numeric IDs exist,
  // keep the highest-severity entry (red > amber > yellow).
  const statusRank: Record<string, number> = { red: 0, amber: 1, yellow: 2 };
  const map: Record<string, CrisisZone> = {};
  for (const z of zones) {
    const existing = map[z.numericId];
    if (!existing || (statusRank[z.status] ?? 9) < (statusRank[existing.status] ?? 9)) {
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
