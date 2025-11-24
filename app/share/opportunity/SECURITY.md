# Opportunity Share - Security Documentation

## Overview
The opportunity share feature allows users to share investment opportunities via public URLs. This document outlines the security measures implemented to protect sensitive data and infrastructure.

## Security Measures

### 1. Backend URL Protection
**Problem**: Exposing backend API URLs in error messages or logs could reveal infrastructure details.

**Solution**:
- All error messages return generic text like "Service temporarily unavailable"
- Backend URLs are never logged to client-accessible logs
- API routes only use server-side environment variables
- No `console.log` statements expose infrastructure details

### 2. Data Sanitization
**Problem**: Opportunity data may contain internal fields or user-specific information.

**Solution**:
- `sanitizeOpportunityData()` removes sensitive fields before storage:
  - MongoDB internal fields (`_id`, `__v`)
  - Admin/internal notes
  - User-specific bookmarks/views
  - Backend metadata
- Only public-facing opportunity data is shared

### 3. MongoDB-First Architecture
**Problem**: Production environment may not have backend API access.

**Solution**:
- Primary data source: MongoDB cache (no backend dependency)
- Fallback: Backend API (if configured)
- Auto-caching: Backend responses cached in MongoDB
- Works completely offline from backend once cached

### 4. Open Graph Preview Protection
**Problem**: Metadata generation errors could crash pages or expose errors.

**Solution**:
- Metadata generation has 5-second timeout
- Always returns valid metadata (uses defaults if needed)
- Never throws errors that could block page rendering
- Social crawlers always get proper meta tags

### 5. Error Handling
**Problem**: Detailed error messages could leak infrastructure information.

**Solution**:
```typescript
// ❌ BAD: Exposes backend details
error: `Backend at ${backendUrl} returned 500`

// ✅ GOOD: Generic error
error: 'Service temporarily unavailable'
```

All errors return generic messages to clients while logging details server-side only.

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
POST /api/opportunities/share
    ↓
Sanitize opportunity data
    ↓
Store in MongoDB with random UUID
    ↓
Return shareable URL
```

### Share Access
```
User/Crawler visits /share/opportunity/{id}
    ↓
Check MongoDB cache (fast)
    ↓ (if not found)
Try backend API with timeout
    ↓ (if successful)
Cache in MongoDB for next time
    ↓
Generate Open Graph metadata
    ↓
Render page with opportunity data
```

## Environment Variables

### Required
- `MONGODB_URI` - MongoDB connection string (required for all operations)

### Optional (for backend fallback)
- `API_BASE_URL` - Backend API URL (optional, enables backend fallback)
- `API_SECRET_KEY` - Backend API key (optional, for authentication)

### Optional (for URL generation)
- `NEXT_PUBLIC_PRODUCTION_URL` - Production URL (used for meta tags)

## Security Checklist

- [x] Backend URLs never exposed to client
- [x] Error messages are generic
- [x] Data sanitization removes sensitive fields
- [x] Metadata generation never crashes
- [x] MongoDB-first architecture (no backend dependency)
- [x] Server-side environment variables only
- [x] Timeout protection on all external calls
- [x] Graceful error handling throughout
- [ ] Rate limiting (recommended for production)
- [ ] Access control per opportunity (if needed)
- [ ] Audit logging of shares (optional)

## Testing Checklist

### Local Environment
- [x] Page loads with MongoDB data
- [x] Page loads with backend data
- [x] Page shows 404 when opportunity not found
- [x] Metadata generation works
- [x] No backend URLs in browser console

### Production Environment
- [ ] Page loads from MongoDB cache
- [ ] Open Graph preview works (test with Twitter/LinkedIn)
- [ ] 404 page shows gracefully
- [ ] No 500 errors when backend offline
- [ ] Error messages don't expose infrastructure

## Recommendations

1. **Add Rate Limiting**: Implement rate limiting to prevent abuse
2. **Monitor MongoDB**: Track cache hit rates and storage usage
3. **Regular Security Audits**: Review logs for any leaked information
4. **Content Security Policy**: Add CSP headers to prevent XSS
5. **Access Control**: Consider adding permission checks if opportunities should be private

## Contact

For security concerns or to report vulnerabilities, contact: security@hnwichronicles.com
