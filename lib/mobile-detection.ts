// lib/mobile-detection.ts
// Mobile device detection and optimization utilities
// Provides SOTA mobile-specific handling

export interface DeviceInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  supportsServiceWorker: boolean;
  supportsPWA: boolean;
}

// Detect device type and capabilities
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      isSafari: false,
      isChrome: false,
      supportsServiceWorker: false,
      supportsPWA: false,
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);

  return {
    isMobile,
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    supportsServiceWorker: 'serviceWorker' in navigator,
    supportsPWA: 'serviceWorker' in navigator && 'PushManager' in window,
  };
}

// Check if device has mobile-specific cookie limitations
export function hasMobileCookieLimitations(): boolean {
  const device = getDeviceInfo();

  // iOS Safari has strict cookie limitations
  // - 4KB cookie size limit per cookie
  // - SameSite=Lax default (requires SameSite=None; Secure for cross-site)
  if (device.isIOS && device.isSafari) {
    return true;
  }

  return false;
}

// Check if device requires special handling for POST requests
export function requiresSpecialPostHandling(): boolean {
  const device = getDeviceInfo();

  // iOS Safari sometimes has issues with service worker POST interception
  if (device.isIOS && device.isSafari) {
    return true;
  }

  return false;
}

// Get optimal cache strategy for device
export function getOptimalCacheStrategy(): 'aggressive' | 'balanced' | 'minimal' {
  const device = getDeviceInfo();

  // iOS has limited storage, use minimal caching
  if (device.isIOS) {
    return 'minimal';
  }

  // Android can handle more aggressive caching
  if (device.isAndroid) {
    return 'balanced';
  }

  // Desktop can be aggressive
  return 'aggressive';
}

// Check if device supports advanced PWA features
export function supportsAdvancedPWA(): boolean {
  const device = getDeviceInfo();

  return device.supportsPWA && !device.isIOS; // iOS has limited PWA support
}

// Log device capabilities for debugging (disabled in production)
export function logDeviceCapabilities(): void {
  // Logging disabled for production
  return;
}
