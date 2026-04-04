// components/map/crisis-overlay.tsx
// Crisis Intelligence Overlay — colours actual country boundaries
// Uses world-atlas 50m TopoJSON → converted to GeoJSON via topojson-client
//
// Color rule:
//   War (military_conflict) → red/amber/yellow (severity-based)
//   Everything else         → fuchsia (AI, banking, geopolitical, macro)

"use client";

import React, { useMemo, useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { CrisisZone, CrisisColorConfig, CrisisStatus } from "@/lib/crisis-overlay";

interface CrisisOverlayProps {
  visible: boolean;
  zoneMap: Record<string, CrisisZone>;
  colors: Record<CrisisStatus, CrisisColorConfig>;
}

// ─── Non-war polygon color palette (fuchsia) ─────────────────────────
// Used for: AI, banking stress, geopolitical (non-war), macro, recession
// War (military_conflict) uses the red/amber/yellow palette from props.
// Fuchsia is distinct from: war red, audit cyan (#67E8F9), chart purple (#8B5CF6)
const FUCHSIA_COLORS = {
  red: {
    fill: "#D946EF",       // fuchsia-500 — critical severity
    fillOpacity: 0.20,
    stroke: "#D946EF",
    strokeOpacity: 0.65,
    text: "#E879F9",       // fuchsia-400
  },
  amber: {
    fill: "#E879F9",       // fuchsia-400 — elevated severity
    fillOpacity: 0.14,
    stroke: "#E879F9",
    strokeOpacity: 0.50,
    text: "#E879F9",
  },
  yellow: {
    fill: "#F0ABFC",       // fuchsia-300 — monitoring severity
    fillOpacity: 0.16,
    stroke: "#F0ABFC",
    strokeOpacity: 0.5,
    text: "#F0ABFC",
  },
} as const;

// ─── Antimeridian fix ─────────────────────────────────────────────────

function fixAntimeridianRing(ring: number[][]): number[][] {
  if (ring.length < 2) return ring;
  const result: number[][] = [ring[0]];
  for (let i = 1; i < ring.length; i++) {
    let [lng, lat, ...rest] = ring[i];
    const prevLng = result[i - 1][0];
    while (lng - prevLng > 180) lng -= 360;
    while (lng - prevLng < -180) lng += 360;
    result.push([lng, lat, ...rest]);
  }
  return result;
}

function fixAntimeridianFeature(feature: Feature): Feature {
  const geom = feature.geometry as any;
  if (geom.type === "Polygon") {
    return {
      ...feature,
      geometry: { ...geom, coordinates: geom.coordinates.map(fixAntimeridianRing) },
    };
  }
  if (geom.type === "MultiPolygon") {
    return {
      ...feature,
      geometry: {
        ...geom,
        coordinates: geom.coordinates.map((poly: number[][][]) =>
          poly.map(fixAntimeridianRing)
        ),
      },
    };
  }
  return feature;
}

// Lazy-load and convert TopoJSON → GeoJSON (only once)
let cachedAllCountries: FeatureCollection<Geometry> | null = null;

async function loadAllCountriesGeoJSON(): Promise<FeatureCollection<Geometry>> {
  if (cachedAllCountries) return cachedAllCountries;

  const [topoData, topojsonClient] = await Promise.all([
    import("world-atlas/countries-50m.json"),
    import("topojson-client"),
  ]);

  const topo = topoData.default || topoData;
  cachedAllCountries = topojsonClient.feature(
    topo as any,
    (topo as any).objects.countries
  ) as unknown as FeatureCollection<Geometry>;

  return cachedAllCountries;
}

export function CrisisOverlay({ visible, zoneMap, colors }: CrisisOverlayProps) {
  const [allCountries, setAllCountries] = useState<FeatureCollection<Geometry> | null>(null);

  useEffect(() => {
    if (visible && !allCountries) {
      loadAllCountriesGeoJSON().then(setAllCountries);
    }
  }, [visible, allCountries]);

  // Filter to crisis countries whenever zoneMap or allCountries changes
  const geoData = useMemo<FeatureCollection<Geometry> | null>(() => {
    if (!allCountries) return null;
    const crisisIds = new Set(Object.keys(zoneMap));
    if (crisisIds.size === 0) return null;

    return {
      type: "FeatureCollection" as const,
      features: allCountries.features
        .filter((f): f is Feature<Geometry> => Boolean(f.id) && crisisIds.has(String(f.id)))
        .map(fixAntimeridianFeature),
    };
  }, [allCountries, zoneMap]);

  // Stable key to force GeoJSON re-render when data changes
  const renderKey = useMemo(
    () => `crisis-${visible}-${geoData ? geoData.features.length : "pending"}`,
    [visible, geoData]
  );

  if (!visible || !geoData) return null;

  return (
    <GeoJSON
      key={renderKey}
      data={geoData}
      style={(feature) => {
        if (!feature || !feature.id) return {};
        const zone = zoneMap[String(feature.id)];
        if (!zone) return { fillOpacity: 0, weight: 0 };

        const isWar = zone.crisisDomain === "war";
        const isRed = zone.status === "red";
        const isAmber = zone.status === "amber";

        if (isWar) {
          // War zones (military_conflict) — red/amber/yellow palette
          const tierColors = colors[zone.status];
          const dimFactor = isRed ? 1 : isAmber ? 0.4 : 0.25;

          return {
            fillColor: tierColors.fill,
            fillOpacity: (tierColors.fillOpacity || 0.15) * dimFactor,
            color: tierColors.stroke,
            opacity: (tierColors.strokeOpacity || 0.5) * dimFactor,
            weight: isRed ? 2 : isAmber ? 1 : 0.5,
            className: isRed
              ? "crisis-blink-red"
              : isAmber
                ? "crisis-static-amber"
                : "crisis-static-yellow",
          };
        }

        // Everything else (AI, banking, geopolitical, macro) — fuchsia palette
        const fuchsiaTier = FUCHSIA_COLORS[zone.status] || FUCHSIA_COLORS.yellow;
        const dimFactor = isRed ? 1 : isAmber ? 0.75 : 0.8;

        return {
          fillColor: fuchsiaTier.fill,
          fillOpacity: fuchsiaTier.fillOpacity * dimFactor,
          color: fuchsiaTier.stroke,
          opacity: fuchsiaTier.strokeOpacity * dimFactor,
          weight: isRed ? 2 : isAmber ? 1.5 : 1,
          className: isRed
            ? "crisis-pulse-ai"
            : "crisis-static-ai",
        };
      }}
      onEachFeature={(feature: Feature<Geometry>, layer) => {
        const zone = feature.id ? zoneMap[String(feature.id)] : null;
        if (!zone) return;

        const isWar = zone.crisisDomain === "war";

        // Pick colors based on domain: war → red palette, everything else → fuchsia
        const dotColor = isWar
          ? colors[zone.status]?.text || "#F5F5F5"
          : (FUCHSIA_COLORS[zone.status] || FUCHSIA_COLORS.yellow).text;
        const badgeLabel = zone.label;
        const tooltipClass = isWar ? "crisis-tooltip" : "ai-crisis-tooltip";

        layer.bindTooltip(
          `<div style="width:260px;overflow:hidden;overflow-wrap:break-word;word-break:break-word">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dotColor};box-shadow:0 0 6px ${dotColor};flex-shrink:0"></span>
              <strong style="font-size:13px;color:#F5F5F5">${zone.name}</strong>
              <span style="font-size:10px;font-weight:700;color:${dotColor};text-transform:uppercase;letter-spacing:0.05em">${badgeLabel}</span>
            </div>
            <p style="font-size:11px;color:#A3A3A3;line-height:1.4;margin:0;overflow-wrap:break-word">${zone.detail}</p>
          </div>`,
          {
            direction: "top",
            offset: [0, -10],
            className: tooltipClass,
            sticky: true,
          }
        );
      }}
    />
  );
}
