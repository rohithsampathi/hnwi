// components/ask-rohith-jarvis/PremiumRohithInterface.tsx
// Premium JARVIS-style intelligence interface with unified citation system

'use client';

import { isValidElement, useRef, useEffect, useState } from 'react';
import { useRohith } from '@/contexts/rohith-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, MessageCircle, MessageSquare, Trash2, ChevronLeft, Share2, Check, User, Clock, BookOpen, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { secureApi } from '@/lib/secure-api';
import { getConversationHistory } from '@/lib/rohith-api';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import PremiumLoader from './PremiumLoader';
import VisualizationEngine from './VisualizationEngine';
import { CitationText } from '@/components/elite/citation-text';
import { EliteCitationPanel } from '@/components/elite/elite-citation-panel';
import { extractDevIds } from '@/lib/parse-dev-citations';
import { parseMessageContent } from '@/lib/utils';
import type { Citation } from '@/lib/parse-dev-citations';
import type { KGIntelligenceSource, SourceDocument } from '@/types/rohith';

interface PreloadedDevelopment {
  id: string;
  title: string;
  description: string;
  industry: string;
  product?: string;
  date?: string;
  summary: string;
  url?: string;
  numerical_data?: Array<{ number: string; unit: string; context: string; source?: string }>;
}

interface PremiumRohithInterfaceProps {
  sidebarOpen?: boolean;
  onSidebarToggle?: (open: boolean) => void;
  onNewChat?: () => void;
  onConversationChange?: (conversationId: string | null) => void;
  showNewChatDialog?: boolean;
  onCloseNewChatDialog?: () => void;
}

function isKgIntelligenceSource(source: SourceDocument): source is KGIntelligenceSource {
  return source.type === 'kg_intelligence';
}

function getDevelopmentCitationId(source: SourceDocument | Record<string, any>): string {
  if (!source || source.type === 'kg_intelligence') return '';
  const rawSource = source as Record<string, any>;
  return String(
    rawSource.dev_id ||
    rawSource.development_id ||
    rawSource.source_development_id ||
    rawSource.id ||
    ''
  ).trim();
}

function getKgCitationId(source: KGIntelligenceSource): string {
  return `kg_${[source.category, source.jurisdiction, source.label]
    .join('_')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')}`;
}

function sourceLabel(count: number): string {
  return `${count} source${count === 1 ? '' : 's'}`;
}

function thoughtTimeLabel(milliseconds?: number): string {
  if (!milliseconds || milliseconds <= 0) return '';
  const seconds = milliseconds / 1000;
  return `Thought for ${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`;
}

function normalizeAudelleChatText(content: string): string {
  const text = content || '';
  return text
    .replace(/^\s*(?:\*\*)?\s*(Bottom line|Direct answer|Evidence basis|Evidence foundation|Decision implication|Missing proof|Next move):\s*(?:\*\*)?\s*\n?/gim, '')
    .replace(/—/g, ', ')
    .replace(/–/g, '-')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function reactNodeToText(node: any): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(reactNodeToText).join('');
  if (isValidElement(node)) return reactNodeToText((node.props as any)?.children);
  return '';
}

function isLegacyForcedVisualization(command: any): boolean {
  const title = String(command?.data?.title || '').toLowerCase();
  return title === 'native evidence packet' || title === 'risk assessment';
}

/**
 * PREMIUM ROHITH INTERFACE
 *
 * Sophisticated intelligence platform with:
 * - Unified citation system — all sources (DEVID + KG) render via EliteCitationPanel
 * - Toggleable history sidebar (controlled from page header)
 * - Inline visualizations
 * - Clean, premium visual hierarchy
 */
export default function PremiumRohithInterface({
  sidebarOpen = false,
  onSidebarToggle,
  onNewChat,
  onConversationChange,
  showNewChatDialog = false,
  onCloseNewChatDialog
}: PremiumRohithInterfaceProps) {
  const {
    currentMessages,
    isLoading,
    isTyping,
    userContext,
    activeConversationId,
    conversations,
    createNewConversation,
    sendMessage,
    selectConversation,
    deleteConversation,
    clearCurrentConversation,
    submitMessageFeedback,
    visualizations,
    predictivePrompts
  } = useRohith();

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendInFlightRef = useRef(false);
  const [inputValue, setInputValue] = useState('');
  const [linkCopied, setLinkCopied] = useState<string | null>(null);
  const [submittingFeedbackId, setSubmittingFeedbackId] = useState<string | null>(null);
  const { toast } = useToast();

  // Unified citation panel state — handles both DEVID and KG sources
  const [citationPanelOpen, setCitationPanelOpen] = useState(false);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [allCitations, setAllCitations] = useState<Citation[]>([]);
  const [citationMap, setCitationMap] = useState<Map<string, number>>(new Map());

  // KG sources are converted to Development-format rows for the unified citation panel.
  const [kgDevelopments, setKgDevelopments] = useState<Map<string, PreloadedDevelopment>>(new Map());

  // Build citation list + KG Development objects from all messages
  useEffect(() => {
    const citations: Citation[] = [];
    const seenDevIds = new Set<string>();
    const kgDevsMap = new Map<string, PreloadedDevelopment>();
    let citationNumber = 1;

    currentMessages.forEach((message) => {
      if (message.role === 'assistant') {
        // Extract DEVIDs from message content
        const messageText = parseMessageContent(message.content);
        const devIds = extractDevIds(messageText);

        devIds.forEach((devId) => {
          if (!seenDevIds.has(devId)) {
            seenDevIds.add(devId);
            citations.push({
              id: devId,
              number: citationNumber,
              originalText: `[DEVID - ${devId}]`
            });
            citationNumber++;
          }
        });

        // Priority 1: Use new sourceDocuments field (Feb 2026+)
        if (message.context?.sourceDocuments && Array.isArray(message.context.sourceDocuments)) {
          message.context.sourceDocuments.forEach((source) => {
            const developmentId = getDevelopmentCitationId(source);
            if (developmentId && !seenDevIds.has(developmentId)) {
              seenDevIds.add(developmentId);
              citations.push({
                id: developmentId,
                number: citationNumber,
                originalText: `[DEVID - ${developmentId}]`
              });
              citationNumber++;
            } else if (source.type === 'kg_intelligence') {
              const kgId = getKgCitationId(source);
              if (kgDevsMap.has(kgId)) return;

              citations.push({
                id: kgId,
                number: citationNumber,
                originalText: source.label
              });
              // Convert KG source to Development format for unified rendering
              const intelligenceText = source.intelligence || source.label;
              const sourceAttribution = source.source ? `\n\nSource: ${source.source}` : '';
              const kgNote = `\nDerived from HNWI Chronicles Knowledge Graph (KGv3), synthesizing verified data across ${source.category.replace(/_/g, ' ')}.`;
              kgDevsMap.set(kgId, {
                id: kgId,
                title: source.label,
                description: `${source.jurisdiction} • ${source.category.replace(/_/g, ' ')}`,
                industry: source.category.replace(/_/g, ' '),
                summary: `${intelligenceText}${sourceAttribution}${kgNote}`,
              });
              citationNumber++;
            }
          });
        }
        // Fallback: Legacy hnwiKnowledgeSources field
        else if (message.context?.hnwiKnowledgeSources && Array.isArray(message.context.hnwiKnowledgeSources)) {
          message.context.hnwiKnowledgeSources.forEach((source: any) => {
            if (typeof source === 'object' && source.dev_id && !seenDevIds.has(source.dev_id)) {
              seenDevIds.add(source.dev_id);
              citations.push({
                id: source.dev_id,
                number: citationNumber,
                originalText: `[DEVID - ${source.dev_id}]`
              });
              citationNumber++;
            }
          });
        }
      }
    });

    setAllCitations(citations);
    setKgDevelopments(kgDevsMap);

    const newMap = new Map<string, number>();
    citations.forEach((citation) => {
      newMap.set(citation.id, citation.number);
    });
    setCitationMap(newMap);
  }, [currentMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Handle send
  const handleSend = async () => {
    const message = inputValue.trim();
    if (!message || isLoading || isTyping || sendInFlightRef.current) return;

    sendInFlightRef.current = true;
    setInputValue('');

    try {
      if (activeConversationId) {
        await sendMessage(message);
      } else {
        const conversationId = await createNewConversation(message);
        onConversationChange?.(conversationId);
      }
    } catch (error) {
      console.error('Send error:', error);
    } finally {
      sendInFlightRef.current = false;
    }
  };

  // Unified citation click — all sources open EliteCitationPanel
  const handleCitationClick = (citationId: string) => {
    setSelectedCitationId(citationId);
    setCitationPanelOpen(true);
  };

  // Handle close citation panel
  const handleCloseCitationPanel = () => {
    setCitationPanelOpen(false);
    setSelectedCitationId(null);
  };

  // Find visualizations for current message
  const getVisualizationsForMessage = (messageIndex: number) => {
    const message = currentMessages[messageIndex];
    if (message?.visualizations?.length) {
      return message.visualizations;
    }
    if (messageIndex === currentMessages.length - 1 && currentMessages[messageIndex].role === 'assistant') {
      return visualizations;
    }
    return [];
  };

  // Clean message content - remove [object Object] and convert to proper format
  const cleanMessageContent = (content: string): string => {
    if (!content || typeof content !== 'string') return '';

    let cleaned = normalizeAudelleChatText(parseMessageContent(content)).replace(/\[object Object\]/gi, '');
    cleaned = cleaned.replace(/,\s*,/g, ',').replace(/\s+,/g, ',').replace(/,\s+/g, ', ');
    cleaned = cleaned.replace(/^[,\s]+|[,\s]+$/g, '');

    return cleaned;
  };

  const getMessageCitationIds = (message: typeof currentMessages[number]): string[] => {
    const citationIds: string[] = [];
    const seen = new Set<string>();
    const add = (value: string) => {
      const id = String(value || '').trim();
      if (!id || seen.has(id)) return;
      seen.add(id);
      citationIds.push(id);
    };

    extractDevIds(parseMessageContent(message.content)).forEach(add);

    if (Array.isArray(message.context?.sourceDocuments)) {
      message.context.sourceDocuments.forEach((source) => {
        const developmentId = getDevelopmentCitationId(source);
        if (developmentId) {
          add(developmentId);
        } else if (isKgIntelligenceSource(source)) {
          add(getKgCitationId(source));
        }
      });
    }

    if (Array.isArray(message.context?.hnwiKnowledgeSources)) {
      message.context.hnwiKnowledgeSources.forEach((source: any) => {
        if (source && typeof source === 'object') {
          add(source.dev_id || source.id || source.development_id || '');
        }
      });
    }

    return citationIds;
  };

  const openFirstMessageSource = (message: typeof currentMessages[number]) => {
    const [firstCitationId] = getMessageCitationIds(message);
    if (firstCitationId) {
      handleCitationClick(firstCitationId);
    }
  };

  // Handle new conversation
  const handleNewChatInternal = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      clearCurrentConversation();
    }
    setInputValue('');
    onConversationChange?.(null);
    onSidebarToggle?.(false);
  };

  // Handle conversation select
  const handleSelectConversation = async (conversationId: string) => {
    await selectConversation(conversationId);
    onConversationChange?.(conversationId);
    onSidebarToggle?.(false);
  };

  // Handle delete conversation
  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      await deleteConversation(conversationId);
    }
  };

  // Handle share conversation
  const handleShareConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const conv = conversations.find(c => c.id === conversationId);

      // Use current messages if active, otherwise fetch from API
      let msgs = conversationId === activeConversationId ? currentMessages : [];
      if (msgs.length === 0) {
        const historyData = await getConversationHistory(conversationId);
        if (historyData?.messages) {
          msgs = historyData.messages;
        }
      }

      const messagesWithDates = msgs.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      }));

      const conversationData = {
        id: conversationId,
        title: conv?.title || "Conversation",
        userId: userContext?.userId || "anonymous",
        createdAt: conv?.createdAt || new Date(),
        updatedAt: conv?.updatedAt || new Date(),
        messageCount: msgs.length,
        isActive: true,
        messages: messagesWithDates
      };

      const data = await secureApi.post("/api/conversations/share", {
        conversationId,
        userId: userContext?.userId || "anonymous",
        conversationData
      }, true);

      if (!data.shareUrl) throw new Error("Invalid share response");

      await navigator.clipboard.writeText(data.shareUrl);
      setLinkCopied(conversationId);
      setTimeout(() => setLinkCopied(null), 2000);

      toast({
        title: "Link copied!",
        description: "The conversation link has been copied to your clipboard.",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "NotAllowedError") {
        toast({
          title: "Clipboard access denied",
          description: "Please allow clipboard access to copy the share link.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to share",
          description: "Could not create share link. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleMessageFeedback = async (messageId: string, isPositive: boolean) => {
    if (!messageId || submittingFeedbackId) return;
    try {
      setSubmittingFeedbackId(messageId);
      await submitMessageFeedback(messageId, isPositive);
    } catch {
      toast({
        title: "Feedback not saved",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingFeedbackId(null);
    }
  };

  return (
    <div className="flex h-full w-full bg-background relative">
      {/* Toggleable History Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onSidebarToggle?.(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
            />

            {/* Sidebar Panel - Positioned within page content */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-64 bg-surface border-r border-border z-40 flex flex-col shadow-2xl"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              {/* Sidebar Header with New Chat Button */}
              <div className="p-3 border-b border-border flex-shrink-0">
                <Button
                  onClick={handleNewChatInternal}
                  variant="default"
                  size="sm"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
              </div>

              {/* Conversations List - Separate Scroll */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">No conversations yet</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectConversation(conv.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleSelectConversation(conv.id);
                          }
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group relative ${
                          activeConversationId === conv.id
                            ? 'bg-gold/10 border border-gold/30'
                            : 'hover:bg-surface/50 border border-transparent'
                        }`}
                      >
                        {/* Active indicator */}
                        {activeConversationId === conv.id && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gold rounded-r" />
                        )}

                        <div className="flex items-start gap-2">
                          <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            activeConversationId === conv.id ? 'text-gold' : 'text-muted-foreground'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm line-clamp-2 mb-1 ${
                              activeConversationId === conv.id ? 'text-gold font-medium' : 'text-foreground'
                            }`}>
                              {conv.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {conv.messageCount} messages
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={(e) => handleShareConversation(conv.id, e)}
                              className="p-1 hover:bg-surface-hover rounded transition-all"
                              title="Share conversation"
                            >
                              {linkCopied === conv.id ? (
                                <Check className="w-3.5 h-3.5 text-green-500" />
                              ) : (
                                <Share2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                              )}
                            </button>
                            <button
                              onClick={(e) => handleDeleteConversation(conv.id, e)}
                              className="p-1 hover:bg-surface-hover rounded transition-all"
                              title="Delete conversation"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Button at Bottom */}
              <div className="p-3 border-t border-border/30 flex-shrink-0">
                <Button
                  onClick={() => onSidebarToggle?.(false)}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <Conversation className="flex-1">
          <ConversationContent className="mx-auto w-full max-w-4xl px-6 py-8">
            {/* Empty State */}
            {currentMessages.length === 0 && !isTyping && (
              <div className="text-center py-20">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gold/5 rounded-full flex items-center justify-center border border-gold/20">
                    <MessageCircle className="w-10 h-10 text-gold/40" />
                  </div>
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  Ask Audelle
                </h1>
                <p className="text-muted-foreground text-base max-w-xl mx-auto">
                  What should we think through?
                </p>
              </div>
            )}

            {/* Conversation */}
            <div className="space-y-6">
              {currentMessages.map((message, index) => {
                const messageViz = getVisualizationsForMessage(index).filter((command) => !isLegacyForcedVisualization(command));
                const messageCitationIds = message.role === 'assistant' ? getMessageCitationIds(message) : [];
                const thoughtTime = message.role === 'assistant'
                  ? thoughtTimeLabel(message.context?.responseTime)
                  : '';

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {message.role === 'user' ? (
                      <div className="mb-8 flex items-start justify-end gap-3">
                        <div className="flex max-w-[85%] flex-col items-end md:max-w-[70%]">
                          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <span>You</span>
                          </div>
                          <div className="rounded-3xl rounded-tr-md bg-muted/80 px-5 py-3 text-[15px] leading-relaxed text-foreground shadow-sm">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                        <div className="mt-5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border/40 bg-muted text-muted-foreground">
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="mb-9 flex items-start gap-3">
                        <div className="mt-5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-sm font-semibold text-foreground">Audelle</span>
                            <span className="text-xs text-muted-foreground">Private decision ally</span>
                          </div>
                          <div className="max-w-[760px] text-[15px] leading-relaxed text-foreground">
                            <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-code:text-gold prose-code:bg-gold/10 prose-code:px-1 prose-code:rounded">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => {
                                  const textContent = reactNodeToText(children);
                                  const cleanedText = cleanMessageContent(textContent);
                                  return (
                                    <p className="mb-4 text-[15px] leading-relaxed text-foreground last:mb-0">
                                      <CitationText
                                        text={cleanedText}
                                        onCitationClick={handleCitationClick}
                                        citationMap={citationMap}
                                        options={{
                                          convertMarkdownBold: true,
                                          preserveLineBreaks: true,
                                          trim: true
                                        }}
                                      />
                                    </p>
                                  );
                                },
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-foreground">{children}</strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic text-foreground/90">{children}</em>
                                ),
                                ul: ({ children }) => (
                                  <ul className="my-3 list-disc space-y-1.5 pl-5">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>
                                ),
                                li: ({ children }) => {
                                  const textContent = reactNodeToText(children);
                                  const cleanedText = cleanMessageContent(textContent);
                                  return (
                                    <li className="text-[15px] leading-relaxed text-foreground">
                                      <CitationText
                                        text={cleanedText}
                                        onCitationClick={handleCitationClick}
                                        citationMap={citationMap}
                                        options={{
                                          convertMarkdownBold: true,
                                          preserveLineBreaks: false,
                                          trim: true
                                        }}
                                      />
                                    </li>
                                  );
                                },
                                h1: ({ children }) => (
                                  <h1 className="mb-3 mt-6 text-2xl font-bold text-foreground">{children}</h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="mb-2.5 mt-5 text-xl font-bold text-foreground">{children}</h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="mb-2 mt-4 text-lg font-semibold text-foreground">{children}</h3>
                                ),
                                code: ({ children, className }) => {
                                  const isInline = !className;
                                  return isInline ? (
                                    <code className="rounded bg-gold/10 px-1.5 py-0.5 font-mono text-xs text-gold">
                                      {children}
                                    </code>
                                  ) : (
                                    <code className={className}>{children}</code>
                                  );
                                },
                                pre: ({ children }) => (
                                  <pre className="my-3 overflow-x-auto rounded-lg border border-border bg-surface p-4">
                                    {children}
                                  </pre>
                                ),
                                table: ({ children }) => (
                                  <div className="my-4 overflow-x-auto rounded-xl border border-border/40 bg-card/40">
                                    <table className="min-w-full border-collapse text-left text-sm">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                thead: ({ children }) => (
                                  <thead className="border-b border-border/40 bg-muted/40">{children}</thead>
                                ),
                                th: ({ children }) => (
                                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {children}
                                  </th>
                                ),
                                td: ({ children }) => (
                                  <td className="border-t border-border/30 px-3 py-2 align-top text-sm text-foreground/90">
                                    {children}
                                  </td>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="my-4 border-l-2 border-gold/50 pl-4 text-foreground/85">
                                    {children}
                                  </blockquote>
                                ),
                              }}
                            >
                              {cleanMessageContent(message.content)}
                            </ReactMarkdown>
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
                            {messageCitationIds.length > 0 && (
                              <button
                                type="button"
                                onClick={() => openFirstMessageSource(message)}
                                className="inline-flex items-center gap-1 hover:text-gold hover:underline"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                                {sourceLabel(messageCitationIds.length)}
                              </button>
                            )}
                            {thoughtTime && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {thoughtTime}
                              </span>
                            )}
                            {(message as any).feedbackSubmitted ? (
                              <span className="inline-flex items-center gap-1 text-muted-foreground/60">
                                {(message as any).feedbackSubmitted === 'positive' ? (
                                  <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                                )}
                                Feedback saved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMessageFeedback(message.messageId || message.id, true)}
                                  disabled={submittingFeedbackId === (message.messageId || message.id)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-emerald-500/10 hover:text-emerald-600 disabled:opacity-50"
                                  title="Helpful response"
                                >
                                  <ThumbsUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMessageFeedback(message.messageId || message.id, false)}
                                  disabled={submittingFeedbackId === (message.messageId || message.id)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
                                  title="Not helpful"
                                >
                                  <ThumbsDown className="h-3.5 w-3.5" />
                                </button>
                              </span>
                            )}
                          </div>

                        {messageViz.length > 0 && (
                          <div className="mt-4 max-w-[760px]">
                            <VisualizationEngine commands={messageViz} inline />
                          </div>
                        )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                    <div className="text-[10px] uppercase tracking-wider text-gold/80 font-mono">
                      Audelle
                    </div>
                  </div>
                  <PremiumLoader />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Predictive Prompts */}
            {predictivePrompts.length > 0 && !isTyping && currentMessages.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 pt-6 border-t border-border/10"
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-3 font-mono">
                  Suggested Queries
                </div>
                <div className="flex flex-wrap gap-2">
                  {predictivePrompts.slice(0, 3).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputValue(prompt);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 text-xs text-muted-foreground border border-border/20 rounded hover:bg-surface/50 hover:text-foreground hover:border-gold/30 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </ConversationContent>
          <ConversationScrollButton className="bottom-6 h-9 w-9" />
        </Conversation>

        {/* Input Area */}
        <div className="border-t border-border/30 bg-background">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card/70 px-3 py-2 shadow-sm">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Audelle..."
                className="flex-1 bg-transparent px-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={isTyping || !inputValue.trim()}
                variant="default"
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Citation Panel — handles both DEVID and KG sources */}
      <AnimatePresence>
        {citationPanelOpen && (
          <EliteCitationPanel
            citations={allCitations}
            selectedCitationId={selectedCitationId}
            onClose={handleCloseCitationPanel}
            onCitationSelect={handleCitationClick}
            citationMap={citationMap}
            preloadedSources={kgDevelopments}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
