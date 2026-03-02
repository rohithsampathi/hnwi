// components/ask-rohith-jarvis/JarvisCommandCenter.tsx
// JARVIS Command Center - The Revolutionary AI Interface

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRohith } from '@/contexts/rohith-context';
import { RohithAI } from '@/lib/rohith-ai-intelligence';
import { motion, AnimatePresence } from 'framer-motion';
import AmbientIntelligence from './AmbientIntelligence';
import ConversationCanvas from './ConversationCanvas';
import RohithNarrator from './RohithNarrator';
import PredictivePrompts from './PredictivePrompts';

/**
 * JARVIS COMMAND CENTER
 *
 * The revolutionary AI interface that makes ChatGPT look ancient.
 *
 * Architecture:
 * - Layer 1: Ambient Intelligence (portfolio health, live alerts)
 * - Layer 2: Conversation Canvas (workspace for visualizations)
 * - Layer 3: Rohith Narrator (conversational overlay)
 * - Layer 4: Predictive Prompts (AI suggestions)
 * - Layer 5: Holographic Effects (background atmosphere)
 *
 * This is NOT a chat interface. This is a COMMAND CENTER.
 */
export default function JarvisCommandCenter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get all state from existing rohith-context (now includes JARVIS state)
  const {
    conversations,
    activeConversationId,
    currentMessages,
    isLoading,
    isTyping,
    userContext,
    selectConversation,
    createNewConversation,
    sendMessage,
    deleteConversation,
    // JARVIS-specific state
    visualizations,
    predictivePrompts,
    narration
  } = useRohith();

  // URL sync
  const urlConversationId = searchParams.get('conversation');

  // Command center UI state (NOT data state - that's in context)
  const [narratorExpanded, setNarratorExpanded] = useState(false);
  const [ambientDimmed, setAmbientDimmed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize AI intelligence layer
  const ai = useMemo(
    () => new RohithAI(conversations, currentMessages, activeConversationId, userContext),
    [conversations, currentMessages, activeConversationId, userContext]
  );

  const recommendation = ai.getRecommendation();
  const conversationPhase = ai.getConversationPhase();

  // Sync URL with active conversation
  useEffect(() => {
    if (activeConversationId && urlConversationId !== activeConversationId) {
      const url = new URL(window.location.href);
      url.searchParams.set('conversation', activeConversationId);
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [activeConversationId, urlConversationId, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Focus input (Quick Ask)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Escape: Minimize narrator if expanded
      if (e.key === 'Escape' && narratorExpanded) {
        setNarratorExpanded(false);
      }

      // Cmd/Ctrl + E: Toggle narrator expansion
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setNarratorExpanded(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [narratorExpanded]);

  // Handle message sending
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      // Dim ambient background when processing
      setAmbientDimmed(true);

      if (activeConversationId) {
        await sendMessage(message);
      } else {
        await createNewConversation(message);
      }

      // Clear input
      if (inputRef.current) {
        inputRef.current.value = '';
      }

      // Restore ambient after response
      setTimeout(() => setAmbientDimmed(false), 500);
    } catch (error) {
      console.error('Failed to send message:', error);
      setAmbientDimmed(false);
    }
  };

  // Handle suggested prompt click
  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex flex-1 overflow-hidden relative bg-background">
      {/* Clean minimal background - no effects */}

      {/* Layer 1: Ambient Intelligence Bar (Top) */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <AmbientIntelligence
          userContext={userContext}
          conversations={conversations}
          activeConversationId={activeConversationId}
          recommendation={recommendation}
        />
      </div>

      {/* Main Content Area (Below ambient bar) */}
      <div className="flex flex-col flex-1 pt-16 relative z-10">
        {/* Layer 2: Conversation Canvas (Main Workspace) */}
        <div className="flex-1 overflow-hidden relative">
          <ConversationCanvas
            currentMessages={currentMessages}
            isTyping={isTyping}
            isLoading={isLoading}
            userContext={userContext}
            conversationPhase={conversationPhase}
            activeVisualizations={visualizations.map(v => v.id)}
            visualizationCommands={visualizations}
            onVisualizationAdd={(vizId) => {
              // Visualization added (could track analytics here)
              console.log('Visualization materialized:', vizId);
            }}
            onVisualizationRemove={(vizId) => {
              // Visualization removed - would need to update context
              console.log('Visualization dismissed:', vizId);
            }}
          />
        </div>

        {/* Layer 3: Rohith Narrator (Floating Overlay) */}
        <div
          className={`absolute transition-all duration-300 z-40 ${
            narratorExpanded
              ? 'inset-y-0 right-0 w-96'
              : 'bottom-24 right-6 w-80'
          }`}
        >
          <RohithNarrator
            currentMessages={currentMessages}
            isTyping={isTyping}
            expanded={narratorExpanded}
            onToggleExpand={() => setNarratorExpanded(prev => !prev)}
            conversationPhase={conversationPhase}
          />
        </div>

        {/* Layer 4: Predictive Prompts (Bottom, above input) */}
        <div className="absolute bottom-20 left-6 right-6 z-30">
          <PredictivePrompts
            recommendation={recommendation}
            conversationPhase={conversationPhase}
            onPromptClick={handlePromptClick}
          />
        </div>

        {/* Layer 5: Input (Bottom) */}
        <div className="relative z-30 border-t border-border/50 bg-background">
          <div className="max-w-4xl mx-auto p-6">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask anything..."
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border focus:ring-1 focus:ring-border transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e.currentTarget.value);
                  }
                }}
                disabled={isLoading}
              />

              {/* Send button */}
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-foreground text-background rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                onClick={() => {
                  if (inputRef.current?.value) {
                    handleSendMessage(inputRef.current.value);
                  }
                }}
                disabled={isLoading}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
