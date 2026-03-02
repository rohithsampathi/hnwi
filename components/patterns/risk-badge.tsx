import { cn } from "@/lib/utils";

type RiskLevel = "low" | "medium" | "high" | "critical";

const riskConfig: Record<RiskLevel, { label: string; bg: string; text: string; border: string }> = {
  low: {
    label: "LOW",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/40",
  },
  medium: {
    label: "MEDIUM",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/40",
  },
  high: {
    label: "HIGH",
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/40",
  },
  critical: {
    label: "CRITICAL",
    bg: "bg-red-600/15",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-600/50",
  },
};

interface RiskBadgeProps {
  level: RiskLevel | string;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const normalized = (level?.toLowerCase() || "medium") as RiskLevel;
  const config = riskConfig[normalized] || riskConfig.medium;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 border text-[10px] font-bold tracking-[0.15em] uppercase leading-none",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {config.label}
    </span>
  );
}
