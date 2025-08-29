import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { CheckoutPageClient } from './page.client'

export const metadata: Metadata = {
  title: 'Checkout | Hesarakbus',
  description: 'Complete your bus ticket booking and secure your seat',
}

function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb skeleton */}
        <div className="mb-6">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Checkout Form skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip summary skeleton */}
            <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>

            {/* Payment method skeleton */}
            <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-100 rounded-lg"></div>
                <div className="h-12 bg-gray-100 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse sticky top-4">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                <div className="border-t pt-3 mt-4">
                  <div className="h-6 bg-gray-200 rounded w-20 mb-3"></div>
                  <div className="h-12 bg-gray-100 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center min-h-[100px] mt-8">
          <div className="text-center">
            <div className="relative mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-100 border-t-orange-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-orange-50 opacity-20 animate-ping"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              در حال بارگذاری اطلاعات پرداخت
            </h3>
            <p className="text-gray-600 text-sm">لطفاً صبر کنید...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutPageClient />
    </Suspense>
  )
}
