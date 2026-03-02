// components/ask-rohith-jarvis/VisualizationEngine.tsx
// The engine that renders visualization commands from backend

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { memo } from 'react';

// Visualization component imports
import AssetGridViz from './visualizations/AssetGridViz';
import ConcentrationDonutViz from './visualizations/ConcentrationDonutViz';
import DevelopmentTimelineViz from './visualizations/DevelopmentTimelineViz';
import JurisdictionMapViz from './visualizations/JurisdictionMapViz';
import RiskHeatmapViz from './visualizations/RiskHeatmapViz';
import CascadeGraphViz from './visualizations/CascadeGraphViz';
import PortfolioStatsViz from './visualizations/PortfolioStatsViz';
import TaxComparisonViz from './visualizations/TaxComparisonViz';
import RegulatoryTimelineViz from './visualizations/RegulatoryTimelineViz';
import MigrationFlowViz from './visualizations/MigrationFlowViz';
import JurisdictionScorecardViz from './visualizations/JurisdictionScorecardViz';
import KeyMetricsViz from './visualizations/KeyMetricsViz';
import CostOfDelayViz from './visualizations/CostOfDelayViz';

/**
 * Visualization Command from backend
 */
export interface VisualizationCommand {
  id: string;
  type: string;
  position: 'center' | 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: 'small' | 'medium' | 'large' | 'full';
  animation: 'materialize' | 'slide' | 'fade' | 'fly_to' | 'zoom';
  duration_ms: number;
  priority: number;
  data: any;
  interactive: boolean;
}

interface VisualizationEngineProps {
  commands: VisualizationCommand[];
  onClose?: (id: string) => void;
  onExpand?: (id: string) => void;
  inline?: boolean; // Render inline (in message bubbles) instead of absolute positioned
}

/**
 * VISUALIZATION ENGINE
 *
 * Receives visualization commands from backend and renders
 * the appropriate React components with proper positioning,
 * animations, and interactivity.
 *
 * This is the "materialization layer" - where Rohith's intelligence
 * becomes visual.
 */
const VisualizationEngine = memo(function VisualizationEngine({
  commands,
  onClose,
  onExpand,
  inline = false
}: VisualizationEngineProps) {
  // Sort by priority
  const sortedCommands = [...commands].sort((a, b) => a.priority - b.priority);

  // Map animation types to framer-motion variants
  const getAnimationVariants = (animation: string, position: string) => {
    switch (animation) {
      case 'materialize':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 }
        };
      case 'slide':
        const slideDirection = position.includes('right') ? { x: 100 } : position.includes('left') ? { x: -100 } : { y: 100 };
        return {
          initial: { opacity: 0, ...slideDirection },
          animate: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, ...slideDirection }
        };
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
      case 'fly_to':
        return {
          initial: { opacity: 0, scale: 0.5, y: -100 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.5, y: -100 }
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0 }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  // Map position to CSS classes
  const getPositionClass = (position: string, size: string) => {
    const sizeClasses = {
      small: 'w-80 h-64',
      medium: 'w-96 h-80',
      large: 'w-[48rem] h-96',
      full: 'w-full h-full'
    };

    const positionClasses = {
      center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      left: 'top-1/2 left-6 -translate-y-1/2',
      right: 'top-1/2 right-6 -translate-y-1/2',
      top: 'top-6 left-1/2 -translate-x-1/2',
      bottom: 'bottom-6 left-1/2 -translate-x-1/2',
      'top-left': 'top-6 left-6',
      'top-right': 'top-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'bottom-right': 'bottom-6 right-6'
    };

    return `${positionClasses[position as keyof typeof positionClasses] || positionClasses.center} ${sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.medium}`;
  };

  // Render the appropriate visualization component
  const renderVisualization = (command: VisualizationCommand) => {
    const props = {
      data: command.data,
      onClose: onClose ? () => onClose(command.id) : undefined,
      onExpand: onExpand ? () => onExpand(command.id) : undefined,
      interactive: command.interactive
    };

    switch (command.type) {
      case 'asset_grid':
        return <AssetGridViz {...props} />;
      case 'concentration_donut':
      case 'concentration_chart':
        return <ConcentrationDonutViz {...props} />;
      case 'development_timeline':
        return <DevelopmentTimelineViz {...props} />;
      case 'jurisdiction_map':
        return <JurisdictionMapViz {...props} />;
      case 'risk_heatmap':
        return <RiskHeatmapViz {...props} />;
      case 'cascade_graph':
        return <CascadeGraphViz {...props} />;
      case 'portfolio_stats':
        return <PortfolioStatsViz {...props} />;
      case 'tax_comparison':
        return <TaxComparisonViz {...props} />;
      case 'regulatory_timeline':
        return <RegulatoryTimelineViz {...props} />;
      case 'migration_flow':
        return <MigrationFlowViz {...props} />;
      case 'jurisdiction_scorecard':
        return <JurisdictionScorecardViz {...props} />;
      case 'key_metrics':
        return <KeyMetricsViz {...props} />;
      case 'cost_of_delay':
        return <CostOfDelayViz {...props} />;
      default:
        // Fallback for unknown types
        return (
          <div className="p-4 bg-surface border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              Visualization type "{command.type}" not yet implemented
            </p>
          </div>
        );
    }
  };

  // Inline mode: render in flow (for message bubbles)
  if (inline) {
    return (
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="sync">
          {sortedCommands.map((command, index) => {
            const variants = getAnimationVariants(command.animation, command.position);
            return (
              <motion.div
                key={command.id}
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{
                  duration: command.duration_ms / 1000,
                  ease: [0.19, 1.0, 0.22, 1.0],
                  delay: index * 0.1
                }}
              >
                {renderVisualization(command)}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }

  // Absolute mode: positioned overlays (for full-page JARVIS view)
  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence mode="sync">
        {sortedCommands.map((command, index) => {
          const variants = getAnimationVariants(command.animation, command.position);
          const positionClass = getPositionClass(command.position, command.size);

          return (
            <motion.div
              key={command.id}
              className={`absolute ${positionClass} pointer-events-auto`}
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              transition={{
                duration: command.duration_ms / 1000,
                ease: [0.19, 1.0, 0.22, 1.0],
                delay: index * 0.1
              }}
              style={{
                zIndex: 100 + command.priority
              }}
            >
              {renderVisualization(command)}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});

export default VisualizationEngine;
