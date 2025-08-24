import React from 'react'
import { AuthProvider } from '@/providers/AuthContext'

import '../../globals.css'

import { Vazirmatn } from 'next/font/google'

const vazirmatn = Vazirmatn({
  subsets: ['latin'],
})

export const metadata = {
  title: {
    default: 'تأیید هویت - حصارک‌بس',
    template: '%s | حصارک‌بس',
  },
  description: 'صفحات تأیید هویت و ثبت‌نام سیستم حصارک‌بس',
  robots: {
    index: false,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
}

export default async function AuthLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="fa" className={vazirmatn.className} dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ea580c" />
      </head>
      <body>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
