import { NextRequest, NextResponse } from 'next/server';
import { validateInput, queryParamSchema } from '@/lib/validation';
import { logger } from '@/lib/secure-logger';
import { ApiAuth } from '@/lib/api-auth';

// This endpoint returns raw MongoDB data with elite_pulse_impact and tags
// Unlike /assets/detailed which calls external backend, this reads directly from MongoDB
export const GET = ApiAuth.withAuth(async (request: NextRequest, user) => {
  try {
    // Validate request size
    if (!ApiAuth.validateRequestSize(request)) {
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryValidation = validateInput(queryParamSchema, {
      owner_id: searchParams.get('owner_id')
    });
    
    if (!queryValidation.success) {
      logger.warn("MongoDB assets GET validation failed", { 
        errors: queryValidation.errors,
        userId: user.id
      });
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.errors },
        { status: 400 }
      );
    }

    const { owner_id: ownerId } = queryValidation.data!;
    
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    // Validate ownership
    if (user.id !== ownerId && user.role !== 'admin') {
      logger.warn("Unauthorized MongoDB asset access attempt", {
        userId: user.id,
        requestedOwnerId: ownerId
      });
      return NextResponse.json(
        { error: 'Unauthorized - can only access own assets' },
        { status: 403 }
      );
    }

    // TODO: Replace with actual MongoDB connection
    // For now, return the sample data you provided
    // In production, this would connect to MongoDB and query:
    // db.vault_assets.find({ owner_id: ownerId })
    
    const mockMongoData = [
      {
        "_id": "6895e0fe3aa803939c610149",
        "owner_id": ownerId,
        "unit_count": 3.0,
        "unit_type": "acres",
        "cost_per_unit": 80000.0,
        "created_at": "2025-08-08T11:35:26.126000",
        "updated_at": "2025-08-08T11:35:26.126000",
        "elite_pulse_impact": {
          "generation_id": "test_gen_123",
          "analyzed_at": "2025-09-02T01:15:43.936000",
          "asset_type": "acres",
          "risk_level": "HIGH",
          "risk_badge_color": "red",
          "key_concern": "Potential 15-25% value erosion due to Indian regulatory changes on precious metals holdings and export restrictions",
          "action_timeline": "30 days",
          "confidence_score": 0.92,
          "katherine_conviction": "HIGH",
          "hover_summary": "acres asset exposure: Potential 15-25% value erosion due to Indian regulatory changes on precious metals holdings and expo Opportunity: Emergency Geographic Diversification Protocol",
          "whisper_intelligence": "The families who moved first in 2024 are now acquiring distressed assets from those who waited - you",
          "ui_display": {
            "badge_text": "HIGH RISK",
            "tooltip_title": "Elite Pulse Impact: acres",
            "risk_indicator": "HIGH",
            "action_needed": "30 days",
            "concern_summary": "Potential 15-25% value erosion due to Indian regulatory changes on precious metals holdings and export restrictions"
          }
        },
        "tags": [
          {
            "tags": [
              "Multiple Units",
              "Recent",
              "Single Heir",
              "Medium Value",
              "acres"
            ],
            "generated_at": "2025-09-04T08:20:59.678000",
            "generation_id": "initial_tags_1756954259",
            "version": "v1.0",
            "source": "MoE_v4_generation"
          }
        ]
      },
      {
        "_id": "6895e0ff3aa803939c61014b",
        "owner_id": ownerId,
        "unit_count": 450.0,
        "unit_type": "shares",
        "cost_per_unit": 195.0,
        "created_at": "2025-08-08T11:35:27.128000",
        "updated_at": "2025-08-08T11:35:27.128000",
        "elite_pulse_impact": {
          "generation_id": "test_gen_123",
          "analyzed_at": "2025-09-02T01:15:43.984000",
          "asset_type": "shares",
          "risk_level": "LOW",
          "risk_badge_color": "green",
          "key_concern": "Market volatility and sector rotation concerns",
          "action_timeline": "90 days for review",
          "confidence_score": 0.92,
          "katherine_conviction": "HIGH",
          "hover_summary": "shares asset exposure: Market volatility and sector rotation concerns Opportunity: Emergency Geographic Diversification Protocol",
          "whisper_intelligence": "The families who moved first in 2024 are now acquiring distressed assets from those who waited - you",
          "ui_display": {
            "badge_text": "STABLE",
            "tooltip_title": "Elite Pulse Impact: shares",
            "risk_indicator": "LOW",
            "action_needed": "90 days for review",
            "concern_summary": "Market volatility and sector rotation concerns"
          }
        },
        "tags": [
          {
            "tags": [
              "Standard Value",
              "Multiple Units",
              "Recent",
              "Single Heir",
              "shares"
            ],
            "generated_at": "2025-09-04T08:20:59.706000",
            "generation_id": "initial_tags_1756954259",
            "version": "v1.0",
            "source": "MoE_v4_generation"
          }
        ]
      },
      {
        "_id": "6895e1003aa803939c61014d",
        "owner_id": ownerId,
        "unit_count": 3.0,
        "unit_type": "units",
        "cost_per_unit": 85000.0,
        "created_at": "2025-08-08T11:35:29.047000",
        "updated_at": "2025-08-08T11:35:29.047000",
        "elite_pulse_impact": {
          "generation_id": "test_gen_123",
          "analyzed_at": "2025-09-02T01:15:44.077000",
          "asset_type": "units",
          "risk_level": "MEDIUM",
          "risk_badge_color": "orange",
          "key_concern": "Regulatory changes affecting unit valuations",
          "action_timeline": "60 days for restructuring",
          "confidence_score": 0.92,
          "katherine_conviction": "HIGH",
          "hover_summary": "units asset exposure: Regulatory changes affecting unit valuations Opportunity: Emergency Geographic Diversification Protocol",
          "whisper_intelligence": "The families who moved first in 2024 are now acquiring distressed assets from those who waited - you",
          "ui_display": {
            "badge_text": "REGULATORY RISK",
            "tooltip_title": "Elite Pulse Impact: units",
            "risk_indicator": "MEDIUM",
            "action_needed": "60 days for restructuring",
            "concern_summary": "Regulatory changes affecting unit valuations"
          }
        },
        "tags": [
          {
            "tags": [
              "Multiple Units",
              "units",
              "Recent",
              "Single Heir",
              "Medium Value"
            ],
            "generated_at": "2025-09-04T08:20:59.746000",
            "generation_id": "initial_tags_1756954259",
            "version": "v1.0",
            "source": "MoE_v4_generation"
          }
        ]
      },
      {
        "_id": "6895e1013aa803939c610150",
        "owner_id": ownerId,
        "unit_count": 150.0,
        "unit_type": "kg",
        "cost_per_unit": 65000.0,
        "created_at": "2025-08-08T11:35:29.856000",
        "updated_at": "2025-08-15T06:21:26.072000",
        "elite_pulse_impact": {
          "generation_id": "test_gen_123",
          "analyzed_at": "2025-09-02T01:15:44.123000",
          "asset_type": "kg",
          "risk_level": "HIGH",
          "risk_badge_color": "red",
          "key_concern": "Regulatory export restrictions and concentration risk",
          "action_timeline": "30 days for initial diversification",
          "confidence_score": 0.92,
          "katherine_conviction": "HIGH",
          "hover_summary": "kg asset exposure: Regulatory export restrictions and concentration risk Opportunity: Emergency Geographic Diversification Protocol",
          "whisper_intelligence": "The families who moved first in 2024 are now acquiring distressed assets from those who waited - you",
          "ui_display": {
            "badge_text": "URGENT: Geographic Risk",
            "tooltip_title": "Elite Pulse Impact: kg",
            "risk_indicator": "HIGH",
            "action_needed": "30 days for initial diversification",
            "concern_summary": "Regulatory export restrictions and concentration risk"
          }
        },
        "tags": [
          {
            "tags": [
              "Multiple Units",
              "kg",
              "Recent",
              "Single Heir",
              "Medium Value"
            ],
            "generated_at": "2025-09-04T08:20:59.769000",
            "generation_id": "initial_tags_1756954259",
            "version": "v1.0",
            "source": "MoE_v4_generation"
          }
        ]
      }
    ];

    // Return raw MongoDB data format
    const apiResponse = NextResponse.json(mockMongoData, { status: 200 });
    return ApiAuth.addSecurityHeaders(apiResponse);

  } catch (error) {
    logger.error('MongoDB Crown Vault assets fetch error', { 
      error: error instanceof Error ? error.message : String(error),
      userId: user.id
    });
    return ApiAuth.addSecurityHeaders(NextResponse.json(
      { error: 'Failed to fetch MongoDB assets' },
      { status: 500 }
    ));
  }
}, { 
  requireAuth: true, 
  rateLimit: 'standard',
  auditLog: true 
});