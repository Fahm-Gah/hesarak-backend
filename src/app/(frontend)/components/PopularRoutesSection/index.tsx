import React from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, MapPin } from 'lucide-react'
import { getServerSideURL } from '@/utils/getURL'

interface PopularRoute {
  from: string
  to: string
  duration: string
  price: string
  frequency: string
  tripsPerWeek: number
  avgPrice: number
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

// Server-side data fetching
const getPopularRoutes = async (): Promise<PopularRoute[]> => {
  try {
    const baseURL = getServerSideURL()
    const response = await fetch(`${baseURL}/api/popular-routes`, {
      cache: 'no-store', // Always get fresh data
    })

    if (!response.ok) {
      console.error('Failed to fetch popular routes:', response.status, response.statusText)
      return []
    }

    const data = await response.json()

    if (data.success && data.data) {
      // Transform the data to match our component interface
      return data.data.map((route: any) => ({
        from: route.from,
        to: route.to,
        duration: formatDurationToPersian(route.duration),
        price: `${toPersianNumber(route.avgPrice.toLocaleString())} افغانی`,
        frequency: `${toPersianNumber(route.tripsPerWeek)} سفر در هفته`,
        tripsPerWeek: route.tripsPerWeek,
        avgPrice: route.avgPrice,
      }))
    } else {
      console.error('API returned unsuccessful response:', data)
      return []
    }
  } catch (err) {
    console.error('Error fetching popular routes:', err)
    return []
  }
}

export const PopularRoutesSection = async () => {
  const popularRoutes = await getPopularRoutes()

  // If no routes available, don't render the section
  if (popularRoutes.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            مسیرهای <span className="text-orange-600">محبوب</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            مسیرهای پر تردد ما را با حرکت مکرر و قیمت‌های رقابتی کشف کنید
          </p>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularRoutes.map((route, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100"
            >
              {/* Route Image */}
              <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 ml-2" />
                      <span className="font-semibold">{route.from}</span>
                    </div>
                    <ArrowRight className="w-6 h-6 rotate-180" />
                    <div className="flex items-center">
                      <span className="font-semibold">{route.to}</span>
                      <MapPin className="w-5 h-5 mr-2" />
                    </div>
                  </div>
                  <div className="text-white">
                    <div className="text-3xl font-bold">{route.price}</div>
                    <div className="text-sm opacity-90">شروع از</div>
                  </div>
                </div>
              </div>

              {/* Route Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 ml-2" />
                    <span className="text-sm">{route.duration}</span>
                  </div>
                  <div className="text-sm text-gray-600">{route.frequency}</div>
                </div>

                <Link
                  href={`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 flex items-center justify-center group-hover:scale-105"
                >
                  همین حالا بوک کنید
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
