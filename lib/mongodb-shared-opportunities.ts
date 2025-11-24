// lib/mongodb-shared-opportunities.ts
// MongoDB operations for shared opportunities

import { MongoClient, Db, Collection } from 'mongodb'
import type { Opportunity } from "@/lib/api"

export interface SharedOpportunity {
  shareId: string
  opportunityId: string
  userId: string
  opportunityData: Opportunity
  sharedBy: string
  createdAt: Date
  expiresAt: Date
  viewCount: number
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }

  try {
    // Create MongoDB client with options optimized for Vercel serverless
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000,
    })

    console.log('[MongoDB] Connecting to database...')
    await client.connect()
    console.log('[MongoDB] Successfully connected')

    const db = client.db('mis') // Using the 'mis' database

    // Cache the connection for reuse in serverless environment
    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error('[MongoDB] Connection failed:', error)
    throw error
  }
}

// Helper function to sanitize opportunity data before sharing
function sanitizeOpportunityData(opportunity: Opportunity): Opportunity {
  // Create a clean copy without sensitive internal fields
  const sanitized = { ...opportunity }

  // Remove internal MongoDB fields
  delete (sanitized as any)._id
  delete (sanitized as any).__v

  // Remove any internal tracking or admin fields
  delete (sanitized as any).internal_notes
  delete (sanitized as any).admin_comments
  delete (sanitized as any).backend_metadata
  delete (sanitized as any).system_flags

  // Remove user-specific fields that shouldn't be shared
  delete (sanitized as any).user_bookmarked
  delete (sanitized as any).user_viewed
  delete (sanitized as any).user_shared

  // Keep all public opportunity data (title, description, pricing, etc.)
  // These are meant to be shareable as part of the Privé Exchange offering

  return sanitized
}

export async function storeSharedOpportunity(data: {
  shareId: string
  opportunityId: string
  userId: string
  opportunityData: Opportunity
  sharedBy: string
}): Promise<void> {
  const { db } = await connectToDatabase()
  const collection: Collection<SharedOpportunity> = db.collection('shared_opportunities')

  // Security: Sanitize opportunity data before storing
  // This removes internal fields and user-specific data
  const sanitizedOpportunityData = sanitizeOpportunityData(data.opportunityData)

  const sharedOpportunity: SharedOpportunity = {
    ...data,
    opportunityData: sanitizedOpportunityData,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    viewCount: 0
  }

  // Use upsert to prevent duplicate entries
  await collection.updateOne(
    { shareId: data.shareId } as any,
    { $set: sharedOpportunity as any },
    { upsert: true }
  )
}

export async function getSharedOpportunity(shareId: string): Promise<SharedOpportunity | null> {
  const { db } = await connectToDatabase()
  const collection: Collection<SharedOpportunity> = db.collection('shared_opportunities')

  const opportunity = await collection.findOne({ shareId } as any)

  if (!opportunity) {
    return null
  }

  // Check if expired
  if (new Date() > opportunity.expiresAt) {
    await collection.deleteOne({ shareId } as any)
    return null
  }

  // Increment view count
  await collection.updateOne(
    { shareId } as any,
    { $inc: { viewCount: 1 } }
  )

  return opportunity as SharedOpportunity
}

export async function getSharedOpportunityByOpportunityId(opportunityId: string): Promise<SharedOpportunity | null> {
  const { db } = await connectToDatabase()
  const collection: Collection<SharedOpportunity> = db.collection('shared_opportunities')

  const opportunity = await collection.findOne({
    opportunityId,
    expiresAt: { $gt: new Date() }
  } as any)

  if (!opportunity) {
    return null
  }

  // Increment view count
  await collection.updateOne(
    { shareId: opportunity.shareId } as any,
    { $inc: { viewCount: 1 } }
  )

  return opportunity as SharedOpportunity
}

export async function deleteSharedOpportunity(shareId: string): Promise<boolean> {
  const { db } = await connectToDatabase()
  const collection: Collection<SharedOpportunity> = db.collection('shared_opportunities')

  const result = await collection.deleteOne({ shareId } as any)
  return result.deletedCount > 0
}

export async function getSharedOpportunitiesByUser(userId: string): Promise<SharedOpportunity[]> {
  const { db } = await connectToDatabase()
  const collection: Collection<SharedOpportunity> = db.collection('shared_opportunities')

  const opportunities = await collection
    .find({
      userId,
      expiresAt: { $gt: new Date() }
    } as any)
    .sort({ createdAt: -1 })
    .toArray()

  return opportunities as SharedOpportunity[]
}

// Create indexes for better performance
export async function createIndexes() {
  const { db } = await connectToDatabase()
  const collection = db.collection('shared_opportunities')

  // Create indexes
  await collection.createIndex({ shareId: 1 }, { unique: true })
  await collection.createIndex({ opportunityId: 1 })
  await collection.createIndex({ userId: 1 })
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
}
