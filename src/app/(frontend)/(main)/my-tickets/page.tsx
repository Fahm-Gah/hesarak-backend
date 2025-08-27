import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { TicketsPageClient } from './page.client'

export const metadata: Metadata = {
  title: 'My Tickets | Hesarakbus',
  description: 'View your booked bus tickets and travel history',
}

function TicketsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">در حال بارگذاری...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<TicketsLoading />}>
      <TicketsPageClient />
    </Suspense>
  )
}
