// app/api/developments/counts/route.ts
// Returns the count of HNWI World developments

import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export async function GET() {
  try {
    // Fetch development count from backend
    const response = await fetch(`${API_BASE_URL}/api/developments/count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always get fresh count
    });

    if (!response.ok) {
      // If backend endpoint doesn't exist or fails, return default
      return NextResponse.json({
        total_count: 1900,
        developments: {
          total_count: 1900
        }
      });
    }

    const data = await response.json();

    // Normalize the response format
    const count = data.count || data.total_count || data.total || 1900;

    return NextResponse.json({
      total_count: count,
      count: count,
      total: count,
      developments: {
        total_count: count
      }
    });
  } catch (error) {
    // Return default fallback on error
    return NextResponse.json({
      total_count: 1900,
      developments: {
        total_count: 1900
      }
    });
  }
}
