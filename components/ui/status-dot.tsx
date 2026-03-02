import { cn } from "@/lib/utils";

const dotColors = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  gold: "bg-gold",
  muted: "bg-muted-foreground",
} as const;

interface StatusDotProps {
  color?: keyof typeof dotColors;
  label?: string;
  className?: string;
}

export function StatusDot({ color = "muted", label, className }: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("h-2 w-2 rounded-full shrink-0", dotColors[color])} />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  );
}
