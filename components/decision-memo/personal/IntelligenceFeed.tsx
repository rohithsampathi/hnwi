'use client';

import { CheckCircle2 } from 'lucide-react';
import { useCastleBriefCount } from '@/lib/hooks/useCastleBriefCount';

export default function IntelligenceFeed() {
  const castleBriefCount = useCastleBriefCount();
  const dataPoints = [
    {
      label: 'Regulatory Developments',
      value: castleBriefCount !== null ? castleBriefCount.toLocaleString() : 'Live',
    },
    { label: 'Precedent Transactions', value: '238' },
    { label: 'Risk Indicators', value: '47' },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Data Coverage
        </span>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        {dataPoints.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-mono font-semibold text-gold tabular-nums">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
