// app/api/test-llm/route.ts
// Test endpoint for LLM integration

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the Anthropic client setup
    const { testAnthropicConnection, assignImageWithClaude } = await import('@/lib/anthropic-client');
    
    // Test basic connection
    const isConnected = await testAnthropicConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to Anthropic API',
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Test image assignment
    const testAssignment = await assignImageWithClaude(
      'Gold Bars Investment', 
      'Precious Metals', 
      '10kg of 24-karat gold bars stored in secure vault'
    );

    return NextResponse.json({
      success: true,
      connectionTest: 'passed',
      testAssignment: {
        input: {
          name: 'Gold Bars Investment',
          type: 'Precious Metals',
          description: '10kg of 24-karat gold bars stored in secure vault'
        },
        output: testAssignment
      },
      apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}