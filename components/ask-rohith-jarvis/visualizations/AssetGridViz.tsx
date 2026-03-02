// components/ask-rohith-jarvis/visualizations/AssetGridViz.tsx
// Crown Vault assets displayed as grid

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Maximize2, DollarSign, MapPin } from 'lucide-react';
import { CornerBrackets } from '@/components/decision-memo/personal/HolographicEffects';

interface AssetGridVizProps {
  data: {
    crown_vault_summary: string;
    jurisdictions: string[];
    user_id: string;
    fetch_endpoint: string;
  };
  onClose?: () => void;
  onExpand?: () => void;
  interactive?: boolean;
}

interface Asset {
  _id: string;
  asset_name: string;
  asset_type: string;
  jurisdiction: string;
  estimated_value: number;
  category: string;
}

/**
 * ASSET GRID VISUALIZATION
 *
 * Displays Crown Vault assets in a grid layout with
 * holographic styling and animated entrance.
 */
export default function AssetGridViz({
  data,
  onClose,
  onExpand,
  interactive = true
}: AssetGridVizProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch full asset details from Crown Vault API
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch(`${data.fetch_endpoint}?owner_id=${data.user_id}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const result = await response.json();
          setAssets(result.assets || []);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Failed to fetch assets:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [data.fetch_endpoint, data.user_id]);

  // Highlight assets from detected jurisdictions
  const isHighlighted = (asset: Asset) => {
    return data.jurisdictions?.includes(asset.jurisdiction) || false;
  };

  // Don't render if no assets after loading (backend sent command but no actual data)
  if (!loading && (assets.length === 0 || error)) {
    return null;
  }

  return (
    <div className="relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      {/* Corner brackets */}
      <CornerBrackets size={16} thickness={2} color="#D4A843" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Crown Vault Assets</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {data.crown_vault_summary}
          </p>
        </div>
        {interactive && (
          <div className="flex items-center gap-2">
            {onExpand && (
              <button
                onClick={onExpand}
                className="p-1.5 hover:bg-surface-hover rounded transition-colors"
              >
                <Maximize2 className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-surface-hover rounded transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Asset Grid */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground mt-2">Loading assets...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No assets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {assets.map((asset, index) => (
              <motion.div
                key={asset._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.3,
                  ease: [0.19, 1.0, 0.22, 1.0]
                }}
                className={`p-3 rounded border ${
                  isHighlighted(asset)
                    ? 'bg-gold/10 border-gold/30 shadow-lg shadow-gold/20'
                    : 'bg-surface-hover border-border'
                } hover:border-gold/50 transition-all cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-gold uppercase">
                    {asset.asset_type}
                  </span>
                  {isHighlighted(asset) && (
                    <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                  )}
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
                  {asset.asset_name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{asset.jurisdiction}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground mt-2">
                  <DollarSign className="w-3 h-3" />
                  <span className="font-semibold">
                    ${(asset.estimated_value / 1000).toFixed(0)}K
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
