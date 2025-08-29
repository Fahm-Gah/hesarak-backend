import React from 'react'
import type { Metadata, Viewport } from 'next'
import { getServerSideURL } from '@/utils/getURL'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'حصارک پنجشیر - سیستم تکت آنلاین بس افغانستان',
    template: '%s | حصارک پنجشیر',
  },
  description: 'سیستم آنلاین تکت بس. جستجو و خرید آسان تکت بس با انتخاب چوکی و پرداخت آنلاین.',
  keywords: ['بس', 'تکت', 'رزرو', 'سفر', 'حمل و نقل'],
  authors: [{ name: 'Fahm Gah Team' }],
  creator: 'Fahm Gah',
  publisher: 'fahmgah',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      { url: '/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/favicon/site.webmanifest',
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
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: getServerSideURL(),
    title: 'حصارک پنجشیر - تکت آنلاین بس',
    description: 'سیستم آنلاین خرید تکت بس - سفری راحت و امن با حصارک پنجشیر',
    siteName: 'حصارک پنجشیر',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'حصارک پنجشیر - تکت آنلاین بس',
    description: 'سیستم آنلاین خرید تکت بس - سفری راحت و امن با حصارک پنجشیر',
  },
  alternates: {
    canonical: '/',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f97316',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
