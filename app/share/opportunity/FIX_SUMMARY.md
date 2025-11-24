# Opportunity Share Production 500 Error - DIAGNOSTIC STATUS

## 🔴 The Persistent Error (7 Failed Deployments)

```
Error: Event handlers cannot be passed to Client Component props.
{className: ..., onClick: function onClick, children: ...}
                ^^^^^^^^^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.
```

**Status**: ERROR PERSISTS after 7 deployments with different approaches.
- ✅ Works perfectly in local development (localhost:3000)
- ❌ Fails in production with 500 error
- ❌ Open Graph previews not showing

## Root Cause (Hypothesis)

The opportunity data contains **non-serializable values** (functions, React elements, event handlers) that survive multiple sanitization attempts. The contamination is occurring somewhere in the share flow, but the exact location is unknown.

## Attempted Fixes (All Failed in Production)

### Deployment 1-2: Basic Deep Sanitization
**File**: `lib/mongodb-shared-opportunities.ts`
- Added `deepSanitize()` function to remove Date, functions, React elements
- Applied during MongoDB storage
- ❌ **Result**: Error persisted

### Deployment 3-4: Nuclear String Pass
**File**: `app/share/opportunity/[opportunityId]/page.tsx`
- Changed async function to return `Promise<string | null>` instead of object
- Server passes pre-stringified JSON to client
- Client component parses string to object
- ❌ **Result**: Error persisted

### Deployment 5: Enhanced Deep Sanitization
**File**: `lib/mongodb-shared-opportunities.ts` (lines 59-141)
- Enhanced `deepSanitize()` to handle ALL non-serializable types:
  - Functions, Symbols, BigInt, Date→ISO
  - React elements ($$typeof check)
  - Map, Set, RegExp, Error, Buffer, Promise
  - MongoDB objects (fixed constructor check)
- ❌ **Result**: Error persisted

### Deployment 6: Stringify in Async Function
**File**: `app/share/opportunity/[opportunityId]/page.tsx` (lines 43-64)
- Triple stringify/parse in async function to prevent object in component scope
- ❌ **Result**: Error persisted

### Deployment 7: Primitive Extraction in Metadata
**File**: `app/share/opportunity/[opportunityId]/page.tsx` (lines 125-134)
- Extract only primitive values (title, description, etc.) in `generateMetadata()`
- Prevents Next.js from serializing full object in function closure
- ❌ **Result**: Error persisted

### Current Diagnostic Approach: Client-Side Logging
**File**: `components/opportunity-atlas-new.tsx` (lines 1286-1290)

Added console logging to identify WHERE contamination occurs:

```typescript
// CRITICAL: Clean the opportunity data before sending to API
// JSON.parse(JSON.stringify()) removes functions, undefined, and non-serializable values
console.log('[Share] Before sanitization, checking for functions:', typeof opportunity);
const cleanOpportunity = JSON.parse(JSON.stringify(opportunity));
console.log('[Share] After sanitization, data length:', JSON.stringify(cleanOpportunity).length);
```

**Purpose**: Verify if client-side `JSON.parse(JSON.stringify())` is actually removing functions, or if they're surviving somehow.

**Next Step**: Deploy and check:
1. Browser console for `[Share] Before/After sanitization` logs
2. Vercel logs for `[Opportunity Share] Starting stringification...` logs
3. If sanitization works → contamination is elsewhere
4. If sanitization fails → JSON.stringify is failing silently (circular reference?)

## The Fundamental Flow (User's Simplification)

> "The mechanism is when user clicks on share, data is pushed to mongo and URL is created right. if already in mongo, not created. otherwise create."

**Simple Flow**:
1. User clicks share button → opportunity object sent to API
2. API sanitizes and stores in MongoDB with UUID
3. Share URL created: `/share/opportunity/{uuid}`
4. User opens share link → server fetches from MongoDB
5. Server passes data to client component → **ERROR OCCURS HERE**

**The Mystery**:
- All sanitization is in place (client-side, storage, retrieval, server-side)
- Works perfectly in local development
- Fails in production with same error after 7 different approaches
- **Question**: WHERE is the contamination surviving?

## Possible Causes

1. **Client-side JSON.stringify fails silently** - Circular references or special objects that survive
2. **MongoDB stores contaminated data** - Sanitization not catching something
3. **Server-side serialization issue** - Next.js function closure captures contaminated objects
4. **React elements in opportunity data** - Surviving JSON.stringify somehow
5. **Production build difference** - Webpack/Turbopack optimization creating hidden references

## Current Diagnostic Deployment (Deployment 8)

### What's Changed
**File**: `components/opportunity-atlas-new.tsx` (lines 1286-1290)
- Added console logging before/after client-side sanitization
- Logs will reveal if `JSON.parse(JSON.stringify())` is working

### Deployment Command

```bash
git add components/opportunity-atlas-new.tsx
git commit -m "Add diagnostic logging to track share data sanitization"
git push origin main
```

Vercel will auto-deploy in ~2 minutes.

### Testing Protocol (MUST DO IN THIS ORDER)

1. **Wait for Vercel deployment to complete**
   - Check: https://vercel.com/dashboard
   - Wait for "Deployment completed" status

2. **Open browser with DevTools**
   - Open Console tab
   - Go to app.hnwichronicles.com
   - Navigate to Privé Exchange

3. **Create a BRAND NEW share** (don't test old shares)
   - Click share button on any opportunity
   - Watch browser console for:
     ```
     [Share] Before sanitization, checking for functions: object
     [Share] After sanitization, data length: XXXX
     ```
   - Copy the generated UUID URL

4. **Test the share URL in a NEW incognito tab**
   - Paste the UUID URL
   - Watch for:
     - Page loads successfully (no 500)
     - OR 500 error appears

5. **Check Vercel logs immediately**
   ```bash
   vercel logs --follow
   ```
   - Look for:
     ```
     [Opportunity Share] Starting stringification...
     [Opportunity Share] Full stringify succeeded, length: XXXX
     ```
   - OR the Event handlers error

### Key Files in Current State

1. **components/opportunity-atlas-new.tsx** (line 1286-1302)
   - Client-side sanitization with logging
   - Sends cleaned data to `/api/opportunities/public/share`

2. **lib/mongodb-shared-opportunities.ts** (lines 59-232)
   - `deepSanitize()` function (comprehensive)
   - Applied during storage (line 185)
   - Applied during retrieval (lines 228, 256)

3. **app/share/opportunity/[opportunityId]/page.tsx** (lines 18-230)
   - Async function returns string, not object
   - Triple stringify/parse sanitization
   - Metadata extracts only primitives

4. **app/share/opportunity/[opportunityId]/shared-opportunity-client.tsx** (lines 73-86)
   - Receives `opportunityString` prop (not object)
   - Parses string in useMemo

## Diagnostic Decision Tree (After Deployment 8)

### Scenario A: Logs Show Sanitization Working
**Console logs appear**:
```
[Share] Before sanitization, checking for functions: object
[Share] After sanitization, data length: 12543
```

**Vercel logs show**:
```
[Opportunity Share] Starting stringification...
[Opportunity Share] Full stringify succeeded, length: 12543
```

**But page still shows 500 error**:
- ✅ Confirms client-side sanitization IS working
- ✅ Confirms server-side stringify IS working
- 🔍 **Contamination is happening ELSEWHERE**:
  - Possibly in `generateMetadata()` function closure
  - Possibly in Next.js build optimization
  - Possibly in Vercel edge runtime serialization

**Next Action**: Investigate Next.js streaming serialization and function closures

### Scenario B: Logs Missing or JSON.stringify Fails
**No console logs appear** OR **browser console shows error**:
```
Uncaught Error: Converting circular structure to JSON
```

**Action**: The opportunity object has circular references
- Need to use a custom replacer function
- Or identify which field creates the circular reference

### Scenario C: Page Loads Successfully
**Share URL opens without 500 error**:
- ✅ **PROBLEM SOLVED**
- Test Open Graph: https://cards-dev.twitter.com/validator
- Test multiple opportunities to confirm consistency
- Remove diagnostic console.log statements
- Mark as complete

### Scenario D: Different Error in Vercel Logs
**New error message appears**:
- Document the exact error
- Analyze the new root cause
- Adjust approach accordingly

## What We Know So Far

### ✅ Confirmed Working
1. **Local development** - Share functionality works perfectly (localhost:3000)
2. **MongoDB storage/retrieval** - Data is being stored and fetched correctly
3. **UUID generation** - Share IDs are created properly
4. **Sanitization implementation** - All sanitization functions are in place

### ❌ Confirmed Failing
1. **Production deployment** - Consistent 500 error across 7 deployments
2. **Open Graph previews** - Not showing on social media platforms
3. **Error message** - Same "Event handlers cannot be passed" error every time

### 🤔 Unknown
1. **WHERE contamination occurs** - Despite sanitization at every layer
2. **WHY local works but production fails** - Environment difference not identified
3. **WHAT survives JSON.stringify** - Unknown type passing through

## Success Criteria

When working correctly:
- [ ] Share button generates UUID URLs
- [ ] Share URLs load in production (no 500 error)
- [ ] Vercel logs show no "Event handlers cannot be passed" error
- [ ] Open Graph previews work on Twitter/LinkedIn/Discord
- [ ] Page renders under 2 seconds
- [ ] Works consistently across multiple opportunities

## Next Steps After Diagnostic Logs

Based on the diagnostic results, we will:

1. **If Scenario A** (sanitization works, error persists):
   - Investigate Next.js metadata generation and function closures
   - Check if `generateMetadata()` is the issue
   - Consider moving metadata to client-side generation

2. **If Scenario B** (circular reference):
   - Identify the circular reference field
   - Add custom JSON replacer function
   - Test with specific opportunity data

3. **If Scenario C** (works):
   - Clean up diagnostic logs
   - Test across multiple opportunities
   - Document what actually fixed it

4. **If Scenario D** (new error):
   - Analyze the new error
   - Adjust strategy accordingly

## References

- **Vercel Logs**: Shows "Event handlers cannot be passed to Client Component props"
- **Next.js Docs**: [Server to Client Component Props](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#passing-props-from-server-to-client-components-serialization)
- **User Insight**: "Don't complicate the problem" - Keep focus on simple flow
- **Working Reference**: Ask Rohith share implementation (same architecture, works perfectly)
