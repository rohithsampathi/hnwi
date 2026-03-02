// components/ask-rohith-jarvis/PremiumRohithInterface.tsx
// Premium JARVIS-style intelligence interface with unified citation system

'use client';

import { useRef, useEffect, useState } from 'react';
import { useRohith } from '@/contexts/rohith-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, MessageSquare, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import PremiumLoader from './PremiumLoader';
import AssetGridViz from './visualizations/AssetGridViz';
import ConcentrationDonutViz from './visualizations/ConcentrationDonutViz';
import WorldMapViz from './visualizations/WorldMapViz';
import IntelligenceCard from './IntelligenceCard';
import { CitationText } from '@/components/elite/citation-text';
import { EliteCitationPanel } from '@/components/elite/elite-citation-panel';
import { extractDevIds } from '@/lib/parse-dev-citations';
import type { Citation } from '@/lib/parse-dev-citations';

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
  showNewChatDialog?: boolean;
  onCloseNewChatDialog?: () => void;
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
    visualizations,
    predictivePrompts
  } = useRohith();

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  // Unified citation panel state — handles both DEVID and KG sources
  const [citationPanelOpen, setCitationPanelOpen] = useState(false);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [allCitations, setAllCitations] = useState<Citation[]>([]);
  const [citationMap, setCitationMap] = useState<Map<string, number>>(new Map());

  // KG sources metadata (for IntelligenceCard matching) + Development-format map for EliteCitationPanel
  const [kgSources, setKgSources] = useState<Map<string, {
    label: string;
    category: string;
    jurisdiction: string;
    intelligence?: string;
    source?: string;
  }>>(new Map());
  const [kgDevelopments, setKgDevelopments] = useState<Map<string, PreloadedDevelopment>>(new Map());

  // Build citation list + KG Development objects from all messages
  useEffect(() => {
    const citations: Citation[] = [];
    const seenDevIds = new Set<string>();
    const kgSourcesMap = new Map<string, { label: string; category: string; jurisdiction: string; intelligence?: string; source?: string }>();
    const kgDevsMap = new Map<string, PreloadedDevelopment>();
    let citationNumber = 1;

    currentMessages.forEach((message) => {
      if (message.role === 'assistant') {
        // Extract DEVIDs from message content
        const devIds = extractDevIds(message.content);

        devIds.forEach((devId) => {
          if (!seenDevIds.has(devId)) {
            seenDevIds.add(devId);
            citations.push({
              id: devId,
              number: citationNumber,
              originalText: `[DEVID ${devId}]`
            });
            citationNumber++;
          }
        });

        // Priority 1: Use new sourceDocuments field (Feb 2026+)
        if (message.context?.sourceDocuments && Array.isArray(message.context.sourceDocuments)) {
          message.context.sourceDocuments.forEach((source) => {
            if (source.type === 'development' && source.dev_id && !seenDevIds.has(source.dev_id)) {
              seenDevIds.add(source.dev_id);
              citations.push({
                id: source.dev_id,
                number: citationNumber,
                originalText: `[DEVID ${source.dev_id}]`
              });
              citationNumber++;
            } else if (source.type === 'kg_intelligence') {
              const kgId = `kg_${citationNumber}`;
              citations.push({
                id: kgId,
                number: citationNumber,
                originalText: source.label
              });
              // Store KG source metadata for IntelligenceCard matching
              kgSourcesMap.set(kgId, {
                label: source.label,
                category: source.category,
                jurisdiction: source.jurisdiction,
                intelligence: source.intelligence,
                source: source.source
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
                originalText: `[DEVID ${source.dev_id}]`
              });
              citationNumber++;
            }
          });
        }
      }
    });

    setAllCitations(citations);
    setKgSources(kgSourcesMap);
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
    if (messageIndex === currentMessages.length - 1 && currentMessages[messageIndex].role === 'assistant') {
      return visualizations;
    }
    return [];
  };

  // Clean message content - remove [object Object] and convert to proper format
  const cleanMessageContent = (content: string): string => {
    if (!content || typeof content !== 'string') return '';

    let cleaned = content.replace(/\[object Object\]/gi, '');
    cleaned = cleaned.replace(/,\s*,/g, ',').replace(/\s+,/g, ',').replace(/,\s+/g, ', ');
    cleaned = cleaned.replace(/^[,\s]+|[,\s]+$/g, '');

    return cleaned;
  };

  // Handle new conversation
  const handleNewChatInternal = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      clearCurrentConversation();
    }
    setInputValue('');
    onSidebarToggle?.(false);
  };

  // Handle conversation select
  const handleSelectConversation = async (conversationId: string) => {
    await selectConversation(conversationId);
    onSidebarToggle?.(false);
  };

  // Handle delete conversation
  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      await deleteConversation(conversationId);
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
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
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
                          <button
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface-hover rounded transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                          </button>
                        </div>
                      </button>
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
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Empty State */}
            {currentMessages.length === 0 && !isTyping && (
              <div className="text-center py-20">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gold/5 rounded-full flex items-center justify-center border border-gold/20">
                    <MessageSquare className="w-10 h-10 text-gold/40" />
                  </div>
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  Intelligence System Ready
                </h1>
                <p className="text-muted-foreground text-base max-w-xl mx-auto">
                  Access to HNWI World intelligence, Crown Vault assets, and market analysis.
                  <br />
                  Ask strategic questions.
                </p>
              </div>
            )}

            {/* Conversation */}
            <div className="space-y-6">
              {currentMessages.map((message, index) => {
                const messageViz = getVisualizationsForMessage(index);

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {message.role === 'user' ? (
                      // User Message - Minimal
                      <div className="mb-6">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2 font-mono">
                          Query
                        </div>
                        <p className="text-base text-foreground/80 leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    ) : (
                      // Assistant Message - Structured with CitationText
                      <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/20">
                          <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                          <div className="text-[10px] uppercase tracking-wider text-gold/80 font-mono">
                            Rohith
                          </div>
                          {message.context?.responseTime && (
                            <div className="ml-auto text-[10px] text-muted-foreground/40 font-mono">
                              {(message.context.responseTime / 1000).toFixed(2)}s
                            </div>
                          )}
                        </div>
                        <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-code:text-gold prose-code:bg-gold/10 prose-code:px-1 prose-code:rounded">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => {
                                const textContent = String(children);
                                const cleanedText = cleanMessageContent(textContent);
                                return (
                                  <p className="text-foreground leading-relaxed text-[15px] mb-3">
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
                                <ul className="list-disc list-inside space-y-1.5 my-3">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside space-y-1.5 my-3">{children}</ol>
                              ),
                              li: ({ children }) => {
                                const textContent = String(children);
                                const cleanedText = cleanMessageContent(textContent);
                                return (
                                  <li className="text-foreground text-[15px] leading-relaxed">
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
                                <h1 className="text-2xl font-bold text-foreground mt-6 mb-3">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-xl font-bold text-foreground mt-5 mb-2.5">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">{children}</h3>
                              ),
                              code: ({ children, className }) => {
                                const isInline = !className;
                                return isInline ? (
                                  <code className="text-xs font-mono text-gold bg-gold/10 px-1.5 py-0.5 rounded">
                                    {children}
                                  </code>
                                ) : (
                                  <code className={className}>{children}</code>
                                );
                              },
                              pre: ({ children }) => (
                                <pre className="bg-surface border border-border rounded-lg p-4 overflow-x-auto my-3">
                                  {children}
                                </pre>
                              ),
                            }}
                          >
                            {cleanMessageContent(message.content)}
                          </ReactMarkdown>
                        </div>

                        {/* Inline Intelligence Cards - Rich Visual Display */}
                        {(() => {
                          const hasIntelligence = message.context?.sourceDocuments && message.context.sourceDocuments.some(s => s.type === 'kg_intelligence' && s.intelligence);
                          return hasIntelligence;
                        })() && (
                          <div className="mt-6">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-3 font-mono">
                              Intelligence Analysis
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {message.context.sourceDocuments
                                .filter(s => s.type === 'kg_intelligence' && s.intelligence)
                                .slice(0, 6)
                                .map((source, idx) => {
                                  // Find the actual kgId from kgSources by matching properties
                                  let kgId = `kg_${idx + 1}`;
                                  for (const [id, data] of kgSources.entries()) {
                                    if (
                                      data.label === source.label &&
                                      data.category === source.category &&
                                      data.jurisdiction === source.jurisdiction
                                    ) {
                                      kgId = id;
                                      break;
                                    }
                                  }
                                  return (
                                    <IntelligenceCard
                                      key={`intel-${idx}`}
                                      category={source.category}
                                      jurisdiction={source.jurisdiction}
                                      label={source.label}
                                      intelligence={source.intelligence}
                                      source={source.source}
                                      onClick={() => handleCitationClick(kgId)}
                                    />
                                  );
                                })}
                            </div>
                          </div>
                        )}

                        {/* Citations - Development & KG Intelligence Sources */}
                        {((message.context?.sourceDocuments && message.context.sourceDocuments.length > 0) ||
                          (message.context?.hnwiKnowledgeSources && message.context.hnwiKnowledgeSources.length > 0)) && (
                          <div className="mt-4 pt-3 border-t border-border/10">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-2 font-mono">
                              Sources
                            </div>
                            <div className="space-y-1.5">
                              {/* New sourceDocuments format (Feb 2026+) */}
                              {message.context?.sourceDocuments && message.context.sourceDocuments.map((source, idx) => {
                                let citationId: string;
                                let citationNum: number;

                                if (source.type === 'development') {
                                  citationId = source.dev_id;
                                  citationNum = citationMap.get(source.dev_id) || idx + 1;
                                } else {
                                  citationId = `kg_${idx + 1}`;
                                  citationNum = citationMap.get(citationId) || idx + 1;
                                }

                                return (
                                  <button
                                    key={`source-${idx}`}
                                    onClick={() => handleCitationClick(citationId)}
                                    className="block w-full text-left text-xs text-muted-foreground hover:text-gold transition-colors group"
                                    title="Click to view source details"
                                  >
                                    <span className="font-mono text-gold mr-2">[{citationNum}]</span>
                                    <span className="group-hover:underline">
                                      {source.type === 'development'
                                        ? `${source.jurisdiction} • ${source.title}`
                                        : source.label}
                                    </span>
                                  </button>
                                );
                              })}

                              {/* Legacy hnwiKnowledgeSources format (fallback) */}
                              {!message.context?.sourceDocuments && message.context?.hnwiKnowledgeSources?.map((source: any, idx: number) => {
                                if (typeof source === 'string') {
                                  return (
                                    <div key={idx} className="text-xs text-muted-foreground">
                                      <span className="font-mono text-gold mr-2">[{idx + 1}]</span>
                                      {source}
                                    </div>
                                  );
                                } else if (source && typeof source === 'object') {
                                  const devId = source.dev_id || source.id;
                                  const title = source.title || source.headline || 'Development';
                                  const jurisdiction = source.jurisdiction || 'Global';
                                  const citationNum = citationMap.get(devId) || idx + 1;

                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => devId && handleCitationClick(devId)}
                                      className="block w-full text-left text-xs text-muted-foreground hover:text-gold transition-colors group"
                                      title="Click to view full citation"
                                    >
                                      <span className="font-mono text-gold mr-2">[{citationNum}]</span>
                                      <span className="group-hover:underline">
                                        {jurisdiction} • {title}
                                      </span>
                                    </button>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Inline Visualizations */}
                        {messageViz.length > 0 && (
                          <div className="mt-6 space-y-4">
                            {messageViz.map((viz) => {
                              let vizComponent = null;
                              if (viz.type === 'asset_grid') {
                                vizComponent = <AssetGridViz data={viz.data} interactive={true} />;
                              } else if (viz.type === 'concentration_donut' || viz.type === 'concentration_chart') {
                                vizComponent = <ConcentrationDonutViz data={viz.data} interactive={true} />;
                              } else if (viz.type === 'world_map' || viz.type === 'geographic_intelligence' || viz.type === 'map') {
                                vizComponent = <WorldMapViz data={viz.data} interactive={true} />;
                              }

                              return vizComponent ? (
                                <div key={viz.id}>
                                  {vizComponent}
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}
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
                      Rohith
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
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border/30 bg-background">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter strategic query..."
                className="flex-1 bg-transparent border-b border-border/30 px-2 py-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold/40 transition-colors text-sm"
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
