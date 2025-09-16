// lib/mongodb-shared-conversations.ts
// MongoDB operations for shared conversations

import { MongoClient, Db, Collection } from 'mongodb'
import type { SharedConversation, ConversationWithMessages } from "@/types/rohith"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not defined')
  }

  const client = new MongoClient(uri)
  await client.connect()

  const db = client.db('mis') // Using the 'mis' database from your connection string

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function storeSharedConversation(data: {
  shareId: string
  conversationId: string
  userId: string
  conversationData: ConversationWithMessages
  sharedBy: string
}): Promise<void> {
  const { db } = await connectToDatabase()
  const collection: Collection<SharedConversation> = db.collection('shared_conversations')

  const sharedConversation: SharedConversation = {
    ...data,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    viewCount: 0
  }

  await collection.insertOne(sharedConversation as any)
}

export async function getSharedConversation(shareId: string): Promise<SharedConversation | null> {
  const { db } = await connectToDatabase()
  const collection: Collection<SharedConversation> = db.collection('shared_conversations')

  const conversation = await collection.findOne({ shareId } as any)

  if (!conversation) {
    return null
  }

  // Check if expired
  if (new Date() > conversation.expiresAt) {
    await collection.deleteOne({ shareId } as any)
    return null
  }

  // Increment view count
  await collection.updateOne(
    { shareId } as any,
    { $inc: { viewCount: 1 } }
  )

  return conversation as SharedConversation
}

export async function deleteSharedConversation(shareId: string): Promise<boolean> {
  const { db } = await connectToDatabase()
  const collection: Collection<SharedConversation> = db.collection('shared_conversations')

  const result = await collection.deleteOne({ shareId } as any)
  return result.deletedCount > 0
}

export async function getSharedConversationsByUser(userId: string): Promise<SharedConversation[]> {
  const { db } = await connectToDatabase()
  const collection: Collection<SharedConversation> = db.collection('shared_conversations')

  const conversations = await collection
    .find({
      userId,
      expiresAt: { $gt: new Date() }
    } as any)
    .sort({ createdAt: -1 })
    .toArray()

  return conversations as SharedConversation[]
}

// Create indexes for better performance
export async function createIndexes() {
  const { db } = await connectToDatabase()
  const collection = db.collection('shared_conversations')

  // Create indexes
  await collection.createIndex({ shareId: 1 }, { unique: true })
  await collection.createIndex({ userId: 1 })
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  await collection.createIndex({ conversationId: 1 })
}