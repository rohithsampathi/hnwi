"use client";

import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // 0-5, supports decimals
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  className?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  showCount = false,
  count = 0,
  className,
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0) - (rating % 1 >= 0.75 ? 1 : 0);
  const extraFullStar = rating % 1 >= 0.75;

  const handleStarClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  const starClass = cn(
    sizeClasses[size],
    interactive && "cursor-pointer hover:scale-110 transition-transform"
  );

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars + (extraFullStar ? 1 : 0) }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(starClass, "fill-amber-400 text-amber-400")}
            onClick={() => handleStarClick(i)}
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative" onClick={() => handleStarClick(fullStars)}>
            <Star className={cn(starClass, "text-muted-foreground/30")} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={cn(starClass, "fill-amber-400 text-amber-400")} />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: Math.max(0, emptyStars) }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(starClass, "text-muted-foreground/30")}
            onClick={() => handleStarClick(fullStars + (hasHalfStar ? 1 : 0) + i)}
          />
        ))}
      </div>

      {/* Rating value */}
      {showValue && (
        <span className={cn(
          textSizeClasses[size],
          "font-semibold text-foreground ml-1"
        )}>
          {rating.toFixed(1)}
        </span>
      )}

      {/* Review count */}
      {showCount && count > 0 && (
        <span className={cn(
          textSizeClasses[size],
          "text-muted-foreground"
        )}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}

// Compact inline rating display
export function InlineRating({
  rating,
  count,
  size = "sm",
  className,
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Star className={cn(sizeClasses[size], "fill-amber-400 text-amber-400")} />
      <span className={cn(textSizeClasses[size], "font-semibold")}>
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className={cn(textSizeClasses[size], "text-muted-foreground")}>
          ({count})
        </span>
      )}
    </div>
  );
}

// Rating bar for distribution display
export function RatingBar({
  label,
  count,
  total,
  color = "bg-amber-400",
  className,
}: {
  label: string;
  count: number;
  total: number;
  color?: string;
  className?: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <span className="w-3 text-muted-foreground">{label}</span>
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-right text-muted-foreground text-xs">
        {count}
      </span>
    </div>
  );
}
