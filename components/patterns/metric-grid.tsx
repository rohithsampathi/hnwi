import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricItem {
  label: string;
  value: ReactNode;
  subtext?: string;
}

interface MetricGridProps {
  metrics: MetricItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const colsMap = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
} as const;

export function MetricGrid({ metrics, columns = 3, className }: MetricGridProps) {
  return (
    <div className={cn("grid gap-3", colsMap[columns], className)}>
      {metrics.map((m, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-surface p-3 transition-all duration-200 hover:-translate-y-0.5"
        >
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1">
            {m.label}
          </p>
          <div className="text-lg font-semibold text-foreground">{m.value}</div>
          {m.subtext && (
            <p className="text-xs text-muted-foreground mt-0.5">{m.subtext}</p>
          )}
        </div>
      ))}
    </div>
  );
}
