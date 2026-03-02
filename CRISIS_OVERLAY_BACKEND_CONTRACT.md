# Crisis Intelligence Overlay — Complete Backend Migration Contract

## Overview

The crisis overlay colors **actual country boundaries** (GeoJSON polygons) on every map in the platform based on real-time geopolitical threat levels. Data is currently hardcoded in `lib/crisis-overlay.ts`. This document defines:

1. The complete data currently hardcoded in the frontend
2. The backend API contract (endpoint, models, response schema)
3. The frontend file architecture that consumes this data
4. The CSS animation system (stays frontend-only)
5. Step-by-step migration plan

---

## 1. API Endpoint

```
GET /api/crisis-intelligence
```

- **Auth**: Required (`withAuth` — same guard as war room / dashboard endpoints)
- **Cache**: 5-minute TTL (stale-while-revalidate)
- **Rate limit**: Standard `api` tier (100/min)

### Response Schema

```json
{
  "zones": [
    {
      "name": "Iran",
      "iso3": "IRN",
      "numeric_id": "364",
      "status": "red",
      "label": "Active Conflict",
      "detail": "Under sustained US-Israel bombardment..."
    }
  ],
  "alert": {
    "title": "ACTIVE CRISIS — Mar 1, 2026",
    "body": "Operation Epic Fury ongoing...",
    "cta": "Cross-border corridors through this region require immediate structural review.",
    "timestamp": "2026-03-01T13:30:00Z",
    "severity": "critical",
    "impacts": [
      {
        "asset": "Oil (Brent)",
        "movement": "SURGING",
        "detail": "$80-100/bbl if Hormuz stays closed"
      }
    ],
    "chokepoints": [
      "Strait of Hormuz — CLOSED (25% of global seaborne oil)"
    ]
  },
  "colors": {
    "red": {
      "fill": "#EF4444",
      "fill_opacity": 0.22,
      "stroke": "#EF4444",
      "stroke_opacity": 0.7,
      "text": "#EF4444",
      "label": "Active Conflict"
    },
    "amber": {
      "fill": "#F59E0B",
      "fill_opacity": 0.16,
      "stroke": "#F59E0B",
      "stroke_opacity": 0.55,
      "text": "#F59E0B",
      "label": "Under Strike"
    },
    "yellow": {
      "fill": "#FACC15",
      "fill_opacity": 0.12,
      "stroke": "#FACC15",
      "stroke_opacity": 0.40,
      "text": "#FACC15",
      "label": "High Stress"
    }
  },
  "updated_at": "2026-03-01T13:30:00Z"
}
```

---

## 2. Data Models (Python / Pydantic)

```python
from pydantic import BaseModel
from typing import Literal
from datetime import datetime


class CrisisZone(BaseModel):
    name: str                    # Country name (e.g. "Iran")
    iso3: str                    # ISO 3166-1 alpha-3 (e.g. "IRN")
    numeric_id: str              # ISO 3166-1 numeric (e.g. "364") — matches TopoJSON feature.id
    status: Literal["red", "amber", "yellow"]
    label: str                   # Short label (e.g. "Active Conflict", "Under Strike")
    detail: str                  # 1-2 sentence intelligence summary


class CrisisImpact(BaseModel):
    asset: str                   # e.g. "Oil (Brent)", "Gold", "US Equities"
    movement: str                # e.g. "SURGING", "DOWN", "UP", "$5,000/oz"
    detail: str                  # e.g. "$80-100/bbl if Hormuz stays closed"


class CrisisAlert(BaseModel):
    title: str                   # e.g. "ACTIVE CRISIS — Mar 1, 2026"
    body: str                    # 1-2 sentence summary
    cta: str                     # Call to action for HNWI clients
    timestamp: datetime
    severity: Literal["critical", "high", "elevated"]
    impacts: list[CrisisImpact]
    chokepoints: list[str]       # Trade chokepoint descriptions


class CrisisColors(BaseModel):
    fill: str                    # Hex color for polygon fill
    fill_opacity: float          # 0.0 - 1.0
    stroke: str                  # Hex color for polygon border
    stroke_opacity: float        # 0.0 - 1.0
    text: str                    # Hex color for labels/badges
    label: str                   # Human-readable tier name


class CrisisIntelligenceResponse(BaseModel):
    zones: list[CrisisZone]
    alert: CrisisAlert
    colors: dict[str, CrisisColors]  # Keys: "red", "amber", "yellow"
    updated_at: datetime
```

---

## 3. Complete Hardcoded Data (Current Seed)

### 3A. Crisis Zones (12 countries)

| # | Country | ISO3 | Numeric ID | Status | Label |
|---|---------|------|-----------|--------|-------|
| 1 | Iran | IRN | 364 | RED | Active Conflict |
| 2 | Israel | ISR | 376 | RED | Under Attack |
| 3 | Iraq | IRQ | 368 | RED | Bases Struck |
| 4 | UAE | ARE | 784 | AMBER | Missiles Inbound |
| 5 | Bahrain | BHR | 048 | AMBER | Under Strike |
| 6 | Qatar | QAT | 634 | AMBER | Under Strike |
| 7 | Kuwait | KWT | 414 | AMBER | Under Strike |
| 8 | Saudi Arabia | SAU | 682 | AMBER | Under Strike |
| 9 | Jordan | JOR | 400 | AMBER | Under Strike |
| 10 | Oman | OMN | 512 | YELLOW | High Stress |
| 11 | Lebanon | LBN | 422 | YELLOW | Hezbollah Pressure |
| 12 | Syria | SYR | 760 | YELLOW | Spillover Risk |

### 3B. Status Tier Definitions

```
RED:    Active conflict / war zone / bases struck
AMBER:  Under strike / missiles inbound / direct military impact
YELLOW: High stress / spillover risk / pressure building
```

### 3C. Detail Texts (per zone — full intelligence summaries)

```
Iran (IRN / 364):
"Under sustained US-Israel bombardment (Operation Roaring Lion / Epic Fury). ~900 strikes on 500+ targets. Supreme Leader Khamenei killed. Strait of Hormuz effectively closed. Rial collapsed ~30%."

Israel (ISR / 376):
"Conducting joint strikes on Iran with US. Under Iranian missile and drone barrages. Escalated air campaign against Hezbollah in Bekaa Valley."

Iraq (IRQ / 368):
"PMF fighters killed in strikes near Baghdad. Kataib Hezbollah threatens US bases. Drone attack near Erbil Airport. Green Zone barricaded. Militia members attempting to breach barricades."

UAE (ARE / 784):
"Iranian missiles struck Al-Dhafra Air Base, Dubai International Airport, Abu Dhabi Zayed Airport. UAE intercepted 137 missiles. Airspace closed."

Bahrain (BHR / 048):
"Explosions in Manama. US Navy Fifth Fleet HQ targeted. Airspace closed."

Qatar (QAT / 634):
"Iran launched 65 missiles and 12 drones. Al Udeid Air Base (largest US base) targeted. 16 injured. Airspace closed."

Kuwait (KWT / 414):
"Ali al-Salem Air Base hit by ballistic missiles. Kuwait International Airport struck by drone. Airspace closed."

Saudi Arabia (SAU / 682):
"Iranian retaliatory strikes on Saudi territory. Saudi-UAE rivalry now public and unprecedented. Coordinating defense after Iranian attacks."

Jordan (JOR / 400):
"Iranian missiles targeted Jordanian territory. Jordan intercepted missiles. Refuses to be a launchpad but will defend airspace."

Oman (OMN / 512):
"Not targeted by Iran. Historic mediator role. Serving as venue for US-Iran back-channel. Neutrality under pressure from regional escalation."

Lebanon (LBN / 422):
"Israel escalated air campaign against Hezbollah in Bekaa Valley. 6+ top missile commanders killed. Hezbollah squeezed by Iran's economic collapse."

Syria (SYR / 760):
"Transitional government offensive against Kurdish SDF. Clashes in Aleppo's Kurdish neighborhoods. Regional war spillover threatens fragile stability."
```

### 3D. Crisis Alert

```json
{
  "title": "ACTIVE CRISIS \u2014 Mar 1, 2026",
  "body": "Operation Epic Fury ongoing. Iranian retaliatory strikes across 7 Gulf states. Khamenei confirmed killed. Strait of Hormuz under stress.",
  "cta": "Cross-border corridors through this region require immediate structural review.",
  "timestamp": "2026-03-01T13:30:00Z",
  "severity": "critical"
}
```

### 3E. Market Impacts

| Asset | Movement | Detail |
|-------|----------|--------|
| Oil (Brent) | SURGING | $80-100/bbl if Hormuz stays closed |
| Gold | $5,000/oz | Rose 2%, reclaimed $5,000 per troy ounce |
| US Equities | DOWN | Dow -1.3%, S&P -0.4%, Nasdaq -1% |
| Safe Havens | UP | CHF, JPY, US Treasuries gaining |

### 3F. Trade Chokepoints

1. Strait of Hormuz — CLOSED (25% of global seaborne oil)
2. Red Sea — Houthis resuming attacks on shipping
3. Suez Canal — Carriers scaling back, 14-21 day detours

### 3G. Visual Colors

```json
{
  "red":    { "fill": "#EF4444", "fill_opacity": 0.22, "stroke": "#EF4444", "stroke_opacity": 0.70, "text": "#EF4444", "label": "Active Conflict" },
  "amber":  { "fill": "#F59E0B", "fill_opacity": 0.16, "stroke": "#F59E0B", "stroke_opacity": 0.55, "text": "#F59E0B", "label": "Under Strike" },
  "yellow": { "fill": "#FACC15", "fill_opacity": 0.12, "stroke": "#FACC15", "stroke_opacity": 0.40, "text": "#FACC15", "label": "High Stress" }
}
```

---

## 4. Numeric ID Reference (ISO 3166-1)

The `numeric_id` field is **critical** — it maps to TopoJSON feature IDs in the `world-atlas` npm package (50m resolution). The frontend uses `world-atlas/countries-50m.json` and matches features by `feature.id === numeric_id`.

### Current 12 zones

| Country | ISO3 | Numeric |
|---------|------|---------|
| Iran | IRN | 364 |
| Israel | ISR | 376 |
| Iraq | IRQ | 368 |
| UAE | ARE | 784 |
| Bahrain | BHR | 048 |
| Qatar | QAT | 634 |
| Kuwait | KWT | 414 |
| Saudi Arabia | SAU | 682 |
| Jordan | JOR | 400 |
| Oman | OMN | 512 |
| Lebanon | LBN | 422 |
| Syria | SYR | 760 |

### Common IDs for future additions

| Country | ISO3 | Numeric |
|---------|------|---------|
| Pakistan | PAK | 586 |
| Afghanistan | AFG | 004 |
| Ukraine | UKR | 804 |
| Russia | RUS | 643 |
| Yemen | YEM | 887 |
| Somalia | SOM | 706 |
| Sudan | SDN | 729 |
| Libya | LBY | 434 |
| Taiwan | TWN | 158 |
| North Korea | PRK | 408 |
| South Korea | KOR | 410 |
| China | CHN | 156 |
| India | IND | 356 |
| Turkey | TUR | 792 |
| Egypt | EGY | 818 |

---

## 5. Frontend Architecture (File Map)

### Data Layer

| File | Role | What changes on backend migration |
|------|------|-----------------------------------|
| `lib/crisis-overlay.ts` | Hardcoded data: types, zones, alert, colors, `CRISIS_ZONE_MAP`, `getCrisisCounts()` | Replace static exports with async fetch + SWR/React Query cache |

### Component Layer

| File | Role | What changes on backend migration |
|------|------|-----------------------------------|
| `components/map/crisis-overlay.tsx` | GeoJSON polygon renderer — lazy-loads TopoJSON, filters to crisis countries, applies styles + CSS classes, binds tooltips | Swap `CRISIS_ZONE_MAP` import → receive zones from fetched data |
| `components/map/crisis-alert-box.tsx` | Collapsible alert panel — pulsing dot, zone chips, market impacts grid, chokepoints, CTA | Swap `CRISIS_ALERT` / `getCrisisCounts` imports → receive from fetched data |
| `components/map/map-styles.tsx` | CSS keyframe animations for blinking polygons + tooltip styles | **No changes** (pure CSS, stays frontend) |
| `components/map/map-filter-controls.tsx` | Crisis Intel toggle button inside filter bar (mobile: icon-only, desktop: labeled) | **No changes** (just toggles alert box visibility) |
| `components/interactive-world-map.tsx` | Central map component — imports CrisisOverlay + CrisisAlertBox, manages `showCrisisAlert` state | Minor: pass fetched data down as props instead of components importing directly |

### Pages Using Crisis Overlay (7 total)

All pass `showCrisisOverlay={true}` to `InteractiveWorldMap`:

| Page | File |
|------|------|
| War Room | `app/(authenticated)/war-room/page.tsx` |
| Home Dashboard | `components/home-dashboard-elite.tsx` |
| Decision Memo — Audit Overview | `components/decision-memo/memo/AuditOverviewSection.tsx` |
| Decision Memo — Peer Intelligence | `components/decision-memo/memo/Page3PeerIntelligence.tsx` |
| Simulation Results | `app/(authenticated)/simulation/results/[sessionId]/assessment-results-client.tsx` |
| Ask Rohith — JARVIS Map | `components/ask-rohith-jarvis/visualizations/WorldMapViz.tsx` |
| Invest Scan Map Page | `components/pages/map-page.tsx` |

### How It Works (Data Flow)

```
1. Page renders <InteractiveWorldMap showCrisisOverlay={true} />
2. InteractiveWorldMap renders:
   - <CrisisOverlay visible={true} />     → Country polygons (always on)
   - <CrisisAlertBox visible={state} />   → Alert panel (toggled by Crisis Intel button)
   - Crisis Intel button in MapFilterControls (toggles alert box only)
3. CrisisOverlay:
   - Lazy-loads world-atlas/countries-50m.json (TopoJSON, ~756KB, cached)
   - Converts to GeoJSON via topojson-client
   - Filters features where feature.id is in CRISIS_ZONE_MAP
   - Applies per-zone fill/stroke/opacity + CSS animation class
   - Binds HTML tooltips (hover) with zone.name, zone.label, zone.detail
4. CrisisAlertBox:
   - Reads CRISIS_ALERT for title, body, CTA, impacts, chokepoints
   - Reads getCrisisCounts() for zone count chips
   - Collapsible: header always visible, details expandable
```

---

## 6. CSS Animation System (Frontend-Only)

These CSS keyframe animations live in `components/map/map-styles.tsx` and stay on the frontend. The backend only needs to know that the `status` field ("red"/"amber"/"yellow") determines which animation class is applied.

### Blinking Country Polygons

```css
/* RED zones: 3.5s cycle, dramatic blink */
@keyframes crisis-blink-red {
  0%, 100% { fill-opacity: 0.12; stroke-opacity: 0.4; }
  50%      { fill-opacity: 0.28; stroke-opacity: 0.75; }
}
.crisis-blink-red { animation: crisis-blink-red 3.5s ease-in-out infinite; }

/* AMBER zones: 4s cycle, moderate blink */
@keyframes crisis-blink-amber {
  0%, 100% { fill-opacity: 0.08; stroke-opacity: 0.3; }
  50%      { fill-opacity: 0.20; stroke-opacity: 0.55; }
}
.crisis-blink-amber { animation: crisis-blink-amber 4s ease-in-out infinite; }

/* YELLOW zones: 5s cycle, subtle blink */
@keyframes crisis-blink-yellow {
  0%, 100% { fill-opacity: 0.06; stroke-opacity: 0.25; }
  50%      { fill-opacity: 0.14; stroke-opacity: 0.40; }
}
.crisis-blink-yellow { animation: crisis-blink-yellow 5s ease-in-out infinite; }
```

### Alert Box Pulsing Dot

```css
@keyframes crisis-dot-ping {
  0% { transform: scale(1); opacity: 0.6; }
  75%, 100% { transform: scale(1.8); opacity: 0; }
}
```

### Crisis Tooltip

```css
.crisis-tooltip.leaflet-tooltip {
  background: rgba(10, 10, 10, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
  padding: 10px 12px !important;
  max-width: 290px !important;
  width: 290px !important;
}
```

### Status → CSS Class Mapping

| Status | CSS Class | Stroke Weight |
|--------|-----------|---------------|
| `red` | `crisis-blink-red` | 2px |
| `amber` | `crisis-blink-amber` | 1.5px |
| `yellow` | `crisis-blink-yellow` | 1px |

---

## 7. TypeScript Interfaces (Frontend)

These are the current TypeScript types in `lib/crisis-overlay.ts`:

```typescript
export type CrisisStatus = "red" | "amber" | "yellow";

export interface CrisisZone {
  name: string;
  iso3: string;
  numericId: string;       // Maps to TopoJSON feature.id
  status: CrisisStatus;
  label: string;
  detail: string;
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

// After migration, add:
export interface CrisisIntelligenceResponse {
  zones: CrisisZone[];
  alert: CrisisAlert;
  colors: Record<CrisisStatus, CrisisColorConfig>;
  updated_at: string;
}

export interface CrisisColorConfig {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeOpacity: number;
  text: string;
  label: string;
}
```

**Note on field naming**: Frontend uses `camelCase` (e.g. `numericId`, `fillOpacity`). Backend uses `snake_case` (e.g. `numeric_id`, `fill_opacity`). The frontend fetch layer should handle the conversion.

---

## 8. Data Source & Update Strategy

### Current Source

Data was sourced from the Knowledge Graph (1,966 geopolitical development nodes) as of **2026-03-01 19:00 IST**.

### Backend Implementation Plan

1. **Pull from KG `developments` collection**
   - Filter by tags: `geopolitical`, `conflict`, `military`, `sanctions`
   - Group by country/region

2. **Classify countries into tiers using MoEv4 Risk Assessor**
   - RED: Active conflict keywords (strikes, bombardment, war zone, killed)
   - AMBER: Direct military impact (missiles, targeted, airspace closed)
   - YELLOW: Indirect stress (spillover, pressure, mediator, escalation)

3. **Generate detail text**
   - Summarize active intelligence per country (1-2 sentences)
   - Include key metrics (number of strikes, casualties, economic impact)

4. **Generate alert summary**
   - Title: "ACTIVE CRISIS — {date}"
   - Body: 1-2 sentence overview of the most critical developments
   - CTA: Actionable advice for HNWI clients
   - Impacts: Pull from financial market data
   - Chokepoints: Identify affected trade routes

5. **Update frequency**
   - Standard: Every 6 hours (intelligence cycle)
   - Breaking: On critical events (new strikes, escalation, ceasefire)
   - Cache: 5-minute frontend cache prevents excessive API calls

---

## 9. Migration Steps

### Backend (FastAPI at `/Users/skyg/Desktop/Code/mu/`)

1. Create `api/crisis_intelligence.py` router
2. Create `services/crisis_intelligence/` module:
   - `models.py` — Pydantic models from Section 2
   - `seed_data.py` — Hardcoded seed from Section 3 (initial data)
   - `analyzer.py` — KG query + MoEv4 classification logic
3. Register router in main app
4. Add 5-minute in-memory cache (or Redis if available)

### Frontend (Next.js at `/Users/skyg/Desktop/Code/hnwi-chronicles/`)

1. **`lib/crisis-overlay.ts`** — Replace static exports with:
   ```typescript
   // Fetch from backend with 5-min SWR cache
   export async function fetchCrisisIntelligence(): Promise<CrisisIntelligenceResponse> {
     const res = await fetch(`${API_BASE_URL}/api/crisis-intelligence`);
     return res.json();
   }
   ```

2. **`components/interactive-world-map.tsx`** — Fetch data at map level, pass down:
   ```typescript
   const { data: crisisData } = useSWR('/api/crisis-intelligence', fetchCrisisIntelligence, {
     refreshInterval: 300_000, // 5 minutes
   });
   ```

3. **`components/map/crisis-overlay.tsx`** — Accept zones + colors as props instead of importing:
   ```typescript
   interface CrisisOverlayProps {
     visible: boolean;
     zones: CrisisZone[];      // from API
     colors: Record<string, CrisisColorConfig>;  // from API
   }
   ```

4. **`components/map/crisis-alert-box.tsx`** — Accept alert + counts as props:
   ```typescript
   interface CrisisAlertBoxProps {
     visible: boolean;
     theme: string;
     alert: CrisisAlert;       // from API
     counts: { red: number; amber: number; yellow: number; total: number };
   }
   ```

5. **No changes needed**: `map-styles.tsx`, `map-filter-controls.tsx`, page-level files

---

## 10. Future Enhancements

- **WebSocket/SSE**: Push updates on breaking events instead of polling
- **Historical timeline**: Show how crisis zones evolved over time
- **Severity scoring**: Numeric 0-100 score per zone (not just 3 tiers)
- **HNWI impact analysis**: Connect crisis zones to user's Crown Vault assets for personalized risk alerts
- **Migration corridor alerts**: Flag active wealth migration corridors through crisis zones
- **Multiple concurrent crises**: Support overlapping crisis events (e.g. Middle East + Taiwan Strait)
