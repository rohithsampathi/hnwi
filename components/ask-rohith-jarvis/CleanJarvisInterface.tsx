// components/ask-rohith-jarvis/CleanJarvisInterface.tsx
// Clean JARVIS-style intelligent assistant interface

'use client';

import { useRef, useEffect, useState } from 'react';
import { useRohith } from '@/contexts/rohith-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Activity, AlertCircle } from 'lucide-react';
import { LoadingHelix } from '@/components/decision-memo/personal/HolographicEffects';
import VisualizationEngine from './VisualizationEngine';

/**
 * CLEAN JARVIS INTERFACE
 *
 * Intelligent assistant with:
 * - Clean, spacious layout
 * - Visualization capabilities
 * - JARVIS-style responses
 * - Minimal chrome
 */
export default function CleanJarvisInterface() {
  const {
    currentMessages,
    isLoading,
    isTyping,
    userContext,
    activeConversationId,
    createNewConversation,
    sendMessage,
    visualizations,
    predictivePrompts
  } = useRohith();

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Handle send
  const handleSend = async () => {
    const message = inputValue.trim();
    if (!message || isLoading) return;

    setInputValue('');

    try {
      if (activeConversationId) {
        await sendMessage(message);
      } else {
        await createNewConversation(message);
      }
    } catch (error) {
      console.error('Send error:', error);
      // Show error to user
      alert('Backend connection error. The V5 API endpoint needs to be fixed (MongoDB collection limit reached).');
    }
  };

  // Portfolio value
  const portfolioValue = Number(userContext?.portfolio?.totalValue ?? 0);
  const normalizedPortfolioValue = Number.isFinite(portfolioValue) ? portfolioValue : 0;
  const formattedValue = normalizedPortfolioValue > 0
    ? `$${(normalizedPortfolioValue / 1_000_000).toFixed(1)}M`
    : null;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Minimal Status Bar - Only when portfolio loaded */}
      {formattedValue && (
        <div className="border-b border-border/30">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Portfolio:</span>
              <span className="text-foreground font-medium">{formattedValue}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {currentMessages.length} message{currentMessages.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Visualizations Layer */}
        {visualizations.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <VisualizationEngine
              commands={visualizations}
              onClose={(id) => console.log('Visualization closed:', id)}
            />
          </div>
        )}

        {/* Messages */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Empty State */}
          {currentMessages.length === 0 && !isTyping && (
            <div className="text-center py-32">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto bg-foreground/5 rounded-full flex items-center justify-center">
                  <Activity className="w-8 h-8 text-foreground/40" />
                </div>
              </div>
              <h1 className="text-3xl font-light text-foreground mb-3">
                Intelligence ready
              </h1>
              <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">
                I have access to your portfolio, HNWI World intelligence, and market analysis.
                Ask me anything.
              </p>
            </div>
          )}

          {/* Conversation */}
          <div className="space-y-8">
            {currentMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.19, 1.0, 0.22, 1.0] }}
              >
                {message.role === 'user' ? (
                  // User Message
                  <div className="flex justify-end">
                    <div className="max-w-[85%]">
                      <div className="text-xs text-muted-foreground mb-2 text-right">
                        You
                      </div>
                      <div className="bg-foreground/5 border border-border/50 rounded-2xl px-6 py-4">
                        <p className="text-foreground leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Assistant Message
                  <div className="flex justify-start">
                    <div className="max-w-[85%]">
                      <div className="text-xs text-muted-foreground mb-2">
                        Intelligence System
                      </div>
                      <div className="bg-background border border-border/30 rounded-2xl px-6 py-4">
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        {message.context?.responseTime && (
                          <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/20">
                            Analyzed in {message.context.responseTime}ms
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%]">
                  <div className="text-xs text-muted-foreground mb-2">
                    Intelligence System
                  </div>
                  <div className="bg-background border border-border/30 rounded-2xl px-6 py-4">
                    <div className="flex items-center gap-3">
                      <LoadingHelix />
                      <span className="text-muted-foreground text-sm">
                        Processing query...
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Predictive Prompts - Clean minimal version */}
          {predictivePrompts.length > 0 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 pt-8 border-t border-border/20"
            >
              <div className="text-xs text-muted-foreground mb-3">
                Suggested next queries:
              </div>
              <div className="flex flex-wrap gap-2">
                {predictivePrompts.slice(0, 3).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputValue(prompt);
                      inputRef.current?.focus();
                    }}
                    className="px-4 py-2 text-sm text-muted-foreground border border-border/30 rounded-lg hover:bg-foreground/5 hover:text-foreground transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Area - Clean, spacious */}
      <div className="border-t border-border/30 bg-background">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter query..."
              className="flex-1 bg-transparent border-b border-border/50 px-2 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors text-base"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="p-3 bg-foreground text-background rounded-full hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
