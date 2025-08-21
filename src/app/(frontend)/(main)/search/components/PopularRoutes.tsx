'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, TrendingUp, Clock } from 'lucide-react'
import moment from 'moment-jalaali'

interface PopularRoute {
  from: string
  to: string
  tripCount: number
  avgPrice: number
  duration: string
}

interface PopularRoutesProps {
  onRouteSelect?: (from: string, to: string) => void
}

export const PopularRoutes: React.FC<PopularRoutesProps> = ({ onRouteSelect }) => {
  const router = useRouter()
  const [routes, setRoutes] = useState<PopularRoute[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock popular routes data - in a real app, this would come from analytics
    const mockRoutes: PopularRoute[] = [
      { from: 'Kabul', to: 'Mazar-i-Sharif', tripCount: 15, avgPrice: 1200, duration: '6h 30m' },
      { from: 'Kabul', to: 'Herat', tripCount: 12, avgPrice: 1800, duration: '8h 15m' },
      { from: 'Kabul', to: 'Kandahar', tripCount: 10, avgPrice: 1500, duration: '7h 45m' },
      { from: 'Mazar-i-Sharif', to: 'Herat', tripCount: 8, avgPrice: 1400, duration: '5h 20m' },
      { from: 'Kabul', to: 'Jalalabad', tripCount: 18, avgPrice: 800, duration: '3h 45m' },
      { from: 'Herat', to: 'Kandahar', tripCount: 6, avgPrice: 1600, duration: '6h 50m' },
    ]

    // Simulate loading delay
    setTimeout(() => {
      setRoutes(mockRoutes)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleRouteClick = (route: PopularRoute) => {
    const today = moment()
    const dateStr = today.format('jYYYY-jMM-jDD')

    if (onRouteSelect) {
      onRouteSelect(route.from, route.to)
    } else {
      // Navigate directly to search results
      const params = new URLSearchParams()
      params.set('from', route.from)
      params.set('to', route.to)
      params.set('date', dateStr)
      router.push(`/search?${params.toString()}`)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Popular Routes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-20"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">Popular Routes</h3>
        <span className="text-sm text-gray-500">Today</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {routes.map((route, index) => (
          <button
            key={`${route.from}-${route.to}`}
            onClick={() => handleRouteClick(route)}
            className="text-left p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">
                    {route.from} → {route.to}
                  </div>
                </div>
              </div>
              <div className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded-full">
                {route.tripCount} trips
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{route.duration}</span>
              </div>
              <div className="font-medium text-gray-900">AFN {route.avgPrice.toLocaleString()}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Click on any route to search for available trips today
        </p>
      </div>
    </div>
  )
}
