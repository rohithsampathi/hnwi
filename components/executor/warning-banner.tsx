"use client";

import { useState } from "react";
import {
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ExecutorFlag } from "@/types/executor";

interface WarningBannerProps {
  flags: ExecutorFlag[];
  executorName?: string;
  compact?: boolean;
  className?: string;
}

export function WarningBanner({
  flags,
  executorName,
  compact = false,
  className,
}: WarningBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (!flags || flags.length === 0) return null;

  // Determine the most severe flag
  const hasSevere = flags.some((f) => f.type === "severe");
  const primaryFlag = flags.find((f) => f.type === "severe") || flags[0];

  const Icon = hasSevere ? AlertOctagon : AlertTriangle;
  const bgColor = hasSevere
    ? "bg-red-500/10 border-red-500/30"
    : "bg-amber-500/10 border-amber-500/30";
  const textColor = hasSevere ? "text-red-500" : "text-amber-500";
  const iconColor = hasSevere ? "text-red-500" : "text-amber-500";

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                bgColor,
                textColor,
                className
              )}
            >
              <Icon className="h-3 w-3" />
              {hasSevere ? "Flagged" : "Warning"}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="font-semibold mb-1">{primaryFlag.reason}</p>
            {primaryFlag.details && (
              <p className="text-xs text-muted-foreground">{primaryFlag.details}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        bgColor,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", iconColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={cn("font-semibold text-sm", textColor)}>
              {hasSevere ? "Critical Warning" : "Caution Advisory"}
            </h4>
            {flags.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    {flags.length - 1} more
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Primary flag */}
          <p className="text-sm text-muted-foreground mt-1">
            {primaryFlag.reason}
          </p>
          {primaryFlag.details && (
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {primaryFlag.details}
            </p>
          )}
          {primaryFlag.source && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <ExternalLink className="h-3 w-3" />
              <span>Source: {primaryFlag.source}</span>
              {primaryFlag.date && <span>({primaryFlag.date})</span>}
            </div>
          )}

          {/* Additional flags */}
          {expanded && flags.length > 1 && (
            <div className="mt-4 space-y-3 pt-3 border-t border-current/10">
              {flags.slice(1).map((flag, index) => (
                <div key={index} className="flex gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{flag.reason}</p>
                    {flag.details && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {flag.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground mt-4 pt-3 border-t border-current/10">
        This information is provided for due diligence purposes.
        {executorName && (
          <>
            {" "}
            {executorName} may dispute these claims. Please conduct your own
            research before engaging.
          </>
        )}
      </p>
    </div>
  );
}

// Inline warning indicator for cards
export function WarningIndicator({
  flags,
  size = "md",
  className,
}: {
  flags: ExecutorFlag[];
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (!flags || flags.length === 0) return null;

  const hasSevere = flags.some((f) => f.type === "severe");
  const Icon = hasSevere ? AlertOctagon : AlertTriangle;

  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Icon
            className={cn(
              sizeClasses[size],
              hasSevere ? "text-red-500" : "text-amber-500",
              "animate-pulse cursor-help",
              className
            )}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold text-sm mb-1">
            {hasSevere ? "Critical Warning" : "Caution"}
          </p>
          <p className="text-xs">{flags[0].reason}</p>
          {flags.length > 1 && (
            <p className="text-xs text-muted-foreground mt-1">
              +{flags.length - 1} more concerns
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Low rating warning
export function LowRatingWarning({
  rating,
  threshold = 2.0,
  className,
}: {
  rating: number;
  threshold?: number;
  className?: string;
}) {
  if (rating >= threshold) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-amber-500/10 border border-amber-500/30",
        className
      )}
    >
      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
      <p className="text-xs text-amber-600 dark:text-amber-400">
        This executor has a rating below {threshold.toFixed(1)}. Review feedback
        carefully before proceeding.
      </p>
    </div>
  );
}
