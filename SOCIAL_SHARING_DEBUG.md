# Social Sharing Meta Tags - Debugging Guide

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
<title>HNWI Chronicles - What the world's top 1% realise before others know</title>
<meta property="og:title" content="HNWI Chronicles - What the world's top 1% realise before others know" />
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

### Before Deployment
1. ✅ Verify meta tags in localhost source code
2. ✅ Test with ngrok + Facebook debugger
3. ✅ Confirm API returns conversation data

### After Deployment
1. ✅ Share production URL to Facebook debugger
2. ✅ Click "Scrape Again" to refresh cache
3. ✅ Verify preview shows question + answer
4. ✅ Test actual sharing on WhatsApp/Twitter

---

## Common Issues

### Issue: "Conversation Not Found" Meta Tags
**Cause**: ShareId doesn't exist or API is down
**Fix**: Use a valid shareId from your database

### Issue: Generic/Default Meta Tags
**Cause**: generateMetadata not being called or returning fallback
**Fix**: Check server logs for fetch errors

### Issue: Old/Cached Preview
**Cause**: Facebook/WhatsApp caches previews for ~7 days
**Fix**: Use debugger tool and click "Scrape Again"

### Issue: Image Not Showing
**Cause**: Image URL not accessible or wrong format
**Fix**: Verify image exists at full HTTPS URL (not relative path)

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
