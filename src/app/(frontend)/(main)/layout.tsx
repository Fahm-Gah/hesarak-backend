import React from 'react'
import { NavBar } from '@/app/(frontend)/components/NavBar'
import { AuthProvider } from '@/providers/AuthContext'

import '../../globals.css'

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavBar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
