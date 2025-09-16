// lib/mongodb-rohith.ts
// MongoDB connection and models for Rohith conversations

import { MongoClient, Db, Collection } from "mongodb"

const uri = process.env.MONGODB_URI!
const dbName = "hnwi_chronicles"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

// MongoDB connection
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(uri)
  await client.connect()

  const db = client.db(dbName)

  cachedClient = client
  cachedDb = db

  return { client, db }
}

// Conversation schema
export interface MongoMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  feedbackSubmitted?: "positive" | "negative"
}

export interface MongoConversation {
  _id?: string
  conversationId: string
  userId: string
  title: string
  messages: MongoMessage[]
  createdAt: Date
  updatedAt: Date
  isShared?: boolean
  shareId?: string
}

// Get conversations collection
export async function getConversationsCollection(): Promise<Collection<MongoConversation>> {
  const { db } = await connectToDatabase()
  return db.collection<MongoConversation>("rohith_conversations")
}

// Create indexes for better performance
export async function createIndexes() {
  const collection = await getConversationsCollection()

  // Create indexes
  await collection.createIndex({ conversationId: 1 }, { unique: true })
  await collection.createIndex({ userId: 1 })
  await collection.createIndex({ createdAt: -1 })
  await collection.createIndex({ updatedAt: -1 })
  await collection.createIndex({ shareId: 1 }, { sparse: true })
}

// Conversation operations
export async function createConversation(conversation: MongoConversation): Promise<MongoConversation> {
  const collection = await getConversationsCollection()
  const result = await collection.insertOne(conversation)
  return { ...conversation, _id: result.insertedId.toString() }
}

export async function getConversationById(conversationId: string): Promise<MongoConversation | null> {
  const collection = await getConversationsCollection()
  return await collection.findOne({ conversationId })
}

export async function getUserConversations(userId: string): Promise<MongoConversation[]> {
  const collection = await getConversationsCollection()
  return await collection
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray()
}

export async function updateConversation(
  conversationId: string,
  updates: Partial<MongoConversation>
): Promise<boolean> {
  const collection = await getConversationsCollection()
  const result = await collection.updateOne(
    { conversationId },
    {
      $set: {
        ...updates,
        updatedAt: new Date()
      }
    }
  )
  return result.modifiedCount > 0
}

export async function addMessageToConversation(
  conversationId: string,
  message: MongoMessage
): Promise<boolean> {
  const collection = await getConversationsCollection()
  const result = await collection.updateOne(
    { conversationId },
    {
      $push: { messages: message },
      $set: { updatedAt: new Date() }
    }
  )
  return result.modifiedCount > 0
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  const collection = await getConversationsCollection()
  const result = await collection.deleteOne({ conversationId })
  return result.deletedCount > 0
}

export async function getSharedConversation(shareId: string): Promise<MongoConversation | null> {
  const collection = await getConversationsCollection()
  return await collection.findOne({ shareId, isShared: true })
}

export async function updateMessageFeedback(
  conversationId: string,
  messageId: string,
  feedback: "positive" | "negative"
): Promise<boolean> {
  const collection = await getConversationsCollection()
  const result = await collection.updateOne(
    {
      conversationId,
      "messages.id": messageId
    },
    {
      $set: {
        "messages.$.feedbackSubmitted": feedback,
        updatedAt: new Date()
      }
    }
  )
  return result.modifiedCount > 0
}

// Initialize indexes on first import
createIndexes().catch(() => {})