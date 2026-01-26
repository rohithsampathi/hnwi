"use client";

import { useState, useMemo } from "react";
import {
  Star,
  Filter,
  ChevronDown,
  ChevronUp,
  MessageSquareText,
  TrendingUp,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/contexts/theme-context";
import { getMetallicCardStyle } from "@/lib/colors";
import { StarRating, RatingBar } from "./star-rating";
import { SourceBadge, SourceList } from "./source-badge";
import { ReviewCard, ReviewQuote } from "./review-card";
import { WarningBanner, LowRatingWarning } from "./warning-banner";
import type {
  Executor,
  ExecutorReview,
  ExecutorReviewSummary,
  ReviewSource,
} from "@/types/executor";

interface ExecutorReviewsProps {
  executor: Executor;
  initialVisible?: number;
  showFilters?: boolean;
  showSummary?: boolean;
  className?: string;
  onHelpful?: (reviewId: string) => void;
}

type SortOption = "recent" | "rating-high" | "rating-low" | "helpful";
type FilterOption = "all" | ReviewSource;

export function ExecutorReviews({
  executor,
  initialVisible = 3,
  showFilters = true,
  showSummary = true,
  className,
  onHelpful,
}: ExecutorReviewsProps) {
  const { theme } = useTheme();
  const [visibleCount, setVisibleCount] = useState(initialVisible);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [showAllReviews, setShowAllReviews] = useState(false);

  const reviews = executor.reviews || [];
  const summary = executor.review_summary;

  // Get unique sources for filter
  const availableSources = useMemo(() => {
    const sources = new Set<ReviewSource>();
    reviews.forEach((r) => sources.add(r.source));
    return Array.from(sources);
  }, [reviews]);

  // Filter and sort reviews
  const processedReviews = useMemo(() => {
    let result = [...reviews];

    // Apply filter
    if (filterBy !== "all") {
      result = result.filter((r) => r.source === filterBy);
    }

    // Apply sort
    switch (sortBy) {
      case "recent":
        result.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "rating-high":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "rating-low":
        result.sort((a, b) => a.rating - b.rating);
        break;
      case "helpful":
        result.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
        break;
    }

    return result;
  }, [reviews, sortBy, filterBy]);

  const displayedReviews = showAllReviews
    ? processedReviews
    : processedReviews.slice(0, visibleCount);
  const hasMoreReviews = processedReviews.length > visibleCount;

  if (reviews.length === 0 && !summary) {
    return (
      <div
        className={cn(
          "p-6 text-center rounded-lg border border-dashed",
          theme === "dark" ? "border-muted" : "border-muted-foreground/30",
          className
        )}
      >
        <MessageSquareText className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No reviews yet for this executor.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Be the first to share your experience after working with them.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Warning banner for flagged executors */}
      {executor.flags && executor.flags.length > 0 && (
        <WarningBanner
          flags={executor.flags}
          executorName={`${executor.first_name} ${executor.last_name}`}
        />
      )}

      {/* Low rating warning */}
      {summary && summary.average_rating < 2.0 && (
        <LowRatingWarning rating={summary.average_rating} />
      )}

      {/* Summary section */}
      {showSummary && summary && (
        <div
          className={cn(
            "p-5 rounded-lg",
            theme === "dark" ? "bg-muted/20" : "bg-muted/40"
          )}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall rating */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {summary.average_rating.toFixed(1)}
                </div>
                <StarRating rating={summary.average_rating} size="md" />
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.total_reviews} review
                  {summary.total_reviews !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Rating distribution */}
              <div className="flex-1 space-y-1">
                <RatingBar
                  label="5"
                  count={summary.rating_distribution.five}
                  total={summary.total_reviews}
                />
                <RatingBar
                  label="4"
                  count={summary.rating_distribution.four}
                  total={summary.total_reviews}
                />
                <RatingBar
                  label="3"
                  count={summary.rating_distribution.three}
                  total={summary.total_reviews}
                />
                <RatingBar
                  label="2"
                  count={summary.rating_distribution.two}
                  total={summary.total_reviews}
                />
                <RatingBar
                  label="1"
                  count={summary.rating_distribution.one}
                  total={summary.total_reviews}
                />
              </div>
            </div>

            {/* Sources and highlights */}
            <div className="space-y-4">
              {summary.sources && summary.sources.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    Review Sources
                  </h4>
                  <SourceList sources={summary.sources} />
                </div>
              )}

              {summary.highlights && summary.highlights.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Highlights
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {summary.highlights.map((highlight, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {summary.concerns && summary.concerns.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    Areas of Concern
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {summary.concerns.map((concern, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      >
                        {concern}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && reviews.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
          </div>

          <Select
            value={filterBy}
            onValueChange={(val) => setFilterBy(val as FilterOption)}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {availableSources.map((source) => (
                <SelectItem key={source} value={source}>
                  <SourceBadge source={source} size="sm" showTooltip={false} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(val) => setSortBy(val as SortOption)}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Most Recent
                </div>
              </SelectItem>
              <SelectItem value="rating-high">
                <div className="flex items-center gap-1.5">
                  <Star className="h-3 w-3" />
                  Highest Rated
                </div>
              </SelectItem>
              <SelectItem value="rating-low">
                <div className="flex items-center gap-1.5">
                  <Star className="h-3 w-3" />
                  Lowest Rated
                </div>
              </SelectItem>
              <SelectItem value="helpful">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3" />
                  Most Helpful
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground ml-auto">
            Showing {displayedReviews.length} of {processedReviews.length}
          </span>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <ReviewCard
            key={review.review_id}
            review={review}
            onHelpful={onHelpful}
          />
        ))}
      </div>

      {/* Show more/less */}
      {hasMoreReviews && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllReviews(!showAllReviews)}
          >
            {showAllReviews ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1.5" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1.5" />
                Show All {processedReviews.length} Reviews
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Compact reviews preview for cards
export function ReviewsPreview({
  executor,
  maxReviews = 1,
  className,
}: {
  executor: Executor;
  maxReviews?: number;
  className?: string;
}) {
  const reviews = executor.reviews || [];
  const summary = executor.review_summary;

  if (!summary && reviews.length === 0) return null;

  // Get top review (highest rated or most helpful)
  const topReview = reviews
    .slice()
    .sort((a, b) => {
      // Prioritize helpful count, then rating
      const helpfulDiff = (b.helpful_count || 0) - (a.helpful_count || 0);
      if (helpfulDiff !== 0) return helpfulDiff;
      return b.rating - a.rating;
    })[0];

  return (
    <div className={cn("space-y-3", className)}>
      {/* Rating summary */}
      {summary && (
        <div className="flex items-center gap-2">
          <StarRating
            rating={summary.average_rating}
            size="sm"
            showValue
            showCount
            count={summary.total_reviews}
          />
          {summary.sources && summary.sources.length > 0 && (
            <SourceBadge
              source={summary.sources[0].source}
              size="sm"
              showTooltip
            />
          )}
        </div>
      )}

      {/* Top review quote */}
      {topReview && (
        <ReviewQuote review={topReview} maxLength={100} />
      )}
    </div>
  );
}
