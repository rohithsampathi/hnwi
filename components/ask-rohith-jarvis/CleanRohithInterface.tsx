// components/ask-rohith-jarvis/CleanRohithInterface.tsx
// Clean, minimal chat interface

'use client';

import { useRef, useEffect } from 'react';
import { useRohith } from '@/contexts/rohith-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send } from 'lucide-react';
import { CrownLoader } from '@/components/ui/crown-loader';

/**
 * CLEAN ROHITH INTERFACE
 *
 * Just messages and input. Nothing else.
 * No layers, no effects, no complexity.
 */
export default function CleanRohithInterface() {
  const {
    currentMessages,
    isLoading,
    isTyping,
    userContext,
    activeConversationId,
    createNewConversation,
    sendMessage
  } = useRohith();

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Handle send
  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;

    if (activeConversationId) {
      await sendMessage(message);
    } else {
      await createNewConversation(message);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Empty State */}
          {currentMessages.length === 0 && !isTyping && (
            <div className="text-center py-20">
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Ask anything
              </h1>
              <p className="text-muted-foreground">
                I have your portfolio data and market intelligence ready.
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-6">
            {currentMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-foreground text-background'
                      : 'bg-surface text-foreground border border-border'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-surface text-foreground border border-border rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Analyzing...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask anything..."
              className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-border"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e.currentTarget.value);
                }
              }}
              disabled={isLoading}
            />
            <button
              onClick={() => {
                if (inputRef.current?.value) {
                  handleSend(inputRef.current.value);
                }
              }}
              disabled={isLoading}
              className="px-4 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
