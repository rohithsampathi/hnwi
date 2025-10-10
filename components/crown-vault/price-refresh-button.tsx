"use client";

import { useState } from "react";
import { RefreshCw, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CrownVaultAsset, refreshAssetPrice } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface PriceRefreshButtonProps {
  asset: CrownVaultAsset;
  onPriceUpdated?: (updatedAsset: CrownVaultAsset) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  className?: string;
}

export function PriceRefreshButton({
  asset,
  onPriceUpdated,
  variant = "ghost",
  size = "sm",
  showLabel = false,
  className = ""
}: PriceRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefreshPrice = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent onClick

    try {
      setIsRefreshing(true);

      const result = await refreshAssetPrice(asset.asset_id);

      // Create updated asset object
      const updatedAsset: CrownVaultAsset = {
        ...asset,
        asset_data: {
          ...asset.asset_data,
          cost_per_unit: result.new_price,
          current_price: result.new_price,
          value: (asset.asset_data.unit_count || 1) * result.new_price
        },
        appreciation: result.appreciation,
        last_price_update: new Date().toISOString()
      };

      // Call parent callback
      if (onPriceUpdated) {
        onPriceUpdated(updatedAsset);
      }

      // Show success toast with annualized return
      toast({
        title: "💎 Price Updated via Katherine AI",
        description: (
          <div className="space-y-1">
            <p className="font-semibold">{asset.asset_data.name}</p>
            <p className="text-xs">
              Total: {result.appreciation.percentage > 0 ? '+' : ''}
              {result.appreciation.percentage.toFixed(1)}%
            </p>
            <p className="text-xs font-bold text-primary">
              Annualized: {result.appreciation.annualized > 0 ? '+' : ''}
              {result.appreciation.annualized.toFixed(2)}% per year
            </p>
            {result.confidence_score && (
              <p className="text-xs text-muted-foreground">
                Confidence: {Math.round(result.confidence_score * 100)}%
              </p>
            )}
          </div>
        ),
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Price Refresh Failed",
        description: error instanceof Error
          ? error.message
          : "Katherine AI price fetch failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleRefreshPrice}
            disabled={isRefreshing}
            className={`${className} ${isRefreshing ? 'cursor-wait' : ''}`}
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Brain className="h-4 w-4" />
                {showLabel && <span className="ml-2">Refresh Price</span>}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="font-semibold">Katherine AI Price Fetch</p>
            </div>
            <p className="text-xs">
              Automatically fetches latest market price for this asset using
              Katherine's real-time intelligence network.
            </p>
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <p>✓ Updates price history</p>
              <p>✓ Recalculates appreciation metrics</p>
              <p>✓ Shows annualized returns</p>
              <p>✓ AI confidence scoring</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
