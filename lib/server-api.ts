// lib/server-api.ts
// Server-side only API client for Next.js API routes
// This file should NEVER be imported by client-side code

import { API_BASE_URL } from '@/config/api';

// Helper to forward cookies from Next.js request
function extractCookies(headers: Headers): string {
  const cookieHeader = headers.get('cookie');
  return cookieHeader || '';
}

// Server-side API client that calls the backend directly
// This avoids the double-proxy issue and keeps backend URL hidden
export const serverApi = {
  async get(endpoint: string, headers?: Headers): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward cookies if headers provided
    if (headers) {
      const cookies = extractCookies(headers);
      if (cookies) {
        requestHeaders['Cookie'] = cookies;
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: requestHeaders,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend request failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  },

  async post(endpoint: string, data: any, headers?: Headers): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward cookies if headers provided
    if (headers) {
      const cookies = extractCookies(headers);
      if (cookies) {
        requestHeaders['Cookie'] = cookies;
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend request failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  },

  async put(endpoint: string, data: any, headers?: Headers): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward cookies if headers provided
    if (headers) {
      const cookies = extractCookies(headers);
      if (cookies) {
        requestHeaders['Cookie'] = cookies;
      }
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: requestHeaders,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend request failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  },

  async delete(endpoint: string, headers?: Headers): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward cookies if headers provided
    if (headers) {
      const cookies = extractCookies(headers);
      if (cookies) {
        requestHeaders['Cookie'] = cookies;
      }
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers: requestHeaders,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend request failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  },
};

// Export a simpler version for API routes that just need to forward requests
export async function proxyToBackend(
  endpoint: string,
  options: {
    method: string;
    headers?: Headers;
    body?: any;
  }
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Forward cookies
  if (options.headers) {
    const cookies = extractCookies(options.headers);
    if (cookies) {
      requestHeaders['Cookie'] = cookies;
    }
  }

  const fetchOptions: RequestInit = {
    method: options.method,
    headers: requestHeaders,
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  return await fetch(url, fetchOptions);
}