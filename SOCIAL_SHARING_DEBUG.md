# Social Sharing Meta Tags - Debugging Guide

## 📚 Quick Navigation

- **Testing Locally?** → See [LOCAL_SHARE_TESTING.md](./LOCAL_SHARE_TESTING.md)
- **Deploying to Production?** → See "Production Testing" section below
- **Preview not working?** → See "Common Issues & Solutions" section below

## ✅ FIXES APPLIED (Latest Update)

### 🎯 Quick Summary
**Status**: Fixed and ready for production
**OG Image**: Uses `/logo.png`
**Next Steps**:
1. Deploy to production
2. Test with Facebook Debugger: https://developers.facebook.com/tools/debug/
3. Share on WhatsApp - preview appears automatically

### Root Issues Fixed:
1. ✅ **API URL Issue**: Server-side fetch now correctly uses production URL in production
2. ✅ **OG Image Path**: Changed from non-existent `/images/ask-rohith-og.png` to `/logo.png`
3. ✅ **Fallback Metadata**: Added comprehensive fallback metadata when conversation fetch fails
4. ✅ **Dynamic Rendering**: Added `export const dynamic = 'force-dynamic'` to ensure fresh metadata

### Key Changes:
- Fixed API URL to work in both dev and production
- Changed OG image from `/images/ask-rohith-og.png` to `/logo.png`
- Added fallback metadata
- Made rendering dynamic

---

## Why Social Previews Don't Work on Localhost

**CRITICAL**: Social media crawlers (WhatsApp, Facebook, Twitter, LinkedIn) **CANNOT access localhost URLs**.

### The Problem
When you share `http://localhost:3000/share/rohith/abc123`:
- ❌ WhatsApp/Facebook/Twitter bots try to fetch the page
- ❌ They can't reach your computer (localhost)
- ❌ No preview is generated

### The Solution
You have 3 options:

#### Option 1: Deploy to Production (Recommended)
```bash
# Deploy to Vercel/Digital Ocean/etc
# Share URLs like: https://app.hnwichronicles.com/share/rohith/abc123
```
✅ This will work perfectly with all social platforms

#### Option 2: Use ngrok (For Testing)
```bash
# Install ngrok
brew install ngrok  # or download from ngrok.com

# Run your Next.js app
npm run dev

# In another terminal, expose it
ngrok http 3000

# You'll get a public URL like: https://abc123.ngrok.io
# Test with: https://abc123.ngrok.io/share/rohith/your-share-id
```
✅ Social media crawlers can now access your local app

#### Option 3: Use Meta Tag Debuggers
Test your meta tags BEFORE sharing:

**Facebook/WhatsApp Debugger:**
https://developers.facebook.com/tools/debug/

**Twitter Card Validator:**
https://cards-dev.twitter.com/validator

**LinkedIn Post Inspector:**
https://www.linkedin.com/post-inspector/

---

## Verify Meta Tags are Working

### Method 1: View Source (Localhost)
```bash
curl http://localhost:3000/share/rohith/YOUR_SHARE_ID | grep -E "og:|twitter:" | head -20
```

### Method 2: Use Debug API
```bash
# Start your app
npm run dev

# Test meta tags extraction
curl "http://localhost:3000/api/debug/meta-tags?url=http://localhost:3000/share/rohith/YOUR_SHARE_ID"
```

### Method 3: Browser DevTools
1. Open shared URL in browser
2. Right-click → "View Page Source"
3. Search for `og:title`, `og:description`, `og:image`
4. Verify they contain the dynamic conversation content

---

## What Meta Tags Should Look Like

### ✅ Correct (Dynamic Content)
```html
<title>What are the best tax strategies for 2025? | Ask Rohith - HNWI Chronicles</title>
<meta property="og:title" content="What are the best tax strategies for 2025? | Ask Rohith" />
<meta property="og:description" content="For HNWIs in 2025, optimal tax strategies include offshore trust structures, strategic residence planning in low-tax jurisdictions..." />
<meta property="og:image" content="https://app.hnwichronicles.com/images/ask-rohith-og.png" />
<meta property="og:url" content="https://app.hnwichronicles.com/share/rohith/abc123" />
```

### ❌ Incorrect (Fallback/Default)
```html
<title>HNWI Chronicles - What the world's top 0.1% realise before others know</title>
<meta property="og:title" content="HNWI Chronicles - What the world's top 0.1% realise before others know" />
<meta property="og:description" content="Access exclusive wealth intelligence..." />
```

---

## Troubleshooting Checklist

### 1. Server-Side Rendering Working?
```bash
# Check if page loads at all
curl -I http://localhost:3000/share/rohith/YOUR_SHARE_ID

# Should return 200 OK (or 404 if shareId doesn't exist)
```

### 2. API Endpoint Returning Data?
```bash
# Test the backend API directly
curl "https://hnwi-uwind-p8oqb.ondigitalocean.app/api/conversations/share?shareId=YOUR_SHARE_ID"

# Should return: {"success": true, "conversation": {...}}
```

### 3. generateMetadata Function Called?
Check server logs when accessing the page - you should see the `console.error` if data fetch fails.

### 4. Image Accessible?
```bash
# Verify OG image exists
curl -I https://app.hnwichronicles.com/images/ask-rohith-og.png

# Should return 200 OK
```

---

## Testing Workflow

### Local Testing (Development)

**See [LOCAL_SHARE_TESTING.md](./LOCAL_SHARE_TESTING.md) for complete guide**

Quick test:
```bash
# 1. Start dev server
npm run dev

# 2. Test API endpoint
curl "http://localhost:3000/api/conversations/share?shareId=YOUR_SHARE_ID"

# 3. Check meta tags in HTML
curl http://localhost:3000/share/rohith/YOUR_SHARE_ID | grep "og:image"
# Should see: <meta property="og:image" content="https://app.hnwichronicles.com/logo.png"/>

# 4. Test with ngrok (for WhatsApp/Facebook)
ngrok http 3000
# Use ngrok URL in Facebook debugger: https://developers.facebook.com/tools/debug/
```

### Production Testing (After Deployment)
1. **Deploy to production**:
   ```bash
   # Ensure NEXT_PUBLIC_PRODUCTION_URL is set correctly in production env
   # Verify build completes successfully
   npm run build
   ```

2. **Test with Facebook Debugger**:
   - Visit: https://developers.facebook.com/tools/debug/
   - Enter: `https://app.hnwichronicles.com/share/rohith/YOUR_SHARE_ID`
   - Click "Scrape Again" to bypass cache
   - Verify all fields populate:
     - ✅ Title shows conversation question
     - ✅ Description shows conversation response
     - ✅ Image shows logo.png

3. **Test with WhatsApp**:
   - Share production URL in WhatsApp chat
   - Preview should show within 2-3 seconds
   - Image, title, and description should all appear

4. **Check server logs**:
   ```bash
   # Look for these console messages in production logs:
   [Share Page] Fetching conversation {shareId} from https://app.hnwichronicles.com
   [Share Page] Successfully fetched conversation {shareId}
   [Share Page] Generated metadata for {shareId}
   ```

---

## Common Issues & Solutions

### Issue: "Conversation Not Found" Meta Tags
**Cause**: ShareId doesn't exist or API is down
**Fix**: Use a valid shareId from MongoDB database
**✅ NOW INCLUDES**: Default fallback metadata so preview always shows something

### Issue: Generic/Default Meta Tags in Production
**Cause**: Server-side fetch failing due to wrong API URL
**Fix**: ✅ FIXED - Now uses `NEXT_PUBLIC_PRODUCTION_URL` in production
**Verify**: Check production env vars include `NEXT_PUBLIC_PRODUCTION_URL=https://app.hnwichronicles.com`

### Issue: Old/Cached Preview
**Cause**: Facebook/WhatsApp caches previews for ~7 days
**Fix**:
- Use Facebook debugger: https://developers.facebook.com/tools/debug/
- Click "Scrape Again" button
- For WhatsApp: Clear chat and reshare, or wait for cache expiry

### Issue: Image Not Showing (404 Error)
**Cause**: Image path doesn't exist
**Fix**: ✅ FIXED - Now uses `/logo.png` which exists
**Verify**: Test `https://app.hnwichronicles.com/logo.png` loads successfully

### Issue: Metadata Not Updating After Code Changes
**Cause**: Static generation or build cache
**Fix**: ✅ FIXED - Added `export const dynamic = 'force-dynamic'`
**Verify**: Rebuild and redeploy to production

### Issue: WhatsApp Shows No Preview At All
**Possible Causes**:
1. **Server not responding**: Check if URL loads in browser
2. **HTTPS required**: WhatsApp requires HTTPS (not HTTP)
3. **Firewall/CDN blocking**: Check if WhatsApp's crawler IP is blocked
4. **Timeout**: Server took >5 seconds to respond
5. **Invalid HTML**: Check for HTML syntax errors

**Debug Steps**:
```bash
# 1. Test if page loads
curl -I https://app.hnwichronicles.com/share/rohith/YOUR_SHARE_ID

# 2. Check if meta tags are in HTML
curl https://app.hnwichronicles.com/share/rohith/YOUR_SHARE_ID | grep "og:image"

# 3. Verify image is accessible
curl -I https://app.hnwichronicles.com/logo.png
```

---

## Implementation Summary

**What We Built:**
- ✅ Server Component with `generateMetadata()`
- ✅ Dynamic title from first user question
- ✅ Dynamic description from first assistant response
- ✅ OpenGraph tags for Facebook/WhatsApp
- ✅ Twitter Card tags
- ✅ Proper image dimensions (1200x630)

**What's Working:**
- Meta tags ARE being generated correctly
- Server-side rendering IS working
- Dynamic content extraction IS functional

**What's NOT Working:**
- ❌ Testing on localhost (by design - crawlers can't reach it)

**Next Steps:**
1. Deploy to production OR use ngrok
2. Get a real shareId from your database
3. Test with social media debugger tools
4. Verify preview generation
5. Share actual link on WhatsApp/Twitter to confirm
