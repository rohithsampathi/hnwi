// components/ui/institutional.tsx
// Shared institutional design primitives — sharp corners, warm grays, accent bars, severity borders
// Used across all Decision Memo sections for consistent institutional feel

"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ─── InstitutionalSectionHeader ────────────────────────────────────────────
// 4px gradient accent bar (left) + UPPERCASE title + optional badge
export function InstitutionalSectionHeader({
  title,
  subtitle,
  badge,
  badgeColor = "default",
  className,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: "default" | "emerald" | "amber" | "red";
  className?: string;
}) {
  const badgeColors = {
    default: "border-border text-muted-foreground",
    emerald: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
    amber: "border-amber-500/40 text-amber-600 dark:text-amber-400",
    red: "border-red-500/40 text-red-600 dark:text-red-400",
  };

  return (
    <div className={cn("flex items-start gap-3", className)}>
      {/* Gradient accent bar */}
      <div className="w-1 min-h-[40px] self-stretch rounded-sm bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-foreground">
            {title}
          </h3>
          {badge && (
            <InstitutionalBadge color={badgeColor}>{badge}</InstitutionalBadge>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ─── InstitutionalMetricCard ───────────────────────────────────────────────
// Sharp corners (rounded-lg), 1px border, warm stone bg, hover lift
export function InstitutionalMetricCard({
  children,
  className,
  highlight = false,
  highlightColor,
}: {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
  highlightColor?: "emerald" | "amber" | "red" | "primary";
}) {
  const highlightBorders = {
    emerald: "border-emerald-500/30",
    amber: "border-amber-500/30",
    red: "border-red-500/30",
    primary: "border-primary/30",
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-surface p-4 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-sm",
        highlight && highlightColor
          ? highlightBorders[highlightColor]
          : "border-border",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── InstitutionalVerdictCard ──────────────────────────────────────────────
// 3-4px colored left border (emerald/amber/red by severity)
export function InstitutionalVerdictCard({
  children,
  severity,
  className,
}: {
  children: ReactNode;
  severity: "low" | "moderate" | "high" | "critical" | "emerald" | "amber" | "red";
  className?: string;
}) {
  const severityBorders: Record<string, string> = {
    low: "border-l-emerald-500",
    emerald: "border-l-emerald-500",
    moderate: "border-l-amber-500",
    amber: "border-l-amber-500",
    high: "border-l-red-500",
    red: "border-l-red-500",
    critical: "border-l-red-600",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface",
        "border-l-[3px]",
        severityBorders[severity] || "border-l-muted-foreground",
        "p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── InstitutionalTable ────────────────────────────────────────────────────
// 3px top border, no vertical lines, alternating warm-gray rows
export function InstitutionalTable({
  headers,
  rows,
  topBorderColor = "amber",
  className,
}: {
  headers: string[];
  rows: ReactNode[][];
  topBorderColor?: "amber" | "emerald" | "red" | "stone";
  className?: string;
}) {
  const borderColors = {
    amber: "border-t-amber-500",
    emerald: "border-t-emerald-500",
    red: "border-t-red-500",
    stone: "border-t-muted-foreground",
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table
        className={cn(
          "w-full text-sm border-t-[3px]",
          borderColors[topBorderColor]
        )}
      >
        <thead>
          <tr className="border-b border-border">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left py-2.5 px-3 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={cn(
                "border-b border-border/50",
                i % 2 === 1 && "bg-surface-hover/50"
              )}
            >
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3 text-sm text-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── InstitutionalBadge ────────────────────────────────────────────────────
// Sharp (rounded), 1px border, text-[10px], tracking-widest, UPPERCASE
export function InstitutionalBadge({
  children,
  color = "default",
  className,
}: {
  children: ReactNode;
  color?: "default" | "emerald" | "amber" | "red" | "primary";
  className?: string;
}) {
  const colorMap = {
    default: "border-border text-muted-foreground bg-surface-hover",
    emerald: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    amber: "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10",
    red: "border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/10",
    primary: "border-primary/40 text-primary bg-primary/10",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 border text-[10px] font-bold tracking-[0.15em] uppercase leading-none",
        colorMap[color],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── InstitutionalProgressBar ──────────────────────────────────────────────
// h-2 default / h-3 hero, rounded-sm, warm-gray track
export function InstitutionalProgressBar({
  value,
  max = 100,
  color = "primary",
  hero = false,
  className,
}: {
  value: number;
  max?: number;
  color?: "primary" | "emerald" | "amber" | "red";
  hero?: boolean;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const barColors = {
    primary: "bg-primary",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <div
      className={cn(
        "w-full rounded-sm bg-muted",
        hero ? "h-3" : "h-2",
        className
      )}
    >
      <div
        className={cn("rounded-sm transition-all duration-700", hero ? "h-3" : "h-2", barColors[color])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
