// lib/secure-api.ts

// Security wrapper for API calls to prevent URL exposure in console logs
import { API_BASE_URL } from "@/config/api";

interface SecureFetchOptions extends RequestInit {
  timeout?: number;
}

class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class SecureAPI {
  private static logSafeError(endpoint: string, status?: number, error?: string): void {
    // Log without exposing full URLs - only show endpoint paths
    const safeEndpoint = endpoint.replace(API_BASE_URL, '/api').replace(/https?:\/\/[^\/]+/, '/api');
    // Don't log in production to avoid any URL exposure in browser console
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error: ${safeEndpoint} - Status: ${status || 'Unknown'} - ${error || 'Request failed'}`);
    }
  }

  static async secureFetch(
    endpoint: string,
    options: SecureFetchOptions = {}
  ): Promise<Response> {
    const { timeout = 30000, ...fetchOptions } = options;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(endpoint, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logSafeError(endpoint, response.status, `HTTP ${response.status}`);
        throw new APIError(
          `Request failed with status ${response.status}`,
          response.status,
          endpoint
        );
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        this.logSafeError(endpoint, undefined, 'Request timeout');
        throw new APIError('Request timeout', 408, endpoint);
      }

      // For CORS and network errors, don't expose the URL
      this.logSafeError(endpoint, undefined, 'Network error (possibly CORS)');
      throw new APIError('Network error', 0, endpoint);
    }
  }

  static async secureJsonFetch<T = any>(
    endpoint: string,
    options: SecureFetchOptions = {}
  ): Promise<T> {
    try {
      const response = await this.secureFetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      this.logSafeError(endpoint, undefined, 'Failed to parse JSON response');
      throw new APIError('Invalid response format', 422, endpoint);
    }
  }

  static buildUrl(path: string, params?: Record<string, string>): string {
    const url = `${API_BASE_URL}${path}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      return `${url}?${searchParams.toString()}`;
    }
    return url;
  }
}

// Create a safe error message that doesn't expose the URL
const createSecureError = (message: string, statusCode?: number): Error => {
  const secureMessage = `API Error: ${message}${statusCode ? ` (${statusCode})` : ''}`;
  const error = new Error(secureMessage);
  // Ensure no URL leaks in stack traces
  if (error.stack) {
    error.stack = error.stack.replace(/https?:\/\/[^\/\s]+/g, '[REDACTED]');
  }
  return error;
};

// Secure fetch wrapper
export const secureApiCall = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return response;
  } catch (error) {
    // Don't expose the actual URL in error messages
    throw createSecureError('Connection failed', 0);
  }
};

// Secure API methods
export const secureApi = {
  async post(endpoint: string, data: any): Promise<any> {
    try {
      const response = await secureApiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw createSecureError('Request failed', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw createSecureError('Unknown error occurred');
    }
  },

  async get(endpoint: string): Promise<any> {
    try {
      const response = await secureApiCall(endpoint, {
        method: 'GET',
      });

      if (!response.ok) {
        throw createSecureError('Request failed', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw createSecureError('Unknown error occurred');
    }
  },

  async put(endpoint: string, data: any): Promise<any> {
    try {
      const response = await secureApiCall(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw createSecureError('Request failed', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw createSecureError('Unknown error occurred');
    }
  }
};

// Export helper functions for backward compatibility
export const secureFetch = SecureAPI.secureFetch.bind(SecureAPI);
export const secureJsonFetch = SecureAPI.secureJsonFetch.bind(SecureAPI);
export const buildApiUrl = SecureAPI.buildUrl.bind(SecureAPI);

// Export only secure methods, not the base URL
export default secureApi;