import React from 'react'
import { AuthProvider } from '@/providers/AuthContext'

import '../../globals.css'

export const metadata = {
  description: 'Authentication pages',
  title: 'Authentication - Hesarakbus',
}

export default async function AuthLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
