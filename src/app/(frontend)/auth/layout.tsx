import React from 'react'
import { AuthProvider } from '@/providers/AuthContext'

import '../../globals.css'

import { Vazirmatn } from 'next/font/google'

const vazirmatn = Vazirmatn({
  subsets: ['latin'],
})

export const metadata = {
  description: 'Authentication pages',
  title: 'Authentication - Hesarakbus',
}

export default async function AuthLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="fa" className={vazirmatn.className}>
      <body>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
