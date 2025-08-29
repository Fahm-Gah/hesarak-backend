import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { TripDetailsPageClient } from './page.client'

export const metadata: Metadata = {
  title: 'Trip Details | Hesarakbus',
  description: 'View trip details and book your bus tickets',
}

function TripDetailsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb skeleton */}
        <div className="mb-6">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Trip Info skeleton */}
          <div className="xl:col-span-2 space-y-6">
            {/* Trip header skeleton */}
            <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6">
                <div className="space-y-3">
                  <div className="h-7 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-100 rounded w-32"></div>
                </div>
                <div className="h-8 bg-gray-100 rounded-full w-24 mt-4 lg:mt-0"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-40"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>

            {/* Bus info skeleton */}
            <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="h-32 bg-gray-100 rounded-lg"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                  <div className="h-5 bg-gray-200 rounded w-36"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-20"></div>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-6 bg-gray-100 rounded-full w-16"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column skeleton */}
          <div className="xl:col-span-1 space-y-6">
            {/* Seat layout skeleton */}
            <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-28 mb-4"></div>
              <div className="h-64 bg-gray-100 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-32"></div>
                <div className="h-4 bg-gray-100 rounded w-24"></div>
              </div>
            </div>

            {/* Booking summary skeleton */}
            <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-28 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="border-t pt-3 mt-4">
                  <div className="h-6 bg-gray-200 rounded w-20 mb-3"></div>
                  <div className="h-12 bg-gray-100 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center min-h-[200px] mt-8">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-100 border-t-orange-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-orange-50 opacity-20 animate-ping"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">در حال بارگذاری جزئیات سفر</h3>
            <p className="text-gray-600 text-sm">لطفاً صبر کنید...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TripDetailsPage() {
  return (
    <Suspense fallback={<TripDetailsLoading />}>
      <TripDetailsPageClient />
    </Suspense>
  )
}
