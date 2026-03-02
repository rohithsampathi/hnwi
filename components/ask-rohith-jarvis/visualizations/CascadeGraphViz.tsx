// components/ask-rohith-jarvis/visualizations/CascadeGraphViz.tsx
// TECI cascade graph — node-edge graph with triggers and effects

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Maximize2, Network } from 'lucide-react';

interface CascadeNode {
  id: string;
  label: string;
  type: 'trigger' | 'effect';
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

interface CascadeEdge {
  from: string;
  to: string;
  label?: string;
}

interface CascadeGraphVizProps {
  data: {
    nodes?: CascadeNode[];
    edges?: CascadeEdge[];
    title?: string;
  };
  onClose?: () => void;
  onExpand?: () => void;
  interactive?: boolean;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#D4A843',
  low: '#22C55E',
};

export default function CascadeGraphViz({
  data,
  onClose,
  onExpand,
  interactive = true
}: CascadeGraphVizProps) {
  const nodes = data?.nodes || [];
  const edges = data?.edges || [];

  const triggers = useMemo(() => nodes.filter(n => n.type === 'trigger'), [nodes]);
  const effects = useMemo(() => nodes.filter(n => n.type === 'effect'), [nodes]);

  // Layout: triggers on left, effects on right
  const SVG_W = 440;
  const SVG_H = Math.max(triggers.length, effects.length, 1) * 60 + 40;
  const LEFT_X = 100;
  const RIGHT_X = 340;

  const getNodeY = (index: number, total: number) => {
    const spacing = (SVG_H - 40) / Math.max(total, 1);
    return 20 + spacing * index + spacing / 2;
  };

  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    triggers.forEach((n, i) => { positions[n.id] = { x: LEFT_X, y: getNodeY(i, triggers.length) }; });
    effects.forEach((n, i) => { positions[n.id] = { x: RIGHT_X, y: getNodeY(i, effects.length) }; });
    return positions;
  }, [triggers, effects, SVG_H]);

  return (
    <div className="relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-semibold text-foreground">{data?.title || 'Cascade Network'}</h3>
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
        {nodes.length > 0 ? (
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ maxHeight: 280 }}>
            {/* Column labels */}
            <text x={LEFT_X} y={14} textAnchor="middle" fill="#A3A3A3" fontSize={10} fontWeight={600}>TRIGGERS</text>
            <text x={RIGHT_X} y={14} textAnchor="middle" fill="#A3A3A3" fontSize={10} fontWeight={600}>EFFECTS</text>

            {/* Edges — bezier curves */}
            {edges.map((edge, i) => {
              const from = nodePositions[edge.from];
              const to = nodePositions[edge.to];
              if (!from || !to) return null;
              const cp1x = from.x + 80;
              const cp2x = to.x - 80;
              return (
                <motion.path
                  key={`edge-${i}`}
                  d={`M ${from.x + 50} ${from.y} C ${cp1x} ${from.y}, ${cp2x} ${to.y}, ${to.x - 50} ${to.y}`}
                  fill="none"
                  stroke="#D4A84366"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                />
              );
            })}

            {/* Trigger nodes */}
            {triggers.map((node, i) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              const color = SEVERITY_COLORS[node.severity || 'medium'];
              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <rect
                    x={pos.x - 48} y={pos.y - 14} width={96} height={28}
                    rx={6} fill="#141414" stroke={color} strokeWidth={1.5}
                  />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#F5F5F5" fontSize={9} fontWeight={500}>
                    {node.label.length > 14 ? node.label.slice(0, 13) + '...' : node.label}
                  </text>
                </motion.g>
              );
            })}

            {/* Effect nodes */}
            {effects.map((node, i) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              const color = SEVERITY_COLORS[node.severity || 'medium'];
              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                >
                  <rect
                    x={pos.x - 48} y={pos.y - 14} width={96} height={28}
                    rx={6} fill="#141414" stroke={color} strokeWidth={1.5}
                  />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#F5F5F5" fontSize={9} fontWeight={500}>
                    {node.label.length > 14 ? node.label.slice(0, 13) + '...' : node.label}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No cascade data available</p>
        )}
      </div>
    </div>
  );
}
