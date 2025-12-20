#!/bin/bash

# Test WhatsApp OG Image Preview Fix
# Run this after deployment to verify the fix

echo "🔍 Testing WhatsApp OG Image Preview Fix"
echo "========================================="

URL="https://app.hnwichronicles.com"

echo ""
echo "📋 Checking OG meta tags on production..."
echo ""

# Fetch and check OG image meta tag
OG_IMAGE=$(curl -s "$URL" | grep -oE '<meta property="og:image" content="[^"]+' | sed 's/.*content="//')

if [ -n "$OG_IMAGE" ]; then
    echo "✅ OG Image found: $OG_IMAGE"

    # Check if it's using logo.png with updated cache bust
    if [[ "$OG_IMAGE" == *"logo.png?v=20241220c"* ]]; then
        echo "✅ Using correct logo.png with cache-busting version"
    else
        echo "⚠️  Not using expected cache-busting version (v=20241220c)"
    fi

    # Check dimensions
    WIDTH=$(curl -s "$URL" | grep -oE '<meta property="og:image:width" content="[^"]+' | sed 's/.*content="//')
    HEIGHT=$(curl -s "$URL" | grep -oE '<meta property="og:image:height" content="[^"]+' | sed 's/.*content="//')

    if [ "$WIDTH" == "1024" ] && [ "$HEIGHT" == "1024" ]; then
        echo "✅ Correct dimensions: 1024x1024"
    else
        echo "⚠️  Unexpected dimensions: ${WIDTH}x${HEIGHT}"
    fi

    # Test if image is accessible
    echo ""
    echo "📥 Testing image accessibility..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$OG_IMAGE")

    if [ "$HTTP_STATUS" == "200" ]; then
        echo "✅ Image is accessible (HTTP $HTTP_STATUS)"
    else
        echo "❌ Image is not accessible (HTTP $HTTP_STATUS)"
    fi
else
    echo "❌ OG Image meta tag not found!"
fi

echo ""
echo "🔧 WhatsApp Testing Instructions:"
echo "================================="
echo "1. Share this URL in WhatsApp: $URL"
echo "2. Wait 5-10 seconds for preview to load"
echo "3. The logo should appear as a 1024x1024 image"
echo ""
echo "If preview doesn't update immediately:"
echo "  • Clear WhatsApp cache: Settings > Storage > Clear Cache"
echo "  • Or wait 24 hours for WhatsApp's cache to refresh"
echo "  • The cache-busting parameter (v=20241220c) helps force refresh"
echo ""
echo "📝 Summary of changes:"
echo "  • Using logo.png (1024x1024) as requested"
echo "  • Cache-busting version updated to v=20241220c"
echo "  • Applied to all pages with OG meta tags"