'use client'

import React from 'react'

interface Route {
  name: string
  province: string
}

interface SimpleTicketFiltersProps {
  // Search state
  searchTerm: string
  setSearchTerm: (term: string) => void

  // Filter visibility
  showFilters: boolean
  setShowFilters: (show: boolean) => void

  // Time period filter
  timePeriod: 'all' | 'future' | 'before'
  setTimePeriod: (period: 'all' | 'future' | 'before') => void

  // Route filters
  routeFilters: { from: string; to: string }
  setRouteFilters: (filters: { from: string; to: string }) => void
  showRouteFromDropdown: boolean
  setShowRouteFromDropdown: (show: boolean) => void
  showRouteToDropdown: boolean
  setShowRouteToDropdown: (show: boolean) => void

  // Unique routes
  uniqueRoutes: { from: Route[]; to: Route[] }

  // Clear functionality
  hasActiveFilters: boolean
  clearAllFilters: () => void
}

export const SimpleTicketFilters = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  timePeriod,
  setTimePeriod,
  routeFilters,
  setRouteFilters,
  showRouteFromDropdown,
  setShowRouteFromDropdown,
  showRouteToDropdown,
  setShowRouteToDropdown,
  uniqueRoutes,
  hasActiveFilters,
  clearAllFilters,
}: SimpleTicketFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Time Period Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">دوره زمانی</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTimePeriod('all')}
            className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
              timePeriod === 'all'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            همه
          </button>
          <button
            onClick={() => setTimePeriod('future')}
            className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
              timePeriod === 'future'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            آینده
          </button>
          <button
            onClick={() => setTimePeriod('before')}
            className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
              timePeriod === 'before'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            گذشته
          </button>
        </div>
      </div>

      {/* Route Filters */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">مبدا</label>
          <div className="relative">
            <button
              onClick={() => setShowRouteFromDropdown(!showRouteFromDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {routeFilters.from || 'انتخاب مبدا'}
            </button>

            {showRouteFromDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                <button
                  onClick={() => {
                    setRouteFilters({ ...routeFilters, from: '' })
                    setShowRouteFromDropdown(false)
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50"
                >
                  همه
                </button>
                {uniqueRoutes.from.map((route) => (
                  <button
                    key={route.name}
                    onClick={() => {
                      setRouteFilters({ ...routeFilters, from: route.name })
                      setShowRouteFromDropdown(false)
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50"
                  >
                    {route.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">مقصد</label>
          <div className="relative">
            <button
              onClick={() => setShowRouteToDropdown(!showRouteToDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {routeFilters.to || 'انتخاب مقصد'}
            </button>

            {showRouteToDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                <button
                  onClick={() => {
                    setRouteFilters({ ...routeFilters, to: '' })
                    setShowRouteToDropdown(false)
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50"
                >
                  همه
                </button>
                {uniqueRoutes.to.map((route) => (
                  <button
                    key={route.name}
                    onClick={() => {
                      setRouteFilters({ ...routeFilters, to: route.name })
                      setShowRouteToDropdown(false)
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50"
                  >
                    {route.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          پاک کردن فیلترها
        </button>
      )}
    </div>
  )
}
