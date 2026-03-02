// components/ask-rohith-jarvis/JarvisContent.tsx
// JARVIS-style content area for Ask Rohith (fits within app layout)

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRohith } from '@/contexts/rohith-context';
import { RohithAI } from '@/lib/rohith-ai-intelligence';
import {
  CyberGrid,
  FloatingParticles
} from '@/components/decision-memo/personal/HolographicEffects';

/**
 * CRITICAL: This component fits WITHIN the app layout
 * - Does NOT replace HC header
 * - Does NOT replace main app sidebar
 * - Does NOT replace breadcrumbs
 * - ONLY transforms the Ask Rohith content area
 */
export default function JarvisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get all state from EXISTING rohith-context (zero changes to context)
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
    deleteConversation
  } = useRohith();

  // URL sync
  const urlConversationId = searchParams.get('conversation');

  // Initialize AI intelligence layer
  const ai = useMemo(
    () => new RohithAI(conversations, currentMessages, activeConversationId, userContext),
    [conversations, currentMessages, activeConversationId, userContext]
  );

  const recommendation = ai.getRecommendation();
  const conversationPhase = ai.getConversationPhase();
  const conversationDepth = ai.getConversationDepth();

  // Sync URL with active conversation
  useEffect(() => {
    if (activeConversationId && urlConversationId !== activeConversationId) {
      const url = new URL(window.location.href);
      url.searchParams.set('conversation', activeConversationId);
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [activeConversationId, urlConversationId, router]);

  // Keyboard shortcuts (Cmd+K for quick ask)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Focus input (will be handled in JarvisMainPanel)
        document.querySelector<HTMLInputElement>('[data-jarvis-input]')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    // NO h-screen, NO flex-col - this fits within app layout
    <div className="flex flex-1 overflow-hidden relative">
      {/* Background holographic effects (subtle, contained) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <CyberGrid />
        <FloatingParticles count={10} />
      </div>

      {/* JARVIS content - placeholder for now */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gold mb-4">JARVIS Mode Active</h2>
          <p className="text-muted-foreground mb-8">
            Sir, I'm ready for your queries.
          </p>

          {/* Show AI recommendation */}
          <div className="bg-surface border border-gold/20 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{recommendation.icon}</span>
              <span className="text-sm font-semibold text-gold uppercase">
                {recommendation.priority}
              </span>
            </div>
            <p className="text-foreground mb-2">{recommendation.message}</p>
            <p className="text-xs text-muted-foreground">{recommendation.reason}</p>

            {/* Suggested queries */}
            {recommendation.suggestedQueries && recommendation.suggestedQueries.length > 0 && (
              <div className="mt-4 space-y-2">
                {recommendation.suggestedQueries.map((query, i) => (
                  <button
                    key={i}
                    className="w-full text-left text-sm px-3 py-2 bg-surface-hover hover:bg-gold/10 border border-border hover:border-gold/50 rounded transition-colors"
                    onClick={() => {
                      if (activeConversationId) {
                        sendMessage(query);
                      } else {
                        createNewConversation(query);
                      }
                    }}
                  >
                    {query}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-8 flex gap-6 justify-center text-sm text-muted-foreground">
            <div>
              <span className="text-gold font-semibold">{conversations.length}</span> conversations
            </div>
            <div>
              <span className="text-gold font-semibold">{conversationDepth}</span> messages
            </div>
            <div>
              <span className="text-gold font-semibold">{conversationPhase}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
