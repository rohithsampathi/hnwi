# Cache Debugging Guide

## Problem
Backend changes to Command Centre opportunities not showing in frontend despite cache clearing.

## Expected Data vs Actual Data

**Backend (Correct)**:
- Title: "Ultra-Luxury Rental Arbitrage: Los Angeles Premium Market"
- Entry Price: $400,000 - $600,000
- Updated Katherine analysis

**Frontend (Old Data)**:
- Title: "Ultra-Luxury Rental Arbitrage"
- Entry Price: $165,000
- Old Katherine analysis

## Debug Steps

### Step 1: Open Browser DevTools
1. Open Chrome/Edge DevTools (F12 or Cmd+Option+I)
2. Go to the **Console** tab
3. Clear the console (right-click → Clear console)

### Step 2: Trigger Cache Clear
1. Navigate to: `/dashboard/clear-cache`
2. Watch the console logs - you should see:

```
[Clear Cache Page] Starting cache clear...
[Clear Cache Page] 🗑️ Deleting cache entry: https://yoursite.com/api/command-centre/opportunities...
[Clear Cache Page] 🗑️ Deleting cache entry: https://yoursite.com/api/hnwi/intelligence/dashboard...
[Clear Cache Page] ✅ Deleted X API cache entries: [array of URLs]
[Clear Cache Page] ✅ Dispatched clear-cache events
[Clear Cache Page] ✅ All caches cleared! Redirecting to dashboard...
```

**If you DON'T see the "Deleting cache entry" messages:**
- The cache might already be empty
- Or the Service Worker isn't caching those endpoints

### Step 3: Verify Event Propagation
After redirection to dashboard, check console for:

```
[Opportunities] Event listeners registered for cache clearing
[Opportunities] 🔥 Cache clear event received, setting bustCache=true
[Opportunities] Fetching from /api/command-centre/opportunities?view=all&timeframe=LIVE&include_crown_vault=false
[SecureAPI] Cache busting enabled for: /api/command-centre/opportunities?view=all&timeframe=LIVE&include_crown_vault=false
```

**If you DON'T see these messages:**
- The event listeners might not be registered
- Or the component isn't mounted

### Step 4: Check Network Requests
1. Go to **Network** tab in DevTools
2. Filter by "opportunities" or "command-centre"
3. Look for the request to `/api/command-centre/opportunities`
4. Click on the request and check:

**Request Headers** should include:
```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

**Request URL** should include:
```
/api/command-centre/opportunities?view=all&timeframe=LIVE&include_crown_vault=false&t=1234567890
```

The `t=` timestamp parameter proves cache busting is active.

**Response Preview**:
- Check if the response contains the OLD data or NEW data
- If it contains NEW data, the backend is working correctly
- If it contains OLD data, the backend might be caching responses

### Step 5: Identify the Issue

#### Scenario A: Cache Clear Works, But Data Still Old
**Console shows:**
```
[SecureAPI] Cache busting enabled for: /api/command-centre/opportunities...
[Opportunities] Received 10 opportunities from API
```

**Network tab shows:**
- Request has cache-busting headers ✅
- Response contains OLD data ❌

**Diagnosis**: Backend is returning cached/stale data. The frontend is doing everything correctly, but the backend API itself is caching responses.

**Solution**: Check backend caching on the Command Centre endpoint:
- Verify the backend code isn't caching MongoDB queries
- Check if there's Redis/Memcached caching the API response
- Verify the backend is actually fetching fresh data from MongoDB

#### Scenario B: Cache Clear Not Triggering Refetch
**Console shows:**
```
[Clear Cache Page] ✅ Deleted X API cache entries
[Clear Cache Page] ✅ Dispatched clear-cache events
```

**But NO follow-up messages:**
```
[Opportunities] 🔥 Cache clear event received, setting bustCache=true  ❌ MISSING
[Opportunities] Fetching from /api/command-centre/opportunities...      ❌ MISSING
```

**Diagnosis**: Event listeners not registered or component not mounted.

**Solution**:
- Check if the Home Dashboard component is actually rendering `useOpportunities` hook
- Verify the component isn't unmounting before events are received
- Check if there's an error preventing the component from mounting

#### Scenario C: Request Not Using Cache Busting
**Network tab shows:**
- No cache-busting headers ❌
- No `t=` timestamp parameter ❌

**Diagnosis**: The `bustCache` flag isn't being passed to `secureApi.get()`

**Solution**: Already fixed in the code, but verify the build is using the latest code.

#### Scenario D: Browser HTTP Cache Overriding Everything
**Network tab shows:**
- Request shows "(from disk cache)" or "(from memory cache)"
- Even with cache-busting headers

**Diagnosis**: Browser is aggressively caching despite our headers.

**Solution**:
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Disable cache in DevTools: Network tab → check "Disable cache"
3. Clear browser cache: Settings → Privacy → Clear browsing data

## Quick Fix: Force Hard Refresh

If nothing else works, try this nuclear option:

1. Open DevTools (F12)
2. Go to **Application** tab
3. Go to **Storage** section on the left
4. Click **Clear site data**
5. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

## What Should Happen

When working correctly, the flow is:

1. Navigate to `/dashboard/clear-cache`
2. Service Worker cache entries deleted ✅
3. Events dispatched ✅
4. useOpportunities receives event ✅
5. Sets `bustCache = true` ✅
6. Fetches with cache-busting headers and timestamp ✅
7. Backend returns fresh data ✅
8. Frontend displays new data ✅
9. `bustCache` resets to `false` ✅

## Next Steps

Run through the debug steps above and report back:

1. Which scenario matches what you're seeing?
2. What do the console logs show?
3. What does the Network tab show for the opportunities request?
4. Does the response contain old or new data?

This will help identify exactly where the cache is persisting.
