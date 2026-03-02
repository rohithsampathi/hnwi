// components/ask-rohith-jarvis/visualizations/CostOfDelayViz.tsx
// Stacked area chart showing escalating quarterly costs

'use client';

import { motion } from 'framer-motion';
import { X, Maximize2, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CostOfDelayVizProps {
  data: {
    quarters?: Array<{
      quarter: string;
      tax_exposure?: number;
      regulatory_risk?: number;
      opportunity_cost?: number;
      total?: number;
    }>;
    total_cost?: string;
    recommendation?: string;
  };
  onClose?: () => void;
  onExpand?: () => void;
  interactive?: boolean;
}

export default function CostOfDelayViz({
  data,
  onClose,
  onExpand,
  interactive = true
}: CostOfDelayVizProps) {
  const quarters = data?.quarters || [];

  return (
    <div className="relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-semibold text-foreground">Cost of Delay</h3>
        </div>
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

      <div className="p-4">
        {quarters.length > 0 ? (
          <>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={quarters}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="quarter" tick={{ fill: '#A3A3A3', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#A3A3A3', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: 8 }}
                    labelStyle={{ color: '#F5F5F5' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="tax_exposure"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#EF444433"
                    name="Tax Exposure"
                  />
                  <Area
                    type="monotone"
                    dataKey="regulatory_risk"
                    stackId="1"
                    stroke="#F59E0B"
                    fill="#F59E0B33"
                    name="Regulatory Risk"
                  />
                  <Area
                    type="monotone"
                    dataKey="opportunity_cost"
                    stackId="1"
                    stroke="#D4A843"
                    fill="#D4A84333"
                    name="Opportunity Cost"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {(data?.total_cost || data?.recommendation) && (
              <div className="mt-3 flex items-center justify-between text-xs">
                {data.total_cost && (
                  <span className="font-semibold text-red-400">Total: {data.total_cost}</span>
                )}
                {data.recommendation && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-gold italic"
                  >
                    {data.recommendation}
                  </motion.span>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No cost projection data available</p>
        )}
      </div>
    </div>
  );
}
