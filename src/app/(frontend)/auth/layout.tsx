import React from 'react'
import { AuthProvider } from '@/providers/AuthContext'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تأیید هویت - حصارک‌بس',
  description: 'صفحات تأیید هویت و ورود به سیستم حصارک‌بس',
}

export default async function AuthLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <AuthProvider>
      <main>{children}</main>
    </AuthProvider>
  )
}
