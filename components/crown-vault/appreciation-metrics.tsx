"use client";

import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AppreciationMetrics as AppreciationMetricsType } from "@/lib/api";

interface AppreciationMetricsProps {
  appreciation: AppreciationMetricsType;
  currency?: string;
  entryPrice?: number;
  currentPrice?: number;
  className?: string;
}

export function AppreciationMetrics({
  appreciation,
  currency = "USD",
  entryPrice,
  currentPrice,
  className = ""
}: AppreciationMetricsProps) {
  const isPositive = appreciation.percentage >= 0;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main Appreciation Display */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Total Appreciation</span>
        <div className="flex items-center space-x-2">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600" />
          )}
          <span className={`text-sm font-bold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}{appreciation.percentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Absolute Value */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Value Gain</span>
        <span className={`text-xs font-semibold ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? '+' : ''}{currency} {Math.abs(appreciation.absolute).toLocaleString()}
        </span>
      </div>

      {/* Annualized Return - THE CRITICAL METRIC */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-between p-2 bg-primary/5 rounded cursor-help">
              <span className="text-xs font-medium text-primary">Annualized Return</span>
              <span className="text-sm font-black text-primary">
                {isPositive ? '+' : ''}{appreciation.annualized.toFixed(2)}%
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold">Why This Matters</p>
              <p className="text-xs">
                Annualized return normalizes gains over time, making it easier to compare
                investments held for different periods. A {appreciation.percentage.toFixed(1)}%
                gain over {Math.round(appreciation.time_held_days / 365)} years equals
                {appreciation.annualized.toFixed(2)}% per year.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Time Held */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>Time Held</span>
        </div>
        <span>
          {Math.floor(appreciation.time_held_days / 365)} years, {Math.round(appreciation.time_held_days % 365)} days
        </span>
      </div>

      {/* Entry vs Current Price Comparison */}
      {entryPrice && currentPrice && (
        <div className="pt-2 border-t border-border space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Entry Price</span>
            <span className="font-medium">{currency} {entryPrice.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Current Price</span>
            <span className="font-bold text-primary">{currency} {currentPrice.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Performance Rating */}
      <div className="pt-2">
        <Badge
          variant="outline"
          className={`w-full justify-center text-xs ${
            appreciation.annualized >= 15
              ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950/20 dark:text-green-400'
              : appreciation.annualized >= 7
              ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/20 dark:text-blue-400'
              : appreciation.annualized >= 0
              ? 'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950/20 dark:text-yellow-400'
              : 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/20 dark:text-red-400'
          }`}
        >
          {appreciation.annualized >= 15
            ? '🚀 Exceptional Performance'
            : appreciation.annualized >= 7
            ? '✅ Strong Performance'
            : appreciation.annualized >= 0
            ? '📊 Moderate Performance'
            : '⚠️ Underperforming'}
        </Badge>
      </div>
    </div>
  );
}
