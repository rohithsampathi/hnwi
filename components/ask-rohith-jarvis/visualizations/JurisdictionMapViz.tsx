// components/ask-rohith-jarvis/visualizations/JurisdictionMapViz.tsx
// Map showing jurisdictions with markers

'use client';

import { motion } from 'framer-motion';
import { X, Maximize2, MapPin } from 'lucide-react';
import { CornerBrackets } from '@/components/decision-memo/personal/HolographicEffects';

interface JurisdictionMapVizProps {
  data: {
    center: { lat: number; lng: number };
    zoom: number;
    markers: Array<{
      jurisdiction: string;
      lat: number;
      lng: number;
      development_count: number;
    }>;
    jurisdictions: string[];
  };
  onClose?: () => void;
  onExpand?: () => void;
  interactive?: boolean;
}

export default function JurisdictionMapViz({
  data,
  onClose,
  onExpand,
  interactive = true
}: JurisdictionMapVizProps) {
  return (
    <div className="relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <CornerBrackets size={12} thickness={2} color="#D4A843" />

      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-semibold text-foreground">Jurisdictions</h3>
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

      <div className="p-4 space-y-2">
        {data.markers.map((marker, index) => (
          <motion.div
            key={marker.jurisdiction}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 bg-surface-hover rounded border border-border hover:border-gold/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-gold" />
              <span className="text-sm font-medium text-foreground">{marker.jurisdiction}</span>
            </div>
            {marker.development_count > 0 && (
              <span className="text-xs text-muted-foreground">
                {marker.development_count} dev{marker.development_count !== 1 ? 's' : ''}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
