// lib/mobile-api-wrapper.ts
// Mobile-optimized API request wrapper with retry logic
// Handles mobile-specific network issues and 500 errors

import { getDeviceInfo, requiresSpecialPostHandling } from './mobile-detection';

export interface MobileApiOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  skipRetryOn?: number[]; // HTTP status codes to not retry
}

const DEFAULT_OPTIONS: Required<MobileApiOptions> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeout: 30000, // 30 seconds
  skipRetryOn: [400, 401, 403, 404, 422], // Don't retry client errors
};

// Sleep utility for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if error is retryable
function isRetryableError(status: number, options: Required<MobileApiOptions>): boolean {
  // Don't retry if status is in skip list
  if (options.skipRetryOn.includes(status)) {
    return false;
  }

  // Retry on 500+ errors (server errors)
  if (status >= 500) {
    return true;
  }

  // Retry on 408 (Request Timeout) and 429 (Too Many Requests)
  if (status === 408 || status === 429) {
    return true;
  }

  return false;
}

// Mobile-optimized fetch with automatic retry
export async function mobileFetch(
  url: string,
  init?: RequestInit,
  options: MobileApiOptions = {}
): Promise<Response> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const device = getDeviceInfo();

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= opts.maxRetries) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout);

      // Mobile-specific headers
      const mobileHeaders: HeadersInit = {
        ...init?.headers,
        'X-Client-Type': device.isMobile ? 'mobile' : 'desktop',
        'X-Client-Platform': device.isIOS ? 'ios' : device.isAndroid ? 'android' : 'web',
      };

      // Special handling for POST on iOS Safari
      if (requiresSpecialPostHandling() && init?.method === 'POST') {
        // Add extra header to help backend identify mobile requests
        mobileHeaders['X-Mobile-Post'] = 'true';
      }

      const response = await fetch(url, {
        ...init,
        headers: mobileHeaders,
        signal: controller.signal,
        // Ensure credentials are included
        credentials: init?.credentials || 'include',
      });

      clearTimeout(timeoutId);

      // If response is OK or non-retryable error, return it
      if (response.ok || !isRetryableError(response.status, opts)) {
        return response;
      }

      // Store error for potential retry
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on network errors if we're on last attempt
      if (attempt === opts.maxRetries) {
        break;
      }
    }

    // Wait before retrying (exponential backoff)
    if (attempt < opts.maxRetries) {
      const delay = opts.retryDelay * Math.pow(2, attempt);
      await sleep(delay);
    }

    attempt++;
  }

  // All retries exhausted, throw last error
  throw lastError || new Error('Request failed after all retries');
}

// Wrapper for JSON API calls
export async function mobileApiCall<T = any>(
  url: string,
  init?: RequestInit,
  options?: MobileApiOptions
): Promise<T> {
  const response = await mobileFetch(url, init, options);

  if (!response.ok) {
    const errorText = await response.text();
    let errorData: any;

    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: errorText || 'Request failed', status: response.status };
    }

    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// POST wrapper with mobile optimizations
export async function mobilePost<T = any>(
  url: string,
  data: any,
  options?: MobileApiOptions
): Promise<T> {
  return mobileApiCall<T>(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    },
    options
  );
}

// GET wrapper with mobile optimizations
export async function mobileGet<T = any>(
  url: string,
  options?: MobileApiOptions
): Promise<T> {
  return mobileApiCall<T>(
    url,
    {
      method: 'GET',
      credentials: 'include',
    },
    options
  );
}
