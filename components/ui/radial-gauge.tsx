"use client";

import { cn } from "@/lib/utils";

interface RadialGaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  className?: string;
}

export function RadialGauge({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = "hsl(var(--gold))",
  trackColor = "hsl(var(--border))",
  label,
  className,
}: RadialGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 1.5; // 270-degree arc
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={trackColor} strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference * 2}`}
          strokeDashoffset={0}
          transform={`rotate(135 ${size / 2} ${size / 2})`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference * 2}`}
          strokeDashoffset={offset}
          transform={`rotate(135 ${size / 2} ${size / 2})`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {label && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
