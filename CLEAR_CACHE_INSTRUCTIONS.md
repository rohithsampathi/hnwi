# Clear Browser Cache to Fix "serviceworker" Error

The manifest.json file has been fixed on the server, but your browser has cached the old version. Follow these steps:

## Option 1: Clear Application Cache (RECOMMENDED)

1. Open Chrome DevTools (F12 or Cmd+Option+I)
2. Go to **Application** tab
3. In the left sidebar under "Storage":
   - Click **"Clear site data"** button
   - Check all boxes
   - Click "Clear site data"
4. In the left sidebar under "Service Workers":
   - Click **"Unregister"** on any registered workers
5. **Close DevTools**
6. **Hard refresh**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
7. **Reload page normally**: `Cmd+R` or `Ctrl+R`

## Option 2: Manual Service Worker Unregister

1. Open Console in DevTools
2. Paste and run:
```javascript
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
    console.log('Unregistered:', registration);
  }
}).then(() => {
  console.log('All service workers unregistered. Please refresh the page.');
});
```
3. Hard refresh: `Cmd+Shift+R` or `Ctrl+Shift+R`

## Option 3: Incognito/Private Window (FASTEST TEST)

1. Open a new **Incognito/Private window**
2. Navigate to `http://localhost:3000`
3. Errors should be gone (except Razorpay's EMPTY_WORDMARK and x-rtb-fingerprint-id)

## Expected Console Output After Fix

You should only see these **expected warnings** from Razorpay:
- ✅ `EMPTY_WORDMARK 404` - Harmless, no merchant logo configured
- ✅ `Refused to get unsafe header "x-rtb-fingerprint-id"` - Expected browser security

The **"serviceworker" must be a dictionary** error should be **completely gone**.

## Why This Happened

The browser aggressively caches manifest.json and service workers for PWA performance. The old manifest.json had an invalid "serviceworker" field that has now been removed, but your browser is still reading the cached version.

The middleware.ts now forces no-cache headers on manifest.json, so this won't happen again after the initial clear.
