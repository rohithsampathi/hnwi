# Ask Rohith Share URLs - Complete Guide

## Overview

This system allows users to share their Ask Rohith conversations via URL with proper WhatsApp/Facebook/Twitter previews including:
- Dynamic title from the conversation question
- Dynamic description from Rohith's response
- Preview image (HNWI Chronicles logo)

## Files

- **`/app/share/rohith/[shareId]/page.tsx`** - Main share page with metadata generation
- **`/app/api/conversations/share/route.ts`** - API endpoint to fetch shared conversations
- **`LOCAL_SHARE_TESTING.md`** - Complete local testing guide
- **`SOCIAL_SHARING_DEBUG.md`** - Troubleshooting guide
- **`test-share-metadata.sh`** - Automated test script

## Quick Start

### Testing Locally

```bash
# 1. Start development server
npm run dev

# 2. Run the test script
./test-share-metadata.sh YOUR_SHARE_ID

# 3. Test with ngrok (for WhatsApp preview)
ngrok http 3000
# Then use the ngrok URL in Facebook debugger
```

### Testing in Production

```bash
# 1. Deploy to production

# 2. Test with Facebook Debugger
# Visit: https://developers.facebook.com/tools/debug/
# URL: https://app.hnwichronicles.com/share/rohith/YOUR_SHARE_ID

# 3. Share in WhatsApp
# Preview should appear automatically
```

## How It Works

### 1. Creating a Share URL

When a user clicks "Share" in Ask Rohith:
```typescript
// POST /api/conversations/share
{
  "conversationId": "abc-123",
  "userId": "user-456",
  "conversationData": { /* full conversation */ }
}

// Response
{
  "success": true,
  "shareUrl": "https://app.hnwichronicles.com/share/rohith/xyz-789",
  "shareId": "xyz-789"
}
```

### 2. Viewing a Share URL

When someone visits the share URL:

1. **Server-Side Rendering** (Next.js)
   - `generateMetadata()` function runs on the server
   - Fetches conversation data from `/api/conversations/share?shareId=xyz-789`
   - Generates dynamic meta tags based on conversation content

2. **Meta Tags Generated**
   ```html
   <meta property="og:title" content="User's question | Ask Rohith" />
   <meta property="og:description" content="Rohith's response preview..." />
   <meta property="og:image" content="https://app.hnwichronicles.com/logo.png" />
   <meta property="og:url" content="https://app.hnwichronicles.com/share/rohith/xyz-789" />
   ```

3. **Social Media Crawlers**
   - WhatsApp/Facebook/Twitter bots fetch the page
   - Parse the meta tags
   - Generate link preview

### 3. Environment-Specific Behavior

| Environment | API Fetch URL | Meta Tags Base URL |
|-------------|--------------|-------------------|
| Development | `http://localhost:3000/api/*` | `https://app.hnwichronicles.com` |
| Production | `https://app.hnwichronicles.com/api/*` | `https://app.hnwichronicles.com` |

**Why production URLs in dev metadata?**
- Social media crawlers need publicly accessible images
- Share URLs should always point to production (even if generated locally)

## Architecture

```
User shares conversation
         ↓
POST /api/conversations/share
         ↓
Store in MongoDB with unique shareId
         ↓
Return shareUrl to user
         ↓
User shares URL on WhatsApp
         ↓
WhatsApp crawler visits URL
         ↓
Next.js SSR: generateMetadata() runs
         ↓
Fetches conversation from MongoDB
         ↓
Generates dynamic meta tags
         ↓
Returns HTML with meta tags
         ↓
WhatsApp shows preview with:
  - Title (question)
  - Description (response)
  - Image (logo)
```

## Key Components

### Server Component (`page.tsx`)

```typescript
// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Generate metadata for social sharing
export async function generateMetadata({ params }) {
  const conversation = await getSharedConversation(params.shareId)

  return {
    title: `${question} | Ask Rohith`,
    description: response,
    openGraph: { /* ... */ },
    twitter: { /* ... */ }
  }
}
```

### API Route (`route.ts`)

```typescript
// GET /api/conversations/share?shareId=xyz
export async function GET(request: NextRequest) {
  const shareId = searchParams.get('shareId')
  const conversation = await getSharedConversation(shareId)

  return NextResponse.json({
    success: true,
    conversation
  })
}

// POST /api/conversations/share
export async function POST(request: NextRequest) {
  const shareId = crypto.randomUUID()
  await storeSharedConversation({ shareId, conversationData })

  return NextResponse.json({
    success: true,
    shareUrl: `${baseUrl}/share/rohith/${shareId}`
  })
}
```

## Testing Checklist

### Local Development
- [ ] Server starts: `npm run dev`
- [ ] API returns data: `curl http://localhost:3000/api/conversations/share?shareId=...`
- [ ] Meta tags present: `curl http://localhost:3000/share/rohith/... | grep "og:"`
- [ ] Test script passes: `./test-share-metadata.sh SHARE_ID`
- [ ] ngrok preview works: Test with Facebook debugger

### Production
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables set correctly
- [ ] Facebook debugger shows preview
- [ ] WhatsApp preview appears
- [ ] Twitter preview works
- [ ] Server logs show successful metadata generation

## Troubleshooting

### No preview in WhatsApp
1. Check if URL is HTTPS (required)
2. Test with Facebook debugger first
3. Clear WhatsApp cache (close and reopen chat)
4. Verify server logs show metadata generation
5. Check if image is accessible: `curl -I https://app.hnwichronicles.com/logo.png`

### Generic preview (not conversation-specific)
1. Check if conversation exists in MongoDB
2. Verify API endpoint returns conversation data
3. Check server logs for fetch errors
4. Ensure `dynamic = 'force-dynamic'` is set

### Image not showing
1. Verify logo.png exists in `/public/logo.png`
2. Check production URL is accessible
3. Image must be served over HTTPS
4. Recommended size: 1200x630px (current logo.png is 45KB)

## Environment Variables

### Required

```bash
# Production URL (used for metadata even in dev)
NEXT_PUBLIC_PRODUCTION_URL=https://app.hnwichronicles.com

# MongoDB connection
MONGODB_URI=mongodb+srv://...

# JWT for API authentication
JWT_SECRET=...
```

### Optional

```bash
# Base URLs for local dev
NEXT_PUBLIC_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:8000  # If backend is separate
```

## Common Commands

```bash
# Test locally
npm run dev
./test-share-metadata.sh YOUR_SHARE_ID

# Test with ngrok
ngrok http 3000

# Test API directly
curl "http://localhost:3000/api/conversations/share?shareId=YOUR_ID"

# View meta tags
curl http://localhost:3000/share/rohith/YOUR_ID | grep "og:"

# Test production image
curl -I https://app.hnwichronicles.com/logo.png

# Build for production
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

## Resources

- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Inspector**: https://www.linkedin.com/post-inspector/
- **Open Graph Protocol**: https://ogp.me/
- **ngrok**: https://ngrok.com/

## Support

For issues or questions:
1. Check `SOCIAL_SHARING_DEBUG.md` for troubleshooting
2. Review `LOCAL_SHARE_TESTING.md` for local testing
3. Run `./test-share-metadata.sh` to diagnose issues
4. Check server logs for error messages
