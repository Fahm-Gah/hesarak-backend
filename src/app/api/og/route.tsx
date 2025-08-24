import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') || 'حصارک‌بس - سیستم تکت اتوبوس'
  const subtitle = searchParams.get('subtitle') || 'تکت آسان و سریع اتوبوس در افغانستان'
  const type = searchParams.get('type') || 'website'

  try {
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
            backgroundColor: '#ffffff',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              opacity: 0.3,
            }}
          />

          {/* Logo Container */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '20px 40px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                fontSize: '80px',
                fontWeight: 'bold',
                color: '#ffffff',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              حصارک‌بس
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '20px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              maxWidth: '900px',
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '32px',
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.3,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            {subtitle}
          </div>

          {/* Bottom Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '12px 24px',
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)',
            }}
          >
            {type === 'article' && 'مقاله'}
            {type === 'website' && 'وب‌سایت'}
            {type === 'service' && 'خدمات'}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
