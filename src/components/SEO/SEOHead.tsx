import React from 'react'
import { Metadata } from 'next'
import { getServerSideURL } from '@/utils/getURL'

interface SEOProps {
  title: string
  description: string
  keywords?: string
  image?: string
  type?: 'website' | 'article' | 'service'
  url?: string
  noIndex?: boolean
  locale?: string
  publishedTime?: string
  modifiedTime?: string
}

export function generateSEOMetadata({
  title,
  description,
  keywords,
  image,
  type = 'website',
  url,
  noIndex = false,
  locale = 'fa_AF',
  publishedTime,
  modifiedTime,
}: SEOProps): Metadata {
  const baseUrl = getServerSideURL()
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl

  // Generate dynamic OG image if no custom image provided
  const ogImage =
    image ||
    `${baseUrl}/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(description)}&type=${type}`

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'حصارک‌بس' }],
    creator: 'حصارک‌بس',
    publisher: 'حصارک‌بس',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: fullUrl,
      languages: {
        'fa-AF': fullUrl,
        'x-default': fullUrl,
      },
    },
    openGraph: {
      type: type === 'service' ? 'website' : type,
      locale,
      url: fullUrl,
      title,
      description,
      siteName: 'حصارک‌بس',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@hesarak_bus', // Add your Twitter handle if available
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION, // Add to your .env
      // bing: process.env.BING_SITE_VERIFICATION,
    },
    other: {
      'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
      'msapplication-TileColor': '#ea580c',
      'msapplication-config': '/browserconfig.xml',
      'theme-color': '#ea580c',
    },
  }
}

// Utility function to create structured data for pages
export function createPageStructuredData({
  name,
  description,
  url,
  breadcrumbs,
}: {
  name: string
  description: string
  url: string
  breadcrumbs?: Array<{ name: string; url: string }>
}) {
  const baseUrl = getServerSideURL()

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}${url}`,
        url: `${baseUrl}${url}`,
        name,
        description,
        inLanguage: 'fa',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${baseUrl}#website`,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}#website`,
        url: baseUrl,
        name: 'حصارک‌بس',
        description: 'سیستم آنلاین رزرو بلیط اتوبوس پنجشیر',
        inLanguage: 'fa',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      ...(breadcrumbs && breadcrumbs.length > 0
        ? [
            {
              '@type': 'BreadcrumbList',
              itemListElement: breadcrumbs.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: `${baseUrl}${item.url}`,
              })),
            },
          ]
        : []),
    ],
  }

  return JSON.stringify(structuredData)
}
