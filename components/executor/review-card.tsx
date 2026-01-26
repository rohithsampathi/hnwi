"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  ThumbsUp,
  CheckCircle2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";
import { getMetallicCardStyle } from "@/lib/colors";
import { StarRating } from "./star-rating";
import { SourceBadge } from "./source-badge";
import type { ExecutorReview } from "@/types/executor";

interface ReviewCardProps {
  review: ExecutorReview;
  compact?: boolean;
  showResponse?: boolean;
  className?: string;
  onHelpful?: (reviewId: string) => void;
}

export function ReviewCard({
  review,
  compact = false,
  showResponse = true,
  className,
  onHelpful,
}: ReviewCardProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const formattedDate = review.date
    ? format(parseISO(review.date), "MMM d, yyyy")
    : "Unknown date";

  const isLongText = review.text.length > 200;
  const displayText =
    isLongText && !showFullText ? `${review.text.slice(0, 200)}...` : review.text;

  if (compact) {
    return (
      <div
        className={cn(
          "p-3 rounded-lg border border-border/50 bg-muted/20",
          className
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size="sm" />
            <SourceBadge source={review.source} size="sm" />
          </div>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{review.text}</p>
        {review.reviewer_name && (
          <p className="text-xs text-muted-foreground mt-2">
            - {review.reviewer_name}
            {review.reviewer_verified && (
              <CheckCircle2 className="inline h-3 w-3 ml-1 text-primary" />
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 rounded-lg border border-border/50",
        theme === "dark" ? "bg-muted/10" : "bg-muted/30",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Reviewer avatar placeholder */}
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              theme === "dark" ? "bg-muted" : "bg-muted/50"
            )}
          >
            <User className="h-5 w-5 text-muted-foreground" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {review.reviewer_name || "Anonymous"}
              </span>
              {review.reviewer_verified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              )}
            </div>
            {review.reviewer_title && (
              <p className="text-xs text-muted-foreground">
                {review.reviewer_title}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <SourceBadge source={review.source} size="sm" showCredibility />
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
      </div>

      {/* Rating and Title */}
      <div className="mb-3">
        <StarRating rating={review.rating} size="md" showValue />
        {review.title && (
          <h4 className="font-semibold text-sm mt-2">{review.title}</h4>
        )}
      </div>

      {/* Review Text */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {displayText}
      </p>
      {isLongText && (
        <Button
          variant="link"
          size="sm"
          className="p-0 h-auto text-xs text-primary"
          onClick={() => setShowFullText(!showFullText)}
        >
          {showFullText ? "Show less" : "Read more"}
        </Button>
      )}

      {/* Response from executor */}
      {showResponse && review.response && (
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              Response from executor
            </span>
            {review.response.date && (
              <span className="text-xs text-muted-foreground">
                - {format(parseISO(review.response.date), "MMM d, yyyy")}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{review.response.text}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onHelpful?.(review.review_id)}
        >
          <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
          Helpful
          {review.helpful_count !== undefined && review.helpful_count > 0 && (
            <span className="ml-1">({review.helpful_count})</span>
          )}
        </Button>
      </div>
    </div>
  );
}

// Highlighted review quote
export function ReviewQuote({
  review,
  maxLength = 150,
  className,
}: {
  review: ExecutorReview;
  maxLength?: number;
  className?: string;
}) {
  const { theme } = useTheme();
  const displayText =
    review.text.length > maxLength
      ? `${review.text.slice(0, maxLength)}...`
      : review.text;

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg",
        theme === "dark" ? "bg-primary/5" : "bg-primary/10",
        className
      )}
    >
      {/* Quote mark */}
      <span className="absolute top-2 left-3 text-4xl text-primary/20 font-serif">
        "
      </span>

      <p className="text-sm italic text-muted-foreground pl-6 pr-2">
        {displayText}
      </p>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-primary/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">
            {review.reviewer_name || "Verified client"}
          </span>
          {review.reviewer_verified && (
            <CheckCircle2 className="h-3 w-3 text-primary" />
          )}
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>
    </div>
  );
}
