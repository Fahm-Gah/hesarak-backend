import React from 'react'
import { AuthProvider } from '@/providers/AuthContext'

import '../../globals.css'

import { Vazirmatn } from 'next/font/google'

const vazirmatn = Vazirmatn({
  subsets: ['latin'],
})

export const metadata = {
  description: 'صفحات تأیید هویت',
  title: 'تأیید هویت - حصارک‌بس',
}

export default async function AuthLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="fa" className={vazirmatn.className} dir="rtl">
      <body>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
