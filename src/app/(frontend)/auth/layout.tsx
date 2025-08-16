import React from 'react'

import '../../globals.css'

export const metadata = {
  description: 'Authentication pages',
  title: 'Authentication - Hesaarak',
}

export default async function AuthLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}