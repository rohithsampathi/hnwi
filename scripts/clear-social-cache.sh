#!/bin/bash
# Script to clear social media OG meta tag cache
# Run this after deploying OG tag updates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_URL="${1:-https://app.hnwichronicles.com}"
FB_ACCESS_TOKEN="${FB_ACCESS_TOKEN:-}"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Social Media Cache Clear Tool${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# URLs to refresh
URLS=(
  "$PRODUCTION_URL"
  "$PRODUCTION_URL/simulation"
  "$PRODUCTION_URL/shared-results/example"
  "$PRODUCTION_URL/share/opportunity/example"
)

echo -e "${YELLOW}Target URLs:${NC}"
for url in "${URLS[@]}"; do
  echo "  - $url"
done
echo ""

# 1. Facebook/Meta Scraper
echo -e "${BLUE}[1/3] Triggering Facebook/WhatsApp/Instagram Scraper...${NC}"
for url in "${URLS[@]}"; do
  echo -e "  Scraping: ${YELLOW}$url${NC}"

  # Try with access token first
  if [ -n "$FB_ACCESS_TOKEN" ]; then
    response=$(curl -s -X POST \
      "https://graph.facebook.com/?id=${url}&scrape=true&access_token=${FB_ACCESS_TOKEN}")

    if echo "$response" | grep -q "error"; then
      echo -e "  ${RED}✗ Failed with token (may be expired)${NC}"
    else
      echo -e "  ${GREEN}✓ Success (with token)${NC}"
    fi
  else
    # Fallback: Try without token (may have rate limits)
    response=$(curl -s -X POST "https://graph.facebook.com/?id=${url}&scrape=true")

    if echo "$response" | grep -q "error"; then
      echo -e "  ${YELLOW}⚠ No access token - use manual tool${NC}"
      echo -e "  ${BLUE}→ https://developers.facebook.com/tools/debug/?q=${url}${NC}"
    else
      echo -e "  ${GREEN}✓ Success (without token)${NC}"
    fi
  fi

  sleep 1
done
echo ""

# 2. LinkedIn Post Inspector
echo -e "${BLUE}[2/3] LinkedIn Cache Info...${NC}"
echo -e "  ${YELLOW}⚠ LinkedIn requires manual refresh${NC}"
echo -e "  ${BLUE}→ https://www.linkedin.com/post-inspector/${NC}"
echo -e "  Paste each URL and click 'Inspect'"
echo ""

# 3. Twitter/X Card Validator
echo -e "${BLUE}[3/3] Twitter/X Card Info...${NC}"
echo -e "  ${YELLOW}⚠ Twitter requires manual refresh${NC}"
echo -e "  ${BLUE}→ https://cards-dev.twitter.com/validator${NC}"
echo -e "  Paste each URL and click 'Preview card'"
echo ""

# 4. Open debugging tools in browser
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Opening debugging tools...${NC}"
echo ""

# Open Facebook debugger for main URL
if command -v open &> /dev/null; then
  echo -e "Opening Facebook Debugger..."
  open "https://developers.facebook.com/tools/debug/?q=${PRODUCTION_URL}"
  sleep 2

  echo -e "Opening LinkedIn Post Inspector..."
  open "https://www.linkedin.com/post-inspector/"
fi

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Next Steps:${NC}"
echo -e "${YELLOW}1.${NC} Facebook Debugger opened - Click 'Scrape Again' for each URL"
echo -e "${YELLOW}2.${NC} LinkedIn Post Inspector opened - Paste URLs and click 'Inspect'"
echo -e "${YELLOW}3.${NC} Twitter Card Validator: ${BLUE}https://cards-dev.twitter.com/validator${NC}"
echo ""
echo -e "${YELLOW}Tip:${NC} Set FB_ACCESS_TOKEN env var for automated Facebook scraping:"
echo -e "   ${BLUE}export FB_ACCESS_TOKEN='your-token'${NC}"
echo -e "   ${BLUE}./scripts/clear-social-cache.sh${NC}"
echo ""
echo -e "${GREEN}Cache clearing initiated!${NC}"
echo -e "${BLUE}================================${NC}"
