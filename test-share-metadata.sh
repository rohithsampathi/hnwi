#!/bin/bash

# Test script for Ask Rohith share URL metadata
# Usage: ./test-share-metadata.sh [shareId]

SHARE_ID=${1:-"test-share-id"}
BASE_URL="http://localhost:3000"

echo "🧪 Testing Ask Rohith Share Metadata"
echo "======================================"
echo ""
echo "Share ID: $SHARE_ID"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Check if dev server is running
echo "1️⃣  Checking if dev server is running..."
if curl -s -f -o /dev/null "$BASE_URL"; then
    echo "   ✅ Dev server is running at $BASE_URL"
else
    echo "   ❌ Dev server not responding. Run 'npm run dev' first!"
    exit 1
fi
echo ""

# Test 2: Check API endpoint
echo "2️⃣  Testing API endpoint..."
API_URL="$BASE_URL/api/conversations/share?shareId=$SHARE_ID"
API_RESPONSE=$(curl -s "$API_URL")
echo "   URL: $API_URL"

if echo "$API_RESPONSE" | grep -q "\"success\":true"; then
    echo "   ✅ API returned conversation data"
    echo "   Response preview:"
    echo "$API_RESPONSE" | jq -r '.conversation.title' 2>/dev/null | sed 's/^/      Title: /'
elif echo "$API_RESPONSE" | grep -q "error"; then
    echo "   ⚠️  API returned error (this is OK if shareId doesn't exist):"
    echo "$API_RESPONSE" | jq -r '.error' 2>/dev/null | sed 's/^/      /'
else
    echo "   ❌ Unexpected API response"
fi
echo ""

# Test 3: Check meta tags in HTML
echo "3️⃣  Checking meta tags in page HTML..."
SHARE_URL="$BASE_URL/share/rohith/$SHARE_ID"
HTML_RESPONSE=$(curl -s "$SHARE_URL")

echo "   URL: $SHARE_URL"

# Check for og:title
if echo "$HTML_RESPONSE" | grep -q 'property="og:title"'; then
    OG_TITLE=$(echo "$HTML_RESPONSE" | grep 'property="og:title"' | sed -n 's/.*content="\([^"]*\)".*/\1/p' | head -1)
    echo "   ✅ og:title found: $OG_TITLE"
else
    echo "   ❌ og:title NOT found"
fi

# Check for og:description
if echo "$HTML_RESPONSE" | grep -q 'property="og:description"'; then
    OG_DESC=$(echo "$HTML_RESPONSE" | grep 'property="og:description"' | sed -n 's/.*content="\([^"]*\)".*/\1/p' | head -1)
    echo "   ✅ og:description found: ${OG_DESC:0:50}..."
else
    echo "   ❌ og:description NOT found"
fi

# Check for og:image
if echo "$HTML_RESPONSE" | grep -q 'property="og:image"'; then
    OG_IMAGE=$(echo "$HTML_RESPONSE" | grep 'property="og:image"' | sed -n 's/.*content="\([^"]*\)".*/\1/p' | head -1)
    echo "   ✅ og:image found: $OG_IMAGE"

    # Test if image is accessible
    if curl -s -f -o /dev/null -I "$OG_IMAGE"; then
        echo "      ✅ Image is accessible"
    else
        echo "      ⚠️  Image URL returned error (check if production URL is correct)"
    fi
else
    echo "   ❌ og:image NOT found"
fi

# Check for twitter:card
if echo "$HTML_RESPONSE" | grep -q 'name="twitter:card"'; then
    TWITTER_CARD=$(echo "$HTML_RESPONSE" | grep 'name="twitter:card"' | sed -n 's/.*content="\([^"]*\)".*/\1/p' | head -1)
    echo "   ✅ twitter:card found: $TWITTER_CARD"
else
    echo "   ❌ twitter:card NOT found"
fi

echo ""
echo "======================================"
echo ""

# Summary
echo "📊 Summary:"
echo ""
if echo "$HTML_RESPONSE" | grep -q 'property="og:title"' && \
   echo "$HTML_RESPONSE" | grep -q 'property="og:description"' && \
   echo "$HTML_RESPONSE" | grep -q 'property="og:image"'; then
    echo "✅ All meta tags are present!"
    echo ""
    echo "Next steps:"
    echo "1. Test with ngrok: ngrok http 3000"
    echo "2. Use Facebook debugger: https://developers.facebook.com/tools/debug/"
    echo "3. Test share URL in WhatsApp"
else
    echo "⚠️  Some meta tags are missing. Check the issues above."
    echo ""
    echo "Common fixes:"
    echo "- Ensure NEXT_PUBLIC_PRODUCTION_URL is set in .env.local"
    echo "- Check server logs for errors (npm run dev terminal)"
    echo "- Verify MongoDB connection is working"
fi

echo ""
