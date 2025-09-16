// lib/rohith-storage.ts
// Shared conversation storage for Rohith API endpoints

export interface StoredMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface StoredConversation {
  id: string
  userId: string
  title: string
  messages: StoredMessage[]
  createdAt: Date
  updatedAt: Date
}

// In-memory storage for now - replace with database in production
export const conversations = new Map<string, StoredConversation>()