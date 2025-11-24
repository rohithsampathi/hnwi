# Opportunity Share - Security Documentation

## Overview
The opportunity share feature allows users to share investment opportunities via public URLs. This document outlines the security measures implemented to protect sensitive data and infrastructure.

## Security Measures

### 1. UUID-Only ShareId System
**Problem**: Using predictable opportunityIds (MongoDB ObjectIds) allows enumeration attacks.

**Solution**:
- Only UUID format shareIds accepted (8-4-4-4-12 hexadecimal with dashes)
- ShareIds generated via crypto.randomUUID() when sharing
- MongoDB ObjectIds rejected at API level
- Prevents URL guessing and enumeration

### 2. Data Sanitization
**Problem**: Opportunity data may contain internal fields or user-specific information.

**Solution**:
- `sanitizeOpportunityData()` removes sensitive fields before storage:
  - MongoDB internal fields (`_id`, `__v`)
  - Admin/internal notes
  - User-specific bookmarks/views
  - Backend metadata
- Only public-facing opportunity data is shared

### 3. MongoDB-Only Architecture
**Problem**: Production environment needs fast, reliable data access.

**Solution**:
- Single data source: MongoDB (shared_opportunities collection)
- No backend dependencies
- 90-day automatic expiration via TTL index
- Fast retrieval with indexed shareId lookups

### 4. Open Graph Preview Protection
**Problem**: Metadata generation errors could crash pages or expose errors.

**Solution**:
- Metadata generation follows Rohith pattern (proven working)
- Always returns valid metadata (uses defaults if needed)
- Console logs for debugging (production only shows server-side)
- Social crawlers always get proper meta tags

### 5. Error Handling
**Problem**: Invalid shareIds or expired links could expose system behavior.

**Solution**:
```typescript
// UUID validation before database lookup
const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shareId)

if (!isValidUUID) {
  return { error: 'Invalid share ID format', status: 400 }
}
```

All errors return appropriate HTTP status codes with generic messages.

### 6. Rate Limiting (Recommended)
**Status**: Not yet implemented

**Recommendation**: Add rate limiting to prevent:
- Enumeration attacks
- Excessive MongoDB queries
- API abuse

**Example Implementation**:
```typescript
// Using Vercel Rate Limiting or similar
import { ratelimit } from '@/lib/rate-limit'

// In API route
const { success } = await ratelimit.limit(request.ip)
if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
}
```

## Data Flow

### Share Creation
```
User clicks "Share" in UI
    ↓
POST /api/opportunities/share (CSRF protected)
    ↓
Validate authentication (access_token cookie)
    ↓
Generate random UUID via crypto.randomUUID()
    ↓
Sanitize opportunity data (remove sensitive fields)
    ↓
Store in MongoDB shared_opportunities collection
    ↓
Return shareable URL: /share/opportunity/{uuid}
```

### Share Access
```
User/Crawler visits /share/opportunity/{uuid}
    ↓
GET /api/opportunities/public/{uuid}
    ↓
Validate UUID format (reject if invalid)
    ↓
Query MongoDB shared_opportunities by shareId
    ↓
Check if expired (expiresAt > now)
    ↓
Increment viewCount
    ↓
Return opportunity data
    ↓
Page generates Open Graph metadata
    ↓
Render opportunity with OpportunityExpandedContent
```

## Environment Variables

### Required
- `MONGODB_URI` - MongoDB connection string (required for all operations)

### Optional
- `NEXT_PUBLIC_PRODUCTION_URL` - Production URL (used for meta tags and share URLs)

## Security Checklist

- [x] UUID-only shareIds (prevents enumeration)
- [x] Data sanitization removes sensitive fields
- [x] Metadata generation follows proven pattern
- [x] MongoDB-only architecture (simple, fast)
- [x] Server-side environment variables only
- [x] UUID format validation before lookup
- [x] 90-day automatic expiration
- [x] View count tracking
- [x] CSRF protection on share creation
- [x] Authentication required to create shares
- [ ] Rate limiting (recommended for production)
- [ ] Access control per opportunity (if needed)
- [ ] Audit logging of shares (optional)

## Testing Checklist

### Local Environment
- [ ] Share creation generates valid UUID
- [ ] Share retrieval works with valid UUID
- [ ] Invalid UUID format returns 400 error
- [ ] MongoDB ObjectId rejected
- [ ] Page shows 404 when shareId not found
- [ ] Metadata generation works
- [ ] Console logs visible for debugging

### Production Environment
- [ ] Share creation requires authentication
- [ ] CSRF protection works
- [ ] Page loads from MongoDB
- [ ] Open Graph preview works (test with Twitter/LinkedIn/Discord)
- [ ] 404 page shows gracefully for invalid/expired shares
- [ ] UUID validation prevents enumeration
- [ ] Expired shares automatically deleted

## Recommendations

1. **Add Rate Limiting**: Implement rate limiting to prevent abuse
2. **Monitor MongoDB**: Track cache hit rates and storage usage
3. **Regular Security Audits**: Review logs for any leaked information
4. **Content Security Policy**: Add CSP headers to prevent XSS
5. **Access Control**: Consider adding permission checks if opportunities should be private

## Contact

For security concerns or to report vulnerabilities, contact: security@hnwichronicles.com
