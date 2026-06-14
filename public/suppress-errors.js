// Comprehensive error suppression for Razorpay and service worker errors
// This script runs before any other scripts to catch all errors

(function suppressAllKnownErrors() {
  'use strict';

  const NEXT_CHUNK_RECOVERY_KEY = 'hnwi:next-webpack-runtime-recovery:v1';

  function isNextChunkRuntimeMismatch(message, source) {
    const normalizedMessage = String(message || '').toLowerCase();
    const normalizedSource = String(source || '').toLowerCase();

    return (
      normalizedMessage.includes("cannot read properties of undefined (reading 'call')") &&
      (
        normalizedSource.includes('/_next/static/chunks/') ||
        normalizedMessage.includes('webpack') ||
        normalizedMessage.includes('app-pages-browser')
      )
    );
  }

  function getSessionFlag(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function setSessionFlag(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // Ignore storage failures; the fallback still tries a reload.
    }
  }

  function removeSessionFlag(key) {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore storage failures.
    }
  }

  async function clearClientRuntimeCaches() {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
    } catch {
      // Continue with cache cleanup and reload.
    }

    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }
    } catch {
      // Reload is still useful even if cache deletion is blocked.
    }
  }

  function recoverFromNextChunkRuntimeMismatch(event) {
    const source = event && (event.filename || event.source || event.target?.src || event.target?.href);
    const message = event && (event.message || event.reason?.message || event.reason || '');

    if (!isNextChunkRuntimeMismatch(message, source)) {
      return false;
    }

    if (getSessionFlag(NEXT_CHUNK_RECOVERY_KEY) === 'attempted') {
      return false;
    }

    setSessionFlag(NEXT_CHUNK_RECOVERY_KEY, 'attempted');

    if (event?.preventDefault) event.preventDefault();
    if (event?.stopPropagation) event.stopPropagation();

    const recoveryNotice = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,sans-serif;background:#fff;color:#111"><div style="max-width:420px;padding:24px;text-align:center"><p style="font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#8a6d1d;margin:0 0 12px">Refreshing Memo Runtime</p><h1 style="font-size:24px;line-height:1.25;margin:0 0 12px">Updating the report viewer</h1><p style="font-size:14px;line-height:1.6;color:#555;margin:0">The page is clearing an older browser cache and reloading the current memo surface.</p></div></div>';

    try {
      if (document.body) {
        document.body.innerHTML = recoveryNotice;
      } else {
        document.addEventListener('DOMContentLoaded', function renderRecoveryNotice() {
          document.body.innerHTML = recoveryNotice;
        }, { once: true });
      }
    } catch {
      // Continue with reload.
    }

    clearClientRuntimeCaches().finally(function reloadAfterRuntimeRecovery() {
      window.location.reload();
    });

    return true;
  }

  window.addEventListener('load', function clearSuccessfulRuntimeRecoveryFlag() {
    window.setTimeout(function clearFlagAfterStableLoad() {
      removeSessionFlag(NEXT_CHUNK_RECOVERY_KEY);
    }, 5000);
  });

  // List of error patterns to suppress
  const SUPPRESS_PATTERNS = [
    'EMPTY_WORDMARK',
    'x-rtb-fingerprint-id',
    'serviceworker',
    'service worker',
    'Refused to get unsafe header',
    'Failed to load resource: the server responded with a status of 404 (Not Found)',
  ];

  // Override console.error
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ').toLowerCase();
    if (SUPPRESS_PATTERNS.some(pattern => message.includes(pattern.toLowerCase()))) {
      return; // Suppress
    }
    originalError.apply(console, args);
  };

  // Override console.warn
  const originalWarn = console.warn;
  console.warn = function(...args) {
    const message = args.join(' ').toLowerCase();
    if (SUPPRESS_PATTERNS.some(pattern => message.includes(pattern.toLowerCase()))) {
      return; // Suppress
    }
    originalWarn.apply(console, args);
  };

  // Suppress network errors (404s, etc.)
  window.addEventListener('error', function(e) {
    if (recoverFromNextChunkRuntimeMismatch(e)) {
      return false;
    }

    // Check if it's a resource loading error
    if (e.target && (e.target.src || e.target.href)) {
      const url = (e.target.src || e.target.href).toLowerCase();
      if (SUPPRESS_PATTERNS.some(pattern => url.includes(pattern.toLowerCase()))) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    // Check error message
    if (e.message) {
      const message = e.message.toLowerCase();
      if (SUPPRESS_PATTERNS.some(pattern => message.includes(pattern.toLowerCase()))) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  }, true);

  // Intercept XHR errors (Razorpay uses XHR for API calls)
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._url = url;
    return originalOpen.apply(this, [method, url, ...args]);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    const xhr = this;
    const originalOnError = xhr.onerror;
    const originalOnLoad = xhr.onload;
    const originalOnReadyStateChange = xhr.onreadystatechange;

    // Suppress error logging for known patterns
    xhr.addEventListener('error', function(e) {
      if (xhr._url && SUPPRESS_PATTERNS.some(pattern =>
        xhr._url.toLowerCase().includes(pattern.toLowerCase())
      )) {
        e.stopPropagation();
        return;
      }
    }, true);

    // Suppress error logging for 404s on known URLs
    xhr.addEventListener('load', function(e) {
      if (xhr._url && xhr.status === 404 && SUPPRESS_PATTERNS.some(pattern =>
        xhr._url.toLowerCase().includes(pattern.toLowerCase())
      )) {
        // Suppress console output for this 404
        const originalLog = console.log;
        console.log = function() {};
        setTimeout(() => { console.log = originalLog; }, 0);
      }
    }, true);

    return originalSend.apply(this, args);
  };

  // Suppress unhandled promise rejections related to these patterns
  window.addEventListener('unhandledrejection', function(e) {
    if (recoverFromNextChunkRuntimeMismatch(e)) {
      return false;
    }

    if (e.reason && typeof e.reason === 'string') {
      const message = e.reason.toLowerCase();
      if (SUPPRESS_PATTERNS.some(pattern => message.includes(pattern.toLowerCase()))) {
        e.preventDefault();
        return false;
      }
    }
  });

  // Silent - errors suppressed
})();
