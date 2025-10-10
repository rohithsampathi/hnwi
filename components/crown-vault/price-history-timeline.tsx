"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Activity, Brain, User, ChevronDown, ChevronUp } from "lucide-react";
import { PriceHistoryEntry } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface PriceHistoryTimelineProps {
  priceHistory: PriceHistoryEntry[];
  currency?: string;
  entryPrice?: number;
  className?: string;
}

export function PriceHistoryTimeline({
  priceHistory,
  currency = "USD",
  entryPrice,
  className = ""
}: PriceHistoryTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!priceHistory || priceHistory.length === 0) {
    return null;
  }

  // Sort by timestamp descending (newest first)
  const sortedHistory = [...priceHistory].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Show only first 3 unless expanded
  const displayedHistory = isExpanded ? sortedHistory : sortedHistory.slice(0, 3);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'katherine_analysis':
        return <Brain className="h-3 w-3" />;
      case 'manual':
        return <User className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'katherine_analysis':
        return 'bg-primary/10 text-primary border-primary/30';
      case 'manual':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-300 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-300 border-gray-300';
    }
  };

  const formatSource = (source: string) => {
    switch (source) {
      case 'katherine_analysis':
        return 'Katherine AI';
      case 'manual':
        return 'Manual Update';
      default:
        return 'System';
    }
  };

  const calculateChange = (currentPrice: number, previousPrice: number) => {
    const change = ((currentPrice - previousPrice) / previousPrice) * 100;
    return change;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Price History</CardTitle>
          {sortedHistory.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-auto p-1 text-xs hover:text-primary"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show All ({sortedHistory.length})
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {displayedHistory.map((entry, index) => {
            const previousPrice = index < sortedHistory.length - 1
              ? sortedHistory[index + 1].price
              : entryPrice || entry.price;

            const change = calculateChange(entry.price, previousPrice);
            const isPositive = change >= 0;

            return (
              <motion.div
                key={`${entry.timestamp}-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-start space-x-3 pb-3 border-b border-border last:border-0 last:pb-0"
              >
                {/* Timeline dot */}
                <div className="mt-1 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${
                    isPositive ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">
                        {currency} {entry.price.toLocaleString()}
                      </span>
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center space-x-1">
                            {isPositive ? (
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            )}
                            <span className={`text-xs font-medium ${
                              isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isPositive ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Change from previous: {currency} {previousPrice.toLocaleString()}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>
                      {new Date(entry.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span>•</span>
                    <Badge variant="outline" className={`text-[10px] px-1 py-0 ${getSourceBadgeColor(entry.source)}`}>
                      <div className="flex items-center space-x-1">
                        {getSourceIcon(entry.source)}
                        <span>{formatSource(entry.source)}</span>
                      </div>
                    </Badge>
                    {entry.confidence_score && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                              {Math.round(entry.confidence_score * 100)}% confidence
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            Katherine AI confidence score
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  {entry.notes && (
                    <p className="text-xs text-muted-foreground italic mt-1">
                      {entry.notes}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {entryPrice && sortedHistory.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Entry Price:</span>
              <span className="font-medium">{currency} {entryPrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-foreground">Total Change:</span>
              <div className="flex items-center space-x-1">
                {(() => {
                  const totalChange = calculateChange(sortedHistory[0].price, entryPrice);
                  const isPositive = totalChange >= 0;
                  return (
                    <>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`font-semibold ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? '+' : ''}{totalChange.toFixed(1)}%
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
