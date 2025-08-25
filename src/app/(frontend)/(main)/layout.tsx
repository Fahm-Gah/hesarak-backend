import React from 'react'
import { NavBar } from '@/app/(frontend)/components/NavBar'
import { AuthProvider } from '@/providers/AuthContext'
import { Toast } from '@/app/(frontend)/components/Toast'
import { Footer } from '@/app/(frontend)/components/Footer'
import type { Metadata } from 'next'

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'حصارک پنجشیر - سیستم تکت آنلاین اتوبوس افغانستان',
  description:
    'سیستم آنلاین تکت اتوبوس. جستجو و خرید آسان تکت اتوبوس با انتخاب چوکی و پرداخت آنلاین.',
  keywords: 'اتوبوس,, تکت, پنجشیر, افغانستان, سفر, حمل و نقل',
}

export default async function MainLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <AuthProvider>
      <NavBar />
      <main>{children}</main>
      <Footer />
      <Toast />
    </AuthProvider>
  )
}
