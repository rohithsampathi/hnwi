// config/api.ts

// Centralized API configuration with URL protection
// Use local Next.js API routes to avoid CORS issues with external backend
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_BASE_URL || "https://app.hnwichronicles.com"
  : "http://localhost:3000"

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

