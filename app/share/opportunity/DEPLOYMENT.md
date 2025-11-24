# Opportunity Share - Deployment Checklist

## Pre-Deployment Verification

### 1. Environment Variables (Vercel Dashboard)
Ensure these are set in Vercel → Project Settings → Environment Variables:

```bash
# Required for MongoDB access
MONGODB_URI=mongodb+srv://...

# Optional (for share URL generation)
NEXT_PUBLIC_PRODUCTION_URL=https://app.hnwichronicles.com
```

### 2. Build Test
```bash
npm run build
```

Should show:
```
✓ Compiled successfully
├ ƒ /share/opportunity/[opportunityId]  13.3 kB  151 kB
```

The `ƒ` symbol indicates serverless function (correct for dynamic routes).

### 3. MongoDB Indexes
Ensure indexes are created (run once):

```typescript
import { createIndexes } from '@/lib/mongodb-shared-opportunities'
await createIndexes()
```

Or via MongoDB Atlas:
- Collection: `shared_opportunities`
- Indexes:
  - `{ shareId: 1 }` (unique)
  - `{ opportunityId: 1 }`
  - `{ userId: 1 }`
  - `{ expiresAt: 1 }` (TTL index with `expireAfterSeconds: 0`)

## Deployment Steps

### 1. Deploy to Vercel
```bash
git add .
git commit -m "Fix opportunity share with MongoDB-direct access"
git push origin main
```

Vercel auto-deploys from main branch.

### 2. Verify Deployment
Check Vercel deployment logs for:

```
[MongoDB] Connecting to database...
[MongoDB] Successfully connected
[Opportunity Share] Fetching {uuid} directly from MongoDB
[Opportunity Share] Successfully fetched opportunity
```

### 3. Test Share Creation
1. Go to Privé Exchange: https://app.hnwichronicles.com/prive-exchange
2. Click share button on any opportunity
3. Verify UUID-based URL is copied: `/share/opportunity/{uuid}`
4. Check Network tab: POST `/api/opportunities/share` returns 200

### 4. Test Share Access
1. Open share URL in browser
2. Page should load with full opportunity details
3. Check browser console for logs:
   - `[Opportunity Share] Fetching...`
   - `[Opportunity Share] Successfully fetched opportunity`

### 5. Test Social Previews
Use these tools to verify Open Graph metadata:

- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: Share URL in post and preview
- **Discord**: Paste URL and check embed preview
- **Facebook**: https://developers.facebook.com/tools/debug/

Expected metadata:
- **Title**: `{Opportunity Title} | HNWI Chronicles`
- **Description**: Opportunity investment thesis or description
- **Image**: HNWI Chronicles logo
- **URL**: Full share URL with UUID

## Common Issues & Solutions

### Issue 1: 500 Error on Share Page

**Symptom**: Page loads in local but fails in production with 500 error.

**Cause**: MongoDB connection timeout or missing environment variable.

**Solution**:
1. Check Vercel logs: `vercel logs --follow`
2. Verify `MONGODB_URI` is set in Vercel dashboard
3. Check MongoDB Atlas:
   - Network access allows Vercel IPs (0.0.0.0/0 for all)
   - Database user has read/write permissions

### Issue 2: Share Button Not Copying Link

**Symptom**: Click share button, no link copied.

**Cause**: CSRF token failure or authentication issue.

**Solution**:
1. Check browser console for CSRF errors
2. Verify user is authenticated (check cookies)
3. Clear browser cache and retry

### Issue 3: Social Previews Not Showing

**Symptom**: Share URL works but no Open Graph preview.

**Cause**: Metadata generation failed or crawlers cached old data.

**Solution**:
1. Verify metadata in browser: View page source → Check `<meta property="og:...">` tags
2. Clear social media cache:
   - Twitter: Re-validate at https://cards-dev.twitter.com/validator
   - LinkedIn: Add `?t={timestamp}` to URL to bypass cache
   - Facebook: Re-scrape at https://developers.facebook.com/tools/debug/

### Issue 4: 404 Not Found

**Symptom**: Share URL returns 404.

**Cause**: Invalid UUID or expired share.

**Solution**:
1. Verify UUID format: `8-4-4-4-12` hexadecimal with dashes
2. Check MongoDB for shareId:
   ```javascript
   db.shared_opportunities.findOne({ shareId: "uuid-here" })
   ```
3. Verify `expiresAt` is in the future

## Monitoring

### Vercel Logs
```bash
vercel logs --follow
```

Look for:
- `[MongoDB] Connection failed:` → Check MONGODB_URI
- `[Opportunity Share] Invalid UUID format:` → Client sending wrong format
- `[Opportunity Share] Not found or expired:` → Share deleted or expired

### MongoDB Atlas Monitoring
- **Real-time Performance**: Check query execution times
- **Network Access**: Verify Vercel IPs aren't blocked
- **Database Size**: Monitor shared_opportunities collection size

## Rollback Plan

If deployment breaks production:

1. **Quick rollback**:
   ```bash
   vercel rollback
   ```

2. **Emergency fix**: Revert to HTTP fetch pattern (like Ask Rohith):
   - Change page.tsx to fetch from `/api/opportunities/public/${shareId}`
   - Keep API route unchanged
   - Deploy immediately

## Success Criteria

✅ Share button generates UUID-based URLs
✅ Share URLs load successfully in production
✅ Open Graph previews work on Twitter/LinkedIn/Discord
✅ MongoDB connections succeed in Vercel logs
✅ No 500 errors in production
✅ Page loads under 2 seconds
✅ Social crawlers can access metadata

## Support

If issues persist:
1. Check Vercel logs: `vercel logs --follow`
2. Check MongoDB Atlas logs
3. Test with `curl -v https://app.hnwichronicles.com/api/opportunities/public/{uuid}`
4. Review SECURITY.md for architecture details
