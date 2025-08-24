import { MetadataRoute } from 'next'
import { getServerSideURL } from '@/utils/getURL'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getServerSideURL()

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Auth pages (with lower priority and noindex in robots)
  const authPages = [
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ]

  // TODO: Add dynamic pages like trip details
  // You can fetch these from your database
  // const dynamicPages = await fetchTripPages()

  return [...staticPages, ...authPages]
}

// Define the type for popular routes
interface PopularRoute {
  from: string
  to: string
  slug: string
}

// Alternative: Generate sitemap for specific trip routes
export async function generateTripSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getServerSideURL()

  // TODO: Fetch popular routes from database
  // This is an example of how you might structure dynamic sitemap generation
  const popularRoutes: PopularRoute[] = [
    // You would fetch these from your database
    // { from: 'کابل', to: 'پنجشیر', slug: 'kabul-panjshir' },
    // { from: 'پنجشیر', to: 'کابل', slug: 'panjshir-kabul' },
  ]

  return popularRoutes.map((route) => ({
    url: `${baseUrl}/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))
}
