// app/api/crown-vault/assign-image/route.ts
// Server-side API route for LLM-powered image assignment

import { NextRequest, NextResponse } from 'next/server';
import { assignImageWithClaude, testAnthropicConnection } from '@/lib/anthropic-client';
import { ASSET_IMAGE_MAP } from '@/lib/asset-images';

// Generate optimized image URL
const generateImageUrl = (unsplashId: string, width = 600, height = 400): string => {
  return `https://images.unsplash.com/${unsplashId}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=${width}&h=${height}&q=80`;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetName, assetType, assetDescription } = body;

    // Validate required fields
    if (!assetName || !assetType) {
      return NextResponse.json(
        { error: 'Asset name and type are required' },
        { status: 400 }
      );
    }

    // Assign image category using Claude
    const imageCategory = await assignImageWithClaude(assetName, assetType, assetDescription);
    
    // Get image configuration
    const config = ASSET_IMAGE_MAP[imageCategory] || ASSET_IMAGE_MAP.default;
    
    // Return image assignment
    const imageAssignment = {
      imageId: imageCategory,
      imageUrl: generateImageUrl(config.unsplashId),
      altText: config.alt,
      confidence: 0.95,
      assignedBy: 'claude-sonnet'
    };

    return NextResponse.json({
      success: true,
      assignment: imageAssignment
    });

  } catch (error) {
    // Return fallback assignment on error
    const fallbackConfig = ASSET_IMAGE_MAP.default;
    const fallbackAssignment = {
      imageId: 'default',
      imageUrl: generateImageUrl(fallbackConfig.unsplashId),
      altText: fallbackConfig.alt,
      confidence: 0.5,
      assignedBy: 'fallback',
      error: 'LLM assignment failed, using fallback'
    };

    return NextResponse.json({
      success: false,
      assignment: fallbackAssignment,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  try {
    const isConnected = await testAnthropicConnection();
    
    return NextResponse.json({
      status: 'healthy',
      anthropicConnected: isConnected,
      availableCategories: Object.keys(ASSET_IMAGE_MAP).length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      anthropicConnected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}