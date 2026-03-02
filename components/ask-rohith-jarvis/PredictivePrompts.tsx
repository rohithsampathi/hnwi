// components/ask-rohith-jarvis/PredictivePrompts.tsx
// AI-suggested next actions - predictive intelligence

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { RohithRecommendation, ConversationPhase } from '@/lib/rohith-ai-intelligence';

interface PredictivePromptsProps {
  recommendation: RohithRecommendation;
  conversationPhase: ConversationPhase;
  onPromptClick: (prompt: string) => void;
}

/**
 * PREDICTIVE PROMPTS
 *
 * AI-suggested next actions based on conversation context.
 * This is NOT a static prompt list. This is INTELLIGENT recommendation.
 *
 * The prompts change based on:
 * - Conversation depth
 * - Current phase
 * - User context
 * - AI analysis
 *
 * Clicking a prompt instantly executes that query.
 */
export default function PredictivePrompts({
  recommendation,
  conversationPhase,
  onPromptClick
}: PredictivePromptsProps) {
  // Only show prompts if we have suggested queries
  const hasPrompts = recommendation.suggestedQueries && recommendation.suggestedQueries.length > 0;

  if (!hasPrompts) return null;

  // Get priority color
  const priorityColor = {
    CRITICAL: '#EF4444',
    HIGH: '#D4A843',
    RECOMMENDED: '#3B82F6',
    OPTIONAL: '#6B7280'
  }[recommendation.priority];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.19, 1.0, 0.22, 1.0] }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-surface/95 backdrop-blur-sm border border-border rounded-lg p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-xs font-semibold text-foreground">Suggested Next Actions</span>
            <div
              className="px-2 py-0.5 rounded text-xs font-semibold"
              style={{
                backgroundColor: `${priorityColor}20`,
                color: priorityColor,
                borderColor: `${priorityColor}40`,
                borderWidth: 1
              }}
            >
              {recommendation.priority}
            </div>
          </div>

          {/* Recommendation message */}
          <p className="text-sm text-muted-foreground mb-3">
            {recommendation.message}
          </p>

          {/* Suggested prompts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {recommendation.suggestedQueries!.map((query, index) => (
              <motion.button
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.3,
                  ease: [0.19, 1.0, 0.22, 1.0]
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPromptClick(query)}
                className="group relative flex items-center justify-between gap-2 px-3 py-2 bg-surface-hover hover:bg-gold/10 border border-border hover:border-gold/50 rounded-lg transition-all text-left"
              >
                <span className="text-sm text-foreground flex-1">{query}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors flex-shrink-0" />

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute inset-0 rounded-lg bg-gold/5" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Reason (subtle) */}
          <div className="mt-3 text-xs text-muted-foreground/70 italic">
            {recommendation.reason}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
