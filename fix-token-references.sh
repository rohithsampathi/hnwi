#!/bin/bash

# Script to systematically remove all token references from the codebase
# Replacing with cookie-based authentication

echo "🔧 Starting systematic token reference removal..."

# 1. Fix app-wrapper.tsx
echo "Fixing app-wrapper.tsx..."
sed -i '' 's/const token = localStorage\.getItem("token");/\/\/ Cookies handle auth now/g' components/app-wrapper.tsx
sed -i '' 's/const hasToken = localStorage\.getItem("token");/const hasAuth = isAuthenticated();/g' components/app-wrapper.tsx
sed -i '' 's/const tempToken = localStorage\.getItem("token");/\/\/ No token checks needed/g' components/app-wrapper.tsx
sed -i '' 's/localStorage\.setItem("token", "recovered-session-token");/\/\/ Cookies handle auth/g' components/app-wrapper.tsx

# 2. Fix app-shell.tsx
echo "Fixing app-shell.tsx..."
sed -i '' 's/localStorage\.setItem("token", userData\.token)/\/\/ Cookies handle auth/g' components/app-shell.tsx
sed -i '' 's/localStorage\.setItem("token", "session-token-.*")/\/\/ No fake tokens needed/g' components/app-shell.tsx
sed -i '' 's/localStorage\.setItem("token", result\.token)/\/\/ Backend sets cookies/g' components/app-shell.tsx

# 3. Fix auth-popup.tsx
echo "Fixing auth-popup.tsx..."
sed -i '' 's/localStorage\.setItem.*token.*access_token.*/\/\/ Backend sets httpOnly cookies/g' components/auth-popup.tsx

# 4. Fix quick-login.tsx
echo "Fixing quick-login.tsx..."
sed -i '' 's/localStorage\.setItem.*token.*response\.token.*/\/\/ Backend sets httpOnly cookies/g' components/quick-login.tsx

# 5. Fix playbook pages
echo "Fixing playbook pages..."
sed -i '' 's/let token = localStorage\.getItem("token");/\/\/ Auth via cookies/g' components/pages/playbooks-page.tsx
sed -i '' 's/const token = localStorage\.getItem("token")/\/\/ Auth via cookies/g' components/pages/playbook-page.tsx

# 6. Fix auth-provider.tsx
echo "Fixing auth-provider.tsx..."
sed -i '' 's/const token = localStorage\.getItem.*token.*/\/\/ Auth checked via cookies/g' components/auth-provider.tsx

# 7. Fix page-old.tsx
echo "Fixing page-old.tsx..."
sed -i '' 's/const token = localStorage\.getItem("token");/\/\/ Auth via cookies/g' app/page-old.tsx

# 8. Fix app-content.tsx remaining references
echo "Fixing app-content.tsx..."
sed -i '' 's/localStorage\.setItem("token", .*);/\/\/ Cookies handle auth/g' components/app-content.tsx

# 9. Fix splash-screen.tsx remaining references
echo "Fixing splash-screen.tsx..."
sed -i '' 's/localStorage\.setItem("token", .*);/\/\/ Backend sets cookies/g' components/splash-screen.tsx

echo "✅ Token reference removal complete!"
echo "🔍 Checking for any remaining token references..."

# Check for any remaining references
echo "Remaining localStorage token references:"
grep -n "localStorage.*token" components/*.tsx app/*.tsx lib/**/*.ts 2>/dev/null | grep -v "\/\/" | head -20

echo "🎉 Systematic fix complete!"