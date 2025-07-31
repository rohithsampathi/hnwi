import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Investment Opportunity'
    const type = searchParams.get('type') || 'Investment'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
            fontSize: 48,
            fontWeight: 600,
            color: 'white',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#22c55e',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '24px',
                fontSize: '32px',
                fontWeight: 'bold',
              }}
            >
              HC
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#22c55e',
              }}
            >
              HNWI Chronicles
            </div>
          </div>
          
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '20px',
              lineHeight: '1.1',
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
          
          <div
            style={{
              fontSize: '32px',
              color: '#22c55e',
              fontWeight: '500',
              textAlign: 'center',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              padding: '12px 24px',
              borderRadius: '12px',
              border: '2px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            {type} Opportunity
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}