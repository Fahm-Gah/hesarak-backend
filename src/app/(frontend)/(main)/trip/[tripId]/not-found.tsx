import React from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/app/(frontend)/components/Breadcrumbs'

export default function TripNotFound() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Search Results', href: '/search' },
    { label: 'Trip Not Found' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Not Found Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">Trip Not Found</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The trip you're looking for doesn't exist or is no longer available. This could be
            because:
          </p>

          <div className="text-left max-w-md mx-auto mb-8">
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                The trip has been cancelled or removed
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                The URL is incorrect or outdated
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                The trip date has passed
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                There was a temporary server issue
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Search for Trips
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
