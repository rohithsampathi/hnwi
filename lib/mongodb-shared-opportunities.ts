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

// Helper function to deep sanitize data recursively
function deepSanitize(obj: any): any {
  // Handle null/undefined
  if (obj === null || obj === undefined) {
    return obj
  }

  // Handle primitives (string, number, boolean)
  const primitiveType = typeof obj
  if (primitiveType === 'string' || primitiveType === 'number' || primitiveType === 'boolean') {
    return obj
  }

  // Remove functions (including methods)
  if (primitiveType === 'function') {
    return undefined
  }

  // Remove Symbols
  if (primitiveType === 'symbol') {
    return undefined
  }

  // Handle BigInt (convert to string)
  if (primitiveType === 'bigint') {
    return obj.toString()
  }

  // Convert Date objects to ISO strings
  if (obj instanceof Date) {
    return obj.toISOString()
  }

  // Remove React elements (check for $$typeof Symbol)
  if (obj && typeof obj === 'object' && obj.$$typeof) {
    return undefined
  }

  // Remove Map/Set (convert to plain objects/arrays)
  if (obj instanceof Map) {
    return undefined
  }
  if (obj instanceof Set) {
    return undefined
  }

  // Remove RegExp, Error, and other non-serializable built-ins
  if (obj instanceof RegExp || obj instanceof Error) {
    return undefined
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item)).filter(item => item !== undefined)
  }

  // Handle plain objects (must be last check)
  if (typeof obj === 'object' && obj.constructor === Object) {
    const sanitized: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = deepSanitize(obj[key])
        // Only include if value is not undefined and key is not a Symbol
        if (value !== undefined && typeof key !== 'symbol') {
          sanitized[key] = value
        }
      }
    }
    return sanitized
  }

  // If we get here, it's some other object type we don't recognize - remove it
  return undefined
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

  // Deep sanitize to remove functions, Date objects, React elements recursively
  // This prevents "Event handlers cannot be passed to Client Component" errors
  const deepSanitized = deepSanitize(sanitized)

  // Keep all public opportunity data (title, description, pricing, etc.)
  // These are meant to be shareable as part of the Privé Exchange offering

  return deepSanitized
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

  // CRITICAL: Sanitize opportunity data during retrieval
  // This handles shares created before the sanitization fix was deployed
  if (opportunity.opportunityData) {
    opportunity.opportunityData = sanitizeOpportunityData(opportunity.opportunityData as Opportunity)
  }

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

  // CRITICAL: Sanitize opportunity data during retrieval
  // This handles shares created before the sanitization fix was deployed
  if (opportunity.opportunityData) {
    opportunity.opportunityData = sanitizeOpportunityData(opportunity.opportunityData as Opportunity)
  }

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
