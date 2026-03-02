/**
 * Shared utilities for Decision Memo components
 * Extracts duplicate logic from 24+ memo component files
 */

/** Parse markdown bold **text** into React-friendly segments */
export function parseMarkdownBold(text: string): Array<{ text: string; bold: boolean }> {
  const segments: Array<{ text: string; bold: boolean }> = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false });
  }

  return segments.length > 0 ? segments : [{ text, bold: false }];
}

/** Strip JSON code blocks from markdown strings */
export function filterJsonFromMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/```json[\s\S]*?```/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .trim();
}

/** Format large currency values with K/M/B abbreviations */
export function formatLargeCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return "$0";
  const num = typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]/g, "")) : value;
  if (isNaN(num)) return "$0";

  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/** Normalize percentage string/number to a clean number */
export function normalizePercentage(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  const num = typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]/g, "")) : value;
  return isNaN(num) ? 0 : num;
}

/** Get risk level configuration (color + label) */
export function getRiskLevelConfig(level: string): {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  const normalized = (level || "medium").toLowerCase();
  if (normalized === "low" || normalized === "minimal") {
    return { label: "LOW", color: "#22C55E", bgClass: "bg-emerald-500/10", textClass: "text-emerald-500", borderClass: "border-emerald-500/30" };
  }
  if (normalized === "high" || normalized === "critical" || normalized === "severe") {
    return { label: normalized.toUpperCase(), color: "#EF4444", bgClass: "bg-red-500/10", textClass: "text-red-500", borderClass: "border-red-500/30" };
  }
  return { label: "MEDIUM", color: "#F59E0B", bgClass: "bg-amber-500/10", textClass: "text-amber-500", borderClass: "border-amber-500/30" };
}

/** Get urgency-based color class */
export function getUrgencyColor(urgency: string): string {
  const u = (urgency || "").toLowerCase();
  if (u.includes("critical") || u.includes("immediate")) return "text-red-500";
  if (u.includes("high") || u.includes("urgent")) return "text-amber-500";
  if (u.includes("low") || u.includes("routine")) return "text-emerald-500";
  return "text-muted-foreground";
}
