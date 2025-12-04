// Comprehensive error suppression for Razorpay and service worker errors
// This script runs before any other scripts to catch all errors

(function suppressAllKnownErrors() {
  'use strict';

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
    if (e.reason && typeof e.reason === 'string') {
      const message = e.reason.toLowerCase();
      if (SUPPRESS_PATTERNS.some(pattern => message.includes(pattern.toLowerCase()))) {
        e.preventDefault();
        return false;
      }
    }
  });

  console.log('[Error Suppression] Razorpay and service worker errors will be hidden');
})();
