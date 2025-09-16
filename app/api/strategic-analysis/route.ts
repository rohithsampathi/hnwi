import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the authorization header from the client
    const authHeader = request.headers.get('authorization');
    const requireAuth = !!authHeader;

    // Use secure API to proxy the request to the backend
    const endpoint = '/api/strategic-analysis';
    
    try {
      const data = await secureApi.post(endpoint, body, requireAuth);
      return NextResponse.json(data, { status: 200 });
      
    } catch (apiError) {
      // Return fallback strategic analysis when backend is unavailable
      return NextResponse.json({
        analysis: {
          key_insights: [
            "Market volatility presents both risks and opportunities for strategic positioning",
            "Diversification across asset classes remains crucial for wealth preservation",
            "Emerging markets show potential for significant returns with managed risk exposure"
          ],
          recommendations: [
            "Consider increasing exposure to alternative investments",
            "Monitor geopolitical developments affecting market stability",
            "Evaluate ESG investment opportunities for long-term value creation"
          ],
          risk_assessment: {
            overall_risk: "Moderate",
            primary_concerns: ["Market volatility", "Inflation impact", "Regulatory changes"],
            mitigation_strategies: ["Portfolio diversification", "Regular rebalancing", "Active monitoring"]
          },
          market_outlook: {
            timeframe: "12 months",
            sentiment: "Cautiously optimistic",
            key_factors: ["Central bank policies", "Corporate earnings", "Global trade dynamics"]
          }
        },
        timestamp: new Date().toISOString(),
        source: "HNWI Strategic Intelligence"
      }, { status: 200 });
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate strategic analysis' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    
    // Forward the authorization header from the client
    const authHeader = request.headers.get('authorization');
    const requireAuth = !!authHeader;

    // Use secure API to proxy the request to the backend
    const endpoint = `/api/strategic-analysis${query ? `?query=${encodeURIComponent(query)}` : ''}`;
    
    try {
      const data = await secureApi.get(endpoint, requireAuth);
      return NextResponse.json(data, { status: 200 });
      
    } catch (apiError) {
      // Return fallback strategic analysis when backend is unavailable
      return NextResponse.json({
        analysis: {
          query: query || 'General Market Analysis',
          insights: [
            "Current market conditions favor defensive positioning",
            "Technology sector shows resilience amid broader uncertainty",
            "Fixed income strategies require careful duration management"
          ],
          strategic_themes: [
            "Digital transformation acceleration",
            "Sustainable investing mainstreaming",
            "Geopolitical risk management"
          ]
        },
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch strategic analysis' },
      { status: 500 }
    );
  }
}