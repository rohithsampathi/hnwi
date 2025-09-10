// config/api.ts

// Centralized API configuration with URL protection
// Point to the actual backend API, not the frontend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hnwi-uwind-p8oqb.ondigitalocean.app"


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

// Get full URL for an API endpoint
export const getApiUrlForEndpoint = (endpoint: string): string => {
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

// Get base URL for client-side usage
export const getApiBaseUrl = (): string => {
  return API_BASE_URL;
}

