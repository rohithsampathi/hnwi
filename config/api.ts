// config/api.ts

// Centralized API configuration
// Backend URL is ONLY available server-side
// Client-side always uses relative URLs through Next.js API routes

// This should only be used in API routes, never in client code
export const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://hnwi-uwind-p8oqb.ondigitalocean.app"


// Helper to create safe error messages without URL exposure
export const createSafeApiError = (message: string, endpoint?: string): Error => {
  if (!endpoint) {
    return new Error(`API Error [/api]: ${message}`);
  }
  
  // Extract just the path part after the base URL
  let safeEndpoint = endpoint.replace(API_BASE_URL, '').replace(/https?:\/\/[^\/\s]+/g, '');
  
  // Ensure it starts with /api if it doesn't already
  if (!safeEndpoint.startsWith('/api')) {
    safeEndpoint = '/api' + (safeEndpoint.startsWith('/') ? safeEndpoint : '/' + safeEndpoint);
  }
  
  return new Error(`API Error [${safeEndpoint}]: ${message}`);
}

// Helper to log API errors safely (development only)
export const logSafeApiError = (message: string, endpoint?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    const safeEndpoint = endpoint 
      ? endpoint.replace(API_BASE_URL, '/api').replace(/https?:\/\/[^\/\s]+/g, '/api')
      : '/api';
    // Removed console.error to prevent any potential URL exposure
  }
}

// Get full URL for an API endpoint (server-side only)
export const getApiUrlForEndpoint = (endpoint: string): string => {
  if (typeof window !== 'undefined') {
    throw new Error('getApiUrlForEndpoint should not be called from client-side code');
  }
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

// Get base URL (server-side only)
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    throw new Error('getApiBaseUrl should not be called from client-side code');
  }
  return API_BASE_URL;
}

