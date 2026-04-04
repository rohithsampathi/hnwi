// components/ask-rohith-jarvis/ConversationCanvas.tsx
// The main workspace where visualizations materialize

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, BarChart3, Calendar } from 'lucide-react';
import { LoadingHelix } from '@/components/decision-memo/personal/HolographicEffects';
import type { Message, UserPortfolioContext } from '@/types/rohith';
import type { ConversationPhase } from '@/lib/rohith-ai-intelligence';
import VisualizationEngine, { VisualizationCommand } from './VisualizationEngine';

interface ConversationCanvasProps {
  currentMessages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  userContext: UserPortfolioContext | null;
  conversationPhase: ConversationPhase;
  activeVisualizations: string[];
  visualizationCommands?: VisualizationCommand[];
  onVisualizationAdd: (vizId: string) => void;
  onVisualizationRemove: (vizId: string) => void;
}

/**
 * CONVERSATION CANVAS
 *
 * The "stage" where visualizations appear on demand.
 * This is NOT a message list. This is a dynamic workspace.
 *
 * Future capabilities:
 * - Summon maps (Invest Scan integration)
 * - Summon charts (Portfolio breakdown, risk radar)
 * - Summon timelines (HNWI World developments)
 * - Summon cards (Privé Exchange deals, Crown Vault assets)
 * - Multiple panels can coexist
 * - Drag to rearrange
 * - Click to drill down
 */
export default function ConversationCanvas({
  currentMessages,
  isTyping,
  isLoading,
  userContext,
  conversationPhase,
  activeVisualizations,
  visualizationCommands = [],
  onVisualizationAdd,
  onVisualizationRemove
}: ConversationCanvasProps) {
  // Check if this is the first interaction (empty state)
  const isEmpty = currentMessages.length === 0 && !isTyping;
  const portfolioValue = Number(userContext?.portfolio?.totalValue ?? 0);
  const normalizedPortfolioValue = Number.isFinite(portfolioValue) ? portfolioValue : 0;

  // Get the last message to show context
  const lastMessage = currentMessages[currentMessages.length - 1];

  return (
    <div className="relative h-full flex items-center justify-center overflow-hidden">
      {/* Visualization layer */}
      {visualizationCommands.length > 0 && (
        <VisualizationEngine
          commands={visualizationCommands}
          onClose={onVisualizationRemove}
        />
      )}

      <AnimatePresence mode="wait">
        {isEmpty ? (
          // Empty State: First-time experience
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] }}
            className="text-center max-w-2xl px-6"
          >
            {/* JARVIS Icon */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full" />
                <Sparkles className="w-16 h-16 text-gold relative z-10" />
              </div>
            </motion.div>

            {/* Welcome Message */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl font-semibold text-foreground mb-3"
            >
              Ready when you are.
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-muted-foreground text-base mb-8"
            >
              I have your portfolio data, HNWI World intelligence, and market analysis ready.
              Ask me anything.
            </motion.p>

            {/* Capabilities Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12"
            >
              {[
                {
                  icon: MapPin,
                  title: 'Geographic Analysis',
                  description: 'Interactive maps with property locations and market data'
                },
                {
                  icon: BarChart3,
                  title: 'Portfolio Insights',
                  description: 'Real-time charts showing allocations and risk metrics'
                },
                {
                  icon: Calendar,
                  title: 'Market Intelligence',
                  description: 'Timeline of developments affecting your investments'
                }
              ].map((capability, i) => (
                <motion.div
                  key={capability.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                  className="p-4 bg-surface border border-border rounded-lg hover:border-gold/30 transition-colors"
                >
                  <capability.icon className="w-6 h-6 text-gold mb-2 mx-auto" />
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {capability.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {capability.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            {userContext && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="mt-12 flex gap-6 justify-center text-xs text-muted-foreground"
              >
                <div>
                  <span className="text-gold font-semibold">1,875</span> developments indexed
                </div>
                <div>
                  <span className="text-gold font-semibold">238</span> precedent transactions
                </div>
                {userContext.portfolio && (
                  <div>
                    <span className="text-gold font-semibold">
                      ${(normalizedPortfolioValue / 1_000_000).toFixed(1)}M
                    </span>{' '}
                    portfolio synced
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ) : isTyping ? (
          // Loading State
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <LoadingHelix />
            <motion.p
              className="mt-4 text-sm text-muted-foreground"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Analyzing...
            </motion.p>
          </motion.div>
        ) : (
          // Active State: Visualization workspace
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full p-8"
          >
            {/* Placeholder for visualizations */}
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-xl">
                <h2 className="text-lg font-medium text-foreground mb-2">
                  Ready for visualizations
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Ask to see charts, maps, or data and I'll show them here.
                </p>

                {/* Example prompts */}
                <div className="space-y-2 text-left">
                  <div className="text-xs font-medium text-muted-foreground mb-3">Examples:</div>
                  {[
                    'Show my portfolio breakdown',
                    'Map my Singapore properties',
                    'Recent Dubai developments',
                    'Compare Singapore vs UAE tax'
                  ].map((example, i) => (
                    <div
                      key={i}
                      className="text-sm text-muted-foreground pl-3 border-l border-border"
                    >
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
