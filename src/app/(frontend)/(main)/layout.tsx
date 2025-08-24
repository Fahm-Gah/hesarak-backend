import React from 'react'
import { NavBar } from '@/app/(frontend)/components/NavBar'
import { AuthProvider } from '@/providers/AuthContext'
import { Toast } from '@/app/(frontend)/components/Toast'
import { Footer } from '@/app/(frontend)/components/Footer'
import { OrganizationStructuredData, WebsiteStructuredData } from '@/components/SEO/StructuredData'
import { PersianSEOOptimizations } from '@/components/SEO/PersianSEO'
import {
  PerformanceOptimizations,
  GoogleAnalytics,
  MicrosoftClarity,
} from '@/components/SEO/PerformanceOptimizations'
import { getServerSideURL } from '@/utils/getURL'

import '../../globals.css'

import { Vazirmatn } from 'next/font/google'

const vazirmatn = Vazirmatn({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-vazirmatn',
})

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic'

export const metadata = {
  title: {
    default: 'حصارک‌بس - سیستم تکت آنلاین اتوبوس افغانستان',
    template: '%s | حصارک‌بس',
  },
  description:
    'سیستم آنلاین تکت اتوبوس. جستجو و خرید آسان بلیط اتوبوس با انتخاب صندلی و پرداخت آنلاین.',
  keywords: 'اتوبوس, بلیط, تکت, پنجشیر, افغانستان, سفر, حمل و نقل',
  authors: [{ name: 'حصارک‌بس' }],
  creator: 'حصارک‌بس',
  publisher: 'حصارک‌بس',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://hesarakbus.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/apple-touch-icon.png', color: '#ea580c' }],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'fa_AF',
    url: '/',
    title: 'حصارک‌بس - سیستم تکت آنلاین اتوبوس افغانستان',
    description:
      'سیستم آنلاین تکت اتوبوس. جستجو و خرید آسان بلیط اتوبوس با انتخاب صندلی و پرداخت آنلاین.',
    siteName: 'حصارک‌بس',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'حصارک‌بس - سیستم تکت آنلاین اتوبوس افغانستان',
    description:
      'سیستم آنلاین تکت اتوبوس. جستجو و خرید آسان بلیط اتوبوس با انتخاب صندلی و پرداخت آنلاین.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const baseUrl = getServerSideURL()

  return (
    <html lang="fa" className={`${vazirmatn.className} ${vazirmatn.variable}`} dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ea580c" />
        <meta name="msapplication-TileColor" content="#ea580c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <PersianSEOOptimizations />
        <PerformanceOptimizations />
      </head>
      <body>
        {/* Structured Data */}
        <OrganizationStructuredData
          name="حصارک‌بس"
          url={baseUrl}
          logo={`${baseUrl}/images/logo.png`}
          description="سیستم آنلاین تکت اتوبوس افغانستان. تکت آسان و سریع با انتخاب چوکی و پرداخت امن."
          telephone="+93 79 900 4567"
          email="info@hesarakbus.com"
          address={{
            streetAddress: 'پنجشیر',
            addressLocality: 'پنجشیر',
            addressRegion: 'پنجشیر',
            addressCountry: 'AF',
          }}
        />
        <WebsiteStructuredData
          name="حصارک‌بس"
          url={baseUrl}
          description="سیستم آنلاین تکت اتوبوس"
          potentialAction={{
            target: `${baseUrl}/search?q={search_term}`,
            queryInput: 'search_term',
          }}
        />

        <AuthProvider>
          <NavBar />
          <main>{children}</main>
          <Footer />
          <Toast />
        </AuthProvider>

        {/* Analytics and Performance Tracking */}
        <GoogleAnalytics />
        <MicrosoftClarity />
      </body>
    </html>
  )
}
