# Testing Ask Rohith Share URLs Locally

## Quick Start (Local Development)

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test Metadata Generation Locally

**View the HTML source** to verify meta tags are being generated:
```bash
# Option A: Use curl
curl http://localhost:3000/share/rohith/YOUR_SHARE_ID | grep -E "og:|twitter:" | head -20

# Option B: Open in browser and view source
open http://localhost:3000/share/rohith/YOUR_SHARE_ID
# Then press Cmd+Option+U (Mac) or Ctrl+U (Windows) to view source
```

**Expected output** in the HTML:
```html
<title>Your Question | Ask Rohith - HNWI Chronicles</title>
<meta property="og:title" content="Your Question | Ask Rohith" />
<meta property="og:description" content="First part of Rohith's response..." />
<meta property="og:image" content="https://app.hnwichronicles.com/logo.png" />
<meta property="og:url" content="https://app.hnwichronicles.com/share/rohith/YOUR_SHARE_ID" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://app.hnwichronicles.com/logo.png" />
```

### 3. Test the API Endpoint

**Check if conversation data is being fetched**:
```bash
curl "http://localhost:3000/api/conversations/share?shareId=YOUR_SHARE_ID" | jq
```

**Expected response**:
```json
{
  "success": true,
  "conversation": {
    "id": "...",
    "title": "...",
    "messages": [...]
  }
}
```

### 4. Test WhatsApp Preview with ngrok

**Why?** WhatsApp/Facebook can't access localhost, so you need to expose your local server:

**Step 1: Install ngrok**
```bash
# Mac
brew install ngrok

# Or download from https://ngrok.com/download
```

**Step 2: Start ngrok**
```bash
# In a new terminal (keep npm run dev running in another)
ngrok http 3000
```

**Step 3: Use the ngrok URL**
```
Forwarding   https://abc123.ngrok.io -> http://localhost:3000
```

**Step 4: Test with Facebook Debugger**
- Visit: https://developers.facebook.com/tools/debug/
- Enter: `https://abc123.ngrok.io/share/rohith/YOUR_SHARE_ID`
- Click "Scrape Again"
- Verify preview appears

**Step 5: Test in WhatsApp**
- Share the ngrok URL in WhatsApp
- Preview should appear within 2-3 seconds

## Troubleshooting Local Development

### Issue: "Conversation not found" error
**Check:**
```bash
# 1. Verify the shareId exists in MongoDB
curl "http://localhost:3000/api/conversations/share?shareId=YOUR_SHARE_ID"

# 2. Check server logs for errors
# Look in the terminal running npm run dev for:
[Share Page] Environment: development
[Share Page] Fetching conversation YOUR_SHARE_ID from http://localhost:3000
[Share Page] Successfully fetched conversation YOUR_SHARE_ID
```

### Issue: Meta tags show generic/default content
**Cause:** API fetch is failing
**Debug:**
```bash
# Check the API directly
curl -v "http://localhost:3000/api/conversations/share?shareId=YOUR_SHARE_ID"

# Check if MongoDB is connected
# Look for connection errors in npm run dev logs
```

### Issue: Image not showing in preview
**Check:**
```bash
# Verify logo.png is accessible
curl -I https://app.hnwichronicles.com/logo.png

# Should return: HTTP/2 200
```
**Note:** The image URL always points to production (https://app.hnwichronicles.com/logo.png) even in development, because social media crawlers need a publicly accessible image.

### Issue: ngrok session expired
**Fix:**
```bash
# Restart ngrok - you'll get a new URL
ngrok http 3000

# You'll need to re-scrape with the new URL in Facebook debugger
```

## How It Works

### In Development (localhost):
1. **Next.js server** runs on `localhost:3000`
2. **API routes** available at `localhost:3000/api/*`
3. **Server-side fetch** calls `http://localhost:3000/api/conversations/share?shareId=...`
4. **Metadata URLs** point to production (for social media crawlers):
   - Image: `https://app.hnwichronicles.com/logo.png`
   - Share URL: `https://app.hnwichronicles.com/share/rohith/...`

### In Production:
1. **Next.js server** runs on `app.hnwichronicles.com`
2. **API routes** available at `app.hnwichronicles.com/api/*`
3. **Server-side fetch** calls `https://app.hnwichronicles.com/api/conversations/share?shareId=...`
4. **Metadata URLs** use production:
   - Image: `https://app.hnwichronicles.com/logo.png`
   - Share URL: `https://app.hnwichronicles.com/share/rohith/...`

## Step-by-Step: Create and Test a Share URL Locally

### 1. Create a shareable conversation
```bash
# Assuming you're logged in to the app at localhost:3000
# Navigate to Ask Rohith
# Have a conversation
# Click the "Share" button
# Copy the share URL
```

### 2. Extract the shareId
```bash
# If the URL is: http://localhost:3000/share/rohith/abc-123-def
# The shareId is: abc-123-def
```

### 3. Test the API directly
```bash
curl "http://localhost:3000/api/conversations/share?shareId=abc-123-def"
```

### 4. Test the page locally
```bash
# Open in browser
open http://localhost:3000/share/rohith/abc-123-def

# View source and search for "og:title"
# Should see your conversation question
```

### 5. Test with social media crawlers
```bash
# Start ngrok
ngrok http 3000

# Copy the HTTPS ngrok URL (e.g., https://abc123.ngrok.io)

# Test in Facebook debugger
# URL: https://abc123.ngrok.io/share/rohith/abc-123-def
```

## Console Logs to Look For

When the share page loads, you should see:
```
[Share Page] Environment: development
[Share Page] Fetching conversation abc-123-def from http://localhost:3000
[Share Page] Successfully fetched conversation abc-123-def
[Share Page] Generating metadata for environment: development
[Share Page] Using base URL: https://app.hnwichronicles.com
[Share Page] Generated metadata for abc-123-def: { title: '...', description: '...' }
```

If conversation fetch fails:
```
[Share Page] Environment: development
[Share Page] Fetching conversation abc-123-def from http://localhost:3000
[Share Page] Failed to fetch conversation: 404 Not Found
[Share Page] Error details: { error: 'Conversation not found or has expired' }
[Share Page] No conversation found for abc-123-def, using default metadata
```

## Environment Variables for Local Dev

Your `.env.local` should have:
```bash
# API Configuration
API_BASE_URL=http://localhost:8000  # Backend API (if separate)

# Base URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCTION_URL=https://app.hnwichronicles.com

# Database
MONGODB_URI=mongodb+srv://...

# Other required env vars
JWT_SECRET=...
ANTHROPIC_API_KEY=...
```

## Quick Commands Reference

```bash
# Start dev server
npm run dev

# Test API endpoint
curl "http://localhost:3000/api/conversations/share?shareId=YOUR_ID"

# View meta tags in HTML
curl http://localhost:3000/share/rohith/YOUR_ID | grep "og:"

# Start ngrok for social media testing
ngrok http 3000

# Test production image
curl -I https://app.hnwichronicles.com/logo.png
```

## Facebook Debugger URLs

- **Facebook/WhatsApp**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/

Remember: Always click "Scrape Again" to bypass cache!
