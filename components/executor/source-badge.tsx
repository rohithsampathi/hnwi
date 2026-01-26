"use client";

import { Shield, CheckCircle2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ReviewSource,
  ReviewCredibility,
  REVIEW_SOURCE_METADATA,
} from "@/types/executor";

interface SourceBadgeProps {
  source: ReviewSource;
  size?: "sm" | "md" | "lg";
  showCredibility?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-1",
  lg: "text-sm px-3 py-1.5",
};

const iconSizeClasses = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

const credibilityIcons: Record<ReviewCredibility, typeof Shield> = {
  high: Shield,
  medium: CheckCircle2,
  low: ExternalLink,
};

export function SourceBadge({
  source,
  size = "md",
  showCredibility = false,
  showTooltip = true,
  className,
}: SourceBadgeProps) {
  const metadata = REVIEW_SOURCE_METADATA[source];
  const CredibilityIcon = credibilityIcons[metadata.credibility];

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        sizeClasses[size],
        "font-medium border gap-1 whitespace-nowrap",
        className
      )}
      style={{
        borderColor: metadata.color,
        color: metadata.color,
        backgroundColor: `${metadata.color}10`,
      }}
    >
      {showCredibility && (
        <CredibilityIcon className={iconSizeClasses[size]} />
      )}
      {metadata.name}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{metadata.name}</p>
            <p className="text-xs text-muted-foreground">{metadata.description}</p>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">Credibility:</span>
              <span
                className="font-medium capitalize"
                style={{ color: metadata.color }}
              >
                {metadata.credibility}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Credibility indicator with icon and label
export function CredibilityIndicator({
  credibility,
  showLabel = true,
  size = "md",
  className,
}: {
  credibility: ReviewCredibility;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = credibilityIcons[credibility];
  const colorMap: Record<ReviewCredibility, string> = {
    high: "text-emerald-500",
    medium: "text-blue-500",
    low: "text-gray-500",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Icon className={cn(iconSizeClasses[size], colorMap[credibility])} />
      {showLabel && (
        <span
          className={cn(
            sizeClasses[size],
            "font-medium capitalize",
            colorMap[credibility]
          )}
        >
          {credibility} credibility
        </span>
      )}
    </div>
  );
}

// Source list with counts
export function SourceList({
  sources,
  size = "sm",
  maxVisible = 3,
  className,
}: {
  sources: { source: ReviewSource; count: number; average: number }[];
  size?: "sm" | "md" | "lg";
  maxVisible?: number;
  className?: string;
}) {
  const visibleSources = sources.slice(0, maxVisible);
  const remainingCount = sources.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {visibleSources.map(({ source, count }) => (
        <div key={source} className="flex items-center gap-1">
          <SourceBadge source={source} size={size} showTooltip />
          <span className="text-xs text-muted-foreground">({count})</span>
        </div>
      ))}
      {remainingCount > 0 && (
        <Badge variant="secondary" className={sizeClasses[size]}>
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}
