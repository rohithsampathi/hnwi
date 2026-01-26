// components/decision-memo/ProgressBar.tsx
// Progress indicator for stress test

"use client";

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = (current / total) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs sm:text-sm text-foreground font-semibold">
          Allocation Stress Test
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground font-medium">
          {current} of {total}
        </div>
      </div>
      <div className="relative h-2 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-lg shadow-primary/20 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
