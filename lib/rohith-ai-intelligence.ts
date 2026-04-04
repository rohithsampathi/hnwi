// lib/rohith-ai-intelligence.ts
// AI intelligence layer for JARVIS-style recommendations

import type { Conversation, Message, UserPortfolioContext } from '@/types/rohith';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'RECOMMENDED' | 'OPTIONAL';
export type ConversationPhase = 'INITIAL_CONTACT' | 'RESEARCH_MODE' | 'DECISION_MODE' | 'SYNTHESIS_MODE';
export type RecommendationAction =
  | 'START_CONVERSATION'
  | 'ASK_FOLLOW_UP'
  | 'EXPLORE_TOPIC'
  | 'REVIEW_HISTORY'
  | 'CREATE_MEMO';

export interface RohithRecommendation {
  priority: PriorityLevel;
  action: RecommendationAction;
  conversationId?: string;
  message: string; // "Sir, I've detected..."
  reason: string; // Why this recommendation
  icon: string;
  color: string;
  urgency: number; // 1-10
  suggestedQueries?: string[]; // Pre-written prompts user can click
}

/**
 * JARVIS-style AI intelligence for Ask Rohith
 * Analyzes conversation patterns and provides contextual recommendations
 */
export class RohithAI {
  constructor(
    private conversations: Conversation[],
    private currentMessages: Message[],
    private activeConversationId: string | null,
    private userContext?: UserPortfolioContext | null
  ) {}

  /**
   * Get contextual recommendation based on conversation state
   */
  getRecommendation(): RohithRecommendation {
    const phase = this.getConversationPhase();
    const depth = this.getConversationDepth();

    // CRITICAL: No conversation, but user has loaded portfolio
    if (!this.activeConversationId && this.userContext?.portfolio) {
      return {
        priority: 'HIGH',
        action: 'START_CONVERSATION',
        message: "Sir, your portfolio data is synchronized. I'm ready to analyze risk exposures, tax optimization opportunities, or market intelligence.",
        reason: 'Portfolio context loaded, maximize value',
        icon: '🎯',
        color: '#D4A843',
        urgency: 8,
        suggestedQueries: [
          'Analyze my portfolio risk exposure',
          'Show tax optimization opportunities',
          'Compare my holdings to HNWI peers'
        ]
      };
    }

    // HIGH: Deep conversation (7+ messages) - expand context
    if (depth >= 7 && depth < 12) {
      return {
        priority: 'RECOMMENDED',
        action: 'EXPLORE_TOPIC',
        message: 'Sir, this discussion is reaching decision depth. Would you like me to cross-reference with HNWI World intelligence or run a scenario analysis?',
        reason: 'Deep engagement detected, expand analysis',
        icon: '🔬',
        color: '#3B82F6',
        urgency: 7,
        suggestedQueries: [
          'Cross-reference with HNWI World developments',
          'Show precedent transactions from peers',
          'Run scenario analysis on this structure'
        ]
      };
    }

    // HIGH: Very deep conversation (12+ messages) - synthesize
    if (depth >= 12) {
      return {
        priority: 'HIGH',
        action: 'CREATE_MEMO',
        message: "Sir, we've covered significant ground. Shall I prepare a formal decision memo summarizing key insights and action items?",
        reason: 'Extended discussion complete, ready for synthesis',
        icon: '📋',
        color: '#D4A843',
        urgency: 8,
        suggestedQueries: [
          'Create decision memo with recommendations',
          'Summarize action items from this conversation',
          'Prepare implementation timeline'
        ]
      };
    }

    // RECOMMENDED: Multiple shallow conversations - consolidate
    if (this.conversations.length >= 3 && depth < 5) {
      const themes = this.detectConversationThemes();
      return {
        priority: 'RECOMMENDED',
        action: 'REVIEW_HISTORY',
        message: `Sir, I've detected ${themes.length} recurring themes across your conversations. Would you like me to synthesize cross-cutting insights?`,
        reason: 'Pattern detection across multiple conversations',
        icon: '📊',
        color: '#8B5CF6',
        urgency: 6,
        suggestedQueries: themes.map(t => `Deep dive into ${t} patterns`)
      };
    }

    // DEFAULT: Continue conversation
    return {
      priority: 'OPTIONAL',
      action: 'ASK_FOLLOW_UP',
      message: "Sir, I'm ready for your next query. Full portfolio context and market intelligence are active.",
      reason: 'Standard operational state',
      icon: '✅',
      color: '#22C55E',
      urgency: 2
    };
  }

  /**
   * Get current conversation phase based on message count
   */
  getConversationPhase(): ConversationPhase {
    const depth = this.getConversationDepth();
    if (depth < 3) return 'INITIAL_CONTACT';
    if (depth < 7) return 'RESEARCH_MODE';
    if (depth < 12) return 'DECISION_MODE';
    return 'SYNTHESIS_MODE';
  }

  /**
   * Get conversation depth (message count)
   */
  getConversationDepth(): number {
    return this.currentMessages.length;
  }

  /**
   * Detect themes across all conversations
   */
  detectConversationThemes(): string[] {
    // Analyze all conversations for recurring keywords
    const allMessages = this.conversations.flatMap(c => c.messages || []);
    const keywords = allMessages
      .filter(m => m.role === 'user')
      .map(m => this.extractKeywords(m.content))
      .flat();

    // Cluster keywords into themes (simple frequency analysis)
    const themes = this.clusterKeywords(keywords);
    return themes;
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    // Simple keyword extraction (can be enhanced with NLP)
    const stopwords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were'];
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4 && !stopwords.includes(word));
  }

  /**
   * Cluster keywords by frequency
   */
  private clusterKeywords(keywords: string[]): string[] {
    // Group by frequency, return top 3
    const freq = keywords.reduce((acc, k) => {
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([keyword]) => keyword);
  }

  /**
   * Get progressive typing message based on duration
   */
  getProgressiveTypingMessage(elapsedSeconds: number): string {
    if (elapsedSeconds < 2) return 'accessing HNWI knowledge base...';
    if (elapsedSeconds < 4) return 'analyzing 1,875 developments...';
    if (elapsedSeconds < 6) return 'cross-referencing precedents...';
    return 'preparing response...';
  }
}
