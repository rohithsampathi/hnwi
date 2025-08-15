// config/api.ts

// Centralized API configuration with URL protection
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend"

// Helper to create safe error messages without URL exposure
export const createSafeApiError = (message: string, endpoint?: string): Error => {
  const safeEndpoint = endpoint 
    ? endpoint.replace(API_BASE_URL, '/api').replace(/https?:\/\/[^\/\s]+/g, '/api')
    : '/api';
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

