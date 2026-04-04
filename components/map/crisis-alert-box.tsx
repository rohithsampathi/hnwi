// components/map/crisis-alert-box.tsx
// Crisis Alert Panel — overlay on map showing active crisis intelligence
// Renders in top-right corner, collapsible, with live impact metrics

"use client";

import React, { useState } from "react";
import type { CrisisAlert, CrisisColorConfig, CrisisStatus, CrisisCounts } from "@/lib/crisis-overlay";

interface CrisisAlertBoxProps {
  visible: boolean;
  theme: string;
  alert: CrisisAlert;
  counts: CrisisCounts;
  colors: Record<CrisisStatus, CrisisColorConfig>;
}

const DOWN_WORDS = /down|drop|fall|crash|collaps|declin|plung|slump|sink|loss|weak|sell.?off|bear/i;
const UP_WORDS = /up|ris|surg|rally|gain|spike|jump|soar|climb|boom|bull|appreciat/i;

function movementDirection(movement: string): "up" | "down" | "flat" {
  if (DOWN_WORDS.test(movement)) return "down";
  if (UP_WORDS.test(movement)) return "up";
  // Signed numbers: any negative = red, 0–2% positive = flat, >2% positive = green
  const numMatch = movement.match(/([+-])\s*([\d.]+)/);
  if (numMatch) {
    if (numMatch[1] === "-") return "down";
    const val = parseFloat(numMatch[2]);
    return val <= 2 ? "flat" : "up";
  }
  return "flat";
}

export function CrisisAlertBox({ visible, theme, alert, counts, colors }: CrisisAlertBoxProps) {
  const [expanded, setExpanded] = useState(false);

  if (!visible) return null;

  const isDark = theme === "dark";

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div
        style={{
          background: isDark ? "rgba(10, 10, 10, 0.92)" : "rgba(255, 255, 255, 0.95)",
          border: `1px solid ${isDark ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.4)"}`,
          borderRadius: 10,
          backdropFilter: "blur(12px)",
          boxShadow: isDark
            ? "0 0 20px rgba(239, 68, 68, 0.1), 0 4px 16px rgba(0,0,0,0.4)"
            : "0 4px 16px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header — always visible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left"
          style={{ padding: "12px 14px", borderBottom: expanded ? `1px solid ${isDark ? "#262626" : "#e5e5e5"}` : "none" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Pulsing red dot */}
            <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10 }}>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  backgroundColor: "#EF4444",
                  animation: "crisis-dot-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                  opacity: 0.6,
                }}
              />
              <span
                style={{
                  position: "relative",
                  display: "inline-flex",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#EF4444",
                  boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
                }}
              />
            </span>

            <span style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", letterSpacing: "0.02em" }}>
              {alert.title}
            </span>

            {/* Expand/collapse chevron */}
            <span
              style={{
                marginLeft: "auto",
                fontSize: 10,
                color: isDark ? "#A3A3A3" : "#666",
                transition: "transform 0.2s",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              &#9660;
            </span>
          </div>

        </button>

        {/* Expanded: summary + details together */}
        {expanded && (
          <div
            style={{ padding: "10px 14px 14px", maxHeight: "40vh", overflowY: "auto", WebkitOverflowScrolling: "touch" as any }}
            onTouchMove={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Summary */}
            <p style={{
              fontSize: 11,
              color: isDark ? "#A3A3A3" : "#666",
              margin: "0 0 10px 0",
              lineHeight: 1.4,
            }}>
              {alert.body}
            </p>
            {/* Zone counts */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              <ZoneChip color={colors.red.text} count={counts.red} label="Active Conflict" />
              <ZoneChip color={colors.amber.text} count={counts.amber} label="Under Strike" />
              <ZoneChip color={colors.yellow.text} count={counts.yellow} label="High Stress" />
            </div>

            {/* Market impacts */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: isDark ? "#A3A3A3" : "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Market Impact
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
                {alert.impacts.map((impact) => {
                  const dir = movementDirection(impact.movement);
                  return (
                    <div key={impact.asset} style={{ fontSize: 11 }}>
                      <span style={{ color: isDark ? "#A3A3A3" : "#888" }}>{impact.asset}: </span>
                      <span style={{
                        fontWeight: 600,
                        color: dir === "down" ? "#EF4444" : dir === "up" ? "#22C55E" : "#F59E0B",
                      }}>
                        {dir === "down" ? "▼ " : dir === "up" ? "▲ " : "● "}{impact.movement}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trade chokepoints */}
            {alert.chokepoints.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: isDark ? "#A3A3A3" : "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  Trade Chokepoints
                </div>
                {alert.chokepoints.map((cp, i) => (
                  <div key={i} style={{ fontSize: 11, color: isDark ? "#D4D4D4" : "#333", lineHeight: 1.5, paddingLeft: 8, borderLeft: "2px solid rgba(239, 68, 68, 0.3)" }}>
                    {cp}
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#D4A843",
              lineHeight: 1.4,
              padding: "8px 10px",
              background: isDark ? "rgba(212, 168, 67, 0.08)" : "rgba(212, 168, 67, 0.1)",
              borderRadius: 6,
              borderLeft: "3px solid #D4A843",
            }}>
              {alert.cta}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ZoneChip({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 600,
        background: `${color}15`,
        border: `1px solid ${color}30`,
        color,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color }} />
      {count} {label}
    </div>
  );
}
