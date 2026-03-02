// lib/rohith-conversation-map.ts
// Conversation categorization and mapping

import type { Conversation } from '@/types/rohith';

export const CONVERSATION_CATEGORIES = [
  {
    id: 'active',
    title: 'Active',
    icon: 'MessageSquare',
    description: 'Ongoing conversations',
    color: '#D4A843' // Gold
  },
  {
    id: 'research',
    title: 'Research',
    icon: 'FileSearch',
    description: 'Information gathering',
    color: '#3B82F6' // Blue
  },
  {
    id: 'decisions',
    title: 'Decisions',
    icon: 'GitBranch',
    description: 'Action-oriented discussions',
    color: '#F59E0B' // Orange
  },
  {
    id: 'archive',
    title: 'Archive',
    icon: 'Archive',
    description: 'Completed conversations',
    color: '#6B7280' // Gray
  }
] as const;

export type CategoryId = 'active' | 'research' | 'decisions' | 'archive';

/**
 * Auto-categorize conversation based on message patterns
 */
export function categorizeConversation(conversation: Conversation): CategoryId {
  // If no messages, default to active
  if (!conversation.messages || conversation.messages.length === 0) {
    return 'active';
  }

  // If last activity > 7 days ago, archive
  const lastActivity = new Date(conversation.updatedAt);
  const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceActivity > 7) {
    return 'archive';
  }

  // Analyze message content for keywords
  const userMessages = conversation.messages
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase());

  const allText = userMessages.join(' ');

  // Decision keywords
  const decisionKeywords = ['should i', 'recommend', 'decision', 'choose', 'which', 'better'];
  if (decisionKeywords.some(kw => allText.includes(kw))) {
    return 'decisions';
  }

  // Research keywords
  const researchKeywords = ['what is', 'explain', 'how does', 'tell me about', 'analyze'];
  if (researchKeywords.some(kw => allText.includes(kw))) {
    return 'research';
  }

  // Default to active
  return 'active';
}

/**
 * Get conversations by category
 */
export function getConversationsByCategory(
  category: CategoryId,
  conversations: Conversation[]
): Conversation[] {
  return conversations
    .filter(conv => categorizeConversation(conv) === category)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Get category for a specific conversation
 */
export function getCategoryById(categoryId: CategoryId) {
  return CONVERSATION_CATEGORIES.find(c => c.id === categoryId);
}
