// lib/shared-conversations-db.ts
// MongoDB operations for shared conversations

import type { SharedConversation, ConversationWithMessages } from "@/types/rohith"

// In-memory storage for demo purposes
// In production, this would connect to MongoDB
const sharedConversations = new Map<string, SharedConversation>()

export async function storeSharedConversation(data: {
  shareId: string
  conversationId: string
  userId: string
  conversationData: ConversationWithMessages
  sharedBy: string
}): Promise<void> {
  const sharedConversation: SharedConversation = {
    ...data,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    viewCount: 0
  }

  sharedConversations.set(data.shareId, sharedConversation)

  // In production, you would save to MongoDB:
  // await db.collection('shared_conversations').insertOne(sharedConversation)
}

export async function getSharedConversation(shareId: string): Promise<SharedConversation | null> {
  const conversation = sharedConversations.get(shareId)

  if (!conversation) {
    return null
  }

  // Check if expired
  if (new Date() > conversation.expiresAt) {
    sharedConversations.delete(shareId)
    return null
  }

  // Increment view count
  conversation.viewCount = (conversation.viewCount || 0) + 1
  sharedConversations.set(shareId, conversation)

  return conversation

  // In production:
  // const conversation = await db.collection('shared_conversations').findOne({ shareId })
  // if (conversation && new Date() <= conversation.expiresAt) {
  //   await db.collection('shared_conversations').updateOne(
  //     { shareId },
  //     { $inc: { viewCount: 1 } }
  //   )
  //   return conversation
  // }
  // return null
}

export async function deleteSharedConversation(shareId: string): Promise<boolean> {
  const deleted = sharedConversations.delete(shareId)
  return deleted

  // In production:
  // const result = await db.collection('shared_conversations').deleteOne({ shareId })
  // return result.deletedCount > 0
}

export async function getSharedConversationsByUser(userId: string): Promise<SharedConversation[]> {
  const userConversations: SharedConversation[] = []

  sharedConversations.forEach((conversation) => {
    if (conversation.userId === userId && new Date() <= conversation.expiresAt) {
      userConversations.push(conversation)
    }
  })

  return userConversations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  // In production:
  // return await db.collection('shared_conversations')
  //   .find({
  //     userId,
  //     expiresAt: { $gt: new Date() }
  //   })
  //   .sort({ createdAt: -1 })
  //   .toArray()
}

// MongoDB Schema (for reference when implementing actual MongoDB)
/*
const sharedConversationSchema = {
  shareId: { type: String, required: true, unique: true, index: true },
  conversationId: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  sharedBy: { type: String, required: true },
  conversationData: {
    id: String,
    title: String,
    messages: [{
      id: String,
      role: String,
      content: String,
      timestamp: Date,
      context: Object
    }],
    createdAt: Date,
    updatedAt: Date
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: true },
  viewCount: { type: Number, default: 0 }
}
*/