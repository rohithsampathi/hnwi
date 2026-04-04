// components/map/crisis-event-markers.tsx
// Crisis event location markers — specific strike/event coordinates on the map
// Two visual modes:
//   - Geopolitical (red pulsing): military strikes, currency collapses
//   - AI Disruption (fuchsia neon): workforce displacement, tech sector shifts

"use client";

import React from "react";
import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { CrisisLocation } from "@/lib/crisis-overlay";

interface CrisisEventMarkersProps {
  visible: boolean;
  locations: CrisisLocation[];
}

// ─── RED GEOPOLITICAL MARKER (existing) ─────────────────────────────
function createCrisisMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: "custom-marker",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    html: `<div style="position:relative;width:14px;height:14px;">
      <span style="position:absolute;inset:-3px;border-radius:50%;background:rgba(239,68,68,0.3);animation:crisis-dot-ping 2s cubic-bezier(0,0,0.2,1) infinite;"></span>
      <span style="position:absolute;inset:0;width:14px;height:14px;border-radius:50%;background:#EF4444;border:2px solid #0A0A0A;box-shadow:0 0 10px rgba(239,68,68,0.6);"></span>
      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
        <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
      </svg>
    </div>`,
  });
}

// ─── FUCHSIA NEON AI MARKER ──────────────────────────────────────────
// Fuchsia (#D946EF → #E879F9) — "synthetic/artificial" visual.
// Distinct from: war red, audit cyan (#67E8F9), chart purple (#8B5CF6).
function createAiMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: "custom-marker",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    html: `<div style="position:relative;width:16px;height:16px;">
      <span style="position:absolute;inset:-4px;border-radius:50%;background:rgba(217,70,239,0.25);animation:ai-dot-ping 2.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
      <span style="position:absolute;inset:-1px;border-radius:50%;background:rgba(217,70,239,0.12);animation:ai-dot-ping 2.5s cubic-bezier(0,0,0.2,1) infinite;animation-delay:0.5s;"></span>
      <span style="position:absolute;inset:0;width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#C026D3,#E879F9);border:2px solid #0A0A0A;box-shadow:0 0 12px rgba(217,70,239,0.7),0 0 24px rgba(217,70,239,0.3);"></span>
      <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
        <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M12 12v4"/><circle cx="12" cy="20" r="2"/>
      </svg>
    </div>`,
  });
}

const crisisIcon = createCrisisMarkerIcon();
const aiIcon = createAiMarkerIcon();

// ─── DATE FORMATTER — HH:MM, DD/MM/YYYY ────────────────────────────
function formatEventDate(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return "";
  try {
    // Backend sends "YYYY-MM-DDTHH:MM" or legacy "YYYY-MM-DD"
    const hasTime = dateStr.includes("T");
    const d = hasTime ? new Date(dateStr + "Z") : new Date(dateStr + "T00:00:00Z");
    if (isNaN(d.getTime())) return dateStr;
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = d.getUTCFullYear();
    return hasTime ? `${hh}:${mm}, ${dd}/${mo}/${yyyy}` : `${dd}/${mo}/${yyyy}`;
  } catch {
    return dateStr;
  }
}

// ─── TOOLTIP: GEOPOLITICAL ───────────────────────────────────────────
function GeopoliticalTooltip({ loc }: { loc: CrisisLocation }) {
  const dateLabel = formatEventDate(loc.event_date);
  return (
    <div style={{ maxWidth: 264, overflowWrap: "break-word", wordBreak: "break-word" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
        <span style={{
          display: "inline-block", width: 7, height: 7, borderRadius: "50%",
          background: "#EF4444", boxShadow: "0 0 5px #EF4444", flexShrink: 0,
        }} />
        <strong style={{ fontSize: 12, color: "#F5F5F5", textTransform: "capitalize" }}>
          {loc.key.replace(/_/g, " ")}
        </strong>
      </div>
      {dateLabel && (
        <p style={{ fontSize: 10, color: "#D4A843", margin: "0 0 2px 0", fontWeight: 600 }}>
          {dateLabel}
        </p>
      )}
      <p style={{ fontSize: 11, color: "#A3A3A3", lineHeight: 1.4, margin: 0 }}>
        {loc.event}
      </p>
    </div>
  );
}

// ─── TOOLTIP: AI DISRUPTION (rich detail — fuchsia themed) ──────────
function AiTooltip({ loc }: { loc: CrisisLocation }) {
  const wi = loc.workforce_impact;
  const assets = loc.asset_impacts;
  const dateLabel = formatEventDate(loc.event_date);

  return (
    <div
      className="ai-tooltip-scroll"
      style={{
        maxWidth: 280,
        overflowWrap: "break-word",
        wordBreak: "break-word",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{
          display: "inline-block", width: 8, height: 8, borderRadius: "50%",
          background: "#E879F9", boxShadow: "0 0 8px #E879F9, 0 0 16px rgba(217,70,239,0.4)", flexShrink: 0,
        }} />
        <strong style={{ fontSize: 12, color: "#E879F9", textTransform: "capitalize", letterSpacing: "0.3px" }}>
          {loc.key.replace(/_/g, " ")}
        </strong>
        <span style={{
          fontSize: 9, color: "#D946EF", background: "rgba(217,70,239,0.12)",
          padding: "1px 6px", borderRadius: 8, border: "1px solid rgba(217,70,239,0.25)",
          fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginLeft: "auto",
        }}>
          AI
        </span>
      </div>

      {/* Date + Event description */}
      {dateLabel && (
        <p style={{ fontSize: 10, color: "#D4A843", margin: "0 0 2px 0", fontWeight: 600 }}>
          {dateLabel}
        </p>
      )}
      <p style={{ fontSize: 11, color: "#A3A3A3", lineHeight: 1.4, margin: "0 0 6px 0" }}>
        {loc.event}
      </p>

      {/* Workforce impact */}
      {wi && (wi.total_jobs_affected > 0 || (wi.companies && wi.companies.length > 0)) && (
        <div style={{
          background: "rgba(217,70,239,0.06)", border: "1px solid rgba(217,70,239,0.15)",
          borderRadius: 6, padding: "6px 8px", marginBottom: 6,
        }}>
          {wi.total_jobs_affected > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.5px" }}>Jobs Affected</span>
              <span style={{ fontSize: 12, color: "#E879F9", fontWeight: 700 }}>
                {wi.total_jobs_affected.toLocaleString()}
              </span>
            </div>
          )}
          {wi.companies && wi.companies.length > 0 && (
            <div style={{ marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.5px" }}>Companies</span>
              <div style={{ fontSize: 11, color: "#D4D4D8", marginTop: 2 }}>
                {wi.companies.join(", ")}
              </div>
            </div>
          )}
          {wi.sectors && wi.sectors.length > 0 && (
            <div>
              <span style={{ fontSize: 10, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.5px" }}>Sectors</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 2 }}>
                {wi.sectors.map((s, i) => (
                  <span key={i} style={{
                    fontSize: 10, color: "#E879F9", background: "rgba(217,70,239,0.1)",
                    padding: "1px 5px", borderRadius: 4, border: "1px solid rgba(217,70,239,0.2)",
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Asset impacts */}
      {assets && assets.length > 0 && (
        <div>
          <span style={{ fontSize: 10, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.5px" }}>Asset Impact</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 2 }}>
            {assets.map((a, i) => (
              <span key={i} style={{
                fontSize: 10, color: "#F59E0B", background: "rgba(245,158,11,0.1)",
                padding: "1px 5px", borderRadius: 4, border: "1px solid rgba(245,158,11,0.2)",
              }}>
                {typeof a === "string" ? a : (a as any).asset || String(a)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
export function CrisisEventMarkers({ visible, locations }: CrisisEventMarkersProps) {
  if (!visible || locations.length === 0) return null;

  return (
    <>
      {locations.map((loc) => {
        const isAi = loc.crisis_domain === "ai";
        return (
          <Marker
            key={loc.key}
            position={[loc.lat, loc.lng]}
            icon={isAi ? aiIcon : crisisIcon}
            zIndexOffset={isAi ? 16000 : 15000}
          >
            <Tooltip
              direction="auto"
              offset={[0, -12]}
              className={isAi ? "ai-crisis-tooltip" : "crisis-tooltip"}
              sticky={false}
            >
              {isAi ? <AiTooltip loc={loc} /> : <GeopoliticalTooltip loc={loc} />}
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
