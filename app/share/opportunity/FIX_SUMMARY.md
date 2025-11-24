# Opportunity Share Production 500 Error - FIX SUMMARY

## 🔴 The Real Problem (From Vercel Logs)

```
Error: Event handlers cannot be passed to Client Component props.
{className: ..., onClick: function onClick, children: ...}
                ^^^^^^^^^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.
```

## Root Cause

The opportunity data from MongoDB contained **non-serializable values** (Date objects, functions, potentially React elements) that cannot be passed from Server Components to Client Components in Next.js.

## The Fix: Deep Data Sanitization

### 1. Added Deep Sanitization Function
**File**: `lib/mongodb-shared-opportunities.ts`

```typescript
// Recursively sanitizes data to remove:
// - Date objects (converts to ISO strings)
// - Functions
// - React elements (objects with $$typeof)
function deepSanitize(obj: any): any {
  if (obj instanceof Date) return obj.toISOString()
  if (typeof obj === 'function') return undefined
  if (obj?.$$typeof) return undefined  // React elements

  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item)).filter(item => item !== undefined)
  }

  if (typeof obj === 'object') {
    const sanitized: any = {}
    for (const key in obj) {
      const value = deepSanitize(obj[key])
      if (value !== undefined) {
        sanitized[key] = value
      }
    }
    return sanitized
  }

  return obj
}
```

### 2. Applied During Share Creation
**File**: `lib/mongodb-shared-opportunities.ts` - `storeSharedOpportunity()`

- Data is sanitized BEFORE storing in MongoDB
- Removes functions, Date objects, React elements recursively
- Converts Dates to ISO strings for JSON serialization

### 3. Additional Serialization in Page Component
**File**: `app/share/opportunity/[opportunityId]/page.tsx`

```typescript
// Double-check: JSON.parse(JSON.stringify) ensures complete serialization
const serializedOpportunity = JSON.parse(JSON.stringify(opportunity))
return <SharedOpportunityClient opportunity={serializedOpportunity} />
```

## Why This Happened

1. **MongoDB stores raw objects** with Date fields (`createdAt`, `expiresAt`)
2. **Opportunity data** may contain nested objects with functions or React elements
3. **Next.js Server Components** cannot pass non-serializable data to Client Components
4. **Production build** enforces strict serialization (dev mode is more lenient)

## What We Learned

### ❌ Wrong Approaches (Tried Earlier)
1. **HTTP fetch from server component** → Violates Next.js best practices
2. **MongoDB-direct without sanitization** → Non-serializable data error
3. **Ignoring Vercel logs** → Would never find root cause

### ✅ Correct Approach
1. **Check Vercel logs first** → Shows actual error, not generic 500
2. **Deep data sanitization** → Remove all non-serializable values
3. **MongoDB-direct with proper serialization** → Follows Next.js best practices

## Testing Checklist

### Local Testing
- [x] Share button generates UUID
- [x] Share URL loads in browser
- [x] No console errors
- [x] Metadata visible in page source

### Production Testing (Deploy Required)
- [ ] Share button generates UUID
- [ ] Share URL loads without 500 error
- [ ] Open Graph preview works (Twitter/LinkedIn/Discord)
- [ ] No "Event handlers cannot be passed" error in Vercel logs

## Key Files Changed

1. **lib/mongodb-shared-opportunities.ts**
   - Added `deepSanitize()` function
   - Applied to `sanitizeOpportunityData()`
   - Removes: functions, Date objects, React elements

2. **app/share/opportunity/[opportunityId]/page.tsx**
   - Added JSON serialization before passing to client component
   - `const serializedOpportunity = JSON.parse(JSON.stringify(opportunity))`

## Deployment Command

```bash
git add .
git commit -m "Fix: Remove non-serializable data from opportunity shares"
git push origin main
```

Vercel will auto-deploy.

## Verification After Deploy

1. **Check Vercel logs**:
   ```bash
   vercel logs --follow
   ```
   Should NO LONGER see:
   - `Error: Event handlers cannot be passed to Client Component props`

2. **Test share URL**:
   - Click share button in Privé Exchange
   - Copy UUID-based URL
   - Open in new tab → Should load successfully

3. **Test Open Graph**:
   - Twitter Card Validator: https://cards-dev.twitter.com/validator
   - Should show proper title, description, image

## Security Note

✅ **Still Secure**: Sanitization removes:
- Internal MongoDB fields (`_id`, `__v`)
- Admin notes and metadata
- User-specific data
- Functions and event handlers

✅ **Still Functional**: Keeps all:
- Public opportunity data
- Investment thesis
- Financial metrics
- Risk analysis
- Asset details

## Success Criteria

When this is working correctly:
- ✅ Share button generates UUID URLs
- ✅ Share URLs load in production (no 500 error)
- ✅ Vercel logs show no "Event handlers" error
- ✅ Open Graph previews work on social media
- ✅ Page renders under 2 seconds

## If Still Failing

1. Check Vercel logs for new error message
2. Verify `MONGODB_URI` is set in Vercel dashboard
3. Test API route directly: `curl https://app.hnwichronicles.com/api/opportunities/public/{uuid}`
4. Check MongoDB Atlas logs for connection issues

## References

- Vercel Error Log (Nov 24 18:39): Event handlers error
- Next.js Docs: [Passing Props from Server to Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#passing-props-from-server-to-client-components-serialization)
- MongoDB Node Driver: Date serialization
