// components/ask-rohith-jarvis/visualizations/TaxComparisonViz.tsx
// Tax comparison bar chart visualization

'use client';

import { motion } from 'framer-motion';
import { X, Maximize2, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TaxComparisonVizProps {
  data: {
    jurisdictions?: Array<{
      name: string;
      income_tax?: number;
      capital_gains?: number;
      corporate_tax?: number;
      vat?: number;
      estate_tax?: number;
      wealth_tax?: number;
    }>;
    advantages?: Array<{ jurisdiction: string; advantage: string }>;
  };
  onClose?: () => void;
  onExpand?: () => void;
  interactive?: boolean;
}

const TAX_COLORS: Record<string, string> = {
  income_tax: '#D4A843',
  capital_gains: '#22C55E',
  corporate_tax: '#3B82F6',
  vat: '#F59E0B',
  estate_tax: '#EF4444',
  wealth_tax: '#8B5CF6',
};

const TAX_LABELS: Record<string, string> = {
  income_tax: 'Income',
  capital_gains: 'CGT',
  corporate_tax: 'Corporate',
  vat: 'VAT',
  estate_tax: 'Estate',
  wealth_tax: 'Wealth',
};

export default function TaxComparisonViz({
  data,
  onClose,
  onExpand,
  interactive = true
}: TaxComparisonVizProps) {
  const jurisdictions = data?.jurisdictions || [];
  const advantages = data?.advantages || [];

  const taxKeys = Object.keys(TAX_COLORS);

  return (
    <div className="relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-semibold text-foreground">Tax Comparison</h3>
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
        {jurisdictions.length > 0 ? (
          <>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jurisdictions} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="name" tick={{ fill: '#A3A3A3', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#A3A3A3', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: 8 }}
                    labelStyle={{ color: '#F5F5F5' }}
                    formatter={(value: number, name: string) => [`${value}%`, TAX_LABELS[name] || name]}
                  />
                  <Legend
                    formatter={(value) => TAX_LABELS[value] || value}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                  {taxKeys.map((key) => (
                    <Bar key={key} dataKey={key} fill={TAX_COLORS[key]} radius={[2, 2, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {advantages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {advantages.map((adv, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="px-2 py-1 text-xs rounded-full bg-gold/10 text-gold border border-gold/20"
                  >
                    {adv.jurisdiction}: {adv.advantage}
                  </motion.span>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No tax comparison data available</p>
        )}
      </div>
    </div>
  );
}
