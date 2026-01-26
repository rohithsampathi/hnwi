"use client";

import { Star, MessageSquare, TrendingUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/theme-context";
import { StarRating, InlineRating } from "./star-rating";
import { SourceBadge } from "./source-badge";
import { WarningIndicator } from "./warning-banner";
import type { Executor, ExecutorReviewSummary } from "@/types/executor";

interface ReviewSummaryProps {
  summary: ExecutorReviewSummary;
  flags?: Executor["flags"];
  size?: "sm" | "md" | "lg";
  showSources?: boolean;
  showHighlights?: boolean;
  className?: string;
}

export function ReviewSummary({
  summary,
  flags,
  size = "md",
  showSources = true,
  showHighlights = false,
  className,
}: ReviewSummaryProps) {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const ratingSize = size === "lg" ? "md" : size === "md" ? "sm" : "sm";

  return (
    <div className={cn("space-y-2", className)}>
      {/* Rating row */}
      <div className="flex items-center gap-2 flex-wrap">
        <StarRating
          rating={summary.average_rating}
          size={ratingSize}
          showValue
        />
        <span className={cn(sizeClasses[size], "text-muted-foreground")}>
          ({summary.total_reviews} review{summary.total_reviews !== 1 ? "s" : ""})
        </span>

        {/* Warning indicator */}
        {flags && flags.length > 0 && (
          <WarningIndicator flags={flags} size={ratingSize} />
        )}
      </div>

      {/* Sources */}
      {showSources && summary.sources && summary.sources.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {summary.sources.slice(0, 3).map(({ source }) => (
            <SourceBadge key={source} source={source} size="sm" />
          ))}
          {summary.sources.length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-1.5">
              +{summary.sources.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Highlights */}
      {showHighlights && summary.highlights && summary.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {summary.highlights.slice(0, 2).map((highlight, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              <TrendingUp className="h-2.5 w-2.5 mr-1" />
              {highlight}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact inline review badge for card headers
export function ReviewBadge({
  summary,
  flags,
  className,
}: {
  summary?: ExecutorReviewSummary;
  flags?: Executor["flags"];
  className?: string;
}) {
  const { theme } = useTheme();

  if (!summary) return null;

  const hasWarning = flags && flags.length > 0;
  const hasSevere = flags?.some((f) => f.type === "severe");

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
        hasWarning
          ? hasSevere
            ? "bg-red-500/10 border border-red-500/30"
            : "bg-amber-500/10 border border-amber-500/30"
          : summary.average_rating >= 4.0
          ? "bg-emerald-500/10 border border-emerald-500/30"
          : summary.average_rating >= 3.0
          ? "bg-blue-500/10 border border-blue-500/30"
          : "bg-muted border border-border",
        className
      )}
    >
      {hasWarning ? (
        <WarningIndicator flags={flags} size="sm" />
      ) : (
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      )}
      <span className="font-medium">{summary.average_rating.toFixed(1)}</span>
      <span className="text-muted-foreground">({summary.total_reviews})</span>
    </div>
  );
}

// Trust score indicator combining rating + verification
export function TrustScore({
  executor,
  className,
}: {
  executor: Executor;
  className?: string;
}) {
  const { theme } = useTheme();
  const summary = executor.review_summary;
  const isVerifiedPartner = executor.tier === "strategic_partner";

  // Calculate trust score (0-100)
  const calculateTrustScore = (): number => {
    let score = 50; // Base score

    // Rating contribution (up to 30 points)
    if (summary) {
      score += (summary.average_rating / 5) * 30;
    }

    // Verification bonus (10 points)
    if (isVerifiedPartner) {
      score += 10;
    }

    // Review count bonus (up to 10 points)
    if (summary) {
      const reviewBonus = Math.min(summary.total_reviews / 10, 1) * 10;
      score += reviewBonus;
    }

    // Penalty for flags
    if (executor.flags) {
      const hasSevere = executor.flags.some((f) => f.type === "severe");
      score -= hasSevere ? 40 : 20;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const trustScore = calculateTrustScore();

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Caution";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full",
          theme === "dark" ? "bg-muted" : "bg-muted/50"
        )}
      >
        <span className={cn("text-lg font-bold", getScoreColor(trustScore))}>
          {trustScore}
        </span>
      </div>
      <div>
        <p className={cn("text-sm font-medium", getScoreColor(trustScore))}>
          {getScoreLabel(trustScore)}
        </p>
        <p className="text-xs text-muted-foreground">Trust Score</p>
      </div>
    </div>
  );
}

// Verification badge with review context
export function VerificationStatus({
  executor,
  size = "md",
  className,
}: {
  executor: Executor;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const isVerified = executor.tier === "strategic_partner";
  const summary = executor.review_summary;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isVerified && (
        <Badge
          className={cn(
            sizeClasses[size],
            "bg-primary/10 text-primary border-primary/30 gap-1"
          )}
        >
          <Shield className={iconSizes[size]} />
          Verified Partner
        </Badge>
      )}
      {summary && (
        <InlineRating
          rating={summary.average_rating}
          count={summary.total_reviews}
          size={size === "lg" ? "md" : "sm"}
        />
      )}
    </div>
  );
}
