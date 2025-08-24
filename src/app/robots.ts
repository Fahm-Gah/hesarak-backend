import { MetadataRoute } from 'next'
import { getServerSideURL } from '@/utils/getURL'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getServerSideURL()

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/search',
          '/about',
          '/contact',
          '/help',
          '/privacy',
          '/terms',
          '/api/og', // Allow OG image generation
        ],
        disallow: [
          '/auth/',
          '/profile/',
          '/my-tickets/',
          '/checkout/',
          '/booking-success/',
          '/api/',
          '/_next/',
          '/admin/',
          '/payload/',
          '/*.json$',
        ],
      },
      // Specific rules for search engines
      {
        userAgent: 'Googlebot',
        allow: ['/', '/search', '/about', '/contact', '/help', '/privacy', '/terms', '/api/og'],
        disallow: [
          '/auth/',
          '/profile/',
          '/my-tickets/',
          '/checkout/',
          '/booking-success/',
          '/api/',
          '/_next/',
          '/admin/',
          '/payload/',
        ],
      },
      // Block admin and sensitive areas completely
      {
        userAgent: '*',
        disallow: ['/admin/', '/payload/', '/_next/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
