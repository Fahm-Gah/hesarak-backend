import React from 'react'
import { Vazirmatn } from 'next/font/google'
import { ImageCacheInitializer } from '@/components/ImageCacheInitializer'

const vazirmatn = Vazirmatn({
  subsets: ['latin'],
})

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" className={vazirmatn.className}>
      <head>
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
      </head>
      <body suppressHydrationWarning={true}>
        <ImageCacheInitializer />
        {children}
      </body>
    </html>
  )
}
