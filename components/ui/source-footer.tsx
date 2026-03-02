import { cn } from "@/lib/utils";

interface SourceFooterProps {
  source: string;
  className?: string;
}

export function SourceFooter({ source, className }: SourceFooterProps) {
  return (
    <div className={cn("flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-border/50", className)}>
      <span className="h-1 w-1 rounded-full bg-gold" />
      <p className="text-[10px] text-muted-foreground tracking-wider uppercase">{source}</p>
    </div>
  );
}
