// components/ask-rohith-jarvis/RohithNarrator.tsx
// Rohith's conversational overlay - the "voice" of JARVIS

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronDown, ChevronUp, User, Sparkles } from 'lucide-react';
import { CornerBrackets, LoadingHelix } from '@/components/decision-memo/personal/HolographicEffects';
import type { Message } from '@/types/rohith';
import type { ConversationPhase } from '@/lib/rohith-ai-intelligence';

interface RohithNarratorProps {
  currentMessages: Message[];
  isTyping: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  conversationPhase: ConversationPhase;
}

/**
 * ROHITH NARRATOR
 *
 * The conversational overlay that shows message history.
 * This is NOT a traditional chat sidebar. This is a floating narrator panel.
 *
 * Modes:
 * - Collapsed: Shows last message only (minimalist)
 * - Expanded: Shows full conversation history (sidebar)
 *
 * The narrator "speaks" messages with animated text delivery.
 */
export default function RohithNarrator({
  currentMessages,
  isTyping,
  expanded,
  onToggleExpand,
  conversationPhase
}: RohithNarratorProps) {
  // Get the last assistant message for collapsed view
  const lastAssistantMessage = [...currentMessages]
    .reverse()
    .find(m => m.role === 'assistant');

  return (
    <motion.div
      layout
      className={`relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden ${
        expanded ? 'h-full' : ''
      }`}
    >
      {/* Corner brackets for HUD effect */}
      <CornerBrackets size={12} thickness={2} color="#D4A843" />

      {/* Header */}
      <motion.div
        layout
        className="flex items-center justify-between p-4 border-b border-border cursor-pointer hover:bg-surface-hover transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-sm font-semibold text-foreground">Rohith</span>
          <span className="text-xs text-muted-foreground">
            ({currentMessages.length} messages)
          </span>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {expanded ? (
          // Expanded: Full conversation history
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(100% - 60px)' }}
          >
            <div className="p-4 space-y-4">
              {currentMessages.map((message, index) => (
                <motion.div
                  key={message.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-gold" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-gold/10 border border-gold/20'
                        : 'bg-surface-hover border border-border'
                    }`}
                  >
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-gold" />
                  </div>
                  <div className="bg-surface-hover border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-gold rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-gold rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          // Collapsed: Last message only
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4"
          >
            {isTyping ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-gold" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-gold rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-gold rounded-full animate-pulse delay-150" />
                  </div>
                  <p className="text-xs text-muted-foreground">Analyzing your query...</p>
                </div>
              </div>
            ) : lastAssistantMessage ? (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-gold" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground line-clamp-3">
                    {lastAssistantMessage.content}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExpand();
                    }}
                    className="mt-2 text-xs text-gold hover:text-gold-muted transition-colors"
                  >
                    Show full conversation
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                <p className="text-xs text-muted-foreground">
                  No messages yet. Ask me anything to begin.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase indicator (bottom) */}
      {!expanded && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-gold/10 border border-gold/20 rounded text-xs text-gold font-semibold">
          {conversationPhase.replace('_', ' ')}
        </div>
      )}
    </motion.div>
  );
}
