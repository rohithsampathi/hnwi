// Diagnostic endpoint to check environment variables
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    apiBaseUrl: process.env.API_BASE_URL || 'NOT SET',
    hasEnvLocal: process.env.API_BASE_URL ? 'YES' : 'NO',
    timestamp: new Date().toISOString(),
  });
}
