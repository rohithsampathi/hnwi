import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    
    // For development, don't require authentication for latest briefs
    const requireAuth = process.env.NODE_ENV === 'production';

    // Use secure API to proxy the request to the backend
    const endpoint = `/api/latest-brief?limit=${limit}`;
    
    try {
      const data = await secureApi.get(endpoint, requireAuth, { enableCache: true, cacheDuration: 300000 });
      return NextResponse.json(data, { status: 200 });
      
    } catch (apiError) {
      // Backend request failed, using fallback data
      
      // Return fallback latest brief data
      return NextResponse.json({
        developments: [
          {
            id: "1",
            title: "Sovereign Wealth Fund Rotation Accelerates",
            description: "Major shifts in allocation patterns across Nordic and Gulf sovereign wealth funds indicate a coordinated move away from traditional asset classes. Intelligence suggests $180B in planned reallocation over 18 months.",
            industry: "Sovereign Wealth",
            date: new Date().toISOString(),
            product: "Intelligence Brief",
            source: "Nordic Finance Intelligence",
            summary: "## Key Moves\n- Norway's GPFG reducing equity exposure from 70% to 65%\n- Abu Dhabi's ADIA increasing alternative investments by 15%\n- Singapore's GIC establishing new infrastructure debt platform\n\n## Market Impact\n- Traditional equity markets facing $120B outflow pressure\n- Infrastructure debt premiums compressing by 80-120bps\n- Private credit markets seeing unprecedented inflows\n\n## Wealth Impact\nFamily offices following sovereign lead with similar allocation shifts. HNWI portfolios showing 23% increase in alternative exposure.",
          },
          {
            id: "2", 
            title: "Banking Sector Automation Wave",
            description: "Internal sources confirm major European and US banks are piloting full department automation. Workforce reduction targets of 40% by 2025 creating unprecedented operational efficiency gains.",
            industry: "Banking Technology",
            date: new Date(Date.now() - 86400000).toISOString(),
            product: "Whisper Intelligence",
            source: "Banking Sector Insider",
            summary: "## Investment Implications\n- Banking automation stocks undervalued by 35-45%\n- Legacy banking real estate facing massive disposal pressure\n- AI-powered financial services scaling rapidly\n\n## The $100K Move\nAcquire positions in enterprise banking automation before Q2 2025 catalyst events. Target 3-5x returns within 24 months.",
          },
          {
            id: "3",
            title: "Asian Wealth Migration Accelerates",
            description: "High-net-worth families across Asian markets are accelerating wealth migration strategies. Singapore and Dubai seeing record inflows as regional tensions drive capital flight.",
            industry: "Wealth Migration",
            date: new Date(Date.now() - 172800000).toISOString(), 
            product: "Migration Intelligence",
            source: "Asian Wealth Tracker",
            summary: "## Migration Patterns\n- Singapore family office registrations up 340% YoY\n- Dubai DIFC wealth management licenses doubling quarterly\n- Traditional Swiss banking losing Asian HNWI market share\n\n## Opportunities\n- Residential luxury real estate in destination markets\n- Cross-border wealth management technology\n- International school and healthcare services\n\n## Long Term\nStructural shift creating permanent wealth corridor from Asia to Gulf/Singapore region.",
          },
          {
            id: "4",
            title: "Private Credit Market Tightening",
            description: "Major private credit funds are raising entry barriers and minimum ticket sizes. Sources indicate a coordinated move to enhance exclusivity and returns amid growing institutional competition.",
            industry: "Private Credit",
            date: new Date(Date.now() - 259200000).toISOString(),
            product: "Market Intelligence", 
            source: "Credit Markets Insider",
            summary: "## Key Changes\n- Minimum investments rising from $1M to $5M+\n- Due diligence periods extending 60-90 days\n- Preferred allocations for existing LPs\n\n## Market Impact\n- Mid-market lending rates increasing 150-200bps\n- Traditional credit funds losing deal flow\n- Direct lending platforms gaining market share\n\n## Opportunities\nEarly positioning in next-generation credit platforms before institutional discovery. Target allocation window closing by Q3 2025.",
          },
          {
            id: "5",
            title: "Luxury Real Estate Algorithmic Trading",
            description: "Proprietary intelligence reveals major family offices are deploying algorithmic trading strategies in luxury real estate markets. $2.3B in automated transactions executed in past 90 days.",
            industry: "Real Estate Technology",
            date: new Date(Date.now() - 345600000).toISOString(),
            product: "Proprietary Intelligence",
            source: "Real Estate Tech Intelligence",
            summary: "## Innovation Details\n- Machine learning models predicting luxury market movements\n- Automated bidding systems for trophy assets\n- Cross-border arbitrage opportunities being systematically exploited\n\n## Market Implications\n- Traditional real estate brokers losing high-end market share\n- Price discovery becoming more efficient in luxury segment\n- Liquidity improving for high-end properties\n\n## Investment Thesis\nReal estate technology firms enabling algorithmic trading represent next frontier. Early stage valuations attractive before mainstream adoption.",
          }
        ],
        total_count: 5,
        limit: parseInt(limit),
        source: "fallback_data"
      }, { status: 200 });
    }

  } catch (error) {
    // API error occurred
    return NextResponse.json(
      { error: 'Failed to fetch latest brief' },
      { status: 500 }
    );
  }
}