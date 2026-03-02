// components/ask-rohith-jarvis/visualizations/ConcentrationDonutViz.tsx
// Donut chart showing jurisdiction concentration

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';
import { CornerBrackets } from '@/components/decision-memo/personal/HolographicEffects';

interface ConcentrationDonutVizProps {
  data: {
    jurisdictions: string[];
    user_id: string;
    fetch_endpoint: string;
  };
  onClose?: () => void;
  onExpand?: () => void;
  interactive?: boolean;
}

interface ConcentrationData {
  jurisdiction: string;
  value: number;
  percentage: number;
  color: string;
}

const JURISDICTION_COLORS: Record<string, string> = {
  Singapore: '#D4A843',
  UAE: '#3B82F6',
  Dubai: '#3B82F6',
  USA: '#22C55E',
  UK: '#8B5CF6',
  India: '#F59E0B',
  'Hong Kong': '#EF4444',
  Switzerland: '#6B7280',
  Canada: '#10B981',
};

export default function ConcentrationDonutViz({
  data,
  onClose,
  onExpand,
  interactive = true
}: ConcentrationDonutVizProps) {
  const [concentration, setConcentration] = useState<ConcentrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAndCompute = async () => {
      try {
        const response = await fetch(`${data.fetch_endpoint}?owner_id=${data.user_id}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const result = await response.json();
          const assets = result.assets || [];

          // Compute concentration by jurisdiction
          const byJurisdiction: Record<string, number> = {};
          let totalValue = 0;

          assets.forEach((asset: any) => {
            const value = asset.estimated_value || 0;
            const jur = asset.jurisdiction || 'Unknown';
            byJurisdiction[jur] = (byJurisdiction[jur] || 0) + value;
            totalValue += value;
          });

          setTotal(totalValue);

          // Convert to array with percentages
          const concentrationData: ConcentrationData[] = Object.entries(byJurisdiction)
            .map(([jurisdiction, value]) => ({
              jurisdiction,
              value,
              percentage: (value / totalValue) * 100,
              color: JURISDICTION_COLORS[jurisdiction] || '#6B7280'
            }))
            .sort((a, b) => b.value - a.value);

          setConcentration(concentrationData);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Failed to fetch concentration:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAndCompute();
  }, [data.fetch_endpoint, data.user_id]);

  // Don't render if no data after loading
  if (!loading && (concentration.length === 0 || error)) {
    return null;
  }

  return (
    <div className="relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <CornerBrackets size={12} thickness={2} color="#D4A843" />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Concentration</h3>
        {interactive && (
          <div className="flex items-center gap-2">
            {onExpand && (
              <button onClick={onExpand} className="p-1 hover:bg-surface-hover rounded">
                <Maximize2 className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {concentration.map((item, index) => (
              <motion.div
                key={item.jurisdiction}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-foreground">{item.jurisdiction}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-surface-hover rounded-full overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gold w-10 text-right">
                    {item.percentage.toFixed(0)}%
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
