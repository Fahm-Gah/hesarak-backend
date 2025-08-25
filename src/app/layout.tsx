import React from 'react'
import { Vazirmatn } from 'next/font/google'
import type { Metadata, Viewport } from 'next'

import './globals.css'

const vazirmatn = Vazirmatn({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'حصارک پنجشیر - سیستم تکت آنلاین اتوبوس افغانستان',
    template: '%s | حصارک پنجشیر',
  },
  description:
    'سیستم آنلاین تکت اتوبوس. جستجو و خرید آسان تکت اتوبوس با انتخاب چوکی و پرداخت آنلاین.',
  keywords: ['اتوبوس', 'تکت', 'رزرو', 'سفر', 'حمل و نقل'],
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
    url: 'https://hesarakbus.com',
    title: 'حصارک پنجشیر - تکت آنلاین اتوبوس',
    description: 'سیستم آنلاین خرید تکت اتوبوس - سفری راحت و امن با حصارک پنجشیر',
    siteName: 'حصارک پنجشیر',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'حصارک پنجشیر - تکت آنلاین اتوبوس',
    description: 'سیستم آنلاین خرید تکت اتوبوس - سفری راحت و امن با حصارک پنجشیر',
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
