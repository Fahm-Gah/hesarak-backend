'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import moment from 'moment-jalaali'

interface PopularRoute {
  from: string
  to: string
  tripsPerWeek: number
  startingPrice: number
  duration: string
}

interface PopularRoutesProps {
  onRouteSelect?: (from: string, to: string) => void
}

// Client-side data fetching
function fetchPopularRoutes(): Promise<PopularRoute[]> {
  return fetch('/api/popular-routes')
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        console.error('Failed to fetch popular routes:', response.status)
        return { data: [] }
      }
    })
    .then((data) => data.data || [])
    .catch((error) => {
      console.error('Error fetching popular routes:', error)
      return []
    })
}

// Helper function to convert numbers to Persian
const toPersianNumber = (num: number | string): string => {
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (digit) => persian[parseInt(digit)])
}

// Helper function to format duration to Persian
const formatDurationToPersian = (duration: string): string => {
  return duration
    .replace(/h/, ' ساعت')
    .replace(/m/, ' دقیقه')
    .replace(/[0-9]/g, (digit) => toPersianNumber(digit))
}

export const PopularRoutes: React.FC<PopularRoutesProps> = ({ onRouteSelect }) => {
  const [routes, setRoutes] = useState<PopularRoute[]>([])
  const [loading, setLoading] = useState(true)
  const today = moment()
  const dateStr = today.format('jYYYY-jMM-jDD')

  useEffect(() => {
    fetchPopularRoutes()
      .then(setRoutes)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6" dir="rtl">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">مسیرهای محبوب</h3>
          <span className="text-sm text-gray-500">امروز</span>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-500">در حال بارگذاری...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6" dir="rtl">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">مسیرهای محبوب</h3>
        <span className="text-sm text-gray-500">امروز</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {routes.map((route, index) => {
          const searchParams = new URLSearchParams()
          searchParams.set('from', route.from)
          searchParams.set('to', route.to)
          searchParams.set('date', dateStr)

          return (
            <Link
              key={`${route.from}-${route.to}`}
              href={`/search?${searchParams.toString()}`}
              className="block text-right p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                      <span>{route.from}</span>
                      <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0 rotate-180" />
                      <span>{route.to}</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded-full">
                  {toPersianNumber(route.tripsPerWeek)} سفر/هفته
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDurationToPersian(route.duration)}</span>
                </div>
                <div className="font-medium text-gray-900">
                  {toPersianNumber(route.startingPrice.toLocaleString())} افغانی
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          بر روی هر مسیر کلیک کنید تا سفرهای موجود امروز را جستجو کنید
        </p>
      </div>
    </div>
  )
}
